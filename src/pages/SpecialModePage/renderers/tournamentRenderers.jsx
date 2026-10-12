import CountUp from "react-countup";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaCircle, FaCheck, FaXmark } from "react-icons/fa6";
import { PemPlayoffsLayout, QualifierBracketLayout, PemGroupBracketLayout, PemStage1BracketLayout, EclBracketLayout } from "../components/BracketLayouts.jsx";
import { QualifierBadge } from "../components/QualifierBadge.jsx";
import { QualifierGroupNav } from "../components/QualifierGroupNav.jsx";
import { StickyBelow } from "../components/StickyBelow.jsx";
import { PlaceholderRect, MatchRect, SwissResultBox } from "../components/SwissMatch.jsx";
import { getMatchWinnerTeam, getMatchLoserTeam } from "../logic/brackets.js";
import { isCstGroupFinished, getCstStandings, CST_GROUPS, canOpenCstGroupMatch } from "../logic/cst.js";
import { eclSlotSource, canOpenEclMatch, getBestOfForEcl, isSingleEclStage, findCurrentEclMatch, findNextEclMatch } from "../logic/ecl.jsx";
import { isPemPlayoffsKind, pemGroupSlotSource, canOpenPemGroupMatch, getBestOfForPemGroup, isSinglePemGroupStage, findCurrentPemGroupMatch, findNextPemGroupMatch } from "../logic/pemSeries.jsx";
import { pemStage1SlotSource, canOpenPemStage1Match, getBestOfForPemStage1, isSinglePemStage1Stage, findCurrentPemStage1Match, findNextPemStage1Match } from "../logic/pemStage1.jsx";
import { canOpenPlayoffsMatch, getBestOfForPlayoffs } from "../logic/playoffs.js";
import { qualifierSlotSource, canOpenQualifierMatch, getBestOfForQualifier, isSingleQualifierStage, findCurrentQualifierMatch, findNextQualifierMatch } from "../logic/qualifier.jsx";
import { getQualifiedBy, getEliminatedBy, getBo1Tiebreak } from "../logic/series.js";
import { isNetUnlocked, teamsInNet, getBestOfForSwissNet } from "../logic/swiss.js";

export function createTournamentRenderers({
    pemLabel,
    navRef,
    viewPhase,
    indicator,
    activePhase,
    setViewPhase,
    tournamentLabel,
    isReadOnlyView,
    getSwissNetHighlights,
    isMatchRectLocked,
    openSwissMatchModal,
    playoffs,
    currentPlayablePlayoffsMatch,
    nextPlayoffsMatch,
    openPlayoffsMatchModal,
    openQualifierMatchModal,
    openArchivedQualifierMatchModal,
    openPemGroupMatchModal,
    openArchivedPemGroupMatchModal,
    openEclMatchModal,
    openArchivedEclMatchModal,
    openPemStage1MatchModal,
    openArchivedPemStage1MatchModal,
    isPemPlayoffs,
    isPemBigSeries,
    pemMain,
    tournamentResults,
    showPickemLine2,
    neededPickemPoints,
    hover,
    handleBackToHome,
    handleBackToSpecialStart,
    handleBackToGambling,
    pemGroupView,
    setPemGroupView,
    pemStage1,
    setShowPickemSummary,
    setHover,
    setShowWinnersScreen,
    eclLabel,
    handlePemProceedToNextEvent,
    ecl,
    qualifierGroupView,
    setQualifierGroupView,
    qualifier,
    openArchivedCstGroupMatchModal,
    openCstGroupMatchModal,
    isCstPlayoffs,
    cstLabel,
    cst,
}) {
    const renderQualifierTitle = ({ badgeHeight = 34, fontSize, label = pemLabel, gap = 6 } = {}) => (
        <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap, fontSize }}>
            <QualifierBadge height={badgeHeight} />
            <span>{label}</span>
        </span>
    );


    const renderResultsNav = () => {
        const phases = [
            {
                id: "playoffs",
                results: "results_playoffs",
                activeLabel: "Playoffs",
                resultsLabel: "Results of Playoffs",
            },
            {
                id: "stage3",
                results: "results_stage3",
                activeLabel: "Stage III",
                resultsLabel: "Results of Stage III",
            },
            {
                id: "stage2",
                results: "results_stage2",
                activeLabel: "Stage II",
                resultsLabel: "Results of Stage II",
            },
            {
                id: "stage1",
                results: "results_stage1",
                activeLabel: "Stage I",
                resultsLabel: "Results of Stage I",
            },
        ];

        const unlocked = phases.filter((phase) => {
            switch (phase.id) {
                case "playoffs":
                    return activePhase === "playoffs";

                case "stage3":
                    return activePhase === "stage3" || activePhase === "playoffs";

                case "stage2":
                    return (
                        activePhase === "stage2" ||
                        activePhase === "stage3" ||
                        activePhase === "playoffs"
                    );

                case "stage1":
                    return true;

                default:
                    return false;
            }
        });

        if (unlocked.length === 1 && unlocked[0].id === "stage1") {
            return null;
        }

        return (
            <div
                ref={navRef}
                style={{
                    position: "absolute",
                    top: "10%",
                    right: "98%",
                    zIndex: 5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 10,
                    transition: "none",
                    marginRight:
                        viewPhase === "playoffs" ||
                            viewPhase === "results_playoffs"
                            ? 86
                            : 0,
                }}
            >
                {unlocked.map((phase) => {
                    const viewingCurrent =
                        viewPhase === phase.id;

                    const viewingResults =
                        phase.results &&
                        viewPhase === phase.results;

                    const isLivePhase = activePhase === phase.id;

                    const label = isLivePhase
                        ? phase.activeLabel
                        : phase.resultsLabel ?? phase.activeLabel;

                    return (
                        <button
                            key={phase.id}
                            data-results-active={viewingCurrent || viewingResults}
                            onClick={() =>
                                setViewPhase(
                                    viewingCurrent
                                        ? phase.results ?? phase.id
                                        : phase.id
                                )
                            }
                            className={`${css.resultsNavigationButton} ${viewingCurrent || viewingResults
                                ? css.resultsNavigationButtonActive
                                : ""
                                }`}
                        >
                            {label}
                        </button>
                    );
                })}
                <motion.div
                    className={css.resultsNavigationIndicator}
                    initial={false}
                    animate={{
                        top: indicator.top,
                        height: indicator.height,
                    }}
                    transition={{
                        type: "tween",
                        stiffness: 300,
                        damping: 60,
                    }}
                />
            </div>
        );
    };

    const getStageTitleForView = () => {
        if (viewPhase === "stage1")
            return <>{tournamentLabel} | Stage I</>;

        if (viewPhase === "stage2")
            return <>{tournamentLabel} | Stage II</>;

        if (viewPhase === "stage3")
            return <>{tournamentLabel} | Stage III</>;

        if (viewPhase === "playoffs")
            return <>{tournamentLabel} | Playoffs</>;

        if (viewPhase === "results_stage1")
            return <>{tournamentLabel} | Stage I</>;

        if (viewPhase === "results_stage2")
            return <>{tournamentLabel} | Stage II</>;

        if (viewPhase === "results_stage3")
            return <>{tournamentLabel} | Stage III</>;

        return null;
    };

    const canOpenSwissMatch = (stageObj, net, match) => {
        if (!stageObj || !match || !match.slotA || !match.slotB) return false;

        const unlocked = isNetUnlocked(stageObj, net);

        if (isReadOnlyView) return !!match.played;

        if (!unlocked) return false;
        if (match.played) return false;

        const arr = stageObj.matchesByNet[net] || [];
        const index = arr.findIndex((m) => m.id === match.id);
        for (let i = 0; i < index; i++) {
            if (!arr[i].played) return false;
        }

        return true;
    };

    const buildLockedPlaceholdersForNet = (net) => {
        const defaultCountByNet = {
            "0:0": 16,
            "1:0": 8,
            "0:1": 8,
            "2:0": 4,
            "1:1": 8,
            "0:2": 4,
            "2:1": 6,
            "1:2": 6,
            "2:2": 6,
        };

        const count = defaultCountByNet[net] || 4;

        return Array.from({ length: count }, (_, i) => ({
            id: `locked-${net}-${i}`,
            slotA: null,
            slotB: null,
            played: false,
            scoreLeft: null,
            scoreRight: null,
            pickTeamId: null,
            winnerTeamId: null,
            loserTeamId: null,
        }));
    };

    const getPlaceholderHeightForNet = (net) => {
        const map = {
            "1:0": '312px',
            "0:1": '312px',

            "2:0": '152px',
            "1:1": '312px',
            "0:2": '152px',

            "2:1": '232px',
            "1:2": '232px',

            "2:2": '232px',
        };

        return map[net] ?? 180;
    };

    const renderSwissColumn = (stageObj, nets) => {
        return (
            <div className={css.net_column_container} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {nets.map((net) => {
                    const unlocked = stageObj ? isNetUnlocked(stageObj, net) : false;
                    const matches = stageObj?.matchesByNet?.[net] || [];
                    const placeholderTeams = stageObj ? teamsInNet(stageObj, net) : [];

                    const lockedRects =
                        !unlocked && placeholderTeams.length !== 0;

                    const { currentId, nextId } =
                        unlocked && !isReadOnlyView
                            ? getSwissNetHighlights(stageObj, net)
                            : { currentId: null, nextId: null };

                    return (
                        <div key={net} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                            <span className={css.net_label} style={{ fontWeight: 700 }}>
                                {net}
                            </span>

                            <div className={css.net_stack}>
                                <div className={css.net_base}>
                                    {(unlocked ? matches : buildLockedPlaceholdersForNet(net)).map((m, idx, arr) => {
                                        const isClickable = unlocked && !isMatchRectLocked && (m.played || canOpenSwissMatch(stageObj, net, m));

                                        const highlightClass =
                                            unlocked && m.id === currentId ? css.match_current :
                                                unlocked && m.id === nextId ? css.match_next :
                                                    "";

                                        const isFirst = idx === 0;
                                        const isLast = idx === arr.length - 1;

                                        const isUnfilled = !m.slotA || !m.slotB;
                                        const notStartedEdge = isUnfilled && !m.played && (isFirst || isLast);

                                        return (
                                            <MatchRect
                                                key={m.id}
                                                match={m}
                                                bestOf={getBestOfForSwissNet(net, stageObj.stageKey)}
                                                shouldBestOfBeShown={!unlocked && lockedRects}
                                                isClickable={isClickable}
                                                isButtonLocked={!unlocked || isMatchRectLocked}
                                                shouldPlaceholderCirclesBeRendered={!unlocked && lockedRects}
                                                onClick={
                                                    unlocked
                                                        ? () => openSwissMatchModal(stageObj.stageKey, net, m.id, isReadOnlyView)
                                                        : () => { }
                                                }
                                                className={highlightClass}
                                                dataNet={net}
                                                dataIdx={idx + 1}
                                                dataPos={idx === 0 ? "first" : idx === arr.length - 1 ? "last" : undefined}
                                                dataNotStarted={notStartedEdge ? "true" : undefined}
                                            />
                                        );
                                    })}
                                </div>

                                {!unlocked && lockedRects && (
                                    <div className={css.net_overlay}>
                                        <PlaceholderRect height={getPlaceholderHeightForNet(net)} teams={placeholderTeams} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderSwissBracket = (stageObj) => {
        if (!stageObj) {
            return (
                <div style={{ opacity: 0.75, textAlign: "center", marginTop: 40 }}>
                    This stage has not started yet.
                </div>
            );
        }

        const q30 = getQualifiedBy(stageObj, "3:0");
        const q31 = getQualifiedBy(stageObj, "3:1");
        const q32 = getQualifiedBy(stageObj, "3:2");

        const e03 = getEliminatedBy(stageObj, "0:3");
        const e13 = getEliminatedBy(stageObj, "1:3");
        const e23 = getEliminatedBy(stageObj, "2:3");

        return (
            <div style={{ position: "relative", display: "flex", marginBottom: '48px', marginLeft: '156px', alignItems: "center", justifyContent: "center", transition: "none" }}>
                <div style={{ position: 'absolute', left: '47.05%', top: '-13px' }}>
                    <SwissResultBox title="3:0" tone="green" teams={q30} />
                </div>
                <div style={{ position: 'absolute', left: '62.5%', top: '-13px' }}>
                    <SwissResultBox title="3:1" tone="green" teams={q31} />
                </div>
                <div style={{ position: 'absolute', left: '70.2%', top: '-13px' }}>
                    <SwissResultBox title="3:2" tone="green" teams={q32} />
                </div>
                <div style={{ position: 'absolute', left: '47.05%', bottom: '-25px' }}>
                    <SwissResultBox title="0:3" tone="red" teams={e03} />
                </div>
                <div style={{ position: 'absolute', left: '62.5%', bottom: '-25px' }}>
                    <SwissResultBox title="1:3" tone="red" teams={e13} />
                </div>
                <div style={{ position: 'absolute', left: '70.2%', bottom: '-25px' }}>
                    <SwissResultBox title="2:3" tone="red" teams={e23} />
                </div>

                <div style={{ display: "flex", gap: 60, alignItems: "center", paddingRight: 250, transition: "none" }}>
                    {renderSwissColumn(stageObj, ["0:0"])}
                    {renderSwissColumn(stageObj, ["1:0", "0:1"])}
                    {renderSwissColumn(stageObj, ["2:0", "1:1", "0:2"])}
                    {renderSwissColumn(stageObj, ["2:1", "1:2"])}
                    {renderSwissColumn(stageObj, ["2:2"])}
                </div>
            </div>
        );
    };

    const renderPlayoffsBracket = () => {
        if (!playoffs) {
            return (
                <div style={{ opacity: 0.75, textAlign: "center", marginTop: 40 }}>
                    Playoffs are not built yet.
                </div>
            );
        }

        const getTeamById = (id, a, b) => {
            if (!id) return null;
            if (a?.id === id) return a;
            if (b?.id === id) return b;
            return null;
        };

        const getWinnerTeam = (m) => {
            if (!m?.played) return null;
            return getTeamById(m.winnerTeamId, m.slotA, m.slotB);
        };

        const getLoserTeam = (m) => {
            if (!m?.played) return null;
            return getTeamById(m.loserTeamId, m.slotA, m.slotB);
        };

        const bracketKind = playoffs.kind ?? null;
        const hasRoundOf16 = (playoffs.ro16?.length ?? 0) > 0;

        const currentStageKey = currentPlayablePlayoffsMatch?.stage ?? null;

        const nextStageKey =
            currentStageKey === "ro16" ? "qf"
                : currentStageKey === "qf" ? "sf"
                    : currentStageKey === "sf" ? "gf"
                        : null;

        const isNextStage = (stageKey) => {
            if (!currentStageKey) return false;
            if (stageKey === nextStageKey) return true;
            if (currentStageKey === "sf" && stageKey === "thirdPlace") return true;
            return false;
        };

        const contendersForSlot = (stageKey, idx, slotKey) => {
            if (!playoffs) return [];

            const pickFromMatch = (m, want) => {
                if (!m) return [];

                if (m.played) {
                    const t = want === "winner" ? getWinnerTeam(m) : getLoserTeam(m);
                    return t ? [t] : [];
                }

                return [m.slotA, m.slotB].filter(Boolean);
            };

            if (stageKey === "qf") {
                const srcIdx = idx * 2 + (slotKey === "slotA" ? 0 : 1);
                return pickFromMatch(playoffs.ro16[srcIdx], "winner");
            }

            if (stageKey === "sf" && isPemPlayoffsKind(bracketKind)) {
                return slotKey === "slotB" ? pickFromMatch(playoffs.qf[idx], "winner") : [];
            }

            if (stageKey === "sf") {
                const srcIdx = idx * 2 + (slotKey === "slotA" ? 0 : 1);
                return pickFromMatch(playoffs.qf[srcIdx], "winner");
            }

            if (stageKey === "gf") {
                const srcIdx = slotKey === "slotA" ? 0 : 1;
                return pickFromMatch(playoffs.sf[srcIdx], "winner");
            }

            if (stageKey === "thirdPlace") {
                const srcIdx = slotKey === "slotA" ? 0 : 1;
                return pickFromMatch(playoffs.sf[srcIdx], "loser");
            }

            return [];
        };

        const PlaceholderWithContenders = ({ stageKey, idx, slotKey }) => {
            const contenders = contendersForSlot(stageKey, idx, slotKey);

            if (!contenders.length) {
                return <div style={{ fontSize: "20px" }} className={css.placeholder_circle}>?</div>;
            }

            const isThirdPlace = stageKey === "thirdPlace";
            const prefix = isThirdPlace ? "Loser of" : "Winner of";

            const nameA = contenders[0]?.name ? `Team ${contenders[0].name}` : "TBD";
            const nameB = contenders[1]?.name ? `Team ${contenders[1].name}` : "TBD";
            const matchupText = `${nameA} VS ${nameB}`;

            const Mini = ({ team, pos }) => {
                const common = {
                    position: "absolute",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    boxShadow: "0 0 3px rgba(0,0,0,0.4)",
                    opacity: 0.75,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "#fff",
                    textShadow: "0 0 3px rgba(0,0,0,0.8)",
                    userSelect: "none",
                    ...(pos === "tl" ? { top: 5, left: 5 } : { bottom: 5, right: 5 }),
                };

                if (!team) {
                    return (
                        <div
                            style={{
                                ...common,
                                background: "rgba(0,0,0,0.25)",
                                border: "1px solid rgba(255,255,255,0.35)",
                                fontStyle: 'italic',
                            }}
                        >
                            ?
                        </div>
                    );
                }

                return (
                    <div
                        style={{
                            ...common,
                            background: team.color,
                        }}
                    />
                );
            };

            return (
                <div
                    className={css.placeholder_circle}
                    style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    title={`${prefix} '${matchupText}' match-up`}
                >
                    <Mini team={contenders[0] ?? null} pos="tl" />

                    <Mini team={contenders[1] ?? null} pos="br" />

                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            opacity: 0.75,
                            pointerEvents: "none",
                            fontStyle: "italic",
                            userSelect: "none",
                        }}
                    >
                        vs
                    </span>
                </div>
            );
        };

        const stageIndex = (k) => {
            if (k === "ro16") return 0;
            if (k === "qf") return 1;
            if (k === "sf") return 2;
            if (k === "thirdPlace") return 3;
            if (k === "gf") return 3;
            return 999;
        };

        const hasStageStarted = (stageKey) => {
            if (!currentStageKey) return false;
            return stageIndex(stageKey) <= stageIndex(currentStageKey);
        };

        const hasPreviewContenders = (stageKey, idx) => {
            const getMatch = () => {
                if (!playoffs) return null;
                if (stageKey === "ro16") return playoffs.ro16?.[idx] ?? null;
                if (stageKey === "qf") return playoffs.qf?.[idx] ?? null;
                if (stageKey === "sf") return playoffs.sf?.[idx] ?? null;
                if (stageKey === "thirdPlace") return playoffs.thirdPlace?.[idx] ?? null;
                if (stageKey === "gf") return playoffs.gf?.[idx] ?? null;
                return null;
            };

            const m = getMatch();
            if (m?.slotA || m?.slotB) return true;

            const a = contendersForSlot(stageKey, idx, "slotA");
            const b = contendersForSlot(stageKey, idx, "slotB");
            return (a?.length ?? 0) > 0 || (b?.length ?? 0) > 0;
        };

        const renderMatch = (m, stageKey, idx, baseClass, nextRect, bestOf, connectorStyle, isSingularMatch, pemLayout = false) => {
            const isPlayed = !!m.played;

            const isUserWin =
                isPlayed &&
                m.pickTeamId &&
                m.winnerTeamId &&
                m.pickTeamId === m.winnerTeamId;

            const shouldSwap =
                !!m.pickTeamId &&
                m.slotA &&
                m.slotB &&
                m.pickTeamId === m.slotB.id;

            const leftTeam = shouldSwap ? m.slotB : m.slotA;
            const rightTeam = shouldSwap ? m.slotA : m.slotB;

            const rawLeftScore = m.scoreLeft;
            const rawRightScore = m.scoreRight;

            const displayScoreLeft = shouldSwap ? rawRightScore : rawLeftScore;
            const displayScoreRight = shouldSwap ? rawLeftScore : rawRightScore;

            const resultClass = isPlayed ? (isUserWin ? css.playoffs_match_win : css.playoffs_match_loss) : "";

            const boLabelResultClass = isPlayed
                ? isUserWin
                    ? css.playoffs_match_win_label
                    : css.playoffs_match_loss_label
                : "";

            const noLabelResultClass = isPlayed
                ? isUserWin
                    ? css.playoffs_match_win_no_label
                    : css.playoffs_match_loss_no_label
                : "";

            const isCurrent =
                !!currentPlayablePlayoffsMatch &&
                currentPlayablePlayoffsMatch.stage === stageKey &&
                currentPlayablePlayoffsMatch.index === idx;

            const isNext =
                !!nextPlayoffsMatch &&
                nextPlayoffsMatch.stage === stageKey &&
                nextPlayoffsMatch.index === idx;

            const winnerIsLeft =
                isPlayed && m.winnerTeamId && leftTeam && m.winnerTeamId === leftTeam.id;
            const winnerIsRight =
                isPlayed && m.winnerTeamId && rightTeam && m.winnerTeamId === rightTeam.id;

            const isLeftLoser =
                isPlayed && m.loserTeamId && leftTeam && m.loserTeamId === leftTeam.id;
            const isRightLoser =
                isPlayed && m.loserTeamId && rightTeam && m.loserTeamId === rightTeam.id;

            const isClickable =
                !isMatchRectLocked &&
                (isReadOnlyView ? !!m.played : (m.played || canOpenPlayoffsMatch(playoffs, stageKey, idx)));

            const stageStarted = hasStageStarted(stageKey);
            const previewExists = hasPreviewContenders(stageKey, idx);

            const canClick =
                !isMatchRectLocked &&
                (m.played || (stageStarted && isClickable));

            const canHover =
                !isMatchRectLocked &&
                (canClick || (!stageStarted && previewExists));

            return (
                <div key={m.id} className={connectorStyle}>
                    <div
                        data-bracket-rect={pemLayout ? `${stageKey}-${idx}` : undefined}
                        className={`${baseClass} ${isMatchRectLocked || isNextStage(stageKey) ? nextRect : ""
                            } ${resultClass} ${isCurrent ? css.match_current : ""} ${isNext ? css.match_next : ""} ${canHover ? baseClass : css.no_hover
                            }`}
                        style={{
                            pointerEvents: canHover ? "auto" : "none",
                            cursor: canClick || isPlayed ? "pointer" : canHover ? "default" : "default",
                            borderColor: isPlayed ? (isUserWin ? "#2e7d32" : "#7d2e2e") : ""
                        }}
                        onClick={() => {
                            if (!canClick) return;
                            openPlayoffsMatchModal(stageKey, m.id, isReadOnlyView);
                        }}
                    >
                        {isPlayed && (
                            isUserWin ? (
                                <div className={css.playoffsSuccessPickemIndicator}>
                                    <FaCircle size={28} color="#37b737" />
                                    <FaCheck size={16} color="#ffffff" />
                                </div>
                            ) : (
                                <div className={css.playoffsSuccessPickemIndicator}>
                                    <FaCircle size={28} color="#be3939" />
                                    <FaXmark size={16} color="#fff" />
                                </div>
                            )
                        )}
                        <div
                            className={`${stageKey === "thirdPlace" ? css.bo_thirdPlaceDecider_label : css.bo_playoffs_label} ${boLabelResultClass}`}
                            style={isCurrent ? { outline: '2px solid #ffd700', border: 'none', boxShadow: '0 0 12px rgba(255, 215, 0, 0.9)' } : isNext ? { outline: '2px dashed #888', border: 'none', boxShadow: '0 0 12px rgba(160, 160, 160, 0.43)' } : {}}
                        >
                            BO{bestOf}
                        </div>
                        {!isSingularMatch ? (
                            <div
                                className={`${css.no_playoffs_label} ${noLabelResultClass}`}
                                style={isCurrent ? { outline: '2px solid #ffd700', border: 'none', boxShadow: '0 0 12px rgba(255, 215, 0, 0.9)' } : isNext ? { outline: '2px dashed #888', border: 'none', boxShadow: '0 0 12px rgba(160, 160, 160, 0.43)' } : {}}
                            >
                                #{idx + 1}
                            </div>
                        ) : null}
                        <div className={css.match_content}>
                            <div className={css.team_row}>
                                <div className={css.team_cell}>
                                    {leftTeam ? (
                                        <div
                                            className={css.team_circle}
                                            style={{ background: leftTeam.color }}
                                            title={`Team ${leftTeam.name}`}
                                        />
                                    ) : (
                                        <PlaceholderWithContenders
                                            stageKey={stageKey}
                                            idx={idx}
                                            slotKey="slotA"
                                        />
                                    )}
                                </div>

                                <div
                                    style={{ color: !isPlayed ? "" : winnerIsLeft ? "#2e7d32" : "red" }}
                                    className={css.team_name_placeholder}
                                >
                                    {leftTeam?.name ? `Team ${leftTeam?.name}` : "TBD"}
                                </div>
                                <span
                                    style={{
                                        color: winnerIsLeft ? "#2e7d32" : "red",
                                        fontWeight: 800,
                                        fontStyle: "italic",
                                        position: "absolute",
                                        left: "85%",
                                        zIndex: 1,
                                        fontSize: 72,
                                        opacity: isLeftLoser ? 0.4 : 1
                                    }}
                                    className={winnerIsLeft ? css.winnerScoreShadow : css.loserScoreShadow}
                                >
                                    {displayScoreLeft}
                                </span>
                            </div>

                            <div className={css.vs_row}>
                                <div style={{ backgroundColor: isPlayed ? (isUserWin ? "#2e7d32" : "red") : "rgb(90, 90, 90)" }} className={css.divider} />
                                {!isPlayed || m.scoreLeft == null || m.scoreRight == null ? (
                                    <span
                                        style={{
                                            textShadow: `
                                                1px 0 #d8d8d8,
                                                -1px 0 #d8d8d8,
                                                0 1px #d8d8d8,
                                                0 -1px #d8d8d8,
                                                1px 1px #d8d8d8,
                                                1px -1px #d8d8d8,
                                                -1px 1px #d8d8d8,
                                                -1px -1px #d8d8d8,
                                                2px 0 #5a5a5a,
                                                -2px 0 #5a5a5a,
                                                0 2px #5a5a5a,
                                                0 -2px #5a5a5a,
                                                2px 2px #5a5a5a,
                                                2px -2px #5a5a5a,
                                                -2px 2px #5a5a5a,
                                                -2px -2px #5a5a5a,
                                                2px 0 #5a5a5a,
                                                -2px 0 #5a5a5a
                                            `,
                                        }}
                                        className={css.vs_text}
                                    >
                                        VS
                                    </span>
                                ) : null}
                            </div>

                            <div className={css.team_row}>
                                <div className={css.team_cell}>
                                    {rightTeam ? (
                                        <div
                                            className={css.team_circle}
                                            style={{ background: rightTeam.color }}
                                            title={`Team ${rightTeam.name}`}
                                        />
                                    ) : (
                                        <PlaceholderWithContenders
                                            stageKey={stageKey}
                                            idx={idx}
                                            slotKey="slotB"
                                        />
                                    )}
                                </div>

                                <div
                                    style={{ color: !isPlayed ? "" : winnerIsRight ? "#2e7d32" : "red" }}
                                    className={css.team_name_placeholder}
                                >
                                    {rightTeam?.name ? `Team ${rightTeam?.name}` : "TBD"}
                                </div>
                                <span
                                    style={{
                                        color: winnerIsRight ? "#2e7d32" : "red",
                                        fontWeight: 800,
                                        fontStyle: "italic",
                                        position: "absolute",
                                        left: "83%",
                                        zIndex: 1,
                                        fontSize: 72,
                                        opacity: isRightLoser ? 0.4 : 1
                                    }}
                                    className={winnerIsRight ? css.winnerScoreShadow : css.loserScoreShadow}
                                >
                                    {displayScoreRight}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        if (isPemPlayoffsKind(bracketKind)) {
            const pemRectClasses = {
                qf: css.quarters_rect,
                sf: css.semis_rect,
                thirdPlace: css.thirdPlace_rect,
                gf: css.grandFinal_rect,
            };

            return (
                <PemPlayoffsLayout
                    bracket={playoffs}
                    renderMatch={(m, stageKey, idx) =>
                        renderMatch(
                            m,
                            stageKey,
                            idx,
                            pemRectClasses[stageKey],
                            css.next_rect,
                            getBestOfForPlayoffs(stageKey, bracketKind),
                            css.pem_playoffs_wrapper,
                            stageKey === "gf" || stageKey === "thirdPlace",
                            true
                        )
                    }
                />
            );
        }

        const connectorWrapperFor = (stageKey, idx) => {
            const level = hasRoundOf16 ? stageKey : ({ qf: "ro16", sf: "qf" }[stageKey] ?? stageKey);
            const down = idx % 2 === 0;
            if (level === "ro16") return down ? css.ro16ConnectorWrapper_down : css.ro16ConnectorWrapper_up;
            if (level === "qf") return down ? css.qfConnectorWrapper_down : css.qfConnectorWrapper_up;
            return down ? css.sfConnectorWrapper_down : css.sfConnectorWrapper_up;
        };

        const thirdPlaceColumn = playoffs.thirdPlace ? (
            <div
                className={css.thirdPlace_container}
                style={hasRoundOf16 ? undefined : { top: "calc(100% + 28px)", left: "50%", transform: "translateX(-50%)", marginTop: 0 }}
            >
                <h4 style={{ width: '17ch' }} className={css.column_title}>Third Place Decider</h4>
                <div className={css.columnThirdPlace}>
                    {playoffs.thirdPlace.map((m, idx) =>
                        renderMatch(
                            m,
                            "thirdPlace",
                            idx,
                            css.thirdPlace_rect,
                            css.next_rect,
                            getBestOfForPlayoffs("thirdPlace", bracketKind),
                            css.thirdPlaceDeciderConnectorWrapper,
                            true
                        )
                    )}
                </div>
            </div>
        ) : null;

        return (
            <div className={css.bracket_container} style={{ transition: "none", marginLeft: hasRoundOf16 ? '28px' : 0 }}>
                <div className={css.bracket_inner}>
                    {hasRoundOf16 && (
                        <div className={css.column_container}>
                            <h4 className={css.column_title}>Round of 16</h4>
                            <div className={css.columnRo16}>
                                {playoffs.ro16.map((m, idx) =>
                                    renderMatch(
                                        m,
                                        "ro16",
                                        idx,
                                        css.match_rect,
                                        css.next_rect,
                                        getBestOfForPlayoffs("ro16", bracketKind),
                                        idx % 2 === 0 ? css.ro16ConnectorWrapper_down : css.ro16ConnectorWrapper_up,
                                        false
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    <div className={css.column_container}>
                        <h4 className={css.column_title}>Quarterfinals</h4>
                        <div className={hasRoundOf16 ? css.columnQuarters : css.columnRo16}>
                            {playoffs.qf.map((m, idx) =>
                                renderMatch(
                                    m,
                                    "qf",
                                    idx,
                                    css.quarters_rect,
                                    css.next_rect,
                                    getBestOfForPlayoffs("qf", bracketKind),
                                    connectorWrapperFor("qf", idx),
                                    false
                                )
                            )}
                        </div>
                    </div>

                    <div className={css.column_container}>
                        <h4 className={css.column_title}>Semifinals</h4>
                        <div className={hasRoundOf16 ? css.columnSemis : css.columnQuarters}>
                            {playoffs.sf.map((m, idx) =>
                                renderMatch(
                                    m,
                                    "sf",
                                    idx,
                                    css.semis_rect,
                                    css.next_rect,
                                    getBestOfForPlayoffs("sf", bracketKind),
                                    connectorWrapperFor("sf", idx),
                                    false
                                )
                            )}
                        </div>
                    </div>

                    <div className={css.column_container} style={hasRoundOf16 ? undefined : { position: "relative" }}>
                        <h4 className={css.column_title}>Grand Final</h4>
                        <div className={css.columnGrandFinal}>
                            {playoffs.gf.map((m, idx) =>
                                renderMatch(
                                    m,
                                    "gf",
                                    idx,
                                    css.grandFinal_rect,
                                    css.next_rect,
                                    getBestOfForPlayoffs("gf", bracketKind),
                                    css.gfConnectorWrapper,
                                    true
                                )
                            )}
                        </div>
                        {!hasRoundOf16 && thirdPlaceColumn}
                    </div>

                    {hasRoundOf16 && thirdPlaceColumn}
                </div>
            </div>
        );
    };

    const QUALIFIER_VS_TEXT_SHADOW = `
        1px 0 #d8d8d8,
        -1px 0 #d8d8d8,
        0 1px #d8d8d8,
        0 -1px #d8d8d8,
        1px 1px #d8d8d8,
        1px -1px #d8d8d8,
        -1px 1px #d8d8d8,
        -1px -1px #d8d8d8,
        2px 0 #5a5a5a,
        -2px 0 #5a5a5a,
        0 2px #5a5a5a,
        0 -2px #5a5a5a,
        2px 2px #5a5a5a,
        2px -2px #5a5a5a,
        -2px 2px #5a5a5a,
        -2px -2px #5a5a5a,
        2px 0 #5a5a5a,
        -2px 0 #5a5a5a
    `;

    const qualifierMatchFormat = {
        slotSource: qualifierSlotSource,
        canOpen: canOpenQualifierMatch,
        bestOf: getBestOfForQualifier,
        isSingle: isSingleQualifierStage,
        open: openQualifierMatchModal,
        openArchived: openArchivedQualifierMatchModal,
    };

    const pemGroupMatchFormat = {
        slotSource: pemGroupSlotSource,
        canOpen: canOpenPemGroupMatch,
        bestOf: getBestOfForPemGroup,
        isSingle: isSinglePemGroupStage,
        open: openPemGroupMatchModal,
        openArchived: openArchivedPemGroupMatchModal,
    };

    const eclMatchFormat = {
        slotSource: eclSlotSource,
        canOpen: canOpenEclMatch,
        bestOf: getBestOfForEcl,
        isSingle: isSingleEclStage,
        open: openEclMatchModal,
        openArchived: openArchivedEclMatchModal,
    };

    const pemStage1MatchFormat = {
        slotSource: pemStage1SlotSource,
        canOpen: canOpenPemStage1Match,
        bestOf: getBestOfForPemStage1,
        isSingle: isSinglePemStage1Stage,
        open: openPemStage1MatchModal,
        openArchived: openArchivedPemStage1MatchModal,
    };

    const getQualifierSlotContenders = (bracket, stage, idx, slotKey, slotSource = qualifierSlotSource) => {
        const source = slotSource(stage, idx, slotKey);
        const sourceMatch = source ? bracket?.[source.stage]?.[source.idx] : null;
        if (!sourceMatch) return { source, sourceMatch: null, contenders: [] };

        const contenders = sourceMatch.played
            ? [source.want === "winner" ? getMatchWinnerTeam(sourceMatch) : getMatchLoserTeam(sourceMatch)].filter(Boolean)
            : [sourceMatch.slotA, sourceMatch.slotB].filter(Boolean);

        return { source, sourceMatch, contenders };
    };

    const renderQualifierPlaceholder = (bracket, stage, idx, slotKey, slotSource = qualifierSlotSource) => {
        const { source, sourceMatch, contenders } = getQualifierSlotContenders(bracket, stage, idx, slotKey, slotSource);

        if (!contenders.length) {
            return <div style={{ fontSize: "20px" }} className={css.placeholder_circle}>?</div>;
        }

        const prefix = source?.want === "loser" ? "Loser of" : "Winner of";
        const teamA = sourceMatch?.slotA ?? null;
        const teamB = sourceMatch?.slotB ?? null;
        const matchupText = `${teamA?.name ? `Team ${teamA.name}` : "TBD"} VS ${teamB?.name ? `Team ${teamB.name}` : "TBD"}`;

        const mini = (team, pos) => {
            const common = {
                position: "absolute",
                width: 14,
                height: 14,
                borderRadius: "50%",
                boxShadow: "0 0 3px rgba(0,0,0,0.4)",
                opacity: 0.75,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 800,
                lineHeight: 1,
                color: "#fff",
                textShadow: "0 0 3px rgba(0,0,0,0.8)",
                userSelect: "none",
                ...(pos === "tl" ? { top: 5, left: 5 } : { bottom: 5, right: 5 }),
            };

            if (!team) {
                return (
                    <div
                        style={{
                            ...common,
                            background: "rgba(0,0,0,0.25)",
                            border: "1px solid rgba(255,255,255,0.35)",
                            fontStyle: "italic",
                        }}
                    >
                        ?
                    </div>
                );
            }

            return <div style={{ ...common, background: team.color }} />;
        };

        return (
            <div
                className={css.placeholder_circle}
                style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
                title={`${prefix} '${matchupText}' match-up`}
            >
                {mini(teamA, "tl")}
                {mini(teamB, "br")}
                <span
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        opacity: 0.75,
                        pointerEvents: "none",
                        fontStyle: "italic",
                        userSelect: "none",
                    }}
                >
                    vs
                </span>
            </div>
        );
    };

    const renderQualifierMatch = (bracket, m, stage, idx, { archived = false, record = null, current = null, next = null, format = qualifierMatchFormat } = {}) => {
        const isPlayed = !!m.played;

        const isUserWin =
            isPlayed &&
            !!m.pickTeamId &&
            !!m.winnerTeamId &&
            m.pickTeamId === m.winnerTeamId;

        const shouldSwap =
            !!m.pickTeamId &&
            m.slotA &&
            m.slotB &&
            m.pickTeamId === m.slotB.id;

        const leftTeam = shouldSwap ? m.slotB : m.slotA;
        const rightTeam = shouldSwap ? m.slotA : m.slotB;

        const isBo1 = format.bestOf(stage) === 1;
        const bo1History = isBo1 && isPlayed && m.pickTeamId ? m.setHistory?.[0] ?? null : null;
        const bo1Tiebreak = getBo1Tiebreak(bo1History);

        const displayScoreLeft = bo1History ? bo1History.wins : shouldSwap ? m.scoreRight : m.scoreLeft;
        const displayScoreRight = bo1History ? bo1History.losses : shouldSwap ? m.scoreLeft : m.scoreRight;
        const isBo1Tie = !!bo1History && bo1History.wins === bo1History.losses;
        const isCornerScore = (score) => isBo1 && String(score ?? "").length > 1;
        const scorePositions = [
            isCornerScore(displayScoreLeft) ? { top: 4, right: -4 } : { left: "85%" },
            isCornerScore(displayScoreRight) ? { bottom: 4, right: -4 } : { left: "83%" },
        ];

        const resultClass = isPlayed ? (isUserWin ? css.playoffs_match_win : css.playoffs_match_loss) : "";
        const boLabelResultClass = isPlayed
            ? isUserWin ? css.playoffs_match_win_label : css.playoffs_match_loss_label
            : "";
        const noLabelResultClass = isPlayed
            ? isUserWin ? css.playoffs_match_win_no_label : css.playoffs_match_loss_no_label
            : "";

        const isCurrent = !archived && current?.stage === stage && current?.index === idx;
        const isNext = !archived && next?.stage === stage && next?.index === idx;

        const winnerIsLeft = isPlayed && !!leftTeam && m.winnerTeamId === leftTeam.id;
        const winnerIsRight = isPlayed && !!rightTeam && m.winnerTeamId === rightTeam.id;
        const isLeftLoser = isPlayed && !!leftTeam && m.loserTeamId === leftTeam.id;
        const isRightLoser = isPlayed && !!rightTeam && m.loserTeamId === rightTeam.id;

        const hasPreview =
            !!m.slotA ||
            !!m.slotB ||
            getQualifierSlotContenders(bracket, stage, idx, "slotA", format.slotSource).contenders.length > 0 ||
            getQualifierSlotContenders(bracket, stage, idx, "slotB", format.slotSource).contenders.length > 0;

        const canClick = archived
            ? isPlayed
            : !isMatchRectLocked && (isPlayed || format.canOpen(bracket, stage, idx));
        const canHover = canClick || (!archived && !isMatchRectLocked && hasPreview);

        const labelHighlight = isCurrent
            ? { outline: "2px solid #ffd700", border: "none", boxShadow: "0 0 12px rgba(255, 215, 0, 0.9)" }
            : isNext
                ? { outline: "2px dashed #888", border: "none", boxShadow: "0 0 12px rgba(160, 160, 160, 0.43)" }
                : {};

        const handleClick = () => {
            if (!canClick) return;
            if (archived) {
                format.openArchived(record, bracket.group, stage, idx, m);
                return;
            }
            format.open(bracket.group, stage, m.id);
        };

        const renderTeamRow = (team, slotKey, isWinner, isLoser, score, scorePosition) => (
            <div className={css.team_row}>
                <div className={css.team_cell}>
                    {team ? (
                        <div
                            className={css.team_circle}
                            style={{ background: team.color }}
                            title={`Team ${team.name}`}
                        />
                    ) : (
                        renderQualifierPlaceholder(bracket, stage, idx, slotKey, format.slotSource)
                    )}
                </div>

                <div
                    style={{ color: !isPlayed ? "" : isWinner ? "#2e7d32" : "red" }}
                    className={`${css.team_name_placeholder} ${isCornerScore(score) ? css.bo1_team_name : ""}`}
                >
                    {team?.name ? `Team ${team.name}` : "TBD"}
                </div>
                <span
                    style={{
                        color: isBo1Tie ? "#5a5a5a" : isWinner ? "#2e7d32" : "red",
                        fontWeight: 800,
                        fontStyle: "italic",
                        position: "absolute",
                        ...scorePosition,
                        zIndex: 1,
                        fontSize: isCornerScore(score) ? 40 : 72,
                        lineHeight: isCornerScore(score) ? 1 : undefined,
                        opacity: isLoser && !isBo1Tie ? 0.4 : 1,
                    }}
                    className={isBo1Tie ? css.tieScoreShadow : isWinner ? css.winnerScoreShadow : css.loserScoreShadow}
                >
                    {score}
                </span>
            </div>
        );

        return (
            <div key={m.id} className={css.qualifier_match_wrapper}>
                <div
                    data-bracket-rect={`${stage}-${idx}`}
                    className={`${css.match_rect} ${resultClass} ${isCurrent ? css.match_current : ""} ${isNext ? css.match_next : ""} ${canHover ? "" : css.no_hover}`}
                    style={{
                        pointerEvents: canHover ? "auto" : "none",
                        cursor: canClick ? "pointer" : "default",
                        borderColor: isPlayed ? (isUserWin ? "#2e7d32" : "#7d2e2e") : "",
                    }}
                    onClick={handleClick}
                >
                    {isPlayed && (
                        <div className={css.playoffsSuccessPickemIndicator}>
                            <FaCircle size={28} color={isUserWin ? "#37b737" : "#be3939"} />
                            {isUserWin ? <FaCheck size={16} color="#ffffff" /> : <FaXmark size={16} color="#fff" />}
                        </div>
                    )}
                    <div className={`${css.bo_playoffs_label} ${boLabelResultClass}`} style={labelHighlight}>
                        BO{format.bestOf(stage)}
                    </div>
                    {!format.isSingle(stage) ? (
                        <div className={`${css.no_playoffs_label} ${noLabelResultClass}`} style={labelHighlight}>
                            #{idx + 1}
                        </div>
                    ) : null}
                    <div className={css.match_content}>
                        {renderTeamRow(leftTeam, shouldSwap ? "slotB" : "slotA", winnerIsLeft, isLeftLoser, displayScoreLeft, scorePositions[0])}

                        {bo1Tiebreak ? (
                            <div className={css.tiebreak_divider_row}>
                                <div
                                    style={{ backgroundColor: isUserWin ? "#2e7d32" : "red" }}
                                    className={`${css.divider} ${css.tiebreak_divider_segment}`}
                                />
                                <span className={css.tiebreak_label}>
                                    <span style={{ color: winnerIsLeft ? "#2e7d32" : "red" }}>{bo1Tiebreak.left}</span>
                                    {" "}{bo1Tiebreak.type}{" "}
                                    <span style={{ color: winnerIsRight ? "#2e7d32" : "red" }}>{bo1Tiebreak.right}</span>
                                </span>
                                <div
                                    style={{ backgroundColor: isUserWin ? "#2e7d32" : "red" }}
                                    className={`${css.divider} ${css.tiebreak_divider_segment}`}
                                />
                            </div>
                        ) : (
                            <div className={css.vs_row}>
                                <div
                                    style={{ backgroundColor: isPlayed ? (isUserWin ? "#2e7d32" : "red") : "rgb(90, 90, 90)" }}
                                    className={css.divider}
                                />
                                {!isPlayed || m.scoreLeft == null || m.scoreRight == null ? (
                                    <span style={{ textShadow: QUALIFIER_VS_TEXT_SHADOW }} className={css.vs_text}>
                                        VS
                                    </span>
                                ) : null}
                            </div>
                        )}

                        {renderTeamRow(rightTeam, shouldSwap ? "slotA" : "slotB", winnerIsRight, isRightLoser, displayScoreRight, scorePositions[1])}
                    </div>
                </div>
            </div>
        );
    };

    const renderQualifierBracket = (bracket, { archived = false, record = null } = {}) => {
        if (!bracket) {
            return (
                <div style={{ opacity: 0.75, textAlign: "center", marginTop: 40 }}>
                    This Group has not been drawn yet.
                </div>
            );
        }

        const current = archived ? null : findCurrentQualifierMatch(bracket);
        const next = archived ? null : findNextQualifierMatch(bracket, current);

        return (
            <QualifierBracketLayout
                key={`${archived ? "hall" : "live"}-${bracket.group}`}
                bracket={bracket}
                renderMatch={(m, stage, idx) =>
                    renderQualifierMatch(bracket, m, stage, idx, { archived, record, current, next })
                }
            />
        );
    };

    const renderPemGroupBracket = (bracket, { archived = false, record = null } = {}) => {
        if (!bracket) {
            return (
                <div style={{ opacity: 0.75, textAlign: "center", marginTop: 40 }}>
                    This Group has not been drawn yet.
                </div>
            );
        }

        const current = archived ? null : findCurrentPemGroupMatch(bracket);
        const next = archived ? null : findNextPemGroupMatch(bracket, current);

        return (
            <PemGroupBracketLayout
                key={`${archived ? "hall" : "live"}-${bracket.group}`}
                bracket={bracket}
                renderMatch={(m, stage, idx) =>
                    renderQualifierMatch(bracket, m, stage, idx, { archived, record, current, next, format: pemGroupMatchFormat })
                }
            />
        );
    };

    const renderPemStage1Bracket = (bracket, { archived = false, record = null } = {}) => {
        if (!bracket) {
            return (
                <div style={{ opacity: 0.75, textAlign: "center", marginTop: 40 }}>
                    This Group has not been drawn yet.
                </div>
            );
        }

        const current = archived ? null : findCurrentPemStage1Match(bracket);
        const next = archived ? null : findNextPemStage1Match(bracket, current);

        return (
            <PemStage1BracketLayout
                key={`${archived ? "hall" : "live"}-${bracket.group}`}
                bracket={bracket}
                renderMatch={(m, stage, idx) =>
                    renderQualifierMatch(bracket, m, stage, idx, { archived, record, current, next, format: pemStage1MatchFormat })
                }
            />
        );
    };

    const renderEclBracket = (bracket, { archived = false, record = null } = {}) => {
        if (!bracket) {
            return (
                <div style={{ opacity: 0.75, textAlign: "center", marginTop: 40 }}>
                    This bracket has not been drawn yet.
                </div>
            );
        }

        const current = archived ? null : findCurrentEclMatch(bracket);
        const next = archived ? null : findNextEclMatch(bracket, current);

        return (
            <EclBracketLayout
                key={archived ? "hall" : "live"}
                bracket={bracket}
                renderMatch={(m, stage, idx) =>
                    renderQualifierMatch(bracket, m, stage, idx, { archived, record, current, next, format: eclMatchFormat })
                }
            />
        );
    };

    const renderPemMainPage = () => {
        const showingPlayoffs = viewPhase === "playoffs" && isPemPlayoffs;
        const showingStage1 = isPemBigSeries && (viewPhase === "pemStage1" || !pemMain);
        const groupStageTitle = isPemBigSeries ? (showingStage1 ? "Stage I" : "Stage II") : "Group Stage";
        const champion = tournamentResults?.kind === "pem" ? tournamentResults.winner : null;
        const showEndButtons = showPickemLine2 && !!champion;

        const neededPickemCounter = (
            <>
                <span className={css.match_modal_prompt}>Needed Pick&apos;em points:</span>
                <span className={css.points}>
                    <CountUp
                        start={0}
                        duration={1.2}
                        end={neededPickemPoints}
                        key={neededPickemPoints}
                    />
                </span>
            </>
        );

        const endButtons = showEndButtons ? (
            <div className={css.pickem_buttons} style={{ top: "96px", left: "auto", right: "3%", zIndex: 19 }}>
                <button
                    className={`${css.gamble_button} ${css.back_button}`}
                    onClick={() => setShowPickemSummary(true)}
                >
                    Back to the Pick'em challenge summary
                </button>
                <button
                    className={`${css.gamble_button} ${css.back_back_button}`}
                    style={{ backgroundColor: hover ? champion.hoverOn : champion.color }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    onClick={() => setShowWinnersScreen(true)}
                >
                    Back to the Winners' screen
                </button>
                <button className={css.gamble_button} onClick={handleBackToHome}>
                    To Home Page
                </button>
                <button className={css.gamble_button} onClick={handleBackToSpecialStart}>
                    Back to the start of Special Mode
                </button>
                <button className={css.gamble_button} onClick={handleBackToGambling}>
                    Back to normal Gambling
                </button>
            </div>
        ) : null;

        if (showingPlayoffs) {
            return (
                <div className={css.cst_page}>
                    {renderPemNav()}

                    {endButtons ?? (
                        <div style={{ gap: 0, top: "96px", left: "auto", right: "5%" }} className={css.pickem_buttons}>
                            {neededPickemCounter}
                        </div>
                    )}

                    <div className={css.stage_title} style={{ marginBottom: 0 }}>
                        {pemLabel} | Playoffs
                    </div>

                    <div style={{ width: "100%", marginTop: "180px" }}>{renderPlayoffsBracket()}</div>
                </div>
            );
        }

        return (
            <>
                <QualifierGroupNav fixed value={pemGroupView} onChange={setPemGroupView} />
                <div className={css.qualifier_page} style={{ position: "relative", minWidth: 1464 }}>
                    {renderPemNav()}
                    {endButtons}

                    <StickyBelow
                        anchor='[data-sticky-anchor="qualifier-groups"]'
                        style={{ width: "calc(100% + 48px)", margin: "0 -24px 4px", padding: "6px 0 16px" }}
                    >
                        <div className={css.stage_title} style={{ marginBottom: 0, marginTop: "-28px" }}>
                            {pemLabel} | {groupStageTitle}
                        </div>

                        {!endButtons && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    right: "calc(50% - 670px)",
                                    transform: "translateY(-50%)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                {neededPickemCounter}
                            </div>
                        )}
                    </StickyBelow>

                    {showingStage1 ? (
                        <div className={css.pem_stage1_area}>
                            {renderPemStage1Bracket(pemStage1?.[pemGroupView])}
                        </div>
                    ) : (
                        renderPemGroupBracket(pemMain?.[pemGroupView])
                    )}
                </div>
            </>
        );
    };

    const renderEclPage = () => {
        const champion = tournamentResults?.kind === "ecl" ? tournamentResults.winner : null;
        const showEndButtons = showPickemLine2 && !!champion;

        return (
            <div className={css.cst_page} style={{ paddingTop: 56 }}>
                <div className={css.ecl_header} style={showEndButtons ? { minHeight: 176, padding: "18px 0 36px" } : { padding: "6px 0 16px" }}>
                    <div className={css.stage_title} style={{ marginBottom: 0 }}>
                        {eclLabel}
                    </div>

                    {showEndButtons ? (
                        <div
                            style={{
                                position: "absolute",
                                top: 12,
                                right: "calc(50% - 670px)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: 10,
                            }}
                        >
                            <button
                                className={`${css.gamble_button} ${css.back_button}`}
                                onClick={() => setShowPickemSummary(true)}
                            >
                                Back to the Pick'em challenge summary
                            </button>
                            <button
                                className={`${css.gamble_button} ${css.back_back_button}`}
                                style={{ backgroundColor: hover ? champion.hoverOn : champion.color }}
                                onMouseEnter={() => setHover(true)}
                                onMouseLeave={() => setHover(false)}
                                onClick={() => setShowWinnersScreen(true)}
                            >
                                Back to the Winners' screen
                            </button>
                            <button className={css.gamble_button} onClick={handlePemProceedToNextEvent}>
                                Proceed
                            </button>
                        </div>
                    ) : (
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                right: "calc(50% - 670px)",
                                transform: "translateY(-50%)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
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

                <div style={{ marginTop: 24 }}>{renderEclBracket(ecl)}</div>
            </div>
        );
    };

    const renderQualifierPage = () => {
        const group = qualifierGroupView;
        const firstQualified = tournamentResults?.kind === "pemQualifier"
            ? tournamentResults.qualifiers?.A?.[0] ?? null
            : null;

        return (
            <>
                <QualifierGroupNav fixed value={group} onChange={setQualifierGroupView} />
                <div className={css.qualifier_page}>
                    <StickyBelow
                        anchor='[data-sticky-anchor="qualifier-groups"]'
                        style={{ width: "calc(100% + 48px)", margin: "0 -24px 4px", padding: showPickemLine2 ? "18px 0 36px" : "6px 0 16px" }}
                    >
                        <div className={css.stage_title} style={{ marginBottom: 0 }}>
                            {renderQualifierTitle({ badgeHeight: 34 })}
                        </div>

                        {showPickemLine2 ? (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    right: "calc(50% - 670px)",
                                    transform: "translateY(-50%)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: 10,
                                }}
                            >
                                <button
                                    className={`${css.gamble_button} ${css.back_button}`}
                                    onClick={() => setShowPickemSummary(true)}
                                >
                                    Back to the Pick'em challenge summary
                                </button>
                                <button
                                    className={`${css.gamble_button} ${css.back_back_button}`}
                                    style={firstQualified ? {
                                        backgroundColor: hover ? firstQualified.hoverOn : firstQualified.color,
                                    } : undefined}
                                    onMouseEnter={() => setHover(true)}
                                    onMouseLeave={() => setHover(false)}
                                    onClick={() => setShowWinnersScreen(true)}
                                >
                                    Back to the Winners' screen
                                </button>
                                <button className={css.gamble_button} onClick={handlePemProceedToNextEvent}>
                                    Proceed
                                </button>
                            </div>
                        ) : (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    right: "calc(50% - 670px)",
                                    transform: "translateY(-50%)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
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
                    </StickyBelow>

                    {renderQualifierBracket(qualifier?.[group])}
                </div>
            </>
        );
    };

    const renderCstStandingsTable = (groupObj) => {
        const finished = isCstGroupFinished(groupObj);
        const rows = getCstStandings(groupObj);

        return (
            <table className={css.cst_table}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th style={{ textAlign: "left" }}>Team</th>
                        <th title="Matches">M</th>
                        <th title="Wins">W</th>
                        <th title="Ties">T</th>
                        <th title="Losses">L</th>
                        <th title="Rounds Difference">RD</th>
                        <th title="Points">P</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const inRange = row.position <= 2;
                        const rowClass = finished
                            ? inRange ? css.cst_row_qualified : css.cst_row_eliminated
                            : inRange ? css.cst_row_in : "";

                        return (
                            <tr key={row.team.id} className={rowClass}>
                                <td>{row.position}</td>
                                <td style={{ textAlign: "left" }}>
                                    <div className={css.cst_team_cell}>
                                        <span className={css.cst_team_dot} style={{ background: row.team.color }} />
                                        <span className={css.cst_team_name}>Team {row.team.name}</span>
                                        {finished && (
                                            inRange ? (
                                                <FaCheck size={11} color="#2e7d32" title="Qualified to Playoffs" style={{ flexShrink: 0 }} />
                                            ) : (
                                                <FaXmark size={12} color="#be3939" title="Eliminated" style={{ flexShrink: 0 }} />
                                            )
                                        )}
                                    </div>
                                </td>
                                <td>{row.m}</td>
                                <td>{row.w}</td>
                                <td>{row.t}</td>
                                <td>{row.l}</td>
                                <td style={{ color: row.rd > 0 ? "#2e7d32" : row.rd < 0 ? "red" : "" }}>
                                    {row.rd > 0 ? `+${row.rd}` : row.rd}
                                </td>
                                <td>{row.points}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    const renderCstGroupStage = (stage, { archived = false, record = null } = {}) => (
        <div className={css.cst_groups}>
            {CST_GROUPS.map((group) => {
                const groupObj = stage?.[group];
                const matches = groupObj?.matches || [];
                const currentIndex = archived ? -1 : matches.findIndex((m) => !m.played);
                const nextIndex = currentIndex >= 0 && currentIndex + 1 < matches.length ? currentIndex + 1 : -1;

                return (
                    <div key={group} className={css.cst_group} data-cst-group={archived ? undefined : group}>
                        <h3 className={css.cst_group_title}>Group {group}</h3>
                        {renderCstStandingsTable(groupObj)}

                        <div className={css.cst_group_matches}>
                            {[matches.slice(0, 5), matches.slice(5)].map((column, columnIdx) => (
                                <div key={columnIdx} className={css.cst_match_column}>
                                    {column.map((m, columnRow) => {
                                        const idx = columnIdx * 5 + columnRow;
                                        const isClickable = archived
                                            ? m.played
                                            : !isMatchRectLocked && (m.played || canOpenCstGroupMatch(groupObj, idx));
                                        const highlightClass =
                                            idx === currentIndex ? css.match_current : idx === nextIndex ? css.match_next : "";

                                        return (
                                            <MatchRect
                                                key={m.id}
                                                match={m}
                                                bestOf={1}
                                                shouldBestOfBeShown={false}
                                                isClickable={isClickable}
                                                isButtonLocked={!archived && isMatchRectLocked}
                                                onClick={() => {
                                                    if (!isClickable) return;
                                                    if (archived) openArchivedCstGroupMatchModal(record, group, idx, m);
                                                    else openCstGroupMatchModal(group, m.id, false);
                                                }}
                                                className={highlightClass}
                                                dataIdx={idx + 1}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderCstNav = () => (isCstPlayoffs ? renderGroupStageNav("cstGroups") : null);

    const renderPemNav = () => {
        if (!isPemBigSeries) return isPemPlayoffs ? renderGroupStageNav("pemGroups") : null;

        const entries = [
            isPemPlayoffs && { id: "playoffs", label: "Playoffs" },
            !!pemMain && { id: "pemGroups", label: "Stage II" },
            { id: "pemStage1", label: "Stage I" },
        ].filter(Boolean);

        return entries.length > 1 ? renderPhaseNav(entries) : null;
    };

    const renderGroupStageNav = (groupStageViewId) => renderPhaseNav([
        { id: "playoffs", label: "Playoffs" },
        { id: groupStageViewId, label: "Group Stage" },
    ]);

    const renderPhaseNav = (entries) => {
        return (
            <div
                ref={navRef}
                style={{
                    position: "absolute",
                    top: "10%",
                    left: "2%",
                    zIndex: 19,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 10,
                    transition: "none",
                }}
            >
                {entries.map((entry) => {
                    const isActive = viewPhase === entry.id;
                    return (
                        <button
                            key={entry.id}
                            data-results-active={isActive}
                            onClick={() => setViewPhase(entry.id)}
                            className={`${css.resultsNavigationButton} ${isActive ? css.resultsNavigationButtonActive : ""}`}
                        >
                            {entry.label}
                        </button>
                    );
                })}
                <motion.div
                    className={css.resultsNavigationIndicator}
                    initial={false}
                    animate={{
                        top: indicator.top,
                        height: indicator.height,
                    }}
                    transition={{
                        type: "tween",
                        stiffness: 300,
                        damping: 60,
                    }}
                />
            </div>
        );
    };

    const renderCstTitle = (suffix = null) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span>
                {cstLabel}
                {suffix ? <> | {suffix}</> : null}
            </span>
        </span>
    );

    const renderCstPage = () => {
        const showingPlayoffs = viewPhase === "playoffs" && isCstPlayoffs;
        const champion = tournamentResults?.kind === "cst" ? tournamentResults.winner : null;
        const showEndButtons = showPickemLine2 && !!champion;

        return (
            <div className={css.cst_page}>
                {renderCstNav()}

                {showEndButtons ? (
                    <div className={css.pickem_buttons} style={{ top: "96px", left: "auto", right: "3%" }}>
                        <button
                            className={`${css.gamble_button} ${css.back_button}`}
                            onClick={() => setShowPickemSummary(true)}
                        >
                            Back to the Pick'em challenge summary
                        </button>
                        <button
                            className={`${css.gamble_button} ${css.back_back_button}`}
                            style={{ backgroundColor: hover ? champion.hoverOn : champion.color }}
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            onClick={() => setShowWinnersScreen(true)}
                        >
                            Back to the Winners' screen
                        </button>
                        <button className={css.gamble_button} onClick={handlePemProceedToNextEvent}>
                            Proceed
                        </button>
                    </div>
                ) : (
                    <div style={{ gap: 0, top: "96px", left: "auto", right: "5%" }} className={css.pickem_buttons}>
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

                <div className={css.stage_title} style={{ marginBottom: 0 }}>
                    {renderCstTitle(showingPlayoffs ? "Playoffs" : "Group Stage")}
                </div>

                {showingPlayoffs ? (
                    <div style={{ width: "100%", marginTop: "-16px", height: "788px" }}>{renderPlayoffsBracket()}</div>
                ) : (
                    <>
                        <div className={css.info_text} style={{ fontSize: 14, color: "#777", marginBottom: showEndButtons ? 68 : 4 }}>
                            Win = 3 points, Tie (15-15) = 1 point. The top 2 teams of every Group go to the Playoffs.
                        </div>
                        {renderCstGroupStage(cst)}
                    </>
                )}
            </div>
        );
    };

    return {
        renderPemMainPage,
        renderQualifierPage,
        renderCstPage,
        renderEclPage,
        renderResultsNav,
        getStageTitleForView,
        renderPlayoffsBracket,
        renderSwissBracket,
        renderQualifierTitle,
        renderCstTitle,
        canOpenSwissMatch,
        renderCstGroupStage,
        renderEclBracket,
        renderPemStage1Bracket,
        renderPemGroupBracket,
        renderQualifierBracket,
    };
}
