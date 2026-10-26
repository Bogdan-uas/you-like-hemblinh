import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaForwardFast, FaStop } from "react-icons/fa6";
import css from "../SpecialModePage.module.css";
import { useSpecialModeSettings } from "../logic/settings.js";

export function SimulateAttachment({ variant = "modal", canSimulate, lockedHint, running = false, onSimulate, onStop }) {
    const { simulateMode, simulateSpeed, simulateSlowDown, simulateInstant, simulateKeepOpen } = useSpecialModeSettings();
    const [open, setOpen] = useState(variant === "modal" && !!simulateKeepOpen);
    const expanded = open || running;
    const instant = simulateInstant && simulateInstant !== "off";
    const scope = (instant ? simulateInstant : simulateMode) === "series" ? "the whole series" : "this set";

    return (
        <div className={`${css.simulate_attachment} ${variant === "modal" ? css.simulate_attachment_modal : css.simulate_attachment_series}`}>
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        key="simulate-drawer"
                        className={css.simulate_drawer}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        style={{ transition: "none" }}
                    >
                        <div className={css.simulate_drawer_inner}>
                            {running ? (
                                <>
                                    <p className={`${css.simulate_text} ${css.simulate_text_live}`}>
                                        <span className={css.simulate_live_dot} aria-hidden="true" />
                                        <span>Simulating {scope} {instant ? <b>instantly</b> : <>at <b>{simulateSpeed}x</b></>}...</span>
                                    </p>
                                    <button type="button" className={`${css.gamble_button} ${css.simulate_stop_button}`} onClick={onStop}>
                                        <FaStop aria-hidden="true" /> Stop
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className={css.simulate_text}>
                                        {instant ? (
                                            <>Decides {scope} <b>instantly</b>.</>
                                        ) : (
                                            <>
                                                Plays {scope} by itself at <b>{simulateSpeed}x</b>
                                                {simulateSlowDown ? ", slower when a team is one round away from the set" : ""}.
                                            </>
                                        )}
                                        <span className={css.simulate_subtext}>It stops on its own before Extended Rounds.</span>
                                    </p>
                                    <button
                                        type="button"
                                        className={`${css.gamble_button} ${css.simulate_button} ${!canSimulate ? css.locked : ""}`}
                                        disabled={!canSimulate}
                                        onClick={onSimulate}
                                    >
                                        <FaForwardFast aria-hidden="true" /> Simulate
                                    </button>
                                    {!canSimulate && lockedHint ? <span className={css.simulate_subtext}>{lockedHint}</span> : null}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <button
                type="button"
                className={`${css.simulate_handle} ${expanded ? css.simulate_handle_open : ""}`}
                aria-expanded={expanded}
                onClick={() => !running && setOpen((prev) => !prev)}
                data-no-press
            >
                <FaForwardFast aria-hidden="true" />
                Simulate
                <span className={`${css.simulate_caret} ${expanded ? css.simulate_caret_open : ""}`} aria-hidden="true" />
            </button>
        </div>
    );
}
