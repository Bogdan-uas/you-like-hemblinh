import { useEffect } from "react";
import { FaHeart, FaShieldHalved, FaStar } from "react-icons/fa6";
import { UnbeatenStreakFire } from "../components/StreakBadges.jsx";
import css from "./Progress.module.css";
import { INSURANCE_MIN_BEST_OF, bonusOptionsFor, bonusPicksFor, levelInfo, perksForLevel } from "./progressConfig.js";
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
    const maxPicks = bonusPicksFor(perks);
    const armedList = Array.isArray(ui.bonusArmed) ? ui.bonusArmed : [];
    const armed = armedList.filter((type) => options.some((option) => option.type === type)).slice(0, maxPicks);
    const armedKey = armed.join(",");
    const capped = bonus.cap > 0 && bonus.left <= 0;
    const full = armed.length >= maxPicks;
    const toggle = (type) => progressSetBonusArmed(armed.includes(type) ? armed.filter((t) => t !== type) : full ? armed : [...armed, type]);

    useEffect(
        () => () => {
            progressSetInsuranceArmed(false);
            progressSetBonusArmed([]);
        },
        [],
    );

    useEffect(() => {
        if (!insurable && ui.insuranceArmed) progressSetInsuranceArmed(false);
    }, [insurable, ui.insuranceArmed]);

    useEffect(() => {
        if (!armedList.length) return;
        if (capped) progressSetBonusArmed([]);
        else if (armedKey !== armedList.join(",")) progressSetBonusArmed(armed);
    });

    const streakText = streak > 0
        ? `Your pick streak: ${streak} correct ${streak === 1 ? "pick" : "picks"} in a row${streakReadyNext(progress) ? ` · a correct pick makes it ${streak + 1}` : ""}`
        : "No pick streak yet · a correct pick starts one";

    return (
        <div className={css.perk_strip}>
            <span className={`${css.perk_hint} ${css.streak_line}`} title="Your correct picks in a row, over all tournaments. A wrong pick or a tie ends the streak (unless a Streak Shield saves it).">
                <UnbeatenStreakFire value={streak} size={20} showZero />
                {streakText}
            </span>
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
                        title={`Choose ${maxPicks === 1 ? "one level bonus" : `up to ${maxPicks} level bonuses`} for this pick. A bonus, which isn't activated in this match, is lost. All bonus Pick'em points of a tournament can't be more than ${bonus.pct}% of the needed ones (${bonus.cap}).`}
                    >
                        <FaStar aria-hidden="true" style={{ marginRight: 5, verticalAlign: "-0.1em", color: capped ? "#a9acba" : "#e0a800" }} />
                        {capped
                            ? `Level bonuses used up in this tournament (${bonus.cap} of ${bonus.cap} bonus points)`
                            : `${maxPicks === 1 ? "Level bonus: choose one" : `Level bonuses: choose up to ${maxPicks} (${armed.length} chosen)`}${bonus.cap ? ` · ${bonus.left} of ${bonus.cap} bonus points left` : ""}`}
                    </span>
                    {!capped ? (
                        <span className={css.bonus_options}>
                            {options.map((option) => {
                                const on = armed.includes(option.type);
                                const blocked = !on && full && maxPicks > 1;
                                const value = Math.min(option.value, bonus.cap ? bonus.left : option.value);
                                return (
                                    <button
                                        key={option.type}
                                        type="button"
                                        aria-pressed={on}
                                        className={`${css.filter} ${css.bonus_option} ${on ? css.filter_active : ""} ${blocked ? css.bonus_option_blocked : ""}`}
                                        title={blocked ? `You can choose up to ${maxPicks} bonuses for one pick` : `+${value} Pick'em point${value === 1 ? "" : "s"}, if ${option.when}. Otherwise, the bonus is lost.`}
                                        onClick={() => (maxPicks === 1 ? progressSetBonusArmed(on ? [] : [option.type]) : toggle(option.type))}
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
