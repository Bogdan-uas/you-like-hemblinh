import { toBaseTeam } from "./teams.js";

export const GCC_TEAM_COUNT = 16;
export const GCC_POT_COUNT = 4;
const GCC_POT_SIZE = GCC_TEAM_COUNT / GCC_POT_COUNT;
export const GCC_MATCHDAY_COUNT = 4;
export const GCC_LEAGUE_MATCH_COUNT = (GCC_TEAM_COUNT * GCC_MATCHDAY_COUNT) / 2;
export const GCC_DIRECT_QF_COUNT = 4;
export const GCC_KNOCKOUT_COUNT = 12;

export const GCC_LEAGUE_BEST_OF = 3;
export const GCC_KNOCKOUT_BEST_OF = { po: 3, qf: 3, sf: 3, thirdPlace: 3, gf: 5 };

export const GCC_LEAGUE_RATING_WEIGHT = 0.92;
export const GCC_KNOCKOUT_RATING_WEIGHTS = { po: 0.98, qf: 1.04, sf: 1.12, thirdPlace: 1.18, gf: 1.25 };

const GCC_MIN_NEEDED_PICKEM = 82;
const GCC_MAX_NEEDED_PICKEM = 134;

export const getRandomGccNeededPickemPoints = () =>
    Math.floor(Math.random() * (GCC_MAX_NEEDED_PICKEM - GCC_MIN_NEEDED_PICKEM + 1)) +
    GCC_MIN_NEEDED_PICKEM;

const GCC_MATCHDAY_POT_PAIRS = [
    [[0, 1], [2, 3]],
    [[0, 2], [1, 3]],
    [[0, 3], [1, 2]],
    [[0, 0], [1, 1], [2, 2], [3, 3]],
];

const shuffled = (items) => {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

const makeGccLeagueMatch = (matchday, number, slotA, slotB) => ({
    id: `gcc-md${matchday}-${number}`,
    matchday,
    number,
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

const drawPotPair = (potA, potB) => {
    if (potA === potB) {
        const order = shuffled(potA);
        return [[order[0], order[1]], [order[2], order[3]]].map(([a, b]) =>
            potA.indexOf(a) < potA.indexOf(b) ? [a, b] : [b, a]
        );
    }
    const opponents = shuffled(potB);
    return potA.map((team, i) => [team, opponents[i]]);
};

export const buildGccLeague = (teams) => {
    const seeded = teams.slice(0, GCC_TEAM_COUNT).map(toBaseTeam);
    const pots = Array.from({ length: GCC_POT_COUNT }, (_, i) => seeded.slice(i * GCC_POT_SIZE, (i + 1) * GCC_POT_SIZE));

    const matchdays = GCC_MATCHDAY_POT_PAIRS.map((pairs, dayIndex) =>
        pairs
            .flatMap(([a, b]) => drawPotPair(pots[a], pots[b]))
            .map(([slotA, slotB], i) => makeGccLeagueMatch(dayIndex + 1, i + 1, slotA, slotB))
    );

    return { teams: seeded, pots, matchdays, knockoutTeams: null };
};

export const getGccLeagueMatches = (league) => (league?.matchdays || []).flat();

export const isGccLeagueFinished = (league) => {
    const matches = getGccLeagueMatches(league);
    return matches.length > 0 && matches.every((m) => m.played);
};

export const findGccLeagueMatch = (league, matchId) => {
    const days = league?.matchdays || [];
    for (let day = 0; day < days.length; day++) {
        const index = days[day].findIndex((m) => m.id === matchId);
        if (index >= 0) return { day, index, match: days[day][index] };
    }
    return null;
};

export const canOpenGccLeagueMatch = (league, day, index) => {
    const match = league?.matchdays?.[day]?.[index];
    if (!match || match.played || !match.slotA || !match.slotB) return false;

    const days = league.matchdays;
    for (let d = 0; d < day; d++) {
        if (days[d].some((m) => !m.played)) return false;
    }
    return days[day].slice(0, index).every((m) => m.played);
};

export const findCurrentGccLeagueMatch = (league) => {
    const days = league?.matchdays || [];
    for (let day = 0; day < days.length; day++) {
        for (let index = 0; index < days[day].length; index++) {
            if (days[day][index].played) continue;
            return canOpenGccLeagueMatch(league, day, index) ? { day, index, id: days[day][index].id } : null;
        }
    }
    return null;
};

export const findNextGccLeagueMatch = (league, current) => {
    if (!current) return null;
    const days = league?.matchdays || [];
    let passed = false;
    for (let day = 0; day < days.length; day++) {
        for (let index = 0; index < days[day].length; index++) {
            if (!passed) {
                if (day === current.day && index === current.index) passed = true;
                continue;
            }
            if (!days[day][index].played) return { day, index, id: days[day][index].id };
        }
    }
    return null;
};

const roundsForSlots = (match) =>
    (match.setHistory || []).reduce(
        (sum, set) => {
            const pickIsA = match.pickTeamId === match.slotA?.id;
            const a = pickIsA ? set.wins : set.losses;
            const b = pickIsA ? set.losses : set.wins;
            return { a: sum.a + (Number(a) || 0), b: sum.b + (Number(b) || 0) };
        },
        { a: 0, b: 0 }
    );

export const getGccStandings = (league) => {
    const rows = new Map(
        (league?.teams || []).map((team, seed) => [
            team.id,
            { team, seed, pot: Math.floor(seed / GCC_POT_SIZE) + 1, m: 0, w: 0, l: 0, sw: 0, sl: 0, rw: 0, rl: 0, opponents: [] },
        ])
    );
    const played = getGccLeagueMatches(league).filter((m) => m.played);

    played.forEach((m) => {
        const a = rows.get(m.slotA?.id);
        const b = rows.get(m.slotB?.id);
        if (!a || !b) return;
        const rounds = roundsForSlots(m);

        a.m += 1;
        b.m += 1;
        a.sw += m.scoreLeft ?? 0;
        a.sl += m.scoreRight ?? 0;
        b.sw += m.scoreRight ?? 0;
        b.sl += m.scoreLeft ?? 0;
        a.rw += rounds.a;
        a.rl += rounds.b;
        b.rw += rounds.b;
        b.rl += rounds.a;
        a.opponents.push(b.team.id);
        b.opponents.push(a.team.id);

        if (m.winnerTeamId === a.team.id) {
            a.w += 1;
            b.l += 1;
        } else {
            b.w += 1;
            a.l += 1;
        }
    });

    const headToHead = (x, y) => {
        const m = played.find(
            (match) =>
                (match.slotA?.id === x.team.id && match.slotB?.id === y.team.id) ||
                (match.slotA?.id === y.team.id && match.slotB?.id === x.team.id)
        );
        if (!m) return 0;
        return m.winnerTeamId === x.team.id ? -1 : 1;
    };

    return [...rows.values()]
        .map((row) => ({
            ...row,
            sd: row.sw - row.sl,
            rd: row.rw - row.rl,
            buchholz: row.opponents.reduce((sum, id) => sum + (rows.get(id)?.w ?? 0), 0),
        }))
        .sort((x, y) =>
            y.w - x.w ||
            y.sd - x.sd ||
            y.rd - x.rd ||
            y.buchholz - x.buchholz ||
            headToHead(x, y) ||
            x.seed - y.seed
        )
        .map((row, i) => ({ ...row, position: i + 1 }));
};

export const gccZoneOf = (position) =>
    position <= GCC_DIRECT_QF_COUNT ? "qf" : position <= GCC_KNOCKOUT_COUNT ? "po" : "out";

const makeGccKnockoutMatch = (stage, i, slotA = null, slotB = null) => ({
    id: `gcc-${stage}-${i + 1}`,
    stage,
    gcc: true,
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

const GCC_PLAYOFF_PAIRS = [[8, 9], [5, 12], [7, 10], [6, 11]];
const GCC_QUARTERFINAL_SEEDS = [1, 4, 2, 3];

export const buildGccKnockout = (league) => {
    const byPosition = getGccStandings(league).map((row) => toBaseTeam(row.team));
    const seed = (position) => byPosition[position - 1] ?? null;

    return {
        kind: "gcc",
        ro16: [],
        po: GCC_PLAYOFF_PAIRS.map(([a, b], i) => makeGccKnockoutMatch("po", i, seed(a), seed(b))),
        qf: GCC_QUARTERFINAL_SEEDS.map((position, i) => makeGccKnockoutMatch("qf", i, seed(position))),
        sf: [0, 1].map((i) => makeGccKnockoutMatch("sf", i)),
        thirdPlace: [makeGccKnockoutMatch("thirdPlace", 0)],
        gf: [makeGccKnockoutMatch("gf", 0)],
    };
};

export const gccLeagueMatchPoints = (match) => {
    if (!match?.played || !match.pickTeamId) return 0;
    if (match.winnerTeamId === match.pickTeamId) return GCC_LEAGUE_BEST_OF;
    const pickedIsA = match.slotA && match.pickTeamId === match.slotA.id;
    const pickedSets = pickedIsA ? (match.scoreLeft ?? 0) : (match.scoreRight ?? 0);
    return pickedSets >= 1 ? 2 : 0;
};

export const getGccPlaces = (league, knockout, results) => {
    const losersOf = (stage) =>
        (knockout?.[stage] || [])
            .map((m) => (m.played ? [m.slotA, m.slotB].find((t) => t?.id === m.loserTeamId) : null))
            .filter(Boolean);
    const outOfLeague = getGccStandings(league)
        .filter((row) => gccZoneOf(row.position) === "out")
        .map((row) => toBaseTeam(row.team));

    return [
        results.winner,
        results.runnerUp,
        results.thirdPlace,
        results.fourthPlace,
        ...losersOf("qf"),
        ...losersOf("po"),
        ...outOfLeague,
    ].filter(Boolean);
};
