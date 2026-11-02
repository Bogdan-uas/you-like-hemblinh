// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowUp, FaArrowDown, FaAnglesUp, FaAnglesDown, FaArrowRight, FaCaretUp } from "react-icons/fa6";
import css from "./Skylines.module.css";
import { STREAK_MIN, streakTier } from "./pemHud.js";
import {
    SKYLINES_FLOOR_COUNT,
    SKYLINES_ROOF,
    SKYLINES_ROUND_COUNT,
    getSkylinesFloorName,
    getSkylinesTargetFloor,
} from "../../logic/skylines.jsx";

const isRoof = (s) => s.skylineRound === SKYLINES_ROOF;

const plateNumber = (s) => (isRoof(s) ? "RF" : s.skylineFloor === 1 ? "PH" : s.skylineFloor === SKYLINES_FLOOR_COUNT ? "G" : s.skylineFloor);

const plateCaption = (s) => (isRoof(s) ? "Rooftop" : s.skylineFloor === 1 ? "Penthouse" : s.skylineFloor === SKYLINES_FLOOR_COUNT ? "Ground" : "Floor");

export const SkylinePlate = ({ seriesState: s, size = 46, caption = false, className = "" }) => (
    <span
        className={`${css.plate} ${isRoof(s) || s.skylineFloor === 1 ? css.plate_gold : ""} ${className}`}
        style={{ fontSize: size }}
        aria-label={isRoof(s) ? "Rooftop" : getSkylinesFloorName(s.skylineFloor)}
    >
        <span className={css.plate_number}>{plateNumber(s)}</span>
        {caption ? <span className={css.plate_caption}>{plateCaption(s)}</span> : null}
    </span>
);

const ROOF_NEXT = { sf: ["Grand Final", "Third Place Decider"] };
const FLOOR_PLACES = { w: [0, 1], l: [2, 3] };

const getMove = (s, won) => {
    const stage = s.skylineStage;
    if (isRoof(s)) {
        const next = ROOF_NEXT[stage];
        return next ? { dir: "next", text: next[won ? 0 : 1] } : null;
    }
    if (stage === "o") return { dir: "next", text: won ? "Winners' Match" : "Losers' Match" };
    const places = FLOOR_PLACES[stage];
    if (!places) return null;
    const floor = s.skylineFloor;
    const target = getSkylinesTargetFloor(floor, places[won ? 0 : 1]);
    const lastRound = s.skylineRound === SKYLINES_ROUND_COUNT - 1;
    const delta = floor - target;
    if (lastRound && target === 1) return { dir: delta > 1 ? "up2" : "up", text: "Up to the Rooftop" };
    if (delta === 0) return { dir: "stay", text: `Stays on ${getSkylinesFloorName(floor)}` };
    const name = getSkylinesFloorName(target);
    return delta > 0
        ? { dir: delta > 1 ? "up2" : "up", text: `Up to ${name === "Penthouse" ? "the Penthouse" : name}` }
        : { dir: delta < -1 ? "down2" : "down", text: `Down to ${name === "Ground Floor" ? "the Ground Floor" : name}` };
};

const MOVE_ICONS = { up: FaArrowUp, up2: FaAnglesUp, down: FaArrowDown, down2: FaAnglesDown, next: FaArrowRight, stay: FaArrowRight };

const MoveChip = ({ side, move, team }) => {
    const Icon = MOVE_ICONS[move.dir];
    const tone = move.dir.startsWith("up") ? css.chip_up : move.dir.startsWith("down") ? css.chip_down : css.chip_next;
    return (
        <span className={`${css.chip} ${css[`chip_${side}`]} ${tone}`} style={{ "--team-color": team?.color ?? "#909090" }}>
            <span className={css.chip_car}>
                <Icon className={css.chip_icon} aria-hidden="true" />
            </span>
            <span className={css.chip_text}>{move.text}</span>
        </span>
    );
};

export const SkylineFloorFrame = ({ seriesState: s }) => {
    const roof = isRoof(s);
    const penthouse = !roof && s.skylineFloor === 1;
    const ground = !roof && s.skylineFloor === SKYLINES_FLOOR_COUNT;
    const winnerSide = s.banner && !s.banner.tie ? ((s.playerWonSets ?? 0) >= (s.playerLostSets ?? 0) ? "left" : "right") : null;

    return (
        <span className={`${css.frame} ${roof ? css.frame_roof : ""} ${penthouse ? css.frame_penthouse : ""} ${ground ? css.frame_ground : ""}`} aria-hidden="true">
            <span className={css.band} />
            {roof ? <span className={css.railing} /> : <span className={`${css.ledge} ${css.ledge_top}`} />}
            <span className={`${css.ledge} ${css.ledge_bottom}`} />
            {winnerSide
                ? ["left", "right"].map((side) => {
                    const move = getMove(s, side === winnerSide);
                    return move ? <MoveChip key={side} side={side} move={move} team={side === "left" ? s.leftTeam : s.rightTeam} /> : null;
                })
                : null}
        </span>
    );
};

export const SkylineStreak = ({ value = 0 }) => (
    <span className={css.lift_slot}>
        <AnimatePresence initial={false}>
            {(value ?? 0) >= STREAK_MIN ? (
                <motion.span
                    key="lift"
                    className={css.lift}
                    data-tier={streakTier(value)}
                    initial={{ opacity: 0, y: -10, scaleY: 0.4 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: 10, scaleY: 0.4, transition: { duration: 0.3, ease: "easeIn" } }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    aria-label={`Momentum streak: ${value}`}
                >
                    <span className={css.lift_arrows} aria-hidden="true">
                        <FaCaretUp className={css.lift_arrow} />
                        <FaCaretUp className={`${css.lift_arrow} ${css.lift_arrow_2}`} />
                    </span>
                    <span className={css.lift_window}>
                        <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                                key={value}
                                className={css.lift_value}
                                initial={{ y: "110%", opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: "-110%", opacity: 0 }}
                                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {String(value).padStart(2, "0")}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                </motion.span>
            ) : null}
        </AnimatePresence>
    </span>
);
