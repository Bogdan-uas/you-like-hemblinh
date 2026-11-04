import { FaShieldHalved } from "react-icons/fa6";
import css from "./Progress.module.css";
import page from "../SpecialModePage.module.css";
import { insurancePayout } from "./progressConfig.js";
import { basePickemPoints } from "./progressEngine.js";
import { useProgress } from "./progressStore.js";

const insuranceOutcome = (pick, seriesState) => {
    const banner = seriesState?.banner;
    if (!banner) return null;
    const won = !banner.tie && (seriesState.playerWonSets ?? 0) > (seriesState.playerLostSets ?? 0);
    if (won) return { kind: "used", label: "Insurance", value: "Used" };
    const base = basePickemPoints(pick.bestOf, false, seriesState.playerWonSets ?? 0);
    const payout = insurancePayout(pick.bestOf, base, pick.insurePct);
    return payout > 0 ? { kind: "paid", label: "Insured", value: `+${payout}` } : { kind: "returned", label: "Insurance", value: "Returned" };
};

export function HudInsurance({ variant, hud, seriesState, ghost = false }) {
    const { progress } = useProgress();
    const pick = progress.activePick;
    if (!pick?.insured) return null;
    const outcome = insuranceOutcome(pick, seriesState);
    const label = outcome?.label ?? "Insured";
    const value = outcome?.value ?? `${pick.insurePct}%`;
    const tone = `${outcome ? css[`hud_insured_${outcome.kind}`] : ""} ${ghost ? css.hud_ghost : ""} ${variant === "pgx" ? css.hud_insured_pgx : ""}`;
    const title = ghost ? undefined : outcome?.kind === "paid"
        ? `Your Pick'em Insurance wins back ${outcome.value.slice(1)} Pick'em point${outcome.value === "+1" ? "" : "s"}`
        : outcome?.kind === "returned"
            ? "Your won sets already gave all the points the insurance could give, so it comes back to you"
            : outcome?.kind === "used"
                ? "Your pick won, so the Pick'em Insurance is used up"
                : `Pick'em Insurance: if this pick loses, it wins back ${pick.insurePct}% of the Pick'em points it missed`;

    if (variant === "official") {
        return (
            <span className={`${page.best_of_badge} ${css.hud_insured_official} ${tone}`} title={title} aria-hidden={ghost || undefined}>
                <span className={page.best_of_badge_label}>{label}</span>
                <span key={value} className={`${page.best_of_badge_value} ${css.hud_insured_value}`}>
                    <FaShieldHalved aria-hidden="true" />
                    {value}
                </span>
            </span>
        );
    }

    if (variant === "pem") {
        return (
            <span className={`${hud.chip} ${hud.chip_bo} ${css.hud_insured} ${tone}`} title={title} aria-hidden={ghost || undefined}>
                <FaShieldHalved aria-hidden="true" className={css.hud_insured_icon} />
                <span key={value} className={css.hud_insured_value}>{value}</span>
            </span>
        );
    }

    if (variant === "ess") {
        return (
            <span className={`${hud.set} ${hud.set_bo} ${css.hud_insured} ${tone}`} title={title} aria-hidden={ghost || undefined}>
                <FaShieldHalved aria-hidden="true" className={css.hud_insured_icon} />
                <span key={value} className={css.hud_insured_value}>{value}</span>
            </span>
        );
    }

    const inner = (
        <>
            <span className={hud.set_label}>{label}</span>
            <span key={value} className={`${hud.set_value} ${css.hud_insured_value}`}>
                <FaShieldHalved aria-hidden="true" className={css.hud_insured_icon} />
                {value}
            </span>
        </>
    );

    return (
        <span className={`${hud.set} ${hud.set_bo} ${css.hud_insured} ${tone}`} title={title} aria-hidden={ghost || undefined}>
            {variant === "cst" ? <span className={hud.set_inner}>{inner}</span> : inner}
        </span>
    );
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
    gfBonus: ["Grand Final", "Level benefit: Grand Final bonus for a correct Grand Final pick"],
    upsetBonus: ["Upset", "Level benefit: upset bonus for a correct pick with 35% or less predicted"],
    longShotBonus: ["Long shot", "Level benefit: long shot bonus for a correct pick with 15% or less predicted"],
    streakBonus: ["Streak", "Level benefit: streak bonus for every 5th correct pick in a row"],
    comebackBonus: ["Comeback", "Level benefit: comeback bonus, your pick won after losing the first set"],
    sweepBonus: ["Sweep", "Level benefit: sweep bonus, your pick won without losing a set"],
    overtimeBonus: ["Overtime", "Level benefit: overtime bonus, your pick won a series with an Overtime"],
    deciderBonus: ["Decider", "Level benefit: decider bonus, your pick won a series that went to its last possible set"],
    knockoutBonus: ["Knockout", "Level benefit: knockout bonus for a correct pick in a knockout match"],
    longSeriesBonus: ["Long series", "Level benefit: long series bonus for a correct pick in a Best of 5 or longer"],
};

export function PickBonusBadges({ bonuses }) {
    if (!bonuses?.length) return null;
    return bonuses.map((bonus, i) => {
        const [label, title] = BONUS_INFO[bonus.type] ?? [bonus.type, ""];
        return (
            <span
                key={`${bonus.type}-${i}`}
                className={`${page.breakdown_pickem_pill} ${css.bonus_pill} ${bonus.type === "insuranceReturned" ? css.bonus_pill_muted : ""}`}
                title={title}
            >
                {bonus.type.startsWith("insurance") ? <FaShieldHalved aria-hidden="true" /> : null}
                {bonus.points ? `+${bonus.points} ${label}` : label}
            </span>
        );
    });
}
