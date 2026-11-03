import {
    buildBracketRoutes,
    buildBracketConnectorLinks,
    makeBracketMatch,
    advanceBracket,
    canOpenBracketMatch,
    findCurrentBracketMatch,
    findNextBracketMatch,
    isBracketFinished,
    getMatchWinnerTeam,
    getMatchLoserTeam,
    bracketMatchPoints,
} from "./brackets.js";
import { PEM_STAGE1_STAGE_ORDER, PEM_STAGE1_STAGE_LABELS, advancePemStage1Bracket, pemStage1SlotSource } from "./pemStage1.jsx";
import { pemGroupSlotSource } from "./pemSeries.jsx";
import { toBaseTeam } from "./teams.js";
import { ESS_TYPE_ID, ESS_CH_TYPE_ID, ESS_LQ_TYPE_ID } from "./tournamentTypes.jsx";

export { ESS_TYPE_ID, ESS_CH_TYPE_ID, ESS_LQ_TYPE_ID };

export const ESS_FINAL_DIRECT_COUNT = 6;
export const ESS_CH_DIRECT_TO = 18;
export const ESS_LQ_TO = 64;
export const ESS_LQ_QUALIFIER_COUNT = 4;
export const ESS_CH_QUALIFIER_COUNT = 2;

export const ESS_LADDERS = ["A", "B", "C", "D"];
export const ESS_CH_GROUPS = ["A", "B", "C", "D"];

export const buildEssSeeds = (sortedTeams) => {
    const teams = sortedTeams.map(toBaseTeam);
    return {
        finals: teams.slice(0, ESS_FINAL_DIRECT_COUNT),
        challenger: teams.slice(ESS_FINAL_DIRECT_COUNT, ESS_CH_DIRECT_TO),
        ladder: teams.slice(ESS_CH_DIRECT_TO, ESS_LQ_TO),
    };
};

const mkMatch = (id, group, stage, slotA = null, slotB = null) => ({ ...makeBracketMatch(id, group, stage), slotA, slotB });

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

export const ESS_TOP_RUNG = "top";

export const essLadderOrder = (size) => [...Array.from({ length: Math.max(0, size - 2) }, (_, i) => `r${i + 1}`), ESS_TOP_RUNG];

export const essRungNumber = (stage) => (stage === ESS_TOP_RUNG ? null : Number(String(stage).slice(1)) || null);

export const essRungLabel = (stage) => (stage === ESS_TOP_RUNG ? "Top Rung" : `Rung ${essRungNumber(stage) ?? ""}`);

const snakeLadders = (teams) => {
    const ladders = ESS_LADDERS.map(() => []);
    teams.forEach((team, i) => {
        const round = Math.floor(i / ESS_LADDERS.length);
        const pos = i % ESS_LADDERS.length;
        ladders[round % 2 === 0 ? pos : ESS_LADDERS.length - 1 - pos].push(team);
    });
    return ladders;
};

const buildLadder = (group, teams) => {
    const seeded = teams.map(toBaseTeam);
    const order = essLadderOrder(seeded.length);
    const ladder = { group, teams: seeded, order };
    order.forEach((stage, k) => {
        ladder[stage] = [mkMatch(`essl${group}-${stage}-1`, group, stage, seeded[seeded.length - 2 - k] ?? null, k === 0 ? seeded[seeded.length - 1] ?? null : null)];
    });
    return ladder;
};

export const buildEssLadderQualifier = (teams, extra = {}) => {
    const ladders = snakeLadders(teams.map(toBaseTeam));
    return {
        ...extra,
        phase: "ladders",
        teams: teams.map(toBaseTeam),
        ladders: Object.fromEntries(ESS_LADDERS.map((group, i) => [group, buildLadder(group, ladders[i])])),
        qualified: [],
    };
};

export const essLadderSlotSource = (ladder) => (stage, idx, slotKey) => {
    const k = (ladder?.order || []).indexOf(stage);
    return slotKey === "slotB" && k > 0 ? { stage: ladder.order[k - 1], idx: 0, want: "winner" } : null;
};

export const getBestOfForEssLadder = (stage) => (stage === ESS_TOP_RUNG ? 3 : 1);

export const canOpenEssLadderMatch = (ladder, stage, idx) => canOpenBracketMatch(ladder?.order || [], ladder, stage, idx);

export const findCurrentEssLadderMatch = (ladder) => findCurrentBracketMatch(ladder?.order || [], ladder);

export const findNextEssLadderMatch = (ladder, current) => findNextBracketMatch(ladder?.order || [], ladder, current);

export const essLadderSchedule = (lq) => {
    const entries = ESS_LADDERS.flatMap((group) => {
        const order = lq?.ladders?.[group]?.order || [];
        return order.map((stage, k) => ({ group, stage, fromTop: order.length - 1 - k }));
    });
    return entries.sort((x, y) => y.fromTop - x.fromTop || x.group.localeCompare(y.group));
};

const lqMatchAt = (lq, { group, stage }) => lq?.ladders?.[group]?.[stage]?.[0] ?? null;

export const findCurrentEssLqMatch = (lq) => {
    const entry = essLadderSchedule(lq).find((spot) => !lqMatchAt(lq, spot)?.played);
    return entry ? { group: entry.group, stage: entry.stage, index: 0 } : null;
};

export const findNextEssLqMatch = (lq) => {
    const pending = essLadderSchedule(lq).filter((spot) => !lqMatchAt(lq, spot)?.played);
    return pending[1] ? { group: pending[1].group, stage: pending[1].stage, index: 0 } : null;
};

export const canOpenEssLqMatch = (lq, group, stage) => {
    const current = findCurrentEssLqMatch(lq);
    const match = lqMatchAt(lq, { group, stage });
    return !!current && current.group === group && current.stage === stage && !!match?.slotA && !!match?.slotB;
};

export const getEssLadderWinner = (ladder) => getMatchWinnerTeam(ladder?.[ESS_TOP_RUNG]?.[0]);

export const isEssLadderQualifierFinished = (lq) => !!lq && ESS_LADDERS.every((group) => !!lq.ladders?.[group]?.[ESS_TOP_RUNG]?.[0]?.played);

export const getEssLadderMatches = (lq) =>
    ESS_LADDERS.flatMap((group) => {
        const ladder = lq?.ladders?.[group];
        return (ladder?.order || []).flatMap((stage) => ladder?.[stage] || []);
    });

export const locateEssLadderMatch = (lq, matchId) => {
    for (const group of ESS_LADDERS) {
        const ladder = lq?.ladders?.[group];
        for (const stage of ladder?.order || []) {
            if (ladder[stage]?.[0]?.id === matchId) return { section: "ladders", group, stage, idx: 0, match: ladder[stage][0] };
        }
    }
    return null;
};

export const updateEssLadderMatch = (lq, matchId, update) => {
    const spot = locateEssLadderMatch(lq, matchId);
    if (!spot) return lq;
    const ladder = lq.ladders[spot.group];
    return { ...lq, ladders: { ...lq.ladders, [spot.group]: { ...ladder, [spot.stage]: [update(ladder[spot.stage][0])] } } };
};

export const advanceEssLadder = (lq, spot, winner) => {
    const ladder = { ...lq.ladders[spot.group] };
    const k = ladder.order.indexOf(spot.stage);
    const nextStage = ladder.order[k + 1];
    if (nextStage && winner) ladder[nextStage] = [{ ...ladder[nextStage][0], slotB: toBaseTeam(winner) }];
    return { ...lq, ladders: { ...lq.ladders, [spot.group]: ladder } };
};

export const essLadderMatchPoints = (match) => bracketMatchPoints(match, getBestOfForEssLadder(match?.stage));

export const getEssLadderQualifiers = (lq) => ESS_LADDERS.map((group) => getEssLadderWinner(lq?.ladders?.[group])).filter(Boolean);

export const getEssLadderPlaces = (lq) => {
    const depthLists = ESS_LADDERS.map((group) => {
        const ladder = lq?.ladders?.[group];
        return [...(ladder?.order || [])].reverse().map((stage) => getMatchLoserTeam(ladder?.[stage]?.[0])).filter(Boolean);
    });
    const deepest = Math.max(0, ...depthLists.map((list) => list.length));
    const losers = [];
    for (let depth = 0; depth < deepest; depth++) depthLists.forEach((list) => list[depth] && losers.push(list[depth]));
    return [...getEssLadderQualifiers(lq), ...losers];
};

const ladderRungWeight = (stage, base, step, top) => (stage === ESS_TOP_RUNG ? top : base + step * ((essRungNumber(stage) ?? 1) - 1));

export const essLadderRatingWeight = (stage) => ladderRungWeight(stage, 0.72, 0.02, 1.0);
export const essLadderBattleStakes = (stage) => ladderRungWeight(stage, 0.12, 0.02, 0.45);
export const ESS_LQ_BIG_STAGE_GAINS = { [ESS_TOP_RUNG]: { winner: 2 } };

export const essLadderPickemBand = (stage) => {
    const rung = essRungNumber(stage);
    return stage === ESS_TOP_RUNG ? "top" : rung <= 4 ? "low" : rung <= 8 ? "mid" : "high";
};

export const ESS_LQ_PICKEM_ROUNDS = [
    { band: "low", label: "matches on Rungs 1-4" },
    { band: "mid", label: "matches on Rungs 5-8" },
    { band: "high", label: "matches on Rungs 9-10" },
    { band: "top", label: "Top Rungs" },
].map((round) => ({ ...round, key: `essl_${round.band}` }));

export const getEssLadderPickemTotals = (lq) => {
    const totals = Object.fromEntries(ESS_LQ_PICKEM_ROUNDS.map(({ band }) => [band, 0]));
    getEssLadderMatches(lq).forEach((match) => {
        totals[essLadderPickemBand(match.stage)] += 1;
    });
    return totals;
};

const ESS_ELIMINATED = "flies out of this tournament";

export const getEssLadderStakeTexts = (stage, chName = "Elite Star Series Challenger") =>
    stage === ESS_TOP_RUNG
        ? { winner: <><b>qualifies</b> to {chName}</>, loser: "falls off at the very top" }
        : { winner: <>climbs to the <b>next rung</b></>, loser: ESS_ELIMINATED };

export const ESS_CH_PLAYOFFS_ORDER = ["qf", "sf"];
const ESS_CH_PLAYOFFS_SIZES = { qf: 4, sf: 2 };
const ESS_CH_QF_PAIRS = [["A", "B"], ["C", "D"], ["B", "A"], ["D", "C"]];

export const essChPlayoffsSlotSource = (stage, idx, slotKey) =>
    stage === "sf" ? { stage: "qf", idx: idx * 2 + (slotKey === "slotB" ? 1 : 0), want: "winner" } : null;

const ESS_CH_PLAYOFFS_ROUTES = buildBracketRoutes(ESS_CH_PLAYOFFS_ORDER, ESS_CH_PLAYOFFS_SIZES, essChPlayoffsSlotSource);

export const ESS_CH_PLAYOFFS_CONNECTOR_LINKS = buildBracketConnectorLinks(ESS_CH_PLAYOFFS_ORDER, ESS_CH_PLAYOFFS_SIZES, essChPlayoffsSlotSource);

const buildChGroupBracket = (group, teams4) => {
    const bracket = { group, teams: teams4.map(toBaseTeam) };
    PEM_STAGE1_STAGE_ORDER.forEach((stage) => {
        bracket[stage] = (stage === "uo" ? [0, 1] : [0]).map((i) => mkMatch(`essc${group}-${stage}-${i + 1}`, group, stage));
    });
    [[0, 3], [1, 2]].forEach(([a, b], i) => {
        bracket.uo[i].slotA = bracket.teams[a] ?? null;
        bracket.uo[i].slotB = bracket.teams[b] ?? null;
    });
    return bracket;
};

export const buildEssChallenger = (directTeams, qualifiers, extra = {}) => {
    const direct = directTeams.map(toBaseTeam);
    const qualified = qualifiers.map(toBaseTeam);
    const pots = [direct.slice(0, 4), direct.slice(4, 8), direct.slice(8, 12), qualified.slice(0, 4)].map(shuffle);
    return {
        ...extra,
        phase: "groups",
        teams: [...direct, ...qualified],
        directTeams: direct,
        ladderQualified: qualified,
        groups: Object.fromEntries(ESS_CH_GROUPS.map((group, g) => [group, buildChGroupBracket(group, pots.map((pot) => pot[g]).filter(Boolean))])),
        playoffs: null,
        qualified: [],
    };
};

const chGroupPlaces = (bracket) => [getMatchWinnerTeam(bracket?.uf?.[0]), getMatchWinnerTeam(bracket?.lr2?.[0])];

export const buildEssChPlayoffs = (groups) => {
    const playoffs = { group: "P" };
    playoffs.qf = ESS_CH_QF_PAIRS.map(([first, second], i) =>
        mkMatch(`esscp-qf-${i + 1}`, "P", "qf", toBaseTeam(chGroupPlaces(groups[first])[0]), toBaseTeam(chGroupPlaces(groups[second])[1]))
    );
    playoffs.sf = [0, 1].map((i) => mkMatch(`esscp-sf-${i + 1}`, "P", "sf"));
    return playoffs;
};

export const isEssChGroupsFinished = (ch) => !!ch?.groups && ESS_CH_GROUPS.every((group) => isBracketFinished(PEM_STAGE1_STAGE_ORDER, ch.groups[group]));
export const isEssChPlayoffsFinished = (ch) => !!ch?.playoffs && isBracketFinished(ESS_CH_PLAYOFFS_ORDER, ch.playoffs);

export const getEssChQualifiers = (ch) => (ch?.playoffs?.sf || []).map(getMatchWinnerTeam).filter(Boolean);
export const getEssChSemifinalLosers = (ch) => (ch?.playoffs?.sf || []).map(getMatchLoserTeam).filter(Boolean);

export const getBestOfForEssChallenger = () => 3;

const chHolders = (ch) => [
    ...ESS_CH_GROUPS.map((group) => ({ section: "groups", group, holder: ch?.groups?.[group], stages: PEM_STAGE1_STAGE_ORDER })),
    ...(ch?.playoffs ? [{ section: "playoffs", group: "P", holder: ch.playoffs, stages: ESS_CH_PLAYOFFS_ORDER }] : []),
].filter(({ holder }) => !!holder);

export const getEssChallengerMatches = (ch) => chHolders(ch).flatMap(({ holder, stages }) => stages.flatMap((stage) => holder?.[stage] || []));

export const locateEssChallengerMatch = (ch, matchId) => {
    for (const { section, group, holder, stages } of chHolders(ch)) {
        for (const stage of stages) {
            const idx = (holder?.[stage] || []).findIndex((match) => match.id === matchId);
            if (idx >= 0) return { section, group, stage, idx, match: holder[stage][idx] };
        }
    }
    return null;
};

const chHolderOf = (ch, section, group) => (section === "playoffs" ? ch.playoffs : ch.groups?.[group]);

const patchChHolder = (ch, section, group, holder) =>
    section === "playoffs" ? { ...ch, playoffs: holder } : { ...ch, groups: { ...ch.groups, [group]: holder } };

export const updateEssChallengerMatch = (ch, matchId, update) => {
    const spot = locateEssChallengerMatch(ch, matchId);
    if (!spot) return ch;
    const holder = chHolderOf(ch, spot.section, spot.group);
    const arr = [...holder[spot.stage]];
    arr[spot.idx] = update(arr[spot.idx]);
    return patchChHolder(ch, spot.section, spot.group, { ...holder, [spot.stage]: arr });
};

export const advanceEssChallenger = (ch, spot, winner, loser) => {
    const holder = { ...chHolderOf(ch, spot.section, spot.group) };
    if (spot.section === "playoffs") {
        ESS_CH_PLAYOFFS_ORDER.forEach((stage) => { holder[stage] = [...holder[stage]]; });
        advanceBracket(ESS_CH_PLAYOFFS_ROUTES, holder, spot.stage, spot.idx, winner, loser);
    } else {
        PEM_STAGE1_STAGE_ORDER.forEach((stage) => { holder[stage] = [...holder[stage]]; });
        advancePemStage1Bracket(holder, spot.stage, spot.idx, winner, loser);
    }
    return patchChHolder(ch, spot.section, spot.group, holder);
};

export const essChSlotSource = (section) => (section === "playoffs" ? essChPlayoffsSlotSource : pemStage1SlotSource);

export const canOpenEssChallengerMatch = (ch, section, holder, stage, idx) => {
    if (section !== ch?.phase) return false;
    return canOpenBracketMatch(section === "playoffs" ? ESS_CH_PLAYOFFS_ORDER : PEM_STAGE1_STAGE_ORDER, holder, stage, idx);
};

export const findCurrentEssChallengerMatch = (ch, group = null) => {
    if (!ch) return null;
    if (ch.phase === "playoffs") return findCurrentBracketMatch(ESS_CH_PLAYOFFS_ORDER, ch.playoffs);
    if (ch.phase === "groups") return group ? findCurrentBracketMatch(PEM_STAGE1_STAGE_ORDER, ch.groups?.[group]) : null;
    return null;
};

export const findNextEssChallengerMatch = (holder, section, current) =>
    findNextBracketMatch(section === "playoffs" ? ESS_CH_PLAYOFFS_ORDER : PEM_STAGE1_STAGE_ORDER, holder, current);

export const essChallengerMatchPoints = (match) => bracketMatchPoints(match, getBestOfForEssChallenger(match?.stage));

export const ESS_CH_STAGE_LABELS = { ...PEM_STAGE1_STAGE_LABELS, qf: "Quarterfinal", sf: "Semifinal" };
export const ESS_CH_RATING_WEIGHTS = { uo: 1.08, lr1: 1.04, uf: 1.18, lr2: 1.16, qf: 1.3, sf: 1.45 };
export const ESS_CH_BATTLE_STAKES = { uo: 0.35, lr1: 0.35, uf: 0.5, lr2: 0.5, qf: 0.6, sf: 0.75 };
export const ESS_CH_BIG_STAGE_GAINS = { uf: { winner: 2 }, lr2: { winner: 2 }, qf: { winner: 3 }, sf: { winner: 4, loser: 3 } };
export const ESS_CH_UPPER_STAGES = ["uo", "uf", "qf", "sf"];
export const ESS_CH_ELIMINATION_STAGES = ["lr1", "lr2", "qf", "sf"];

export const ESS_CH_PICKEM_ROUNDS = [
    { stage: "uo", label: "Opening Matches", total: 8 },
    { stage: "lr1", label: "Elimination Matches", total: 4 },
    { stage: "uf", label: "Winners' Matches", total: 4 },
    { stage: "lr2", label: "Decider Matches", total: 4 },
    { stage: "qf", label: "Quarterfinals", total: 4 },
    { stage: "sf", label: "Semifinals", total: 2 },
].map((round) => ({ ...round, key: `essc_${round.stage}` }));

export const getEssChallengerStakeTexts = (stage, finalsName = "Elite Star Series") => {
    switch (stage) {
        case "uo": return { winner: <>goes to the <b>Winners&apos; Match</b></>, loser: <>drops to the <b>Elimination Match</b></> };
        case "uf": return { winner: <>goes to the <b>Playoffs</b> as Group winner</>, loser: <>drops to the <b>Decider Match</b></> };
        case "lr1": return { winner: <>goes to the <b>Decider Match</b></>, loser: ESS_ELIMINATED };
        case "lr2": return { winner: <>goes to the <b>Playoffs</b> as Group runner-up</>, loser: ESS_ELIMINATED };
        case "qf": return { winner: <>goes to the <b>Semifinals</b></>, loser: ESS_ELIMINATED };
        case "sf": return { winner: <><b>qualifies</b> to {finalsName}!</>, loser: <>earns the <b>bronze medal</b></> };
        default: return { winner: null, loser: null };
    }
};

export const getEssChallengerPlaces = (ch) => {
    const losersOf = (holder, stage) => (holder?.[stage] || []).map(getMatchLoserTeam).filter(Boolean);
    const groupLosers = (stage) => ESS_CH_GROUPS.flatMap((group) => losersOf(ch?.groups?.[group], stage));
    return [
        ...getEssChQualifiers(ch),
        ...getEssChSemifinalLosers(ch),
        ...losersOf(ch?.playoffs, "qf"),
        ...groupLosers("lr2"),
        ...groupLosers("lr1"),
    ];
};

export const ESS_FINAL_STAGE_ORDER = ["uo", "usf", "lr1", "lsf", "uf", "lf", "cf", "gf"];
const ESS_FINAL_STAGE_SIZES = { uo: 4, usf: 2, lr1: 2, lsf: 2, uf: 1, lf: 1, cf: 1, gf: 1 };
const ESS_FINAL_BRACKET_ORDER = [[0, 7], [3, 4], [1, 6], [2, 5]];
const ESS_FINAL_BEST_OF = { uo: 3, usf: 3, lr1: 3, lsf: 3, uf: 5, lf: 5, cf: 5, gf: 7 };

export const ESS_FINAL_STAGE_LABELS = {
    uo: "Opening Round",
    usf: "Upper Semifinal",
    lr1: "Lower Round 1",
    lsf: "Lower Semifinal",
    uf: "Upper Final",
    lf: "Lower Final",
    cf: "Consolidation Final",
    gf: "Grand Final",
};

export const ESS_FINAL_COLUMN_TITLES = { ...ESS_FINAL_STAGE_LABELS, usf: "Upper Semifinals", lsf: "Lower Semifinals" };

export const essFinalSlotSource = (stage, idx, slotKey) => {
    const second = slotKey === "slotB";
    if (stage === "cf") return second ? { stage: "uf", idx: 0, want: "loser" } : { stage: "lf", idx: 0, want: "winner" };
    if (stage === "gf") return second ? { stage: "cf", idx: 0, want: "winner" } : { stage: "uf", idx: 0, want: "winner" };
    return pemGroupSlotSource(stage, idx, slotKey);
};

const ESS_FINAL_ROUTES = buildBracketRoutes(ESS_FINAL_STAGE_ORDER, ESS_FINAL_STAGE_SIZES, essFinalSlotSource);

export const ESS_FINAL_CONNECTOR_LINKS = buildBracketConnectorLinks(ESS_FINAL_STAGE_ORDER, ESS_FINAL_STAGE_SIZES, essFinalSlotSource);

export const buildEssFinals = (teams8, extra = {}) => {
    const bracket = { ...extra, group: null, teams: teams8.map(toBaseTeam) };
    ESS_FINAL_STAGE_ORDER.forEach((stage) => {
        bracket[stage] = Array.from({ length: ESS_FINAL_STAGE_SIZES[stage] }, (_, i) => mkMatch(`essf-${stage}-${i + 1}`, null, stage));
    });
    ESS_FINAL_BRACKET_ORDER.forEach(([a, b], i) => {
        bracket.uo[i].slotA = bracket.teams[a] ?? null;
        bracket.uo[i].slotB = bracket.teams[b] ?? null;
    });
    return bracket;
};

export const getBestOfForEssFinal = (stage) => ESS_FINAL_BEST_OF[stage] ?? 3;
export const isSingleEssFinalStage = (stage) => ESS_FINAL_STAGE_SIZES[stage] === 1;
export const canOpenEssFinalMatch = (bracket, stage, idx) => canOpenBracketMatch(ESS_FINAL_STAGE_ORDER, bracket, stage, idx);
export const findCurrentEssFinalMatch = (bracket) => findCurrentBracketMatch(ESS_FINAL_STAGE_ORDER, bracket);
export const findNextEssFinalMatch = (bracket, current) => findNextBracketMatch(ESS_FINAL_STAGE_ORDER, bracket, current);
export const advanceEssFinal = (bracket, stage, idx, winner, loser) => advanceBracket(ESS_FINAL_ROUTES, bracket, stage, idx, winner, loser);
export const getEssFinalMatches = (bracket) => ESS_FINAL_STAGE_ORDER.flatMap((stage) => bracket?.[stage] || []);
export const essFinalMatchPoints = (match) => bracketMatchPoints(match, getBestOfForEssFinal(match?.stage));
export const isEssFinalFinished = (bracket) => !!bracket?.gf?.[0]?.played;

export const locateEssFinalMatch = (bracket, matchId) => {
    for (const stage of ESS_FINAL_STAGE_ORDER) {
        const idx = (bracket?.[stage] || []).findIndex((match) => match.id === matchId);
        if (idx >= 0) return { section: "finals", stage, idx, match: bracket[stage][idx] };
    }
    return null;
};

export const updateEssFinalMatch = (bracket, matchId, update) => {
    const spot = locateEssFinalMatch(bracket, matchId);
    if (!spot) return bracket;
    const arr = [...bracket[spot.stage]];
    arr[spot.idx] = update(arr[spot.idx]);
    return { ...bracket, [spot.stage]: arr };
};

export const essFinalStageLabel = (stage) => ESS_FINAL_STAGE_LABELS[stage] ?? "";

export const ESS_FINAL_RATING_WEIGHTS = { uo: 1.6, usf: 2.0, lr1: 1.5, lsf: 1.8, uf: 2.4, lf: 2.2, cf: 2.8, gf: 4.2 };
export const ESS_FINAL_BATTLE_STAKES = { uo: 0.55, usf: 0.7, lr1: 0.55, lsf: 0.7, uf: 0.8, lf: 0.8, cf: 0.9, gf: 1 };
export const ESS_FINAL_BIG_STAGE_GAINS = {
    usf: { winner: 3 },
    lsf: { winner: 3 },
    uf: { winner: 4 },
    lf: { winner: 4 },
    cf: { winner: 5, loser: 4 },
    gf: { winner: 7, loser: 6 },
};
export const ESS_FINAL_UPPER_STAGES = ["uo", "usf", "uf", "gf"];
export const ESS_FINAL_ELIMINATION_STAGES = ["lr1", "lsf", "lf", "cf", "gf"];

export const ESS_FINAL_PICKEM_ROUNDS = [
    { stage: "uo", label: "Opening Rounds" },
    { stage: "usf", label: "Upper Semifinals" },
    { stage: "lr1", label: "Lower Rounds 1" },
    { stage: "lsf", label: "Lower Semifinals" },
    { stage: "lf", label: "the Lower Final" },
    { stage: "uf", label: "the Upper Final" },
    { stage: "cf", label: "the Consolidation Final" },
    { stage: "gf", label: "the Grand Final" },
].map((round) => ({ ...round, key: `essf_${round.stage}`, total: ESS_FINAL_STAGE_SIZES[round.stage] }));

export const getEssFinalStakeTexts = (stage) => {
    switch (stage) {
        case "uo": return { winner: <>goes to <b>Upper Semifinals</b></>, loser: <>drops to <b>Lower Round 1</b></> };
        case "usf": return { winner: <>goes to the <b>Upper Final</b></>, loser: <>drops to <b>Lower Semifinals</b></> };
        case "lr1": return { winner: <>goes to <b>Lower Semifinals</b></>, loser: ESS_ELIMINATED };
        case "lsf": return { winner: <>goes to the <b>Lower Final</b></>, loser: ESS_ELIMINATED };
        case "uf": return { winner: <>goes to the <b>Grand Final</b></>, loser: <>drops to the <b>Consolidation Final</b></> };
        case "lf": return { winner: <>goes to the <b>Consolidation Final</b></>, loser: "finishes 4th, still a great run!" };
        case "cf": return { winner: <>goes to the <b>Grand Final</b></>, loser: <>earns <b>Third Place Medal</b>!</> };
        case "gf": return { winner: <><b>WINS</b> the tournament!</>, loser: "second place is still wonderful!" };
        default: return { winner: null, loser: null };
    }
};

export const getEssFinalResults = (bracket) => ({
    winner: getMatchWinnerTeam(bracket?.gf?.[0]),
    runnerUp: getMatchLoserTeam(bracket?.gf?.[0]),
    thirdPlace: getMatchLoserTeam(bracket?.cf?.[0]),
    fourthPlace: getMatchLoserTeam(bracket?.lf?.[0]),
});

export const getEssFinalPlaces = (bracket) => {
    const results = getEssFinalResults(bracket);
    const losersOf = (stage) => (bracket?.[stage] || []).map(getMatchLoserTeam).filter(Boolean);
    return [results.winner, results.runnerUp, results.thirdPlace, results.fourthPlace, ...losersOf("lsf"), ...losersOf("lr1")].filter(Boolean);
};

const ESS_NEEDED_PICKEM = { lq: [22, 37], ch: [40, 64], main: [24, 40] };

export const getRandomEssNeededPickemPoints = (event) => randomBetween(...(ESS_NEEDED_PICKEM[event] ?? ESS_NEEDED_PICKEM.main));

export const essStageLabel = (type, stage) =>
    type === "essLq" ? essRungLabel(stage) : type === "essCh" ? ESS_CH_STAGE_LABELS[stage] ?? "" : essFinalStageLabel(stage);
