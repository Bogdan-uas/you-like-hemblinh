import { useState, useLayoutEffect, useRef } from "react";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { percentToRedYellowGreenHex, lightenHex, darkenHex } from "../logic/colors.js";
import {
    STAT_ROW_FONT_PX,
    STAT_ROW_NOTE_COLOR,
    fitStatRowFont,
    STAT_ROW_MIN_FONT_PX,
    STATS_TAB_LINK_COLOR,
    MATCH_STATS_TOGGLE_CIRCLE_STYLE,
} from "../logic/statsUi.js";
import { getTeamStatAverage } from "../logic/teamData.js";
import {
    STAT_TABS,
    DEFAULT_TEAM_STAT_VALUES,
    parseStatInput,
    clampStat,
    statToInputString,
} from "../logic/teamStats.js";

const StatScaleBar = ({ value, max = 100, height = 9, animated = true }) => {
    const pct = Math.max(0, Math.min(100, (Number(value) || 0) / max * 100));
    const mainColor = percentToRedYellowGreenHex(pct);
    const litGradient = `linear-gradient(180deg, ${lightenHex(mainColor, 0.24)} 0%, ${mainColor} 45%, ${darkenHex(mainColor, 0.24)} 100%)`;

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: `${height}px`,
                borderRadius: `${height / 2}px`,
                overflow: "hidden",
                background: "#14151f",
            }}
        >
            <div style={{ position: "absolute", inset: 0, background: litGradient, opacity: 0.26 }} />
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${pct}%`,
                    background: litGradient,
                    transition: animated ? "width 0.6s ease" : "none",
                }}
            />
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((tick) => (
                <div
                    key={tick}
                    style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: `${tick}%`,
                        width: "1px",
                        background: "rgba(255,255,255,0.75)",
                    }}
                />
            ))}
        </div>
    );
};

const StatFactorRow = ({ label, value, max = 100, diff, marginBottom = "8px", note = null }) => {
    const rounded = Math.round((Number(value) || 0) * 10) / 10;
    const roundedDiff = diff == null ? null : Math.round(diff * 10) / 10;
    const rowRef = useRef(null);
    const labelRef = useRef(null);
    const inlineNoteRef = useRef(null);
    const barNoteRef = useRef(null);

    useLayoutEffect(() => {
        const rowEl = rowRef.current;
        const labelEl = labelRef.current;
        if (!rowEl || !labelEl) return;

        const inlineNoteEl = inlineNoteRef.current;
        const barNoteEl = barNoteRef.current;

        labelEl.style.fontSize = "";
        if (inlineNoteEl) inlineNoteEl.style.display = "";
        if (barNoteEl) barNoteEl.style.display = "none";

        const diffEl = rowEl.querySelector("[data-stat-diff]");
        const diffWidth = diffEl ? diffEl.getBoundingClientRect().width + 4 : 0;
        const available = rowEl.clientWidth - diffWidth;
        if (!(available > 0)) return;

        let natural = labelEl.getBoundingClientRect().width;
        if (natural <= available) return;

        if (inlineNoteEl && barNoteEl && fitStatRowFont(natural, available) < STAT_ROW_MIN_FONT_PX) {
            inlineNoteEl.style.display = "none";
            barNoteEl.style.display = "";
            natural = labelEl.getBoundingClientRect().width;
            if (natural <= available) return;
        }

        labelEl.style.fontSize = `${Math.max(STAT_ROW_MIN_FONT_PX, fitStatRowFont(natural, available))}px`;
    });

    return (
        <div style={{ marginBottom }}>
            <div
                ref={rowRef}
                style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    fontSize: `${STAT_ROW_FONT_PX}px`,
                    fontWeight: 600,
                    gap: "4px",
                }}
            >
                <span ref={labelRef} style={{ transition: "none" }}>
                    {label}: {rounded}/{max}
                    {note && (
                        <span
                            ref={inlineNoteRef}
                            style={{
                                marginLeft: "6px",
                                color: STAT_ROW_NOTE_COLOR,
                                fontWeight: 600,
                                fontSize: "0.88em",
                                transition: "none"
                            }}
                        >
                            {note}
                        </span>
                    )}
                </span>
                {roundedDiff != null && roundedDiff !== 0 && (
                    <span
                        data-stat-diff
                        style={{
                            color: roundedDiff > 0 ? "#4caf50" : "#e53935",
                            fontSize: "11.5px",
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {roundedDiff > 0 ? "+" : ""}{roundedDiff}
                    </span>
                )}
            </div>
            {note ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <StatScaleBar value={rounded} max={max} />
                    </div>
                    <span
                        ref={barNoteRef}
                        style={{
                            display: "none",
                            marginLeft: "6px",
                            color: STAT_ROW_NOTE_COLOR,
                            fontWeight: 600,
                            fontSize: "10.5px",
                            lineHeight: "9px",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {note}
                    </span>
                </div>
            ) : (
                <StatScaleBar value={rounded} max={max} />
            )}
        </div>
    );
};

const StatAverageLine = ({ statsNow, statsBefore }) => {
    const average = getTeamStatAverage(statsNow);
    const diff = statsBefore ? Math.round((average - getTeamStatAverage(statsBefore)) * 100) / 100 : null;

    return (
        <>
            Average: {average}
            {diff != null && diff !== 0 && (
                <span
                    style={{
                        marginLeft: "6px",
                        color: diff > 0 ? "#4caf50" : "#e53935",
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                    }}
                >
                    {diff > 0 ? "+" : ""}{diff}
                </span>
            )}
        </>
    );
};

export const StatsTabLink = ({ side, tab, total, onClick, interactive = true }) => {
    if (!(total > 1)) return null;

    const isLast = tab >= total - 1;
    const Arrow = side === "left" ? IoIosArrowBack : IoIosArrowForward;
    const arrowFirst = side === "left" ? !isLast : isLast;

    const arrow = (
        <Arrow
            size={13}
            style={{
                flexShrink: 0,
                transform: `rotate(${isLast ? 180 : 0}deg)`,
                transition: "transform 0.3s ease",
            }}
        />
    );
    const counter = (
        <span style={{ fontWeight: 700 }}>
            {tab + 1}/{total}
        </span>
    );

    const sharedStyle = {
        position: "absolute",
        top: "6px",
        [side === "left" ? "left" : "right"]: "10px",
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        fontSize: "11px",
        lineHeight: 1,
        color: STATS_TAB_LINK_COLOR,
        userSelect: "none",
        whiteSpace: "nowrap",
        zIndex: 2,
    };

    const content = arrowFirst ? (
        <>
            {arrow}
            {counter}
        </>
    ) : (
        <>
            {counter}
            {arrow}
        </>
    );

    if (!interactive) {
        return <span style={{ ...sharedStyle, pointerEvents: "none" }}>{content}</span>;
    }

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`Show stats tab ${((tab + 1) % total) + 1} of ${total}`}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = "#5b5e6e";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = STATS_TAB_LINK_COLOR;
            }}
            style={{
                ...sharedStyle,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "color 0.15s ease",
            }}
        >
            {content}
        </button>
    );
};

export const StatsFactorPanelBody = ({ team, statsNow, statsBefore, tab = 0 }) => {
    const defs = STAT_TABS[Math.max(0, Math.min(tab, STAT_TABS.length - 1))] ?? [];

    return (
        <>
            <div
                style={{
                    fontWeight: 800,
                    fontSize: "13px",
                    marginBottom: "2px",
                    textAlign: "center",
                    opacity: 0.85,
                    color: team?.color ?? "#2e2f42",
                }}
            >
                Team {team?.name}
            </div>
            <div
                style={{
                    fontWeight: 700,
                    fontSize: "11px",
                    marginBottom: "10px",
                    textAlign: "center",
                    opacity: 0.7,
                }}
            >
                <StatAverageLine statsNow={statsNow} statsBefore={statsBefore} />
            </div>
            {defs.map((def) => {
                const val = statsNow?.[def.key] ?? DEFAULT_TEAM_STAT_VALUES[def.key];
                const beforeVal = statsBefore
                    ? statsBefore?.[def.key] ?? DEFAULT_TEAM_STAT_VALUES[def.key]
                    : null;
                const diff = statsBefore ? val - beforeVal : null;

                return (
                    <StatFactorRow
                        key={def.key}
                        label={def.label}
                        value={val}
                        max={def.max}
                        diff={diff}
                    />
                );
            })}
        </>
    );
};

const MatchStatsSidePanel = ({ side, team, open, statsNow, statsBefore, rowNotes = null }) => {
    const anchorProp = side === "left" ? "right" : "left";
    const [tab, setTab] = useState(0);
    const defs = STAT_TABS[Math.max(0, Math.min(tab, STAT_TABS.length - 1))] ?? [];

    return (
        <motion.div
            initial={false}
            animate={{
                x: open ? (side === "left" ? -262 : 262) : 0,
                opacity: open ? 1 : 0,
            }}
            transition={{
                x: { type: "spring", duration: 0.0000001 },
                opacity: open ? { type: "spring", duration: 0.0000001 } : { duration: 0.15, delay: 0.45 },
            }}
            style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                minHeight: "307.2px",
                width: "230px",
                [anchorProp]: "50%",
                zIndex: -1,
                pointerEvents: open ? "auto" : "none",
                transform: "translateX(-50%)",
                background: "#fff",
                color: "#2e2f42",
                boxShadow: "0 2px 10px rgba(0,0,0,.2)",
                border: "2px solid #999",
                padding: "6px 10px",
                borderRadius: 12,
                fontSize: 10,
                whiteSpace: "nowrap",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <StatsTabLink
                side={side}
                tab={tab}
                total={STAT_TABS.length}
                onClick={() => setTab((t) => (t + 1) % STAT_TABS.length)}
            />

            <div
                style={{
                    fontWeight: 800,
                    fontSize: "13px",
                    textAlign: "center",
                    opacity: 0.85,
                    color: team?.color ?? "#2e2f42",
                }}
            >
                Team {team?.name}
            </div>
            <div
                style={{
                    fontWeight: 700,
                    fontSize: "11px",
                    marginBottom: "10px",
                    textAlign: "center",
                    opacity: 0.7,
                }}
            >
                <StatAverageLine statsNow={statsNow} statsBefore={statsBefore} />
            </div>
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingBottom: "4px",
                }}
            >
                {defs.map((def, i) => {
                    const val = statsNow?.[def.key] ?? DEFAULT_TEAM_STAT_VALUES[def.key];
                    const beforeVal = statsBefore
                        ? statsBefore?.[def.key] ?? DEFAULT_TEAM_STAT_VALUES[def.key]
                        : null;
                    const diff = statsBefore ? val - beforeVal : null;

                    return (
                        <StatFactorRow
                            key={def.key}
                            label={def.label}
                            value={val}
                            max={def.max}
                            diff={diff}
                            note={rowNotes?.[def.key] ?? null}
                            marginBottom={i === defs.length - 1 ? "0px" : "8px"}
                        />
                    );
                })}
            </div>
        </motion.div>
    );
};

const StatScaleSlider = ({ value, max = 100, onChange, height = 9, handleSize = 18 }) => {
    const trackRef = useRef(null);
    const dragRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [focusVisible, setFocusVisible] = useState(false);

    const numeric = Number(value) || 0;
    const pct = Math.max(0, Math.min(100, (numeric / max) * 100));

    const valueFromPointer = (clientX) => {
        const rect = trackRef.current?.getBoundingClientRect();
        if (!rect || rect.width <= 0) return null;
        const x = clientX - (dragRef.current?.grabOffset ?? 0) - rect.left;
        return Math.round(Math.max(0, Math.min(1, x / rect.width)) * max);
    };

    const handlePointerDown = (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        const rect = trackRef.current?.getBoundingClientRect();
        if (!rect) return;

        e.currentTarget.setPointerCapture?.(e.pointerId);
        e.currentTarget.focus?.({ preventScroll: true });

        dragRef.current = {
            grabOffset: e.clientX - (rect.left + (pct / 100) * rect.width),
            last: numeric,
        };
        setDragging(true);
    };

    const handlePointerMove = (e) => {
        if (!dragRef.current) return;
        const next = valueFromPointer(e.clientX);
        if (next === null || next === dragRef.current.last) return;
        dragRef.current.last = next;
        onChange?.(next);
    };

    const endDrag = (e) => {
        if (!dragRef.current) return;
        dragRef.current = null;
        setDragging(false);
        e.currentTarget.releasePointerCapture?.(e.pointerId);
    };

    const handleKeyDown = (e) => {
        const step = e.shiftKey ? 10 : 1;
        let next = null;
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = numeric - step;
        else if (e.key === "ArrowRight" || e.key === "ArrowUp") next = numeric + step;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = max;
        if (next === null) return;
        e.preventDefault();
        onChange?.(Math.max(0, Math.min(max, next)));
    };

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: `${handleSize}px`,
                display: "flex",
                alignItems: "center",
                userSelect: "none",
            }}
        >
            <div ref={trackRef} style={{ width: "100%" }}>
                <StatScaleBar value={numeric} max={max} height={height} animated={false} />
            </div>
            <div
                role="slider"
                tabIndex={0}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={Math.round(numeric * 100) / 100}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={handleKeyDown}
                onFocus={(e) => setFocusVisible(e.currentTarget.matches(":focus-visible"))}
                onBlur={() => setFocusVisible(false)}
                style={{
                    position: "absolute",
                    left: `${pct}%`,
                    top: "50%",
                    width: `${handleSize}px`,
                    height: `${handleSize}px`,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: focusVisible
                        ? "0 0 0 3px rgba(13,106,255,0.45), 0 2px 5px rgba(0,0,0,0.4)"
                        : dragging
                            ? "0 0 0 1px rgba(0,0,0,0.25), 0 3px 8px rgba(0,0,0,0.5)"
                            : "0 0 0 1px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.4)",
                    transform: `translate(-50%, -50%) scale(${dragging ? 1.12 : 1})`,
                    transition: "transform 0.12s ease, box-shadow 0.12s ease",
                    cursor: dragging ? "grabbing" : "grab",
                    touchAction: "none",
                    outline: "none",
                    zIndex: 2,
                }}
            />
        </div>
    );
};

export const ManageStatRow = ({
    def,
    currentValue,
    inputValue,
    isEditing,
    onStartEdit,
    onInputChange,
    onInputCommit,
    onSlide,
}) => {
    const typed = parseStatInput(inputValue);
    const effective = typed === null ? currentValue : clampStat(typed, 0, def.max);
    const differs =
        typed !== null &&
        Math.abs(Math.round(effective * 100) / 100 - Math.round(currentValue * 100) / 100) > 0.0001;

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    minHeight: "28px",
                }}
            >
                <div
                    className={css.reset_label}
                    style={{ margin: 0, display: "flex", alignItems: "center", gap: "5px" }}
                >
                    <span>{def.label}:</span>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                    {isEditing ? (
                        <motion.input
                            key="edit"
                            autoFocus
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            value={inputValue ?? ""}
                            onChange={(e) => onInputChange(def.key, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            onBlur={() => onInputCommit(def.key)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
                            }}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.12 }}
                            style={{
                                width: "32px",
                                height: "24px",
                                boxSizing: "border-box",
                                padding: "0 6px",
                                border: "1px solid #0d6aff",
                                borderRadius: "6px",
                                outline: "none",
                                background: "#fff",
                                color: "#2e2f42",
                                font: "inherit",
                                fontWeight: 700,
                                textAlign: "center",
                                boxShadow: "0 0 0 2px rgba(13,106,255,0.18)",
                            }}
                        />
                    ) : (
                        <motion.button
                            key="text"
                            type="button"
                            onClick={() => onStartEdit(def.key)}
                            title="Click to type a value manually"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.12 }}
                            style={{
                                all: "unset",
                                cursor: "text",
                                borderBottom: "1px dashed #8a8d99",
                                padding: "0 2px",
                                fontWeight: 700,
                                minWidth: "14px",
                                textAlign: "center",
                            }}
                        >
                            {statToInputString(effective)}
                        </motion.button>
                    )}
                    <span>/{def.max}</span>
                    </span>
                </div>

                {differs && (
                    <motion.span
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#777",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Current: {statToInputString(currentValue)}
                    </motion.span>
                )}
            </div>

            <StatScaleSlider
                value={effective}
                max={def.max}
                onChange={(v) => onSlide(def.key, v)}
            />
        </div>
    );
};

export const MatchStatsOverlay = ({
    leftTeam,
    rightTeam,
    leftNow,
    rightNow,
    leftBefore,
    rightBefore,
    showDiff,
    leftOpen = true,
    rightOpen = true,
    onToggleLeft,
    onToggleRight,
    leftRowNotes = null,
    rightRowNotes = null,
}) => {
    if (!leftTeam || !rightTeam) return null;

    return (
        <>
            <button
                type="button"
                onClick={() => onToggleLeft?.()}
                aria-label="Toggle left team factors"
                style={{
                    ...MATCH_STATS_TOGGLE_CIRCLE_STYLE,
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    transform: `translate(-50%, -50%) rotate(${leftOpen ? 180 : 0}deg)`,
                    transition: "transform 0.4s ease",
                }}
            >
                <IoIosArrowBack size={18} color="#2e2f42" />
            </button>

            <button
                type="button"
                onClick={() => onToggleRight?.()}
                aria-label="Toggle right team factors"
                style={{
                    ...MATCH_STATS_TOGGLE_CIRCLE_STYLE,
                    position: "absolute",
                    top: "50%",
                    right: 0,
                    transform: `translate(50%, -50%) rotate(${rightOpen ? 180 : 0}deg)`,
                    transition: "transform 0.4s ease",
                }}
            >
                <IoIosArrowForward size={18} color="#2e2f42" />
            </button>

            <MatchStatsSidePanel
                side="left"
                team={leftTeam}
                open={leftOpen}
                statsNow={leftNow}
                statsBefore={showDiff ? leftBefore : null}
                rowNotes={leftRowNotes}
            />
            <MatchStatsSidePanel
                side="right"
                team={rightTeam}
                open={rightOpen}
                statsNow={rightNow}
                statsBefore={showDiff ? rightBefore : null}
                rowNotes={rightRowNotes}
            />
        </>
    );
};
