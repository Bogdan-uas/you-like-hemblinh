import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaGear, FaCheck, FaXmark, FaKeyboard, FaLock, FaLockOpen } from "react-icons/fa6";
import css from "../SpecialModePage.module.css";
import toast from "../logic/renderSafeToast.js";
import { SECRET_KEY_CODE_HASH } from "../logic/storageKeys.js";
import {
    resetSettingsKeepingSecret,
    GAMBLE_KEY_PRESETS,
    IGNORED_KEY_CODES,
    formatKeyCode,
    isDefaultSettings,
    isSecretUnlocked,
    SIMULATE_MODES,
    SIMULATE_SPEEDS,
    SIMULATE_INSTANT_MODES,
    SIMULATE_YES_NO,
} from "../logic/settings.js";
import { checkResetCode, checkSecretCode, isResetCodeConfigured, isSecretCodeConfigured } from "../logic/codeHash.js";

const CUSTOM_KEY = "custom";
const SECRET_REVEAL_CLICKS = 5;
const SECRET_REVEAL_WINDOW_MS = 2000;

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

function SettingsChoice({ label, hint, value, options, disabled = false, onChange }) {
    return (
        <div className={`${css.settings_option} ${disabled ? css.settings_disabled : ""}`}>
            <p className={css.settings_info_text}>{label}</p>
            {hint ? <p className={css.settings_hint}>{hint}</p> : null}
            <div className={css.settings_choice} role="radiogroup" aria-label={label}>
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={value === option.value}
                        className={`${css.settings_choice_option} ${value === option.value ? css.settings_choice_option_active : ""}`}
                        disabled={disabled}
                        data-no-press
                        onClick={() => onChange(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function KeySelect({ label, hint, value, onChange: setKey, capturing, setCapturing, takenKeys = [], showTaken = false }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const taken = takenKeys.filter((entry) => entry.code);
    const extraKeys = [value, ...(showTaken ? taken.map((entry) => entry.code) : [])].filter((key, i, list) =>
        key && !GAMBLE_KEY_PRESETS.includes(key) && list.indexOf(key) === i);
    const options = [null, ...GAMBLE_KEY_PRESETS, ...extraKeys, CUSTOM_KEY];
    const takenBy = (option) => (option && option !== CUSTOM_KEY ? taken.find((entry) => entry.code === option) : null);

    const onChange = (code) => {
        const owner = takenBy(code);
        if (owner) {
            toast.error(showTaken
                ? `${formatKeyCode(code)} is already your ${owner.label}!`
                : `${formatKeyCode(code)} is already taken!`);
            return;
        }
        setKey(code);
    };

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
    });

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
            <p className={css.settings_info_text}>{label}</p>
            <p className={css.settings_hint}>{hint}</p>
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
                        const owner = showTaken ? takenBy(option) : null;
                        const locked = !!owner;
                        return (
                            <li
                                key={option ?? "off"}
                                role="option"
                                aria-selected={selected}
                                aria-disabled={locked || undefined}
                                aria-label={option === CUSTOM_KEY ? "Custom key" : formatKeyCode(option)}
                                title={locked ? `Already your ${owner.label}` : undefined}
                                tabIndex={open && !locked ? 0 : -1}
                                className={`${css.settings_dropdown_option} ${selected ? css.settings_dropdown_selected : ""} ${locked ? css.settings_dropdown_locked : ""}`}
                                onClick={() => !locked && pick(option)}
                                onKeyDown={(e) => {
                                    if (locked || (e.key !== "Enter" && e.key !== " ")) return;
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
                                {locked ? (
                                    <span className={css.settings_dropdown_taken}>
                                        <FaLock aria-hidden="true" />
                                        {owner.label}
                                    </span>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

const UNLOCK_STEPS = {
    reset: {
        label: "Step 1 of 2: the reset code",
        hint: "Enter the reset code first.",
        placeholder: "Reset code",
    },
    secret: {
        label: "Step 2 of 2: the Secret code",
        hint: "The reset code is correct. Now enter the Secret code.",
        placeholder: "Secret code",
    },
};

function SecretUnlock({ onUnlock }) {
    const [step, setStep] = useState("reset");
    const [code, setCode] = useState("");
    const [checking, setChecking] = useState(false);
    const [wrongTries, setWrongTries] = useState(0);
    const [isWrong, setIsWrong] = useState(false);
    const inputRef = useRef(null);
    const { label, hint, placeholder } = UNLOCK_STEPS[step];

    useEffect(() => {
        inputRef.current?.focus();
    }, [step]);

    const fail = (backToStart) => {
        setWrongTries((tries) => tries + 1);
        setIsWrong(true);
        if (backToStart) setStep("reset");
        toast.error(backToStart ? "Wrong code! Start again from the reset code." : "Wrong code!");
    };

    const submit = async (e) => {
        e.preventDefault();
        if (checking || !code.trim()) return;
        if (!isResetCodeConfigured() || !isSecretCodeConfigured()) {
            toast.error("The Secret is not set up on this website.");
            return;
        }
        setChecking(true);
        const correct = step === "reset" ? await checkResetCode(code) : await checkSecretCode(code);
        setChecking(false);
        setCode("");
        if (!correct) {
            fail(step === "secret");
            return;
        }
        if (step === "reset") {
            setIsWrong(false);
            setStep("secret");
            return;
        }
        onUnlock();
        toast.always("The Secret has been unlocked", { icon: "🔓", duration: 2500 });
    };

    return (
        <form className={css.settings_option} onSubmit={submit}>
            <label className={css.settings_info_text} htmlFor="settings-secret-code">{label}</label>
            <p className={css.settings_hint}>{hint}</p>
            <div key={wrongTries} className={`${css.settings_code_row} ${isWrong ? css.settings_code_wrong : ""}`}>
                <span className={css.settings_code_field}>
                    <FaLock className={css.settings_select_icon} aria-hidden="true" />
                    <input
                        ref={inputRef}
                        id="settings-secret-code"
                        className={css.settings_code_input}
                        type="password"
                        value={code}
                        placeholder={placeholder}
                        autoComplete="off"
                        spellCheck={false}
                        onChange={(e) => {
                            setCode(e.target.value);
                            setIsWrong(false);
                        }}
                    />
                </span>
                <button
                    type="submit"
                    className={`${css.gamble_button} ${checking || !code.trim() ? css.locked : ""}`}
                    disabled={checking || !code.trim()}
                >
                    {step === "reset" ? "Next" : "Unlock"}
                </button>
            </div>
        </form>
    );
}

export function SettingsPanel({ settings, onChange, open, setOpen }) {
    const [capturing, setCapturing] = useState(null);
    const [secretRevealed, setSecretRevealed] = useState(false);
    const [secretVerified, setSecretVerified] = useState(false);
    const titleClicksRef = useRef([]);
    const secretRef = useRef(null);
    const secretUnlocked = isSecretUnlocked(settings);
    const showSecretKeys = secretVerified && secretUnlocked;

    const hideSecret = () => {
        setSecretRevealed(false);
        setSecretVerified(false);
        titleClicksRef.current = [];
    };

    useEffect(() => {
        if (!open || capturing) return undefined;
        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;
            e.preventDefault();
            setSecretRevealed(false);
            setSecretVerified(false);
            titleClicksRef.current = [];
            setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown, true);
        return () => window.removeEventListener("keydown", onKeyDown, true);
    }, [open, capturing, setOpen]);

    const close = () => {
        setCapturing(null);
        hideSecret();
        setOpen(false);
    };

    const handleTitleClick = () => {
        const now = Date.now();
        const recent = [...titleClicksRef.current.filter((at) => now - at < SECRET_REVEAL_WINDOW_MS), now];
        titleClicksRef.current = recent;
        if (recent.length < SECRET_REVEAL_CLICKS) return;
        if (secretRevealed) {
            setCapturing(null);
            hideSecret();
            return;
        }
        titleClicksRef.current = [];
        setSecretRevealed(true);
    };

    const handleSecretVerified = () => {
        if (!secretUnlocked) onChange({ ...settings, secretUnlock: SECRET_KEY_CODE_HASH });
        setSecretVerified(true);
    };

    const lockSecret = () => {
        setCapturing(null);
        setSecretVerified(false);
        onChange({ ...settings, secretKey: null, secretScoreKey: null, secretUnlock: null });
    };

    const update = (key) => (next) => onChange({ ...settings, [key]: next });
    const hasKey = !!settings.gambleKey;

    const resetSettings = () => {
        if (isDefaultSettings(settings)) {
            toast.error("Your settings are already at their defaults!");
            return;
        }
        const previous = settings;
        onChange(resetSettingsKeepingSecret(settings));
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
                                    <h2 className={css.settings_title} onClick={handleTitleClick}>Settings</h2>
                                    <p className={css.settings_description}>Make the Special Mode play the way you like it.</p>
                                </div>
                                <button type="button" className={css.gamble_button} onClick={close}>
                                    Go back
                                </button>
                            </div>

                            <h3 className={css.settings_section_title}>Gambling</h3>
                            <div className={css.settings_row}>
                                <KeySelect
                                    label="Gambling Key"
                                    hint="Press this key to click the Gamble button during a series."
                                    value={settings.gambleKey}
                                    onChange={update("gambleKey")}
                                    capturing={capturing === "gamble"}
                                    setCapturing={(on) => setCapturing(on ? "gamble" : null)}
                                    takenKeys={secretUnlocked ? [{ code: settings.secretKey }, { code: settings.secretScoreKey }] : []}
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
                            <h3 className={css.settings_section_title}>Simulate</h3>
                            <div className={css.settings_row}>
                                <SettingsSwitch
                                    id="settings-simulate-enabled"
                                    label="Show the Simulate button"
                                    hint="The Simulate tab below the match window and the Gamble button. Turn it off to hide it completely."
                                    checked={settings.simulateEnabled}
                                    onChange={update("simulateEnabled")}
                                />
                                <SettingsChoice
                                    label="Instant simulate"
                                    hint="Skips the playback and decides the set or the whole series at once, no matter the Bo format."
                                    value={settings.simulateInstant}
                                    options={SIMULATE_INSTANT_MODES}
                                    disabled={!settings.simulateEnabled}
                                    onChange={update("simulateInstant")}
                                />
                            </div>
                            <div className={css.settings_row}>
                                <SettingsChoice
                                    label="Keep it open in the match window"
                                    hint="Opens the Simulate tab right away every time you open a match."
                                    value={settings.simulateKeepOpen}
                                    options={SIMULATE_YES_NO}
                                    disabled={!settings.simulateEnabled}
                                    onChange={update("simulateKeepOpen")}
                                />
                                <SettingsChoice
                                    label="Show it on the series screen"
                                    hint="The Simulate tab below the Gamble button. A running simulation still shows its Stop button."
                                    value={settings.simulateInSeries}
                                    options={SIMULATE_YES_NO}
                                    disabled={!settings.simulateEnabled}
                                    onChange={update("simulateInSeries")}
                                />
                            </div>
                            <div className={css.settings_row}>
                                <SettingsChoice
                                    label="What it simulates"
                                    hint="One set and then you decide again, or every set until the series is over."
                                    value={settings.simulateMode}
                                    options={SIMULATE_MODES}
                                    disabled={!settings.simulateEnabled || settings.simulateInstant !== "off"}
                                    onChange={update("simulateMode")}
                                />
                                <SettingsChoice
                                    label="Speed"
                                    hint="How fast the simulated rounds are played."
                                    value={settings.simulateSpeed}
                                    options={SIMULATE_SPEEDS.map((speed) => ({ value: speed, label: `${speed}x` }))}
                                    disabled={!settings.simulateEnabled || settings.simulateInstant !== "off"}
                                    onChange={update("simulateSpeed")}
                                />
                            </div>
                            <div className={css.settings_row}>
                                <SettingsSwitch
                                    id="settings-simulate-slow-down"
                                    label="Slow down on important moments"
                                    hint="Plays the rounds slower when a team is one round away from taking the set."
                                    checked={settings.simulateSlowDown}
                                    disabled={!settings.simulateEnabled || settings.simulateInstant !== "off"}
                                    onChange={update("simulateSlowDown")}
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

                            <AnimatePresence initial={false}>
                                {secretRevealed && (
                                    <motion.div
                                        key="settings-secret"
                                        className={css.settings_secret}
                                        initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                                        animate={{ height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }}
                                        exit={{ height: 0, opacity: 0, overflow: "hidden" }}
                                        transition={{ duration: 0.35, ease: "easeInOut" }}
                                        style={{ transition: "none" }}
                                        onAnimationComplete={(definition) => {
                                            if (definition.height === "auto") secretRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                                        }}
                                        ref={secretRef}
                                    >
                                        <div className={css.settings_divider} />
                                        <h3 className={css.settings_section_title}>
                                            {showSecretKeys ? <FaLockOpen aria-hidden="true" /> : <FaLock aria-hidden="true" />}
                                            Secret
                                        </h3>
                                        {showSecretKeys ? (
                                            <>
                                                <div className={css.settings_row}>
                                                    <KeySelect
                                                        label="Secret Key"
                                                        hint="Press this key to use the Secret button during a series."
                                                        value={settings.secretKey}
                                                        onChange={update("secretKey")}
                                                        capturing={capturing === "secret"}
                                                        setCapturing={(on) => setCapturing(on ? "secret" : null)}
                                                        takenKeys={[
                                                            { code: settings.gambleKey, label: "Gambling Key" },
                                                            { code: settings.secretScoreKey, label: "Score Key" },
                                                        ]}
                                                        showTaken
                                                    />
                                                    <KeySelect
                                                        label="Extended Rounds Score Key"
                                                        hint="Press this key to see the Extended Rounds score, like a right click on the Secret button."
                                                        value={settings.secretScoreKey}
                                                        onChange={update("secretScoreKey")}
                                                        capturing={capturing === "score"}
                                                        setCapturing={(on) => setCapturing(on ? "score" : null)}
                                                        takenKeys={[
                                                            { code: settings.gambleKey, label: "Gambling Key" },
                                                            { code: settings.secretKey, label: "Secret Key" },
                                                        ]}
                                                        showTaken
                                                    />
                                                </div>
                                                <div className={css.settings_row}>
                                                    <div className={css.settings_option}>
                                                        <p className={css.settings_info_text}>Lock the Secret</p>
                                                        <p className={css.settings_hint}>Turns both Secret keys off until the codes are entered again.</p>
                                                        <button
                                                            type="button"
                                                            className={`${css.cancel_button} ${css.settings_lock_button}`}
                                                            onClick={lockSecret}
                                                        >
                                                            <FaLock aria-hidden="true" />
                                                            Lock
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className={css.settings_row}>
                                                <SecretUnlock onUnlock={handleSecretVerified} />
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

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
