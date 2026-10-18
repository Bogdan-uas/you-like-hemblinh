import { useState, useEffect, useRef } from "react";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FaCheck } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { LEADERBOARD_SORT_TEXT_COLOR } from "../logic/leaderboardSort.js";
import { STATS_TAB_LINK_COLOR } from "../logic/statsUi.js";

export const LeaderboardSelect = ({ label, options, value, onChange, renderIcon, ids, top }) => {
    const reduceMotion = useReducedMotion();
    const wrapperRef = useRef(null);
    const triggerRef = useRef(null);
    const listRef = useRef(null);

    const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
    const selected = options[selectedIndex];

    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(selectedIndex);

    const isActive = isOpen || isHovered || isKeyboardFocused;

    const openMenu = () => {
        setActiveIndex(selectedIndex);
        setIsOpen(true);
    };

    const closeMenu = (returnFocus = false) => {
        setIsOpen(false);
        if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
    };

    const chooseOption = (index, returnFocus = false) => {
        const option = options[index];
        if (option && option.value !== value) onChange(option.value);
        closeMenu(returnFocus);
    };

    useEffect(() => {
        if (isOpen) listRef.current?.focus({ preventScroll: true });
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handlePointerDown = (e) => {
            if (!wrapperRef.current?.contains(e.target)) setIsOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [isOpen]);

    useEffect(() => {
        if (!isHovered) return undefined;

        const handlePointerMove = (e) => {
            if (!wrapperRef.current?.contains(e.target)) setIsHovered(false);
        };

        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        return () => window.removeEventListener("pointermove", handlePointerMove);
    }, [isHovered]);

    const handleTriggerKeyDown = (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
        }
    };

    const handleListKeyDown = (e) => {
        const last = options.length - 1;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex((i) => (i >= last ? 0 : i + 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex((i) => (i <= 0 ? last : i - 1));
                break;
            case "Home":
                e.preventDefault();
                setActiveIndex(0);
                break;
            case "End":
                e.preventDefault();
                setActiveIndex(last);
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                chooseOption(activeIndex, true);
                break;
            case "Escape":
                e.preventDefault();
                e.stopPropagation();
                closeMenu(true);
                break;
            case "Tab":
                closeMenu(false);
                break;
            default:
                break;
        }
    };

    return (
        <div
            ref={wrapperRef}
            className={css.leaderboard_select}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={(e) => {
                let visible = false;
                try {
                    visible = e.target.matches(":focus-visible");
                } catch {
                    visible = false;
                }
                setIsKeyboardFocused(visible);
            }}
            onBlur={(e) => {
                if (!wrapperRef.current?.contains(e.relatedTarget)) setIsKeyboardFocused(false);
            }}
            style={{
                position: "fixed",
                top,
                right: "8%",
                zIndex: isOpen ? 21 : 20,
                transition: "none",
            }}
        >
            <div
                style={{
                    zoom: isActive ? 1 : 0.9,
                    opacity: isActive ? 1 : 0.7,
                    transition: "opacity 0.2s ease, zoom 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <span
                    id={ids.label}
                    onClick={() => (isOpen ? closeMenu() : openMenu())}
                    style={{
                        color: LEADERBOARD_SORT_TEXT_COLOR,
                        fontSize: 14,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                >
                    {label}
                </span>

                <div style={{ position: "relative" }}>
                    <button
                        ref={triggerRef}
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? ids.listbox : undefined}
                        aria-labelledby={`${ids.label} ${ids.value}`}
                        onClick={() => (isOpen ? closeMenu() : openMenu())}
                        onKeyDown={handleTriggerKeyDown}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 192,
                            padding: "8px 10px 8px 12px",
                            background: "#fff",
                            color: LEADERBOARD_SORT_TEXT_COLOR,
                            border: "none",
                            borderRadius: 6,
                            boxShadow: "0 2px 10px rgba(0,0,0,.2)",
                            fontFamily: "inherit",
                            fontSize: 14,
                            fontWeight: 700,
                            lineHeight: 1.2,
                            textAlign: "left",
                            textTransform: "none",
                            letterSpacing: "normal",
                            cursor: "pointer",
                            userSelect: "none",
                        }}
                    >
                        {renderIcon(selected.value)}
                        <span style={{ flex: 1, display: "grid", whiteSpace: "nowrap" }}>
                            {options.map((option) => (
                                <span
                                    key={option.value}
                                    id={option.value === selected.value ? ids.value : undefined}
                                    aria-hidden={option.value === selected.value ? undefined : true}
                                    style={{
                                        gridArea: "1 / 1",
                                        visibility: option.value === selected.value ? "visible" : "hidden",
                                        transition: "none",
                                    }}
                                >
                                    {option.label}
                                </span>
                            ))}
                        </span>
                        <IoIosArrowForward
                            size={14}
                            color={STATS_TAB_LINK_COLOR}
                            style={{
                                flex: "0 0 auto",
                                transform: `rotate(${isOpen ? -90 : 90}deg)`,
                                transition: reduceMotion ? "none" : "transform 0.2s ease",
                            }}
                        />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.ul
                                ref={listRef}
                                id={ids.listbox}
                                role="listbox"
                                tabIndex={-1}
                                aria-labelledby={ids.label}
                                aria-activedescendant={ids.option(options[activeIndex]?.value)}
                                onKeyDown={handleListKeyDown}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: "absolute",
                                    top: "calc(100% + 6px)",
                                    right: 0,
                                    width: "max-content",
                                    minWidth: "100%",
                                    boxSizing: "border-box",
                                    margin: 0,
                                    padding: 4,
                                    listStyle: "none",
                                    background: "#fff",
                                    borderRadius: 6,
                                    boxShadow: "0 2px 10px rgba(0,0,0,.2)",
                                    outline: "none",
                                }}
                            >
                                {options.map((option, index) => {
                                    const isSelected = option.value === value;
                                    const isHighlighted = index === activeIndex;

                                    return (
                                        <li
                                            key={option.value}
                                            id={ids.option(option.value)}
                                            role="option"
                                            aria-selected={isSelected}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onClick={() => chooseOption(index)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                padding: "6px 8px",
                                                borderRadius: 4,
                                                background: isHighlighted ? "#cadefd" : isSelected ? "#66a0fe" : "transparent",
                                                color: isSelected ? "#fff" : LEADERBOARD_SORT_TEXT_COLOR,
                                                fontSize: 14,
                                                fontWeight: isSelected ? 700 : 500,
                                                pointerEvents: isSelected ? "none" : "auto",
                                                whiteSpace: "nowrap",
                                                cursor: "pointer",
                                                userSelect: "none",
                                            }}
                                        >
                                            {renderIcon(option.value)}
                                            <span style={{ flex: 1, color: isHighlighted ? "#fff" : "" }}>{option.label}</span>
                                            <FaCheck
                                                size={11}
                                                color='#fff'
                                                style={{ visibility: isSelected ? "visible" : "hidden", transition: "none" }}
                                            />
                                        </li>
                                    );
                                })}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
