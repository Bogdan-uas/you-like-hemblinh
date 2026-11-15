import { useEffect, useMemo, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import css from "./EwcCeremonies.module.css";
import EwcKey from "./EwcKey.jsx";
import EwcTrophyIcon from "../../../components/EwcTrophyIcon/EwcTrophyIcon.jsx";
import { WaapiParticles } from "../progress/ProgressParts.jsx";

const burst = (count, spread, seed = 1) =>
    Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.sin(i * 7.31 + seed) * 0.4;
        const dist = spread * (0.55 + ((i * 37 + seed * 13) % 45) / 100);
        const size = 4 + (i % 4) * 2.2;
        return {
            className: css.shard,
            css: { width: size, height: size * 0.7, marginLeft: -size / 2, marginTop: -size / 2 },
            frames: [
                { transform: "translate(0px, 0px) rotate(0deg) scale(0.6)", opacity: 0 },
                { transform: `translate(${Math.cos(a) * dist * 0.3}px, ${Math.sin(a) * dist * 0.3 - 10}px) rotate(${120 + i * 40}deg) scale(1.1)`, opacity: 1, offset: 0.2 },
                { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist * 0.6 + 60}px) rotate(${300 + i * 70}deg) scale(0.4)`, opacity: 0 },
            ],
            timing: { duration: 900 + (i % 5) * 120, delay: (i % 6) * 18, easing: "cubic-bezier(0.15, 0.6, 0.3, 1)" },
        };
    });

export function EwcKeyBadge({ team, defender = false, crushAnim = false, crushed = false, caption, size = 58 }) {
    const color = team?.color ?? "#d6a531";
    const state = defender ? "defender" : "intact";
    return (
        <div className={css.badge}>
            <div className={css.badge_key} style={{ width: size * 1.2, height: size }}>
                {crushAnim ? (
                    <>
                        <span className={css.badge_intact}>
                            <EwcKey color={color} state={state} size={size} />
                        </span>
                        <span className={css.badge_crushed}>
                            <EwcKey color={color} state="crushed" size={size} />
                        </span>
                    </>
                ) : (
                    <EwcKey color={color} state={crushed ? "crushed" : state} size={size} />
                )}
            </div>
            {caption ? <span className={css.badge_caption}>{caption}</span> : null}
        </div>
    );
}

export function EwcPressCeremony({ loser, winner, title, stageLabel, onDone }) {
    const [phase, setPhase] = useState("ready");
    const doneRef = useRef(onDone);
    const timersRef = useRef([]);

    useEffect(() => {
        doneRef.current = onDone;
    });

    useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

    const press = () => {
        if (phase !== "ready") return;
        setPhase("press");
        timersRef.current = [setTimeout(() => setPhase("impact"), 260), setTimeout(() => setPhase("done"), 1250)];
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.code !== "Space" && e.code !== "Enter") return;
            e.preventDefault();
            e.stopPropagation();
            if (phase === "ready") press();
            else if (phase === "done") doneRef.current?.();
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    });

    const hit = phase === "impact" || phase === "done";
    const winnerColor = winner?.color ?? "#d6a531";

    return (
        <motion.div className={css.press_overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <div className={css.press_glow} aria-hidden="true" />
            <div className={css.press_head}>
                <span className={css.press_kicker}>{title}</span>
                <span className={css.press_title}>
                    {hit ? <>Team {loser?.name}&apos;s Key is crushed</> : <>Team {loser?.name} is out</>}
                </span>
                <span className={css.press_sub}>
                    Knocked out by <span className={css.press_team_dot} style={{ background: winnerColor }} /><b>Team {winner?.name}</b>
                    {stageLabel ? <> · {stageLabel}</> : null}
                </span>
            </div>

            <div className={css.cabinet} data-hit={hit}>
                <div className={css.cabinet_glass} aria-hidden="true" />
                <div className={css.ram} data-phase={phase}>
                    <span className={css.ram_rod} />
                    <span className={css.ram_head} />
                </div>
                <div className={css.bed}>
                    <div className={css.bed_key}>
                        <span className={css.bed_intact} data-hit={hit}>
                            <EwcKey color={loser?.color} size={132} engraving={`EWC · ${String(loser?.name ?? "").toUpperCase()}`} />
                        </span>
                        <span className={css.bed_crushed} data-hit={hit}>
                            <EwcKey color={loser?.color} state="crushed" size={132} />
                        </span>
                        {hit ? (
                            <span className={css.bed_burst}>
                                <WaapiParticles items={burst(26, 170, (loser?.name?.length ?? 3) + 1)} />
                            </span>
                        ) : null}
                    </div>
                    <span className={css.bed_plate} />
                </div>
                <span className={css.flash} data-hit={hit} aria-hidden="true" />
            </div>

            <div className={css.press_foot}>
                {phase === "done" ? (
                    <motion.button type="button" className={css.continue_button} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={() => onDone?.()}>
                        Continue
                    </motion.button>
                ) : (
                    <>
                        <button
                            type="button"
                            className={css.press_button}
                            data-ready={phase === "ready"}
                            style={{ "--press-color": winnerColor }}
                            onClick={press}
                            disabled={phase !== "ready"}
                        >
                            <span className={css.press_button_ring} />
                            PRESS
                        </button>
                        <span className={css.press_hint}>Press the button (or Space) to crush the Key</span>
                    </>
                )}
            </div>
        </motion.div>
    );
}

export function EwcKeyPickScreen({ champion, candidates, title, motto, onConfirm }) {
    const [picked, setPicked] = useState([]);
    const [sealed, setSealed] = useState(false);
    const need = Math.min(3, candidates.length);

    const toggle = (team) => {
        if (sealed) return;
        setPicked((prev) => (prev.some((t) => t.id === team.id) ? prev.filter((t) => t.id !== team.id) : prev.length >= need ? prev : [...prev, team]));
    };

    const shardColors = [0, 1, 2].map((i) => picked[i]?.color ?? null);

    return (
        <div className={css.pick_page}>
            <div className={css.pick_head}>
                <span className={css.press_kicker} style={{ color: "#8a8d99" }}>{title}</span>
                <h2 className={css.pick_title}>
                    Team <span style={{ color: champion?.color }}>{champion?.name}</span> picks three Keys for its trophy
                </h2>
                <span className={css.pick_sub}>The crushed Keys of three teams it defeated are sealed into the base of the Esports World Cup trophy.</span>
            </div>
            <div className={css.pick_body}>
                <div className={css.pick_grid}>
                    {candidates.map((team) => {
                        const order = picked.findIndex((t) => t.id === team.id);
                        return (
                            <button key={team.id} type="button" className={css.pick_card} data-on={order >= 0} disabled={sealed} onClick={() => toggle(team)}>
                                {order >= 0 ? <span className={css.pick_order}>{order + 1}</span> : null}
                                <EwcKey color={team.color} state="crushed" size={54} />
                                <span className={css.pick_name}>
                                    <span className={css.pick_dot} style={{ background: team.color }} />
                                    Team {team.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className={css.pick_trophy} data-sealed={sealed}>
                    <span className={css.pick_trophy_glow} aria-hidden="true" />
                    <EwcTrophyIcon size={430} keyColor={champion?.color} shardColors={shardColors} motto={sealed ? motto : undefined} />
                </div>
            </div>
            <div className={css.pick_foot}>
                {sealed ? (
                    <motion.button type="button" className={css.continue_button} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} onClick={() => onConfirm(picked)}>
                        Continue
                    </motion.button>
                ) : (
                    <button type="button" className={css.seal_button} disabled={picked.length < need} onClick={() => setSealed(true)}>
                        {picked.length < need ? `Pick ${need - picked.length} more` : "Seal them into the trophy"}
                    </button>
                )}
            </div>
        </div>
    );
}

const TOTEM_W = 320;
const TOTEM_H = 610;
const TOTEM_APEX = 22;
const TOTEM_BASE = 434;
const TOTEM_HALF = 112;
const halfAt = (y) => (TOTEM_HALF * (y - TOTEM_APEX)) / (TOTEM_BASE - TOTEM_APEX);
const facePoints = (y0, y1, inset) => {
    const c = TOTEM_W / 2;
    return `${c - halfAt(y0) + inset},${y0} ${c + halfAt(y0) - inset},${y0} ${c + halfAt(y1) - inset},${y1} ${c - halfAt(y1) + inset},${y1}`;
};

const totemShards = (teams) =>
    teams.map((team, i) => {
        const r = (n) => {
            const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
            return x - Math.floor(x);
        };
        const cx = 54 + r(1) * (TOTEM_W - 108);
        const spread = (cx - TOTEM_W / 2) / (TOTEM_W / 2 - 54);
        const cy = 544 - Math.pow(r(2), 1.8) * 66 * (1 - spread * spread);
        const s = 6 + r(3) * 6;
        const rot = r(4) * 360;
        return { key: `${team.id}-${i}`, color: team.color, points: `${-s},${s * 0.4} ${-s * 0.2},${-s * 0.6} ${s * 0.7},${-s * 0.3} ${s},${s * 0.5} ${s * 0.1},${s * 0.8}`, transform: `translate(${cx} ${cy}) rotate(${rot})` };
    });

export function EwcTotem({ records }) {
    const sorted = useMemo(() => [...records].sort((a, b) => (a.number ?? 0) - (b.number ?? 0)), [records]);
    const fragments = useMemo(
        () => totemShards(sorted.flatMap((record) => (record.places || []).slice(1).map((entry) => entry.team).filter(Boolean))),
        [sorted],
    );
    const c = TOTEM_W / 2;
    const apex = `${c},${TOTEM_APEX}`;
    const left = `${c - TOTEM_HALF},${TOTEM_BASE}`;
    const right = `${c + TOTEM_HALF},${TOTEM_BASE}`;
    const mid = `${c},${TOTEM_BASE}`;
    const capY = 96;
    const capHalf = halfAt(capY);
    const caseY = TOTEM_BASE + 8;
    return (
        <div className={css.totem}>
            <svg viewBox={`0 0 ${TOTEM_W} ${TOTEM_H}`} width={TOTEM_W} height={TOTEM_H} className={css.totem_svg}>
                <defs>
                    <radialGradient id="ewc-totem-glow" cx="0.5" cy="0.5" r="0.5">
                        <stop offset="0" stopColor="#f3cf62" stopOpacity="0.35" />
                        <stop offset="1" stopColor="#f3cf62" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="ewc-totem-face-l" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#62677f" />
                        <stop offset="1" stopColor="#363a4d" />
                    </linearGradient>
                    <linearGradient id="ewc-totem-face-r" x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#2f3242" />
                        <stop offset="1" stopColor="#1b1d27" />
                    </linearGradient>
                    <linearGradient id="ewc-totem-gold" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#fff4c2" />
                        <stop offset="0.5" stopColor="#d6a531" />
                        <stop offset="1" stopColor="#8a5f0f" />
                    </linearGradient>
                    <linearGradient id="ewc-totem-gold-dark" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#d6a531" />
                        <stop offset="1" stopColor="#6e4a0b" />
                    </linearGradient>
                    <linearGradient id="ewc-totem-marble" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#4a4e63" />
                        <stop offset="1" stopColor="#23252f" />
                    </linearGradient>
                    <radialGradient id="ewc-totem-velvet" cx="0.5" cy="0.9" r="0.8">
                        <stop offset="0" stopColor="#3a2f55" />
                        <stop offset="1" stopColor="#101119" />
                    </radialGradient>
                    <linearGradient id="ewc-totem-glass" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
                        <stop offset="0.6" stopColor="#d9e6f5" stopOpacity="0.08" />
                        <stop offset="1" stopColor="#d9e6f5" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
                <ellipse cx={c} cy={290} rx={155} ry={270} fill="url(#ewc-totem-glow)" />
                <ellipse cx={c} cy={TOTEM_H - 8} rx={150} ry={7} fill="#000" opacity="0.18" />

                <polygon points={`${apex} ${left} ${mid}`} fill="url(#ewc-totem-face-l)" />
                <polygon points={`${apex} ${mid} ${right}`} fill="url(#ewc-totem-face-r)" />
                <polygon points={`${apex} ${c - TOTEM_HALF + 18},${TOTEM_BASE} ${c - TOTEM_HALF + 34},${TOTEM_BASE}`} fill="#ffffff" opacity="0.07" />
                <polygon points={facePoints(206, 424, 12)} fill="#14151d" opacity="0.55" stroke="#d6a531" strokeOpacity="0.45" strokeWidth="1" />
                <text x={c} y={224} textAnchor="middle" fill="#d6a531" fontSize="8.5" fontWeight="800" letterSpacing="2.2" fontFamily="Oswald, sans-serif">CHAMPIONS</text>
                <line x1={c} y1={TOTEM_APEX} x2={c} y2={TOTEM_BASE} stroke="#d6a531" strokeOpacity="0.35" strokeWidth="1" />
                <polyline points={`${left} ${apex} ${right}`} fill="none" stroke="url(#ewc-totem-gold)" strokeWidth="2.2" strokeLinejoin="round" />

                <polygon points={`${apex} ${c - capHalf},${capY} ${c},${capY}`} fill="url(#ewc-totem-gold)" />
                <polygon points={`${apex} ${c},${capY} ${c + capHalf},${capY}`} fill="url(#ewc-totem-gold-dark)" />
                <line x1={c - capHalf - 2} y1={capY + 2} x2={c + capHalf + 2} y2={capY + 2} stroke="url(#ewc-totem-gold)" strokeWidth="3" />

                <polygon points={`${c},118 ${c + 27},168 ${c - 27},168`} fill="url(#ewc-totem-gold)" />
                <polygon points={`${c},133 ${c + 15},160 ${c - 15},160`} fill="#1c1e29" />
                <polygon points={`${c},142 ${c + 7},155 ${c - 7},155`} fill="url(#ewc-totem-gold)" />

                <rect x="30" y={TOTEM_BASE} width={TOTEM_W - 60} height="8" rx="2" fill="url(#ewc-totem-gold)" />
                <rect x="38" y={caseY} width={TOTEM_W - 76} height="108" fill="url(#ewc-totem-velvet)" />
                {fragments.map((f) => (
                    <polygon key={f.key} points={f.points} transform={f.transform} fill={f.color} stroke="#000" strokeOpacity="0.35" strokeWidth="0.8" />
                ))}
                <rect x="38" y={caseY} width={TOTEM_W - 76} height="108" fill="url(#ewc-totem-glass)" />
                <polygon points={`64,${caseY} 92,${caseY} 52,${caseY + 108} 38,${caseY + 108} 38,${caseY + 70}`} fill="#ffffff" opacity="0.14" />
                <polygon points={`104,${caseY} 114,${caseY} 74,${caseY + 108} 64,${caseY + 108}`} fill="#ffffff" opacity="0.1" />
                <rect x="38" y={caseY} width={TOTEM_W - 76} height="108" fill="none" stroke="url(#ewc-totem-gold)" strokeWidth="3" />
                <rect x="32" y={caseY} width="8" height="110" rx="2" fill="url(#ewc-totem-gold)" />
                <rect x={TOTEM_W - 40} y={caseY} width="8" height="110" rx="2" fill="url(#ewc-totem-gold-dark)" />

                <rect x="24" y="552" width={TOTEM_W - 48} height="22" rx="3" fill="url(#ewc-totem-marble)" />
                <rect x="24" y="552" width={TOTEM_W - 48} height="3" fill="url(#ewc-totem-gold)" />
                <rect x="10" y="574" width={TOTEM_W - 20} height="26" rx="4" fill="url(#ewc-totem-marble)" />
                <rect x="10" y="574" width={TOTEM_W - 20} height="3" fill="url(#ewc-totem-gold)" />
                <text x={c} y="592" textAnchor="middle" fill="#d6a531" fontSize="9" fontWeight="800" letterSpacing="3" fontFamily="Oswald, sans-serif">ESPORTS WORLD CUP</text>
            </svg>
            <div className={css.totem_names} style={{ fontSize: sorted.length > 6 ? 10 : 12 }}>
                {sorted.map((record) => {
                    const champ = record.results?.winner;
                    return (
                        <span key={record.id} className={css.totem_row}>
                            <span className={css.totem_number}>#{record.number}</span>
                            <span className={css.totem_dot} style={{ background: champ?.color }} />
                            <span className={css.totem_team}>{champ ? `Team ${champ.name}` : "—"}</span>
                        </span>
                    );
                })}
            </div>
            <span className={css.totem_caption}>
                {fragments.length} crushed {fragments.length === 1 ? "Key rests" : "Keys rest"} in the base of the Totem
            </span>
        </div>
    );
}
