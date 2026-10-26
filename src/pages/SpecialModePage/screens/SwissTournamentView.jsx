import CountUp from "react-countup";
import css from "../SpecialModePage.module.css";

export function SwissTournamentView({ view, renderers, actions }) {
    const {
        showPickemLine2,
        hover,
        tournamentResults,
        activePhase,
        neededPickemPoints,
        viewPhase,
        swissToRender,
        setHover,
        hasSkylinesSwitch,
    } = view;
    const { renderResultsNav, getStageTitleForView, renderPlayoffsBracket, renderSwissBracket } = renderers;
    const {
        handleBackToHome,
        handleBackToSpecialStart,
        handleBackToGambling,
        setShowPickemSummary,
        setShowWinnersScreen,
    } = actions;


    return (
        <>
                        {renderResultsNav()}
                        <div className={css.bracket_container}>

                            <div
                                style={{
                                    position: "absolute",
                                    top: showPickemLine2 && viewPhase === "playoffs" ? 76 : 10,
                                    right: 10,
                                    zIndex: 5,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: 6,
                                }}
                            >
                                {showPickemLine2 ? (
                                    <div className={css.pickem_buttons}>
                                        <button
                                            className={`${css.gamble_button} ${css.back_button}`}
                                            onClick={() => setShowPickemSummary(true)}
                                        >
                                            Back to the Pick'em challenge summary
                                        </button>
                                        <button
                                            className={`${css.gamble_button} ${css.back_back_button}`}
                                            style={{
                                                backgroundColor: hover ? tournamentResults.winner.hoverOn : tournamentResults.winner.color,
                                            }}
                                            onMouseEnter={() => setHover(true)}
                                            onMouseLeave={() => setHover(false)}
                                            onClick={() => setShowWinnersScreen(true)}
                                        >
                                            Back to the Winners' screen
                                        </button>
                                        <button
                                            className={css.gamble_button}
                                            onClick={handleBackToHome}
                                        >
                                            To Home Page
                                        </button>
                                        <button
                                            className={css.gamble_button}
                                            onClick={handleBackToSpecialStart}
                                        >
                                            Back to the start of Special Mode
                                        </button>
                                        <button
                                            className={css.gamble_button}
                                            onClick={handleBackToGambling}
                                        >
                                            Back to normal Gambling
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ gap: '0', top: '76px', left: activePhase === "playoffs" ? '-70px' : '-150px' }} className={css.pickem_buttons}>
                                        <span className={css.match_modal_prompt}>Needed Pick&apos;em points:</span>
                                        <span className={css.points}>
                                            <CountUp
                                                start={0}
                                                duration={1.2}
                                                end={neededPickemPoints}
                                                key={neededPickemPoints}
                                            />
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: viewPhase !== "playoffs" ? 64 : hasSkylinesSwitch ? 120 : 32, transition: "none" }}>
                                <div className={css.stage_title}>
                                    {getStageTitleForView()}
                                </div>

                                {viewPhase === "playoffs" ? renderPlayoffsBracket() : renderSwissBracket(swissToRender)}
                            </div>
                        </div>
        </>
    );
}
