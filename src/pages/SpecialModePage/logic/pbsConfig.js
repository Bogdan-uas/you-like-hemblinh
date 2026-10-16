export const PBS_TEAM_COUNT = 32;
export const PBS_POT_SIZE = 16;

export const PBS_STAGE_ORDER = ["ro32", "ro16", "qf", "sf", "thirdPlace", "gf"];
export const PBS_DRAFT_ROUNDS = ["ro32", "ro16", "qf", "sf"];
export const PBS_NEXT_DRAFT_ROUND = { ro32: "ro16", ro16: "qf", qf: "sf" };

export const PBS_BEST_OF = { ro32: 3, ro16: 3, qf: 5, sf: 7, thirdPlace: 7, gf: 9 };

export const PBS_RATING_WEIGHTS = { ro32: 1.38, ro16: 1.6, qf: 2.13, sf: 2.55, thirdPlace: 2.77, gf: 4.25 };

export const PBS_BIG_STAGE = {
    ro32: { winner: 3 },
    ro16: { winner: 4 },
    qf: { winner: 4 },
    sf: { winner: 5 },
    thirdPlace: { winner: 6, loser: 4 },
    gf: { winner: 8, loser: 6 },
};

export const PBS_BOUNTY_TOP = 60;
export const PBS_BOUNTY_STEP = 3;
export const PBS_BOUNTY_SHARE = 0.5;

export const PBS_VIEW_OF_ROUND = {
    ro32: "pbsStage1",
    ro16: "pbsStage2",
    qf: "pbsFinals",
    sf: "pbsFinals",
    thirdPlace: "pbsFinals",
    gf: "pbsFinals",
};

export const PBS_STAGE_TITLES = {
    pbsStage1: "Stage I",
    pbsStage2: "Stage II",
    pbsFinals: "Finals",
};

export const PBS_ROUND_TITLES = {
    ro32: "Round of 32",
    ro16: "Round of 16",
    qf: "Quarterfinals",
    sf: "Semifinals",
};

export const PBS_TROPHY_BODY = "linear-gradient(180deg, #ffffff 0%, #eef0f4 50%, #c9ccd4 100%)";
export const PBS_TROPHY_GEM = "linear-gradient(180deg, #9dffcf 0%, #12b36a 50%, #06582f 100%)";

const PBS_MIN_NEEDED_PICKEM = 74;
const PBS_MAX_NEEDED_PICKEM = 120;

export const getRandomPbsNeededPickemPoints = () =>
    Math.floor(Math.random() * (PBS_MAX_NEEDED_PICKEM - PBS_MIN_NEEDED_PICKEM + 1)) + PBS_MIN_NEEDED_PICKEM;

export const pbsSeedBounty = (seed) =>
    seed <= PBS_POT_SIZE ? PBS_BOUNTY_TOP - (seed - 1) * PBS_BOUNTY_STEP : 0;
