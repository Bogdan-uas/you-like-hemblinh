import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { StatsTabLink, StatsFactorPanelBody } from "./StatsPanels.jsx";
import { snapToDevicePixel } from "../logic/dom.js";
import { POPOVER_WIDTH_PX, POPOVER_VIEWPORT_MARGIN, POPOVER_CURSOR_OFFSET_X, POPOVER_CURSOR_OFFSET_Y } from "../logic/statsUi.js";
import { STAT_TABS } from "../logic/teamStats.js";

export const TeamStatsHoverPopover = ({ team, cursorRef, statsNow, tab = 0 }) => {
    const wrapperRef = useRef(null);

    const placeAtCursor = useCallback(() => {
        const node = wrapperRef.current;
        if (!node) return;

        const { x, y } = cursorRef?.current ?? { x: 0, y: 0 };
        const { width, height } = node.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
        const margin = POPOVER_VIEWPORT_MARGIN;

        let left = x + POPOVER_CURSOR_OFFSET_X;
        let top = y + POPOVER_CURSOR_OFFSET_Y;

        if (left + width > viewportWidth - margin) left -= width;
        if (top + height > viewportHeight - margin) top -= height;

        left = Math.max(margin, Math.min(left, viewportWidth - margin - width));
        top = Math.max(margin, Math.min(top, viewportHeight - margin - height));

        node.style.left = `${snapToDevicePixel(left)}px`;
        node.style.top = `${snapToDevicePixel(top)}px`;
    }, [cursorRef]);

    useLayoutEffect(() => {
        if (team) placeAtCursor();
    }, [team, statsNow, tab, placeAtCursor]);

    useEffect(() => {
        if (!team) return undefined;

        const handleMouseMove = (e) => {
            cursorRef.current = { x: e.clientX, y: e.clientY };
            placeAtCursor();
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [team, cursorRef, placeAtCursor]);

    if (!team) return null;

    return (
        <div
            ref={wrapperRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: `${snapToDevicePixel(POPOVER_WIDTH_PX)}px`,
                zIndex: 9999,
                pointerEvents: "none",
                transition: "none",
            }}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "relative",
                    background: "#fff",
                    color: "#2e2f42",
                    boxShadow: "0 2px 10px rgba(0,0,0,.2)",
                    padding: "6px 10px",
                    borderRadius: 6,
                    whiteSpace: "nowrap",
                    fontSize: 12,
                    maxHeight: "calc(100vh - 16px)",
                    overflowY: "auto",
                }}
            >
                <StatsTabLink side="right" tab={tab} total={STAT_TABS.length} interactive={false} />
                <StatsFactorPanelBody team={team} statsNow={statsNow} statsBefore={null} tab={tab} />
            </motion.div>
        </div>
    );
};
