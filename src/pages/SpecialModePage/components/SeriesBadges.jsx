import { useLayoutEffect, useRef, useState } from "react";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaEye } from "react-icons/fa";
import { getLiveSetResult, getSetResultWinner } from "../logic/series.js";

export const SetBadge = ({ set, isDecider = false, size = 20, onColor = false, style }) =>
    isDecider ? (
        <span
            className={`${css.best_of_badge} ${css.decider_badge} ${onColor ? css.best_of_badge_on_color : ""}`}
            style={{ fontSize: size, ...style }}
        >
            <span className={css.decider_badge_text}>Decider</span>
        </span>
    ) : (
        <span
            className={`${css.best_of_badge} ${onColor ? css.best_of_badge_on_color : ""}`}
            style={{ fontSize: size, ...style }}
            aria-label={`Set ${set}`}
        >
            <span className={css.best_of_badge_label}>Set</span>
            <span style={{ marginTop: -2 }} className={`${css.best_of_badge_value} ${css.set_badge_value}`}>{set}</span>
        </span>
    );

const OVERTIME_TONES = [null, css.ot_level_1, css.ot_level_2, css.ot_level_3, css.ot_level_4, css.ot_level_5, css.ot_level_6, css.ot_level_7, css.ot_level_8, css.ot_level_9, css.ot_level_10];

export const OvertimeBadge = ({ label, level = 1, firstTo, size = 16, style }) => (
    <span className={`${css.best_of_badge} ${css.overtime_badge}`} style={{ fontSize: size, ...style }}>
        <span className={`${css.overtime_badge_label} ${OVERTIME_TONES[Math.min(Math.max(level, 1), 10)]}`}>{label}</span>
        <span className={css.overtime_badge_target}>
            First to <b>{firstTo}</b>
        </span>
    </span>
);

const scoreTone = (own, other) => (own > other ? css.set_chip_win : own < other ? css.set_chip_loss : "");

const SET_CHIP_TRANSITION = { duration: 0.45, ease: "easeInOut" };
const GHOST_RESULT = { leftScore: 24, rightScore: 24, extra: { label: "P", left: 10, right: 10 } };

const SetChipResult = ({ result }) => (
    <>
        <span className={css.set_chip_score}>
            <span className={scoreTone(result.leftScore, result.rightScore)}>{result.leftScore}</span>
            <span className={css.set_chip_colon}>:</span>
            <span className={scoreTone(result.rightScore, result.leftScore)}>{result.rightScore}</span>
        </span>
        {result.extra ? (
            <span className={css.set_chip_extra} title={result.extra.title}>
                {result.extra.label}
                <span className={scoreTone(result.extra.left, result.extra.right)}>{result.extra.left}</span>
                <span className={css.set_chip_colon}>:</span>
                <span className={scoreTone(result.extra.right, result.extra.left)}>{result.extra.right}</span>
            </span>
        ) : null}
    </>
);

export const SetHistoryChip = ({ set, isDecider, status, result, winnerColor, ghost = false, layoutAnimated = true }) => {
    const label = isDecider ? "DEC" : `S${set}`;
    const className = [
        css.set_chip,
        result ? css.set_chip_done : "",
        status === "current" ? css.set_chip_current : "",
        status === "selected" ? css.set_chip_selected : "",
        isDecider ? css.set_chip_decider : "",
    ].join(" ");

    if (ghost) {
        return (
            <span className={`${css.set_chip} ${css.set_chip_done}`}>
                <span className={css.set_chip_label}>{label}</span>
                <span className={css.set_chip_result}>
                    <SetChipResult result={GHOST_RESULT} />
                </span>
            </span>
        );
    }

    return (
        <motion.span
            layout={layoutAnimated ? "position" : false}
            transition={{ layout: SET_CHIP_TRANSITION }}
            className={className}
            style={{ "--set-chip-accent": winnerColor ?? "transparent", opacity: status === "uncertain" ? 0.4 : 1 }}
            title={isDecider ? "Decider" : `Set ${set}`}
        >
            <span className={css.set_chip_label}>
                <AnimatePresence initial={false}>
                    {status === "selected" ? (
                        <motion.span
                            key="eye"
                            className={css.set_chip_eye}
                            initial={{ width: 0, opacity: 0, scale: 0.4 }}
                            animate={{ width: 13, opacity: 1, scale: 1 }}
                            exit={{ width: 0, opacity: 0, scale: 0.4 }}
                            transition={SET_CHIP_TRANSITION}
                        >
                            <FaEye />
                        </motion.span>
                    ) : null}
                </AnimatePresence>
                {label}
            </span>
            <AnimatePresence initial={false}>
                {result ? (
                    <motion.span
                        key="result"
                        className={css.set_chip_result}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={SET_CHIP_TRANSITION}
                    >
                        <SetChipResult result={result} />
                    </motion.span>
                ) : null}
            </AnimatePresence>
        </motion.span>
    );
};

const toChipResult = (finished) => {
    const winner = getSetResultWinner(finished);
    return {
        winner,
        result: {
            leftScore: finished.leftScore,
            rightScore: finished.rightScore,
            extra: finished.penaltiesPlayed
                ? { label: "P", title: "Penalties", left: finished.penaltyLeftScore, right: finished.penaltyRightScore }
                : finished.extendedRoundsPlayed
                    ? { label: "ER", title: "Extended Rounds", left: finished.extendedRoundLeftScore, right: finished.extendedRoundRightScore }
                    : null,
        },
    };
};

export const SetPicker = ({ sets, totalSets, selectedIndex, onSelect }) => {
    const buttonsRef = useRef([]);
    const [ring, setRing] = useState(null);

    useLayoutEffect(() => {
        const node = buttonsRef.current[selectedIndex];
        if (!node) return undefined;
        const measure = () => setRing({ left: node.offsetLeft, top: node.offsetTop, width: node.offsetWidth, height: node.offsetHeight });
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    }, [selectedIndex, sets.length]);

    return (
        <div className={css.set_picker}>
            {sets.map((item, i) => {
                const selected = i === selectedIndex;
                return (
                    <button
                        key={item.set}
                        ref={(node) => { buttonsRef.current[i] = node; }}
                        type="button"
                        className={css.set_picker_button}
                        disabled={selected}
                        onClick={() => onSelect(i)}
                        aria-pressed={selected}
                        title={`Show ${item.set === totalSets ? "the Decider" : `Set ${item.set}`}`}
                    >
                        <SetHistoryChip
                            set={item.set}
                            isDecider={item.set === totalSets}
                            status={selected ? "selected" : "done"}
                            result={item.result}
                            winnerColor={item.winnerColor}
                            layoutAnimated={false}
                        />
                    </button>
                );
            })}
            {ring ? (
                <motion.span
                    className={css.set_picker_ring}
                    initial={false}
                    animate={{ x: ring.left - 3, y: ring.top - 3, width: ring.width + 6, height: ring.height + 6 }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
            ) : null}
        </div>
    );
};

export const SetHistory = ({ seriesState }) => {
    const { setsToWin, setNumber, finishedSets = [], playerWonSets = 0, playerLostSets = 0, leftTeam, rightTeam, banner } = seriesState;
    const totalSets = setsToWin * 2 - 1;
    const live = getLiveSetResult(seriesState);
    const results = live ? [...finishedSets, live] : finishedSets;
    const seriesOver = !!banner || Math.max(playerWonSets, playerLostSets) >= setsToWin;
    const decided = playerWonSets + playerLostSets;
    const certainUpTo = seriesOver ? results.length : Math.max(setNumber, decided + setsToWin - Math.max(playerWonSets, playerLostSets));
    const sets = Array.from({ length: totalSets }, (_, i) => i + 1);

    return (
        <div className={css.set_history}>
            <div className={css.set_history_layer} aria-hidden="true" style={{ visibility: "hidden" }}>
                {sets.map((set) => (
                    <SetHistoryChip key={set} set={set} isDecider={set === totalSets} ghost />
                ))}
            </div>
            <div className={css.set_history_layer}>
                {sets.map((set) => {
                    const finished = results.find((r) => r.set === set);
                    const chip = finished ? toChipResult(finished) : null;
                    const status = chip
                        ? "done"
                        : !seriesOver && !live && set === setNumber
                            ? "current"
                            : set <= certainUpTo
                                ? "certain"
                                : "uncertain";
                    return (
                        <SetHistoryChip
                            key={set}
                            set={set}
                            isDecider={set === totalSets}
                            status={status}
                            result={chip?.result ?? null}
                            winnerColor={chip ? (chip.winner === "left" ? leftTeam?.color : chip.winner === "right" ? rightTeam?.color : "#999") : null}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export const PenaltyBadge = ({ attempt, suddenDeath = false, size = 16, style }) => (
    <span className={css.best_of_badge} style={{ fontSize: size, ...style }}>
        <span className={`${css.overtime_badge_label} ${suddenDeath ? css.penalty_badge_sudden : css.penalty_badge_label}`}>
            {suddenDeath ? "Sudden Death" : "Penalty Series"}
        </span>
        <span className={css.overtime_badge_target}>
            Attempt <b>{attempt}</b>
        </span>
    </span>
);

export const RoundBadge = ({ children, size = 14, style, label = "Round", reversed = false }) => (
    <span
        className={`${css.best_of_badge} ${css.round_badge} ${reversed ? css.round_badge_reversed : ""}`}
        style={{ fontSize: size, flexDirection: reversed ? "row-reverse" : undefined, ...style }}
    >
        <span className={css.round_badge_label}>{label}</span>
        <span style={{ marginTop: -1 }} className={css.round_badge_value}>{children}</span>
    </span>
);
