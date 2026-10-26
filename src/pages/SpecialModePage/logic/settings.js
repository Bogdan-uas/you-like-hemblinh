import { createContext, useContext, useEffect } from "react";
import { SETTINGS_LS_KEY, SECRET_KEY_CODE_HASH } from "./storageKeys.js";
import { isSecretCodeConfigured } from "./codeHash.js";

export const DEFAULT_SETTINGS = {
    gambleKey: null,
    holdToGamble: false,
    showGambleKey: true,
    gambleKeyProceeds: false,
    closeWithEscape: true,
    commentaryToasts: true,
    fastExtendedRounds: false,
    smoothScroll: true,
    podiumEffects: true,
    skipPodiumReveal: false,
    simulateEnabled: true,
    simulateMode: "set",
    simulateSpeed: 1,
    simulateSlowDown: true,
    simulateInstant: "off",
    simulateKeepOpen: false,
    simulateInSeries: true,
    simulateKey: null,
    secretPanelKey: null,
    secretLeftKey: null,
    secretRightKey: null,
    secretUnlock: null,
};

const RETIRED_SETTING_KEYS = ["secretKey", "secretScoreKey"];

export const SIMULATE_MODES = [
    { value: "set", label: "One set at a time" },
    { value: "series", label: "The whole series" },
];

export const SIMULATE_SPEEDS = [1, 2, 4, 8];

export const SIMULATE_YES_NO = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
];

export const SIMULATE_INSTANT_MODES = [
    { value: "off", label: "Don't allow" },
    { value: "set", label: "Per set" },
    { value: "series", label: "Whole series" },
];

export const isSecretUnlocked = (settings) =>
    isSecretCodeConfigured() && settings.secretUnlock === SECRET_KEY_CODE_HASH;

export const GAMBLE_KEY_PRESETS = ["Space", "Enter", "KeyG", "KeyF", "KeyJ", "ArrowRight", "ArrowUp"];

export const IGNORED_KEY_CODES = [
    "Escape",
    "Tab",
    "ShiftLeft",
    "ShiftRight",
    "ControlLeft",
    "ControlRight",
    "AltLeft",
    "AltRight",
    "MetaLeft",
    "MetaRight",
    "CapsLock",
    "ContextMenu",
];

const ARROWS = { ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→" };

export const formatKeyCode = (code) => {
    if (!code) return "Off";
    if (ARROWS[code]) return `Arrow ${ARROWS[code]}`;
    if (code.startsWith("Key")) return code.slice(3);
    if (code.startsWith("Digit")) return code.slice(5);
    if (code.startsWith("Numpad")) return `Num ${code.slice(6)}`;
    return code.replace(/([a-z])([A-Z])/g, "$1 $2");
};

export const shortKeyCode = (code) => (ARROWS[code] ?? formatKeyCode(code));

export const loadSettings = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_LS_KEY) ?? "null");
        if (!saved || typeof saved !== "object") return DEFAULT_SETTINGS;
        const kept = Object.fromEntries(Object.entries(saved).filter(([key]) => !RETIRED_SETTING_KEYS.includes(key)));
        return { ...DEFAULT_SETTINGS, ...kept };
    } catch {
        return DEFAULT_SETTINGS;
    }
};

export const saveSettings = (settings) => {
    try {
        localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(settings));
    } catch {
        return;
    }
};

const SECRET_SETTING_KEYS = ["secretPanelKey", "secretLeftKey", "secretRightKey", "secretUnlock"];

export const isDefaultSettings = (settings) =>
    Object.keys(DEFAULT_SETTINGS)
        .filter((key) => !SECRET_SETTING_KEYS.includes(key))
        .every((key) => settings[key] === DEFAULT_SETTINGS[key]);

export const resetSettingsKeepingSecret = (settings) => ({
    ...DEFAULT_SETTINGS,
    secretPanelKey: settings.secretPanelKey,
    secretLeftKey: settings.secretLeftKey,
    secretRightKey: settings.secretRightKey,
    secretUnlock: settings.secretUnlock,
});

export const SettingsContext = createContext(DEFAULT_SETTINGS);

export const useSpecialModeSettings = () => useContext(SettingsContext);

const isTypingTarget = (element) =>
    !!element && (element.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName));

export const useGambleKey = ({ code, hold, proceeds, enabled }) => {
    useEffect(() => {
        if (!code || !enabled) return undefined;

        let pressed = null;

        const findButton = () => {
            if (document.querySelector("[data-key-blocker]")) return null;
            return document.querySelector("[data-gamble-button]")
                ?? (proceeds ? document.querySelector("[data-proceed-button]") : null);
        };

        const press = (button) => {
            if (pressed === button) return;
            delete button.dataset.uiReleased;
            button.dataset.uiPressed = "";
            pressed = button;
        };

        const release = () => {
            const button = pressed;
            if (!button) return;
            pressed = null;
            delete button.dataset.uiPressed;
            button.dataset.uiReleased = "";
            setTimeout(() => delete button.dataset.uiReleased, 320);
        };

        const matches = (e) => e.code === code && !e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget(e.target);

        const onKeyDown = (e) => {
            if (!matches(e)) return;
            const button = findButton();
            if (!button) return;
            e.preventDefault();
            if (e.repeat && (!hold || !button.hasAttribute("data-gamble-button"))) return;
            if (button.disabled) return;
            press(button);
            button.click();
        };

        const onKeyUp = (e) => {
            if (e.code !== code) return;
            if (findButton()) e.preventDefault();
            release();
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("blur", release);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("blur", release);
            release();
        };
    }, [code, hold, proceeds, enabled]);
};

export const useSimulateKey = ({ code, enabled }) => {
    useEffect(() => {
        if (!code || !enabled) return undefined;

        const onKeyDown = (e) => {
            if (e.code !== code) return;
            if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
            const button = [...document.querySelectorAll("[data-simulate-action]")].find((element) => element.offsetParent !== null);
            if (!button) return;
            if ([...document.querySelectorAll("[data-key-blocker]")].some((blocker) => !blocker.contains(button))) return;
            e.preventDefault();
            e.stopPropagation();
            if (!button.disabled) button.click();
        };

        window.addEventListener("keydown", onKeyDown, true);
        return () => window.removeEventListener("keydown", onKeyDown, true);
    }, [code, enabled]);
};

export const SECRET_EVENT = "special-mode-secret";

export const useSecretKeys = ({ panelCode, leftCode, rightCode, enabled }) => {
    useEffect(() => {
        if ((!panelCode && !leftCode && !rightCode) || !enabled) return undefined;
        const actions = { [panelCode]: "panel", [leftCode]: "left", [rightCode]: "right" };

        const onKeyDown = (e) => {
            const action = e.code && actions[e.code];
            if (!action) return;
            if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
            if (document.querySelector("[data-key-blocker]")) return;
            if (!document.querySelector("[data-secret-button]")) return;
            e.preventDefault();
            window.dispatchEvent(new CustomEvent(SECRET_EVENT, { detail: action }));
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [panelCode, leftCode, rightCode, enabled]);
};
