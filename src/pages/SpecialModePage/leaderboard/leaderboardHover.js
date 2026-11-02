import { useEffect, useState, useSyncExternalStore } from "react";

const SCROLL_SETTLE_MS = 160;

export const createLeaderboardHoverStore = () => {
    let team = null;
    const listeners = new Set();
    return {
        get: () => team,
        set: (next) => {
            if (team === next) return;
            team = next;
            listeners.forEach((listener) => listener());
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
};

export const useLeaderboardHover = (store) => useSyncExternalStore(store.subscribe, store.get);

export const useIsScrolling = () => {
    const [scrolling, setScrolling] = useState(false);

    useEffect(() => {
        let timer = null;
        const onScroll = () => {
            setScrolling(true);
            clearTimeout(timer);
            timer = setTimeout(() => setScrolling(false), SCROLL_SETTLE_MS);
        };
        window.addEventListener("wheel", onScroll, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            clearTimeout(timer);
            window.removeEventListener("wheel", onScroll);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return scrolling;
};
