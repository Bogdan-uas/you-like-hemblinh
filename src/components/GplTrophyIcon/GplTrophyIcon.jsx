import React, { useId } from "react";

const GPL_BODY =
    "M327.4 205.0 L328.0 226.3 L324.5 247.5 L317.9 269.0 L313.9 295.2 L300.9 315.2 L292.1 338.7 L284.1 354.5 L284.8 378.7 L293.9 396.0 L304.7 418.3 L311.5 439.2 L320.5 462.6 L320.4 480 L191.7 480 L188.6 464.1 L196.6 444.1 L212.8 421.8 L220.6 399.6 L228.6 376.5 L226.5 354.5 L222.8 335.4 L209.8 316.3 L204.0 296.6 L188.8 274.6 L183.3 244.3 L182.0 222.6 L184.7 210.0 Z";

const GPL_FACETS = [
    ["M184.7 210.0 L250.9 206.0 L182.0 222.6 Z", "#fff", 0.14],
    ["M250.9 206.0 L249.4 224.4 L182.0 222.6 Z", "#fff", 0.19],
    ["M327.4 205.0 L250.9 206.0 L328.0 226.3 Z", "#000", 0.24],
    ["M250.9 206.0 L249.4 224.4 L328.0 226.3 Z", "#000", 0.25],
    ["M182.0 222.6 L249.4 224.4 L183.3 244.3 Z", "#000", 0.16],
    ["M249.4 224.4 L235.4 245.9 L183.3 244.3 Z", "#fff", 0.11],
    ["M328.0 226.3 L249.4 224.4 L324.5 247.5 Z", "#000", 0.19],
    ["M249.4 224.4 L235.4 245.9 L324.5 247.5 Z", "#000", 0.11],
    ["M183.3 244.3 L235.4 245.9 L243.8 271.8 Z", "#000", 0.07],
    ["M183.3 244.3 L243.8 271.8 L188.8 274.6 Z", "#fff", 0.11],
    ["M324.5 247.5 L235.4 245.9 L317.9 269.0 Z", "#000", 0.19],
    ["M235.4 245.9 L243.8 271.8 L317.9 269.0 Z", "#000", 0.29],
    ["M188.8 274.6 L243.8 271.8 L204.0 296.6 Z", "#000", 0.09],
    ["M243.8 271.8 L273.8 295.9 L204.0 296.6 Z", "#fff", 0.1],
    ["M317.9 269.0 L243.8 271.8 L313.9 295.2 Z", "#fff", 0.04],
    ["M243.8 271.8 L273.8 295.9 L313.9 295.2 Z", "#000", 0.14],
    ["M204.0 296.6 L273.8 295.9 L245.1 315.7 Z", "#fff", 0.15],
    ["M204.0 296.6 L245.1 315.7 L209.8 316.3 Z", "#fff", 0.04],
    ["M313.9 295.2 L273.8 295.9 L245.1 315.7 Z", "#000", 0.22],
    ["M313.9 295.2 L245.1 315.7 L300.9 315.2 Z", "#fff", 0.09],
    ["M209.8 316.3 L245.1 315.7 L222.8 335.4 Z", "#fff", 0.16],
    ["M245.1 315.7 L259.0 337.0 L222.8 335.4 Z", "#fff", 0.2],
    ["M300.9 315.2 L245.1 315.7 L292.1 338.7 Z", "#fff", 0.1],
    ["M245.1 315.7 L259.0 337.0 L292.1 338.7 Z", "#000", 0.18],
    ["M222.8 335.4 L259.0 337.0 L250.5 354.5 Z", "#fff", 0.05],
    ["M222.8 335.4 L250.5 354.5 L226.5 354.5 Z", "#fff", 0.08],
    ["M292.1 338.7 L259.0 337.0 L250.5 354.5 Z", "#000", 0.09],
    ["M292.1 338.7 L250.5 354.5 L284.1 354.5 Z", "#000", 0.12],
    ["M226.5 354.5 L250.5 354.5 L254.9 377.6 Z", "#fff", 0.04],
    ["M226.5 354.5 L254.9 377.6 L228.6 376.5 Z", "#000", 0.13],
    ["M284.1 354.5 L250.5 354.5 L254.9 377.6 Z", "#000", 0.16],
    ["M284.1 354.5 L254.9 377.6 L284.8 378.7 Z", "#000", 0.11],
    ["M228.6 376.5 L254.9 377.6 L220.6 399.6 Z", "#000", 0.11],
    ["M254.9 377.6 L257.7 397.8 L220.6 399.6 Z", "#fff", 0.06],
    ["M284.8 378.7 L254.9 377.6 L257.7 397.8 Z", "#000", 0.14],
    ["M284.8 378.7 L257.7 397.8 L293.9 396.0 Z", "#fff", 0.04],
    ["M220.6 399.6 L257.7 397.8 L270.7 420.1 Z", "#000", 0.12],
    ["M220.6 399.6 L270.7 420.1 L212.8 421.8 Z", "#fff", 0.14],
    ["M293.9 396.0 L257.7 397.8 L270.7 420.1 Z", "#000", 0.31],
    ["M293.9 396.0 L270.7 420.1 L304.7 418.3 Z", "#fff", 0.09],
    ["M212.8 421.8 L270.7 420.1 L255.6 441.6 Z", "#fff", 0.07],
    ["M212.8 421.8 L255.6 441.6 L196.6 444.1 Z", "#000", 0.12],
    ["M304.7 418.3 L270.7 420.1 L311.5 439.2 Z", "#000", 0.13],
    ["M270.7 420.1 L255.6 441.6 L311.5 439.2 Z", "#fff", 0.12],
    ["M196.6 444.1 L255.6 441.6 L188.6 464.1 Z", "#000", 0.16],
    ["M255.6 441.6 L272.5 463.4 L188.6 464.1 Z", "#fff", 0.08],
    ["M311.5 439.2 L255.6 441.6 L320.5 462.6 Z", "#000", 0.09],
    ["M255.6 441.6 L272.5 463.4 L320.5 462.6 Z", "#000", 0.15],
    ["M188.6 464.1 L272.5 463.4 L251.2 480 Z", "#fff", 0.21],
    ["M188.6 464.1 L251.2 480 L191.7 480 Z", "#fff", 0.21],
    ["M320.5 462.6 L272.5 463.4 L320.4 480 Z", "#fff", 0.06],
    ["M272.5 463.4 L251.2 480 L320.4 480 Z", "#000", 0.13],
];

const FACET_STRENGTH = 1;

const GLOBE = { cx: 256, cy: 210, r: 56 };
const GLOBE_BOX = { x: GLOBE.cx - GLOBE.r - 4, y: GLOBE.cy - GLOBE.r - 4, w: GLOBE.r * 2 + 8, h: GLOBE.r * 2 + 8 };

const GLOBE_OUTLINE =
    "M255.7 154.1 L277.5 159.1 L292.1 167.1 L303.0 180.4 L312.5 200.9 L309.9 216.8 L307.0 236.2 L289.0 251.2 L272.7 265.8 L255.0 266.2 L240.1 260.1 L221.9 250.4 L210.3 238.7 L202.2 222.7 L199.2 200.4 L207.3 181.7 L219.7 166.7 L237.2 159.2 Z";

const GLOBE_FACETS = [
    ["M255.7 154.1 L277.5 159.1 L271.7 179.1 Z", "#fff", 0.1],
    ["M255.7 154.1 L271.7 179.1 L248.6 181.3 Z", "#fff", 0.16],
    ["M277.5 159.1 L292.1 167.1 L271.7 179.1 Z", "#fff", 0.14],
    ["M292.1 167.1 L303.0 180.4 L284.9 196.3 Z", "#000", 0.16],
    ["M292.1 167.1 L284.9 196.3 L271.7 179.1 Z", "#000", 0.16],
    ["M303.0 180.4 L312.5 200.9 L284.9 196.3 Z", "#000", 0.19],
    ["M312.5 200.9 L309.9 216.8 L283.2 213.6 Z", "#000", 0.16],
    ["M312.5 200.9 L283.2 213.6 L284.9 196.3 Z", "#000", 0.15],
    ["M309.9 216.8 L307.0 236.2 L283.2 213.6 Z", "#000", 0.28],
    ["M307.0 236.2 L289.0 251.2 L273.6 228.9 Z", "#000", 0.28],
    ["M307.0 236.2 L273.6 228.9 L283.2 213.6 Z", "#000", 0.26],
    ["M289.0 251.2 L272.7 265.8 L254.1 239.0 Z", "#000", 0.29],
    ["M289.0 251.2 L254.1 239.0 L273.6 228.9 Z", "#000", 0.18],
    ["M272.7 265.8 L255.0 266.2 L254.1 239.0 Z", "#000", 0.26],
    ["M255.0 266.2 L240.1 260.1 L254.1 239.0 Z", "#000", 0.19],
    ["M240.1 260.1 L221.9 250.4 L235.7 230.5 Z", "#000", 0.15],
    ["M240.1 260.1 L235.7 230.5 L254.1 239.0 Z", "#000", 0.2],
    ["M221.9 250.4 L210.3 238.7 L235.7 230.5 Z", "#fff", 0.11],
    ["M210.3 238.7 L202.2 222.7 L222.8 212.1 Z", "#fff", 0.1],
    ["M210.3 238.7 L222.8 212.1 L235.7 230.5 Z", "#fff", 0.12],
    ["M202.2 222.7 L199.2 200.4 L222.8 212.1 Z", "#fff", 0.12],
    ["M199.2 200.4 L207.3 181.7 L231.0 199.3 Z", "#fff", 0.18],
    ["M199.2 200.4 L231.0 199.3 L222.8 212.1 Z", "#fff", 0.13],
    ["M207.3 181.7 L219.7 166.7 L248.6 181.3 Z", "#fff", 0.17],
    ["M207.3 181.7 L248.6 181.3 L231.0 199.3 Z", "#fff", 0.21],
    ["M219.7 166.7 L237.2 159.2 L248.6 181.3 Z", "#fff", 0.22],
    ["M237.2 159.2 L255.7 154.1 L248.6 181.3 Z", "#fff", 0.16],
    ["M271.7 179.1 L284.9 196.3 L261.8 199.0 Z", "#fff", 0.12],
    ["M284.9 196.3 L283.2 213.6 L261.8 199.0 Z", "#000", 0.18],
    ["M283.2 213.6 L273.6 228.9 L261.8 199.0 Z", "#000", 0.17],
    ["M273.6 228.9 L254.1 239.0 L261.8 199.0 Z", "#000", 0.12],
    ["M254.1 239.0 L235.7 230.5 L261.8 199.0 Z", "#fff", 0.08],
    ["M235.7 230.5 L222.8 212.1 L261.8 199.0 Z", "#000", 0.14],
    ["M222.8 212.1 L231.0 199.3 L261.8 199.0 Z", "#fff", 0.17],
    ["M231.0 199.3 L248.6 181.3 L261.8 199.0 Z", "#fff", 0.1],
    ["M248.6 181.3 L271.7 179.1 L261.8 199.0 Z", "#fff", 0.09],
];

const GLOBE_GAP = 7;

const GLOBE_LINES = [
    "M200 210.8 L230 209.5 L256 209.4 L282 208.7 L312 208.8",
    "M207.5 182.2 L239.8 181.0 L272.2 182.4 L304.5 181.6",
    "M255.8 154 L257.8 182 L255.9 210 L256.3 238 L257.5 266",
    "M256.0 154.0 L240.7 160.1 L233.4 183.3 L227.0 208.8 L232.7 239.8 L240.8 260.3 L256.0 266.0",
    "M256.0 154.0 L271.5 161.9 L279.9 180.4 L282.2 211.9 L279.2 238.8 L269.0 259.8 L256.0 266.0",
].join(" ");

const LINE_STROKE = 5.5;

const ENGRAVE = {
    recessOpacity: 0.28,
    shadowOpacity: 0.45,
    highlightOpacity: 0.4,
    edgeOffset: { x: 0.9, y: 2.2 },
};

const BOUNDS = { x: 180, y: 153, w: 152, h: 327 };
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

const GlobeLines = ({ stroke, dx = 0, dy = 0 }) => (
    <path
        d={GLOBE_LINES}
        transform={`translate(${dx} ${dy})`}
        fill="none"
        stroke={stroke}
        strokeWidth={LINE_STROKE}
        strokeLinecap="butt"
        strokeLinejoin="round"
    />
);

const GplTrophyIcon = ({
    size = "1em",
    color = "currentColor",
    globeColor,
    gradientAngle = 180,
    globeGradientAngle = 180,
    title,
    style,
    ...props
}) => {
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const ids = {
        body: `gpl-trophy-body-${uid}`,
        bodyGradient: `gpl-trophy-body-gradient-${uid}`,
        globe: `gpl-trophy-globe-${uid}`,
        globeGradient: `gpl-trophy-globe-gradient-${uid}`,
        lines: `gpl-trophy-lines-${uid}`,
        shadow: `gpl-trophy-shadow-${uid}`,
        highlight: `gpl-trophy-highlight-${uid}`,
    };

    const bodyGradient = resolvePaint(color, gradientAngle);
    const bodyFill = bodyGradient ? `url(#${ids.bodyGradient})` : color;

    const globePaint = globeColor ?? color;
    const globeGradient = resolvePaint(globePaint, globeGradientAngle);
    const globeFill = globeGradient ? `url(#${ids.globeGradient})` : globePaint;

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
                    <path d={GPL_BODY} fill="#fff" />
                </mask>
                <mask id={ids.globe} {...maskProps}>
                    <path d={GLOBE_OUTLINE} fill="#fff" />
                    <path
                        d={GPL_BODY}
                        fill="#000"
                        stroke="#000"
                        strokeWidth={GLOBE_GAP * 2}
                        strokeLinejoin="round"
                    />
                </mask>
                <mask id={ids.lines} {...maskProps}>
                    <GlobeLines stroke="#fff" />
                </mask>
                <mask id={ids.shadow} {...maskProps}>
                    <GlobeLines stroke="#fff" />
                    <GlobeLines stroke="#000" dx={ox} dy={oy} />
                </mask>
                <mask id={ids.highlight} {...maskProps}>
                    <GlobeLines stroke="#fff" />
                    <GlobeLines stroke="#000" dx={-ox} dy={-oy} />
                </mask>
                <GradientDef id={ids.bodyGradient} gradient={bodyGradient} box={BOUNDS} />
                <GradientDef id={ids.globeGradient} gradient={globeGradient} box={GLOBE_BOX} />
            </defs>

            <g mask={`url(#${ids.globe})`}>
                <rect {...toRect(GLOBE_BOX)} fill={globeFill} />
                <g pointerEvents="none" strokeLinejoin="round">
                    {GLOBE_FACETS.map(([d, tint, opacity], i) => (
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
                <g pointerEvents="none">
                    <rect {...toRect(GLOBE_BOX)} fill="#000" fillOpacity={ENGRAVE.recessOpacity} mask={`url(#${ids.lines})`} />
                    <rect {...toRect(GLOBE_BOX)} fill="#000" fillOpacity={ENGRAVE.shadowOpacity} mask={`url(#${ids.shadow})`} />
                    <rect {...toRect(GLOBE_BOX)} fill="#fff" fillOpacity={ENGRAVE.highlightOpacity} mask={`url(#${ids.highlight})`} />
                </g>
            </g>

            <g mask={`url(#${ids.body})`}>
                <rect {...toRect(BOUNDS)} fill={bodyFill} />
                <g pointerEvents="none" strokeLinejoin="round">
                    {GPL_FACETS.map(([d, tint, opacity], i) => (
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
            </g>
        </svg>
    );
};

export default GplTrophyIcon;
