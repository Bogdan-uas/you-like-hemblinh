import { PEM_SMALL_TYPE_ID, PEM_BIG_TYPE_ID } from "./tournamentTypes.jsx";

export const PEM_PLAYOFFS_BEST_OF = { qf: 5, sf: 5, thirdPlace: 5, gf: 7 };

export const PEM_BIG_PLAYOFFS_BEST_OF = { qf: 5, sf: 7, thirdPlace: 7, gf: 9 };

const PEM_MIN_NEEDED_PICKEM = 67;
const PEM_MAX_NEEDED_PICKEM = 110;

const PEM_BIG_MIN_NEEDED_PICKEM = 92;
const PEM_BIG_MAX_NEEDED_PICKEM = 150;

export const PEM_TROPHY_SILVER = "linear-gradient(180deg, #ffffff 0%, #d9d9d9 30%, #a9a9a9 62%, #7d7d7d 100%)";
export const PEM_TROPHY_GOLD = "linear-gradient(180deg, #fffbe0 0%, #ffe066 30%, #f2b705 62%, #a87400 100%)";

export const PEM_QUALIFIED_HIGHLIGHT = { boxShadow: "0 0 10px rgba(255, 215, 0, 0.9)", borderColor: "#ffd700" };

const PEM_SERIES = {
    [PEM_SMALL_TYPE_ID]: {
        label: "PEM Small Tournament",
        longLabel: "Pro Extreme Masters Small Tournament",
        sizeWord: "Small",
        mainEventCount: 12,
        qualifierCount: 32,
        secondEvent: "cst",
        playoffsKind: "pem",
        trophyColor: PEM_TROPHY_SILVER,
        winsKey: "tier1Wins",
        statsKeyPrefix: "pem",
        hallIdPrefix: "pem-small",
        neededPickem: [PEM_MIN_NEEDED_PICKEM, PEM_MAX_NEEDED_PICKEM],
    },
    [PEM_BIG_TYPE_ID]: {
        label: "PEM Big Tournament",
        longLabel: "Pro Extreme Masters Big Tournament",
        sizeWord: "Big",
        mainEventCount: 16,
        qualifierCount: 32,
        secondEvent: "ecl",
        playoffsKind: "pemBig",
        trophyColor: PEM_TROPHY_GOLD,
        winsKey: "pemBigWins",
        statsKeyPrefix: "pemBig",
        hallIdPrefix: "pem-big",
        neededPickem: [PEM_BIG_MIN_NEEDED_PICKEM, PEM_BIG_MAX_NEEDED_PICKEM],
    },
};

export const isPemSeriesType = (type) => Object.hasOwn(PEM_SERIES, type);

export const getPemSeriesConfig = (type) => PEM_SERIES[type] ?? PEM_SERIES[PEM_SMALL_TYPE_ID];
