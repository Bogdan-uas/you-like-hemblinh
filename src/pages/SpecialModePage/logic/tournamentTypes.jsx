import { PemSmallDescription, PemBigDescription, GplDescription, PbsDescription, PgxDescription } from "../components/TournamentTypeInfo.jsx";
import { SKYLINES_TYPE_ID } from "./skylines.jsx";
import { TOURNAMENT_NUMBERS_LS_KEY, TOURNAMENT_PICKER_LS_KEY, TOURNAMENT_BANS_LS_KEY, CURRENT_TOURNAMENT_TYPE_LS_KEY } from "./storageKeys.js";

export const PEM_SMALL_TYPE_ID = "PEM Small Tournament";
export const PEM_BIG_TYPE_ID = "PEM Big Tournament";
export const CST_TYPE_ID = "Champions Series Tour";
export const ECL_TYPE_ID = "Elite Competition League";
export const GPL_TYPE_ID = "Global Pro League";
export const GCC_TYPE_ID = "Global Challenger Cup";
export const PBS_TYPE_ID = "Premier Bounty Series";
export const PGX_GM_TYPE_ID = "PGX Grandmasters";
export const PGX_IM_TYPE_ID = "PGX International Masters";
export const PGX_CM_TYPE_ID = "PGX Candidate Masters";

export const TOURNAMENT_TYPES = [
    {
        id: "Official",
        label: "Official",
        tier: "official",
        description: "Biggest tournament. 32 teams, seeded by the Leaderboard: places 17-32 start in Stage I, places 9-16 join in Stage II and the top 8 in Stage III. 8 teams advance from each Swiss Stage, ending in the 8-team Playoffs. Places 33-64 play the Official Skylines (Tier 2) next to it: 8 Floors of 4 teams, 4 Rounds with an elevator (1st goes up 2 Floors, 2nd up 1, 3rd down 1, 4th down 2) and a Rooftop Final for the 4 teams on the Penthouse.",
        highlightCard: true,
        fields: [
            { key: "stage1", label: "Qualifiers to Stage I", multi: true, exactCount: 32 },
            { key: "stage2Auto", label: "Auto-qualifiers for Stage II", multi: true, exactCount: 16 },
            { key: "stage3Auto", label: "Auto-qualifiers for Stage III", multi: true, exactCount: 16 },
            { key: "stage2All", label: "All teams to Stage II", multi: true, exactCount: 32 },
            { key: "stage3All", label: "All teams to Stage III", multi: true, exactCount: 32 },
            { key: "playoffs", label: "All 16 playoffs qualifiers", multi: true, exactCount: 16 },
            { key: "winner", label: "Winner", multi: false },
            { key: "second", label: "2nd place", multi: false },
            { key: "third", label: "3rd place", multi: false },
            { key: "fourth", label: "4th place", multi: false },
            { key: "rest", label: "Top 5-16", multi: true, exactCount: 12 },
        ],
    },
    {
        id: PEM_SMALL_TYPE_ID,
        label: "PEM Small Tournament",
        longLabel: "Pro Extreme Masters Small Tournament",
        tier: "tier1",
        descriptionNode: <PemSmallDescription />,
    },
    {
        id: PEM_BIG_TYPE_ID,
        label: "PEM Big Tournament",
        longLabel: "Pro Extreme Masters Big Tournament",
        tier: "tier1",
        descriptionNode: <PemBigDescription />,
    },
    {
        id: GPL_TYPE_ID,
        label: "Global Pro League",
        tier: "tier1",
        descriptionNode: <GplDescription />,
    },
    {
        id: PBS_TYPE_ID,
        label: "Premier Bounty Series",
        tier: "tier1",
        numberPrefix: "Season ",
        descriptionNode: <PbsDescription />,
    },
    {
        id: PGX_GM_TYPE_ID,
        label: "PGX Grandmasters",
        tier: "tier1",
        descriptionNode: <PgxDescription />,
    },
];

const EVENT_TOURNAMENT_TYPES = [
    { id: CST_TYPE_ID, label: "Champions Series Tour", tier: "tier2" },
    { id: ECL_TYPE_ID, label: "Elite Competition League", tier: "tier2" },
    { id: GCC_TYPE_ID, label: "Global Challenger Cup", tier: "tier2" },
    { id: SKYLINES_TYPE_ID, label: "Official Skylines", tier: "tier2" },
    { id: PGX_IM_TYPE_ID, label: "PGX International Masters", tier: "tier2" },
    { id: PGX_CM_TYPE_ID, label: "PGX Candidate Masters", tier: "qualifier" },
];

export const NUMBERED_TOURNAMENT_TYPES = [...TOURNAMENT_TYPES, ...EVENT_TOURNAMENT_TYPES];

export const getTournamentTypeConfig = (id) =>
    NUMBERED_TOURNAMENT_TYPES.find((type) => type.id === id) || TOURNAMENT_TYPES[0];

export const formatTournamentNumber = (typeId, number) =>
    `${getTournamentTypeConfig(typeId).numberPrefix ?? "#"}${number}`;

export const HALL_FORM_TOURNAMENT_TYPES = TOURNAMENT_TYPES.filter((type) => Array.isArray(type.fields));

export const loadTournamentNumbers = () => {
    try {
        const raw = localStorage.getItem(TOURNAMENT_NUMBERS_LS_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
};

export const saveTournamentNumbers = (numbers) => {
    try {
        localStorage.setItem(TOURNAMENT_NUMBERS_LS_KEY, JSON.stringify(numbers));
    } catch {
        /* ignore */
    }
};

export const ACTIVE_TOURNAMENT_TYPE = "Official";

export const DEFAULT_TOURNAMENT_PICKER = { random: true, ids: [] };

const isKnownTournamentType = (id) => TOURNAMENT_TYPES.some((type) => type.id === id);

export const loadTournamentPicker = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(TOURNAMENT_PICKER_LS_KEY) || "null");
        const ids = Array.isArray(parsed?.ids) ? parsed.ids.filter(isKnownTournamentType) : [];
        if (parsed?.random || ids.length === 0) return DEFAULT_TOURNAMENT_PICKER;
        return { random: false, ids };
    } catch {
        return DEFAULT_TOURNAMENT_PICKER;
    }
};

export const saveTournamentPicker = (picker) => {
    try {
        localStorage.setItem(TOURNAMENT_PICKER_LS_KEY, JSON.stringify(picker));
    } catch {
        console.error("Couldn't save the tournament choice");
    }
};

export const loadCurrentTournamentType = () => {
    try {
        const saved = localStorage.getItem(CURRENT_TOURNAMENT_TYPE_LS_KEY);
        return isKnownTournamentType(saved) ? saved : ACTIVE_TOURNAMENT_TYPE;
    } catch {
        return ACTIVE_TOURNAMENT_TYPE;
    }
};

export const saveCurrentTournamentType = (type) => {
    try {
        localStorage.setItem(CURRENT_TOURNAMENT_TYPE_LS_KEY, type);
    } catch {
        console.error("Couldn't save the current tournament");
    }
};

export const TOURNAMENT_BAN_ROLLS = 2;

export const TOURNAMENT_BAN_EXCEPTIONS = [
    { id: ACTIVE_TOURNAMENT_TYPE, rolls: 3 },
];

export const getTournamentBanRolls = (id) =>
    TOURNAMENT_BAN_EXCEPTIONS.find((exception) => exception.id === id)?.rolls ?? TOURNAMENT_BAN_ROLLS;

export const DEFAULT_TOURNAMENT_BANS = { bans: {}, lastEnded: null };

export const loadTournamentBans = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(TOURNAMENT_BANS_LS_KEY) || "null");
        const bans = Object.fromEntries(
            Object.entries(parsed?.bans ?? {}).filter(([id, rolls]) => isKnownTournamentType(id) && Number.isInteger(rolls) && rolls > 0)
        );
        return { bans, lastEnded: typeof parsed?.lastEnded === "string" ? parsed.lastEnded : null };
    } catch {
        return DEFAULT_TOURNAMENT_BANS;
    }
};

export const saveTournamentBans = (tournamentBans) => {
    try {
        localStorage.setItem(TOURNAMENT_BANS_LS_KEY, JSON.stringify(tournamentBans));
    } catch {
        console.error("Couldn't save the tournament bans");
    }
};

export const applyTournamentBan = (tournamentBans, id, endedKey) => {
    if (!isKnownTournamentType(id) || tournamentBans?.lastEnded === endedKey) return tournamentBans;

    const bans = Object.fromEntries(
        Object.entries(tournamentBans?.bans ?? {})
            .map(([bannedId, rolls]) => [bannedId, rolls - 1])
            .filter(([, rolls]) => rolls > 0)
    );
    const rolls = getTournamentBanRolls(id);
    if (rolls > 0) bans[id] = rolls;

    return { bans, lastEnded: endedKey };
};

export const getTournamentBanList = (tournamentBans) =>
    TOURNAMENT_TYPES
        .filter((type) => (tournamentBans?.bans?.[type.id] ?? 0) > 0)
        .map((type) => ({ type, rolls: tournamentBans.bans[type.id] }));

const pickRandomItem = (items) => items[Math.floor(Math.random() * items.length)];

export const pickTournamentType = (picker, tournamentBans = DEFAULT_TOURNAMENT_BANS) => {
    if (!picker?.random) {
        const chosen = (picker?.ids ?? []).filter(isKnownTournamentType);
        if (chosen.length > 0) return pickRandomItem(chosen);
    }

    const allIds = TOURNAMENT_TYPES.map((type) => type.id);
    const allowedIds = allIds.filter((id) => !(tournamentBans?.bans?.[id] > 0));
    return pickRandomItem(allowedIds.length > 0 ? allowedIds : allIds);
};

export const normalizeTournamentRef = (value) => {
    if (!value || typeof value !== "object") return null;

    const number = Number(value.number);
    if (!Number.isInteger(number)) return null;

    return {
        type: typeof value.type === "string" && value.type ? value.type : ACTIVE_TOURNAMENT_TYPE,
        number,
    };
};
