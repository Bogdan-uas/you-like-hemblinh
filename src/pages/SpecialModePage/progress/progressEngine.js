import { applyTaskRun } from "./tasks.js";
import {
    ACHIEVEMENTS,
    FAVORITE_CHANCE,
    FLAWLESS_MIN,
    LONG_SHOT_CHANCE,
    PERFECT_ROUND_MIN,
    PROGRESS_VERSION,
    STREAK_STEP,
    TIERS,
    UPSET_CHANCE,
    XP,
    achievementXp,
    isTiered,
    levelInfo,
    perksForLevel,
    PERK_MILESTONES,
    CIRCUIT_IDS,
    LEGENDARY_IDS,
} from "./progressConfig.js";
import { resolvePickPerks } from "./pickPerks.js";
import { formatTournamentNumber, getTournamentTypeConfig, PEM_BIG_TYPE_ID, PEM_SMALL_TYPE_ID } from "../logic/tournamentTypes.jsx";
import { TOURNAMENT_TIERS } from "../logic/tournamentTiers.jsx";
import { getAnniversaryTheme } from "../logic/winnersAndPickem.js";

export const emptyStats = () => ({
    seriesPlayed: 0,
    correctPicks: 0,
    upsetPicks: 0,
    streak: 0,
    bestStreak: 0,
    overtimes: 0,
    grandFinals: 0,
    eventsFinished: 0,
    mainFinished: 0,
    pickemWon: 0,
    pgxCities: [],
    maxNumber: 0,
    mainTypes: [],
    mainWinners: [],
    setsPlayed: 0,
    comebacks: 0,
    sweeps: 0,
    deciders: 0,
    longShots: 0,
    favoritesCorrect: 0,
    grandFinalsCorrect: 0,
    erSets: 0,
    penaltySets: 0,
    bagels: 0,
    coldStreak: 0,
    pickemPoints: 0,
    perkPoints: 0,
    insurancePaid: 0,
    neededCuts: 0,
    pickemStreak: 0,
    bestPickemStreak: 0,
    championsGuessed: 0,
    perfectRounds: 0,
    champions: [],
    tierCounts: {},
    kindCounts: {},
    eventKinds: [],
    daysPlayed: 0,
    lastDay: null,
    closeSets: 0,
    shieldSaves: 0,
    boostXp: 0,
    overtimeBonusPoints: 0,
    knockoutBonusPoints: 0,
    championStreak: 0,
    eventCounts: {},
});

export const BACKFILL_STAT_KEYS_BY_VERSION = {
    3: ["closeSets", "eventCounts", "championStreak", "mainWinners"],
};

export const BACKFILL_STAT_KEYS = [
    "setsPlayed",
    "comebacks",
    "sweeps",
    "deciders",
    "grandFinalsCorrect",
    "erSets",
    "penaltySets",
    "bagels",
    "pickemPoints",
    "pickemStreak",
    "bestPickemStreak",
    "championsGuessed",
    "champions",
    "tierCounts",
    "kindCounts",
    "eventKinds",
    "daysPlayed",
    "lastDay",
];

export const emptyProgress = () => ({
    v: PROGRESS_VERSION,
    xp: 0,
    stats: emptyStats(),
    achievements: {},
    event: null,
    activePick: null,
    pendingSummary: null,
    lastSummary: null,
    catchUpDone: false,
});

export const normalizeProgress = (raw) => {
    const base = emptyProgress();
    if (!raw || typeof raw !== "object") return base;
    const legacyPending = raw.pendingSummary && typeof raw.pendingSummary === "object" ? raw.pendingSummary : null;
    return {
        ...base,
        ...raw,
        v: raw.v ?? 1,
        stats: { ...base.stats, ...(raw.stats || {}) },
        achievements: { ...(raw.achievements || {}) },
        lastSummary: legacyPending ?? raw.lastSummary ?? null,
        pendingSummary: legacyPending ? legacyPending.id : raw.pendingSummary ?? null,
    };
};

let gainCounter = 0;
const makeGain = (source, label, xp, detail = "") => ({ id: `${Date.now().toString(36)}-${(gainCounter++).toString(36)}`, source, label, xp, detail, at: Date.now() });

const newEvent = (xp) => ({ startXp: xp, gains: [], series: 0, correctCount: 0, simulated: false, insuranceUsed: 0, shieldsUsed: 0, rounds: {}, lastCorrect: null, perkUses: [] });

const withEvent = (state) => (state.event ? state : { ...state, event: newEvent(state.xp) });

const pushGains = (state, gains) => {
    if (!gains.length) return state;
    const xp = gains.reduce((sum, g) => sum + g.xp, 0);
    const event = state.event ? { ...state.event, gains: [...state.event.gains, ...gains] } : state.event;
    return { ...state, xp: state.xp + xp, event };
};

const withBoost = (gains, state, detail) => {
    const boost = perksForLevel(levelInfo(state.xp).level).xpBoost;
    if (!boost || !gains.length) return gains;
    const extra = Math.round((gains.reduce((sum, g) => sum + g.xp, 0) * boost) / 100);
    return extra > 0 ? [...gains, makeGain("boost", `XP boost (+${boost}%)`, extra, detail)] : gains;
};

const boostXpOf = (gains) => gains.filter((g) => g.source === "boost" || g.source === "achievementBoost").reduce((sum, g) => sum + g.xp, 0);

const reachedMilestones = (xp) => {
    const level = levelInfo(xp).level;
    return PERK_MILESTONES.filter((m) => m.level <= level).length;
};

const achievementSteps = (achievements) =>
    Object.entries(achievements).reduce((sum, [id, record]) => (id === "completionist" ? sum : sum + (record?.tier ?? 0)), 0);

const statValue = (state, key) => {
    const stats = state.stats;
    if (key === "pgxCityCount") return stats.pgxCities?.length ?? 0;
    if (key === "mainTypeCount") return stats.mainTypes?.length ?? 0;
    if (key === "championCount") return stats.champions?.length ?? 0;
    if (key === "level") return levelInfo(state.xp).level;
    if (key === "xpTotal") return state.xp;
    if (key === "achievementSteps") return achievementSteps(state.achievements);
    if (key.startsWith("tier:")) return stats.tierCounts?.[key.slice(5)] ?? 0;
    if (key.startsWith("kind:")) return stats.kindCounts?.[key.slice(5)] ?? 0;
    if (key.startsWith("event:")) return stats.eventCounts?.[key.slice(6)] ?? 0;
    if (key === "eventKindCount") return stats.eventKinds?.length ?? 0;
    if (key === "perkMilestones") return reachedMilestones(state.xp);
    if (key === "circuitGolds") return CIRCUIT_IDS.filter((id) => (state.achievements[id]?.tier ?? 0) >= 3).length;
    if (key === "legendaryUnlocked") return LEGENDARY_IDS.filter((id) => (state.achievements[id]?.tier ?? 0) > 0).length;
    return stats[key] ?? 0;
};

export const achievementValue = statValue;

const unlockGain = (a, tierIndex) => {
    const tier = isTiered(a) ? TIERS[tierIndex] : null;
    return { ...makeGain("achievement", `${a.name}${tier ? ` · ${tier.label}` : ""}`, achievementXp(a, tierIndex), "Achievement"), unlock: { id: a.id, tier: tier ? tierIndex : -1 } };
};

const gainXp = (list) => list.reduce((sum, g) => sum + g.xp, 0);

const finishWithTasks = (evaluated, levelBefore, baseGains, facts) => {
    const run = applyTaskRun(evaluated.state, {
        ...facts,
        taskBoost: perksForLevel(levelInfo(evaluated.state.xp).level).taskBoost,
        xp: gainXp(baseGains) + gainXp(evaluated.gains),
        achSteps: evaluated.unlocked.length,
        levelUps: Math.max(0, levelInfo(evaluated.state.xp).level - levelBefore),
    });
    if (!run.gains.length) return { state: run.state, gains: evaluated.gains, unlocked: evaluated.unlocked };
    const boostXp = run.gains.reduce((sum, g) => sum + (g.task?.boostXp ?? 0), 0);
    const boosted = boostXp ? { ...run.state, stats: { ...run.state.stats, boostXp: (run.state.stats.boostXp ?? 0) + boostXp } } : run.state;
    const again = evaluateAchievements(pushGains(boosted, run.gains), new Set());
    return { state: again.state, gains: [...run.gains, ...evaluated.gains, ...again.gains], unlocked: [...evaluated.unlocked, ...again.unlocked] };
};

const evaluateAchievements = (input, flags) => {
    let state = input;
    const unlocked = [];
    const gains = [];
    for (let pass = 0; pass < 6; pass++) {
        const achievements = { ...state.achievements };
        const passGains = [];
        const at = new Date().toISOString();
        for (const a of ACHIEVEMENTS) {
            const current = achievements[a.id]?.tier ?? 0;
            if (isTiered(a)) {
                const value = statValue({ ...state, achievements }, a.stat);
                const reached = a.tiers.filter((t) => value >= t).length;
                for (let t = current; t < reached; t++) {
                    unlocked.push({ id: a.id, tier: t });
                    passGains.push(unlockGain(a, t));
                }
                if (reached > current) achievements[a.id] = { tier: reached, at, seen: false };
            } else if (!current) {
                const hit = a.once != null ? statValue({ ...state, achievements }, a.stat) >= a.once : flags.has(a.id);
                if (hit) {
                    unlocked.push({ id: a.id, tier: -1 });
                    passGains.push(unlockGain(a, 0));
                    achievements[a.id] = { tier: 1, at, seen: false };
                }
            }
        }
        if (!passGains.length) break;
        const boost = perksForLevel(levelInfo(state.xp).level).achievementBoost;
        const extra = boost ? Math.round((passGains.reduce((sum, g) => sum + g.xp, 0) * boost) / 100) : 0;
        const boostGains = extra > 0 ? [makeGain("achievementBoost", `Achievement boost (+${boost}%)`, extra, "Achievement")] : [];
        state = pushGains({ ...state, achievements, stats: { ...state.stats, boostXp: (state.stats.boostXp ?? 0) + extra } }, [...passGains, ...boostGains]);
        gains.push(...passGains, ...boostGains);
    }
    return { state, unlocked, gains };
};

export const overtimeBlocks = (left, right) => {
    const top = Math.max(left ?? 0, right ?? 0);
    return top >= 16 ? Math.ceil((top - 13) / 3) : 0;
};

export const basePickemPoints = (bestOf, correct, pickedSets) => (correct ? bestOf : bestOf === 1 ? 0 : (pickedSets || 0) * 2);

const dayKey = (ms) => {
    const d = new Date(ms);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const PERK_LABELS = {
    gfBonus: "Grand Final bonus",
    upsetBonus: "Upset bonus",
    longShotBonus: "Long shot bonus",
    streakBonus: "Streak bonus",
    comebackBonus: "Comeback bonus",
    sweepBonus: "Sweep bonus",
    overtimeBonus: "Overtime bonus",
    deciderBonus: "Decider bonus",
    knockoutBonus: "Knockout bonus",
    longSeriesBonus: "Long series bonus",
    insurance: "Pick'em Insurance",
    bonusMissed: "Level bonus not activated",
};

export const perkUseLabel = (type) => PERK_LABELS[type] ?? type;

export const applySeries = (input, seriesInfo) => {
    let state = withEvent(input);
    const pick = state.activePick;
    const info = {
        ...seriesInfo,
        bestOf: pick?.bestOf ?? seriesInfo.bestOf,
        stage: pick?.stage ?? seriesInfo.stage ?? null,
        knockout: pick?.knockout ?? seriesInfo.knockout ?? false,
        roundKey: pick?.roundKey ?? seriesInfo.roundKey ?? null,
    };
    const at = info.at ?? Date.now();
    const perks = perksForLevel(levelInfo(state.xp).level);
    const stats = { ...state.stats };
    const flags = new Set();
    const gains = [];
    const detail = info.detail ?? `${pick?.label ? `${pick.label} — ` : ""}${info.pickedName ?? "?"} ${info.pickedSets}:${info.otherSets} ${info.otherName ?? "?"}`;
    const sets = info.sets || [];
    const setsWon = sets.map((set) => set.winner === "left");
    const correct = !info.tie && info.pickedSets > info.otherSets;
    const chance = pick?.chance ?? null;
    const base = basePickemPoints(info.bestOf, correct, info.pickedSets);
    const setScores = sets.map((set) => ({ left: set.left ?? 0, right: set.right ?? 0 }));
    const resolved = resolvePickPerks({ correct, bestOf: info.bestOf, base, setsWon, setScores, perks: pick });
    const points = resolved.points;

    gains.push(makeGain("series", "Series played", XP.series + XP.extraSet * Math.max(0, sets.length - 1), detail));
    if (points > 0) gains.push(makeGain("pickem", `Pick'em points (${points})`, points * XP.pickemPoint, detail));

    const upset = correct && chance != null && chance <= UPSET_CHANCE;
    const longShot = correct && chance != null && chance <= LONG_SHOT_CHANCE;
    const comeback = correct && info.bestOf >= 3 && setsWon[0] === false;
    const sweep = correct && info.bestOf >= 3 && setsWon.length > 0 && setsWon.every(Boolean);
    const decider = !info.tie && info.bestOf >= 3 && sets.length >= info.bestOf;
    if (upset) gains.push(makeGain("upset", `Upset pick (${Math.round(chance * 100)}%)`, XP.upset, detail));
    if (longShot) gains.push(makeGain("longShot", `Long shot (${Math.round(chance * 100)}%)`, XP.longShot, detail));
    if (comeback) gains.push(makeGain("comeback", "Comeback", XP.comeback, detail));
    if (sweep) gains.push(makeGain("sweep", "Sweep", XP.sweep, detail));
    if (decider) gains.push(makeGain("decider", "Down to the wire", XP.decider, detail));
    if (info.stage === "gf") gains.push(makeGain("grandFinal", "Grand Final", XP.grandFinal, detail));

    let blocks = 0;
    let overtimeSets = 0;
    sets.forEach((set) => {
        const b = overtimeBlocks(set.left, set.right);
        blocks += b;
        if (b > 0) overtimeSets += 1;
        if (b >= 2) flags.add("doubleTrouble");
        if (b >= 3) flags.add("tripleThreat");
        if (Math.max(set.left ?? 0, set.right ?? 0) >= 25 && !set.er) flags.add("endlessSet");
        if (!set.er && Math.max(set.left ?? 0, set.right ?? 0) === 13 && Math.min(set.left ?? 0, set.right ?? 0) === 11) stats.closeSets = (stats.closeSets ?? 0) + 1;
        if (set.er) {
            gains.push(makeGain("extendedRounds", "Extended Rounds", XP.extendedRounds, detail));
            flags.add("tiebreaker");
            stats.erSets += 1;
        }
        if (set.pens) {
            gains.push(makeGain("penalties", "Penalties", XP.penalties, detail));
            flags.add("spotKick");
            stats.penaltySets += 1;
        }
        if (Math.max(set.left, set.right) === 13 && Math.min(set.left, set.right) === 0) {
            gains.push(makeGain("bagel", `Bagel (${set.left}-${set.right})`, XP.bagel, detail));
            flags.add("bagel");
            stats.bagels += 1;
        }
    });
    if (blocks) gains.push(makeGain("overtime", blocks === 1 ? "Overtime" : `Overtimes ×${blocks}`, XP.overtime * blocks, detail));
    if (sets.length >= 2 && overtimeSets === sets.length) flags.add("nailBiter");

    const event = { ...state.event, perkUses: [...(state.event.perkUses || [])] };
    stats.seriesPlayed += 1;
    stats.setsPlayed += sets.length;
    stats.overtimes += blocks;
    stats.pickemPoints += points;
    if (info.stage === "gf") stats.grandFinals += 1;
    if (correct) {
        stats.correctPicks += 1;
        stats.streak += 1;
        stats.coldStreak = 0;
        stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
        if (stats.streak % STREAK_STEP === 0) gains.push(makeGain("streak", `Pick streak (${stats.streak} in a row)`, XP.streak, detail));
        if (info.stage === "gf") stats.grandFinalsCorrect += 1;
        if (chance != null && chance >= FAVORITE_CHANCE) stats.favoritesCorrect += 1;
        if (chance != null && chance >= 0.48 && chance <= 0.52) flags.add("coinFlip");
    } else {
        stats.coldStreak += 1;
        if (stats.coldStreak >= 6) flags.add("roughPatch");
        if (stats.streak > 0 && (event.shieldsUsed ?? 0) < perks.streakShield) {
            event.shieldsUsed = (event.shieldsUsed ?? 0) + 1;
            event.perkUses.push({ type: "streakShield", points: 0, detail });
            flags.add("secondWind");
            stats.shieldSaves = (stats.shieldSaves ?? 0) + 1;
        } else {
            stats.streak = 0;
        }
    }
    if (upset) {
        stats.upsetPicks += 1;
        event.upsets = (event.upsets ?? 0) + 1;
    }
    if (blocks >= 3) flags.add("endurance");
    if (blocks >= 8) flags.add("theEpic");
    if (sets.filter((set) => set.pens).length >= 2) flags.add("penaltyDrama");
    if (!info.tie && info.bestOf === 7 && sets.length === 7) flags.add("sevenWonders");
    if (sets.length >= 2 && sets.every((set) => !set.er && Math.abs((set.left ?? 0) - (set.right ?? 0)) >= 8)) flags.add("blowout");
    const hour = new Date(at).getHours();
    if (hour < 5) flags.add("nightOwl");
    else if (hour < 8) flags.add("earlyBird");
    if (longShot) stats.longShots += 1;
    if (comeback) stats.comebacks += 1;
    if (sweep) stats.sweeps += 1;
    if (decider) stats.deciders += 1;
    if (longShot) flags.add("againstAllOdds");
    if (correct && info.stage === "gf" && chance != null && chance <= UPSET_CHANCE) flags.add("underdogChampion");

    const top = Math.max(info.pickedSets, info.otherSets);
    const low = Math.min(info.pickedSets, info.otherSets);
    if (!info.tie && info.bestOf === 5 && top === 3 && low === 2) {
        const winnerSide = info.pickedSets > info.otherSets ? "left" : "right";
        if (sets[0]?.winner && sets[1]?.winner && sets[0].winner !== winnerSide && sets[1].winner !== winnerSide) flags.add("reverseSweep");
    }
    if (!info.tie && info.bestOf === 9 && top === 5 && low === 4) flags.add("fullDistance");
    if (!info.tie && info.bestOf >= 7 && low === 0 && top > 0) flags.add("cleanSweep");

    resolved.uses.forEach((use) => event.perkUses.push({ ...use, detail }));
    (resolved.missed || []).forEach((miss) => event.perkUses.push({ type: "bonusMissed", bonus: miss.type, reason: miss.reason, points: 0, detail }));
    const bonusPoints = resolved.uses.filter((use) => use.type !== "insurance").reduce((sum, use) => sum + use.points, 0);
    stats.perkPoints += resolved.uses.reduce((sum, use) => sum + use.points, 0);
    stats.overtimeBonusPoints = (stats.overtimeBonusPoints ?? 0) + resolved.uses.filter((use) => use.type === "overtimeBonus").reduce((sum, use) => sum + use.points, 0);
    stats.knockoutBonusPoints = (stats.knockoutBonusPoints ?? 0) + resolved.uses.filter((use) => use.type === "knockoutBonus").reduce((sum, use) => sum + use.points, 0);
    if (bonusPoints >= 3) flags.add("luckyCharm");
    if (resolved.insurance === "paid") {
        stats.insurancePaid += 1;
        flags.add("insured");
        event.insurancePaid = (event.insurancePaid ?? 0) + 1;
        if (event.insurancePaid >= 3) flags.add("fullyInsured");
    }
    if (resolved.insurance === "returned") {
        event.insuranceUsed = Math.max(0, (event.insuranceUsed ?? 0) - 1);
        event.perkUses.push({ type: "insuranceReturned", points: 0, detail });
    }

    const day = dayKey(at);
    if (stats.lastDay !== day) {
        stats.lastDay = day;
        stats.daysPlayed += 1;
        gains.push(makeGain("daily", "Daily warm-up", XP.daily, detail));
    }

    event.series += 1;
    event.correctCount = (event.correctCount ?? 0) + (correct ? 1 : 0);
    event.lastCorrect = correct;
    if (info.knockout && info.roundKey) {
        const round = event.rounds[info.roundKey] ?? { total: 0, correct: 0 };
        event.rounds = { ...event.rounds, [info.roundKey]: { total: round.total + 1, correct: round.correct + (correct ? 1 : 0) } };
    }

    const allGains = withBoost(gains, state, detail);
    stats.boostXp = (stats.boostXp ?? 0) + boostXpOf(allGains);
    const levelBefore = levelInfo(state.xp).level;
    state = pushGains({ ...state, stats, event, activePick: null }, allGains);
    const isBagel = (set) => Math.max(set.left ?? 0, set.right ?? 0) === 13 && Math.min(set.left ?? 0, set.right ?? 0) === 0;
    const evaluated = finishWithTasks(evaluateAchievements(state, flags), levelBefore, allGains, {
        kind: "series",
        bestOf: info.bestOf,
        knockout: !!info.knockout,
        gf: info.stage === "gf",
        correct,
        chance,
        upset,
        longShot,
        points,
        sets: sets.length,
        setsWon: setsWon.filter(Boolean).length,
        sweep,
        comeback,
        decider,
        overtimes: blocks,
        otSets: overtimeSets,
        maxOtSet: sets.reduce((max, set) => Math.max(max, overtimeBlocks(set.left, set.right)), 0),
        er: sets.filter((set) => set.er).length,
        pens: sets.filter((set) => set.pens).length,
        bagels: sets.filter(isBagel).length,
        closeSets: sets.filter((set) => !set.er && Math.max(set.left ?? 0, set.right ?? 0) === 13 && Math.min(set.left ?? 0, set.right ?? 0) === 11).length,
        blowoutSets: sets.filter((set) => !set.er && Math.abs((set.left ?? 0) - (set.right ?? 0)) >= 8).length,
        insured: !!pick?.insured,
        insurancePaid: resolved.insurance === "paid",
        bonusPoints,
        streak: stats.streak,
    });
    return {
        state: evaluated.state,
        gains: [...allGains, ...evaluated.gains],
        unlocked: evaluated.unlocked,
        pick: { points, base, insurance: resolved.insurance, payout: resolved.payout, uses: resolved.uses, missed: resolved.missed || [] },
    };
};

export const recordTier = (record) => {
    const event = record?.event;
    if (!event) return "official";
    if (event === "qualifier" || event === "pgxCm" || event === "essLq" || event === "swcSc") return "qualifier";
    if (["cst", "ecl", "gcc", "skylines"].includes(event)) return "tier2";
    if (event === "essCh" || event === "pgxIm") return "tier15";
    return "tier1";
};

export const mainKindOf = (record) => {
    const event = record?.event;
    if (!event) return "official";
    if (event === "main") return record.type === PEM_BIG_TYPE_ID ? "pemBig" : record.type === PEM_SMALL_TYPE_ID ? "pemSmall" : "pemSmall";
    if (["gpl", "pbs", "pgxGm", "ess", "swc"].includes(event)) return event;
    return null;
};

const circuitOf = (record) => {
    const event = record?.event;
    if (!event) return "official";
    if (event === "main") return "pem";
    if (event === "pgxGm") return "pgx";
    if (["gpl", "pbs", "ess", "swc", "skylines", "gcc"].includes(event)) return event;
    return null;
};

const eventKindOf = (record) => (record?.event ? `${record.event}${record.event === "main" ? `:${mainKindOf(record)}` : ""}` : "official");

export const recordName = (record) => {
    if (!record) return "Tournament";
    const config = getTournamentTypeConfig(record.type);
    const number = formatTournamentNumber(record.type, record.number);
    if (record.event === "qualifier" && record.owner) return `${config.label} Open Qualifier ${number}`;
    if (record.event === "qualifier") return `${config.label} Qualifier ${number}`;
    if (record.city) return `${config.label} ${record.city} ${number}`;
    return `${config.label} ${number}`;
};

const isAnniversaryNumber = (number) => Number(number) >= 5 && !!getAnniversaryTheme(Number(number));

const winnerOf = (record) => record?.results?.winner ?? null;

const pbsChampionBounty = (record) => {
    const winner = winnerOf(record);
    const gf = record?.playoffs?.gf?.[0];
    return winner ? gf?.pbsMeta?.after?.[winner.id]?.bounty ?? 0 : 0;
};

const storyFlags = (record) => {
    const flags = new Set();
    const winner = winnerOf(record);
    if (record.event === "essLq") {
        Object.values(record.ladder?.ladders || {}).forEach((ladder) => {
            const bottom = ladder?.[ladder?.order?.[0]]?.[0];
            const top = ladder?.top?.[0];
            const champion = top?.played ? [top.slotA, top.slotB].find((t) => t?.id === top.winnerTeamId) : null;
            if (champion && bottom && [bottom.slotA?.id, bottom.slotB?.id].includes(champion.id)) flags.add("fromTheBottom");
        });
    }
    if (record.event === "pgxCm") {
        const playIn = new Set((record.candidate?.playIn?.teams || []).map((t) => t.id));
        if ((record.qualifiers || []).some((t) => playIn.has(t.id))) flags.add("fromTheBottom");
    }
    if (winner) {
        if (record.event === "ess" && (record.chQualified || []).some((t) => t.id === winner.id)) flags.add("allTheWayUp");
        if (record.event === "swc" && (record.scQualified || []).some((t) => t.id === winner.id)) flags.add("allTheWayUp");
        if (record.event === "pgxGm" && record.imChampion?.id === winner.id) flags.add("allTheWayUp");
        if (record.event === "main" && (record.qualifiedTeamIds || []).map(String).includes(String(winner.id))) flags.add("allTheWayUp");
        if (record.event === "pbs") {
            if (pbsChampionBounty(record) >= 150) flags.add("bountyKing");
            const opener = (record.playoffs?.ro32 || []).find((m) => [m?.slotA?.id, m?.slotB?.id].map(String).includes(String(winner.id)));
            if (opener?.pbsMeta?.before && (opener.pbsMeta.before[winner.id]?.bounty ?? 0) === 0) flags.add("ragsToRiches");
        }
    }
    return flags;
};

const eventGains = (record, event, stats) => {
    const tier = recordTier(record);
    const tierLabel = TOURNAMENT_TIERS[tier]?.label ?? tier;
    const name = recordName(record);
    const gains = [makeGain("finish", `Tournament finished (${tierLabel})`, XP.finish[tier], name)];
    const needed = record.neededPickemPoints ?? 0;
    const achieved = record.achievedPickemPoints ?? 0;
    if (record.pickemWon) {
        gains.push(makeGain("pickemWon", "Pick'em challenge won", XP.pickemWon[tier], `${achieved} out of ${needed} needed Pick'em points`));
        const margin = Math.min(XP.marginMax, Math.max(0, achieved - needed) * XP.marginPerPoint);
        if (margin > 0) gains.push(makeGain("margin", `Pick'em margin (+${achieved - needed})`, margin, name));
        const streak = (stats.pickemStreak ?? 0) + 1;
        if (streak >= 2) gains.push(makeGain("pickemStreak", `Pick'em win streak (${streak} in a row)`, XP.pickemStreak * Math.min(streak, XP.pickemStreakMax), name));
    }
    if (event?.lastCorrect) gains.push(makeGain("champion", "Champion guessed", XP.champion, name));
    const perfect = Object.entries(event?.rounds || {}).filter(([, r]) => r.total >= PERFECT_ROUND_MIN && r.correct === r.total);
    perfect.forEach(([key]) => gains.push(makeGain("perfectRound", `Perfect round (${key.split("|").pop()})`, XP.perfectRound, name)));
    const flawless = (event?.series ?? 0) >= FLAWLESS_MIN && event.correctCount === event.series;
    if (flawless) gains.push(makeGain("flawless", `Flawless Pick'em (${event.series}/${event.series})`, XP.flawless, name));
    const kind = eventKindOf(record);
    if (!(stats.eventKinds || []).includes(kind)) gains.push(makeGain("firstTime", "First time", XP.firstTime, name));
    if (isAnniversaryNumber(record.number)) gains.push(makeGain("anniversary", `Anniversary tournament (#${record.number})`, XP.anniversary, name));
    return { gains, perfect: perfect.length, flawless };
};

const applyRecordStats = (stats, record, event) => {
    const next = { ...stats, tierCounts: { ...(stats.tierCounts || {}) }, kindCounts: { ...(stats.kindCounts || {}) } };
    const flags = new Set();
    const tier = recordTier(record);
    next.eventsFinished += 1;
    next.tierCounts[tier] = (next.tierCounts[tier] ?? 0) + 1;
    if (record.pickemWon) {
        next.pickemWon += 1;
        next.pickemStreak = (next.pickemStreak ?? 0) + 1;
        next.bestPickemStreak = Math.max(next.bestPickemStreak ?? 0, next.pickemStreak);
    } else {
        next.pickemStreak = 0;
    }
    if (event?.lastCorrect) {
        next.championsGuessed += 1;
        next.championStreak = (next.championStreak ?? 0) + 1;
        if (next.championStreak >= 3) flags.add("hatTrick");
        if (next.championStreak >= 6) flags.add("propheticRun");
    } else {
        next.championStreak = 0;
    }
    if (event?.neededCut) next.neededCuts += 1;
    next.maxNumber = Math.max(next.maxNumber, Number(record.number) || 0);
    const kind = eventKindOf(record);
    if (!next.eventKinds.includes(kind)) next.eventKinds = [...next.eventKinds, kind];
    const eventKey = record?.event ?? "official";
    next.eventCounts = { ...(next.eventCounts || {}), [eventKey]: (next.eventCounts?.[eventKey] ?? 0) + 1 };
    const circuit = circuitOf(record);
    if (circuit) next.kindCounts[circuit] = (next.kindCounts[circuit] ?? 0) + 1;
    const mainKind = mainKindOf(record);
    if (mainKind) {
        const before = next.mainFinished;
        next.mainFinished += 1;
        if (!next.mainTypes.includes(mainKind)) next.mainTypes = [...next.mainTypes, mainKind];
        const winner = winnerOf(record);
        if (winner) {
            const id = String(winner.id);
            if (!next.champions.includes(id)) {
                if (before >= 5) flags.add("newBlood");
                next.champions = [...next.champions, id];
            }
            next.mainWinners = [...next.mainWinners, id].slice(-5);
            const last = next.mainWinners;
            const last3 = last.slice(-3);
            if (last.length >= 2 && last[last.length - 1] === last[last.length - 2]) flags.add("backToBack");
            if (last3.length === 3 && last3.every((w) => w === last3[0])) flags.add("dynasty");
            if (last.length === 5 && new Set(last).size === 5) flags.add("openEra");
            if (last.length === 5 && last.every((w) => w === last[0])) flags.add("dynastySupreme");
        }
    }
    if (record.event === "pgxGm" && record.city && !next.pgxCities.includes(record.city)) next.pgxCities = [...next.pgxCities, record.city];
    return { stats: next, flags };
};

export const applyEventFinish = (input, record) => {
    let state = withEvent(input);
    const event = state.event;
    const { gains, perfect, flawless } = eventGains(record, event, state.stats);
    const { stats, flags } = applyRecordStats(state.stats, record, event);
    storyFlags(record).forEach((f) => flags.add(f));
    const needed = record.neededPickemPoints ?? 0;
    const achieved = record.achievedPickemPoints ?? 0;
    if (record.pickemWon && achieved - needed === 1) flags.add("byAHair");
    if (record.pickemWon && achieved === needed) flags.add("photoFinish");
    if (!record.pickemWon && needed - achieved === 1) flags.add("soClose");
    if (record.pickemWon && needed > 0 && achieved >= needed * 1.5) flags.add("crushingIt");
    if (event.series > 0 && !event.simulated) flags.add("handsOn");
    if (perfect) flags.add("perfectRound");
    if (flawless && event.series >= 8) flags.add("clairvoyant");
    if (isAnniversaryNumber(record.number)) flags.add("partyTime");
    if (event.series >= 60) flags.add("longHaul");
    if (record.pickemWon && needed > 0 && achieved >= needed * 2) flags.add("untouchable");
    if ((event.correctCount ?? 0) >= 40) flags.add("sharpEye");
    if ((event.upsets ?? 0) >= 3) flags.add("upsetNight");

    const allGains = withBoost(gains, state, recordName(record));
    const levelBefore = levelInfo(state.xp).level;
    state = pushGains({ ...state, stats: { ...stats, perfectRounds: stats.perfectRounds + perfect, boostXp: (stats.boostXp ?? 0) + boostXpOf(allGains) } }, allGains);
    const evaluated = finishWithTasks(evaluateAchievements(state, flags), levelBefore, allGains, {
        kind: "event",
        tier: recordTier(record),
        pickemWon: !!record.pickemWon,
        champion: !!event?.lastCorrect,
        perfect,
        flawless: !!flawless && (event?.series ?? 0) >= 8,
        margin: achieved - needed,
        eventPoints: achieved,
        eventSeries: event?.series ?? 0,
        eventCorrect: event?.correctCount ?? 0,
    });
    state = evaluated.state;
    const summary = {
        id: record.id ?? `${Date.now()}`,
        name: recordName(record),
        tier: recordTier(record),
        startXp: event.startXp,
        endXp: state.xp,
        gains: state.event.gains,
        finishedAt: record.finishedAt ?? new Date().toISOString(),
        perks: { neededCut: event.neededCut ?? null, uses: event.perkUses ?? [], insuranceUsed: event.insuranceUsed ?? 0 },
    };
    return {
        state: { ...state, event: null, activePick: null, pendingSummary: summary.id, lastSummary: summary },
        gains: [...allGains, ...evaluated.gains],
        unlocked: evaluated.unlocked,
        summary,
    };
};

const isMatchLike = (value) =>
    value && typeof value === "object" && !Array.isArray(value) && "pickTeamId" in value && "winnerTeamId" in value && "slotA" in value;

const collectMatchGroups = (root) => {
    const groups = [];
    const seen = new Set();
    const visit = (node, depth) => {
        if (!node || typeof node !== "object" || depth > 9) return;
        if (Array.isArray(node)) {
            const matches = node.filter(isMatchLike);
            if (matches.length) {
                const fresh = matches.filter((m) => {
                    const key = `${m.id}|${m.stage ?? ""}|${m.slotA?.id ?? ""}|${m.slotB?.id ?? ""}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
                if (fresh.length) groups.push(fresh);
            }
            node.forEach((child) => {
                if (!isMatchLike(child)) visit(child, depth + 1);
            });
            return;
        }
        if (isMatchLike(node)) return;
        Object.entries(node).forEach(([key, child]) => {
            if (key === "slotA" || key === "slotB" || key === "teams" || key === "setHistory" || key === "statsMeta" || key === "ratingMeta") return;
            visit(child, depth + 1);
        });
    };
    visit(root, 0);
    return groups;
};

const historySets = (match) =>
    (match.setHistory || []).map((entry) => {
        const tied = entry.wins === entry.losses && !entry.tie;
        const pens = !!entry.extendedRounds?.penalties;
        return { left: entry.wins ?? 0, right: entry.losses ?? 0, pens, er: tied && !pens ? true : pens, winner: entry.won ? "left" : "right" };
    });

export const computeCatchUp = (records) => {
    const sorted = [...(records || [])].sort((a, b) => (Date.parse(a.finishedAt ?? "") || 0) - (Date.parse(b.finishedAt ?? "") || 0));
    let state = emptyProgress();
    const rows = [];
    const unlockedAll = [];
    for (const record of sorted) {
        const startXp = state.xp;
        const at = Date.parse(record.finishedAt ?? "") || Date.now();
        state = { ...state, event: newEvent(state.xp), activePick: null };
        if (record.neededPerk) state.event.neededCut = record.neededPerk;
        let lastCorrect = null;
        collectMatchGroups(record).forEach((group, groupIndex) => {
            const knockout = group.every((m) => m.net == null) && !record.league?.matchdays;
            for (const m of group) {
                if (!m.played || !m.pickTeamId) continue;
                const pickedIsA = m.slotA?.id === m.pickTeamId;
                const pickedSets = pickedIsA ? (m.scoreLeft ?? 0) : (m.scoreRight ?? 0);
                const otherSets = pickedIsA ? (m.scoreRight ?? 0) : (m.scoreLeft ?? 0);
                const bestOf = Math.max(1, Math.max(pickedSets, otherSets) * 2 - 1);
                const roundKey = knockout ? `${groupIndex}|${m.stage ?? "round"}` : null;
                state = { ...state, activePick: { ...(m.perks || {}), chance: null, bestOf, stage: m.stage ?? null, knockout, roundKey } };
                const result = applySeries(state, { pickedSets, otherSets, tie: !!m.isTie, bestOf, sets: historySets(m), at, detail: "" });
                state = result.state;
                unlockedAll.push(...result.unlocked);
                if (m.stage === "gf") lastCorrect = m.winnerTeamId === m.pickTeamId && !m.isTie;
            }
        });
        if (lastCorrect != null) state = { ...state, event: { ...state.event, lastCorrect } };
        const finished = applyEventFinish({ ...state, event: { ...state.event, simulated: true } }, record);
        state = { ...finished.state, pendingSummary: null, lastSummary: null };
        unlockedAll.push(...finished.unlocked);
        rows.push({ id: record.id, name: recordName(record), xp: state.xp - startXp, finishedAt: record.finishedAt });
    }
    return {
        state: { ...state, stats: { ...state.stats, streak: 0, coldStreak: 0, pickemStreak: state.stats.pickemStreak }, catchUpDone: true, v: PROGRESS_VERSION },
        summary: { rows, xp: state.xp, unlocked: unlockedAll, records: sorted.length },
    };
};

export const computeBackfill = (current, records) => {
    const history = computeCatchUp(records).state;
    const stats = { ...current.stats };
    const fromVersion = current.v ?? 1;
    const keys = [
        ...(fromVersion < 2 ? BACKFILL_STAT_KEYS : []),
        ...Object.entries(BACKFILL_STAT_KEYS_BY_VERSION).filter(([version]) => Number(version) > fromVersion).flatMap(([, list]) => list),
    ];
    keys.forEach((key) => {
        stats[key] = history.stats[key];
    });
    const event = current.event;
    let state = { ...current, stats, event: null, v: PROGRESS_VERSION };
    const startXp = state.xp;
    const achievements = { ...state.achievements };
    const gains = [];
    const at = new Date().toISOString();
    ACHIEVEMENTS.forEach((a) => {
        if (!a.since || a.since <= fromVersion || isTiered(a) || achievements[a.id]?.tier) return;
        if (!history.achievements[a.id]?.tier) return;
        achievements[a.id] = { tier: 1, at, seen: false };
        gains.push(unlockGain(a, 0));
    });
    state = pushGains({ ...state, achievements }, gains);
    const evaluated = evaluateAchievements(state, new Set());
    state = evaluated.state;
    const allGains = [...gains, ...evaluated.gains];
    const gained = state.xp - startXp;
    state = { ...state, event: event ? { ...event, startXp: (event.startXp ?? startXp) + gained } : null };
    return { state, gains: allGains, startXp, endXp: state.xp };
};

const DERIVED_STATS = new Set(["level", "xpTotal", "achievementSteps"]);

const resetStat = (stats, key) => {
    if (!key || DERIVED_STATS.has(key)) return stats;
    if (key.startsWith("tier:")) return { ...stats, tierCounts: { ...(stats.tierCounts || {}), [key.slice(5)]: 0 } };
    if (key.startsWith("kind:")) return { ...stats, kindCounts: { ...(stats.kindCounts || {}), [key.slice(5)]: 0 } };
    if (key === "pgxCityCount") return { ...stats, pgxCities: [] };
    if (key === "mainTypeCount") return { ...stats, mainTypes: [] };
    if (key === "championCount") return { ...stats, champions: [] };
    return { ...stats, [key]: 0 };
};

export const achievementEarnedXp = (a, record) => {
    const tier = record?.tier ?? 0;
    if (!tier) return 0;
    if (!isTiered(a)) return achievementXp(a);
    let sum = 0;
    for (let t = 0; t < tier; t++) sum += achievementXp(a, t);
    return sum;
};

export const resetAchievements = (input, ids) => {
    const achievements = { ...input.achievements };
    let stats = { ...input.stats };
    let removed = 0;
    ACHIEVEMENTS.filter((a) => ids.includes(a.id)).forEach((a) => {
        removed += achievementEarnedXp(a, achievements[a.id]);
        delete achievements[a.id];
        if (isTiered(a)) stats = resetStat(stats, a.stat);
    });
    const xp = Math.max(0, input.xp - removed);
    const event = input.event ? { ...input.event, startXp: Math.max(0, (input.event.startXp ?? input.xp) - removed) } : input.event;
    return { state: { ...input, xp, stats, achievements, event }, removed };
};

const setStatFloor = (stats, key, value) => {
    if (!key || DERIVED_STATS.has(key)) return stats;
    if (key.startsWith("tier:")) return { ...stats, tierCounts: { ...(stats.tierCounts || {}), [key.slice(5)]: value } };
    if (key.startsWith("kind:")) return { ...stats, kindCounts: { ...(stats.kindCounts || {}), [key.slice(5)]: value } };
    if (key === "pgxCityCount") return { ...stats, pgxCities: (stats.pgxCities || []).slice(0, value) };
    if (key === "championCount") return { ...stats, champions: (stats.champions || []).slice(0, value) };
    return { ...stats, [key]: value };
};

export const lowerAchievementTier = (input, id, toTier) => {
    const a = ACHIEVEMENTS.find((item) => item.id === id);
    const record = input.achievements[id];
    if (!a || !isTiered(a) || !record || toTier < 1 || toTier >= record.tier) return { state: input, removed: 0 };
    let removed = 0;
    for (let t = toTier; t < record.tier; t++) removed += achievementXp(a, t);
    const achievements = { ...input.achievements, [id]: { ...record, tier: toTier, seen: true } };
    const stats = setStatFloor({ ...input.stats }, a.stat, a.tiers[toTier - 1]);
    const xp = Math.max(0, input.xp - removed);
    const event = input.event ? { ...input.event, startXp: Math.max(0, (input.event.startXp ?? input.xp) - removed) } : input.event;
    return { state: { ...input, xp, stats, achievements, event }, removed };
};

export const recheckAchievements = (input) => {
    const startXp = input.xp;
    const evaluated = evaluateAchievements({ ...input, event: null }, new Set());
    const gained = evaluated.state.xp - startXp;
    const event = input.event ? { ...input.event, startXp: (input.event.startXp ?? startXp) + gained } : input.event;
    return { state: { ...evaluated.state, event }, gains: evaluated.gains, startXp, endXp: evaluated.state.xp };
};
