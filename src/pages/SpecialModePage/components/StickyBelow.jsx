import { useState, useLayoutEffect, useRef } from "react";
import css from "../SpecialModePage.module.css";

export const StickyBelow = ({ anchor, style, children }) => {
    const ref = useRef(null);
    const joinedRef = useRef(false);
    const [layout, setLayout] = useState({ top: null, reach: 0 });

    useLayoutEffect(() => {
        const element = document.querySelector(anchor);
        if (!element) return undefined;

        const measure = () => {
            const anchorTop = parseFloat(window.getComputedStyle(element).top) || 0;
            const top = Math.round(anchorTop + element.offsetHeight);
            const reach = element.offsetHeight;
            const rect = ref.current?.getBoundingClientRect();
            const stuck = !!rect && rect.top <= top + 1 && rect.bottom > top + 1;

            if (stuck) element.setAttribute("data-joined", "true");
            else if (joinedRef.current) element.removeAttribute("data-joined");
            ref.current?.setAttribute("data-stuck", String(stuck));
            joinedRef.current = stuck;

            setLayout((prev) => (prev.top === top && prev.reach === reach ? prev : { top, reach }));
        };

        measure();

        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
        observer?.observe(element);
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", measure, { passive: true });

        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", measure);
            window.removeEventListener("scroll", measure);
            if (joinedRef.current) element.removeAttribute("data-joined");
            joinedRef.current = false;
        };
    }, [anchor]);

    return (
        <div
            ref={ref}
            className={css.sticky_join}
            style={{ top: layout.top ?? 0, "--join-reach": `${layout.reach}px`, ...style }}
        >
            {children}
        </div>
    );
};
