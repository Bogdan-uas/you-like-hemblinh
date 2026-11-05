import { useEffect } from "react";
import { FaHeart, FaShieldHalved, FaStar } from "react-icons/fa6";
import css from "./Progress.module.css";
import { INSURANCE_MIN_BEST_OF, bonusOptionsFor, levelInfo, perksForLevel } from "./progressConfig.js";
import { progressBonusCap, progressSetBonusArmed, progressSetInsuranceArmed, streakReadyNext, useProgress } from "./progressStore.js";

export function PickPerksStrip({ stage, bestOf = 1, knockout = false, pickChance = null }) {
    const { progress, ui } = useProgress();
    const perks = perksForLevel(levelInfo(progress.xp).level);
    const bonus = progressBonusCap(progress, ui.needed);
    const left = Math.max(0, perks.insurance - (progress.event?.insuranceUsed ?? 0));
    const insurable = bestOf >= INSURANCE_MIN_BEST_OF;
    const streak = progress.stats.streak ?? 0;
    const shieldsLeft = Math.max(0, perks.streakShield - (progress.event?.shieldsUsed ?? 0));
    const shieldText = !perks.streakShield
        ? null
        : !shieldsLeft
            ? "Streak Shield used up in this tournament"
            : streak > 0
                ? `Streak Shield ready · ${shieldsLeft} left · protects your streak of ${streak}`
                : `Streak Shield ready · ${shieldsLeft} left · it protects your next pick streak`;
    const options = bonusOptionsFor({ perks, stage, bestOf, knockout, streakReady: streakReadyNext(progress), chance: pickChance });
    const armed = options.some((option) => option.type === ui.bonusArmed) ? ui.bonusArmed : null;
    const capped = bonus.cap > 0 && bonus.left <= 0;

    useEffect(
        () => () => {
            progressSetInsuranceArmed(false);
            progressSetBonusArmed(null);
        },
        [],
    );

    useEffect(() => {
        if (!insurable && ui.insuranceArmed) progressSetInsuranceArmed(false);
    }, [insurable, ui.insuranceArmed]);

    useEffect(() => {
        if (ui.bonusArmed && (capped || !armed)) progressSetBonusArmed(null);
    }, [ui.bonusArmed, armed, capped]);

    if (!perks.insurance && !options.length && !shieldText) return null;

    return (
        <div className={css.perk_strip}>
            {perks.insurance ? (
                <button
                    type="button"
                    className={`${css.insurance} ${ui.insuranceArmed ? css.insurance_on : ""}`}
                    disabled={!left || !insurable}
                    onClick={() => progressSetInsuranceArmed(!ui.insuranceArmed)}
                    title={`If this pick loses, it wins back ${perks.insurePct}% of the Pick'em points it missed (rounded down). If that is 0, the insurance comes back to you. If this pick wins, the insurance isn't needed and is used up.`}
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
            {options.length ? (
                <div className={css.bonus_picker}>
                    <span
                        className={css.perk_hint}
                        title={`Choose one level bonus for this pick. If it isn't activated in this match, it is lost. All bonus Pick'em points of a tournament can't be more than ${bonus.pct}% of the needed ones (${bonus.cap}).`}
                    >
                        <FaStar aria-hidden="true" style={{ marginRight: 5, verticalAlign: "-0.1em", color: capped ? "#a9acba" : "#e0a800" }} />
                        {capped
                            ? `Level bonuses used up in this tournament (${bonus.cap} of ${bonus.cap} bonus points)`
                            : `Level bonus: choose one${bonus.cap ? ` · ${bonus.left} of ${bonus.cap} bonus points left` : ""}`}
                    </span>
                    {!capped ? (
                        <span className={css.bonus_options}>
                            {options.map((option) => {
                                const on = armed === option.type;
                                const value = Math.min(option.value, bonus.cap ? bonus.left : option.value);
                                return (
                                    <button
                                        key={option.type}
                                        type="button"
                                        aria-pressed={on}
                                        className={`${css.filter} ${css.bonus_option} ${on ? css.filter_active : ""}`}
                                        title={`+${value} Pick'em point${value === 1 ? "" : "s"}, if ${option.when}. Otherwise, the bonus is lost.`}
                                        onClick={() => progressSetBonusArmed(on ? null : option.type)}
                                    >
                                        +{value} {option.label}
                                    </button>
                                );
                            })}
                        </span>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
