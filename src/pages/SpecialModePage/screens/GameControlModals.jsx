import css from "../SpecialModePage.module.css";
import { FadeOut } from "../components/FadeOut.jsx";

export function GameControlModals({ controls }) {
    const {
        isRestartModalOpen,
        confirmRestart,
        isTerminateModalOpen,
        confirmTerminate,
        setIsRestartModalOpen,
        setIsTerminateModalOpen,
    } = controls;


    return (
        <>
                <FadeOut>{isRestartModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            Are you sure you want to restart the game? <br /> <strong>You will NOT be able to revert this action!</strong>
                        </p>
                        <div className={css.restart_buttons}>
                            <button
                                className={css.cancel_button}
                                onClick={() => setIsRestartModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={css.confirm_button}
                                onClick={confirmRestart}
                            >
                                Restart
                            </button>
                        </div>
                    </div>
                )}</FadeOut>

                <FadeOut>{isTerminateModalOpen && (
                    <div className={css.restart_modal}>
                        <p className={css.restart_text}>
                            Are you sure you want to terminate the game?
                        </p>
                        <div className={css.restart_buttons}>
                            <button
                                className={css.cancel_button}
                                onClick={() => setIsTerminateModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={css.confirm_button}
                                onClick={confirmTerminate}
                            >
                                Terminate
                            </button>
                        </div>
                    </div>
                )}</FadeOut>

        </>
    );
}
