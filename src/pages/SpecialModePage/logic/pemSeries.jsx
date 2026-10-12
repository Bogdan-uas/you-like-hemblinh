import {
    buildBracketRoutes,
    makeBracketMatch,
    canOpenBracketMatch,
    findCurrentBracketMatch,
    findNextBracketMatch,
    advanceBracket,
    isBracketFinished,
    bracketMatchPoints,
    getMatchWinnerTeam,
    getMatchLoserTeam,
} from "./brackets.js";
import { getPemSeriesConfig } from "./pemConfig.js";
import { toBaseTeam } from "./teams.js";
import { PEM_SMALL_TYPE_ID } from "./tournamentTypes.jsx";

export const PEM_MAIN_GROUPS = ["A", "B"];

export const PEM_GROUP_STAGE_ORDER = ["uo", "usf", "lr1", "lsf", "uf", "lf"];

const PEM_GROUP_STAGE_SIZES = { uo: 4, usf: 2, lr1: 2, lsf: 2, uf: 1, lf: 1 };

const PEM_GROUP_STAGE_LABELS = {
    uo: "Opening Round",
    usf: "Upper Semifinal",
    uf: "Upper Final",
    lr1: "Lower Round 1",
    lsf: "Lower Semifinal",
    lf: "Lower Final",
};

export const PEM_GROUP_COLUMN_TITLES = {
    uo: "Opening Round",
    usf: "Upper Semifinals",
    uf: "Upper Final",
    lr1: "Lower Round 1",
    lsf: "Lower Semifinals",
    lf: "Lower Final",
};

export const PEM_GROUP_UPPER_STAGES = ["uo", "usf", "uf"];
export const PEM_GROUP_ELIMINATION_STAGES = ["lr1", "lsf", "lf"];
export const PEM_GROUP_QUALIFYING_STAGES = ["usf", "lf"];

export const PEM_GROUP_BATTLE_STAKES = { uo: 0.35, usf: 0.5, lr1: 0.35, lsf: 0.5, uf: 0.6, lf: 0.6 };
export const PEM_GROUP_RATING_WEIGHTS = { uo: 1.32, usf: 1.52, lr1: 1.24, lsf: 1.44, uf: 1.7, lf: 1.6 };

export const PEM_BIG_GROUP_RATING_WEIGHTS = { uo: 1.49, usf: 1.71, lr1: 1.4, lsf: 1.62, uf: 1.91, lf: 1.8 };

export const PEM_PLAYOFFS_RATING_WEIGHTS = { qf: 2.0, sf: 3.2, thirdPlace: 3.47, gf: 6.0 };

export const PEM_BIG_PLAYOFFS_RATING_WEIGHTS = { qf: 2.25, sf: 2.7, thirdPlace: 2.93, gf: 4.5 };

export const PEM_PLAYOFFS_BIG_STAGE = {
    qf: { winner: 4 },
    sf: { winner: 4 },
    thirdPlace: { winner: 5, loser: 4 },
    gf: { winner: 7, loser: 6 },
};

export const PEM_BIG_PLAYOFFS_BIG_STAGE = {
    qf: { winner: 5 },
    sf: { winner: 5 },
    thirdPlace: { winner: 6, loser: 5 },
    gf: { winner: 8, loser: 7 },
};

export const isPemPlayoffsKind = (kind) => kind === "pem" || kind === "pemBig";

export const getRandomPemNeededPickemPoints = (type = PEM_SMALL_TYPE_ID) => {
    const [min, max] = getPemSeriesConfig(type).neededPickem;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const pemGroupStageLabel = (stage) => PEM_GROUP_STAGE_LABELS[stage] ?? "";

export const isSinglePemGroupStage = (stage) => PEM_GROUP_STAGE_SIZES[stage] === 1;

export const getBestOfForPemGroup = (stage) => (stage === "uf" || stage === "lf" ? 5 : 3);

const PEM_GROUP_BRACKET_ORDER = [
    [0, 7],
    [3, 4],
    [1, 6],
    [2, 5],
];

export const pemGroupSlotSource = (stage, idx, slotKey) => {
    const second = slotKey === "slotB";
    switch (stage) {
        case "usf": return { stage: "uo", idx: idx * 2 + (second ? 1 : 0), want: "winner" };
        case "uf": return { stage: "usf", idx: second ? 1 : 0, want: "winner" };
        case "lr1": return { stage: "uo", idx: idx * 2 + (second ? 1 : 0), want: "loser" };
        case "lsf": return second ? { stage: "usf", idx, want: "loser" } : { stage: "lr1", idx, want: "winner" };
        case "lf": return { stage: "lsf", idx: second ? 1 : 0, want: "winner" };
        default: return null;
    }
};

const PEM_GROUP_ROUTES = buildBracketRoutes(PEM_GROUP_STAGE_ORDER, PEM_GROUP_STAGE_SIZES, pemGroupSlotSource);

const makePemGroupMatch = (group, stage, idx) => makeBracketMatch(`pem${group}-${stage}-${idx + 1}`, group, stage);

const buildPemGroupBracket = (group, teams8) => {
    const bracket = { group, teams: teams8.map(toBaseTeam) };

    PEM_GROUP_STAGE_ORDER.forEach((stage) => {
        bracket[stage] = Array.from(
            { length: PEM_GROUP_STAGE_SIZES[stage] },
            (_, i) => makePemGroupMatch(group, stage, i)
        );
    });

    PEM_GROUP_BRACKET_ORDER.forEach(([a, b], i) => {
        bracket.uo[i].slotA = bracket.teams[a] ?? null;
        bracket.uo[i].slotB = bracket.teams[b] ?? null;
    });

    return bracket;
};

export const buildPemMainEventTeams = (pemSeries) => {
    const qualifierOrder = new Map((pemSeries?.seeds?.qualifier || []).map((team, index) => [team.id, index]));
    const qualified = [...(pemSeries?.qualified || [])].sort(
        (a, b) => (qualifierOrder.get(a.id) ?? 99) - (qualifierOrder.get(b.id) ?? 99)
    );
    return [...(pemSeries?.seeds?.mainEvent || []), ...qualified].map(toBaseTeam);
};

export const buildPemMainGroupStage = (groups) =>
    Object.fromEntries(PEM_MAIN_GROUPS.map((group) => [group, buildPemGroupBracket(group, groups[group] || [])]));

export const canOpenPemGroupMatch = (bracket, stage, idx) => canOpenBracketMatch(PEM_GROUP_STAGE_ORDER, bracket, stage, idx);

export const findCurrentPemGroupMatch = (bracket) => findCurrentBracketMatch(PEM_GROUP_STAGE_ORDER, bracket);

export const findNextPemGroupMatch = (bracket, current) => findNextBracketMatch(PEM_GROUP_STAGE_ORDER, bracket, current);

export const advancePemGroupBracket = (bracket, stage, idx, winner, loser) =>
    advanceBracket(PEM_GROUP_ROUTES, bracket, stage, idx, winner, loser);

const isPemGroupFinished = (bracket) => isBracketFinished(PEM_GROUP_STAGE_ORDER, bracket);

export const isPemGroupStageFinished = (groupStage) =>
    !!groupStage && PEM_MAIN_GROUPS.every((group) => isPemGroupFinished(groupStage[group]));

export const getPemGroupMatches = (groupStage) =>
    PEM_MAIN_GROUPS.flatMap((group) =>
        PEM_GROUP_STAGE_ORDER.flatMap((stage) => groupStage?.[group]?.[stage] || [])
    );

export const pemGroupMatchPoints = (match) => bracketMatchPoints(match, getBestOfForPemGroup(match?.stage));

export const PEM_GROUP_PICKEM_ROUNDS = [
    { stage: "uo", label: "Opening Rounds" },
    { stage: "usf", label: "Upper Semifinals" },
    { stage: "lr1", label: "Lower Rounds 1" },
    { stage: "lsf", label: "Lower Semifinals" },
    { stage: "uf", label: "Upper Finals" },
    { stage: "lf", label: "Lower Finals" },
].map((round) => ({
    ...round,
    key: `pem_${round.stage}`,
    total: PEM_GROUP_STAGE_SIZES[round.stage] * PEM_MAIN_GROUPS.length,
}));

const PEM_ELIMINATED_TEXT = "doesn't make into Playoffs";

export const getPemGroupStakeTexts = (stage) => {
    switch (stage) {
        case "uo": return { winner: <>goes to <b>Upper Semifinals</b></>, loser: <>drops to <b>Lower Round 1</b></> };
        case "usf": return { winner: <>qualifies to <b>Playoffs</b> and goes to the <b>Upper Final</b></>, loser: <>drops to <b>Lower Semifinals</b></> };
        case "uf": return { winner: <>goes directly to Playoffs: <b>Semifinals</b></>, loser: <>goes to Playoffs: <b>Quarterfinals</b></> };
        case "lr1": return { winner: <>goes to <b>Lower Semifinals</b></>, loser: PEM_ELIMINATED_TEXT };
        case "lsf": return { winner: <>goes to the <b>Lower Final</b></>, loser: PEM_ELIMINATED_TEXT };
        case "lf": return { winner: <>qualifies to Playoffs: <b>Quarterfinals</b></>, loser: PEM_ELIMINATED_TEXT };
        default: return { winner: null, loser: null };
    }
};

const makePemPlayoffsMatch = (stage, i, slotA = null, slotB = null, kind = "pem") => ({
    id: `${stage}-${i + 1}`,
    stage,
    pem: true,
    ...(kind === "pemBig" ? { pemBig: true } : {}),
    slotA,
    slotB,
    played: false,
    scoreLeft: null,
    scoreRight: null,
    winnerTeamId: null,
    loserTeamId: null,
    pickTeamId: null,
    setHistory: [],
});

export const buildPemPlayoffs = (groupStage, kind = "pem") => {
    const a = groupStage?.A;
    const b = groupStage?.B;
    const seed = (team) => (team ? toBaseTeam(team) : null);
    const match = (stage, i, slotA = null, slotB = null) => makePemPlayoffsMatch(stage, i, slotA, slotB, kind);

    return {
        kind,
        ro16: [],
        qf: [
            match("qf", 0, seed(getMatchWinnerTeam(a?.lf?.[0])), seed(getMatchLoserTeam(b?.uf?.[0]))),
            match("qf", 1, seed(getMatchLoserTeam(a?.uf?.[0])), seed(getMatchWinnerTeam(b?.lf?.[0]))),
        ],
        sf: [
            match("sf", 0, seed(getMatchWinnerTeam(a?.uf?.[0]))),
            match("sf", 1, seed(getMatchWinnerTeam(b?.uf?.[0]))),
        ],
        thirdPlace: [match("thirdPlace", 0)],
        gf: [match("gf", 0)],
    };
};
