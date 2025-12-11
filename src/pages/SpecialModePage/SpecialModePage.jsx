import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import css from "./SpecialModePage.module.css";
import Header from "../../components/Header/Header.jsx";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const STORAGE_KEY = "specialPageState";

const BASE_MAX_ROUNDS = 24;
const BASE_ROUNDS_TO_WIN = 13;
const OT_MAX_ROUNDS = 6;
const OT_ROUNDS_TO_WIN = 4;

const MULTIPLIER_MIN = -1.5;
const MULTIPLIER_MAX = 1.5;

const MIN_NEEDED_PICKEM = 53;
const MAX_NEEDED_PICKEM = 74;
const neededPickemPointsAmount = Math.floor(
    Math.random() * (MAX_NEEDED_PICKEM - MIN_NEEDED_PICKEM + 1)
) + MIN_NEEDED_PICKEM;

const STAGE_ORDER = ["ro16", "qf", "sf", "thirdPlace", "gf"];

const COLORS = {
    red: {
        shadow: "0 0 10px rgba(255, 0, 0, 0.5)",
        color: "#FF0000",
        unlitColor: "#2a0000",
        name: "Red"
    },
    orange: {
        shadow: "0 0 10px rgba(255, 127, 0, 0.5)",
        color: "#FF7F00",
        unlitColor: "#4b2a00",
        name: "Orange"
    },
    yellow: {
        shadow: "0 0 10px rgba(255, 255, 0, 0.5)",
        color: "#FFFF00",
        unlitColor: "#4b4b00",
        name: "Yellow"
    },
    lime: {
        shadow: "0 0 10px rgba(0, 255, 0, 0.5)",
        color: "#32CD32",
        unlitColor: "#1a2a00",
        name: "Lime"
    },
    green: {
        shadow: "0 0 10px rgba(0, 128, 0, 0.5)",
        color: "#008000",
        unlitColor: "#002a00",
        name: "Green"
    },
    cyan: {
        shadow: "0 0 10px rgba(0, 255, 255, 0.5)",
        color: "#00FFFF",
        unlitColor: "#004b4b",
        name: "Cyan"
    },
    blue: {
        shadow: "0 0 10px rgba(0, 0, 255, 0.5)",
        color: "#0000FF",
        unlitColor: "#00002a",
        name: "Blue"
    },
    indigo: {
        shadow: "0 0 10px rgba(54, 0, 93, 0.5)",
        color: "#4A007F",
        unlitColor: "#1a002a",
        name: "Indigo"
    },
    violet: {
        shadow: "0 0 10px rgba(138, 43, 226, 0.5)",
        color: "#8A2BE2",
        unlitColor: "#1a002a",
        name: "Violet"
    },
    pink: {
        shadow: "0 0 10px rgba(255, 20, 147, 0.5)",
        color: "#FF1493",
        unlitColor: "#4b002a",
        name: "Pink"
    },
    beige: {
        shadow: "0 0 10px rgba(255, 192, 203, 0.5)",
        color: "#FFC0CB",
        unlitColor: "#4b2a2a",
        name: "Beige"
    },
    black: {
        shadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        color: "#000000",
        unlitColor: "#5d5d5d",
        name: "Black"
    },
    white: {
        shadow: "0 0 10px rgba(186, 186, 186, 0.5)",
        color: "#bebebeff",
        unlitColor: "#656565ff",
        name: "White"
    },
    gray: {
        shadow: "0 0 10px rgba(128, 128, 128, 0.5)",
        color: "#808080",
        unlitColor: "#272727",
        name: "Gray"
    },
    brown: {
        shadow: "0 0 10px rgba(122, 55, 0, 0.5)",
        color: "#7F3900",
        unlitColor: "#201000",
        name: "Brown"
    },
    teal: {
        shadow: "0 0 10px rgba(0, 109, 111, 0.5)",
        color: "#006D6F",
        unlitColor: "#001a1a",
        name: "Teal"
    },
    gold: {
        shadow: "0 0 10px rgba(212, 175, 55, 0.5)",
        color: "#D4AF37",
        unlitColor: "#3a2c08",
        name: "Gold"
    },
    silver: {
        shadow: "0 0 10px rgba(192, 192, 192, 0.5)",
        color: "#C0C0C0",
        unlitColor: "#3a3a3a",
        name: "Silver"
    },
    navy: {
        shadow: "0 0 10px rgba(0, 0, 90, 0.5)",
        color: "#00005aff",
        unlitColor: "#00001a",
        name: "Navy"
    },
    olive: {
        shadow: "0 0 10px rgba(128, 128, 0, 0.5)",
        color: "#808000",
        unlitColor: "#2a2a00",
        name: "Olive"
    },
    coral: {
        shadow: "0 0 10px rgba(255, 127, 80, 0.5)",
        color: "#FF7F50",
        unlitColor: "#4b2819",
        name: "Coral"
    },
    magenta: {
        shadow: "0 0 10px rgba(255, 0, 255, 0.5)",
        color: "#FF00FF",
        unlitColor: "#4b004b",
        name: "Magenta"
    },
    lavender: {
        shadow: "0 0 10px rgba(181, 126, 220, 0.5)",
        color: "#B57EDC",
        unlitColor: "#332144",
        name: "Lavender"
    },
    sky: {
        shadow: "0 0 10px rgba(135, 206, 235, 0.5)",
        color: "#87CEEB",
        unlitColor: "#234252",
        name: "Sky"
    },
    mint: {
        shadow: "0 0 10px rgba(152, 251, 152, 0.5)",
        color: "#98FB98",
        unlitColor: "#284428",
        name: "Mint"
    },
    salmon: {
        shadow: "0 0 10px rgba(250, 128, 114, 0.5)",
        color: "#FA8072",
        unlitColor: "#4b2320",
        name: "Salmon"
    },
    plum: {
        shadow: "0 0 10px rgba(142, 69, 133, 0.5)",
        color: "#8E4585",
        unlitColor: "#2a1327",
        name: "Plum"
    },
    khaki: {
        shadow: "0 0 10px rgba(195, 176, 145, 0.5)",
        color: "#C3B091",
        unlitColor: "#403528",
        name: "Khaki"
    },
    crimson: {
        shadow: "0 0 10px rgba(220, 20, 60, 0.5)",
        color: "#DC143C",
        unlitColor: "#3a020c",
        name: "Crimson"
    },
    turquoise: {
        shadow: "0 0 10px rgba(64, 224, 208, 0.5)",
        color: "#40E0D0",
        unlitColor: "#11423c",
        name: "Turquoise"
    },
    chartreuse: {
        shadow: "0 0 10px rgba(127, 255, 0, 0.5)",
        color: "#7FFF00",
        unlitColor: "#234400",
        name: "Chartreuse"
    },
    steel: {
        shadow: "0 0 10px rgba(70, 130, 180, 0.5)",
        color: "#4682B4",
        unlitColor: "#172637",
        name: "Steel"
    },
    emerald: {
        shadow: "0 0 10px rgba(0, 201, 87, 0.5)",
        color: "#00C957",
        unlitColor: "#024023",
        name: "Emerald"
    },
    ruby: {
        shadow: "0 0 10px rgba(224, 17, 95, 0.5)",
        color: "#E0115F",
        unlitColor: "#3a071c",
        name: "Ruby"
    },
    sapphire: {
        shadow: "0 0 10px rgba(15, 82, 186, 0.5)",
        color: "#0F52BA",
        unlitColor: "#042040",
        name: "Sapphire"
    },
    amber: {
        shadow: "0 0 10px rgba(255, 191, 0, 0.5)",
        color: "#FFBF00",
        unlitColor: "#4b3a00",
        name: "Amber"
    },
    bronze: {
        shadow: "0 0 10px rgba(205, 127, 50, 0.5)",
        color: "#CD7F32",
        unlitColor: "#3f2610",
        name: "Bronze"
    },
    copper: {
        shadow: "0 0 10px rgba(184, 115, 51, 0.5)",
        color: "#B87333",
        unlitColor: "#3b210f",
        name: "Copper"
    },
    sand: {
        shadow: "0 0 10px rgba(244, 164, 96, 0.5)",
        color: "#F4A460",
        unlitColor: "#4a3119",
        name: "Sand"
    },
    seafoam: {
        shadow: "0 0 10px rgba(120, 219, 226, 0.5)",
        color: "#78DBE2",
        unlitColor: "#1f4044",
        name: "Seafoam"
    },
    forest: {
        shadow: "0 0 10px rgba(34, 139, 34, 0.5)",
        color: "#228B22",
        unlitColor: "#0b2d0b",
        name: "Forest"
    },
    midnight: {
        shadow: "0 0 10px rgba(25, 25, 112, 0.5)",
        color: "#191970",
        unlitColor: "#05051f",
        name: "Midnight"
    },
    peach: {
        shadow: "0 0 10px rgba(255, 218, 185, 0.5)",
        color: "#FFDAB9",
        unlitColor: "#4b3c29",
        name: "Peach"
    },
    apricot: {
        shadow: "0 0 10px rgba(251, 206, 177, 0.5)",
        color: "#FBCEB1",
        unlitColor: "#4a3626",
        name: "Apricot"
    },
    periwinkle: {
        shadow: "0 0 10px rgba(204, 204, 255, 0.5)",
        color: "#CCCCFF",
        unlitColor: "#33334a",
        name: "Periwinkle"
    },
    sunflower: {
        shadow: "0 0 10px rgba(255, 215, 0, 0.5)",
        color: "#FFD700",
        unlitColor: "#4b3d00",
        name: "Sunflower"
    },
    raspberry: {
        shadow: "0 0 10px rgba(227, 11, 93, 0.5)",
        color: "#E30B5D",
        unlitColor: "#3b051b",
        name: "Raspberry"
    },
    chocolate: {
        shadow: "0 0 10px rgba(95, 56, 23, 0.5)",
        color: "#5F3817",
        unlitColor: "#1e1207",
        name: "Chocolate"
    },
    ivory: {
        shadow: "0 0 10px rgba(255, 255, 240, 0.5)",
        color: "#FFFFF0",
        unlitColor: "#4a4a3b",
        name: "Ivory"
    },
    charcoal: {
        shadow: "0 0 10px rgba(54, 69, 79, 0.5)",
        color: "#36454F",
        unlitColor: "#101519",
        name: "Charcoal"
    },
    denim: {
        shadow: "0 0 10px rgba(21, 96, 189, 0.5)",
        color: "#1560BD",
        unlitColor: "#062445",
        name: "Denim"
    },
    spring: {
        shadow: "0 0 10px rgba(0, 255, 127, 0.5)",
        color: "#00FF7F",
        unlitColor: "#014426",
        name: "Spring"
    },
    ocean: {
        shadow: "0 0 10px rgba(0, 105, 148, 0.5)",
        color: "#006994",
        unlitColor: "#012030",
        name: "Ocean"
    },
    lilac: {
        shadow: "0 0 10px rgba(200, 162, 200, 0.5)",
        color: "#C8A2C8",
        unlitColor: "#3f2c3f",
        name: "Lilac"
    },
    rose: {
        shadow: "0 0 10px rgba(255, 102, 204, 0.5)",
        color: "#FF66CC",
        unlitColor: "#4b1f3e",
        name: "Rose"
    },
    frost: {
        shadow: "0 0 10px rgba(210, 230, 255, 0.5)",
        color: "#D2E6FF",
        unlitColor: "#344056",
        name: "Frost"
    },
    slate: {
        shadow: "0 0 10px rgba(112, 128, 144, 0.5)",
        color: "#708090",
        unlitColor: "#252a30",
        name: "Slate"
    },
    moss: {
        shadow: "0 0 10px rgba(138, 154, 91, 0.5)",
        color: "#8A9A5B",
        unlitColor: "#2a3114",
        name: "Moss"
    },
    wine: {
        shadow: "0 0 10px rgba(114, 47, 55, 0.5)",
        color: "#722F37",
        unlitColor: "#230c0e",
        name: "Wine"
    },
    honey: {
        shadow: "0 0 10px rgba(240, 196, 0, 0.5)",
        color: "#F0C400",
        unlitColor: "#433304",
        name: "Honey"
    },
    azure: {
        shadow: "0 0 10px rgba(0, 127, 255, 0.5)",
        color: "#007FFF",
        unlitColor: "#00264b",
        name: "Azure"
    },
    blush: {
        shadow: "0 0 10px rgba(222, 93, 131, 0.5)",
        color: "#DE5D83",
        unlitColor: "#421626",
        name: "Blush"
    },
    jade: {
        shadow: "0 0 10px rgba(0, 168, 107, 0.5)",
        color: "#00A86B",
        unlitColor: "#024028",
        name: "Jade"
    },
    royal: {
        shadow: "0 0 10px rgba(65, 105, 225, 0.5)",
        color: "#4169E1",
        unlitColor: "#192650",
        name: "Royal"
    }
};

const ALWAYS_COLOR_KEYS = ["red", "blue", "lime", "yellow"];
const TOURNAMENT_COLOR_COUNT = 16;

const buildTournamentColorPool = () => {
    const entries = Object.entries(COLORS);

    const always = [];
    const others = [];

    for (const [key, val] of entries) {
        if (ALWAYS_COLOR_KEYS.includes(key)) {
            always.push([key, val]);
        } else {
            others.push([key, val]);
        }
    }

    const neededFromOthers = Math.max(
        0,
        TOURNAMENT_COLOR_COUNT - always.length
    );

    const selected = [];
    const pool = [...others];

    while (selected.length < neededFromOthers && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool[idx]);
        pool.splice(idx, 1);
    }

    return [...always, ...selected];
};

const getUniqueTeams = (entries = Object.entries(COLORS)) =>
    entries.map(([key, val], i) => ({
        id: i + 1,
        key,
        name: val.name,
        color: val.color,
        unlitColor: val.unlitColor,
        shadow: val.shadow
    }));

function makeColorSequence(baseColors, repeats = 12) {
    const base = baseColors;
    const out = [];
    let prev = null;

    for (let r = 0; r < repeats; r++) {
        const pool = [...base];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        if (prev && pool[0]?.color === prev) {
            pool.push(pool.shift());
        }

        pool.forEach((c) => out.push(c));
        prev = out[out.length - 1]?.color ?? prev;
    }

    return out;
}

const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const buildInitialBracket = (teams) => {
    const shuffled = shuffle(teams);
    const ro16 = [];
    for (let i = 0; i < 8; i++) {
        ro16.push({
            id: `ro16-${i + 1}`,
            slotA: shuffled[i * 2],
            slotB: shuffled[i * 2 + 1],
            played: false,
            score: null,
            setHistory: [],
        });
    }
    const qf = Array.from({ length: 4 }).map((_, i) => ({
        id: `qf-${i + 1}`,
        slotA: null,
        slotB: null,
        played: false,
        score: null,
        setHistory: [],
    }));
    const sf = Array.from({ length: 2 }).map((_, i) => ({
        id: `sf-${i + 1}`,
        slotA: null,
        slotB: null,
        played: false,
        score: null,
        setHistory: [],
    }));
    const gf = [{
        id: `gf-1`,
        slotA: null,
        slotB: null,
        played: false,
        score: null,
        setHistory: [],
    }];
    const thirdPlace = [
        {
            id: "3rd-1",
            slotA: null,
            slotB: null,
            played: false,
            score: null,
            scoreLeft: null,
            scoreRight: null,
            winnerTeamId: null,
            loserTeamId: null,
            pickTeamId: null,
            setHistory: [],
        },
    ];
    return { ro16, qf, sf, gf, thirdPlace };
};

const stageLabel = (stage) => {
    switch (stage) {
        case "ro16":
            return "Round of 16";
        case "qf":
            return "Quarterfinal";
        case "sf":
            return "Semi-final";
        case "gf":
            return "Grand Final";
        case "thirdPlace":
            return "Third Place Decider";
        default:
            return "";
    }
};

const getBestOfForStage = (stage) => {
    if (stage === "gf") return 9;
    if (stage === "sf") return 7;
    if (stage === "thirdPlace") return 7;
    if (stage === "qf") return 5;
    return 3;
};

const getStagePickemBase = (stage) => {
    switch (stage) {
        case "ro16":
            return 3;
        case "qf":
            return 5;
        case "sf":
            return 7;
        case "thirdPlace":
            return 7;
        case "gf":
            return 9;
        default:
            return 0;
    }
};

const defaultSeriesState = {
    active: false,
    stage: null,
    matchIndex: null,
    leftTeam: null,
    rightTeam: null,
    setsToWin: 2,
    playerWonSets: 0,
    playerLostSets: 0,
    lastMultiplier: null,
    lastResult: "",
    banner: "",
    roundWins: 0,
    roundLosses: 0,
    roundNumber: 1,
    miniWins: 0,
    miniLosses: 0,
    isOvertime: false,
    overtimeBlock: 0,
    otWins: 0,
    otLosses: 0
};

export default function SpecialModePage() {
    const navigate = useNavigate();
    const [showIntro, setShowIntro] = useState(true);
    const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

    const tournamentColorEntries = useMemo(
        () => buildTournamentColorPool(),
        []
    );

    const uniqueTeams = useMemo(
        () => getUniqueTeams(tournamentColorEntries),
        [tournamentColorEntries]
    );

    const colorSeq = useMemo(
        () => makeColorSequence(tournamentColorEntries.map(([, v]) => v)),
        [tournamentColorEntries]
    );

    const [bracket, setBracket] = useState(null);

    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
    const [activeMatchInfo, setActiveMatchInfo] = useState(null);
    const [modalLeftTeam, setModalLeftTeam] = useState(null);
    const [modalRightTeam, setModalRightTeam] = useState(null);
    const [hasChosen, setHasChosen] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const [showWinnersScreen, setShowWinnersScreen] = useState(false);
    const [tournamentResults, setTournamentResults] = useState(null);

    const [showWinnerText, setShowWinnerText] = useState(false);
    const [showWinnerTeam, setShowWinnerTeam] = useState(false);
    const [showPodium, setShowPodium] = useState(false);
    const [showProceed, setShowProceed] = useState(false);

    const [seriesState, setSeriesState] = useState(defaultSeriesState);

    const [showPickemSummary, setShowPickemSummary] = useState(false);
    const [finalPickemPoints, setFinalPickemPoints] = useState(0);
    const [neededPickemPoints, setNeededPickemPoints] = useState(neededPickemPointsAmount);

    const [pickemCounts, setPickemCounts] = useState({
        ro16: 0,
        qf: 0,
        sf: 0,
        tpd: 0,
        gf: 0,
    });

    const [showPickemLine2, setShowPickemLine2] = useState(false);
    const [showPickemResult, setShowPickemResult] = useState(false);
    const [pickemWin, setPickemWin] = useState(false);

    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.bracket) {
                    setBracket(parsed.bracket);
                    setShowIntro(parsed.showIntro ?? true);
                    setSeriesState(
                        parsed.seriesState
                            ? { ...defaultSeriesState, ...parsed.seriesState }
                            : defaultSeriesState
                    );
                    setShowWinnersScreen(parsed.showWinnersScreen ?? false)
                    setTournamentResults(parsed.tournamentResults ?? null)
                    setShowWinnerText(parsed.showWinnerText ?? false)
                    setShowWinnerTeam(parsed.showWinnerText ?? false)
                    setShowPodium(parsed.showWinnerText ?? false)
                    setShowProceed(parsed.showWinnerText ?? false)
                    setShowPickemSummary(parsed.showPickemSummary ?? false)
                    setFinalPickemPoints(parsed.finalPickemPoints ?? 0)
                    setPickemCounts(parsed.pickemCounts)
                    setShowPickemLine2(parsed.showPickemLine2 ?? false)
                    setShowPickemResult(parsed.showPickemResult ?? false)
                    setPickemWin(parsed.pickemWin ?? false)
                    setNeededPickemPoints(parsed.neededPickemPoints ?? false)
                    return;
                }
            } catch (err) {
                console.error("Failed to parse saved game state:", err);
            }
        }
        setBracket(buildInitialBracket(uniqueTeams));
    }, [uniqueTeams]);

    useEffect(() => {
        if (!bracket) return;
        const stateToSave = {
            bracket,
            showIntro,
            seriesState,
            showWinnersScreen,
            tournamentResults,
            showWinnerText,
            showWinnerTeam,
            showPodium,
            showProceed,
            showPickemSummary,
            finalPickemPoints,
            pickemCounts,
            showPickemLine2,
            showPickemResult,
            pickemWin,
            neededPickemPoints
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [bracket,
        showIntro,
        seriesState,
        showWinnersScreen,
        tournamentResults,
        showWinnerText,
        showWinnerTeam,
        showPodium,
        showProceed,
        showPickemSummary,
        finalPickemPoints,
        pickemCounts,
        showPickemLine2,
        showPickemResult,
        pickemWin,
        neededPickemPoints
    ]);

    const confirmRestart = () => {
        localStorage.removeItem(STORAGE_KEY);
        setIsRestartModalOpen(false);
        const fresh = buildInitialBracket(uniqueTeams);
        setBracket(fresh);
        setShowIntro(true);
        setSeriesState(defaultSeriesState);
        setShowWinnersScreen(false)
        setTournamentResults(null)
        setShowWinnerText(false)
        setShowWinnerTeam(false)
        setShowPodium(false)
        setShowProceed(false)
    };

    const confirmTerminate = () => {
        setIsTerminateModalOpen(false);
        navigate("/");
    };

    const resetSpecialModeState = () => {
        confirmRestart();
        setBracket(null);
        setSeriesState(defaultSeriesState);
        setTournamentResults(null);
        setShowWinnersScreen(false);
        setShowPickemSummary(false);
        setFinalPickemPoints(0);
        setPickemCounts({ ro16: 0, qf: 0, sf: 0, tpd: 0, gf: 0 });
    };

    const isButtonLocked = isCalculating || isRestartModalOpen || isTerminateModalOpen || showIntro || isLocked;

    const calculatePickemFromBracket = (bracket) => {
        if (!bracket) {
            return {
                total: 0,
                ro16: 0,
                qf: 0,
                sf: 0,
                tpd: 0,
                gf: 0,
            };
        }

        const stageConfig = {
            ro16: 3,
            qf: 5,
            sf: 7,
            tpd: 7,
            gf: 9,
        };

        let total = 0;
        let ro16 = 0;
        let qf = 0;
        let sf = 0;
        let tpd = 0;
        let gf = 0;

        const applyStage = (matches, stageKey) => {
            if (!matches) return;

            matches.forEach((m) => {
                if (!m || !m.played) return;
                if (!m.slotA || !m.slotB) return;

                const pickedId = m.pickTeamId;
                if (!pickedId) return;

                const pickedIsLeft = m.slotA && pickedId === m.slotA.id;
                const pickedIsRight = m.slotB && pickedId === m.slotB.id;
                if (!pickedIsLeft && !pickedIsRight) return;

                const pickedWon = m.winnerTeamId === pickedId;

                if (pickedWon) {
                    total += stageConfig[stageKey] || 0;

                    if (stageKey === "ro16") ro16++;
                    else if (stageKey === "qf") qf++;
                    else if (stageKey === "sf") sf++;
                    else if (stageKey === "tpd") tpd++;
                    else if (stageKey === "gf") gf++;
                } else {
                    let pickedSets = 0;
                    if (pickedIsLeft) pickedSets = m.scoreLeft ?? 0;
                    if (pickedIsRight) pickedSets = m.scoreRight ?? 0;
                    total += pickedSets;
                }
            });
        };

        applyStage(bracket.ro16, "ro16");
        applyStage(bracket.qf, "qf");
        applyStage(bracket.sf, "sf");

        if (bracket.thirdPlace) {
            const thirdMatches = Array.isArray(bracket.thirdPlace)
                ? bracket.thirdPlace
                : [bracket.thirdPlace];
            applyStage(thirdMatches, "tpd");
        }

        applyStage(bracket.gf, "gf");

        return {
            total,
            ro16,
            qf,
            sf,
            tpd,
            gf,
        };
    };

    const buildGuessedSentence = (counts) => {
        const parts = [];

        const joinParts = (nodes) => {
            if (nodes.length === 1) return nodes[0];

            if (nodes.length === 2) {
                return (
                    <>
                        {nodes[0]} and {nodes[1]}
                    </>
                );
            }

            return (
                <>
                    {nodes.slice(0, -1).map((node, idx) => (
                        <React.Fragment key={idx}>
                            {node}
                            {idx < nodes.length - 2 ? ", " : " "}
                        </React.Fragment>
                    ))}
                    and {nodes[nodes.length - 1]}
                </>
            );
        };

        if (counts.ro16 > 0) {
            const isPerfect = counts.ro16 === 8;
            const isAwful = counts.ro16 <= 2;
            parts.push(
                <>
                    <span
                        style={{
                            fontWeight: 800,
                            color: isPerfect ? "#2e7d32" : isAwful ? "red" : undefined,
                        }}
                    >
                        {counts.ro16}/8
                    </span>{" "}
                    Rounds of 16
                </>
            );
        }

        if (counts.qf > 0) {
            const isPerfect = counts.qf === 4;
            const isAwful = counts.qf <= 1;
            parts.push(
                <>
                    <span
                        style={{
                            fontWeight: 800,
                            color: isPerfect ? "#2e7d32" : isAwful ? "red" : undefined,
                        }}
                    >
                        {counts.qf}/4
                    </span>{" "}
                    Quarterfinals
                </>
            );
        }

        if (counts.sf > 0) {
            const isPerfect = counts.sf === 2;
            const isAwful = counts.sf <= 1;
            parts.push(
                <>
                    <span
                        style={{
                            fontWeight: 800,
                            color: isPerfect ? "#2e7d32" : isAwful ? "red" : undefined,
                        }}
                    >
                        {counts.sf}/2
                    </span>{" "}
                    Semi-finals
                </>
            );
        }

        if (counts.tpd > 0) {
            parts.push(
                <span
                    style={{
                        fontWeight: 800,
                        color: "#2e7d32",
                    }}
                >
                    the Third Place Decider
                </span>
            );
        }

        if (counts.gf > 0) {
            parts.push(
                <span
                    style={{
                        fontWeight: 800,
                        color: "#2e7d32",
                    }}
                >
                    the Grand Final
                </span>
            );
        }

        if (parts.length === 0) {
            return <>YOU guessed no matches correctly 🥺</>;
        }

        return <>YOU guessed {joinParts(parts)}</>;
    };

    const appendSetToMatchHistory = (stage, matchIndex, finalWins, finalLosses, playerWonSet) => {
        setBracket((prev) => {
            if (!prev) return prev;

            const copy = { ...prev };
            const stageArr = [...copy[stage]];
            const match = { ...stageArr[matchIndex] };

            const history = match.setHistory || [];
            const nextSetNumber = history.length + 1;

            match.setHistory = [
                ...history,
                {
                    set: nextSetNumber,
                    wins: finalWins,
                    losses: finalLosses,
                    won: playerWonSet,
                },
            ];

            stageArr[matchIndex] = match;
            copy[stage] = stageArr;
            return copy;
        });
    };

    const canOpenMatch = (stage, match) => {
        if (!bracket) return false;
        if (!match.slotA || !match.slotB) return false;

        if (stage === "qf" && bracket.ro16.some((m) => !m.played)) {
            return false;
        }
        if (stage === "sf" && bracket.qf.some((m) => !m.played)) {
            return false;
        }

        if (stage === "thirdPlace") {
            if (!bracket.sf || bracket.sf.some((m) => !m.played)) {
                return false;
            }
        }

        if (stage === "gf") {
            if (bracket.sf.some((m) => !m.played)) {
                return false;
            }
            const third = bracket.thirdPlace && bracket.thirdPlace[0];
            if (third && !third.played) {
                return false;
            }
        }

        const index = parseInt(match.id.split("-")[1], 10) - 1;
        const stageMatches = bracket[stage];

        for (let i = 0; i < index; i++) {
            if (!stageMatches[i].played) return false;
        }

        if (match.played) {
            return false;
        }

        return true;
    };

    const currentPlayableMatch = useMemo(() => {
        if (!bracket) return null;

        for (const stage of STAGE_ORDER) {
            const stageMatches = bracket[stage];
            if (!stageMatches) continue;

            for (let i = 0; i < stageMatches.length; i++) {
                const match = stageMatches[i];
                if (canOpenMatch(stage, match)) {
                    return { stage, index: i };
                }
            }
        }

        return null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bracket]);

    const nextMatch = useMemo(() => {
        if (!bracket || !currentPlayableMatch) return null;

        const { stage, index } = currentPlayableMatch;
        const stageMatches = bracket[stage];
        if (!stageMatches) return null;

        for (let i = index + 1; i < stageMatches.length; i++) {
            const m = stageMatches[i];
            if (m.slotA && m.slotB) {
                return { stage, index: i };
            }
        }

        return null;
    }, [bracket, currentPlayableMatch]);

    const handleMatchClick = (stage, index) => {
        if (!bracket) return;
        const match = bracket[stage][index];

        if (!match.slotA || !match.slotB) return;

        const playable = canOpenMatch(stage, match);

        if (!match.played && !playable) return;

        setModalLeftTeam(match.slotA);
        setModalRightTeam(match.slotB);
        setHasChosen(false);
        setActiveMatchInfo({
            stage,
            index,
            playable,
            played: !!match.played,
        });
        setIsMatchModalOpen(true);
    };

    const closeMatchModal = () => {
        setIsMatchModalOpen(false);
        setActiveMatchInfo(null);
        setModalLeftTeam(null);
        setModalRightTeam(null);
        setHasChosen(false);
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
        if (!hasChosen || !activeMatchInfo || !modalLeftTeam || !modalRightTeam) return;
        if (!bracket) return;

        const { stage, index } = activeMatchInfo;

        setBracket((prev) => {
            if (!prev) return prev;
            const copy = {
                ro16: [...prev.ro16],
                qf: [...prev.qf],
                sf: [...prev.sf],
                gf: [...prev.gf],
                thirdPlace: [...prev.thirdPlace],
            };
            const stageArr = copy[stage];
            const match = { ...stageArr[index] };

            match.slotA = modalLeftTeam;
            match.slotB = modalRightTeam;
            match.pickTeamId = modalLeftTeam.id;
            match.setHistory = [];

            stageArr[index] = match;
            copy[stage] = stageArr;
            return copy;
        });

        const bestOf = getBestOfForStage(stage);
        const setsRequired = (bestOf + 1) / 2;

        setSeriesState({
            ...defaultSeriesState,
            active: true,
            stage,
            matchIndex: index,
            leftTeam: modalLeftTeam,
            rightTeam: modalRightTeam,
            setsToWin: setsRequired
        });

        closeMatchModal();
    };

    const renderTeamLabel = (team) => {
        if (!team) return null;
        return (
            <span style={{ color: team.color || "#ffffff", fontWeight: 800 }}>
                Team {team.name}
            </span>
        );
    };

    const handleSeriesGamble = () => {
        if (!seriesState.active || seriesState.banner) return;

        const raw =
            MULTIPLIER_MIN +
            Math.random() * (MULTIPLIER_MAX - MULTIPLIER_MIN);
        const mult = Number(raw.toFixed(2));

        setIsCalculating(true);

        setTimeout(() => {
            let userPickWon = false;

            setSeriesState((prev) => {
                if (!prev.active || prev.banner) return prev;

                const playerWonMini = mult > 0;
                const playerLostMini = mult < 0;

                let resultText;
                if (mult > 0) {
                    resultText = `Team ${prev.leftTeam.name} wins the mini-round!`;
                } else if (mult < 0) {
                    resultText = `Team ${prev.rightTeam.name} wins the mini-round!`;
                } else {
                    resultText = "No one wins this mini-round.";
                }

                let {
                    playerWonSets,
                    playerLostSets,
                    roundWins,
                    roundLosses,
                    roundNumber,
                    miniWins,
                    miniLosses,
                    isOvertime,
                    overtimeBlock,
                    otWins,
                    otLosses,
                    setsToWin,
                } = prev;

                let banner = prev.banner;

                if (isOvertime) {
                    let nextMiniWins = miniWins;
                    let nextMiniLosses = miniLosses;

                    if (playerWonMini) nextMiniWins += 1;
                    else if (playerLostMini) nextMiniLosses += 1;

                    if (nextMiniWins < 5 && nextMiniLosses < 5) {
                        setIsCalculating(false);
                        return {
                            ...prev,
                            lastMultiplier: mult,
                            lastResult: resultText,
                            miniWins: nextMiniWins,
                            miniLosses: nextMiniLosses,
                        };
                    }

                    const wonOtRound = nextMiniWins >= 5;

                    const updatedOtWins = otWins + (wonOtRound ? 1 : 0);
                    const updatedOtLosses = otLosses + (wonOtRound ? 0 : 1);

                    const updatedRoundWins = roundWins + (wonOtRound ? 1 : 0);
                    const updatedRoundLosses = roundLosses + (wonOtRound ? 0 : 1);

                    const otTiedBlock =
                        updatedOtWins === 3 && updatedOtLosses === 3;

                    miniWins = 0;
                    miniLosses = 0;
                    roundNumber = roundNumber + 1;
                    otWins = updatedOtWins;
                    otLosses = updatedOtLosses;
                    roundWins = updatedRoundWins;
                    roundLosses = updatedRoundLosses;

                    const otRoundWinner = wonOtRound ? prev.leftTeam : prev.rightTeam;

                    toast(
                        <span>
                            {renderTeamLabel(otRoundWinner)} has won this OT round!
                        </span>,
                        {
                            icon: "😜",
                            duration: 2000,
                        }
                    );

                    const otDecided =
                        updatedOtWins === OT_ROUNDS_TO_WIN ||
                        updatedOtLosses === OT_ROUNDS_TO_WIN;

                    if (otDecided) {
                        const playerWonSet =
                            updatedOtWins > updatedOtLosses;

                        appendSetToMatchHistory(
                            prev.stage,
                            prev.matchIndex,
                            updatedRoundWins,
                            updatedRoundLosses,
                            playerWonSet
                        );

                        playerWonSets += playerWonSet ? 1 : 0;
                        playerLostSets += playerWonSet ? 0 : 1;

                        const seriesOver =
                            playerWonSets >= setsToWin ||
                            playerLostSets >= setsToWin;

                        if (seriesOver) {
                            const winner =
                                playerWonSets > playerLostSets
                                    ? prev.leftTeam
                                    : prev.rightTeam;

                            toast(
                                <span>
                                    {setsToWin === 1 ? "This match has" : "These series have"} been WON in
                                    Overtime{" "}
                                    {overtimeBlock <= 1 ? "" : ` #${overtimeBlock}`} by{" "}
                                    {renderTeamLabel(winner)}!
                                </span>,
                                {
                                    icon: "🎉",
                                    duration: 4000,
                                }
                            );

                            if (winner && winner.id === prev.leftTeam.id) {
                                userPickWon = true;
                            }
                            
                            if (userPickWon) {
                                toast("Your pick has won!!!", {
                                    icon: "🤯",
                                    duration: 4000,
                                });
                            }

                            banner = `Team ${winner.name} has won this series!`;
                        } else {
                            const otSetWinner = playerWonSet ? prev.leftTeam : prev.rightTeam;

                            toast(
                                <span>
                                    The set {playerWonSets + playerLostSets} has been won in Overtime
                                    {overtimeBlock <= 1 ? "" : ` #${overtimeBlock}`} by{" "}
                                    {renderTeamLabel(otSetWinner)}!
                                </span>,
                                {
                                    icon: "🤯",
                                    duration: 4000,
                                }
                            );

                            setIsLocked(true);
                            setTimeout(() => {
                                setSeriesState((curr) => {
                                    if (!curr.active) return curr;
                                    if (curr.banner) return curr;
                                    setIsLocked(false);
                                    return {
                                        ...curr,
                                        roundWins: 0,
                                        roundLosses: 0,
                                        roundNumber: 1,
                                        miniWins: 0,
                                        miniLosses: 0,
                                        isOvertime: false,
                                        overtimeBlock: 0,
                                        otWins: 0,
                                        otLosses: 0,
                                    };
                                });
                            }, 4000);
                        }
                    } else if (otTiedBlock) {
                        const msg =
                            overtimeBlock === 1
                                ? "Overtime is tied 3-3! Starting new overtime block..."
                                : overtimeBlock === 2
                                    ? "Another overtime block tied 3-3! Starting new overtime block..."
                                    : overtimeBlock === 3
                                        ? "That's a tough battle we got here! Yet another overtime block tied 3-3! Starting new overtime block..."
                                        : "A tie again! Impressing! Starting new overtime block...";

                        toast(msg, { icon: "🔄", duration: 4000 });

                        setIsLocked(true);
                        setTimeout(() => {
                            setSeriesState((curr) => {
                                if (!curr.active || curr.banner) return curr;
                                setIsLocked(false);
                                return {
                                    ...curr,
                                    isOvertime: true,
                                    overtimeBlock: curr.overtimeBlock + 1,
                                    roundNumber: 1,
                                    otWins: 0,
                                    otLosses: 0,
                                    miniWins: 0,
                                    miniLosses: 0,
                                };
                            });
                        }, 4000);
                    }

                    setIsCalculating(false);

                    return {
                        ...prev,
                        lastMultiplier: mult,
                        lastResult: resultText,
                        playerWonSets,
                        playerLostSets,
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
                    };
                }

                let nextMiniWins = miniWins;
                let nextMiniLosses = miniLosses;

                if (playerWonMini) nextMiniWins += 1;
                else if (playerLostMini) nextMiniLosses += 1;

                if (nextMiniWins < 5 && nextMiniLosses < 5) {
                    setIsCalculating(false);
                    return {
                        ...prev,
                        lastMultiplier: mult,
                        lastResult: resultText,
                        miniWins: nextMiniWins,
                        miniLosses: nextMiniLosses,
                    };
                }

                const playerWonRound = nextMiniWins >= 5;
                roundWins += playerWonRound ? 1 : 0;
                roundLosses += playerWonRound ? 0 : 1;
                roundNumber += 1;
                miniWins = 0;
                miniLosses = 0;

                const roundWinner = playerWonRound ? prev.leftTeam : prev.rightTeam;

                toast(
                    <span>
                        {renderTeamLabel(roundWinner)} has won this round!
                    </span>,
                    {
                        icon: "😜",
                        duration: 2000,
                    }
                );

                const setShouldEnd =
                    roundWins >= BASE_ROUNDS_TO_WIN ||
                    roundLosses >= BASE_ROUNDS_TO_WIN ||
                    roundWins + roundLosses >= BASE_MAX_ROUNDS;

                if (roundWins === 12 && roundLosses === 12) {
                    toast(
                        `Overtime coming in for this ${setsToWin === 1 ? "match" : "set"
                        }! 🔥`,
                        { icon: "⚔️", duration: 4000 }
                    );

                    setIsLocked(true);
                    setTimeout(() => {
                        setSeriesState((curr) => {
                            if (!curr.active || curr.banner) return curr;
                            setIsLocked(false);
                            return {
                                ...curr,
                                isOvertime: true,
                                overtimeBlock: curr.overtimeBlock
                                    ? curr.overtimeBlock + 1
                                    : 1,
                                otWins: 0,
                                otLosses: 0,
                                roundNumber: 1,
                                miniWins: 0,
                                miniLosses: 0,
                            };
                        });
                    }, 4000);

                    setIsCalculating(false);

                    return {
                        ...prev,
                        lastMultiplier: mult,
                        lastResult: resultText,
                        playerWonSets,
                        playerLostSets,
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
                    };
                }

                if (setShouldEnd) {
                    const playerWonSet = roundWins > roundLosses;

                    appendSetToMatchHistory(
                        prev.stage,
                        prev.matchIndex,
                        roundWins,
                        roundLosses,
                        playerWonSet
                    );

                    playerWonSets += playerWonSet ? 1 : 0;
                    playerLostSets += playerWonSet ? 0 : 1;

                    const seriesOver =
                        playerWonSets >= setsToWin ||
                        playerLostSets >= setsToWin;

                    if (seriesOver) {
                        const winner =
                            playerWonSets > playerLostSets
                                ? prev.leftTeam
                                : prev.rightTeam;

                        toast(
                            <span>
                                {setsToWin === 1 ? "This match has" : "These series have"} been WON by{" "}
                                {renderTeamLabel(winner)}!
                            </span>,
                            {
                                icon: "🎉",
                                duration: 4000,
                            }
                        );

                        if (winner && winner.id === prev.leftTeam.id) {
                            userPickWon = true;
                        }

                        if (userPickWon) {
                            toast("Your pick has won!!!", {
                                icon: "🤯",
                                duration: 4000,
                            });
                        }

                        banner = `Team ${winner.name} has won this series!`;
                    } else {
                        const setWinner = playerWonSet ? prev.leftTeam : prev.rightTeam;

                        toast(
                            <span>
                                The set {playerWonSets + playerLostSets} has been won by{" "}
                                {renderTeamLabel(setWinner)}!
                            </span>,
                            {
                                icon: "🤯",
                                duration: 4000,
                            }
                        );

                        setIsLocked(true);
                        setTimeout(() => {
                            setSeriesState((curr) => {
                                if (!curr.active || curr.banner) return curr;
                                setIsLocked(false);
                                return {
                                    ...curr,
                                    roundWins: 0,
                                    roundLosses: 0,
                                    roundNumber: 1,
                                    miniWins: 0,
                                    miniLosses: 0,
                                    isOvertime: false,
                                    overtimeBlock: 0,
                                    otWins: 0,
                                    otLosses: 0,
                                };
                            });
                        }, 4000);
                    }
                }

                setIsCalculating(false);

                return {
                    ...prev,
                    lastMultiplier: mult,
                    lastResult: resultText,
                    playerWonSets,
                    playerLostSets,
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
                };
            });
        }, 50);
    };

    const handleProceed = () => {
        if (!bracket) return;

        const summary = calculatePickemFromBracket(bracket);

        setFinalPickemPoints(summary.total);
        setPickemCounts({
            ro16: summary.ro16,
            qf: summary.qf,
            sf: summary.sf,
            tpd: summary.tpd,
            gf: summary.gf,
        });

        const didWin = summary.total >= neededPickemPoints;
        setPickemWin(didWin);

        setShowWinnersScreen(false);
        setShowPickemSummary(true);
    };

    const handleBackToSpecialStart = () => {
        resetSpecialModeState();
    };

    const handleBackToGambling = () => {
        resetSpecialModeState();
        navigate("/gambling");
    };

    const handleBackToHome = () => {
        resetSpecialModeState();
        navigate("/");
    };

    useEffect(() => {
        if (!seriesState.banner || !bracket) return;

        const {
            stage,
            matchIndex,
            leftTeam,
            rightTeam,
            playerWonSets,
            playerLostSets,
        } = seriesState;

        if (!stage || matchIndex == null || !leftTeam || !rightTeam) return;

        const winner =
            playerWonSets > playerLostSets ? leftTeam : rightTeam;
        const loser = winner === leftTeam ? rightTeam : leftTeam;
        const scoreString = `${playerWonSets}:${playerLostSets}`;
        const isGrandFinal = stage === "gf";

        let gfResults = null;

        if (isGrandFinal && winner && loser) {
            let thirdPlaceWinner = null;
            let fourthPlace = null;

            const thirdMatch =
                bracket.thirdPlace && bracket.thirdPlace[0]
                    ? bracket.thirdPlace[0]
                    : null;

            if (
                thirdMatch &&
                thirdMatch.played &&
                thirdMatch.slotA &&
                thirdMatch.slotB &&
                thirdMatch.winnerTeamId
            ) {
                const tpWinner =
                    thirdMatch.winnerTeamId === thirdMatch.slotA.id
                        ? thirdMatch.slotA
                        : thirdMatch.slotB;
                const tpLoser =
                    tpWinner === thirdMatch.slotA
                        ? thirdMatch.slotB
                        : thirdMatch.slotA;

                thirdPlaceWinner = tpWinner;
                fourthPlace = tpLoser;
            } else {
                const semiLosers = bracket.sf
                    .filter(
                        (m) =>
                            m.played &&
                            m.slotA &&
                            m.slotB &&
                            m.winnerTeamId
                    )
                    .map((m) =>
                        m.winnerTeamId === m.slotA.id ? m.slotB : m.slotA
                    );

                if (semiLosers.length === 2) {
                    thirdPlaceWinner = semiLosers[0];
                    fourthPlace = semiLosers[1];
                }
            }

            gfResults = {
                winner,
                runnerUp: loser,
                thirdPlace: thirdPlaceWinner,
                fourthPlace,
            };
        }

        const timeout = setTimeout(() => {
            setBracket((prev) => {
                if (!prev) return prev;

                const b = {
                    ro16: [...prev.ro16],
                    qf: [...prev.qf],
                    sf: [...prev.sf],
                    gf: [...prev.gf],
                    thirdPlace: [...prev.thirdPlace],
                };

                const stageArr = b[stage];
                if (!stageArr || !stageArr[matchIndex]) return prev;

                const match = { ...stageArr[matchIndex] };

                match.played = true;
                match.score = scoreString;
                match.scoreLeft = playerWonSets;
                match.scoreRight = playerLostSets;
                match.winnerTeamId = winner.id;
                match.loserTeamId = loser.id;

                stageArr[matchIndex] = match;
                b[stage] = stageArr;

                const assignNext = (targetStage, targetIdx, slotKey, team) => {
                    const arr = [...b[targetStage]];
                    const tMatch = { ...arr[targetIdx] };
                    tMatch[slotKey] = team;
                    arr[targetIdx] = tMatch;
                    b[targetStage] = arr;
                };

                if (stage === "ro16") {
                    const pairIndex = Math.floor(matchIndex / 2);
                    const isFirstInPair = matchIndex % 2 === 0;
                    const slotKey = isFirstInPair ? "slotA" : "slotB";
                    assignNext("qf", pairIndex, slotKey, winner);
                } else if (stage === "qf") {
                    const pairIndex = Math.floor(matchIndex / 2);
                    const slotKey = matchIndex % 2 === 0 ? "slotA" : "slotB";
                    assignNext("sf", pairIndex, slotKey, winner);
                } else if (stage === "sf") {
                    const slotKey = matchIndex === 0 ? "slotA" : "slotB";
                    assignNext("gf", 0, slotKey, winner);

                    const loserForThird = loser;

                    if (b.thirdPlace && b.thirdPlace[0]) {
                        const third = { ...b.thirdPlace[0] };

                        if (matchIndex === 0) {
                            third.slotA = loserForThird;
                        } else {
                            third.slotB = loserForThird;
                        }

                        b.thirdPlace = [third];
                    }
                }

                return b;
            });

            setSeriesState(defaultSeriesState);

            if (gfResults) {
                setTournamentResults(gfResults);
                setShowWinnersScreen(true);
            }
        }, 4000);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seriesState.banner, bracket]);

    const isSeriesActive = seriesState.active;

    const {
        setsToWin,
        playerWonSets,
        playerLostSets,
        roundWins,
        roundLosses,
        miniWins,
        miniLosses,
        isOvertime,
        overtimeBlock,
        roundNumber,
        banner: seriesBanner,
    } = seriesState;

    const baseMaxRounds = BASE_MAX_ROUNDS;
    const otMaxRounds = OT_MAX_ROUNDS;
    const overtimeTarget = BASE_ROUNDS_TO_WIN + overtimeBlock * 3;

    const seriesLabel = seriesState.stage ? (
        <span>
            {stageLabel(seriesState.stage)} {seriesState.stage !== "gf" && seriesState.stage !== "thirdPlace" && `#${seriesState.matchIndex + 1}`} <br />
            <span style={{ color: seriesState.leftTeam?.color }}>
                Team {seriesState.leftTeam?.name}
            </span>{" "}
            VS{" "}
            <span style={{ color: seriesState.rightTeam?.color }}>
                Team {seriesState.rightTeam?.name}
            </span>
        </span>
    ) : (
        ""
    );

    let loserOpacity = null;
    if (seriesBanner) {
        if (playerWonSets > playerLostSets) {
            loserOpacity = "loss";
        } else if (playerLostSets > playerWonSets) {
            loserOpacity = "win";
        }
    }

    const threshold = overtimeTarget - 1;

    const isSetPointWins = roundWins === threshold && roundLosses < threshold;
    const isSetPointLosses = roundLosses === threshold && roundWins < threshold;

    const isSeriesPointWins =
        isSetPointWins && playerWonSets === setsToWin - 1;
    const isSeriesPointLosses =
        isSetPointLosses && playerLostSets === setsToWin - 1;
    
    const getMultiplierClass = (mult) => {
        if (mult == null) return "";
        if (mult > 0) return seriesState.leftTeam.color;
        if (mult < 0) return seriesState.rightTeam.color;
        return '#757575';
    };

    const currentMatch =
        isMatchModalOpen && activeMatchInfo && bracket
            ? bracket[activeMatchInfo.stage][activeMatchInfo.index]
            : null;

    const isPlayed = !!currentMatch?.played;

    const didUserWin =
        isPlayed && currentMatch?.winnerTeamId === currentMatch?.slotA?.id;
    
    useEffect(() => {
        if (!showWinnersScreen || !tournamentResults) return;

        setShowWinnerText(true);

        const t1 = setTimeout(() => setShowWinnerTeam(true), 1000);
        const t2 = setTimeout(() => setShowPodium(true), 2000);
        const t3 = setTimeout(() => setShowProceed(true), 3000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [showWinnersScreen, tournamentResults]);

    useEffect(() => {
        if (!showPickemSummary) return;

        setShowPickemLine2(false);
        setShowPickemResult(false);

        const t1 = setTimeout(() => setShowPickemLine2(true), 1500);
        const t2 = setTimeout(() => setShowPickemResult(true), 3000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [showPickemSummary]);

    let wonPickemPoints = null;

    if (isPlayed && currentMatch && currentMatch.scoreLeft != null && currentMatch.scoreRight != null) {
        const pickedSets = currentMatch.scoreLeft;
        const pickedWon = currentMatch.winnerTeamId === currentMatch.slotA?.id;

        const base = getStagePickemBase(activeMatchInfo.stage);

        if (pickedWon) {
            wonPickemPoints = base;
        } else {
            wonPickemPoints = pickedSets;
        }
    }

    let pickemLabelText = "";
    let pickemLabelStyle = {};

    if (wonPickemPoints !== null) {
        if (wonPickemPoints === 0) {
            pickemLabelText = "+0 Pick'em points";
            pickemLabelStyle = { color: "red" };
        } else if (wonPickemPoints === 1) {
            pickemLabelText = "+1 Pick'em point";
            pickemLabelStyle = { color: "#2e7d32" };
        } else {
            pickemLabelText = `+${wonPickemPoints} Pick'em points`;
            pickemLabelStyle = { color: "#2e7d32" };
        }
    }

    if (showPickemSummary) {
        return (
            <div className={css.page_wrapper}>
                <div className={css.game_container}>
                    <p className={css.info_text} style={{ marginBottom: "24px", fontSize: '40px', fontWeight: '700', textAlign: 'center', width: '680px' }}>
                        {buildGuessedSentence(pickemCounts)}
                    </p>

                    {showPickemLine2 && (
                        <p
                            className={css.info_text}
                            style={{ marginBottom: "24px", fontSize: '32px', fontWeight: 'bold', textAlign: 'center' }}
                        >
                            That's why, you received{" "} <br/>
                            <span
                                style={{
                                    backgroundColor:
                                        finalPickemPoints >= neededPickemPoints
                                            ? "#2e7d32"
                                            : "red",
                                    fontWeight: 700,
                                    color:
                                        finalPickemPoints >= neededPickemPoints
                                            ? "#fff"
                                            : "#fff",
                                    margin: '8px auto'
                                }}
                                className={css.points}
                            >
                                <CountUp
                                    start={0}
                                    duration={1.2}
                                    end={finalPickemPoints}
                                    key={finalPickemPoints}
                                />
                            </span> <span style={{ fontWeight: '800' }}>Pick&apos;em points</span>, when needed:{" "}
                            <span style={{ margin: '8px auto' }} className={css.points}>
                                <CountUp
                                    start={0}
                                    duration={1.2}
                                    end={neededPickemPoints}
                                    key={neededPickemPoints}
                                />
                            </span>
                        </p>
                    )}

                    {showPickemResult && (
                        <>
                            <p
                                className={css.info_text}
                                style={{ marginBottom: "8px", fontSize: '32px', fontWeight: 'bold', textAlign: 'center'  }}
                            >
                                and because of that,
                            </p>

                            <h1
                                className={css.game_title}
                                style={{
                                    color: pickemWin ? "#00ff7f" : "#ff4c4c",
                                    textShadow: pickemWin
                                        ? "0 0 5px rgba(0,255,127,0.8)"
                                        : "0 0 5px rgba(255,76,76,0.8)",
                                }}
                            >
                                {pickemWin ? "You Won! 🎉" : "You Lost! 😢"}
                            </h1>

                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "16px",
                                    justifyContent: "center",
                                    marginTop: "32px",
                                }}
                            >
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
                                <button
                                    className={css.gamble_button}
                                    onClick={handleBackToHome}
                                >
                                    To Home Page
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <Header
                setIsRestartModalOpen={() => setIsRestartModalOpen(true)}
                setIsTerminateModalOpen={() => setIsTerminateModalOpen(true)}
                isButtonLocked={isButtonLocked}
            />

            <div className={css.page_container}>
                {showIntro && (
                    <>
                        <div className={css.header_row}>
                            <h2 className={css.title}>
                                Are you intuitive enough to guess which team
                                could win?
                            </h2>
                            <button
                                aria-label="Special mode info"
                                className={css.info_button}
                                onClick={() =>
                                    navigate("/special-mode-info")
                                }
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

                        <footer className={css.footer_row}>
                            <button
                                className={css.gamble_button}
                                onClick={() => setShowIntro(false)}
                            >
                                Start Game
                            </button>
                            <Link
                                className={`${css.gamble_button} ${css.back_button}`}
                                to="/gambling"
                            >
                                Back to Normal Gambling
                            </Link>
                        </footer>
                    </>
                )}

                {!showIntro && bracket && !isSeriesActive && !showWinnersScreen && (
                    <div className={css.bracket_container}>
                        <div className={css.bracket_inner}>
                            <div className={css.column_container}>
                                <h4 className={css.column_title}>
                                    Rounds of 16
                                </h4>
                                <div className={css.columnRo16}>
                                    {bracket.ro16.map((m, idx) => {
                                        const isPlayed = !!m.played;
                                        const isUserWin =
                                            isPlayed &&
                                            m.pickTeamId &&
                                            m.winnerTeamId &&
                                            m.pickTeamId === m.winnerTeamId;

                                        const baseClass =
                                            idx % 2 === 0 ? css.match_rect_down : css.match_rect;

                                        const resultClass = isPlayed
                                            ? isUserWin
                                                ? css.match_win
                                                : css.match_loss
                                            : "";

                                        const isCurrent =
                                            currentPlayableMatch &&
                                            currentPlayableMatch.stage === "ro16" &&
                                            currentPlayableMatch.index === idx;

                                        const isNext =
                                            nextMatch &&
                                            nextMatch.stage === "ro16" &&
                                            nextMatch.index === idx;
                                        
                                        const isLeftLoser = isPlayed && m.loserTeamId === m.slotA?.id;
                                        const isRightLoser = isPlayed && m.loserTeamId === m.slotB?.id;

                                        const winnerIsLeft =
                                            isPlayed && m.winnerTeamId && m.slotA && m.slotA.id === m.winnerTeamId;
                                        const winnerIsRight =
                                            isPlayed && m.winnerTeamId && m.slotB && m.slotB.id === m.winnerTeamId;
                                        
                                        const canPlay = canOpenMatch("ro16", m);
                                        const isClickable = !isButtonLocked && (canPlay || m.played);

                                        return (
                                            <div
                                                key={m.id}
                                                className={`${baseClass} ${resultClass} ${isCurrent ? css.match_current : ""} ${isNext ? css.match_next : ""}`}
                                                style={{
                                                    pointerEvents:
                                                        !isClickable || isButtonLocked
                                                            ? "none"
                                                            : "auto",
                                                }}
                                                onClick={() => handleMatchClick("ro16", idx)}
                                            >
                                                <div
                                                    className={
                                                        css.match_content
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            css.team_cell
                                                        }
                                                        style={{ opacity: isLeftLoser ? 0.3 : 1 }}
                                                    >
                                                        {m.slotA ? (
                                                            <div
                                                                className={
                                                                    css.team_circle
                                                                }
                                                                style={{
                                                                    background:
                                                                        m
                                                                            .slotA
                                                                            .color
                                                                }}
                                                                title={
                                                                    m.slotA
                                                                        .name
                                                                }
                                                            />
                                                        ) : (
                                                            <div
                                                                className={
                                                                    css.placeholder_circle
                                                                }
                                                            >
                                                                ?
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div
                                                        className={
                                                            css.vs_cell
                                                        }
                                                    >
                                                        {!isPlayed || m.scoreLeft == null || m.scoreRight == null ? (
                                                            <span className={css.vs_text}>VS</span>
                                                        ) : (
                                                            <span className={css.score_text}>
                                                                <span
                                                                    style={{
                                                                        color: winnerIsLeft ? "#2e7d32" : "red",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {m.scoreLeft}
                                                                </span>
                                                                <span> : </span>
                                                                <span
                                                                    style={{
                                                                        color: winnerIsRight ? "#2e7d32" : "red",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {m.scoreRight}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div
                                                        className={
                                                            css.team_cell
                                                        }
                                                        style={{ opacity: isRightLoser ? 0.3 : 1 }}
                                                    >
                                                        {m.slotB ? (
                                                            <div
                                                                className={
                                                                    css.team_circle
                                                                }
                                                                style={{
                                                                    background:
                                                                        m
                                                                            .slotB
                                                                            .color
                                                                }}
                                                                title={
                                                                    m.slotB
                                                                        .name
                                                                }
                                                            />
                                                        ) : (
                                                            <div
                                                                className={
                                                                    css.placeholder_circle
                                                                }
                                                            >
                                                                ?
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={css.column_container}>
                                <h4 className={css.column_title}>
                                    Quarterfinals
                                </h4>
                                <div className={css.columnQuarters}>
                                    {bracket.qf.map((m, idx) => {
                                        const isPlayed = !!m.played;
                                        const isUserWin =
                                            isPlayed &&
                                            m.pickTeamId &&
                                            m.winnerTeamId &&
                                            m.pickTeamId ===
                                            m.winnerTeamId;

                                        const baseClass =
                                            idx % 2 === 0
                                                ? css.quarters_rect_down
                                                : css.quarters_rect;

                                        const resultClass = isPlayed
                                            ? isUserWin
                                                ? css.match_win
                                                : css.match_loss
                                            : "";
                                        
                                        const isCurrent =
                                            currentPlayableMatch &&
                                            currentPlayableMatch.stage === "qf" &&
                                            currentPlayableMatch.index === idx;

                                        const isNext =
                                            nextMatch &&
                                            nextMatch.stage === "qf" &&
                                            nextMatch.index === idx;
                                        
                                        const isLeftLoser = isPlayed && m.loserTeamId === m.slotA?.id;
                                        const isRightLoser = isPlayed && m.loserTeamId === m.slotB?.id;

                                        const winnerIsLeft =
                                            isPlayed && m.winnerTeamId && m.slotA && m.slotA.id === m.winnerTeamId;
                                        const winnerIsRight =
                                            isPlayed && m.winnerTeamId && m.slotB && m.slotB.id === m.winnerTeamId;
                                        
                                        const canPlay = canOpenMatch("qf", m);
                                        const isClickable = !isButtonLocked && (canPlay || m.played);

                                        return (
                                            <div
                                                key={m.id}
                                                className={`${baseClass} ${resultClass} ${isCurrent ? css.match_current : ""} ${isNext ? css.match_next : ""}`}
                                                style={{
                                                    pointerEvents:
                                                        !isClickable || isButtonLocked
                                                            ? "none"
                                                            : "auto",
                                                }}
                                                onClick={() => handleMatchClick("qf", idx)}
                                            >
                                                <div
                                                    className={
                                                        css.match_content
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            css.team_cell
                                                        }
                                                        style={{ opacity: isLeftLoser ? 0.3 : 1 }}
                                                    >
                                                        {m.slotA ? (
                                                            <div
                                                                className={
                                                                    css.team_circle
                                                                }
                                                                style={{
                                                                    background:
                                                                        m
                                                                            .slotA
                                                                            .color
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className={
                                                                    css.placeholder_circle
                                                                }
                                                            >
                                                                ?
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={
                                                            css.vs_cell
                                                        }
                                                    >
                                                        {!isPlayed || m.scoreLeft == null || m.scoreRight == null ? (
                                                            <span className={css.vs_text}>VS</span>
                                                        ) : (
                                                            <span className={css.score_text}>
                                                                <span
                                                                    style={{
                                                                        color: winnerIsLeft ? "#2e7d32" : "red",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {m.scoreLeft}
                                                                </span>
                                                                <span> : </span>
                                                                <span
                                                                    style={{
                                                                        color: winnerIsRight ? "#2e7d32" : "red",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {m.scoreRight}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={
                                                            css.team_cell
                                                        }
                                                        style={{ opacity: isRightLoser ? 0.3 : 1 }}
                                                    >
                                                        {m.slotB ? (
                                                            <div
                                                                className={
                                                                    css.team_circle
                                                                }
                                                                style={{
                                                                    background:
                                                                        m
                                                                            .slotB
                                                                            .color
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className={
                                                                    css.placeholder_circle
                                                                }
                                                            >
                                                                ?
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={css.column_container}>
                                <h4 className={css.column_title}>
                                    Semi-finals
                                </h4>
                                <div className={css.columnSemis}>
                                    {bracket.sf.map((m, idx) => {
                                        const isPlayed = !!m.played;
                                        const isUserWin =
                                            isPlayed &&
                                            m.pickTeamId &&
                                            m.winnerTeamId &&
                                            m.pickTeamId ===
                                            m.winnerTeamId;

                                        const baseClass =
                                            idx % 2 === 0
                                                ? css.semis_rect_down
                                                : css.semis_rect;

                                        const resultClass = isPlayed
                                            ? isUserWin
                                                ? css.match_win
                                                : css.match_loss
                                            : "";
                                        
                                        const isCurrent =
                                            currentPlayableMatch &&
                                            currentPlayableMatch.stage === "sf" &&
                                            currentPlayableMatch.index === idx;

                                        const isNext =
                                            nextMatch &&
                                            nextMatch.stage === "sf" &&
                                            nextMatch.index === idx;
                                        
                                        const isLeftLoser = isPlayed && m.loserTeamId === m.slotA?.id;
                                        const isRightLoser = isPlayed && m.loserTeamId === m.slotB?.id;

                                        const winnerIsLeft =
                                            isPlayed && m.winnerTeamId && m.slotA && m.slotA.id === m.winnerTeamId;
                                        const winnerIsRight =
                                            isPlayed && m.winnerTeamId && m.slotB && m.slotB.id === m.winnerTeamId;
                                        
                                        const canPlay = canOpenMatch("sf", m);
                                        const isClickable = !isButtonLocked && (canPlay || m.played);

                                        return (
                                            <div
                                                key={m.id}
                                                className={`${baseClass} ${resultClass} ${isCurrent ? css.match_current : ""} ${isNext ? css.match_next : ""}`}
                                                style={{
                                                    pointerEvents:
                                                        !isClickable || isButtonLocked
                                                            ? "none"
                                                            : "auto",
                                                }}
                                                onClick={() => handleMatchClick("sf", idx)}
                                            >
                                                <div
                                                    className={
                                                        css.match_content
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            css.team_cell
                                                        }
                                                        style={{ opacity: isLeftLoser ? 0.3 : 1 }}
                                                    >
                                                        {m.slotA ? (
                                                            <div
                                                                className={
                                                                    css.team_circle
                                                                }
                                                                style={{
                                                                    background:
                                                                        m
                                                                            .slotA
                                                                            .color
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className={
                                                                    css.placeholder_circle
                                                                }
                                                            >
                                                                ?
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={
                                                            css.vs_cell
                                                        }
                                                    >
                                                        {!isPlayed || m.scoreLeft == null || m.scoreRight == null ? (
                                                            <span className={css.vs_text}>VS</span>
                                                        ) : (
                                                            <span className={css.score_text}>
                                                                <span
                                                                    style={{
                                                                        color: winnerIsLeft ? "#2e7d32" : "red",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {m.scoreLeft}
                                                                </span>
                                                                <span> : </span>
                                                                <span
                                                                    style={{
                                                                        color: winnerIsRight ? "#2e7d32" : "red",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {m.scoreRight}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={
                                                            css.team_cell
                                                        }
                                                        style={{ opacity: isRightLoser ? 0.3 : 1 }}
                                                    >
                                                        {m.slotB ? (
                                                            <div
                                                                className={
                                                                    css.team_circle
                                                                }
                                                                style={{
                                                                    background:
                                                                        m
                                                                            .slotB
                                                                            .color
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className={
                                                                    css.placeholder_circle
                                                                }
                                                            >
                                                                ?
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={css.column_container}>
                                <h4 className={css.column_title}>
                                    Grand Final
                                </h4>
                                <div className={css.columnGrandFinal}>
                                    {bracket.gf.map((m, idx) => {
                                        const isPlayed = !!m.played;
                                        const isUserWin =
                                            isPlayed &&
                                            m.pickTeamId &&
                                            m.winnerTeamId &&
                                            m.pickTeamId ===
                                            m.winnerTeamId;

                                        const resultClass = isPlayed
                                            ? isUserWin
                                                ? css.match_win
                                                : css.match_loss
                                            : "";
                                        
                                        const isCurrent =
                                            currentPlayableMatch &&
                                            currentPlayableMatch.stage === "gf" &&
                                            currentPlayableMatch.index === idx;

                                        const isNext =
                                            nextMatch &&
                                            nextMatch.stage === "gf" &&
                                            nextMatch.index === idx;
                                        
                                        const isLeftLoser = isPlayed && m.loserTeamId === m.slotA?.id;
                                        const isRightLoser = isPlayed && m.loserTeamId === m.slotB?.id;

                                        const winnerIsLeft =
                                            isPlayed && m.winnerTeamId && m.slotA && m.slotA.id === m.winnerTeamId;
                                        const winnerIsRight =
                                            isPlayed && m.winnerTeamId && m.slotB && m.slotB.id === m.winnerTeamId;
                                        
                                        const canPlay = canOpenMatch("gf", m);
                                        const isClickable = !isButtonLocked && (canPlay || m.played);

                                        return (
                                            <div
                                                key={m.id}
                                                className={`${css.grandFinal_rect} ${resultClass} ${isCurrent ? css.match_current : ""} ${isNext ? css.match_next : ""}`}
                                                style={{
                                                    pointerEvents:
                                                        !isClickable || isButtonLocked
                                                            ? "none"
                                                            : "auto",
                                                }}
                                                onClick={() => handleMatchClick("gf", idx)}
                                            >
                                                <div
                                                    className={
                                                        css.match_content
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            css.team_cell
                                                        }
                                                        style={{ opacity: isLeftLoser ? 0.3 : 1 }}
                                                    >
                                                        {m.slotA ? (
                                                            <div
                                                                className={
                                                                    css.team_circle
                                                                }
                                                                style={{
                                                                    background:
                                                                        m
                                                                            .slotA
                                                                            .color
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className={
                                                                    css.placeholder_circle
                                                                }
                                                            >
                                                                ?
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={
                                                            css.vs_cell
                                                        }
                                                    >
                                                        {!isPlayed || m.scoreLeft == null || m.scoreRight == null ? (
                                                            <span className={css.vs_text}>VS</span>
                                                        ) : (
                                                            <span className={css.score_text}>
                                                                <span
                                                                    style={{
                                                                        color: winnerIsLeft ? "#2e7d32" : "red",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {m.scoreLeft}
                                                                </span>
                                                                <span> : </span>
                                                                <span
                                                                    style={{
                                                                        color: winnerIsRight ? "#2e7d32" : "red",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {m.scoreRight}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={
                                                            css.team_cell
                                                        }
                                                        style={{ opacity: isRightLoser ? 0.3 : 1 }}
                                                    >
                                                        {m.slotB ? (
                                                            <div
                                                                className={
                                                                    css.team_circle
                                                                }
                                                                style={{
                                                                    background:
                                                                        m
                                                                            .slotB
                                                                            .color
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className={
                                                                    css.placeholder_circle
                                                                }
                                                            >
                                                                ?
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {bracket.thirdPlace && (
                                <div className={css.thirdPlace_container}>
                                    <h4 style={{ width: '300px' }} className={css.column_title}>Third Place Decider (BO7)</h4>
                                    <div className={css.columnThirdPlace}>
                                        {bracket.thirdPlace.map((m, idx) => {
                                            const isPlayed = !!m.played;
                                            const isUserWin =
                                                isPlayed &&
                                                m.pickTeamId &&
                                                m.winnerTeamId &&
                                                m.pickTeamId === m.winnerTeamId;

                                            const resultClass = isPlayed
                                                ? isUserWin
                                                    ? css.match_win
                                                    : css.match_loss
                                                : "";
                                            
                                            const isCurrent =
                                                currentPlayableMatch &&
                                                currentPlayableMatch.stage === "thirdPlace" &&
                                                currentPlayableMatch.index === idx;

                                            const isNext =
                                                nextMatch &&
                                                nextMatch.stage === "thirdPlace" &&
                                                nextMatch.index === idx;
                                        
                                            const isLeftLoser = isPlayed && m.loserTeamId === m.slotA?.id;
                                            const isRightLoser = isPlayed && m.loserTeamId === m.slotB?.id;

                                            const winnerIsLeft =
                                                isPlayed && m.winnerTeamId && m.slotA && m.slotA.id === m.winnerTeamId;
                                            const winnerIsRight =
                                                isPlayed && m.winnerTeamId && m.slotB && m.slotB.id === m.winnerTeamId;
                                        
                                            const canPlay = canOpenMatch("thirdPlace", m);
                                            const isClickable = !isButtonLocked && (canPlay || m.played);

                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`${css.thirdPlace_rect} ${resultClass} ${isCurrent ? css.match_current : ""} ${isNext ? css.match_next : ""}`}
                                                    style={{
                                                        pointerEvents:
                                                            !isClickable || isButtonLocked
                                                                ? "none"
                                                                : "auto",
                                                    }}
                                                    onClick={() => handleMatchClick("thirdPlace", idx)}
                                                >
                                                    <div
                                                        className={
                                                            css.match_content
                                                        }
                                                        style={{ gap: '12px' }}
                                                    >
                                                        <div
                                                            className={
                                                                css.team_cell
                                                            }
                                                            style={{ opacity: isLeftLoser ? 0.3 : 1 }}
                                                        >
                                                            {m.slotA ? (
                                                                <div
                                                                    className={
                                                                        css.team_circle
                                                                    }
                                                                    style={{
                                                                        background:
                                                                            m
                                                                                .slotA
                                                                                .color
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={
                                                                        css.placeholder_circle
                                                                    }
                                                                >
                                                                    ?
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div
                                                            className={
                                                                css.vs_cell
                                                            }
                                                        >
                                                            {!isPlayed || m.scoreLeft == null || m.scoreRight == null ? (
                                                                <span className={css.vs_text}>VS</span>
                                                            ) : (
                                                                <span className={css.score_text}>
                                                                    <span
                                                                        style={{
                                                                            color: winnerIsLeft ? "#2e7d32" : "red",
                                                                            fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        {m.scoreLeft}
                                                                    </span>
                                                                    <span> : </span>
                                                                    <span
                                                                        style={{
                                                                            color: winnerIsRight ? "#2e7d32" : "red",
                                                                            fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        {m.scoreRight}
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div
                                                            className={
                                                                css.team_cell
                                                            }
                                                            style={{ opacity: isRightLoser ? 0.3 : 1 }}
                                                        >
                                                            {m.slotB ? (
                                                                <div
                                                                    className={
                                                                        css.team_circle
                                                                    }
                                                                    style={{
                                                                        background:
                                                                            m
                                                                                .slotB
                                                                                .color
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={
                                                                        css.placeholder_circle
                                                                    }
                                                                >
                                                                    ?
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!showIntro &&
                    bracket &&
                    isSeriesActive &&
                    seriesState.leftTeam &&
                    seriesState.rightTeam && (
                        <div className={css.series_container}>
                            <motion.h2
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className={css.series_stage_title}
                            >
                                {seriesLabel}
                            </motion.h2>
                            <div className={css.scoreboard}>
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
                                                textShadow: seriesState.leftTeam?.shadow,
                                                marginBottom: "4px",
                                            }}
                                        >
                                            {setsToWin === 1 ? "MATCH" : "SERIES"} POINT!
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
                                                    textShadow: seriesState.leftTeam?.shadow,
                                                    marginBottom: "4px",
                                                }}
                                            >
                                                Set point!
                                            </motion.span>
                                        )
                                    )}

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "row-reverse",
                                            alignItems: "center",
                                            gap: "20px",
                                            opacity: loserOpacity === "win" ? 0.4 : 1,
                                        }}
                                    >
                                        <div className={css.miniSquares} style={{ flexDirection: "row-reverse" }}>
                                            {!seriesBanner &&
                                                [...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.square}
                                                        style={{ backgroundColor: i < miniWins ? seriesState.leftTeam?.color : seriesState.leftTeam?.unlitColor }}
                                                    />
                                                ))}
                                        </div>

                                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                                            <span className={css.round_text}>
                                                <CountUp
                                                    key={roundWins}
                                                    start={Math.max(roundWins - 1, 0)}
                                                    end={roundWins}
                                                    duration={1}
                                                    style={{
                                                        color: seriesState.leftTeam?.color,
                                                        fontSize: "40px",
                                                        transition: "all 2000ms ease-in-out",
                                                        textShadow:
                                                            roundWins === overtimeTarget
                                                                ? seriesState.leftTeam?.shadow
                                                                : "none",
                                                    }}
                                                />
                                            </span>
                                        </div>

                                        <div className={`${css.lines} ${css.winRow}`}>
                                            {setsToWin === 5 ? (
                                                <>
                                                    {[...Array(5)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            style={{ height: "12px", backgroundColor: playerWonSets >= i + 1 ? seriesState.leftTeam?.color : seriesState.leftTeam?.unlitColor, boxShadow: playerWonSets >= i + 1 ? seriesState.leftTeam?.shadow : '' }}
                                                            className={css.line}
                                                        />
                                                    ))}
                                                </>
                                            ) : setsToWin === 4 ? (
                                                <>
                                                    {[...Array(4)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            style={{ height: "14px", backgroundColor: playerWonSets >= i + 1 ? seriesState.leftTeam?.color : seriesState.leftTeam?.unlitColor, boxShadow: playerWonSets >= i + 1 ? seriesState.leftTeam?.shadow : '' }}
                                                            className={css.line}
                                                        />
                                                    ))}
                                                </>
                                            ) : setsToWin === 3 ? (
                                                <>
                                                    {[...Array(3)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            style={{ height: "16px", backgroundColor: playerWonSets >= i + 1 ? seriesState.leftTeam?.color : seriesState.leftTeam?.unlitColor, boxShadow: playerWonSets >= i + 1 ? seriesState.leftTeam?.shadow : '' }}
                                                            className={css.line}
                                                        />
                                                    ))}
                                                </>
                                            ) : setsToWin === 2 ? (
                                                <>
                                                    {[...Array(2)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            style={{ backgroundColor: playerWonSets >= i + 1 ? seriesState.leftTeam?.color : seriesState.leftTeam?.unlitColor, boxShadow: playerWonSets >= i + 1 ? seriesState.leftTeam?.shadow : '' }}
                                                            className={css.line}
                                                        />
                                                    ))}
                                                </>
                                            ) : (
                                                <div
                                                    style={{ backgroundColor: playerWonSets >= 1 ? seriesState.leftTeam?.color : seriesState.leftTeam?.unlitColor, boxShadow: playerWonSets >= 1 ? seriesState.leftTeam?.shadow : '' }}
                                                    className={css.line}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {seriesBanner ? (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className={css.round_text}
                                    >
                                        {seriesBanner}
                                    </motion.span>
                                ) : (
                                    <div className={css.game_info_text}>
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className={css.round_text}
                                            style={{ fontSize: "24px" }}
                                        >
                                            Best-of-{setsToWin * 2 - 1}
                                        </motion.span>
                                        {setsToWin !== 1 && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.4 }}
                                                className={css.round_text}
                                                style={{ fontSize: "24px" }}
                                            >
                                                {(() => {
                                                    const currentSet =
                                                        playerWonSets + playerLostSets + 1;
                                                    const totalSets = setsToWin * 2 - 1;
                                                    const isDecider = currentSet === totalSets;
                                                    return isDecider
                                                        ? "Decider"
                                                        : `Set ${currentSet}`;
                                                })()}
                                            </motion.span>
                                        )}

                                        {isOvertime && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.4 }}
                                                className={css.round_text}
                                                style={{ textAlign: "center", fontSize: "20px" }}
                                            >
                                                Overtime
                                                {overtimeBlock === 0 || overtimeBlock === 1
                                                    ? ""
                                                    : ` #${overtimeBlock}`}
                                                !
                                                <br />
                                            </motion.span>
                                        )}

                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className={css.round_text}
                                        >
                                            {isOvertime ? (
                                                <>
                                                    Round{" "}
                                                    <CountUp
                                                        key={roundNumber}
                                                        start={Math.max(roundNumber - 1, 0)}
                                                        end={roundNumber}
                                                        duration={1}
                                                    />
                                                    /{otMaxRounds}
                                                </>
                                            ) : (
                                                <>
                                                    Round{" "}
                                                    <CountUp
                                                        key={roundWins + roundLosses + 1}
                                                        start={Math.max(
                                                            roundWins + roundLosses,
                                                            0
                                                        )}
                                                        end={roundWins + roundLosses + 1}
                                                        duration={1}
                                                    />
                                                    /{baseMaxRounds}
                                                </>
                                            )}
                                        </motion.span>

                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className={css.round_text}
                                            style={{ textAlign: "center", fontSize: "16px" }}
                                        >
                                            First to {overtimeTarget}
                                        </motion.span>
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
                                                textShadow: seriesState.rightTeam?.shadow,
                                                marginBottom: "4px",
                                            }}
                                        >
                                            {setsToWin === 1 ? "MATCH" : "SERIES"} POINT!
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
                                                    textShadow: seriesState.rightTeam?.shadow,
                                                    marginBottom: "4px",
                                                }}
                                            >
                                                Set point!
                                            </motion.span>
                                        )
                                    )}

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "20px",
                                            opacity: loserOpacity === "loss" ? 0.4 : 1,
                                        }}
                                    >
                                        <div className={css.miniSquares}>
                                            {!seriesBanner &&
                                                [...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={css.square}
                                                        style={{ boxShadow: "none", backgroundColor: i < miniLosses ? seriesState.rightTeam?.color : seriesState.rightTeam?.unlitColor }}
                                                    />
                                                ))}
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "baseline",
                                                gap: "8px",
                                            }}
                                        >
                                            <span className={css.round_text}>
                                                <CountUp
                                                    key={roundLosses}
                                                    start={Math.max(roundLosses - 1, 0)}
                                                    end={roundLosses}
                                                    duration={1}
                                                    style={{
                                                        color: seriesState.rightTeam?.color,
                                                        fontSize: "40px",
                                                        transition: "all 2000ms ease-in-out",
                                                        textShadow:
                                                            roundLosses === overtimeTarget
                                                                ? seriesState.rightTeam?.shadow
                                                                : "none",
                                                    }}
                                                />
                                            </span>
                                        </div>

                                        <div className={css.lines}>
                                            {setsToWin === 5 ? (
                                                <>
                                                    {[...Array(5)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            style={{ height: "12px", backgroundColor: playerLostSets >= i + 1 ? seriesState.rightTeam?.color : seriesState.rightTeam?.unlitColor, boxShadow: playerLostSets >= i + 1 ? seriesState.rightTeam?.shadow : '' }}
                                                            className={css.line}
                                                        />
                                                    ))}
                                                </>
                                            ) : setsToWin === 4 ? (
                                                <>
                                                    {[...Array(4)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            style={{ height: "14px", backgroundColor: playerLostSets >= i + 1 ? seriesState.rightTeam?.color : seriesState.rightTeam?.unlitColor, boxShadow: playerLostSets >= i + 1 ? seriesState.rightTeam?.shadow : '' }}
                                                            className={css.line}
                                                        />
                                                    ))}
                                                </>
                                            ) : setsToWin === 3 ? (
                                                <>
                                                    {[...Array(3)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            style={{ height: "16px", backgroundColor: playerLostSets >= i + 1 ? seriesState.rightTeam?.color : seriesState.rightTeam?.unlitColor, boxShadow: playerLostSets >= i + 1 ? seriesState.rightTeam?.shadow : '' }}
                                                            className={css.line}
                                                        />
                                                    ))}
                                                </>
                                            ) : setsToWin === 2 ? (
                                                <>
                                                    {[...Array(2)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            style={{ backgroundColor: playerLostSets >= i + 1 ? seriesState.rightTeam?.color : seriesState.rightTeam?.unlitColor, boxShadow: playerLostSets >= i + 1 ? seriesState.rightTeam?.shadow : '' }}
                                                            className={css.line}
                                                        />
                                                    ))}
                                                </>
                                            ) : (
                                                <div
                                                    style={{ backgroundColor: playerLostSets >= 1 ? seriesState.rightTeam?.color : seriesState.rightTeam?.unlitColor, boxShadow: playerLostSets >= 1 ? seriesState.rightTeam?.shadow : '' }}
                                                    className={`${css.line} ${playerLostSets >= 1
                                                        ? css.lineLoss
                                                        : css.lineDarkLoss
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {seriesState.lastResult && (
                                <div className={css.seriesGambleMessage}>
                                    <p className={css.seriesResultMessage}>
                                        {seriesState.lastResult}
                                    </p>

                                    {seriesState.lastMultiplier !== null && (
                                        <span
                                            className={css.seriesMultiplier}
                                            style={{ color: getMultiplierClass(seriesState.lastMultiplier), transition: 'none' }}
                                        >
                                            {seriesState.lastMultiplier.toFixed(2)}x
                                        </span>
                                    )}
                                </div>
                            )}
                            {!seriesBanner && (
                                <div className={css.series_gamble_wrapper}>
                                    <button
                                        className={`${css.gamble_button} ${isButtonLocked ? css.locked : ""}`}
                                        onClick={handleSeriesGamble}
                                        disabled={isButtonLocked}
                                    >
                                        Gamble
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
            </div>

            {isMatchModalOpen && activeMatchInfo && currentMatch && (
                <div
                    className={css.match_modal_overlay}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeMatchModal();
                        }
                    }}
                >
                    <div
                        className={`
                ${css.match_modal}
            `}
                    >
                        <div
                            className={isPlayed
                                ? didUserWin
                                    ? css.match_win
                                    : css.match_loss
                                : ""
                            }
                            style={{ paddingTop: '12px', paddingBottom: '12px', borderTopRightRadius: '12px', borderTopLeftRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <div className={css.match_modal_header}>
                                <h3
                                    style={{
                                        color: isPlayed
                                            ? didUserWin
                                                ? '#fff'
                                                : '#fff'
                                            : "",
                                        margin: '0'
                                    }}
                                    className={css.match_modal_title}>
                                    {stageLabel(activeMatchInfo.stage)}
                                    {activeMatchInfo.stage === "gf" || activeMatchInfo.stage === "thirdPlace"
                                        ? ""
                                        : ` #${activeMatchInfo.index + 1}`}
                                </h3>

                                {isPlayed && pickemLabelText && (
                                    <span
                                        className={css.match_modal_pickem}
                                        style={pickemLabelStyle}
                                    >
                                        {pickemLabelText}
                                    </span>
                                )}
                            </div>
                        </div>

                        <hr className={css.match_modal_divider} style={{ marginTop: '0' }} />

                        {!isPlayed && (
                            <>
                                <p className={css.match_modal_prompt}>
                                    Which team you'd pick?
                                </p>

                                <div className={css.match_modal_row}>
                                    <button
                                        type="button"
                                        className={`${css.modal_team_btn} ${hasChosen ? css.modal_team_selected : ""
                                            }`}
                                        onClick={handleChooseLeft}
                                    >
                                        <div
                                            className={css.modal_team_circle}
                                            style={{ background: modalLeftTeam?.color }}
                                        />
                                        <span className={css.modal_team_label}>
                                            Team {modalLeftTeam?.name}
                                        </span>
                                    </button>

                                    <div className={css.modal_vs}>VS</div>

                                    <button
                                        type="button"
                                        className={css.modal_team_btn}
                                        onClick={handleChooseRight}
                                    >
                                        <div
                                            className={css.modal_team_circle}
                                            style={{ background: modalRightTeam?.color }}
                                        />
                                        <span className={css.modal_team_label}>
                                            Team {modalRightTeam?.name}
                                        </span>
                                    </button>
                                </div>

                                <hr className={css.match_modal_divider} />
                                <div className={css.match_modal_footer}>
                                    <button
                                        className={`${css.gamble_button} ${!hasChosen ? css.locked : ""
                                            }`}
                                        disabled={!hasChosen}
                                        onClick={handleStartMatch}
                                    >
                                        Start Match
                                    </button>
                                </div>
                            </>
                        )}

                        {isPlayed && (
                            <>
                                <div
                                    className={`
                ${css.finishedMatchReview} 
            `}>
                                    <div className={css.match_modal_row}>
                                        <div
                                            className={css.modal_team_btn}
                                            style={{
                                                opacity:
                                                    currentMatch.loserTeamId ===
                                                        currentMatch.slotA?.id
                                                        ? 0.2
                                                        : 1,
                                                pointerEvents: 'none'
                                            }}
                                        >
                                            <div
                                                className={css.modal_team_circle}
                                                style={{
                                                    backgroundColor:
                                                        currentMatch.slotA.color,
                                                }}
                                            />
                                            <span className={css.modal_team_label}>Team {currentMatch.slotA.name} <br />
                                                <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>(Your pick)</span>
                                            </span>
                                        </div>

                                        <div className={css.modal_vs}>
                                            <span
                                                style={{
                                                    color:
                                                        currentMatch.winnerTeamId ===
                                                            currentMatch.slotA?.id
                                                            ? "#2e7d32"
                                                            : "red"
                                                }}
                                            >
                                                {currentMatch.scoreLeft}
                                            </span>
                                            <span> : </span>
                                            <span
                                                style={{
                                                    color:
                                                        currentMatch.winnerTeamId ===
                                                            currentMatch.slotB?.id
                                                            ? "#2e7d32"
                                                            : "red"
                                                }}
                                            >
                                                {currentMatch.scoreRight}
                                            </span>
                                        </div>

                                        <div
                                            className={css.modal_team_btn}
                                            style={{
                                                opacity:
                                                    currentMatch.loserTeamId ===
                                                        currentMatch.slotB?.id
                                                        ? 0.2
                                                        : 1,
                                                pointerEvents: 'none'
                                            }}
                                        >
                                            <div
                                                className={css.modal_team_circle}
                                                style={{
                                                    backgroundColor:
                                                        currentMatch.slotB.color,
                                                }}
                                            />
                                            <span className={css.modal_team_label}>Team {currentMatch.slotB.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <hr className={css.match_modal_divider} />

                                {currentMatch.setHistory && currentMatch.setHistory.length > 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className={css.seriesSummary}
                                    >
                                        <ul className={css.seriesSummaryList}>
                                            {currentMatch.setHistory.map(({ set, wins, losses, won }) => {
                                                const bestOf = (() => {
                                                    if (activeMatchInfo.stage === "gf") return 9;
                                                    if (activeMatchInfo.stage === "sf") return 7;
                                                    if (activeMatchInfo.stage === "thirdPlace") return 7;
                                                    if (activeMatchInfo.stage === "qf") return 5;
                                                    return 3;
                                                })();
                                                const isDecider = set === bestOf;
                                                const label = isDecider ? "Decider" : `Set ${set}`;

                                                const leftColor = currentMatch.slotA?.color || "#2e7d32";
                                                const rightColor = currentMatch.slotB?.color || "red";

                                                const leftOpacity = won ? 1 : 0.2;
                                                const rightOpacity = won ? 0.2 : 1;

                                                return (
                                                    <li key={set} style={{ fontSize: "20px" }}>
                                                        <span
                                                            className={css.multiplier_win}
                                                            style={{
                                                                color: leftColor,
                                                                fontWeight: "700",
                                                                opacity: leftOpacity
                                                            }}
                                                        >
                                                            {wins}
                                                        </span>

                                                        &nbsp;&nbsp;&nbsp;&nbsp;

                                                        <span
                                                            style={{ fontWeight: "600" }}
                                                            className={css.info_text}
                                                        >
                                                            {label}
                                                        </span>

                                                        &nbsp;&nbsp;&nbsp;&nbsp;

                                                        <span
                                                            className={css.multiplier_fail}
                                                            style={{
                                                                color: rightColor,
                                                                fontWeight: "700",
                                                                opacity: rightOpacity
                                                            }}
                                                        >
                                                            {losses}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </motion.div>
                                ) : (
                                    <p className={css.info_text}>No set history stored for this match.</p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {showWinnersScreen && tournamentResults && (
                <div className={css.winnerScreen}>
                    {showWinnerText && (
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className={css.winnerHeadline}
                        >
                            And the winner of this tournament is
                        </motion.h2>
                    )}

                    {showWinnerTeam && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className={css.winnerMain}
                        >
                            <div
                                className={css.winnerLogo}
                                style={{
                                    backgroundColor: tournamentResults.winner.color,
                                    boxShadow: tournamentResults.winner.shadow,
                                }}
                            />
                            <div className={css.winnerName}>
                                🥇Team {tournamentResults.winner.name}
                            </div>
                        </motion.div>
                    )}

                    {showPodium && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            className={css.podium}
                        >
                            <div style={{ marginBottom: '24px' }} className={css.podiumRow}>
                                <span style={{ fontSize: '22px' }} className={css.placeLabel}>RunnerUp</span>
                                <div style={{ flexDirection: 'column' }} className={css.placeTeam}>
                                    <div
                                        className={css.placeLogo}
                                        style={{
                                            backgroundColor: tournamentResults.runnerUp.color,
                                            boxShadow: tournamentResults.runnerUp.shadow,
                                            width: '80px',
                                            height: '80px'
                                        }}
                                    />
                                    <span className={css.runnerUpName}>
                                        🥈Team {tournamentResults.runnerUp.name}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                {tournamentResults.thirdPlace && (
                                    <div style={{ flexDirection: 'column', marginBottom: '48px' }} className={css.podiumRow}>
                                        <span style={{ fontSize: '18px' }} className={css.placeLabel}>3rd place</span>
                                        <div
                                            className={css.placeLogo}
                                            style={{ background: tournamentResults.thirdPlace.color }}
                                        />
                                        <span className={css.podium_name}>
                                            🥉Team {tournamentResults.thirdPlace.name}
                                        </span>
                                    </div>
                                )}

                                {tournamentResults.fourthPlace && (
                                    <div className={css.podiumRow}>
                                        <span className={css.placeLabel}>4th place</span>
                                        <div
                                            className={css.placeLogoSmall}
                                            style={{ background: tournamentResults.fourthPlace.color }}
                                        />
                                        <span className={css.podium_name}>
                                            🏅Team {tournamentResults.fourthPlace.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {showProceed && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className={css.gamble_button}
                            onClick={handleProceed}
                        >
                            Proceed
                        </motion.button>
                    )}
                </div>
            )}

            {isRestartModalOpen && (
                <div className={css.restart_modal}>
                    <p className={css.restart_text}>
                        Are you sure you want to restart the game?
                    </p>
                    <div className={css.restart_buttons}>
                        <button
                            className={css.cancel_button}
                            onClick={() => setIsRestartModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className={css.confirm_button}
                            onClick={confirmRestart}
                        >
                            Restart
                        </button>
                    </div>
                </div>
            )}

            {isTerminateModalOpen && (
                <div className={css.restart_modal}>
                    <p className={css.restart_text}>
                        Are you sure you want to terminate the game?
                    </p>
                    <div className={css.restart_buttons}>
                        <button
                            className={css.cancel_button}
                            onClick={() => setIsTerminateModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className={css.confirm_button}
                            onClick={confirmTerminate}
                        >
                            Terminate
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}