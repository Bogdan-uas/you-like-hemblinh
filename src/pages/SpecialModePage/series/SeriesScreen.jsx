import { useMemo } from "react";
import CountUp from "react-countup";
import css from "../SpecialModePage.module.css";
import Header from "../../../components/Header/Header.jsx";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import Odometer from "react-odometerjs";
import GradientCaretLeft from "../../../components/GradientIcon/GradientCaretLeft.jsx";
import GradientCaretRight from "../../../components/GradientIcon/GradientCaretRight.jsx";
import GradientDiamond from "../../../components/GradientIcon/GradientDiamond.jsx";
import { PenaltyCircles } from "../components/PenaltyCircles.jsx";
import { ExtendedRoundsTrack, ExtendedRoundsStatus } from "../components/ExtendedRounds.jsx";
import { BreakdownSectionTitle, BreakdownSquares } from "../components/BreakdownParts.jsx";
import { QualifierBadge } from "../components/QualifierBadge.jsx";
import { MomentumStreakBadge } from "../components/StreakBadges.jsx";
import { PemSeriesTrophy, GplTrophy } from "../components/Trophies.jsx";
import { lightenHex, darkenHex, getBrightness } from "../logic/colors.js";
import { isSingleEclStage, eclStageLabel } from "../logic/ecl.jsx";
import { PENALTY_DISPLAY_CIRCLES } from "../logic/gameConstants.js";
import { isSinglePemGroupStage, pemGroupStageLabel, PEM_GROUP_QUALIFYING_STAGES } from "../logic/pemSeries.jsx";
import { isSinglePemStage1Stage, pemStage1StageLabel, PEM_STAGE1_QUALIFYING_STAGES } from "../logic/pemStage1.jsx";
import { stageLabelPlayoffs } from "../logic/playoffs.js";
import { isSingleQualifierStage, qualifierStageLabel, QUALIFIER_QUALIFYING_STAGES } from "../logic/qualifier.jsx";
import { swissNetTitle, GPL_SWISS_FORMAT } from "../logic/swiss.js";
import { GameControlModals } from "../screens/GameControlModals.jsx";

export function SeriesScreen({ header, series, labels, actions }) {
    const {
        isLeaderboardButtonShown,
        isLeaderboardOpen,
        isButtonLocked,
        isScoreBoardButtonLocked,
        isScoreBoardResetButtonLocked,
        handleAddPlacingsClick,
        handleRemovePlacingsClick,
        arePlacingButtonsArmed,
        hasAnyPlacings,
        toggleSecretGuaranteedWin,
        handleSecretButtonContextMenu,
        isRestartModalOpen,
        confirmRestart,
        isTerminateModalOpen,
        confirmTerminate,
        setIsRestartModalOpen,
        setIsTerminateModalOpen,
        setIsLeaderboardOpen,
        setIsTournamentNumberButtonArmed,
        setIsScoreBoardResetModalOpen,
        navigate,
    } = header;
    const {
        seriesState,
        activePhase,
        setsToWin,
        loserOpacity,
        extendedRoundDetails,
        isSeriesPointWins,
        isSetPointWins,
        overtimeTarget,
        displayedMiniSquares,
        isSeriesPointLosses,
        isSetPointLosses,
        overtimeToWin,
    } = series;
    const {
        tournamentLabel,
        pemLabel,
        cstLabel,
        eclLabel,
        isCstPhase,
        isPemMainPhase,
        isPemBigSeries,
        pemType,
        gccLabel,
        isGccPhase,
        isGplMainPhase,
        getOvertimeLabel,
        getPenaltyMessage,
        getMultiplierClass,
        renderTeamLabel,
    } = labels;
    const { handlePenaltyShot, handleSeriesGamble } = actions;

    const seriesLabelNode = useMemo(() => {
        if (!seriesState.active || !seriesState.leftTeam || !seriesState.rightTeam) return null;

        const {
            setsToWin,
            setNumber,
            banner: seriesBanner,
        } = seriesState;

        let small = "";
        let big = "";

        if (seriesState.phase === "qualifier") {
            small = (
                <>
                    {pemLabel} | Group {seriesState.qualifierGroup}
                </>
            );
            big = qualifierStageLabel(seriesState.qualifierStage);
        } else if (seriesState.phase === "pemGroup") {
            small = (
                <>
                    {pemLabel} | {isPemBigSeries ? "Stage II | " : ""}Group {seriesState.pemGroup}
                </>
            );
            big = pemGroupStageLabel(seriesState.pemGroupStage);
        } else if (seriesState.phase === "pemStage1") {
            small = (
                <>
                    {pemLabel} | Stage I | Group {seriesState.pemStage1Group}
                </>
            );
            big = pemStage1StageLabel(seriesState.pemStage1Stage);
        } else if (seriesState.phase === "ecl") {
            small = eclLabel;
            big = eclStageLabel(seriesState.eclStage);
        } else if (seriesState.phase === "gccLeague") {
            small = (
                <>
                    {gccLabel} | League Phase
                </>
            );
            big = `Matchday ${seriesState.gccMatchday}`;
        } else if (seriesState.phase === "cstGroup") {
            small = (
                <>
                    {cstLabel} | Group Stage
                </>
            );
            big = `Group ${seriesState.cstGroup}`;
        } else if (seriesState.phase === "playoffs") {
            small = isCstPhase ? cstLabel : isGccPhase ? gccLabel : isPemMainPhase ? pemLabel : tournamentLabel;
            big = stageLabelPlayoffs(seriesState.playoffsStage);
        } else if (seriesState.phase === "stage1") {
            small = (
                <>
                    {tournamentLabel} | Stage I
                </>
            );
            big = swissNetTitle(seriesState.swissNet);
        } else if (seriesState.phase === "stage2") {
            small = (
                <>
                    {tournamentLabel} | Stage II
                </>
            );
            big = swissNetTitle(seriesState.swissNet);
        } else if (seriesState.phase === "stage3") {
            small = (
                <>
                    {tournamentLabel} | Stage III
                </>
            );
            big = swissNetTitle(seriesState.swissNet);
        }

        const isQualifierSeries = seriesState.phase === "qualifier";
        const isPemGroupSeries = seriesState.phase === "pemGroup";
        const isPemStage1Series = seriesState.phase === "pemStage1";
        const isEclSeries = seriesState.phase === "ecl";
        const isGccSeries = isGccPhase && (seriesState.phase === "gccLeague" || seriesState.phase === "playoffs");
        const isCstSeries =
            (isCstPhase && (seriesState.phase === "cstGroup" || seriesState.phase === "playoffs")) || isEclSeries || isGccSeries;
        const isPemSeries = isPemMainPhase && (isPemGroupSeries || isPemStage1Series || seriesState.phase === "playoffs");

        const seriesMatchNumber =
            seriesState.phase === "playoffs"
                ? seriesState.playoffsMatchNumber
                : isQualifierSeries
                    ? seriesState.qualifierMatchNumber ?? 1
                    : isPemGroupSeries
                        ? seriesState.pemGroupMatchNumber ?? 1
                        : isPemStage1Series
                            ? seriesState.pemStage1MatchNumber ?? 1
                            : isEclSeries
                                ? seriesState.eclMatchNumber ?? 1
                                : seriesState.phase === "cstGroup"
                                    ? seriesState.cstMatchNumber ?? 1
                                    : seriesState.phase === "gccLeague"
                                        ? seriesState.gccMatchNumber ?? 1
                                        : seriesState.swissMatchNumber ?? 1;

        const showSeriesMatchNumber = isQualifierSeries
            ? !isSingleQualifierStage(seriesState.qualifierStage)
            : isPemGroupSeries
                ? !isSinglePemGroupStage(seriesState.pemGroupStage)
                : isPemStage1Series
                    ? !isSinglePemStage1Stage(seriesState.pemStage1Stage)
                    : isEclSeries
                        ? !isSingleEclStage(seriesState.eclStage)
                        : seriesState.playoffsStage !== "gf" && seriesState.playoffsStage !== "thirdPlace";

        return (
            <>
                <span className={css.series_label}>
                    <span className={css.series_upper_label}>
                        <motion.span
                            key={`${seriesState.phase}-${seriesState.swissNet ?? seriesState.playoffsStage ?? seriesState.qualifierStage ?? seriesState.pemGroupStage ?? seriesState.pemStage1Stage ?? seriesState.eclStage}`}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.6 }}
                            className={css.round_text}
                            style={{
                                position: "absolute",
                                right: "205px",
                                width: "max-content",
                                marginBottom: "-2px",
                                fontSize: "24px",
                                transition: 'none'
                            }}
                        >
                            {small}
                        </motion.span>
                        {isQualifierSeries ? (
                            <motion.span
                                initial={{ opacity: 0, y: -40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.6 }}
                                className={css.round_text}
                                style={{ position: "absolute", left: "50%", x: "-50%", top: "-10px", display: "flex", transition: 'none' }}
                            >
                                <QualifierBadge height={20} />
                            </motion.span>
                        ) : isCstSeries ? (
                            <motion.span
                                initial={{ opacity: 0, y: -40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.6 }}
                                className={css.round_text}
                                style={{ position: "absolute", left: "50%", x: "-50%", top: "-12px", display: "flex", transition: 'none', userSelect: "none" }}
                            >
                                &nbsp;
                            </motion.span>
                        ) : isPemSeries || isGplMainPhase ? (
                            <motion.span
                                initial={{ opacity: 0, y: -40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.6 }}
                                className={css.round_text}
                                style={{ fontSize: "28px", position: "absolute", left: "50%", x: "-50%", display: "flex", transition: 'none' }}
                            >
                                {isGplMainPhase ? <GplTrophy /> : <PemSeriesTrophy type={pemType} />}
                            </motion.span>
                        ) : (
                            <motion.span
                                initial={{ opacity: 0, y: -40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.6 }}
                                className={css.round_text}
                                style={{ fontSize: "28px", marginBottom: "-5px", position: "absolute", left: "44.55%", transition: 'none' }}
                            >
                                <FaTrophy />
                            </motion.span>
                        )}
                        <motion.div
                            key={big}
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.6 }}
                            className={css.round_text}
                            style={{
                                fontSize: "24px",
                                position: "absolute",
                                left: "210px",
                                top: "-17px",
                                width: "max-content",
                                transition: 'none',
                                display: "flex"
                            }}
                        >
                            {big}
                            {showSeriesMatchNumber ? (
                                <div
                                    style={{
                                        marginLeft: "2px",
                                        marginTop: "-2px",
                                        padding: "4px 8px",
                                    }}
                                    className={css.points}
                                >
                                    #{seriesMatchNumber}
                                </div>
                            ) : null}
                        </motion.div>
                    </span>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className={css.round_text}
                        style={{ fontSize: "24px", marginBottom: "-4px", marginLeft: "-2px" }}
                    >
                        Best of {setsToWin * 2 - 1}
                    </motion.span>
                    {setsToWin !== 1 && !seriesBanner ? (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.round_text}
                            style={{ fontSize: "24px" }}
                        >
                            {(() => {
                                const currentSet = setNumber;
                                const totalSets = setsToWin * 2 - 1;
                                const isDecider = currentSet === totalSets;
                                return isDecider
                                    ? "Decider"
                                    : `Set ${currentSet}`;
                            })()}
                        </motion.span>
                    ) : setsToWin !== 1 ? (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.round_text}
                            style={{ fontSize: "28px", userSelect: "none" }}
                        >
                            &nbsp;
                        </motion.span>
                    ) : null}
                    {seriesState.finishedSets?.length > 0 && !seriesBanner ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "start",
                                justifyContent: "center",
                                columnGap: "12px",
                                rowGap: '4px',
                                maxWidth: "380px",
                                height: seriesState.finishedSets?.length >= 7 ? "62px" : "40px",
                            }}
                        >
                            {seriesState.finishedSets.map(({
                                set,
                                leftScore,
                                rightScore,

                                extendedRoundsPlayed,
                                extendedRoundLeftScore,
                                extendedRoundRightScore,

                                penaltiesPlayed,
                                penaltyLeftScore,
                                penaltyRightScore,
                            }) => {
                                const displayLeftScore = penaltiesPlayed
                                    ? penaltyLeftScore
                                    : extendedRoundsPlayed
                                        ? extendedRoundLeftScore
                                        : leftScore;

                                const displayRightScore = penaltiesPlayed
                                    ? penaltyRightScore
                                    : extendedRoundsPlayed
                                        ? extendedRoundRightScore
                                        : rightScore;

                                const leftWonSet = displayLeftScore > displayRightScore;

                                return (
                                    <div
                                        key={set}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                        }}
                                    >
                                        <span
                                            className={css.round_text}
                                            style={{
                                                fontSize: "12px",
                                                textShadow: leftWonSet
                                                    ? seriesState.leftTeam.shadow
                                                    : seriesState.rightTeam.shadow,
                                                color: leftWonSet
                                                    ? seriesState.leftTeam.color
                                                    : seriesState.rightTeam.color,
                                            }}
                                        >
                                            Set {set}
                                        </span>

                                        <span
                                            style={{
                                                color:
                                                    leftScore > rightScore
                                                        ? "#4caf50"
                                                        : leftScore === rightScore
                                                            ? "#2e2f42"
                                                            : "#f44336",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {leftScore}
                                        </span>

                                        <span
                                            className={css.round_text}
                                            style={{
                                                fontSize: "12px",
                                                marginTop: '-1px'
                                            }}
                                        >
                                            -
                                        </span>

                                        <span
                                            style={{
                                                color:
                                                    rightScore > leftScore
                                                        ? "#4caf50"
                                                        : rightScore === leftScore
                                                            ? "#2e2f42"
                                                            : "#f44336",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {rightScore}
                                        </span>
                                        {penaltiesPlayed ? (
                                            <span
                                                className={css.round_text}
                                                style={{
                                                    fontSize: "12px",
                                                    marginLeft: "-4px"
                                                }}
                                            >
                                                (Pens{" "}
                                                <span
                                                    style={{
                                                        color:
                                                            penaltyLeftScore > penaltyRightScore
                                                                ? "#4caf50"
                                                                : penaltyLeftScore === penaltyRightScore
                                                                    ? "#2e2f42"
                                                                    : "#f44336",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    {penaltyLeftScore}
                                                </span>{" "}
                                                -{" "}
                                                <span
                                                    style={{
                                                        color:
                                                            penaltyRightScore > penaltyLeftScore
                                                                ? "#4caf50"
                                                                : penaltyLeftScore === penaltyRightScore
                                                                    ? "#2e2f42"
                                                                    : "#f44336",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    {penaltyRightScore}
                                                </span>
                                                )
                                            </span>
                                        ) : extendedRoundsPlayed ? (
                                            <span
                                                className={css.round_text}
                                                style={{
                                                    fontSize: "12px",
                                                    marginLeft: "-4px",
                                                }}
                                            >
                                                (ERs{" "}
                                                <span
                                                    style={{
                                                        color:
                                                            extendedRoundLeftScore > extendedRoundRightScore
                                                                ? "#4caf50"
                                                                : extendedRoundLeftScore === extendedRoundRightScore
                                                                    ? "#2e2f42"
                                                                    : "#f44336",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    {extendedRoundLeftScore}
                                                </span>{" "}
                                                -{" "}
                                                <span
                                                    style={{
                                                        color:
                                                            extendedRoundRightScore > extendedRoundLeftScore
                                                                ? "#4caf50"
                                                                : extendedRoundLeftScore === extendedRoundRightScore
                                                                    ? "#2e2f42"
                                                                    : "#f44336",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    {extendedRoundRightScore}
                                                </span>
                                                )
                                            </span>
                                        ) : null}
                                    </div>
                                )
                            })}
                        </motion.div>
                    ) : setsToWin !== 1 ? (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.round_text}
                            style={{
                                fontSize: "12px",
                                height: "40px",
                                userSelect: "none"
                            }}
                        >
                            &nbsp;
                        </motion.span>
                    ) : null}
                </span>
            </>
        );
    }, [seriesState, tournamentLabel, pemLabel, cstLabel, eclLabel, gccLabel, isCstPhase, isGccPhase, isGplMainPhase, isPemMainPhase, isPemBigSeries, pemType]);

    const getPointLabel = () => {
        if (seriesState.phase === "cstGroup" || seriesState.phase === "gccLeague") return "MATCH POINT!!!";

        if (seriesState.phase === "qualifier") {
            return QUALIFIER_QUALIFYING_STAGES.includes(seriesState.qualifierStage)
                ? "MAIN EVENT POINT!!!"
                : "MATCH POINT!!!";
        }

        if (seriesState.phase === "pemGroup") {
            return PEM_GROUP_QUALIFYING_STAGES.includes(seriesState.pemGroupStage)
                ? "PLAYOFFS POINT!!!"
                : "MATCH POINT!!!";
        }

        if (seriesState.phase === "pemStage1") {
            return PEM_STAGE1_QUALIFYING_STAGES.includes(seriesState.pemStage1Stage)
                ? "STAGE II POINT!!!"
                : "MATCH POINT!!!";
        }

        if (seriesState.phase === "ecl") {
            return seriesState.eclStage === "uf" || seriesState.eclStage === "cf"
                ? "GRAND FINAL POINT!!!"
                : "MATCH POINT!!!";
        }

        const pointNet = ["2:0", "2:1", "2:2"];

        if (!pointNet.includes(seriesState.swissNet)) {
            return "MATCH POINT!!!";
        }

        switch (seriesState.phase) {
            case "stage1":
                return "STAGE II POINT!!!";

            case "stage2":
                return seriesState.swissFormat === GPL_SWISS_FORMAT ? "PLAYOFFS POINT!!!" : "STAGE III POINT!!!";

            case "stage3":
                return "PLAYOFFS POINT!!!";

            default:
                return "MATCH POINT!!!";
        }
    };

    const leftAttempts = seriesState.penaltyLeftResults.length;
    const rightAttempts = seriesState.penaltyRightResults.length;

    const completedSuddenDeathPairs = Math.min(
        Math.max(0, leftAttempts - 5),
        Math.max(0, rightAttempts - 5)
    );

    const attemptsToDisplay =
        PENALTY_DISPLAY_CIRCLES + completedSuddenDeathPairs;

    const currentAttempt = Math.min(
        seriesState.penaltyLeftResults.length,
        seriesState.penaltyRightResults.length
    ) + 1;

    const inSuddenDeath = currentAttempt > 5;

    const isPlayoffsStyleSeries = activePhase === "playoffs";

    const {
        playerWonSets,
        playerLostSets,
        roundWins,
        roundLosses,
        miniWins,
        miniLosses,
        isOvertime,
        overtimeBlock,
        banner,
    } = seriesState;

    const momentum =
        roundWins > roundLosses
            ? "left"
            : roundLosses > roundWins
                ? "right"
                : "tied";

    return (
        <>
            <Header
                setIsRestartModalOpen={() => setIsRestartModalOpen(true)}
                setIsTerminateModalOpen={() => setIsTerminateModalOpen(true)}
                setIsScoreBoardOpen={() => {
                    setIsLeaderboardOpen(false);
                    setIsTournamentNumberButtonArmed(false);
                }}
                setIsScoreBoard={() => setIsLeaderboardOpen(true)}
                isIntroClosed={isLeaderboardButtonShown}
                isLeaderboardOpen={isLeaderboardOpen}
                isButtonLocked={isButtonLocked}
                isScoreBoardButtonLocked={isScoreBoardButtonLocked}
                isScoreBoardResetButtonLocked={isScoreBoardResetButtonLocked}
                setIsScoreBoardResetModalOpen={() => setIsScoreBoardResetModalOpen(true)}
                setIsAddTournamentPlacingsModalOpen={handleAddPlacingsClick}
                setIsRemoveTournamentPlacingsModalOpen={handleRemovePlacingsClick}
                arePlacingButtonsArmed={arePlacingButtonsArmed}
                hasAnyPlacings={hasAnyPlacings}
                onInfoPage={() => navigate("/special-mode-info")}
            />
            <div style={{ marginTop: setsToWin === 1 ? "40px" : "-80px" }} className={css.series_container}>
                <button
                    type="button"
                    onClick={toggleSecretGuaranteedWin}
                    onContextMenu={handleSecretButtonContextMenu}
                    className={css.gamble_button}
                    style={{
                        position: "absolute",
                        top: setsToWin !== 1 ? "-33%" : "0%",
                        left: "42%",
                        background: "#f7f7f7ff",
                        color: "transparent",
                        fontSize: "12px",
                        border: "none",
                        cursor: "auto",
                        opacity: 0,
                        zIndex: 9999,
                    }}
                >
                    Secret
                </button>
                {seriesLabelNode}
                {seriesState.tiebreakerPhase === "extended" && extendedRoundDetails && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        aria-live="polite"
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9998,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "24px",
                            backdropFilter: "blur(8px)",
                            animation: "fade-in 0.4s ease-out",
                        }}
                    >
                        <BreakdownSectionTitle text="Extended Rounds" marginTop="0px" marginBottom="4px" />
                        <span className={css.info_text} style={{ fontSize: "15px", color: "#555", fontWeight: 600, marginBottom: "6px" }}>
                            {roundWins}:{roundLosses} after Quadruple Overtime
                        </span>
                        <div
                            className={css.scoreboard}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row-reverse",
                                    alignItems: "center",
                                    gap: "14px",
                                    opacity: loserOpacity === "win" ? 0.4 : 1,
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", flexDirection: 'column', width: '50.1px' }}>
                                    <span
                                        className={css.round_text}
                                        style={{
                                            height: "76px",
                                            color: seriesState.leftTeam?.color,
                                            fontSize: "52px",
                                            transition: "all 2000ms ease-in-out",
                                            textShadow:
                                                seriesState.extRoundLeftScore >= 4
                                                    ? `
                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                        0 1px 3px rgba(0,0,0,0.4)
                                                    `
                                                    : "none",
                                        }}
                                    >
                                        <Odometer
                                            value={seriesState.extRoundLeftScore}
                                            duration={900}
                                            format="d"
                                        />
                                    </span>
                                    <div className={css.lines}>
                                        {!isPlayoffsStyleSeries && setsToWin === 3 ? (
                                            <>
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.line}
                                                        style={{
                                                            boxShadow:
                                                                playerWonSets >= i + 1
                                                                    ? `
                                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                    : "none",
                                                            width: "16px",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.lineUnlit}
                                                            style={{
                                                                background: seriesState.leftTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.lineLit}
                                                            style={{
                                                                background: seriesState.leftTeam?.gradient,
                                                                opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : !isPlayoffsStyleSeries && setsToWin === 2 ? (
                                            <>
                                                {[...Array(2)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.line}
                                                        style={{
                                                            boxShadow:
                                                                playerWonSets >= i + 1
                                                                    ? `
                                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                    : "none",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.lineUnlit}
                                                            style={{
                                                                background: seriesState.leftTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.lineLit}
                                                            style={{
                                                                background: seriesState.leftTeam?.gradient,
                                                                opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : !isPlayoffsStyleSeries && setsToWin === 1 ? (
                                            <div
                                                className={css.line}
                                                style={{
                                                    boxShadow:
                                                        playerWonSets >= 1
                                                            ? `
                                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.lineUnlit}
                                                    style={{
                                                        background: seriesState.leftTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.lineLit}
                                                    style={{
                                                        background: seriesState.leftTeam?.gradient,
                                                        opacity: playerWonSets >= 1 ? 1 : 0,
                                                    }}
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className={css.verticalLines} style={{ marginTop: "6px" }}>
                                    {isPlayoffsStyleSeries && setsToWin === 5 ? (
                                        <>
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        height: "12px",
                                                        boxShadow:
                                                            playerWonSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.leftTeam?.color},
                                                                    0 0 7px ${seriesState.leftTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLineUnlit}
                                                        style={{
                                                            background: seriesState.leftTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLineLit}
                                                        style={{
                                                            background: seriesState.leftTeam?.gradient,
                                                            opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : isPlayoffsStyleSeries && setsToWin === 4 ? (
                                        <>
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        height: "14px",
                                                        boxShadow:
                                                            playerWonSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.leftTeam?.color},
                                                                    0 0 7px ${seriesState.leftTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLineUnlit}
                                                        style={{
                                                            background: seriesState.leftTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLineLit}
                                                        style={{
                                                            background: seriesState.leftTeam?.gradient,
                                                            opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : isPlayoffsStyleSeries && setsToWin === 3 ? (
                                        <>
                                            {[...Array(3)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        height: "16px",
                                                        boxShadow:
                                                            playerWonSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.leftTeam?.color},
                                                                    0 0 7px ${seriesState.leftTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLineUnlit}
                                                        style={{
                                                            background: seriesState.leftTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLineLit}
                                                        style={{
                                                            background: seriesState.leftTeam?.gradient,
                                                            opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : isPlayoffsStyleSeries && setsToWin === 2 ? (
                                        <>
                                            {[...Array(2)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        boxShadow:
                                                            playerWonSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.leftTeam?.color},
                                                                    0 0 7px ${seriesState.leftTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLineUnlit}
                                                        style={{
                                                            background: seriesState.leftTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLineLit}
                                                        style={{
                                                            background: seriesState.leftTeam?.gradient,
                                                            opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : isPlayoffsStyleSeries && setsToWin === 1 ? (
                                        <div
                                            className={css.verticalLine}
                                            style={{
                                                boxShadow:
                                                    playerWonSets >= 1
                                                        ? `
                                                                    0 0 3px ${seriesState.leftTeam?.color},
                                                                    0 0 7px ${seriesState.leftTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                        : "none",
                                            }}
                                        >
                                            <div
                                                className={css.verticalLineUnlit}
                                                style={{
                                                    background: seriesState.leftTeam?.unlitGradient,
                                                }}
                                            />

                                            <div
                                                className={css.verticalLineLit}
                                                style={{
                                                    background: seriesState.leftTeam?.gradient,
                                                    opacity: playerWonSets >= 1 ? 1 : 0,
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                                <BreakdownSquares team={seriesState.leftTeam} lit={Math.min(seriesState.extRoundLeftScore, 4)} total={4} side="left" />
                            </div>

                            <div>
                                {banner
                                    ? (() => {
                                        const cleanBanner = banner.text;
                                        const chars = cleanBanner.split("");

                                        const fromTop = (index) =>
                                            banner.tie ? index % 2 === 0 : index < Math.ceil(chars.length / 2);

                                        return (
                                            <motion.span
                                                className={css.round_text}
                                                style={{
                                                    fontSize: "38px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "0px",
                                                    width: banner.tie ? 'max-content' : '63.8px',
                                                    textShadow: banner.shadow,
                                                    position: "relative",
                                                    index: 9999
                                                }}
                                            >
                                                {chars.map((char, index) => (
                                                    <motion.span
                                                        key={`${index}-${char}`}
                                                        initial={{
                                                            opacity: 0,
                                                            y: fromTop(index) ? -20 : 20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.45
                                                        }}
                                                        style={{
                                                            display: "inline-block",
                                                            background: banner.gradient,
                                                            backgroundClip: "text",
                                                            WebkitBackgroundClip: "text",

                                                            color: "transparent",
                                                            WebkitTextFillColor: "transparent",
                                                        }}
                                                    >
                                                        {char}
                                                    </motion.span>
                                                ))}

                                                <motion.span
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{
                                                        duration: 0.45
                                                    }}
                                                    style={{
                                                        display: "inline-block",
                                                        marginLeft: "2px",
                                                        background: banner.gradient,
                                                        backgroundClip: "text",
                                                        WebkitBackgroundClip: "text",

                                                        color: "transparent",
                                                        WebkitTextFillColor: "transparent",
                                                    }}
                                                >
                                                    !
                                                </motion.span>
                                            </motion.span>
                                        );
                                    })()
                                    : seriesState.tiebreakerBigSymbol ? (
                                        <p
                                            className={css.vs}
                                            style={{ fontWeight: 700, fontSize: "32px", marginBottom: isPlayoffsStyleSeries ? "-12px" : "0", }}
                                        >
                                            {seriesState.tiebreakerBigSymbol}
                                        </p>
                                    ) : null}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "14px",
                                    opacity: loserOpacity === "loss" ? 0.4 : 1,
                                    position: 'relative'
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        flexDirection: 'column',
                                        width: '50.1px'
                                    }}
                                >
                                    <span
                                        className={css.round_text}
                                        style={{
                                            height: "76px",
                                            color: seriesState.rightTeam?.color,
                                            fontSize: "52px",
                                            transition: "all 2000ms ease-in-out",
                                            textShadow:
                                                seriesState.extRoundRightScore >= 4
                                                    ? `
                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                        0 1px 3px rgba(0,0,0,0.4)
                                                    `
                                                    : "none",
                                        }}
                                    >
                                        <Odometer
                                            value={seriesState.extRoundRightScore}
                                            duration={900}
                                            format="d"
                                        />
                                    </span>
                                    <div className={css.lossLines}>
                                        {!isPlayoffsStyleSeries && setsToWin === 3 ? (
                                            <>
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.line}
                                                        style={{
                                                            boxShadow:
                                                                playerLostSets >= i + 1
                                                                    ? `
                                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                    : "none",
                                                            width: "16px",
                                                        }}
                                                    >
                                                        <div
                                                            className={css.lossLineUnlit}
                                                            style={{
                                                                background: seriesState.rightTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.lossLineLit}
                                                            style={{
                                                                background: seriesState.rightTeam?.gradient,
                                                                opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : !isPlayoffsStyleSeries && setsToWin === 2 ? (
                                            <>
                                                {[...Array(2)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.line}
                                                        style={{
                                                            boxShadow:
                                                                playerLostSets >= i + 1
                                                                    ? `
                                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                    : "none"
                                                        }}
                                                    >
                                                        <div
                                                            className={css.lossLineUnlit}
                                                            style={{
                                                                background: seriesState.rightTeam?.unlitGradient,
                                                            }}
                                                        />

                                                        <div
                                                            className={css.lossLineLit}
                                                            style={{
                                                                background: seriesState.rightTeam?.gradient,
                                                                opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : !isPlayoffsStyleSeries && setsToWin === 1 ? (
                                            <div
                                                className={css.line}
                                                style={{
                                                    boxShadow:
                                                        playerLostSets >= 1
                                                            ? `
                                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                            : "none"
                                                }}
                                            >
                                                <div
                                                    className={css.lossLineUnlit}
                                                    style={{
                                                        background: seriesState.rightTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.lossLineLit}
                                                    style={{
                                                        background: seriesState.rightTeam?.gradient,
                                                        opacity: playerLostSets >= 1 ? 1 : 0,
                                                    }}
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className={css.verticalLossLines} style={{ marginTop: "6px" }}>
                                    {isPlayoffsStyleSeries && setsToWin === 5 ? (
                                        <>
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        height: "12px",
                                                        boxShadow:
                                                            playerLostSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.rightTeam?.color},
                                                                    0 0 7px ${seriesState.rightTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLossLineUnlit}
                                                        style={{
                                                            background: seriesState.rightTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLossLineLit}
                                                        style={{
                                                            background: seriesState.rightTeam?.gradient,
                                                            opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : isPlayoffsStyleSeries && setsToWin === 4 ? (
                                        <>
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        height: "14px",
                                                        boxShadow:
                                                            playerLostSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.rightTeam?.color},
                                                                    0 0 7px ${seriesState.rightTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLossLineUnlit}
                                                        style={{
                                                            background: seriesState.rightTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLossLineLit}
                                                        style={{
                                                            background: seriesState.rightTeam?.gradient,
                                                            opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : isPlayoffsStyleSeries && setsToWin === 3 ? (
                                        <>
                                            {[...Array(3)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        height: "16px",
                                                        boxShadow:
                                                            playerLostSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.rightTeam?.color},
                                                                    0 0 7px ${seriesState.rightTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLossLineUnlit}
                                                        style={{
                                                            background: seriesState.rightTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLossLineLit}
                                                        style={{
                                                            background: seriesState.rightTeam?.gradient,
                                                            opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : isPlayoffsStyleSeries && setsToWin === 2 ? (
                                        <>
                                            {[...Array(2)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.verticalLine}
                                                    style={{
                                                        boxShadow:
                                                            playerLostSets >= i + 1
                                                                ? `
                                                                    0 0 3px ${seriesState.rightTeam?.color},
                                                                    0 0 7px ${seriesState.rightTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.verticalLossLineUnlit}
                                                        style={{
                                                            background: seriesState.rightTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.verticalLossLineLit}
                                                        style={{
                                                            background: seriesState.rightTeam?.gradient,
                                                            opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : isPlayoffsStyleSeries && setsToWin === 1 ? (
                                        <div
                                            className={css.verticalLine}
                                            style={{
                                                height: "12px",
                                                boxShadow:
                                                    playerLostSets >= 1
                                                        ? `
                                                                    0 0 3px ${seriesState.rightTeam?.color},
                                                                    0 0 7px ${seriesState.rightTeam?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `
                                                        : "none",
                                            }}
                                        >
                                            <div
                                                className={css.verticalLossLineUnlit}
                                                style={{
                                                    background: seriesState.rightTeam?.unlitGradient,
                                                }}
                                            />

                                            <div
                                                className={css.verticalLossLineLit}
                                                style={{
                                                    background: seriesState.rightTeam?.gradient,
                                                    opacity: playerLostSets >= 1 ? 1 : 0,
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                                <BreakdownSquares team={seriesState.rightTeam} lit={Math.min(seriesState.extRoundRightScore, 4)} total={4} side="right" />
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: "28px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "14px",
                                width: "100%",
                                maxWidth: "720px",
                            }}
                        >
                            <ExtendedRoundsTrack
                                rounds={extendedRoundDetails.rounds}
                                revealedCount={seriesState.extRoundCommentaryShown ? seriesState.extRoundRevealIndex : 0}
                                clinchIndex={extendedRoundDetails.clinchIndex}
                                decidedWinner={
                                    seriesState.extRoundRevealIndex >= extendedRoundDetails.rounds.length &&
                                        seriesState.extRoundLeftScore !== seriesState.extRoundRightScore
                                        ? seriesState.extRoundLeftScore > seriesState.extRoundRightScore ? "left" : "right"
                                        : null
                                }
                                leftTeam={seriesState.leftTeam}
                                rightTeam={seriesState.rightTeam}
                            />
                            <ExtendedRoundsStatus
                                rounds={extendedRoundDetails.rounds}
                                revealedCount={seriesState.extRoundRevealIndex}
                                introShown={seriesState.extRoundCommentaryShown}
                                resolved={
                                    seriesState.tiebreakerBigSymbol === "=" ||
                                    !!banner ||
                                    playerWonSets + playerLostSets >= seriesState.setNumber
                                }
                                leftScore={seriesState.extRoundLeftScore}
                                rightScore={seriesState.extRoundRightScore}
                                leftTeam={seriesState.leftTeam}
                                rightTeam={seriesState.rightTeam}
                                setNumber={seriesState.setNumber}
                                setsToWin={setsToWin}
                                seriesOver={!!banner}
                                renderTeamLabel={renderTeamLabel}
                            />
                        </div>
                    </motion.div>
                )}
                {seriesState.tiebreakerPhase === "penalties" && !seriesState.penaltyResolved ? (
                    <motion.div
                        key={seriesState.penaltyTurn}
                        initial={{ opacity: 0, scale: 3 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.1 }}
                        style={{
                            textAlign: "center",
                            fontSize: "18px",
                            fontWeight: 700,
                            marginBottom: "8px",
                            display: "inline-block",

                            backgroundImage:
                                seriesState.penaltyTurn === "left"
                                    ? seriesState.leftTeam?.gradient
                                    : seriesState.rightTeam?.gradient,

                            backgroundRepeat: "no-repeat",
                            backgroundSize: "100% 100%",

                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",

                            WebkitTextFillColor: "transparent",
                            color: "transparent",
                        }}
                    >
                        Team{" "}
                        {seriesState.penaltyTurn === "left"
                            ? seriesState.leftTeam?.name
                            : seriesState.rightTeam?.name}
                        's turn!
                    </motion.div>
                ) : null}
                <div className={css.scoreboard} style={{ backgroundColor: "#fff" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        {isSeriesPointWins ? (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                style={{
                                    color: seriesState.leftTeam?.color,
                                    fontSize: "16px",
                                    transition: "all 500ms ease-in-out",
                                    textShadow: `
                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                        0 1px 3px rgba(0,0,0,0.4)
                                                    `
                                    ,
                                    marginBottom: "4px",
                                    marginLeft: isPlayoffsStyleSeries ? '0' : '8px',
                                    marginTop: "-28px"
                                }}
                            >
                                {getPointLabel()}
                            </motion.span>
                        ) : (
                            isSetPointWins && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    style={{
                                        color: seriesState.leftTeam?.color,
                                        fontSize: "16px",
                                        transition: "all 500ms ease-in-out",
                                        textShadow: `
                                                            0 0 3px ${seriesState.leftTeam?.color},
                                                            0 0 7px ${seriesState.leftTeam?.color}66,
                                                            0 1px 3px rgba(0,0,0,0.4)
                                                        `
                                        ,
                                        marginBottom: "4px",
                                        marginLeft: isPlayoffsStyleSeries ? '0' : '8px',
                                        marginTop: "-28px"
                                    }}
                                >
                                    Set point!
                                </motion.span>
                            )
                        )}
                        {!isPlayoffsStyleSeries && !banner ? (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                style={{
                                    display: "inline-block",

                                    backgroundImage: seriesState.leftTeam?.gradient,
                                    backgroundRepeat: "no-repeat",
                                    backgroundSize: "100% 100%",

                                    WebkitBackgroundClip: "text",
                                    backgroundClip: "text",

                                    WebkitTextFillColor: "transparent",
                                    color: "transparent",

                                    transition: "all 500ms ease-in-out",
                                }}
                                className={css.team_name_left}>
                                Team {seriesState.leftTeam?.name}
                            </motion.span>
                        ) : null}

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row-reverse",
                                alignItems: "center",
                                gap: "14px",
                                opacity: loserOpacity === "win" ? 0.4 : 1,
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", flexDirection: 'column', width: '50.1px', position: 'relative' }}>
                                <motion.span
                                    key={roundWins}
                                    initial={{ scale: 1.05, opacity: 0.3 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.7 }}
                                    className={css.round_text}
                                    style={{
                                        height: '76px',
                                        filter:
                                            roundWins === overtimeTarget
                                                ? `
                                                    drop-shadow(0 0 1.5px ${seriesState.leftTeam.color})
                                                    drop-shadow(0 0 3.5px ${seriesState.leftTeam?.color}66)
                                                    drop-shadow(0 1px 3px rgba(0,0,0,0.4))
                                                `
                                                : "none",
                                    }}
                                >
                                    <CountUp
                                        key={roundWins}
                                        start={Math.max(roundWins - 1, 0)}
                                        end={roundWins}
                                        duration={1}
                                        style={{
                                            background: seriesState.leftTeam?.gradient,
                                            WebkitBackgroundClip: "text",
                                            backgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            color: "transparent",
                                            fontSize: "52px",
                                            transition: "all 2000ms ease-in-out"
                                        }}
                                    />
                                </motion.span>
                                <div className={css.lines}>
                                    {!isPlayoffsStyleSeries && setsToWin === 3 ? (
                                        <>
                                            {[...Array(3)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.line}
                                                    style={{
                                                        boxShadow:
                                                            playerWonSets >= i + 1
                                                                ? `
                                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                : "none",
                                                        width: "16px",
                                                    }}
                                                >
                                                    <div
                                                        className={css.lineUnlit}
                                                        style={{
                                                            background: seriesState.leftTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.lineLit}
                                                        style={{
                                                            background: seriesState.leftTeam?.gradient,
                                                            opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : !isPlayoffsStyleSeries && setsToWin === 2 ? (
                                        <>
                                            {[...Array(2)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.line}
                                                    style={{
                                                        boxShadow:
                                                            playerWonSets >= i + 1
                                                                ? `
                                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        className={css.lineUnlit}
                                                        style={{
                                                            background: seriesState.leftTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.lineLit}
                                                        style={{
                                                            background: seriesState.leftTeam?.gradient,
                                                            opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : !isPlayoffsStyleSeries && setsToWin === 1 ? (
                                        <div
                                            className={css.line}
                                            style={{
                                                boxShadow:
                                                    playerWonSets >= 1
                                                        ? `
                                                                        0 0 3px ${seriesState.leftTeam?.color},
                                                                        0 0 7px ${seriesState.leftTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                        : "none",
                                            }}
                                        >
                                            <div
                                                className={css.lineUnlit}
                                                style={{
                                                    background: seriesState.leftTeam?.unlitGradient,
                                                }}
                                            />

                                            <div
                                                className={css.lineLit}
                                                style={{
                                                    background: seriesState.leftTeam?.gradient,
                                                    opacity: playerWonSets >= 1 ? 1 : 0,
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                                {seriesState.tiebreakerPhase === "idle" && (
                                    <MomentumStreakBadge value={seriesState.liveStats?.left?.momentum} animated />
                                )}
                            </div>
                            {seriesState.tiebreakerPhase === "penalties" ? (
                                <PenaltyCircles
                                    results={seriesState.penaltyLeftResults}
                                    team="left"
                                    attemptsToDisplay={attemptsToDisplay}
                                    resolved={seriesState.penaltyResolved}
                                    shouldHaveMargin={seriesState.tiebreakerPhase === "penalties" ? false : true}
                                />
                            ) : !banner ? (
                                <div className={css.miniSquares}>
                                    {[...Array(displayedMiniSquares)].map((_, i) => {
                                        const isLit = i < miniWins;

                                        return (
                                            <div
                                                key={i}
                                                className={css.square}
                                                style={{
                                                    boxShadow: isLit
                                                        ? `
                                                            0 0 3px ${seriesState.leftTeam?.color},
                                                            0 0 7px ${seriesState.leftTeam?.color}66,
                                                            0 1px 3px rgba(0,0,0,0.4)
                                                        `
                                                        : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.squareUnlit}
                                                    style={{
                                                        background: seriesState.leftTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.squareLit}
                                                    style={{
                                                        background: seriesState.leftTeam?.gradient,
                                                        opacity: isLit ? 1 : 0,
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}
                            <div className={css.verticalLines}>
                                {isPlayoffsStyleSeries && setsToWin === 5 ? (
                                    <>
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={css.verticalLine}
                                                style={{
                                                    height: "12px",
                                                    width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                    boxShadow:
                                                        playerWonSets >= i + 1
                                                            ? `
                                                                0 0 3px ${seriesState.leftTeam?.color},
                                                                0 0 7px ${seriesState.leftTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.verticalLineUnlit}
                                                    style={{
                                                        background: seriesState.leftTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.verticalLineLit}
                                                    style={{
                                                        background: seriesState.leftTeam?.gradient,
                                                        opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </>
                                ) : isPlayoffsStyleSeries && setsToWin === 4 ? (
                                    <>
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={css.verticalLine}
                                                style={{
                                                    height: "14px",
                                                    width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                    boxShadow:
                                                        playerWonSets >= i + 1
                                                            ? `
                                                                0 0 3px ${seriesState.leftTeam?.color},
                                                                0 0 7px ${seriesState.leftTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.verticalLineUnlit}
                                                    style={{
                                                        background: seriesState.leftTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.verticalLineLit}
                                                    style={{
                                                        background: seriesState.leftTeam?.gradient,
                                                        opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </>
                                ) : isPlayoffsStyleSeries && setsToWin === 3 ? (
                                    <>
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={css.verticalLine}
                                                style={{
                                                    height: "16px",
                                                    width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                    boxShadow:
                                                        playerWonSets >= i + 1
                                                            ? `
                                                                0 0 3px ${seriesState.leftTeam?.color},
                                                                0 0 7px ${seriesState.leftTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.verticalLineUnlit}
                                                    style={{
                                                        background: seriesState.leftTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.verticalLineLit}
                                                    style={{
                                                        background: seriesState.leftTeam?.gradient,
                                                        opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </>
                                ) : isPlayoffsStyleSeries && setsToWin === 2 ? (
                                    <>
                                        {[...Array(2)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={css.verticalLine}
                                                style={{
                                                    width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                    boxShadow:
                                                        playerWonSets >= i + 1
                                                            ? `
                                                                0 0 3px ${seriesState.leftTeam?.color},
                                                                0 0 7px ${seriesState.leftTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.verticalLineUnlit}
                                                    style={{
                                                        background: seriesState.leftTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.verticalLineLit}
                                                    style={{
                                                        background: seriesState.leftTeam?.gradient,
                                                        opacity: playerWonSets >= i + 1 ? 1 : 0,
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </>
                                ) : isPlayoffsStyleSeries && setsToWin === 1 ? (
                                    <div
                                        className={css.verticalLine}
                                        style={{
                                            height: "12px",
                                            width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                            boxShadow:
                                                playerWonSets >= 1
                                                    ? `
                                                                0 0 3px ${seriesState.leftTeam?.color},
                                                                0 0 7px ${seriesState.leftTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                                    : "none",
                                        }}
                                    >
                                        <div
                                            className={css.verticalLineUnlit}
                                            style={{
                                                background: seriesState.leftTeam?.unlitGradient,
                                            }}
                                        />

                                        <div
                                            className={css.verticalLineLit}
                                            style={{
                                                background: seriesState.leftTeam?.gradient,
                                                opacity: playerWonSets >= 1 ? 1 : 0,
                                                width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                            }}
                                        />
                                    </div>
                                ) : null}
                            </div>
                            {!banner && isPlayoffsStyleSeries ? (
                                <motion.span
                                    key={seriesState.leftTeam?.name}
                                    initial={{ x: 420 }}
                                    animate={{ x: 0 }}
                                    exit={{ x: 420 }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                    style={{
                                        display: "inline-block",

                                        backgroundImage: seriesState.leftTeam?.gradient,
                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "100% 100%",

                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",

                                        WebkitTextFillColor: "transparent",
                                        color: "transparent",

                                        transition: "all 500ms ease-in-out",

                                        margin: "0",
                                        position: "absolute",
                                        right: "110%",
                                        zIndex: -1,
                                        fontSize: "28px",
                                    }}
                                    className={css.team_name_left}>
                                    Team {seriesState.leftTeam?.name}
                                </motion.span>
                            ) : null}
                        </div>
                    </div>
                    {banner ? (() => {
                        const cleanBanner = banner.text;
                        const chars = cleanBanner.split("");

                        const fromTop = (index) =>
                            banner.tie ? index % 2 === 0 : index < Math.ceil(chars.length / 2);

                        return (
                            <motion.span
                                className={css.round_text}
                                style={{
                                    fontSize: "38px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0px",
                                    width: banner.tie ? 'max-content' : '63.8px',
                                    textShadow: banner.shadow
                                }}
                            >
                                {chars.map((char, index) => (
                                    <motion.span
                                        key={`${index}-${char}`}
                                        initial={{
                                            opacity: 0,
                                            y: fromTop(index) ? -20 : 20,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        transition={{
                                            duration: 0.45
                                        }}
                                        style={{
                                            display: "inline-block",
                                            background: banner.gradient,
                                            backgroundClip: "text",
                                            WebkitBackgroundClip: "text",

                                            color: "transparent",
                                            WebkitTextFillColor: "transparent",
                                        }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}

                                <motion.span
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.45
                                    }}
                                    style={{
                                        display: "inline-block",
                                        marginLeft: "2px",
                                        background: banner.gradient,
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",

                                        color: "transparent",
                                        WebkitTextFillColor: "transparent",
                                    }}
                                >
                                    !
                                </motion.span>
                            </motion.span>
                        );
                    })() : (
                        <div
                            style={{
                                marginTop: isPlayoffsStyleSeries ? "16px" : "24px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: "63.8px",
                                    height: "42px",
                                    marginBottom:
                                        isPlayoffsStyleSeries &&
                                            seriesState.tiebreakerPhase !== "penalties"
                                            ? "-12px"
                                            : "0",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    overflow: "hidden",
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={momentum}
                                        initial={{
                                            opacity: 0,
                                            scale: momentum === "tied" ? 0.5 : 0.65,
                                            rotate: momentum === "tied" ? 0 : -15,
                                            x:
                                                momentum === "left"
                                                    ? 15
                                                    : momentum === "right"
                                                        ? -30
                                                        : -2,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                            rotate: 0,
                                            x:
                                                momentum === "left"
                                                    ? -28
                                                    : momentum === "right"
                                                        ? 8
                                                        : -6,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            scale: momentum === "tied" ? 0.5 : 0.65,
                                            rotate: momentum === "tied" ? 0 : 15,
                                            x:
                                                momentum === "left"
                                                    ? -15
                                                    : momentum === "right"
                                                        ? 4
                                                        : -6,
                                        }}
                                        transition={{
                                            duration: 0.35,
                                            ease: "easeInOut",
                                        }}
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            userSelect: "none",
                                            color:
                                                momentum === "left"
                                                    ? seriesState.leftTeam?.color
                                                    : momentum === "right"
                                                        ? seriesState.rightTeam?.color
                                                        : "#757575",
                                            filter:
                                                momentum === "left"
                                                    ? `drop-shadow(0 0 3.5px ${seriesState.leftTeam?.color})`
                                                    : momentum === "right"
                                                        ? `drop-shadow(0 0 3.5px ${seriesState.rightTeam?.color})`
                                                        : "drop-shadow(0 0 4px #757575)",
                                        }}
                                    >
                                        {momentum === "left" ? (
                                            <GradientCaretLeft
                                                size={30}
                                                gradient={{
                                                    top: lightenHex(seriesState.leftTeam.color, 0.18),
                                                    middle: seriesState.leftTeam.color,
                                                    bottom: darkenHex(
                                                        seriesState.leftTeam.color,
                                                        getBrightness(seriesState.leftTeam.color) > 210
                                                            ? 0.22
                                                            : 0.35
                                                    ),
                                                }}
                                                glowColor={seriesState.leftTeam.color}
                                            />
                                        ) : momentum === "right" ? (
                                            <GradientCaretRight
                                                size={30}
                                                gradient={{
                                                    top: lightenHex(seriesState.rightTeam.color, 0.18),
                                                    middle: seriesState.rightTeam.color,
                                                    bottom: darkenHex(
                                                        seriesState.rightTeam.color,
                                                        getBrightness(seriesState.rightTeam.color) > 210
                                                            ? 0.22
                                                            : 0.35
                                                    ),
                                                }}
                                                glowColor={seriesState.rightTeam.color}
                                            />
                                        ) : (
                                            <GradientDiamond
                                                size={20}
                                                gradient={{
                                                    top: "#9c9c9c",
                                                    middle: "#757575",
                                                    bottom: "#555555",
                                                }}
                                                glowColor="#757575"
                                            />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            {!isPlayoffsStyleSeries && seriesState.tiebreakerPhase === "penalties"
                                ? null
                                : (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className={css.round_text}
                                        style={{
                                            fontSize: "14px",
                                            width: "63.8px",
                                            textAlign: "center",
                                            marginTop:
                                                isPlayoffsStyleSeries &&
                                                    seriesState.tiebreakerPhase !== "penalties"
                                                    ? "8px"
                                                    : "0px",
                                        }}
                                    >
                                        {seriesState.tiebreakerPhase === "penalties" ? (
                                            "\u00A0"
                                        ) : (
                                            <>
                                                Round{" "}
                                                <CountUp
                                                    key={roundWins + roundLosses + 1}
                                                    start={Math.max(roundWins + roundLosses, 0)}
                                                    end={roundWins + roundLosses + 1}
                                                    duration={1}
                                                />
                                            </>
                                        )}
                                    </motion.span>
                                )
                            }
                        </div>
                    )}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                        }}
                    >
                        {isSeriesPointLosses ? (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                style={{
                                    color: seriesState.rightTeam?.color,
                                    fontSize: "16px",
                                    transition: "all 500ms ease-in-out",
                                    textShadow: `
                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                        0 1px 3px rgba(0,0,0,0.4)
                                                    `,
                                    marginBottom: "4px",
                                    marginRight: isPlayoffsStyleSeries ? '0' : '8px',
                                    marginTop: "-28px"
                                }}
                            >
                                {getPointLabel()}
                            </motion.span>
                        ) : (
                            isSetPointLosses && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    style={{
                                        color: seriesState.rightTeam?.color,
                                        fontSize: "16px",
                                        transition: "all 500ms ease-in-out",
                                        textShadow: `
                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                        0 1px 3px rgba(0,0,0,0.4)
                                                    `,
                                        marginBottom: "4px",
                                        marginRight: isPlayoffsStyleSeries ? '0' : '8px',
                                        marginTop: "-28px"
                                    }}
                                >
                                    Set point!
                                </motion.span>
                            )
                        )}
                        {!isPlayoffsStyleSeries && !banner ? (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                style={{
                                    display: "inline-block",

                                    backgroundImage: seriesState.rightTeam?.gradient,
                                    backgroundRepeat: "no-repeat",
                                    backgroundSize: "100% 100%",

                                    WebkitBackgroundClip: "text",
                                    backgroundClip: "text",

                                    WebkitTextFillColor: "transparent",
                                    color: "transparent",

                                    transition: "all 500ms ease-in-out",
                                }}
                                className={css.team_name_right}>
                                Team {seriesState.rightTeam?.name}
                            </motion.span>
                        ) : null}

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                                opacity: loserOpacity === "loss" ? 0.4 : 1,
                                position: 'relative'
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    flexDirection: 'column',
                                    width: '50.1px',
                                    position: 'relative'
                                }}
                            >
                                <motion.span
                                    key={roundLosses}
                                    initial={{ scale: 1.05, opacity: 0.3 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.7 }}
                                    className={css.round_text}
                                    style={{
                                        height: '76px',
                                        filter:
                                            roundLosses === overtimeTarget
                                                ? `
                                                    drop-shadow(0 0 1.5px ${seriesState.rightTeam.color})
                                                    drop-shadow(0 0 3.5px ${seriesState.rightTeam?.color}66)
                                                    drop-shadow(0 1px 3px rgba(0,0,0,0.4))
                                                `
                                                : "none",
                                    }}
                                >
                                    <CountUp
                                        key={roundLosses}
                                        start={Math.max(roundLosses - 1, 0)}
                                        end={roundLosses}
                                        duration={1}
                                        style={{
                                            background: seriesState.rightTeam?.gradient,
                                            WebkitBackgroundClip: "text",
                                            backgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            color: "transparent",
                                            fontSize: "52px",
                                            transition: "all 2000ms ease-in-out"
                                        }}
                                    />
                                </motion.span>
                                <div className={css.lossLines}>
                                    {!isPlayoffsStyleSeries && setsToWin === 3 ? (
                                        <>
                                            {[...Array(3)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.line}
                                                    style={{
                                                        boxShadow:
                                                            playerLostSets >= i + 1
                                                                ? `
                                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                : "none",
                                                        width: "16px",
                                                    }}
                                                >
                                                    <div
                                                        className={css.lossLineUnlit}
                                                        style={{
                                                            background: seriesState.rightTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.lossLineLit}
                                                        style={{
                                                            background: seriesState.rightTeam?.gradient,
                                                            opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : !isPlayoffsStyleSeries && setsToWin === 2 ? (
                                        <>
                                            {[...Array(2)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={css.line}
                                                    style={{
                                                        boxShadow:
                                                            playerLostSets >= i + 1
                                                                ? `
                                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                                : "none"
                                                    }}
                                                >
                                                    <div
                                                        className={css.lossLineUnlit}
                                                        style={{
                                                            background: seriesState.rightTeam?.unlitGradient,
                                                        }}
                                                    />

                                                    <div
                                                        className={css.lossLineLit}
                                                        style={{
                                                            background: seriesState.rightTeam?.gradient,
                                                            opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : !isPlayoffsStyleSeries && setsToWin === 1 ? (
                                        <div
                                            className={css.line}
                                            style={{
                                                boxShadow:
                                                    playerLostSets >= 1
                                                        ? `
                                                                        0 0 3px ${seriesState.rightTeam?.color},
                                                                        0 0 7px ${seriesState.rightTeam?.color}66,
                                                                        0 1px 3px rgba(0,0,0,0.4)
                                                                    `
                                                        : "none"
                                            }}
                                        >
                                            <div
                                                className={css.lossLineUnlit}
                                                style={{
                                                    background: seriesState.rightTeam?.unlitGradient,
                                                }}
                                            />

                                            <div
                                                className={css.lossLineLit}
                                                style={{
                                                    background: seriesState.rightTeam?.gradient,
                                                    opacity: playerLostSets >= 1 ? 1 : 0,
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                                {seriesState.tiebreakerPhase === "idle" && (
                                    <MomentumStreakBadge value={seriesState.liveStats?.right?.momentum} animated />
                                )}
                            </div>
                            {seriesState.tiebreakerPhase === "penalties" ? (
                                <PenaltyCircles
                                    results={seriesState.penaltyRightResults}
                                    team="right"
                                    attemptsToDisplay={attemptsToDisplay}
                                    resolved={seriesState.penaltyResolved}
                                    shouldHaveMargin={seriesState.tiebreakerPhase === "penalties" ? false : true}
                                />
                            ) : !banner ? (
                                <div className={css.miniSquares} style={{ flexDirection: 'row-reverse' }}>
                                    {[...Array(displayedMiniSquares)].map((_, i) => {
                                        const isLit = i < miniLosses;

                                        return (
                                            <div
                                                key={i}
                                                className={css.lossSquare}
                                                style={{
                                                    boxShadow: isLit
                                                        ? `
                                                                0 0 3px ${seriesState.rightTeam?.color},
                                                                0 0 7px ${seriesState.rightTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                                        : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.lossSquareUnlit}
                                                    style={{
                                                        background: seriesState.rightTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.lossSquareLit}
                                                    style={{
                                                        background: seriesState.rightTeam?.gradient,
                                                        opacity: isLit ? 1 : 0,
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}
                            <div className={css.verticalLossLines}>
                                {isPlayoffsStyleSeries && setsToWin === 5 ? (
                                    <>
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={css.verticalLine}
                                                style={{
                                                    height: "12px",
                                                    width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                    boxShadow:
                                                        playerLostSets >= i + 1
                                                            ? `
                                                                0 0 3px ${seriesState.rightTeam?.color},
                                                                0 0 7px ${seriesState.rightTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.verticalLossLineUnlit}
                                                    style={{
                                                        background: seriesState.rightTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.verticalLossLineLit}
                                                    style={{
                                                        background: seriesState.rightTeam?.gradient,
                                                        opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </>
                                ) : isPlayoffsStyleSeries && setsToWin === 4 ? (
                                    <>
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={css.verticalLine}
                                                style={{
                                                    height: "14px",
                                                    width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                    boxShadow:
                                                        playerLostSets >= i + 1
                                                            ? `
                                                                0 0 3px ${seriesState.rightTeam?.color},
                                                                0 0 7px ${seriesState.rightTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.verticalLossLineUnlit}
                                                    style={{
                                                        background: seriesState.rightTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.verticalLossLineLit}
                                                    style={{
                                                        background: seriesState.rightTeam?.gradient,
                                                        opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </>
                                ) : isPlayoffsStyleSeries && setsToWin === 3 ? (
                                    <>
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={css.verticalLine}
                                                style={{
                                                    height: "16px",
                                                    width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                    boxShadow:
                                                        playerLostSets >= i + 1
                                                            ? `
                                                                0 0 3px ${seriesState.rightTeam?.color},
                                                                0 0 7px ${seriesState.rightTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.verticalLossLineUnlit}
                                                    style={{
                                                        background: seriesState.rightTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.verticalLossLineLit}
                                                    style={{
                                                        background: seriesState.rightTeam?.gradient,
                                                        opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </>
                                ) : isPlayoffsStyleSeries && setsToWin === 2 ? (
                                    <>
                                        {[...Array(2)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={css.verticalLine}
                                                style={{
                                                    width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                                    boxShadow:
                                                        playerLostSets >= i + 1
                                                            ? `
                                                                0 0 3px ${seriesState.rightTeam?.color},
                                                                0 0 7px ${seriesState.rightTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    className={css.verticalLossLineUnlit}
                                                    style={{
                                                        background: seriesState.rightTeam?.unlitGradient,
                                                    }}
                                                />

                                                <div
                                                    className={css.verticalLossLineLit}
                                                    style={{
                                                        background: seriesState.rightTeam?.gradient,
                                                        opacity: playerLostSets >= i + 1 ? 1 : 0,
                                                        width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </>
                                ) : isPlayoffsStyleSeries && setsToWin === 1 ? (
                                    <div
                                        className={css.verticalLine}
                                        style={{
                                            width: seriesState.tiebreakerPhase === "penalties" ? "4.7px" : "5px",
                                            boxShadow:
                                                playerLostSets >= 1
                                                    ? `
                                                                0 0 3px ${seriesState.rightTeam?.color},
                                                                0 0 7px ${seriesState.rightTeam?.color}66,
                                                                0 1px 3px rgba(0,0,0,0.4)
                                                            `
                                                    : "none",
                                        }}
                                    >
                                        <div
                                            className={css.verticalLossLineUnlit}
                                            style={{
                                                background: seriesState.rightTeam?.unlitGradient,
                                            }}
                                        />

                                        <div
                                            className={css.verticalLossLineLit}
                                            style={{
                                                background: seriesState.rightTeam?.gradient,
                                                opacity: playerLostSets >= 1 ? 1 : 0,
                                                width: seriesState.tiebreakerPhase === "penalties" ? "5.2px" : "5.5px",
                                            }}
                                        />
                                    </div>
                                ) : null}
                            </div>
                            {!banner && isPlayoffsStyleSeries ? (
                                <motion.span
                                    key={seriesState.rightTeam?.name}
                                    initial={{ x: -420 }}
                                    animate={{ x: 0 }}
                                    exit={{ x: -420 }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                    style={{
                                        display: "inline-block",

                                        backgroundImage: seriesState.rightTeam?.gradient,
                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "100% 100%",

                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",

                                        WebkitTextFillColor: "transparent",
                                        color: "transparent",

                                        transition: "all 500ms ease-in-out",

                                        margin: "0",
                                        position: "absolute",
                                        left: "110%",
                                        zIndex: -1,
                                        fontSize: "28px",
                                    }}
                                    className={css.team_name_right}>
                                    Team {seriesState.rightTeam?.name}
                                </motion.span>
                            ) : null}
                        </div>
                    </div>
                </div>

                {!banner && isOvertime && seriesState.tiebreakerPhase !== "penalties" ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className={css.game_info_text}
                    >
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.round_text}
                            style={{
                                textAlign: "center",
                                fontSize: "14px",
                                marginBottom: "12px",
                                userSelect: "none"
                            }}
                        >
                            First to {overtimeToWin}
                        </motion.span>

                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.round_text}
                            style={{
                                textAlign: "center",
                                fontSize: "20px",
                                marginTop: "-20px",
                                userSelect: "none"
                            }}
                        >
                            {getOvertimeLabel(overtimeBlock === 0 ? 1 : overtimeBlock)}
                            <br />
                        </motion.span>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className={css.game_info_text}
                    >
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.round_text}
                            style={{
                                textAlign: "center",
                                fontSize: "14px",
                                marginBottom: "12px",
                                userSelect: "none"
                            }}
                        >
                            {seriesState.tiebreakerPhase === "penalties" && !banner
                                ? `Penalty Series`
                                : "\u00A0"}
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.round_text}
                            style={{
                                textAlign: "center",
                                fontSize: "20px",
                                marginTop: "-20px",
                                userSelect: "none"
                            }}
                        >
                            {inSuddenDeath && !banner && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className={css.round_text}
                                    style={{
                                        textAlign: "center",
                                        marginBottom: "12px",
                                        color: "rgb(152, 51, 51)",
                                        userSelect: "none"
                                    }}
                                >
                                    Sudden Death!!! <span style={{ color: "#2e2f42" }}>|</span>{" "}
                                </motion.span>
                            )}
                            {seriesState.tiebreakerPhase === "penalties" && !banner
                                ? `Attempt ${currentAttempt}`
                                : "\u00A0"}
                        </motion.span>
                    </motion.div>
                )}

                <div className={css.seriesGambleMessage}>
                    {!banner &&
                        seriesState.lastMultiplierLeft != null &&
                        seriesState.lastMultiplierRight != null && (
                            <>
                                {seriesState.lastMultiplierLeft === seriesState.lastMultiplierRight ? (
                                    <p className={css.seriesResultMessage} style={{ textAlign: "center", fontWeight: seriesState.tiebreakerPhase === "penalties" ? "700" : "" }}>
                                        {seriesState.tiebreakerPhase === "penalties"
                                            ? "The same attempt should be retaken"
                                            : "No one gets this mini-round!"}
                                    </p>
                                ) : seriesState.tiebreakerPhase === "penalties" ? (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p
                                            className={css.seriesResultMessage}
                                            style={{ flex: 1, fontSize: "16px", textAlign: "center", margin: 0, width: '520px', marginRight: "-16px" }}
                                        >
                                            <span style={{ color: seriesState.leftTeam?.color || "#2e2f42", fontWeight: 900 }}>
                                                Team {seriesState.leftTeam?.name}
                                            </span>{" "}
                                            <strong>
                                                {getPenaltyMessage(
                                                    seriesState.lastPenaltyAttacker === "left",
                                                    seriesState.lastPenaltyAttacker === "left"
                                                        ? seriesState.lastMultiplierLeft > seriesState.lastMultiplierRight
                                                        : seriesState.lastMultiplierRight > seriesState.lastMultiplierLeft
                                                )}
                                            </strong>
                                        </p>

                                        <p
                                            className={css.seriesResultMessage}
                                            style={{ flex: 1, fontSize: "16px", textAlign: "center", margin: 0, width: '520px', marginLeft: "-16px" }}
                                        >
                                            <span style={{ color: seriesState.rightTeam?.color || "#2e2f42", fontWeight: 900 }}>
                                                Team {seriesState.rightTeam?.name}
                                            </span>{" "}
                                            <strong>
                                                {getPenaltyMessage(
                                                    seriesState.lastPenaltyAttacker === "right",
                                                    seriesState.lastPenaltyAttacker === "left"
                                                        ? seriesState.lastMultiplierLeft > seriesState.lastMultiplierRight
                                                        : seriesState.lastMultiplierRight > seriesState.lastMultiplierLeft
                                                )}
                                            </strong>
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p
                                            className={css.seriesResultMessage}
                                            style={{ flex: 1, fontSize: "16px", textAlign: "center", margin: 0, width: '440px', marginRight: "-16px" }}
                                        >
                                            <span style={{ color: seriesState.leftTeam?.color || "#2e2f42", fontWeight: 900 }}>
                                                Team {seriesState.leftTeam?.name}
                                            </span>{" "}
                                            <strong>
                                                {seriesState.lastMultiplierLeft > seriesState.lastMultiplierRight
                                                    ? "gets"
                                                    : "doesn't get"}
                                            </strong>{" "}
                                            this mini-round!
                                        </p>

                                        <p
                                            className={css.seriesResultMessage}
                                            style={{ flex: 1, fontSize: "16px", textAlign: "center", margin: 0, width: '440px', marginLeft: "-16px" }}
                                        >
                                            <span style={{ color: seriesState.rightTeam?.color || "#2e2f42", fontWeight: 900 }}>
                                                Team {seriesState.rightTeam?.name}
                                            </span>{" "}
                                            <strong>
                                                {seriesState.lastMultiplierRight > seriesState.lastMultiplierLeft
                                                    ? "gets"
                                                    : "doesn't get"}
                                            </strong>{" "}
                                            this mini-round!
                                        </p>
                                    </div>
                                )}

                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <span
                                        className={css.seriesMultiplier}
                                        style={{
                                            display: "inline-block",

                                            backgroundImage: getMultiplierClass(
                                                seriesState.lastMultiplierLeft,
                                                seriesState.lastMultiplierRight
                                            ),

                                            backgroundRepeat: "no-repeat",
                                            backgroundSize: "100% 100%",

                                            WebkitBackgroundClip: "text",
                                            backgroundClip: "text",

                                            WebkitTextFillColor: "transparent",
                                            color: "transparent",
                                            width: seriesState.tiebreakerPhase === "penalties" ? '520px' : '440px',
                                            textAlign: 'center',
                                            marginRight: "-16px"
                                        }}
                                    >
                                        {seriesState.lastMultiplierLeft.toFixed(2)}
                                    </span>

                                    <span
                                        className={css.seriesMultiplier}
                                        style={{
                                            display: "inline-block",

                                            backgroundImage: getMultiplierClass(
                                                seriesState.lastMultiplierRight,
                                                seriesState.lastMultiplierLeft
                                            ),

                                            backgroundRepeat: "no-repeat",
                                            backgroundSize: "100% 100%",

                                            WebkitBackgroundClip: "text",
                                            backgroundClip: "text",

                                            WebkitTextFillColor: "transparent",
                                            color: "transparent",
                                            width: seriesState.tiebreakerPhase === "penalties" ? '520px' : '440px',
                                            textAlign: 'center',
                                            marginLeft: "-16px"
                                        }}
                                    >
                                        {seriesState.lastMultiplierRight.toFixed(2)}
                                    </span>
                                </div>
                            </>
                        )}
                </div>

                {!banner && (
                    <div className={css.series_gamble_wrapper}>
                        <button
                            className={`${css.gamble_button} ${isButtonLocked || banner ? css.locked : ""}`}
                            disabled={isButtonLocked || !!banner}
                            onClick={
                                seriesState.tiebreakerPhase === "penalties"
                                    ? handlePenaltyShot
                                    : handleSeriesGamble
                            }
                        >
                            Gamble
                        </button>
                    </div>
                )}
            </div>
            <GameControlModals
                controls={{ isRestartModalOpen, confirmRestart, isTerminateModalOpen, confirmTerminate, setIsRestartModalOpen, setIsTerminateModalOpen }}
            />
        </>
    );
}
