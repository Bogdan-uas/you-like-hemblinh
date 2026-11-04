export const PRISTINE_LS_KEY = "specialMode_pristine_v1";

let capturePending = false;

const isManagedKey = (key) =>
    !!key && (key.startsWith("specialMode_") || key.startsWith("specialPage") || key === "pendingSeriesApply" || key === "seriesEndTime");

const managedKeys = () => {
    const keys = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (isManagedKey(key) && key !== PRISTINE_LS_KEY) keys.push(key);
        }
    } catch {
        return keys;
    }
    return keys;
};

const fingerprint = () => Object.fromEntries(managedKeys().map((key) => [key, localStorage.getItem(key)]));

export const capturePristineStorage = () => {
    try {
        localStorage.setItem(PRISTINE_LS_KEY, JSON.stringify(fingerprint()));
    } catch {
        return;
    }
};

export const schedulePristineCapture = (delay, isPristine) => {
    capturePending = true;
    const timer = setTimeout(async () => {
        const pristine = await isPristine().catch(() => false);
        capturePending = false;
        if (pristine) capturePristineStorage();
    }, delay);
    return () => {
        clearTimeout(timer);
        capturePending = false;
    };
};

export const hasStorageChanges = () => {
    if (capturePending) return false;
    let pristine = null;
    try {
        pristine = JSON.parse(localStorage.getItem(PRISTINE_LS_KEY) || "null");
    } catch {
        pristine = null;
    }
    const now = fingerprint();
    if (!pristine) return Object.keys(now).length > 0;
    const keys = new Set([...Object.keys(pristine), ...Object.keys(now)]);
    for (const key of keys) {
        if (pristine[key] !== now[key]) return true;
    }
    return false;
};

export const removeEverythingFromStorage = () => {
    try {
        [...managedKeys(), PRISTINE_LS_KEY].forEach((key) => localStorage.removeItem(key));
        sessionStorage.clear();
        const blocked = () => {};
        Storage.prototype.setItem = blocked;
    } catch {
        return;
    }
};
