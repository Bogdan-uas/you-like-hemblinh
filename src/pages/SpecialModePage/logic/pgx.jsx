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
import { PEM_STAGE1_STAGE_ORDER, PEM_STAGE1_STAGE_LABELS, advancePemStage1Bracket } from "./pemStage1.jsx";
import {
    ECL_STAGE_ORDER,
    ECL_RATING_WEIGHTS,
    ECL_BATTLE_STAKES,
    ECL_PICKEM_ROUNDS,
    buildEclBracket,
    getBestOfForEcl,
    getEclMatches,
    getEclPlaces,
    getEclResults,
    getEclStakeTexts,
    eclStageLabel,
} from "./ecl.jsx";
import { PEM_PLAYOFFS_RATING_WEIGHTS, PEM_GROUP_BATTLE_STAKES } from "./pemSeries.jsx";
import { toBaseTeam } from "./teams.js";
import { PGX_LAST_CITY_LS_KEY } from "./storageKeys.js";

import { PGX_GM_TYPE_ID, PGX_IM_TYPE_ID, PGX_CM_TYPE_ID } from "./tournamentTypes.jsx";

export { PGX_GM_TYPE_ID, PGX_IM_TYPE_ID, PGX_CM_TYPE_ID };

export const PGX_GM_DIRECT_COUNT = 15;
export const PGX_IM_DIRECT_FROM = 15;
export const PGX_IM_DIRECT_TO = 32;
export const PGX_CM_GROUP_DIRECT_TO = 40;
export const PGX_CM_PLAYIN_TO = 64;
export const PGX_IM_ENTRY_DIRECT_COUNT = 11;
export const PGX_CM_QUALIFIER_COUNT = 4;

export { PGX_SWISS_FORMAT } from "./swiss.js";

export const PGX_CITIES = [
    "Atlanta", "Austin", "Boston", "Columbus", "Dallas", "Fort Worth", "Las Vegas", "Los Angeles", "New York", "Orlando",
    "Washington", "Montreal", "Toronto", "Vancouver",
    "Cologne", "Katowice", "Berlin", "Hamburg", "Leipzig", "Copenhagen", "Aarhus", "Odense", "Stockholm", "Malmö",
    "Jönköping", "Oslo", "Helsinki", "London", "Birmingham", "Paris", "Marseille", "Lyon", "Antwerp", "Brussels",
    "Amsterdam", "Rotterdam", "Utrecht", "Madrid", "Valencia", "Barcelona", "Málaga", "Lisbon", "Porto", "Bucharest",
    "Cluj-Napoca", "Belgrade", "Budapest", "Kraków", "Warsaw", "Prague", "Vienna", "Zürich", "Milan", "Rome",
    "Istanbul", "Sofia", "Athens", "Dublin",
    "Shanghai", "Chengdu", "Chongqing", "Beijing", "Shenzhen", "Macau", "Hong Kong", "Taipei", "Singapore", "Bangkok",
    "Kuala Lumpur", "Manila", "Jakarta", "Tokyo", "Osaka", "Seoul", "Busan", "Riyadh", "Abu Dhabi", "Dubai", "Doha",
    "Melbourne", "Sydney", "Brisbane", "Perth",
];

export const pickPgxCity = () => {
    let previousCity = null;
    try {
        previousCity = localStorage.getItem(PGX_LAST_CITY_LS_KEY);
    } catch {
        previousCity = null;
    }
    const pool = PGX_CITIES.filter((city) => city !== previousCity);
    const city = pool[Math.floor(Math.random() * pool.length)];
    try {
        localStorage.setItem(PGX_LAST_CITY_LS_KEY, city);
    } catch {
        return city;
    }
    return city;
};

export const buildPgxSeeds = (sortedTeams) => {
    const teams = sortedTeams.map(toBaseTeam);
    return {
        gm: teams.slice(0, PGX_GM_DIRECT_COUNT),
        im: teams.slice(PGX_IM_DIRECT_FROM, PGX_IM_DIRECT_TO),
        cmGroups: teams.slice(PGX_IM_DIRECT_TO, PGX_CM_GROUP_DIRECT_TO),
        cmPlayIn: teams.slice(PGX_CM_GROUP_DIRECT_TO, PGX_CM_PLAYIN_TO),
    };
};

export const PGX_CM_GROUPS = ["A", "B", "C", "D"];
export const PGX_PLAYIN_STAGE_ORDER = ["pr1", "pr2"];
const PGX_PLAYIN_SIZES = { pr1: 8, pr2: 8 };
export const PGX_DECIDER_STAGE = "dq";
const PGX_DECIDER_PAIRS = [["A", "B"], ["B", "A"], ["C", "D"], ["D", "C"]];

export const PGX_STAGE_LABELS = {
    pr1: "Play-in Round 1",
    pr2: "Play-in Round 2",
    ...PEM_STAGE1_STAGE_LABELS,
    dq: "Decider",
    er: "Entry Round",
};

export const pgxStageLabel = (section, stage) =>
    section === "im" ? (stage === "er" ? PGX_STAGE_LABELS.er : eclStageLabel(stage)) : PGX_STAGE_LABELS[stage] ?? "";

export const pgxPlayInSlotSource = (stage, idx, slotKey) =>
    stage === "pr2" && slotKey === "slotB" ? { stage: "pr1", idx: 7 - idx, want: "winner" } : null;

const PGX_PLAYIN_ROUTES = buildBracketRoutes(PGX_PLAYIN_STAGE_ORDER, PGX_PLAYIN_SIZES, pgxPlayInSlotSource);

export const PGX_PLAYIN_CONNECTOR_LINKS = buildBracketConnectorLinks(PGX_PLAYIN_STAGE_ORDER, PGX_PLAYIN_SIZES, pgxPlayInSlotSource);

const mkMatch = (id, group, stage, slotA = null, slotB = null) => ({ ...makeBracketMatch(id, group, stage), slotA, slotB });

const buildPlayIn = (playInTeams) => {
    const teams = playInTeams.map(toBaseTeam);
    return {
        teams,
        pr1: Array.from({ length: 8 }, (_, i) => mkMatch(`pgxp-pr1-${i + 1}`, "P", "pr1", teams[8 + i] ?? null, teams[23 - i] ?? null)),
        pr2: Array.from({ length: 8 }, (_, i) => mkMatch(`pgxp-pr2-${i + 1}`, "P", "pr2", teams[i] ?? null, null)),
    };
};

export const buildPgxCandidate = (seeds, extra = {}) => ({
    ...extra,
    phase: "playIn",
    directTeams: seeds.cmGroups.map(toBaseTeam),
    playIn: buildPlayIn(seeds.cmPlayIn),
    groups: null,
    deciders: null,
    qualified: [],
});

const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

const buildGroupBracket = (group, teams4) => {
    const bracket = { group, teams: teams4.map(toBaseTeam) };
    PEM_STAGE1_STAGE_ORDER.forEach((stage) => {
        bracket[stage] = (stage === "uo" ? [0, 1] : [0]).map((i) => mkMatch(`pgx${group}-${stage}-${i + 1}`, group, stage));
    });
    [[0, 3], [1, 2]].forEach(([a, b], i) => {
        bracket.uo[i].slotA = bracket.teams[a] ?? null;
        bracket.uo[i].slotB = bracket.teams[b] ?? null;
    });
    return bracket;
};

export const getPgxPlayInWinners = (playIn) => (playIn?.pr2 || []).map(getMatchWinnerTeam).filter(Boolean);

export const buildPgxGroups = (directTeams, playInWinners, rankOf) => {
    const byRank = (teams) => [...teams].sort((a, b) => rankOf(a) - rankOf(b));
    const direct = byRank(directTeams);
    const winners = byRank(playInWinners);
    const pots = [direct.slice(0, 4), direct.slice(4, 8), winners.slice(0, 4), winners.slice(4, 8)].map(shuffle);
    return Object.fromEntries(PGX_CM_GROUPS.map((group, g) => [group, buildGroupBracket(group, pots.map((pot) => pot[g]).filter(Boolean))]));
};

const groupPlaces = (bracket) => [getMatchWinnerTeam(bracket?.uf?.[0]), getMatchWinnerTeam(bracket?.lr2?.[0])];

export const buildPgxDeciders = (groups) => ({
    dq: PGX_DECIDER_PAIRS.map(([first, second], i) =>
        mkMatch(`pgxd-dq-${i + 1}`, "D", "dq", toBaseTeam(groupPlaces(groups[first])[0]), toBaseTeam(groupPlaces(groups[second])[1]))
    ),
});

export const getPgxGroupQualifiers = (groups) =>
    PGX_CM_GROUPS.flatMap((group) => groupPlaces(groups?.[group])).filter(Boolean);

export const isPgxPlayInFinished = (playIn) => !!playIn && isBracketFinished(PGX_PLAYIN_STAGE_ORDER, playIn);
export const isPgxGroupsFinished = (groups) => !!groups && PGX_CM_GROUPS.every((group) => isBracketFinished(PEM_STAGE1_STAGE_ORDER, groups[group]));
export const isPgxDecidersFinished = (deciders) => !!deciders && deciders.dq.every((match) => match.played);

export const getPgxDeciderWinners = (deciders) => (deciders?.dq || []).map(getMatchWinnerTeam).filter(Boolean);

export const getBestOfForPgxCandidate = (stage) => (stage === "uo" ? 1 : 3);

const sectionHolders = (cm) => [
    ...(cm?.playIn ? [{ section: "playIn", group: "P", holder: cm.playIn, stages: PGX_PLAYIN_STAGE_ORDER }] : []),
    ...(cm?.groups ? PGX_CM_GROUPS.map((group) => ({ section: "groups", group, holder: cm.groups[group], stages: PEM_STAGE1_STAGE_ORDER })) : []),
    ...(cm?.deciders ? [{ section: "deciders", group: "D", holder: cm.deciders, stages: [PGX_DECIDER_STAGE] }] : []),
];

export const getPgxCandidateMatches = (cm) =>
    sectionHolders(cm).flatMap(({ holder, stages }) => stages.flatMap((stage) => holder?.[stage] || []));

export const locatePgxCandidateMatch = (cm, matchId) => {
    for (const { section, group, holder, stages } of sectionHolders(cm)) {
        for (const stage of stages) {
            const idx = (holder?.[stage] || []).findIndex((match) => match.id === matchId);
            if (idx >= 0) return { section, group, stage, idx, match: holder[stage][idx] };
        }
    }
    return null;
};

const patchHolder = (cm, section, group, holder) => {
    if (section === "playIn") return { ...cm, playIn: holder };
    if (section === "deciders") return { ...cm, deciders: holder };
    return { ...cm, groups: { ...cm.groups, [group]: holder } };
};

const holderOf = (cm, section, group) =>
    section === "playIn" ? cm.playIn : section === "deciders" ? cm.deciders : cm.groups?.[group];

export const updatePgxCandidateMatch = (cm, matchId, update) => {
    const spot = locatePgxCandidateMatch(cm, matchId);
    if (!spot) return cm;
    const holder = holderOf(cm, spot.section, spot.group);
    const arr = [...holder[spot.stage]];
    arr[spot.idx] = update(arr[spot.idx]);
    return patchHolder(cm, spot.section, spot.group, { ...holder, [spot.stage]: arr });
};

export const advancePgxCandidate = (cm, spot, winner, loser) => {
    const holder = { ...holderOf(cm, spot.section, spot.group) };
    if (spot.section === "playIn") {
        PGX_PLAYIN_STAGE_ORDER.forEach((stage) => { holder[stage] = [...holder[stage]]; });
        advanceBracket(PGX_PLAYIN_ROUTES, holder, spot.stage, spot.idx, winner, loser);
    } else if (spot.section === "groups") {
        PEM_STAGE1_STAGE_ORDER.forEach((stage) => { holder[stage] = [...holder[stage]]; });
        advancePemStage1Bracket(holder, spot.stage, spot.idx, winner, loser);
    }
    return patchHolder(cm, spot.section, spot.group, holder);
};

export const canOpenPgxCandidateMatch = (cm, section, holder, stage, idx) => {
    if (section !== cm?.phase) return false;
    if (section === "playIn") return canOpenBracketMatch(PGX_PLAYIN_STAGE_ORDER, holder, stage, idx);
    if (section === "deciders") return canOpenBracketMatch([PGX_DECIDER_STAGE], holder, stage, idx);
    return canOpenBracketMatch(PEM_STAGE1_STAGE_ORDER, holder, stage, idx);
};

export const findCurrentPgxCandidateMatch = (cm, group = null) => {
    if (!cm) return null;
    if (cm.phase === "playIn") return findCurrentBracketMatch(PGX_PLAYIN_STAGE_ORDER, cm.playIn);
    if (cm.phase === "deciders") return findCurrentBracketMatch([PGX_DECIDER_STAGE], cm.deciders);
    if (cm.phase === "groups") return group ? findCurrentBracketMatch(PEM_STAGE1_STAGE_ORDER, cm.groups?.[group]) : null;
    return null;
};

export const findNextPgxCandidateMatch = (cm, holder, section, current) =>
    findNextBracketMatch(
        section === "playIn" ? PGX_PLAYIN_STAGE_ORDER : section === "deciders" ? [PGX_DECIDER_STAGE] : PEM_STAGE1_STAGE_ORDER,
        holder,
        current
    );

export const pgxCandidateMatchPoints = (match) => bracketMatchPoints(match, getBestOfForPgxCandidate(match?.stage));

export const PGX_CM_RATING_WEIGHTS = { pr1: 0.78, pr2: 0.84, uo: 0.86, lr1: 0.88, uf: 0.98, lr2: 0.96, dq: 1.1 };
export const PGX_CM_BATTLE_STAKES = { pr1: 0.15, pr2: 0.2, uo: 0.2, lr1: 0.25, uf: 0.35, lr2: 0.35, dq: 0.5 };
export const PGX_CM_BIG_STAGE_GAINS = { pr2: { winner: 1 }, uf: { winner: 2 }, lr2: { winner: 2 }, dq: { winner: 3 } };
export const PGX_CM_UPPER_STAGES = ["pr1", "pr2", "uo", "uf", "dq"];
export const PGX_CM_ELIMINATION_STAGES = ["pr1", "pr2", "lr1", "lr2", "dq"];

export const PGX_CM_PICKEM_ROUNDS = [
    { stage: "pr1", label: "Play-in Rounds 1", total: 8 },
    { stage: "pr2", label: "Play-in Rounds 2", total: 8 },
    { stage: "uo", label: "Opening Matches", total: 8 },
    { stage: "lr1", label: "Elimination Matches", total: 4 },
    { stage: "uf", label: "Winners' Matches", total: 4 },
    { stage: "lr2", label: "Decider Matches", total: 4 },
    { stage: "dq", label: "Deciders", total: 4 },
].map((round) => ({ ...round, key: `pgxc_${round.stage}` }));

const PGX_ELIMINATED = "flies out of this tournament";

export const getPgxCandidateStakeTexts = (stage, imName = "PGX International Masters") => {
    switch (stage) {
        case "pr1": return { winner: <>goes to <b>Play-in Round 2</b></>, loser: PGX_ELIMINATED };
        case "pr2": return { winner: <><b>qualifies</b> to the Group Stage</>, loser: PGX_ELIMINATED };
        case "uo": return { winner: <>goes to the <b>Winners&apos; Match</b></>, loser: <>drops to the <b>Elimination Match</b></> };
        case "uf": return { winner: <>goes to the <b>Deciders</b> as Group winner</>, loser: <>drops to the <b>Decider Match</b></> };
        case "lr1": return { winner: <>goes to the <b>Decider Match</b></>, loser: PGX_ELIMINATED };
        case "lr2": return { winner: <>goes to the <b>Deciders</b> as Group runner-up</>, loser: PGX_ELIMINATED };
        case "dq": return { winner: <><b>qualifies</b> to {imName}</>, loser: <>doesn't make it into {imName}</> };
        default: return { winner: null, loser: null };
    }
};

export const getPgxCandidatePlaces = (cm) => {
    const deciderLosers = (cm?.deciders?.dq || []).map(getMatchLoserTeam).filter(Boolean);
    const groupLosers = (stage) => PGX_CM_GROUPS.map((group) => getMatchLoserTeam(cm?.groups?.[group]?.[stage]?.[0])).filter(Boolean);
    const playInLosers = (stage) => (cm?.playIn?.[stage] || []).map(getMatchLoserTeam).filter(Boolean);
    return [
        ...getPgxDeciderWinners(cm?.deciders),
        ...deciderLosers,
        ...groupLosers("lr2"),
        ...groupLosers("lr1"),
        ...playInLosers("pr2"),
        ...playInLosers("pr1"),
    ];
};

const PGX_CM_MIN_NEEDED_PICKEM = 52;
const PGX_CM_MAX_NEEDED_PICKEM = 85;
const PGX_IM_MIN_NEEDED_PICKEM = 46;
const PGX_IM_MAX_NEEDED_PICKEM = 76;
const PGX_GM_MIN_NEEDED_PICKEM = 67;
const PGX_GM_MAX_NEEDED_PICKEM = 110;

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const getRandomPgxNeededPickemPoints = (event) =>
    event === "cm"
        ? randomBetween(PGX_CM_MIN_NEEDED_PICKEM, PGX_CM_MAX_NEEDED_PICKEM)
        : event === "im"
            ? randomBetween(PGX_IM_MIN_NEEDED_PICKEM, PGX_IM_MAX_NEEDED_PICKEM)
            : randomBetween(PGX_GM_MIN_NEEDED_PICKEM, PGX_GM_MAX_NEEDED_PICKEM);

export const PGX_ENTRY_STAGE = "er";

export const buildPgxInternational = (teams, extra = {}) => {
    const seeded = teams.map(toBaseTeam);
    const direct = seeded.slice(0, PGX_IM_ENTRY_DIRECT_COUNT);
    const entry = seeded.slice(PGX_IM_ENTRY_DIRECT_COUNT);
    return {
        ...extra,
        phase: "entry",
        teams: seeded,
        direct,
        entry: {
            teams: entry,
            er: Array.from({ length: Math.floor(entry.length / 2) }, (_, i) =>
                mkMatch(`pgxe-er-${i + 1}`, "E", "er", entry[i] ?? null, entry[entry.length - 1 - i] ?? null)
            ),
        },
        bracket: null,
    };
};

export const isPgxEntryFinished = (im) => !!im?.entry && im.entry.er.every((match) => match.played);

export const getPgxEntryWinners = (im) => {
    const order = new Map((im?.entry?.teams || []).map((team, i) => [team.id, i]));
    return (im?.entry?.er || [])
        .map(getMatchWinnerTeam)
        .filter(Boolean)
        .sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
};

export const buildPgxImBracket = (im) => {
    const bracket = buildEclBracket([...(im.direct || []), ...getPgxEntryWinners(im)]);
    ECL_STAGE_ORDER.forEach((stage) => {
        bracket[stage] = bracket[stage].map((match) => ({ ...match, id: `pgxi-${stage}-${match.id.split("-").pop()}` }));
    });
    return bracket;
};

export const getBestOfForPgxInternational = (stage) => (stage === PGX_ENTRY_STAGE ? 3 : getBestOfForEcl(stage));

export const getPgxInternationalMatches = (im) => [...(im?.entry?.er || []), ...getEclMatches(im?.bracket)];

export const locatePgxInternationalMatch = (im, matchId) => {
    const entryIdx = (im?.entry?.er || []).findIndex((match) => match.id === matchId);
    if (entryIdx >= 0) return { section: "entry", stage: PGX_ENTRY_STAGE, idx: entryIdx, match: im.entry.er[entryIdx] };
    for (const stage of ECL_STAGE_ORDER) {
        const idx = (im?.bracket?.[stage] || []).findIndex((match) => match.id === matchId);
        if (idx >= 0) return { section: "bracket", stage, idx, match: im.bracket[stage][idx] };
    }
    return null;
};

export const updatePgxInternationalMatch = (im, matchId, update) => {
    const spot = locatePgxInternationalMatch(im, matchId);
    if (!spot) return im;
    if (spot.section === "entry") {
        const er = [...im.entry.er];
        er[spot.idx] = update(er[spot.idx]);
        return { ...im, entry: { ...im.entry, er } };
    }
    const arr = [...im.bracket[spot.stage]];
    arr[spot.idx] = update(arr[spot.idx]);
    return { ...im, bracket: { ...im.bracket, [spot.stage]: arr } };
};

export const pgxInternationalMatchPoints = (match) => bracketMatchPoints(match, getBestOfForPgxInternational(match?.stage));

export const PGX_IM_RATING_WEIGHTS = { er: 0.86, ...ECL_RATING_WEIGHTS };
export const PGX_IM_BATTLE_STAKES = { er: 0.2, ...ECL_BATTLE_STAKES };

export const PGX_IM_PICKEM_ROUNDS = [
    { stage: PGX_ENTRY_STAGE, label: "Entry Rounds", total: 5 },
    ...ECL_PICKEM_ROUNDS.map(({ stage, label, total }) => ({ stage, label, total })),
].map((round) => ({ ...round, key: `pgxi_${round.stage}` }));

export const getPgxInternationalStakeTexts = (stage, gmName = "PGX Grandmasters") => {
    if (stage === PGX_ENTRY_STAGE) return { winner: <>goes to the <b>Main Bracket</b></>, loser: PGX_ELIMINATED };
    if (stage === "gf") return { winner: <><b>WINS</b> and qualifies to {gmName}!</>, loser: "second place is still wonderful!" };
    return getEclStakeTexts(stage);
};

export const getPgxInternationalPlaces = (im) => {
    const entryLosers = (im?.entry?.er || []).map(getMatchLoserTeam).filter(Boolean);
    return [...getEclPlaces(im?.bracket), ...entryLosers];
};

export const getPgxInternationalResults = (im) => getEclResults(im?.bracket);

export const PGX_GM_SWISS_RATING_WEIGHT = 1.4;
export const PGX_GM_PLAYOFFS_RATING_WEIGHTS = PEM_PLAYOFFS_RATING_WEIGHTS;
export const PGX_GM_PLAYOFFS_BIG_STAGE = {
    qf: { winner: 4 },
    sf: { winner: 5 },
    thirdPlace: { winner: 6, loser: 5 },
    gf: { winner: 9, loser: 7 },
};
export const PGX_GM_BATTLE_STAKES = PEM_GROUP_BATTLE_STAKES;

