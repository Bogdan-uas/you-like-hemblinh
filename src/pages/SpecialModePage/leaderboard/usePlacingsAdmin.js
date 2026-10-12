import { useState, useMemo, useEffect } from "react";
import toast from "../logic/renderSafeToast.js";
import { EMPTY_TEAM_PLACINGS, saveTeamPlacings } from "../logic/placings.jsx";
import { SCOREBOARD_RESET_CODE } from "../logic/storageKeys.js";
import { saveTeamRatings } from "../logic/teamData.js";

export function usePlacingsAdmin({
    teamPlacings,
    isLeaderboardOpen,
    setLeaderboardStatsTab,
    allTeams,
    setTeamPlacings,
    setTeamRatings,
    teamRatingsRef,
    leaderboard,
    teamRatings,
}) {
    const [isAddPlacingsCodeModalOpen, setIsAddPlacingsCodeModalOpen] = useState(false);
    const [isAddPlacingsModalOpen, setIsAddPlacingsModalOpen] = useState(false);
    const [isAddPlacingsFinalModalOpen, setIsAddPlacingsFinalModalOpen] = useState(false);

    const [isRemovePlacingsCodeModalOpen, setIsRemovePlacingsCodeModalOpen] = useState(false);
    const [isRemovePlacingsModalOpen, setIsRemovePlacingsModalOpen] = useState(false);
    const [isRemovePlacingsFinalModalOpen, setIsRemovePlacingsFinalModalOpen] = useState(false);

    const [placingsAdminCode, setPlacingsAdminCode] = useState("");

    const [selectedPlacingTeamIds, setSelectedPlacingTeamIds] = useState([]);

    const [placingCategory, setPlacingCategory] = useState("");
    const [placingAmount, setPlacingAmount] = useState("");

    const hasAnyPlacings = useMemo(() => {
        const vals = Object.values(teamPlacings ?? {});
        return vals.some((p) => Object.keys(EMPTY_TEAM_PLACINGS).some((key) => (p?.[key] ?? 0) > 0));
    }, [teamPlacings]);

    const [arePlacingButtonsArmed, setArePlacingButtonsArmed] = useState(false);

    useEffect(() => {
        if (!isLeaderboardOpen) {
            setArePlacingButtonsArmed(false);
            setLeaderboardStatsTab(0);
        }
    }, [isLeaderboardOpen, setLeaderboardStatsTab]);

    const handleAddPlacingsClick = () => {
        if (!arePlacingButtonsArmed) {
            setArePlacingButtonsArmed(true);
            return;
        }
        setIsAddPlacingsCodeModalOpen(true);
    };

    const handleRemovePlacingsClick = () => {
        if (!hasAnyPlacings) return;
        if (!arePlacingButtonsArmed) {
            setArePlacingButtonsArmed(true);
            return;
        }
        setIsRemovePlacingsCodeModalOpen(true);
    };

    const allTeamIds = allTeams.map(t => t.id);

    const allSelected =
        selectedPlacingTeamIds.length === allTeamIds.length && allTeamIds.length > 0;

    const hasAnySelected = selectedPlacingTeamIds.length > 0;

    const clearPlacingsAdminState = () => {
        setPlacingsAdminCode("");
        setSelectedPlacingTeamIds([]);
        setPlacingCategory("");
        setPlacingAmount("");
    };

    const verifyAdminCodeOrToast = () => {
        if (!SCOREBOARD_RESET_CODE) {
            toast.error("Reset code is not configured.");
            return false;
        }
        if (placingsAdminCode !== SCOREBOARD_RESET_CODE) {
            toast.error("WRONG PASSWORD!");
            return false;
        }
        toast.success("Password correct!!!");
        return true;
    };

    const handleVerifyAddPlacingsPassword = () => {
        if (!verifyAdminCodeOrToast()) return;
        setIsAddPlacingsCodeModalOpen(false);
        setPlacingsAdminCode("");
        setIsAddPlacingsModalOpen(true);
    };

    const toggleTeamSelection = (id) => {
        setSelectedPlacingTeamIds(prev =>
            prev.includes(id)
                ? prev.filter(tid => tid !== id)
                : [...prev, id]
        );
    };

    const canConfirmPlacings = () => {
        const n = Number(placingAmount);

        return (
            !!selectedPlacingTeamIds.length &&
            (
                Object.hasOwn(EMPTY_TEAM_PLACINGS, placingCategory) ||
                placingCategory === "points"
            ) &&
            Number.isFinite(n) &&
            n > 0
        );
    };

    const canSelectAllPlacings =
        placingCategory &&
        placingCategory === "" &&
        placingAmount &&
        selectedPlacingTeamIds.length > 0 &&
        !allSelected;

    const handleOpenAddPlacingsFinal = () => {
        if (!canConfirmPlacings()) return;
        setIsAddPlacingsModalOpen(false);
        setIsAddPlacingsFinalModalOpen(true);
    };

    const handleApplyAddPlacings = () => {
        const n = Math.max(0, Math.floor(Number(placingAmount)));
        const teamIds = selectedPlacingTeamIds;
        const cat = placingCategory;

        if (cat === "points") {
            setTeamRatings((prev) => {
                const next = { ...prev };

                teamIds.forEach((id) => {
                    next[id] = (next[id] ?? 0) + n;
                });

                saveTeamRatings(next);
                teamRatingsRef.current = next;
                return next;
            });

            setIsAddPlacingsFinalModalOpen(false);
            clearPlacingsAdminState();
            toast.success("Points updated.");
            return;
        }

        setTeamPlacings((prev) => {
            const next = { ...prev };

            teamIds.forEach((id) => {
                const cur = next[id] ?? { ...EMPTY_TEAM_PLACINGS };

                next[id] = {
                    ...cur,
                    [cat]: (cur[cat] ?? 0) + n,
                };
            });

            saveTeamPlacings(next);
            return next;
        });

        setIsAddPlacingsFinalModalOpen(false);
        clearPlacingsAdminState();
        toast.success("Placings updated.");
    };

    const handleVerifyRemovePlacingsPassword = () => {
        if (!verifyAdminCodeOrToast()) return;
        setIsRemovePlacingsCodeModalOpen(false);
        setPlacingsAdminCode("");
        setIsRemovePlacingsModalOpen(true);
    };

    const getTeamsForRemovePicker = () => {
        if (!placingCategory) return [];

        return leaderboard.sorted.filter((t) => {
            const p = teamPlacings?.[t.id];

            if (Object.hasOwn(EMPTY_TEAM_PLACINGS, placingCategory)) return (p?.[placingCategory] ?? 0) > 0;
            if (placingCategory === "points") return (teamRatings?.[t.id] ?? 0) > 0;

            return false;
        });
    };

    const handleOpenRemovePlacingsFinal = () => {
        if (!canConfirmPlacings()) return;
        setIsRemovePlacingsModalOpen(false);
        setIsRemovePlacingsFinalModalOpen(true);
    };

    const handleApplyRemovePlacings = () => {
        const n = Math.max(0, Math.floor(Number(placingAmount)));
        const teamIds = selectedPlacingTeamIds;
        const cat = placingCategory;

        if (cat === "points") {
            setTeamRatings((prev) => {
                const next = { ...prev };

                teamIds.forEach((id) => {
                    next[id] = Math.max(0, (next[id] ?? 0) - n);
                });

                saveTeamRatings(next);
                teamRatingsRef.current = next;
                return next;
            });

            setIsRemovePlacingsFinalModalOpen(false);
            clearPlacingsAdminState();
            toast.success("Points updated.");
            return;
        }

        setTeamPlacings((prev) => {
            const next = { ...prev };

            teamIds.forEach((id) => {
                const cur = next[id] ?? { ...EMPTY_TEAM_PLACINGS };

                next[id] = {
                    ...cur,
                    [cat]: Math.max(0, (cur[cat] ?? 0) - n),
                };
            });

            saveTeamPlacings(next);
            return next;
        });

        setIsRemovePlacingsFinalModalOpen(false);
        clearPlacingsAdminState();
        toast.success("Placings updated.");
    };

    return {
        isAddPlacingsCodeModalOpen,
        isAddPlacingsModalOpen,
        isAddPlacingsFinalModalOpen,
        isRemovePlacingsCodeModalOpen,
        isRemovePlacingsModalOpen,
        isRemovePlacingsFinalModalOpen,
        handleAddPlacingsClick,
        handleRemovePlacingsClick,
        arePlacingButtonsArmed,
        hasAnyPlacings,
        placingCategory,
        setSelectedPlacingTeamIds,
        allTeamIds,
        placingsAdminCode,
        handleVerifyAddPlacingsPassword,
        canSelectAllPlacings,
        allSelected,
        hasAnySelected,
        placingAmount,
        canConfirmPlacings,
        handleOpenAddPlacingsFinal,
        handleApplyAddPlacings,
        handleVerifyRemovePlacingsPassword,
        getTeamsForRemovePicker,
        handleOpenRemovePlacingsFinal,
        handleApplyRemovePlacings,
        setPlacingsAdminCode,
        setIsAddPlacingsCodeModalOpen,
        clearPlacingsAdminState,
        selectedPlacingTeamIds,
        toggleTeamSelection,
        setPlacingCategory,
        setPlacingAmount,
        setIsAddPlacingsModalOpen,
        setIsAddPlacingsFinalModalOpen,
        setIsRemovePlacingsCodeModalOpen,
        setIsRemovePlacingsModalOpen,
        setIsRemovePlacingsFinalModalOpen,
    };
}
