import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FaCaretLeft, FaCaretRight, FaCrown, FaFire } from "react-icons/fa";
import { FaCheck, FaXmark } from "react-icons/fa6";
import css from "./Pgx.module.css";
import pem from "./PemHud.module.css";
import base from "../../SpecialModePage.module.css";
import { isCheatTargeting } from "../../logic/secretCheats.js";
import { PemCircle, PemTrophy } from "./PemParts.jsx";
import { Fit } from "./PbsHud.jsx";
import {
    STINGER_MIN_MS,
    buildPemSetChips,
    getPemHalfIndex,
    getPemPenaltyWindow,
    isFreshPemSeries,
    isPemExtendedRoundNow,
    otPreviewRound,
    otPreviewState,
    pemOvertimeName,
    pemSetLabel,
    pemTextOn,
    useOtMorphPreview,
} from "./pemHud.js";

const REGULATION_ROUNDS = 24;
const OT_ROUNDS = 6;
const STREAK_MIN = 5;
const BAR_W = 782;
const BAR_H = 80;
const TAB_W = 236;
const TAB_H = 42;
const MORPH_MS = 480;
const INTRO_MS = 3400;
const EASE = [0.22, 1, 0.36, 1];
const SWEEP = [0.7, 0, 0.3, 1];
const OT_TAB = "#f39a1e";
const EMBERS = Array.from({ length: 14 }, (_, i) => ({
    x: `${6 + ((i * 37) % 88)}%`,
    dx: `${((i * 29) % 34) - 17}px`,
    size: `${3 + (i % 3)}px`,
    delay: `${700 + ((i * 263) % 2400)}ms`,
    dur: `${1900 + ((i * 151) % 1300)}ms`,
}));
const HEAT_COLS = Array.from({ length: 32 }, (_, i) => ({
    h: Math.pow(1 - i / 32, 0.75) * (0.7 + ((i * 47) % 31) / 100),
    dur: `${1000 + ((i * 131) % 700)}ms`,
    delay: `${-((i * 173) % 1400)}ms`,
    bx: `${i * 10}px`,
}));
const HEAT_COLORS = ["#5c0812", "#8f0d1b", "#c81024", "#ee1d2a", "#ff4520", "#ff7a1c", "#ffac2e", "#ffd84a", "#fff3b0"];
const HEAT_LEVELS = 6;

const HEAT_CELL = 5;
const HEAT_GRID = 12;
const HEAT_SIZE = HEAT_CELL * HEAT_GRID;
const heatTiles = new Map();

const heatTile = (level) => {
    if (heatTiles.has(level)) return heatTiles.get(level);
    const canvas = (size) => Object.assign(document.createElement("canvas"), { width: size, height: size });
    const cells = canvas(HEAT_SIZE);
    const cellCtx = cells.getContext("2d");
    for (let y = 0; y < HEAT_GRID; y++) {
        for (let x = 0; x < HEAT_GRID; x++) {
            const r = (((Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) * 43758.5453) % 1) + 1) % 1;
            cellCtx.fillStyle = HEAT_COLORS[Math.min(HEAT_COLORS.length - 1, Math.floor(Math.pow(r, 1.5 - level * 0.16) * (6 + level)))];
            cellCtx.fillRect(x * HEAT_CELL, y * HEAT_CELL, HEAT_CELL, HEAT_CELL);
        }
    }
    const tiled = canvas(HEAT_SIZE * 3);
    const tiledCtx = tiled.getContext("2d");
    for (let i = 0; i < 9; i++) tiledCtx.drawImage(cells, (i % 3) * HEAT_SIZE, Math.floor(i / 3) * HEAT_SIZE);
    const blurred = canvas(HEAT_SIZE * 3);
    const blurredCtx = blurred.getContext("2d");
    blurredCtx.filter = "blur(1.6px)";
    blurredCtx.drawImage(tiled, 0, 0);
    const out = canvas(HEAT_SIZE);
    out.getContext("2d").drawImage(blurred, HEAT_SIZE, HEAT_SIZE, HEAT_SIZE, HEAT_SIZE, 0, 0, HEAT_SIZE, HEAT_SIZE);
    const url = `url("${out.toDataURL()}")`;
    heatTiles.set(level, url);
    return url;
};

const heatStyle = (value) => {
    const level = Math.min(HEAT_LEVELS - 1, Math.max(0, value - STREAK_MIN));
    return {
        "--heat": 0.9 + level * 0.1,
        "--heat-glow": 0.4 + level * 0.12,
        "--spd": 1 - level * 0.05,
        "--heat-tile": heatTile(level),
    };
};

const roundTotal = (s) => REGULATION_ROUNDS + (s.isOvertime ? Math.max(1, s.overtimeBlock ?? 1) * OT_ROUNDS : 0);

const Pen = ({ result, next }) => (
    <span className={`${css.pen} ${result === "success" ? css.pen_goal : result === "fail" ? css.pen_miss : ""} ${next ? css.pen_next : ""}`}>
        <AnimatePresence initial={false}>
            {result ? (
                <motion.span
                    key={result}
                    className={css.pen_mark}
                    initial={{ scale: 0, rotate: -120, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.45, delay: 0.1, ease: [0.3, 1.5, 0.5, 1] }}
                >
                    {result === "success" ? <FaCheck aria-hidden="true" /> : <FaXmark aria-hidden="true" />}
                </motion.span>
            ) : null}
        </AnimatePresence>
    </span>
);

const Pills = ({ kind, side, team, total, lit = 0, results = [], nextIndex = null, opacity = 1 }) => {
    if (kind === "pens") {
        return (
            <span className={`${css.pills} ${css.pills_pens} ${side === "right" ? css.pills_right : ""}`} style={{ opacity }}>
                {getPemPenaltyWindow(results, total).map(({ index, result }) => (
                    <Pen key={index} result={result} next={index === nextIndex} />
                ))}
            </span>
        );
    }
    return (
        <span className={`${css.pills} ${side === "right" ? css.pills_right : ""} ${total > 5 ? css.pills_many : ""}`} style={{ opacity }}>
            {Array.from({ length: total }, (_, i) => (
                <span
                    key={i}
                    className={`${css.pill} ${i < lit ? css.pill_lit : ""}`}
                    style={{ "--pill-fill": team?.gradient ?? team?.color, "--team-color": team?.color }}
                />
            ))}
        </span>
    );
};

const SetDots = ({ total, lit }) =>
    total > 0 ? (
        <span className={css.dots}>
            {Array.from({ length: total }, (_, i) => (
                <span key={i} className={`${css.dot} ${lit > i ? css.dot_won : ""}`} />
            ))}
        </span>
    ) : null;

const Heat = ({ value = 0, animated = true }) => (
    <AnimatePresence initial={false}>
        {value >= STREAK_MIN ? (
            <motion.span
                key="heat"
                className={css.heat_wrap}
                style={heatStyle(value)}
                initial={animated ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
            >
                <span className={css.heat_glow} />
                <span className={css.heat}>
                    {HEAT_COLS.map((c, i) => (
                        <span key={i} className={css.heat_col} style={{ "--h": c.h, "--dur": c.dur, "--delay": c.delay, "--bx": c.bx }} />
                    ))}
                </span>
            </motion.span>
        ) : null}
    </AnimatePresence>
);

const StreakCount = ({ value = 0, animated = true }) => (
    <AnimatePresence initial={false}>
        {value >= STREAK_MIN ? (
            <motion.span
                key="streak"
                className={css.streak}
                initial={animated ? { opacity: 0, scale: 0.6 } : false}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.3, ease: EASE }}
            >
                <FaFire className={css.streak_icon} aria-hidden="true" />
                <motion.span
                    key={value}
                    className={css.streak_value}
                    initial={animated ? { scale: 1.8 } : false}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                >
                    {value}
                </motion.span>
                in a row
            </motion.span>
        ) : null}
    </AnimatePresence>
);

const Embers = () => (
    <span className={css.embers} aria-hidden="true">
        {EMBERS.map((e, i) => (
            <span key={i} className={css.ember} style={{ "--x": e.x, "--dx": e.dx, "--s": e.size, "--d": e.delay, "--dur": e.dur }} />
        ))}
    </span>
);

const Half = ({ side, team, score, setsTotal, setsLit, pills = null, momentum = 0, finale = null, celebrate = false, result = null, glow = null, cheat = false, animated = true }) => (
    <div
        className={`${css.half} ${side === "right" ? css.half_right : ""} ${finale ? css[`half_${finale}`] : ""} ${finale ? (celebrate ? css.play : css.still) : ""} ${glow ? css[`glow_${glow}`] : ""}`}
        style={{ "--team-color": team?.color ?? "#8b909e", "--team-gradient": team?.gradient ?? team?.color ?? "#8b909e" }}
    >
        <span className={css.half_bg} aria-hidden="true">
            <span className={css.half_glow} />
            <Heat value={momentum} animated={animated} />
            {finale === "won" ? (
                <>
                    <span className={css.half_fill} />
                    <span className={css.beam} />
                    <span className={`${css.beam} ${css.beam_2}`} />
                </>
            ) : null}
        </span>
        {finale === "won" ? <Embers /> : null}
        <span className={css.logo}>
            {finale === "won" ? <span className={css.logo_ring} aria-hidden="true" /> : null}
            <PemCircle team={team} className={css.circle} />
            {result ? (
                <span className={`${css.result} ${css[`result_${result}`]}`}>{result === "won" ? <FaCheck aria-hidden="true" /> : <FaXmark aria-hidden="true" />}</span>
            ) : null}
        </span>
        <span className={css.info}>
            {pills}
            <span className={css.name}>
                {finale === "won" ? <FaCrown className={css.crown} aria-hidden="true" /> : null}
                <span className={css.name_text}>
                    <Fit>{team?.name}</Fit>
                </span>
            </span>
            <span className={css.status}>
                <SetDots total={setsTotal} lit={setsLit} />
                <StreakCount value={momentum} animated={animated} />
            </span>
            {cheat ? <span className={`${base.cheat_indicator} ${css.cheat}`} aria-hidden="true" /> : null}
        </span>
        <span className={css.score_box}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={score}
                    className={css.score}
                    initial={animated ? { scale: 1.8, opacity: 0, filter: "blur(6px)" } : false}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    exit={animated ? { scale: 0.5, opacity: 0, filter: "blur(4px)" } : undefined}
                    transition={{ duration: 0.38, ease: EASE }}
                >
                    {score}
                </motion.span>
            </AnimatePresence>
            {animated && score > 0 ? <span key={`ping-${score}`} className={css.score_ping} aria-hidden="true" /> : null}
        </span>
    </div>
);

const GG_IN = { opacity: 0, scale: 2.8 };
const GG_LAND = { opacity: 1, scale: [2.8, 0.86, 1.08, 1] };
const GG_TIME = { duration: 0.72, times: [0, 0.42, 0.72, 1], ease: "easeOut", opacity: { duration: 0.18 } };

const Centre = ({ tone, big, bigKey = null, small, team, celebrate = true, onSmallClick = null }) => (
    <div
        className={`${css.centre} ${css[`centre_${tone}`] ?? ""}`}
        style={tone === "gg" ? { "--gg-fill": team?.gradient ?? team?.color, color: pemTextOn(team?.color) } : undefined}
    >
        {big != null ? (
            <motion.span
                key={`b-${tone}-${bigKey ?? (typeof big === "string" || typeof big === "number" ? big : "node")}`}
                className={css.centre_big}
                initial={tone === "gg" ? (celebrate ? GG_IN : false) : { opacity: 0, y: 6 }}
                animate={tone === "gg" ? (celebrate ? GG_LAND : { opacity: 1, scale: 1 }) : { opacity: 1, y: 0 }}
                transition={tone === "gg" ? (celebrate ? GG_TIME : { duration: 0 }) : { duration: 0.22, ease: EASE }}
            >
                <Fit>{big}</Fit>
            </motion.span>
        ) : null}
        {small ? (
            onSmallClick ? (
                <button type="button" className={`${css.centre_small} ${css.centre_link}`} onClick={onSmallClick} title="Show this round in the Extended Rounds">
                    {small}
                </button>
            ) : (
                <motion.span key={`s-${small}`} className={css.centre_small} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                    {small}
                </motion.span>
            )
        ) : null}
        {tone === "gg" && celebrate ? <span className={css.gg_flash} aria-hidden="true" /> : null}
        {tone === "gg" ? <span className={pem.gg_shine} aria-hidden="true" /> : null}
    </div>
);

export const PgxBar = ({ left, right, centre, alert = false, className = "", children = null }) => (
    <div className={`${css.bar_wrap} ${className}`}>
        <div className={`${css.bar} ${alert ? css.bar_alert : ""} ${centre.tone === "gg" && centre.celebrate !== false ? css.bar_gg : ""}`}>
            <Half side="left" {...left} />
            <Centre {...centre} />
            <Half side="right" {...right} />
            {centre.tone === "gg" && centre.celebrate !== false ? <span className={css.shock} style={{ "--shock-color": centre.team?.color ?? "#fff" }} aria-hidden="true" /> : null}
        </div>
        {children}
    </div>
);

const pgxCue = (s, setsToWin) => {
    const total = setsToWin * 2 - 1;
    const set = s.setNumber ?? 1;
    const rw = s.roundWins ?? 0;
    const rl = s.roundLosses ?? 0;
    const block = s.isOvertime ? Math.max(0, s.overtimeBlock ?? 0) : 0;

    if (s.tiebreakerPhase === "extended" || s.pendingAction?.type === "START_EXTENDED") {
        return {
            key: `er-${set}`,
            tone: "er",
            head: "Tiebreaker",
            cols: [
                { value: `${rw}-${rl}`, label: "Still tied" },
                { value: "Extended Rounds", label: "Next up" },
                { value: 4, label: "First to" },
            ],
        };
    }

    const action = s.pendingAction;
    if (!action) return null;

    if (action.type === "NEXT_SET" || action.type === "NEXT_SET_AFTER_PENALTIES") {
        const pens = action.type === "NEXT_SET_AFTER_PENALTIES";
        const leftWon = pens ? (s.penaltyLeftScore ?? 0) > (s.penaltyRightScore ?? 0) : rw >= rl;
        const winner = leftWon ? s.leftTeam : s.rightTeam;
        return {
            key: action.executeAt,
            tone: "set",
            team: winner,
            head: `${pemSetLabel(set, total)} complete`,
            cols: [
                pens
                    ? { value: `${s.penaltyLeftScore ?? 0}-${s.penaltyRightScore ?? 0}`, label: "Penalties" }
                    : { value: `${rw}-${rl}`, label: "Set score" },
                { value: winner?.name, label: "Set winner", team: winner },
                { value: pemSetLabel(set + 1, total), label: "Next up" },
            ],
        };
    }

    if (action.type === "NEXT_OT") {
        return {
            key: action.executeAt,
            tone: "ot",
            ot: true,
            head: "Overtime",
            tagTop: pemOvertimeName(block + 1),
            tagBottom: `First to ${16 + block * 3}`,
            cols: [
                { value: `${rw}-${rl}`, label: "Tied" },
                { value: pemOvertimeName(block + 1), label: "Next up" },
                { value: 16 + block * 3, label: "First to" },
            ],
        };
    }

    return null;
};

const PANEL_HEAD = {
    set: null,
    ot: `linear-gradient(90deg, #c46a0c 0%, ${OT_TAB} 100%)`,
    er: "linear-gradient(90deg, #0f6fd6 0%, #1e9bff 100%)",
};

const PANEL_REST = {
    left: 0,
    width: BAR_W,
    top: 0,
    height: BAR_H,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: "#141d28",
};

const panelVariants = {
    hidden: { ...PANEL_REST, clipPath: "inset(0% 50% 0% 50%)", opacity: 1 },
    shown: { ...PANEL_REST, clipPath: "inset(0% 0% 0% 0%)", opacity: 1, transition: { duration: 0.42, ease: SWEEP } },
    morph: {
        clipPath: "inset(0% 0% 0% 0%)",
        left: (BAR_W - TAB_W) / 2,
        width: TAB_W,
        top: BAR_H,
        height: TAB_H,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: OT_TAB,
        transition: { duration: MORPH_MS / 1000, ease: SWEEP },
    },
    gone: (instant) =>
        instant ? { opacity: 0, transition: { duration: 0 } } : { clipPath: "inset(0% 50% 0% 50%)", transition: { duration: 0.32, ease: SWEEP } },
};

const layerVariants = (visibleIn) => ({
    hidden: { opacity: visibleIn === "shown" ? 1 : 0 },
    shown: { opacity: visibleIn === "shown" ? 1 : 0 },
    morph: { opacity: visibleIn === "morph" ? 1 : 0, transition: { duration: 0.2, delay: visibleIn === "morph" ? 0.2 : 0 } },
    gone: { opacity: visibleIn === "morph" ? 1 : 0 },
});

const colVariants = (i) => ({
    hidden: { opacity: 0, y: 10 },
    shown: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE, delay: 0.18 + i * 0.07 } },
    morph: { opacity: 0, transition: { duration: 0.15 } },
    gone: { opacity: 0 },
});

const Panel = ({ seriesState, setsToWin }) => {
    const action = seriesState.pendingAction;
    const [timed, setTimed] = useState(null);
    const [morphAt, setMorphAt] = useState(null);
    const lastOtRef = useRef(false);

    useEffect(() => {
        if (!action?.executeAt) return undefined;
        const remaining = action.executeAt - Date.now();
        const cue = pgxCue(seriesState, setsToWin);
        if (!cue || remaining < STINGER_MIN_MS) return undefined;
        const at = action.executeAt;
        setTimed({ ...cue, at });
        const timer = setTimeout(() => setTimed(null), remaining);
        const morphTimer = cue.ot ? setTimeout(() => setMorphAt(at), Math.max(0, remaining - MORPH_MS)) : null;
        return () => {
            clearTimeout(timer);
            clearTimeout(morphTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action?.executeAt]);

    const extended = seriesState.tiebreakerPhase === "extended" ? pgxCue(seriesState, setsToWin) : null;
    const shown = (timed && action?.executeAt === timed.at ? timed : null) ?? extended;
    if (shown) lastOtRef.current = !!shown.ot;
    const morphing = !!shown?.ot && morphAt === shown.at;

    return (
        <AnimatePresence custom={lastOtRef.current}>
            {shown ? (
                <motion.div
                    key={shown.key}
                    className={css.panel}
                    aria-hidden="true"
                    variants={panelVariants}
                    initial="hidden"
                    animate={morphing ? "morph" : "shown"}
                    exit="gone"
                    style={{ "--head-fill": PANEL_HEAD[shown.tone] ?? shown.team?.gradient ?? shown.team?.color }}
                >
                    <motion.span className={css.panel_main} variants={layerVariants("shown")}>
                        <span className={css.panel_head} style={shown.team ? { color: pemTextOn(shown.team.color) } : undefined}>
                            <span>{shown.head}</span>
                            <span className={css.panel_mark}>PGX</span>
                        </span>
                        <span className={css.panel_body}>
                            {shown.cols.map((col, i) => (
                                <motion.span key={i} className={`${css.panel_col} ${i === 1 ? css.panel_col_mid : ""}`} variants={colVariants(i)}>
                                    <span className={css.panel_value}>
                                        {col.team ? <PemCircle team={col.team} className={css.panel_circle} /> : null}
                                        <span className={css.panel_value_text}>
                                            <Fit>{col.value}</Fit>
                                        </span>
                                    </span>
                                    <span className={css.panel_label}>{col.label}</span>
                                </motion.span>
                            ))}
                        </span>
                    </motion.span>
                    {shown.tagTop ? (
                        <motion.span className={`${css.panel_tag} ${css.tag_ot}`} variants={layerVariants("morph")}>
                            <span className={css.tag_top}>
                                <Fit>{shown.tagTop}</Fit>
                            </span>
                            <span className={css.tag_bottom}>
                                <Fit>{shown.tagBottom}</Fit>
                            </span>
                        </motion.span>
                    ) : null}
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

const roundBig = (round, total) => (
    <>
        Round {round}
        <span className={css.centre_total}>/{total}</span>
    </>
);

const liveCentre = ({ s, setsToWin, displayedRound, point, penaltyAttempt, suddenDeath, winnerTeam, celebrate = true }) => {
    const total = roundTotal(s);
    if (s.banner) {
        if (s.banner.tie) return { tone: "final", big: "Draw", small: "Final" };
        const won = Math.max(s.playerWonSets ?? 0, s.playerLostSets ?? 0);
        const lost = Math.min(s.playerWonSets ?? 0, s.playerLostSets ?? 0);
        return { tone: "gg", big: "GG", small: setsToWin > 1 ? `${won} - ${lost}` : `${s.roundWins} - ${s.roundLosses}`, team: winnerTeam, celebrate };
    }
    if (s.tiebreakerPhase === "penalties") return { tone: suddenDeath ? "sudden" : "tiebreak", big: `Attempt ${penaltyAttempt}`, small: suddenDeath ? "Sudden death" : "Penalties" };
    if (s.tiebreakerPhase === "extended") return { tone: "tiebreak", big: "Extended Rounds", small: "Tiebreaker" };
    if (point) return { tone: "alert", big: roundBig(displayedRound, total), bigKey: `r${displayedRound}`, small: point.label };
    const extended = isPemExtendedRoundNow(s);
    return {
        tone: extended ? "extended" : "normal",
        big: roundBig(displayedRound, total),
        bigKey: `r${displayedRound}`,
        small: extended ? "Extended Round" : getPemHalfIndex(s) === 0 ? "First half" : "Second half",
    };
};

export const PgxSets = ({ chips, bestOf, selectedIndex = null, onSelect = null }) => (
    <div className={`${css.hud} ${css.sets_wrap}`}>
        <div className={css.sets}>
            <span className={`${css.set} ${css.set_bo}`}>
                <span className={css.set_label}>Best of</span>
                <span className={css.set_value}>{bestOf}</span>
            </span>
            {chips.map((chip, i) => {
                const Tag = onSelect ? "button" : "span";
                const selected = selectedIndex === i;
                return (
                    <Tag
                        key={chip.set}
                        type={onSelect ? "button" : undefined}
                        disabled={onSelect ? selected : undefined}
                        onClick={onSelect ? () => onSelect(i) : undefined}
                        className={`${css.set} ${css[`set_${chip.status}`] ?? ""} ${selected ? css.set_selected : ""}`}
                        style={{ "--set-color": chip.winnerTeam?.color ?? "transparent", "--set-fill": chip.winnerTeam?.gradient ?? chip.winnerTeam?.color ?? "transparent" }}
                    >
                        <span className={css.set_label}>{chip.label === "DEC" ? "Decider" : `Set ${chip.set}`}</span>
                        {chip.result ? (
                            <span className={css.set_value}>
                                <span className={css.set_win} />
                                {chip.result.leftScore}-{chip.result.rightScore}
                                {chip.result.extra ? <span className={css.set_extra}>{chip.result.extra.label} {chip.result.extra.left}-{chip.result.extra.right}</span> : null}
                            </span>
                        ) : chip.status === "current" ? (
                            <span className={`${css.set_value} ${css.set_live}`}>
                                <span className={css.set_dot} />
                                Live
                            </span>
                        ) : (
                            <span className={css.set_value}>-</span>
                        )}
                    </Tag>
                );
            })}
        </div>
    </div>
);

const TopTab = ({ eventName, eventNumber, stageText, pemType }) => (
    <div className={css.top}>
        <span className={css.top_tab}>
            {pemType !== "pgxCm" ? (
                <span className={css.top_trophy}>
                    <PemTrophy type={pemType} size={22} />
                </span>
            ) : null}
            <span className={css.top_event}>{eventName}</span>
            <span className={css.top_number}>{eventNumber}</span>
            {stageText ? (
                <>
                    <span className={css.top_sep} />
                    <span className={css.top_stage} title={stageText}>
                        {stageText}
                    </span>
                </>
            ) : null}
        </span>
    </div>
);

export function PgxScorebug({
    seriesState,
    setsToWin,
    displayedRound,
    eventName,
    eventNumber,
    stageText,
    pemType,
    point,
    activeCheat,
    finalRoundMinis,
    displayedMiniSquares,
    penaltyAttempt,
    suddenDeath,
    penaltyAttempts,
    overtimeToWin,
    entrance = false,
}) {
    const s = seriesState;
    const preview = useOtMorphPreview(s, MORPH_MS);
    const view = preview ? otPreviewState(s) : s;
    const roundShown = preview ? otPreviewRound(s) : displayedRound;
    const squaresShown = preview ? 10 : displayedMiniSquares;
    const bannerAtMountRef = useRef(!!s.banner);
    const celebrate = !bannerAtMountRef.current;
    const isPens = s.tiebreakerPhase === "penalties";
    const winnerSide = s.banner && !s.banner.tie ? ((s.playerWonSets ?? 0) >= (s.playerLostSets ?? 0) ? "left" : "right") : null;
    const winnerTeam = winnerSide === "left" ? s.leftTeam : winnerSide === "right" ? s.rightTeam : null;
    const finaleFor = (side) => (winnerSide ? (winnerSide === side ? "won" : "lost") : null);
    const attempts = Math.max(penaltyAttempts ?? 0, s.penaltyLeftResults?.length ?? 0, s.penaltyRightResults?.length ?? 0);

    const pillsFor = (side) => {
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        if (isPens) {
            const results = (side === "left" ? s.penaltyLeftResults : s.penaltyRightResults) ?? [];
            return <Pills kind="pens" side={side} total={attempts} results={results} nextIndex={!s.penaltyResolved && s.penaltyTurn === side ? results.length : null} />;
        }
        const lit = finalRoundMinis && !preview ? finalRoundMinis[side] : side === "left" ? view.miniWins ?? 0 : view.miniLosses ?? 0;
        return <Pills side={side} team={team} total={squaresShown} lit={lit} />;
    };

    const sideProps = (side) => ({
        team: side === "left" ? s.leftTeam : s.rightTeam,
        score: side === "left" ? s.roundWins ?? 0 : s.roundLosses ?? 0,
        setsTotal: setsToWin,
        setsLit: side === "left" ? s.playerWonSets ?? 0 : s.playerLostSets ?? 0,
        pills: pillsFor(side),
        momentum: s.tiebreakerPhase === "idle" && !s.banner && !preview ? s.liveStats?.[side]?.momentum ?? 0 : 0,
        finale: finaleFor(side),
        celebrate,
        cheat: isCheatTargeting(activeCheat, side),
    });

    const prevActionRef = useRef(s.pendingAction?.type ?? null);
    const nextTagKey = s.isOvertime && s.tiebreakerPhase === "idle" && !s.banner ? `ot-${Math.max(1, s.overtimeBlock ?? 1)}` : null;
    const fromMorph = prevActionRef.current === "NEXT_OT" && !s.pendingAction;
    const morphTagRef = useRef(null);
    if (fromMorph && nextTagKey) morphTagRef.current = nextTagKey;

    useEffect(() => {
        prevActionRef.current = s.pendingAction?.type ?? null;
    });

    let tag = null;
    if (s.banner && !s.banner.tie) {
        tag = { key: "gg", tone: "gg", top: "Wins the series", bottom: `Team ${winnerTeam?.name}`, team: winnerTeam, delay: celebrate ? 0.5 : 0 };
    } else if (isPens && !s.penaltyResolved) {
        const side = s.penaltyTurn;
        tag = { key: `shoot-${side}`, tone: "shoot", top: side === "left" ? "◀ Shoots" : "Shoots ▶", bottom: `Team ${(side === "left" ? s.leftTeam : s.rightTeam)?.name}`, team: side === "left" ? s.leftTeam : s.rightTeam };
    } else if (s.isOvertime && s.tiebreakerPhase === "idle" && !s.banner && s.pendingAction?.type !== "NEXT_OT") {
        const block = Math.max(1, s.overtimeBlock ?? 1);
        tag = { key: `ot-${block}`, tone: "ot", top: pemOvertimeName(block), bottom: `First to ${overtimeToWin}` };
    }

    const tagStyle = (t) =>
        t.tone === "gg"
            ? { background: t.team?.gradient ?? t.team?.color, color: pemTextOn(t.team?.color) }
            : t.tone === "shoot"
                ? { "--team-color": t.team?.color }
                : undefined;

    return (
        <div className={`${css.hud} ${entrance ? css.entrance : ""}`}>
            {setsToWin > 1 ? <PgxSets chips={buildPemSetChips(s)} bestOf={setsToWin * 2 - 1} /> : null}
            <TopTab eventName={eventName} eventNumber={eventNumber} stageText={stageText} pemType={pemType} />
            <PgxBar
                left={sideProps("left")}
                right={sideProps("right")}
                centre={liveCentre({ s: view, setsToWin, displayedRound: roundShown, point, penaltyAttempt, suddenDeath, winnerTeam, celebrate })}
                alert={!!point}
                className={css.bar_wrap_tab}
            >
                <div className={css.tab_slot}>
                    <AnimatePresence initial={false} custom={fromMorph}>
                        {tag ? (
                            <motion.span
                                key={tag.key}
                                className={`${css.tag} ${css[`tag_${tag.tone}`] ?? ""}`}
                                style={tagStyle(tag)}
                                variants={{
                                    hidden: { y: "-100%" },
                                    shown: { y: "0%", transition: { duration: tag.delay ? 0.5 : 0.34, delay: tag.delay ?? 0, ease: tag.delay ? [0.3, 1.4, 0.5, 1] : EASE } },
                                    gone: (instant) => (instant ? { opacity: 0, transition: { duration: 0 } } : { y: "-100%", transition: { duration: 0.26, ease: "easeIn" } }),
                                }}
                                initial={morphTagRef.current === tag.key ? false : "hidden"}
                                animate="shown"
                                exit="gone"
                            >
                                <span className={css.tag_top}>
                                    <Fit>{tag.top}</Fit>
                                </span>
                                <span className={css.tag_bottom}>
                                    <Fit>{tag.bottom}</Fit>
                                </span>
                                {tag.tone === "gg" ? <span className={pem.gg_shine} aria-hidden="true" /> : null}
                            </motion.span>
                        ) : null}
                    </AnimatePresence>
                </div>
                <Panel seriesState={s} setsToWin={setsToWin} />
            </PgxBar>
        </div>
    );
}

export const PgxRow = ({
    leftTeam,
    rightTeam,
    leftScore,
    rightScore,
    squaresTotal = 0,
    leftSquares = 0,
    rightSquares = 0,
    setLinesTotal = 0,
    leftSets = 0,
    rightSets = 0,
    leftGlow = false,
    rightGlow = false,
    leftOpacity = 1,
    rightOpacity = 1,
    penalties = null,
    leftLabel = "",
    rightLabel = "",
    roundNumber = null,
    winnerSide = null,
    extended = null,
    ggBanner = null,
    leftMomentumStreak = null,
    rightMomentumStreak = null,
}) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.6 });
    const ggTeam = ggBanner?.team ?? null;
    const finaleSide = ggBanner && !ggBanner.tie ? (leftGlow ? "left" : rightGlow ? "right" : null) : null;
    const finaleFor = (side) => (finaleSide ? (finaleSide === side ? "won" : "lost") : null);
    const label = String(leftLabel || rightLabel || "").replace(/!+$/, "");
    const winner = winnerSide === "left" ? leftTeam : winnerSide === "right" ? rightTeam : null;
    const attempts = penalties ? Math.max(penalties.leftResults?.length ?? 0, penalties.rightResults?.length ?? 0) : 0;

    const centre = ggBanner
        ? ggBanner.tie
            ? { tone: "final", big: "Draw", small: "Final" }
            : { tone: "gg", big: "GG", small: `Round ${roundNumber ?? ""}`.trim(), team: ggTeam, celebrate: inView }
        : penalties
            ? { tone: "tiebreak", big: `${attempts} ${attempts === 1 ? "Attempt" : "Attempts"}`, small: "Penalties" }
            : label
                ? { tone: "alert", big: `Round ${roundNumber}`, small: label }
                : {
                    tone: extended ? "extended" : "normal",
                    big: winner ? (
                        <span className={css.winner}>
                            {winnerSide === "left" ? <FaCaretLeft aria-hidden="true" /> : null}
                            {winner.name}
                            {winnerSide === "right" ? <FaCaretRight aria-hidden="true" /> : null}
                        </span>
                    ) : `Round ${roundNumber}`,
                    small: extended ? "Extended Round" : `Round ${roundNumber}`,
                    onSmallClick: extended?.onClick ?? null,
                };

    const glowFor = (side) => {
        const own = side === "left" ? leftGlow : rightGlow;
        const other = side === "left" ? rightGlow : leftGlow;
        return own ? "won" : finaleSide && other ? "lost" : null;
    };

    const pillsFor = (side) => {
        const opacity = side === "left" ? leftOpacity : rightOpacity;
        if (penalties) {
            return (
                <Pills
                    kind="pens"
                    side={side}
                    total={Math.max(penalties.attemptsToDisplay ?? 0, attempts)}
                    results={(side === "left" ? penalties.leftResults : penalties.rightResults) ?? []}
                    opacity={opacity}
                />
            );
        }
        if (squaresTotal > 0) return <Pills side={side} team={side === "left" ? leftTeam : rightTeam} total={squaresTotal} lit={side === "left" ? leftSquares : rightSquares} opacity={opacity} />;
        return <span className={css.pills} />;
    };

    const sideProps = (side) => ({
        team: side === "left" ? leftTeam : rightTeam,
        score: side === "left" ? leftScore : rightScore,
        setsTotal: setLinesTotal,
        setsLit: side === "left" ? leftSets : rightSets,
        pills: pillsFor(side),
        momentum: (side === "left" ? leftMomentumStreak : rightMomentumStreak) ?? 0,
        finale: finaleFor(side),
        celebrate: inView,
        result: (side === "left" ? leftGlow : rightGlow) ? "won" : (side === "left" ? rightGlow : leftGlow) ? "lost" : null,
        glow: glowFor(side),
        animated: false,
    });

    return (
        <div ref={ref} className={css.row_wrap}>
            <div className={`${css.hud} ${css.row}`}>
                <PgxBar left={sideProps("left")} right={sideProps("right")} centre={centre} alert={!!label} />
            </div>
        </div>
    );
};

export const PgxBoard = ({
    leftTeam,
    rightTeam,
    leftScore,
    rightScore,
    setLinesTotal = 0,
    leftSets = 0,
    rightSets = 0,
    leftGlow = false,
    rightGlow = false,
    roundsPlayed = null,
    roundsLabel = "Rounds",
    ggBanner = null,
}) => {
    const ggTeam = ggBanner?.team ?? null;
    const centre = ggBanner
        ? { tone: "gg", big: "GG", small: `Team ${ggTeam?.name}`, team: ggTeam, celebrate: false }
        : roundsPlayed != null
            ? { tone: "normal", big: roundsPlayed, small: `${roundsLabel} played` }
            : { tone: "tiebreak", big: "ER", small: "Extended Rounds" };
    const sideProps = (side) => ({
        team: side === "left" ? leftTeam : rightTeam,
        score: side === "left" ? leftScore : rightScore,
        setsTotal: setLinesTotal,
        setsLit: side === "left" ? leftSets : rightSets,
        pills: <span className={css.pills} />,
        result: (side === "left" ? leftGlow : rightGlow) ? "won" : (side === "left" ? rightGlow : leftGlow) ? "lost" : null,
        glow: (side === "left" ? leftGlow : rightGlow) ? "won" : null,
        animated: false,
    });

    return (
        <div className={`${css.hud} ${css.board}`}>
            <PgxBar left={sideProps("left")} right={sideProps("right")} centre={centre} />
        </div>
    );
};

export function PgxIntro({ seriesState, eventName, eventNumber, stageText, setsToWin, pemType, onDone }) {
    const [open, setOpen] = useState(() => isFreshPemSeries(seriesState));

    useEffect(() => {
        if (!open) return undefined;
        const timer = setTimeout(() => setOpen(false), INTRO_MS);
        return () => clearTimeout(timer);
    }, [open]);

    useEffect(() => {
        if (!open) onDone?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AnimatePresence onExitComplete={onDone}>
            {open ? (
                <motion.div
                    key="pgx-intro"
                    className={`${css.hud} ${css.intro}`}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.45 } }}
                    transition={{ duration: 0.2 }}
                >
                    <span className={css.intro_beam} aria-hidden="true" />
                    <span className={`${css.intro_beam} ${css.intro_beam_2}`} aria-hidden="true" />
                    <div className={css.intro_stage}>
                        <motion.div
                            className={css.intro_head}
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -24, transition: { duration: 0.25, ease: "easeIn" } }}
                            transition={{ duration: 0.45, delay: 0.15, ease: EASE }}
                        >
                            {pemType !== "pgxCm" ? (
                            <motion.span
                                className={css.intro_trophy}
                                initial={{ scale: 0.3, rotate: -12, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ duration: 0.55, delay: 0.2, ease: [0.3, 1.5, 0.5, 1] }}
                            >
                                <PemTrophy type={pemType} size={52} />
                            </motion.span>
                            ) : null}
                            <motion.span
                                className={css.intro_event}
                                initial={{ letterSpacing: "0.6em", opacity: 0, filter: "blur(8px)" }}
                                animate={{ letterSpacing: "0.04em", opacity: 1, filter: "blur(0px)" }}
                                transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                            >
                                {eventName}
                                <motion.span
                                    className={css.top_number}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.95, ease: [0.3, 1.5, 0.5, 1] }}
                                >
                                    {eventNumber}
                                </motion.span>
                            </motion.span>
                            <motion.span
                                className={css.intro_info}
                                initial={{ clipPath: "inset(0% 50% 0% 50%)" }}
                                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                                transition={{ duration: 0.45, delay: 0.75, ease: SWEEP }}
                            >
                                <span className={css.intro_info_head}>Best of {setsToWin * 2 - 1}</span>
                                <span className={css.intro_info_body}>{stageText}</span>
                            </motion.span>
                        </motion.div>
                        <div className={css.intro_teams}>
                            {["left", "right"].map((side) => {
                                const team = side === "left" ? seriesState.leftTeam : seriesState.rightTeam;
                                const from = side === "left" ? -520 : 520;
                                return (
                                    <motion.div
                                        key={side}
                                        className={`${css.intro_card} ${side === "right" ? css.intro_card_right : ""}`}
                                        style={{ "--team-color": team?.color ?? "#8b909e", "--team-gradient": team?.gradient ?? team?.color }}
                                        initial={{ x: from, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: from * 0.7, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }}
                                        transition={{ type: "spring", stiffness: 210, damping: 24, delay: 1.0 }}
                                    >
                                        <span className={css.intro_glow} aria-hidden="true" />
                                        <span className={css.intro_logo}>
                                            <PemCircle team={team} className={css.intro_circle} />
                                        </span>
                                        <span className={css.intro_name}>
                                            <span className={css.intro_prefix}>Team</span>
                                            <span className={css.intro_name_text}>
                                                <Fit>{team?.name}</Fit>
                                            </span>
                                        </span>
                                    </motion.div>
                                );
                            })}
                            <motion.span
                                className={css.intro_vs}
                                initial={{ opacity: 0, scale: 0.2, rotate: -90 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.45, delay: 1.35, ease: [0.3, 1.5, 0.5, 1] }}
                            >
                                VS
                            </motion.span>
                        </div>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
