import { useEffect, useLayoutEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FaCaretLeft, FaCaretRight, FaCrown } from "react-icons/fa";
import { FaCheck, FaXmark } from "react-icons/fa6";
import css from "./Pbs.module.css";
import pem from "./PemHud.module.css";
import base from "../../SpecialModePage.module.css";
import { isCheatTargeting } from "../../logic/secretCheats.js";
import { PemCircle, PemTrophy, FinaleCircleEffects } from "./PemParts.jsx";
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
    STREAK_MIN,
    streakTier,
    useOtMorphPreview,
} from "./pemHud.js";

const REGULATION_ROUNDS = 24;
const OT_ROUNDS = 6;
const FLIP_STAGGER = 0.08;
const MORPH_MS = 480;
const TAG_OFFSET = 79;
const TAG_HEIGHT = 44;
const INTRO_MS = 3300;
const ROLL_MS = 2600;
const ROLL_W = 200;

export const Fit = ({ children }) => {
    const ref = useRef(null);
    const fitKey = typeof children === "string" || typeof children === "number" ? String(children) : children;

    useLayoutEffect(() => {
        const node = ref.current;
        if (!node) return undefined;
        const fit = () => {
            node.style.fontSize = "";
            const room = node.parentElement?.clientWidth ?? 0;
            let scale = 100;
            for (let i = 0; i < 4 && room > 0 && node.scrollWidth > room; i++) {
                scale = Math.floor(scale * (room / node.scrollWidth) * 10) / 10;
                node.style.fontSize = `${scale}%`;
            }
        };
        fit();
        let alive = true;
        document.fonts?.ready?.then(() => alive && fit());
        document.fonts?.addEventListener?.("loadingdone", fit);
        return () => {
            alive = false;
            document.fonts?.removeEventListener?.("loadingdone", fit);
        };
    }, [fitKey]);

    return (
        <span ref={ref} className={css.fit}>
            {children}
        </span>
    );
};

const roundTotal = (s) => REGULATION_ROUNDS + (s.isOvertime ? Math.max(1, s.overtimeBlock ?? 1) * OT_ROUNDS : 0);

const Segments = ({ kind, team, total, lit = 0, results = [], nextIndex = null, side }) => {
    if (kind === "pens") {
        return (
            <span className={`${css.segments} ${css.segments_pens} ${side === "right" ? css.segments_right : ""}`}>
                {getPemPenaltyWindow(results, total).map(({ index, result }) => (
                    <span
                        key={index}
                        className={`${css.segment} ${css.pen} ${result === "success" ? css.pen_goal : result === "fail" ? css.pen_miss : ""} ${index === nextIndex ? css.pen_next : ""}`}
                    >
                        {result === "success" ? <FaCheck aria-hidden="true" /> : result === "fail" ? <FaXmark aria-hidden="true" /> : null}
                    </span>
                ))}
            </span>
        );
    }
    return (
        <span className={`${css.segments} ${side === "right" ? css.segments_right : ""}`}>
            {Array.from({ length: total }, (_, i) => (
                <span
                    key={i}
                    className={`${css.segment} ${i < lit ? css.segment_lit : ""}`}
                    style={{ "--seg-i": i, "--seg-fill": team?.gradient ?? team?.color, "--team-color": team?.color }}
                />
            ))}
        </span>
    );
};

const PbsStreak = ({ value = 0, animated = true }) => (
    <AnimatePresence initial={false}>
        {value >= STREAK_MIN ? (
            <motion.span
                key="streak"
                className={css.streak_tile}
                data-tier={streakTier(value)}
                initial={animated ? { rotateX: -90, opacity: 0 } : false}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }}
                transition={{ duration: 0.42, ease: [0.3, 1.35, 0.5, 1] }}
                style={{ transformPerspective: 320, transformOrigin: "50% 0%" }}
            >
                <span className={css.streak_small}>Streak</span>
                <span className={css.streak_digits}>
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                            key={value}
                            className={css.streak_big}
                            initial={animated ? { rotateX: -100, opacity: 0 } : false}
                            animate={{ rotateX: 0, opacity: 1 }}
                            exit={animated ? { rotateX: 100, opacity: 0 } : undefined}
                            transition={{ duration: 0.34, ease: [0.3, 1.35, 0.5, 1] }}
                            style={{ transformPerspective: 220 }}
                        >
                            {value}
                        </motion.span>
                    </AnimatePresence>
                </span>
                <span className={css.streak_gem} aria-hidden="true" />
            </motion.span>
        ) : null}
    </AnimatePresence>
);

const NameRail = ({ side, team, rollKey, fresh = false, won = false, cheat = false, hot = false }) => {
    const [rolling, setRolling] = useState(false);
    const lastRef = useRef(fresh ? null : rollKey);

    useEffect(() => {
        if (rollKey == null || rollKey === lastRef.current) return undefined;
        lastRef.current = rollKey;
        setRolling(true);
        const timer = setTimeout(() => setRolling(false), ROLL_MS);
        return () => clearTimeout(timer);
    }, [rollKey]);

    return (
        <span className={`${css.rail} ${side === "right" ? css.rail_right : ""} ${rolling ? css.rail_rolling : ""}`}>
            <AnimatePresence initial={false}>
                {hot ? (
                    <motion.span key="heat" className={css.rail_heat} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} aria-hidden="true">
                        <span className={css.rail_heat_run} />
                    </motion.span>
                ) : null}
            </AnimatePresence>
            {won ? <FaCrown className={css.rail_crown} aria-hidden="true" /> : null}
            <span className={css.rail_text}>{team?.name}</span>
            {cheat ? <span className={`${base.cheat_indicator} ${side === "left" ? base.cheat_indicator_left : base.cheat_indicator_right}`} aria-hidden="true" /> : null}
            <AnimatePresence>
                {rolling ? (
                    <motion.span
                        key="roll"
                        className={`${css.roll} ${side === "right" ? css.roll_right : ""}`}
                        initial={{ width: 0 }}
                        animate={{ width: ROLL_W }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.55, ease: [0.7, 0, 0.3, 1] }}
                    >
                        <span className={css.roll_inner}>
                            <span className={css.roll_prefix}>Team</span>
                            <span className={css.roll_name}><Fit>{team?.name}</Fit></span>
                        </span>
                    </motion.span>
                ) : null}
            </AnimatePresence>
        </span>
    );
};

const Side = ({ side, team, score, setsTotal, setsLit, finale, celebrate, result, glow, rollKey = null, fresh = false, cheat = false, streak = 0, animated = true }) => (
    <div
        className={`${css.side} ${side === "right" ? css.side_right : ""} ${finale ? css[`side_${finale}`] : ""} ${finale ? (celebrate ? `${css.play} ${pem.fin_play}` : `${css.still} ${pem.fin_static}`) : ""} ${glow ? css[`glow_${glow}`] : ""}`}
        style={{ "--team-color": team?.color ?? "#8b909e", "--team-gradient": team?.gradient ?? team?.color ?? "#8b909e" }}
    >
        <NameRail side={side} team={team} rollKey={rollKey} fresh={fresh} won={finale === "won"} cheat={cheat} hot={streak >= 10} />
        <span className={`${css.tile} ${css.logo}`}>
            {finale === "won" ? <FinaleCircleEffects /> : null}
            <PemCircle team={team} className={css.circle} />
            {result ? (
                <span className={`${css.result} ${css[`result_${result}`]}`}>{result === "won" ? <FaCheck aria-hidden="true" /> : <FaXmark aria-hidden="true" />}</span>
            ) : null}
            {finale === "lost" ? <span className={css.shutter} aria-hidden="true" /> : null}
        </span>
        <span className={`${css.tile} ${css.score_tile}`}>
            <span className={css.pips}>
                {Array.from({ length: setsTotal }, (_, i) => (
                    <span key={i} className={`${css.pip} ${setsLit > i ? css.pip_won : ""}`} />
                ))}
            </span>
            <span className={css.score_box}>
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                        key={score}
                        className={css.score}
                        initial={animated ? { rotateX: -100, opacity: 0 } : false}
                        animate={{ rotateX: 0, opacity: 1 }}
                        exit={animated ? { rotateX: 100, opacity: 0 } : undefined}
                        transition={{ duration: 0.34, ease: [0.3, 1.35, 0.5, 1] }}
                        style={{ transformPerspective: 260 }}
                    >
                        {score}
                    </motion.span>
                </AnimatePresence>
            </span>
            {finale === "lost" ? <span className={css.shutter} aria-hidden="true" /> : null}
        </span>
    </div>
);

const Centre = ({ tone, top, big, sub, team, onSubClick = null }) => (
    <div
        className={`${css.tile} ${css.centre} ${css[`centre_${tone}`] ?? ""}`}
        style={tone === "gg" ? { background: team?.gradient, color: pemTextOn(team?.color) } : undefined}
    >
        {top ? (
            <motion.span key={`t-${top}`} className={css.centre_top} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                {top}
            </motion.span>
        ) : null}
        {big != null ? (
            <motion.span
                key={`b-${tone}-${big}`}
                className={css.centre_big}
                initial={tone === "gg" ? { opacity: 0, scale: 1.9 } : { opacity: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: tone === "gg" ? 0.45 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
                <Fit>{big}</Fit>
            </motion.span>
        ) : null}
        {sub ? (
            onSubClick ? (
                <button type="button" className={`${css.centre_sub} ${css.centre_link}`} onClick={onSubClick} title="Show this round in the Extended Rounds">
                    {sub}
                </button>
            ) : (
                <span className={css.centre_sub}>{sub}</span>
            )
        ) : null}
        {tone === "gg" ? <span className={pem.gg_shine} aria-hidden="true" /> : null}
    </div>
);

const underStyle = (team) => ({ "--team-gradient": team?.gradient ?? team?.color, "--team-color": team?.color });

export const PbsBar = ({ left, right, centre, alert = false, overlay = null, className = "" }) => (
    <div className={`${css.bar} ${alert ? css.bar_alert : ""} ${className}`}>
        <Side side="left" {...left} />
        <Centre {...centre} />
        <Side side="right" {...right} />
        {overlay}
    </div>
);

const pbsCue = (s, setsToWin) => {
    const total = setsToWin * 2 - 1;
    const set = s.setNumber ?? 1;
    const rw = s.roundWins ?? 0;
    const rl = s.roundLosses ?? 0;
    const block = s.isOvertime ? Math.max(0, s.overtimeBlock ?? 0) : 0;

    if (s.tiebreakerPhase === "extended" || s.pendingAction?.type === "START_EXTENDED") {
        return {
            key: `er-${set}`,
            left: { small: "Still tied", big: `${rw}-${rl}` },
            centre: { small: "Tiebreaker", big: "Extended Rounds" },
            right: { small: "First to", big: 4 },
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
            left: pens
                ? { small: `${pemSetLabel(set, total)} · Penalties`, big: `${s.penaltyLeftScore ?? 0}-${s.penaltyRightScore ?? 0}` }
                : { small: pemSetLabel(set, total), big: `${rw}-${rl}` },
            centre: { small: "Next up", big: pemSetLabel(set + 1, total) },
            right: { small: "Set winner", big: winner?.name, team: winner },
        };
    }

    if (action.type === "NEXT_OT") {
        return {
            key: action.executeAt,
            ot: true,
            left: { small: "Tied", big: `${rw}-${rl}` },
            centre: { small: "Next up", big: pemOvertimeName(block + 1), tagTop: pemOvertimeName(block + 1), tagBottom: `First to ${16 + block * 3}` },
            right: { small: "First to", big: 16 + block * 3 },
        };
    }

    return null;
};

const CENTRE_EDGES = centreEdges(-3);

function centreEdges(bottom) {
    return { boxShadow: `inset 0 3px 0 #12b36a, inset 0 ${bottom}px 0 #12b36a` };
}

const flipVariants = (index, centre) => ({
    hidden: { rotateX: -90, opacity: 0, ...(centre ? CENTRE_EDGES : null), transition: { duration: 0.22, ease: "easeIn", delay: (2 - index) * FLIP_STAGGER } },
    shown: { rotateX: 0, opacity: 1, ...(centre ? CENTRE_EDGES : null), transition: { duration: 0.32, ease: [0.3, 1.3, 0.5, 1], delay: index * FLIP_STAGGER } },
    morph: centre
        ? {
            rotateX: 0,
            opacity: 1,
            y: TAG_OFFSET,
            height: TAG_HEIGHT,
            backgroundColor: "#1f2126",
            ...centreEdges(0),
            transition: { duration: MORPH_MS / 1000, ease: [0.7, 0, 0.3, 1] },
        }
        : { rotateX: 90, opacity: 0, transition: { duration: 0.24, ease: "easeIn" } },
    gone: (instant) =>
        instant
            ? { opacity: 0, transition: { duration: 0 } }
            : { rotateX: -90, opacity: 0, transition: { duration: 0.22, ease: "easeIn", delay: (2 - index) * FLIP_STAGGER } },
});

const layerVariants = (visibleIn) => ({
    hidden: { opacity: visibleIn === "shown" ? 1 : 0 },
    shown: { opacity: visibleIn === "shown" ? 1 : 0 },
    morph: { opacity: visibleIn === "morph" ? 1 : 0, transition: { duration: 0.2, delay: visibleIn === "morph" ? 0.18 : 0 } },
    gone: { opacity: visibleIn === "morph" ? 1 : 0 },
});

const FlipTile = ({ index, part, accent = "gem", wide = false }) => (
    <motion.span
        className={`${css.flip} ${wide ? css.flip_centre : ""} ${css[`flip_${accent}`] ?? ""}`}
        style={part.team ? { "--team-color": part.team.color, "--team-gradient": part.team.gradient ?? part.team.color } : { height: "var(--b-h)" }}
        variants={flipVariants(index, wide)}
    >
        <motion.span className={css.flip_layer} variants={layerVariants("shown")}>
            <span className={css.flip_small}>{part.small}</span>
            <span className={css.flip_big}><Fit>{part.big}</Fit></span>
        </motion.span>
        {part.tagTop ? (
            <motion.span className={`${css.flip_layer} ${css.flip_tag}`} variants={layerVariants("morph")}>
                <span className={css.tag_top}><Fit>{part.tagTop}</Fit></span>
                <span className={css.tag_bottom}><Fit>{part.tagBottom}</Fit></span>
            </motion.span>
        ) : null}
    </motion.span>
);

const Flips = ({ seriesState, setsToWin }) => {
    const action = seriesState.pendingAction;
    const [timed, setTimed] = useState(null);
    const [morphAt, setMorphAt] = useState(null);
    const lastOtRef = useRef(false);

    useEffect(() => {
        if (!action?.executeAt) return undefined;
        const remaining = action.executeAt - Date.now();
        const cue = pbsCue(seriesState, setsToWin);
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

    const extended = seriesState.tiebreakerPhase === "extended" ? pbsCue(seriesState, setsToWin) : null;
    const shown = (timed && action?.executeAt === timed.at ? timed : null) ?? extended;
    if (shown) lastOtRef.current = !!shown.ot;
    const morphing = !!shown?.ot && morphAt === shown.at;

    return (
        <AnimatePresence custom={lastOtRef.current}>
            {shown ? (
                <motion.div key={shown.key} className={css.flips} aria-hidden="true" initial="hidden" animate={morphing ? "morph" : "shown"} exit="gone">
                    <FlipTile index={0} part={shown.left} />
                    <FlipTile index={1} part={shown.centre} wide />
                    <FlipTile index={2} part={shown.right} accent={shown.right.team ? "team" : "gem"} />
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

const liveCentre = ({ s, setsToWin, displayedRound, point, penaltyAttempt, suddenDeath, winnerTeam }) => {
    const total = roundTotal(s);
    if (s.banner) {
        if (s.banner.tie) return { tone: "final", top: "Final", big: "Draw", sub: `Best of ${setsToWin * 2 - 1}` };
        const won = Math.max(s.playerWonSets ?? 0, s.playerLostSets ?? 0);
        const lost = Math.min(s.playerWonSets ?? 0, s.playerLostSets ?? 0);
        return { tone: "gg", top: setsToWin > 1 ? `${won} - ${lost}` : `${s.roundWins} - ${s.roundLosses}`, big: "GG", sub: `Team ${winnerTeam?.name}`, team: winnerTeam };
    }
    if (s.tiebreakerPhase === "penalties") return { tone: "tiebreak", top: "Penalties", big: `Attempt ${penaltyAttempt}`, sub: suddenDeath ? "Sudden death" : null };
    if (s.tiebreakerPhase === "extended") return { tone: "tiebreak", top: "Tiebreaker", big: "Extended Rounds" };
    if (point) return { tone: "alert", top: point.label, big: `Round ${displayedRound}` };
    const extended = isPemExtendedRoundNow(s);
    return {
        tone: extended ? "extended" : "normal",
        top: extended ? "Extended Round" : getPemHalfIndex(s) === 0 ? "1st Half" : "2nd Half",
        big: `Round ${displayedRound}`,
        sub: `of ${total}`,
    };
};

export const PbsSets = ({ chips, bestOf, selectedIndex = null, onSelect = null }) => (
    <div className={`${css.hud} ${css.sets}`}>
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
                    style={{ "--set-color": chip.winnerTeam?.color ?? "transparent" }}
                >
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
                </Tag>
            );
        })}
    </div>
);

export function PbsScorebug({
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
    ready = true,
}) {
    const s = seriesState;
    const preview = useOtMorphPreview(s, MORPH_MS);
    const view = preview ? otPreviewState(s) : s;
    const roundShown = preview ? otPreviewRound(s) : displayedRound;
    const squaresShown = preview ? 10 : displayedMiniSquares;
    const freshRef = useRef(isFreshPemSeries(seriesState));
    const bannerAtMountRef = useRef(!!s.banner);
    const celebrate = !bannerAtMountRef.current;
    const isPens = s.tiebreakerPhase === "penalties";
    const winnerSide = s.banner && !s.banner.tie ? ((s.playerWonSets ?? 0) >= (s.playerLostSets ?? 0) ? "left" : "right") : null;
    const winnerTeam = winnerSide === "left" ? s.leftTeam : winnerSide === "right" ? s.rightTeam : null;
    const finaleFor = (side) => (winnerSide ? (winnerSide === side ? "won" : "lost") : null);
    const attempts = Math.max(penaltyAttempts ?? 0, s.penaltyLeftResults?.length ?? 0, s.penaltyRightResults?.length ?? 0);

    const rollKey = ready && s.tiebreakerPhase === "idle" && !s.banner && !s.pendingAction ? `set-${s.setNumber ?? 1}` : null;

    const streakOf = (side) => (s.tiebreakerPhase === "idle" && !s.banner && !preview ? s.liveStats?.[side]?.momentum ?? 0 : 0);

    const sideProps = (side) => {
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        return {
            rollKey,
            fresh: freshRef.current,
            cheat: isCheatTargeting(activeCheat, side),
            team,
            score: side === "left" ? s.roundWins ?? 0 : s.roundLosses ?? 0,
            setsTotal: setsToWin,
            setsLit: side === "left" ? s.playerWonSets ?? 0 : s.playerLostSets ?? 0,
            finale: finaleFor(side),
            celebrate,
            streak: streakOf(side),
        };
    };

    const segmentsFor = (side) => {
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        if (isPens) {
            const results = side === "left" ? s.penaltyLeftResults : s.penaltyRightResults;
            return <Segments kind="pens" side={side} total={attempts} results={results} nextIndex={!s.penaltyResolved && s.penaltyTurn === side ? results.length : null} />;
        }
        const lit = finalRoundMinis && !preview ? finalRoundMinis[side] : side === "left" ? view.miniWins ?? 0 : view.miniLosses ?? 0;
        return <Segments side={side} team={team} total={squaresShown} lit={lit} />;
    };

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
        tag = { key: "gg", top: "Wins the series", bottom: `Team ${winnerTeam?.name}`, team: winnerTeam };
    } else if (isPens && !s.penaltyResolved) {
        const side = s.penaltyTurn;
        tag = { key: `shoot-${side}`, top: side === "left" ? "◀ Shoots" : "Shoots ▶", bottom: `Team ${(side === "left" ? s.leftTeam : s.rightTeam)?.name}` };
    } else if (s.isOvertime && s.tiebreakerPhase === "idle" && !s.banner && s.pendingAction?.type !== "NEXT_OT") {
        const block = Math.max(1, s.overtimeBlock ?? 1);
        tag = { key: `ot-${block}`, top: pemOvertimeName(block), bottom: `First to ${overtimeToWin}` };
    }

    return (
        <div className={`${css.hud} ${entrance ? css.entrance : ""}`}>
            {setsToWin > 1 ? <PbsSets chips={buildPemSetChips(s)} bestOf={setsToWin * 2 - 1} /> : null}
            <div className={css.header}>
                <span className={`${css.tile} ${css.header_event}`}>
                    {eventName}
                    <span className={css.header_number}>{eventNumber}</span>
                </span>
                <span className={`${css.tile} ${css.header_trophy}`}>
                    <PemTrophy type={pemType} size={30} />
                </span>
                <span className={`${css.tile} ${css.header_stage}`} title={stageText}>{stageText}</span>
            </div>
            <PbsBar
                left={sideProps("left")}
                right={sideProps("right")}
                centre={liveCentre({ s: view, setsToWin, displayedRound: roundShown, point, penaltyAttempt, suddenDeath, winnerTeam })}
                alert={!!point}
                overlay={<Flips seriesState={s} setsToWin={setsToWin} />}
            />
            <div className={css.under}>
                <div className={`${css.under_side} ${winnerSide === "left" ? css.under_won : ""}`} style={underStyle(s.leftTeam)}>
                    {segmentsFor("left")}
                    <span className={css.streak}>
                        <PbsStreak value={streakOf("left")} />
                    </span>
                </div>
                <div className={`${css.under_centre} ${css.tag_slot}`}>
                    <AnimatePresence initial={false} custom={fromMorph}>
                        {tag ? (
                            <motion.span
                                key={tag.key}
                                className={`${css.tag} ${tag.team ? css.tag_gg : ""}`}
                                style={tag.team ? { background: tag.team.gradient, color: pemTextOn(tag.team.color) } : undefined}
                                variants={{
                                    hidden: { clipPath: "inset(0 0 100% 0)" },
                                    shown: { clipPath: "inset(0 0 0% 0)", transition: { duration: 0.3, ease: [0.7, 0, 0.3, 1] } },
                                    gone: (instant) => (instant ? { opacity: 0, transition: { duration: 0 } } : { clipPath: "inset(100% 0 0 0)", transition: { duration: 0.3, ease: [0.7, 0, 0.3, 1] } }),
                                }}
                                initial={morphTagRef.current === tag.key ? false : "hidden"}
                                animate="shown"
                                exit="gone"
                            >
                                <span className={css.tag_top}><Fit>{tag.top}</Fit></span>
                                <span className={css.tag_bottom}><Fit>{tag.bottom}</Fit></span>
                            </motion.span>
                        ) : null}
                    </AnimatePresence>
                </div>
                <div className={`${css.under_side} ${css.under_side_right} ${winnerSide === "right" ? css.under_won : ""}`} style={underStyle(s.rightTeam)}>
                    {segmentsFor("right")}
                    <span className={css.streak}>
                        <PbsStreak value={streakOf("right")} />
                    </span>
                </div>
            </div>
        </div>
    );
}

export const PbsRow = ({
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
            ? { tone: "final", top: "Final", big: "Draw" }
            : { tone: "gg", top: `Round ${roundNumber ?? ""}`.trim(), big: "GG", sub: `Team ${ggTeam?.name}`, team: ggTeam }
        : penalties
            ? { tone: "tiebreak", big: `${attempts} ${attempts === 1 ? "Attempt" : "Attempts"}` }
            : label
                ? { tone: "alert", top: label, big: `Round ${roundNumber}` }
                : {
                    tone: extended ? "extended" : "normal",
                    top: `Round ${roundNumber}`,
                    big: winner ? (
                        <span className={css.winner}>
                            {winnerSide === "left" ? <FaCaretLeft aria-hidden="true" /> : null}
                            {winner.name}
                            {winnerSide === "right" ? <FaCaretRight aria-hidden="true" /> : null}
                        </span>
                    ) : "",
                    sub: extended ? "Extended Round" : null,
                    onSubClick: extended?.onClick ?? null,
                };

    const glowFor = (side) => {
        const own = side === "left" ? leftGlow : rightGlow;
        const other = side === "left" ? rightGlow : leftGlow;
        return own ? "won" : finaleSide && other ? "lost" : null;
    };

    const sideProps = (side) => ({
        team: side === "left" ? leftTeam : rightTeam,
        score: side === "left" ? leftScore : rightScore,
        setsTotal: setLinesTotal,
        setsLit: side === "left" ? leftSets : rightSets,
        finale: finaleFor(side),
        celebrate: inView,
        result: (side === "left" ? leftGlow : rightGlow) ? "won" : (side === "left" ? rightGlow : leftGlow) ? "lost" : null,
        glow: glowFor(side),
        streak: (side === "left" ? leftMomentumStreak : rightMomentumStreak) ?? 0,
        animated: false,
    });

    const segmentsFor = (side) => {
        if (penalties) {
            return <Segments kind="pens" side={side} total={Math.max(penalties.attemptsToDisplay ?? 0, attempts)} results={(side === "left" ? penalties.leftResults : penalties.rightResults) ?? []} />;
        }
        if (squaresTotal > 0) return <Segments side={side} team={side === "left" ? leftTeam : rightTeam} total={squaresTotal} lit={side === "left" ? leftSquares : rightSquares} />;
        return <span className={css.segments} />;
    };

    return (
        <div ref={ref} className={css.row_wrap}>
            <div className={`${css.hud} ${css.row}`}>
                <PbsBar left={sideProps("left")} right={sideProps("right")} centre={centre} alert={!!label} />
                <div className={css.under}>
                    <div className={css.under_side} style={{ opacity: leftOpacity }}>
                        {segmentsFor("left")}
                        {leftMomentumStreak ? (
                            <span className={css.streak}>
                                <PbsStreak value={leftMomentumStreak} animated={false} />
                            </span>
                        ) : null}
                    </div>
                    <div className={css.under_centre} />
                    <div className={`${css.under_side} ${css.under_side_right}`} style={{ opacity: rightOpacity }}>
                        {segmentsFor("right")}
                        {rightMomentumStreak ? (
                            <span className={css.streak}>
                                <PbsStreak value={rightMomentumStreak} animated={false} />
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PbsBoard = ({
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
        ? { tone: "gg", big: "GG", sub: `Team ${ggTeam?.name}`, team: ggTeam }
        : roundsPlayed != null
            ? { tone: "normal", top: roundsLabel, big: roundsPlayed, sub: "Played" }
            : { tone: "tiebreak", top: "Tiebreaker", big: "ER", sub: "Extended Rounds" };
    const sideProps = (side) => ({
        team: side === "left" ? leftTeam : rightTeam,
        score: side === "left" ? leftScore : rightScore,
        setsTotal: setLinesTotal,
        setsLit: side === "left" ? leftSets : rightSets,
        result: (side === "left" ? leftGlow : rightGlow) ? "won" : (side === "left" ? rightGlow : leftGlow) ? "lost" : null,
        glow: (side === "left" ? leftGlow : rightGlow) ? "won" : null,
    });

    return (
        <div className={`${css.hud} ${css.board}`}>
            <PbsBar left={sideProps("left")} right={sideProps("right")} centre={centre} />
        </div>
    );
};

const GRID_COLS = 14;
const GRID_ROWS = 6;

export function PbsIntro({ seriesState, eventName, eventNumber, stageText, setsToWin, pemType, onDone }) {
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

    const ease = [0.22, 1, 0.36, 1];
    const tiles = Array.from({ length: GRID_ROWS * GRID_COLS }, (_, k) => {
        const i = k % GRID_COLS;
        const j = Math.floor(k / GRID_COLS);
        return { k, wave: i + j, flash: (i * 7 + j * 5) % 11 === 0 };
    });
    const letters = String(eventName ?? "").split("");

    return (
        <AnimatePresence onExitComplete={onDone}>
            {open ? (
                <motion.div
                    key="pbs-intro"
                    className={`${css.hud} ${css.intro}`}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.55 } }}
                    transition={{ duration: 0.15 }}
                >
                    <div className={css.intro_grid} aria-hidden="true">
                        {tiles.map(({ k, wave, flash }) => (
                            <motion.span
                                key={k}
                                className={`${css.intro_tile} ${flash ? css.intro_tile_flash : ""}`}
                                initial={{ rotateX: -90, opacity: 0 }}
                                animate={{ rotateX: 0, opacity: 1 }}
                                exit={{ rotateX: 90, opacity: 0, transition: { duration: 0.22, delay: (GRID_COLS + GRID_ROWS - wave) * 0.018 } }}
                                transition={{ duration: 0.3, delay: wave * 0.022, ease }}
                            />
                        ))}
                    </div>
                    <div className={css.intro_stage}>
                        <motion.div
                            className={css.intro_head}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.2, delay: 0.5 }}
                        >
                            <span className={css.intro_trophy}>
                                <PemTrophy type={pemType} size={40} />
                            </span>
                            <span className={css.intro_event}>
                                {letters.map((letter, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.01, delay: 0.55 + i * 0.03 }}
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                                <motion.span
                                    className={css.intro_cursor}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 1, 0, 1, 0] }}
                                    transition={{ duration: 1.4, delay: 0.55, times: [0, 0.05, 0.5, 0.6, 0.8, 1] }}
                                />
                                <motion.span
                                    className={css.header_number}
                                    initial={{ opacity: 0, scale: 0.6 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.25, delay: 0.6 + letters.length * 0.03, ease }}
                                >
                                    {eventNumber}
                                </motion.span>
                            </span>
                            <span className={css.intro_sub}>
                                {stageText} · Best of {setsToWin * 2 - 1}
                            </span>
                        </motion.div>
                        <div className={css.intro_teams}>
                            {["left", "right"].map((side) => {
                                const team = side === "left" ? seriesState.leftTeam : seriesState.rightTeam;
                                const from = side === "left" ? -420 : 420;
                                return (
                                    <motion.div
                                        key={side}
                                        className={`${css.intro_team} ${side === "right" ? css.intro_team_right : ""}`}
                                        style={{ "--team-gradient": team?.gradient ?? team?.color }}
                                        initial={{ x: from, opacity: 0 }}
                                        animate={{ x: [from, side === "left" ? 18 : -18, 0], opacity: 1 }}
                                        exit={{ x: from * 0.6, opacity: 0, transition: { duration: 0.25, ease: "easeIn" } }}
                                        transition={{ duration: 0.5, delay: 0.95, times: [0, 0.75, 1], ease }}
                                    >
                                        <span className={css.intro_edge} />
                                        <span className={css.intro_logo}>
                                            <PemCircle team={team} className={css.intro_circle} />
                                        </span>
                                        <span className={css.intro_name}>
                                            <span className={css.name_prefix}>Team</span>
                                            {team?.name}
                                        </span>
                                    </motion.div>
                                );
                            })}
                            <motion.span
                                className={css.intro_vs}
                                initial={{ opacity: 0, scale: 2.4 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.3, delay: 1.35, ease: [0.3, 1.5, 0.5, 1] }}
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
