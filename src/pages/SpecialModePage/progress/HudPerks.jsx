import { FaShieldHalved, FaStar, FaXmark } from "react-icons/fa6";
import { LostStreakFire, SavedStreakFire, UnbeatenStreakFire } from "../components/StreakBadges.jsx";
import css from "./Progress.module.css";
import page from "../SpecialModePage.module.css";
import { BONUS_OPTIONS, insurancePayout, pickedBonusesOf } from "./progressConfig.js";
import { basePickemPoints } from "./progressEngine.js";
import { bonusPayout } from "./pickPerks.js";
import { comebackValueLabel } from "../logic/comebacks.js";
import { useProgress } from "./progressStore.js";
import { getLiveSetResult, getSetResultWinner } from "../logic/series.js";

const BONUS_LABELS = Object.fromEntries(BONUS_OPTIONS.map((option) => [option.type, option.label]));
const BONUS_WHEN = Object.fromEntries(BONUS_OPTIONS.map((option) => [option.type, option.when]));

const seriesWon = (seriesState) => !seriesState.banner.tie && (seriesState.playerWonSets ?? 0) > (seriesState.playerLostSets ?? 0);

const insuranceOutcome = (pick, seriesState) => {
    if (!seriesState?.banner) return null;
    if (seriesWon(seriesState)) return { kind: "used", label: "Insurance", value: "Not needed" };
    const base = basePickemPoints(pick.bestOf, false, seriesState.playerWonSets ?? 0);
    const payout = insurancePayout(pick.bestOf, base, pick.insurePct);
    return payout > 0 ? { kind: "paid", label: "Insured", value: `+${payout}` } : { kind: "returned", label: "Insurance", value: "Returned" };
};

const playedSets = (seriesState) =>
    [...(seriesState.finishedSets || []), getLiveSetResult(seriesState)]
        .filter(Boolean)
        .filter((set, i, list) => list.findIndex((x) => x.set === set.set) === i)
        .map((set) => ({ won: getSetResultWinner(set) === "left", left: set.leftScore ?? 0, right: set.rightScore ?? 0 }));

const bonusOutcomes = (pick, seriesState) => {
    const chosen = pickedBonusesOf(pick);
    if (!seriesState?.banner) return chosen.map(() => null);
    if (!seriesWon(seriesState)) return chosen.map(() => ({ kind: "lost", value: "Lost" }));
    const sets = playedSets(seriesState);
    let left = pick.bonusLeft ?? 0;
    return chosen.map((bonus) => {
        const payout = bonusPayout(bonus.type, bonus.value, {
            bestOf: pick.bestOf,
            setsWon: sets.map((set) => set.won),
            setScores: sets.map((set) => ({ left: set.left, right: set.right })),
            ready: bonus.ready,
        });
        const amount = Math.min(payout, left);
        left -= amount;
        return amount > 0 ? { kind: "paid", value: `+${amount}` } : { kind: "lost", value: "Lost" };
    });
};

function HudChip({ variant, hud, ghost, label, value, icon, tone, title }) {
    const toneClass = `${tone ? css[`hud_insured_${tone}`] ?? "" : ""} ${ghost ? css.hud_ghost : ""} ${variant === "pgx" ? css.hud_insured_pgx : ""}`;
    const Icon = icon;

    if (variant === "official") {
        return (
            <span className={`${page.best_of_badge} ${css.hud_insured_official} ${toneClass}`} title={ghost ? undefined : title} aria-hidden={ghost || undefined}>
                <span className={page.best_of_badge_label}>{label}</span>
                <span key={value} className={`${page.best_of_badge_value} ${css.hud_insured_value}`}>
                    <Icon aria-hidden="true" />
                    {value}
                </span>
            </span>
        );
    }

    if (variant === "pem" || variant === "ess") {
        const base = variant === "pem" ? `${hud.chip} ${hud.chip_bo}` : `${hud.set} ${hud.set_bo}`;
        return (
            <span className={`${base} ${css.hud_insured} ${toneClass}`} title={ghost ? undefined : title} aria-hidden={ghost || undefined}>
                <Icon aria-hidden="true" className={css.hud_insured_icon} />
                <span key={value} className={css.hud_insured_value}>{value}</span>
            </span>
        );
    }

    const inner = (
        <>
            <span className={hud.set_label}>{label}</span>
            <span key={value} className={`${hud.set_value} ${css.hud_insured_value}`}>
                <Icon aria-hidden="true" className={css.hud_insured_icon} />
                {value}
            </span>
        </>
    );

    return (
        <span className={`${hud.set} ${hud.set_bo} ${css.hud_insured} ${toneClass}`} title={ghost ? undefined : title} aria-hidden={ghost || undefined}>
            {variant === "cst" ? <span className={hud.set_inner}>{inner}</span> : inner}
        </span>
    );
}

export function HudInsurance({ variant, hud, seriesState, ghost = false }) {
    const { progress } = useProgress();
    const pick = progress.activePick;
    const chosen = pickedBonusesOf(pick);
    if (!pick?.insured && !chosen.length) return null;
    const chips = [];

    if (pick.insured) {
        const outcome = insuranceOutcome(pick, seriesState);
        const value = outcome?.value ?? `${pick.insurePct}%`;
        chips.push(
            <HudChip
                key="insurance"
                variant={variant}
                hud={hud}
                ghost={ghost}
                label={outcome?.label ?? "Insured"}
                value={value}
                icon={FaShieldHalved}
                tone={outcome?.kind}
                title={
                    outcome?.kind === "paid"
                        ? `Your Pick'em Insurance wins back ${value.slice(1)} Pick'em point${value === "+1" ? "" : "s"}`
                        : outcome?.kind === "returned"
                            ? "Your won sets already gave all the points the insurance could give, so it comes back to you"
                            : outcome?.kind === "used"
                                ? "Your pick won, so the Pick'em Insurance wasn't needed and is used up"
                                : `Pick'em Insurance: if this pick loses, it wins back ${pick.insurePct}% of the Pick'em points it missed`
                }
            />,
        );
    }

    const outcomes = bonusOutcomes(pick, seriesState);
    let shownLeft = pick.bonusLeft ?? 0;
    chosen.forEach((bonus, i) => {
        const outcome = outcomes[i];
        const name = BONUS_LABELS[bonus.type] ?? "Bonus";
        const amount = Math.max(0, Math.min(bonus.value || 0, shownLeft));
        shownLeft -= amount;
        chips.push(
            <HudChip
                key={`bonus-${bonus.type}`}
                variant={variant}
                hud={hud}
                ghost={ghost}
                label={name}
                value={outcome?.value ?? (bonus.type === "comebackBonus" ? comebackValueLabel(amount, pick.bestOf) : `+${amount}`)}
                icon={outcome?.kind === "lost" ? FaXmark : FaStar}
                tone={outcome?.kind === "paid" ? "paid" : outcome?.kind === "lost" ? "returned" : null}
                title={
                    outcome?.kind === "paid"
                        ? `Your ${name} bonus is activated: ${outcome.value} Pick'em point${outcome.value === "+1" ? "" : "s"}`
                        : outcome?.kind === "lost"
                            ? `Your ${name} bonus wasn't activated in this match, so it is lost`
                            : `${name} bonus: ${bonus.type === "comebackBonus" ? comebackValueLabel(amount, pick.bestOf) : `+${amount}`}, if ${BONUS_WHEN[bonus.type] ?? "it is activated"}`
                }
            />,
        );
    });

    return variant === "ess" || variant === "cst" ? <span className={`${css.hud_insured_stack} ${ghost ? css.hud_ghost : ""}`}>{chips}</span> : chips;
}

const findCut = (progress, value) =>
    [progress.event?.neededCut, progress.lastSummary?.perks?.neededCut].find((cut) => cut && cut.after === value && cut.before > cut.after) ?? null;

export function NeededPerkTag({ value, cut = null, fallback = true }) {
    const { progress } = useProgress();
    const found = cut ?? (fallback ? findCut(progress, value) : null);
    if (!found || found.after !== value || found.before <= found.after) return null;
    return (
        <span className={css.needed_tag} title={`Your level benefit: ${found.pct}% fewer needed Pick'em points (${found.before} → ${found.after})`}>
            −{found.before - found.after}
        </span>
    );
}

const BONUS_INFO = {
    insurance: ["Insurance", "Pick'em Insurance: your insured pick lost, so it won back a share of the points it missed"],
    insuranceReturned: ["Insurance returned", "Pick'em Insurance: your won sets already gave every point it could win back, so it came back to you"],
    insuranceUnused: ["Not needed", "Pick'em Insurance: your insured pick won, so the insurance wasn't needed and is used up"],
    gfBonus: ["Grand Final", "Level benefit: Grand Final bonus for a correct Grand Final pick"],
    upsetBonus: ["Upset", "Level benefit: upset bonus for a correct pick with 35% or less predicted"],
    longShotBonus: ["Long shot", "Level benefit: long shot bonus for a correct pick with 15% or less predicted"],
    streakBonus: ["Streak", "Level benefit: streak bonus for every 5th correct pick in a row"],
    comebackBonus: ["Comeback", "Level benefit: comeback bonus, your pick came back from 2 sets behind (1 in a Best of 3) and won. A bigger comeback gives more"],
    sweepBonus: ["Sweep", "Level benefit: sweep bonus, your pick won without losing a set"],
    overtimeBonus: ["Overtime", "Level benefit: overtime bonus, your pick won a series with an Overtime"],
    deciderBonus: ["Decider", "Level benefit: decider bonus, your pick won a series that went to its last possible set"],
    knockoutBonus: ["Knockout", "Level benefit: knockout bonus for a correct pick in a knockout match"],
    longSeriesBonus: ["Long series", "Level benefit: long series bonus for a correct pick in a Best of 5 or longer"],
};

export function PickStreakTag({ streak }) {
    if (!streak) return null;
    const { before, after, shielded } = streak;
    if (shielded) {
        return (
            <span className={css.streak_tag} title={`Your pick was wrong, but the Streak Shield kept your pick streak of ${before} alive`}>
                <SavedStreakFire value={after} size={18} />
                Streak kept
            </span>
        );
    }
    if (after === 0) {
        return before > 0 ? (
            <span className={`${css.streak_tag} ${css.streak_tag_lost}`} title={`Your pick was wrong, so your pick streak of ${before} is over`}>
                <LostStreakFire value={before} size={18} />
                Streak lost
            </span>
        ) : (
            <span className={`${css.streak_tag} ${css.streak_tag_lost}`} title="Your pick was wrong, so there is still no pick streak">
                <UnbeatenStreakFire value={0} size={18} showZero />
                No streak
            </span>
        );
    }
    return (
        <span className={css.streak_tag} title={`Your pick was correct: ${after} correct ${after === 1 ? "pick" : "picks"} in a row`}>
            <UnbeatenStreakFire value={after} size={18} />
            {after === 1 ? "Correct pick" : "In a row"}
        </span>
    );
}

const MISSED_REASONS = {
    lost: "your pick lost",
    condition: "it wasn't activated in this match",
    cap: "the bonus cap of this tournament was already reached",
};

export function PickBonusBadges({ bonuses }) {
    if (!bonuses?.length) return null;
    return bonuses.map((bonus, i) => {
        if (bonus.type === "bonusMissed") {
            const name = BONUS_INFO[bonus.bonus]?.[0] ?? "Bonus";
            return (
                <span
                    key={`${bonus.type}-${i}`}
                    className={`${page.breakdown_pickem_pill} ${css.bonus_pill} ${css.bonus_pill_muted} ${css.bonus_pill_missed}`}
                    title={`Your chosen ${name} bonus is lost: ${MISSED_REASONS[bonus.reason] ?? MISSED_REASONS.condition}`}
                >
                    <FaXmark aria-hidden="true" />
                    {name}
                </span>
            );
        }
        const [label, title] = BONUS_INFO[bonus.type] ?? [bonus.type, ""];
        const muted = bonus.type === "insuranceReturned" || bonus.type === "insuranceUnused";
        return (
            <span
                key={`${bonus.type}-${i}`}
                className={`${page.breakdown_pickem_pill} ${css.bonus_pill} ${muted ? css.bonus_pill_muted : ""}`}
                title={title}
            >
                {bonus.type.startsWith("insurance") ? <FaShieldHalved aria-hidden="true" /> : null}
                {bonus.points ? `+${bonus.points} ${label}` : label}
            </span>
        );
    });
}
