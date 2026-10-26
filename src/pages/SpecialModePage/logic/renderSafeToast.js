import toastLib from "react-hot-toast";

let commentaryMuted = false;
let seriesToastMode = false;

const SERIES_TRAIL_LENGTH = 4;
const SERIES_DEFAULT_DURATION = 2000;
let seriesFeed = { id: null, until: 0, seq: 0, trail: [] };

const SERIES_MIN_DWELL_MS = 1100;
const SERIES_QUEUE_LIMIT = 4;
const SERIES_ROUND_ICONS = new Set(["😜", "🔥"]);
let seriesQueue = [];
let seriesShownAt = 0;
let seriesTimer = null;

const isRoundToast = (item) => SERIES_ROUND_ICONS.has(item.options?.icon);

const pumpSeriesQueue = () => {
    if (seriesTimer || seriesQueue.length === 0) return;

    const wait = seriesShownAt + SERIES_MIN_DWELL_MS - Date.now();
    if (wait > 0) {
        seriesTimer = setTimeout(() => {
            seriesTimer = null;
            pumpSeriesQueue();
        }, wait);
        return;
    }

    const item = seriesQueue.shift();
    seriesShownAt = Date.now();
    item.fn(item.message, seriesOptions(item.options));
    pumpSeriesQueue();
};

const enqueueSeriesToast = (fn, message, options) => {
    const item = { fn, message, options };
    if (isRoundToast(item)) seriesQueue = seriesQueue.filter((queued) => !isRoundToast(queued));
    seriesQueue.push(item);

    while (seriesQueue.length > SERIES_QUEUE_LIMIT) {
        const roundIndex = seriesQueue.findIndex(isRoundToast);
        seriesQueue.splice(roundIndex >= 0 ? roundIndex : 0, 1);
    }

    pumpSeriesQueue();
};

export const setSeriesToastMode = (active) => {
    seriesToastMode = active;
    if (!active) {
        seriesFeed = { ...seriesFeed, trail: [], current: null };
        seriesQueue = [];
        if (seriesTimer) clearTimeout(seriesTimer);
        seriesTimer = null;
    }
};

const seriesOptions = (options) => {
    const now = Date.now();
    const duration = options?.duration ?? SERIES_DEFAULT_DURATION;
    const alive = seriesFeed.id && now < seriesFeed.until - 120;
    const previous = seriesFeed.current ?? null;

    seriesFeed = {
        id: alive ? seriesFeed.id : `series-feed-${now}`,
        until: now + duration,
        seq: seriesFeed.seq + 1,
        trail: previous ? [previous, ...seriesFeed.trail].slice(0, SERIES_TRAIL_LENGTH) : seriesFeed.trail,
        current: { icon: options?.icon ?? null, accent: options?.accent ?? null },
    };

    return { ...options, duration, variant: "series", id: seriesFeed.id, seq: seriesFeed.seq, trail: seriesFeed.trail };
};

const inSeries = (fn) => (message, options) =>
    options?.variant === "series" || (seriesToastMode && !options?.variant)
        ? enqueueSeriesToast(fn, message, options)
        : fn(message, options);

const dismissOutsideSeries = (...args) => {
    if (seriesToastMode && args.length === 0) return;
    toastLib.dismiss(...args);
};

export const setCommentaryMuted = (muted) => {
    commentaryMuted = muted;
};

const afterRender = (fn) => (...args) => {
    queueMicrotask(() => fn(...args));
};

const unlessMuted = (fn) => (...args) => {
    if (!commentaryMuted) fn(...args);
};

const toast = afterRender(unlessMuted(inSeries(toastLib)));
toast.success = afterRender(toastLib.success);
toast.error = afterRender(toastLib.error);
toast.dismiss = afterRender(dismissOutsideSeries);
toast.always = afterRender(inSeries(toastLib));

export default toast;
