// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import { STREAK_ASH_STYLE, STREAK_LIT_STYLE } from "../logic/statsUi.js";

export const MomentumStreakBadge = ({ value, size = 15, animated = false }) => {
    if (!value || value < 5) return null;
    return (
        <div
            style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                marginTop: "3px",
                pointerEvents: "none",
            }}
        >
            <motion.div
                initial={animated ? { opacity: 0, scale: 0.4 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <FaFire
                    style={{
                        fontSize: `${size + 11}px`,
                        color: "#ff8a00",
                        filter: "drop-shadow(0 0 3px rgba(255,138,0,0.85))",
                    }}
                />
                <span
                    style={{
                        position: "absolute",
                        fontSize: `${size - 3}px`,
                        fontWeight: 800,
                        color: "#fff",
                        textShadow: "0 1px 2px rgba(0,0,0,0.85)",
                        marginTop: "2px",
                    }}
                >
                    {value}
                </span>
            </motion.div>
        </div>
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
