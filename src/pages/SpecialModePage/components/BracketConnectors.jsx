import { useState, useLayoutEffect, useRef } from "react";
import { buildConnectorPath } from "../logic/bracketConnectors.js";

export const BracketConnectors = ({ links }) => {
    const svgRef = useRef(null);
    const [paths, setPaths] = useState([]);

    useLayoutEffect(() => {
        const container = svgRef.current?.parentElement;
        if (!container) return undefined;

        const measure = () => {
            const base = container.getBoundingClientRect();
            const next = [];

            links.forEach(({ from, to, toY = 0.5 }) => {
                const a = container.querySelector(`[data-bracket-rect="${from}"]`);
                const b = container.querySelector(`[data-bracket-rect="${to}"]`);
                if (!a || !b) return;

                const ra = a.getBoundingClientRect();
                const rb = b.getBoundingClientRect();

                next.push(buildConnectorPath(
                    Math.round(ra.right - base.left) + 0.5,
                    Math.round(ra.top + ra.height / 2 - base.top) + 0.5,
                    Math.round(rb.left - base.left) + 0.5,
                    Math.round(rb.top + rb.height * toY - base.top) + 0.5
                ));
            });

            setPaths((prev) => (prev.join("|") === next.join("|") ? prev : next));
        };

        measure();

        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
        observer?.observe(container);
        window.addEventListener("resize", measure);
        document.fonts?.ready?.then(measure).catch(() => { });

        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", measure);
        };
    });

    return (
        <svg
            ref={svgRef}
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                overflow: "visible",
                transition: "none",
            }}
        >
            {paths.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="#8a8a8a" strokeWidth={1} />
            ))}
        </svg>
    );
};
