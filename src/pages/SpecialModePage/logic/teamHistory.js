import { decodeMiniRounds } from "./series.js";
import { hallRecordTime } from "./hallOfFameDb.js";
import { matchTitleOf, matchSmallLabelOf } from "./matchLabels.js";
import { recordName, recordTier, overtimeBlocks } from "../progress/progressEngine.js";
import { PEM_BIG_TYPE_ID } from "./tournamentTypes.jsx";

const SWISS_STAGE_KEYS = ["stage1", "stage2", "stage3"];

const isPlayedMatch = (m) => !!m && typeof m === "object" && !!m.played && !m.bye && !!m.slotA?.id && !!m.slotB?.id;

const arraysOf = (holder) => Object.entries(holder || {}).filter(([, value]) => Array.isArray(value));

const playedAtOf = (match) => match?.ratingMeta?.debug?.playedAtMs ?? null;

export const matchSignature = (match) => `${match.id ?? ""}|${match.slotA?.id ?? ""}|${match.slotB?.id ?? ""}|${playedAtOf(match) ?? `${match.scoreLeft}-${match.scoreRight}`}`;

const collectFrom = (src, push) => {
    const list = (items, makeCtx) => (items || []).forEach((m, idx) => isPlayedMatch(m) && push(m, idx, makeCtx(m, idx)));

    SWISS_STAGE_KEYS.forEach((stageKey) => {
        const stage = src.stages?.[stageKey];
        Object.entries(stage?.matchesByNet || {}).forEach(([net, items]) =>
            list(items, (m) => ({ type: "swiss", stageKey, net, format: m.format ?? stage.format ?? null })),
        );
    });

    if (src.playoffs) {
        arraysOf(src.playoffs).forEach(([stage, items]) => list(items, () => ({ type: "playoffs", stage, kind: src.playoffs.kind ?? null })));
    }

    if (src.cst) {
        Object.entries(src.cst).forEach(([group, holder]) => list(holder?.matches, () => ({ type: "cstGroup", group })));
    }

    (src.gccMatchdays || []).forEach((day, dayIndex) => list(day, () => ({ type: "gccLeague", matchday: dayIndex + 1, dayIndex })));

    if (src.qualifier) {
        Object.entries(src.qualifier).forEach(([group, holder]) => {
            if (!holder || typeof holder !== "object" || Array.isArray(holder)) return;
            arraysOf(holder).forEach(([stage, items]) => list(items, () => ({ type: "qualifier", group, stage, owner: src.qualifierOwner ?? null })));
        });
    }

    if (src.pemMain) {
        Object.entries(src.pemMain).forEach(([group, holder]) => {
            if (!holder || typeof holder !== "object" || Array.isArray(holder)) return;
            arraysOf(holder).forEach(([stage, items]) => list(items, () => ({ type: "pemGroup", group, stage })));
        });
    }

    if (src.pemStage1) {
        Object.entries(src.pemStage1).forEach(([group, holder]) => {
            if (!holder || typeof holder !== "object" || Array.isArray(holder)) return;
            arraysOf(holder).forEach(([stage, items]) => list(items, () => ({ type: "pemStage1", group, stage })));
        });
    }

    if (src.ecl) arraysOf(src.ecl).forEach(([stage, items]) => list(items, () => ({ type: "ecl", stage })));

    if (src.skylines) {
        (src.skylines.rounds || []).forEach((round) =>
            (round.floors || []).forEach((floor, f) =>
                arraysOf(floor).forEach(([stage, items]) =>
                    list(items, (m) => ({ type: "skyline", stage, floor: m.floor ?? f + 1, round: m.round ?? round.round, ratingStage: `f${m.floor ?? f + 1}` })),
                ),
            ),
        );
        arraysOf(src.skylines.rooftop).forEach(([stage, items]) =>
            list(items, (m) => ({ type: "skyline", stage, floor: null, round: m.round ?? "roof", ratingStage: stage })),
        );
    }

    if (src.pgxCm) {
        arraysOf(src.pgxCm.playIn).forEach(([stage, items]) => list(items, (m) => ({ type: "pgxCm", section: "playIn", stage: m.stage ?? stage, group: m.group ?? null })));
        Object.entries(src.pgxCm.groups || {}).forEach(([group, holder]) =>
            arraysOf(holder).forEach(([stage, items]) => list(items, (m) => ({ type: "pgxCm", section: "groups", stage: m.stage ?? stage, group: m.group ?? group }))),
        );
        arraysOf(src.pgxCm.deciders).forEach(([stage, items]) => list(items, (m) => ({ type: "pgxCm", section: "deciders", stage: m.stage ?? stage, group: m.group ?? null })));
    }

    if (src.pgxIm) {
        arraysOf(src.pgxIm.entry).forEach(([stage, items]) => list(items, (m) => ({ type: "pgxIm", section: "entry", stage: m.stage ?? stage, group: null })));
        arraysOf(src.pgxIm.bracket).forEach(([stage, items]) => list(items, (m) => ({ type: "pgxIm", section: "bracket", stage: m.stage ?? stage, group: null })));
    }

    if (src.essLq) {
        Object.entries(src.essLq.ladders || {}).forEach(([group, ladder]) =>
            arraysOf(ladder).forEach(([stage, items]) => list(items, (m) => ({ type: "essLq", section: "ladders", stage: m.stage ?? stage, group: m.group ?? group }))),
        );
    }

    if (src.essCh) {
        Object.entries(src.essCh.groups || {}).forEach(([group, holder]) =>
            arraysOf(holder).forEach(([stage, items]) => list(items, (m) => ({ type: "essCh", section: "groups", stage: m.stage ?? stage, group: m.group ?? group }))),
        );
        arraysOf(src.essCh.playoffs).forEach(([stage, items]) => list(items, (m) => ({ type: "essCh", section: "playoffs", stage: m.stage ?? stage, group: null })));
    }

    if (src.essFin) arraysOf(src.essFin).forEach(([stage, items]) => list(items, (m) => ({ type: "essFin", section: "finals", stage: m.stage ?? stage, group: null })));

    if (src.swcSc) {
        Object.entries(src.swcSc.brackets || {}).forEach(([group, holder]) =>
            arraysOf(holder).forEach(([stage, items]) => list(items, (m) => ({ type: "swcSc", section: "brackets", stage: m.stage ?? stage, group: m.group ?? group }))),
        );
    }

    if (src.swcMain) {
        Object.entries(src.swcMain.groups || {}).forEach(([group, holder]) =>
            arraysOf(holder).forEach(([stage, items]) => list(items, (m) => ({ type: "swcMain", section: "groups", stage: m.stage ?? stage, group: m.group ?? group }))),
        );
        arraysOf(src.swcMain.playoffs).forEach(([stage, items]) => list(items, (m) => ({ type: "swcMain", section: "playoffs", stage: m.stage ?? stage, group: null })));
    }
};

const hallSourceOf = (record) => {
    const event = record.event;
    const base = { stages: record.stages, playoffs: record.playoffs };
    if (event === "cst") return { playoffs: record.playoffs, cst: record.groupStage };
    if (event === "gcc") return { playoffs: record.playoffs, gccMatchdays: record.league?.matchdays };
    if (event === "main") return { playoffs: record.playoffs, pemMain: record.groupStage, pemStage1: record.stage1 };
    if (event === "qualifier") return { qualifier: record.qualifier, qualifierOwner: record.owner ?? null };
    if (event === "ecl") return { ecl: record.bracket };
    if (event === "skylines") return { skylines: record.skylines };
    if (event === "pgxCm") return { pgxCm: record.candidate };
    if (event === "pgxIm") return { pgxIm: record.international };
    if (event === "essLq") return { essLq: record.ladder };
    if (event === "essCh") return { essCh: record.challenger };
    if (event === "ess") return { essFin: record.finals };
    if (event === "swcSc") return { swcSc: record.chase };
    if (event === "swc") return { swcMain: record.main };
    if (event === "pbs") return { playoffs: record.playoffs };
    return base;
};

const makeEntry = ({ match, idx, ctx, source, record = null, order, fallbackTime, isPemBig }) => {
    const playedAt = playedAtOf(match);
    return {
        key: `${source}:${record?.id ?? "live"}:${ctx.type}:${ctx.stageKey ?? ""}:${ctx.net ?? ""}:${ctx.group ?? ""}:${ctx.stage ?? ""}:${ctx.matchday ?? ""}:${match.id ?? idx}:${idx}`,
        match,
        idx,
        ctx,
        source,
        record,
        time: playedAt ?? fallbackTime,
        order,
        eventName: record ? recordName(record) : null,
        tier: record ? recordTier(record) : null,
        stageTitle: matchTitleOf(ctx),
        stageCaption: matchSmallLabelOf(ctx, isPemBig),
        signature: matchSignature(match),
    };
};

export const buildHallEntries = (hallOfFame) => {
    const entries = [];
    (hallOfFame || []).forEach((record) => {
        if (!record) return;
        const isPemBig = record.event === "main" && record.type === PEM_BIG_TYPE_ID;
        const recordTime = hallRecordTime(record);
        const local = [];
        collectFrom(hallSourceOf(record), (match, idx, ctx) => local.push({ match, idx, ctx }));
        local.forEach(({ match, idx, ctx }, i) =>
            entries.push(makeEntry({ match, idx, ctx, source: "hall", record, order: i, fallbackTime: recordTime - (local.length - i) * 1000, isPemBig })),
        );
    });
    return entries;
};

export const buildLiveEntries = (live, { isPemBig = false } = {}) => {
    const local = [];
    collectFrom(live || {}, (match, idx, ctx) => local.push({ match, idx, ctx }));
    const now = Date.now();
    return local.map(({ match, idx, ctx }, i) => makeEntry({ match, idx, ctx, source: "live", order: i, fallbackTime: now - (local.length - i) * 1000, isPemBig }));
};

const pushTo = (map, id, entry) => {
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(entry);
};

export const indexByTeam = (entries) => {
    const map = new Map();
    entries.forEach((entry) => {
        pushTo(map, String(entry.match.slotA.id), entry);
        pushTo(map, String(entry.match.slotB.id), entry);
    });
    return map;
};

const byNewest = (a, b) => b.time - a.time || b.order - a.order;

export const teamEntries = (hallIndex, liveEntries, teamId) => {
    const id = String(teamId);
    const hall = hallIndex?.get(id) || [];
    const seen = new Set(hall.map((entry) => entry.signature));
    const live = (liveEntries || []).filter(
        (entry) => (String(entry.match.slotA.id) === id || String(entry.match.slotB.id) === id) && !seen.has(entry.signature),
    );
    return [...hall, ...live].sort(byNewest);
};

const miniCache = new WeakMap();

const miniTotals = (match) => {
    if (miniCache.has(match)) return miniCache.get(match);
    const totals = { left: 0, right: 0, count: 0, peakLeft: 0, peakRight: 0, wonLeft: 0, wonRight: 0 };
    (match.setHistory || []).forEach((set) =>
        (set.roundLog || []).forEach((round) =>
            decodeMiniRounds(round.minis).forEach((mini) => {
                totals.left += mini.left;
                totals.right += mini.right;
                totals.count += 1;
                totals.peakLeft = Math.max(totals.peakLeft, mini.left);
                totals.peakRight = Math.max(totals.peakRight, mini.right);
                if (mini.winner === "left") totals.wonLeft += 1;
                else if (mini.winner === "right") totals.wonRight += 1;
            }),
        ),
    );
    miniCache.set(match, totals);
    return totals;
};

const bestOfOf = (match) => {
    const fromMeta = match.ratingMeta?.debug?.bestOf;
    if (fromMeta) return fromMeta;
    const sets = match.setHistory?.length ?? 0;
    const top = Math.max(match.scoreLeft ?? 0, match.scoreRight ?? 0);
    if (sets <= 1 && top > 1) return 1;
    return Math.max(1, top * 2 - 1, sets);
};

const viewCache = new WeakMap();

export const teamView = (entry, teamId) => {
    const id = String(teamId);
    const match = entry.match;
    let perMatch = viewCache.get(match);
    if (!perMatch) {
        perMatch = new Map();
        viewCache.set(match, perMatch);
    }
    if (perMatch.has(id)) return perMatch.get(id);

    const isSlotA = String(match.slotA.id) === id;
    const team = isSlotA ? match.slotA : match.slotB;
    const opponent = isSlotA ? match.slotB : match.slotA;
    const historyLeftId = String(match.pickTeamId ?? match.slotA.id);
    const isHistoryLeft = historyLeftId === id;
    const tie = !!match.isTie || !!match.ratingMeta?.tie || (!match.winnerTeamId && !!match.played);
    const result = tie ? "T" : String(match.winnerTeamId) === id ? "W" : "L";
    const bestOf = bestOfOf(match);

    const sets = (match.setHistory || []).map((set) => {
        const mine = isHistoryLeft ? set.wins ?? 0 : set.losses ?? 0;
        const theirs = isHistoryLeft ? set.losses ?? 0 : set.wins ?? 0;
        const pens = set.extendedRounds?.penalties
            ? {
                mine: isHistoryLeft ? set.extendedRounds.penalties.leftScore : set.extendedRounds.penalties.rightScore,
                theirs: isHistoryLeft ? set.extendedRounds.penalties.rightScore : set.extendedRounds.penalties.leftScore,
            }
            : null;
        const level = (set.wins ?? 0) === (set.losses ?? 0);
        const trueTie = !!set.tie;
        const won = trueTie ? null : isHistoryLeft ? !!set.won : !set.won;
        return {
            mine,
            theirs,
            won,
            tie: trueTie,
            ot: overtimeBlocks(set.wins, set.losses),
            er: level && !trueTie && !pens,
            pens,
        };
    });

    const setsWon = sets.filter((set) => set.won === true).length;
    const setsLost = sets.filter((set) => set.won === false).length;
    const seriesMine = bestOf === 1 ? sets[0]?.mine ?? (isSlotA ? match.scoreLeft : match.scoreRight) : isSlotA ? match.scoreLeft ?? setsWon : match.scoreRight ?? setsWon;
    const seriesTheirs = bestOf === 1 ? sets[0]?.theirs ?? (isSlotA ? match.scoreRight : match.scoreLeft) : isSlotA ? match.scoreRight ?? setsLost : match.scoreLeft ?? setsLost;

    const minis = miniTotals(match);
    const multiplierSum = isHistoryLeft ? minis.left : minis.right;
    const opponentMultiplierSum = isHistoryLeft ? minis.right : minis.left;
    const before = match.ratingMeta?.before ?? {};
    const after = match.ratingMeta?.after ?? {};
    const pointsBefore = before[id]?.points ?? null;
    const pointsAfter = after[id]?.points ?? null;

    const view = {
        entry,
        team,
        opponent,
        result,
        bestOf,
        sets,
        setsWon,
        setsLost,
        seriesMine,
        seriesTheirs,
        roundsFor: sets.reduce((sum, set) => sum + set.mine, 0),
        roundsAgainst: sets.reduce((sum, set) => sum + set.theirs, 0),
        miniCount: minis.count,
        multiplierSum,
        opponentMultiplierSum,
        avgMultiplier: minis.count ? multiplierSum / minis.count : null,
        opponentAvgMultiplier: minis.count ? opponentMultiplierSum / minis.count : null,
        peakMultiplier: isHistoryLeft ? minis.peakLeft : minis.peakRight,
        minisWon: isHistoryLeft ? minis.wonLeft : minis.wonRight,
        otSets: sets.filter((set) => set.ot > 0).length,
        otSetsWon: sets.filter((set) => set.ot > 0 && set.won).length,
        decider: bestOf > 1 && sets.length === bestOf,
        comeback: result === "W" && bestOf > 1 && sets[0]?.won === false,
        sweep: result === "W" && bestOf > 1 && setsLost === 0,
        pointsBefore,
        pointsAfter,
        pointsDelta: pointsBefore != null && pointsAfter != null ? pointsAfter - pointsBefore : null,
        rankBefore: before[id]?.rank ?? null,
        rankAfter: after[id]?.rank ?? null,
        opponentRank: before[String(opponent.id)]?.rank ?? null,
        upset: result === "W" && before[id]?.rank != null && before[String(opponent.id)]?.rank != null && before[String(opponent.id)].rank < before[id].rank,
    };
    perMatch.set(id, view);
    return view;
};

export const teamStatsOf = (views) => {
    const played = views.length;
    const wins = views.filter((v) => v.result === "W").length;
    const losses = views.filter((v) => v.result === "L").length;
    const ties = played - wins - losses;
    const setsWon = views.reduce((sum, v) => sum + v.setsWon, 0);
    const setsLost = views.reduce((sum, v) => sum + v.setsLost, 0);
    const roundsFor = views.reduce((sum, v) => sum + v.roundsFor, 0);
    const roundsAgainst = views.reduce((sum, v) => sum + v.roundsAgainst, 0);
    const miniCount = views.reduce((sum, v) => sum + v.miniCount, 0);
    const multiplierSum = views.reduce((sum, v) => sum + v.multiplierSum, 0);
    const minisWon = views.reduce((sum, v) => sum + v.minisWon, 0);
    const opponentMultiplierSum = views.reduce((sum, v) => sum + v.opponentMultiplierSum, 0);
    const otSets = views.reduce((sum, v) => sum + v.otSets, 0);
    const otSetsWon = views.reduce((sum, v) => sum + v.otSetsWon, 0);
    const deciders = views.filter((v) => v.decider);
    const series = views.filter((v) => v.bestOf > 1);

    let streak = 0;
    let streakType = null;
    for (const v of views) {
        if (!streakType) streakType = v.result;
        if (v.result !== streakType) break;
        streak += 1;
    }

    let bestRun = 0;
    let run = 0;
    [...views].reverse().forEach((v) => {
        run = v.result === "W" ? run + 1 : 0;
        bestRun = Math.max(bestRun, run);
    });

    const opponents = new Map();
    views.forEach((v) => {
        const key = String(v.opponent.id);
        const row = opponents.get(key) ?? { team: v.opponent, played: 0, wins: 0, losses: 0 };
        row.played += 1;
        if (v.result === "W") row.wins += 1;
        if (v.result === "L") row.losses += 1;
        opponents.set(key, row);
    });
    const opponentRows = [...opponents.values()];
    const nemesis = opponentRows.filter((row) => row.losses > 0).sort((a, b) => b.losses - a.losses || a.wins - b.wins || b.played - a.played)[0] ?? null;
    const favourite = opponentRows.filter((row) => row.wins > 0).sort((a, b) => b.wins - a.wins || a.losses - b.losses || b.played - a.played)[0] ?? null;

    const deltas = views.map((v) => v.pointsDelta).filter((d) => d != null);

    return {
        played,
        wins,
        losses,
        ties,
        winRate: played ? wins / played : null,
        setsWon,
        setsLost,
        setRate: setsWon + setsLost ? setsWon / (setsWon + setsLost) : null,
        roundsFor,
        roundsAgainst,
        roundDiff: roundsFor - roundsAgainst,
        avgMultiplier: miniCount ? multiplierSum / miniCount : null,
        opponentAvgMultiplier: miniCount ? opponentMultiplierSum / miniCount : null,
        peakMultiplier: views.reduce((max, v) => Math.max(max, v.peakMultiplier || 0), 0) || null,
        miniRate: miniCount ? minisWon / miniCount : null,
        otSets,
        otSetsWon,
        deciders: deciders.length,
        decidersWon: deciders.filter((v) => v.result === "W").length,
        seriesPlayed: series.length,
        seriesWon: series.filter((v) => v.result === "W").length,
        bo1Played: played - series.length,
        bo1Won: views.filter((v) => v.bestOf === 1 && v.result === "W").length,
        comebacks: views.filter((v) => v.comeback).length,
        sweeps: views.filter((v) => v.sweep).length,
        upsets: views.filter((v) => v.upset).length,
        streak,
        streakType,
        bestRun,
        pointsChange: deltas.reduce((sum, d) => sum + d, 0),
        events: new Set(views.map((v) => v.entry.record?.id ?? "live")).size,
        nemesis,
        favourite,
    };
};

export const formatMultiplier = (value) => (value == null ? "—" : `×${value.toFixed(2)}`);
export const formatPct = (value) => (value == null ? "—" : `${Math.round(value * 100)}%`);
export const formatSigned = (value) => (value == null ? "—" : value > 0 ? `+${value}` : `${value}`);

const RED = [211, 47, 47];
const GRAY = [107, 110, 124];
const GREEN = [46, 125, 50];
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t)))).join(", ")})`;

export const NEUTRAL_COLOR = "#2e2f42";

export const pctColor = (value) => {
    if (value == null || Number.isNaN(value)) return mix(GRAY, GRAY, 0);
    if (value <= 0.25) return mix(RED, RED, 0);
    if (value < 0.5) return mix(RED, GRAY, (value - 0.25) / 0.25);
    if (value < 0.6) return mix(GRAY, GREEN, (value - 0.5) / 0.1);
    return mix(GREEN, GREEN, 0);
};

export const ratioColor = (good, total) => (total ? pctColor(good / total) : mix(GRAY, GRAY, 0));

export const signedColor = (value) => (value > 0 ? mix(GREEN, GREEN, 0) : value < 0 ? mix(RED, RED, 0) : mix(GRAY, GRAY, 0));

export const countColor = (value) => (value > 0 ? mix(GREEN, GREEN, 0) : mix(GRAY, GRAY, 0));

export const multiplierColor = (mine, theirs) => (mine == null || theirs == null ? mix(GRAY, GRAY, 0) : pctColor(0.5 + (mine - theirs) * 1.5));

export const resultColor = (result) => (result === "W" ? mix(GREEN, GREEN, 0) : result === "L" ? mix(RED, RED, 0) : mix(GRAY, GRAY, 0));

export const matchMultipliers = (match) => {
    if (!match?.slotA || !match?.slotB) return null;
    const totals = miniTotals(match);
    if (!totals.count) return null;
    const leftId = String(match.pickTeamId ?? match.slotA.id);
    const rightId = String(leftId === String(match.slotA.id) ? match.slotB.id : match.slotA.id);
    return {
        count: totals.count,
        [leftId]: { avg: totals.left / totals.count, peak: totals.peakLeft, won: totals.wonLeft },
        [rightId]: { avg: totals.right / totals.count, peak: totals.peakRight, won: totals.wonRight },
    };
};
