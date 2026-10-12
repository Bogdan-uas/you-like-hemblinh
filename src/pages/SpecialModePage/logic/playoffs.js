import { CST_PLAYOFFS_BEST_OF } from "./cst.js";
import { PEM_PLAYOFFS_BEST_OF, PEM_BIG_PLAYOFFS_BEST_OF } from "./pemConfig.js";

export const stageLabelPlayoffs = (stage) => {
    switch (stage) {
        case "ro16": return "Round of 16";
        case "qf": return "Quarterfinal";
        case "sf": return "Semifinal";
        case "thirdPlace": return "Third Place Decider";
        case "gf": return "Grand Final";
        default: return "";
    }
};

export const getBestOfForPlayoffs = (stage, kind = null) => {
    if (kind === "cst") return CST_PLAYOFFS_BEST_OF[stage] ?? 3;
    if (kind === "pem") return PEM_PLAYOFFS_BEST_OF[stage] ?? 5;
    if (kind === "pemBig") return PEM_BIG_PLAYOFFS_BEST_OF[stage] ?? 5;
    if (stage === "gf") return 9;
    if (stage === "sf") return 7;
    if (stage === "thirdPlace") return 7;
    return 5;
};

const qualificationValue = (team) => {
    const [w, l] =
        team.qualifiedVia.split(":").map(Number);

    return {
        wins: w,
        losses: l,
    };
};

const buildPlayoffSeeds = (qualifiedTeams) => {
    return [...qualifiedTeams].sort((a, b) => {
        const aRecord = qualificationValue(a);
        const bRecord = qualificationValue(b);

        if (aRecord.losses !== bRecord.losses) {
            return aRecord.losses - bRecord.losses;
        }

        if (b.buchholz !== a.buchholz) {
            return b.buchholz - a.buchholz;
        }

        return a.seed - b.seed;
    });
};

export const bracketOrder = [
    [0, 15],
    [7, 8],

    [3, 12],
    [4, 11],

    [1, 14],
    [6, 9],

    [2, 13],
    [5, 10],
];

export const buildPlayoffsBracket = (teams16) => {
    const seeded = buildPlayoffSeeds(teams16);

    const ro16 = bracketOrder.map(([a, b], i) => ({
        id: `ro16-${i + 1}`,
        stage: "ro16",

        slotA: seeded[a],
        slotB: seeded[b],

        played: false,
        scoreLeft: null,
        scoreRight: null,
        winnerTeamId: null,
        loserTeamId: null,
        pickTeamId: null,
        setHistory: [],
    }));

    const mk = (stage, n) =>
        Array.from({ length: n }).map((_, i) => ({
            id: `${stage}-${i + 1}`,
            stage,
            slotA: null,
            slotB: null,
            played: false,
            scoreLeft: null,
            scoreRight: null,
            winnerTeamId: null,
            loserTeamId: null,
            pickTeamId: null,
            setHistory: [],
        }));

    return {
        ro16,
        qf: mk("qf", 4),
        sf: mk("sf", 2),
        thirdPlace: mk("thirdPlace", 1),
        gf: mk("gf", 1),
    };
};

export const canOpenPlayoffsMatch = (bracket, stage, matchIndex) => {
    const stageArr = bracket[stage];
    const match = stageArr[matchIndex];
    if (!match || !match.slotA || !match.slotB) return false;
    if (match.played) return false;

    for (let i = 0; i < matchIndex; i++) {
        if (!stageArr[i].played) return false;
    }

    if (stage === "qf" && bracket.ro16.some((m) => !m.played)) return false;
    if (stage === "sf" && bracket.qf.some((m) => !m.played)) return false;
    if (stage === "thirdPlace" && bracket.sf.some((m) => !m.played)) return false;

    if (stage === "gf") {
        if (bracket.sf.some((m) => !m.played)) return false;
        if (bracket.thirdPlace[0] && !bracket.thirdPlace[0].played) return false;
    }

    return true;
};
