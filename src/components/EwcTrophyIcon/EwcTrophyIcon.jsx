import { useId } from "react";
import { pathOf, ringPath, trianglePoints, EWC_GOLD, EWC_SILVER, EWC_STEEL, EWC_KEY_GOLD } from "./ewcKeyGeometry.js";
import { Stops, KeyFaceArt, ShardArt } from "./EwcParts.jsx";

const C = { x: 200, y: 158 };
const R = { outer: 150, gold: 135, bevel: 131, face: 99, inner: 87 };
const SOCKET_R = 62;
const KEY_R = 53;
const KEY_Y = C.y - 8;

const RIM_TEETH = Array.from({ length: 60 }, (_, i) => {
    const a0 = (i / 60) * Math.PI * 2;
    const a1 = ((i + 0.5) / 60) * Math.PI * 2;
    const a2 = ((i + 1) / 60) * Math.PI * 2;
    const p = (a, r) => [C.x + r * Math.cos(a), C.y + r * Math.sin(a)];
    return pathOf([p(a0, R.outer - 4), p(a1, R.gold + 3), p(a2, R.outer - 4)]);
}).join(" ");

const COLLAR = "M168 296 H232 L247 320 H153 Z";
const COLLAR_FACETS = [
    ["M168 296 H200 V320 H153 Z", "#fff", 0.28],
    ["M200 296 H232 L247 320 H200 Z", "#000", 0.16],
    ["M168 296 H232 L233.5 299 H166.5 Z", "#fff", 0.6],
];

const BASE = {
    top: pathOf([[56, 324], [112, 315], [288, 315], [344, 324], [288, 333], [112, 333]]),
    front: pathOf([[112, 333], [288, 333], [288, 418], [112, 418]]),
    left: pathOf([[56, 324], [112, 333], [112, 418], [56, 408]]),
    right: pathOf([[344, 324], [288, 333], [288, 418], [344, 408]]),
};
const BASE_ALL = pathOf([[56, 324], [112, 315], [288, 315], [344, 324], [344, 408], [288, 418], [112, 418], [56, 408]]);
const PLINTH = {
    front: pathOf([[112, 418], [288, 418], [288, 436], [112, 436]]),
    left: pathOf([[56, 408], [112, 418], [112, 436], [56, 426]]),
    right: pathOf([[344, 408], [288, 418], [288, 436], [344, 426]]),
};
const RESIN_GLINTS = [
    pathOf([[124, 340], [136, 340], [122, 410], [116, 410]]),
    pathOf([[142, 340], [146, 340], [134, 410], [131, 410]]),
    pathOf([[62, 330], [68, 331], [66, 402], [61, 401]]),
];

const SHARD_SLOTS = [
    { x: 95, y: 370, scale: 0.84, rotate: -16 },
    { x: 200, y: 378, scale: 1.32, rotate: 5 },
    { x: 305, y: 368, scale: 0.84, rotate: 19 },
];

const MOTTO_R = 115.5;
const MOTTO_FROM = Math.PI * 1.02;
const MOTTO_TO = Math.PI * 1.98;
const MOTTO_ARC = MOTTO_R * (MOTTO_TO - MOTTO_FROM);
const MOTTO_PATH = `M${C.x + MOTTO_R * Math.cos(MOTTO_FROM)} ${C.y + MOTTO_R * Math.sin(MOTTO_FROM)} A${MOTTO_R} ${MOTTO_R} 0 0 1 ${C.x + MOTTO_R * Math.cos(MOTTO_TO)} ${C.y + MOTTO_R * Math.sin(MOTTO_TO)}`;
const WIDE_SCRIPT = /[\u3000-\u9fff\uac00-\ud7af]/;

const mottoLayout = (text) => {
    const wide = WIDE_SCRIPT.test(text);
    const units = [...text].reduce((sum, ch) => sum + (WIDE_SCRIPT.test(ch) ? 1 : ch === " " ? 0.32 : 0.54), 0);
    const fontSize = Math.min(wide ? 17 : 15.5, (MOTTO_ARC * 0.92) / Math.max(1, wide ? units * 1.16 : units + [...text].length * 0.09));
    return { fontSize, letterSpacing: wide ? fontSize * 0.12 : fontSize * 0.09, wide };
};

const BOUNDS = { x: 44, y: 2, w: 312, h: 440 };
const ASPECT = BOUNDS.w / BOUNDS.h;
const widthFor = (size) => (typeof size === "number" ? size * ASPECT : `calc(${size} * ${ASPECT.toFixed(4)})`);

const MottoEngraving = ({ id, text }) => {
    const upper = text.toLocaleUpperCase();
    const { fontSize, letterSpacing, wide } = mottoLayout(upper);
    const font = wide ? "'Yu Gothic', 'Meiryo', 'Microsoft YaHei', sans-serif" : "'Oswald', 'Arial Narrow', sans-serif";
    const common = { fontFamily: font, fontWeight: wide ? 700 : 600, fontSize, letterSpacing, textAnchor: "middle", dominantBaseline: "central" };
    return (
        <g pointerEvents="none">
            <defs>
                <path id={id} d={MOTTO_PATH} />
            </defs>
            <text {...common} fill="#ffffff" fillOpacity={0.85} transform="translate(0 0.7)">
                <textPath href={`#${id}`} startOffset="50%">
                    {upper}
                </textPath>
            </text>
            <text {...common} fill="#7d8089">
                <textPath href={`#${id}`} startOffset="50%">
                    {upper}
                </textPath>
            </text>
        </g>
    );
};

const EwcTrophyIcon = ({ size = "1em", keyColor, shardColors, highlightShard = null, caption = "ESPORTS WORLD CUP", motto, title, style, ...props }) => {
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const id = (n) => `ewc-${n}-${uid}`;
    const enamel = keyColor ?? "#7a5410";
    const shards = [0, 1, 2].map((i) => shardColors?.[i] ?? null);
    const socket = trianglePoints(C.x, KEY_Y, SOCKET_R);

    return (
        <svg
            viewBox={`${BOUNDS.x} ${BOUNDS.y} ${BOUNDS.w} ${BOUNDS.h}`}
            role={title ? "img" : undefined}
            aria-hidden={title ? undefined : true}
            style={{ display: "inline-block", verticalAlign: "middle", width: widthFor(size), height: size, flexShrink: 0, ...style }}
            {...props}
        >
            {title && <title>{title}</title>}
            <defs>
                <linearGradient id={id("gold")} x1="0.15" y1="0" x2="0.85" y2="1">
                    <Stops colors={EWC_GOLD} />
                </linearGradient>
                <linearGradient id={id("goldKey")} x1="0.2" y1="0" x2="0.8" y2="1">
                    <Stops colors={["#fff8d6", "#f7d978", "#e0b244", "#b8861e"]} />
                </linearGradient>
                <linearGradient id={id("silver")} x1="0.1" y1="0" x2="0.9" y2="1">
                    <Stops colors={EWC_SILVER} />
                </linearGradient>
                <linearGradient id={id("inner")} x1="0.3" y1="0" x2="0.7" y2="1">
                    <Stops colors={["#ffffff", "#eef0f2", "#d3d6db"]} />
                </linearGradient>
                <linearGradient id={id("steel")} x1="0" y1="0" x2="0" y2="1">
                    <Stops colors={EWC_STEEL} />
                </linearGradient>
                <linearGradient id={id("socket")} x1="0" y1="0" x2="0" y2="1">
                    <Stops colors={["#2b2412", "#5a4720", "#8a6c2c"]} />
                </linearGradient>
                <linearGradient id={id("resin")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
                    <stop offset="0.5" stopColor="#f3e8d6" stopOpacity="0.8" />
                    <stop offset="1" stopColor="#e6d2b2" stopOpacity="0.9" />
                </linearGradient>
                <filter id={id("hl")} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="7" />
                </filter>
                <radialGradient id={id("sheen")} cx="0.34" cy="0.26" r="0.75">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
                    <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#000" stopOpacity="0.18" />
                </radialGradient>
            </defs>

            <path d={pathOf([[60, 438], [340, 438], [328, 442], [72, 442]])} fill="#000" fillOpacity={0.18} />

            <g>
                <path d={PLINTH.left} fill={`url(#${id("steel")})`} />
                <path d={PLINTH.front} fill={`url(#${id("steel")})`} />
                <path d={PLINTH.right} fill={`url(#${id("steel")})`} />
                <path d={PLINTH.left} fill="#fff" fillOpacity={0.12} />
                <path d={PLINTH.right} fill="#000" fillOpacity={0.3} />
                <path d={pathOf([[112, 418], [288, 418], [288, 421], [112, 421]])} fill="#fff" fillOpacity={0.3} />
            </g>

            <g>
                <path d={BASE_ALL} fill={`url(#${id("resin")})`} />
                {SHARD_SLOTS.map((slot, i) => (
                    <ShardArt key={i} {...slot} fill={`url(#${id("gold")})`} enamel={shards[i] ?? EWC_KEY_GOLD} />
                ))}
                <path d={BASE_ALL} fill="#fff" fillOpacity={0.22} />
                <path d={BASE.left} fill="#fff" fillOpacity={0.16} />
                <path d={BASE.right} fill="#5a4630" fillOpacity={0.14} />
                <path d={BASE.top} fill="#fff" fillOpacity={0.7} />
                {RESIN_GLINTS.map((d, i) => (
                    <path key={i} d={d} fill="#fff" fillOpacity={0.55} />
                ))}
                <g fill="none" stroke="#8c7a62" strokeOpacity={0.55} strokeWidth={1.4} strokeLinejoin="round">
                    <path d={BASE_ALL} />
                    <path d="M112 333 V418 M288 333 V418" />
                    <path d={BASE.top} />
                </g>
                {highlightShard != null && SHARD_SLOTS[highlightShard] ? (
                    <g>
                        <path d={BASE_ALL} fill="#1c1408" fillOpacity={0.42} />
                        <circle cx={SHARD_SLOTS[highlightShard].x} cy={SHARD_SLOTS[highlightShard].y} r={36 * SHARD_SLOTS[highlightShard].scale} fill={shards[highlightShard] ?? EWC_KEY_GOLD} fillOpacity={0.75} filter={`url(#${id("hl")})`} />
                        <ShardArt {...SHARD_SLOTS[highlightShard]} fill={`url(#${id("gold")})`} enamel={shards[highlightShard] ?? EWC_KEY_GOLD} />
                    </g>
                ) : null}
            </g>

            <g>
                <path d={COLLAR} fill={`url(#${id("silver")})`} />
                {COLLAR_FACETS.map(([d, tint, opacity], i) => (
                    <path key={i} d={d} fill={tint} fillOpacity={opacity} />
                ))}
            </g>

            <g>
                <circle cx={C.x} cy={C.y} r={R.outer} fill={`url(#${id("gold")})`} />
                <path d={RIM_TEETH} fill="#5a3a05" fillOpacity={0.16} />
                <circle cx={C.x} cy={C.y} r={R.outer - 1.5} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={2.5} />
                <circle cx={C.x} cy={C.y} r={R.gold} fill="#6e4806" fillOpacity={0.5} />
                <path d={ringPath(C.x, C.y, R.bevel, R.face)} fill={`url(#${id("silver")})`} />
                <path d={ringPath(C.x, C.y, R.face, R.inner)} fill={`url(#${id("gold")})`} />
                <circle cx={C.x} cy={C.y} r={R.face - 1.2} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={2} />
                <circle cx={C.x} cy={C.y} r={R.inner} fill={`url(#${id("inner")})`} />
                <circle cx={C.x} cy={C.y} r={R.inner} fill="none" stroke="#6e4806" strokeOpacity={0.45} strokeWidth={2} />
                <circle cx={C.x} cy={C.y} r={R.bevel} fill="none" stroke="#000" strokeOpacity={0.18} strokeWidth={1.5} />
                <circle cx={C.x} cy={C.y} r={R.outer} fill={`url(#${id("sheen")})`} />
                <circle cx={C.x} cy={C.y} r={R.outer} fill="none" stroke="#6e4806" strokeOpacity={0.6} strokeWidth={2} />
            </g>

            <path d={pathOf(socket)} fill={`url(#${id("socket")})`} stroke="#fff" strokeOpacity={0.7} strokeWidth={2.5} strokeLinejoin="round" />
            <KeyFaceArt cx={C.x} cy={KEY_Y + 3} r={KEY_R} fill={`url(#${id("goldKey")})`} enamel={enamel} />

            {motto ? <MottoEngraving id={id("motto")} text={motto} /> : null}

            {caption && (
                <text
                    x={C.x}
                    y={C.y + 58}
                    textAnchor="middle"
                    fontFamily="'Saira Condensed', 'Arial Narrow', sans-serif"
                    fontWeight={800}
                    fontSize={13}
                    letterSpacing={1.2}
                    fill="#a87414"
                    stroke="#fff"
                    strokeOpacity={0.5}
                    strokeWidth={0.4}
                >
                    {caption}
                </text>
            )}
        </svg>
    );
};

export default EwcTrophyIcon;
