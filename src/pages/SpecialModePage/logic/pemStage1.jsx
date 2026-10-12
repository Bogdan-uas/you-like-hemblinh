import {
    buildBracketRoutes,
    buildBracketConnectorLinks,
    makeBracketMatch,
    canOpenBracketMatch,
    findCurrentBracketMatch,
    findNextBracketMatch,
    advanceBracket,
    isBracketFinished,
    getMatchWinnerTeam,
    bracketMatchPoints,
} from "./brackets.js";
import { PEM_MAIN_GROUPS, buildPemMainEventTeams } from "./pemSeries.jsx";
import { toBaseTeam } from "./teams.js";

export const PEM_BIG_STAGE2_AUTO_COUNT = 12;

export const PEM_STAGE1_STAGE_ORDER = ["uo", "lr1", "uf", "lr2"];

const PEM_STAGE1_STAGE_SIZES = { uo: 2, lr1: 1, uf: 1, lr2: 1 };

export const PEM_STAGE1_STAGE_LABELS = {
    uo: "Opening Round",
    lr1: "Lower Round 1",
    uf: "Upper Final",
    lr2: "Lower Round 2",
};

export const PEM_STAGE1_UPPER_STAGES = ["uo", "uf"];
export const PEM_STAGE1_ELIMINATION_STAGES = ["lr1", "lr2"];
export const PEM_STAGE1_QUALIFYING_STAGES = ["uf", "lr2"];

export const PEM_STAGE1_BATTLE_STAKES = { uo: 0.3, lr1: 0.3, uf: 0.45, lr2: 0.45 };
export const PEM_STAGE1_RATING_WEIGHTS = { uo: 1.28, lr1: 1.2, uf: 1.44, lr2: 1.4 };

export const pemStage1StageLabel = (stage) => PEM_STAGE1_STAGE_LABELS[stage] ?? "";

export const isSinglePemStage1Stage = (stage) => PEM_STAGE1_STAGE_SIZES[stage] === 1;

export const getBestOfForPemStage1 = () => 3;

const PEM_STAGE1_BRACKET_ORDER = [
    [0, 3],
    [1, 2],
];

export const pemStage1SlotSource = (stage, idx, slotKey) => {
    const second = slotKey === "slotB";
    switch (stage) {
        case "uf": return { stage: "uo", idx: second ? 1 : 0, want: "winner" };
        case "lr1": return { stage: "uo", idx: second ? 1 : 0, want: "loser" };
        case "lr2": return second ? { stage: "uf", idx: 0, want: "loser" } : { stage: "lr1", idx: 0, want: "winner" };
        default: return null;
    }
};

const PEM_STAGE1_ROUTES = buildBracketRoutes(PEM_STAGE1_STAGE_ORDER, PEM_STAGE1_STAGE_SIZES, pemStage1SlotSource);

export const PEM_STAGE1_CONNECTOR_LINKS = buildBracketConnectorLinks(PEM_STAGE1_STAGE_ORDER, PEM_STAGE1_STAGE_SIZES, pemStage1SlotSource);

const buildPemStage1GroupBracket = (group, teams4) => {
    const bracket = { group, teams: teams4.map(toBaseTeam) };

    PEM_STAGE1_STAGE_ORDER.forEach((stage) => {
        bracket[stage] = Array.from(
            { length: PEM_STAGE1_STAGE_SIZES[stage] },
            (_, i) => makeBracketMatch(`ps1${group}-${stage}-${i + 1}`, group, stage)
        );
    });

    PEM_STAGE1_BRACKET_ORDER.forEach(([a, b], i) => {
        bracket.uo[i].slotA = bracket.teams[a] ?? null;
        bracket.uo[i].slotB = bracket.teams[b] ?? null;
    });

    return bracket;
};

export const buildPemStage1 = (groups) =>
    Object.fromEntries(PEM_MAIN_GROUPS.map((group) => [group, buildPemStage1GroupBracket(group, groups[group] || [])]));

export const canOpenPemStage1Match = (bracket, stage, idx) => canOpenBracketMatch(PEM_STAGE1_STAGE_ORDER, bracket, stage, idx);

export const findCurrentPemStage1Match = (bracket) => findCurrentBracketMatch(PEM_STAGE1_STAGE_ORDER, bracket);

export const findNextPemStage1Match = (bracket, current) => findNextBracketMatch(PEM_STAGE1_STAGE_ORDER, bracket, current);

export const advancePemStage1Bracket = (bracket, stage, idx, winner, loser) =>
    advanceBracket(PEM_STAGE1_ROUTES, bracket, stage, idx, winner, loser);

export const isPemStage1Finished = (stage1) =>
    !!stage1 && PEM_MAIN_GROUPS.every((group) => isBracketFinished(PEM_STAGE1_STAGE_ORDER, stage1[group]));

export const getPemStage1Matches = (stage1) =>
    PEM_MAIN_GROUPS.flatMap((group) =>
        PEM_STAGE1_STAGE_ORDER.flatMap((stage) => stage1?.[group]?.[stage] || [])
    );

const getPemStage1GroupQualifiers = (bracket) =>
    [getMatchWinnerTeam(bracket?.uf?.[0]), getMatchWinnerTeam(bracket?.lr2?.[0])].filter(Boolean);

export const pemStage1MatchPoints = (match) => bracketMatchPoints(match, getBestOfForPemStage1(match?.stage));

export const PEM_STAGE1_PICKEM_ROUNDS = [
    { stage: "uo", label: "Opening Rounds of Stage I" },
    { stage: "lr1", label: "Lower Rounds 1 of Stage I" },
    { stage: "uf", label: "Upper Finals of Stage I" },
    { stage: "lr2", label: "Lower Rounds 2 of Stage I" },
].map((round) => ({
    ...round,
    key: `ps1_${round.stage}`,
    total: PEM_STAGE1_STAGE_SIZES[round.stage] * PEM_MAIN_GROUPS.length,
}));

const PEM_STAGE1_ELIMINATED_TEXT = "flies out of this tournament";

export const getPemStage1StakeTexts = (stage) => {
    switch (stage) {
        case "uo": return { winner: <>goes to the <b>Upper Final</b></>, loser: <>drops to <b>Lower Round 1</b></> };
        case "uf": return { winner: <><b>qualifies</b> to Stage II</>, loser: <>drops to <b>Lower Round 2</b></> };
        case "lr1": return { winner: <>goes to <b>Lower Round 2</b></>, loser: PEM_STAGE1_ELIMINATED_TEXT };
        case "lr2": return { winner: <><b>qualifies</b> to Stage II</>, loser: PEM_STAGE1_ELIMINATED_TEXT };
        default: return { winner: null, loser: null };
    }
};

export const buildPemStage1Teams = (pemSeries) => buildPemMainEventTeams(pemSeries).slice(PEM_BIG_STAGE2_AUTO_COUNT);

export const buildPemBigStage2Teams = (pemSeries, stage1) => {
    const stage1Order = new Map(buildPemStage1Teams(pemSeries).map((team, index) => [team.id, index]));
    const qualified = PEM_MAIN_GROUPS
        .flatMap((group) => getPemStage1GroupQualifiers(stage1?.[group]))
        .sort((a, b) => (stage1Order.get(a.id) ?? 99) - (stage1Order.get(b.id) ?? 99));
    return [...(pemSeries?.seeds?.mainEvent || []).slice(0, PEM_BIG_STAGE2_AUTO_COUNT), ...qualified].map(toBaseTeam);
};
