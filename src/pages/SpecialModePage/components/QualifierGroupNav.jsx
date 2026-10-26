import { useState, useLayoutEffect, useRef } from "react";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { QUALIFIER_GROUPS, PLAY_IN_GROUP } from "../logic/qualifier.jsx";

const qualifierGroupLabel = (group) => (group === PLAY_IN_GROUP ? "Play-in" : `Group ${group}`);

export const QualifierGroupNav = ({ value, onChange, fixed = false, groups = QUALIFIER_GROUPS, labelOf = qualifierGroupLabel, anchorId = "qualifier-groups" }) => {
    const wrapRef = useRef(null);
    const hasMeasuredRef = useRef(false);
    const [indicator, setIndicator] = useState({ left: 0, width: 0, animate: false });

    useLayoutEffect(() => {
        const measure = (animate) => {
            const wrap = wrapRef.current;
            if (!wrap) return;
            const active = wrap.querySelector("[data-group-active='true']");
            if (!active) return;
            setIndicator({ left: active.offsetLeft, width: active.offsetWidth, animate });
        };

        measure(hasMeasuredRef.current);
        hasMeasuredRef.current = true;

        const handleResize = () => measure(false);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [value]);

    return (
        <div
            className={fixed ? css.groups_header : css.groups_header_inline}
            data-sticky-anchor={fixed ? anchorId : undefined}
        >
            <div ref={wrapRef} className={css.groups_navigation}>
                {groups.map((group) => {
                    const isActive = value === group;
                    return (
                        <button
                            key={group}
                            type="button"
                            data-group-active={isActive}
                            onClick={() => onChange(group)}
                            className={`${css.resultsNavigationButton} ${css.groupNavigationButton} ${isActive ? css.resultsNavigationButtonActive : ""}`}
                        >
                            {labelOf(group)}
                        </button>
                    );
                })}
                <motion.div
                    className={css.groupNavigationIndicator}
                    initial={false}
                    animate={{ left: indicator.left, width: indicator.width }}
                    transition={indicator.animate ? { type: "tween", duration: 0.3, ease: "easeInOut" } : { duration: 0 }}
                />
            </div>
        </div>
    );
};
