import css from './Header.module.css';

const Header = ({
    isGameWon = false,
    setIsRestartModalOpen,
    setIsTerminateModalOpen,
    setIsScoreBoardOpen,
    setIsScoreBoard,
    isScoreBoardResetButtonLocked,
    setIsScoreBoardResetModalOpen,
    isIntroClosed = false,
    isScoreBoardOpen = false,
    isButtonLocked = false,
    isScoreBoardButtonLocked,
}) => {
    return (
        <header className={css.header}>
            <div className={css.bottom_buttons}>
                <button
                    className={`${css.restart_button} ${isButtonLocked ? css.locked : ""}`}
                    onClick={setIsRestartModalOpen}
                    disabled={isButtonLocked}
                    style={{ pointerEvents: isGameWon ? "none" : "auto" }}
                >
                    Restart the game?
                </button>
                <button
                    className={`${css.restart_button} ${isButtonLocked ? css.locked : ""}`}
                    onClick={setIsTerminateModalOpen}
                    disabled={isButtonLocked}
                    style={{ pointerEvents: isGameWon ? "none" : "auto" }}
                >
                    Terminate the game?
                </button>
                {isScoreBoardOpen ? (
                    <div className={css.bottom_buttons}>
                        <button
                            className={`${css.gamble_button} ${isScoreBoardButtonLocked ? css.locked : ""}`}
                            onClick={setIsScoreBoardOpen}
                            disabled={isScoreBoardButtonLocked}
                            style={{ pointerEvents: isGameWon ? "none" : "auto", marginLeft: "64px" }}
                        >
                            Close leaderboard?
                        </button>
                        <button
                            className={`${css.restart_button} ${isScoreBoardResetButtonLocked ? css.locked : ""}`}
                            onClick={setIsScoreBoardResetModalOpen}
                            disabled={isScoreBoardResetButtonLocked}
                            style={{ pointerEvents: isGameWon ? "none" : "auto" }}
                        >
                            Reset the scoreboard?
                        </button>
                    </div>
                ) : isIntroClosed ? (
                    <button
                        className={`${css.gamble_button} ${css.back_back_back_button} ${isScoreBoardButtonLocked ? css.locked : ""}`}
                        onClick={setIsScoreBoard}
                        disabled={isScoreBoardButtonLocked}
                        style={{ pointerEvents: isGameWon ? "none" : "auto", marginLeft: "64px" }}
                    >
                        Leaderboard
                    </button>
                ) : null}
            </div>
        </header>
    );
};

export default Header;