import { SCOREBOARD_RESET_CODE_HASH, SECRET_KEY_CODE_HASH } from "./storageKeys.js";

export const hashCode = async (text) => {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const isResetCodeConfigured = () => !!SCOREBOARD_RESET_CODE_HASH;

export const checkResetCode = async (code) =>
    isResetCodeConfigured() && (await hashCode(code)) === SCOREBOARD_RESET_CODE_HASH;

export const isSecretCodeConfigured = () => !!SECRET_KEY_CODE_HASH;

export const checkSecretCode = async (code) =>
    isSecretCodeConfigured() && (await hashCode(code.trim())) === SECRET_KEY_CODE_HASH;
