import React, { useId } from "react";

const ESS_BODY = [
    "M158 106 H354 L352 122 H160 Z",
    "M176 122 H336 L332 134 C330 222 304 294 268 320 H244 C208 294 182 222 180 134 Z",
    "M206.2 268 C146 244 124 162 144 112 C148 98 154 94 158 106 L160 122 C147 172 160 232 199.2 250 C201.4 256.3 203.7 262.3 206.2 268 Z",
    "M312.8 250 C352 232 365 172 352 122 L354 106 C358 94 364 98 368 112 C388 162 366 244 305.8 268 C308.3 262.3 310.6 256.3 312.8 250 Z",
    "M249 320 H263 L262 334 H250 Z",
    "M236 334 H276 L284 346 L276 358 H236 L228 346 Z",
    "M249 358 H263 L269 370 H243 Z",
    "M220 370 H292 L306 392 H206 Z",
].join(" ");

const BODY_FACETS = [
    ["M130 90 H256 V114 H130 Z", "#fff", 0.3],
    ["M256 90 H382 V114 H256 Z", "#000", 0.14],
    ["M130 114 H256 V122 H130 Z", "#fff", 0.12],
    ["M256 114 H382 V122 H256 Z", "#000", 0.24],
    ["M180 134 C182 222 208 294 244 320 H256 V122 H176 Z", "#fff", 0.14],
    ["M256 122 H336 L332 134 C330 222 304 294 268 320 H256 Z", "#000", 0.22],
    ["M196 134 C198 200 214 252 236 286 C214 236 204 190 204 134 Z", "#fff", 0.22],
    ["M160 122 C147 172 160 232 199.2 250 C201.4 256.3 203.7 262.3 206.2 268 C149.9 245.5 127 172.3 140.7 122 Z", "#fff", 0.16],
    ["M352 122 C365 172 352 232 312.8 250 C310.6 256.3 308.3 262.3 305.8 268 C362.1 245.5 385 172.3 371.3 122 Z", "#000", 0.24],
    ["M249 320 H256 V334 H250 Z", "#fff", 0.14],
    ["M256 320 H263 L262 334 H256 Z", "#000", 0.2],
    ["M236 334 H276 L284 346 H228 Z", "#fff", 0.26],
    ["M228 346 H284 L276 358 H236 Z", "#000", 0.24],
    ["M249 358 H256 V370 H243 Z", "#fff", 0.14],
    ["M256 358 H263 L269 370 H256 Z", "#000", 0.2],
    ["M220 370 H256 V392 H206 Z", "#fff", 0.2],
    ["M256 370 H292 L306 392 H256 Z", "#000", 0.22],
];

const ESS_ACCENT = [
    "M256 170 L263 190 L284 191 L267 204 L273 225 L256 213 L239 225 L245 204 L228 191 L249 190 Z",
    "M192 390 H320 L328 400 V430 L320 438 H192 L184 430 V400 Z",
].join(" ");

const ESS_GEM = "M256 170 L263 190 L284 191 L267 204 L273 225 L256 213 L239 225 L245 204 L228 191 L249 190 Z";

const ACCENT_FACETS = [
    ["M256 170 L249 190 L228 191 L245 204 L256 204 Z", "#fff", 0.4],
    ["M256 170 L263 190 L284 191 L267 204 L256 204 Z", "#fff", 0.12],
    ["M245 204 L239 225 L256 213 L256 204 Z", "#000", 0.1],
    ["M267 204 L273 225 L256 213 L256 204 Z", "#000", 0.32],
    ["M192 390 H320 L328 400 H184 Z", "#fff", 0.3],
    ["M184 400 H204 V438 H192 L184 430 Z", "#fff", 0.14],
    ["M204 400 H308 V438 H204 Z", "#000", 0.04],
    ["M308 400 H328 V430 L320 438 H308 Z", "#000", 0.3],
];

const ESS_ENGRAVING = [
    "M180 142 H332",
    "M210 414 H302",
    "M210 422 H302",
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

const ACCENT_BOX = { x: 184, y: 168, w: 144, h: 272 };

const BOUNDS = { x: 120, y: 82, w: 272, h: 358 };
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
        d={ESS_ENGRAVING}
        transform={`translate(${dx} ${dy})`}
        fill="none"
        stroke={color}
        strokeWidth={ENGRAVING_STROKE}
        strokeLinecap="butt"
    />
);

const EssTrophyIcon = ({
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
        body: `ess-trophy-body-${uid}`,
        bodyGradient: `ess-trophy-body-gradient-${uid}`,
        accent: `ess-trophy-accent-${uid}`,
        accentGradient: `ess-trophy-accent-gradient-${uid}`,
        engraving: `ess-trophy-engraving-${uid}`,
        shadow: `ess-trophy-shadow-${uid}`,
        highlight: `ess-trophy-highlight-${uid}`,
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
                    <path d={ESS_BODY} fill="#fff" />
                    <path d={ESS_GEM} fill="#000" stroke="#000" strokeWidth={GEM_SETTING * 2} strokeLinejoin="round" />
                </mask>
                <mask id={ids.accent} {...maskProps}>
                    <path d={ESS_ACCENT} fill="#fff" />
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

export default EssTrophyIcon;
