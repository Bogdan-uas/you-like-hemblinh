import { useEffect, useMemo, useRef } from "react";
import CountUp from "react-countup";
import css from "../SpecialModePage.module.css";
import { setSeriesToastMode } from "../logic/renderSafeToast.js";
import Header from "../../../components/Header/Header.jsx";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaTrophy, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { PenaltyCircles } from "../components/PenaltyCircles.jsx";
import { ExtendedRoundsOverlay } from "../components/ExtendedRounds.jsx";
import { QualifierBadge } from "../components/QualifierBadge.jsx";
import { MomentumStreakBadge } from "../components/StreakBadges.jsx";
import { PemSeriesTrophy, GplTrophy, PbsTrophy, PgxTrophy } from "../components/Trophies.jsx";
import { pgxStageLabel } from "../logic/pgx.jsx";
import { isSingleEclStage, eclStageLabel } from "../logic/ecl.jsx";
import { SKYLINES_ROOF, skylinesStageLabel, getSkylinesFloorName } from "../logic/skylines.jsx";
import { PENALTY_DISPLAY_CIRCLES } from "../logic/gameConstants.js";
import { isSinglePemGroupStage, pemGroupStageLabel, PEM_GROUP_QUALIFYING_STAGES } from "../logic/pemSeries.jsx";
import { isSinglePemStage1Stage, pemStage1StageLabel, PEM_STAGE1_QUALIFYING_STAGES } from "../logic/pemStage1.jsx";
import { PBS_STAGE_TITLES, PBS_VIEW_OF_ROUND } from "../logic/pbsConfig.js";
import { stageLabelPlayoffs } from "../logic/playoffs.js";
import { isSingleQualifierStage, qualifierStageLabel, QUALIFIER_QUALIFYING_STAGES, PLAY_IN_GROUP } from "../logic/qualifier.jsx";
import { swissNetTitle, GPL_SWISS_FORMAT, PGX_SWISS_FORMAT } from "../logic/swiss.js";
import { getDisplayedRoundNumber } from "../logic/series.js";
import { getBrightness } from "../logic/colors.js";
import { LeadingIndicator } from "../components/LeadingIndicator.jsx";
import { RoundScore } from "../components/RoundScore.jsx";
import { SeriesBanner } from "../components/SeriesBanner.jsx";
import { GameControlModals } from "../screens/GameControlModals.jsx";
import { BestOfBadge } from "../components/BestOfBadge.jsx";
import { SetBadge, OvertimeBadge, SetHistory, PenaltyBadge, RoundBadge } from "../components/SeriesBadges.jsx";
import { useSpecialModeSettings, shortKeyCode } from "../logic/settings.js";
import { SimulateAttachment } from "../components/SimulateAttachment.jsx";
import { SecretPanel } from "../components/SecretPanel.jsx";
import { isCheatTargeting } from "../logic/secretCheats.js";

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
        handleSecretButtonContextMenu,
        secret,
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
    const { gambleKey, showGambleKey } = useSpecialModeSettings();
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
        finalRoundMinis,
        isSeriesPointLosses,
        isSetPointLosses,
        overtimeToWin,
    } = series;
    const {
        tournamentLabel,
        pemLabel,
        qualifierLabel,
        cstLabel,
        eclLabel,
        skylinesLabel,
        pgxCmLabel,
        pgxImLabel,
        isPgxMainPhase,
        isCstPhase,
        isPemMainPhase,
        isPemBigSeries,
        pemType,
        gccLabel,
        isGccPhase,
        isGplMainPhase,
        isPbsPhase,
        pbsLabel,
        getOvertimeLabel,
        getPenaltyMessage,
    } = labels;
    const { handlePenaltyShot, handleSeriesGamble, simulation } = actions;

    const seriesLabelNode = useMemo(() => {
        if (!seriesState.active || !seriesState.leftTeam || !seriesState.rightTeam) return null;

        const {
            setsToWin,
            setNumber,
        } = seriesState;

        let event = null;
        let stage = null;
        let big = "";

        if (seriesState.phase === "qualifier") {
            event = qualifierLabel ?? pemLabel;
            stage = seriesState.qualifierGroup === PLAY_IN_GROUP ? "Open Qualifier" : `Group ${seriesState.qualifierGroup}`;
            big = qualifierStageLabel(seriesState.qualifierStage);
        } else if (seriesState.phase === "pemGroup") {
            event = pemLabel;
            stage = `${isPemBigSeries ? "Stage II · " : ""}Group ${seriesState.pemGroup}`;
            big = pemGroupStageLabel(seriesState.pemGroupStage);
        } else if (seriesState.phase === "pemStage1") {
            event = pemLabel;
            stage = `Stage I · Group ${seriesState.pemStage1Group}`;
            big = pemStage1StageLabel(seriesState.pemStage1Stage);
        } else if (seriesState.phase === "ecl") {
            event = eclLabel;
            big = eclStageLabel(seriesState.eclStage);
        } else if (seriesState.phase === "skyline") {
            event = skylinesLabel;
            stage = seriesState.skylineRound === SKYLINES_ROOF
                ? "Rooftop Final"
                : `Round ${(seriesState.skylineRound ?? 0) + 1} · ${getSkylinesFloorName(seriesState.skylineFloor)}`;
            big = skylinesStageLabel(seriesState.skylineStage);
        } else if (seriesState.phase === "gccLeague") {
            event = gccLabel;
            stage = "League Phase";
            big = `Matchday ${seriesState.gccMatchday}`;
        } else if (seriesState.phase === "pgxCm") {
            event = pgxCmLabel;
            stage = seriesState.pgxSection === "playIn"
                ? "Play-ins"
                : seriesState.pgxSection === "deciders"
                    ? "Deciders"
                    : `Group Stage · Group ${seriesState.pgxGroup}`;
            big = pgxStageLabel("cm", seriesState.pgxStage);
        } else if (seriesState.phase === "pgxIm") {
            event = pgxImLabel;
            stage = seriesState.pgxSection === "entry" ? null : "Main Bracket";
            big = pgxStageLabel("im", seriesState.pgxStage);
        } else if (seriesState.phase === "cstGroup") {
            event = cstLabel;
            stage = "Group Stage";
            big = `Group ${seriesState.cstGroup}`;
        } else if (seriesState.phase === "playoffs" && isPbsPhase) {
            event = pbsLabel;
            stage = PBS_STAGE_TITLES[PBS_VIEW_OF_ROUND[seriesState.playoffsStage]];
            big = stageLabelPlayoffs(seriesState.playoffsStage);
        } else if (seriesState.phase === "playoffs") {
            event = isCstPhase ? cstLabel : isGccPhase ? gccLabel : isPemMainPhase ? pemLabel : tournamentLabel;
            stage = "Playoffs";
            big = stageLabelPlayoffs(seriesState.playoffsStage);
        } else if (seriesState.phase === "stage1" || seriesState.phase === "stage2" || seriesState.phase === "stage3") {
            event = tournamentLabel;
            stage = seriesState.swissFormat === PGX_SWISS_FORMAT ? "Swiss Stage" : { stage1: "Stage I", stage2: "Stage II", stage3: "Stage III" }[seriesState.phase];
            big = swissNetTitle(seriesState.swissNet);
        }

        const isPgxSeries = seriesState.phase === "pgxCm" || seriesState.phase === "pgxIm";
        const isQualifierSeries = seriesState.phase === "qualifier" || seriesState.phase === "pgxCm";
        const isPemGroupSeries = seriesState.phase === "pemGroup";
        const isPemStage1Series = seriesState.phase === "pemStage1";
        const isEclSeries = seriesState.phase === "ecl" || seriesState.phase === "skyline" || seriesState.phase === "pgxIm";
        const isGccSeries = isGccPhase && (seriesState.phase === "gccLeague" || seriesState.phase === "playoffs");
        const isCstSeries =
            (isCstPhase && (seriesState.phase === "cstGroup" || seriesState.phase === "playoffs")) || isEclSeries || isGccSeries;
        const isPemSeries = isPemMainPhase && (isPemGroupSeries || isPemStage1Series || seriesState.phase === "playoffs");

        const seriesMatchNumber =
            seriesState.phase === "playoffs"
                ? seriesState.playoffsMatchNumber
                : isPgxSeries
                    ? seriesState.pgxMatchNumber ?? 1
                : isQualifierSeries
                    ? seriesState.qualifierMatchNumber ?? 1
                    : isPemGroupSeries
                        ? seriesState.pemGroupMatchNumber ?? 1
                        : isPemStage1Series
                            ? seriesState.pemStage1MatchNumber ?? 1
                            : isEclSeries
                                ? (seriesState.phase === "skyline" ? seriesState.skylineMatchNumber : seriesState.eclMatchNumber) ?? 1
                                : seriesState.phase === "cstGroup"
                                    ? seriesState.cstMatchNumber ?? 1
                                    : seriesState.phase === "gccLeague"
                                        ? seriesState.gccMatchNumber ?? 1
                                        : seriesState.swissMatchNumber ?? 1;

        const showSeriesMatchNumber = seriesState.phase === "pgxCm"
            ? ["pr1", "pr2", "uo", "dq"].includes(seriesState.pgxStage)
            : seriesState.phase === "pgxIm"
            ? seriesState.pgxStage === "er" || !isSingleEclStage(seriesState.pgxStage)
            : isQualifierSeries
            ? !isSingleQualifierStage(seriesState.qualifierStage)
            : isPemGroupSeries
                ? !isSinglePemGroupStage(seriesState.pemGroupStage)
                : isPemStage1Series
                    ? !isSinglePemStage1Stage(seriesState.pemStage1Stage)
                    : isEclSeries
                        ? (seriesState.phase === "skyline" ? seriesState.skylineStage === "o" || seriesState.skylineStage === "sf" : !isSingleEclStage(seriesState.eclStage))
                        : seriesState.playoffsStage !== "gf" && seriesState.playoffsStage !== "thirdPlace";

        return (
            <>
                <span className={css.series_label}>
                    <span className={css.series_upper_label}>
                        <motion.span
                            key={`event-${`${seriesState.phase}-${seriesState.swissNet ?? seriesState.playoffsStage ?? seriesState.qualifierStage ?? seriesState.pemGroupStage ?? seriesState.pemStage1Stage ?? seriesState.eclStage ?? seriesState.skylineStage ?? seriesState.pgxStage}`}`}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.6 }}
                            className={css.series_label_side}
                            style={{ alignItems: "flex-end", textAlign: "right" }}
                        >
                            <span className={css.series_label_event}>{event}</span>
                            {stage ? <span className={css.series_label_caption}>{stage}</span> : null}
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, y: -40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ duration: 0.6 }}
                            className={`${css.series_label_medallion} ${isQualifierSeries ? css.series_label_medallion_wide : ""}`}
                        >
                            {isQualifierSeries ? (
                                <QualifierBadge height={20} />
                            ) : isCstSeries ? (
                                <span className={css.series_label_vs}>🥇</span>
                            ) : isPemSeries || isGplMainPhase || isPbsPhase || isPgxMainPhase ? (
                                isPbsPhase ? <PbsTrophy /> : isGplMainPhase ? <GplTrophy /> : isPgxMainPhase ? <PgxTrophy /> : <PemSeriesTrophy type={pemType} />
                            ) : (
                                <FaTrophy />
                            )}
                        </motion.span>
                        <motion.span
                            key={`big-${big}`}
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.6 }}
                            className={css.series_label_side}
                            style={{ alignItems: "flex-start" }}
                        >
                            <span className={css.series_label_title}>
                                {big}
                                {showSeriesMatchNumber ? (
                                    <span className={`${css.points} ${css.series_label_number}`}>#{seriesMatchNumber}</span>
                                ) : null}
                            </span>
                        </motion.span>
                    </span>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className={css.round_text}
                        style={{ fontSize: "24px", marginBottom: "2px", marginTop: "10px", marginLeft: "-2px", display: "flex" }}
                    >
                        <BestOfBadge bestOf={setsToWin * 2 - 1} size={20} />
                    </motion.span>
                    {setsToWin !== 1 ? (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.round_text}
                            style={{ fontSize: "24px", display: "flex", alignItems: "center", height: "24px", marginTop: "2px", marginBottom: "8px" }}
                        >
                            <SetBadge set={setNumber} isDecider={setNumber === setsToWin * 2 - 1} size={20} />
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
                    {setsToWin !== 1 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            style={{ display: "flex", justifyContent: "center", transition: "none" }}
                        >
                            <SetHistory seriesState={seriesState} />
                        </motion.div>
                    ) : null}
                </span>
            </>
        );
    }, [seriesState, tournamentLabel, pemLabel, qualifierLabel, cstLabel, eclLabel, skylinesLabel, pgxCmLabel, pgxImLabel, isPgxMainPhase, gccLabel, pbsLabel, isCstPhase, isGccPhase, isGplMainPhase, isPbsPhase, isPemMainPhase, isPemBigSeries, pemType]);

    const getPointLabel = () => {
        if (seriesState.phase === "cstGroup" || seriesState.phase === "gccLeague") return "MATCH POINT!!!";

        if (seriesState.phase === "qualifier") {
            if (!QUALIFIER_QUALIFYING_STAGES.includes(seriesState.qualifierStage)) return "MATCH POINT!!!";
            return qualifierLabel ? "QUALIFICATION POINT!!!" : "MAIN EVENT POINT!!!";
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

        if (seriesState.phase === "pgxCm") {
            if (seriesState.pgxStage === "pr2") return "GROUP STAGE POINT!!!";
            if (seriesState.pgxStage === "uf" || seriesState.pgxStage === "lr2") return "DECIDERS POINT!!!";
            if (seriesState.pgxStage === "dq") return "QUALIFICATION POINT!!!";
            return "MATCH POINT!!!";
        }

        if (seriesState.phase === "pgxIm") {
            if (seriesState.pgxStage === "er") return "MAIN BRACKET POINT!!!";
            if (seriesState.pgxStage === "uf" || seriesState.pgxStage === "cf") return "GRAND FINAL POINT!!!";
            if (seriesState.pgxStage === "gf") return "GRANDMASTERS POINT!!!";
            return "MATCH POINT!!!";
        }

        if (seriesState.phase === "skyline") {
            if (seriesState.skylineStage === "sf") return "GRAND FINAL POINT!!!";
            if (seriesState.skylineStage === "w" && seriesState.skylineFloor > 1) return "ELEVATOR POINT!!!";
            return "MATCH POINT!!!";
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
                return seriesState.swissFormat === PGX_SWISS_FORMAT ? "PLAYOFFS POINT!!!" : "STAGE II POINT!!!";

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

    const currentAttempt = seriesState.penaltyResolved
        ? Math.max(1, leftAttempts, rightAttempts)
        : Math.min(leftAttempts, rightAttempts) + 1;

    const inSuddenDeath = currentAttempt > 5 && !seriesState.penaltyResolved;

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

    const displayedRound = getDisplayedRoundNumber(seriesState);
    const bannerAtMountRef = useRef(!!seriesState.banner);

    useEffect(() => {
        setSeriesToastMode(true);
        return () => setSeriesToastMode(false);
    }, []);

    const pointPillStyle = (team) => ({
        background: team?.gradient,
        color: getBrightness(team?.color ?? "#2e2f42") > 190 ? "#2e2f42" : "#ffffff",
    });

    return (
        <>
            <AnimatePresence>
                {secret?.unlocked && secret.panelOpen ? (
                    <SecretPanel key="secret-panel" secret={secret} teams={{ left: seriesState.leftTeam, right: seriesState.rightTeam }} />
                ) : null}
            </AnimatePresence>
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
            <div style={{ marginTop: setsToWin === 1 ? "0px" : "-120px" }} className={css.series_container}>
                <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", transition: "none" }}>
                    {secret?.unlocked ? <button
                        type="button"
                        onClick={secret.togglePanel}
                        onContextMenu={handleSecretButtonContextMenu}
                        data-secret-button
                        tabIndex={-1}
                        className={css.gamble_button}
                        style={{
                            position: "absolute",
                            bottom: "calc(100% + 12px)",
                            left: "50%",
                            transform: "translateX(-50%)",
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
                    </button> : null}
                    {seriesLabelNode}
                </div>
                {seriesState.tiebreakerPhase === "extended" && extendedRoundDetails && (
                    <ExtendedRoundsOverlay seriesState={seriesState} details={extendedRoundDetails} setsToWin={setsToWin} />
                )}
                <div className={css.turn_slot_floating}>
                        <AnimatePresence mode="wait" initial={false}>
                            {seriesState.tiebreakerPhase === "penalties" && !seriesState.penaltyResolved ? (
                                <motion.div
                                    key={seriesState.penaltyTurn}
                                    initial={{ opacity: 0, rotateX: -90, y: 6 }}
                                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                                    exit={{ opacity: 0, rotateX: 90, y: -6 }}
                                    transition={{ duration: 0.32, ease: "easeInOut" }}
                                    className={css.turn_pill}
                                    style={{
                                        ...pointPillStyle(seriesState.penaltyTurn === "left" ? seriesState.leftTeam : seriesState.rightTeam),
                                        flexDirection: seriesState.penaltyTurn === "left" ? "row" : "row-reverse",
                                        transformPerspective: 500,
                                    }}
                                >
                                    <motion.span
                                        className={css.turn_pill_arrow}
                                        animate={{ x: seriesState.penaltyTurn === "left" ? [0, -3, 0] : [0, 3, 0] }}
                                        transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
                                    >
                                        {seriesState.penaltyTurn === "left" ? <FaCaretLeft /> : <FaCaretRight />}
                                    </motion.span>
                                    <span>
                                        Team {seriesState.penaltyTurn === "left" ? seriesState.leftTeam?.name : seriesState.rightTeam?.name}&apos;s turn
                                    </span>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                </div>
                <div className={css.scoreboard} style={{ backgroundColor: "#fff" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", position: "relative" }}>
                        <AnimatePresence initial={false}>
                            {isSeriesPointWins || isSetPointWins ? (
                                <motion.span
                                    key={isSeriesPointWins ? "series-point" : "set-point"}
                                    initial={{ opacity: 0, y: 8, scale: 0.85 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.85 }}
                                    transition={{ duration: 0.55, ease: "easeInOut" }}
                                    className={css.point_pill}
                                    style={{
                                        ...pointPillStyle(seriesState.leftTeam),
                                        position: "absolute",
                                        bottom: isPlayoffsStyleSeries ? "calc(100% + 8px)" : "calc(100% + 4px)",
                                        left: isPlayoffsStyleSeries ? "0" : "8px",
                                        transformOrigin: "left bottom",
                                        zIndex: 2
                                    }}
                                >
                                    {isSeriesPointWins ? getPointLabel() : "Set point!"}
                                </motion.span>
                            ) : null}
                        </AnimatePresence>
                        {!isPlayoffsStyleSeries ? (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: loserOpacity === "win" ? 0.4 : 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                style={{
                                    display: "inline-block",

                                    "--team-color": seriesState.leftTeam?.color,
                                    backgroundImage: seriesState.leftTeam?.gradient,
                                    backgroundRepeat: "no-repeat",
                                    backgroundSize: "100% 100%",

                                    WebkitBackgroundClip: "text",
                                    backgroundClip: "text",

                                    WebkitTextFillColor: "transparent",
                                    color: "transparent",

                                    transition: "all 500ms ease-in-out",
                                }}
                                className={`${css.team_name_left} ${css.team_name_fancy}`} data-side="left">
                                <span className={css.team_name_prefix}>Team</span>{" "}
                                <span className={css.team_name_main}>{seriesState.leftTeam?.name}</span>
                                {isCheatTargeting(secret?.activeCheat, "left") ? <span className={`${css.cheat_indicator} ${css.cheat_indicator_left}`} aria-hidden="true" /> : null}
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
                                <RoundScore value={roundWins} team={seriesState.leftTeam} highlighted={roundWins === overtimeTarget} />
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
                            ) : (
                                <div className={css.miniSquares}>
                                    {[...Array(displayedMiniSquares)].map((_, i) => {
                                        const isLit = i < (finalRoundMinis ? finalRoundMinis.left : miniWins);

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
                            )}
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
                            {isPlayoffsStyleSeries ? (
                                <motion.span
                                    key={seriesState.leftTeam?.name}
                                    initial={{ x: -36, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -36, opacity: 0 }}
                                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                    style={{
                                        display: "inline-block",

                                        "--team-color": seriesState.leftTeam?.color,
                                    backgroundImage: seriesState.leftTeam?.gradient,
                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "100% 100%",

                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",

                                        WebkitTextFillColor: "transparent",
                                        color: "transparent",

                                        transition: "background 500ms ease-in-out",

                                        margin: "0",
                                        position: "absolute",
                                        right: "110%",
                                        zIndex: -1,
                                        fontSize: "28px",
                                    }}
                                    className={`${css.team_name_left} ${css.team_name_fancy}`} data-side="left">
                                    <span className={css.team_name_prefix}>Team</span>{" "}
                                    <span className={css.team_name_main}>{seriesState.leftTeam?.name}</span>
                                    {isCheatTargeting(secret?.activeCheat, "left") ? <span className={`${css.cheat_indicator} ${css.cheat_indicator_left}`} aria-hidden="true" /> : null}
                                </motion.span>
                            ) : null}
                        </div>
                    </div>
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
                                    marginBottom: isPlayoffsStyleSeries ? "-12px" : "0",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    overflow: "visible",
                                }}
                            >
                                <LeadingIndicator
                                    leftTeam={seriesState.leftTeam}
                                    rightTeam={seriesState.rightTeam}
                                    leftScore={roundWins}
                                    rightScore={roundLosses}
                                    size={28}
                                    width={64}
                                />
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
                                            display: "flex",
                                            justifyContent: "center",
                                            marginTop: isPlayoffsStyleSeries ? "8px" : "0px",
                                        }}
                                    >
                                        {seriesState.tiebreakerPhase === "penalties" ? (
                                            <RoundBadge size={14} style={{ visibility: "hidden" }}>0</RoundBadge>
                                        ) : (
                                            <RoundBadge size={14}>
                                                <CountUp
                                                    key={displayedRound}
                                                    start={Math.max(displayedRound - 1, 0)}
                                                    end={displayedRound}
                                                    duration={1}
                                                />
                                            </RoundBadge>
                                        )}
                                    </motion.span>
                                )
                            }
                        </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            position: "relative",
                        }}
                        >
                        <AnimatePresence initial={false}>
                            {isSeriesPointLosses || isSetPointLosses ? (
                                <motion.span
                                    key={isSeriesPointLosses ? "series-point" : "set-point"}
                                    initial={{ opacity: 0, y: 8, scale: 0.85 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.85 }}
                                    transition={{ duration: 0.55, ease: "easeInOut" }}
                                    className={css.point_pill}
                                    style={{
                                        ...pointPillStyle(seriesState.rightTeam),
                                        position: "absolute",
                                        bottom: isPlayoffsStyleSeries ? "calc(100% + 8px)" : "calc(100% + 4px)",
                                        right: isPlayoffsStyleSeries ? "0" : "8px",
                                        transformOrigin: "right bottom",
                                        zIndex: 2
                                    }}
                                >
                                    {isSeriesPointLosses ? getPointLabel() : "Set point!"}
                                </motion.span>
                            ) : null}
                        </AnimatePresence>
                        {!isPlayoffsStyleSeries ? (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: loserOpacity === "loss" ? 0.4 : 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                style={{
                                    display: "inline-block",

                                    "--team-color": seriesState.rightTeam?.color,
                                    backgroundImage: seriesState.rightTeam?.gradient,
                                    backgroundRepeat: "no-repeat",
                                    backgroundSize: "100% 100%",

                                    WebkitBackgroundClip: "text",
                                    backgroundClip: "text",

                                    WebkitTextFillColor: "transparent",
                                    color: "transparent",

                                    transition: "all 500ms ease-in-out",
                                }}
                                className={`${css.team_name_right} ${css.team_name_fancy}`} data-side="right">
                                <span className={css.team_name_prefix}>Team</span>{" "}
                                <span className={css.team_name_main}>{seriesState.rightTeam?.name}</span>
                                {isCheatTargeting(secret?.activeCheat, "right") ? <span className={`${css.cheat_indicator} ${css.cheat_indicator_right}`} aria-hidden="true" /> : null}
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
                                <RoundScore value={roundLosses} team={seriesState.rightTeam} highlighted={roundLosses === overtimeTarget} />
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
                            ) : (
                                <div className={css.miniSquares} style={{ flexDirection: 'row-reverse' }}>
                                    {[...Array(displayedMiniSquares)].map((_, i) => {
                                        const isLit = i < (finalRoundMinis ? finalRoundMinis.right : miniLosses);

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
                            )}
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
                            {isPlayoffsStyleSeries ? (
                                <motion.span
                                    key={seriesState.rightTeam?.name}
                                    initial={{ x: 36, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 36, opacity: 0 }}
                                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                    style={{
                                        display: "inline-block",

                                        "--team-color": seriesState.rightTeam?.color,
                                    backgroundImage: seriesState.rightTeam?.gradient,
                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "100% 100%",

                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",

                                        WebkitTextFillColor: "transparent",
                                        color: "transparent",

                                        transition: "background 500ms ease-in-out",

                                        margin: "0",
                                        position: "absolute",
                                        left: "110%",
                                        zIndex: -1,
                                        fontSize: "28px",
                                    }}
                                    className={`${css.team_name_right} ${css.team_name_fancy}`} data-side="right">
                                    <span className={css.team_name_prefix}>Team</span>{" "}
                                    <span className={css.team_name_main}>{seriesState.rightTeam?.name}</span>
                                    {isCheatTargeting(secret?.activeCheat, "right") ? <span className={`${css.cheat_indicator} ${css.cheat_indicator_right}`} aria-hidden="true" /> : null}
                                </motion.span>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className={css.game_info_text} style={{ height: "55px", flexShrink: 0, justifyContent: "flex-end", paddingBottom: "2px" }}>
                    <AnimatePresence mode="wait" initial={false}>
                        {!banner && isOvertime && seriesState.tiebreakerPhase === "idle" ? (
                            <motion.div
                                key={`ot-${Math.max(overtimeBlock, 1)}`}
                                className={css.series_info_badge}
                                initial={{ opacity: 0, y: -10, scale: 0.85 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.85 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            >
                                <OvertimeBadge label={getOvertimeLabel(overtimeBlock === 0 ? 1 : overtimeBlock)} level={overtimeBlock === 0 ? 1 : overtimeBlock} firstTo={overtimeToWin} size={18} />
                            </motion.div>
                        ) : seriesState.tiebreakerPhase === "penalties" && !banner ? (
                            <motion.div
                                key={inSuddenDeath ? "pens-sudden" : "pens"}
                                className={css.series_info_badge}
                                initial={{ opacity: 0, y: -10, scale: 0.85 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.85 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            >
                                <PenaltyBadge attempt={currentAttempt} suddenDeath={inSuddenDeath} size={18} />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>

                <div className={css.seriesGambleMessage}>
                    {banner ? (
                        <div className={css.series_banner_slot}>
                            <SeriesBanner
                                tie={!!banner.tie}
                                team={playerWonSets >= playerLostSets ? seriesState.leftTeam : seriesState.rightTeam}
                                celebrate={!bannerAtMountRef.current}
                            />
                        </div>
                    ) : null}
                    {!banner &&
                        seriesState.lastMultiplierLeft != null &&
                        seriesState.lastMultiplierRight != null && (() => {
                            const isPens = seriesState.tiebreakerPhase === "penalties";
                            const tie = seriesState.lastMultiplierLeft === seriesState.lastMultiplierRight;
                            const attackerSucceeded = seriesState.lastPenaltyAttacker === "left"
                                ? seriesState.lastMultiplierLeft > seriesState.lastMultiplierRight
                                : seriesState.lastMultiplierRight > seriesState.lastMultiplierLeft;
                            return (
                                <div className={css.roll_duel}>
                                    {["left", "right"].map((side) => {
                                        const team = side === "left" ? seriesState.leftTeam : seriesState.rightTeam;
                                        const own = side === "left" ? seriesState.lastMultiplierLeft : seriesState.lastMultiplierRight;
                                        const other = side === "left" ? seriesState.lastMultiplierRight : seriesState.lastMultiplierLeft;
                                        const isAttacker = seriesState.lastPenaltyAttacker === side;
                                        const good = tie ? null : isPens ? (isAttacker ? attackerSucceeded : !attackerSucceeded) : own > other;
                                        const caption = tie
                                            ? isPens ? "Retake the attempt" : "No one gets it"
                                            : isPens
                                                ? getPenaltyMessage(isAttacker, attackerSucceeded).replace(/!$/, "")
                                                : own > other ? "Gets this mini-round" : "Doesn’t get it";
                                        return (
                                            <div
                                                key={side}
                                                className={`${css.roll_side} ${good === true ? css.roll_side_win : good === false ? css.roll_side_loss : css.roll_side_tie}`}
                                                style={{ "--roll-color": team?.color ?? "#2e2f42" }}
                                            >
                                                <span className={css.roll_value}>{own.toFixed(2)}</span>
                                                <span className={css.roll_caption}>
                                                    <span className={css.roll_team}>{team?.name}</span>
                                                    {caption.charAt(0).toLowerCase() + caption.slice(1)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <span className={css.roll_divider} aria-hidden="true" />
                                </div>
                            );
                        })()}
                </div>

                {!banner && (
                    <div className={css.series_gamble_wrapper}>
                        <button
                            className={`${css.gamble_button} ${isButtonLocked || banner ? css.locked : ""}`}
                            disabled={isButtonLocked || !!banner}
                            data-gamble-button
                            onClick={
                                seriesState.tiebreakerPhase === "penalties"
                                    ? handlePenaltyShot
                                    : handleSeriesGamble
                            }
                        >
                            Gamble
                            {gambleKey && showGambleKey ? (
                                <kbd className={css.gamble_key_hint}>{shortKeyCode(gambleKey)}</kbd>
                            ) : null}
                        </button>
                        {simulation?.enabled && (simulation.running || (simulation.inSeries && seriesState.tiebreakerPhase === "idle")) ? (
                            <SimulateAttachment
                                variant="series"
                                canSimulate={!isButtonLocked}
                                running={simulation.running}
                                onSimulate={simulation.start}
                                onStop={simulation.stop}
                            />
                        ) : null}
                    </div>
                )}
            </div>
            <GameControlModals
                controls={{ isRestartModalOpen, confirmRestart, isTerminateModalOpen, confirmTerminate, setIsRestartModalOpen, setIsTerminateModalOpen }}
            />
        </>
    );
}
