import React, { useId } from "react";

const round1 = (v) => Math.round(v * 10) / 10;
const pathOf = (points, close = true) =>
    `M${points.map(([x, y]) => `${round1(x)} ${round1(y)}`).join(" L")}${close ? " Z" : ""}`;

const RIM_TILT = (-8 * Math.PI) / 180;

const ellipsePoint = ({ cx, cy, rx, ry }, phi) => [
    cx + rx * Math.cos(phi) * Math.cos(RIM_TILT) - ry * Math.sin(phi) * Math.sin(RIM_TILT),
    cy + rx * Math.cos(phi) * Math.sin(RIM_TILT) + ry * Math.sin(phi) * Math.cos(RIM_TILT),
];

const arcPoints = (ellipse, from, to, steps = 28) =>
    Array.from({ length: steps + 1 }, (_, i) => ellipsePoint(ellipse, from + ((to - from) * i) / steps));

const ellipsePath = (ellipse) => pathOf(arcPoints(ellipse, 0, Math.PI * 2, 40));

const crescentPath = (outer, inner) => pathOf([...arcPoints(outer, 0, Math.PI), ...arcPoints(inner, Math.PI, 0)]);

const RIM_TOP = { cx: 262, cy: 172, rx: 98, ry: 25 };
const RIM_MID = { cx: 262, cy: 183, rx: 92, ry: 23 };
const RIM_LOW = { cx: 261, cy: 193, rx: 84, ry: 21 };
const RIM_OPENING = { cx: 263, cy: 169, rx: 76, ry: 16 };

const RIM_TOP_PATH = ellipsePath(RIM_TOP);
const RIM_MID_PATH = ellipsePath(RIM_MID);
const RIM_LOW_PATH = ellipsePath(RIM_LOW);
const RIM_OPENING_PATH = ellipsePath(RIM_OPENING);
const RIM_FRONT_LIP = crescentPath(RIM_TOP, RIM_OPENING);
const RIM_BACK_LIP = pathOf([...arcPoints(RIM_TOP, Math.PI, Math.PI * 2), ...arcPoints(RIM_OPENING, Math.PI * 2, Math.PI)]);
const BELOW_RIM = pathOf([
    ...arcPoints(RIM_TOP, 0, Math.PI),
    [0, ellipsePoint(RIM_TOP, Math.PI)[1]],
    [0, 512],
    [512, 512],
    [512, ellipsePoint(RIM_TOP, 0)[1]],
]);
const RIM_INNER_WALL = pathOf([...arcPoints(RIM_OPENING, Math.PI, Math.PI * 2), ...arcPoints({ ...RIM_OPENING, cy: RIM_OPENING.cy + 4, rx: 70, ry: 9 }, Math.PI * 2, Math.PI)]);
const RIM_LIP_GLINT = pathOf([...arcPoints(RIM_TOP, Math.PI * 0.55, Math.PI * 0.95, 12), ...arcPoints({ ...RIM_TOP, rx: 90, ry: 20 }, Math.PI * 0.95, Math.PI * 0.55, 12)]);

const FUNNEL_TOP = 192;
const FUNNEL_NECK = 372;
const FUNNEL_STEPS = 30;

const funnelAt = (t) => ({
    y: FUNNEL_TOP + (FUNNEL_NECK - FUNNEL_TOP) * t,
    cx: 256 + 6 * (1 - t) ** 2 - 5 * Math.sin(Math.PI * t),
    r: 13 + 70 * (1 - t) ** 1.7,
});

const FUNNEL_SAMPLES = Array.from({ length: FUNNEL_STEPS + 1 }, (_, i) => funnelAt(i / FUNNEL_STEPS));

const SWC_FUNNEL = pathOf([
    ...FUNNEL_SAMPLES.map(({ y, cx, r }) => [cx - r, y]),
    ...FUNNEL_SAMPLES.slice().reverse().map(({ y, cx, r }) => [cx + r, y]),
]);

const RIBBON_COUNT = 8;
const RIBBON_STEP = (Math.PI * 2) / RIBBON_COUNT;
const RIBBON_TWIST = -Math.PI * 2.3;
const HALF_PI = Math.PI / 2;

const wrapAngle = (a) => {
    const v = (a + Math.PI) % (Math.PI * 2);
    return (v < 0 ? v + Math.PI * 2 : v) - Math.PI;
};

const clampFront = (a) => Math.max(-HALF_PI, Math.min(HALF_PI, a));

const helixBand = (start, width) => {
    const runs = [];
    let run = null;
    FUNNEL_SAMPLES.forEach((sample, i) => {
        const u = wrapAngle(start + RIBBON_TWIST * (i / FUNNEL_STEPS));
        const visible = u < HALF_PI && u + width > -HALF_PI;
        if (!visible) {
            if (run) runs.push(run);
            run = null;
            return;
        }
        if (!run) run = { left: [], right: [] };
        run.left.push([sample.cx + sample.r * Math.sin(clampFront(u)), sample.y]);
        run.right.push([sample.cx + sample.r * Math.sin(clampFront(u + width)), sample.y]);
    });
    if (run) runs.push(run);
    return runs.filter((r) => r.left.length > 1).map((r) => pathOf([...r.left, ...r.right.reverse()]));
};

const RIBBON_FACETS = Array.from({ length: RIBBON_COUNT }, (_, i) => {
    const start = i * RIBBON_STEP;
    return [
        ...helixBand(start + RIBBON_STEP * 0.8, RIBBON_STEP * 0.2).map((d) => [d, "#000", 0.42]),
        ...helixBand(start, RIBBON_STEP * 0.8).map((d) => [d, i % 2 ? "#000" : "#fff", i % 2 ? 0.06 : 0.1]),
        ...helixBand(start, RIBBON_STEP * 0.1).map((d) => [d, "#fff", 0.34]),
    ];
}).flat();

const FUNNEL_GLINT = pathOf([
    ...FUNNEL_SAMPLES.map(({ y, cx, r }) => [cx - r * 0.56, y]),
    ...FUNNEL_SAMPLES.slice().reverse().map(({ y, cx, r }) => [cx - r * 0.4, y]),
]);

const SWC_COLLAR = ["M228 368 H284 L290 378 H222 Z", "M216 378 H296 L304 390 H208 Z"];
const SWC_TRIM = "M186 464 H326 L329 476 H183 Z";

const SWC_BODY = [RIM_TOP_PATH, RIM_MID_PATH, RIM_LOW_PATH, SWC_FUNNEL, ...SWC_COLLAR, SWC_TRIM];

const COLLAR_FACETS = [
    ["M228 368 H256 V378 H222 Z", "#fff", 0.3],
    ["M256 368 H284 L290 378 H256 Z", "#000", 0.22],
    ["M216 378 H296 L298 381 H214 Z", "#fff", 0.4],
    ["M214 381 H256 V390 H208 Z", "#fff", 0.16],
    ["M256 381 H298 L304 390 H256 Z", "#000", 0.28],
    ["M186 464 H326 L327 468 H185 Z", "#fff", 0.4],
    ["M256 468 H327 L329 476 H256 Z", "#000", 0.25],
];

const BOLT_TRANSFORM = "rotate(16 262 140)";
const SWC_BOLT = "M250 18 L306 18 L280 86 L312 86 L210 268 L248 126 L214 126 Z";
const SWC_BOLT_DEPTH = "M259 25 L315 25 L289 93 L321 93 L219 275 L257 133 L223 133 Z";

const BOLT_FACETS = [
    ["M250 18 L306 18 L280 86 L248 126 L214 126 Z", "#fff", 0.2],
    ["M250 18 L263 18 L227 126 L214 126 Z", "#fff", 0.34],
    ["M250 18 L306 18 L303 26 L247 26 Z", "#fff", 0.45],
    ["M272 30 L282 30 L250 112 L242 112 Z", "#fff", 0.38],
    ["M280 86 L312 86 L308 92 L276 92 Z", "#fff", 0.3],
    ["M285 92 L308 92 L210 268 Z", "#000", 0.32],
    ["M248 126 L276 92 L285 92 L210 268 Z", "#000", 0.1],
];

const BOLT_GLOW = { cx: 268, cy: 112, r: 92 };

const SWC_BASE = "M202 390 H310 L326 464 H186 Z";

const BASE_FACETS = [
    ["M202 390 H310 L312 400 H200 Z", "#fff", 0.26],
    ["M200 400 H216 L208 464 H186 Z", "#fff", 0.12],
    ["M296 400 H312 L326 464 H304 Z", "#000", 0.36],
];

const SWC_PLAQUE = "M222 406 H290 L288 442 L256 461 L224 442 Z";

const PLAQUE_FACETS = [
    ["M222 406 H256 V461 L224 442 Z", "#fff", 0.32],
    ["M256 406 H290 L288 442 L256 461 Z", "#000", 0.18],
    ["M222 406 H290 L289.7 410 H222.3 Z", "#fff", 0.5],
];

const PLAQUE_ENGRAVING = "M264 414 L248 433 H263 L249 452";

const ENGRAVING_STROKE = 4;

const FACET_STRENGTH = 1;

const ENGRAVE = {
    recessOpacity: 0.3,
    shadowOpacity: 0.45,
    highlightOpacity: 0.35,
    edgeOffset: { x: 0.6, y: 1.4 },
};

const BODY_BOX = { x: 160, y: 120, w: 192, h: 272 };
const BOLT_BOX = { x: 196, y: 10, w: 136, h: 272 };
const BASE_BOX = { x: 186, y: 390, w: 140, h: 74 };
const PLAQUE_BOX = { x: 222, y: 406, w: 68, h: 55 };

const BOUNDS = { x: 156, y: 12, w: 204, h: 466 };
const ASPECT_RATIO = BOUNDS.w / BOUNDS.h;
const toRect = (box) => ({ x: box.x, y: box.y, width: box.w, height: box.h });

const widthFor = (size) =>
    typeof size === "number" ? size * ASPECT_RATIO : `calc(${size} * ${ASPECT_RATIO.toFixed(4)})`;

const splitTopLevel = (value) => {
    const parts = [];
    let depth = 0;
    let current = "";
    for (const ch of value) {
        if (ch === "(") depth += 1;
        if (ch === ")") depth -= 1;
        if (ch === "," && depth === 0) {
            parts.push(current.trim());
            current = "";
        } else {
            current += ch;
        }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
};

const SIDE_ANGLES = { "to top": 0, "to right": 90, "to bottom": 180, "to left": 270 };

const parseCssGradient = (value) => {
    const inner = value.trim().replace(/^linear-gradient\(/i, "").replace(/\)\s*$/, "");
    const parts = splitTopLevel(inner);
    let angle = 180;

    const first = parts[0]?.toLowerCase();
    if (/^-?[\d.]+deg$/.test(first)) {
        angle = parseFloat(first);
        parts.shift();
    } else if (first in SIDE_ANGLES) {
        angle = SIDE_ANGLES[first];
        parts.shift();
    }

    const stops = parts.map((part) => {
        const match = part.match(/^(.*?)(?:\s+(-?[\d.]+)%)?$/);
        return { color: match[1].trim(), offset: match[2] != null ? parseFloat(match[2]) / 100 : null };
    });

    return { angle, stops: fillMissingOffsets(stops) };
};

const fillMissingOffsets = (stops) => {
    if (stops.length === 0) return stops;
    const out = stops.map((s) => ({ ...s }));
    if (out[0].offset == null) out[0].offset = 0;
    if (out[out.length - 1].offset == null) out[out.length - 1].offset = 1;

    let i = 0;
    while (i < out.length) {
        if (out[i].offset != null) {
            i += 1;
            continue;
        }
        const startIndex = i - 1;
        let endIndex = i;
        while (out[endIndex].offset == null) endIndex += 1;
        const from = out[startIndex].offset;
        const to = out[endIndex].offset;
        const span = endIndex - startIndex;
        for (let k = i; k < endIndex; k += 1) {
            out[k].offset = from + ((to - from) * (k - startIndex)) / span;
        }
        i = endIndex;
    }
    return out;
};

const resolvePaint = (color, gradientAngle) => {
    if (Array.isArray(color)) {
        const stops = color.map((c, i) => ({
            color: c,
            offset: color.length > 1 ? i / (color.length - 1) : 0,
        }));
        return { angle: gradientAngle, stops };
    }

    if (color && typeof color === "object") {
        const { top, middle, bottom } = color;
        const stops = [
            top != null && { color: top, offset: 0 },
            middle != null && { color: middle, offset: 0.45 },
            bottom != null && { color: bottom, offset: 1 },
        ].filter(Boolean);
        return stops.length ? { angle: gradientAngle, stops } : null;
    }

    if (typeof color === "string" && /^\s*linear-gradient\(/i.test(color)) {
        const parsed = parseCssGradient(color);
        return parsed.stops.length ? parsed : null;
    }

    return null;
};

const gradientLine = (angle, box) => {
    const rad = (angle * Math.PI) / 180;
    const dx = Math.sin(rad);
    const dy = -Math.cos(rad);
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const half = (Math.abs(box.w * dx) + Math.abs(box.h * dy)) / 2;
    return { x1: cx - dx * half, y1: cy - dy * half, x2: cx + dx * half, y2: cy + dy * half };
};

const GradientDef = ({ id, gradient, box }) =>
    gradient ? (
        <linearGradient id={id} gradientUnits="userSpaceOnUse" {...gradientLine(gradient.angle, box)}>
            {gradient.stops.map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} />
            ))}
        </linearGradient>
    ) : null;


const Facets = ({ facets }) => (
    <g pointerEvents="none" strokeLinejoin="round">
        {facets.map(([d, tint, opacity], i) => (
            <path
                key={i}
                d={d}
                fill={tint}
                fillOpacity={opacity * FACET_STRENGTH}
                stroke={tint}
                strokeOpacity={opacity * FACET_STRENGTH}
                strokeWidth={0.5}
            />
        ))}
    </g>
);

const Engraving = ({ color, dx = 0, dy = 0 }) => (
    <path
        d={PLAQUE_ENGRAVING}
        transform={`translate(${dx} ${dy})`}
        fill="none"
        stroke={color}
        strokeWidth={ENGRAVING_STROKE}
        strokeLinecap="butt"
        strokeLinejoin="miter"
    />
);

const paintOf = (color, angle, id) => {
    const gradient = resolvePaint(color, angle);
    return { gradient, fill: gradient ? `url(#${id})` : color };
};

const RimLayer = ({ d, fill, tint, opacity }) => (
    <>
        <path d={d} fill={fill} />
        <path d={d} fill={tint} fillOpacity={opacity} pointerEvents="none" />
    </>
);

const SwcTrophyIcon = ({
    size = "1em",
    color = "currentColor",
    accentColor,
    baseColor,
    plaqueColor,
    glowColor,
    gradientAngle = 180,
    accentGradientAngle = 180,
    title,
    style,
    ...props
}) => {
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const ids = {
        body: `swc-trophy-body-${uid}`,
        bodyGradient: `swc-trophy-body-gradient-${uid}`,
        funnel: `swc-trophy-funnel-${uid}`,
        shade: `swc-trophy-shade-${uid}`,
        bolt: `swc-trophy-bolt-${uid}`,
        boltGradient: `swc-trophy-bolt-gradient-${uid}`,
        glow: `swc-trophy-glow-${uid}`,
        base: `swc-trophy-base-${uid}`,
        baseGradient: `swc-trophy-base-gradient-${uid}`,
        plaque: `swc-trophy-plaque-${uid}`,
        plaqueGradient: `swc-trophy-plaque-gradient-${uid}`,
        engraving: `swc-trophy-engraving-${uid}`,
        shadow: `swc-trophy-shadow-${uid}`,
        highlight: `swc-trophy-highlight-${uid}`,
    };

    const body = paintOf(color, gradientAngle, ids.bodyGradient);
    const bolt = paintOf(accentColor ?? color, accentGradientAngle, ids.boltGradient);
    const base = paintOf(baseColor ?? color, gradientAngle, ids.baseGradient);
    const plaque = paintOf(plaqueColor ?? accentColor ?? color, gradientAngle, ids.plaqueGradient);

    const maskProps = { maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 512, height: 512 };
    const { x: ox, y: oy } = ENGRAVE.edgeOffset;

    return (
        <svg
            viewBox={`${BOUNDS.x} ${BOUNDS.y} ${BOUNDS.w} ${BOUNDS.h}`}
            role={title ? "img" : undefined}
            aria-hidden={title ? undefined : true}
            style={{
                display: "inline-block",
                verticalAlign: "middle",
                width: widthFor(size),
                height: size,
                flexShrink: 0,
                ...style,
            }}
            {...props}
        >
            {title && <title>{title}</title>}
            <defs>
                <mask id={ids.base} {...maskProps}>
                    <path d={SWC_BASE} fill="#fff" />
                </mask>
                <mask id={ids.plaque} {...maskProps}>
                    <path d={SWC_PLAQUE} fill="#fff" />
                </mask>
                <mask id={ids.body} {...maskProps}>
                    {SWC_BODY.map((d) => (
                        <path key={d} d={d} fill="#fff" />
                    ))}
                </mask>
                <mask id={ids.funnel} {...maskProps}>
                    <path d={SWC_FUNNEL} fill="#fff" />
                    <path d={RIM_LOW_PATH} fill="#000" />
                </mask>
                <mask id={ids.bolt} {...maskProps}>
                    <path d={SWC_BOLT} transform={BOLT_TRANSFORM} fill="#fff" />
                    <path d={SWC_BOLT_DEPTH} transform={BOLT_TRANSFORM} fill="#fff" />
                    <path d={BELOW_RIM} fill="#000" />
                    <path d={RIM_FRONT_LIP} fill="#000" />
                </mask>
                <mask id={ids.engraving} {...maskProps}>
                    <Engraving color="#fff" />
                </mask>
                <mask id={ids.shadow} {...maskProps}>
                    <Engraving color="#fff" />
                    <Engraving color="#000" dx={ox} dy={oy} />
                </mask>
                <mask id={ids.highlight} {...maskProps}>
                    <Engraving color="#fff" />
                    <Engraving color="#000" dx={-ox} dy={-oy} />
                </mask>
                <linearGradient id={ids.shade} gradientUnits="userSpaceOnUse" x1={172} y1={0} x2={344} y2={0}>
                    <stop offset={0} stopColor="#fff" stopOpacity={0.3} />
                    <stop offset={0.42} stopColor="#fff" stopOpacity={0} />
                    <stop offset={0.58} stopColor="#000" stopOpacity={0} />
                    <stop offset={1} stopColor="#000" stopOpacity={0.42} />
                </linearGradient>
                {glowColor && (
                    <radialGradient id={ids.glow} gradientUnits="userSpaceOnUse" cx={BOLT_GLOW.cx} cy={BOLT_GLOW.cy} r={BOLT_GLOW.r}>
                        <stop offset={0} stopColor={glowColor} stopOpacity={0.55} />
                        <stop offset={0.55} stopColor={glowColor} stopOpacity={0.18} />
                        <stop offset={1} stopColor={glowColor} stopOpacity={0} />
                    </radialGradient>
                )}
                <GradientDef id={ids.bodyGradient} gradient={body.gradient} box={BODY_BOX} />
                <GradientDef id={ids.boltGradient} gradient={bolt.gradient} box={BOLT_BOX} />
                <GradientDef id={ids.baseGradient} gradient={base.gradient} box={BASE_BOX} />
                <GradientDef id={ids.plaqueGradient} gradient={plaque.gradient} box={PLAQUE_BOX} />
            </defs>

            {glowColor && <circle cx={BOLT_GLOW.cx} cy={BOLT_GLOW.cy} r={BOLT_GLOW.r} fill={`url(#${ids.glow})`} pointerEvents="none" />}

            <g mask={`url(#${ids.base})`}>
                <rect {...toRect(BASE_BOX)} fill={base.fill} />
                <Facets facets={BASE_FACETS} />
            </g>

            <g mask={`url(#${ids.plaque})`}>
                <rect {...toRect(PLAQUE_BOX)} fill={plaque.fill} />
                <Facets facets={PLAQUE_FACETS} />
                <g pointerEvents="none">
                    <rect {...toRect(PLAQUE_BOX)} fill="#000" fillOpacity={ENGRAVE.recessOpacity} mask={`url(#${ids.engraving})`} />
                    <rect {...toRect(PLAQUE_BOX)} fill="#000" fillOpacity={ENGRAVE.shadowOpacity} mask={`url(#${ids.shadow})`} />
                    <rect {...toRect(PLAQUE_BOX)} fill="#fff" fillOpacity={ENGRAVE.highlightOpacity} mask={`url(#${ids.highlight})`} />
                </g>
            </g>

            <g mask={`url(#${ids.body})`}>
                <rect {...toRect(BODY_BOX)} fill={body.fill} />
                <rect x={BODY_BOX.x} y={360} width={BODY_BOX.w} height={120} fill={body.fill} />
                <g mask={`url(#${ids.funnel})`}>
                    <Facets facets={RIBBON_FACETS} />
                    <rect {...toRect(BODY_BOX)} fill={`url(#${ids.shade})`} pointerEvents="none" />
                    <path d={FUNNEL_GLINT} fill="#fff" fillOpacity={0.28} pointerEvents="none" />
                </g>
                <Facets facets={COLLAR_FACETS} />
                <RimLayer d={RIM_LOW_PATH} fill={body.fill} tint="#000" opacity={0.3} />
                <RimLayer d={RIM_MID_PATH} fill={body.fill} tint="#000" opacity={0.14} />
                <RimLayer d={RIM_TOP_PATH} fill={body.fill} tint="#fff" opacity={0.06} />
                <Facets
                    facets={[
                        [RIM_BACK_LIP, "#fff", 0.26],
                        [RIM_OPENING_PATH, "#000", 0.58],
                        [RIM_INNER_WALL, "#fff", 0.16],
                        [RIM_LIP_GLINT, "#fff", 0.45],
                    ]}
                />
            </g>

            <g mask={`url(#${ids.bolt})`}>
                <g transform={BOLT_TRANSFORM}>
                    <rect {...toRect(BOLT_BOX)} fill={bolt.fill} />
                    <path d={SWC_BOLT_DEPTH} fill="#000" fillOpacity={0.5} />
                    <path d={SWC_BOLT} fill={bolt.fill} />
                    <Facets facets={BOLT_FACETS} />
                </g>
                <path d={RIM_OPENING_PATH} fill="#000" fillOpacity={0.34} pointerEvents="none" />
                <path d={RIM_INNER_WALL} fill="#000" fillOpacity={0.12} pointerEvents="none" />
            </g>
        </svg>
    );
};

export default SwcTrophyIcon;
