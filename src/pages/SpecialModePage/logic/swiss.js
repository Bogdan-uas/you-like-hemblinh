const SWISS_COLUMNS = [
    ["0:0"],
    ["1:0", "0:1"],
    ["2:0", "1:1", "0:2"],
    ["2:1", "1:2"],
    ["2:2"],
];

const isBo1Net = (net) =>
    net === "0:0" ||
    net === "1:0" ||
    net === "0:1" ||
    net === "1:1";

export const isProgressionOrEliminationNet = (net) =>
    net === "2:0" ||
    net === "0:2" ||
    net === "2:1" ||
    net === "1:2" ||
    net === "2:2";
    
export const GPL_SWISS_FORMAT = "gpl";
export const OFFICIAL_SWISS_FORMAT = "official32";
export const PGX_SWISS_FORMAT = "pgx";

export const isSixteenTeamSwissFormat = (format) =>
    format === GPL_SWISS_FORMAT || format === OFFICIAL_SWISS_FORMAT || format === PGX_SWISS_FORMAT;

export const getSwissLayoutFormat = (format) =>
    isSixteenTeamSwissFormat(format) ? GPL_SWISS_FORMAT : null;

export const getBestOfForSwissNet = (net, stageKey, format = null) => {
    if (format === PGX_SWISS_FORMAT) return 3;

    if (format === GPL_SWISS_FORMAT) {
        return stageKey === "stage2" && isProgressionOrEliminationNet(net) ? 5 : 3;
    }

    if (stageKey === "stage3") {
        return isProgressionOrEliminationNet(net) ? 5 : 3;
    }

    return isBo1Net(net) ? 1 : 3;
};

export const calcSetsToWin = (bestOf) => Math.ceil(bestOf / 2);

export const swissNetTitle = (net) => {
    if (net === "0:0") return "Match of 0:0 net";
    if (net === "1:0") return "Match of 1:0 net";
    if (net === "0:1") return "Match of 0:1 net";
    if (net === "2:0") return "2:0 net — Progression Match";
    if (net === "1:1") return "Match of 1:1 net";
    if (net === "0:2") return "0:2 net — Elimination Match";
    if (net === "2:1") return "2:1 net — Progression Match";
    if (net === "1:2") return "1:2 net — Elimination Match";
    if (net === "2:2") return "2:2 net — Deciding Match";
    return "Match";
};

export const BOX_SLOTS = {
    "3:0": 4,
    "3:1": 6,
    "3:2": 6,
    "0:3": 4,
    "1:3": 6,
    "2:3": 6,
};

const GPL_BOX_SLOTS = {
    "3:0": 2,
    "3:1": 3,
    "3:2": 3,
    "0:3": 2,
    "1:3": 3,
    "2:3": 3,
};

export const getSwissBoxSlots = (title, format = null) =>
    (isSixteenTeamSwissFormat(format) ? GPL_BOX_SLOTS : BOX_SLOTS)[title] ?? 6;

const makeSwissTeam = (t) => ({
    ...t,
    seed: 0,
    buchholz: 0,
    opponents: [],
    wins: 0,
    losses: 0,
    qualified: false,
    eliminated: false,

    qualifiedAt: null,
    qualifiedVia: null,
    eliminatedAt: null,
    eliminatedVia: null,
});

const shuffleMatches = (matches) => {
    for (let i = matches.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [matches[i], matches[j]] = [matches[j], matches[i]];
    }

    matches.forEach((m, i) => {
        m.matchNoInNet = i + 1;
    });
};

const buildNetMatches = (teams, stageKey, net, format = null) => {
    const [wStr, lStr] = net.split(":");
    const w = Number(wStr);
    const l = Number(lStr);

    const eligible = teams.filter(
        (t) => !t.qualified && !t.eliminated && t.wins === w && t.losses === l
    );

    const sorted = [...eligible].sort((a, b) => {
        if (b.buchholz !== a.buchholz) {
            return b.buchholz - a.buchholz;
        }

        return a.seed - b.seed;
    });

    const ordered = [...sorted];

    const matches = [];

    for (let i = 0; i < sorted.length; i += 2) {
        matches.push({
            id: `${stageKey}-${net}-${i / 2 + 1}`,
            stageKey,
            ...(format ? { format } : {}),
            net,
            matchNoInNet: i / 2 + 1,

            slotA: null,
            slotB: null,

            played: false,
            scoreLeft: null,
            scoreRight: null,
            winnerTeamId: null,
            loserTeamId: null,

            pickTeamId: null,
            setHistory: [],
        });
    }

    let idx = 0;

    while (ordered.length >= 2) {
        const high = ordered.shift();

        let opponentIndex = ordered.findLastIndex(
            (t) => !high.opponents.includes(t.id)
        );

        if (opponentIndex === -1) {
            opponentIndex = ordered.length - 1;
        }

        const low = ordered.splice(opponentIndex, 1)[0];

        matches[idx].slotA = high;
        matches[idx].slotB = low;

        idx++;
    }

    shuffleMatches(matches);

    return matches;
};

export const buildSwissStage = (stageKey, teams, format = null) => {
    const stageTeams = teams.map((t, i) =>
        makeSwissTeam(t, i + 1)
    );
    return {
        stageKey,
        ...(format ? { format } : {}),
        teams: stageTeams,
        matchesByNet: {
            "0:0": buildNetMatches(stageTeams, stageKey, "0:0", format),
        },
        resultCounter: 0,
    };
};

const isNetFinished = (stage, net) => {
    const arr = stage.matchesByNet[net];
    if (!arr) return false;
    return arr.every((m) => m.played);
};

const canBuildColumn = (stage, colIndex) => {
    if (colIndex === 0) return true;
    const prevCol = SWISS_COLUMNS[colIndex - 1];
    return prevCol.every((net) => isNetFinished(stage, net));
};

export const isNetUnlocked = (stage, net) => {
    const colIndex = SWISS_COLUMNS.findIndex((col) => col.includes(net));
    if (colIndex < 0) return false;
    return canBuildColumn(stage, colIndex);
};

export const tryBuildUnlockedNets = (stage) => {
    SWISS_COLUMNS.forEach((nets, colIndex) => {
        if (!canBuildColumn(stage, colIndex)) return;
        nets.forEach((net) => {
            if (!stage.matchesByNet[net]) {
                stage.matchesByNet[net] = buildNetMatches(stage.teams, stage.stageKey, net, stage.format ?? null);
            }
        });
    });
};

export const isSwissStageFinished = (stage) =>
    stage.teams.every((t) => t.qualified || t.eliminated);

export const getSwissQualified = (stage) => stage.teams.filter((t) => t.qualified);

export const teamsInNet = (stage, net) => {
    const [wStr, lStr] = net.split(":");
    const w = Number(wStr);
    const l = Number(lStr);
    return stage.teams.filter((t) => !t.qualified && !t.eliminated && t.wins === w && t.losses === l);
};
