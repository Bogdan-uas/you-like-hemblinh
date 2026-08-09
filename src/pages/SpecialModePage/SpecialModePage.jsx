import React, { useMemo, useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import css from "./SpecialModePage.module.css";
import Header from "../../components/Header/Header.jsx";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FaTrophy } from "react-icons/fa";
import { MdOutlineKeyboardDoubleArrowUp, MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import {
    FaCircleCheck,
    FaCircleInfo,
    FaCheck,
    FaXmark,
    FaCircle
} from "react-icons/fa6";
import { ReactFitty } from "react-fitty";
import "odometer/themes/odometer-theme-default.css";
import Odometer from 'react-odometerjs';
import { SERIES_ACTIONS } from "../../../assets/constants.js";
import GradientCaretLeft from "../../components/GradientIcon/GradientCaretLeft.jsx";
import GradientCaretRight from "../../components/GradientIcon/GradientCaretRight.jsx";
import GradientDiamond from "../../components/GradientIcon/GradientDiamond.jsx";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const SCOREBOARD_RESET_CODE = import.meta.env.VITE_SCOREBOARD_RESET_CODE;

const STORAGE_KEY = "specialPageState_swiss_v2";
const TEAM_RATINGS_LS_KEY = "specialMode_teamRatings_v1";
const ROUND_LOG_LS_KEY = "specialMode_currentRoundLog_v1";
const TEAM_RATINGS_SNAPSHOT_LS_KEY = "specialMode_teamRatings_snapshot_v1";
const TEAM_PLACINGS_LS_KEY = "specialMode_teamPlacings_v1";
const TOURNAMENT_NUMBER_LS_KEY = "specialMode_tournamentNumber_v1";
const BREAKDOWN_HIDDEN_LS_KEY = "specialMode_breakdownModalHidden_v1";

const ROUND12_TOAST_ID = "round12-warning";
const SECRET_TOAST_ID = "secret-toast";
const SECRET_NUM_TWO_TOAST_ID = "secret-toast-num-two";
const SECRET_NUM_THREE_TOAST_ID = "secret-toast-num-three";

const BASE_MAX_ROUNDS = 24;
const BASE_ROUNDS_TO_WIN = 13;
const OT_ROUNDS_TO_WIN = 4;

const OT_MAX_BLOCK = 4;
const EXT_ROUND_LABELS = [
    "1st Half",
    "2nd Half",
    "OT",
    "Double OT",
    "Triple OT",
    "Quadruple OT",
];

const EXT_ROUND_REVEAL_MS = 3000;
const EXT_ROUND_COMMENTARY_DELAY_MS = 3000;
const EXT_ROUND_FINAL_COMPARE_MS = 3000;
const PENALTY_DISPLAY_CIRCLES = 6;

const AnimatedCheckIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "white" }}
        {...props}
    >
        <path
            d="M20 6L9 17l-5-5"
            style={{
                strokeDasharray: 24,
                strokeDashoffset: 24,
                animation: "penaltyCheckmark 0.5s ease forwards",
            }}
        />
        <style>{`@keyframes penaltyCheckmark { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
);

const AnimatedCrossIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "white" }}
        {...props}
    >
        <line
            x1="18" y1="6" x2="6" y2="18"
            style={{
                strokeDasharray: 24,
                strokeDashoffset: 24,
                animation: "penaltyCrossmark 0.5s ease forwards",
            }}
        />
        <line
            x1="6" y1="6" x2="18" y2="18"
            style={{
                strokeDasharray: 24,
                strokeDashoffset: 24,
                animation: "penaltyCrossmark 0.4s ease forwards",
                animationDelay: "0.2s",
            }}
        />
        <style>{`@keyframes penaltyCrossmark { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
);

const MULTIPLIER_MIN = -2.0;
const MULTIPLIER_MAX = 2.0;

const MIN_NEEDED_PICKEM = 351;
const MAX_NEEDED_PICKEM = 576;
const getRandomNeededPickemPoints = () =>
    Math.floor(Math.random() * (MAX_NEEDED_PICKEM - MIN_NEEDED_PICKEM + 1)) +
    MIN_NEEDED_PICKEM;

const hexToRgb = (hex) => {
    const clean = hex.replace("#", "");
    const noAlpha = clean.length === 8 ? clean.slice(0, 6) : clean;
    const full =
        noAlpha.length === 3
            ? noAlpha
                .split("")
                .map((c) => c + c)
                .join("")
            : noAlpha;

    const num = parseInt(full, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const clamp = (n) => Math.max(0, Math.min(255, n));

const lightenHex = (hex, amount = 0.18) => {
    const { r, g, b } = hexToRgb(hex);

    return `#${[
        clamp(Math.round(r + (255 - r) * amount)),
        clamp(Math.round(g + (255 - g) * amount)),
        clamp(Math.round(b + (255 - b) * amount)),
    ]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}`;
};

const getBrightness = (hex) => {
    const { r, g, b } = hexToRgb(hex);

    return (r * 299 + g * 587 + b * 114) / 1000;
};

const darkenHex = (hex, amount = 0.68) => {
    const { r, g, b } = hexToRgb(hex);
    const dr = clamp(Math.round(r * (1 - amount)));
    const dg = clamp(Math.round(g * (1 - amount)));
    const db = clamp(Math.round(b * (1 - amount)));
    return `#${[dr, dg, db]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}`;
};

const makeColor = (
    hex,
    name,
    {
        shadowAlpha = 0.55,
        unlitAmount = 0.7,
        hoverAmount = 0.5,
    } = {}
) => {
    const normalized = hex.toUpperCase();

    if (normalized === "#000000") {
        return {
            shadow: `0 0 10px rgba(0,0,0,${shadowAlpha})`,
            color: "#000000",

            gradient:
                "linear-gradient(180deg,#565656 0%,#1C1C1C 45%,#000000 100%)",

            hoverOn: "#2A2A2A",

            unlitColor: "#5D5D5D",

            unlitGradient:
                "linear-gradient(180deg,#707070 0%,#5D5D5D 45%,#454545 100%)",

            name,
        };
    }

    if (normalized === "#E6E6E6" || normalized === "#E6E6E6FF") {
        return {
            shadow: `0 0 10px rgba(150,150,150,0.35)`,

            color: "#E6E6E6",

            gradient:
                "linear-gradient(180deg,#FFFFFF 0%,#ECECEC 45%,#BEBEBE 100%)",

            hoverOn: "#C8C8C8",

            unlitColor: "#5D5D5D",

            unlitGradient:
                "linear-gradient(180deg,#777777 0%,#5D5D5D 45%,#474747 100%)",

            name,
        };
    }

    const { r, g, b } = hexToRgb(hex);

    const brightness = getBrightness(hex);

    const isBright = brightness > 210;

    const lighter = isBright
        ? hex
        : lightenHex(hex, 0.18);

    const darker = darkenHex(
        hex,
        isBright ? 0.22 : 0.35
    );

    const unlit = darkenHex(hex, unlitAmount);

    const unlitGradient = `linear-gradient(
        180deg,
        ${lightenHex(unlit, 0.24)} 0%,
        ${unlit} 45%,
        ${darkenHex(unlit, 0.24)} 100%
    )`;

    return {
        shadow: `0 0 10px rgba(${r}, ${g}, ${b}, ${shadowAlpha})`,

        color: hex,

        gradient: `linear-gradient(
            180deg,
            ${lighter} 0%,
            ${hex} 45%,
            ${darker} 100%
        )`,

        hoverOn: darkenHex(hex, hoverAmount),

        unlitColor: unlit,

        unlitGradient,

        name,
    };
};

const COLORS = {
    red: makeColor("#FF0000", "Red"),
    lime: makeColor("#32CD32", "Lime"),
    yellow: makeColor("#FFFF00", "Yellow"),
    blue: makeColor("#0000FF", "Blue"),
    green: makeColor("#008000", "Green"),
    beige: makeColor("#FFC0CB", "Beige"),
    orange: makeColor("#FF7F00", "Orange"),
    brown: makeColor("#7F3900", "Brown"),
    cyan: makeColor("#00FFFF", "Cyan"),
    indigo: makeColor("#4A007F", "Indigo"),
    violet: makeColor("#8A2BE2", "Violet"),
    pink: makeColor("#FF1493", "Pink"),
    black: makeColor("#000000", "Black", { unlitAmount: 0.35 }),
    white: makeColor("#e6e6e6ff", "White", { unlitAmount: 0.35 }),
    gray: makeColor("#808080", "Gray"),
    teal: makeColor("#006D6F", "Teal"),


    gold: makeColor("#D4AF37", "Gold"),
    silver: makeColor("#C0C0C0", "Silver", { shadowAlpha: 0.35 }),

    navy: makeColor("#3A4DFF", "Navy"),
    olive: makeColor("#808000", "Olive"),
    coral: makeColor("#FF6F61", "Coral"),
    magenta: makeColor("#D81BFF", "Magenta"),

    lavender: makeColor("#B388FF", "Lavender"),
    sky: makeColor("#4FC3F7", "Sky"),
    mint: makeColor("#69F0AE", "Mint"),
    salmon: makeColor("#FF8A80", "Salmon"),

    plum: makeColor("#6A1B9A", "Plum"),
    khaki: makeColor("#C2B280", "Khaki"),
    crimson: makeColor("#DC143C", "Crimson"),
    turquoise: makeColor("#00E5FF", "Turquoise"),

    chartreuse: makeColor("#76FF03", "Chartreuse"),
    steel: makeColor("#607D8B", "Steel"),


    emerald: makeColor("#00C853", "Emerald"),
    ruby: makeColor("#C2185B", "Ruby"),

    sapphire: makeColor("#0D47A1", "Sapphire"),
    amber: makeColor("#FFB300", "Amber"),
    bronze: makeColor("#B87333", "Bronze"),
    copper: makeColor("#C46A1A", "Copper"),

    sand: makeColor("#E6A15A", "Sand"),
    seafoam: makeColor("#4DD0E1", "Seafoam"),
    forest: makeColor("#1B5E20", "Forest"),
    midnight: makeColor("#1A237E", "Midnight"),

    peach: makeColor("#FFCCBC", "Peach", { shadowAlpha: 0.35 }),
    apricot: makeColor("#FFB48F", "Apricot"),
    periwinkle: makeColor("#7E8CE0", "Periwinkle"),
    sunflower: makeColor("#FFD000", "Sunflower"),

    raspberry: makeColor("#D81B60", "Raspberry"),
    chocolate: makeColor("#4E2A14", "Chocolate"),
    ivory: makeColor("#FFF6D6", "Ivory", { shadowAlpha: 0.25, unlitAmount: 0.8 }),
    charcoal: makeColor("#37474F", "Charcoal"),

    denim: makeColor("#1565C0", "Denim"),
    spring: makeColor("#00E676", "Spring"),
    ocean: makeColor("#006064", "Ocean"),
    lilac: makeColor("#CE93D8", "Lilac"),

    rose: makeColor("#FF5CA8", "Rose"),
    frost: makeColor("#E3F2FD", "Frost", { shadowAlpha: 0.25, unlitAmount: 0.8 }),
    slate: makeColor("#546E7A", "Slate"),
    moss: makeColor("#8A9A5B", "Moss"),

    wine: makeColor("#6D1B2D", "Wine"),
    honey: makeColor("#F4C430", "Honey"),
    azure: makeColor("#00A3FF", "Azure"),
    blush: makeColor("#FF8FB1", "Blush", { shadowAlpha: 0.35 }),

    jade: makeColor("#00A86B", "Jade"),
    royal: makeColor("#5B5BE6", "Royal"),
};

const PenaltyCircles = ({
    results,
    team,
    attemptsToDisplay,
    resolved,
    compact = false,
    shouldHaveMargin = true,
}) => {
    const total = attemptsToDisplay;

    const circleSize = compact ? 11 : 22;
    const iconSize = compact ? 7 : 14;
    const gap = compact ? 3 : 6;
    const suddenGap = compact ? 12 : 24;
    const borderWidth = compact ? 1 : 2;
    const marginTop = compact || !shouldHaveMargin ? 0 : 6;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                flexDirection: team === "left" ? "row-reverse" : "row",
                gap,
                marginTop: marginTop,
            }}
        >
            {Array.from({ length: total }).map((_, i) => {
                const r = results[i];
                const isSuddenDeath = i === 5;
                const filled = r === "success";
                const missed = r === "fail";
                const shouldHide =
                    resolved &&
                    i >= results.length &&
                    i >= PENALTY_DISPLAY_CIRCLES;

                if (shouldHide) {
                    return null;
                }
                return (
                    <div
                        key={i}
                        style={{
                            marginLeft: isSuddenDeath && team === "left" ? 0 : isSuddenDeath ? suddenGap : 0,
                            marginRight: isSuddenDeath && team === "left" ? suddenGap : 0,
                            width: circleSize,
                            height: circleSize,
                            borderRadius: "50%",
                            border:
                                r
                                    ? "none"
                                    : `${borderWidth}px dashed #828282`,
                            backgroundImage: filled
                                ? `linear-gradient(
                                    180deg,
                                    ${lightenHex("#54CC54", 0.18)} 0%,
                                    #54CC54 45%,
                                    ${darkenHex("#54CC54", 0.35)} 100%
                                )`
                                : missed
                                    ? `linear-gradient(
                                        180deg,
                                        ${lightenHex("#983333", 0.18)} 0%,
                                        #983333 45%,
                                        ${darkenHex("#983333", 0.35)} 100%
                                    )`
                                    : "none",

                            backgroundColor:
                                filled || missed
                                    ? "transparent"
                                    : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.25s ease",
                        }}
                    >
                        {filled &&
                            <AnimatedCheckIcon
                                width={iconSize}
                                height={iconSize}
                            />
                        }
                        {missed &&
                            <AnimatedCrossIcon
                                width={iconSize}
                                height={iconSize}
                            />
                        }
                    </div>
                );
            })}
        </div>
    );
};

const clampMin0 = (n) => Math.max(0, Number.isFinite(n) ? n : 0);

const buildDefaultTeamRatings = (teams) => {
    const out = {};
    teams.forEach((t, idx) => {
        if (idx < 16) out[t.id] = 1150;
        else if (idx < 32) out[t.id] = 1100;
        else out[t.id] = 1050;
    });
    return out;
};

const loadTeamRatings = (teams) => {
    try {
        const raw = localStorage.getItem(TEAM_RATINGS_LS_KEY);
        if (!raw) return buildDefaultTeamRatings(teams);
        const parsed = JSON.parse(raw);
        const out = buildDefaultTeamRatings(teams);
        teams.forEach((t) => {
            const v = parsed?.[t.id];
            if (typeof v === "number" && Number.isFinite(v)) out[t.id] = clampMin0(v);
        });
        return out;
    } catch {
        return buildDefaultTeamRatings(teams);
    }
};

const loadTournamentNumber = () => {
    try {
        const raw = localStorage.getItem(TOURNAMENT_NUMBER_LS_KEY);
        if (raw === null) return 0;

        const parsed = parseInt(raw, 10);
        return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    } catch {
        return 0;
    }
};

const saveTournamentNumber = (value) => {
    try {
        localStorage.setItem(TOURNAMENT_NUMBER_LS_KEY, String(value));
    } catch {
        console.error("Couldn't save the tournament number")
    }
};

const saveTeamRatings = (ratings) => {
    try {
        localStorage.setItem(TEAM_RATINGS_LS_KEY, JSON.stringify(ratings));
    } catch {
        console.error("Couldn't save teams' ratings")
    }
};

const saveRatingsSnapshot = (ratings) => {
    try {
        localStorage.setItem(TEAM_RATINGS_SNAPSHOT_LS_KEY, JSON.stringify(ratings));
    } catch {
        console.error("Couldn't set teams' snapshot")
    }
};

const loadRatingsSnapshot = () => {
    try {
        const raw = localStorage.getItem(TEAM_RATINGS_SNAPSHOT_LS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const clearRatingsSnapshot = () => {
    try {
        localStorage.removeItem(TEAM_RATINGS_SNAPSHOT_LS_KEY);
    } catch {
        console.error("Couldn't remove teams' snapshot")
    }
};

const buildLeaderboard = (teams, ratings) => {
    const baseIndexById = {};
    teams.forEach((t, i) => (baseIndexById[t.id] = i));

    const sorted = [...teams].sort((a, b) => {
        const pa = ratings?.[a.id] ?? 0;
        const pb = ratings?.[b.id] ?? 0;
        if (pb !== pa) return pb - pa;
        return (baseIndexById[a.id] ?? 0) - (baseIndexById[b.id] ?? 0);
    });

    const rankById = {};
    sorted.forEach((t, i) => (rankById[t.id] = i + 1));

    return { sorted, rankById, baseIndexById };
};

const classifyTeamsForStages = (teams, ratings) => {
    const { sorted } = buildLeaderboard(teams, ratings);
    return {
        stage3Seeds: sorted.slice(0, 16).map((t) => ({ ...t })),
        stage2Seeds: sorted.slice(16, 32).map((t) => ({ ...t })),
        stage1Seeds: sorted.slice(32).map((t) => ({ ...t })),
    };
};

const formatOrdinal = (n) => {
    const v = n % 100;
    if (v >= 11 && v <= 13) return `${n}th`;
    switch (n % 10) {
        case 1: return `${n}st`;
        case 2: return `${n}nd`;
        case 3: return `${n}rd`;
        default: return `${n}th`;
    }
};

const BASE_RATING = 1000;

const areRatingsAtDefault = (teams, ratings) => {
    const def = buildDefaultTeamRatings(teams);
    return teams.every((t) => (ratings?.[t.id] ?? 0) === def[t.id]);
};

const expectedScore = (ratingA, ratingB) => {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

const marginMultiplier = ({ bestOf, loserSetsWon }) => {
    if (bestOf === 1) return 1.0;

    const setsToWin = Math.ceil(bestOf / 2);
    const diff = Math.max(0, setsToWin - (loserSetsWon ?? 0));
    return 1.0 + Math.min(0.10, diff * 0.04);
};

const upsetMultiplier = (expectedWinner) => {
    const bonus = 1.0 + Math.max(0, 0.5 - expectedWinner) * 0.8;
    return Math.min(1.30, bonus);
};

const ratingGapDamp = (ratingA, ratingB) => {
    const gap = Math.abs((ratingA ?? 0) - (ratingB ?? 0));
    return 1 / (1 + gap / 600);
};

const matchImportance = ({ phase, swissStageKey, playoffsStage, bestOf, loserSetsWon }) => {
    const stage =
        phase === "swiss"
            ? swissStageWeight(swissStageKey)
            : playoffsWeight(playoffsStage);

    return stage * boWeight(bestOf) * marginMultiplier({ bestOf, loserSetsWon });
};

const RECENCY_HALF_LIFE_DAYS = 120;
const dayMs = 24 * 60 * 60 * 1000;

const recencyWeight = (playedAtMs, nowMs = Date.now()) => {
    if (!playedAtMs) return 1.0;
    const ageDays = Math.max(0, (nowMs - playedAtMs) / dayMs);
    return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
};

const swissStageWeight = (swissStageKey) => {
    if (swissStageKey === "stage1") return 1.0;
    if (swissStageKey === "stage2") return 1.25;
    if (swissStageKey === "stage3") return 1.5;
    return 1.0;
};

const playoffsWeight = (playoffsStage) => {
    if (playoffsStage === "ro16") return 1.75;
    if (playoffsStage === "qf") return 2.5;
    if (playoffsStage === "sf") return 3.0;
    if (playoffsStage === "thirdPlace") return 3.25;
    if (playoffsStage === "gf") return 5.0;
    return 1.0;
};

const boWeight = (bestOf) => {
    if (bestOf <= 1) return 1.0;
    if (bestOf <= 3) return 1.25;
    if (bestOf <= 5) return 1.5;
    if (bestOf <= 7) return 2.0;
    return 3.0;
};

const computeRsDeltas = ({
    ratings,
    winnerId,
    loserId,
    phase,
    swissStageKey,
    playoffsStage,
    bestOf,
    loserSetsWon,
    playedAtMs,
}) => {
    const rW = ratings?.[winnerId] ?? 0;
    const rL = ratings?.[loserId] ?? 0;

    const eW = expectedScore(rW, rL);

    const K_BASE = 20;

    const imp = matchImportance({ phase, swissStageKey, playoffsStage, bestOf, loserSetsWon });
    const rec = recencyWeight(playedAtMs);
    const upset = upsetMultiplier(eW);
    const damp = ratingGapDamp(rW, rL);

    const K = K_BASE * imp * rec * upset * damp;

    const rawWinGain = K * (1 - eW);
    return { rawWinGain, eW, K, imp, upset, damp };
};

const lossScaleFromExpectedWinner = (eW) => {
    if (eW >= 0.5) {
        return 0.56 - 0.16 * eW;
    }
    return 0.72 - 0.20 * eW;
};

const applyRatings = ({
    ratings,
    teams,
    winnerId,
    loserId,
    phase,
    swissStageKey,
    swissNet,
    playoffsStage,
    bestOf,
    loserSetsWon,
    playedAtMs,
}) => {
    const beforeLb = buildLeaderboard(teams, ratings);
    const beforeRankW = beforeLb.rankById[winnerId] ?? null;
    const beforeRankL = beforeLb.rankById[loserId] ?? null;

    const next = { ...ratings };
    const beforePointsW = next[winnerId] ?? 0;
    const beforePointsL = next[loserId] ?? 0;

    const { rawWinGain, eW } = computeRsDeltas({
        ratings: next,
        winnerId,
        loserId,
        phase,
        swissStageKey,
        playoffsStage,
        bestOf,
        loserSetsWon,
        playedAtMs,
    });

    const MAX_WIN_POINTS = 165;
    const winPoints = Math.max(1, Math.min(MAX_WIN_POINTS, Math.round(rawWinGain)));
    const lossScale = lossScaleFromExpectedWinner(eW);

    let losePoints = Math.max(
        1,
        Math.min(
            winPoints - 1,
            Math.round(winPoints * lossScale * 1.1)
        )
    );

    if (phase === "playoffs" && playoffsStage === "gf") {
        losePoints = Math.round(winPoints * 0.2);
    }

    next[winnerId] = clampMin0(beforePointsW + winPoints);
    next[loserId] = clampMin0(beforePointsL - losePoints);

    const afterLb = buildLeaderboard(teams, next);
    const afterRankW = afterLb.rankById[winnerId] ?? null;
    const afterRankL = afterLb.rankById[loserId] ?? null;

    return {
        nextRatings: next,
        meta: {
            winnerId,
            loserId,
            winPoints,
            losePoints,
            debug: {
                phase,
                swissStageKey,
                swissNet,
                playoffsStage,
                bestOf,
                loserSetsWon,
                playedAtMs: playedAtMs ?? null,
                expectedWinner: eW,
                lossScale,
                gfNoLossApplied: phase === "playoffs" && playoffsStage === "gf",
            },
            before: {
                [winnerId]: { points: beforePointsW, rank: beforeRankW },
                [loserId]: { points: beforePointsL, rank: beforeRankL },
            },
            after: {
                [winnerId]: { points: next[winnerId], rank: afterRankW },
                [loserId]: { points: next[loserId], rank: afterRankL },
            },
        },
    };
};

const toBaseTeam = (t) => ({
    id: t.id,
    key: t.key,
    name: t.name,

    color: t.color,
    gradient: t.gradient,

    hoverOn: t.hoverOn,

    unlitColor: t.unlitColor,
    unlitGradient: t.unlitGradient,

    shadow: t.shadow,
});

const uniqById = (teams) => {
    const map = new Map();
    teams.forEach((t) => {
        const base = toBaseTeam(t);
        if (!map.has(base.id)) map.set(base.id, base);
    });
    return [...map.values()];
};

const getAllTeams64 = () => {
    const entries = Object.entries(COLORS);

    return entries.map(([key, val], idx) => ({
        id: String(idx + 1),

        key,
        name: val.name,

        color: val.color,
        gradient: val.gradient,

        hoverOn: val.hoverOn,

        unlitColor: val.unlitColor,
        unlitGradient: val.unlitGradient,

        shadow: val.shadow,
    }));
};

const SWISS_COLUMNS = [
    ["0:0"],
    ["1:0", "0:1"],
    ["2:0", "1:1", "0:2"],
    ["2:1", "1:2"],
    ["2:2"],
];

const isBo1Net = (net) =>
    net === "0:0" ||
    net === "1:0" ||
    net === "0:1" ||
    net === "1:1";

const isProgressionOrEliminationNet = (net) =>
    net === "2:0" ||
    net === "0:2" ||
    net === "2:1" ||
    net === "1:2" ||
    net === "2:2";

const getBestOfForSwissNet = (net, stageKey) => {
    if (stageKey === "stage3") {
        return isProgressionOrEliminationNet(net) ? 5 : 3;
    }

    return isBo1Net(net) ? 1 : 3;
};

const calcSetsToWin = (bestOf) => Math.ceil(bestOf / 2);

const swissNetTitle = (net) => {
    if (net === "0:0") return "Match of 0:0 net";
    if (net === "1:0") return "Match of 1:0 net";
    if (net === "0:1") return "Match of 0:1 net";
    if (net === "2:0") return "2:0 net — Progression Match";
    if (net === "1:1") return "Match of 1:1 net";
    if (net === "0:2") return "0:2 net — Elimination Match";
    if (net === "2:1") return "2:1 net — Progression Match";
    if (net === "1:2") return "1:2 net — Elimination Match";
    if (net === "2:2") return "2:2 net — Deciding Match";
    return "Match";
};

const BOX_SLOTS = {
    "3:0": 4,
    "3:1": 6,
    "3:2": 6,
    "0:3": 4,
    "1:3": 6,
    "2:3": 6,
};

const makeSwissTeam = (t) => ({
    ...t,
    seed: 0,
    buchholz: 0,
    opponents: [],
    wins: 0,
    losses: 0,
    qualified: false,
    eliminated: false,

    qualifiedAt: null,
    qualifiedVia: null,
    eliminatedAt: null,
    eliminatedVia: null,
});

const shuffleMatches = (matches) => {
    for (let i = matches.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [matches[i], matches[j]] = [matches[j], matches[i]];
    }

    matches.forEach((m, i) => {
        m.matchNoInNet = i + 1;
    });
};

const buildNetMatches = (teams, stageKey, net) => {
    const [wStr, lStr] = net.split(":");
    const w = Number(wStr);
    const l = Number(lStr);

    const eligible = teams.filter(
        (t) => !t.qualified && !t.eliminated && t.wins === w && t.losses === l
    );

    const sorted = [...eligible].sort((a, b) => {
        if (b.buchholz !== a.buchholz) {
            return b.buchholz - a.buchholz;
        }

        return a.seed - b.seed;
    });

    const ordered = [...sorted];

    const matches = [];

    for (let i = 0; i < sorted.length; i += 2) {
        matches.push({
            id: `${stageKey}-${net}-${i / 2 + 1}`,
            stageKey,
            net,
            matchNoInNet: i / 2 + 1,

            slotA: null,
            slotB: null,

            played: false,
            scoreLeft: null,
            scoreRight: null,
            winnerTeamId: null,
            loserTeamId: null,

            pickTeamId: null,
            setHistory: [],
        });
    }

    let idx = 0;

    while (ordered.length >= 2) {
        const high = ordered.shift();

        let opponentIndex = ordered.findLastIndex(
            (t) => !high.opponents.includes(t.id)
        );

        if (opponentIndex === -1) {
            opponentIndex = ordered.length - 1;
        }

        const low = ordered.splice(opponentIndex, 1)[0];

        matches[idx].slotA = high;
        matches[idx].slotB = low;

        idx++;
    }

    shuffleMatches(matches);

    return matches;
};

const buildSwissStage = (stageKey, teams) => {
    const stageTeams = teams.map((t, i) =>
        makeSwissTeam(t, i + 1)
    );
    return {
        stageKey,
        teams: stageTeams,
        matchesByNet: {
            "0:0": buildNetMatches(stageTeams, stageKey, "0:0"),
        },
        resultCounter: 0,
    };
};

const isNetFinished = (stage, net) => {
    const arr = stage.matchesByNet[net];
    if (!arr) return false;
    return arr.every((m) => m.played);
};

const canBuildColumn = (stage, colIndex) => {
    if (colIndex === 0) return true;
    const prevCol = SWISS_COLUMNS[colIndex - 1];
    return prevCol.every((net) => isNetFinished(stage, net));
};

const isNetUnlocked = (stage, net) => {
    const colIndex = SWISS_COLUMNS.findIndex((col) => col.includes(net));
    if (colIndex < 0) return false;
    return canBuildColumn(stage, colIndex);
};

const tryBuildUnlockedNets = (stage) => {
    SWISS_COLUMNS.forEach((nets, colIndex) => {
        if (!canBuildColumn(stage, colIndex)) return;
        nets.forEach((net) => {
            if (!stage.matchesByNet[net]) {
                stage.matchesByNet[net] = buildNetMatches(stage.teams, stage.stageKey, net);
            }
        });
    });
};

const isSwissStageFinished = (stage) =>
    stage.teams.every((t) => t.qualified || t.eliminated);

const getSwissQualified = (stage) => stage.teams.filter((t) => t.qualified);

const teamsInNet = (stage, net) => {
    const [wStr, lStr] = net.split(":");
    const w = Number(wStr);
    const l = Number(lStr);
    return stage.teams.filter((t) => !t.qualified && !t.eliminated && t.wins === w && t.losses === l);
};

function makeColorSequence(baseColors, repeats = 12) {
    const base = baseColors;
    const out = [];
    let prev = null;

    for (let r = 0; r < repeats; r++) {
        const pool = [...base];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        if (prev && pool[0]?.color === prev) {
            pool.push(pool.shift());
        }

        pool.forEach((c) => out.push(c));
        prev = out[out.length - 1]?.color ?? prev;
    }

    return out;
}

const ALWAYS_COLOR_KEYS = ["red", "yellow", "lime", "blue", "green", "brown", "beige", "orange"];
const TOURNAMENT_COLOR_COUNT = 32;

const buildTournamentColorPool = () => {
    const entries = Object.entries(COLORS);

    const always = [];
    const others = [];

    for (const [key, val] of entries) {
        if (ALWAYS_COLOR_KEYS.includes(key)) {
            always.push([key, val]);
        } else {
            others.push([key, val]);
        }
    }

    const neededFromOthers = Math.max(
        0,
        TOURNAMENT_COLOR_COUNT - always.length
    );

    const selected = [];
    const pool = [...others];

    while (selected.length < neededFromOthers && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool[idx]);
        pool.splice(idx, 1);
    }

    return [...always, ...selected];
};

const stageLabelPlayoffs = (stage) => {
    switch (stage) {
        case "ro16": return "Round of 16";
        case "qf": return "Quarterfinal";
        case "sf": return "Semifinal";
        case "thirdPlace": return "Third Place Decider";
        case "gf": return "Grand Final";
        default: return "";
    }
};

const getBestOfForPlayoffs = (stage) => {
    if (stage === "gf") return 9;
    if (stage === "sf") return 7;
    if (stage === "thirdPlace") return 7;
    return 5;
};

const qualificationValue = (team) => {
    const [w, l] =
        team.qualifiedVia.split(":").map(Number);

    return {
        wins: w,
        losses: l,
    };
};

const buildPlayoffSeeds = (qualifiedTeams) => {
    return [...qualifiedTeams].sort((a, b) => {
        const aRecord = qualificationValue(a);
        const bRecord = qualificationValue(b);

        if (aRecord.losses !== bRecord.losses) {
            return aRecord.losses - bRecord.losses;
        }

        if (b.buchholz !== a.buchholz) {
            return b.buchholz - a.buchholz;
        }

        return a.seed - b.seed;
    });
};

const bracketOrder = [
    [0, 15],
    [7, 8],

    [3, 12],
    [4, 11],

    [1, 14],
    [6, 9],

    [2, 13],
    [5, 10],
];

const buildPlayoffsBracket = (teams16) => {
    const seeded = buildPlayoffSeeds(teams16);

    const ro16 = bracketOrder.map(([a, b], i) => ({
        id: `ro16-${i + 1}`,
        stage: "ro16",

        slotA: seeded[a],
        slotB: seeded[b],

        played: false,
        scoreLeft: null,
        scoreRight: null,
        winnerTeamId: null,
        loserTeamId: null,
        pickTeamId: null,
        setHistory: [],
    }));

    const mk = (stage, n) =>
        Array.from({ length: n }).map((_, i) => ({
            id: `${stage}-${i + 1}`,
            stage,
            slotA: null,
            slotB: null,
            played: false,
            scoreLeft: null,
            scoreRight: null,
            winnerTeamId: null,
            loserTeamId: null,
            pickTeamId: null,
            setHistory: [],
        }));

    return {
        ro16,
        qf: mk("qf", 4),
        sf: mk("sf", 2),
        thirdPlace: mk("thirdPlace", 1),
        gf: mk("gf", 1),
    };
};

const canOpenPlayoffsMatch = (bracket, stage, matchIndex) => {
    const stageArr = bracket[stage];
    const match = stageArr[matchIndex];
    if (!match || !match.slotA || !match.slotB) return false;
    if (match.played) return false;

    for (let i = 0; i < matchIndex; i++) {
        if (!stageArr[i].played) return false;
    }

    if (stage === "qf" && bracket.ro16.some((m) => !m.played)) return false;
    if (stage === "sf" && bracket.qf.some((m) => !m.played)) return false;
    if (stage === "thirdPlace" && bracket.sf.some((m) => !m.played)) return false;

    if (stage === "gf") {
        if (bracket.sf.some((m) => !m.played)) return false;
        if (bracket.thirdPlace[0] && !bracket.thirdPlace[0].played) return false;
    }

    return true;
};

const buildDefaultTeamPlacings = (teams) => {
    const out = {};
    teams.forEach((t) => {
        out[t.id] = { wins: 0, seconds: 0, thirds: 0 };
    });
    return out;
};

const loadTeamPlacings = (teams) => {
    try {
        const raw = localStorage.getItem(TEAM_PLACINGS_LS_KEY);
        const base = buildDefaultTeamPlacings(teams);
        if (!raw) return base;

        const parsed = JSON.parse(raw);
        teams.forEach((t) => {
            const v = parsed?.[t.id];
            if (!v) return;
            base[t.id] = {
                wins: Math.max(0, Number(v.wins) || 0),
                seconds: Math.max(0, Number(v.seconds) || 0),
                thirds: Math.max(0, Number(v.thirds) || 0),
            };
        });
        return base;
    } catch {
        return buildDefaultTeamPlacings(teams);
    }
};

const saveTeamPlacings = (placings) => {
    try {
        localStorage.setItem(TEAM_PLACINGS_LS_KEY, JSON.stringify(placings));
    } catch {
        console.error("Couldn't save tournament placings");
    }
};

const trophyCountToDisplay = (n) => {
    if (!n) return null;
    if (n < 11) return { mode: "icons", n };
    return { mode: "count", n };
};

const BREAKDOWN_GLOW = (color) => `
                                0 0 6px ${color},
                                0 0 14px ${color}66,
                                0 2px 6px rgba(0,0,0,0.4)`;

const BreakdownSquares = ({ team, lit, total, side }) => (
    <div
        className={css.miniSquares}
        style={side === "right" ? { flexDirection: "row-reverse" } : undefined}
    >
        {[...Array(total)].map((_, i) => {
            const isLit = i < lit;

            return (
                <div
                    key={i}
                    className={side === "right" ? css.lossSquare : css.square}
                    style={{
                        boxShadow: isLit
                            ? `
                                0 0 3px ${team?.color},
                                0 0 7px ${team?.color}66,
                                0 1px 3px rgba(0,0,0,0.4)
                            `
                            : "none",
                    }}
                >
                    <div
                        className={side === "right" ? css.lossSquareUnlit : css.squareUnlit}
                        style={{ background: team?.unlitGradient }}
                    />
                    <div
                        className={side === "right" ? css.lossSquareLit : css.squareLit}
                        style={{ background: team?.gradient, opacity: isLit ? 1 : 0 }}
                    />
                </div>
            );
        })}
    </div>
);

const BreakdownSetLines = ({ team, lit, total, side, orientation = "vertical" }) => {
    const lineGlow = (isLit) =>
        isLit
            ? `
                0 0 3px ${team?.color},
                0 0 7px ${team?.color}66,
                0 1px 3px rgba(0,0,0,0.4)
            `
            : "none";

    if (orientation === "horizontal") {
        return (
            <div className={side === "right" ? css.lossLines : css.lines}>
                {[...Array(total)].map((_, i) => {
                    const isLit = i < lit;

                    return (
                        <div
                            key={i}
                            className={css.line}
                            style={{
                                boxShadow: lineGlow(isLit),
                                ...(total >= 3 ? { width: "16px" } : null),
                                marginTop: "4px"
                            }}
                        >
                            <div
                                className={side === "right" ? css.lossLineUnlit : css.lineUnlit}
                                style={{ background: team?.unlitGradient }}
                            />
                            <div
                                className={side === "right" ? css.lossLineLit : css.lineLit}
                                style={{
                                    background: team?.gradient,
                                    opacity: isLit ? 1 : 0,
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={side === "right" ? css.verticalLossLines : css.verticalLines}>
            {[...Array(total)].map((_, i) => {
                const isLit = i < lit;

                return (
                    <div
                        key={i}
                        className={css.verticalLine}
                        style={{
                            height: total >= 5 ? "14px" : total >= 3 ? "16px" : "18px",
                            width: "5px",
                            boxShadow: lineGlow(isLit),
                        }}
                    >
                        <div
                            className={side === "right" ? css.verticalLossLineUnlit : css.verticalLineUnlit}
                            style={{ background: team?.unlitGradient }}
                        />
                        <div
                            className={side === "right" ? css.verticalLossLineLit : css.verticalLineLit}
                            style={{
                                background: team?.gradient,
                                opacity: isLit ? 1 : 0,
                                width: "5.5px",
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

const BreakdownScoreNumber = ({ team, value, glow, dim, size = 44, width }) => (
    <span
        className={css.round_text}
        style={{
            fontSize: `${size}px`,
            lineHeight: 1,
            color: team?.color,
            opacity: dim ? 0.4 : 1,
            textShadow: glow ? BREAKDOWN_GLOW(team?.color) : "none",
            ...(width ? { width: `${width}px`, display: "inline-block", textAlign: "center" } : null),
        }}
    >
        {value}
    </span>
);

const BreakdownLeadingIndicator = ({ leftTeam, rightTeam, leftScore, rightScore }) => {
    const momentum =
        leftScore > rightScore ? "left" : rightScore > leftScore ? "right" : "tie";

    if (momentum === "left" && leftTeam) {
        return (
            <GradientCaretLeft
                size={26}
                gradient={{
                    top: lightenHex(leftTeam.color, 0.18),
                    middle: leftTeam.color,
                    bottom: darkenHex(
                        leftTeam.color,
                        getBrightness(leftTeam.color) > 210 ? 0.22 : 0.35
                    ),
                }}
                glowColor={leftTeam.color}
            />
        );
    }

    if (momentum === "right" && rightTeam) {
        return (
            <GradientCaretRight
                size={26}
                gradient={{
                    top: lightenHex(rightTeam.color, 0.18),
                    middle: rightTeam.color,
                    bottom: darkenHex(
                        rightTeam.color,
                        getBrightness(rightTeam.color) > 210 ? 0.22 : 0.35
                    ),
                }}
                glowColor={rightTeam.color}
            />
        );
    }

    return (
        <GradientDiamond
            size={18}
            gradient={{ top: "#9c9c9c", middle: "#757575", bottom: "#555555" }}
            glowColor="#757575"
        />
    );
};

const BreakdownPointLabel = ({ team, text }) => (
    <span
        className={css.info_text}
        style={{
            color: team?.color,
            fontSize: "16px",
            fontWeight: 500,
            minHeight: "20px",
            marginTop: "-8px",
            transition: "all 500ms ease-in-out",
            textShadow: text
                ? `
                    0 0 3px ${team?.color},
                    0 0 7px ${team?.color}66,
                    0 1px 3px rgba(0,0,0,0.4)
                `
                : "none",
            whiteSpace: "nowrap",
        }}
    >
        {text || "\u00A0"}
    </span>
);

const BreakdownScoreRow = ({
    leftTeam,
    rightTeam,
    leftScore,
    rightScore,
    scoreSize = 44,
    scoreWidth,
    squaresTotal = 0,
    leftSquares = 0,
    rightSquares = 0,
    setLinesTotal = 0,
    leftSets = 0,
    rightSets = 0,
    leftGlow = false,
    rightGlow = false,
    leftDim = false,
    rightDim = false,
    leftOpacity = 1,
    rightOpacity = 1,
    isPlayoffs = false,
    center = "indicator",
    centerText = "",
    centerColor = "#2e2f42",
    penalties = null,
    leftLabel = "",
    rightLabel = "",
    showLabels = false,
}) => {
    const momentum =
        leftScore > rightScore
            ? "left"
            : rightScore > leftScore
                ? "right"
                : "tied";

    const hasPens = !!penalties;

    const renderSide = (side) => {
        const team = side === "left" ? leftTeam : rightTeam;
        const score = side === "left" ? leftScore : rightScore;
        const glow = side === "left" ? leftGlow : rightGlow;
        const dim = side === "left" ? leftDim : rightDim;
        const squares = side === "left" ? leftSquares : rightSquares;
        const sets = side === "left" ? leftSets : rightSets;
        const label = side === "left" ? leftLabel : rightLabel;
        const opacity = side === "left" ? leftOpacity : rightOpacity;

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: side === "left" ? "flex-start" : "flex-end",
                    opacity,
                    transition: "opacity 400ms ease",
                }}
            >
                {showLabels && (
                    <BreakdownPointLabel
                        team={team}
                        text={label}
                    />
                )}

                <div
                    style={{
                        display: "flex",
                        flexDirection: side === "left" ? "row-reverse" : "row",
                        alignItems: "center",
                        gap: hasPens ? "10px" : "14px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <BreakdownScoreNumber
                            team={team}
                            value={score}
                            glow={glow}
                            dim={dim}
                            size={scoreSize}
                            width={scoreWidth}
                        />

                        {!isPlayoffs && setLinesTotal > 0 && (
                            <BreakdownSetLines
                                team={team}
                                lit={sets}
                                total={setLinesTotal}
                                side={side === "right" ? "right" : undefined}
                                orientation="horizontal"
                            />
                        )}
                    </div>

                    {hasPens ? (
                        <PenaltyCircles
                            results={
                                side === "left"
                                    ? penalties.leftResults ?? []
                                    : penalties.rightResults ?? []
                            }
                            team={side}
                            attemptsToDisplay={penalties.attemptsToDisplay}
                            resolved={penalties.resolved}
                            shouldHaveMargin={false}
                        />
                    ) : squaresTotal > 0 ? (
                        <BreakdownSquares
                            team={team}
                            lit={squares}
                            total={squaresTotal}
                            side={side === "right" ? "right" : undefined}
                        />
                    ) : null}

                    {isPlayoffs && setLinesTotal > 0 && (
                        <BreakdownSetLines
                            team={team}
                            lit={sets}
                            total={setLinesTotal}
                            side={side === "right" ? "right" : undefined}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
            }}
        >
            {renderSide("left")}

            <div
                style={{
                    minWidth: "63.8px",
                    height: "42px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: center === "indicator" ? "hidden" : "visible",
                    flexShrink: 0,
                    marginTop: showLabels ? "20px" : 0,
                }}
            >
                {center === "indicator" ? (
                    <motion.div
                        initial={false}
                        animate={{
                            x:
                                momentum === "left"
                                    ? -28
                                    : momentum === "right"
                                        ? 8
                                        : -6,
                        }}
                        transition={{
                            duration: 0.35,
                            ease: "easeInOut",
                        }}
                        style={{ marginTop: "-4px" }}
                    >
                        <BreakdownLeadingIndicator
                            leftTeam={leftTeam}
                            rightTeam={rightTeam}
                            leftScore={leftScore}
                            rightScore={rightScore}
                        />
                    </motion.div>
                ) : (
                    <span
                        className={css.info_text}
                        style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: centerColor,
                            whiteSpace: "nowrap",
                            marginTop: "-4px",
                        }}
                    >
                        {centerText}
                    </span>
                )}
            </div>

            {renderSide("right")}
        </div>
    );
};

const BreakdownSectionTitle = ({ text, marginTop = "16px", marginBottom = "0px" }) => (
    <h4
        className={css.game_title}
        style={{ fontSize: "30px", color: "#999", marginTop, marginBottom }}
    >
        {text}
    </h4>
);

const BreakdownDivider = ({ from, to }) => (
    <div style={{ marginTop: "24px", marginBottom: "24px" }}>
        <BreakdownSectionTitle text={from} marginTop="0px" marginBottom="16px" />
        <hr style={{ width: "600px", margin: "0 auto" }} className={css.dashed_divider} />
        <BreakdownSectionTitle text={to} marginTop="16px" />
    </div>
);

const BREAKDOWN_OT_NAMES = {
    1: "Overtime",
    2: "Double Overtime",
    3: "Triple Overtime",
    4: "Quadruple Overtime",
    5: "Quintuple Overtime",
    6: "Sextuple Overtime",
};

const BREAKDOWN_OT_SHORT = {
    1: "Overtime",
    2: "Double Overtime",
    3: "Triple Overtime",
    4: "Quadruple Overtime",
    5: "Quintuple Overtime",
    6: "Sextuple Overtime",
};

const SetBreakdownOverlay = ({
    sets,
    index,
    onIndexChange,
    onClose,
    leftTeam,
    rightTeam,
    bestOf,
    stageLabel,
    matchTitle,
    matchNumber,
    isPlayoffs = false,
    pointLabelText = "MATCH POINT!!!",
}) => {
    const isBo1 = bestOf === 1;
    const entry = sets?.[index] ?? null;

    const scrollRef = useRef(null);
    const sectionRefs = useRef({});
    const modalRef = useRef(null);
    const [activeSection, setActiveSection] = useState(null);
    const [modalHeight, setModalHeight] = useState(300);

    const [isModalHidden, setIsModalHidden] = useState(() => {
        try {
            return localStorage.getItem(BREAKDOWN_HIDDEN_LS_KEY) === "1";
        } catch {
            return false;
        }
    });

    const toggleModalHidden = () => {
        setIsModalHidden((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(BREAKDOWN_HIDDEN_LS_KEY, next ? "1" : "0");
            } catch {
                /* ignore */
            }
            return next;
        });
    };

    const navRef = useRef(null);

    const [indicator, setIndicator] = useState({
        top: 0,
        height: 0,
    });

    const plan = useMemo(() => {
        if (!entry) return null;

        const log = Array.isArray(entry.roundLog) ? entry.roundLog : [];

        const firstHalf = log.filter((r) => r.part === "firstHalf");
        const secondHalf = log.filter((r) => r.part === "secondHalf");

        const otMap = new Map();
        log
            .filter((r) => typeof r.part === "string" && r.part.startsWith("ot"))
            .forEach((r) => {
                const block = r.overtimeBlock ?? Number(String(r.part).slice(2));
                if (!otMap.has(block)) otMap.set(block, []);
                otMap.get(block).push(r);
            });

        const overtimes = [...otMap.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([block, rounds]) => ({ block, rounds }));

        const extendedRounds = entry.extendedRounds ?? {
            firstHalf: null,
            secondHalf: null,
            overtimes: [],
        };

        const extWinners = buildExtendedRoundWinnerList(extendedRounds).filter(
            (x) => x.winner
        );

        const isATie = entry.wins === entry.losses;
        const hasExtended = isATie && extWinners.length > 0;
        const penalties = extendedRounds.penalties ?? null;

        let extLeft = 0;
        let extRight = 0;
        extWinners.forEach((w) => {
            if (w.winner === "left") extLeft += 1;
            else extRight += 1;
        });

        const tieDecidedBy = isATie
            ? penalties
                ? "penalties"
                : extWinners.length
                    ? "extended"
                    : null
            : null;

        const tieLeftScore = penalties ? (penalties.leftScore ?? 0) : extLeft;
        const tieRightScore = penalties ? (penalties.rightScore ?? 0) : extRight;

        const sections = [];
        if (firstHalf.length) sections.push({ id: "firstHalf", label: "1st Half" });
        if (secondHalf.length) sections.push({ id: "secondHalf", label: "2nd Half" });
        overtimes.forEach(({ block }) =>
            sections.push({
                id: `ot${block}`,
                label: BREAKDOWN_OT_SHORT[block] ?? `${block}x OT`,
            })
        );
        if (hasExtended) sections.push({ id: "extended", label: "Extended Rounds" });
        if (penalties) sections.push({ id: "penalties", label: "Pens" });

        const lastLogged = log.length ? log[log.length - 1] : null;

        return {
            firstHalf,
            secondHalf,
            overtimes,
            extWinners,
            hasExtended,
            penalties,
            sections,
            lastLogged,
            isATie,
            tieDecidedBy,
            tieLeftScore,
            tieRightScore,
        };
    }, [entry]);

    const updateIndicator = useCallback(() => {
        if (!navRef.current) return;

        const active = navRef.current.querySelector(
            "[data-breakdown-active='true']"
        );

        if (!active) {
            setIndicator({
                top: 0,
                height: 0,
            });
            return;
        }

        const rect = active.getBoundingClientRect();
        const parent = navRef.current.getBoundingClientRect();

        setIndicator({
            top: rect.top - parent.top,
            height: rect.height,
        });
    }, []);

    useLayoutEffect(() => {
        requestAnimationFrame(updateIndicator);
    }, [activeSection, plan, updateIndicator]);

    useEffect(() => {
        const handleResize = () => updateIndicator();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [updateIndicator]);

    const setsWonByLeft = useMemo(
        () =>
            (sets ?? [])
                .slice(0, index + 1)
                .filter((s) => s.won).length,
        [sets, index]
    );

    const setLinesTotal = Math.max(1, Math.ceil(bestOf / 2));
    const setsToWin = Math.max(1, Math.ceil(bestOf / 2));
    const leftSetsAfter = setsWonByLeft;
    const rightSetsAfter = index + 1 - setsWonByLeft;

    const setsWonByLeftBefore = useMemo(
        () => (sets ?? []).slice(0, index).filter((s) => s.won).length,
        [sets, index]
    );
    const setsWonByRightBefore = Math.max(0, index - setsWonByLeftBefore);

    useLayoutEffect(() => {
        const node = modalRef.current;
        if (!node) return;

        const measure = () => setModalHeight(node.offsetHeight || 300);

        measure();

        const id = setTimeout(measure, 0);

        window.addEventListener("resize", measure);

        return () => {
            clearTimeout(id);
            window.removeEventListener("resize", measure);
        };
    }, [index, entry, isModalHidden]);

    const updateActiveSection = useCallback(() => {
        const container = scrollRef.current;
        if (!container || !plan) return;

        let current = plan.sections[0]?.id ?? null;
        const threshold = modalHeight + 100;

        plan.sections.forEach((section) => {
            const node = sectionRefs.current[section.id];
            if (!node) return;
            if (node.offsetTop - container.scrollTop <= threshold) {
                current = section.id;
            }
        });

        setActiveSection(current);
    }, [plan, modalHeight]);

    useEffect(() => {
        const container = scrollRef.current;
        if (container) container.scrollTop = 0;
        requestAnimationFrame(() => updateActiveSection());
    }, [index, updateActiveSection]);

    const totalPickemPoints = useMemo(() => {
        let leftSets = 0;
        let rightSets = 0;
        let points = 0;

        for (let i = 0; i <= index; i++) {
            const set = sets[i];

            if (!set.won) continue;

            if (set.winner === "left") {
                leftSets++;
            } else {
                rightSets++;
            }

            const clinched =
                leftSets === setsToWin ||
                rightSets === setsToWin;

            points += clinched ? 1 : 2;
        }

        return points;
    }, [sets, index, setsToWin]);

    const scrollToSection = (id) => {
        const container = scrollRef.current;
        const node = sectionRefs.current[id];
        if (!container || !node) return;
        container.scrollTo({
            top: Math.max(0, node.offsetTop - modalHeight - 60),
            behavior: "smooth",
        });
    };

    if (!entry || !plan) return null;

    const won = !!entry.won;
    const background = won ? "linear-gradient(180deg,#b8ffd7 0%,#ffffff 120%)" : "linear-gradient(180deg, #ffbfbf 0%, #ffffff 120%)";
    const tieDecided = !!plan.tieDecidedBy;
    const tieWinner = plan.tieLeftScore > plan.tieRightScore ? "left" : plan.tieRightScore > plan.tieLeftScore ? "right" : null;

    const setLabel = index + 1 === bestOf ? "Decider" : `Set ${index + 1}`;

    const isClinchingSet =
        (won && leftSetsAfter === setsToWin) ||
        (!won && rightSetsAfter === setsToWin);

    const roundsPlayed = (entry.wins ?? 0) + (entry.losses ?? 0);
    const roundsLabel =
        roundsPlayed % 10 === 1 && roundsPlayed % 100 !== 11
            ? "Round"
            : "Rounds";

    const penaltyView = plan.penalties
        ? (() => {
            const leftResults = plan.penalties.leftResults ?? [];
            const rightResults = plan.penalties.rightResults ?? [];
            const completedSuddenDeathPairs = Math.min(
                Math.max(0, leftResults.length - 5),
                Math.max(0, rightResults.length - 5)
            );

            return {
                leftResults,
                rightResults,
                attemptsToDisplay:
                    PENALTY_DISPLAY_CIRCLES + completedSuddenDeathPairs,
                resolved: plan.penalties.penaltyResolved ?? true,
            };
        })()
        : null;

    const loserSideOpacity = (loserSetsBefore) =>
        loserSetsBefore + 1 >= setsToWin ? 0.4 : 0.7;

    const decisiveOpacities = (leftWins) => {
        if (leftWins) {
            return { leftOpacity: 1, rightOpacity: loserSideOpacity(setsWonByRightBefore) };
        }
        return { leftOpacity: loserSideOpacity(setsWonByLeftBefore), rightOpacity: 1 };
    };

    const renderRound = (round, key) => {
        const isDecisive =
            !tieDecided && plan.lastLogged && round.key === plan.lastLogged.key;

        const threshold = 12 + 3 * (round.overtimeBlock ?? 0);
        const leftAtPoint =
            round.scoreLeft === threshold && round.scoreRight < threshold;
        const rightAtPoint =
            round.scoreRight === threshold && round.scoreLeft < threshold;

        const leftLabel = leftAtPoint
            ? setsWonByLeftBefore === setsToWin - 1
                ? pointLabelText
                : "Set point!"
            : "";
        const rightLabel = rightAtPoint
            ? setsWonByRightBefore === setsToWin - 1
                ? pointLabelText
                : "Set point!"
            : "";

        const opacities = isDecisive
            ? decisiveOpacities(!!won)
            : { leftOpacity: 1, rightOpacity: 1 };

        return (
            <div
                key={key}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    marginTop: "14px",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <span
                        className={css.info_text}
                        style={{
                            fontSize: "15px",
                            color: "#555",
                            fontWeight: 600,
                        }}
                    >
                        Round {round.roundNumber}
                    </span>

                    {round.winner === "left" && (
                        <div
                            style={{
                                position: "absolute",
                                left: -32,
                                width: "14px",
                                height: "14px",
                                borderRadius: "50%",
                                backgroundColor: "#54CC54",
                                boxShadow: BREAKDOWN_GLOW("#54CC54"),
                            }}
                        />
                    )}

                    {round.winner === "right" && (
                        <div
                            style={{
                                position: "absolute",
                                right: -32,
                                width: "14px",
                                height: "14px",
                                borderRadius: "50%",
                                backgroundColor: "#54CC54",
                                boxShadow: BREAKDOWN_GLOW("#54CC54"),
                            }}
                        />
                    )}
                </div>

                <BreakdownScoreRow
                    leftTeam={leftTeam}
                    rightTeam={rightTeam}
                    leftScore={round.scoreLeft}
                    rightScore={round.scoreRight}
                    scoreSize={44}
                    squaresTotal={round.squares}
                    leftSquares={round.miniLeft}
                    rightSquares={round.miniRight}
                    setLinesTotal={isDecisive ? setLinesTotal : 0}
                    leftSets={leftSetsAfter}
                    rightSets={rightSetsAfter}
                    leftGlow={isDecisive && won}
                    rightGlow={isDecisive && !won}
                    isPlayoffs={isPlayoffs}
                    showLabels
                    leftLabel={leftLabel}
                    rightLabel={rightLabel}
                    {...opacities}
                />
            </div>
        );
    };

    const arrowStyle = (disabled) => ({
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        padding: 0,
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? "default" : "pointer",
        pointerEvents: disabled ? "none" : "auto",
        zIndex: 3,
    });

    return (
        <>
            <motion.div
                ref={scrollRef}
                onScroll={updateActiveSection}
                className={css.hidden_scrollbar}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "#ffffff",
                    overflowY: "auto",
                    zIndex: 80,
                }}
            >
                {plan.sections.length > 1 && (
                    <div
                        ref={navRef}
                        className={css.infoNavigation}
                    >
                        {plan.sections.map((section) => (
                            <button
                                key={section.id}
                                data-breakdown-active={activeSection === section.id}
                                type="button"
                                onClick={() => scrollToSection(section.id)}
                                className={`${css.resultsNavigationButton} ${activeSection === section.id
                                    ? css.resultsNavigationButtonActive
                                    : ""
                                    }`}
                            >
                                {section.label}
                            </button>
                        ))}
                        <motion.div
                            className={css.resultsNavigationIndicator}
                            initial={false}
                            animate={{
                                top: indicator.top,
                                height: indicator.height,
                            }}
                            transition={{
                                duration: 0.22,
                                ease: "easeInOut",
                            }}
                        />
                    </div>
                )}

                <div
                    style={{
                        paddingTop: `${modalHeight + 60}px`,
                        paddingBottom: "80px",
                        textAlign: "center",
                    }}
                >
                    {plan.firstHalf.length > 0 && (
                        <div ref={(node) => { sectionRefs.current.firstHalf = node; }}>
                            <hr style={{ width: "600px", margin: "0 auto" }} className={css.dashed_divider} />
                            <div style={{ marginTop: "24px" }}>
                                <BreakdownSectionTitle text="First Half" marginTop="0px" />
                            </div>
                            {plan.firstHalf.map((round, i) => renderRound(round, `fh-${i}`))}
                        </div>
                    )}

                    {plan.secondHalf.length > 0 && (
                        <div ref={(node) => { sectionRefs.current.secondHalf = node; }}>
                            <BreakdownDivider from="First Half" to="Second Half" />
                            {plan.secondHalf.map((round, i) => renderRound(round, `sh-${i}`))}
                        </div>
                    )}

                    {plan.overtimes.map(({ block, rounds }, i) => {
                        const previousLabel =
                            i === 0
                                ? "Second Half"
                                : BREAKDOWN_OT_NAMES[plan.overtimes[i - 1].block] ??
                                `${plan.overtimes[i - 1].block}x Overtime`;

                        const label = BREAKDOWN_OT_NAMES[block] ?? `${block}x Overtime`;

                        return (
                            <div
                                key={`ot-${block}`}
                                ref={(node) => { sectionRefs.current[`ot${block}`] = node; }}
                            >
                                <BreakdownDivider from={previousLabel} to={label} />
                                {rounds.map((round, j) => renderRound(round, `ot-${block}-${j}`))}
                            </div>
                        );
                    })}

                    {plan.hasExtended && (
                        <div ref={(node) => { sectionRefs.current.extended = node; }}>
                            <BreakdownDivider
                                from={
                                    plan.overtimes.length
                                        ? BREAKDOWN_OT_NAMES[
                                        plan.overtimes[plan.overtimes.length - 1].block
                                        ] ?? "Overtime"
                                        : "Second Half"
                                }
                                to="Extended Rounds"
                            />

                            {(() => {
                                let left = 0;
                                let right = 0;

                                return plan.extWinners.map((item, i) => {
                                    if (item.winner === "left") left += 1;
                                    else right += 1;

                                    const winnerTeam =
                                        item.winner === "left" ? leftTeam : rightTeam;

                                    const extDecisive =
                                        plan.tieDecidedBy === "extended" &&
                                        i === plan.extWinners.length - 1;

                                    return (
                                        <div
                                            key={`ext-${i}`}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: "2px",
                                                marginTop: "14px",
                                            }}
                                        >
                                            <span
                                                className={css.info_text}
                                                style={{ fontSize: "15px", color: "#555", fontWeight: 600 }}
                                            >
                                                {item.label} Extended Round winner is{" "}
                                                <span style={{ color: winnerTeam?.color, fontWeight: 900 }}>
                                                    Team {winnerTeam?.name}
                                                </span>
                                            </span>

                                            <BreakdownScoreRow
                                                leftTeam={leftTeam}
                                                rightTeam={rightTeam}
                                                leftScore={left}
                                                rightScore={right}
                                                scoreSize={44}
                                                center="text"
                                                centerText="VS"
                                                centerColor="#2e2f42"
                                                isPlayoffs={isPlayoffs}
                                                setLinesTotal={extDecisive ? setLinesTotal : 0}
                                                leftSets={leftSetsAfter}
                                                rightSets={rightSetsAfter}
                                                leftGlow={extDecisive && won}
                                                rightGlow={extDecisive && !won}
                                                {...(extDecisive
                                                    ? decisiveOpacities(!!won)
                                                    : { leftOpacity: 1, rightOpacity: 1 })}
                                            />
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    )}

                    {plan.penalties && (
                        <div ref={(node) => { sectionRefs.current.penalties = node; }}>
                            <BreakdownDivider
                                from="Extended Rounds"
                                to="Penalties"
                            />

                            {(() => {
                                const leftScore = plan.penalties.leftScore ?? 0;
                                const rightScore = plan.penalties.rightScore ?? 0;
                                const leftWon = leftScore > rightScore;

                                return (
                                    <div style={{ marginTop: "14px" }}>
                                        <BreakdownScoreRow
                                            leftTeam={leftTeam}
                                            rightTeam={rightTeam}
                                            leftScore={leftScore}
                                            rightScore={rightScore}
                                            scoreSize={44}
                                            center="text"
                                            centerText="VS"
                                            centerColor="#2e2f42"
                                            isPlayoffs={isPlayoffs}
                                            penalties={penaltyView}
                                            setLinesTotal={setLinesTotal}
                                            leftSets={leftSetsAfter}
                                            rightSets={rightSetsAfter}
                                            leftGlow={leftWon}
                                            rightGlow={!leftWon}
                                            {...decisiveOpacities(leftWon)}
                                        />
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </motion.div>
            <motion.div
                ref={modalRef}
                className={css.restart_modal}
                initial={{ opacity: 0, x: "-50%", y: -120 }}
                animate={{ opacity: 1, x: "-50%", y: 0 }}
                exit={{ opacity: 0, x: "-50%", y: -100 }}
                transition={{ type: "spring", stiffness: 240, damping: 22, duration: 3 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "fixed",
                    top: isModalHidden ? "108px" : "190px",
                    left: "50%",
                    transform: "none",
                    width: "620px",
                    maxWidth: "92vw",
                    background,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transformOrigin: "top",
                    padding: isModalHidden ? "16px 56px 14px" : "20px 56px 22px",
                    zIndex: 81,
                    border: won ? "2px solid #006a32" : "2px solid rgb(188, 108, 108)",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "-16.5px",
                        left: "-16.5px",
                        display: "flex",
                        alignItems: "center",
                        color: won ? "#1f9d55" : "#c62828",
                        zIndex: 3,
                    }}
                >
                    {won ? (
                        <div
                            className={css.modalSuccessPickemIndicator}
                        >
                            <FaCircle size={32} color="#37b737" />
                            <FaCheck size={20} color="#ffffff" />
                        </div>
                    ) : (
                        <div
                            className={css.modalSuccessPickemIndicator}
                        >
                            <FaCircle size={32} color="#be3939" />
                            <FaXmark size={20} color="#fff" />
                        </div>
                    )}
                </div>

                {!isBo1 && (
                    <>
                        <button
                            type="button"
                            aria-label="Previous set"
                            disabled={index <= 0}
                            onClick={() => index > 0 && onIndexChange(index - 1)}
                            style={{ ...arrowStyle(index <= 0), left: "10px" }}
                            className={css.arrowToAnotherSet}
                        >
                            <IoIosArrowBack size={34} />
                        </button>

                        <button
                            type="button"
                            aria-label="Next set"
                            disabled={index >= sets.length - 1}
                            onClick={() => index < sets.length - 1 && onIndexChange(index + 1)}
                            style={{ ...arrowStyle(index >= sets.length - 1), right: "10px" }}
                            className={css.arrowToAnotherSet}
                        >
                            <IoIosArrowForward size={34} />
                        </button>
                    </>
                )}

                {!isModalHidden && (
                    <div className={css.match_modal_header} style={{ marginBottom: "6px" }}>
                        {stageLabel ? (
                            <span
                                className={css.match_modal_title}
                                style={{ fontSize: "16px", marginBottom: "-8px", color: "#ffffff" }}
                            >
                                {stageLabel}
                            </span>
                        ) : null}

                        <h3 className={css.match_modal_title} style={{ margin: 0, color: "#ffffff" }}>
                            {matchTitle}
                            {matchNumber ? (
                                <div
                                    className={css.points}
                                    style={{ marginLeft: "2px", marginTop: "-2px", padding: "4px 8px", color: "#ffffff", backgroundColor: won ? "#2e7d32" : "#7d2e2e" }}
                                >
                                    #{matchNumber}
                                </div>
                            ) : null}
                        </h3>

                        <span
                            className={css.match_modal_title}
                            style={{ margin: 0, fontSize: "18px", marginTop: "-6px", color: "#ffffff" }}
                        >
                            Best of {bestOf}
                        </span>

                        {!isBo1 ? (
                            <span
                                className={css.match_modal_title}
                                style={{ margin: 0, fontSize: "20px", marginTop: "-4px", color: "#ffffff" }}
                            >
                                {setLabel}
                            </span>
                        ) : (
                            <span
                                className={css.match_modal_title}
                                style={{ margin: 0, fontSize: "20px", marginTop: "-4px" }}
                            >
                                &nbsp;
                            </span>
                        )}

                        {isClinchingSet && !isBo1 && (
                            <span
                                className={css.match_modal_pickem_total}
                                style={{
                                    left: isPlayoffs ? "95%" : "74%",
                                }}
                            >
                                +{totalPickemPoints} Pick&apos;em point{totalPickemPoints !== 1 ? "s" : ""}
                            </span>
                        )}
                        <span
                            className={css.match_modal_pickem}
                            style={{
                                color: won ? "#2e7d32" : "red",
                                left: isPlayoffs ? "95%" : "75%",
                            }}
                        >
                            {won
                                ? (isClinchingSet ? "+1 Pick'em point" : "+2 Pick'em points")
                                : "+0 Pick'em points"}
                        </span>
                    </div>
                )}

                <div style={{ marginTop: isModalHidden ? "0px" : "10px" }}>
                    <BreakdownScoreRow
                        leftTeam={leftTeam}
                        rightTeam={rightTeam}
                        leftScore={entry.wins}
                        rightScore={entry.losses}
                        scoreSize={44}
                        scoreWidth={49}
                        center="text"
                        centerText={`${roundsPlayed} ${roundsLabel}`}
                        centerColor="#ffffff"
                        isPlayoffs={isPlayoffs}
                        setLinesTotal={setLinesTotal}
                        leftSets={leftSetsAfter}
                        rightSets={rightSetsAfter}
                        leftGlow={won}
                        rightGlow={!won}
                        {...decisiveOpacities(!!won)}
                    />
                </div>

                {tieDecided ? (
                    <div
                        className={css.info_text}
                        style={{
                            marginTop: "6px",
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#555",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        <span
                            style={{
                                color: leftTeam?.color,
                                fontWeight: 700,
                                marginRight: "28px",
                                textShadow: tieWinner === "left" ? BREAKDOWN_GLOW(leftTeam?.color) : "none",
                            }}
                        >
                            {plan.tieLeftScore}
                        </span>
                        <button
                            type="button"
                            onClick={() => scrollToSection(plan.tieDecidedBy)}
                            className={css.link_button}
                            style={{
                                pointerEvents:
                                    activeSection === "penalties" ||
                                        activeSection === "extended"
                                        ? "none"
                                        : "auto",
                                cursor:
                                    activeSection === "penalties" ||
                                        activeSection === "extended"
                                        ? "default"
                                        : "pointer",
                            }}
                        >
                            {plan.tieDecidedBy === "penalties"
                                ? "Penalties"
                                : "Extended Rounds"}
                        </button>
                        <span
                            style={{
                                color: rightTeam?.color,
                                fontWeight: 700,
                                marginLeft: "28px",
                                textShadow: tieWinner === "right" ? BREAKDOWN_GLOW(rightTeam?.color) : "none",
                            }}>
                            {plan.tieRightScore}
                        </span>
                    </div>
                ) : (
                    <div
                        className={css.info_text}
                        style={{
                            marginTop: "6px",
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#555",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            pointerEvents: "none"
                        }}
                    >
                        &nbsp;
                        <button
                            type="button"
                            className={css.link_button}
                            style={{
                                pointerEvents: "none"
                            }}
                        >
                            &nbsp;
                        </button>
                        <span
                            style={{
                                fontWeight: 700,
                                marginLeft: "28px",
                                pointerEvents: "none"
                            }}>
                            &nbsp;
                        </span>
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: isModalHidden ? "10px" : "14px",
                    }}
                >
                    <button
                        className={css.gamble_button}
                        style={
                            isModalHidden
                                ? { padding: "6px 16px", fontSize: "14px" }
                                : undefined
                        }
                        onClick={() => {
                            onIndexChange(-1);

                            requestAnimationFrame(() => {
                                onClose();
                            });
                        }}
                    >
                        Back?
                    </button>

                    <button
                        type="button"
                        onClick={toggleModalHidden}
                        style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: "#8c8c8c",
                            fontSize: "13px",
                            textDecoration: "underline",
                        }}
                    >
                        {isModalHidden ? "Show full modal" : "Hide full modal"}
                    </button>
                </div>
            </motion.div>
        </>
    );
};


const defaultSeriesState = {
    active: false,

    phase: null,

    swissStageKey: null,
    swissNet: null,
    swissMatchId: null,

    playoffsStage: null,
    playoffsMatchId: null,

    leftTeam: null,
    rightTeam: null,

    setsToWin: 2,
    playerWonSets: 0,
    playerLostSets: 0,
    setNumber: 1,
    firstHalfLeft: null,
    firstHalfRight: null,
    finishedSets: [],

    extendedRounds: {
        firstHalf: null,
        secondHalf: null,
        overtimes: [],
    },

    lastMultiplier: null,
    lastResult: "",

    roundWins: 0,
    roundLosses: 0,
    roundNumber: 1,

    miniWins: 0,
    miniLosses: 0,

    isOvertime: false,
    overtimeBlock: 0,
    otWins: 0,
    otLosses: 0,

    banner: "",

    tiebreakerPhase: "idle",
    extRoundLeftScore: 0,
    extRoundRightScore: 0,
    extRoundRevealIndex: 0,
    extRoundCommentaryShown: false,
    penaltyLeftResults: [],
    penaltyRightResults: [],
    penaltyLeftScore: 0,
    penaltyRightScore: 0,
    penaltyTurn: "left",
    penaltyPreScore: null,
    penaltyResolved: false,
    tiebreakerBigSymbol: null,

    swissMatchNumber: 1,
    playoffsMatchNumber: 1,

    pendingAction: null,
};

const round2 = (n) => Number(n.toFixed(2));

const TeamCircle = ({ team, dim, specialStyle = {}, showRating = false, ratingValue = 0, beforeRatingValue = 0, shouldPlaceholderCirclesBeRendered = false }) => {
    if (!team) {
        return (
            <div
                style={{
                    width: '24px',
                    height: '24px',
                    fontSize: '14px',
                    opacity: shouldPlaceholderCirclesBeRendered ? 0 : 1,
                }}
                className={css.placeholder_circle}
            >
                <span style={{ marginRight: '0.3px', marginTop: '1.3px' }}>?</span>
            </div>
        );
    }

    return (
        <div
            className={css.team_circle_ro32}
            style={{
                background: team.color,
                opacity: dim ? 0.25 : 1,
                ...specialStyle,
            }}
            title={`Team ${team.name}`}
        >
            {showRating && (
                <span style={{ color: '#ffffff', textShadow: `0 0 4px #000` }} className={css.modal_team_rating}>
                    <CountUp
                        start={beforeRatingValue ?? 0}
                        duration={2.5}
                        end={ratingValue}
                        key={ratingValue}
                    />
                </span>
            )}
        </div>
    );
};

const buildExtendedRoundWinnerList = (extendedRounds) => {
    const overtimes = extendedRounds?.overtimes ?? [];
    const findOt = (n) => overtimes.find((o) => o.overtime === n)?.winner ?? null;
    return [
        { label: "1st Half", winner: extendedRounds?.firstHalf ?? null },
        { label: "2nd Half", winner: extendedRounds?.secondHalf ?? null },
        { label: "OT", winner: findOt(1) },
        { label: "Double OT", winner: findOt(2) },
        { label: "Triple OT", winner: findOt(3) },
        { label: "Quadruple OT", winner: findOt(4) },
    ];
};

const MatchRect = ({
    match,
    isClickable,
    onClick,
    isButtonLocked,
    className = "",
    dataNet,
    dataPos,
    dataIdx,
    dataNotStarted,
    bestOf,
    shouldBestOfBeShown,
    shouldPlaceholderCirclesBeRendered
}) => {
    const isPlayed = !!match.played;

    const slotA = match.slotA || null;
    const slotB = match.slotB || null;

    const shouldSwap =
        !!match.pickTeamId &&
        slotA &&
        slotB &&
        match.pickTeamId === slotB.id;

    const leftTeam = shouldSwap ? slotB : slotA;
    const rightTeam = shouldSwap ? slotA : slotB;

    const bo1History =
        bestOf === 1 && match.setHistory?.length
            ? match.setHistory[0]
            : null;

    const bo1MainScore = bo1History
        ? {
            left: bo1History.wins,
            right: bo1History.losses,
        }
        : null;

    const rawLeftScore =
        bo1MainScore?.left ?? match.scoreLeft;

    const rawRightScore =
        bo1MainScore?.right ?? match.scoreRight;

    const displayScoreLeft =
        shouldSwap ? rawRightScore : rawLeftScore;

    const displayScoreRight =
        shouldSwap ? rawLeftScore : rawRightScore;

    const bo1Tiebreak = (() => {
        if (!bo1History?.extendedRounds) return null;
        if (displayScoreLeft !== displayScoreRight) return null;

        if (bo1History.extendedRounds.penalties) {
            return {
                type: "Pens",
                left: bo1History.extendedRounds.penalties.leftScore,
                right: bo1History.extendedRounds.penalties.rightScore,
            };
        }

        const winners = buildExtendedRoundWinnerList(bo1History.extendedRounds);

        let left = 0;
        let right = 0;

        for (const round of winners) {
            if (round.winner === "left") left++;
            else if (round.winner === "right") right++;
        }

        return left || right
            ? {
                type: "ERs",
                left,
                right,
            }
            : null;
    })();

    const hasScores =
        displayScoreLeft !== null &&
        displayScoreLeft !== undefined &&
        displayScoreRight !== null &&
        displayScoreRight !== undefined;

    const isUserWin =
        isPlayed &&
        match.pickTeamId &&
        match.winnerTeamId &&
        match.pickTeamId === match.winnerTeamId;

    const resultClass = isPlayed
        ? isUserWin
            ? css.match_win
            : css.match_loss
        : "";

    const boLabelResultClass = isPlayed
        ? isUserWin
            ? css.match_win_label
            : css.match_loss_label
        : "";

    const noLabelResultClass = isPlayed
        ? isUserWin
            ? css.match_win_no_label
            : css.match_loss_no_label
        : "";

    const winnerIsLeft =
        isPlayed && match.winnerTeamId && leftTeam && match.winnerTeamId === leftTeam.id;
    const winnerIsRight =
        isPlayed && match.winnerTeamId && rightTeam && match.winnerTeamId === rightTeam.id;

    const isLeftLoser =
        isPlayed && match.loserTeamId && leftTeam && match.loserTeamId === leftTeam.id;
    const isRightLoser =
        isPlayed && match.loserTeamId && rightTeam && match.loserTeamId === rightTeam.id;

    const isATie = displayScoreLeft === displayScoreRight;

    return (
        <div
            className={`${resultClass} ${css.ro32_rect} ${css.swiss_rect} ${className}`}
            data-net={dataNet}
            data-pos={dataPos}
            data-idx={dataIdx}
            data-not-started={dataNotStarted}
            style={{
                pointerEvents: isClickable && !isButtonLocked ? "auto" : "none",
                marginBottom: 8,
            }}
            onClick={onClick}
        >
            {!shouldBestOfBeShown && (
                <div className={`${css.bo_label} ${boLabelResultClass} ${className}`}>
                    BO{bestOf}
                </div>
            )}
            {!shouldBestOfBeShown && (
                <div className={`${css.no_label} ${noLabelResultClass} ${className}`}>
                    #{dataIdx}
                </div>
            )}
            {isPlayed && (
                isUserWin ? (
                    <div className={css.successPickemIndicator}>
                        <FaCircle size={12} color="#37b737" />
                        <FaCheck size={7} color="#ffffff" />
                    </div>
                ) : (
                    <div className={css.successPickemIndicator}>
                        <FaCircle size={12} color="#be3939" />
                        <FaXmark size={7} color="#fff" />
                    </div>
                )
            )}
            <div className={css.team_cell_ro32}>
                <TeamCircle team={leftTeam} shouldPlaceholderCirclesBeRendered={shouldPlaceholderCirclesBeRendered} />
            </div>

            <div className={css.vs_cell_ro32} style={{ textAlign: "center" }}>
                {!isPlayed || !hasScores ? (
                    <span style={{ fontSize: "12px", fontWeight: 600, top: "8px", left: "39px", backgroundColor: "transparent" }} className={css.vs_text}>
                        VS
                    </span>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span
                                style={{
                                    color: isATie
                                        ? "#5a5a5a"
                                        : winnerIsLeft
                                            ? "#2e7d32"
                                            : "red",
                                    fontWeight: 800,
                                    fontStyle: "italic",
                                    position: "relative",
                                    zIndex: 0,
                                    fontSize: "12px",
                                    textAlign: "left",
                                    marginBottom: -2,
                                    marginRight: 1,
                                    opacity: isATie ? 0.9 : isLeftLoser ? 0.55 : 1
                                }}
                                className={
                                    isATie
                                        ? css.swissTieScoreShadow
                                        : winnerIsLeft
                                            ? css.swissWinnerScoreShadow
                                            : css.swissLoserScoreShadow
                                }
                            >
                                {bestOf === 1 ? rawLeftScore : displayScoreLeft}
                            </span>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 2,
                                    marginTop: 1
                                }}
                            >
                                <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#2e2f42" }}></div>
                                <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#2e2f42" }}></div>
                            </div>
                            <span
                                style={{
                                    color: isATie
                                        ? "#5a5a5a"
                                        : winnerIsRight
                                            ? "#2e7d32"
                                            : "red",
                                    fontWeight: 800,
                                    fontStyle: "italic",
                                    position: "relative",
                                    zIndex: 0,
                                    fontSize: "12px",
                                    textAlign: "left",
                                    marginBottom: -2,
                                    opacity: isATie ? 0.9 : isRightLoser ? 0.55 : 1
                                }}
                                className={
                                    isATie
                                        ? css.swissTieScoreShadow
                                        : winnerIsRight
                                            ? css.swissWinnerScoreShadow
                                            : css.swissLoserScoreShadow
                                }
                            >
                                {bestOf === 1 ? rawRightScore : displayScoreRight}
                            </span>
                        </div>
                        {bo1Tiebreak && (
                            <div
                                style={{
                                    fontSize: "8px",
                                    marginTop: 2,
                                    color: "#2e2f42",
                                    textAlign: "center",
                                    fontWeight: 700,
                                    display: 'flex',
                                    gap: "2px",
                                    width: 'max-content',
                                    position: "absolute",
                                    top: '67.5%'
                                }}
                            >
                                <span style={{ color: winnerIsLeft ? "#2e7d32" : "red", opacity: isLeftLoser ? 0.55 : 1 }}>{bo1Tiebreak.left}</span>
                                {bo1Tiebreak.type}
                                <span style={{ color: winnerIsRight ? "#2e7d32" : "red", opacity: isRightLoser ? 0.55 : 1 }}>{bo1Tiebreak.right}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={css.team_cell_ro32}>
                <TeamCircle team={rightTeam} shouldPlaceholderCirclesBeRendered={shouldPlaceholderCirclesBeRendered} />
            </div>
        </div>
    );
};

const PlaceholderRect = ({ teams, height = 264 }) => {
    const sortedTeams = [...teams].sort(
        (a, b) => a.netEntryOrder - b.netEntryOrder
    );

    return (
        <div
            className={css.placeholder_rect}
            style={{ minHeight: height }}
            title="To be determined..."
        >
            <div
                style={{
                    width: "100%",
                    height: "max-content",
                    display: "flex",
                    flexWrap: "wrap",
                    rowGap: 15.2,
                    columnGap: 4,
                    justifyContent: "center",
                    alignItems: "flex-start",
                }}
            >
                {sortedTeams.map((t) => (
                    <div
                        key={t.id}
                        style={{
                            width: "calc(50% - 6px)",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <TeamCircle team={t} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const BoxPlaceholderCircle = ({ tone = "green" }) => {
    const bg = tone === "green" ? "#005e00" : "#4a0000";
    return (
        <div
            className={css.placeholder_circle_elimination}
            style={{ background: bg }}
        >
            <span>?</span>
        </div>
    );
};

const SwissResultBox = ({ title, tone, teams }) => {
    const slots = BOX_SLOTS[title] ?? 6;
    const items = Array.from({ length: slots }).map((_, i) => teams?.[i] || null);

    return (
        <div
            className={`${css.swiss_result_box} ${tone === "green" ? css.swiss_result_box_green : css.swiss_result_box_red}`}
            style={{
                maxWidth: title === "3:2" || title === "2:3" || title === '3:1' || title === '1:3' ? '79px' : '',
                borderRadius: title === "3:0" || title === "0:3" ? '12px 0 0 12px' : title === "3:1" ? '0 0 0 12px' : title === "1:3" ? '12px 0 0 0' : title === "2:3" || title === "3:2" ? '0 12px 12px 0' : '',
            }}
        >
            <div className={css.swiss_result_box_title}>
                {title}
            </div>

            <div style={{
                display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center",
                gap: title === "3:0" || title === "0:3" ? 13.6 : title === "1:3" || title === "3:1" || title === "3:2" || title === "2:3" ? 16 : 8,
            }}>
                {items.map((t, idx) =>
                    t ? <TeamCircle specialStyle={{ border: '1.5px solid #999' }} key={t.id} team={t} /> : <BoxPlaceholderCircle key={`${title}-ph-${idx}`} tone={tone} />
                )}
            </div>
        </div>
    );
};

const getQualifiedBy = (stage, key) =>
    stage.teams
        .filter((t) => t.qualified && t.qualifiedVia === key)
        .sort((a, b) => (a.qualifiedAt ?? 1e9) - (b.qualifiedAt ?? 1e9));

const getEliminatedBy = (stage, key) =>
    stage.teams
        .filter((t) => t.eliminated && t.eliminatedVia === key)
        .sort((a, b) => (a.eliminatedAt ?? 1e9) - (b.eliminatedAt ?? 1e9));

const PODIUM_QUOTES = {
    winner: [
        "The best of the best",
        "Champions keep playing until they get it right",
        "Legends aren't born in finals, instead they are confirmed there",
        "They didn't just win the tournament, they rewrote it",
        "Victory is temporary. Legacy is permanent",
        "The final needed mini-win didn't end the match, it crowned a story",
        "No luck, no noise, just pure domination",
        "They came for the trophy and they left with it",
        "The summit of the mountain is reserved for those who dare to climb it",
        "Every round was a statement, not a question",
        "They turned pressure into precision",
        "The final scoreboard tells the truth",
        "Built for the moment, defined by it",
        "When it mattered most, they were already ready",
        "No debate left, only recognition",
        "They didn't chase greatness, they enforced it",
        "Only one team leaves without regrets",
        "The trophy follows those who refuse to let go",
        "Excellence became expectation, and they delivered",
        "History remembers champions, not predictions",
        "Perfection wasn't required, only superiority",
        "The crown found its rightful owner"
    ],

    runnerUp: [
        "Neither the best of the best nor the best of the worst",
        "So close it hurts, so strong it matters",
        "They reached the peak… just not the summit",
        "Second place is just first place without the ending",
        "One step away... and yet a world apart",
        "So close to glory, yet so far",
        "Almost champions",
        "They fought like winners, finished like survivors",
        "The gap was small, but history is cruel",
        "They had the moment, but not the ending",
        "Silver is still earned, not given",
        "The final chapter just slipped away",
        "Defeated, but never outclassed",
        "They proved they belong, just not at the top",
        "Next time won't be the same",
        "One victory short of immortality",
        "A painful ending to an unforgettable journey",
        "The trophy escaped them, but respect did not",
        "Close enough to dream, far enough to remember",
        "The finish line was visible, but unreachable",
        "Tomorrow's champions are often today's runners-up"
    ],

    thirdPlace: [
        "The best of the worst",
        "Not the champion, but still the fire",
        "Bronze today, gold tomorrow",
        "Proof that the story didn't end after first defeat",
        "A podium built on resilience",
        "Third place, but first in character",
        "Being defeated doesn't mean being a loser",
        "Still standing when others fell earlier",
        "They turned disappointment into position",
        "A reminder that pride survives defeat",
        "Not the final goal, but still a finish worth respect",
        "They stayed sharp when others faded",
        "Resilience has a rank, and it's here",
        "They leave with something still shining",
        "One last victory to leave with heads held high",
        "Bronze medals still shine under bright lights",
        "The tournament ends, but the progress doesn't",
        "They answered defeat with determination",
        "A finish worthy of applause",
        "Not the ending they wanted, but one they earned"
    ],

    fourthPlace: [
        "One more place and people might have remembered your name",
        "So close the echoes still linger",
        "One match short of memory",
        "They didn't finish last, they finished fighting",
        "The bracket remembers them more than the scoreboard does",
        "Almost there is still somewhere",
        "To be defeated doesn't mean you didn't fight",
        "They stood at the edge of recognition",
        "Close enough to feel it, not enough to hold it",
        "The effort was real, even if the result wasn't",
        "They disappear from standings, not from story",
        "Every great run needs a final witness",
        "Not forgotten, just unfinished",
        "They leave with questions still unanswered",
        "One series away from standing on the podium",
        "The medals slipped away, but the experience remained",
        "Every tournament has heroes without trophies",
        "Sometimes fourth place is the beginning, not the ending",
        "They leave empty-handed, but not empty-hearted",
        "A tournament remembered for the journey, not the destination"
    ],
};

const ANNIVERSARY_THEMES = [
    {
        min: 1000,
        max: Infinity,
        every: 100,
        gradient: "linear-gradient(90deg,#ffd700 0%,#ffffff 18%,#7df9ff 35%,#ffd700 100%)",
        glow: "#ffd700",
        animation: "gradientShift 30s linear infinite",
    },
    {
        min: 500,
        max: 999,
        every: 50,
        gradient: "linear-gradient(90deg,#ff0000 0%,#ff7f00 18%,#ffff00 35%,#00ff00 55%,#00bfff 75%,#8a2be2 85%,#ff1493 100%)",
        glow: "#ffffff",
        animation: "gradientShift 10s linear infinite",
    },
    {
        min: 250,
        max: 499,
        every: 25,
        gradient: "linear-gradient(180deg,#c77dff 0%,#9d4edd 45%,#5a189a 100%)",
        glow: "#b56cff",
    },
    {
        min: 100,
        max: 249,
        every: 10,
        gradient: "linear-gradient(180deg,#ffffff 0%,#b8f3ff 45%,#5fd3ff 100%)",
        glow: "#8be7ff",
    },
    {
        min: 50,
        max: 99,
        every: 5,
        gradient: "linear-gradient(180deg,#ff7f7f 0%,#d61a3c 45%,#760019 100%)",
        glow: "#ff4d6d",
    },
    {
        min: 25,
        max: 49,
        every: 5,
        gradient: "linear-gradient(180deg,#ffffff 0%,#dcdcdc 45%,#9c9c9c 100%)",
        glow: "#f0f0f0",
    },
    {
        min: 10,
        max: 24,
        every: 5,
        gradient: "linear-gradient(180deg,#fff7b3 0%,gold 45%,#c49000 100%)",
        glow: "gold",
    },
    {
        min: 5,
        max: 9,
        every: 5,
        gradient: "linear-gradient(180deg,#e8b67a 0%,#cd7f32 45%,#8c5317 100%)",
        glow: "#cd7f32",
    },
];

function SpecialModePage() {
    const navigate = useNavigate();
    const allTeams = useMemo(() => getAllTeams64(), []);

    const colorSeq = useMemo(
        () => makeColorSequence(buildTournamentColorPool().map(([, v]) => v)),
        []
    );

    const [showIntro, setShowIntro] = useState(true);
    const [showTournamentIntro, setShowTournamentIntro] = useState(false);

    const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

    const [activePhase, setActivePhase] = useState("stage1");

    const [viewPhase, setViewPhase] = useState("stage1");

    const [stage1, setStage1] = useState(null);
    const [stage2, setStage2] = useState(null);
    const [stage3, setStage3] = useState(null);
    const [playoffs, setPlayoffs] = useState(null);

    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState(null);
    const [modalLeftTeam, setModalLeftTeam] = useState(null);
    const [modalRightTeam, setModalRightTeam] = useState(null);
    const [hasChosen, setHasChosen] = useState(false);
    const [hasPlayedWinnerAnimation, setHasPlayedWinnerAnimation] = useState(false);

    const [seriesState, setSeriesState] = useState(defaultSeriesState);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const [multiplierMin, setMultiplierMin] = useState(MULTIPLIER_MIN);
    const [multiplierMax, setMultiplierMax] = useState(MULTIPLIER_MAX);
    // eslint-disable-next-line no-unused-vars
    const [cheatMode, setCheatMode] = useState(0);

    const [neededPickemPoints, setNeededPickemPoints] = useState(() => getRandomNeededPickemPoints());
    const [finalPickemPoints, setFinalPickemPoints] = useState(0);

    const [hoveredTeamId, setHoveredTeamId] = useState(null);

    const [guessedCounts, setGuessedCounts] = useState({
        stage1: 0,
        stage2: 0,
        stage3: 0,
        ro16: 0,
        qf: 0,
        sf: 0,
        tpd: 0,
        gf: 0,
    });

    const [showPickemSummary, setShowPickemSummary] = useState(false);
    const [showPickemLine2, setShowPickemLine2] = useState(false);
    const [showPickemResult, setShowPickemResult] = useState(false);

    const [showWinnersScreen, setShowWinnersScreen] = useState(false);
    const [tournamentResults, setTournamentResults] = useState(null);
    const [showWinnerText, setShowWinnerText] = useState(false);
    const [showPodium, setShowPodium] = useState(false);
    const [showProceed, setShowProceed] = useState(false);
    const [winnersText, setWinnersText] = useState("And the Fourth Place is:");

    const [hover, setHover] = useState(false);

    const [teamRatings, setTeamRatings] = useState(() => loadTeamRatings(allTeams));
    const teamRatingsRef = useRef(teamRatings);

    useEffect(() => {
        teamRatingsRef.current = teamRatings;
    }, [teamRatings]);

    const leaderboard = useMemo(() => buildLeaderboard(allTeams, teamRatings), [allTeams, teamRatings]);
    const { rankById } = leaderboard;

    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const ratingsSnapshotRef = useRef(loadRatingsSnapshot());

    const [isScoreBoardResetModalOpen, setIsScoreBoardResetModalOpen] = useState(false);
    const [isScoreBoardResetConfirmModalOpen, setIsScoreBoardResetConfirmModalOpen] = useState(false);

    const [scoreboardResetCode, setScoreboardResetCode] = useState("");

    const [teamPlacings, setTeamPlacings] = useState(() => loadTeamPlacings(allTeams));
    const teamPlacingsRef = useRef(teamPlacings);
    const tournamentSeedsRef = useRef(null);
    const netEntryCounterRef = useRef(1);

    useEffect(() => {
        teamPlacingsRef.current = teamPlacings;
    }, [teamPlacings]);

    const [isAddPlacingsCodeModalOpen, setIsAddPlacingsCodeModalOpen] = useState(false);
    const [isAddPlacingsModalOpen, setIsAddPlacingsModalOpen] = useState(false);
    const [isAddPlacingsFinalModalOpen, setIsAddPlacingsFinalModalOpen] = useState(false);

    const [isRemovePlacingsCodeModalOpen, setIsRemovePlacingsCodeModalOpen] = useState(false);
    const [isRemovePlacingsModalOpen, setIsRemovePlacingsModalOpen] = useState(false);
    const [isRemovePlacingsFinalModalOpen, setIsRemovePlacingsFinalModalOpen] = useState(false);

    const [placingsAdminCode, setPlacingsAdminCode] = useState("");

    const [tournamentNumber, setTournamentNumber] = useState(() => loadTournamentNumber());

    const [isTournamentNumberCodeModalOpen, setIsTournamentNumberCodeModalOpen] = useState(false);
    const [isTournamentNumberModalOpen, setIsTournamentNumberModalOpen] = useState(false);
    const [isTournamentNumberFinalModalOpen, setIsTournamentNumberFinalModalOpen] = useState(false);
    const [tournamentNumberCode, setTournamentNumberCode] = useState("");
    const [tournamentNumberMode, setTournamentNumberMode] = useState("add");
    const [tournamentNumberAmount, setTournamentNumberAmount] = useState("");
    const [isTournamentNumberButtonArmed, setIsTournamentNumberButtonArmed] = useState(false);

    const [selectedPlacingTeamIds, setSelectedPlacingTeamIds] = useState([]);

    const [placingCategory, setPlacingCategory] = useState("");
    const [placingAmount, setPlacingAmount] = useState("");

    const modalRef = useRef(null);
    const [modalScale, setModalScale] = useState(1);

    const getStageObj = (key) => {
        if (key === "stage1") return stage1;
        if (key === "stage2") return stage2;
        if (key === "stage3") return stage3;
        return null;
    };

    const currentModalMatch = useMemo(() => {
        if (!modalContext) return null;

        if (modalContext.type === "swiss") {
            const stg = getStageObj(modalContext.stageKey);
            if (!stg) return null;
            const arr = stg.matchesByNet[modalContext.net] || [];
            return arr.find((m) => m.id === modalContext.matchId) || null;
        }

        if (modalContext.type === "playoffs") {
            if (!playoffs) return null;
            const arr = playoffs[modalContext.stage] || [];
            return arr.find((m) => m.id === modalContext.matchId) || null;
        }

        return null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalContext, stage1, stage2, stage3, playoffs]);

    const modalBestOf = useMemo(() => {
        if (!modalContext) return null;
        if (modalContext.type === "swiss") return getBestOfForSwissNet(modalContext.net, modalContext.stageKey);
        return getBestOfForPlayoffs(modalContext.stage);
    }, [modalContext]);
    const isBo1Modal = modalBestOf === 1;

    const getPickOrientedModalView = (match, isBo1) => {
        if (!match) {
            return {
                leftTeam: null,
                rightTeam: null,
                shouldSwap: false,
                displayLeft: null,
                displayRight: null,
                didUserWin: false,
                leftIsPick: false,
                rightIsPick: false,
                winnerIsLeft: false,
                winnerIsRight: false,
                leftIsLoser: false,
                rightIsLoser: false,
            };
        }

        const slotA = match.slotA || null;
        const slotB = match.slotB || null;

        const shouldSwap =
            !!match.pickTeamId && slotA && slotB && match.pickTeamId === slotB.id;

        const leftTeam = shouldSwap ? slotB : slotA;
        const rightTeam = shouldSwap ? slotA : slotB;

        const bo1History =
            isBo1 && match.setHistory?.length
                ? match.setHistory[0]
                : null;

        const bo1MapScore = bo1History
            ? {
                left: bo1History.wins,
                right: bo1History.losses,
            }
            : null;

        const bo1Tiebreak =
            bo1History?.extendedRounds?.penalties
                ? {
                    type: "Pens",
                    left: bo1History.extendedRounds.penalties.leftScore,
                    right: bo1History.extendedRounds.penalties.rightScore,
                }
                : bo1History?.extendedRounds
                    ? (() => {
                        const winners = buildExtendedRoundWinnerList(bo1History.extendedRounds);

                        let left = 0;
                        let right = 0;

                        winners.forEach((w) => {
                            if (w.winner === "left") left++;
                            else if (w.winner === "right") right++;
                        });

                        return left || right
                            ? {
                                type: "ERs",
                                left,
                                right,
                            }
                            : null;
                    })()
                    : null;

        const slotOrientedLeft =
            bo1MapScore && bo1MapScore.left != null ? bo1MapScore.left : match.scoreLeft;

        const slotOrientedRight =
            bo1MapScore && bo1MapScore.right != null ? bo1MapScore.right : match.scoreRight;

        const displayLeft =
            bo1MapScore
                ? bo1MapScore.left
                : (shouldSwap ? slotOrientedRight : slotOrientedLeft);

        const displayRight =
            bo1MapScore
                ? bo1MapScore.right
                : (shouldSwap ? slotOrientedLeft : slotOrientedRight);

        const didUserWin =
            !!match.played &&
            !!match.pickTeamId &&
            !!match.winnerTeamId &&
            match.pickTeamId === match.winnerTeamId;

        const leftIsPick = !!match.pickTeamId && leftTeam && match.pickTeamId === leftTeam.id;
        const rightIsPick = !!match.pickTeamId && rightTeam && match.pickTeamId === rightTeam.id;

        const winnerIsLeft = !!match.winnerTeamId && leftTeam && match.winnerTeamId === leftTeam.id;
        const winnerIsRight = !!match.winnerTeamId && rightTeam && match.winnerTeamId === rightTeam.id;

        const leftIsLoser = !!match.loserTeamId && leftTeam && match.loserTeamId === leftTeam.id;
        const rightIsLoser = !!match.loserTeamId && rightTeam && match.loserTeamId === rightTeam.id;

        return {
            leftTeam,
            rightTeam,
            shouldSwap,
            displayLeft,
            displayRight,
            bo1Tiebreak,
            didUserWin,
            leftIsPick,
            rightIsPick,
            winnerIsLeft,
            winnerIsRight,
            leftIsLoser,
            rightIsLoser,
        };
    };

    const {
        displayLeft: modalScoreLeft,
        displayRight: modalScoreRight,
    } = getPickOrientedModalView(
        currentModalMatch,
        isBo1Modal
    );

    const playedSets = isBo1Modal
        ? 1
        : (modalScoreLeft ?? 0) + (modalScoreRight ?? 0);

    useLayoutEffect(() => {
        const updateScale = () => {
            if (!modalRef.current) return;

            if (playedSets < 7) {
                setModalScale(1);
                return;
            }

            const modalHeight = modalRef.current.offsetHeight;
            const availableHeight = window.innerHeight * 0.95;

            setModalScale(
                modalHeight > availableHeight
                    ? availableHeight / modalHeight
                    : 1
            );
        };

        updateScale();

        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, [playedSets, currentModalMatch]);

    const lastToastTime = useRef(0);

    const roundLogRef = useRef(
        (() => {
            try {
                const raw = localStorage.getItem(ROUND_LOG_LS_KEY);
                const parsed = raw ? JSON.parse(raw) : [];
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        })()
    );

    const persistRoundLog = () => {
        try {
            localStorage.setItem(ROUND_LOG_LS_KEY, JSON.stringify(roundLogRef.current));
        } catch {
            /* ignore */
        }
    };

    const logRound = (entry) => {
        const list = roundLogRef.current;
        if (list.some((e) => e.key === entry.key)) return;
        list.push(entry);
        persistRoundLog();
    };

    const clearRoundLog = () => {
        roundLogRef.current = [];
        try {
            localStorage.removeItem(ROUND_LOG_LS_KEY);
        } catch {
            /* ignore */
        }
    };

    const [breakdownSetIndex, setBreakdownSetIndex] = useState(null);


    const navRef = useRef(null);

    const [indicator, setIndicator] = useState({
        top: 0,
        height: 0,
    });

    const updateResultsIndicator = useCallback(() => {
        if (!navRef.current) return;

        const active = navRef.current.querySelector(
            "[data-results-active='true']"
        );

        if (!active) {
            setIndicator({
                top: 0,
                height: 0,
            });
            return;
        }

        const rect = active.getBoundingClientRect();
        const parentRect = navRef.current.getBoundingClientRect();

        setIndicator({
            top: rect.top - parentRect.top,
            height: rect.height,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewPhase]);

    useEffect(() => {
        requestAnimationFrame(updateResultsIndicator);
    }, [
        viewPhase,
        activePhase,
        updateResultsIndicator,
    ]);

    useEffect(() => {
        updateResultsIndicator();

        const handleResize = () => updateResultsIndicator();

        window.addEventListener("resize", handleResize);

        return () =>
            window.removeEventListener("resize", handleResize);
    }, [updateResultsIndicator]);

    const hasAnyPlacings = useMemo(() => {
        const vals = Object.values(teamPlacings ?? {});
        return vals.some((p) => (p?.wins ?? 0) > 0 || (p?.seconds ?? 0) > 0 || (p?.thirds ?? 0) > 0);
    }, [teamPlacings]);

    const [arePlacingButtonsArmed, setArePlacingButtonsArmed] = useState(false);

    useEffect(() => {
        if (!isLeaderboardOpen) setArePlacingButtonsArmed(false);
    }, [isLeaderboardOpen]);

    const handleAddPlacingsClick = () => {
        if (!arePlacingButtonsArmed) {
            setArePlacingButtonsArmed(true);
            return;
        }
        setIsAddPlacingsCodeModalOpen(true);
    };

    const handleRemovePlacingsClick = () => {
        if (!hasAnyPlacings) return;
        if (!arePlacingButtonsArmed) {
            setArePlacingButtonsArmed(true);
            return;
        }
        setIsRemovePlacingsCodeModalOpen(true);
    };

    const isSeriesActive = seriesState.active;

    const isScoreboardAlreadyDefault = useMemo(() => {
        return areRatingsAtDefault(allTeams, teamRatings);
    }, [allTeams, teamRatings]);

    const isTournamentNumberAlreadyDefault = useMemo(() => {
        return tournamentNumber === 0;
    }, [tournamentNumber]);

    const isButtonLocked =
        isCalculating ||
        isRestartModalOpen ||
        isTerminateModalOpen ||
        isScoreBoardResetModalOpen ||
        isScoreBoardResetConfirmModalOpen ||
        isAddPlacingsCodeModalOpen ||
        isAddPlacingsModalOpen ||
        isAddPlacingsFinalModalOpen ||
        isRemovePlacingsCodeModalOpen ||
        isRemovePlacingsModalOpen ||
        isRemovePlacingsFinalModalOpen ||
        isTournamentNumberCodeModalOpen ||
        isTournamentNumberModalOpen ||
        isTournamentNumberFinalModalOpen ||
        showIntro ||
        isLocked;

    const isTournamentNumberButtonLocked =
        isCalculating ||
        isRestartModalOpen ||
        isTerminateModalOpen ||
        isScoreBoardResetModalOpen ||
        isScoreBoardResetConfirmModalOpen ||
        isAddPlacingsCodeModalOpen ||
        isAddPlacingsModalOpen ||
        isAddPlacingsFinalModalOpen ||
        isRemovePlacingsCodeModalOpen ||
        isRemovePlacingsModalOpen ||
        isRemovePlacingsFinalModalOpen ||
        isTournamentNumberCodeModalOpen ||
        isTournamentNumberModalOpen ||
        isTournamentNumberFinalModalOpen ||
        isLocked;

    const isMatchRectLocked =
        isCalculating ||
        isRestartModalOpen ||
        isTerminateModalOpen ||
        isScoreBoardResetModalOpen ||
        isScoreBoardResetConfirmModalOpen ||
        isAddPlacingsCodeModalOpen ||
        isAddPlacingsModalOpen ||
        isAddPlacingsFinalModalOpen ||
        isRemovePlacingsCodeModalOpen ||
        isRemovePlacingsModalOpen ||
        isRemovePlacingsFinalModalOpen ||
        isTournamentNumberCodeModalOpen ||
        isTournamentNumberModalOpen ||
        isTournamentNumberFinalModalOpen ||
        showIntro ||
        isLocked;

    const isScoreBoardButtonLocked =
        isTerminateModalOpen ||
        isRestartModalOpen ||
        isScoreBoardResetModalOpen ||
        isScoreBoardResetConfirmModalOpen ||
        isAddPlacingsCodeModalOpen ||
        isAddPlacingsModalOpen ||
        isAddPlacingsFinalModalOpen ||
        isRemovePlacingsCodeModalOpen ||
        isRemovePlacingsModalOpen ||
        isRemovePlacingsFinalModalOpen ||
        isTournamentNumberCodeModalOpen ||
        isTournamentNumberModalOpen ||
        isTournamentNumberFinalModalOpen ||
        isLocked;
    
    const isScoreBoardResetButtonLocked =
        (isScoreboardAlreadyDefault && isTournamentNumberAlreadyDefault) ||
        isTerminateModalOpen ||
        isRestartModalOpen ||
        isScoreBoardResetModalOpen ||
        isScoreBoardResetConfirmModalOpen ||
        isAddPlacingsCodeModalOpen ||
        isAddPlacingsModalOpen ||
        isAddPlacingsFinalModalOpen ||
        isRemovePlacingsCodeModalOpen ||
        isRemovePlacingsModalOpen ||
        isRemovePlacingsFinalModalOpen ||
        isTournamentNumberCodeModalOpen ||
        isTournamentNumberModalOpen ||
        isTournamentNumberFinalModalOpen ||
        isLocked;

    const isReadOnlyView = viewPhase.startsWith("results_");

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            const seeds = classifyTeamsForStages(allTeams, teamRatingsRef.current);
            tournamentSeedsRef.current = seeds;

            const s1 = buildSwissStage("stage1", seeds.stage1Seeds.map(toBaseTeam));
            setStage1(s1);
            setStage2(null);
            setStage3(null);
            setPlayoffs(null);
            setActivePhase("stage1");
            setViewPhase("stage1");
            return;
        }

        try {
            const parsed = JSON.parse(saved);

            tournamentSeedsRef.current = parsed.tournamentSeeds ?? null;
            setShowIntro(parsed.showIntro ?? true);

            setActivePhase(parsed.activePhase ?? "stage1");
            setViewPhase(parsed.viewPhase ?? "stage1");

            setStage1(parsed.stage1 ?? null);
            setStage2(parsed.stage2 ?? null);
            setStage3(parsed.stage3 ?? null);
            setPlayoffs(parsed.playoffs ?? null);

            setSeriesState(parsed.seriesState ? { ...defaultSeriesState, ...parsed.seriesState } : defaultSeriesState);

            setNeededPickemPoints(parsed.neededPickemPoints ?? getRandomNeededPickemPoints());
            setFinalPickemPoints(parsed.finalPickemPoints ?? 0);
            setGuessedCounts(parsed.guessedCounts ?? guessedCounts);

            setShowPickemSummary(parsed.showPickemSummary ?? false);
            setShowPickemLine2(parsed.showPickemLine2 ?? false);
            setShowPickemResult(parsed.showPickemResult ?? false);

            setShowWinnersScreen(parsed.showWinnersScreen ?? false);
            setTournamentResults(parsed.tournamentResults ?? null);
            setShowWinnerText(parsed.showWinnerText ?? false)
            setShowPodium(parsed.showWinnerText ?? false)
            setShowProceed(parsed.showWinnerText ?? false)
            setWinnersText(parsed.winnersText ?? "And the Fourth Place is:");
            setHasPlayedWinnerAnimation(parsed.hasPlayedWinnerAnimation ?? false);
        } catch (e) {
            console.error(e);
            const seeds = tournamentSeedsRef.current ?? classifyTeamsForStages(allTeams, teamRatingsRef.current);
            const s1 = buildSwissStage("stage1", seeds.stage1Seeds.map(toBaseTeam));
            setStage1(s1);
            setStage2(null);
            setStage3(null);
            setPlayoffs(null);
            setActivePhase("stage1");
            setViewPhase("stage1");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const stateToSave = {
            showIntro,
            showTournamentIntro,
            activePhase,
            viewPhase,
            stage1,
            stage2,
            stage3,
            playoffs,
            seriesState,
            neededPickemPoints,
            finalPickemPoints,
            guessedCounts,
            showPickemSummary,
            showPickemLine2,
            showPickemResult,
            showWinnersScreen,
            tournamentResults,
            showWinnerText,
            showPodium,
            showProceed,
            winnersText,
            hasPlayedWinnerAnimation,

            tournamentSeeds: tournamentSeedsRef.current
                ? {
                    stage1Seeds: tournamentSeedsRef.current.stage1Seeds.map(toBaseTeam),
                    stage2Seeds: tournamentSeedsRef.current.stage2Seeds.map(toBaseTeam),
                    stage3Seeds: tournamentSeedsRef.current.stage3Seeds.map(toBaseTeam),
                }
                : null,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [
        showIntro,
        showTournamentIntro,
        activePhase,
        viewPhase,
        stage1,
        stage2,
        stage3,
        playoffs,
        seriesState,
        neededPickemPoints,
        finalPickemPoints,
        guessedCounts,
        showPickemSummary,
        showPickemLine2,
        showPickemResult,
        showWinnersScreen,
        tournamentResults,
        showWinnerText,
        showPodium,
        showProceed,
        winnersText,
        hasPlayedWinnerAnimation,
    ]);

    useEffect(() => {
        saveTournamentNumber(tournamentNumber);
    }, [tournamentNumber]);

    const getTournamentTheme = (number) => {
        if (number < 5) return null;

        return (
            ANNIVERSARY_THEMES.find(
                theme =>
                    number >= theme.min &&
                    number <= theme.max &&
                    number % theme.every === 0
            ) ?? null
        );
    };

    const tournamentTheme = getTournamentTheme(tournamentNumber);

    const tournamentLabel = useMemo(() => (
        <>
            Official{" "}
            <span
                style={
                    tournamentTheme
                        ? {
                            backgroundImage: tournamentTheme.gradient,
                            backgroundRepeat: "no-repeat",
                            backgroundSize: tournamentTheme.animation
                                ? "120% 120%"
                                : "100% 100%",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            color: "transparent",
                            filter: `drop-shadow(0 0 3px ${tournamentTheme.glow})`,
                            animation: tournamentTheme.animation,
                        }
                        : undefined
                }
            >
                #{tournamentNumber}
            </span>
        </>
    ), [tournamentNumber, tournamentTheme]);

    const clearTournamentNumberAdminState = () => {
        setTournamentNumberCode("");
        setTournamentNumberMode("add");
        setTournamentNumberAmount("");
    };

    const handleTournamentNumberClick = () => {
        clearTournamentNumberAdminState();
        setIsTournamentNumberCodeModalOpen(true);
    };

    const handleCloseTournamentNumberModals = () => {
        setIsTournamentNumberCodeModalOpen(false);
        setIsTournamentNumberModalOpen(false);
        setIsTournamentNumberFinalModalOpen(false);
        clearTournamentNumberAdminState();
    };

    const handleVerifyTournamentNumberPassword = () => {
        if (!SCOREBOARD_RESET_CODE) {
            toast.error("Reset code is not configured.");
            return;
        }
        if (tournamentNumberCode !== SCOREBOARD_RESET_CODE) {
            toast.error("WRONG PASSWORD!");
            return;
        }
        toast.success("Password correct!!!");
        setTournamentNumberCode("");
        setIsTournamentNumberCodeModalOpen(false);
        setIsTournamentNumberModalOpen(true);
    };

    const getNextTournamentNumber = () => {
        const amount = parseInt(tournamentNumberAmount, 10);
        if (!Number.isFinite(amount)) return tournamentNumber;

        if (tournamentNumberMode === "add")
            return tournamentNumber + amount;

        if (tournamentNumberMode === "subtract")
            return Math.max(0, tournamentNumber - amount);

        return Math.max(0, amount);
    };

    const handleSubmitTournamentNumber = () => {
        const amount = parseInt(tournamentNumberAmount, 10);
        if (!Number.isFinite(amount)) {
            toast.error("Put in a number first.");
            return;
        }
        setIsTournamentNumberModalOpen(false);
        setIsTournamentNumberFinalModalOpen(true);
    };

    const handleConfirmTournamentNumber = () => {
        const next = getNextTournamentNumber();
        setTournamentNumber(next);
        saveTournamentNumber(next);
        setIsTournamentNumberFinalModalOpen(false);
        clearTournamentNumberAdminState();
        toast.success(`Tournament number is now #${next}.`);
    };

    const confirmRestart = () => {
        localStorage.removeItem(STORAGE_KEY);
        if (!tournamentResults) {
            setTournamentNumber((prev) => {
                const next = Math.max(0, prev - 1);
                saveTournamentNumber(next);
                return next;
            });
        }

        tournamentSeedsRef.current = null;

        if (ratingsSnapshotRef.current) {
            setTeamRatings(ratingsSnapshotRef.current);
            teamRatingsRef.current = ratingsSnapshotRef.current;
            saveTeamRatings(ratingsSnapshotRef.current);

            ratingsSnapshotRef.current = null;
            clearRatingsSnapshot();
        }

        const seeds = classifyTeamsForStages(allTeams, teamRatingsRef.current);
        tournamentSeedsRef.current = seeds;

        const s1 = buildSwissStage("stage1", seeds.stage1Seeds.map(toBaseTeam));
        setStage1(s1);
        setStage2(null);
        setStage3(null);
        setPlayoffs(null);

        setActivePhase("stage1");
        setViewPhase("stage1");
        setShowIntro(true);

        setSeriesState(defaultSeriesState);
        clearRoundLog();

        setNeededPickemPoints(getRandomNeededPickemPoints());
        setFinalPickemPoints(0);
        setGuessedCounts({ stage1: 0, stage2: 0, stage3: 0, ro16: 0, qf: 0, sf: 0, tpd: 0, gf: 0 });

        setShowPickemSummary(false);
        setShowPickemLine2(false);
        setShowPickemResult(false);

        setShowWinnersScreen(false);
        setTournamentResults(null);

        setHasPlayedWinnerAnimation(false);
        setWinnersText("And the Fourth Place is:");

        setIsRestartModalOpen(false);
    };

    const confirmTerminate = () => {
        setIsTerminateModalOpen(false);
        navigate("/");
    };

    const resetSpecialModeState = () => {
        confirmRestart();
        setIsRestartModalOpen(false);
        setIsTerminateModalOpen(false);
    };

    const handleCloseScoreboardResetModal = () => {
        setIsScoreBoardResetModalOpen(false);
        setScoreboardResetCode("");
    };

    const handleVerifyScoreboardResetPassword = () => {
        if (!SCOREBOARD_RESET_CODE) {
            toast.error("Reset code is not configured.");
            return;
        }

        if (scoreboardResetCode !== SCOREBOARD_RESET_CODE) {
            toast.error("WRONG PASSWORD!");
            return;
        }

        toast.success("Password correct!!!");
        setIsScoreBoardResetModalOpen(false);
        setScoreboardResetCode("");
        setIsScoreBoardResetConfirmModalOpen(true);
    };

    const allTeamIds = allTeams.map(t => t.id);

    const allSelected =
        selectedPlacingTeamIds.length === allTeamIds.length && allTeamIds.length > 0;

    const hasAnySelected = selectedPlacingTeamIds.length > 0;

    const resetTournamentStateWithSeeds = (seededStage1Seeds) => {
        localStorage.removeItem(STORAGE_KEY);
        clearRoundLog();

        const s1 = buildSwissStage("stage1", seededStage1Seeds);
        setStage1(s1);
        setStage2(null);
        setStage3(null);
        setPlayoffs(null);

        setActivePhase("stage1");
        setViewPhase("stage1");
        setShowIntro(true);

        setSeriesState(defaultSeriesState);
        clearRoundLog();

        setNeededPickemPoints(getRandomNeededPickemPoints());
        setFinalPickemPoints(0);
        setGuessedCounts({
            stage1: 0,
            stage2: 0,
            stage3: 0,
            ro16: 0,
            qf: 0,
            sf: 0,
            tpd: 0,
            gf: 0,
        });

        setShowPickemSummary(false);
        setShowPickemLine2(false);
        setShowPickemResult(false);

        setShowWinnersScreen(false);
        setTournamentResults(null);

        setIsRestartModalOpen(false);
        setIsTerminateModalOpen(false);
    };

    const ensureRatingsSnapshot = () => {
        if (ratingsSnapshotRef.current) return;

        const snap = { ...teamRatingsRef.current };
        ratingsSnapshotRef.current = snap;
        saveRatingsSnapshot(snap);
    };

    const handleFinalScoreboardReset = () => {
        const defaults = buildDefaultTeamRatings(allTeams);

        setTeamRatings(defaults);
        teamRatingsRef.current = defaults;
        saveTeamRatings(defaults);

        setTournamentNumber(0);
        saveTournamentNumber(tournamentNumber);

        const seeded = classifyTeamsForStages(allTeams, defaults);

        ratingsSnapshotRef.current = null;
        clearRatingsSnapshot();

        resetTournamentStateWithSeeds(seeded.stage1Seeds);

        setIsScoreBoardResetConfirmModalOpen(false);
        toast.success("Scoreboard has been reset.");
    };

    const handleCancelFinalScoreboardReset = () => {
        setIsScoreBoardResetConfirmModalOpen(false);
    };

    useEffect(() => {
        if (!showIntro) ensureRatingsSnapshot();
    }, [showIntro]);

    const clearPlacingsAdminState = () => {
        setPlacingsAdminCode("");
        setSelectedPlacingTeamIds([]);
        setPlacingCategory("");
        setPlacingAmount("");
    };

    const verifyAdminCodeOrToast = () => {
        if (!SCOREBOARD_RESET_CODE) {
            toast.error("Reset code is not configured.");
            return false;
        }
        if (placingsAdminCode !== SCOREBOARD_RESET_CODE) {
            toast.error("WRONG PASSWORD!");
            return false;
        }
        toast.success("Password correct!!!");
        return true;
    };

    const handleVerifyAddPlacingsPassword = () => {
        if (!verifyAdminCodeOrToast()) return;
        setIsAddPlacingsCodeModalOpen(false);
        setPlacingsAdminCode("");
        setIsAddPlacingsModalOpen(true);
    };

    const toggleTeamSelection = (id) => {
        setSelectedPlacingTeamIds(prev =>
            prev.includes(id)
                ? prev.filter(tid => tid !== id)
                : [...prev, id]
        );
    };

    const canConfirmPlacings = () => {
        const n = Number(placingAmount);

        return (
            !!selectedPlacingTeamIds.length &&
            (
                placingCategory === "wins" ||
                placingCategory === "seconds" ||
                placingCategory === "thirds" ||
                placingCategory === "points"
            ) &&
            Number.isFinite(n) &&
            n > 0
        );
    };

    const canSelectAllPlacings =
        placingCategory &&
        placingCategory === "" &&
        placingAmount &&
        selectedPlacingTeamIds.length > 0 &&
        !allSelected;

    const handleOpenAddPlacingsFinal = () => {
        if (!canConfirmPlacings()) return;
        setIsAddPlacingsModalOpen(false);
        setIsAddPlacingsFinalModalOpen(true);
    };

    const handleApplyAddPlacings = () => {
        const n = Math.max(0, Math.floor(Number(placingAmount)));
        const teamIds = selectedPlacingTeamIds;
        const cat = placingCategory;

        if (cat === "points") {
            setTeamRatings((prev) => {
                const next = { ...prev };

                teamIds.forEach((id) => {
                    next[id] = (next[id] ?? 0) + n;
                });

                saveTeamRatings(next);
                teamRatingsRef.current = next;
                return next;
            });

            setIsAddPlacingsFinalModalOpen(false);
            clearPlacingsAdminState();
            toast.success("Points updated.");
            return;
        }

        setTeamPlacings((prev) => {
            const next = { ...prev };

            teamIds.forEach((id) => {
                const cur = next[id] ?? { wins: 0, seconds: 0, thirds: 0 };

                next[id] = {
                    ...cur,
                    [cat]: (cur[cat] ?? 0) + n,
                };
            });

            saveTeamPlacings(next);
            return next;
        });

        setIsAddPlacingsFinalModalOpen(false);
        clearPlacingsAdminState();
        toast.success("Placings updated.");
    };

    const handleVerifyRemovePlacingsPassword = () => {
        if (!verifyAdminCodeOrToast()) return;
        setIsRemovePlacingsCodeModalOpen(false);
        setPlacingsAdminCode("");
        setIsRemovePlacingsModalOpen(true);
    };

    const getTeamsForRemovePicker = () => {
        if (!placingCategory) return [];

        return leaderboard.sorted.filter((t) => {
            const p = teamPlacings?.[t.id];

            if (placingCategory === "wins") return (p?.wins ?? 0) > 0;
            if (placingCategory === "seconds") return (p?.seconds ?? 0) > 0;
            if (placingCategory === "thirds") return (p?.thirds ?? 0) > 0;
            if (placingCategory === "points") return (teamRatings?.[t.id] ?? 0) > 0;

            return false;
        });
    };

    const handleOpenRemovePlacingsFinal = () => {
        if (!canConfirmPlacings()) return;
        setIsRemovePlacingsModalOpen(false);
        setIsRemovePlacingsFinalModalOpen(true);
    };

    const handleApplyRemovePlacings = () => {
        const n = Math.max(0, Math.floor(Number(placingAmount)));
        const teamIds = selectedPlacingTeamIds;
        const cat = placingCategory;

        if (cat === "points") {
            setTeamRatings((prev) => {
                const next = { ...prev };

                teamIds.forEach((id) => {
                    next[id] = Math.max(0, (next[id] ?? 0) - n);
                });

                saveTeamRatings(next);
                teamRatingsRef.current = next;
                return next;
            });

            setIsRemovePlacingsFinalModalOpen(false);
            clearPlacingsAdminState();
            toast.success("Points updated.");
            return;
        }

        setTeamPlacings((prev) => {
            const next = { ...prev };

            teamIds.forEach((id) => {
                const cur = next[id] ?? { wins: 0, seconds: 0, thirds: 0 };

                next[id] = {
                    ...cur,
                    [cat]: Math.max(0, (cur[cat] ?? 0) - n),
                };
            });

            saveTeamPlacings(next);
            return next;
        });

        setIsRemovePlacingsFinalModalOpen(false);
        clearPlacingsAdminState();
        toast.success("Placings updated.");
    };

    const getDisplayedValue = (t) => {
        const p = teamPlacings?.[t.id] ?? { wins: 0, seconds: 0, thirds: 0 };

        if (placingCategory === "wins") return p.wins ?? 0;
        if (placingCategory === "seconds") return p.seconds ?? 0;
        if (placingCategory === "thirds") return p.thirds ?? 0;
        if (placingCategory === "points") return teamRatings?.[t.id] ?? 0;
        if (placingCategory === "") return null;
        return teamRatings?.[t.id] ?? 0;
    };

    const getSortValue = (t) => {
        const p = teamPlacings?.[t.id] ?? { wins: 0, seconds: 0, thirds: 0 };

        switch (placingCategory) {
            case "wins":
                return p.wins ?? 0;
            case "seconds":
                return p.seconds ?? 0;
            case "thirds":
                return p.thirds ?? 0;
            case "points":
                return teamRatings?.[t.id] ?? 0;
            default:
                return teamRatings?.[t.id] ?? 0;
        }
    };

    const toggleSelectAllTeams = () => {
        setSelectedPlacingTeamIds(prev => {
            if (prev.length === allTeamIds.length) return [];
            return [...allTeamIds];
        });
    };

    const handleTournamentStart = () => {
        tournamentSeedsRef.current = classifyTeamsForStages(allTeams, teamRatingsRef.current);

        setTournamentNumber((prev) => {
            const next = prev + 1;
            saveTournamentNumber(next);
            return next;
        });

        setShowIntro(false);
        setShowTournamentIntro(true);
    };

    const handleCloseTournamentIntro = () => {
        setShowTournamentIntro(false);
    };

    const buildStage2IfNeeded = (s1) => {
        if (stage2) return stage2;

        const frozen = tournamentSeedsRef.current || classifyTeamsForStages(allTeams, teamRatingsRef.current);

        const qualifiers = getSwissQualified(s1).map(toBaseTeam);
        const seeds = frozen.stage2Seeds.map(toBaseTeam);

        const combined = uniqById([...seeds, ...qualifiers]);

        return buildSwissStage("stage2", combined);
    };

    const buildStage3IfNeeded = (s2) => {
        if (stage3) return stage3;

        const frozen = tournamentSeedsRef.current || classifyTeamsForStages(allTeams, teamRatingsRef.current);

        const qualifiers = getSwissQualified(s2).map(toBaseTeam);
        const seeds = frozen.stage3Seeds.map(toBaseTeam);

        const combined = uniqById([...seeds, ...qualifiers]);

        return buildSwissStage("stage3", combined);
    };

    const buildPlayoffsIfNeeded = (s3) => {
        if (playoffs) return playoffs;
        const qualifiers = getSwissQualified(s3).slice(0, 16);
        return buildPlayoffsBracket(qualifiers);
    };

    const calculateBuchholz = (stage) => {
        const teamMap = Object.fromEntries(
            stage.teams.map((t) => [t.id, t])
        );

        stage.teams.forEach((team) => {
            team.buchholz = team.opponents.reduce(
                (sum, oppId) => {
                    const opp = teamMap[oppId];
                    return sum + (opp?.wins ?? 0);
                },
                0
            );
        });
    };

    const swissMatchPoints = (match) => {
        if (!match.played || !match.pickTeamId) return 0;

        const bestOf = getBestOfForSwissNet(match.net, match.stageKey);

        const isCorrectPick = match.winnerTeamId === match.pickTeamId;

        if (bestOf === 1) {
            return isCorrectPick ? 1 : 0;
        }

        if (bestOf === 3) {
            if (isCorrectPick) return 3;

            const pickedIsLeft =
                match.slotA && match.pickTeamId === match.slotA.id;

            const pickedSets = pickedIsLeft
                ? (match.scoreLeft ?? 0)
                : (match.scoreRight ?? 0);

            return pickedSets >= 1 ? 2 : 0;
        }

        if (bestOf === 5) {
            if (isCorrectPick) return 5;

            const pickedIsLeft =
                match.slotA && match.pickTeamId === match.slotA.id;

            const pickedSets = pickedIsLeft
                ? (match.scoreLeft ?? 0)
                : (match.scoreRight ?? 0);

            if (pickedSets >= 2) return 4;
            if (pickedSets >= 1) return 2;

            return 0;
        }

        return 0;
    };

    const playoffsMatchPoints = (match) => {
        if (!match.played || !match.pickTeamId) return 0;
        const baseMap = { ro16: 5, qf: 5, sf: 7, thirdPlace: 7, gf: 9 };
        const base = baseMap[match.stage] ?? 0;

        if (match.winnerTeamId === match.pickTeamId) return base;

        const pickedIsLeft = match.slotA && match.pickTeamId === match.slotA.id;
        const pickedSets = pickedIsLeft ? (match.scoreLeft ?? 0) : (match.scoreRight ?? 0);
        return (pickedSets || 0) * 2;
    };

    const resolveSwissMatchResult = (stage, match, winnerTeamId, scoreLeft, scoreRight) => {
        if (!match?.slotA || !match?.slotB) return;

        const winner = winnerTeamId === match.slotA.id ? match.slotA : match.slotB;
        const loser = winnerTeamId === match.slotA.id ? match.slotB : match.slotA;

        winner.wins += 1;
        winner.netEntryOrder = netEntryCounterRef.current++;
        loser.losses += 1;
        loser.netEntryOrder = netEntryCounterRef.current++;

        match.played = true;
        match.scoreLeft = scoreLeft;
        match.scoreRight = scoreRight;
        match.winnerTeamId = winner.id;
        match.loserTeamId = loser.id;
        winner.opponents.push(loser.id);
        loser.opponents.push(winner.id);

        if (typeof stage.resultCounter !== "number") stage.resultCounter = 0;

        if (!winner.qualified && winner.wins >= 3) {
            winner.qualified = true;
            winner.qualifiedVia = `3:${winner.losses}`;
            winner.qualifiedAt = ++stage.resultCounter;
        }

        if (!loser.eliminated && loser.losses >= 3) {
            loser.eliminated = true;
            loser.eliminatedVia = `${loser.wins}:3`;
            loser.eliminatedAt = ++stage.resultCounter;
        }
    };

    const recomputePickemTotals = () => {
        let total = 0;
        const nextCounts = {
            stage1: 0,
            stage2: 0,
            stage3: 0,
            ro16: 0,
            qf: 0,
            sf: 0,
            tpd: 0,
            gf: 0,
            correct: 0,
        };

        const applySwiss = (stg, countKey) => {
            if (!stg) return;
            Object.values(stg.matchesByNet || {}).forEach((arr) => {
                arr.forEach((m) => {
                    if (!m.played || !m.pickTeamId) return;
                    total += swissMatchPoints(m);
                    if (m.winnerTeamId === m.pickTeamId) nextCounts[countKey] += 1;
                    if (m.winnerTeamId === m.pickTeamId) {
                        nextCounts.correct += swissMatchPoints(m);
                    }
                });
            });
        };

        const applyPlayoffs = (br) => {
            if (!br) return;
            const addStage = (stageKey, countKey) => {
                const arr = br[stageKey] || [];
                arr.forEach((m) => {
                    if (!m.played || !m.pickTeamId) return;
                    total += playoffsMatchPoints(m);
                    if (m.winnerTeamId === m.pickTeamId) nextCounts[countKey] += 1;
                    if (m.winnerTeamId === m.pickTeamId) {
                        nextCounts.correct += playoffsMatchPoints(m);
                    }
                });
            };

            addStage("ro16", "ro16");
            addStage("qf", "qf");
            addStage("sf", "sf");
            addStage("thirdPlace", "tpd");
            addStage("gf", "gf");
        };

        applySwiss(stage1, "stage1");
        applySwiss(stage2, "stage2");
        applySwiss(stage3, "stage3");
        applyPlayoffs(playoffs);

        setFinalPickemPoints(total);
        setGuessedCounts(nextCounts);
    };

    const openSwissMatchModal = (stageKey, net, matchId, readOnly = false) => {
        const stg = getStageObj(stageKey);
        if (!stg) return;

        const match = (stg.matchesByNet[net] || []).find((m) => m.id === matchId);
        if (!match || !match.slotA || !match.slotB) return;

        setModalContext({ type: "swiss", stageKey, net, matchId, readOnly });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openPlayoffsMatchModal = (stage, matchId, readOnly = false) => {
        if (!playoffs) return;
        const match = (playoffs[stage] || []).find((m) => m.id === matchId);
        if (!match || !match.slotA || !match.slotB) return;

        setModalContext({ type: "playoffs", stage, matchId, readOnly });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const closeMatchModal = () => {
        setIsMatchModalOpen(false);
        setModalContext(null);
        setModalLeftTeam(null);
        setModalRightTeam(null);
        setHasChosen(false);
    };

    const handleChooseLeft = () => {
        setHasChosen(true);
    };

    const handleChooseRight = () => {
        if (!modalLeftTeam || !modalRightTeam) return;
        setModalLeftTeam(modalRightTeam);
        setModalRightTeam(modalLeftTeam);
        setHasChosen(true);
    };

    const handleStartMatch = () => {
        if (!hasChosen || !modalContext || !modalLeftTeam || !modalRightTeam) return;
        if (modalContext.readOnly) return;

        toast("First Half begins", {
            icon: "🏁",
            duration: 3000,
        });

        const pickedTeamId = modalLeftTeam.id;

        if (modalContext.type === "swiss") {
            const { stageKey, net, matchId } = modalContext;
            const bestOf = getBestOfForSwissNet(net, stageKey);

            const stageObj = stageKey === "stage1" ? stage1 : stageKey === "stage2" ? stage2 : stage3;
            const netArr = (stageObj && stageObj.matchesByNet && stageObj.matchesByNet[net]) ? stageObj.matchesByNet[net] : [];
            const swissMatchNumber = Math.max(1, (netArr || []).findIndex((m) => m.id === matchId) + 1);

            const applyPick = (setter, stageObj) => {
                const copy = {
                    ...stageObj,
                    teams: stageObj.teams.map((t) => ({ ...t })),
                    matchesByNet: { ...stageObj.matchesByNet },
                };
                const arr = [...(copy.matchesByNet[net] || [])];
                const idx = arr.findIndex((m) => m.id === matchId);
                if (idx < 0) return;
                const m = { ...arr[idx] };
                m.pickTeamId = pickedTeamId;
                m.setHistory = [];
                arr[idx] = m;
                copy.matchesByNet[net] = arr;
                setter(copy);
            };

            if (stageKey === "stage1") applyPick(setStage1, stage1);
            if (stageKey === "stage2") applyPick(setStage2, stage2);
            if (stageKey === "stage3") applyPick(setStage3, stage3);

            clearRoundLog();

            setSeriesState({
                ...defaultSeriesState,
                active: true,
                phase: stageKey,
                swissStageKey: stageKey,
                swissNet: net,
                swissMatchId: matchId,
                leftTeam: modalLeftTeam,
                rightTeam: modalRightTeam,
                swissMatchNumber: swissMatchNumber,
                setsToWin: calcSetsToWin(bestOf),
            });

            closeMatchModal();
            return;
        }

        if (modalContext.type === "playoffs") {
            const { stage, matchId } = modalContext;
            const bestOf = getBestOfForPlayoffs(stage);

            const stageArr = (playoffs && playoffs[stage]) ? playoffs[stage] : [];
            const playoffsMatchNumber = Math.max(
                1,
                stageArr.findIndex((m) => m.id === matchId) + 1
            );

            setPlayoffs((prev) => {
                if (!prev) return prev;
                const copy = { ...prev, [stage]: [...prev[stage]] };
                const idx = copy[stage].findIndex((m) => m.id === matchId);
                if (idx < 0) return prev;
                const m = { ...copy[stage][idx] };
                m.pickTeamId = pickedTeamId;
                m.setHistory = [];
                copy[stage][idx] = m;
                return copy;
            });

            clearRoundLog();

            setSeriesState({
                ...defaultSeriesState,
                active: true,
                phase: "playoffs",
                playoffsStage: stage,
                playoffsMatchId: matchId,
                playoffsMatchNumber,
                leftTeam: modalLeftTeam,
                rightTeam: modalRightTeam,
                setsToWin: calcSetsToWin(bestOf),
            });

            closeMatchModal();
        }
    };

    const appendSetToCurrentMatchHistory = (
        wins,
        losses,
        won,
        firstHalfLeft,
        firstHalfRight,
        extendedRounds
    ) => {
        const setEntry = (history) => [
            ...(history || []),
            {
                set: (history?.length || 0) + 1,
                wins,
                losses,
                won,
                firstHalfLeft,
                firstHalfRight,
                extendedRounds,
                roundLog: roundLogRef.current.map((e) => ({ ...e })),
            },
        ];
        if (seriesState.phase === "playoffs" && playoffs && seriesState.playoffsStage && seriesState.playoffsMatchId) {
            const stageKey = seriesState.playoffsStage;
            const matchId = seriesState.playoffsMatchId;

            setPlayoffs((prev) => {
                if (!prev) return prev;
                const copy = { ...prev, [stageKey]: [...prev[stageKey]] };
                const idx = copy[stageKey].findIndex((m) => m.id === matchId);
                if (idx < 0) return prev;
                const m = { ...copy[stageKey][idx] };
                m.setHistory = setEntry(m.setHistory);
                copy[stageKey][idx] = m;
                return copy;
            });
            return;
        }
        const stageKey = seriesState.swissStageKey;
        const net = seriesState.swissNet;
        const matchId = seriesState.swissMatchId;

        const apply = (setter, stg) => {
            const copy = {
                ...stg,
                teams: stg.teams.map((t) => ({ ...t })),
                matchesByNet: { ...stg.matchesByNet },
            };
            const arr = [...(copy.matchesByNet[net] || [])];
            const idx = arr.findIndex((m) => m.id === matchId);
            if (idx < 0) return;
            const m = { ...arr[idx] };
            m.setHistory = setEntry(m.setHistory);
            arr[idx] = m;
            copy.matchesByNet[net] = arr;
            setter(copy);
        };

        if (stageKey === "stage1" && stage1) apply(setStage1, stage1);
        if (stageKey === "stage2" && stage2) apply(setStage2, stage2);
        if (stageKey === "stage3" && stage3) apply(setStage3, stage3);
    };

    const mapSeriesScoresToSlots = (match, leftTeam, rightTeam, leftSets, rightSets) => {
        if (!match?.slotA || !match?.slotB || !leftTeam || !rightTeam) {
            return { scoreLeft: leftSets, scoreRight: rightSets };
        }

        const slotAId = match.slotA.id;
        const slotBId = match.slotB.id;

        const leftId = leftTeam.id;
        const rightId = rightTeam.id;

        const scoreLeft =
            slotAId === leftId ? leftSets :
                slotAId === rightId ? rightSets :
                    0;

        const scoreRight =
            slotBId === rightId ? rightSets :
                slotBId === leftId ? leftSets :
                    0;

        return { scoreLeft, scoreRight };
    };

    const getSwissNetHighlights = (stageObj, net) => {
        if (!stageObj) return { currentId: null, nextId: null };

        const matches = stageObj?.matchesByNet?.[net] || [];
        if (!matches.length) return { currentId: null, nextId: null };
        const currentIndex = matches.findIndex((m) => canOpenSwissMatch(stageObj, net, m));

        if (currentIndex < 0) return { currentId: null, nextId: null };

        const current = matches[currentIndex];

        const nextIndex = matches.findIndex((m, idx) => {
            if (idx <= currentIndex) return false;
            if (m.played) return false;
            return !!m.slotA && !!m.slotB;
        });

        return {
            currentId: current?.id ?? null,
            nextId: nextIndex >= 0 ? matches[nextIndex]?.id ?? null : null,
        };
    };

    const getCommittedSeriesScore = ({
        bestOf,
        seriesState,
        matchObj,
        seriesLeftSets,
        seriesRightSets,
    }) => {
        if (bestOf === 1) {
            const roundLeft = seriesState.roundWins;
            const roundRight = seriesState.roundLosses;

            return mapSeriesScoresToSlots(
                matchObj,
                seriesState.leftTeam,
                seriesState.rightTeam,
                roundLeft,
                roundRight
            );
        }

        return mapSeriesScoresToSlots(
            matchObj,
            seriesState.leftTeam,
            seriesState.rightTeam,
            seriesLeftSets,
            seriesRightSets
        );
    };

    const STAGE_ORDER = ["ro16", "qf", "sf", "thirdPlace", "gf"];

    const currentPlayablePlayoffsMatch = useMemo(() => {
        if (!playoffs) return null;

        for (const stage of STAGE_ORDER) {
            const stageMatches = playoffs[stage];
            if (!stageMatches) continue;

            for (let i = 0; i < stageMatches.length; i++) {
                if (canOpenPlayoffsMatch(playoffs, stage, i)) {
                    return { stage, index: i, id: stageMatches[i]?.id };
                }
            }
        }

        return null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playoffs]);

    const nextPlayoffsMatch = useMemo(() => {
        if (!playoffs || !currentPlayablePlayoffsMatch) return null;

        const { stage, index } = currentPlayablePlayoffsMatch;
        const stageMatches = playoffs[stage];
        if (!stageMatches) return null;

        for (let i = index + 1; i < stageMatches.length; i++) {
            const m = stageMatches[i];
            if (m && m.slotA && m.slotB && !m.played) {
                return { stage, index: i, id: m.id };
            }
        }

        return null;
    }, [playoffs, currentPlayablePlayoffsMatch]);

    const revealedExtendedRounds =
        buildExtendedRoundWinnerList(seriesState.extendedRounds)
            .slice(0, seriesState.extRoundRevealIndex);

    const getExtendedRoundsScore = (extendedRounds) => {
        let left = 0;
        let right = 0;

        const addWinner = (winner) => {
            if (!winner) return;
            if (winner === "left") left++;
            else right++;
        };

        addWinner(extendedRounds.firstHalf);
        addWinner(extendedRounds.secondHalf);

        for (const ot of extendedRounds.overtimes) {
            addWinner(ot.winner);
        }

        return { left, right };
    };

    const toggleSecretGuaranteedWin = () => {
        setCheatMode((prev) => {
            const next = (prev + 1) % 3;

            if (next === 1) {
                setMultiplierMin(MULTIPLIER_MAX);
                setMultiplierMax(MULTIPLIER_MAX);
                toast.dismiss(SECRET_TOAST_ID);
                toast.dismiss(SECRET_NUM_TWO_TOAST_ID);
                toast.dismiss(SECRET_NUM_THREE_TOAST_ID);
                toast("Don't tell anyone about this!!!", {
                    id: SECRET_TOAST_ID,
                    duration: 2000,
                    icon: "🤫",
                });
            }

            if (next === 2) {
                setMultiplierMin(MULTIPLIER_MIN);
                setMultiplierMax(MULTIPLIER_MIN);
                toast.dismiss(SECRET_TOAST_ID);
                toast.dismiss(SECRET_NUM_TWO_TOAST_ID);
                toast.dismiss(SECRET_NUM_THREE_TOAST_ID);
                toast("Even the odds...", {
                    id: SECRET_NUM_TWO_TOAST_ID,
                    duration: 2000,
                    icon: "😈",
                });
            }

            if (next === 0) {
                setMultiplierMin(MULTIPLIER_MIN);
                setMultiplierMax(MULTIPLIER_MAX);
                toast.dismiss(SECRET_TOAST_ID);
                toast.dismiss(SECRET_NUM_TWO_TOAST_ID);
                toast.dismiss(SECRET_NUM_THREE_TOAST_ID);
                toast("Secret mode disabled", {
                    id: SECRET_NUM_THREE_TOAST_ID,
                    duration: 2000,
                    icon: "🔓",
                });
            }

            return next;
        });
    };

    const SERIES_COMMIT_DELAY = 3500;

    const makePendingAction = (type, delay, payload = {}) => ({
        type,
        delay,
        executeAt: Date.now() + delay,
        payload,
    });

    const executePendingAction = (action) => {
        switch (action.type) {
            case SERIES_ACTIONS.NEXT_SET: {
                setSeriesState(curr => {
                    if (!curr.active || curr.banner) return curr;

                    const { setNumber, leftScore, rightScore } = action.payload;

                    setIsLocked(false);

                    clearRoundLog();

                    toast.dismiss();
                    toast("First Half is beginning", {
                        icon: "\u{1F3C1}",
                        duration: 3000,
                    });

                    return {
                        ...curr,

                        firstHalfLeft: null,
                        firstHalfRight: null,

                        finishedSets: [
                            ...(curr.finishedSets || []),
                            {
                                set: setNumber,
                                leftScore,
                                rightScore,
                            },
                        ],

                        setNumber: curr.setNumber + 1,

                        extendedRounds: {
                            firstHalf: null,
                            secondHalf: null,
                            overtimes: [],
                        },

                        roundWins: 0,
                        roundLosses: 0,
                        roundNumber: 1,

                        miniWins: 0,
                        miniLosses: 0,

                        isOvertime: false,
                        overtimeBlock: 0,
                        otWins: 0,
                        otLosses: 0,

                        pendingAction: null,
                    };
                });

                break;
            }

            case SERIES_ACTIONS.NEXT_OT: {
                setSeriesState(curr => {
                    if (!curr.active || curr.banner) return curr;

                    setIsLocked(false);

                    return {
                        ...curr,

                        isOvertime: true,
                        overtimeBlock: (curr.overtimeBlock || 0) + 1,
                        roundNumber: 1,
                        otWins: 0,
                        otLosses: 0,
                        miniWins: 0,
                        miniLosses: 0,

                        pendingAction: null,
                    };
                });

                break;
            }

            case SERIES_ACTIONS.START_EXTENDED: {
                setSeriesState(curr => {
                    if (!curr.active || curr.banner) return curr;

                    return {
                        ...curr,

                        tiebreakerPhase: "extended",
                        tiebreakerBigSymbol: "VS",
                        extRoundLeftScore: 0,
                        extRoundRightScore: 0,
                        extRoundRevealIndex: 0,
                        extRoundCommentaryShown: false,

                        pendingAction: null,
                    };
                });

                break;
            }

            case SERIES_ACTIONS.NEXT_SET_AFTER_PENALTIES: {
                setSeriesState(curr => {
                    if (!curr.active || curr.banner) return curr;

                    const {
                        playerWonSets,
                        playerLostSets,
                        nextLeftScore,
                        nextRightScore,
                    } = action.payload;

                    setIsLocked(false);

                    clearRoundLog();

                    toast.dismiss();
                    toast("First Half is beginning", {
                        icon: "🏁",
                        duration: 3000,
                    });

                    return {
                        ...curr,

                        playerWonSets,
                        playerLostSets,

                        finishedSets: [
                            ...(curr.finishedSets || []),
                            {
                                set: curr.setNumber,
                                leftScore: curr.penaltyPreScore?.left ?? 0,
                                rightScore: curr.penaltyPreScore?.right ?? 0,

                                extendedRoundsPlayed: true,
                                extendedRoundLeftScore: curr.extRoundLeftScore,
                                extendedRoundRightScore: curr.extRoundRightScore,

                                penaltiesPlayed: true,
                                penaltyLeftScore: nextLeftScore,
                                penaltyRightScore: nextRightScore,
                            },
                        ],

                        setNumber: curr.setNumber + 1,

                        firstHalfLeft: null,
                        firstHalfRight: null,

                        roundWins: 0,
                        roundLosses: 0,
                        roundNumber: 1,

                        miniWins: 0,
                        miniLosses: 0,

                        isOvertime: false,
                        overtimeBlock: 0,
                        otWins: 0,
                        otLosses: 0,

                        extendedRounds: {
                            firstHalf: null,
                            secondHalf: null,
                            overtimes: [],
                        },

                        tiebreakerPhase: "idle",
                        tiebreakerBigSymbol: null,

                        extRoundLeftScore: 0,
                        extRoundRightScore: 0,
                        extRoundRevealIndex: 0,
                        extRoundCommentaryShown: false,

                        penaltyLeftResults: [],
                        penaltyRightResults: [],
                        penaltyLeftScore: 0,
                        penaltyRightScore: 0,
                        penaltyTurn: "left",
                        penaltyPreScore: null,
                        penaltyResolved: false,

                        pendingAction: null,
                    };
                });

                break;
            }

            default:
                break;
        }
    };

    const [pendingActionReady, setPendingActionReady] = useState(false);

    useEffect(() => {
        setSeriesState(curr => {
            if (!curr.pendingAction) return curr;

            return {
                ...curr,
                pendingAction: {
                    ...curr.pendingAction,
                    executeAt: Date.now() + (curr.pendingAction.delay ?? 0),
                },
            };
        });

        setPendingActionReady(true);
    }, []);

    useEffect(() => {
        if (!pendingActionReady) return;
        if (!seriesState.pendingAction) return;

        setIsLocked(true);

        const remaining = Math.max(
            0,
            seriesState.pendingAction.executeAt - Date.now()
        );

        const timer = setTimeout(() => {
            executePendingAction(seriesState.pendingAction);
        }, remaining);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seriesState.pendingAction, pendingActionReady]);

    const handleSecretButtonContextMenu = (e) => {
        e.preventDefault();

        const { left, right } = getExtendedRoundsScore(seriesState.extendedRounds);

        toast(`Extended Rounds: ${left}-${right}`, {
            id: "extended-rounds-score",
            icon: "📊",
            duration: 2500,
        });
    };

    const getMultiplierClass = (mult) => {
        if (mult == null) return "";

        if (mult > 0) return seriesState.leftTeam.gradient;
        if (mult < 0) return seriesState.rightTeam.gradient;

        return "linear-gradient(180deg,#9c9c9c 0%,#757575 45%,#555555 100%)";
    };

    const getPensMultiplierClass = (mult) => {
        if (mult == null) return "";

        const successColor = "#54CC54";
        const failColor = "#983333";

        const color =
            mult > 0
                ? seriesState.penaltyTurn === "left"
                    ? failColor
                    : successColor
                : mult < 0
                    ? seriesState.penaltyTurn === "right"
                        ? failColor
                        : successColor
                    : null;

        if (!color) {
            return "linear-gradient(180deg,#9c9c9c 0%,#757575 45%,#555555 100%)";
        }

        return `linear-gradient(
        180deg,
        ${lightenHex(color, 0.36)} 0%,
        ${color} 45%,
        ${darkenHex(color, 0.35)} 100%
    )`;
    };

    const renderTeamLabel = (team, seriesWon = false) => {
        if (!team) return null;
        if (seriesWon) {
            return (
                <span style={{ color: team.color || "#2e2f42", fontWeight: 900 }}>
                    GG!
                </span>
            );
        } else {
            return (
                <span style={{ color: team.color || "#2e2f42", fontWeight: 900 }}>
                    Team {team.name}
                </span>
            );
        }
    };

    const roundToast = (content, options) => {
        const now = Date.now();

        if (now - lastToastTime.current < 300) return;

        lastToastTime.current = now;
        toast(content, options);
    };

    const getOvertimeLabel = (overtimeBlock) => {
        const names = {
            1: "Overtime",
            2: "Double Overtime",
            3: "Triple Overtime",
            4: "Quadruple Overtime",
            5: "Quintuple Overtime",
            6: "Sextuple Overtime",
            7: "Septuple Overtime",
            8: "Octuple Overtime",
            9: "Nonuple Overtime",
            10: "Decuple Overtime",
        };

        return names[overtimeBlock] ?? `${overtimeBlock}x Overtime`;
    };

    const getOvertimeShortLabel = (overtimeCount) => {
        return `${overtimeCount}x OT`;
    };

    const handlePenaltyShot = () => {
        if (!seriesState.active || seriesState.banner) return;
        if (seriesState.tiebreakerPhase !== "penalties") return;
        if (seriesState.penaltyResolved) return;

        const mult = round2(multiplierMin + Math.random() * (multiplierMax - multiplierMin));
        setIsCalculating(true);

        setSeriesState((prev) => {
            const turn = prev.penaltyTurn;

            let pendingAction = null;

            const isNeutral = mult === 0;

            const success = isNeutral
                ? null
                : turn === "left"
                    ? mult > 0
                    : mult < 0;

            if (isNeutral) {
                setIsCalculating(false);

                return {
                    ...prev,
                    lastMultiplier: mult,
                    lastResult:
                        (turn === "left"
                            ? `Team ${prev.leftTeam.name}`
                            : `Team ${prev.rightTeam.name}`) +
                        " must retake the penalty!",
                };
            }

            const nextLeftResults = [...prev.penaltyLeftResults];
            const nextRightResults = [...prev.penaltyRightResults];
            if (turn === "left") nextLeftResults.push(success ? "success" : "fail");
            else nextRightResults.push(success ? "success" : "fail");

            const nextLeftScore = prev.penaltyLeftScore + (turn === "left" && success ? 1 : 0);
            const nextRightScore = prev.penaltyRightScore + (turn === "right" && success ? 1 : 0);

            const nextTurn = turn === "left" ? "right" : "left";

            const leftAttempts = nextLeftResults.length;
            const rightAttempts = nextRightResults.length;

            const leftRemaining = Math.max(0, 5 - leftAttempts);
            const rightRemaining = Math.max(0, 5 - rightAttempts);

            const regularFinished =
                leftAttempts === 5 &&
                rightAttempts === 5;

            const suddenDeath = leftAttempts > 5 || rightAttempts > 5;

            let resolved = false;
            let winnerTeam = null;

            const inRegularPenalties =
                leftAttempts <= 5 &&
                rightAttempts <= 5;

            if (inRegularPenalties) {

                if (nextLeftScore > nextRightScore + rightRemaining) {
                    resolved = true;
                    winnerTeam = prev.leftTeam;
                }
                else if (nextRightScore > nextLeftScore + leftRemaining) {
                    resolved = true;
                    winnerTeam = prev.rightTeam;
                }
            }

            if (!resolved && regularFinished && !suddenDeath) {

                if (nextLeftScore > nextRightScore) {
                    resolved = true;
                    winnerTeam = prev.leftTeam;
                }
                else if (nextRightScore > nextLeftScore) {
                    resolved = true;
                    winnerTeam = prev.rightTeam;
                }
            }

            if (
                !resolved &&
                suddenDeath &&
                leftAttempts === rightAttempts &&
                nextLeftScore !== nextRightScore
            ) {
                resolved = true;
                winnerTeam =
                    nextLeftScore > nextRightScore
                        ? prev.leftTeam
                        : prev.rightTeam;
            }

            let banner = prev.banner;
            let extraState = {};

            if (resolved && winnerTeam) {
                const playerWonSet = winnerTeam === prev.leftTeam;

                appendSetToCurrentMatchHistory(
                    prev.penaltyPreScore?.left ?? 0,
                    prev.penaltyPreScore?.right ?? 0,
                    playerWonSet,
                    prev.firstHalfLeft,
                    prev.firstHalfRight,
                    {
                        ...prev.extendedRounds,
                        penalties: {
                            leftResults: nextLeftResults,
                            rightResults: nextRightResults,
                            leftScore: nextLeftScore,
                            rightScore: nextRightScore,
                            preScore: prev.penaltyPreScore,
                            penaltyResolved: resolved
                        },
                    }
                );

                const newWon = prev.playerWonSets + (playerWonSet ? 1 : 0);
                const newLost = prev.playerLostSets + (playerWonSet ? 0 : 1);
                const seriesOver = newWon >= prev.setsToWin || newLost >= prev.setsToWin;

                if (seriesOver) {
                    toast.dismiss();
                    toast(<span>{renderTeamLabel(winnerTeam, true)}</span>, {
                        icon: "🎉",
                        duration: 4000,
                    });
                    banner = {
                        text: "GG",
                        shadow: `
                        0 0 3px ${winnerTeam.color},
                        0 0 7px ${winnerTeam.color}66,
                        0 1px 3px rgba(0,0,0,0.4)`,
                        color: winnerTeam.color,
                        gradient: winnerTeam.gradient,
                    };
                    extraState = {
                        playerWonSets: newWon,
                        playerLostSets: newLost,
                        banner,
                        penaltyResolved: true,
                    };
                } else {
                    toast.dismiss();
                    toast(
                        <span>
                            Set {newWon + newLost} has been won on penalties by{" "}
                            {renderTeamLabel(winnerTeam)}!
                        </span>,
                        { icon: "🥅", duration: 4000 }
                    );
                    setIsLocked(true);
                    pendingAction = makePendingAction(
                        SERIES_ACTIONS.NEXT_SET_AFTER_PENALTIES,
                        4000,
                        {
                            playerWonSets: newWon,
                            playerLostSets: newLost,
                            nextLeftScore,
                            nextRightScore,
                        }
                    );
                    extraState = {
                        playerWonSets: newWon,
                        playerLostSets: newLost,
                        penaltyResolved: true,
                    };
                }
            }

            setIsCalculating(false);
            return {
                ...prev,
                lastMultiplier: mult,
                lastResult:
                    (turn === "left"
                        ? `Team ${prev.leftTeam.name}`
                        : `Team ${prev.rightTeam.name}`) +
                    (success ? " scores!" : " misses!"),
                penaltyLeftResults: nextLeftResults,
                penaltyRightResults: nextRightResults,
                penaltyLeftScore: nextLeftScore,
                penaltyRightScore: nextRightScore,
                penaltyTurn: resolved ? prev.penaltyTurn : nextTurn,
                roundWins: nextLeftScore,
                roundLosses: nextRightScore,
                ...extraState,
                pendingAction: pendingAction ?? prev.pendingAction ?? null,
            };
        });
    };

    const handleSeriesGamble = () => {
        if (!seriesState.active || seriesState.banner) return;

        const mult = round2(multiplierMin + Math.random() * (multiplierMax - multiplierMin));

        setIsCalculating(true);

        setSeriesState((prev) => {
            if (!prev.active || prev.banner) return prev;

            let pendingAction = null;

            const playerWonMini = mult > 0;
            const playerLostMini = mult < 0;

            let resultText;
            if (mult > 0) resultText = `Team ${prev.leftTeam.name} wins the mini-round!`;
            else if (mult < 0) resultText = `Team ${prev.rightTeam.name} wins the mini-round!`;
            else resultText = "No one wins this mini-round.";

            let {
                playerWonSets,
                playerLostSets,
                setNumber,
                roundWins,
                roundLosses,
                roundNumber,
                miniWins,
                miniLosses,
                isOvertime,
                overtimeBlock,
                otWins,
                otLosses,
                setsToWin: toWin,
                extendedRounds,
            } = prev;

            extendedRounds = {
                firstHalf: extendedRounds?.firstHalf ?? null,
                secondHalf: extendedRounds?.secondHalf ?? null,
                overtimes: [...(extendedRounds?.overtimes ?? [])],
            };

            const miniWinsToWinRound =
                roundNumber <= 1 ||
                    roundNumber === 13 ||
                    (isOvertime && roundNumber === 1)
                    ? 10
                    : 5;

            let banner = prev.banner;
            if (isOvertime) {
                let nextMiniWins = miniWins;
                let nextMiniLosses = miniLosses;

                if (playerWonMini) nextMiniWins += 1;
                else if (playerLostMini) nextMiniLosses += 1;

                if (
                    nextMiniWins < miniWinsToWinRound &&
                    nextMiniLosses < miniWinsToWinRound
                ) {
                    setIsCalculating(false);
                    return {
                        ...prev,
                        lastMultiplier: mult,
                        lastResult: resultText,
                        miniWins: nextMiniWins,
                        miniLosses: nextMiniLosses,
                    };
                }

                const wonOtRound = nextMiniWins >= miniWinsToWinRound;

                if (
                    miniWinsToWinRound === 10 &&
                    roundNumber === 1
                ) {
                    extendedRounds.overtimes.push({
                        overtime: overtimeBlock,
                        winner: wonOtRound
                            ? "left"
                            : "right",
                    });
                }

                const updatedOtWins = otWins + (wonOtRound ? 1 : 0);
                const updatedOtLosses = otLosses + (wonOtRound ? 0 : 1);

                const updatedRoundWins = roundWins + (wonOtRound ? 1 : 0);
                const updatedRoundLosses = roundLosses + (wonOtRound ? 0 : 1);

                const otTiedBlock = updatedOtWins === 3 && updatedOtLosses === 3;

                miniWins = 0;
                miniLosses = 0;

                roundNumber = roundNumber + 1;

                otWins = updatedOtWins;
                otLosses = updatedOtLosses;
                roundWins = updatedRoundWins;
                roundLosses = updatedRoundLosses;

                logRound({
                    key: `s${prev.setNumber}-ot${overtimeBlock}-r${prev.roundWins + prev.roundLosses + 1}`,
                    part: `ot${overtimeBlock}`,
                    overtimeBlock,
                    roundNumber: prev.roundWins + prev.roundLosses + 1,
                    squares: miniWinsToWinRound,
                    miniLeft: nextMiniWins,
                    miniRight: nextMiniLosses,
                    scoreLeft: updatedRoundWins,
                    scoreRight: updatedRoundLosses,
                    winner: wonOtRound ? "left" : "right",
                });

                roundToast(
                    <span>
                        {renderTeamLabel(wonOtRound ? prev.leftTeam : prev.rightTeam)} has won this{miniWinsToWinRound === 10 ? " Extended " : " "}OT round!
                    </span>,
                    { icon: miniWinsToWinRound === 10 ? "🔥" : "😜", duration: 2000 }
                );

                const otDecided =
                    updatedOtWins === OT_ROUNDS_TO_WIN || updatedOtLosses === OT_ROUNDS_TO_WIN;

                if (otDecided) {
                    const playerWonSet = updatedOtWins > updatedOtLosses;

                    appendSetToCurrentMatchHistory(
                        updatedRoundWins,
                        updatedRoundLosses,
                        playerWonSet,
                        prev.firstHalfLeft,
                        prev.firstHalfRight,
                        extendedRounds
                    );

                    playerWonSets += playerWonSet ? 1 : 0;
                    playerLostSets += playerWonSet ? 0 : 1;

                    const seriesOver = playerWonSets >= toWin || playerLostSets >= toWin;

                    if (seriesOver) {
                        const winner = playerWonSets > playerLostSets ? prev.leftTeam : prev.rightTeam;

                        toast.dismiss();
                        toast(
                            <span>
                                {renderTeamLabel(winner, true)}
                            </span>,
                            { icon: "🎉", duration: 4000 }
                        );

                        banner = {
                            text: "GG",
                            shadow:
                                `
                                0 0 3px ${winner.color},
                                0 0 7px ${winner.color}66,
                                0 1px 3px rgba(0,0,0,0.4)
                            `,
                            color: winner.color,
                            gradient: winner.gradient,
                        };
                    } else {
                        toast.dismiss();
                        toast(
                            <span>
                                Set {playerWonSets + playerLostSets} has been won in {getOvertimeLabel(overtimeBlock)} by{" "}
                                {renderTeamLabel(playerWonSet ? prev.leftTeam : prev.rightTeam)}!
                            </span>,
                            { icon: "🤯", duration: 4000 }
                        );

                        setIsLocked(true);
                        pendingAction = makePendingAction(
                            SERIES_ACTIONS.NEXT_SET,
                            4000,
                            {
                                setNumber,
                                leftScore: updatedRoundWins,
                                rightScore: updatedRoundLosses,
                            }
                        );
                    }

                    setIsCalculating(false);

                    return {
                        ...prev,
                        lastMultiplier: mult,
                        lastResult: resultText,
                        playerWonSets,
                        playerLostSets,
                        extendedRounds,
                        setNumber,
                        roundWins,
                        roundLosses,
                        roundNumber,
                        miniWins,
                        miniLosses,
                        isOvertime,
                        overtimeBlock,
                        otWins,
                        otLosses,
                        banner,
                        pendingAction: pendingAction ?? prev.pendingAction ?? null,
                    };
                }

                if (otTiedBlock) {
                    if (overtimeBlock >= OT_MAX_BLOCK) {
                        toast.dismiss();
                        toast(
                            "It's tied again, so another tiebreaker should be utilized...",
                            { icon: "🧮", duration: 4000 }
                        );
                        setIsLocked(true);
                        pendingAction = makePendingAction(
                            SERIES_ACTIONS.START_EXTENDED,
                            1500
                        );

                        setIsCalculating(false);
                        return {
                            ...prev,
                            lastMultiplier: mult,
                            lastResult: resultText,
                            playerWonSets,
                            playerLostSets,
                            extendedRounds,
                            setNumber,
                            roundWins,
                            roundLosses,
                            roundNumber,
                            miniWins,
                            miniLosses,
                            isOvertime: true,
                            overtimeBlock,
                            otWins,
                            otLosses,
                            banner,
                            pendingAction: pendingAction ?? prev.pendingAction ?? null,
                        };
                    }

                    const currentOT = getOvertimeLabel(overtimeBlock);
                    const nextOT = getOvertimeLabel(overtimeBlock + 1);
                    const msg =
                        overtimeBlock === 1
                            ? `Neither team is willing to back down! ${currentOT} is tied 3-3! Starting ${nextOT}...`
                            : overtimeBlock === 2
                                ? `Another overtime ends in a tie! ${currentOT} is tied 3-3 again! Starting ${nextOT}...`
                                : `That's a tough battle we got here! ${currentOT} is tied 3-3 again! Starting ${nextOT}...`;

                    toast(msg, { icon: "🔄", duration: 4000 });

                    setIsLocked(true);
                    pendingAction = makePendingAction(SERIES_ACTIONS.NEXT_OT, 4000);

                    setIsCalculating(false);

                    return {
                        ...prev,
                        lastMultiplier: mult,
                        lastResult: resultText,
                        playerWonSets,
                        playerLostSets,
                        extendedRounds,
                        setNumber,
                        roundWins,
                        roundLosses,
                        roundNumber,
                        miniWins,
                        miniLosses,
                        isOvertime: true,
                        overtimeBlock,
                        otWins,
                        otLosses,
                        banner,
                        pendingAction: pendingAction ?? prev.pendingAction ?? null,
                    };
                }

                setIsCalculating(false);

                return {
                    ...prev,
                    lastMultiplier: mult,
                    lastResult: resultText,
                    playerWonSets,
                    playerLostSets,
                    extendedRounds,
                    setNumber,
                    roundWins,
                    roundLosses,
                    roundNumber,
                    miniWins,
                    miniLosses,
                    isOvertime,
                    overtimeBlock,
                    otWins,
                    otLosses,
                    banner,
                    pendingAction: pendingAction ?? prev.pendingAction ?? null,
                };
            }

            let nextMiniWins = miniWins;
            let nextMiniLosses = miniLosses;

            if (playerWonMini) nextMiniWins += 1;
            else if (playerLostMini) nextMiniLosses += 1;

            if (
                nextMiniWins < miniWinsToWinRound &&
                nextMiniLosses < miniWinsToWinRound
            ) {
                setIsCalculating(false);
                return {
                    ...prev,
                    lastMultiplier: mult,
                    lastResult: resultText,
                    miniWins: nextMiniWins,
                    miniLosses: nextMiniLosses,
                };
            }

            const playerWonRound = nextMiniWins >= miniWinsToWinRound;

            if (miniWinsToWinRound === 10) {
                const winner = playerWonRound
                    ? "left"
                    : "right";

                if (isOvertime) {
                    extendedRounds.overtimes.push({
                        overtime: overtimeBlock,
                        winner,
                    });
                } else if (roundNumber === 1) {
                    extendedRounds.firstHalf = winner;
                } else if (roundNumber === 13) {
                    extendedRounds.secondHalf = winner;
                }
            }
            roundWins += playerWonRound ? 1 : 0;
            roundLosses += playerWonRound ? 0 : 1;
            roundNumber += 1;

            if (roundNumber === 1) {
                toast.dismiss();
                toast("First Half begins", {
                    icon: "🏁",
                    duration: 3000,
                });
            }

            if (roundNumber === 12) {
                toast.dismiss();
                toast("Last Round of the First Half", {
                    id: ROUND12_TOAST_ID,
                    icon: "❗",
                    duration: Infinity,
                });
            }

            if (roundNumber === 13) {
                toast.dismiss(ROUND12_TOAST_ID);
                toast("Second Half begins", {
                    icon: "🔄",
                    duration: 3000,
                });
            }

            let firstHalfLeft = prev.firstHalfLeft;
            let firstHalfRight = prev.firstHalfRight;

            const totalRoundsPlayed = roundWins + roundLosses;

            if (
                totalRoundsPlayed === 12 &&
                firstHalfLeft == null &&
                firstHalfRight == null
            ) {
                firstHalfLeft = roundWins;
                firstHalfRight = roundLosses;
            }

            miniWins = 0;
            miniLosses = 0;

            logRound({
                key: `s${prev.setNumber}-reg-r${prev.roundWins + prev.roundLosses + 1}`,
                part: prev.roundNumber <= 12 ? "firstHalf" : "secondHalf",
                roundNumber: prev.roundWins + prev.roundLosses + 1,
                squares: miniWinsToWinRound,
                miniLeft: nextMiniWins,
                miniRight: nextMiniLosses,
                scoreLeft: roundWins,
                scoreRight: roundLosses,
                winner: playerWonRound ? "left" : "right",
            });

            roundToast(
                <span>
                    {renderTeamLabel(playerWonRound ? prev.leftTeam : prev.rightTeam)} has won this{miniWinsToWinRound === 10 ? " Extended " : " "}round!
                </span>,
                { icon: miniWinsToWinRound === 10 ? "🔥" : "😜", duration: 2000 }
            );

            if (roundWins === 12 && roundLosses === 12) {
                toast.dismiss();
                toast(`Overtime coming in for this ${toWin === 1 ? "match" : "set"}! 🔥`, {
                    icon: "⚔️",
                    duration: 4000,
                });

                setIsLocked(true);
                pendingAction = makePendingAction(SERIES_ACTIONS.NEXT_OT, 4000);

                setIsCalculating(false);

                return {
                    ...prev,
                    lastMultiplier: mult,
                    lastResult: resultText,
                    playerWonSets,
                    playerLostSets,
                    extendedRounds,
                    roundWins,
                    roundLosses,
                    roundNumber,
                    miniWins,
                    miniLosses,
                    isOvertime: true,
                    overtimeBlock,
                    otWins,
                    otLosses,
                    banner,
                    pendingAction: pendingAction ?? prev.pendingAction ?? null,
                };
            }

            const setShouldEnd =
                roundWins >= BASE_ROUNDS_TO_WIN ||
                roundLosses >= BASE_ROUNDS_TO_WIN ||
                roundWins + roundLosses >= BASE_MAX_ROUNDS;

            if (setShouldEnd) {
                const playerWonSet = roundWins > roundLosses;

                appendSetToCurrentMatchHistory(
                    roundWins,
                    roundLosses,
                    playerWonSet,
                    firstHalfLeft,
                    firstHalfRight,
                    extendedRounds
                );

                playerWonSets += playerWonSet ? 1 : 0;
                playerLostSets += playerWonSet ? 0 : 1;

                const seriesOver = playerWonSets >= toWin || playerLostSets >= toWin;

                if (seriesOver) {
                    const winner = playerWonSets > playerLostSets ? prev.leftTeam : prev.rightTeam;

                    toast.dismiss();
                    toast(
                        <span>
                            {renderTeamLabel(winner, true)}
                        </span>,
                        { icon: "🎉", duration: 4000 }
                    );

                    banner = {
                        text: "GG",
                        shadow:
                            `
                            0 0 3px ${winner.color},
                            0 0 7px ${winner.color}66,
                            0 1px 3px rgba(0,0,0,0.4)
                        `,
                        color: winner.color,
                        gradient: winner.gradient,
                    };
                } else {
                    toast.dismiss();
                    toast(
                        <span>
                            Set {playerWonSets + playerLostSets} has been won by{" "}
                            {renderTeamLabel(playerWonSet ? prev.leftTeam : prev.rightTeam)}!
                        </span>,
                        { icon: "🤯", duration: 4000 }
                    );

                    setIsLocked(true);
                    pendingAction = makePendingAction(
                        SERIES_ACTIONS.NEXT_SET,
                        4000,
                        {
                            setNumber,
                            leftScore: roundWins,
                            rightScore: roundLosses,
                        }
                    );
                }
            }

            setIsCalculating(false);

            return {
                ...prev,
                lastMultiplier: mult,
                lastResult: resultText,
                playerWonSets,
                playerLostSets,
                extendedRounds,
                setNumber,
                roundWins,
                roundLosses,
                roundNumber,
                firstHalfLeft,
                firstHalfRight,
                miniWins,
                miniLosses,
                isOvertime,
                overtimeBlock,
                otWins,
                otLosses,
                banner,
                pendingAction: pendingAction ?? prev.pendingAction ?? null,
            };
        });
    };

    const seriesCommitExecuteAtRef = useRef(null);

    useEffect(() => {
        if (!pendingActionReady) {
            return;
        }

        if (!seriesState.banner) {
            seriesCommitExecuteAtRef.current = null;
            return;
        }

        const {
            phase,
            leftTeam,
            rightTeam,
            playerWonSets,
            playerLostSets,
            swissStageKey,
            swissNet,
            swissMatchId,
            playoffsStage,
            playoffsMatchId,
        } = seriesState;

        if (!leftTeam || !rightTeam) return;

        const winner = playerWonSets > playerLostSets ? leftTeam : rightTeam;
        const loser = winner.id === leftTeam.id ? rightTeam : leftTeam;

        const seriesLeftSets = playerWonSets;
        const seriesRightSets = playerLostSets;

        const playedAtMs = Date.now();

        seriesCommitExecuteAtRef.current = Date.now() + SERIES_COMMIT_DELAY;

        const remaining = Math.max(
            0,
            seriesCommitExecuteAtRef.current - Date.now()
        );

        const t = setTimeout(() => {
            seriesCommitExecuteAtRef.current = null;
            if (phase === "playoffs") {
                setPlayoffs((prev) => {
                    if (!prev) return prev;

                    const copy = {
                        ...prev,
                        ro16: [...prev.ro16],
                        qf: [...prev.qf],
                        sf: [...prev.sf],
                        thirdPlace: [...prev.thirdPlace],
                        gf: [...prev.gf],
                    };

                    const arr = [...copy[playoffsStage]];
                    const idx = arr.findIndex((m) => m.id === playoffsMatchId);
                    if (idx < 0) return prev;

                    const m = { ...arr[idx] };
                    const bestOf = getBestOfForPlayoffs(playoffsStage);
                    const { scoreLeft, scoreRight } = getCommittedSeriesScore({
                        bestOf,
                        seriesState,
                        matchObj: m,
                        seriesLeftSets,
                        seriesRightSets,
                    });

                    m.played = true;
                    m.scoreLeft = scoreLeft;
                    m.scoreRight = scoreRight;
                    m.winnerTeamId = winner.id;
                    m.loserTeamId = loser.id;

                    const loserSetsWon = Math.min(scoreLeft, scoreRight);
                    const applied = applyRatings({
                        ratings: teamRatingsRef.current,
                        teams: allTeams,
                        winnerId: winner.id,
                        loserId: loser.id,
                        phase: "playoffs",
                        swissStageKey: null,
                        swissNet: null,
                        playoffsStage,
                        bestOf,
                        loserSetsWon,
                        playedAtMs,
                    });

                    m.ratingMeta = applied.meta;

                    setTeamRatings(applied.nextRatings);
                    teamRatingsRef.current = applied.nextRatings;
                    saveTeamRatings(applied.nextRatings);

                    arr[idx] = m;
                    copy[playoffsStage] = arr;

                    const assign = (targetStage, targetIdx, slotKey, team) => {
                        const tgt = [...copy[targetStage]];
                        const mm = { ...tgt[targetIdx] };
                        mm[slotKey] = team;
                        tgt[targetIdx] = mm;
                        copy[targetStage] = tgt;
                    };

                    if (playoffsStage === "ro16") {
                        const pairIndex = Math.floor(idx / 2);
                        const slotKey = idx % 2 === 0 ? "slotA" : "slotB";
                        assign("qf", pairIndex, slotKey, winner);
                    } else if (playoffsStage === "qf") {
                        const pairIndex = Math.floor(idx / 2);
                        const slotKey = idx % 2 === 0 ? "slotA" : "slotB";
                        assign("sf", pairIndex, slotKey, winner);
                    } else if (playoffsStage === "sf") {
                        const slotKey = idx === 0 ? "slotA" : "slotB";
                        assign("gf", 0, slotKey, winner);

                        const third = copy.thirdPlace[0] ? { ...copy.thirdPlace[0] } : null;
                        if (third) {
                            if (idx === 0) third.slotA = loser;
                            else third.slotB = loser;
                            copy.thirdPlace = [third];
                        }
                    } else if (playoffsStage === "gf") {
                        let thirdPlaceWinner = null;
                        let fourthPlace = null;
                        const third = copy.thirdPlace[0];

                        if (third && third.played && third.slotA && third.slotB && third.winnerTeamId) {
                            const tpWinner = third.winnerTeamId === third.slotA.id ? third.slotA : third.slotB;
                            const tpLoser = tpWinner.id === third.slotA.id ? third.slotB : third.slotA;
                            thirdPlaceWinner = tpWinner;
                            fourthPlace = tpLoser;
                        }

                        setTournamentResults({
                            winner,
                            runnerUp: loser,
                            thirdPlace: thirdPlaceWinner,
                            fourthPlace,
                        });
                        setTeamPlacings((prev) => {
                            const next = { ...prev };

                            const inc = (id, key) => {
                                if (!id) return;
                                const cur = next[id] ?? { wins: 0, seconds: 0, thirds: 0 };
                                next[id] = { ...cur, [key]: (cur[key] ?? 0) + 1 };
                            };

                            inc(winner?.id, "wins");
                            inc(loser?.id, "seconds");
                            inc(thirdPlaceWinner?.id, "thirds");

                            saveTeamPlacings(next);
                            return next;
                        });
                        setShowWinnersScreen(true);
                        ratingsSnapshotRef.current = null;
                        clearRatingsSnapshot();
                    }

                    return copy;
                });

                setSeriesState(defaultSeriesState);
                recomputePickemTotals();
                return;
            }

            const commitSwiss = (setter, stg) => {
                const copy = {
                    ...stg,
                    teams: stg.teams.map((t) => ({ ...t })),
                    matchesByNet: { ...stg.matchesByNet },
                };

                const arr = [...(copy.matchesByNet[swissNet] || [])];
                const idx = arr.findIndex((m) => m.id === swissMatchId);
                if (idx < 0) return;

                const match = { ...arr[idx] };
                const bestOf = getBestOfForSwissNet(swissNet, stg.stageKey);

                const aId = match.slotA.id;
                const bId = match.slotB.id;

                match.slotA = copy.teams.find((t) => t.id === aId) || match.slotA;
                match.slotB = copy.teams.find((t) => t.id === bId) || match.slotB;

                const { scoreLeft, scoreRight } = getCommittedSeriesScore({
                    bestOf,
                    seriesState,
                    matchObj: match,
                    seriesLeftSets,
                    seriesRightSets,
                });

                match.played = true;
                match.scoreLeft = scoreLeft;
                match.scoreRight = scoreRight;
                match.winnerTeamId = winner.id;
                match.loserTeamId = loser.id;

                resolveSwissMatchResult(copy, match, winner.id, scoreLeft, scoreRight);
                calculateBuchholz(copy);
                const loserSetsWon = Math.min(scoreLeft, scoreRight);
                const applied = applyRatings({
                    ratings: teamRatingsRef.current,
                    teams: allTeams,
                    winnerId: winner.id,
                    loserId: loser.id,
                    phase: "swiss",
                    swissStageKey,
                    swissNet,
                    playoffsStage: null,
                    bestOf,
                    loserSetsWon,
                    playedAtMs,
                });

                match.ratingMeta = applied.meta;

                setTeamRatings(applied.nextRatings);
                teamRatingsRef.current = applied.nextRatings;
                saveTeamRatings(applied.nextRatings);

                arr[idx] = match;
                copy.matchesByNet[swissNet] = arr;

                tryBuildUnlockedNets(copy);

                setter(copy);

                if (isSwissStageFinished(copy)) {
                    if (copy.stageKey === "stage1") {
                        const s2 = buildStage2IfNeeded(copy);
                        setStage2(s2);
                        setActivePhase("stage2");
                        setViewPhase("stage2");
                    } else if (copy.stageKey === "stage2") {
                        const s3 = buildStage3IfNeeded(copy);
                        setStage3(s3);
                        setActivePhase("stage3");
                        setViewPhase("stage3");
                    } else if (copy.stageKey === "stage3") {
                        const br = buildPlayoffsIfNeeded(copy);
                        setPlayoffs(br);
                        setActivePhase("playoffs");
                        setViewPhase("playoffs");
                    }
                }
            };

            if (swissStageKey === "stage1" && stage1) commitSwiss(setStage1, stage1);
            if (swissStageKey === "stage2" && stage2) commitSwiss(setStage2, stage2);
            if (swissStageKey === "stage3" && stage3) commitSwiss(setStage3, stage3);

            setSeriesState(defaultSeriesState);
            recomputePickemTotals();
        }, remaining);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seriesState.banner, pendingActionReady]);

    useEffect(() => {
        if (!seriesState.active) return;
        if (seriesState.tiebreakerPhase !== "extended") return;
        if (seriesState.banner) return;

        const winners = buildExtendedRoundWinnerList(seriesState.extendedRounds);
        const total = winners.length;

        if (!seriesState.extRoundCommentaryShown) {
            const t = setTimeout(() => {
                setSeriesState((curr) => {
                    if (curr.tiebreakerPhase !== "extended") return curr;
                    return { ...curr, extRoundCommentaryShown: true };
                });
            }, EXT_ROUND_COMMENTARY_DELAY_MS);
            return () => clearTimeout(t);
        }

        if (seriesState.extRoundRevealIndex < total) {
            const t = setTimeout(() => {
                setSeriesState((curr) => {
                    if (curr.tiebreakerPhase !== "extended") return curr;
                    const idx = curr.extRoundRevealIndex;
                    if (idx >= total) return curr;
                    const w = winners[idx];
                    const isLeft = w.winner === "left";

                    const nextLeft = curr.extRoundLeftScore + (isLeft ? 1 : 0);
                    const nextRight = curr.extRoundRightScore + (isLeft ? 0 : 1);

                    let finalLeft = nextLeft;
                    let finalRight = nextRight;
                    let finalRevealIndex = idx + 1;

                    if (finalLeft >= 4 || finalRight >= 4) {
                        for (let i = idx + 1; i < winners.length; i++) {
                            if (winners[i].winner === "left") {
                                finalLeft++;
                            } else {
                                finalRight++;
                            }
                        }

                        finalRevealIndex = winners.length;
                    }

                    return {
                        ...curr,
                        extRoundRevealIndex: finalRevealIndex,
                        extRoundLeftScore: finalLeft,
                        extRoundRightScore: finalRight,
                    };
                });
            }, EXT_ROUND_REVEAL_MS);
            return () => clearTimeout(t);
        }

        const t = setTimeout(() => {
            setSeriesState((curr) => {
                if (curr.tiebreakerPhase !== "extended") return curr;

                const L = curr.extRoundLeftScore;
                const R = curr.extRoundRightScore;

                if (L !== R) {
                    const playerWonSet = L > R;
                    appendSetToCurrentMatchHistory(
                        curr.roundWins,
                        curr.roundLosses,
                        playerWonSet,
                        curr.firstHalfLeft,
                        curr.firstHalfRight,
                        curr.extendedRounds
                    );

                    const newWon = curr.playerWonSets + (playerWonSet ? 1 : 0);
                    const newLost = curr.playerLostSets + (playerWonSet ? 0 : 1);
                    const seriesOver = newWon >= curr.setsToWin || newLost >= curr.setsToWin;

                    if (seriesOver) {
                        const winner = playerWonSet ? curr.leftTeam : curr.rightTeam;
                        toast.dismiss();
                        toast(<span>{renderTeamLabel(winner, true)}</span>, {
                            icon: "🎉",
                            duration: 4000,
                        });
                        setIsLocked(false);
                        return {
                            ...curr,
                            playerWonSets: newWon,
                            playerLostSets: newLost,
                            tiebreakerBigSymbol: "GG",
                            banner: {
                                text: "GG",
                                shadow: `
                                0 0 3px ${winner.color},
                                0 0 7px ${winner.color}66,
                                0 1px 3px rgba(0,0,0,0.4)`,
                                color: winner.color,
                            },
                        };
                    }

                    toast(
                        <span>
                            Set {newWon + newLost} has been won by{" "}
                            {renderTeamLabel(playerWonSet ? curr.leftTeam : curr.rightTeam)}!
                        </span>,
                        { icon: "🤯", duration: 4000 }
                    );
                    setTimeout(() => {
                        setSeriesState((s) => {
                            if (!s.active || s.banner) return s;
                            setIsLocked(false);
                            toast("First Half is beginning", { icon: "🏁", duration: 3000 });
                            return {
                                ...s,
                                playerWonSets: newWon,
                                playerLostSets: newLost,
                                finishedSets: [
                                    ...(s.finishedSets || []),
                                    {
                                        set: s.setNumber,
                                        leftScore: s.roundWins,
                                        rightScore: s.roundLosses,

                                        extendedRoundsPlayed: true,
                                        extendedRoundLeftScore: curr.extRoundLeftScore,
                                        extendedRoundRightScore: curr.extRoundRightScore,

                                        penaltiesPlayed: false,
                                    },
                                ],
                                setNumber: s.setNumber + 1,
                                firstHalfLeft: null,
                                firstHalfRight: null,
                                roundWins: 0,
                                roundLosses: 0,
                                roundNumber: 1,
                                miniWins: 0,
                                miniLosses: 0,
                                isOvertime: false,
                                overtimeBlock: 0,
                                otWins: 0,
                                otLosses: 0,
                                extendedRounds: { firstHalf: null, secondHalf: null, overtimes: [] },
                                tiebreakerPhase: "idle",
                                tiebreakerBigSymbol: null,
                                extRoundLeftScore: 0,
                                extRoundRightScore: 0,
                                extRoundRevealIndex: 0,
                                extRoundCommentaryShown: false,
                            };
                        });
                    }, 4000);

                    return {
                        ...curr,
                        playerWonSets: newWon,
                        playerLostSets: newLost
                    };
                }

                toast("It's tied again!? Then.............", { icon: "😱", duration: 3000 });
                setTimeout(() => {
                    toast("PENALTIES!!!", { icon: "🥅", duration: 4000 });
                }, 3000);

                return { ...curr, tiebreakerBigSymbol: "=" };
            });
        }, EXT_ROUND_FINAL_COMPARE_MS);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        seriesState.active,
        seriesState.tiebreakerPhase,
        seriesState.banner,
        seriesState.extRoundRevealIndex,
        seriesState.extRoundCommentaryShown,
    ]);

    useEffect(() => {
        if (!seriesState.active) return;
        if (seriesState.tiebreakerPhase !== "extended") return;
        if (seriesState.tiebreakerBigSymbol !== "=") return;

        const t = setTimeout(() => {
            setSeriesState((curr) => {
                if (curr.tiebreakerBigSymbol !== "=") return curr;
                return {
                    ...curr,
                    lastMultiplier: null,
                    lastResult: "",
                    tiebreakerPhase: "penalties",
                    penaltyPreScore: { left: curr.roundWins, right: curr.roundLosses },
                    roundWins: 0,
                    roundLosses: 0,
                    penaltyLeftResults: [],
                    penaltyRightResults: [],
                    penaltyLeftScore: 0,
                    penaltyRightScore: 0,
                    penaltyTurn: "left",
                    penaltyResolved: false,
                    tiebreakerBigSymbol: "VS",
                };
            });
            setIsLocked(false);
        }, 4200);
        return () => clearTimeout(t);
    }, [seriesState.active, seriesState.tiebreakerPhase, seriesState.tiebreakerBigSymbol]);

    useEffect(() => {
        if (!showWinnersScreen || !tournamentResults) return;

        setShowProceed(false);
        setShowPodium(true);

        if (!hasPlayedWinnerAnimation) {
            setTimeout(() => setShowWinnerText(true), 500);

            setWinnersText("And the Fourth Place is:");

            const t2 = setTimeout(() => {
                setWinnersText("The Third Place is:");
            }, 4000);

            const t3 = setTimeout(() => {
                setWinnersText("The Runner-Up is:");
            }, 7000);

            const t4 = setTimeout(() => {
                setWinnersText("And the CHAMPION is:");
            }, 10000);

            const proceed = setTimeout(() => {
                setShowProceed(true);
            }, 15000);

            const veryLast = setTimeout(() => {
                setHasPlayedWinnerAnimation(true);
            }, 20000);

            return () => {
                clearTimeout(t2);
                clearTimeout(t3);
                clearTimeout(t4);
                clearTimeout(veryLast);
                clearTimeout(proceed);
            };
        }

        setShowWinnerText(true);
        setShowProceed(true);
        setWinnersText("And the WINNER is:");
    }, [
        showWinnersScreen,
        tournamentResults,
        hasPlayedWinnerAnimation
    ]);

    useEffect(() => {
        if (!showPickemSummary) return;

        setShowPickemLine2(false);
        setShowPickemResult(false);

        const t1 = setTimeout(() => setShowPickemLine2(true), 1200);
        const t2 = setTimeout(() => setShowPickemResult(true), 2500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [showPickemSummary]);

    useEffect(() => {
        if (!showPickemSummary) return;

        setShowPickemLine2(false);
        setShowPickemResult(false);

        const t1 = setTimeout(() => setShowPickemLine2(true), 1500);
        const t2 = setTimeout(() => setShowPickemResult(true), 3000);

        if (neededPickemPoints !== 67 && finalPickemPoints === 67 ||
            neededPickemPoints !== 167 && finalPickemPoints === 167 ||
            neededPickemPoints !== 267 && finalPickemPoints === 267 ||
            neededPickemPoints !== 367 && finalPickemPoints === 367) {
            setTimeout(() => {
                toast("67?!...", {
                    duration: 4000,
                    icon: "🤯"
                });
            }, 3000);
            setTimeout(() => {
                setNeededPickemPoints(67);
                toast("67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67...", {
                    duration: 8000,
                    icon: "6️⃣7️⃣"
                });
            }, 9000);
        }

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showPickemSummary]);

    const isPickemWin = finalPickemPoints >= neededPickemPoints;

    const handleBackToHome = () => {
        resetSpecialModeState();
        navigate("/");
    };

    const handleBackToSpecialStart = () => {
        resetSpecialModeState();
    };

    const handleBackToGambling = () => {
        resetSpecialModeState();
        navigate("/gambling");
    };

    const buildPlayoffsSummaryNode = () => {
        const chunks = [];

        const push = (node) => node && chunks.push(node);

        if (guessedCounts.ro16 > 0) {
            const isPerfect = guessedCounts.ro16 === 8;
            const isAwful = guessedCounts.ro16 <= 2;
            push(
                <>
                    <span style={{ fontWeight: 900, color: isPerfect ? "#2e7d32" : isAwful ? "red" : undefined }}>
                        {guessedCounts.ro16}/8
                    </span>{" "}
                    Rounds of 16
                </>
            );
        }
        if (guessedCounts.qf > 0) {
            const isPerfect = guessedCounts.qf === 4;
            const isAwful = guessedCounts.qf <= 1;
            push(
                <>
                    <span style={{ fontWeight: 900, color: isPerfect ? "#2e7d32" : isAwful ? "red" : undefined }}>
                        {guessedCounts.qf}/4
                    </span>{" "}
                    Quarterfinals
                </>
            );
        }
        if (guessedCounts.sf > 0) {
            const isPerfect = guessedCounts.sf === 2;
            push(
                <>
                    <span style={{ fontWeight: 900, color: isPerfect ? "#2e7d32" : undefined }}>
                        {guessedCounts.sf}/2
                    </span>{" "}
                    Semifinals
                </>
            );
        }
        if (guessedCounts.tpd > 0) {
            push(<span style={{ fontWeight: 900, color: "#2e7d32" }}>the Third Place Decider</span>);
        }
        if (guessedCounts.gf > 0) {
            push(<span style={{ fontWeight: 900, color: "#2e7d32" }}>the Grand Final</span>);
        }

        if (chunks.length === 0) return null;

        return (
            <>
                {chunks.map((node, idx) => {
                    const isLast = idx === chunks.length - 1;
                    const isSecondLast = idx === chunks.length - 2;
                    return (
                        <React.Fragment key={idx}>
                            {isLast && chunks.length > 1 ? "and " : ""}
                            {node}
                            {!isLast && !isSecondLast ? ", " : " "}
                        </React.Fragment>
                    );
                })}
            </>
        );
    };

    const buildPickemSentence = () => {
        const s1Awful = guessedCounts.stage1 <= 13;
        const s2Awful = guessedCounts.stage2 <= 13;
        const s3Awful = guessedCounts.stage3 <= 13;

        const s1Perfect = guessedCounts.stage1 === 66;
        const s2Perfect = guessedCounts.stage2 === 66;
        const s3Perfect = guessedCounts.stage3 === 66;

        return (
            <>
                YOU guessed{" "}
                <span style={{ fontWeight: 900, color: s1Perfect ? "#2e7d32" : s1Awful ? "red" : undefined }}>
                    {guessedCounts.stage1}/66
                </span>{" "}
                matches in Stage I,{" "}
                <span style={{ fontWeight: 900, color: s2Perfect ? "#2e7d32" : s2Awful ? "red" : undefined }}>
                    {guessedCounts.stage2}/66
                </span>{" "}
                matches in Stage II,{" "}
                <span style={{ fontWeight: 900, color: s3Perfect ? "#2e7d32" : s3Awful ? "red" : undefined }}>
                    {guessedCounts.stage3}/66
                </span>{" "}
                matches in Stage III,{" "}
                {buildPlayoffsSummaryNode()}
            </>
        );
    };

    const handleProceed = () => {
        recomputePickemTotals();
        setShowPickemSummary(true);
    };

    const renderResultsNav = () => {
        const phases = [
            {
                id: "playoffs",
                results: "results_playoffs",
                activeLabel: "Playoffs",
                resultsLabel: "Results of Playoffs",
            },
            {
                id: "stage3",
                results: "results_stage3",
                activeLabel: "Stage III",
                resultsLabel: "Results of Stage III",
            },
            {
                id: "stage2",
                results: "results_stage2",
                activeLabel: "Stage II",
                resultsLabel: "Results of Stage II",
            },
            {
                id: "stage1",
                results: "results_stage1",
                activeLabel: "Stage I",
                resultsLabel: "Results of Stage I",
            },
        ];

        const unlocked = phases.filter((phase) => {
            switch (phase.id) {
                case "playoffs":
                    return activePhase === "playoffs";

                case "stage3":
                    return activePhase === "stage3" || activePhase === "playoffs";

                case "stage2":
                    return (
                        activePhase === "stage2" ||
                        activePhase === "stage3" ||
                        activePhase === "playoffs"
                    );

                case "stage1":
                    return true;

                default:
                    return false;
            }
        });

        if (unlocked.length === 1 && unlocked[0].id === "stage1") {
            return null;
        }

        return (
            <div
                ref={navRef}
                style={{
                    position: "absolute",
                    top: "10%",
                    right: "98%",
                    zIndex: 5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 10,
                    transition: "none",
                    marginRight:
                        viewPhase === "playoffs" ||
                            viewPhase === "results_playoffs"
                            ? 86
                            : 0,
                }}
            >
                {unlocked.map((phase) => {
                    const viewingCurrent =
                        viewPhase === phase.id;

                    const viewingResults =
                        phase.results &&
                        viewPhase === phase.results;

                    const isLivePhase = activePhase === phase.id;

                    const label = isLivePhase
                        ? phase.activeLabel
                        : phase.resultsLabel ?? phase.activeLabel;

                    return (
                        <button
                            key={phase.id}
                            data-results-active={viewingCurrent || viewingResults}
                            onClick={() =>
                                setViewPhase(
                                    viewingCurrent
                                        ? phase.results ?? phase.id
                                        : phase.id
                                )
                            }
                            className={`${css.resultsNavigationButton} ${viewingCurrent || viewingResults
                                ? css.resultsNavigationButtonActive
                                : ""
                                }`}
                        >
                            {label}
                        </button>
                    );
                })}
                <motion.div
                    className={css.resultsNavigationIndicator}
                    initial={false}
                    animate={{
                        top: indicator.top,
                        height: indicator.height,
                    }}
                    transition={{
                        type: "tween",
                        stiffness: 300,
                        damping: 60,
                    }}
                />
            </div>
        );
    };

    const swissToRender = (() => {
        if (viewPhase === "stage1" || viewPhase === "results_stage1") return stage1;
        if (viewPhase === "stage2" || viewPhase === "results_stage2") return stage2;
        if (viewPhase === "stage3" || viewPhase === "results_stage3") return stage3;
        return null;
    })();

    const getStageTitleForView = () => {
        if (viewPhase === "stage1")
            return <>{tournamentLabel} | Stage I</>;

        if (viewPhase === "stage2")
            return <>{tournamentLabel} | Stage II</>;

        if (viewPhase === "stage3")
            return <>{tournamentLabel} | Stage III</>;

        if (viewPhase === "playoffs")
            return <>{tournamentLabel} | Playoffs</>;

        if (viewPhase === "results_stage1")
            return <>{tournamentLabel} | Stage I</>;

        if (viewPhase === "results_stage2")
            return <>{tournamentLabel} | Stage II</>;

        if (viewPhase === "results_stage3")
            return <>{tournamentLabel} | Stage III</>;

        return null;
    };

    const canOpenSwissMatch = (stageObj, net, match) => {
        if (!stageObj || !match || !match.slotA || !match.slotB) return false;

        const unlocked = isNetUnlocked(stageObj, net);

        if (isReadOnlyView) return !!match.played;

        if (!unlocked) return false;
        if (match.played) return false;

        const arr = stageObj.matchesByNet[net] || [];
        const index = arr.findIndex((m) => m.id === match.id);
        for (let i = 0; i < index; i++) {
            if (!arr[i].played) return false;
        }

        return true;
    };

    const buildLockedPlaceholdersForNet = (net) => {
        const defaultCountByNet = {
            "0:0": 16,
            "1:0": 8,
            "0:1": 8,
            "2:0": 4,
            "1:1": 8,
            "0:2": 4,
            "2:1": 6,
            "1:2": 6,
            "2:2": 6,
        };

        const count = defaultCountByNet[net] || 4;

        return Array.from({ length: count }, (_, i) => ({
            id: `locked-${net}-${i}`,
            slotA: null,
            slotB: null,
            played: false,
            scoreLeft: null,
            scoreRight: null,
            pickTeamId: null,
            winnerTeamId: null,
            loserTeamId: null,
        }));
    };

    const getPlaceholderHeightForNet = (net) => {
        const map = {
            "1:0": '312px',
            "0:1": '312px',

            "2:0": '152px',
            "1:1": '312px',
            "0:2": '152px',

            "2:1": '232px',
            "1:2": '232px',

            "2:2": '232px',
        };

        return map[net] ?? 180;
    };

    const isPlayedModal = !!currentModalMatch?.played;

    const {
        setsToWin,
        overtimeBlock,
        roundWins,
        roundLosses,
        playerWonSets,
        playerLostSets,
        banner,
    } = seriesState;

    const overtimeTarget = BASE_ROUNDS_TO_WIN + overtimeBlock * 3;
    const overtimeToWin = overtimeBlock === 0 ? 16 : BASE_ROUNDS_TO_WIN + overtimeBlock * 3;

    const threshold = overtimeTarget - 1;

    const isSetPointWins = roundWins === threshold && roundLosses < threshold;
    const isSetPointLosses = roundLosses === threshold && roundWins < threshold;

    const isSeriesPointWins =
        isSetPointWins && playerWonSets === setsToWin - 1;
    const isSeriesPointLosses =
        isSetPointLosses && playerLostSets === setsToWin - 1;

    let loserOpacity = null;
    if (banner) {
        if (playerWonSets > playerLostSets) {
            loserOpacity = "loss";
        } else if (playerLostSets > playerWonSets) {
            loserOpacity = "win";
        }
    }

    let wonPickemPoints = null;

    if (isPlayedModal && currentModalMatch?.played) {
        if (modalContext?.type === "swiss") {
            wonPickemPoints = swissMatchPoints(currentModalMatch);
        } else if (modalContext?.type === "playoffs") {
            wonPickemPoints = playoffsMatchPoints(currentModalMatch);
        }
    }

    let pickemLabelText = "";
    let pickemLabelStyle = {};

    if (wonPickemPoints !== null) {
        if (wonPickemPoints === 0) {
            pickemLabelText = "+0 Pick'em points";
            pickemLabelStyle = { color: "red", left: modalContext?.type === "playoffs" ? '95%' : '75%' };
        } else if (wonPickemPoints === 1) {
            pickemLabelText = "+1 Pick'em point";
            pickemLabelStyle = { color: "#2e7d32", left: modalContext?.type === "playoffs" ? '95%' : '75%' };
        } else {
            pickemLabelText = `+${wonPickemPoints} Pick'em points`;
            pickemLabelStyle = { color: "#2e7d32", left: modalContext?.type === "playoffs" ? '95%' : '75%' };
        }
    }

    const didUserWin =
        !!currentModalMatch?.played &&
        !!currentModalMatch?.pickTeamId &&
        !!currentModalMatch?.winnerTeamId &&
        currentModalMatch.pickTeamId === currentModalMatch.winnerTeamId;

    const renderSwissColumn = (stageObj, nets) => {
        return (
            <div className={css.net_column_container} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {nets.map((net) => {
                    const unlocked = stageObj ? isNetUnlocked(stageObj, net) : false;
                    const matches = stageObj?.matchesByNet?.[net] || [];
                    const placeholderTeams = stageObj ? teamsInNet(stageObj, net) : [];

                    const lockedRects =
                        !unlocked && placeholderTeams.length !== 0;

                    const { currentId, nextId } =
                        unlocked && !isReadOnlyView
                            ? getSwissNetHighlights(stageObj, net)
                            : { currentId: null, nextId: null };

                    return (
                        <div key={net} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                            <span className={css.net_label} style={{ fontWeight: 700 }}>
                                {net}
                            </span>

                            <div className={css.net_stack}>
                                <div className={css.net_base}>
                                    {(unlocked ? matches : buildLockedPlaceholdersForNet(net)).map((m, idx, arr) => {
                                        const isClickable = unlocked && !isMatchRectLocked && (m.played || canOpenSwissMatch(stageObj, net, m));

                                        const highlightClass =
                                            unlocked && m.id === currentId ? css.match_current :
                                                unlocked && m.id === nextId ? css.match_next :
                                                    "";

                                        const isFirst = idx === 0;
                                        const isLast = idx === arr.length - 1;

                                        const isUnfilled = !m.slotA || !m.slotB;
                                        const notStartedEdge = isUnfilled && !m.played && (isFirst || isLast);

                                        return (
                                            <MatchRect
                                                key={m.id}
                                                match={m}
                                                bestOf={getBestOfForSwissNet(net, stageObj.stageKey)}
                                                shouldBestOfBeShown={!unlocked && lockedRects}
                                                isClickable={isClickable}
                                                isButtonLocked={!unlocked || isMatchRectLocked}
                                                shouldPlaceholderCirclesBeRendered={!unlocked && lockedRects}
                                                onClick={
                                                    unlocked
                                                        ? () => openSwissMatchModal(stageObj.stageKey, net, m.id, isReadOnlyView)
                                                        : () => { }
                                                }
                                                className={highlightClass}
                                                dataNet={net}
                                                dataIdx={idx + 1}
                                                dataPos={idx === 0 ? "first" : idx === arr.length - 1 ? "last" : undefined}
                                                dataNotStarted={notStartedEdge ? "true" : undefined}
                                            />
                                        );
                                    })}
                                </div>

                                {!unlocked && lockedRects && (
                                    <div className={css.net_overlay}>
                                        <PlaceholderRect height={getPlaceholderHeightForNet(net)} teams={placeholderTeams} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderSwissBracket = (stageObj) => {
        if (!stageObj) {
            return (
                <div style={{ opacity: 0.75, textAlign: "center", marginTop: 40 }}>
                    This stage has not started yet.
                </div>
            );
        }

        const q30 = getQualifiedBy(stageObj, "3:0");
        const q31 = getQualifiedBy(stageObj, "3:1");
        const q32 = getQualifiedBy(stageObj, "3:2");

        const e03 = getEliminatedBy(stageObj, "0:3");
        const e13 = getEliminatedBy(stageObj, "1:3");
        const e23 = getEliminatedBy(stageObj, "2:3");

        return (
            <div style={{ position: "relative", display: "flex", marginBottom: '48px', marginLeft: '156px', alignItems: "center", justifyContent: "center", transition: "none" }}>
                <div style={{ position: 'absolute', left: '47.05%', top: '-13px' }}>
                    <SwissResultBox title="3:0" tone="green" teams={q30} />
                </div>
                <div style={{ position: 'absolute', left: '62.5%', top: '-13px' }}>
                    <SwissResultBox title="3:1" tone="green" teams={q31} />
                </div>
                <div style={{ position: 'absolute', left: '70.2%', top: '-13px' }}>
                    <SwissResultBox title="3:2" tone="green" teams={q32} />
                </div>
                <div style={{ position: 'absolute', left: '47.05%', bottom: '-25px' }}>
                    <SwissResultBox title="0:3" tone="red" teams={e03} />
                </div>
                <div style={{ position: 'absolute', left: '62.5%', bottom: '-25px' }}>
                    <SwissResultBox title="1:3" tone="red" teams={e13} />
                </div>
                <div style={{ position: 'absolute', left: '70.2%', bottom: '-25px' }}>
                    <SwissResultBox title="2:3" tone="red" teams={e23} />
                </div>

                <div style={{ display: "flex", gap: 60, alignItems: "center", paddingRight: 250, transition: "none" }}>
                    {renderSwissColumn(stageObj, ["0:0"])}
                    {renderSwissColumn(stageObj, ["1:0", "0:1"])}
                    {renderSwissColumn(stageObj, ["2:0", "1:1", "0:2"])}
                    {renderSwissColumn(stageObj, ["2:1", "1:2"])}
                    {renderSwissColumn(stageObj, ["2:2"])}
                </div>
            </div>
        );
    };

    const renderPlayoffsBracket = () => {
        if (!playoffs) {
            return (
                <div style={{ opacity: 0.75, textAlign: "center", marginTop: 40 }}>
                    Playoffs are not built yet.
                </div>
            );
        }

        const getTeamById = (id, a, b) => {
            if (!id) return null;
            if (a?.id === id) return a;
            if (b?.id === id) return b;
            return null;
        };

        const getWinnerTeam = (m) => {
            if (!m?.played) return null;
            return getTeamById(m.winnerTeamId, m.slotA, m.slotB);
        };

        const getLoserTeam = (m) => {
            if (!m?.played) return null;
            return getTeamById(m.loserTeamId, m.slotA, m.slotB);
        };

        const currentStageKey = currentPlayablePlayoffsMatch?.stage ?? null;

        const nextStageKey =
            currentStageKey === "ro16" ? "qf"
                : currentStageKey === "qf" ? "sf"
                    : currentStageKey === "sf" ? "gf"
                        : null;

        const isNextStage = (stageKey) => {
            if (!currentStageKey) return false;
            if (stageKey === nextStageKey) return true;
            if (currentStageKey === "sf" && stageKey === "thirdPlace") return true;
            return false;
        };

        const contendersForSlot = (stageKey, idx, slotKey) => {
            if (!playoffs) return [];

            const pickFromMatch = (m, want) => {
                if (!m) return [];

                if (m.played) {
                    const t = want === "winner" ? getWinnerTeam(m) : getLoserTeam(m);
                    return t ? [t] : [];
                }

                return [m.slotA, m.slotB].filter(Boolean);
            };

            if (stageKey === "qf") {
                const srcIdx = idx * 2 + (slotKey === "slotA" ? 0 : 1);
                return pickFromMatch(playoffs.ro16[srcIdx], "winner");
            }

            if (stageKey === "sf") {
                const srcIdx = idx * 2 + (slotKey === "slotA" ? 0 : 1);
                return pickFromMatch(playoffs.qf[srcIdx], "winner");
            }

            if (stageKey === "gf") {
                const srcIdx = slotKey === "slotA" ? 0 : 1;
                return pickFromMatch(playoffs.sf[srcIdx], "winner");
            }

            if (stageKey === "thirdPlace") {
                const srcIdx = slotKey === "slotA" ? 0 : 1;
                return pickFromMatch(playoffs.sf[srcIdx], "loser");
            }

            return [];
        };

        const PlaceholderWithContenders = ({ stageKey, idx, slotKey }) => {
            const contenders = contendersForSlot(stageKey, idx, slotKey);

            if (!contenders.length) {
                return <div style={{ fontSize: "20px" }} className={css.placeholder_circle}>?</div>;
            }

            const isThirdPlace = stageKey === "thirdPlace";
            const prefix = isThirdPlace ? "Loser of" : "Winner of";

            const nameA = contenders[0]?.name ? `Team ${contenders[0].name}` : "TBD";
            const nameB = contenders[1]?.name ? `Team ${contenders[1].name}` : "TBD";
            const matchupText = `${nameA} VS ${nameB}`;

            const Mini = ({ team, pos }) => {
                const common = {
                    position: "absolute",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    boxShadow: "0 0 3px rgba(0,0,0,0.4)",
                    opacity: 0.75,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "#fff",
                    textShadow: "0 0 3px rgba(0,0,0,0.8)",
                    userSelect: "none",
                    ...(pos === "tl" ? { top: 5, left: 5 } : { bottom: 5, right: 5 }),
                };

                if (!team) {
                    return (
                        <div
                            style={{
                                ...common,
                                background: "rgba(0,0,0,0.25)",
                                border: "1px solid rgba(255,255,255,0.35)",
                                fontStyle: 'italic',
                            }}
                        >
                            ?
                        </div>
                    );
                }

                return (
                    <div
                        style={{
                            ...common,
                            background: team.color,
                        }}
                    />
                );
            };

            return (
                <div
                    className={css.placeholder_circle}
                    style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    title={`${prefix} '${matchupText}' match-up`}
                >
                    <Mini team={contenders[0] ?? null} pos="tl" />

                    <Mini team={contenders[1] ?? null} pos="br" />

                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            opacity: 0.75,
                            pointerEvents: "none",
                            fontStyle: "italic",
                            userSelect: "none",
                        }}
                    >
                        vs
                    </span>
                </div>
            );
        };

        const stageIndex = (k) => {
            if (k === "ro16") return 0;
            if (k === "qf") return 1;
            if (k === "sf") return 2;
            if (k === "thirdPlace") return 3;
            if (k === "gf") return 3;
            return 999;
        };

        const hasStageStarted = (stageKey) => {
            if (!currentStageKey) return false;
            return stageIndex(stageKey) <= stageIndex(currentStageKey);
        };

        const hasPreviewContenders = (stageKey, idx) => {
            const getMatch = () => {
                if (!playoffs) return null;
                if (stageKey === "ro16") return playoffs.ro16?.[idx] ?? null;
                if (stageKey === "qf") return playoffs.qf?.[idx] ?? null;
                if (stageKey === "sf") return playoffs.sf?.[idx] ?? null;
                if (stageKey === "thirdPlace") return playoffs.thirdPlace?.[idx] ?? null;
                if (stageKey === "gf") return playoffs.gf?.[idx] ?? null;
                return null;
            };

            const m = getMatch();
            if (m?.slotA || m?.slotB) return true;

            const a = contendersForSlot(stageKey, idx, "slotA");
            const b = contendersForSlot(stageKey, idx, "slotB");
            return (a?.length ?? 0) > 0 || (b?.length ?? 0) > 0;
        };

        const renderMatch = (m, stageKey, idx, baseClass, nextRect, bestOf, connectorStyle, isSingularMatch) => {
            const isPlayed = !!m.played;

            const isUserWin =
                isPlayed &&
                m.pickTeamId &&
                m.winnerTeamId &&
                m.pickTeamId === m.winnerTeamId;

            const shouldSwap =
                !!m.pickTeamId &&
                m.slotA &&
                m.slotB &&
                m.pickTeamId === m.slotB.id;

            const leftTeam = shouldSwap ? m.slotB : m.slotA;
            const rightTeam = shouldSwap ? m.slotA : m.slotB;

            const rawLeftScore = m.scoreLeft;
            const rawRightScore = m.scoreRight;

            const displayScoreLeft = shouldSwap ? rawRightScore : rawLeftScore;
            const displayScoreRight = shouldSwap ? rawLeftScore : rawRightScore;

            const resultClass = isPlayed ? (isUserWin ? css.playoffs_match_win : css.playoffs_match_loss) : "";

            const boLabelResultClass = isPlayed
                ? isUserWin
                    ? css.playoffs_match_win_label
                    : css.playoffs_match_loss_label
                : "";

            const noLabelResultClass = isPlayed
                ? isUserWin
                    ? css.playoffs_match_win_no_label
                    : css.playoffs_match_loss_no_label
                : "";

            const isCurrent =
                !!currentPlayablePlayoffsMatch &&
                currentPlayablePlayoffsMatch.stage === stageKey &&
                currentPlayablePlayoffsMatch.index === idx;

            const isNext =
                !!nextPlayoffsMatch &&
                nextPlayoffsMatch.stage === stageKey &&
                nextPlayoffsMatch.index === idx;

            const winnerIsLeft =
                isPlayed && m.winnerTeamId && leftTeam && m.winnerTeamId === leftTeam.id;
            const winnerIsRight =
                isPlayed && m.winnerTeamId && rightTeam && m.winnerTeamId === rightTeam.id;

            const isLeftLoser =
                isPlayed && m.loserTeamId && leftTeam && m.loserTeamId === leftTeam.id;
            const isRightLoser =
                isPlayed && m.loserTeamId && rightTeam && m.loserTeamId === rightTeam.id;

            const isClickable =
                !isMatchRectLocked &&
                (isReadOnlyView ? !!m.played : (m.played || canOpenPlayoffsMatch(playoffs, stageKey, idx)));

            const stageStarted = hasStageStarted(stageKey);
            const previewExists = hasPreviewContenders(stageKey, idx);

            const canClick =
                !isMatchRectLocked &&
                (m.played || (stageStarted && isClickable));

            const canHover =
                !isMatchRectLocked &&
                (canClick || (!stageStarted && previewExists));

            return (
                <div key={m.id} className={connectorStyle}>
                    <div
                        className={`${baseClass} ${isMatchRectLocked || isNextStage(stageKey) ? nextRect : ""
                            } ${resultClass} ${isCurrent ? css.match_current : ""} ${isNext ? css.match_next : ""} ${canHover ? baseClass : css.no_hover
                            }`}
                        style={{
                            pointerEvents: canHover ? "auto" : "none",
                            cursor: canClick || isPlayed ? "pointer" : canHover ? "default" : "default",
                            borderColor: isPlayed ? (isUserWin ? "#2e7d32" : "#7d2e2e") : ""
                        }}
                        onClick={() => {
                            if (!canClick) return;
                            openPlayoffsMatchModal(stageKey, m.id, isReadOnlyView);
                        }}
                    >
                        {isPlayed && (
                            isUserWin ? (
                                <div className={css.playoffsSuccessPickemIndicator}>
                                    <FaCircle size={28} color="#37b737" />
                                    <FaCheck size={16} color="#ffffff" />
                                </div>
                            ) : (
                                <div className={css.playoffsSuccessPickemIndicator}>
                                    <FaCircle size={28} color="#be3939" />
                                    <FaXmark size={16} color="#fff" />
                                </div>
                            )
                        )}
                        <div
                            className={`${stageKey === "thirdPlace" ? css.bo_thirdPlaceDecider_label : css.bo_playoffs_label} ${boLabelResultClass}`}
                            style={isCurrent ? { outline: '2px solid #ffd700', border: 'none', boxShadow: '0 0 12px rgba(255, 215, 0, 0.9)' } : isNext ? { outline: '2px dashed #888', border: 'none', boxShadow: '0 0 12px rgba(160, 160, 160, 0.43)' } : {}}
                        >
                            BO{bestOf}
                        </div>
                        {!isSingularMatch ? (
                            <div
                                className={`${css.no_playoffs_label} ${noLabelResultClass}`}
                                style={isCurrent ? { outline: '2px solid #ffd700', border: 'none', boxShadow: '0 0 12px rgba(255, 215, 0, 0.9)' } : isNext ? { outline: '2px dashed #888', border: 'none', boxShadow: '0 0 12px rgba(160, 160, 160, 0.43)' } : {}}
                            >
                                #{idx + 1}
                            </div>
                        ) : null}
                        <div className={css.match_content}>
                            <div className={css.team_row}>
                                <div className={css.team_cell}>
                                    {leftTeam ? (
                                        <div
                                            className={css.team_circle}
                                            style={{ background: leftTeam.color }}
                                            title={`Team ${leftTeam.name}`}
                                        />
                                    ) : (
                                        <PlaceholderWithContenders
                                            stageKey={stageKey}
                                            idx={idx}
                                            slotKey="slotA"
                                        />
                                    )}
                                </div>

                                <div
                                    style={{ color: !isPlayed ? "" : winnerIsLeft ? "#2e7d32" : "red" }}
                                    className={css.team_name_placeholder}
                                >
                                    {leftTeam?.name ? `Team ${leftTeam?.name}` : "TBD"}
                                </div>
                                <span
                                    style={{
                                        color: winnerIsLeft ? "#2e7d32" : "red",
                                        fontWeight: 800,
                                        fontStyle: "italic",
                                        position: "absolute",
                                        left: "85%",
                                        zIndex: 1,
                                        fontSize: 72,
                                        opacity: isLeftLoser ? 0.4 : 1
                                    }}
                                    className={winnerIsLeft ? css.winnerScoreShadow : css.loserScoreShadow}
                                >
                                    {displayScoreLeft}
                                </span>
                            </div>

                            <div className={css.vs_row}>
                                <div style={{ backgroundColor: isPlayed ? (isUserWin ? "#2e7d32" : "red") : "" }} className={css.divider} />
                                {!isPlayed || m.scoreLeft == null || m.scoreRight == null ? (
                                    <span
                                        style={{
                                            textShadow: `
                                                1px 0 #d8d8d8,
                                                -1px 0 #d8d8d8,
                                                0 1px #d8d8d8,
                                                0 -1px #d8d8d8,
                                                1px 1px #d8d8d8,
                                                1px -1px #d8d8d8,
                                                -1px 1px #d8d8d8,
                                                -1px -1px #d8d8d8,
                                                2px 0 #5a5a5a,
                                                -2px 0 #5a5a5a,
                                                0 2px #5a5a5a,
                                                0 -2px #5a5a5a,
                                                2px 2px #5a5a5a,
                                                2px -2px #5a5a5a,
                                                -2px 2px #5a5a5a,
                                                -2px -2px #5a5a5a,
                                                2px 0 #5a5a5a,
                                                -2px 0 #5a5a5a
                                            `,
                                        }}
                                        className={css.vs_text}
                                    >
                                        VS
                                    </span>
                                ) : null}
                            </div>

                            <div className={css.team_row}>
                                <div className={css.team_cell}>
                                    {rightTeam ? (
                                        <div
                                            className={css.team_circle}
                                            style={{ background: rightTeam.color }}
                                            title={`Team ${rightTeam.name}`}
                                        />
                                    ) : (
                                        <PlaceholderWithContenders
                                            stageKey={stageKey}
                                            idx={idx}
                                            slotKey="slotB"
                                        />
                                    )}
                                </div>

                                <div
                                    style={{ color: !isPlayed ? "" : winnerIsRight ? "#2e7d32" : "red" }}
                                    className={css.team_name_placeholder}
                                >
                                    {rightTeam?.name ? `Team ${rightTeam?.name}` : "TBD"}
                                </div>
                                <span
                                    style={{
                                        color: winnerIsRight ? "#2e7d32" : "red",
                                        fontWeight: 800,
                                        fontStyle: "italic",
                                        position: "absolute",
                                        left: "83%",
                                        zIndex: 1,
                                        fontSize: 72,
                                        opacity: isRightLoser ? 0.4 : 1
                                    }}
                                    className={winnerIsRight ? css.winnerScoreShadow : css.loserScoreShadow}
                                >
                                    {displayScoreRight}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className={css.bracket_container} style={{ transition: "none", marginLeft: '28px' }}>
                <div className={css.bracket_inner}>
                    <div className={css.column_container}>
                        <h4 className={css.column_title}>Round of 16</h4>
                        <div className={css.columnRo16}>
                            {playoffs.ro16.map((m, idx) =>
                                renderMatch(
                                    m,
                                    "ro16",
                                    idx,
                                    css.match_rect,
                                    css.next_rect,
                                    getBestOfForPlayoffs("ro16"),
                                    idx % 2 === 0 ? css.ro16ConnectorWrapper_down : css.ro16ConnectorWrapper_up,
                                    false
                                )
                            )}
                        </div>
                    </div>

                    <div className={css.column_container}>
                        <h4 className={css.column_title}>Quarterfinals</h4>
                        <div className={css.columnQuarters}>
                            {playoffs.qf.map((m, idx) =>
                                renderMatch(
                                    m,
                                    "qf",
                                    idx,
                                    css.quarters_rect,
                                    css.next_rect,
                                    getBestOfForPlayoffs("qf"),
                                    idx % 2 === 0 ? css.qfConnectorWrapper_down : css.qfConnectorWrapper_up,
                                    false
                                )
                            )}
                        </div>
                    </div>

                    <div className={css.column_container}>
                        <h4 className={css.column_title}>Semifinals</h4>
                        <div className={css.columnSemis}>
                            {playoffs.sf.map((m, idx) =>
                                renderMatch(
                                    m,
                                    "sf",
                                    idx,
                                    css.semis_rect,
                                    css.next_rect,
                                    getBestOfForPlayoffs("sf"),
                                    idx % 2 === 0 ? css.sfConnectorWrapper_down : css.sfConnectorWrapper_up,
                                    false
                                )
                            )}
                        </div>
                    </div>

                    <div className={css.column_container}>
                        <h4 className={css.column_title}>Grand Final</h4>
                        <div className={css.columnGrandFinal}>
                            {playoffs.gf.map((m, idx) =>
                                renderMatch(
                                    m,
                                    "gf",
                                    idx,
                                    css.grandFinal_rect,
                                    css.next_rect,
                                    getBestOfForPlayoffs("gf"),
                                    css.gfConnectorWrapper,
                                    true
                                )
                            )}
                        </div>
                    </div>

                    {playoffs.thirdPlace && (
                        <div className={css.thirdPlace_container}>
                            <h4 style={{ width: '17ch' }} className={css.column_title}>Third Place Decider</h4>
                            <div className={css.columnThirdPlace}>
                                {playoffs.thirdPlace.map((m, idx) =>
                                    renderMatch(
                                        m,
                                        "thirdPlace",
                                        idx,
                                        css.thirdPlace_rect,
                                        css.next_rect,
                                        getBestOfForPlayoffs("thirdPlace"),
                                        css.thirdPlaceDeciderConnectorWrapper,
                                        true
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const getMatchStakeText = ({
        modalContext,
        winnerIsLeft,
        winnerIsRight,
    }) => {
        const playoffsStage = modalContext?.stage;
        const stage = modalContext?.stageKey;
        const type = modalContext?.type;
        const net = modalContext?.net;
        const index = (playoffs?.[modalContext.stage] || []).findIndex((m) => m.id === modalContext.matchId);
        const num = index >= 0 ? index + 1 : 1;

        let leftText = null;
        let rightText = null;

        if (type === "swiss") {
            const isProgression =
                net === "2:0" ||
                net === "2:1" ||
                net === "2:2";

            const isElimination =
                net === "0:2" ||
                net === "1:2" ||
                net === "2:2";

            if (isProgression) {
                let progressionText = "";

                if (stage === "stage1") {
                    progressionText = "qualifies to Stage II";
                }

                if (stage === "stage2") {
                    progressionText = "qualifies to Stage III";
                }

                if (stage === "stage3") {
                    progressionText = "qualifies to Playoffs: Round of 16";
                }

                if (winnerIsLeft) leftText = progressionText;
                if (winnerIsRight) rightText = progressionText;
            }

            if (isElimination) {
                const eliminationText =
                    stage === "stage3"
                        ? "doesn't make it to Playoffs"
                        : "flies out of this tournament";

                if (winnerIsLeft) {
                    rightText = eliminationText;
                }

                if (winnerIsRight) {
                    leftText = eliminationText;
                }
            }
        }

        if (type === "playoffs") {
            switch (playoffsStage) {
                case "ro16":
                    if (winnerIsLeft) {
                        leftText = <>goes to <b>Quarterfinals</b></>;
                        rightText = "path ends here, for now!";
                    } else {
                        rightText = <>goes to <b>Quarterfinals</b></>;
                        leftText = "path ends here, for now!";
                    }
                    break;

                case "qf":
                    if (winnerIsLeft) {
                        leftText = <>goes to <b>Semifinals</b></>;
                        rightText = "path ends here, for now!";
                    } else {
                        rightText = <>goes to <b>Semifinals</b></>;
                        leftText = "path ends here, for now!";
                    }
                    break;

                case "sf": {
                    if (num === 1) {
                        if (winnerIsLeft) {
                            leftText = <>is the first <b>Grand Finalist</b>!</>;
                            rightText = "has still a chance of earning Third Place";
                        } else {
                            rightText = <>is the first <b>Grand Finalist</b>!</>;
                            leftText = "has still a chance of earning Third Place";
                        }
                    }
                    if (num === 2) {
                        if (winnerIsLeft) {
                            leftText = <>is the second <b>Grand Finalist</b>!</>;
                            rightText = "has still a chance of earning Third Place";
                        } else {
                            rightText = <>is the second <b>Grand Finalist</b>!</>;
                            leftText = "has still a chance of earning Third Place";
                        }
                    }

                    break;
                }

                case "thirdPlace":
                    if (winnerIsLeft) {
                        leftText = <>earns <b>Third Place Medal</b>!</>;
                        rightText = "still had a good run!";
                    } else {
                        rightText = <>earns <b>Third Place Medal</b>!</>;
                        leftText = "still had a good run!";
                    }
                    break;

                case "gf":
                    if (winnerIsLeft) {
                        leftText = <><b>WINS</b> the tournament!</>;
                        rightText = "second place is still wonderful!";
                    } else {
                        rightText = <><b>WINS</b> the tournament!</>;
                        leftText = "second place is still wonderful!";
                    }
                    break;
            }
        }

        return {
            leftText,
            rightText,
        };
    };

    useLayoutEffect(() => {
        const id = requestAnimationFrame(() => {
            window.dispatchEvent(new Event("resize"));
        });

        return () => cancelAnimationFrame(id);
    }, [tournamentResults]);

    const modalTitle = useMemo(() => {
        if (!modalContext) return "";

        if (modalContext.type === "swiss") {
            return swissNetTitle(modalContext.net);
        }

        const stageText = stageLabelPlayoffs(modalContext.stage);
        return stageText;
    }, [modalContext]);

    const modalMatchNumber = useMemo(() => {
        if (!modalContext) return 1;

        if (modalContext.type === "swiss") {
            return currentModalMatch?.matchNoInNet ?? 1;
        }

        const matches = playoffs?.[modalContext.stage] ?? [];
        const index = matches.findIndex((m) => m.id === modalContext.matchId);

        return index >= 0 ? index + 1 : 1;
    }, [modalContext, currentModalMatch, playoffs]);

    const breakdownPointLabel = useMemo(() => {
        if (!modalContext) return "MATCH POINT!!!";
        if (modalContext.type === "playoffs") return "MATCH POINT!!!";

        const pointNet = ["2:0", "2:1", "2:2"];
        if (!pointNet.includes(modalContext.net)) return "MATCH POINT!!!";

        if (modalContext.stageKey === "stage1") return "STAGE II POINT!!!";
        if (modalContext.stageKey === "stage2") return "STAGE III POINT!!!";
        if (modalContext.stageKey === "stage3") return "PLAYOFFS POINT!!!";

        return "MATCH POINT!!!";
    }, [modalContext]);

    const modalStageSmallLabel = useMemo(() => {
        if (!modalContext) return "";
        if (modalContext.type === "playoffs") return "";
        if (modalContext.stageKey === "stage1") return "Stage I";
        if (modalContext.stageKey === "stage2") return "Stage II";
        if (modalContext.stageKey === "stage3") return "Stage III";
        return "";
    }, [modalContext]);

    const displayedMiniSquares =
        seriesState.roundNumber === 1 ||
            seriesState.roundNumber === 13 ||
            (seriesState.isOvertime && seriesState.roundNumber === 1)
            ? 10
            : 5;

    const seriesLabelNode = useMemo(() => {
        if (!seriesState.active || !seriesState.leftTeam || !seriesState.rightTeam) return null;

        const {
            setsToWin,
            setNumber,
            banner: seriesBanner,
        } = seriesState;

        let small = "";
        let big = "";

        if (seriesState.phase === "playoffs") {
            small = tournamentLabel;
            big = stageLabelPlayoffs(seriesState.playoffsStage);
        } else if (seriesState.phase === "stage1") {
            small = (
                <>
                    {tournamentLabel} | Stage I
                </>
            );
            big = swissNetTitle(seriesState.swissNet);
        } else if (seriesState.phase === "stage2") {
            small = (
                <>
                    {tournamentLabel} | Stage II
                </>
            );
            big = swissNetTitle(seriesState.swissNet);
        } else if (seriesState.phase === "stage3") {
            small = (
                <>
                    {tournamentLabel} | Stage III
                </>
            );
            big = swissNetTitle(seriesState.swissNet);
        }

        const seriesMatchNumber =
            seriesState.phase === "playoffs"
                ? seriesState.playoffsMatchNumber
                : seriesState.swissMatchNumber ?? 1;

        return (
            <>
                <span className={css.series_label}>
                    <span className={css.series_upper_label}>
                        <motion.span
                            key={`${seriesState.phase}-${seriesState.swissNet ?? seriesState.playoffsStage}`}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.6 }}
                            className={css.round_text}
                            style={{
                                position: "absolute",
                                right: "205px",
                                width: "max-content",
                                marginBottom: "-2px",
                                fontSize: "24px",
                                transition: 'none'
                            }}
                        >
                            {small}
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, y: -40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ duration: 0.6 }}
                            className={css.round_text}
                            style={{ fontSize: "28px", marginBottom: "-5px", position: "absolute", left: "44.55%", transition: 'none' }}
                        >
                            <FaTrophy />
                        </motion.span>
                        <motion.div
                            key={big}
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.6 }}
                            className={css.round_text}
                            style={{
                                fontSize: "24px",
                                position: "absolute",
                                left: "210px",
                                top: "-17px",
                                width: "max-content",
                                transition: 'none',
                                display: "flex"
                            }}
                        >
                            {big}
                            {seriesState.playoffsStage !== "gf" && seriesState.playoffsStage !== "thirdPlace" ? (
                                <div
                                    style={{
                                        marginLeft: "2px",
                                        marginTop: "-2px",
                                        padding: "4px 8px",
                                    }}
                                    className={css.points}
                                >
                                    #{seriesMatchNumber}
                                </div>
                            ) : null}
                        </motion.div>
                    </span>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className={css.round_text}
                        style={{ fontSize: "24px", marginBottom: "-4px", marginLeft: "-2px" }}
                    >
                        Best of {setsToWin * 2 - 1}
                    </motion.span>
                    {setsToWin !== 1 && !seriesBanner ? (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.round_text}
                            style={{ fontSize: "24px" }}
                        >
                            {(() => {
                                const currentSet = setNumber;
                                const totalSets = setsToWin * 2 - 1;
                                const isDecider = currentSet === totalSets;
                                return isDecider
                                    ? "Decider"
                                    : `Set ${currentSet}`;
                            })()}
                        </motion.span>
                    ) : setsToWin !== 1 ? (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.round_text}
                            style={{ fontSize: "28px" }}
                        >
                            &nbsp;
                        </motion.span>
                    ) : null}
                    {seriesState.finishedSets?.length > 0 && !seriesBanner ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "start",
                                justifyContent: "center",
                                columnGap: "12px",
                                rowGap: '4px',
                                maxWidth: "380px",
                                height: seriesState.finishedSets?.length >= 7 ? "62px" : "40px",
                            }}
                        >
                            {seriesState.finishedSets.map(({
                                set,
                                leftScore,
                                rightScore,

                                extendedRoundsPlayed,
                                extendedRoundLeftScore,
                                extendedRoundRightScore,

                                penaltiesPlayed,
                                penaltyLeftScore,
                                penaltyRightScore,
                            }) => {
                                const displayLeftScore = penaltiesPlayed
                                    ? penaltyLeftScore
                                    : extendedRoundsPlayed
                                        ? extendedRoundLeftScore
                                        : leftScore;

                                const displayRightScore = penaltiesPlayed
                                    ? penaltyRightScore
                                    : extendedRoundsPlayed
                                        ? extendedRoundRightScore
                                        : rightScore;

                                const leftWonSet = displayLeftScore > displayRightScore;

                                return (
                                    <div
                                        key={set}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                        }}
                                    >
                                        <span
                                            className={css.round_text}
                                            style={{
                                                fontSize: "12px",
                                                textShadow: leftWonSet
                                                    ? seriesState.leftTeam.shadow
                                                    : seriesState.rightTeam.shadow,
                                                color: leftWonSet
                                                    ? seriesState.leftTeam.color
                                                    : seriesState.rightTeam.color,
                                            }}
                                        >
                                            Set {set}
                                        </span>

                                        <span
                                            style={{
                                                color:
                                                    leftScore > rightScore
                                                        ? "#4caf50"
                                                        : leftScore === rightScore
                                                            ? "#2e2f42"
                                                            : "#f44336",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {leftScore}
                                        </span>

                                        <span
                                            className={css.round_text}
                                            style={{
                                                fontSize: "12px",
                                                marginTop: '-1px'
                                            }}
                                        >
                                            -
                                        </span>

                                        <span
                                            style={{
                                                color:
                                                    rightScore > leftScore
                                                        ? "#4caf50"
                                                        : rightScore === leftScore
                                                            ? "#2e2f42"
                                                            : "#f44336",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {rightScore}
                                        </span>
                                        {penaltiesPlayed ? (
                                            <span
                                                className={css.round_text}
                                                style={{
                                                    fontSize: "12px",
                                                    marginLeft: "-4px"
                                                }}
                                            >
                                                (Pens{" "}
                                                <span
                                                    style={{
                                                        color:
                                                            penaltyLeftScore > penaltyRightScore
                                                                ? "#4caf50"
                                                                : penaltyLeftScore === penaltyRightScore
                                                                    ? "#2e2f42"
                                                                    : "#f44336",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    {penaltyLeftScore}
                                                </span>{" "}
                                                -{" "}
                                                <span
                                                    style={{
                                                        color:
                                                            penaltyRightScore > penaltyLeftScore
                                                                ? "#4caf50"
                                                                : penaltyLeftScore === penaltyRightScore
                                                                    ? "#2e2f42"
                                                                    : "#f44336",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    {penaltyRightScore}
                                                </span>
                                                )
                                            </span>
                                        ) : extendedRoundsPlayed ? (
                                            <span
                                                className={css.round_text}
                                                style={{
                                                    fontSize: "12px",
                                                    marginLeft: "-4px",
                                                }}
                                            >
                                                (ERs{" "}
                                                <span
                                                    style={{
                                                        color:
                                                            extendedRoundLeftScore > extendedRoundRightScore
                                                                ? "#4caf50"
                                                                : extendedRoundLeftScore === extendedRoundRightScore
                                                                    ? "#2e2f42"
                                                                    : "#f44336",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    {extendedRoundLeftScore}
                                                </span>{" "}
                                                -{" "}
                                                <span
                                                    style={{
                                                        color:
                                                            extendedRoundRightScore > extendedRoundLeftScore
                                                                ? "#4caf50"
                                                                : extendedRoundLeftScore === extendedRoundRightScore
                                                                    ? "#2e2f42"
                                                                    : "#f44336",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    {extendedRoundRightScore}
                                                </span>
                                                )
                                            </span>
                                        ) : null}
                                    </div>
                                )
                            })}
                        </motion.div>
                    ) : setsToWin !== 1 ? (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.round_text}
                            style={{
                                fontSize: "12px",
                                height: "40px",
                            }}
                        >
                            &nbsp;
                        </motion.span>
                    ) : null}
                </span>
            </>
        );
    }, [seriesState, tournamentLabel]);

    const lossBasedPoints =
        (finalPickemPoints ?? 0) - (guessedCounts?.correct ?? 0);
    if (showPickemSummary) {
        return (
            <div className={css.page_wrapper}>
                <div className={css.game_container}>
                    <p className={css.info_text} style={{ marginBottom: "24px", fontSize: '32px', fontWeight: '700', textAlign: 'center', width: '680px' }}>
                        {buildPickemSentence()} <br />
                        {lossBasedPoints !== 0 && (
                            <span style={{ color: "#d4cebaff", fontWeight: "700" }}>
                                <span style={{ fontWeight: '800' }}>+{lossBasedPoints}</span> {' '}
                                Pick&apos;em point{lossBasedPoints === 1 ? '' : 's'} from correctly guessed sets in not guessed matches
                            </span>
                        )}
                    </p>

                    {showPickemLine2 && (
                        <p
                            className={css.info_text}
                            style={{ marginBottom: "12px", fontSize: '32px', fontWeight: 'bold', textAlign: 'center' }}
                        >
                            That's why, you received <br />
                            <span
                                style={{
                                    backgroundColor:
                                        finalPickemPoints >= neededPickemPoints
                                            ? "#2e7d32"
                                            : "red",
                                    fontWeight: 700,
                                    color:
                                        finalPickemPoints >= neededPickemPoints
                                            ? "#fff"
                                            : "#fff",
                                    margin: '8px auto'
                                }}
                                className={css.points}
                            >
                                <CountUp start={0} duration={1.2} end={finalPickemPoints} key={finalPickemPoints} />
                            </span>{" "}
                            <span style={{ fontWeight: '800' }}>Pick&apos;em points</span>, when needed:{" "}
                            <span style={{ margin: 'auto' }} className={css.points}>
                                <CountUp start={0} duration={1.2} end={neededPickemPoints} key={neededPickemPoints} />
                            </span>
                        </p>
                    )}

                    {showPickemResult && (
                        <>
                            <p
                                className={css.info_text}
                                style={{ marginBottom: "8px", fontSize: '32px', fontWeight: 'bold', textAlign: 'center' }}
                            >
                                and because of that,
                            </p>

                            <h1
                                className={css.game_title}
                                style={{
                                    color: isPickemWin ? "#00ff7f" : "#ff4c4c",
                                    textShadow: isPickemWin
                                        ? "0 0 5px rgba(0,255,127,0.8)"
                                        : "0 0 5px rgba(255,76,76,0.8)",
                                }}
                            >
                                {isPickemWin ? "You Won! 🎉" : "You Lost! 😢"}
                            </h1>

                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "16px",
                                    justifyContent: "center",
                                    marginTop: "16px",
                                }}
                            >
                                <button className={`${css.gamble_button} ${css.back_button}`} onClick={() => {
                                    setShowPickemSummary(false);
                                    setShowWinnersScreen(false);
                                }}>
                                    To the bracket
                                </button>
                                <button className={css.gamble_button} onClick={resetSpecialModeState}>
                                    Back to the start of Special Mode
                                </button>
                                <button className={css.gamble_button} onClick={() => { resetSpecialModeState(); navigate("/gambling"); }}>
                                    Back to normal Gambling
                                </button>
                                <button className={css.gamble_button} onClick={() => { resetSpecialModeState(); navigate("/"); }}>
                                    To Home Page
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const pickQuote = (list, seed = 0) => {
        if (!list || list.length === 0) return "";
        const index = ((seed + tournamentNumber * 3) % list.length + list.length) % list.length;
        return list[index];
    };

    if (showWinnersScreen && tournamentResults) {
        return (
            <>
                <div className={css.winnerScreen}>
                    {showWinnerText && (
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className={css.winnerHeadline}
                        >
                            {winnersText}
                        </motion.h2>
                    )}
                    <div className={css.winnerPodium}>
                        {showPodium && (
                            <>
                                {tournamentResults.runnerUp && (
                                    <motion.div
                                        initial={
                                            hasPlayedWinnerAnimation
                                                ? false
                                                : { opacity: 0, y: 900 }
                                        }
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={
                                            hasPlayedWinnerAnimation
                                                ? { duration: 0 }
                                                : { duration: 3, delay: 5 }
                                        }
                                        className={css.podiumRow}
                                    >
                                        <div
                                            className={css.runnerUpLogo}
                                            style={{
                                                backgroundColor: tournamentResults.runnerUp.color,
                                                boxShadow: tournamentResults.runnerUp.shadow
                                            }}
                                        />
                                        <span className={css.runnerUpMedal}>🥈</span>
                                        <div className={css.secondPodium}>
                                            <ReactFitty key={tournamentResults.runnerUp?.name} className={css.runnerUpName} maxSize={16} minSize={10}>
                                                Team <b>{tournamentResults.runnerUp.name}</b>
                                            </ReactFitty>
                                            <span className={css.runnerUpLabel}>RunnerUp</span>
                                            <span className={css.runnerUpQuote}>"{pickQuote(PODIUM_QUOTES.runnerUp, tournamentResults.runnerUp?.id ?? 0)}"</span>
                                        </div>
                                    </motion.div>
                                )}
                                {tournamentResults.winner && (
                                    <motion.div
                                        initial={
                                            hasPlayedWinnerAnimation
                                                ? false
                                                : { opacity: 0, y: 1100 }
                                        }
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={
                                            hasPlayedWinnerAnimation
                                                ? { duration: 0 }
                                                : { duration: 3.666, delay: 8 }
                                        }
                                        className={css.podiumRow}
                                    >
                                        <div
                                            className={css.winnerLogo}
                                            style={{
                                                backgroundColor: tournamentResults.winner.color,
                                                boxShadow: tournamentResults.winner.shadow,
                                            }}
                                        />
                                        <span className={css.winnerMedal}>🥇</span>
                                        <span className={css.winnerTrophy}><FaTrophy /></span>
                                        <div className={css.firstPodium}>
                                            <ReactFitty key={tournamentResults.winner?.name} className={css.firstPlaceName} maxSize={16} minSize={10}>
                                                Team <b>{tournamentResults.winner.name}</b>
                                            </ReactFitty>
                                            <span className={css.firstPlaceLabel}>Winner</span>
                                            <span className={css.firstPlaceQuote}>"{pickQuote(PODIUM_QUOTES.winner, tournamentResults.winner?.id ?? 0)}"</span>
                                        </div>
                                    </motion.div>
                                )}
                                {tournamentResults.thirdPlace && (
                                    <motion.div
                                        initial={
                                            hasPlayedWinnerAnimation
                                                ? false
                                                : { opacity: 0, y: 700 }
                                        }
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={
                                            hasPlayedWinnerAnimation
                                                ? { duration: 0 }
                                                : { duration: 2.334, delay: 3 }
                                        }
                                        className={css.podiumRow}
                                    >
                                        <div
                                            className={css.placeLogoThird}
                                            style={{ background: tournamentResults.thirdPlace.color }}
                                        />
                                        <span className={css.thirdPlaceMedal}>🥉</span>
                                        <div className={css.thirdPodium}>
                                            <ReactFitty key={tournamentResults.thirdPlace?.name} className={css.thirdPlaceName} maxSize={16} minSize={10}>
                                                Team <b>{tournamentResults.thirdPlace.name}</b>
                                            </ReactFitty>
                                            <span className={css.thirdPlaceLabel}>3rd</span>
                                            <span className={css.thirdPlaceQuote}>"{pickQuote(PODIUM_QUOTES.thirdPlace, tournamentResults.thirdPlace?.id ?? 0)}"</span>
                                        </div>
                                    </motion.div>
                                )}

                                {tournamentResults.fourthPlace && (
                                    <motion.div
                                        initial={
                                            hasPlayedWinnerAnimation
                                                ? false
                                                : { opacity: 0, y: 600 }
                                        }
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={
                                            hasPlayedWinnerAnimation
                                                ? { duration: 0 }
                                                : { duration: 2, delay: 0.5 }
                                        }
                                        className={css.podiumRow}
                                    >
                                        <div
                                            className={css.placeLogoFourth}
                                            style={{ background: tournamentResults.fourthPlace.color }}
                                        />
                                        <span className={css.fourthPlaceMedal}>🏅</span>
                                        <div className={css.fourthPodium}>
                                            <ReactFitty key={tournamentResults.fourthPlace?.name} className={css.fourthPlaceName} maxSize={16} minSize={10}>
                                                Team <b>{tournamentResults.fourthPlace.name}</b>
                                            </ReactFitty>
                                            <span className={css.fourthPlaceLabel}>4th</span>
                                            <span className={css.fourthPlaceQuote}>"{pickQuote(PODIUM_QUOTES.fourthPlace, tournamentResults.fourthPlace?.id ?? 0)}"</span>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>

                    {showProceed && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.gamble_button}
                            onClick={handleProceed}
                            style={{ zIndex: 10, marginTop: "124px" }}
                        >
                            Proceed
                        </motion.button>
                    )}
                </div>
            </>
        );
    }

    const getPointLabel = () => {
        const pointNet = ["2:0", "2:1", "2:2"];

        if (!pointNet.includes(seriesState.swissNet)) {
            return "MATCH POINT!!!";
        }

        switch (seriesState.phase) {
            case "stage1":
                return "STAGE II POINT!!!";

            case "stage2":
                return "STAGE III POINT!!!";

            case "stage3":
                return "PLAYOFFS POINT!!!";

            default:
                return "MATCH POINT!!!";
        }
    };

    const leftAttempts = seriesState.penaltyLeftResults.length;
    const rightAttempts = seriesState.penaltyRightResults.length;

    const completedSuddenDeathPairs = Math.min(
        Math.max(0, leftAttempts - 5),
        Math.max(0, rightAttempts - 5)
    );

    const attemptsToDisplay =
        PENALTY_DISPLAY_CIRCLES + completedSuddenDeathPairs;

    const currentAttempt = Math.min(
        seriesState.penaltyLeftResults.length,
        seriesState.penaltyRightResults.length
    ) + 1;

    const inSuddenDeath = currentAttempt > 5;

    if (isSeriesActive) {
        const {
            playerWonSets,
            playerLostSets,
            roundWins,
            roundLosses,
            miniWins,
            miniLosses,
            isOvertime,
            overtimeBlock,
            banner,
        } = seriesState;

        const momentum =
            roundWins > roundLosses
                ? "left"
                : roundLosses > roundWins
                    ? "right"
                    : "tied";

        return (
            <>
                <Header
                    setIsRestartModalOpen={() => setIsRestartModalOpen(true)}
                    setIsTerminateModalOpen={() => setIsTerminateModalOpen(true)}
                    setIsScoreBoardOpen={() => {
                        setIsLeaderboardOpen(false);
                        setIsTournamentNumberButtonArmed(false);
                    }}
                    setIsScoreBoard={() => setIsLeaderboardOpen(true)}
                    isIntroClosed={showIntro || showPickemLine2}
                    isLeaderboardOpen={isLeaderboardOpen}
                    isButtonLocked={isButtonLocked}
                    isScoreBoardButtonLocked={isScoreBoardButtonLocked}
                    isScoreBoardResetButtonLocked={isScoreBoardResetButtonLocked}
                    setIsScoreBoardResetModalOpen={() => setIsScoreBoardResetModalOpen(true)}
                    setIsAddTournamentPlacingsModalOpen={handleAddPlacingsClick}
                    setIsRemoveTournamentPlacingsModalOpen={handleRemovePlacingsClick}
                    arePlacingButtonsArmed={arePlacingButtonsArmed}
                    hasAnyPlacings={hasAnyPlacings}
                    onInfoPage={() => navigate("/special-mode-info")}
                />
                <div style={{ marginTop: setsToWin === 1 ? "40px" : "-80px" }} className={css.series_container}>
                    <button
                        type="button"
                        onClick={toggleSecretGuaranteedWin}
                        onContextMenu={handleSecretButtonContextMenu}
                        className={css.gamble_button}
                        style={{
                            position: "absolute",
                            top: setsToWin !== 1 ? "-33%" : "0%",
                            left: "42%",
                            background: "#f7f7f7ff",
                            color: "transparent",
                            fontSize: "12px",
                            border: "none",
                            cursor: "auto",
                            opacity: 0,
                            zIndex: 9999,
                        }}
                    >
                        Secret
                    </button>
                    {seriesLabelNode}
                    {seriesState.tiebreakerPhase === "extended" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            aria-live="polite"
                            style={{
                                position: "fixed",
                                inset: 0,
                                zIndex: 9998,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "24px",
                                background: "rgba(0,0,0,0.35)",
                                backdropFilter: "blur(14px) saturate(240%)",
                                animation: "fade-in 0.4s ease-out",
                            }}
                        >
                            <div
                                className={css.scoreboard}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row-reverse",
                                        alignItems: "center",
                                        gap: "14px",
                                        opacity: loserOpacity === "win" ? 0.4 : 1,
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", flexDirection: 'column', width: '50.1px' }}>
                                        <span
                                            className={css.round_text}
                                            style={{
                                                height: "76px",
                                                color: seriesState.leftTeam?.color,
                                                fontSize: "52px",
                                                transition: "all 2000ms ease-in-out",
                                                textShadow:
                                                    seriesState.extRoundLeftScore >= 4
                                                        ? `
                                                            0 0 3px ${seriesState.leftTeam?.color},
                                                            0 0 7px ${seriesState.leftTeam?.color}66,
                                                            0 1px 3px rgba(0,0,0,0.4)
                                                        `
                                                        : "none",
                                            }}
                                        >
                                            <Odometer
                                                value={seriesState.extRoundLeftScore}
                                                duration={900}
                                                format="d"
                                            />
                                        </span>
                                        <div className={css.lines}>
                                            {activePhase !== "playoffs" && setsToWin === 3 ? (
                                                <>
                                                    {[...Array(3)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={css.line}
                                                            style={{
                                                                boxShadow:
                                                                    playerWonSets >= i + 1
                                                                        ? `
                                                                            0 0 3px ${seriesState.leftTeam?.color},
                                                                            0 0 7px ${seriesState.leftTeam?.color}66,
                                                                            0 1px 3px rgba(0,0,0,0.4)
                                                                        `
                                                                        : "none",
                                                                width: "16px",
                                                            }}
                                                        >
                                                            <div
                                                                className={css.lineUnlit}
                                                                style={{
                                                                    background: seriesState.leftTeam?.unlitGradient,
                                                                }}
                                                            />

                                                            <div
                                                                className={css.lineLit}
                                                                style={{
                                                                    background: seriesState.leftTeam?.gradient,
                                                                    opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </>
                                            ) : activePhase !== "playoffs" && setsToWin === 2 ? (
                                                <>
                                                    {[...Array(2)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={css.line}
                                                            style={{
                                                                boxShadow:
                                                                    playerWonSets >= i + 1
                                                                        ? `
                                                                            0 0 3px ${seriesState.leftTeam?.color},
                                                                            0 0 7px ${seriesState.leftTeam?.color}66,
                                                                            0 1px 3px rgba(0,0,0,0.4)
                                                                        `
                                                                        : "none",
                                                            }}
                                                        >
                                                            <div
                                                                className={css.lineUnlit}
                                                                style={{
                                                                    background: seriesState.leftTeam?.unlitGradient,
                                                                }}
                                                            />

                                                            <div
                                                                className={css.lineLit}
                                                                style={{
                                                                    background: seriesState.leftTeam?.gradient,
                                                                    opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </>
                                            ) : activePhase !== "playoffs" && setsToWin === 1 ? (
                                                <div
                                                    className={css.line}
                                                    style={{
                                                        boxShadow:
                                                            playerWonSets >= 1
                                                                ? `
                                                                            0 0 3px ${seriesState.leftTeam?.color},
                                                                            0 0 7px ${seriesState.leftTeam?.color}66,
                                                                            0 1px 3px rgba(0,0,0,0.4)
                                                                        `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.lineUnlit}
                                                        style={{
                                                            background: seriesState.leftTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.lineLit}
                                                        style={{
                                                            background: seriesState.leftTeam?.gradient,
                                                            opacity: playerWonSets >= 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className={css.verticalLines} style={{ marginTop: "6px" }}>
                                        {activePhase === "playoffs" && setsToWin === 5 ? (
                                            <>
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.verticalLine}
                                                        style={{
                                                            height: "12px",
                                                            boxShadow:
                                                                playerWonSets >= i + 1
                                                                    ? `
                                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                    : "none",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.verticalLineUnlit}
                                                            style={{
                                                                background: seriesState.leftTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.verticalLineLit}
                                                            style={{
                                                                background: seriesState.leftTeam?.gradient,
                                                                opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : activePhase === "playoffs" && setsToWin === 4 ? (
                                            <>
                                                {[...Array(4)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.verticalLine}
                                                        style={{
                                                            height: "14px",
                                                            boxShadow:
                                                                playerWonSets >= i + 1
                                                                    ? `
                                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                    : "none",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.verticalLineUnlit}
                                                            style={{
                                                                background: seriesState.leftTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.verticalLineLit}
                                                            style={{
                                                                background: seriesState.leftTeam?.gradient,
                                                                opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : activePhase === "playoffs" && setsToWin === 3 ? (
                                            <>
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.verticalLine}
                                                        style={{
                                                            height: "16px",
                                                            boxShadow:
                                                                playerWonSets >= i + 1
                                                                    ? `
                                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                    : "none",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.verticalLineUnlit}
                                                            style={{
                                                                background: seriesState.leftTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.verticalLineLit}
                                                            style={{
                                                                background: seriesState.leftTeam?.gradient,
                                                                opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : activePhase === "playoffs" && setsToWin === 2 ? (
                                            <>
                                                {[...Array(2)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.verticalLine}
                                                        style={{
                                                            boxShadow:
                                                                playerWonSets >= i + 1
                                                                    ? `
                                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                    : "none",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.verticalLineUnlit}
                                                            style={{
                                                                background: seriesState.leftTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.verticalLineLit}
                                                            style={{
                                                                background: seriesState.leftTeam?.gradient,
                                                                opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : activePhase === "playoffs" && setsToWin === 1 ? (
                                            <div
                                                className={css.verticalLine}
                                                style={{
                                                    boxShadow:
                                                        playerWonSets >= 1
                                                            ? `
                                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.verticalLineUnlit}
                                                    style={{
                                                        background: seriesState.leftTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.verticalLineLit}
                                                    style={{
                                                        background: seriesState.leftTeam?.gradient,
                                                        opacity: playerWonSets >= 1 ? 1 : 0,
                                                    }}
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div>
                                    {banner
                                        ? (() => {
                                            const cleanBanner = banner.text;
                                            const chars = cleanBanner.split("");

                                            const middle = Math.ceil(chars.length / 2);

                                            const topHalf = chars.slice(0, middle);
                                            const bottomHalf = chars.slice(middle);

                                            return (
                                                <motion.span
                                                    className={css.round_text}
                                                    style={{
                                                        fontSize: "38px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: "0px",
                                                        width: '63.8px',
                                                        textShadow: banner.shadow
                                                    }}
                                                >
                                                    {topHalf.map((char, index) => (
                                                        <motion.span
                                                            key={`top-${char}-${index}`}
                                                            initial={{
                                                                opacity: 0,
                                                                y: -20,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.45
                                                            }}
                                                            style={{
                                                                display: "inline-block",
                                                                background: banner.gradient,
                                                                backgroundClip: "text",
                                                                WebkitBackgroundClip: "text",

                                                                color: "transparent",
                                                                WebkitTextFillColor: "transparent",
                                                            }}
                                                        >
                                                            {char}
                                                        </motion.span>
                                                    ))}

                                                    {bottomHalf.map((char, index) => (
                                                        <motion.span
                                                            key={`bottom-${char}-${index}`}
                                                            initial={{
                                                                opacity: 0,
                                                                y: 20,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.45
                                                            }}
                                                            style={{
                                                                display: "inline-block",
                                                                background: banner.gradient,
                                                                backgroundClip: "text",
                                                                WebkitBackgroundClip: "text",

                                                                color: "transparent",
                                                                WebkitTextFillColor: "transparent",
                                                            }}
                                                        >
                                                            {char}
                                                        </motion.span>
                                                    ))}

                                                    <motion.span
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{
                                                            duration: 0.45
                                                        }}
                                                        style={{
                                                            display: "inline-block",
                                                            marginLeft: "2px",
                                                            background: banner.gradient,
                                                            backgroundClip: "text",
                                                            WebkitBackgroundClip: "text",

                                                            color: "transparent",
                                                            WebkitTextFillColor: "transparent",
                                                        }}
                                                    >
                                                        !
                                                    </motion.span>
                                                </motion.span>
                                            );
                                        })()
                                        : seriesState.tiebreakerBigSymbol ? (
                                            <p
                                                className={css.vs}
                                                style={{ fontWeight: 700, fontSize: "32px", color: "#fff", marginBottom: activePhase === "playoffs" ? "-12px" : "0", }}
                                            >
                                                {seriesState.tiebreakerBigSymbol}
                                            </p>
                                        ) : null}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "14px",
                                        opacity: loserOpacity === "loss" ? 0.4 : 1,
                                        position: 'relative'
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            flexDirection: 'column',
                                            width: '50.1px'
                                        }}
                                    >
                                        <span
                                            className={css.round_text}
                                            style={{
                                                height: "76px",
                                                color: seriesState.rightTeam?.color,
                                                fontSize: "52px",
                                                transition: "all 2000ms ease-in-out",
                                                textShadow:
                                                    seriesState.extRoundRightScore >= 4
                                                        ? `
                                                            0 0 3px ${seriesState.rightTeam?.color},
                                                            0 0 7px ${seriesState.rightTeam?.color}66,
                                                            0 1px 3px rgba(0,0,0,0.4)
                                                        `
                                                        : "none",
                                            }}
                                        >
                                            <Odometer
                                                value={seriesState.extRoundRightScore}
                                                duration={900}
                                                format="d"
                                            />
                                        </span>
                                        <div className={css.lossLines}>
                                            {activePhase !== "playoffs" && setsToWin === 3 ? (
                                                <>
                                                    {[...Array(3)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={css.line}
                                                            style={{
                                                                boxShadow:
                                                                    playerLostSets >= i + 1
                                                                        ? `
                                                                            0 0 3px ${seriesState.rightTeam?.color},
                                                                            0 0 7px ${seriesState.rightTeam?.color}66,
                                                                            0 1px 3px rgba(0,0,0,0.4)
                                                                        `
                                                                        : "none",
                                                                width: "16px",
                                                            }}
                                                        >
                                                            <div
                                                                className={css.lossLineUnlit}
                                                                style={{
                                                                    background: seriesState.rightTeam?.unlitGradient,
                                                                }}
                                                            />

                                                            <div
                                                                className={css.lossLineLit}
                                                                style={{
                                                                    background: seriesState.rightTeam?.gradient,
                                                                    opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </>
                                            ) : activePhase !== "playoffs" && setsToWin === 2 ? (
                                                <>
                                                    {[...Array(2)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={css.line}
                                                            style={{
                                                                boxShadow:
                                                                    playerLostSets >= i + 1
                                                                        ? `
                                                                            0 0 3px ${seriesState.rightTeam?.color},
                                                                            0 0 7px ${seriesState.rightTeam?.color}66,
                                                                            0 1px 3px rgba(0,0,0,0.4)
                                                                        `
                                                                        : "none"
                                                            }}
                                                        >
                                                            <div
                                                                className={css.lossLineUnlit}
                                                                style={{
                                                                    background: seriesState.rightTeam?.unlitGradient,
                                                                }}
                                                            />

                                                            <div
                                                                className={css.lossLineLit}
                                                                style={{
                                                                    background: seriesState.rightTeam?.gradient,
                                                                    opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </>
                                            ) : activePhase !== "playoffs" && setsToWin === 1 ? (
                                                <div
                                                    className={css.line}
                                                    style={{
                                                        boxShadow:
                                                            playerLostSets >= 1
                                                                ? `
                                                                            0 0 3px ${seriesState.rightTeam?.color},
                                                                            0 0 7px ${seriesState.rightTeam?.color}66,
                                                                            0 1px 3px rgba(0,0,0,0.4)
                                                                        `
                                                                : "none"
                                                    }}
                                                >
                                                    <div
                                                        className={css.lossLineUnlit}
                                                        style={{
                                                            background: seriesState.rightTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.lossLineLit}
                                                        style={{
                                                            background: seriesState.rightTeam?.gradient,
                                                            opacity: playerLostSets >= 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className={css.verticalLossLines} style={{ marginTop: "6px" }}>
                                        {activePhase === "playoffs" && setsToWin === 5 ? (
                                            <>
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.verticalLine}
                                                        style={{
                                                            height: "12px",
                                                            boxShadow:
                                                                playerLostSets >= i + 1
                                                                    ? `
                                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                    : "none",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.verticalLossLineUnlit}
                                                            style={{
                                                                background: seriesState.rightTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.verticalLossLineLit}
                                                            style={{
                                                                background: seriesState.rightTeam?.gradient,
                                                                opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : activePhase === "playoffs" && setsToWin === 4 ? (
                                            <>
                                                {[...Array(4)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.verticalLine}
                                                        style={{
                                                            height: "14px",
                                                            boxShadow:
                                                                playerLostSets >= i + 1
                                                                    ? `
                                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                    : "none",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.verticalLossLineUnlit}
                                                            style={{
                                                                background: seriesState.rightTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.verticalLossLineLit}
                                                            style={{
                                                                background: seriesState.rightTeam?.gradient,
                                                                opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : activePhase === "playoffs" && setsToWin === 3 ? (
                                            <>
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.verticalLine}
                                                        style={{
                                                            height: "16px",
                                                            boxShadow:
                                                                playerLostSets >= i + 1
                                                                    ? `
                                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                    : "none",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.verticalLossLineUnlit}
                                                            style={{
                                                                background: seriesState.rightTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.verticalLossLineLit}
                                                            style={{
                                                                background: seriesState.rightTeam?.gradient,
                                                                opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : activePhase === "playoffs" && setsToWin === 2 ? (
                                            <>
                                                {[...Array(2)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.verticalLine}
                                                        style={{
                                                            boxShadow:
                                                                playerLostSets >= i + 1
                                                                    ? `
                                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                    : "none",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.verticalLossLineUnlit}
                                                            style={{
                                                                background: seriesState.rightTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.verticalLossLineLit}
                                                            style={{
                                                                background: seriesState.rightTeam?.gradient,
                                                                opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : activePhase === "playoffs" && setsToWin === 1 ? (
                                            <div
                                                className={css.verticalLine}
                                                style={{
                                                    height: "12px",
                                                    boxShadow:
                                                        playerLostSets >= 1
                                                            ? `
                                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.verticalLossLineUnlit}
                                                    style={{
                                                        background: seriesState.rightTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.verticalLossLineLit}
                                                    style={{
                                                        background: seriesState.rightTeam?.gradient,
                                                        opacity: playerLostSets >= 1 ? 1 : 0,
                                                    }}
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {seriesState.tiebreakerPhase === "extended" && seriesState.extRoundCommentaryShown && (
                                <motion.p
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                        color: "#fff",
                                        textAlign: "center",
                                        maxWidth: "640px",
                                        fontSize: "16px",
                                        lineHeight: 1.5,
                                        marginTop: 16
                                    }}
                                    className={css.info_text}
                                >
                                    The winner of this set could not be determined even after Quadruple Overtime.
                                    Therefore, the system will compare every Extended Round winner.
                                    There were six Extended Rounds in total: the 1st Half, the 2nd Half and four Overtimes, that's why 4+ Extended Rounds are required to win, 3 to tie again.
                                    We'll reveal them one by one:
                                </motion.p>
                            )}
                            {seriesState.extRoundCommentaryShown && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                    style={{
                                        marginTop: "20px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                        width: "100%",
                                        maxWidth: "640px",
                                    }}
                                >
                                    {revealedExtendedRounds.map((round) => {
                                        const isLeft = round.winner === "left";

                                        return (
                                            <motion.div
                                                key={round.label}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.35 }}
                                                style={{
                                                    color: "#fff",
                                                    fontSize: "20px",
                                                    textAlign: "left",
                                                }}
                                            >
                                                <strong>{round.label}</strong> Extended Round winner is{" "}
                                                {renderTeamLabel(
                                                    isLeft
                                                        ? seriesState.leftTeam
                                                        : seriesState.rightTeam
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                    {seriesState.tiebreakerPhase === "penalties" && !seriesState.penaltyResolved ? (
                        <motion.div
                            key={seriesState.penaltyTurn}
                            initial={{ opacity: 0, scale: 3 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.1 }}
                            style={{
                                textAlign: "center",
                                fontSize: "18px",
                                fontWeight: 700,
                                marginBottom: "8px",
                                display: "inline-block",

                                backgroundImage:
                                    seriesState.penaltyTurn === "left"
                                        ? seriesState.leftTeam?.gradient
                                        : seriesState.rightTeam?.gradient,

                                backgroundRepeat: "no-repeat",
                                backgroundSize: "100% 100%",

                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",

                                WebkitTextFillColor: "transparent",
                                color: "transparent",
                            }}
                        >
                            Team{" "}
                            {seriesState.penaltyTurn === "left"
                                ? seriesState.leftTeam?.name
                                : seriesState.rightTeam?.name}
                            's turn!
                        </motion.div>
                    ) : null}
                    <div className={css.scoreboard} style={{ backgroundColor: "#fff" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                            {isSeriesPointWins ? (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    style={{
                                        color: seriesState.leftTeam?.color,
                                        fontSize: "16px",
                                        transition: "all 500ms ease-in-out",
                                        textShadow: `
                                                            0 0 3px ${seriesState.leftTeam?.color},
                                                            0 0 7px ${seriesState.leftTeam?.color}66,
                                                            0 1px 3px rgba(0,0,0,0.4)
                                                        `
                                        ,
                                        marginBottom: "4px",
                                        marginLeft: activePhase === "playoffs" ? '0' : '8px',
                                        marginTop: "-28px"
                                    }}
                                >
                                    {getPointLabel()}
                                </motion.span>
                            ) : (
                                isSetPointWins && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        style={{
                                            color: seriesState.leftTeam?.color,
                                            fontSize: "16px",
                                            transition: "all 500ms ease-in-out",
                                            textShadow: `
                                                                0 0 3px ${seriesState.leftTeam?.color},
                                                                0 0 7px ${seriesState.leftTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                            ,
                                            marginBottom: "4px",
                                            marginLeft: activePhase === "playoffs" ? '0' : '8px',
                                            marginTop: "-28px"
                                        }}
                                    >
                                        Set point!
                                    </motion.span>
                                )
                            )}
                            {activePhase !== "playoffs" && !banner ? (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.6 }}
                                    style={{
                                        display: "inline-block",

                                        backgroundImage: seriesState.leftTeam?.gradient,
                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "100% 100%",

                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",

                                        WebkitTextFillColor: "transparent",
                                        color: "transparent",

                                        transition: "all 500ms ease-in-out",
                                    }}
                                    className={css.team_name_left}>
                                    Team {seriesState.leftTeam?.name}
                                </motion.span>
                            ) : null}

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row-reverse",
                                    alignItems: "center",
                                    gap: "14px",
                                    opacity: loserOpacity === "win" ? 0.4 : 1,
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", flexDirection: 'column', width: '50.1px' }}>
                                    <motion.span
                                        key={roundWins}
                                        initial={{ scale: 1.05, opacity: 0.3 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.7 }}
                                        className={css.round_text}
                                        style={{
                                            height: '76px',
                                            filter:
                                                roundWins === overtimeTarget
                                                    ? `
                                                        drop-shadow(0 0 1.5px ${seriesState.leftTeam.color})
                                                        drop-shadow(0 0 3.5px ${seriesState.leftTeam?.color}66)
                                                        drop-shadow(0 1px 3px rgba(0,0,0,0.4))
                                                    `
                                                    : "none",
                                        }}
                                    >
                                        <CountUp
                                            key={roundWins}
                                            start={Math.max(roundWins - 1, 0)}
                                            end={roundWins}
                                            duration={1}
                                            style={{
                                                background: seriesState.leftTeam?.gradient,
                                                WebkitBackgroundClip: "text",
                                                backgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                color: "transparent",
                                                fontSize: "52px",
                                                transition: "all 2000ms ease-in-out"
                                            }}
                                        />
                                    </motion.span>
                                    <div className={css.lines}>
                                        {activePhase !== "playoffs" && setsToWin === 3 ? (
                                            <>
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.line}
                                                        style={{
                                                            boxShadow:
                                                                playerWonSets >= i + 1
                                                                    ? `
                                                                            0 0 3px ${seriesState.leftTeam?.color},
                                                                            0 0 7px ${seriesState.leftTeam?.color}66,
                                                                            0 1px 3px rgba(0,0,0,0.4)
                                                                        `
                                                                    : "none",
                                                            width: "16px",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.lineUnlit}
                                                            style={{
                                                                background: seriesState.leftTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.lineLit}
                                                            style={{
                                                                background: seriesState.leftTeam?.gradient,
                                                                opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : activePhase !== "playoffs" && setsToWin === 2 ? (
                                            <>
                                                {[...Array(2)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.line}
                                                        style={{
                                                            boxShadow:
                                                                playerWonSets >= i + 1
                                                                    ? `
                                                                            0 0 3px ${seriesState.leftTeam?.color},
                                                                            0 0 7px ${seriesState.leftTeam?.color}66,
                                                                            0 1px 3px rgba(0,0,0,0.4)
                                                                        `
                                                                    : "none",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.lineUnlit}
                                                            style={{
                                                                background: seriesState.leftTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.lineLit}
                                                            style={{
                                                                background: seriesState.leftTeam?.gradient,
                                                                opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : activePhase !== "playoffs" && setsToWin === 1 ? (
                                            <div
                                                className={css.line}
                                                style={{
                                                    boxShadow:
                                                        playerWonSets >= 1
                                                            ? `
                                                                            0 0 3px ${seriesState.leftTeam?.color},
                                                                            0 0 7px ${seriesState.leftTeam?.color}66,
                                                                            0 1px 3px rgba(0,0,0,0.4)
                                                                        `
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.lineUnlit}
                                                    style={{
                                                        background: seriesState.leftTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.lineLit}
                                                    style={{
                                                        background: seriesState.leftTeam?.gradient,
                                                        opacity: playerWonSets >= 1 ? 1 : 0,
                                                    }}
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                {seriesState.tiebreakerPhase === "penalties" ? (
                                    <PenaltyCircles
                                        results={seriesState.penaltyLeftResults}
                                        team="left"
                                        attemptsToDisplay={attemptsToDisplay}
                                        resolved={seriesState.penaltyResolved}
                                        shouldHaveMargin={seriesState.tiebreakerPhase === "penalties" ? false : true}
                                    />
                                ) : !banner ? (
                                    <div className={css.miniSquares}>
                                        {[...Array(displayedMiniSquares)].map((_, i) => {
                                            const isLit = i < miniWins;

                                            return (
                                                <div
                                                    key={i}
                                                    className={css.square}
                                                    style={{
                                                        boxShadow: isLit
                                                            ? `
                                                                0 0 3px ${seriesState.leftTeam?.color},
                                                                0 0 7px ${seriesState.leftTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                                            : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.squareUnlit}
                                                        style={{
                                                            background: seriesState.leftTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.squareLit}
                                                        style={{
                                                            background: seriesState.leftTeam?.gradient,
                                                            opacity: isLit ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : null}
                                <div className={css.verticalLines}>
                                    {activePhase === "playoffs" && setsToWin === 5 ? (
                                        <>
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        height: "12px",
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                        boxShadow:
                                                            playerWonSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.leftTeam?.color},
                                                                    0 0 7px ${seriesState.leftTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLineUnlit}
                                                        style={{
                                                            background: seriesState.leftTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLineLit}
                                                        style={{
                                                            background: seriesState.leftTeam?.gradient,
                                                            opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                            width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : activePhase === "playoffs" && setsToWin === 4 ? (
                                        <>
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        height: "14px",
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                        boxShadow:
                                                            playerWonSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.leftTeam?.color},
                                                                    0 0 7px ${seriesState.leftTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLineUnlit}
                                                        style={{
                                                            background: seriesState.leftTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLineLit}
                                                        style={{
                                                            background: seriesState.leftTeam?.gradient,
                                                            opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                            width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : activePhase === "playoffs" && setsToWin === 3 ? (
                                        <>
                                            {[...Array(3)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        height: "16px",
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                        boxShadow:
                                                            playerWonSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.leftTeam?.color},
                                                                    0 0 7px ${seriesState.leftTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLineUnlit}
                                                        style={{
                                                            background: seriesState.leftTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLineLit}
                                                        style={{
                                                            background: seriesState.leftTeam?.gradient,
                                                            opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                            width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : activePhase === "playoffs" && setsToWin === 2 ? (
                                        <>
                                            {[...Array(2)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                        boxShadow:
                                                            playerWonSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.leftTeam?.color},
                                                                    0 0 7px ${seriesState.leftTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLineUnlit}
                                                        style={{
                                                            background: seriesState.leftTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLineLit}
                                                        style={{
                                                            background: seriesState.leftTeam?.gradient,
                                                            opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                            width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : activePhase === "playoffs" && setsToWin === 1 ? (
                                        <div
                                            className={css.verticalLine}
                                            style={{
                                                height: "12px",
                                                width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                boxShadow:
                                                    playerWonSets >= 1
                                                        ? `
                                                                    0 0 3px ${seriesState.leftTeam?.color},
                                                                    0 0 7px ${seriesState.leftTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                        : "none",
                                            }}
                                        >
                                            <div
                                                className={css.verticalLineUnlit}
                                                style={{
                                                    background: seriesState.leftTeam?.unlitGradient,
                                                }}
                                            />

                                            <div
                                                className={css.verticalLineLit}
                                                style={{
                                                    background: seriesState.leftTeam?.gradient,
                                                    opacity: playerWonSets >= 1 ? 1 : 0,
                                                    width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                                {!banner && activePhase === "playoffs" ? (
                                    <motion.span
                                        key={seriesState.leftTeam?.name}
                                        initial={{ x: 420 }}
                                        animate={{ x: 0 }}
                                        exit={{ x: 420 }}
                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                        style={{
                                            display: "inline-block",

                                            backgroundImage: seriesState.leftTeam?.gradient,
                                            backgroundRepeat: "no-repeat",
                                            backgroundSize: "100% 100%",

                                            WebkitBackgroundClip: "text",
                                            backgroundClip: "text",

                                            WebkitTextFillColor: "transparent",
                                            color: "transparent",

                                            transition: "all 500ms ease-in-out",

                                            margin: "0",
                                            position: "absolute",
                                            right: "110%",
                                            zIndex: -1,
                                            fontSize: "28px",
                                        }}
                                        className={css.team_name_left}>
                                        Team {seriesState.leftTeam?.name}
                                    </motion.span>
                                ) : null}
                            </div>
                        </div>
                        {banner ? (() => {
                            const cleanBanner = banner.text;
                            const chars = cleanBanner.split("");

                            const middle = Math.ceil(chars.length / 2);

                            const topHalf = chars.slice(0, middle);
                            const bottomHalf = chars.slice(middle);

                            return (
                                <motion.span
                                    className={css.round_text}
                                    style={{
                                        fontSize: "38px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0px",
                                        width: '63.8px',
                                        textShadow: banner.shadow
                                    }}
                                >
                                    {topHalf.map((char, index) => (
                                        <motion.span
                                            key={`top-${char}-${index}`}
                                            initial={{
                                                opacity: 0,
                                                y: -20,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                duration: 0.45
                                            }}
                                            style={{
                                                display: "inline-block",
                                                background: banner.gradient,
                                                backgroundClip: "text",
                                                WebkitBackgroundClip: "text",

                                                color: "transparent",
                                                WebkitTextFillColor: "transparent",
                                            }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}

                                    {bottomHalf.map((char, index) => (
                                        <motion.span
                                            key={`bottom-${char}-${index}`}
                                            initial={{
                                                opacity: 0,
                                                y: 20,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                duration: 0.45
                                            }}
                                            style={{
                                                display: "inline-block",
                                                background: banner.gradient,
                                                backgroundClip: "text",
                                                WebkitBackgroundClip: "text",

                                                color: "transparent",
                                                WebkitTextFillColor: "transparent",
                                            }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}

                                    <motion.span
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            duration: 0.45
                                        }}
                                        style={{
                                            display: "inline-block",
                                            marginLeft: "2px",
                                            background: banner.gradient,
                                            backgroundClip: "text",
                                            WebkitBackgroundClip: "text",

                                            color: "transparent",
                                            WebkitTextFillColor: "transparent",
                                        }}
                                    >
                                        !
                                    </motion.span>
                                </motion.span>
                            );
                        })() : (
                            <div
                                style={{
                                    marginTop: activePhase === "playoffs" ? "0" : "24px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <div
                                    style={{
                                        width: "63.8px",
                                        height: "42px",
                                        marginBottom:
                                            activePhase === "playoffs" &&
                                                seriesState.tiebreakerPhase !== "penalties"
                                                ? "-12px"
                                                : "0",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        overflow: "hidden",
                                    }}
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={momentum}
                                            initial={{
                                                opacity: 0,
                                                scale: momentum === "tied" ? 0.5 : 0.65,
                                                rotate: momentum === "tied" ? 0 : -15,
                                                x:
                                                    momentum === "left"
                                                        ? 15
                                                        : momentum === "right"
                                                            ? -30
                                                            : -2,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                rotate: 0,
                                                x:
                                                    momentum === "left"
                                                        ? -28
                                                        : momentum === "right"
                                                            ? 8
                                                            : -6,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                scale: momentum === "tied" ? 0.5 : 0.65,
                                                rotate: momentum === "tied" ? 0 : 15,
                                                x:
                                                    momentum === "left"
                                                        ? -15
                                                        : momentum === "right"
                                                            ? 4
                                                            : -6,
                                            }}
                                            transition={{
                                                duration: 0.35,
                                                ease: "easeInOut",
                                            }}
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                userSelect: "none",
                                                color:
                                                    momentum === "left"
                                                        ? seriesState.leftTeam?.color
                                                        : momentum === "right"
                                                            ? seriesState.rightTeam?.color
                                                            : "#757575",
                                                filter:
                                                    momentum === "left"
                                                        ? `drop-shadow(0 0 3.5px ${seriesState.leftTeam?.color})`
                                                        : momentum === "right"
                                                            ? `drop-shadow(0 0 3.5px ${seriesState.rightTeam?.color})`
                                                            : "drop-shadow(0 0 4px #757575)",
                                            }}
                                        >
                                            {momentum === "left" ? (
                                                <GradientCaretLeft
                                                    size={30}
                                                    gradient={{
                                                        top: lightenHex(seriesState.leftTeam.color, 0.18),
                                                        middle: seriesState.leftTeam.color,
                                                        bottom: darkenHex(
                                                            seriesState.leftTeam.color,
                                                            getBrightness(seriesState.leftTeam.color) > 210
                                                                ? 0.22
                                                                : 0.35
                                                        ),
                                                    }}
                                                    glowColor={seriesState.leftTeam.color}
                                                />
                                            ) : momentum === "right" ? (
                                                <GradientCaretRight
                                                    size={30}
                                                    gradient={{
                                                        top: lightenHex(seriesState.rightTeam.color, 0.18),
                                                        middle: seriesState.rightTeam.color,
                                                        bottom: darkenHex(
                                                            seriesState.rightTeam.color,
                                                            getBrightness(seriesState.rightTeam.color) > 210
                                                                ? 0.22
                                                                : 0.35
                                                        ),
                                                    }}
                                                    glowColor={seriesState.rightTeam.color}
                                                />
                                            ) : (
                                                <GradientDiamond
                                                    size={20}
                                                    gradient={{
                                                        top: "#9c9c9c",
                                                        middle: "#757575",
                                                        bottom: "#555555",
                                                    }}
                                                    glowColor="#757575"
                                                />
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                                {seriesState.tiebreakerPhase !== "penalties" && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className={css.round_text}
                                        style={{
                                            fontSize: "14px",
                                            width: "63.8px",
                                            textAlign: "center",
                                            marginTop: activePhase === "playoffs" ? "8px" : "0px",
                                        }}
                                    >
                                        Round{" "}
                                        <CountUp
                                            key={roundWins + roundLosses + 1}
                                            start={Math.max(roundWins + roundLosses, 0)}
                                            end={roundWins + roundLosses + 1}
                                            duration={1}
                                        />
                                    </motion.span>
                                )}
                            </div>
                        )}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                            }}
                        >
                            {isSeriesPointLosses ? (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    style={{
                                        color: seriesState.rightTeam?.color,
                                        fontSize: "16px",
                                        transition: "all 500ms ease-in-out",
                                        textShadow: `
                                                            0 0 3px ${seriesState.rightTeam?.color},
                                                            0 0 7px ${seriesState.rightTeam?.color}66,
                                                            0 1px 3px rgba(0,0,0,0.4)
                                                        `,
                                        marginBottom: "4px",
                                        marginRight: activePhase === "playoffs" ? '0' : '8px',
                                        marginTop: "-28px"
                                    }}
                                >
                                    {getPointLabel()}
                                </motion.span>
                            ) : (
                                isSetPointLosses && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        style={{
                                            color: seriesState.rightTeam?.color,
                                            fontSize: "16px",
                                            transition: "all 500ms ease-in-out",
                                            textShadow: `
                                                            0 0 3px ${seriesState.rightTeam?.color},
                                                            0 0 7px ${seriesState.rightTeam?.color}66,
                                                            0 1px 3px rgba(0,0,0,0.4)
                                                        `,
                                            marginBottom: "4px",
                                            marginRight: activePhase === "playoffs" ? '0' : '8px',
                                            marginTop: "-28px"
                                        }}
                                    >
                                        Set point!
                                    </motion.span>
                                )
                            )}
                            {activePhase !== "playoffs" && !banner ? (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    style={{
                                        display: "inline-block",

                                        backgroundImage: seriesState.rightTeam?.gradient,
                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "100% 100%",

                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",

                                        WebkitTextFillColor: "transparent",
                                        color: "transparent",

                                        transition: "all 500ms ease-in-out",
                                    }}
                                    className={css.team_name_right}>
                                    Team {seriesState.rightTeam?.name}
                                </motion.span>
                            ) : null}

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "14px",
                                    opacity: loserOpacity === "loss" ? 0.4 : 1,
                                    position: 'relative'
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        flexDirection: 'column',
                                        width: '50.1px'
                                    }}
                                >
                                    <motion.span
                                        key={roundLosses}
                                        initial={{ scale: 1.05, opacity: 0.3 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.7 }}
                                        className={css.round_text}
                                        style={{
                                            height: '76px',
                                            filter:
                                                roundLosses === overtimeTarget
                                                    ? `
                                                        drop-shadow(0 0 1.5px ${seriesState.rightTeam.color})
                                                        drop-shadow(0 0 3.5px ${seriesState.rightTeam?.color}66)
                                                        drop-shadow(0 1px 3px rgba(0,0,0,0.4))
                                                    `
                                                    : "none",
                                        }}
                                    >
                                        <CountUp
                                            key={roundLosses}
                                            start={Math.max(roundLosses - 1, 0)}
                                            end={roundLosses}
                                            duration={1}
                                            style={{
                                                background: seriesState.rightTeam?.gradient,
                                                WebkitBackgroundClip: "text",
                                                backgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                color: "transparent",
                                                fontSize: "52px",
                                                transition: "all 2000ms ease-in-out"
                                            }}
                                        />
                                    </motion.span>
                                    <div className={css.lossLines}>
                                        {activePhase !== "playoffs" && setsToWin === 3 ? (
                                            <>
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.line}
                                                        style={{
                                                            boxShadow:
                                                                playerLostSets >= i + 1
                                                                    ? `
                                                                            0 0 3px ${seriesState.rightTeam?.color},
                                                                            0 0 7px ${seriesState.rightTeam?.color}66,
                                                                            0 1px 3px rgba(0,0,0,0.4)
                                                                        `
                                                                    : "none",
                                                            width: "16px",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.lossLineUnlit}
                                                            style={{
                                                                background: seriesState.rightTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.lossLineLit}
                                                            style={{
                                                                background: seriesState.rightTeam?.gradient,
                                                                opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : activePhase !== "playoffs" && setsToWin === 2 ? (
                                            <>
                                                {[...Array(2)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.line}
                                                        style={{
                                                            boxShadow:
                                                                playerLostSets >= i + 1
                                                                    ? `
                                                                            0 0 3px ${seriesState.rightTeam?.color},
                                                                            0 0 7px ${seriesState.rightTeam?.color}66,
                                                                            0 1px 3px rgba(0,0,0,0.4)
                                                                        `
                                                                    : "none"
                                                        }}
                                                    >
                                                        <div
                                                            className={css.lossLineUnlit}
                                                            style={{
                                                                background: seriesState.rightTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.lossLineLit}
                                                            style={{
                                                                background: seriesState.rightTeam?.gradient,
                                                                opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : activePhase !== "playoffs" && setsToWin === 1 ? (
                                            <div
                                                className={css.line}
                                                style={{
                                                    boxShadow:
                                                        playerLostSets >= 1
                                                            ? `
                                                                            0 0 3px ${seriesState.rightTeam?.color},
                                                                            0 0 7px ${seriesState.rightTeam?.color}66,
                                                                            0 1px 3px rgba(0,0,0,0.4)
                                                                        `
                                                            : "none"
                                                }}
                                            >
                                                <div
                                                    className={css.lossLineUnlit}
                                                    style={{
                                                        background: seriesState.rightTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.lossLineLit}
                                                    style={{
                                                        background: seriesState.rightTeam?.gradient,
                                                        opacity: playerLostSets >= 1 ? 1 : 0,
                                                    }}
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                {seriesState.tiebreakerPhase === "penalties" ? (
                                    <PenaltyCircles
                                        results={seriesState.penaltyRightResults}
                                        team="right"
                                        attemptsToDisplay={attemptsToDisplay}
                                        resolved={seriesState.penaltyResolved}
                                        shouldHaveMargin={seriesState.tiebreakerPhase === "penalties" ? false : true}
                                    />
                                ) : !banner ? (
                                    <div className={css.miniSquares} style={{ flexDirection: 'row-reverse' }}>
                                        {[...Array(displayedMiniSquares)].map((_, i) => {
                                            const isLit = i < miniLosses;

                                            return (
                                                <div
                                                    key={i}
                                                    className={css.lossSquare}
                                                    style={{
                                                        boxShadow: isLit
                                                            ? `
                                                                    0 0 3px ${seriesState.rightTeam?.color},
                                                                    0 0 7px ${seriesState.rightTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                            : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.lossSquareUnlit}
                                                        style={{
                                                            background: seriesState.rightTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.lossSquareLit}
                                                        style={{
                                                            background: seriesState.rightTeam?.gradient,
                                                            opacity: isLit ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : null}
                                <div className={css.verticalLossLines}>
                                    {activePhase === "playoffs" && setsToWin === 5 ? (
                                        <>
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        height: "12px",
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                        boxShadow:
                                                            playerLostSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.rightTeam?.color},
                                                                    0 0 7px ${seriesState.rightTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLossLineUnlit}
                                                        style={{
                                                            background: seriesState.rightTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLossLineLit}
                                                        style={{
                                                            background: seriesState.rightTeam?.gradient,
                                                            opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                            width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : activePhase === "playoffs" && setsToWin === 4 ? (
                                        <>
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        height: "14px",
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                        boxShadow:
                                                            playerLostSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.rightTeam?.color},
                                                                    0 0 7px ${seriesState.rightTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLossLineUnlit}
                                                        style={{
                                                            background: seriesState.rightTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLossLineLit}
                                                        style={{
                                                            background: seriesState.rightTeam?.gradient,
                                                            opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                            width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : activePhase === "playoffs" && setsToWin === 3 ? (
                                        <>
                                            {[...Array(3)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        height: "16px",
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                        boxShadow:
                                                            playerLostSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.rightTeam?.color},
                                                                    0 0 7px ${seriesState.rightTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLossLineUnlit}
                                                        style={{
                                                            background: seriesState.rightTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLossLineLit}
                                                        style={{
                                                            background: seriesState.rightTeam?.gradient,
                                                            opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                            width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : activePhase === "playoffs" && setsToWin === 2 ? (
                                        <>
                                            {[...Array(2)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                        boxShadow:
                                                            playerLostSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.rightTeam?.color},
                                                                    0 0 7px ${seriesState.rightTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLossLineUnlit}
                                                        style={{
                                                            background: seriesState.rightTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLossLineLit}
                                                        style={{
                                                            background: seriesState.rightTeam?.gradient,
                                                            opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                            width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : activePhase === "playoffs" && setsToWin === 1 ? (
                                        <div
                                            className={css.verticalLine}
                                            style={{
                                                width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                boxShadow:
                                                    playerLostSets >= 1
                                                        ? `
                                                                    0 0 3px ${seriesState.rightTeam?.color},
                                                                    0 0 7px ${seriesState.rightTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                        : "none",
                                            }}
                                        >
                                            <div
                                                className={css.verticalLossLineUnlit}
                                                style={{
                                                    background: seriesState.rightTeam?.unlitGradient,
                                                }}
                                            />

                                            <div
                                                className={css.verticalLossLineLit}
                                                style={{
                                                    background: seriesState.rightTeam?.gradient,
                                                    opacity: playerLostSets >= 1 ? 1 : 0,
                                                    width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                                {!banner && activePhase === "playoffs" ? (
                                    <motion.span
                                        key={seriesState.rightTeam?.name}
                                        initial={{ x: -420 }}
                                        animate={{ x: 0 }}
                                        exit={{ x: -420 }}
                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                        style={{
                                            display: "inline-block",

                                            backgroundImage: seriesState.rightTeam?.gradient,
                                            backgroundRepeat: "no-repeat",
                                            backgroundSize: "100% 100%",

                                            WebkitBackgroundClip: "text",
                                            backgroundClip: "text",

                                            WebkitTextFillColor: "transparent",
                                            color: "transparent",

                                            transition: "all 500ms ease-in-out",

                                            margin: "0",
                                            position: "absolute",
                                            left: "110%",
                                            zIndex: -1,
                                            fontSize: "28px",
                                        }}
                                        className={css.team_name_right}>
                                        Team {seriesState.rightTeam?.name}
                                    </motion.span>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {!banner && isOvertime && seriesState.tiebreakerPhase !== "penalties" ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.game_info_text}
                        >
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className={css.round_text}
                                style={{
                                    textAlign: "center",
                                    fontSize: "14px",
                                    marginBottom: "12px",
                                    userSelect: "none"
                                }}
                            >
                                First to {overtimeToWin}
                            </motion.span>

                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className={css.round_text}
                                style={{
                                    textAlign: "center",
                                    fontSize: "20px",
                                    marginTop: "-20px",
                                    userSelect: "none"
                                }}
                            >
                                {getOvertimeLabel(overtimeBlock === 0 ? 1 : overtimeBlock)}
                                <br />
                            </motion.span>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.game_info_text}
                        >
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className={css.round_text}
                                style={{
                                    textAlign: "center",
                                    fontSize: "14px",
                                    marginBottom: "12px",
                                    userSelect: "none"
                                }}
                            >
                                {seriesState.tiebreakerPhase === "penalties" && !banner
                                    ? `Penalty Series`
                                    : "\u00A0"}
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className={css.round_text}
                                style={{
                                    textAlign: "center",
                                    fontSize: "20px",
                                    marginTop: "-20px",
                                    userSelect: "none"
                                }}
                            >
                                {inSuddenDeath && !banner && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className={css.round_text}
                                        style={{
                                            textAlign: "center",
                                            marginBottom: "12px",
                                            color: "rgb(152, 51, 51)",
                                            userSelect: "none"
                                        }}
                                    >
                                        Sudden Death!!! <span style={{ color: "#2e2f42" }}>|</span>{" "}
                                    </motion.span>
                                )}
                                {seriesState.tiebreakerPhase === "penalties" && !banner
                                    ? `Attempt ${currentAttempt}`
                                    : "\u00A0"}
                            </motion.span>
                        </motion.div>
                    )}

                    <div className={css.seriesGambleMessage}>
                        {!banner && seriesState.lastResult && (
                            <>
                                <p className={css.seriesResultMessage}>
                                    {seriesState.lastResult}
                                </p>

                                <span
                                    className={css.seriesMultiplier}
                                    style={{
                                        display: "inline-block",

                                        backgroundImage:
                                            seriesState.tiebreakerPhase === "penalties"
                                                ? getPensMultiplierClass(seriesState.lastMultiplier)
                                                : getMultiplierClass(seriesState.lastMultiplier),

                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "100% 100%",

                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",

                                        WebkitTextFillColor: "transparent",
                                        color: "transparent",
                                    }}
                                >
                                    {seriesState.lastMultiplier.toFixed(2)}x
                                </span>
                            </>
                        )}
                    </div>

                    {!banner && (
                        <div className={css.series_gamble_wrapper}>
                            <button
                                className={`${css.gamble_button} ${isButtonLocked || banner ? css.locked : ""}`}
                                disabled={isButtonLocked || !!banner}
                                onClick={
                                    seriesState.tiebreakerPhase === "penalties"
                                        ? handlePenaltyShot
                                        : handleSeriesGamble
                                }
                            >
                                Gamble
                            </button>
                        </div>
                    )}
                </div>
                {isRestartModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            Are you sure you want to restart the game? <br /> <strong>You will not be able to revert this action!</strong>
                        </p>
                        <div className={css.restart_buttons}>
                            <button
                                className={css.cancel_button}
                                onClick={() => setIsRestartModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={css.confirm_button}
                                onClick={confirmRestart}
                            >
                                Restart
                            </button>
                        </div>
                    </div>
                )}

                {isTerminateModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            Are you sure you want to terminate the game?
                        </p>
                        <div className={css.restart_buttons}>
                            <button
                                className={css.cancel_button}
                                onClick={() => setIsTerminateModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={css.confirm_button}
                                onClick={confirmTerminate}
                            >
                                Terminate
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }

    const placementColors = {
        1: "gold",
        2: "silver",
        3: "#cd7f32",

        4: "#4fc3f7",
        5: "#40e0d0",
        6: "#ba68c8",
        7: "#ff9574",
        8: "#81c784",
        9: "#f9e4a1",
        10: "#b0bec5",
    };

    const placementColorLeft = placementColors[rankById[modalLeftTeam?.id]] || "#ffffff";
    const placementColorRight = placementColors[rankById[modalRightTeam?.id]] || "#ffffff";

    const rankLeftSticker = () => {
        return (
            <span style={{ color: placementColorLeft }}>
                {formatOrdinal(rankById[modalLeftTeam?.id] || 64)}
            </span>
        );
    };

    const rankRightSticker = () => {
        return (
            <span style={{ color: placementColorRight }}>
                {formatOrdinal(rankById[modalRightTeam?.id] || 64)}
            </span>
        );
    };

    if (isLeaderboardOpen) {
        return (
            <>
                <Header
                    setIsRestartModalOpen={() => setIsRestartModalOpen(true)}
                    setIsTerminateModalOpen={() => setIsTerminateModalOpen(true)}
                    setIsScoreBoardOpen={() => {
                        setIsLeaderboardOpen(false);
                        setIsTournamentNumberButtonArmed(false);
                    }}
                    setIsScoreBoard={() => setIsLeaderboardOpen(true)}
                    isIntroClosed={showIntro || showPickemLine2}
                    isLeaderboardOpen={isLeaderboardOpen}
                    isButtonLocked={isButtonLocked}
                    isScoreBoardButtonLocked={isScoreBoardButtonLocked}
                    isScoreBoardResetButtonLocked={isScoreBoardResetButtonLocked}
                    setIsScoreBoardResetModalOpen={() => setIsScoreBoardResetModalOpen(true)}
                    setIsAddTournamentPlacingsModalOpen={handleAddPlacingsClick}
                    setIsRemoveTournamentPlacingsModalOpen={handleRemovePlacingsClick}
                    arePlacingButtonsArmed={arePlacingButtonsArmed}
                    hasAnyPlacings={hasAnyPlacings}
                    onInfoPage={() => navigate("/special-mode-info")}
                />
                <div className={css.page_container} style={{ position: "relative" }}>
                    <button
                        type="button"
                        className={css.gamble_button}
                        onClick={() => {
                            if (!isTournamentNumberButtonArmed) {
                                setIsTournamentNumberButtonArmed(true);
                                return;
                            }

                            handleTournamentNumberClick();
                        }}
                        disabled={isTournamentNumberButtonLocked}
                        style={{
                            position: "fixed",
                            top: "7%",
                            left: "2%",
                            opacity: isTournamentNumberButtonArmed ? 1 : 0,
                            pointerEvents: "auto",
                            cursor: isTournamentNumberButtonArmed ? "pointer" : "default",
                        }}
                    >
                        Change tournament number
                    </button>
                    <div className={css.leaderboard_header}>

                        <div
                            style={{
                                fontSize: "40px",
                                textShadow: "0 0 4px #000",
                                textTransform: "none",
                            }}
                            className={css.game_title}
                        >
                            Leaderboard

                            {tournamentNumber >= 1 && (
                                <span style={{ textShadow: "none" }}>
                                    {" "}after{" "}
                                    {tournamentLabel}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={css.leaderboard_list}>
                        {leaderboard.sorted.map((t, i) => {
                            const rank = i + 1;
                            const rating = teamRatings[t.id] ?? 0;

                            const placementColor = placementColors[rank] || "#2e2f42";

                            const rankSticker = () => {
                                return (
                                    <span style={{ color: placementColor }} className={css.leaderboard_rank}>
                                        {formatOrdinal(rank)}
                                    </span>
                                );
                            };
                            const isTop10 = rank <= 10;

                            const circleClass =
                                rank === 1
                                    ? css.winnerLogo
                                    : rank <= 3
                                        ? css.placeLogo
                                        : rank <= 10
                                            ? css.placeLogo
                                            : css.placeLogoSmall;

                            const circleSizeStyle =
                                rank === 2 ? { width: "80px", height: "80px" }
                                    : rank === 3 ? { width: "60px", height: "60px" }
                                        : {};

                            const nameClass =
                                rank === 1
                                    ? css.winnerName
                                    : rank <= 3
                                        ? css.runnerUp_name
                                        : css.podium_name;

                            const rowStyle = isTop10 ? { display: "flex", flexDirection: "column", alignItems: "center" } : undefined;

                            const ratingFontSize =
                                rank >= 4 && rank <= 10 ? "10px"
                                    : rank > 10 ? "8px"
                                        : "";

                            const p = teamPlacings?.[t.id] ?? { wins: 0, seconds: 0, thirds: 0 };
                            const trophyDisplay = trophyCountToDisplay(p.wins);

                            const isCountMode = trophyDisplay?.mode === "count";
                            const trophyTop = isCountMode ? "21%" : rank > 10 ? "30%" : "20%";

                            return (
                                <React.Fragment key={t.id}>
                                    {rank === 17 && (
                                        <div style={{ marginTop: "24px", marginBottom: "24px" }}>
                                            <h4
                                                className={css.game_title}
                                                style={{ fontSize: "30px", color: "#999", marginBottom: "16px" }}
                                            >
                                                Autoqualifiers to Stage III
                                            </h4>

                                            <hr style={{ width: "600px", margin: 0 }} className={css.dashed_divider} />

                                            <h4
                                                className={css.game_title}
                                                style={{ fontSize: "30px", color: "#999", marginTop: "16px" }}
                                            >
                                                Autoqualifiers to Stage II
                                            </h4>
                                        </div>
                                    )}

                                    {rank === 33 && (
                                        <div style={{ marginTop: "24px", marginBottom: "24px" }}>
                                            <h4
                                                className={css.game_title}
                                                style={{ fontSize: "30px", color: "#999", marginBottom: "16px" }}
                                            >
                                                Autoqualifiers to Stage II
                                            </h4>

                                            <hr style={{ width: "600px", margin: 0 }} className={css.dashed_divider} />

                                            <h4
                                                className={css.game_title}
                                                style={{ fontSize: "30px", color: "#999", marginTop: "16px" }}
                                            >
                                                Qualifiers to Stage I
                                            </h4>
                                        </div>
                                    )}

                                    <div key={t.id} className={css.leaderboard_row} style={{ ...rowStyle, position: rank > 10 ? 'relative' : 'static', gap: rank === 3 ? "0px" : "" }}>
                                        <div
                                            className={circleClass}
                                            style={{
                                                ...circleSizeStyle,
                                                background: t.color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: isTop10 ? "0" : "8px",
                                                border: "3px solid #999",
                                                marginLeft: rank > 10 ? "210px" : "0",
                                            }}
                                            title={`Team ${t.name}`}
                                        >
                                            <span
                                                style={{
                                                    color: "#ffffff",
                                                    textShadow: "0 0 4px #000",
                                                    fontSize: ratingFontSize,
                                                }}
                                                className={css.modal_team_rating}
                                            >
                                                {rating}p
                                            </span>
                                        </div>

                                        <div style={{ position: rank <= 10 ? 'relative' : 'static' }}>
                                            {trophyDisplay && (
                                                <span
                                                    style={{
                                                        marginLeft: 10,
                                                        position: "absolute",
                                                        top: trophyTop,
                                                        right: rank > 10 ? '64.5%' : '103%',
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        color: "#2e2f42",
                                                        fontWeight: 700,
                                                        fontSize: rank <= 3 ? "32px" : "16px",
                                                    }}
                                                >
                                                    {trophyDisplay.mode === "icons" ? (
                                                        Array.from({ length: trophyDisplay.n }).map((_, k) => (
                                                            <FaTrophy key={k} style={{ verticalAlign: "middle" }} />
                                                        ))
                                                    ) : (
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                            {trophyDisplay.n} <FaTrophy />
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                            <span style={{ fontSize: rank <= 3 ? "32px" : "16px", marginRight: rank <= 3 ? "4px" : "0px" }} className={css.leaderboard_rank}>
                                                {rankSticker()}
                                            </span>{" "}
                                            <span style={{ color: "#2e2f42", fontWeight: 700 }} className={nameClass}>
                                                Team {t.name}
                                                <span style={{
                                                    position: "absolute",
                                                    top: rank > 10 ? '24%' : '20%',
                                                    left: rank > 10 ? '70%' : '120%',
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                }}>
                                                    {p.seconds > 0 && (
                                                        <span style={{ marginLeft: '12px' }}>
                                                            🥈:{p.seconds}
                                                        </span>
                                                    )}

                                                    {p.thirds > 0 && (
                                                        <span>
                                                            🥉:{p.thirds}
                                                        </span>
                                                    )}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
                {isRestartModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            Are you sure you want to restart the game? <br /> <strong>You will not be able to revert this action!</strong>
                        </p>
                        <div className={css.restart_buttons}>
                            <button
                                className={css.cancel_button}
                                onClick={() => setIsRestartModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={css.confirm_button}
                                onClick={confirmRestart}
                            >
                                Restart
                            </button>
                        </div>
                    </div>
                )}

                {isTerminateModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            Are you sure you want to terminate the game?
                        </p>
                        <div className={css.restart_buttons}>
                            <button
                                className={css.cancel_button}
                                onClick={() => setIsTerminateModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={css.confirm_button}
                                onClick={confirmTerminate}
                            >
                                Terminate
                            </button>
                        </div>
                    </div>
                )}

                {isTournamentNumberCodeModalOpen && (
                    <div className={css.restart_modal}>
                        <div style={{ width: "100%" }}>
                            <label className={css.reset_label} htmlFor="tournament-number-code">
                                Identification code
                            </label>
                            <input
                                id="tournament-number-code"
                                className={css.reset_input}
                                type="password"
                                value={tournamentNumberCode}
                                onChange={(e) => setTournamentNumberCode(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={handleCloseTournamentNumberModals}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleVerifyTournamentNumberPassword}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isTournamentNumberModalOpen && (
                    <div className={css.restart_modal} style={{ width: "520px", top: "10%" }}>
                        <p className={css.restart_text} style={{ marginBottom: 12 }}>
                            Tournament number management
                        </p>

                        <p className={css.restart_text} style={{ marginBottom: 12 }}>
                            Right now, it's Official <b>#{tournamentNumber}</b>
                        </p>

                        <div style={{ display: "flex", gap: 12, width: "80%", marginBottom: 4 }}>
                            <select
                                className={css.reset_input}
                                style={{ marginBottom: 0 }}
                                value={tournamentNumberMode}
                                onChange={(e) => setTournamentNumberMode(e.target.value)}
                            >
                                <option value="add">Add</option>
                                <option value="subtract">Substract</option>
                                <option value="set">Set</option>
                            </select>

                            <input
                                className={css.reset_input}
                                style={{ marginBottom: 0 }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                type="text"
                                placeholder="Number"
                                value={tournamentNumberAmount}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const digitsOnly = raw.replace(/[^0-9]/g, "");
                                    setTournamentNumberAmount(digitsOnly);
                                }}
                                autoComplete="off"
                            />
                        </div>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={handleCloseTournamentNumberModals}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleSubmitTournamentNumber}>
                                Submit
                            </button>
                        </div>
                    </div>
                )}

                {isTournamentNumberFinalModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            Are sure you want to change the tournament number?
                        </p>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={handleCloseTournamentNumberModals}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleConfirmTournamentNumber}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isScoreBoardResetModalOpen && (
                    <div className={css.restart_modal}>
                        <div style={{ width: "100%" }}>
                            <label className={css.reset_label} htmlFor="scoreboard-reset-code">
                                Identification code
                            </label>

                            <input
                                id="scoreboard-reset-code"
                                className={css.reset_input}
                                type="password"
                                value={scoreboardResetCode}
                                onChange={(e) => setScoreboardResetCode(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={handleCloseScoreboardResetModal}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleVerifyScoreboardResetPassword}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isScoreBoardResetConfirmModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            <b>Are you sure?!</b> <br />
                            By pressing the button "Confirm", you'll reset the WHOLE scoreboard!
                        </p>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={handleCancelFinalScoreboardReset}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleFinalScoreboardReset}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isAddPlacingsCodeModalOpen && (
                    <div className={css.restart_modal}>
                        <div style={{ width: "100%" }}>
                            <label className={css.reset_label} htmlFor="placings-admin-code-add">
                                Identification code
                            </label>
                            <input
                                id="placings-admin-code-add"
                                className={css.reset_input}
                                type="password"
                                value={placingsAdminCode}
                                onChange={(e) => setPlacingsAdminCode(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={() => { setIsAddPlacingsCodeModalOpen(false); clearPlacingsAdminState(); }}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleVerifyAddPlacingsPassword}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isAddPlacingsModalOpen && (
                    <div className={css.restart_modal} style={{ width: "520px", top: '20%' }}>
                        <p className={css.restart_text} style={{ marginBottom: 12 }}>
                            Add tournament placings
                        </p>

                        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                            <button
                                type="button"
                                className={css.gamble_button}
                                onClick={toggleSelectAllTeams}
                                disabled={allTeams.length === 0 || canSelectAllPlacings}
                            >
                                {allSelected ? "Unselect all" : "Select all"}
                            </button>

                            {hasAnySelected && (
                                <button
                                    type="button"
                                    className={css.cancel_button}
                                    onClick={() => setSelectedPlacingTeamIds([])}
                                    disabled={canSelectAllPlacings}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div
                            className={css.hidden_scrollbar}
                            style={{
                                overflowY: "auto",
                                overflowX: "hidden",
                                height: "180px",
                                width: "100%",
                                border: "1px solid #999",
                                borderRadius: 8,
                                padding: 12,
                            }}
                        >
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                                {[...allTeams]
                                    .sort((a, b) => getSortValue(b) - getSortValue(a))
                                    .map((t) => {
                                        const isSelected = selectedPlacingTeamIds.includes(t.id);
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => toggleTeamSelection(t.id)}
                                                style={{
                                                    width: 37.2,
                                                    height: 37.2,
                                                    boxShadow: isSelected ? `0 0 12px ${t.unlitColor}` : "none",
                                                    border: isSelected ? `2px solid ${t.unlitColor}` : "2px solid #999",
                                                    background: t.color,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    position: "relative",
                                                    overflow: "hidden",
                                                }}
                                                className={css.team_circle_ro32}
                                                title={`Team ${t.name} • ${teamRatings?.[t.id] ?? 0}p`}
                                            >
                                                <span
                                                    style={{
                                                        color: "#ffffff",
                                                        fontSize: "12px",
                                                        textShadow: "0 0 4px #000"
                                                    }}
                                                    className={css.modal_team_rating}
                                                >
                                                    {getDisplayedValue(t)}{placingCategory === "points" ? "p" : ""}
                                                </span>
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, width: "50%", marginTop: 14 }}>
                            <select
                                className={css.reset_input}
                                style={{ marginBottom: 0 }}
                                value={placingCategory}
                                onChange={(e) => {
                                    setPlacingCategory(e.target.value);
                                }}
                            >
                                <option value=""></option>
                                <option value="wins">🏆</option>
                                <option value="seconds">🥈</option>
                                <option value="thirds">🥉</option>
                                <option value="points">points</option>
                            </select>

                            <input
                                className={css.reset_input}
                                style={{ marginBottom: 0 }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                type="text"
                                placeholder="Amount"
                                value={placingAmount}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const onlyDigits = raw.replace(/[^\d]/g, "");
                                    setPlacingAmount(onlyDigits);
                                }}
                            />
                        </div>

                        <div className={css.restart_buttons} style={{ marginTop: 14 }}>
                            <button className={css.cancel_button} onClick={() => { setIsAddPlacingsModalOpen(false); clearPlacingsAdminState(); }}>
                                Cancel
                            </button>
                            <button className={`${css.confirm_button} ${!canConfirmPlacings() ? css.locked : ""}`} disabled={!canConfirmPlacings()} onClick={handleOpenAddPlacingsFinal}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isAddPlacingsFinalModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            <b>Are you sure?!</b> <br />
                            By pressing "Confirm", you'll apply these placings.
                        </p>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={() => { setIsAddPlacingsFinalModalOpen(false); clearPlacingsAdminState(); }}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleApplyAddPlacings}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isRemovePlacingsCodeModalOpen && (
                    <div className={css.restart_modal}>
                        <div style={{ width: "100%" }}>
                            <label className={css.reset_label} htmlFor="placings-admin-code-remove">
                                Identification code
                            </label>
                            <input
                                id="placings-admin-code-remove"
                                className={css.reset_input}
                                type="password"
                                value={placingsAdminCode}
                                onChange={(e) => setPlacingsAdminCode(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={() => { setIsRemovePlacingsCodeModalOpen(false); clearPlacingsAdminState(); }}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleVerifyRemovePlacingsPassword}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isRemovePlacingsModalOpen && (
                    <div className={css.restart_modal} style={{ width: "520px", top: '20%' }}>
                        <p className={css.restart_text} style={{ marginBottom: 12 }}>
                            Remove tournament placings
                        </p>

                        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                            <button
                                type="button"
                                className={css.gamble_button}
                                onClick={toggleSelectAllTeams}
                                disabled={allTeams.length === 0 || canSelectAllPlacings}
                            >
                                {allSelected ? "Unselect all" : "Select all"}
                            </button>

                            {hasAnySelected && (
                                <button
                                    type="button"
                                    className={css.cancel_button}
                                    onClick={() => setSelectedPlacingTeamIds([])}
                                    disabled={canSelectAllPlacings}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div
                            className={css.hidden_scrollbar}
                            style={{
                                overflowY: "auto",
                                overflowX: "hidden",
                                height: "180px",
                                width: "100%",
                                border: "1px solid #999",
                                borderRadius: 8,
                                padding: 12,
                            }}
                        >
                            {!placingCategory ? (
                                <div style={{ width: "100%", height: "100%" }} />
                            ) : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                                    {[...getTeamsForRemovePicker()]
                                        .sort((a, b) => getSortValue(b) - getSortValue(a))
                                        .map((t) => {
                                            const isSelected = selectedPlacingTeamIds.includes(t.id);
                                            return (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => toggleTeamSelection(t.id)}
                                                    style={{
                                                        width: 37.2,
                                                        height: 37.2,
                                                        boxShadow: isSelected ? `0 0 12px ${t.unlitColor}` : "none",
                                                        border: isSelected ? `2px solid ${t.unlitColor}` : "2px solid #999",
                                                        background: t.color,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        position: "relative",
                                                        overflow: "hidden",
                                                    }}
                                                    className={css.team_circle_ro32}
                                                    title={`Team ${t.name} • ${teamRatings?.[t.id] ?? 0}p`}
                                                >
                                                    <span
                                                        style={{
                                                            color: "#ffffff",
                                                            fontSize: "12px",
                                                            textShadow: "0 0 4px #000"
                                                        }}
                                                        className={css.modal_team_rating}
                                                    >
                                                        {getDisplayedValue(t)}{placingCategory === "points" ? "p" : ""}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: 12, width: "50%", marginTop: 14 }}>
                            <select
                                className={css.reset_input}
                                style={{ marginBottom: 0 }}
                                value={placingCategory}
                                onChange={(e) => {
                                    setPlacingCategory(e.target.value);
                                }}
                            >
                                <option value=""></option>
                                <option value="wins">🏆</option>
                                <option value="seconds">🥈</option>
                                <option value="thirds">🥉</option>
                                <option value="points">points</option>
                            </select>

                            <input
                                className={css.reset_input}
                                style={{ marginBottom: 0 }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                type="text"
                                placeholder="Amount"
                                value={placingAmount}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const onlyDigits = raw.replace(/[^\d]/g, "");
                                    setPlacingAmount(onlyDigits);
                                }}
                            />
                        </div>

                        <div className={css.restart_buttons} style={{ marginTop: 14 }}>
                            <button className={css.cancel_button} onClick={() => { setIsRemovePlacingsModalOpen(false); clearPlacingsAdminState(); }}>
                                Cancel
                            </button>
                            <button
                                className={`${css.confirm_button} ${!canConfirmPlacings() ? css.locked : ""}`}
                                disabled={!canConfirmPlacings()}
                                onClick={handleOpenRemovePlacingsFinal}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isRemovePlacingsFinalModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            <b>Are you sure?!</b> <br />
                            By pressing "Confirm", you'll remove these placings.
                        </p>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={() => { setIsRemovePlacingsFinalModalOpen(false); clearPlacingsAdminState(); }}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleApplyRemovePlacings}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    };

    const modalIndicatorTop = {
        1: "-5%",
        2: "-3.6%",
        3: "-3.3%",
        4: "-2.6%",
        5: "-2.4%",
        6: "-2.1%",
        7: "-1.8%",
        8: "-1.7%",
        9: "-1.45%",
    };

    return (
        <>
            <Header
                setIsRestartModalOpen={() => setIsRestartModalOpen(true)}
                setIsTerminateModalOpen={() => setIsTerminateModalOpen(true)}
                setIsScoreBoardOpen={() => {
                    setIsLeaderboardOpen(false);
                    setIsTournamentNumberButtonArmed(false);
                }}
                setIsScoreBoard={() => setIsLeaderboardOpen(true)}
                isIntroClosed={showIntro || showPickemLine2}
                isLeaderboardOpen={isLeaderboardOpen}
                isButtonLocked={isButtonLocked}
                isScoreBoardButtonLocked={isScoreBoardButtonLocked}
                isScoreBoardResetButtonLocked={isScoreBoardResetButtonLocked}
                setIsScoreBoardResetModalOpen={() => setIsScoreBoardResetModalOpen(true)}
                setIsAddTournamentPlacingsModalOpen={handleAddPlacingsClick}
                setIsRemoveTournamentPlacingsModalOpen={handleRemovePlacingsClick}
                arePlacingButtonsArmed={arePlacingButtonsArmed}
                hasAnyPlacings={hasAnyPlacings}
                onInfoPage={() => navigate("/special-mode-info")}
            />

            <div className={css.page_container} style={{ transition: "none" }}>
                {showIntro ? (
                    <>
                        <div className={css.header_row}>
                            <h2 className={css.title}>
                                Are you intuitive enough to guess which team could win?
                            </h2>
                            <button
                                aria-label="Special mode info"
                                className={css.info_button}
                                onClick={() => navigate("/special-mode-info")}
                            >
                                ?
                            </button>
                        </div>

                        <div className={css.marquee_wrap}>
                            <div className={css.marquee_track}>
                                <div className={css.marquee_group}>
                                    {colorSeq.map((t, idx) => (
                                        <div
                                            key={`a-${idx}`}
                                            className={css.circle_wrap}
                                        >
                                            <div
                                                className={css.circle}
                                                style={{
                                                    background: t.color,
                                                    borderColor: "#999"
                                                }}
                                                title={t.name}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div
                                    className={css.marquee_group}
                                    aria-hidden
                                >
                                    {colorSeq.map((t, idx) => (
                                        <div
                                            key={`b-${idx}`}
                                            className={css.circle_wrap}
                                        >
                                            <div
                                                className={css.circle}
                                                style={{
                                                    background: t.color,
                                                    borderColor: "#999"
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <footer className={css.footer_row}>
                            <button className={css.gamble_button} onClick={handleTournamentStart}>
                                Start Game
                            </button>
                            <Link className={`${css.gamble_button} ${css.back_button}`} to="/gambling">
                                Back to Normal Gambling
                            </Link>
                        </footer>
                    </>
                ) : (
                    <>
                        {renderResultsNav()}
                        <div className={css.bracket_container}>

                            <div
                                style={{
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    zIndex: 5,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: 6,
                                }}
                            >
                                {showPickemLine2 ? (
                                    <div className={css.pickem_buttons}>
                                        <button
                                            className={`${css.gamble_button} ${css.back_button}`}
                                            onClick={() => setShowPickemSummary(true)}
                                        >
                                            Back to the Pick'em challenge summary
                                        </button>
                                        <button
                                            className={`${css.gamble_button} ${css.back_back_button}`}
                                            style={{
                                                backgroundColor: hover ? tournamentResults.winner.hoverOn : tournamentResults.winner.color,
                                            }}
                                            onMouseEnter={() => setHover(true)}
                                            onMouseLeave={() => setHover(false)}
                                            onClick={() => setShowWinnersScreen(true)}
                                        >
                                            Back to the Winners' screen
                                        </button>
                                        <button
                                            className={css.gamble_button}
                                            onClick={handleBackToHome}
                                        >
                                            To Home Page
                                        </button>
                                        <button
                                            className={css.gamble_button}
                                            onClick={handleBackToSpecialStart}
                                        >
                                            Back to the start of Special Mode
                                        </button>
                                        <button
                                            className={css.gamble_button}
                                            onClick={handleBackToGambling}
                                        >
                                            Back to normal Gambling
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ gap: '0', top: '76px', left: activePhase === "playoffs" ? '-70px' : '-150px' }} className={css.pickem_buttons}>
                                        <span className={css.match_modal_prompt}>Needed Pick&apos;em points:</span>
                                        <span className={css.points}>
                                            <CountUp
                                                start={0}
                                                duration={1.2}
                                                end={neededPickemPoints}
                                                key={neededPickemPoints}
                                            />
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: viewPhase === "playoffs" ? 32 : 64, transition: "none" }}>
                                <div className={css.stage_title}>
                                    {getStageTitleForView()}
                                </div>

                                {viewPhase === "playoffs" ? renderPlayoffsBracket() : renderSwissBracket(swissToRender)}
                            </div>
                        </div>
                    </>
                )}

                {isRestartModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            Are you sure you want to restart the game? <br /> <strong>You will not be able to revert this action!</strong>
                        </p>
                        <div className={css.restart_buttons}>
                            <button
                                className={css.cancel_button}
                                onClick={() => setIsRestartModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={css.confirm_button}
                                onClick={confirmRestart}
                            >
                                Restart
                            </button>
                        </div>
                    </div>
                )}

                {isTerminateModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            Are you sure you want to terminate the game?
                        </p>
                        <div className={css.restart_buttons}>
                            <button
                                className={css.cancel_button}
                                onClick={() => setIsTerminateModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={css.confirm_button}
                                onClick={confirmTerminate}
                            >
                                Terminate
                            </button>
                        </div>
                    </div>
                )}

                {isScoreBoardResetModalOpen && (
                    <div className={css.restart_modal}>
                        <div style={{ width: "100%" }}>
                            <label className={css.reset_label} htmlFor="scoreboard-reset-code">
                                Identification code
                            </label>

                            <input
                                id="scoreboard-reset-code"
                                className={css.reset_input}
                                type="password"
                                value={scoreboardResetCode}
                                onChange={(e) => setScoreboardResetCode(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={handleCloseScoreboardResetModal}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleVerifyScoreboardResetPassword}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isScoreBoardResetConfirmModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            <b>Are you sure?!</b> <br />
                            By pressing the button "Confirm", you'll reset the WHOLE scoreboard!
                        </p>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={handleCancelFinalScoreboardReset}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleFinalScoreboardReset}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isAddPlacingsCodeModalOpen && (
                    <div className={css.restart_modal}>
                        <div style={{ width: "100%" }}>
                            <label className={css.reset_label} htmlFor="placings-admin-code-add">
                                Identification code
                            </label>
                            <input
                                id="placings-admin-code-add"
                                className={css.reset_input}
                                type="password"
                                value={placingsAdminCode}
                                onChange={(e) => setPlacingsAdminCode(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={() => { setIsAddPlacingsCodeModalOpen(false); clearPlacingsAdminState(); }}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleVerifyAddPlacingsPassword}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isAddPlacingsModalOpen && (
                    <div className={css.restart_modal} style={{ width: "520px", top: '20%' }}>
                        <p className={css.restart_text} style={{ marginBottom: 12 }}>
                            Add tournament placings
                        </p>

                        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                            <button
                                type="button"
                                className={css.gamble_button}
                                onClick={toggleSelectAllTeams}
                                disabled={allTeams.length === 0 || canSelectAllPlacings}
                            >
                                {allSelected ? "Unselect all" : "Select all"}
                            </button>

                            {hasAnySelected && (
                                <button
                                    type="button"
                                    className={css.cancel_button}
                                    onClick={() => setSelectedPlacingTeamIds([])}
                                    disabled={canSelectAllPlacings}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div
                            className={css.hidden_scrollbar}
                            style={{
                                overflowY: "auto",
                                overflowX: "hidden",
                                height: "180px",
                                width: "100%",
                                border: "1px solid #999",
                                borderRadius: 8,
                                padding: 12,
                            }}
                        >
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                                {[...allTeams]
                                    .sort((a, b) => getSortValue(b) - getSortValue(a))
                                    .map((t) => {
                                        const isSelected = selectedPlacingTeamIds.includes(t.id);
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => toggleTeamSelection(t.id)}
                                                style={{
                                                    width: 37.2,
                                                    height: 37.2,
                                                    boxShadow: isSelected ? `0 0 12px ${t.unlitColor}` : "none",
                                                    border: isSelected ? `2px solid ${t.unlitColor}` : "2px solid #999",
                                                    background: t.color,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    position: "relative",
                                                    overflow: "hidden",
                                                }}
                                                className={css.team_circle_ro32}
                                                title={`Team ${t.name} • ${teamRatings?.[t.id] ?? 0}p`}
                                            >
                                                <span
                                                    style={{
                                                        color: "#ffffff",
                                                        fontSize: "12px",
                                                        textShadow: "0 0 4px #000"
                                                    }}
                                                    className={css.modal_team_rating}
                                                >
                                                    {getDisplayedValue(t)}{placingCategory === "points" ? "p" : ""}
                                                </span>
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, width: "50%", marginTop: 14 }}>
                            <select
                                className={css.reset_input}
                                style={{ marginBottom: 0 }}
                                value={placingCategory}
                                onChange={(e) => {
                                    setPlacingCategory(e.target.value);
                                }}
                            >
                                <option value=""></option>
                                <option value="wins">🏆</option>
                                <option value="seconds">🥈</option>
                                <option value="thirds">🥉</option>
                                <option value="points">points</option>
                            </select>

                            <input
                                className={css.reset_input}
                                style={{ marginBottom: 0 }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                type="text"
                                placeholder="Amount"
                                value={placingAmount}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const onlyDigits = raw.replace(/[^\d]/g, "");
                                    setPlacingAmount(onlyDigits);
                                }}
                            />
                        </div>

                        <div className={css.restart_buttons} style={{ marginTop: 14 }}>
                            <button className={css.cancel_button} onClick={() => { setIsAddPlacingsModalOpen(false); clearPlacingsAdminState(); }}>
                                Cancel
                            </button>
                            <button className={`${css.confirm_button} ${!canConfirmPlacings() ? css.locked : ""}`} disabled={!canConfirmPlacings()} onClick={handleOpenAddPlacingsFinal}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isAddPlacingsFinalModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            <b>Are you sure?!</b> <br />
                            By pressing "Confirm", you'll apply these placings.
                        </p>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={() => { setIsAddPlacingsFinalModalOpen(false); clearPlacingsAdminState(); }}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleApplyAddPlacings}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isRemovePlacingsCodeModalOpen && (
                    <div className={css.restart_modal}>
                        <div style={{ width: "100%" }}>
                            <label className={css.reset_label} htmlFor="placings-admin-code-remove">
                                Identification code
                            </label>
                            <input
                                id="placings-admin-code-remove"
                                className={css.reset_input}
                                type="password"
                                value={placingsAdminCode}
                                onChange={(e) => setPlacingsAdminCode(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={() => { setIsRemovePlacingsCodeModalOpen(false); clearPlacingsAdminState(); }}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleVerifyRemovePlacingsPassword}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isRemovePlacingsModalOpen && (
                    <div className={css.restart_modal} style={{ width: "520px", top: '20%' }}>
                        <p className={css.restart_text} style={{ marginBottom: 12 }}>
                            Remove tournament placings
                        </p>

                        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                            <button
                                type="button"
                                className={css.gamble_button}
                                onClick={toggleSelectAllTeams}
                                disabled={allTeams.length === 0 || canSelectAllPlacings}
                            >
                                {allSelected ? "Unselect all" : "Select all"}
                            </button>

                            {hasAnySelected && (
                                <button
                                    type="button"
                                    className={css.cancel_button}
                                    onClick={() => setSelectedPlacingTeamIds([])}
                                    disabled={canSelectAllPlacings}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div
                            className={css.hidden_scrollbar}
                            style={{
                                overflowY: "auto",
                                overflowX: "hidden",
                                height: "180px",
                                width: "100%",
                                border: "1px solid #999",
                                borderRadius: 8,
                                padding: 12,
                            }}
                        >
                            {!placingCategory ? (
                                <div style={{ width: "100%", height: "100%" }} />
                            ) : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                                    {[...getTeamsForRemovePicker()]
                                        .sort((a, b) => getSortValue(b) - getSortValue(a))
                                        .map((t) => {
                                            const isSelected = selectedPlacingTeamIds.includes(t.id);
                                            return (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => toggleTeamSelection(t.id)}
                                                    style={{
                                                        width: 37.2,
                                                        height: 37.2,
                                                        boxShadow: isSelected ? `0 0 12px ${t.unlitColor}` : "none",
                                                        border: isSelected ? `2px solid ${t.unlitColor}` : "2px solid #999",
                                                        background: t.color,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        position: "relative",
                                                        overflow: "hidden",
                                                    }}
                                                    className={css.team_circle_ro32}
                                                    title={`Team ${t.name} • ${teamRatings?.[t.id] ?? 0}p`}
                                                >
                                                    <span
                                                        style={{
                                                            color: "#ffffff",
                                                            fontSize: "12px",
                                                            textShadow: "0 0 4px #000"
                                                        }}
                                                        className={css.modal_team_rating}
                                                    >
                                                        {getDisplayedValue(t)}{placingCategory === "points" ? "p" : ""}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: 12, width: "50%", marginTop: 14 }}>
                            <select
                                className={css.reset_input}
                                style={{ marginBottom: 0 }}
                                value={placingCategory}
                                onChange={(e) => {
                                    setPlacingCategory(e.target.value);
                                }}
                            >
                                <option value=""></option>
                                <option value="wins">🏆</option>
                                <option value="seconds">🥈</option>
                                <option value="thirds">🥉</option>
                                <option value="points">points</option>
                            </select>

                            <input
                                className={css.reset_input}
                                style={{ marginBottom: 0 }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                type="text"
                                placeholder="Amount"
                                value={placingAmount}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const onlyDigits = raw.replace(/[^\d]/g, "");
                                    setPlacingAmount(onlyDigits);
                                }}
                            />
                        </div>

                        <div className={css.restart_buttons} style={{ marginTop: 14 }}>
                            <button className={css.cancel_button} onClick={() => { setIsRemovePlacingsModalOpen(false); clearPlacingsAdminState(); }}>
                                Cancel
                            </button>
                            <button
                                className={`${css.confirm_button} ${!canConfirmPlacings() ? css.locked : ""}`}
                                disabled={!canConfirmPlacings()}
                                onClick={handleOpenRemovePlacingsFinal}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isRemovePlacingsFinalModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            <b>Are you sure?!</b> <br />
                            By pressing "Confirm", you'll remove these placings.
                        </p>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={() => { setIsRemovePlacingsFinalModalOpen(false); clearPlacingsAdminState(); }}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleApplyRemovePlacings}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {isMatchModalOpen && modalContext && currentModalMatch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={css.match_modal_overlay}
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) {
                                closeMatchModal();
                            }
                        }}
                    >
                        <div
                            ref={modalRef}
                            style={{
                                position: "relative",
                                transform: `scale(${modalScale})`,
                                transformOrigin: "center center",
                                transition: "none"
                            }}
                        >
                            {isPlayedModal && (
                                didUserWin ? (
                                    <div
                                        className={css.modalSuccessPickemIndicator}
                                        style={{
                                            top: modalIndicatorTop[playedSets] ?? "-2.5%",
                                            left: playedSets === 9 ? "-3%" : "-3.1%",
                                        }}
                                    >
                                        <FaCircle size={32} color="#37b737" />
                                        <FaCheck size={20} color="#ffffff" />
                                    </div>
                                ) : (
                                    <div
                                        className={css.modalSuccessPickemIndicator}
                                        style={{
                                            top: modalIndicatorTop[playedSets] ?? "-2.5%",
                                            left: playedSets === 9 ? "-3%" : "-3.1%",
                                        }}
                                    >
                                        <FaCircle size={32} color="#be3939" />
                                        <FaXmark size={20} color="#fff" />
                                    </div>
                                )
                            )}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className={`
                                        ${css.match_modal}
                                        ${isPlayedModal
                                        ? didUserWin
                                            ? (isBo1Modal ? css.match_win_bo1 : css.match_win_modal)
                                            : (isBo1Modal ? css.match_loss_bo1 : css.match_loss_modal)
                                        : ""
                                    }
                            `}
                                onClick={(e) => e.stopPropagation()}
                                style={
                                    isPlayedModal
                                        ? didUserWin
                                            ? {
                                                border: "2px solid #006a32",
                                                overflow: "hidden",
                                            }
                                            : {
                                                border: "2px solid rgb(188, 108, 108)",
                                                overflow: "hidden",
                                            }
                                        : {
                                            border: "2px solid #999",
                                        }
                                }
                            >
                                <div
                                    style={{ paddingTop: '12px', borderTopRightRadius: '12px', borderTopLeftRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <div className={css.match_modal_header}>
                                        <span className={css.match_modal_title} style={{
                                            fontSize: '16px',
                                            marginBottom: '-8px',
                                            color: isPlayedModal
                                                ? didUserWin
                                                    ? '#fff'
                                                    : '#fff'
                                                : "",
                                        }}>
                                            {modalContext.type !== "playoffs" ? modalStageSmallLabel : null}
                                        </span>
                                        <h3
                                            style={{
                                                color: isPlayedModal
                                                    ? didUserWin
                                                        ? '#fff'
                                                        : '#fff'
                                                    : "",
                                                margin: '0'
                                            }}
                                            className={css.match_modal_title}>
                                            {modalTitle}
                                            {modalContext.stage !== "gf" && modalContext.stage !== "thirdPlace" ? (
                                                <div
                                                    style={{
                                                        marginLeft: "2px",
                                                        marginTop: "-2px",
                                                        padding: "4px 8px",
                                                        color: isPlayedModal ? "#fff" : "",
                                                        backgroundColor: isPlayedModal
                                                            ? didUserWin
                                                                ? "#2e7d32"
                                                                : "#7d2e2e"
                                                            : "",
                                                    }}
                                                    className={css.points}
                                                >
                                                    #{modalMatchNumber}
                                                </div>
                                            ) : null}
                                        </h3>
                                        <span
                                            style={{
                                                color: isPlayedModal
                                                    ? didUserWin
                                                        ? '#fff'
                                                        : '#fff'
                                                    : "",
                                                margin: '0',
                                                fontSize: '18px',
                                                marginTop: '-6px',
                                            }}
                                            className={css.match_modal_title}
                                        >
                                            Best of {modalBestOf}
                                        </span>

                                        {isPlayedModal && pickemLabelText && (
                                            <span
                                                className={css.match_modal_pickem}
                                                style={pickemLabelStyle}
                                            >
                                                {pickemLabelText}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!isPlayedModal && !modalContext.readOnly && (() => {
                                    const boSkewFactor = (bestOf) => {
                                        if (bestOf <= 1) return 0.7;
                                        if (bestOf <= 3) return 0.82;
                                        if (bestOf <= 5) return 0.92;
                                        if (bestOf <= 7) return 1.02;
                                        return 1.1;
                                    };

                                    const leftRating = teamRatings?.[modalLeftTeam?.id] ?? 0;
                                    const rightRating = teamRatings?.[modalRightTeam?.id] ?? 0;

                                    const leftPlacement = rankById[modalLeftTeam?.id] ?? 64;
                                    const rightPlacement = rankById[modalRightTeam?.id] ?? 64;

                                    const placementGap = rightPlacement - leftPlacement;

                                    const placementRatingShift = placementGap * 12;

                                    const adjustedLeftRating =
                                        leftRating + placementRatingShift;

                                    const adjustedRightRating =
                                        rightRating - placementRatingShift;

                                    const expectedScore = (ra, rb) =>
                                        1 / (1 + Math.pow(10, (rb - ra) / 850));

                                    const raw = expectedScore(
                                        adjustedLeftRating,
                                        adjustedRightRating
                                    );

                                    const boFactor = boSkewFactor(modalBestOf);

                                    const adjustedRaw =
                                        0.5 + (raw - 0.5) * boFactor;

                                    const curve = 1.12;

                                    const leftWinProb =
                                        Math.pow(adjustedRaw, curve) /
                                        (
                                            Math.pow(adjustedRaw, curve) +
                                            Math.pow(1 - adjustedRaw, curve)
                                        );

                                    const leftPct = Math.min(
                                        100,
                                        Math.max(0, leftWinProb * 100)
                                    );

                                    const rightPct = 100 - leftPct;

                                    const favoriteIsLeft = leftPct > rightPct;
                                    const favoritePct = Math.max(leftPct, rightPct);
                                    const diff = Math.abs(leftPct - rightPct);

                                    const favoriteTeam = favoriteIsLeft ? modalLeftTeam?.name : modalRightTeam?.name;

                                    const predictionLabel =
                                        diff <= 0
                                            ? "Absolute 50/50"
                                            : diff <= 5
                                                ? "Too close to call"
                                                : diff <= 10
                                                    ? "Barely separated"
                                                    : diff <= 18
                                                        ? `${favoriteTeam} has slight edge`
                                                        : diff <= 25
                                                            ? `${favoriteTeam} has modest advantage`
                                                            : diff <= 35
                                                                ? `${favoriteTeam} has it in control`
                                                                : diff <= 45
                                                                    ? `${favoriteTeam} has strong position`
                                                                    : diff <= 60
                                                                        ? `${favoriteTeam} has dominant position`
                                                                        : diff <= 75
                                                                            ? `${favoriteTeam} is overwhelming favorite`
                                                                            : diff <= 90
                                                                                ? `${favoriteTeam} is very likely a winner`
                                                                                : diff <= 99
                                                                                    ? `${favoriteTeam} is near-absolute favorite`
                                                                                    : `${favoriteTeam} is 100% winner!`;

                                    const offsetStrength = Math.min(
                                        35,
                                        ((favoritePct - 50) / 50) * 35
                                    );

                                    let predictionPositionPct = favoriteIsLeft
                                        ? 50 - offsetStrength
                                        : 50 + offsetStrength;

                                    const padding = predictionLabel.length > 25 ? 29 : 26;

                                    predictionPositionPct = Math.max(padding, Math.min(100 - padding, predictionPositionPct));

                                    const predictionPosition = `${predictionPositionPct}%`;

                                    const blend = 10;

                                    const start = Math.max(0, leftPct - blend);
                                    const end = Math.min(100, leftPct + blend);

                                    const barStyle = {
                                        background: `linear-gradient(
                                        90deg,
                                        ${modalLeftTeam?.color} 0%,
                                        ${modalLeftTeam?.color} ${start}%,
                                        ${modalRightTeam?.color} ${end}%,
                                        ${modalRightTeam?.color} 100%
                                    )`
                                    };

                                    const leftStats = teamPlacings?.[modalLeftTeam?.id] ?? { wins: 0, seconds: 0, thirds: 0 };
                                    const rightStats = teamPlacings?.[modalRightTeam?.id] ?? { wins: 0, seconds: 0, thirds: 0 };

                                    const renderStats = (stats) => {
                                        const items = [];

                                        if (stats.wins > 0) items.push({ icon: <FaTrophy />, value: stats.wins });
                                        if (stats.seconds > 0) items.push({ icon: "🥈", value: stats.seconds });
                                        if (stats.thirds > 0) items.push({ icon: "🥉", value: stats.thirds });

                                        if (items.length === 0) return null;

                                        return (
                                            <div
                                                className={css.team_stats_badge}
                                                style={{
                                                    position: "absolute",
                                                    top: "25%",
                                                    right: stats === leftStats ? "85%" : "auto",
                                                    left: stats === rightStats ? "84%" : "auto",
                                                }}
                                            >
                                                {items.map((i, idx) => (
                                                    <span key={idx} className={css.stat_item}>
                                                        {i.icon}: {i.value}
                                                    </span>
                                                ))}
                                            </div>
                                        );
                                    };

                                    const boLabel = `BO${modalBestOf}`;

                                    let stageLabel = "Start Match";

                                    if (modalContext?.type === "playoffs") {
                                        stageLabel = `Start this ${boLabel} ${modalTitle}`;
                                    } else if (modalContext?.type === "swiss") {
                                        const net = modalContext?.net;

                                        const regularMatches = ["0:0", "1:0", "0:1", "1:1"];

                                        const progressionMatches = ["2:0", "2:1"];
                                        const eliminationMatches = ["0:2", "1:2"];
                                        const deciderMatches = ["2:2"];

                                        if (regularMatches.includes(net)) {
                                            stageLabel = `Start this ${net} Match`;
                                        } else if (progressionMatches.includes(net)) {
                                            stageLabel = `Start this ${net} Progression Match`;
                                        } else if (eliminationMatches.includes(net)) {
                                            stageLabel = `Start this ${net} Elimination Match`;
                                        } else if (deciderMatches.includes(net)) {
                                            stageLabel = `Start this ${net} Deciding Match`;
                                        }
                                    }

                                    return (
                                        <>
                                            <div className={css.match_modal_row}>
                                                {renderStats(leftStats)}
                                                <div
                                                    onMouseEnter={() => setHoveredTeamId(modalLeftTeam?.id)}
                                                    onMouseLeave={() => setHoveredTeamId(null)}
                                                    style={{ cursor: hasChosen ? "default" : "pointer", marginLeft: '12px' }}
                                                    onClick={handleChooseLeft}
                                                    className={css.modal_team_btn}
                                                >
                                                    <button
                                                        type="button"
                                                        style={{
                                                            all: "unset",
                                                            borderRadius: "50%"
                                                        }}
                                                    >
                                                        <TeamCircle
                                                            team={modalLeftTeam}
                                                            showRating
                                                            ratingValue={leftRating}
                                                            specialStyle={{
                                                                width: "64px",
                                                                height: "64px",
                                                                border:
                                                                    hasChosen
                                                                        ? "3px solid #0d6aff"
                                                                        : "3px solid #999",

                                                                boxShadow:
                                                                    hasChosen
                                                                        ? "0 0 8px 2px #0d6aff"
                                                                        : hoveredTeamId === modalLeftTeam?.id
                                                                            ? "0 0 4px 1px #0d6aff"
                                                                            : "none",
                                                                zIndex: 0
                                                            }}
                                                        />
                                                        <span
                                                            style={{
                                                                color: "#fff",
                                                                textShadow:
                                                                    hasChosen
                                                                        ? "0 0 8px #0d6aff"
                                                                        : hoveredTeamId === modalLeftTeam?.id
                                                                            ? "0 0 4px #0d6aff"
                                                                            : "0 0 4px #000",
                                                                top: '12%'
                                                            }}
                                                            className={css.finished_modal_team_placing}
                                                        >
                                                            {rankLeftSticker()}
                                                        </span>

                                                        <span
                                                            style={{
                                                                color: "#fff",
                                                                textShadow:
                                                                    hasChosen
                                                                        ? "0 0 8px #0d6aff"
                                                                        : hoveredTeamId === modalLeftTeam?.id
                                                                            ? "0 0 4px #0d6aff"
                                                                            : "0 0 4px #000",
                                                            }}
                                                            className={css.modal_team_label}
                                                        >
                                                            {modalLeftTeam?.name}
                                                        </span>
                                                    </button>
                                                </div>

                                                <p
                                                    className={css.vs_text}
                                                    style={{
                                                        position: "static",
                                                        backgroundColor: "#fff",
                                                        fontSize: "24px",
                                                        textShadow: `
                                                            1px 0 #d8d8d8,
                                                            -1px 0 #d8d8d8,
                                                            0 1px #d8d8d8,
                                                            0 -1px #d8d8d8,
                                                            1px 1px #d8d8d8,
                                                            1px -1px #d8d8d8,
                                                            -1px 1px #d8d8d8,
                                                            -1px -1px #d8d8d8,
                                                            1.5px 0 #5a5a5a,
                                                            -1.5px 0 #5a5a5a,
                                                            0 1.5px #5a5a5a,
                                                            0 -1.5px #5a5a5a,
                                                            1.5px 1.5px #5a5a5a,
                                                            1.5px -1.5px #5a5a5a,
                                                            -1.5px 1.5px #5a5a5a,
                                                            -1.5px -1.5px #5a5a5a,
                                                            1.5px 0 #5a5a5a,
                                                            -1.5px 0 #5a5a5a
                                                        `,
                                                    }}
                                                >
                                                    VS
                                                </p>

                                                <div
                                                    onMouseEnter={() => setHoveredTeamId(modalRightTeam?.id)}
                                                    onMouseLeave={() => setHoveredTeamId(null)}
                                                    onClick={handleChooseRight}
                                                    className={css.modal_team_btn}
                                                    style={{ marginRight: '12px' }}
                                                >
                                                    <button
                                                        type="button"
                                                        style={{
                                                            all: "unset",
                                                            borderRadius: "50%"
                                                        }}
                                                    >
                                                        <TeamCircle
                                                            team={modalRightTeam}
                                                            showRating
                                                            ratingValue={rightRating}
                                                            specialStyle={{
                                                                width: "64px",
                                                                height: "64px",
                                                                border: "3px solid #999",

                                                                boxShadow:
                                                                    hoveredTeamId === modalRightTeam?.id
                                                                        ? "0 0 4px 1px #0d6aff"
                                                                        : "none",
                                                                zIndex: 0
                                                            }}
                                                        />

                                                        <span
                                                            className={css.finished_modal_team_placing}
                                                            style={{
                                                                color: "#ffffff",
                                                                textShadow:
                                                                    hoveredTeamId === modalRightTeam?.id
                                                                        ? "0 0 4px #0d6aff"
                                                                        : "0 0 4px #000",
                                                                top: '12%',
                                                            }}
                                                        >
                                                            {rankRightSticker()}
                                                        </span>

                                                        <span
                                                            className={css.modal_team_label}
                                                            style={{
                                                                color: "#ffffff",
                                                                textShadow:
                                                                    hoveredTeamId === modalRightTeam?.id
                                                                        ? "0 0 4px #0d6aff"
                                                                        : "0 0 4px #000",
                                                            }}
                                                        >
                                                            {modalRightTeam?.name}
                                                        </span>
                                                    </button>
                                                </div>
                                                {renderStats(rightStats)}
                                            </div>

                                            <div className={css.match_prediction_wrapper}>
                                                <span className={css.match_prediction_pct}>
                                                    <CountUp
                                                        key={Math.round(leftPct)}
                                                        start={0}
                                                        end={Math.round(leftPct)}
                                                        duration={1.2}
                                                    />
                                                    %
                                                </span>

                                                <div
                                                    className={css.match_prediction_bar}
                                                    style={barStyle}
                                                />

                                                <span className={css.match_prediction_pct}>
                                                    <CountUp
                                                        key={Math.round(rightPct)}
                                                        start={0}
                                                        end={Math.round(rightPct)}
                                                        duration={1.2}
                                                    />
                                                    %
                                                </span>
                                            </div>
                                            <ReactFitty
                                                maxSize={16}
                                                minSize={12}
                                                className={css.prediction_label}
                                                style={{
                                                    left: predictionPosition,
                                                    transform: "translateX(-50%)",
                                                }}
                                            >
                                                {predictionLabel}
                                            </ReactFitty>
                                            <div style={{ textAlign: "center" }}>
                                                <button
                                                    className={`${css.gamble_button} ${!hasChosen ? css.locked : ""}`}
                                                    disabled={!hasChosen}
                                                    onClick={handleStartMatch}
                                                >
                                                    {stageLabel}
                                                </button>
                                            </div>
                                        </>
                                    );
                                })()}

                                {isPlayedModal &&
                                    (() => {
                                        const {
                                            leftTeam: modalPlayedLeft,
                                            rightTeam: modalPlayedRight,
                                            displayLeft: modalDisplayScoreLeft,
                                            displayRight: modalDisplayScoreRight,
                                            winnerIsLeft,
                                            winnerIsRight,
                                            leftIsLoser,
                                            rightIsLoser,
                                            leftIsPick,
                                            rightIsPick,
                                        } = getPickOrientedModalView(
                                            currentModalMatch,
                                            isBo1Modal
                                        );

                                        const {
                                            leftText: leftStakeText,
                                            rightText: rightStakeText,
                                        } = getMatchStakeText({
                                            modalContext,
                                            winnerIsLeft,
                                            winnerIsRight
                                        });

                                        const stage = modalContext?.stage;
                                        const isGrandFinal = stage === "gf";
                                        const isThirdPlace = stage === "thirdPlace";

                                        const getPlacementBadge = (isWinner, isLoser) => {
                                            if (isGrandFinal) {
                                                if (isWinner) {
                                                    return (
                                                        <span style={{ marginLeft: '-28px', marginRight: '4px', color: '#2e2f42' }}>
                                                            <FaTrophy style={{ color: '#2e2f42' }} />+
                                                        </span>
                                                    );
                                                }
                                                if (isLoser) {
                                                    return (
                                                        <span style={{ marginLeft: '-36px', marginRight: '4px', color: '#2e2f42' }}>
                                                            🥈+
                                                        </span>
                                                    );
                                                }
                                            }

                                            if (isThirdPlace && isWinner) {
                                                return (
                                                    <span style={{ marginLeft: '-36px', marginRight: '4px', color: '#2e2f42' }}>
                                                        🥉+
                                                    </span>
                                                );
                                            }

                                            return null;
                                        };

                                        const displayedLeftStats =
                                            teamPlacings?.[modalPlayedLeft?.id] ?? {
                                                wins: 0,
                                                seconds: 0,
                                                thirds: 0,
                                            };

                                        const displayedRightStats =
                                            teamPlacings?.[modalPlayedRight?.id] ?? {
                                                wins: 0,
                                                seconds: 0,
                                                thirds: 0,
                                            };

                                        const renderStats = (stats, side) => {
                                            const items = [];

                                            if (stats.wins > 0) items.push({ icon: <FaTrophy />, value: stats.wins });
                                            if (stats.seconds > 0) items.push({ icon: "🥈", value: stats.seconds });
                                            if (stats.thirds > 0) items.push({ icon: "🥉", value: stats.thirds });

                                            if (!items.length) return null;

                                            return (
                                                <div
                                                    className={css.team_stats_badge}
                                                    style={{
                                                        position: "absolute",
                                                        top: "20%",
                                                        zIndex: 2,
                                                        transition: "opacity 0.3s ease",
                                                        ...(side === "left"
                                                            ? { right: "90.5%" }
                                                            : { left: "90.5%" }),
                                                    }}
                                                >
                                                    {items.map((i, idx) => (
                                                        <span key={idx} className={css.stat_item}>
                                                            {i.icon}: {i.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            );
                                        };

                                        return (
                                            <>
                                                <div className={css.finishedMatchReview}>
                                                    <div
                                                        style={{ marginBottom: isBo1Modal ? 0 : "10px" }}
                                                        className={css.match_modal_row}
                                                    >
                                                        {renderStats(displayedLeftStats, "left")}
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                top: "50%",
                                                                right: "84.5%",
                                                                width: 260,
                                                                height: 120,
                                                                borderRadius: "50%",
                                                                transform: "translate(50%, -50%)",
                                                                background: winnerIsLeft ? "#91ffc1" : "#ff9191",
                                                                boxShadow: winnerIsLeft ? "0 0 32px 8px #91ffc1" : "0 0 32px 8px #ff9191",
                                                                filter: "blur(42px)",
                                                                opacity: 0.75,
                                                                zIndex: 1,
                                                                pointerEvents: "none",
                                                            }}
                                                        />
                                                        <div
                                                            className={css.modal_team_btn}
                                                            style={{
                                                                flex: 1,
                                                                pointerEvents: "none",
                                                            }}
                                                        >
                                                            <TeamCircle team={modalPlayedLeft} showRating beforeRatingValue={currentModalMatch?.ratingMeta?.before?.[modalPlayedLeft?.id]?.points} ratingValue={currentModalMatch?.ratingMeta?.after?.[modalPlayedLeft?.id]?.points ?? (teamRatings[modalPlayedLeft?.id] ?? 0)} specialStyle={{ width: '64px', height: '64px', border: currentModalMatch.pickTeamId === modalPlayedLeft?.id && leftIsPick ? leftIsLoser ? '3px solid #7d2e2e' : '3px solid #2e7d32' : '3px solid #999', boxShadow: currentModalMatch.pickTeamId === modalPlayedLeft?.id && leftIsPick ? leftIsLoser ? '0 0 8px 2px #7d2e2e' : '0 0 8px 2px #2e7d32' : 'none', zIndex: 2 }} />
                                                            <span className={css.modal_team_label}>
                                                                {(() => {
                                                                    const meta = currentModalMatch?.ratingMeta;
                                                                    const id = modalPlayedLeft?.id;
                                                                    const afterRank = meta?.after?.[id]?.rank ?? (rankById[id] ?? 64);
                                                                    const beforeRank = meta?.before?.[id]?.rank ?? afterRank;
                                                                    const deltaPlaces = beforeRank - afterRank;
                                                                    const afterPoints = meta?.after?.[id]?.points ?? (teamRatings[id] ?? 0);
                                                                    const beforePoints = meta?.before?.[id]?.points ?? afterPoints;
                                                                    const deltaPoints = afterPoints - beforePoints;

                                                                    const placementColor = placementColors[afterRank] || "#ffffff";

                                                                    const rankSticker = () => {
                                                                        return (
                                                                            <span style={{ color: placementColor }}>
                                                                                {formatOrdinal(afterRank)}
                                                                            </span>
                                                                        );
                                                                    };

                                                                    return (
                                                                        <>
                                                                            <span style={{ top: '-60px', right: "-6px", zIndex: 3, width: 'max-content' }} className={css.finished_modal_team_placing}>
                                                                                {deltaPlaces !== 0 && (
                                                                                    <span
                                                                                        style={{
                                                                                            color: deltaPlaces > 0 ? "#2e7d32" : "red",
                                                                                            fontWeight: 900,
                                                                                            marginRight: "-2px",
                                                                                            display: "inline-flex",
                                                                                            alignItems: "center",
                                                                                            gap: "2px",
                                                                                        }}
                                                                                    >
                                                                                        {deltaPlaces > 0 ? (
                                                                                            <>
                                                                                                <span style={{ marginRight: "-4px" }}>{deltaPlaces}</span>
                                                                                                <MdOutlineKeyboardDoubleArrowUp />
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <span style={{ marginRight: "-4px" }}>{Math.abs(deltaPlaces)}</span>
                                                                                                <MdOutlineKeyboardDoubleArrowDown />
                                                                                            </>
                                                                                        )}
                                                                                    </span>
                                                                                )}
                                                                                <span style={{ color: '#ffffff', textShadow: currentModalMatch.pickTeamId === modalPlayedLeft?.id && leftIsPick ? leftIsLoser ? '0 0 8px red' : '0 0 8px #2e7d32' : '0 0 4px #000' }}>
                                                                                    {rankSticker()}
                                                                                </span>
                                                                            </span>
                                                                            <span style={{ width: 'max-content', top: '62%', zIndex: 3, }} className={css.finished_modal_team_label}>
                                                                                {getPlacementBadge(winnerIsLeft, leftIsLoser)}
                                                                                <span style={{ color: '#ffffff', textShadow: currentModalMatch.pickTeamId === modalPlayedLeft?.id && leftIsPick ? leftIsLoser ? '0 0 8px red' : '0 0 8px #2e7d32' : '0 0 4px #000' }}>
                                                                                    {modalPlayedLeft?.name}
                                                                                    {leftStakeText === "path ends here, for now!" || leftStakeText === "second place is still wonderful!" ? "'s" : ""}
                                                                                </span>
                                                                                {deltaPoints !== 0 && (
                                                                                    <span style={{ color: deltaPoints > 0 ? "#2e7d32" : "red", fontWeight: 900, marginLeft: '4px' }}>
                                                                                        {deltaPoints > 0 ? `+${deltaPoints}p` : `${deltaPoints}p`}
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </span>
                                                        </div>

                                                        <div className={css.modal_vs}>
                                                            <span
                                                                style={{
                                                                    color: winnerIsLeft
                                                                        ? "#2e7d32"
                                                                        : "red",
                                                                    fontWeight: 800,
                                                                    fontStyle: "italic",
                                                                    position: "absolute",
                                                                    display: "inline-block",
                                                                    paddingRight: "8px",
                                                                    right: "25px",
                                                                    top: "-18px",
                                                                    zIndex: 1,
                                                                    fontSize: 36,

                                                                    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 65%, black 100%)",
                                                                    maskImage: "linear-gradient(to right, transparent 0%, black 65%, black 100%)",
                                                                }}
                                                                className={
                                                                    winnerIsLeft
                                                                        ? css.swissWinnerScoreShadow
                                                                        : css.swissLoserScoreShadow
                                                                }
                                                            >
                                                                {modalDisplayScoreLeft}
                                                            </span>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                    gap: 2,
                                                                    marginTop: 2,
                                                                }}
                                                            >
                                                                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2e2f42" }}></div>
                                                                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2e2f42" }}></div>
                                                            </div>
                                                            <span
                                                                style={{
                                                                    color: winnerIsRight
                                                                        ? "#2e7d32"
                                                                        : "red",
                                                                    fontWeight: 800,
                                                                    fontStyle: "italic",
                                                                    position: "absolute",
                                                                    display: "inline-block",
                                                                    paddingLeft: "4px",
                                                                    left: "28px",
                                                                    top: "-18px",
                                                                    zIndex: 1,
                                                                    fontSize: 36,

                                                                    WebkitMaskImage: "linear-gradient(to left, transparent 0%, black 65%, black 100%)",
                                                                    maskImage: "linear-gradient(to left, transparent 0%, black 65%, black 100%)",
                                                                }}
                                                                className={
                                                                    winnerIsRight
                                                                        ? css.swissWinnerScoreShadow
                                                                        : css.swissLoserScoreShadow
                                                                }
                                                            >
                                                                {modalDisplayScoreRight}
                                                            </span>
                                                        </div>

                                                        <div
                                                            className={css.modal_team_btn}
                                                            style={{
                                                                flex: 1,
                                                                pointerEvents: "none",
                                                            }}
                                                        >
                                                            <TeamCircle team={modalPlayedRight} showRating beforeRatingValue={currentModalMatch?.ratingMeta?.before?.[modalPlayedRight?.id]?.points} ratingValue={currentModalMatch?.ratingMeta?.after?.[modalPlayedRight?.id]?.points ?? (teamRatings[modalPlayedRight?.id] ?? 0)} specialStyle={{ width: '64px', height: '64px', border: currentModalMatch.pickTeamId === modalPlayedRight?.id && rightIsPick ? rightIsLoser ? '3px solid #7d2e2e' : '3px solid #2e7d32' : '3px solid #999', boxShadow: currentModalMatch.pickTeamId === modalPlayedRight?.id && rightIsPick ? rightIsLoser ? '0 0 8px 2px #7d2e2e' : '0 0 8px 2px #2e7d32' : 'none', zIndex: 2 }} />
                                                            <span>
                                                                {(() => {
                                                                    const meta = currentModalMatch?.ratingMeta;
                                                                    const id = modalPlayedRight?.id;
                                                                    const afterRank = meta?.after?.[id]?.rank ?? (rankById[id] ?? 64);
                                                                    const beforeRank = meta?.before?.[id]?.rank ?? afterRank;
                                                                    const deltaPlaces = beforeRank - afterRank;
                                                                    const afterPoints = meta?.after?.[id]?.points ?? (teamRatings[id] ?? 0);
                                                                    const beforePoints = meta?.before?.[id]?.points ?? afterPoints;
                                                                    const deltaPoints = afterPoints - beforePoints;

                                                                    const placementColor = placementColors[afterRank] || "#ffffff";

                                                                    const rankSticker = () => {
                                                                        return (
                                                                            <span style={{ color: placementColor }}>
                                                                                {formatOrdinal(afterRank)}
                                                                            </span>
                                                                        );
                                                                    };

                                                                    return (
                                                                        <>
                                                                            <span style={{ top: '12%', zIndex: 3, width: 'max-content' }} className={css.finished_modal_team_placing}>
                                                                                {deltaPlaces !== 0 && (
                                                                                    <span
                                                                                        style={{
                                                                                            color: deltaPlaces > 0 ? "#2e7d32" : "red",
                                                                                            fontWeight: 900,
                                                                                            marginRight: "-2px",
                                                                                            display: "inline-flex",
                                                                                            alignItems: "center",
                                                                                            gap: "2px",
                                                                                        }}
                                                                                    >
                                                                                        {deltaPlaces > 0 ? (
                                                                                            <>
                                                                                                <span style={{ marginRight: "-4px" }}>{deltaPlaces}</span>
                                                                                                <MdOutlineKeyboardDoubleArrowUp />
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <span style={{ marginRight: "-4px" }}>{Math.abs(deltaPlaces)}</span>
                                                                                                <MdOutlineKeyboardDoubleArrowDown />
                                                                                            </>
                                                                                        )}
                                                                                    </span>
                                                                                )}
                                                                                <span style={{ color: '#ffffff', textShadow: currentModalMatch.pickTeamId === modalPlayedRight?.id && rightIsPick ? rightIsLoser ? '0 0 8px 2px red' : '0 0 8px 2px #2e7d32' : '0 0 4px #000' }}>
                                                                                    {rankSticker()}
                                                                                </span>
                                                                            </span>
                                                                            <span style={{ width: 'max-content', top: '62%', zIndex: 3, }} className={css.finished_modal_team_label}>
                                                                                {getPlacementBadge(winnerIsRight, rightIsLoser)}
                                                                                <span style={{ color: '#ffffff', textShadow: currentModalMatch.pickTeamId === modalPlayedRight?.id && rightIsPick ? rightIsLoser ? '0 0 8px 2px red' : '0 0 8px 2px #2e7d32' : '0 0 4px #000' }}>
                                                                                    {modalPlayedRight?.name}
                                                                                    {rightStakeText === "path ends here, for now!" || rightStakeText === "second place is still wonderful!" ? "'s" : ""}
                                                                                </span>
                                                                                {deltaPoints !== 0 && (
                                                                                    <span style={{ color: deltaPoints > 0 ? "#2e7d32" : "red", fontWeight: 900, marginLeft: '4px' }}>
                                                                                        {deltaPoints > 0 ? `+${deltaPoints}p` : `${deltaPoints}p`}
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </span>
                                                        </div>
                                                        {renderStats(displayedRightStats, "right")}
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                top: "50%",
                                                                left: "32.5%",
                                                                width: 260,
                                                                height: 120,
                                                                borderRadius: "50%",
                                                                transform: "translate(50%, -50%)",
                                                                background: winnerIsRight ? "#91ffc1" : "#ff9191",
                                                                boxShadow: winnerIsRight ? "0 0 32px 8px #91ffc1" : "0 0 32px 8px #ff9191",
                                                                filter: "blur(42px)",
                                                                opacity: 0.75,
                                                                zIndex: 1,
                                                                pointerEvents: "none",
                                                            }}
                                                        />
                                                    </div>
                                                    {leftStakeText && (
                                                        <div
                                                            style={{
                                                                position: "relative",
                                                                zIndex: 2,
                                                                marginTop: "-24px",
                                                                marginBottom: "8px",
                                                                marginLeft: "48px",
                                                                fontSize: "13px",
                                                                fontWeight: 700,
                                                                textShadow: `
                                                                    0 0 3px ${modalPlayedLeft?.color},
                                                                    0 0 7px ${modalPlayedLeft?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `,
                                                                color: "#ffffff",
                                                                width: '216.8px',
                                                                height: 'auto',
                                                                textAlign: 'center',
                                                            }}
                                                        >
                                                            {leftStakeText}
                                                        </div>
                                                    )}
                                                    {rightStakeText && (
                                                        <div
                                                            style={{
                                                                position: "relative",
                                                                zIndex: 2,
                                                                marginTop: "-28px",
                                                                marginBottom: "8px",
                                                                marginLeft: "260px",
                                                                fontSize: "13px",
                                                                fontWeight: 700,
                                                                textShadow: `
                                                                    0 0 3px ${modalPlayedRight?.color},
                                                                    0 0 7px ${modalPlayedRight?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `,
                                                                color: "#ffffff",
                                                                width: '216.8px',
                                                                height: 'auto',
                                                                textAlign: 'center',
                                                            }}
                                                        >
                                                            {rightStakeText}
                                                        </div>
                                                    )}
                                                </div>

                                                <>
                                                    {(() => {
                                                        const historyMatch = currentModalMatch;
                                                        const history = historyMatch?.setHistory ?? [];
                                                        if (!history.length) {
                                                            return <p className={css.info_text}>No set history stored for this match.</p>;
                                                        }

                                                        const leftColor = modalPlayedLeft?.color || "#2e7d32";
                                                        const rightColor = modalPlayedRight?.color || "red";

                                                        const InfoIcon = ({
                                                            title,
                                                            children,
                                                            trigger = "hover",
                                                            customLeft = "50%"
                                                        }) => {
                                                            const [open, setOpen] = useState(false);

                                                            return (
                                                                <div
                                                                    style={{
                                                                        position: "relative",
                                                                        display: "flex",
                                                                    }}
                                                                    onMouseEnter={
                                                                        trigger === "hover"
                                                                            ? () => setOpen(true)
                                                                            : undefined
                                                                    }
                                                                    onMouseLeave={
                                                                        trigger === "hover"
                                                                            ? () => setOpen(false)
                                                                            : undefined
                                                                    }
                                                                    onClick={
                                                                        trigger === "click"
                                                                            ? (e) => {
                                                                                e.stopPropagation();
                                                                                setOpen((prev) => !prev);
                                                                            }
                                                                            : undefined
                                                                    }
                                                                >
                                                                    <FaCircleInfo
                                                                        size={11}
                                                                        style={{
                                                                            color: "Highlight",
                                                                            cursor: trigger === "click" ? "pointer" : "default",
                                                                        }}
                                                                    />

                                                                    {open && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                            exit={{ opacity: 0 }}
                                                                            transition={{ duration: 0.15 }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            style={{
                                                                                position: "absolute",
                                                                                bottom: "calc(100% + 8px)",
                                                                                left: customLeft,
                                                                                transform: "translateX(-50%)",
                                                                                background: "#fff",
                                                                                color: "#2e2f42",
                                                                                boxShadow: "0 2px 10px rgba(0,0,0,.2)",
                                                                                padding: "6px 10px",
                                                                                borderRadius: 6,
                                                                                whiteSpace: "nowrap",
                                                                                zIndex: 9999,
                                                                                fontSize: 12,
                                                                            }}
                                                                        >
                                                                            {title && (
                                                                                <>
                                                                                    <span>{title}</span>
                                                                                    <br />
                                                                                </>
                                                                            )}

                                                                            {children}
                                                                        </motion.div>
                                                                    )}
                                                                </div>
                                                            );
                                                        };

                                                        return (
                                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className={css.seriesSummary} style={{ fontSize: 13, display: "flex", alignItems: "center", width: 'max-content', margin: '0 auto' }} >
                                                                <ul
                                                                    className={css.seriesSummaryList}
                                                                    style={{
                                                                        display: "flex",
                                                                        flexDirection: "column",
                                                                        gap: "6px",
                                                                    }}
                                                                >
                                                                    {history.map(
                                                                        ({
                                                                            set,
                                                                            wins,
                                                                            losses,
                                                                            won,
                                                                            firstHalfLeft,
                                                                            firstHalfRight,
                                                                            extendedRounds = {
                                                                                firstHalf: null,
                                                                                secondHalf: null,
                                                                                overtimes: [],
                                                                            },
                                                                        }) => {
                                                                            const isDecider = set === modalBestOf;
                                                                            const label = isDecider ? "Decider" : `Set ${set}`;

                                                                            const leftGlow = won;
                                                                            const rightGlow = !won;

                                                                            const leftOpacity = won ? 1 : 0.4;
                                                                            const rightOpacity = won ? 0.4 : 1;

                                                                            const isATie = wins === losses;

                                                                            const winnerCount = won ? wins : losses;

                                                                            const finalCount = isATie ? winnerCount + 1 : winnerCount;

                                                                            const overtimeCount = Math.max(
                                                                                0,
                                                                                Math.floor((finalCount - 13) / 3)
                                                                            );

                                                                            const hasOvertime = overtimeCount > 0;

                                                                            const leftAttempts = extendedRounds?.penalties?.leftResults.length ?? 0;
                                                                            const rightAttempts = extendedRounds?.penalties?.rightResults.length ?? 0;

                                                                            const leftOtExtendedRounds =
                                                                                extendedRounds.overtimes.filter(
                                                                                    (x) => x.winner === "left"
                                                                                );

                                                                            const rightOtExtendedRounds =
                                                                                extendedRounds.overtimes.filter(
                                                                                    (x) => x.winner === "right"
                                                                                );

                                                                            const leftOtLabels =
                                                                                leftOtExtendedRounds.map((x) =>
                                                                                    getOvertimeShortLabel(x.overtime)
                                                                                );

                                                                            const rightOtLabels =
                                                                                rightOtExtendedRounds.map((x) =>
                                                                                    getOvertimeShortLabel(x.overtime)
                                                                                );

                                                                            const showLeftCheck =
                                                                                leftOtExtendedRounds.length === 1 &&
                                                                                rightOtExtendedRounds.length === 0;

                                                                            const showLeftInfo =
                                                                                !showLeftCheck &&
                                                                                leftOtExtendedRounds.length > 0;

                                                                            const showRightCheck =
                                                                                rightOtExtendedRounds.length === 1 &&
                                                                                leftOtExtendedRounds.length === 0;

                                                                            const showRightInfo =
                                                                                !showRightCheck &&
                                                                                rightOtExtendedRounds.length > 0;

                                                                            const formatRoundsCount = () => {
                                                                                const lastDigit = totalRounds % 10;

                                                                                return lastDigit === 1 ? "Round" : "Rounds";
                                                                            };

                                                                            const otLeft = hasOvertime
                                                                                ? Math.max(0, wins - 12)
                                                                                : null;

                                                                            const otRight = hasOvertime
                                                                                ? Math.max(0, losses - 12)
                                                                                : null;

                                                                            const secondHalfLeft =
                                                                                (hasOvertime ? wins - otLeft : wins) -
                                                                                firstHalfLeft;

                                                                            const secondHalfRight =
                                                                                (hasOvertime ? losses - otRight : losses) -
                                                                                firstHalfRight;

                                                                            const extendedRoundLeftScore =
                                                                                (extendedRounds.firstHalf === "left" ? 1 : 0) +
                                                                                (extendedRounds.secondHalf === "left" ? 1 : 0) +
                                                                                leftOtExtendedRounds.length;

                                                                            const extendedRoundRightScore =
                                                                                (extendedRounds.firstHalf === "right" ? 1 : 0) +
                                                                                (extendedRounds.secondHalf === "right" ? 1 : 0) +
                                                                                rightOtExtendedRounds.length;

                                                                            const hasExtendedRounds = isATie &&
                                                                                extendedRoundLeftScore + extendedRoundRightScore > 0;

                                                                            const totalRounds = wins + losses;

                                                                            const getHalfStyleLeft = (leftScore, rightScore) => {
                                                                                if (leftScore === rightScore) {
                                                                                    return {
                                                                                        opacity: 1
                                                                                    };
                                                                                }

                                                                                return {
                                                                                    opacity: leftScore > rightScore ? 1 : 0.6,
                                                                                    textShadow:
                                                                                        leftScore > rightScore
                                                                                            ? `
                                                                                                0 0 3px ${leftColor},
                                                                                                0 0 6px ${leftColor}55
                                                                                            `
                                                                                            : "none",
                                                                                };
                                                                            };

                                                                            const getHalfStyleRight = (rightScore, leftScore) => {
                                                                                if (rightScore === leftScore) {
                                                                                    return {
                                                                                        opacity: 1
                                                                                    };
                                                                                }

                                                                                return {
                                                                                    opacity: rightScore > leftScore ? 1 : 0.6,
                                                                                    textShadow:
                                                                                        rightScore > leftScore
                                                                                            ? `
                                                                                                0 0 3px ${rightColor},
                                                                                                0 0 6px ${rightColor}55
                                                                                            `
                                                                                            : "none",
                                                                                };
                                                                            };

                                                                            const erLeftStyle = hasExtendedRounds
                                                                                ? getHalfStyleLeft(
                                                                                    extendedRoundLeftScore,
                                                                                    extendedRoundRightScore
                                                                                )
                                                                                : null;

                                                                            const erRightStyle = hasExtendedRounds
                                                                                ? getHalfStyleRight(
                                                                                    extendedRoundRightScore,
                                                                                    extendedRoundLeftScore
                                                                                )
                                                                                : null;

                                                                            const firstHalfLeftStyle = getHalfStyleLeft(
                                                                                firstHalfLeft,
                                                                                firstHalfRight
                                                                            );

                                                                            const firstHalfRightStyle = getHalfStyleRight(
                                                                                firstHalfRight,
                                                                                firstHalfLeft
                                                                            );

                                                                            const secondHalfLeftStyle = getHalfStyleLeft(
                                                                                secondHalfLeft,
                                                                                secondHalfRight
                                                                            );

                                                                            const secondHalfRightStyle = getHalfStyleRight(
                                                                                secondHalfRight,
                                                                                secondHalfLeft
                                                                            );

                                                                            const otLeftStyle = hasOvertime
                                                                                ? getHalfStyleLeft(otLeft, otRight)
                                                                                : null;

                                                                            const otRightStyle = hasOvertime
                                                                                ? getHalfStyleRight(otRight, otLeft)
                                                                                : null;

                                                                            const completedSuddenDeathPairs = Math.min(
                                                                                Math.max(0, leftAttempts - 5),
                                                                                Math.max(0, rightAttempts - 5)
                                                                            );

                                                                            const totalAttempts = Math.min(leftAttempts, rightAttempts);

                                                                            const hasUnequalAttempts = leftAttempts !== rightAttempts;

                                                                            const leaderTeam =
                                                                                leftAttempts > rightAttempts
                                                                                    ? modalPlayedLeft
                                                                                    : modalPlayedRight;

                                                                            const leaderAttempts = Math.max(leftAttempts, rightAttempts);

                                                                            const modalAttemptsToDisplay =
                                                                                PENALTY_DISPLAY_CIRCLES + completedSuddenDeathPairs;

                                                                            const pensLeftStyle = extendedRounds?.penalties
                                                                                ? getHalfStyleLeft(extendedRounds?.penalties.leftScore, extendedRounds?.penalties.rightScore)
                                                                                : null;

                                                                            const pensRightStyle = extendedRounds?.penalties
                                                                                ? getHalfStyleRight(extendedRounds?.penalties.rightScore, extendedRounds?.penalties.leftScore)
                                                                                : null;

                                                                            const pensLeftWon =
                                                                                extendedRounds?.penalties &&
                                                                                extendedRounds.penalties.leftScore >
                                                                                extendedRounds.penalties.rightScore;

                                                                            const pensRightWon =
                                                                                extendedRounds?.penalties &&
                                                                                extendedRounds.penalties.rightScore >
                                                                                extendedRounds.penalties.leftScore;

                                                                            return (
                                                                                <li
                                                                                    key={set}
                                                                                    className={css.seriesSummaryItem}
                                                                                    style={{
                                                                                        display: "flex",
                                                                                        flexDirection: "row",
                                                                                        justifyContent: "center",
                                                                                        alignItems: "flex-start",
                                                                                        gap: "36px"
                                                                                    }}
                                                                                >
                                                                                    <div
                                                                                        style={{
                                                                                            display: "flex",
                                                                                            flexDirection: "column",
                                                                                            alignItems: "center",
                                                                                            minWidth: "60px",
                                                                                        }}
                                                                                    >
                                                                                        {!isBo1Modal && (
                                                                                            <span
                                                                                                className={css.round_text}
                                                                                                style={{ opacity: leftOpacity, height: "42px", marginTop: "1px" }}
                                                                                            >
                                                                                                <CountUp
                                                                                                    start={Math.max(wins - 1, 0)}
                                                                                                    end={wins}
                                                                                                    duration={1}
                                                                                                    style={{
                                                                                                        color: leftColor,
                                                                                                        fontSize: "36px",
                                                                                                        textShadow: leftGlow
                                                                                                            ? `
                                                                                                            0 0 6px ${leftColor},
                                                                                                            0 0 14px ${leftColor}66,
                                                                                                            0 2px 6px rgba(0,0,0,0.4)
                                                                                                        `
                                                                                                            : "none",
                                                                                                    }}
                                                                                                />
                                                                                            </span>
                                                                                        )}

                                                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: isBo1Modal ? "26px" : "0px" }}>
                                                                                            <span
                                                                                                className={css.info_text}
                                                                                                style={{
                                                                                                    fontSize: isBo1Modal ? "14px" : "12px",
                                                                                                    color: leftColor,
                                                                                                    opacity: firstHalfLeftStyle.opacity,
                                                                                                    textShadow: firstHalfLeftStyle.textShadow,
                                                                                                    height: isBo1Modal ? "17px" : "16px"
                                                                                                }}
                                                                                            >
                                                                                                {firstHalfLeft}
                                                                                            </span>

                                                                                            <span
                                                                                                className={css.info_text}
                                                                                                style={{
                                                                                                    fontSize: isBo1Modal ? "14px" : "12px",
                                                                                                    color: leftColor,
                                                                                                    opacity: secondHalfLeftStyle.opacity,
                                                                                                    textShadow: secondHalfLeftStyle.textShadow,
                                                                                                    height: isBo1Modal ? "17px" : "16px"
                                                                                                }}
                                                                                            >
                                                                                                {secondHalfLeft}
                                                                                            </span>

                                                                                            {hasOvertime && (
                                                                                                <span
                                                                                                    className={css.info_text}
                                                                                                    style={{
                                                                                                        fontSize: isBo1Modal ? "14px" : "12px",
                                                                                                        color: leftColor,
                                                                                                        opacity: otLeftStyle.opacity,
                                                                                                        textShadow: otLeftStyle.textShadow,
                                                                                                        height: isBo1Modal ? "17px" : "16px"
                                                                                                    }}
                                                                                                >
                                                                                                    {otLeft}
                                                                                                </span>
                                                                                            )}

                                                                                            {hasExtendedRounds && (
                                                                                                <div className={css.dashed_divider} style={{ zIndex: 3, width: "200%", marginTop: "2px", marginBottom: "2px", opacity: 0 }} />
                                                                                            )}

                                                                                            {hasExtendedRounds && (
                                                                                                <span
                                                                                                    className={css.info_text}
                                                                                                    style={{
                                                                                                        fontSize: isBo1Modal ? "14px" : "12px",
                                                                                                        color: leftColor,
                                                                                                        opacity: erLeftStyle.opacity,
                                                                                                        textShadow: erLeftStyle.textShadow,
                                                                                                        height: isBo1Modal ? "17px" : "16px",
                                                                                                    }}
                                                                                                >
                                                                                                    {extendedRoundLeftScore}
                                                                                                </span>
                                                                                            )}

                                                                                            {extendedRounds?.penalties && (
                                                                                                <span
                                                                                                    className={css.info_text}
                                                                                                    style={{
                                                                                                        fontSize: isBo1Modal ? "14px" : "12px",
                                                                                                        color: leftColor,
                                                                                                        opacity: pensLeftStyle.opacity,
                                                                                                        textShadow: pensLeftStyle.textShadow,
                                                                                                        height: isBo1Modal ? "17px" : "16px"
                                                                                                    }}
                                                                                                >
                                                                                                    {extendedRounds.penalties.leftScore}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>

                                                                                    <div
                                                                                        style={{
                                                                                            display: "flex",
                                                                                            flexDirection: "column",
                                                                                            alignItems: "center",
                                                                                            minWidth: "160px",
                                                                                        }}
                                                                                    >
                                                                                        {!isBo1Modal && (
                                                                                            <button
                                                                                                type="button"
                                                                                                className={css.gamble_button}
                                                                                                style={{ fontSize: "inherit", lineHeight: 1.1, padding: "1px 1px" }}
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setBreakdownSetIndex(set - 1);
                                                                                                }}
                                                                                            >
                                                                                                <span className={css.info_text} style={{ fontWeight: 600, color: "#ffffff" }}>
                                                                                                    {label}
                                                                                                </span>
                                                                                            </button>
                                                                                        )}

                                                                                        {isBo1Modal ? (
                                                                                            <button
                                                                                                type="button"
                                                                                                className={css.gamble_button}
                                                                                                style={{ fontSize: "inherit", lineHeight: 1.1, padding: "6px 12px", paddingBottom: "4.2px", marginTop: "-4px" }}
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setBreakdownSetIndex(set - 1);
                                                                                                }}
                                                                                            >
                                                                                                <span style={{ fontSize: "18px", textAlign: "center", color: "#ffffff" }} className={css.vs}>
                                                                                                    {totalRounds} {formatRoundsCount()}
                                                                                                </span>
                                                                                            </button>
                                                                                        ) : (
                                                                                            <span style={{ fontSize: "18px", textAlign: "center", marginTop: "-4px" }} className={css.vs}>
                                                                                                {totalRounds} {formatRoundsCount()}
                                                                                            </span>
                                                                                        )}

                                                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0px", fontSize: isBo1Modal ? "12px" : "11px" }}>
                                                                                            <div
                                                                                                style={{
                                                                                                    display: "flex",
                                                                                                    alignItems: "center",
                                                                                                    gap: 4,
                                                                                                    position: "relative"
                                                                                                }}
                                                                                            >
                                                                                                <span style={{ position: 'absolute', right: "104%", top: "1px" }}>
                                                                                                    {extendedRounds?.firstHalf === "left" && (
                                                                                                        <FaCircleCheck
                                                                                                            size={10}
                                                                                                            color="#50ff50"
                                                                                                        />
                                                                                                    )}
                                                                                                </span>

                                                                                                <span className={css.info_text}>
                                                                                                    1st Half
                                                                                                </span>

                                                                                                <span style={{ position: 'absolute', left: "109%", top: "1px" }}>
                                                                                                    {extendedRounds?.firstHalf === "right" && (
                                                                                                        <FaCircleCheck
                                                                                                            size={10}
                                                                                                            color="#50ff50"
                                                                                                        />
                                                                                                    )}
                                                                                                </span>
                                                                                            </div>

                                                                                            <div
                                                                                                style={{
                                                                                                    display: "flex",
                                                                                                    alignItems: "center",
                                                                                                    gap: 4,
                                                                                                    position: "relative"
                                                                                                }}
                                                                                            >
                                                                                                <span style={{ position: 'absolute', right: "104%", top: "1px" }}>
                                                                                                    {extendedRounds?.secondHalf === "left" && (
                                                                                                        <FaCircleCheck
                                                                                                            size={10}
                                                                                                            color="#50ff50"
                                                                                                        />
                                                                                                    )}
                                                                                                </span>

                                                                                                <span className={css.info_text}>
                                                                                                    2nd Half
                                                                                                </span>

                                                                                                <span style={{ position: 'absolute', left: "107%", top: "1px" }}>
                                                                                                    {extendedRounds?.secondHalf === "right" && (
                                                                                                        <FaCircleCheck
                                                                                                            size={10}
                                                                                                            color="#50ff50"
                                                                                                        />
                                                                                                    )}
                                                                                                </span>
                                                                                            </div>

                                                                                            {hasOvertime && (
                                                                                                <div
                                                                                                    style={{
                                                                                                        display: "flex",
                                                                                                        alignItems: "center",
                                                                                                        gap: 4,
                                                                                                        position: "relative",
                                                                                                    }}
                                                                                                >
                                                                                                    <span
                                                                                                        style={{
                                                                                                            position: "absolute",
                                                                                                            right: "107%",
                                                                                                            top: showLeftCheck ? "1px" : "2.5px",
                                                                                                        }}
                                                                                                    >
                                                                                                        {showLeftCheck ? (
                                                                                                            <FaCircleCheck
                                                                                                                size={10}
                                                                                                                color="#50ff50"
                                                                                                            />
                                                                                                        ) : showLeftInfo ? (
                                                                                                            <InfoIcon
                                                                                                                title={`Extended OT Round${leftOtLabels.length === 1 ? "" : "s"} taken in`}
                                                                                                            >
                                                                                                                {(() => {
                                                                                                                    const rows = [];

                                                                                                                    for (let i = 0; i < leftOtLabels.length; i += 5) {
                                                                                                                        rows.push(leftOtLabels.slice(i, i + 5));
                                                                                                                    }

                                                                                                                    return rows.map((row, rowIndex) => (
                                                                                                                        <React.Fragment key={rowIndex}>
                                                                                                                            {rowIndex > 0 && <br />}
                                                                                                                            {row.map((label, index) => {
                                                                                                                                const lastRow = rowIndex === rows.length - 1;
                                                                                                                                const last = lastRow && index === row.length - 1;
                                                                                                                                const secondLast = lastRow && index === row.length - 2;

                                                                                                                                return (
                                                                                                                                    <React.Fragment key={index}>
                                                                                                                                        {index > 0 && !last && ", "}
                                                                                                                                        <span style={{ fontWeight: 600 }}>
                                                                                                                                            {label}
                                                                                                                                        </span>
                                                                                                                                        {secondLast && (
                                                                                                                                            <span style={{ fontWeight: 500 }}>
                                                                                                                                                {" "}
                                                                                                                                                and{" "}
                                                                                                                                            </span>
                                                                                                                                        )}
                                                                                                                                    </React.Fragment>
                                                                                                                                );
                                                                                                                            })}
                                                                                                                        </React.Fragment>
                                                                                                                    ));
                                                                                                                })()}
                                                                                                            </InfoIcon>
                                                                                                        ) : null}
                                                                                                    </span>

                                                                                                    <span className={css.info_text}>
                                                                                                        {getOvertimeShortLabel(overtimeCount)}
                                                                                                    </span>

                                                                                                    <span
                                                                                                        style={{
                                                                                                            position: "absolute",
                                                                                                            left: "107%",
                                                                                                            top: showRightCheck ? "1px" : "2.5px",
                                                                                                        }}
                                                                                                    >
                                                                                                        {showRightCheck ? (
                                                                                                            <FaCircleCheck
                                                                                                                size={10}
                                                                                                                color="#50ff50"
                                                                                                            />
                                                                                                        ) : showRightInfo ? (
                                                                                                            <InfoIcon
                                                                                                                title={`Extended OT Round${rightOtLabels.length === 1 ? "" : "s"} taken in`}
                                                                                                            >
                                                                                                                {(() => {
                                                                                                                    const rows = [];

                                                                                                                    for (let i = 0; i < rightOtLabels.length; i += 5) {
                                                                                                                        rows.push(rightOtLabels.slice(i, i + 5));
                                                                                                                    }

                                                                                                                    return rows.map((row, rowIndex) => (
                                                                                                                        <React.Fragment key={rowIndex}>
                                                                                                                            {rowIndex > 0 && <br />}
                                                                                                                            {row.map((label, index) => {
                                                                                                                                const lastRow = rowIndex === rows.length - 1;
                                                                                                                                const last = lastRow && index === row.length - 1;
                                                                                                                                const secondLast = lastRow && index === row.length - 2;

                                                                                                                                return (
                                                                                                                                    <React.Fragment key={index}>
                                                                                                                                        {index > 0 && !last && ", "}
                                                                                                                                        <span style={{ fontWeight: 600 }}>
                                                                                                                                            {label}
                                                                                                                                        </span>
                                                                                                                                        {secondLast && (
                                                                                                                                            <span style={{ fontWeight: 500 }}>
                                                                                                                                                {" "}
                                                                                                                                                and{" "}
                                                                                                                                            </span>
                                                                                                                                        )}
                                                                                                                                    </React.Fragment>
                                                                                                                                );
                                                                                                                            })}
                                                                                                                        </React.Fragment>
                                                                                                                    ));
                                                                                                                })()}
                                                                                                            </InfoIcon>
                                                                                                        ) : null}
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                            {hasExtendedRounds && (
                                                                                                <div className={css.dashed_divider} style={{ zIndex: 3, width: "380%", marginTop: "2px", marginBottom: "2px", borderTop: "2px dashed #999" }} />
                                                                                            )}
                                                                                            {hasExtendedRounds && (
                                                                                                <div
                                                                                                    style={{
                                                                                                        display: "flex",
                                                                                                        alignItems: "center",
                                                                                                        gap: 4,
                                                                                                        position: "relative",
                                                                                                    }}
                                                                                                >
                                                                                                    <span className={css.info_text}>
                                                                                                        Extended Rounds
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                            {extendedRounds?.penalties && (
                                                                                                <div style={{ position: "relative" }}>
                                                                                                    {pensLeftWon && (
                                                                                                        <span
                                                                                                            style={{
                                                                                                                position: "absolute",
                                                                                                                right: "107%",
                                                                                                                top: "2.5px",
                                                                                                            }}
                                                                                                        >
                                                                                                            <InfoIcon
                                                                                                                title={
                                                                                                                    hasUnequalAttempts ? (
                                                                                                                        <>
                                                                                                                            <strong>{totalAttempts} full attempts</strong> taken by both teams,
                                                                                                                            <br />
                                                                                                                            <strong>{leaderAttempts}</strong> taken by{" "}
                                                                                                                            <span
                                                                                                                                style={{
                                                                                                                                    color: leaderTeam.color,
                                                                                                                                    fontWeight: 700,
                                                                                                                                }}
                                                                                                                            >
                                                                                                                                Team {leaderTeam.name}
                                                                                                                            </span>
                                                                                                                        </>
                                                                                                                    ) : (
                                                                                                                        <>
                                                                                                                            <strong>{totalAttempts} full attempts</strong> taken by both teams
                                                                                                                        </>
                                                                                                                    )
                                                                                                                }
                                                                                                                trigger="hover"
                                                                                                            >
                                                                                                                <div
                                                                                                                    style={{
                                                                                                                        display: "flex",
                                                                                                                        flexDirection: "column",
                                                                                                                        alignItems: "start",
                                                                                                                        gap: 6,
                                                                                                                    }}
                                                                                                                >
                                                                                                                    <div>
                                                                                                                        <span
                                                                                                                            style={{
                                                                                                                                color: modalPlayedLeft.color,
                                                                                                                                fontWeight: 800,
                                                                                                                                marginBottom: 4,
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            {modalPlayedLeft.name}
                                                                                                                        </span>
                                                                                                                        <PenaltyCircles
                                                                                                                            compact
                                                                                                                            resolved
                                                                                                                            team="right"
                                                                                                                            attemptsToDisplay={modalAttemptsToDisplay}
                                                                                                                            results={extendedRounds.penalties.leftResults}
                                                                                                                        />
                                                                                                                    </div>

                                                                                                                    <div>
                                                                                                                        <span
                                                                                                                            style={{
                                                                                                                                color: modalPlayedRight.color,
                                                                                                                                fontWeight: 800
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            {modalPlayedRight.name}
                                                                                                                        </span>
                                                                                                                        <PenaltyCircles
                                                                                                                            compact
                                                                                                                            resolved
                                                                                                                            team="right"
                                                                                                                            attemptsToDisplay={modalAttemptsToDisplay}
                                                                                                                            results={extendedRounds.penalties.rightResults}
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </InfoIcon>
                                                                                                        </span>
                                                                                                    )}

                                                                                                    <span style={{ marginTop: !isBo1Modal ? "1px" : "0px", display: "inline-block" }} className={css.info_text}>
                                                                                                        Penalties
                                                                                                    </span>

                                                                                                    {pensRightWon && (
                                                                                                        <span
                                                                                                            style={{
                                                                                                                position: "absolute",
                                                                                                                left: "107%",
                                                                                                                top: "2.5px",
                                                                                                            }}
                                                                                                        >
                                                                                                            <InfoIcon
                                                                                                                title={
                                                                                                                    hasUnequalAttempts ? (
                                                                                                                        <>
                                                                                                                            <strong>{totalAttempts} full attempts</strong> taken by both teams,
                                                                                                                            <br />
                                                                                                                            <strong>{leaderAttempts}</strong> taken by{" "}
                                                                                                                            <span
                                                                                                                                style={{
                                                                                                                                    color: leaderTeam.color,
                                                                                                                                    fontWeight: 700,
                                                                                                                                }}
                                                                                                                            >
                                                                                                                                Team {leaderTeam.name}
                                                                                                                            </span>
                                                                                                                        </>
                                                                                                                    ) : (
                                                                                                                        <>
                                                                                                                            <strong>{totalAttempts} full attempts</strong> taken by both teams
                                                                                                                        </>
                                                                                                                    )
                                                                                                                }
                                                                                                                trigger="hover"
                                                                                                            >
                                                                                                                <div
                                                                                                                    style={{
                                                                                                                        display: "flex",
                                                                                                                        flexDirection: "column",
                                                                                                                        alignItems: "start",
                                                                                                                        gap: 6,
                                                                                                                    }}
                                                                                                                >
                                                                                                                    <div>
                                                                                                                        <span
                                                                                                                            style={{
                                                                                                                                color: modalPlayedLeft.color,
                                                                                                                                fontWeight: 800
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            {modalPlayedLeft.name}
                                                                                                                        </span>
                                                                                                                        <PenaltyCircles
                                                                                                                            compact
                                                                                                                            resolved
                                                                                                                            team="right"
                                                                                                                            attemptsToDisplay={modalAttemptsToDisplay}
                                                                                                                            results={extendedRounds.penalties.leftResults}
                                                                                                                        />
                                                                                                                    </div>

                                                                                                                    <div>
                                                                                                                        <span
                                                                                                                            style={{
                                                                                                                                color: modalPlayedRight.color,
                                                                                                                                fontWeight: 800,
                                                                                                                                marginBottom: 4,
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            {modalPlayedRight.name}
                                                                                                                        </span>
                                                                                                                        <PenaltyCircles
                                                                                                                            compact
                                                                                                                            resolved
                                                                                                                            team="right"
                                                                                                                            attemptsToDisplay={modalAttemptsToDisplay}
                                                                                                                            results={extendedRounds.penalties.rightResults}
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </InfoIcon>
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div
                                                                                        style={{
                                                                                            display: "flex",
                                                                                            flexDirection: "column",
                                                                                            alignItems: "center",
                                                                                            minWidth: "60px",
                                                                                        }}
                                                                                    >
                                                                                        {!isBo1Modal && (
                                                                                            <span
                                                                                                className={css.round_text}
                                                                                                style={{ opacity: rightOpacity, height: "42px", marginTop: "1px" }}
                                                                                            >
                                                                                                <CountUp
                                                                                                    start={Math.max(losses - 1, 0)}
                                                                                                    end={losses}
                                                                                                    duration={1}
                                                                                                    style={{
                                                                                                        color: rightColor,
                                                                                                        fontSize: "36px",
                                                                                                        textShadow: rightGlow
                                                                                                            ? `
                                                                                                            0 0 6px ${rightColor},
                                                                                                            0 0 14px ${rightColor}66,
                                                                                                            0 2px 6px rgba(0,0,0,0.4)
                                                                                                        `
                                                                                                            : "none",
                                                                                                    }}
                                                                                                />
                                                                                            </span>
                                                                                        )}

                                                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: isBo1Modal ? "26px" : "0px" }}>
                                                                                            <span
                                                                                                className={css.info_text}
                                                                                                style={{
                                                                                                    fontSize: isBo1Modal ? "14px" : "12px",
                                                                                                    color: rightColor,
                                                                                                    opacity: firstHalfRightStyle.opacity,
                                                                                                    textShadow: firstHalfRightStyle.textShadow,
                                                                                                    height: isBo1Modal ? "17px" : "16px"
                                                                                                }}
                                                                                            >
                                                                                                {firstHalfRight}
                                                                                            </span>

                                                                                            <span
                                                                                                className={css.info_text}
                                                                                                style={{
                                                                                                    fontSize: isBo1Modal ? "14px" : "12px",
                                                                                                    color: rightColor,
                                                                                                    opacity: secondHalfRightStyle.opacity,
                                                                                                    textShadow: secondHalfRightStyle.textShadow,
                                                                                                    height: isBo1Modal ? "17px" : "16px"
                                                                                                }}
                                                                                            >
                                                                                                {secondHalfRight}
                                                                                            </span>

                                                                                            {hasOvertime && (
                                                                                                <span
                                                                                                    className={css.info_text}
                                                                                                    style={{
                                                                                                        fontSize: isBo1Modal ? "14px" : "12px",
                                                                                                        color: rightColor,
                                                                                                        opacity: otRightStyle.opacity,
                                                                                                        textShadow: otRightStyle.textShadow,
                                                                                                        height: isBo1Modal ? "17px" : "16px"
                                                                                                    }}
                                                                                                >
                                                                                                    {otRight}
                                                                                                </span>
                                                                                            )}

                                                                                            {hasExtendedRounds && (
                                                                                                <div className={css.dashed_divider} style={{ zIndex: 3, width: "200%", marginTop: "2px", marginBottom: "2px", opacity: 0 }} />
                                                                                            )}

                                                                                            {hasExtendedRounds && (
                                                                                                <span
                                                                                                    className={css.info_text}
                                                                                                    style={{
                                                                                                        fontSize: isBo1Modal ? "14px" : "12px",
                                                                                                        color: rightColor,
                                                                                                        opacity: erRightStyle.opacity,
                                                                                                        textShadow: erRightStyle.textShadow,
                                                                                                        height: isBo1Modal ? "17px" : "16px",
                                                                                                    }}
                                                                                                >
                                                                                                    {extendedRoundRightScore}
                                                                                                </span>
                                                                                            )}

                                                                                            {extendedRounds?.penalties && (
                                                                                                <span
                                                                                                    className={css.info_text}
                                                                                                    style={{
                                                                                                        fontSize: isBo1Modal ? "14px" : "12px",
                                                                                                        color: rightColor,
                                                                                                        opacity: pensRightStyle.opacity,
                                                                                                        textShadow: pensRightStyle.textShadow,
                                                                                                        height: isBo1Modal ? "17px" : "16px"
                                                                                                    }}
                                                                                                >
                                                                                                    {extendedRounds.penalties.rightScore}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </li>
                                                                            );
                                                                        }
                                                                    )}
                                                                </ul>
                                                            </motion.div>
                                                        );
                                                    })()}
                                                </>
                                            </>
                                        );
                                    })()}
                            </motion.div>
                        </div>

                        <AnimatePresence>
                            {breakdownSetIndex !== null &&
                                (() => {
                                    const {
                                        leftTeam: modalPlayedLeft,
                                        rightTeam: modalPlayedRight,
                                    } = getPickOrientedModalView(
                                        currentModalMatch,
                                        isBo1Modal
                                    );

                                    return (
                                        <SetBreakdownOverlay
                                            sets={currentModalMatch?.setHistory ?? []}
                                            index={breakdownSetIndex}
                                            onIndexChange={setBreakdownSetIndex}
                                            onClose={() => setBreakdownSetIndex(null)}
                                            leftTeam={modalPlayedLeft}
                                            rightTeam={modalPlayedRight}
                                            bestOf={modalBestOf}
                                            stageLabel={
                                                modalContext.type !== "playoffs"
                                                    ? modalStageSmallLabel
                                                    : null
                                            }
                                            matchTitle={modalTitle}
                                            matchNumber={
                                                modalContext.stage !== "gf" &&
                                                    modalContext.stage !== "thirdPlace"
                                                    ? modalMatchNumber
                                                    : null
                                            }
                                            isPlayoffs={modalContext.type === "playoffs"}
                                            pointLabelText={breakdownPointLabel}
                                        />
                                    );
                                })()}
                        </AnimatePresence>
                    </motion.div>
                )}
                {showTournamentIntro && (
                    <div className={css.intro_overlay}>
                        <div className={css.intro_content}>
                            <div className={css.fade_in}>
                                <div
                                    className={css.game_title}
                                    style={{
                                        fontSize: "44px",
                                        fontStyle: "italic",
                                        marginBottom: 18,
                                    }}
                                >
                                    {tournamentLabel}
                                </div>

                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    Auto-qualifiers for Stage III
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "50%", margin: "0 auto" }}>
                                    {leaderboard.sorted.slice(0, 16).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{ width: "48px", height: "48px" }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={css.fade_in_delay} style={{ marginTop: 22 }}>
                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    Auto-qualifiers for Stage II
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "50%", margin: "0 auto" }}>
                                    {leaderboard.sorted.slice(16, 32).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{ width: "48px", height: "48px" }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={css.fade_in_delay_more} style={{ marginTop: 22 }}>
                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    Qualifiers for Stage I
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "50%", margin: "0 auto" }}>
                                    {leaderboard.sorted.slice(32, 64).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{ width: "48px", height: "48px" }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro}>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default SpecialModePage; 