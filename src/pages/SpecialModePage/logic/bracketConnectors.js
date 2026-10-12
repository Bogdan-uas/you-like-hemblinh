export const PEM_GROUP_CONNECTOR_LINKS = (() => {
    const links = [];
    const add = (fromStage, fromIdx, toStage, toIdx, toSlot) =>
        links.push({ from: `${fromStage}-${fromIdx}`, to: `${toStage}-${toIdx}`, toY: toSlot === "slotB" ? 0.75 : 0.25 });
    const pairSlot = (i) => (i % 2 === 0 ? "slotA" : "slotB");

    for (let i = 0; i < 4; i++) add("uo", i, "usf", Math.floor(i / 2), pairSlot(i));
    for (let i = 0; i < 2; i++) add("usf", i, "uf", 0, pairSlot(i));
    for (let i = 0; i < 2; i++) add("lr1", i, "lsf", i, "slotA");
    for (let i = 0; i < 2; i++) add("lsf", i, "lf", 0, pairSlot(i));

    return links;
})();

export const PEM_PLAYOFFS_CONNECTOR_LINKS = [
    { from: "qf-0", to: "sf-0", toY: 0.75 },
    { from: "qf-1", to: "sf-1", toY: 0.75 },
    { from: "sf-0", to: "gf-0", toY: 0.25 },
    { from: "sf-1", to: "gf-0", toY: 0.75 },
];

export const QUALIFIER_CONNECTOR_LINKS = (() => {
    const links = [];
    const add = (fromStage, fromIdx, toStage, toIdx, toSlot) =>
        links.push({ from: `${fromStage}-${fromIdx}`, to: `${toStage}-${toIdx}`, toY: toSlot === "slotB" ? 0.75 : 0.25 });
    const pairSlot = (i) => (i % 2 === 0 ? "slotA" : "slotB");

    for (let i = 0; i < 8; i++) add("uo", i, "uqf", Math.floor(i / 2), pairSlot(i));
    for (let i = 0; i < 4; i++) add("uqf", i, "usf", Math.floor(i / 2), pairSlot(i));
    for (let i = 0; i < 2; i++) add("usf", i, "uf", 0, pairSlot(i));
    for (let i = 0; i < 4; i++) add("lr1", i, "lr2", i, "slotA");
    for (let i = 0; i < 4; i++) add("lr2", i, "lr3", Math.floor(i / 2), pairSlot(i));
    for (let i = 0; i < 2; i++) add("lr3", i, "lsf", i, "slotA");
    for (let i = 0; i < 2; i++) add("lsf", i, "lf", 0, pairSlot(i));
    add("lf", 0, "cf", 0, "slotA");

    return links;
})();

export const buildConnectorPath = (x1, y1, x2, y2, radius = 8) => {
    if (Math.abs(y2 - y1) < 1) return `M${x1} ${y1} H${x2}`;

    const midX = x1 + (x2 - x1) / 2;
    const dir = y2 > y1 ? 1 : -1;
    const r = Math.max(0, Math.min(radius, Math.abs(y2 - y1) / 2, Math.abs(midX - x1)));

    return [
        `M${x1} ${y1}`,
        `H${midX - r}`,
        `Q${midX} ${y1} ${midX} ${y1 + dir * r}`,
        `V${y2 - dir * r}`,
        `Q${midX} ${y2} ${midX + r} ${y2}`,
        `H${x2}`,
    ].join(" ");
};
