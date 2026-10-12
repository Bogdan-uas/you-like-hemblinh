import {
    buildBracketRoutes,
    makeBracketMatch,
    canOpenBracketMatch,
    findCurrentBracketMatch,
    findNextBracketMatch,
    advanceBracket,
    getMatchWinnerTeam,
    bracketMatchPoints,
} from "./brackets.js";
import { getPemSeriesConfig } from "./pemConfig.js";
import { bracketOrder } from "./playoffs.js";
import { buildLeaderboard } from "./teamData.js";
import { toBaseTeam } from "./teams.js";
import { PEM_SMALL_TYPE_ID } from "./tournamentTypes.jsx";

export const buildPemSeeds = (teams, ratings, type = PEM_SMALL_TYPE_ID) => {
    const { mainEventCount, qualifierCount, secondEvent } = getPemSeriesConfig(type);
    const { sorted } = buildLeaderboard(teams, ratings);
    const qualifierEnd = mainEventCount + qualifierCount;
    return {
        mainEvent: sorted.slice(0, mainEventCount).map(toBaseTeam),
        qualifier: sorted.slice(mainEventCount, qualifierEnd).map(toBaseTeam),
        [secondEvent]: sorted.slice(qualifierEnd).map(toBaseTeam),
    };
};

export const splitQualifierGroups = (qualifierTeams) => ({
    A: qualifierTeams.filter((_, i) => i % 2 === 0),
    B: qualifierTeams.filter((_, i) => i % 2 === 1),
});

export const QUALIFIER_GROUPS = ["A", "B"];

export const QUALIFIER_STAGE_ORDER = ["uo", "uqf", "lr1", "lr2", "lr3", "usf", "lsf", "lf", "uf", "cf"];

export const QUALIFIER_STAGE_SIZES = { uo: 8, uqf: 4, lr1: 4, lr2: 4, lr3: 2, usf: 2, lsf: 2, lf: 1, uf: 1, cf: 1 };

export const QUALIFIER_STAGE_LABELS = {
    uo: "Opening Round",
    uqf: "Upper Quarterfinal",
    usf: "Upper Semifinal",
    uf: "Upper Final",
    lr1: "Lower Round 1",
    lr2: "Lower Round 2",
    lr3: "Lower Round 3",
    lsf: "Lower Semifinal",
    lf: "Lower Final",
    cf: "Consolidation Final",
};

export const QUALIFIER_COLUMN_TITLES = {
    uo: "Opening Round",
    uqf: "Upper Quarterfinals",
    usf: "Upper Semifinals",
    uf: "Upper Final",
    lr1: "Lower Round 1",
    lr2: "Lower Round 2",
    lr3: "Lower Round 3",
    lsf: "Lower Semifinals",
    lf: "Lower Final",
    cf: "Consolidation Final",
};

export const QUALIFIER_UPPER_STAGES = ["uo", "uqf", "usf", "uf"];
export const QUALIFIER_ELIMINATION_STAGES = ["lr1", "lr2", "lr3", "lsf", "lf", "cf"];
export const QUALIFIER_QUALIFYING_STAGES = ["uf", "cf"];

export const QUALIFIER_BATTLE_STAKES = { uo: 0.2, uqf: 0.3, lr1: 0.2, lr2: 0.3, lr3: 0.35, usf: 0.4, lsf: 0.45, lf: 0.5, uf: 0.55, cf: 0.6 };
export const QUALIFIER_RATING_WEIGHTS = { uo: 1.08, uqf: 1.2, lr1: 1.04, lr2: 1.12, lr3: 1.16, usf: 1.28, lsf: 1.24, lf: 1.36, uf: 1.37, cf: 1.3 };

const QUALIFIER_MIN_NEEDED_PICKEM = 111;
const QUALIFIER_MAX_NEEDED_PICKEM = 182;

export const getRandomQualifierNeededPickemPoints = () =>
    Math.floor(Math.random() * (QUALIFIER_MAX_NEEDED_PICKEM - QUALIFIER_MIN_NEEDED_PICKEM + 1)) +
    QUALIFIER_MIN_NEEDED_PICKEM;

export const qualifierStageLabel = (stage) => QUALIFIER_STAGE_LABELS[stage] ?? "";

export const isSingleQualifierStage = (stage) => QUALIFIER_STAGE_SIZES[stage] === 1;

export const getBestOfForQualifier = (stage) => (stage === "uf" || stage === "cf" ? 5 : 3);

export const qualifierSlotSource = (stage, idx, slotKey) => {
    const second = slotKey === "slotB";
    switch (stage) {
        case "uqf": return { stage: "uo", idx: idx * 2 + (second ? 1 : 0), want: "winner" };
        case "usf": return { stage: "uqf", idx: idx * 2 + (second ? 1 : 0), want: "winner" };
        case "uf": return { stage: "usf", idx: second ? 1 : 0, want: "winner" };
        case "lr1": return { stage: "uo", idx: idx * 2 + (second ? 1 : 0), want: "loser" };
        case "lr2": return second ? { stage: "uqf", idx, want: "loser" } : { stage: "lr1", idx, want: "winner" };
        case "lr3": return { stage: "lr2", idx: idx * 2 + (second ? 1 : 0), want: "winner" };
        case "lsf": return second ? { stage: "usf", idx, want: "loser" } : { stage: "lr3", idx, want: "winner" };
        case "lf": return { stage: "lsf", idx: second ? 1 : 0, want: "winner" };
        case "cf": return second ? { stage: "uf", idx: 0, want: "loser" } : { stage: "lf", idx: 0, want: "winner" };
        default: return null;
    }
};

const QUALIFIER_ROUTES = buildBracketRoutes(QUALIFIER_STAGE_ORDER, QUALIFIER_STAGE_SIZES, qualifierSlotSource);

const makeQualifierMatch = (group, stage, idx) => makeBracketMatch(`q${group}-${stage}-${idx + 1}`, group, stage);

const buildQualifierGroupBracket = (group, teams16) => {
    const bracket = { group, teams: teams16.map(toBaseTeam) };

    QUALIFIER_STAGE_ORDER.forEach((stage) => {
        bracket[stage] = Array.from(
            { length: QUALIFIER_STAGE_SIZES[stage] },
            (_, i) => makeQualifierMatch(group, stage, i)
        );
    });

    bracketOrder.forEach(([a, b], i) => {
        bracket.uo[i].slotA = bracket.teams[a] ?? null;
        bracket.uo[i].slotB = bracket.teams[b] ?? null;
    });

    return bracket;
};

export const buildQualifier = (groups) =>
    Object.fromEntries(QUALIFIER_GROUPS.map((group) => [group, buildQualifierGroupBracket(group, groups[group] || [])]));

export const canOpenQualifierMatch = (bracket, stage, idx) => canOpenBracketMatch(QUALIFIER_STAGE_ORDER, bracket, stage, idx);

export const findCurrentQualifierMatch = (bracket) => findCurrentBracketMatch(QUALIFIER_STAGE_ORDER, bracket);

export const findNextQualifierMatch = (bracket, current) => findNextBracketMatch(QUALIFIER_STAGE_ORDER, bracket, current);

export const advanceQualifierBracket = (bracket, stage, idx, winner, loser) =>
    advanceBracket(QUALIFIER_ROUTES, bracket, stage, idx, winner, loser);

const isQualifierGroupFinished = (bracket) => !!bracket?.cf?.[0]?.played;

export const isQualifierFinished = (qualifier) =>
    !!qualifier && QUALIFIER_GROUPS.every((group) => isQualifierGroupFinished(qualifier[group]));

export const getQualifierGroupQualifiers = (bracket) =>
    [getMatchWinnerTeam(bracket?.uf?.[0]), getMatchWinnerTeam(bracket?.cf?.[0])].filter(Boolean);

export const getQualifierMatches = (qualifier) =>
    QUALIFIER_GROUPS.flatMap((group) =>
        QUALIFIER_STAGE_ORDER.flatMap((stage) => qualifier?.[group]?.[stage] || [])
    );

export const qualifierMatchPoints = (match) => bracketMatchPoints(match, getBestOfForQualifier(match?.stage));

export const QUALIFIER_PICKEM_ROUNDS = [
    { stage: "uo", label: "Opening Rounds" },
    { stage: "uqf", label: "Upper Quarterfinals" },
    { stage: "lr1", label: "Lower Rounds 1" },
    { stage: "lr2", label: "Lower Rounds 2" },
    { stage: "lr3", label: "Lower Rounds 3" },
    { stage: "usf", label: "Upper Semifinals" },
    { stage: "lsf", label: "Lower Semifinals" },
    { stage: "lf", label: "Lower Finals" },
    { stage: "uf", label: "Upper Finals" },
    { stage: "cf", label: "Consolidation Finals" },
].map((round) => ({
    ...round,
    key: `q_${round.stage}`,
    total: QUALIFIER_STAGE_SIZES[round.stage] * QUALIFIER_GROUPS.length,
}));

export const getQualifierStakeTexts = (stage) => {
    switch (stage) {
        case "uo": return { winner: <>goes to <b>Upper Quarterfinals</b></>, loser: <>drops to <b>Lower Round 1</b></> };
        case "uqf": return { winner: <>goes to <b>Upper Semifinals</b></>, loser: <>drops to <b>Lower Round 2</b></> };
        case "usf": return { winner: <>goes to the <b>Upper Final</b></>, loser: <>drops to <b>Lower Semifinals</b></> };
        case "uf": return { winner: <><b>qualifies</b> to the main event</>, loser: <>drops to the <b>Consolidation Final</b></> };
        case "lr1": return { winner: <>goes to <b>Lower Round 2</b></>, loser: "doesn't make it into the main event" };
        case "lr2": return { winner: <>goes to <b>Lower Round 3</b></>, loser: "doesn't make it into the main event" };
        case "lr3": return { winner: <>goes to <b>Lower Semifinals</b></>, loser: "doesn't make it into the main event" };
        case "lsf": return { winner: <>goes to the <b>Lower Final</b></>, loser: "doesn't make it into the main event" };
        case "lf": return { winner: <>goes to the <b>Consolidation Final</b></>, loser: "doesn't make it into the main event" };
        case "cf": return { winner: <><b>qualifies</b> to the main event</>, loser: "doesn't make it into the main event" };
        default: return { winner: null, loser: null };
    }
};
