import { useEffect, useMemo, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import css from "./Progress.module.css";
import { PERK_MILESTONES, anniversaryRank, perkLines } from "./progressConfig.js";
import { levelFx } from "./progressUi.js";
import { LevelNumber, WaapiParticles } from "./ProgressParts.jsx";

const SPARK_COUNT = 26;
const CONFETTI_COLORS = ["#ffd700", "#747bff", "#ff4d6d", "#2ecc71", "#4fd8ff", "#ffffff", "#f2994a"];

const MIN_SHOWN_MS = 1200;

const durationFor = (rank) => [2.6, 3.2, 3.8, 4.2, 4.6, 5.2, 5.8, 6.2, 6.8][rank] ?? 6.8;

const subtitleFor = (level, rank) => {
    if (rank >= 2) return level === 1000 ? "Legendary Anniversary" : `Big Anniversary · Level ${level}`;
    if (rank === 1) return `Anniversary · Level ${level}`;
    return "New level reached";
};

const rand = (seed) => {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
};

export function LevelUpOverlay({ level, onDone }) {
    const rank = anniversaryRank(level);
    const duration = durationFor(rank);
    const fx = levelFx(level);
    const glow = fx.strength ? fx.glow : "#9aa0ff";
    const startedRef = useRef(Date.now());
    const doneRef = useRef(false);

    const finish = () => {
        if (doneRef.current) return;
        doneRef.current = true;
        onDone?.();
    };

    useEffect(() => {
        const swallow = (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
        };
        const onKeyDown = (e) => {
            swallow(e);
            if (!e.repeat && Date.now() - startedRef.current > MIN_SHOWN_MS) finish();
        };
        window.addEventListener("keydown", onKeyDown, true);
        window.addEventListener("keyup", swallow, true);
        window.addEventListener("keypress", swallow, true);
        return () => {
            window.removeEventListener("keydown", onKeyDown, true);
            window.removeEventListener("keyup", swallow, true);
            window.removeEventListener("keypress", swallow, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const unlockedPerks = useMemo(() => {
        const milestone = PERK_MILESTONES.find((m) => m.level === level);
        return milestone ? perkLines(milestone.set) : [];
    }, [level]);

    const sparks = useMemo(() => Array.from({ length: SPARK_COUNT + rank * 6 }, (_, i) => {
        const angle = (i / (SPARK_COUNT + rank * 6)) * Math.PI * 2 + rand(i) * 0.3;
        const distance = 170 + rand(i + 7) * (120 + rank * 40);
        const size = 6 + rand(i + 11) * 8;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        return {
            className: css.lvl_spark,
            css: { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, background: i % 3 ? "#ffffff" : glow },
            frames: [
                { transform: "translate(0px, 0px) scale(0.4)", opacity: 0 },
                { transform: `translate(${x * 0.5}px, ${y * 0.5}px) scale(1)`, opacity: 1, offset: 0.35 },
                { transform: `translate(${x}px, ${y}px) scale(0.5)`, opacity: 0 },
            ],
            timing: { duration: 1200, delay: (0.55 + rand(i + 3) * 0.25) * 1000, easing: "cubic-bezier(.2,.7,.3,1)" },
        };
    }), [rank, glow]);

    const confetti = useMemo(() => (rank >= 2 ? Array.from({ length: 36 + rank * 14 }, (_, i) => {
        const drift = (rand(i + 13) - 0.5) * 160;
        const spin = (rand(i + 17) - 0.5) * 900;
        return {
            className: css.confetti,
            css: { left: `${rand(i + 21) * 100}%`, background: CONFETTI_COLORS[i % CONFETTI_COLORS.length] },
            frames: [
                { transform: "translate(0px, 0px) rotate(0deg)", opacity: 1 },
                { transform: `translate(${drift * 0.6}px, 760px) rotate(${spin * 0.66}deg)`, opacity: 1, offset: 0.66 },
                { transform: `translate(${drift}px, 1150px) rotate(${spin}deg)`, opacity: 0 },
            ],
            timing: { duration: (2.2 + rand(i + 9) * 1.8) * 1000, delay: (0.4 + rand(i + 5) * 1.6) * 1000, easing: "ease-in" },
        };
    }) : []), [rank]);

    const fireworks = useMemo(() => (rank >= 4 ? Array.from({ length: Math.min(8, rank) }, (_, b) => {
        const fx = (rand(b + 31) - 0.5) * 1100;
        const fy = (rand(b + 37) - 0.5) * 520;
        const color = CONFETTI_COLORS[b % CONFETTI_COLORS.length];
        return Array.from({ length: 16 }, (_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const tx = fx + Math.cos(angle) * 130;
            const ty = fy + Math.sin(angle) * 130 + 30;
            return {
                className: css.lvl_spark,
                css: { background: color, boxShadow: `0 0 12px ${color}` },
                frames: [
                    { transform: `translate(${fx}px, ${fy}px) scale(0.4)`, opacity: 0 },
                    { transform: `translate(${(fx + tx) / 2}px, ${(fy + ty) / 2}px) scale(1)`, opacity: 1, offset: 0.4 },
                    { transform: `translate(${tx}px, ${ty}px) scale(0.6)`, opacity: 0 },
                ],
                timing: { duration: 1100, delay: (1 + b * 0.38) * 1000, easing: "cubic-bezier(.2,.7,.3,1)" },
            };
        });
    }).flat() : []), [rank]);

    const rings = rank >= 3 ? [0, 0.35, 0.7] : [0];
    const title = level >= 100 && rank >= 5 ? `LEVEL ${level}` : "LEVEL UP";

    return (
        <motion.div
            className={css.lvl_overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            onClick={(e) => {
                e.stopPropagation();
                if (Date.now() - startedRef.current > MIN_SHOWN_MS) finish();
            }}
            aria-live="polite"
        >
            <div className={css.lvl_back} />
            <motion.div
                className={css.lvl_rays_wrap}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: Math.min(1.6, duration * 0.4), ease: [0.22, 1, 0.36, 1] }}
            >
                <span className={css.lvl_rays} style={{ animationDuration: `${Math.max(10, 26 - rank * 2)}s` }} />
            </motion.div>
            {rank >= 5 ? (
                <motion.div className={css.lvl_flash} initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.1, delay: 0.5, times: [0, 0.2, 1] }} />
            ) : null}
            <WaapiParticles items={confetti} />
            <WaapiParticles items={fireworks} />
            <div className={css.lvl_stage}>
                <div className={css.lvl_title}>
                    {title.split("").map((ch, i) => (
                        <motion.span
                            key={i}
                            initial={{ y: -40, opacity: 0, scale: 1.6 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 + i * 0.05, type: "spring", stiffness: 380, damping: 16 }}
                        >
                            {ch === " " ? " " : ch}
                        </motion.span>
                    ))}
                </div>
                <motion.div
                    className={css.lvl_badge}
                    style={{ boxShadow: `0 0 0 6px ${glow}88, 0 0 ${60 + rank * 16}px ${glow}` }}
                    initial={{ scale: 0.2, rotate: -120, opacity: 0 }}
                    animate={{ scale: [0.2, 1.15, 1], rotate: [-120, 8, 0], opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                    {rings.map((delay, i) => (
                        <motion.span
                            key={`r${i}`}
                            className={css.lvl_ring}
                            style={{ borderColor: glow }}
                            initial={{ scale: 1, opacity: 0.9 }}
                            animate={{ scale: 2.6 + i * 0.6, opacity: 0 }}
                            transition={{ duration: 1.1, delay: 0.55 + delay, ease: "easeOut" }}
                        />
                    ))}
                    <WaapiParticles items={sparks} />
                    <motion.span
                        className={css.lvl_number}
                        initial={{ rotateX: 0, y: 0, opacity: 1 }}
                        animate={{ rotateX: 90, y: -40, opacity: 0 }}
                        transition={{ duration: 0.35, delay: 0.75, ease: "easeIn" }}
                    >
                        {level - 1}
                    </motion.span>
                    <motion.span
                        className={css.lvl_number}
                        initial={{ rotateX: -90, y: 40, opacity: 0 }}
                        animate={{ rotateX: 0, y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <LevelNumber level={level} />
                    </motion.span>
                </motion.div>
                <motion.div className={css.lvl_sub} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.4 }}>
                    {subtitleFor(level, rank)}
                </motion.div>
                {unlockedPerks.length ? (
                    <motion.div className={css.lvl_perks} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.4 }}>
                        {unlockedPerks.map((line) => (
                            <span key={line}>New benefit: {line}</span>
                        ))}
                    </motion.div>
                ) : null}
            </div>
            <span className={css.lvl_skip}>Click or press any key to continue</span>
        </motion.div>
    );
}
