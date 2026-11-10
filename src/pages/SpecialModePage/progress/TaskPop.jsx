import { useLayoutEffect, useMemo, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import css from "./Progress.module.css";
import { TaskFace } from "./TaskFace.jsx";
import { WaapiParticles } from "./ProgressParts.jsx";
import { TASK_LOOKS, formatXp, taskTierOf as tierOf, taskDiffOf as diffOf } from "./progressUi.js";

const KICKERS = ["Daily task complete", "Weekly task complete", "Monthly task conquered", "Crazy task crushed!"];
const RAINBOW = ["#ff3d77", "#ffb02e", "#ffe14d", "#3dffa2", "#00e5ff", "#7c4dff"];

const landOf = (tier) => 0.86 + tier * 0.1;

const lighten = (hex, amount) => {
    const n = parseInt(hex.slice(1), 16);
    const mix = (c) => Math.round(c + (255 - c) * amount);
    return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
};

const buildFx = (tier, diff, color) => {
    const land = landOf(tier) * 1000;
    const items = [];
    const waves = 1 + (tier >= 1) + (tier >= 2) + (tier === 3) + (diff === 2);
    for (let i = 0; i < waves; i++) {
        items.push({
            className: `${css.tfx_wave} ${tier === 3 && i % 2 ? css.tfx_wave_alt : ""}`,
            frames: [
                { transform: "scale(0.45)", opacity: 0 },
                { transform: "scale(0.55)", opacity: 0.95, offset: 0.08 },
                { transform: `scale(${3 + i * 0.9 + tier * 0.6})`, opacity: 0 },
            ],
            timing: { duration: 820 + tier * 120, delay: land + i * 120, easing: "cubic-bezier(.2,.7,.3,1)" },
        });
    }
    const count = Math.min(60, 12 + tier * 11 + diff * 5);
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.13;
        const distance = 70 + tier * 34 + ((i * 41) % (60 + tier * 30));
        const size = 5 + ((i * 7) % 5) + tier;
        const fill = tier === 3 ? RAINBOW[i % RAINBOW.length] : i % 4 === 0 ? "#ffffff" : i % 3 === 0 ? (tier === 2 ? "#ffd84d" : lighten(color, 0.45)) : color;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        items.push({
            className: css.tfx_particle,
            css: { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, background: fill, boxShadow: `0 0 ${6 + tier * 3}px ${fill}` },
            frames: [
                { transform: "translate(0px, 0px) scale(0.3)", opacity: 0 },
                { transform: `translate(${x * 0.55}px, ${y * 0.55}px) scale(1.15)`, opacity: 1, offset: 0.28 },
                { transform: `translate(${x}px, ${y + 18 + tier * 6}px) scale(0.2)`, opacity: 0 },
            ],
            timing: { duration: 900 + tier * 140 + ((i * 13) % 200), delay: land + ((i * 7) % 9) * 12, easing: "cubic-bezier(.15,.75,.3,1)" },
        });
    }
    if (tier === 3) {
        for (let i = 0; i < 26; i++) {
            const angle = (i / 26) * Math.PI * 2;
            const distance = 150 + ((i * 53) % 150);
            const fill = RAINBOW[(i + 2) % RAINBOW.length];
            const spin = (i % 2 ? 1 : -1) * (360 + ((i * 47) % 360));
            items.push({
                className: css.tfx_confetti,
                css: { background: fill },
                frames: [
                    { transform: "translate(0px, 0px) rotate(0deg) scale(0.4)", opacity: 0 },
                    { transform: `translate(${Math.cos(angle) * distance * 0.6}px, ${Math.sin(angle) * distance * 0.6 - 40}px) rotate(${spin * 0.4}deg) scale(1)`, opacity: 1, offset: 0.3 },
                    { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance + 90}px) rotate(${spin}deg) scale(0.8)`, opacity: 0 },
                ],
                timing: { duration: 1500 + ((i * 29) % 400), delay: land + 60 + (i % 5) * 30, easing: "cubic-bezier(.2,.6,.4,1)" },
            });
        }
    }
    return items;
};

const shakeFrames = (amount) =>
    amount
        ? [
            { transform: "translate(0px, 0px)" },
            { transform: `translate(${-amount}px, ${amount * 0.6}px)` },
            { transform: `translate(${amount * 0.8}px, ${-amount * 0.5}px)` },
            { transform: `translate(${-amount * 0.5}px, ${amount * 0.3}px)` },
            { transform: `translate(${amount * 0.25}px, 0px)` },
            { transform: "translate(0px, 0px)" },
        ]
        : null;

function Kicker({ tier, text }) {
    if (tier === 3) {
        return (
            <span className={`${css.tpop_kicker} ${css.tpop_kicker_crazy}`} data-tpop-glitch>
                <span className={css.tpop_glitch_layer} data-glitch="a" aria-hidden="true">{text}</span>
                <span className={css.tpop_glitch_layer} data-glitch="b" aria-hidden="true">{text}</span>
                <span className={css.tpop_glitch_main}>{text}</span>
            </span>
        );
    }
    if (tier === 0) {
        return (
            <span className={`${css.tpop_kicker} ${css.tpop_kicker_plain}`} style={{ "--d": `${landOf(tier)}s` }}>
                {text}
            </span>
        );
    }
    return (
        <span className={css.tpop_kicker}>
            {text.split("").map((ch, i) => (
                <span key={i} className={css.tpop_letter} style={{ "--d": `${(landOf(tier) + 0.05 + i * 0.03).toFixed(2)}s` }}>
                    {ch === " " ? " " : ch}
                </span>
            ))}
        </span>
    );
}

export function TaskPop({ gain }) {
    const task = gain.task;
    const tier = tierOf(task);
    const diff = diffOf(task);
    const look = TASK_LOOKS[task.cat] ?? TASK_LOOKS.daily;
    const land = landOf(tier);
    const centered = tier >= 2;
    const boxRef = useRef(null);
    const fx = useMemo(() => buildFx(tier, diff, look.color), [tier, diff, look.color]);

    useLayoutEffect(() => {
        const box = boxRef.current;
        if (!box) return undefined;
        const run = [];
        const play = (selector, frames, timing) => {
            const el = box.querySelector(selector);
            if (el && frames) run.push(el.animate(frames, { fill: "both", ...timing }));
        };
        const landMs = land * 1000;
        const enter =
            tier === 3
                ? [{ opacity: 0, transform: "scale(1.7)" }, { opacity: 1, transform: "scale(1)" }]
                : tier >= 2
                    ? [{ opacity: 0, transform: "translateY(50px) scale(0.85)" }, { opacity: 1, transform: "translateY(0px) scale(1)" }]
                    : [{ opacity: 0, transform: "translateX(-170px)" }, { opacity: 1, transform: "translateX(0px)" }];
        run.push(box.animate(enter, { duration: 500, easing: tier === 3 ? "cubic-bezier(.16,1,.3,1)" : "cubic-bezier(.22,1,.36,1)", fill: "backwards" }));
        play("[data-task-bar]", [{ transform: "scaleX(0.7)" }, { transform: "scaleX(1)" }], { duration: 430, delay: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
        play("[data-task-check]", [{ transform: "scale(0)", opacity: 0 }, { transform: "scale(1.4)", opacity: 1, offset: 0.6 }, { transform: "scale(1)", opacity: 1 }], { duration: 360, delay: 700 });
        play(
            "[data-task-seal]",
            [
                { transform: "rotate(-48deg) scale(3.4)", opacity: 0 },
                { transform: "rotate(-4deg) scale(0.86)", opacity: 1, offset: 0.62 },
                { transform: "rotate(-8deg) scale(1)", opacity: 1 },
            ],
            { duration: 460, delay: landMs - 300, easing: "cubic-bezier(.3,1.2,.5,1)" },
        );
        play("[data-task-xp]", [{ transform: "scale(1)" }, { transform: "scale(1.38)", offset: 0.45 }, { transform: "scale(1)" }], { duration: 480, delay: landMs + 260 });
        play("[data-tfx-glow]", [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0 }], { duration: 900 + tier * 200, delay: landMs - 40 });
        play("[data-tfx-shine]", [{ transform: "translateX(-140%) skewX(-20deg)" }, { transform: "translateX(320%) skewX(-20deg)" }], { duration: 700 + tier * 80, delay: landMs + 60, easing: "ease-in-out" });
        play("[data-tfx-rays]", [{ opacity: 0, transform: "scale(0.4)" }, { opacity: 1, transform: "scale(1)" }], { duration: 520, delay: landMs - 80, easing: "cubic-bezier(.2,.8,.2,1)" });
        play("[data-tfx-stage-flash]", tier === 3 ? [{ opacity: 0 }, { opacity: 0.85, offset: 0.12 }, { opacity: 0 }] : null, { duration: 650, delay: landMs - 20 });
        play("[data-tpop-shake]", shakeFrames([0, 4, 7, 13][tier] + diff * 2), { duration: 380 + tier * 60, delay: landMs, easing: "ease-out" });
        if (tier === 3) {
            play('[data-glitch="a"]', [
                { transform: "translate(0px, 0px)", opacity: 0 },
                { transform: "translate(-6px, 2px)", opacity: 0.9, offset: 0.1 },
                { transform: "translate(4px, -1px)", opacity: 0.9, offset: 0.25 },
                { transform: "translate(-3px, 0px)", opacity: 0.8, offset: 0.45 },
                { transform: "translate(2px, 1px)", opacity: 0.7, offset: 0.7 },
                { transform: "translate(-2px, 0px)", opacity: 0.6 },
            ], { duration: 900, delay: landMs, iterations: 3, direction: "alternate", easing: "steps(6)" });
            play('[data-glitch="b"]', [
                { transform: "translate(0px, 0px)", opacity: 0 },
                { transform: "translate(6px, -2px)", opacity: 0.9, offset: 0.1 },
                { transform: "translate(-4px, 1px)", opacity: 0.9, offset: 0.3 },
                { transform: "translate(3px, 0px)", opacity: 0.8, offset: 0.55 },
                { transform: "translate(-2px, -1px)", opacity: 0.7, offset: 0.8 },
                { transform: "translate(2px, 0px)", opacity: 0.6 },
            ], { duration: 900, delay: landMs, iterations: 3, direction: "alternate", easing: "steps(6)" });
            play("[data-tpop-glitch]", [
                { transform: "scale(2.4)", opacity: 0 },
                { transform: "scale(0.94)", opacity: 1, offset: 0.55 },
                { transform: "scale(1)", opacity: 1 },
            ], { duration: 420, delay: landMs - 60, easing: "cubic-bezier(.3,1.3,.5,1)" });
        }
        return () => run.forEach((animation) => animation.cancel());
    }, [land, tier, diff]);

    const stageClass = `${css.tpop_stage} ${css[`tpop_tier${tier}`]} ${centered ? css.tpop_centered : css.tpop_side}`;
    return (
        <motion.div className={stageClass} style={{ "--task-color": look.color }} initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} role="status">
            {centered ? (
                <span className={css.tpop_backdrop} />
            ) : null}
            {tier === 3 ? <span className={css.tpop_flash} data-tfx-stage-flash /> : null}
            <motion.div
                ref={boxRef}
                className={css.tpop_box}
                exit={centered ? { opacity: 0, y: -30, scale: 0.94 } : { opacity: 0, x: -170 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.6, 1] }}
            >
                <div className={css.tpop_head}>
                    <span className={css.tpop_icon} aria-hidden="true">
                        <look.icon />
                    </span>
                    <Kicker tier={tier} text={KICKERS[tier]} />
                </div>
                <div className={css.tpop_shake} data-tpop-shake>
                    {tier >= 2 ? (
                        <span className={css.tfx_back} aria-hidden="true">
                            <span className={css.tfx_rays_wrap} data-tfx-rays>
                                <span className={`${css.tfx_rays} ${tier === 3 ? css.tfx_rays_crazy : ""}`} />
                            </span>
                        </span>
                    ) : null}
                    <TaskFace
                        cat={task.cat}
                        text={task.text}
                        difficultyKey={task.difficultyKey ?? String(task.difficulty ?? "").toLowerCase()}
                        difficultyLabel={task.difficulty}
                        xp={gain.xp}
                        xpTitle={task.boostXp ? `${formatXp(task.baseXp)} XP + ${formatXp(task.boostXp)} XP from your Task boost` : undefined}
                        done
                        doneAt={new Date(gain.at ?? Date.now()).toISOString()}
                        ratio={1}
                        xpAnchor
                    >
                        <span className={css.tfx_glow} data-tfx-glow aria-hidden="true" />
                        <span className={css.tfx_shine_clip} aria-hidden="true">
                            <span className={css.tfx_shine} data-tfx-shine />
                        </span>
                        <span className={css.tfx_origin} aria-hidden="true">
                            <WaapiParticles items={fx} />
                        </span>
                    </TaskFace>
                </div>
                {task.boostXp ? (
                    <span className={`${css.tpop_boost} ${css.tpop_kicker_plain}`} style={{ "--d": `${land + 0.3}s` }}>
                        incl. +{formatXp(task.boostXp)} XP from your Task boost (+{task.boost}%)
                    </span>
                ) : null}
            </motion.div>
        </motion.div>
    );
}
