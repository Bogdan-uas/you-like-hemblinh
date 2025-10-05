import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CountUp from "react-countup";
import { randomUniform, randomNormal } from "d3-random";
import css from "./GamblingPage.module.css";
import loaderCss from "../../components/Loader/Loader.module.css";

const STORAGE_KEY = "gamblingGameState";

const DIFFICULTIES = {
    Easy: { start: [500, 1000], goal: [5000, 7500], multiplier: [0.5, 3.0] },
    Normal: { start: [250, 750], goal: [5000, 10000], multiplier: [0.5, 3.0] },
    Hard: { start: [100, 500], goal: [10000, 20000], multiplier: [0.1, 2.0] },
    Impossible: { start: [100, 250], goal: [15000, 30000], multiplier: [0.1, 2.0], unstableMin: true },
    "LUCK GOD": { start: [25, 25], goal: [50000, 100000], multiplier: [0.1, 2.0], unstableMin: true },
};

const GamblingPage = () => {
    const [difficulty, setDifficulty] = useState("");
    const [showDifficultyOverlay, setShowDifficultyOverlay] = useState(true);
    const [showIntro, setShowIntro] = useState(false);

    const [currentPoints, setCurrentPoints] = useState(0);
    const [goalPoints, setGoalPoints] = useState(0);
    const [bet, setBet] = useState("");
    const [isCalculating, setIsCalculating] = useState(false);
    const [resultMessage, setResultMessage] = useState("");
    const [multiplier, setMultiplier] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [pointsChange, setPointsChange] = useState(null);
    const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
    const [hoveredDifficulty, setHoveredDifficulty] = useState(null);
    const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });

    const navigate = useNavigate();
    const prevPointsRef = useRef(0);
    const prevGoalRef = useRef(0);
    const firstGambleRef = useRef(false);

    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const dropdownCoords = useRef({});
    const selectedLabel = difficulty || "Select difficulty";

    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            const parsed = JSON.parse(savedState);
            setDifficulty(parsed.difficulty);
            setCurrentPoints(parsed.currentPoints);
            setGoalPoints(parsed.goalPoints);
            prevPointsRef.current = parsed.currentPoints;
            prevGoalRef.current = parsed.goalPoints;
            firstGambleRef.current = true;
            setShowDifficultyOverlay(false);
            setShowIntro(false);
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
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const saveGameState = (newState) => {
        const stateToSave = {
            difficulty,
            currentPoints,
            goalPoints,
            ...newState,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    };

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
    };

    const startGame = () => {
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
        setBet("");
        setIsCalculating(false);
        setResultMessage("");
        setMultiplier(null);
        setGameOver(false);
        setIsWin(false);
        setPointsChange(null);
        setShowIntro(true);
        setShowDifficultyOverlay(false);

        saveGameState({ currentPoints: starter, goalPoints: goalPts });
    };

    const handleBetChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) setBet(value);
    };

    const handleGamble = () => {
        if (!bet) return toast.error("Please enter a bet amount!");
        firstGambleRef.current = true;

        const betAmount = parseInt(bet, 10);
        if (betAmount === 0) return toast.error("You can't gamble with 0 points!");
        if (betAmount > currentPoints) return toast.error("You don't have enough points!");

        const { multiplier: [min, max], unstableMin } = DIFFICULTIES[difficulty];

        const previousPoints = currentPoints;
        setCurrentPoints(prev => prev - betAmount);
        setBet("");
        setResultMessage("Calculating...");
        setMultiplier(null);
        setPointsChange(null);
        setIsCalculating(true);

        let rawMultiplier;
        if (unstableMin) {
            const randomMinGen = randomUniform(0, min);
            const dynamicMin = randomMinGen();
            const unstableGen = randomNormal((max + dynamicMin) / 2, (max - dynamicMin) / 6);
            rawMultiplier = Math.min(Math.max(unstableGen(), dynamicMin), max);
        } else {
            const mean = (min + max) / 2;
            const stdDev = (max - min) / 6;
            const normalGen = randomNormal(mean, stdDev);
            rawMultiplier = Math.min(Math.max(normalGen(), min), max);
        }

        const roundedMultiplier = Math.round(rawMultiplier * 100) / 100;
        const winnings = Math.round(betAmount * roundedMultiplier);

        setTimeout(() => {
            setMultiplier(roundedMultiplier);
            let message;
            if (roundedMultiplier < 1.0) message = "What a failure😢!";
            else if (roundedMultiplier <= 1.4) message = "Mid😕!";
            else message = "Congratulations👏!";
            setResultMessage(message);

            const newPoints = Math.round(previousPoints - betAmount + winnings);
            setCurrentPoints(newPoints);
            setPointsChange(newPoints - previousPoints);

            saveGameState({ currentPoints: newPoints });

            if (newPoints >= goalPoints) {
                setIsWin(true);
                setGameOver(true);
                localStorage.removeItem(STORAGE_KEY);
            } else if (newPoints <= 0) {
                setIsWin(false);
                setGameOver(true);
                localStorage.removeItem(STORAGE_KEY);
            }

            setIsCalculating(false);
        }, 3000);
    };

    const confirmRestart = () => {
        localStorage.removeItem(STORAGE_KEY);
        setDifficulty("");
        setShowDifficultyOverlay(true);
        setShowIntro(false);
        setIsRestartModalOpen(false);
        setGameOver(false);
        setIsWin(false);
    };

    const confirmTerminate = () => {
        localStorage.removeItem(STORAGE_KEY);
        setIsTerminateModalOpen(false);
        navigate("/");
    };

    const isButtonLocked = isCalculating || isRestartModalOpen || isTerminateModalOpen;
    const isGambleButtonLocked = !bet;

    const getMultiplierClass = () => {
        if (multiplier === null) return "";
        if (multiplier < 1.0) return css.multiplier_fail;
        if (multiplier <= 1.4) return css.multiplier_mid;
        return css.multiplier_win;
    };

    const getCurrentPointsStyle = () => {
        if (!firstGambleRef.current) {
            return { backgroundColor: "#ccc", color: "#2e2f42" };
        }

        const RED_FADE_THRESHOLDS = {
            Easy: 1000,
            Normal: 750,
            Hard: 500,
            Impossible: 2500,
            "LUCK GOD": 10000,
        };

        const fadeThreshold = RED_FADE_THRESHOLDS[difficulty] || 200;
        const ratio = Math.min(currentPoints / goalPoints, 1);
        let r, g, b;

        if (currentPoints <= fadeThreshold) {
            r = 255; g = 0; b = 0;
        } else if (ratio < 0.5) {
            const t = (currentPoints - fadeThreshold) / ((goalPoints / 2) - fadeThreshold);
            r = Math.round(255 * (1 - t) + 117 * t);
            g = Math.round(77 * (1 - t) + 117 * t);
            b = Math.round(77 * (1 - t) + 117 * t);
        } else {
            const t = (ratio - 0.5) / 0.5;
            r = Math.round(117 * (1 - t) + 46 * t);
            g = Math.round(117 * (1 - t) + 125 * t);
            b = Math.round(117 * (1 - t) + 50 * t);
        }

        return { backgroundColor: `rgb(${r},${g},${b})`, color: "#fff" };
    };

    return (
        <div className={css.container}>
            {showDifficultyOverlay && (
                <div className={css.intro_overlay}>
                    <div className={css.intro_content}>
                        <p className={css.info_text}>Select Difficulty:</p>
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
                            <span className={difficulty === "LUCK GOD" ? css.rainbowText : ""}>
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
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setTooltipCoords({ top: rect.top + rect.height / 2, left: rect.right + 10 });
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
                                        className={css.info_popup}
                                        style={{ position: "fixed", top: tooltipCoords.top, left: tooltipCoords.left }}
                                    >
                                        <p><strong>Start:</strong> {DIFFICULTIES[hoveredDifficulty].start[0]} to {DIFFICULTIES[hoveredDifficulty].start[1]}</p>
                                        <p><strong>Goal:</strong> {DIFFICULTIES[hoveredDifficulty].goal[0]} to {DIFFICULTIES[hoveredDifficulty].goal[1]}</p>
                                        <p><strong>Multiplier:</strong> {DIFFICULTIES[hoveredDifficulty].multiplier[0]}x to {DIFFICULTIES[hoveredDifficulty].multiplier[1]}x</p>
                                        {DIFFICULTIES[hoveredDifficulty].unstableMin && (
                                            <p className={css.unstable_note}>⚠️ Unstable minimum multiplier</p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            className={`${css.proceed_button} ${!difficulty ? css.locked : ""}`}
                            onClick={startGame}
                            disabled={!difficulty}
                        >
                            Proceed?
                        </button>
                    </div>
                </div>
            )}

            {showIntro && (
                <div className={css.intro_overlay}>
                    <div className={css.intro_content}>
                        <h2 className={`${css.game_title} ${difficulty === "LUCK GOD" ? css.luckGodShimmer : ""}`}>
                            {difficulty} Mode
                        </h2>
                        <div className={css.fade_in}>
                            <p className={css.info_text}>Your current points:</p>
                            <p className={`${css.small_text} ${css.fade_in_delay}`}>
                                Range: {DIFFICULTIES[difficulty].start[0]} to {DIFFICULTIES[difficulty].start[1]}
                            </p>
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
                                {DIFFICULTIES[difficulty].unstableMin ? "as low as 0x" : `${DIFFICULTIES[difficulty].multiplier[0]}x`}
                            </span>{" "}
                            to{" "}
                            <span style={{ color: "green" }}>
                                {DIFFICULTIES[difficulty].multiplier[1]}x
                            </span>.
                        </p>

                        <button
                            className={`${css.proceed_button} ${css.fade_in_delay_more}`}
                            onClick={() => setShowIntro(false)}
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            )}
            {!showIntro && !showDifficultyOverlay && (
                <>
                    <h2 className={`${css.game_title} ${difficulty === "LUCK GOD" ? css.luckGodShimmer : ""}`}>
                        {difficulty} Mode
                    </h2>

                    <div className={css.points_container}>
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
                                {pointsChange !== null && (
                                    <span
                                        className={css.points_gain_loss}
                                        style={{ color: pointsChange >= 0 ? "green" : "red" }}
                                    >
                                        {pointsChange >= 0 ? `+${pointsChange}` : pointsChange}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={css.points_text_container}>
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
                            className={css.input}
                            placeholder="Gamble?"
                        />
                        <button
                            onClick={handleGamble}
                            className={`${css.gamble_button} ${isButtonLocked || isGambleButtonLocked ? css.locked : ""}`}
                            disabled={isButtonLocked || isGambleButtonLocked}
                        >
                            Gamble
                        </button>
                    </div>

                    {resultMessage && (
                        <p className={`${css.info_text} ${css.result_message}`}>
                            {resultMessage}
                            {multiplier !== null && (
                                <>
                                    {" "}Your multiplier is
                                    <span className={`${css.multiplier} ${getMultiplierClass()}`}>
                                        {DIFFICULTIES[difficulty].unlimited
                                            ? multiplier.toFixed(4)
                                            : multiplier.toFixed(2)}x
                                    </span>
                                    !
                                </>
                            )}
                        </p>
                    )}

                    <div className={css.bottom_buttons}>
                        <button
                            className={`${css.restart_button} ${isButtonLocked ? css.locked : ""}`}
                            onClick={() => setIsRestartModalOpen(true)}
                            disabled={isButtonLocked}
                        >
                            Restart the game?
                        </button>
                        <button
                            className={`${css.restart_button} ${isButtonLocked ? css.locked : ""}`}
                            onClick={() => setIsTerminateModalOpen(true)}
                            disabled={isButtonLocked}
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

            {gameOver && (
                <div className={`${loaderCss.modal_overlay} ${gameOver ? loaderCss.show : ""}`}>
                    <div className={loaderCss.game_container}>
                        <h1 className={css.game_title}>
                            {isWin ? "You Won! 🎉" : "You Lost! 😢"}
                        </h1>
                        <p className={css.info_text} style={{ fontSize: "20px" }}>
                            {isWin ? "You have achieved your goal!" : "You have no points left!"}
                        </p>
                        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                            <button className={css.gamble_button} onClick={confirmRestart}>
                                Try Again!
                            </button>
                            <button className={css.gamble_button} onClick={() => navigate("/")}>
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GamblingPage;