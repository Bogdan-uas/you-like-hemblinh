import React, { useState } from "react";
import CountUp from "react-countup";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { MdOutlineKeyboardDoubleArrowUp, MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import { FaCircle, FaCheck, FaXmark, FaCircleInfo, FaCircleCheck } from "react-icons/fa6";
import { ReactFitty } from "react-fitty";
import { PenaltyCircles } from "../components/PenaltyCircles.jsx";
import { SetBreakdownOverlay } from "../components/SetBreakdownOverlay.jsx";
import { MatchStatsOverlay } from "../components/StatsPanels.jsx";
import { BestOfBadge } from "../components/BestOfBadge.jsx";
import { centerOverflowX } from "../../../rubber.js";
import { UnbeatenStreakFire, LostStreakFire } from "../components/StreakBadges.jsx";
import { TeamCircle } from "../components/SwissMatch.jsx";
import { PemSeriesTrophy, GplTrophy, PbsTrophy, BountyGem } from "../components/Trophies.jsx";
import { GPL_SWISS_FORMAT } from "../logic/swiss.js";
import { PENALTY_DISPLAY_CIRCLES } from "../logic/gameConstants.js";
import { isPemPlayoffsKind } from "../logic/pemSeries.jsx";
import { EMPTY_TEAM_PLACINGS, buildPlacingItems } from "../logic/placings.jsx";
import { pickPredictionText } from "../logic/predictions.js";
import { getRsPrediction } from "../logic/ratings.js";
import { getMatchWinPrediction, getFinishedMatchStatActivation, getPreMatchStatActivation, buildStatRowNotes } from "../logic/statActivation.js";
import { toDisplayedPercent } from "../logic/statEffects.js";
import { readUnbeatenStreak, STREAK_FIRE_MODAL_SIZE } from "../logic/statsUi.js";
import { formatOrdinal } from "../logic/teamData.js";
import { PEM_BIG_TYPE_ID, PEM_SMALL_TYPE_ID } from "../logic/tournamentTypes.jsx";

export function MatchModal({ modal, teams, actions, labels }) {
    const {
        modalLeftTeam,
        modalRightTeam,
        modalRef,
        modalScale,
        isPlayedModal,
        didUserWin,
        playedSets,
        isBo1Modal,
        modalContext,
        modalStageSmallLabel,
        modalTitle,
        showModalMatchNumber,
        modalMatchNumber,
        modalBestOf,
        pickemLabelText,
        pickemLabelStyle,
        breakdownSetIndex,
        isEliminationModal,
        isPemBigModal,
        modalPotById,
        modalPbs,
        hasChosen,
        hoveredTeamId,
        setHoveredTeamId,
        getPickOrientedModalView,
        currentModalMatch,
        getMatchStakeText,
        setBreakdownSetIndex,
        modalStatsPanels,
        toggleModalStatsPanel,
        breakdownPointLabel,
    } = modal;
    const { placementColors, rankById, teamRatings, teamStats, allTeams, teamPlacings } = teams;
    const { closeMatchModal, handleChooseLeft, handleChooseRight, handleStartMatch } = actions;
    const { getOvertimeShortLabel } = labels;

    const placementColorLeft = placementColors[rankById[modalLeftTeam?.id]] || "#ffffff";
    const placementColorRight = placementColors[rankById[modalRightTeam?.id]] || "#ffffff";

    const withPotBadge = (team, circle) => {
        const pot = modalPotById?.[team?.id];
        if (!pot) return circle;
        return (
            <span style={{ position: "relative", display: "inline-block", transition: "none" }}>
                {circle}
                <span className={css.modal_team_pot} title={`Pot ${pot} of the League Phase`}>
                    Pot {pot}
                </span>
            </span>
        );
    };

    const pbsBonusOf = (teamId) =>
        modalPbs?.meta?.bountyBonus?.teamId === teamId ? modalPbs.meta.bountyBonus.points : 0;

    const withPbsTags = (team, circle, finished = false) => {
        if (!modalPbs || !team) return circle;
        const before = finished ? modalPbs.meta?.before?.[team.id] : modalPbs.status?.[team.id];
        if (!before) return circle;
        const after = finished ? modalPbs.meta?.after?.[team.id] ?? before : before;
        const seedChanged = after.seed !== before.seed;
        const bountyDiff = (after.bounty ?? 0) - (before.bounty ?? 0);

        return (
            <span style={{ position: "relative", display: "inline-block", transition: "none" }}>
                {circle}
                <span className={`${css.pbs_team_tags} ${css.pbs_modal_tags} ${finished ? "" : `${css.pbs_team_tags_small} ${css.pbs_modal_tags_pre}`}`}>
                    <span className={css.pbs_seed_tag} title={seedChanged ? `Seed #${before.seed} → #${after.seed}` : `Seed #${before.seed}`}>
                        {seedChanged ? (
                            <span className={css.pbs_tag_change}>
                                #{before.seed} → <span className={after.seed < before.seed ? css.pbs_tag_gain : css.pbs_tag_loss}>#{after.seed}</span>
                            </span>
                        ) : <>#{before.seed}</>}
                    </span>
                    <span className={css.pbs_bounty_tag} title={`${after.bounty ?? 0} Bounty Gems`}>
                        <BountyGem size={finished ? 12 : 10} />
                        {bountyDiff !== 0 ? (
                            <span className={css.pbs_tag_change}>
                                {before.bounty ?? 0} → <span className={bountyDiff > 0 ? css.pbs_tag_gain : css.pbs_tag_loss}>{after.bounty ?? 0}</span>
                            </span>
                        ) : <>{before.bounty ?? 0}</>}
                    </span>
                </span>
            </span>
        );
    };

    const rankLeftSticker = () => {
        return (
            <span style={{ color: placementColorLeft }}>
                {formatOrdinal(rankById[modalLeftTeam?.id] || 64)}
            </span>
        );
    };

    const rankRightSticker = () => {
        return (
            <span style={{ color: placementColorRight }}>
                {formatOrdinal(rankById[modalRightTeam?.id] || 64)}
            </span>
        );
    };

    const modalIndicatorTop = {
        1: "-5%",
        2: "-3.6%",
        3: "-3.3%",
        4: "-2.6%",
        5: "-2.4%",
        6: "-2.1%",
        7: "-1.8%",
        8: "-1.7%",
        9: "-1.45%",
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            ref={centerOverflowX}
            className={css.match_modal_overlay}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    closeMatchModal();
                }
            }}
        >
            <div
                ref={modalRef}
                style={{
                    position: "relative",
                    transform: `scale(${modalScale})`,
                    transformOrigin: "center center",
                    transition: "none"
                }}
            >
                {isPlayedModal && (
                    didUserWin ? (
                        <div
                            className={css.modalSuccessPickemIndicator}
                            style={{
                                top: modalIndicatorTop[playedSets] ?? "-2.5%",
                                left: playedSets === 9 ? "-3%" : "-3.1%",
                            }}
                        >
                            <FaCircle size={32} color="#37b737" />
                            <FaCheck size={20} color="#ffffff" />
                        </div>
                    ) : (
                        <div
                            className={css.modalSuccessPickemIndicator}
                            style={{
                                top: modalIndicatorTop[playedSets] ?? "-2.5%",
                                left: playedSets === 9 ? "-3%" : "-3.1%",
                            }}
                        >
                            <FaCircle size={32} color="#be3939" />
                            <FaXmark size={20} color="#fff" />
                        </div>
                    )
                )}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`
                                        ${css.match_modal}
                                        ${isPlayedModal
                            ? didUserWin
                                ? (isBo1Modal ? css.match_win_bo1 : css.match_win_modal)
                                : (isBo1Modal ? css.match_loss_bo1 : css.match_loss_modal)
                            : ""
                        }
                            `}
                    onClick={(e) => e.stopPropagation()}
                    style={
                        isPlayedModal
                            ? didUserWin
                                ? {
                                    border: "2px solid #006a32",
                                    overflow: "hidden",
                                }
                                : {
                                    border: "2px solid rgb(188, 108, 108)",
                                    overflow: "hidden",
                                }
                            : {
                                border: "2px solid #999",
                            }
                    }
                >
                    <div
                        style={{ paddingTop: '12px', paddingLeft: '20px', paddingRight: '20px', borderTopRightRadius: '12px', borderTopLeftRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div className={css.match_modal_header}>
                            <span className={css.match_modal_title} style={{
                                fontSize: '16px',
                                marginBottom: '-8px',
                                color: isPlayedModal
                                    ? didUserWin
                                        ? '#fff'
                                        : '#fff'
                                    : "",
                            }}>
                                {modalContext.type !== "playoffs" ? modalStageSmallLabel : null}
                            </span>
                            <h3
                                style={{
                                    color: isPlayedModal
                                        ? didUserWin
                                            ? '#fff'
                                            : '#fff'
                                        : "",
                                    margin: '0'
                                }}
                                className={css.match_modal_title}>
                                {modalTitle}
                                {showModalMatchNumber ? (
                                    <div
                                        style={{
                                            marginLeft: "2px",
                                            marginTop: "-2px",
                                            padding: "4px 8px",
                                            color: isPlayedModal ? "#fff" : "",
                                            backgroundColor: isPlayedModal
                                                ? didUserWin
                                                    ? "#2e7d32"
                                                    : "#7d2e2e"
                                                : "",
                                        }}
                                        className={css.points}
                                    >
                                        #{modalMatchNumber}
                                    </div>
                                ) : null}
                            </h3>
                            <BestOfBadge bestOf={modalBestOf} size={16} onColor={isPlayedModal} style={{ marginTop: -2, marginBottom: 2 }} />

                            {isPlayedModal && pickemLabelText && (
                                <span
                                    className={css.match_modal_pickem}
                                    style={pickemLabelStyle}
                                >
                                    {pickemLabelText}
                                </span>
                            )}
                        </div>
                    </div>

                    {!isPlayedModal && !modalContext.readOnly && (() => {
                        const leftRating = teamRatings?.[modalLeftTeam?.id] ?? 0;
                        const rightRating = teamRatings?.[modalRightTeam?.id] ?? 0;

                        const prediction = getMatchWinPrediction({
                            leftTeam: modalLeftTeam,
                            rightTeam: modalRightTeam,
                            leftStats: teamStats?.[modalLeftTeam?.id],
                            rightStats: teamStats?.[modalRightTeam?.id],
                            ratings: teamRatings,
                            teams: allTeams,
                            matchContext: modalContext,
                            bestOf: modalBestOf,
                        });

                        const leftPct = toDisplayedPercent(prediction.leftWinProbability);
                        const rightPct = Math.round((100 - leftPct) * 10) / 10;

                        const favoriteIsLeft = leftPct > rightPct;
                        const favoritePct = Math.max(leftPct, rightPct);
                        const diff = Math.abs(leftPct - rightPct);

                        const favoriteTeam = favoriteIsLeft ? modalLeftTeam?.name : modalRightTeam?.name;
                        const underdogTeam = favoriteIsLeft ? modalRightTeam?.name : modalLeftTeam?.name;

                        const predictionLabel = pickPredictionText({
                            diff,
                            favorite: favoriteTeam,
                            underdog: underdogTeam,
                            seed: `${modalContext?.matchId ?? ""}|${modalLeftTeam?.id}|${modalRightTeam?.id}`,
                        });

                        const offsetStrength = Math.min(
                            35,
                            ((favoritePct - 50) / 50) * 35
                        );

                        let predictionPositionPct = favoriteIsLeft
                            ? 50 - offsetStrength
                            : 50 + offsetStrength;

                        const padding = predictionLabel.length > 25 ? 29 : 26;

                        predictionPositionPct = Math.max(padding, Math.min(100 - padding, predictionPositionPct));

                        const predictionPosition = `${predictionPositionPct}%`;

                        const blend = 10;

                        const start = Math.max(0, leftPct - blend);
                        const end = Math.min(100, leftPct + blend);

                        const barStyle = {
                            background: `linear-gradient(
                                        90deg,
                                        ${modalLeftTeam?.color} 0%,
                                        ${modalLeftTeam?.color} ${start}%,
                                        ${modalRightTeam?.color} ${end}%,
                                        ${modalRightTeam?.color} 100%
                                    )`
                        };

                        const leftStats = teamPlacings?.[modalLeftTeam?.id] ?? EMPTY_TEAM_PLACINGS;
                        const rightStats = teamPlacings?.[modalRightTeam?.id] ?? EMPTY_TEAM_PLACINGS;

                        const leftStreak = readUnbeatenStreak(teamStats?.[modalLeftTeam?.id]);
                        const rightStreak = readUnbeatenStreak(teamStats?.[modalRightTeam?.id]);

                        const renderStreakFire = (side) => {
                            const value = side === "left" ? leftStreak : rightStreak;
                            if (!(value > 0)) return null;

                            return (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        zIndex: 2,
                                        pointerEvents: "none",
                                        ...(side === "left" ? { right: "75%" } : { left: "75%" }),
                                    }}
                                >
                                    <UnbeatenStreakFire value={value} size={STREAK_FIRE_MODAL_SIZE} />
                                </div>
                            );
                        };

                        const renderStats = (stats) => {
                            const items = buildPlacingItems(stats, <FaTrophy />);

                            if (items.length === 0) return null;

                            return (
                                <div
                                    className={css.team_stats_badge}
                                    style={{
                                        position: "absolute",
                                        top: "25%",
                                        right: stats === leftStats ? "85%" : "auto",
                                        left: stats === rightStats ? "84%" : "auto",
                                    }}
                                >
                                    {items.map((i) => (
                                        <span key={i.key} className={css.stat_item} title={i.title ?? undefined}>
                                            {i.icon}: {i.value}
                                        </span>
                                    ))}
                                </div>
                            );
                        };

                        const boLabel = `BO${modalBestOf}`;

                        let stageLabel = "Start Match";

                        if (isEliminationModal) {
                            stageLabel = `Start this ${boLabel} ${modalTitle}`;
                        } else if (modalContext?.type === "cstGroup" || modalContext?.type === "gccLeague") {
                            stageLabel = `Start this ${boLabel} ${modalTitle} Match`;
                        } else if (modalContext?.type === "swiss") {
                            const net = modalContext?.net;

                            const regularMatches = ["0:0", "1:0", "0:1", "1:1"];

                            const progressionMatches = ["2:0", "2:1"];
                            const eliminationMatches = ["0:2", "1:2"];
                            const deciderMatches = ["2:2"];

                            if (regularMatches.includes(net)) {
                                stageLabel = `Start this ${net} Match`;
                            } else if (progressionMatches.includes(net)) {
                                stageLabel = `Start this ${net} Progression Match`;
                            } else if (eliminationMatches.includes(net)) {
                                stageLabel = `Start this ${net} Elimination Match`;
                            } else if (deciderMatches.includes(net)) {
                                stageLabel = `Start this ${net} Deciding Match`;
                            }
                        }

                        const rsPrediction = getRsPrediction({
                            ratings: teamRatings,
                            teams: allTeams,

                            leftTeam: modalLeftTeam,
                            rightTeam: modalRightTeam,

                            phase: modalContext?.type === "swiss"
                                ? (modalContext?.format === GPL_SWISS_FORMAT ? "gplSwiss" : "swiss")
                                : modalContext?.type === "qualifier"
                                    ? "qualifier"
                                    : modalContext?.type === "pemGroup"
                                        ? (isPemBigModal ? "pemBigGroup" : "pemGroup")
                                        : modalContext?.type === "ecl"
                                            ? "ecl"
                                            : modalContext?.type === "pemStage1"
                                                ? "pemStage1"
                                                : modalContext?.type === "cstGroup"
                                                    ? "cstGroup"
                                                    : modalContext?.type === "gccLeague"
                                                        ? "gccLeague"
                                                        : modalContext?.kind === "cst"
                                                            ? "cstPlayoffs"
                                                            : modalContext?.kind === "gcc"
                                                                ? "gccPlayoffs"
                                                                : modalContext?.kind === "gpl"
                                                                    ? "gplPlayoffs"
                                                                    : modalContext?.kind === "pbs"
                                                                        ? "pbsPlayoffs"
                                                                        : modalContext?.kind === "pemBig"
                                                                            ? "pemBigPlayoffs"
                                                                            : modalContext?.kind === "pem"
                                                                                ? "pemPlayoffs"
                                                                                : "playoffs",

                            swissStageKey:
                                modalContext?.type === "swiss"
                                    ? modalContext?.stageKey ?? modalContext?.swissStageKey
                                    : null,

                            swissNet:
                                modalContext?.type === "swiss"
                                    ? modalContext?.net
                                    : null,

                            playoffsStage: isEliminationModal ? modalContext?.stage : null,

                            bestOf: modalBestOf,
                            loserSetsWon: 0,

                            playedAtMs: Date.now(),
                        });

                        const renderRsPrediction = (prediction, isWin, side = "left") => {
                            if (!prediction) return null;

                            const {
                                points,
                                beforeRank,
                                afterRank,
                            } = prediction;

                            const deltaPlaces =
                                beforeRank !== null && afterRank !== null
                                    ? beforeRank - afterRank
                                    : 0;

                            const placementColor =
                                placementColors[afterRank] || "#ffffff";

                            return (
                                <span
                                    className={css.finished_modal_team_placing}
                                    style={{
                                        position: "absolute",
                                        top:
                                            side === "left"
                                                ? (isWin ? "0%" : "86%")
                                                : (isWin ? "86%" : "0%"),
                                        right: side === "left" ? "0%" : "auto",
                                        left: side === "right" ? "24%" : "auto",
                                        zIndex: 3,
                                        fontSize: "10px",
                                        width: "70px",
                                        minWidth: "max-content",
                                        color: "#2e2f42"
                                    }}
                                >
                                    <span style={{ position: "relative" }}>
                                        <span
                                            style={{
                                                color: isWin
                                                    ? "#2e7d32"
                                                    : "#be3939",
                                                fontWeight: 900,
                                                marginRight: "5px",
                                                position: "absolute",
                                                right: isWin ? "110%" : !isWin ? "117%" : "auto",
                                            }}
                                        >
                                            {isWin ? "W" : "L"}
                                        </span>

                                        {deltaPlaces !== 0 ? (
                                            <span
                                                style={{
                                                    color:
                                                        deltaPlaces > 0
                                                            ? "#2e7d32"
                                                            : "red",
                                                    fontWeight: 900,
                                                    marginRight: "0px",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "2px",
                                                    width: 21,
                                                }}
                                            >
                                                {deltaPlaces > 0 ? (
                                                    <>
                                                        <span style={{ marginRight: "-3px" }}>
                                                            {deltaPlaces}
                                                        </span>
                                                        <MdOutlineKeyboardDoubleArrowUp />
                                                    </>
                                                ) : (
                                                    <>
                                                        <span style={{ marginRight: "-3px" }}>
                                                            {Math.abs(deltaPlaces)}
                                                        </span>
                                                        <MdOutlineKeyboardDoubleArrowDown />
                                                    </>
                                                )}
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    color:
                                                        deltaPlaces > 0
                                                            ? "#2e7d32"
                                                            : "red",
                                                    fontWeight: 900,
                                                    marginRight: "-2px",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "2px",
                                                    userSelect: "none",
                                                    width: 21
                                                }}
                                            >
                                                {deltaPlaces > 0 ? (
                                                    <>
                                                        <span style={{ marginRight: "-4px" }}>
                                                            &nbsp;
                                                        </span>
                                                        &nbsp;
                                                    </>
                                                ) : (
                                                    <>
                                                        <span style={{ marginRight: "-4px" }}>
                                                            &nbsp;
                                                        </span>
                                                        &nbsp;
                                                    </>
                                                )}
                                            </span>
                                        )}

                                        <span
                                            style={{
                                                color: placementColor,
                                                textShadow: "0 0 4px #000"
                                            }}
                                        >
                                            {formatOrdinal(afterRank)}
                                        </span>

                                        <span
                                            style={{
                                                color:
                                                    points > 0
                                                        ? "#2e7d32"
                                                        : points < 0
                                                            ? "red"
                                                            : "#fff",
                                                fontWeight: 900,
                                                marginLeft: "4px"
                                            }}
                                        >
                                            {points > 0
                                                ? `+${points}p`
                                                : `${points}p`}
                                        </span>
                                    </span>
                                </span>
                            );
                        };

                        return (
                            <>
                                <div className={css.match_modal_row}>
                                    {renderStats(leftStats)}
                                    {renderStreakFire("left")}
                                    <div
                                        onMouseEnter={() => setHoveredTeamId(modalLeftTeam?.id)}
                                        onMouseLeave={() => setHoveredTeamId(null)}
                                        style={{ cursor: hasChosen ? "default" : "pointer", marginLeft: '12px' }}
                                        onClick={handleChooseLeft}
                                        className={css.modal_team_btn}
                                    >
                                        {rsPrediction && (
                                            <>
                                                {renderRsPrediction(rsPrediction.left.win, true, "left")}
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            style={{
                                                all: "unset",
                                                borderRadius: "50%"
                                            }}
                                        >
                                            {withPbsTags(modalLeftTeam, withPotBadge(modalLeftTeam, (
                                                <TeamCircle
                                                    team={modalLeftTeam}
                                                    showRating
                                                    ratingValue={leftRating}
                                                    specialStyle={{
                                                        width: "64px",
                                                        height: "64px",
                                                        border:
                                                            hasChosen
                                                                ? "3px solid #0d6aff"
                                                                : "3px solid #999",

                                                        boxShadow:
                                                            hasChosen
                                                                ? "0 0 8px 2px #0d6aff"
                                                                : hoveredTeamId === modalLeftTeam?.id
                                                                    ? "0 0 4px 1px #0d6aff"
                                                                    : "none",
                                                        zIndex: 0
                                                    }}
                                                />
                                            )))}
                                            <span
                                                style={{
                                                    color: "#fff",
                                                    textShadow:
                                                        hasChosen
                                                            ? "0 0 8px #0d6aff"
                                                            : hoveredTeamId === modalLeftTeam?.id
                                                                ? "0 0 4px #0d6aff"
                                                                : "0 0 4px #000",
                                                    top: '12%'
                                                }}
                                                className={css.finished_modal_team_placing}
                                            >
                                                {rankLeftSticker()}
                                            </span>

                                            <span
                                                style={{
                                                    color: "#fff",
                                                    textShadow:
                                                        hasChosen
                                                            ? "0 0 8px #0d6aff"
                                                            : hoveredTeamId === modalLeftTeam?.id
                                                                ? "0 0 4px #0d6aff"
                                                                : "0 0 4px #000",
                                                }}
                                                className={css.modal_team_label}
                                            >
                                                {modalLeftTeam?.name}
                                            </span>
                                        </button>
                                        {rsPrediction && (
                                            <>
                                                {renderRsPrediction(rsPrediction.left.loss, false, "left")}
                                            </>
                                        )}
                                    </div>

                                    <p
                                        className={css.vs_text}
                                        style={{
                                            position: "static",
                                            backgroundColor: "#fff",
                                            fontSize: "24px",
                                            textShadow: `
                                                            1px 0 #d8d8d8,
                                                            -1px 0 #d8d8d8,
                                                            0 1px #d8d8d8,
                                                            0 -1px #d8d8d8,
                                                            1px 1px #d8d8d8,
                                                            1px -1px #d8d8d8,
                                                            -1px 1px #d8d8d8,
                                                            -1px -1px #d8d8d8,
                                                            1.5px 0 #5a5a5a,
                                                            -1.5px 0 #5a5a5a,
                                                            0 1.5px #5a5a5a,
                                                            0 -1.5px #5a5a5a,
                                                            1.5px 1.5px #5a5a5a,
                                                            1.5px -1.5px #5a5a5a,
                                                            -1.5px 1.5px #5a5a5a,
                                                            -1.5px -1.5px #5a5a5a,
                                                            1.5px 0 #5a5a5a,
                                                            -1.5px 0 #5a5a5a
                                                        `,
                                        }}
                                    >
                                        VS
                                    </p>

                                    <div
                                        onMouseEnter={() => setHoveredTeamId(modalRightTeam?.id)}
                                        onMouseLeave={() => setHoveredTeamId(null)}
                                        onClick={handleChooseRight}
                                        className={css.modal_team_btn}
                                        style={{ marginRight: '12px' }}
                                    >
                                        {rsPrediction && (
                                            <>
                                                {renderRsPrediction(rsPrediction.right.win, true, "right")}
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            style={{
                                                all: "unset",
                                                borderRadius: "50%"
                                            }}
                                        >
                                            {withPbsTags(modalRightTeam, withPotBadge(modalRightTeam, (
                                                <TeamCircle
                                                    team={modalRightTeam}
                                                    showRating
                                                    ratingValue={rightRating}
                                                    specialStyle={{
                                                        width: "64px",
                                                        height: "64px",
                                                        border: "3px solid #999",

                                                        boxShadow:
                                                            hoveredTeamId === modalRightTeam?.id
                                                                ? "0 0 4px 1px #0d6aff"
                                                                : "none",
                                                        zIndex: 0
                                                    }}
                                                />
                                            )))}

                                            <span
                                                className={css.finished_modal_team_placing}
                                                style={{
                                                    color: "#ffffff",
                                                    textShadow:
                                                        hoveredTeamId === modalRightTeam?.id
                                                            ? "0 0 4px #0d6aff"
                                                            : "0 0 4px #000",
                                                    top: '12%',
                                                }}
                                            >
                                                {rankRightSticker()}
                                            </span>

                                            <span
                                                className={css.modal_team_label}
                                                style={{
                                                    color: "#ffffff",
                                                    textShadow:
                                                        hoveredTeamId === modalRightTeam?.id
                                                            ? "0 0 4px #0d6aff"
                                                            : "0 0 4px #000",
                                                }}
                                            >
                                                {modalRightTeam?.name}
                                            </span>
                                        </button>
                                        {rsPrediction && (
                                            <>
                                                {renderRsPrediction(rsPrediction.right.loss, false, "right")}
                                            </>
                                        )}
                                    </div>
                                    {renderStats(rightStats)}
                                    {renderStreakFire("right")}
                                </div>

                                <div className={css.match_prediction_wrapper}>
                                    <span className={css.match_prediction_pct}>
                                        <CountUp
                                            key={leftPct}
                                            start={0}
                                            end={leftPct}
                                            decimals={Number.isInteger(leftPct) ? 0 : 1}
                                            duration={1.2}
                                        />
                                        %
                                    </span>

                                    <div
                                        className={css.match_prediction_bar}
                                        style={barStyle}
                                    />

                                    <span className={css.match_prediction_pct}>
                                        <CountUp
                                            key={rightPct}
                                            start={0}
                                            end={rightPct}
                                            decimals={Number.isInteger(rightPct) ? 0 : 1}
                                            duration={1.2}
                                        />
                                        %
                                    </span>
                                </div>
                                <ReactFitty
                                    maxSize={16}
                                    minSize={12}
                                    className={css.prediction_label}
                                    style={{
                                        left: predictionPosition,
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    {predictionLabel}
                                </ReactFitty>
                                <div style={{ textAlign: "center" }}>
                                    <button
                                        className={`${css.gamble_button} ${!hasChosen ? css.locked : ""}`}
                                        disabled={!hasChosen}
                                        onClick={handleStartMatch}
                                    >
                                        {stageLabel}
                                    </button>
                                </div>
                            </>
                        );
                    })()}

                    {isPlayedModal &&
                        (() => {
                            const {
                                leftTeam: modalPlayedLeft,
                                rightTeam: modalPlayedRight,
                                displayLeft: modalDisplayScoreLeft,
                                displayRight: modalDisplayScoreRight,
                                winnerIsLeft,
                                winnerIsRight,
                                leftIsLoser,
                                rightIsLoser,
                                leftIsPick,
                                rightIsPick,
                            } = getPickOrientedModalView(
                                currentModalMatch,
                                isBo1Modal
                            );

                            const {
                                leftText: leftStakeText,
                                rightText: rightStakeText,
                            } = getMatchStakeText({
                                modalContext,
                                winnerIsLeft,
                                winnerIsRight
                            });

                            const isTieResult = !!currentModalMatch?.isTie;
                            const leftPickFailed = leftIsLoser || isTieResult;
                            const rightPickFailed = rightIsLoser || isTieResult;

                            const stage = modalContext?.stage;
                            const isGrandFinal = stage === "gf";
                            const isThirdPlace = stage === "thirdPlace";

                            const getPlacementBadge = (isWinner, isLoser) => {
                                if (isGrandFinal) {
                                    if (isWinner && (modalContext?.kind === "cst" || modalContext?.kind === "gcc" || modalContext?.type === "ecl")) {
                                        return (
                                            <span style={{ marginLeft: '-36px', marginRight: '4px', color: '#2e2f42' }}>
                                                🥇+
                                            </span>
                                        );
                                    }
                                    if (isWinner && modalContext?.kind === "gpl") {
                                        return (
                                            <span style={{ marginLeft: '-28px', marginRight: '4px', color: '#2e2f42' }}>
                                                <GplTrophy />+
                                            </span>
                                        );
                                    }
                                    if (isWinner && modalContext?.kind === "pbs") {
                                        return (
                                            <span style={{ marginLeft: '-24px', marginRight: '4px', color: '#2e2f42' }}>
                                                <PbsTrophy />+
                                            </span>
                                        );
                                    }
                                    if (isWinner && isPemPlayoffsKind(modalContext?.kind)) {
                                        return (
                                            <span style={{ marginLeft: '-28px', marginRight: '4px', color: '#2e2f42' }}>
                                                <PemSeriesTrophy type={modalContext.kind === "pemBig" ? PEM_BIG_TYPE_ID : PEM_SMALL_TYPE_ID} />+
                                            </span>
                                        );
                                    }
                                    if (isWinner) {
                                        return (
                                            <span style={{ marginLeft: '-28px', marginRight: '4px', color: '#2e2f42' }}>
                                                <FaTrophy style={{ color: '#2e2f42' }} />+
                                            </span>
                                        );
                                    }
                                    if (isLoser) {
                                        return (
                                            <span style={{ marginLeft: '-36px', marginRight: '4px', color: '#2e2f42' }}>
                                                🥈+
                                            </span>
                                        );
                                    }
                                }

                                if ((isThirdPlace && isWinner) || (modalContext?.type === "ecl" && stage === "cf" && isLoser)) {
                                    return (
                                        <span style={{ marginLeft: '-36px', marginRight: '4px', color: '#2e2f42' }}>
                                            🥉+
                                        </span>
                                    );
                                }

                                return null;
                            };

                            const displayedLeftStats = teamPlacings?.[modalPlayedLeft?.id] ?? EMPTY_TEAM_PLACINGS;
                            const displayedRightStats = teamPlacings?.[modalPlayedRight?.id] ?? EMPTY_TEAM_PLACINGS;

                            const leftStreakAfter = readUnbeatenStreak(
                                currentModalMatch?.statsMeta?.after?.[modalPlayedLeft?.id]
                            );
                            const rightStreakAfter = readUnbeatenStreak(
                                currentModalMatch?.statsMeta?.after?.[modalPlayedRight?.id]
                            );
                            const leftStreakBefore = readUnbeatenStreak(
                                currentModalMatch?.statsMeta?.before?.[modalPlayedLeft?.id]
                            );
                            const rightStreakBefore = readUnbeatenStreak(
                                currentModalMatch?.statsMeta?.before?.[modalPlayedRight?.id]
                            );

                            const renderStreakFire = (side) => {
                                const value = side === "left" ? leftStreakAfter : rightStreakAfter;
                                const before = side === "left" ? leftStreakBefore : rightStreakBefore;
                                const lost = !(value > 0) && before > 0;
                                if (!(value > 0) && !lost) return null;

                                return (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            zIndex: 2,
                                            pointerEvents: "none",
                                            ...(side === "left" ? { right: "77%" } : { left: "77%" }),
                                        }}
                                    >
                                        {lost ? (
                                            <LostStreakFire value={before} size={STREAK_FIRE_MODAL_SIZE} />
                                        ) : (
                                            <UnbeatenStreakFire value={value} size={STREAK_FIRE_MODAL_SIZE} />
                                        )}
                                    </div>
                                );
                            };

                            const renderStats = (stats, side) => {
                                const items = buildPlacingItems(stats, <FaTrophy />);

                                if (!items.length) return null;

                                return (
                                    <div
                                        className={css.team_stats_badge}
                                        style={{
                                            position: "absolute",
                                            top: "20%",
                                            zIndex: 2,
                                            transition: "opacity 0.3s ease",
                                            ...(side === "left"
                                                ? { right: "88.5%" }
                                                : { left: "88.5%" }),
                                        }}
                                    >
                                        {items.map((i) => (
                                            <span key={i.key} className={css.stat_item} title={i.title ?? undefined}>
                                                {i.icon}: {i.value}
                                            </span>
                                        ))}
                                    </div>
                                );
                            };

                            return (
                                <>
                                    <div className={css.finishedMatchReview}>
                                        <div
                                            style={{ marginBottom: isBo1Modal ? 0 : "10px" }}
                                            className={css.match_modal_row}
                                        >
                                            {renderStats(displayedLeftStats, "left")}
                                            {renderStreakFire("left")}
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "50%",
                                                    right: "84.5%",
                                                    width: 260,
                                                    height: 120,
                                                    borderRadius: "50%",
                                                    transform: "translate(50%, -50%)",
                                                    background: winnerIsLeft ? "#91ffc1" : "#ff9191",
                                                    boxShadow: winnerIsLeft ? "0 0 32px 8px #91ffc1" : "0 0 32px 8px #ff9191",
                                                    filter: "blur(42px)",
                                                    opacity: isTieResult ? 0 : 0.75,
                                                    zIndex: 1,
                                                    pointerEvents: "none",
                                                }}
                                            />
                                            <div
                                                className={css.modal_team_btn}
                                                style={{
                                                    flex: 1,
                                                    pointerEvents: "none",
                                                }}
                                            >
                                                {withPbsTags(modalPlayedLeft, withPotBadge(modalPlayedLeft, (
                                                    <TeamCircle team={modalPlayedLeft} showRating beforeRatingValue={currentModalMatch?.ratingMeta?.before?.[modalPlayedLeft?.id]?.points} ratingValue={(currentModalMatch?.ratingMeta?.after?.[modalPlayedLeft?.id]?.points ?? (teamRatings[modalPlayedLeft?.id] ?? 0)) + pbsBonusOf(modalPlayedLeft?.id)} specialStyle={{ width: '64px', height: '64px', border: currentModalMatch.pickTeamId === modalPlayedLeft?.id && leftIsPick ? leftPickFailed ? '3px solid #7d2e2e' : '3px solid #2e7d32' : '3px solid #999', boxShadow: currentModalMatch.pickTeamId === modalPlayedLeft?.id && leftIsPick ? leftPickFailed ? '0 0 8px 2px #7d2e2e' : '0 0 8px 2px #2e7d32' : 'none', zIndex: 2 }} />
                                                )), true)}
                                                <span className={css.modal_team_label}>
                                                    {(() => {
                                                        const meta = currentModalMatch?.ratingMeta;
                                                        const id = modalPlayedLeft?.id;
                                                        const afterRank = meta?.after?.[id]?.rank ?? (rankById[id] ?? 64);
                                                        const beforeRank = meta?.before?.[id]?.rank ?? afterRank;
                                                        const deltaPlaces = beforeRank - afterRank;
                                                        const afterPoints = meta?.after?.[id]?.points ?? (teamRatings[id] ?? 0);
                                                        const beforePoints = meta?.before?.[id]?.points ?? afterPoints;
                                                        const deltaPoints = afterPoints - beforePoints;

                                                        const placementColor = placementColors[afterRank] || "#ffffff";

                                                        const rankSticker = () => {
                                                            return (
                                                                <span style={{ color: placementColor }}>
                                                                    {formatOrdinal(afterRank)}
                                                                </span>
                                                            );
                                                        };

                                                        return (
                                                            <>
                                                                <span style={{ top: '-60px', right: "-6px", zIndex: 3, width: 'max-content' }} className={css.finished_modal_team_placing}>
                                                                    {deltaPlaces !== 0 && (
                                                                        <span
                                                                            style={{
                                                                                color: deltaPlaces > 0 ? "#2e7d32" : "red",
                                                                                fontWeight: 900,
                                                                                marginRight: "-2px",
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                                gap: "2px",
                                                                            }}
                                                                        >
                                                                            {deltaPlaces > 0 ? (
                                                                                <>
                                                                                    <span style={{ marginRight: "-4px" }}>{deltaPlaces}</span>
                                                                                    <MdOutlineKeyboardDoubleArrowUp />
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <span style={{ marginRight: "-4px" }}>{Math.abs(deltaPlaces)}</span>
                                                                                    <MdOutlineKeyboardDoubleArrowDown />
                                                                                </>
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                    <span style={{ color: '#ffffff', textShadow: currentModalMatch.pickTeamId === modalPlayedLeft?.id && leftIsPick ? leftPickFailed ? '0 0 8px red' : '0 0 8px #2e7d32' : '0 0 4px #000' }}>
                                                                        {rankSticker()}
                                                                    </span>
                                                                </span>
                                                                <span style={{ width: 'max-content', top: '62%', zIndex: 3, }} className={css.finished_modal_team_label}>
                                                                    {getPlacementBadge(winnerIsLeft, leftIsLoser)}
                                                                    <span style={{ color: '#ffffff', textShadow: currentModalMatch.pickTeamId === modalPlayedLeft?.id && leftIsPick ? leftPickFailed ? '0 0 8px red' : '0 0 8px #2e7d32' : '0 0 4px #000' }}>
                                                                        {modalPlayedLeft?.name}
                                                                        {leftStakeText === "path ends here, for now!" || leftStakeText === "second place is still wonderful!" ? "'s" : ""}
                                                                    </span>
                                                                    {deltaPoints !== 0 && (
                                                                        <span style={{ color: deltaPoints > 0 ? "#2e7d32" : "red", fontWeight: 900, marginLeft: '4px' }}>
                                                                            {deltaPoints > 0 ? `+${deltaPoints}p` : `${deltaPoints}p`}
                                                                        </span>
                                                                    )}
                                                                    {pbsBonusOf(id) > 0 && (
                                                                        <span className={css.pbs_bonus_points} title={`Bounty bonus: the final bounty divided by 4 (${pbsBonusOf(id)} points on top)`}>
                                                                            <BountyGem size={11} />+{pbsBonusOf(id)}p
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </>
                                                        );
                                                    })()}
                                                </span>
                                            </div>

                                            <div className={css.modal_vs}>
                                                <span
                                                    style={{
                                                        color: isTieResult
                                                            ? "#5a5a5a"
                                                            : winnerIsLeft
                                                                ? "#2e7d32"
                                                                : "red",
                                                        fontWeight: 800,
                                                        fontStyle: "italic",
                                                        position: "absolute",
                                                        display: "inline-block",
                                                        paddingRight: "8px",
                                                        right: "25px",
                                                        top: "-18px",
                                                        zIndex: 1,
                                                        fontSize: 36,

                                                        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 65%, black 100%)",
                                                        maskImage: "linear-gradient(to right, transparent 0%, black 65%, black 100%)",
                                                    }}
                                                    className={
                                                        isTieResult
                                                            ? css.swissTieScoreShadow
                                                            : winnerIsLeft
                                                                ? css.swissWinnerScoreShadow
                                                                : css.swissLoserScoreShadow
                                                    }
                                                >
                                                    {modalDisplayScoreLeft}
                                                </span>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        marginTop: -1.5,
                                                        marginLeft: 2
                                                    }}
                                                >
                                                    <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#2e2f42" }}></div>
                                                    <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#2e2f42" }}></div>
                                                </div>
                                                <span
                                                    style={{
                                                        color: isTieResult
                                                            ? "#5a5a5a"
                                                            : winnerIsRight
                                                                ? "#2e7d32"
                                                                : "red",
                                                        fontWeight: 800,
                                                        fontStyle: "italic",
                                                        position: "absolute",
                                                        display: "inline-block",
                                                        paddingLeft: "4px",
                                                        left: "28px",
                                                        top: "-18px",
                                                        zIndex: 1,
                                                        fontSize: 36,

                                                        WebkitMaskImage: "linear-gradient(to left, transparent 0%, black 65%, black 100%)",
                                                        maskImage: "linear-gradient(to left, transparent 0%, black 65%, black 100%)",
                                                    }}
                                                    className={
                                                        isTieResult
                                                            ? css.swissTieScoreShadow
                                                            : winnerIsRight
                                                                ? css.swissWinnerScoreShadow
                                                                : css.swissLoserScoreShadow
                                                    }
                                                >
                                                    {modalDisplayScoreRight}
                                                </span>
                                            </div>

                                            <div
                                                className={css.modal_team_btn}
                                                style={{
                                                    flex: 1,
                                                    pointerEvents: "none",
                                                }}
                                            >
                                                {withPbsTags(modalPlayedRight, withPotBadge(modalPlayedRight, (
                                                    <TeamCircle team={modalPlayedRight} showRating beforeRatingValue={currentModalMatch?.ratingMeta?.before?.[modalPlayedRight?.id]?.points} ratingValue={(currentModalMatch?.ratingMeta?.after?.[modalPlayedRight?.id]?.points ?? (teamRatings[modalPlayedRight?.id] ?? 0)) + pbsBonusOf(modalPlayedRight?.id)} specialStyle={{ width: '64px', height: '64px', border: currentModalMatch.pickTeamId === modalPlayedRight?.id && rightIsPick ? rightPickFailed ? '3px solid #7d2e2e' : '3px solid #2e7d32' : '3px solid #999', boxShadow: currentModalMatch.pickTeamId === modalPlayedRight?.id && rightIsPick ? rightPickFailed ? '0 0 8px 2px #7d2e2e' : '0 0 8px 2px #2e7d32' : 'none', zIndex: 2 }} />
                                                )), true)}
                                                <span>
                                                    {(() => {
                                                        const meta = currentModalMatch?.ratingMeta;
                                                        const id = modalPlayedRight?.id;
                                                        const afterRank = meta?.after?.[id]?.rank ?? (rankById[id] ?? 64);
                                                        const beforeRank = meta?.before?.[id]?.rank ?? afterRank;
                                                        const deltaPlaces = beforeRank - afterRank;
                                                        const afterPoints = meta?.after?.[id]?.points ?? (teamRatings[id] ?? 0);
                                                        const beforePoints = meta?.before?.[id]?.points ?? afterPoints;
                                                        const deltaPoints = afterPoints - beforePoints;

                                                        const placementColor = placementColors[afterRank] || "#ffffff";

                                                        const rankSticker = () => {
                                                            return (
                                                                <span style={{ color: placementColor }}>
                                                                    {formatOrdinal(afterRank)}
                                                                </span>
                                                            );
                                                        };

                                                        return (
                                                            <>
                                                                <span style={{ top: '12%', zIndex: 3, width: 'max-content' }} className={css.finished_modal_team_placing}>
                                                                    {deltaPlaces !== 0 && (
                                                                        <span
                                                                            style={{
                                                                                color: deltaPlaces > 0 ? "#2e7d32" : "red",
                                                                                fontWeight: 900,
                                                                                marginRight: "-2px",
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                                gap: "2px",
                                                                            }}
                                                                        >
                                                                            {deltaPlaces > 0 ? (
                                                                                <>
                                                                                    <span style={{ marginRight: "-4px" }}>{deltaPlaces}</span>
                                                                                    <MdOutlineKeyboardDoubleArrowUp />
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <span style={{ marginRight: "-4px" }}>{Math.abs(deltaPlaces)}</span>
                                                                                    <MdOutlineKeyboardDoubleArrowDown />
                                                                                </>
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                    <span style={{ color: '#ffffff', textShadow: currentModalMatch.pickTeamId === modalPlayedRight?.id && rightIsPick ? rightPickFailed ? '0 0 8px 2px red' : '0 0 8px 2px #2e7d32' : '0 0 4px #000' }}>
                                                                        {rankSticker()}
                                                                    </span>
                                                                </span>
                                                                <span style={{ width: 'max-content', top: '62%', zIndex: 3, }} className={css.finished_modal_team_label}>
                                                                    {getPlacementBadge(winnerIsRight, rightIsLoser)}
                                                                    <span style={{ color: '#ffffff', textShadow: currentModalMatch.pickTeamId === modalPlayedRight?.id && rightIsPick ? rightPickFailed ? '0 0 8px 2px red' : '0 0 8px 2px #2e7d32' : '0 0 4px #000' }}>
                                                                        {modalPlayedRight?.name}
                                                                        {rightStakeText === "path ends here, for now!" || rightStakeText === "second place is still wonderful!" ? "'s" : ""}
                                                                    </span>
                                                                    {deltaPoints !== 0 && (
                                                                        <span style={{ color: deltaPoints > 0 ? "#2e7d32" : "red", fontWeight: 900, marginLeft: '4px' }}>
                                                                            {deltaPoints > 0 ? `+${deltaPoints}p` : `${deltaPoints}p`}
                                                                        </span>
                                                                    )}
                                                                    {pbsBonusOf(id) > 0 && (
                                                                        <span className={css.pbs_bonus_points} title={`Bounty bonus: the final bounty divided by 4 (${pbsBonusOf(id)} points on top)`}>
                                                                            <BountyGem size={11} />+{pbsBonusOf(id)}p
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </>
                                                        );
                                                    })()}
                                                </span>
                                            </div>
                                            {renderStats(displayedRightStats, "right")}
                                            {renderStreakFire("right")}
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "32.5%",
                                                    width: 260,
                                                    height: 120,
                                                    borderRadius: "50%",
                                                    transform: "translate(50%, -50%)",
                                                    background: winnerIsRight ? "#91ffc1" : "#ff9191",
                                                    boxShadow: winnerIsRight ? "0 0 32px 8px #91ffc1" : "0 0 32px 8px #ff9191",
                                                    filter: "blur(42px)",
                                                    opacity: isTieResult ? 0 : 0.75,
                                                    zIndex: 1,
                                                    pointerEvents: "none",
                                                }}
                                            />
                                        </div>
                                        {leftStakeText && (
                                            <div
                                                style={{
                                                    position: "relative",
                                                    zIndex: 2,
                                                    marginTop: modalPbs?.meta?.bountyBonus ? "-8px" : "-24px",
                                                    marginBottom: "8px",
                                                    marginLeft: "48px",
                                                    fontSize: "13px",
                                                    fontWeight: 700,
                                                    textShadow: `
                                                                    0 0 3px ${modalPlayedLeft?.color},
                                                                    0 0 7px ${modalPlayedLeft?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `,
                                                    color: "#ffffff",
                                                    width: '216.8px',
                                                    height: 'auto',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {leftStakeText}
                                            </div>
                                        )}
                                        {rightStakeText && (
                                            <div
                                                style={{
                                                    position: "relative",
                                                    zIndex: 2,
                                                    marginTop: "-28px",
                                                    marginBottom: "8px",
                                                    marginLeft: "260px",
                                                    fontSize: "13px",
                                                    fontWeight: 700,
                                                    textShadow: `
                                                                    0 0 3px ${modalPlayedRight?.color},
                                                                    0 0 7px ${modalPlayedRight?.color}66,
                                                                    0 1px 3px rgba(0,0,0,0.4)
                                                                `,
                                                    color: "#ffffff",
                                                    width: '216.8px',
                                                    height: 'auto',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {rightStakeText}
                                            </div>
                                        )}
                                    </div>

                                    <>
                                        {(() => {
                                            const historyMatch = currentModalMatch;
                                            const history = historyMatch?.setHistory ?? [];
                                            if (!history.length) {
                                                return <p className={css.info_text}>No set history stored for this match.</p>;
                                            }

                                            const leftColor = modalPlayedLeft?.color || "#2e7d32";
                                            const rightColor = modalPlayedRight?.color || "red";

                                            const InfoIcon = ({
                                                title,
                                                children,
                                                trigger = "hover",
                                                customLeft = "50%"
                                            }) => {
                                                const [open, setOpen] = useState(false);

                                                return (
                                                    <div
                                                        style={{
                                                            position: "relative",
                                                            display: "flex",
                                                        }}
                                                        onMouseEnter={
                                                            trigger === "hover"
                                                                ? () => setOpen(true)
                                                                : undefined
                                                        }
                                                        onMouseLeave={
                                                            trigger === "hover"
                                                                ? () => setOpen(false)
                                                                : undefined
                                                        }
                                                        onClick={
                                                            trigger === "click"
                                                                ? (e) => {
                                                                    e.stopPropagation();
                                                                    setOpen((prev) => !prev);
                                                                }
                                                                : undefined
                                                        }
                                                    >
                                                        <FaCircleInfo
                                                            size={11}
                                                            style={{
                                                                color: "Highlight",
                                                                cursor: trigger === "click" ? "pointer" : "default",
                                                            }}
                                                        />

                                                        {open && (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ duration: 0.15 }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                style={{
                                                                    position: "absolute",
                                                                    bottom: "calc(100% + 8px)",
                                                                    left: customLeft,
                                                                    transform: "translateX(-50%)",
                                                                    background: "#fff",
                                                                    color: "#2e2f42",
                                                                    boxShadow: "0 2px 10px rgba(0,0,0,.2)",
                                                                    padding: "6px 10px",
                                                                    borderRadius: 6,
                                                                    whiteSpace: "nowrap",
                                                                    zIndex: 9999,
                                                                    fontSize: 12,
                                                                }}
                                                            >
                                                                {title && (
                                                                    <>
                                                                        <span>{title}</span>
                                                                        <br />
                                                                    </>
                                                                )}

                                                                {children}
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                );
                                            };

                                            return (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className={css.seriesSummary} style={{ fontSize: 13, display: "flex", alignItems: "center", width: 'max-content', margin: '0 auto' }} >
                                                    <ul
                                                        className={css.seriesSummaryList}
                                                        style={{
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: "6px",
                                                        }}
                                                    >
                                                        {history.map(
                                                            ({
                                                                set,
                                                                wins,
                                                                losses,
                                                                won,
                                                                tie = false,
                                                                firstHalfLeft,
                                                                firstHalfRight,
                                                                extendedRounds = {
                                                                    firstHalf: null,
                                                                    secondHalf: null,
                                                                    overtimes: [],
                                                                },
                                                            }) => {
                                                                const isDecider = set === modalBestOf;
                                                                const label = isDecider ? "Decider" : `Set ${set}`;

                                                                const leftGlow = won && !tie;
                                                                const rightGlow = !won && !tie;

                                                                const leftOpacity = won || tie ? 1 : 0.4;
                                                                const rightOpacity = won && !tie ? 0.4 : 1;

                                                                const isATie = wins === losses;

                                                                const winnerCount = won ? wins : losses;

                                                                const finalCount = isATie ? winnerCount + 1 : winnerCount;

                                                                const overtimeCount = Math.max(
                                                                    0,
                                                                    Math.floor((finalCount - 13) / 3)
                                                                );

                                                                const hasOvertime = overtimeCount > 0;

                                                                const leftAttempts = extendedRounds?.penalties?.leftResults.length ?? 0;
                                                                const rightAttempts = extendedRounds?.penalties?.rightResults.length ?? 0;

                                                                const leftOtExtendedRounds =
                                                                    extendedRounds.overtimes.filter(
                                                                        (x) => x.winner === "left"
                                                                    );

                                                                const rightOtExtendedRounds =
                                                                    extendedRounds.overtimes.filter(
                                                                        (x) => x.winner === "right"
                                                                    );

                                                                const leftOtLabels =
                                                                    leftOtExtendedRounds.map((x) =>
                                                                        getOvertimeShortLabel(x.overtime)
                                                                    );

                                                                const rightOtLabels =
                                                                    rightOtExtendedRounds.map((x) =>
                                                                        getOvertimeShortLabel(x.overtime)
                                                                    );

                                                                const showLeftCheck =
                                                                    leftOtExtendedRounds.length === 1 &&
                                                                    rightOtExtendedRounds.length === 0;

                                                                const showLeftInfo =
                                                                    !showLeftCheck &&
                                                                    leftOtExtendedRounds.length > 0;

                                                                const showRightCheck =
                                                                    rightOtExtendedRounds.length === 1 &&
                                                                    leftOtExtendedRounds.length === 0;

                                                                const showRightInfo =
                                                                    !showRightCheck &&
                                                                    rightOtExtendedRounds.length > 0;

                                                                const formatRoundsCount = () => {
                                                                    const lastDigit = totalRounds % 10;

                                                                    return lastDigit === 1 ? "Round" : "Rounds";
                                                                };

                                                                const otLeft = hasOvertime
                                                                    ? Math.max(0, wins - 12)
                                                                    : null;

                                                                const otRight = hasOvertime
                                                                    ? Math.max(0, losses - 12)
                                                                    : null;

                                                                const secondHalfLeft =
                                                                    (hasOvertime ? wins - otLeft : wins) -
                                                                    firstHalfLeft;

                                                                const secondHalfRight =
                                                                    (hasOvertime ? losses - otRight : losses) -
                                                                    firstHalfRight;

                                                                const extendedRoundLeftScore =
                                                                    (extendedRounds.firstHalf === "left" ? 1 : 0) +
                                                                    (extendedRounds.secondHalf === "left" ? 1 : 0) +
                                                                    leftOtExtendedRounds.length;

                                                                const extendedRoundRightScore =
                                                                    (extendedRounds.firstHalf === "right" ? 1 : 0) +
                                                                    (extendedRounds.secondHalf === "right" ? 1 : 0) +
                                                                    rightOtExtendedRounds.length;

                                                                const hasExtendedRounds = isATie && !tie &&
                                                                    extendedRoundLeftScore + extendedRoundRightScore > 0;

                                                                const totalRounds = wins + losses;

                                                                const getHalfStyleLeft = (leftScore, rightScore) => {
                                                                    if (leftScore === rightScore) {
                                                                        return {
                                                                            opacity: 1
                                                                        };
                                                                    }

                                                                    return {
                                                                        opacity: leftScore > rightScore ? 1 : 0.6,
                                                                        textShadow:
                                                                            leftScore > rightScore
                                                                                ? `
                                                                                                0 0 3px ${leftColor},
                                                                                                0 0 6px ${leftColor}55
                                                                                            `
                                                                                : "none",
                                                                    };
                                                                };

                                                                const getHalfStyleRight = (rightScore, leftScore) => {
                                                                    if (rightScore === leftScore) {
                                                                        return {
                                                                            opacity: 1
                                                                        };
                                                                    }

                                                                    return {
                                                                        opacity: rightScore > leftScore ? 1 : 0.6,
                                                                        textShadow:
                                                                            rightScore > leftScore
                                                                                ? `
                                                                                                0 0 3px ${rightColor},
                                                                                                0 0 6px ${rightColor}55
                                                                                            `
                                                                                : "none",
                                                                    };
                                                                };

                                                                const erLeftStyle = hasExtendedRounds
                                                                    ? getHalfStyleLeft(
                                                                        extendedRoundLeftScore,
                                                                        extendedRoundRightScore
                                                                    )
                                                                    : null;

                                                                const erRightStyle = hasExtendedRounds
                                                                    ? getHalfStyleRight(
                                                                        extendedRoundRightScore,
                                                                        extendedRoundLeftScore
                                                                    )
                                                                    : null;

                                                                const firstHalfLeftStyle = getHalfStyleLeft(
                                                                    firstHalfLeft,
                                                                    firstHalfRight
                                                                );

                                                                const firstHalfRightStyle = getHalfStyleRight(
                                                                    firstHalfRight,
                                                                    firstHalfLeft
                                                                );

                                                                const secondHalfLeftStyle = getHalfStyleLeft(
                                                                    secondHalfLeft,
                                                                    secondHalfRight
                                                                );

                                                                const secondHalfRightStyle = getHalfStyleRight(
                                                                    secondHalfRight,
                                                                    secondHalfLeft
                                                                );

                                                                const otLeftStyle = hasOvertime
                                                                    ? getHalfStyleLeft(otLeft, otRight)
                                                                    : null;

                                                                const otRightStyle = hasOvertime
                                                                    ? getHalfStyleRight(otRight, otLeft)
                                                                    : null;

                                                                const completedSuddenDeathPairs = Math.min(
                                                                    Math.max(0, leftAttempts - 5),
                                                                    Math.max(0, rightAttempts - 5)
                                                                );

                                                                const totalAttempts = Math.min(leftAttempts, rightAttempts);

                                                                const hasUnequalAttempts = leftAttempts !== rightAttempts;

                                                                const leaderTeam =
                                                                    leftAttempts > rightAttempts
                                                                        ? modalPlayedLeft
                                                                        : modalPlayedRight;

                                                                const leaderAttempts = Math.max(leftAttempts, rightAttempts);

                                                                const modalAttemptsToDisplay =
                                                                    PENALTY_DISPLAY_CIRCLES + completedSuddenDeathPairs;

                                                                const pensLeftStyle = extendedRounds?.penalties
                                                                    ? getHalfStyleLeft(extendedRounds?.penalties.leftScore, extendedRounds?.penalties.rightScore)
                                                                    : null;

                                                                const pensRightStyle = extendedRounds?.penalties
                                                                    ? getHalfStyleRight(extendedRounds?.penalties.rightScore, extendedRounds?.penalties.leftScore)
                                                                    : null;

                                                                const pensLeftWon =
                                                                    extendedRounds?.penalties &&
                                                                    extendedRounds.penalties.leftScore >
                                                                    extendedRounds.penalties.rightScore;

                                                                const pensRightWon =
                                                                    extendedRounds?.penalties &&
                                                                    extendedRounds.penalties.rightScore >
                                                                    extendedRounds.penalties.leftScore;

                                                                return (
                                                                    <li
                                                                        key={set}
                                                                        className={css.seriesSummaryItem}
                                                                        style={{
                                                                            display: "flex",
                                                                            flexDirection: "row",
                                                                            justifyContent: "center",
                                                                            alignItems: "flex-start",
                                                                            gap: "36px"
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                display: "flex",
                                                                                flexDirection: "column",
                                                                                alignItems: "center",
                                                                                minWidth: "60px",
                                                                            }}
                                                                        >
                                                                            {!isBo1Modal && (
                                                                                <span
                                                                                    className={css.round_text}
                                                                                    style={{ opacity: leftOpacity, height: "42px", marginTop: "1px" }}
                                                                                >
                                                                                    <CountUp
                                                                                        start={Math.max(wins - 1, 0)}
                                                                                        end={wins}
                                                                                        duration={1}
                                                                                        style={{
                                                                                            color: leftColor,
                                                                                            fontSize: "36px",
                                                                                            textShadow: leftGlow
                                                                                                ? `
                                                                                                            0 0 6px ${leftColor},
                                                                                                            0 0 14px ${leftColor}66,
                                                                                                            0 2px 6px rgba(0,0,0,0.4)
                                                                                                        `
                                                                                                : "none",
                                                                                        }}
                                                                                    />
                                                                                </span>
                                                                            )}

                                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: isBo1Modal ? "26px" : "0px" }}>
                                                                                <span
                                                                                    className={css.info_text}
                                                                                    style={{
                                                                                        fontSize: isBo1Modal ? "14px" : "12px",
                                                                                        color: leftColor,
                                                                                        opacity: firstHalfLeftStyle.opacity,
                                                                                        textShadow: firstHalfLeftStyle.textShadow,
                                                                                        height: isBo1Modal ? "17px" : "16px"
                                                                                    }}
                                                                                >
                                                                                    {firstHalfLeft}
                                                                                </span>

                                                                                <span
                                                                                    className={css.info_text}
                                                                                    style={{
                                                                                        fontSize: isBo1Modal ? "14px" : "12px",
                                                                                        color: leftColor,
                                                                                        opacity: secondHalfLeftStyle.opacity,
                                                                                        textShadow: secondHalfLeftStyle.textShadow,
                                                                                        height: isBo1Modal ? "17px" : "16px"
                                                                                    }}
                                                                                >
                                                                                    {secondHalfLeft}
                                                                                </span>

                                                                                {hasOvertime && (
                                                                                    <span
                                                                                        className={css.info_text}
                                                                                        style={{
                                                                                            fontSize: isBo1Modal ? "14px" : "12px",
                                                                                            color: leftColor,
                                                                                            opacity: otLeftStyle.opacity,
                                                                                            textShadow: otLeftStyle.textShadow,
                                                                                            height: isBo1Modal ? "17px" : "16px"
                                                                                        }}
                                                                                    >
                                                                                        {otLeft}
                                                                                    </span>
                                                                                )}

                                                                                {hasExtendedRounds && (
                                                                                    <div className={css.dashed_divider} style={{ zIndex: 3, width: "200%", marginTop: "2px", marginBottom: "2px", opacity: 0 }} />
                                                                                )}

                                                                                {hasExtendedRounds && (
                                                                                    <span
                                                                                        className={css.info_text}
                                                                                        style={{
                                                                                            fontSize: isBo1Modal ? "14px" : "12px",
                                                                                            color: leftColor,
                                                                                            opacity: erLeftStyle.opacity,
                                                                                            textShadow: erLeftStyle.textShadow,
                                                                                            height: isBo1Modal ? "17px" : "16px",
                                                                                        }}
                                                                                    >
                                                                                        {extendedRoundLeftScore}
                                                                                    </span>
                                                                                )}

                                                                                {extendedRounds?.penalties && (
                                                                                    <span
                                                                                        className={css.info_text}
                                                                                        style={{
                                                                                            fontSize: isBo1Modal ? "14px" : "12px",
                                                                                            color: leftColor,
                                                                                            opacity: pensLeftStyle.opacity,
                                                                                            textShadow: pensLeftStyle.textShadow,
                                                                                            height: isBo1Modal ? "17px" : "16px"
                                                                                        }}
                                                                                    >
                                                                                        {extendedRounds.penalties.leftScore}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div
                                                                            style={{
                                                                                display: "flex",
                                                                                flexDirection: "column",
                                                                                alignItems: "center",
                                                                                minWidth: "160px",
                                                                            }}
                                                                        >
                                                                            {!isBo1Modal && (
                                                                                <button
                                                                                    type="button"
                                                                                    className={css.gamble_button}
                                                                                    style={{ fontSize: "inherit", lineHeight: 1.1, padding: "1px 1px" }}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setBreakdownSetIndex(set - 1);
                                                                                    }}
                                                                                >
                                                                                    <span className={css.info_text} style={{ fontWeight: 600, color: "#ffffff" }}>
                                                                                        {label}
                                                                                    </span>
                                                                                </button>
                                                                            )}

                                                                            {isBo1Modal ? (
                                                                                <button
                                                                                    type="button"
                                                                                    className={css.gamble_button}
                                                                                    style={{ fontSize: "inherit", lineHeight: 1.1, padding: "6px 12px", paddingBottom: "4.2px", marginTop: "-4px" }}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setBreakdownSetIndex(set - 1);
                                                                                    }}
                                                                                >
                                                                                    <span style={{ fontSize: "18px", textAlign: "center", color: "#ffffff" }} className={css.vs}>
                                                                                        {totalRounds} {formatRoundsCount()}
                                                                                    </span>
                                                                                </button>
                                                                            ) : (
                                                                                <span style={{ fontSize: "18px", textAlign: "center", marginTop: "-4px" }} className={css.vs}>
                                                                                    {totalRounds} {formatRoundsCount()}
                                                                                </span>
                                                                            )}

                                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0px", fontSize: isBo1Modal ? "12px" : "11px" }}>
                                                                                <div
                                                                                    style={{
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        gap: 4,
                                                                                        position: "relative"
                                                                                    }}
                                                                                >
                                                                                    <span style={{ position: 'absolute', right: "104%", top: "1px" }}>
                                                                                        {extendedRounds?.firstHalf === "left" && (
                                                                                            <FaCircleCheck
                                                                                                size={10}
                                                                                                color="#50ff50"
                                                                                            />
                                                                                        )}
                                                                                    </span>

                                                                                    <span className={css.info_text}>
                                                                                        1st Half
                                                                                    </span>

                                                                                    <span style={{ position: 'absolute', left: "109%", top: "1px" }}>
                                                                                        {extendedRounds?.firstHalf === "right" && (
                                                                                            <FaCircleCheck
                                                                                                size={10}
                                                                                                color="#50ff50"
                                                                                            />
                                                                                        )}
                                                                                    </span>
                                                                                </div>

                                                                                <div
                                                                                    style={{
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        gap: 4,
                                                                                        position: "relative"
                                                                                    }}
                                                                                >
                                                                                    <span style={{ position: 'absolute', right: "104%", top: "1px" }}>
                                                                                        {extendedRounds?.secondHalf === "left" && (
                                                                                            <FaCircleCheck
                                                                                                size={10}
                                                                                                color="#50ff50"
                                                                                            />
                                                                                        )}
                                                                                    </span>

                                                                                    <span className={css.info_text}>
                                                                                        2nd Half
                                                                                    </span>

                                                                                    <span style={{ position: 'absolute', left: "107%", top: "1px" }}>
                                                                                        {extendedRounds?.secondHalf === "right" && (
                                                                                            <FaCircleCheck
                                                                                                size={10}
                                                                                                color="#50ff50"
                                                                                            />
                                                                                        )}
                                                                                    </span>
                                                                                </div>

                                                                                {hasOvertime && (
                                                                                    <div
                                                                                        style={{
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                            gap: 4,
                                                                                            position: "relative",
                                                                                        }}
                                                                                    >
                                                                                        <span
                                                                                            style={{
                                                                                                position: "absolute",
                                                                                                right: "107%",
                                                                                                top: showLeftCheck ? "1px" : "2.5px",
                                                                                            }}
                                                                                        >
                                                                                            {showLeftCheck ? (
                                                                                                <FaCircleCheck
                                                                                                    size={10}
                                                                                                    color="#50ff50"
                                                                                                />
                                                                                            ) : showLeftInfo ? (
                                                                                                <InfoIcon
                                                                                                    title={`Extended OT Round${leftOtLabels.length === 1 ? "" : "s"} taken in`}
                                                                                                >
                                                                                                    {(() => {
                                                                                                        const rows = [];

                                                                                                        for (let i = 0; i < leftOtLabels.length; i += 5) {
                                                                                                            rows.push(leftOtLabels.slice(i, i + 5));
                                                                                                        }

                                                                                                        return rows.map((row, rowIndex) => (
                                                                                                            <React.Fragment key={rowIndex}>
                                                                                                                {rowIndex > 0 && <br />}
                                                                                                                {row.map((label, index) => {
                                                                                                                    const lastRow = rowIndex === rows.length - 1;
                                                                                                                    const last = lastRow && index === row.length - 1;
                                                                                                                    const secondLast = lastRow && index === row.length - 2;

                                                                                                                    return (
                                                                                                                        <React.Fragment key={index}>
                                                                                                                            {index > 0 && !last && ", "}
                                                                                                                            <span style={{ fontWeight: 600 }}>
                                                                                                                                {label}
                                                                                                                            </span>
                                                                                                                            {secondLast && (
                                                                                                                                <span style={{ fontWeight: 500 }}>
                                                                                                                                    {" "}
                                                                                                                                    and{" "}
                                                                                                                                </span>
                                                                                                                            )}
                                                                                                                        </React.Fragment>
                                                                                                                    );
                                                                                                                })}
                                                                                                            </React.Fragment>
                                                                                                        ));
                                                                                                    })()}
                                                                                                </InfoIcon>
                                                                                            ) : null}
                                                                                        </span>

                                                                                        <span className={css.info_text}>
                                                                                            {getOvertimeShortLabel(overtimeCount)}
                                                                                        </span>

                                                                                        <span
                                                                                            style={{
                                                                                                position: "absolute",
                                                                                                left: "107%",
                                                                                                top: showRightCheck ? "1px" : "2.5px",
                                                                                            }}
                                                                                        >
                                                                                            {showRightCheck ? (
                                                                                                <FaCircleCheck
                                                                                                    size={10}
                                                                                                    color="#50ff50"
                                                                                                />
                                                                                            ) : showRightInfo ? (
                                                                                                <InfoIcon
                                                                                                    title={`Extended OT Round${rightOtLabels.length === 1 ? "" : "s"} taken in`}
                                                                                                >
                                                                                                    {(() => {
                                                                                                        const rows = [];

                                                                                                        for (let i = 0; i < rightOtLabels.length; i += 5) {
                                                                                                            rows.push(rightOtLabels.slice(i, i + 5));
                                                                                                        }

                                                                                                        return rows.map((row, rowIndex) => (
                                                                                                            <React.Fragment key={rowIndex}>
                                                                                                                {rowIndex > 0 && <br />}
                                                                                                                {row.map((label, index) => {
                                                                                                                    const lastRow = rowIndex === rows.length - 1;
                                                                                                                    const last = lastRow && index === row.length - 1;
                                                                                                                    const secondLast = lastRow && index === row.length - 2;

                                                                                                                    return (
                                                                                                                        <React.Fragment key={index}>
                                                                                                                            {index > 0 && !last && ", "}
                                                                                                                            <span style={{ fontWeight: 600 }}>
                                                                                                                                {label}
                                                                                                                            </span>
                                                                                                                            {secondLast && (
                                                                                                                                <span style={{ fontWeight: 500 }}>
                                                                                                                                    {" "}
                                                                                                                                    and{" "}
                                                                                                                                </span>
                                                                                                                            )}
                                                                                                                        </React.Fragment>
                                                                                                                    );
                                                                                                                })}
                                                                                                            </React.Fragment>
                                                                                                        ));
                                                                                                    })()}
                                                                                                </InfoIcon>
                                                                                            ) : null}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                {hasExtendedRounds && (
                                                                                    <div className={css.dashed_divider} style={{ zIndex: 3, width: "380%", marginTop: "2px", marginBottom: "2px", borderTop: "2px dashed #999" }} />
                                                                                )}
                                                                                {hasExtendedRounds && (
                                                                                    <div
                                                                                        style={{
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                            gap: 4,
                                                                                            position: "relative",
                                                                                        }}
                                                                                    >
                                                                                        <span className={css.info_text}>
                                                                                            Extended Rounds
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                {extendedRounds?.penalties && (
                                                                                    <div style={{ position: "relative" }}>
                                                                                        {pensLeftWon && (
                                                                                            <span
                                                                                                style={{
                                                                                                    position: "absolute",
                                                                                                    right: "107%",
                                                                                                    top: "2.5px",
                                                                                                }}
                                                                                            >
                                                                                                <InfoIcon
                                                                                                    title={
                                                                                                        hasUnequalAttempts ? (
                                                                                                            <>
                                                                                                                <strong>{totalAttempts} full attempts</strong> taken by both teams,
                                                                                                                <br />
                                                                                                                <strong>{leaderAttempts}</strong> taken by{" "}
                                                                                                                <span
                                                                                                                    style={{
                                                                                                                        color: leaderTeam.color,
                                                                                                                        fontWeight: 700,
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Team {leaderTeam.name}
                                                                                                                </span>
                                                                                                            </>
                                                                                                        ) : (
                                                                                                            <>
                                                                                                                <strong>{totalAttempts} full attempts</strong> taken by both teams
                                                                                                            </>
                                                                                                        )
                                                                                                    }
                                                                                                    trigger="hover"
                                                                                                >
                                                                                                    <div
                                                                                                        style={{
                                                                                                            display: "flex",
                                                                                                            flexDirection: "column",
                                                                                                            alignItems: "start",
                                                                                                            gap: 6,
                                                                                                        }}
                                                                                                    >
                                                                                                        <div>
                                                                                                            <span
                                                                                                                style={{
                                                                                                                    color: modalPlayedLeft.color,
                                                                                                                    fontWeight: 800,
                                                                                                                    marginBottom: 4,
                                                                                                                }}
                                                                                                            >
                                                                                                                {modalPlayedLeft.name}
                                                                                                            </span>
                                                                                                            <PenaltyCircles
                                                                                                                compact
                                                                                                                resolved
                                                                                                                team="right"
                                                                                                                attemptsToDisplay={modalAttemptsToDisplay}
                                                                                                                results={extendedRounds.penalties.leftResults}
                                                                                                            />
                                                                                                        </div>

                                                                                                        <div>
                                                                                                            <span
                                                                                                                style={{
                                                                                                                    color: modalPlayedRight.color,
                                                                                                                    fontWeight: 800
                                                                                                                }}
                                                                                                            >
                                                                                                                {modalPlayedRight.name}
                                                                                                            </span>
                                                                                                            <PenaltyCircles
                                                                                                                compact
                                                                                                                resolved
                                                                                                                team="right"
                                                                                                                attemptsToDisplay={modalAttemptsToDisplay}
                                                                                                                results={extendedRounds.penalties.rightResults}
                                                                                                            />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </InfoIcon>
                                                                                            </span>
                                                                                        )}

                                                                                        <span style={{ marginTop: !isBo1Modal ? "1px" : "0px", display: "inline-block" }} className={css.info_text}>
                                                                                            Penalties
                                                                                        </span>

                                                                                        {pensRightWon && (
                                                                                            <span
                                                                                                style={{
                                                                                                    position: "absolute",
                                                                                                    left: "107%",
                                                                                                    top: "2.5px",
                                                                                                }}
                                                                                            >
                                                                                                <InfoIcon
                                                                                                    title={
                                                                                                        hasUnequalAttempts ? (
                                                                                                            <>
                                                                                                                <strong>{totalAttempts} full attempts</strong> taken by both teams,
                                                                                                                <br />
                                                                                                                <strong>{leaderAttempts}</strong> taken by{" "}
                                                                                                                <span
                                                                                                                    style={{
                                                                                                                        color: leaderTeam.color,
                                                                                                                        fontWeight: 700,
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Team {leaderTeam.name}
                                                                                                                </span>
                                                                                                            </>
                                                                                                        ) : (
                                                                                                            <>
                                                                                                                <strong>{totalAttempts} full attempts</strong> taken by both teams
                                                                                                            </>
                                                                                                        )
                                                                                                    }
                                                                                                    trigger="hover"
                                                                                                >
                                                                                                    <div
                                                                                                        style={{
                                                                                                            display: "flex",
                                                                                                            flexDirection: "column",
                                                                                                            alignItems: "start",
                                                                                                            gap: 6,
                                                                                                        }}
                                                                                                    >
                                                                                                        <div>
                                                                                                            <span
                                                                                                                style={{
                                                                                                                    color: modalPlayedLeft.color,
                                                                                                                    fontWeight: 800
                                                                                                                }}
                                                                                                            >
                                                                                                                {modalPlayedLeft.name}
                                                                                                            </span>
                                                                                                            <PenaltyCircles
                                                                                                                compact
                                                                                                                resolved
                                                                                                                team="right"
                                                                                                                attemptsToDisplay={modalAttemptsToDisplay}
                                                                                                                results={extendedRounds.penalties.leftResults}
                                                                                                            />
                                                                                                        </div>

                                                                                                        <div>
                                                                                                            <span
                                                                                                                style={{
                                                                                                                    color: modalPlayedRight.color,
                                                                                                                    fontWeight: 800,
                                                                                                                    marginBottom: 4,
                                                                                                                }}
                                                                                                            >
                                                                                                                {modalPlayedRight.name}
                                                                                                            </span>
                                                                                                            <PenaltyCircles
                                                                                                                compact
                                                                                                                resolved
                                                                                                                team="right"
                                                                                                                attemptsToDisplay={modalAttemptsToDisplay}
                                                                                                                results={extendedRounds.penalties.rightResults}
                                                                                                            />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </InfoIcon>
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div
                                                                            style={{
                                                                                display: "flex",
                                                                                flexDirection: "column",
                                                                                alignItems: "center",
                                                                                minWidth: "60px",
                                                                            }}
                                                                        >
                                                                            {!isBo1Modal && (
                                                                                <span
                                                                                    className={css.round_text}
                                                                                    style={{ opacity: rightOpacity, height: "42px", marginTop: "1px" }}
                                                                                >
                                                                                    <CountUp
                                                                                        start={Math.max(losses - 1, 0)}
                                                                                        end={losses}
                                                                                        duration={1}
                                                                                        style={{
                                                                                            color: rightColor,
                                                                                            fontSize: "36px",
                                                                                            textShadow: rightGlow
                                                                                                ? `
                                                                                                            0 0 6px ${rightColor},
                                                                                                            0 0 14px ${rightColor}66,
                                                                                                            0 2px 6px rgba(0,0,0,0.4)
                                                                                                        `
                                                                                                : "none",
                                                                                        }}
                                                                                    />
                                                                                </span>
                                                                            )}

                                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: isBo1Modal ? "26px" : "0px" }}>
                                                                                <span
                                                                                    className={css.info_text}
                                                                                    style={{
                                                                                        fontSize: isBo1Modal ? "14px" : "12px",
                                                                                        color: rightColor,
                                                                                        opacity: firstHalfRightStyle.opacity,
                                                                                        textShadow: firstHalfRightStyle.textShadow,
                                                                                        height: isBo1Modal ? "17px" : "16px"
                                                                                    }}
                                                                                >
                                                                                    {firstHalfRight}
                                                                                </span>

                                                                                <span
                                                                                    className={css.info_text}
                                                                                    style={{
                                                                                        fontSize: isBo1Modal ? "14px" : "12px",
                                                                                        color: rightColor,
                                                                                        opacity: secondHalfRightStyle.opacity,
                                                                                        textShadow: secondHalfRightStyle.textShadow,
                                                                                        height: isBo1Modal ? "17px" : "16px"
                                                                                    }}
                                                                                >
                                                                                    {secondHalfRight}
                                                                                </span>

                                                                                {hasOvertime && (
                                                                                    <span
                                                                                        className={css.info_text}
                                                                                        style={{
                                                                                            fontSize: isBo1Modal ? "14px" : "12px",
                                                                                            color: rightColor,
                                                                                            opacity: otRightStyle.opacity,
                                                                                            textShadow: otRightStyle.textShadow,
                                                                                            height: isBo1Modal ? "17px" : "16px"
                                                                                        }}
                                                                                    >
                                                                                        {otRight}
                                                                                    </span>
                                                                                )}

                                                                                {hasExtendedRounds && (
                                                                                    <div className={css.dashed_divider} style={{ zIndex: 3, width: "200%", marginTop: "2px", marginBottom: "2px", opacity: 0 }} />
                                                                                )}

                                                                                {hasExtendedRounds && (
                                                                                    <span
                                                                                        className={css.info_text}
                                                                                        style={{
                                                                                            fontSize: isBo1Modal ? "14px" : "12px",
                                                                                            color: rightColor,
                                                                                            opacity: erRightStyle.opacity,
                                                                                            textShadow: erRightStyle.textShadow,
                                                                                            height: isBo1Modal ? "17px" : "16px",
                                                                                        }}
                                                                                    >
                                                                                        {extendedRoundRightScore}
                                                                                    </span>
                                                                                )}

                                                                                {extendedRounds?.penalties && (
                                                                                    <span
                                                                                        className={css.info_text}
                                                                                        style={{
                                                                                            fontSize: isBo1Modal ? "14px" : "12px",
                                                                                            color: rightColor,
                                                                                            opacity: pensRightStyle.opacity,
                                                                                            textShadow: pensRightStyle.textShadow,
                                                                                            height: isBo1Modal ? "17px" : "16px"
                                                                                        }}
                                                                                    >
                                                                                        {extendedRounds.penalties.rightScore}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                );
                                                            }
                                                        )}
                                                    </ul>
                                                </motion.div>
                                            );
                                        })()}
                                    </>
                                </>
                            );
                        })()}
                </motion.div>

                {(() => {
                    const orientedView = isPlayedModal
                        ? getPickOrientedModalView(currentModalMatch, isBo1Modal)
                        : null;
                    const statsLeftTeam = orientedView?.leftTeam ?? modalLeftTeam;
                    const statsRightTeam = orientedView?.rightTeam ?? modalRightTeam;

                    const statActivation = isPlayedModal
                        ? getFinishedMatchStatActivation({
                            match: currentModalMatch,
                            modalContext,
                            bestOf: modalBestOf,
                            leftTeam: statsLeftTeam,
                            rightTeam: statsRightTeam,
                        })
                        : getPreMatchStatActivation({
                            modalContext,
                            bestOf: modalBestOf,
                            leftTeam: statsLeftTeam,
                            rightTeam: statsRightTeam,
                            leftStats: teamStats?.[statsLeftTeam?.id],
                            rightStats: teamStats?.[statsRightTeam?.id],
                            ratings: teamRatings,
                            teams: allTeams,
                        });

                    return (
                        <MatchStatsOverlay
                            leftTeam={statsLeftTeam}
                            rightTeam={statsRightTeam}
                            showDiff={isPlayedModal}
                            leftNow={
                                isPlayedModal
                                    ? currentModalMatch?.statsMeta?.after?.[statsLeftTeam?.id]
                                    : teamStats?.[statsLeftTeam?.id]
                            }
                            rightNow={
                                isPlayedModal
                                    ? currentModalMatch?.statsMeta?.after?.[statsRightTeam?.id]
                                    : teamStats?.[statsRightTeam?.id]
                            }
                            leftBefore={currentModalMatch?.statsMeta?.before?.[statsLeftTeam?.id]}
                            rightBefore={currentModalMatch?.statsMeta?.before?.[statsRightTeam?.id]}
                            leftOpen={modalStatsPanels.left}
                            rightOpen={modalStatsPanels.right}
                            onToggleLeft={() => toggleModalStatsPanel("left")}
                            onToggleRight={() => toggleModalStatsPanel("right")}
                            leftRowNotes={buildStatRowNotes(statActivation?.left)}
                            rightRowNotes={buildStatRowNotes(statActivation?.right)}
                        />
                    );
                })()}
            </div>

            <AnimatePresence>
                {breakdownSetIndex !== null &&
                    (() => {
                        const {
                            leftTeam: modalPlayedLeft,
                            rightTeam: modalPlayedRight,
                        } = getPickOrientedModalView(
                            currentModalMatch,
                            isBo1Modal
                        );

                        return (
                            <SetBreakdownOverlay
                                sets={currentModalMatch?.setHistory ?? []}
                                index={breakdownSetIndex}
                                onIndexChange={setBreakdownSetIndex}
                                onClose={() => setBreakdownSetIndex(null)}
                                leftTeam={modalPlayedLeft}
                                rightTeam={modalPlayedRight}
                                bestOf={modalBestOf}
                                stageLabel={
                                    modalContext.type !== "playoffs"
                                        ? modalStageSmallLabel
                                        : null
                                }
                                matchTitle={modalTitle}
                                matchNumber={showModalMatchNumber ? modalMatchNumber : null}
                                isPlayoffs={modalContext.type === "playoffs"}
                                pointLabelText={breakdownPointLabel}
                            />
                        );
                    })()}
            </AnimatePresence>
        </motion.div>
    );
}
