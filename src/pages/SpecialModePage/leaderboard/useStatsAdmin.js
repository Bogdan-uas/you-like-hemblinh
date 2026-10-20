import { useState } from "react";
import toast from "../logic/renderSafeToast.js";
import { buildDefaultTeamPlacings, saveTeamPlacings } from "../logic/placings.jsx";
import { checkResetCode, isResetCodeConfigured } from "../logic/codeHash.js";
import { loadRatingBasedStatsTeamIds, buildDefaultTeamRatings, saveTeamRatings, saveTournamentNumber, classifyTeamsForStages, clearRatingsSnapshot, getTeamStatAverage, estimateStatsFromStrength, getRatingBasedStrength, getStatsDistance, RATING_BASED_FAR_OFF_DISTANCE, saveRatingBasedStatsTeamIds } from "../logic/teamData.js";
import { buildDefaultTeamStats, saveTeamStats, clearStatsSnapshot, DEFAULT_TEAM_STAT_VALUES, clampStat, MANAGE_STAT_DEFINITIONS, parseStatInput, STAT_DEFINITIONS, statToInputString, sanitizeStatInput } from "../logic/teamStats.js";
import { saveTournamentNumbers } from "../logic/tournamentTypes.jsx";

export function useStatsAdmin({
    allTeams,
    setTeamRatings,
    teamRatingsRef,
    setTeamPlacings,
    teamPlacingsRef,
    setTeamStats,
    teamStatsRef,
    setTournamentNumber,
    setTournamentNumbers,
    ratingsSnapshotRef,
    statsSnapshotRef,
    resetTournamentStateWithSeeds,
    teamStats,
    rankById,
    teamRatings,
}) {
    const [isScoreBoardResetModalOpen, setIsScoreBoardResetModalOpen] = useState(false);
    const [isScoreBoardResetConfirmModalOpen, setIsScoreBoardResetConfirmModalOpen] = useState(false);

    const [scoreboardResetCode, setScoreboardResetCode] = useState("");

    const [isScoreBoardResetModeModalOpen, setIsScoreBoardResetModeModalOpen] = useState(false);
    const [scoreboardResetMode, setScoreboardResetMode] = useState("");
    const [isManageStatsModalOpen, setIsManageStatsModalOpen] = useState(false);
    const [isManageStatsFinalModalOpen, setIsManageStatsFinalModalOpen] = useState(false);
    const [isManageStatsPickerOpen, setIsManageStatsPickerOpen] = useState(false);
    const [manageStatsTeamId, setManageStatsTeamId] = useState("");
    const [manageStatsValues, setManageStatsValues] = useState({});
    const [manageStatsEditingKey, setManageStatsEditingKey] = useState(null);
    const [manageStatsDrafts, setManageStatsDrafts] = useState({});
    const [manageStatsRatingBasedIds, setManageStatsRatingBasedIds] = useState({});
    const [ratingBasedStatsTeamIds, setRatingBasedStatsTeamIds] = useState(loadRatingBasedStatsTeamIds);

    const isStatsAdminModalOpen =
        isScoreBoardResetModeModalOpen ||
        isManageStatsModalOpen ||
        isManageStatsFinalModalOpen;

    const handleCloseScoreboardResetModal = () => {
        setIsScoreBoardResetModalOpen(false);
        setScoreboardResetCode("");
    };

    const handleVerifyScoreboardResetPassword = async () => {
        if (!isResetCodeConfigured()) {
            toast.error("Reset code is not configured.");
            return;
        }

        if (!(await checkResetCode(scoreboardResetCode))) {
            toast.error("WRONG PASSWORD!");
            return;
        }

        toast.success("Password correct!!!");
        setIsScoreBoardResetModalOpen(false);
        setScoreboardResetCode("");
        setScoreboardResetMode("");
        setIsScoreBoardResetModeModalOpen(true);
    };

    const handleFinalScoreboardReset = () => {
        const defaults = buildDefaultTeamRatings(allTeams);

        setTeamRatings(defaults);
        teamRatingsRef.current = defaults;
        saveTeamRatings(defaults);

        const defaultPlacings = buildDefaultTeamPlacings(allTeams);
        setTeamPlacings(defaultPlacings);
        teamPlacingsRef.current = defaultPlacings;
        saveTeamPlacings(defaultPlacings);

        const defaultStats = buildDefaultTeamStats(allTeams);
        setTeamStats(defaultStats);
        teamStatsRef.current = defaultStats;
        saveTeamStats(defaultStats);

        setTournamentNumber(0);
        saveTournamentNumber(0);

        setTournamentNumbers({});
        saveTournamentNumbers({});

        const seeded = classifyTeamsForStages(allTeams, defaults);

        ratingsSnapshotRef.current = null;
        clearRatingsSnapshot();
        statsSnapshotRef.current = null;
        clearStatsSnapshot();

        resetTournamentStateWithSeeds(seeded.stage1Seeds);

        setIsScoreBoardResetConfirmModalOpen(false);
        toast.success("Scoreboard has been reset.");
    };

    const handleCancelFinalScoreboardReset = () => {
        setIsScoreBoardResetConfirmModalOpen(false);
    };

    const closeStatsAdminModals = () => {
        setIsScoreBoardResetModeModalOpen(false);
        setScoreboardResetMode("");
        setIsManageStatsModalOpen(false);
        setIsManageStatsFinalModalOpen(false);
        setIsManageStatsPickerOpen(false);
        setManageStatsTeamId("");
        setManageStatsValues({});
        setManageStatsEditingKey(null);
        setManageStatsDrafts({});
        setManageStatsRatingBasedIds({});
    };

    const handleScoreboardResetModeConfirm = () => {
        if (scoreboardResetMode === "reset") {
            setIsScoreBoardResetModeModalOpen(false);
            setScoreboardResetMode("");
            setIsScoreBoardResetConfirmModalOpen(true);
            return;
        }

        if (scoreboardResetMode === "stats") {
            setIsScoreBoardResetModeModalOpen(false);
            setScoreboardResetMode("");
            setManageStatsTeamId("");
            setManageStatsValues({});
            setManageStatsDrafts({});
            setManageStatsRatingBasedIds({});
            setIsManageStatsPickerOpen(false);
            setIsManageStatsModalOpen(true);
        }
    };

    const manageStatsTeam = manageStatsTeamId
        ? allTeams.find((t) => t.id === manageStatsTeamId) ?? null
        : null;

    const manageStatsCurrent = manageStatsTeam
        ? teamStats?.[manageStatsTeam.id] ?? DEFAULT_TEAM_STAT_VALUES
        : DEFAULT_TEAM_STAT_VALUES;

    const roundManageStatValue = (def, typed) =>
        def.integer
            ? Math.round(clampStat(typed, 0, def.max))
            : Math.round(clampStat(typed, 0, def.max) * 100) / 100;

    const getManageStatsChanges = (teamId, values) => {
        if (!teamId) return [];
        const current = teamStats?.[teamId] ?? DEFAULT_TEAM_STAT_VALUES;

        return MANAGE_STAT_DEFINITIONS.reduce((acc, def) => {
            const typed = parseStatInput(values?.[def.key]);
            if (typed === null) return acc;
            const next = roundManageStatValue(def, typed);
            const from = Number(current[def.key] ?? DEFAULT_TEAM_STAT_VALUES[def.key]) || 0;
            if (Math.abs(next - from) > 0.0001) acc.push({ key: def.key, label: def.label, from, to: next });
            return acc;
        }, []);
    };

    const manageStatsAllValues = manageStatsTeamId
        ? { ...manageStatsDrafts, [manageStatsTeamId]: manageStatsValues }
        : manageStatsDrafts;

    const manageStatsEdits = Object.entries(manageStatsAllValues)
        .map(([teamId, values]) => ({
            team: allTeams.find((t) => t.id === teamId) ?? null,
            changes: getManageStatsChanges(teamId, values),
        }))
        .filter((edit) => edit.team && edit.changes.length > 0)
        .sort((a, b) => (rankById?.[a.team.id] ?? 64) - (rankById?.[b.team.id] ?? 64));

    const manageStatsEditedTeamIds = new Set(manageStatsEdits.map((edit) => edit.team.id));

    const manageStatsChangeCount = manageStatsEdits.reduce((sum, edit) => sum + edit.changes.length, 0);

    const canConfirmManageStats = manageStatsChangeCount > 0;

    const manageStatsPreview = manageStatsTeam
        ? Object.fromEntries(
            STAT_DEFINITIONS.map((def) => {
                const typed = parseStatInput(manageStatsValues[def.key]);
                const value = typed === null
                    ? Number(manageStatsCurrent[def.key] ?? DEFAULT_TEAM_STAT_VALUES[def.key]) || 0
                    : roundManageStatValue(def, typed);
                return [def.key, value];
            })
        )
        : null;

    const manageStatsAverage = manageStatsPreview ? getTeamStatAverage(manageStatsPreview) : null;

    const manageStatsEstimate = manageStatsTeam
        ? estimateStatsFromStrength(getRatingBasedStrength(manageStatsTeam.id, allTeams, teamRatings, rankById))
        : null;

    const isManageStatsRatingBased = !!manageStatsTeam &&
        !!(manageStatsRatingBasedIds[manageStatsTeam.id] || ratingBasedStatsTeamIds[manageStatsTeam.id]);

    const canUseRatingBasedStats = !!manageStatsTeam &&
        (!isManageStatsRatingBased ||
            getStatsDistance(manageStatsPreview, manageStatsEstimate) >= RATING_BASED_FAR_OFF_DISTANCE);

    const handleManageStatsRatingBased = () => {
        if (!manageStatsTeam || !manageStatsEstimate) return;
        setManageStatsValues((prev) => ({
            ...prev,
            ...Object.fromEntries(
                STAT_DEFINITIONS.map((def) => [def.key, statToInputString(manageStatsEstimate[def.key])])
            ),
        }));
        setManageStatsRatingBasedIds((prev) => ({ ...prev, [manageStatsTeam.id]: true }));
        setManageStatsEditingKey(null);
    };

    const buildManageStatsValues = (teamId) => {
        const current = teamStatsRef.current?.[teamId] ?? DEFAULT_TEAM_STAT_VALUES;
        return Object.fromEntries(
            MANAGE_STAT_DEFINITIONS.map((def) => [
                def.key,
                statToInputString(current[def.key] ?? DEFAULT_TEAM_STAT_VALUES[def.key]),
            ])
        );
    };

    const handleManageStatsPickTeam = (teamId) => {
        if (manageStatsTeamId) {
            setManageStatsDrafts((prev) => ({ ...prev, [manageStatsTeamId]: manageStatsValues }));
        }

        if (manageStatsTeamId === teamId) {
            setManageStatsTeamId("");
            setManageStatsValues({});
        } else {
            setManageStatsTeamId(teamId);
            setManageStatsValues(manageStatsDrafts[teamId] ?? buildManageStatsValues(teamId));
        }
        setManageStatsEditingKey(null);
        setIsManageStatsPickerOpen(false);
    };

    const handleManageStatsInputChange = (key, rawValue) => {
        const def = MANAGE_STAT_DEFINITIONS.find((d) => d.key === key);
        if (!def) return;

        let cleaned = sanitizeStatInput(rawValue);
        if (def.integer) cleaned = cleaned.replace(/\..*$/, "");
        const typed = parseStatInput(cleaned);

        if (typed !== null && typed > def.max) {
            toast.error("This is higher than the limit", { id: "manage-stats-limit" });
            return;
        }

        setManageStatsValues((prev) => ({ ...prev, [key]: cleaned }));
    };

    const handleManageStatsSlide = (key, value) => {
        const def = MANAGE_STAT_DEFINITIONS.find((d) => d.key === key);
        if (!def) return;
        setManageStatsValues((prev) => ({
            ...prev,
            [key]: statToInputString(clampStat(value, 0, def.max)),
        }));
    };

    const handleManageStatsInputBlur = (key) => {
        setManageStatsEditingKey((cur) => (cur === key ? null : cur));
        setManageStatsValues((prev) => {
            const typed = parseStatInput(prev[key]);
            if (typed !== null) return { ...prev, [key]: statToInputString(typed) };

            const current = teamStatsRef.current?.[manageStatsTeamId] ?? DEFAULT_TEAM_STAT_VALUES;
            return { ...prev, [key]: statToInputString(current[key] ?? DEFAULT_TEAM_STAT_VALUES[key]) };
        });
    };

    const handleManageStatsFormConfirm = () => {
        if (!canConfirmManageStats) return;
        setIsManageStatsPickerOpen(false);
        setIsManageStatsModalOpen(false);
        setIsManageStatsFinalModalOpen(true);
    };

    const handleManageStatsFinalConfirm = () => {
        if (!canConfirmManageStats) {
            closeStatsAdminModals();
            return;
        }

        const base = teamStatsRef.current ?? teamStats ?? {};
        const nextStats = { ...base };

        manageStatsEdits.forEach(({ team, changes }) => {
            const nextTeamStats = { ...(base[team.id] ?? DEFAULT_TEAM_STAT_VALUES) };
            changes.forEach(({ key, to }) => {
                nextTeamStats[key] = to;
            });
            nextStats[team.id] = nextTeamStats;
        });

        setTeamStats(nextStats);
        teamStatsRef.current = nextStats;
        saveTeamStats(nextStats);

        if (Object.keys(manageStatsRatingBasedIds).length > 0) {
            const nextRatingBasedIds = { ...ratingBasedStatsTeamIds, ...manageStatsRatingBasedIds };
            setRatingBasedStatsTeamIds(nextRatingBasedIds);
            saveRatingBasedStatsTeamIds(nextRatingBasedIds);
        }

        toast.success(manageStatsChangeCount === 1 ? "Stat has been updated." : "Stats have been updated.");
        closeStatsAdminModals();
    };

    return {
        isScoreBoardResetModalOpen,
        isScoreBoardResetConfirmModalOpen,
        isStatsAdminModalOpen,
        setIsScoreBoardResetModalOpen,
        scoreboardResetCode,
        handleCloseScoreboardResetModal,
        handleVerifyScoreboardResetPassword,
        handleCancelFinalScoreboardReset,
        handleFinalScoreboardReset,
        isScoreBoardResetModeModalOpen,
        scoreboardResetMode,
        closeStatsAdminModals,
        handleScoreboardResetModeConfirm,
        isManageStatsModalOpen,
        manageStatsTeam,
        isManageStatsPickerOpen,
        canUseRatingBasedStats,
        handleManageStatsRatingBased,
        canConfirmManageStats,
        handleManageStatsFormConfirm,
        manageStatsAverage,
        isManageStatsFinalModalOpen,
        manageStatsChangeCount,
        manageStatsEdits,
        handleManageStatsFinalConfirm,
        setScoreboardResetCode,
        setScoreboardResetMode,
        setIsManageStatsPickerOpen,
        manageStatsTeamId,
        manageStatsEditedTeamIds,
        handleManageStatsPickTeam,
        manageStatsCurrent,
        manageStatsValues,
        manageStatsEditingKey,
        setManageStatsEditingKey,
        handleManageStatsInputChange,
        handleManageStatsInputBlur,
        handleManageStatsSlide,
    };
}
