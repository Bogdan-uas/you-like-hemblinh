import { useState, useRef, useEffect } from "react";
import toast from "../logic/renderSafeToast.js";
import { MIN_NEEDED_PICKEM, MAX_NEEDED_PICKEM } from "../logic/gameConstants.js";
import { saveHallTournament, clearHallOfFameStore, deleteHallTournament, sortHallOfFame } from "../logic/hallOfFameDb.js";
import { SCOREBOARD_RESET_CODE } from "../logic/storageKeys.js";
import { formatOrdinal } from "../logic/teamData.js";
import { getTournamentTypeConfig, TOURNAMENT_TYPES } from "../logic/tournamentTypes.jsx";

export function useHallOfFameManager({ allTeams, hallTeamSortMode, teamRatings, rankById, hallOfFame, setHallOfFame, setSelectedHallTournament }) {
    const [isHallManagerButtonArmed, setIsHallManagerButtonArmed] = useState(false);
    const [isHallManagerCodeModalOpen, setIsHallManagerCodeModalOpen] = useState(false);
    const [isHallManagerModeModalOpen, setIsHallManagerModeModalOpen] = useState(false);
    const [isHallManagerSelectModalOpen, setIsHallManagerSelectModalOpen] = useState(false);
    const [isHallManagerFormModalOpen, setIsHallManagerFormModalOpen] = useState(false);
    const [isHallManagerFinalModalOpen, setIsHallManagerFinalModalOpen] = useState(false);
    const [hallManagerCode, setHallManagerCode] = useState("");
    const [hallManagerMode, setHallManagerMode] = useState("");
    const [hallManagerTargetId, setHallManagerTargetId] = useState("");
    const [hallManagerTargetIds, setHallManagerTargetIds] = useState([]);
    const [hallManagerForm, setHallManagerForm] = useState(null);
    const [hallPickerField, setHallPickerField] = useState("");

    const hallTeamById = (id) => allTeams.find((team) => team.id === id) || null;

    const sortHallTeams = (teams) => {
        const originalOrder = new Map(allTeams.map((team, index) => [team.id, index]));
        return [...(teams || [])].sort((a, b) => {
            if (hallTeamSortMode === "points") {
                const pointsDifference = (teamRatings?.[b.id] ?? 0) - (teamRatings?.[a.id] ?? 0);
                return pointsDifference || (originalOrder.get(a.id) ?? 0) - (originalOrder.get(b.id) ?? 0);
            }

            if (hallTeamSortMode === "placement") {
                const placementDifference = (rankById?.[a.id] ?? 64) - (rankById?.[b.id] ?? 64);
                return placementDifference || (originalOrder.get(a.id) ?? 0) - (originalOrder.get(b.id) ?? 0);
            }

            return (originalOrder.get(a.id) ?? 0) - (originalOrder.get(b.id) ?? 0);
        });
    };

    const hallTeamPickerValue = (team) => {
        if (hallTeamSortMode === "points") return `${teamRatings?.[team.id] ?? 0}p`;
        if (hallTeamSortMode === "placement") return formatOrdinal(rankById?.[team.id] ?? 64);
        return null;
    };

    const emptyHallPicks = (typeId) =>
        Object.fromEntries((getTournamentTypeConfig(typeId).fields || []).map((field) => [field.key, []]));

    const makeEmptyHallForm = (typeId = "") => ({
        type: typeId,
        number: "",
        needed: "",
        achieved: "",
        picks: emptyHallPicks(typeId),
    });

    const hallRecordToForm = (record) => {
        const typeId = record?.type || TOURNAMENT_TYPES[0].id;
        const ids = (list) => (list || []).map((team) => team?.id).filter(Boolean);
        const restPlaces = (record?.places || [])
            .filter((entry) => entry.place >= 5 && entry.place <= 16)
            .map((entry) => entry.team?.id)
            .filter(Boolean);

        return {
            type: typeId,
            number: String(record?.number ?? ""),
            needed: String(record?.neededPickemPoints ?? ""),
            achieved: String(record?.achievedPickemPoints ?? ""),
            picks: {
                ...emptyHallPicks(typeId),
                stage1: ids(record?.qualifiers?.stage1),
                stage2Auto: ids(record?.qualifiers?.stage2),
                stage3Auto: ids(record?.qualifiers?.stage3),
                stage2All: ids(record?.stages?.stage2?.teams),
                stage3All: ids(record?.stages?.stage3?.teams),
                playoffs: ids(record?.qualifiers?.playoffs),
                winner: record?.results?.winner?.id ? [record.results.winner.id] : [],
                second: record?.results?.runnerUp?.id ? [record.results.runnerUp.id] : [],
                third: record?.results?.thirdPlace?.id ? [record.results.thirdPlace.id] : [],
                fourth: record?.results?.fourthPlace?.id ? [record.results.fourthPlace.id] : [],
                rest: restPlaces,
            },
        };
    };

    const clearHallManagerState = () => {
        setHallManagerCode("");
        setHallManagerMode("");
        setHallManagerTargetId("");
        setHallManagerTargetIds([]);
        setHallManagerForm(null);
        setHallPickerField("");
    };

    const closeHallManagerModals = () => {
        setIsHallManagerCodeModalOpen(false);
        setIsHallManagerModeModalOpen(false);
        setIsHallManagerSelectModalOpen(false);
        setIsHallManagerFormModalOpen(false);
        setIsHallManagerFinalModalOpen(false);
        clearHallManagerState();
    };

    const handleHallManagerClick = () => {
        clearHallManagerState();
        setIsHallManagerCodeModalOpen(true);
    };

    const handleVerifyHallManagerPassword = () => {
        if (!SCOREBOARD_RESET_CODE) {
            toast.error("Reset code is not configured.");
            return;
        }
        if (hallManagerCode !== SCOREBOARD_RESET_CODE) {
            toast.error("WRONG PASSWORD!");
            return;
        }
        toast.success("Password correct!!!");
        setHallManagerCode("");
        setIsHallManagerCodeModalOpen(false);
        setIsHallManagerModeModalOpen(true);
    };

    const handleHallManagerModeConfirm = () => {
        if (!hallManagerMode) return;
        setIsHallManagerModeModalOpen(false);

        if (hallManagerMode === "deleteAll") {
            setIsHallManagerFinalModalOpen(true);
            return;
        }

        if (hallManagerMode === "add") {
            setHallManagerForm(makeEmptyHallForm(""));
            setIsHallManagerFormModalOpen(true);
            return;
        }

        setIsHallManagerSelectModalOpen(true);
    };

    const handleHallManagerSelectConfirm = () => {
        if (hallManagerMode === "delete") {
            if (hallManagerTargetIds.length === 0) return;

            setIsHallManagerSelectModalOpen(false);
            setIsHallManagerFinalModalOpen(true);
            return;
        }

        if (!hallManagerTargetId) return;

        setIsHallManagerSelectModalOpen(false);

        const record = hallOfFame.find((item) => item.id === hallManagerTargetId);
        setHallManagerForm(hallRecordToForm(record));
        setIsHallManagerFormModalOpen(true);
    };

    const HALL_PLACEMENT_KEYS = ["winner", "second", "third", "fourth", "rest"];
    const HALL_SEED_KEYS = ["stage1", "stage2Auto", "stage3Auto"];

    const getHallPickAccess = (form, fieldKey, teamId) => {
        const picks = form?.picks || {};
        const inList = (key) => (picks[key] || []).includes(teamId);

        if (HALL_SEED_KEYS.includes(fieldKey)) {
            const usedElsewhere = HALL_SEED_KEYS.some((key) => key !== fieldKey && (picks[key] || []).includes(teamId));
            return { allowed: !usedElsewhere, locked: false };
        }
        if (fieldKey === "stage2All") {
            if (inList("stage2Auto")) return { allowed: true, locked: true };
            return { allowed: inList("stage1"), locked: false };
        }
        if (fieldKey === "stage3All") {
            if (inList("stage3Auto")) return { allowed: true, locked: true };
            return { allowed: inList("stage2All"), locked: false };
        }
        if (fieldKey === "playoffs") return { allowed: inList("stage3All"), locked: false };
        if (HALL_PLACEMENT_KEYS.includes(fieldKey)) {
            const usedElsewhere = HALL_PLACEMENT_KEYS.some((key) => key !== fieldKey && (picks[key] || []).includes(teamId));
            return { allowed: inList("playoffs") && !usedElsewhere, locked: false };
        }
        return { allowed: true, locked: false };
    };

    const normalizeHallPicks = (picks) => {
        const next = Object.fromEntries(Object.entries(picks).map(([key, value]) => [key, [...(value || [])]]));
        const seedUsed = new Set();
        HALL_SEED_KEYS.forEach((key) => {
            next[key] = (next[key] || []).filter((id) => !seedUsed.has(id));
            next[key].forEach((id) => seedUsed.add(id));
        });
        next.stage2All = [...new Set([...(next.stage2Auto || []), ...(next.stage2All || []).filter((id) => (next.stage1 || []).includes(id))])].slice(0, 32);
        next.stage3All = [...new Set([...(next.stage3Auto || []), ...(next.stage3All || []).filter((id) => next.stage2All.includes(id))])].slice(0, 32);
        next.playoffs = (next.playoffs || []).filter((id) => next.stage3All.includes(id)).slice(0, 16);
        const used = new Set();
        HALL_PLACEMENT_KEYS.forEach((key) => {
            next[key] = (next[key] || []).filter((id) => next.playoffs.includes(id) && !used.has(id));
            next[key].forEach((id) => used.add(id));
            if (key !== "rest") next[key] = next[key].slice(0, 1);
            else next[key] = next[key].slice(0, 12);
        });
        return next;
    };

    const toggleHallPick = (fieldKey, teamId) => {
        setHallManagerForm((prev) => {
            if (!prev) return prev;
            const field = getTournamentTypeConfig(prev.type).fields.find((item) => item.key === fieldKey);
            const current = prev.picks?.[fieldKey] || [];
            const access = getHallPickAccess(prev, fieldKey, teamId);
            if (access.locked) return prev;
            if (!current.includes(teamId) && !access.allowed) return prev;

            let next;
            if (!field?.multi) next = current.includes(teamId) ? [] : [teamId];
            else if (current.includes(teamId)) next = current.filter((id) => id !== teamId);
            else if (field.exactCount && current.length >= field.exactCount) {
                toast.error(`You can only choose ${field.exactCount} teams here.`);
                return prev;
            } else next = [...current, teamId];

            const picks = normalizeHallPicks({ ...prev.picks, [fieldKey]: next });
            return { ...prev, picks };
        });
    };

    const hallPickDragRef = useRef({ active: false, fieldKey: null, mode: null });
    const hallPickClickGuardRef = useRef(null);

    const setHallPickSelected = (fieldKey, teamId, shouldSelect) => {
        setHallManagerForm((prev) => {
            if (!prev) return prev;
            const field = getTournamentTypeConfig(prev.type).fields.find((item) => item.key === fieldKey);
            const current = prev.picks?.[fieldKey] || [];
            if (current.includes(teamId) === shouldSelect) return prev;

            const access = getHallPickAccess(prev, fieldKey, teamId);
            if (access.locked) return prev;
            if (shouldSelect && !access.allowed) return prev;

            let next;
            if (!shouldSelect) next = current.filter((id) => id !== teamId);
            else if (!field?.multi) next = [teamId];
            else if (field.exactCount && current.length >= field.exactCount) return prev;
            else next = [...current, teamId];

            const picks = normalizeHallPicks({ ...prev.picks, [fieldKey]: next });
            return { ...prev, picks };
        });
    };

    const handleHallPickPointerDown = (e, fieldKey, teamId, isSelected) => {
        if (e.pointerType === "touch") return;
        if (e.pointerType === "mouse" && e.button !== 0) return;

        hallPickDragRef.current = {
            active: true,
            fieldKey,
            mode: isSelected ? "remove" : "add",
        };

        hallPickClickGuardRef.current = `${fieldKey}:${teamId}`;
        setHallPickSelected(fieldKey, teamId, !isSelected);
    };

    const handleHallPickPointerEnter = (fieldKey, teamId) => {
        const drag = hallPickDragRef.current;
        if (!drag.active || drag.fieldKey !== fieldKey) return;
        setHallPickSelected(fieldKey, teamId, drag.mode === "add");
    };

    const handleHallPickClick = (fieldKey, teamId) => {
        if (hallPickClickGuardRef.current === `${fieldKey}:${teamId}`) {
            hallPickClickGuardRef.current = null;
            return;
        }
        toggleHallPick(fieldKey, teamId);
    };

    useEffect(() => {
        const endHallPickDrag = () => {
            if (!hallPickDragRef.current.active) return;
            hallPickDragRef.current = { active: false, fieldKey: null, mode: null };
            window.setTimeout(() => {
                hallPickClickGuardRef.current = null;
            }, 0);
        };

        window.addEventListener("pointerup", endHallPickDrag);
        window.addEventListener("pointercancel", endHallPickDrag);

        return () => {
            window.removeEventListener("pointerup", endHallPickDrag);
            window.removeEventListener("pointercancel", endHallPickDrag);
        };
    }, []);

    const canConfirmHallForm = () => {
        const form = hallManagerForm;
        if (!form) return false;
        if (!form.type) return false;
        if (form.number === "" || form.needed === "" || form.achieved === "") return false;
        const needed = Number(form.needed);
        if (!Number.isInteger(needed) || needed < MIN_NEEDED_PICKEM || needed > MAX_NEEDED_PICKEM) return false;

        const fieldsValid = getTournamentTypeConfig(form.type).fields.every((field) => {
            const picked = form.picks?.[field.key] || [];
            if (!field.multi) return picked.length === 1;
            if (field.exactCount) return picked.length === field.exactCount;
            return picked.length > 0;
        });
        if (!fieldsValid) return false;
        const normalized = normalizeHallPicks(form.picks || {});
        if (JSON.stringify(normalized) !== JSON.stringify(form.picks || {})) return false;

        if (hallManagerMode === "edit") {
            const existing = hallOfFame.find((item) => item.id === hallManagerTargetId);
            if (existing) {
                const original = hallRecordToForm(existing);
                return JSON.stringify({
                    ...form,
                    picks: normalizeHallPicks(form.picks || {}),
                }) !== JSON.stringify({
                    ...original,
                    picks: normalizeHallPicks(original.picks || {}),
                });
            }
        }

        return true;
    };

    const hallNeededPointsIsValid = (value) => {
        const number = Number(value);
        return Number.isInteger(number) && number >= MIN_NEEDED_PICKEM && number <= MAX_NEEDED_PICKEM;
    };

    const handleHallNeededPointsChange = (value) => {
        const digits = value.replace(/[^0-9]/g, "");
        if (digits && Number(digits) > MAX_NEEDED_PICKEM) {
            toast.error("This is higher than the limit");
            return;
        }
        setHallManagerForm((prev) => ({ ...prev, needed: digits }));
    };

    const handleHallNeededPointsBlur = () => {
        const value = hallManagerForm?.needed;
        if (value !== "" && Number(value) < MIN_NEEDED_PICKEM) {
            toast.error("This is lower than the limit");
            setHallManagerForm((prev) => ({ ...prev, needed: "" }));
        }
    };

    const hallFormFieldIsComplete = (field) => {
        const picked = hallManagerForm?.picks?.[field.key] || [];
        if (!field.multi) return picked.length === 1;
        if (field.exactCount) return picked.length === field.exactCount;
        return picked.length > 0;
    };

    const hallFormFieldIsUnlocked = (fieldIndex) => {
        const form = hallManagerForm;
        if (!form?.type || form.number === "" || !hallNeededPointsIsValid(form.needed) || form.achieved === "") return false;
        const fields = getTournamentTypeConfig(form.type).fields;
        return fields.slice(0, fieldIndex).every(hallFormFieldIsComplete);
    };

    const buildHallRecordFromForm = (existing) => {
        const form = hallManagerForm;
        const teams = (key) => (form.picks?.[key] || []).map(hallTeamById).filter(Boolean);
        const single = (key) => teams(key)[0] || null;

        const results = {
            winner: single("winner"),
            runnerUp: single("second"),
            thirdPlace: single("third"),
            fourthPlace: single("fourth"),
        };

        const restTeams = teams("rest");
        const places = [
            results.winner,
            results.runnerUp,
            results.thirdPlace,
            results.fourthPlace,
            ...restTeams,
        ].filter(Boolean).map((team, index) => ({ place: index + 1, team }));

        const needed = parseInt(form.needed, 10) || 0;
        const achieved = parseInt(form.achieved, 10) || 0;
        const number = parseInt(form.number, 10) || 0;

        return {
            id: existing?.id || `${form.type.toLowerCase()}-${number}-${Date.now()}`,
            type: form.type,
            number,
            finishedAt: existing?.finishedAt || new Date().toISOString(),
            neededPickemPoints: needed,
            achievedPickemPoints: achieved,
            pickemWon: achieved >= needed,
            custom: existing ? (existing.custom ?? false) : true,
            results,
            places,
            qualifiers: {
                stage1: teams("stage1"),
                stage2: teams("stage2Auto"),
                stage3: teams("stage3Auto"),
                playoffs: teams("playoffs"),
            },
            stages: {
                stage2: { teams: teams("stage2All") },
                stage3: { teams: teams("stage3All") },
            },
            playoffs: existing?.playoffs || {},
        };
    };

    const handleHallManagerFormConfirm = () => {
        if (!canConfirmHallForm()) return;
        setIsHallManagerFormModalOpen(false);
        setIsHallManagerFinalModalOpen(true);
    };

    const handleHallManagerFinalConfirm = () => {
        if (hallManagerMode === "deleteAll") {
            clearHallOfFameStore()
                .then(() => {
                    setHallOfFame([]);
                    setSelectedHallTournament(null);
                    toast.success("The whole Hall of Fame has been wiped.");
                })
                .catch(() => toast.error("Couldn't wipe the Hall of Fame."));
            closeHallManagerModals();
            return;
        }

        if (hallManagerMode === "delete") {
            const ids = [...hallManagerTargetIds];
            const idSet = new Set(ids);

            Promise.all(ids.map((id) => deleteHallTournament(id)))
                .then(() => {
                    setHallOfFame((prev) =>
                        prev.filter((item) => !idSet.has(item.id))
                    );

                    setSelectedHallTournament((prev) =>
                        prev && idSet.has(prev.id) ? null : prev
                    );

                    toast.success(
                        ids.length === 1
                            ? "Tournament deleted from the Hall of Fame."
                            : `${ids.length} tournaments deleted from the Hall of Fame.`
                    );
                })
                .catch(() =>
                    toast.error("Couldn't delete the selected tournaments.")
                );

            closeHallManagerModals();
            return;
        }

        const existing = hallManagerMode === "edit"
            ? hallOfFame.find((item) => item.id === hallManagerTargetId)
            : null;
        const record = buildHallRecordFromForm(existing);

        saveHallTournament(record)
            .then(() => {
                setHallOfFame((prev) => {
                    const without = prev.filter((item) => item.id !== record.id);
                    return sortHallOfFame([record, ...without]);
                });
                setSelectedHallTournament((prev) => (prev?.id === record.id ? record : prev));
                toast.success(hallManagerMode === "edit"
                    ? "Tournament updated."
                    : "Tournament added to the Hall of Fame.");
            })
            .catch(() => toast.error("Couldn't save this tournament."));

        closeHallManagerModals();
    };

    return {
        isHallManagerButtonArmed,
        setIsHallManagerButtonArmed,
        handleHallManagerClick,
        hallManagerForm,
        isHallManagerCodeModalOpen,
        hallManagerCode,
        closeHallManagerModals,
        handleVerifyHallManagerPassword,
        isHallManagerModeModalOpen,
        hallManagerMode,
        handleHallManagerModeConfirm,
        isHallManagerSelectModalOpen,
        hallManagerTargetId,
        hallManagerTargetIds,
        handleHallManagerSelectConfirm,
        isHallManagerFormModalOpen,
        canConfirmHallForm,
        handleHallManagerFormConfirm,
        isHallManagerFinalModalOpen,
        handleHallManagerFinalConfirm,
        setHallManagerCode,
        setHallManagerMode,
        setHallManagerTargetIds,
        setHallManagerTargetId,
        setHallManagerForm,
        setHallPickerField,
        emptyHallPicks,
        hallNeededPointsIsValid,
        handleHallNeededPointsBlur,
        handleHallNeededPointsChange,
        hallFormFieldIsUnlocked,
        hallPickerField,
        sortHallTeams,
        hallTeamById,
        getHallPickAccess,
        hallTeamPickerValue,
        handleHallPickPointerDown,
        handleHallPickPointerEnter,
        handleHallPickClick,
    };
}
