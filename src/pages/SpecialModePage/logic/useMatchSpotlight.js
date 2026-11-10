import { useEffect } from "react";
import css from "../components/TeamHistory.module.css";

const VISIBLE_SHARE = 0.85;
const FIND_FOR_MS = 6000;

const coveredTop = () => {
    const header = document.querySelector("header");
    const rect = header?.getBoundingClientRect();
    return rect ? Math.max(0, rect.bottom) : 0;
};

const playSpotlight = (el) => {
    const rect = el.getBoundingClientRect();
    const ring = document.createElement("div");
    ring.className = css.spotlight;
    ring.setAttribute("aria-hidden", "true");
    Object.assign(ring.style, {
        left: `${rect.left + window.scrollX}px`,
        top: `${rect.top + window.scrollY}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        borderRadius: getComputedStyle(el).borderRadius || "10px",
    });
    ring.innerHTML = `<span class="${css.spotlight_glow}"></span><span class="${css.spotlight_ring}"></span><span class="${css.spotlight_wave}"></span>`;
    document.body.appendChild(ring);
    ring.addEventListener("animationend", (e) => {
        if (e.target === ring) ring.remove();
    });
};

export function useMatchSpotlight(matchKey, active, onDone) {
    useEffect(() => {
        if (!matchKey || !active) return undefined;
        let cancelled = false;
        let observer = null;
        let frame = 0;
        const started = performance.now();
        const watch = (el) => {
            const check = () => {
                const rect = el.getBoundingClientRect();
                const top = Math.max(rect.top, coveredTop());
                const bottom = Math.min(rect.bottom, window.innerHeight);
                const left = Math.max(rect.left, 0);
                const right = Math.min(rect.right, window.innerWidth);
                const shown = Math.max(0, bottom - top) * Math.max(0, right - left);
                return rect.width * rect.height > 0 && shown / (rect.width * rect.height) >= VISIBLE_SHARE;
            };
            const fire = () => {
                if (cancelled) return;
                observer?.disconnect();
                cancelled = true;
                playSpotlight(el);
                onDone();
            };
            if (check()) {
                fire();
                return;
            }
            observer = new IntersectionObserver(
                () => {
                    if (check()) fire();
                },
                { threshold: [0, 0.25, 0.5, 0.75, 0.85, 0.95, 1] },
            );
            observer.observe(el);
        };
        const find = () => {
            if (cancelled) return;
            const el = document.querySelector(`[data-match-key="${CSS.escape(matchKey)}"]`);
            if (el) watch(el);
            else if (performance.now() - started < FIND_FOR_MS) frame = requestAnimationFrame(find);
        };
        const timer = setTimeout(() => {
            frame = requestAnimationFrame(find);
        }, 450);
        return () => {
            cancelled = true;
            clearTimeout(timer);
            cancelAnimationFrame(frame);
            observer?.disconnect();
        };
    }, [matchKey, active, onDone]);
}
