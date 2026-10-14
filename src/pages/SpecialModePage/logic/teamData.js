import { COLORS_ORDER_INDEX } from "./colors.js";
import { totalSecondPlaces, totalThirdPlaces } from "./placings.jsx";
import {
    TEAM_RATINGS_LS_KEY,
    DEFAULT_STATS_PANELS_STATE,
    STATS_PANELS_LS_KEY,
    STATS_PANELS_MAX_ENTRIES,
    TOURNAMENT_NUMBER_LS_KEY,
    TEAM_RATINGS_SNAPSHOT_LS_KEY,
    LEADERBOARD_SORT_LS_KEY,
    RATING_BASED_STATS_LS_KEY,
} from "./storageKeys.js";
import { STAT_KEYS, DEFAULT_TEAM_STAT_VALUES } from "./teamStats.js";

export const clampMin0 = (n) => Math.max(0, Number.isFinite(n) ? n : 0);

export const buildDefaultTeamRatings = (teams) => {
    const out = {};
    teams.forEach((t, idx) => {
        if (idx < 16) out[t.id] = 1150;
        else if (idx < 32) out[t.id] = 1100;
        else out[t.id] = 1050;
    });
    return out;
};

export const loadTeamRatings = (teams) => {
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

export const buildModalStatsKey = ({ modalContext, currentModalMatch, hallRecordId, tournamentNumber, isPlayed }) => {
    if (!modalContext || !currentModalMatch) return null;

    const teamsPart = `${currentModalMatch.slotA?.id ?? "?"}-${currentModalMatch.slotB?.id ?? "?"}`;
    const placePart =
        modalContext.type === "swiss"
            ? `${modalContext.stageKey}:${modalContext.net}`
            : modalContext.type === "qualifier"
                ? `qualifier:${modalContext.group}:${modalContext.stage}`
                : modalContext.type === "cstGroup"
                    ? `cst:${modalContext.group}`
                    : modalContext.type === "pemGroup"
                        ? `pemGroup:${modalContext.group}:${modalContext.stage}`
                        : modalContext.type === "ecl"
                            ? `ecl:${modalContext.stage}`
                            : modalContext.type === "pemStage1"
                                ? `pemStage1:${modalContext.group}:${modalContext.stage}`
                                : modalContext.type === "gccLeague"
                                    ? `gccLeague:${modalContext.matchday}`
                                    : `${modalContext.kind === "cst" ? "cstPlayoffs" : modalContext.kind === "pem" ? "pemPlayoffs" : modalContext.kind === "pemBig" ? "pemBigPlayoffs" : modalContext.kind === "gpl" ? "gplPlayoffs" : modalContext.kind === "gcc" ? "gccPlayoffs" : "playoffs"}:${modalContext.stage}`;
    const originPart = modalContext.isArchivedHallOfFame
        ? `hall:${hallRecordId ?? ""}:`
        : `t${tournamentNumber}:`;

    return `${originPart}${placePart}:${modalContext.matchId}:${teamsPart}:${isPlayed ? "finished" : "pre"}`;
};

export const toggleStatsPanelEntry = (memory, key, side) => {
    const { [key]: current, ...rest } = memory;
    const base = current ?? DEFAULT_STATS_PANELS_STATE;
    return { ...rest, [key]: { ...base, [side]: !base[side] } };
};

export const loadStatsPanelMemory = () => {
    try {
        const raw = localStorage.getItem(STATS_PANELS_LS_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
};

export const saveStatsPanelMemory = (memory) => {
    try {
        const keys = Object.keys(memory);
        const trimmed =
            keys.length > STATS_PANELS_MAX_ENTRIES
                ? Object.fromEntries(keys.slice(-STATS_PANELS_MAX_ENTRIES).map((k) => [k, memory[k]]))
                : memory;
        localStorage.setItem(STATS_PANELS_LS_KEY, JSON.stringify(trimmed));
    } catch {
        console.error("Couldn't save the stats panels state");
    }
};

export const loadTournamentNumber = () => {
    try {
        const raw = localStorage.getItem(TOURNAMENT_NUMBER_LS_KEY);
        if (raw === null) return 0;

        const parsed = parseInt(raw, 10);
        return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    } catch {
        return 0;
    }
};

export const saveTournamentNumber = (value) => {
    try {
        localStorage.setItem(TOURNAMENT_NUMBER_LS_KEY, String(value));
    } catch {
        console.error("Couldn't save the tournament number")
    }
};

export const saveTeamRatings = (ratings) => {
    try {
        localStorage.setItem(TEAM_RATINGS_LS_KEY, JSON.stringify(ratings));
    } catch {
        console.error("Couldn't save teams' ratings")
    }
};

export const saveRatingsSnapshot = (ratings) => {
    try {
        localStorage.setItem(TEAM_RATINGS_SNAPSHOT_LS_KEY, JSON.stringify(ratings));
    } catch {
        console.error("Couldn't set teams' snapshot")
    }
};

export const loadRatingsSnapshot = () => {
    try {
        const raw = localStorage.getItem(TEAM_RATINGS_SNAPSHOT_LS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const clearRatingsSnapshot = () => {
    try {
        localStorage.removeItem(TEAM_RATINGS_SNAPSHOT_LS_KEY);
    } catch {
        console.error("Couldn't remove teams' snapshot")
    }
};

export const buildLeaderboard = (teams, ratings) => {
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

export const LEADERBOARD_SORT_OPTIONS = [
    { value: "points", label: "Points (default)" },
    { value: "trophies", label: "Trophies and first places" },
    { value: "seconds", label: "Second Places" },
    { value: "thirds", label: "Third Places" },
    { value: "stats", label: "Stats" },
];

export const LEADERBOARD_SORT_VALUES = LEADERBOARD_SORT_OPTIONS.map((o) => o.value);
export const DEFAULT_LEADERBOARD_SORT = "points";
export const LEADERBOARD_RESHUFFLE_MS = 700;
export const LEADERBOARD_RESHUFFLE_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

export const loadLeaderboardSortMode = () => {
    try {
        const saved = localStorage.getItem(LEADERBOARD_SORT_LS_KEY);
        return LEADERBOARD_SORT_VALUES.includes(saved) ? saved : DEFAULT_LEADERBOARD_SORT;
    } catch {
        return DEFAULT_LEADERBOARD_SORT;
    }
};

export const saveLeaderboardSortMode = (mode) => {
    try {
        localStorage.setItem(LEADERBOARD_SORT_LS_KEY, mode);
    } catch {
        console.error("Couldn't save the leaderboard sorting");
    }
};

const getTeamStatPoints = (stats) => {
    const total = STAT_KEYS.reduce((sum, key) => {
        const value = stats?.[key];
        return sum + (Number.isFinite(value) ? value : DEFAULT_TEAM_STAT_VALUES[key] ?? 0);
    }, 0);
    return Math.round(total * 100) / 100;
};

export const getTeamStatAverage = (stats) =>
    Math.round((getTeamStatPoints(stats) / STAT_KEYS.length) * 100) / 100;

const RATING_BASED_STAT_RANGES = {
    clutch: [30, 85],
    composure: [32, 82],
    bigStage: [0, 80],
    otStamina: [38, 74],
    upsetPedigree: [8, 48],
    bounceBack: [36, 76],
    antiTilt: [34, 80],
    finisher: [30, 86],
    elimNerve: [32, 80],
    unbeatenNerve: [35, 78],
    battleTested: [10, 88],
    topSeed: [30, 84],
    streakBreaker: [36, 74],
    unbeatenStreakBreaker: [34, 72],
};

const RATING_BASED_POINTS_WEIGHT = 0.75;

export const RATING_BASED_FAR_OFF_DISTANCE = 25;

export const getRatingBasedStrength = (teamId, teams, ratings, rankById) => {
    const points = teams.map((t) => Number(ratings?.[t.id]) || 0);
    const min = Math.min(...points);
    const max = Math.max(...points);
    const own = Number(ratings?.[teamId]) || 0;
    const pointsNorm = max > min ? (own - min) / (max - min) : 0.5;

    const rank = rankById?.[teamId] ?? teams.length;
    const rankNorm = teams.length > 1 ? 1 - (rank - 1) / (teams.length - 1) : 0.5;

    const strength = RATING_BASED_POINTS_WEIGHT * pointsNorm + (1 - RATING_BASED_POINTS_WEIGHT) * rankNorm;
    return Math.max(0, Math.min(1, strength));
};

export const estimateStatsFromStrength = (strength) =>
    Object.fromEntries(
        STAT_KEYS.map((key) => {
            const [low, high] = RATING_BASED_STAT_RANGES[key] ?? [0, 100];
            return [key, Math.round(low + (high - low) * strength)];
        })
    );

export const getStatsDistance = (stats, estimate) =>
    STAT_KEYS.reduce((sum, key) => sum + Math.abs((Number(stats?.[key]) || 0) - (Number(estimate?.[key]) || 0)), 0) /
    STAT_KEYS.length;

export const loadRatingBasedStatsTeamIds = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(RATING_BASED_STATS_LS_KEY) || "{}");
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
};

export const saveRatingBasedStatsTeamIds = (ids) => {
    try {
        localStorage.setItem(RATING_BASED_STATS_LS_KEY, JSON.stringify(ids));
    } catch {
        console.error("Couldn't save the rating-based stats teams");
    }
};

export const sortLeaderboardTeams = (teams, { mode, ratings, placings, stats }) => {
    const fallbackIndexById = {};
    teams.forEach((t, i) => (fallbackIndexById[t.id] = i));

    const colorsIndex = (t) => COLORS_ORDER_INDEX[t.key] ?? fallbackIndexById[t.id] ?? 0;
    const points = (t) => ratings?.[t.id] ?? 0;

    const primaryById = {};
    teams.forEach((t) => {
        const p = placings?.[t.id];
        switch (mode) {
            case "trophies": primaryById[t.id] = (p?.wins ?? 0) * 1000000000 + ((p?.pemBigWins ?? 0) + (p?.gplWins ?? 0)) * 1000000 + (p?.tier1Wins ?? 0) * 1000 + (p?.tier2Wins ?? 0); break;
            case "seconds": primaryById[t.id] = totalSecondPlaces(p); break;
            case "thirds": primaryById[t.id] = totalThirdPlaces(p); break;
            case "stats": primaryById[t.id] = getTeamStatPoints(stats?.[t.id]); break;
            default: primaryById[t.id] = 0;
        }
    });

    return [...teams].sort((a, b) => {
        const primaryDiff = primaryById[b.id] - primaryById[a.id];
        if (primaryDiff !== 0) return primaryDiff;

        const pointsDiff = points(b) - points(a);
        if (pointsDiff !== 0) return pointsDiff;

        return colorsIndex(a) - colorsIndex(b);
    });
};

export const classifyTeamsForStages = (teams, ratings) => {
    const { sorted } = buildLeaderboard(teams, ratings);
    return {
        stage3Seeds: sorted.slice(0, 16).map((t) => ({ ...t })),
        stage2Seeds: sorted.slice(16, 32).map((t) => ({ ...t })),
        stage1Seeds: sorted.slice(32).map((t) => ({ ...t })),
    };
};

export const formatOrdinal = (n) => {
    const v = n % 100;
    if (v >= 11 && v <= 13) return `${n}th`;
    switch (n % 10) {
        case 1: return `${n}st`;
        case 2: return `${n}nd`;
        case 3: return `${n}rd`;
        default: return `${n}th`;
    }
};
