import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { ReactFitty } from "react-fitty";
import { PemSeriesTrophy, GplTrophy, PbsTrophy } from "../components/Trophies.jsx";
import { TournamentNumberText } from "../components/TournamentNumberText.jsx";
import { PodiumEffect, ConfettiRain } from "../components/PodiumEffects.jsx";
import { useSpecialModeSettings } from "../logic/settings.js";
import { PODIUM_QUOTES, WINNERS_TIMELINE, GPL_PODIUM_TROPHY_SIZE, GPL_PODIUM_TROPHY_STYLE, PBS_PODIUM_TROPHY_SIZE, PBS_PODIUM_TROPHY_STYLE } from "../logic/winnersAndPickem.js";

const RISE_EASE = [0.16, 1, 0.3, 1];
const POP_SPRING = { type: "spring", stiffness: 260, damping: 15 };

const PLACES = [
    {
        key: "runnerUp",
        riseFrom: 900,
        logo: css.runnerUpLogo,
        medal: css.runnerUpMedal,
        medalIcon: "🥈",
        podium: css.secondPodium,
        name: css.runnerUpName,
        label: css.runnerUpLabel,
        labelText: "RunnerUp",
        quote: css.runnerUpQuote,
        originTop: 45,
        until: WINNERS_TIMELINE.winner.text,
    },
    {
        key: "winner",
        riseFrom: 1100,
        logo: css.winnerLogo,
        medal: css.winnerMedal,
        medalIcon: "🥇",
        podium: css.firstPodium,
        name: css.firstPlaceName,
        label: css.firstPlaceLabel,
        labelText: "Winner",
        quote: css.firstPlaceQuote,
        originTop: 60,
        until: WINNERS_TIMELINE.done,
    },
    {
        key: "thirdPlace",
        riseFrom: 700,
        logo: css.placeLogoThird,
        medal: css.thirdPlaceMedal,
        medalIcon: "🥉",
        podium: css.thirdPodium,
        name: css.thirdPlaceName,
        label: css.thirdPlaceLabel,
        labelText: "3rd",
        quote: css.thirdPlaceQuote,
        originTop: 34,
        until: WINNERS_TIMELINE.runnerUp.text,
    },
    {
        key: "fourthPlace",
        riseFrom: 600,
        logo: css.placeLogoFourth,
        medal: css.fourthPlaceMedal,
        medalIcon: "🏅",
        podium: css.fourthPodium,
        name: css.fourthPlaceName,
        label: css.fourthPlaceLabel,
        labelText: "4th",
        quote: css.fourthPlaceQuote,
        originTop: 25,
        until: WINNERS_TIMELINE.thirdPlace.text,
    },
];

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
    const reduceMotion = useReducedMotion();

    const pickQuote = (list, seed = 0) => {
        if (!list || list.length === 0) return "";
        const index = ((seed + tournamentNumber * 3) % list.length + list.length) % list.length;
        return list[index];
    };

    const isTier2Results = tournamentResults.kind === "cst" || tournamentResults.kind === "ecl" || tournamentResults.kind === "gcc";
    const isPemResults = tournamentResults.kind === "pem";
    const isGplResults = tournamentResults.kind === "gpl";
    const isPbsResults = tournamentResults.kind === "pbs";
    const animated = !hasPlayedWinnerAnimation;
    const { podiumEffects } = useSpecialModeSettings();
    const effects = animated && !reduceMotion && podiumEffects;
    const finalLabel = tournamentResults.kind === "cst" ? cstLabel : tournamentResults.kind === "ecl" ? eclLabel : tournamentResults.kind === "gcc" ? gccLabel : isPemResults ? pemLabel : isPbsResults ? pbsLabel : tournamentLabel;
    const headlineKey = hasPlayedWinnerAnimation ? "top-4" : winnersText;

    const renderTrophy = () => (
        isPemResults
            ? <PemSeriesTrophy type={pemType} style={{ marginLeft: "6px", marginTop: "-52px" }} />
            : isGplResults
                ? <GplTrophy size={GPL_PODIUM_TROPHY_SIZE} style={GPL_PODIUM_TROPHY_STYLE} />
                : isPbsResults
                    ? <PbsTrophy size={PBS_PODIUM_TROPHY_SIZE} style={PBS_PODIUM_TROPHY_STYLE} />
                    : <FaTrophy />
    );

    const renderPlace = (place) => {
        const team = tournamentResults[place.key];
        if (!team) return null;

        const timing = WINNERS_TIMELINE[place.key];
        const rise = timing.rise / 1000;
        const landed = (timing.rise + timing.duration) / 1000;
        const at = (offset) => ({ delay: Math.max(0, landed + offset) });
        const isWinner = place.key === "winner";

        return (
            <motion.div
                key={place.key}
                initial={animated ? { opacity: 0, y: place.riseFrom } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={animated
                    ? {
                        y: { duration: timing.duration / 1000, ease: RISE_EASE, delay: rise },
                        opacity: { duration: 0.7, ease: "easeOut", delay: rise },
                    }
                    : { duration: 0 }}
                className={css.podiumRow}
            >
                {effects ? (
                    <PodiumEffect
                        kind={place.key}
                        color={team.color}
                        originTop={place.originTop}
                        start={landed - 0.1}
                        end={place.until / 1000}
                    />
                ) : null}
                <motion.div
                    className={css.podium_logo_wrap}
                    initial={animated ? { scale: 0.3, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={animated ? { ...POP_SPRING, ...at(-0.45) } : { duration: 0 }}
                >
                    <div
                        className={place.logo}
                        style={{
                            background: team.color,
                            ...(team.shadow && (isWinner || place.key === "runnerUp") ? { boxShadow: team.shadow } : null),
                        }}
                    />
                </motion.div>
                <motion.span
                    className={place.medal}
                    style={{ zIndex: 2 }}
                    initial={animated ? { scale: 0, rotate: -160, opacity: 0 } : false}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={animated ? { ...POP_SPRING, ...at(-0.2) } : { duration: 0 }}
                >
                    {place.medalIcon}
                </motion.span>
                {isWinner && !isTier2Results ? (
                    <motion.span
                        className={css.winnerTrophy}
                        initial={animated ? { opacity: 0, scale: 0.3, rotate: -70 } : false}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={animated ? { type: "spring", stiffness: 200, damping: 12, ...at(0.1) } : { duration: 0 }}
                    >
                        {renderTrophy()}
                    </motion.span>
                ) : null}
                <div className={place.podium}>
                    <motion.div
                        className={css.podium_text_wrap}
                        initial={animated ? { opacity: 0, y: 10 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={animated ? { duration: 0.5, ease: "easeOut", ...at(0) } : { duration: 0 }}
                    >
                        <ReactFitty key={team.name} className={place.name} maxSize={16} minSize={10}>
                            Team <b>{team.name}</b>
                        </ReactFitty>
                    </motion.div>
                    <motion.span
                        className={place.label}
                        initial={animated ? { opacity: 0, scale: 0.5 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={animated ? { ...POP_SPRING, ...at(0.15) } : { duration: 0 }}
                    >
                        {place.labelText}
                    </motion.span>
                    {!isTier2Results ? (
                        <motion.span
                            className={place.quote}
                            initial={animated ? { opacity: 0, y: 12, filter: "blur(4px)" } : false}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                            transition={animated ? { duration: 0.7, ease: "easeOut", ...at(0.45) } : { duration: 0 }}
                        >
                            &quot;{pickQuote(PODIUM_QUOTES[place.key], team.id ?? 0)}&quot;
                        </motion.span>
                    ) : null}
                </div>
            </motion.div>
        );
    };

    const winnerLanded = (WINNERS_TIMELINE.winner.rise + WINNERS_TIMELINE.winner.duration) / 1000;

    return (
        <>
            <div className={css.winnerScreen}>
                {effects && showPodium && tournamentResults.winner ? (
                    <ConfettiRain
                        start={winnerLanded - 0.2}
                        end={WINNERS_TIMELINE.done / 1000}
                        colors={[tournamentResults.winner.color, "#ffd700", "#fff4b5", "#ffffff"]}
                    />
                ) : null}
                {showWinnerText && (
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className={css.winnerHeadline}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={headlineKey}
                                style={{ display: "inline-block", transition: "none" }}
                                initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                                exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                                transition={{ duration: 0.45, ease: "easeInOut" }}
                            >
                                {hasPlayedWinnerAnimation ? <>The Top 4 of {finalLabel}</> : <TournamentNumberText text={winnersText} />}
                            </motion.span>
                        </AnimatePresence>
                    </motion.h2>
                )}
                <div className={css.winnerPodium}>
                    {showPodium && PLACES.map(renderPlace)}
                </div>

                {showProceed && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className={css.gamble_button}
                        onClick={handleProceed}
                        data-proceed-button
                        style={{ zIndex: 10, marginTop: "124px" }}
                    >
                        Proceed
                    </motion.button>
                )}
            </div>
        </>
    );
}
