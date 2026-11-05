import { useSyncExternalStore } from "react";
import {
    INSURANCE_MIN_BEST_OF,
    LONG_SHOT_CHANCE,
    PROGRESS_LS_KEY,
    PROGRESS_SNAPSHOT_LS_KEY,
    PROGRESS_VERSION,
    STREAK_STEP,
    UPSET_CHANCE,
    applyNeededPerk,
    bonusCapPoints,
    bonusOptionsFor,
    bonusPointsUsed,
    levelInfo,
    perksForLevel,
} from "./progressConfig.js";
import { applyEventFinish, applySeries, computeBackfill, computeCatchUp, emptyProgress, lowerAchievementTier, normalizeProgress, recheckAchievements, resetAchievements } from "./progressEngine.js";

const read = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
        return null;
    }
};

const write = (key, value) => {
    try {
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(value));
    } catch {
        return;
    }
};

let progress = normalizeProgress(read(PROGRESS_LS_KEY));
let ui = { displayXp: progress.xp, queue: [], screen: null, summary: null, catchUp: null, insuranceArmed: false, bonusArmed: null, lastPick: null };
let snapshot = { progress, ui };
const listeners = new Set();
let queueKey = 0;

const publish = () => {
    snapshot = { progress, ui };
    listeners.forEach((listener) => listener());
};

const setProgress = (next) => {
    progress = next;
    write(PROGRESS_LS_KEY, progress);
};

const setUi = (patch) => {
    ui = { ...ui, ...patch };
};

export const subscribeProgress = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const getProgress = () => snapshot;

export const useProgress = () => useSyncExternalStore(subscribeProgress, getProgress);

export const useHudPerksShown = () => {
    const { progress: state } = useProgress();
    return !!(state.activePick?.insured || state.activePick?.bonus);
};

const enqueue = (fromXp, gains) => {
    const plain = gains.filter((g) => g.source !== "achievement");
    const achievements = gains.filter((g) => g.source === "achievement");
    const items = [];
    let cursor = fromXp;
    if (plain.length) {
        const sum = plain.reduce((total, g) => total + g.xp, 0);
        items.push({ key: ++queueKey, type: "xp", gains: plain, fromXp: cursor, toXp: cursor + sum });
        cursor += sum;
    }
    achievements.forEach((gain) => {
        items.push({ key: ++queueKey, type: "achievement", gain, fromXp: cursor, toXp: cursor + gain.xp });
        cursor += gain.xp;
    });
    if (!items.length) return;
    const queue = [...ui.queue];
    items.forEach((item) => {
        const last = queue[queue.length - 1];
        if (item.type === "xp" && last?.type === "xp" && queue.length >= 2) {
            queue[queue.length - 1] = { ...last, gains: [...last.gains, ...item.gains], toXp: item.toXp };
        } else {
            queue.push(item);
        }
    });
    setUi({ queue });
};

export const progressSeriesFinished = (info) => {
    const before = progress.xp;
    const result = applySeries(progress, info);
    setProgress(result.state);
    setUi({ lastPick: result.pick });
    enqueue(before, result.gains);
    publish();
};

export const progressEventFinished = (record) => {
    if (!record) return;
    const before = progress.xp;
    const result = applyEventFinish(progress, record);
    setProgress(result.state);
    enqueue(before, result.gains);
    publish();
};

export const progressCompleteQueueItem = (key) => {
    const item = ui.queue.find((q) => q.key === key);
    setUi({ queue: ui.queue.filter((q) => q.key !== key), displayXp: item ? item.toXp : ui.displayXp });
    publish();
};

export const progressWithNeededPerk = (record) => {
    const cut = progress.event?.neededCut;
    return cut && record && cut.after === record.neededPickemPoints && cut.before > cut.after ? { ...record, neededPerk: cut } : record;
};

export const currentLevel = () => levelInfo(progress.xp).level;

export const currentPerks = () => perksForLevel(currentLevel());

const ensureEvent = (state) => (state.event ? state : { ...state, event: { startXp: state.xp, gains: [], series: 0, simulated: false, insuranceUsed: 0, rounds: {}, lastCorrect: null, perkUses: [] } });

export const insuranceLeft = () => Math.max(0, currentPerks().insurance - (progress.event?.insuranceUsed ?? 0));

export const progressSetInsuranceArmed = (armed) => {
    setUi({ insuranceArmed: !!armed && insuranceLeft() > 0 });
    publish();
};

export const progressSetBonusArmed = (type) => {
    setUi({ bonusArmed: type || null });
    publish();
};

export const streakReadyNext = (state = progress) => ((state.stats.streak ?? 0) + 1) % STREAK_STEP === 0;

const PICK_PERK_KEYS = ["insured", "insurePct", "streakBefore", "shieldReady", "bonusMode", "bonus", "bonusValue", "bonusReady", "bonusCap", "bonusLeft", "gfBonus", "upsetBonus", "longShotBonus", "streakBonus", "comebackBonus", "sweepBonus", "overtimeBonus", "deciderBonus", "knockoutBonus", "longSeriesBonus"];

export const progressSetNeeded = (points) => {
    const needed = Number.isFinite(points) ? points : null;
    if (ui.needed === needed) return;
    setUi({ needed });
    publish();
};

export const progressBonusCap = (state = progress, needed = ui.needed) => {
    const pct = perksForLevel(levelInfo(state.xp).level).bonusCap;
    const cap = bonusCapPoints(needed, pct);
    return { pct, cap, left: Math.max(0, cap - bonusPointsUsed(state.event)) };
};

export const progressBuildPickPerks = ({ chance, stage, label = "", bestOf = 1, roundKey = null, knockout = false, elimination = knockout, needed = ui.needed }) => {
    const perks = currentPerks();
    const known = Number.isFinite(chance);
    const cap = progressBonusCap(progress, needed);
    const options = bonusOptionsFor({ perks, stage, bestOf, knockout: elimination, streakReady: streakReadyNext(), chance: known ? chance : null });
    const chosen = cap.left > 0 ? options.find((option) => option.type === ui.bonusArmed) ?? null : null;
    const insured = ui.insuranceArmed && insuranceLeft() > 0 && bestOf >= INSURANCE_MIN_BEST_OF;
    const pick = {
        chance: known ? chance : null,
        stage: stage ?? null,
        label,
        bestOf,
        roundKey,
        knockout,
        insured,
        insurePct: insured ? perks.insurePct || 50 : 0,
        streakBefore: progress.stats.streak ?? 0,
        shieldReady: Math.max(0, perks.streakShield - (progress.event?.shieldsUsed ?? 0)) > 0,
        bonusMode: "pick",
        bonus: chosen?.type ?? null,
        bonusValue: chosen?.value ?? 0,
        bonusReady: chosen ? (chosen.type === "upsetBonus" ? known && chance <= UPSET_CHANCE : chosen.type === "longShotBonus" ? known && chance <= LONG_SHOT_CHANCE : true) : false,
        bonusCap: cap.cap,
        bonusLeft: cap.left,
    };
    let next = ensureEvent(progress);
    if (insured) next = { ...next, event: { ...next.event, insuranceUsed: (next.event.insuranceUsed ?? 0) + 1 } };
    setProgress({ ...next, activePick: pick });
    setUi({ insuranceArmed: false, bonusArmed: null, lastPick: null });
    publish();
    return Object.fromEntries(PICK_PERK_KEYS.filter((key) => pick[key]).map((key) => [key, pick[key]]));
};

export const progressMarkSimulated = () => {
    const next = ensureEvent(progress);
    if (next.event.simulated) return;
    setProgress({ ...next, event: { ...next.event, simulated: true } });
    publish();
};

export const progressNeededPreview = (points) => applyNeededPerk(points, currentLevel());

export const progressApplyNeededPerk = (points) => {
    const reduced = applyNeededPerk(points, currentLevel());
    if (reduced !== points && Number.isFinite(points)) {
        const next = ensureEvent(progress);
        setProgress({ ...next, event: { ...next.event, neededCut: { before: points, after: reduced, pct: currentPerks().needed } } });
        publish();
    }
    return reduced;
};

const snapshotOf = (state) => ({ ...state, lastSummary: null, pendingSummary: null });

export const progressTakeSnapshot = () => write(PROGRESS_SNAPSHOT_LS_KEY, snapshotOf(progress));

export const progressEnsureSnapshot = () => {
    if (!read(PROGRESS_SNAPSHOT_LS_KEY)) write(PROGRESS_SNAPSHOT_LS_KEY, snapshotOf(progress));
};

export const progressClearSnapshot = () => write(PROGRESS_SNAPSHOT_LS_KEY, null);

export const progressRestoreSnapshot = () => {
    const saved = read(PROGRESS_SNAPSHOT_LS_KEY);
    write(PROGRESS_SNAPSHOT_LS_KEY, null);
    if (!saved) return;
    setProgress({ ...normalizeProgress(saved), lastSummary: progress.lastSummary, pendingSummary: progress.pendingSummary, event: null, activePick: null, catchUpDone: true });
    setUi({ queue: [], displayXp: progress.xp, insuranceArmed: false });
    publish();
};

export const openProgressScreen = (tab = "level") => {
    setUi({ screen: tab });
    publish();
};

export const closeProgressScreen = () => {
    setUi({ screen: null });
    publish();
};

export const progressOpenSummaryThen = (onContinue) => {
    if (!progress.pendingSummary) return false;
    const data = progress.lastSummary?.id === progress.pendingSummary ? progress.lastSummary : null;
    setProgress({ ...progress, pendingSummary: null });
    if (!data) {
        publish();
        return false;
    }
    setUi({ summary: { data, onContinue } });
    publish();
    return true;
};

export const progressOpenLastSummary = () => {
    if (!progress.lastSummary) return;
    setUi({ summary: { data: progress.lastSummary, onContinue: null, replay: true }, screen: null });
    publish();
};

export const progressCloseSummary = () => {
    const onContinue = ui.summary?.onContinue;
    setUi({ summary: null, displayXp: Math.max(ui.displayXp, ui.queue.length ? ui.displayXp : progress.xp) });
    publish();
    if (onContinue) onContinue();
};

export const progressRunCatchUp = (records) => {
    if (progress.catchUpDone) return;
    if (!records?.length) {
        setProgress({ ...progress, catchUpDone: true });
        publish();
        return;
    }
    const { state, summary } = computeCatchUp(records);
    setProgress({ ...state, catchUpDone: true });
    setUi({ catchUp: summary, displayXp: 0, queue: [] });
    publish();
};

export const progressRecheck = () => {
    if (ui.summary || ui.catchUp) return;
    const before = progress.xp;
    const result = recheckAchievements(progress);
    if (!result.gains.length) return;
    setProgress(result.state);
    if ((progress.event?.series ?? 0) > 0) {
        enqueue(before, result.gains);
    } else {
        const steps = result.gains.filter((gain) => gain.source === "achievement").length;
        setUi({
            displayXp: result.startXp,
            queue: [],
            summary: {
                data: {
                    id: `recheck-${Date.now()}`,
                    name: "Your progress was updated",
                    subtitle: `${steps} new achievement step${steps === 1 ? "" : "s"} from your progress`,
                    startXp: result.startXp,
                    endXp: result.endXp,
                    gains: result.gains,
                },
                onContinue: null,
            },
        });
    }
    publish();
};

export const progressRunBackfill = (records) => {
    if ((progress.v ?? 1) >= PROGRESS_VERSION) return;
    if (!records?.length) {
        setProgress({ ...progress, v: PROGRESS_VERSION });
        publish();
        return;
    }
    const result = computeBackfill(progress, records);
    setProgress(result.state);
    if (result.gains.length) {
        setUi({
            displayXp: result.startXp,
            queue: [],
            summary: {
                data: {
                    id: "history-backfill",
                    name: "Your history counts",
                    subtitle: `Your Hall of Fame already earned ${result.gains.length} new achievement steps`,
                    startXp: result.startXp,
                    endXp: result.endXp,
                    gains: result.gains,
                },
                onContinue: null,
            },
        });
    }
    publish();
};

export const unseenAchievementIds = (state = progress) =>
    Object.entries(state.achievements || {}).filter(([, record]) => record?.seen === false).map(([id]) => id);

export const progressResetAchievements = (ids) => {
    const result = resetAchievements(progress, ids);
    setProgress(result.state);
    setUi({ displayXp: progress.xp, queue: [] });
    publish();
    return result.removed;
};

export const progressLowerAchievement = (id, toTier) => {
    const result = lowerAchievementTier(progress, id, toTier);
    setProgress(result.state);
    setUi({ displayXp: progress.xp, queue: [] });
    publish();
    return result.removed;
};

export const progressMarkSeen = (ids) => {
    const fresh = ids.filter((id) => progress.achievements[id]?.seen === false);
    if (!fresh.length) return;
    const achievements = { ...progress.achievements };
    fresh.forEach((id) => {
        achievements[id] = { ...achievements[id], seen: true };
    });
    setProgress({ ...progress, achievements });
    publish();
};

export const progressCloseCatchUp = () => {
    setUi({ catchUp: null, displayXp: progress.xp });
    publish();
};

export const progressResetAll = () => {
    write(PROGRESS_LS_KEY, null);
    write(PROGRESS_SNAPSHOT_LS_KEY, null);
    progress = emptyProgress();
    setUi({ displayXp: 0, queue: [], screen: null, summary: null, catchUp: null, insuranceArmed: false });
    publish();
};

export const progressIsPristine = () => progress.xp === 0 && !Object.keys(progress.achievements).length;
