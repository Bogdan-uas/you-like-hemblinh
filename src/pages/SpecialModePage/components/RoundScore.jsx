import { useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import css from "../SpecialModePage.module.css";

const DIGIT_SPRING = { type: "spring", stiffness: 340, damping: 24, mass: 0.9 };

export const RoundScore = ({ value, team, highlighted = false }) => {
    const digits = String(value).split("");
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
    }, []);

    return (
        <span
            className={`${css.round_text} ${css.round_score}`}
            style={{
                filter: highlighted
                    ? `drop-shadow(0 0 1.5px ${team?.color}) drop-shadow(0 0 3.5px ${team?.color}66) drop-shadow(0 1px 3px rgba(0,0,0,0.4))`
                    : "none",
            }}
        >
            <AnimatePresence initial={false}>
                <motion.span
                    key={`bloom-${value}`}
                    className={css.round_score_bloom}
                    initial={{ opacity: 0, scale: 0.55 }}
                    animate={{ opacity: [0, 0.55, 0], scale: [0.55, 1.1, 1.3] }}
                    exit={{ opacity: 0, transition: { duration: 0 } }}
                    transition={{ duration: 0.9, ease: "easeOut", times: [0, 0.3, 1] }}
                    style={{ background: `radial-gradient(closest-side, ${team?.color ?? "#999"}, transparent)` }}
                />
            </AnimatePresence>
            <span className={css.round_score_clip}>
                <span className={css.round_score_digits}>
                    {digits.map((digit, index) => (
                        <span key={`slot-${digits.length - 1 - index}`} className={css.round_score_slot}>
                            <AnimatePresence initial={mountedRef.current} mode="popLayout">
                                <motion.span
                                    key={digit}
                                    className={css.round_score_digit}
                                    initial={{ y: "62%", opacity: 0, filter: "blur(2px)" }}
                                    animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                                    exit={{ y: "-62%", opacity: 0, filter: "blur(2px)" }}
                                    transition={{ y: DIGIT_SPRING, opacity: { duration: 0.22 }, filter: { duration: 0.22 } }}
                                    style={{ backgroundImage: team?.gradient }}
                                >
                                    {digit}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                    ))}
                </span>
            </span>
        </span>
    );
};
