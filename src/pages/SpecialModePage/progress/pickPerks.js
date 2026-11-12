import { insurancePayout, pickedBonusesOf } from "./progressConfig.js";
import { comebackSizeOf } from "../logic/comebacks.js";

const BONUS_KEYS = ["gfBonus", "upsetBonus", "longShotBonus", "streakBonus"];

export const bonusConditionMet = (type, { bestOf = 1, setsWon = [], setScores = [], ready = false }) => {
    if (type === "comebackBonus") return comebackSizeOf(bestOf, setsWon) > 0;
    if (type === "sweepBonus") return bestOf >= 3 && setsWon.length > 0 && setsWon.every(Boolean);
    if (type === "overtimeBonus") return setScores.some((score) => Math.max(score.left ?? 0, score.right ?? 0) >= 16);
    if (type === "deciderBonus") return bestOf >= 3 && setsWon.length >= bestOf;
    return !!ready;
};

export const bonusPayout = (type, value, context) => {
    if (!bonusConditionMet(type, context)) return 0;
    if (type === "comebackBonus") return Math.min(value || 0, comebackSizeOf(context.bestOf, context.setsWon));
    return value || 0;
};

const resolveChosenBonus = ({ correct, bestOf, base, setsWon, setScores, perks }) => {
    const uses = [];
    const missed = [];
    let points = base;
    const chosen = pickedBonusesOf(perks);
    if (correct) {
        let left = perks.bonusLeft ?? 0;
        chosen.forEach((bonus) => {
            const context = { bestOf, setsWon, setScores, ready: bonus.ready };
            const met = bonusConditionMet(bonus.type, context);
            const amount = Math.min(bonusPayout(bonus.type, bonus.value, context), left);
            if (amount > 0) {
                points += amount;
                left -= amount;
                uses.push({ type: bonus.type, points: amount });
            } else {
                missed.push({ type: bonus.type, reason: met ? "cap" : "condition" });
            }
        });
        return { points, uses, missed, insurance: perks.insured ? "used" : null, payout: 0 };
    }
    chosen.forEach((bonus) => missed.push({ type: bonus.type, reason: "lost" }));
    if (!perks.insured) return { points, uses, missed, insurance: null, payout: 0 };
    const payout = insurancePayout(bestOf, base, perks.insurePct);
    if (payout <= 0) return { points, uses, missed, insurance: "returned", payout: 0 };
    uses.push({ type: "insurance", points: payout });
    return { points: points + payout, uses, missed, insurance: "paid", payout };
};

export const resolvePickPerks = ({ correct, bestOf, base, setsWon = [], setScores = [], perks }) => {
    const uses = [];
    let points = base;
    if (!perks) return { points, uses, missed: [], insurance: null, payout: 0 };
    if (perks.bonusMode === "pick") return resolveChosenBonus({ correct, bestOf, base, setsWon, setScores, perks });
    if (correct) {
        const earned = [];
        const add = (type, value) => {
            if (value) earned.push({ type, points: value });
        };
        BONUS_KEYS.forEach((key) => add(key, perks[key]));
        add("comebackBonus", bonusPayout("comebackBonus", perks.comebackBonus, { bestOf, setsWon }));
        if (bestOf >= 3 && setsWon.length > 0 && setsWon.every(Boolean)) add("sweepBonus", perks.sweepBonus);
        if (setScores.some((score) => Math.max(score.left ?? 0, score.right ?? 0) >= 16)) add("overtimeBonus", perks.overtimeBonus);
        if (bestOf >= 3 && setsWon.length >= bestOf) add("deciderBonus", perks.deciderBonus);
        add("knockoutBonus", perks.knockoutBonus);
        if (bestOf >= 5) add("longSeriesBonus", perks.longSeriesBonus);
        const kept = perks.bonusCap
            ? earned.reduce((best, use) => (!best || use.points > best.points ? use : best), null)
            : null;
        const granted = perks.bonusCap
            ? kept && Math.min(kept.points, perks.bonusLeft ?? 0) > 0
                ? [{ type: kept.type, points: Math.min(kept.points, perks.bonusLeft ?? 0) }]
                : []
            : earned;
        granted.forEach((use) => {
            points += use.points;
            uses.push(use);
        });
        return { points, uses, missed: [], insurance: perks.insured ? "used" : null, payout: 0 };
    }
    if (!perks.insured) return { points, uses, missed: [], insurance: null, payout: 0 };
    const payout = insurancePayout(bestOf, base, perks.insurePct);
    if (payout <= 0) return { points, uses, missed: [], insurance: "returned", payout: 0 };
    uses.push({ type: "insurance", points: payout });
    return { points: points + payout, uses, missed: [], insurance: "paid", payout };
};

const breakdowns = new WeakMap();

export const applyPickPerks = (match, points, fullPoints) => {
    const perks = match?.perks;
    if (!perks || !match.played || !match.pickTeamId) return points;
    const correct = match.winnerTeamId === match.pickTeamId && !match.isTie;
    const history = match.setHistory || [];
    const setsWon = history.map((entry) => !!entry.won);
    const setScores = history.map((entry) => ({ left: entry.wins ?? 0, right: entry.losses ?? 0 }));
    const resolved = resolvePickPerks({ correct, bestOf: fullPoints, base: points, setsWon, setScores, perks });
    const before = perks.streakBefore || 0;
    const streak = perks.bonusMode === "pick"
        ? { before, after: correct ? before + 1 : before > 0 && perks.shieldReady ? before : 0, shielded: !correct && before > 0 && !!perks.shieldReady }
        : null;
    breakdowns.set(match, { base: points, uses: resolved.uses, missed: resolved.missed, insurance: resolved.insurance, streak });
    return resolved.points;
};

export const pickPerkBreakdown = (match) => (match && typeof match === "object" ? breakdowns.get(match) ?? null : null);

export const pickBonusesOf = (breakdown) =>
    breakdown
        ? [
            ...breakdown.uses,
            ...(breakdown.insurance === "returned" ? [{ type: "insuranceReturned", points: 0 }] : []),
            ...(breakdown.insurance === "used" ? [{ type: "insuranceUnused", points: 0 }] : []),
            ...(breakdown.missed || []).map((miss) => ({ type: "bonusMissed", bonus: miss.type, reason: miss.reason, points: 0 })),
        ]
        : [];
