import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { ReactFitty } from "react-fitty";
import { PemSeriesTrophy, GplTrophy, PbsTrophy } from "../components/Trophies.jsx";
import { TournamentNumberText } from "../components/TournamentNumberText.jsx";
import { PODIUM_QUOTES, GPL_PODIUM_TROPHY_SIZE, GPL_PODIUM_TROPHY_STYLE, PBS_PODIUM_TROPHY_SIZE, PBS_PODIUM_TROPHY_STYLE } from "../logic/winnersAndPickem.js";

export function WinnersScreen({ winners, labels, actions }) {
    const {
        tournamentNumber,
        tournamentResults,
        showWinnerText,
        hasPlayedWinnerAnimation,
        winnersText,
        showPodium,
        showProceed,
    } = winners;
    const { cstLabel, eclLabel, pemLabel, gccLabel, pbsLabel, tournamentLabel, pemType } = labels;
    const { handleProceed } = actions;

    const pickQuote = (list, seed = 0) => {
        if (!list || list.length === 0) return "";
        const index = ((seed + tournamentNumber * 3) % list.length + list.length) % list.length;
        return list[index];
    };

    const isTier2Results = tournamentResults.kind === "cst" || tournamentResults.kind === "ecl" || tournamentResults.kind === "gcc";
    const isPemResults = tournamentResults.kind === "pem";
    const isGplResults = tournamentResults.kind === "gpl";
    const isPbsResults = tournamentResults.kind === "pbs";

    return (
        <>
            <div className={css.winnerScreen}>
                {showWinnerText && (
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className={css.winnerHeadline}
                    >
                        {hasPlayedWinnerAnimation ? (
                            <span>
                                The Top 4 of {tournamentResults.kind === "cst" ? cstLabel : tournamentResults.kind === "ecl" ? eclLabel : tournamentResults.kind === "gcc" ? gccLabel : isPemResults ? pemLabel : isPbsResults ? pbsLabel : tournamentLabel}
                            </span>
                        ) : <TournamentNumberText text={winnersText} />}
                    </motion.h2>
                )}
                <div className={css.winnerPodium}>
                    {showPodium && (
                        <>
                            {tournamentResults.runnerUp && (
                                <motion.div
                                    initial={
                                        hasPlayedWinnerAnimation
                                            ? false
                                            : { opacity: 0, y: 900 }
                                    }
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={
                                        hasPlayedWinnerAnimation
                                            ? { duration: 0 }
                                            : { duration: 3, delay: 5 }
                                    }
                                    className={css.podiumRow}
                                >
                                    <div
                                        className={css.runnerUpLogo}
                                        style={{
                                            backgroundColor: tournamentResults.runnerUp.color,
                                            boxShadow: tournamentResults.runnerUp.shadow
                                        }}
                                    />
                                    <span className={css.runnerUpMedal}>🥈</span>
                                    <div className={css.secondPodium}>
                                        <ReactFitty key={tournamentResults.runnerUp?.name} className={css.runnerUpName} maxSize={16} minSize={10}>
                                            Team <b>{tournamentResults.runnerUp.name}</b>
                                        </ReactFitty>
                                        <span className={css.runnerUpLabel}>RunnerUp</span>
                                        {!isTier2Results && (
                                            <span className={css.runnerUpQuote}>"{pickQuote(PODIUM_QUOTES.runnerUp, tournamentResults.runnerUp?.id ?? 0)}"</span>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                            {tournamentResults.winner && (
                                <motion.div
                                    initial={
                                        hasPlayedWinnerAnimation
                                            ? false
                                            : { opacity: 0, y: 1100 }
                                    }
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={
                                        hasPlayedWinnerAnimation
                                            ? { duration: 0 }
                                            : { duration: 3.666, delay: 8 }
                                    }
                                    className={css.podiumRow}
                                >
                                    <div
                                        className={css.winnerLogo}
                                        style={{
                                            backgroundColor: tournamentResults.winner.color,
                                            boxShadow: tournamentResults.winner.shadow,
                                        }}
                                    />
                                    <span className={css.winnerMedal}>🥇</span>
                                    {!isTier2Results && (
                                        <span className={css.winnerTrophy}>
                                            {isPemResults
                                                ? <PemSeriesTrophy type={pemType} style={{ marginLeft: "6px", marginTop: "-52px" }} />
                                                : isGplResults
                                                    ? <GplTrophy size={GPL_PODIUM_TROPHY_SIZE} style={GPL_PODIUM_TROPHY_STYLE} />
                                                    : isPbsResults
                                                        ? <PbsTrophy size={PBS_PODIUM_TROPHY_SIZE} style={PBS_PODIUM_TROPHY_STYLE} />
                                                        : <FaTrophy />}
                                        </span>
                                    )}
                                    <div className={css.firstPodium}>
                                        <ReactFitty key={tournamentResults.winner?.name} className={css.firstPlaceName} maxSize={16} minSize={10}>
                                            Team <b>{tournamentResults.winner.name}</b>
                                        </ReactFitty>
                                        <span className={css.firstPlaceLabel}>Winner</span>
                                        {!isTier2Results && (
                                            <span className={css.firstPlaceQuote}>"{pickQuote(PODIUM_QUOTES.winner, tournamentResults.winner?.id ?? 0)}"</span>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                            {tournamentResults.thirdPlace && (
                                <motion.div
                                    initial={
                                        hasPlayedWinnerAnimation
                                            ? false
                                            : { opacity: 0, y: 700 }
                                    }
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={
                                        hasPlayedWinnerAnimation
                                            ? { duration: 0 }
                                            : { duration: 2.334, delay: 3 }
                                    }
                                    className={css.podiumRow}
                                >
                                    <div
                                        className={css.placeLogoThird}
                                        style={{ background: tournamentResults.thirdPlace.color }}
                                    />
                                    <span className={css.thirdPlaceMedal}>🥉</span>
                                    <div className={css.thirdPodium}>
                                        <ReactFitty key={tournamentResults.thirdPlace?.name} className={css.thirdPlaceName} maxSize={16} minSize={10}>
                                            Team <b>{tournamentResults.thirdPlace.name}</b>
                                        </ReactFitty>
                                        <span className={css.thirdPlaceLabel}>3rd</span>
                                        {!isTier2Results && (
                                            <span className={css.thirdPlaceQuote}>"{pickQuote(PODIUM_QUOTES.thirdPlace, tournamentResults.thirdPlace?.id ?? 0)}"</span>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {tournamentResults.fourthPlace && (
                                <motion.div
                                    initial={
                                        hasPlayedWinnerAnimation
                                            ? false
                                            : { opacity: 0, y: 600 }
                                    }
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={
                                        hasPlayedWinnerAnimation
                                            ? { duration: 0 }
                                            : { duration: 2, delay: 0.5 }
                                    }
                                    className={css.podiumRow}
                                >
                                    <div
                                        className={css.placeLogoFourth}
                                        style={{ background: tournamentResults.fourthPlace.color }}
                                    />
                                    <span className={css.fourthPlaceMedal}>🏅</span>
                                    <div className={css.fourthPodium}>
                                        <ReactFitty key={tournamentResults.fourthPlace?.name} className={css.fourthPlaceName} maxSize={16} minSize={10}>
                                            Team <b>{tournamentResults.fourthPlace.name}</b>
                                        </ReactFitty>
                                        <span className={css.fourthPlaceLabel}>4th</span>
                                        {!isTier2Results && (
                                            <span className={css.fourthPlaceQuote}>"{pickQuote(PODIUM_QUOTES.fourthPlace, tournamentResults.fourthPlace?.id ?? 0)}"</span>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>

                {showProceed && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className={css.gamble_button}
                        onClick={handleProceed}
                        style={{ zIndex: 10, marginTop: "124px" }}
                    >
                        Proceed
                    </motion.button>
                )}
            </div>
        </>
    );
}
