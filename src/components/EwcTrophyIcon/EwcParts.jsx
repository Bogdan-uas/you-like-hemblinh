import { keyFace, pathOf, shardPoints, SHARD, SHARD_FACETS, SHARD_ENAMEL, SHARD_CREASES } from "./ewcKeyGeometry.js";

export const Stops = ({ colors }) =>
    colors.map((c, i) => <stop key={i} offset={colors.length > 1 ? i / (colors.length - 1) : 0} stopColor={c} />);

export const KeyFaceArt = ({ cx, cy, r, fill, enamel, grooveWidth }) => {
    const face = keyFace(cx, cy, r);
    const w = grooveWidth ?? r * 0.075;
    return (
        <g strokeLinejoin="round">
            <path d={face.outline} fill={fill} />
            {face.kites.map((k, i) => (
                <path key={i} d={k.d} fill={k.tint} fillOpacity={k.opacity} />
            ))}
            {face.ridges.map((d, i) => (
                <g key={i} fill="none" strokeLinecap="round">
                    <path d={d} stroke="#000" strokeOpacity={0.28} strokeWidth={w * 0.55} transform={`translate(0 ${w * 0.35})`} />
                    <path d={d} stroke="#fff" strokeOpacity={0.55} strokeWidth={w * 0.45} />
                </g>
            ))}
            {face.grooves.map((d, i) => (
                <g key={i} fill="none" strokeLinecap="round">
                    <path d={d} stroke="#000" strokeOpacity={0.45} strokeWidth={w * 1.5} />
                    <path d={d} stroke={enamel} strokeWidth={w} />
                </g>
            ))}
            <circle cx={cx} cy={cy} r={w * 1.05} fill={enamel} stroke="#000" strokeOpacity={0.4} strokeWidth={w * 0.35} />
            <path d={face.outline} fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={w * 0.5} />
        </g>
    );
};

export const ShardArt = ({ x, y, scale = 1, rotate = 0, fill, enamel, outline = "#5a3a05" }) => {
    const at = (points) => pathOf(shardPoints(points, x, y, scale, rotate));
    return (
        <g strokeLinejoin="round">
            <path d={at(SHARD)} fill={fill} stroke={outline} strokeOpacity={0.55} strokeWidth={1.1 * scale} />
            {SHARD_FACETS.map(([points, tint, opacity], i) => (
                <path key={i} d={at(points)} fill={tint} fillOpacity={opacity} />
            ))}
            {SHARD_ENAMEL.map((points, i) => (
                <path key={i} d={at(points)} fill={enamel} stroke="#000" strokeOpacity={0.35} strokeWidth={0.6 * scale} />
            ))}
            {SHARD_CREASES.map((points, i) => (
                <path
                    key={i}
                    d={pathOf(shardPoints(points, x, y, scale, rotate), false)}
                    fill="none"
                    stroke="#fff"
                    strokeOpacity={0.5}
                    strokeWidth={0.9 * scale}
                    strokeLinecap="round"
                />
            ))}
        </g>
    );
};
