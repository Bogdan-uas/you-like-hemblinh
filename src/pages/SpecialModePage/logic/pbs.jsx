import { getMatchLoserTeam } from "./brackets.js";
import {
    PBS_TEAM_COUNT,
    PBS_STAGE_ORDER,
    PBS_BEST_OF,
    PBS_BOUNTY_SHARE,
    PBS_VIEW_OF_ROUND,
    pbsSeedBounty,
} from "./pbsConfig.js";
import { getMatchWinPrediction } from "./statActivation.js";
import { buildLeaderboard } from "./teamData.js";
import { toBaseTeam } from "./teams.js";

const PBS_ROUND_SIZES = { ro32: 16, ro16: 8, qf: 4, sf: 2, thirdPlace: 1, gf: 1 };

export const PBS_DIRECT_COUNT = 28;

export const buildPbsSeedsFromTeams = (teams) =>
    teams.slice(0, PBS_TEAM_COUNT).map((team, i) => ({
        ...toBaseTeam(team),
        seed: i + 1,
        bounty: pbsSeedBounty(i + 1),
    }));

export const buildPbsSeeds = (teams, ratings) =>
    buildPbsSeedsFromTeams(buildLeaderboard(teams, ratings).sorted.slice(0, PBS_DIRECT_COUNT));

export const buildPbsStatus = (seeds) =>
    Object.fromEntries(seeds.map((team) => [team.id, { seed: team.seed, bounty: team.bounty }]));

const makePbsMatch = (stage, i) => ({
    id: `${stage}-${i + 1}`,
    stage,
    pbs: true,
    slotA: null,
    slotB: null,
    played: false,
    scoreLeft: null,
    scoreRight: null,
    winnerTeamId: null,
    loserTeamId: null,
    pickTeamId: null,
    setHistory: [],
});

export const buildPbsBracket = () => ({
    kind: "pbs",
    ...Object.fromEntries(
        PBS_STAGE_ORDER.map((stage) => [stage, Array.from({ length: PBS_ROUND_SIZES[stage] }, (_, i) => makePbsMatch(stage, i))])
    ),
});

export const isPbsRoundFinished = (bracket, round) =>
    (bracket?.[round] || []).length > 0 && bracket[round].every((m) => m.played);

export const resolvePbsResult = (status, winnerId, loserId) => {
    const winner = status?.[winnerId] ?? { seed: PBS_TEAM_COUNT, bounty: 0 };
    const loser = status?.[loserId] ?? { seed: PBS_TEAM_COUNT, bounty: 0 };
    const claimed = Math.round((loser.bounty ?? 0) * PBS_BOUNTY_SHARE);
    const favouriteWon = winner.seed < loser.seed;

    const nextWinner = { seed: Math.min(winner.seed, loser.seed), bounty: (winner.bounty ?? 0) + claimed };
    const nextLoser = { seed: loser.seed, bounty: 0, out: true };

    return {
        status: { ...status, [winnerId]: nextWinner, [loserId]: nextLoser },
        meta: {
            before: { [winnerId]: { seed: winner.seed, bounty: winner.bounty }, [loserId]: { seed: loser.seed, bounty: loser.bounty } },
            after: { [winnerId]: nextWinner, [loserId]: { seed: nextLoser.seed, bounty: nextLoser.bounty } },
            claimed,
            favouriteWon,
        },
    };
};

export const getPbsRoundWinners = (bracket, round) =>
    (bracket?.[round] || [])
        .map((m) => (m.played ? [m.slotA, m.slotB].find((team) => team?.id === m.winnerTeamId) ?? null : null))
        .filter(Boolean);

const shuffle = (items) => {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

const buildConsideration = (options) => {
    const chosen = options[0];
    if (options.length === 1) return [chosen.cand.id];

    const glanced = shuffle(options.slice(1, Math.min(options.length, 3)));
    const closeCall = options.length > 1 && options[0].score - options[1].score < 0.025;
    const sequence = glanced.map((o) => o.cand.id);

    if (closeCall) {
        const runnerUp = options[1].cand.id;
        const withoutRunnerUp = sequence.filter((id) => id !== runnerUp);
        return [...withoutRunnerUp, chosen.cand.id, runnerUp, chosen.cand.id];
    }

    return [...sequence, chosen.cand.id];
};

const describePick = (chosen, options) => {
    const maxBounty = Math.max(...options.map((o) => o.cand.bounty ?? 0));
    const maxWinP = Math.max(...options.map((o) => o.winP));

    if ((chosen.cand.bounty ?? 0) === maxBounty && chosen.winP < maxWinP - 0.02) return "bounty";
    if (chosen.winP >= maxWinP - 0.005) return "safe";
    return "risk";
};

export const PBS_PICK_REASONS = {
    bounty: "goes for the biggest bounty",
    safe: "picks the most beatable opponent",
    risk: "takes a calculated risk",
};

const binomial = (n, k) => {
    let out = 1;
    for (let i = 1; i <= k; i++) out = (out * (n - k + i)) / i;
    return out;
};

const seriesWinFromSet = (p, setsToWin) => {
    let total = 0;
    for (let j = 0; j < setsToWin; j++) total += binomial(setsToWin - 1 + j, j) * Math.pow(p, setsToWin) * Math.pow(1 - p, j);
    return total;
};

export function* planPbsDraftSteps({ round, entrants, ratings, teams, stats }) {
    const sorted = [...entrants].sort((a, b) => a.seed - b.seed);
    const half = sorted.length / 2;
    const high = sorted.slice(0, half);
    const low = sorted.slice(half);
    const teamById = Object.fromEntries((teams || []).map((team) => [team.id, team]));
    const remaining = [...high];

    const setsToWin = Math.ceil((PBS_BEST_OF[round] ?? 3) / 2);
    const predict = (picker, cand) =>
        seriesWinFromSet(
            getMatchWinPrediction({
                leftTeam: teamById[picker.id] ?? picker,
                rightTeam: teamById[cand.id] ?? cand,
                leftStats: stats?.[picker.id],
                rightStats: stats?.[cand.id],
                ratings,
                teams,
                matchContext: { type: "playoffs", kind: "pbs", stage: round },
                bestOf: 1,
            }).leftWinProbability,
            setsToWin
        );

    const pickAppetite = () => {
        const roll = Math.random();
        if (roll < 0.15) return 1.5 + Math.random() * 0.9;
        if (roll < 0.4) return 0.6 + Math.random() * 0.5;
        return 0.1 + Math.random() * 0.4;
    };

    const picks = [];
    for (const picker of low) {
        const appetite = pickAppetite();

        const options = remaining
            .map((cand) => {
                const winP = predict(picker, cand);
                const reward = (cand.bounty ?? 0) * PBS_BOUNTY_SHARE + Math.max(0, picker.seed - cand.seed) * 0.4;
                const score = winP * (1 + (appetite * reward) / 25) + (Math.random() - 0.5) * 0.05;
                return { cand, winP, score };
            })
            .sort((a, b) => b.score - a.score);

        const chosen = options[0];
        remaining.splice(remaining.findIndex((c) => c.id === chosen.cand.id), 1);

        picks.push({
            pickerId: picker.id,
            pickedId: chosen.cand.id,
            considered: buildConsideration(options),
            reason: describePick(chosen, options),
        });
        yield picks.length;
    }

    return {
        round,
        status: Object.fromEntries(sorted.map((team) => [team.id, { seed: team.seed, bounty: team.bounty ?? 0 }])),
        high: high.map((team) => team.id),
        low: low.map((team) => team.id),
        picks,
    };
}

export const planPbsDraft = (args) => {
    const steps = planPbsDraftSteps(args);
    let step = steps.next();
    while (!step.done) step = steps.next();
    return step.value;
};

export const splitPbsEntrants = (entrants) => {
    const sorted = [...(entrants || [])].sort((a, b) => a.seed - b.seed);
    const half = sorted.length / 2;
    return {
        high: sorted.slice(0, half).map((team) => team.id),
        low: sorted.slice(half).map((team) => team.id),
        status: Object.fromEntries(sorted.map((team) => [team.id, { seed: team.seed, bounty: team.bounty ?? 0 }])),
    };
};

export const PBS_DRAFT_TIMING = {
    rollIn: 900,
    afterRollIn: 350,
    fadeLow: 700,
    afterFade: 150,
    lowFly: 1100,
    lowStagger: 420,
    afterLow: 300,
    center: 900,
    afterCenter: 350,
    highlight: 750,
    consider: 650,
    pickFly: 1100,
    recenterDelay: 300,
    recenter: 700,
    afterPick: 350,
    beforeRollOut: 600,
    rollOut: 900,
};

export const buildPbsDraftTimeline = (plan) => {
    const T = PBS_DRAFT_TIMING;
    let t = 0;

    const rollIn = [0, T.rollIn];
    t = T.rollIn + T.afterRollIn;

    const fadeLow = [t, t + T.fadeLow];
    t += T.fadeLow + T.afterFade;

    const lowFlights = plan.low.map((teamId, i) => ({
        teamId,
        matchIdx: i,
        start: t + i * T.lowStagger,
        end: t + i * T.lowStagger + T.lowFly,
    }));
    t = (lowFlights.length ? lowFlights[lowFlights.length - 1].end : t) + T.afterLow;

    const center = [t, t + T.center];
    t += T.center + T.afterCenter;

    const picks = plan.picks.map((pick, i) => {
        const highlight = [t, t + T.highlight];
        t += T.highlight;

        const consider = pick.considered.map((teamId) => {
            const slot = { teamId, start: t, end: t + T.consider };
            t += T.consider;
            return slot;
        });

        const flight = { teamId: pick.pickedId, matchIdx: i, start: t, end: t + T.pickFly };
        const recenter = [t + T.recenterDelay, t + T.recenterDelay + T.recenter];
        t += T.pickFly + T.afterPick;

        return { ...pick, matchIdx: i, highlight, consider, flight, recenter };
    });

    t += T.beforeRollOut;
    const rollOut = [t, t + T.rollOut];
    t += T.rollOut;

    return { rollIn, fadeLow, lowFlights, center, picks, rollOut, total: t };
};

export const clamp01 = (v) => Math.max(0, Math.min(1, v));

export const easeInOut = (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

export const windowProgress = (p, [start, end]) => (end <= start ? (p >= end ? 1 : 0) : clamp01((p - start) / (end - start)));

export const getPbsSlotLanding = (timeline, matchIdx, slotKey) =>
    slotKey === "slotA"
        ? timeline?.lowFlights?.[matchIdx]?.end ?? Infinity
        : timeline?.picks?.[matchIdx]?.flight?.end ?? Infinity;

export const getPbsDraftRoundView = (round) => PBS_VIEW_OF_ROUND[round] ?? "pbsStage1";

export const getPbsBountyLine = (stage, favouriteWon) =>
    stage === "thirdPlace" ? null : stage === "ro32" && favouriteWon ? "keeps its bounty" : "takes the bounty away";

export const getPbsBountyBonus = (bounty) => Math.ceil((bounty ?? 0) / 4);

export const getPbsStakeTexts = (stage, favouriteWon) => {
    const bountyLine = getPbsBountyLine(stage, favouriteWon);

    if (stage === "ro32") {
        return {
            winner: <>qualifies to <b>Round of 16</b><br/>and<br />{bountyLine}</>,
            loser: "flies out of the tournament",
        };
    }
    if (stage === "ro16") {
        return {
            winner: <>qualifies to <b>Quarterfinals</b><br/>and<br />{bountyLine}</>,
            loser: "flies out of the tournament",
        };
    }
    if (stage === "qf") {
        return {
            winner: <>qualifies to <b>Semifinals</b><br />{bountyLine}</>,
            loser: "path ends here, for now!",
        };
    }
    return null;
};

export const getPbsPlaces = (bracket, results) => {
    const quarterLosers = (bracket?.qf || [])
        .map(getMatchLoserTeam)
        .filter(Boolean);

    return [results.winner, results.runnerUp, results.thirdPlace, results.fourthPlace, ...quarterLosers].filter(Boolean);
};
