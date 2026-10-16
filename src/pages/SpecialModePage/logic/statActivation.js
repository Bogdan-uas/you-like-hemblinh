import { ECL_UNBEATEN_STAGES, ECL_ELIMINATION_STAGES, ECL_BIG_STAGE_GAINS, ECL_BATTLE_STAKES } from "./ecl.jsx";
import { MULTIPLIER_MIN, MULTIPLIER_MAX } from "./gameConstants.js";
import { PEM_GROUP_UPPER_STAGES, PEM_GROUP_ELIMINATION_STAGES, PEM_GROUP_QUALIFYING_STAGES, PEM_GROUP_BATTLE_STAKES } from "./pemSeries.jsx";
import { PEM_STAGE1_UPPER_STAGES, PEM_STAGE1_ELIMINATION_STAGES, PEM_STAGE1_QUALIFYING_STAGES, PEM_STAGE1_BATTLE_STAKES } from "./pemStage1.jsx";
import { predictLeftSeriesWin } from "./predictions.js";
import { QUALIFIER_UPPER_STAGES, QUALIFIER_ELIMINATION_STAGES, QUALIFIER_QUALIFYING_STAGES, QUALIFIER_BATTLE_STAKES } from "./qualifier.jsx";
import { expectedScore } from "./ratings.js";
import {
    clampShare,
    otherSide,
    bumpStat,
    computeRollBonus,
    ratingRollEdge,
    resolveUpsetMatchup,
    normalizeLiveStats,
    unbeatenBreakerWinGain,
    unbeatenBreakerLossAmount,
    settleComebacks,
    setAmountOf,
    COMEBACK,
    stepComebackTracker,
    SET_COMEBACK_RULE,
    upsetPedigreeSetDeltas,
} from "./statEffects.js";
import { isProgressionOrEliminationNet, calcSetsToWin } from "./swiss.js";
import { buildLeaderboard } from "./teamData.js";
import { DEFAULT_TEAM_STAT_VALUES, UNBEATEN_STREAK_DEFINITION } from "./teamStats.js";

const ELIMINATION_NETS = ["0:2", "1:2", "2:2"];
const PLAYOFF_ROUND_INDEX = { ro16: 0, qf: 1, sf: 2, gf: 3 };

const TOP_SEED_RANK_LIMIT = 10;

const STAT_NOT_ACTIVATED_NOTE = "Not activated";

const CONDITIONAL_STAT_KEYS = [
    "bigStage",
    "upsetPedigree",
    "bounceBack",
    "finisher",
    "elimNerve",
    "unbeatenNerve",
    "topSeed",
    "unbeatenStreakBreaker",
];

export const STAT_ACTIVATION_VERSION = 2;

const BATTLE_XP_FULL = 30;
const BATTLE_SWISS_STAKES = { stage1: 0.15, stage2: 0.3, stage3: 0.45, "gpl:stage1": 0.3, "gpl:stage2": 0.45 };
const BATTLE_DECISIVE_NET_STAKES = 0.15;
const BATTLE_PLAYOFF_STAKES = { ro32: 0.55, ro16: 0.65, qf: 0.75, sf: 0.85, thirdPlace: 0.7, gf: 1 };

const readOptionalNumber = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

const readBattleXp = (stats) => {
    const n = readOptionalNumber(stats?.battleXp);
    return n === null ? null : Math.max(0, n);
};

const statKindOfContext = (context) =>
    context?.type === "swiss" || context?.type === "cstGroup" || context?.type === "gccLeague"
        ? "swiss"
        : context?.type === "qualifier"
            ? "qualifier"
            : context?.type === "pemGroup"
                ? "pemGroup"
                : context?.type === "ecl"
                    ? "ecl"
                    : context?.type === "pemStage1"
                        ? "pemStage1"
                        : "playoffs";

const BRACKET_STAT_KINDS = ["qualifier", "pemGroup", "ecl", "pemStage1"];

const isBracketStatKind = (kind) => BRACKET_STAT_KINDS.includes(kind);

const bracketGroupStagesOf = (kind) =>
    kind === "pemGroup"
        ? { upper: PEM_GROUP_UPPER_STAGES, elimination: PEM_GROUP_ELIMINATION_STAGES, qualifying: PEM_GROUP_QUALIFYING_STAGES }
        : kind === "ecl"
            ? { upper: ECL_UNBEATEN_STAGES, elimination: ECL_ELIMINATION_STAGES, qualifying: Object.keys(ECL_BIG_STAGE_GAINS) }
            : kind === "pemStage1"
                ? { upper: PEM_STAGE1_UPPER_STAGES, elimination: PEM_STAGE1_ELIMINATION_STAGES, qualifying: PEM_STAGE1_QUALIFYING_STAGES }
                : { upper: QUALIFIER_UPPER_STAGES, elimination: QUALIFIER_ELIMINATION_STAGES, qualifying: QUALIFIER_QUALIFYING_STAGES };

const battleStakesOf = ({ kind, swissStageKey, net, playoffsStage }) => {
    if (kind === "playoffs") return BATTLE_PLAYOFF_STAKES[playoffsStage] ?? BATTLE_PLAYOFF_STAKES.ro16;
    if (kind === "qualifier") return QUALIFIER_BATTLE_STAKES[playoffsStage] ?? QUALIFIER_BATTLE_STAKES.uo;
    if (kind === "pemGroup") return PEM_GROUP_BATTLE_STAKES[playoffsStage] ?? PEM_GROUP_BATTLE_STAKES.uo;
    if (kind === "ecl") return ECL_BATTLE_STAKES[playoffsStage] ?? ECL_BATTLE_STAKES.uo;
    if (kind === "pemStage1") return PEM_STAGE1_BATTLE_STAKES[playoffsStage] ?? PEM_STAGE1_BATTLE_STAKES.uo;
    const base = BATTLE_SWISS_STAKES[swissStageKey] ?? BATTLE_SWISS_STAKES.stage1;
    return clampShare(base + (isProgressionOrEliminationNet(net) ? BATTLE_DECISIVE_NET_STAKES : 0));
};

const battleDifficulty = ({ ownRating, oppRating, oppRank, fieldSize, stakes }) => {
    const oppWinOdds = expectedScore(oppRating, ownRating);
    const oppStanding =
        fieldSize > 1 && Number.isFinite(oppRank)
            ? clampShare(1 - (oppRank - 1) / (fieldSize - 1))
            : 0.5;
    return clampShare(0.4 * oppWinOdds + 0.3 * oppStanding + 0.3 * stakes);
};

const battleXpGain = (setsPlayed, difficulty) =>
    Math.max(1, setsPlayed) * (0.5 + clampShare(difficulty));

const battleTestedDelta = ({ won, difficulty, experience }) => {
    const d = clampShare(difficulty);
    const weight = 0.6 + 0.4 * clampShare(experience / BATTLE_XP_FULL);
    return won ? 1 + 5 * d * weight : -(1 + 4 * (1 - d) * weight);
};

const STAT_SEASON_PULL = 0.15;
const STAT_SEASON_PULL_KEYS = ["bigStage", "battleTested", "elimNerve", "finisher", "unbeatenNerve"];

export const pullStatsTowardStart = (teamStats, teamIds = null) => {
    const pulledIds = teamIds ? new Set(teamIds.map(String)) : null;
    const out = {};
    Object.entries(teamStats ?? {}).forEach(([id, stats]) => {
        const next = { ...stats };
        if (pulledIds && !pulledIds.has(String(id))) {
            out[id] = next;
            return;
        }
        STAT_SEASON_PULL_KEYS.forEach((key) => {
            const start = DEFAULT_TEAM_STAT_VALUES[key];
            const value = Number(stats?.[key]);
            if (!Number.isFinite(value) || !Number.isFinite(start)) return;
            next[key] = Math.round((value + (start - value) * STAT_SEASON_PULL) * 100) / 100;
        });
        out[id] = next;
    });
    return out;
};

export const resetBattleExperience = (teamStats) => {
    const out = {};
    Object.entries(teamStats ?? {}).forEach(([id, stats]) => {
        out[id] = { ...stats, battleXp: 0 };
    });
    return out;
};

const deriveStatActivation = ({ kind, net, playoffsStage, bestOf, streak, upset, rank, values }) => {
    const isSwiss = kind === "swiss";
    const isQualifier = isBracketStatKind(kind);
    const groupStages = bracketGroupStagesOf(kind);
    const isThirdPlace = !isSwiss && !isQualifier && playoffsStage === "thirdPlace";
    const [winsInStage, lossesInStage] = isSwiss
        ? String(net ?? "").split(":").map((n) => Number(n) || 0)
        : [0, 0];
    const unbeatenEligible = isQualifier
        ? groupStages.upper.includes(playoffsStage)
        : !isThirdPlace && (!isSwiss || lossesInStage === 0);

    const multiSet = Number.isFinite(bestOf) ? calcSetsToWin(bestOf) > 1 : null;
    const elimNerve = isSwiss
        ? ELIMINATION_NETS.includes(net)
        : isQualifier
            ? groupStages.elimination.includes(playoffsStage)
            : !isThirdPlace;

    const bigStageCanRise = isSwiss
        ? winsInStage === 2
        : isQualifier
            ? groupStages.qualifying.includes(playoffsStage)
            : true;
    const bigStageCanFall = isSwiss
        ? lossesInStage === 2
        : kind === "qualifier" && QUALIFIER_ELIMINATION_STAGES.includes(playoffsStage);

    const upsetKnown = upset !== null && upset !== undefined;

    const isFloored = (side, key) => {
        const v = values?.[side]?.[key];
        return Number.isFinite(v) && v <= 0;
    };

    const sideOf = (side) => {
        const ownStreak = streak?.[side] ?? null;
        const foeStreak = streak?.[otherSide(side)] ?? null;
        const ownRank = rank?.[side] ?? null;

        const bigStage =
            bigStageCanRise || (bigStageCanFall && !isFloored(side, "bigStage"));
        const upsetPedigree = !upsetKnown
            ? null
            : !!upset.active &&
            (upset.underdogSide === side || !isFloored(side, "upsetPedigree"));

        return {
            bigStage,
            upsetPedigree,
            bounceBack: multiSet,
            finisher: multiSet,
            elimNerve,
            unbeatenNerve: ownStreak === null ? null : unbeatenEligible && ownStreak >= 1,
            battleTested: true,
            topSeed: ownRank === null ? null : ownRank >= 1 && ownRank <= TOP_SEED_RANK_LIMIT,
            unbeatenStreakBreaker: foeStreak === null ? null : foeStreak >= 1,
        };
    };

    return { left: sideOf("left"), right: sideOf("right") };
};

export const buildStatRowNotes = (activation) => {
    if (!activation) return null;
    const notes = {};
    CONDITIONAL_STAT_KEYS.forEach((key) => {
        if (activation[key] === false) notes[key] = STAT_NOT_ACTIVATED_NOTE;
    });
    return notes;
};

export const getFinishedMatchStatActivation = ({ match, modalContext, bestOf, leftTeam, rightTeam }) => {
    const leftId = leftTeam?.id;
    const rightId = rightTeam?.id;
    if (!match || !leftId || !rightId) return null;

    const stored = match.statsMeta?.statActivation;
    if (
        stored?.version === STAT_ACTIVATION_VERSION &&
        stored.byTeam?.[leftId] &&
        stored.byTeam?.[rightId]
    ) {
        return { left: stored.byTeam[leftId], right: stored.byTeam[rightId] };
    }

    const before = match.statsMeta?.before;
    const ratingsBefore = match.ratingMeta?.before;
    const storedUpset = match.statsMeta?.upset ?? null;
    const streakOf = (id) => {
        const n = readOptionalNumber(before?.[id]?.unbeatenStreak);
        return n === null ? null : Math.max(0, Math.floor(n));
    };

    return deriveStatActivation({
        kind: statKindOfContext(modalContext),
        net: modalContext?.net ?? null,
        playoffsStage: modalContext?.stage ?? null,
        bestOf,
        streak: { left: streakOf(leftId), right: streakOf(rightId) },
        values: {
            left: {
                bigStage: readOptionalNumber(before?.[leftId]?.bigStage),
                upsetPedigree: readOptionalNumber(before?.[leftId]?.upsetPedigree),
            },
            right: {
                bigStage: readOptionalNumber(before?.[rightId]?.bigStage),
                upsetPedigree: readOptionalNumber(before?.[rightId]?.upsetPedigree),
            },
        },
        upset: storedUpset?.underdogTeamId
            ? {
                active: !!storedUpset.active,
                underdogSide: storedUpset.underdogTeamId === leftId ? "left" : "right",
            }
            : storedUpset
                ? { active: !!storedUpset.active, underdogSide: null }
                : null,
        rank: {
            left: readOptionalNumber(ratingsBefore?.[leftId]?.rank),
            right: readOptionalNumber(ratingsBefore?.[rightId]?.rank),
        },
    });
};

const finisherSweepAmount = (setsToWin) => 2 + Math.max(0, setsToWin - 2);

const applyFinisherResult = (liveStats, { seriesWinner, setsToWin, winnerTrailed, loserSets }) => {
    if (!(setsToWin > 1)) return liveStats;

    const amount = finisherSweepAmount(setsToWin);
    let stats = liveStats;

    if (!winnerTrailed && loserSets < 2) {
        stats = bumpStat(stats, seriesWinner, "finisher", amount);
    }
    if (loserSets === 0) {
        stats = bumpStat(stats, otherSide(seriesWinner), "finisher", -amount);
    }
    return stats;
};

const seriesSeverity = (winnerSets, loserSets) => {
    const w = Math.max(1, Number(winnerSets) || 0);
    const l = Math.max(0, Number(loserSets) || 0);
    return Math.max(0.25, Math.min(1, (w - l) / w));
};

const upsetBonusCapAtStart = ({ seeded, matchCtx, setsToWin, underdogSide }) => {
    const midRoll = (MULTIPLIER_MIN + MULTIPLIER_MAX) / 2;
    const ctx = {
        liveStats: seeded,
        matchCtx,
        otContext: { active: false, depth: 0 },
        bounceBackArmedSide: null,
        lastRoundLoserSide: null,
        finisherActive: setsToWin > 1,
    };
    const edge =
        computeRollBonus(otherSide(underdogSide), midRoll, ctx) -
        computeRollBonus(underdogSide, midRoll, ctx);
    return Math.round(Math.max(0, edge) * 10000) / 10000;
};

export const buildMatchStatContext = ({
    kind,
    net = null,
    swissStageKey = null,
    playoffsStage = null,
    bestOf,
    leftTeam,
    rightTeam,
    seededStats,
    ratings,
    teams,
    unbeatenEligibleBySide = null,
}) => {
    const isSwiss = kind === "swiss";
    const isQualifier = isBracketStatKind(kind);
    const engineKind = isSwiss ? "swiss" : isQualifier ? kind : "playoffs";
    const isThirdPlace = !isSwiss && !isQualifier && playoffsStage === "thirdPlace";
    const lossesInStage = isSwiss ? Number(String(net ?? "").split(":")[1]) || 0 : 0;

    const unbeatenEligible = isQualifier
        ? bracketGroupStagesOf(kind).upper.includes(playoffsStage)
        : !isThirdPlace && (!isSwiss || lossesInStage === 0);
    const streakOf = (side) =>
        Math.max(0, Math.floor(Number(seededStats?.[side]?.unbeatenStreak) || 0));

    const { rankById } = buildLeaderboard(teams, ratings);
    const ratingOf = (team) => Number(ratings?.[team?.id]) || 0;
    const rankOf = (team) => rankById?.[team?.id] ?? null;

    const activationFor = (upset) =>
        deriveStatActivation({
            kind: engineKind,
            net,
            playoffsStage,
            bestOf,
            streak: { left: streakOf("left"), right: streakOf("right") },
            values: { left: seededStats?.left, right: seededStats?.right },
            upset,
            rank: { left: rankOf(leftTeam), right: rankOf(rightTeam) },
        });

    const baseActive = activationFor({ active: false, underdogSide: null });

    const stakes = battleStakesOf({
        kind: engineKind,
        swissStageKey,
        net,
        playoffsStage,
    });
    const fieldSize = teams?.length ?? 0;
    const difficultyFor = (own, opponent) =>
        battleDifficulty({
            ownRating: ratingOf(own),
            oppRating: ratingOf(opponent),
            oppRank: rankOf(opponent),
            fieldSize,
            stakes,
        });

    const baseCtx = {
        kind: engineKind,
        isBo1: bestOf === 1,
        elimNerveActive: baseActive.left.elimNerve,
        unbeatenExempt: isThirdPlace,
        unbeatenRoundIndex: isQualifier ? 0 : PLAYOFF_ROUND_INDEX[playoffsStage] ?? 0,
        unbeaten: {
            left: { eligible: unbeatenEligibleBySide?.left ?? unbeatenEligible, active: baseActive.left.unbeatenNerve },
            right: { eligible: unbeatenEligibleBySide?.right ?? unbeatenEligible, active: baseActive.right.unbeatenNerve },
        },
        battle: {
            left: { difficulty: difficultyFor(leftTeam, rightTeam) },
            right: { difficulty: difficultyFor(rightTeam, leftTeam) },
        },
        unbeatenBreaker: {
            left: { active: baseActive.left.unbeatenStreakBreaker, streak: streakOf("right") },
            right: { active: baseActive.right.unbeatenStreakBreaker, streak: streakOf("left") },
        },
        topSeedRank: { left: rankOf(leftTeam), right: rankOf(rightTeam) },
        ratingEdge: {
            left: ratingRollEdge(ratingOf(leftTeam), ratingOf(rightTeam)),
            right: ratingRollEdge(ratingOf(rightTeam), ratingOf(leftTeam)),
        },
        upsetUnderdogSide: null,
        upsetValue: {
            left: Number(seededStats?.left?.upsetPedigree) || 0,
            right: Number(seededStats?.right?.upsetPedigree) || 0,
        },
        upset: null,
        active: baseActive,
    };

    const setsToWin = calcSetsToWin(bestOf);
    const baseSeeded = {
        left: { ...DEFAULT_TEAM_STAT_VALUES, ...(seededStats?.left ?? {}), momentum: 0 },
        right: { ...DEFAULT_TEAM_STAT_VALUES, ...(seededStats?.right ?? {}), momentum: 0 },
    };
    const matchup =
        setsToWin >= 1
            ? resolveUpsetMatchup(
                predictLeftSeriesWin({ seeded: baseSeeded, matchCtx: baseCtx, setsToWin })
            )
            : null;
    const upset = matchup
        ? {
            ...matchup,
            bonusCap: matchup.active
                ? upsetBonusCapAtStart({
                    seeded: baseSeeded,
                    matchCtx: baseCtx,
                    setsToWin,
                    underdogSide: matchup.underdogSide,
                })
                : 0,
        }
        : null;

    return {
        ...baseCtx,
        upsetUnderdogSide: upset?.underdogSide ?? null,
        upset,
        active: activationFor(upset),
    };
};

export const getPreMatchStatActivation = ({
    modalContext,
    bestOf,
    leftTeam,
    rightTeam,
    leftStats,
    rightStats,
    ratings,
    teams,
}) => {
    if (!modalContext || !leftTeam || !rightTeam) return null;
    const isSwiss = modalContext.type === "swiss";

    return buildMatchStatContext({
        kind: statKindOfContext(modalContext),
        net: isSwiss ? modalContext.net ?? null : null,
        swissStageKey: isSwiss ? modalContext.stageKey ?? null : null,
        playoffsStage: isSwiss ? null : modalContext.stage ?? null,
        bestOf,
        leftTeam,
        rightTeam,
        seededStats: {
            left: { ...DEFAULT_TEAM_STAT_VALUES, ...(leftStats ?? {}) },
            right: { ...DEFAULT_TEAM_STAT_VALUES, ...(rightStats ?? {}) },
        },
        ratings,
        teams,
    }).active;
};

export const resolveSeriesEndStats = ({ liveStats, winnerSide, ctx, winnerSets, loserSets }) => {
    let stats = normalizeLiveStats(liveStats);
    if (!ctx) return stats;

    const loserSide = otherSide(winnerSide);

    if (ctx.elimNerveActive) {
        const severity = seriesSeverity(winnerSets, loserSets);
        stats = bumpStat(stats, winnerSide, "elimNerve", 3 * severity);
        stats = bumpStat(stats, loserSide, "elimNerve", -3 * severity);
    }

    const setsPlayed = Math.max(1, (Number(winnerSets) || 0) + (Number(loserSets) || 0));

    for (const side of ["left", "right"]) {
        const won = side === winnerSide;

        const difficulty = ctx.battle?.[side]?.difficulty;
        if (Number.isFinite(difficulty)) {
            const experience =
                (readBattleXp(stats[side]) ?? 0) + battleXpGain(setsPlayed, difficulty);
            stats = bumpStat(
                stats,
                side,
                "battleTested",
                battleTestedDelta({ won, difficulty, experience })
            );
            stats = {
                ...stats,
                [side]: { ...stats[side], battleXp: Math.round(experience * 100) / 100 },
            };
        }

        const rank = ctx.topSeedRank?.[side];
        if (Number.isFinite(rank) && rank >= 1 && rank <= 10) {
            const k = rank === 1 ? 1 : 0.5;
            stats = bumpStat(stats, side, "topSeed", won ? k : -3 * k);
        }

        const breaker = ctx.unbeatenBreaker?.[side];
        if (breaker?.active) {
            const streak = Math.max(1, breaker.streak ?? 1);
            stats = bumpStat(
                stats,
                side,
                "unbeatenStreakBreaker",
                won ? unbeatenBreakerWinGain(streak) : -unbeatenBreakerLossAmount(streak)
            );
        }
    }

    if (!ctx.unbeatenExempt) {
        for (const side of ["left", "right"]) {
            const u = ctx.unbeaten?.[side];
            if (!u) continue;

            const won = side === winnerSide;
            const streak = Math.max(0, Math.floor(Number(stats[side].unbeatenStreak) || 0));

            if (won) {
                if (u.active) {
                    const gain = ctx.kind === "playoffs" ? 3 + (ctx.unbeatenRoundIndex ?? 0) : 1;
                    stats = bumpStat(stats, side, "unbeatenNerve", gain);
                }
                if (u.eligible) {
                    stats = {
                        ...stats,
                        [side]: {
                            ...stats[side],
                            unbeatenStreak: Math.min(UNBEATEN_STREAK_DEFINITION.max, streak + 1),
                        },
                    };
                }
            } else {
                if (u.active) {
                    stats = bumpStat(stats, side, "unbeatenNerve", ctx.kind === "playoffs" ? -5 : -3);
                }
                stats = { ...stats, [side]: { ...stats[side], unbeatenStreak: 0 } };
            }
        }
    }

    return stats;
};

export const resolveSeriesTieStats = ({ liveStats, ctx }) => {
    let stats = normalizeLiveStats(liveStats);
    if (!ctx) return stats;

    for (const side of ["left", "right"]) {
        const difficulty = ctx.battle?.[side]?.difficulty;
        if (Number.isFinite(difficulty)) {
            const experience = (readBattleXp(stats[side]) ?? 0) + battleXpGain(1, difficulty);
            const delta =
                (battleTestedDelta({ won: true, difficulty, experience }) +
                    battleTestedDelta({ won: false, difficulty, experience })) / 2;
            stats = bumpStat(stats, side, "battleTested", delta);
            stats = {
                ...stats,
                [side]: { ...stats[side], battleXp: Math.round(experience * 100) / 100 },
            };
        }

        const rank = ctx.topSeedRank?.[side];
        if (Number.isFinite(rank) && rank >= 1 && rank <= 10) {
            const k = rank === 1 ? 1 : 0.5;
            stats = bumpStat(stats, side, "topSeed", -k);
        }

        const breaker = ctx.unbeatenBreaker?.[side];
        if (breaker?.active) {
            const streak = Math.max(1, breaker.streak ?? 1);
            stats = bumpStat(
                stats,
                side,
                "unbeatenStreakBreaker",
                (unbeatenBreakerWinGain(streak) - unbeatenBreakerLossAmount(streak)) / 2
            );
        }
    }

    return stats;
};

export const getMatchWinPrediction = ({
    leftTeam,
    rightTeam,
    leftStats,
    rightStats,
    ratings,
    teams,
    matchContext,
    bestOf,
}) => {
    const seeded = {
        left: { ...DEFAULT_TEAM_STAT_VALUES, ...(leftStats ?? {}), momentum: 0 },
        right: { ...DEFAULT_TEAM_STAT_VALUES, ...(rightStats ?? {}), momentum: 0 },
    };

    const isSwiss = matchContext?.type === "swiss";
    const matchCtx = buildMatchStatContext({
        kind: statKindOfContext(matchContext),
        net: isSwiss ? matchContext?.net ?? null : null,
        swissStageKey: isSwiss ? matchContext?.stageKey ?? null : null,
        playoffsStage: isSwiss ? null : matchContext?.stage ?? null,
        bestOf,
        leftTeam,
        rightTeam,
        seededStats: seeded,
        ratings,
        teams,
    });

    const setsToWin = calcSetsToWin(bestOf);

    return {
        leftWinProbability: predictLeftSeriesWin({ seeded, matchCtx, setsToWin }),
        upset: matchCtx.upset,
    };
};

export const resolveSetConclusion = ({
    liveStats,
    setWinnerSide,
    enteringLeftSets,
    enteringRightSets,
    setsToWin,
    upset = null,
    setComebackTracker = null,
}) => {
    let stats = normalizeLiveStats(liveStats);
    const setLoserSide = otherSide(setWinnerSide);
    let nextSetComebackTracker = setComebackTracker ?? null;

    if (setsToWin > 1) {
        const leftSets = enteringLeftSets + (setWinnerSide === "left" ? 1 : 0);
        const rightSets = enteringRightSets + (setWinnerSide === "right" ? 1 : 0);
        const seriesWinner =
            leftSets >= setsToWin ? "left" : rightSets >= setsToWin ? "right" : null;

        if (seriesWinner) {
            stats = settleComebacks(
                stats,
                setComebackTracker,
                { [seriesWinner]: "won", [otherSide(seriesWinner)]: "lost" },
                setAmountOf(setsToWin),
                COMEBACK.set.failClutchShare
            );
            stats = applyFinisherResult(stats, {
                seriesWinner,
                setsToWin,
                winnerTrailed: !!setComebackTracker?.[seriesWinner]?.hit,
                loserSets: seriesWinner === "left" ? rightSets : leftSets,
            });
            nextSetComebackTracker = null;
        } else {
            nextSetComebackTracker = stepComebackTracker(
                setComebackTracker,
                leftSets,
                rightSets,
                SET_COMEBACK_RULE
            );
        }
    }

    if (upset?.active && upset.underdogSide && setWinnerSide === upset.underdogSide) {
        const { underdogGain, favoriteLoss } = upsetPedigreeSetDeltas(upset.gapPct);
        stats = bumpStat(stats, upset.underdogSide, "upsetPedigree", underdogGain);
        stats = bumpStat(stats, otherSide(upset.underdogSide), "upsetPedigree", -favoriteLoss);
    }

    return {
        liveStats: {
            ...stats,
            left: { ...stats.left, momentum: 0 },
            right: { ...stats.right, momentum: 0 },
        },
        bounceBackArmedSide: setLoserSide,
        setComebackTracker: nextSetComebackTracker,
    };
};
