const QUALIFIER_SCRIPT_FONT_ID = "qualifier-script-font";
export const QUALIFIER_SCRIPT_FONT = '"Great Vibes", "Pinyon Script", "Brush Script MT", cursive';

export const ensureQualifierScriptFont = () => {
    if (typeof document === "undefined" || document.getElementById(QUALIFIER_SCRIPT_FONT_ID)) return;

    const link = document.createElement("link");
    link.id = QUALIFIER_SCRIPT_FONT_ID;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap";
    document.head.appendChild(link);
};

export const roundedPolygonPath = (points, radius) => {
    const n = points.length;
    const parts = [];

    for (let i = 0; i < n; i++) {
        const [px, py] = points[(i - 1 + n) % n];
        const [cx, cy] = points[i];
        const [nx, ny] = points[(i + 1) % n];

        const toPrev = Math.hypot(px - cx, py - cy);
        const toNext = Math.hypot(nx - cx, ny - cy);
        const r = Math.min(radius, toPrev / 2, toNext / 2);

        const sx = cx + ((px - cx) / toPrev) * r;
        const sy = cy + ((py - cy) / toPrev) * r;
        const ex = cx + ((nx - cx) / toNext) * r;
        const ey = cy + ((ny - cy) / toNext) * r;

        parts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(2)} ${sy.toFixed(2)} Q${cx} ${cy} ${ex.toFixed(2)} ${ey.toFixed(2)}`);
    }

    return `${parts.join(" ")} Z`;
};
