// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import css from "./PemStreak.module.css";
import { STREAK_MIN, pemTextOn, streakTier } from "./pemHud.js";

const EASE = [0.22, 1, 0.36, 1];
const POP = [0.3, 1.5, 0.5, 1];

const Count = ({ value, animated, className }) => (
    <motion.span
        key={value}
        className={className}
        initial={animated ? { scale: 1.9, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: POP }}
    >
        {value}
    </motion.span>
);

const PemMeter = ({ value, animated }) => {
    const fill = Math.min(1, (value - 4) / 6);
    return (
        <>
            <motion.span
                className={css.meter}
                variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 }, gone: { scaleX: 0, transition: { duration: 0.35, ease: "easeIn" } } }}
                transition={{ duration: 0.45, ease: EASE }}
            >
                <motion.span className={css.fill} initial={animated ? { scaleX: 0 } : false} animate={{ scaleX: fill }} transition={{ duration: 0.6, ease: EASE }} />
                <span className={css.sweep} />
            </motion.span>
            <motion.span
                className={css.tab}
                variants={{ hidden: { y: -10, opacity: 0 }, shown: { y: 0, opacity: 1 }, gone: { y: 10, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } } }}
                transition={{ duration: 0.4, ease: EASE, delay: animated ? 0.12 : 0 }}
            >
                <span className={css.tab_glow} />
                <Count value={value} animated={animated} className={css.tab_value} />
                <span className={css.tab_label}>in a row</span>
            </motion.span>
        </>
    );
};

const GplSticker = ({ value, animated }) => (
    <motion.span
        className={css.stack}
        variants={{
            hidden: { scale: 1.6, rotate: -14, opacity: 0 },
            shown: { scale: 1, rotate: 0, opacity: 1 },
            gone: { rotate: -28, x: -14, y: 16, opacity: 0, transition: { duration: 0.38, ease: "easeIn" } },
        }}
        transition={{ duration: 0.36, ease: POP }}
    >
        <AnimatePresence initial={false}>
            {value >= 7 ? (
                <motion.span
                    key="second"
                    className={css.sticker_back}
                    initial={animated ? { scale: 1.5, rotate: 20, opacity: 0 } : { rotate: 9 }}
                    animate={{ scale: 1, rotate: 9, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.34, ease: POP }}
                >
                    hot
                </motion.span>
            ) : null}
        </AnimatePresence>
        <span className={css.sticker}>
            <span className={css.sticker_shine} />
            <Count value={value} animated={animated} className={css.sticker_value} />
            <span className={css.sticker_label}>straight</span>
            <svg className={css.scribble} viewBox="0 0 60 8" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 5 C12 1 20 7 30 4 S48 2 58 5" />
            </svg>
        </span>
        <AnimatePresence initial={false}>
            {value >= 10 ? (
                <motion.span
                    key="stamp"
                    className={css.stamp}
                    initial={animated ? { scale: 2.4, opacity: 0, rotate: -12 } : { rotate: -12 }}
                    animate={{ scale: 1, opacity: 1, rotate: -12 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: POP }}
                >
                    on fire
                </motion.span>
            ) : null}
        </AnimatePresence>
    </motion.span>
);

const Chevron = () => (
    <svg viewBox="0 0 16 7" aria-hidden="true">
        <path d="M0 0 H4 L8 3.5 L12 0 H16 L8 7 Z" />
    </svg>
);

const GccChevrons = ({ value, animated }) => {
    const count = Math.min(4, 1 + Math.floor((value - STREAK_MIN) / 2));
    return (
        <motion.span
            className={css.ranks}
            variants={{ hidden: { opacity: 0, y: -6 }, shown: { opacity: 1, y: 0 }, gone: { opacity: 0, y: 10, transition: { duration: 0.32, ease: "easeIn" } } }}
            transition={{ duration: 0.35, ease: EASE }}
        >
            <span className={css.chevrons}>
                <AnimatePresence initial={false}>
                    {Array.from({ length: count }, (_, i) => (
                        <motion.span
                            key={i}
                            className={css.chevron}
                            style={{ "--i": i }}
                            initial={animated ? { y: -10, opacity: 0 } : false}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.32, ease: POP }}
                        >
                            <Chevron />
                        </motion.span>
                    ))}
                </AnimatePresence>
            </span>
            <span className={css.rank_text}>
                <Count value={value} animated={animated} className={css.rank_value} />
                <span className={css.rank_label}>streak</span>
            </span>
        </motion.span>
    );
};

const VARIANTS = { pem: PemMeter, gpl: GplSticker, gcc: GccChevrons };

export const PemStreak = ({ value = 0, theme = "pem", side = "left", team = null, animated = true }) => {
    const Variant = VARIANTS[theme] ?? PemMeter;
    const shown = (value ?? 0) >= STREAK_MIN;
    return (
        <AnimatePresence initial={false}>
            {shown ? (
                <motion.span
                    key="streak"
                    className={`${css.root} ${css[theme] ?? ""} ${side === "right" ? css.right : ""}`}
                    style={{ "--team-color": team?.color ?? "#8b909e", "--team-gradient": team?.gradient ?? team?.color ?? "#8b909e", "--team-text": pemTextOn(team?.color) }}
                    data-tier={streakTier(value)}
                    initial={animated ? "hidden" : false}
                    animate="shown"
                    exit="gone"
                    variants={{ hidden: {}, shown: {}, gone: { transition: { when: "afterChildren" } } }}
                >
                    <Variant value={value} animated={animated} />
                </motion.span>
            ) : null}
        </AnimatePresence>
    );
};
