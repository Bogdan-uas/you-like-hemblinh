import { useEffect } from "react";
import { FaHeart, FaShieldHalved } from "react-icons/fa6";
import css from "./Progress.module.css";
import { INSURANCE_MIN_BEST_OF, STREAK_STEP, UPSET_CHANCE, levelInfo, perksForLevel } from "./progressConfig.js";
import { progressSetInsuranceArmed, useProgress } from "./progressStore.js";

export function PickPerksStrip({ stage, bestOf = 1, knockout = false }) {
    const { progress, ui } = useProgress();
    const perks = perksForLevel(levelInfo(progress.xp).level);
    const left = Math.max(0, perks.insurance - (progress.event?.insuranceUsed ?? 0));
    const insurable = bestOf >= INSURANCE_MIN_BEST_OF;
    const streak = progress.stats.streak ?? 0;
    const streakNext = (streak + 1) % STREAK_STEP === 0;
    const shieldsLeft = Math.max(0, perks.streakShield - (progress.event?.shieldsUsed ?? 0));
    const shieldText = !perks.streakShield
        ? null
        : !shieldsLeft
            ? "Streak Shield used up in this tournament"
            : streak > 0
                ? `Streak Shield ready · ${shieldsLeft} left · protects your streak of ${streak}`
                : `Streak Shield ready · ${shieldsLeft} left · it protects your next pick streak`;

    useEffect(() => () => progressSetInsuranceArmed(false), []);

    useEffect(() => {
        if (!insurable && ui.insuranceArmed) progressSetInsuranceArmed(false);
    }, [insurable, ui.insuranceArmed]);

    const hints = [
        stage === "gf" && perks.gfBonus ? `+${perks.gfBonus} Grand Final bonus` : null,
        perks.upsetBonus ? `+${perks.upsetBonus} if your pick has ${Math.round(UPSET_CHANCE * 100)}% or less` : null,
        streakNext && perks.streakBonus ? `+${perks.streakBonus} streak bonus (${streak + 1} in a row)` : null,
        insurable && perks.comebackBonus ? `+${perks.comebackBonus} comeback bonus` : null,
        insurable && perks.sweepBonus ? `+${perks.sweepBonus} sweep bonus` : null,
        perks.overtimeBonus ? `+${perks.overtimeBonus} overtime bonus` : null,
        insurable && perks.deciderBonus ? `+${perks.deciderBonus} decider bonus` : null,
        knockout && perks.knockoutBonus ? `+${perks.knockoutBonus} knockout bonus` : null,
        bestOf >= 5 && perks.longSeriesBonus ? `+${perks.longSeriesBonus} long series bonus` : null,
    ].filter(Boolean);

    if (!perks.insurance && !hints.length && !shieldText) return null;

    return (
        <div className={css.perk_strip}>
            {perks.insurance ? (
                <button
                    type="button"
                    className={`${css.insurance} ${ui.insuranceArmed ? css.insurance_on : ""}`}
                    disabled={!left || !insurable}
                    onClick={() => progressSetInsuranceArmed(!ui.insuranceArmed)}
                    title={`If this pick loses, it wins back ${perks.insurePct}% of the Pick'em points it missed (rounded down). If that is 0, the insurance comes back to you.`}
                >
                    <FaShieldHalved aria-hidden="true" />
                    {!left
                        ? "No Pick'em Insurance left in this tournament"
                        : !insurable
                            ? `Pick'em Insurance works from Best of ${INSURANCE_MIN_BEST_OF} · ${left} left`
                            : `Pick'em Insurance ${ui.insuranceArmed ? "on" : "off"} · ${left} left`}
                </button>
            ) : null}
            {shieldText ? (
                <span
                    className={css.perk_hint}
                    title="If your pick is wrong while you have a pick streak, the Streak Shield keeps the streak alive instead of resetting it. It is only used when it saves a streak."
                >
                    <FaHeart aria-hidden="true" style={{ marginRight: 5, verticalAlign: "-0.1em", color: shieldsLeft ? "#e5484d" : "#a9acba" }} />
                    {shieldText}
                </span>
            ) : null}
            {hints.length ? <span className={css.perk_hint}>Level bonuses: {hints.join(" · ")}</span> : null}
        </div>
    );
}
