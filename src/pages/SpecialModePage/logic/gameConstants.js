export const ROUND12_TOAST_ID = "round12-warning";
export const SAVE_FAILED_TOAST_ID = "save-failed-warning";
export const SECRET_TOAST_ID = "secret-toast";
export const SECRET_NUM_TWO_TOAST_ID = "secret-toast-num-two";
export const SECRET_NUM_THREE_TOAST_ID = "secret-toast-num-three";

export const BASE_MAX_ROUNDS = 24;
export const BASE_ROUNDS_TO_WIN = 13;
export const OT_ROUNDS_TO_WIN = 4;

export const OT_MAX_BLOCK = 4;
const EXT_ROUND_LABELS = [
    "1st Half",
    "2nd Half",
    "OT",
    "Double OT",
    "Triple OT",
    "Quadruple OT",
];

export const EXT_ROUND_REVEAL_MS = 3000;
export const EXT_ROUND_COMMENTARY_DELAY_MS = 3000;
export const EXT_ROUND_FINAL_COMPARE_MS = 3000;
export const PENALTY_DISPLAY_CIRCLES = 6;

export const SIMULATE_MINI_MS = 90;
export const SIMULATE_IMPORTANT_MINI_MS = 420;
export const SIMULATE_INSTANT_BATCH = 40;

export const MULTIPLIER_MIN = 0.0;
export const MULTIPLIER_MAX = 5.0;

export const MIN_NEEDED_PICKEM = 351;
export const MAX_NEEDED_PICKEM = 576;

export const OFFICIAL_STAGE3_AUTO_COUNT = 8;
export const OFFICIAL_STAGE2_AUTO_COUNT = 8;
export const OFFICIAL_TEAM_COUNT = 32;
export const OFFICIAL_SWISS_MATCH_COUNT = 33;
export const OFFICIAL_MIN_NEEDED_PICKEM = 179;
export const OFFICIAL_MAX_NEEDED_PICKEM = 293;

export const getRandomNeededPickemPoints = () =>
    Math.floor(Math.random() * (OFFICIAL_MAX_NEEDED_PICKEM - OFFICIAL_MIN_NEEDED_PICKEM + 1)) +
    OFFICIAL_MIN_NEEDED_PICKEM;
