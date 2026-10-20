import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaGear, FaCheck, FaXmark, FaKeyboard } from "react-icons/fa6";
import css from "../SpecialModePage.module.css";
import toast from "../logic/renderSafeToast.js";
import {
    DEFAULT_SETTINGS,
    GAMBLE_KEY_PRESETS,
    IGNORED_KEY_CODES,
    formatKeyCode,
    isDefaultSettings,
} from "../logic/settings.js";

const CUSTOM_KEY = "custom";

function SettingsSwitch({ id, label, hint, checked, disabled = false, onChange }) {
    return (
        <div className={`${css.settings_option} ${disabled ? css.settings_disabled : ""}`}>
            <label className={css.settings_info_text} htmlFor={id}>{label}</label>
            {hint ? <p className={css.settings_hint}>{hint}</p> : null}
            <input
                className={css.settings_switch_input}
                type="checkbox"
                id={id}
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            <label
                className={css.settings_switch}
                htmlFor={id}
                role="switch"
                aria-checked={checked}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                    if (disabled || (e.key !== "Enter" && e.key !== " ")) return;
                    e.preventDefault();
                    onChange(!checked);
                }}
            >
                <span className={css.settings_switch_circle}>
                    <FaCheck className={css.settings_switch_on} aria-hidden="true" />
                    <FaXmark className={css.settings_switch_off} aria-hidden="true" />
                </span>
            </label>
        </div>
    );
}

function GambleKeySelect({ value, onChange, capturing, setCapturing }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const isCustom = !!value && !GAMBLE_KEY_PRESETS.includes(value);
    const options = [null, ...GAMBLE_KEY_PRESETS, ...(isCustom ? [value] : []), CUSTOM_KEY];

    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (e) => {
            if (!containerRef.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    useEffect(() => {
        if (!capturing) return undefined;
        const onKeyDown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.code === "Escape") {
                setCapturing(false);
                return;
            }
            if (IGNORED_KEY_CODES.includes(e.code)) return;
            onChange(e.code);
            setCapturing(false);
        };
        window.addEventListener("keydown", onKeyDown, true);
        return () => window.removeEventListener("keydown", onKeyDown, true);
    }, [capturing, onChange, setCapturing]);

    const pick = (option) => {
        setOpen(false);
        if (option === CUSTOM_KEY) {
            setCapturing(true);
            return;
        }
        onChange(option);
    };

    return (
        <div className={css.settings_option}>
            <p className={css.settings_info_text}>Gambling Key</p>
            <p className={css.settings_hint}>Press this key to click the Gamble button during a series.</p>
            <div ref={containerRef} className={css.settings_select}>
                <button
                    type="button"
                    className={`${css.settings_select_button} ${capturing ? css.settings_select_capturing : ""}`}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    data-no-press
                    onClick={() => {
                        if (capturing) {
                            setCapturing(false);
                            return;
                        }
                        setOpen((prev) => !prev);
                    }}
                >
                    <FaKeyboard className={css.settings_select_icon} aria-hidden="true" />
                    {capturing ? (
                        <span className={css.settings_select_waiting}>Press any key...</span>
                    ) : value ? (
                        <kbd className={css.settings_key}>{formatKeyCode(value)}</kbd>
                    ) : (
                        <span>Off</span>
                    )}
                    <span className={`${css.settings_arrow} ${open ? css.settings_arrow_open : ""}`} aria-hidden="true" />
                </button>
                <ul
                    className={`${css.settings_dropdown} ${open ? css.settings_dropdown_open : ""}`}
                    role="listbox"
                    data-lenis-prevent
                >
                    {options.map((option) => {
                        const selected = option === value;
                        return (
                            <li
                                key={option ?? "off"}
                                role="option"
                                aria-selected={selected}
                                aria-label={option === CUSTOM_KEY ? "Custom key" : formatKeyCode(option)}
                                tabIndex={open ? 0 : -1}
                                className={`${css.settings_dropdown_option} ${selected ? css.settings_dropdown_selected : ""}`}
                                onClick={() => pick(option)}
                                onKeyDown={(e) => {
                                    if (e.key !== "Enter" && e.key !== " ") return;
                                    e.preventDefault();
                                    pick(option);
                                }}
                            >
                                {option === CUSTOM_KEY ? (
                                    "Custom key..."
                                ) : option ? (
                                    <kbd className={css.settings_key}>{formatKeyCode(option)}</kbd>
                                ) : (
                                    "Off"
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export function SettingsPanel({ settings, onChange, open, setOpen }) {
    const [capturing, setCapturing] = useState(false);

    useEffect(() => {
        if (!open || capturing) return undefined;
        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;
            e.preventDefault();
            setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown, true);
        return () => window.removeEventListener("keydown", onKeyDown, true);
    }, [open, capturing, setOpen]);

    const close = () => {
        setCapturing(false);
        setOpen(false);
    };

    const update = (key) => (next) => onChange({ ...settings, [key]: next });
    const hasKey = !!settings.gambleKey;

    const resetSettings = () => {
        if (isDefaultSettings(settings)) {
            toast.error("Your settings are already at their defaults!");
            return;
        }
        const previous = settings;
        onChange(DEFAULT_SETTINGS);
        toast.always((t) => (
            <span className={css.settings_undo_toast}>
                Settings have been reset.
                <button
                    type="button"
                    className={css.settings_undo_button}
                    onClick={() => {
                        onChange(previous);
                        toast.dismiss(t.id);
                    }}
                >
                    Undo
                </button>
            </span>
        ), { duration: 5000 });
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="settings-overlay"
                        className={css.settings_overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ transition: "none" }}
                        onClick={close}
                    >
                        <motion.div
                            className={`${css.settings_modal} ${css.hidden_scrollbar}`}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Settings"
                            data-lenis-prevent
                            initial={{ opacity: 0, y: 40, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 260, damping: 24 }}
                            style={{ transition: "none" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={css.settings_container}>
                                <div className={css.settings_main_content}>
                                    <h2 className={css.settings_title}>Settings</h2>
                                    <p className={css.settings_description}>Make the Special Mode play the way you like it.</p>
                                </div>
                                <button type="button" className={css.gamble_button} onClick={close}>
                                    Go back
                                </button>
                            </div>

                            <h3 className={css.settings_section_title}>Gambling</h3>
                            <div className={css.settings_row}>
                                <GambleKeySelect
                                    value={settings.gambleKey}
                                    onChange={update("gambleKey")}
                                    capturing={capturing}
                                    setCapturing={setCapturing}
                                />
                                <SettingsSwitch
                                    id="settings-gamble-key-proceeds"
                                    label="The key also presses Proceed and Continue"
                                    hint="Moves you through intros, results and Winners' Screens with the same key."
                                    checked={settings.gambleKeyProceeds}
                                    disabled={!hasKey}
                                    onChange={update("gambleKeyProceeds")}
                                />
                            </div>
                            <div className={css.settings_row}>
                                <SettingsSwitch
                                    id="settings-hold-to-gamble"
                                    label="Hold to keep gambling"
                                    hint="Holding the Gambling Key keeps gambling whenever the button is ready."
                                    checked={settings.holdToGamble}
                                    disabled={!hasKey}
                                    onChange={update("holdToGamble")}
                                />
                                <SettingsSwitch
                                    id="settings-show-gamble-key"
                                    label="Show the key on the Gamble button"
                                    hint="Adds a small key badge next to the Gamble text."
                                    checked={settings.showGambleKey}
                                    disabled={!hasKey}
                                    onChange={update("showGambleKey")}
                                />
                            </div>

                            <div className={css.settings_divider} />
                            <h3 className={css.settings_section_title}>Pace & Windows</h3>
                            <div className={css.settings_row}>
                                <SettingsSwitch
                                    id="settings-fast-extended-rounds"
                                    label="Faster Extended Rounds"
                                    hint="Halves the pauses between the Extended Rounds comparisons."
                                    checked={settings.fastExtendedRounds}
                                    onChange={update("fastExtendedRounds")}
                                />
                                <SettingsSwitch
                                    id="settings-close-with-escape"
                                    label="Close windows with Esc"
                                    hint="Closes the match window, the Detailed Match Breakdown and the Restart / Terminate pop-ups."
                                    checked={settings.closeWithEscape}
                                    onChange={update("closeWithEscape")}
                                />
                            </div>
                            <div className={css.settings_row}>
                                <SettingsSwitch
                                    id="settings-commentary-toasts"
                                    label="Commentary notifications"
                                    hint="The play-by-play toasts, like &quot;Second Half begins&quot;. Warnings always show."
                                    checked={settings.commentaryToasts}
                                    onChange={update("commentaryToasts")}
                                />
                                <SettingsSwitch
                                    id="settings-smooth-scroll"
                                    label="Smooth scrolling"
                                    hint="Turn it off for instant, native mouse wheel scrolling."
                                    checked={settings.smoothScroll}
                                    onChange={update("smoothScroll")}
                                />
                            </div>

                            <div className={css.settings_divider} />
                            <h3 className={css.settings_section_title}>Winners&apos; Screen</h3>
                            <div className={css.settings_row}>
                                <SettingsSwitch
                                    id="settings-skip-podium-reveal"
                                    label="Skip the podium reveal"
                                    hint="Shows the Top 4 straight away instead of revealing them one by one."
                                    checked={settings.skipPodiumReveal}
                                    onChange={update("skipPodiumReveal")}
                                />
                                <SettingsSwitch
                                    id="settings-podium-effects"
                                    label="Winners' Screen effects"
                                    hint="Rays, sparkles and confetti around the podium."
                                    checked={settings.podiumEffects}
                                    disabled={settings.skipPodiumReveal}
                                    onChange={update("podiumEffects")}
                                />
                            </div>

                            <div className={css.settings_divider} />
                            <button type="button" className={css.confirm_button} onClick={resetSettings}>
                                Reset settings
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                type="button"
                className={`${css.info_button} ${css.settings_gear} ${open ? css.settings_gear_open : ""}`}
                aria-label={open ? "Close settings" : "Settings"}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => (open ? close() : setOpen(true))}
            >
                <FaGear className={css.settings_gear_icon} aria-hidden="true" />
            </button>
        </>
    );
}
