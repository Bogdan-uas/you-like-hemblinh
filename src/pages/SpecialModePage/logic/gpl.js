import { buildLeaderboard } from "./teamData.js";
import { toBaseTeam } from "./teams.js";
import { GCC_TEAM_COUNT } from "./gcc.js";
import { PEM_BIG_PLAYOFFS_BEST_OF } from "./pemConfig.js";
import { PEM_BIG_PLAYOFFS_RATING_WEIGHTS, PEM_BIG_PLAYOFFS_BIG_STAGE } from "./pemSeries.jsx";

export const GPL_STAGE2_AUTO_COUNT = 8;
export const GPL_STAGE1_COUNT = 16;
export const GPL_TEAM_COUNT = GPL_STAGE2_AUTO_COUNT + GPL_STAGE1_COUNT;
export const GPL_SERIES_TEAM_COUNT = GPL_TEAM_COUNT + GCC_TEAM_COUNT;
export const GPL_SWISS_MATCH_COUNT = 33;

export const GPL_PLAYOFFS_BEST_OF = PEM_BIG_PLAYOFFS_BEST_OF;
export const GPL_PLAYOFFS_RATING_WEIGHTS = PEM_BIG_PLAYOFFS_RATING_WEIGHTS;
export const GPL_PLAYOFFS_BIG_STAGE = PEM_BIG_PLAYOFFS_BIG_STAGE;
export const GPL_SWISS_RATING_WEIGHTS = { stage1: 1.3, stage2: 1.55 };
export const GPL_SWISS_CLEAR_GAINS = { stage1: 3, stage2: 4 };

const GPL_MIN_NEEDED_PICKEM = 167;
const GPL_MAX_NEEDED_PICKEM = 274;

export const getRandomGplNeededPickemPoints = () =>
    Math.floor(Math.random() * (GPL_MAX_NEEDED_PICKEM - GPL_MIN_NEEDED_PICKEM + 1)) +
    GPL_MIN_NEEDED_PICKEM;

export const buildGplSeeds = (teams, ratings) => {
    const sorted = buildLeaderboard(teams, ratings).sorted.map(toBaseTeam);
    return {
        stage2Auto: sorted.slice(0, GPL_STAGE2_AUTO_COUNT),
        stage1: sorted.slice(GPL_STAGE2_AUTO_COUNT, GPL_TEAM_COUNT),
        gcc: sorted.slice(GPL_TEAM_COUNT, GPL_SERIES_TEAM_COUNT),
    };
};
