import { useEffect, useLayoutEffect, useRef, useState, cloneElement } from "react";
import IntroHome from "../../worldMap/IntroHome.jsx";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FaCheck, FaXmark } from "react-icons/fa6";
import css from "./Ewc.module.css";
import base from "../../SpecialModePage.module.css";
import { HudInsurance } from "../../progress/HudPerks.jsx";
import { useHudPerksShown } from "../../progress/progressStore.js";
import { isCheatTargeting } from "../../logic/secretCheats.js";
import { readableOnDark, getBrightness, darkenHex } from "../../logic/colors.js";
import { HudTrophy } from "./HudTrophies.jsx";
import {
    STINGER_MIN_MS,
    buildPemSetChips,
    getErStatus,
    getPemExtendedCue,
    isFreshPemSeries,
    otPreviewState,
    pemOvertimeName,
    pemSetLabel,
    useOtMorphPreview,
} from "./pemHud.js";

const REGULATION_ROUNDS = 24;
const OT_ROUNDS = 6;
const MORPH_MS = 480;
const FLASH_MS = 2600;
const SET_BANNER_MS = 2300;
const INTRO_MS = 3600;
const ER_TO_WIN = 4;
const PEN_SLOTS = 6;
const EASE = [0.22, 1, 0.36, 1];
const SHARDS = [
    [-1, -0.9, 30], [-0.6, -1.2, -40], [0.2, -1.3, 60], [0.8, -1, -20], [1.2, -0.4, 80], [1.1, 0.6, -60],
    [0.5, 1.1, 25], [-0.3, 1.2, -75], [-1, 0.8, 45], [-1.3, 0.1, -15], [0.1, -0.7, 90], [-0.7, 0.4, 10],
];

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
            const size0 = parseFloat(getComputedStyle(node).fontSize) || 16;
            let size = size0;
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

const HEX = /^#[0-9a-f]{6}$/i;

const onLight = (color) => {
    if (!HEX.test(color ?? "")) return color ?? "#55555c";
    const b = getBrightness(color);
    return b > 160 ? darkenHex(color, Math.min(0.62, 0.18 + (b - 160) / 200)) : color;
};

const textOn = (color) => (HEX.test(color ?? "") && getBrightness(color) > 150 ? "#121214" : "#ffffff");

const teamVars = (team) => {
    const color = team?.color ?? "#8b909e";
    return {
        "--team": color,
        "--team-dark": HEX.test(color) ? readableOnDark(color) : color,
        "--team-light": onLight(color),
        "--team-text": textOn(color),
    };
};

const roundsPlayed = (s) => (s.roundWins ?? 0) + (s.roundLosses ?? 0);

const firstTo = (s) => 16 + Math.max(0, (s.overtimeBlock ?? 1) - 1) * 3;

const streakLevel = (streak) => (streak >= 10 ? 5 : streak >= 7 ? 4 : streak >= 5 ? 3 : streak >= 3 ? 2 : streak >= 2 ? 1 : 0);

const splitStage = (stageText) => {
    const parts = String(stageText ?? "").split(" | ").filter(Boolean);
    if (parts.length > 1) return [parts.slice(0, -1).join(" · "), parts[parts.length - 1]];
    return ["", parts[0] ?? ""];
};

const matchName = (stageText) => {
    const [top, bottom] = splitStage(stageText);
    const group = top.split(" · ").find((part) => /^Group [A-Z]/i.test(part.trim()));
    return group ? `${group.trim()} · ${bottom}` : bottom;
};

export const EwcWordmark = ({ className = "" }) => (
    <svg className={`${css.wordmark} ${className}`} viewBox="0 0 92 30" aria-label="EWC" role="img">
        <g transform="translate(7.5 0) skewX(-14)">
            <path d="M0 0H24V7H8V11.5H20V18.5H8V23H24V30H0V19L3.6 15L0 11Z" />
            <path d="M27 0H34V23H37.5V0H44.5V23H48V0H55V30H27Z" />
            <path d="M58 0H84V10.5H79V7H65V23H79V19.5H84V30H58Z" />
        </g>
    </svg>
);

const Tab = ({ road = false, number = null, match = "", flash = false, className = "", ...motionProps }) => {
    const Tag = Object.keys(motionProps).length ? motion.span : "span";
    return (
        <Tag className={`${css.tab} ${className}`} data-flash={flash ? "true" : "false"} {...motionProps}>
            <span className={css.tab_flash} aria-hidden="true" />
            {road ? (
                <span className={css.road}>
                    <span className={css.road_text}>Road to</span>
                </span>
            ) : null}
            <EwcWordmark />
            {number ? <span className={css.tab_number}>{plainText(number)}</span> : null}
            {match ? <span className={css.tab_divider} aria-hidden="true" /> : null}
            {match ? (
                <span className={css.match}>
                    <span className={css.match_text}>
                        <Fit>{match}</Fit>
                    </span>
                </span>
            ) : null}
        </Tag>
    );
};

const plainText = (node) => {
    if (node == null || typeof node === "boolean") return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(plainText).join("");
    return plainText(node.props?.children);
};

const Beams = ({ className = "" }) => (
    <span className={`${css.beams} ${className}`} aria-hidden="true">
        <span className={`${css.beam} ${css.beam_1}`} />
        <span className={`${css.beam} ${css.beam_2}`} />
        <span className={`${css.beam} ${css.beam_3}`} />
        <span className={`${css.beam} ${css.beam_4}`} />
        <span className={css.beams_core} />
    </span>
);

const Logo = ({ team, className = "" }) => <span className={`${css.logo} ${className}`} style={{ background: team?.color ?? "#8b909e" }} />;

const Streak = ({ streak = 0 }) => {
    const level = streakLevel(streak);
    return (
        <span className={css.streak} data-level={level} aria-hidden={level ? undefined : "true"} title={level ? `${streak} rounds in a row` : undefined}>
            <span className={css.streak_tris}>
                {[0, 1, 2].map((i) => (
                    <span key={i} className={css.streak_tri} data-on={i < Math.min(3, Math.ceil(level * 0.6)) ? "true" : "false"} />
                ))}
            </span>
            <span key={streak} className={css.streak_num}>{streak}</span>
        </span>
    );
};

const Panel = ({ side, team, finale = null, play = false, result = null, opacity = 1, streak = 0, roundWon = null }) => (
    <div
        className={`${css.panel} ${side === "right" ? css.panel_right : ""} ${finale ? css[`panel_${finale}`] : ""} ${finale && play ? css.play : ""}`}
        style={{ ...teamVars(team), "--panel-content": opacity }}
        data-streak={streakLevel(streak)}
    >
        <span className={css.panel_clip} aria-hidden="true">
            <span className={css.momentum}>
                <span className={css.momentum_beam} />
                <span className={`${css.momentum_beam} ${css.momentum_beam_2}`} />
            </span>
            {roundWon}
            {finale === "won" || finale === "setwon" ? (
                <>
                    <span className={css.panel_fill} />
                    <span className={css.panel_sweep} />
                </>
            ) : null}
        </span>
        <span className={css.panel_bar} />
        <span className={css.panel_name}>
            <Fit>{team?.name}</Fit>
        </span>
        <Streak streak={streak} />
        <span className={css.panel_logo}>
            {finale === "won" && play ? (
                <>
                    <span className={`${css.ring} ${css.ring_1}`} aria-hidden="true" />
                    <span className={`${css.ring} ${css.ring_2}`} aria-hidden="true" />
                </>
            ) : null}
            <Logo team={team} className={css.panel_circle} />
            {result ? <span className={`${css.result} ${css[`result_${result}`]}`}>{result === "won" ? <FaCheck aria-hidden="true" /> : <FaXmark aria-hidden="true" />}</span> : null}
        </span>
    </div>
);

const Score = ({ value, animated = true }) => (
    <span className={css.score_cell}>
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
                key={value}
                className={css.score}
                initial={animated ? { y: "34%", opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                exit={animated ? { y: "-34%", opacity: 0 } : undefined}
                transition={{ duration: 0.22, ease: EASE }}
            >
                {value}
            </motion.span>
        </AnimatePresence>
    </span>
);

const Segments = ({ total, lit, team, side }) => (
    <span className={`${css.segs} ${side === "right" ? css.segs_right : ""}`} data-n={Math.min(total, 5)} style={teamVars(team)}>
        {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`${css.seg} ${i < lit ? css.seg_lit : ""}`} />
        ))}
    </span>
);

const Clock = ({ top, text, tone = "normal" }) => (
    <span className={css.clock} data-tone={tone}>
        <span className={css.clock_top}>
            <Fit>{top}</Fit>
        </span>
        <span key={`${tone}-${text}`} className={css.clock_text}>
            <Fit>{text}</Fit>
        </span>
    </span>
);

const Centre = ({ leftTeam, rightTeam, leftScore, rightScore, clock, setsTotal, leftSets, rightSets, animated = true }) => (
    <div className={css.centre}>
        <span className={css.centre_shape} />
        <span className={css.centre_grid}>
            <span className={css.side_cell}>
                <Score value={leftScore} animated={animated} />
                {setsTotal > 0 ? <Segments total={setsTotal} lit={leftSets} team={leftTeam} side="left" /> : null}
            </span>
            <Clock {...clock} />
            <span className={`${css.side_cell} ${css.side_cell_right}`}>
                <Score value={rightScore} animated={animated} />
                {setsTotal > 0 ? <Segments total={setsTotal} lit={rightSets} team={rightTeam} side="right" /> : null}
            </span>
        </span>
    </div>
);

const PointTab = ({ label, team, side }) => {
    const lastRef = useRef(label);
    if (label) lastRef.current = label;
    return (
        <span className={`${css.point_wrap} ${side === "right" ? css.point_wrap_right : ""}`} data-shown={label ? "true" : "false"} aria-hidden={label ? undefined : "true"}>
            <span className={`${css.point} ${side === "right" ? css.point_right : ""}`} style={teamVars(team)}>
                <span className={css.point_glow} />
                <span className={css.point_text}>{lastRef.current || ""}</span>
            </span>
        </span>
    );
};

const Bar = ({ leftTeam, rightTeam, leftScore, rightScore, clock, setsTotal, leftSets, rightSets, finale = {}, result = {}, opacity = {}, play = false, cheat = {}, streak = {}, points = {}, roundWon = {}, animated = true }) => (
    <div className={css.bar}>
        <PointTab label={points.left} team={leftTeam} side="left" />
        <PointTab label={points.right} team={rightTeam} side="right" />
        <Panel side="left" team={leftTeam} finale={finale.left} result={result.left} opacity={opacity.left ?? 1} play={play} streak={streak.left ?? 0} roundWon={roundWon.left} />
        <Centre leftTeam={leftTeam} rightTeam={rightTeam} leftScore={leftScore} rightScore={rightScore} clock={clock} setsTotal={setsTotal} leftSets={leftSets} rightSets={rightSets} animated={animated} />
        <Panel side="right" team={rightTeam} finale={finale.right} result={result.right} opacity={opacity.right ?? 1} play={play} streak={streak.right ?? 0} roundWon={roundWon.right} />
        {cheat.left ? <span className={`${base.cheat_indicator} ${base.cheat_indicator_left} ${css.cheat}`} aria-hidden="true" /> : null}
        {cheat.right ? <span className={`${base.cheat_indicator} ${base.cheat_indicator_right} ${css.cheat}`} aria-hidden="true" /> : null}
    </div>
);

const UnderTab = ({ text, tone = "normal" }) => {
    const lastRef = useRef(text);
    if (text) lastRef.current = text;
    return (
        <span className={css.under_wrap} data-shown={text ? "true" : "false"}>
            <span className={css.under_tab} data-tone={tone}>
                <span className={css.under_sheen} aria-hidden="true" />
                <span className={css.under_text}>
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={lastRef.current || "none"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                            <Fit>{lastRef.current}</Fit>
                        </motion.span>
                    </AnimatePresence>
                </span>
            </span>
        </span>
    );
};

const ScoreBox = ({ team, value }) => (
    <span className={css.box} style={teamVars(team)}>
        <span key={value} className={css.box_num}>{value}</span>
    </span>
);

const Pips = ({ team, total, lit, side }) => (
    <span className={`${css.pips} ${side === "right" ? css.pips_right : ""}`} data-long={total > 6 ? "true" : "false"} style={teamVars(team)}>
        {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`${css.pip} ${i < lit ? css.pip_lit : ""}`} />
        ))}
    </span>
);

const penWindow = (results, nextIndex) => {
    const reach = Math.max(results.length, nextIndex == null ? 0 : nextIndex + 1, PEN_SLOTS);
    const start = reach - PEN_SLOTS;
    return Array.from({ length: PEN_SLOTS }, (_, i) => start + i);
};

const PenSlots = ({ team, results = [], side, nextIndex = null, resolved = false }) => (
    <span className={`${css.pips} ${css.pen_slots} ${side === "right" ? css.pips_right : ""}`} style={teamVars(team)}>
        {penWindow(results, nextIndex).map((index) => {
            const result = results[index] ?? null;
            return (
                <span key={index} className={`${css.pen} ${index >= 5 ? css.pen_sd : ""} ${index === nextIndex && !resolved ? css.pen_next : ""}`} data-result={result ?? "none"} title={index >= 5 ? "Sudden death" : undefined}>
                    <span className={css.pen_fill} />
                    <span className={css.pen_icon}>{result === "success" ? <FaCheck aria-hidden="true" /> : result === "fail" ? <FaXmark aria-hidden="true" /> : index >= 5 ? "SD" : null}</span>
                </span>
            );
        })}
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

const useRoundWon = (s, setsToWin) => {
    const refs = { left: useRef(null), right: useRef(null) };
    const flashRefs = { left: useRef(null), right: useRef(null) };
    const timers = { left: useRef(null), right: useRef(null) };
    const flashTimers = { left: useRef(null), right: useRef(null) };
    const [labels, setLabels] = useState({ left: ["Round won", ""], right: ["Round won", ""] });
    const action = s.pendingAction;

    const fire = (side, label, ms) => {
        setLabels((prev) => ({ ...prev, [side]: label }));
        cueOn(refs[side].current, timers[side], ms);
        cueOn(flashRefs[side].current, flashTimers[side], Math.min(ms, 1400));
    };

    useRoundCue(
        s,
        (side) => fire(side, ["Round won", ""], FLASH_MS),
        () => {
            ["left", "right"].forEach((side) => {
                cueOff(refs[side].current, timers[side]);
                cueOff(flashRefs[side].current, flashTimers[side]);
            });
        },
    );

    useEffect(() => {
        if (!action?.executeAt || !SET_ACTIONS.includes(action.type) || s.banner) return;
        const ms = setBannerMs(action.executeAt - Date.now());
        if (!ms) return;
        const side = setWinnerSide(s, action);
        const setName = pemSetLabel(s.setNumber ?? 1, setsToWin * 2 - 1);
        fire(side, [setName === "Decider" ? "Wins the Decider" : `Wins ${setName}`, `${s.roundWins ?? 0}:${s.roundLosses ?? 0}`], ms);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action?.executeAt]);

    useEffect(
        () => () => [...Object.values(timers), ...Object.values(flashTimers)].forEach((timer) => clearTimeout(timer.current)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const tabs = ["left", "right"].map((side) => {
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        const [label, sub] = labels[side];
        return (
            <span key={side} ref={refs[side]} data-state="off" data-from={side} className={css.won} style={teamVars(team)} onAnimationEnd={settleOut} aria-hidden="true">
                <span className={css.won_inner}>
                    <span className={css.won_block}>
                        <Logo team={team} className={css.won_logo} />
                    </span>
                    <span className={css.won_tab}>
                        <span className={css.won_text}>{label}</span>
                        {sub ? <span className={css.won_sub}>{sub}</span> : null}
                        <span className={css.won_line} />
                    </span>
                </span>
            </span>
        );
    });

    const flash = (side) => <span ref={flashRefs[side]} data-state="off" className={css.panel_flash} onAnimationEnd={settleOut} />;

    return { tabs, flash: { left: flash("left"), right: flash("right") } };
};

const ewcCue = (s, setsToWin) => {
    const action = s.pendingAction;
    if (!action) return null;
    const rw = s.roundWins ?? 0;
    const rl = s.roundLosses ?? 0;
    const block = s.isOvertime ? Math.max(0, s.overtimeBlock ?? 0) : 0;
    const total = setsToWin * 2 - 1;

    if (SET_ACTIONS.includes(action.type)) {
        const leftSets = s.playerWonSets ?? 0;
        const rightSets = s.playerLostSets ?? 0;
        if (Math.max(leftSets, rightSets) >= setsToWin) return null;
        const next = pemSetLabel((s.setNumber ?? 1) + 1, total);
        return { key: action.executeAt, kind: "set", score: `${leftSets}:${rightSets}`, big: next, sub: "Up next" };
    }

    if (action.type === "NEXT_OT") {
        return { key: action.executeAt, kind: "ot", score: `${rw}:${rl}`, big: pemOvertimeName(block + 1), sub: `First to ${16 + block * 3}` };
    }

    return null;
};

const UpNext = ({ seriesState: s, setsToWin }) => {
    const action = s.pendingAction;
    const [timed, setTimed] = useState(null);

    useEffect(() => {
        if (!action?.executeAt) return undefined;
        const remaining = action.executeAt - Date.now();
        if (remaining < STINGER_MIN_MS) return undefined;
        const cue = ewcCue(s, setsToWin);
        if (!cue) return undefined;
        const wait = cue.kind === "set" ? setBannerMs(remaining) : 0;
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
        ?? (extended ? { key: extended.key, kind: "er", score: `${s.roundWins ?? 0}:${s.roundLosses ?? 0}`, big: extended.text, sub: `First to ${ER_TO_WIN}` } : null);

    return (
        <AnimatePresence>
            {shown ? (
                <motion.div key={shown.key} className={css.next} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.22, ease: "easeIn" } }} transition={{ duration: 0.2 }} aria-hidden="true">
                    <motion.span className={css.next_block} initial={{ x: 26, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.32, ease: EASE }}>
                        <Logo team={s.leftTeam} className={css.next_logo} />
                    </motion.span>
                    <motion.span className={css.next_score} initial={{ scaleY: 0.4, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ duration: 0.28, delay: 0.06, ease: EASE }}>
                        {shown.score}
                    </motion.span>
                    <motion.span className={css.next_block} initial={{ x: -26, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.32, ease: EASE }}>
                        <Logo team={s.rightTeam} className={css.next_logo} />
                    </motion.span>
                    <motion.span className={css.next_map} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.14, ease: EASE }}>
                        <Beams className={css.next_beams} />
                        <span className={css.next_text}>
                            <span className={css.next_big}>
                                <Fit>{shown.big}</Fit>
                            </span>
                            <span className={css.next_sub}>{shown.sub}</span>
                        </span>
                        <motion.span className={css.next_line} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.3, ease: EASE }} />
                    </motion.span>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

const LiveDot = ({ chips }) => {
    const current = chips.findIndex((chip) => chip.status === "current");
    const lastPlayed = chips.reduce((last, chip, i) => (chip.result ? i : last), -1);
    const posRef = useRef(current >= 0 ? current : Math.max(0, lastPlayed));
    const moveRef = useRef({ from: posRef.current, ignite: false, mounted: false });
    const live = current >= 0;
    if (live && current !== posRef.current) {
        moveRef.current = { from: posRef.current, ignite: true, mounted: true };
        posRef.current = current;
    } else if (!live && lastPlayed >= 0 && lastPlayed !== posRef.current && lastPlayed > posRef.current) {
        posRef.current = lastPlayed;
    }
    const pos = posRef.current;
    const toWin = Math.ceil(chips.length / 2);
    const wins = {};
    chips.forEach((chip) => {
        if (chip.result && chip.winnerTeam) wins[chip.winnerTeam.id] = (wins[chip.winnerTeam.id] ?? 0) + 1;
    });
    const over = !live && Object.values(wins).some((n) => n >= toWin);
    const shown = chips.length > 0 && (live || lastPlayed >= 0);
    const igniting = live && moveRef.current.ignite;
    const wasLiveRef = useRef(live);
    const fizzleRef = useRef(false);
    if (wasLiveRef.current !== live) {
        fizzleRef.current = !live;
        wasLiveRef.current = live;
    }
    return (
        <span className={css.live_dot} data-shown={shown ? "true" : "false"} data-mode={live ? "live" : "out"} data-fizzle={fizzleRef.current ? "true" : "false"} data-over={over ? "true" : "false"} style={{ "--k": pos + 1 }} aria-hidden="true">
            <span className={css.live_dot_ash} />
            <span key={`${pos}-${live ? "live" : "out"}`} className={css.live_dot_flame} data-ignite={igniting ? "true" : "false"}>
                <span className={css.tile_live} />
                <span className={css.live_dot_spark} />
            </span>
        </span>
    );
};

export const EwcSets = ({ chips, bestOf, selectedIndex = null, onSelect = null, extra = null }) => (
    <div className={`${css.hud} ${css.sets}`} data-count={chips.length > 7 ? "many" : chips.length > 5 ? "more" : "few"}>
        {extra}
        <span className={css.strip_wrap}>
        <span className={css.strip}>
            <span className={`${css.tile} ${css.tile_bo}`}>
                <span className={css.tile_pic}>
                    <span className={css.tile_bo_value}>{bestOf}</span>
                </span>
                <span className={css.tile_band}>Best of</span>
            </span>
            {chips.map((chip, i) => {
                    const Tag = onSelect ? "button" : "span";
                    const selected = selectedIndex === i;
                    const leftWon = chip.result ? (chip.result.extra ? chip.result.extra.left > chip.result.extra.right : chip.result.leftScore > chip.result.rightScore) : null;
                    const many = chips.length > 5;
                    const name = chip.label === "DEC" ? (many ? "DEC" : "Decider") : many ? `S${chip.set}` : `Set ${chip.set}`;
                    const mark = chip.label === "DEC" ? "DEC" : `S${chip.set}`;
                    const done = !!chip.result;
                    return (
                        <Tag
                            key={chip.set}
                            type={onSelect ? "button" : undefined}
                            disabled={onSelect ? selected : undefined}
                            onClick={onSelect ? () => onSelect(i) : undefined}
                            className={`${css.tile} ${css[`tile_${chip.status}`] ?? ""} ${selected ? css.tile_selected : ""}`}
                            data-done={done ? "true" : "false"}
                            data-extra={chip.result?.extra ? "true" : "false"}
                            title={chip.winnerTeam ? `${chip.label === "DEC" ? "Decider" : `Set ${chip.set}`}: Team ${chip.winnerTeam.name}` : undefined}
                        >
                            <span className={css.tile_pic}>
                                <span className={css.tile_mark} aria-hidden="true">{mark}</span>
                                <span className={css.tile_logo_slot}>
                                    <Logo team={chip.winnerTeam} className={css.tile_logo} />
                                </span>
                                <span className={css.tile_extra}>
                                    {chip.result?.extra ? `${chip.result.extra.label} ${chip.result.extra.left}:${chip.result.extra.right}` : ""}
                                </span>
                            </span>
                            <span className={css.tile_band}>
                                <span className={css.tile_name}>{name}</span>
                                <span className={`${css.tile_name} ${css.tile_name_live}`} aria-hidden="true">{name}</span>
                                <span className={`${css.tile_score} ${done ? (leftWon ? css.tile_win : css.tile_loss) : ""}`}>
                                    {done ? `${chip.result.leftScore}:${chip.result.rightScore}` : ""}
                                </span>
                            </span>
                        </Tag>
                    );
                })}
        </span>
        {onSelect ? null : <LiveDot chips={chips} />}
        </span>
        {extra ? cloneElement(extra, { ghost: true }) : null}
    </div>
);

const pointLabels = (point) => {
    const label = point?.label ?? "";
    if (!label) return { left: "", right: "" };
    return {
        left: point.side === "left" || point.side === "both" ? label : "",
        right: point.side === "right" || point.side === "both" ? label : "",
    };
};

export function EwcScorebug({
    seriesState,
    setsToWin,
    eventNumber,
    stageText,
    point,
    activeCheat,
    finalRoundMinis,
    displayedMiniSquares,
    penaltyAttempt,
    suddenDeath,
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
    const live = s.tiebreakerPhase === "idle" && !s.banner && !preview;
    const pending = !!s.pendingAction && ["NEXT_SET", "NEXT_SET_AFTER_PENALTIES", "NEXT_OT", "START_EXTENDED"].includes(s.pendingAction.type);
    const roundWon = useRoundWon(s, setsToWin);

    const leftMinis = finalRoundMinis && !preview ? finalRoundMinis.left : view.miniWins ?? 0;
    const rightMinis = finalRoundMinis && !preview ? finalRoundMinis.right : view.miniLosses ?? 0;

    const setOver = !!s.pendingAction && SET_ACTIONS.includes(s.pendingAction.type);
    const clock = s.banner
        ? s.banner.tie ? { top: "", text: "Draw", tone: "final" } : { top: "", text: "GG", tone: "gg" }
        : setOver
            ? { top: "", text: "", tone: "final" }
        : isPens
            ? { top: suddenDeath ? "Sudden death" : "Penalties", text: `${penaltyAttempt}`, tone: "tiebreak" }
            : isExtended
                ? { top: "Extended", text: "ER", tone: "tiebreak" }
                : { top: "Round", text: `${Math.max(1, roundsPlayed(view) + 1)}`, tone: "normal" };

    const turnTeam = s.penaltyTurn === "right" ? s.rightTeam : s.leftTeam;
    const block = Math.max(1, view.overtimeBlock ?? 1);
    const underText = s.banner
        ? s.banner.tie ? "Draw" : `Team ${winnerTeam?.name} wins the series`
        : isPens
            ? s.penaltyResolved
                ? `Penalties - ${s.penaltyLeftScore ?? 0}:${s.penaltyRightScore ?? 0}`
                : `${suddenDeath ? "Sudden death" : `Attempt ${penaltyAttempt}`} - Team ${turnTeam?.name} shoots`
            : isExtended
                ? `Extended Rounds - First to ${ER_TO_WIN}`
                : view.isOvertime
                    ? `${pemOvertimeName(block)} - First to ${firstTo(view)}`
                    : "";
    const underTone = s.banner ? "gg" : "normal";
    const points = live && !pending ? pointLabels(point) : { left: "", right: "" };
    const streakOf = (side) => (live ? s.liveStats?.[side]?.momentum ?? 0 : 0);

    const finaleFor = (side) => (winnerSide ? (winnerSide === side ? "won" : "lost") : null);
    const nextLeft = !s.penaltyResolved && s.penaltyTurn === "left" ? s.penaltyLeftResults?.length ?? 0 : null;
    const nextRight = !s.penaltyResolved && s.penaltyTurn === "right" ? s.penaltyRightResults?.length ?? 0 : null;

    return (
        <div className={`${css.hud} ${css.scorebug} ${entrance ? css.entrance : ""} ${celebrate ? "" : css.static}`} data-finale={winnerSide ?? "none"}>
            <div className={css.side_left}>
                {setsToWin > 1 || perksShown ? <EwcSets chips={setsToWin > 1 ? buildPemSetChips(s) : []} bestOf={setsToWin * 2 - 1} extra={<HudInsurance variant="ewc" hud={css} seriesState={s} />} /> : null}
            </div>
            <div className={css.bug}>
                <Tab road={s.phase === "ewcOq"} number={eventNumber} match={matchName(stageText)} flash={!!winnerSide && celebrate} />
                <Bar
                    leftTeam={s.leftTeam}
                    rightTeam={s.rightTeam}
                    leftScore={view.roundWins ?? 0}
                    rightScore={view.roundLosses ?? 0}
                    clock={clock}
                    setsTotal={setsToWin}
                    leftSets={s.playerWonSets ?? 0}
                    rightSets={s.playerLostSets ?? 0}
                    finale={{ left: finaleFor("left"), right: finaleFor("right") }}
                    play={celebrate}
                    cheat={{ left: isCheatTargeting(activeCheat, "left"), right: isCheatTargeting(activeCheat, "right") }}
                    streak={{ left: streakOf("left"), right: streakOf("right") }}
                    points={points}
                    roundWon={roundWon.flash}
                />
                {winnerSide && celebrate ? (
                    <span className={css.finale_back} style={teamVars(winnerTeam)} aria-hidden="true">
                        <span className={css.finale_glow} />
                        {[0, 1, 2].map((i) => (
                            <svg key={i} className={css.finale_tri} style={{ "--td": `${i * 260}ms` }} viewBox="0 0 200 174">
                                <path d="M100 4L196 170H4Z" />
                            </svg>
                        ))}
                    </span>
                ) : null}
                {winnerSide && celebrate ? (
                    <span className={css.finale} data-from={winnerSide} aria-hidden="true">
                        <span className={css.finale_shards} style={teamVars(winnerTeam)}>
                            {SHARDS.map(([x, y, r], i) => (
                                <span key={i} className={css.shard} style={{ "--sx": `${x * 150}px`, "--sy": `${y * 70}px`, "--sr": `${r * 4}deg`, "--sd": `${(i % 6) * 35}ms` }} />
                            ))}
                        </span>
                    </span>
                ) : null}
                <UnderTab text={underText} tone={underTone} />
                <div className={css.below}>
                    {isPens ? (
                        <span className={css.minis} data-hidden={pending ? "true" : "false"}>
                            <PenSlots team={s.leftTeam} results={s.penaltyLeftResults} side="left" nextIndex={nextLeft} resolved={s.penaltyResolved} />
                            <ScoreBox team={s.leftTeam} value={s.penaltyLeftScore ?? 0} />
                            <span className={css.vs}>VS</span>
                            <ScoreBox team={s.rightTeam} value={s.penaltyRightScore ?? 0} />
                            <PenSlots team={s.rightTeam} results={s.penaltyRightResults} side="right" nextIndex={nextRight} resolved={s.penaltyResolved} />
                        </span>
                    ) : (
                        <span className={css.minis} data-hidden={!live || pending || !target ? "true" : "false"}>
                            <Pips team={s.leftTeam} total={target || 5} lit={leftMinis} side="left" />
                            <ScoreBox team={s.leftTeam} value={leftMinis} />
                            <span className={css.vs}>VS</span>
                            <ScoreBox team={s.rightTeam} value={rightMinis} />
                            <Pips team={s.rightTeam} total={target || 5} lit={rightMinis} side="right" />
                        </span>
                    )}
                    {roundWon.tabs}
                    <UpNext seriesState={s} setsToWin={setsToWin} />
                </div>
            </div>
        </div>
    );
}

export const EwcRow = ({
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
    const finaleSide = ggBanner && !ggBanner.tie ? (leftGlow ? "left" : rightGlow ? "right" : null) : null;
    const label = String(leftLabel || rightLabel || "").replace(/!+$/, "");
    const penLeft = penalties ? (penalties.leftResults ?? []).filter((r) => r === "success").length : 0;
    const penRight = penalties ? (penalties.rightResults ?? []).filter((r) => r === "success").length : 0;
    const tally = penalties ? `${penLeft}:${penRight}` : squaresTotal > 0 ? `${leftSquares}:${rightSquares}` : "-";
    const top = ggBanner
        ? ""
        : penalties
            ? "Penalties"
            : roundNumber != null
                ? `Round ${roundNumber}`
                : extended
                    ? "Extended Round"
                    : "";
    const topNode = extended?.onClick ? (
        <button type="button" className={css.centre_link} onClick={extended.onClick} title="Show this round in the Extended Rounds">
            {top || "Extended Round"}
        </button>
    ) : top;
    const clock = ggBanner ? (ggBanner.tie ? { top: "", text: "Draw", tone: "final" } : { top: "", text: "GG", tone: "gg" }) : { top: topNode, text: tally, tone: penalties || extended ? "tiebreak" : "normal" };
    const resultFor = (side) => ((side === "left" ? leftGlow : rightGlow) ? "won" : (side === "left" ? rightGlow : leftGlow) ? "lost" : null);
    const finaleOf = (side) => (finaleSide ? (finaleSide === side ? "won" : "lost") : null);
    const winner = winnerSide === "left" ? leftTeam : winnerSide === "right" ? rightTeam : null;
    const streakOf = (side) => (finaleSide || penalties ? 0 : (side === "left" ? leftMomentumStreak : rightMomentumStreak) ?? 0);

    return (
        <div ref={ref} className={css.row_wrap}>
            <div className={`${css.hud} ${css.row} ${inView ? "" : css.static}`}>
                <Bar
                    leftTeam={leftTeam}
                    rightTeam={rightTeam}
                    leftScore={leftScore}
                    rightScore={rightScore}
                    clock={clock}
                    setsTotal={setLinesTotal}
                    leftSets={leftSets}
                    rightSets={rightSets}
                    finale={{ left: finaleOf("left"), right: finaleOf("right") }}
                    result={{ left: resultFor("left"), right: resultFor("right") }}
                    opacity={{ left: leftOpacity, right: rightOpacity }}
                    streak={{ left: streakOf("left"), right: streakOf("right") }}
                    points={{ left: /point/i.test(leftLabel) ? label : "", right: /point/i.test(rightLabel) ? label : "" }}
                    animated={false}
                />
                {winner && !ggBanner && !penalties ? (
                    <span className={css.row_won} data-from={winnerSide} style={teamVars(winner)}>
                        <span className={css.won_block}>
                            <Logo team={winner} className={css.won_logo} />
                        </span>
                        <span className={css.won_tab}>
                            <span className={css.won_text}>Round won</span>
                            <span className={css.won_line} />
                        </span>
                    </span>
                ) : null}
            </div>
        </div>
    );
};

export const EwcBoard = ({
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
        ? { top: "Series winner", text: "GG", tone: "gg" }
        : played != null
            ? { top: `${roundsLabel} played`, text: played, tone: "normal" }
            : { top: "Extended", text: "ER", tone: "tiebreak" };
    const resultFor = (side) => ((side === "left" ? leftGlow : rightGlow) ? "won" : (side === "left" ? rightGlow : leftGlow) ? "lost" : null);
    const finaleFor = (side) => {
        const result = resultFor(side);
        if (!result) return null;
        if (seriesSide) return seriesSide === side ? "won" : "lost";
        return result === "won" ? "setwon" : "setlost";
    };

    return (
        <div className={`${css.hud} ${css.board} ${css.static}`}>
            <Bar
                leftTeam={leftTeam}
                rightTeam={rightTeam}
                leftScore={leftScore}
                rightScore={rightScore}
                clock={clock}
                setsTotal={setLinesTotal}
                leftSets={leftSets}
                rightSets={rightSets}
                finale={{ left: finaleFor("left"), right: finaleFor("right") }}
                result={{ left: resultFor("left"), right: resultFor("right") }}
                animated={false}
            />
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
                            initial={{ rotateY: -90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: faded ? 0.4 : 1 }}
                            transition={{ rotateY: { duration: 0.36, ease: EASE }, opacity: { duration: faded ? 0.6 : 0.2, delay: faded ? 0.4 : 0 } }}
                        >
                            <span className={css.er_block}>
                                <Logo team={team} className={css.er_mark} />
                            </span>
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
            <motion.span className={css.er_tally} initial={false} animate={{ opacity: revealed ? 1 : 0.3 }}>
                {revealed ? round.tallyLeft : "-"}
                <span className={css.er_tally_sep}>:</span>
                {revealed ? round.tallyRight : "-"}
            </motion.span>
        </div>
    );
};

export const EwcExtendedRoundsOverlay = ({ seriesState, details, setsToWin, eventName, eventNumber }) => {
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
                <span className={css.er_event}>
                    <Fit>
                        {eventName} {eventNumber} · Still {roundWins}-{roundLosses} after Quadruple Overtime
                    </Fit>
                </span>
                <div className={css.bug}>
                    <Tab road={seriesState.phase === "ewcOq"} number={eventNumber} />
                    <Bar
                        leftTeam={leftTeam}
                        rightTeam={rightTeam}
                        leftScore={leftScore ?? 0}
                        rightScore={rightScore ?? 0}
                        clock={{ top: "Compared", text: `${revealedCount}/${total}`, tone: "tiebreak" }}
                        setsTotal={ER_TO_WIN}
                        leftSets={Math.min(leftScore ?? 0, ER_TO_WIN)}
                        rightSets={Math.min(rightScore ?? 0, ER_TO_WIN)}
                        finale={{ left: finale("left"), right: finale("right") }}
                    />
                    <UnderTab text={`Extended Rounds - First to ${ER_TO_WIN}`} />
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
                            initial={{ opacity: 0, x: -24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 24 }}
                            transition={{ duration: 0.28, ease: EASE }}
                        >
                            <span className={css.er_status_block}>
                                {status.team ? <Logo team={status.team} className={css.er_status_logo} /> : <EwcWordmark className={css.er_status_mark} />}
                            </span>
                            <span className={css.er_status_body}>
                                <span className={css.er_status_label}>{status.label}</span>
                                <span className={css.er_status_text}>{status.text}</span>
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export function EwcIntro({ seriesState, eventName, eventNumber, stageText, setsToWin, onDone }) {
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
    const stageLine = (top && bottom.toLowerCase().startsWith(top.toLowerCase()) ? [bottom] : [top, bottom]).filter(Boolean).join(" · ");

    return (
        <AnimatePresence onExitComplete={onDone}>
            {open ? (
                <motion.div
                    key="ewc-intro"
                    className={`${css.hud} ${css.intro}`}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.3 } }}
                    transition={{ duration: 0.25 }}
                >
                    <motion.span className={css.intro_beams_wrap} initial={{ opacity: 0, scale: 1.25 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: EASE }} aria-hidden="true">
                        <Beams className={css.intro_beams} />
                    </motion.span>
                    <motion.div className={css.intro_head} initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14, transition: { duration: 0.2 } }} transition={{ duration: 0.45, delay: 0.45, ease: EASE }}>
                        <span className={css.intro_mark}>
                            <HudTrophy type="ewc" size={74} />
                        </span>
                        <span className={css.intro_event}>
                            {eventName} {eventNumber}
                        </span>
                    </motion.div>
                    <div className={css.intro_bug}>
                        <Tab road={seriesState.phase === "ewcOq"} number={eventNumber} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 1.25, ease: EASE }} />
                        <div className={css.bar}>
                            {["left", "right"].map((side) => {
                                const team = side === "left" ? seriesState.leftTeam : seriesState.rightTeam;
                                const from = side === "left" ? -560 : 560;
                                return (
                                    <motion.div
                                        key={side}
                                        className={`${css.intro_panel} ${side === "right" ? css.intro_panel_right : ""}`}
                                        initial={{ x: from, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: from * 0.4, opacity: 0, transition: { duration: 0.26, ease: "easeIn" } }}
                                        transition={{ duration: 0.55, delay: 0.75, ease: EASE }}
                                    >
                                        <Panel side={side} team={team} />
                                        <IntroHome team={team} under={side === "left" ? "left" : "right"} style={{ marginTop: 10, color: "#ffffff" }} />
                                    </motion.div>
                                );
                            })}
                            <motion.div className={css.intro_centre} initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ scaleY: 0, opacity: 0, transition: { duration: 0.2 } }} transition={{ duration: 0.36, delay: 1.05, ease: EASE }}>
                                <span className={css.centre_shape} />
                                <span className={css.intro_vs}>VS</span>
                            </motion.div>
                        </div>
                        <motion.span className={css.intro_under} initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, delay: 1.45, ease: EASE }}>
                            <UnderTab text={`${stageLine}${stageLine ? " - " : ""}Best of ${setsToWin * 2 - 1}`} />
                        </motion.span>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
