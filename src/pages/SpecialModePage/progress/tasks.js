import { LONG_SHOT_CHANCE, STREAK_STEP, UPSET_CHANCE } from "./progressConfig.js";

export const TASK_CATEGORIES = [
    { key: "daily", label: "Daily", count: [3, 3], rerolls: 1, rerollPeriod: "day", once: false },
    { key: "weekly", label: "Weekly", count: [6, 9], rerolls: 3, rerollPeriod: "week", once: true },
    { key: "monthly", label: "Monthly", count: [6, 12], rerolls: 3, rerollPeriod: "week", once: true },
    { key: "crazy", label: "Crazy", count: [1, 3], rerolls: 0, rerollPeriod: null, once: true },
];

export const TASK_PERIOD = { daily: "day", weekly: "week", monthly: "month", crazy: "month" };

export const TASK_DIFFICULTIES = {
    daily: [{ key: "easy", label: "Easy", xp: 60 }, { key: "medium", label: "Medium", xp: 100 }, { key: "hard", label: "Hard", xp: 150 }],
    weekly: [{ key: "easy", label: "Easy", xp: 250 }, { key: "medium", label: "Medium", xp: 400 }, { key: "hard", label: "Hard", xp: 600 }],
    monthly: [{ key: "easy", label: "Easy", xp: 800 }, { key: "medium", label: "Medium", xp: 1200 }, { key: "hard", label: "Hard", xp: 1800 }],
    crazy: [{ key: "wild", label: "Wild", xp: 3000 }, { key: "insane", label: "Insane", xp: 4500 }, { key: "unhinged", label: "Unhinged", xp: 6500 }],
};

const pct = (v) => `${Math.round(v * 100)}%`;
const s = (n, one, many = `${one}s`) => (n === 1 ? one : many);
const fmt = (n) => Number(n).toLocaleString("en-US");

const series = (f) => f.kind === "series";
const event = (f) => f.kind === "event";

const METRICS = {
    play: (f) => (series(f) ? 1 : 0),
    playBo1: (f) => (series(f) && f.bestOf === 1 ? 1 : 0),
    playBo3: (f) => (series(f) && f.bestOf >= 3 ? 1 : 0),
    playBo5: (f) => (series(f) && f.bestOf >= 5 ? 1 : 0),
    playKo: (f) => (series(f) && f.knockout ? 1 : 0),
    playGf: (f) => (series(f) && f.gf ? 1 : 0),
    win: (f) => (series(f) && f.correct ? 1 : 0),
    winBo1: (f) => (series(f) && f.correct && f.bestOf === 1 ? 1 : 0),
    winBo3: (f) => (series(f) && f.correct && f.bestOf >= 3 ? 1 : 0),
    winBo5: (f) => (series(f) && f.correct && f.bestOf >= 5 ? 1 : 0),
    winKo: (f) => (series(f) && f.correct && f.knockout ? 1 : 0),
    winGf: (f) => (series(f) && f.correct && f.gf ? 1 : 0),
    winFav: (f) => (series(f) && f.correct && f.chance != null && f.chance >= 0.6 ? 1 : 0),
    winCoin: (f) => (series(f) && f.correct && f.chance != null && f.chance >= 0.45 && f.chance <= 0.55 ? 1 : 0),
    winOt: (f) => (series(f) && f.correct && f.overtimes > 0 ? 1 : 0),
    winDecider: (f) => (series(f) && f.correct && f.decider ? 1 : 0),
    upset: (f) => (series(f) && f.upset ? 1 : 0),
    longShot: (f) => (series(f) && f.longShot ? 1 : 0),
    points: (f) => (series(f) ? f.points : 0),
    sets: (f) => (series(f) ? f.sets : 0),
    setsWon: (f) => (series(f) ? f.setsWon : 0),
    sweep: (f) => (series(f) && f.sweep ? 1 : 0),
    comeback: (f) => (series(f) && f.comeback ? 1 : 0),
    decider: (f) => (series(f) && f.decider ? 1 : 0),
    ot: (f) => (series(f) ? f.overtimes : 0),
    otSets: (f) => (series(f) ? f.otSets : 0),
    maxOtSet: (f) => (series(f) ? f.maxOtSet : 0),
    er: (f) => (series(f) ? f.er : 0),
    pens: (f) => (series(f) ? f.pens : 0),
    bagel: (f) => (series(f) ? f.bagels : 0),
    close: (f) => (series(f) ? f.closeSets : 0),
    blowout: (f) => (series(f) ? f.blowoutSets : 0),
    insured: (f) => (series(f) && f.insured ? 1 : 0),
    insPaid: (f) => (series(f) && f.insurancePaid ? 1 : 0),
    bonus: (f) => (series(f) && f.bonusPoints > 0 ? 1 : 0),
    bonusPts: (f) => (series(f) ? f.bonusPoints : 0),
    streak: (f) => (series(f) ? f.streak : 0),
    upsetGf: (f) => (series(f) && f.correct && f.gf && f.chance != null && f.chance <= UPSET_CHANCE ? 1 : 0),
    finish: (f) => (event(f) ? 1 : 0),
    finishQual: (f) => (event(f) && f.tier === "qualifier" ? 1 : 0),
    finishTier2: (f) => (event(f) && f.tier === "tier2" ? 1 : 0),
    finishTier15: (f) => (event(f) && f.tier === "tier15" ? 1 : 0),
    finishTier1: (f) => (event(f) && (f.tier === "tier1" || f.tier === "official") ? 1 : 0),
    finishOfficial: (f) => (event(f) && f.tier === "official" ? 1 : 0),
    pickem: (f) => (event(f) && f.pickemWon ? 1 : 0),
    champion: (f) => (event(f) && f.champion ? 1 : 0),
    perfect: (f) => (event(f) ? f.perfect : 0),
    flawless: (f) => (event(f) && f.flawless ? 1 : 0),
    margin: (f) => (event(f) && f.pickemWon ? Math.max(0, f.margin) : 0),
    eventPoints: (f) => (event(f) ? f.eventPoints : 0),
    eventSeries: (f) => (event(f) ? f.eventSeries : 0),
    eventCorrect: (f) => (event(f) ? f.eventCorrect : 0),
    pickemTier1: (f) => (event(f) && f.pickemWon && (f.tier === "tier1" || f.tier === "official") ? 1 : 0),
    xp: (f) => f.xp,
    achSteps: (f) => f.achSteps,
    levelUps: (f) => f.levelUps,
};

const T = (key, metric, mode, text, targets) => ({ key, metric, mode, text, targets });

export const TASK_TEMPLATES = [
    T("play", "play", "sum", (n) => `Play ${n} ${s(n, "series", "series")}`, { daily: [3, 5, 8, 12, 16], weekly: [25, 40, 60], monthly: [100, 150, 220], crazy: [400, 600] }),
    T("playBo1", "playBo1", "sum", (n) => `Play ${n} Best of 1 ${s(n, "series", "series")}`, { daily: [2, 4, 6, 8], weekly: [15, 25], monthly: [60, 100], crazy: [250, 400] }),
    T("playBo3", "playBo3", "sum", (n) => `Play ${n} ${s(n, "series", "series")} of Best of 3 or longer`, { daily: [2, 3, 5, 7], weekly: [10, 18, 25], monthly: [50, 80], crazy: [200, 320] }),
    T("playBo5", "playBo5", "sum", (n) => `Play ${n} ${s(n, "series", "series")} of Best of 5 or longer`, { daily: [1, 2, 3], weekly: [4, 7], monthly: [15, 25], crazy: [60, 100] }),
    T("playKo", "playKo", "sum", (n) => `Play ${n} knockout ${s(n, "match", "matches")}`, { daily: [2, 4, 6], weekly: [10, 20], monthly: [40, 70], crazy: [150, 250] }),
    T("playGf", "playGf", "sum", (n) => `Play ${n} Grand ${s(n, "Final")}`, { daily: [1, 2], weekly: [2, 3], monthly: [5, 8], crazy: [20, 30] }),
    T("win", "win", "sum", (n) => `Pick the winner of ${n} ${s(n, "series", "series")}`, { daily: [2, 4, 6, 9, 12], weekly: [15, 25, 40], monthly: [70, 110, 160], crazy: [300, 450] }),
    T("winBo1", "winBo1", "sum", (n) => `Pick the winner of ${n} Best of 1 ${s(n, "series", "series")}`, { daily: [2, 3, 5, 7], weekly: [10, 18], monthly: [40, 60], crazy: [150, 250] }),
    T("winBo3", "winBo3", "sum", (n) => `Pick the winner of ${n} ${s(n, "series", "series")} of Best of 3 or longer`, { daily: [2, 3, 5], weekly: [8, 14], monthly: [30, 50], crazy: [120, 200] }),
    T("winBo5", "winBo5", "sum", (n) => `Pick the winner of ${n} ${s(n, "series", "series")} of Best of 5 or longer`, { daily: [1, 2], weekly: [3, 5], monthly: [10, 16], crazy: [40, 60] }),
    T("winKo", "winKo", "sum", (n) => `Pick the winner of ${n} knockout ${s(n, "match", "matches")}`, { daily: [2, 3, 5], weekly: [8, 15], monthly: [30, 50], crazy: [100, 160] }),
    T("winGf", "winGf", "sum", (n) => `Pick the winner of ${n} Grand ${s(n, "Final")}`, { daily: [1], weekly: [2], monthly: [4, 6], crazy: [15, 25] }),
    T("winFav", "winFav", "sum", (n) => `Pick the favourite (60% or more) and win ${n} ${s(n, "time")}`, { daily: [2, 4, 6], weekly: [10, 18], monthly: [40, 60], crazy: [100, 160] }),
    T("winCoin", "winCoin", "sum", (n) => `Win ${n} coin-flip ${s(n, "pick")} (45–55% predicted)`, { daily: [1, 2, 3], weekly: [5, 8], monthly: [15, 25], crazy: [50, 80] }),
    T("winOt", "winOt", "sum", (n) => `Pick the winner of ${n} ${s(n, "series", "series")} with an Overtime`, { daily: [1], weekly: [3, 5], monthly: [10, 15], crazy: [30, 50] }),
    T("winDecider", "winDecider", "sum", (n) => `Pick the winner of ${n} ${s(n, "series", "series")}, which go to the last possible set`, { daily: [1], weekly: [2, 4], monthly: [8, 12], crazy: [25, 40] }),
    T("upset", "upset", "sum", (n) => `Win ${n} upset ${s(n, "pick")} (${pct(UPSET_CHANCE)} or less predicted)`, { daily: [1], weekly: [2, 4], monthly: [8, 12], crazy: [30, 45] }),
    T("longShot", "longShot", "sum", (n) => `Win ${n} long shot ${s(n, "pick")} (${pct(LONG_SHOT_CHANCE)} or less predicted)`, { weekly: [1], monthly: [2, 3], crazy: [8, 12] }),
    T("upsetGf", "upsetGf", "sum", (n) => `Pick the winner of ${n} Grand ${s(n, "Final")} with ${pct(UPSET_CHANCE)} or less predicted`, { monthly: [1], crazy: [2, 3] }),
    T("points", "points", "sum", (n) => `Earn ${fmt(n)} Pick'em ${s(n, "point")}`, { daily: [5, 10, 15, 20], weekly: [40, 70, 100], monthly: [200, 300, 450], crazy: [900, 1400] }),
    T("sets", "sets", "sum", (n) => `Play ${n} ${s(n, "set")}`, { daily: [5, 10, 15, 20], weekly: [40, 70], monthly: [150, 250], crazy: [600, 900] }),
    T("setsWon", "setsWon", "sum", (n) => `Have your picks win ${n} ${s(n, "set")}`, { daily: [4, 8, 12], weekly: [25, 45], monthly: [100, 160], crazy: [400, 600] }),
    T("sweep", "sweep", "sum", (n) => `Pick ${n} ${s(n, "sweep")} (Best of 3 or longer, no set lost)`, { daily: [1, 2, 3], weekly: [4, 7], monthly: [15, 25], crazy: [50, 80] }),
    T("comeback", "comeback", "sum", (n) => `Pick ${n} ${s(n, "comeback")} (your team wins from 2 sets behind, or from 1 in a Best of 3)`, { daily: [1, 2], weekly: [2, 4], monthly: [8, 12], crazy: [25, 40] }),
    T("decider", "decider", "sum", (n) => `Play ${n} ${s(n, "series", "series")}, which go to the last possible set`, { daily: [1, 2, 3], weekly: [4, 7], monthly: [15, 25], crazy: [50, 80] }),
    T("ot", "ot", "sum", (n) => `Play ${n} ${s(n, "Overtime")}`, { daily: [1, 3, 5], weekly: [6, 10, 15], monthly: [30, 50], crazy: [100, 160] }),
    T("otSets", "otSets", "sum", (n) => `Play ${n} ${s(n, "set")}, which go to Overtime`, { daily: [1, 2, 3], weekly: [5, 8], monthly: [20, 30], crazy: [60, 100] }),
    T("er", "er", "sum", (n) => `Play ${n} ${s(n, "set")} with Extended Rounds`, { daily: [1], weekly: [2, 3], monthly: [5, 8], crazy: [20, 30] }),
    T("pens", "pens", "sum", (n) => `Play ${n} ${s(n, "set")}, which go to the Penalties`, { weekly: [1, 2], monthly: [3, 5], crazy: [12, 18] }),
    T("bagel", "bagel", "sum", (n) => `See ${n} ${s(n, "set")} end 13-0`, { weekly: [1], monthly: [2, 3], crazy: [6, 9] }),
    T("close", "close", "sum", (n) => `Play ${n} ${s(n, "set")}, which end 13-11`, { daily: [1, 2, 3], weekly: [4, 7], monthly: [12, 20], crazy: [40, 60] }),
    T("blowout", "blowout", "sum", (n) => `Play ${n} ${s(n, "set")}, which are won by 8 rounds or more`, { daily: [2, 4, 6], weekly: [10, 18], monthly: [40, 60], crazy: [120, 180] }),
    T("insured", "insured", "sum", (n) => `Use the Pick'em Insurance ${n} ${s(n, "time")}`, { daily: [1, 2], weekly: [2, 3], monthly: [6, 10], crazy: [25, 35] }),
    T("insPaid", "insPaid", "sum", (n) => `Get points back from the Pick'em Insurance ${n} ${s(n, "time")}`, { weekly: [1, 2], monthly: [3, 5], crazy: [12, 18] }),
    T("bonus", "bonus", "sum", (n) => `Activate your chosen level bonus ${n} ${s(n, "time")}`, { daily: [1, 2, 3], weekly: [4, 7], monthly: [15, 25], crazy: [50, 80] }),
    T("bonusPts", "bonusPts", "sum", (n) => `Earn ${n} bonus Pick'em ${s(n, "point")} from level bonuses`, { daily: [1, 2, 3], weekly: [5, 8], monthly: [15, 25], crazy: [50, 80] }),
    T("streak", "streak", "max", (n) => `Reach a pick streak of ${n}`, { daily: [3, 4, STREAK_STEP], weekly: [6, 8], monthly: [10, 12], crazy: [20, 25] }),
    T("xp", "xp", "sum", (n) => `Earn ${fmt(n)} XP from series, tournaments and achievements`, { daily: [300, 600, 1000, 1500], weekly: [3000, 5000], monthly: [15000, 25000], crazy: [60000, 90000] }),
    T("otSingle", "ot", "single", (n) => `Play ${n} Overtimes in a single series`, { daily: [2], weekly: [3], monthly: [4, 5], crazy: [8, 10] }),
    T("otSet", "maxOtSet", "single", (n) => `Play a set with ${n} ${s(n, "Overtime")}`, { weekly: [2], monthly: [3], crazy: [4, 5] }),
    T("setsSingle", "sets", "single", (n) => `Play a series with ${n} sets or more`, { daily: [3], weekly: [5], monthly: [7], crazy: [9] }),
    T("pointsSingle", "points", "single", (n) => `Earn ${n} Pick'em points from a single series`, { daily: [3, 5], weekly: [7], monthly: [9, 12], crazy: [15, 18] }),
    T("finish", "finish", "sum", (n) => `Finish ${n} ${s(n, "tournament")}`, { daily: [1, 2], weekly: [2, 3, 4], monthly: [8, 12], crazy: [30, 45] }),
    T("finishQual", "finishQual", "sum", (n) => `Finish ${n} ${s(n, "qualifier")}`, { daily: [1], weekly: [2], monthly: [4, 6], crazy: [15, 25] }),
    T("finishTier2", "finishTier2", "sum", (n) => `Finish ${n} Tier 2 ${s(n, "tournament")}`, { daily: [1], weekly: [2], monthly: [3, 5], crazy: [12, 20] }),
    T("finishTier15", "finishTier15", "sum", (n) => `Finish ${n} Tier 1.5 ${s(n, "tournament")}`, { weekly: [1], monthly: [2], crazy: [5, 8] }),
    T("finishTier1", "finishTier1", "sum", (n) => `Finish ${n} Tier 1 ${s(n, "tournament")} or ${s(n, "Official")}`, { daily: [1], weekly: [1, 2], monthly: [3, 5], crazy: [12, 20] }),
    T("finishOfficial", "finishOfficial", "sum", (n) => `Finish ${n} ${s(n, "Official")}`, { weekly: [1], monthly: [2], crazy: [5, 8] }),
    T("pickem", "pickem", "sum", (n) => `Win ${n} Pick'em ${s(n, "challenge")}`, { daily: [1, 2], weekly: [1, 2, 3], monthly: [5, 8], crazy: [20, 30] }),
    T("pickemTier1", "pickemTier1", "sum", (n) => `Win the Pick'em challenge of ${n} Tier 1 ${s(n, "tournament")} or ${s(n, "Official")}`, { weekly: [1], monthly: [2, 3], crazy: [8, 12] }),
    T("champion", "champion", "sum", (n) => `Guess the champion of ${n} ${s(n, "tournament")}`, { daily: [1], weekly: [1, 2], monthly: [4, 6], crazy: [15, 22] }),
    T("perfect", "perfect", "sum", (n) => `Guess every match of ${n} knockout ${s(n, "round")} (3 or more matches)`, { weekly: [1], monthly: [2, 3], crazy: [8, 12] }),
    T("flawless", "flawless", "sum", (n) => `Finish ${n} ${s(n, "tournament")} of 8 or more series without a single wrong pick`, { monthly: [1], crazy: [1, 2] }),
    T("margin", "margin", "single", (n) => `Win a Pick'em challenge by ${n} points or more`, { daily: [5], weekly: [10, 20], monthly: [30, 50], crazy: [100, 150] }),
    T("eventPoints", "eventPoints", "single", (n) => `Earn ${n} Pick'em points in a single tournament`, { weekly: [60, 90], monthly: [120, 180], crazy: [300, 400] }),
    T("eventSeries", "eventSeries", "single", (n) => `Play ${n} series in a single tournament`, { daily: [8], weekly: [15, 25], monthly: [40], crazy: [70] }),
    T("eventCorrect", "eventCorrect", "single", (n) => `Pick ${n} winners in a single tournament`, { daily: [5], weekly: [12, 20], monthly: [30], crazy: [50, 60] }),
    T("achSteps", "achSteps", "sum", (n) => `Reach ${n} new achievement ${s(n, "step")}`, { daily: [1, 2], weekly: [2, 4], monthly: [6, 10], crazy: [25, 35] }),
    T("levelUps", "levelUps", "sum", (n) => `Gain ${n} ${s(n, "level")}`, { daily: [1, 2], weekly: [2, 3], monthly: [4, 6], crazy: [12, 18] }),
];

const templateByKey = Object.fromEntries(TASK_TEMPLATES.map((t) => [t.key, t]));

const difficultyIndex = (i, length, cat, order) => {
    if (length === 1) return 1;
    if (length === 2) return cat === "crazy" || order % 2 === 1 ? i + 1 : i;
    return Math.min(2, Math.round((i / (length - 1)) * 2));
};

export const TASK_POOLS = Object.fromEntries(
    TASK_CATEGORIES.map(({ key }) => [
        key,
        TASK_TEMPLATES.flatMap((t, order) => (t.targets[key] || []).map((target, i, list) => ({ template: t.key, target, difficulty: difficultyIndex(i, list.length, key, order) }))),
    ]),
);

export const boostedTaskXp = (xp, boost) => xp + (boost ? Math.round((xp * boost) / 100) : 0);

export const taskInfo = (task) => {
    const template = templateByKey[task.template];
    const difficulty = TASK_DIFFICULTIES[task.cat][task.difficulty] ?? TASK_DIFFICULTIES[task.cat][1];
    return { text: template ? template.text(task.target) : "Task", difficulty, xp: difficulty.xp, single: template?.mode !== "sum" };
};

const pad = (n) => String(n).padStart(2, "0");
const dayKeyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const mondayOf = (d) => {
    const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
    return m;
};

export const periodKey = (period, now = Date.now()) => {
    const d = new Date(now);
    if (period === "day") return dayKeyOf(d);
    if (period === "week") return `w${dayKeyOf(mondayOf(d))}`;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

export const nextRefreshAt = (period, now = Date.now()) => {
    const d = new Date(now);
    if (period === "day") return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    if (period === "week") {
        const m = mondayOf(d);
        return new Date(m.getFullYear(), m.getMonth(), m.getDate() + 7).getTime();
    }
    return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
};

let uidCounter = 0;
const uid = () => `t${Date.now().toString(36)}${(uidCounter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const pickFrom = (cat, exclude) => {
    const pool = TASK_POOLS[cat].filter((entry) => !exclude.has(entry.template));
    const list = pool.length ? pool : TASK_POOLS[cat];
    return list[Math.floor(Math.random() * list.length)];
};

const makeTask = (cat, entry) => ({ uid: uid(), cat, template: entry.template, target: entry.target, difficulty: entry.difficulty, progress: 0, done: false, doneAt: null, seen: true, rerolled: false });

const rollList = (cat) => {
    const def = TASK_CATEGORIES.find((c) => c.key === cat);
    const [min, max] = def.count;
    const count = min + Math.floor(Math.random() * (max - min + 1));
    const used = new Set();
    const list = [];
    for (let i = 0; i < count; i++) {
        const entry = pickFrom(cat, used);
        used.add(entry.template);
        list.push(makeTask(cat, entry));
    }
    return list;
};

export const emptyTasks = () => ({});

export const ensureTasks = (state, now = Date.now()) => {
    const tasks = state.tasks || {};
    let changed = !state.tasks;
    const next = { ...tasks };
    TASK_CATEGORIES.forEach((def) => {
        const period = periodKey(TASK_PERIOD[def.key], now);
        const current = next[def.key];
        if (!current || current.period !== period) {
            next[def.key] = { period, list: rollList(def.key), rerollPeriod: def.rerollPeriod ? periodKey(def.rerollPeriod, now) : null, rerollsUsed: 0 };
            changed = true;
        } else if (def.rerollPeriod) {
            const rp = periodKey(def.rerollPeriod, now);
            if (current.rerollPeriod !== rp) {
                next[def.key] = { ...current, rerollPeriod: rp, rerollsUsed: 0 };
                changed = true;
            }
        }
    });
    return changed ? { ...state, tasks: next } : state;
};

export const rerollsLeft = (tasks, cat) => {
    const def = TASK_CATEGORIES.find((c) => c.key === cat);
    if (!def?.rerolls || !tasks?.[cat]) return 0;
    return Math.max(0, def.rerolls - (tasks[cat].rerollsUsed ?? 0));
};

export const canReroll = (tasks, cat, task) => {
    const def = TASK_CATEGORIES.find((c) => c.key === cat);
    if (!def?.rerolls || task.done) return false;
    if (def.once && task.rerolled) return false;
    return rerollsLeft(tasks, cat) > 0;
};

export const rerollTask = (state, cat, taskUid) => {
    const group = state.tasks?.[cat];
    const task = group?.list.find((t) => t.uid === taskUid);
    if (!task || !canReroll(state.tasks, cat, task)) return state;
    const exclude = new Set(group.list.map((t) => t.template));
    const fresh = { ...makeTask(cat, pickFrom(cat, exclude)), rerolled: true };
    return {
        ...state,
        tasks: { ...state.tasks, [cat]: { ...group, rerollsUsed: (group.rerollsUsed ?? 0) + 1, list: group.list.map((t) => (t.uid === taskUid ? fresh : t)) } },
    };
};

let gainCounter = 0;

export const applyTaskRun = (state, facts) => {
    if (!state.tasks) return { state, gains: [] };
    const tasks = { ...state.tasks };
    const gains = [];
    const at = new Date().toISOString();
    TASK_CATEGORIES.forEach(({ key }) => {
        const group = tasks[key];
        if (!group) return;
        let touched = false;
        const list = group.list.map((task) => {
            if (task.done) return task;
            const template = templateByKey[task.template];
            if (!template) return task;
            const value = METRICS[template.metric]?.(facts) ?? 0;
            if (!value) return task;
            const progress = template.mode === "sum" ? task.progress + value : Math.max(task.progress, value);
            if (progress === task.progress) return task;
            touched = true;
            if (progress < task.target) return { ...task, progress };
            const info = taskInfo(task);
            const boost = facts.taskBoost ?? 0;
            const earned = boostedTaskXp(info.xp, boost);
            gains.push({
                id: `task-${Date.now().toString(36)}-${(gainCounter++).toString(36)}`,
                source: "task",
                label: info.text,
                xp: earned,
                detail: "Task",
                at: Date.now(),
                task: { uid: task.uid, cat: key, text: info.text, difficulty: info.difficulty.label, difficultyKey: info.difficulty.key, target: task.target, baseXp: info.xp, boost, boostXp: earned - info.xp },
            });
            return { ...task, progress: task.target, done: true, doneAt: at, seen: false, earnedXp: earned };
        });
        if (touched) tasks[key] = { ...group, list };
    });
    return { state: { ...state, tasks }, gains };
};

export const unseenTaskIds = (state) =>
    TASK_CATEGORIES.flatMap(({ key }) => (state.tasks?.[key]?.list || []).filter((t) => t.done && t.seen === false).map((t) => t.uid));

export const markTasksSeen = (state, uids) => {
    if (!state.tasks) return state;
    const set = new Set(uids);
    const tasks = { ...state.tasks };
    let changed = false;
    TASK_CATEGORIES.forEach(({ key }) => {
        const group = tasks[key];
        if (!group?.list.some((t) => set.has(t.uid) && t.seen === false)) return;
        tasks[key] = { ...group, list: group.list.map((t) => (set.has(t.uid) ? { ...t, seen: true } : t)) };
        changed = true;
    });
    return changed ? { ...state, tasks } : state;
};

export const mergeTasksOnRestore = (saved, current) => {
    if (!current) return saved;
    const next = { ...current };
    TASK_CATEGORIES.forEach(({ key }) => {
        const cur = current[key];
        if (!cur) return;
        const byUid = Object.fromEntries((saved?.[key]?.list || []).map((t) => [t.uid, t]));
        next[key] = { ...cur, list: cur.list.map((t) => (byUid[t.uid] ? byUid[t.uid] : { ...t, progress: 0, done: false, doneAt: null, seen: true })) };
    });
    return next;
};
