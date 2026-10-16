import React, { useId } from "react";

const GEM_SHAPE = "M222.4 149.2 L289.6 149.2 L323.2 182.8 L256 266 L188.8 182.8 Z";

const GEM_FACETS = [
    ["M222.4 149.2 L188.8 182.8 L222.4 182.8 Z", "#fff", 0.3],
    ["M222.4 149.2 L222.4 182.8 L256 149.2 Z", "#fff", 0.42],
    ["M256 149.2 L222.4 182.8 L256 182.8 Z", "#fff", 0.18],
    ["M256 149.2 L256 182.8 L289.6 182.8 Z", "#000", 0.06],
    ["M256 149.2 L289.6 182.8 L289.6 149.2 Z", "#fff", 0.1],
    ["M289.6 149.2 L289.6 182.8 L323.2 182.8 Z", "#000", 0.2],
    ["M188.8 182.8 L205.6 182.8 L256 266 Z", "#fff", 0.16],
    ["M205.6 182.8 L222.4 182.8 L256 266 Z", "#fff", 0.06],
    ["M222.4 182.8 L239.2 182.8 L256 266 Z", "#000", 0.06],
    ["M239.2 182.8 L256 182.8 L256 266 Z", "#fff", 0.12],
    ["M256 182.8 L272.8 182.8 L256 266 Z", "#000", 0.14],
    ["M272.8 182.8 L289.6 182.8 L256 266 Z", "#000", 0.24],
    ["M289.6 182.8 L306.4 182.8 L256 266 Z", "#000", 0.3],
    ["M306.4 182.8 L323.2 182.8 L256 266 Z", "#000", 0.4],
];

const GEM_BOX = { x: 188, y: 148, w: 136, h: 120 };

const PBS_BODY = [
    "M222 258 H290 L276 278 H236 Z",
    "M238 274 H274 L282 320 H230 Z",
    "M226 314 H286 L294 336 H218 Z",
    "M214 334 H298 L318 354 L326 420 H186 L194 354 Z",
].join(" ");

const BODY_FACETS = [
    ["M222 258 H290 L286 264 H226 Z", "#fff", 0.22],
    ["M226 264 H256 V278 H236 Z", "#fff", 0.1],
    ["M256 264 H286 L276 278 H256 Z", "#000", 0.2],
    ["M238 274 H256 V320 H230 Z", "#fff", 0.14],
    ["M256 274 H274 L282 320 H256 Z", "#000", 0.2],
    ["M226 314 H256 V336 H218 Z", "#fff", 0.12],
    ["M256 314 H286 L294 336 H256 Z", "#000", 0.18],
    ["M214 334 H298 L280 354 H232 Z", "#fff", 0.24],
    ["M214 334 L232 354 L222 420 H186 L194 354 Z", "#fff", 0.12],
    ["M232 354 H280 L290 420 H222 Z", "#000", 0.04],
    ["M298 334 L318 354 L326 420 H290 L280 354 Z", "#000", 0.26],
];

const BASE_ENGRAVING = [
    "M244 387 A12 12 0 1 0 268 387 A12 12 0 1 0 244 387",
    "M256 367 V378",
    "M256 396 V407",
    "M234 387 H247",
    "M265 387 H278",
].join(" ");

const ENGRAVING_STROKE = 4;

const FACET_STRENGTH = 1;

const GEM_GAP = 0;

const ENGRAVE = {
    recessOpacity: 0.3,
    shadowOpacity: 0.45,
    highlightOpacity: 0.35,
    edgeOffset: { x: 0.7, y: 1.6 },
};

const BOUNDS = { x: 184, y: 147, w: 144, h: 273 };
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
        d={BASE_ENGRAVING}
        transform={`translate(${dx} ${dy})`}
        fill="none"
        stroke={color}
        strokeWidth={ENGRAVING_STROKE}
        strokeLinecap="butt"
    />
);

const PbsTrophyIcon = ({
    size = "1em",
    color = "currentColor",
    gemColor,
    gradientAngle = 180,
    gemGradientAngle = 180,
    title,
    style,
    ...props
}) => {
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const ids = {
        body: `pbs-trophy-body-${uid}`,
        bodyGradient: `pbs-trophy-body-gradient-${uid}`,
        gem: `pbs-trophy-gem-${uid}`,
        gemGradient: `pbs-trophy-gem-gradient-${uid}`,
        engraving: `pbs-trophy-engraving-${uid}`,
        shadow: `pbs-trophy-shadow-${uid}`,
        highlight: `pbs-trophy-highlight-${uid}`,
    };

    const bodyGradient = resolvePaint(color, gradientAngle);
    const bodyFill = bodyGradient ? `url(#${ids.bodyGradient})` : color;

    const gemPaint = gemColor ?? color;
    const gemGradient = resolvePaint(gemPaint, gemGradientAngle);
    const gemFill = gemGradient ? `url(#${ids.gemGradient})` : gemPaint;

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
                <mask id={ids.body} {...maskProps}>
                    <path d={PBS_BODY} fill="#fff" />
                </mask>
                <mask id={ids.gem} {...maskProps}>
                    <path d={GEM_SHAPE} fill="#fff" />
                    <path d={PBS_BODY} fill="#000" stroke="#000" strokeWidth={GEM_GAP * 2} strokeLinejoin="round" />
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
                <GradientDef id={ids.bodyGradient} gradient={bodyGradient} box={BOUNDS} />
                <GradientDef id={ids.gemGradient} gradient={gemGradient} box={GEM_BOX} />
            </defs>

            <g mask={`url(#${ids.gem})`}>
                <rect {...toRect(GEM_BOX)} fill={gemFill} />
                <Facets facets={GEM_FACETS} />
            </g>

            <g mask={`url(#${ids.body})`}>
                <rect {...toRect(BOUNDS)} fill={bodyFill} />
                <Facets facets={BODY_FACETS} />
                <g pointerEvents="none">
                    <rect {...toRect(BOUNDS)} fill="#000" fillOpacity={ENGRAVE.recessOpacity} mask={`url(#${ids.engraving})`} />
                    <rect {...toRect(BOUNDS)} fill="#000" fillOpacity={ENGRAVE.shadowOpacity} mask={`url(#${ids.shadow})`} />
                    <rect {...toRect(BOUNDS)} fill="#fff" fillOpacity={ENGRAVE.highlightOpacity} mask={`url(#${ids.highlight})`} />
                </g>
            </g>
        </svg>
    );
};

export default PbsTrophyIcon;