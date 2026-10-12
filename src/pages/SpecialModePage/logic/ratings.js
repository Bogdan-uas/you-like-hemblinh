import { CST_GROUP_RATING_WEIGHT, CST_PLAYOFFS_RATING_WEIGHTS } from "./cst.js";
import { ECL_RATING_WEIGHTS } from "./ecl.jsx";
import { PEM_GROUP_RATING_WEIGHTS, PEM_PLAYOFFS_RATING_WEIGHTS, PEM_BIG_GROUP_RATING_WEIGHTS, PEM_BIG_PLAYOFFS_RATING_WEIGHTS } from "./pemSeries.jsx";
import { PEM_STAGE1_RATING_WEIGHTS } from "./pemStage1.jsx";
import { QUALIFIER_RATING_WEIGHTS } from "./qualifier.jsx";
import { buildLeaderboard, clampMin0 } from "./teamData.js";

export const expectedScore = (ratingA, ratingB) => {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

const marginMultiplier = ({ bestOf, loserSetsWon }) => {
    if (bestOf === 1) return 1.0;

    const setsToWin = Math.ceil(bestOf / 2);
    const diff = Math.max(0, setsToWin - (loserSetsWon ?? 0));
    return 1.0 + Math.min(0.10, diff * 0.04);
};

const upsetMultiplier = (expectedWinner) => {
    const bonus = 1.0 + Math.max(0, 0.5 - expectedWinner) * 0.8;
    return Math.min(1.30, bonus);
};

const ratingGapDamp = (ratingA, ratingB) => {
    const gap = Math.abs((ratingA ?? 0) - (ratingB ?? 0));
    return 1 / (1 + gap / 600);
};

const matchImportance = ({ phase, swissStageKey, playoffsStage, bestOf, loserSetsWon }) => {
    const stage =
        phase === "swiss"
            ? swissStageWeight(swissStageKey)
            : phase === "qualifier"
                ? (QUALIFIER_RATING_WEIGHTS[playoffsStage] ?? 1.0)
                : phase === "pemGroup"
                    ? (PEM_GROUP_RATING_WEIGHTS[playoffsStage] ?? 1.0)
                    : phase === "cstGroup"
                        ? CST_GROUP_RATING_WEIGHT
                        : phase === "cstPlayoffs"
                            ? (CST_PLAYOFFS_RATING_WEIGHTS[playoffsStage] ?? 1.0)
                            : phase === "pemPlayoffs"
                                ? (PEM_PLAYOFFS_RATING_WEIGHTS[playoffsStage] ?? 1.0)
                                : phase === "ecl"
                                    ? (ECL_RATING_WEIGHTS[playoffsStage] ?? 1.0)
                                    : phase === "pemStage1"
                                        ? (PEM_STAGE1_RATING_WEIGHTS[playoffsStage] ?? 1.0)
                                        : phase === "pemBigGroup"
                                            ? (PEM_BIG_GROUP_RATING_WEIGHTS[playoffsStage] ?? 1.0)
                                            : phase === "pemBigPlayoffs"
                                                ? (PEM_BIG_PLAYOFFS_RATING_WEIGHTS[playoffsStage] ?? 1.0)
                                                : playoffsWeight(playoffsStage);

    return stage * boWeight(bestOf) * marginMultiplier({ bestOf, loserSetsWon });
};

const RECENCY_HALF_LIFE_DAYS = 120;
const dayMs = 24 * 60 * 60 * 1000;

const recencyWeight = (playedAtMs, nowMs = Date.now()) => {
    if (!playedAtMs) return 1.0;
    const ageDays = Math.max(0, (nowMs - playedAtMs) / dayMs);
    return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
};

const swissStageWeight = (swissStageKey) => {
    if (swissStageKey === "stage1") return 1.0;
    if (swissStageKey === "stage2") return 1.25;
    if (swissStageKey === "stage3") return 1.5;
    return 1.0;
};

const playoffsWeight = (playoffsStage) => {
    if (playoffsStage === "ro16") return 1.75;
    if (playoffsStage === "qf") return 2.5;
    if (playoffsStage === "sf") return 3.0;
    if (playoffsStage === "thirdPlace") return 3.25;
    if (playoffsStage === "gf") return 5.0;
    return 1.0;
};

const boWeight = (bestOf) => {
    if (bestOf <= 1) return 1.0;
    if (bestOf <= 3) return 1.25;
    if (bestOf <= 5) return 1.5;
    if (bestOf <= 7) return 2.0;
    return 3.0;
};

const computeRsDeltas = ({
    ratings,
    winnerId,
    loserId,
    phase,
    swissStageKey,
    playoffsStage,
    bestOf,
    loserSetsWon,
    playedAtMs,
}) => {
    const rW = ratings?.[winnerId] ?? 0;
    const rL = ratings?.[loserId] ?? 0;

    const eW = expectedScore(rW, rL);

    const K_BASE = 20;

    const imp = matchImportance({ phase, swissStageKey, playoffsStage, bestOf, loserSetsWon });
    const rec = recencyWeight(playedAtMs);
    const upset = upsetMultiplier(eW);
    const damp = ratingGapDamp(rW, rL);

    const K = K_BASE * imp * rec * upset * damp;

    const rawWinGain = K * (1 - eW);
    return { rawWinGain, eW, K, imp, upset, damp };
};

const lossScaleFromExpectedWinner = (eW) => {
    if (eW >= 0.5) {
        return 0.56 - 0.16 * eW;
    }
    return 0.72 - 0.20 * eW;
};

export const applyRatings = ({
    ratings,
    teams,
    winnerId,
    loserId,
    phase,
    swissStageKey,
    swissNet,
    playoffsStage,
    bestOf,
    loserSetsWon,
    playedAtMs,
}) => {
    const beforeLb = buildLeaderboard(teams, ratings);
    const beforeRankW = beforeLb.rankById[winnerId] ?? null;
    const beforeRankL = beforeLb.rankById[loserId] ?? null;

    const next = { ...ratings };
    const beforePointsW = next[winnerId] ?? 0;
    const beforePointsL = next[loserId] ?? 0;

    const { rawWinGain, eW } = computeRsDeltas({
        ratings: next,
        winnerId,
        loserId,
        phase,
        swissStageKey,
        playoffsStage,
        bestOf,
        loserSetsWon,
        playedAtMs,
    });

    const MAX_WIN_POINTS = 165;
    const winPoints = Math.max(1, Math.min(MAX_WIN_POINTS, Math.round(rawWinGain)));
    const lossScale = lossScaleFromExpectedWinner(eW);

    let losePoints = Math.max(
        1,
        Math.min(
            winPoints - 1,
            Math.round(winPoints * lossScale * 1.1)
        )
    );

    const isGrandFinal =
        ["playoffs", "cstPlayoffs", "pemPlayoffs", "pemBigPlayoffs", "ecl"].includes(phase) && playoffsStage === "gf";

    if (isGrandFinal) {
        losePoints = Math.round(winPoints * 0.2);
    }

    next[winnerId] = clampMin0(beforePointsW + winPoints);
    next[loserId] = clampMin0(beforePointsL - losePoints);

    const afterLb = buildLeaderboard(teams, next);
    const afterRankW = afterLb.rankById[winnerId] ?? null;
    const afterRankL = afterLb.rankById[loserId] ?? null;

    return {
        nextRatings: next,
        meta: {
            winnerId,
            loserId,
            winPoints,
            losePoints,
            debug: {
                phase,
                swissStageKey,
                swissNet,
                playoffsStage,
                bestOf,
                loserSetsWon,
                playedAtMs: playedAtMs ?? null,
                expectedWinner: eW,
                lossScale,
                gfNoLossApplied: isGrandFinal,
            },
            before: {
                [winnerId]: { points: beforePointsW, rank: beforeRankW },
                [loserId]: { points: beforePointsL, rank: beforeRankL },
            },
            after: {
                [winnerId]: { points: next[winnerId], rank: afterRankW },
                [loserId]: { points: next[loserId], rank: afterRankL },
            },
        },
    };
};

export const applyTieRatings = ({ ratings, teams, leftId, rightId, phase, playoffsStage, bestOf, playedAtMs }) => {
    const beforeLb = buildLeaderboard(teams, ratings);
    const next = { ...ratings };
    const beforeLeft = next[leftId] ?? 0;
    const beforeRight = next[rightId] ?? 0;

    const eLeft = expectedScore(beforeLeft, beforeRight);
    const K =
        20 *
        matchImportance({ phase, playoffsStage, bestOf, loserSetsWon: 0 }) *
        recencyWeight(playedAtMs) *
        ratingGapDamp(beforeLeft, beforeRight);
    const leftDelta = Math.max(-165, Math.min(165, Math.round(K * (0.5 - eLeft))));

    next[leftId] = clampMin0(beforeLeft + leftDelta);
    next[rightId] = clampMin0(beforeRight - leftDelta);

    const afterLb = buildLeaderboard(teams, next);

    return {
        nextRatings: next,
        meta: {
            tie: true,
            winnerId: null,
            loserId: null,
            debug: { phase, playoffsStage, bestOf, playedAtMs: playedAtMs ?? null, expectedLeft: eLeft },
            before: {
                [leftId]: { points: beforeLeft, rank: beforeLb.rankById[leftId] ?? null },
                [rightId]: { points: beforeRight, rank: beforeLb.rankById[rightId] ?? null },
            },
            after: {
                [leftId]: { points: next[leftId], rank: afterLb.rankById[leftId] ?? null },
                [rightId]: { points: next[rightId], rank: afterLb.rankById[rightId] ?? null },
            },
        },
    };
};

export const getRsPrediction = ({
    ratings,
    teams,
    leftTeam,
    rightTeam,
    phase,
    swissStageKey,
    swissNet,
    playoffsStage,
    bestOf,
    loserSetsWon,
    playedAtMs,
}) => {
    if (!leftTeam?.id || !rightTeam?.id) return null;

    const simulate = (winnerId, loserId) => {
        const result = applyRatings({
            ratings: { ...ratings },
            teams,
            winnerId,
            loserId,
            phase,
            swissStageKey,
            swissNet,
            playoffsStage,
            bestOf,
            loserSetsWon,
            playedAtMs,
        });

        const before = result.meta.before;
        const after = result.meta.after;

        return {
            winnerId,
            loserId,

            left: {
                deltaPoints:
                    (after[leftTeam.id]?.points ?? 0) -
                    (before[leftTeam.id]?.points ?? 0),

                beforeRank: before[leftTeam.id]?.rank ?? null,
                afterRank: after[leftTeam.id]?.rank ?? null,
            },

            right: {
                deltaPoints:
                    (after[rightTeam.id]?.points ?? 0) -
                    (before[rightTeam.id]?.points ?? 0),

                beforeRank: before[rightTeam.id]?.rank ?? null,
                afterRank: after[rightTeam.id]?.rank ?? null,
            },
        };
    };

    const leftWins = simulate(leftTeam.id, rightTeam.id);
    const rightWins = simulate(rightTeam.id, leftTeam.id);

    return {
        left: {
            win: {
                points: leftWins.left.deltaPoints,
                beforeRank: leftWins.left.beforeRank,
                afterRank: leftWins.left.afterRank,
            },
            loss: {
                points: rightWins.left.deltaPoints,
                beforeRank: rightWins.left.beforeRank,
                afterRank: rightWins.left.afterRank,
            },
        },

        right: {
            win: {
                points: rightWins.right.deltaPoints,
                beforeRank: rightWins.right.beforeRank,
                afterRank: rightWins.right.afterRank,
            },
            loss: {
                points: leftWins.right.deltaPoints,
                beforeRank: leftWins.right.beforeRank,
                afterRank: leftWins.right.afterRank,
            },
        },
    };
};
