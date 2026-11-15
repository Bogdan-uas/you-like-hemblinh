import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import css from "./WorldMap.module.css";
import { WaapiParticles } from "../progress/ProgressParts.jsx";
import { cameraForBox, cameraTransform, clampCamera, easeInOut, flagUrlOf, projectLatLon, useWorldMap, zoomPath } from "./worldMapCore.js";

const BAND = 2.6;
const GOLD_AT = 120;
const FLAG_AT = 820;
const NAME_AT = 1350;
const HQ_AT = 1900;
const MIN_FLIGHT = 900;
const MAX_FLIGHT = 2600;
const PHASES = ["idle", "fly", "land", "gold", "flag", "name", "hq"];
const PAN_SPEED = 720;
const ZOOM_SPEED = 1.5;
const DOT_GAP = 22;

const useSize = (ref) => {
    const [size, setSize] = useState(null);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const measure = () => {
            const r = el.getBoundingClientRect();
            setSize((s) => (s && Math.abs(s.width - r.width) < 0.5 && Math.abs(s.height - r.height) < 0.5 ? s : { width: r.width, height: r.height }));
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [ref]);
    return size;
};

const coverBox = ([x0, y0, x1, y1]) => {
    const w = x1 - x0;
    const h = y1 - y0;
    const width = Math.max(w, (h * 4) / 3) * 1.04;
    const height = (width * 3) / 4;
    return { x: (x0 + x1) / 2 - width / 2, y: (y0 + y1) / 2 - height / 2, width, height };
};

const anchor = (x, y) => ({ "--mx": x, "--my": y });

const sparkItems = (points, center, seed) =>
    points.map(([x, y], i) => {
        const a = Math.atan2(y - center[1], x - center[0]) + Math.sin(i * 12.9898 + seed) * 0.5;
        const dist = 30 + ((i * 37 + seed * 11) % 44);
        const size = 4.5 + (i % 3) * 2;
        return {
            className: `${css.anchor} ${css.spark}`,
            css: { ...anchor(x, y), width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 },
            frames: [
                { transform: "translate(0px, 0px) scale(0.4)", opacity: 0 },
                { transform: `translate(${Math.cos(a) * dist * 0.35}px, ${Math.sin(a) * dist * 0.35}px) scale(1.25)`, opacity: 1, offset: 0.22 },
                { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px) scale(0.2)`, opacity: 0 },
            ],
            timing: { duration: 760 + (i % 4) * 110, delay: (i % 7) * 30, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
        };
    });

const nameSparkItems = (seed) =>
    Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + seed;
        const dist = 16 + (i % 4) * 7;
        const size = 3 + (i % 3);
        return {
            className: css.spark,
            css: { left: `${(0.5 + Math.cos(a) * 0.5) * 100}%`, top: `${(0.5 + Math.sin(a) * 0.5) * 100}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 },
            frames: [
                { transform: "translate(0px, 0px) scale(0.3)", opacity: 0 },
                { transform: `translate(${Math.cos(a) * dist * 0.4}px, ${Math.sin(a) * dist * 0.4}px) scale(1.2)`, opacity: 1, offset: 0.25 },
                { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px) scale(0.2)`, opacity: 0 },
            ],
            timing: { duration: 820, delay: (i % 5) * 30, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
        };
    });

const spreadDots = (points, k) => {
    const out = points.map((p) => ({ ...p, nx: 0, ny: 0 }));
    for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < out.length; i++) {
            for (let j = i + 1; j < out.length; j++) {
                const dx = (out[j].x - out[i].x) * k + out[j].nx - out[i].nx;
                const dy = (out[j].y - out[i].y) * k + out[j].ny - out[i].ny;
                const d = Math.hypot(dx, dy);
                if (d >= DOT_GAP) continue;
                const ux = d > 0.01 ? dx / d : 1;
                const uy = d > 0.01 ? dy / d : 0;
                const push = (DOT_GAP - d) / 2;
                out[i].nx -= ux * push;
                out[i].ny -= uy * push;
                out[j].nx += ux * push;
                out[j].ny += uy * push;
            }
        }
    }
    return out;
};

const isTyping = (el) => !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

export default function CountryStage({
    target,
    playId = 0,
    from = "world",
    fill = 0.6,
    center = [0.5, 0.5],
    countryName,
    dotLabel,
    interactive = false,
    clickable = null,
    keys = null,
    onCountryClick,
    onDotClick,
    onReset,
    className = "",
    onDone,
}) {
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const wrapRef = useRef(null);
    const camGroupRef = useRef(null);
    const overlayRef = useRef(null);
    const shapeRef = useRef(null);
    const camRef = useRef(null);
    const flightRef = useRef(null);
    const cbRef = useRef({});
    const size = useSize(wrapRef);
    const data = useWorldMap();
    const [stage, setStage] = useState({ code: null, phase: "idle", id: 0, landK: 1, sparks: null, labelBelow: false });

    useEffect(() => {
        cbRef.current = { onDone, onCountryClick, onDotClick, onReset, from, fill, center, keys, interactive };
    });

    const code = target?.code ?? null;
    const country = data && stage.code ? data.WORLD_COUNTRIES[stage.code] : null;
    const clickableKey = clickable ? [...clickable].sort().join(",") : "";
    const layers = useMemo(() => {
        if (!data) return { backdrop: "", clickables: [] };
        const open = new Set(clickableKey ? clickableKey.split(",") : []);
        const rest = Object.entries(data.WORLD_COUNTRIES).filter(([c]) => c !== stage.code);
        return {
            backdrop: data.WORLD_BACKDROP + rest.filter(([c]) => !open.has(c)).map(([, v]) => v.d).join(""),
            clickables: rest.filter(([c]) => open.has(c)),
        };
    }, [data, stage.code, clickableKey]);

    const stageW = size?.width;
    const stageH = size?.height;
    const worldCam = stageW && data ? cameraForBox([0, 0, data.WORLD_SIZE.width, data.WORLD_SIZE.height], stageW, stageH, 0.97, center) : null;

    const applyCam = (cam) => {
        camRef.current = cam;
        camGroupRef.current?.setAttribute("transform", cameraTransform(cam));
        const o = overlayRef.current;
        if (o) {
            o.style.setProperty("--ox", `${cam.ox}px`);
            o.style.setProperty("--oy", `${cam.oy}px`);
            o.style.setProperty("--cx", String(cam.cx));
            o.style.setProperty("--cy", String(cam.cy));
            o.style.setProperty("--k", String(cam.k));
        }
    };
    const applyRef = useRef(applyCam);
    applyRef.current = applyCam;

    useLayoutEffect(() => {
        if (!stageW || !stageH || !data || !camGroupRef.current) return undefined;
        const { from, fill, center } = cbRef.current;
        const targetCountry = code ? data.WORLD_COUNTRIES[code] : null;
        const world = cameraForBox([0, 0, data.WORLD_SIZE.width, data.WORLD_SIZE.height], stageW, stageH, 0.97, center);
        const end = targetCountry ? cameraForBox(targetCountry.box, stageW, stageH, fill, center) : world;
        const start = from === "world" || !camRef.current ? world : { ...camRef.current, ox: world.ox, oy: world.oy };
        applyRef.current(start);
        setStage((s) => ({ ...s, phase: "fly", id: s.id + 1, sparks: null }));
        const flight = zoomPath(start, end, Math.max(stageW, stageH));
        const same = Math.abs(start.cx - end.cx) * end.k < 1 && Math.abs(start.cy - end.cy) * end.k < 1 && Math.abs(start.k / end.k - 1) < 0.01;
        const duration = same ? 1 : Math.max(MIN_FLIGHT, Math.min(MAX_FLIGHT, flight.duration * 0.9));
        const delay = from === "world" ? 260 : 0;
        const started = performance.now() + delay;
        const timers = [];
        let frame = 0;
        let landed = false;
        const land = () => {
            if (landed) return;
            landed = true;
            cancelAnimationFrame(frame);
            flightRef.current = null;
            const cam = camRef.current ?? end;
            if (!targetCountry) {
                setStage((s) => ({ ...s, code: null, phase: "idle", landK: cam.k }));
                cbRef.current.onDone?.();
                return;
            }
            const vh = cam.oy + (targetCountry.box[1] - cam.cy) * cam.k;
            setStage((s) => ({ ...s, code, phase: "land", landK: cam.k, labelBelow: vh < 70 }));
            timers.push(setTimeout(() => setStage((s) => ({ ...s, phase: "gold" })), GOLD_AT));
            timers.push(setTimeout(() => setStage((s) => ({ ...s, phase: "flag" })), FLAG_AT));
            timers.push(setTimeout(() => setStage((s) => ({ ...s, phase: "name" })), NAME_AT));
            timers.push(
                setTimeout(() => {
                    setStage((s) => ({ ...s, phase: "hq" }));
                    cbRef.current.onDone?.();
                }, HQ_AT),
            );
        };
        const step = (now) => {
            const t = Math.max(0, Math.min(1, (now - started) / duration));
            applyRef.current(flight.at(easeInOut(t)));
            if (t < 1) frame = requestAnimationFrame(step);
            else {
                applyRef.current(end);
                land();
            }
        };
        frame = requestAnimationFrame(step);
        flightRef.current = { land };
        return () => {
            cancelAnimationFrame(frame);
            flightRef.current = null;
            timers.forEach(clearTimeout);
        };
    }, [playId, code, stageW, stageH, data]);

    useEffect(() => {
        if (stage.phase !== "gold" || !shapeRef.current || !country) return;
        const el = shapeRef.current;
        const total = el.getTotalLength();
        const pts = Array.from({ length: 40 }, (_, i) => {
            const p = el.getPointAtLength((total * (i + 0.37)) / 40);
            return [p.x, p.y];
        });
        const [x0, y0, x1, y1] = country.box;
        setStage((s) => ({ ...s, sparks: sparkItems(pts, [(x0 + x1) / 2, (y0 + y1) / 2], s.id) }));
    }, [stage.phase, country]);

    useEffect(() => {
        if (!interactive || !stageW || !data) return undefined;
        const svg = wrapRef.current;
        if (!svg) return undefined;
        const world = cameraForBox([0, 0, data.WORLD_SIZE.width, data.WORLD_SIZE.height], stageW, stageH, 0.97, cbRef.current.center);
        const bounds = { width: data.WORLD_SIZE.width, height: data.WORLD_SIZE.height };
        const move = (next) => {
            flightRef.current?.land();
            applyRef.current(clampCamera(next, world, bounds));
        };
        const zoomAt = (factor, sx, sy) => {
            const cam = camRef.current;
            if (!cam) return;
            const k = Math.max(world.k * 0.9, Math.min(world.k * 90, cam.k * factor));
            const mx = cam.cx + (sx - cam.ox) / cam.k;
            const my = cam.cy + (sy - cam.oy) / cam.k;
            move({ ...cam, k, cx: mx - (sx - cam.ox) / k, cy: my - (sy - cam.oy) / k });
        };
        const minLog = Math.log(world.k * 0.9);
        const maxLog = Math.log(world.k * 90);
        const wheelZoom = { target: null, ax: 0, ay: 0, frame: 0, last: 0 };
        const wheelStep = (now) => {
            const cam = camRef.current;
            if (!cam || wheelZoom.target == null) {
                wheelZoom.frame = 0;
                return;
            }
            const dt = Math.min(0.05, (now - wheelZoom.last) / 1000);
            wheelZoom.last = now;
            const diff = wheelZoom.target - Math.log(cam.k);
            if (Math.abs(diff) < 0.0015) {
                zoomAt(Math.exp(diff), wheelZoom.ax, wheelZoom.ay);
                wheelZoom.target = null;
                wheelZoom.frame = 0;
                return;
            }
            zoomAt(Math.exp(diff * (1 - Math.exp(-dt * 11))), wheelZoom.ax, wheelZoom.ay);
            wheelZoom.frame = requestAnimationFrame(wheelStep);
        };
        const onWheel = (e) => {
            e.preventDefault();
            const cam = camRef.current;
            if (!cam) return;
            const r = svg.getBoundingClientRect();
            const delta = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
            const base = wheelZoom.target ?? Math.log(cam.k);
            wheelZoom.target = Math.max(minLog, Math.min(maxLog, base - delta * 0.0019));
            wheelZoom.ax = e.clientX - r.left;
            wheelZoom.ay = e.clientY - r.top;
            if (!wheelZoom.frame) {
                wheelZoom.last = performance.now();
                wheelZoom.frame = requestAnimationFrame(wheelStep);
            }
        };
        let drag = null;
        const onDown = (e) => {
            if (e.button !== 0 || e.target.closest?.(`.${css.dot}`)) return;
            wheelZoom.target = null;
            drag = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId, target: e.target };
        };
        const onMove = (e) => {
            if (!drag || e.pointerId !== drag.id) return;
            const dx = e.clientX - drag.x;
            const dy = e.clientY - drag.y;
            if (!drag.moved && Math.hypot(dx, dy) < 5) return;
            if (!drag.moved) {
                drag.moved = true;
                svg.setPointerCapture?.(e.pointerId);
                svg.dataset.dragging = "true";
            }
            drag.x = e.clientX;
            drag.y = e.clientY;
            const cam = camRef.current;
            if (cam) move({ ...cam, cx: cam.cx - dx / cam.k, cy: cam.cy - dy / cam.k });
        };
        const onUp = (e) => {
            if (!drag || e.pointerId !== drag.id) return;
            const wasDrag = drag.moved;
            const hit = drag.target?.closest?.("[data-code]");
            drag = null;
            delete svg.dataset.dragging;
            if (!wasDrag && hit) cbRef.current.onCountryClick?.(hit.getAttribute("data-code"));
        };
        const held = new Set();
        let frame = 0;
        let last = 0;
        const tick = (now) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const k = cbRef.current.keys ?? {};
            const cam = camRef.current;
            if (cam && held.size) {
                const vx = (held.has(k.right) ? 1 : 0) - (held.has(k.left) ? 1 : 0);
                const vy = (held.has(k.down) ? 1 : 0) - (held.has(k.up) ? 1 : 0);
                const vz = (held.has(k.zoomIn) ? 1 : 0) - (held.has(k.zoomOut) ? 1 : 0);
                if (vx || vy) move({ ...cam, cx: cam.cx + (vx * PAN_SPEED * dt) / cam.k, cy: cam.cy + (vy * PAN_SPEED * dt) / cam.k });
                if (vz) wheelZoom.target = null;
                if (vz) zoomAt(Math.exp(vz * ZOOM_SPEED * dt), camRef.current.ox, camRef.current.oy);
            }
            frame = held.size ? requestAnimationFrame(tick) : 0;
        };
        const onKeyDown = (e) => {
            if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || isTyping(document.activeElement)) return;
            const k = cbRef.current.keys ?? {};
            if (e.code && e.code === k.reset) {
                e.preventDefault();
                cbRef.current.onReset?.();
                return;
            }
            if (![k.up, k.down, k.left, k.right, k.zoomIn, k.zoomOut].includes(e.code)) return;
            e.preventDefault();
            held.add(e.code);
            if (!frame) {
                last = performance.now();
                frame = requestAnimationFrame(tick);
            }
        };
        const onKeyUp = (e) => held.delete(e.code);
        const onBlur = () => held.clear();
        svg.addEventListener("wheel", onWheel, { passive: false });
        svg.addEventListener("pointerdown", onDown);
        svg.addEventListener("pointermove", onMove);
        svg.addEventListener("pointerup", onUp);
        svg.addEventListener("pointercancel", onUp);
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("blur", onBlur);
        return () => {
            cancelAnimationFrame(frame);
            cancelAnimationFrame(wheelZoom.frame);
            svg.removeEventListener("wheel", onWheel);
            svg.removeEventListener("pointerdown", onDown);
            svg.removeEventListener("pointermove", onMove);
            svg.removeEventListener("pointerup", onUp);
            svg.removeEventListener("pointercancel", onUp);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("blur", onBlur);
        };
    }, [interactive, stageW, stageH, data]);

    const phaseIndex = PHASES.indexOf(stage.phase);
    const at = (p) => phaseIndex >= PHASES.indexOf(p);
    const flagColors = target?.flag ?? ["#d6a531"];
    const box = country?.box;
    const flagUrl = flagUrlOf(stage.code);
    const showReveal = !!country && stage.code === code;
    const dots = useMemo(() => {
        if (!data || !target?.dots?.length) return [];
        const raw = target.dots.filter((d) => d.hq).map((d) => {
            const [x, y] = projectLatLon(data.WORLD_PROJECTION, d.hq.lat, d.hq.lon);
            return { ...d, x, y };
        });
        return spreadDots(raw, stage.landK);
    }, [data, target, stage.landK]);
    const activeId = target?.activeId ?? null;

    return (
        <div ref={wrapRef} className={`${css.stage} ${interactive ? css.stage_interactive : ""} ${className}`}>
            {size && data ? (
                <svg className={css.stage_svg} width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`}>
                    <defs>
                        <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#fff4c2" />
                            <stop offset="0.35" stopColor="#f3cf62" />
                            <stop offset="0.7" stopColor="#d6a531" />
                            <stop offset="1" stopColor="#a87414" />
                        </linearGradient>
                        {country ? (
                            <>
                                <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation={9 / stage.landK} />
                                </filter>
                                <clipPath id={`clip-${uid}`}>
                                    <path d={country.d} />
                                </clipPath>
                                <mask id={`out-${uid}`} maskUnits="userSpaceOnUse" x="-10000" y="-10000" width="30000" height="30000">
                                    <rect x="-10000" y="-10000" width="30000" height="30000" fill="#fff" />
                                    <path d={country.d} fill="#000" />
                                </mask>
                            </>
                        ) : null}
                    </defs>
                    <rect className={css.ocean} width={size.width} height={size.height} />
                    <g ref={camGroupRef} transform={worldCam ? cameraTransform(camRef.current ?? worldCam) : undefined}>
                        <path className={css.land} d={layers.backdrop} />
                        {layers.clickables.map(([c, v]) => (
                            <path key={c} className={`${css.land} ${css.land_click}`} d={v.d} data-code={c} />
                        ))}
                        {country ? (
                            <g key={stage.code}>
                                <path ref={shapeRef} className={css.land} d={country.d} />
                                <g mask={`url(#out-${uid})`} className={css.fade} data-on={showReveal && at("flag")}>
                                    <path d={country.core ?? country.d} fill="none" stroke="#2e2f42" strokeOpacity={0.3} strokeWidth={BAND * 2 * flagColors.length + 2.4} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                                    {flagColors
                                        .slice()
                                        .reverse()
                                        .map((color, i, arr) => (
                                            <path key={i} d={country.core ?? country.d} fill="none" stroke={color} strokeWidth={BAND * 2 * (arr.length - i) + 1.2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                                        ))}
                                </g>
                                <path d={country.core ?? country.d} fill="#ffc42e" filter={`url(#glow-${uid})`} className={css.glow} data-on={showReveal && at("gold") && !at("name")} />
                                <path d={country.d} fill={`url(#gold-${uid})`} className={css.fade} data-on={showReveal && at("gold")} />
                                {flagUrl && box ? (
                                    <g clipPath={`url(#clip-${uid})`} className={css.fade_slow} data-on={showReveal && at("flag")}>
                                        <image href={flagUrl} {...coverBox(box)} preserveAspectRatio="none" />
                                        {(country.parts ?? []).map((part, i) => (
                                            <image key={i} href={flagUrl} {...coverBox(part)} preserveAspectRatio="none" />
                                        ))}
                                    </g>
                                ) : null}
                                <path d={country.d} fill="#fff" className={css.flash} data-on={showReveal && at("gold")} />
                                <path d={country.d} fill="none" stroke="#7a5410" strokeOpacity={0.55} strokeWidth={1} vectorEffect="non-scaling-stroke" className={css.fade} data-on={showReveal && at("gold")} />
                            </g>
                        ) : null}
                    </g>
                </svg>
            ) : null}
            <div ref={overlayRef} className={css.overlay}>
                {stage.sparks ? (
                    <div className={css.sparks} key={`s${stage.id}`}>
                        <WaapiParticles items={stage.sparks} />
                    </div>
                ) : null}
                {box && countryName ? (
                    <div className={css.anchor} style={anchor((box[0] + box[2]) / 2, stage.labelBelow ? box[3] : box[1])}>
                        <div className={css.country_label} data-below={stage.labelBelow} data-on={showReveal && at("name")}>
                            <span className={css.country_name}>
                                {countryName}
                                <span className={css.country_shine} aria-hidden="true" />
                            </span>
                            {showReveal && at("name") ? (
                                <span className={css.name_sparks} key={`n${stage.id}`}>
                                    <WaapiParticles items={nameSparkItems(stage.id)} />
                                </span>
                            ) : null}
                        </div>
                    </div>
                ) : null}
                {showReveal
                    ? dots.map((dot, i) => {
                          const active = String(dot.id) === String(activeId);
                          const Dot = onDotClick ? "button" : "span";
                          return (
                              <div key={dot.id} className={css.anchor} style={{ ...anchor(dot.x, dot.y), zIndex: active ? 4 : 3 }}>
                                  <Dot
                                      {...(onDotClick ? { type: "button", onClick: () => onDotClick(dot.id) } : {})}
                                      className={css.dot}
                                      data-on={at("hq")}
                                      data-active={active}
                                      data-left={dot.x > (box ? (box[0] + box[2]) / 2 + (box[2] - box[0]) * 0.25 : 0)}
                                      style={{ "--hq-team": dot.team?.color ?? "#d6a531", "--nx": `${dot.nx}px`, "--ny": `${dot.ny}px`, animationDelay: `${i * 90}ms` }}
                                      aria-label={dotLabel ? dotLabel(dot) : undefined}
                                  >
                                      {active ? <span className={css.hq_pulse} /> : null}
                                      {active ? <span className={css.hq_pulse} style={{ animationDelay: "0.9s" }} /> : null}
                                      <span className={css.hq_dot} />
                                      {active && dotLabel ? <span className={css.hq_label}>{dotLabel(dot)}</span> : null}
                                  </Dot>
                              </div>
                          );
                      })
                    : null}
            </div>
        </div>
    );
}
