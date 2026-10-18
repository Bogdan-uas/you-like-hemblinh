import React from "react";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { ManageStatRow } from "../components/StatsPanels.jsx";
import { UnbeatenStreakFire } from "../components/StreakBadges.jsx";
import { readUnbeatenStreak } from "../logic/statsUi.js";
import { STAT_DEFINITIONS, DEFAULT_TEAM_STAT_VALUES, UNBEATEN_STREAK_DEFINITION, statToInputString } from "../logic/teamStats.js";
import { NUMBERED_TOURNAMENT_TYPES } from "../logic/tournamentTypes.jsx";
import { FadeOut } from "../components/FadeOut.jsx";

export function LeaderboardAdminModals({ full, tournamentNumberAdmin, statsAdmin, placingsAdmin, page }) {
    const {
        isTournamentNumberCodeModalOpen,
        tournamentNumberCode,
        handleCloseTournamentNumberModals,
        handleVerifyTournamentNumberPassword,
        isTournamentNumberTypeModalOpen,
        tournamentNumberType,
        isTournamentNumberModalOpen,
        activeNumberType,
        tournamentNumberMode,
        tournamentNumberAmount,
        handleSubmitTournamentNumber,
        isTournamentNumberFinalModalOpen,
        handleConfirmTournamentNumber,
        setTournamentNumberCode,
        setTournamentNumberType,
        setIsTournamentNumberTypeModalOpen,
        setIsTournamentNumberModalOpen,
        setTournamentNumberMode,
        setTournamentNumberAmount,
    } = tournamentNumberAdmin;
    const {
        isScoreBoardResetModalOpen,
        scoreboardResetCode,
        handleCloseScoreboardResetModal,
        handleVerifyScoreboardResetPassword,
        isScoreBoardResetConfirmModalOpen,
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
    } = statsAdmin;
    const {
        isAddPlacingsCodeModalOpen,
        placingsAdminCode,
        handleVerifyAddPlacingsPassword,
        isAddPlacingsModalOpen,
        canSelectAllPlacings,
        allSelected,
        hasAnySelected,
        placingCategory,
        placingAmount,
        canConfirmPlacings,
        handleOpenAddPlacingsFinal,
        isAddPlacingsFinalModalOpen,
        handleApplyAddPlacings,
        isRemovePlacingsCodeModalOpen,
        handleVerifyRemovePlacingsPassword,
        isRemovePlacingsModalOpen,
        getTeamsForRemovePicker,
        handleOpenRemovePlacingsFinal,
        isRemovePlacingsFinalModalOpen,
        handleApplyRemovePlacings,
        setPlacingsAdminCode,
        setIsAddPlacingsCodeModalOpen,
        clearPlacingsAdminState,
        setSelectedPlacingTeamIds,
        selectedPlacingTeamIds,
        toggleTeamSelection,
        setPlacingCategory,
        setPlacingAmount,
        setIsAddPlacingsModalOpen,
        setIsAddPlacingsFinalModalOpen,
        setIsRemovePlacingsCodeModalOpen,
        setIsRemovePlacingsModalOpen,
        setIsRemovePlacingsFinalModalOpen,
    } = placingsAdmin;
    const {
        renderTournamentLabelFor,
        getTypeNumber,
        allTeams,
        toggleSelectAllTeams,
        rankById,
        teamRatings,
        getSortValue,
        getDisplayedValue,
    } = page;

    return (
        <>
        <FadeOut>{full && isTournamentNumberCodeModalOpen && (
            <div className={css.restart_modal}>
                <div style={{ width: "100%" }}>
                    <label className={css.reset_label} htmlFor="tournament-number-code">
                        Identification code
                    </label>
                    <input
                        id="tournament-number-code"
                        className={css.reset_input}
                        type="password"
                        value={tournamentNumberCode}
                        onChange={(e) => setTournamentNumberCode(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div className={css.restart_buttons}>
                    <button className={css.cancel_button} onClick={handleCloseTournamentNumberModals}>
                        Cancel
                    </button>
                    <button className={css.confirm_button} onClick={handleVerifyTournamentNumberPassword}>
                        Confirm
                    </button>
                </div>
            </div>
        )}</FadeOut>

        <FadeOut>{full && isTournamentNumberTypeModalOpen && (
            <div className={css.restart_modal} style={{ width: "520px" }}>
                <p className={css.restart_text} style={{ marginBottom: 12 }}>
                    Which tournament type?
                </p>

                <select
                    className={css.reset_input}
                    style={{ width: "80%" }}
                    value={tournamentNumberType}
                    onChange={(e) => setTournamentNumberType(e.target.value)}
                >
                    <option value=""></option>
                    {NUMBERED_TOURNAMENT_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                </select>

                <div className={css.restart_buttons}>
                    <button className={css.cancel_button} onClick={handleCloseTournamentNumberModals}>
                        Cancel
                    </button>
                    <button
                        className={`${css.confirm_button} ${!tournamentNumberType ? css.locked : ""}`}
                        disabled={!tournamentNumberType}
                        onClick={() => {
                            setIsTournamentNumberTypeModalOpen(false);
                            setIsTournamentNumberModalOpen(true);
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        )}</FadeOut>

        <FadeOut>{full && isTournamentNumberModalOpen && (
            <div className={css.restart_modal} style={{ width: "520px" }}>
                <p className={css.restart_text} style={{ marginBottom: 12 }}>
                    Tournament number management
                </p>

                <p className={css.restart_text} style={{ marginBottom: 12 }}>
                    Right now, it's {renderTournamentLabelFor(activeNumberType, getTypeNumber(activeNumberType))}
                </p>

                <div style={{ display: "flex", gap: 12, width: "80%", marginBottom: 4 }}>
                    <select
                        className={css.reset_input}
                        style={{ marginBottom: 0 }}
                        value={tournamentNumberMode}
                        onChange={(e) => setTournamentNumberMode(e.target.value)}
                    >
                        <option value="add">Add</option>
                        <option value="subtract">Substract</option>
                        <option value="set">Set</option>
                    </select>

                    <input
                        className={css.reset_input}
                        style={{ marginBottom: 0 }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        type="text"
                        placeholder="Number"
                        value={tournamentNumberAmount}
                        onChange={(e) => {
                            const raw = e.target.value;
                            const digitsOnly = raw.replace(/[^0-9]/g, "");
                            setTournamentNumberAmount(digitsOnly);
                        }}
                        autoComplete="off"
                    />
                </div>

                <div className={css.restart_buttons}>
                    <button className={css.cancel_button} onClick={handleCloseTournamentNumberModals}>
                        Cancel
                    </button>
                    <button className={css.confirm_button} onClick={handleSubmitTournamentNumber}>
                        Submit
                    </button>
                </div>
            </div>
        )}</FadeOut>

        <FadeOut>{full && isTournamentNumberFinalModalOpen && (
            <div className={css.restart_modal}>
                <p className={css.restart_text}>
                    Are sure you want to change the tournament number?
                </p>

                <div className={css.restart_buttons}>
                    <button className={css.cancel_button} onClick={handleCloseTournamentNumberModals}>
                        Cancel
                    </button>
                    <button className={css.confirm_button} onClick={handleConfirmTournamentNumber}>
                        Confirm
                    </button>
                </div>
            </div>
        )}</FadeOut>

        <FadeOut>{isScoreBoardResetModalOpen && (
            <div className={css.restart_modal}>
                <div style={{ width: "100%" }}>
                    <label className={css.reset_label} htmlFor="scoreboard-reset-code">
                        Identification code
                    </label>

                    <input
                        id="scoreboard-reset-code"
                        className={css.reset_input}
                        type="password"
                        value={scoreboardResetCode}
                        onChange={(e) => setScoreboardResetCode(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div className={css.restart_buttons}>
                    <button className={css.cancel_button} onClick={handleCloseScoreboardResetModal}>
                        Cancel
                    </button>
                    <button className={css.confirm_button} onClick={handleVerifyScoreboardResetPassword}>
                        Confirm
                    </button>
                </div>
            </div>
        )}</FadeOut>

        <FadeOut>{isScoreBoardResetConfirmModalOpen && (
            <div className={css.restart_modal}>
                <p className={css.restart_text}>
                    <b>Are you sure?!</b> <br />
                    By pressing the button "Confirm", you'll reset the WHOLE scoreboard!
                </p>

                <div className={css.restart_buttons}>
                    <button className={css.cancel_button} onClick={handleCancelFinalScoreboardReset}>
                        Cancel
                    </button>
                    <button className={css.confirm_button} onClick={handleFinalScoreboardReset}>
                        Confirm
                    </button>
                </div>
            </div>
        )}</FadeOut>

        <FadeOut>{full && isScoreBoardResetModeModalOpen && (
            <div className={css.restart_modal} style={{ width: "520px" }}>
                <p className={css.restart_text} style={{ marginBottom: 12 }}>
                    Leaderboard management
                </p>

                <select
                    className={css.reset_input}
                    style={{ width: "80%" }}
                    value={scoreboardResetMode}
                    onChange={(e) => setScoreboardResetMode(e.target.value)}
                >
                    <option value=""></option>
                    <option value="reset">Reset the leaderboard?</option>
                    <option value="stats">Manage team stats</option>
                </select>

                <div className={css.restart_buttons}>
                    <button className={css.cancel_button} onClick={closeStatsAdminModals}>
                        Cancel
                    </button>
                    <button
                        className={`${css.confirm_button} ${!scoreboardResetMode ? css.locked : ""}`}
                        disabled={!scoreboardResetMode}
                        onClick={handleScoreboardResetModeConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        )}</FadeOut>

        <FadeOut>{full && isManageStatsModalOpen && (
            <div
                className={css.restart_modal}
                style={{
                    width: "620px",
                    height: "360px",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        padding: "20px 24px 16px",
                        width: "620px",
                    }}
                >
                    <p className={css.restart_text} style={{ marginBottom: 12 }}>
                        Manage team stats
                    </p>

                    <div style={{ marginBottom: 12, width: "100%" }}>
                        <label className={css.reset_label}>Team</label>

                        <button
                            type="button"
                            className={css.reset_input}
                            style={{
                                marginBottom: 0,
                                textAlign: "left",
                                cursor: "pointer",
                                minHeight: 38,
                            }}
                            onClick={() => setIsManageStatsPickerOpen((open) => !open)}
                        >
                            {manageStatsTeam ? `Team ${manageStatsTeam.name}` : "Choose a team…"}
                        </button>

                        {isManageStatsPickerOpen && (
                            <div
                                style={{
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                    height: "180px",
                                    width: "100%",
                                    border: "1px solid #999",
                                    borderRadius: 8,
                                    padding: 12,
                                    marginTop: 8,
                                }}
                            >
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", userSelect: "none" }}>
                                    {[...allTeams]
                                        .sort((a, b) => (rankById?.[a.id] ?? 64) - (rankById?.[b.id] ?? 64))
                                        .map((team) => {
                                            const isSelected = manageStatsTeamId === team.id;
                                            const isEdited = manageStatsEditedTeamIds.has(team.id);
                                            return (
                                                <span
                                                    key={team.id}
                                                    style={{ position: "relative", display: "inline-flex" }}
                                                >
                                                <button
                                                    type="button"
                                                    onClick={() => handleManageStatsPickTeam(team.id)}
                                                    className={css.team_circle_ro32}
                                                    style={{
                                                        width: 37.2,
                                                        height: 37.2,
                                                        boxShadow: isSelected ? `0 0 12px ${team.unlitColor}` : "none",
                                                        border: isSelected ? `2px solid ${team.unlitColor}` : "2px solid #999",
                                                        background: team.color,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        position: "relative",
                                                        overflow: "hidden",
                                                        cursor: "pointer",
                                                    }}
                                                    title={isEdited ? `Team ${team.name} (stats edited)` : `Team ${team.name}`}
                                                >
                                                    <span
                                                        style={{
                                                            color: "#ffffff",
                                                            fontSize: "12px",
                                                            textShadow: "0 0 4px #000",
                                                        }}
                                                        className={css.modal_team_rating}
                                                    >
                                                        {`${teamRatings?.[team.id] ?? 0}p`}
                                                    </span>
                                                </button>
                                                {isEdited && (
                                                    <span
                                                        aria-hidden="true"
                                                        style={{
                                                            position: "absolute",
                                                            zIndex: 2,
                                                            top: -3,
                                                            right: -3,
                                                            width: 14,
                                                            height: 14,
                                                            borderRadius: "50%",
                                                            background: "#ff8a00",
                                                            border: "2px solid #fff",
                                                            boxShadow: "0 0 4px rgba(0,0,0,.45)",
                                                            pointerEvents: "none",
                                                        }}
                                                    />
                                                )}
                                                </span>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            visibility: manageStatsTeam ? "visible" : "hidden",
                            pointerEvents: manageStatsTeam ? "auto" : "none",
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                margin: "4px 0 16px",
                                borderTop: "1px solid #ddd",
                            }}
                        />

                        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
                            {STAT_DEFINITIONS.map((def) => {
                                const currentValue =
                                    Number(manageStatsCurrent[def.key] ?? DEFAULT_TEAM_STAT_VALUES[def.key]) || 0;

                                return (
                                    <React.Fragment key={def.key}>
                                        <ManageStatRow
                                            def={def}
                                            currentValue={currentValue}
                                            inputValue={manageStatsValues[def.key]}
                                            isEditing={manageStatsEditingKey === def.key}
                                            onStartEdit={setManageStatsEditingKey}
                                            onInputChange={handleManageStatsInputChange}
                                            onInputCommit={handleManageStatsInputBlur}
                                            onSlide={handleManageStatsSlide}
                                        />

                                        {def.key === "unbeatenNerve" && (
                                            <div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        minHeight: 28,
                                                    }}
                                                >
                                                    <label
                                                        className={css.reset_label}
                                                        style={{ margin: 0, color: "#ff8a00", fontWeight: 700 }}
                                                    >
                                                        {UNBEATEN_STREAK_DEFINITION.label}:
                                                    </label>
                                                    <UnbeatenStreakFire
                                                        value={readUnbeatenStreak(manageStatsCurrent)}
                                                        size={26}
                                                        showZero
                                                    />
                                                </div>
                                                <input
                                                    className={css.reset_input}
                                                    style={{ marginBottom: 0 }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    disabled={!manageStatsTeam}
                                                    value={manageStatsValues.unbeatenStreak ?? ""}
                                                    onChange={(e) =>
                                                        handleManageStatsInputChange("unbeatenStreak", e.target.value)
                                                    }
                                                    onBlur={() => handleManageStatsInputBlur("unbeatenStreak")}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        position: "sticky",
                        bottom: 0,
                        background: "#fff",
                        borderTop: "1px solid #ddd",
                        padding: "12px 24px",
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                        columnGap: 12,
                    }}
                >
                    <div
                        style={{
                            justifySelf: "start",
                            minWidth: 0,
                            maxWidth: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: 2,
                        }}
                    >
                        <div
                            style={{
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontWeight: 800,
                                fontSize: "14px",
                                lineHeight: "18px",
                                color: manageStatsTeam?.color ?? "#2e2f42",
                            }}
                        >
                            {manageStatsTeam ? `Team ${manageStatsTeam.name}` : ""}
                        </div>

                        {canUseRatingBasedStats && (
                            <button
                                type="button"
                                onClick={handleManageStatsRatingBased}
                                title="Set this team's stats to match its rating and leaderboard placement"
                                style={{
                                    padding: "2px 8px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    lineHeight: "16px",
                                    whiteSpace: "nowrap",
                                    color: "#fff",
                                    background: "#747bff",
                                    border: "none",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                }}
                            >
                                Based on rating
                            </button>
                        )}
                    </div>

                    <div className={css.restart_buttons} style={{ margin: 0 }}>
                        <button className={css.cancel_button} onClick={closeStatsAdminModals}>
                            Cancel
                        </button>
                        <button
                            className={`${css.confirm_button} ${!canConfirmManageStats ? css.locked : ""}`}
                            disabled={!canConfirmManageStats}
                            onClick={handleManageStatsFormConfirm}
                        >
                            Confirm
                        </button>
                    </div>

                    <div
                        style={{
                            justifySelf: "end",
                            whiteSpace: "nowrap",
                            fontWeight: 700,
                            fontSize: "13px",
                            color: "#2e2f42",
                            opacity: 0.8,
                        }}
                    >
                        {manageStatsTeam ? `Average: ${manageStatsAverage}` : ""}
                    </div>
                </div>
            </div>
        )}</FadeOut>

        {full && isManageStatsFinalModalOpen && (
            <motion.div
                className={css.restart_modal}
                initial={{ y: "-100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0, ease: "easeInOut" }}
                style={{
                    width: "620px",
                    top: 0,
                    x: "-50%",
                    opacity: 1,
                    animation: "none",
                    borderRadius: "0 0 12px 12px",
                }}
            >
                <p className={css.restart_text}>
                    Are you sure you want to edit{" "}
                    <b>{manageStatsChangeCount === 1 ? "this stat" : "these stats"}</b>?
                </p>

                <div
                    style={{
                        width: "100%",
                        maxHeight: "320px",
                        overflowY: "auto",
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        margin: "4px 0 12px",
                    }}
                >
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "13px",
                            color: "#2e2f42",
                        }}
                    >
                        <thead>
                            <tr>
                                {["Team", "Stat", "Original", "New"].map((heading, i) => (
                                    <th
                                        key={heading}
                                        style={{
                                            position: "sticky",
                                            top: 0,
                                            background: "#f4f4f6",
                                            padding: "8px 10px",
                                            textAlign: i >= 2 ? "right" : "left",
                                            fontWeight: 800,
                                            borderBottom: "1px solid #ddd",
                                        }}
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {manageStatsEdits.map(({ team, changes }) =>
                                changes.map((change, i) => {
                                    const isLastOfTeam = i === changes.length - 1;
                                    const cellStyle = {
                                        padding: "6px 10px",
                                        borderBottom: isLastOfTeam ? "1px solid #ddd" : "1px solid #f0f0f0",
                                    };

                                    return (
                                        <tr key={`${team.id}-${change.key}`}>
                                            {i === 0 && (
                                                <td
                                                    rowSpan={changes.length}
                                                    style={{
                                                        padding: "6px 10px",
                                                        borderBottom: "1px solid #ddd",
                                                        borderRight: "1px solid #ddd",
                                                        verticalAlign: "top",
                                                        fontWeight: 800,
                                                        whiteSpace: "nowrap",
                                                        color: team.color ?? "#2e2f42",
                                                    }}
                                                >
                                                    Team {team.name}
                                                </td>
                                            )}
                                            <td style={cellStyle}>{change.label}</td>
                                            <td style={{ ...cellStyle, textAlign: "right", opacity: 0.6 }}>
                                                {statToInputString(change.from)}
                                            </td>
                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    textAlign: "right",
                                                    fontWeight: 800,
                                                    color: change.to > change.from ? "#1a9a4a" : "#d33a3a",
                                                }}
                                            >
                                                {statToInputString(change.to)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={css.restart_buttons}>
                    <button className={css.cancel_button} onClick={closeStatsAdminModals}>
                        Cancel
                    </button>
                    <button className={css.confirm_button} onClick={handleManageStatsFinalConfirm}>
                        Confirm
                    </button>
                </div>
            </motion.div>
        )}

        <FadeOut>{isAddPlacingsCodeModalOpen && (
            <div className={css.restart_modal}>
                <div style={{ width: "100%" }}>
                    <label className={css.reset_label} htmlFor="placings-admin-code-add">
                        Identification code
                    </label>
                    <input
                        id="placings-admin-code-add"
                        className={css.reset_input}
                        type="password"
                        value={placingsAdminCode}
                        onChange={(e) => setPlacingsAdminCode(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div className={css.restart_buttons}>
                    <button className={css.cancel_button} onClick={() => { setIsAddPlacingsCodeModalOpen(false); clearPlacingsAdminState(); }}>
                        Cancel
                    </button>
                    <button className={css.confirm_button} onClick={handleVerifyAddPlacingsPassword}>
                        Confirm
                    </button>
                </div>
            </div>
        )}</FadeOut>

        <FadeOut>{isAddPlacingsModalOpen && (
            <div className={css.restart_modal} style={{ width: "520px" }}>
                <p className={css.restart_text} style={{ marginBottom: 12 }}>
                    Add tournament placings
                </p>

                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <button
                        type="button"
                        className={css.gamble_button}
                        onClick={toggleSelectAllTeams}
                        disabled={allTeams.length === 0 || canSelectAllPlacings}
                    >
                        {allSelected ? "Unselect all" : "Select all"}
                    </button>

                    {hasAnySelected && (
                        <button
                            type="button"
                            className={css.cancel_button}
                            onClick={() => setSelectedPlacingTeamIds([])}
                            disabled={canSelectAllPlacings}
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div
                    style={{
                        overflowY: "auto",
                        overflowX: "hidden",
                        height: "180px",
                        width: "100%",
                        border: "1px solid #999",
                        borderRadius: 8,
                        padding: 12,
                    }}
                >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                        {[...allTeams]
                            .sort((a, b) => getSortValue(b) - getSortValue(a))
                            .map((t) => {
                                const isSelected = selectedPlacingTeamIds.includes(t.id);
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => toggleTeamSelection(t.id)}
                                        style={{
                                            width: 37.2,
                                            height: 37.2,
                                            boxShadow: isSelected ? `0 0 12px ${t.unlitColor}` : "none",
                                            border: isSelected ? `2px solid ${t.unlitColor}` : "2px solid #999",
                                            background: t.color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            position: "relative",
                                            overflow: "hidden",
                                        }}
                                        className={css.team_circle_ro32}
                                        title={`Team ${t.name} • ${teamRatings?.[t.id] ?? 0}p`}
                                    >
                                        <span
                                            style={{
                                                color: "#ffffff",
                                                fontSize: "12px",
                                                textShadow: "0 0 4px #000"
                                            }}
                                            className={css.modal_team_rating}
                                        >
                                            {getDisplayedValue(t)}{placingCategory === "points" ? "p" : ""}
                                        </span>
                                    </button>
                                );
                            })}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12, width: "50%", marginTop: 14 }}>
                    <select
                        className={css.reset_input}
                        style={{ marginBottom: 0 }}
                        value={placingCategory}
                        onChange={(e) => {
                            setPlacingCategory(e.target.value);
                        }}
                    >
                        <option value=""></option>
                        <option value="wins">🏆</option>
                        <option value="seconds">🥈</option>
                        <option value="thirds">🥉</option>
                        <option value="pemBigWins">🏆 (PEM Big)</option>
                        <option value="gplWins">🏆 (GPL)</option>
                        <option value="pbsWins">🏆 (PBS)</option>
                        <option value="tier1Wins">🏆 (PEM Small)</option>
                        <option value="tier1Seconds">🥈 (Tier 1)</option>
                        <option value="tier1Thirds">🥉 (Tier 1)</option>
                        <option value="tier2Wins">🥇 (Tier 2)</option>
                        <option value="tier2Seconds">🥈 (Tier 2)</option>
                        <option value="tier2Thirds">🥉 (Tier 2)</option>
                        <option value="points">points</option>
                    </select>

                    <input
                        className={css.reset_input}
                        style={{ marginBottom: 0 }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        type="text"
                        placeholder="Amount"
                        value={placingAmount}
                        onChange={(e) => {
                            const raw = e.target.value;
                            const onlyDigits = raw.replace(/[^\d]/g, "");
                            setPlacingAmount(onlyDigits);
                        }}
                    />
                </div>

                <div className={css.restart_buttons} style={{ marginTop: 14 }}>
                    <button className={css.cancel_button} onClick={() => { setIsAddPlacingsModalOpen(false); clearPlacingsAdminState(); }}>
                        Cancel
                    </button>
                    <button className={`${css.confirm_button} ${!canConfirmPlacings() ? css.locked : ""}`} disabled={!canConfirmPlacings()} onClick={handleOpenAddPlacingsFinal}>
                        Confirm
                    </button>
                </div>
            </div>
        )}</FadeOut>

        <FadeOut>{isAddPlacingsFinalModalOpen && (
            <div className={css.restart_modal}>
                <p className={css.restart_text}>
                    <b>Are you sure?!</b> <br />
                    By pressing "Confirm", you'll apply these placings.
                </p>

                <div className={css.restart_buttons}>
                    <button className={css.cancel_button} onClick={() => { setIsAddPlacingsFinalModalOpen(false); clearPlacingsAdminState(); }}>
                        Cancel
                    </button>
                    <button className={css.confirm_button} onClick={handleApplyAddPlacings}>
                        Confirm
                    </button>
                </div>
            </div>
        )}</FadeOut>

        <FadeOut>{isRemovePlacingsCodeModalOpen && (
            <div className={css.restart_modal}>
                <div style={{ width: "100%" }}>
                    <label className={css.reset_label} htmlFor="placings-admin-code-remove">
                        Identification code
                    </label>
                    <input
                        id="placings-admin-code-remove"
                        className={css.reset_input}
                        type="password"
                        value={placingsAdminCode}
                        onChange={(e) => setPlacingsAdminCode(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div className={css.restart_buttons}>
                    <button className={css.cancel_button} onClick={() => { setIsRemovePlacingsCodeModalOpen(false); clearPlacingsAdminState(); }}>
                        Cancel
                    </button>
                    <button className={css.confirm_button} onClick={handleVerifyRemovePlacingsPassword}>
                        Confirm
                    </button>
                </div>
            </div>
        )}</FadeOut>

        <FadeOut>{isRemovePlacingsModalOpen && (
            <div className={css.restart_modal} style={{ width: "520px" }}>
                <p className={css.restart_text} style={{ marginBottom: 12 }}>
                    Remove tournament placings
                </p>

                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <button
                        type="button"
                        className={css.gamble_button}
                        onClick={toggleSelectAllTeams}
                        disabled={allTeams.length === 0 || canSelectAllPlacings}
                    >
                        {allSelected ? "Unselect all" : "Select all"}
                    </button>

                    {hasAnySelected && (
                        <button
                            type="button"
                            className={css.cancel_button}
                            onClick={() => setSelectedPlacingTeamIds([])}
                            disabled={canSelectAllPlacings}
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div
                    style={{
                        overflowY: "auto",
                        overflowX: "hidden",
                        height: "180px",
                        width: "100%",
                        border: "1px solid #999",
                        borderRadius: 8,
                        padding: 12,
                    }}
                >
                    {!placingCategory ? (
                        <div style={{ width: "100%", height: "100%" }} />
                    ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                            {[...getTeamsForRemovePicker()]
                                .sort((a, b) => getSortValue(b) - getSortValue(a))
                                .map((t) => {
                                    const isSelected = selectedPlacingTeamIds.includes(t.id);
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => toggleTeamSelection(t.id)}
                                            style={{
                                                width: 37.2,
                                                height: 37.2,
                                                boxShadow: isSelected ? `0 0 12px ${t.unlitColor}` : "none",
                                                border: isSelected ? `2px solid ${t.unlitColor}` : "2px solid #999",
                                                background: t.color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                position: "relative",
                                                overflow: "hidden",
                                            }}
                                            className={css.team_circle_ro32}
                                            title={`Team ${t.name} • ${teamRatings?.[t.id] ?? 0}p`}
                                        >
                                            <span
                                                style={{
                                                    color: "#ffffff",
                                                    fontSize: "12px",
                                                    textShadow: "0 0 4px #000"
                                                }}
                                                className={css.modal_team_rating}
                                            >
                                                {getDisplayedValue(t)}{placingCategory === "points" ? "p" : ""}
                                            </span>
                                        </button>
                                    );
                                })}
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", gap: 12, width: "50%", marginTop: 14 }}>
                    <select
                        className={css.reset_input}
                        style={{ marginBottom: 0 }}
                        value={placingCategory}
                        onChange={(e) => {
                            setPlacingCategory(e.target.value);
                        }}
                    >
                        <option value=""></option>
                        <option value="wins">🏆</option>
                        <option value="seconds">🥈</option>
                        <option value="thirds">🥉</option>
                        <option value="pemBigWins">🏆 (PEM Big)</option>
                        <option value="gplWins">🏆 (GPL)</option>
                        <option value="pbsWins">🏆 (PBS)</option>
                        <option value="tier1Wins">🏆 (PEM Small)</option>
                        <option value="tier1Seconds">🥈 (Tier 1)</option>
                        <option value="tier1Thirds">🥉 (Tier 1)</option>
                        <option value="tier2Wins">🥇 (Tier 2)</option>
                        <option value="tier2Seconds">🥈 (Tier 2)</option>
                        <option value="tier2Thirds">🥉 (Tier 2)</option>
                        <option value="points">points</option>
                    </select>

                    <input
                        className={css.reset_input}
                        style={{ marginBottom: 0 }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        type="text"
                        placeholder="Amount"
                        value={placingAmount}
                        onChange={(e) => {
                            const raw = e.target.value;
                            const onlyDigits = raw.replace(/[^\d]/g, "");
                            setPlacingAmount(onlyDigits);
                        }}
                    />
                </div>

                <div className={css.restart_buttons} style={{ marginTop: 14 }}>
                    <button className={css.cancel_button} onClick={() => { setIsRemovePlacingsModalOpen(false); clearPlacingsAdminState(); }}>
                        Cancel
                    </button>
                    <button
                        className={`${css.confirm_button} ${!canConfirmPlacings() ? css.locked : ""}`}
                        disabled={!canConfirmPlacings()}
                        onClick={handleOpenRemovePlacingsFinal}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        )}</FadeOut>

        <FadeOut>{isRemovePlacingsFinalModalOpen && (
            <div className={css.restart_modal}>
                <p className={css.restart_text}>
                    <b>Are you sure?!</b> <br />
                    By pressing "Confirm", you'll remove these placings.
                </p>

                <div className={css.restart_buttons}>
                    <button className={css.cancel_button} onClick={() => { setIsRemovePlacingsFinalModalOpen(false); clearPlacingsAdminState(); }}>
                        Cancel
                    </button>
                    <button className={css.confirm_button} onClick={handleApplyRemovePlacings}>
                        Confirm
                    </button>
                </div>
            </div>
        )}</FadeOut>
        </>
    );
}
