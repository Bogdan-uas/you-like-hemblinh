import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import css from "./GamblingPage.module.css";
import loaderCss from "../../components/Loader/Loader.module.css";

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

    const navigate = useNavigate();

    const getPointsStyle = () => {
        const ratio = Math.min(currentPoints / goalPoints, 1);
        let r, g, b;

        if (currentPoints <= 200) {
            r = 255;
            g = 0;
            b = 0;
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

        const backgroundColor = `rgb(${r},${g},${b})`;
        const color = '#fff';

        return { backgroundColor, color };
    };

    const startGame = () => {
        const starter = Math.floor(Math.random() * 401) + 100;
        const goal = Math.floor(Math.random() * 5001) + 5000;
        setCurrentPoints(starter);
        setGoalPoints(goal);
        setBet("");
        setIsCalculating(false);
        setResultMessage("");
        setMultiplier(null);
        setGameOver(false);
        setIsWin(false);
        setPointsChange(null);
    };

    useEffect(() => {
        startGame();
    }, []);

    const handleBetChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) setBet(value);
    };

    const handleGamble = () => {
        if (!bet || parseInt(bet, 10) === 0) return;

        const betAmount = parseInt(bet, 10);

        if (betAmount > currentPoints) {
            toast.error("You don't have enough points to place this bet!");
            return;
        }

        const previousPoints = currentPoints;

        setCurrentPoints((prev) => prev - betAmount);
        setBet("");
        setResultMessage("Calculating...");
        setMultiplier(null);
        setPointsChange(null);
        setIsCalculating(true);

        const rawMultiplier = Math.pow(Math.random(), 1.2) * 2.9 + 0.1;
        const roundedMultiplier = Math.round(rawMultiplier * 100) / 100;
        const winnings = Math.floor(betAmount * roundedMultiplier);

        setTimeout(() => {
            setMultiplier(roundedMultiplier);

            let message;
            if (roundedMultiplier < 1.0) message = "What a failure😢";
            else if (roundedMultiplier <= 1.4) message = "Mid😕";
            else message = "Congratulations👏";
            setResultMessage(message);

            const newPoints = previousPoints - betAmount + winnings;
            setCurrentPoints(newPoints);
            const change = newPoints - previousPoints;
            setPointsChange(change);

            if (newPoints >= goalPoints) {
                setIsWin(true);
                setGameOver(true);
            } else if (newPoints <= 0) {
                setIsWin(false);
                setGameOver(true);
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

    const isButtonLocked = !bet || isCalculating;

    return (
        <div className={css.container}>
            <div className={css.points_container}>
                <div className={css.points_text_container}>
                    <p className={css.info_text}>Your current points:</p>
                    <div className={css.another_points_text_container}>
                        <div className={css.points} style={getPointsStyle()}>
                            {currentPoints}
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
                    <div className={css.points}>{goalPoints}</div>
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
                    className={`${css.gamble_button} ${isButtonLocked ? css.locked : ""}`}
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

            {gameOver && (
                <div className={`${loaderCss.modal_overlay} ${gameOver ? loaderCss.show : ""}`}>
                    <div className={loaderCss.game_container}>
                        <h1 className={css.game_title}>
                            {isWin ? "You Won! 🎉" : "You Lost! 😢"}
                        </h1>
                        <p className={css.info_text} style={{ fontSize: '20px' }}>
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
        </div>
    );
};

export default GamblingPage;