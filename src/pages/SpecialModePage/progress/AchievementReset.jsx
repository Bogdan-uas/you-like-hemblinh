import { useState } from "react";
import css from "./Progress.module.css";
import page from "../SpecialModePage.module.css";
import toast from "../logic/renderSafeToast.js";
import { FadeOut } from "../components/FadeOut.jsx";
import { checkResetCode, isResetCodeConfigured } from "../logic/codeHash.js";
import { TIERS } from "./progressConfig.js";
import { progressLowerAchievement, progressResetAchievements } from "./progressStore.js";
import { formatXp } from "./progressUi.js";

export function AchievementReset({ target, onClose }) {
    const [step, setStep] = useState("code");
    const [code, setCode] = useState("");
    const [checking, setChecking] = useState(false);
    const [toTier, setToTier] = useState(null);

    const close = () => {
        setStep("code");
        setCode("");
        setToTier(null);
        onClose();
    };

    const verify = async (e) => {
        e?.preventDefault();
        if (checking) return;
        if (!isResetCodeConfigured()) {
            toast.error("Reset code is not configured.");
            return;
        }
        setChecking(true);
        const correct = await checkResetCode(code);
        setChecking(false);
        if (!correct) {
            toast.error("WRONG PASSWORD!");
            return;
        }
        toast.success("Password correct!!!");
        setCode("");
        setStep(target?.lower ? "tier" : "confirm");
    };

    const confirm = () => {
        if (target.lower) {
            const removed = progressLowerAchievement(target.ids[0], toTier);
            toast.success(`"${target.title}" has been reset to ${TIERS[toTier - 1].label}${removed ? ` (−${formatXp(removed)} XP)` : ""}`);
        } else {
            const removed = progressResetAchievements(target.ids);
            toast.success(`${target.all ? "All achievements have" : `"${target.title}" has`} been reset${removed ? ` (−${formatXp(removed)} XP)` : ""}`);
        }
        close();
    };

    return (
        <>
            <FadeOut>{target && step === "code" && (
                <form className={`${page.restart_modal} ${css.reset_dialog}`} data-key-blocker onSubmit={verify}>
                    <div style={{ width: "100%" }}>
                        <label className={page.reset_label} htmlFor="achievement-reset-code">
                            Identification code
                        </label>
                        <input
                            id="achievement-reset-code"
                            className={page.reset_input}
                            type="password"
                            value={code}
                            autoFocus
                            onChange={(e) => setCode(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <div className={page.restart_buttons}>
                        <button type="button" className={page.cancel_button} onClick={close}>
                            Cancel
                        </button>
                        <button type="submit" className={page.confirm_button}>
                            Confirm
                        </button>
                    </div>
                </form>
            )}</FadeOut>

            <FadeOut>{target?.lower && step === "tier" && (
                <div className={`${page.restart_modal} ${css.reset_dialog}`} data-key-blocker>
                    <p className={page.restart_text}>
                        Reset &quot;{target.title}&quot; from <b>{TIERS[target.lower.current - 1].label}</b> to:
                    </p>
                    <div className={css.tier_pick}>
                        {TIERS.slice(0, target.lower.current - 1).map((tier, i) => (
                            <button
                                key={tier.key}
                                type="button"
                                className={css.tier_pick_button}
                                style={{ background: `radial-gradient(circle at 35% 28%, ${tier.light} 0%, ${tier.color} 55%, ${tier.dark} 100%)`, borderColor: tier.dark }}
                                onClick={() => {
                                    setToTier(i + 1);
                                    setStep("confirm");
                                }}
                            >
                                {tier.label}
                            </button>
                        ))}
                    </div>
                    <div className={page.restart_buttons}>
                        <button type="button" className={page.cancel_button} onClick={close}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}</FadeOut>

            <FadeOut>{target && step === "confirm" && (
                <div className={`${page.restart_modal} ${css.reset_dialog}`} data-key-blocker>
                    <p className={page.restart_text}>
                        <b>Are you sure?!</b> <br />
                        {target.lower ? (
                            <>By pressing the button &quot;Confirm&quot;, you&apos;ll reset &quot;{target.title}&quot; to {TIERS[(toTier ?? 1) - 1].label}, and lose the XP of every tier above it!</>
                        ) : target.all ? (
                            <>By pressing the button &quot;Confirm&quot;, you&apos;ll reset ALL achievements and their progress, and lose the XP they gave you!</>
                        ) : (
                            <>By pressing the button &quot;Confirm&quot;, you&apos;ll reset &quot;{target.title}&quot; and its progress, and lose the XP it gave you!</>
                        )}
                    </p>
                    <div className={page.restart_buttons}>
                        <button type="button" className={page.cancel_button} onClick={close}>
                            Cancel
                        </button>
                        <button type="button" className={page.confirm_button} onClick={confirm}>
                            Confirm
                        </button>
                    </div>
                </div>
            )}</FadeOut>
        </>
    );
}
