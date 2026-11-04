import { useEffect, useMemo, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { animate, motion, useMotionValue } from "framer-motion";
import { FaTriangleExclamation } from "react-icons/fa6";
import css from "./Progress.module.css";
import page from "../SpecialModePage.module.css";
import { FadeOut } from "../components/FadeOut.jsx";
import { clearHallOfFameStore, readHallOfFame } from "../logic/hallOfFameDb.js";
import { hasStorageChanges, removeEverythingFromStorage } from "./resetStorage.js";
import { progressIsPristine, progressResetAll } from "./progressStore.js";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const HOLD_MS = 3000;

const makePassword = () => {
    const pick = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    return `${Array.from({ length: 4 }, pick).join("")}-${Array.from({ length: 4 }, pick).join("")}`;
};

const makeSum = () => {
    const a = 12 + Math.floor(Math.random() * 70);
    const b = 12 + Math.floor(Math.random() * 70);
    return { a, b, answer: a + b };
};

function HoldButton({ onDone }) {
    const fill = useMotionValue(0);
    const controlsRef = useRef(null);
    const [label, setLabel] = useState("Hold to reset everything");

    const start = () => {
        controlsRef.current?.stop();
        setLabel("Keep holding...");
        controlsRef.current = animate(fill, 1, {
            duration: ((1 - fill.get()) * HOLD_MS) / 1000,
            ease: "linear",
            onComplete: () => {
                setLabel("Resetting...");
                onDone();
            },
        });
    };

    const cancel = () => {
        if (fill.get() >= 1) return;
        controlsRef.current?.stop();
        setLabel("Hold to reset everything");
        controlsRef.current = animate(fill, 0, { duration: 0.25 });
    };

    return (
        <button
            type="button"
            className={css.hold}
            onPointerDown={start}
            onPointerUp={cancel}
            onPointerLeave={cancel}
            onPointerCancel={cancel}
            onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) start();
            }}
            onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter") cancel();
            }}
        >
            <motion.span className={css.hold_fill} style={{ scaleX: fill }} />
            <span className={css.hold_label}>{label}</span>
        </button>
    );
}

export function ResetEverything() {
    const [available, setAvailable] = useState(false);
    const [step, setStep] = useState(0);
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const password = useMemo(() => (step === 1 ? makePassword() : ""), [step]);
    const [sum, setSum] = useState(makeSum);

    useEffect(() => {
        let alive = true;
        readHallOfFame()
            .then((records) => alive && setAvailable(records.length > 0 || !progressIsPristine() || hasStorageChanges()))
            .catch(() => alive && setAvailable(!progressIsPristine() || hasStorageChanges()));
        return () => {
            alive = false;
        };
    }, []);

    const close = () => {
        setStep(0);
        setInput("");
        setError("");
    };

    const next = () => {
        if (step === 1) {
            if (input.trim().toUpperCase() !== password) {
                setError("That's not the password. Type it exactly as it's shown.");
                return;
            }
            setSum(makeSum());
            setStep(2);
        } else if (step === 2) {
            if (Number(input.trim()) !== sum.answer) {
                setError("That's not the right answer.");
                setSum(makeSum());
                setInput("");
                return;
            }
            setStep(3);
        }
        setInput("");
        setError("");
    };

    const resetNow = async () => {
        await clearHallOfFameStore().catch(() => null);
        progressResetAll();
        removeEverythingFromStorage();
        window.location.reload();
    };

    if (!available) return null;

    return (
        <>
            <button type="button" className={css.reset_all} onClick={() => setStep(1)}>
                <FaTriangleExclamation aria-hidden="true" />
                Reset everything!
            </button>

            <FadeOut>{step > 0 && (
                <div className={`${page.restart_modal} ${css.reset_dialog}`} data-key-blocker>
                    <span className={css.reset_step}>STEP {step} OF 3</span>
                    {step === 1 ? (
                        <>
                            <p className={page.restart_text}>
                                This resets <strong>everything</strong>: the settings, the Hall of Fame, the Leaderboard, your level, your achievements and every tournament. <br />
                                <strong>You will NOT be able to revert this action!</strong> <br />
                                Type this password to continue:
                            </p>
                            <span className={css.reset_password}>{password}</span>
                        </>
                    ) : step === 2 ? (
                        <p className={page.restart_text}>
                            Just to be sure, how much is <strong>{sum.a} + {sum.b}</strong>?
                        </p>
                    ) : (
                        <p className={page.restart_text}>
                            The last step: press and hold the button below for {HOLD_MS / 1000} seconds. <br />
                            Let go before it's full, and nothing happens.
                        </p>
                    )}
                    {step < 3 ? (
                        <form
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
                            onSubmit={(e) => {
                                e.preventDefault();
                                next();
                            }}
                        >
                            <input
                                className={page.reset_input}
                                style={{ marginBottom: 0 }}
                                type="text"
                                inputMode={step === 2 ? "numeric" : "text"}
                                value={input}
                                autoFocus
                                autoComplete="off"
                                spellCheck={false}
                                placeholder={step === 1 ? "Password" : "Answer"}
                                onPaste={(e) => e.preventDefault()}
                                onDrop={(e) => e.preventDefault()}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    setError("");
                                }}
                            />
                            {error ? <span className={css.reset_error}>{error}</span> : null}
                            <div className={page.restart_buttons}>
                                <button type="button" className={page.cancel_button} onClick={close}>
                                    Cancel
                                </button>
                                <button type="submit" className={`${page.confirm_button} ${input.trim() ? "" : page.locked}`} disabled={!input.trim()}>
                                    Next
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <HoldButton onDone={resetNow} />
                            <button type="button" className={page.cancel_button} onClick={close}>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}</FadeOut>
        </>
    );
}
