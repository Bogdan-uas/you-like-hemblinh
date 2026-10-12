import { useState, useEffect } from "react";
import { readHallOfFame } from "../logic/hallOfFameDb.js";
import { HALL_TEAM_SORT_LS_KEY } from "../logic/storageKeys.js";

export function useHallOfFame() {
    const [isHallOfFameOpen, setIsHallOfFameOpen] = useState(false);
    const [hallOfFame, setHallOfFame] = useState([]);
    const [selectedHallTournament, setSelectedHallTournament] = useState(null);
    const [hallQualifierGroup, setHallQualifierGroup] = useState("A");
    const [hallStage1Group, setHallStage1Group] = useState("A");
    const [hallPendingScroll, setHallPendingScroll] = useState(null);
    const [hallTeamSortMode, setHallTeamSortModeState] = useState(() => {
        try {
            const saved = localStorage.getItem(HALL_TEAM_SORT_LS_KEY);
            return ["colors", "points", "placement"].includes(saved) ? saved : "colors";
        } catch {
            return "colors";
        }
    });
    const [selectedHallMatch, setSelectedHallMatch] = useState(null);

    useEffect(() => {
        readHallOfFame()
            .then(setHallOfFame)
            .catch((error) => console.warn("Hall of Fame could not be loaded:", error));
    }, []);

    const closeHallOfFame = () => {
        setIsHallOfFameOpen(false);
        setSelectedHallTournament(null);
        setSelectedHallMatch(null);
    };

    const setHallTeamSortMode = (mode) => {
        if (!["colors", "points", "placement"].includes(mode)) return;
        setHallTeamSortModeState(mode);
        try {
            localStorage.setItem(HALL_TEAM_SORT_LS_KEY, mode);
        } catch {
            /* ignore */
        }
    };

    const openLinkedHallRecord = (record, scrollToSection = null) => {
        setHallQualifierGroup("A");
        setHallStage1Group("A");
        setSelectedHallTournament(record);
        setHallPendingScroll(scrollToSection ?? "top");
    };

    return {
        selectedHallMatch,
        isHallOfFameOpen,
        setSelectedHallMatch,
        setHallOfFame,
        setIsHallOfFameOpen,
        hallOfFame,
        hallTeamSortMode,
        setSelectedHallTournament,
        hallPendingScroll,
        selectedHallTournament,
        setHallPendingScroll,
        setHallQualifierGroup,
        setHallStage1Group,
        closeHallOfFame,
        hallStage1Group,
        hallQualifierGroup,
        openLinkedHallRecord,
        setHallTeamSortMode,
    };
}
