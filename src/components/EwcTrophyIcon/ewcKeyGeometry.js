export const EWC_GOLD = ["#fff4c2", "#f3cf62", "#d6a531", "#a87414", "#6e4806"];
export const EWC_SILVER = ["#ffffff", "#e7e9ec", "#c4c8ce", "#9a9ea6", "#6f737b"];
export const EWC_STEEL = ["#5c5f6e", "#2e2f42", "#1b1c27", "#0c0d14"];
export const EWC_KEY_GOLD = "#d6a531";

const r1 = (v) => Math.round(v * 10) / 10;

export const pathOf = (points, close = true) => `M${points.map(([x, y]) => `${r1(x)} ${r1(y)}`).join(" L")}${close ? " Z" : ""}`;

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export const trianglePoints = (cx, cy, r) =>
    [-90, 30, 150].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });

export const ringPath = (cx, cy, outer, inner) =>
    `M${cx - outer} ${cy} a${outer} ${outer} 0 1 0 ${outer * 2} 0 a${outer} ${outer} 0 1 0 ${-outer * 2} 0 Z ` +
    `M${cx - inner} ${cy} a${inner} ${inner} 0 1 1 ${inner * 2} 0 a${inner} ${inner} 0 1 1 ${-inner * 2} 0 Z`;

export const keyFace = (cx, cy, r) => {
    const [top, right, left] = trianglePoints(cx, cy, r);
    const g = [cx, cy];
    const mTR = lerp(top, right, 0.5);
    const mRL = lerp(right, left, 0.5);
    const mLT = lerp(left, top, 0.5);
    const kites = [
        { v: top, a: mLT, b: mTR, tint: "#fff", opacity: 0.22 },
        { v: right, a: mTR, b: mRL, tint: "#000", opacity: 0.2 },
        { v: left, a: mRL, b: mLT, tint: "#fff", opacity: 0.06 },
    ];
    return {
        outline: pathOf([top, right, left]),
        kites: kites.map(({ v, a, b, tint, opacity }) => ({ d: pathOf([v, a, g, b]), tint, opacity })),
        grooves: [mTR, mRL, mLT].map((m) => pathOf([g, m], false)),
        ridges: kites.flatMap(({ v, a, b }) =>
            [0.4, 0.68].map((s) => pathOf([lerp(v, a, s), lerp(v, g, s), lerp(v, b, s)], false)),
        ),
    };
};

export const SHARD = [
    [-40, 8], [-33, -5], [-22, -12], [-12, -6], [-3, -19], [8, -11], [17, -16], [29, -9], [40, 1],
    [35, 12], [21, 17], [9, 11], [-3, 18], [-16, 13], [-29, 17],
];

export const SHARD_FACETS = [
    [[[-33, -5], [-22, -12], [-12, -6], [-20, 2]], "#fff", 0.32],
    [[[-3, -19], [8, -11], [-1, -2], [-12, -6]], "#fff", 0.42],
    [[[17, -16], [29, -9], [18, 0], [8, -11]], "#fff", 0.2],
    [[[29, -9], [40, 1], [35, 12], [18, 0]], "#000", 0.26],
    [[[-20, 2], [-1, -2], [9, 11], [-3, 18], [-16, 13]], "#000", 0.2],
    [[[-40, 8], [-33, -5], [-20, 2], [-29, 17]], "#000", 0.12],
    [[[18, 0], [35, 12], [21, 17], [9, 11]], "#000", 0.36],
];

export const SHARD_ENAMEL = [
    [[-24, -1], [-3, -4], [-3, -1.5], [-24, 1.5]],
    [[4, -9], [24, -3], [23, -0.5], [3, -6.5]],
    [[-12, 9], [12, 8], [12, 10.5], [-12, 11.5]],
];

export const SHARD_CREASES = [
    [[-33, -5], [-20, 2], [-1, -2], [18, 0], [35, 12]],
    [[-12, -6], [-1, -2], [9, 11]],
];

export const shardPoints = (points, x, y, scale = 1, rotate = 0) => {
    const a = (rotate * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return points.map(([px, py]) => [x + (px * c - py * s) * scale, y + (px * s + py * c) * scale]);
};
