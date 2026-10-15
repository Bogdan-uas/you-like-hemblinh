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
