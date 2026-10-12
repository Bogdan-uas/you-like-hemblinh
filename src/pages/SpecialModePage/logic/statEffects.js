import { expectedScore } from "./ratings.js";
import { DEFAULT_TEAM_STAT_VALUES, clampStat } from "./teamStats.js";

const ROLL_GAP_CAP = 0.2;

export const splitRollEdge = (leftBonus, rightBonus) => {
    const gap = Math.max(-ROLL_GAP_CAP, Math.min(ROLL_GAP_CAP, (leftBonus || 0) - (rightBonus || 0)));
    return { left: gap / 2, right: -gap / 2 };
};

const clutchRollEffect = (value) => ((value - 50) / 50) * 0.08;

const composureRollEffect = (value, leading) =>
    leading ? ((value - 50) / 50) * 0.06 : 0;

const bigStageRollEffect = (value, active) => {
    if (!active) return 0;
    return (value / 100) * 0.08;
};

const momentumRollEffect = (streak) => {
    if (!streak || streak < 5) return 0;
    return Math.min((streak - 4) * 0.0125, 0.1);
};

const otStaminaRollEffect = (value, { active, depth }) => {
    if (!active || !depth) return 0;
    const raw = ((value - 50) / 50) * 0.015 * depth;
    return Math.max(-0.06, Math.min(0.06, raw));
};

const upsetPedigreeRollEffect = (value, active, cap) => {
    if (!active) return 0;
    const raw = (value / 100) * UPSET_PEDIGREE_EFFECT_SCALE;
    return Number.isFinite(cap) ? Math.min(raw, Math.max(0, cap)) : raw;
};

const bounceBackRollEffect = (value, active) => {
    if (!active) return 0;
    return ((value - 50) / 50) * 0.05;
};

const antiTiltRollEffect = (value, active) => {
    if (!active) return 0;
    return ((value - 50) / 50) * 0.03;
};

const finisherRollEffect = (value, active) => {
    if (!active) return 0;
    return ((value - 50) / 50) * 0.04;
};

const elimNerveRollEffect = (value, active) => {
    if (!active) return 0;
    return ((value - 50) / 50) * 0.07;
};

const unbeatenNerveRollEffect = (value, active) => {
    if (!active) return 0;
    return ((value - 50) / 50) * 0.05;
};

const battleTestedRollEffect = (value) => (value / 100) * 0.05;

const topSeedRollEffect = (value, active) => {
    if (!active) return 0;
    return ((value - 50) / 50) * 0.04;
};

const streakBreakerRollEffect = (value, active) => {
    if (!active) return 0;
    return ((value - 50) / 50) * 0.05;
};

const unbeatenStreakBreakerRollEffect = (value, active) => {
    if (!active) return 0;
    return ((value - 50) / 50) * 0.05;
};

const UNBEATEN_BREAKER_STREAK_CAP = 14;

export const unbeatenBreakerLossAmount = (streak) => {
    const s = Math.min(UNBEATEN_BREAKER_STREAK_CAP, Math.max(1, Math.floor(streak)));
    return 1 + 4 * ((s - 1) / (UNBEATEN_BREAKER_STREAK_CAP - 1));
};

export const unbeatenBreakerWinGain = (streak) =>
    Math.round(unbeatenBreakerLossAmount(streak) * 1.5 * 100) / 100;

const RATING_EDGE_SCALE = 0.15;

export const ratingRollEdge = (ownRating, oppRating) => {
    const own = Number(ownRating);
    const opp = Number(oppRating);
    if (!Number.isFinite(own) || !Number.isFinite(opp)) return 0;
    return Math.round((expectedScore(own, opp) - 0.5) * RATING_EDGE_SCALE * 10000) / 10000;
};

export const computeRollBonus = (side, rawRoll, ctx) => {
    const stat = { ...DEFAULT_TEAM_STAT_VALUES, ...(ctx.liveStats?.[side] ?? {}) };
    const matchCtx = ctx.matchCtx;
    const active = matchCtx?.active?.[side] ?? {};
    const foe = otherSide(side);

    let bonus = 0;
    bonus += clutchRollEffect(stat.clutch);
    bonus += composureRollEffect(stat.composure, ctx.leadSide === side);
    bonus += bigStageRollEffect(stat.bigStage, !!active.bigStage);
    bonus += momentumRollEffect(stat.momentum);
    bonus += otStaminaRollEffect(stat.otStamina, ctx.otContext);
    bonus += upsetPedigreeRollEffect(
        matchCtx?.upsetValue?.[side] ?? stat.upsetPedigree,
        !!active.upsetPedigree && matchCtx?.upsetUnderdogSide === side,
        matchCtx?.upset?.bonusCap
    );
    bonus += bounceBackRollEffect(stat.bounceBack, ctx.bounceBackArmedSide === side);
    bonus += antiTiltRollEffect(stat.antiTilt, ctx.lastRoundLoserSide === side);

    bonus += finisherRollEffect(stat.finisher, ctx.finisherActive);
    bonus += elimNerveRollEffect(stat.elimNerve, !!active.elimNerve);
    bonus += unbeatenNerveRollEffect(stat.unbeatenNerve, !!active.unbeatenNerve);
    bonus += battleTestedRollEffect(stat.battleTested);
    bonus += topSeedRollEffect(stat.topSeed, !!active.topSeed);
    bonus += streakBreakerRollEffect(
        stat.streakBreaker,
        (ctx.liveStats?.[foe]?.momentum ?? 0) >= 5
    );
    bonus += matchCtx?.ratingEdge?.[side] ?? 0;
    bonus += unbeatenStreakBreakerRollEffect(
        stat.unbeatenStreakBreaker,
        !!active.unbeatenStreakBreaker
    );

    return bonus;
};

const upsetGapScale = (gapPct) =>
    Math.max(
        0,
        Math.min(
            1,
            (gapPct - UPSET_GAP_THRESHOLD_PCT) / (UPSET_GAP_FULL_PCT - UPSET_GAP_THRESHOLD_PCT)
        )
    );

export const upsetPedigreeSetDeltas = (gapPct) => {
    const t = upsetGapScale(gapPct);
    return {
        underdogGain: Math.round((1 + 4 * t) * 10) / 10,
        favoriteLoss: Math.round((1 + 2 * t) * 10) / 10,
    };
};

export const resolveUpsetMatchup = (leftWinProbability) => {
    if (!Number.isFinite(leftWinProbability)) return null;

    const leftPct = toDisplayedPercent(leftWinProbability);
    const rightPct = Math.round((100 - leftPct) * 10) / 10;
    const gapPct = Math.round(Math.abs(leftPct - rightPct) * 10) / 10;
    const active = gapPct >= UPSET_GAP_THRESHOLD_PCT;
    const underdogSide = active ? (leftPct < rightPct ? "left" : "right") : null;

    return {
        leftPct,
        rightPct,
        gapPct,
        active,
        underdogSide,
        favoriteSide: underdogSide ? otherSide(underdogSide) : null,
    };
};

export const buildStoredUpsetMeta = (upset, leftTeam, rightTeam) => {
    if (!upset) return null;
    const idOf = (side) => (side === "left" ? leftTeam?.id : side === "right" ? rightTeam?.id : null);
    return {
        active: !!upset.active,
        gapPct: upset.gapPct,
        underdogTeamId: idOf(upset.underdogSide) ?? null,
        winPct: {
            ...(leftTeam?.id ? { [leftTeam.id]: upset.leftPct } : {}),
            ...(rightTeam?.id ? { [rightTeam.id]: upset.rightPct } : {}),
        },
    };
};

export const otherSide = (side) => (side === "left" ? "right" : "left");

export const COMEBACK = {
    mini: {
        max: 0.3,
        minShare: 0.6,
        failClutchShare: 0.2,
    },
    round: {
        max: 0.5,
        minDeficit: 5,
        pointDeficit: 3,
        otBase: 0.6,
        otStep: 0.25,
        failClutchShare: 0.25,
    },
    set: {
        max: 1.5,
        boStep: 0.25,
        gapStep: 0.75,
        failClutchShare: 0.5,
    },
    closeCallFloor: 0.1,
    closeCallPower: 2,
};

export const clampShare = (n) => Math.max(0, Math.min(1, n));

export const stepComebackTracker = (tracker, leftScore, rightScore, rule) => {
    const next = {};
    for (const side of ["left", "right"]) {
        const prev = tracker?.[side] ?? { hit: false, peak: 0, low: 0 };
        const mine = side === "left" ? leftScore : rightScore;
        const theirs = side === "left" ? rightScore : leftScore;
        const deficit = theirs - mine;
        const qualifies =
            deficit >= rule.minDeficit ||
            (rule.pointScore != null &&
                theirs >= rule.pointScore &&
                deficit >= rule.pointDeficit);

        let { hit, peak, low } = prev;
        if (!hit) {
            if (qualifies) {
                hit = true;
                peak = deficit;
                low = deficit;
            }
        } else if (deficit > peak) {
            peak = deficit;
            low = deficit;
        } else if (deficit < low) {
            low = deficit;
        }
        next[side] = { hit, peak, low };
    }
    return next;
};

const miniMinDeficit = (target) =>
    Math.max(2, Math.ceil(target * COMEBACK.mini.minShare));

const miniAmountOf = (target) => (peak) => {
    const lo = miniMinDeficit(target);
    const hi = Math.max(lo, target - 1);
    return COMEBACK.mini.max * clampShare((peak - lo + 1) / (hi - lo + 1));
};

const roundRule = (target) => ({
    minDeficit: COMEBACK.round.minDeficit,
    pointScore: target - 1,
    pointDeficit: COMEBACK.round.pointDeficit,
});

const roundAmountOf = ({ target, inOvertime, overtimeBlock }) => (peak) => {
    if (inOvertime) {
        const depth =
            1 + COMEBACK.round.otStep * Math.max(0, (overtimeBlock || 1) - 1);
        return COMEBACK.round.max * COMEBACK.round.otBase * depth;
    }
    const floor = COMEBACK.round.pointDeficit;
    const maxDeficit = target - 1;
    const size =
        maxDeficit <= floor
            ? 1
            : clampShare(0.3 + (0.7 * (peak - floor)) / (maxDeficit - floor));
    return COMEBACK.round.max * size;
};

export const SET_COMEBACK_RULE = { minDeficit: 1 };

export const setAmountOf = (setsToWin) => (peak) =>
    COMEBACK.set.max *
    (1 + COMEBACK.set.boStep * Math.max(0, setsToWin - 2)) *
    (1 + COMEBACK.set.gapStep * Math.max(0, peak - 1));

export const computeClutchRoundFlag = (
    prevTracker,
    miniLeftScore,
    miniRightScore,
    roundTarget = Infinity
) => {
    if (miniLeftScore >= roundTarget || miniRightScore >= roundTarget) {
        return prevTracker ?? null;
    }
    return stepComebackTracker(prevTracker, miniLeftScore, miniRightScore, {
        minDeficit: miniMinDeficit(roundTarget),
    });
};

export const normalizeLiveStats = (liveStats) => ({
    left: { ...DEFAULT_TEAM_STAT_VALUES, ...(liveStats?.left ?? {}) },
    right: { ...DEFAULT_TEAM_STAT_VALUES, ...(liveStats?.right ?? {}) },
});

export const bumpStat = (liveStats, side, key, delta, min = 0, max = 100) => {
    const base = liveStats?.[side] ?? DEFAULT_TEAM_STAT_VALUES;
    const raw = (base[key] ?? DEFAULT_TEAM_STAT_VALUES[key]) + delta;
    return {
        ...liveStats,
        [side]: {
            ...base,
            [key]: Math.round(clampStat(raw, min, max) * 100) / 100,
        },
    };
};

export const settleComebacks = (liveStats, tracker, outcomes, amountOf, failClutchShare) => {
    let stats = liveStats;
    for (const side of ["left", "right"]) {
        const episode = tracker?.[side];
        if (!episode?.hit || !(episode.peak > 0)) continue;

        const foe = otherSide(side);
        const amount = amountOf(episode.peak);

        if (outcomes[side] !== "lost") {
            stats = bumpStat(stats, side, "clutch", amount);
            stats = bumpStat(stats, foe, "composure", -amount);
        } else {
            const pulledBack = clampShare(
                (episode.peak - Math.max(0, episode.low)) / episode.peak
            );
            const tightness =
                COMEBACK.closeCallFloor +
                (1 - COMEBACK.closeCallFloor) *
                    Math.pow(1 - pulledBack, COMEBACK.closeCallPower);
            stats = bumpStat(stats, foe, "composure", amount * tightness * failClutchShare);
            stats = bumpStat(stats, side, "clutch", -amount * tightness * failClutchShare);
        }
    }
    return stats;
};

export const resolveRoundConclusion = ({
    liveStats,
    winnerSide,
    clutchRoundFlag,
    lastRoundLoserSide,
    bounceBackArmedSide,
    isFirstRoundOfSet,
    miniTarget = 5,
    roundComebackTracker = null,
    setContest = null,
}) => {
    let stats = normalizeLiveStats(liveStats);
    const loserSide = otherSide(winnerSide);

    const prevWinnerStreak = stats?.[winnerSide]?.momentum ?? 0;
    const prevLoserStreak = stats?.[loserSide]?.momentum ?? 0;
    const nextWinnerStreak = prevWinnerStreak + 1;
    stats = {
        ...stats,
        [winnerSide]: { ...stats[winnerSide], momentum: nextWinnerStreak },
        [loserSide]: { ...stats[loserSide], momentum: 0 },
    };

    if (prevLoserStreak >= 5) {
        stats = bumpStat(stats, winnerSide, "streakBreaker", 1.5);
    }
    if (prevWinnerStreak >= 5) {
        stats = bumpStat(stats, loserSide, "streakBreaker", -1.5);
    }

    stats = settleComebacks(
        stats,
        clutchRoundFlag,
        { [winnerSide]: "won", [loserSide]: "lost" },
        miniAmountOf(miniTarget),
        COMEBACK.mini.failClutchShare
    );

    let nextRoundComebackTracker = roundComebackTracker ?? null;
    if (setContest) {
        const { left, right, target, inOvertime = false, overtimeBlock = 0 } = setContest;
        
        if (left >= target || right >= target) {
            const decidedBy = left >= target ? "left" : "right";

            stats = settleComebacks(
                stats,
                roundComebackTracker,
                { [decidedBy]: "won", [otherSide(decidedBy)]: "lost" },
                roundAmountOf({ target, inOvertime, overtimeBlock }),
                COMEBACK.round.failClutchShare
            );

            nextRoundComebackTracker = null;
        } else {
            nextRoundComebackTracker = stepComebackTracker(
                roundComebackTracker,
                left,
                right,
                roundRule(target)
            );
        }
    }

    if (lastRoundLoserSide) {
        stats = bumpStat(
            stats,
            lastRoundLoserSide,
            "antiTilt",
            winnerSide === lastRoundLoserSide ? 0.25 : -0.25
        );
    }

    if (isFirstRoundOfSet && bounceBackArmedSide) {
        stats = bumpStat(
            stats,
            bounceBackArmedSide,
            "bounceBack",
            winnerSide === bounceBackArmedSide ? 1.5 : -1.5
        );
    }

    return {
        liveStats: stats,
        nextLastRoundLoserSide: loserSide,
        nextBounceBackArmedSide: isFirstRoundOfSet ? null : bounceBackArmedSide,
        momentumSide: winnerSide,
        momentumValue: nextWinnerStreak,
        roundComebackTracker: nextRoundComebackTracker,
    };
};

export const applyOtStaminaRoundResult = (liveStats, winnerSide) => {
    const loserSide = otherSide(winnerSide);
    let stats = bumpStat(normalizeLiveStats(liveStats), winnerSide, "otStamina", 1);
    stats = bumpStat(stats, loserSide, "otStamina", -1);
    return stats;
};

export const applyOtStaminaPenaltyAttempt = (liveStats, attackerSide, attackerSucceeded) =>
    bumpStat(normalizeLiveStats(liveStats), attackerSide, "otStamina", attackerSucceeded ? 1 : -1);

const UPSET_GAP_THRESHOLD_PCT = 12;
const UPSET_GAP_FULL_PCT = 80;
const UPSET_PEDIGREE_EFFECT_SCALE = 0.05;

export const toDisplayedPercent = (probability) =>
    Math.round(Math.min(99.9, Math.max(0.1, probability * 100)) * 10) / 10;
