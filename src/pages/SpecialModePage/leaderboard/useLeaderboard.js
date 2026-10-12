import { useState, useRef, useCallback, useMemo, useLayoutEffect, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { loadLeaderboardSortMode, LEADERBOARD_SORT_VALUES, saveLeaderboardSortMode, DEFAULT_LEADERBOARD_SORT, sortLeaderboardTeams, LEADERBOARD_RESHUFFLE_MS, LEADERBOARD_RESHUFFLE_EASING } from "../logic/teamData.js";
import { STAT_TABS } from "../logic/teamStats.js";
import { normalizeTournamentRef } from "../logic/tournamentTypes.jsx";
import { loadLeaderboardDividerSet, saveLeaderboardDividerSet } from "../logic/leaderboardDividers.js";

export function useLeaderboard({
    leaderboard,
    allTeams,
    teamRatings,
    teamPlacings,
    teamStats,
    lenisRef,
    tournamentResults,
    hallOfFame,
    pickemSummarySeen,
}) {
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [hoveredLeaderboardTeam, setHoveredLeaderboardTeam] = useState(null);
    const [leaderboardStatsTab, setLeaderboardStatsTab] = useState(0);

    const cycleLeaderboardStatsTab = (direction) => {
        setLeaderboardStatsTab((cur) => (cur + direction + STAT_TABS.length) % STAT_TABS.length);
    };
    const leaderboardCursorRef = useRef({ x: 0, y: 0 });

    const [leaderboardSortMode, setLeaderboardSortModeState] = useState(loadLeaderboardSortMode);
    const [leaderboardDividerSet, setLeaderboardDividerSet] = useState(loadLeaderboardDividerSet);

    const setLeaderboardSortMode = useCallback((mode) => {
        if (!LEADERBOARD_SORT_VALUES.includes(mode)) return;
        setLeaderboardSortModeState(mode);
        saveLeaderboardSortMode(mode);
    }, []);

    const leaderboardDisplayOrder = useMemo(() => {
        if (leaderboardSortMode === DEFAULT_LEADERBOARD_SORT) return leaderboard.sorted;
        return sortLeaderboardTeams(allTeams, {
            mode: leaderboardSortMode,
            ratings: teamRatings,
            placings: teamPlacings,
            stats: teamStats,
        });
    }, [leaderboardSortMode, leaderboard, allTeams, teamRatings, teamPlacings, teamStats]);

    const reduceLeaderboardMotion = useReducedMotion();
    const leaderboardListRef = useRef(null);
    const leaderboardRowNodesRef = useRef(new Map());
    const leaderboardRowRefCallbacksRef = useRef(new Map());
    const leaderboardRowAnimationsRef = useRef(new Map());
    const leaderboardDividerAnimationsRef = useRef([]);
    const leaderboardReshuffleFromRef = useRef(null);

    const getLeaderboardRowRef = (id) => {
        const callbacks = leaderboardRowRefCallbacksRef.current;
        if (!callbacks.has(id)) {
            callbacks.set(id, (node) => {
                if (node) leaderboardRowNodesRef.current.set(id, node);
                else leaderboardRowNodesRef.current.delete(id);
            });
        }
        return callbacks.get(id);
    };

    const handleLeaderboardSortChange = (mode) => {
        if (mode === leaderboardSortMode) return;

        if (!reduceLeaderboardMotion) {
            const from = new Map();
            leaderboardRowNodesRef.current.forEach((node, id) => {
                from.set(id, node.getBoundingClientRect());
            });
            leaderboardReshuffleFromRef.current = from;
        }

        setLeaderboardSortMode(mode);
    };

    const captureLeaderboardRows = () => {
        if (reduceLeaderboardMotion) return;
        const from = new Map();
        leaderboardRowNodesRef.current.forEach((node, id) => {
            from.set(id, node.getBoundingClientRect());
        });
        leaderboardReshuffleFromRef.current = from;
    };

    const handleLeaderboardDividersChange = (value) => {
        if (value === leaderboardDividerSet) return;
        captureLeaderboardRows();
        setLeaderboardDividerSet(value);
        saveLeaderboardDividerSet(value);
    };

    useLayoutEffect(() => {
        const from = leaderboardReshuffleFromRef.current;
        if (!from) return;
        leaderboardReshuffleFromRef.current = null;

        const rowAnimations = leaderboardRowAnimationsRef.current;
        rowAnimations.forEach((animation) => animation.cancel());
        rowAnimations.clear();
        leaderboardDividerAnimationsRef.current.forEach((animation) => animation.cancel());
        leaderboardDividerAnimationsRef.current = [];

        const moves = [];
        leaderboardRowNodesRef.current.forEach((node, id) => {
            const start = from.get(id);
            if (!start || typeof node.animate !== "function") return;

            const end = node.getBoundingClientRect();
            const dx = (start.left + start.width / 2) - (end.left + end.width / 2);
            const dy = (start.top + start.height / 2) - (end.top + end.height / 2);
            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

            moves.push({ id, node, dx, dy });
        });

        moves.forEach(({ id, node, dx, dy }) => {
            const animation = node.animate(
                [
                    { transform: `translate(${dx}px, ${dy}px)` },
                    { transform: "translate(0px, 0px)" },
                ],
                { duration: LEADERBOARD_RESHUFFLE_MS, easing: LEADERBOARD_RESHUFFLE_EASING, composite: "add" }
            );
            rowAnimations.set(id, animation);
            animation.onfinish = () => {
                if (rowAnimations.get(id) === animation) rowAnimations.delete(id);
            };
        });

        if (leaderboardSortMode === DEFAULT_LEADERBOARD_SORT) {
            leaderboardListRef.current?.querySelectorAll("[data-leaderboard-divider]").forEach((node) => {
                if (typeof node.animate !== "function") return;
                leaderboardDividerAnimationsRef.current.push(
                    node.animate([{ opacity: 0 }, { opacity: 1 }], {
                        duration: 300,
                        delay: LEADERBOARD_RESHUFFLE_MS * 0.55,
                        easing: "ease-out",
                        fill: "backwards",
                    })
                );
            });
        }
    }, [leaderboardSortMode, leaderboardDisplayOrder, leaderboardDividerSet]);

    useEffect(() => {
        if (!isLeaderboardOpen) return undefined;
        const resize = () => lenisRef.current?.resize();
        const frameId = requestAnimationFrame(resize);
        const timeoutId = setTimeout(resize, LEADERBOARD_RESHUFFLE_MS + 100);
        return () => {
            cancelAnimationFrame(frameId);
            clearTimeout(timeoutId);
        };
    }, [isLeaderboardOpen, leaderboardSortMode, leaderboardDisplayOrder, leaderboardDividerSet, lenisRef]);

    const finishedTournamentRef = tournamentResults
        ? normalizeTournamentRef(tournamentResults.tournament)
        : null;
    const finishedIsQualifier = tournamentResults?.kind === "pemQualifier";
    const isFinishedTournamentRecord = (record) =>
        !!finishedTournamentRef &&
        record.type === finishedTournamentRef.type &&
        record.number === finishedTournamentRef.number &&
        (record.event === "qualifier") === finishedIsQualifier;
    const latestHallTournament = hallOfFame.find((record) => pickemSummarySeen || !isFinishedTournamentRecord(record));

    const leaderboardTitleTournament = finishedTournamentRef && pickemSummarySeen
        ? { ...finishedTournamentRef, qualifier: finishedIsQualifier }
        : latestHallTournament
            ? { type: latestHallTournament.type, number: latestHallTournament.number, qualifier: latestHallTournament.event === "qualifier" }
            : null;

    return {
        isLeaderboardOpen,
        setIsLeaderboardOpen,
        setLeaderboardStatsTab,
        leaderboardSortMode,
        handleLeaderboardSortChange,
        leaderboardDividerSet,
        handleLeaderboardDividersChange,
        leaderboardTitleTournament,
        leaderboardListRef,
        leaderboardDisplayOrder,
        hoveredLeaderboardTeam,
        leaderboardCursorRef,
        leaderboardStatsTab,
        getLeaderboardRowRef,
        setHoveredLeaderboardTeam,
        cycleLeaderboardStatsTab,
    };
}
