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
