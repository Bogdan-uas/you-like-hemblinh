import { useEffect } from "react";
import css from "../SpecialModePage.module.css";

export function useHallPendingScroll({ hallPendingScroll, selectedHallTournament, lenisRef, setHallPendingScroll }) {
    useEffect(() => {
        if (!hallPendingScroll || !selectedHallTournament) return undefined;

        lenisRef.current?.scrollTo(0, { immediate: true });
        window.scrollTo({ top: 0 });

        if (hallPendingScroll === "top") {
            setHallPendingScroll(null);
            return undefined;
        }

        const frameId = requestAnimationFrame(() => {
            const section = document.querySelector(`[data-hall-section="${hallPendingScroll}"]`);
            const header = document.querySelector(`.${css.second_header}`);
            setHallPendingScroll(null);
            if (!section) return;

            const headerBottom = header
                ? (parseFloat(window.getComputedStyle(header).top) || 0) + header.offsetHeight
                : 0;
            const target = Math.max(0, section.getBoundingClientRect().top + window.scrollY - headerBottom - 48);

            if (lenisRef.current) lenisRef.current.scrollTo(target, { duration: 1.4 });
            else window.scrollTo({ top: target, behavior: "smooth" });
        });

        return () => cancelAnimationFrame(frameId);
    }, [hallPendingScroll, selectedHallTournament, lenisRef, setHallPendingScroll]);
}
