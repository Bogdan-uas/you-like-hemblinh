import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import Lenis from "lenis";
import {
    FaArrowTrendUp,
    FaArrowUpWideShort,
    FaAward,
    FaBatteryFull,
    FaBolt,
    FaBomb,
    FaBoxOpen,
    FaBreadSlice,
    FaBriefcase,
    FaBroom,
    FaBuilding,
    FaBullseye,
    FaCakeCandles,
    FaCalendarCheck,
    FaCalendarDay,
    FaCalendarDays,
    FaCalendarWeek,
    FaCamera,
    FaChartLine,
    FaChess,
    FaChessKing,
    FaChessQueen,
    FaCircleCheck,
    FaCircleDot,
    FaCircleHalfStroke,
    FaClock,
    FaCloudRain,
    FaClover,
    FaCoins,
    FaCompass,
    FaCrosshairs,
    FaCrown,
    FaDice,
    FaDoorClosed,
    FaDoorOpen,
    FaDragon,
    FaEarthEurope,
    FaEye,
    FaFaceSadTear,
    FaFeather,
    FaFire,
    FaFireFlameCurved,
    FaFlag,
    FaFlagCheckered,
    FaFutbol,
    FaGamepad,
    FaGaugeHigh,
    FaGavel,
    FaGem,
    FaGift,
    FaGlasses,
    FaGlobe,
    FaHammer,
    FaHand,
    FaHandFist,
    FaHandshake,
    FaHatCowboy,
    FaHatWizard,
    FaHeart,
    FaHeartPulse,
    FaHourglassEnd,
    FaHourglassHalf,
    FaInfinity,
    FaLandmark,
    FaLandmarkDome,
    FaLayerGroup,
    FaListCheck,
    FaListOl,
    FaLocationCrosshairs,
    FaMapLocationDot,
    FaMasksTheater,
    FaMedal,
    FaMoneyBillWave,
    FaMonument,
    FaMoon,
    FaMountain,
    FaMountainSun,
    FaPersonRunning,
    FaRankingStar,
    FaRegCircle,
    FaRepeat,
    FaRoad,
    FaRocket,
    FaRotateLeft,
    FaRoute,
    FaSackDollar,
    FaScaleBalanced,
    FaScaleUnbalanced,
    FaScissors,
    FaScroll,
    FaSeedling,
    FaShield,
    FaShieldHalved,
    FaShieldHeart,
    FaShoePrints,
    FaSkull,
    FaSquarePlus,
    FaStairs,
    FaStar,
    FaStopwatch,
    FaSun,
    FaTableList,
    FaTrophy,
    FaUmbrella,
    FaUserTie,
    FaUsers,
    FaWandMagicSparkles,
    FaWind,
} from "react-icons/fa6";
import { ONE_TIME_LOOK, TIERS, anniversaryRank, levelInfo } from "./progressConfig.js";
import { getAnniversaryTheme } from "../logic/winnersAndPickem.js";

export const ACHIEVEMENT_ICONS = {
    regular: FaFlagCheckered,
    hallOfFamer: FaLandmark,
    globetrotter: FaEarthEurope,
    anniversary: FaCakeCandles,
    worldTour: FaRoute,
    handsOn: FaHand,
    oracle: FaEye,
    sharpshooter: FaBullseye,
    upsetWhisperer: FaBolt,
    hotHand: FaFire,
    byAHair: FaFeather,
    crushingIt: FaHammer,
    againstAllOdds: FaDice,
    perfectRound: FaCircleCheck,
    underdogChampion: FaCrown,
    insured: FaShieldHalved,
    grinder: FaGamepad,
    marathon: FaPersonRunning,
    bigStage: FaTrophy,
    doubleTrouble: FaClock,
    tiebreaker: FaScaleBalanced,
    spotKick: FaFutbol,
    bagel: FaRegCircle,
    reverseSweep: FaRotateLeft,
    fullDistance: FaRoad,
    cleanSweep: FaBroom,
    fromTheBottom: FaStairs,
    allTheWayUp: FaMountain,
    dynasty: FaChessKing,
    bountyKing: FaGem,
    roadWarrior: FaShoePrints,
    contender: FaMedal,
    eliteCompany: FaRankingStar,
    kingmaker: FaChessQueen,
    manyCrowns: FaUsers,
    partyTime: FaGift,
    longHaul: FaHourglassHalf,
    pointHoarder: FaCoins,
    onARoll: FaRocket,
    longShotHunter: FaLocationCrosshairs,
    safeHands: FaHandshake,
    finalWord: FaGavel,
    photoFinish: FaCamera,
    soClose: FaFaceSadTear,
    coinFlip: FaCircleHalfStroke,
    clairvoyant: FaHatWizard,
    roughPatch: FaCloudRain,
    setCollector: FaLayerGroup,
    comebackKid: FaArrowTrendUp,
    sweeper: FaWind,
    downToTheWire: FaHourglassEnd,
    extendedStay: FaInfinity,
    fromTheSpot: FaCircleDot,
    baker: FaBreadSlice,
    tripleThreat: FaFireFlameCurved,
    endlessSet: FaStopwatch,
    nailBiter: FaHeartPulse,
    backToBack: FaRepeat,
    newBlood: FaSeedling,
    ragsToRiches: FaSackDollar,
    officialBusiness: FaBriefcase,
    pemRegular: FaAward,
    proLeaguer: FaListOl,
    bountyHunter: FaCrosshairs,
    grandmaster: FaChess,
    starPower: FaStar,
    skylineWalker: FaBuilding,
    cupRunner: FaTableList,
    climber: FaMountainSun,
    starlight: FaWandMagicSparkles,
    completionist: FaListCheck,
    dailyHabit: FaCalendarCheck,
    riskManager: FaUmbrella,
    bonusHunter: FaSquarePlus,
    trimmedDown: FaScissors,
    secondWind: FaHeart,
    hatTrick: FaHatCowboy,
    explorer: FaCompass,
    untouchable: FaShieldHeart,
    sharpEye: FaGlasses,
    upsetNight: FaSkull,
    closeCalls: FaScaleUnbalanced,
    sevenWonders: FaMonument,
    blowout: FaBomb,
    endurance: FaBatteryFull,
    openEra: FaDoorOpen,
    openDoors: FaDoorClosed,
    tourGuide: FaMapLocationDot,
    leagueClimber: FaChartLine,
    candidate: FaUserTie,
    international: FaGlobe,
    ladderClimber: FaArrowUpWideShort,
    challengerCircuit: FaFlag,
    benefitCollector: FaBoxOpen,
    nightOwl: FaMoon,
    earlyBird: FaSun,
    shieldBearer: FaShield,
    boosted: FaGaugeHigh,
    luckyCharm: FaClover,
    overtimePayday: FaMoneyBillWave,
    knockoutArtist: FaHandFist,
    livingLegend: FaLandmarkDome,
    propheticRun: FaScroll,
    theEpic: FaDragon,
    penaltyDrama: FaMasksTheater,
    dynastySupreme: FaChessKing,
    circuitMaster: FaRoute,
    legendaryCollector: FaInfinity,
    fullyInsured: FaUmbrella,
};

export const formatXp = (value) => Math.round(value || 0).toLocaleString("en-US");

const FX_PALETTES = [
    { min: 1000, colors: ["#fff1a0", "#ffcf1a", "#ffe98a", "#3fd8ff", "#d4a017"], glow: "#ffcc33", spark: "#fff3a6" },
    { min: 500, colors: ["#ff3b3b", "#ff9f1a", "#ffe600", "#2ee66b", "#1ab8ff", "#9b4dff", "#ff2d95"], glow: "#ff6ad5", spark: "#ffffff" },
    { min: 250, colors: ["#e2b8ff", "#c77dff", "#9d4edd", "#5a189a"], glow: "#b56cff", spark: "#f1dcff" },
    { min: 100, colors: ["#d9f7ff", "#7fdcff", "#29a9e0", "#0b6fa3"], glow: "#4fc8ff", spark: "#e8fbff" },
    { min: 50, colors: ["#ffa3a3", "#ff4d6d", "#d61a3c", "#760019"], glow: "#ff4d6d", spark: "#ffd6dd" },
    { min: 25, colors: ["#eef0f4", "#b9bec8", "#7d8492", "#4b515e"], glow: "#9aa3b5", spark: "#ffffff" },
    { min: 10, colors: ["#fff7b3", "#ffd700", "#e0a800", "#a87400"], glow: "#ffc400", spark: "#fff6c2" },
    { min: 5, colors: ["#f2c792", "#cd7f32", "#a5611f", "#6e3f10"], glow: "#e0913f", spark: "#ffe0bd" },
    { min: 1, colors: ["#b5f0d0", "#2ecc71", "#169158", "#0a5a34"], glow: "#2ecc71", spark: "#e6fff1" },
];

const paletteFor = (level) => FX_PALETTES.find((p) => level >= p.min) ?? FX_PALETTES[FX_PALETTES.length - 1];

export const levelFx = (level) => {
    const anniversary = !!getAnniversaryTheme(level);
    const rank = anniversaryRank(level);
    const palette = paletteFor(level);
    const strength = anniversary ? (rank >= 2 ? 3 : 2) : level > 100 ? 1 : 0;
    const stops = palette.colors;
    return {
        level,
        strength,
        palette,
        rank,
        text: strength
            ? {
                backgroundImage: `linear-gradient(180deg, ${stops.join(", ")})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
            }
            : null,
        ring: strength ? `conic-gradient(from 210deg, ${[...stops, stops[0]].join(", ")})` : null,
        glow: palette.glow,
        spark: palette.spark,
    };
};

export const levelNumberStyle = (level) => levelFx(level).text ?? undefined;

export const tierLook = (tierIndex) => (tierIndex == null || tierIndex < 0 ? ONE_TIME_LOOK : TIERS[tierIndex]);


export const useLevelUpPulse = (level) => {
    const [state, setState] = useState({ level, pulse: 0 });
    if (state.level !== level) {
        const pulse = level > state.level ? state.pulse + 1 : state.pulse;
        setState({ level, pulse });
        return pulse;
    }
    return state.pulse;
};

export const useLevelOf = (xpMV) => {
    const [level, setLevel] = useState(() => levelInfo(xpMV.get()).level);
    useMotionValueEvent(xpMV, "change", (value) => {
        const next = levelInfo(value).level;
        if (next !== level) setLevel(next);
    });
    return level;
};

export const useScreenLenis = (smooth) => {
    const wrapperRef = useRef(null);
    const contentRef = useRef(null);
    const lenisRef = useRef(null);
    const smoothRef = useRef(smooth);

    useEffect(() => {
        const root = document.documentElement;
        const previous = [root.style.overflow, document.body.style.overflow];
        root.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        return () => {
            root.style.overflow = previous[0];
            document.body.style.overflow = previous[1];
        };
    }, []);

    useEffect(() => {
        if (!wrapperRef.current || !contentRef.current) return undefined;
        const lenis = new Lenis({ wrapper: wrapperRef.current, content: contentRef.current, duration: 1.8, smoothWheel: smoothRef.current });
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

    useEffect(() => {
        smoothRef.current = smooth;
        if (lenisRef.current) lenisRef.current.options.smoothWheel = smooth;
    }, [smooth]);

    return { wrapperRef, contentRef, lenisRef };
};

export const TASK_LOOKS = {
    daily: { color: "#2f80ed", icon: FaCalendarDay, title: "Daily tasks", blurb: "Three fresh tasks every day." },
    weekly: { color: "#27ae60", icon: FaCalendarWeek, title: "Weekly tasks", blurb: "A bigger set of tasks for the whole week." },
    monthly: { color: "#9b51e0", icon: FaCalendarDays, title: "Monthly tasks", blurb: "Long goals, which take the whole month." },
    crazy: { color: "#ff3d77", icon: FaBolt, title: "Crazy tasks", blurb: "Only for the bravest. No re-rolls, no mercy." },
};

const TASK_CAT_TIER = { daily: 0, weekly: 1, monthly: 2, crazy: 3 };
const TASK_DIFF_INDEX = { easy: 0, medium: 1, hard: 2, wild: 0, insane: 1, unhinged: 2 };
const TASK_POP_HOLD_MS = [1650, 2000, 2450, 3200];

export const taskTierOf = (task) => TASK_CAT_TIER[task?.cat] ?? 0;
export const taskDiffOf = (task) => TASK_DIFF_INDEX[task?.difficultyKey ?? String(task?.difficulty ?? "").toLowerCase()] ?? 1;
export const taskPopHoldMs = (task) => TASK_POP_HOLD_MS[taskTierOf(task)] + taskDiffOf(task) * 150;
