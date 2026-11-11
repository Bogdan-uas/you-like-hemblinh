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
import { toBaseTeam } from "./teams.js";
import { SWC_TYPE_ID, SWC_SC_TYPE_ID } from "./tournamentTypes.jsx";

export { SWC_TYPE_ID, SWC_SC_TYPE_ID };

export const SWC_REST_COUNT = 4;
export const SWC_DIRECT_TO = 10;
export const SWC_SC_TO = 42;
export const SWC_SC_QUALIFIER_COUNT = 2;

export const SWC_SC_BRACKETS = ["A", "B"];
export const SWC_GROUPS = ["A", "B"];

export const buildSwcSeeds = (sortedTeams) => {
    const teams = sortedTeams.map(toBaseTeam);
    return {
        resting: teams.slice(0, SWC_REST_COUNT),
        direct: teams.slice(SWC_REST_COUNT, SWC_DIRECT_TO),
        chase: teams.slice(SWC_DIRECT_TO, SWC_SC_TO),
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

const SWC_ELIMINATED = "is out of the Stormdraft World Championship";

export const SWC_SC_STAGE_ORDER = ["r16", "qf", "sf", "f"];
const SWC_SC_STAGE_SIZES = { r16: 8, qf: 4, sf: 2, f: 1 };
const SWC_SC_BEST_OF = { r16: 3, qf: 3, sf: 3, f: 5 };
const SWC_SC_SEED_PAIRS = [[0, 15], [7, 8], [4, 11], [3, 12], [2, 13], [5, 10], [6, 9], [1, 14]];

export const SWC_SC_STAGE_LABELS = { r16: "Round of 16", qf: "Quarterfinal", sf: "Semifinal", f: "Final" };
export const SWC_SC_COLUMN_TITLES = { r16: "Round of 16", qf: "Quarterfinals", sf: "Semifinals", f: "Final" };

export const swcScSlotSource = (stage, idx, slotKey) => {
    const k = SWC_SC_STAGE_ORDER.indexOf(stage);
    if (k <= 0) return null;
    return { stage: SWC_SC_STAGE_ORDER[k - 1], idx: idx * 2 + (slotKey === "slotB" ? 1 : 0), want: "winner" };
};

const SWC_SC_ROUTES = buildBracketRoutes(SWC_SC_STAGE_ORDER, SWC_SC_STAGE_SIZES, swcScSlotSource);

export const SWC_SC_CONNECTOR_LINKS = buildBracketConnectorLinks(SWC_SC_STAGE_ORDER, SWC_SC_STAGE_SIZES, swcScSlotSource);

const snakeSplit = (teams, count) => {
    const parts = Array.from({ length: count }, () => []);
    teams.forEach((team, i) => {
        const round = Math.floor(i / count);
        const pos = i % count;
        parts[round % 2 === 0 ? pos : count - 1 - pos].push(team);
    });
    return parts;
};

const buildScBracket = (group, teams) => {
    const seeded = teams.map(toBaseTeam);
    const bracket = { group, teams: seeded };
    SWC_SC_STAGE_ORDER.forEach((stage) => {
        bracket[stage] = Array.from({ length: SWC_SC_STAGE_SIZES[stage] }, (_, i) => mkMatch(`swcs${group}-${stage}-${i + 1}`, group, stage));
    });
    SWC_SC_SEED_PAIRS.forEach(([a, b], i) => {
        bracket.r16[i].slotA = seeded[a] ?? null;
        bracket.r16[i].slotB = seeded[b] ?? null;
    });
    return bracket;
};

export const buildSwcStormChase = (teams, extra = {}) => {
    const parts = snakeSplit(teams.map(toBaseTeam), SWC_SC_BRACKETS.length);
    return {
        ...extra,
        phase: "brackets",
        teams: teams.map(toBaseTeam),
        brackets: Object.fromEntries(SWC_SC_BRACKETS.map((group, i) => [group, buildScBracket(group, parts[i])])),
        qualified: [],
    };
};

export const getBestOfForSwcStormChase = (stage) => SWC_SC_BEST_OF[stage] ?? 1;

export const canOpenSwcScMatch = (holder, stage, idx) => canOpenBracketMatch(SWC_SC_STAGE_ORDER, holder, stage, idx);

export const findCurrentSwcScMatch = (sc, group) => findCurrentBracketMatch(SWC_SC_STAGE_ORDER, sc?.brackets?.[group]);

export const findNextSwcScMatch = (holder, current) => findNextBracketMatch(SWC_SC_STAGE_ORDER, holder, current);

export const isSwcStormChaseFinished = (sc) => !!sc && SWC_SC_BRACKETS.every((group) => !!sc.brackets?.[group]?.f?.[0]?.played);

export const getSwcScMatches = (sc) =>
    SWC_SC_BRACKETS.flatMap((group) => SWC_SC_STAGE_ORDER.flatMap((stage) => sc?.brackets?.[group]?.[stage] || []));

export const locateSwcScMatch = (sc, matchId) => {
    for (const group of SWC_SC_BRACKETS) {
        const bracket = sc?.brackets?.[group];
        for (const stage of SWC_SC_STAGE_ORDER) {
            const idx = (bracket?.[stage] || []).findIndex((match) => match.id === matchId);
            if (idx >= 0) return { section: "brackets", group, stage, idx, match: bracket[stage][idx] };
        }
    }
    return null;
};

export const updateSwcScMatch = (sc, matchId, update) => {
    const spot = locateSwcScMatch(sc, matchId);
    if (!spot) return sc;
    const bracket = sc.brackets[spot.group];
    const arr = [...bracket[spot.stage]];
    arr[spot.idx] = update(arr[spot.idx]);
    return { ...sc, brackets: { ...sc.brackets, [spot.group]: { ...bracket, [spot.stage]: arr } } };
};

export const advanceSwcStormChase = (sc, spot, winner, loser) => {
    const bracket = { ...sc.brackets[spot.group] };
    SWC_SC_STAGE_ORDER.forEach((stage) => {
        bracket[stage] = [...bracket[stage]];
    });
    advanceBracket(SWC_SC_ROUTES, bracket, spot.stage, spot.idx, winner, loser);
    return { ...sc, brackets: { ...sc.brackets, [spot.group]: bracket } };
};

export const swcScMatchPoints = (match) => bracketMatchPoints(match, getBestOfForSwcStormChase(match?.stage));

export const getSwcScQualifiers = (sc) => SWC_SC_BRACKETS.map((group) => getMatchWinnerTeam(sc?.brackets?.[group]?.f?.[0])).filter(Boolean);

export const getSwcScPlaces = (sc) => {
    const losersOf = (stage) => SWC_SC_BRACKETS.flatMap((group) => (sc?.brackets?.[group]?.[stage] || []).map(getMatchLoserTeam).filter(Boolean));
    return [...getSwcScQualifiers(sc), ...losersOf("f"), ...losersOf("sf"), ...losersOf("qf"), ...losersOf("r16")];
};

export const SWC_SC_RATING_WEIGHTS = { r16: 0.74, qf: 0.8, sf: 0.9, f: 1.0 };
export const SWC_SC_BATTLE_STAKES = { r16: 0.15, qf: 0.22, sf: 0.32, f: 0.45 };
export const SWC_SC_BIG_STAGE_GAINS = { f: { winner: 2 } };
export const SWC_SC_UPPER_STAGES = SWC_SC_STAGE_ORDER;
export const SWC_SC_ELIMINATION_STAGES = SWC_SC_STAGE_ORDER;

export const SWC_SC_PICKEM_ROUNDS = [
    { stage: "r16", label: "Rounds of 16", total: 16 },
    { stage: "qf", label: "Quarterfinals", total: 8 },
    { stage: "sf", label: "Semifinals", total: 4 },
    { stage: "f", label: "Finals", total: 2 },
].map((round) => ({ ...round, key: `swcs_${round.stage}` }));

export const getSwcScStakeTexts = (stage, mainName = "Stormdraft World Championship") => {
    switch (stage) {
        case "r16": return { winner: <>goes to the <b>Quarterfinals</b></>, loser: SWC_ELIMINATED };
        case "qf": return { winner: <>goes to the <b>Semifinals</b></>, loser: SWC_ELIMINATED };
        case "sf": return { winner: <>goes to the <b>Final</b></>, loser: SWC_ELIMINATED };
        case "f": return { winner: <><b>qualifies</b> to {mainName}!</>, loser: "falls one step short of the main event" };
        default: return { winner: null, loser: null };
    }
};

export const SWC_PLAYOFFS_ORDER = ["sf", "tp", "gf"];
const SWC_PLAYOFFS_SIZES = { sf: 2, tp: 1, gf: 1 };
const SWC_SF_PAIRS = [["A", "B"], ["B", "A"]];
const SWC_MAIN_BEST_OF = { uo: 3, lr1: 3, uf: 3, lr2: 3, sf: 5, tp: 5, gf: 7 };

export const swcPlayoffsSlotSource = (stage, idx, slotKey) => {
    if (stage === "tp") return { stage: "sf", idx: slotKey === "slotB" ? 1 : 0, want: "loser" };
    if (stage === "gf") return { stage: "sf", idx: slotKey === "slotB" ? 1 : 0, want: "winner" };
    return null;
};

const SWC_PLAYOFFS_ROUTES = buildBracketRoutes(SWC_PLAYOFFS_ORDER, SWC_PLAYOFFS_SIZES, swcPlayoffsSlotSource);

export const SWC_PLAYOFFS_CONNECTOR_LINKS = buildBracketConnectorLinks(["sf", "gf"], SWC_PLAYOFFS_SIZES, (stage, idx, slotKey) =>
    stage === "gf" ? swcPlayoffsSlotSource(stage, idx, slotKey) : null
);

const buildGroupBracket = (group, teams4) => {
    const bracket = { group, teams: teams4.map(toBaseTeam) };
    PEM_STAGE1_STAGE_ORDER.forEach((stage) => {
        bracket[stage] = (stage === "uo" ? [0, 1] : [0]).map((i) => mkMatch(`swcg${group}-${stage}-${i + 1}`, group, stage));
    });
    [[0, 3], [1, 2]].forEach(([a, b], i) => {
        bracket.uo[i].slotA = bracket.teams[a] ?? null;
        bracket.uo[i].slotB = bracket.teams[b] ?? null;
    });
    return bracket;
};

export const buildSwcMain = (directTeams, qualifiers, extra = {}) => {
    const direct = directTeams.map(toBaseTeam);
    const qualified = qualifiers.map(toBaseTeam);
    const pots = [direct.slice(0, 2), direct.slice(2, 4), direct.slice(4, 6), qualified.slice(0, 2)].map(shuffle);
    return {
        ...extra,
        phase: "groups",
        teams: [...direct, ...qualified],
        directTeams: direct,
        chaseQualified: qualified,
        groups: Object.fromEntries(SWC_GROUPS.map((group, g) => [group, buildGroupBracket(group, pots.map((pot) => pot[g]).filter(Boolean))])),
        playoffs: null,
    };
};

const groupPlaces = (bracket) => [getMatchWinnerTeam(bracket?.uf?.[0]), getMatchWinnerTeam(bracket?.lr2?.[0])];

export const buildSwcPlayoffs = (groups) => {
    const playoffs = { group: "P" };
    playoffs.sf = SWC_SF_PAIRS.map(([first, second], i) =>
        mkMatch(`swcp-sf-${i + 1}`, "P", "sf", toBaseTeam(groupPlaces(groups[first])[0]), toBaseTeam(groupPlaces(groups[second])[1]))
    );
    playoffs.tp = [mkMatch("swcp-tp-1", "P", "tp")];
    playoffs.gf = [mkMatch("swcp-gf-1", "P", "gf")];
    return playoffs;
};

export const isSwcGroupsFinished = (main) => !!main?.groups && SWC_GROUPS.every((group) => isBracketFinished(PEM_STAGE1_STAGE_ORDER, main.groups[group]));
export const isSwcMainFinished = (main) => !!main?.playoffs?.gf?.[0]?.played && !!main?.playoffs?.tp?.[0]?.played;

export const getBestOfForSwcMain = (stage) => SWC_MAIN_BEST_OF[stage] ?? 3;

const mainHolders = (main) => [
    ...SWC_GROUPS.map((group) => ({ section: "groups", group, holder: main?.groups?.[group], stages: PEM_STAGE1_STAGE_ORDER })),
    ...(main?.playoffs ? [{ section: "playoffs", group: "P", holder: main.playoffs, stages: SWC_PLAYOFFS_ORDER }] : []),
].filter(({ holder }) => !!holder);

export const getSwcMainMatches = (main) => mainHolders(main).flatMap(({ holder, stages }) => stages.flatMap((stage) => holder?.[stage] || []));

export const locateSwcMainMatch = (main, matchId) => {
    for (const { section, group, holder, stages } of mainHolders(main)) {
        for (const stage of stages) {
            const idx = (holder?.[stage] || []).findIndex((match) => match.id === matchId);
            if (idx >= 0) return { section, group, stage, idx, match: holder[stage][idx] };
        }
    }
    return null;
};

const mainHolderOf = (main, section, group) => (section === "playoffs" ? main.playoffs : main.groups?.[group]);

const patchMainHolder = (main, section, group, holder) =>
    section === "playoffs" ? { ...main, playoffs: holder } : { ...main, groups: { ...main.groups, [group]: holder } };

export const updateSwcMainMatch = (main, matchId, update) => {
    const spot = locateSwcMainMatch(main, matchId);
    if (!spot) return main;
    const holder = mainHolderOf(main, spot.section, spot.group);
    const arr = [...holder[spot.stage]];
    arr[spot.idx] = update(arr[spot.idx]);
    return patchMainHolder(main, spot.section, spot.group, { ...holder, [spot.stage]: arr });
};

export const advanceSwcMain = (main, spot, winner, loser) => {
    const holder = { ...mainHolderOf(main, spot.section, spot.group) };
    if (spot.section === "playoffs") {
        SWC_PLAYOFFS_ORDER.forEach((stage) => {
            holder[stage] = [...holder[stage]];
        });
        advanceBracket(SWC_PLAYOFFS_ROUTES, holder, spot.stage, spot.idx, winner, loser);
    } else {
        PEM_STAGE1_STAGE_ORDER.forEach((stage) => {
            holder[stage] = [...holder[stage]];
        });
        advancePemStage1Bracket(holder, spot.stage, spot.idx, winner, loser);
    }
    return patchMainHolder(main, spot.section, spot.group, holder);
};

export const swcMainSlotSource = (section) => (section === "playoffs" ? swcPlayoffsSlotSource : pemStage1SlotSource);

const mainOrderOf = (section) => (section === "playoffs" ? SWC_PLAYOFFS_ORDER : PEM_STAGE1_STAGE_ORDER);

export const canOpenSwcMainMatch = (main, section, holder, stage, idx) => section === main?.phase && canOpenBracketMatch(mainOrderOf(section), holder, stage, idx);

export const findCurrentSwcMainMatch = (main, group = null) => {
    if (main?.phase === "playoffs") return findCurrentBracketMatch(SWC_PLAYOFFS_ORDER, main.playoffs);
    if (main?.phase === "groups") return group ? findCurrentBracketMatch(PEM_STAGE1_STAGE_ORDER, main.groups?.[group]) : null;
    return null;
};

export const findNextSwcMainMatch = (holder, section, current) => findNextBracketMatch(mainOrderOf(section), holder, current);

export const swcMainMatchPoints = (match) => bracketMatchPoints(match, getBestOfForSwcMain(match?.stage));

export const SWC_MAIN_STAGE_LABELS = { ...PEM_STAGE1_STAGE_LABELS, sf: "Semifinal", tp: "Third Place Decider", gf: "Grand Final" };
export const SWC_PLAYOFFS_COLUMN_TITLES = { sf: "Semifinals", tp: "Third Place Decider", gf: "Grand Final" };

export const SWC_MAIN_RATING_WEIGHTS = { uo: 1.28, lr1: 1.2, uf: 1.44, lr2: 1.4, sf: 2.0, tp: 1.9, gf: 3.6 };
export const SWC_MAIN_BATTLE_STAKES = { uo: 0.3, lr1: 0.3, uf: 0.45, lr2: 0.45, sf: 0.75, tp: 0.8, gf: 1 };
export const SWC_MAIN_BIG_STAGE_GAINS = { uf: { winner: 2 }, lr2: { winner: 2 }, sf: { winner: 3 }, tp: { winner: 4, loser: 3 }, gf: { winner: 6, loser: 5 } };
export const SWC_MAIN_UPPER_STAGES = ["uo", "uf", "sf", "gf"];
export const SWC_MAIN_ELIMINATION_STAGES = ["lr1", "lr2", "sf", "tp", "gf"];

export const SWC_MAIN_PICKEM_ROUNDS = [
    { stage: "uo", label: "Opening Matches", total: 4 },
    { stage: "lr1", label: "Elimination Matches", total: 2 },
    { stage: "uf", label: "Winners' Matches", total: 2 },
    { stage: "lr2", label: "Decider Matches", total: 2 },
    { stage: "sf", label: "Semifinals", total: 2 },
    { stage: "tp", label: "the Third Place Decider", total: 1 },
    { stage: "gf", label: "the Grand Final", total: 1 },
].map((round) => ({ ...round, key: `swcm_${round.stage}` }));

export const getSwcMainStakeTexts = (stage) => {
    switch (stage) {
        case "uo": return { winner: <>goes to the <b>Winners&apos; Match</b></>, loser: <>drops to the <b>Elimination Match</b></> };
        case "uf": return { winner: <>goes to the <b>Playoffs</b> as Group winner</>, loser: <>drops to the <b>Decider Match</b></> };
        case "lr1": return { winner: <>goes to the <b>Decider Match</b></>, loser: SWC_ELIMINATED };
        case "lr2": return { winner: <>goes to the <b>Playoffs</b> as Group runner-up</>, loser: SWC_ELIMINATED };
        case "sf": return { winner: <>goes to the <b>Grand Final</b></>, loser: <>drops to the <b>Third Place Decider</b></> };
        case "tp": return { winner: <>earns <b>Third Place Medal</b>!</>, loser: "finishes 4th, still a great run!" };
        case "gf": return { winner: <><b>WINS</b> the tournament!</>, loser: "second place is still wonderful!" };
        default: return { winner: null, loser: null };
    }
};

export const getSwcMainResults = (main) => ({
    winner: getMatchWinnerTeam(main?.playoffs?.gf?.[0]),
    runnerUp: getMatchLoserTeam(main?.playoffs?.gf?.[0]),
    thirdPlace: getMatchWinnerTeam(main?.playoffs?.tp?.[0]),
    fourthPlace: getMatchLoserTeam(main?.playoffs?.tp?.[0]),
});

export const getSwcMainPlaces = (main) => {
    const results = getSwcMainResults(main);
    const groupLosers = (stage) => SWC_GROUPS.flatMap((group) => (main?.groups?.[group]?.[stage] || []).map(getMatchLoserTeam).filter(Boolean));
    return [results.winner, results.runnerUp, results.thirdPlace, results.fourthPlace, ...groupLosers("lr2"), ...groupLosers("lr1")].filter(Boolean);
};

const SWC_NEEDED_PICKEM = { sc: [38, 60], main: [22, 36] };

export const getRandomSwcNeededPickemPoints = (event) => randomBetween(...(SWC_NEEDED_PICKEM[event] ?? SWC_NEEDED_PICKEM.main));

export const swcStageLabel = (type, stage) => (type === "swcSc" ? SWC_SC_STAGE_LABELS[stage] ?? "" : SWC_MAIN_STAGE_LABELS[stage] ?? "");

export const isSingleSwcStage = (type, stage) => (type === "swcSc" ? stage === "f" : ["uf", "lr1", "lr2", "tp", "gf"].includes(stage));

