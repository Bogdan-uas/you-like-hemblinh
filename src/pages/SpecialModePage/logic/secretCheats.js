import { SECRET_PANEL_LS_KEY } from "./storageKeys.js";

export const CHEAT_STRENGTHS = [
    { value: "nudge", label: "Nudge", hint: "~60%", force: 0.25 },
    { value: "strong", label: "Strong", hint: "~75%", force: 0.5 },
    { value: "total", label: "Total", hint: "100%", force: 1 },
];

export const CHEAT_SCOPES = [
    { value: "round", label: "Next round" },
    { value: "set", label: "Rest of set" },
    { value: "series", label: "Whole series" },
];

export const CHEAT_SCRIPTS = [
    { value: "overtime", label: "Force Overtime", icon: "⚔️" },
    { value: "extended", label: "Force Extended Rounds", icon: "📊" },
    { value: "penalties", label: "Force Penalties", icon: "🥅" },
    { value: "score", label: "Set score", icon: "🎯" },
];

export const TIE_SCORE = "tie";

export const SET_WINNER_SCORES = [13, 16, 19, 22, 25];

export const getLoserScoreOptions = (winnerRounds) =>
    winnerRounds === 13 ? Array.from({ length: 12 }, (_, i) => i) : [winnerRounds - 4, winnerRounds - 3, winnerRounds - 2];

export const clampLoserRounds = (winnerRounds, loserRounds) => {
    const options = getLoserScoreOptions(winnerRounds);
    return options.includes(loserRounds) ? loserRounds : options[options.length - 1];
};

export const DEFAULT_CHEAT_DRAFT = { strength: "strong", scope: "set", winnerRounds: 13, loserRounds: 11, scoreSide: "left" };

export const normalizeCheatDraft = (draft) => {
    const merged = { ...DEFAULT_CHEAT_DRAFT, ...draft };
    const winnerRounds = SET_WINNER_SCORES.includes(merged.winnerRounds) ? merged.winnerRounds : DEFAULT_CHEAT_DRAFT.winnerRounds;
    return { ...merged, winnerRounds, loserRounds: clampLoserRounds(winnerRounds, merged.loserRounds) };
};

export const loadCheatDraft = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(SECRET_PANEL_LS_KEY) || "null");
        return normalizeCheatDraft(saved && typeof saved === "object" ? saved : DEFAULT_CHEAT_DRAFT);
    } catch {
        return DEFAULT_CHEAT_DRAFT;
    }
};

export const saveCheatDraft = (draft) => {
    try {
        localStorage.setItem(SECRET_PANEL_LS_KEY, JSON.stringify(draft));
    } catch {
        console.error("Couldn't save the Secret panel");
    }
};

const OTHER = { left: "right", right: "left" };

const roundsPlayed = (s) => (s.roundWins ?? 0) + (s.roundLosses ?? 0);

export const buildCheatAnchor = (s) => ({
    setNumber: s.setNumber ?? 1,
    rounds: roundsPlayed(s),
    seed: Math.random() * 1000,
});

const pseudoRandom = (seed, index) => {
    const x = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
};

const isExtendedRoundNow = (s) =>
    s.isOvertime ? s.roundNumber === 1 : s.roundNumber <= 1 || s.roundNumber === 13;

const extendedRoundsWon = (s) => {
    const er = s.extendedRounds ?? {};
    const winners = [er.firstHalf, er.secondHalf, ...(er.overtimes ?? []).map((ot) => ot.winner)];
    return {
        left: winners.filter((w) => w === "left").length,
        right: winners.filter((w) => w === "right").length,
    };
};

const tiedSide = (cheat, s) => (pseudoRandom(cheat.anchor.seed, roundsPlayed(s)) < 0.5 ? "left" : "right");

const keepItTied = (cheat, s, leftScore, rightScore) => {
    if (cheat.script === "penalties" && isExtendedRoundNow(s)) {
        const er = extendedRoundsWon(s);
        if (er.left !== er.right) return er.left < er.right ? "left" : "right";
    }
    if (leftScore !== rightScore) return leftScore < rightScore ? "left" : "right";
    return tiedSide(cheat, s);
};

const raceWinner = (cheat, s, side, ownScore, oppScore, ownTarget, oppTarget) => {
    const ownNeeded = ownTarget - ownScore;
    const oppNeeded = oppTarget - oppScore;
    if (oppNeeded <= 0) return side;
    if (ownNeeded <= 1) return OTHER[side];
    const share = oppNeeded / (ownNeeded + oppNeeded - 1);
    return pseudoRandom(cheat.anchor.seed, roundsPlayed(s)) < share ? OTHER[side] : side;
};

const scoreRoundWinner = (cheat, s) => {
    if (cheat.winnerRounds === TIE_SCORE) {
        return s.isOvertime ? keepItTied(cheat, s, s.otWins ?? 0, s.otLosses ?? 0) : keepItTied(cheat, s, s.roundWins ?? 0, s.roundLosses ?? 0);
    }

    const side = cheat.side;
    const finalBlock = Math.max(0, ((cheat.winnerRounds ?? 13) - 13) / 3);
    const block = s.isOvertime ? s.overtimeBlock ?? 1 : 0;

    if (block < finalBlock) {
        return s.isOvertime ? keepItTied(cheat, s, s.otWins ?? 0, s.otLosses ?? 0) : keepItTied(cheat, s, s.roundWins ?? 0, s.roundLosses ?? 0);
    }
    if (block > finalBlock) return side;

    const own = (scoreLeft, scoreRight) => (side === "left" ? scoreLeft : scoreRight);
    const opp = (scoreLeft, scoreRight) => (side === "left" ? scoreRight : scoreLeft);

    if (block === 0) {
        return raceWinner(cheat, s, side, own(s.roundWins ?? 0, s.roundLosses ?? 0), opp(s.roundWins ?? 0, s.roundLosses ?? 0), 13, cheat.loserRounds);
    }

    const loserInBlock = cheat.loserRounds - (12 + 3 * (finalBlock - 1));
    return raceWinner(cheat, s, side, own(s.otWins ?? 0, s.otLosses ?? 0), opp(s.otWins ?? 0, s.otLosses ?? 0), 4, loserInBlock);
};

const closeMiniWinner = (cheat, s, roundWinner) => {
    const need = isExtendedRoundNow(s) ? 10 : 5;
    const winnerMinis = roundWinner === "left" ? s.miniWins ?? 0 : s.miniLosses ?? 0;
    const loserMinis = roundWinner === "left" ? s.miniLosses ?? 0 : s.miniWins ?? 0;
    const r = pseudoRandom(cheat.anchor.seed + 17, roundsPlayed(s) * 3 + (s.overtimeBlock ?? 0));
    const loserTarget = Math.min(need - 1, Math.floor((1 - r * r) * need));

    const winnerNeeded = need - winnerMinis;
    const loserLeft = loserTarget - loserMinis;
    if (loserLeft > 0 && (winnerNeeded <= 1 || Math.random() < loserLeft / (winnerNeeded + loserLeft - 1))) return OTHER[roundWinner];
    return roundWinner;
};

const scriptRoundWinner = (cheat, s) => {
    if (cheat.script === "score") return scoreRoundWinner(cheat, s);
    if (s.isOvertime) return keepItTied(cheat, s, s.otWins ?? 0, s.otLosses ?? 0);
    return keepItTied(cheat, s, s.roundWins ?? 0, s.roundLosses ?? 0);
};

export const getCheatMiniWinner = (cheat, s) => {
    if (!cheat || !s?.active || s.banner) return null;
    const phase = s.tiebreakerPhase ?? "idle";

    if (cheat.script) {
        if (phase !== "idle") return null;
        return closeMiniWinner(cheat, s, scriptRoundWinner(cheat, s));
    }

    const strength = CHEAT_STRENGTHS.find((option) => option.value === cheat.strength) ?? CHEAT_STRENGTHS[1];
    return Math.random() < strength.force ? cheat.side : null;
};

export const isCheatFinished = (cheat, s) => {
    if (!cheat) return false;
    if (!s?.active || s.banner) return true;

    const phase = s.tiebreakerPhase ?? "idle";
    const setChanged = (s.setNumber ?? 1) !== cheat.anchor.setNumber;

    if (cheat.script === "overtime") return setChanged || !!s.isOvertime || phase !== "idle";
    if (cheat.script === "extended") return setChanged || phase === "extended" || phase === "penalties";
    if (cheat.script === "penalties") return setChanged || phase === "penalties";
    if (cheat.script === "score") return setChanged;

    if (cheat.scope === "round") return setChanged || roundsPlayed(s) > cheat.anchor.rounds || phase !== "idle";
    if (cheat.scope === "set") return setChanged;
    return false;
};

export const isCheatTargeting = (cheat, side) =>
    !!cheat && (cheat.side === side || (!!cheat.script && (cheat.script !== "score" || cheat.winnerRounds === TIE_SCORE)));

const labelOf = (list, value) => list.find((option) => option.value === value)?.label ?? value;

export const describeCheat = (cheat, teams) => {
    if (!cheat) return "Off";
    const teamName = cheat.side ? `Team ${teams?.[cheat.side]?.name ?? cheat.side}` : null;
    if (cheat.script === "score" && cheat.winnerRounds === TIE_SCORE) return "Tie 15-15";
    if (cheat.script === "score") return `${teamName} wins the set ${cheat.winnerRounds}-${cheat.loserRounds}`;
    if (cheat.script) return labelOf(CHEAT_SCRIPTS, cheat.script);
    return `${teamName} · ${labelOf(CHEAT_STRENGTHS, cheat.strength)} · ${labelOf(CHEAT_SCOPES, cheat.scope).toLowerCase()}`;
};

export const getMiniRoundOdds = (samplePair, samples = 2500) => {
    let left = 0;
    let right = 0;
    let edgeLeft = 0;
    let edgeRight = 0;
    for (let i = 0; i < samples; i++) {
        const pair = samplePair();
        if (pair.left > pair.right) left++;
        else if (pair.right > pair.left) right++;
        edgeLeft += pair.edgeLeft;
        edgeRight += pair.edgeRight;
    }
    const decided = left + right || 1;
    return { left: left / decided, right: right / decided, edgeLeft: edgeLeft / samples, edgeRight: edgeRight / samples };
};

export const getRoundOdds = (miniLeft, s) => {
    const need = isExtendedRoundNow(s) ? 10 : 5;
    const leftNeeded = need - (s.miniWins ?? 0);
    const rightNeeded = need - (s.miniLosses ?? 0);
    if (leftNeeded <= 0) return 1;
    if (rightNeeded <= 0) return 0;

    const memo = new Map();
    const chance = (a, b) => {
        if (a === 0) return 1;
        if (b === 0) return 0;
        const key = `${a}:${b}`;
        if (!memo.has(key)) memo.set(key, miniLeft * chance(a - 1, b) + (1 - miniLeft) * chance(a, b - 1));
        return memo.get(key);
    };
    return chance(leftNeeded, rightNeeded);
};
