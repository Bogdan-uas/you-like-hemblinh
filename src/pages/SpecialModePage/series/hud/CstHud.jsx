import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FaCaretLeft, FaCaretRight, FaCrown } from "react-icons/fa";
import { FaCheck, FaXmark } from "react-icons/fa6";
import css from "./Cst.module.css";
import pcss from "../../progress/Progress.module.css";
import { HudInsurance } from "../../progress/HudPerks.jsx";
import pem from "./PemHud.module.css";
import base from "../../SpecialModePage.module.css";
import { isCheatTargeting } from "../../logic/secretCheats.js";
import { PemCircle } from "./PemParts.jsx";
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
    streakTier,
    useOtMorphPreview,
} from "./pemHud.js";

const REGULATION_ROUNDS = 24;
const OT_ROUNDS = 6;
const STREAK_MIN = 5;
const BAR_W = 872;
const BAR_H = 66;
const STRIP_TOP = BAR_H + 4;
const STRIP_H = 30;
const TAG_W = 200;
const MORPH_MS = 480;
const ROUND_BANNER_MS = 1500;
const INTRO_MS = 3400;
const EASE = [0.22, 1, 0.36, 1];
const SWEEP = [0.7, 0, 0.3, 1];
const OT_FILL = "#f2a516";
const ER_FILL = "#27a9e1";
const SLANT = "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)";

const roundTotal = (s) => REGULATION_ROUNDS + (s.isOvertime ? Math.max(1, s.overtimeBlock ?? 1) * OT_ROUNDS : 0);

const teamVars = (team) => ({
    "--team-color": team?.color ?? "#8b909e",
    "--team-gradient": team?.gradient ?? team?.color ?? "#8b909e",
    "--team-text": pemTextOn(team?.color),
});

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

const Pips = ({ kind, side, team, total, lit = 0, results = [], nextIndex = null, opacity = 1 }) => (
    <span className={`${css.pips} ${side === "right" ? css.pips_right : ""} ${total > 5 ? css.pips_many : ""}`} style={{ opacity, ...teamVars(team) }}>
        {kind === "pens"
            ? getPemPenaltyWindow(results, total).map(({ index, result }) => <Pen key={index} result={result} next={index === nextIndex} />)
            : Array.from({ length: total }, (_, i) => <span key={i} className={`${css.pip} ${i < lit ? css.pip_lit : ""}`} />)}
    </span>
);

const SetMarks = ({ total, lit }) =>
    total > 0 ? (
        <span className={css.marks}>
            {Array.from({ length: total }, (_, i) => (
                <span key={i} className={`${css.mark} ${lit > i ? css.mark_won : ""}`} />
            ))}
        </span>
    ) : null;

const Streak = ({ value = 0, side = "left", animated = true }) => (
    <AnimatePresence initial={false}>
        {value >= STREAK_MIN ? (
            <motion.span
                key="streak"
                className={`${css.streak} ${side === "right" ? css.streak_right : ""}`}
                data-tier={streakTier(value)}
                initial={animated ? { opacity: 0, x: side === "right" ? -26 : 26, skewX: -18 } : false}
                animate={{ opacity: 1, x: 0, skewX: 0 }}
                exit={{ opacity: 0, x: side === "right" ? -30 : 30, skewX: 18, transition: { duration: 0.3, ease: "easeIn" } }}
                transition={{ duration: 0.36, ease: EASE }}
            >
                <span className={css.streak_lines} aria-hidden="true" />
                <span className={css.streak_flash} aria-hidden="true" />
                <motion.span
                    key={value}
                    className={css.streak_value}
                    initial={animated ? { x: side === "right" ? -14 : 14, opacity: 0 } : false}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, ease: EASE }}
                >
                    {value}
                </motion.span>
                <span className={css.streak_label}>Streak</span>
            </motion.span>
        ) : null}
    </AnimatePresence>
);

const Side = ({ side, team, score, setsTotal = 0, setsLit = 0, streak = 0, roundWon = null, finale = null, celebrate = false, result = null, cheat = false, animated = true }) => {
    const out = side === "left" ? -1 : 1;
    return (
        <div
            className={`${css.side} ${side === "right" ? css.side_right : ""} ${finale ? css[`side_${finale}`] : ""} ${finale ? (celebrate ? css.play : css.still) : ""}`}
            style={teamVars(team)}
        >
            <span className={css.edge} />
            <span className={css.wing}>
                {finale === "won" ? (
                    <span className={css.wing_fill} aria-hidden="true">
                        <span className={css.wing_streaks} />
                    </span>
                ) : null}
                <span className={css.wing_row}>
                    {finale === "won" ? <FaCrown className={css.crown} aria-hidden="true" /> : null}
                    <span className={css.wing_name}>
                        <Fit>{team?.name}</Fit>
                    </span>
                    <Streak value={streak} side={side} animated={animated} />
                </span>
                <SetMarks total={setsTotal} lit={setsLit} />
                {finale ? null : (
                <AnimatePresence>
                    {roundWon ? (
                        <motion.span
                            key={roundWon}
                            className={css.won}
                            initial={{ clipPath: side === "left" ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" }}
                            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                            exit={{ clipPath: side === "left" ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)", transition: { duration: 0.16, ease: "easeIn" } }}
                            transition={{ duration: 0.32, ease: SWEEP }}
                        >
                            <span className={css.won_text}>
                                <Fit>{team?.name} won the round</Fit>
                            </span>
                        </motion.span>
                    ) : null}
                </AnimatePresence>
                )}
                {cheat ? <span className={`${base.cheat_indicator} ${css.cheat}`} aria-hidden="true" /> : null}
            </span>
            <span className={css.tile}>
                <PemCircle team={team} className={css.circle} />
                {result ? (
                    <span className={`${css.result} ${css[`result_${result}`]}`}>{result === "won" ? <FaCheck aria-hidden="true" /> : <FaXmark aria-hidden="true" />}</span>
                ) : null}
            </span>
            <span className={css.score_box}>
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                        key={score}
                        className={css.score}
                        initial={animated ? { x: 22 * out, skewX: -14, opacity: 0 } : false}
                        animate={{ x: 0, skewX: 0, opacity: 1 }}
                        exit={animated ? { x: -22 * out, skewX: 14, opacity: 0 } : undefined}
                        transition={{ duration: 0.3, ease: EASE }}
                    >
                        {score}
                    </motion.span>
                </AnimatePresence>
            </span>
        </div>
    );
};

const Centre = ({ tone, big, bigKey = null, small, team, celebrate = true, onSmallClick = null }) => (
    <div
        className={`${css.centre} ${css[`centre_${tone}`] ?? ""}`}
        style={tone === "gg" ? { "--gg-fill": team?.gradient ?? team?.color, color: pemTextOn(team?.color) } : undefined}
    >
        {big != null ? (
            <motion.span
                key={`b-${tone}-${bigKey ?? (typeof big === "string" || typeof big === "number" ? big : "node")}`}
                className={css.centre_big}
                initial={tone === "gg" ? (celebrate ? { x: -150, skewX: -35, opacity: 0 } : false) : { opacity: 0, y: 6 }}
                animate={tone === "gg" ? { x: 0, skewX: 0, opacity: 1 } : { opacity: 1, y: 0 }}
                transition={tone === "gg" ? { type: "spring", stiffness: 520, damping: 20, opacity: { duration: 0.12 } } : { duration: 0.22, ease: EASE }}
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
                <span className={css.centre_small}>{small}</span>
            )
        ) : null}
        {tone === "gg" && celebrate ? <span className={css.gg_streaks} aria-hidden="true" /> : null}
        {tone === "gg" ? <span className={pem.gg_shine} aria-hidden="true" /> : null}
    </div>
);

export const CstBar = ({ left, right, centre, alert = false, className = "", children = null }) => (
    <div className={`${css.bar_wrap} ${className}`}>
        <div className={`${css.bar} ${alert ? css.bar_alert : ""} ${centre.tone === "gg" && centre.celebrate !== false ? css.bar_gg : ""}`}>
            <Side side="left" {...left} />
            <Centre {...centre} />
            <Side side="right" {...right} />
            {["left", "right"].map((side) => {
                const glow = (side === "left" ? left : right).glow;
                const other = (side === "left" ? right : left).glow;
                return glow ? <span key={side} className={`${css.halo} ${css[`halo_${side}`]} ${css[`halo_${glow}`]} ${other ? "" : css.halo_closed}`} aria-hidden="true" /> : null;
            })}
        </div>
        {children}
    </div>
);

const Strip = ({ left, right, tag, morphKey = null }) => (
    <div className={css.strip}>
        <span className={css.strip_side}>{left}</span>
        <span className={css.strip_slot}>
            <AnimatePresence initial={false} custom={morphKey === tag.key}>
                <motion.span
                    key={tag.key}
                    className={`${css.tag} ${css[`tag_${tag.tone}`] ?? ""}`}
                    style={tag.team ? teamVars(tag.team) : undefined}
                    variants={{
                        hidden: { y: "-110%" },
                        shown: { y: "0%", opacity: 1, transition: { duration: 0.32, delay: tag.delay ?? 0, ease: tag.delay ? [0.3, 1.4, 0.5, 1] : EASE } },
                        gone: (instant) => (instant ? { opacity: 0, transition: { duration: 0 } } : { y: "110%", transition: { duration: 0.24, ease: "easeIn" } }),
                    }}
                    initial={morphKey === tag.key ? false : "hidden"}
                    animate="shown"
                    exit="gone"
                >
                    <span className={css.tag_text}>
                        <Fit>{tag.text}</Fit>
                    </span>
                </motion.span>
            </AnimatePresence>
        </span>
        <span className={`${css.strip_side} ${css.strip_side_right}`}>{right}</span>
    </div>
);

const cstCue = (s, setsToWin) => {
    const total = setsToWin * 2 - 1;
    const set = s.setNumber ?? 1;
    const rw = s.roundWins ?? 0;
    const rl = s.roundLosses ?? 0;
    const block = s.isOvertime ? Math.max(0, s.overtimeBlock ?? 0) : 0;

    if (s.tiebreakerPhase === "extended" || s.pendingAction?.type === "START_EXTENDED") {
        return {
            key: `er-${set}`,
            fill: ER_FILL,
            head: `Still tied ${rw}-${rl}`,
            blocks: [
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
            team: winner,
            head: `${winner?.name} won ${pemSetLabel(set, total)}`,
            blocks: [
                pens ? { value: `${s.penaltyLeftScore ?? 0}-${s.penaltyRightScore ?? 0}`, label: "Penalties" } : { value: `${rw}-${rl}`, label: "Set score" },
                { value: pemSetLabel(set + 1, total), label: "Next up" },
            ],
        };
    }

    if (action.type === "NEXT_OT") {
        return {
            key: action.executeAt,
            ot: true,
            fill: OT_FILL,
            head: `Tied ${rw}-${rl}`,
            tag: `${pemOvertimeName(block + 1)} · First to ${16 + block * 3}`,
            blocks: [
                { value: pemOvertimeName(block + 1), label: "Next up" },
                { value: 16 + block * 3, label: "First to" },
            ],
        };
    }

    return null;
};

const PANEL_REST = { left: 0, top: 0, width: BAR_W, height: BAR_H };

const panelVariants = {
    hidden: { ...PANEL_REST, clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)", backgroundColor: "rgb(23, 25, 30)" },
    shown: { ...PANEL_REST, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", backgroundColor: "rgb(23, 25, 30)", transition: { duration: 0.4, ease: SWEEP } },
    morph: {
        left: (BAR_W - TAG_W) / 2,
        top: STRIP_TOP,
        width: TAG_W,
        height: STRIP_H,
        clipPath: SLANT,
        backgroundColor: OT_FILL,
        transition: { duration: 0.36, delay: 0.08, ease: SWEEP, backgroundColor: { duration: 0.1 } },
    },
    gone: (instant) =>
        instant
            ? { opacity: 0, transition: { duration: 0 } }
            : { clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)", transition: { duration: 0.32, ease: SWEEP } },
};

const layerVariants = (visibleIn) => ({
    hidden: { opacity: visibleIn === "shown" ? 1 : 0 },
    shown: { opacity: visibleIn === "shown" ? 1 : 0 },
    morph: visibleIn === "morph" ? { opacity: 1, transition: { duration: 0.12, delay: 0.3 } } : { opacity: 0, transition: { duration: 0.1 } },
    gone: { opacity: visibleIn === "morph" ? 1 : 0 },
});

const blockVariants = (i) => ({
    hidden: { opacity: 0, x: 30 },
    shown: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE, delay: 0.2 + i * 0.08 } },
    morph: { opacity: 0, transition: { duration: 0.12 } },
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
        const cue = cstCue(seriesState, setsToWin);
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

    const extended = seriesState.tiebreakerPhase === "extended" ? cstCue(seriesState, setsToWin) : null;
    const shown = (timed && action?.executeAt === timed.at ? timed : null) ?? extended;
    if (shown) lastOtRef.current = !!shown.ot;
    const morphing = !!shown?.ot && morphAt === shown.at;
    const fill = shown ? shown.fill ?? shown.team?.gradient ?? shown.team?.color : null;
    const ink = shown ? pemTextOn(shown.fill ?? shown.team?.color) : null;

    return (
        <AnimatePresence custom={lastOtRef.current}>
            {shown ? (
                <motion.div key={shown.key} className={css.panel} aria-hidden="true" variants={panelVariants} initial="hidden" animate={morphing ? "morph" : "shown"} exit="gone">
                    <motion.span className={css.panel_main} variants={layerVariants("shown")}>
                        <span className={css.panel_head} style={{ background: fill, color: ink }}>
                            {shown.team ? <PemCircle team={shown.team} className={css.panel_circle} /> : null}
                            <span className={css.panel_head_text}>
                                <Fit>{shown.head}</Fit>
                            </span>
                        </span>
                        {shown.blocks.map((block, i) => (
                            <motion.span key={i} className={css.panel_block} variants={blockVariants(i)}>
                                <span className={css.panel_value}>
                                    <Fit>{block.value}</Fit>
                                </span>
                                <span className={css.panel_label}>{block.label}</span>
                            </motion.span>
                        ))}
                    </motion.span>
                    {shown.tag ? (
                        <motion.span className={`${css.panel_tag} ${css.tag_text}`} variants={layerVariants("morph")}>
                            <Fit>{shown.tag}</Fit>
                        </motion.span>
                    ) : null}
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

const halfText = (s) => (getPemHalfIndex(s) === 0 ? "First half" : "Second half");

const liveCentre = ({ s, setsToWin, displayedRound, point, penaltyAttempt, suddenDeath, winnerTeam, celebrate = true }) => {
    if (s.banner) {
        if (s.banner.tie) return { tone: "final", big: "Draw", small: "Final" };
        const won = Math.max(s.playerWonSets ?? 0, s.playerLostSets ?? 0);
        const lost = Math.min(s.playerWonSets ?? 0, s.playerLostSets ?? 0);
        return { tone: "gg", big: "GG", small: setsToWin > 1 ? `${won} - ${lost}` : `${s.roundWins} - ${s.roundLosses}`, team: winnerTeam, celebrate };
    }
    if (s.tiebreakerPhase === "penalties") return { tone: suddenDeath ? "sudden" : "tiebreak", big: `Attempt ${penaltyAttempt}`, small: suddenDeath ? "Sudden death" : "Penalties" };
    if (s.tiebreakerPhase === "extended") return { tone: "tiebreak", big: "Extended Rounds", small: "Tiebreaker" };
    return { tone: point ? "alert" : isPemExtendedRoundNow(s) ? "extended" : "normal", big: `Round ${displayedRound}`, small: `of ${roundTotal(s)}` };
};

export const CstSets = ({ chips, bestOf, selectedIndex = null, onSelect = null, extra = null }) => (
    <div className={`${css.hud} ${css.sets_wrap}`}>
        <div className={`${css.sets} ${extra ? pcss.hud_anchor : ""}`}>
            {extra}
            <span className={`${css.set} ${css.set_bo}`}>
                <span className={css.set_inner}>
                    <span className={css.set_label}>Best of</span>
                    <span className={css.set_value}>{bestOf}</span>
                </span>
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
                        style={chip.winnerTeam ? { "--set-color": chip.winnerTeam.color } : undefined}
                    >
                        <span className={css.set_inner}>
                            <span className={css.set_label}>{chip.label === "DEC" ? "Decider" : `Set ${chip.set}`}</span>
                            {chip.result ? (
                                <span className={css.set_value}>
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
                        </span>
                    </Tag>
                );
            })}
        </div>
    </div>
);

const Top = ({ eventName, eventNumber, stageText }) => (
    <div className={css.top}>
        <span className={css.top_live}>Live</span>
        <span className={css.top_event}>
            {eventName}
            <span className={css.top_number}>{eventNumber}</span>
        </span>
        {stageText ? (
            <span className={css.top_stage} title={stageText}>
                {stageText}
            </span>
        ) : null}
    </div>
);

const useRoundWon = (s) => {
    const rw = s.roundWins ?? 0;
    const rl = s.roundLosses ?? 0;
    const gamble = `${s.miniWins ?? 0}|${s.miniLosses ?? 0}|${s.lastMultiplierLeft ?? ""}|${s.lastMultiplierRight ?? ""}|${s.roundNumber ?? 0}`;
    const prevRef = useRef([rw, rl, gamble]);
    const [won, setWon] = useState(null);

    useEffect(() => {
        const [pw, pl, pg] = prevRef.current;
        prevRef.current = [rw, rl, gamble];
        const side = rw === pw + 1 && rl === pl ? "left" : rl === pl + 1 && rw === pw ? "right" : null;
        if (side && !s.banner && s.tiebreakerPhase === "idle") {
            const key = `${side}-${s.setNumber ?? 1}-${rw}-${rl}`;
            setWon({ side, key });
            const timer = setTimeout(() => setWon((cur) => (cur?.key === key ? null : cur)), ROUND_BANNER_MS);
            return () => clearTimeout(timer);
        }
        if (rw !== pw || rl !== pl || gamble !== pg) setWon(null);
        return undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rw, rl, gamble]);

    return won;
};

export function CstScorebug({
    seriesState,
    setsToWin,
    displayedRound,
    eventName,
    eventNumber,
    stageText,
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
    const roundWon = useRoundWon(s);
    const isPens = s.tiebreakerPhase === "penalties";
    const winnerSide = s.banner && !s.banner.tie ? ((s.playerWonSets ?? 0) >= (s.playerLostSets ?? 0) ? "left" : "right") : null;
    const winnerTeam = winnerSide === "left" ? s.leftTeam : winnerSide === "right" ? s.rightTeam : null;
    const finaleFor = (side) => (winnerSide ? (winnerSide === side ? "won" : "lost") : null);
    const attempts = Math.max(penaltyAttempts ?? 0, s.penaltyLeftResults?.length ?? 0, s.penaltyRightResults?.length ?? 0);

    const pipsFor = (side) => {
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        if (isPens) {
            const results = (side === "left" ? s.penaltyLeftResults : s.penaltyRightResults) ?? [];
            return <Pips kind="pens" side={side} team={team} total={attempts} results={results} nextIndex={!s.penaltyResolved && s.penaltyTurn === side ? results.length : null} />;
        }
        const lit = finalRoundMinis && !preview ? finalRoundMinis[side] : side === "left" ? view.miniWins ?? 0 : view.miniLosses ?? 0;
        return <Pips side={side} team={team} total={squaresShown} lit={lit} />;
    };

    const sideProps = (side) => ({
        team: side === "left" ? s.leftTeam : s.rightTeam,
        score: side === "left" ? s.roundWins ?? 0 : s.roundLosses ?? 0,
        setsTotal: setsToWin,
        setsLit: side === "left" ? s.playerWonSets ?? 0 : s.playerLostSets ?? 0,
        streak: s.tiebreakerPhase === "idle" && !s.banner && !preview ? s.liveStats?.[side]?.momentum ?? 0 : 0,
        roundWon: roundWon?.side === side && !preview && !s.banner ? roundWon.key : null,
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

    let tag;
    if (s.banner && !s.banner.tie) {
        tag = { key: "gg", tone: "gg", text: `Team ${winnerTeam?.name} wins the series`, team: winnerTeam, delay: celebrate ? 0.45 : 0 };
    } else if (s.banner) {
        tag = { key: "draw", tone: "plain", text: "Series drawn" };
    } else if (isPens && !s.penaltyResolved) {
        const side = s.penaltyTurn;
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        tag = { key: `shoot-${side}`, tone: "shoot", text: side === "left" ? `◀ Team ${team?.name} shoots` : `Team ${team?.name} shoots ▶`, team };
    } else if (point && s.tiebreakerPhase === "idle") {
        tag = { key: `point-${point.label}`, tone: "alert", text: point.label };
    } else if (s.isOvertime && s.tiebreakerPhase === "idle" && s.pendingAction?.type !== "NEXT_OT") {
        const block = Math.max(1, s.overtimeBlock ?? 1);
        tag = { key: `ot-${block}`, tone: "ot", text: `${pemOvertimeName(block)} · First to ${overtimeToWin}` };
    } else if (s.tiebreakerPhase === "extended") {
        tag = { key: "er", tone: "plain", text: "Extended Rounds" };
    } else if (isPens) {
        tag = { key: "pens", tone: "plain", text: "Penalties" };
    } else {
        tag = { key: `half-${halfText(view)}-${isPemExtendedRoundNow(view)}`, tone: isPemExtendedRoundNow(view) ? "extended" : "plain", text: isPemExtendedRoundNow(view) ? "Extended round" : halfText(view) };
    }

    return (
        <div className={`${css.hud} ${entrance ? css.entrance : ""}`}>
            {setsToWin > 1 ? <CstSets chips={buildPemSetChips(s)} bestOf={setsToWin * 2 - 1} extra={<HudInsurance variant="cst" hud={css} seriesState={s} />} /> : null}
            <Top eventName={eventName} eventNumber={eventNumber} stageText={stageText} />
            <CstBar
                left={sideProps("left")}
                right={sideProps("right")}
                centre={liveCentre({ s: view, setsToWin, displayedRound: roundShown, point, penaltyAttempt, suddenDeath, winnerTeam, celebrate })}
                alert={!!point}
            >
                <Strip left={pipsFor("left")} right={pipsFor("right")} tag={tag} morphKey={morphTagRef.current} />
                <Panel seriesState={s} setsToWin={setsToWin} />
            </CstBar>
        </div>
    );
}

export const CstRow = ({
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
            : {
                tone: label ? "alert" : extended ? "extended" : "normal",
                big: winner ? (
                    <span className={css.winner}>
                        {winnerSide === "left" ? <FaCaretLeft aria-hidden="true" /> : null}
                        {winner.name}
                        {winnerSide === "right" ? <FaCaretRight aria-hidden="true" /> : null}
                    </span>
                ) : `Round ${roundNumber}`,
                small: `Round ${roundNumber}`,
            };

    const tag = ggBanner && !ggBanner.tie
        ? { key: "gg", tone: "gg", text: `Team ${ggTeam?.name} wins the series`, team: ggTeam }
        : penalties
            ? { key: "pens", tone: "plain", text: "Penalties" }
            : label
                ? { key: "point", tone: "alert", text: label }
                : extended
                    ? { key: "ext", tone: "extended", text: "Extended round" }
                    : { key: "round", tone: "plain", text: winner ? `Team ${winner.name} won the round` : `Round ${roundNumber}` };

    const glowFor = (side) => {
        const own = side === "left" ? leftGlow : rightGlow;
        const other = side === "left" ? rightGlow : leftGlow;
        return own ? "won" : finaleSide && other ? "lost" : null;
    };

    const pipsFor = (side) => {
        const opacity = side === "left" ? leftOpacity : rightOpacity;
        const team = side === "left" ? leftTeam : rightTeam;
        if (penalties) {
            return (
                <Pips
                    kind="pens"
                    side={side}
                    team={team}
                    total={Math.max(penalties.attemptsToDisplay ?? 0, attempts)}
                    results={(side === "left" ? penalties.leftResults : penalties.rightResults) ?? []}
                    opacity={opacity}
                />
            );
        }
        return <Pips side={side} team={team} total={squaresTotal} lit={side === "left" ? leftSquares : rightSquares} opacity={opacity} />;
    };

    const sideProps = (side) => ({
        team: side === "left" ? leftTeam : rightTeam,
        score: side === "left" ? leftScore : rightScore,
        setsTotal: setLinesTotal,
        setsLit: side === "left" ? leftSets : rightSets,
        streak: (side === "left" ? leftMomentumStreak : rightMomentumStreak) ?? 0,
        finale: finaleFor(side),
        celebrate: inView,
        result: (side === "left" ? leftGlow : rightGlow) ? "won" : (side === "left" ? rightGlow : leftGlow) ? "lost" : null,
        glow: glowFor(side),
        animated: false,
    });

    return (
        <div ref={ref} className={css.row_wrap}>
            <div className={`${css.hud} ${css.row}`}>
                <CstBar left={sideProps("left")} right={sideProps("right")} centre={centre} alert={!!label}>
                    <Strip left={pipsFor("left")} right={pipsFor("right")} tag={tag} morphKey={tag.key} />
                    {extended?.onClick ? (
                        <button type="button" className={css.er_link} onClick={extended.onClick} title="Show this round in the Extended Rounds">
                            Extended Round
                        </button>
                    ) : null}
                </CstBar>
            </div>
        </div>
    );
};

export const CstBoard = ({
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
        result: (side === "left" ? leftGlow : rightGlow) ? "won" : (side === "left" ? rightGlow : leftGlow) ? "lost" : null,
        glow: (side === "left" ? leftGlow : rightGlow) ? "won" : null,
        animated: false,
    });

    return (
        <div className={`${css.hud} ${css.board}`}>
            <CstBar left={sideProps("left")} right={sideProps("right")} centre={centre} />
        </div>
    );
};

const BANDS = [
    { top: "8%", delay: 0.05, tone: "accent" },
    { top: "24%", delay: 0.18, tone: "left" },
    { top: "58%", delay: 0.12, tone: "right" },
    { top: "76%", delay: 0.26, tone: "accent" },
];

export function CstIntro({ seriesState, eventName, eventNumber, stageText, setsToWin, onDone }) {
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

    const left = seriesState.leftTeam;
    const right = seriesState.rightTeam;

    return (
        <AnimatePresence onExitComplete={onDone}>
            {open ? (
                <motion.div
                    key="cst-intro"
                    className={`${css.hud} ${css.intro}`}
                    style={{ "--left-color": left?.color ?? "#e0a526", "--right-color": right?.color ?? "#27a9e1" }}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.4 } }}
                    transition={{ duration: 0.18 }}
                >
                    {BANDS.map((band, i) => (
                        <motion.span
                            key={i}
                            className={`${css.intro_band} ${css[`intro_band_${band.tone}`]}`}
                            style={{ top: band.top }}
                            initial={{ x: "-130vw" }}
                            animate={{ x: "130vw" }}
                            transition={{ duration: 1.1, delay: band.delay, ease: [0.6, 0, 0.3, 1] }}
                        />
                    ))}
                    <div className={css.intro_stage}>
                        <motion.div
                            className={css.intro_head}
                            initial={{ opacity: 0, x: -80, skewX: -18 }}
                            animate={{ opacity: 1, x: 0, skewX: 0 }}
                            exit={{ opacity: 0, x: 80, transition: { duration: 0.25, ease: "easeIn" } }}
                            transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
                        >
                            <span className={css.top_live}>Live</span>
                            <span className={css.intro_event}>
                                {eventName}
                                <span className={css.top_number}>{eventNumber}</span>
                            </span>
                            <span className={css.intro_sub}>
                                {stageText} · Best of {setsToWin * 2 - 1}
                            </span>
                        </motion.div>
                        <div className={css.intro_teams}>
                            {[
                                ["left", left],
                                ["right", right],
                            ].map(([side, team]) => {
                                const from = side === "left" ? -700 : 700;
                                return (
                                    <motion.div
                                        key={side}
                                        className={`${css.intro_team} ${side === "right" ? css.intro_team_right : ""}`}
                                        style={teamVars(team)}
                                        initial={{ x: from, skewX: side === "left" ? -20 : 20, opacity: 0 }}
                                        animate={{ x: 0, skewX: 0, opacity: 1 }}
                                        exit={{ x: from * 0.8, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }}
                                        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.95 }}
                                    >
                                        <span className={css.intro_tile}>
                                            <PemCircle team={team} className={css.intro_circle} />
                                        </span>
                                        <span className={css.intro_name}>
                                            <span className={css.intro_name_text}>
                                                <Fit>{team?.name}</Fit>
                                            </span>
                                        </span>
                                    </motion.div>
                                );
                            })}
                            <motion.span
                                className={css.intro_vs}
                                initial={{ opacity: 0, scale: 2.4, skewX: -20 }}
                                animate={{ opacity: 1, scale: 1, skewX: 0 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.35, delay: 1.35, ease: [0.3, 1.5, 0.5, 1] }}
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
