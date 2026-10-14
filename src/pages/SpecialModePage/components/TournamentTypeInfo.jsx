import { useState } from "react";
import css from "../SpecialModePage.module.css";
import { TOURNAMENT_TIERS, TOURNAMENT_TIER_EXPLANATIONS, CARET_LEFT_PATH } from "../logic/tournamentTiers.jsx";

export const TournamentTierBadge = ({ tier, size = 20 }) => {
    const config = TOURNAMENT_TIERS[tier];
    if (!config) return null;

    return (
        <span
            title={config.label}
            aria-label={config.label}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                width: size,
                height: size,
                borderRadius: 4,
                background: config.color,
                color: config.textColor ?? "#fff",
                fontSize: Math.round(size * 0.5),
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: 0,
                userSelect: "none",
                transition: "none",
            }}
        >
            {config.badge}
        </span>
    );
};

export const TournamentTierInfo = () => {
    const [open, setOpen] = useState(false);

    return (
        <span
            className={css.tier_info}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            tabIndex={0}
            aria-label="What the tournament icons mean"
        >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="10" cy="6" r="1.2" fill="currentColor" />
                <rect x="9" y="8.5" width="2" height="6.5" rx="1" fill="currentColor" />
            </svg>
            {open && (
                <span className={css.tier_info_popup} role="tooltip">
                    {TOURNAMENT_TIER_EXPLANATIONS.map(({ tier, text }) => (
                        <span key={tier} className={css.tier_info_row}>
                            <TournamentTierBadge tier={tier} size={18} />
                            <span>
                                <b>{TOURNAMENT_TIERS[tier].label}</b> — {text}
                            </span>
                        </span>
                    ))}
                </span>
            )}
        </span>
    );
};

const PemSmallEventLine = ({ tier, children }) => (
    <span style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 6 }}>
        <span style={{ marginTop: -1 }}>
            <TournamentTierBadge tier={tier} size={16} />
        </span>
        <span>{children}</span>
    </span>
);

export const PemSmallDescription = () => (
    <>
        Three tournaments, played one after another:
        <PemSmallEventLine tier="qualifier">
            <b>PEM Small Tournament Qualifier</b> — places 13-44 of the Leaderboard, split into Group A and
            Group B (16 teams each). Every Group is a Double Elimination bracket (all Bo3; Upper Final and
            Consolidation Final are Bo5) and every group's top 2 teams qualify to the main event.
        </PemSmallEventLine>
        <PemSmallEventLine tier="tier2">
            <b>Champions Series Tour</b> — places 45-64 of the Leaderboard, split into Groups A-D (5 teams
            each). Every Group is a Round-Robin of Bo1 matches, where ties are possible and top 2 teams of each group go to the
            Playoffs: Quarterfinals, Semifinals and Third Place Decider (all Bo3), Grand Final (Bo5).
        </PemSmallEventLine>
        <PemSmallEventLine tier="tier1">
            <b>PEM Small Tournament</b> — the main event: places 1-12 of the Leaderboard plus the 4 teams
            from the Qualifier, split into Group A and Group B (8 teams each). Every Group is a Double Elimination
            bracket (all Bo3; Upper Final and Lower Final are Bo5), where both Upper Finalists and the Lower Final
            winner go to the 6-team Playoffs: the Upper Final winners start in the Semifinals, the rest in the
            Quarterfinals. Quarterfinals, Semifinals and Third Place Decider are Bo5, the Grand Final is Bo7.
        </PemSmallEventLine>
    </>
);

export const PemBigDescription = () => (
    <>
        Three tournaments, played one after another:
        <PemSmallEventLine tier="qualifier">
            <b>PEM Big Tournament Qualifier</b> — places 17-48 of the Leaderboard, split into Group A and
            Group B (16 teams each). Every Group is a Double Elimination bracket (all Bo3; Upper Final and
            Consolidation Final are Bo5) and every group's top 2 teams qualify to the main event.
        </PemSmallEventLine>
        <PemSmallEventLine tier="tier2">
            <b>Elite Competition League</b> — places 49-64 of the Leaderboard in one Double Elimination bracket
            with a Grand Final. The Upper Bracket is Bo1 (the Upper Final is Bo3), the Lower Bracket is Bo3 and the
            Grand Final, between the Upper Final and Consolidation Final winners, is Bo5.
        </PemSmallEventLine>
        <PemSmallEventLine tier="tier1">
            <b>PEM Big Tournament</b> — the main event. <b>Stage I</b>: places 13-16 of the Leaderboard plus the 4
            teams from the Qualifier, split into Group A and Group B (4 teams each). Every Group is a Double
            Elimination bracket (all Bo3) and
            its top 2 teams go to <b>Stage II</b>, where they join places 1-12: a Group Stage like the PEM Small
            Tournament's, followed by the same 6-team Playoffs. Quarterfinals are Bo5, Semifinals and Third Place
            Decider are Bo7, the Grand Final is Bo9.
        </PemSmallEventLine>
    </>
);

export const GplDescription = () => (
    <>
        Two tournaments, played one after another:
        <PemSmallEventLine tier="tier2">
            <b>Global Challenger Cup</b> — places 25-40 of the Leaderboard in one League Phase: 4 Pots of 4 teams
            and 4 Matchdays, so every team plays one team of every Pot (all Bo3) and all 16 teams share one table.
            The top 4 go straight to the Quarterfinals, places 5-12 play the Knockout Play-offs for the other 4
            spots and places 13-16 are out. Knockout Play-offs, Quarterfinals, Semifinals and Third Place Decider
            are Bo3, the Grand Final is Bo5. Places 41-64 don&apos;t play at all.
        </PemSmallEventLine>
        <PemSmallEventLine tier="tier1">
            <b>Global Pro League</b> — places 9-24 of the Leaderboard start in <b>Stage I</b>, its 8 best teams join
            places 1-8 in <b>Stage II</b>. Both Swiss Stages have 16 teams and 8 of them go through. Stage I is all
            Bo3, in Stage II the Progression and Elimination matches are Bo5. The 8 teams from Stage II play the
            Playoffs: Quarterfinals are Bo5, Semifinals and Third Place Decider are Bo7, the Grand Final is Bo9.
        </PemSmallEventLine>
    </>
);

export const WhiteCaretIcon = ({ size = 14, rotation = 0 }) => (
    <svg
        width={size}
        height={size}
        viewBox="185 155 205 330"
        aria-hidden="true"
        style={{ display: "block", transform: `rotate(${rotation}deg)`, transition: "transform 300ms ease-in-out" }}
    >
        <path d={CARET_LEFT_PATH} fill="#fff" />
    </svg>
);
