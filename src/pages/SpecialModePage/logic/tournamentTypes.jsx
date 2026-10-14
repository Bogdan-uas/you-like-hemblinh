import { PemSmallDescription, PemBigDescription, GplDescription } from "../components/TournamentTypeInfo.jsx";
import { TOURNAMENT_NUMBERS_LS_KEY, TOURNAMENT_PICKER_LS_KEY, CURRENT_TOURNAMENT_TYPE_LS_KEY } from "./storageKeys.js";

export const PEM_SMALL_TYPE_ID = "PEM Small Tournament";
export const PEM_BIG_TYPE_ID = "PEM Big Tournament";
export const CST_TYPE_ID = "Champions Series Tour";
export const ECL_TYPE_ID = "Elite Competition League";
export const GPL_TYPE_ID = "Global Pro League";
export const GCC_TYPE_ID = "Global Challenger Cup";

export const TOURNAMENT_TYPES = [
    {
        id: "Official",
        label: "Official",
        tier: "official",
        description: "Biggest tournament. 64 teams, seeded by the Leaderboard: places 33-64 start in Stage I, places 17-32 join in Stage II and the top 16 in Stage III. 16 teams advance from each Swiss Stage, ending in the 16-team Playoffs.",
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
];

const EVENT_TOURNAMENT_TYPES = [
    { id: CST_TYPE_ID, label: "Champions Series Tour", tier: "tier2" },
    { id: ECL_TYPE_ID, label: "Elite Competition League", tier: "tier2" },
    { id: GCC_TYPE_ID, label: "Global Challenger Cup", tier: "tier2" },
];

export const NUMBERED_TOURNAMENT_TYPES = [...TOURNAMENT_TYPES, ...EVENT_TOURNAMENT_TYPES];

export const getTournamentTypeConfig = (id) =>
    NUMBERED_TOURNAMENT_TYPES.find((type) => type.id === id) || TOURNAMENT_TYPES[0];

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

const pickRandomItem = (items) => items[Math.floor(Math.random() * items.length)];

export const pickTournamentType = (picker) => {
    if (!picker?.random) {
        const chosen = (picker?.ids ?? []).filter(isKnownTournamentType);
        if (chosen.length > 0) return pickRandomItem(chosen);
    }

    return pickRandomItem(TOURNAMENT_TYPES.map((type) => type.id));
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
