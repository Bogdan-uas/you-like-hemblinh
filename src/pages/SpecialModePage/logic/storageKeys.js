export const SCOREBOARD_RESET_CODE_HASH = (import.meta.env.VITE_SCOREBOARD_RESET_CODE_HASH ?? "").trim().toLowerCase();
export const SECRET_KEY_CODE_HASH = (import.meta.env.VITE_SECRET_KEY_CODE_HASH ?? "").trim().toLowerCase();

export const STORAGE_KEY = "specialPageState_swiss_v2";
export const TEAM_RATINGS_LS_KEY = "specialMode_teamRatings_v1";
export const ROUND_LOG_LS_KEY = "specialMode_currentRoundLog_v1";
export const TEAM_RATINGS_SNAPSHOT_LS_KEY = "specialMode_teamRatings_snapshot_v1";
export const LAST_TOURNAMENT_CHANGES_LS_KEY = "specialMode_lastTournamentChanges_v1";
export const TEAM_PLACINGS_LS_KEY = "specialMode_teamPlacings_v1";
export const TOURNAMENT_NUMBER_LS_KEY = "specialMode_tournamentNumber_v1";
export const STATS_PANELS_LS_KEY = "specialMode_statsPanels_v1";
export const STATS_PANELS_MAX_ENTRIES = 300;
export const DEFAULT_STATS_PANELS_STATE = { left: true, right: true };
export const BREAKDOWN_HIDDEN_LS_KEY = "specialMode_breakdownModalHidden_v1";
export const BREAKDOWN_FULL_HEIGHT_LS_KEY = "specialMode_breakdownModalFullHeight_v1";
export const TOURNAMENT_NUMBERS_LS_KEY = "specialMode_tournamentNumbers_v1";
export const HALL_TEAM_SORT_LS_KEY = "specialMode_hallTeamSort_v1";
export const TEAM_STATS_LS_KEY = "specialMode_teamStats_v1";
export const LEADERBOARD_SORT_LS_KEY = "specialMode_leaderboardSort_v1";
export const LEADERBOARD_DIVIDERS_LS_KEY = "specialMode_leaderboardDividers_v1";
export const RATING_BASED_STATS_LS_KEY = "specialMode_ratingBasedStats_v1";
export const TOURNAMENT_PICKER_LS_KEY = "specialMode_tournamentPicker_v1";
export const TOURNAMENT_BANS_LS_KEY = "specialMode_tournamentBans_v1";
export const SECRET_PANEL_LS_KEY = "specialMode_secretPanel_v1";
export const CURRENT_TOURNAMENT_TYPE_LS_KEY = "specialMode_currentTournamentType_v1";
export const SETTINGS_LS_KEY = "specialMode_settings_v1";

export const TEAM_STATS_SNAPSHOT_LS_KEY = "specialMode_teamStats_snapshot_v1";

export const PBS_DRAFT_CLOCK_LS_KEY = "specialMode_pbsDraftClock_v1";

export const PGX_LAST_CITY_LS_KEY = "specialMode_pgxLastCity_v1";
