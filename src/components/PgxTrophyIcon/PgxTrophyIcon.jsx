import React, { useId } from "react";

const PGX_BODY = [
    "M180 160 L332 160 L326 172 L186 172 Z",
    "M186 172 L326 172 L314 214 L290 248 L268 262 L244 262 L222 248 L198 214 Z",
    "M204 146 L308 146 L320 162 L192 162 Z",
    "M206 228 L184 220 L164 200 L152 174 L146 146 L146 118 L158 136 L170 154 L186 168 L198 176 L196 196 Z",
    "M316 196 L314 176 L326 168 L342 154 L354 136 L366 118 L366 146 L360 174 L348 200 L328 220 L306 228 Z",
    "M244 258 L268 258 L264 290 L248 290 Z",
    "M240 288 L272 288 L282 302 L272 316 L240 316 L230 302 Z",
    "M248 314 L264 314 L272 350 L240 350 Z",
    "M222 348 L290 348 L300 364 L212 364 Z",
    "M206 362 L306 362 L322 378 L322 408 L306 420 L206 420 L190 408 L190 378 Z",
].join(" ");

const BODY_FACETS = [
    ["M204 146 L256 146 L256 162 L192 162 Z", "#fff", 0.16],
    ["M256 146 L308 146 L320 162 L256 162 Z", "#000", 0.2],
    ["M180 160 L332 160 L326 166 L186 166 Z", "#fff", 0.28],
    ["M186 172 L326 172 L320 192 L192 192 Z", "#fff", 0.16],
    ["M192 192 L256 192 L256 262 L244 262 L222 248 L198 214 Z", "#fff", 0.1],
    ["M256 192 L320 192 L314 214 L290 248 L268 262 L256 262 Z", "#000", 0.22],
    ["M198 214 L222 248 L244 262 L232 236 Z", "#fff", 0.08],
    ["M314 214 L290 248 L268 262 L280 236 Z", "#000", 0.14],
    ["M206 228 L184 220 L164 200 L152 174 L146 146 L146 118 L158 136 L170 154 L186 168 L198 176 L196 196 Z", "#fff", 0.18],
    ["M206 228 L146 118 L198 176 L196 196 Z", "#000", 0.12],
    ["M316 196 L314 176 L326 168 L342 154 L354 136 L366 118 L366 146 L360 174 L348 200 L328 220 L306 228 Z", "#000", 0.26],
    ["M306 228 L366 118 L314 176 L316 196 Z", "#fff", 0.06],
    ["M244 258 L256 258 L256 290 L248 290 Z", "#fff", 0.14],
    ["M256 258 L268 258 L264 290 L256 290 Z", "#000", 0.2],
    ["M248 314 L256 314 L256 350 L240 350 Z", "#fff", 0.14],
    ["M256 314 L264 314 L272 350 L256 350 Z", "#000", 0.2],
    ["M240 288 L272 288 L282 302 L230 302 Z", "#fff", 0.24],
    ["M230 302 L282 302 L272 316 L240 316 Z", "#000", 0.22],
    ["M222 348 L256 348 L256 364 L212 364 Z", "#fff", 0.16],
    ["M256 348 L290 348 L300 364 L256 364 Z", "#000", 0.18],
    ["M206 362 L306 362 L322 378 L190 378 Z", "#fff", 0.26],
    ["M190 378 L214 378 L214 420 L206 420 L190 408 Z", "#fff", 0.14],
    ["M214 378 L298 378 L298 420 L214 420 Z", "#000", 0.03],
    ["M298 378 L322 378 L322 408 L306 420 L298 420 Z", "#000", 0.28],
];

const PGX_ACCENT = [
    "M214 134 L214 104 L226 116 L236 86 L246 112 L256 74 L266 112 L276 86 L286 116 L298 104 L298 134 Z",
    "M210 132 H302 V146 H210 Z",
    "M256 186 L272 206 L256 228 L240 206 Z",
].join(" ");

const PGX_GEM = "M256 186 L272 206 L256 228 L240 206 Z";

const ACCENT_FACETS = [
    ["M214 104 L214 134 L214 134 L214 134 Z", "#fff", 0.22],
    ["M214 104 L214 134 L226 134 L226 116 Z", "#000", 0.12],
    ["M236 86 L226 116 L226 134 L236 134 Z", "#fff", 0.22],
    ["M236 86 L236 134 L246 134 L246 112 Z", "#000", 0.12],
    ["M256 74 L246 112 L246 134 L256 134 Z", "#fff", 0.22],
    ["M256 74 L256 134 L266 134 L266 112 Z", "#000", 0.24],
    ["M276 86 L266 112 L266 134 L276 134 Z", "#fff", 0.08],
    ["M276 86 L276 134 L286 134 L286 116 Z", "#000", 0.24],
    ["M298 104 L286 116 L286 134 L298 134 Z", "#fff", 0.08],
    ["M298 104 L298 134 L298 134 L298 134 Z", "#000", 0.24],
    ["M210 132 L302 132 L302 136 L210 136 Z", "#fff", 0.3],
    ["M256 136 L302 136 L302 146 L256 146 Z", "#000", 0.2],
    ["M256 186 L240 206 L256 206 Z", "#fff", 0.4],
    ["M256 186 L272 206 L256 206 Z", "#fff", 0.12],
    ["M240 206 L256 228 L256 206 Z", "#000", 0.08],
    ["M272 206 L256 228 L256 206 Z", "#000", 0.3],
];

const PGX_ENGRAVING = [
    "M194 182 H318",
    "M216 392 H296",
    "M216 400 H296",
].join(" ");

const ENGRAVING_STROKE = 3.5;

const GEM_SETTING = 0;

const FACET_STRENGTH = 1;

const ENGRAVE = {
    recessOpacity: 0.3,
    shadowOpacity: 0.45,
    highlightOpacity: 0.35,
    edgeOffset: { x: 0.6, y: 1.4 },
};

const ACCENT_BOX = { x: 208, y: 72, w: 96, h: 158 };

const BOUNDS = { x: 144, y: 72, w: 224, h: 348 };
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
        d={PGX_ENGRAVING}
        transform={`translate(${dx} ${dy})`}
        fill="none"
        stroke={color}
        strokeWidth={ENGRAVING_STROKE}
        strokeLinecap="butt"
    />
);

const PgxTrophyIcon = ({
    size = "1em",
    color = "currentColor",
    accentColor,
    gradientAngle = 180,
    accentGradientAngle = 180,
    title,
    style,
    ...props
}) => {
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const ids = {
        body: `pgx-trophy-body-${uid}`,
        bodyGradient: `pgx-trophy-body-gradient-${uid}`,
        accent: `pgx-trophy-accent-${uid}`,
        accentGradient: `pgx-trophy-accent-gradient-${uid}`,
        engraving: `pgx-trophy-engraving-${uid}`,
        shadow: `pgx-trophy-shadow-${uid}`,
        highlight: `pgx-trophy-highlight-${uid}`,
    };

    const bodyGradient = resolvePaint(color, gradientAngle);
    const bodyFill = bodyGradient ? `url(#${ids.bodyGradient})` : color;

    const accentPaint = accentColor ?? color;
    const accentGradient = resolvePaint(accentPaint, accentGradientAngle);
    const accentFill = accentGradient ? `url(#${ids.accentGradient})` : accentPaint;

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
                    <path d={PGX_BODY} fill="#fff" />
                    <path d={PGX_GEM} fill="#000" stroke="#000" strokeWidth={GEM_SETTING * 2} strokeLinejoin="round" />
                </mask>
                <mask id={ids.accent} {...maskProps}>
                    <path d={PGX_ACCENT} fill="#fff" />
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
                <GradientDef id={ids.accentGradient} gradient={accentGradient} box={ACCENT_BOX} />
            </defs>

            <g mask={`url(#${ids.body})`}>
                <rect {...toRect(BOUNDS)} fill={bodyFill} />
                <Facets facets={BODY_FACETS} />
                <g pointerEvents="none">
                    <rect {...toRect(BOUNDS)} fill="#000" fillOpacity={ENGRAVE.recessOpacity} mask={`url(#${ids.engraving})`} />
                    <rect {...toRect(BOUNDS)} fill="#000" fillOpacity={ENGRAVE.shadowOpacity} mask={`url(#${ids.shadow})`} />
                    <rect {...toRect(BOUNDS)} fill="#fff" fillOpacity={ENGRAVE.highlightOpacity} mask={`url(#${ids.highlight})`} />
                </g>
            </g>

            <g mask={`url(#${ids.accent})`}>
                <rect {...toRect(ACCENT_BOX)} fill={accentFill} />
                <Facets facets={ACCENT_FACETS} />
            </g>
        </svg>
    );
};

export default PgxTrophyIcon;
