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
import { EWC_TYPE_ID, EWC_OQ_TYPE_ID } from "./tournamentTypes.jsx";

export { EWC_TYPE_ID, EWC_OQ_TYPE_ID };

export const EWC_DIRECT_TO = 28;
export const EWC_OQ_GROUPS_TO = 56;
export const EWC_PLAYIN_TO = 64;

export const EWC_OQ_GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H"];
export const EWC_GROUPS = ["A", "B", "C", "D"];

const EWC_ELIMINATED = "is out of the Esports World Cup";

const mkMatch = (id, group, stage, slotA = null, slotB = null, extra = {}) => ({ ...makeBracketMatch(id, group, stage, extra), slotA, slotB });

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

export const buildEwcSeeds = (sortedTeams) => {
    const teams = sortedTeams.map(toBaseTeam);
    return {
        direct: teams.slice(0, EWC_DIRECT_TO),
        oqGroups: teams.slice(EWC_DIRECT_TO, EWC_OQ_GROUPS_TO),
        playIn: teams.slice(EWC_OQ_GROUPS_TO, EWC_PLAYIN_TO),
    };
};

const OQ_PLAYIN_DEST = ["E", "F", "G", "H"];

export const EWC_OQ_KO_ORDER = ["r16", "qf"];
const EWC_OQ_KO_SIZES = { r16: 8, qf: 4 };
const EWC_OQ_KO_PAIRS = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["B", "A"], ["D", "C"], ["F", "E"], ["H", "G"]];
const EWC_OQ_BEST_OF = { pi: 3, uo: 1, lr1: 3, uf: 3, lr2: 3, r16: 3, qf: 3 };

export const EWC_OQ_KO_COLUMN_TITLES = { r16: "Round of 16", qf: "Quarterfinals" };

export const ewcOqKoSlotSource = (stage, idx, slotKey) => (stage === "qf" ? { stage: "r16", idx: idx * 2 + (slotKey === "slotB" ? 1 : 0), want: "winner" } : null);

const EWC_OQ_KO_ROUTES = buildBracketRoutes(EWC_OQ_KO_ORDER, EWC_OQ_KO_SIZES, ewcOqKoSlotSource);

export const EWC_OQ_KO_CONNECTOR_LINKS = buildBracketConnectorLinks(EWC_OQ_KO_ORDER, EWC_OQ_KO_SIZES, ewcOqKoSlotSource);

const buildGslGroup = (prefix, group, teams4) => {
    const bracket = { group, teams: teams4.map((team) => (team ? toBaseTeam(team) : null)) };
    PEM_STAGE1_STAGE_ORDER.forEach((stage) => {
        bracket[stage] = (stage === "uo" ? [0, 1] : [0]).map((i) => mkMatch(`${prefix}${group}-${stage}-${i + 1}`, group, stage));
    });
    [[0, 3], [1, 2]].forEach(([a, b], i) => {
        bracket.uo[i].slotA = bracket.teams[a] ?? null;
        bracket.uo[i].slotB = bracket.teams[b] ?? null;
    });
    return bracket;
};

export const buildEwcOpenQualifier = (groupTeams, playInTeams, extra = {}) => {
    const direct = groupTeams.map(toBaseTeam);
    const playIn = playInTeams.map(toBaseTeam);
    const pots = [0, 1, 2].map((p) => shuffle(direct.slice(p * 8, p * 8 + 8)));
    const lastPot = [...shuffle(direct.slice(24, 28)), null, null, null, null];
    const groups = Object.fromEntries(EWC_OQ_GROUPS.map((group, g) => [group, buildGslGroup("ewcq", group, [pots[0][g], pots[1][g], pots[2][g], lastPot[g]])]));
    const pi = Array.from({ length: 4 }, (_, i) =>
        mkMatch(`ewcqP-pi-${i + 1}`, "P", "pi", playIn[i] ?? null, playIn[playIn.length - 1 - i] ?? null, { dest: { group: OQ_PLAYIN_DEST[i] } }),
    );
    return {
        ...extra,
        phase: "playin",
        teams: [...direct, ...playIn],
        playIn: { group: "P", teams: playIn, pi },
        groups,
        knockout: null,
        qualified: [],
    };
};

const fillPlayInWinners = (oq) => {
    const groups = { ...oq.groups };
    oq.playIn.pi.forEach((match) => {
        const winner = getMatchWinnerTeam(match);
        const group = match.dest?.group;
        if (!winner || !group || !groups[group]) return;
        const bracket = { ...groups[group], teams: [...groups[group].teams], uo: [...groups[group].uo] };
        bracket.teams[3] = toBaseTeam(winner);
        bracket.uo[0] = { ...bracket.uo[0], slotB: toBaseTeam(winner) };
        groups[group] = bracket;
    });
    return groups;
};

const gslPlaces = (bracket) => [getMatchWinnerTeam(bracket?.uf?.[0]), getMatchWinnerTeam(bracket?.lr2?.[0])];

const buildOqKnockout = (groups) => {
    const knockout = { group: "K" };
    knockout.r16 = EWC_OQ_KO_PAIRS.map(([first, second], i) =>
        mkMatch(`ewcqK-r16-${i + 1}`, "K", "r16", toBaseTeam(gslPlaces(groups[first])[0]), toBaseTeam(gslPlaces(groups[second])[1])),
    );
    knockout.qf = Array.from({ length: 4 }, (_, i) => mkMatch(`ewcqK-qf-${i + 1}`, "K", "qf"));
    return knockout;
};

const isOqPlayInFinished = (oq) => (oq?.playIn?.pi || []).every((match) => match.played);
const isOqGroupsFinished = (oq) => EWC_OQ_GROUPS.every((group) => isBracketFinished(PEM_STAGE1_STAGE_ORDER, oq?.groups?.[group]));
export const isEwcOqFinished = (oq) => !!oq?.knockout && (oq.knockout.qf || []).every((match) => match.played);

export const getEwcOqQualifiers = (oq) => (oq?.knockout?.qf || []).map(getMatchWinnerTeam).filter(Boolean);

export const progressEwcOpenQualifier = (oq) => {
    if (oq.phase === "playin" && isOqPlayInFinished(oq)) return { ...oq, phase: "groups", groups: fillPlayInWinners(oq) };
    if (oq.phase === "groups" && isOqGroupsFinished(oq)) return { ...oq, phase: "knockout", knockout: buildOqKnockout(oq.groups) };
    if (oq.phase === "knockout" && isEwcOqFinished(oq)) return { ...oq, phase: "done", qualified: getEwcOqQualifiers(oq).map(toBaseTeam) };
    return oq;
};

const oqHolders = (oq) =>
    [
        { section: "playin", group: "P", holder: oq?.playIn, stages: ["pi"] },
        ...EWC_OQ_GROUPS.map((group) => ({ section: "groups", group, holder: oq?.groups?.[group], stages: PEM_STAGE1_STAGE_ORDER })),
        { section: "knockout", group: "K", holder: oq?.knockout, stages: EWC_OQ_KO_ORDER },
    ].filter(({ holder }) => !!holder);

export const getEwcOqMatches = (oq) => oqHolders(oq).flatMap(({ holder, stages }) => stages.flatMap((stage) => holder?.[stage] || []));

export const locateEwcOqMatch = (oq, matchId) => {
    for (const { section, group, holder, stages } of oqHolders(oq)) {
        for (const stage of stages) {
            const idx = (holder?.[stage] || []).findIndex((match) => match.id === matchId);
            if (idx >= 0) return { section, group, stage, idx, match: holder[stage][idx] };
        }
    }
    return null;
};

const oqHolderOf = (oq, section, group) => (section === "playin" ? oq.playIn : section === "knockout" ? oq.knockout : oq.groups?.[group]);

const patchOqHolder = (oq, section, group, holder) =>
    section === "playin" ? { ...oq, playIn: holder } : section === "knockout" ? { ...oq, knockout: holder } : { ...oq, groups: { ...oq.groups, [group]: holder } };

export const updateEwcOqMatch = (oq, matchId, update) => {
    const spot = locateEwcOqMatch(oq, matchId);
    if (!spot) return oq;
    const holder = oqHolderOf(oq, spot.section, spot.group);
    const arr = [...holder[spot.stage]];
    arr[spot.idx] = update(arr[spot.idx]);
    return patchOqHolder(oq, spot.section, spot.group, { ...holder, [spot.stage]: arr });
};

export const advanceEwcOq = (oq, spot, winner, loser) => {
    if (spot.section === "playin") return oq;
    const holder = { ...oqHolderOf(oq, spot.section, spot.group) };
    const order = spot.section === "knockout" ? EWC_OQ_KO_ORDER : PEM_STAGE1_STAGE_ORDER;
    order.forEach((stage) => {
        holder[stage] = [...holder[stage]];
    });
    if (spot.section === "knockout") advanceBracket(EWC_OQ_KO_ROUTES, holder, spot.stage, spot.idx, winner, loser);
    else advancePemStage1Bracket(holder, spot.stage, spot.idx, winner, loser);
    return patchOqHolder(oq, spot.section, spot.group, holder);
};

const oqOrderOf = (section) => (section === "playin" ? ["pi"] : section === "knockout" ? EWC_OQ_KO_ORDER : PEM_STAGE1_STAGE_ORDER);

export const ewcOqSlotSource = (section) => (section === "knockout" ? ewcOqKoSlotSource : section === "groups" ? pemStage1SlotSource : () => null);

export const canOpenEwcOqMatch = (oq, section, holder, stage, idx) => section === oq?.phase && canOpenBracketMatch(oqOrderOf(section), holder, stage, idx);

export const findCurrentEwcOqMatch = (oq, group = null) => {
    if (oq?.phase === "playin") return findCurrentBracketMatch(["pi"], oq.playIn);
    if (oq?.phase === "knockout") return findCurrentBracketMatch(EWC_OQ_KO_ORDER, oq.knockout);
    if (oq?.phase === "groups") return group ? findCurrentBracketMatch(PEM_STAGE1_STAGE_ORDER, oq.groups?.[group]) : null;
    return null;
};

export const findNextEwcOqMatch = (holder, section, current) => findNextBracketMatch(oqOrderOf(section), holder, current);

export const getBestOfForEwcOq = (stage) => EWC_OQ_BEST_OF[stage] ?? 3;

export const ewcOqMatchPoints = (match) => bracketMatchPoints(match, getBestOfForEwcOq(match?.stage));

export const getEwcOqPlaces = (oq) => {
    const losersOf = (holders, stage) => holders.flatMap((holder) => (holder?.[stage] || []).map(getMatchLoserTeam).filter(Boolean));
    const groups = EWC_OQ_GROUPS.map((group) => oq?.groups?.[group]);
    return [
        ...getEwcOqQualifiers(oq),
        ...losersOf([oq?.knockout], "qf"),
        ...losersOf([oq?.knockout], "r16"),
        ...losersOf(groups, "lr2"),
        ...losersOf(groups, "lr1"),
        ...losersOf([oq?.playIn], "pi"),
    ];
};

export const EWC_OQ_STAGE_LABELS = { pi: "Play-in", ...PEM_STAGE1_STAGE_LABELS, r16: "Round of 16", qf: "Quarterfinal" };

export const EWC_OQ_RATING_WEIGHTS = { pi: 0.6, uo: 0.62, lr1: 0.62, uf: 0.7, lr2: 0.68, r16: 0.78, qf: 0.88 };
export const EWC_OQ_BATTLE_STAKES = { pi: 0.12, uo: 0.15, lr1: 0.15, uf: 0.22, lr2: 0.22, r16: 0.3, qf: 0.45 };
export const EWC_OQ_BIG_STAGE_GAINS = { qf: { winner: 2 } };
export const EWC_OQ_UPPER_STAGES = ["pi", "uo", "uf", "r16", "qf"];
export const EWC_OQ_ELIMINATION_STAGES = ["pi", "lr1", "lr2", "r16", "qf"];

export const EWC_OQ_PICKEM_ROUNDS = [
    { stage: "pi", label: "the Play-in", total: 4 },
    { stage: "uo", label: "Opening Rounds", total: 16 },
    { stage: "lr1", label: "Elimination Matches", total: 8 },
    { stage: "uf", label: "Winners' Matches", total: 8 },
    { stage: "lr2", label: "Decider Matches", total: 8 },
    { stage: "r16", label: "Rounds of 16", total: 8 },
    { stage: "qf", label: "Quarterfinals", total: 4 },
].map((round) => ({ ...round, key: `ewcq_${round.stage}` }));

export const getEwcOqStakeTexts = (stage, mainName = "Esports World Cup") => {
    switch (stage) {
        case "pi": return { winner: <>goes to the <b>Group Stage</b></>, loser: EWC_ELIMINATED };
        case "uo": return { winner: <>goes to the <b>Winners&apos; Match</b></>, loser: <>drops to the <b>Elimination Match</b></> };
        case "uf": return { winner: <>goes to the <b>Knockout Stage</b> as Group winner</>, loser: <>drops to the <b>Decider Match</b></> };
        case "lr1": return { winner: <>goes to the <b>Decider Match</b></>, loser: EWC_ELIMINATED };
        case "lr2": return { winner: <>goes to the <b>Knockout Stage</b> as Group runner-up</>, loser: EWC_ELIMINATED };
        case "r16": return { winner: <>goes to the <b>Quarterfinals</b></>, loser: EWC_ELIMINATED };
        case "qf": return { winner: <><b>qualifies</b> to {mainName}!</>, loser: "falls one step short of the main event" };
        default: return { winner: null, loser: null };
    }
};

export const EWC_GROUP_ORDER = ["uo", "lr1", "us", "lr2"];
const EWC_GROUP_SIZES = { uo: 4, us: 2, lr1: 2, lr2: 2 };
const EWC_GROUP_SEED_PAIRS = [[0, 7], [3, 4], [1, 6], [2, 5]];

export const EWC_GROUP_STAGE_LABELS = { uo: "Opening Round", us: "Upper Semifinals", lr1: "Lower Round 1", lr2: "Lower Semifinals" };

export const ewcGroupSlotSource = (stage, idx, slotKey) => {
    const second = slotKey === "slotB";
    switch (stage) {
        case "us": return { stage: "uo", idx: idx * 2 + (second ? 1 : 0), want: "winner" };
        case "lr1": return { stage: "uo", idx: idx * 2 + (second ? 1 : 0), want: "loser" };
        case "lr2": return second ? { stage: "us", idx: 1 - idx, want: "loser" } : { stage: "lr1", idx, want: "winner" };
        default: return null;
    }
};

const EWC_GROUP_ROUTES = buildBracketRoutes(EWC_GROUP_ORDER, EWC_GROUP_SIZES, ewcGroupSlotSource);

export const EWC_GROUP_CONNECTOR_LINKS = buildBracketConnectorLinks(EWC_GROUP_ORDER, EWC_GROUP_SIZES, ewcGroupSlotSource);

export const EWC_PLAYOFFS_ORDER = ["r16", "qf", "sf", "tp", "gf"];
const EWC_PLAYOFFS_SIZES = { r16: 8, qf: 4, sf: 2, tp: 1, gf: 1 };
const EWC_MAIN_BEST_OF = { uo: 1, us: 3, lr1: 3, lr2: 3, r16: 3, qf: 5, sf: 7, tp: 7, gf: 9 };
const EWC_R16_PAIRS = [
    [["A", "u", 0], ["C", "l", 0]],
    [["B", "u", 1], ["D", "l", 1]],
    [["C", "u", 0], ["A", "l", 0]],
    [["D", "u", 1], ["B", "l", 1]],
    [["B", "u", 0], ["D", "l", 0]],
    [["A", "u", 1], ["C", "l", 1]],
    [["D", "u", 0], ["B", "l", 0]],
    [["C", "u", 1], ["A", "l", 1]],
];

export const EWC_PLAYOFFS_COLUMN_TITLES = { r16: "Round of 16", qf: "Quarterfinals", sf: "Semifinals", tp: "Third Place Decider", gf: "Grand Final" };

export const ewcPlayoffsSlotSource = (stage, idx, slotKey) => {
    const second = slotKey === "slotB";
    if (stage === "qf" || stage === "sf") return { stage: stage === "qf" ? "r16" : "qf", idx: idx * 2 + (second ? 1 : 0), want: "winner" };
    if (stage === "tp") return { stage: "sf", idx: second ? 1 : 0, want: "loser" };
    if (stage === "gf") return { stage: "sf", idx: second ? 1 : 0, want: "winner" };
    return null;
};

const EWC_PLAYOFFS_ROUTES = buildBracketRoutes(EWC_PLAYOFFS_ORDER, EWC_PLAYOFFS_SIZES, ewcPlayoffsSlotSource);

export const EWC_PLAYOFFS_CONNECTOR_LINKS = buildBracketConnectorLinks(["r16", "qf", "sf", "gf"], EWC_PLAYOFFS_SIZES, (stage, idx, slotKey) =>
    stage === "tp" ? null : ewcPlayoffsSlotSource(stage, idx, slotKey),
);

const buildEwcGroup = (group, teams8) => {
    const bracket = { group, teams: teams8.map(toBaseTeam) };
    EWC_GROUP_ORDER.forEach((stage) => {
        bracket[stage] = Array.from({ length: EWC_GROUP_SIZES[stage] }, (_, i) => mkMatch(`ewcg${group}-${stage}-${i + 1}`, group, stage));
    });
    EWC_GROUP_SEED_PAIRS.forEach(([a, b], i) => {
        bracket.uo[i].slotA = bracket.teams[a] ?? null;
        bracket.uo[i].slotB = bracket.teams[b] ?? null;
    });
    return bracket;
};

const snakeSplit = (teams, count) => {
    const parts = Array.from({ length: count }, () => []);
    teams.forEach((team, i) => {
        const round = Math.floor(i / count);
        const pos = i % count;
        parts[round % 2 === 0 ? pos : count - 1 - pos].push(team);
    });
    return parts;
};

export const buildEwcMain = (directTeams, qualifiers, extra = {}) => {
    const direct = directTeams.map(toBaseTeam);
    const qualified = shuffle(qualifiers.map(toBaseTeam));
    const parts = snakeSplit(direct, EWC_GROUPS.length);
    const groups = Object.fromEntries(EWC_GROUPS.map((group, g) => [group, buildEwcGroup(group, [...parts[g], qualified[g]].filter(Boolean))]));
    return {
        ...extra,
        phase: "groups",
        teams: [...direct, ...qualified],
        directTeams: direct,
        oqQualified: qualifiers.map(toBaseTeam),
        groups,
        playoffs: null,
    };
};

const groupQualifiers = (bracket) => ({
    u: (bracket?.us || []).map(getMatchWinnerTeam),
    l: (bracket?.lr2 || []).map(getMatchWinnerTeam),
});

export const buildEwcPlayoffs = (groups) => {
    const qual = Object.fromEntries(EWC_GROUPS.map((group) => [group, groupQualifiers(groups[group])]));
    const playoffs = { group: "P" };
    playoffs.r16 = EWC_R16_PAIRS.map(([[ga, ka, ia], [gb, kb, ib]], i) =>
        mkMatch(`ewcp-r16-${i + 1}`, "P", "r16", toBaseTeam(qual[ga][ka][ia]), toBaseTeam(qual[gb][kb][ib])),
    );
    ["qf", "sf", "tp", "gf"].forEach((stage) => {
        playoffs[stage] = Array.from({ length: EWC_PLAYOFFS_SIZES[stage] }, (_, i) => mkMatch(`ewcp-${stage}-${i + 1}`, "P", stage));
    });
    return playoffs;
};

export const isEwcGroupsFinished = (main) => !!main?.groups && EWC_GROUPS.every((group) => isBracketFinished(EWC_GROUP_ORDER, main.groups[group]));
export const isEwcMainFinished = (main) => !!main?.playoffs?.gf?.[0]?.played && !!main?.playoffs?.tp?.[0]?.played;

export const getBestOfForEwcMain = (stage) => EWC_MAIN_BEST_OF[stage] ?? 3;

const mainHolders = (main) =>
    [
        ...EWC_GROUPS.map((group) => ({ section: "groups", group, holder: main?.groups?.[group], stages: EWC_GROUP_ORDER })),
        ...(main?.playoffs ? [{ section: "playoffs", group: "P", holder: main.playoffs, stages: EWC_PLAYOFFS_ORDER }] : []),
    ].filter(({ holder }) => !!holder);

export const getEwcMainMatches = (main) => mainHolders(main).flatMap(({ holder, stages }) => stages.flatMap((stage) => holder?.[stage] || []));

export const locateEwcMainMatch = (main, matchId) => {
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

export const updateEwcMainMatch = (main, matchId, update) => {
    const spot = locateEwcMainMatch(main, matchId);
    if (!spot) return main;
    const holder = mainHolderOf(main, spot.section, spot.group);
    const arr = [...holder[spot.stage]];
    arr[spot.idx] = update(arr[spot.idx]);
    return patchMainHolder(main, spot.section, spot.group, { ...holder, [spot.stage]: arr });
};

export const advanceEwcMain = (main, spot, winner, loser) => {
    const holder = { ...mainHolderOf(main, spot.section, spot.group) };
    const order = spot.section === "playoffs" ? EWC_PLAYOFFS_ORDER : EWC_GROUP_ORDER;
    order.forEach((stage) => {
        holder[stage] = [...holder[stage]];
    });
    advanceBracket(spot.section === "playoffs" ? EWC_PLAYOFFS_ROUTES : EWC_GROUP_ROUTES, holder, spot.stage, spot.idx, winner, loser);
    return patchMainHolder(main, spot.section, spot.group, holder);
};

export const ewcMainSlotSource = (section) => (section === "playoffs" ? ewcPlayoffsSlotSource : ewcGroupSlotSource);

const mainOrderOf = (section) => (section === "playoffs" ? EWC_PLAYOFFS_ORDER : EWC_GROUP_ORDER);

export const canOpenEwcMainMatch = (main, section, holder, stage, idx) => section === main?.phase && canOpenBracketMatch(mainOrderOf(section), holder, stage, idx);

export const findCurrentEwcMainMatch = (main, group = null) => {
    if (main?.phase === "playoffs") return findCurrentBracketMatch(EWC_PLAYOFFS_ORDER, main.playoffs);
    if (main?.phase === "groups") return group ? findCurrentBracketMatch(EWC_GROUP_ORDER, main.groups?.[group]) : null;
    return null;
};

export const findNextEwcMainMatch = (holder, section, current) => findNextBracketMatch(mainOrderOf(section), holder, current);

export const ewcMainMatchPoints = (match) => bracketMatchPoints(match, getBestOfForEwcMain(match?.stage));

export const EWC_MAIN_STAGE_LABELS = { uo: "Opening Round", us: "Upper Semifinal", lr1: "Lower Round 1", lr2: "Lower Semifinal", r16: "Round of 16", qf: "Quarterfinal", sf: "Semifinal", tp: "Third Place Decider", gf: "Grand Final" };

export const EWC_MAIN_RATING_WEIGHTS = { uo: 1.2, us: 1.38, lr1: 1.3, lr2: 1.42, r16: 1.6, qf: 2.3, sf: 2.8, tp: 2.9, gf: 4.6 };
export const EWC_MAIN_BATTLE_STAKES = { uo: 0.3, us: 0.45, lr1: 0.3, lr2: 0.45, r16: 0.55, qf: 0.65, sf: 0.8, tp: 0.8, gf: 1 };
export const EWC_MAIN_BIG_STAGE_GAINS = { us: { winner: 2 }, lr2: { winner: 2 }, qf: { winner: 3 }, sf: { winner: 3 }, tp: { winner: 4, loser: 3 }, gf: { winner: 6, loser: 5 } };
export const EWC_MAIN_UPPER_STAGES = ["uo", "us", "r16", "qf", "sf", "gf"];
export const EWC_MAIN_ELIMINATION_STAGES = ["lr1", "lr2", "r16", "qf", "sf", "tp", "gf"];

export const EWC_MAIN_PICKEM_ROUNDS = [
    { stage: "uo", label: "Opening Rounds", total: 16 },
    { stage: "lr1", label: "Lower Rounds 1", total: 8 },
    { stage: "us", label: "Upper Semifinals", total: 8 },
    { stage: "lr2", label: "Lower Semifinals", total: 8 },
    { stage: "r16", label: "Rounds of 16", total: 8 },
    { stage: "qf", label: "Quarterfinals", total: 4 },
    { stage: "sf", label: "Semifinals", total: 2 },
    { stage: "tp", label: "the Third Place Decider", total: 1 },
    { stage: "gf", label: "the Grand Final", total: 1 },
].map((round) => ({ ...round, key: `ewcm_${round.stage}` }));

export const getEwcMainStakeTexts = (stage) => {
    switch (stage) {
        case "uo": return { winner: <>goes to the <b>Upper Semifinals</b></>, loser: <>drops to the <b>Lower Round 1</b></> };
        case "us": return { winner: <>goes to the <b>Playoffs</b> as an upper seed</>, loser: <>drops to the <b>Lower Semifinals</b></> };
        case "lr1": return { winner: <>goes to the <b>Lower Semifinals</b></>, loser: EWC_ELIMINATED };
        case "lr2": return { winner: <>goes to the <b>Playoffs</b></>, loser: EWC_ELIMINATED };
        case "r16": return { winner: <>goes to the <b>Quarterfinals</b></>, loser: EWC_ELIMINATED };
        case "qf": return { winner: <>goes to the <b>Semifinals</b></>, loser: EWC_ELIMINATED };
        case "sf": return { winner: <>goes to the <b>Grand Final</b></>, loser: <>drops to the <b>Third Place Decider</b></> };
        case "tp": return { winner: <>earns <b>Third Place Medal</b>!</>, loser: "finishes 4th, still a great run!" };
        case "gf": return { winner: <><b>WINS</b> the tournament!</>, loser: "second place is still wonderful!" };
        default: return { winner: null, loser: null };
    }
};

export const getEwcMainResults = (main) => ({
    winner: getMatchWinnerTeam(main?.playoffs?.gf?.[0]),
    runnerUp: getMatchLoserTeam(main?.playoffs?.gf?.[0]),
    thirdPlace: getMatchWinnerTeam(main?.playoffs?.tp?.[0]),
    fourthPlace: getMatchLoserTeam(main?.playoffs?.tp?.[0]),
});

export const getEwcMainPlaces = (main) => {
    const results = getEwcMainResults(main);
    const losersOf = (holders, stage) => holders.flatMap((holder) => (holder?.[stage] || []).map(getMatchLoserTeam).filter(Boolean));
    const groups = EWC_GROUPS.map((group) => main?.groups?.[group]);
    return [
        results.winner,
        results.runnerUp,
        results.thirdPlace,
        results.fourthPlace,
        ...losersOf([main?.playoffs], "qf"),
        ...losersOf([main?.playoffs], "r16"),
        ...losersOf(groups, "lr2"),
        ...losersOf(groups, "lr1"),
    ].filter(Boolean);
};

export const EWC_ELIMINATING_STAGES = ["lr1", "lr2", "r16", "qf", "sf", "gf"];

export const isEwcEliminatingMatch = (type, match) => type === "ewcMain" && !!match?.played && EWC_ELIMINATING_STAGES.includes(match.stage);

export const getEwcEliminatedTeam = (match) => (EWC_ELIMINATING_STAGES.includes(match?.stage) ? getMatchLoserTeam(match) : null);

export const getEwcDefeatedBy = (main, teamId) => {
    const seen = new Map();
    getEwcMainMatches(main).forEach((match) => {
        if (!match?.played || String(match.winnerTeamId) !== String(teamId)) return;
        const loser = getMatchLoserTeam(match);
        if (loser && !seen.has(loser.id)) seen.set(loser.id, toBaseTeam(loser));
    });
    return [...seen.values()];
};

export const buildEwcTrophiesByTeam = (hallOfFame) => {
    const byTeam = {};
    (hallOfFame || [])
        .filter((record) => record?.event === "ewc" && record.results?.winner?.id != null)
        .sort((a, b) => Number(a.number) - Number(b.number))
        .forEach((record) => {
            const winner = record.results.winner;
            (byTeam[winner.id] ||= []).push({
                id: record.id,
                number: record.number,
                keyColor: winner.color,
                shardColors: record.pickedKeys?.map((team) => team.color),
                motto: record.motto,
            });
        });
    return byTeam;
};

export const latestEwcRecordBefore = (hallOfFame, number) =>
    (hallOfFame || [])
        .filter((record) => record?.event === "ewc" && Number(record.number) < Number(number))
        .sort((a, b) => Number(b.number) - Number(a.number))[0] ?? null;

const EWC_NEEDED_PICKEM = { oq: [55, 87], main: [68, 110] };

export const getRandomEwcNeededPickemPoints = (event) => randomBetween(...(EWC_NEEDED_PICKEM[event] ?? EWC_NEEDED_PICKEM.main));

export const ewcStageLabel = (type, stage) => (type === "ewcOq" ? EWC_OQ_STAGE_LABELS[stage] ?? "" : EWC_MAIN_STAGE_LABELS[stage] ?? "");

export const isSingleEwcStage = (type, stage) => (type === "ewcOq" ? ["lr1", "uf", "lr2"].includes(stage) : ["tp", "gf"].includes(stage));
