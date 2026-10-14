import React from "react";
import { Link } from "react-router-dom";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { WhiteCaretIcon, TournamentTierInfo, TournamentTierBadge } from "../components/TournamentTypeInfo.jsx";
import { TOURNAMENT_TYPES } from "../logic/tournamentTypes.jsx";

export function StartPage({ intro, picker, actions }) {
    const { colorSeq } = intro;
    const {
        isTournamentPickerOpen,
        tournamentPicker,
        handlePickRandomTournament,
        setIsTournamentPickerOpen,
        handleToggleTournamentType,
    } = picker;
    const { handleTournamentStart, navigate, setIsHallOfFameOpen } = actions;


    return (
        <>
            <div className={css.header_row}>
                <h2 className={css.title}>
                    Are you intuitive enough to guess which team could win?
                </h2>
                <button
                    aria-label="Special mode info"
                    className={css.info_button}
                    onClick={() => navigate("/special-mode-info")}
                >
                    ?
                </button>
            </div>

            <div className={css.marquee_wrap}>
                <div className={css.marquee_track}>
                    <div className={css.marquee_group}>
                        {colorSeq.map((t, idx) => (
                            <div
                                key={`a-${idx}`}
                                className={css.circle_wrap}
                            >
                                <div
                                    className={css.circle}
                                    style={{
                                        background: t.color,
                                        borderColor: "#999"
                                    }}
                                    title={t.name}
                                />
                            </div>
                        ))}
                    </div>

                    <div
                        className={css.marquee_group}
                        aria-hidden
                    >
                        {colorSeq.map((t, idx) => (
                            <div
                                key={`b-${idx}`}
                                className={css.circle_wrap}
                            >
                                <div
                                    className={css.circle}
                                    style={{
                                        background: t.color,
                                        borderColor: "#999"
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className={css.intro_footer}>
                <div className={css.start_split}>
                    <button
                        className={`${css.gamble_button} ${css.start_split_main}`}
                        onClick={handleTournamentStart}
                    >
                        Start Game
                    </button>
                    <button
                        type="button"
                        className={`${css.gamble_button} ${css.start_split_toggle}`}
                        aria-label="Choose tournaments"
                        aria-haspopup="dialog"
                        aria-expanded={isTournamentPickerOpen}
                        onClick={() => setIsTournamentPickerOpen((open) => !open)}
                    >
                        <WhiteCaretIcon size={12} rotation={isTournamentPickerOpen ? 90 : -90} />
                    </button>
                </div>
                <Link className={`${css.gamble_button} ${css.back_button}`} to="/gambling">
                    Back to Normal Gambling
                </Link>
            </footer>

            <AnimatePresence>{isTournamentPickerOpen && (
                <motion.div
                    key="tournament-picker"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={css.tournament_picker_overlay}
                    onClick={() => setIsTournamentPickerOpen(false)}
                >
                    <div
                        className={`${css.tournament_picker_modal} ${css.hidden_scrollbar}`}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Choose tournaments"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <TournamentTierInfo />
                        <h2 className={css.game_title} style={{ color: "#2e2f42", fontSize: "26px", fontStyle: "italic", width: "100%", textAlign: "center", marginBottom: "12px" }}>
                            Choose how you want to play
                        </h2>
                        <button
                            type="button"
                            role="checkbox"
                            aria-checked={tournamentPicker.random}
                            className={`${css.tournament_option} ${tournamentPicker.random ? css.tournament_option_selected : ""}`}
                            onClick={handlePickRandomTournament}
                            style={{ borderRadius: "12px" }}
                        >
                            <span className={css.tournament_option_title} style={{ fontSize: "18px" }}>
                                Random
                            </span>
                            <span className={css.tournament_option_description}>
                                Random order of tournaments.
                                <br />
                                Every tournament has the same chance to occur each time.
                            </span>
                        </button>

                        <div className={css.divider} />

                        <div className={css.tournament_option_list}>
                            {TOURNAMENT_TYPES.map((type, index) => {
                                const isChosen = !tournamentPicker.random && tournamentPicker.ids.includes(type.id);
                                return (
                                    <React.Fragment key={type.id}>
                                        {index > 0 && <div className={css.tournament_option_separator} />}
                                        <button
                                            type="button"
                                            role="checkbox"
                                            aria-checked={isChosen}
                                            className={`${css.tournament_option} ${isChosen ? css.tournament_option_selected : ""}`}
                                            onClick={() => handleToggleTournamentType(type.id)}
                                        >
                                            <span
                                                className={css.tournament_option_title}
                                                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                                            >
                                                <TournamentTierBadge tier={type.tier} />
                                                {type.longLabel ?? type.label}
                                            </span>
                                            {(type.descriptionNode || type.description) && (
                                                <span className={css.tournament_option_description}>
                                                    {type.descriptionNode ?? type.description}
                                                </span>
                                            )}
                                        </button>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}</AnimatePresence>
            <button
                type="button"
                className={css.gamble_button}
                onClick={() => setIsHallOfFameOpen(true)}
                style={{
                    position: "absolute",
                    top: "6%",
                    left: "49.2%",
                }}
            >
                Hall of Fame
            </button>
        </>
    );
}
