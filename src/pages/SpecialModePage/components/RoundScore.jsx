// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import css from "../SpecialModePage.module.css";

export const RoundScore = ({ value, team, highlighted = false }) => (
    <span
        className={`${css.round_text} ${css.round_score}`}
        style={{
            filter: highlighted
                ? `drop-shadow(0 0 1.5px ${team?.color}) drop-shadow(0 0 3.5px ${team?.color}66) drop-shadow(0 1px 3px rgba(0,0,0,0.4))`
                : "none",
        }}
    >
        <span className={css.round_score_clip}>
            <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                    key={value}
                    className={css.round_score_digit}
                    initial={{ y: 22, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -22, opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    style={{ backgroundImage: team?.gradient }}
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </span>
    </span>
);
