import { insurancePayout } from "./progressConfig.js";

const BONUS_KEYS = ["gfBonus", "upsetBonus", "longShotBonus", "streakBonus"];

export const resolvePickPerks = ({ correct, bestOf, base, setsWon = [], setScores = [], perks }) => {
    const uses = [];
    let points = base;
    if (!perks) return { points, uses, insurance: null, payout: 0 };
    if (correct) {
        const add = (type, value) => {
            if (!value) return;
            points += value;
            uses.push({ type, points: value });
        };
        BONUS_KEYS.forEach((key) => add(key, perks[key]));
        if (bestOf >= 3 && setsWon[0] === false) add("comebackBonus", perks.comebackBonus);
        if (bestOf >= 3 && setsWon.length > 0 && setsWon.every(Boolean)) add("sweepBonus", perks.sweepBonus);
        if (setScores.some((score) => Math.max(score.left ?? 0, score.right ?? 0) >= 16)) add("overtimeBonus", perks.overtimeBonus);
        if (bestOf >= 3 && setsWon.length >= bestOf) add("deciderBonus", perks.deciderBonus);
        add("knockoutBonus", perks.knockoutBonus);
        if (bestOf >= 5) add("longSeriesBonus", perks.longSeriesBonus);
        return { points, uses, insurance: perks.insured ? "used" : null, payout: 0 };
    }
    if (!perks.insured) return { points, uses, insurance: null, payout: 0 };
    const payout = insurancePayout(bestOf, base, perks.insurePct);
    if (payout <= 0) return { points, uses, insurance: "returned", payout: 0 };
    uses.push({ type: "insurance", points: payout });
    return { points: points + payout, uses, insurance: "paid", payout };
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
    breakdowns.set(match, { base: points, uses: resolved.uses, insurance: resolved.insurance });
    return resolved.points;
};

export const pickPerkBreakdown = (match) => (match && typeof match === "object" ? breakdowns.get(match) ?? null : null);

export const pickBonusesOf = (breakdown) =>
    breakdown ? [...breakdown.uses, ...(breakdown.insurance === "returned" ? [{ type: "insuranceReturned", points: 0 }] : [])] : [];
