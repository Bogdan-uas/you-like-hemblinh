import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import css from "./PemHud.module.css";
import { PemCircle, PemTrophy } from "./PemParts.jsx";
import { STINGER_MIN_MS, getPemExtendedCue, getPemStingerCue, isFreshPemSeries } from "./pemHud.js";

const INTRO_MS = 3400;
const FLASH_MS = 1500;
const HALF_FLASH_MS = 2300;
const EASE = [0.22, 1, 0.36, 1];

const Chevron = ({ className }) => (
    <svg className={className} viewBox="0 0 120 60" aria-hidden="true">
        <path d="M6 6 H34 L60 32 L86 6 H114 L60 58 Z" fill="currentColor" />
        <path d="M34 6 H48 L60 18 L72 6 H86 L60 32 Z" fill="currentColor" opacity="0.45" />
    </svg>
);

export const GccStinger = ({ seriesState, setsToWin }) => {
    const action = seriesState.pendingAction;
    const [timed, setTimed] = useState(null);

    useEffect(() => {
        if (!action?.executeAt) return undefined;
        const remaining = action.executeAt - Date.now();
        const cue = getPemStingerCue(seriesState, setsToWin);
        if (!cue || remaining < STINGER_MIN_MS) return undefined;
        setTimed({ key: action.executeAt, ...cue });
        const timer = setTimeout(() => setTimed(null), remaining);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action?.executeAt]);

    const shown = (timed && action?.executeAt === timed.key ? timed : null) ?? getPemExtendedCue(seriesState);

    return (
        <AnimatePresence>
            {shown ? (
                <motion.div
                    key={shown.key}
                    className={css.gcc_stinger}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.28, ease: "easeIn" } }}
                    aria-hidden="true"
                >
                    <span className={css.gcc_st_bg} />
                    <span className={css.gcc_st_slab} />
                    <span className={`${css.gcc_st_slab} ${css.gcc_st_slab_2}`} />
                    <Chevron className={css.gcc_st_mark} />
                    <span className={css.gcc_st_body}>
                        <span className={css.gcc_st_sub}>{shown.sub}</span>
                        <span className={css.gcc_st_text}>{shown.text}</span>
                    </span>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

const gambleKey = (s) => `${s.miniWins ?? 0}|${s.miniLosses ?? 0}|${s.lastMultiplierLeft ?? ""}|${s.lastMultiplierRight ?? ""}|${s.roundNumber ?? 0}`;

const useRoundCue = (s, play, stop) => {
    const frameRef = useRef(null);
    const rw = s.roundWins ?? 0;
    const rl = s.roundLosses ?? 0;
    const gamble = gambleKey(s);
    const prevRef = useRef([rw, rl, gamble]);

    const cancel = () => {
        if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
    };

    useEffect(() => {
        const [pw, pl, pg] = prevRef.current;
        prevRef.current = [rw, rl, gamble];
        const side = rw === pw + 1 && rl === pl ? "left" : rl === pl + 1 && rw === pw ? "right" : null;
        if (side && !s.banner && s.tiebreakerPhase === "idle" && !s.pendingAction) {
            const isHalf = !s.isOvertime && rw + rl === 12;
            cancel();
            stop();
            frameRef.current = requestAnimationFrame(() => {
                frameRef.current = requestAnimationFrame(() => {
                    frameRef.current = null;
                    play(side, isHalf);
                });
            });
            return undefined;
        }
        if (rw !== pw || rl !== pl || gamble !== pg) {
            cancel();
            stop();
        }
        return undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rw, rl, gamble]);

    useEffect(() => cancel, []);
};

const cueOn = (el, timerRef, ms) => {
    clearTimeout(timerRef.current);
    if (el.dataset.state !== "off") {
        el.dataset.state = "off";
        void el.offsetWidth;
    }
    el.dataset.state = "on";
    timerRef.current = setTimeout(() => {
        if (el.dataset.state === "on") el.dataset.state = "out";
    }, ms);
};

const cueOff = (el, timerRef) => {
    clearTimeout(timerRef.current);
    if (el && el.dataset.state === "on") el.dataset.state = "out";
};

const settleOut = (e) => {
    if (e.target === e.currentTarget && e.currentTarget.dataset.state === "out") e.currentTarget.dataset.state = "off";
};

export const GccRoundFlash = ({ seriesState: s }) => {
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const leftTimer = useRef(null);
    const rightTimer = useRef(null);

    useRoundCue(
        s,
        (side) => {
            const el = side === "left" ? leftRef.current : rightRef.current;
            if (el) cueOn(el, side === "left" ? leftTimer : rightTimer, FLASH_MS);
        },
        () => {
            cueOff(leftRef.current, leftTimer);
            cueOff(rightRef.current, rightTimer);
        },
    );

    useEffect(() => () => {
        clearTimeout(leftTimer.current);
        clearTimeout(rightTimer.current);
    }, []);

    return ["left", "right"].map((side) => {
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        return (
            <span
                key={side}
                ref={side === "left" ? leftRef : rightRef}
                data-state="off"
                className={`${css.gcc_rf} ${css[`gcc_rf_${side}`]}`}
                style={{ "--team-color": team?.color ?? "#8b909e" }}
                onAnimationEnd={settleOut}
                aria-hidden="true"
            >
                <span className={css.gcc_rf_wash} />
                <Chevron className={css.gcc_rf_mark} />
                <span className={css.gcc_rf_line} />
            </span>
        );
    });
};

export const GccHalftime = ({ seriesState: s }) => {
    const ref = useRef(null);
    const timerRef = useRef(null);

    useRoundCue(
        s,
        (side, isHalf) => {
            if (isHalf && ref.current) cueOn(ref.current, timerRef, HALF_FLASH_MS);
        },
        () => cueOff(ref.current, timerRef),
    );

    useEffect(() => () => clearTimeout(timerRef.current), []);

    return (
        <span ref={ref} data-state="off" className={css.gcc_half} onAnimationEnd={settleOut} aria-hidden="true">
            <span className={css.gcc_half_top}>Halftime</span>
            <span className={css.gcc_half_bottom}>Sides switch</span>
        </span>
    );
};

export const GccStreakGlow = ({ left = 0, right = 0 }) => (
    <AnimatePresence initial={false}>
        {[["left", left], ["right", right]].map(([side, value]) => (value >= 10 ? (
            <motion.span
                key={side}
                className={`${css.gcc_heat} ${css[`gcc_heat_${side}`]}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                aria-hidden="true"
            >
                <Chevron className={css.gcc_heat_mark} />
            </motion.span>
        ) : null))}
    </AnimatePresence>
);

export function GccIntro({ seriesState, eventName, eventNumber, stageText, setsToWin, onDone }) {
    const [open, setOpen] = useState(() => isFreshPemSeries(seriesState));

    useEffect(() => {
        if (!open) return undefined;
        const timer = setTimeout(() => setOpen(false), INTRO_MS);
        return () => clearTimeout(timer);
    }, [open]);

    useEffect(() => {
        if (!open) onDone?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const words = String(eventName ?? "").split(" ");

    return (
        <AnimatePresence onExitComplete={onDone}>
            {open ? (
                <motion.div
                    key="gcc-intro"
                    className={`${css.hud} ${css.theme_gcc} ${css.gcc_intro}`}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.3 } }}
                    transition={{ duration: 0.2 }}
                >
                    <span className={`${css.gcc_in_line} ${css.gcc_in_line_top}`} aria-hidden="true" />
                    <span className={`${css.gcc_in_line} ${css.gcc_in_line_bottom}`} aria-hidden="true" />
                    <span className={`${css.gcc_in_line} ${css.gcc_in_line_left}`} aria-hidden="true" />
                    <span className={`${css.gcc_in_line} ${css.gcc_in_line_right}`} aria-hidden="true" />
                    <span className={`${css.gcc_in_slab} ${css.gcc_in_slab_a}`} aria-hidden="true" />
                    <span className={`${css.gcc_in_slab} ${css.gcc_in_slab_b}`} aria-hidden="true" />
                    <div className={css.gcc_in_stage}>
                        <motion.span
                            className={css.gcc_in_emblem}
                            initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.5, delay: 0.15, ease: [0.3, 1.5, 0.5, 1] }}
                        >
                            <PemTrophy type="gcc" size={70} />
                        </motion.span>
                        <span className={css.gcc_in_title}>
                            {words.map((w, i) => (
                                <motion.span
                                    key={i}
                                    className={css.gcc_in_word}
                                    initial={{ opacity: 0, scale: 1.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16, transition: { duration: 0.22, ease: "easeIn" } }}
                                    transition={{ duration: 0.34, delay: 0.3 + i * 0.12, ease: [0.3, 1.4, 0.5, 1] }}
                                >
                                    {w}
                                </motion.span>
                            ))}
                            <motion.span
                                className={css.event_number}
                                initial={{ opacity: 0, scale: 0.4 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, delay: 0.3 + words.length * 0.12, ease: [0.3, 1.5, 0.5, 1] }}
                            >
                                {eventNumber}
                            </motion.span>
                        </span>
                        <motion.span
                            className={css.gcc_in_sub}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35, delay: 0.85, ease: EASE }}
                        >
                            {stageText} · Best of {setsToWin * 2 - 1}
                        </motion.span>
                        <div className={css.gcc_in_teams}>
                            {["left", "right"].map((side) => {
                                const team = side === "left" ? seriesState.leftTeam : seriesState.rightTeam;
                                return (
                                    <motion.div
                                        key={side}
                                        className={`${css.gcc_in_team} ${side === "right" ? css.gcc_in_team_right : ""}`}
                                        style={{ "--team-color": team?.color ?? "#8b909e", "--team-gradient": team?.gradient ?? team?.color }}
                                        initial={{ opacity: 0, x: side === "left" ? -160 : 160 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: side === "left" ? -120 : 120, transition: { duration: 0.28, ease: "easeIn" } }}
                                        transition={{ duration: 0.55, delay: 1.05, ease: EASE }}
                                    >
                                        <span className={css.gcc_in_tile}>
                                            <PemCircle team={team} className={css.gcc_in_circle} />
                                        </span>
                                        <span className={css.gcc_in_name}>
                                            <span className={css.name_prefix}>Team</span>
                                            {team?.name}
                                        </span>
                                    </motion.div>
                                );
                            })}
                            <motion.span
                                className={css.gcc_in_vs}
                                initial={{ opacity: 0, scale: 2.2 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.36, delay: 1.4, ease: [0.3, 1.5, 0.5, 1] }}
                            >
                                VS
                            </motion.span>
                        </div>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
