import {
    buildBracketRoutes,
    buildBracketConnectorLinks,
    makeBracketMatch,
    canOpenBracketMatch,
    findCurrentBracketMatch,
    findNextBracketMatch,
    bracketMatchPoints,
    getMatchWinnerTeam,
    getMatchLoserTeam,
} from "./brackets.js";
import { bracketOrder } from "./playoffs.js";
import {
    QUALIFIER_STAGE_ORDER,
    QUALIFIER_STAGE_SIZES,
    QUALIFIER_STAGE_LABELS,
    QUALIFIER_COLUMN_TITLES,
    qualifierSlotSource,
} from "./qualifier.jsx";
import { toBaseTeam } from "./teams.js";

export const ECL_STAGE_ORDER = [...QUALIFIER_STAGE_ORDER, "gf"];

const ECL_STAGE_SIZES = { ...QUALIFIER_STAGE_SIZES, gf: 1 };

const ECL_STAGE_LABELS = { ...QUALIFIER_STAGE_LABELS, gf: "Grand Final" };

export const ECL_COLUMN_TITLES = { ...QUALIFIER_COLUMN_TITLES, gf: "Grand Final" };

const ECL_UPPER_STAGES = ["uo", "uqf", "usf", "uf"];
export const ECL_UNBEATEN_STAGES = [...ECL_UPPER_STAGES, "gf"];
export const ECL_ELIMINATION_STAGES = ["lr1", "lr2", "lr3", "lsf", "lf", "cf", "gf"];

const ECL_BEST_OF = { uo: 1, uqf: 1, usf: 1, uf: 3, lr1: 3, lr2: 3, lr3: 3, lsf: 3, lf: 3, cf: 3, gf: 5 };

export const ECL_BIG_STAGE_GAINS = {
    lsf: { winner: 2 },
    lf: { winner: 3, loser: 2 },
    uf: { winner: 3 },
    cf: { winner: 3, loser: 3 },
    gf: { winner: 5, loser: 4 },
};

export const ECL_BATTLE_STAKES = { uo: 0.15, uqf: 0.25, lr1: 0.15, lr2: 0.2, lr3: 0.25, usf: 0.35, lsf: 0.4, lf: 0.5, uf: 0.5, cf: 0.6, gf: 0.8 };
export const ECL_RATING_WEIGHTS = { uo: 0.9, uqf: 0.95, usf: 1.0, uf: 1.08, lr1: 0.88, lr2: 0.92, lr3: 0.96, lsf: 1.0, lf: 1.05, cf: 1.12, gf: 1.25 };

const ECL_MIN_NEEDED_PICKEM = 39;
const ECL_MAX_NEEDED_PICKEM = 64;

export const getRandomEclNeededPickemPoints = () =>
    Math.floor(Math.random() * (ECL_MAX_NEEDED_PICKEM - ECL_MIN_NEEDED_PICKEM + 1)) +
    ECL_MIN_NEEDED_PICKEM;

export const eclStageLabel = (stage) => ECL_STAGE_LABELS[stage] ?? "";

export const isSingleEclStage = (stage) => ECL_STAGE_SIZES[stage] === 1;

export const getBestOfForEcl = (stage) => ECL_BEST_OF[stage] ?? 3;

export const eclSlotSource = (stage, idx, slotKey) =>
    stage === "gf"
        ? { stage: slotKey === "slotB" ? "cf" : "uf", idx: 0, want: "winner" }
        : qualifierSlotSource(stage, idx, slotKey);

export const ECL_ROUTES = buildBracketRoutes(ECL_STAGE_ORDER, ECL_STAGE_SIZES, eclSlotSource);

export const ECL_CONNECTOR_LINKS = buildBracketConnectorLinks(ECL_STAGE_ORDER, ECL_STAGE_SIZES, eclSlotSource);

export const buildEclBracket = (teams16) => {
    const bracket = { group: null, teams: teams16.map(toBaseTeam) };

    ECL_STAGE_ORDER.forEach((stage) => {
        bracket[stage] = Array.from(
            { length: ECL_STAGE_SIZES[stage] },
            (_, i) => makeBracketMatch(`ecl-${stage}-${i + 1}`, null, stage)
        );
    });

    bracketOrder.forEach(([a, b], i) => {
        bracket.uo[i].slotA = bracket.teams[a] ?? null;
        bracket.uo[i].slotB = bracket.teams[b] ?? null;
    });

    return bracket;
};

export const canOpenEclMatch = (bracket, stage, idx) => canOpenBracketMatch(ECL_STAGE_ORDER, bracket, stage, idx);

export const findCurrentEclMatch = (bracket) => findCurrentBracketMatch(ECL_STAGE_ORDER, bracket);

export const findNextEclMatch = (bracket, current) => findNextBracketMatch(ECL_STAGE_ORDER, bracket, current);

export const getEclMatches = (bracket) => ECL_STAGE_ORDER.flatMap((stage) => bracket?.[stage] || []);

export const eclMatchPoints = (match) => bracketMatchPoints(match, getBestOfForEcl(match?.stage));

export const ECL_PICKEM_ROUNDS = [
    { stage: "uo", label: "Opening Rounds" },
    { stage: "uqf", label: "Upper Quarterfinals" },
    { stage: "lr1", label: "Lower Rounds 1" },
    { stage: "lr2", label: "Lower Rounds 2" },
    { stage: "lr3", label: "Lower Rounds 3" },
    { stage: "usf", label: "Upper Semifinals" },
    { stage: "lsf", label: "Lower Semifinals" },
    { stage: "lf", label: "the Lower Final" },
    { stage: "uf", label: "the Upper Final" },
    { stage: "cf", label: "the Consolidation Final" },
    { stage: "gf", label: "the Grand Final" },
].map((round) => ({
    ...round,
    key: `ecl_${round.stage}`,
    total: ECL_STAGE_SIZES[round.stage],
}));

const ECL_ELIMINATED_TEXT = "flies out of this tournament";

export const getEclStakeTexts = (stage) => {
    switch (stage) {
        case "uo": return { winner: <>goes to <b>Upper Quarterfinals</b></>, loser: <>drops to <b>Lower Round 1</b></> };
        case "uqf": return { winner: <>goes to <b>Upper Semifinals</b></>, loser: <>drops to <b>Lower Round 2</b></> };
        case "usf": return { winner: <>goes to the <b>Upper Final</b></>, loser: <>drops to <b>Lower Semifinals</b></> };
        case "uf": return { winner: <>goes to the <b>Grand Final</b></>, loser: <>drops to the <b>Consolidation Final</b></> };
        case "lr1": return { winner: <>goes to <b>Lower Round 2</b></>, loser: ECL_ELIMINATED_TEXT };
        case "lr2": return { winner: <>goes to <b>Lower Round 3</b></>, loser: ECL_ELIMINATED_TEXT };
        case "lr3": return { winner: <>goes to <b>Lower Semifinals</b></>, loser: ECL_ELIMINATED_TEXT };
        case "lsf": return { winner: <>goes to the <b>Lower Final</b></>, loser: ECL_ELIMINATED_TEXT };
        case "lf": return { winner: <>goes to the <b>Consolidation Final</b></>, loser: "still had a good run!" };
        case "cf": return { winner: <>goes to the <b>Grand Final</b></>, loser: <>earns <b>Third Place Medal</b>!</> };
        case "gf": return { winner: <><b>WINS</b> the tournament!</>, loser: "second place is still wonderful!" };
        default: return { winner: null, loser: null };
    }
};

export const getEclResults = (bracket) => ({
    winner: getMatchWinnerTeam(bracket?.gf?.[0]),
    runnerUp: getMatchLoserTeam(bracket?.gf?.[0]),
    thirdPlace: getMatchLoserTeam(bracket?.cf?.[0]),
    fourthPlace: getMatchLoserTeam(bracket?.lf?.[0]),
});

export const getEclPlaces = (bracket) => {
    const results = getEclResults(bracket);
    const losersOf = (stage) => (bracket?.[stage] || []).map(getMatchLoserTeam).filter(Boolean);

    return [
        results.winner,
        results.runnerUp,
        results.thirdPlace,
        results.fourthPlace,
        ...losersOf("lsf"),
        ...losersOf("lr3"),
        ...losersOf("lr2"),
        ...losersOf("lr1"),
    ].filter(Boolean);
};
