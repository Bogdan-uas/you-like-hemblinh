import { animate } from "framer-motion";
import { levelInfo } from "./progressConfig.js";

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const bridge = { levelUp: null, token: null };

export const playLevelUp = (level) => (bridge.levelUp ? bridge.levelUp(level) : Promise.resolve());

export const flyToken = (token) => (bridge.token ? bridge.token(token) : Promise.resolve());

export const centerOf = (el) => {
    const rect = el?.getBoundingClientRect?.();
    return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
};

export const barTargetOf = (barEl, xp) => {
    const rect = barEl?.getBoundingClientRect?.();
    if (!rect) return null;
    const p = Math.max(0.04, Math.min(1, levelInfo(xp).progress));
    return { x: rect.left + rect.width * p, y: rect.top + rect.height / 2 };
};

export const tweenXp = async (xpMV, from, to, { speed = 1, onLevelUp = playLevelUp, levelUps = "each" } = {}) => {
    let cursor = from;
    xpMV.set(from);
    let crossed = null;
    while (cursor < to - 0.0001) {
        const info = levelInfo(cursor);
        const boundary = cursor - info.into + info.need;
        const end = Math.min(to, boundary);
        const fraction = (end - cursor) / info.need;
        const duration = Math.min(1.3, 0.3 + fraction * 1.1) / speed;
        await new Promise((resolve) => {
            animate(xpMV, end, { duration, ease: [0.25, 0.8, 0.3, 1], onComplete: resolve });
        });
        cursor = end;
        if (end >= boundary) {
            crossed = info.level + 1;
            if (levelUps === "each") await onLevelUp(crossed);
        }
    }
    if (levelUps === "final" && crossed) await onLevelUp(crossed);
    xpMV.set(to);
};

const WISPS = [
    { lag: 0, scale: 1, alpha: 1 },
    { lag: 38, scale: 0.72, alpha: 0.7 },
    { lag: 76, scale: 0.52, alpha: 0.48 },
    { lag: 114, scale: 0.36, alpha: 0.3 },
];

const STEPS = 16;

const soulCountFor = (text) => {
    const xp = Number(String(text ?? "").replace(/[^0-9]/g, "")) || 10;
    return Math.max(1, Math.min(7, Math.round(1 + Math.log2(Math.max(1, xp / 8)))));
};

const node = (container, className) => {
    const el = document.createElement("span");
    el.className = className;
    container.appendChild(el);
    return el;
};

const curve = (from, to, index) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const jitter = Math.sin((index + 1) * 12.9898) * 0.5 + 0.5;
    const lift = Math.min(240, dist * 0.42) * (0.65 + jitter * 0.7);
    const side = (index % 2 ? 1 : -1) * dist * 0.16 * jitter;
    const cx = from.x + dx * 0.5 + (-dy / dist) * side;
    const cy = from.y + dy * 0.5 + (dx / dist) * side - lift;
    return Array.from({ length: STEPS + 1 }, (_, i) => {
        const t = i / STEPS;
        const u = 1 - t;
        return { x: u * u * from.x + 2 * u * t * cx + t * t * to.x, y: u * u * from.y + 2 * u * t * cy + t * t * to.y };
    });
};

const impact = (container, classes, to, text) => {
    const ring = node(container, classes.impact);
    ring.animate(
        [
            { transform: `translate(${to.x}px, ${to.y}px) scale(0.3)`, opacity: 0.95 },
            { transform: `translate(${to.x}px, ${to.y}px) scale(1.9)`, opacity: 0 },
        ],
        { duration: 460, easing: "cubic-bezier(.2,.8,.3,1)", fill: "both" },
    ).onfinish = () => ring.remove();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + 0.4;
        const spark = node(container, classes.spark);
        spark.animate(
            [
                { transform: `translate(${to.x}px, ${to.y}px) scale(1)`, opacity: 1 },
                { transform: `translate(${to.x + Math.cos(angle) * 26}px, ${to.y + Math.sin(angle) * 26}px) scale(0.2)`, opacity: 0 },
            ],
            { duration: 420, easing: "cubic-bezier(.2,.8,.3,1)", fill: "both" },
        ).onfinish = () => spark.remove();
    }
    if (!text) return;
    const label = node(container, classes.label);
    label.textContent = text;
    label.animate(
        [
            { transform: `translate(${to.x}px, ${to.y - 14}px) scale(0.7)`, opacity: 0 },
            { transform: `translate(${to.x}px, ${to.y - 30}px) scale(1.08)`, opacity: 1, offset: 0.25 },
            { transform: `translate(${to.x}px, ${to.y - 46}px) scale(1)`, opacity: 0 },
        ],
        { duration: 900, easing: "ease-out", fill: "both" },
    ).onfinish = () => label.remove();
};

export const launchSouls = (container, classes, { from, to, text = null, delay = 0, duration = 0.6, count = null }) =>
    new Promise((resolve) => {
        if (!container || !from || !to) {
            resolve();
            return;
        }
        const souls = count ?? soulCountFor(text);
        const ms = Math.max(220, duration * 1000 * 1.25);
        let settled = false;
        const settle = () => {
            if (settled) return;
            settled = true;
            resolve();
        };
        for (let i = 0; i < souls; i++) {
            const path = curve(from, to, i);
            const start = delay * 1000 + i * 75;
            WISPS.forEach((wisp, k) => {
                const el = node(container, k === 0 ? classes.soul : classes.wisp);
                const frames = path.map((p, j) => {
                    const t = j / STEPS;
                    const grow = t < 0.2 ? 0.45 + (t / 0.2) * 0.75 : 1.2 - (t - 0.2) * 0.55;
                    return {
                        transform: `translate(${p.x}px, ${p.y}px) scale(${(grow * wisp.scale).toFixed(3)})`,
                        opacity: (t < 0.1 ? t / 0.1 : t > 0.92 ? 0.6 : 1) * wisp.alpha,
                    };
                });
                const animation = el.animate(frames, { duration: ms, delay: start + wisp.lag, easing: "cubic-bezier(.5,.02,.42,1)", fill: "both" });
                animation.onfinish = () => {
                    el.remove();
                    if (k !== 0) return;
                    impact(container, classes, to, i === 0 ? text : null);
                    if (i === 0) settle();
                };
            });
        }
        setTimeout(settle, delay * 1000 + ms + 600);
    });
