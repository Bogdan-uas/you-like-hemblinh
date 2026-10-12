import { useState } from "react";
import toast from "../logic/renderSafeToast.js";
import { SCOREBOARD_RESET_CODE } from "../logic/storageKeys.js";
import { TOURNAMENT_TYPES } from "../logic/tournamentTypes.jsx";

export function useTournamentNumberAdmin({ getTypeNumber, setTypeNumber }) {
    const [isTournamentNumberCodeModalOpen, setIsTournamentNumberCodeModalOpen] = useState(false);
    const [isTournamentNumberModalOpen, setIsTournamentNumberModalOpen] = useState(false);
    const [isTournamentNumberFinalModalOpen, setIsTournamentNumberFinalModalOpen] = useState(false);
    const [tournamentNumberCode, setTournamentNumberCode] = useState("");
    const [tournamentNumberMode, setTournamentNumberMode] = useState("add");
    const [tournamentNumberAmount, setTournamentNumberAmount] = useState("");
    const [isTournamentNumberButtonArmed, setIsTournamentNumberButtonArmed] = useState(false);
    const [isTournamentNumberTypeModalOpen, setIsTournamentNumberTypeModalOpen] = useState(false);
    const [tournamentNumberType, setTournamentNumberType] = useState("");

    const clearTournamentNumberAdminState = () => {
        setTournamentNumberCode("");
        setTournamentNumberMode("add");
        setTournamentNumberAmount("");
    };

    const handleTournamentNumberClick = () => {
        clearTournamentNumberAdminState();
        setIsTournamentNumberCodeModalOpen(true);
    };

    const handleCloseTournamentNumberModals = () => {
        setIsTournamentNumberTypeModalOpen(false);
        setTournamentNumberType("");
        setIsTournamentNumberCodeModalOpen(false);
        setIsTournamentNumberModalOpen(false);
        setIsTournamentNumberFinalModalOpen(false);
        clearTournamentNumberAdminState();
    };

    const handleVerifyTournamentNumberPassword = () => {
        if (!SCOREBOARD_RESET_CODE) {
            toast.error("Reset code is not configured.");
            return;
        }
        if (tournamentNumberCode !== SCOREBOARD_RESET_CODE) {
            toast.error("WRONG PASSWORD!");
            return;
        }
        toast.success("Password correct!!!");
        setTournamentNumberCode("");
        setIsTournamentNumberCodeModalOpen(false);
        setIsTournamentNumberTypeModalOpen(true);
    };

    const activeNumberType = tournamentNumberType || TOURNAMENT_TYPES[0].id;

    const getNextTournamentNumber = () => {
        const current = getTypeNumber(activeNumberType);
        const amount = parseInt(tournamentNumberAmount, 10);
        if (!Number.isFinite(amount)) return current;

        if (tournamentNumberMode === "add")
            return current + amount;

        if (tournamentNumberMode === "subtract")
            return current - amount;

        return amount;
    };

    const handleSubmitTournamentNumber = () => {
        const amount = parseInt(tournamentNumberAmount, 10);
        if (!Number.isFinite(amount)) {
            toast.error("Put in a number first.");
            return;
        }
        setIsTournamentNumberModalOpen(false);
        setIsTournamentNumberFinalModalOpen(true);
    };

    const handleConfirmTournamentNumber = () => {
        const next = getNextTournamentNumber();
        setTypeNumber(activeNumberType, next);
        setIsTournamentNumberFinalModalOpen(false);
        setIsTournamentNumberTypeModalOpen(false);
        setTournamentNumberType("");
        clearTournamentNumberAdminState();
        toast.success(`Tournament number is now #${next}.`);
    };

    return {
        isTournamentNumberCodeModalOpen,
        isTournamentNumberTypeModalOpen,
        isTournamentNumberModalOpen,
        isTournamentNumberFinalModalOpen,
        setIsTournamentNumberButtonArmed,
        isTournamentNumberButtonArmed,
        handleTournamentNumberClick,
        tournamentNumberCode,
        handleCloseTournamentNumberModals,
        handleVerifyTournamentNumberPassword,
        tournamentNumberType,
        activeNumberType,
        tournamentNumberMode,
        tournamentNumberAmount,
        handleSubmitTournamentNumber,
        handleConfirmTournamentNumber,
        setTournamentNumberCode,
        setTournamentNumberType,
        setIsTournamentNumberTypeModalOpen,
        setIsTournamentNumberModalOpen,
        setTournamentNumberMode,
        setTournamentNumberAmount,
    };
}
