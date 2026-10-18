export const defaultSeriesState = {
    active: false,

    phase: null,

    swissStageKey: null,
    swissNet: null,
    swissMatchId: null,

    playoffsStage: null,
    playoffsMatchId: null,

    leftTeam: null,
    rightTeam: null,

    setsToWin: 2,
    playerWonSets: 0,
    playerLostSets: 0,
    setNumber: 1,
    firstHalfLeft: null,
    firstHalfRight: null,
    finishedSets: [],

    extendedRounds: {
        firstHalf: null,
        secondHalf: null,
        overtimes: [],
    },

    lastMultiplierLeft: null,
    lastMultiplierRight: null,
    lastPenaltyAttacker: null,

    roundWins: 0,
    roundLosses: 0,
    roundNumber: 1,

    miniWins: 0,
    miniLosses: 0,
    miniLog: null,

    isOvertime: false,
    overtimeBlock: 0,
    otWins: 0,
    otLosses: 0,

    banner: "",

    tiebreakerPhase: "idle",
    extRoundLeftScore: 0,
    extRoundRightScore: 0,
    extRoundRevealIndex: 0,
    extRoundCommentaryShown: false,
    penaltyLeftResults: [],
    penaltyRightResults: [],
    penaltyLeftScore: 0,
    penaltyRightScore: 0,
    penaltyTurn: "left",
    penaltyPreScore: null,
    penaltyResolved: false,
    tiebreakerBigSymbol: null,

    swissMatchNumber: 1,
    playoffsMatchNumber: 1,

    initialStats: null,
    liveStats: null,
    matchCtx: null,
    clutchRoundFlag: null,
    roundComebackTracker: null,
    setComebackTracker: null,
    lastRoundLoserSide: null,
    bounceBackArmedSide: null,

    pendingAction: null,
};

export const round2 = (n) => Number(n.toFixed(2));

const MINI_CODE_LENGTH = 2;
const MINI_CODE_MAX = 36 ** MINI_CODE_LENGTH - 1;

const encodeMultiplier = (value) =>
    Math.max(0, Math.min(MINI_CODE_MAX, Math.round((Number(value) || 0) * 100)))
        .toString(36)
        .padStart(MINI_CODE_LENGTH, "0");

export const encodeMiniRound = (left, right) => encodeMultiplier(left) + encodeMultiplier(right);

export const decodeMiniRounds = (code) => {
    if (typeof code !== "string" || !code) return [];
    const pairLength = MINI_CODE_LENGTH * 2;
    const minis = [];
    for (let i = 0; i + pairLength <= code.length; i += pairLength) {
        const left = parseInt(code.slice(i, i + MINI_CODE_LENGTH), 36) / 100;
        const right = parseInt(code.slice(i + MINI_CODE_LENGTH, i + pairLength), 36) / 100;
        minis.push({ left, right, winner: left > right ? "left" : right > left ? "right" : null });
    }
    return minis;
};

export const buildSeriesRoundKey = ({ setNumber, isOvertime, overtimeBlock, roundWins, roundLosses }) =>
    `s${setNumber}-${isOvertime ? `ot${overtimeBlock}` : "reg"}-r${roundWins + roundLosses + 1}`;

export const buildExtendedRoundWinnerList = (extendedRounds) => {
    const overtimes = extendedRounds?.overtimes ?? [];
    const findOt = (n) => overtimes.find((o) => o.overtime === n)?.winner ?? null;
    return [
        { label: "1st Half", winner: extendedRounds?.firstHalf ?? null },
        { label: "2nd Half", winner: extendedRounds?.secondHalf ?? null },
        { label: "OT", winner: findOt(1) },
        { label: "Double OT", winner: findOt(2) },
        { label: "Triple OT", winner: findOt(3) },
        { label: "Quadruple OT", winner: findOt(4) },
    ];
};

export const EXTENDED_ROUNDS_TO_WIN = 4;

const EXTENDED_ROUND_TITLES = [
    "1st Half",
    "2nd Half",
    "Overtime",
    "Double Overtime",
    "Triple Overtime",
    "Quadruple Overtime",
];

const EXTENDED_ROUND_PARTS = ["firstHalf", "secondHalf", "ot1", "ot2", "ot3", "ot4"];

export const buildExtendedRoundDetails = (extendedRounds, roundLog = []) => {
    const log = Array.isArray(roundLog) ? roundLog : [];
    let left = 0;
    let right = 0;
    let clinchIndex = null;

    const rounds = buildExtendedRoundWinnerList(extendedRounds).map((item, i) => {
        const logged = log.find((r) => r.squares === 10 && r.part === EXTENDED_ROUND_PARTS[i]) ?? null;
        if (item.winner === "left") left++;
        else if (item.winner === "right") right++;
        if (clinchIndex === null && (left >= EXTENDED_ROUNDS_TO_WIN || right >= EXTENDED_ROUNDS_TO_WIN)) {
            clinchIndex = i;
        }
        return {
            ...item,
            title: EXTENDED_ROUND_TITLES[i],
            miniLeft: logged?.miniLeft ?? null,
            miniRight: logged?.miniRight ?? null,
            roundNumber: logged?.roundNumber ?? null,
            roundKey: logged?.key ?? null,
            tallyLeft: left,
            tallyRight: right,
        };
    });

    return { rounds, clinchIndex, left, right };
};

export const getBo1Tiebreak = (history) => {
    if (!history?.extendedRounds || history.wins !== history.losses) return null;

    const { penalties } = history.extendedRounds;
    if (penalties) return { type: "Pens", left: penalties.leftScore, right: penalties.rightScore };

    let left = 0;
    let right = 0;
    buildExtendedRoundWinnerList(history.extendedRounds).forEach(({ winner }) => {
        if (winner === "left") left++;
        else if (winner === "right") right++;
    });

    return left || right ? { type: "ERs", left, right } : null;
};

export const getQualifiedBy = (stage, key) =>
    stage.teams
        .filter((t) => t.qualified && t.qualifiedVia === key)
        .sort((a, b) => (a.qualifiedAt ?? 1e9) - (b.qualifiedAt ?? 1e9));

export const getEliminatedBy = (stage, key) =>
    stage.teams
        .filter((t) => t.eliminated && t.eliminatedVia === key)
        .sort((a, b) => (a.eliminatedAt ?? 1e9) - (b.eliminatedAt ?? 1e9));

const EXTENDED_ROUNDS_TOTAL = EXTENDED_ROUND_TITLES.length;
const BASE_SET_TARGET = 13;

export const getLiveSetResult = (seriesState) => {
    const s = seriesState;
    if (!s?.setNumber || (s.finishedSets || []).some((f) => f.set === s.setNumber)) return null;

    if (s.tiebreakerPhase === "penalties") {
        if (!s.penaltyResolved) return null;
        return {
            set: s.setNumber,
            leftScore: s.penaltyPreScore?.left ?? 0,
            rightScore: s.penaltyPreScore?.right ?? 0,
            extendedRoundsPlayed: true,
            extendedRoundLeftScore: s.extRoundLeftScore,
            extendedRoundRightScore: s.extRoundRightScore,
            penaltiesPlayed: true,
            penaltyLeftScore: s.penaltyLeftScore,
            penaltyRightScore: s.penaltyRightScore,
        };
    }

    if (s.tiebreakerPhase === "extended") {
        if (s.extRoundRevealIndex < EXTENDED_ROUNDS_TOTAL || s.extRoundLeftScore === s.extRoundRightScore) return null;
        return {
            set: s.setNumber,
            leftScore: s.roundWins,
            rightScore: s.roundLosses,
            extendedRoundsPlayed: true,
            extendedRoundLeftScore: s.extRoundLeftScore,
            extendedRoundRightScore: s.extRoundRightScore,
            penaltiesPlayed: false,
        };
    }

    const target = BASE_SET_TARGET + (s.overtimeBlock || 0) * 3;
    if (s.roundWins >= target || s.roundLosses >= target) {
        return { set: s.setNumber, leftScore: s.roundWins, rightScore: s.roundLosses };
    }

    return null;
};

export const getSetResultWinner = (result) => {
    if (!result) return null;
    const left = result.penaltiesPlayed ? result.penaltyLeftScore : result.extendedRoundsPlayed ? result.extendedRoundLeftScore : result.leftScore;
    const right = result.penaltiesPlayed ? result.penaltyRightScore : result.extendedRoundsPlayed ? result.extendedRoundRightScore : result.rightScore;
    return left > right ? "left" : right > left ? "right" : null;
};

export const getDisplayedRoundNumber = (seriesState) => {
    const s = seriesState;
    const played = (s.roundWins || 0) + (s.roundLosses || 0);
    if (getLiveSetResult(s) || s.banner) return Math.max(played, 1);
    const target = BASE_SET_TARGET + (s.overtimeBlock || 0) * 3;
    const blockBoundary = s.roundWins === s.roundLosses && s.roundWins === target - 1;
    if (blockBoundary || s.tiebreakerPhase !== "idle") return Math.max(played, 1);
    return played + 1;
};
