import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { PBS_DRAFT_CLOCK_LS_KEY } from "./storageKeys.js";

export const PBS_DRAFT_SPEEDS = [1, 2, 4, 8];

const PERSIST_EVERY_MS = 200;

export const loadPbsDraftProgress = (id) => {
    try {
        const saved = JSON.parse(localStorage.getItem(PBS_DRAFT_CLOCK_LS_KEY) || "null");
        return saved?.id === id ? Math.max(0, Number(saved.progress) || 0) : 0;
    } catch {
        return 0;
    }
};

const savePbsDraftProgress = (id, progress) => {
    try {
        localStorage.setItem(PBS_DRAFT_CLOCK_LS_KEY, JSON.stringify({ id, progress: Math.round(progress) }));
    } catch {
        /* ignore */
    }
};

export const clearPbsDraftProgress = () => {
    try {
        localStorage.removeItem(PBS_DRAFT_CLOCK_LS_KEY);
    } catch {
        /* ignore */
    }
};

const createPbsDraftClock = ({ id, total, initialProgress }) => {
    let progress = Math.min(total, initialProgress);
    let rate = 1;
    let rafId = null;
    let last = null;
    let lastSaved = 0;
    let doneFired = false;
    const listeners = new Set();
    const doneListeners = new Set();

    const persist = () => {
        if (!doneFired) savePbsDraftProgress(id, progress);
    };
    const emit = () => listeners.forEach((fn) => fn());
    const finish = () => {
        if (doneFired) return;
        doneFired = true;
        doneListeners.forEach((fn) => fn());
    };

    const tick = (now) => {
        if (last !== null) progress = Math.min(total, progress + (now - last) * rate);
        last = now;

        if (now - lastSaved > PERSIST_EVERY_MS) {
            lastSaved = now;
            persist();
        }

        emit();

        if (progress >= total) {
            rafId = null;
            last = null;
            savePbsDraftProgress(id, progress);
            finish();
            return;
        }

        rafId = requestAnimationFrame(tick);
    };

    return {
        id,
        total,
        getProgress: () => progress,
        subscribe: (fn) => {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },
        onDone: (fn) => {
            doneListeners.add(fn);
            return () => doneListeners.delete(fn);
        },
        start: () => {
            if (progress >= total) {
                finish();
                return;
            }
            if (rafId !== null) return;
            last = null;
            rafId = requestAnimationFrame(tick);
        },
        stop: () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = null;
            last = null;
            persist();
        },
        setProgress: (value) => {
            progress = Math.max(0, Math.min(total, value));
            persist();
            emit();
            if (progress >= total) finish();
        },
        setSpeed: (speed) => {
            rate = speed;
        },
        persist,
    };
};

export const usePbsDraftClock = ({ draftId, total, speed, active, onComplete }) => {
    const clock = useMemo(
        () => (draftId && total > 0 ? createPbsDraftClock({ id: draftId, total, initialProgress: loadPbsDraftProgress(draftId) }) : null),
        [draftId, total]
    );

    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    });

    useEffect(() => {
        clock?.setSpeed(speed);
    }, [clock, speed]);

    useEffect(() => {
        if (!clock) return undefined;
        return clock.onDone(() => onCompleteRef.current?.(clock.id));
    }, [clock]);

    useEffect(() => {
        if (!clock || !active) return undefined;
        clock.start();
        return () => clock.stop();
    }, [clock, active]);

    useEffect(() => {
        if (!clock) return undefined;
        const save = () => clock.persist();
        window.addEventListener("pagehide", save);
        window.addEventListener("beforeunload", save);
        document.addEventListener("visibilitychange", save);
        return () => {
            window.removeEventListener("pagehide", save);
            window.removeEventListener("beforeunload", save);
            document.removeEventListener("visibilitychange", save);
        };
    }, [clock]);

    return clock;
};

const noopSubscribe = () => () => { };

export const usePbsClockValue = (clock, select) =>
    useSyncExternalStore(
        clock ? clock.subscribe : noopSubscribe,
        () => select(clock ? clock.getProgress() : Infinity)
    );
