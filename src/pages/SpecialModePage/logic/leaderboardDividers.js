import { LEADERBOARD_DIVIDERS_LS_KEY } from "./storageKeys.js";
import { getPemSeriesConfig } from "./pemConfig.js";
import { PEM_BIG_STAGE2_AUTO_COUNT } from "./pemStage1.jsx";
import { GPL_STAGE2_AUTO_COUNT, GPL_TEAM_COUNT, GPL_SERIES_TEAM_COUNT } from "./gpl.js";
import { ACTIVE_TOURNAMENT_TYPE, PEM_SMALL_TYPE_ID, PEM_BIG_TYPE_ID, CST_TYPE_ID, ECL_TYPE_ID, GPL_TYPE_ID, GCC_TYPE_ID, getTournamentTypeConfig } from "./tournamentTypes.jsx";

const pemCutoffs = (type) => {
    const { mainEventCount, qualifierCount, label, secondEvent } = getPemSeriesConfig(type);
    const qualifierLabel = `${label} Qualifier`;
    return { mainEventCount, qualifierCount, label, qualifierLabel, secondLabel: getTournamentTypeConfig(secondEvent === "ecl" ? ECL_TYPE_ID : CST_TYPE_ID).label };
};

const small = pemCutoffs(PEM_SMALL_TYPE_ID);
const big = pemCutoffs(PEM_BIG_TYPE_ID);

export const LEADERBOARD_DIVIDER_SETS = [
    {
        value: ACTIVE_TOURNAMENT_TYPE,
        label: "Official (default)",
        tier: "official",
        dividers: [
            { rank: 17, above: "Autoqualifiers to Stage III", below: "Autoqualifiers to Stage II" },
            { rank: 33, above: "Autoqualifiers to Stage II", below: "Qualifiers to Stage I" },
        ],
    },
    {
        value: PEM_SMALL_TYPE_ID,
        label: small.label,
        tier: "tier1",
        dividers: [
            { rank: small.mainEventCount + 1, above: `Autoqualifiers to ${small.label}`, below: small.qualifierLabel },
            { rank: small.mainEventCount + small.qualifierCount + 1, above: small.qualifierLabel, below: small.secondLabel },
        ],
    },
    {
        value: PEM_BIG_TYPE_ID,
        label: big.label,
        tier: "tier1",
        dividers: [
            { rank: PEM_BIG_STAGE2_AUTO_COUNT + 1, above: "Autoqualifiers to Stage II", below: "Autoqualifiers to Stage I" },
            { rank: big.mainEventCount + 1, above: "Autoqualifiers to Stage I", below: big.qualifierLabel },
            { rank: big.mainEventCount + big.qualifierCount + 1, above: big.qualifierLabel, below: big.secondLabel },
        ],
    },
    {
        value: GPL_TYPE_ID,
        label: getTournamentTypeConfig(GPL_TYPE_ID).label,
        tier: "tier1",
        dividers: [
            { rank: GPL_STAGE2_AUTO_COUNT + 1, above: "Autoqualifiers to Stage II", below: "Qualifiers to Stage I" },
            { rank: GPL_TEAM_COUNT + 1, above: "Qualifiers to Stage I", below: getTournamentTypeConfig(GCC_TYPE_ID).label },
            { rank: GPL_SERIES_TEAM_COUNT + 1, above: getTournamentTypeConfig(GCC_TYPE_ID).label, below: "Teams NOT playing", notPlayingBelow: true },
        ],
    },
];

export const DEFAULT_LEADERBOARD_DIVIDERS = ACTIVE_TOURNAMENT_TYPE;
const DIVIDER_VALUES = LEADERBOARD_DIVIDER_SETS.map((set) => set.value);

export const getLeaderboardDividers = (value) =>
    (LEADERBOARD_DIVIDER_SETS.find((set) => set.value === value) ?? LEADERBOARD_DIVIDER_SETS[0]).dividers;

export const loadLeaderboardDividerSet = () => {
    try {
        const saved = localStorage.getItem(LEADERBOARD_DIVIDERS_LS_KEY);
        return DIVIDER_VALUES.includes(saved) ? saved : DEFAULT_LEADERBOARD_DIVIDERS;
    } catch {
        return DEFAULT_LEADERBOARD_DIVIDERS;
    }
};

export const saveLeaderboardDividerSet = (value) => {
    try {
        localStorage.setItem(LEADERBOARD_DIVIDERS_LS_KEY, value);
    } catch {
        console.error("Couldn't save the leaderboard dividers");
    }
};
