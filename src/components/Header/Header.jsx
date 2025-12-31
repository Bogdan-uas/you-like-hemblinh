import css from './Header.module.css';

const Header = ({
    isGameWon = false,
    setIsRestartModalOpen,
    setIsTerminateModalOpen,
    isButtonLocked,
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
            </div>
        </header>
    );
};

export default Header;