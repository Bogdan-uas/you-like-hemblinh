import { toBaseTeam } from "./teams.js";

export const CST_GROUPS = ["A", "B", "C", "D"];
export const CST_TIE_SCORE = 15;
const CST_MIN_NEEDED_PICKEM = 40;
const CST_MAX_NEEDED_PICKEM = 66;
export const CST_PLAYOFFS_BEST_OF = { qf: 3, sf: 3, thirdPlace: 3, gf: 5 };
export const CST_GROUP_RATING_WEIGHT = 0.9;
export const CST_PLAYOFFS_RATING_WEIGHTS = { qf: 1.0, sf: 1.12, thirdPlace: 1.2, gf: 1.25 };
export const CST_BIG_STAGE_SCALE = 0.5;

export const getRandomCstNeededPickemPoints = () =>
    Math.floor(Math.random() * (CST_MAX_NEEDED_PICKEM - CST_MIN_NEEDED_PICKEM + 1)) +
    CST_MIN_NEEDED_PICKEM;

export const splitCstGroups = (teams) =>
    Object.fromEntries(
        CST_GROUPS.map((group, groupIndex) => [
            group,
            teams.filter((_, i) => i % CST_GROUPS.length === groupIndex).map(toBaseTeam),
        ])
    );

const buildRoundRobinPairs = (count) => {
    let order = Array.from({ length: count % 2 === 0 ? count : count + 1 }, (_, i) => (i < count ? i : null));
    const pairs = [];

    for (let round = 0; round < order.length - 1; round++) {
        for (let k = 0; k < order.length / 2; k++) {
            const a = order[k];
            const b = order[order.length - 1 - k];
            if (a !== null && b !== null) pairs.push(a < b ? [a, b] : [b, a]);
        }
        order = [order[0], order[order.length - 1], ...order.slice(1, order.length - 1)];
    }

    return pairs;
};

const makeCstGroupMatch = (group, number, slotA, slotB) => ({
    id: `cst-${group}-${number}`,
    group,
    number,
    slotA,
    slotB,
    played: false,
    isTie: false,
    scoreLeft: null,
    scoreRight: null,
    winnerTeamId: null,
    loserTeamId: null,
    pickTeamId: null,
    setHistory: [],
});

export const buildCstGroupStage = (groups) =>
    Object.fromEntries(
        CST_GROUPS.map((group) => {
            const teams = groups?.[group] || [];
            const matches = buildRoundRobinPairs(teams.length).map(([a, b], i) =>
                makeCstGroupMatch(group, i + 1, teams[a], teams[b])
            );
            return [group, { group, teams, matches }];
        })
    );

export const canOpenCstGroupMatch = (groupObj, idx) => {
    const match = groupObj?.matches?.[idx];
    if (!match || match.played || !match.slotA || !match.slotB) return false;
    return groupObj.matches.slice(0, idx).every((m) => m.played);
};

export const isCstGroupFinished = (groupObj) =>
    !!groupObj?.matches?.length && groupObj.matches.every((m) => m.played);

export const isCstGroupStageFinished = (stage) =>
    !!stage && CST_GROUPS.every((group) => isCstGroupFinished(stage[group]));

export const getCstGroupMatches = (stage) => CST_GROUPS.flatMap((group) => stage?.[group]?.matches || []);

export const getCstStandings = (groupObj) => {
    const rows = new Map(
        (groupObj?.teams || []).map((team, seed) => [
            team.id,
            { team, seed, m: 0, w: 0, t: 0, l: 0, rw: 0, rl: 0, points: 0 },
        ])
    );
    const playedMatches = (groupObj?.matches || []).filter((m) => m.played);

    playedMatches.forEach((m) => {
        const a = rows.get(m.slotA?.id);
        const b = rows.get(m.slotB?.id);
        if (!a || !b) return;

        a.m += 1;
        b.m += 1;
        a.rw += m.scoreLeft ?? 0;
        a.rl += m.scoreRight ?? 0;
        b.rw += m.scoreRight ?? 0;
        b.rl += m.scoreLeft ?? 0;

        if (m.isTie) {
            a.t += 1;
            b.t += 1;
            a.points += 1;
            b.points += 1;
        } else if (m.winnerTeamId === a.team.id) {
            a.w += 1;
            b.l += 1;
            a.points += 3;
        } else {
            b.w += 1;
            a.l += 1;
            b.points += 3;
        }
    });

    const headToHead = (x, y) => {
        const m = playedMatches.find(
            (match) =>
                (match.slotA?.id === x.team.id && match.slotB?.id === y.team.id) ||
                (match.slotA?.id === y.team.id && match.slotB?.id === x.team.id)
        );
        if (!m || m.isTie) return 0;
        return m.winnerTeamId === x.team.id ? -1 : 1;
    };

    return [...rows.values()]
        .map((row) => ({ ...row, rd: row.rw - row.rl }))
        .sort((x, y) =>
            y.points - x.points ||
            y.rd - x.rd ||
            y.rw - x.rw ||
            headToHead(x, y) ||
            x.seed - y.seed
        )
        .map((row, i) => ({ ...row, position: i + 1 }));
};

const getCstGroupQualifiers = (groupObj) => getCstStandings(groupObj).slice(0, 2).map((row) => row.team);

const makeCstPlayoffsMatch = (stage, i, slotA = null, slotB = null) => ({
    id: `${stage}-${i + 1}`,
    stage,
    cst: true,
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

export const buildCstPlayoffs = (stage) => {
    const top = Object.fromEntries(CST_GROUPS.map((group) => [group, getCstGroupQualifiers(stage?.[group])]));
    const quarterfinals = [
        [top.A[0], top.C[1]],
        [top.C[0], top.B[1]],
        [top.B[0], top.D[1]],
        [top.D[0], top.A[1]],
    ];

    return {
        kind: "cst",
        ro16: [],
        qf: quarterfinals.map(([a, b], i) => makeCstPlayoffsMatch("qf", i, a ?? null, b ?? null)),
        sf: [0, 1].map((i) => makeCstPlayoffsMatch("sf", i)),
        thirdPlace: [makeCstPlayoffsMatch("thirdPlace", 0)],
        gf: [makeCstPlayoffsMatch("gf", 0)],
    };
};

export const cstGroupMatchPoints = (match) =>
    match?.played && match.pickTeamId && !match.isTie && match.winnerTeamId === match.pickTeamId ? 1 : 0;
