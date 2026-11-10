import { useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { FaArrowLeft, FaLock } from "react-icons/fa6";
import { MdOutlineKeyboardDoubleArrowUp, MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import css from "./TeamHistory.module.css";
import page from "../SpecialModePage.module.css";
import pcss from "../progress/Progress.module.css";
import {
    formatMultiplier,
    formatPct,
    formatSigned,
    pctColor,
    ratioColor,
    signedColor,
    countColor,
    multiplierColor,
    resultColor,
    NEUTRAL_COLOR,
    matchMultipliers,
} from "../logic/teamHistory.js";
import { darkenHex } from "../logic/colors.js";
import { buildPlacingItems, EMPTY_TEAM_PLACINGS } from "../logic/placings.jsx";
import { formatOrdinal } from "../logic/teamData.js";
import { STAT_DEFINITIONS, DEFAULT_TEAM_STAT_VALUES } from "../logic/teamStats.js";
import { StatFactorRow, StatAverageLine } from "./StatsPanels.jsx";
import { UnbeatenStreakFire } from "./StreakBadges.jsx";
import { useScreenLenis } from "../progress/progressUi.js";
import { useSpecialModeSettings } from "../logic/settings.js";

const RESULT_WORD = { W: "Win", L: "Loss", T: "Tie" };
const PROFILE_PAGE = 20;
const FLY_MS = 700;
const DAY_MS = 86400000;
const CHART_RANGES = [
    { key: "all", label: "All time", ms: null, word: "" },
    { key: "year", label: "Year", ms: 365 * DAY_MS, word: "year" },
    { key: "month", label: "Month", ms: 30 * DAY_MS, word: "month" },
    { key: "week", label: "Week", ms: 7 * DAY_MS, word: "week" },
];

const scoreClass = (tone) => (tone === "W" ? page.swissWinnerScoreShadow : tone === "L" ? page.swissLoserScoreShadow : page.swissTieScoreShadow);
const scoreColor = (tone) => (tone === "W" ? "#2e7d32" : tone === "L" ? "red" : "#5a5a5a");

const ScoreNum = ({ value, tone, dim }) => (
    <span data-score={value} className={`${css.score_num} ${scoreClass(tone)}`} style={{ color: scoreColor(tone), opacity: dim ? 0.6 : 1 }}>
        {value}
    </span>
);

const SeriesScore = ({ view, className }) => (
    <span className={`${css.score} ${className ?? ""}`}>
        <ScoreNum value={view.seriesMine} tone={view.result === "T" ? "T" : view.result === "W" ? "W" : "L"} dim={view.result === "L"} />
        <span className={css.score_sep}>:</span>
        <ScoreNum value={view.seriesTheirs} tone={view.result === "T" ? "T" : view.result === "W" ? "L" : "W"} dim={view.result === "W"} />
    </span>
);

const eventLabelOf = (entry) => entry.eventName ?? "Current tournament";

const stageLabelOf = (entry) => [entry.stageCaption, entry.stageTitle].filter(Boolean).join(" | ");

const dateOf = (time) => {
    const d = new Date(time);
    return Number.isFinite(d.getTime()) ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
};

const timeOf = (time) => {
    const d = new Date(time);
    return Number.isFinite(d.getTime()) ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "";
};

const setTag = (set) => (set.pens ? "P" : set.er ? "ER" : set.ot ? (set.ot > 1 ? `${set.ot}OT` : "OT") : null);

const setTitle = (set, i) =>
    `Set ${i + 1}: ${set.mine}–${set.theirs}${set.ot ? `, ${set.ot > 1 ? `${set.ot} overtimes` : "overtime"}` : ""}${set.pens ? `, penalties ${set.pens.mine}–${set.pens.theirs}` : ""}${set.er ? ", decided by Extended Rounds" : ""}${set.tie ? ", tie" : ""}`;

export const Record = ({ wins, losses, ties = 0 }) => (
    <span className={css.record}>
        <span style={{ color: countColor(wins) }}>{wins}</span>
        <span className={css.record_dash}>-</span>
        <span style={{ color: losses > 0 ? resultColor("L") : resultColor("T") }}>{losses}</span>
        {ties ? (
            <>
                <span className={css.record_dash}>-</span>
                <span style={{ color: resultColor("T") }}>{ties}</span>
            </>
        ) : null}
    </span>
);

const rankShiftOf = (view) => (view.rankBefore != null && view.rankAfter != null ? view.rankBefore - view.rankAfter : 0);

const RankShift = ({ view, wide = false }) => {
    const shift = rankShiftOf(view);
    if (!shift) return null;
    const Arrow = shift > 0 ? MdOutlineKeyboardDoubleArrowUp : MdOutlineKeyboardDoubleArrowDown;
    return (
        <span
            className={`${css.rank_shift} ${shift > 0 ? css.gain : css.loss}`}
            title={`${shift > 0 ? "Up" : "Down"} ${Math.abs(shift)} place${Math.abs(shift) === 1 ? "" : "s"} on the Leaderboard: ${formatOrdinal(view.rankBefore)} → ${formatOrdinal(view.rankAfter)}`}
        >
            {Math.abs(shift)}
            <Arrow aria-hidden="true" />
            {wide ? <span className={css.rank_shift_to}>{formatOrdinal(view.rankAfter)}</span> : null}
        </span>
    );
};

const PointsDelta = ({ view }) =>
    view.pointsDelta != null ? (
        <span style={{ color: signedColor(view.pointsDelta) }} title="Leaderboard points from this match">
            {formatSigned(view.pointsDelta)}p
        </span>
    ) : null;

const MultiplierValue = ({ view }) => (
    <span
        style={{ color: multiplierColor(view.avgMultiplier, view.opponentAvgMultiplier) }}
        title={`Average multiplier in this match: ${formatMultiplier(view.avgMultiplier)} (the opponent: ${formatMultiplier(view.opponentAvgMultiplier)})`}
    >
        {formatMultiplier(view.avgMultiplier)}
    </span>
);

export const SetChips = ({ view }) => (
    <span className={css.maps}>
        {view.sets.map((set, i) => {
            const tag = setTag(set);
            return (
                <span key={i} className={`${css.map} ${set.won === true ? css.map_won : set.won === false ? css.map_lost : ""}`} title={setTitle(set, i)}>
                    {set.mine}–{set.theirs}
                    {set.pens ? <span className={css.map_tag}>P {set.pens.mine}–{set.pens.theirs}</span> : tag ? <span className={css.map_tag}>{tag}</span> : null}
                </span>
            );
        })}
    </span>
);

const cardTitle = (view) =>
    `${RESULT_WORD[view.result]} vs Team ${view.opponent.name} · ${eventLabelOf(view.entry)} · ${stageLabelOf(view.entry)} · ${dateOf(view.entry.time)}\nClick to open this match`;

const bo1Info = (view) => {
    const set = view.sets[0] ?? {};
    const tag = setTag(set);
    return `Bo1${tag ? ` · ${set.pens ? `Pens ${set.pens.mine}–${set.pens.theirs}` : tag}` : ""}`;
};

export function HistoryCard({ view, onOpen }) {
    const live = view.entry.source === "live";
    return (
        <button type="button" className={`${css.card} ${css[`card_${view.result}`]}`} title={cardTitle(view)} onClick={() => onOpen?.(view.entry)}>
            <span className={css.badge}>{view.result}</span>
            <span className={css.body}>
                <span className={css.line}>
                    <span className={css.dot} style={{ background: view.opponent.color }} />
                    <span className={css.opp}>{view.opponent.name}</span>
                    {view.opponentRank ? <span className={css.rank}>#{view.opponentRank}</span> : null}
                    <SeriesScore view={view} />
                </span>
                <span className={css.foot}>
                    <span className={css.meta}>
                        {live ? <span className={css.live}>LIVE </span> : null}
                        {view.entry.stageTitle} · {eventLabelOf(view.entry)}
                    </span>
                    <span className={css.facts}>
                        <MultiplierValue view={view} />
                        <PointsDelta view={view} />
                        <RankShift view={view} />
                    </span>
                </span>
                <span className={css.foot}>{view.bestOf > 1 ? <SetChips view={view} /> : <span>{bo1Info(view)}</span>}</span>
            </span>
        </button>
    );
}

export function WideHistoryCard({ view, onOpen, onOpenEvent }) {
    const live = view.entry.source === "live";
    const linkable = !!onOpenEvent && view.entry.source === "hall" && !!view.entry.record;
    return (
        <div
            role="button"
            tabIndex={0}
            className={`${css.wide} ${css[`card_${view.result}`]}`}
            title={cardTitle(view)}
            onClick={() => onOpen?.(view.entry)}
            onKeyDown={(e) => {
                if (e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
                e.preventDefault();
                onOpen?.(view.entry);
            }}
        >
            <span className={css.badge}>{view.result}</span>
            <span className={css.wide_when}>
                <b>{dateOf(view.entry.time)}</b>
                {live ? <span className={css.live}>LIVE</span> : <span>{timeOf(view.entry.time)}</span>}
            </span>
            <span className={css.wide_event}>
                {linkable ? (
                    <button
                        type="button"
                        className={`${css.wide_event_name} ${css.wide_event_link}`}
                        title={`Open ${eventLabelOf(view.entry)} in the Hall of Fame`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenEvent(view.entry);
                        }}
                    >
                        {eventLabelOf(view.entry)}
                    </button>
                ) : (
                    <span className={css.wide_event_name}>{eventLabelOf(view.entry)}</span>
                )}
                <span className={css.wide_event_stage}>
                    {stageLabelOf(view.entry)} · Bo{view.bestOf}
                </span>
            </span>
            <span className={css.wide_match}>
                <span className={css.wide_vs}>
                    <span className={css.dot} style={{ background: view.opponent.color }} />
                    <span className={css.opp}>vs {view.opponent.name}</span>
                    {view.opponentRank ? <span className={css.rank}>{formatOrdinal(view.opponentRank)}</span> : null}
                </span>
                {view.bestOf > 1 || setTag(view.sets[0] ?? {}) ? <SetChips view={view} /> : null}
            </span>
            <SeriesScore view={view} className={css.wide_score} />
            <span className={css.wide_cell}>
                <span className={css.wide_cell_label}>Avg mult.</span>
                <MultiplierValue view={view} />
            </span>
            <span className={css.wide_cell}>
                <span className={css.wide_cell_label}>Points</span>
                {view.pointsDelta != null ? <PointsDelta view={view} /> : "—"}
                <RankShift view={view} wide />
            </span>
        </div>
    );
}

export function MatchMultiplierStrip({ match, leftTeam, rightTeam }) {
    const data = matchMultipliers(match);
    const left = data?.[String(leftTeam?.id)];
    const right = data?.[String(rightTeam?.id)];
    if (!left || !right) return null;
    const side = (team, mine, theirs) => (
        <span
            className={css.mult_side}
            style={{ color: multiplierColor(mine.avg, theirs.avg) }}
            title={`Team ${team.name}: average multiplier ${formatMultiplier(mine.avg)} over ${data.count} mini-rounds · best ${formatMultiplier(mine.peak)} · ${mine.won} mini-rounds won`}
        >
            <span className={css.mult_dot} style={{ background: team.color }} />
            {formatMultiplier(mine.avg)}
        </span>
    );
    return (
        <div className={css.mult_strip}>
            {side(leftTeam, left, right)}
            <span className={css.mult_label}>Avg multiplier</span>
            {side(rightTeam, right, left)}
        </div>
    );
}

const streakText = (stats) => (stats.streakType && stats.streak ? `${stats.streakType}${stats.streak}` : "—");

const Tile = ({ label, value, sub, title, color }) => (
    <span className={css.tile} title={title}>
        <span className={css.tile_value} style={{ color: color ?? NEUTRAL_COLOR }}>
            {value}
        </span>
        <span className={css.tile_label}>{label}</span>
        {sub ? <span className={css.tile_sub}>{sub}</span> : null}
    </span>
);

export function FormPanelBody({ form, onOpen, before }) {
    if (!form) return null;
    const { views, stats, latest } = form;
    const heading = latest ? "Recent form" : "Form before this match";
    if (!stats.played) {
        return (
            <div className={css.form}>
                <div className={css.form_caption}>{heading}</div>
                <div className={css.empty}>{before ? "No matches before this one" : "No matches played yet"}</div>
            </div>
        );
    }
    return (
        <div className={css.form}>
            <div className={css.form_caption}>
                {heading} · stats of {stats.played === 1 ? "1 match" : `all ${stats.played} matches`}
                {before && latest ? " before this one" : ""}
            </div>
            <div className={css.tiles}>
                <Tile label="Win rate" value={formatPct(stats.winRate)} color={pctColor(stats.winRate)} sub={<Record wins={stats.wins} losses={stats.losses} ties={stats.ties} />} title="Matches won, lost (and tied)" />
                <Tile
                    label="Avg mult."
                    value={formatMultiplier(stats.avgMultiplier)}
                    color={multiplierColor(stats.avgMultiplier, stats.opponentAvgMultiplier)}
                    sub={`best ${formatMultiplier(stats.peakMultiplier)}`}
                    title={`Average multiplier over every mini-round this team played (its opponents: ${formatMultiplier(stats.opponentAvgMultiplier)}), and its best one`}
                />
                <Tile
                    label="Streak"
                    value={streakText(stats)}
                    sub={`best W${stats.bestRun}`}
                    color={resultColor(stats.streakType)}
                    title="The current run of the same result, and the best winning run"
                />
                <Tile label="Sets" value={formatPct(stats.setRate)} color={pctColor(stats.setRate)} sub={<Record wins={stats.setsWon} losses={stats.setsLost} />} title="Sets won and lost" />
                <Tile
                    label="Rounds"
                    value={formatSigned(stats.roundDiff)}
                    sub={`${stats.roundsFor}-${stats.roundsAgainst}`}
                    color={signedColor(stats.roundDiff)}
                    title="Round difference over all sets"
                />
                <Tile
                    label="Overtime"
                    value={`${stats.otSetsWon}/${stats.otSets}`}
                    color={ratioColor(stats.otSetsWon, stats.otSets)}
                    sub={`deciders ${stats.decidersWon}/${stats.deciders}`}
                    title="Overtime sets won out of played, and series deciders won out of played"
                />
            </div>
            <div className={css.cards}>
                {views.map((view) => (
                    <HistoryCard key={view.entry.key} view={view} onOpen={onOpen} />
                ))}
            </div>
        </div>
    );
}

const BigTile = ({ label, value, sub, accent, title, color }) => (
    <div className={css.big_tile} style={{ "--accent": accent }} title={title}>
        <span className={css.big_label}>{label}</span>
        <span className={css.big_value} style={{ color: color ?? NEUTRAL_COLOR }}>
            {value}
        </span>
        {sub ? <span className={css.big_sub}>{sub}</span> : null}
    </div>
);

const VersusValue = ({ row, word }) =>
    row ? (
        <span className={css.versus}>
            <span className={css.versus_dot} style={{ background: row.team.color }} />
            <span className={css.versus_name}>{row.team.name}</span>
            <span className={css.big_sub} style={{ color: word === "wins" ? resultColor("W") : resultColor("L") }}>
                {row[word]} {word === "wins" ? (row.wins === 1 ? "win" : "wins") : row.losses === 1 ? "loss" : "losses"}
            </span>
        </span>
    ) : (
        "—"
    );

const runText = (stats) =>
    stats.streakType
        ? `${stats.streak} ${stats.streakType === "W" ? (stats.streak === 1 ? "win" : "wins") : stats.streakType === "L" ? (stats.streak === 1 ? "loss" : "losses") : stats.streak === 1 ? "tie" : "ties"}`
        : "—";

function RatingChart({ views, team }) {
    const chrono = useMemo(() => [...views].reverse().filter((v) => v.pointsAfter != null), [views]);
    const [now] = useState(() => Date.now());
    const [range, setRange] = useState("all");
    const [width, setWidth] = useState(0);
    const [hoverX, setHoverX] = useState(null);
    const boxRef = useRef(null);

    useLayoutEffect(() => {
        const el = boxRef.current;
        if (!el) return undefined;
        setWidth(el.clientWidth);
        const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const inRange = (r) => chrono.filter((v) => !r.ms || v.entry.time >= now - r.ms);
    const current = CHART_RANGES.find((r) => r.key === range) ?? CHART_RANGES[0];
    const list = inRange(current);
    const points = list.length
        ? [{ value: list[0].pointsBefore ?? list[0].pointsAfter, view: null }, ...list.map((v) => ({ value: v.pointsAfter, view: v }))]
        : [];

    const height = 190;
    const pad = { l: 56, r: 18, t: 18, b: 26 };
    const plotW = Math.max(1, width - pad.l - pad.r);
    const min = points.length ? Math.min(...points.map((p) => p.value)) : 0;
    const max = points.length ? Math.max(...points.map((p) => p.value)) : 1;
    const span = Math.max(1, max - min);
    const step = points.length > 1 ? plotW / (points.length - 1) : 0;
    const x = (i) => pad.l + i * step;
    const y = (v) => pad.t + (1 - (v - min) / span) * (height - pad.t - pad.b);
    const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
    const area = points.length ? `${line} L${x(points.length - 1).toFixed(1)},${height - pad.b} L${pad.l},${height - pad.b} Z` : "";
    const stroke = darkenHex(team.color, 0.12);
    const ticks = [...new Set([max, Math.round((max + min) / 2), min])];

    let hover = null;
    if (hoverX != null && points.length > 1 && width) {
        const t = (Math.max(pad.l, Math.min(pad.l + plotW, hoverX)) - pad.l) / step;
        const i0 = Math.min(points.length - 2, Math.floor(t));
        const f = t - i0;
        const value = points[i0].value + (points[i0 + 1].value - points[i0].value) * f;
        const nearest = points[Math.round(t)];
        hover = { x: pad.l + t * step, y: y(value), nearest };
    }

    const onMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverX(e.clientX - rect.left);
    };

    const tipText = hover
        ? hover.nearest.view
            ? `${hover.nearest.value}p · ${RESULT_WORD[hover.nearest.view.result]} vs ${hover.nearest.view.opponent.name}${hover.nearest.view.pointsDelta != null ? ` (${formatSigned(hover.nearest.view.pointsDelta)}p)` : ""} · ${dateOf(hover.nearest.view.entry.time)}`
            : `${hover.nearest.value}p before ${current.ms ? `the first match of this ${current.word}` : "the first match"}`
        : null;

    return (
        <div className={css.chart}>
            <div className={css.chart_head}>
                <span className={css.chart_summary}>
                    {list.length ? (
                        <>
                            {list.length} {list.length === 1 ? "match" : "matches"} ·{" "}
                            <span style={{ color: signedColor(points[points.length - 1].value - points[0].value) }}>
                                {formatSigned(points[points.length - 1].value - points[0].value)}p
                            </span>
                        </>
                    ) : null}
                </span>
                <span className={css.ranges} role="group" aria-label="Time range">
                    {CHART_RANGES.map((r) => {
                        const count = inRange(r).length;
                        const locked = !count;
                        return (
                            <button
                                key={r.key}
                                type="button"
                                className={`${css.range} ${range === r.key ? css.range_on : ""} ${locked ? css.range_locked : ""}`}
                                disabled={locked}
                                aria-pressed={range === r.key}
                                title={locked ? `No matches in the last ${r.word}` : r.ms ? `Matches of the last ${r.word} (${count})` : `All matches (${count})`}
                                tabIndex={range === r.key ? -1 : undefined}
                                onClick={() => range !== r.key && setRange(r.key)}
                            >
                                {locked ? <FaLock aria-hidden="true" className={css.range_lock} /> : null}
                                {r.label}
                            </button>
                        );
                    })}
                </span>
            </div>
            <div ref={boxRef} className={css.chart_box}>
                {width && points.length ? (
                    <svg
                        width={width}
                        height={height}
                        viewBox={`0 0 ${width} ${height}`}
                        onMouseMove={onMove}
                        onMouseLeave={() => setHoverX(null)}
                        role="img"
                        aria-label={`Leaderboard points of Team ${team.name} after each match`}
                    >
                        {ticks.map((t) => (
                            <g key={t}>
                                <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="#e3e5ee" strokeWidth="1" />
                                <text x={pad.l - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fontWeight="700" fill="#8a8d99">
                                    {t}p
                                </text>
                            </g>
                        ))}
                        {list.length ? (
                            <>
                                <text x={pad.l} y={height - 6} textAnchor="start" fontSize="11" fontWeight="700" fill="#8a8d99">
                                    {dateOf(list[0].entry.time)}
                                </text>
                                <text x={width - pad.r} y={height - 6} textAnchor="end" fontSize="11" fontWeight="700" fill="#8a8d99">
                                    {dateOf(list[list.length - 1].entry.time)}
                                </text>
                            </>
                        ) : null}
                        <path d={area} fill={team.color} opacity="0.12" />
                        <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                        {hover ? (
                            <>
                                <line x1={hover.x} x2={hover.x} y1={pad.t} y2={height - pad.b} stroke="#2e2f42" strokeWidth="1" strokeDasharray="3 3" />
                                <circle cx={hover.x} cy={hover.y} r="5.5" fill={stroke} stroke="#ffffff" strokeWidth="2.5" />
                            </>
                        ) : null}
                    </svg>
                ) : null}
                {hover ? (
                    <span className={css.chart_tip} style={{ left: Math.max(130, Math.min(width - 130, hover.x)), top: hover.y < 56 ? hover.y + 16 : hover.y - 14, transform: hover.y < 56 ? "translate(-50%, 0)" : "translate(-50%, -100%)" }}>
                        {tipText}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

const headerBottom = () => {
    const header = document.querySelector("header");
    const rect = header?.getBoundingClientRect();
    return rect && getComputedStyle(header).position === "fixed" ? Math.max(0, rect.bottom) : 0;
};

const translateYOf = (el) => {
    const transform = el ? getComputedStyle(el).transform : "none";
    if (!transform || transform === "none") return 0;
    try {
        return new DOMMatrixReadOnly(transform).m42;
    } catch {
        return 0;
    }
};

export function TeamProfile({ team, history, origin, restored, rating, rank, rankColor, placings, stats: factorStats, streak, onOpenEntry, onOpenEvent, onClose, savedView }) {
    const { smoothScroll } = useSpecialModeSettings();
    const { wrapperRef, contentRef, lenisRef } = useScreenLenis(smoothScroll);
    const rootRef = useRef(null);
    const heroRef = useRef(null);
    const flyRef = useRef(null);
    const [top] = useState(headerBottom);
    const [phase, setPhase] = useState(restored || !origin ? "shown" : "flood");
    const [geo, setGeo] = useState(null);
    const [shown, setShown] = useState(savedView?.shown ?? PROFILE_PAGE);
    const views = history.views;
    const stats = history.stats;

    useLayoutEffect(() => {
        if (phase === "shown" || geo) return;
        const root = rootRef.current?.getBoundingClientRect();
        const hero = heroRef.current?.getBoundingClientRect();
        if (!root || !hero) return;
        const shiftY = translateYOf(contentRef.current);
        const cx = origin.x - root.left;
        const cy = origin.y - root.top;
        const radius = Math.max(Math.hypot(cx, cy), Math.hypot(root.width - cx, cy), Math.hypot(cx, root.height - cy), Math.hypot(root.width - cx, root.height - cy)) + 40;
        setGeo({ cx, cy, radius, heroX: hero.left - root.left, heroY: hero.top - root.top - shiftY, heroSize: hero.width });
    }, [phase, geo, origin, contentRef]);

    useLayoutEffect(() => {
        if (phase !== "fly" || !geo || !flyRef.current) return undefined;
        const el = flyRef.current;
        const startX = geo.cx - geo.heroSize / 2;
        const startY = geo.cy - geo.heroSize / 2;
        const startScale = origin.size / geo.heroSize;
        const started = performance.now();
        let frame = 0;
        const step = (now) => {
            const progress = Math.min(1, (now - started) / FLY_MS);
            const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
            const root = rootRef.current?.getBoundingClientRect();
            const hero = heroRef.current?.getBoundingClientRect();
            if (root && hero) {
                const size = hero.width;
                const x = startX + (hero.left - root.left - startX) * eased;
                const y = startY + (hero.top - root.top - startY) * eased;
                const scale = startScale * (geo.heroSize / size) + (1 - startScale * (geo.heroSize / size)) * eased;
                el.style.width = `${size}px`;
                el.style.height = `${size}px`;
                el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            }
            if (progress < 1) frame = requestAnimationFrame(step);
            else setPhase((p) => (p === "fly" ? "shown" : p));
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [phase, geo, origin]);

    useEffect(() => {
        if (!savedView?.scrollTop) return;
        lenisRef.current?.scrollTo(savedView.scrollTop, { immediate: true });
        if (wrapperRef.current) wrapperRef.current.scrollTop = savedView.scrollTop;
    }, [savedView, lenisRef, wrapperRef]);

    useEffect(() => {
        lenisRef.current?.resize();
    }, [shown, lenisRef]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== "Escape" || e.defaultPrevented) return;
            if (document.querySelector(`.${page.match_modal_overlay}`)) return;
            onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const open = (entry) => onOpenEntry(entry, { shown, scrollTop: wrapperRef.current?.scrollTop ?? 0 });
    const openEvent = onOpenEvent ? (entry) => onOpenEvent(entry, { shown, scrollTop: wrapperRef.current?.scrollTop ?? 0 }) : null;

    const placingItems = buildPlacingItems(placings ?? EMPTY_TEAM_PLACINGS, <FaTrophy style={{ verticalAlign: "middle" }} />);
    const teamFill = team.gradient || team.color;
    const contentVisible = phase !== "flood";
    const flyStart = geo ? { x: geo.cx - geo.heroSize / 2, y: geo.cy - geo.heroSize / 2, scale: origin.size / geo.heroSize } : null;
    const rankTone = rankColor && rankColor !== "#2e2f42" ? darkenHex(rankColor === "gold" ? "#ffd700" : rankColor === "silver" ? "#c0c0c0" : rankColor, 0.25) : NEUTRAL_COLOR;

    return (
        <motion.div
            ref={rootRef}
            className={css.profile_root}
            style={{ top, background: phase === "shown" || phase === "fly" ? "#ffffff" : "transparent" }}
            initial={restored ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.2 }}
        >
            {geo && phase !== "shown" ? (
                <motion.div
                    className={css.profile_flood}
                    style={{ left: geo.cx - geo.radius, top: geo.cy - geo.radius, width: geo.radius * 2, height: geo.radius * 2 }}
                    initial={{ scale: origin.size / (geo.radius * 2) }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.65, ease: [0.7, 0, 0.25, 1] }}
                    onAnimationComplete={() => setPhase((p) => (p === "flood" ? "fly" : p))}
                />
            ) : null}
            {geo && phase !== "shown" ? (
                <div
                    ref={flyRef}
                    className={css.profile_fly}
                    style={{
                        width: geo.heroSize,
                        height: geo.heroSize,
                        background: teamFill,
                        boxShadow: team.shadow,
                        transform: `translate(${flyStart.x}px, ${flyStart.y}px) scale(${flyStart.scale})`,
                    }}
                />
            ) : null}
            <div ref={wrapperRef} className={css.profile_scroll} data-lenis-prevent>
                <motion.div
                    ref={contentRef}
                    className={css.profile_inner}
                    initial={restored ? false : { opacity: 0, y: 24 }}
                    animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                    transition={{ duration: 0.55, ease: [0.25, 0.8, 0.3, 1], delay: phase === "fly" ? 0.15 : 0 }}
                >
                    <div className={css.hero_sticky}>
                        <span className={`${page.second_header} ${css.hero_bg}`} aria-hidden="true" />
                        <button type="button" className={`${pcss.filter} ${css.profile_back}`} onClick={onClose}>
                            <FaArrowLeft aria-hidden="true" /> Leaderboard
                        </button>
                        <div className={css.hero}>
                            <span className={css.hero_glow} style={{ background: `radial-gradient(closest-side, ${team.color}38, ${team.color}00)` }} aria-hidden="true" />
                            <div ref={heroRef} className={css.hero_circle} style={{ background: teamFill, boxShadow: team.shadow, opacity: phase === "shown" ? 1 : 0 }}>
                                <span className={css.hero_rating}>{rating}p</span>
                            </div>
                            <div className={css.hero_side}>
                                <span className={css.hero_kicker}>
                                    Team profile · <span style={{ color: rankTone }}>{formatOrdinal(rank)}</span> on the Leaderboard
                                </span>
                                <h2 className={css.hero_name}>
                                    Team {team.name}
                                    {streak > 0 ? <UnbeatenStreakFire value={streak} size={34} style={{ marginLeft: 12, verticalAlign: "middle" }} /> : null}
                                </h2>
                                <span className={css.hero_bar} style={{ background: teamFill }} />
                                <div className={css.hero_chips}>
                                    <span className={css.hero_chip}>
                                        <span className={css.hero_chip_label}>Points</span>
                                        {rating}p
                                    </span>
                                    <span className={css.hero_chip}>
                                        <span className={css.hero_chip_label}>Record</span>
                                        <Record wins={stats.wins} losses={stats.losses} ties={stats.ties} />
                                    </span>
                                    <span className={css.hero_chip}>
                                        <span className={css.hero_chip_label}>Win rate</span>
                                        <span style={{ color: pctColor(stats.winRate) }}>{formatPct(stats.winRate)}</span>
                                    </span>
                                    <span className={css.hero_chip}>
                                        <span className={css.hero_chip_label}>Avg mult.</span>
                                        <span style={{ color: multiplierColor(stats.avgMultiplier, stats.opponentAvgMultiplier) }}>{formatMultiplier(stats.avgMultiplier)}</span>
                                    </span>
                                </div>
                            </div>
                            <div className={css.hero_trophies}>
                                <span className={css.hero_chip_label}>Trophies & medals</span>
                                {placingItems.length ? (
                                    <div className={css.shelf}>
                                        {placingItems.map((item) => (
                                            <span key={item.key} className={css.shelf_item} title={item.title ?? undefined}>
                                                {item.icon} ×{item.value}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className={css.shelf_empty}>None yet</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <h3 className={css.section_title}>
                        Match statistics <span className={css.section_count}>{stats.played} {stats.played === 1 ? "match" : "matches"}</span>
                    </h3>
                    {stats.played ? (
                        <div className={css.big_tiles}>
                            <BigTile label="Win rate" value={formatPct(stats.winRate)} color={pctColor(stats.winRate)} sub={<><Record wins={stats.wins} losses={stats.losses} ties={stats.ties} /> · W-L{stats.ties ? "-T" : ""}</>} accent="#2e7d32" />
                            <BigTile label="Sets won" value={formatPct(stats.setRate)} color={pctColor(stats.setRate)} sub={<><Record wins={stats.setsWon} losses={stats.setsLost} /> · won - lost</>} accent="#2f80ed" />
                            <BigTile label="Round difference" value={formatSigned(stats.roundDiff)} color={signedColor(stats.roundDiff)} sub={`${stats.roundsFor} for · ${stats.roundsAgainst} against`} accent={stats.roundDiff >= 0 ? "#2e7d32" : "#d32f2f"} />
                            <BigTile
                                label="Average multiplier"
                                value={formatMultiplier(stats.avgMultiplier)}
                                color={multiplierColor(stats.avgMultiplier, stats.opponentAvgMultiplier)}
                                sub={`Opponents: ${formatMultiplier(stats.opponentAvgMultiplier)} · best: ${formatMultiplier(stats.peakMultiplier)}`}
                                accent="#ff9f1c"
                                title="Average of this team's multipliers over every mini-round it played, compared with its opponents"
                            />
                            <BigTile label="Mini-rounds won" value={formatPct(stats.miniRate)} color={pctColor(stats.miniRate)} accent="#b84dff" title="Share of mini-rounds, which this team's multiplier won" />
                            <BigTile label="Series record" value={<Record wins={stats.seriesWon} losses={stats.seriesPlayed - stats.seriesWon} />} sub="Best of 2 and longer, won - lost" accent="#2f80ed" />
                            <BigTile label="Bo1 record" value={<Record wins={stats.bo1Won} losses={stats.bo1Played - stats.bo1Won} />} sub="single set matches, won - lost" accent="#2f80ed" />
                            <BigTile label="Overtime sets" value={`${stats.otSetsWon}/${stats.otSets}`} color={ratioColor(stats.otSetsWon, stats.otSets)} sub="won / played" accent="#ff3d77" />
                            <BigTile label="Deciders" value={`${stats.decidersWon}/${stats.deciders}`} color={ratioColor(stats.decidersWon, stats.deciders)} sub="series to the last set, won / played" accent="#ff3d77" />
                            <BigTile label="Current run" value={runText(stats)} color={resultColor(stats.streakType)} sub={<>Best winning run: <span style={{ color: countColor(stats.bestRun) }}>{stats.bestRun}</span></>} accent={stats.streakType === "W" ? "#2e7d32" : stats.streakType === "L" ? "#d32f2f" : "#8a8d99"} />
                            <BigTile
                                label="Comebacks · Sweeps"
                                value={
                                    <>
                                        <span style={{ color: countColor(stats.comebacks) }}>{stats.comebacks}</span> · <span style={{ color: countColor(stats.sweeps) }}>{stats.sweeps}</span>
                                    </>
                                }
                                sub="series won after losing set 1 · without losing a set"
                                accent="#27ae60"
                            />
                            <BigTile label="Upsets" value={stats.upsets} color={countColor(stats.upsets)} sub="wins against a higher ranked team" accent="#e0a800" />
                            <BigTile label="Points from matches" value={`${formatSigned(stats.pointsChange)}p`} color={signedColor(stats.pointsChange)} accent={stats.pointsChange >= 0 ? "#2e7d32" : "#d32f2f"} />
                            <BigTile label="Tournaments" value={stats.events} sub={`${(stats.played / Math.max(1, stats.events)).toFixed(1)} matches per tournament`} accent="#9b51e0" />
                            <BigTile label="Favourite opponent" value={<VersusValue row={stats.favourite} word="wins" />} accent={stats.favourite?.team.color} />
                            <BigTile label="Nemesis" value={<VersusValue row={stats.nemesis} word="losses" />} accent={stats.nemesis?.team.color} />
                        </div>
                    ) : (
                        <div className={css.empty}>Team {team.name} hasn't played a match yet</div>
                    )}

                    {views.some((v) => v.pointsAfter != null) ? (
                        <>
                            <h3 className={css.section_title}>Points after each match</h3>
                            <RatingChart views={views} team={team} />
                        </>
                    ) : null}

                    <h3 className={css.section_title}>Team stats</h3>
                    <div className={css.factors}>
                        <div className={css.factors_avg}>
                            <StatAverageLine statsNow={factorStats} statsBefore={null} />
                        </div>
                        {STAT_DEFINITIONS.map((def) => (
                            <StatFactorRow key={def.key} label={def.label} value={factorStats?.[def.key] ?? DEFAULT_TEAM_STAT_VALUES[def.key]} max={def.max} diff={null} />
                        ))}
                    </div>

                    <h3 className={css.section_title}>
                        Match history <span className={css.section_count}>{Math.min(shown, views.length)} of {views.length}</span>
                    </h3>
                    {views.length ? (
                        <div className={css.wide_list}>
                            {views.slice(0, shown).map((view) => (
                                <WideHistoryCard key={view.entry.key} view={view} onOpen={open} onOpenEvent={openEvent} />
                            ))}
                        </div>
                    ) : (
                        <div className={css.empty}>No matches yet</div>
                    )}
                    {views.length > shown ? (
                        <div className={css.more}>
                            <button type="button" className={pcss.filter} onClick={() => setShown((n) => n + PROFILE_PAGE)}>
                                Show {Math.min(PROFILE_PAGE, views.length - shown)} more matches
                            </button>
                        </div>
                    ) : null}
                </motion.div>
            </div>
        </motion.div>
    );
}
