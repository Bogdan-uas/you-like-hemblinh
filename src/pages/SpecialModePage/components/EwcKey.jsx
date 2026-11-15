import { useId } from "react";
import { pathOf, trianglePoints, shardPoints, SHARD, EWC_GOLD, EWC_STEEL } from "../../../components/EwcTrophyIcon/ewcKeyGeometry.js";
import { Stops, KeyFaceArt, ShardArt } from "../../../components/EwcTrophyIcon/EwcParts.jsx";

const K = { x: 100, y: 104, outer: 88, inner: 66 };
const VIEW = { x: 6, y: 10, w: 188, h: 166 };
const ASPECT = VIEW.w / VIEW.h;

const [TOP, RIGHT, LEFT] = trianglePoints(K.x, K.y, K.outer);
const OUTER = pathOf([TOP, RIGHT, LEFT]);
const SIDE = pathOf([LEFT, RIGHT, [RIGHT[0] - 6, RIGHT[1] + 14], [LEFT[0] + 6, LEFT[1] + 14]]);
const FRAME_FACETS = [
    [pathOf([TOP, RIGHT, ...trianglePoints(K.x, K.y, K.inner).slice(0, 2).reverse()]), "#000", 0.22],
    [pathOf([LEFT, TOP, trianglePoints(K.x, K.y, K.inner)[0], trianglePoints(K.x, K.y, K.inner)[2]]), "#fff", 0.28],
    [pathOf([RIGHT, LEFT, trianglePoints(K.x, K.y, K.inner)[2], trianglePoints(K.x, K.y, K.inner)[1]]), "#000", 0.08],
];
const INNER_SEAT = pathOf(trianglePoints(K.x, K.y, K.inner + 2));

const CRUSHED_SLABS = [
    { x: 100, y: 146, scale: 2.05, rotate: 2 },
    { x: 54, y: 156, scale: 0.62, rotate: -24 },
    { x: 150, y: 158, scale: 0.5, rotate: 30 },
];
const CRUSHED_CHIPS = [
    [[30, 168], [38, 162], [40, 170]],
    [[170, 166], [178, 160], [176, 170]],
    [[120, 170], [126, 165], [130, 171]],
    [[74, 170], [80, 166], [82, 172]],
];

const widthFor = (size) => (typeof size === "number" ? size * ASPECT : `calc(${size} * ${ASPECT.toFixed(4)})`);

export default function EwcKey({ color = "#d6a531", state = "intact", engraving, size = "1em", title, style, ...props }) {
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const id = (n) => `ewc-key-${n}-${uid}`;
    const defender = state === "defender";
    const frameFill = defender ? `url(#${id("steel")})` : `url(#${id("frame")})`;

    return (
        <svg
            viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
            role={title ? "img" : undefined}
            aria-hidden={title ? undefined : true}
            aria-label={title || undefined}
            data-tip={title || undefined}
            style={{ display: "inline-block", verticalAlign: "middle", width: widthFor(size), height: size, flexShrink: 0, overflow: "visible", ...style }}
            {...props}
        >
            <defs>
                <linearGradient id={id("frame")} x1="0.1" y1="0" x2="0.9" y2="1">
                    <Stops colors={EWC_GOLD} />
                </linearGradient>
                <linearGradient id={id("core")} x1="0.2" y1="0" x2="0.8" y2="1">
                    <Stops colors={["#fff8d6", "#f7d978", "#e0b244", "#b8861e"]} />
                </linearGradient>
                <linearGradient id={id("steel")} x1="0.1" y1="0" x2="0.9" y2="1">
                    <Stops colors={EWC_STEEL} />
                </linearGradient>
            </defs>

            {state === "crushed" ? (
                <g>
                    <path d={pathOf(shardPoints(SHARD, 100, 160, 2.15, 2))} fill="#000" fillOpacity={0.16} transform="translate(0 8) scale(1 0.5)" style={{ transformOrigin: "100px 168px" }} />
                    {CRUSHED_SLABS.map((slab, i) => (
                        <ShardArt key={i} {...slab} fill={`url(#${id(i === 0 ? "frame" : "core")})`} enamel={color} />
                    ))}
                    {CRUSHED_CHIPS.map((points, i) => (
                        <path key={i} d={pathOf(points)} fill={`url(#${id("core")})`} stroke="#5a3a05" strokeOpacity={0.5} strokeWidth={0.8} />
                    ))}
                </g>
            ) : (
                <g strokeLinejoin="round">
                    <path d={SIDE} fill={defender ? "#0c0d14" : "#7a5410"} />
                    <path d={SIDE} fill="#000" fillOpacity={0.25} />
                    <path d={OUTER} fill={frameFill} />
                    {FRAME_FACETS.map(([d, tint, opacity], i) => (
                        <path key={i} d={d} fill={tint} fillOpacity={opacity} />
                    ))}
                    <path d={OUTER} fill="none" stroke={defender ? "#8d90a3" : "#fff2b8"} strokeOpacity={0.6} strokeWidth={1.6} />
                    <path d={INNER_SEAT} fill="#000" fillOpacity={0.45} />
                    <KeyFaceArt cx={K.x} cy={K.y} r={K.inner} fill={`url(#${id("core")})`} enamel={color} />
                    {engraving && (
                        <text
                            x={K.x}
                            y={LEFT[1] - 1.8}
                            textAnchor="middle"
                            fontFamily="'Saira Condensed', 'Arial Narrow', sans-serif"
                            fontWeight={800}
                            fontSize={7.4}
                            letterSpacing={0.6}
                            fill={defender ? "#f3cf62" : "#5a3a05"}
                            fillOpacity={0.85}
                        >
                            {engraving}
                        </text>
                    )}
                </g>
            )}
        </svg>
    );
}
