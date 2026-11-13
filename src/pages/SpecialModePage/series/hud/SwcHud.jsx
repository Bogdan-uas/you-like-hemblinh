import { useEffect, useLayoutEffect, useMemo, useRef, useState, cloneElement } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import css from "./Swc.module.css";
import base from "../../SpecialModePage.module.css";
import { HudInsurance } from "../../progress/HudPerks.jsx";
import { useHudPerksShown } from "../../progress/progressStore.js";
import { isCheatTargeting } from "../../logic/secretCheats.js";
import { predictLiveRoundWin, predictLiveSeriesWin } from "../../logic/predictions.js";
import { HudTrophy } from "./HudTrophies.jsx";
import {
    STINGER_MIN_MS,
    buildPemSetChips,
    getErStatus,
    getPemExtendedCue,
    getPemPenaltyWindow,
    isFreshPemSeries,
    isPemExtendedRoundNow,
    otPreviewState,
    pemOvertimeName,
    pemSetLabel,
    pemTextOn,
    useOtMorphPreview,
} from "./pemHud.js";

const REGULATION_ROUNDS = 24;
const OT_ROUNDS = 6;
const MORPH_MS = 480;
const FLASH_MS = 2600;
const SET_BANNER_MS = 2300;
const INTRO_MS = 3400;
const ODDS_MARGIN = 1.06;
const ER_TO_WIN = 4;
const EASE = [0.22, 1, 0.36, 1];
const FRAME_W = 386;
const FRAME_H = 84;

const seeded = (seed) => {
    let x = seed;
    return () => {
        x = (x * 16807) % 2147483647;
        return x / 2147483647;
    };
};

const buildVoltOutline = (seed) => {
    const rand = seeded(seed);
    const inset = 7;
    const r = 9;
    const x0 = inset;
    const y0 = inset;
    const x1 = FRAME_W - inset;
    const y1 = FRAME_H - inset;
    const pts = [];
    const push = (x, y, nx, ny) => {
        const spike = rand() > 0.9 ? 2.4 : 1;
        const j = (rand() - 0.5) * 4.2 * spike;
        pts.push([x + nx * j, y + ny * j]);
    };
    const corner = (cx, cy, from) => {
        for (let k = 1; k < 4; k++) {
            const a = from + (k * Math.PI) / 8;
            push(cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.cos(a), Math.sin(a));
        }
    };
    for (let x = x0 + r; x <= x1 - r; x += 9) push(x, y0, 0, -1);
    corner(x1 - r, y0 + r, -Math.PI / 2);
    for (let y = y0 + r; y <= y1 - r; y += 8) push(x1, y, 1, 0);
    corner(x1 - r, y1 - r, 0);
    for (let x = x1 - r; x >= x0 + r; x -= 9) push(x, y1, 0, 1);
    corner(x0 + r, y1 - r, Math.PI / 2);
    for (let y = y1 - r; y >= y0 + r; y -= 8) push(x0, y, -1, 0);
    corner(x0 + r, y0 + r, Math.PI);
    return `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")} Z`;
};

const VOLT_OUTLINES = [11, 29, 47].map(buildVoltOutline);

const buildArc = (seed, x0, y0, bend, len) => {
    const rand = seeded(seed);
    const pts = [];
    const steps = 9;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        pts.push([x0 + Math.sin(t * Math.PI) * bend + (rand() - 0.5) * 3.4, y0 + t * len]);
    }
    const [bx, by] = pts[Math.floor(steps / 2)];
    const tail = `M${bx.toFixed(1)} ${by.toFixed(1)} L${(bx + 6 + rand() * 4).toFixed(1)} ${(by - 5).toFixed(1)} L${(bx + 9 + rand() * 4).toFixed(1)} ${(by - 3).toFixed(1)}`;
    return `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")} ${tail}`;
};

const VOLT_ARCS = [
    buildArc(7, 12, 14, 9, 44),
    buildArc(19, 20, 24, 7, 40),
    buildArc(31, 9, 40, 6, 30),
    buildArc(53, 26, 10, 5, 26),
];

const VOLT_SPARKS = ["M30 4 L34 0 L37 3", "M58 6 L61 1", "M44 80 L48 84 L52 81", "M8 30 L3 33"];

const buildCloud = (seed, baseY, amp) => {
    const rand = seeded(seed);
    const widths = [];
    let total = 0;
    while (total < 400) {
        const w = amp * (1.6 + rand() * 1.8);
        widths.push(w);
        total += w;
    }
    const k = 400 / total;
    let d = `M0 80 L0 ${baseY}`;
    let x = 0;
    widths.forEach((w, i) => {
        const nx = i === widths.length - 1 ? 400 : x + w * k;
        const ny = i === widths.length - 1 ? baseY : baseY + (rand() - 0.5) * amp * 0.5;
        const r = ((nx - x) / 2) * (1.02 + rand() * 0.25);
        d += ` A${r.toFixed(1)} ${(r * (0.75 + rand() * 0.35)).toFixed(1)} 0 0 1 ${nx.toFixed(1)} ${ny.toFixed(1)}`;
        x = nx;
    });
    return `${d} L400 80 Z`;
};

const CLOUD_BACK = buildCloud(71, 46, 15);
const CLOUD_FRONT = buildCloud(97, 58, 12);

const buildStrike = (seed, x0, spread) => {
    const rand = seeded(seed);
    const pts = [];
    let x = x0;
    for (let y = -6; y <= 86; y += 9 + rand() * 6) {
        pts.push([x, y]);
        x += (rand() - 0.5) * spread;
    }
    const [bx, by] = pts[Math.floor(pts.length / 2)];
    const dir = rand() > 0.5 ? 1 : -1;
    const fork = `M${bx.toFixed(1)} ${by.toFixed(1)} L${(bx + dir * (10 + rand() * 12)).toFixed(1)} ${(by + 8 + rand() * 6).toFixed(1)} L${(bx + dir * (16 + rand() * 14)).toFixed(1)} ${(by + 18 + rand() * 8).toFixed(1)}`;
    return `M${pts.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(" L")} ${fork}`;
};

const STRIKES = [610, 548, 486, 420, 352, 286, 214, 140].map((x, i) => buildStrike(13 + i * 17, x, i % 2 ? 26 : 34));

const TENDRILS = [
    "M66 18 Q50 44 68 72",
    "M122 10 Q154 28 170 64",
    "M204 26 Q208 60 234 64 Q262 60 266 24",
    "M302 72 L318 32 L338 66 L358 26",
    "M382 14 Q390 44 406 72",
    "M28 58 Q58 48 90 60",
    "M246 78 Q278 66 304 74",
    "M428 20 Q440 46 422 74",
];

const CRACK_PATHS = ["M8 16 L44 30 L62 20 L90 40 L128 32", "M30 54 L60 44 L84 58 L104 50"];

const GLASS_CRACKS = [
    "M96 4 L150 26 L172 14 L238 44",
    "M172 14 L186 -4",
    "M238 44 L292 34 L326 62 L378 52",
    "M326 62 L334 74",
    "M378 52 L404 70",
    "M292 34 L318 8",
];

const GLINTS = ["M190 22 L198 18 L196 26 Z", "M262 54 L272 50 L268 60 Z", "M318 20 L324 16 L326 24 Z", "M350 58 L358 52 L360 62 Z"];

const FINALE_SPARKS = [
    [-1, -1],
    [1, -1],
    [1.2, 0.2],
    [0.6, 1.1],
    [-0.6, 1.1],
    [-1.2, 0.2],
    [0, -1.35],
];

const Lightning = ({ paths, prefix }) =>
    paths.map((d, i) => (
        <g key={i} className={css[`${prefix}_${i}`]}>
            <path d={d} className={css.strike_outline} vectorEffect="non-scaling-stroke" />
            <path d={d} className={css.strike_core} vectorEffect="non-scaling-stroke" />
        </g>
    ));

const Fit = ({ children }) => {
    const ref = useRef(null);
    const fitKey = typeof children === "string" || typeof children === "number" ? String(children) : children;

    useLayoutEffect(() => {
        const node = ref.current;
        const parent = node?.parentElement;
        if (!node || !parent) return undefined;
        let frame = null;
        const fit = () => {
            node.style.fontSize = "";
            const room = parent.clientWidth;
            if (!room) return;
            const base = parseFloat(getComputedStyle(node).fontSize) || 16;
            let size = base;
            for (let i = 0; i < 4 && node.scrollWidth > room; i++) {
                size = Math.floor(size * (room / node.scrollWidth) * 100) / 100;
                node.style.fontSize = `${size}px`;
            }
        };
        const schedule = () => {
            if (frame != null) cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                frame = null;
                fit();
            });
        };
        fit();
        const observer = typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : null;
        observer?.observe(parent);
        let alive = true;
        document.fonts?.ready?.then(() => alive && fit());
        document.fonts?.addEventListener?.("loadingdone", schedule);
        return () => {
            alive = false;
            if (frame != null) cancelAnimationFrame(frame);
            observer?.disconnect();
            document.fonts?.removeEventListener?.("loadingdone", schedule);
        };
    }, [fitKey]);

    return (
        <span ref={ref} className={css.fit}>
            {children}
        </span>
    );
};

const teamVars = (team) => ({
    "--team-color": team?.color ?? "#8b909e",
    "--team-gradient": team?.color ?? "#8b909e",
    "--team-text": pemTextOn(team?.color),
});

const roundsPlayed = (s) => (s.roundWins ?? 0) + (s.roundLosses ?? 0);

const stormLevel = (streak) => (streak >= 10 ? 5 : streak >= 7 ? 4 : streak >= 5 ? 3 : streak >= 3 ? 2 : streak >= 2 ? 1 : 0);

const swcRoundLine = (s, target) => {
    const played = roundsPlayed(s);
    const long = isPemExtendedRoundNow(s) ? ` · To ${target}` : "";
    if (s.isOvertime) {
        const block = Math.max(1, s.overtimeBlock ?? 1);
        const into = Math.min(OT_ROUNDS, Math.max(1, played - REGULATION_ROUNDS - OT_ROUNDS * (block - 1) + 1));
        return `OT ${block} (${into}/${OT_ROUNDS})${long}`;
    }
    return `Round ${Math.min(REGULATION_ROUNDS, played + 1)} / ${REGULATION_ROUNDS}${long}`;
};

const toOdds = (p) => {
    if (!(p > 0)) return "-";
    return Math.max(1.01, Math.min(99, 1 / (p * ODDS_MARGIN))).toFixed(2);
};

const BoltGlyph = ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 24 32" aria-hidden="true">
        <path d="M14 1 H22 L16 12 H23 L7 31 L11 16 H3 Z" fill="currentColor" />
    </svg>
);

const Volt = ({ level = 0, side }) => (
    <span className={css.volt} data-level={level} data-side={side} aria-hidden="true">
        <span className={css.volt_halo} />
        <span className={css.volt_glow} />
        <svg className={css.volt_frame} viewBox={`0 0 ${FRAME_W} ${FRAME_H}`} preserveAspectRatio="none">
            {VOLT_OUTLINES.map((d, i) => (
                <path key={i} d={d} className={css[`volt_path_${i}`]} vectorEffect="non-scaling-stroke" />
            ))}
        </svg>
        <svg className={css.volt_arcs} viewBox="0 0 40 84" preserveAspectRatio="none">
            {VOLT_ARCS.map((d, i) => (
                <path key={i} d={d} className={css[`volt_arc_${i}`]} vectorEffect="non-scaling-stroke" />
            ))}
            {VOLT_SPARKS.map((d, i) => (
                <path key={`s${i}`} d={d} className={`${css.volt_spark} ${css[`volt_spark_${i}`]}`} vectorEffect="non-scaling-stroke" />
            ))}
        </svg>
    </span>
);

const Storm = ({ streak = 0, side }) => {
    const level = stormLevel(streak);
    return (
        <span className={css.storm} data-level={level} data-side={side} aria-hidden="true">
            <span className={css.storm_sky} />
            <span className={css.storm_flash} />
            <span className={css.storm_grow}>
                <span className={`${css.storm_layer} ${css.storm_back}`}>
                    <svg viewBox="0 0 800 80" preserveAspectRatio="none">
                        <path d={CLOUD_BACK} />
                        <path d={CLOUD_BACK} transform="translate(400 0)" />
                    </svg>
                </span>
                <span className={`${css.storm_layer} ${css.storm_front}`}>
                    <svg viewBox="0 0 800 80" preserveAspectRatio="none">
                        <path d={CLOUD_FRONT} />
                        <path d={CLOUD_FRONT} transform="translate(400 0)" />
                    </svg>
                </span>
            </span>
        </span>
    );
};

const Streak = ({ streak = 0 }) => (
    <span className={css.streak} data-shown={streak >= 2 ? "true" : "false"} aria-label={streak >= 2 ? `${streak} round streak` : undefined}>
        <BoltGlyph className={css.streak_bolt} />
        <motion.span key={streak} className={css.streak_value} initial={{ opacity: 0.3, scale: 1.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: EASE }}>
            {Math.max(streak, 2)}
        </motion.span>
    </span>
);

const Logo = ({ team, className = "" }) => (
    <span className={`${css.logo} ${className}`} style={{ background: team?.color ?? "#8b909e", "--team-color": team?.color ?? "#8b909e" }} />
);

const Panel = ({ side, team, volt = 0, streak = 0, finale = null, play = false, cheat = false, result = null, opacity = 1 }) => (
    <div
        className={`${css.panel} ${side === "right" ? css.panel_right : ""} ${finale ? css[`panel_${finale}`] : ""} ${finale && play ? css.play : ""}`}
        style={{ ...teamVars(team), "--panel-content": opacity }}
    >
        <span className={css.panel_clip}>
            <Storm streak={streak} side={side} />
            {finale === "won" || finale === "setwon" ? (
                <>
                    <span className={css.panel_fill} />
                    <span className={css.panel_sheen} />
                    <span className={css.panel_flash} />
                </>
            ) : null}
            {finale === "lost" ? <span className={css.panel_shutter} /> : null}
        </span>
        <Streak streak={streak} />
        <span className={css.panel_name}>
            <Fit>{team?.name}</Fit>
        </span>
        <span className={css.panel_logo}>
            {finale === "won" ? (
                <>
                    <span className={`${css.fin_ring} ${css.fin_ring_1}`} aria-hidden="true" />
                    <span className={`${css.fin_ring} ${css.fin_ring_2}`} aria-hidden="true" />
                    {FINALE_SPARKS.map(([x, y], i) => (
                        <BoltGlyph key={i} className={css.fin_spark} style={{ "--sx": `${x * 46}px`, "--sy": `${y * 40}px`, "--sr": `${x * 24}deg`, "--sd": `${i * 40}ms` }} />
                    ))}
                </>
            ) : null}
            <Logo team={team} />
            {result ? (
                <span className={`${css.result} ${css[`result_${result}`]}`}>{result === "won" ? <FaCheck aria-hidden="true" /> : <FaXmark aria-hidden="true" />}</span>
            ) : null}
        </span>
        {cheat ? <span className={`${base.cheat_indicator} ${side === "left" ? base.cheat_indicator_left : base.cheat_indicator_right}`} aria-hidden="true" /> : null}
        <Volt level={volt} side={side} />
    </div>
);

const Score = ({ value, animated = true }) => (
    <span className={css.score_cell}>
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
                key={value}
                className={css.score}
                initial={animated ? { y: "55%", opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                exit={animated ? { y: "-55%", opacity: 0 } : undefined}
                transition={{ duration: 0.3, ease: EASE }}
            >
                {value}
            </motion.span>
        </AnimatePresence>
    </span>
);

const Dashes = ({ total, lit, team }) => (
    <span className={css.dashes} style={teamVars(team)}>
        {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`${css.dash} ${i < lit ? css.dash_lit : ""}`} />
        ))}
    </span>
);

const Clock = ({ tone, text, team, animated = true }) => (
    <span className={css.clock} data-tone={tone} style={tone === "gg" ? teamVars(team) : undefined}>
        <span className={css.clock_bomb} aria-hidden="true" />
        <motion.span
            key={`${tone}-${text}`}
            className={css.clock_text}
            initial={animated ? { opacity: tone === "gg" ? 0 : 0.35, scale: tone === "gg" ? 1.8 : 0.88 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: tone === "gg" ? 0.5 : 0.2, delay: tone === "gg" && animated ? 0.45 : 0, ease: EASE }}
        >
            {text}
        </motion.span>
    </span>
);

const Centre = ({ leftTeam, rightTeam, leftScore, rightScore, clock, line, setsTotal, leftSets, rightSets, animated = true }) => (
    <div className={css.centre}>
        <span className={`${css.edge} ${css.edge_left}`} style={teamVars(leftTeam)} aria-hidden="true" />
        <span className={css.box}>
            <Score value={leftScore} animated={animated} />
            <Clock {...clock} animated={animated} />
            <Score value={rightScore} animated={animated} />
            {setsTotal > 0 ? <Dashes total={setsTotal} lit={leftSets} team={leftTeam} /> : <span />}
            <span className={css.centre_line}>{line}</span>
            {setsTotal > 0 ? <Dashes total={setsTotal} lit={rightSets} team={rightTeam} /> : <span />}
        </span>
        <span className={`${css.edge} ${css.edge_right}`} style={teamVars(rightTeam)} aria-hidden="true" />
    </div>
);

const Minis = ({ team, total, lit, side }) => (
    <span className={`${css.minis} ${side === "right" ? css.minis_right : ""} ${total > 5 ? css.minis_long : ""}`} style={teamVars(team)}>
        {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`${css.mini} ${i < lit ? css.mini_lit : ""}`} />
        ))}
    </span>
);

const Pens = ({ team, results = [], attempts, side, nextIndex = null }) => (
    <span className={`${css.minis} ${side === "right" ? css.minis_right : ""}`} style={teamVars(team)}>
        {getPemPenaltyWindow(results, attempts).map(({ index, result }) => (
            <span key={index} className={`${css.pen} ${index === nextIndex ? css.pen_next : ""}`} data-result={result ?? "none"}>
                <span className={css.pen_fill} />
                <span className={css.pen_icon}>{result === "success" ? <FaCheck aria-hidden="true" /> : result === "fail" ? <FaXmark aria-hidden="true" /> : null}</span>
            </span>
        ))}
    </span>
);

const PointTab = ({ label }) => (
    <span className={css.point_tab} data-shown={label ? "true" : "false"}>
        <BoltGlyph className={css.point_bolt} />
        <span>{label || "Point"}</span>
    </span>
);

const gambleKey = (s) => `${s.miniWins ?? 0}|${s.miniLosses ?? 0}|${s.lastMultiplierLeft ?? ""}|${s.lastMultiplierRight ?? ""}|${s.roundNumber ?? 0}`;

const useRoundCue = (s, play, stop) => {
    const frameRef = useRef(null);
    const rw = s.roundWins ?? 0;
    const rl = s.roundLosses ?? 0;
    const gamble = gambleKey(s);
    const prevRef = useRef([rw, rl, gamble]);

    const cancel = () => {
        if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
    };

    useEffect(() => {
        const [pw, pl, pg] = prevRef.current;
        prevRef.current = [rw, rl, gamble];
        const side = rw === pw + 1 && rl === pl ? "left" : rl === pl + 1 && rw === pw ? "right" : null;
        if (side && !s.banner && s.tiebreakerPhase === "idle" && !s.pendingAction) {
            cancel();
            stop();
            frameRef.current = requestAnimationFrame(() => {
                frameRef.current = requestAnimationFrame(() => {
                    frameRef.current = null;
                    play(side);
                });
            });
            return undefined;
        }
        if (rw !== pw || rl !== pl || gamble !== pg) {
            cancel();
            stop();
        }
        return undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rw, rl, gamble]);

    useEffect(() => cancel, []);
};

const cueOn = (el, timerRef, ms) => {
    if (!el) return;
    clearTimeout(timerRef.current);
    if (el.dataset.state !== "off") {
        el.dataset.state = "off";
        void el.offsetWidth;
    }
    el.dataset.state = "on";
    timerRef.current = setTimeout(() => {
        if (el.dataset.state === "on") el.dataset.state = "out";
    }, ms);
};

const cueOff = (el, timerRef) => {
    clearTimeout(timerRef.current);
    if (el && el.dataset.state === "on") el.dataset.state = "out";
};

const settleOut = (e) => {
    if (e.target === e.currentTarget && e.currentTarget.dataset.state === "out") e.currentTarget.dataset.state = "off";
};

const SET_ACTIONS = ["NEXT_SET", "NEXT_SET_AFTER_PENALTIES"];

const setBannerMs = (remaining) => {
    const ms = Math.min(SET_BANNER_MS, remaining - 1500);
    return ms >= 1100 ? ms : 0;
};

const setWinnerSide = (s, action) =>
    action.type === "NEXT_SET_AFTER_PENALTIES"
        ? (s.penaltyLeftScore ?? 0) > (s.penaltyRightScore ?? 0) ? "left" : "right"
        : (s.roundWins ?? 0) >= (s.roundLosses ?? 0) ? "left" : "right";

const RoundFlash = ({ seriesState: s, setsToWin }) => {
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const timers = { left: useRef(null), right: useRef(null) };
    const [label, setLabel] = useState("Wins the round");
    const action = s.pendingAction;

    useRoundCue(
        s,
        (side) => {
            setLabel("Wins the round");
            cueOn(side === "left" ? leftRef.current : rightRef.current, side === "left" ? timers.left : timers.right, FLASH_MS);
        },
        () => {
            cueOff(leftRef.current, timers.left);
            cueOff(rightRef.current, timers.right);
        },
    );

    useEffect(() => {
        if (!action?.executeAt || !SET_ACTIONS.includes(action.type) || s.banner) return;
        const ms = setBannerMs(action.executeAt - Date.now());
        if (!ms) return;
        const side = setWinnerSide(s, action);
        setLabel(`Wins ${pemSetLabel(s.setNumber ?? 1, setsToWin * 2 - 1) === "Decider" ? "the Decider" : pemSetLabel(s.setNumber ?? 1, setsToWin * 2 - 1)}`);
        cueOn(side === "left" ? leftRef.current : rightRef.current, side === "left" ? timers.left : timers.right, ms);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action?.executeAt]);

    useEffect(
        () => () => Object.values(timers).forEach((timer) => clearTimeout(timer.current)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return ["left", "right"].map((side) => {
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        return (
            <span
                key={side}
                ref={side === "left" ? leftRef : rightRef}
                data-state="off"
                data-from={side}
                className={css.flash}
                style={teamVars(team)}
                onAnimationEnd={settleOut}
                aria-hidden="true"
            >
                <svg className={css.flash_crack} viewBox="0 0 300 70" preserveAspectRatio="none">
                    <Lightning paths={CRACK_PATHS} prefix="crack" />
                </svg>
                <span className={css.flash_body}>
                    <span className={css.flash_bg}>
                        <svg className={css.flash_glass_cracks} viewBox="0 0 430 70" preserveAspectRatio="none">
                            {GLASS_CRACKS.map((d, i) => (
                                <path key={i} d={d} vectorEffect="non-scaling-stroke" />
                            ))}
                        </svg>
                    </span>
                    <span className={css.flash_logo}>
                        <Logo team={team} className={css.flash_circle} />
                    </span>
                    <span className={css.flash_slab} />
                    <span className={css.flash_text}>{label}</span>
                    <svg className={css.flash_glints} viewBox="0 0 430 70" preserveAspectRatio="none">
                        {GLINTS.map((d, i) => (
                            <path key={i} d={d} />
                        ))}
                    </svg>
                </span>
                <svg className={css.flash_tendrils} viewBox="0 0 470 90" preserveAspectRatio="none">
                    <Lightning paths={TENDRILS} prefix="tendril" />
                </svg>
                <svg className={css.flash_edge} viewBox="0 0 40 80" preserveAspectRatio="none">
                    <path d="M22 4 L16 18 L24 26 L14 44 L20 52 L12 76" vectorEffect="non-scaling-stroke" />
                    <path d="M24 26 L34 30 L38 40" vectorEffect="non-scaling-stroke" />
                </svg>
            </span>
        );
    });
};

const PredictionBar = ({ s, target, mode, alertText, alertTone = "amber", alertTeam = null, boltTeam = null, leftTeam, rightTeam, hidden = false }) => {
    const live = mode === "live";
    const p = useMemo(
        () => (live ? predictLiveRoundWin(s, target) : 0.5),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [live, target, s.miniWins, s.miniLosses, s.roundWins, s.roundLosses, s.isOvertime, s.overtimeBlock, s.bounceBackArmedSide, s.lastRoundLoserSide, s.liveStats, s.matchCtx, s.setsToWin],
    );
    const shown = Math.min(0.96, Math.max(0.04, p));
    const labelAt = Math.min(0.84, Math.max(0.16, shown));

    return (
        <div className={css.pred} data-mode={mode} data-hidden={hidden ? "true" : "false"} style={{ "--p": shown, "--label-at": labelAt }}>
            <span className={css.pred_track}>
                <span className={css.pred_left} style={teamVars(leftTeam)} />
                <span className={css.pred_right} style={teamVars(rightTeam)} />
                <span className={css.pred_alert} data-tone={alertTone} style={alertTeam ? teamVars(alertTeam) : undefined}>
                    <Fit>{alertText}</Fit>
                </span>
            </span>
            <span className={css.pred_label}>
                Round prediction
                <span className={css.pred_bolt} data-shown={boltTeam ? "true" : "false"} data-side={boltTeam && boltTeam.id === rightTeam?.id ? "right" : "left"} style={boltTeam ? { color: boltTeam.color } : undefined}>
                    <BoltGlyph className={css.pred_bolt_icon} />
                </span>
            </span>
        </div>
    );
};

const swcCue = (s, setsToWin) => {
    const action = s.pendingAction;
    if (!action) return null;
    const rw = s.roundWins ?? 0;
    const rl = s.roundLosses ?? 0;
    const block = s.isOvertime ? Math.max(0, s.overtimeBlock ?? 0) : 0;

    if (action.type === "NEXT_SET" || action.type === "NEXT_SET_AFTER_PENALTIES") {
        const pens = action.type === "NEXT_SET_AFTER_PENALTIES";
        const leftWon = pens ? (s.penaltyLeftScore ?? 0) > (s.penaltyRightScore ?? 0) : rw >= rl;
        const leftSets = s.playerWonSets ?? 0;
        const rightSets = s.playerLostSets ?? 0;
        if (Math.max(leftSets, rightSets) >= setsToWin) return null;
        const stats = s.liveStats ?? s.initialStats;
        let pLeft = null;
        if (stats?.left && stats?.right) {
            pLeft = predictLiveSeriesWin({
                seeded: { left: { ...stats.left, momentum: 0 }, right: { ...stats.right, momentum: 0 } },
                matchCtx: s.matchCtx ?? null,
                setsToWin,
                leftSets,
                rightSets,
                prevLoser: leftWon ? "right" : "left",
            });
        }
        return {
            key: action.executeAt,
            kind: "odds",
            left: pLeft == null ? "-" : toOdds(pLeft),
            right: pLeft == null ? "-" : toOdds(1 - pLeft),
        };
    }

    if (action.type === "NEXT_OT") {
        return {
            key: action.executeAt,
            kind: "stinger",
            top: `Tied ${rw}-${rl} · First to ${16 + block * 3}`,
            big: pemOvertimeName(block + 1),
        };
    }

    return null;
};

const OddsPanel = ({ seriesState: s, setsToWin }) => {
    const action = s.pendingAction;
    const [timed, setTimed] = useState(null);

    useEffect(() => {
        if (!action?.executeAt) return undefined;
        const remaining = action.executeAt - Date.now();
        if (remaining < STINGER_MIN_MS) return undefined;
        const cue = swcCue(s, setsToWin);
        if (!cue) return undefined;
        const wait = cue.kind === "odds" ? setBannerMs(remaining) : 0;
        const show = wait ? setTimeout(() => setTimed(cue), wait) : null;
        if (!wait) setTimed(cue);
        const timer = setTimeout(() => setTimed(null), remaining);
        return () => {
            clearTimeout(show);
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action?.executeAt]);

    const extended = getPemExtendedCue(s);
    const shown = (timed && action?.executeAt === timed.key ? timed : null)
        ?? (extended ? { key: extended.key, kind: "stinger", top: extended.sub ?? "First to 4 Extended Rounds", big: extended.text } : null);

    return (
        <AnimatePresence>
            {shown ? (
                <motion.div
                    key={shown.key}
                    className={css.odds}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.24, ease: "easeIn" } }}
                    transition={{ duration: 0.3, ease: EASE }}
                    aria-hidden="true"
                >
                    <motion.span className={css.odds_bar} initial={{ scaleX: 0.94 }} animate={{ scaleX: 1 }} transition={{ duration: 0.34, ease: EASE }}>
                        <span className={css.odds_name}><Fit>{s.leftTeam?.name}</Fit></span>
                        <Logo team={s.leftTeam} className={css.odds_logo} />
                        {shown.kind === "odds" ? (
                            <span className={css.odds_mid}>
                                <motion.span className={css.odds_tile} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.12, ease: EASE }}>
                                    {shown.left}
                                </motion.span>
                                <span className={css.odds_caption}>
                                    <span>Live</span>
                                    <span>Odds</span>
                                </span>
                                <motion.span className={css.odds_tile} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.18, ease: EASE }}>
                                    {shown.right}
                                </motion.span>
                            </span>
                        ) : (
                            <span className={`${css.odds_mid} ${css.odds_stinger}`}>
                                <span className={css.odds_stinger_top}><Fit>{shown.top}</Fit></span>
                                <span className={css.odds_stinger_big}><Fit>{shown.big}</Fit></span>
                            </span>
                        )}
                        <Logo team={s.rightTeam} className={css.odds_logo} />
                        <span className={css.odds_name}><Fit>{s.rightTeam?.name}</Fit></span>
                    </motion.span>
                    <motion.span className={css.odds_tab} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.1, ease: EASE }}>
                        <span className={css.odds_tab_brand}>
                            Storm<BoltGlyph className={css.odds_tab_bolt} />draft
                        </span>
                    </motion.span>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

const splitStage = (stageText) => {
    const parts = String(stageText ?? "").split(" | ").filter(Boolean);
    if (parts.length > 1) return [parts.slice(0, -1).join(" · "), parts[parts.length - 1]];
    const words = (parts[0] ?? "").split(" ");
    if (words.length < 2) return ["", parts[0] ?? ""];
    const cut = Math.ceil(words.length / 2);
    return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
};

const shortEvent = (eventName) => String(eventName ?? "").replace("Stormdraft World Championship", "Stormdraft WC");

const LeftStrips = ({ s, setsToWin, eventName, eventNumber }) => {
    const bestOf = setsToWin * 2 - 1;
    return (
        <div className={css.side_left}>
            <span className={css.strip}>
                <span className={css.strip_bo}>Bo{bestOf}</span>
                <span className={css.strip_set}>{setsToWin > 1 ? pemSetLabel(s.setNumber ?? 1, bestOf) : "Single set"}</span>
                <span className={css.strip_pick}>
                    Your pick {s.leftTeam?.name}
                    <Logo team={s.leftTeam} className={css.strip_logo} />
                </span>
            </span>
            <span className={`${css.strip} ${css.strip_event}`}>
                <span className={css.strip_event_name}><Fit>{shortEvent(eventName)}</Fit></span>
                <span className={css.strip_number}>{eventNumber}</span>
            </span>
        </div>
    );
};

const Badge = ({ stageText }) => {
    const [top, bottom] = splitStage(stageText);
    return (
        <div className={css.side_right}>
            <span className={css.badge}>
                <span className={css.badge_text}>
                    {top ? <span className={css.badge_line}><Fit>{top}</Fit></span> : null}
                    <span className={css.badge_line}><Fit>{bottom}</Fit></span>
                </span>
                <span className={css.badge_mark}>
                    <HudTrophy type="swc" size={40} />
                </span>
            </span>
        </div>
    );
};

export const SwcSets = ({ chips, bestOf, selectedIndex = null, onSelect = null, extra = null }) => (
    <div className={`${css.hud} ${css.sets}`}>
        {extra}
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
                    style={{ "--set-color": chip.winnerTeam?.color ?? "transparent", "--set-gradient": chip.winnerTeam?.color ?? "transparent" }}
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
        {extra ? cloneElement(extra, { ghost: true }) : null}
    </div>
);

export function SwcScorebug({
    seriesState,
    setsToWin,
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
    entrance = false,
}) {
    const perksShown = useHudPerksShown();
    const s = seriesState;
    const preview = useOtMorphPreview(s, MORPH_MS);
    const view = preview ? otPreviewState(s) : s;
    const target = preview ? 10 : displayedMiniSquares;
    const bannerAtMountRef = useRef(!!s.banner);
    const celebrate = !bannerAtMountRef.current;
    const isPens = s.tiebreakerPhase === "penalties";
    const isExtended = s.tiebreakerPhase === "extended";
    const winnerSide = s.banner && !s.banner.tie ? ((s.playerWonSets ?? 0) >= (s.playerLostSets ?? 0) ? "left" : "right") : null;
    const winnerTeam = winnerSide === "left" ? s.leftTeam : winnerSide === "right" ? s.rightTeam : null;
    const attempts = Math.max(penaltyAttempts ?? 0, s.penaltyLeftResults?.length ?? 0, s.penaltyRightResults?.length ?? 0);
    const live = s.tiebreakerPhase === "idle" && !s.banner && !preview;

    const streakOf = (side) => (live ? s.liveStats?.[side]?.momentum ?? 0 : 0);

    const pointFor = (side) => (point && (point.side === side || point.side === "both") ? point.label : "");

    const voltFor = (side) => {
        if (winnerSide) return winnerSide === side ? 4 : 0;
        const label = pointFor(side);
        if (!label) return 0;
        return /^set point$/i.test(label) ? 2 : 3;
    };

    const finaleFor = (side) => (winnerSide ? (winnerSide === side ? "won" : "lost") : null);

    const tally = isPens
        ? `${s.penaltyLeftScore ?? 0}:${s.penaltyRightScore ?? 0}`
        : finalRoundMinis && !preview
            ? `${finalRoundMinis.left}:${finalRoundMinis.right}`
            : `${view.miniWins ?? 0}:${view.miniLosses ?? 0}`;

    const clock = s.banner
        ? s.banner.tie ? { tone: "final", text: "Draw" } : { tone: "gg", text: "GG", team: winnerTeam }
        : isExtended
            ? { tone: "tiebreak", text: "ER" }
            : isPens
                ? { tone: "tiebreak", text: tally }
                : { tone: "normal", text: tally };

    const turnTeam = s.penaltyTurn === "right" ? s.rightTeam : s.leftTeam;
    const mode = s.banner ? "done" : isPens || isExtended ? "tiebreak" : "live";
    const alertText = s.banner
        ? s.banner.tie ? "Draw" : `Team ${winnerTeam?.name} wins the series`
        : isPens
            ? s.penaltyResolved
                ? `Penalties · ${s.penaltyLeftScore ?? 0}-${s.penaltyRightScore ?? 0}`
                : `${suddenDeath ? "Sudden death" : `Penalties · Attempt ${penaltyAttempt}`} · Team ${turnTeam?.name} shoots`
            : isExtended
                ? "Extended Rounds · First to 4"
                : "";
    const alertTone = s.banner ? "gg" : isPens && !s.penaltyResolved ? "team" : "amber";

    const leftStreak = streakOf("left");
    const rightStreak = streakOf("right");
    const boltTeam = leftStreak >= 2 ? s.leftTeam : rightStreak >= 2 ? s.rightTeam : null;

    const line = winnerSide ? "Series winner" : isPens ? (suddenDeath ? "Sudden death" : `Penalties (${penaltyAttempt})`) : isExtended ? "Extended Rounds" : swcRoundLine(view, target);
    const oddsUp = !!s.pendingAction && ["NEXT_SET", "NEXT_SET_AFTER_PENALTIES", "NEXT_OT"].includes(s.pendingAction.type);

    const indicatorsFor = (side) => {
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        if (isPens) {
            const results = side === "left" ? s.penaltyLeftResults : s.penaltyRightResults;
            return <Pens side={side} team={team} attempts={attempts} results={results} nextIndex={!s.penaltyResolved && s.penaltyTurn === side ? results?.length ?? 0 : null} />;
        }
        if (isExtended) return <span className={css.minis} />;
        const lit = finalRoundMinis && !preview ? finalRoundMinis[side] : side === "left" ? view.miniWins ?? 0 : view.miniLosses ?? 0;
        return <Minis side={side} team={team} total={target} lit={lit} />;
    };

    return (
        <div className={`${css.hud} ${css.scorebug} ${entrance ? css.entrance : ""} ${celebrate ? "" : css.static}`} data-finale={winnerSide ?? "none"}>
            {setsToWin > 1 || perksShown ? <SwcSets chips={setsToWin > 1 ? buildPemSetChips(s) : []} bestOf={setsToWin * 2 - 1} extra={<HudInsurance variant="swc" hud={css} seriesState={s} />} /> : null}
            <div className={css.layout}>
                <LeftStrips s={s} setsToWin={setsToWin} eventName={eventName} eventNumber={eventNumber} />
                <div className={css.bug}>
                    <div className={css.bar}>
                        <Panel side="left" team={s.leftTeam} volt={voltFor("left")} streak={leftStreak} finale={finaleFor("left")} play={celebrate} cheat={isCheatTargeting(activeCheat, "left")} />
                        <Centre
                            leftTeam={s.leftTeam}
                            rightTeam={s.rightTeam}
                            leftScore={view.roundWins ?? 0}
                            rightScore={view.roundLosses ?? 0}
                            clock={clock}
                            line={line}
                            setsTotal={setsToWin}
                            leftSets={s.playerWonSets ?? 0}
                            rightSets={s.playerLostSets ?? 0}
                        />
                        <Panel side="right" team={s.rightTeam} volt={voltFor("right")} streak={rightStreak} finale={finaleFor("right")} play={celebrate} cheat={isCheatTargeting(activeCheat, "right")} />
                    </div>
                    <RoundFlash seriesState={s} setsToWin={setsToWin} />
                    {winnerSide && celebrate ? (
                        <svg className={css.finale_strikes} data-from={winnerSide} viewBox="0 0 750 80" preserveAspectRatio="none" aria-hidden="true">
                            <Lightning paths={STRIKES} prefix="strike" />
                        </svg>
                    ) : null}
                    <OddsPanel seriesState={s} setsToWin={setsToWin} />
                    <div className={css.under} data-hidden={oddsUp ? "true" : "false"}>
                        <span className={css.under_side}>
                            <PointTab label={pointFor("left")} />
                            {indicatorsFor("left")}
                        </span>
                        <PredictionBar
                            s={view}
                            target={target}
                            mode={mode}
                            alertText={alertText}
                            alertTone={alertTone}
                            alertTeam={alertTone === "team" ? turnTeam : alertTone === "gg" ? winnerTeam : null}
                            boltTeam={live ? boltTeam : null}
                            leftTeam={winnerSide === "right" ? s.rightTeam : s.leftTeam}
                            rightTeam={winnerSide === "left" ? s.leftTeam : s.rightTeam}
                            hidden={oddsUp}
                        />
                        <span className={`${css.under_side} ${css.under_side_right}`}>
                            <PointTab label={pointFor("right")} />
                            {indicatorsFor("right")}
                        </span>
                    </div>
                </div>
                <Badge stageText={stageText} />
            </div>
        </div>
    );
}

export const SwcRow = ({
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
    const label = String(leftLabel || rightLabel || "").replace(/!+$/, "");
    const winner = winnerSide === "left" ? leftTeam : winnerSide === "right" ? rightTeam : null;
    const penLeft = penalties ? (penalties.leftResults ?? []).filter((r) => r === "success").length : 0;
    const penRight = penalties ? (penalties.rightResults ?? []).filter((r) => r === "success").length : 0;
    const tally = penalties ? `${penLeft}:${penRight}` : squaresTotal > 0 ? `${leftSquares}:${rightSquares}` : "-";

    const clock = ggBanner
        ? ggBanner.tie ? { tone: "final", text: "Draw" } : { tone: "gg", text: "GG", team: ggTeam }
        : penalties || extended
            ? { tone: "tiebreak", text: tally }
            : { tone: "normal", text: tally };

    const lineText = ggBanner
        ? ggBanner.tie ? "Final" : "Series winner"
        : penalties
            ? "Penalties"
            : label
                ? label
                : roundNumber != null
                    ? `Round ${roundNumber}`
                    : extended
                        ? "Extended Round"
                        : "";

    const line = extended?.onClick ? (
        <button type="button" className={css.centre_link} onClick={extended.onClick} title="Show this round in the Extended Rounds">
            {lineText || "Extended Round"}
        </button>
    ) : winner && !ggBanner && !penalties ? (
        <span className={css.row_winner}>
            {winnerSide === "left" ? <FaCaretLeft aria-hidden="true" /> : null}
            {lineText}
            {winnerSide === "right" ? <FaCaretRight aria-hidden="true" /> : null}
        </span>
    ) : lineText;

    const voltFor = (side) => {
        if (finaleSide) return finaleSide === side ? 4 : 0;
        const own = String((side === "left" ? leftLabel : rightLabel) || "");
        if (!own) return 0;
        return /set point/i.test(own) ? 2 : 3;
    };

    const resultFor = (side) => ((side === "left" ? leftGlow : rightGlow) ? "won" : (side === "left" ? rightGlow : leftGlow) ? "lost" : null);
    const finaleOf = (side) => (finaleSide ? (finaleSide === side ? "won" : "lost") : null);
    const streakOf = (side) => (finaleSide || penalties ? 0 : (side === "left" ? leftMomentumStreak : rightMomentumStreak) ?? 0);

    return (
        <div ref={ref} className={css.row_wrap}>
            <div className={`${css.hud} ${css.row} ${inView ? "" : css.static}`}>
                <div className={css.bar}>
                    <Panel side="left" team={leftTeam} volt={voltFor("left")} streak={streakOf("left")} finale={finaleOf("left")} result={resultFor("left")} opacity={leftOpacity} />
                    <Centre
                        leftTeam={leftTeam}
                        rightTeam={rightTeam}
                        leftScore={leftScore}
                        rightScore={rightScore}
                        clock={clock}
                        line={line}
                        setsTotal={setLinesTotal}
                        leftSets={leftSets}
                        rightSets={rightSets}
                        animated={false}
                    />
                    <Panel side="right" team={rightTeam} volt={voltFor("right")} streak={streakOf("right")} finale={finaleOf("right")} result={resultFor("right")} opacity={rightOpacity} />
                </div>
            </div>
        </div>
    );
};

export const SwcBoard = ({
    leftTeam,
    rightTeam,
    leftScore,
    rightScore,
    setLinesTotal = 0,
    leftSets = 0,
    rightSets = 0,
    leftGlow = false,
    rightGlow = false,
    roundsPlayed: played = null,
    roundsLabel = "Rounds",
    ggBanner = null,
}) => {
    const clinchedBy = (side) => (side === "left" ? leftGlow : rightGlow) && (setLinesTotal <= 1 || (side === "left" ? leftSets : rightSets) >= setLinesTotal);
    const seriesSide = ggBanner && !ggBanner.tie ? (ggBanner.team?.id === rightTeam?.id ? "right" : "left") : clinchedBy("left") ? "left" : clinchedBy("right") ? "right" : null;
    const seriesTeam = seriesSide === "left" ? leftTeam : seriesSide === "right" ? rightTeam : null;
    const clock = seriesTeam
        ? { tone: "gg", text: "GG", team: seriesTeam }
        : played != null
            ? { tone: "normal", text: played }
            : { tone: "tiebreak", text: "ER" };
    const line = seriesTeam ? "Series winner" : played != null ? `${roundsLabel} played` : "Extended Rounds";
    const resultFor = (side) => ((side === "left" ? leftGlow : rightGlow) ? "won" : (side === "left" ? rightGlow : leftGlow) ? "lost" : null);
    const finaleFor = (side) => {
        const result = resultFor(side);
        if (!result) return null;
        if (seriesSide) return seriesSide === side ? "won" : "lost";
        return result === "won" ? "setwon" : "setlost";
    };

    return (
        <div className={`${css.hud} ${css.board} ${css.static}`}>
            <div className={css.bar}>
                <Panel side="left" team={leftTeam} volt={seriesSide === "left" ? 4 : 0} finale={finaleFor("left")} result={resultFor("left")} />
                <Centre
                    leftTeam={leftTeam}
                    rightTeam={rightTeam}
                    leftScore={leftScore}
                    rightScore={rightScore}
                    clock={clock}
                    line={line}
                    setsTotal={setLinesTotal}
                    leftSets={leftSets}
                    rightSets={rightSets}
                    animated={false}
                />
                <Panel side="right" team={rightTeam} volt={seriesSide === "right" ? 4 : 0} finale={finaleFor("right")} result={resultFor("right")} />
            </div>
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
                            className={`${css.er_face} ${clinch ? css.er_clinch : ""}`}
                            style={teamVars(team)}
                            initial={{ rotateY: -90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: faded ? 0.4 : 1 }}
                            transition={{ rotateY: { duration: 0.36, ease: EASE }, opacity: { duration: faded ? 0.6 : 0.2, delay: faded ? 0.4 : 0 } }}
                        >
                            <span className={css.er_side}>{round.winner === "left" ? <FaCaretLeft aria-hidden="true" /> : <FaCaretRight aria-hidden="true" />}</span>
                            <Logo team={team} className={css.er_mark} />
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
                        <motion.span key="back" className={css.er_back} exit={{ opacity: 0, transition: { duration: 0.24 } }}>
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

export const SwcExtendedRoundsOverlay = ({ seriesState, details, setsToWin, eventName, eventNumber }) => {
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
    const finale = (side) => (decided ? (decided === side ? "won" : "lost") : null);

    return (
        <motion.div className={`${css.hud} ${css.er_overlay}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <motion.div className={css.er_panel} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <div className={css.er_head}>
                    <span className={css.strip}>
                        <span className={css.strip_bo}>Still {roundWins}-{roundLosses}</span>
                        <span className={css.strip_set}>After Quadruple Overtime</span>
                    </span>
                    <span className={css.badge}>
                        <span className={css.badge_text}>
                            <span className={css.badge_line}>Extended Rounds</span>
                            <span className={`${css.badge_line} ${css.er_head_sub}`}>
                                <Fit>{shortEvent(eventName)} {eventNumber} · First to {ER_TO_WIN}</Fit>
                            </span>
                        </span>
                        <span className={css.badge_mark}>
                            <HudTrophy type="swc" size={40} />
                        </span>
                    </span>
                </div>
                <div className={css.bar}>
                    <Panel side="left" team={leftTeam} volt={decided === "left" ? 4 : 0} finale={finale("left")} />
                    <Centre
                        leftTeam={leftTeam}
                        rightTeam={rightTeam}
                        leftScore={leftScore ?? 0}
                        rightScore={rightScore ?? 0}
                        clock={{ tone: "tiebreak", text: `${revealedCount}/${total}` }}
                        line="Compared"
                        setsTotal={ER_TO_WIN}
                        leftSets={Math.min(leftScore ?? 0, ER_TO_WIN)}
                        rightSets={Math.min(rightScore ?? 0, ER_TO_WIN)}
                    />
                    <Panel side="right" team={rightTeam} volt={decided === "right" ? 4 : 0} finale={finale("right")} />
                </div>
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
                            data-team={status.team ? "true" : "false"}
                            style={status.team ? teamVars(status.team) : undefined}
                            initial={{ opacity: 0, x: -24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 24 }}
                            transition={{ duration: 0.28, ease: EASE }}
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

export function SwcIntro({ seriesState, eventName, eventNumber, stageText, setsToWin, onDone }) {
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

    const [top, bottom] = splitStage(stageText);

    return (
        <AnimatePresence onExitComplete={onDone}>
            {open ? (
                <motion.div
                    key="swc-intro"
                    className={`${css.hud} ${css.intro}`}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.35 } }}
                    transition={{ duration: 0.2 }}
                >
                    <span className={css.intro_flash} aria-hidden="true" />
                    <span className={css.intro_bolt_wrap} aria-hidden="true">
                        <BoltGlyph className={css.intro_bolt} />
                    </span>
                    <motion.div
                        className={css.intro_head}
                        initial={{ opacity: 0, y: -18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.4, delay: 0.55, ease: EASE }}
                    >
                        <span className={css.intro_mark}>
                            <HudTrophy type="swc" size={56} />
                        </span>
                        <span className={css.intro_event}>
                            {eventName}
                            <span className={css.strip_number}>{eventNumber}</span>
                        </span>
                        <span className={css.intro_sub}>
                            {[top, bottom].filter(Boolean).join(" · ")} · Best of {setsToWin * 2 - 1}
                        </span>
                    </motion.div>
                    <div className={css.intro_teams}>
                        {["left", "right"].map((side) => {
                            const team = side === "left" ? seriesState.leftTeam : seriesState.rightTeam;
                            const from = side === "left" ? -520 : 520;
                            return (
                                <motion.div
                                    key={side}
                                    className={`${css.intro_team} ${side === "right" ? css.intro_team_right : ""}`}
                                    style={teamVars(team)}
                                    initial={{ x: from, opacity: 0 }}
                                    animate={{ x: [from, side === "left" ? 14 : -14, 0], opacity: 1 }}
                                    exit={{ x: from * 0.5, opacity: 0, transition: { duration: 0.28, ease: "easeIn" } }}
                                    transition={{ duration: 0.55, delay: 0.95, times: [0, 0.78, 1], ease: EASE }}
                                >
                                    <span className={css.intro_name}>{team?.name}</span>
                                    <Logo team={team} className={css.intro_logo} />
                                </motion.div>
                            );
                        })}
                        <motion.span
                            className={css.intro_vs}
                            initial={{ opacity: 0, scale: 2.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.32, delay: 1.45, ease: [0.3, 1.5, 0.5, 1] }}
                        >
                            <span className={`${css.edge} ${css.edge_left}`} style={teamVars(seriesState.leftTeam)} />
                            <span className={css.intro_vs_text}>VS</span>
                            <span className={`${css.edge} ${css.edge_right}`} style={teamVars(seriesState.rightTeam)} />
                        </motion.span>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
