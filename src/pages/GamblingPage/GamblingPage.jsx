import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CountUp from "react-countup";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { randomUniform, randomNormal } from "d3-random";
import css from "./GamblingPage.module.css";
import loaderCss from "../../components/Loader/Loader.module.css";

const DelayedMount = ({ delay, children }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(timeout);
    }, [delay]);

    return show ? children : null;
};

const STORAGE_KEY = "gamblingGameState";

const DIFFICULTIES = {
    Easy: {
        start: [500, 1000],
        goal: [7000, 10000],
        multiplier: [0.3, 3.0],
    },
    Normal: {
        start: [300, 700],
        goal: [10000, 20000],
        multiplier: [0.1, 3.0],
    },
    Hard: {
        start: [100, 400],
        goal: [15000, 30000],
        multiplier: [0.05, 2.0],
        jackpot: { chance: 0.003, range: [4, 10] },
    },
    Impossible: {
        start: [100, 250],
        goal: [15000, 30000],
        multiplier: [0, 2.0],
        unstableMin: true,
        jackpot: { chance: 0.004, range: [10, 14] },
    },
    "LUCK GOD": {
        start: [25, 25],
        goal: [50000, 100000],
        multiplier: [0, 2.0],
        unstableMin: true,
        jackpot: { chance: 0.006, range: [5, 20] },
        superjackpot: { chance: 0.002, range: [30, 100] },
    },
    "Eternal Madness": {
        start: [25, 100],
        goal: [500000, 999999999999999e+6],
        multiplier: [0, 2.0],
        unstableMin: true,
        jackpot: { chance: 0.01, range: [10, 50] },
        superjackpot: { chance: 0.005, range: [75, 200] },
    },
};

const DIFFICULTY_END_MESSAGES = {
    Easy: {
        win: "You made it through Easy mode! 🎉",
        lose: "Easy mode defeated you...😢 Go get better luck!",
    },
    Normal: {
        win: "Well done! Normal mode conquered! 🎯",
        lose: "Normal mode has bested you… 😢",
    },
    Hard: {
        win: "Impressive! You survived Hard mode! 💪",
        lose: "Hard mode crushed you…💀 That's why it's hard!",
    },
    Impossible: {
        win: "Legendary! You beat Impossible mode! 🏆",
        lose: "Impossible mode was… well, impossible 😵",
    },
    "LUCK GOD": {
        win: "OMG! You are truly a LUCK GOD! 🌈💥",
        lose: "Even a LUCK GOD can fall… 😭",
    },
    "Eternal Madness": {
        win: "Yoooo! You are a real grinder! 😵",
        lose: "That's not that bad! 😜",
    },
};

const SUGGESTIONS = {
    Easy: {
        win: "Go try Normal then!",
        lose: "Retry Easy to improve your luck and then go to Normal!",
    },
    Normal: {
        win: "Nice! Try Hard next!",
        lose: "Retry Normal to be able to proceed with next difficulties!",
    },
    Hard: {
        win: "Impressive! Maybe Impossible is next?",
        lose: "Retry!",
    },
    Impossible: {
        win: "Legendary! Feeling lucky for LUCK GOD?",
        lose: "Retry Impossible, if you want to be able to beat LUCK GOD next!",
    },
    "LUCK GOD": {
        win: "Maybe try again LUCK GOD? You may receive harder numbers to achieve! 🌈💥",
        lose: "Even a LUCK GOD can fall… 😭 Try again!",
    },
    "Eternal Madness": {
        win: "Go try again and you may receive even crazier numbers!",
        lose: "You can try again and maybe succeed?! 😏",
    },
};

const DIFFICULTY_LOADING_MESSAGES = {
    Easy: [
        "Rolling nice and easy... 🍃",
        "Luck feels chill today... 🌤️",
        "A calm spin of chance... 🍀",
        "Taking it slow and lucky... ☕",
        "RNG is feeling kind... 😌",
        "A gentle roll begins... 🎲",
        "The breeze carries your luck... 🌬️",
        "Soft spin, soft heart... 💫",
        "No pressure — just vibes... 😎",
        "A peaceful roll of fate... 🌈",
        "Even fortune's relaxing... 💤",
        "You could nap through this roll... 😴",
    ],

    Normal: [
        "Crunching the odds... ⚙️",
        "Building up some tension... 😬",
        "Balancing chance and chaos... ⚖️",
        "A fair roll is coming... 🎯",
        "Let's see what fate decides... 📜",
        "The wheel of luck spins on... 🎡",
        "Just another day with destiny... 🌠",
        "Everything feels... unpredictable. 🎲",
        "Steady spin, steady heart... 💭",
        "Luck and logic meet halfway... 🤝",
        "Fate checks your patience... ⏳",
        "Your destiny's being calculated... 💫",
    ],

    Hard: [
        "Hold steady... 🔥",
        "The odds look rough... 💀",
        "RNG is in a bad mood... 🌑",
        "Chaos stirs behind the numbers... 🌪️",
        "Your nerve's being tested... 🗡️",
        "Brace yourself, this could hurt... 🧱",
        "A real challenge rolls in... ⚔️",
        "The gamble gets serious... 🧨",
        "Courage over comfort... 💪",
        "Hope is your only strategy... 🙃",
        "Fate sharpens its claws... 🐉",
        "Ready to defy the odds? 🎰",
    ],

    Impossible: [
        "Reality starts to twist... 🌀",
        "Logic takes a break... 🔮",
        "The void hums quietly... 🕳️",
        "Luck won't save you now... 🙏😅",
        "You're entering pure chaos... 🚫",
        "Fate's rules don't apply here... 🧩",
        "Just spin and hope for the best... 🌪️",
        "The laws of chance crumble... ⚡",
        "You've stepped off the edge... 💀",
        "Impossible odds — perfect timing... 😈",
        "Even reality hesitates... 🌘",
        "The universe flips a coin... 🪙",
    ],

    "LUCK GOD": [
        "Luck itself wakes up... 🌈💥",
        "The universe leans your way... 🪄",
        "Fortune whispers your name... ⚡",
        "The divine wheel turns... 🌀",
        "Cosmic luck joins your side... 💫",
        "The stars cheer you on... ✨",
        "You're glowing with pure chance... 🔥",
        "Destiny kneels before you... 👑",
        "Even fate applauds... 🌟",
        "You're the chosen roller... 🌠",
        "Miracles line up in your favor... 💎",
        "The cosmos smiles at your gamble... 🌌",
    ],

    "Eternal Madness": [
        "Sanity drifts away... 😵‍💫",
        "Madness begins its dance... 🔥",
        "The abyss rolls for you... 🌌",
        "Order has left the building... 🕳️",
        "Even gods look away... ⚠️",
        "You spin beyond reason... 🌀",
        "The edge of chaos awaits... 💀",
        "The void whispers your name... 👁️",
        "Nothing makes sense anymore... 🌀",
        "You laugh as fate screams... 🤪",
        "Welcome to endless chaos... 🧠",
        "The dice have lost their minds... 🎲💫",
    ],
};

const SERIES_REWARDS_BO1 = {
    "1-0": +100,
    "0-1": -30,
};

const SERIES_REWARDS_BO3 = {
    "2-0": +300,
    "2-1": +200,
    "1-2": -40,
    "0-2": -65,
};

const SERIES_REWARDS_BO5_LUCKGOD = {
    "3-0": +300,
    "3-1": +200,
    "3-2": +100,
    "2-3": -20,
    "1-3": -45,
    "0-3": -65,
};

const SERIES_REWARDS_BO5_EM = {
    "3-0": +800,
    "3-1": +600,
    "3-2": +300,
    "2-3": -30,
    "1-3": -55,
    "0-3": -75,
};

const SERIES_APPLY_DELAY = 6000;
const SERIES_RESET_WINDOW = 15000;

const GamblingPage = () => {
    const [difficulty, setDifficulty] = useState("");
    const [showDifficultyOverlay, setShowDifficultyOverlay] = useState(true);
    const [showIntro, setShowIntro] = useState(false);

    const [currentPoints, setCurrentPoints] = useState(0);
    const [goalPoints, setGoalPoints] = useState(0);
    const [bet, setBet] = useState("");
    const [isCalculating, setIsCalculating] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [resultMessage, setResultMessage] = useState("");
    const [multiplier, setMultiplier] = useState(null);
    const [isWin, setIsWin] = useState(false);
    const [pointsChange, setPointsChange] = useState(null);

    const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
    const [hoveredDifficulty, setHoveredDifficulty] = useState(null);
    const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });

    const [bestMultiplier, setBestMultiplier] = useState(null);
    const [worstMultiplier, setWorstMultiplier] = useState(null);
    const [totalBets, setTotalBets] = useState(0);
    const [totalEarned, setTotalEarned] = useState(0);
    const [totalLost, setTotalLost] = useState(0);
    const [jackpotType, setJackpotType] = useState(null);
    const [showGameOverScreen, setShowGameOverScreen] = useState(false);
    const [totalJackpots, setTotalJackpots] = useState(0);
    const [totalSuperJackpots, setTotalSuperJackpots] = useState(0);
    const [totalWins, setTotalWins] = useState(0);
    const [sumOfMultipliers, setSumOfMultipliers] = useState(0);
    const [biggestWin, setBiggestWin] = useState(0);
    const [longestWinStreak, setLongestWinStreak] = useState(0);
    const [longestLossStreak, setLongestLossStreak] = useState(0);
    const [consecutiveLosses, setConsecutiveLosses] = useState(0);
    const [consecutiveWins, setConsecutiveWins] = useState(0);
    const [winStreakBonus, setWinStreakBonus] = useState(0);
    const [sumOfStreakBonuses, setSumOfStreakBonuses] = useState(0);
    const [maxPointsReached, setMaxPointsReached] = useState(0);

    const [seriesMode, setSeriesMode] = useState(null);
    const [hoveredMode, setHoveredMode] = useState(null);
    const [seriesModeDraft, setSeriesModeDraft] = useState(null);

    const [isSeriesActive, setIsSeriesActive] = useState(false);
    const [setsToWin, setSetsToWin] = useState(2);
    const [playerSets, setPlayerSets] = useState(0);
    const [opponentSets, setOpponentSets] = useState(0);
    const [loserOpacity, setLoserOpacity] = useState(null);

    const [roundWins, setRoundWins] = useState(0);
    const [roundLosses, setRoundLosses] = useState(0);
    const [roundNumber, setRoundNumber] = useState(1);
    const [isOvertime, setIsOvertime] = useState(false);
    const [overtimeBlock, setOvertimeBlock] = useState(0);
    const [otWins, setOtWins] = useState(0);
    const [otLosses, setOtLosses] = useState(0);

    const [seriesBanner, setSeriesBanner] = useState(null);
    const [seriesResult, setSeriesResult] = useState(null);
    const [seriesInitialPoints, setSeriesInitialPoints] = useState(0);

    const [setHistory, setSetHistory] = useState([]);

    const navigate = useNavigate();
    const prevPointsRef = useRef(0);
    const prevGoalRef = useRef(0);
    const firstGambleRef = useRef(false);
    const betInputRef = useRef(null);
    const previousStreakBonusRef = useRef(0);
    const lastLoadingMessageRef = useRef("");
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const dropdownCoords = useRef({});
    const tooltipRef = useRef(null);
    const seriesApplyTimeoutRef = useRef(null);
    const seriesResetTimeoutRef = useRef(null);
    const seriesResultTimeoutRef = useRef(null);
    const selectedLabel = difficulty || "Select difficulty";

    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                setDifficulty(parsed.difficulty);
                setCurrentPoints(parsed.currentPoints);
                setGoalPoints(parsed.goalPoints);
                setConsecutiveLosses(parsed.consecutiveLosses || 0);
                setConsecutiveWins(parsed.consecutiveWins || 0);
                setBestMultiplier(parsed.bestMultiplier || null);
                setWorstMultiplier(parsed.worstMultiplier || null);
                setTotalBets(parsed.totalBets || 0);
                setTotalEarned(parsed.totalEarned || 0);
                setTotalLost(parsed.totalLost || 0);
                setTotalJackpots(parsed.totalJackpots || 0);
                setTotalSuperJackpots(parsed.totalSuperJackpots || 0);
                setTotalWins(parsed.totalWins || 0);
                setSumOfMultipliers(parsed.sumOfMultipliers || 0);
                setSumOfStreakBonuses(parsed.sumOfStreakBonuses || 0);
                setBiggestWin(parsed.biggestWin || 0);
                setLongestWinStreak(parsed.longestWinStreak || 0);
                setLongestLossStreak(parsed.longestLossStreak || 0);
                setWinStreakBonus(parsed.winStreakBonus || 0);
                setMaxPointsReached(parsed.maxPointsReached || 0);
                setSeriesMode(parsed.seriesMode || null);
                setIsSeriesActive(parsed.isSeriesActive || false);
                setSetsToWin(parsed.setsToWin || 2);
                setPlayerSets(parsed.playerSets || 0);
                setOpponentSets(parsed.opponentSets || 0);
                setRoundWins(parsed.roundWins || 0);
                setRoundLosses(parsed.roundLosses || 0);
                setRoundNumber(parsed.roundNumber || 1);
                setIsOvertime(parsed.isOvertime || false);
                setOvertimeBlock(parsed.overtimeBlock || 0);
                setOtWins(parsed.otWins || 0);
                setOtLosses(parsed.otLosses || 0);
                setSeriesBanner(parsed.seriesBanner || null);
                setSeriesResult(parsed.seriesResult || null);
                setSetHistory(parsed.setHistory || []);
                setSeriesInitialPoints(parsed.seriesInitialPoints || 0);
                prevPointsRef.current = parsed.currentPoints;
                prevGoalRef.current = parsed.goalPoints;
                firstGambleRef.current = true;
                setShowDifficultyOverlay(false);
                setShowIntro(false);
            } catch (err) {
                console.error("Failed to parse saved game state:", err);
            }
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!difficulty) return;
        saveGameState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        difficulty,
        currentPoints,
        goalPoints,
        consecutiveWins,
        consecutiveLosses,
        bestMultiplier,
        worstMultiplier,
        totalBets,
        totalEarned,
        totalLost,
        totalJackpots,
        totalSuperJackpots,
        totalWins,
        sumOfMultipliers,
        sumOfStreakBonuses,
        biggestWin,
        longestWinStreak,
        longestLossStreak,
        winStreakBonus,
        playerSets,
        opponentSets,
        roundWins,
        roundLosses,
        roundNumber,
        overtimeBlock,
        otWins,
        otLosses,
        setHistory,
    ]);

    const saveGameState = (newState = {}) => {
        const stateToSave = {
            difficulty,
            currentPoints,
            goalPoints,
            consecutiveWins,
            consecutiveLosses,
            bestMultiplier,
            worstMultiplier,
            totalBets,
            totalEarned,
            totalLost,
            totalJackpots,
            totalSuperJackpots,
            totalWins,
            sumOfMultipliers,
            sumOfStreakBonuses,
            biggestWin,
            longestWinStreak,
            longestLossStreak,
            winStreakBonus,
            maxPointsReached,
            seriesMode,
            isSeriesActive,
            setsToWin,
            playerSets,
            opponentSets,
            roundWins,
            roundLosses,
            roundNumber,
            isOvertime,
            overtimeBlock,
            otWins,
            otLosses,
            seriesBanner,
            seriesResult,
            setHistory,
            seriesInitialPoints,
            ...newState,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    };

    useEffect(() => {
        if (showGameOverScreen) {
            const autoRestartTimeout = setTimeout(() => {
                setShowGameOverScreen(false);
                restartSameDifficulty();
                toast("Restarted automatically due to inactivity", {
                    icon: "🔁",
                    duration: 5000,
                });
            }, 50000);

            return () => clearTimeout(autoRestartTimeout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showGameOverScreen]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (showGameOverScreen) {
                confirmRestart();
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [showGameOverScreen]);

    useEffect(() => {
        if (!isSeriesActive && !showGameOverScreen && seriesResult) {
            const timeout = setTimeout(() => {
                if (currentPoints >= goalPoints) {
                    setIsWin(true);
                    setShowGameOverScreen(true);
                } else if (currentPoints <= 0) {
                    setIsWin(false);
                    setShowGameOverScreen(true);
                }
            }, SERIES_APPLY_DELAY + 500);
            return () => clearTimeout(timeout);
        }
    }, [isSeriesActive, showGameOverScreen, seriesResult, currentPoints, goalPoints]);

    useEffect(() => {
        if (seriesResult) {
            const timer = setTimeout(() => {
                setSeriesResult(null);
            }, 15000);

            return () => clearTimeout(timer);
        }
    }, [seriesResult]);

    // useEffect(() => {
    //     const handleBefore = () => {
    //         confirmRestart();
    //     };
    //     window.addEventListener("beforeunload", handleBefore);
    //     return () => window.removeEventListener("beforeunload", handleBefore);
    // }, []);

    useEffect(() => {
        if (hoveredDifficulty && dropdownRef.current && tooltipRef.current) {
            const dropdownRect = dropdownRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            let tooltipTop = tooltipCoords.top;

            if (tooltipRect.bottom > dropdownRect.bottom) {
                tooltipTop -= tooltipRect.bottom - dropdownRect.bottom;
            } else if (tooltipRect.top < dropdownRect.top) {
                tooltipTop += dropdownRect.top - tooltipRect.top;
            }

            setTooltipCoords((prev) => ({ ...prev, top: tooltipTop }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hoveredDifficulty]);

    const toggleDropdown = () => {
        if (open) setOpen(false);
        else {
            const rect = buttonRef.current.getBoundingClientRect();
            dropdownCoords.current = { top: rect.bottom + 4, left: rect.left };
            setOpen(true);
        }
    };

    const handleSelectDifficulty = (diff) => {
        setDifficulty(diff);
        setOpen(false);
        setSeriesMode(null);
    };

    const currentRewardsTable = () => {
        if (difficulty === "LUCK GOD") return SERIES_REWARDS_BO5_LUCKGOD;
        if (difficulty === "Eternal Madness") return SERIES_REWARDS_BO5_EM;
        if (["Easy", "Normal"].includes(difficulty)) return SERIES_REWARDS_BO1;
        return SERIES_REWARDS_BO3;
    };

    const baseMaxRounds = 18;
    const baseRoundsToWin = 10;
    const otMaxRounds = 6;
    const otRoundsToWin = 4;

    const resetSet = () => {
        setRoundWins(0);
        setRoundLosses(0);
        setRoundNumber(1);
        setIsOvertime(false);
        setOvertimeBlock(0);
    };

    const endSet = (playerWon, finalWins, finalLosses, isFinal = false) => {
        if (playerWon) setPlayerSets(v => v + 1);
        else setOpponentSets(v => v + 1);

        if (isFinal) {
            setTimeout(() => resetSet(), 19000);
        } else {
            resetSet();
        }

        setSetHistory(prev => {
            const updated = [
                ...prev,
                {
                    set: prev.length + 1,
                    wins: finalWins,
                    losses: finalLosses,
                    won: playerWon,
                },
            ];
            saveGameState({ setHistory: updated });
            return updated;
        });
    };

    const seriesKey = (p, o) => `${p}-${o}`;

    const maybeEndSeries = (pSets, oSets) => {
        const need = setsToWin;
        if (pSets >= need || oSets >= need) return true;
        return false;
    };

    const startGame = () => {
        if (!difficulty) return;

        if (seriesModeDraft) {
            setSeriesMode(seriesModeDraft);
            saveGameState({ seriesMode: seriesModeDraft });
        } else {
            setSeriesMode(null);
            saveGameState({ seriesMode: null });
        }

        const { start, goal } = DIFFICULTIES[difficulty];

        const startGen = randomUniform(start[0], start[1]);
        const goalGen = randomUniform(goal[0], goal[1]);

        const starter = start[0] === start[1] ? start[0] : Math.round(startGen());
        const goalPts = Math.round(goalGen());

        prevPointsRef.current = 0;
        prevGoalRef.current = 0;
        firstGambleRef.current = false;

        setCurrentPoints(starter);
        setGoalPoints(goalPts);
        setMaxPointsReached(starter);
        setBet("");
        setIsCalculating(false);
        setResultMessage("");
        setMultiplier(null);
        setShowGameOverScreen(false);
        setIsWin(false);
        setPointsChange(null);
        setShowIntro(true);
        setShowDifficultyOverlay(false);
        setTotalBets(0);
        setSumOfMultipliers(0);
        setBestMultiplier(null);
        setWorstMultiplier(null);
        setTotalEarned(0);
        setTotalLost(0);
        setTotalJackpots(0);
        setTotalSuperJackpots(0);
        setTotalWins(0);
        setBiggestWin(0);
        setLongestWinStreak(0);
        setLongestLossStreak(0);
        setConsecutiveWins(0);
        setConsecutiveLosses(0);
        setWinStreakBonus(0);
        setSumOfStreakBonuses(0);
        previousStreakBonusRef.current = 0;
        setIsSeriesActive(false);
        setPlayerSets(0);
        setOpponentSets(0);
        resetSet();
        setSeriesBanner(null);
        setSeriesResult(null);
        setLoserOpacity(null);
        setSetHistory([]);
        setSeriesInitialPoints(currentPoints);

        saveGameState({ currentPoints: starter, goalPoints: goalPts });
    };

    const restartSameDifficulty = () => {
        if (!difficulty) return;

        const { start, goal } = DIFFICULTIES[difficulty];

        const startGen = randomUniform(start[0], start[1]);
        const goalGen = randomUniform(goal[0], goal[1]);

        const starter = start[0] === start[1] ? start[0] : Math.round(startGen());
        const goalPts = Math.round(goalGen());

        prevPointsRef.current = 0;
        prevGoalRef.current = 0;
        firstGambleRef.current = false;

        setCurrentPoints(starter);
        setGoalPoints(goalPts);
        setMaxPointsReached(starter);
        setBet("");
        setIsCalculating(false);
        setResultMessage("");
        setMultiplier(null);
        setShowGameOverScreen(false);
        setIsWin(false);
        setPointsChange(null);
        setShowIntro(true);
        setShowDifficultyOverlay(false);
        setTotalBets(0);
        setSumOfMultipliers(0);
        setBestMultiplier(null);
        setWorstMultiplier(null);
        setTotalEarned(0);
        setTotalLost(0);
        setTotalJackpots(0);
        setTotalSuperJackpots(0);
        setTotalWins(0);
        setBiggestWin(0);
        setLongestWinStreak(0);
        setLongestLossStreak(0);
        setConsecutiveWins(0);
        setConsecutiveLosses(0);
        setWinStreakBonus(0);
        setSumOfStreakBonuses(0);
        previousStreakBonusRef.current = 0;
        setIsSeriesActive(false);
        setPlayerSets(0);
        setOpponentSets(0);
        resetSet();
        setSeriesBanner(null);
        setSeriesResult(null);
        setLoserOpacity(null);
        setSetHistory([]);
        setSeriesInitialPoints(currentPoints);

        saveGameState({ currentPoints: starter, goalPoints: goalPts });
    };

    const handleBetChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) setBet(value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !isButtonLocked && bet.trim() !== "") {
            e.preventDefault();
            handleGamble();
        }
    };

    const startSeries = () => {
        if (!difficulty) return toast.error("Select difficulty first!");
        const modeToUse = seriesMode;
        if (modeToUse !== "extended") {
            toast("Normal mode selected — series not started.", { duration: 2500 });
            return;
        }
        if (isSeriesActive) return;

        if (difficulty === "Eternal Madness") {
            setSetsToWin(3);
            setSeriesMode("extended");
        } else if (difficulty === "LUCK GOD") {
            setSetsToWin(3);
            setSeriesMode("extended");
        } else if (["Hard", "Impossible"].includes(difficulty)) {
            setSetsToWin(2);
            setSeriesMode("extended");
        } else if (["Easy", "Normal"].includes(difficulty)) {
            setSetsToWin(1);
            setSeriesMode("extended");
        } else {
            setSetsToWin(0);
            setSeriesMode("standard");
        }

        setIsSeriesActive(true);
        setPlayerSets(0);
        setOpponentSets(0);
        resetSet();
        setSeriesBanner(null);
        setSeriesResult(null);
        setLoserOpacity(null);
        setSetHistory([]);
        setSeriesInitialPoints(currentPoints);

        toast("🏆 Series started! Win sets by taking rounds!", { icon: "🎯", duration: 4000 });
    };

    const inSeries = isSeriesActive && seriesMode === "extended";

    const handleGamble = () => {
        if (!inSeries && !bet) return toast.error("Please enter a bet amount!");

        if (seriesResult && !isSeriesActive) {
            const pending = JSON.parse(localStorage.getItem("pendingSeriesApply") || "null");
            if (pending) {
                setCurrentPoints(pending.newPoints);
                setPointsChange(pending.change);
                setMaxPointsReached((m) => Math.max(m, pending.newPoints));
                localStorage.removeItem("pendingSeriesApply");
            }

            setSeriesResult(null);
            setSeriesBanner(null);
            setLoserOpacity(null);

            return;
        }

        const betAmount = inSeries ? 1 : parseInt(bet, 10);
        if (!inSeries) {
            if (betAmount === 0) return toast.error("You can't gamble with 0 points!");
            if (betAmount > currentPoints) return toast.error("You don't have enough points!");
        }

        firstGambleRef.current = true;
        setJackpotType(null);
        const previousPoints = currentPoints;

        const availableMessages =
            DIFFICULTY_LOADING_MESSAGES[difficulty] ?? DIFFICULTY_LOADING_MESSAGES.Normal;
        let randomLoadingMsg;
        do {
            randomLoadingMsg = availableMessages[Math.floor(Math.random() * availableMessages.length)];
        } while (randomLoadingMsg === lastLoadingMessageRef.current && availableMessages.length > 1);
        lastLoadingMessageRef.current = randomLoadingMsg;

        if (!inSeries) setCurrentPoints((prev) => prev - betAmount);
        if (!inSeries) setBet("");

        setResultMessage(randomLoadingMsg);
        setMultiplier(null);
        setPointsChange(null);
        setIsCalculating(true);

        const config = DIFFICULTIES[difficulty];
        const { multiplier: [min, max], unstableMin, jackpot, superjackpot } = config;

        let rawMultiplier;
        let jackpotTypeLocal = null;

        if (inSeries) {
            rawMultiplier = min + Math.random() * (max - min);
        } else if (superjackpot && Math.random() < superjackpot.chance) {
            const [sjMin, sjMax] = superjackpot.range;
            rawMultiplier = sjMin + Math.random() * (sjMax - sjMin);
            jackpotTypeLocal = "superjackpot";
        } else if (jackpot && Math.random() < jackpot.chance) {
            const [jpMin, jpMax] = jackpot.range;
            rawMultiplier = jpMin + Math.random() * (jpMax - jpMin);
            jackpotTypeLocal = "jackpot";
        } else {
            if (unstableMin) {
                const randomMin = randomUniform(0, min)();
                const normalGen = randomNormal((max + randomMin) / 2, (max - randomMin) / 5);
                rawMultiplier = Math.min(Math.max(normalGen(), 0), max);
            } else {
                const normalGen = randomNormal((min + max) / 2, (max - min) / 6);
                rawMultiplier = Math.min(Math.max(normalGen(), min), max);
            }
        }

        if (jackpotTypeLocal === "jackpot") setTotalJackpots((p) => p + 1);
        if (jackpotTypeLocal === "superjackpot") setTotalSuperJackpots((p) => p + 1);

        const roundedMultiplier = Math.round(rawMultiplier * 100) / 100;

        let newConsecutiveWins = consecutiveWins;
        let newConsecutiveLosses = consecutiveLosses;
        let streakBonusToApply = 0;

        if (roundedMultiplier > 1.0) {
            newConsecutiveWins += 1;
            newConsecutiveLosses = 0;
            if (!inSeries) {
                const streakBonus = newConsecutiveWins >= 5 ? 0.2 * (newConsecutiveWins - 4) : 0;
                previousStreakBonusRef.current = streakBonus;
                streakBonusToApply = streakBonus;
            }
        } else if (roundedMultiplier < 1.0) {
            newConsecutiveLosses += 1;
            if (!inSeries && previousStreakBonusRef.current > 0) {
                streakBonusToApply = previousStreakBonusRef.current;
                previousStreakBonusRef.current = 0;
            }
            newConsecutiveWins = 0;
        }

        setWinStreakBonus(!inSeries ? streakBonusToApply : 0);

        const effectiveMultiplierRaw = roundedMultiplier + streakBonusToApply;
        const effectiveMultiplier = Math.round(effectiveMultiplierRaw * 100) / 100;
        const winnings = Math.round(betAmount * effectiveMultiplier);

        setTimeout(() => {
            setMultiplier(effectiveMultiplier);

            let message;
            if (jackpotTypeLocal === "superjackpot") {
                message = "🌈💥 SUPER JACKPOT!!! 🚀";
                toast.success("🌈💥 SUPER JACKPOT!!! You broke the odds!", { duration: 5000 });
            } else if (jackpotTypeLocal === "jackpot") {
                message = "🎰 JACKPOT!🤯";
                toast.success("🎰 JACKPOT!🤯 Multiplier boosted!", { duration: 3000 });
            } else if (effectiveMultiplier === 0) {
                message = "💀 Total wipeout! You lost everything!";
            } else if (effectiveMultiplier <= 0.1) {
                message = "Total loss 😭!";
            } else if (effectiveMultiplier < 1.0) {
                message = "What a failure 😢!";
            } else if (effectiveMultiplier === 1.0) {
                message = "Neither good nor bad 😐!";
            } else if (effectiveMultiplier <= 1.2) {
                message = "Mid😕!";
            } else {
                message = "Congratulations👏!";
            }

            if (inSeries) {
                if (effectiveMultiplier === 0) {
                    message = "💀 That's good that you got it during the series!";
                } else if (effectiveMultiplier <= 0.1) {
                    message = "Imagine, you get it on your whole score 😭!";
                } else if (effectiveMultiplier < 1.0) {
                    message = "That's a round loss 😢!";
                } else if (effectiveMultiplier === 1.0) {
                    message = "Neither good nor bad 😐!";
                } else {
                    message = "That's a round win👏!";
                }
            }

            setResultMessage(message);
            setJackpotType(jackpotTypeLocal);

            setTotalBets((prev) => prev + 1);
            setSumOfMultipliers((prev) => prev + roundedMultiplier);
            setBestMultiplier((prev) => (prev === null ? roundedMultiplier : Math.max(prev, roundedMultiplier)));
            setWorstMultiplier((prev) => (prev === null ? roundedMultiplier : Math.min(prev, roundedMultiplier)));

            try {
                if (inSeries) {
                    const playerWonRound = effectiveMultiplier > 1.0;
                    if (playerWonRound) setTotalWins((prev) => prev + 1);
                    const needWins = isOvertime ? otRoundsToWin : baseRoundsToWin;
                    const maxRounds = isOvertime ? otMaxRounds : baseMaxRounds;

                    if (!isOvertime) {
                        const nextWins = playerWonRound ? roundWins + 1 : roundWins;
                        const nextLosses = !playerWonRound && effectiveMultiplier < 1.0 ? roundLosses + 1 : roundLosses;
                        const isFinalRound =
                            nextWins >= needWins ||
                            nextLosses >= needWins ||
                            nextWins + nextLosses >= maxRounds;

                        setRoundWins(nextWins);
                        setRoundLosses(nextLosses);

                        if (effectiveMultiplier !== 1.0 && !isFinalRound) {
                            setRoundNumber((n) => n + 1);
                        }

                        if (nextWins === 9 && nextLosses === 9) {
                            setIsLocked(true);
                            toast("Overtime coming in for this set! 🔥", { icon: "⚔️", duration: 4000 });
                            setTimeout(() => {
                                setIsOvertime(true);
                                setOvertimeBlock((b) => (b ? b + 1 : 1));
                                setOtWins(0);
                                setOtLosses(0);
                                setRoundNumber(1);
                                setIsLocked(false);
                            }, 4000);
                            return;
                        }

                        if (nextWins >= needWins || nextLosses >= needWins || (nextWins + nextLosses) >= maxRounds) {
                            const playerWonSet = nextWins > nextLosses;
                            const nextPlayerSets = playerWonSet ? playerSets + 1 : playerSets;
                            const nextOppSets = playerWonSet ? opponentSets : opponentSets + 1;
                            const isSeriesOver =
                                maybeEndSeries(nextPlayerSets, nextOppSets) ||
                                setsToWin === 1 && (nextPlayerSets === 1 || nextOppSets === 1);

                            setIsLocked(true);

                            if (isSeriesOver) {
                                if (playerWonSet) {
                                    toast(`${ setsToWin === 1 ? 'This match has' : 'These series have'} been WON! 🏆🔥`, { icon: "🎉", duration: 4000 });
                                } else {
                                    toast(`${ setsToWin === 1 ? 'This match has' : 'These series have'} been LOST!`, { icon: "😢", duration: 4000 });
                                }
                            } else {
                                if (playerWonSet) {
                                    toast(`The set ${playerSets + opponentSets + 1} has been won!`, { icon: "🤯", duration: 4000 });
                                } else {
                                    toast(`The set ${playerSets + opponentSets + 1} has been lost!`, { icon: "😞", duration: 4000 });
                                }
                            }
                            if (!maybeEndSeries(nextPlayerSets, nextOppSets)) {
                                setTimeout(() => {
                                    endSet(playerWonSet, nextWins, nextLosses, false);
                                    setIsLocked(false);
                                }, 4000);
                            } else {
                                endSet(playerWonSet, nextWins, nextLosses, true);
                                setIsLocked(false);
                            }

                            if (maybeEndSeries(nextPlayerSets, nextOppSets)) {
                                const k = seriesKey(nextPlayerSets, nextOppSets);
                                const table = currentRewardsTable();
                                const percent = table[k] ?? 0;
                                const base = seriesInitialPoints || currentPoints;
                                const change = Math.round((base * percent) / 100);
                                const newPoints = base + change;

                                setSeriesResult({ isWin: nextPlayerSets > nextOppSets, percent, change });
                                setSeriesBanner(nextPlayerSets > nextOppSets ? "YOU WON!" : "YOU LOST!");
                                setLoserOpacity(nextPlayerSets > nextOppSets ? "loss" : "win");

                                seriesResultTimeoutRef.current = setTimeout(() => {
                                    setSeriesResult({ isWin: nextPlayerSets > nextOppSets, percent, change });

                                    if (seriesResetTimeoutRef.current) clearTimeout(seriesResetTimeoutRef.current);
                                    seriesResetTimeoutRef.current = setTimeout(() => {
                                        resetSeriesState();
                                        setRoundWins(0);
                                        setRoundLosses(0);
                                        setOtWins(0);
                                        setOtLosses(0);
                                        setIsOvertime(false);
                                        setOvertimeBlock(0);
                                        setIsSeriesActive(false);
                                        seriesResetTimeoutRef.current = null;
                                    }, 15000);
                                }, 4000);

                                const timestamp = Date.now();
                                localStorage.setItem(
                                    "pendingSeriesApply",
                                    JSON.stringify({
                                        newPoints,
                                        change,
                                        percent,
                                        isWin: nextPlayerSets > nextOppSets,
                                        timestamp,
                                        delayEndsAt: timestamp + SERIES_APPLY_DELAY,
                                    })
                                );

                                if (seriesApplyTimeoutRef.current) clearTimeout(seriesApplyTimeoutRef.current);
                                seriesApplyTimeoutRef.current = setTimeout(() => {
                                    const pending = JSON.parse(localStorage.getItem("pendingSeriesApply") || "null");
                                    if (!pending) return;

                                    setCurrentPoints(pending.newPoints);
                                    setPointsChange(pending.change);
                                    setMaxPointsReached((m) => Math.max(m, pending.newPoints));

                                    setTotalBets((t) => t + 1);
                                    if (pending.change >= 0) {
                                        setTotalEarned((e) => e + pending.change);
                                        setTotalWins((w) => w + 1);
                                        setBiggestWin((b) => Math.max(b, pending.change));
                                        setConsecutiveWins((cw) => {
                                            const nw = cw + 1;
                                            setLongestWinStreak((lw) => Math.max(lw, nw));
                                            return nw;
                                        });
                                        setConsecutiveLosses(0);
                                    } else {
                                        setTotalLost((l) => l + Math.abs(pending.change));
                                        setConsecutiveLosses((cl) => {
                                            const nl = cl + 1;
                                            setLongestLossStreak((ll) => Math.max(ll, nl));
                                            return nl;
                                        });
                                        setConsecutiveWins(0);
                                    }

                                    setSumOfMultipliers((s) => s + 1);

                                    saveGameState({
                                        currentPoints: pending.newPoints,
                                        maxPointsReached,
                                        pointsChange: pending.change,
                                        totalBets: totalBets + 1,
                                        totalWins: pending.change >= 0 ? totalWins + 1 : totalWins,
                                        totalEarned: pending.change >= 0 ? totalEarned + pending.change : totalEarned,
                                        totalLost: pending.change < 0 ? totalLost + Math.abs(pending.change) : totalLost,
                                        biggestWin: pending.change >= 0 ? Math.max(biggestWin, pending.change) : biggestWin,
                                        bestMultiplier,
                                        worstMultiplier,
                                        sumOfMultipliers,
                                        sumOfStreakBonuses,
                                        totalJackpots,
                                        totalSuperJackpots,
                                        consecutiveWins,
                                        consecutiveLosses,
                                        longestWinStreak,
                                        longestLossStreak,
                                    });

                                    if (pending.newPoints >= goalPoints) {
                                        setIsWin(true);
                                        setTimeout(() => setShowGameOverScreen(true), 2000);
                                    } else if (pending.newPoints <= 0) {
                                        setIsWin(false);
                                        setTimeout(() => setShowGameOverScreen(true), 2000);
                                    }

                                    localStorage.removeItem("pendingSeriesApply");
                                    seriesApplyTimeoutRef.current = null;
                                }, SERIES_APPLY_DELAY);

                                localStorage.setItem("seriesEndTime", String(Date.now()));
                            }
                            return;
                        }

                        return;
                    }

                    const nextOtWins = playerWonRound ? otWins + 1 : otWins;
                    const nextOtLosses = !playerWonRound && effectiveMultiplier < 1.0 ? otLosses + 1 : otLosses;
                    const isFinalOtRound =
                        nextOtWins === otRoundsToWin ||
                        nextOtLosses === otRoundsToWin ||
                        (nextOtWins === 3 && nextOtLosses === 3);

                    setOtWins(nextOtWins);
                    setOtLosses(nextOtLosses);
                    if (effectiveMultiplier !== 1.0 || isFinalOtRound) {
                        setRoundNumber((n) => n + 1);
                    }
                    setRoundWins((w) => w + (playerWonRound ? 1 : 0));
                    setRoundLosses((l) => l + (!playerWonRound && effectiveMultiplier < 1.0 ? 1 : 0));

                    if (nextOtWins === otRoundsToWin || nextOtLosses === otRoundsToWin) {
                        const playerWonSet = nextOtWins > nextOtLosses;
                        const nextPlayerSets = playerWonSet ? playerSets + 1 : playerSets;
                        const nextOppSets = playerWonSet ? opponentSets : opponentSets + 1;
                        const isSeriesOver =
                            maybeEndSeries(nextPlayerSets, nextOppSets) ||
                            setsToWin === 1 && (nextPlayerSets === 1 || nextOppSets === 1);
                        const finalWins = roundWins + (playerWonRound ? 1 : 0);
                        const finalLosses = roundLosses + (!playerWonRound && effectiveMultiplier < 1.0 ? 1 : 0);

                        setIsLocked(true);

                        if (isSeriesOver) {
                            if (playerWonSet) {
                                toast(`${ setsToWin === 1 ? 'This match has' : 'These series have'} been WON in Overtime! 🏆🔥`, { icon: "🎉", duration: 4000 });
                            } else {
                                toast(`${ setsToWin === 1 ? 'This match has' : 'These series have'} been LOST in Overtime!`, { icon: "😢", duration: 4000 });
                            }
                        } else {
                            if (playerWonSet) {
                                toast(`The set ${playerSets + opponentSets + 1} has been won in overtime ${overtimeBlock === 0 || overtimeBlock === 1 ? '!' : ` #${overtimeBlock}`}`, { icon: "🤯", duration: 4000 });
                            } else {
                                toast(`The set ${playerSets + opponentSets + 1} has been lost in overtime ${overtimeBlock === 0 || overtimeBlock === 1 ? '!' : ` #${overtimeBlock}`}`, { icon: "😞", duration: 4000 });
                            }
                        }
                        if (!maybeEndSeries(nextPlayerSets, nextOppSets)) {
                            setTimeout(() => {
                                endSet(playerWonSet, finalWins, finalLosses, false);
                                setIsOvertime(false);
                                setOvertimeBlock(0);
                                setOtWins(0);
                                setOtLosses(0);
                                setIsLocked(false);
                            }, 4000);
                        } else {
                            endSet(playerWonSet, finalWins, finalLosses, true);
                            setIsOvertime(false);
                            setOvertimeBlock(0);
                            setOtWins(0);
                            setOtLosses(0);
                            setIsLocked(false);
                        }

                        if (maybeEndSeries(nextPlayerSets, nextOppSets)) {
                            const k = seriesKey(nextPlayerSets, nextOppSets);
                            const table = currentRewardsTable();
                            const percent = table[k] ?? 0;
                            const base = seriesInitialPoints || currentPoints;
                            const change = Math.round((base * percent) / 100);
                            const newPoints = base + change;

                            setSeriesResult({ isWin: nextPlayerSets > nextOppSets, percent, change });
                            setSeriesBanner(nextPlayerSets > nextOppSets ? "YOU WON!" : "YOU LOST!");
                            setLoserOpacity(nextPlayerSets > nextOppSets ? "loss" : "win");

                            seriesResultTimeoutRef.current = setTimeout(() => {
                                setSeriesResult({ isWin: nextPlayerSets > nextOppSets, percent, change });

                                if (seriesResetTimeoutRef.current) clearTimeout(seriesResetTimeoutRef.current);
                                seriesResetTimeoutRef.current = setTimeout(() => {
                                    resetSeriesState();
                                    setRoundWins(0);
                                    setRoundLosses(0);
                                    setOtWins(0);
                                    setOtLosses(0);
                                    setIsOvertime(false);
                                    setOvertimeBlock(0);
                                    setIsSeriesActive(false);
                                    seriesResetTimeoutRef.current = null;
                                }, 15000);
                            }, 4000);
                            
                            const timestamp = Date.now();
                            localStorage.setItem(
                                "pendingSeriesApply",
                                JSON.stringify({
                                    newPoints,
                                    change,
                                    percent,
                                    isWin: nextPlayerSets > nextOppSets,
                                    timestamp,
                                    delayEndsAt: timestamp + SERIES_APPLY_DELAY,
                                })
                            );

                            if (seriesApplyTimeoutRef.current) clearTimeout(seriesApplyTimeoutRef.current);
                            seriesApplyTimeoutRef.current = setTimeout(() => {
                                const pending = JSON.parse(localStorage.getItem("pendingSeriesApply") || "null");
                                if (!pending) return;

                                setCurrentPoints(pending.newPoints);
                                setPointsChange(pending.change);
                                setMaxPointsReached((m) => Math.max(m, pending.newPoints));

                                setTotalBets((t) => t + 1);
                                if (pending.change >= 0) {
                                    setTotalEarned((e) => e + pending.change);
                                    setTotalWins((w) => w + 1);
                                    setBiggestWin((b) => Math.max(b, pending.change));
                                    setConsecutiveWins((cw) => {
                                        const nw = cw + 1;
                                        setLongestWinStreak((lw) => Math.max(lw, nw));
                                        return nw;
                                    });
                                    setConsecutiveLosses(0);
                                } else {
                                    setTotalLost((l) => l + Math.abs(pending.change));
                                    setConsecutiveLosses((cl) => {
                                        const nl = cl + 1;
                                        setLongestLossStreak((ll) => Math.max(ll, nl));
                                        return nl;
                                    });
                                    setConsecutiveWins(0);
                                }

                                setSumOfMultipliers((s) => s + 1);

                                saveGameState({
                                    currentPoints: pending.newPoints,
                                    maxPointsReached,
                                    pointsChange: pending.change,
                                    totalBets: totalBets + 1,
                                    totalWins: pending.change >= 0 ? totalWins + 1 : totalWins,
                                    totalEarned: pending.change >= 0 ? totalEarned + pending.change : totalEarned,
                                    totalLost: pending.change < 0 ? totalLost + Math.abs(pending.change) : totalLost,
                                    biggestWin: pending.change >= 0 ? Math.max(biggestWin, pending.change) : biggestWin,
                                    bestMultiplier,
                                    worstMultiplier,
                                    sumOfMultipliers,
                                    sumOfStreakBonuses,
                                    totalJackpots,
                                    totalSuperJackpots,
                                    consecutiveWins,
                                    consecutiveLosses,
                                    longestWinStreak,
                                    longestLossStreak,
                                });

                                if (pending.newPoints >= goalPoints) {
                                    setIsWin(true);
                                    setTimeout(() => setShowGameOverScreen(true), 2000);
                                } else if (pending.newPoints <= 0) {
                                    setIsWin(false);
                                    setTimeout(() => setShowGameOverScreen(true), 2000);
                                }

                                localStorage.removeItem("pendingSeriesApply");
                                seriesApplyTimeoutRef.current = null;
                            }, SERIES_APPLY_DELAY);

                            localStorage.setItem("seriesEndTime", String(Date.now()));
                        }
                        return;
                    }

                    if (nextOtWins === 3 && nextOtLosses === 3) {
                        setIsLocked(true);
                        if (overtimeBlock === 1) {
                            toast("Overtime is tied 3-3! Starting new overtime block...", { icon: "🔄", duration: 4000 });
                        } else if (overtimeBlock === 2) {
                            toast("Another overtime block tied 3-3! Starting new overtime block...", { icon: "🔄", duration: 4000 });
                        } else if (overtimeBlock === 3) {
                            toast("That's a tough battle we got here! Yet another overtime block tied 3-3! Starting new overtime block...", { icon: "🔄", duration: 4000 });
                        } else if (overtimeBlock >= 4) {
                            toast("A tie again! Impressing! Starting new overtime block...", { icon: "🔄", duration: 4000 });
                        }
                        setTimeout(() => {
                            setOvertimeBlock((b) => b + 1);
                            setRoundNumber(1);
                            setOtWins(0);
                            setOtLosses(0);
                            setIsOvertime(true);
                            setIsLocked(false);
                        }, 4000);
                    }

                    return;
                }

                const newPoints = previousPoints - betAmount + winnings;
                const netChange = newPoints - previousPoints;

                setMaxPointsReached((prev) => Math.max(prev, newPoints));
                setPointsChange(netChange);
                setCurrentPoints(newPoints);

                setConsecutiveWins(newConsecutiveWins);
                setConsecutiveLosses(newConsecutiveLosses);
                setLongestWinStreak((prev) => Math.max(prev, newConsecutiveWins));
                setLongestLossStreak((prev) => Math.max(prev, newConsecutiveLosses));

                if (roundedMultiplier > 1.0) setTotalWins((prev) => prev + 1);

                setSumOfMultipliers((prev) => prev + roundedMultiplier);
                setSumOfStreakBonuses((prev) => prev + streakBonusToApply);

                setBestMultiplier((prev) => (prev === null ? roundedMultiplier : Math.max(prev, roundedMultiplier)));
                setWorstMultiplier((prev) => (prev === null ? roundedMultiplier : Math.min(prev, roundedMultiplier)));

                setTotalBets((prev) => prev + 1);
                if (netChange >= 0) setTotalEarned((prev) => prev + netChange);
                else setTotalLost((prev) => prev + Math.abs(netChange));
                if (netChange > 0) setBiggestWin((prev) => Math.max(prev, netChange));

                saveGameState({
                    currentPoints: newPoints,
                    consecutiveWins: newConsecutiveWins,
                    consecutiveLosses: newConsecutiveLosses,
                });

                if (newPoints >= goalPoints) {
                    setIsWin(true);
                    localStorage.removeItem(STORAGE_KEY);
                    setTimeout(() => setShowGameOverScreen(true), 2000);
                } else if (newPoints <= 0) {
                    setIsWin(false);
                    localStorage.removeItem(STORAGE_KEY);
                    setTimeout(() => setShowGameOverScreen(true), 2000);
                }
            } finally {
                setIsCalculating(false);
                betInputRef.current?.focus();
            }
        }, 2000);
    };

    const confirmRestart = () => {
        localStorage.removeItem(STORAGE_KEY);
        setDifficulty("");
        setShowDifficultyOverlay(true);
        setShowIntro(false);
        setIsRestartModalOpen(false);
        setShowGameOverScreen(false);
        setIsWin(false);
        setBestMultiplier(null);
        setWorstMultiplier(null);
        setTotalBets(0);
        setTotalEarned(0);
        setTotalLost(0);
        setTotalJackpots(0);
        setTotalSuperJackpots(0);
        setLongestWinStreak(0);
        setLongestLossStreak(0);
        setMaxPointsReached(0);

        setSeriesMode(null);
        setIsSeriesActive(false);
        setPlayerSets(0);
        setOpponentSets(0);
        setRoundWins(0);
        setRoundLosses(0);
        setRoundNumber(1);
        setIsOvertime(false);
        setOvertimeBlock(0);
        setSeriesBanner(null);
        setSeriesResult(null);
    };

    const confirmTerminate = () => {
        setIsTerminateModalOpen(false);
        navigate("/");
    };

    const resetSeriesState = () => {
        setPlayerSets(0);
        setOpponentSets(0);
        setRoundWins(0);
        setRoundLosses(0);
        setOtWins(0);
        setOtLosses(0);
        setRoundNumber(1);
        setIsOvertime(false);
        setOvertimeBlock(0);
        setSeriesResult(null);
        setSeriesBanner(null);
        setLoserOpacity(null);
        setSeriesBanner("");
        setLoserOpacity("");
    };

    const applyPendingSeriesChange = () => {
        const pending = JSON.parse(localStorage.getItem("pendingSeriesApply") || "null");
        if (!pending) return;
        setCurrentPoints(pending.newPoints);
        setPointsChange(pending.change);
        setMaxPointsReached((prev) => Math.max(prev, pending.newPoints));
        localStorage.removeItem("pendingSeriesApply");
    };

    const isButtonLocked = isCalculating || isRestartModalOpen || isTerminateModalOpen || isLocked;
    const isGambleButtonLocked = isCalculating || isRestartModalOpen || isTerminateModalOpen || isLocked;

    const getMultiplierClass = (rawMultiplier) => {
        if (inSeries) {
            if (rawMultiplier === null) return "";
            if (rawMultiplier === 0) return css.multiplier_totalWipeout;
            if (rawMultiplier <= 0.1) return css.multiplier_superFail;
            if (rawMultiplier < 1.0) return css.multiplier_fail;
            if (rawMultiplier === 1.0) return css.multiplier_mid;
            return css.multiplier_win;
        } else {
            if (rawMultiplier === null) return "";
            if (rawMultiplier === 0) return css.multiplier_totalWipeout;
            if (rawMultiplier <= 0.1) return css.multiplier_superFail;
            if (rawMultiplier < 1.0) return css.multiplier_fail;
            if (rawMultiplier <= 1.2) return css.multiplier_mid;
            if (rawMultiplier > 3.0) return css.multiplier_gold;
            return css.multiplier_win;
        }
    };

    const getBestMultiplierClass = (value) => {
        if (value === null) return "";
        if (value === 0) return css.multiplier_totalWipeout;
        if (value <= 0.1) return css.multiplier_superFail;
        if (value < 1.0) return css.multiplier_fail;
        if (value <= 1.2) return css.multiplier_mid;
        if (value > 3.0) return css.multiplier_gold;
        return css.multiplier_win;
    };

    const getAvgMultiplierClass = (value) => {
        if (value === null) return "";
        if (value === 0) return css.multiplier_totalWipeout;
        if (value <= 0.1) return css.multiplier_superFail;
        if (value < 1.0) return css.multiplier_fail;
        if (value <= 1.2) return css.multiplier_mid;
        if (value > 3.0) return css.multiplier_gold;
        return css.multiplier_win;
    };

    const getHitRateClass = (value) => {
        if (value < 40) return css.multiplier_fail;
        if (value <= 50) return css.multiplier_mid;
        return css.multiplier_win;
    };

    const getCurrentPointsStyle = () => {
        if (!firstGambleRef.current) {
            return { backgroundColor: "#ccc", color: "#2e2f42" };
        }

        const ratio = Math.min(currentPoints / goalPoints, 1);
        let r, g, b;

        if (ratio <= 0.5) {
            const t = ratio / 0.5;
            r = Math.round(255 * (1 - t) + 128 * t);
            g = Math.round(0 * (1 - t) + 128 * t);
            b = Math.round(0 * (1 - t) + 128 * t);
        } else {
            const t = (ratio - 0.5) / 0.5;
            r = Math.round(128 * (1 - t) + 34 * t);
            g = Math.round(128 * (1 - t) + 139 * t);
            b = Math.round(128 * (1 - t) + 34 * t);
        }

        return {
            backgroundColor: `rgb(${r}, ${g}, ${b})`,
            color: "#fff",
        };
    };

    const hitRate = totalBets > 0 ? Math.round((totalWins / totalBets) * 100) : 0;
    const avgMultiplier = totalBets > 0 ? (sumOfMultipliers / totalBets).toFixed(2) : 0;
    const avgMultiplierWithBonus = totalBets > 0
        ? Number(((sumOfMultipliers + sumOfStreakBonuses) / totalBets).toFixed(2))
        : 0;

    const isGameWon = isWin || currentPoints >= goalPoints;

    useEffect(() => {
        if (isGameWon && betInputRef.current) {
            betInputRef.current.blur();
        }
    }, [isGameWon]);

    useEffect(() => {
        const handleClick = () => {
            if (!seriesResult && (seriesBanner === "YOU WON!" || seriesBanner === "YOU LOST!")) {
                applyPendingSeriesChange();
                clearTimeout(seriesResultTimeoutRef.current);
                clearTimeout(seriesResetTimeoutRef.current);
                resetSeriesState();
                setIsSeriesActive(false);
                setIsLocked(false);
                setHistory([]);
                return;
            }

            if (seriesResult) {
                setSeriesResult(null);
                clearTimeout(seriesResetTimeoutRef.current);
                resetSeriesState();
                setIsSeriesActive(false);
                setIsLocked(false);
                setHistory([]);
            }
        };

        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seriesResult, seriesBanner]);

    useEffect(() => {
        const pending = JSON.parse(localStorage.getItem("pendingSeriesApply") || "null");
        if (pending) {
            const now = Date.now();
            const remaining = Math.max(0, (pending.delayEndsAt ?? (pending.timestamp + SERIES_APPLY_DELAY)) - now);
            if (remaining === 0) {
                setCurrentPoints(pending.newPoints);
                setMaxPointsReached((prev) => Math.max(prev, pending.newPoints));
                setPointsChange(pending.change);
                saveGameState({ currentPoints: pending.newPoints });
                localStorage.removeItem("pendingSeriesApply");
            } else {
                if (seriesApplyTimeoutRef.current) clearTimeout(seriesApplyTimeoutRef.current);
                seriesApplyTimeoutRef.current = setTimeout(() => {
                    const still = JSON.parse(localStorage.getItem("pendingSeriesApply") || "null");
                    if (!still) return;
                    setCurrentPoints(still.newPoints);
                    setMaxPointsReached((prev) => Math.max(prev, still.newPoints));
                    setPointsChange(still.change);
                    saveGameState({ currentPoints: still.newPoints });
                    localStorage.removeItem("pendingSeriesApply");
                    seriesApplyTimeoutRef.current = null;
                }, remaining);
            }
        }

        const end = localStorage.getItem("seriesEndTime");
        if (end) {
            const elapsed = Date.now() - parseInt(end, 10);
            if (elapsed < SERIES_RESET_WINDOW) {
                setIsSeriesActive(false);
                resetSet();
                setSeriesBanner(null);
                setSeriesResult(null);
            }
            localStorage.removeItem("seriesEndTime");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const overtimeTarget = 10 + overtimeBlock * 3;

    return (
        <div className={css.container}>
            {showDifficultyOverlay && (
                <div className={css.intro_overlay}>
                    <div className={css.intro_content} style={{ maxHeight: "85vh", overflowY: "auto" }}>
                        <p className={css.info_text}>Select Difficulty:</p>
                        <p className={`${css.unstable_note}`} style={{ fontSize: '20px', margin: '0', textAlign: 'center', maxWidth: '60ch' }}>
                            Win streak is available on every difficulty.
                            After 5 win streak, you'll get +0.20x bonus to your randomly generated multiplier.
                            With every other increase of win streak, you get +0.20x more, and so you can get +1.00x bonus with 8 win streak and so on...
                        </p>

                        <select
                            value={difficulty}
                            onChange={(e) => handleSelectDifficulty(e.target.value)}
                            className={css.nativeSelect}
                        >
                            <option value=""></option>
                            {Object.keys(DIFFICULTIES).map((key) => (
                                <option key={key} value={key}>{key}</option>
                            ))}
                        </select>

                        <button
                            type="button"
                            className={css.toggleButton}
                            onClick={toggleDropdown}
                            ref={buttonRef}
                            aria-haspopup="listbox"
                            aria-expanded={open}
                        >
                            <span
                                className={
                                    difficulty === "LUCK GOD"
                                        ? css.luckGodShimmer
                                        : difficulty === "Eternal Madness"
                                            ? css.eternalMadnessShimmer
                                            : ''
                                }
                            >
                                {selectedLabel}
                            </span>
                            <span className={css.arrow} />
                        </button>

                        {open && (
                            <>
                                <ul
                                    ref={dropdownRef}
                                    role="listbox"
                                    className={`${css.dropdownList} ${open ? css.open : ""}`}
                                    style={{ position: "fixed", ...dropdownCoords.current }}
                                >
                                    {Object.keys(DIFFICULTIES).map((key) => (
                                        <li
                                            key={key}
                                            data-difficulty={key}
                                            role="option"
                                            aria-selected={difficulty === key}
                                            tabIndex={0}
                                            className={`${css.option} ${difficulty === key ? css.selected : ""}`}
                                            onClick={() => handleSelectDifficulty(key)}
                                            onKeyDown={(e) =>
                                                (e.key === "Enter" || e.key === " ") && handleSelectDifficulty(key)
                                            }
                                            onMouseEnter={(e) => {
                                                const itemRect = e.currentTarget.getBoundingClientRect();
                                                const dropdownRect = dropdownRef.current?.getBoundingClientRect();

                                                if (dropdownRect) {
                                                    let tooltipTop = itemRect.top + itemRect.height / 2;
                                                    setTooltipCoords({
                                                        top: tooltipTop,
                                                        left: dropdownRect.right + 10,
                                                    });
                                                }

                                                setHoveredDifficulty(key);
                                            }}
                                            onMouseLeave={() => setHoveredDifficulty(null)}
                                        >
                                            {key}
                                        </li>
                                    ))}
                                </ul>

                                {hoveredDifficulty && (
                                    <div
                                        ref={tooltipRef}
                                        className={css.info_popup}
                                        style={{ position: "fixed", top: tooltipCoords.top, left: tooltipCoords.left }}
                                    >
                                        <p>
                                            <strong>Start:</strong>{" "}
                                            {DIFFICULTIES[hoveredDifficulty].start[0] === DIFFICULTIES[hoveredDifficulty].start[1]
                                                ? DIFFICULTIES[hoveredDifficulty].start[0]
                                                : `${DIFFICULTIES[hoveredDifficulty].start[0]} to ${DIFFICULTIES[hoveredDifficulty].start[1]}`
                                            }
                                        </p>
                                        <p><strong>Goal:</strong> {DIFFICULTIES[hoveredDifficulty].goal[0]} to {DIFFICULTIES[hoveredDifficulty].goal[1]}</p>
                                        <p><strong>Multiplier:</strong> {DIFFICULTIES[hoveredDifficulty].multiplier[0]}x to {DIFFICULTIES[hoveredDifficulty].multiplier[1]}x</p>
                                        {DIFFICULTIES[hoveredDifficulty].unstableMin && (
                                            <p className={css.unstable_note}>⚠️ Unstable minimum multiplier</p>
                                        )}
                                        {DIFFICULTIES[hoveredDifficulty].jackpot && (
                                            <p className={css.unstable_note}>
                                                🎰 Jackpot possible (chance of {DIFFICULTIES[hoveredDifficulty].jackpot.chance * 100}%): {''} {DIFFICULTIES[hoveredDifficulty].jackpot.range[0]}x to {DIFFICULTIES[hoveredDifficulty].jackpot.range[1]}x
                                            </p>
                                        )}
                                        {DIFFICULTIES[hoveredDifficulty].superjackpot && (
                                            <p className={css.unstable_note}>
                                                🌈💥 Super Jackpot possible (chance of {DIFFICULTIES[hoveredDifficulty].superjackpot.chance * 100}%): {''}
                                                {DIFFICULTIES[hoveredDifficulty].superjackpot.range[0]}x to {DIFFICULTIES[hoveredDifficulty].superjackpot.range[1]}x
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {difficulty && (
                            <div className={css.mode_select_container} style={{ marginTop: 20 }}>
                                <p className={css.info_text}>Select Mode:</p>
                                <div className={css.mode_buttons}>
                                    <button
                                        className={`${css.gamble_button} ${seriesModeDraft === "normal" ? css.active_mode : ""}`}
                                        onMouseEnter={() => setHoveredMode("normal")}
                                        onMouseLeave={() => setHoveredMode(null)}
                                        onClick={() => setSeriesModeDraft("normal")}
                                    >
                                        Standard
                                    </button>

                                    <button
                                        className={`${css.gamble_button} ${seriesModeDraft === "extended" ? css.active_mode : ""}`}
                                        onMouseEnter={() => setHoveredMode("extended")}
                                        onMouseLeave={() => setHoveredMode(null)}
                                        onClick={() => setSeriesModeDraft("extended")}
                                    >
                                        Extended
                                    </button>
                                </div>

                                {hoveredMode === "normal" && (
                                    <div
                                        ref={tooltipRef}
                                        className={css.info_popup}
                                        style={{ position: "fixed", top: tooltipCoords.top, left: tooltipCoords.left }}
                                    >
                                        🎯 Just a normal mode, nothing special.
                                    </div>
                                )}
                                {hoveredMode === "extended" && (
                                    <div
                                        ref={tooltipRef}
                                        className={css.info_popup}
                                        style={{ position: "fixed", top: tooltipCoords.top, left: tooltipCoords.left }}
                                    >
                                        🏆 In Extended mode , you'll be able to play a Best-of-1/3/5 series.<br />
                                        Win 1/2/3 sets to triumph! Your final gain or loss will depend on your match score.<br />
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            className={`${css.proceed_button} ${!difficulty || !seriesModeDraft ? css.locked : ""}`}
                            onClick={startGame}
                            disabled={!difficulty || !seriesModeDraft}
                            style={{ marginTop: 20 }}
                        >
                            Let's go?
                        </button>
                    </div>
                </div>
            )}

            {showIntro && (
                <div className={css.intro_overlay}>
                    <div className={css.intro_content}>
                        <h2 className={`${css.game_title} ${difficulty === "LUCK GOD"
                            ? css.rainbowText
                            : difficulty === "Eternal Madness"
                                ? css.eternalMadnessText
                                : ''
                            }`}>
                            {seriesMode === "extended" ? "Extended" : "Standard"} — {difficulty} Mode
                        </h2>

                        <div className={css.fade_in}>
                            <p className={css.info_text}>Your current points:</p>
                            {DIFFICULTIES[difficulty].start[0] !== DIFFICULTIES[difficulty].start[1] && (
                                <p className={`${css.small_text} ${css.fade_in_delay}`}>
                                    Range: {DIFFICULTIES[difficulty].start[0]} to {DIFFICULTIES[difficulty].start[1]}
                                </p>
                            )}
                            <div className={`${css.points} ${css.slide_in_left}`}>
                                <CountUp start={0} end={currentPoints} duration={1.2} />
                            </div>
                        </div>

                        <div className={css.fade_in_delay}>
                            <p className={css.info_text}>Goal:</p>
                            <p className={`${css.small_text} ${css.fade_in_delay}`}>
                                Range: {DIFFICULTIES[difficulty].goal[0]} to {DIFFICULTIES[difficulty].goal[1]}
                            </p>
                            <div className={`${css.points} ${css.slide_in_left}`}>
                                <CountUp start={0} end={goalPoints} duration={1.2} />
                            </div>
                        </div>

                        <p className={`${css.info_text} ${css.fade_in_delay_more}`}>
                            The multiplier varies from{" "}
                            <span style={{ color: "red" }}>
                                {DIFFICULTIES[difficulty].unstableMin ? "0x" : `${DIFFICULTIES[difficulty].multiplier[0]}x`}
                            </span>{" "}
                            to{" "}
                            <span style={{ color: "green" }}>
                                {DIFFICULTIES[difficulty].multiplier[1]}x
                            </span>.
                        </p>

                        <p className={`${css.unstable_note} ${css.fade_in_delay_more}`} style={{ fontSize: '20px', marginTop: '0', textAlign: 'center', maxWidth: '60ch' }}>
                            After 5 win streak, you'll get +0.20x bonus to your randomly generated multiplier.
                            With every other increase of win streak, you get +0.20x more, and so you can get +1.00x bonus with 8 win streak and so on...
                        </p>

                        {seriesMode === "extended" && (
                            <p className={`${css.unstable_note} ${css.fade_in_delay_more}`} style={{ fontSize: '24px', marginTop: '16px', textAlign: "center", maxWidth: "60ch" }}>
                                🏆 In Extended — {difficulty} Mode, you'll be able to play a Best-of-{setsToWin === 2 ? 3 : setsToWin === 3 ? 5 : 1} series.<br />
                                Win {setsToWin === 2 ? 2 : setsToWin === 3 ? 3 : 1} {setsToWin === 1 ? 'set' : 'sets'} to triumph! Your final gain or loss will depend on your match score.<br />
                                Tipp: Start playing Best-of-{setsToWin === 2 ? 3 : setsToWin === 3 ? 5 : 1} only when you have at least 100 points to avoid small gains from big wins.
                            </p>
                        )}

                        <button className={`${css.proceed_button} ${css.fade_in_delay_more}`} onClick={() => setShowIntro(false)}>
                            Start Game
                        </button>
                    </div>
                </div>
            )}

            {!showIntro && !showDifficultyOverlay && (
                <>
                    <p className={css.info_text} style={{ marginTop: "12px", fontWeight: "bold" }}>
                        {seriesMode === "extended" ? "Extended" : "Standard"}
                    </p>
                    <h2 className={`${css.game_title} ${difficulty === "LUCK GOD"
                        ? css.rainbowText
                        : difficulty === "Eternal Madness"
                            ? css.eternalMadnessText
                            : ''
                        }`}>
                        {difficulty} Mode
                    </h2>

                    {seriesMode === "extended" && (
                        <div className={css.best_of_9_container}>
                            {!isSeriesActive ? (
                                <button
                                    className={css.gamble_button}
                                    onClick={startSeries}
                                    disabled={isButtonLocked}
                                    style={{ marginTop: "8px", marginBottom: "8px" }}
                                >
                                    Wanna more at once?
                                </button>
                            ) : (
                                <div className={css.scoreboard}>
                                    <div style={{ display: 'flex', flexDirection: "column", alignItems: 'center', gap: '12px', opacity: loserOpacity === "win" ? 0.4 : 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            <span className={css.round_text}>
                                                <CountUp
                                                    key={roundWins}
                                                    start={Math.max(roundWins - 1, 0)}
                                                    end={roundWins}
                                                    duration={1}
                                                    style={{ color: "limegreen", fontSize: '40px', transition: 'all 2000ms ease-in-out', textShadow: roundWins === overtimeTarget ? '0 0 10px rgba(0, 255, 0, 1)' : 'none' }}
                                                />
                                            </span>
                                        </div>
                                        <div
                                            className={`${css.squares} ${css.winRow}`}
                                        >
                                            {setsToWin === 3 ? (
                                                <>
                                                    <span style={{ width: '16px' }} className={`${css.square} ${playerSets >= 1 ? css.squareWin : css.squareDarkWin}`} />
                                                    <span style={{ width: '16px' }} className={`${css.square} ${playerSets >= 2 ? css.squareWin : css.squareDarkWin}`} />
                                                    <span style={{ width: '16px' }} className={`${css.square} ${playerSets >= 3 ? css.squareWin : css.squareDarkWin}`} />
                                                </>
                                            ) : setsToWin === 2 ? (
                                                <>
                                                    <span className={`${css.square} ${playerSets >= 1 ? css.squareWin : css.squareDarkWin}`} />
                                                    <span className={`${css.square} ${playerSets >= 2 ? css.squareWin : css.squareDarkWin}`} />
                                                </>
                                            ) : (
                                                <span className={`${css.square} ${playerSets >= 1 ? css.squareWin : css.squareDarkWin}`} />
                                            )}
                                        </div>
                                    </div>
                                        {seriesBanner ? (
                                            <motion.span
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                transition={{ duration: 0.4 }} className={css.round_text}
                                            >
                                                {seriesBanner}
                                            </motion.span>
                                        ) : (
                                            <div className={css.game_info_text}>
                                                    {setsToWin !== 1 && (
                                                        <motion.span
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.4 }}
                                                            className={css.round_text}
                                                            style={{ fontSize: "24px" }}
                                                        >
                                                            {(() => {
                                                                const currentSet = playerSets + opponentSets + 1;
                                                                const totalSets = setsToWin * 2 - 1;
                                                                const isDecider = currentSet === totalSets;
                                                                return isDecider ? 'Decider' : `Set ${currentSet}`;
                                                            })()}
                                                        </motion.span>
                                                    )}
                                                {isOvertime && (
                                                    <motion.span
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.4 }}
                                                        className={css.round_text}
                                                        style={{ textAlign: 'center', fontSize: '20px' }}
                                                    >
                                                        Overtime{overtimeBlock === 0 || overtimeBlock === 1 ? '' : ` #${overtimeBlock}`}!<br />
                                                    </motion.span>
                                                )}
                                                <motion.span
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.4 }}
                                                    className={css.round_text}
                                                >
                                                    {isOvertime ? (
                                                        <>
                                                            Round{" "}
                                                            <CountUp
                                                                key={roundNumber}
                                                                start={Math.max(roundNumber - 1, 0)}
                                                                end={roundNumber}
                                                                duration={1}
                                                            />
                                                            /{otMaxRounds}
                                                        </>
                                                    ) : (
                                                        <>
                                                            Round{" "}
                                                            <CountUp
                                                                key={roundWins + roundLosses + 1}
                                                                start={Math.max(roundWins + roundLosses, 0)}
                                                                end={roundWins + roundLosses + 1}
                                                                duration={1}
                                                            />
                                                            /{baseMaxRounds}
                                                        </>
                                                    )}
                                                </motion.span>
                                                <motion.span
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.4 }}
                                                    className={css.round_text}
                                                    style={{ textAlign: 'center', fontSize: '16px' }}
                                                >
                                                    First to {overtimeTarget}
                                                </motion.span>
                                            </div>
                                        )}
                                    <div style={{ display: 'flex', flexDirection: "column", alignItems: 'center', gap: '12px', opacity: loserOpacity === "loss" ? 0.4 : 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            <span className={css.round_text}>
                                                <CountUp
                                                    key={roundLosses}
                                                    start={Math.max(roundLosses - 1, 0)}
                                                    end={roundLosses}
                                                    duration={1}
                                                    style={{ color: "red", fontSize: '40px', transition: 'all 2000ms ease-in-out', textShadow: roundLosses === overtimeTarget ? '0 0 10px rgba(255, 0, 0, 1)' : 'none' }}
                                                />
                                            </span>
                                        </div>

                                        <div className={css.squares}>
                                            {setsToWin === 3 ? (
                                                <>
                                                    <span style={{ width: '16px' }} className={`${css.square} ${opponentSets >= 1 ? css.squareLoss : css.squareDarkLoss}`} />
                                                    <span style={{ width: '16px' }} className={`${css.square} ${opponentSets >= 2 ? css.squareLoss : css.squareDarkLoss}`} />
                                                    <span style={{ width: '16px' }} className={`${css.square} ${opponentSets >= 3 ? css.squareLoss : css.squareDarkLoss}`} />
                                                </>
                                            ) : setsToWin === 2 ? (
                                                <>
                                                    <span className={`${css.square} ${opponentSets >= 1 ? css.squareLoss : css.squareDarkLoss}`} />
                                                    <span className={`${css.square} ${opponentSets >= 2 ? css.squareLoss : css.squareDarkLoss}`} />
                                                </>
                                            ) : (
                                                <span className={`${css.square} ${opponentSets >= 1 ? css.squareLoss : css.squareDarkLoss}`} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {seriesResult && (
                        <>
                            {setsToWin !== 1 && (
                                <DelayedMount delay={3000}>
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className={css.seriesSummary}>
                                        <ul className={css.seriesSummaryList}>
                                            {setHistory.map(({ set, wins, losses, won }) => {
                                                const totalSets = setsToWin * 2 - 1;
                                                const isDecider = set === totalSets;
                                                const label = isDecider ? 'Decider' : `Set ${set}`;

                                                return (
                                                    <li key={set} style={{ fontSize: '20px' }}>
                                                        <span className={css.multiplier_win} style={{ color: won === true ? '#2e7d32' : won === false ? '#2e7d32' : '', fontWeight: '700', opacity: won === true ? 1 : won === false ? 0.4 : '' }}>
                                                            {wins}
                                                        </span>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                                        <span style={{ fontWeight: '600' }} className={css.info_text}>{label}</span>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                                        <span className={css.multiplier_fail} style={{ color: won === true ? 'red' : won === false ? 'red' : '', fontWeight: '700', opacity: won === true ? 0.4 : won === false ? 1 : '' }}>
                                                            {losses}
                                                        </span>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </motion.div>
                                </DelayedMount>
                            )}
                            <DelayedMount delay={SERIES_APPLY_DELAY}>
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className={css.series_result}
                                >
                                    <p>
                                        and because you{" "}
                                        <span style={{ fontWeight: "bold" }} className={seriesResult.isWin ? css.multiplier_win : css.multiplier_fail}>
                                            {seriesResult.isWin ? "won" : "lost"}
                                        </span>{" "}
                                        with the score of{" "}
                                        <span style={{ fontWeight: "bold" }} className={css.multiplier_win}>
                                            {playerSets}
                                        </span>
                                        -
                                        <span style={{ fontWeight: "bold" }} className={css.multiplier_fail}>
                                            {opponentSets}
                                        </span>, you{" "}
                                        <span style={{ fontWeight: "bold" }} className={seriesResult.isWin ? css.multiplier_win : css.multiplier_fail}>
                                            {seriesResult.isWin ? "gain" : "lose"}
                                        </span>{" "}
                                        <span style={{ fontWeight: "bold" }} className={getHitRateClass(seriesResult.percent)}>
                                            {seriesResult.percent}%
                                        </span>
                                        .
                                    </p>
                                </motion.div>
                            </DelayedMount>
                        </>
                    )}
                    <div className={css.points_container}>
                        <div className={css.streak_points_container}>
                            <div className={css.streakWrapper}>
                                <AnimatePresence>
                                    {consecutiveWins >= 2 && (
                                        <motion.div
                                            key="winStreak"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className={css.streakDisplay}
                                        >
                                            🔥
                                            <span className={css.streakNumber} style={{ color: consecutiveWins >= 5 ? '#4a2a00ff' : '' }}>{consecutiveWins}</span>
                                        </motion.div>
                                    )}
                                    {consecutiveLosses >= 2 && (
                                        <motion.div
                                            key="lossStreak"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className={css.streakDisplay}
                                        >
                                            💀
                                            <span className={css.streakNumber} style={{ color: consecutiveLosses >= 5 ? '#4a2a00ff' : '' }}>{consecutiveLosses}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className={css.points_text_container}>
                                <p className={css.info_text}>Your current points:</p>
                                <div className={css.another_points_text_container}>
                                    <div className={css.points} style={getCurrentPointsStyle()}>
                                        <CountUp
                                            start={prevPointsRef.current}
                                            end={currentPoints}
                                            duration={1.2}
                                            onEnd={() => (prevPointsRef.current = currentPoints)}
                                            key={currentPoints}
                                        />
                                    </div>
                                    {seriesResult ? (pointsChange !== null && (
                                        <span
                                            className={css.points_gain_loss}
                                            style={{ color: pointsChange >= 0 ? "green" : "red" }}
                                        >
                                            {pointsChange >= 0 ? `+${pointsChange}` : pointsChange}
                                        </span>
                                    )) : (pointsChange !== null && (
                                        <span
                                            className={css.points_gain_loss}
                                            style={{ color: pointsChange >= 0 ? "green" : "red" }}
                                        >
                                            {pointsChange >= 0 ? `+${pointsChange}` : pointsChange}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={css.points_text_container} style={{ marginLeft: consecutiveWins >= 2 || consecutiveLosses >= 2 ? '80px' : '25px', transition: 'margin 1000ms ease-in-out' }}>
                            <p className={css.info_text}>Goal:</p>
                            <div className={css.points}>
                                <CountUp
                                    start={prevGoalRef.current}
                                    end={goalPoints}
                                    duration={1.2}
                                    onEnd={() => (prevGoalRef.current = goalPoints)}
                                    key={goalPoints}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={css.input_container}>
                        <input
                            type="number"
                            value={bet}
                            onChange={handleBetChange}
                            onKeyDown={handleKeyDown}
                            className={css.input}
                            placeholder="Gamble?"
                            ref={betInputRef}
                            disabled={isGameWon || isSeriesActive}
                            style={{
                                pointerEvents: isGameWon || isSeriesActive ? "none" : "auto",
                                opacity: isSeriesActive ? 0.0 : 1,
                                display: isSeriesActive ? "none" : "inline-block",
                                transition: 'opacity 300ms ease-in-out'
                            }}
                        />
                        <button
                            type="button"
                            className={`${css.clear_button} ${isButtonLocked ? css.locked : ""}`}
                            onClick={() => setBet('')}
                            disabled={isGameWon || isButtonLocked || isSeriesActive}
                            style={{
                                pointerEvents: isGameWon || isButtonLocked || isSeriesActive ? "none" : "auto",
                                display: isSeriesActive ? "none" : "inline-block",
                                opacity: isSeriesActive ? 0.0 : 1
                            }}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            className={`${css.max_button} ${isButtonLocked ? css.locked : ""}`}
                            onClick={() => setBet(currentPoints.toString())}
                            disabled={isGameWon || isButtonLocked || isSeriesActive}
                            style={{
                                pointerEvents: isGameWon || isButtonLocked || isSeriesActive ? "none" : "auto",
                                display: isSeriesActive ? "none" : "inline-block",
                                opacity: isSeriesActive ? 0.0 : 1
                            }}
                        >
                            Max
                        </button>
                        <button
                            name="gamble"
                            onClick={handleGamble}
                            className={`${css.gamble_button} ${isGambleButtonLocked ? css.locked : ""}`}
                            disabled={isGambleButtonLocked || seriesResult}
                            style={{ pointerEvents: isGameWon ? "none" : "auto" }}
                        >
                            Gamble
                        </button>
                    </div>

                    {resultMessage && (
                        <p className={`${css.info_text} ${css.result_message}`}>
                            <AnimatePresence mode="wait">
                                {jackpotType === "superjackpot" ? (
                                    <motion.span
                                        key="superjackpot"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1.5 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.6 }}
                                        className={css.superjackpotFlash}
                                    >
                                        🌈💥 SUPER JACKPOT!!! 🚀
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="normal"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        {resultMessage}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {multiplier !== null && (
                                <>
                                    {" "}Your multiplier is
                                    <span className={`${css.multiplier} ${getMultiplierClass(multiplier - winStreakBonus)}`}>
                                        {DIFFICULTIES[difficulty].unlimited
                                            ? (multiplier - winStreakBonus).toFixed(4)
                                            : (multiplier - winStreakBonus).toFixed(2)}x
                                    </span>
                                    !
                                    {winStreakBonus > 0 && (
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key="streakbonus"
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1.5 }}
                                                exit={{ opacity: 0, scale: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                                                transition={{ duration: 1 }}
                                                style={{ color: "gold", fontWeight: 'bolder', fontStyle: 'italic', marginLeft: '12px' }}
                                            >
                                                +{winStreakBonus.toFixed(2)}x streak bonus!
                                            </motion.span>
                                        </AnimatePresence>
                                    )}
                                </>
                            )}
                        </p>
                    )}

                    <div className={css.bottom_buttons}>
                        <button
                            className={`${css.restart_button} ${isButtonLocked ? css.locked : ""}`}
                            onClick={() => setIsRestartModalOpen(true)}
                            disabled={isButtonLocked}
                            style={{ pointerEvents: isGameWon ? "none" : "auto" }}
                        >
                            Restart the game?
                        </button>
                        <button
                            className={`${css.restart_button} ${isButtonLocked ? css.locked : ""}`}
                            onClick={() => setIsTerminateModalOpen(true)}
                            disabled={isButtonLocked}
                            style={{ pointerEvents: isGameWon ? "none" : "auto" }}
                        >
                            Terminate the game?
                        </button>
                    </div>

                    {isRestartModalOpen && (
                        <div className={css.restart_modal}>
                            <p className={css.restart_text}>Are you sure you want to restart the game?</p>
                            <div className={css.restart_buttons}>
                                <button className={css.cancel_button} onClick={() => setIsRestartModalOpen(false)}>Cancel</button>
                                <button className={css.confirm_button} onClick={confirmRestart}>Restart</button>
                            </div>
                        </div>
                    )}

                    {isTerminateModalOpen && (
                        <div className={css.restart_modal}>
                            <p className={css.restart_text}>Are you sure you want to terminate the game?</p>
                            <div className={css.restart_buttons}>
                                <button className={css.cancel_button} onClick={() => setIsTerminateModalOpen(false)}>Cancel</button>
                                <button className={css.confirm_button} onClick={confirmTerminate}>Terminate</button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <AnimatePresence>
                {showGameOverScreen && (
                    <motion.div
                        className={`${loaderCss.modal_overlay}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <motion.div
                            className={loaderCss.game_container}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 120,
                                damping: 15,
                                duration: 0.5,
                            }}
                        >
                            <h1
                                className={css.game_title}
                                style={{
                                    color: isWin ? "#00ff7f" : "#ff4c4c",
                                    textShadow: isWin
                                        ? "0 0 5px rgba(0,255,127,0.8)"
                                        : "0 0 5px rgba(255,76,76,0.8)",
                                }}
                            >
                                {isWin ? "You Won! 🎉" : "You Lost! 😢"}
                            </h1>

                            <p className={css.info_text} style={{ fontSize: "20px" }}>
                                {DIFFICULTY_END_MESSAGES[difficulty]?.[isWin ? "win" : "lose"]}
                            </p>

                            {!isWin && (
                                <div className={css.another_points_text_container} style={{ fontSize: "22px", fontWeight: 'bolder' }}>
                                    <p className={css.info_text}>
                                        Highest points amount achieved:
                                    </p>
                                    <div className={css.points} style={getCurrentPointsStyle()}>
                                        <CountUp
                                            start={0}
                                            end={maxPointsReached}
                                            duration={2}
                                            onEnd={() => {
                                                prevPointsRef.current = maxPointsReached;
                                            }}
                                            key={maxPointsReached}
                                        />
                                    </div>
                                    <p className={css.info_text}>points</p>
                                </div>
                            )}

                            <motion.div
                                className={css.session_summary}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <p className={css.info_text} style={{ fontSize: "24px", textAlign: 'start' }}>
                                    General Info
                                </p>
                                <div className={css.divider} />
                                <p>
                                    🏆 Best multiplier:
                                    <span className={`${css.multiplier} ${getBestMultiplierClass(bestMultiplier)}`}>
                                        {bestMultiplier?.toFixed(2)}x
                                    </span>
                                </p>
                                <p>
                                    📉 Worst multiplier:
                                    <span className={`${css.multiplier} ${getBestMultiplierClass(worstMultiplier)}`}>
                                        {worstMultiplier?.toFixed(2)}x
                                    </span>
                                </p>
                                <p>🎲 Total bets made: {totalBets}</p>
                                <p>💰 Total points earned: {totalEarned}</p>
                                <p>❌ Total points lost: {totalLost}</p>
                                {(DIFFICULTIES[difficulty].jackpot || DIFFICULTIES[difficulty].superjackpot) && (
                                    <>
                                        <p className={css.info_text} style={{ fontSize: "24px", textAlign: 'start' }}>
                                            Jackpots
                                        </p>
                                        <div className={css.divider} />
                                        {DIFFICULTIES[difficulty].jackpot && (
                                            <p style={{ color: totalJackpots === 0 ? "red" : "green", fontWeight: 'bold' }}>
                                                🎰 Total jackpots: {totalJackpots}
                                            </p>
                                        )}
                                        {DIFFICULTIES[difficulty].superjackpot && (
                                            <p style={{ color: totalSuperJackpots === 0 ? "red" : "green", fontWeight: 'bold' }}>
                                                🌈💥 Total superjackpots: {totalSuperJackpots}
                                            </p>
                                        )}
                                    </>
                                )}
                                <p className={css.info_text} style={{ fontSize: "24px", textAlign: 'start' }}>
                                    Performance Stats
                                </p>
                                <div className={css.divider} />
                                <p>🎯 Hit rate:
                                    <span className={`${css.multiplier} ${getHitRateClass(hitRate)}`}>
                                        {hitRate}%
                                    </span>
                                </p>
                                <p>
                                    ⚡ Average multiplier without bonuses: <br />
                                    <span className={`${css.multiplier} ${getAvgMultiplierClass(Number(avgMultiplier))}`}>
                                        {avgMultiplier}x
                                    </span>
                                    <br />
                                </p>

                                {Number(avgMultiplierWithBonus) !== Number(avgMultiplier) && (
                                    <p>
                                        ⚡ Average multiplier with bonuses: <br />
                                        <span className={`${css.multiplier} ${getAvgMultiplierClass(Number(avgMultiplierWithBonus))}`}>
                                            {avgMultiplierWithBonus}x
                                        </span>
                                    </p>
                                )}
                                <p>💰 Biggest single win: {biggestWin} points</p>
                                <p>🔥 Longest win streak: {longestWinStreak}</p>
                                <p>💀 Longest loss streak: {longestLossStreak}</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className={css.next_actions}>
                                    <p className={css.info_text} style={{ fontSize: "20px", marginTop: '8px', fontWeight: 'bold' }}>{SUGGESTIONS[difficulty][isWin ? "win" : "lose"]}</p>
                                    <div className={css.button_group}>
                                        <button className={css.gamble_button} onClick={restartSameDifficulty}>
                                            Retry Same Difficulty
                                        </button>
                                        <button
                                            className={css.gamble_button}
                                            onClick={confirmRestart}
                                        >
                                            Try New Difficulty
                                        </button>
                                        <button className={css.gamble_button} onClick={() => {
                                            navigate("/");
                                            confirmRestart();
                                        }}>
                                            Go to Home
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GamblingPage;