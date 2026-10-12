import { toBaseTeam } from "./teams.js";

export const buildBracketRoutes = (stageOrder, sizes, slotSource) => {
    const routes = {};
    stageOrder.forEach((stage) => {
        for (let idx = 0; idx < sizes[stage]; idx++) {
            ["slotA", "slotB"].forEach((slotKey) => {
                const source = slotSource(stage, idx, slotKey);
                if (!source) return;
                const key = `${source.stage}-${source.idx}`;
                routes[key] = { ...(routes[key] || {}), [source.want]: { stage, idx, slotKey } };
            });
        }
    });
    return routes;
};

export const buildBracketConnectorLinks = (stageOrder, sizes, slotSource) => {
    const links = [];
    stageOrder.forEach((stage) => {
        for (let idx = 0; idx < sizes[stage]; idx++) {
            ["slotA", "slotB"].forEach((slotKey) => {
                const source = slotSource(stage, idx, slotKey);
                if (!source || source.want !== "winner") return;
                links.push({ from: `${source.stage}-${source.idx}`, to: `${stage}-${idx}`, toY: slotKey === "slotB" ? 0.75 : 0.25 });
            });
        }
    });
    return links;
};

export const canOpenBracketMatch = (stageOrder, bracket, stage, idx) => {
    const match = bracket?.[stage]?.[idx];
    if (!match || !match.slotA || !match.slotB || match.played) return false;

    for (const s of stageOrder) {
        const arr = bracket[s] || [];
        if (s === stage) return arr.slice(0, idx).every((m) => m.played);
        if (arr.some((m) => !m.played)) return false;
    }

    return false;
};

export const findCurrentBracketMatch = (stageOrder, bracket) => {
    if (!bracket) return null;

    for (const stage of stageOrder) {
        const arr = bracket[stage] || [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].played) continue;
            return canOpenBracketMatch(stageOrder, bracket, stage, i) ? { stage, index: i, id: arr[i].id } : null;
        }
    }

    return null;
};

export const findNextBracketMatch = (stageOrder, bracket, current) => {
    if (!bracket || !current) return null;

    let passedCurrent = false;
    for (const stage of stageOrder) {
        const arr = bracket[stage] || [];
        for (let i = 0; i < arr.length; i++) {
            if (!passedCurrent) {
                if (stage === current.stage && i === current.index) passedCurrent = true;
                continue;
            }
            const m = arr[i];
            if (!m.played) return { stage, index: i, id: m.id };
        }
    }

    return null;
};

export const advanceBracket = (routes, bracket, stage, idx, winner, loser) => {
    const route = routes[`${stage}-${idx}`] || {};

    const place = (target, team) => {
        if (!target || !team) return;
        const arr = [...bracket[target.stage]];
        arr[target.idx] = { ...arr[target.idx], [target.slotKey]: toBaseTeam(team) };
        bracket[target.stage] = arr;
    };

    place(route.winner, winner);
    place(route.loser, loser);
};

export const isBracketFinished = (stageOrder, bracket) =>
    stageOrder.every((stage) => (bracket?.[stage] || []).length > 0 && bracket[stage].every((m) => m.played));

export const copyBracketStages = (stageOrder, bracket) => {
    const copy = { ...bracket };
    stageOrder.forEach((stage) => {
        copy[stage] = [...(bracket?.[stage] || [])];
    });
    return copy;
};

export const makeBracketMatch = (id, group, stage, extra = {}) => ({
    id,
    group,
    stage,
    slotA: null,
    slotB: null,
    played: false,
    scoreLeft: null,
    scoreRight: null,
    winnerTeamId: null,
    loserTeamId: null,
    pickTeamId: null,
    setHistory: [],
    ...extra,
});

export const bracketMatchPoints = (match, bestOf) => {
    if (!match?.played || !match.pickTeamId) return 0;
    if (match.winnerTeamId === match.pickTeamId) return bestOf;
    if (bestOf === 1) return 0;

    const pickedIsLeft = match.slotA && match.pickTeamId === match.slotA.id;
    const pickedSets = pickedIsLeft ? (match.scoreLeft ?? 0) : (match.scoreRight ?? 0);
    return (pickedSets || 0) * 2;
};

export const getMatchWinnerTeam = (match) =>
    match?.played ? [match.slotA, match.slotB].find((team) => team?.id === match.winnerTeamId) ?? null : null;

export const getMatchLoserTeam = (match) =>
    match?.played ? [match.slotA, match.slotB].find((team) => team?.id === match.loserTeamId) ?? null : null;
