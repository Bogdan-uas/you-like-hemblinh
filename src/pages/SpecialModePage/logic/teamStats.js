import { TEAM_STATS_LS_KEY, TEAM_STATS_SNAPSHOT_LS_KEY } from "./storageKeys.js";

export const STAT_KEYS = [
    "clutch",
    "composure",
    "bigStage",
    "otStamina",
    "upsetPedigree",
    "bounceBack",
    "antiTilt",
    "finisher",
    "elimNerve",
    "unbeatenNerve",
    "battleTested",
    "topSeed",
    "streakBreaker",
    "unbeatenStreakBreaker",
];

const ALL_STAT_KEYS = [...STAT_KEYS, "momentum", "unbeatenStreak", "battleXp"];

export const STAT_DEFINITIONS = [
    { key: "clutch", label: "Clutch Factor", max: 100 },
    { key: "composure", label: "Composure", max: 100 },
    { key: "bigStage", label: "Big-Stage Pedigree", max: 100 },
    { key: "otStamina", label: "Overtime Stamina", max: 100 },
    { key: "upsetPedigree", label: "Upset Pedigree", max: 100 },
    { key: "bounceBack", label: "Bounce-Back", max: 100 },
    { key: "antiTilt", label: "Anti-Tilt", max: 100 },
    { key: "finisher", label: "Finisher", max: 100 },
    { key: "elimNerve", label: "Elimination Nerve", max: 100 },
    { key: "unbeatenNerve", label: "Unbeaten Nerve", max: 100 },
    { key: "battleTested", label: "Battle-Tested", max: 100 },
    { key: "topSeed", label: "Top-Seed Pressure", max: 100 },
    { key: "streakBreaker", label: "Streak Breaker", max: 100 },
    { key: "unbeatenStreakBreaker", label: "Unbeaten Streak Breaker", max: 100 },
];

const STATS_PER_TAB = 7;

export const STAT_TABS = Array.from(
    { length: Math.max(1, Math.ceil(STAT_DEFINITIONS.length / STATS_PER_TAB)) },
    (_, i) => STAT_DEFINITIONS.slice(i * STATS_PER_TAB, (i + 1) * STATS_PER_TAB)
);

export const UNBEATEN_STREAK_DEFINITION = { key: "unbeatenStreak", label: "Unbeaten Streak", max: 999, integer: true };

export const MANAGE_STAT_DEFINITIONS = [...STAT_DEFINITIONS, UNBEATEN_STREAK_DEFINITION];

export const DEFAULT_TEAM_STAT_VALUES = {
    clutch: 50,
    composure: 50,
    bigStage: 0,
    otStamina: 50,
    upsetPedigree: 0,
    bounceBack: 50,
    antiTilt: 50,
    finisher: 50,
    elimNerve: 50,
    unbeatenNerve: 50,
    battleTested: 0,
    topSeed: 50,
    streakBreaker: 50,
    unbeatenStreakBreaker: 50,
    momentum: 0,
    unbeatenStreak: 0,
    battleXp: 0,
};

export const clampStat = (n, min = 0, max = 100) =>
    Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));

export const buildDefaultTeamStats = (teams) => {
    const out = {};
    teams.forEach((t) => {
        out[t.id] = { ...DEFAULT_TEAM_STAT_VALUES };
    });
    return out;
};

export const loadTeamStats = (teams) => {
    try {
        const raw = localStorage.getItem(TEAM_STATS_LS_KEY);
        const out = buildDefaultTeamStats(teams);
        if (!raw) return out;
        const parsed = JSON.parse(raw);
        teams.forEach((t) => {
            const v = parsed?.[t.id];
            if (v && typeof v === "object") {
                const merged = { ...DEFAULT_TEAM_STAT_VALUES };
                ALL_STAT_KEYS.forEach((k) => {
                    if (typeof v[k] === "number" && Number.isFinite(v[k])) {
                        merged[k] = v[k];
                    }
                });
                out[t.id] = merged;
            }
        });
        return out;
    } catch {
        return buildDefaultTeamStats(teams);
    }
};

export const saveTeamStats = (stats) => {
    try {
        localStorage.setItem(TEAM_STATS_LS_KEY, JSON.stringify(stats));
    } catch {
        console.error("Couldn't save teams' stats");
    }
};

export const saveStatsSnapshot = (stats) => {
    try {
        localStorage.setItem(TEAM_STATS_SNAPSHOT_LS_KEY, JSON.stringify(stats));
    } catch {
        console.error("Couldn't set teams' stats snapshot");
    }
};

export const loadStatsSnapshot = () => {
    try {
        const raw = localStorage.getItem(TEAM_STATS_SNAPSHOT_LS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const clearStatsSnapshot = () => {
    try {
        localStorage.removeItem(TEAM_STATS_SNAPSHOT_LS_KEY);
    } catch {
        console.error("Couldn't remove teams' stats snapshot");
    }
};

export const normalizeTeamStats = (teams, source) => {
    const out = buildDefaultTeamStats(teams);
    teams.forEach((t) => {
        const v = source?.[t.id];
        if (v && typeof v === "object") {
            const merged = { ...DEFAULT_TEAM_STAT_VALUES };
            ALL_STAT_KEYS.forEach((k) => {
                if (typeof v[k] === "number" && Number.isFinite(v[k])) {
                    merged[k] = v[k];
                }
            });
            out[t.id] = { ...merged, momentum: 0 };
        }
    });
    return out;
};

export const statToInputString = (value) =>
    String(Math.round((Number(value) || 0) * 100) / 100);

export const sanitizeStatInput = (raw) => {
    let s = String(raw ?? "").replace(",", ".").replace(/[^0-9.]/g, "");
    const dot = s.indexOf(".");
    if (dot !== -1) {
        s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, "").slice(0, 2);
    }
    if (/^0\d/.test(s)) s = s.replace(/^0+(?=\d)/, "");
    return s;
};

export const parseStatInput = (value) => {
    if (value === "" || value === "." || value == null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};
