import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FaCaretLeft, FaCaretRight, FaClock, FaCrown, FaFire, FaStar } from "react-icons/fa";
import { FaCheck, FaXmark } from "react-icons/fa6";
import css from "./Ess.module.css";
import pcss from "../../progress/Progress.module.css";
import { HudInsurance } from "../../progress/HudPerks.jsx";
import base from "../../SpecialModePage.module.css";
import { isCheatTargeting } from "../../logic/secretCheats.js";
import { readableOnDark, getBrightness } from "../../logic/colors.js";
import { PemCircle } from "./PemParts.jsx";
import { Fit } from "./PbsHud.jsx";
import {
    STINGER_MIN_MS,
    buildPemSetChips,
    getErStatus,
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
const BAR_W = 712;
const BAR_H = 56;
const TAG_TOP = BAR_H + 28;
const TAG_W = 220;
const TAG_H = 26;
const MORPH_MS = 480;
const ROUND_BANNER_MS = 2000;
const EXIT_SCALE = 0.43;
const FINALE_BANNER_MS = 3400;
const OT_TAG_CYCLE_MS = 2600;
const INTRO_MS = 3800;
const EASE = [0.22, 1, 0.36, 1];
const SWEEP = [0.7, 0, 0.3, 1];
const OT_FILL = "#f0a020";
const ER_FILL = "#3fb6c9";
const SPARKS = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2 + (i % 3) * 0.17;
    const d = 70 + ((i * 37) % 5) * 22;
    return { dx: `${Math.round(Math.cos(a) * d * 1.9)}px`, dy: `${Math.round(Math.sin(a) * d * 0.55)}px`, delay: `${820 + (i % 4) * 40}ms`, size: `${4 + (i % 3) * 2}px` };
});

const roundTotal = (s) => REGULATION_ROUNDS + (s.isOvertime ? Math.max(1, s.overtimeBlock ?? 1) * OT_ROUNDS : 0);

const teamVars = (team) => ({
    "--team-color": team?.color ?? "#8b909e",
    "--team-gradient": team?.gradient ?? team?.color ?? "#8b909e",
    "--team-text": pemTextOn(team?.color),
    "--ink-text": readableOnDark(team?.color ?? "#8b909e"),
    "--tick-edge": getBrightness(team?.color ?? "#8b909e") < 60 ? "rgba(255, 255, 255, 0.6)" : undefined,
});

const Stars = ({ total, lit }) => (
    <span className={css.stars} style={{ fontSize: total <= 3 ? 13 : total === 4 ? 11 : 9, gap: total <= 3 ? 4 : 2 }}>
        {Array.from({ length: Math.max(1, total) }, (_, i) => (
            <FaStar key={i} className={`${css.star} ${lit > i ? css.star_lit : ""}`} aria-hidden="true" />
        ))}
    </span>
);

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

const Ticks = ({ kind, side, team, total, lit = 0, results = [], nextIndex = null, opacity = 1 }) => (
    <span className={`${css.ticks} ${side === "right" ? css.ticks_right : ""} ${kind === "pens" ? css.ticks_pens : ""}`} style={{ opacity, ...teamVars(team) }}>
        {kind === "pens"
            ? getPemPenaltyWindow(results, total).map(({ index, result }) => <Pen key={index} result={result} next={index === nextIndex} />)
            : Array.from({ length: total }, (_, i) => <span key={i} className={`${css.tick} ${i < lit ? css.tick_lit : ""}`} />)}
    </span>
);

const Streak = ({ value, animated = true }) => {
    const level = Math.min(5, Math.max(0, value - STREAK_MIN));
    return (
        <AnimatePresence initial={false}>
            {value >= STREAK_MIN ? (
                <motion.span key="streak" className={css.streak_layer} style={{ "--lvl": level }} initial={animated ? { opacity: 0 } : false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                    <span className={css.heat} />
                    <span className={css.heat_lines} />
                    <span className={css.streak}>
                        <motion.span
                            key={value}
                            className={css.streak_num}
                            initial={animated ? { scale: 2.2, opacity: 0, rotate: -12 } : false}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ duration: 0.42, ease: [0.3, 1.5, 0.5, 1] }}
                        >
                            {value}
                        </motion.span>
                        <span className={css.streak_label}>
                            <FaFire aria-hidden="true" />
                            Streak
                        </span>
                    </span>
                </motion.span>
            ) : null}
        </AnimatePresence>
    );
};

const Tile = ({ side, team, finale = null, celebrate = false, result = null, cheat = false, streak = 0, animated = true }) => (
    <div
        className={`${css.tile} ${side === "right" ? css.tile_right : ""} ${finale ? css[`tile_${finale}`] : ""} ${finale ? (celebrate ? css.play : css.still) : ""}`}
        style={teamVars(team)}
    >
        <span className={css.tile_bg} aria-hidden="true">
            <PemCircle team={team} className={css.mark} />
            {finale ? null : <Streak value={streak} animated={animated} />}
            {finale === "won" ? <span className={css.tile_shine} /> : null}
        </span>
        <span className={css.tile_name}>
            {finale === "won" ? <FaCrown className={css.crown} aria-hidden="true" /> : null}
            <span key={finale ?? "live"} className={css.tile_name_text}>
                <Fit>{team?.name}</Fit>
            </span>
        </span>
        {result ? (
            <span className={`${css.result} ${css[`result_${result}`]}`}>{result === "won" ? <FaCheck aria-hidden="true" /> : <FaXmark aria-hidden="true" />}</span>
        ) : null}
        {cheat ? <span className={`${base.cheat_indicator} ${css.cheat}`} aria-hidden="true" /> : null}
    </div>
);

const Score = ({ value, animated = true }) => (
    <span className={css.score_box}>
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
                key={value}
                className={css.score}
                initial={animated ? { y: "-70%", opacity: 0 } : false}
                animate={{ y: "0%", opacity: 1 }}
                exit={animated ? { y: "70%", opacity: 0 } : undefined}
                transition={{ duration: 0.3, ease: EASE }}
            >
                {value}
            </motion.span>
        </AnimatePresence>
    </span>
);

const Mid = ({ tone, big, bigKey = null, small, onSmallClick = null }) => (
    <span className={`${css.mid} ${css[`mid_${tone}`] ?? ""}`}>
        <motion.span
            key={`${tone}-${bigKey ?? (typeof big === "string" || typeof big === "number" ? big : "node")}`}
            className={css.mid_big}
            initial={tone === "gg" ? { opacity: 0, scale: 2.2 } : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: tone === "gg" ? 0.45 : 0.22, ease: EASE }}
        >
            <Fit>{big}</Fit>
        </motion.span>
        {small ? (
            onSmallClick ? (
                <button type="button" className={`${css.mid_small} ${css.mid_link}`} onClick={onSmallClick} title="Show this round in the Extended Rounds">
                    {small}
                </button>
            ) : (
                <span className={css.mid_small}>{small}</span>
            )
        ) : null}
    </span>
);

export const EssBar = ({ left, right, centre, setsTotal = 0, alert = false, className = "", children = null }) => (
    <div className={`${css.bar_wrap} ${className}`}>
        <div className={`${css.bar} ${alert ? css.bar_alert : ""}`}>
            <Tile side="left" {...left} />
            <span className={css.sep} style={teamVars(left.team)} />
            <div className={css.centre}>
                {setsTotal > 0 ? <Stars total={setsTotal} lit={left.sets ?? 0} /> : <span className={css.stars} />}
                <Score value={left.score} animated={left.animated !== false} />
                <Mid {...centre} />
                <Score value={right.score} animated={right.animated !== false} />
                {setsTotal > 0 ? <Stars total={setsTotal} lit={right.sets ?? 0} /> : <span className={css.stars} />}
            </div>
            <span className={css.sep} style={teamVars(right.team)} />
            <Tile side="right" {...right} />
            {["left", "right"].map((side) => {
                const glow = (side === "left" ? left : right).glow;
                const other = (side === "left" ? right : left).glow;
                return glow ? <span key={side} className={`${css.halo} ${css[`halo_${side}`]} ${css[`halo_${glow}`]} ${other ? "" : css.halo_closed}`} aria-hidden="true" /> : null;
            })}
        </div>
        {children}
    </div>
);

const OtTag = ({ block, toWin }) => {
    const [flip, setFlip] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setFlip((f) => !f), OT_TAG_CYCLE_MS);
        return () => clearInterval(timer);
    }, []);

    return (
        <span className={css.ot_flip}>
            <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                    key={flip ? "to" : "name"}
                    className={css.ot_line}
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: 90, opacity: 0 }}
                    transition={{ duration: 0.32, ease: EASE }}
                >
                    {flip ? `First to ${toWin}` : pemOvertimeName(block)}
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

const Under = ({ left, right, tag, morphKey = null }) => (
    <div className={css.under}>
        <div className={css.ticks_row}>
            {left}
            <span />
            {right}
        </div>
        <span className={css.tag_slot} data-tag-slot="">
            <AnimatePresence initial={false} custom={morphKey != null && morphKey === tag?.key}>
                {tag ? (
                    <motion.span
                        key={tag.key}
                        className={`${css.tag} ${css[`tag_${tag.tone}`] ?? ""}`}
                        style={tag.team ? teamVars(tag.team) : undefined}
                        variants={{
                            hidden: { y: "-110%", opacity: 0 },
                            shown: { y: "0%", opacity: 1, transition: { duration: 0.3, delay: tag.delay ?? 0, ease: EASE } },
                            gone: (instant) => (instant ? { opacity: 0, transition: { duration: 0 } } : { y: "110%", opacity: 0, transition: { duration: 0.22, ease: "easeIn" } }),
                        }}
                        initial={morphKey === tag.key ? false : "hidden"}
                        animate="shown"
                        exit="gone"
                    >
                        <span className={css.tag_text}>{tag.node ?? <Fit>{tag.text}</Fit>}</span>
                    </motion.span>
                ) : null}
            </AnimatePresence>
        </span>
    </div>
);

const Emblem = ({ team = null, icon = null }) => (
    <span className={css.bn_emblem} style={team ? teamVars(team) : undefined}>
        <span className={css.bn_grow}>
            {team ? <PemCircle team={team} className={css.bn_circle} /> : <span className={css.bn_icon}>{icon}</span>}
            <span className={css.bn_dim} aria-hidden="true" />
            {team ? <span className={css.bn_ring} aria-hidden="true" /> : null}
            {team ? <span className={css.bn_flash} aria-hidden="true" /> : null}
        </span>
    </span>
);

const Word = ({ text, right = false }) => (
    <span className={`${css.bn_word} ${right ? css.bn_word_right : ""}`}>
        <span className={css.bn_ghost}>{text}</span>
        <span className={css.bn_lit}>{text}</span>
    </span>
);

const BannerFace = ({ left, right, team = null, icon = null, sub = null }) => (
    <motion.span className={css.bn_face} data-face="" variants={{ gone: { opacity: 0, transition: { duration: 0.18 } } }}>
        <Word text={left} />
        <Emblem team={team} icon={icon} />
        <Word text={right} right />
        {sub ? <span className={css.bn_sub}>{sub}</span> : null}
    </motion.span>
);

const bannerExit = (side) => ({
    gone: (fast) => ({
        opacity: 0,
        x: side === "right" ? 24 : side === "left" ? -24 : 0,
        transition: { duration: fast ? 0.16 : 0.32, ease: "easeIn" },
    }),
});

const roundGambleKey = (s) => `${s.miniWins ?? 0}|${s.miniLosses ?? 0}|${s.lastMultiplierLeft ?? ""}|${s.lastMultiplierRight ?? ""}|${s.roundNumber ?? 0}`;

const RoundBanners = ({ s, disabled }) => {
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const rw = s.roundWins ?? 0;
    const rl = s.roundLosses ?? 0;
    const gamble = roundGambleKey(s);
    const prevRef = useRef([rw, rl, gamble]);
    const timerRef = useRef(null);
    const frameRef = useRef(null);

    const hide = (el, quick) => {
        if (!el || el.dataset.state !== "on") return;
        el.dataset.state = "out";
        const k = quick ? 0.55 : 1;
        const face = el.querySelector("[data-face]");
        const bars = [...el.children].filter((c) => c !== face);
        const anims = [
            face?.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.9)" }], { duration: 240 * k, easing: "cubic-bezier(0.4, 0, 0.6, 1)", fill: "forwards" }),
            ...bars.map((bar) => bar.animate([{ transform: "scaleX(1)" }, { transform: `scaleX(${EXIT_SCALE})` }], { duration: 300 * k, easing: "cubic-bezier(0.35, 0.1, 0.4, 1)", fill: "forwards" })),
            el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360 * k, delay: 90 * k, easing: "cubic-bezier(0.4, 0, 0.6, 1)", fill: "forwards" }),
        ].filter(Boolean);
        anims[anims.length - 1].onfinish = () => {
            if (el.dataset.state !== "out") return;
            el.dataset.state = "off";
            anims.forEach((x) => x.cancel());
        };
    };

    const stop = (quick) => {
        clearTimeout(timerRef.current);
        if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        hide(leftRef.current, quick);
        hide(rightRef.current, quick);
    };

    const show = (side) => {
        const el = side === "left" ? leftRef.current : rightRef.current;
        if (!el) return;
        el.getAnimations({ subtree: true }).forEach((a) => {
            if (a instanceof CSSAnimation) return;
            a.cancel();
        });
        if (el.dataset.state !== "off") {
            el.dataset.state = "off";
            void el.offsetWidth;
        }
        el.dataset.state = "on";
        timerRef.current = setTimeout(() => hide(el, false), ROUND_BANNER_MS);
    };

    useEffect(() => {
        const [pw, pl, pg] = prevRef.current;
        prevRef.current = [rw, rl, gamble];
        const side = rw === pw + 1 && rl === pl ? "left" : rl === pl + 1 && rw === pw ? "right" : null;
        if (side && !disabled && !s.banner && s.tiebreakerPhase === "idle" && !s.pendingAction) {
            stop(true);
            frameRef.current = requestAnimationFrame(() => {
                frameRef.current = requestAnimationFrame(() => {
                    frameRef.current = null;
                    show(side);
                });
            });
            return undefined;
        }
        if (rw !== pw || rl !== pl || gamble !== pg || disabled) stop(true);
        return undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rw, rl, gamble, disabled]);

    useEffect(() => () => {
        clearTimeout(timerRef.current);
        if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    }, []);

    return ["left", "right"].map((side) => {
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        return (
            <span key={side} ref={side === "left" ? leftRef : rightRef} data-state="off" className={css.bn} style={{ ...teamVars(team), "--ink": team?.color }} aria-hidden="true">
                <span className={css.bn_flood} />
                <span className={css.bn_bg} />
                <BannerFace left="Round" right="Winner" team={team} />
            </span>
        );
    });
};

const eclCue = (s, setsToWin) => {
    const total = setsToWin * 2 - 1;
    const set = s.setNumber ?? 1;
    const rw = s.roundWins ?? 0;
    const rl = s.roundLosses ?? 0;
    const block = s.isOvertime ? Math.max(0, s.overtimeBlock ?? 0) : 0;

    if (s.tiebreakerPhase === "extended" || s.pendingAction?.type === "START_EXTENDED") {
        return { key: `er-${set}`, ink: ER_FILL, left: "Extended", right: "Rounds", icon: <FaStar aria-hidden="true" />, sub: `Still ${rw}-${rl} · First to 4` };
    }
    const action = s.pendingAction;
    if (!action) return null;
    if (action.type === "NEXT_SET" || action.type === "NEXT_SET_AFTER_PENALTIES") {
        const pens = action.type === "NEXT_SET_AFTER_PENALTIES";
        const leftWon = pens ? (s.penaltyLeftScore ?? 0) > (s.penaltyRightScore ?? 0) : rw >= rl;
        const winner = leftWon ? s.leftTeam : s.rightTeam;
        const score = pens ? `${s.penaltyLeftScore ?? 0}-${s.penaltyRightScore ?? 0} pens` : `${rw}-${rl}`;
        return { key: action.executeAt, team: winner, ink: winner?.color, left: pemSetLabel(set, total), right: "Winner", sub: `${score} · Next: ${pemSetLabel(set + 1, total)}` };
    }
    if (action.type === "NEXT_OT") {
        return {
            key: action.executeAt,
            ot: true,
            ink: OT_FILL,
            left: "Overtime",
            right: `First to ${16 + block * 3}`,
            icon: <FaClock aria-hidden="true" />,
            tag: pemOvertimeName(block + 1),
        };
    }
    return null;
};

const panelVariants = {
    shown: { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 },
    morph: (target) => ({
        x: target?.x ?? (BAR_W - TAG_W) / 2,
        y: target?.y ?? TAG_TOP,
        scaleX: TAG_W / BAR_W,
        scaleY: TAG_H / BAR_H,
        opacity: 1,
        transition: { duration: 0.36, delay: 0.08, ease: SWEEP },
    }),
    gone: (instant) => (instant ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scaleY: 0.82, transition: { duration: 0.26, ease: "easeIn" } }),
};

const amberVariants = {
    shown: { opacity: 0 },
    morph: { opacity: 1, transition: { duration: 0.12, delay: 0.08 } },
    gone: { opacity: 0 },
};

const layerVariants = (visibleIn) => ({
    shown: { opacity: visibleIn === "shown" ? 1 : 0 },
    morph: visibleIn === "morph" ? { opacity: 1, transition: { duration: 0.12, delay: 0.3 } } : { opacity: 0, transition: { duration: 0.1 } },
    gone: { opacity: visibleIn === "morph" ? 1 : 0 },
});

const Panel = ({ seriesState, setsToWin }) => {
    const action = seriesState.pendingAction;
    const [timed, setTimed] = useState(null);
    const [morphAt, setMorphAt] = useState(null);
    const [target, setTarget] = useState(null);
    const panelRef = useRef(null);
    const lastOtRef = useRef(false);

    const beginMorph = (at) => {
        const panel = panelRef.current;
        const slot = panel?.parentElement?.querySelector("[data-tag-slot]");
        if (panel && slot) {
            const a = panel.parentElement.getBoundingClientRect();
            const b = slot.getBoundingClientRect();
            setTarget({ x: b.left - a.left, y: b.top - a.top });
        }
        setMorphAt(at);
    };

    useEffect(() => {
        if (!action?.executeAt) return undefined;
        const remaining = action.executeAt - Date.now();
        const cue = eclCue(seriesState, setsToWin);
        if (!cue || remaining < STINGER_MIN_MS) return undefined;
        const at = action.executeAt;
        setTimed({ ...cue, at });
        const timer = setTimeout(() => setTimed(null), remaining);
        const morphTimer = cue.ot ? setTimeout(() => beginMorph(at), Math.max(0, remaining - MORPH_MS)) : null;
        return () => {
            clearTimeout(timer);
            clearTimeout(morphTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action?.executeAt]);

    const extended = seriesState.tiebreakerPhase === "extended" ? eclCue(seriesState, setsToWin) : null;
    const shown = (timed && action?.executeAt === timed.at ? timed : null) ?? extended;
    if (shown) lastOtRef.current = !!shown.ot;
    const morphing = !!shown?.ot && morphAt === shown.at;

    return (
        <AnimatePresence custom={lastOtRef.current}>
            {shown ? (
                <motion.div
                    key={shown.key}
                    ref={panelRef}
                    custom={target}
                    className={css.panel}
                    style={{ ...(shown.team ? teamVars(shown.team) : null), "--ink": shown.ink, "--team-color": shown.ink, originX: 0, originY: 0 }}
                    aria-hidden="true"
                    variants={panelVariants}
                    initial="shown"
                    animate={morphing ? "morph" : "shown"}
                    exit="gone"
                >
                    <motion.span className={css.panel_main} variants={layerVariants("shown")}>
                        <span className={css.bn_flood} aria-hidden="true" />
                        <span className={css.bn_bg} aria-hidden="true" />
                        <BannerFace left={shown.left} right={shown.right} team={shown.team} icon={shown.icon} sub={shown.sub} />
                    </motion.span>
                    <motion.span className={css.panel_amber} variants={amberVariants} />
                    {shown.tag ? (
                        <motion.span className={css.panel_tag} style={{ width: TAG_W, height: TAG_H, scaleX: BAR_W / TAG_W, scaleY: BAR_H / TAG_H, originX: 0, originY: 0 }} variants={layerVariants("morph")}>
                            <Fit>{shown.tag}</Fit>
                        </motion.span>
                    ) : null}
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

const letters = (word, from) =>
    String(word)
        .split("")
        .map((ch, i) => (
            <span key={i} className={css.fn_char} style={{ animationDelay: `${from + i * 45}ms` }}>
                {ch}
            </span>
        ));

const FinaleBanner = ({ s, winnerTeam, winnerSide, celebrate }) => {
    const [open, setOpen] = useState(celebrate);

    useEffect(() => {
        if (!open) return undefined;
        const timer = setTimeout(() => setOpen(false), FINALE_BANNER_MS);
        return () => clearTimeout(timer);
    }, [open]);

    return (
        <AnimatePresence>
            {open && s.banner && !s.banner.tie ? (
                <motion.span
                    key="finale"
                    className={`${css.fn} ${winnerSide === "right" ? css.fn_right : ""}`}
                    style={{ ...teamVars(winnerTeam), "--ink": winnerTeam?.color }}
                    variants={bannerExit(winnerSide)}
                    initial={false}
                    exit="gone"
                >
                    <span className={css.fn_flood} aria-hidden="true" />
                    <span className={css.fn_flash} aria-hidden="true" />
                    <span className={css.fn_bg} aria-hidden="true" />
                    <span className={css.fn_beam} aria-hidden="true" />
                    <span className={css.fn_face}>
                        <span className={css.fn_word}>{letters("Match", 420)}</span>
                        <span className={css.fn_emblem}>
                            <span className={css.fn_ring} aria-hidden="true" />
                            <span className={`${css.fn_ring} ${css.fn_ring_2}`} aria-hidden="true" />
                            <PemCircle team={winnerTeam} className={css.fn_circle} />
                            {SPARKS.map((p, i) => (
                                <span key={i} className={css.fn_spark} style={{ "--dx": p.dx, "--dy": p.dy, "--d": p.delay, width: p.size, height: p.size }} aria-hidden="true" />
                            ))}
                        </span>
                        <span className={css.fn_word}>{letters("Winner", 640)}</span>
                    </span>
                    <span className={css.fn_name}>
                        <FaCrown aria-hidden="true" />
                        Team {winnerTeam?.name}
                    </span>
                </motion.span>
            ) : null}
        </AnimatePresence>
    );
};

const liveMid = ({ s, displayedRound, point, penaltyAttempt, suddenDeath }) => {
    if (s.banner) return s.banner.tie ? { tone: "final", big: "Draw" } : { tone: "gg", big: "GG" };
    if (s.tiebreakerPhase === "penalties") return { tone: suddenDeath ? "alert" : "tiebreak", big: `Attempt ${penaltyAttempt}`, small: suddenDeath ? "Sudden death" : "Penalties" };
    if (s.tiebreakerPhase === "extended") return { tone: "tiebreak", big: "Extended", small: "Rounds" };
    if (point) return { tone: "alert", big: `Round ${displayedRound}`, bigKey: `r${displayedRound}`, small: point.label };
    const extended = isPemExtendedRoundNow(s);
    return { tone: extended ? "extended" : "normal", big: `Round ${displayedRound}`, bigKey: `r${displayedRound}`, small: extended ? "Extended round" : `of ${roundTotal(s)}` };
};

export const EssSets = ({ chips, bestOf, selectedIndex = null, onSelect = null, extra = null }) => (
    <div className={`${css.hud} ${css.sets_wrap}`}>
        <div className={`${css.sets} ${extra ? pcss.hud_anchor : ""}`}>
            {extra}
            <span className={`${css.set} ${css.set_bo}`}>Bo{bestOf}</span>
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
                        <span className={css.set_label}>{chip.label === "DEC" ? "Decider" : `Set ${chip.set}`}</span>
                        {chip.result ? (
                            <span className={css.set_value}>
                                {chip.result.leftScore}-{chip.result.rightScore}
                                {chip.result.extra ? <span className={css.set_extra}>{chip.result.extra.label} {chip.result.extra.left}-{chip.result.extra.right}</span> : null}
                            </span>
                        ) : chip.status === "current" ? (
                            <span className={css.set_value}>Live</span>
                        ) : null}
                    </Tag>
                );
            })}
        </div>
    </div>
);

const Top = ({ eventName, eventNumber, stageText, mark, trophy }) => (
    <div className={css.top}>
        <span className={css.top_plate}>
            <span className={css.top_mark}>{mark}</span>
            {trophy ? <span className={css.top_trophy}>{trophy}</span> : null}
            <span className={css.top_event}>{eventName}</span>
            <span className={css.top_number}>{eventNumber}</span>
        </span>
        {stageText ? (
            <span className={css.top_stage} title={stageText}>
                {stageText}
            </span>
        ) : null}
    </div>
);

export function EssScorebug({
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
    mark = "ECL",
    trophy = null,
    lite = false,
}) {
    const s = seriesState;
    const preview = useOtMorphPreview(s, MORPH_MS);
    const view = preview ? otPreviewState(s) : s;
    const roundShown = preview ? otPreviewRound(s) : displayedRound;
    const ticksShown = preview ? 10 : displayedMiniSquares;
    const bannerAtMountRef = useRef(!!s.banner);
    const celebrate = !bannerAtMountRef.current;
    const isPens = s.tiebreakerPhase === "penalties";
    const winnerSide = s.banner && !s.banner.tie ? ((s.playerWonSets ?? 0) >= (s.playerLostSets ?? 0) ? "left" : "right") : null;
    const winnerTeam = winnerSide === "left" ? s.leftTeam : winnerSide === "right" ? s.rightTeam : null;
    const finaleFor = (side) => (winnerSide ? (winnerSide === side ? "won" : "lost") : null);
    const attempts = Math.max(penaltyAttempts ?? 0, s.penaltyLeftResults?.length ?? 0, s.penaltyRightResults?.length ?? 0);

    const ticksFor = (side) => {
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        if (isPens) {
            const results = (side === "left" ? s.penaltyLeftResults : s.penaltyRightResults) ?? [];
            return <Ticks kind="pens" side={side} team={team} total={attempts} results={results} nextIndex={!s.penaltyResolved && s.penaltyTurn === side ? results.length : null} />;
        }
        const lit = finalRoundMinis && !preview ? finalRoundMinis[side] : side === "left" ? view.miniWins ?? 0 : view.miniLosses ?? 0;
        return <Ticks side={side} team={team} total={ticksShown} lit={lit} />;
    };

    const sideProps = (side) => ({
        team: side === "left" ? s.leftTeam : s.rightTeam,
        score: side === "left" ? s.roundWins ?? 0 : s.roundLosses ?? 0,
        sets: side === "left" ? s.playerWonSets ?? 0 : s.playerLostSets ?? 0,
        streak: s.tiebreakerPhase === "idle" && !s.banner && !preview ? s.liveStats?.[side]?.momentum ?? 0 : 0,
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
        if (lite) tag = { key: "gg", tone: "gg", text: `Team ${winnerTeam?.name} wins the series`, team: winnerTeam, delay: celebrate ? 0.5 : 0 };
    } else if (s.banner) {
        tag = { key: "draw", tone: "plain", text: "Series drawn" };
    } else if (isPens && !s.penaltyResolved) {
        const side = s.penaltyTurn;
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        tag = { key: `shoot-${side}`, tone: "shoot", text: side === "left" ? `◀ ${team?.name} shoots` : `${team?.name} shoots ▶`, team };
    } else if (s.isOvertime && s.tiebreakerPhase === "idle" && s.pendingAction?.type !== "NEXT_OT") {
        const block = Math.max(1, s.overtimeBlock ?? 1);
        tag = { key: `ot-${block}`, tone: "ot", node: <OtTag block={block} toWin={overtimeToWin} /> };
    }

    return (
        <div className={`${css.hud} ${entrance ? css.entrance : ""} ${lite ? css.lite : ""}`}>
            <Top eventName={eventName} eventNumber={eventNumber} stageText={stageText} mark={mark} trophy={trophy} />
            {setsToWin > 1 ? <EssSets chips={buildPemSetChips(s)} bestOf={setsToWin * 2 - 1} extra={<HudInsurance variant="ess" hud={css} seriesState={s} />} /> : null}
            <EssBar
                left={sideProps("left")}
                right={sideProps("right")}
                centre={liveMid({ s: view, displayedRound: roundShown, point, penaltyAttempt, suddenDeath })}
                setsTotal={setsToWin}
                alert={!!point}
                className={css.bar_wrap_live}
            >
                <Under left={ticksFor("left")} right={ticksFor("right")} tag={tag} morphKey={morphTagRef.current} />
                {lite ? null : <RoundBanners s={s} disabled={preview || !!s.banner} />}
                <Panel seriesState={s} setsToWin={setsToWin} />
                {s.banner && !lite ? <FinaleBanner s={s} winnerTeam={winnerTeam} winnerSide={winnerSide} celebrate={celebrate} /> : null}
            </EssBar>
        </div>
    );
}

export const EssRow = ({
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
            ? { tone: "final", big: "Draw" }
            : { tone: "gg", big: "GG", small: `Round ${roundNumber ?? ""}`.trim() }
        : penalties
            ? { tone: "tiebreak", big: `${attempts} ${attempts === 1 ? "Attempt" : "Attempts"}`, small: "Penalties" }
            : {
                tone: label ? "alert" : extended ? "extended" : "normal",
                big: `Round ${roundNumber}`,
                small: label || (extended ? "Extended round" : null),
                onSmallClick: !label && extended?.onClick ? extended.onClick : null,
            };

    const tag = ggBanner && !ggBanner.tie
        ? { key: "gg", tone: "gg", text: `Team ${ggTeam?.name} wins the series`, team: ggTeam }
        : penalties
            ? { key: "pens", tone: "plain", text: "Penalties" }
            : winner
                ? {
                    key: "winner",
                    tone: "winner",
                    team: winner,
                    node: (
                        <span className={css.tag_winner}>
                            {winnerSide === "left" ? <FaCaretLeft aria-hidden="true" /> : null}
                            Round winner: {winner.name}
                            {winnerSide === "right" ? <FaCaretRight aria-hidden="true" /> : null}
                        </span>
                    ),
                }
                : null;

    const glowFor = (side) => {
        const own = side === "left" ? leftGlow : rightGlow;
        const other = side === "left" ? rightGlow : leftGlow;
        return own ? "won" : finaleSide && other ? "lost" : null;
    };

    const ticksFor = (side) => {
        const opacity = side === "left" ? leftOpacity : rightOpacity;
        const team = side === "left" ? leftTeam : rightTeam;
        if (penalties) {
            return (
                <Ticks
                    kind="pens"
                    side={side}
                    team={team}
                    total={Math.max(penalties.attemptsToDisplay ?? 0, attempts)}
                    results={(side === "left" ? penalties.leftResults : penalties.rightResults) ?? []}
                    opacity={opacity}
                />
            );
        }
        return <Ticks side={side} team={team} total={squaresTotal} lit={side === "left" ? leftSquares : rightSquares} opacity={opacity} />;
    };

    const sideProps = (side) => ({
        team: side === "left" ? leftTeam : rightTeam,
        score: side === "left" ? leftScore : rightScore,
        sets: side === "left" ? leftSets : rightSets,
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
                <EssBar left={sideProps("left")} right={sideProps("right")} centre={centre} setsTotal={setLinesTotal} alert={!!label}>
                    <Under left={ticksFor("left")} right={ticksFor("right")} tag={tag} morphKey={tag?.key ?? null} />
                </EssBar>
            </div>
        </div>
    );
};

export const EssBoard = ({
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
    const centre = ggBanner
        ? { tone: "gg", big: "GG" }
        : roundsPlayed != null
            ? { tone: "normal", big: roundsPlayed, small: `${roundsLabel} played` }
            : { tone: "tiebreak", big: "ER", small: "Extended Rounds" };
    const sideProps = (side) => ({
        team: side === "left" ? leftTeam : rightTeam,
        score: side === "left" ? leftScore : rightScore,
        sets: side === "left" ? leftSets : rightSets,
        result: (side === "left" ? leftGlow : rightGlow) ? "won" : (side === "left" ? rightGlow : leftGlow) ? "lost" : null,
        glow: (side === "left" ? leftGlow : rightGlow) ? "won" : null,
        animated: false,
    });

    return (
        <div className={`${css.hud} ${css.board}`}>
            <EssBar left={sideProps("left")} right={sideProps("right")} centre={centre} setsTotal={setLinesTotal} />
        </div>
    );
};

const ErCard = ({ round, index, revealed, next, faded, clinch, leftTeam, rightTeam }) => {
    const team = round.winner === "left" ? leftTeam : rightTeam;
    return (
        <div className={css.er_slot}>
            <span className={css.er_label}>{round.label}</span>
            <div className={`${css.er_card} ${next ? css.er_next : ""}`}>
                <AnimatePresence initial={false}>
                    {revealed ? (
                        <motion.span
                            key="face"
                            className={`${css.er_face} ${round.winner === "right" ? css.er_face_right : ""} ${clinch ? css.er_clinch : ""}`}
                            style={teamVars(team)}
                            initial={{ scale: 0.86, opacity: 0 }}
                            animate={{ scale: 1, opacity: faded ? 0.38 : 1 }}
                            transition={{ scale: { duration: 0.42, ease: EASE }, opacity: { duration: faded ? 0.6 : 0.25, delay: faded ? 0.4 : 0 } }}
                        >
                            <span className={css.er_flood} />
                            <PemCircle team={team} className={css.er_mark} />
                            <span className={css.er_side}>{round.winner === "left" ? <FaCaretLeft aria-hidden="true" /> : <FaCaretRight aria-hidden="true" />}</span>
                            <span className={css.er_name}>
                                <Fit>{team?.name}</Fit>
                            </span>
                            {round.miniLeft != null && round.miniRight != null ? (
                                <span className={css.er_minis}>
                                    {round.miniLeft}:{round.miniRight}
                                </span>
                            ) : null}
                            {clinch ? <span className={css.er_clinch_tag}>Clinched</span> : null}
                        </motion.span>
                    ) : (
                        <motion.span key="back" className={css.er_back} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
                            <span className={css.er_q}>{index + 1}</span>
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            <motion.span className={css.er_tally} initial={false} animate={{ opacity: revealed ? 1 : 0.25 }}>
                <span style={{ color: leftTeam?.color }}>{revealed ? round.tallyLeft : "-"}</span>
                <span className={css.er_tally_sep}>:</span>
                <span style={{ color: rightTeam?.color }}>{revealed ? round.tallyRight : "-"}</span>
            </motion.span>
        </div>
    );
};

export const EssExtendedRoundsOverlay = ({ seriesState, details, setsToWin, eventName, eventNumber, mark = "ECL" }) => {
    const {
        leftTeam,
        rightTeam,
        roundWins,
        roundLosses,
        extRoundLeftScore: leftScore,
        extRoundRightScore: rightScore,
        extRoundRevealIndex: revealIndex,
        extRoundCommentaryShown: introShown,
        banner,
    } = seriesState;
    const total = details.rounds.length;
    const allRevealed = revealIndex >= total;
    const decided = allRevealed && leftScore !== rightScore ? (leftScore > rightScore ? "left" : "right") : null;
    const revealedCount = introShown ? revealIndex : 0;
    const status = getErStatus({
        rounds: details.rounds,
        revealIndex,
        introShown,
        resolved: seriesState.tiebreakerBigSymbol === "=" || !!banner || seriesState.playerWonSets + seriesState.playerLostSets >= seriesState.setNumber,
        leftScore,
        rightScore,
        leftTeam,
        rightTeam,
        setNumber: seriesState.setNumber,
        setsToWin,
        seriesOver: !!banner,
    });

    const side = (team, score, s) => ({ team, score, sets: score, glow: decided ? (decided === s ? "won" : "lost") : null, finale: null });

    return (
        <motion.div className={`${css.hud} ${css.er_overlay}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <span className={css.er_grid} aria-hidden="true">
                <span className={css.floor_lines} />
            </span>
            <motion.div className={css.er_panel} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <div className={css.er_head}>
                    <span className={css.top_mark}>{mark}</span>
                    <span className={css.er_title}>Extended Rounds</span>
                    <span className={css.er_head_sub}>
                        {eventName} {eventNumber} · Still {roundWins}-{roundLosses} after Quadruple Overtime · First to 4
                    </span>
                </div>
                <EssBar
                    left={side(leftTeam, leftScore, "left")}
                    right={side(rightTeam, rightScore, "right")}
                    centre={{ tone: "tiebreak", big: `${revealedCount} / ${total}`, bigKey: `c${revealedCount}`, small: "Compared" }}
                    setsTotal={4}
                />
                <div className={css.er_track}>
                    {details.rounds.map((round, i) => {
                        const revealed = i < revealedCount && !!round.winner;
                        return (
                            <ErCard
                                key={round.label}
                                round={round}
                                index={i}
                                revealed={revealed}
                                next={!revealed && i === revealedCount && introShown}
                                faded={revealed && !!decided && round.winner !== decided}
                                clinch={revealed && details.clinchIndex === i}
                                leftTeam={leftTeam}
                                rightTeam={rightTeam}
                            />
                        );
                    })}
                </div>
                <div className={css.er_status_slot} aria-live="polite">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={status.key}
                            className={css.er_status}
                            style={status.team ? teamVars(status.team) : { "--team-color": ER_FILL }}
                            initial={{ opacity: 0, x: -24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 24 }}
                            transition={{ duration: 0.3, ease: SWEEP }}
                        >
                            <span className={css.er_status_label}>{status.label}</span>
                            <span className={css.er_status_text}>{status.text}</span>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export function EssIntro({ seriesState, eventName, eventNumber, stageText, setsToWin, onDone, mark = "ECL" }) {
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
    const words = String(eventName ?? "").split(" ");

    return (
        <AnimatePresence onExitComplete={onDone}>
            {open ? (
                <motion.div
                    key="ess-intro"
                    className={`${css.hud} ${css.intro}`}
                    style={{ "--left-color": left?.color ?? "#3fb6c9", "--right-color": right?.color ?? "#e2353f" }}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.35 } }}
                    transition={{ duration: 0.25 }}
                >
                    <span className={css.intro_floor} aria-hidden="true">
                        <span className={css.floor_lines} />
                    </span>
                    <span className={`${css.intro_glow} ${css.intro_glow_left}`} aria-hidden="true" />
                    <span className={`${css.intro_glow} ${css.intro_glow_right}`} aria-hidden="true" />
                    <span className={css.intro_sweep} aria-hidden="true" />
                    <div className={css.intro_stage}>
                        <motion.span className={css.intro_kicker} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                            <span className={css.top_mark}>{mark}</span>
                            <span className={css.top_number}>{eventNumber}</span>
                        </motion.span>
                        <motion.span className={css.intro_title} exit={{ opacity: 0, y: -20, transition: { duration: 0.25, ease: "easeIn" } }}>
                            {words.map((w, wi) => (
                                <span key={wi} className={css.intro_word}>
                                    {w.split("").map((ch, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
                                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                            transition={{ duration: 0.45, delay: 0.25 + (wi * 6 + i) * 0.03, ease: EASE }}
                                        >
                                            {ch}
                                        </motion.span>
                                    ))}
                                </span>
                            ))}
                        </motion.span>
                        <motion.span className={css.intro_rule} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} transition={{ duration: 0.6, delay: 0.75, ease: SWEEP }} />
                        <motion.span className={css.intro_sub} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 1.0 }}>
                            {stageText} · Best of {setsToWin * 2 - 1}
                        </motion.span>
                        <div className={css.intro_teams}>
                            {[
                                ["left", left],
                                ["right", right],
                            ].map(([side, team]) => (
                                <motion.div
                                    key={side}
                                    className={`${css.intro_tile} ${side === "right" ? css.intro_tile_right : ""}`}
                                    style={teamVars(team)}
                                    initial={{ opacity: 0, x: side === "left" ? -90 : 90 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ x: side === "left" ? -500 : 500, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }}
                                    transition={{ duration: 0.55, delay: 1.15, ease: SWEEP }}
                                >
                                    <span className={css.intro_flood} />
                                    <span className={css.tile_bg} aria-hidden="true">
                                        <PemCircle team={team} className={css.intro_mark} />
                                    </span>
                                    <motion.span
                                        className={css.intro_name}
                                        initial={{ opacity: 0, x: side === "left" ? -30 : 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 1.5, ease: EASE }}
                                    >
                                        <span className={css.intro_prefix}>Team</span>
                                        <span className={css.intro_name_text}>
                                            <Fit>{team?.name}</Fit>
                                        </span>
                                    </motion.span>
                                </motion.div>
                            ))}
                            <motion.span
                                className={css.intro_vs}
                                initial={{ opacity: 0, scale: 0.3, rotate: -45 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.5, delay: 1.75, ease: [0.3, 1.5, 0.5, 1] }}
                            >
                                <span className={css.intro_vs_ring} aria-hidden="true" />
                                VS
                            </motion.span>
                        </div>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
