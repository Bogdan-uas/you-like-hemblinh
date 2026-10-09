import React, { useId } from "react";

const PEM_TROPHY_SILHOUETTE = [
    "M98 24 H414 a10 10 0 0 1 10 10 V42 a10 10 0 0 1 -10 10 H98 a10 10 0 0 1 -10 -10 V34 a10 10 0 0 1 10 -10 Z",
    "M104 60 H408 C408 210 332 282 279 300 H233 C180 282 104 210 104 60 Z",
    "M233 294 H279 L267 322 V364 L279 392 H233 L245 364 V322 Z",
    "M194 388 H318 L340 418 H172 Z",
    "M132 424 H380 a10 10 0 0 1 10 10 V470 a10 10 0 0 1 -10 10 H132 a10 10 0 0 1 -10 -10 V434 a10 10 0 0 1 10 -10 Z",
].join(" ");

const PEM_MONOGRAM = [
    "M192.5 168 V102.5 H209 A16.5 16.5 0 0 1 209 135.5 H192.5",
    "M274 102.5 H242.5 V161.5 H274 M242.5 132 H266",
    "M292.5 168 V102.5 L306 140 L319.5 102.5 V168",
].join(" ");

const MONOGRAM_STROKE = 13;

const MONOGRAM_TRANSFORM = "translate(256 135) scale(1.3) translate(-256 -135)";

const ENGRAVE = {
    recessOpacity: 0.28,
    shadowOpacity: 0.45,
    highlightOpacity: 0.4,
    edgeOffset: { x: 1.5, y: 3.5 },
};

const BOUNDS = { x: 88, y: 24, w: 336, h: 456 };
const ASPECT_RATIO = BOUNDS.w / BOUNDS.h;

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

const gradientLine = (angle) => {
    const rad = (angle * Math.PI) / 180;
    const dx = Math.sin(rad);
    const dy = -Math.cos(rad);
    const cx = BOUNDS.x + BOUNDS.w / 2;
    const cy = BOUNDS.y + BOUNDS.h / 2;
    const half = (Math.abs(BOUNDS.w * dx) + Math.abs(BOUNDS.h * dy)) / 2;
    return {
        x1: cx - dx * half,
        y1: cy - dy * half,
        x2: cx + dx * half,
        y2: cy + dy * half,
    };
};

const BOUNDS_RECT = { x: BOUNDS.x, y: BOUNDS.y, width: BOUNDS.w, height: BOUNDS.h };

const Monogram = ({ stroke, dx = 0, dy = 0 }) => (
    <path
        d={PEM_MONOGRAM}
        transform={`translate(${dx} ${dy}) ${MONOGRAM_TRANSFORM}`}
        fill="none"
        stroke={stroke}
        strokeWidth={MONOGRAM_STROKE}
        strokeLinejoin="miter"
        strokeLinecap="butt"
    />
);

const PemTrophyIcon = ({
    size = "1em",
    color = "currentColor",
    gradientAngle = 180,
    title,
    style,
    ...props
}) => {
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const maskId = `pem-trophy-mask-${uid}`;
    const gradientId = `pem-trophy-gradient-${uid}`;
    const lettersId = `pem-trophy-letters-${uid}`;
    const shadowEdgeId = `pem-trophy-shadow-${uid}`;
    const highlightEdgeId = `pem-trophy-highlight-${uid}`;

    const gradient = resolvePaint(color, gradientAngle);
    const fill = gradient ? `url(#${gradientId})` : color;

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
                <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
                    <path d={PEM_TROPHY_SILHOUETTE} fill="#fff" />
                </mask>
                <mask id={lettersId} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
                    <Monogram stroke="#fff" />
                </mask>
                <mask id={shadowEdgeId} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
                    <Monogram stroke="#fff" />
                    <Monogram stroke="#000" dx={ENGRAVE.edgeOffset.x} dy={ENGRAVE.edgeOffset.y} />
                </mask>
                <mask id={highlightEdgeId} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
                    <Monogram stroke="#fff" />
                    <Monogram stroke="#000" dx={-ENGRAVE.edgeOffset.x} dy={-ENGRAVE.edgeOffset.y} />
                </mask>
                {gradient && (
                    <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" {...gradientLine(gradient.angle)}>
                        {gradient.stops.map((stop, i) => (
                            <stop key={i} offset={stop.offset} stopColor={stop.color} />
                        ))}
                    </linearGradient>
                )}
            </defs>
            <rect
                x={BOUNDS.x}
                y={BOUNDS.y}
                width={BOUNDS.w}
                height={BOUNDS.h}
                fill={fill}
                mask={`url(#${maskId})`}
            />
            <g pointerEvents="none">
                <rect {...BOUNDS_RECT} fill="#000" fillOpacity={ENGRAVE.recessOpacity} mask={`url(#${lettersId})`} />
                <rect {...BOUNDS_RECT} fill="#000" fillOpacity={ENGRAVE.shadowOpacity} mask={`url(#${shadowEdgeId})`} />
                <rect {...BOUNDS_RECT} fill="#fff" fillOpacity={ENGRAVE.highlightOpacity} mask={`url(#${highlightEdgeId})`} />
            </g>
        </svg>
    );
};

export default PemTrophyIcon;
