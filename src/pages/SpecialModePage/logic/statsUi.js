export const STREAK_LIT_STYLE = {
    color: "#ff8a00",
    filter: "drop-shadow(0 0 3px rgba(255,138,0,0.85))",
    scale: 1,
};

export const STREAK_ASH_STYLE = {
    color: "#a7a9b4",
    filter: "drop-shadow(0 0 0px rgba(255,138,0,0))",
    scale: 0.92,
};

export const STAT_ROW_FONT_PX = 12.5;
export const STAT_ROW_MIN_FONT_PX = 9.5;
export const STAT_ROW_NOTE_COLOR = "#8a8d99";

export const fitStatRowFont = (natural, available) =>
    Math.floor(STAT_ROW_FONT_PX * (available / natural) * 10) / 10;

export const STATS_TAB_LINK_COLOR = "#8a8d99";

export const STREAK_FIRE_MODAL_SIZE = 30;
const STREAK_FIRE_SHIFT_PX = STREAK_FIRE_MODAL_SIZE + 8;

export const readUnbeatenStreak = (stats) =>
    Math.max(0, Math.floor(Number(stats?.unbeatenStreak) || 0));

export const MATCH_STATS_TOGGLE_CIRCLE_STYLE = {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#fff",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4), 0 2px 5px rgba(0,0,0,0.3)",
    cursor: "pointer",
    zIndex: 5,
};

export const POPOVER_CURSOR_OFFSET_X = 16;
export const POPOVER_CURSOR_OFFSET_Y = 20;
export const POPOVER_VIEWPORT_MARGIN = 8;
export const POPOVER_WIDTH_PX = 230;
