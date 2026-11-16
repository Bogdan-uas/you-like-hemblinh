// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import { STREAK_ASH_STYLE, STREAK_LIT_STYLE } from "../logic/statsUi.js";
import page from "../SpecialModePage.module.css";

export const MomentumStreakBadge = ({ value, team = null, size = 15, animated = false }) => {
    if (!value || value < 5) return null;
    const hot = value >= 10;
    return (
        <span className={page.momentum_wrap}>
            <motion.span
                className={`${page.best_of_badge} ${page.momentum_badge}`}
                data-hot={hot || undefined}
                style={{ fontSize: size + 1, "--team": team?.color ?? "#ff8a00" }}
                initial={animated ? { opacity: 0, y: -6, scale: 0.7 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
                aria-label={`Momentum streak: ${value} rounds in a row`}
            >
                <span className={`${page.best_of_badge_label} ${page.momentum_label}`}>
                    <FaFire className={page.momentum_flame} aria-hidden="true" />
                    Streak
                </span>
                <span className={`${page.best_of_badge_value} ${page.momentum_value}`} style={{ background: team?.gradient || undefined }}>
                    <motion.span key={value} initial={animated ? { y: -10, opacity: 0 } : false} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25, ease: "easeOut" }} style={{ display: "inline-block", transition: "none" }}>
                        {value}
                    </motion.span>
                </span>
            </motion.span>
        </span>
    );
};

export const UnbeatenStreakFire = ({ value, size = 26, showZero = false, style = {} }) => {
    const n = Math.max(0, Math.floor(Number(value) || 0));
    if (n === 0 && !showZero) return null;

    const text = String(n);
    const digitRatio = text.length >= 3 ? 0.34 : text.length === 2 ? 0.43 : 0.5;

    return (
        <span
            aria-label={`Unbeaten streak: ${n}`}
            style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: `${size}px`,
                height: `${size}px`,
                flexShrink: 0,
                pointerEvents: "none",
                ...style,
            }}
        >
            <FaFire
                style={{
                    fontSize: `${size}px`,
                    color: "#ff8a00",
                    filter: "drop-shadow(0 0 3px rgba(255,138,0,0.85))",
                }}
            />
            <span
                style={{
                    position: "absolute",
                    fontSize: `${Math.max(8, Math.round(size * digitRatio))}px`,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "#fff",
                    textShadow: "0 1px 2px rgba(0,0,0,0.85)",
                    marginTop: `${Math.max(1, Math.round(size * 0.1))}px`,
                }}
            >
                {text}
            </span>
        </span>
    );
};

export const LostStreakFire = ({ value, size = 26, style = {} }) => {
    const reduceMotion = useReducedMotion();
    const n = Math.max(0, Math.floor(Number(value) || 0));
    if (n === 0) return null;

    const text = String(n);
    const digitRatio = text.length >= 3 ? 0.34 : text.length === 2 ? 0.43 : 0.5;

    return (
        <span
            role="img"
            aria-label={`Unbeaten streak of ${n} lost`}
            style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: `${size}px`,
                height: `${size}px`,
                flexShrink: 0,
                pointerEvents: "none",
                ...style,
            }}
        >
            <motion.span
                initial={reduceMotion ? STREAK_ASH_STYLE : STREAK_LIT_STYLE}
                animate={STREAK_ASH_STYLE}
                transition={{ delay: 0.35, duration: 0.2, ease: "easeInOut" }}
                style={{ display: "inline-flex" }}
            >
                <FaFire style={{ fontSize: `${size}px` }} />
            </motion.span>
            <motion.span
                initial={{
                    clipPath: reduceMotion
                        ? "inset(-3px -3px -3px -3px)"
                        : "inset(-3px 0px -3px 100%)",
                }}
                animate={{ clipPath: "inset(-3px -3px -3px -3px)" }}
                transition={{ delay: 0.75, duration: 0.5, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: `${Math.round(size * 1.2)}px`,
                    height: "3px",
                    x: "-50%",
                    y: "-50%",
                    rotate: -45,
                    borderRadius: "2px",
                    background: "#e53935",
                    boxShadow: "0 0 0 1.5px #fff",
                }}
            />
            <span
                style={{
                    position: "absolute",
                    fontSize: `${Math.max(8, Math.round(size * digitRatio))}px`,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "#fff",
                    textShadow: "0 1px 2px rgba(0,0,0,0.85)",
                    marginTop: `${Math.max(1, Math.round(size * 0.1))}px`,
                }}
            >
                {text}
            </span>
        </span>
    );
};

export const SavedStreakFire = ({ value, size = 26, style = {} }) => {
    const reduceMotion = useReducedMotion();
    const n = Math.max(0, Math.floor(Number(value) || 0));
    if (n === 0) return null;

    const text = String(n);
    const digitRatio = text.length >= 3 ? 0.34 : text.length === 2 ? 0.43 : 0.5;
    const still = reduceMotion ? { duration: 0 } : null;

    return (
        <span
            role="img"
            aria-label={`Pick streak of ${n} saved by a Streak Shield`}
            style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: `${size}px`,
                height: `${size}px`,
                flexShrink: 0,
                pointerEvents: "none",
                ...style,
            }}
        >
            <motion.span
                initial={{ opacity: reduceMotion ? 0 : 1 }}
                animate={{ opacity: [1, 1, 0] }}
                transition={still ?? { duration: 1.6, times: [0, 0.75, 1], ease: "easeInOut" }}
                style={{ position: "absolute", display: "inline-flex", ...STREAK_ASH_STYLE }}
            >
                <FaFire style={{ fontSize: `${size}px` }} />
            </motion.span>
            <motion.span
                initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.92 }}
                animate={{ opacity: [0, 0, 1], scale: [0.92, 0.92, 1] }}
                transition={still ?? { duration: 1.6, times: [0, 0.75, 1], ease: "easeOut" }}
                style={{ display: "inline-flex", color: STREAK_LIT_STYLE.color, filter: STREAK_LIT_STYLE.filter }}
            >
                <FaFire style={{ fontSize: `${size}px` }} />
            </motion.span>
            <motion.span
                initial={{ scaleX: reduceMotion ? 1 : 0, opacity: reduceMotion ? 0 : 1 }}
                animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
                transition={still ?? { delay: 0.2, duration: 1.3, times: [0, 0.4, 1], ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: `${Math.round(size * 1.2)}px`,
                    height: "3px",
                    x: "-50%",
                    y: "-50%",
                    rotate: -45,
                    borderRadius: "2px",
                    background: "#e53935",
                    boxShadow: "0 0 0 1.5px #fff",
                }}
            />
            <span
                style={{
                    position: "absolute",
                    fontSize: `${Math.max(8, Math.round(size * digitRatio))}px`,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "#fff",
                    textShadow: "0 1px 2px rgba(0,0,0,0.85)",
                    marginTop: `${Math.max(1, Math.round(size * 0.1))}px`,
                }}
            >
                {text}
            </span>
            <motion.span
                initial={{ scale: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={still ?? { delay: 1.15, duration: 0.38, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                    position: "absolute",
                    right: `${-Math.round(size * 0.18)}px`,
                    bottom: `${-Math.round(size * 0.08)}px`,
                    display: "inline-flex",
                    color: "#e5484d",
                    fontSize: `${Math.max(7, Math.round(size * 0.42))}px`,
                    filter: "drop-shadow(0 0 1px #fff) drop-shadow(0 0 1px #fff)",
                }}
            >
                ♥
            </motion.span>
        </span>
    );
};
