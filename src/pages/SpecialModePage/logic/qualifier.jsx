import {
    buildBracketRoutes,
    makeBracketMatch,
    canOpenBracketMatch,
    findCurrentBracketMatch,
    findNextBracketMatch,
    advanceBracket,
    getMatchWinnerTeam,
    getMatchLoserTeam,
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

export const PLAY_IN_GROUP = "P";
export const PLAY_IN_STAGE = "pi";
export const PLAY_IN_STAGE_ORDER = [PLAY_IN_STAGE];
export const PLAY_IN_MATCH_COUNT = 4;
export const OPEN_QUALIFIER_SPOTS = 4;

export const OPEN_QUALIFIER_CONFIG = {
    gpl: { directFrom: 36, playInFrom: 56, groupSize: 12 },
    pbs: { directFrom: 28, playInFrom: 56, groupSize: 16 },
};

export const OPEN_QUALIFIER_RATING_WEIGHTS = { pi: 0.6, uo: 0.66, uqf: 0.72, lr1: 0.64, lr2: 0.68, lr3: 0.7, usf: 0.78, lsf: 0.74, lf: 0.82, uf: 0.9, cf: 0.86 };
export const OPEN_QUALIFIER_BATTLE_STAKES = { pi: 0.15 };

const OPEN_QUALIFIER_NEEDED_PICKEM = { gpl: [53, 86], pbs: [77, 126] };

export const getRandomOpenQualifierNeededPickemPoints = (owner) => {
    const [min, max] = OPEN_QUALIFIER_NEEDED_PICKEM[owner] ?? OPEN_QUALIFIER_NEEDED_PICKEM.pbs;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

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
    pi: "Play-in",
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

const OPEN_QUALIFIER_BEST_OF = { pi: 3, uo: 1, uqf: 1, usf: 1, uf: 3, lr1: 3, lr2: 3, lr3: 3, lsf: 3, lf: 3, cf: 3 };

export const getBestOfForQualifier = (stage, owner = null) =>
    owner ? OPEN_QUALIFIER_BEST_OF[stage] ?? 3 : stage === "uf" || stage === "cf" ? 5 : 3;

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

export const isByeOpeningBracket = (bracket) => {
    const uo = bracket?.uo || [];
    return uo.some((match) => match.bye) && (bracket?.uqf || []).every((_, idx) => !!uo[idx * 2]?.bye !== !!uo[idx * 2 + 1]?.bye);
};

export const makeByeOpeningSlotSource = (bracket) => (stage, idx, slotKey) =>
    stage === "lr2" && slotKey === "slotA"
        ? { stage: "uo", idx: bracket?.uo?.[idx * 2]?.bye ? idx * 2 + 1 : idx * 2, want: "loser" }
        : qualifierSlotSource(stage, idx, slotKey);

const QUALIFIER_ROUTES = buildBracketRoutes(QUALIFIER_STAGE_ORDER, QUALIFIER_STAGE_SIZES, qualifierSlotSource);

const makeQualifierMatch = (group, stage, idx) => makeBracketMatch(`q${group}-${stage}-${idx + 1}`, group, stage);

const markQualifierBye = (bracket, stage, idx, team) => {
    const arr = [...bracket[stage]];
    arr[idx] = { ...arr[idx], played: true, bye: true, winnerTeamId: team.id, loserTeamId: null };
    bracket[stage] = arr;
    advanceQualifierBracket(bracket, stage, idx, team, null);
};

const isQualifierSourceEmpty = (bracket, stage, idx, slotKey) => {
    const source = qualifierSlotSource(stage, idx, slotKey);
    if (!source) return false;
    const match = bracket?.[source.stage]?.[source.idx];
    if (!match?.played) return false;
    return !(source.want === "loser" ? getMatchLoserTeam(match) : getMatchWinnerTeam(match));
};

export const resolveQualifierByes = (bracket) => {
    let changed = true;
    while (changed) {
        changed = false;
        QUALIFIER_STAGE_ORDER.forEach((stage) => {
            (bracket[stage] || []).forEach((match, idx) => {
                if (match.played || (match.slotA && match.slotB) || (!match.slotA && !match.slotB)) return;
                const emptySlot = match.slotA ? "slotB" : "slotA";
                if (!isQualifierSourceEmpty(bracket, stage, idx, emptySlot)) return;
                markQualifierBye(bracket, stage, idx, match.slotA ?? match.slotB);
                changed = true;
            });
        });
    }
    return bracket;
};

const buildQualifierGroupBracket = (group, teams16, size = 16) => {
    const bracket = { group, teams: teams16.map((team) => (team ? toBaseTeam(team) : null)), size };

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

    bracketOrder.forEach(([a, b], i) => {
        if (a < size && b >= size && bracket.teams[a]) markQualifierBye(bracket, "uo", i, bracket.teams[a]);
    });

    return bracket;
};

export const buildQualifier = (groups) =>
    Object.fromEntries(QUALIFIER_GROUPS.map((group) => [group, buildQualifierGroupBracket(group, groups[group] || [])]));

export const canOpenQualifierMatch = (bracket, stage, idx) =>
    bracket?.group === PLAY_IN_GROUP
        ? canOpenBracketMatch(PLAY_IN_STAGE_ORDER, bracket, stage, idx)
        : !bracket?.playInPending && canOpenBracketMatch(QUALIFIER_STAGE_ORDER, bracket, stage, idx);

export const findCurrentQualifierMatch = (bracket) =>
    bracket?.group === PLAY_IN_GROUP
        ? findCurrentBracketMatch(PLAY_IN_STAGE_ORDER, bracket)
        : bracket?.playInPending ? null : findCurrentBracketMatch(QUALIFIER_STAGE_ORDER, bracket);

export const findNextQualifierMatch = (bracket, current) =>
    findNextBracketMatch(bracket?.group === PLAY_IN_GROUP ? PLAY_IN_STAGE_ORDER : QUALIFIER_STAGE_ORDER, bracket, current);

export const advanceQualifierBracket = (bracket, stage, idx, winner, loser) =>
    advanceBracket(QUALIFIER_ROUTES, bracket, stage, idx, winner, loser);

const isQualifierGroupFinished = (bracket) => !!bracket?.cf?.[0]?.played;

export const isQualifierFinished = (qualifier) =>
    !!qualifier && QUALIFIER_GROUPS.every((group) => isQualifierGroupFinished(qualifier[group]));

export const getQualifierGroupQualifiers = (bracket) =>
    [getMatchWinnerTeam(bracket?.uf?.[0]), getMatchWinnerTeam(bracket?.cf?.[0])].filter(Boolean);

export const getQualifierMatches = (qualifier) => [
    ...(qualifier?.[PLAY_IN_GROUP]?.[PLAY_IN_STAGE] || []),
    ...QUALIFIER_GROUPS.flatMap((group) =>
        QUALIFIER_STAGE_ORDER.flatMap((stage) => qualifier?.[group]?.[stage] || [])
    ),
].filter((match) => !match.bye);

export const qualifierMatchPoints = (match, owner = null) => bracketMatchPoints(match, getBestOfForQualifier(match?.stage, owner));

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

export const getQualifierStakeTexts = (stage, eventName = "the main event", { skipLowerRound1 = false } = {}) => {
    const missed = `doesn't make it into ${eventName}`;
    switch (stage) {
        case "pi": return getPlayInStakeTexts();
        case "uo": return { winner: <>goes to <b>Upper Quarterfinals</b></>, loser: <>drops to <b>{skipLowerRound1 ? "Lower Round 2" : "Lower Round 1"}</b></> };
        case "uqf": return { winner: <>goes to <b>Upper Semifinals</b></>, loser: <>drops to <b>Lower Round 2</b></> };
        case "usf": return { winner: <>goes to the <b>Upper Final</b></>, loser: <>drops to <b>Lower Semifinals</b></> };
        case "uf": return { winner: <><b>qualifies</b> to {eventName}</>, loser: <>drops to the <b>Consolidation Final</b></> };
        case "lr1": return { winner: <>goes to <b>Lower Round 2</b></>, loser: missed };
        case "lr2": return { winner: <>goes to <b>Lower Round 3</b></>, loser: missed };
        case "lr3": return { winner: <>goes to <b>Lower Semifinals</b></>, loser: missed };
        case "lsf": return { winner: <>goes to the <b>Lower Final</b></>, loser: missed };
        case "lf": return { winner: <>goes to the <b>Consolidation Final</b></>, loser: missed };
        case "cf": return { winner: <><b>qualifies</b> to {eventName}</>, loser: missed };
        default: return { winner: null, loser: null };
    }
};

const PLAY_IN_DESTINATIONS = [
    { group: "A", offset: 2 },
    { group: "B", offset: 2 },
    { group: "A", offset: 1 },
    { group: "B", offset: 1 },
];

export const getOpenQualifierEntrants = (owner, sortedTeams) => {
    const config = OPEN_QUALIFIER_CONFIG[owner];
    if (!config) return null;
    return {
        direct: sortedTeams.slice(config.directFrom, config.playInFrom).map(toBaseTeam),
        playIn: sortedTeams.slice(config.playInFrom, config.playInFrom + PLAY_IN_MATCH_COUNT * 2).map(toBaseTeam),
    };
};

export const buildOpenQualifier = (owner, sortedTeams, extra = {}) => {
    const config = OPEN_QUALIFIER_CONFIG[owner];
    const { direct, playIn } = getOpenQualifierEntrants(owner, sortedTeams);
    const size = config.groupSize;
    const split = splitQualifierGroups(direct);

    const groups = Object.fromEntries(QUALIFIER_GROUPS.map((group) => {
        const teams = [...split[group], null, null];
        const bracket = buildQualifierGroupBracket(group, teams, size);
        return [group, { ...bracket, playInPending: true }];
    }));

    const playInBracket = {
        group: PLAY_IN_GROUP,
        teams: playIn,
        [PLAY_IN_STAGE]: Array.from({ length: PLAY_IN_MATCH_COUNT }, (_, i) => ({
            ...makeQualifierMatch(PLAY_IN_GROUP, PLAY_IN_STAGE, i),
            slotA: playIn[i] ?? null,
            slotB: playIn[playIn.length - 1 - i] ?? null,
            dest: { group: PLAY_IN_DESTINATIONS[i].group, seed: size - PLAY_IN_DESTINATIONS[i].offset },
        })),
    };

    return { owner, ...extra, [PLAY_IN_GROUP]: playInBracket, ...groups };
};

export const isPlayInFinished = (qualifier) =>
    !qualifier?.[PLAY_IN_GROUP] || qualifier[PLAY_IN_GROUP][PLAY_IN_STAGE].every((match) => match.played);

export const placePlayInWinner = (groupBracket, seed, team) => {
    const bracket = copyQualifierBracket(groupBracket);
    bracket.teams = [...bracket.teams];
    bracket.teams[seed] = toBaseTeam(team);
    const matchIdx = bracketOrder.findIndex(([a, b]) => a === seed || b === seed);
    if (matchIdx >= 0) {
        const slotKey = bracketOrder[matchIdx][0] === seed ? "slotA" : "slotB";
        bracket.uo = [...bracket.uo];
        bracket.uo[matchIdx] = { ...bracket.uo[matchIdx], [slotKey]: toBaseTeam(team) };
    }
    return bracket;
};

export const copyQualifierBracket = (groupBracket) => {
    const bracket = { ...groupBracket };
    [...QUALIFIER_STAGE_ORDER, PLAY_IN_STAGE].forEach((stage) => {
        if (groupBracket?.[stage]) bracket[stage] = [...groupBracket[stage]];
    });
    return bracket;
};

export const getQualifierRoundTotals = (qualifier) => {
    const totals = {};
    getQualifierMatches(qualifier).forEach((match) => {
        totals[match.stage] = (totals[match.stage] ?? 0) + 1;
    });
    return totals;
};

export const getPlayInStakeTexts = () => ({
    winner: <>goes to the <b>Open Qualifier</b></>,
    loser: "flies out of the Open Qualifier",
});
