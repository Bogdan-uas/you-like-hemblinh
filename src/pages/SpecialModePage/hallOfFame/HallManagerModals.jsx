import React from "react";
import { TournamentNumberText } from "../components/TournamentNumberText.jsx";
import css from "../SpecialModePage.module.css";
import { MIN_NEEDED_PICKEM, MAX_NEEDED_PICKEM } from "../logic/gameConstants.js";
import { getTournamentTypeConfig, HALL_FORM_TOURNAMENT_TYPES } from "../logic/tournamentTypes.jsx";
import { FadeOut } from "../components/FadeOut.jsx";

export function HallManagerModals({ ctx }) {
    const {
        hallManagerForm,
        isHallManagerCodeModalOpen,
        hallManagerCode,
        closeHallManagerModals,
        handleVerifyHallManagerPassword,
        isHallManagerModeModalOpen,
        hallManagerMode,
        hallOfFame,
        handleHallManagerModeConfirm,
        isHallManagerSelectModalOpen,
        hallManagerScrollRef,
        hallManagerTargetId,
        hallManagerTargetIds,
        handleHallManagerSelectConfirm,
        isHallManagerFormModalOpen,
        hallTeamSortMode,
        canConfirmHallForm,
        handleHallManagerFormConfirm,
        isHallManagerFinalModalOpen,
        handleHallManagerFinalConfirm,
        setHallManagerCode,
        setHallManagerMode,
        hallRecordLabel,
        setHallManagerTargetIds,
        setHallManagerTargetId,
        setHallManagerForm,
        setHallPickerField,
        getTypeNumber,
        emptyHallPicks,
        hallNeededPointsIsValid,
        handleHallNeededPointsBlur,
        handleHallNeededPointsChange,
        hallFormFieldIsUnlocked,
        hallPickerField,
        sortHallTeams,
        allTeams,
        hallTeamById,
        getHallPickAccess,
        hallTeamPickerValue,
        handleHallPickPointerDown,
        handleHallPickPointerEnter,
        handleHallPickClick,
        setHallTeamSortMode,
    } = ctx;

    const renderHallManagerModals = () => {
        const form = hallManagerForm;
        const config = form ? getTournamentTypeConfig(form.type || "") : null;

        const finalQuestion = () => {
            if (hallManagerMode === "deleteAll") {
                return (
                    <>
                        Are you sure you want to delete <b>ALL THE TOURNAMENTS</b> from the Hall of Fame? <br />
                        <strong>You will NOT be able to revert this action!</strong>
                    </>
                );
            }
            if (hallManagerMode === "delete") {
                const count = hallManagerTargetIds.length;

                return (
                    <>
                        Are you sure you want to delete{" "}
                        <b>
                            {count === 1
                                ? "this tournament"
                                : `these ${count} tournaments`}
                        </b>{" "}
                        from the Hall of Fame? <br />
                        <strong>You will NOT be able to revert this action!</strong>
                    </>
                );
            }
            if (hallManagerMode === "edit") {
                return <>Are you sure you want to edit <b>this tournament</b>?</>;
            }
            return <>Are you sure you want to create <b>this tournament</b>?</>;
        };

        return (
            <>
                <FadeOut>{isHallManagerCodeModalOpen && (
                    <div className={css.restart_modal}>
                        <div style={{ width: "100%" }}>
                            <label className={css.reset_label} htmlFor="hall-manager-code">
                                Identification code
                            </label>
                            <input
                                id="hall-manager-code"
                                className={css.reset_input}
                                type="password"
                                value={hallManagerCode}
                                onChange={(e) => setHallManagerCode(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={closeHallManagerModals}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleVerifyHallManagerPassword}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}</FadeOut>

                <FadeOut>{isHallManagerModeModalOpen && (
                    <div className={css.restart_modal} style={{ width: "520px" }}>
                        <p className={css.restart_text} style={{ marginBottom: 12 }}>
                            Tournament management
                        </p>

                        <select
                            className={css.reset_input}
                            style={{ width: "80%" }}
                            value={hallManagerMode}
                            onChange={(e) => setHallManagerMode(e.target.value)}
                        >
                            <option value=""></option>
                            <option value="add">Add</option>
                            {hallOfFame.length === 0 ? null : (
                                <>
                                    <option value="edit">Edit</option>
                                    <option value="delete">Delete</option>
                                    <option value="deleteAll">DELETE ALL</option>
                                </>
                            )}
                        </select>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={closeHallManagerModals}>
                                Cancel
                            </button>
                            <button
                                className={`${css.confirm_button} ${!hallManagerMode ? css.locked : ""}`}
                                disabled={!hallManagerMode}
                                onClick={handleHallManagerModeConfirm}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}</FadeOut>

                <FadeOut>{isHallManagerSelectModalOpen && (
                    <div className={css.restart_modal} style={{ width: "520px" }}>
                        <p className={css.restart_text} style={{ marginBottom: 12 }}>
                            {hallManagerMode === "delete" ? "Which tournaments?" : "Which tournament?"}
                        </p>

                        {hallManagerMode === "delete" ? (
                            <div
                                ref={hallManagerScrollRef}
                                className={css.hidden_scrollbar}
                                style={{
                                    width: "80%",
                                    height: "120px",
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                    border: "1px solid #999",
                                    borderRadius: 8,
                                    padding: "8px 10px",
                                    marginBottom: "8px",
                                    boxSizing: "border-box",
                                }}
                            >
                                {hallOfFame.map((item) => {
                                    const checked = hallManagerTargetIds.includes(item.id);

                                    return (
                                        <label
                                            key={item.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                padding: "8px 4px",
                                                cursor: "pointer",
                                                userSelect: "none",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => {
                                                    setHallManagerTargetIds((prev) =>
                                                        checked
                                                            ? prev.filter((id) => id !== item.id)
                                                            : [...prev, item.id]
                                                    );
                                                }}
                                            />

                                            <span>
                                                <TournamentNumberText text={hallRecordLabel(item)} />
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            <select
                                className={css.reset_input}
                                style={{ width: "80%" }}
                                value={hallManagerTargetId}
                                onChange={(e) => setHallManagerTargetId(e.target.value)}
                            >
                                <option value=""></option>
                                {hallOfFame
                                    .filter((item) => !item.event && !item.format)
                                    .map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {hallRecordLabel(item)}
                                        </option>
                                    ))}
                            </select>
                        )}

                        <div className={css.restart_buttons}>
                            <button
                                className={css.cancel_button}
                                onClick={closeHallManagerModals}
                            >
                                Cancel
                            </button>

                            <button
                                className={`${css.confirm_button} ${(hallManagerMode === "delete"
                                    ? hallManagerTargetIds.length === 0
                                    : !hallManagerTargetId)
                                    ? css.locked
                                    : ""
                                    }`}
                                disabled={
                                    hallManagerMode === "delete"
                                        ? hallManagerTargetIds.length === 0
                                        : !hallManagerTargetId
                                }
                                onClick={handleHallManagerSelectConfirm}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}</FadeOut>

                <FadeOut>{isHallManagerFormModalOpen && form && (
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
                            ref={hallManagerScrollRef}
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                overflowX: "hidden",
                                padding: "20px 24px 16px",
                                width: "620px"
                            }}
                        >
                            <p className={css.restart_text} style={{ marginBottom: 12 }}>
                                {hallManagerMode === "edit" ? "Edit tournament" : "Add tournament"}
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                                <label className={css.reset_label}>Tournament type</label>
                                <select
                                    className={css.reset_input}
                                    style={{ marginBottom: 0 }}
                                    value={form.type}
                                    onChange={(e) => {
                                        const nextType = e.target.value;
                                        setHallManagerForm((prev) => ({
                                            ...prev,
                                            type: nextType,
                                            number: hallManagerMode === "add" && nextType
                                                ? String(getTypeNumber(nextType) + 1)
                                                : (nextType ? prev.number : ""),
                                            picks: emptyHallPicks(nextType),
                                        }));
                                        setHallPickerField("");
                                    }}
                                >
                                    {hallManagerMode === "add" && <option value=""></option>}
                                    {HALL_FORM_TOURNAMENT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
                                </select>
                                {[
                                    ["number", "Tournament number"],
                                    ["needed", `Needed Pick'em points (min: ${MIN_NEEDED_PICKEM}/max: ${MAX_NEEDED_PICKEM})`],
                                    ["achieved", "Achieved Pick'em points"],
                                ].map(([key, label]) => {
                                    const isUnlocked =
                                        key === "number"
                                            ? !!form.type
                                            : key === "needed"
                                                ? !!form.type && form.number !== ""
                                                : !!form.type && form.number !== "" && hallNeededPointsIsValid(form.needed);
                                    const isNeededInput = key === "needed";
                                    return (
                                        <React.Fragment key={key}>
                                            <label
                                                className={css.reset_label}
                                                style={{ visibility: isUnlocked ? "visible" : "hidden" }}
                                            >
                                                {label}
                                            </label>
                                            <input
                                                className={css.reset_input}
                                                style={{
                                                    marginBottom: 0,
                                                    visibility: isUnlocked ? "visible" : "hidden",
                                                    pointerEvents: isUnlocked ? "auto" : "none",
                                                }}
                                                disabled={!isUnlocked}
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                type="text"
                                                value={form[key]}
                                                onChange={(e) => {
                                                    if (isNeededInput) {
                                                        handleHallNeededPointsChange(e.target.value);
                                                        return;
                                                    }
                                                    setHallManagerForm((prev) => ({
                                                        ...prev,
                                                        [key]: e.target.value.replace(/[^0-9]/g, ""),
                                                    }));
                                                }}
                                                onBlur={isNeededInput ? handleHallNeededPointsBlur : undefined}
                                            />
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {config.fields.map((field, fieldIndex) => {
                                const picked = form.picks?.[field.key] || [];
                                const isUnlocked = hallFormFieldIsUnlocked(fieldIndex);
                                const isOpen = isUnlocked && hallPickerField === field.key;

                                return (
                                    <div
                                        key={field.key}
                                        style={{
                                            marginBottom: 12,
                                            width: "100%",
                                            visibility: isUnlocked ? "visible" : "hidden",
                                        }}
                                    >
                                        <label className={css.reset_label}>
                                            {field.label}
                                            {field.exactCount ? ` (${picked.length}/${field.exactCount})` : ""}
                                        </label>

                                        <button
                                            type="button"
                                            className={css.reset_input}
                                            style={{
                                                marginBottom: 0,
                                                textAlign: "left",
                                                cursor: isUnlocked ? "pointer" : "default",
                                                minHeight: 38,
                                                pointerEvents: isUnlocked ? "auto" : "none",
                                            }}
                                            disabled={!isUnlocked}
                                            onClick={() => setHallPickerField(isOpen ? "" : field.key)}
                                        >
                                            {picked.length === 0
                                                ? "Choose team(s)…"
                                                : picked
                                                    .map((id) => hallTeamById(id)?.name)
                                                    .filter(Boolean)
                                                    .join(", ")}
                                        </button>

                                        {isOpen && (
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
                                                    {sortHallTeams(allTeams).map((team) => {
                                                        const isSelected = picked.includes(team.id);
                                                        const access = getHallPickAccess(form, field.key, team.id);
                                                        const disabled = access.locked || (!isSelected && !access.allowed);
                                                        return (
                                                            <button
                                                                key={team.id}
                                                                type="button"
                                                                disabled={disabled}
                                                                onPointerDown={(e) => handleHallPickPointerDown(e, field.key, team.id, isSelected)}
                                                                onPointerEnter={() => handleHallPickPointerEnter(field.key, team.id)}
                                                                onClick={() => handleHallPickClick(field.key, team.id)}
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
                                                                    opacity: disabled && !access.locked ? 0.4 : 1,
                                                                    cursor: disabled ? "not-allowed" : "pointer",
                                                                }}
                                                                title={`Team ${team.name}${access.locked ? " (required)" : ""}`}
                                                            >
                                                                <span
                                                                    style={{
                                                                        color: "#ffffff",
                                                                        fontSize: "12px",
                                                                        textShadow: "0 0 4px #000"
                                                                    }}
                                                                    className={css.modal_team_rating}
                                                                >
                                                                    {hallTeamPickerValue(team)}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div
                            style={{
                                position: "sticky",
                                bottom: 0,
                                background: "#fff",
                                borderTop: "1px solid #ddd",
                                padding: "12px 24px",
                            }}
                        >
                            <div className={css.restart_buttons} style={{ margin: 0 }}>
                                <select
                                    className={css.reset_input}
                                    value={hallTeamSortMode}
                                    onChange={(e) => setHallTeamSortMode(e.target.value)}
                                    disabled={!form.type}
                                    style={{
                                        marginBottom: 0,
                                        marginRight: "auto",
                                        width: 180,
                                        visibility: form.type ? "visible" : "hidden",
                                        pointerEvents: form.type ? "auto" : "none",
                                    }}
                                >
                                    <option value="colors">by COLORS</option>
                                    <option value="points">by points</option>
                                    <option value="placement">by placement</option>
                                </select>
                                <button className={css.cancel_button} onClick={closeHallManagerModals}>
                                    Cancel
                                </button>
                                <button
                                    className={`${css.confirm_button} ${!canConfirmHallForm() ? css.locked : ""}`}
                                    disabled={!canConfirmHallForm()}
                                    onClick={handleHallManagerFormConfirm}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>

                <FadeOut>{isHallManagerFinalModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            {finalQuestion()}
                        </p>

                        <div className={css.restart_buttons}>
                            <button className={css.cancel_button} onClick={closeHallManagerModals}>
                                Cancel
                            </button>
                            <button className={css.confirm_button} onClick={handleHallManagerFinalConfirm}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}</FadeOut>
            </>
        );
    };

    return renderHallManagerModals();
}
