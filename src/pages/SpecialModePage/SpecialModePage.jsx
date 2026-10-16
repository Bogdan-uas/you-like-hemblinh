import {
    useMemo,
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import css from "./SpecialModePage.module.css";
import Header from "../../components/Header/Header.jsx";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import toast from "./logic/renderSafeToast.js";
import "odometer/themes/odometer-theme-default.css";
import { SERIES_ACTIONS } from "../../../assets/constants.js";
import Lenis from "lenis";
import "./logic/storageUsageLog.js";
import { copyBracketStages, advanceBracket, getMatchLoserTeam, getMatchWinnerTeam } from "./logic/brackets.js";
import { TIE_BANNER_COLOR, TIE_BANNER_GRADIENT } from "./logic/breakdownStyles.js";
import { makeColorSequence, buildTournamentColorPool, lightenHex, darkenHex } from "./logic/colors.js";
import {
    CST_GROUPS,
    CST_PLAYOFFS_BEST_OF,
    getCstGroupMatches,
    cstGroupMatchPoints,
    CST_TIE_SCORE,
    isCstGroupStageFinished,
    buildCstPlayoffs,
    CST_BIG_STAGE_SCALE,
    splitCstGroups,
    buildCstGroupStage,
    getRandomCstNeededPickemPoints,
} from "./logic/cst.js";
import { isNativeScrollArea } from "./logic/dom.js";
import {
    GCC_LEAGUE_BEST_OF,
    GCC_KNOCKOUT_BEST_OF,
    buildGccLeague,
    buildGccKnockout,
    findGccLeagueMatch,
    gccLeagueMatchPoints,
    getGccLeagueMatches,
    getGccPlaces,
    getRandomGccNeededPickemPoints,
    isGccLeagueFinished,
    GCC_LEAGUE_MATCH_COUNT,
} from "./logic/gcc.js";
import {
    buildGplSeeds,
    getRandomGplNeededPickemPoints,
    GPL_PLAYOFFS_BIG_STAGE,
    GPL_SWISS_CLEAR_GAINS,
    GPL_SWISS_MATCH_COUNT,
} from "./logic/gpl.js";
import {
    isSingleEclStage,
    getBestOfForEcl,
    ECL_PICKEM_ROUNDS,
    getEclMatches,
    eclMatchPoints,
    ECL_STAGE_ORDER,
    ECL_BIG_STAGE_GAINS,
    ECL_ROUTES,
    getEclResults,
    buildEclBracket,
    getRandomEclNeededPickemPoints,
    getEclPlaces,
    getEclStakeTexts,
    eclStageLabel,
} from "./logic/ecl.jsx";
import {
    BASE_ROUNDS_TO_WIN,
    getRandomNeededPickemPoints,
    SECRET_TOAST_ID,
    SECRET_NUM_TWO_TOAST_ID,
    SECRET_NUM_THREE_TOAST_ID,
    MULTIPLIER_MIN,
    MULTIPLIER_MAX,
    BASE_MAX_ROUNDS,
    OT_ROUNDS_TO_WIN,
    OT_MAX_BLOCK,
    ROUND12_TOAST_ID,
    EXT_ROUND_FINAL_COMPARE_MS,
    EXT_ROUND_COMMENTARY_DELAY_MS,
    EXT_ROUND_REVEAL_MS,
} from "./logic/gameConstants.js";
import { saveHallTournament, sortHallOfFame } from "./logic/hallOfFameDb.js";
import {
    buildPbsSeeds,
    buildPbsStatus,
    buildPbsBracket,
    planPbsDraftSteps,
    buildPbsDraftTimeline,
    resolvePbsResult,
    getPbsRoundWinners,
    isPbsRoundFinished,
    getPbsDraftRoundView,
    getPbsStakeTexts,
    getPbsBountyLine,
    getPbsBountyBonus,
    getPbsPlaces,
} from "./logic/pbs.jsx";
import { PBS_BEST_OF, PBS_BIG_STAGE, PBS_NEXT_DRAFT_ROUND, PBS_STAGE_ORDER, getRandomPbsNeededPickemPoints } from "./logic/pbsConfig.js";
import { usePbsDraftClock, clearPbsDraftProgress } from "./logic/pbsDraftClock.js";
import { PbsDraftShow } from "./components/PbsDraftShow.jsx";
import { getPemSeriesConfig, isPemSeriesType, PEM_BIG_PLAYOFFS_BEST_OF, PEM_PLAYOFFS_BEST_OF } from "./logic/pemConfig.js";
import {
    isPemPlayoffsKind,
    isSinglePemGroupStage,
    getBestOfForPemGroup,
    PEM_MAIN_GROUPS,
    buildPemMainEventTeams,
    PEM_GROUP_PICKEM_ROUNDS,
    getPemGroupMatches,
    pemGroupMatchPoints,
    PEM_GROUP_STAGE_ORDER,
    PEM_GROUP_QUALIFYING_STAGES,
    advancePemGroupBracket,
    isPemGroupStageFinished,
    buildPemPlayoffs,
    buildPemMainGroupStage,
    PEM_BIG_PLAYOFFS_BIG_STAGE,
    PEM_PLAYOFFS_BIG_STAGE,
    getRandomPemNeededPickemPoints,
    getPemGroupStakeTexts,
    pemGroupStageLabel,
} from "./logic/pemSeries.jsx";
import {
    isSinglePemStage1Stage,
    getBestOfForPemStage1,
    buildPemStage1Teams,
    PEM_STAGE1_PICKEM_ROUNDS,
    getPemStage1Matches,
    pemStage1MatchPoints,
    PEM_STAGE1_STAGE_ORDER,
    PEM_STAGE1_QUALIFYING_STAGES,
    advancePemStage1Bracket,
    isPemStage1Finished,
    buildPemBigStage2Teams,
    buildPemStage1,
    getPemStage1StakeTexts,
    pemStage1StageLabel,
} from "./logic/pemStage1.jsx";
import { loadTeamPlacings, EMPTY_TEAM_PLACINGS, saveTeamPlacings } from "./logic/placings.jsx";
import { getBestOfForPlayoffs, buildPlayoffsBracket, buildGplPlayoffs, canOpenPlayoffsMatch, stageLabelPlayoffs } from "./logic/playoffs.js";
import {
    isSingleQualifierStage,
    getBestOfForQualifier,
    QUALIFIER_GROUPS,
    buildPemSeeds,
    splitQualifierGroups,
    buildQualifier,
    getRandomQualifierNeededPickemPoints,
    QUALIFIER_PICKEM_ROUNDS,
    getQualifierMatches,
    qualifierMatchPoints,
    QUALIFIER_STAGE_ORDER,
    QUALIFIER_QUALIFYING_STAGES,
    QUALIFIER_ELIMINATION_STAGES,
    advanceQualifierBracket,
    isQualifierFinished,
    getQualifierGroupQualifiers,
    getQualifierStakeTexts,
    qualifierStageLabel,
} from "./logic/qualifier.jsx";
import { applyRatings, applyTieRatings } from "./logic/ratings.js";
import { defaultSeriesState, buildExtendedRoundWinnerList, buildExtendedRoundDetails, round2 } from "./logic/series.js";
import {
    resetBattleExperience,
    pullStatsTowardStart,
    buildMatchStatContext,
    resolveSetConclusion,
    resolveSeriesEndStats,
    STAT_ACTIVATION_VERSION,
    resolveSeriesTieStats,
} from "./logic/statActivation.js";
import {
    computeRollBonus,
    splitRollEdge,
    applyOtStaminaPenaltyAttempt,
    computeClutchRoundFlag,
    resolveRoundConclusion,
    applyOtStaminaRoundResult,
    otherSide,
    buildStoredUpsetMeta,
    bumpStat,
} from "./logic/statEffects.js";
import { DEFAULT_STATS_PANELS_STATE, ROUND_LOG_LS_KEY, STORAGE_KEY } from "./logic/storageKeys.js";
import {
    getBestOfForSwissNet,
    buildSwissStage,
    getSwissQualified,
    calcSetsToWin,
    tryBuildUnlockedNets,
    isSwissStageFinished,
    swissNetTitle,
    GPL_SWISS_FORMAT,
} from "./logic/swiss.js";
import {
    loadRatingsSnapshot,
    buildModalStatsKey,
    loadStatsPanelMemory,
    loadTeamRatings,
    buildLeaderboard,
    loadTournamentNumber,
    saveStatsPanelMemory,
    classifyTeamsForStages,
    saveTournamentNumber,
    saveTeamRatings,
    clearRatingsSnapshot,
    saveRatingsSnapshot,
    toggleStatsPanelEntry,
} from "./logic/teamData.js";
import { getAllTeams64, toBaseTeam, uniqById } from "./logic/teams.js";
import {
    loadStatsSnapshot,
    DEFAULT_TEAM_STAT_VALUES,
    loadTeamStats,
    normalizeTeamStats,
    saveTeamStats,
    clearStatsSnapshot,
    saveStatsSnapshot,
} from "./logic/teamStats.js";
import {
    loadTournamentPicker,
    loadCurrentTournamentType,
    PEM_SMALL_TYPE_ID,
    PEM_BIG_TYPE_ID,
    CST_TYPE_ID,
    ECL_TYPE_ID,
    GPL_TYPE_ID,
    GCC_TYPE_ID,
    PBS_TYPE_ID,
    formatTournamentNumber,
    loadTournamentNumbers,
    saveTournamentNumbers,
    getTournamentTypeConfig,
    saveTournamentPicker,
    DEFAULT_TOURNAMENT_PICKER,
    pickTournamentType,
    saveCurrentTournamentType,
} from "./logic/tournamentTypes.jsx";
import { getAnniversaryTheme as getTournamentTheme, getTournamentNumberStyle, PICKEM_STEP_MS, PICKEM_PLAYOFF_KEYS } from "./logic/winnersAndPickem.js";
import { useHallOfFame } from "./hallOfFame/useHallOfFame.js";
import { useLeaderboard } from "./leaderboard/useLeaderboard.js";
import { useHallOfFameManager } from "./hallOfFame/useHallOfFameManager.js";
import { usePlacingsAdmin } from "./leaderboard/usePlacingsAdmin.js";
import { useStatsAdmin } from "./leaderboard/useStatsAdmin.js";
import { useTournamentNumberAdmin } from "./leaderboard/useTournamentNumberAdmin.js";
import { useHallDragScroll } from "./hallOfFame/useHallDragScroll.js";
import { useHallPendingScroll } from "./hallOfFame/useHallPendingScroll.js";
import { HallOfFameView } from "./hallOfFame/HallOfFameView.jsx";
import { LeaderboardView } from "./leaderboard/LeaderboardView.jsx";
import { LeaderboardAdminModals } from "./leaderboard/LeaderboardAdminModals.jsx";
import { createTournamentRenderers } from "./renderers/tournamentRenderers.jsx";
import { SeriesScreen } from "./series/SeriesScreen.jsx";
import { MatchModal } from "./matchModal/MatchModal.jsx";
import { PickemSummary } from "./screens/PickemSummary.jsx";
import { QualifierWinnersScreen } from "./screens/QualifierWinnersScreen.jsx";
import { WinnersScreen } from "./screens/WinnersScreen.jsx";
import { StartPage } from "./screens/StartPage.jsx";
import { SwissTournamentView } from "./screens/SwissTournamentView.jsx";
import { TournamentIntros } from "./screens/TournamentIntros.jsx";
import { GameControlModals } from "./screens/GameControlModals.jsx";

function SpecialModePage() {
    const navigate = useNavigate();
    const allTeams = useMemo(() => getAllTeams64(), []);

    const colorSeq = useMemo(
        () => makeColorSequence(buildTournamentColorPool().map(([, v]) => v)),
        []
    );

    const [showIntro, setShowIntro] = useState(true);
    const [isTournamentPickerOpen, setIsTournamentPickerOpen] = useState(false);
    const [tournamentPicker, setTournamentPicker] = useState(loadTournamentPicker);
    const [currentTournamentType, setCurrentTournamentType] = useState(loadCurrentTournamentType);
    const [showTournamentIntro, setShowTournamentIntro] = useState(false);

    const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

    const [activePhase, setActivePhase] = useState("stage1");

    const [viewPhase, setViewPhase] = useState("stage1");

    const [stage1, setStage1] = useState(null);
    const [stage2, setStage2] = useState(null);
    const [stage3, setStage3] = useState(null);
    const [playoffs, setPlayoffs] = useState(null);

    const [pemSeries, setPemSeries] = useState(null);
    const [qualifier, setQualifier] = useState(null);
    const [qualifierGroupView, setQualifierGroupView] = useState("A");
    const qualifierRef = useRef(qualifier);

    useEffect(() => {
        qualifierRef.current = qualifier;
    }, [qualifier]);

    const isQualifierPhase = activePhase === "qualifier" && !!qualifier;

    const [cst, setCst] = useState(null);
    const cstRef = useRef(cst);

    useEffect(() => {
        cstRef.current = cst;
    }, [cst]);

    const isCstPhase = pemSeries?.event === "cst" && !!cst;
    const isCstPlayoffs = isCstPhase && playoffs?.kind === "cst";

    const [ecl, setEcl] = useState(null);
    const eclRef = useRef(ecl);

    useEffect(() => {
        eclRef.current = ecl;
    }, [ecl]);

    const isEclPhase = pemSeries?.event === "ecl" && !!ecl;

    const [pemStage1, setPemStage1] = useState(null);
    const pemStage1Ref = useRef(pemStage1);

    useEffect(() => {
        pemStage1Ref.current = pemStage1;
    }, [pemStage1]);

    const [pemMain, setPemMain] = useState(null);
    const [pemGroupView, setPemGroupView] = useState("A");
    const pemMainRef = useRef(pemMain);

    useEffect(() => {
        pemMainRef.current = pemMain;
    }, [pemMain]);

    const [gplSeries, setGplSeries] = useState(null);
    const [gcc, setGcc] = useState(null);
    const gccRef = useRef(gcc);

    useEffect(() => {
        gccRef.current = gcc;
    }, [gcc]);

    const isGccPhase = gplSeries?.event === "gcc" && !!gcc;
    const isGccKnockout = isGccPhase && playoffs?.kind === "gcc";
    const isGplMainPhase = gplSeries?.event === "gpl";

    const [pbs, setPbs] = useState(null);
    const pbsRef = useRef(pbs);

    useEffect(() => {
        pbsRef.current = pbs;
    }, [pbs]);

    const isPbsPhase = !!pbs;

    const pemType = pemSeries?.type ?? PEM_SMALL_TYPE_ID;
    const pemConfig = getPemSeriesConfig(pemType);
    const isPemBigSeries = !!pemSeries && pemType === PEM_BIG_TYPE_ID;

    const isPemMainPhase = pemSeries?.event === "main" && (!!pemMain || !!pemStage1);
    const isPemPlayoffs = isPemMainPhase && isPemPlayoffsKind(playoffs?.kind);

    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState(null);
    const [statsPanelMemory, setStatsPanelMemory] = useState(() => loadStatsPanelMemory());
    const [modalLeftTeam, setModalLeftTeam] = useState(null);
    const [modalRightTeam, setModalRightTeam] = useState(null);
    const [hasChosen, setHasChosen] = useState(false);
    const [hasPlayedWinnerAnimation, setHasPlayedWinnerAnimation] = useState(false);

    const [seriesState, setSeriesState] = useState(defaultSeriesState);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const [forceWinner, setForceWinner] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [cheatMode, setCheatMode] = useState(0);

    const [neededPickemPoints, setNeededPickemPoints] = useState(() => getRandomNeededPickemPoints());
    const [finalPickemPoints, setFinalPickemPoints] = useState(0);

    const [hoveredTeamId, setHoveredTeamId] = useState(null);

    const [guessedCounts, setGuessedCounts] = useState({
        stage1: 0,
        stage2: 0,
        stage3: 0,
        ro16: 0,
        qf: 0,
        sf: 0,
        tpd: 0,
        gf: 0,
    });

    const [showPickemSummary, setShowPickemSummary] = useState(false);
    const [showPickemLine2, setShowPickemLine2] = useState(false);
    const [showPickemResult, setShowPickemResult] = useState(false);

    const [showWinnersScreen, setShowWinnersScreen] = useState(false);
    const [tournamentResults, setTournamentResults] = useState(null);
    const [showWinnerText, setShowWinnerText] = useState(false);
    const [showPodium, setShowPodium] = useState(false);
    const [showProceed, setShowProceed] = useState(false);
    const [winnersText, setWinnersText] = useState("And the Fourth Place is:");

    const [hover, setHover] = useState(false);

    const [teamRatings, setTeamRatings] = useState(() => loadTeamRatings(allTeams));
    const teamRatingsRef = useRef(teamRatings);

    useEffect(() => {
        teamRatingsRef.current = teamRatings;
    }, [teamRatings]);

    const [teamStats, setTeamStats] = useState(() => loadTeamStats(allTeams));
    const teamStatsRef = useRef(teamStats);

    useEffect(() => {
        teamStatsRef.current = teamStats;
    }, [teamStats]);

    const leaderboard = useMemo(() => buildLeaderboard(allTeams, teamRatings), [allTeams, teamRatings]);
    const { rankById } = leaderboard;
    const ratingsSnapshotRef = useRef(loadRatingsSnapshot());
    const statsSnapshotRef = useRef(loadStatsSnapshot());

    const [teamPlacings, setTeamPlacings] = useState(() => loadTeamPlacings(allTeams));

    const teamPlacingsRef = useRef(teamPlacings);
    const tournamentSeedsRef = useRef(null);
    const netEntryCounterRef = useRef(1);

    useEffect(() => {
        teamPlacingsRef.current = teamPlacings;
    }, [teamPlacings]);

    const [tournamentNumber, setTournamentNumber] = useState(() => loadTournamentNumber());

    useEffect(() => {
        saveStatsPanelMemory(statsPanelMemory);
    }, [statsPanelMemory]);
    const [tournamentNumbers, setTournamentNumbers] = useState(() => loadTournamentNumbers());

    const [pickemSentenceStep, setPickemSentenceStep] = useState(0);
    const [showPickemAchieved, setShowPickemAchieved] = useState(false);
    const [pickemCountSettled, setPickemCountSettled] = useState(false);
    const [showPickemButtons, setShowPickemButtons] = useState(false);
    const [pickemSummarySeen, setPickemSummarySeen] = useState(false);

    const modalRef = useRef(null);
    const [modalScale, setModalScale] = useState(1);

    const lenisRef = useRef(null);
    const hallManagerScrollRef = useRef(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.8,
            smoothWheel: true,
            prevent: (node) => node === hallManagerScrollRef.current || isNativeScrollArea(node),
        });

        lenisRef.current = lenis;

        let rafId;

        const raf = (time) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    const hall = useHallOfFame();
    const {
        selectedHallMatch,
        isHallOfFameOpen,
        setSelectedHallMatch,
        setHallOfFame,
        setIsHallOfFameOpen,
        hallOfFame,
        hallTeamSortMode,
        setSelectedHallTournament,
        hallPendingScroll,
        selectedHallTournament,
        setHallPendingScroll,
    } = hall;
    const leaderboardState = useLeaderboard({
        leaderboard,
        allTeams,
        teamRatings,
        teamPlacings,
        teamStats,
        lenisRef,
        tournamentResults,
        hallOfFame,
        pickemSummarySeen,
    });
    const { isLeaderboardOpen, setIsLeaderboardOpen, setLeaderboardStatsTab } = leaderboardState;
    const hallManager = useHallOfFameManager({ allTeams, hallTeamSortMode, teamRatings, rankById, hallOfFame, setHallOfFame, setSelectedHallTournament });
    const placingsAdmin = usePlacingsAdmin({
        teamPlacings,
        isLeaderboardOpen,
        setLeaderboardStatsTab,
        allTeams,
        setTeamPlacings,
        setTeamRatings,
        teamRatingsRef,
        leaderboard,
        teamRatings,
    });
    const {
        isAddPlacingsCodeModalOpen,
        isAddPlacingsModalOpen,
        isAddPlacingsFinalModalOpen,
        isRemovePlacingsCodeModalOpen,
        isRemovePlacingsModalOpen,
        isRemovePlacingsFinalModalOpen,
        handleAddPlacingsClick,
        handleRemovePlacingsClick,
        arePlacingButtonsArmed,
        hasAnyPlacings,
        placingCategory,
        setSelectedPlacingTeamIds,
        allTeamIds,
    } = placingsAdmin;
    const statsAdmin = useStatsAdmin({
        allTeams,
        setTeamRatings,
        teamRatingsRef,
        setTeamPlacings,
        teamPlacingsRef,
        setTeamStats,
        teamStatsRef,
        setTournamentNumber,
        setTournamentNumbers,
        ratingsSnapshotRef,
        statsSnapshotRef,
        resetTournamentStateWithSeeds: (...args) => resetTournamentStateWithSeeds(...args),
        teamStats,
        rankById,
        teamRatings,
    });
    const {
        isScoreBoardResetModalOpen,
        isScoreBoardResetConfirmModalOpen,
        isStatsAdminModalOpen,
        setIsScoreBoardResetModalOpen,
    } = statsAdmin;
    const tournamentNumberAdmin = useTournamentNumberAdmin({ getTypeNumber: (...args) => getTypeNumber(...args), setTypeNumber: (...args) => setTypeNumber(...args) });
    const {
        isTournamentNumberCodeModalOpen,
        isTournamentNumberTypeModalOpen,
        isTournamentNumberModalOpen,
        isTournamentNumberFinalModalOpen,
        setIsTournamentNumberButtonArmed,
    } = tournamentNumberAdmin;
    const hallDrag = useHallDragScroll();


    const getStageObj = (key) => {
        if (key === "stage1") return stage1;
        if (key === "stage2") return stage2;
        if (key === "stage3") return stage3;
        return null;
    };

    const currentModalMatch = useMemo(() => {
        if (!modalContext) return null;

        if (modalContext.isArchivedHallOfFame) {
            return selectedHallMatch?.match || null;
        }

        if (modalContext.type === "swiss") {
            const stg = getStageObj(modalContext.stageKey);
            if (!stg) return null;
            const arr = stg.matchesByNet[modalContext.net] || [];
            return arr.find((m) => m.id === modalContext.matchId) || null;
        }

        if (modalContext.type === "playoffs") {
            if (!playoffs) return null;
            const arr = playoffs[modalContext.stage] || [];
            return arr.find((m) => m.id === modalContext.matchId) || null;
        }

        if (modalContext.type === "qualifier") {
            const arr = qualifier?.[modalContext.group]?.[modalContext.stage] || [];
            return arr.find((m) => m.id === modalContext.matchId) || null;
        }

        if (modalContext.type === "cstGroup") {
            const arr = cst?.[modalContext.group]?.matches || [];
            return arr.find((m) => m.id === modalContext.matchId) || null;
        }

        if (modalContext.type === "pemGroup") {
            const arr = pemMain?.[modalContext.group]?.[modalContext.stage] || [];
            return arr.find((m) => m.id === modalContext.matchId) || null;
        }

        if (modalContext.type === "ecl") {
            const arr = ecl?.[modalContext.stage] || [];
            return arr.find((m) => m.id === modalContext.matchId) || null;
        }

        if (modalContext.type === "pemStage1") {
            const arr = pemStage1?.[modalContext.group]?.[modalContext.stage] || [];
            return arr.find((m) => m.id === modalContext.matchId) || null;
        }

        if (modalContext.type === "gccLeague") {
            return findGccLeagueMatch(gcc, modalContext.matchId)?.match || null;
        }

        return null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalContext, stage1, stage2, stage3, playoffs, qualifier, cst, ecl, pemStage1, pemMain, gcc, selectedHallMatch]);

    const modalBestOf = useMemo(() => {
        if (!modalContext) return null;
        if (modalContext.type === "swiss") return getBestOfForSwissNet(modalContext.net, modalContext.stageKey, modalContext.format);
        if (modalContext.type === "gccLeague") return GCC_LEAGUE_BEST_OF;
        if (modalContext.type === "qualifier") return getBestOfForQualifier(modalContext.stage);
        if (modalContext.type === "pemGroup") return getBestOfForPemGroup(modalContext.stage);
        if (modalContext.type === "ecl") return getBestOfForEcl(modalContext.stage);
        if (modalContext.type === "pemStage1") return getBestOfForPemStage1(modalContext.stage);
        if (modalContext.type === "cstGroup") return 1;
        return getBestOfForPlayoffs(modalContext.stage, modalContext.kind);
    }, [modalContext]);
    const isBo1Modal = modalBestOf === 1;

    const getPickOrientedModalView = (match, isBo1) => {
        if (!match) {
            return {
                leftTeam: null,
                rightTeam: null,
                shouldSwap: false,
                displayLeft: null,
                displayRight: null,
                didUserWin: false,
                leftIsPick: false,
                rightIsPick: false,
                winnerIsLeft: false,
                winnerIsRight: false,
                leftIsLoser: false,
                rightIsLoser: false,
            };
        }

        const slotA = match.slotA || null;
        const slotB = match.slotB || null;

        const shouldSwap =
            !!match.pickTeamId && slotA && slotB && match.pickTeamId === slotB.id;

        const leftTeam = shouldSwap ? slotB : slotA;
        const rightTeam = shouldSwap ? slotA : slotB;

        const bo1History =
            isBo1 && match.setHistory?.length
                ? match.setHistory[0]
                : null;

        const bo1MapScore = bo1History
            ? {
                left: bo1History.wins,
                right: bo1History.losses,
            }
            : null;

        const bo1Tiebreak =
            bo1History?.extendedRounds?.penalties
                ? {
                    type: "Pens",
                    left: bo1History.extendedRounds.penalties.leftScore,
                    right: bo1History.extendedRounds.penalties.rightScore,
                }
                : bo1History?.extendedRounds
                    ? (() => {
                        const winners = buildExtendedRoundWinnerList(bo1History.extendedRounds);

                        let left = 0;
                        let right = 0;

                        winners.forEach((w) => {
                            if (w.winner === "left") left++;
                            else if (w.winner === "right") right++;
                        });

                        return left || right
                            ? {
                                type: "ERs",
                                left,
                                right,
                            }
                            : null;
                    })()
                    : null;

        const slotOrientedLeft =
            bo1MapScore && bo1MapScore.left != null ? bo1MapScore.left : match.scoreLeft;

        const slotOrientedRight =
            bo1MapScore && bo1MapScore.right != null ? bo1MapScore.right : match.scoreRight;

        const displayLeft =
            bo1MapScore
                ? bo1MapScore.left
                : (shouldSwap ? slotOrientedRight : slotOrientedLeft);

        const displayRight =
            bo1MapScore
                ? bo1MapScore.right
                : (shouldSwap ? slotOrientedLeft : slotOrientedRight);

        const didUserWin =
            !!match.played &&
            !!match.pickTeamId &&
            !!match.winnerTeamId &&
            match.pickTeamId === match.winnerTeamId;

        const leftIsPick = !!match.pickTeamId && leftTeam && match.pickTeamId === leftTeam.id;
        const rightIsPick = !!match.pickTeamId && rightTeam && match.pickTeamId === rightTeam.id;

        const winnerIsLeft = !!match.winnerTeamId && leftTeam && match.winnerTeamId === leftTeam.id;
        const winnerIsRight = !!match.winnerTeamId && rightTeam && match.winnerTeamId === rightTeam.id;

        const leftIsLoser = !!match.loserTeamId && leftTeam && match.loserTeamId === leftTeam.id;
        const rightIsLoser = !!match.loserTeamId && rightTeam && match.loserTeamId === rightTeam.id;

        return {
            leftTeam,
            rightTeam,
            shouldSwap,
            displayLeft,
            displayRight,
            bo1Tiebreak,
            didUserWin,
            leftIsPick,
            rightIsPick,
            winnerIsLeft,
            winnerIsRight,
            leftIsLoser,
            rightIsLoser,
        };
    };

    const {
        displayLeft: modalScoreLeft,
        displayRight: modalScoreRight,
    } = getPickOrientedModalView(
        currentModalMatch,
        isBo1Modal
    );

    const playedSets = isBo1Modal
        ? 1
        : (modalScoreLeft ?? 0) + (modalScoreRight ?? 0);

    useLayoutEffect(() => {
        const updateScale = () => {
            if (!modalRef.current) return;

            if (playedSets < 7) {
                setModalScale(1);
                return;
            }

            const modalHeight = modalRef.current.offsetHeight;
            const availableHeight = window.innerHeight * 0.95;

            setModalScale(
                modalHeight > availableHeight
                    ? availableHeight / modalHeight
                    : 1
            );
        };

        updateScale();

        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, [playedSets, currentModalMatch]);

    const lastToastTime = useRef(0);

    const roundLogRef = useRef(
        (() => {
            try {
                const raw = localStorage.getItem(ROUND_LOG_LS_KEY);
                const parsed = raw ? JSON.parse(raw) : [];
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        })()
    );

    const persistRoundLog = () => {
        try {
            localStorage.setItem(ROUND_LOG_LS_KEY, JSON.stringify(roundLogRef.current));
        } catch {
            /* ignore */
        }
    };

    const logRound = (entry) => {
        const list = roundLogRef.current;
        if (list.some((e) => e.key === entry.key)) return;
        list.push(entry);
        persistRoundLog();
    };

    const clearRoundLog = () => {
        roundLogRef.current = [];
        try {
            localStorage.removeItem(ROUND_LOG_LS_KEY);
        } catch {
            /* ignore */
        }
    };

    const [breakdownSetIndex, setBreakdownSetIndex] = useState(null);


    const navRef = useRef(null);

    const [indicator, setIndicator] = useState({
        top: 0,
        height: 0,
    });

    const updateResultsIndicator = useCallback(() => {
        if (!navRef.current) return;

        const active = navRef.current.querySelector(
            "[data-results-active='true']"
        );

        if (!active) {
            setIndicator({
                top: 0,
                height: 0,
            });
            return;
        }

        const rect = active.getBoundingClientRect();
        const parentRect = navRef.current.getBoundingClientRect();

        setIndicator({
            top: rect.top - parentRect.top,
            height: rect.height,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewPhase]);

    useEffect(() => {
        requestAnimationFrame(updateResultsIndicator);
    }, [
        viewPhase,
        activePhase,
        updateResultsIndicator,
    ]);

    useEffect(() => {
        updateResultsIndicator();

        const handleResize = () => updateResultsIndicator();

        window.addEventListener("resize", handleResize);

        return () =>
            window.removeEventListener("resize", handleResize);
    }, [updateResultsIndicator]);

    const isSeriesActive = seriesState.active;
    const isLeaderboardButtonShown = showIntro || showPickemLine2 || !!tournamentResults;

    const lastPlayedCstGroupRef = useRef(null);

    const isBracketPageVisible =
        !showIntro &&
        !showTournamentIntro &&
        !isSeriesActive &&
        !showPickemSummary &&
        !showWinnersScreen &&
        !isHallOfFameOpen &&
        !isLeaderboardOpen;

    const pbsDraft = pbs?.draft ?? null;
    const pbsDraftPlan = pbsDraft?.plan ?? null;
    const pbsDraftTimeline = useMemo(() => (pbsDraftPlan ? buildPbsDraftTimeline(pbsDraftPlan) : null), [pbsDraftPlan]);
    const isPbsDraftLive = !!pbsDraftPlan && isBracketPageVisible && !isMatchModalOpen && viewPhase === getPbsDraftRoundView(pbsDraft.round);
    const pbsDraftClock = usePbsDraftClock({
        draftId: pbsDraftPlan ? pbsDraft.id : null,
        total: pbsDraftTimeline?.total ?? 0,
        speed: pbsDraft?.speed ?? 1,
        active: isPbsDraftLive && !pbsDraft?.paused,
        onComplete: (draftId) => completePbsDraft(draftId),
    });
    const pbsTeamsById = useMemo(() => Object.fromEntries(allTeams.map((team) => [team.id, team])), [allTeams]);
    const pbsDraftToPlan = pbsDraft && !pbsDraftPlan ? pbsDraft : null;

    useEffect(() => {
        if (!pbsDraftToPlan) return undefined;

        const { id: draftId, round, entrants } = pbsDraftToPlan;
        const steps = planPbsDraftSteps({ round, entrants, ratings: teamRatingsRef.current, teams: allTeams, stats: teamStatsRef.current });
        let timer = null;
        let cancelled = false;

        const run = () => {
            const startedAt = performance.now();
            let step = steps.next();
            while (!step.done && performance.now() - startedAt < 8) step = steps.next();
            if (cancelled) return;

            if (!step.done) {
                timer = setTimeout(run, 0);
                return;
            }

            setPbs((prev) => {
                if (prev?.draft?.id !== draftId || prev.draft.plan) return prev;
                const next = { ...prev, draft: { ...prev.draft, plan: step.value } };
                pbsRef.current = next;
                return next;
            });
        };

        timer = setTimeout(run, 0);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pbsDraftToPlan?.id]);

    useEffect(() => {
        if (!isBracketPageVisible) return;

        const t = setTimeout(() => {
            const preferredGroup = lastPlayedCstGroupRef.current;
            const current =
                (preferredGroup &&
                    document.querySelector(`[data-cst-group="${preferredGroup}"] .${css.match_current}`)) ||
                document.querySelector(`.${css.match_current}`);
            if (!current) return;

            const rect = current.getBoundingClientRect();
            const target = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({ top: Math.max(0, Math.min(target, maxScroll)), behavior: "smooth" });
        }, 450);

        return () => clearTimeout(t);
    }, [isBracketPageVisible, viewPhase, qualifierGroupView, pemGroupView, pbsDraft?.id]);

    const isButtonLocked =
        isCalculating ||
        isRestartModalOpen ||
        isTerminateModalOpen ||
        isScoreBoardResetModalOpen ||
        isScoreBoardResetConfirmModalOpen ||
        isStatsAdminModalOpen ||
        isAddPlacingsCodeModalOpen ||
        isAddPlacingsModalOpen ||
        isAddPlacingsFinalModalOpen ||
        isRemovePlacingsCodeModalOpen ||
        isRemovePlacingsModalOpen ||
        isRemovePlacingsFinalModalOpen ||
        isTournamentNumberCodeModalOpen ||
        isTournamentNumberTypeModalOpen ||
        isTournamentNumberModalOpen ||
        isTournamentNumberFinalModalOpen ||
        showIntro ||
        isLocked;

    const isTournamentNumberButtonLocked =
        isCalculating ||
        isRestartModalOpen ||
        isTerminateModalOpen ||
        isScoreBoardResetModalOpen ||
        isScoreBoardResetConfirmModalOpen ||
        isStatsAdminModalOpen ||
        isAddPlacingsCodeModalOpen ||
        isAddPlacingsModalOpen ||
        isAddPlacingsFinalModalOpen ||
        isRemovePlacingsCodeModalOpen ||
        isRemovePlacingsModalOpen ||
        isRemovePlacingsFinalModalOpen ||
        isTournamentNumberCodeModalOpen ||
        isTournamentNumberTypeModalOpen ||
        isTournamentNumberModalOpen ||
        isTournamentNumberFinalModalOpen ||
        isLocked;

    const isMatchRectLocked =
        isCalculating ||
        isRestartModalOpen ||
        isTerminateModalOpen ||
        isScoreBoardResetModalOpen ||
        isScoreBoardResetConfirmModalOpen ||
        isStatsAdminModalOpen ||
        isAddPlacingsCodeModalOpen ||
        isAddPlacingsModalOpen ||
        isAddPlacingsFinalModalOpen ||
        isRemovePlacingsCodeModalOpen ||
        isRemovePlacingsModalOpen ||
        isRemovePlacingsFinalModalOpen ||
        isTournamentNumberCodeModalOpen ||
        isTournamentNumberTypeModalOpen ||
        isTournamentNumberModalOpen ||
        isTournamentNumberFinalModalOpen ||
        showIntro ||
        isLocked;

    const isScoreBoardButtonLocked =
        isTerminateModalOpen ||
        isRestartModalOpen ||
        isScoreBoardResetModalOpen ||
        isScoreBoardResetConfirmModalOpen ||
        isStatsAdminModalOpen ||
        isAddPlacingsCodeModalOpen ||
        isAddPlacingsModalOpen ||
        isAddPlacingsFinalModalOpen ||
        isRemovePlacingsCodeModalOpen ||
        isRemovePlacingsModalOpen ||
        isRemovePlacingsFinalModalOpen ||
        isTournamentNumberCodeModalOpen ||
        isTournamentNumberTypeModalOpen ||
        isTournamentNumberModalOpen ||
        isTournamentNumberFinalModalOpen ||
        isLocked;

    const isScoreBoardResetButtonLocked =
        isTerminateModalOpen ||
        isRestartModalOpen ||
        isScoreBoardResetModalOpen ||
        isScoreBoardResetConfirmModalOpen ||
        isStatsAdminModalOpen ||
        isAddPlacingsCodeModalOpen ||
        isAddPlacingsModalOpen ||
        isAddPlacingsFinalModalOpen ||
        isRemovePlacingsCodeModalOpen ||
        isRemovePlacingsModalOpen ||
        isRemovePlacingsFinalModalOpen ||
        isTournamentNumberCodeModalOpen ||
        isTournamentNumberTypeModalOpen ||
        isTournamentNumberModalOpen ||
        isTournamentNumberFinalModalOpen ||
        isLocked;

    const isReadOnlyView = viewPhase.startsWith("results_");

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            const seeds = classifyTeamsForStages(allTeams, teamRatingsRef.current);
            tournamentSeedsRef.current = seeds;

            const s1 = buildSwissStage("stage1", seeds.stage1Seeds.map(toBaseTeam));
            setStage1(s1);
            setStage2(null);
            setStage3(null);
            setPlayoffs(null);
            setActivePhase("stage1");
            setViewPhase("stage1");
            return;
        }

        try {
            const parsed = JSON.parse(saved);

            tournamentSeedsRef.current = parsed.tournamentSeeds ?? null;
            setShowIntro(parsed.showIntro ?? true);

            setActivePhase(parsed.activePhase ?? "stage1");
            setViewPhase(parsed.viewPhase ?? "stage1");

            setStage1(parsed.stage1 ?? null);
            setStage2(parsed.stage2 ?? null);
            setStage3(parsed.stage3 ?? null);
            setPlayoffs(parsed.playoffs ?? null);

            const savedPemSeries = parsed.pemSeries ?? parsed.pemSmall ?? null;
            const isLegacyPemMainPlaceholder = savedPemSeries?.event === "main" && !parsed.pemMain && !parsed.pemStage1;
            setPemSeries(isLegacyPemMainPlaceholder ? { ...savedPemSeries, event: "cst" } : savedPemSeries);
            setQualifier(parsed.qualifier ?? null);
            qualifierRef.current = parsed.qualifier ?? null;
            setQualifierGroupView(QUALIFIER_GROUPS.includes(parsed.qualifierGroupView) ? parsed.qualifierGroupView : "A");
            setCst(parsed.cst ?? null);
            cstRef.current = parsed.cst ?? null;
            setEcl(parsed.ecl ?? null);
            eclRef.current = parsed.ecl ?? null;
            setPemStage1(parsed.pemStage1 ?? null);
            pemStage1Ref.current = parsed.pemStage1 ?? null;
            setPemMain(parsed.pemMain ?? null);
            pemMainRef.current = parsed.pemMain ?? null;
            setPemGroupView(PEM_MAIN_GROUPS.includes(parsed.pemGroupView) ? parsed.pemGroupView : "A");
            setGplSeries(parsed.gplSeries ?? null);
            setGcc(parsed.gcc ?? null);
            gccRef.current = parsed.gcc ?? null;
            setPbs(parsed.pbs ?? null);
            pbsRef.current = parsed.pbs ?? null;

            setSeriesState(parsed.seriesState ? { ...defaultSeriesState, ...parsed.seriesState } : defaultSeriesState);

            setNeededPickemPoints(parsed.neededPickemPoints ?? getRandomNeededPickemPoints());
            setFinalPickemPoints(parsed.finalPickemPoints ?? 0);
            setGuessedCounts(parsed.guessedCounts ?? guessedCounts);

            setShowPickemSummary(parsed.showPickemSummary ?? false);
            setShowPickemLine2(parsed.showPickemLine2 ?? false);
            setShowPickemResult(parsed.showPickemResult ?? false);
            setPickemSummarySeen(parsed.pickemSummarySeen ?? (parsed.showPickemResult ?? false));

            setShowWinnersScreen(parsed.showWinnersScreen ?? false);
            setTournamentResults(parsed.tournamentResults ?? null);
            setShowWinnerText(parsed.showWinnerText ?? false)
            setShowPodium(parsed.showWinnerText ?? false)
            setShowProceed(parsed.showWinnerText ?? false)
            setWinnersText(parsed.winnersText ?? "And the Fourth Place is:");
            setHasPlayedWinnerAnimation(parsed.hasPlayedWinnerAnimation ?? false);
        } catch (e) {
            console.error(e);
            const seeds = tournamentSeedsRef.current ?? classifyTeamsForStages(allTeams, teamRatingsRef.current);
            const s1 = buildSwissStage("stage1", seeds.stage1Seeds.map(toBaseTeam));
            setStage1(s1);
            setStage2(null);
            setStage3(null);
            setPlayoffs(null);
            setActivePhase("stage1");
            setViewPhase("stage1");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const stateToSave = {
            showIntro,
            showTournamentIntro,
            activePhase,
            viewPhase,
            stage1,
            stage2,
            stage3,
            playoffs,
            pemSeries,
            qualifier,
            qualifierGroupView,
            cst,
            ecl,
            pemStage1,
            pemMain,
            pemGroupView,
            gplSeries,
            gcc,
            pbs,
            seriesState,
            neededPickemPoints,
            finalPickemPoints,
            guessedCounts,
            showPickemSummary,
            showPickemLine2,
            showPickemResult,
            pickemSummarySeen,
            showWinnersScreen,
            tournamentResults,
            showWinnerText,
            showPodium,
            showProceed,
            winnersText,
            hasPlayedWinnerAnimation,

            tournamentSeeds: tournamentSeedsRef.current
                ? {
                    stage1Seeds: tournamentSeedsRef.current.stage1Seeds.map(toBaseTeam),
                    stage2Seeds: tournamentSeedsRef.current.stage2Seeds.map(toBaseTeam),
                    stage3Seeds: tournamentSeedsRef.current.stage3Seeds.map(toBaseTeam),
                }
                : null,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [
        showIntro,
        showTournamentIntro,
        activePhase,
        viewPhase,
        stage1,
        stage2,
        stage3,
        playoffs,
        pemSeries,
        qualifier,
        qualifierGroupView,
        cst,
        ecl,
        pemStage1,
        pemMain,
        pemGroupView,
        gplSeries,
        gcc,
        pbs,
        seriesState,
        neededPickemPoints,
        finalPickemPoints,
        guessedCounts,
        showPickemSummary,
        showPickemLine2,
        showPickemResult,
        pickemSummarySeen,
        showWinnersScreen,
        tournamentResults,
        showWinnerText,
        showPodium,
        showProceed,
        winnersText,
        hasPlayedWinnerAnimation,
    ]);

    useEffect(() => {
        saveTournamentNumber(tournamentNumber);
    }, [tournamentNumber]);


    const tournamentTheme = getTournamentTheme(tournamentNumber);

    const gplEdition = gplSeries?.edition ?? (tournamentNumbers?.[GPL_TYPE_ID] ?? 0);

    const gplLabel = useMemo(() => (
        <>
            Global Pro League{" "}
            <span style={getTournamentNumberStyle(getTournamentTheme(gplEdition))}>
                #{gplEdition}
            </span>
        </>
    ), [gplEdition]);

    const tournamentLabel = useMemo(() => (isGplMainPhase ? gplLabel : (
        <>
            Official{" "}
            <span style={getTournamentNumberStyle(tournamentTheme)}>
                #{tournamentNumber}
            </span>
        </>
    )), [tournamentNumber, tournamentTheme, isGplMainPhase, gplLabel]);

    const gccNumber = gplSeries?.gccNumber ?? (tournamentNumbers?.[GCC_TYPE_ID] ?? 0);

    const gccLabel = useMemo(() => (
        <>
            Global Challenger Cup{" "}
            <span style={getTournamentNumberStyle(getTournamentTheme(gccNumber))}>
                #{gccNumber}
            </span>
        </>
    ), [gccNumber]);

    const pbsEdition = pbs?.edition ?? (tournamentNumbers?.[PBS_TYPE_ID] ?? 0);

    const pbsLabel = useMemo(() => (
        <>
            Premier Bounty Series{" "}
            <span style={getTournamentNumberStyle(getTournamentTheme(pbsEdition))}>
                Season {pbsEdition}
            </span>
        </>
    ), [pbsEdition]);

    const pemEdition = pemSeries?.edition ?? (tournamentNumbers?.[pemType] ?? 0);

    const pemLabel = useMemo(() => (
        <>
            {pemConfig.label}{" "}
            <span style={getTournamentNumberStyle(getTournamentTheme(pemEdition))}>
                #{pemEdition}
            </span>
        </>
    ), [pemEdition, pemConfig.label]);

    const pemStatsKey = `${pemConfig.statsKeyPrefix}${pemEdition}`;

    const cstNumber = pemSeries?.cstNumber ?? (tournamentNumbers?.[CST_TYPE_ID] ?? 0);

    const cstLabel = useMemo(() => (
        <>
            Champions Series Tour{" "}
            <span style={getTournamentNumberStyle(getTournamentTheme(cstNumber))}>
                #{cstNumber}
            </span>
        </>
    ), [cstNumber]);

    const eclNumber = pemSeries?.eclNumber ?? (tournamentNumbers?.[ECL_TYPE_ID] ?? 0);

    const eclLabel = useMemo(() => (
        <>
            Elite Competition League{" "}
            <span style={getTournamentNumberStyle(getTournamentTheme(eclNumber))}>
                #{eclNumber}
            </span>
        </>
    ), [eclNumber]);

    const getTypeNumber = (typeId) =>
        typeId === "Official"
            ? tournamentNumber
            : (tournamentNumbers?.[typeId] ?? 0);

    const setTypeNumber = (typeId, next) => {
        if (typeId === "Official") {
            setTournamentNumber(next);
            saveTournamentNumber(next);
            return;
        }
        setTournamentNumbers((prev) => {
            const updated = { ...prev, [typeId]: next };
            saveTournamentNumbers(updated);
            return updated;
        });
    };

    const renderTournamentLabelFor = (typeId, number, { highlightName = true, qualifier = false } = {}) => {
        const config = getTournamentTypeConfig(typeId);
        const highlight = highlightName && config.highlightCard;
        return (
            <>
                <span
                    style={{
                        textShadow: highlight ? "0 0 24px rgba(255, 215, 0, 0.9)" : "",
                        color: highlight ? "rgba(255, 215, 0, 0.9)" : "",
                    }}
                >
                    {config.label}{qualifier ? " Qualifier" : ""}
                </span>{" "}
                <span style={getTournamentNumberStyle(getTournamentTheme(number))}>
                    {formatTournamentNumber(typeId, number)}
                </span>
            </>
        );
    };

    const confirmRestart = () => {
        localStorage.removeItem(STORAGE_KEY);
        if (!tournamentResults) {
            if (pbs) {
                setTypeNumber(PBS_TYPE_ID, Math.max(0, getTypeNumber(PBS_TYPE_ID) - 1));
            } else if (gplSeries?.event === "gcc") {
                setTypeNumber(GCC_TYPE_ID, Math.max(0, getTypeNumber(GCC_TYPE_ID) - 1));
            } else if (gplSeries?.event === "gpl") {
                setTypeNumber(GPL_TYPE_ID, Math.max(0, getTypeNumber(GPL_TYPE_ID) - 1));
            } else if (pemSeries?.event === "cst") {
                setTypeNumber(CST_TYPE_ID, Math.max(0, getTypeNumber(CST_TYPE_ID) - 1));
            } else if (pemSeries?.event === "ecl") {
                setTypeNumber(ECL_TYPE_ID, Math.max(0, getTypeNumber(ECL_TYPE_ID) - 1));
            } else if (pemSeries?.event === "main") {
                // ignore
            } else if (pemSeries) {
                setTypeNumber(pemType, Math.max(0, getTypeNumber(pemType) - 1));
            } else {
                setTournamentNumber((prev) => {
                    const next = Math.max(0, prev - 1);
                    saveTournamentNumber(next);
                    return next;
                });
            }
        }

        tournamentSeedsRef.current = null;

        if (ratingsSnapshotRef.current) {
            setTeamRatings(ratingsSnapshotRef.current);
            teamRatingsRef.current = ratingsSnapshotRef.current;
            saveTeamRatings(ratingsSnapshotRef.current);

            ratingsSnapshotRef.current = null;
            clearRatingsSnapshot();
        }

        if (statsSnapshotRef.current) {
            const restoredStats = normalizeTeamStats(allTeams, statsSnapshotRef.current);
            setTeamStats(restoredStats);
            teamStatsRef.current = restoredStats;
            saveTeamStats(restoredStats);

            statsSnapshotRef.current = null;
            clearStatsSnapshot();
        }

        const seeds = classifyTeamsForStages(allTeams, teamRatingsRef.current);
        tournamentSeedsRef.current = seeds;

        const s1 = buildSwissStage("stage1", seeds.stage1Seeds.map(toBaseTeam));
        setStage1(s1);
        setStage2(null);
        setStage3(null);
        setPlayoffs(null);

        setPemSeries(null);
        setQualifier(null);
        setCst(null);
        cstRef.current = null;
        setEcl(null);
        eclRef.current = null;
        setPemStage1(null);
        pemStage1Ref.current = null;
        qualifierRef.current = null;
        setQualifierGroupView("A");
        setPemMain(null);
        pemMainRef.current = null;
        setPemGroupView("A");
        setGplSeries(null);
        setGcc(null);
        gccRef.current = null;
        setPbs(null);
        pbsRef.current = null;
        clearPbsDraftProgress();

        setActivePhase("stage1");
        setViewPhase("stage1");
        setShowIntro(true);

        setSeriesState(defaultSeriesState);
        clearRoundLog();

        setNeededPickemPoints(getRandomNeededPickemPoints());
        setFinalPickemPoints(0);
        setGuessedCounts({ stage1: 0, stage2: 0, stage3: 0, ro16: 0, qf: 0, sf: 0, tpd: 0, gf: 0 });

        setShowPickemSummary(false);
        setShowPickemLine2(false);
        setShowPickemResult(false);
        setPickemSummarySeen(false);

        setShowWinnersScreen(false);
        setTournamentResults(null);

        setHasPlayedWinnerAnimation(false);
        setWinnersText("And the Fourth Place is:");

        setIsRestartModalOpen(false);
    };

    const confirmTerminate = () => {
        setIsTerminateModalOpen(false);
        navigate("/");
    };

    const resetSpecialModeState = () => {
        confirmRestart();
        setIsRestartModalOpen(false);
        setIsTerminateModalOpen(false);
    };

    const resetTournamentStateWithSeeds = (seededStage1Seeds) => {
        localStorage.removeItem(STORAGE_KEY);
        clearRoundLog();

        const s1 = buildSwissStage("stage1", seededStage1Seeds);
        setStage1(s1);
        setStage2(null);
        setStage3(null);
        setPlayoffs(null);

        setPemSeries(null);
        setQualifier(null);
        setCst(null);
        cstRef.current = null;
        setEcl(null);
        eclRef.current = null;
        setPemStage1(null);
        pemStage1Ref.current = null;
        qualifierRef.current = null;
        setQualifierGroupView("A");
        setPemMain(null);
        pemMainRef.current = null;
        setPemGroupView("A");
        setGplSeries(null);
        setGcc(null);
        gccRef.current = null;
        setPbs(null);
        pbsRef.current = null;
        clearPbsDraftProgress();

        setActivePhase("stage1");
        setViewPhase("stage1");
        setShowIntro(true);

        setSeriesState(defaultSeriesState);
        clearRoundLog();

        setNeededPickemPoints(getRandomNeededPickemPoints());
        setFinalPickemPoints(0);
        setGuessedCounts({
            stage1: 0,
            stage2: 0,
            stage3: 0,
            ro16: 0,
            qf: 0,
            sf: 0,
            tpd: 0,
            gf: 0,
        });

        setShowPickemSummary(false);
        setShowPickemLine2(false);
        setShowPickemResult(false);
        setPickemSummarySeen(false);

        setShowWinnersScreen(false);
        setTournamentResults(null);

        setIsRestartModalOpen(false);
        setIsTerminateModalOpen(false);
    };

    const ensureRatingsSnapshot = () => {
        if (!ratingsSnapshotRef.current) {
            const snap = { ...teamRatingsRef.current };
            ratingsSnapshotRef.current = snap;
            saveRatingsSnapshot(snap);
        }

        if (!statsSnapshotRef.current) {
            const statsSnap = normalizeTeamStats(allTeams, teamStatsRef.current);
            statsSnapshotRef.current = statsSnap;
            saveStatsSnapshot(statsSnap);
        }
    };

    useEffect(() => {
        if (!showIntro) ensureRatingsSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showIntro]);

    const getDisplayedValue = (t) => {
        const p = teamPlacings?.[t.id] ?? EMPTY_TEAM_PLACINGS;

        if (Object.hasOwn(EMPTY_TEAM_PLACINGS, placingCategory)) return p[placingCategory] ?? 0;
        if (placingCategory === "points") return teamRatings?.[t.id] ?? 0;
        if (placingCategory === "") return null;
        return teamRatings?.[t.id] ?? 0;
    };

    const getSortValue = (t) => {
        const p = teamPlacings?.[t.id] ?? EMPTY_TEAM_PLACINGS;

        if (Object.hasOwn(EMPTY_TEAM_PLACINGS, placingCategory)) return p[placingCategory] ?? 0;

        switch (placingCategory) {
            case "points":
                return teamRatings?.[t.id] ?? 0;
            default:
                return teamRatings?.[t.id] ?? 0;
        }
    };

    const toggleSelectAllTeams = () => {
        setSelectedPlacingTeamIds(prev => {
            if (prev.length === allTeamIds.length) return [];
            return [...allTeamIds];
        });
    };

    const updateTournamentPicker = (next) => {
        setTournamentPicker(next);
        saveTournamentPicker(next);
    };

    const handlePickRandomTournament = () => {
        if (tournamentPicker.random) return;
        updateTournamentPicker(DEFAULT_TOURNAMENT_PICKER);
    };

    const handleToggleTournamentType = (id) => {
        if (tournamentPicker.random) {
            updateTournamentPicker({ random: false, ids: [id] });
            return;
        }

        const ids = tournamentPicker.ids.includes(id)
            ? tournamentPicker.ids.filter((x) => x !== id)
            : [...tournamentPicker.ids, id];

        updateTournamentPicker(ids.length > 0 ? { random: false, ids } : DEFAULT_TOURNAMENT_PICKER);
    };

    useEffect(() => {
        if (!isTournamentPickerOpen) return undefined;
        const onKeyDown = (e) => {
            if (e.key === "Escape") setIsTournamentPickerOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isTournamentPickerOpen]);

    const createPbsDraft = (round, entrants) => ({
        id: `${round}-${Date.now()}`,
        round,
        entrants: entrants.map(({ id, seed, bounty }) => ({ id, seed, bounty: bounty ?? 0 })),
        plan: null,
        speed: 1,
        paused: false,
    });

    const updatePbsDraft = (changes) => {
        setPbs((prev) => {
            const next = prev?.draft ? { ...prev, draft: { ...prev.draft, ...changes } } : prev;
            pbsRef.current = next;
            return next;
        });
    };

    const setPbsDraftSpeed = (speed) => updatePbsDraft({ speed });

    const togglePbsDraftPause = () => updatePbsDraft({ paused: !pbsRef.current?.draft?.paused });

    const skipPbsDraftShow = () => {
        if (pbsDraftClock && pbsDraftTimeline) {
            pbsDraftClock.setProgress(Math.max(pbsDraftClock.getProgress(), pbsDraftTimeline.rollOut[0]));
        }
        updatePbsDraft({ paused: false });
    };

    const handleTournamentStart = () => {
        const nextTournamentType = pickTournamentType(tournamentPicker);
        setCurrentTournamentType(nextTournamentType);
        saveCurrentTournamentType(nextTournamentType);
        setIsTournamentPickerOpen(false);

        const pemSeeds = isPemSeriesType(nextTournamentType)
            ? buildPemSeeds(allTeams, teamRatingsRef.current, nextTournamentType)
            : null;
        const gplSeeds = nextTournamentType === GPL_TYPE_ID
            ? buildGplSeeds(allTeams, teamRatingsRef.current)
            : null;
        const pbsSeeds = nextTournamentType === PBS_TYPE_ID
            ? buildPbsSeeds(allTeams, teamRatingsRef.current)
            : null;
        const pulledTeamIds = pemSeeds
            ? pemSeeds.qualifier.map((team) => team.id)
            : gplSeeds
                ? gplSeeds.gcc.map((team) => team.id)
                : pbsSeeds
                    ? pbsSeeds.map((team) => team.id)
                    : null;

        const statsBeforeStart = normalizeTeamStats(allTeams, teamStatsRef.current);
        statsSnapshotRef.current = statsBeforeStart;
        saveStatsSnapshot(statsBeforeStart);

        const statsWithFreshExperience = resetBattleExperience(pullStatsTowardStart(teamStatsRef.current, pulledTeamIds));
        setTeamStats(statsWithFreshExperience);
        teamStatsRef.current = statsWithFreshExperience;
        saveTeamStats(statsWithFreshExperience);

        if (pemSeeds) {
            const edition = getTypeNumber(nextTournamentType) + 1;
            setTypeNumber(nextTournamentType, edition);

            const seeds = pemSeeds;
            const groups = splitQualifierGroups(seeds.qualifier);
            const builtQualifier = buildQualifier(groups);

            setPemSeries({ type: nextTournamentType, edition, seeds, groups, event: "qualifier", qualified: [], pulledTeamIds });
            setPbs(null);
            pbsRef.current = null;
            setGplSeries(null);
            setGcc(null);
            gccRef.current = null;
            setQualifier(builtQualifier);
            qualifierRef.current = builtQualifier;
            setCst(null);
            cstRef.current = null;
            setEcl(null);
            eclRef.current = null;
            setPemStage1(null);
            pemStage1Ref.current = null;
            setPemMain(null);
            pemMainRef.current = null;
            setPemGroupView("A");
            setQualifierGroupView("A");
            setActivePhase("qualifier");
            setViewPhase("qualifier");
            setNeededPickemPoints(getRandomQualifierNeededPickemPoints());
        } else if (gplSeeds) {
            const number = getTypeNumber(GCC_TYPE_ID) + 1;
            setTypeNumber(GCC_TYPE_ID, number);

            const builtGcc = buildGccLeague(gplSeeds.gcc);

            setGplSeries({ type: GPL_TYPE_ID, seeds: gplSeeds, event: "gcc", gccNumber: number, pulledTeamIds });
            setPbs(null);
            pbsRef.current = null;
            setGcc(builtGcc);
            gccRef.current = builtGcc;
            setPlayoffs(null);

            setPemSeries(null);
            setQualifier(null);
            qualifierRef.current = null;
            setCst(null);
            cstRef.current = null;
            setEcl(null);
            eclRef.current = null;
            setPemStage1(null);
            pemStage1Ref.current = null;
            setPemMain(null);
            pemMainRef.current = null;

            setActivePhase("gccLeague");
            setViewPhase("gccLeague");
            setNeededPickemPoints(getRandomGccNeededPickemPoints());
        } else if (pbsSeeds) {
            const edition = getTypeNumber(PBS_TYPE_ID) + 1;
            setTypeNumber(PBS_TYPE_ID, edition);

            const builtPbs = {
                type: PBS_TYPE_ID,
                edition,
                seeds: pbsSeeds,
                status: buildPbsStatus(pbsSeeds),
                draft: createPbsDraft("ro32", pbsSeeds),
                draws: {},
                pulledTeamIds,
            };

            clearPbsDraftProgress();
            setPbs(builtPbs);
            pbsRef.current = builtPbs;
            setPlayoffs(buildPbsBracket());

            setPemSeries(null);
            setGplSeries(null);
            setGcc(null);
            gccRef.current = null;
            setQualifier(null);
            qualifierRef.current = null;
            setCst(null);
            cstRef.current = null;
            setEcl(null);
            eclRef.current = null;
            setPemStage1(null);
            pemStage1Ref.current = null;
            setPemMain(null);
            pemMainRef.current = null;

            setActivePhase("playoffs");
            setViewPhase("pbsStage1");
            setNeededPickemPoints(getRandomPbsNeededPickemPoints());
        } else {
            tournamentSeedsRef.current = classifyTeamsForStages(allTeams, teamRatingsRef.current);

            setPemSeries(null);
            setPbs(null);
            pbsRef.current = null;
            setGplSeries(null);
            setGcc(null);
            gccRef.current = null;
            setQualifier(null);
            setCst(null);
            cstRef.current = null;
            setEcl(null);
            eclRef.current = null;
            setPemStage1(null);
            pemStage1Ref.current = null;
            qualifierRef.current = null;
            setPemMain(null);
            pemMainRef.current = null;

            setTournamentNumber((prev) => {
                const next = prev + 1;
                saveTournamentNumber(next);
                return next;
            });
        }

        setShowIntro(false);
        setShowTournamentIntro(true);
    };

    const handleCloseTournamentIntro = () => {
        setShowTournamentIntro(false);
    };

    const buildStage2IfNeeded = (s1) => {
        if (stage2) return stage2;

        const frozen = tournamentSeedsRef.current || classifyTeamsForStages(allTeams, teamRatingsRef.current);

        const qualifiers = getSwissQualified(s1).map(toBaseTeam);
        const seeds = frozen.stage2Seeds.map(toBaseTeam);

        const combined = uniqById([...seeds, ...qualifiers]);

        return buildSwissStage("stage2", combined, s1.format ?? null);
    };

    const buildStage3IfNeeded = (s2) => {
        if (stage3) return stage3;

        const frozen = tournamentSeedsRef.current || classifyTeamsForStages(allTeams, teamRatingsRef.current);

        const qualifiers = getSwissQualified(s2).map(toBaseTeam);
        const seeds = frozen.stage3Seeds.map(toBaseTeam);

        const combined = uniqById([...seeds, ...qualifiers]);

        return buildSwissStage("stage3", combined);
    };

    const buildPlayoffsIfNeeded = (s3) => {
        if (playoffs) return playoffs;
        const qualifiers = getSwissQualified(s3).slice(0, 16);
        return buildPlayoffsBracket(qualifiers);
    };

    const calculateBuchholz = (stage) => {
        const teamMap = Object.fromEntries(
            stage.teams.map((t) => [t.id, t])
        );

        stage.teams.forEach((team) => {
            team.buchholz = team.opponents.reduce(
                (sum, oppId) => {
                    const opp = teamMap[oppId];
                    return sum + (opp?.wins ?? 0);
                },
                0
            );
        });
    };

    const swissMatchPoints = (match) => {
        if (!match.played || !match.pickTeamId) return 0;

        const bestOf = getBestOfForSwissNet(match.net, match.stageKey, match.format);

        const isCorrectPick = match.winnerTeamId === match.pickTeamId;

        if (bestOf === 1) {
            return isCorrectPick ? 1 : 0;
        }

        if (bestOf === 3) {
            if (isCorrectPick) return 3;

            const pickedIsLeft =
                match.slotA && match.pickTeamId === match.slotA.id;

            const pickedSets = pickedIsLeft
                ? (match.scoreLeft ?? 0)
                : (match.scoreRight ?? 0);

            return pickedSets >= 1 ? 2 : 0;
        }

        if (bestOf === 5) {
            if (isCorrectPick) return 5;

            const pickedIsLeft =
                match.slotA && match.pickTeamId === match.slotA.id;

            const pickedSets = pickedIsLeft
                ? (match.scoreLeft ?? 0)
                : (match.scoreRight ?? 0);

            if (pickedSets >= 2) return 4;
            if (pickedSets >= 1) return 2;

            return 0;
        }

        return 0;
    };

    const playoffsMatchPoints = (match) => {
        if (!match.played || !match.pickTeamId) return 0;
        const baseMap = match.cst
            ? CST_PLAYOFFS_BEST_OF
            : match.gcc
                ? GCC_KNOCKOUT_BEST_OF
                : match.pbs
                    ? PBS_BEST_OF
                    : match.pemBig || match.gpl
                    ? PEM_BIG_PLAYOFFS_BEST_OF
                    : match.pem
                        ? PEM_PLAYOFFS_BEST_OF
                        : { ro16: 5, qf: 5, sf: 7, thirdPlace: 7, gf: 9 };
        const base = baseMap[match.stage] ?? 0;

        if (match.winnerTeamId === match.pickTeamId) return base;

        const pickedIsLeft = match.slotA && match.pickTeamId === match.slotA.id;
        const pickedSets = pickedIsLeft ? (match.scoreLeft ?? 0) : (match.scoreRight ?? 0);
        return (pickedSets || 0) * 2;
    };

    const resolveSwissMatchResult = (stage, match, winnerTeamId, scoreLeft, scoreRight) => {
        if (!match?.slotA || !match?.slotB) return;

        const winner = winnerTeamId === match.slotA.id ? match.slotA : match.slotB;
        const loser = winnerTeamId === match.slotA.id ? match.slotB : match.slotA;

        winner.wins += 1;
        winner.netEntryOrder = netEntryCounterRef.current++;
        loser.losses += 1;
        loser.netEntryOrder = netEntryCounterRef.current++;

        match.played = true;
        match.scoreLeft = scoreLeft;
        match.scoreRight = scoreRight;
        match.winnerTeamId = winner.id;
        match.loserTeamId = loser.id;
        winner.opponents.push(loser.id);
        loser.opponents.push(winner.id);

        if (typeof stage.resultCounter !== "number") stage.resultCounter = 0;

        if (!winner.qualified && winner.wins >= 3) {
            winner.qualified = true;
            winner.qualifiedVia = `3:${winner.losses}`;
            winner.qualifiedAt = ++stage.resultCounter;
        }

        if (!loser.eliminated && loser.losses >= 3) {
            loser.eliminated = true;
            loser.eliminatedVia = `${loser.wins}:3`;
            loser.eliminatedAt = ++stage.resultCounter;
        }
    };

    const recomputePickemTotals = (
        qualifierOverride = undefined,
        cstOverride = undefined,
        pemMainOverride = undefined,
        playoffsOverride = undefined,
        { ecl: eclOverride = undefined, pemStage1: pemStage1Override = undefined, gcc: gccOverride = undefined } = {}
    ) => {
        let total = 0;
        const nextCounts = {
            stage1: 0,
            stage2: 0,
            stage3: 0,
            gcc_league: 0,
            po: 0,
            ro32: 0,
            ro16: 0,
            qf: 0,
            sf: 0,
            tpd: 0,
            gf: 0,
            correct: 0,
        };
        QUALIFIER_PICKEM_ROUNDS.forEach(({ key }) => {
            nextCounts[key] = 0;
        });
        CST_GROUPS.forEach((group) => {
            nextCounts[`cst_${group}`] = 0;
        });
        PEM_GROUP_PICKEM_ROUNDS.forEach(({ key }) => {
            nextCounts[key] = 0;
        });
        ECL_PICKEM_ROUNDS.forEach(({ key }) => {
            nextCounts[key] = 0;
        });
        PEM_STAGE1_PICKEM_ROUNDS.forEach(({ key }) => {
            nextCounts[key] = 0;
        });

        const applySwiss = (stg, countKey) => {
            if (!stg) return;
            Object.values(stg.matchesByNet || {}).forEach((arr) => {
                arr.forEach((m) => {
                    if (!m.played || !m.pickTeamId) return;
                    total += swissMatchPoints(m);
                    if (m.winnerTeamId === m.pickTeamId) nextCounts[countKey] += 1;
                    if (m.winnerTeamId === m.pickTeamId) {
                        nextCounts.correct += swissMatchPoints(m);
                    }
                });
            });
        };

        const applyPlayoffs = (br) => {
            if (!br) return;
            const addStage = (stageKey, countKey) => {
                const arr = br[stageKey] || [];
                arr.forEach((m) => {
                    if (!m.played || !m.pickTeamId) return;
                    total += playoffsMatchPoints(m);
                    if (m.winnerTeamId === m.pickTeamId) nextCounts[countKey] += 1;
                    if (m.winnerTeamId === m.pickTeamId) {
                        nextCounts.correct += playoffsMatchPoints(m);
                    }
                });
            };

            addStage("ro32", "ro32");
            addStage("po", "po");
            addStage("ro16", "ro16");
            addStage("qf", "qf");
            addStage("sf", "sf");
            addStage("thirdPlace", "tpd");
            addStage("gf", "gf");
        };

        const applyQualifier = (q) => {
            if (!q) return;
            getQualifierMatches(q).forEach((m) => {
                if (!m.played || !m.pickTeamId) return;
                const points = qualifierMatchPoints(m);
                total += points;
                if (m.winnerTeamId === m.pickTeamId) {
                    nextCounts[`q_${m.stage}`] += 1;
                    nextCounts.correct += points;
                }
            });
        };

        const applyCstGroups = (stage) => {
            getCstGroupMatches(stage).forEach((m) => {
                if (!m.played || !m.pickTeamId) return;
                const points = cstGroupMatchPoints(m);
                total += points;
                if (points > 0) {
                    nextCounts[`cst_${m.group}`] += 1;
                    nextCounts.correct += points;
                }
            });
        };

        const applyPemGroups = (groupStage) => {
            getPemGroupMatches(groupStage).forEach((m) => {
                if (!m.played || !m.pickTeamId) return;
                const points = pemGroupMatchPoints(m);
                total += points;
                if (m.winnerTeamId === m.pickTeamId) {
                    nextCounts[`pem_${m.stage}`] += 1;
                    nextCounts.correct += points;
                }
            });
        };

        const applyBracketMatches = (matches, pointsOf, countPrefix) => {
            matches.forEach((m) => {
                if (!m.played || !m.pickTeamId) return;
                const points = pointsOf(m);
                total += points;
                if (m.winnerTeamId === m.pickTeamId) {
                    nextCounts[`${countPrefix}_${m.stage}`] += 1;
                    nextCounts.correct += points;
                }
            });
        };

        const applyGccLeague = (league) => {
            getGccLeagueMatches(league).forEach((m) => {
                if (!m.played || !m.pickTeamId) return;
                const points = gccLeagueMatchPoints(m);
                total += points;
                if (m.winnerTeamId === m.pickTeamId) {
                    nextCounts.gcc_league += 1;
                    nextCounts.correct += points;
                }
            });
        };

        const currentPlayoffs = playoffsOverride ?? playoffs;

        if (isPbsPhase || currentPlayoffs?.kind === "pbs") {
            applyPlayoffs(currentPlayoffs);
        } else if (activePhase === "qualifier" || qualifierOverride) {
            applyQualifier(qualifierOverride ?? qualifier);
        } else if (pemMainOverride || pemStage1Override || isPemMainPhase) {
            applyBracketMatches(getPemStage1Matches(pemStage1Override ?? pemStage1), pemStage1MatchPoints, "ps1");
            applyPemGroups(pemMainOverride ?? pemMain);
            if (isPemPlayoffsKind(currentPlayoffs?.kind)) applyPlayoffs(currentPlayoffs);
        } else if (eclOverride || isEclPhase) {
            applyBracketMatches(getEclMatches(eclOverride ?? ecl), eclMatchPoints, "ecl");
        } else if (cstOverride || isCstPhase) {
            applyCstGroups(cstOverride ?? cst);
            if (playoffs?.kind === "cst") applyPlayoffs(playoffs);
        } else if (gccOverride || isGccPhase) {
            applyGccLeague(gccOverride ?? gcc);
            if (currentPlayoffs?.kind === "gcc") applyPlayoffs(currentPlayoffs);
        } else {
            applySwiss(stage1, "stage1");
            applySwiss(stage2, "stage2");
            applySwiss(stage3, "stage3");
            applyPlayoffs(playoffs);
        }

        setFinalPickemPoints(total);
        setGuessedCounts(nextCounts);
    };

    const openSwissMatchModal = (stageKey, net, matchId, readOnly = false) => {
        const stg = getStageObj(stageKey);
        if (!stg) return;

        const match = (stg.matchesByNet[net] || []).find((m) => m.id === matchId);
        if (!match || !match.slotA || !match.slotB) return;

        setModalContext({ type: "swiss", stageKey, net, matchId, readOnly, format: stg.format ?? null });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openArchivedSwissMatchModal = (record, stageKey, net, index, match) => {
        if (!match || !match.slotA || !match.slotB) return;

        setSelectedHallMatch({ record, stage: stageKey, index, match });
        setModalContext({
            type: "swiss",
            stageKey,
            net,
            matchId: match.id || `hall-${stageKey}-${net}-${index}`,
            readOnly: true,
            isArchivedHallOfFame: true,
            format: match.format ?? null,
        });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openGccLeagueMatchModal = (matchId, readOnly = false) => {
        const found = findGccLeagueMatch(gcc, matchId);
        const match = found?.match;
        if (!match || !match.slotA || !match.slotB) return;

        setModalContext({ type: "gccLeague", matchday: found.day + 1, matchId, readOnly });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openArchivedGccLeagueMatchModal = (record, day, index, match) => {
        if (!match || !match.slotA || !match.slotB) return;

        setSelectedHallMatch({ record, day, index, match });
        setModalContext({
            type: "gccLeague",
            matchday: day + 1,
            matchId: match.id || `hall-gcc-md${day + 1}-${index}`,
            readOnly: true,
            isArchivedHallOfFame: true,
        });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openPlayoffsMatchModal = (stage, matchId, readOnly = false) => {
        if (!playoffs) return;
        const match = (playoffs[stage] || []).find((m) => m.id === matchId);
        if (!match || !match.slotA || !match.slotB) return;

        setModalContext({ type: "playoffs", stage, matchId, readOnly, kind: playoffs.kind ?? null });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openQualifierMatchModal = (group, stage, matchId, readOnly = false) => {
        const match = (qualifier?.[group]?.[stage] || []).find((m) => m.id === matchId);
        if (!match || !match.slotA || !match.slotB) return;

        setModalContext({ type: "qualifier", group, stage, matchId, readOnly });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openArchivedQualifierMatchModal = (record, group, stage, index, match) => {
        if (!match || !match.slotA || !match.slotB) return;

        setSelectedHallMatch({ record, group, stage, index, match });
        setModalContext({
            type: "qualifier",
            group,
            stage,
            matchId: match.id || `hall-q${group}-${stage}-${index}`,
            readOnly: true,
            isArchivedHallOfFame: true,
        });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openArchivedHallMatchModal = (record, stage, index, match) => {
        if (!match || !match.slotA || !match.slotB) return;

        setSelectedHallMatch({ record, stage, index, match });
        setModalContext({
            type: "playoffs",
            stage,
            matchId: match.id || `hall-${stage}-${index}`,
            readOnly: true,
            isArchivedHallOfFame: true,
            kind: record?.playoffs?.kind ?? null,
        });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openCstGroupMatchModal = (group, matchId, readOnly = false) => {
        const match = (cst?.[group]?.matches || []).find((m) => m.id === matchId);
        if (!match || !match.slotA || !match.slotB) return;

        setModalContext({ type: "cstGroup", group, matchId, readOnly });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openArchivedCstGroupMatchModal = (record, group, index, match) => {
        if (!match || !match.slotA || !match.slotB) return;

        setSelectedHallMatch({ record, group, index, match });
        setModalContext({
            type: "cstGroup",
            group,
            matchId: match.id || `hall-cst-${group}-${index}`,
            readOnly: true,
            isArchivedHallOfFame: true,
        });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openPemGroupMatchModal = (group, stage, matchId, readOnly = false) => {
        const match = (pemMain?.[group]?.[stage] || []).find((m) => m.id === matchId);
        if (!match || !match.slotA || !match.slotB) return;

        setModalContext({ type: "pemGroup", group, stage, matchId, readOnly });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openArchivedPemGroupMatchModal = (record, group, stage, index, match) => {
        if (!match || !match.slotA || !match.slotB) return;

        setSelectedHallMatch({ record, group, stage, index, match });
        setModalContext({
            type: "pemGroup",
            group,
            stage,
            matchId: match.id || `hall-pem${group}-${stage}-${index}`,
            readOnly: true,
            isArchivedHallOfFame: true,
            pemType: record?.type ?? PEM_SMALL_TYPE_ID,
        });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openEclMatchModal = (_group, stage, matchId, readOnly = false) => {
        const match = (ecl?.[stage] || []).find((m) => m.id === matchId);
        if (!match || !match.slotA || !match.slotB) return;

        setModalContext({ type: "ecl", stage, matchId, readOnly });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openArchivedEclMatchModal = (record, _group, stage, index, match) => {
        if (!match || !match.slotA || !match.slotB) return;

        setSelectedHallMatch({ record, stage, index, match });
        setModalContext({
            type: "ecl",
            stage,
            matchId: match.id || `hall-ecl-${stage}-${index}`,
            readOnly: true,
            isArchivedHallOfFame: true,
        });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openPemStage1MatchModal = (group, stage, matchId, readOnly = false) => {
        const match = (pemStage1?.[group]?.[stage] || []).find((m) => m.id === matchId);
        if (!match || !match.slotA || !match.slotB) return;

        setModalContext({ type: "pemStage1", group, stage, matchId, readOnly });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const openArchivedPemStage1MatchModal = (record, group, stage, index, match) => {
        if (!match || !match.slotA || !match.slotB) return;

        setSelectedHallMatch({ record, group, stage, index, match });
        setModalContext({
            type: "pemStage1",
            group,
            stage,
            matchId: match.id || `hall-ps1${group}-${stage}-${index}`,
            readOnly: true,
            isArchivedHallOfFame: true,
        });
        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setIsMatchModalOpen(true);
    };

    const closeMatchModal = () => {
        const isArchivedHallModal = !!modalContext?.isArchivedHallOfFame;

        setIsMatchModalOpen(false);
        setModalContext(null);
        setModalLeftTeam(null);
        setModalRightTeam(null);
        setHasChosen(false);
        setBreakdownSetIndex(null);

        if (isArchivedHallModal) {
            setSelectedHallMatch(null);
        }
    };

    const handleChooseLeft = () => {
        setHasChosen(true);
    };

    const handleChooseRight = () => {
        if (!modalLeftTeam || !modalRightTeam) return;
        setModalLeftTeam(modalRightTeam);
        setModalRightTeam(modalLeftTeam);
        setHasChosen(true);
    };

    const handleStartMatch = () => {
        if (!hasChosen || !modalContext || !modalLeftTeam || !modalRightTeam) return;
        if (modalContext.readOnly) return;

        toast("First Half begins", {
            icon: "🏁",
            duration: 3000,
        });

        const pickedTeamId = modalLeftTeam.id;

        if (modalContext.type === "swiss") {
            const { stageKey, net, matchId, format = null } = modalContext;
            const bestOf = getBestOfForSwissNet(net, stageKey, format);

            const stageObj = stageKey === "stage1" ? stage1 : stageKey === "stage2" ? stage2 : stage3;
            const netArr = (stageObj && stageObj.matchesByNet && stageObj.matchesByNet[net]) ? stageObj.matchesByNet[net] : [];
            const swissMatchNumber = Math.max(1, (netArr || []).findIndex((m) => m.id === matchId) + 1);

            const applyPick = (setter, stageObj) => {
                const copy = {
                    ...stageObj,
                    teams: stageObj.teams.map((t) => ({ ...t })),
                    matchesByNet: { ...stageObj.matchesByNet },
                };
                const arr = [...(copy.matchesByNet[net] || [])];
                const idx = arr.findIndex((m) => m.id === matchId);
                if (idx < 0) return;
                const m = { ...arr[idx] };
                m.pickTeamId = pickedTeamId;
                m.setHistory = [];
                arr[idx] = m;
                copy.matchesByNet[net] = arr;
                setter(copy);
            };

            if (stageKey === "stage1") applyPick(setStage1, stage1);
            if (stageKey === "stage2") applyPick(setStage2, stage2);
            if (stageKey === "stage3") applyPick(setStage3, stage3);

            clearRoundLog();

            {
                const seededStats = {
                    left: { ...(teamStatsRef.current?.[modalLeftTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                    right: { ...(teamStatsRef.current?.[modalRightTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                };

                setSeriesState({
                    ...defaultSeriesState,
                    active: true,
                    phase: stageKey,
                    swissStageKey: stageKey,
                    swissNet: net,
                    swissMatchId: matchId,
                    swissFormat: format,
                    leftTeam: modalLeftTeam,
                    rightTeam: modalRightTeam,
                    swissMatchNumber: swissMatchNumber,
                    setsToWin: calcSetsToWin(bestOf),
                    initialStats: seededStats,
                    liveStats: seededStats,
                    matchCtx: buildMatchStatContext({
                        kind: "swiss",
                        net,
                        swissStageKey: format === GPL_SWISS_FORMAT ? `gpl:${stageKey}` : stageKey,
                        bestOf,
                        leftTeam: modalLeftTeam,
                        rightTeam: modalRightTeam,
                        seededStats,
                        ratings: teamRatingsRef.current,
                        teams: allTeams,
                    }),
                });
            }

            closeMatchModal();
            return;
        }

        if (modalContext.type === "cstGroup") {
            const { group, matchId } = modalContext;
            const groupMatches = cst?.[group]?.matches || [];
            const cstMatchNumber = Math.max(1, groupMatches.findIndex((m) => m.id === matchId) + 1);

            setCst((prev) => {
                if (!prev?.[group]) return prev;
                const matches = (prev[group].matches || []).map((m) =>
                    m.id === matchId ? { ...m, pickTeamId: pickedTeamId, setHistory: [] } : m
                );
                const next = { ...prev, [group]: { ...prev[group], matches } };
                cstRef.current = next;
                return next;
            });

            clearRoundLog();

            {
                const seededStats = {
                    left: { ...(teamStatsRef.current?.[modalLeftTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                    right: { ...(teamStatsRef.current?.[modalRightTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                };
                lastPlayedCstGroupRef.current = group;
                const hasLostInCstGroupStage = (teamId) =>
                    getCstGroupMatches(cstRef.current).some((m) => m.played && m.loserTeamId === teamId);

                setSeriesState({
                    ...defaultSeriesState,
                    active: true,
                    phase: "cstGroup",
                    allowTie: true,
                    cstGroup: group,
                    cstMatchId: matchId,
                    cstMatchNumber,
                    leftTeam: modalLeftTeam,
                    rightTeam: modalRightTeam,
                    setsToWin: 1,
                    initialStats: seededStats,
                    liveStats: seededStats,
                    matchCtx: buildMatchStatContext({
                        kind: "swiss",
                        swissStageKey: "cst",
                        bestOf: 1,
                        leftTeam: modalLeftTeam,
                        rightTeam: modalRightTeam,
                        seededStats,
                        ratings: teamRatingsRef.current,
                        teams: allTeams,
                        unbeatenEligibleBySide: {
                            left: !hasLostInCstGroupStage(modalLeftTeam?.id),
                            right: !hasLostInCstGroupStage(modalRightTeam?.id),
                        },
                    }),
                });
            }

            closeMatchModal();
            return;
        }

        if (modalContext.type === "gccLeague") {
            const { matchday, matchId } = modalContext;
            const dayMatches = gcc?.matchdays?.[matchday - 1] || [];
            const gccMatchNumber = Math.max(1, dayMatches.findIndex((m) => m.id === matchId) + 1);

            setGcc((prev) => {
                if (!prev?.matchdays?.[matchday - 1]) return prev;
                const matchdays = prev.matchdays.map((day, i) =>
                    i === matchday - 1
                        ? day.map((m) => (m.id === matchId ? { ...m, pickTeamId: pickedTeamId, setHistory: [] } : m))
                        : day
                );
                const next = { ...prev, matchdays };
                gccRef.current = next;
                return next;
            });

            clearRoundLog();

            {
                const seededStats = {
                    left: { ...(teamStatsRef.current?.[modalLeftTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                    right: { ...(teamStatsRef.current?.[modalRightTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                };
                const hasLostInGccLeague = (teamId) =>
                    getGccLeagueMatches(gccRef.current).some((m) => m.played && m.loserTeamId === teamId);

                setSeriesState({
                    ...defaultSeriesState,
                    active: true,
                    phase: "gccLeague",
                    gccMatchday: matchday,
                    gccMatchId: matchId,
                    gccMatchNumber,
                    leftTeam: modalLeftTeam,
                    rightTeam: modalRightTeam,
                    setsToWin: calcSetsToWin(GCC_LEAGUE_BEST_OF),
                    initialStats: seededStats,
                    liveStats: seededStats,
                    matchCtx: buildMatchStatContext({
                        kind: "swiss",
                        swissStageKey: "gcc",
                        bestOf: GCC_LEAGUE_BEST_OF,
                        leftTeam: modalLeftTeam,
                        rightTeam: modalRightTeam,
                        seededStats,
                        ratings: teamRatingsRef.current,
                        teams: allTeams,
                        unbeatenEligibleBySide: {
                            left: !hasLostInGccLeague(modalLeftTeam?.id),
                            right: !hasLostInGccLeague(modalRightTeam?.id),
                        },
                    }),
                });
            }

            closeMatchModal();
            return;
        }

        if (modalContext.type === "qualifier") {
            const { group, stage, matchId } = modalContext;
            const bestOf = getBestOfForQualifier(stage);

            const stageArr = qualifier?.[group]?.[stage] || [];
            const qualifierMatchNumber = Math.max(1, stageArr.findIndex((m) => m.id === matchId) + 1);

            setQualifier((prev) => {
                if (!prev?.[group]) return prev;
                const arr = [...(prev[group][stage] || [])];
                const idx = arr.findIndex((m) => m.id === matchId);
                if (idx < 0) return prev;
                arr[idx] = { ...arr[idx], pickTeamId: pickedTeamId, setHistory: [] };
                const next = { ...prev, [group]: { ...prev[group], [stage]: arr } };
                qualifierRef.current = next;
                return next;
            });

            clearRoundLog();

            {
                const seededStats = {
                    left: { ...(teamStatsRef.current?.[modalLeftTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                    right: { ...(teamStatsRef.current?.[modalRightTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                };

                setSeriesState({
                    ...defaultSeriesState,
                    active: true,
                    phase: "qualifier",
                    qualifierGroup: group,
                    qualifierStage: stage,
                    qualifierMatchId: matchId,
                    qualifierMatchNumber,
                    leftTeam: modalLeftTeam,
                    rightTeam: modalRightTeam,
                    setsToWin: calcSetsToWin(bestOf),
                    initialStats: seededStats,
                    liveStats: seededStats,
                    matchCtx: buildMatchStatContext({
                        kind: "qualifier",
                        playoffsStage: stage,
                        bestOf,
                        leftTeam: modalLeftTeam,
                        rightTeam: modalRightTeam,
                        seededStats,
                        ratings: teamRatingsRef.current,
                        teams: allTeams,
                    }),
                });
            }

            closeMatchModal();
            return;
        }

        if (modalContext.type === "pemGroup") {
            const { group, stage, matchId } = modalContext;
            const bestOf = getBestOfForPemGroup(stage);

            const stageArr = pemMain?.[group]?.[stage] || [];
            const pemGroupMatchNumber = Math.max(1, stageArr.findIndex((m) => m.id === matchId) + 1);

            setPemMain((prev) => {
                if (!prev?.[group]) return prev;
                const arr = [...(prev[group][stage] || [])];
                const idx = arr.findIndex((m) => m.id === matchId);
                if (idx < 0) return prev;
                arr[idx] = { ...arr[idx], pickTeamId: pickedTeamId, setHistory: [] };
                const next = { ...prev, [group]: { ...prev[group], [stage]: arr } };
                pemMainRef.current = next;
                return next;
            });

            clearRoundLog();

            {
                const seededStats = {
                    left: { ...(teamStatsRef.current?.[modalLeftTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                    right: { ...(teamStatsRef.current?.[modalRightTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                };

                setSeriesState({
                    ...defaultSeriesState,
                    active: true,
                    phase: "pemGroup",
                    pemGroup: group,
                    pemGroupStage: stage,
                    pemGroupMatchId: matchId,
                    pemGroupMatchNumber,
                    leftTeam: modalLeftTeam,
                    rightTeam: modalRightTeam,
                    setsToWin: calcSetsToWin(bestOf),
                    initialStats: seededStats,
                    liveStats: seededStats,
                    matchCtx: buildMatchStatContext({
                        kind: "pemGroup",
                        playoffsStage: stage,
                        bestOf,
                        leftTeam: modalLeftTeam,
                        rightTeam: modalRightTeam,
                        seededStats,
                        ratings: teamRatingsRef.current,
                        teams: allTeams,
                    }),
                });
            }

            closeMatchModal();
            return;
        }

        if (modalContext.type === "ecl") {
            const { stage, matchId } = modalContext;
            const bestOf = getBestOfForEcl(stage);

            const stageArr = ecl?.[stage] || [];
            const eclMatchNumber = Math.max(1, stageArr.findIndex((m) => m.id === matchId) + 1);

            setEcl((prev) => {
                if (!prev?.[stage]) return prev;
                const arr = [...prev[stage]];
                const idx = arr.findIndex((m) => m.id === matchId);
                if (idx < 0) return prev;
                arr[idx] = { ...arr[idx], pickTeamId: pickedTeamId, setHistory: [] };
                const next = { ...prev, [stage]: arr };
                eclRef.current = next;
                return next;
            });

            clearRoundLog();

            {
                const seededStats = {
                    left: { ...(teamStatsRef.current?.[modalLeftTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                    right: { ...(teamStatsRef.current?.[modalRightTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                };

                setSeriesState({
                    ...defaultSeriesState,
                    active: true,
                    phase: "ecl",
                    eclStage: stage,
                    eclMatchId: matchId,
                    eclMatchNumber,
                    leftTeam: modalLeftTeam,
                    rightTeam: modalRightTeam,
                    setsToWin: calcSetsToWin(bestOf),
                    initialStats: seededStats,
                    liveStats: seededStats,
                    matchCtx: buildMatchStatContext({
                        kind: "ecl",
                        playoffsStage: stage,
                        bestOf,
                        leftTeam: modalLeftTeam,
                        rightTeam: modalRightTeam,
                        seededStats,
                        ratings: teamRatingsRef.current,
                        teams: allTeams,
                    }),
                });
            }

            closeMatchModal();
            return;
        }

        if (modalContext.type === "pemStage1") {
            const { group, stage, matchId } = modalContext;
            const bestOf = getBestOfForPemStage1(stage);

            const stageArr = pemStage1?.[group]?.[stage] || [];
            const pemStage1MatchNumber = Math.max(1, stageArr.findIndex((m) => m.id === matchId) + 1);

            setPemStage1((prev) => {
                if (!prev?.[group]) return prev;
                const arr = [...(prev[group][stage] || [])];
                const idx = arr.findIndex((m) => m.id === matchId);
                if (idx < 0) return prev;
                arr[idx] = { ...arr[idx], pickTeamId: pickedTeamId, setHistory: [] };
                const next = { ...prev, [group]: { ...prev[group], [stage]: arr } };
                pemStage1Ref.current = next;
                return next;
            });

            clearRoundLog();

            {
                const seededStats = {
                    left: { ...(teamStatsRef.current?.[modalLeftTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                    right: { ...(teamStatsRef.current?.[modalRightTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                };

                setSeriesState({
                    ...defaultSeriesState,
                    active: true,
                    phase: "pemStage1",
                    pemStage1Group: group,
                    pemStage1Stage: stage,
                    pemStage1MatchId: matchId,
                    pemStage1MatchNumber,
                    leftTeam: modalLeftTeam,
                    rightTeam: modalRightTeam,
                    setsToWin: calcSetsToWin(bestOf),
                    initialStats: seededStats,
                    liveStats: seededStats,
                    matchCtx: buildMatchStatContext({
                        kind: "pemStage1",
                        playoffsStage: stage,
                        bestOf,
                        leftTeam: modalLeftTeam,
                        rightTeam: modalRightTeam,
                        seededStats,
                        ratings: teamRatingsRef.current,
                        teams: allTeams,
                    }),
                });
            }

            closeMatchModal();
            return;
        }

        if (modalContext.type === "playoffs") {
            const { stage, matchId } = modalContext;
            const bestOf = getBestOfForPlayoffs(stage, playoffs?.kind);

            const stageArr = (playoffs && playoffs[stage]) ? playoffs[stage] : [];
            const playoffsMatchNumber = Math.max(
                1,
                stageArr.findIndex((m) => m.id === matchId) + 1
            );

            setPlayoffs((prev) => {
                if (!prev) return prev;
                const copy = { ...prev, [stage]: [...prev[stage]] };
                const idx = copy[stage].findIndex((m) => m.id === matchId);
                if (idx < 0) return prev;
                const m = { ...copy[stage][idx] };
                m.pickTeamId = pickedTeamId;
                m.setHistory = [];
                copy[stage][idx] = m;
                return copy;
            });

            clearRoundLog();

            {
                const seededStats = {
                    left: { ...(teamStatsRef.current?.[modalLeftTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                    right: { ...(teamStatsRef.current?.[modalRightTeam.id] ?? DEFAULT_TEAM_STAT_VALUES), momentum: 0 },
                };

                setSeriesState({
                    ...defaultSeriesState,
                    active: true,
                    phase: "playoffs",
                    playoffsStage: stage,
                    playoffsMatchId: matchId,
                    playoffsMatchNumber,
                    leftTeam: modalLeftTeam,
                    rightTeam: modalRightTeam,
                    setsToWin: calcSetsToWin(bestOf),
                    initialStats: seededStats,
                    liveStats: seededStats,
                    matchCtx: buildMatchStatContext({
                        kind: "playoffs",
                        playoffsStage: stage,
                        bestOf,
                        leftTeam: modalLeftTeam,
                        rightTeam: modalRightTeam,
                        seededStats,
                        ratings: teamRatingsRef.current,
                        teams: allTeams,
                    }),
                });
            }

            closeMatchModal();
        }
    };

    const appendSetToCurrentMatchHistory = (
        wins,
        losses,
        won,
        firstHalfLeft,
        firstHalfRight,
        extendedRounds,
        extra = {}
    ) => {
        const setEntry = (history) => [
            ...(history || []),
            {
                set: (history?.length || 0) + 1,
                wins,
                losses,
                won,
                firstHalfLeft,
                firstHalfRight,
                extendedRounds,
                roundLog: roundLogRef.current.map((e) => ({ ...e })),
                ...extra,
            },
        ];
        if (seriesState.phase === "cstGroup" && seriesState.cstGroup && seriesState.cstMatchId) {
            const group = seriesState.cstGroup;
            const matchId = seriesState.cstMatchId;

            setCst((prev) => {
                if (!prev?.[group]) return prev;
                const matches = (prev[group].matches || []).map((m) =>
                    m.id === matchId ? { ...m, setHistory: setEntry(m.setHistory) } : m
                );
                const next = { ...prev, [group]: { ...prev[group], matches } };
                cstRef.current = next;
                return next;
            });
            return;
        }
        if (seriesState.phase === "gccLeague" && seriesState.gccMatchday && seriesState.gccMatchId) {
            const dayIndex = seriesState.gccMatchday - 1;
            const matchId = seriesState.gccMatchId;

            setGcc((prev) => {
                if (!prev?.matchdays?.[dayIndex]) return prev;
                const matchdays = prev.matchdays.map((day, i) =>
                    i === dayIndex
                        ? day.map((m) => (m.id === matchId ? { ...m, setHistory: setEntry(m.setHistory) } : m))
                        : day
                );
                const next = { ...prev, matchdays };
                gccRef.current = next;
                return next;
            });
            return;
        }
        if (seriesState.phase === "qualifier" && seriesState.qualifierGroup && seriesState.qualifierStage && seriesState.qualifierMatchId) {
            const group = seriesState.qualifierGroup;
            const stageKey = seriesState.qualifierStage;
            const matchId = seriesState.qualifierMatchId;

            setQualifier((prev) => {
                if (!prev?.[group]) return prev;
                const arr = [...(prev[group][stageKey] || [])];
                const idx = arr.findIndex((m) => m.id === matchId);
                if (idx < 0) return prev;
                arr[idx] = { ...arr[idx], setHistory: setEntry(arr[idx].setHistory) };
                const next = { ...prev, [group]: { ...prev[group], [stageKey]: arr } };
                qualifierRef.current = next;
                return next;
            });
            return;
        }
        if (seriesState.phase === "pemGroup" && seriesState.pemGroup && seriesState.pemGroupStage && seriesState.pemGroupMatchId) {
            const group = seriesState.pemGroup;
            const stageKey = seriesState.pemGroupStage;
            const matchId = seriesState.pemGroupMatchId;

            setPemMain((prev) => {
                if (!prev?.[group]) return prev;
                const arr = [...(prev[group][stageKey] || [])];
                const idx = arr.findIndex((m) => m.id === matchId);
                if (idx < 0) return prev;
                arr[idx] = { ...arr[idx], setHistory: setEntry(arr[idx].setHistory) };
                const next = { ...prev, [group]: { ...prev[group], [stageKey]: arr } };
                pemMainRef.current = next;
                return next;
            });
            return;
        }
        if (seriesState.phase === "ecl" && seriesState.eclStage && seriesState.eclMatchId) {
            const stageKey = seriesState.eclStage;
            const matchId = seriesState.eclMatchId;

            setEcl((prev) => {
                if (!prev?.[stageKey]) return prev;
                const arr = [...prev[stageKey]];
                const idx = arr.findIndex((m) => m.id === matchId);
                if (idx < 0) return prev;
                arr[idx] = { ...arr[idx], setHistory: setEntry(arr[idx].setHistory) };
                const next = { ...prev, [stageKey]: arr };
                eclRef.current = next;
                return next;
            });
            return;
        }
        if (seriesState.phase === "pemStage1" && seriesState.pemStage1Group && seriesState.pemStage1Stage && seriesState.pemStage1MatchId) {
            const group = seriesState.pemStage1Group;
            const stageKey = seriesState.pemStage1Stage;
            const matchId = seriesState.pemStage1MatchId;

            setPemStage1((prev) => {
                if (!prev?.[group]) return prev;
                const arr = [...(prev[group][stageKey] || [])];
                const idx = arr.findIndex((m) => m.id === matchId);
                if (idx < 0) return prev;
                arr[idx] = { ...arr[idx], setHistory: setEntry(arr[idx].setHistory) };
                const next = { ...prev, [group]: { ...prev[group], [stageKey]: arr } };
                pemStage1Ref.current = next;
                return next;
            });
            return;
        }
        if (seriesState.phase === "playoffs" && playoffs && seriesState.playoffsStage && seriesState.playoffsMatchId) {
            const stageKey = seriesState.playoffsStage;
            const matchId = seriesState.playoffsMatchId;

            setPlayoffs((prev) => {
                if (!prev) return prev;
                const copy = { ...prev, [stageKey]: [...prev[stageKey]] };
                const idx = copy[stageKey].findIndex((m) => m.id === matchId);
                if (idx < 0) return prev;
                const m = { ...copy[stageKey][idx] };
                m.setHistory = setEntry(m.setHistory);
                copy[stageKey][idx] = m;
                return copy;
            });
            return;
        }
        const stageKey = seriesState.swissStageKey;
        const net = seriesState.swissNet;
        const matchId = seriesState.swissMatchId;

        const apply = (setter, stg) => {
            const copy = {
                ...stg,
                teams: stg.teams.map((t) => ({ ...t })),
                matchesByNet: { ...stg.matchesByNet },
            };
            const arr = [...(copy.matchesByNet[net] || [])];
            const idx = arr.findIndex((m) => m.id === matchId);
            if (idx < 0) return;
            const m = { ...arr[idx] };
            m.setHistory = setEntry(m.setHistory);
            arr[idx] = m;
            copy.matchesByNet[net] = arr;
            setter(copy);
        };

        if (stageKey === "stage1" && stage1) apply(setStage1, stage1);
        if (stageKey === "stage2" && stage2) apply(setStage2, stage2);
        if (stageKey === "stage3" && stage3) apply(setStage3, stage3);
    };

    const mapSeriesScoresToSlots = (match, leftTeam, rightTeam, leftSets, rightSets) => {
        if (!match?.slotA || !match?.slotB || !leftTeam || !rightTeam) {
            return { scoreLeft: leftSets, scoreRight: rightSets };
        }

        const slotAId = match.slotA.id;
        const slotBId = match.slotB.id;

        const leftId = leftTeam.id;
        const rightId = rightTeam.id;

        const scoreLeft =
            slotAId === leftId ? leftSets :
                slotAId === rightId ? rightSets :
                    0;

        const scoreRight =
            slotBId === rightId ? rightSets :
                slotBId === leftId ? leftSets :
                    0;

        return { scoreLeft, scoreRight };
    };

    const getSwissNetHighlights = (stageObj, net) => {
        if (!stageObj) return { currentId: null, nextId: null };

        const matches = stageObj?.matchesByNet?.[net] || [];
        if (!matches.length) return { currentId: null, nextId: null };
        const currentIndex = matches.findIndex((m) => canOpenSwissMatch(stageObj, net, m));

        if (currentIndex < 0) return { currentId: null, nextId: null };

        const current = matches[currentIndex];

        const nextIndex = matches.findIndex((m, idx) => {
            if (idx <= currentIndex) return false;
            if (m.played) return false;
            return !!m.slotA && !!m.slotB;
        });

        return {
            currentId: current?.id ?? null,
            nextId: nextIndex >= 0 ? matches[nextIndex]?.id ?? null : null,
        };
    };

    const getCommittedSeriesScore = ({
        bestOf,
        seriesState,
        matchObj,
        seriesLeftSets,
        seriesRightSets,
    }) => {
        if (bestOf === 1) {
            const roundLeft = seriesState.roundWins;
            const roundRight = seriesState.roundLosses;

            return mapSeriesScoresToSlots(
                matchObj,
                seriesState.leftTeam,
                seriesState.rightTeam,
                roundLeft,
                roundRight
            );
        }

        return mapSeriesScoresToSlots(
            matchObj,
            seriesState.leftTeam,
            seriesState.rightTeam,
            seriesLeftSets,
            seriesRightSets
        );
    };

    const STAGE_ORDER = ["ro32", "po", "ro16", "qf", "sf", "thirdPlace", "gf"];

    const currentPlayablePlayoffsMatch = useMemo(() => {
        if (!playoffs) return null;

        for (const stage of STAGE_ORDER) {
            const stageMatches = playoffs[stage];
            if (!stageMatches) continue;

            for (let i = 0; i < stageMatches.length; i++) {
                if (canOpenPlayoffsMatch(playoffs, stage, i)) {
                    return { stage, index: i, id: stageMatches[i]?.id };
                }
            }
        }

        return null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playoffs]);

    const nextPlayoffsMatch = useMemo(() => {
        if (!playoffs || !currentPlayablePlayoffsMatch) return null;

        const { stage, index } = currentPlayablePlayoffsMatch;

        for (const s of STAGE_ORDER.slice(STAGE_ORDER.indexOf(stage))) {
            const stageMatches = playoffs[s] || [];
            for (let i = s === stage ? index + 1 : 0; i < stageMatches.length; i++) {
                const m = stageMatches[i];
                if (m && !m.played) return { stage: s, index: i, id: m.id };
            }
        }

        return null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playoffs, currentPlayablePlayoffsMatch]);

    const extendedRoundDetails = seriesState.tiebreakerPhase === "extended"
        ? buildExtendedRoundDetails(seriesState.extendedRounds, roundLogRef.current)
        : null;

    const getExtendedRoundsScore = (extendedRounds) => {
        let left = 0;
        let right = 0;

        const addWinner = (winner) => {
            if (!winner) return;
            if (winner === "left") left++;
            else right++;
        };

        addWinner(extendedRounds.firstHalf);
        addWinner(extendedRounds.secondHalf);

        for (const ot of extendedRounds.overtimes) {
            addWinner(ot.winner);
        }

        return { left, right };
    };

    const toggleSecretGuaranteedWin = () => {
        setCheatMode((prev) => {
            const next = (prev + 1) % 3;

            if (next === 1) {
                setForceWinner("left");
                toast.dismiss(SECRET_TOAST_ID);
                toast.dismiss(SECRET_NUM_TWO_TOAST_ID);
                toast.dismiss(SECRET_NUM_THREE_TOAST_ID);
                toast("Don't tell anyone about this!!!", {
                    id: SECRET_TOAST_ID,
                    duration: 2000,
                    icon: "🤫",
                });
            }

            if (next === 2) {
                setForceWinner("right");
                toast.dismiss(SECRET_TOAST_ID);
                toast.dismiss(SECRET_NUM_TWO_TOAST_ID);
                toast.dismiss(SECRET_NUM_THREE_TOAST_ID);
                toast("Even the odds...", {
                    id: SECRET_NUM_TWO_TOAST_ID,
                    duration: 2000,
                    icon: "😈",
                });
            }

            if (next === 0) {
                setForceWinner(null);
                toast.dismiss(SECRET_TOAST_ID);
                toast.dismiss(SECRET_NUM_TWO_TOAST_ID);
                toast.dismiss(SECRET_NUM_THREE_TOAST_ID);
                toast("Secret mode disabled", {
                    id: SECRET_NUM_THREE_TOAST_ID,
                    duration: 2000,
                    icon: "🔓",
                });
            }

            return next;
        });
    };

    const SERIES_COMMIT_DELAY = 3500;

    const makePendingAction = (type, delay, payload = {}) => ({
        type,
        delay,
        executeAt: Date.now() + delay,
        payload,
    });

    const executePendingAction = (action) => {
        switch (action.type) {
            case SERIES_ACTIONS.NEXT_SET: {
                setSeriesState(curr => {
                    if (!curr.active || curr.banner) return curr;

                    const { setNumber, leftScore, rightScore } = action.payload;

                    setIsLocked(false);

                    clearRoundLog();

                    toast.dismiss();
                    toast("First Half is beginning", {
                        icon: "\u{1F3C1}",
                        duration: 3000,
                    });

                    return {
                        ...curr,

                        firstHalfLeft: null,
                        firstHalfRight: null,

                        finishedSets: [
                            ...(curr.finishedSets || []),
                            {
                                set: setNumber,
                                leftScore,
                                rightScore,
                            },
                        ],

                        setNumber: curr.setNumber + 1,

                        extendedRounds: {
                            firstHalf: null,
                            secondHalf: null,
                            overtimes: [],
                        },

                        roundWins: 0,
                        roundLosses: 0,
                        roundNumber: 1,

                        miniWins: 0,
                        miniLosses: 0,

                        isOvertime: false,
                        overtimeBlock: 0,
                        otWins: 0,
                        otLosses: 0,

                        pendingAction: null,
                    };
                });

                break;
            }

            case SERIES_ACTIONS.NEXT_OT: {
                setSeriesState(curr => {
                    if (!curr.active || curr.banner) return curr;

                    setIsLocked(false);

                    return {
                        ...curr,

                        isOvertime: true,
                        overtimeBlock: (curr.overtimeBlock || 0) + 1,
                        roundNumber: 1,
                        otWins: 0,
                        otLosses: 0,
                        miniWins: 0,
                        miniLosses: 0,

                        pendingAction: null,
                    };
                });

                break;
            }

            case SERIES_ACTIONS.START_EXTENDED: {
                setSeriesState(curr => {
                    if (!curr.active || curr.banner) return curr;

                    return {
                        ...curr,

                        tiebreakerPhase: "extended",
                        tiebreakerBigSymbol: "VS",
                        extRoundLeftScore: 0,
                        extRoundRightScore: 0,
                        extRoundRevealIndex: 0,
                        extRoundCommentaryShown: false,

                        pendingAction: null,
                    };
                });

                break;
            }

            case SERIES_ACTIONS.NEXT_SET_AFTER_PENALTIES: {
                setSeriesState(curr => {
                    if (!curr.active || curr.banner) return curr;

                    const {
                        playerWonSets,
                        playerLostSets,
                        nextLeftScore,
                        nextRightScore,
                    } = action.payload;

                    setIsLocked(false);

                    clearRoundLog();

                    toast.dismiss();
                    toast("First Half is beginning", {
                        icon: "🏁",
                        duration: 3000,
                    });

                    return {
                        ...curr,

                        playerWonSets,
                        playerLostSets,

                        finishedSets: [
                            ...(curr.finishedSets || []),
                            {
                                set: curr.setNumber,
                                leftScore: curr.penaltyPreScore?.left ?? 0,
                                rightScore: curr.penaltyPreScore?.right ?? 0,

                                extendedRoundsPlayed: true,
                                extendedRoundLeftScore: curr.extRoundLeftScore,
                                extendedRoundRightScore: curr.extRoundRightScore,

                                penaltiesPlayed: true,
                                penaltyLeftScore: nextLeftScore,
                                penaltyRightScore: nextRightScore,
                            },
                        ],

                        setNumber: curr.setNumber + 1,

                        firstHalfLeft: null,
                        firstHalfRight: null,

                        roundWins: 0,
                        roundLosses: 0,
                        roundNumber: 1,

                        miniWins: 0,
                        miniLosses: 0,

                        isOvertime: false,
                        overtimeBlock: 0,
                        otWins: 0,
                        otLosses: 0,

                        extendedRounds: {
                            firstHalf: null,
                            secondHalf: null,
                            overtimes: [],
                        },

                        tiebreakerPhase: "idle",
                        tiebreakerBigSymbol: null,

                        extRoundLeftScore: 0,
                        extRoundRightScore: 0,
                        extRoundRevealIndex: 0,
                        extRoundCommentaryShown: false,

                        penaltyLeftResults: [],
                        penaltyRightResults: [],
                        penaltyLeftScore: 0,
                        penaltyRightScore: 0,
                        penaltyTurn: "left",
                        penaltyPreScore: null,
                        penaltyResolved: false,

                        pendingAction: null,
                    };
                });

                break;
            }

            default:
                break;
        }
    };

    const [pendingActionReady, setPendingActionReady] = useState(false);

    useEffect(() => {
        setSeriesState(curr => {
            if (!curr.pendingAction) return curr;

            return {
                ...curr,
                pendingAction: {
                    ...curr.pendingAction,
                    executeAt: Date.now() + (curr.pendingAction.delay ?? 0),
                },
            };
        });

        setPendingActionReady(true);
    }, []);

    useEffect(() => {
        if (!pendingActionReady) return;
        if (!seriesState.pendingAction) return;

        setIsLocked(true);

        const remaining = Math.max(
            0,
            seriesState.pendingAction.executeAt - Date.now()
        );

        const timer = setTimeout(() => {
            executePendingAction(seriesState.pendingAction);
        }, remaining);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seriesState.pendingAction, pendingActionReady]);

    const handleSecretButtonContextMenu = (e) => {
        e.preventDefault();

        const { left, right } = getExtendedRoundsScore(seriesState.extendedRounds);

        toast(`Extended Rounds: ${left}-${right}`, {
            id: "extended-rounds-score",
            icon: "📊",
            duration: 2500,
        });
    };

    const getMultiplierClass = (mine, other) => {
        if (mine == null || other == null) return "";

        if (mine === other) {
            return "linear-gradient(180deg,#9c9c9c 0%,#757575 45%,#555555 100%)";
        }

        const successColor = "#54CC54";
        const failColor = "#983333";
        const color = mine > other ? successColor : failColor;

        return `linear-gradient(
        180deg,
        ${lightenHex(color, 0.36)} 0%,
        ${color} 45%,
        ${darkenHex(color, 0.35)} 100%
    )`;
    };

    const buildRollContext = () => {
        const s = seriesState;
        const liveStats = s.liveStats ?? {
            left: { ...DEFAULT_TEAM_STAT_VALUES },
            right: { ...DEFAULT_TEAM_STAT_VALUES },
        };

        const inPens = s.tiebreakerPhase === "penalties";
        const otActive =
            !inPens &&
            s.tiebreakerPhase !== "extended" &&
            s.isOvertime &&
            s.overtimeBlock > 0;

        const otContext = inPens
            ? { active: true, depth: (s.penaltyLeftScore ?? 0) + (s.penaltyRightScore ?? 0) }
            : { active: otActive, depth: s.overtimeBlock };

        const sideAhead = (left, right) => (left > right ? "left" : right > left ? "right" : null);
        const leadSide = inPens || s.tiebreakerPhase === "extended"
            ? null
            : sideAhead(s.roundWins ?? 0, s.roundLosses ?? 0) ?? sideAhead(s.miniWins ?? 0, s.miniLosses ?? 0);

        return {
            liveStats,
            otContext,
            leadSide,
            bounceBackArmedSide: inPens ? null : s.bounceBackArmedSide,
            lastRoundLoserSide: inPens ? null : s.lastRoundLoserSide,
            matchCtx: s.matchCtx ?? null,
            finisherActive: (s.setsToWin ?? 2) > 1,
        };
    };

    const computeSideRollBonus = (side, rawRoll, ctx) => computeRollBonus(side, rawRoll, ctx);

    const rollPair = () => {
        const a = round2(MULTIPLIER_MIN + Math.random() * (MULTIPLIER_MAX - MULTIPLIER_MIN));
        const b = round2(MULTIPLIER_MIN + Math.random() * (MULTIPLIER_MAX - MULTIPLIER_MIN));

        const ctx = buildRollContext();
        const edge = splitRollEdge(
            computeSideRollBonus("left", a, ctx),
            computeSideRollBonus("right", b, ctx)
        );

        const a2 = round2(Math.max(MULTIPLIER_MIN, Math.min(MULTIPLIER_MAX, a + edge.left)));
        const b2 = round2(Math.max(MULTIPLIER_MIN, Math.min(MULTIPLIER_MAX, b + edge.right)));

        if (!forceWinner) return { left: a2, right: b2 };

        const hi = Math.max(a2, b2);
        let lo = Math.min(a2, b2);
        if (hi === lo) lo = round2(Math.max(MULTIPLIER_MIN, hi - 0.01));

        return forceWinner === "left" ? { left: hi, right: lo } : { left: lo, right: hi };
    };

    const getPenaltyMessage = (isAttacker, attackerSucceeded) => {
        if (isAttacker) {
            return attackerSucceeded ? "gets a successful attempt!" : "has been prevented!";
        }
        return attackerSucceeded ? "lets a successful attempt happen!" : "prevents a successful attempt!";
    };

    const renderTeamLabel = (team, seriesWon = false) => {
        if (!team) return null;
        if (seriesWon) {
            return (
                <span style={{ color: team.color || "#2e2f42", fontWeight: 900 }}>
                    GG!
                </span>
            );
        } else {
            return (
                <span style={{ color: team.color || "#2e2f42", fontWeight: 900 }}>
                    Team {team.name}
                </span>
            );
        }
    };

    const roundToast = (content, options) => {
        const now = Date.now();

        if (now - lastToastTime.current < 300) return;

        lastToastTime.current = now;
        toast(content, options);
    };

    const getOvertimeLabel = (overtimeBlock) => {
        const names = {
            1: "Overtime",
            2: "Double Overtime",
            3: "Triple Overtime",
            4: "Quadruple Overtime",
            5: "Quintuple Overtime",
            6: "Sextuple Overtime",
            7: "Septuple Overtime",
            8: "Octuple Overtime",
            9: "Nonuple Overtime",
            10: "Decuple Overtime",
        };

        return names[overtimeBlock] ?? `${overtimeBlock}x Overtime`;
    };

    const getOvertimeShortLabel = (overtimeCount) => {
        return `${overtimeCount}x OT`;
    };

    const handlePenaltyShot = () => {
        if (!seriesState.active || seriesState.banner) return;
        if (seriesState.tiebreakerPhase !== "penalties") return;
        if (seriesState.penaltyResolved) return;

        const { left: leftMult, right: rightMult } = rollPair();
        setIsCalculating(true);

        setSeriesState((prev) => {
            const turn = prev.penaltyTurn;

            let pendingAction = null;

            const isNeutral = leftMult === rightMult;
            const turnMult = turn === "left" ? leftMult : rightMult;
            const oppMult = turn === "left" ? rightMult : leftMult;

            const success = isNeutral ? null : turnMult > oppMult;

            if (isNeutral) {
                setIsCalculating(false);

                return {
                    ...prev,
                    lastMultiplierLeft: leftMult,
                    lastMultiplierRight: rightMult,
                    lastPenaltyAttacker: turn,
                };
            }

            const nextLeftResults = [...prev.penaltyLeftResults];
            const nextRightResults = [...prev.penaltyRightResults];
            if (turn === "left") nextLeftResults.push(success ? "success" : "fail");
            else nextRightResults.push(success ? "success" : "fail");

            const liveStatsAfterAttempt = applyOtStaminaPenaltyAttempt(
                prev.liveStats,
                turn,
                success
            );

            const nextLeftScore = prev.penaltyLeftScore + (turn === "left" && success ? 1 : 0);
            const nextRightScore = prev.penaltyRightScore + (turn === "right" && success ? 1 : 0);

            const nextTurn = turn === "left" ? "right" : "left";

            const leftAttempts = nextLeftResults.length;
            const rightAttempts = nextRightResults.length;

            const leftRemaining = Math.max(0, 5 - leftAttempts);
            const rightRemaining = Math.max(0, 5 - rightAttempts);

            const regularFinished =
                leftAttempts === 5 &&
                rightAttempts === 5;

            const suddenDeath = leftAttempts > 5 || rightAttempts > 5;

            let resolved = false;
            let winnerTeam = null;

            const inRegularPenalties =
                leftAttempts <= 5 &&
                rightAttempts <= 5;

            if (inRegularPenalties) {

                if (nextLeftScore > nextRightScore + rightRemaining) {
                    resolved = true;
                    winnerTeam = prev.leftTeam;
                }
                else if (nextRightScore > nextLeftScore + leftRemaining) {
                    resolved = true;
                    winnerTeam = prev.rightTeam;
                }
            }

            if (!resolved && regularFinished && !suddenDeath) {

                if (nextLeftScore > nextRightScore) {
                    resolved = true;
                    winnerTeam = prev.leftTeam;
                }
                else if (nextRightScore > nextLeftScore) {
                    resolved = true;
                    winnerTeam = prev.rightTeam;
                }
            }

            if (
                !resolved &&
                suddenDeath &&
                leftAttempts === rightAttempts &&
                nextLeftScore !== nextRightScore
            ) {
                resolved = true;
                winnerTeam =
                    nextLeftScore > nextRightScore
                        ? prev.leftTeam
                        : prev.rightTeam;
            }

            let banner = prev.banner;
            let extraState = {};
            let liveStatsAfterPens = liveStatsAfterAttempt;

            if (resolved && winnerTeam) {
                const playerWonSet = winnerTeam === prev.leftTeam;

                appendSetToCurrentMatchHistory(
                    prev.penaltyPreScore?.left ?? 0,
                    prev.penaltyPreScore?.right ?? 0,
                    playerWonSet,
                    prev.firstHalfLeft,
                    prev.firstHalfRight,
                    {
                        ...prev.extendedRounds,
                        penalties: {
                            leftResults: nextLeftResults,
                            rightResults: nextRightResults,
                            leftScore: nextLeftScore,
                            rightScore: nextRightScore,
                            preScore: prev.penaltyPreScore,
                            penaltyResolved: resolved
                        },
                    }
                );

                const newWon = prev.playerWonSets + (playerWonSet ? 1 : 0);
                const newLost = prev.playerLostSets + (playerWonSet ? 0 : 1);
                const seriesOver = newWon >= prev.setsToWin || newLost >= prev.setsToWin;

                const pensSetConclusion = resolveSetConclusion({
                    setComebackTracker: prev.setComebackTracker,
                    liveStats: liveStatsAfterAttempt,
                    setWinnerSide: playerWonSet ? "left" : "right",
                    enteringLeftSets: prev.playerWonSets,
                    enteringRightSets: prev.playerLostSets,
                    setsToWin: prev.setsToWin,
                    upset: prev.matchCtx?.upset ?? null,
                });
                liveStatsAfterPens = pensSetConclusion.liveStats;

                if (seriesOver) {
                    toast.dismiss();
                    toast(<span>{renderTeamLabel(winnerTeam, true)}</span>, {
                        icon: "🎉",
                        duration: 4000,
                    });
                    banner = {
                        text: "GG",
                        shadow: `
                        0 0 3px ${winnerTeam.color},
                        0 0 7px ${winnerTeam.color}66,
                        0 1px 3px rgba(0,0,0,0.4)`,
                        color: winnerTeam.color,
                        gradient: winnerTeam.gradient,
                    };
                    extraState = {
                        playerWonSets: newWon,
                        playerLostSets: newLost,
                        banner,
                        penaltyResolved: true,
                        bounceBackArmedSide: pensSetConclusion.bounceBackArmedSide,
                        setComebackTracker: pensSetConclusion.setComebackTracker,
                    };
                } else {
                    toast.dismiss();
                    toast(
                        <span>
                            Set {newWon + newLost} has been won on penalties by{" "}
                            {renderTeamLabel(winnerTeam)}!
                        </span>,
                        { icon: "🥅", duration: 4000 }
                    );
                    setIsLocked(true);
                    pendingAction = makePendingAction(
                        SERIES_ACTIONS.NEXT_SET_AFTER_PENALTIES,
                        4000,
                        {
                            playerWonSets: newWon,
                            playerLostSets: newLost,
                            nextLeftScore,
                            nextRightScore,
                        }
                    );
                    extraState = {
                        playerWonSets: newWon,
                        playerLostSets: newLost,
                        penaltyResolved: true,
                        bounceBackArmedSide: pensSetConclusion.bounceBackArmedSide,
                        setComebackTracker: pensSetConclusion.setComebackTracker,
                    };
                }
            }

            setIsCalculating(false);
            return {
                ...prev,
                lastMultiplierLeft: leftMult,
                lastMultiplierRight: rightMult,
                lastPenaltyAttacker: turn,
                penaltyLeftResults: nextLeftResults,
                penaltyRightResults: nextRightResults,
                penaltyLeftScore: nextLeftScore,
                penaltyRightScore: nextRightScore,
                penaltyTurn: resolved ? prev.penaltyTurn : nextTurn,
                roundWins: nextLeftScore,
                roundLosses: nextRightScore,
                liveStats: liveStatsAfterPens,
                ...extraState,
                pendingAction: pendingAction ?? prev.pendingAction ?? null,
            };
        });
    };

    const handleSeriesGamble = () => {
        if (!seriesState.active || seriesState.banner) return;

        const { left: leftMult, right: rightMult } = rollPair();

        setIsCalculating(true);

        setSeriesState((prev) => {
            if (!prev.active || prev.banner) return prev;

            let pendingAction = null;

            const playerWonMini = leftMult > rightMult;
            const playerLostMini = rightMult > leftMult;

            let {
                playerWonSets,
                playerLostSets,
                setNumber,
                roundWins,
                roundLosses,
                roundNumber,
                miniWins,
                miniLosses,
                isOvertime,
                overtimeBlock,
                otWins,
                otLosses,
                setsToWin: toWin,
                extendedRounds,
            } = prev;

            extendedRounds = {
                firstHalf: extendedRounds?.firstHalf ?? null,
                secondHalf: extendedRounds?.secondHalf ?? null,
                overtimes: [...(extendedRounds?.overtimes ?? [])],
            };

            const miniWinsToWinRound =
                roundNumber <= 1 ||
                    roundNumber === 13 ||
                    (isOvertime && roundNumber === 1)
                    ? 10
                    : 5;

            let banner = prev.banner;
            if (isOvertime) {
                let nextMiniWins = miniWins;
                let nextMiniLosses = miniLosses;

                if (playerWonMini) nextMiniWins += 1;
                else if (playerLostMini) nextMiniLosses += 1;

                const nextClutchRoundFlag = computeClutchRoundFlag(
                    prev.clutchRoundFlag,
                    nextMiniWins,
                    nextMiniLosses,
                    miniWinsToWinRound
                );

                if (
                    nextMiniWins < miniWinsToWinRound &&
                    nextMiniLosses < miniWinsToWinRound
                ) {
                    setIsCalculating(false);
                    return {
                        ...prev,
                        lastMultiplierLeft: leftMult,
                        lastMultiplierRight: rightMult,
                        miniWins: nextMiniWins,
                        miniLosses: nextMiniLosses,
                        clutchRoundFlag: nextClutchRoundFlag,
                    };
                }

                const wonOtRound = nextMiniWins >= miniWinsToWinRound;

                const otRoundWinnerSide = wonOtRound ? "left" : "right";
                const otRoundConclusion = resolveRoundConclusion({
                    miniTarget: miniWinsToWinRound,
                    roundComebackTracker: prev.roundComebackTracker,
                    setContest: {
                        left: otWins + (wonOtRound ? 1 : 0),
                        right: otLosses + (wonOtRound ? 0 : 1),
                        target: OT_ROUNDS_TO_WIN,
                        inOvertime: true,
                        overtimeBlock,
                    },
                    liveStats: prev.liveStats,
                    winnerSide: otRoundWinnerSide,
                    clutchRoundFlag: nextClutchRoundFlag,
                    lastRoundLoserSide: prev.lastRoundLoserSide,
                    bounceBackArmedSide: prev.bounceBackArmedSide,
                    isFirstRoundOfSet: roundWins === 0 && roundLosses === 0,
                });
                const liveStatsAfterRound = applyOtStaminaRoundResult(
                    otRoundConclusion.liveStats,
                    otRoundWinnerSide
                );
                const nextLastRoundLoserSide = otRoundConclusion.nextLastRoundLoserSide;
                const nextBounceBackArmedSide = otRoundConclusion.nextBounceBackArmedSide;
                const roundMomentumSide = otRoundConclusion.momentumSide;
                const roundMomentumValue = otRoundConclusion.momentumValue;

                if (
                    miniWinsToWinRound === 10 &&
                    roundNumber === 1
                ) {
                    extendedRounds.overtimes.push({
                        overtime: overtimeBlock,
                        winner: wonOtRound
                            ? "left"
                            : "right",
                    });
                }

                const updatedOtWins = otWins + (wonOtRound ? 1 : 0);
                const updatedOtLosses = otLosses + (wonOtRound ? 0 : 1);

                const updatedRoundWins = roundWins + (wonOtRound ? 1 : 0);
                const updatedRoundLosses = roundLosses + (wonOtRound ? 0 : 1);

                const otTiedBlock = updatedOtWins === 3 && updatedOtLosses === 3;

                miniWins = 0;
                miniLosses = 0;

                roundNumber = roundNumber + 1;

                otWins = updatedOtWins;
                otLosses = updatedOtLosses;
                roundWins = updatedRoundWins;
                roundLosses = updatedRoundLosses;

                logRound({
                    key: `s${prev.setNumber}-ot${overtimeBlock}-r${prev.roundWins + prev.roundLosses + 1}`,
                    part: `ot${overtimeBlock}`,
                    overtimeBlock,
                    roundNumber: prev.roundWins + prev.roundLosses + 1,
                    squares: miniWinsToWinRound,
                    momentumSide: roundMomentumValue >= 5 ? roundMomentumSide : null,
                    momentumValue: roundMomentumValue >= 5 ? roundMomentumValue : null,
                    miniLeft: nextMiniWins,
                    miniRight: nextMiniLosses,
                    scoreLeft: updatedRoundWins,
                    scoreRight: updatedRoundLosses,
                    winner: wonOtRound ? "left" : "right",
                });

                roundToast(
                    <span>
                        {renderTeamLabel(wonOtRound ? prev.leftTeam : prev.rightTeam)} has won this{miniWinsToWinRound === 10 ? " Extended " : " "}OT round!
                    </span>,
                    { icon: miniWinsToWinRound === 10 ? "🔥" : "😜", duration: 2000 }
                );

                const otDecided =
                    updatedOtWins === OT_ROUNDS_TO_WIN || updatedOtLosses === OT_ROUNDS_TO_WIN;

                if (otDecided) {
                    const playerWonSet = updatedOtWins > updatedOtLosses;

                    appendSetToCurrentMatchHistory(
                        updatedRoundWins,
                        updatedRoundLosses,
                        playerWonSet,
                        prev.firstHalfLeft,
                        prev.firstHalfRight,
                        extendedRounds
                    );

                    const enteringLeftSetsOt = playerWonSets;
                    const enteringRightSetsOt = playerLostSets;

                    playerWonSets += playerWonSet ? 1 : 0;
                    playerLostSets += playerWonSet ? 0 : 1;

                    const otSetConclusion = resolveSetConclusion({
                        setComebackTracker: prev.setComebackTracker,
                        liveStats: liveStatsAfterRound,
                        setWinnerSide: playerWonSet ? "left" : "right",
                        enteringLeftSets: enteringLeftSetsOt,
                        enteringRightSets: enteringRightSetsOt,
                        setsToWin: toWin,
                        upset: prev.matchCtx?.upset ?? null,
                    });
                    const liveStatsAfterOtSet = otSetConclusion.liveStats;
                    const bounceBackArmedAfterOtSet = otSetConclusion.bounceBackArmedSide;

                    const seriesOver = playerWonSets >= toWin || playerLostSets >= toWin;

                    if (seriesOver) {
                        const winner = playerWonSets > playerLostSets ? prev.leftTeam : prev.rightTeam;

                        toast.dismiss();
                        toast(
                            <span>
                                {renderTeamLabel(winner, true)}
                            </span>,
                            { icon: "🎉", duration: 4000 }
                        );

                        banner = {
                            text: "GG",
                            shadow:
                                `
                                0 0 3px ${winner.color},
                                0 0 7px ${winner.color}66,
                                0 1px 3px rgba(0,0,0,0.4)
                            `,
                            color: winner.color,
                            gradient: winner.gradient,
                        };
                    } else {
                        toast.dismiss();
                        toast(
                            <span>
                                Set {playerWonSets + playerLostSets} has been won in {getOvertimeLabel(overtimeBlock)} by{" "}
                                {renderTeamLabel(playerWonSet ? prev.leftTeam : prev.rightTeam)}!
                            </span>,
                            { icon: "🤯", duration: 4000 }
                        );

                        setIsLocked(true);
                        pendingAction = makePendingAction(
                            SERIES_ACTIONS.NEXT_SET,
                            4000,
                            {
                                setNumber,
                                leftScore: updatedRoundWins,
                                rightScore: updatedRoundLosses,
                            }
                        );
                    }

                    setIsCalculating(false);

                    return {
                        ...prev,
                        lastMultiplierLeft: leftMult,
                        lastMultiplierRight: rightMult,
                        playerWonSets,
                        playerLostSets,
                        extendedRounds,
                        setNumber,
                        roundWins,
                        roundLosses,
                        roundNumber,
                        miniWins,
                        miniLosses,
                        isOvertime,
                        overtimeBlock,
                        otWins,
                        otLosses,
                        banner,
                        liveStats: liveStatsAfterOtSet,
                        setComebackTracker: otSetConclusion.setComebackTracker,
                        clutchRoundFlag: null,
                        roundComebackTracker: otRoundConclusion.roundComebackTracker,
                        lastRoundLoserSide: nextLastRoundLoserSide,
                        bounceBackArmedSide: bounceBackArmedAfterOtSet,
                        pendingAction: pendingAction ?? prev.pendingAction ?? null,
                    };
                }

                if (otTiedBlock && prev.allowTie && overtimeBlock === 1) {
                    appendSetToCurrentMatchHistory(
                        updatedRoundWins,
                        updatedRoundLosses,
                        false,
                        prev.firstHalfLeft,
                        prev.firstHalfRight,
                        extendedRounds,
                        { tie: true }
                    );

                    toast.dismiss();
                    toast(
                        <span style={{ color: TIE_BANNER_COLOR, fontWeight: 900 }}>
                            {CST_TIE_SCORE}-{CST_TIE_SCORE}, it's a TIE!
                        </span>,
                        { icon: "🤝", duration: 4000 }
                    );

                    banner = {
                        text: "TIE",
                        tie: true,
                        shadow: `
                            0 0 3px ${TIE_BANNER_COLOR},
                            0 0 7px ${TIE_BANNER_COLOR}66,
                            0 1px 3px rgba(0,0,0,0.4)
                        `,
                        color: TIE_BANNER_COLOR,
                        gradient: TIE_BANNER_GRADIENT,
                    };

                    setIsCalculating(false);

                    return {
                        ...prev,
                        lastMultiplierLeft: leftMult,
                        lastMultiplierRight: rightMult,
                        playerWonSets,
                        playerLostSets,
                        extendedRounds,
                        setNumber,
                        roundWins,
                        roundLosses,
                        roundNumber,
                        miniWins,
                        miniLosses,
                        isOvertime: true,
                        overtimeBlock,
                        otWins,
                        otLosses,
                        banner,
                        liveStats: liveStatsAfterRound,
                        clutchRoundFlag: null,
                        roundComebackTracker: otRoundConclusion.roundComebackTracker,
                        lastRoundLoserSide: nextLastRoundLoserSide,
                        bounceBackArmedSide: nextBounceBackArmedSide,
                        pendingAction: prev.pendingAction ?? null,
                    };
                }

                if (otTiedBlock) {
                    if (overtimeBlock >= OT_MAX_BLOCK) {
                        toast.dismiss();
                        toast(
                            "It's tied again, so another tiebreaker should be utilized...",
                            { icon: "🧮", duration: 4000 }
                        );
                        setIsLocked(true);
                        pendingAction = makePendingAction(
                            SERIES_ACTIONS.START_EXTENDED,
                            1500
                        );

                        setIsCalculating(false);
                        return {
                            ...prev,
                            lastMultiplierLeft: leftMult,
                            lastMultiplierRight: rightMult,
                            playerWonSets,
                            playerLostSets,
                            extendedRounds,
                            setNumber,
                            roundWins,
                            roundLosses,
                            roundNumber,
                            miniWins,
                            miniLosses,
                            isOvertime: true,
                            overtimeBlock,
                            otWins,
                            otLosses,
                            banner,
                            liveStats: liveStatsAfterRound,
                            clutchRoundFlag: null,
                            roundComebackTracker: otRoundConclusion.roundComebackTracker,
                            lastRoundLoserSide: nextLastRoundLoserSide,
                            bounceBackArmedSide: nextBounceBackArmedSide,
                            pendingAction: pendingAction ?? prev.pendingAction ?? null,
                        };
                    }

                    const currentOT = getOvertimeLabel(overtimeBlock);
                    const nextOT = getOvertimeLabel(overtimeBlock + 1);
                    const msg =
                        overtimeBlock === 1
                            ? `Neither team is willing to back down! ${currentOT} is tied 3-3! Starting ${nextOT}...`
                            : overtimeBlock === 2
                                ? `Another overtime ends in a tie! ${currentOT} is tied 3-3 again! Starting ${nextOT}...`
                                : `That's a tough battle we got here! ${currentOT} is tied 3-3 again! Starting ${nextOT}...`;

                    toast(msg, { icon: "🔄", duration: 4000 });

                    setIsLocked(true);
                    pendingAction = makePendingAction(SERIES_ACTIONS.NEXT_OT, 4000);

                    setIsCalculating(false);

                    return {
                        ...prev,
                        lastMultiplierLeft: leftMult,
                        lastMultiplierRight: rightMult,
                        playerWonSets,
                        playerLostSets,
                        extendedRounds,
                        setNumber,
                        roundWins,
                        roundLosses,
                        roundNumber,
                        miniWins,
                        miniLosses,
                        isOvertime: true,
                        overtimeBlock,
                        otWins,
                        otLosses,
                        banner,
                        liveStats: liveStatsAfterRound,
                        clutchRoundFlag: null,
                        roundComebackTracker: otRoundConclusion.roundComebackTracker,
                        lastRoundLoserSide: nextLastRoundLoserSide,
                        bounceBackArmedSide: nextBounceBackArmedSide,
                        pendingAction: pendingAction ?? prev.pendingAction ?? null,
                    };
                }

                setIsCalculating(false);

                return {
                    ...prev,
                    lastMultiplierLeft: leftMult,
                    lastMultiplierRight: rightMult,
                    playerWonSets,
                    playerLostSets,
                    extendedRounds,
                    setNumber,
                    roundWins,
                    roundLosses,
                    roundNumber,
                    miniWins,
                    miniLosses,
                    isOvertime,
                    overtimeBlock,
                    otWins,
                    otLosses,
                    banner,
                    liveStats: liveStatsAfterRound,
                    clutchRoundFlag: null,
                    roundComebackTracker: otRoundConclusion.roundComebackTracker,
                    lastRoundLoserSide: nextLastRoundLoserSide,
                    bounceBackArmedSide: nextBounceBackArmedSide,
                    pendingAction: pendingAction ?? prev.pendingAction ?? null,
                };
            }

            let nextMiniWins = miniWins;
            let nextMiniLosses = miniLosses;

            if (playerWonMini) nextMiniWins += 1;
            else if (playerLostMini) nextMiniLosses += 1;

            const nextClutchRoundFlagReg = computeClutchRoundFlag(
                prev.clutchRoundFlag,
                nextMiniWins,
                nextMiniLosses,
                miniWinsToWinRound
            );

            if (
                nextMiniWins < miniWinsToWinRound &&
                nextMiniLosses < miniWinsToWinRound
            ) {
                setIsCalculating(false);
                return {
                    ...prev,
                    lastMultiplierLeft: leftMult,
                    lastMultiplierRight: rightMult,
                    miniWins: nextMiniWins,
                    miniLosses: nextMiniLosses,
                    clutchRoundFlag: nextClutchRoundFlagReg,
                };
            }

            const playerWonRound = nextMiniWins >= miniWinsToWinRound;
            const regRoundWinnerSide = playerWonRound ? "left" : "right";
            const regRoundConclusion = resolveRoundConclusion({
                miniTarget: miniWinsToWinRound,
                roundComebackTracker: prev.roundComebackTracker,
                setContest: {
                    left: roundWins + (playerWonRound ? 1 : 0),
                    right: roundLosses + (playerWonRound ? 0 : 1),
                    target: BASE_ROUNDS_TO_WIN,
                    inOvertime: false,
                    overtimeBlock: 0,
                },
                liveStats: prev.liveStats,
                winnerSide: regRoundWinnerSide,
                clutchRoundFlag: nextClutchRoundFlagReg,
                lastRoundLoserSide: prev.lastRoundLoserSide,
                bounceBackArmedSide: prev.bounceBackArmedSide,
                isFirstRoundOfSet: roundWins === 0 && roundLosses === 0,
            });
            const liveStatsAfterRegRound = regRoundConclusion.liveStats;
            const nextLastRoundLoserSideReg = regRoundConclusion.nextLastRoundLoserSide;
            const nextBounceBackArmedSideReg = regRoundConclusion.nextBounceBackArmedSide;
            const regRoundMomentumSide = regRoundConclusion.momentumSide;
            const regRoundMomentumValue = regRoundConclusion.momentumValue;

            if (miniWinsToWinRound === 10) {
                const winner = playerWonRound
                    ? "left"
                    : "right";

                if (isOvertime) {
                    extendedRounds.overtimes.push({
                        overtime: overtimeBlock,
                        winner,
                    });
                } else if (roundNumber === 1) {
                    extendedRounds.firstHalf = winner;
                } else if (roundNumber === 13) {
                    extendedRounds.secondHalf = winner;
                }
            }
            roundWins += playerWonRound ? 1 : 0;
            roundLosses += playerWonRound ? 0 : 1;
            roundNumber += 1;

            if (roundNumber === 1) {
                toast.dismiss();
                toast("First Half begins", {
                    icon: "🏁",
                    duration: 3000,
                });
            }

            if (roundNumber === 12) {
                toast.dismiss();
                toast("Last Round of the First Half", {
                    id: ROUND12_TOAST_ID,
                    icon: "❗",
                    duration: Infinity,
                });
            }

            if (roundNumber === 13) {
                toast.dismiss(ROUND12_TOAST_ID);
                toast("Second Half begins", {
                    icon: "🔄",
                    duration: 3000,
                });
            }

            let firstHalfLeft = prev.firstHalfLeft;
            let firstHalfRight = prev.firstHalfRight;

            const totalRoundsPlayed = roundWins + roundLosses;

            if (
                totalRoundsPlayed === 12 &&
                firstHalfLeft == null &&
                firstHalfRight == null
            ) {
                firstHalfLeft = roundWins;
                firstHalfRight = roundLosses;
            }

            miniWins = 0;
            miniLosses = 0;

            logRound({
                key: `s${prev.setNumber}-reg-r${prev.roundWins + prev.roundLosses + 1}`,
                part: prev.roundNumber <= 12 ? "firstHalf" : "secondHalf",
                roundNumber: prev.roundWins + prev.roundLosses + 1,
                squares: miniWinsToWinRound,
                momentumSide: regRoundMomentumValue >= 5 ? regRoundMomentumSide : null,
                momentumValue: regRoundMomentumValue >= 5 ? regRoundMomentumValue : null,
                miniLeft: nextMiniWins,
                miniRight: nextMiniLosses,
                scoreLeft: roundWins,
                scoreRight: roundLosses,
                winner: playerWonRound ? "left" : "right",
            });

            roundToast(
                <span>
                    {renderTeamLabel(playerWonRound ? prev.leftTeam : prev.rightTeam)} has won this{miniWinsToWinRound === 10 ? " Extended " : " "}round!
                </span>,
                { icon: miniWinsToWinRound === 10 ? "🔥" : "😜", duration: 2000 }
            );

            if (roundWins === 12 && roundLosses === 12) {
                toast.dismiss();
                toast(`Overtime coming in for this ${toWin === 1 ? "match" : "set"}! 🔥`, {
                    icon: "⚔️",
                    duration: 4000,
                });

                setIsLocked(true);
                pendingAction = makePendingAction(SERIES_ACTIONS.NEXT_OT, 4000);

                setIsCalculating(false);

                return {
                    ...prev,
                    lastMultiplierLeft: leftMult,
                    lastMultiplierRight: rightMult,
                    playerWonSets,
                    playerLostSets,
                    extendedRounds,
                    roundWins,
                    roundLosses,
                    roundNumber,
                    miniWins,
                    miniLosses,
                    isOvertime: true,
                    overtimeBlock,
                    otWins,
                    otLosses,
                    banner,
                    liveStats: liveStatsAfterRegRound,
                    clutchRoundFlag: null,
                    roundComebackTracker: regRoundConclusion.roundComebackTracker,
                    lastRoundLoserSide: nextLastRoundLoserSideReg,
                    bounceBackArmedSide: nextBounceBackArmedSideReg,
                    pendingAction: pendingAction ?? prev.pendingAction ?? null,
                };
            }

            const setShouldEnd =
                roundWins >= BASE_ROUNDS_TO_WIN ||
                roundLosses >= BASE_ROUNDS_TO_WIN ||
                roundWins + roundLosses >= BASE_MAX_ROUNDS;

            let liveStatsAfterRegSet = liveStatsAfterRegRound;
            let bounceBackArmedAfterRegSet = nextBounceBackArmedSideReg;
            let setTrackerAfterRegSet = prev.setComebackTracker ?? null;

            if (setShouldEnd) {
                const playerWonSet = roundWins > roundLosses;

                appendSetToCurrentMatchHistory(
                    roundWins,
                    roundLosses,
                    playerWonSet,
                    firstHalfLeft,
                    firstHalfRight,
                    extendedRounds
                );

                const enteringLeftSetsReg = playerWonSets;
                const enteringRightSetsReg = playerLostSets;

                playerWonSets += playerWonSet ? 1 : 0;
                playerLostSets += playerWonSet ? 0 : 1;

                const regSetConclusion = resolveSetConclusion({
                    setComebackTracker: prev.setComebackTracker,
                    liveStats: liveStatsAfterRegRound,
                    setWinnerSide: playerWonSet ? "left" : "right",
                    enteringLeftSets: enteringLeftSetsReg,
                    enteringRightSets: enteringRightSetsReg,
                    setsToWin: toWin,
                    upset: prev.matchCtx?.upset ?? null,
                });
                liveStatsAfterRegSet = regSetConclusion.liveStats;
                bounceBackArmedAfterRegSet = regSetConclusion.bounceBackArmedSide;
                setTrackerAfterRegSet = regSetConclusion.setComebackTracker;

                const seriesOver = playerWonSets >= toWin || playerLostSets >= toWin;

                if (seriesOver) {
                    const winner = playerWonSets > playerLostSets ? prev.leftTeam : prev.rightTeam;

                    toast.dismiss();
                    toast(
                        <span>
                            {renderTeamLabel(winner, true)}
                        </span>,
                        { icon: "🎉", duration: 4000 }
                    );

                    banner = {
                        text: "GG",
                        shadow:
                            `
                            0 0 3px ${winner.color},
                            0 0 7px ${winner.color}66,
                            0 1px 3px rgba(0,0,0,0.4)
                        `,
                        color: winner.color,
                        gradient: winner.gradient,
                    };
                } else {
                    toast.dismiss();
                    toast(
                        <span>
                            Set {playerWonSets + playerLostSets} has been won by{" "}
                            {renderTeamLabel(playerWonSet ? prev.leftTeam : prev.rightTeam)}!
                        </span>,
                        { icon: "🤯", duration: 4000 }
                    );

                    setIsLocked(true);
                    pendingAction = makePendingAction(
                        SERIES_ACTIONS.NEXT_SET,
                        4000,
                        {
                            setNumber,
                            leftScore: roundWins,
                            rightScore: roundLosses,
                        }
                    );
                }
            }

            setIsCalculating(false);

            return {
                ...prev,
                lastMultiplierLeft: leftMult,
                lastMultiplierRight: rightMult,
                playerWonSets,
                playerLostSets,
                extendedRounds,
                setNumber,
                roundWins,
                roundLosses,
                roundNumber,
                firstHalfLeft,
                firstHalfRight,
                miniWins,
                miniLosses,
                isOvertime,
                overtimeBlock,
                otWins,
                otLosses,
                banner,
                liveStats: liveStatsAfterRegSet,
                setComebackTracker: setTrackerAfterRegSet,
                clutchRoundFlag: null,
                roundComebackTracker: regRoundConclusion.roundComebackTracker,
                lastRoundLoserSide: nextLastRoundLoserSideReg,
                bounceBackArmedSide: bounceBackArmedAfterRegSet,
                pendingAction: pendingAction ?? prev.pendingAction ?? null,
            };
        });
    };

    const commitQualifierSeries = ({
        group,
        stage,
        matchId,
        leftTeam,
        rightTeam,
        winner,
        loser,
        seriesLeftSets,
        seriesRightSets,
        playedAtMs,
    }) => {
        const current = qualifierRef.current;
        const groupBracket = current?.[group];
        if (!groupBracket?.[stage]) return;

        const bracket = { ...groupBracket };
        QUALIFIER_STAGE_ORDER.forEach((key) => {
            bracket[key] = [...(groupBracket[key] || [])];
        });

        const idx = bracket[stage].findIndex((m) => m.id === matchId);
        if (idx < 0) return;

        const m = { ...bracket[stage][idx] };
        const bestOf = getBestOfForQualifier(stage);
        const { scoreLeft, scoreRight } = getCommittedSeriesScore({
            bestOf,
            seriesState,
            matchObj: m,
            seriesLeftSets,
            seriesRightSets,
        });

        m.played = true;
        m.scoreLeft = scoreLeft;
        m.scoreRight = scoreRight;
        m.winnerTeamId = winner.id;
        m.loserTeamId = loser.id;

        const applied = applyRatings({
            ratings: teamRatingsRef.current,
            teams: allTeams,
            winnerId: winner.id,
            loserId: loser.id,
            phase: "qualifier",
            swissStageKey: null,
            swissNet: null,
            playoffsStage: stage,
            bestOf,
            loserSetsWon: Math.min(scoreLeft, scoreRight),
            playedAtMs,
        });

        m.ratingMeta = applied.meta;

        setTeamRatings(applied.nextRatings);
        teamRatingsRef.current = applied.nextRatings;
        saveTeamRatings(applied.nextRatings);

        const winnerSideKey = winner.id === leftTeam.id ? "left" : "right";
        const loserSideKey = otherSide(winnerSideKey);

        let liveStatsAfter =
            seriesState.liveStats ?? {
                left: { ...DEFAULT_TEAM_STAT_VALUES },
                right: { ...DEFAULT_TEAM_STAT_VALUES },
            };

        if (QUALIFIER_QUALIFYING_STAGES.includes(stage)) {
            liveStatsAfter = bumpStat(liveStatsAfter, winnerSideKey, "bigStage", 3);
        }
        if (QUALIFIER_ELIMINATION_STAGES.includes(stage)) {
            liveStatsAfter = bumpStat(liveStatsAfter, loserSideKey, "bigStage", -3);
        }

        liveStatsAfter = resolveSeriesEndStats({
            liveStats: liveStatsAfter,
            winnerSide: winnerSideKey,
            ctx: seriesState.matchCtx,
            winnerSets: winnerSideKey === "left" ? seriesLeftSets : seriesRightSets,
            loserSets: winnerSideKey === "left" ? seriesRightSets : seriesLeftSets,
        });

        m.statsMeta = {
            before: {
                [leftTeam.id]: seriesState.initialStats?.left ?? { ...DEFAULT_TEAM_STAT_VALUES },
                [rightTeam.id]: seriesState.initialStats?.right ?? { ...DEFAULT_TEAM_STAT_VALUES },
            },
            after: {
                [leftTeam.id]: liveStatsAfter.left,
                [rightTeam.id]: liveStatsAfter.right,
            },
            statActivation: seriesState.matchCtx?.active
                ? {
                    version: STAT_ACTIVATION_VERSION,
                    byTeam: {
                        [leftTeam.id]: seriesState.matchCtx.active.left,
                        [rightTeam.id]: seriesState.matchCtx.active.right,
                    },
                }
                : null,
            upset: buildStoredUpsetMeta(seriesState.matchCtx?.upset, leftTeam, rightTeam),
        };

        const nextTeamStats = {
            ...teamStatsRef.current,
            [leftTeam.id]: { ...liveStatsAfter.left, momentum: 0 },
            [rightTeam.id]: { ...liveStatsAfter.right, momentum: 0 },
        };
        setTeamStats(nextTeamStats);
        teamStatsRef.current = nextTeamStats;
        saveTeamStats(nextTeamStats);

        bracket[stage][idx] = m;
        advanceQualifierBracket(bracket, stage, idx, winner, loser);

        const nextQualifier = { ...current, [group]: bracket };
        setQualifier(nextQualifier);
        qualifierRef.current = nextQualifier;

        recomputePickemTotals(nextQualifier);

        if (isQualifierFinished(nextQualifier)) {
            finishQualifier(nextQualifier);
        }
    };

    const commitCstGroupSeries = ({
        group,
        matchId,
        leftTeam,
        rightTeam,
        isTie,
        winner,
        loser,
        seriesLeftSets,
        seriesRightSets,
        playedAtMs,
    }) => {
        const current = cstRef.current;
        const groupObj = current?.[group];
        if (!groupObj) return;

        const matches = [...(groupObj.matches || [])];
        const idx = matches.findIndex((m) => m.id === matchId);
        if (idx < 0) return;

        const m = { ...matches[idx] };
        const { scoreLeft, scoreRight } = getCommittedSeriesScore({
            bestOf: 1,
            seriesState,
            matchObj: m,
            seriesLeftSets,
            seriesRightSets,
        });

        m.played = true;
        m.isTie = isTie;
        m.scoreLeft = scoreLeft;
        m.scoreRight = scoreRight;
        m.winnerTeamId = isTie ? null : winner.id;
        m.loserTeamId = isTie ? null : loser.id;

        const applied = isTie
            ? applyTieRatings({
                ratings: teamRatingsRef.current,
                teams: allTeams,
                leftId: leftTeam.id,
                rightId: rightTeam.id,
                phase: "cstGroup",
                playoffsStage: null,
                bestOf: 1,
                playedAtMs,
            })
            : applyRatings({
                ratings: teamRatingsRef.current,
                teams: allTeams,
                winnerId: winner.id,
                loserId: loser.id,
                phase: "cstGroup",
                swissStageKey: null,
                swissNet: null,
                playoffsStage: null,
                bestOf: 1,
                loserSetsWon: 0,
                playedAtMs,
            });

        m.ratingMeta = applied.meta;

        setTeamRatings(applied.nextRatings);
        teamRatingsRef.current = applied.nextRatings;
        saveTeamRatings(applied.nextRatings);

        const liveStatsBefore =
            seriesState.liveStats ?? {
                left: { ...DEFAULT_TEAM_STAT_VALUES },
                right: { ...DEFAULT_TEAM_STAT_VALUES },
            };

        const winnerSideKey = !isTie && winner.id === leftTeam.id ? "left" : "right";
        const liveStatsAfter = isTie
            ? resolveSeriesTieStats({ liveStats: liveStatsBefore, ctx: seriesState.matchCtx })
            : resolveSeriesEndStats({
                liveStats: liveStatsBefore,
                winnerSide: winnerSideKey,
                ctx: seriesState.matchCtx,
                winnerSets: winnerSideKey === "left" ? seriesLeftSets : seriesRightSets,
                loserSets: winnerSideKey === "left" ? seriesRightSets : seriesLeftSets,
            });

        m.statsMeta = {
            before: {
                [leftTeam.id]: seriesState.initialStats?.left ?? { ...DEFAULT_TEAM_STAT_VALUES },
                [rightTeam.id]: seriesState.initialStats?.right ?? { ...DEFAULT_TEAM_STAT_VALUES },
            },
            after: {
                [leftTeam.id]: liveStatsAfter.left,
                [rightTeam.id]: liveStatsAfter.right,
            },
            statActivation: seriesState.matchCtx?.active
                ? {
                    version: STAT_ACTIVATION_VERSION,
                    byTeam: {
                        [leftTeam.id]: seriesState.matchCtx.active.left,
                        [rightTeam.id]: seriesState.matchCtx.active.right,
                    },
                }
                : null,
            upset: buildStoredUpsetMeta(seriesState.matchCtx?.upset, leftTeam, rightTeam),
        };

        const nextTeamStats = {
            ...teamStatsRef.current,
            [leftTeam.id]: { ...liveStatsAfter.left, momentum: 0 },
            [rightTeam.id]: { ...liveStatsAfter.right, momentum: 0 },
        };
        setTeamStats(nextTeamStats);
        teamStatsRef.current = nextTeamStats;
        saveTeamStats(nextTeamStats);

        matches[idx] = m;
        const next = { ...current, [group]: { ...groupObj, matches } };
        setCst(next);
        cstRef.current = next;

        recomputePickemTotals(undefined, next);

        if (isCstGroupStageFinished(next)) {
            setPlayoffs(buildCstPlayoffs(next));
            setActivePhase("playoffs");
            setViewPhase("playoffs");
        }
    };

    const commitGccLeagueSeries = ({
        matchday,
        matchId,
        leftTeam,
        rightTeam,
        winner,
        loser,
        seriesLeftSets,
        seriesRightSets,
        playedAtMs,
    }) => {
        const current = gccRef.current;
        const dayIndex = matchday - 1;
        const dayMatches = current?.matchdays?.[dayIndex];
        if (!dayMatches) return;

        const idx = dayMatches.findIndex((m) => m.id === matchId);
        if (idx < 0) return;

        const m = { ...dayMatches[idx] };
        commitBracketMatchResult({
            match: m,
            bestOf: GCC_LEAGUE_BEST_OF,
            phase: "gccLeague",
            stage: null,
            leftTeam,
            rightTeam,
            winner,
            loser,
            seriesLeftSets,
            seriesRightSets,
            playedAtMs,
        });

        const matchdays = current.matchdays.map((day, i) => (i === dayIndex ? day.map((x, j) => (j === idx ? m : x)) : day));
        const next = { ...current, matchdays };
        setGcc(next);
        gccRef.current = next;

        if (isGccLeagueFinished(next)) {
            const knockout = buildGccKnockout(next);
            setPlayoffs(knockout);
            setActivePhase("playoffs");
            setViewPhase("playoffs");
            recomputePickemTotals(undefined, undefined, undefined, knockout, { gcc: next });
            return;
        }

        recomputePickemTotals(undefined, undefined, undefined, undefined, { gcc: next });
    };

    const commitPemGroupSeries = ({
        group,
        stage,
        matchId,
        leftTeam,
        rightTeam,
        winner,
        loser,
        seriesLeftSets,
        seriesRightSets,
        playedAtMs,
    }) => {
        const current = pemMainRef.current;
        const groupBracket = current?.[group];
        if (!groupBracket?.[stage]) return;

        const bracket = { ...groupBracket };
        PEM_GROUP_STAGE_ORDER.forEach((key) => {
            bracket[key] = [...(groupBracket[key] || [])];
        });

        const idx = bracket[stage].findIndex((m) => m.id === matchId);
        if (idx < 0) return;

        const m = { ...bracket[stage][idx] };
        const bestOf = getBestOfForPemGroup(stage);
        const { scoreLeft, scoreRight } = getCommittedSeriesScore({
            bestOf,
            seriesState,
            matchObj: m,
            seriesLeftSets,
            seriesRightSets,
        });

        m.played = true;
        m.scoreLeft = scoreLeft;
        m.scoreRight = scoreRight;
        m.winnerTeamId = winner.id;
        m.loserTeamId = loser.id;

        const applied = applyRatings({
            ratings: teamRatingsRef.current,
            teams: allTeams,
            winnerId: winner.id,
            loserId: loser.id,
            phase: isPemBigSeries ? "pemBigGroup" : "pemGroup",
            swissStageKey: null,
            swissNet: null,
            playoffsStage: stage,
            bestOf,
            loserSetsWon: Math.min(scoreLeft, scoreRight),
            playedAtMs,
        });

        m.ratingMeta = applied.meta;

        setTeamRatings(applied.nextRatings);
        teamRatingsRef.current = applied.nextRatings;
        saveTeamRatings(applied.nextRatings);

        const winnerSideKey = winner.id === leftTeam.id ? "left" : "right";

        let liveStatsAfter =
            seriesState.liveStats ?? {
                left: { ...DEFAULT_TEAM_STAT_VALUES },
                right: { ...DEFAULT_TEAM_STAT_VALUES },
            };

        if (PEM_GROUP_QUALIFYING_STAGES.includes(stage)) {
            liveStatsAfter = bumpStat(liveStatsAfter, winnerSideKey, "bigStage", 3);
        }

        liveStatsAfter = resolveSeriesEndStats({
            liveStats: liveStatsAfter,
            winnerSide: winnerSideKey,
            ctx: seriesState.matchCtx,
            winnerSets: winnerSideKey === "left" ? seriesLeftSets : seriesRightSets,
            loserSets: winnerSideKey === "left" ? seriesRightSets : seriesLeftSets,
        });

        m.statsMeta = {
            before: {
                [leftTeam.id]: seriesState.initialStats?.left ?? { ...DEFAULT_TEAM_STAT_VALUES },
                [rightTeam.id]: seriesState.initialStats?.right ?? { ...DEFAULT_TEAM_STAT_VALUES },
            },
            after: {
                [leftTeam.id]: liveStatsAfter.left,
                [rightTeam.id]: liveStatsAfter.right,
            },
            statActivation: seriesState.matchCtx?.active
                ? {
                    version: STAT_ACTIVATION_VERSION,
                    byTeam: {
                        [leftTeam.id]: seriesState.matchCtx.active.left,
                        [rightTeam.id]: seriesState.matchCtx.active.right,
                    },
                }
                : null,
            upset: buildStoredUpsetMeta(seriesState.matchCtx?.upset, leftTeam, rightTeam),
        };

        const nextTeamStats = {
            ...teamStatsRef.current,
            [leftTeam.id]: { ...liveStatsAfter.left, momentum: 0 },
            [rightTeam.id]: { ...liveStatsAfter.right, momentum: 0 },
        };
        setTeamStats(nextTeamStats);
        teamStatsRef.current = nextTeamStats;
        saveTeamStats(nextTeamStats);

        bracket[stage][idx] = m;
        advancePemGroupBracket(bracket, stage, idx, winner, loser);

        const nextPemMain = { ...current, [group]: bracket };
        setPemMain(nextPemMain);
        pemMainRef.current = nextPemMain;

        if (isPemGroupStageFinished(nextPemMain)) {
            const builtPlayoffs = buildPemPlayoffs(nextPemMain, pemConfig.playoffsKind);
            setPlayoffs(builtPlayoffs);
            setActivePhase("playoffs");
            setViewPhase("playoffs");
            recomputePickemTotals(undefined, undefined, nextPemMain, builtPlayoffs);
            return;
        }

        recomputePickemTotals(undefined, undefined, nextPemMain);
    };

    const commitBracketMatchResult = ({
        match,
        bestOf,
        phase,
        stage,
        leftTeam,
        rightTeam,
        winner,
        loser,
        seriesLeftSets,
        seriesRightSets,
        playedAtMs,
        bigStage = null,
    }) => {
        const m = match;
        const { scoreLeft, scoreRight } = getCommittedSeriesScore({
            bestOf,
            seriesState,
            matchObj: m,
            seriesLeftSets,
            seriesRightSets,
        });

        m.played = true;
        m.scoreLeft = scoreLeft;
        m.scoreRight = scoreRight;
        m.winnerTeamId = winner.id;
        m.loserTeamId = loser.id;

        const applied = applyRatings({
            ratings: teamRatingsRef.current,
            teams: allTeams,
            winnerId: winner.id,
            loserId: loser.id,
            phase,
            swissStageKey: null,
            swissNet: null,
            playoffsStage: stage,
            bestOf,
            loserSetsWon: bestOf === 1 ? 0 : Math.min(scoreLeft, scoreRight),
            playedAtMs,
        });

        m.ratingMeta = applied.meta;

        setTeamRatings(applied.nextRatings);
        teamRatingsRef.current = applied.nextRatings;
        saveTeamRatings(applied.nextRatings);

        const winnerSideKey = winner.id === leftTeam.id ? "left" : "right";
        const loserSideKey = otherSide(winnerSideKey);

        let liveStatsAfter =
            seriesState.liveStats ?? {
                left: { ...DEFAULT_TEAM_STAT_VALUES },
                right: { ...DEFAULT_TEAM_STAT_VALUES },
            };

        if (bigStage?.winner) liveStatsAfter = bumpStat(liveStatsAfter, winnerSideKey, "bigStage", bigStage.winner);
        if (bigStage?.loser) liveStatsAfter = bumpStat(liveStatsAfter, loserSideKey, "bigStage", bigStage.loser);

        liveStatsAfter = resolveSeriesEndStats({
            liveStats: liveStatsAfter,
            winnerSide: winnerSideKey,
            ctx: seriesState.matchCtx,
            winnerSets: winnerSideKey === "left" ? seriesLeftSets : seriesRightSets,
            loserSets: winnerSideKey === "left" ? seriesRightSets : seriesLeftSets,
        });

        m.statsMeta = {
            before: {
                [leftTeam.id]: seriesState.initialStats?.left ?? { ...DEFAULT_TEAM_STAT_VALUES },
                [rightTeam.id]: seriesState.initialStats?.right ?? { ...DEFAULT_TEAM_STAT_VALUES },
            },
            after: {
                [leftTeam.id]: liveStatsAfter.left,
                [rightTeam.id]: liveStatsAfter.right,
            },
            statActivation: seriesState.matchCtx?.active
                ? {
                    version: STAT_ACTIVATION_VERSION,
                    byTeam: {
                        [leftTeam.id]: seriesState.matchCtx.active.left,
                        [rightTeam.id]: seriesState.matchCtx.active.right,
                    },
                }
                : null,
            upset: buildStoredUpsetMeta(seriesState.matchCtx?.upset, leftTeam, rightTeam),
        };

        const nextTeamStats = {
            ...teamStatsRef.current,
            [leftTeam.id]: { ...liveStatsAfter.left, momentum: 0 },
            [rightTeam.id]: { ...liveStatsAfter.right, momentum: 0 },
        };
        setTeamStats(nextTeamStats);
        teamStatsRef.current = nextTeamStats;
        saveTeamStats(nextTeamStats);
    };

    const awardPlacings = ({ winsKey, secondsKey, thirdsKey }, { winner, runnerUp, thirdPlace }) => {
        setTeamPlacings((prev) => {
            const next = { ...prev };

            const inc = (id, key) => {
                if (!id) return;
                const cur = next[id] ?? { ...EMPTY_TEAM_PLACINGS };
                next[id] = { ...cur, [key]: (cur[key] ?? 0) + 1 };
            };

            inc(winner?.id, winsKey);
            inc(runnerUp?.id, secondsKey);
            inc(thirdPlace?.id, thirdsKey);

            saveTeamPlacings(next);
            return next;
        });
    };

    const commitEclSeries = ({
        stage,
        matchId,
        leftTeam,
        rightTeam,
        winner,
        loser,
        seriesLeftSets,
        seriesRightSets,
        playedAtMs,
    }) => {
        const current = eclRef.current;
        if (!current?.[stage]) return;

        const bracket = copyBracketStages(ECL_STAGE_ORDER, current);
        const idx = bracket[stage].findIndex((m) => m.id === matchId);
        if (idx < 0) return;

        const m = { ...bracket[stage][idx] };
        commitBracketMatchResult({
            match: m,
            bestOf: getBestOfForEcl(stage),
            phase: "ecl",
            stage,
            leftTeam,
            rightTeam,
            winner,
            loser,
            seriesLeftSets,
            seriesRightSets,
            playedAtMs,
            bigStage: ECL_BIG_STAGE_GAINS[stage] ?? null,
        });

        bracket[stage][idx] = m;
        advanceBracket(ECL_ROUTES, bracket, stage, idx, winner, loser);

        setEcl(bracket);
        eclRef.current = bracket;

        recomputePickemTotals(undefined, undefined, undefined, undefined, { ecl: bracket });

        if (stage === "gf") finishEcl(bracket);
    };

    const finishEcl = (finishedEcl) => {
        const results = getEclResults(finishedEcl);

        setTournamentResults({
            kind: "ecl",
            ...results,
            tournament: { type: ECL_TYPE_ID, number: eclNumber },
        });
        saveFinishedEclToHallOfFame(finishedEcl, results);
        awardPlacings({ winsKey: "tier2Wins", secondsKey: "tier2Seconds", thirdsKey: "tier2Thirds" }, results);

        setShowWinnersScreen(true);
        ratingsSnapshotRef.current = null;
        clearRatingsSnapshot();
        statsSnapshotRef.current = null;
        clearStatsSnapshot();
    };

    const commitPbsSeries = ({
        stage,
        matchId,
        leftTeam,
        rightTeam,
        winner,
        loser,
        seriesLeftSets,
        seriesRightSets,
        playedAtMs,
    }) => {
        if (!playoffs?.[stage]) return;

        const bracket = copyBracketStages(PBS_STAGE_ORDER, playoffs);
        const idx = bracket[stage].findIndex((m) => m.id === matchId);
        if (idx < 0) return;

        const m = { ...bracket[stage][idx] };
        commitBracketMatchResult({
            match: m,
            bestOf: PBS_BEST_OF[stage],
            phase: "pbsPlayoffs",
            stage,
            leftTeam,
            rightTeam,
            winner,
            loser,
            seriesLeftSets,
            seriesRightSets,
            playedAtMs,
            bigStage: PBS_BIG_STAGE[stage] ?? null,
        });

        const currentPbs = pbsRef.current;
        const resolved = resolvePbsResult(currentPbs?.status, winner.id, loser.id);
        m.pbsMeta = resolved.meta;

        if (stage === "gf" || stage === "thirdPlace") {
            const bonus = getPbsBountyBonus(resolved.status[winner.id]?.bounty);

            if (bonus > 0) {
                const nextRatings = { ...teamRatingsRef.current, [winner.id]: (teamRatingsRef.current[winner.id] ?? 0) + bonus };
                setTeamRatings(nextRatings);
                teamRatingsRef.current = nextRatings;
                saveTeamRatings(nextRatings);

                const { rankById: ranksAfterBonus } = buildLeaderboard(allTeams, nextRatings);
                m.ratingMeta = {
                    ...m.ratingMeta,
                    after: Object.fromEntries(
                        Object.entries(m.ratingMeta?.after || {}).map(([id, value]) => [id, { ...value, rank: ranksAfterBonus[id] ?? value.rank }])
                    ),
                };
                m.pbsMeta = { ...m.pbsMeta, bountyBonus: { teamId: winner.id, points: bonus } };
            }
        }

        bracket[stage][idx] = m;

        if (stage === "sf") {
            const slotKey = idx === 0 ? "slotA" : "slotB";
            bracket.gf = [{ ...bracket.gf[0], [slotKey]: toBaseTeam(winner) }];
            bracket.thirdPlace = [{ ...bracket.thirdPlace[0], [slotKey]: toBaseTeam(loser) }];
        }

        let nextPbs = { ...currentPbs, status: resolved.status };
        const nextRound = PBS_NEXT_DRAFT_ROUND[stage];

        if (nextRound && isPbsRoundFinished(bracket, stage)) {
            const entrants = getPbsRoundWinners(bracket, stage).map((team) => ({ id: team.id, ...resolved.status[team.id] }));
            nextPbs = { ...nextPbs, draft: createPbsDraft(nextRound, entrants) };
            clearPbsDraftProgress();

            const nextView = getPbsDraftRoundView(nextRound);
            if (nextView !== getPbsDraftRoundView(stage)) setShowTournamentIntro(true);
            setViewPhase(nextView);
        }

        setPlayoffs(bracket);
        setPbs(nextPbs);
        pbsRef.current = nextPbs;

        recomputePickemTotals(undefined, undefined, undefined, bracket);

        if (stage === "gf") finishPbs(bracket, winner, loser);
    };

    const finishPbs = (finishedBracket, winner, loser) => {
        const third = finishedBracket.thirdPlace?.[0];
        const results = {
            winner: toBaseTeam(winner),
            runnerUp: toBaseTeam(loser),
            thirdPlace: getMatchWinnerTeam(third),
            fourthPlace: getMatchLoserTeam(third),
        };

        setTournamentResults({
            kind: "pbs",
            ...results,
            tournament: { type: PBS_TYPE_ID, number: pbsEdition },
        });
        saveFinishedPbsToHallOfFame(finishedBracket, results);
        awardPlacings({ winsKey: "pbsWins", secondsKey: "tier1Seconds", thirdsKey: "tier1Thirds" }, results);

        setShowWinnersScreen(true);
        ratingsSnapshotRef.current = null;
        clearRatingsSnapshot();
        statsSnapshotRef.current = null;
        clearStatsSnapshot();
    };

    const completePbsDraft = (draftId) => {
        const current = pbsRef.current;
        const draft = current?.draft;
        if (!draft || draft.id !== draftId) return;

        const { round, plan } = draft;
        const teamOf = (id) => toBaseTeam(allTeams.find((team) => team.id === id));

        setPlayoffs((prev) => (prev?.[round]
            ? {
                ...prev,
                [round]: prev[round].map((m, i) => {
                    const pick = plan.picks[i];
                    return pick ? { ...m, slotA: teamOf(pick.pickerId), slotB: teamOf(pick.pickedId) } : m;
                }),
            }
            : prev));

        const next = {
            ...current,
            draft: null,
            draws: {
                ...(current.draws || {}),
                [round]: {
                    high: plan.high,
                    low: plan.low,
                    status: plan.status,
                    picks: plan.picks.map(({ pickerId, pickedId, reason }) => ({ pickerId, pickedId, reason })),
                },
            },
        };
        setPbs(next);
        pbsRef.current = next;
        clearPbsDraftProgress();
    };

    const commitPemStage1Series = ({
        group,
        stage,
        matchId,
        leftTeam,
        rightTeam,
        winner,
        loser,
        seriesLeftSets,
        seriesRightSets,
        playedAtMs,
    }) => {
        const current = pemStage1Ref.current;
        const groupBracket = current?.[group];
        if (!groupBracket?.[stage]) return;

        const bracket = copyBracketStages(PEM_STAGE1_STAGE_ORDER, groupBracket);
        const idx = bracket[stage].findIndex((m) => m.id === matchId);
        if (idx < 0) return;

        const m = { ...bracket[stage][idx] };
        commitBracketMatchResult({
            match: m,
            bestOf: getBestOfForPemStage1(stage),
            phase: "pemStage1",
            stage,
            leftTeam,
            rightTeam,
            winner,
            loser,
            seriesLeftSets,
            seriesRightSets,
            playedAtMs,
            bigStage: PEM_STAGE1_QUALIFYING_STAGES.includes(stage) ? { winner: 3 } : null,
        });

        bracket[stage][idx] = m;
        advancePemStage1Bracket(bracket, stage, idx, winner, loser);

        const nextStage1 = { ...current, [group]: bracket };
        setPemStage1(nextStage1);
        pemStage1Ref.current = nextStage1;

        if (isPemStage1Finished(nextStage1)) {
            const builtPemMain = startPemBigStage2(nextStage1);
            recomputePickemTotals(undefined, undefined, builtPemMain, undefined, { pemStage1: nextStage1 });
            return;
        }

        recomputePickemTotals(undefined, undefined, undefined, undefined, { pemStage1: nextStage1 });
    };

    const startPemBigStage2 = (finishedStage1) => {
        const groups = splitQualifierGroups(buildPemBigStage2Teams(pemSeries, finishedStage1));
        const builtPemMain = buildPemMainGroupStage(groups);

        setPemMain(builtPemMain);
        pemMainRef.current = builtPemMain;
        setPemGroupView("A");
        setPemSeries((prev) => (prev ? { ...prev, mainGroups: groups } : prev));
        setActivePhase("pemGroups");
        setViewPhase("pemGroups");

        return builtPemMain;
    };


    const finishQualifier = (finishedQualifier) => {
        const qualifiers = Object.fromEntries(
            QUALIFIER_GROUPS.map((group) => [group, getQualifierGroupQualifiers(finishedQualifier[group])])
        );
        const edition = pemSeries?.edition ?? getTypeNumber(pemType);

        setTournamentResults({
            kind: "pemQualifier",
            qualifiers,
            tournament: { type: pemType, number: edition },
        });

        setPemSeries((prev) => (prev
            ? { ...prev, qualified: QUALIFIER_GROUPS.flatMap((group) => qualifiers[group]).map(toBaseTeam) }
            : prev));

        saveFinishedQualifierToHallOfFame(finishedQualifier, qualifiers, edition);

        setShowWinnersScreen(true);
        ratingsSnapshotRef.current = null;
        clearRatingsSnapshot();
        statsSnapshotRef.current = null;
        clearStatsSnapshot();
    };

    const seriesCommitExecuteAtRef = useRef(null);

    useEffect(() => {
        if (!pendingActionReady) {
            return;
        }

        if (!seriesState.banner) {
            seriesCommitExecuteAtRef.current = null;
            return;
        }

        const {
            phase,
            leftTeam,
            rightTeam,
            playerWonSets,
            playerLostSets,
            swissStageKey,
            swissNet,
            swissMatchId,
            playoffsStage,
            playoffsMatchId,
            qualifierGroup,
            qualifierStage,
            qualifierMatchId,
        } = seriesState;

        if (!leftTeam || !rightTeam) return;

        const winner = playerWonSets > playerLostSets ? leftTeam : rightTeam;
        const loser = winner.id === leftTeam.id ? rightTeam : leftTeam;

        const seriesLeftSets = playerWonSets;
        const seriesRightSets = playerLostSets;

        const playedAtMs = Date.now();

        seriesCommitExecuteAtRef.current = Date.now() + SERIES_COMMIT_DELAY;

        const remaining = Math.max(
            0,
            seriesCommitExecuteAtRef.current - Date.now()
        );

        const t = setTimeout(() => {
            seriesCommitExecuteAtRef.current = null;
            if (phase === "gccLeague") {
                commitGccLeagueSeries({
                    matchday: seriesState.gccMatchday,
                    matchId: seriesState.gccMatchId,
                    leftTeam,
                    rightTeam,
                    winner,
                    loser,
                    seriesLeftSets,
                    seriesRightSets,
                    playedAtMs,
                });

                setSeriesState(defaultSeriesState);
                return;
            }
            if (phase === "cstGroup") {
                commitCstGroupSeries({
                    group: seriesState.cstGroup,
                    matchId: seriesState.cstMatchId,
                    leftTeam,
                    rightTeam,
                    isTie: !!seriesState.banner?.tie,
                    winner,
                    loser,
                    seriesLeftSets,
                    seriesRightSets,
                    playedAtMs,
                });

                setSeriesState(defaultSeriesState);
                return;
            }
            if (phase === "qualifier") {
                commitQualifierSeries({
                    group: qualifierGroup,
                    stage: qualifierStage,
                    matchId: qualifierMatchId,
                    leftTeam,
                    rightTeam,
                    winner,
                    loser,
                    seriesLeftSets,
                    seriesRightSets,
                    playedAtMs,
                });

                setSeriesState(defaultSeriesState);
                return;
            }
            if (phase === "pemGroup") {
                commitPemGroupSeries({
                    group: seriesState.pemGroup,
                    stage: seriesState.pemGroupStage,
                    matchId: seriesState.pemGroupMatchId,
                    leftTeam,
                    rightTeam,
                    winner,
                    loser,
                    seriesLeftSets,
                    seriesRightSets,
                    playedAtMs,
                });

                setSeriesState(defaultSeriesState);
                return;
            }
            if (phase === "ecl") {
                commitEclSeries({
                    stage: seriesState.eclStage,
                    matchId: seriesState.eclMatchId,
                    leftTeam,
                    rightTeam,
                    winner,
                    loser,
                    seriesLeftSets,
                    seriesRightSets,
                    playedAtMs,
                });

                setSeriesState(defaultSeriesState);
                return;
            }
            if (phase === "pemStage1") {
                commitPemStage1Series({
                    group: seriesState.pemStage1Group,
                    stage: seriesState.pemStage1Stage,
                    matchId: seriesState.pemStage1MatchId,
                    leftTeam,
                    rightTeam,
                    winner,
                    loser,
                    seriesLeftSets,
                    seriesRightSets,
                    playedAtMs,
                });

                setSeriesState(defaultSeriesState);
                return;
            }
            if (phase === "playoffs" && playoffs?.kind === "pbs") {
                commitPbsSeries({
                    stage: playoffsStage,
                    matchId: playoffsMatchId,
                    leftTeam,
                    rightTeam,
                    winner,
                    loser,
                    seriesLeftSets,
                    seriesRightSets,
                    playedAtMs,
                });

                setSeriesState(defaultSeriesState);
                return;
            }
            if (phase === "playoffs") {
                setPlayoffs((prev) => {
                    if (!prev) return prev;

                    const copy = {
                        ...prev,
                        ...(prev.po ? { po: [...prev.po] } : {}),
                        ro16: [...prev.ro16],
                        qf: [...prev.qf],
                        sf: [...prev.sf],
                        thirdPlace: [...prev.thirdPlace],
                        gf: [...prev.gf],
                    };

                    const arr = [...copy[playoffsStage]];
                    const idx = arr.findIndex((m) => m.id === playoffsMatchId);
                    if (idx < 0) return prev;

                    const m = { ...arr[idx] };
                    const isCstBracket = prev.kind === "cst";
                    const isGccBracket = prev.kind === "gcc";
                    const isGplBracket = prev.kind === "gpl";
                    const isPemBracket = isPemPlayoffsKind(prev.kind);
                    const isPemBigBracket = prev.kind === "pemBig";
                    const bigStageScale = isCstBracket || isGccBracket ? CST_BIG_STAGE_SCALE : 1;
                    const bigStageBump = (value) => Math.round(value * bigStageScale);
                    const bestOf = getBestOfForPlayoffs(playoffsStage, prev.kind);
                    const { scoreLeft, scoreRight } = getCommittedSeriesScore({
                        bestOf,
                        seriesState,
                        matchObj: m,
                        seriesLeftSets,
                        seriesRightSets,
                    });

                    m.played = true;
                    m.scoreLeft = scoreLeft;
                    m.scoreRight = scoreRight;
                    m.winnerTeamId = winner.id;
                    m.loserTeamId = loser.id;

                    const loserSetsWon = Math.min(scoreLeft, scoreRight);
                    const applied = applyRatings({
                        ratings: teamRatingsRef.current,
                        teams: allTeams,
                        winnerId: winner.id,
                        loserId: loser.id,
                        phase: isCstBracket
                            ? "cstPlayoffs"
                            : isGccBracket
                                ? "gccPlayoffs"
                                : isGplBracket
                                    ? "gplPlayoffs"
                                    : isPemBigBracket
                                        ? "pemBigPlayoffs"
                                        : isPemBracket
                                            ? "pemPlayoffs"
                                            : "playoffs",
                        swissStageKey: null,
                        swissNet: null,
                        playoffsStage,
                        bestOf,
                        loserSetsWon,
                        playedAtMs,
                    });

                    m.ratingMeta = applied.meta;

                    setTeamRatings(applied.nextRatings);
                    teamRatingsRef.current = applied.nextRatings;
                    saveTeamRatings(applied.nextRatings);

                    const winnerSideKey = winner.id === leftTeam.id ? "left" : "right";
                    const loserSideKey = otherSide(winnerSideKey);

                    let liveStatsAfterBigStage =
                        seriesState.liveStats ?? {
                            left: { ...DEFAULT_TEAM_STAT_VALUES },
                            right: { ...DEFAULT_TEAM_STAT_VALUES },
                        };

                    if (isPemBracket || isGplBracket) {
                        const pemBigStage = (isGplBracket ? GPL_PLAYOFFS_BIG_STAGE : isPemBigBracket ? PEM_BIG_PLAYOFFS_BIG_STAGE : PEM_PLAYOFFS_BIG_STAGE)[playoffsStage] ?? {};

                        if (pemBigStage.winner) {
                            liveStatsAfterBigStage = bumpStat(liveStatsAfterBigStage, winnerSideKey, "bigStage", pemBigStage.winner);
                        }
                        if (pemBigStage.loser) {
                            liveStatsAfterBigStage = bumpStat(liveStatsAfterBigStage, loserSideKey, "bigStage", pemBigStage.loser);
                        }
                    } else if (
                        playoffsStage === "po" ||
                        playoffsStage === "ro16" ||
                        playoffsStage === "qf" ||
                        playoffsStage === "sf"
                    ) {
                        liveStatsAfterBigStage = bumpStat(
                            liveStatsAfterBigStage,
                            winnerSideKey,
                            "bigStage",
                            bigStageBump(5)
                        );
                    } else if (playoffsStage === "thirdPlace") {
                        liveStatsAfterBigStage = bumpStat(
                            liveStatsAfterBigStage,
                            winnerSideKey,
                            "bigStage",
                            bigStageBump(8)
                        );
                        liveStatsAfterBigStage = bumpStat(
                            liveStatsAfterBigStage,
                            loserSideKey,
                            "bigStage",
                            bigStageBump(7)
                        );
                    } else if (playoffsStage === "gf") {
                        liveStatsAfterBigStage = bumpStat(
                            liveStatsAfterBigStage,
                            winnerSideKey,
                            "bigStage",
                            bigStageBump(10)
                        );
                        liveStatsAfterBigStage = bumpStat(
                            liveStatsAfterBigStage,
                            loserSideKey,
                            "bigStage",
                            bigStageBump(8)
                        );
                    }

                    liveStatsAfterBigStage = resolveSeriesEndStats({
                        liveStats: liveStatsAfterBigStage,
                        winnerSide: winnerSideKey,
                        ctx: seriesState.matchCtx,
                        winnerSets: winnerSideKey === "left" ? seriesLeftSets : seriesRightSets,
                        loserSets: winnerSideKey === "left" ? seriesRightSets : seriesLeftSets,
                    });

                    m.statsMeta = {
                        before: {
                            [leftTeam.id]: seriesState.initialStats?.left ?? { ...DEFAULT_TEAM_STAT_VALUES },
                            [rightTeam.id]: seriesState.initialStats?.right ?? { ...DEFAULT_TEAM_STAT_VALUES },
                        },
                        after: {
                            [leftTeam.id]: liveStatsAfterBigStage.left,
                            [rightTeam.id]: liveStatsAfterBigStage.right,
                        },
                        statActivation: seriesState.matchCtx?.active
                            ? {
                                version: STAT_ACTIVATION_VERSION,
                                byTeam: {
                                    [leftTeam.id]: seriesState.matchCtx.active.left,
                                    [rightTeam.id]: seriesState.matchCtx.active.right,
                                },
                            }
                            : null,
                        upset: buildStoredUpsetMeta(seriesState.matchCtx?.upset, leftTeam, rightTeam),
                    };

                    const nextTeamStatsPlayoffs = {
                        ...teamStatsRef.current,
                        [leftTeam.id]: { ...liveStatsAfterBigStage.left, momentum: 0 },
                        [rightTeam.id]: { ...liveStatsAfterBigStage.right, momentum: 0 },
                    };
                    setTeamStats(nextTeamStatsPlayoffs);
                    teamStatsRef.current = nextTeamStatsPlayoffs;
                    saveTeamStats(nextTeamStatsPlayoffs);

                    arr[idx] = m;
                    copy[playoffsStage] = arr;

                    const assign = (targetStage, targetIdx, slotKey, team) => {
                        const tgt = [...copy[targetStage]];
                        const mm = { ...tgt[targetIdx] };
                        mm[slotKey] = team;
                        tgt[targetIdx] = mm;
                        copy[targetStage] = tgt;
                    };

                    if (playoffsStage === "po") {
                        assign("qf", idx, "slotB", winner);
                    } else if (playoffsStage === "ro16") {
                        const pairIndex = Math.floor(idx / 2);
                        const slotKey = idx % 2 === 0 ? "slotA" : "slotB";
                        assign("qf", pairIndex, slotKey, winner);
                    } else if (playoffsStage === "qf" && isPemBracket) {
                        assign("sf", idx, "slotB", winner);
                    } else if (playoffsStage === "qf") {
                        const pairIndex = Math.floor(idx / 2);
                        const slotKey = idx % 2 === 0 ? "slotA" : "slotB";
                        assign("sf", pairIndex, slotKey, winner);
                    } else if (playoffsStage === "sf") {
                        const slotKey = idx === 0 ? "slotA" : "slotB";
                        assign("gf", 0, slotKey, winner);

                        const third = copy.thirdPlace[0] ? { ...copy.thirdPlace[0] } : null;
                        if (third) {
                            if (idx === 0) third.slotA = loser;
                            else third.slotB = loser;
                            copy.thirdPlace = [third];
                        }
                    } else if (playoffsStage === "gf") {
                        let thirdPlaceWinner = null;
                        let fourthPlace = null;
                        const third = copy.thirdPlace[0];

                        if (third && third.played && third.slotA && third.slotB && third.winnerTeamId) {
                            const tpWinner = third.winnerTeamId === third.slotA.id ? third.slotA : third.slotB;
                            const tpLoser = tpWinner.id === third.slotA.id ? third.slotB : third.slotA;
                            thirdPlaceWinner = tpWinner;
                            fourthPlace = tpLoser;
                        }

                        const finishedResults = {
                            winner,
                            runnerUp: loser,
                            thirdPlace: thirdPlaceWinner,
                            fourthPlace,
                        };
                        if (isCstBracket) {
                            setTournamentResults({
                                kind: "cst",
                                ...finishedResults,
                                tournament: { type: CST_TYPE_ID, number: cstNumber },
                            });
                            saveFinishedCstToHallOfFame(copy, finishedResults);
                        } else if (isGccBracket) {
                            setTournamentResults({
                                kind: "gcc",
                                ...finishedResults,
                                tournament: { type: GCC_TYPE_ID, number: gccNumber },
                            });
                            saveFinishedGccToHallOfFame(copy, finishedResults);
                        } else if (isGplBracket) {
                            setTournamentResults({
                                kind: "gpl",
                                ...finishedResults,
                                tournament: { type: GPL_TYPE_ID, number: gplEdition },
                            });
                            saveFinishedGplToHallOfFame(copy, finishedResults);
                        } else if (isPemBracket) {
                            setTournamentResults({
                                kind: "pem",
                                ...finishedResults,
                                tournament: { type: pemType, number: pemEdition },
                            });
                            saveFinishedPemMainToHallOfFame(copy, finishedResults);
                        } else {
                            setTournamentResults({
                                ...finishedResults,
                                tournament: { type: currentTournamentType, number: tournamentNumber },
                            });
                            saveFinishedTournamentToHallOfFame(copy, finishedResults);
                        }
                        awardPlacings(
                            isCstBracket || isGccBracket
                                ? { winsKey: "tier2Wins", secondsKey: "tier2Seconds", thirdsKey: "tier2Thirds" }
                                : isGplBracket
                                    ? { winsKey: "gplWins", secondsKey: "tier1Seconds", thirdsKey: "tier1Thirds" }
                                    : isPemBracket
                                        ? { winsKey: pemConfig.winsKey, secondsKey: "tier1Seconds", thirdsKey: "tier1Thirds" }
                                        : { winsKey: "wins", secondsKey: "seconds", thirdsKey: "thirds" },
                            finishedResults
                        );
                        setShowWinnersScreen(true);
                        ratingsSnapshotRef.current = null;
                        clearRatingsSnapshot();
                        statsSnapshotRef.current = null;
                        clearStatsSnapshot();
                    }

                    return copy;
                });

                setSeriesState(defaultSeriesState);
                recomputePickemTotals();
                return;
            }

            const commitSwiss = (setter, stg) => {
                const copy = {
                    ...stg,
                    teams: stg.teams.map((t) => ({ ...t })),
                    matchesByNet: { ...stg.matchesByNet },
                };

                const arr = [...(copy.matchesByNet[swissNet] || [])];
                const idx = arr.findIndex((m) => m.id === swissMatchId);
                if (idx < 0) return;

                const match = { ...arr[idx] };
                const isGplStage = stg.format === GPL_SWISS_FORMAT;
                const bestOf = getBestOfForSwissNet(swissNet, stg.stageKey, stg.format);

                const aId = match.slotA.id;
                const bId = match.slotB.id;

                match.slotA = copy.teams.find((t) => t.id === aId) || match.slotA;
                match.slotB = copy.teams.find((t) => t.id === bId) || match.slotB;

                const { scoreLeft, scoreRight } = getCommittedSeriesScore({
                    bestOf,
                    seriesState,
                    matchObj: match,
                    seriesLeftSets,
                    seriesRightSets,
                });

                match.played = true;
                match.scoreLeft = scoreLeft;
                match.scoreRight = scoreRight;
                match.winnerTeamId = winner.id;
                match.loserTeamId = loser.id;

                const winnerPoolBefore = copy.teams.find((t) => t.id === winner.id);
                const loserPoolBefore = copy.teams.find((t) => t.id === loser.id);
                const winnerWasAtDecider =
                    winnerPoolBefore?.wins === 2 && winnerPoolBefore?.losses === 2;
                const winnerWasQualified = !!winnerPoolBefore?.qualified;
                const loserWasEliminated = !!loserPoolBefore?.eliminated;

                resolveSwissMatchResult(copy, match, winner.id, scoreLeft, scoreRight);
                calculateBuchholz(copy);

                const winnerPoolAfter = copy.teams.find((t) => t.id === winner.id);
                const loserPoolAfter = copy.teams.find((t) => t.id === loser.id);
                const winnerNewlyQualified = !winnerWasQualified && !!winnerPoolAfter?.qualified;
                const loserNewlyEliminated = !loserWasEliminated && !!loserPoolAfter?.eliminated;

                const loserSetsWon = Math.min(scoreLeft, scoreRight);
                const applied = applyRatings({
                    ratings: teamRatingsRef.current,
                    teams: allTeams,
                    winnerId: winner.id,
                    loserId: loser.id,
                    phase: isGplStage ? "gplSwiss" : "swiss",
                    swissStageKey,
                    swissNet,
                    playoffsStage: null,
                    bestOf,
                    loserSetsWon,
                    playedAtMs,
                });

                match.ratingMeta = applied.meta;

                setTeamRatings(applied.nextRatings);
                teamRatingsRef.current = applied.nextRatings;
                saveTeamRatings(applied.nextRatings);

                const winnerSideKey = winner.id === leftTeam.id ? "left" : "right";
                const loserSideKey = otherSide(winnerSideKey);

                let liveStatsAfterBigStage =
                    seriesState.liveStats ?? {
                        left: { ...DEFAULT_TEAM_STAT_VALUES },
                        right: { ...DEFAULT_TEAM_STAT_VALUES },
                    };

                if (winnerWasAtDecider) {
                    liveStatsAfterBigStage = bumpStat(
                        liveStatsAfterBigStage,
                        winnerSideKey,
                        "bigStage",
                        1
                    );
                }

                if (winnerNewlyQualified) {
                    const clearGain = isGplStage
                        ? GPL_SWISS_CLEAR_GAINS[copy.stageKey] ?? 3
                        : copy.stageKey === "stage1" ? 2 : copy.stageKey === "stage2" ? 3 : 4;
                    liveStatsAfterBigStage = bumpStat(
                        liveStatsAfterBigStage,
                        winnerSideKey,
                        "bigStage",
                        clearGain
                    );
                }

                if (loserNewlyEliminated) {
                    liveStatsAfterBigStage = bumpStat(
                        liveStatsAfterBigStage,
                        loserSideKey,
                        "bigStage",
                        -3
                    );
                }

                liveStatsAfterBigStage = resolveSeriesEndStats({
                    liveStats: liveStatsAfterBigStage,
                    winnerSide: winnerSideKey,
                    ctx: seriesState.matchCtx,
                    winnerSets: winnerSideKey === "left" ? seriesLeftSets : seriesRightSets,
                    loserSets: winnerSideKey === "left" ? seriesRightSets : seriesLeftSets,
                });

                match.statsMeta = {
                    before: {
                        [leftTeam.id]: seriesState.initialStats?.left ?? { ...DEFAULT_TEAM_STAT_VALUES },
                        [rightTeam.id]: seriesState.initialStats?.right ?? { ...DEFAULT_TEAM_STAT_VALUES },
                    },
                    after: {
                        [leftTeam.id]: liveStatsAfterBigStage.left,
                        [rightTeam.id]: liveStatsAfterBigStage.right,
                    },
                    statActivation: seriesState.matchCtx?.active
                        ? {
                            version: STAT_ACTIVATION_VERSION,
                            byTeam: {
                                [leftTeam.id]: seriesState.matchCtx.active.left,
                                [rightTeam.id]: seriesState.matchCtx.active.right,
                            },
                        }
                        : null,
                    upset: buildStoredUpsetMeta(seriesState.matchCtx?.upset, leftTeam, rightTeam),
                };

                const nextTeamStatsSwiss = {
                    ...teamStatsRef.current,
                    [leftTeam.id]: { ...liveStatsAfterBigStage.left, momentum: 0 },
                    [rightTeam.id]: { ...liveStatsAfterBigStage.right, momentum: 0 },
                };
                setTeamStats(nextTeamStatsSwiss);
                teamStatsRef.current = nextTeamStatsSwiss;
                saveTeamStats(nextTeamStatsSwiss);

                arr[idx] = match;
                copy.matchesByNet[swissNet] = arr;

                tryBuildUnlockedNets(copy);

                setter(copy);

                if (isSwissStageFinished(copy)) {
                    if (copy.stageKey === "stage1") {
                        const s2 = buildStage2IfNeeded(copy);
                        setStage2(s2);
                        setActivePhase("stage2");
                        setViewPhase("stage2");
                    } else if (copy.stageKey === "stage2" && isGplStage) {
                        const br = playoffs ?? buildGplPlayoffs(getSwissQualified(copy));
                        setPlayoffs(br);
                        setActivePhase("playoffs");
                        setViewPhase("playoffs");
                    } else if (copy.stageKey === "stage2") {
                        const s3 = buildStage3IfNeeded(copy);
                        setStage3(s3);
                        setActivePhase("stage3");
                        setViewPhase("stage3");
                    } else if (copy.stageKey === "stage3") {
                        const br = buildPlayoffsIfNeeded(copy);
                        setPlayoffs(br);
                        setActivePhase("playoffs");
                        setViewPhase("playoffs");
                    }
                }
            };

            if (swissStageKey === "stage1" && stage1) commitSwiss(setStage1, stage1);
            if (swissStageKey === "stage2" && stage2) commitSwiss(setStage2, stage2);
            if (swissStageKey === "stage3" && stage3) commitSwiss(setStage3, stage3);

            setSeriesState(defaultSeriesState);
            recomputePickemTotals();
        }, remaining);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seriesState.banner, pendingActionReady]);

    useEffect(() => {
        if (!seriesState.active) return;
        if (seriesState.tiebreakerPhase !== "extended") return;
        if (seriesState.banner) return;

        const winners = buildExtendedRoundWinnerList(seriesState.extendedRounds);
        const total = winners.length;

        if (!seriesState.extRoundCommentaryShown) {
            const t = setTimeout(() => {
                setSeriesState((curr) => {
                    if (curr.tiebreakerPhase !== "extended") return curr;
                    return { ...curr, extRoundCommentaryShown: true };
                });
            }, EXT_ROUND_COMMENTARY_DELAY_MS);
            return () => clearTimeout(t);
        }

        if (seriesState.extRoundRevealIndex < total) {
            const t = setTimeout(() => {
                setSeriesState((curr) => {
                    if (curr.tiebreakerPhase !== "extended") return curr;
                    const idx = curr.extRoundRevealIndex;
                    if (idx >= total) return curr;
                    const w = winners[idx];
                    const isLeft = w.winner === "left";

                    const nextLeft = curr.extRoundLeftScore + (isLeft ? 1 : 0);
                    const nextRight = curr.extRoundRightScore + (isLeft ? 0 : 1);

                    let finalLeft = nextLeft;
                    let finalRight = nextRight;
                    let finalRevealIndex = idx + 1;

                    if (finalLeft >= 4 || finalRight >= 4) {
                        for (let i = idx + 1; i < winners.length; i++) {
                            if (winners[i].winner === "left") {
                                finalLeft++;
                            } else {
                                finalRight++;
                            }
                        }

                        finalRevealIndex = winners.length;
                    }

                    return {
                        ...curr,
                        extRoundRevealIndex: finalRevealIndex,
                        extRoundLeftScore: finalLeft,
                        extRoundRightScore: finalRight,
                    };
                });
            }, EXT_ROUND_REVEAL_MS);
            return () => clearTimeout(t);
        }

        const t = setTimeout(() => {
            setSeriesState((curr) => {
                if (curr.tiebreakerPhase !== "extended") return curr;

                const L = curr.extRoundLeftScore;
                const R = curr.extRoundRightScore;

                if (L !== R) {
                    const playerWonSet = L > R;
                    appendSetToCurrentMatchHistory(
                        curr.roundWins,
                        curr.roundLosses,
                        playerWonSet,
                        curr.firstHalfLeft,
                        curr.firstHalfRight,
                        curr.extendedRounds
                    );

                    const newWon = curr.playerWonSets + (playerWonSet ? 1 : 0);
                    const newLost = curr.playerLostSets + (playerWonSet ? 0 : 1);
                    const seriesOver = newWon >= curr.setsToWin || newLost >= curr.setsToWin;

                    const extSetConclusion = resolveSetConclusion({
                        setComebackTracker: curr.setComebackTracker,
                        liveStats: curr.liveStats,
                        setWinnerSide: playerWonSet ? "left" : "right",
                        enteringLeftSets: curr.playerWonSets,
                        enteringRightSets: curr.playerLostSets,
                        setsToWin: curr.setsToWin,
                        upset: curr.matchCtx?.upset ?? null,
                    });

                    if (seriesOver) {
                        const winner = playerWonSet ? curr.leftTeam : curr.rightTeam;
                        toast.dismiss();
                        toast(<span>{renderTeamLabel(winner, true)}</span>, {
                            icon: "🎉",
                            duration: 4000,
                        });
                        setIsLocked(false);
                        return {
                            ...curr,
                            playerWonSets: newWon,
                            playerLostSets: newLost,
                            tiebreakerBigSymbol: "GG",
                            liveStats: extSetConclusion.liveStats,
                            setComebackTracker: extSetConclusion.setComebackTracker,
                            bounceBackArmedSide: extSetConclusion.bounceBackArmedSide,
                            banner: {
                                text: "GG",
                                shadow: `
                                0 0 3px ${winner.color},
                                0 0 7px ${winner.color}66,
                                0 1px 3px rgba(0,0,0,0.4)`,
                                color: winner.color,
                                gradient: winner.gradient,
                            },
                        };
                    }

                    toast(
                        <span>
                            Set {newWon + newLost} has been won in Extended Rounds by{" "}
                            {renderTeamLabel(playerWonSet ? curr.leftTeam : curr.rightTeam)}!
                        </span>,
                        { icon: "🤯", duration: 4000 }
                    );
                    setTimeout(() => {
                        setSeriesState((s) => {
                            if (!s.active || s.banner) return s;
                            clearRoundLog();
                            setIsLocked(false);
                            toast("First Half is beginning", { icon: "🏁", duration: 3000 });
                            return {
                                ...s,
                                playerWonSets: newWon,
                                playerLostSets: newLost,
                                finishedSets: [
                                    ...(s.finishedSets || []),
                                    {
                                        set: s.setNumber,
                                        leftScore: s.roundWins,
                                        rightScore: s.roundLosses,

                                        extendedRoundsPlayed: true,
                                        extendedRoundLeftScore: curr.extRoundLeftScore,
                                        extendedRoundRightScore: curr.extRoundRightScore,

                                        penaltiesPlayed: false,
                                    },
                                ],
                                setNumber: s.setNumber + 1,
                                firstHalfLeft: null,
                                firstHalfRight: null,
                                roundWins: 0,
                                roundLosses: 0,
                                roundNumber: 1,
                                miniWins: 0,
                                miniLosses: 0,
                                isOvertime: false,
                                overtimeBlock: 0,
                                otWins: 0,
                                otLosses: 0,
                                extendedRounds: { firstHalf: null, secondHalf: null, overtimes: [] },
                                tiebreakerPhase: "idle",
                                tiebreakerBigSymbol: null,
                                extRoundLeftScore: 0,
                                extRoundRightScore: 0,
                                extRoundRevealIndex: 0,
                                extRoundCommentaryShown: false,
                                pendingAction: null,
                            };
                        });
                    }, 4000);

                    return {
                        ...curr,
                        playerWonSets: newWon,
                        playerLostSets: newLost,
                        liveStats: extSetConclusion.liveStats,
                        setComebackTracker: extSetConclusion.setComebackTracker,
                        bounceBackArmedSide: extSetConclusion.bounceBackArmedSide,
                    };
                }

                toast("It's tied again!? Then.............", { icon: "😱", duration: 3000 });
                setTimeout(() => {
                    toast("PENALTIES!!!", { icon: "🥅", duration: 4000 });
                }, 3000);

                return { ...curr, tiebreakerBigSymbol: "=" };
            });
        }, EXT_ROUND_FINAL_COMPARE_MS);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        seriesState.active,
        seriesState.tiebreakerPhase,
        seriesState.banner,
        seriesState.extRoundRevealIndex,
        seriesState.extRoundCommentaryShown,
    ]);

    useEffect(() => {
        if (!seriesState.active) return;
        if (seriesState.tiebreakerPhase !== "extended") return;
        if (seriesState.tiebreakerBigSymbol !== "=") return;

        const t = setTimeout(() => {
            setSeriesState((curr) => {
                if (curr.tiebreakerBigSymbol !== "=") return curr;
                return {
                    ...curr,
                    lastMultiplierLeft: null,
                    lastMultiplierRight: null,
                    lastPenaltyAttacker: null,
                    tiebreakerPhase: "penalties",
                    penaltyPreScore: { left: curr.roundWins, right: curr.roundLosses },
                    roundWins: 0,
                    roundLosses: 0,
                    penaltyLeftResults: [],
                    penaltyRightResults: [],
                    penaltyLeftScore: 0,
                    penaltyRightScore: 0,
                    penaltyTurn: Math.random() < 0.5 ? "left" : "right",
                    penaltyResolved: false,
                    tiebreakerBigSymbol: "VS",
                };
            });
            setIsLocked(false);
        }, 4200);
        return () => clearTimeout(t);
    }, [seriesState.active, seriesState.tiebreakerPhase, seriesState.tiebreakerBigSymbol]);
    
    useEffect(() => {
        if (!showWinnersScreen || !tournamentResults) return;

        if (tournamentResults.kind === "pemQualifier") {
            const edition = tournamentResults.tournament?.number ?? pemEdition;
            const finalText = `The 4 qualifiers of ${pemConfig.label} #${edition}:`;

            setShowProceed(false);
            setShowPodium(true);

            if (!hasPlayedWinnerAnimation) {
                setWinnersText("Qualified from Group A:");

                const timers = [
                    setTimeout(() => setShowWinnerText(true), 500),
                    setTimeout(() => setWinnersText("Qualified from Group B:"), 5000),
                    setTimeout(() => setWinnersText(finalText), 9500),
                    setTimeout(() => setShowProceed(true), 11500),
                    setTimeout(() => setHasPlayedWinnerAnimation(true), 13500),
                ];

                return () => timers.forEach(clearTimeout);
            }

            setShowWinnerText(true);
            setShowProceed(true);
            setWinnersText(finalText);
            return;
        }

        const championText = tournamentResults.kind === "cst"
            ? `And the WINNER of Champions Series Tour #${tournamentResults.tournament?.number ?? cstNumber} is:`
            : tournamentResults.kind === "ecl"
                ? `And the WINNER of Elite Competition League #${tournamentResults.tournament?.number ?? eclNumber} is:`
                : tournamentResults.kind === "pem"
                    ? `And the CHAMPION of ${pemConfig.label} #${tournamentResults.tournament?.number ?? pemEdition} is:`
                    : tournamentResults.kind === "gcc"
                        ? `And the WINNER of Global Challenger Cup #${tournamentResults.tournament?.number ?? gccNumber} is:`
                        : tournamentResults.kind === "gpl"
                            ? `And the CHAMPION of Global Pro League #${tournamentResults.tournament?.number ?? gplEdition} is:`
                            : tournamentResults.kind === "pbs"
                                ? `And the CHAMPION of Premier Bounty Series Season ${tournamentResults.tournament?.number ?? pbsEdition} is:`
                                : `And the CHAMPION of Official #${tournamentNumber} is:`;

        setShowProceed(false);
        setShowPodium(true);

        if (!hasPlayedWinnerAnimation) {
            setTimeout(() => setShowWinnerText(true), 500);

            setWinnersText("And the Fourth Place is:");

            const t2 = setTimeout(() => {
                setWinnersText("The Third Place is:");
            }, 4000);

            const t3 = setTimeout(() => {
                setWinnersText("The Runner-Up is:");
            }, 7000);

            const t4 = setTimeout(() => {
                setWinnersText(championText);
            }, 10000);

            const proceed = setTimeout(() => {
                setShowProceed(true);
            }, 15000);

            const veryLast = setTimeout(() => {
                setHasPlayedWinnerAnimation(true);
            }, 20000);

            return () => {
                clearTimeout(t2);
                clearTimeout(t3);
                clearTimeout(t4);
                clearTimeout(veryLast);
                clearTimeout(proceed);
            };
        }

        setShowWinnerText(true);
        setShowProceed(true);
        setWinnersText(championText);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        showWinnersScreen,
        tournamentResults,
        hasPlayedWinnerAnimation
    ]);

    useEffect(() => {
        if (!showPickemSummary || pickemSummarySeen) return;

        const timers = [];
        const later = (fn, ms) => timers.push(setTimeout(fn, ms));

        setShowPickemLine2(false);
        setShowPickemResult(false);
        setShowPickemAchieved(false);
        setPickemCountSettled(false);
        setShowPickemButtons(false);
        setPickemSentenceStep(0);

        const partsCount = buildPickemSentenceParts().length;
        const hasLossLine = (finalPickemPoints ?? 0) - (guessedCounts?.correct ?? 0) !== 0;
        const stepsCount = partsCount + (hasLossLine ? 1 : 0);

        for (let step = 1; step <= stepsCount; step++) {
            later(() => setPickemSentenceStep(step), 200 + (step - 1) * PICKEM_STEP_MS);
        }
        const sentenceDoneAt = 200 + (stepsCount - 1) * PICKEM_STEP_MS;

        later(() => setShowPickemLine2(true), sentenceDoneAt + 1200);
        later(() => setShowPickemAchieved(true), sentenceDoneAt + 1200 + 2400);

        return () => timers.forEach(clearTimeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showPickemSummary]);

    useEffect(() => {
        if (!showPickemSummary || !pickemCountSettled || pickemSummarySeen) return;

        const t1 = setTimeout(() => setShowPickemResult(true), 2000);
        const t2 = setTimeout(() => {
            setShowPickemButtons(true);
            setPickemSummarySeen(true);
        }, 2000 + 5000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showPickemSummary, pickemCountSettled]);

    useEffect(() => {
        if (!showPickemSummary || !showPickemResult || !pickemCountSettled || pickemSummarySeen) return;

        const isSixtySeven =
            (neededPickemPoints !== 67 && finalPickemPoints === 67) ||
            (neededPickemPoints !== 167 && finalPickemPoints === 167) ||
            (neededPickemPoints !== 267 && finalPickemPoints === 267) ||
            (neededPickemPoints !== 367 && finalPickemPoints === 367);
        if (!isSixtySeven) return;

        toast("67?!...", { duration: 4000, icon: "🤯" });
        const t = setTimeout(() => {
            setNeededPickemPoints(67);
            toast("67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67...", {
                duration: 8000,
                icon: "6️⃣7️⃣",
            });
        }, 4000);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showPickemSummary, showPickemResult]);

    const isPickemWin = finalPickemPoints >= neededPickemPoints;

    const handleBackToHome = () => {
        resetSpecialModeState();
        navigate("/");
    };

    const handleBackToSpecialStart = () => {
        resetSpecialModeState();
    };

    const handleBackToGambling = () => {
        resetSpecialModeState();
        navigate("/gambling");
    };

    const buildPickemSentenceParts = () => {
        const green = "#2e7d32";

        if (activePhase === "qualifier") {
            const qualifierParts = [<>YOU guessed{" "}</>];

            QUALIFIER_PICKEM_ROUNDS.forEach(({ key, label, total }, idx) => {
                const value = guessedCounts?.[key] ?? 0;
                const isLast = idx === QUALIFIER_PICKEM_ROUNDS.length - 1;
                const isSecondLast = idx === QUALIFIER_PICKEM_ROUNDS.length - 2;
                const isPerfect = value === total;
                const isAwful = total >= 4 ? value <= Math.floor(total / 4) : value === 0;

                qualifierParts.push(
                    <>
                        {isLast ? "and " : ""}
                        <span style={{ fontWeight: 900, color: isPerfect ? green : isAwful ? "red" : undefined }}>
                            {value}/{total}
                        </span>{" "}
                        {label}{isLast || isSecondLast ? "" : ","}{" "}
                    </>
                );
            });

            return qualifierParts;
        }
        const countItem = ({ key, label, total }) => {
            const value = guessedCounts?.[key] ?? 0;
            const isAwful = total >= 4 ? value <= Math.floor(total / 4) : value === 0;

            return (
                <>
                    <span style={{ fontWeight: 900, color: value === total ? green : isAwful ? "red" : undefined }}>
                        {value}/{total}
                    </span>{" "}
                    {label}
                </>
            );
        };

        if (isEclPhase) {
            const items = ECL_PICKEM_ROUNDS
                .filter(({ key, total }) => total > 1 || (guessedCounts?.[key] ?? 0) > 0)
                .map((round) => (round.total > 1
                    ? countItem(round)
                    : <span style={{ fontWeight: 900, color: green }}>{round.label}</span>));

            return [
                <>YOU guessed{" "}</>,
                ...items.map((node, idx) => (
                    <>
                        {idx === items.length - 1 && items.length > 1 ? "and " : ""}
                        {node}
                        {idx < items.length - 2 ? ", " : " "}
                    </>
                )),
            ];
        }
        if (isPemMainPhase) {
            const items = [
                ...(isPemBigSeries ? PEM_STAGE1_PICKEM_ROUNDS.map(countItem) : []),
                ...PEM_GROUP_PICKEM_ROUNDS.map((round) =>
                    countItem(isPemBigSeries ? { ...round, label: `${round.label} of Stage II` } : round)
                ),
            ];

            const pemRoundDefs = {
                qf: { total: 2, label: "Quarterfinals", awfulMax: 0 },
                sf: { total: 2, label: "Semifinals", awfulMax: 0 },
            };

            ["qf", "sf", "tpd", "gf"]
                .filter((key) => (guessedCounts?.[key] ?? 0) > 0)
                .forEach((key) => {
                    const value = guessedCounts[key];

                    if (key === "tpd") {
                        items.push(<span style={{ fontWeight: 900, color: green }}>the Third Place Decider</span>);
                    } else if (key === "gf") {
                        items.push(<span style={{ fontWeight: 900, color: green }}>the Grand Final</span>);
                    } else {
                        const { total, label, awfulMax } = pemRoundDefs[key];
                        items.push(
                            <>
                                <span style={{ fontWeight: 900, color: value === total ? green : value <= awfulMax ? "red" : undefined }}>
                                    {value}/{total}
                                </span>{" "}
                                {label}
                            </>
                        );
                    }
                });

            return [
                <>YOU guessed{" "}</>,
                ...items.map((node, idx) => (
                    <>
                        {idx === items.length - 1 && items.length > 1 ? "and " : ""}
                        {node}
                        {idx < items.length - 2 ? ", " : " "}
                    </>
                )),
            ];
        }
        if (isCstPhase) {
            const items = CST_GROUPS.map((group) => {
                const value = guessedCounts?.[`cst_${group}`] ?? 0;
                const total = cst?.[group]?.matches?.length ?? 10;

                return (
                    <>
                        <span style={{ fontWeight: 900, color: value === total ? green : value <= Math.floor(total / 4) ? "red" : undefined }}>
                            {value}/{total}
                        </span>{" "}
                        matches from Group {group}
                    </>
                );
            });

            const cstRoundDefs = {
                qf: { total: 4, label: "Quarterfinals", awfulMax: 1 },
                sf: { total: 2, label: "Semifinals" },
            };

            ["qf", "sf", "tpd", "gf"]
                .filter((key) => (guessedCounts?.[key] ?? 0) > 0)
                .forEach((key) => {
                    const value = guessedCounts[key];

                    if (key === "tpd") {
                        items.push(<span style={{ fontWeight: 900, color: green }}>the Third Place Decider</span>);
                    } else if (key === "gf") {
                        items.push(<span style={{ fontWeight: 900, color: green }}>the Grand Final</span>);
                    } else {
                        const { total, label, awfulMax } = cstRoundDefs[key];
                        items.push(
                            <>
                                <span style={{ fontWeight: 900, color: value === total ? green : awfulMax !== undefined && value <= awfulMax ? "red" : undefined }}>
                                    {value}/{total}
                                </span>{" "}
                                {label}
                            </>
                        );
                    }
                });

            return [
                <>YOU guessed{" "}</>,
                ...items.map((node, idx) => (
                    <>
                        {idx === items.length - 1 && items.length > 1 ? "and " : ""}
                        {node}
                        {idx < items.length - 2 ? ", " : " "}
                    </>
                )),
            ];
        }

        const joinItems = (items) => [
            <>YOU guessed{" "}</>,
            ...items.map((node, idx) => (
                <>
                    {idx === items.length - 1 && items.length > 1 ? "and " : ""}
                    {node}
                    {idx < items.length - 2 ? ", " : " "}
                </>
            )),
        ];

        const playoffItems = (roundDefs, keys) => keys
            .filter((key) => (guessedCounts?.[key] ?? 0) > 0)
            .map((key) => {
                if (key === "tpd") return <span style={{ fontWeight: 900, color: green }}>the Third Place Decider</span>;
                if (key === "gf") return <span style={{ fontWeight: 900, color: green }}>the Grand Final</span>;
                return countItem({ key, ...roundDefs[key] });
            });

        if (isPbsPhase) {
            return joinItems([
                countItem({ key: "ro32", label: "Rounds of 32", total: 16 }),
                countItem({ key: "ro16", label: "Rounds of 16", total: 8 }),
                countItem({ key: "qf", label: "Quarterfinals", total: 4 }),
                countItem({ key: "sf", label: "Semifinals", total: 2 }),
                ...playoffItems({}, ["tpd", "gf"]),
            ]);
        }

        if (isGccPhase) {
            return joinItems([
                countItem({ key: "gcc_league", label: "League Phase matches", total: GCC_LEAGUE_MATCH_COUNT }),
                ...playoffItems(
                    {
                        po: { total: 4, label: "Knockout Play-offs" },
                        qf: { total: 4, label: "Quarterfinals" },
                        sf: { total: 2, label: "Semifinals" },
                    },
                    ["po", "qf", "sf", "tpd", "gf"]
                ),
            ]);
        }

        if (isGplMainPhase) {
            return joinItems([
                countItem({ key: "stage1", label: "matches in Stage I", total: GPL_SWISS_MATCH_COUNT }),
                countItem({ key: "stage2", label: "matches in Stage II", total: GPL_SWISS_MATCH_COUNT }),
                ...playoffItems(
                    {
                        qf: { total: 4, label: "Quarterfinals" },
                        sf: { total: 2, label: "Semifinals" },
                    },
                    ["qf", "sf", "tpd", "gf"]
                ),
            ]);
        }

        const playoffKeys = PICKEM_PLAYOFF_KEYS.filter((key) => (guessedCounts?.[key] ?? 0) > 0);
        const roundDefs = {
            ro16: { total: 8, label: "Rounds of 16", awfulMax: 2 },
            qf: { total: 4, label: "Quarterfinals", awfulMax: 1 },
            sf: { total: 2, label: "Semifinals" },
        };
        const stageDefs = [
            ["stage1", "Stage I"],
            ["stage2", "Stage II"],
            ["stage3", "Stage III"],
        ];

        const parts = [<>YOU guessed{" "}</>];

        stageDefs.forEach(([key, label], idx) => {
            const value = guessedCounts[key];
            const isPerfect = value === 66;
            const isAwful = value <= 13;
            const needsComma = idx < stageDefs.length - 1 || playoffKeys.length > 0;
            parts.push(
                <>
                    <span style={{ fontWeight: 900, color: isPerfect ? green : isAwful ? "red" : undefined }}>
                        {value}/66
                    </span>{" "}
                    matches in {label}{needsComma ? "," : ""}{" "}
                </>
            );
        });

        playoffKeys.forEach((key, idx) => {
            const isLast = idx === playoffKeys.length - 1;
            const isSecondLast = idx === playoffKeys.length - 2;
            const value = guessedCounts[key];

            let node;
            if (key === "tpd") {
                node = <span style={{ fontWeight: 900, color: green }}>the Third Place Decider</span>;
            } else if (key === "gf") {
                node = <span style={{ fontWeight: 900, color: green }}>the Grand Final</span>;
            } else {
                const { total, label, awfulMax } = roundDefs[key];
                node = (
                    <>
                        <span style={{ fontWeight: 900, color: value === total ? green : awfulMax !== undefined && value <= awfulMax ? "red" : undefined }}>
                            {value}/{total}
                        </span>{" "}
                        {label}
                    </>
                );
            }

            parts.push(
                <>
                    {isLast && playoffKeys.length > 1 ? "and " : ""}
                    {node}
                    {!isLast && !isSecondLast ? ", " : " "}
                </>
            );
        });

        return parts;
    };
    
    const buildPickemSentence = () =>
        buildPickemSentenceParts().map((part, idx) => (
            <span
                key={idx}
                style={{ opacity: pickemSummarySeen || pickemSentenceStep > idx ? 1 : 0, transition: "opacity 0.8s ease-in-out" }}
            >
                {part}
            </span>
        ));

    const resetBattleExperienceForNextEvent = () => {
        const statsWithFreshExperience = resetBattleExperience(teamStatsRef.current);
        setTeamStats(statsWithFreshExperience);
        teamStatsRef.current = statsWithFreshExperience;
        saveTeamStats(statsWithFreshExperience);
    };

    const pullPemEventTeams = (teams) => pullSeriesEventTeams(pemSeries?.pulledTeamIds, teams);

    const pullSeriesEventTeams = (pulled, teams) => {
        ensureRatingsSnapshot();
        if (!Array.isArray(pulled)) return pulled;
        const done = new Set(pulled.map(String));
        const ids = (teams || []).map((team) => team.id).filter((id) => !done.has(String(id)));
        if (ids.length) {
            const pulledStats = pullStatsTowardStart(teamStatsRef.current, ids);
            setTeamStats(pulledStats);
            teamStatsRef.current = pulledStats;
            saveTeamStats(pulledStats);
        }
        return [...pulled, ...ids];
    };

    const openNextPemEvent = (neededPoints) => {
        setSeriesState(defaultSeriesState);
        clearRoundLog();

        setNeededPickemPoints(neededPoints);
        setFinalPickemPoints(0);
        setGuessedCounts({ stage1: 0, stage2: 0, stage3: 0, ro16: 0, qf: 0, sf: 0, tpd: 0, gf: 0, correct: 0 });
        setShowPickemSummary(false);
        setShowPickemLine2(false);
        setShowPickemResult(false);
        setPickemSummarySeen(false);

        setShowWinnersScreen(false);
        setTournamentResults(null);
        setShowWinnerText(false);
        setShowPodium(false);
        setShowProceed(false);
        setHasPlayedWinnerAnimation(false);
        setWinnersText("And the Fourth Place is:");

        ensureRatingsSnapshot();
        setShowTournamentIntro(true);
        window.scrollTo({ top: 0 });
    };

    const startChampionsSeriesTour = () => {
        const number = getTypeNumber(CST_TYPE_ID) + 1;
        setTypeNumber(CST_TYPE_ID, number);

        const groups = splitCstGroups(pemSeries?.seeds?.cst || []);
        const builtCst = buildCstGroupStage(groups);

        resetBattleExperienceForNextEvent();
        const pulledTeamIds = pullPemEventTeams(pemSeries?.seeds?.cst);

        setCst(builtCst);
        cstRef.current = builtCst;
        setPlayoffs(null);
        setPemSeries((prev) => (prev ? { ...prev, event: "cst", cstNumber: number, cstGroups: groups, pulledTeamIds } : prev));
        setActivePhase("cstGroups");
        setViewPhase("cstGroups");

        openNextPemEvent(getRandomCstNeededPickemPoints());
    };

    const startEliteCompetitionLeague = () => {
        const number = getTypeNumber(ECL_TYPE_ID) + 1;
        setTypeNumber(ECL_TYPE_ID, number);

        const builtEcl = buildEclBracket(pemSeries?.seeds?.ecl || []);

        resetBattleExperienceForNextEvent();
        const pulledTeamIds = pullPemEventTeams(pemSeries?.seeds?.ecl);

        setEcl(builtEcl);
        eclRef.current = builtEcl;
        setPlayoffs(null);
        setPemSeries((prev) => (prev ? { ...prev, event: "ecl", eclNumber: number, pulledTeamIds } : prev));
        setActivePhase("ecl");
        setViewPhase("ecl");

        openNextPemEvent(getRandomEclNeededPickemPoints());
    };

    const startPemMainEvent = () => {
        resetBattleExperienceForNextEvent();
        const pulledTeamIds = pullPemEventTeams([...(pemSeries?.seeds?.mainEvent || []), ...(pemSeries?.qualified || [])]);
        setPemGroupView("A");
        setPlayoffs(null);

        if (isPemBigSeries) {
            const groups = splitQualifierGroups(buildPemStage1Teams(pemSeries));
            const builtStage1 = buildPemStage1(groups);

            setPemStage1(builtStage1);
            pemStage1Ref.current = builtStage1;
            setPemMain(null);
            pemMainRef.current = null;
            setPemSeries((prev) => (prev ? { ...prev, event: "main", stage1Groups: groups, pulledTeamIds } : prev));
            setActivePhase("pemStage1");
            setViewPhase("pemStage1");
        } else {
            const groups = splitQualifierGroups(buildPemMainEventTeams(pemSeries));
            const builtPemMain = buildPemMainGroupStage(groups);

            setPemMain(builtPemMain);
            pemMainRef.current = builtPemMain;
            setPemSeries((prev) => (prev ? { ...prev, event: "main", mainGroups: groups, pulledTeamIds } : prev));
            setActivePhase("pemGroups");
            setViewPhase("pemGroups");
        }

        openNextPemEvent(getRandomPemNeededPickemPoints(pemType));
    };

    const startGplMainEvent = () => {
        const edition = getTypeNumber(GPL_TYPE_ID) + 1;
        setTypeNumber(GPL_TYPE_ID, edition);

        const seeds = gplSeries?.seeds;
        const stage1Seeds = (seeds?.stage1 || []).map(toBaseTeam);
        const stage2Seeds = (seeds?.stage2Auto || []).map(toBaseTeam);

        resetBattleExperienceForNextEvent();
        const pulledTeamIds = pullSeriesEventTeams(gplSeries?.pulledTeamIds, [...stage2Seeds, ...stage1Seeds]);

        tournamentSeedsRef.current = { stage1Seeds, stage2Seeds, stage3Seeds: [] };
        const s1 = buildSwissStage("stage1", stage1Seeds, GPL_SWISS_FORMAT);
        setStage1(s1);
        setStage2(null);
        setStage3(null);
        setPlayoffs(null);
        setGplSeries((prev) => (prev ? { ...prev, event: "gpl", edition, pulledTeamIds } : prev));
        setActivePhase("stage1");
        setViewPhase("stage1");

        openNextPemEvent(getRandomGplNeededPickemPoints());
    };

    const handlePemProceedToNextEvent = () => {
        setShowPickemSummary(false);
        setShowWinnersScreen(false);

        if (gplSeries?.event === "gcc") {
            startGplMainEvent();
            return;
        }

        if (pemSeries?.event === "qualifier" || (activePhase === "qualifier" && !cst && !ecl)) {
            if (getPemSeriesConfig(pemType).secondEvent === "ecl") startEliteCompetitionLeague();
            else startChampionsSeriesTour();
            return;
        }

        if (pemSeries?.event === "cst" || pemSeries?.event === "ecl") startPemMainEvent();
    };

    const handleProceed = () => {
        recomputePickemTotals();
        if (!pickemSummarySeen) {
            setPickemSentenceStep(0);
            setShowPickemAchieved(false);
            setPickemCountSettled(false);
            setShowPickemButtons(false);
        }
        setShowPickemSummary(true);
    };

    const saveFinishedTournamentToHallOfFame = (finishedPlayoffs, finishedResults) => {
        const loserOf = (match) =>
            match?.played
                ? [match.slotA, match.slotB].find((team) => team?.id === match.loserTeamId) || null
                : null;

        const firstLosers = (finishedPlayoffs.ro16 || []).map(loserOf).filter(Boolean);
        const quarterLosers = (finishedPlayoffs.qf || []).map(loserOf).filter(Boolean);
        const orderedPlaces = [
            finishedResults.winner,
            finishedResults.runnerUp,
            finishedResults.thirdPlace,
            finishedResults.fourthPlace,
            ...quarterLosers,
            ...firstLosers,
        ].filter(Boolean);
        const hallAchievedPickemPoints = [
            stage1,
            stage2,
            stage3,
        ].reduce((total, stage) => total + Object.values(stage?.matchesByNet || {})
            .flat()
            .reduce((sum, match) => sum + swissMatchPoints(match), 0), 0)
            + Object.values(finishedPlayoffs || {})
                .flat()
                .reduce((sum, match) => sum + playoffsMatchPoints(match), 0);
        setFinalPickemPoints(hallAchievedPickemPoints);

        const record = {
            id: `official-${tournamentNumber}-${Date.now()}`,
            number: tournamentNumber,
            type: currentTournamentType,
            finishedAt: new Date().toISOString(),
            neededPickemPoints,
            achievedPickemPoints: hallAchievedPickemPoints,
            pickemWon: hallAchievedPickemPoints >= neededPickemPoints,
            results: finishedResults,
            places: orderedPlaces.map((team, index) => ({
                place: index + 1,
                team,
            })),
            qualifiers: {
                stage1: tournamentSeedsRef.current?.stage1Seeds || [],
                stage2: tournamentSeedsRef.current?.stage2Seeds || [],
                stage3: tournamentSeedsRef.current?.stage3Seeds || [],
                playoffs: finishedPlayoffs.ro16?.flatMap((match) => [match.slotA, match.slotB]).filter(Boolean) || [],
            },
            stages: { stage1, stage2, stage3 },
            playoffs: finishedPlayoffs,
        };

        saveHallTournament(record)
            .then(() => setHallOfFame((prev) => sortHallOfFame([record, ...prev.filter((item) => item.id !== record.id)])))
            .catch((error) => console.error("Couldn't save tournament to Hall of Fame:", error));
    };

    const saveFinishedCstToHallOfFame = (finishedPlayoffs, finishedResults) => {
        const groupStage = cstRef.current;
        const achievedPickemPoints =
            getCstGroupMatches(groupStage).reduce((sum, match) => sum + cstGroupMatchPoints(match), 0) +
            Object.values(finishedPlayoffs || {})
                .filter(Array.isArray)
                .flat()
                .reduce((sum, match) => sum + playoffsMatchPoints(match), 0);
        setFinalPickemPoints(achievedPickemPoints);

        const loserOf = (match) =>
            match?.played
                ? [match.slotA, match.slotB].find((team) => team?.id === match.loserTeamId) || null
                : null;
        const quarterLosers = (finishedPlayoffs.qf || []).map(loserOf).filter(Boolean);
        const orderedPlaces = [
            finishedResults.winner,
            finishedResults.runnerUp,
            finishedResults.thirdPlace,
            finishedResults.fourthPlace,
            ...quarterLosers,
        ].filter(Boolean);

        const record = {
            id: `cst-${cstNumber}-${Date.now()}`,
            type: CST_TYPE_ID,
            event: "cst",
            number: cstNumber,
            pemSmallEdition: pemEdition,
            finishedAt: new Date().toISOString(),
            neededPickemPoints,
            achievedPickemPoints,
            pickemWon: achievedPickemPoints >= neededPickemPoints,
            results: finishedResults,
            places: orderedPlaces.map((team, index) => ({ place: index + 1, team })),
            groups: Object.fromEntries(
                CST_GROUPS.map((group) => [group, (groupStage?.[group]?.teams || []).map(toBaseTeam)])
            ),
            groupStage,
            playoffs: finishedPlayoffs,
        };

        saveHallTournament(record)
            .then(() => setHallOfFame((prev) => sortHallOfFame([record, ...prev.filter((item) => item.id !== record.id)])))
            .catch((error) => console.error("Couldn't save the Champions Series Tour to Hall of Fame:", error));
    };

    const saveFinishedQualifierToHallOfFame = (finishedQualifier, qualifiers, edition) => {
        const achievedPickemPoints = getQualifierMatches(finishedQualifier)
            .reduce((sum, match) => sum + qualifierMatchPoints(match), 0);
        setFinalPickemPoints(achievedPickemPoints);

        const record = {
            id: `${pemConfig.hallIdPrefix}-qualifier-${edition}-${Date.now()}`,
            type: pemType,
            event: "qualifier",
            number: edition,
            finishedAt: new Date().toISOString(),
            neededPickemPoints,
            achievedPickemPoints,
            pickemWon: achievedPickemPoints >= neededPickemPoints,
            results: { qualifiers },
            groups: Object.fromEntries(
                QUALIFIER_GROUPS.map((group) => [group, (finishedQualifier[group]?.teams || []).map(toBaseTeam)])
            ),
            qualifier: finishedQualifier,
        };

        saveHallTournament(record)
            .then(() => setHallOfFame((prev) => sortHallOfFame([record, ...prev.filter((item) => item.id !== record.id)])))
            .catch((error) => console.error("Couldn't save the Qualifier to Hall of Fame:", error));
    };

    const saveFinishedEclToHallOfFame = (finishedEcl, finishedResults) => {
        const achievedPickemPoints = getEclMatches(finishedEcl).reduce((sum, match) => sum + eclMatchPoints(match), 0);
        setFinalPickemPoints(achievedPickemPoints);

        const record = {
            id: `ecl-${eclNumber}-${Date.now()}`,
            type: ECL_TYPE_ID,
            event: "ecl",
            number: eclNumber,
            pemBigEdition: pemEdition,
            finishedAt: new Date().toISOString(),
            neededPickemPoints,
            achievedPickemPoints,
            pickemWon: achievedPickemPoints >= neededPickemPoints,
            results: finishedResults,
            places: getEclPlaces(finishedEcl).map((team, index) => ({ place: index + 1, team })),
            teams: (finishedEcl?.teams || []).map(toBaseTeam),
            bracket: finishedEcl,
        };

        saveHallTournament(record)
            .then(() => setHallOfFame((prev) => sortHallOfFame([record, ...prev.filter((item) => item.id !== record.id)])))
            .catch((error) => console.error("Couldn't save the Elite Competition League to Hall of Fame:", error));
    };

    const saveFinishedPemMainToHallOfFame = (finishedPlayoffs, finishedResults) => {
        const groupStage = pemMainRef.current;
        const stage1 = isPemBigSeries ? pemStage1Ref.current : null;
        const achievedPickemPoints =
            getPemStage1Matches(stage1).reduce((sum, match) => sum + pemStage1MatchPoints(match), 0) +
            getPemGroupMatches(groupStage).reduce((sum, match) => sum + pemGroupMatchPoints(match), 0) +
            Object.values(finishedPlayoffs || {})
                .filter(Array.isArray)
                .flat()
                .reduce((sum, match) => sum + playoffsMatchPoints(match), 0);
        setFinalPickemPoints(achievedPickemPoints);

        const quarterLosers = (finishedPlayoffs.qf || []).map(getMatchLoserTeam).filter(Boolean);
        const orderedPlaces = [
            finishedResults.winner,
            finishedResults.runnerUp,
            finishedResults.thirdPlace,
            finishedResults.fourthPlace,
            ...quarterLosers,
        ].filter(Boolean);

        const record = {
            id: `${pemConfig.hallIdPrefix}-${pemEdition}-${Date.now()}`,
            type: pemType,
            event: "main",
            number: pemEdition,
            finishedAt: new Date().toISOString(),
            neededPickemPoints,
            achievedPickemPoints,
            pickemWon: achievedPickemPoints >= neededPickemPoints,
            results: finishedResults,
            places: orderedPlaces.map((team, index) => ({ place: index + 1, team })),
            teams: buildPemMainEventTeams(pemSeries),
            qualifiedTeamIds: (pemSeries?.qualified || []).map((team) => team.id),
            groups: Object.fromEntries(
                PEM_MAIN_GROUPS.map((group) => [group, (groupStage?.[group]?.teams || []).map(toBaseTeam)])
            ),
            groupStage,
            ...(stage1
                ? {
                    stage1Teams: buildPemStage1Teams(pemSeries),
                    stage1Groups: Object.fromEntries(
                        PEM_MAIN_GROUPS.map((group) => [group, (stage1?.[group]?.teams || []).map(toBaseTeam)])
                    ),
                    stage1,
                }
                : {}),
            playoffs: finishedPlayoffs,
        };

        saveHallTournament(record)
            .then(() => setHallOfFame((prev) => sortHallOfFame([record, ...prev.filter((item) => item.id !== record.id)])))
            .catch((error) => console.error(`Couldn't save the ${pemConfig.label} to Hall of Fame:`, error));
    };

    const saveFinishedGccToHallOfFame = (finishedKnockout, finishedResults) => {
        const league = gccRef.current;
        const achievedPickemPoints =
            getGccLeagueMatches(league).reduce((sum, match) => sum + gccLeagueMatchPoints(match), 0) +
            Object.values(finishedKnockout || {})
                .filter(Array.isArray)
                .flat()
                .reduce((sum, match) => sum + playoffsMatchPoints(match), 0);
        setFinalPickemPoints(achievedPickemPoints);

        const record = {
            id: `gcc-${gccNumber}-${Date.now()}`,
            type: GCC_TYPE_ID,
            event: "gcc",
            number: gccNumber,
            finishedAt: new Date().toISOString(),
            neededPickemPoints,
            achievedPickemPoints,
            pickemWon: achievedPickemPoints >= neededPickemPoints,
            results: finishedResults,
            places: getGccPlaces(league, finishedKnockout, finishedResults).map((team, index) => ({ place: index + 1, team })),
            teams: (league?.teams || []).map(toBaseTeam),
            league,
            playoffs: finishedKnockout,
        };

        saveHallTournament(record)
            .then(() => setHallOfFame((prev) => sortHallOfFame([record, ...prev.filter((item) => item.id !== record.id)])))
            .catch((error) => console.error("Couldn't save the Global Challenger Cup to Hall of Fame:", error));
    };

    const saveFinishedGplToHallOfFame = (finishedPlayoffs, finishedResults) => {
        const achievedPickemPoints =
            [stage1, stage2].reduce((total, stage) => total + Object.values(stage?.matchesByNet || {})
                .flat()
                .reduce((sum, match) => sum + swissMatchPoints(match), 0), 0) +
            Object.values(finishedPlayoffs || {})
                .filter(Array.isArray)
                .flat()
                .reduce((sum, match) => sum + playoffsMatchPoints(match), 0);
        setFinalPickemPoints(achievedPickemPoints);

        const quarterLosers = (finishedPlayoffs.qf || []).map(getMatchLoserTeam).filter(Boolean);
        const orderedPlaces = [
            finishedResults.winner,
            finishedResults.runnerUp,
            finishedResults.thirdPlace,
            finishedResults.fourthPlace,
            ...quarterLosers,
        ].filter(Boolean);

        const record = {
            id: `gpl-${gplEdition}-${Date.now()}`,
            type: GPL_TYPE_ID,
            event: "gpl",
            number: gplEdition,
            finishedAt: new Date().toISOString(),
            neededPickemPoints,
            achievedPickemPoints,
            pickemWon: achievedPickemPoints >= neededPickemPoints,
            results: finishedResults,
            places: orderedPlaces.map((team, index) => ({ place: index + 1, team })),
            qualifiers: {
                stage2: (gplSeries?.seeds?.stage2Auto || []).map(toBaseTeam),
                stage1: (gplSeries?.seeds?.stage1 || []).map(toBaseTeam),
                playoffs: (finishedPlayoffs.qf || []).flatMap((match) => [match.slotA, match.slotB]).filter(Boolean),
            },
            stages: { stage1, stage2 },
            playoffs: finishedPlayoffs,
        };

        saveHallTournament(record)
            .then(() => setHallOfFame((prev) => sortHallOfFame([record, ...prev.filter((item) => item.id !== record.id)])))
            .catch((error) => console.error("Couldn't save the Global Pro League to Hall of Fame:", error));
    };

    const saveFinishedPbsToHallOfFame = (finishedBracket, finishedResults) => {
        const achievedPickemPoints = Object.values(finishedBracket || {})
            .filter(Array.isArray)
            .flat()
            .reduce((sum, match) => sum + playoffsMatchPoints(match), 0);
        setFinalPickemPoints(achievedPickemPoints);

        const currentPbs = pbsRef.current;
        const record = {
            id: `pbs-${pbsEdition}-${Date.now()}`,
            type: PBS_TYPE_ID,
            event: "pbs",
            number: pbsEdition,
            finishedAt: new Date().toISOString(),
            neededPickemPoints,
            achievedPickemPoints,
            pickemWon: achievedPickemPoints >= neededPickemPoints,
            results: finishedResults,
            places: getPbsPlaces(finishedBracket, finishedResults).map((team, index) => ({ place: index + 1, team })),
            teams: currentPbs?.seeds || [],
            draws: currentPbs?.draws || {},
            playoffs: finishedBracket,
        };

        saveHallTournament(record)
            .then(() => setHallOfFame((prev) => sortHallOfFame([record, ...prev.filter((item) => item.id !== record.id)])))
            .catch((error) => console.error("Couldn't save the Premier Bounty Series to Hall of Fame:", error));
    };

    const renderQualifierWinnersBlock = (qualifiers, { animated = false } = {}) => (
        <div className={css.qualifier_winners}>
            {QUALIFIER_GROUPS.map((group, groupIndex) => (
                <div key={group} className={css.qualifier_winners_group}>
                    <motion.h3
                        initial={animated ? { opacity: 0, y: -20 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={animated ? { duration: 0.6, delay: groupIndex === 0 ? 0.8 : 5.3 } : { duration: 0 }}
                        className={css.game_title}
                        style={{ fontSize: 34, textTransform: "none" }}
                    >
                        Group {group}
                    </motion.h3>
                    <div className={css.qualifier_winners_teams}>
                        {(qualifiers?.[group] || []).map((team, i) => (
                            <motion.div
                                key={team.id}
                                initial={animated ? { opacity: 0, y: 80 } : false}
                                animate={{ opacity: 1, y: 0 }}
                                transition={animated ? { duration: 1.2, delay: (groupIndex === 0 ? 1.2 : 5.7) + i * 1.2 } : { duration: 0 }}
                                className={css.qualifier_winner_card}
                            >
                                <div
                                    className={css.winnerLogo}
                                    style={{ backgroundColor: team.color, boxShadow: team.shadow }}
                                />
                                <span
                                    className={css.qualifier_winner_name}
                                    style={{
                                        textShadow: `
                                            0 0 6px ${team.color},
                                            0 0 14px ${team.color}66,
                                            0 1px 3px rgba(0,0,0,0.4)
                                        `,
                                    }}
                                >
                                    Team <b>{team.name}</b>
                                </span>
                                <span className={css.qualifier_winner_via}>
                                    {i === 0 ? "via the Upper Final" : "via the Consolidation Final"}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    useHallPendingScroll({ hallPendingScroll, selectedHallTournament, lenisRef, setHallPendingScroll });

    const swissToRender = (() => {
        if (viewPhase === "stage1" || viewPhase === "results_stage1") return stage1;
        if (viewPhase === "stage2" || viewPhase === "results_stage2") return stage2;
        if (viewPhase === "stage3" || viewPhase === "results_stage3") return stage3;
        return null;
    })();

    const isPlayedModal = !!currentModalMatch?.played;

    const modalStatsKey = buildModalStatsKey({
        modalContext,
        currentModalMatch,
        hallRecordId: selectedHallMatch?.record?.id,
        tournamentNumber: modalContext?.type === "qualifier"
            ? pemStatsKey
            : modalContext?.type === "pemGroup" || modalContext?.type === "pemStage1" || isPemPlayoffsKind(modalContext?.kind)
                ? `${pemConfig.statsKeyPrefix}Main${pemEdition}`
                : modalContext?.type === "cstGroup" || modalContext?.kind === "cst"
                    ? `cst${cstNumber}`
                    : modalContext?.type === "ecl"
                        ? `ecl${eclNumber}`
                        : modalContext?.type === "gccLeague" || modalContext?.kind === "gcc"
                            ? `gcc${gccNumber}`
                            : modalContext?.kind === "pbs"
                                ? `pbs${pbsEdition}`
                            : modalContext?.kind === "gpl" || modalContext?.format === GPL_SWISS_FORMAT
                                ? `gpl${gplEdition}`
                                : tournamentNumber,
        isPlayed: isPlayedModal,
    });

    const modalPemType = modalContext?.isArchivedHallOfFame
        ? (modalContext.pemType ?? selectedHallMatch?.record?.type ?? PEM_SMALL_TYPE_ID)
        : pemType;
    const isPemBigModal = modalPemType === PEM_BIG_TYPE_ID;

    const modalPbs = modalContext?.kind === "pbs"
        ? {
            status: modalContext.isArchivedHallOfFame ? null : pbs?.status ?? null,
            meta: currentModalMatch?.pbsMeta ?? null,
        }
        : null;

    const modalGccPots = modalContext?.type === "gccLeague"
        ? (modalContext.isArchivedHallOfFame ? selectedHallMatch?.record?.league?.pots : gcc?.pots) ?? null
        : null;
    const modalPotById = modalGccPots
        ? Object.fromEntries(modalGccPots.flatMap((pot, i) => pot.map((team) => [team.id, i + 1])))
        : null;

    const isEliminationModal =
        modalContext?.type === "playoffs" ||
        modalContext?.type === "qualifier" ||
        modalContext?.type === "pemGroup" ||
        modalContext?.type === "ecl" ||
        modalContext?.type === "pemStage1";

    const showModalMatchNumber = modalContext?.type === "qualifier"
        ? !isSingleQualifierStage(modalContext.stage)
        : modalContext?.type === "pemGroup"
            ? !isSinglePemGroupStage(modalContext.stage)
            : modalContext?.type === "ecl"
                ? !isSingleEclStage(modalContext.stage)
                : modalContext?.type === "pemStage1"
                    ? !isSinglePemStage1Stage(modalContext.stage)
                    : modalContext?.stage !== "gf" && modalContext?.stage !== "thirdPlace";

    const modalStatsPanels = (modalStatsKey && statsPanelMemory[modalStatsKey]) || DEFAULT_STATS_PANELS_STATE;

    const toggleModalStatsPanel = (side) => {
        if (!modalStatsKey) return;

        setStatsPanelMemory((prev) => toggleStatsPanelEntry(prev, modalStatsKey, side));
    };

    const {
        setsToWin,
        overtimeBlock,
        roundWins,
        roundLosses,
        playerWonSets,
        playerLostSets,
        banner,
    } = seriesState;

    const overtimeTarget = BASE_ROUNDS_TO_WIN + overtimeBlock * 3;
    const overtimeToWin = overtimeBlock === 0 ? 16 : BASE_ROUNDS_TO_WIN + overtimeBlock * 3;

    const threshold = overtimeTarget - 1;

    const isSetPointWins = roundWins === threshold && roundLosses < threshold;
    const isSetPointLosses = roundLosses === threshold && roundWins < threshold;

    const isSeriesPointWins =
        isSetPointWins && playerWonSets === setsToWin - 1;
    const isSeriesPointLosses =
        isSetPointLosses && playerLostSets === setsToWin - 1;

    let loserOpacity = null;
    if (banner) {
        if (playerWonSets > playerLostSets) {
            loserOpacity = "loss";
        } else if (playerLostSets > playerWonSets) {
            loserOpacity = "win";
        }
    }

    let wonPickemPoints = null;

    if (isPlayedModal && currentModalMatch?.played) {
        if (modalContext?.type === "swiss") {
            wonPickemPoints = swissMatchPoints(currentModalMatch);
        } else if (modalContext?.type === "playoffs") {
            wonPickemPoints = playoffsMatchPoints(currentModalMatch);
        } else if (modalContext?.type === "qualifier") {
            wonPickemPoints = qualifierMatchPoints(currentModalMatch);
        } else if (modalContext?.type === "pemGroup") {
            wonPickemPoints = pemGroupMatchPoints(currentModalMatch);
        } else if (modalContext?.type === "ecl") {
            wonPickemPoints = eclMatchPoints(currentModalMatch);
        } else if (modalContext?.type === "pemStage1") {
            wonPickemPoints = pemStage1MatchPoints(currentModalMatch);
        } else if (modalContext?.type === "cstGroup") {
            wonPickemPoints = cstGroupMatchPoints(currentModalMatch);
        } else if (modalContext?.type === "gccLeague") {
            wonPickemPoints = gccLeagueMatchPoints(currentModalMatch);
        }
    }

    let pickemLabelText = "";
    let pickemLabelStyle = {};

    if (wonPickemPoints !== null) {
        if (wonPickemPoints === 0) {
            pickemLabelText = "+0 Pick'em points";
            pickemLabelStyle = { color: "red", left: isEliminationModal ? '95%' : '75%' };
        } else if (wonPickemPoints === 1) {
            pickemLabelText = "+1 Pick'em point";
            pickemLabelStyle = { color: "#2e7d32", left: isEliminationModal ? '95%' : '75%' };
        } else {
            pickemLabelText = `+${wonPickemPoints} Pick'em points`;
            pickemLabelStyle = { color: "#2e7d32", left: isEliminationModal ? '95%' : '75%' };
        }
    }

    const didUserWin =
        !!currentModalMatch?.played &&
        !!currentModalMatch?.pickTeamId &&
        !!currentModalMatch?.winnerTeamId &&
        currentModalMatch.pickTeamId === currentModalMatch.winnerTeamId;

    const pbsDraftShowNode = isPbsDraftLive && pbsDraftClock ? (
        <PbsDraftShow
            clock={pbsDraftClock}
            plan={pbsDraft.plan}
            timeline={pbsDraftTimeline}
            teamsById={pbsTeamsById}
            ratings={teamRatings}
            speed={pbsDraft?.speed ?? 1}
            onSpeedChange={setPbsDraftSpeed}
            paused={!!pbsDraft?.paused}
            onTogglePause={togglePbsDraftPause}
            onSkip={skipPbsDraftShow}
        />
    ) : null;

    const pbsDraftView = pbsDraft && pbsDraftClock
        ? { clock: pbsDraftClock, plan: pbsDraftPlan, timeline: pbsDraftTimeline, show: pbsDraftShowNode }
        : null;

    const {
        renderPbsPage,
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
        renderGccPage,
        renderGccLeague,
    } = createTournamentRenderers({
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
        gcc,
        gccLabel,
        isGccKnockout,
        isGplMainPhase,
        openGccLeagueMatchModal,
        openArchivedGccLeagueMatchModal,
        openArchivedSwissMatchModal,
        pbs,
        pbsLabel,
        pbsDraftView,
        teamsById: pbsTeamsById,
    });


    const getMatchStakeText = ({
        modalContext,
        winnerIsLeft,
        winnerIsRight,
    }) => {
        const playoffsStage = modalContext?.stage;
        const stage = modalContext?.stageKey;
        const type = modalContext?.type;
        const net = modalContext?.net;
        const index = modalContext?.isArchivedHallOfFame
            ? (selectedHallMatch?.index ?? -1)
            : (playoffs?.[modalContext.stage] || []).findIndex((m) => m.id === modalContext.matchId);
        const num = index >= 0 ? index + 1 : 1;

        let leftText = null;
        let rightText = null;

        if (type === "swiss") {
            const isGplSwiss = modalContext?.format === GPL_SWISS_FORMAT;
            const isProgression =
                net === "2:0" ||
                net === "2:1" ||
                net === "2:2";

            const isElimination =
                net === "0:2" ||
                net === "1:2" ||
                net === "2:2";

            if (isProgression) {
                let progressionText = "";

                if (stage === "stage1") {
                    progressionText = "qualifies to Stage II";
                }

                if (stage === "stage2") {
                    progressionText = isGplSwiss ? "qualifies to Playoffs: Quarterfinals" : "qualifies to Stage III";
                }

                if (stage === "stage3") {
                    progressionText = "qualifies to Playoffs: Round of 16";
                }

                if (winnerIsLeft) leftText = progressionText;
                if (winnerIsRight) rightText = progressionText;
            }

            if (isElimination) {
                const eliminationText =
                    stage === "stage3" || (isGplSwiss && stage === "stage2")
                        ? "doesn't make it to Playoffs"
                        : "flies out of this tournament";

                if (winnerIsLeft) {
                    rightText = eliminationText;
                }

                if (winnerIsRight) {
                    leftText = eliminationText;
                }
            }
        }

        if (type === "qualifier" || type === "pemGroup" || type === "ecl" || type === "pemStage1") {
            const texts = type === "pemGroup"
                ? getPemGroupStakeTexts(playoffsStage)
                : type === "ecl"
                    ? getEclStakeTexts(playoffsStage)
                    : type === "pemStage1"
                        ? getPemStage1StakeTexts(playoffsStage)
                        : getQualifierStakeTexts(playoffsStage);

            if (winnerIsLeft) {
                leftText = texts.winner;
                rightText = texts.loser;
            } else if (winnerIsRight) {
                rightText = texts.winner;
                leftText = texts.loser;
            }
        }

        if (type === "playoffs" && modalContext?.kind === "pbs") {
            const texts = getPbsStakeTexts(playoffsStage, !!currentModalMatch?.pbsMeta?.favouriteWon);

            if (texts) {
                if (winnerIsLeft) {
                    leftText = texts.winner;
                    rightText = texts.loser;
                } else if (winnerIsRight) {
                    rightText = texts.winner;
                    leftText = texts.loser;
                }

                return { leftText, rightText };
            }
        }

        if (type === "playoffs") {
            switch (playoffsStage) {
                case "po":
                    if (winnerIsLeft) {
                        leftText = <>goes to <b>Quarterfinals</b></>;
                        rightText = "path ends here, for now!";
                    } else {
                        rightText = <>goes to <b>Quarterfinals</b></>;
                        leftText = "path ends here, for now!";
                    }
                    break;

                case "ro16":
                    if (winnerIsLeft) {
                        leftText = <>goes to <b>Quarterfinals</b></>;
                        rightText = "path ends here, for now!";
                    } else {
                        rightText = <>goes to <b>Quarterfinals</b></>;
                        leftText = "path ends here, for now!";
                    }
                    break;

                case "qf":
                    if (winnerIsLeft) {
                        leftText = <>goes to <b>Semifinals</b></>;
                        rightText = "path ends here, for now!";
                    } else {
                        rightText = <>goes to <b>Semifinals</b></>;
                        leftText = "path ends here, for now!";
                    }
                    break;

                case "sf": {
                    if (num === 1) {
                        if (winnerIsLeft) {
                            leftText = <>is the first <b>Grand Finalist</b>!</>;
                            rightText = "has still a chance of earning Third Place";
                        } else {
                            rightText = <>is the first <b>Grand Finalist</b>!</>;
                            leftText = "has still a chance of earning Third Place";
                        }
                    }
                    if (num === 2) {
                        if (winnerIsLeft) {
                            leftText = <>is the second <b>Grand Finalist</b>!</>;
                            rightText = "has still a chance of earning Third Place";
                        } else {
                            rightText = <>is the second <b>Grand Finalist</b>!</>;
                            leftText = "has still a chance of earning Third Place";
                        }
                    }

                    break;
                }

                case "thirdPlace":
                    if (winnerIsLeft) {
                        leftText = <>earns <b>Third Place Medal</b>!</>;
                        rightText = "still had a good run!";
                    } else {
                        rightText = <>earns <b>Third Place Medal</b>!</>;
                        leftText = "still had a good run!";
                    }
                    break;

                case "gf":
                    if (winnerIsLeft) {
                        leftText = <><b>WINS</b> the tournament!</>;
                        rightText = "second place is still wonderful!";
                    } else {
                        rightText = <><b>WINS</b> the tournament!</>;
                        leftText = "second place is still wonderful!";
                    }
                    break;
            }
        }

        if (type === "playoffs" && modalContext?.kind === "pbs" && (playoffsStage === "sf" || playoffsStage === "gf")) {
            const bountyLine = getPbsBountyLine(playoffsStage, !!currentModalMatch?.pbsMeta?.favouriteWon);
            if (winnerIsLeft && leftText) leftText = <>{leftText}<br />{bountyLine}</>;
            if (winnerIsRight && rightText) rightText = <>{rightText}<br />{bountyLine}</>;
        }

        return {
            leftText,
            rightText,
        };
    };

    useLayoutEffect(() => {
        const id = requestAnimationFrame(() => {
            window.dispatchEvent(new Event("resize"));
        });

        return () => cancelAnimationFrame(id);
    }, [tournamentResults]);

    const modalTitle = useMemo(() => {
        if (!modalContext) return "";

        if (modalContext.type === "swiss") {
            return swissNetTitle(modalContext.net);
        }

        if (modalContext.type === "qualifier") {
            return qualifierStageLabel(modalContext.stage);
        }

        if (modalContext.type === "pemGroup") {
            return pemGroupStageLabel(modalContext.stage);
        }

        if (modalContext.type === "ecl") {
            return eclStageLabel(modalContext.stage);
        }

        if (modalContext.type === "pemStage1") {
            return pemStage1StageLabel(modalContext.stage);
        }

        if (modalContext.type === "cstGroup") {
            return `Group ${modalContext.group}`;
        }

        if (modalContext.type === "gccLeague") {
            return `Matchday ${modalContext.matchday}`;
        }

        const stageText = stageLabelPlayoffs(modalContext.stage);
        return stageText;
    }, [modalContext]);

    const modalMatchNumber = useMemo(() => {
        if (!modalContext) return 1;

        if (modalContext.type === "swiss") {
            return currentModalMatch?.matchNoInNet ?? 1;
        }

        const matches = modalContext.isArchivedHallOfFame
            ? []
            : modalContext.type === "qualifier"
                ? (qualifier?.[modalContext.group]?.[modalContext.stage] ?? [])
                : modalContext.type === "pemGroup"
                    ? (pemMain?.[modalContext.group]?.[modalContext.stage] ?? [])
                    : modalContext.type === "ecl"
                        ? (ecl?.[modalContext.stage] ?? [])
                        : modalContext.type === "pemStage1"
                            ? (pemStage1?.[modalContext.group]?.[modalContext.stage] ?? [])
                            : modalContext.type === "cstGroup"
                                ? (cst?.[modalContext.group]?.matches ?? [])
                                : modalContext.type === "gccLeague"
                                    ? (gcc?.matchdays?.[modalContext.matchday - 1] ?? [])
                                    : (playoffs?.[modalContext.stage] ?? []);
        const index = modalContext.isArchivedHallOfFame
            ? selectedHallMatch?.index ?? -1
            : matches.findIndex((m) => m.id === modalContext.matchId);

        return index >= 0 ? index + 1 : 1;
    }, [modalContext, currentModalMatch, playoffs, qualifier, cst, ecl, pemStage1, pemMain, gcc, selectedHallMatch]);

    const breakdownPointLabel = useMemo(() => {
        if (!modalContext) return "MATCH POINT!!!";
        if (modalContext.type === "playoffs" || modalContext.type === "cstGroup" || modalContext.type === "gccLeague") return "MATCH POINT!!!";
        if (modalContext.type === "qualifier") {
            return QUALIFIER_QUALIFYING_STAGES.includes(modalContext.stage) ? "MAIN EVENT POINT!!!" : "MATCH POINT!!!";
        }
        if (modalContext.type === "pemGroup") {
            return PEM_GROUP_QUALIFYING_STAGES.includes(modalContext.stage) ? "PLAYOFFS POINT!!!" : "MATCH POINT!!!";
        }
        if (modalContext.type === "ecl") {
            return modalContext.stage === "uf" || modalContext.stage === "cf" ? "GRAND FINAL POINT!!!" : "MATCH POINT!!!";
        }
        if (modalContext.type === "pemStage1") {
            return PEM_STAGE1_QUALIFYING_STAGES.includes(modalContext.stage) ? "STAGE II POINT!!!" : "MATCH POINT!!!";
        }

        const pointNet = ["2:0", "2:1", "2:2"];
        if (!pointNet.includes(modalContext.net)) return "MATCH POINT!!!";

        if (modalContext.stageKey === "stage1") return "STAGE II POINT!!!";
        if (modalContext.stageKey === "stage2") return modalContext.format === GPL_SWISS_FORMAT ? "PLAYOFFS POINT!!!" : "STAGE III POINT!!!";
        if (modalContext.stageKey === "stage3") return "PLAYOFFS POINT!!!";

        return "MATCH POINT!!!";
    }, [modalContext]);

    const modalStageSmallLabel = useMemo(() => {
        if (!modalContext) return "";
        if (modalContext.type === "playoffs") return "";
        if (modalContext.type === "qualifier") return `Group ${modalContext.group}`;
        if (modalContext.type === "pemGroup") return isPemBigModal ? `Stage II | Group ${modalContext.group}` : `Group ${modalContext.group}`;
        if (modalContext.type === "pemStage1") return `Stage I | Group ${modalContext.group}`;
        if (modalContext.type === "ecl") return "";
        if (modalContext.type === "cstGroup") return "Group Stage";
        if (modalContext.type === "gccLeague") return "League Phase";
        if (modalContext.stageKey === "stage1") return "Stage I";
        if (modalContext.stageKey === "stage2") return "Stage II";
        if (modalContext.stageKey === "stage3") return "Stage III";
        return "";
    }, [modalContext, isPemBigModal]);

    const displayedMiniSquares =
        seriesState.roundNumber === 1 ||
            seriesState.roundNumber === 13 ||
            (seriesState.isOvertime && seriesState.roundNumber === 1)
            ? 10
            : 5;
    if (showPickemSummary) {
        return (
            <PickemSummary
                pickem={{
                    finalPickemPoints,
                    guessedCounts,
                    pickemSummarySeen,
                    showPickemLine2,
                    showPickemAchieved,
                    pickemCountSettled,
                    showPickemResult,
                    showPickemButtons,
                    pickemSentenceStep,
                    buildPickemSentenceParts,
                    buildPickemSentence,
                    neededPickemPoints,
                    isPickemWin,
                    setPickemCountSettled,
                }}
                phase={{ activePhase, isCstPhase, isEclPhase, isGccPhase }}
                actions={{
                    handlePemProceedToNextEvent,
                    resetSpecialModeState,
                    setShowPickemSummary,
                    setShowWinnersScreen,
                    navigate,
                }}
            />
        );
    }

    if (showWinnersScreen && tournamentResults?.kind === "pemQualifier") {
        return (
            <QualifierWinnersScreen
                winners={{ showWinnerText, hasPlayedWinnerAnimation, winnersText, tournamentResults, showProceed }}
                labels={{ pemLabel, renderQualifierWinnersBlock }}
                actions={{ handleProceed }}
            />
        );
    }

    if (showWinnersScreen && tournamentResults) {
        return (
            <WinnersScreen
                winners={{
                    tournamentNumber,
                    tournamentResults,
                    showWinnerText,
                    hasPlayedWinnerAnimation,
                    winnersText,
                    showPodium,
                    showProceed,
                }}
                labels={{ cstLabel, eclLabel, pemLabel, gccLabel, pbsLabel, tournamentLabel, pemType }}
                actions={{ handleProceed }}
            />
        );
    }

    if (isSeriesActive) {
        return (
            <SeriesScreen
                header={{
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
                }}
                series={{
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
                }}
                labels={{
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
                    isPbsPhase,
                    pbsLabel,
                    getOvertimeLabel,
                    getPenaltyMessage,
                    getMultiplierClass,
                    renderTeamLabel,
                }}
                actions={{ handlePenaltyShot, handleSeriesGamble }}
            />
        );
    }

    const placementColors = {
        1: "gold",
        2: "silver",
        3: "#cd7f32",

        4: "#4fc3f7",
        5: "#40e0d0",
        6: "#ba68c8",
        7: "#ff5e2d",
        8: "#81c784",
        9: "#f9e4a1",
        10: "#b0bec5",
    };

    const matchModalNode = (isMatchModalOpen && modalContext && currentModalMatch) ? (
        <MatchModal
            key="match-modal"
            modal={{
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
            }}
            teams={{ placementColors, rankById, teamRatings, teamStats, allTeams, teamPlacings }}
            actions={{ closeMatchModal, handleChooseLeft, handleChooseRight, handleStartMatch }}
            labels={{ getOvertimeShortLabel }}
        />
    ) : null;

    if (isHallOfFameOpen) {
        return (
            <>
                <HallOfFameView hall={hall} hallManager={hallManager} leaderboardState={leaderboardState} hallDrag={hallDrag} page={{
                        getTournamentTheme,
                        renderTournamentLabelFor,
                        openArchivedHallMatchModal,
                        isButtonLocked,
                        setIsRestartModalOpen,
                        setIsTerminateModalOpen,
                        navigate,
                        renderCstGroupStage,
                        renderEclBracket,
                        renderPemStage1Bracket,
                        renderPemGroupBracket,
                        renderQualifierTitle,
                        renderQualifierBracket,
                        renderQualifierWinnersBlock,
                        renderGccLeague,
                        renderSwissBracket,
                        hallManagerScrollRef,
                        getTypeNumber,
                        allTeams,
                    }} />
                <AnimatePresence>{matchModalNode}</AnimatePresence>
            </>
        );
    }

    if (isLeaderboardOpen) {
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
                    onHallOfFame={() => setIsHallOfFameOpen(true)}
                />
                <LeaderboardView tournamentNumberAdmin={tournamentNumberAdmin} leaderboardState={leaderboardState} page={{
                        isTournamentNumberButtonLocked,
                        renderTournamentLabelFor,
                        teamStats,
                        teamRatings,
                        placementColors,
                        teamPlacings,
                        rankById,
                    }} />
                <GameControlModals
                    controls={{ isRestartModalOpen, confirmRestart, isTerminateModalOpen, confirmTerminate, setIsRestartModalOpen, setIsTerminateModalOpen }}
                />
                <LeaderboardAdminModals full tournamentNumberAdmin={tournamentNumberAdmin} statsAdmin={statsAdmin} placingsAdmin={placingsAdmin} page={{
                        renderTournamentLabelFor,
                        getTypeNumber,
                        allTeams,
                        toggleSelectAllTeams,
                        rankById,
                        teamRatings,
                        getSortValue,
                        getDisplayedValue,
                    }} />
            </>
        );
    };

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
                onHallOfFame={() => setIsHallOfFameOpen(true)}
            />

            <div className={css.page_container} style={{ transition: "none" }}>
                {showIntro ? (
                    <>
                        <StartPage
                            intro={{ colorSeq }}
                            picker={{
                                isTournamentPickerOpen,
                                tournamentPicker,
                                handlePickRandomTournament,
                                setIsTournamentPickerOpen,
                                handleToggleTournamentType,
                            }}
                            actions={{ handleTournamentStart, navigate, setIsHallOfFameOpen }}
                        />
                    </>
                ) : isPemMainPhase ? (
                    renderPemMainPage()
                ) : isQualifierPhase ? (
                    renderQualifierPage()
                ) : isCstPhase ? (
                    renderCstPage()
                ) : isEclPhase ? (
                    renderEclPage()
                ) : isGccPhase ? (
                    renderGccPage()
                ) : isPbsPhase ? (
                    renderPbsPage()
                ) : (
                    <>
                        <SwissTournamentView
                            view={{
                                showPickemLine2,
                                hover,
                                tournamentResults,
                                activePhase,
                                neededPickemPoints,
                                viewPhase,
                                swissToRender,
                                setHover,
                            }}
                            renderers={{ renderResultsNav, getStageTitleForView, renderPlayoffsBracket, renderSwissBracket }}
                            actions={{
                                handleBackToHome,
                                handleBackToSpecialStart,
                                handleBackToGambling,
                                setShowPickemSummary,
                                setShowWinnersScreen,
                            }}
                        />
                    </>
                )}

                <GameControlModals
                    controls={{
                        isRestartModalOpen,
                        confirmRestart,
                        isTerminateModalOpen,
                        confirmTerminate,
                        setIsRestartModalOpen,
                        setIsTerminateModalOpen,
                    }}
                />
                <LeaderboardAdminModals full={false} tournamentNumberAdmin={tournamentNumberAdmin} statsAdmin={statsAdmin} placingsAdmin={placingsAdmin} page={{
                        renderTournamentLabelFor,
                        getTypeNumber,
                        allTeams,
                        toggleSelectAllTeams,
                        rankById,
                        teamRatings,
                        getSortValue,
                        getDisplayedValue,
                    }} />
                <TournamentIntros
                    intro={{ showTournamentIntro, handleCloseTournamentIntro }}
                    phase={{ isQualifierPhase, isCstPhase, isEclPhase, isPemMainPhase, isPemBigSeries, isGccPhase, isGplMainPhase, isPbsPhase }}
                    labels={{ renderQualifierTitle, renderCstTitle, eclLabel, pemLabel, gccLabel, pbsLabel, tournamentLabel }}
                    tournament={{ ecl, pemSeries, leaderboard, qualifier, teamRatings, cst, pemStage1, pemMain, gcc, gplSeries, pbs, pbsTeamsById }}
                />
            </div>
            <AnimatePresence>{matchModalNode}</AnimatePresence>
        </>
    );
}

export default SpecialModePage;