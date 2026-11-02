import { useEffect, useState } from "react";
import { getBrightness } from "../../logic/colors.js";
import { getLiveSetResult, getSetResultWinner } from "../../logic/series.js";
import { BREAKDOWN_OT_NAMES } from "../../logic/breakdownStyles.js";

export const PEM_SLOT_COUNT = 5;
export const PEM_SLOT_ROWS = 2;
export const STINGER_EDGE_MS = 420;
export const STINGER_MIN_MS = 900;
export const PEM_ENTRANCE_MS = 950;

const HALF_ROUNDS = 12;
const OT_ROUNDS = 6;

export const getPemHalfIndex = (s) => {
    const played = (s.roundWins ?? 0) + (s.roundLosses ?? 0);
    if (!s.isOvertime) return played < HALF_ROUNDS ? 0 : 1;
    const block = Math.max(1, s.overtimeBlock ?? 1);
    const intoBlock = played - HALF_ROUNDS * 2 - OT_ROUNDS * (block - 1);
    return intoBlock < OT_ROUNDS / 2 ? 0 : 1;
};

export const isPemExtendedRoundNow = (s) =>
    s.tiebreakerPhase === "idle" && !s.banner && (s.isOvertime ? s.roundNumber === 1 : s.roundNumber <= 1 || s.roundNumber === 13);

export const pemTextOn = (color) => (getBrightness(color ?? "#1b33b0") > 190 ? "#0d1a5e" : "#ffffff");

export const pemOvertimeName = (block) => BREAKDOWN_OT_NAMES[block] ?? `${block}x Overtime`;

export const isFreshPemSeries = (s) =>
    !!s.active &&
    !s.banner &&
    (s.setNumber ?? 1) === 1 &&
    (s.roundWins ?? 0) + (s.roundLosses ?? 0) === 0 &&
    (s.miniWins ?? 0) + (s.miniLosses ?? 0) === 0 &&
    s.lastMultiplierLeft == null;

export const pemSetLabel = (set, total) => (set === total && total > 1 ? "Decider" : `Set ${set}`);

export const pemSetChipLabel = (set, total) => (set === total && total > 1 ? "DEC" : `S${set}`);

export const buildPemSetChips = (seriesState) => {
    const { setsToWin, setNumber, finishedSets = [], playerWonSets = 0, playerLostSets = 0, leftTeam, rightTeam, banner } = seriesState;
    const total = setsToWin * 2 - 1;
    const live = getLiveSetResult(seriesState);
    const results = live ? [...finishedSets, live] : finishedSets;
    const seriesOver = !!banner || Math.max(playerWonSets, playerLostSets) >= setsToWin;
    const decided = playerWonSets + playerLostSets;
    const certainUpTo = seriesOver ? results.length : Math.max(setNumber, decided + setsToWin - Math.max(playerWonSets, playerLostSets));

    return Array.from({ length: total }, (_, i) => i + 1).map((set) => {
        const finished = results.find((r) => r.set === set);
        const winner = finished ? getSetResultWinner(finished) : null;
        return {
            set,
            label: pemSetChipLabel(set, total),
            status: finished ? "done" : !seriesOver && !live && set === setNumber ? "current" : set <= certainUpTo ? "certain" : "uncertain",
            result: finished ? toPemChipResult(finished) : null,
            winnerTeam: winner === "left" ? leftTeam : winner === "right" ? rightTeam : null,
        };
    });
};

export const toPemChipResult = (finished) => ({
    leftScore: finished.leftScore,
    rightScore: finished.rightScore,
    extra: finished.penaltiesPlayed
        ? { label: "P", left: finished.penaltyLeftScore, right: finished.penaltyRightScore }
        : finished.extendedRoundsPlayed
            ? { label: "ER", left: finished.extendedRoundLeftScore, right: finished.extendedRoundRightScore }
            : null,
});

export const getPemPenaltyWindow = (results = [], attempts) => {
    const capacity = PEM_SLOT_COUNT * PEM_SLOT_ROWS;
    const total = Math.max(attempts ?? 0, results.length, PEM_SLOT_COUNT);
    const start = Math.max(0, total - capacity);
    return Array.from({ length: Math.min(total, capacity) }, (_, i) => ({ index: start + i, result: results[start + i] ?? null }));
};

export const useOtMorphPreview = (s, morphMs) => {
    const action = s.pendingAction;
    const [at, setAt] = useState(null);

    useEffect(() => {
        if (action?.type !== "NEXT_OT" || !action.executeAt) return undefined;
        const remaining = action.executeAt - Date.now();
        if (remaining < STINGER_MIN_MS) return undefined;
        const exec = action.executeAt;
        const timer = setTimeout(() => setAt(exec), Math.max(0, remaining - morphMs));
        return () => clearTimeout(timer);
    }, [action?.type, action?.executeAt, morphMs]);

    return action?.type === "NEXT_OT" && at === action.executeAt;
};

export const otPreviewState = (s) => ({
    ...s,
    isOvertime: true,
    overtimeBlock: (s.isOvertime ? Math.max(0, s.overtimeBlock ?? 0) : 0) + 1,
    roundNumber: 1,
    miniWins: 0,
    miniLosses: 0,
});

export const otPreviewRound = (s) => (s.roundWins ?? 0) + (s.roundLosses ?? 0) + 1;

export const getPemExtendedCue = (s) =>
    s.tiebreakerPhase === "extended" || s.pendingAction?.type === "START_EXTENDED"
        ? { key: `er-${s.setNumber ?? 1}`, text: "Extended Rounds", sub: `Still ${s.roundWins ?? 0}-${s.roundLosses ?? 0} after Quadruple Overtime` }
        : null;

export const getPemStingerCue = (s, setsToWin) => {
    const action = s.pendingAction;
    if (!action) return null;
    const total = setsToWin * 2 - 1;
    const block = s.isOvertime ? Math.max(0, s.overtimeBlock ?? 0) : 0;
    const finishedSetLine = () => {
        const winner = (s.roundWins ?? 0) >= (s.roundLosses ?? 0) ? s.leftTeam : s.rightTeam;
        return `${pemSetLabel(s.setNumber ?? 1, total)} · Team ${winner?.name} · ${s.roundWins ?? 0}-${s.roundLosses ?? 0}`;
    };

    switch (action.type) {
        case "NEXT_SET":
            return { text: pemSetLabel((s.setNumber ?? 1) + 1, total), sub: finishedSetLine() };
        case "NEXT_SET_AFTER_PENALTIES":
            return { text: pemSetLabel((s.setNumber ?? 1) + 1, total), sub: `${pemSetLabel(s.setNumber ?? 1, total)} decided on Penalties` };
        case "NEXT_OT":
            return { text: pemOvertimeName(block + 1), sub: `Tied ${s.roundWins ?? 0}-${s.roundLosses ?? 0} · First to ${16 + block * 3}` };
        default:
            return null;
    }
};

export const getErStatus = ({ rounds, revealIndex, introShown, resolved, leftScore, rightScore, leftTeam, rightTeam, setNumber, setsToWin, seriesOver }) => {
    const allRevealed = revealIndex >= rounds.length;
    const latest = rounds[revealIndex - 1];

    if (!introShown) return { key: "intro", label: "Extended Rounds", text: "Comparing every Extended Round winner..." };
    if (allRevealed && leftScore !== rightScore) {
        const winner = leftScore > rightScore ? leftTeam : rightTeam;
        return {
            key: "won",
            label: "Tiebreaker won",
            team: winner,
            text: `Team ${winner?.name} wins ${seriesOver || setsToWin === 1 ? "the match" : `Set ${setNumber}`} on Extended Rounds!`,
        };
    }
    if (resolved && allRevealed) return { key: "tied", label: "Still tied", text: "Tied again!? Penalties are coming..." };
    if (latest?.winner) {
        const winner = latest.winner === "left" ? leftTeam : rightTeam;
        return { key: latest.label, label: latest.title, team: winner, text: `Goes to Team ${winner?.name}` };
    }
    return { key: "first", label: "Extended Rounds", text: `First to ${4} Extended Rounds wins, 3:3 means Penalties` };
};

export const STREAK_MIN = 5;

export const streakTier = (value) => (value >= 10 ? 3 : value >= 7 ? 2 : value >= STREAK_MIN ? 1 : 0);
