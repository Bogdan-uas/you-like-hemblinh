import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark, FaMagnifyingGlassPlus, FaMagnifyingGlassMinus, FaArrowsRotate, FaArrowRight, FaKey } from "react-icons/fa6";
import { PemGoldTrophy, PemSilverTrophy, GplTrophy, PbsTrophy, PgxTrophy, EssTrophy, SwcTrophy, EwcTrophy, Tier15Medal, OfficialTrophy, PlaceMedal } from "./Trophies.jsx";
import { recordTitle } from "../logic/trophyCase.js";
import { hostOfRecord } from "../logic/hostCities.js";
import { TROPHY_WEIGHTS } from "../logic/teamData.js";
import { getAnniversaryTheme } from "../logic/winnersAndPickem.js";
import { HostBadge } from "../worldMap/HostCity.jsx";
import { TournamentNumberText } from "./TournamentNumberText.jsx";
import css from "./TrophyRoom.module.css";

const RoomOfficialTrophy = ({ size }) => <OfficialTrophy size={size} color="#2e2f42" style={{ filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 10px rgba(255, 236, 200, 0.35))" }} />;

const medalOf = (place) => {
    const Medal = ({ size }) => <PlaceMedal place={place} size={size} />;
    return Medal;
};

const TROPHY_KEYS = [
    { key: "wins", label: "Official", Icon: RoomOfficialTrophy },
    { key: "ewcWins", label: "Esports World Cup", Icon: EwcTrophy },
    { key: "pemBigWins", label: "PEM Big Tournament", Icon: PemGoldTrophy },
    { key: "gplWins", label: "Global Pro League", Icon: GplTrophy },
    { key: "pbsWins", label: "Premier Bounty Series", Icon: PbsTrophy },
    { key: "tier1Wins", label: "PEM Small Tournament", Icon: PemSilverTrophy },
    { key: "pgxWins", label: "PGX Grandmasters", Icon: PgxTrophy },
    { key: "essWins", label: "Elite Star Series", Icon: EssTrophy },
    { key: "swcWins", label: "Stormdraft World Championship", Icon: SwcTrophy },
];

const MEDAL_KEYS = [
    { key: "tier15Wins", label: "Tier 1.5 tournament", place: 1, Icon: Tier15Medal },
    { key: "tier2Wins", label: "Tier 2 tournament", place: 1, Icon: medalOf(1) },
    { key: "seconds", label: "Official", place: 2, Icon: medalOf(2) },
    { key: "ewcSeconds", label: "Esports World Cup", place: 2, Icon: medalOf(2) },
    { key: "tier1Seconds", label: "Tier 1 tournament", place: 2, Icon: medalOf(2) },
    { key: "tier15Seconds", label: "Tier 1.5 tournament", place: 2, Icon: medalOf(2) },
    { key: "tier2Seconds", label: "Tier 2 tournament", place: 2, Icon: medalOf(2) },
    { key: "thirds", label: "Official", place: 3, Icon: medalOf(3) },
    { key: "ewcThirds", label: "Esports World Cup", place: 3, Icon: medalOf(3) },
    { key: "tier1Thirds", label: "Tier 1 tournament", place: 3, Icon: medalOf(3) },
    { key: "tier15Thirds", label: "Tier 1.5 tournament", place: 3, Icon: medalOf(3) },
    { key: "tier2Thirds", label: "Tier 2 tournament", place: 3, Icon: medalOf(3) },
];

const PLACE_TEXT = { 1: "Champion", 2: "Runner-up", 3: "Third place" };
const MINOR_PLACE_TEXT = { 1: "1st place", 2: "2nd place", 3: "3rd place" };
const placeTextOf = (item) => (/^tier(15|2)/.test(item.key) ? MINOR_PLACE_TEXT : PLACE_TEXT)[item.place];

const hashOf = (text) => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
};

const formatDate = (iso) => {
    const time = Date.parse(iso ?? "");
    if (!Number.isFinite(time)) return null;
    return new Date(time).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

const buildItems = (defs, placings, cases, ewcTrophies, kind) => {
    const items = [];
    defs.forEach((def) => {
        const records = cases?.[def.key] ?? [];
        const count = Math.max(Number(placings?.[def.key]) || 0, records.length);
        for (let i = 0; i < count; i++) {
            const record = records[i] ?? null;
            const ewc = def.key === "ewcWins" ? ewcTrophies?.find((trophy) => trophy.id === record?.id) ?? ewcTrophies?.[i] ?? null : null;
            items.push({
                id: `${def.key}-${i}`,
                key: def.key,
                index: i,
                kind,
                def,
                record,
                ewc,
                place: def.place ?? 1,
                weight: TROPHY_WEIGHTS[def.key] ?? 0,
                time: Date.parse(record?.finishedAt ?? "") || 0,
            });
        }
    });
    return items;
};

const titleOf = (item) => (item.record ? recordTitle(item.record) : item.def.label);

const matchesFocus = (item, focus) => {
    if (!focus) return false;
    if (focus.place != null) return item.kind === "medal" && item.place === focus.place && item.key !== "tier15Wins" && item.key !== "tier2Wins";
    if (focus.key !== item.key) return false;
    return focus.index == null || focus.index === item.index;
};

const ItemIcon = ({ item, size, highlightShard = null }) => {
    const { Icon } = item.def;
    if (item.ewc) return <EwcTrophy size={size} keyColor={item.ewc.keyColor} shardColors={item.ewc.shardColors} motto={size >= 150 ? item.ewc.motto : undefined} highlightShard={highlightShard} />;
    return <Icon size={size} />;
};

const PanZoom = ({ children }) => {
    const stageRef = useRef(null);
    const layerRef = useRef(null);
    const view = useRef({ x: 0, y: 0, z: 1 });
    const drag = useRef(null);
    const crispRef = useRef(1);
    const settleRef = useRef(0);
    const [zoom, setZoom] = useState(1);
    const [crisp, setCrisp] = useState(1);

    const apply = (animate = false) => {
        const layer = layerRef.current;
        if (!layer) return;
        const { x, y, z } = view.current;
        layer.style.transition = animate ? "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)" : "none";
        layer.style.transform = `translate(${x}px, ${y}px) scale(${z / crispRef.current})`;
        setZoom(z);
        clearTimeout(settleRef.current);
        settleRef.current = setTimeout(() => setCrisp(Math.max(1, Math.round(view.current.z * 4) / 4)), animate ? 360 : 180);
    };

    useLayoutEffect(() => {
        if (crispRef.current === crisp) return;
        crispRef.current = crisp;
        const layer = layerRef.current;
        if (!layer) return;
        const { x, y, z } = view.current;
        layer.style.transition = "none";
        layer.style.transform = `translate(${x}px, ${y}px) scale(${z / crisp})`;
    }, [crisp]);

    useEffect(() => () => clearTimeout(settleRef.current), []);

    const zoomAt = (factor, cx, cy, animate = false) => {
        const stage = stageRef.current;
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const px = (cx ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
        const py = (cy ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;
        const { x, y, z } = view.current;
        const next = Math.min(6, Math.max(0.45, z * factor));
        const k = next / z;
        view.current = { x: px - (px - x) * k, y: py - (py - y) * k, z: next };
        apply(animate);
    };

    const reset = () => {
        view.current = { x: 0, y: 0, z: 1 };
        apply(true);
    };

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return undefined;
        const onWheel = (e) => {
            e.preventDefault();
            zoomAt(Math.exp(-e.deltaY * 0.0016), e.clientX, e.clientY);
        };
        stage.addEventListener("wheel", onWheel, { passive: false });
        return () => stage.removeEventListener("wheel", onWheel);
    });

    const endDrag = (e) => {
        drag.current = null;
        delete e.currentTarget.dataset.dragging;
    };

    return (
        <div
            ref={stageRef}
            className={css.pz_stage}
            onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                drag.current = { sx: e.clientX, sy: e.clientY, x: view.current.x, y: view.current.y };
                e.currentTarget.dataset.dragging = "";
            }}
            onPointerMove={(e) => {
                const d = drag.current;
                if (!d) return;
                view.current = { ...view.current, x: d.x + e.clientX - d.sx, y: d.y + e.clientY - d.sy };
                apply(false);
            }}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={reset}
        >
            <div ref={layerRef} className={css.pz_layer}>
                {children(crisp)}
            </div>
            <div className={css.pz_controls} onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => zoomAt(1 / 1.35, null, null, true)} aria-label="Zoom out">
                    <FaMagnifyingGlassMinus aria-hidden="true" />
                </button>
                <span className={css.pz_zoom}>{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => zoomAt(1.35, null, null, true)} aria-label="Zoom in">
                    <FaMagnifyingGlassPlus aria-hidden="true" />
                </button>
                <button type="button" onClick={reset} aria-label="Reset the view">
                    <FaArrowsRotate aria-hidden="true" />
                </button>
            </div>
            <span className={css.pz_hint}>Scroll to zoom · drag to look around · double-click to reset</span>
        </div>
    );
};

const Inspect = ({ item, team, onClose, onOpenTournament }) => {
    const record = item.record;
    const host = hostOfRecord(record);
    const date = formatDate(record?.finishedAt);
    const results = record?.results ?? {};
    const opponent = item.place === 1 ? results.runnerUp : item.place === 2 ? results.winner : null;
    const keys = item.ewc ? (record?.pickedKeys ?? []).slice(0, 3) : [];
    const [shard, setShard] = useState(null);

    return (
        <motion.div className={css.inspect} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <span className={css.inspect_spot} aria-hidden="true" />
            <PanZoom>
                {(crisp) => (
                    <motion.span className={css.inspect_icon} initial={{ scale: 0.7, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
                        <ItemIcon item={item} size={(item.kind === "medal" ? 340 : 440) * crisp} highlightShard={shard} />
                    </motion.span>
                )}
            </PanZoom>

            <motion.aside className={css.panel} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
                <span className={css.panel_place} data-place={item.place}>
                    {placeTextOf(item)}
                </span>
                <span className={css.panel_title}><TournamentNumberText text={titleOf(item)} /></span>
                {host ? <HostBadge host={host} title={titleOf(item)} /> : null}
                <span className={css.panel_lines}>
                    {date ? (
                        <span>
                            {item.place === 1 ? "Won" : "Earned"} on <b>{date}</b>
                        </span>
                    ) : (
                        <span>Earned before the Hall of Fame kept its records</span>
                    )}
                    {opponent ? (
                        <span>
                            {item.place === 1 ? "Beat " : "Lost the final to "}
                            <b style={{ color: opponent.color }}>Team {opponent.name}</b>
                            {item.place === 1 ? " in the final" : ""}
                        </span>
                    ) : null}
                </span>
                {keys.length ? (
                    <span className={css.keys}>
                        <span className={css.keys_title}>
                            <FaKey aria-hidden="true" /> Keys sealed into its base
                        </span>
                        {keys.map((key, i) => (
                            <button
                                key={`${key?.id ?? i}`}
                                type="button"
                                className={css.key_row}
                                data-active={shard === i || undefined}
                                onClick={() => setShard((current) => (current === i ? null : i))}
                                style={{ "--key": key?.color ?? "#d6a531" }}
                            >
                                <span className={css.key_dot} />
                                <span className={css.key_text}>
                                    <b>Team {key?.name ?? "—"}</b>
                                    <span>{["Left shard", "Centre shard", "Right shard"][i]} · its Key was crushed in the press</span>
                                </span>
                            </button>
                        ))}
                    </span>
                ) : null}
                <span className={css.panel_team}>
                    <span className={css.panel_dot} style={{ background: team.gradient || team.color }} />
                    Team {team.name}
                </span>
                {record ? (
                    <button type="button" className={css.panel_go} onClick={() => onOpenTournament?.(record)}>
                        Go to the tournament <FaArrowRight aria-hidden="true" />
                    </button>
                ) : null}
            </motion.aside>

            <button type="button" className={css.inspect_close} onClick={onClose} aria-label="Back to the trophy room">
                <FaXmark aria-hidden="true" />
            </button>
        </motion.div>
    );
};

const ShelfItem = ({ item, size, focused, onOpen }) => {
    return (
        <button
            type="button"
            className={css.item}
            data-focus={focused || undefined}
            onClick={() => onOpen(item)}
            title={titleOf(item)}
            style={{ "--h": `${size}px` }}
        >
            <span className={css.item_body}>
                <ItemIcon item={item} size={size} />
            </span>
            <span className={css.item_shadow} aria-hidden="true" />
        </button>
    );
};

const HangingMedal = ({ item, focused, onOpen, index }) => {
    const swing = ((hashOf(item.id) % 9) - 4) * 1.4;
    return (
        <button
            type="button"
            className={css.medal}
            data-focus={focused || undefined}
            onClick={() => onOpen(item)}
            title={titleOf(item)}
            style={{ "--swing": `${swing}deg`, "--drop": `${18 + (index % 3) * 10}px` }}
        >
            <span className={css.hook} aria-hidden="true" />
            <span className={css.medal_body}>
                <span className={css.cord} aria-hidden="true" />
                <ItemIcon item={item} size={item.key === "tier15Wins" ? 58 : 64} />
            </span>
        </button>
    );
};

const chunk = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));

export function TrophyRoom({ team, placings, cases, ewcTrophies, focus = null, onClose, onOpenTournament }) {
    const [inspect, setInspect] = useState(null);
    const roomRef = useRef(null);
    const trophies = useMemo(() => buildItems(TROPHY_KEYS, placings, cases, ewcTrophies, "trophy").sort((a, b) => a.time - b.time), [placings, cases, ewcTrophies]);
    const medals = useMemo(() => buildItems(MEDAL_KEYS, placings, cases, ewcTrophies, "medal").sort((a, b) => a.place - b.place || a.time - b.time), [placings, cases, ewcTrophies]);
    const featured = useMemo(() => {
        if (!trophies.length) return null;
        const top = Math.max(...trophies.map((item) => item.weight));
        const best = trophies.filter((item) => item.weight === top);
        const anniversaries = best.filter((item) => getAnniversaryTheme(Number(item.record?.number) || 0));
        if (anniversaries.length) return [...anniversaries].sort((a, b) => Number(b.record.number) - Number(a.record.number))[0];
        return [...best].sort((a, b) => (a.time || Infinity) - (b.time || Infinity) || a.index - b.index)[0];
    }, [trophies]);
    const shelves = chunk(trophies.filter((item) => item !== featured), 6);
    const racks = chunk(medals, 9);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== "Escape") return;
            e.preventDefault();
            e.stopImmediatePropagation();
            if (inspect) setInspect(null);
            else onClose();
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [inspect, onClose]);

    useLayoutEffect(() => {
        if (!focus) return;
        const room = roomRef.current;
        const el = room?.querySelector("[data-focus]");
        if (!el) return;
        const rect = el.getBoundingClientRect();
        room.scrollTop = Math.max(0, rect.top + room.scrollTop - window.innerHeight / 2 + rect.height / 2);
    }, [focus]);

    return createPortal(
        <motion.div ref={roomRef} className={css.room} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }} transition={{ duration: 0.3 }} data-lenis-prevent>
            <span className={css.wall} aria-hidden="true" />
            <div className={css.room_inner}>
                <div className={css.head}>
                    <span className={css.head_dot} style={{ background: team.gradient || team.color }} />
                    <span className={css.head_text}>
                        <span className={css.kicker}>Trophy room</span>
                        <span className={css.title}>Team {team.name}</span>
                    </span>
                    <span className={css.counts}>
                        <b>{trophies.length}</b> {trophies.length === 1 ? "trophy" : "trophies"} · <b>{medals.length}</b> {medals.length === 1 ? "medal" : "medals"}
                    </span>
                    <button type="button" className={css.close} onClick={onClose}>
                        Leave the room
                    </button>
                </div>

                {featured ? (
                    <div className={css.showcase}>
                        <span className={css.showcase_light} aria-hidden="true" />
                        <button type="button" className={css.showcase_item} data-focus={matchesFocus(featured, focus) || undefined} onClick={() => setInspect(featured)} title={titleOf(featured)}>
                            <ItemIcon item={featured} size={190} />
                        </button>
                        <span className={css.pedestal}>
                            <span className={css.pedestal_plate}><TournamentNumberText text={titleOf(featured)} /></span>
                        </span>
                    </div>
                ) : null}

                {shelves.map((row, r) => (
                    <div key={`shelf-${r}`} className={css.shelf_row}>
                        <div className={css.shelf_items} data-side={r % 2 ? "right" : "left"}>
                            {row.map((item) => (
                                <ShelfItem key={item.id} item={item} size={item.key === "ewcWins" ? 104 : 112} focused={matchesFocus(item, focus)} onOpen={setInspect} />
                            ))}
                        </div>
                        <span className={css.shelf} aria-hidden="true" />
                    </div>
                ))}

                {racks.length ? (
                    <div className={css.medal_wall}>
                        <span className={css.medal_wall_title}>Medals</span>
                        {racks.map((row, r) => (
                            <div key={`rack-${r}`} className={css.rack}>
                                <span className={css.rail} aria-hidden="true" />
                                <div className={css.rack_items}>
                                    {row.map((item, i) => (
                                        <HangingMedal key={item.id} item={item} index={i} focused={matchesFocus(item, focus)} onOpen={setInspect} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}

                <span className={css.hint}>Click any trophy or medal to look at it up close.</span>
            </div>

            <AnimatePresence>
                {inspect ? (
                    <Inspect
                        key={inspect.id}
                        item={inspect}
                        team={team}
                        onClose={() => setInspect(null)}
                        onOpenTournament={(record) => onOpenTournament?.(record, inspect)}
                    />
                ) : null}
            </AnimatePresence>
        </motion.div>,
        document.body,
    );
}
