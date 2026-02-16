import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import css from "./SpecialModePage.module.css";
import Header from "../../components/Header/Header.jsx";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaTrophy } from "react-icons/fa";

const SCOREBOARD_RESET_CODE = import.meta.env.VITE_SCOREBOARD_RESET_CODE;

const STORAGE_KEY = "specialPageState_swiss_v2";
const TEAM_RATINGS_LS_KEY = "specialMode_teamRatings_v1";
const TEAM_RATINGS_SNAPSHOT_LS_KEY = "specialMode_teamRatings_snapshot_v1";
const TEAM_PLACINGS_LS_KEY = "specialMode_teamPlacings_v1";

const BASE_MAX_ROUNDS = 24;
const BASE_ROUNDS_TO_WIN = 13;
const OT_ROUNDS_TO_WIN = 4;

const MULTIPLIER_MIN = -2.0;
const MULTIPLIER_MAX = 2.0;

const MIN_NEEDED_PICKEM = 278;
const MAX_NEEDED_PICKEM = 428;
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
    { shadowAlpha = 0.55, unlitAmount = 0.7, hoverAmount = 0.5 } = {}
) => {
    const normalized = hex.toUpperCase();

    if (normalized === "#000000") {
        return {
            shadow: `0 0 10px rgba(0, 0, 0, ${shadowAlpha})`,
            color: "#000000",
            hoverOn: "#2A2A2A",
            unlitColor: "#5D5D5D",
            name,
        };
    }

    const { r, g, b } = hexToRgb(hex);
    return {
        shadow: `0 0 10px rgba(${r}, ${g}, ${b}, ${shadowAlpha})`,
        color: hex,
        hoverOn: darkenHex(hex, hoverAmount),
        unlitColor: darkenHex(hex, unlitAmount),
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
    white: makeColor("#e6e6e6ff", "White", { unlitAmount: 0.85, shadowAlpha: 0.25 }),
    gray: makeColor("#808080", "Gray"),
    teal: makeColor("#006D6F", "Teal"),


    gold: makeColor("#D4AF37", "Gold"),
    silver: makeColor("#C0C0C0", "Silver", { shadowAlpha: 0.35 }),

    navy: makeColor("#00005aff", "Navy", { unlitAmount: 0.9 }),
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

const clampMin0 = (n) => Math.max(0, Number.isFinite(n) ? n : 0);

const buildDefaultTeamRatings = (teams) => {
    const out = {};
    teams.forEach((t, idx) => {
        if (idx < 16) out[t.id] = 150;
        else if (idx < 32) out[t.id] = 100;
        else out[t.id] = 50;
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

const getRatingDeltaForMatch = ({ phase, swissStageKey, playoffsStage, bestOf, loserSetsWon }) => {
    if (phase === "swiss") {
        const isBo1 = bestOf === 1;
        if (swissStageKey === "stage1") {
            if (isBo1) return { win: 3, lose: 2 };
            return { win: 5, lose: loserSetsWon >= 1 ? 2 : 3 };
        }
        if (swissStageKey === "stage2") {
            if (isBo1) return { win: 4, lose: 2 };
            return { win: 8, lose: loserSetsWon >= 1 ? 2 : 4 };
        }
        if (swissStageKey === "stage3") {
            if (isBo1) return { win: 7, lose: 4 };
            return { win: 10, lose: loserSetsWon >= 1 ? 4 : 7 };
        }
    }

    if (phase === "playoffs") {
        if (playoffsStage === "ro16") {
            return { win: 13, lose: loserSetsWon >= 1 ? 6 : 8 };
        }
        if (playoffsStage === "qf") {
            const lose = loserSetsWon >= 2 ? 8 : loserSetsWon === 1 ? 10 : 13;
            return { win: 20, lose };
        }
        if (playoffsStage === "sf") {
            const lose =
                loserSetsWon >= 3 ? 10 :
                    loserSetsWon === 2 ? 13 :
                        loserSetsWon === 1 ? 16 : 18;
            return { win: 30, lose };
        }
        if (playoffsStage === "thirdPlace") {
            const lose =
                loserSetsWon >= 3 ? 10 :
                    loserSetsWon === 2 ? 13 :
                        loserSetsWon === 1 ? 16 : 20;
            return { win: 35, lose };
        }
        if (playoffsStage === "gf") {
            return { win: 50, lose: 0 };
        }
    }

    return { win: 0, lose: 0 };
};

const applyRatings = ({ ratings, teams, winnerId, loserId, phase, swissStageKey, swissNet, playoffsStage, bestOf, loserSetsWon }) => {
    const beforeLb = buildLeaderboard(teams, ratings);
    const beforeRankW = beforeLb.rankById[winnerId] ?? null;
    const beforeRankL = beforeLb.rankById[loserId] ?? null;

    const { win, lose } = getRatingDeltaForMatch({ phase, swissStageKey, swissNet, playoffsStage, bestOf, loserSetsWon });

    const next = { ...ratings };
    const beforePointsW = next[winnerId] ?? 0;
    const beforePointsL = next[loserId] ?? 0;

    next[winnerId] = clampMin0(beforePointsW + win);
    next[loserId] = clampMin0(beforePointsL - lose);

    const afterLb = buildLeaderboard(teams, next);
    const afterRankW = afterLb.rankById[winnerId] ?? null;
    const afterRankL = afterLb.rankById[loserId] ?? null;

    return {
        nextRatings: next,
        meta: {
            winnerId,
            loserId,
            winPoints: win,
            losePoints: lose,
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

const areRatingsAtDefault = (teams, ratings) => {
    const def = buildDefaultTeamRatings(teams);

    return teams.every((t) => {
        const cur = ratings?.[t.id] ?? 0;
        return cur === def[t.id];
    });
};

const getAllTeams64 = () => {
    const entries = Object.entries(COLORS);
    return entries.map(([key, val], idx) => ({
        id: String(idx + 1),
        key,
        name: val.name,
        color: val.color,
        hoverOn: val.hoverOn,
        unlitColor: val.unlitColor,
        shadow: val.shadow,
    }));
};

const shuffle = (array) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const SWISS_COLUMNS = [
    ["0:0"],
    ["1:0", "0:1"],
    ["2:0", "1:1", "0:2"],
    ["2:1", "1:2"],
    ["2:2"],
];

const isBo1Net = (net) => net === "0:0" || net === "1:0" || net === "0:1" || net === "1:1";
const getBestOfForSwissNet = (net) => (isBo1Net(net) ? 1 : 3);

const calcSetsToWin = (bestOf) => Math.ceil(bestOf / 2);

const swissNetTitle = (net, matchNumber) => {
    if (net === "0:0") return `Match of 0:0 net #${matchNumber}`;
    if (net === "1:0") return `Match of 1:0 net #${matchNumber}`;
    if (net === "0:1") return `Match of 0:1 net #${matchNumber}`;
    if (net === "2:0") return `2:0 net  —  Progression Match #${matchNumber}`;
    if (net === "1:1") return `Match of 1:1 net #${matchNumber}`;
    if (net === "0:2") return `0:2 net  —  Elimination Match  #${matchNumber}`;
    if (net === "2:1") return `2:1 net  —  Progression Match #${matchNumber}`;
    if (net === "1:2") return `1:2 net  —  Elimination Match  #${matchNumber}`;
    if (net === "2:2") return `2:2 net  —  Deciding Match #${matchNumber}`;
    return `Match #${matchNumber}`;
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
    wins: 0,
    losses: 0,
    qualified: false,
    eliminated: false,

    qualifiedAt: null,
    qualifiedVia: null,
    eliminatedAt: null,
    eliminatedVia: null,  
});

const buildNetMatches = (teams, stageKey, net) => {
    const [wStr, lStr] = net.split(":");
    const w = Number(wStr);
    const l = Number(lStr);

    const eligible = teams.filter(
        (t) => !t.qualified && !t.eliminated && t.wins === w && t.losses === l
    );

    const shuffled = shuffle(eligible);

    const matches = [];
    for (let i = 0; i < shuffled.length; i += 2) {
        matches.push({
            id: `${stageKey}-${net}-${i / 2 + 1}`,
            stageKey,
            net,
            matchNoInNet: i / 2 + 1,

            slotA: shuffled[i] || null,
            slotB: shuffled[i + 1] || null,

            played: false,
            scoreLeft: null,
            scoreRight: null,
            winnerTeamId: null,
            loserTeamId: null,

            pickTeamId: null,
            setHistory: [],
        });
    }

    return matches;
};

const buildSwissStage = (stageKey, teams) => {
    const stageTeams = teams.map(makeSwissTeam);
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

const resolveSwissMatchResult = (stage, match, winnerTeamId, scoreLeft, scoreRight) => {
    if (!match?.slotA || !match?.slotB) return;

    const winner = winnerTeamId === match.slotA.id ? match.slotA : match.slotB;
    const loser = winnerTeamId === match.slotA.id ? match.slotB : match.slotA;

    winner.wins += 1;
    loser.losses += 1;

    match.played = true;
    match.scoreLeft = scoreLeft;
    match.scoreRight = scoreRight;
    match.winnerTeamId = winner.id;
    match.loserTeamId = loser.id;

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
    if (stage === "qf") return 5;
    return 3;
};

const buildPlayoffsBracket = (teams16) => {
    const shuffled = shuffle(teams16);

    const ro16 = [];
    for (let i = 0; i < 8; i++) {
        ro16.push({
            id: `ro16-${i + 1}`,
            stage: "ro16",
            slotA: shuffled[i * 2],
            slotB: shuffled[i * 2 + 1],
            played: false,
            scoreLeft: null,
            scoreRight: null,
            winnerTeamId: null,
            loserTeamId: null,
            pickTeamId: null,
            setHistory: [],
        });
    }

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

    return { ro16, qf: mk("qf", 4), sf: mk("sf", 2), thirdPlace: mk("thirdPlace", 1), gf: mk("gf", 1) };
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
    if (n < 6) return { mode: "icons", n };
    return { mode: "count", n };
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

    swissMatchNumber: 1,
    playoffsMatchNumber: 1,
};

const round2 = (n) => Number(n.toFixed(2));

const TeamCircle = ({ team, dim, specialStyle = {}, showRating = false, ratingValue = 0 }) => {
    if (!team) {
        return (
            <div
                style={{
                    width: '24px',
                    height: '24px',
                    fontSize: '14px'
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
                        start={0}
                        duration={1.2}
                        end={ratingValue}
                        key={ratingValue}
                    />
                </span>
            )}
        </div>
    );
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

    const rawLeftScore = match.scoreLeft;
    const rawRightScore = match.scoreRight;

    const displayScoreLeft = shouldSwap ? rawRightScore : rawLeftScore;
    const displayScoreRight = shouldSwap ? rawLeftScore : rawRightScore;

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

    const winnerIsLeft =
        isPlayed && match.winnerTeamId && leftTeam && match.winnerTeamId === leftTeam.id;
    const winnerIsRight =
        isPlayed && match.winnerTeamId && rightTeam && match.winnerTeamId === rightTeam.id;

    const isLeftLoser =
        isPlayed && match.loserTeamId && leftTeam && match.loserTeamId === leftTeam.id;
    const isRightLoser =
        isPlayed && match.loserTeamId && rightTeam && match.loserTeamId === rightTeam.id;

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
            <div className={css.team_cell_ro32} style={{ opacity: isLeftLoser ? 0.3 : 1 }}>
                <TeamCircle team={leftTeam} />
            </div>

            <div className={css.vs_cell_ro32} style={{ textAlign: "center" }}>
                {!isPlayed || !hasScores ? (
                    <span style={{ fontSize: "12px", fontWeight: 600 }} className={css.vs_text}>
                        VS
                    </span>
                ) : (
                    <span style={{ fontSize: "12px", fontWeight: 600 }} className={css.score_text}>
                        <span
                            style={{
                                color: winnerIsLeft ? "#2e7d32" : "red",
                                fontWeight: 600,
                            }}
                        >
                            {displayScoreLeft}
                        </span>
                        <span> : </span>
                        <span
                            style={{
                                color: winnerIsRight ? "#2e7d32" : "red",
                                fontWeight: 600,
                            }}
                        >
                            {displayScoreRight}
                        </span>
                    </span>
                )}
            </div>

            <div className={css.team_cell_ro32} style={{ opacity: isRightLoser ? 0.3 : 1 }}>
                <TeamCircle team={rightTeam} />
            </div>
        </div>
    );
};

const PlaceholderRect = ({ teams, height = 264 }) => (
    <div
        className={css.placeholder_rect}
        style={{ minHeight: height }}
        title="To be determined..."
    >
        <div style={{ width: "100%", height: "max-content", display: "flex", flexWrap: "wrap", rowGap: 16.5, columnGap: 4, justifyContent: "center", alignItems: "flex-start" }}>
            {teams.map((t) => (
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

export default function SpecialModePage() {
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

    const [seriesState, setSeriesState] = useState(defaultSeriesState);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const [multiplierMin, setMultiplierMin] = useState(MULTIPLIER_MIN);
    const [multiplierMax, setMultiplierMax] = useState(MULTIPLIER_MAX);
    // eslint-disable-next-line no-unused-vars
    const [cheatMode, setCheatMode] = useState(0);

    const [neededPickemPoints, setNeededPickemPoints] = useState(() => getRandomNeededPickemPoints());
    const [finalPickemPoints, setFinalPickemPoints] = useState(0);

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
    const [showWinnerTeam, setShowWinnerTeam] = useState(false);
    const [showPodium, setShowPodium] = useState(false);
    const [showProceed, setShowProceed] = useState(false);

    const [hover, setHover] = useState(false);

    const [teamRatings, setTeamRatings] = useState(() => loadTeamRatings(allTeams));
    const teamRatingsRef = useRef(teamRatings);
    
    useEffect(() => {
        teamRatingsRef.current = teamRatings;
    }, [teamRatings]);

    const leaderboard = useMemo(() => buildLeaderboard(allTeams, teamRatings), [allTeams, teamRatings]);
    const { rankById } = leaderboard;

    const seedsByRating = useMemo(() => classifyTeamsForStages(allTeams, teamRatings), [allTeams, teamRatings]);
    const { stage3Seeds, stage2Seeds, stage1Seeds } = seedsByRating;

    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const ratingsSnapshotRef = useRef(loadRatingsSnapshot());

    const [isScoreBoardResetModalOpen, setIsScoreBoardResetModalOpen] = useState(false);
    const [isScoreBoardResetConfirmModalOpen, setIsScoreBoardResetConfirmModalOpen] = useState(false);

    const [scoreboardResetCode, setScoreboardResetCode] = useState("");

    const [teamPlacings, setTeamPlacings] = useState(() => loadTeamPlacings(allTeams));
    const teamPlacingsRef = useRef(teamPlacings);

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

    const [selectedPlacingTeamId, setSelectedPlacingTeamId] = useState(null);

    const [placingCategory, setPlacingCategory] = useState("");
    const [placingAmount, setPlacingAmount] = useState("");

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
        showIntro ||
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
        isLocked;
    const isScoreBoardResetButtonLocked =
        isScoreboardAlreadyDefault ||
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
        isLocked;

    const isReadOnlyView = viewPhase.startsWith("results_");

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            const s1 = buildSwissStage("stage1", stage1Seeds);
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
            setShowWinnerTeam(parsed.showWinnerText ?? false)
            setShowPodium(parsed.showWinnerText ?? false)
            setShowProceed(parsed.showWinnerText ?? false)
        } catch (e) {
            console.error(e);
            const s1 = buildSwissStage("stage1", stage1Seeds);
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
            showWinnerTeam,
            showPodium,
            showProceed,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [
        showIntro,
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
        showWinnerTeam,
        showPodium,
        showProceed,
    ]);

    const confirmRestart = () => {
        localStorage.removeItem(STORAGE_KEY);

        if (ratingsSnapshotRef.current) {
            setTeamRatings(ratingsSnapshotRef.current);
            teamRatingsRef.current = ratingsSnapshotRef.current;
            saveTeamRatings(ratingsSnapshotRef.current);

            ratingsSnapshotRef.current = null;
            clearRatingsSnapshot();
        }

        const s1 = buildSwissStage("stage1", stage1Seeds);
        setStage1(s1);
        setStage2(null);
        setStage3(null);
        setPlayoffs(null);

        setActivePhase("stage1");
        setViewPhase("stage1");
        setShowIntro(true);

        setSeriesState(defaultSeriesState);

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

    const resetTournamentStateWithSeeds = (seededStage1Seeds) => {
        localStorage.removeItem(STORAGE_KEY);

        const s1 = buildSwissStage("stage1", seededStage1Seeds);
        setStage1(s1);
        setStage2(null);
        setStage3(null);
        setPlayoffs(null);

        setActivePhase("stage1");
        setViewPhase("stage1");
        setShowIntro(true);

        setSeriesState(defaultSeriesState);

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
        setSelectedPlacingTeamId(null);
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

    const canConfirmPlacings = () => {
        const n = Number(placingAmount);
        return (
            !!selectedPlacingTeamId &&
            (placingCategory === "wins" || placingCategory === "seconds" || placingCategory === "thirds") &&
            Number.isFinite(n) &&
            n > 0
        );
    };

    const handleOpenAddPlacingsFinal = () => {
        if (!canConfirmPlacings()) return;
        setIsAddPlacingsModalOpen(false);
        setIsAddPlacingsFinalModalOpen(true);
    };

    const handleApplyAddPlacings = () => {
        const n = Math.max(0, Math.floor(Number(placingAmount)));
        const teamId = selectedPlacingTeamId;
        const cat = placingCategory;

        setTeamPlacings((prev) => {
            const next = { ...prev };
            const cur = next[teamId] ?? { wins: 0, seconds: 0, thirds: 0 };
            next[teamId] = { ...cur, [cat]: (cur[cat] ?? 0) + n };
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
            if (!p) return false;
            if (placingCategory === "wins") return (p.wins ?? 0) > 0;
            if (placingCategory === "seconds") return (p.seconds ?? 0) > 0;
            if (placingCategory === "thirds") return (p.thirds ?? 0) > 0;
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
        const teamId = selectedPlacingTeamId;
        const cat = placingCategory;

        setTeamPlacings((prev) => {
            const next = { ...prev };
            const cur = next[teamId] ?? { wins: 0, seconds: 0, thirds: 0 };
            next[teamId] = { ...cur, [cat]: Math.max(0, (cur[cat] ?? 0) - n) };
            saveTeamPlacings(next);
            return next;
        });

        setIsRemovePlacingsFinalModalOpen(false);
        clearPlacingsAdminState();
        toast.success("Placings updated.");
    };

    const handleTournamentStart = () => {
        setShowIntro(false);
        setShowTournamentIntro(true);
    }

    const handleCloseTournamentIntro = () => {
        setShowTournamentIntro(false);
    };

    const buildStage2IfNeeded = (s1) => {
        if (stage2) return stage2;
        const qualifiers = getSwissQualified(s1);
        const combined = [...stage2Seeds, ...qualifiers].map((t) => ({ ...t }));
        return buildSwissStage("stage2", combined);
    };

    const buildStage3IfNeeded = (s2) => {
        if (stage3) return stage3;
        const qualifiers = getSwissQualified(s2);
        const combined = [...stage3Seeds, ...qualifiers].map((t) => ({ ...t }));
        return buildSwissStage("stage3", combined);
    };

    const buildPlayoffsIfNeeded = (s3) => {
        if (playoffs) return playoffs;
        const qualifiers = getSwissQualified(s3).slice(0, 16);
        return buildPlayoffsBracket(qualifiers);
    };

    const swissMatchPoints = (match) => {
        if (!match.played || !match.pickTeamId) return 0;

        const bestOf = getBestOfForSwissNet(match.net);
        if (bestOf === 1) {
            return match.winnerTeamId === match.pickTeamId ? 1 : 0;
        }

        if (match.winnerTeamId === match.pickTeamId) return 3;

        const pickedIsLeft = match.slotA && match.pickTeamId === match.slotA.id;
        const pickedSets = pickedIsLeft ? (match.scoreLeft ?? 0) : (match.scoreRight ?? 0);
        return pickedSets >= 1 ? 2 : 0;
    };

    const playoffsMatchPoints = (match) => {
        if (!match.played || !match.pickTeamId) return 0;
        const baseMap = { ro16: 3, qf: 5, sf: 7, thirdPlace: 7, gf: 9 };
        const base = baseMap[match.stage] ?? 0;

        if (match.winnerTeamId === match.pickTeamId) return base;

        const pickedIsLeft = match.slotA && match.pickTeamId === match.slotA.id;
        const pickedSets = pickedIsLeft ? (match.scoreLeft ?? 0) : (match.scoreRight ?? 0);
        return (pickedSets || 0) * 2;
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
        };

        const applySwiss = (stg, countKey) => {
            if (!stg) return;
            Object.values(stg.matchesByNet || {}).forEach((arr) => {
                arr.forEach((m) => {
                    if (!m.played || !m.pickTeamId) return;
                    total += swissMatchPoints(m);
                    if (m.winnerTeamId === m.pickTeamId) nextCounts[countKey] += 1;
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

    const getStageObj = (key) => {
        if (key === "stage1") return stage1;
        if (key === "stage2") return stage2;
        if (key === "stage3") return stage3;
        return null;
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

        const pickedTeamId = modalLeftTeam.id;

        if (modalContext.type === "swiss") {
            const { stageKey, net, matchId } = modalContext;
            const bestOf = getBestOfForSwissNet(net);

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

    const appendSetToCurrentMatchHistory = (wins, losses, won) => {
        const setEntry = (history) => [
            ...(history || []),
            { set: (history?.length || 0) + 1, wins, losses, won },
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

        const bo1MapScore =
            isBo1 && match.setHistory && match.setHistory.length > 0
                ? { left: match.setHistory[0].wins, right: match.setHistory[0].losses }
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
            didUserWin,
            leftIsPick,
            rightIsPick,
            winnerIsLeft,
            winnerIsRight,
            leftIsLoser,
            rightIsLoser,
        };
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

    const toggleSecretGuaranteedWin = () => {
        setCheatMode((prev) => {
            const next = (prev + 1) % 3;

            if (next === 1) {
                setMultiplierMin(MULTIPLIER_MAX);
                setMultiplierMax(MULTIPLIER_MAX);
                toast("Don't tell anyone about this!!!", {
                    duration: 2000,
                    icon: "🤫",
                });
            }

            if (next === 2) {
                setMultiplierMin(MULTIPLIER_MIN);
                setMultiplierMax(MULTIPLIER_MIN);
                toast("Even the odds...", {
                    duration: 2000,
                    icon: "😈",
                });
            }

            if (next === 0) {
                setMultiplierMin(MULTIPLIER_MIN);
                setMultiplierMax(MULTIPLIER_MAX);
                toast("Secret mode disabled", {
                    duration: 2000,
                    icon: "🔓",
                });
            }

            return next;
        });
    };

    const getMultiplierClass = (mult) => {
        if (mult == null) return "";
        if (mult > 0) return seriesState.leftTeam.color;
        if (mult < 0) return seriesState.rightTeam.color;
        return '#757575';
    };

    const renderTeamLabel = (team) => {
        if (!team) return null;
        return (
            <span style={{ color: team.color || "#fff", fontWeight: 900 }}>
                Team {team.name}
            </span>
        );
    };

    const handleSeriesGamble = () => {
        if (!seriesState.active || seriesState.banner) return;

        const mult = round2(multiplierMin + Math.random() * (multiplierMax - multiplierMin));

        setIsCalculating(true);

        setTimeout(() => {
            setSeriesState((prev) => {
                if (!prev.active || prev.banner) return prev;

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
                } = prev;

                let banner = prev.banner;
                if (isOvertime) {
                    let nextMiniWins = miniWins;
                    let nextMiniLosses = miniLosses;

                    if (playerWonMini) nextMiniWins += 1;
                    else if (playerLostMini) nextMiniLosses += 1;

                    if (nextMiniWins < 5 && nextMiniLosses < 5) {
                        setIsCalculating(false);
                        return {
                            ...prev,
                            lastMultiplier: mult,
                            lastResult: resultText,
                            miniWins: nextMiniWins,
                            miniLosses: nextMiniLosses,
                        };
                    }

                    const wonOtRound = nextMiniWins >= 5;

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

                    toast(
                        <span>
                            {renderTeamLabel(wonOtRound ? prev.leftTeam : prev.rightTeam)} has won this OT round!
                        </span>,
                        { icon: "😜", duration: 2000 }
                    );

                    const otDecided =
                        updatedOtWins === OT_ROUNDS_TO_WIN || updatedOtLosses === OT_ROUNDS_TO_WIN;

                    if (otDecided) {
                        const playerWonSet = updatedOtWins > updatedOtLosses;

                        appendSetToCurrentMatchHistory(updatedRoundWins, updatedRoundLosses, playerWonSet);

                        playerWonSets += playerWonSet ? 1 : 0;
                        playerLostSets += playerWonSet ? 0 : 1;

                        const seriesOver = playerWonSets >= toWin || playerLostSets >= toWin;

                        if (seriesOver) {
                            const winner = playerWonSets > playerLostSets ? prev.leftTeam : prev.rightTeam;

                            toast(
                                <span>
                                    {toWin === 1 ? "This match has" : "This series have"} been WON in Overtime{" "}
                                    {overtimeBlock <= 1 ? "" : ` #${overtimeBlock}`} by {renderTeamLabel(winner)}!
                                </span>,
                                { icon: "🎉", duration: 4000 }
                            );

                            banner = `Team ${winner.name} has won this series!`;
                        } else {
                            toast(
                                <span>
                                    The set {playerWonSets + playerLostSets} has been won in Overtime{" "}
                                    {overtimeBlock <= 1 ? "" : `#${overtimeBlock}`} by{" "}
                                    {renderTeamLabel(playerWonSet ? prev.leftTeam : prev.rightTeam)}!
                                </span>,
                                { icon: "🤯", duration: 4000 }
                            );

                            setIsLocked(true);
                            setTimeout(() => {
                                setSeriesState((curr) => {
                                    if (!curr.active || curr.banner) return curr;
                                    setIsLocked(false);
                                    return {
                                        ...curr,
                                        roundWins: 0,
                                        roundLosses: 0,
                                        roundNumber: 1,
                                        setNumber: curr.setNumber + 1,
                                        miniWins: 0,
                                        miniLosses: 0,
                                        isOvertime: false,
                                        overtimeBlock: 0,
                                        otWins: 0,
                                        otLosses: 0,
                                    };
                                });
                            }, 4000);
                        }

                        setIsCalculating(false);

                        return {
                            ...prev,
                            lastMultiplier: mult,
                            lastResult: resultText,
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
                            banner,
                        };
                    }

                    if (otTiedBlock) {
                        const msg =
                            overtimeBlock === 1
                                ? "Overtime is tied 3-3! Starting new overtime block..."
                                : overtimeBlock === 2
                                    ? "Another overtime block tied 3-3! Starting new overtime block..."
                                    : overtimeBlock === 3
                                        ? "That's a tough battle we got here! Yet another overtime block tied 3-3! Starting new overtime block..."
                                        : "A tie again! Impressing! Starting new overtime block...";

                        toast(msg, { icon: "🔄", duration: 4000 });

                        setIsLocked(true);
                        setTimeout(() => {
                            setSeriesState((curr) => {
                                if (!curr.active || curr.banner) return curr;
                                setIsLocked(false);
                                return {
                                    ...curr,
                                    isOvertime: true,
                                    overtimeBlock: (curr.overtimeBlock || 1) + 1,
                                    roundNumber: 1,
                                    otWins: 0,
                                    otLosses: 0,
                                    miniWins: 0,
                                    miniLosses: 0,
                                };
                            });
                        }, 4000);

                        setIsCalculating(false);

                        return {
                            ...prev,
                            lastMultiplier: mult,
                            lastResult: resultText,
                            playerWonSets,
                            playerLostSets,
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
                        };
                    }

                    setIsCalculating(false);

                    return {
                        ...prev,
                        lastMultiplier: mult,
                        lastResult: resultText,
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
                        banner,
                    };
                }

                let nextMiniWins = miniWins;
                let nextMiniLosses = miniLosses;

                if (playerWonMini) nextMiniWins += 1;
                else if (playerLostMini) nextMiniLosses += 1;

                if (nextMiniWins < 5 && nextMiniLosses < 5) {
                    setIsCalculating(false);
                    return {
                        ...prev,
                        lastMultiplier: mult,
                        lastResult: resultText,
                        miniWins: nextMiniWins,
                        miniLosses: nextMiniLosses,
                    };
                }

                const playerWonRound = nextMiniWins >= 5;
                roundWins += playerWonRound ? 1 : 0;
                roundLosses += playerWonRound ? 0 : 1;
                roundNumber += 1;

                miniWins = 0;
                miniLosses = 0;

                toast(
                    <span>
                        {renderTeamLabel(playerWonRound ? prev.leftTeam : prev.rightTeam)} has won this round!
                    </span>,
                    { icon: "😜", duration: 2000 }
                );

                if (roundWins === 12 && roundLosses === 12) {
                    toast(`Overtime coming in for this ${toWin === 1 ? "match" : "set"}! 🔥`, {
                        icon: "⚔️",
                        duration: 4000,
                    });

                    setIsLocked(true);
                    setTimeout(() => {
                        setSeriesState((curr) => {
                            if (!curr.active || curr.banner) return curr;
                            setIsLocked(false);
                            return {
                                ...curr,
                                isOvertime: true,
                                overtimeBlock: curr.overtimeBlock ? curr.overtimeBlock + 1 : 1,
                                otWins: 0,
                                otLosses: 0,
                                roundNumber: 1,
                                miniWins: 0,
                                miniLosses: 0,
                            };
                        });
                    }, 4000);

                    setIsCalculating(false);

                    return {
                        ...prev,
                        lastMultiplier: mult,
                        lastResult: resultText,
                        playerWonSets,
                        playerLostSets,
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
                    };
                }

                const setShouldEnd =
                    roundWins >= BASE_ROUNDS_TO_WIN ||
                    roundLosses >= BASE_ROUNDS_TO_WIN ||
                    roundWins + roundLosses >= BASE_MAX_ROUNDS;

                if (setShouldEnd) {
                    const playerWonSet = roundWins > roundLosses;

                    appendSetToCurrentMatchHistory(roundWins, roundLosses, playerWonSet);

                    playerWonSets += playerWonSet ? 1 : 0;
                    playerLostSets += playerWonSet ? 0 : 1;

                    const seriesOver = playerWonSets >= toWin || playerLostSets >= toWin;

                    if (seriesOver) {
                        const winner = playerWonSets > playerLostSets ? prev.leftTeam : prev.rightTeam;

                        toast(
                            <span>
                                {toWin === 1 ? "This match has" : "This series have"} been WON by {renderTeamLabel(winner)}!
                            </span>,
                            { icon: "🎉", duration: 4000 }
                        );

                        banner = `Team ${winner.name} has won this series!`;
                    } else {
                        toast(
                            <span>
                                The set {playerWonSets + playerLostSets} has been won by{" "}
                                {renderTeamLabel(playerWonSet ? prev.leftTeam : prev.rightTeam)}!
                            </span>,
                            { icon: "🤯", duration: 4000 }
                        );

                        setIsLocked(true);
                        setTimeout(() => {
                            setSeriesState((curr) => {
                                if (!curr.active || curr.banner) return curr;
                                setIsLocked(false);
                                return {
                                    ...curr,
                                    roundWins: 0,
                                    roundLosses: 0,
                                    roundNumber: 1,
                                    setNumber: curr.setNumber + 1,
                                    miniWins: 0,
                                    miniLosses: 0,
                                    isOvertime: false,
                                    overtimeBlock: 0,
                                    otWins: 0,
                                    otLosses: 0,
                                };
                            });
                        }, 4000);
                    }
                }

                setIsCalculating(false);

                return {
                    ...prev,
                    lastMultiplier: mult,
                    lastResult: resultText,
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
                    banner,
                };
            });
        }, 50);
    };

    useEffect(() => {
        if (!seriesState.banner) return;

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

        const t = setTimeout(() => {
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
                const bestOf = getBestOfForSwissNet(swissNet);

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
        }, 2500);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seriesState.banner]);

    useEffect(() => {
        if (!showWinnersScreen || !tournamentResults) return;
    
        setShowWinnerText(true);
    
        const t1 = setTimeout(() => setShowWinnerTeam(true), 1000);
        const t2 = setTimeout(() => setShowPodium(true), 2000);
        const t3 = setTimeout(() => setShowProceed(true), 3000);
    
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [showWinnersScreen, tournamentResults]);

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

        if (neededPickemPoints !== 67 && finalPickemPoints === 67) {
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
        const btnStyle = { marginRight: 10, marginBottom: 10 };
        if (viewPhase === "stage2") {
            return (
                <div style={{ position: "absolute", top: '10%', right: '95%', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <button className={css.gamble_button} style={btnStyle} onClick={() => setViewPhase("results_stage1")}>
                        To results of Stage I
                    </button>
                </div>
            );
        }
        if (viewPhase === "results_stage1") {
            const backTarget =
                activePhase === "stage2" ? "stage2" :
                    activePhase === "stage3" ? "stage3" :
                        activePhase === "playoffs" ? "playoffs" : "stage1";

            const label =
                backTarget === "stage2" ? "Back to Stage II" :
                    backTarget === "stage3" ? "Back to Stage III" :
                        backTarget === "playoffs" ? "Back to Playoffs" : "Back";

            return (
                <div style={{ position: "absolute", top: '10%', right: '95%', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <button className={css.gamble_button} style={btnStyle} onClick={() => setViewPhase(backTarget)}>
                        {label}
                    </button>
                </div>
            );
        }
        if (viewPhase === "stage3") {
            return (
                <div style={{ position: "absolute", top: '10%', right: '95%', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <button className={css.gamble_button} style={btnStyle} onClick={() => setViewPhase("results_stage1")}>
                        To results of Stage I
                    </button>
                    <button className={css.gamble_button} style={btnStyle} onClick={() => setViewPhase("results_stage2")}>
                        To results of Stage II
                    </button>
                </div>
            );
        }

        if (viewPhase === "results_stage2") {
            const backTarget =
                activePhase === "stage3" ? "stage3" :
                    activePhase === "playoffs" ? "playoffs" : "stage2";

            const label =
                backTarget === "stage3" ? "Back to Stage III" :
                    backTarget === "playoffs" ? "Back to Playoffs" : "Back to Stage II";

            return (
                <div style={{ position: "absolute", top: '10%', right: '95%', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <button className={css.gamble_button} style={btnStyle} onClick={() => setViewPhase(backTarget)}>
                        {label}
                    </button>
                </div>
            );
        }
        if (viewPhase === "playoffs") {
            return (
                <div style={{ position: "absolute", top: '10%', right: '102%', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <button className={css.gamble_button} style={btnStyle} onClick={() => setViewPhase("results_stage1")}>
                        To results of Stage I
                    </button>
                    <button className={css.gamble_button} style={btnStyle} onClick={() => setViewPhase("results_stage2")}>
                        To results of Stage II
                    </button>
                    <button className={css.gamble_button} style={btnStyle} onClick={() => setViewPhase("results_stage3")}>
                        To results of Stage III
                    </button>
                </div>
            );
        }

        if (viewPhase === "results_stage3") {
            return (
                <div style={{ position: "absolute", top: '10%', right: '95%', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <button className={css.gamble_button} style={btnStyle} onClick={() => setViewPhase("playoffs")}>
                        Back to Playoffs
                    </button>
                </div>
            );
        }

        return null;
    };

    const swissToRender = (() => {
        if (viewPhase === "stage1" || viewPhase === "results_stage1") return stage1;
        if (viewPhase === "stage2" || viewPhase === "results_stage2") return stage2;
        if (viewPhase === "stage3" || viewPhase === "results_stage3") return stage3;
        return null;
    })();

    const getStageTitleForView = () => {
        if (viewPhase === "stage1") return "Stage I";
        if (viewPhase === "stage2") return "Stage II";
        if (viewPhase === "stage3") return "Stage III";
        if (viewPhase === "playoffs") return "Playoffs";

        if (viewPhase === "results_stage1") return "Stage I";
        if (viewPhase === "results_stage2") return "Stage II";
        if (viewPhase === "results_stage3") return "Stage III";
        return "";
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
        if (modalContext.type === "swiss") return getBestOfForSwissNet(modalContext.net);
        return getBestOfForPlayoffs(modalContext.stage);
    }, [modalContext]);

    const isBo1Modal = modalBestOf === 1;
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
                                                isClickable={isClickable}
                                                isButtonLocked={!unlocked || isMatchRectLocked}
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
            <div style={{ position: "relative", display: "flex", marginBottom: '48px', marginLeft: '156px', alignItems: "center", justifyContent: "center" }}>
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

                <div style={{ display: "flex", gap: 60, alignItems: "center", paddingRight: 250 }}>
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

        const renderMatch = (m, stageKey, idx, baseClass) => {
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
            
            const resultClass = isPlayed ? (isUserWin ? css.match_win : css.match_loss) : "";

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

            return (
                <div
                    key={m.id}
                    className={`${baseClass} ${resultClass} ${isCurrent ? css.match_current : ""} ${isNext ? css.match_next : ""}`}
                    style={{
                        pointerEvents: !isClickable || isMatchRectLocked ? "none" : "auto",
                    }}
                    onClick={() => openPlayoffsMatchModal(stageKey, m.id, isReadOnlyView)}
                >
                    <div className={css.match_content}>
                        <div className={css.team_cell} style={{ opacity: isLeftLoser ? 0.3 : 1 }}>
                            {leftTeam ? (
                                <div
                                    className={css.team_circle}
                                    style={{ background: leftTeam.color }}
                                    title={`Team ${leftTeam.name}`}
                                />
                            ) : (
                                <div className={css.placeholder_circle}>?</div>
                            )}
                        </div>

                        <div className={css.vs_cell}>
                            {!isPlayed || m.scoreLeft == null || m.scoreRight == null ? (
                                <span className={css.vs_text}>VS</span>
                            ) : (
                                <span className={css.score_text}>
                                    <span style={{ color: winnerIsLeft ? "#2e7d32" : "red", fontWeight: 600 }}>
                                        {displayScoreLeft}
                                    </span>
                                    <span> : </span>
                                    <span style={{ color: winnerIsRight ? "#2e7d32" : "red", fontWeight: 600 }}>
                                        {displayScoreRight}
                                    </span>
                                </span>
                            )}
                        </div>

                        <div className={css.team_cell} style={{ opacity: isRightLoser ? 0.3 : 1 }}>
                            {rightTeam ? (
                                <div
                                    className={css.team_circle}
                                    style={{ background: rightTeam.color }}
                                    title={`Team ${rightTeam.name}`}
                                />
                            ) : (
                                <div className={css.placeholder_circle}>?</div>
                            )}
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className={css.bracket_container}>
                <div className={css.bracket_inner}>
                    <div className={css.column_container}>
                        <h4 className={css.column_title}>Round of 16</h4>
                        <div className={css.columnRo16}>
                            {playoffs.ro16.map((m, idx) =>
                                renderMatch(
                                    m,
                                    "ro16",
                                    idx,
                                    idx % 2 === 0 ? css.match_rect_down : css.match_rect
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
                                    idx % 2 === 0 ? css.quarters_rect_down : css.quarters_rect
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
                                    idx % 2 === 0 ? css.semis_rect_down : css.semis_rect
                                )
                            )}
                        </div>
                    </div>

                    <div className={css.column_container}>
                        <h4 className={css.column_title}>Grand Final</h4>
                        <div className={css.columnGrandFinal}>
                            {playoffs.gf.map((m, idx) =>
                                renderMatch(m, "gf", idx, css.grandFinal_rect)
                            )}
                        </div>
                    </div>

                    {playoffs.thirdPlace && (
                        <div className={css.thirdPlace_container}>
                            <h4 style={{ width: '17ch' }} className={css.column_title}>Third Place Decider</h4>
                            <div className={css.columnThirdPlace}>
                                {playoffs.thirdPlace.map((m, idx) =>
                                    renderMatch(m, "thirdPlace", idx, css.thirdPlace_rect)
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const modalTitle = useMemo(() => {
        if (!modalContext) return "";
        if (modalContext.type === "swiss") {
            const no = currentModalMatch?.matchNoInNet ?? 1;
            return swissNetTitle(modalContext.net, no);
        }
        const stageText = stageLabelPlayoffs(modalContext.stage);
        const index = (playoffs?.[modalContext.stage] || []).findIndex((m) => m.id === modalContext.matchId);
        const num = index >= 0 ? index + 1 : 1;
        return `${stageText}${modalContext.stage !== "gf" && modalContext.stage !== "thirdPlace" ? ` #${num}` : ""}`;
    }, [modalContext, currentModalMatch, playoffs]);

    const modalStageSmallLabel = useMemo(() => {
        if (!modalContext) return "";
        if (modalContext.type === "playoffs") return "";
        if (modalContext.stageKey === "stage1") return "Stage I";
        if (modalContext.stageKey === "stage2") return "Stage II";
        if (modalContext.stageKey === "stage3") return "Stage III";
        return "";
    }, [modalContext]);
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
            small = "";
            big = `${stageLabelPlayoffs(seriesState.playoffsStage)} ${seriesState.playoffsStage !== "gf" && seriesState.playoffsStage !== "thirdPlace" ? `#${seriesState.playoffsMatchNumber || 1}` : ""}`;
        } else if (seriesState.phase === "stage1") {
            small = "Stage I";
            big = swissNetTitle(seriesState.swissNet, seriesState.swissMatchNumber || 1);
        } else if (seriesState.phase === "stage2") {
            small = "Stage II";
            big = swissNetTitle(seriesState.swissNet, seriesState.swissMatchNumber || 1);
        } else if (seriesState.phase === "stage3") {
            small = "Stage III";
            big = swissNetTitle(seriesState.swissNet, seriesState.swissMatchNumber || 1);
        }

        return (
            <>
                <span className={css.series_label}>
                    <span className={css.series_label} style={{ textAlign: "center", margin: '0' }}>
                        <span className={css.round_text} style={{ fontSize: "20px" }}>{seriesState.phase !== "playoffs" ? small : null}</span>
                        <div className={css.round_text} style={{ fontSize: "30px" }}>{big}</div>
                    </span>
                    <span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className={css.round_text}
                        style={{ fontSize: "28px" }}
                    >
                        Best of {setsToWin * 2 - 1}
                    </span>
                    {setsToWin !== 1 && !seriesBanner && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.round_text}
                            style={{ fontSize: "28px" }}
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
                    )}
                </span>
            </>
        );
    }, [seriesState]);

    const finalPickemPointsWithoutLosses = guessedCounts.stage1 + guessedCounts.stage2 + guessedCounts.stage3 + guessedCounts.ro16 * 3 + guessedCounts.qf * 5 + guessedCounts.sf * 7 + guessedCounts.tpd * 7 + guessedCounts.gf * 9;

    if (showPickemSummary) {
        return (
            <div className={css.page_wrapper}>
                <div className={css.game_container}>
                    <p className={css.info_text} style={{ marginBottom: "24px", fontSize: '32px', fontWeight: '700', textAlign: 'center', width: '680px' }}>
                        {buildPickemSentence()} <br />
                        {finalPickemPoints - finalPickemPointsWithoutLosses !== 0 && (
                            <span style={{ color: "#d4cebaff", fontWeight: "700" }}>
                                <span style={{ fontWeight: '800' }}>+{finalPickemPoints - finalPickemPointsWithoutLosses}</span> {' '}
                                Pick&apos;em point{finalPickemPoints - finalPickemPointsWithoutLosses === 1 ? '' : 's'} from correctly guessed sets in not guessed matches
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

    if (showWinnersScreen && tournamentResults) {
        return (
            <div className={css.winnerScreen}>
                {showWinnerText && (
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className={css.winnerHeadline}
                    >
                        And the winner of this tournament is
                    </motion.h2>
                )}

                {showWinnerTeam && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className={css.winnerMain}
                    >
                        <div
                            className={css.winnerLogo}
                            style={{
                                backgroundColor: tournamentResults.winner.color,
                                boxShadow: tournamentResults.winner.shadow,
                            }}
                        />
                        <div className={css.winnerName}>
                            🥇Team {tournamentResults.winner.name}
                        </div>
                    </motion.div>
                )}

                {showPodium && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className={css.podium}
                    >
                        <div style={{ marginBottom: '24px' }} className={css.podiumRow}>
                            <span style={{ fontSize: '22px' }} className={css.placeLabel}>RunnerUp</span>
                            <div style={{ flexDirection: 'column' }} className={css.placeTeam}>
                                <div
                                    className={css.placeLogo}
                                    style={{
                                        backgroundColor: tournamentResults.runnerUp.color,
                                        boxShadow: tournamentResults.runnerUp.shadow,
                                        width: '80px',
                                        height: '80px'
                                    }}
                                />
                                <span className={css.runnerUpName}>
                                    🥈Team {tournamentResults.runnerUp.name}
                                </span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            {tournamentResults.thirdPlace && (
                                <div style={{ flexDirection: 'column', marginBottom: '48px' }} className={css.podiumRow}>
                                    <span style={{ fontSize: '18px' }} className={css.placeLabel}>3rd place</span>
                                    <div
                                        className={css.placeLogo}
                                        style={{ background: tournamentResults.thirdPlace.color }}
                                    />
                                    <span className={css.podium_name}>
                                        🥉Team {tournamentResults.thirdPlace.name}
                                    </span>
                                </div>
                            )}

                            {tournamentResults.fourthPlace && (
                                <div className={css.podiumRow}>
                                    <span className={css.placeLabel}>4th place</span>
                                    <div
                                        className={css.placeLogoSmall}
                                        style={{ background: tournamentResults.fourthPlace.color }}
                                    />
                                    <span className={css.podium_name}>
                                        🏅Team {tournamentResults.fourthPlace.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {showProceed && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className={css.gamble_button}
                        onClick={handleProceed}
                    >
                        Proceed
                    </motion.button>
                )}
            </div>
        );
    }

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

        return (
            <>
                <Header
                    setIsRestartModalOpen={() => setIsRestartModalOpen(true)}
                    setIsTerminateModalOpen={() => setIsTerminateModalOpen(true)}
                    isButtonLocked={isButtonLocked}
                />
                <div className={css.series_container}>
                    <button
                        type="button"
                        onClick={toggleSecretGuaranteedWin}
                        className={css.gamble_button}
                        style={{
                            position: "absolute",
                            top: "-30%",
                            left: "36.5%",
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
                    {!banner && (
                        <div className={css.game_info_text}>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className={css.round_text}
                            >
                                Round{" "}
                                <CountUp
                                    key={roundWins + roundLosses + 1}
                                    start={Math.max(
                                        roundWins + roundLosses,
                                        0
                                    )}
                                    end={roundWins + roundLosses + 1}
                                    duration={1}
                                />
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className={css.round_text}
                                style={{ textAlign: "center", fontSize: "16px", marginBottom: "12px" }}
                            >
                                First to {overtimeTarget}
                            </motion.span>
                            {isOvertime && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className={css.round_text}
                                    style={{ textAlign: "center", fontSize: "24px", marginTop: '-12px' }}
                                >
                                    Overtime #{overtimeBlock === 0 ? 1 : overtimeBlock}
                                    <br />
                                </motion.span>
                            )}
                        </div>
                    )}

                    <div className={css.scoreboard}>
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
                                        textShadow: seriesState.leftTeam?.shadow,
                                        marginBottom: "4px",
                                        marginLeft: setsToWin === 4 || setsToWin === 5 ? '0' : '16px',
                                        marginTop: "-28px"
                                    }}
                                >
                                    {setsToWin === 1 ? "MATCH" : "SERIES"} POINT!!!
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
                                            textShadow: seriesState.leftTeam?.shadow,
                                            marginBottom: "4px",
                                            marginLeft: setsToWin === 4 || setsToWin === 5 ? '0' : '16px',
                                            marginTop: "-28px"
                                        }}
                                    >
                                        Set point!
                                    </motion.span>
                                )
                            )}
                            {setsToWin <= 3 && !banner ? (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    style={{
                                        color: seriesState.leftTeam?.color,
                                        transition: "all 500ms ease-in-out",
                                    }} className={css.team_name_left}>
                                    Team {seriesState.leftTeam?.name}
                                </motion.span>
                            ) : null}

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row-reverse",
                                    alignItems: "center",
                                    gap: "20px",
                                    opacity: loserOpacity === "win" ? 0.4 : 1,
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", flexDirection: 'column' }}>
                                    <span className={css.round_text}>
                                        <CountUp
                                            key={roundWins}
                                            start={Math.max(roundWins - 1, 0)}
                                            end={roundWins}
                                            duration={1}
                                            style={{
                                                color: seriesState.leftTeam?.color,
                                                fontSize: "45px",
                                                transition: "all 2000ms ease-in-out",
                                                textShadow:
                                                    roundWins === overtimeTarget
                                                        ? seriesState.leftTeam?.shadow
                                                        : "none",
                                            }}
                                        />
                                    </span>
                                    <div className={css.lines}>
                                        {setsToWin === 3 ? (
                                            <>
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        style={{ width: "16px", backgroundColor: playerWonSets >= i + 1 ? seriesState.leftTeam?.color : seriesState.leftTeam?.unlitColor, boxShadow: playerWonSets >= i + 1 ? seriesState.leftTeam?.shadow : '' }}
                                                        className={css.line}
                                                    />
                                                ))}
                                            </>
                                        ) : setsToWin === 2 ? (
                                            <>
                                                {[...Array(2)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        style={{ backgroundColor: playerWonSets >= i + 1 ? seriesState.leftTeam?.color : seriesState.leftTeam?.unlitColor, boxShadow: playerWonSets >= i + 1 ? seriesState.leftTeam?.shadow : '' }}
                                                        className={css.line}
                                                    />
                                                ))}
                                            </>
                                        ) : setsToWin === 1 ? (
                                            <div
                                                style={{ backgroundColor: playerWonSets >= 1 ? seriesState.leftTeam?.color : seriesState.leftTeam?.unlitColor, boxShadow: playerWonSets >= 1 ? seriesState.leftTeam?.shadow : '' }}
                                                className={css.line}
                                            />
                                        ) : null}
                                    </div>
                                </div>
                                {!banner && (
                                    <div className={css.miniSquares}>
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={css.square}
                                                style={{
                                                    backgroundColor:
                                                        i < miniWins
                                                            ? seriesState.leftTeam?.color
                                                            : seriesState.leftTeam?.unlitColor,
                                                    boxShadow:
                                                        i < miniWins
                                                            ? seriesState.leftTeam?.shadow
                                                            : 'none',
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className={css.verticalLines}>
                                    {setsToWin === 5 ? (
                                        <>
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    style={{ height: "12px", backgroundColor: playerWonSets >= i + 1 ? seriesState.leftTeam?.color : seriesState.leftTeam?.unlitColor, boxShadow: playerWonSets >= i + 1 ? seriesState.leftTeam?.shadow : '' }}
                                                    className={css.verticalLine}
                                                />
                                            ))}
                                        </>
                                    ) : setsToWin === 4 ? (
                                        <>
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    style={{ height: "14px", backgroundColor: playerWonSets >= i + 1 ? seriesState.leftTeam?.color : seriesState.leftTeam?.unlitColor, boxShadow: playerWonSets >= i + 1 ? seriesState.leftTeam?.shadow : '' }}
                                                    className={css.verticalLine}
                                                />
                                            ))}
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                                {!banner && setsToWin === 4 || setsToWin === 5 ? (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        style={{
                                            color: seriesState.leftTeam?.color,
                                            transition: "all 500ms ease-in-out",
                                            margin: '0',
                                            position: 'absolute',
                                            right: '110%',
                                            zIndex: 9999,
                                            fontSize: '28px',
                                        }} className={css.team_name_left}>
                                        Team {seriesState.leftTeam?.name}
                                    </motion.span>
                                ) : null}
                            </div>
                        </div>
                        {banner ? (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className={css.round_text}
                            >
                                {banner}
                            </motion.span>
                        ) : (
                            <p style={{ marginTop: setsToWin === 4 || setsToWin === 5 ? '0' : '24px' }} className={css.vs}>
                                VS
                            </p>
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
                                        textShadow: seriesState.rightTeam?.shadow,
                                        marginBottom: "4px",
                                        marginRight: setsToWin === 4 || setsToWin === 5 ? '0' : '16px',
                                        marginTop: "-28px"
                                    }}
                                >
                                    {setsToWin === 1 ? "MATCH" : "SERIES"} POINT!!!
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
                                            textShadow: seriesState.rightTeam?.shadow,
                                            marginBottom: "4px",
                                            marginRight: setsToWin === 4 || setsToWin === 5 ? '0' : '16px',
                                            marginTop: "-28px"
                                        }}
                                    >
                                        Set point!
                                    </motion.span>
                                )
                            )}
                            {setsToWin <= 3 && !banner ? (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    style={{
                                        color: seriesState.rightTeam?.color,
                                        transition: "all 500ms ease-in-out",
                                    }} className={css.team_name_right}>
                                    Team {seriesState.rightTeam?.name}
                                </motion.span>
                            ) : null}

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "20px",
                                    opacity: loserOpacity === "loss" ? 0.4 : 1,
                                    position: 'relative'
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        flexDirection: 'column',
                                    }}
                                >
                                    <span className={css.round_text}>
                                        <CountUp
                                            key={roundLosses}
                                            start={Math.max(roundLosses - 1, 0)}
                                            end={roundLosses}
                                            duration={1}
                                            style={{
                                                color: seriesState.rightTeam?.color,
                                                fontSize: "45px",
                                                transition: "all 2000ms ease-in-out",
                                                textShadow:
                                                    roundLosses === overtimeTarget
                                                        ? seriesState.rightTeam?.shadow
                                                        : "none",
                                            }}
                                        />
                                    </span>
                                    <div className={css.lossLines}>
                                        {setsToWin === 3 ? (
                                            <>
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        style={{ width: "16px", backgroundColor: playerLostSets >= i + 1 ? seriesState.rightTeam?.color : seriesState.rightTeam?.unlitColor, boxShadow: playerLostSets >= i + 1 ? seriesState.rightTeam?.shadow : '' }}
                                                        className={css.line}
                                                    />
                                                ))}
                                            </>
                                        ) : setsToWin === 2 ? (
                                            <>
                                                {[...Array(2)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        style={{ backgroundColor: playerLostSets >= i + 1 ? seriesState.rightTeam?.color : seriesState.rightTeam?.unlitColor, boxShadow: playerLostSets >= i + 1 ? seriesState.rightTeam?.shadow : '' }}
                                                        className={css.line}
                                                    />
                                                ))}
                                            </>
                                        ) : setsToWin === 1 ? (
                                            <div
                                                style={{ backgroundColor: playerLostSets >= 1 ? seriesState.rightTeam?.color : seriesState.rightTeam?.unlitColor, boxShadow: playerLostSets >= 1 ? seriesState.rightTeam?.shadow : '' }}
                                                className={`${css.line} ${playerLostSets >= 1
                                                    ? css.lineLoss
                                                    : css.lineDarkLoss
                                                    }`}
                                            />
                                        ) : null}
                                    </div>
                                </div>
                                {!banner && (
                                    <div className={css.miniSquares} style={{ flexDirection: 'row-reverse' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={css.lossSquare}
                                                style={{
                                                    backgroundColor:
                                                        i < miniLosses
                                                            ? seriesState.rightTeam?.color
                                                            : seriesState.rightTeam?.unlitColor,
                                                    boxShadow:
                                                        i < miniLosses
                                                            ? seriesState.rightTeam?.shadow
                                                            : 'none'
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className={css.verticalLossLines}>
                                    {setsToWin === 5 ? (
                                        <>
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    style={{ height: "12px", backgroundColor: playerLostSets >= i + 1 ? seriesState.rightTeam?.color : seriesState.rightTeam?.unlitColor, boxShadow: playerLostSets >= i + 1 ? seriesState.rightTeam?.shadow : '' }}
                                                    className={css.verticalLine}
                                                />
                                            ))}
                                        </>
                                    ) : setsToWin === 4 ? (
                                        <>
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    style={{ height: "14px", backgroundColor: playerLostSets >= i + 1 ? seriesState.rightTeam?.color : seriesState.rightTeam?.unlitColor, boxShadow: playerLostSets >= i + 1 ? seriesState.rightTeam?.shadow : '' }}
                                                    className={css.verticalLine}
                                                />
                                            ))}
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                                {!banner && setsToWin === 4 || setsToWin === 5 ? (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        style={{
                                            color: seriesState.rightTeam?.color,
                                            transition: "all 500ms ease-in-out",
                                            margin: '0',
                                            position: 'absolute',
                                            left: '110%',
                                            zIndex: 9999,
                                            fontSize: '28px',
                                        }} className={css.team_name_right}>
                                        Team {seriesState.rightTeam?.name}
                                    </motion.span>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className={css.seriesGambleMessage}>
                        {seriesState.lastResult && (
                            <>
                                <p className={css.seriesResultMessage}>
                                    {seriesState.lastResult}
                                </p>
                
                                <span
                                    className={css.seriesMultiplier}
                                    style={{ color: getMultiplierClass(seriesState.lastMultiplier), transition: 'none' }}
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
                                onClick={handleSeriesGamble}
                            >
                                Gamble
                            </button>
                        </div>
                    )}
                </div>
                {isRestartModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            Are you sure you want to restart the game?
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

    return (
        <>
            <Header
                setIsRestartModalOpen={() => setIsRestartModalOpen(true)}
                setIsTerminateModalOpen={() => setIsTerminateModalOpen(true)}
                setIsScoreBoardOpen={() => setIsLeaderboardOpen(false)}
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
            />

            <div className={css.page_container} style={{ position: "relative" }}>
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
                    <div className={css.bracket_container} style={{ position: "relative" }}>
                        {renderResultsNav()}

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

                        <div style={{ marginTop: 64 }}>
                            <div className={css.stage_title}>
                                {getStageTitleForView()}
                            </div>

                            {viewPhase === "playoffs" ? renderPlayoffsBracket() : renderSwissBracket(swissToRender)}
                        </div>
                    </div>
                )}

                {isRestartModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            Are you sure you want to restart the game?
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
                    <div className={css.restart_modal} style={{ width: "520px", top: '17.5%' }}>
                        <p className={css.restart_text} style={{ marginBottom: 12 }}>
                            Add tournament placings
                        </p>

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
                                {allTeams.map((t) => {
                                    const isSelected = selectedPlacingTeamId === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setSelectedPlacingTeamId(t.id)}
                                            style={{
                                                width: 37.2,
                                                height: 37.2,
                                                boxShadow: isSelected ? `0 0 12px ${t.unlitColor}` : "none",
                                                border: isSelected ? `2px solid ${t.unlitColor}` : "2px solid #999",
                                                background: t.color,
                                            }}
                                            className={css.team_circle_ro32}
                                            title={`Team ${t.name}`}
                                        />
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
                                    setSelectedPlacingTeamId(null);
                                }}
                            >
                                <option value=""></option>
                                <option value="wins">🏆</option>
                                <option value="seconds">🥈</option>
                                <option value="thirds">🥉</option>
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
                    <div className={css.restart_modal} style={{ width: "520px", top: '17.5%' }}>
                        <p className={css.restart_text} style={{ marginBottom: 12 }}>
                            Remove tournament placings
                        </p>

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
                                    {getTeamsForRemovePicker().map((t) => {
                                        const isSelected = selectedPlacingTeamId === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setSelectedPlacingTeamId(t.id)}
                                                style={{
                                                    width: 37.2,
                                                    height: 37.2,
                                                    boxShadow: isSelected ? `0 0 12px ${t.unlitColor}` : "none",
                                                    border: isSelected ? `2px solid ${t.unlitColor}` : "2px solid #999",
                                                    background: t.color,
                                                }}
                                                className={css.team_circle_ro32}
                                                title={`Team ${t.name}`}
                                            />
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
                                    setSelectedPlacingTeamId(null);
                                }}
                            >
                                <option value=""></option>
                                <option value="wins">🏆</option>
                                <option value="seconds">🥈</option>
                                <option value="thirds">🥉</option>
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
                    <div
                        className={css.match_modal_overlay}
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) {
                                closeMatchModal();
                            }
                        }}
                    >
                        <div
                            className={css.match_modal}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className={isPlayedModal
                                    ? didUserWin
                                        ? css.match_win
                                        : css.match_loss
                                    : ""
                                }
                                style={{ paddingTop: '12px', paddingBottom: '12px', borderTopRightRadius: '12px', borderTopLeftRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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

                            <hr style={{ margin: '0' }} className={css.match_modal_divider} />

                            {!isPlayedModal && !modalContext.readOnly && (
                                <>
                                    
                                    <p className={css.match_modal_prompt}>
                                        Which team you'd pick?
                                    </p>
                                    <div className={css.match_modal_row}>
                                        <button
                                            type="button"
                                            className={`${css.modal_team_btn} ${hasChosen ? css.modal_team_selected : ""
                                                }`}
                                            onClick={handleChooseLeft}
                                        >
                                            <div
                                                className={css.modal_team_circle}
                                                style={{ background: modalLeftTeam?.color }}
                                            >
                                                <span style={{ color: '#ffffff', textShadow: `0 0 4px #000` }} className={css.modal_team_rating}>
                                                    <CountUp
                                                        start={0}
                                                        duration={1.2}
                                                        end={teamRatings[modalLeftTeam?.id] ?? 0}
                                                        key={teamRatings[modalLeftTeam?.id] ?? 0}
                                                    />
                                                </span>
                                            </div>
                                            <span className={css.modal_team_label}>
                                                ({formatOrdinal(rankById[modalLeftTeam?.id] || 64)}) <br />
                                                Team {modalLeftTeam?.name}
                                            </span>
                                        </button>

                                        <p className={css.modal_vs}>VS</p>

                                        <button
                                            type="button"
                                            className={css.modal_team_btn}
                                            onClick={handleChooseRight}
                                        >
                                            <div
                                                className={css.modal_team_circle}
                                                style={{ background: modalRightTeam?.color }}
                                            >
                                                <span style={{ color: '#ffffff', textShadow: `0 0 4px #000` }} className={css.modal_team_rating}>
                                                    <CountUp
                                                        start={0}
                                                        duration={1.2}
                                                        end={teamRatings[modalRightTeam?.id] ?? 0}
                                                        key={teamRatings[modalRightTeam?.id] ?? 0}
                                                    />
                                                </span>
                                            </div>
                                            <span className={css.modal_team_label}>
                                                ({formatOrdinal(rankById[modalRightTeam?.id] || 64)}) <br />
                                                Team {modalRightTeam?.name}
                                            </span>
                                        </button>
                                    </div>

                                    <hr className={css.match_modal_divider} />

                                    <div style={{ textAlign: "center" }}>
                                        <button
                                            className={`${css.gamble_button} ${!hasChosen ? css.locked : ""}`}
                                            disabled={!hasChosen}
                                            onClick={handleStartMatch}
                                        >
                                            Start Match
                                        </button>
                                    </div>
                                </>
                            )}

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
                                        rightIsPick
                                    } = getPickOrientedModalView(currentModalMatch, isBo1Modal);

                                    return (
                                        <>
                                            <div className={css.finishedMatchReview}>
                                                <div
                                                    style={{ marginBottom: isBo1Modal ? 0 : "10px" }}
                                                    className={css.match_modal_row}
                                                >
                                                    <div
                                                        className={css.modal_team_btn}
                                                        style={{
                                                            flex: 1,
                                                            opacity: leftIsLoser ? 0.4 : 1,
                                                            pointerEvents: "none",
                                                        }}
                                                    >
                                                        <TeamCircle team={modalPlayedLeft} showRating ratingValue={currentModalMatch?.ratingMeta?.after?.[modalPlayedLeft?.id]?.points ?? (teamRatings[modalPlayedLeft?.id] ?? 0)} specialStyle={{ width: '52px', height: '52px', border: '3px solid #999' }} />
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

                                                                return (
                                                                    <>
                                                                        ({formatOrdinal(afterRank)}
                                                                        {deltaPlaces !== 0 && (
                                                                            <span style={{ color: deltaPlaces > 0 ? "#2e7d32" : "red", fontWeight: 900 }}>
                                                                                {" "}{deltaPlaces > 0 ? `+${deltaPlaces}` : `${deltaPlaces}`}
                                                                            </span>
                                                                        )}) <br />
                                                                        {" "}Team {modalPlayedLeft?.name}{" "}
                                                                        {deltaPoints !== 0 && (
                                                                            <span style={{ color: deltaPoints > 0 ? "#2e7d32" : "red", fontWeight: 900 }}>
                                                                                {deltaPoints > 0 ? `+${deltaPoints}p` : `${deltaPoints}p`}
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                            {currentModalMatch.pickTeamId === modalPlayedLeft?.id && leftIsPick && (
                                                                <div style={{ color: "#2e7d32", fontWeight: 'bold' }}>(Your pick)</div>
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className={css.modal_vs}>
                                                        <span style={{ color: winnerIsLeft ? "#2e7d32" : "red" }}>
                                                            {modalDisplayScoreLeft}
                                                        </span>
                                                        <span> : </span>
                                                        <span style={{ color: winnerIsRight ? "#2e7d32" : "red" }}>
                                                            {modalDisplayScoreRight}
                                                        </span>
                                                    </div>

                                                    <div
                                                        className={css.modal_team_btn}
                                                        style={{
                                                            flex: 1,
                                                            opacity: rightIsLoser ? 0.25 : 1,
                                                            pointerEvents: "none",
                                                        }}
                                                    >
                                                        <TeamCircle team={modalPlayedRight} showRating ratingValue={currentModalMatch?.ratingMeta?.after?.[modalPlayedRight?.id]?.points ?? (teamRatings[modalPlayedRight?.id] ?? 0)} specialStyle={{ width: '52px', height: '52px' }} />
                                                        <span className={css.modal_team_label}>
                                                            {(() => {
                                                                const meta = currentModalMatch?.ratingMeta;
                                                                const id = modalPlayedRight?.id;
                                                                const afterRank = meta?.after?.[id]?.rank ?? (rankById[id] ?? 64);
                                                                const beforeRank = meta?.before?.[id]?.rank ?? afterRank;
                                                                const deltaPlaces = beforeRank - afterRank;
                                                                const afterPoints = meta?.after?.[id]?.points ?? (teamRatings[id] ?? 0);
                                                                const beforePoints = meta?.before?.[id]?.points ?? afterPoints;
                                                                const deltaPoints = afterPoints - beforePoints;

                                                                return (
                                                                    <>
                                                                        ({formatOrdinal(afterRank)}
                                                                        {deltaPlaces !== 0 && (
                                                                            <span style={{ color: deltaPlaces > 0 ? "#2e7d32" : "red", fontWeight: 900 }}>
                                                                                {" "}{deltaPlaces > 0 ? `+${deltaPlaces}` : `${deltaPlaces}`}
                                                                            </span>
                                                                        )}) <br />
                                                                        {" "}Team {modalPlayedRight?.name}{" "}
                                                                        {deltaPoints !== 0 && (
                                                                            <span style={{ color: deltaPoints > 0 ? "#2e7d32" : "red", fontWeight: 900 }}>
                                                                                {deltaPoints > 0 ? `+${deltaPoints}p` : `${deltaPoints}p`}
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                            {currentModalMatch.pickTeamId === modalPlayedRight?.id && rightIsPick && (
                                                                <div style={{ color: "#2e7d32", fontWeight: 'bold' }}>(Your pick)</div>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {!isBo1Modal && (
                                                <>
                                                    <hr className={css.match_modal_divider} />

                                                    {(() => {
                                                        const historyMatch = currentModalMatch;
                                                        const history = historyMatch?.setHistory ?? [];
                                                        if (!history.length) {
                                                            return <p className={css.info_text}>No set history stored for this match.</p>;
                                                        }
                                                        
                                                        const leftColor = modalPlayedLeft?.color || "#2e7d32";
                                                        const rightColor = modalPlayedRight?.color || "red";
                                                        
                                                        return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className={css.seriesSummary} style={{ fontSize: 13, opacity: 0.95 }} >
                                                            <ul className={css.seriesSummaryList}>
                                                                {history.map(({ set, wins, losses, won }) => {
                                                                    const isDecider = set === modalBestOf;
                                                                    const label = isDecider ? "Decider" : `Set ${set}`;
                                                                    const leftOpacity = won ? 1 : 0.2;
                                                                    const rightOpacity = won ? 0.2 : 1;
                                                                    return (
                                                                        <li key={set} style={{ fontSize: "20px" }} className={css.seriesSummaryItem} >
                                                                            <span className={`${css.multiplier_win} ${label === "Decider" ? css.leftSpecial : css.left}`}
                                                                                style={{ color: leftColor, fontWeight: 700, opacity: leftOpacity }} >
                                                                                {wins}
                                                                            </span>
                                                                            &nbsp; &nbsp; &nbsp;
                                                                            <span className={css.info_text} style={{ fontWeight: 600 }}>
                                                                                {label}
                                                                            </span>
                                                                            &nbsp; &nbsp; &nbsp;
                                                                            <span className={`${css.multiplier_fail} ${label === "Decider" ? css.rightSpecial : css.right}`}
                                                                                style={{ color: rightColor, fontWeight: 700, opacity: rightOpacity }} >
                                                                                {losses}
                                                                            </span>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </motion.div >
                                                        );
                                                    })()}
                                                </>
                                            )}
                                        </>
                                    );
                                })()}
                        </div>
                    </div>
                )}
                {isLeaderboardOpen && (
                    <div
                        className={css.page_container}
                        style={{ position: "fixed", background: "#fff", overflow: "auto", zIndex: 100 }}
                    >
                        <div className={css.leaderboard_header}>
                            <div style={{ fontSize: "40px", textShadow: "0 0 4px #000" }} className={css.game_title}>
                                Leaderboard
                            </div>
                        </div>

                        <div className={css.leaderboard_list}>
                            {leaderboard.sorted.map((t, i) => {
                                const rank = i + 1;
                                const rating = teamRatings[t.id] ?? 0;

                                const rankSticker = rank === 1 ? (
                                    <span style={{ fontSize: "32px", color: 'gold' }} className={css.leaderboard_rank}>
                                        1st
                                    </span>
                                ) : rank === 2 ?
                                    <span style={{ fontSize: "32px", color: 'silver' }} className={css.leaderboard_rank}>
                                        2nd
                                    </span>
                                    : rank === 3 ?
                                        <span style={{ fontSize: "32px", color: '#cd7f32' }} className={css.leaderboard_rank}>
                                            3rd
                                        </span>
                                        : null;
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
                                            ? css.runnerUpName
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

                                        <div key={t.id} className={css.leaderboard_row} style={{ ...rowStyle, position: rank > 10 ? 'relative' : 'static' }}>
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
                                                                <FaTrophy />:{trophyDisplay.n}
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                                <span style={{ fontSize: rank <= 3 ? "32px" : "16px", marginRight: rank <= 3 ? "4px" : "0px" }} className={css.leaderboard_rank}>
                                                    {rankSticker ?? formatOrdinal(rank)}
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
                )}
                {showTournamentIntro && (
                    <div className={css.intro_overlay}>
                        <div className={css.intro_content}>
                            <div className={css.fade_in}>
                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    Autoqualifiers for Stage III
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
                                    Autoqualifiers for Stage II
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