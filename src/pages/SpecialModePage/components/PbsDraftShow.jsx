import { useEffect, useLayoutEffect, useRef, useState } from "react";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { TeamCircle } from "./SwissMatch.jsx";
import { FaPause, FaPlay, FaForwardFast } from "react-icons/fa6";
import { BountyGem } from "./Trophies.jsx";
import { PBS_DRAFT_SPEEDS, usePbsClockValue } from "../logic/pbsDraftClock.js";
import { windowProgress, easeInOut, getPbsSlotLanding, PBS_PICK_REASONS } from "../logic/pbs.jsx";
import { PBS_ROUND_TITLES } from "../logic/pbsConfig.js";

const SLOT_W = 68;
const CIRCLE = 46;
const LOW_Y = 42;
const HIGH_Y = 130;
const MID_Y = 86;
const LIFT = 0.22;
const LIFT_PX = 18;
const ARC_PX = 140;

const lerp = (a, b, t) => a + (b - a) * t;

export const PbsTeamTags = ({ seed, bounty, style, size = "normal", vertical = false }) => (
    <span className={`${css.pbs_team_tags} ${size === "small" ? css.pbs_team_tags_small : ""} ${vertical ? css.pbs_team_tags_vertical : ""}`} style={style}>
        <span className={css.pbs_seed_tag} title={`Seed #${seed}`}>#{seed}</span>
        <span className={css.pbs_bounty_tag} title={`${bounty} Bounty Gems`}>
            <BountyGem size={size === "small" ? 10 : 12} />
            {bounty}
        </span>
    </span>
);

const PbsSpeedSelect = ({ value, onChange }) => {
    const wrapRef = useRef(null);
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });

    useLayoutEffect(() => {
        const active = wrapRef.current?.querySelector("[data-group-active='true']");
        if (active) setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
    }, [value]);

    return (
        <div className={css.pbs_draft_speed_select}>
            <span className={css.pbs_draft_speed_label}>Speed</span>
            <div ref={wrapRef} className={css.groups_navigation} style={{ gap: 16 }}>
                {PBS_DRAFT_SPEEDS.map((speed) => {
                    const isActive = speed === value;
                    return (
                        <button
                            key={speed}
                            type="button"
                            data-group-active={isActive}
                            onClick={() => onChange(speed)}
                            className={`${css.resultsNavigationButton} ${css.groupNavigationButton} ${isActive ? css.resultsNavigationButtonActive : ""}`}
                            style={{ fontSize: 20 }}
                        >
                            {speed}x
                        </button>
                    );
                })}
                <motion.div
                    className={css.groupNavigationIndicator}
                    initial={false}
                    animate={{ left: indicator.left, width: indicator.width }}
                    transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
                />
            </div>
        </div>
    );
};

const TeamName = ({ team }) => (
    <span style={{ color: team?.color || "#2e2f42", fontWeight: 900 }}>Team {team?.name}</span>
);

const flightPosition = (t, src, dst) => {
    if (t < LIFT) {
        const u = easeInOut(t / LIFT);
        return { x: src.x, y: src.y - LIFT_PX * u, size: src.size * (1 + 0.18 * u), lift: u };
    }

    const u = easeInOut((t - LIFT) / (1 - LIFT));
    const sx = src.x;
    const sy = src.y - LIFT_PX;
    const cx = (sx + dst.x) / 2;
    const cy = Math.min(sy, dst.y) - ARC_PX;
    const x = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * cx + u * u * dst.x;
    const y = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * cy + u * u * dst.y;

    return { x, y, size: lerp(src.size * 1.18, dst.size, u), lift: 1 - u };
};

const slotSelector = (round, matchIdx, slotKey) => `[data-pbs-slot="${round}-${matchIdx}-${slotKey}"]`;

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"]);

const startAutoScroll = (untilRef, top) => {
    untilRef.current = performance.now() + 400;
    window.scrollTo({ top, behavior: "smooth" });
};

const formatShowTime = (ms) => {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

const PbsDraftControls = ({ clock, timeline, speed, paused, onTogglePause, onSkip }) => {
    const remaining = usePbsClockValue(clock, (value) => Math.ceil(Math.max(0, timeline.rollOut[0] - value) / 1000 / speed));
    const finished = remaining <= 0;

    return (
        <div className={css.pbs_draft_controls}>
            <button
                type="button"
                className={css.pbs_draft_control}
                onClick={onTogglePause}
                disabled={finished}
                title={paused ? "Play the draft" : "Pause the draft"}
                aria-label={paused ? "Play the draft" : "Pause the draft"}
            >
                {paused ? <FaPlay size={13} style={{ marginLeft: 2 }} /> : <FaPause size={13} />}
            </button>
            <button
                type="button"
                className={`${css.pbs_draft_control} ${css.pbs_draft_skip}`}
                onClick={onSkip}
                disabled={finished}
                title="Finish the draft right away"
                aria-label="Finish the draft right away"
            >
                <FaForwardFast size={14} />
                <span className={css.pbs_draft_skip_time}>{formatShowTime(remaining * 1000)}</span>
            </button>
        </div>
    );
};

const scrollTargetAt = (timeline, p) => {
    if (p >= timeline.rollOut[0]) return "final";
    const pick = timeline.picks.find((x) => p >= x.highlight[0] && p < x.flight.end);
    if (pick) return `${pick.matchIdx}-slotA`;
    if (p < timeline.center[0]) {
        const flying = [...timeline.lowFlights].reverse().find((f) => p >= f.start);
        if (flying) return `${flying.matchIdx}-slotA`;
    }
    return null;
};

const captionAt = (timeline, plan, p, teamsById) => {
    const roundTitle = PBS_ROUND_TITLES[plan.round] ?? "";

    if (p < timeline.fadeLow[1]) return <>The draft of the {roundTitle} is about to begin!</>;
    if (p < timeline.center[0]) return <>The Low-Seed Pot takes its places</>;

    const firstPick = timeline.picks[0];
    if (!firstPick || p < firstPick.highlight[0]) return <>The High-Seed Pot is up for grabs</>;

    for (let i = timeline.picks.length - 1; i >= 0; i--) {
        const pick = timeline.picks[i];
        if (p < pick.highlight[0]) continue;

        const picker = teamsById[pick.pickerId];
        const picked = teamsById[pick.pickedId];
        const seed = plan.status?.[pick.pickerId]?.seed;

        if (p < pick.flight.start) {
            return <><TeamName team={picker} /> (Seed #{seed}) is making the pick...</>;
        }

        if (i === timeline.picks.length - 1 && p >= pick.flight.end + 300) return <>All match-ups are set!</>;

        return <><TeamName team={picker} /> {PBS_PICK_REASONS[pick.reason] ?? "picks"}: <TeamName team={picked} />!</>;
    }

    return null;
};

export const PbsDraftShow = ({ clock, plan, timeline, teamsById, ratings, speed, onSpeedChange, paused, onTogglePause, onSkip }) => {
    const p = usePbsClockValue(clock, (value) => value);
    const scrollTarget = usePbsClockValue(clock, (value) => scrollTargetAt(timeline, value));
    const headerRef = useRef(null);
    const rowsRef = useRef(null);
    const lockedScrollRef = useRef(0);
    const autoScrollUntilRef = useRef(0);
    const [rowsWidth, setRowsWidth] = useState(0);

    useLayoutEffect(() => {
        const el = rowsRef.current;
        if (!el) return undefined;
        const measure = () => setRowsWidth(el.clientWidth);
        measure();
        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
        observer?.observe(el);
        window.addEventListener("resize", measure);
        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, []);

    useEffect(() => {
        lockedScrollRef.current = window.scrollY;

        const block = (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
        };
        const blockKeys = (e) => {
            if (!SCROLL_KEYS.has(e.key)) return;
            if (e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))) return;
            block(e);
        };
        const blockMiddleClick = (e) => {
            if (e.button === 1) block(e);
        };
        const holdScroll = () => {
            if (performance.now() < autoScrollUntilRef.current) {
                autoScrollUntilRef.current = Math.max(autoScrollUntilRef.current, performance.now() + 150);
                lockedScrollRef.current = window.scrollY;
                return;
            }
            if (Math.abs(window.scrollY - lockedScrollRef.current) > 1) window.scrollTo(0, lockedScrollRef.current);
        };

        const options = { capture: true, passive: false };
        window.addEventListener("wheel", block, options);
        window.addEventListener("touchmove", block, options);
        window.addEventListener("keydown", blockKeys, options);
        window.addEventListener("mousedown", blockMiddleClick, options);
        window.addEventListener("scroll", holdScroll, { passive: true });

        return () => {
            window.removeEventListener("wheel", block, options);
            window.removeEventListener("touchmove", block, options);
            window.removeEventListener("keydown", blockKeys, options);
            window.removeEventListener("mousedown", blockMiddleClick, options);
            window.removeEventListener("scroll", holdScroll);
        };
    }, []);

    useEffect(() => {
        if (!scrollTarget) return;

        if (scrollTarget === "final") {
            const first = document.querySelector(`[data-pbs-match="${plan.round}-0"]`)?.getBoundingClientRect();
            if (!first) return;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const top = Math.max(0, Math.min(maxScroll, window.scrollY + first.top + first.height / 2 - window.innerHeight / 2));
            if (Math.abs(top - window.scrollY) > 2) startAutoScroll(autoScrollUntilRef, top);
            return;
        }

        const el = document.querySelector(`[data-pbs-slot="${plan.round}-${scrollTarget}"]`);
        const rect = el?.closest("[data-pbs-match]")?.getBoundingClientRect() ?? el?.getBoundingClientRect();
        if (!rect) return;

        const headerTop = headerRef.current?.getBoundingClientRect().top ?? window.innerHeight;
        const visibleTop = 120;
        const visibleBottom = Math.min(window.innerHeight, headerTop) - 16;
        if (rect.top >= visibleTop && rect.bottom <= visibleBottom) return;

        const middle = visibleTop + (visibleBottom - visibleTop - rect.height) / 2;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        startAutoScroll(autoScrollUntilRef, Math.max(0, Math.min(maxScroll, window.scrollY + rect.top - middle)));
    }, [scrollTarget, plan.round]);

    const W = rowsWidth;
    const xOf = (list, id) => W / 2 + (list.indexOf(id) - (list.length - 1) / 2) * SLOT_W;

    const highXAt = (teamId, at) => {
        let list = plan.high;
        let prevList = null;
        let recenter = null;
        for (const pick of timeline.picks) {
            if (at < pick.flight.start) break;
            prevList = list;
            list = list.filter((id) => id !== pick.pickedId);
            recenter = pick.recenter;
        }
        if (!list.includes(teamId)) return xOf(prevList ?? plan.high, teamId);
        if (recenter && prevList && at < recenter[1]) {
            return lerp(xOf(prevList, teamId), xOf(list, teamId), easeInOut(windowProgress(at, recenter)));
        }
        return xOf(list, teamId);
    };

    const highY = lerp(HIGH_Y, MID_Y, easeInOut(windowProgress(p, timeline.center)));
    const highInHeader = plan.high.filter((teamId) => p < (timeline.picks.find((pick) => pick.pickedId === teamId)?.flight.start ?? Infinity));
    const highLabelLeft = highInHeader.length
        ? Math.min(...highInHeader.map((teamId) => highXAt(teamId, p))) - SLOT_W / 2 - 8
        : W / 2 - SLOT_W / 2 - 8;
    const lowLabelOpacity = 1 - windowProgress(p, timeline.fadeLow);
    const hiddenFraction = p < timeline.rollOut[0]
        ? 1 - easeInOut(windowProgress(p, timeline.rollIn))
        : easeInOut(windowProgress(p, timeline.rollOut));

    const considering = (() => {
        for (const pick of timeline.picks) {
            const slot = pick.consider.find((c) => p >= c.start && p < c.end);
            if (slot) return slot.teamId;
        }
        return null;
    })();

    const pickFlights = timeline.picks.map((pick) => pick.flight);
    const pickStartOf = Object.fromEntries(pickFlights.map((f) => [f.teamId, f.start]));

    const renderHeaderTeam = (teamId, x, y, labelOpacity, isConsidered) => {
        const team = teamsById[teamId];
        const status = plan.status?.[teamId];
        if (!team) return null;

        return (
            <div
                key={teamId}
                className={css.pbs_draft_slot}
                style={{ left: x - SLOT_W / 2, top: y - CIRCLE / 2, width: SLOT_W }}
            >
                <span className={`${css.pbs_draft_circle} ${isConsidered ? css.pbs_considering : ""}`}>
                    <TeamCircle
                        team={team}
                        showRating
                        beforeRatingValue={ratings?.[teamId] ?? 0}
                        ratingValue={ratings?.[teamId] ?? 0}
                        specialStyle={{ width: CIRCLE, height: CIRCLE, transition: "none", boxSizing: "border-box" }}
                    />
                </span>
                <PbsTeamTags seed={status?.seed} bounty={status?.bounty ?? 0} size="small" style={{ opacity: labelOpacity }} />
            </div>
        );
    };

    const rowsRect = rowsRef.current?.getBoundingClientRect() ?? null;

    const renderFlight = (flight, slotKey, srcX, srcY) => {
        if (!rowsRect || p < flight.start || p >= flight.end) return null;
        const team = teamsById[flight.teamId];
        if (!team) return null;

        const src = { x: rowsRect.left + srcX, y: rowsRect.top + srcY, size: CIRCLE };
        const target = document.querySelector(slotSelector(plan.round, flight.matchIdx, slotKey))?.getBoundingClientRect();
        const dst = target
            ? { x: target.left + target.width / 2, y: target.top + target.height / 2, size: target.width }
            : src;
        const pos = flightPosition(windowProgress(p, [flight.start, flight.end]), src, dst);

        return (
            <div
                key={`${flight.teamId}-${slotKey}`}
                className={css.pbs_flight_circle}
                style={{
                    left: pos.x - pos.size / 2,
                    top: pos.y - pos.size / 2,
                    width: pos.size,
                    height: pos.size,
                    background: team.color,
                    boxShadow: `0 ${4 + 10 * pos.lift}px ${8 + 16 * pos.lift}px rgba(0, 0, 0, ${0.25 + 0.2 * pos.lift})`,
                }}
            />
        );
    };

    return (
        <>
            <div
                ref={headerRef}
                className={css.pbs_draft_header}
                style={{ transform: `translateY(${hiddenFraction * 100}%)` }}
            >
                <div className={css.pbs_draft_caption}>
                    <span className={css.pbs_draft_title}>
                        Live Draft | {PBS_ROUND_TITLES[plan.round]}
                        {paused ? <span className={css.pbs_draft_paused}>Paused</span> : null}
                    </span>
                    <span className={css.pbs_draft_line}>{captionAt(timeline, plan, p, teamsById)}</span>
                </div>

                <div ref={rowsRef} className={css.pbs_draft_rows}>
                    <span className={css.pbs_pot_label} style={{ left: W / 2 - (plan.low.length * SLOT_W) / 2 - 8, top: LOW_Y - 10, opacity: lowLabelOpacity }}>Low-Seed Pot</span>
                    <span className={css.pbs_pot_label} style={{ left: highLabelLeft, top: highY - 10, opacity: highInHeader.length ? 1 : 0 }}>High-Seed Pot</span>

                    {W > 0 && plan.low.map((teamId, i) =>
                        p < timeline.lowFlights[i].start
                            ? renderHeaderTeam(teamId, xOf(plan.low, teamId), LOW_Y, lowLabelOpacity, false)
                            : null
                    )}
                    {W > 0 && plan.high.map((teamId) =>
                        p < (pickStartOf[teamId] ?? Infinity)
                            ? renderHeaderTeam(teamId, highXAt(teamId, p), highY, 1, considering === teamId)
                            : null
                    )}
                </div>

                <div className={css.pbs_draft_speed}>
                    <PbsSpeedSelect value={speed} onChange={onSpeedChange} />
                    <PbsDraftControls
                        clock={clock}
                        timeline={timeline}
                        speed={speed}
                        paused={paused}
                        onTogglePause={onTogglePause}
                        onSkip={onSkip}
                    />
                </div>
            </div>

            <div className={css.pbs_flight_layer}>
                {W > 0 && timeline.lowFlights.map((flight) =>
                    renderFlight(flight, "slotA", xOf(plan.low, flight.teamId), LOW_Y)
                )}
                {W > 0 && pickFlights.map((flight) =>
                    renderFlight(flight, "slotB", highXAt(flight.teamId, flight.start), MID_Y)
                )}
            </div>
        </>
    );
};

export const PbsDraftSlot = ({ clock, team, landAt, slotDataKey, highlightWindow }) => {
    const landed = usePbsClockValue(clock, (value) => value >= landAt);
    const picking = usePbsClockValue(clock, (value) => !!highlightWindow && value >= highlightWindow[0] && value < highlightWindow[1]);
    const shown = landed && !!team;

    return (
        <>
            <div className={css.team_cell}>
                {shown ? (
                    <div
                        key="team"
                        data-pbs-slot={slotDataKey}
                        className={`${css.team_circle} ${picking ? css.pbs_picking : ""}`}
                        style={{ background: team.color, transition: "none" }}
                        title={`Team ${team.name}`}
                    />
                ) : (
                    <div key="placeholder" data-pbs-slot={slotDataKey} style={{ fontSize: "20px", transition: "none" }} className={css.placeholder_circle}>?</div>
                )}
            </div>
            <div className={css.team_name_placeholder} style={{ transition: "none" }}>{shown ? `Team ${team.name}` : "TBD"}</div>
        </>
    );
};

const DRAFT_SPACER_HEIGHT = 260;

export const PbsDraftSpacer = ({ active }) => {
    const ref = useRef(null);
    const heightRef = useRef(active ? DRAFT_SPACER_HEIGHT : 0);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return undefined;

        const apply = (height) => {
            heightRef.current = height;
            el.style.height = `${height}px`;
        };

        if (active) {
            apply(DRAFT_SPACER_HEIGHT);
            return undefined;
        }

        let rafId = null;
        const shrink = () => {
            const top = el.getBoundingClientRect().top;
            const needed = Math.max(0, Math.ceil(window.innerHeight - top));
            if (needed < heightRef.current) apply(needed);
            rafId = heightRef.current > 0 ? requestAnimationFrame(shrink) : null;
        };

        shrink();
        return () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, [active]);

    return <div ref={ref} className={css.pbs_draft_spacer} style={{ height: heightRef.current }} />;
};

export const PbsLandedPair = ({ clock, timeline, plan, matchIdx, teamsById, children }) => {
    const landed = usePbsClockValue(clock, (value) => value >= getPbsSlotLanding(timeline, matchIdx, "slotB"));
    const pick = plan.picks[matchIdx];
    return children(landed && pick ? [teamsById?.[pick.pickerId], teamsById?.[pick.pickedId]].filter(Boolean) : []);
};
