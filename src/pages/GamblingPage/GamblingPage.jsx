import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CountUp from "react-countup";
import css from "./GamblingPage.module.css";
import loaderCss from "../../components/Loader/Loader.module.css";

const STORAGE_KEY = "gamblingGameState";

const GamblingPage = () => {
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
    const [showIntro, setShowIntro] = useState(false);

    const navigate = useNavigate();
    const prevPointsRef = useRef(0);
    const prevGoalRef = useRef(0);

    const firstRenderRef = useRef(true);
    const firstGambleRef = useRef(false);

    const getCurrentPointsStyle = () => {
        if (!firstGambleRef.current) {
            return { backgroundColor: "#ccc", color: "#2e2f42" };
        }

        const ratio = Math.min(currentPoints / goalPoints, 1);
        let r, g, b;
        if (currentPoints <= 200) {
            r = 255; g = 0; b = 0;
        } else if (ratio < 0.5) {
            const t = (currentPoints - 200) / ((goalPoints / 2) - 200);
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

    const startGame = () => {
        const starter = Math.round(Math.random() * 401) + 100;
        const goal = Math.round(Math.random() * 5001) + 5000;

        prevPointsRef.current = 0;
        prevGoalRef.current = 0;
        firstRenderRef.current = true;
        firstGambleRef.current = false;

        setCurrentPoints(starter);
        setGoalPoints(goal);
        setBet("");
        setIsCalculating(false);
        setResultMessage("");
        setMultiplier(null);
        setGameOver(false);
        setIsWin(false);
        setPointsChange(null);
        setShowIntro(true);
    };

    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);

        if (!savedState) {
            startGame();
            return;
        }

        try {
            const parsed = JSON.parse(savedState);

            if (parsed.gameOver || parsed.currentPoints <= 0 || parsed.goalPoints <= 0) {
                startGame();
            } else {
                setCurrentPoints(parsed.currentPoints ?? 0);
                setGoalPoints(parsed.goalPoints ?? 0);
                setResultMessage(parsed.resultMessage ?? "");
                setShowIntro(false);

                if (parsed.currentPoints !== parsed.currentPoints) {
                    firstGambleRef.current = true;
                } else {
                    firstGambleRef.current = true;
                }
            }
        } catch {
            startGame();
        }
    }, []);

    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    currentPoints,
                    goalPoints,
                })
            );
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [currentPoints, goalPoints]);

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

        const previousPoints = currentPoints;
        setCurrentPoints(prev => prev - betAmount);
        setBet("");
        setResultMessage("Calculating...");
        setMultiplier(null);
        setPointsChange(null);
        setIsCalculating(true);

        const rawMultiplier = Math.pow(Math.random(), 1.2) * 2.9 + 0.1;
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

    const getMultiplierClass = () => {
        if (multiplier === null) return "";
        if (multiplier < 1.0) return css.multiplier_fail;
        if (multiplier <= 1.4) return css.multiplier_mid;
        return css.multiplier_win;
    };

    useEffect(() => {
        if (!isRestartModalOpen && !isTerminateModalOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                if (isRestartModalOpen) setIsRestartModalOpen(false);
                if (isTerminateModalOpen) setIsTerminateModalOpen(false);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (isRestartModalOpen) confirmRestart();
                if (isTerminateModalOpen) confirmTerminate();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isRestartModalOpen, isTerminateModalOpen]);

    const confirmRestart = () => {
        localStorage.removeItem(STORAGE_KEY);
        startGame();
        setIsRestartModalOpen(false);
    };

    const confirmTerminate = () => {
        localStorage.removeItem(STORAGE_KEY);
        setIsTerminateModalOpen(false);
        navigate("/");
    };

    const isButtonLocked = isCalculating || isRestartModalOpen || isTerminateModalOpen;
    const isGambleButtonLocked = !bet;

    return (
        <div className={css.container}>
            {showIntro && (
                <div className={css.intro_overlay}>
                    <div className={css.intro_content}>
                        <div className={css.fade_in}>
                            <p className={css.info_text}>Your current points:</p>
                            <p className={`${css.small_text} ${css.fade_in_delay}`}>
                                You start with a random amount of points ranging from 100 to 500.
                            </p>
                            <div className={`${css.points} ${css.slide_in_left}`}>
                                <CountUp start={0} end={currentPoints} duration={1.2} />
                            </div>
                        </div>

                        <div className={css.fade_in_delay}>
                            <p className={css.info_text}>Goal:</p>
                            <p className={`${css.small_text} ${css.fade_in_delay}`}>
                                Your goal points are randomly set between 5000 and 10000.
                            </p>
                            <div className={`${css.points} ${css.slide_in_left}`}>
                                <CountUp start={0} end={goalPoints} duration={1.2} />
                            </div>
                        </div>
                        <p className={`${css.info_text} ${css.fade_in_delay_more}`}>
                            The multiplier varies from{" "}
                            <span style={{ color: "red" }}>0.1x</span> to{" "}
                            <span style={{ color: "green" }}>3.0x</span>.
                        </p>

                        <button
                            className={`${css.proceed_button} ${css.fade_in_delay_more}`}
                            onClick={() => {
                                setShowIntro(false);
                                firstRenderRef.current = false;
                            }}
                        >
                            Proceed?
                        </button>
                    </div>
                </div>
            )}

            {!showIntro && (
                <>
                    <div className={css.points_container}>
                        <div className={css.points_text_container}>
                            <p className={css.info_text}>Your current points:</p>
                            <div className={css.another_points_text_container}>
                                <div className={css.points} style={getCurrentPointsStyle()}>
                                    <CountUp
                                        start={prevPointsRef.current}
                                        end={currentPoints}
                                        duration={1.2}
                                        onEnd={() => {
                                            prevPointsRef.current = currentPoints;
                                        }}
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
                                        {multiplier.toFixed(2)}x
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
                                    <button className={css.gamble_button} onClick={startGame}>
                                        Try Again!
                                    </button>
                                    <button className={css.gamble_button} onClick={() => navigate("/")}>
                                        Go to Home
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default GamblingPage;