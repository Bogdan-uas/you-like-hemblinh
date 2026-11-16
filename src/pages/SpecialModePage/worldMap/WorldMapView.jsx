import { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaEarthEurope } from "react-icons/fa6";
import css from "./WorldMap.module.css";
import pcss from "../progress/Progress.module.css";
import CountryStage from "./CountryStage.jsx";
import CountryFlag from "./CountryFlag.jsx";
import { ewcHomeOf, EWC_COUNTRIES, EWC_LANGUAGES } from "../logic/ewcHomes.js";
import { formatOrdinal } from "../logic/teamData.js";
import { formatKeyCode, mapKeysOf, useSpecialModeSettings } from "../logic/settings.js";
import { lockPageScroll } from "../../../components/PageScrollbar/scrollLock.js";

const headerBottom = () => {
    const header = document.querySelector("header");
    const rect = header?.getBoundingClientRect();
    return rect && getComputedStyle(header).position === "fixed" ? Math.max(0, rect.bottom) : 0;
};

const PANEL_CENTER = [0.6, 0.52];

const Keys = ({ codes }) =>
    codes.map((code, i) => (
        <span key={i}>
            {i ? " " : ""}
            <kbd className={css.wm_kbd}>{code ? formatKeyCode(code) : "Off"}</kbd>
        </span>
    ));

export default function WorldMapView({ teams, rankById, onClose, onOpenProfile, onTop = true }) {
    const settings = useSpecialModeSettings();
    const keys = useMemo(() => mapKeysOf(settings), [settings]);
    const [top] = useState(headerBottom);
    const [selection, setSelection] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [playId, setPlayId] = useState(0);

    const rows = useMemo(
        () =>
            teams
                .map((team) => ({ team, home: ewcHomeOf(team), rank: rankById?.[team.id] ?? 999 }))
                .filter((row) => row.home)
                .sort((a, b) => a.rank - b.rank),
        [teams, rankById],
    );
    const byCountry = useMemo(() => {
        const map = new Map();
        rows.forEach((row) => map.set(row.home.code, [...(map.get(row.home.code) ?? []), row]));
        return map;
    }, [rows]);
    const clickable = useMemo(() => new Set(byCountry.keys()), [byCountry]);

    const code = selection?.code ?? null;
    const countryRows = code ? byCountry.get(code) ?? [] : [];
    const active = countryRows.find((r) => String(r.team.id) === String(activeId)) ?? null;
    const target = useMemo(() => {
        if (!code) return null;
        const list = byCountry.get(code) ?? [];
        return {
            code,
            flag: EWC_COUNTRIES[code]?.flag,
            dots: list.map((r) => ({ id: r.team.id, team: r.team, hq: r.home.hq })),
            activeId,
        };
    }, [code, byCountry, activeId]);

    useEffect(() => lockPageScroll(), []);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== "Escape" || e.defaultPrevented || !onTop) return;
            e.preventDefault();
            onClose();
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [onClose, onTop]);

    const pickTeam = (row) => {
        if (String(row.team.id) === String(activeId)) return;
        setSelection({ code: row.home.code });
        setActiveId(row.team.id);
        setPlayId((n) => n + 1);
    };
    const pickCountry = (countryCode) => {
        if (countryCode === code && !activeId) return;
        setSelection({ code: countryCode });
        setActiveId(null);
        if (countryCode !== code) setPlayId((n) => n + 1);
    };
    const resetWorld = () => {
        setSelection(null);
        setActiveId(null);
        setPlayId((n) => n + 1);
    };

    const openProfile = (e, team) => {
        const circle = e.currentTarget.closest(`.${css.wm_card}`)?.querySelector(`.${css.wm_card_circle}`);
        const rect = (circle ?? e.currentTarget).getBoundingClientRect();
        onOpenProfile?.(team, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, size: rect.width });
    };

    const countryInfo = code ? EWC_COUNTRIES[code] : null;
    const language = countryInfo ? EWC_LANGUAGES[countryInfo.language] : null;

    return (
        <motion.div
            className={css.wm_root}
            style={{ top, zIndex: onTop ? 998 : undefined }}
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.3 }}
        >
            <CountryStage
                className={css.wm_stage}
                target={target}
                playId={playId}
                from="current"
                fill={0.5}
                center={PANEL_CENTER}
                countryName={countryInfo?.name}
                dotLabel={(dot) => {
                    const row = countryRows.find((r) => String(r.team.id) === String(dot.id));
                    return row ? `Team ${row.team.name} · ${row.home.hq?.city ?? row.home.country}` : "";
                }}
                interactive
                clickable={clickable}
                keys={keys}
                onCountryClick={pickCountry}
                onDotClick={(id) => setActiveId((cur) => (String(cur) === String(id) ? null : id))}
                onReset={resetWorld}
            />

            <aside className={css.wm_panel} data-lenis-prevent>
                <div className={css.wm_head}>
                    <button type="button" className={pcss.filter} onClick={onClose}>
                        <FaArrowLeft aria-hidden="true" /> Leaderboard
                    </button>
                    <button type="button" className={pcss.filter} onClick={resetWorld} disabled={!selection} title="Show the whole world">
                        <FaEarthEurope aria-hidden="true" /> World
                    </button>
                </div>
                <h2 className={css.wm_title}>World map</h2>
                <span className={css.wm_sub}>
                    {rows.length} teams · {byCountry.size} countries
                </span>
                <div className={css.wm_list}>
                    {rows.map((row) => {
                        const on = active?.team === row.team;
                        const inCountry = !on && code === row.home.code;
                        return (
                            <button key={row.team.id} type="button" className={css.wm_row} data-on={on} data-country={inCountry} disabled={on} aria-current={on ? "true" : undefined} onClick={() => pickTeam(row)}>
                                <span className={css.wm_rank}>{formatOrdinal(row.rank)}</span>
                                <span className={css.wm_circle} style={{ background: row.team.gradient || row.team.color }} />
                                <span className={css.wm_name}>Team {row.team.name}</span>
                                <span className={css.wm_city}>{row.home.hq?.city}</span>
                                <CountryFlag code={row.home.code} title={row.home.country} size={14} />
                            </button>
                        );
                    })}
                </div>
            </aside>

            <div className={css.wm_controls}>
                <span className={css.wm_controls_title}>Controls</span>
                <span>
                    <b>Move</b> drag the map or <Keys codes={[keys.up, keys.left, keys.down, keys.right]} />
                </span>
                <span>
                    <b>Zoom</b> mouse wheel or <Keys codes={[keys.zoomIn, keys.zoomOut]} />
                </span>
                <span>
                    <b>Whole world</b> <Keys codes={[keys.reset]} />
                </span>
                <span className={css.wm_controls_hint}>Click a country with teams, then a golden point to see whose headquarters it is. The keys can be changed in Settings.</span>
            </div>

            {active ? (
                <motion.div key={`team-${active.team.id}`} className={css.wm_card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
                    <span className={css.wm_card_circle} style={{ background: active.team.gradient || active.team.color, boxShadow: active.team.shadow }} />
                    <div className={css.wm_card_body}>
                        <span className={css.wm_card_kicker}>{formatOrdinal(active.rank)} on the Leaderboard</span>
                        <span className={css.wm_card_name}>Team {active.team.name}</span>
                        <span className={css.wm_card_line}>
                            <CountryFlag code={active.home.code} title={active.home.country} size={14} /> {active.home.country} · {active.home.hq?.city} · {active.home.language}
                        </span>
                        {countryRows.length > 1 ? (
                            <span className={css.wm_card_text}>
                                Also from {active.home.country}:{" "}
                                {countryRows
                                    .filter((r) => r !== active)
                                    .map((r, i, list) => (
                                        <span key={r.team.id} className={css.wm_nowrap}>
                                            <button type="button" className={css.wm_link} onClick={() => setActiveId(r.team.id)}>
                                                {r.team.name}
                                            </button>
                                            {i < list.length - 1 ? ", " : ""}
                                        </span>
                                    ))}
                            </span>
                        ) : null}
                        {onOpenProfile ? (
                            <button type="button" className={`${pcss.filter} ${css.wm_profile}`} onClick={(e) => openProfile(e, active.team)}>
                                Full profile <FaArrowRight aria-hidden="true" />
                            </button>
                        ) : null}
                    </div>
                </motion.div>
            ) : countryInfo ? (
                <motion.div key={`country-${code}`} className={css.wm_card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
                    <CountryFlag code={code} title={countryInfo.name} size={48} className={css.wm_card_flag} />
                    <div className={css.wm_card_body}>
                        <span className={css.wm_card_kicker}>
                            {countryRows.length} {countryRows.length === 1 ? "team" : "teams"} · {language?.name}
                        </span>
                        <span className={css.wm_card_name}>{countryInfo.name}</span>
                        <span className={css.wm_card_line}>Click a golden point on the map to see whose headquarters it is.</span>
                    </div>
                </motion.div>
            ) : null}
        </motion.div>
    );
}
