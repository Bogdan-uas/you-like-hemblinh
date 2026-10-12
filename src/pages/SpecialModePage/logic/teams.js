import { COLORS } from "./colors.js";

export const toBaseTeam = (t) => ({
    id: t.id,
    key: t.key,
    name: t.name,

    color: t.color,
    gradient: t.gradient,

    hoverOn: t.hoverOn,

    unlitColor: t.unlitColor,
    unlitGradient: t.unlitGradient,

    shadow: t.shadow,
});

export const uniqById = (teams) => {
    const map = new Map();
    teams.forEach((t) => {
        const base = toBaseTeam(t);
        if (!map.has(base.id)) map.set(base.id, base);
    });
    return [...map.values()];
};

export const getAllTeams64 = () => {
    const entries = Object.entries(COLORS);

    return entries.map(([key, val], idx) => ({
        id: String(idx + 1),

        key,
        name: val.name,

        color: val.color,
        gradient: val.gradient,

        hoverOn: val.hoverOn,

        unlitColor: val.unlitColor,
        unlitGradient: val.unlitGradient,

        shadow: val.shadow,
    }));
};
