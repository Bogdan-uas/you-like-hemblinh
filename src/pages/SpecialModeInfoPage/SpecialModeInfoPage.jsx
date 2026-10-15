import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import css from './SpecialModeInfoPage.module.css'
import { Link, useSearchParams } from "react-router-dom";
import introImg from "../../../assets/images/image.png";
import scoreBoardImg from "../../../assets/images/image-2.png";
import dashedDividerImg from "../../../assets/images/image-3.png";
import dashedDividerTwoImg from "../../../assets/images/image-4.png";
import hoveredTeamRedsStatsTabOne from "../../../assets/images/image-4.1.png";
import hoveredTeamRedsStatsTabTwo from "../../../assets/images/image-4.2.png";
import emptyHallOfFame from "../../../assets/images/image-4.3.png";
import openedTournamentSelectionModal from "../../../assets/images/image-4.4.png";
import openedTournamentSelectionModalHoveredOn from "../../../assets/images/image-4.5.png";
import tournamentIntroScreenImg from "../../../assets/images/image-5.png";
import tournamentIntroScreenHoverImg from "../../../assets/images/image-5.5.png";
import swissStageImg from "../../../assets/images/image-6.png";
import locatedMatchRect from "../../../assets/images/image-6.5.png";
import matchModal from "../../../assets/images/image-7.png";
import chosenLeftTeamModal from "../../../assets/images/image-8.png";
import chosenRightTeamModal from "../../../assets/images/image-8.5.png";
import seriesScreen from "../../../assets/images/image-9.png";
import miniRoundWonChocolate from "../../../assets/images/image-10.png";
import miniRoundWonIvory from "../../../assets/images/image-11.png";
import wholeRoundWonChocolate from "../../../assets/images/image-11.5.png";
import matchPointImg from "../../../assets/images/image-12.png";
import teamChocolateGoesTo10Net from "../../../assets/images/image-13.png";
import finishedMatchModalImg from "../../../assets/images/image-14.png";
import finishedMatchModalTwoImg from "../../../assets/images/image-14.1.png";
import hoveredTotalRoundsCountButton from "../../../assets/images/image-14.2.png";
import detailedMatchResults from "../../../assets/images/image-14.3.png";
import significantPartDivider from "../../../assets/images/image-14.4.png";
import setEnding from "../../../assets/images/image-14.5.png";
import boThreeFinishedMatchModal from "../../../assets/images/image-14.6.png";
import detailedMatchResultsBoThreeFirstSet from "../../../assets/images/image-14.7.png";
import detailedMatchResultsBoThreeSecondSet from "../../../assets/images/image-14.8.png";
import detailedMatchResultsBoThreeDecider from "../../../assets/images/image-14.9.png";
import finishedMatchModalThreeImg from "../../../assets/images/image-15.png";
import extRoundsScreenOne from "../../../assets/images/image-15.1.png";
import extRoundsScreenTwo from "../../../assets/images/image-15.2.png";
import extRoundsScreenThree from "../../../assets/images/image-15.3.png";
import pensScreen from "../../../assets/images/image-15.4.png";
import successfulAttemptForLeft from "../../../assets/images/image-15.5.png";
import unSuccessfulAttemptForRight from "../../../assets/images/image-15.6.png";
import neutralAttemptForLeft from "../../../assets/images/image-15.7.png";
import rightWinsPens from "../../../assets/images/image-15.8.png";
import matchRectPens from "../../../assets/images/image-15.9.png";
import matchModalExtRoundsAndPens from "../../../assets/images/image-15.91.png";
import matchModalExtRoundsAndPensHovered from "../../../assets/images/image-15.92.png";
import extendedRoundsAndPensInDetailedMatchResults from "../../../assets/images/image-15.93.png";
import stageTwoQualifiersImg from "../../../assets/images/image-16.png";
import stageTwoImg from "../../../assets/images/image-17.png";
import playoffsImg from "../../../assets/images/image-18.png";
import playoffsQualifiersImg from "../../../assets/images/image-19.png";
import grandFinalistsImg from "../../../assets/images/image-19.5.png";
import winnersScreenImg from "../../../assets/images/image-20.png";
import pickemSummaryImg from "../../../assets/images/image-21.png";
import playoffsResultsAndTournamentFinished from "../../../assets/images/image-22.png";
import updatedLeaderboard from "../../../assets/images/image-23.png";
import introImgTwo from "../../../assets/images/image-24.png";
import hallOfFameWithOfficialOne from "../../../assets/images/image-24.1.png";
import hallOfFameOfficialOnePartOne from "../../../assets/images/image-24.2.png";
import hallOfFameOfficialOnePartTwo from "../../../assets/images/image-24.3.png";
import hallOfFameOfficialOnePartThree from "../../../assets/images/image-24.4.png";
import hallOfFameOfficialOnePartFour from "../../../assets/images/image-24.5.png";
import hallOfFameOfficialOnePartFive from "../../../assets/images/image-24.6.png";
import hallOfFameOfficialOnePartSix from "../../../assets/images/image-24.7.png";
import tournamentIntroScreenImgTwo from "../../../assets/images/image-25.png";
import hardChoiceToMake from "../../../assets/images/image-26.png";
import hardChoiceToMakeTwo from "../../../assets/images/image-27.png";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Lenis from "lenis";
import { FaFire } from "react-icons/fa";

const hexToRgb = (hex) => {
    const clean = hex.replace("#", "");
    const noAlpha = clean.length === 8 ? clean.slice(0, 6) : clean;
    const full =
        noAlpha.length === 3
            ? noAlpha
                .split("")
                .map((c) => c + c)
                .join("")
            : noAlpha;

    const num = parseInt(full, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const clamp = (n) => Math.max(0, Math.min(255, n));

const darkenHex = (hex, amount = 0.68) => {
    const { r, g, b } = hexToRgb(hex);
    const dr = clamp(Math.round(r * (1 - amount)));
    const dg = clamp(Math.round(g * (1 - amount)));
    const db = clamp(Math.round(b * (1 - amount)));
    return `#${[dr, dg, db]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}`;
};

const makeColor = (
    hex,
    name,
    { shadowAlpha = 0.55, unlitAmount = 0.7, hoverAmount = 0.5 } = {}
) => {
    const normalized = hex.toUpperCase();

    if (normalized === "#000000") {
        return {
            shadow: `0 0 10px rgba(0, 0, 0, ${shadowAlpha})`,
            color: "#000000",
            hoverOn: "#2A2A2A",
            unlitColor: "#5D5D5D",
            name,
        };
    }

    const { r, g, b } = hexToRgb(hex);
    return {
        shadow: `0 0 10px rgba(${r}, ${g}, ${b}, ${shadowAlpha})`,
        color: hex,
        hoverOn: darkenHex(hex, hoverAmount),
        unlitColor: darkenHex(hex, unlitAmount),
        name,
    };
};

const COLORS = {
    red: makeColor("#FF0000", "Red"),
    lime: makeColor("#32CD32", "Lime"),
    yellow: makeColor("#FFFF00", "Yellow"),
    blue: makeColor("#0000FF", "Blue"),
    green: makeColor("#008000", "Green"),
    beige: makeColor("#FFC0CB", "Beige"),
    orange: makeColor("#FF7F00", "Orange"),
    brown: makeColor("#7F3900", "Brown"),
    cyan: makeColor("#00FFFF", "Cyan"),
    indigo: makeColor("#4A007F", "Indigo"),
    violet: makeColor("#8A2BE2", "Violet"),
    pink: makeColor("#FF1493", "Pink"),
    black: makeColor("#000000", "Black", { unlitAmount: 0.35 }),
    white: makeColor("#e6e6e6ff", "White", { unlitAmount: 0.85, shadowAlpha: 0.25 }),
    gray: makeColor("#808080", "Gray"),
    teal: makeColor("#006D6F", "Teal"),


    gold: makeColor("#D4AF37", "Gold"),
    silver: makeColor("#C0C0C0", "Silver", { shadowAlpha: 0.35 }),

    navy: makeColor("#00005aff", "Navy", { unlitAmount: 0.9 }),
    olive: makeColor("#808000", "Olive"),
    coral: makeColor("#FF6F61", "Coral"),
    magenta: makeColor("#D81BFF", "Magenta"),

    lavender: makeColor("#B388FF", "Lavender"),
    sky: makeColor("#4FC3F7", "Sky"),
    mint: makeColor("#69F0AE", "Mint"),
    salmon: makeColor("#FF8A80", "Salmon"),

    plum: makeColor("#6A1B9A", "Plum"),
    khaki: makeColor("#C2B280", "Khaki"),
    crimson: makeColor("#DC143C", "Crimson"),
    turquoise: makeColor("#00E5FF", "Turquoise"),

    chartreuse: makeColor("#76FF03", "Chartreuse"),
    steel: makeColor("#607D8B", "Steel"),


    emerald: makeColor("#00C853", "Emerald"),
    ruby: makeColor("#C2185B", "Ruby"),

    sapphire: makeColor("#0D47A1", "Sapphire"),
    amber: makeColor("#FFB300", "Amber"),
    bronze: makeColor("#B87333", "Bronze"),
    copper: makeColor("#C46A1A", "Copper"),

    sand: makeColor("#E6A15A", "Sand"),
    seafoam: makeColor("#4DD0E1", "Seafoam"),
    forest: makeColor("#1B5E20", "Forest"),
    midnight: makeColor("#1A237E", "Midnight"),

    peach: makeColor("#FFCCBC", "Peach", { shadowAlpha: 0.35 }),
    apricot: makeColor("#FFB48F", "Apricot"),
    periwinkle: makeColor("#7E8CE0", "Periwinkle"),
    sunflower: makeColor("#FFD000", "Sunflower"),

    raspberry: makeColor("#D81B60", "Raspberry"),
    chocolate: makeColor("#4E2A14", "Chocolate"),
    ivory: makeColor("#FFF6D6", "Ivory", { shadowAlpha: 0.25, unlitAmount: 0.8 }),
    charcoal: makeColor("#37474F", "Charcoal"),

    denim: makeColor("#1565C0", "Denim"),
    spring: makeColor("#00E676", "Spring"),
    ocean: makeColor("#006064", "Ocean"),
    lilac: makeColor("#CE93D8", "Lilac"),

    rose: makeColor("#FF5CA8", "Rose"),
    frost: makeColor("#E3F2FD", "Frost", { shadowAlpha: 0.25, unlitAmount: 0.8 }),
    slate: makeColor("#546E7A", "Slate"),
    moss: makeColor("#8A9A5B", "Moss"),

    wine: makeColor("#6D1B2D", "Wine"),
    honey: makeColor("#F4C430", "Honey"),
    azure: makeColor("#00A3FF", "Azure"),
    blush: makeColor("#FF8FB1", "Blush", { shadowAlpha: 0.35 }),

    jade: makeColor("#00A86B", "Jade"),
    royal: makeColor("#5B5BE6", "Royal"),
};

const OFFICIAL_SECTIONS = [
    {
        id: "starting-off",
        label: "Starting off",
    },
    {
        id: "swiss-stage",
        label: "What is this Swiss Stage even about!?",
    },
    {
        id: "distribution-explained",
        label: "Distribution system in Swiss Stages",
    },
    {
        id: "start-match",
        label: "How to start a match?",
    },
    {
        id: "during-match",
        label: "What do I do during the match?",
    },
    {
        id: "results-match",
        label: "— Can I watch the results of this first match? — Of course!",
    },
    {
        id: "stats-explained",
        label: "Team stats and how do they work",
    },
    {
        id: "breakdown-explained",
        label: "Detailed Match Results",
    },
    {
        id: "tiebreaker-system",
        label: "Tiebreaker system after Quadruple Overtime",
    },
    {
        id: "pickem-system",
        label: "Pick'em system",
    },
    {
        id: "leaderboard-explained",
        label: "Leaderboard format and points system",
    },
    {
        id: "what-happens",
        label: "What happens next?",
    },
    {
        id: "finale",
        label: "Finale? Or not?"
    }
];

const PEM_BIG_SECTIONS = [
    {
        id: "big-overview",
        label: "The bigger brother",
    },
    {
        id: "big-qualifier",
        label: "PEM Big Tournament Qualifier",
    },
    {
        id: "big-ecl",
        label: "Elite Competition League",
    },
    {
        id: "big-main-event",
        label: "PEM Big Tournament",
    },
    {
        id: "big-rewards",
        label: "The golden trophy and Hall of Fame",
    },
];

const PEM_SMALL_SECTIONS = [
    {
        id: "pem-overview",
        label: "Three tournaments in one",
    },
    {
        id: "pem-qualifier",
        label: "PEM Small Tournament Qualifier",
    },
    {
        id: "pem-cst",
        label: "Champions Series Tour",
    },
    {
        id: "pem-main-event",
        label: "PEM Small Tournament",
    },
    {
        id: "pem-rewards",
        label: "Trophies, medals and Hall of Fame",
    },
];

const GPL_SECTIONS = [
    {
        id: "gpl-overview",
        label: "Around the globe",
    },
    {
        id: "gcc",
        label: "Global Challenger Cup",
    },
    {
        id: "gpl",
        label: "Global Pro League",
    },
    {
        id: "gpl-rewards",
        label: "The globe trophy and Hall of Fame",
    },
];

const TeamCircle = ({ team }) => {
    return (
        <div
            className={css.team_circle_ro32}
            style={{
                background: team.color,
            }}
            title={`Team ${team.name}`}
        />
    );
};

const MomentumStreakBadge = ({ value = 5, size = 15 }) => {
    return (
        <span
            style={{
                pointerEvents: "none",
                display: "inline-block",
                verticalAlign: "middle",
                lineHeight: 0,
                margin: "-2px 2px",
            }}
        >
            <motion.span
                style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <FaFire
                    style={{
                        fontSize: `${size + 6}px`,
                        color: "#ff8a00",
                        filter: "drop-shadow(0 0 3px rgba(255,138,0,0.85))",
                    }}
                />
                <span
                    style={{
                        position: "absolute",
                        fontSize: `${size - 3}px`,
                        lineHeight: 1,
                        fontWeight: 800,
                        color: "#fff",
                        textShadow: "0 1px 2px rgba(0,0,0,0.85)",
                        marginTop: "2px",
                    }}
                >
                    {value}
                </span>
            </motion.span>
        </span>
    );
};

const KEPT = "Kept between tournaments";

const STAT_EXPLANATIONS = [
    {
        group: "Tab 1",
        stats: [
            {
                name: "Clutch Factor",
                meta: ["Starts at 50", KEPT],
                when: <>Your team is behind: losing on mini-rounds inside a round, trailing by several rounds in a set (from a 5-round gap, like 7-12, or when the opponent already has a Set or Match Point), or trailing on sets in a Bo3 or longer.</>,
                up: <>Your team completes the comeback. The bigger the comeback, the bigger the gain: turning a round around gives a little, turning a set around gives more (even more in deeper Overtimes) and turning a whole series around gives the most, especially in a Bo5, Bo7 or Bo9.</>,
                down: <>Your team doesn't manage to turn it around. The loss grows the same way as the gain.</>,
                effect: <>Always on. Above 50, all of the team's multipliers get a small push up; below 50, a small push down (up to ±0.08 at the extremes).</>,
            },
            {
                name: "Composure",
                meta: ["Starts at 50", KEPT],
                when: <>The mirror image of Clutch Factor: your team is ahead in a round, a set or a series.</>,
                up: <>Your team closes out its lead. The cleaner, the better: winning a round 5-0 from 4-0 gives the most, while letting the opponent come close first and only then closing it out gives less.</>,
                down: <>Your team lets the lead slip away. Throwing a big lead costs as much as the biggest possible gain; throwing a small one costs less.</>,
                effect: <>Only while the team is ahead: it leads the set, or, with equal rounds, the current round. Then, above 50 it helps the team protect its lead, below 50 it hurts (up to ±0.06).</>,
            },
            {
                name: "Big-Stage Pedigree",
                meta: ["Starts at 0", KEPT],
                when: <>The team goes far in tournaments.</>,
                up: (
                    <>
                        After each of these achievements <b>(be careful, these work only for Official, other tournaments have their own gains)</b>:
                        <span className={css.stat_table}>
                            <span>Winning a Deciding Match (2:2 net)</span><b>+1</b>
                            <span>Getting through Stage I</span><b>+2</b>
                            <span>Getting through Stage II</span><b>+3</b>
                            <span>Getting through Stage III (into the Playoffs)</span><b>+4</b>
                            <span>Reaching the next Playoffs round</span><b>+5</b>
                            <span>Finishing in the Top 4</span><b>+7</b>
                            <span>Finishing in the Top 3 or Top 2</span><b>+8</b>
                            <span>Winning the tournament</span><b>+10</b>
                        </span>
                    </>
                ),
                down: <><strong className={css.stat_loss}>-3</strong> when the team is eliminated in the same Stage, where they started the tournament.</>,
                effect: <>Only in big matches: every Playoffs match, the matches of a Group Stage bracket that can send a team further, and in the Swiss Stages the matches with 2 wins or 2 losses (2:0, 2:1, 2:2, 1:2 and 0:2). It only helps: the higher the stat, the bigger the push up (up to +0.08 at 100).</>,
            },
            {
                name: "Overtime Stamina",
                meta: ["Starts at 50", KEPT],
                when: <>Only in Overtimes and in the Penalty Series.</>,
                up: <>+1 for every Overtime round won and for every successful penalty attempt.</>,
                down: <>-1 for every Overtime round lost and for every unsuccessful penalty attempt.</>,
                effect: <>Above 50 it helps, below 50 it hurts, and it matters more the deeper the Overtime goes (Double, Triple, Quadruple...). In the Penalty Series, it matters more the longer the series lasts. Never more than ±0.06.</>,
            },
            {
                name: "Upset Pedigree",
                meta: ["Starts at 0", KEPT],
                when: <>One team is a clear favourite before the match: if the predicted winning chances differ by at least 12% (e.g. 56% vs 44%). Otherwise, the stat shows <span style={{ color: "#8a8d99", fontStyle: "normal", fontWeight: 600, lineHeight: "9px", whiteSpace: "nowrap" }}>Not activated</span> for both teams (it can be shown also only for one team: if a team is a favorite and has 0 points in Upset Pedigree).</>,
                up: <>The underdog gets +1 to +5 for every set it wins against the favourite. The bigger the difference in chances, the bigger the gain.</>,
                down: <>The favourite gets -1 to -3 for every set it loses to the underdog, scaled the same way.</>,
                effect: <>Helps only the underdog, only in that match. It can at most bring the underdog level with the favourite, but never ahead of it. The percentage bar in the match modal already includes this bonus (up to +0.05 at 100).</>,
            },
            {
                name: "Bounce-Back",
                meta: ["Starts at 50", KEPT],
                when: <>The first round right after the team loses a whole set.</>,
                up: <>+1.5 for winning that round.</>,
                down: <>-1.5 for losing that round too.</>,
                effect: <>Only during that one round: above 50 it helps, below 50 it hurts (up to ±0.05).</>,
            },
            {
                name: "Anti-Tilt",
                meta: ["Starts at 50", KEPT],
                when: <>Any round right after the team loses a round, no matter the score. It happens a lot, unlike Bounce-Back, which only cares about lost sets.</>,
                up: <>+0.25 for winning that round.</>,
                down: <>-0.25 for losing that round too.</>,
                effect: <>Only during those rounds and kept small on purpose, because it comes up so often (up to ±0.03).</>,
            },
        ],
    },
    {
        group: "Tab 2",
        stats: [
            {
                name: "Finisher",
                meta: ["Starts at 50", KEPT],
                when: <>Only in Bo3 matches or longer. In a Bo1, it shows "Not activated".</>,
                up: <>The team wins the series without ever being behind on sets (e.g. 2:0). The bigger the series, the bigger the gain. If the team dropped two or more sets on the way, nothing changes.</>,
                down: <>The team loses the series without winning a single set (e.g. 0:2). The bigger the series, the bigger the loss. If the team won two or more sets, nothing changes.</>,
                effect: <>Above 50 it helps, below 50 it hurts (up to ±0.04).</>,
            },
            {
                name: "Elimination Nerve",
                meta: ["Starts at 50", KEPT],
                when: <>Matches where losing means going home: the 0:2, 1:2 and 2:2 nets of the Swiss Stages and every Playoffs match, except the Third Place Decider (both teams there are already out of the title race).</>,
                up: <>Around +3 for surviving. A cleaner win (e.g. 2:0 instead of 2:1) gives more.</>,
                down: <>Around -3 for being eliminated. Getting swept gives a bigger loss than a close defeat.</>,
                effect: <>Only in those matches: above 50 it helps, below 50 it hurts (up to ±0.07).</>,
            },
            {
                name: "Unbeaten Nerve",
                meta: ["Starts at 50", KEPT],
                when: (
                    <>
                        The team is on an <b style={{ color: "#f28c28" }}>Unbeaten Streak</b> <MomentumStreakBadge value={2} />: it has won at least one match and hasn&apos;t lost any yet. The streak carries over to the next Stage, into the Playoffs and even into the next tournament.
                        The streak is shown with a fire icon with the number inside: next to the trophies in the Leaderboard and next to the team circles in the match modals (in a finished match, it shows the streak right after that match). It can also be changed by hand in the "Stats management" modal.
                    </>
                ),
                up: <>+1 for every Swiss Stage win. In the Playoffs, every win gives more: +3, then +4, +5 and so on.</>,
                down: <>-3 for the first loss in a Swiss Stage (the stat then stays off until the team&apos;s next Stage). -5 for a loss in the Playoffs (the stat then stays off for the rest of the tournament).</>,
                effect: <>Only while the team is still unbeaten: above 50 it helps, below 50 it hurts (up to ±0.05).</>,
            },
            {
                name: "Battle-Tested",
                meta: ["Starts at 0", KEPT],
                when: <>The team gathers experience in the current tournament: the more matches it plays and the tougher the opponents are, the more experience it has. The experience starts from zero in every tournament (the stat itself is kept).</>,
                up: <>+1 to +6 for good results, especially against tough opponents.</>,
                down: <>-1 to -5, mostly for losing to weaker opponents.</>,
                effect: <>Only helps, once the team has gathered enough experience in the tournament (up to +0.05 at 100).</>,
            },
            {
                name: "Top-Seed Pressure",
                meta: ["Starts at 50", KEPT],
                when: <>The team is in the Top 10 of the Leaderboard.</>,
                up: <>+1 for a win as #1, +0.5 for a win as #2-#10.</>,
                down: <>-3 for a loss as #1, -1.5 for a loss as #2-#10.</>,
                effect: <>While in the Top 10: above 50 it helps, below 50 it hurts (up to ±0.04).</>,
            },
            {
                name: "Streak Breaker",
                meta: ["Starts at 50", KEPT],
                when: <>The opponent is on a Momentum streak of 5 or more rounds in a row (see Momentum below).</>,
                up: <>+1.5 for winning the round that ends the opponent&apos;s streak.</>,
                down: <>-1.5 for every round lost while the opponent&apos;s streak keeps going.</>,
                effect: <>Only while facing such a streak: above 50 it helps, below 50 it hurts (up to ±0.05).</>,
            },
            {
                name: "Unbeaten Streak Breaker",
                meta: ["Starts at 50", KEPT],
                when: <>The opponent is on an Unbeaten Streak (see Unbeaten Nerve).</>,
                up: <>+1.5 to +7.5 for beating that opponent. The longer its streak was, the bigger the gain.</>,
                down: <>-1 to -5 for losing to that opponent, scaled the same way (a win counts 1.5 times as much, because the team facing an unbeaten one is usually the underdog).</>,
                effect: <>Only in that match: above 50 it helps, below 50 it hurts (up to ±0.05).</>,
            },
        ],
    },
    {
        group: "Not in the tabs",
        stats: [
            {
                name: "Momentum",
                meta: ["Starts at 0 in every set", "Not kept"],
                when: <>The team wins rounds in a row within the same set. Any lost round, as well as the start of a new set, sets it back to 0.</>,
                up: <>+1 for every round won in a row.</>,
                down: <>Back to 0 after any lost round.</>,
                effect: (
                    <>
                        Nothing until the team has won 5 rounds in a row. From there, the push up grows with every further round won: +0.0125 at 5 in a row, +0.05 at 8 and at most +0.10 (12 in a row).
                        From 5 in a row on, a small fire icon with the streak <MomentumStreakBadge /> inside shows up below the team&apos;s round score, and it&apos;s also shown in the Detailed Match Results for every round where Momentum was active.
                    </>
                ),
            },
        ],
    },
];

const STAT_ROWS = [
    ["when", "When it matters"],
    ["up", "Goes up"],
    ["down", "Goes down"],
    ["effect", "What it does"],
];

const StatExplanationCard = ({ stat }) => (
    <div className={css.stat_card}>
        <div className={css.stat_card_name}>{stat.name}</div>
        <div className={css.stat_card_meta}>
            {stat.meta.map((m) => <span key={m}>{m}</span>)}
        </div>
        {STAT_ROWS.map(([key, label]) => stat[key] && (
            <div key={key} className={css.stat_card_row}>
                <span className={`${css.stat_card_label} ${css[`stat_card_label_${key}`]}`}>{label}</span>
                <span>{stat[key]}</span>
            </div>
        ))}
    </div>
);

const StatExplanations = () => (
    <>
        <p className={css.info_text}>
            Before going through them, a few simple rules:
            <br />• For stats starting at <b>50</b>, 50 is neutral: above 50 the stat helps the team, below 50 it hurts it. Stats starting at <b>0</b> can only help.
            <br />• A stat only works in the situations it's made for. When it doesn't apply to the current match, the stats panel shows it as <span style={{ color: "#8a8d99", fontStyle: "normal", fontWeight: 600, lineHeight: "9px", whiteSpace: "nowrap" }}>Not activated</span>.
            <br />• The numbers in &quot;What it does&quot; are added to the team&apos;s multiplier on every roll. They look tiny, but a match is decided by dozens of mini-rounds in a row, so even a small difference makes a team a clear favourite. What counts is only the <b>difference</b> between both teams: all pushes of each team are added up, and if one team is ahead by more than <b>0.20</b>, the difference is limited to 0.20. So two strong teams still keep their real difference, and even the most one-sided match is never a sure thing.
            <br />• The Leaderboard points count as well: 100 points ahead is worth about +0.04 against the opponent, roughly a 59/41 Bo1.
            <br />• The stats that are mostly earned by winning (Big-Stage Pedigree, Battle-Tested, Elimination Nerve, Finisher and Unbeaten Nerve) move <b>15% of the way back</b> to their starting value every time a new tournament is started, so a team can&apos;t stay on top forever just because it once collected a lot. All the other stats only change through matches.
            <br />• All the changes a team collects during a match are added to its stats once the match is over. The finished match modal shows them as green and red numbers:
        </p>
        <div className={css.image_container}>
            <img src={finishedMatchModalThreeImg} alt="Finished match modal" className={css.image} style={{ width: '35vw', height: '27vh' }} />
        </div>
        {STAT_EXPLANATIONS.map(({ group, stats }) => (
            <React.Fragment key={group}>
                <h4 className={css.stat_group_title}>{group}</h4>
                {stats.map((stat) => <StatExplanationCard key={stat.name} stat={stat} />)}
            </React.Fragment>
        ))}
    </>
);

const LEADERBOARD_TIERS = [
    { from: 1, to: 16, points: 1150, label: "Start in Stage III", color: "#2e7d32" },
    { from: 17, to: 32, points: 1100, label: "Start in Stage II", color: "#f9a825" },
    { from: 33, to: 64, points: 1050, label: "Start in Stage I", color: "#c62828" },
];

const STAGE_WEIGHTS = [
    ["Stage I", 1.0],
    ["Stage II", 1.25],
    ["Stage III", 1.5],
    ["Round of 16", 1.75],
    ["Quarterfinals", 2.5],
    ["Semifinals", 3.0],
    ["Third Place Decider", 3.25],
    ["Grand Final", 5.0],
];

const BEST_OF_WEIGHTS = [
    ["BO1", 1.0],
    ["BO3", 1.25],
    ["BO5", 1.5],
    ["BO7", 2.0],
    ["BO9", 3.0],
];

const POINTS_EXAMPLES = [
    { match: "Two equal teams (1,050 vs 1,050)", where: "Stage I, BO1", win: 10, loss: 5 },
    { match: "Favourite beats underdog (1,150 vs 1,050)", where: "Stage I, BO1", win: 6, loss: 3 },
    { match: "Underdog beats favourite (1,050 vs 1,150)", where: "Stage I, BO1", win: 12, loss: 9 },
    { match: "Two equal teams, close win 2:1", where: "Stage I, BO3", win: 13, loss: 7 },
    { match: "Two equal teams, clean win 2:0", where: "Stage I, BO3", win: 14, loss: 7 },
    { match: "Two equal teams, 3:1", where: "Quarterfinals, BO5", win: 41, loss: 22 },
    { match: "Two equal teams, 4:2", where: "Semifinals, BO7", win: 65, loss: 34 },
    { match: "Two equal teams, 5:3", where: "Grand Final, BO9", win: 162, loss: 32 },
];

const WeightBars = ({ title, rows }) => {
    const max = Math.max(...rows.map(([, w]) => w));
    return (
        <div className={css.lb_weights}>
            <div className={css.lb_weights_title}>{title}</div>
            {rows.map(([label, w]) => (
                <div key={label} className={css.lb_weight_row}>
                    <span>{label}</span>
                    <span className={css.lb_weight_track}>
                        <span className={css.lb_weight_bar} style={{ width: `${(w / max) * 100}%` }} />
                    </span>
                    <b>×{w.toFixed(2)}</b>
                </div>
            ))}
        </div>
    );
};

const LeaderboardExplained = () => {
    const teams = Object.values(COLORS);

    return (
        <>
            <p className={css.info_text} style={{ marginTop: "12px" }}>
                Every team has <b>points</b>, which we have already seen before many times. But, now, it's time to explain how the Leaderboard is actually formed and how points calculation works:
            </p>

            <h4 className={css.stat_group_title}>Where everyone starts</h4>
            <p className={css.info_text}>
                Before the very first tournament, nobody has played yet, so the teams get their starting points from their spot in the internal list of teams, located in the code of the website:
            </p>
            <div className={css.lb_mini}>
                <div className={css.lb_mini_title}>Leaderboard before Official #1</div>
                {LEADERBOARD_TIERS.map((tier) => (
                    <div key={tier.from} className={css.lb_tier}>
                        <div className={css.lb_tier_header} style={{ borderColor: tier.color }}>
                            <span className={css.lb_tier_places}>#{tier.from}-{tier.to}</span>
                            <span className={css.lb_tier_label} style={{ color: tier.color }}>{tier.label}</span>
                            <span className={css.lb_tier_points}>{tier.points.toLocaleString("en-US")} pts</span>
                        </div>
                        <div
                            className={css.lb_grid}
                            style={{ gridTemplateRows: `repeat(${Math.ceil((tier.to - tier.from + 1) / 2)}, auto)` }}
                        >
                            {teams.slice(tier.from - 1, tier.to).map((team, i) => (
                                <div key={team.name} className={css.lb_chip}>
                                    <span className={css.lb_rank}>#{tier.from + i}</span>
                                    <span className={css.lb_circle} style={{ background: team.color }} />
                                    <span className={css.lb_name}>Team {team.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <p className={css.info_text}>
                Teams with the same points are ordered by that same list, which is why the first tournament always has the same teams in each Stage.
            </p>

            <h4 className={css.stat_group_title}>How many points does a match give?</h4>
            <p className={css.info_text}>
                There are no fixed "+10 / -5" points, as you would think at first. Every match is calculated on its own, following these rules:
            </p>
            <div className={css.lb_rules}>
                <div className={css.lb_rule}>
                    <b>1. The winner always gains, the loser always loses less.</b>
                    A loss costs less than the win was worth (only when a match is worth a single point, both sides get ±1), and points can never go below 0.
                </div>
                <div className={css.lb_rule}>
                    <b>2. Beating a stronger team is worth more.</b>
                    Before the match, the game works out who the favorite is from the points of both teams and from stats of each team (that's the percentage bar in the match modal).
                    Beating the favorite gives a lot, beating a much weaker team gives only a little. An upset also gets an extra bonus of up to +30%.
                </div>
                <div className={css.lb_rule}>
                    <b>3. Losing hurts the favorite more.</b>
                    A favorite that loses gives away about <b>three quarters</b> of what the winner gained. An underdog that loses only about <b>half</b>.
                </div>
                <div className={css.lb_rule}>
                    <b>4. Bigger matches are worth more.</b>
                    The later the stage and the longer the series, the more points are at stake. Both multiply each other:
                    <div className={css.lb_weights_wrap}>
                        <WeightBars title="Stage" rows={STAGE_WEIGHTS} />
                        <WeightBars title="Best of" rows={BEST_OF_WEIGHTS} />
                    </div>
                </div>
                <div className={css.lb_rule}>
                    <b>5. A clean win gives a little extra.</b>
                    In BO3 and longer, winning without dropping sets (e.g. 3:0 instead of 3:2) adds up to +10%.
                </div>
                <div className={css.lb_rule}>
                    <b>6. Huge gaps are softened.</b>
                    When two teams are very far apart in points, the result counts less, so one match can&apos;t turn the Leaderboard upside down.
                </div>
                <div className={css.lb_rule}>
                    <b>7. The Grand Final is special.</b>
                    Losing the Grand Final is already painful enough, so the runner-up only loses <b>20%</b> of what the champion gains.
                    A single win can never give more than <b>165</b> points.
                </div>
            </div>

            <h4 className={css.stat_group_title}>Some real examples</h4>
            <div className={css.lb_examples}>
                <div className={`${css.lb_example_row} ${css.lb_example_head}`}>
                    <span>Match</span>
                    <span>Where</span>
                    <span>Winner</span>
                    <span>Loser</span>
                </div>
                {POINTS_EXAMPLES.map((ex) => (
                    <div key={ex.match + ex.where} className={css.lb_example_row}>
                        <span>{ex.match}</span>
                        <span className={css.lb_example_where}>{ex.where}</span>
                        <span className={css.lb_gain}>+{ex.win}</span>
                        <span className={css.lb_loss}>-{ex.loss}</span>
                    </div>
                ))}
            </div>
            <p className={css.info_text}>
                The first example is exactly what happened in the very first match above: the winner got <b>+10p</b> and the loser <b>-5p</b>.
            </p>

            <details className={css.lb_details}>
                <summary>For the curious: the exact formula</summary>
                <ol>
                    <li>The favourite&apos;s chance to win is calculated from the points difference: <i>1 / (1 + 10<sup>(loser − winner) / 400</sup>)</i>. Equal points = 50%, 100 points more ≈ 64%.</li>
                    <li>The match value is <i>20 × Stage × Best of × clean-win bonus × upset bonus × gap softening</i>.</li>
                    <li>The winner gets <i>match value × (1 − winner&apos;s chance to win)</i>, rounded, at least 1 and at most 165.</li>
                    <li>The loser loses a share of that: about 44–53% if the winner was the favourite, about 68–79% if the winner was the underdog, and 20% in the Grand Final.</li>
                </ol>
            </details>
        </>
    );
};

const OfficialSubPage = ({ scrollToAnchor }) => (
    <>
        <section>
            <div style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 id="starting-off" style={{ marginTop: '12px' }} className={css.title}>Starting off</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                Special Mode is a tournament simulator, which includes multiple tournaments with different formats.
                Here, I will explain how the general mechanics of this simulator function and I will make it with examples from the very first tournament created in this simulator and the biggest one, which is the <b>Official</b> (all the other tournaments are in another tabs). <br />
                Official includes 64 teams, each being a specific color.
                Throughout the tournament, they will have opportunities to play against other teams and gain placement points to become higher in the <b>Leaderboard</b>.
            </p>
            <p className={css.info_text}>
                When firstly clicking on the "Special" button and going onto this page, you will see the Intro Page (depicted below this text). <br />
                Above, you see already a familiar <b>header</b> with two buttons: "Restart the game?" and "Terminate the game?".
                First restarts the tournament and redirects you to this page again & second redirects you to Home Page but doesn't restart the tournament.
                Near those two, you will see an orange button, named as "Leaderboard" and below those, you will see the button, called as "Hall of Fame". We will come to those in a minute, ok? <br />
                Below the header, you see the encouraging text to the tournament simulator and the button leading to this Info Page nearby. <br />
                In the center there is an endless loop of different team circles, which tries to show, what colors are featured in the tournament. <br />
                At the bottom, you see two buttons, which speak for themselves.<br />
                But here, the "Start Game" button might catch your eye, as there is an addition to it with an arrow.
                This addition is clickable separately from the "Start Game" button itself, but what does it open? I will tell you this in a minute as well.
            </p>
            <div className={css.image_container}>
                <img src={introImg} alt="Intro Page" className={css.image} style={{ width: '34vw', height: '35vh' }} />
            </div>
            <p className={css.info_text}>
                Now, we open <b>the Leaderboard</b> by clicking on the "Leaderboard" button:
            </p>
            <div className={css.image_container}>
                <img src={scoreBoardImg} alt="Leaderboard" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (Higher points = higher placement)
                </span>
            </div>
            <p className={css.info_text}>
                You can scroll down and see other teams, with such kind of dividers, like here:
            </p>
            <div className={css.image_container}>
                <img src={dashedDividerImg} alt="Divider, which show the edge between qualifiers for Stage III and Stage II" className={css.image} style={{ width: '40vw', height: '73vh' }} />
            </div>
            <div className={css.image_container}>
                <img src={dashedDividerTwoImg} alt="Divider, which show the edge between qualifiers for Stage II and Stage I" className={css.image} style={{ width: '40vw', height: '73vh' }} />
            </div>
            <p style={{ marginBottom: '24px' }} className={css.info_text}>
                As you can read it, these should be dividers to show which Stages of Official, which teams autoqualify to. <br /> <i>— But wait, what are "Stages" meant here?</i> <br />
                There are three stages throughout the whole Official, which are being played in Swiss Format: <b>Stage I</b>, <b>Stage II</b> and <b>Stage III</b>. <br />
                After Stage III, there will stay only 16 teams remaining, which will play in Playoffs (or another name for it, Knockout Stage), starting from Round of 16.
            </p>
            <p className={css.info_text}>
                Qualification rules:
                <br />• Top 16 → Autoqualify to <b>Stage III</b>
                <br />• Top 17–32 → Autoqualify to <b>Stage II</b>
                <br />• Top 33–64 → Start in <b>Stage I</b>
            </p>
            <p style={{ marginBottom: '12px' }} className={css.info_text}>
                Based on these rules, teams start the tournament depending on their placements before the tournament. How do these Stages look? <br />
                You will see it here later by yourself.
            </p>
            <p style={{ marginBottom: '12px' }} className={css.info_text}>
                If you want to know now, why these teams are in such order, go to{" "}
                <a
                    style={{ color: 'Highlight', fontStyle: 'italic' }}
                    onClick={scrollToAnchor("leaderboard-explained")}
                    href='#leaderboard-explained'
                >
                    Leaderboard format and points system
                </a>{" "}
                section.
            </p>
            <p className={css.info_text}>
                As you may have noticed already, the Leaderboard has a button, called as "Placement sorting".
                This is a "select" button, which can be opened and you'll see some options: "Points (default)", "Trophies and first places", "Second Places", "Third Places" and "Stats".
                These are the sorting options, which you can sort the teams by.
                Since we have gotten into this Tournament Simulator only recently, none of the teams have any trophies, stats and medals for high placements in the tournaments because no tournament have been played yet. <br />
                But, yet there is still one sorting option or rather two sorting options, which are available to be seen: Stats and Points.
                Points are seen inside of each team circle and stats are seen when hovering onto a team, but for now, every team has exact same default stats:
            </p>
            <div className={css.image_container}>
                <img src={hoveredTeamRedsStatsTabOne} alt="Team Red's Stats, which are now default as all the other teams, tab 1" className={css.image} style={{ width: '35vw', height: '35vh' }} />
                <img src={hoveredTeamRedsStatsTabTwo} alt="Team Red's Stats, which are now default as all the other teams, tab 2" className={css.image} style={{ width: '35vw', height: '35vh' }} />
            </div>
            <p className={css.info_text}>
                There are in total 14 stats, 7 stats for each tab.
                All 14 stats influence how a team performs in matches but they all do it differently.
                We will see these more often later throughout this tab but if you are curious, then{" "}
                <a
                    style={{ color: 'Highlight', fontStyle: 'italic' }}
                    onClick={scrollToAnchor("stats-explained")}
                    href='#stats-explained'
                >
                    Team stats and how do they work
                </a>{" "}
                section will explain it to you.
            </p>
            <p className={css.info_text}>
                Then, if we close the Leaderboard and go onto the "Hall of Fame", you'll see this:
            </p>
            <div className={css.image_container}>
                <img src={emptyHallOfFame} alt="Empty Hall of Fame" className={css.image} style={{ width: '35vw', height: '35vh' }} />
            </div>
            <p className={css.info_text}>
                Hall of Fame will store all the played tournaments and their results but since we haven't played any tournament yet, it is empty.
                In the top-right corner, you can see "Pick'em points score", "0 Pick'em challenges won" and "0 Pick'em challenges lost".
                These are stats, which are being gathered from all of the registered and played tournaments. "Pick'em points" will meet us again soon...
            </p>
            <p className={css.info_text}>
                Now, let's go back to the Intro Page and click on that addition on the "Start Game" button with an arrow:
            </p>
            <div className={css.image_container}>
                <img src={openedTournamentSelectionModal} alt="Opened tournament selection modal" className={css.image} style={{ width: '35vw', height: '35vh' }} />
            </div>
            <p className={css.info_text}>
                Here, you can set the tournament's roll on "Random", which could then any tournament from the list below or you can choose a specific tournament(s) you want to play.
                If you choose more than one tournament in the list, random tournament out the picked ones will be activated. <br />
                You can also see this icon in top-right corner, which can be hovered onto and it will show you the explanations for all the icons, which stand near the names of the tournaments in the modal:
            </p>
            <div className={css.image_container}>
                <img src={openedTournamentSelectionModalHoveredOn} alt="Opened tournament selection modal, hovered on the info icon" className={css.image} style={{ width: '35vw', height: '35vh' }} />
            </div>
            <p className={css.info_text}>
                But, in this tab, I am explaining <b>Official</b> tournament and not the other ones in that list, so I will choose the Official explicitly and click "Start Game" button.
            </p>
            <p className={css.info_text}>
                But first, I will be redirected to the "Tournament Intro Screen", where we can see the overview of the qualifiers with their points for each stage one more time, in case you haven't seen the Leaderboard:
            </p>
            <div className={css.image_container}>
                <img src={tournamentIntroScreenImg} alt="Tournament Intro Screen" className={css.image} style={{ width: '35vw', height: '35vh' }} />
            </div>
            <p className={css.info_text}>
                By hovering onto a team circle, you will be able to see that team's name, in case you cannot decipher the team's color with your eyes.
            </p>
            <div className={css.image_container}>
                <img src={tournamentIntroScreenHoverImg} alt="Hovering onto a team circle to see the team's name in Tournament Intro Screen" className={css.image} style={{ width: '35vw', height: '35vh' }} />
            </div>
            <p className={css.info_text} style={{ marginBottom: '12px' }}>
                Each new tournament has its order number and since I start the very first Official, I have "Official #1".
            </p>
            <p className={css.info_text}>
                When you click "Continue", the <b>Official #1</b> starts. You'll start from this: <br />
            </p>
            <div className={css.image_container}>
                <img src={swissStageImg} alt="First look of Stage I" className={css.image} style={{ width: '37vw', height: '38vh' }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (Teams' distribution in Officials depends on their placement in the top, but very first tournament has always the same qualifiers for every Stage, as well as Stage I. Exactly how the distribution system works, it all will be explained in the <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={scrollToAnchor("distribution-explained")} href='#distribution-explained'>Distribution system in Swiss Stages</a> section)
                </span>
            </div>
            <p className={css.info_text}>
                This is the Swiss Stage, I have told you about. This here is <br /> Stage I (Stage 1) with the lowest ranked teams (top 33–64).
            </p>
        </section>
        <section>
            <div id="swiss-stage" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>What is this Swiss Stage even about!?</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                Each team has their own <b>"win:loss" record</b>, which they are being sorted into corresponding nets by. <br />
                At the start of every Stage, all teams start with <b>"0:0" record</b>, that's why they are all in <b>one "0:0" net</b>. <br />
                For the team to progress to the next stage, it needs to <b>win 3 matches</b> in the current stage.
                But if the team <b>loses 3 matches</b>, it flies out of the tournament. You can see the boxes in top left and bottom left corners, where teams go when they reach 3 on the left or 3 on the right (3:n or n:3)<br />
            </p>
            <p style={{ marginTop: '24px' }} className={css.info_text}>
                0:0, 1:0, 0:1 and 1:1 matches are being played in <b>Best of 1 format</b>, 2:0, 2:1, 1:2 and 2:2 matches are either Progression or Elimination matches that's why they are being played in <b>Best of 3 format</b>. <br />
            </p>
            <p style={{ marginTop: '24px', marginBottom: "12px" }} className={css.info_text}>
                - <b>BUT</b>, Stage III is a different from Stage II and Stage I. 0:0, 1:0, 0:1 and 1:1 matches are being played in <b>Best of 3 format</b>, 2:0, 2:1, 1:2 and 2:2 matches are either Progression or Elimination matches that's why they are being played in <b>Best of 5 format</b>. <br />
            </p>
            <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                ("Best of n" formats are explained in <a style={{ color: 'Highlight' }} onClick={scrollToAnchor("during-match")} href='#during-match'>What do I do during the match?</a> section)
            </span>
        </section>
        <section>
            <div id="distribution-explained" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Distribution system in Swiss Stages</h3>
                <div className={css.divider} />
            </div>
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                We have 32 teams in one "pool". We have to put them all into 1v1 match-ups but in what order? Previously, it was pure shuffling and the match-ups were always randomly generated. <br />
                But now, it depends on the placements. All the 32 teams in the poll are being sorted by their placements in descending order. Then, highest ranked team in the pool is being put with the lowest ranked team in the pool. Second match-up is then second highest ranked team vs second lowest ranked team and so on... The match-ups are being shuffled then, so their order is random.
                This works in 0:0 net, 1:0 net and in 0:1 net.
                But then in Round 3 (in 2:0, 1:1, 0:2) and afterwards in Round 4 (2:1 and 1:2) and Round 5 (2:2), there are possible rematches between some teams. To avoid these, there is a so called Buchholz method. <br />
                In Buchholz method, each team has its Buchholz score, which is that or that big, based on all the team's opponents' total wins (by the time their Buchholz score is needed).
                So for example, a team had an opponent, which finished 3:0 and then an opponent, which is in Round 4 with the record 2:1, then the Buchholz score is 3 + 2 = 5.
                In the nets, the teams are sorted by two factors in two lists: by the placements and Buchholz scores.
                Then, in later rounds (3,4,5), the teams are distributed into match-ups even more complicatedly. The teams are getting distributed by two factors, which means that both of the factors influence, which team will play against which team.
                This is also a system to avoid possible rematches during the same Stage, <strong>BUT</strong>: <br />
                <i>Still, there is no guaranteeing that a rematch between two teams can't happen in different Stages or Playoffs!!!</i>
            </p>
            <p style={{ marginTop: '8px', fontStyle: "italic", fontWeight: 800 }} className={css.info_text}>
                This is a bit complicated, so you don't have to understand it in order to play freely. I just had to explain it for those who need this.
            </p>
        </section>
        <section>
            <div id="start-match" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px' }} className={css.title}>How to start a match?</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>To start a match, you need to find a rectangle with yellow glow:</p>
            <div
                className={`${css.ro32_rect} ${css.swiss_rect} ${css.match_current}`}
                style={{
                    pointerEvents: "none",
                    margin: "24px 0"
                }}
            >
                <div className={`${css.bo_label} ${css.match_current}`}>
                    BO1
                </div>
                <div className={`${css.no_label} ${css.match_current}`}>
                    #1
                </div>
                <div className={css.team_cell_ro32}>
                    <TeamCircle team={COLORS.raspberry} shouldPlaceholderCirclesBeRendered={false} />
                </div>

                <div className={css.vs_cell_ro32} style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, top: "8px", left: "39px", backgroundColor: "transparent" }} className={css.vs_text}>
                        VS
                    </span>
                </div>

                <div className={css.team_cell_ro32}>
                    <TeamCircle team={COLORS.charcoal} shouldPlaceholderCirclesBeRendered={false} />
                </div>
            </div>
            <span style={{ fontStyle: 'italic', color: 'black' }} className={css.info_text}>(This yellow glow shows that this match is current)</span>
            <p className={css.info_text}>
                Only the matches with this glow are clickable and playable.
                Once the match is played and finished, previously dashed match becomes a match with a yellow glow, which means, it becomes playable. <br />
                To know the order of the matches, look at the right darker part of a match rectangle, where each of the rectangles has its own order number.
            </p>
            <div
                className={`${css.ro32_rect} ${css.swiss_rect} ${css.match_next}`}
                style={{
                    pointerEvents: "none",
                    margin: "24px 0"
                }}
            >
                <div className={`${css.bo_label} ${css.match_next}`}>
                    BO1
                </div>
                <div className={`${css.no_label} ${css.match_next}`}>
                    #1
                </div>
                <div className={css.team_cell_ro32}>
                    <TeamCircle team={COLORS.seafoam} shouldPlaceholderCirclesBeRendered={false} />
                </div>

                <div className={css.vs_cell_ro32} style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, top: "8px", left: "39px", backgroundColor: "transparent" }} className={css.vs_text}>
                        VS
                    </span>
                </div>

                <div className={css.team_cell_ro32}>
                    <TeamCircle team={COLORS.slate} shouldPlaceholderCirclesBeRendered={false} />
                </div>
            </div>
            <span style={{ fontStyle: 'italic', color: 'black', marginBottom: '24px' }} className={css.info_text}>(Dashed border shows that it is the next match)</span>
            <p className={css.info_text}>In our case, we look at the 0:0 net and at the very first match in this net, where we also can see "#1" from the side of our needed match:</p>
            <div className={css.image_container}>
                <img src={locatedMatchRect} alt="Current Match in big" className={css.image} style={{ width: '25vw', height: '32vh' }} />
            </div>
            <p className={css.info_text}>We have to start it somehow and in order to do that, we should click on it first and it will open a match modal:</p>
            <div className={css.image_container}>
                <img src={matchModal} alt="Opened match modal" className={css.image} style={{ width: '35vw', height: '27vh' }} />
            </div>
            <p className={css.info_text}>
                There is a lot of information on this modal, so let me explain it to you: <br />
                At the top, there is a small stage name, name of the match with its order number and the "Best of" of this match, in this case it's a BO1. <br />
                In the center, there are two teams, that will be playing in this match. Inside of their circles there are shown their current points. On top of the circle, there is the team's placement and on the bottom, there is the team's name. Then, above and below of these circles, we see an approximate prediction on points change of both teams (W means Win; L means Loss). This is approximate because some factors of points change are developed throughout the match itself that's why, they are only approximate. <br /> You have to choose one of these teams by clicking on your chosen team's circle. <br />
                Below those, there is a percentage bar, which shows the estimated winning chances of each team and the text stating, which team has an advantage (or none of the teams).
                The percentages are being calculated based on teams'{' '}
                <a
                    style={{ color: 'Highlight', fontStyle: 'italic' }}
                    onClick={scrollToAnchor("stats-explained")}
                    href='#stats-explained'
                >
                    stats
                </a> and already one little stat difference may put one team into total outsiders (in most cases, this may indeed be true). But still, huge upsets can happen, even if the prediction may say that upset is purely impossible. <br />
                And of course, on both sides of the modal, there are full two tabs with all the stats of each team and their average value.
                You can close them, open them and their closed/opened state will be persisted for each modal, so e.g. one modal has both opened and another modal could have only one opened: you can do with that information, whatever you want. <br />
                <i>P.s.: Some stats have the <span style={{ color: "#8a8d99", fontStyle: "normal", fontWeight: 600, lineHeight: "9px", whiteSpace: "nowrap" }}>Not activated</span> badge near them: this means, they don't influence the performance of a team in this match and they will not increment or decrement after this match, no matter the performance of the team. </i> <br />
                At the bottom, there is a blue button with "Start this 0:0 Match" text on it. <br />
                <b style={{ display: "block", marginTop: '8px', marginBottom: '-16px' }}>(In this case, it's 0:0 Match. Different matches will have another text depicted on this button)</b> <br />
                You will be able to click it, once you choose one of the teams: <br />
            </p>
            <div className={css.image_container}>
                <img src={chosenLeftTeamModal} alt="Chosen left team on the match modal" className={css.image} style={{ width: '35vw', height: '27vh' }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (Your chosen team is being highlighted with blue glow and is always at the left, even if it is at the right at first)
                </span>
            </div>
            <div className={css.image_container}>
                <img src={chosenRightTeamModal} alt="Chosen right team on the match modal" className={css.image} style={{ width: '35vw', height: '27vh' }} />
            </div>
        </section>
        <section>
            <div id="during-match" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px' }} className={css.title}>What do I do during the match?</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>After starting the match, you're being redirected to the "series screen":</p>
            <div className={css.image_container}>
                <img src={seriesScreen} alt="'Series screen" className={css.image} style={{ width: '32vw', height: '36vh' }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (Matches in Playoffs have a bit different scoreboard)
                </span>
            </div>
            <p className={css.info_text}>
                At the very top, there are a stage name, a trophy icon, which all teams are fighting for and a match name with its order number. <br />
                Lower from it, there is the "Best of" of the match. <br />
                In the center, there is the scoreboard. In the middle, there is a leading indicator, which at the start is a diamond, because of tied score and round count. On the left and on the right, there are these big numbers, which tell who how much rounds has a team already taken and below them, there are set lines, which stand for sets and they light themselves, when a set is taken. Near those big round counts, there are team names and squares standing for won and yet not won mini-rounds. On the left side, there's always your picked team. <br />
                Below the scoreboard, there is "First to n" and "nx Overtime". These show up, once it's Overtime and the "Double" or "Triple" near it mean that Overtime was pushed to multiple ones, like "Triple Overtime" means word-to-word: "Third Overtime". <br />
                At the bottom, there's gamble button. <br />
                In general, all the rules are from Extended Mode. In order to win a set here, 13 rounds are required to be won. Maximum of a normal regulation is 24 rounds, so if it is a tie 12-12 after 24 rounds, it's Overtime, where 6 rounds are played and the one who takes 4 first, wins. Once again, if in Overtime, it's 15-15, so each team won 3 OT rounds, we go onto Double Overtime and it can go up to 4 Overtimes. If after 4 Overtimes, there's still a tie, then there will be taken another tiebreaker system. This "another" tiebreaker system is explained <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={scrollToAnchor("tiebreaker-system")} href='#tiebreaker-system'>here</a>. 1 round is won when 5 mini-rounds are won. <i>But there are <b>exceptions</b>: 1st Round, 13th Round and each first round of every Overtime require 10 mini-wins to win a round, that's why, they are called <strong>Extended Rounds</strong> or <strong>Extended OT rounds</strong>.</i> <br /> In order for a team to win a mini-round, they need a specific number. Why do they specifically need this number, it is because: <br />
            </p>
            <p className={css.info_text}>
                <b>
                    The range for the rolled number is between <b style={{ color: 'red' }}>0.0x</b> and <b style={{ color: 'green' }}>5.0x</b>.
                    Both teams make separate rolls and whoever has more, that one gets a mini-round (except if both teams roll the same multiplier: in that case, nobody gets a mini-round and we just proceed).
                    These rolls are initially random for each team but{" "}
                    <a
                        style={{ color: 'Highlight', fontStyle: 'italic' }}
                        onClick={scrollToAnchor("stats-explained")}
                        href='#stats-explained'
                    >
                        the stats
                    </a>, which the teams increment/decrement throughout different matches, influence the teams' rolls. The higher the stats a team has, the higher multiplier they will get on average. But in our case, all teams have the same stats on their very first matches, that's why here, it's pure RNG:
                </b>
            </p>
            <div className={css.image_container}>
                <img src={miniRoundWonChocolate} alt="Won mini-round for Team Charcoal" className={css.image} style={{ width: '33vw', height: '36vh' }} />
                <img src={miniRoundWonIvory} alt="Won mini-round for Team Raspberry" className={css.image} style={{ width: '33vw', height: '36vh' }} />
            </div>
            <p className={css.info_text}>And by taking a round, a team gets a lead and leading indicator will show to the team, which has a lead:</p>
            <div className={css.image_container}>
                <img src={wholeRoundWonChocolate} alt="Won round for Team Charcoal" className={css.image} style={{ width: '33vw', height: '36vh' }} />
            </div>
            <p className={css.info_text}>And as it is a Best of 1 in 0:0 net of Stage I, a team needs one set to win:</p>
            <div className={css.image_container}>
                <img src={matchPointImg} alt="MATCH POINT!!! for the Charcoal!" className={css.image} style={{ width: '34vw', height: '38vh' }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (Once a team is one round away from taking a set, they have a "Set Point!" label above their names. But if a team is one set away from winning and one round away from winning, then it says "MATCH POINT!!!". This label differs itself in some specific matches, but I'll leave it already to you to find "some other specific cases" out)
                </span>
            </div>
            <p className={css.info_text}>
                After one of the both teams wins, this team goes then into 1:0 net as explained above and the loser team goes to 0:1 net.
                They go into such placeholder rectangles, which show who has already won 0:0 match or lost it.
                Once all matches of 0:0 finish, only then rectangles go and matches in two next nets are built by the distribution system as explained <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={scrollToAnchor("distribution-explained")} href='#distribution-explained'>here</a>.
                The winner side is light-green and the loser side is light-red on the rectangle. Depending if your chosen team won, a green check icon appears and a red cross appears, if lost. The "VS" is replaced by the final score of the match: <br />
            </p>
            <div className={css.image_container}>
                <img src={teamChocolateGoesTo10Net} alt="Team Charcoal goes to 1:0 net and Team Raspberry goes to 0:1 net" className={css.image} style={{ width: '30vw', height: '40vh' }} />
            </div>
        </section>
        <section>
            <div id="results-match" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content", textAlign: "start" }} className={css.title}>
                    — Can I watch the results of this first match? <br />
                    — Of course!
                </h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>Already finished match is finished, but you can click on it and see results of the match in that same modal:</p>
            <div className={css.image_container}>
                <img src={finishedMatchModalImg} alt="Finished match modal" className={css.image} style={{ width: '35vw', height: '27vh' }} />
            </div>
            <p className={css.info_text}>
                On the header of the modal, we can see it in light-green or light-red dependent on whether your chosen team won. Above we can see the check icon again (it can also be a cross icon but if the match would have lost). <br />
                And there is also a small label, which tells how many <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={scrollToAnchor("pickem-system")} href='#pickem-system'>Pick&apos;em points</a> you got. <br />
                In the middle, there is final score of the match, where there are some changes from pre-match modal. The winner team gets 10 points from this win here and changes its placement from 50th place to 33rd place. Loser team loses 5 points and moves from 47th place to 64th place.<br />
                Also, the winner team got an <strong>Unbeaten Streak</strong>: consecutive wins without a loss in between will increment it. <br />
                In the footer, there is a precise series summary. Here, you can see total played rounds, which is also a clickable button (we will come back to it soon in <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={scrollToAnchor("breakdown-explained")} href='#breakdown-explained'>Detailed Match Results</a> section), the score after 1st Half, the score after 2nd Half and in some cases, like here as well, the score after all OTs (here, it was only 1x OT).
            </p>
            <p className={css.info_text}>
                These check marks near the names of Halfs and OT show which team won the Extended Round (10 mini-wins round) in that half. <br />
                If OT goes onto multiple OTs and a team won in those multiple OTs at least 2 Extended Rounds, the check mark is being replaced by a "i" mark like here:
            </p>
            <div className={css.image_container}>
                <img src={finishedMatchModalTwoImg} alt="Finished match modal" className={css.image} style={{ width: '35vw', height: '27vh' }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (This 4x OT was like the full match regulation, LOL)
                </span>
            </div>
            <p className={css.info_text}>
                By hovering onto this "i" mark, you can see in which Overtimes a team won the Extended Rounds:
            </p>
            <div className={css.image_container}>
                <img src={finishedMatchModalThreeImg} alt="Finished match modal" className={css.image} style={{ width: '35vw', height: '27vh' }} />
            </div>
        </section>
        <section>
            <div id="stats-explained" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content", textAlign: "start" }} className={css.title}>
                    Team stats and how do they work
                </h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                Throughout this whole tab, you've been noticing team stats in match modals and Leaderboard. I have already explained as well beforehand that these stats influence the number generation based on how they are. But all these stats have different names, different premises, different effects and different values. That's why, I will explain each here:
            </p>
            <StatExplanations />
        </section>
        <section>
            <div id="breakdown-explained" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content", textAlign: "start" }} className={css.title}>
                    Detailed Match Results
                </h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>As I have already spoiled it to you in the pre-previous section, there is even more detailed series summary. To open it, we should click onto that blue button with total rounds count:</p>
            <div className={css.image_container}>
                <img src={hoveredTotalRoundsCountButton} alt="Hovered blue button with total rounds count" className={css.image} style={{ width: '35vw', height: '27vh', margin: "0 auto" }} />
                <img src={detailedMatchResults} alt="Detailed Match Results" className={css.image} style={{ width: '34vw', height: '35vh', margin: "0 auto" }} />
            </div>
            <p className={css.info_text}>
                At the top, there are a modal and the navigation. The modal contains the match Stage, name and order number, "Best of" of this match, gained Pick&apos;em points specifically in this set(this is a Bo1 here, so in this Bo1), final set score with total played rounds, "Back?" button and the text, which can be clicked and shrink the modal for a better view of the breakdown. The modal also has all the possible indicators to show whether your pickem team won this specific set(again, it's a Bo1 here, so this Bo1). <br />
                The navigation contains all significant parts of the set and allows you to go directly to that or that part. These two (modal and navigation) are always with you on the screen (until you click on the "Back?" button, of course).
            </p>
            <p className={css.info_text}>
                And as you already understood, this is a detailed breakdown of each round, each having the won amount of mini-rounds for both teams. The parts are also visually separated, like here for example:
            </p>
            <div className={css.image_container}>
                <img src={significantPartDivider} alt="Divider between First Half and Second Half" className={css.image} style={{ width: '34vw', height: '35vh', margin: "0 auto" }} />
            </div>
            <p className={css.info_text}>
                The ending of the set looks like this, for example (in this case, it has happened in first Overtime):
            </p>
            <div className={css.image_container}>
                <img src={setEnding} alt="Ending of the set in Overtime" className={css.image} style={{ width: '34vw', height: '35vh', margin: "0 auto" }} />
            </div>
            <p className={css.info_text}>
                For non-Bo1 matches, like e.g. Bo3s, there are different looks of match modals and detailed match results:
            </p>
            <div className={css.image_container}>
                <img src={boThreeFinishedMatchModal} alt="Finished Match modal, Bo3" className={css.image} style={{ width: '31vw', height: '36vh', margin: "0 auto" }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (Decider is the last playable set of a series; In this case, it's meant a Set 3)
                </span>
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black', marginLeft: "5vw" }}>
                    (Lost streak in this match is also visible)
                </span>
            </div>
            <p className={css.info_text}>
                And the UI for the Detailed Match Results modal for non-Bo1 matches is also different. I open at first the "Set 1":
            </p>
            <div className={css.image_container}>
                <img src={detailedMatchResultsBoThreeFirstSet} alt="Detailed Match Results of Set 1 of a Bo3" className={css.image} style={{ width: '34vw', height: '35vh', margin: "0 auto" }} />
            </div>
            <p className={css.info_text}>
                Here, it's visible that the modal indicates whether your picked team won the set you're currently reviewing. Gained Pick&apos;em points are here as well only for a set you've taken.
            </p>
            <div className={css.image_container}>
                <img src={detailedMatchResultsBoThreeSecondSet} alt="Detailed Match Results of Set 2 of a Bo3" className={css.image} style={{ width: '34vw', height: '35vh', margin: "0 auto" }} />
                <img src={detailedMatchResultsBoThreeDecider} alt="Detailed Match Results of the Decider of a Bo3" className={css.image} style={{ width: '34vw', height: '35vh', margin: "0 auto" }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (Golden label is only shown at the last played set of a series and shows how much Pick&apos;em points you have gained from the whole series)
                </span>
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (If your picked team wins last needed set to win, you get from that set only 1 Pick&apos;em point)
                </span>
            </div>
        </section>
        <section>
            <div id="tiebreaker-system" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content", textAlign: "start" }} className={css.title}>
                    Tiebreaker system after Quadruple Overtime
                </h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>There has been a simple tiebreaker system for a long time: Overtimes could go up to infinity, until a team gets 4 OT Rounds in a single Overtime. Now, the system has changed and the previous system only works up to Quadruple(4x) Overtime. If it's tied again in 4x Overtime, another way to separate teams is being implemented.</p>
            <p className={css.info_text}>After 24-24 tie, this screen will show up. We see here the scores and the set lines below. Below that, we'll see the explanation text of what will happen now and then you will see messages showing up in a list and the scores being updated. Here, we are seeing a chronological order of all 6 possible Extended Rounds to be won. That team, which won more Extended Rounds throughout the whole set, that team also wins the set (4 Extended Rounds are already enough):</p>
            <div className={css.image_container}>
                <img src={extRoundsScreenOne} alt="Extended Rounds comparison screen 1" className={css.image} style={{ width: '30vw', height: '30vh' }} />
            </div>
            <div className={css.image_container}>
                <img src={extRoundsScreenTwo} alt="Extended Rounds comparison screen 2" className={css.image} style={{ width: '30vw', height: '30vh' }} />
            </div>
            <p className={css.info_text}>If the Extended Rounds score is tied 3-3, penalty series will start, which will decide everything:</p>
            <div className={css.image_container}>
                <img src={extRoundsScreenThree} alt="Extended Rounds score tied 3-3" className={css.image} style={{ width: '30vw', height: '32vh' }} />
            </div>
            <div className={css.image_container}>
                <img src={pensScreen} alt="Penalty series screen" className={css.image} style={{ width: '32vw', height: '36vh' }} />
            </div>
            <p className={css.info_text}>
                It looks similar to what we've used to see normally in normal series screen. But here, instead of mini-wins indicators, there are penalties indicators: dashed and hollow circles mean that the attempt hasn't been taken yet, green circles mean successful attempt and red circles mean unsuccessful attempt. The rules are now different as from normal series.
                The point and the idea here were taken from football analogue, explained <a style={{ color: 'Highlight', fontStyle: 'italic' }} target="_blank" href='https://en.wikipedia.org/wiki/Penalty_shoot-out_(association_football)'>here</a>. Unlike football, we utilize here some different rules from football. Teams take turns one by one. The team that will take the Pen first, is always random. But, here are also simultaneous pair rolls of each team. During an attempt of e.g. left team, left team should roll a bigger number than their opponent to gain a successful attempt, like here:
            </p>
            <div className={css.image_container}>
                <img src={successfulAttemptForLeft} alt="Successful attempt for the left team" className={css.image} style={{ width: '32vw', height: '36vh' }} />
            </div>
            <p className={css.info_text}>
                If the rolled number of left team on left team's turn is smaller than right team's one, then it's unsuccessful attempt for the left team. For right team to get a successful attempt, they need also a higher number than their opponent's and for unsuccessful, a smaller one:
            </p>
            <div className={css.image_container}>
                <img src={unSuccessfulAttemptForRight} alt="Unsuccessful attempt for the right team" className={css.image} style={{ width: '32vw', height: '36vh' }} />
            </div>
            <p className={css.info_text}>
                If both rolled numbers are the same, the same attempt should be retaken:
            </p>
            <div className={css.image_container}>
                <img src={neutralAttemptForLeft} alt="Neutral attempt for the left team (must retake the attempt)" className={css.image} style={{ width: '32vw', height: '36vh' }} />
            </div>
            <p className={css.info_text}>
                The rules on how many successful attempts are needed to win, are explained in that same Wikipedia page. But, whoever wins the penalty series, that one also wins the whole set:
            </p>
            <div className={css.image_container}>
                <img src={rightWinsPens} alt="Right team win the penalty series" className={css.image} style={{ width: '30vw', height: '34vh' }} />
            </div>
            <p className={css.info_text}>
                Match rectangle of such a match looks like this then:
            </p>
            <div className={css.image_container}>
                <img src={matchRectPens} alt="Match rectangle with penalty score" className={css.image} style={{ width: '30vw', height: '21.5vh' }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (Instead of "Pens", it could be also "ERs", which stands for "Extended Rounds". "ERs" is there if this match was finished already by Extended Rounds score. Also, this label underneath is only in BO1s.)
                </span>
            </div>
            <p className={css.info_text}>
                And the match modal looks like this:
            </p>
            <div className={css.image_container}>
                <img src={matchModalExtRoundsAndPens} alt="Match modal with Extended Rounds score and penalty score" className={css.image} style={{ width: '35vw', height: '31vh' }} />
            </div>
            <div className={css.image_container}>
                <img src={matchModalExtRoundsAndPensHovered} alt="Hovered onto the info icon near 'Penalties' text, where we see a pop-up with full penalties breakdown" className={css.image} style={{ width: '35vw', height: '31vh' }} />
            </div>
            <p className={css.info_text}>
                And this is how it looks in Detailed Match Results:
            </p>
            <div className={css.image_container}>
                <img src={extendedRoundsAndPensInDetailedMatchResults} alt="Look of 'Extended Rounds' and 'Penalties' parts in Detailed Match Results" className={css.image} style={{ width: '28vw', height: '31vh' }} />
            </div>
        </section>
        <section>
            <div id="pickem-system" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px' }} className={css.title}>Pick&apos;em system</h3>
                <div className={css.divider} />
            </div>
            <p style={{ marginTop: '12px' }} className={css.info_text}>Now, lemme explain about Pick'em points system: <br />
                Since we are able to pick for every match, we need to get a reward, if chosen a winner team. <br />
                • If your chosen team wins any BO1 match, you get <b>+1 Pick&apos;em point</b> per match <br />
                • If your chosen team wins any BO3 match, you get <b>+3 Pick&apos;em points</b> per match <br />
                • if any BO5, you get <b>+5 Pick&apos;em points</b> per match <br />
                • if any BO7, you get <b>+7 Pick&apos;em points</b> per match <br />
                • and if any BO9, you get <b>+9 Pick&apos;em points</b>. <br />
                <strong>In a nutshell: you get 2 Pick&apos;em points for each won set of your chosen team, except the last needed set for the victory, which will only bring 1 Pick&apos;em point.</strong>
            </p>
            <p className={css.info_text}>
                Also, in the right top corner of the Swiss Stage or Playoffs, there are shown needed Pick&apos;em points in order to win. <br />
            </p>
            <p className={css.info_text}>That's why also I get here only <b>+1 Pick&apos;em point</b>:</p>
            <div className={css.image_container}>
                <img src={finishedMatchModalImg} alt="Finished match modal" className={css.image} style={{ width: '37vw', height: '31vh' }} />
            </div>
        </section>
        <section>
            <div id='leaderboard-explained' style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Leaderboard format and points system</h3>
                <div className={css.divider} />
            </div>
            <LeaderboardExplained />
        </section>
        <section>
            <div id="what-happens" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>What happens next?</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>After that, you can proceed with further matches. When all the match-ups in Stage I are finished, only 16 teams are left. They qualify into Stage II and build with auto-qualifiers match-ups for 0:0 net but already in Stage II:</p>
            <div className={css.image_container}>
                <img src={stageTwoQualifiersImg} alt="Stage II Qualifiers" className={css.image} style={{ width: '30vw', height: '40vh' }} />
            </div>
            <div className={css.image_container}>
                <img src={stageTwoImg} alt="Stage II" className={css.image} style={{ width: '33vw', height: '42vh' }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (There is a navigation menu in top left corner, where you can also see Stage III and Playoffs, once you finish Stage II)
                </span>
            </div>
            <p className={css.info_text}>And so you can proceed from Stage II to Stage III and from Stage III to Playoffs:</p>
            <div className={css.image_container}>
                <img src={playoffsQualifiersImg} alt="Playoffs Qualifiers" className={css.image} style={{ width: '30vw', height: '40vh' }} />
            </div>
            <div className={css.image_container}>
                <img src={playoffsImg} alt="Playoffs" className={css.image} style={{ width: '29vw', height: '40vh' }} />
            </div>
            <p className={css.info_text}>As I mentioned above, Round of 16 and Quarterfinals are <b>BO5</b>, Semifinals and Third Place Decider are <b>BO7</b>, and the Grand Final is <b>BO9</b>.</p>
            <p className={css.info_text}>
                Playoffs are single-elimination stage, which means that once a team loses a series, it flies out of the tournament directly. By the time we reach Grand Final, there should be only two teams left:
            </p>
            <div className={css.image_container}>
                <img src={grandFinalistsImg} alt="Two contenders for the championship remaining" className={css.image} style={{ width: '29vw', height: '38vh' }} />
            </div>
            <p className={css.info_text}>
                In a BO9 will be decided the winner of the tournament. And once the winner of the Grand Final is determined, we are directly redirected to winner's screen, where we see first 4 places of the tournament:
            </p>
            <div className={css.image_container}>
                <img src={winnersScreenImg} alt="Team Gold as Winner, Team Lime as Runner-up, Team Blue as Third Place, Team Green as Fourth Place" className={css.image} style={{ width: '35vw', height: '72vh' }} />
            </div>
            <p className={css.info_text}>After clicking "Proceed", we are redirected to Pick&apos;em summary, where you can see how many matches overall you've guessed correctly throughout the tournament and your final Pick&apos;em points score and also whether you won the Pick'em challenge or not:</p>
            <div className={css.image_container}>
                <img src={pickemSummaryImg} alt="Pick'em Summary Screen" className={css.image} style={{ width: '41vw', height: '39vh' }} />
            </div>
        </section>
        <section>
            <div id="finale" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Finale? Or not?</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>Afterwards you can click on "To the bracket" button to see the full results of the tournament or just go to somewhere (yellow button redirects, all three buttons clear the tournament results, except the points and placing and redirect to somewhere else in the website). I click "To the bracket" button and I'm getting indeed redirected to the playoffs results:</p>
            <div className={css.image_container}>
                <img src={playoffsResultsAndTournamentFinished} alt="Playoffs Results and Finished Tournament Results" className={css.image} style={{ width: '33vw', height: '40vh' }} />
            </div>
            <p className={css.info_text}>
                Five buttons are replacing now the Needed Pick&apos;em points and they explain by themselves, what they do. Also, in the Header, we can open the updated Leaderboard:
            </p>
            <div className={css.image_container}>
                <img src={updatedLeaderboard} alt="Updated Leaderboard" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (The trophy icon resembles each Official win for the teams, the medals are understandable, what they resemble)
                </span>
            </div>
            <p className={css.info_text}>
                Then, I clicked "Back to the start of Special Mode" and got redirected to Intro Page again:
            </p>
            <div className={css.image_container}>
                <img src={introImgTwo} alt="Intro Page 2" className={css.image} style={{ width: '34vw', height: '35vh' }} />
            </div>
            <p className={css.info_text}>
                Here, I can finally go to Hall of Fame and see something:
            </p>
            <div className={css.image_container}>
                <img src={hallOfFameWithOfficialOne} alt="Hall of Fame with the Official #1 card" className={css.image} style={{ width: '34vw', height: '35vh' }} />
            </div>
            <p className={css.info_text}>
                Hall of Fame has stored the very first played Tournament with its Pick'em points info and Podium. In top-right corner, we see also a change. This way, any played tournament will be stored here. Here is the full look of it, when we open the Official #1 overview:
            </p>
            <div className={css.image_container} style={{ gap: 24 }}>
                <img src={hallOfFameOfficialOnePartOne} alt="Hall of Fame, Official #1: the challenge result and the teams of every Stage" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <img src={hallOfFameOfficialOnePartTwo} alt="Hall of Fame, Official #1: all 16 Playoffs qualifiers and the Playoffs bracket" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <img src={hallOfFameOfficialOnePartThree} alt="Hall of Fame, Official #1: the rest of the Playoffs bracket, the Third Place Decider and the top of the podium" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <img src={hallOfFameOfficialOnePartFour} alt="Hall of Fame, Official #1: the podium and the start of 5th-16th places" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <img src={hallOfFameOfficialOnePartFive} alt="Hall of Fame, Official #1: 7th to 14th places" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <img src={hallOfFameOfficialOnePartSix} alt="Hall of Fame, Official #1: 9th to 16th places" className={css.image} style={{ width: '34vw', height: '35vh' }} />
            </div>
            <p className={css.info_text}>
                Afterwards, I could go try out new tournaments, which I'm explaining in the further tabs. But here, I decided to go onto the second tournament:
            </p>
            <div className={css.image_container}>
                <img src={tournamentIntroScreenImgTwo} alt="Tournament Intro Screen for Official #2" className={css.image} style={{ width: '35vw', height: '35vh' }} />
            </div>
        </section>
    </>
);

const PEM_SMALL_IMAGES = import.meta.glob("../../../assets/images/pem-small-*.png", { eager: true, import: "default" });
const pemImg = (n) => PEM_SMALL_IMAGES[`../../../assets/images/pem-small-${String(n).padStart(2, "0")}.png`];

const PEM_BIG_IMAGES = import.meta.glob("../../../assets/images/pem-big-*.png", { eager: true, import: "default" });
const pemBigImg = (n) => PEM_BIG_IMAGES[`../../../assets/images/pem-big-${String(n).padStart(2, "0")}.png`];

const PemShot = ({ n, src, alt, width = "34vw", caption }) => (
    <div className={css.image_container}>
        <img src={src ?? pemImg(n)} alt={alt} className={css.image} style={{ width, height: "auto" }} />
        {caption && (
            <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                {caption}
            </span>
        )}
    </div>
);

const InfoLink = ({ onClick, href, children }) => (
    <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={onClick} href={href}>
        {children}
    </a>
);

const PemSmallSubPage = ({ scrollToAnchor }) => (
    <>
        <section>
            <div id="pem-overview" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Three tournaments in one</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                <b>Pro Extreme Masters Small Tournament</b> (PEM Small Tournament) can be picked in the "Choose how you want to play" modal or come up by "Random".
                Unlike Official, it is not one tournament but three, played one after another: <br />
                • <b>PEM Small Tournament Qualifier</b> (Qualifier) <br />
                • <b>Champions Series Tour</b> (Tier 2) <br />
                • <b>PEM Small Tournament</b> itself, the main event (Tier 1)
            </p>
            <PemShot n={1} alt="Choose how you want to play modal with the PEM Small Tournament picked" />
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                All the teams are seeded by the Leaderboard at the moment the PEM Small Tournament is chosen: <br />
                • Top 1-12 → Autoqualify to the <b>main event</b> <br />
                • Top 13-44 → Play in the <b>Qualifier</b> for the 4 remaining places of the main event <br />
                • Top 45-64 → Play in the <b>Champions Series Tour</b>
            </p>
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                Once the last match of the Qualifier or the Champions Series Tour is played, the "Proceed" button above the bracket starts the next tournament right away.
            </p>
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                Everything about how a match itself is played (the match modal, the series screen, Overtimes, the tiebreaker, Pick&apos;em points and so on) works exactly like in Official, so I won&apos;t repeat it here.
                If you haven&apos;t read it yet, start with{" "}
                <InfoLink onClick={scrollToAnchor("start-match", "official")} href="?page=official#start-match">How to start a match?</InfoLink>{" "}
                in the Official tab. Here, I will rather tell you about my very first <b>PEM Small Tournament #1</b>, which I played right after{" "}
                <InfoLink onClick={scrollToAnchor("finale", "official")} href="?page=official#finale">Official #1</InfoLink>.
            </p>
        </section>
        <section>
            <div id="pem-qualifier" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>PEM Small Tournament Qualifier</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                After clicking "Start Game", I don&apos;t land in the main event, but in its Qualifier first. The Tournament Intro Screen already shows the difference:
                instead of Stages, there are <b>Group A</b> and <b>Group B</b> with 16 teams each, and a dark "Qualifier" badge above the title.
                The 32 teams (places 13-44) were dealt into the Groups one by one by their placements: 13th to Group A, 14th to Group B, 15th to Group A and so on, so both Groups are equally strong.
            </p>
            <PemShot n={2} alt="Tournament Intro Screen of the Qualifier with Group A and Group B" />
            <p className={css.info_text}>
                After "Continue", every Group is its own <b>Double Elimination</b> bracket. Above, there is the <b>Upper Bracket</b>: Opening Round, Upper Quarterfinals, Upper Semifinals and the Upper Final.
                Below, there is the <b>Lower Bracket</b>, where every team lands after its first loss: Lower Rounds 1, 2 and 3, Lower Semifinals, Lower Final and, at the very end, the <b>Consolidation Final</b>.
                A second loss and a team flies out of the Qualifier.
            </p>
            <PemShot n={3} alt="Group A of the Qualifier: the Upper Bracket" />
            <PemShot
                n={4}
                alt="Group A of the Qualifier: the Lower Bracket down to the Consolidation Final"
                caption="(The small team circles in the TBD slots show which two teams the winner or the loser will come from)"
            />
            <p className={css.info_text}>
                Only the <b>2 best teams of every Group</b> qualify: the winner of the Upper Final and the winner of the Consolidation Final (the Lower Bracket&apos;s winner against the loser of the Upper Final).
                That&apos;s why the Upper Final and the Consolidation Final are <b>Best of 5</b>, all the other matches are <b>Best of 3</b>. There are no Bo1s here at all.
            </p>
            <p className={css.info_text}>
                With the "Group A" / "Group B" tabs at the top, I can switch between both brackets. Every Group has its own current match with the yellow glow,
                so I can decide by myself, which Group I continue with.
                The match modal looks as usual, it only tells the Group and the round now:
            </p>
            <PemShot n={5} alt="Match modal of an Opening Round in Group A" width="35vw" height="27vh" />
            <PemShot n={6} alt="Series screen of a Qualifier match with the Qualifier badge" width="30vw" caption="(The trophy icon in the series screen is replaced by the Qualifier badge here)" />
            <p className={css.info_text}>
                In my Qualifier, Team Rose and Team Moss won their Upper Finals, while Team Periwinkle and Team Sunflower went the long way and won the Consolidation Finals.
                Once the last match is played, instead of a podium, there&apos;s a screen with the 4 qualifiers and the round they qualified through:
            </p>
            <PemShot n={7} alt="The 4 qualifiers of PEM Small Tournament #1" />
            <p className={css.info_text}>
                "Proceed" leads to the Pick&apos;em summary as always, but this one counts the guessed matches of every round of the Qualifier. This time, I won it:
            </p>
            <PemShot n={8} alt="Pick'em summary of the Qualifier" />
            <p className={css.info_text}>
                There are no "Back to the start of Special Mode" buttons here, because it&apos;s not over yet. With "To the bracket" I can look at the finished brackets one more time,
                and "Proceed" (here or next to the bracket) takes me to the next tournament:
            </p>
            <PemShot n={9} alt="Finished Qualifier bracket with the Proceed button" />
        </section>
        <section>
            <div id="pem-cst" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Champions Series Tour</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                The second tournament is the <b>Champions Series Tour</b>, a Tier 2 tournament of its own with its own number (Champions Series Tour #1).
                It&apos;s for the 20 lowest placed teams (places 45-64), which had no chance to get into the main event, but they still play for their own title and medals.
                They are dealt into <b>Groups A–D</b> (5 teams each) the same way as in the Qualifier:
            </p>
            <PemShot n={10} alt="Tournament Intro Screen of the Champions Series Tour with Groups A to D" />
            <p className={css.info_text}>
                This time, there are no brackets but <b>Round-Robin Groups</b>: every team plays every other team of its Group exactly once, so 4 matches per team and 10 matches per Group, all of them <b>Best of 1</b>.
                All four Groups are on one screen, each with its table and its matches below. And again, every Group has its own current match.
            </p>
            <PemShot n={11} alt="Group Stage of the Champions Series Tour before the first match" />
            <PemShot n={12} alt="Match modal of a Champions Series Tour Group Stage match" width="35vw" height="27vh" />
            <p className={css.info_text}>
                And here is the one thing that only exists in the Champions Series Tour: a match <b>can end in a tie</b>.
                If the score is 12-12 after the regulation and the first Overtime ends 3-3 as well, so 15-15, nobody wins and the match is over.
                In my very first match of the Champions Series Tour, Team Spring and Team Ruby did exactly that:
            </p>
            <PemShot n={13} alt="TIE! at 15-15 in the series screen" />
            <p className={css.info_text}>
                A tie gives no Pick&apos;em points, no matter which team I picked. The Leaderboard points still move a bit: the favourite loses a few points to the underdog, because a draw against a weaker team is not a good result
                (see{" "}
                <InfoLink onClick={scrollToAnchor("leaderboard-explained", "official")} href="?page=official#leaderboard-explained">Leaderboard format and points system</InfoLink>
                ).
            </p>
            <PemShot n={14} alt="Match modal of the 15-15 tie" width="35vw" height="27vh" caption="(Team Spring was the slight favourite, so it gave 1 point to Team Ruby)" />
            <p className={css.info_text}>
                The tables are sorted by points: <b>a win gives 3 points, a tie 1 point</b>. If teams have the same points, the round difference (RD, won minus lost rounds) decides, then the rounds won and then the match between those two teams.
                Columns: M = matches played, W = wins, T = ties, L = losses, P = points. Once all 40 matches are played, the <b>top 2 of every Group</b> (with a green check mark) go to the Playoffs:
            </p>
            <PemShot
                n={15}
                alt="Finished Group Stage of the Champions Series Tour"
                caption="(Team Azure and Team Honey both had 9 points in Group C, but Team Honey had the better round difference: +10 against +1)"
            />
            <p className={css.info_text}>
                The Playoffs are a classic 8-team bracket: every Group winner meets a second-placed team of another Group in the Quarterfinals.
                Quarterfinals, Semifinals and the Third Place Decider are <b>Best of 3</b>, the Grand Final is <b>Best of 5</b>. With the navigation in the top left corner I can still look at the Group Stage.
            </p>
            <PemShot n={16} alt="Champions Series Tour Playoffs before the Quarterfinals" />
            <p className={css.info_text}>
                Team Azure, which only made it out of its Group thanks to the second place, didn&apos;t lose a single set in the Playoffs and won the Grand Final 3:0 against Team Royal:
            </p>
            <PemShot n={17} alt="Winners' screen of Champions Series Tour #1" width="28vw" />
            <p className={css.info_text}>
                After the Pick&apos;em summary, the finished bracket has a "Proceed" button again, which starts the last and biggest tournament:
            </p>
            <PemShot n={18} alt="Finished Champions Series Tour Playoffs with the Proceed button" />
        </section>
        <section>
            <div id="pem-main-event" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>PEM Small Tournament</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                Finally, the <b>main event</b>. Its Tournament Intro Screen shows all 16 teams: the 12 autoqualified ones (places 1-12) and the 4 teams from the Qualifier, which <b>glow golden</b>,
                so I always know who came from below. Then, the 16 teams are dealt into <b>Group A</b> and <b>Group B</b> (8 teams each):
            </p>
            <PemShot n={19} alt="Tournament Intro Screen of the main event, the Qualifier teams glowing" />
            <p className={css.info_text}>
                Every Group is a <b>Double Elimination</b> bracket again, but a smaller one than in the Qualifier: Opening Round, Upper Semifinals and Upper Final above, Lower Round 1, Lower Semifinals and Lower Final below.
                The Upper Final and the Lower Final are <b>Best of 5</b>, everything else <b>Best of 3</b>.
            </p>
            <PemShot n={20} alt="Group A of the main event before the first match" />
            <p className={css.info_text}>
                This time, a Group doesn&apos;t end with a Consolidation Final. <b>Three teams of every Group</b> go to the Playoffs instead: both Upper Finalists and the winner of the Lower Final.
                Team Seafoam, the champion of Official #1 and the clear favourite, lost its very first match against Team Periwinkle, one of the teams from the Qualifier,
                and had to fight through the whole Lower Bracket of Group A. In Group B, Team Moss, another qualifier, did the same after losing to Team Yellow:
            </p>
            <PemShot n={21} alt="Finished Group B of the main event" caption="(Team Moss won all three Lower Bracket matches, including the Lower Final 3:0 against Team Crimson)" />
            <p className={css.info_text}>
                The Playoffs have 6 teams. The <b>winners of the Upper Finals</b> are rewarded and start right in the Semifinals. The losers of the Upper Finals and the winners of the Lower Finals play the Quarterfinals crosswise against the other Group.
                Quarterfinals, Semifinals and the Third Place Decider are <b>Best of 5</b>, the Grand Final is <b>Best of 7</b>.
            </p>
            <PemShot n={22} alt="Main event Playoffs before the Quarterfinals" caption="(Three of the four Quarterfinalists came through the Qualifier: Team Sunflower, Team Periwinkle and Team Moss)" />
            <p className={css.info_text}>
                Team Seafoam didn&apos;t lose a single set anymore: 3:0 against Team Sunflower, 3:0 against Team Salmon and 4:0 in the Grand Final against Team Yellow.
                And Team Moss, which started the whole PEM Small Tournament in the Qualifier, beat Team Salmon in the Third Place Decider and took the bronze medal.
                Instead of the black Official trophy, the champion gets the silver <b>PEM Small Tournament trophy</b>:
            </p>
            <PemShot n={23} alt="Winners' screen of PEM Small Tournament #1 with the PEM trophy" width="28vw" />
            <PemShot n={24} alt="Pick'em summary of the main event" width="30vw" />
            <p className={css.info_text}>
                After that, the whole PEM Small Tournament is over, and the buttons are the same as at the end of Official:
            </p>
            <PemShot n={25} alt="Finished main event Playoffs with the end buttons" />
        </section>
        <section>
            <div id="pem-rewards" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Trophies, medals and Hall of Fame</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                Now, let&apos;s open the Leaderboard. The winner of the PEM Small Tournament gets the silver PEM trophy, which shows up next to the Official trophies.
                Team Seafoam has both now, and its fire icon tells that its Unbeaten Streak continues (they gained only three as they have already lost one match during Group Stage and they were blocked from gaining Unbeaten Streak up until Playoffs; see{" "}
                <InfoLink onClick={scrollToAnchor("stats-explained", "official")} href="?page=official#stats-explained">Team stats and how do they work</InfoLink>
                ):
            </p>
            <PemShot n={26} alt="Leaderboard after PEM Small Tournament #1" />
            <p className={css.info_text}>
                Second and third places of Tier 1 and Tier 2 tournaments don&apos;t get their own icons, they are counted together with the Official ones.
                By hovering onto a medal, I can see where they come from. Team Yellow lost the Grand Finals of Official #1 and of PEM Small Tournament #1, so it has two silver medals:
            </p>
            <PemShot n={27} alt="Hovered medal of Team Yellow: 1 from Official, 1 from Tier 1 tournament" width="28vw" />
            <p className={css.info_text}>
                The winner of the Champions Series Tour gets a 🥇 medal instead of a trophy, so Team Azure, the 33rd team in the Leaderboard, can show off its title as well:
            </p>
            <PemShot n={28} alt="Hovered gold medal of Team Azure: 1 from Tier 2 tournament" width="28vw" />
            <p className={css.info_text}>
                And in the Hall of Fame, there are three new cards now, one for every tournament of PEM Small Tournament #1. The newest one is always on the left.
                Each card shows the result of its Pick&apos;em challenge as well: I won all three, so the Pick&apos;em points score and the counts in the top-right corner went up:
            </p>
            <PemShot n={29} alt="Hall of Fame with the cards of the main event, the Champions Series Tour, the Qualifier and Official #1" />
            <p className={css.info_text}>
                By clicking on a card, I see the whole summary of that tournament, built the same way as{" "}
                <InfoLink onClick={scrollToAnchor("finale", "official")} href="?page=official#finale">the one of Official</InfoLink>.
                The Qualifier&apos;s summary has both Group brackets and, at the end, the 4 qualified teams with a link, which opens the summary of the main event:
            </p>
            <PemShot n={30} alt="Hall of Fame, the Qualifier: all teams and the Group brackets" />
            <PemShot n={31} alt="Hall of Fame, the Qualifier: the qualified teams and the link to the main event" />
            <p className={css.info_text}>
                The Champions Series Tour&apos;s summary has the Group tables with all their matches, the Playoffs, the podium and the places 5-8:
            </p>
            <PemShot n={32} alt="Hall of Fame, Champions Series Tour #1: all teams and the Group Stage" />
            <PemShot n={33} alt="Hall of Fame, Champions Series Tour #1: the Playoffs" />
            <p className={css.info_text}>
                And the main event&apos;s summary marks the teams from the Qualifier with the same golden glow as its Tournament Intro Screen did. The link below them leads back to the Qualifier&apos;s bracket:
            </p>
            <PemShot n={34} alt="Hall of Fame, PEM Small Tournament #1: all teams with the glowing qualifiers and the link to the Qualifier" />
            <PemShot n={35} alt="Hall of Fame, PEM Small Tournament #1: the Playoffs" />
            <PemShot n={36} alt="Hall of Fame, PEM Small Tournament #1: the podium and the 5th and 6th places" />
            <p className={css.info_text}>
                Afterwards, I can choose between <b>Official</b> and <b>PEM Small Tournament</b>, which #2 I'm going to have (or I'll go it via "Random", who knows):
            </p>
            <div className={css.image_container}>
                <img src={hardChoiceToMake} alt="Hard choice to make: Official #2 or PEM Small Tournament #2?" className={css.image} style={{ width: '35vw', height: '35vh' }} />
            </div>
        </section>
    </>
);

const BigShot = ({ n, ...props }) => <PemShot src={pemBigImg(n)} {...props} />;

const PemBigSubPage = ({ scrollToAnchor }) => (
    <>
        <section>
            <div id="big-overview" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>The bigger brother</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                If there is a "Small" one, there has to be a "Big" one as well. <b>Pro Extreme Masters Big Tournament</b> (PEM Big Tournament) is the second Tier 1 tournament and it can be picked
                in the "Choose how you want to play" modal or come up by "Random", same as the other two. And same as the PEM Small Tournament, it is three tournaments, played one after another: <br />
                • <b>PEM Big Tournament Qualifier</b> (Qualifier) <br />
                • <b>Elite Competition League</b> (Tier 2) <br />
                • <b>PEM Big Tournament</b> itself, the main event (Tier 1)
            </p>
            <BigShot n={1} alt="Choose how you want to play modal with the PEM Big Tournament picked" />
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                All the teams are seeded by the Leaderboard at the moment the PEM Big Tournament is chosen: <br />
                • Top 1-12 → Autoqualify to <b>Stage II</b> of the main event <br />
                • Top 13-16 → Autoqualify to <b>Stage I</b> of the main event <br />
                • Top 17-48 → Play in the <b>Qualifier</b> for the 4 remaining places of Stage I <br />
                • Top 49-64 → Play in the <b>Elite Competition League</b>
            </p>
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                Again, "Proceed" starts the next tournament right after the last match of the previous one, and how a match itself is played is explained in{" "}
                <InfoLink onClick={scrollToAnchor("start-match", "official")} href="?page=official#start-match">How to start a match?</InfoLink>{" "}
                of the Official tab. Here, I will tell you about the <b>PEM Big Tournament #1</b>, which I played right after{" "}
                <InfoLink onClick={scrollToAnchor("pem-rewards", "pem-small")} href="?page=pem-small#pem-rewards">PEM Small Tournament #1</InfoLink>.
            </p>
        </section>
        <section>
            <div id="big-qualifier" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>PEM Big Tournament Qualifier</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                The Qualifier is the exact same as the{" "}
                <InfoLink onClick={scrollToAnchor("pem-qualifier", "pem-small")} href="?page=pem-small#pem-qualifier">PEM Small Tournament Qualifier</InfoLink>:
                Group A and Group B with 16 teams each, two Double Elimination brackets and the winners of the Upper Finals and the Consolidation Finals qualify.
                The only difference is who plays in it: places 17-48 instead of 13-44, so it&apos;s a bit weaker.
            </p>
            <BigShot n={2} alt="Tournament Intro Screen of the PEM Big Tournament Qualifier" />
            <BigShot n={3} alt="Group A of the PEM Big Tournament Qualifier before the first match" />
            <p className={css.info_text}>
                And it was a bad Qualifier for the favourites. Team Azure, the champion of{" "}
                <InfoLink onClick={scrollToAnchor("pem-cst", "pem-small")} href="?page=pem-small#pem-cst">Champions Series Tour #1</InfoLink>, lost both of its matches, each of them 1:2, and flew out right away.
                In Group A, Team Orange won all of its matches, but it was close: the Upper Final against Team Blue went to the Decider and ended 3:2.
                Team Blue then fought back through the Consolidation Final with a 3:0 against Team Chartreuse.
                In Group B, it was the same story: Team Violet beat Team Copper 3:1 in the Upper Final and Team Copper then beat Team Sand 3:1 in the Consolidation Final:
            </p>
            <BigShot n={4} alt="The 4 qualifiers of PEM Big Tournament #1" />
            <p className={css.info_text}>
                The Pick&apos;em summary looks the same as in the PEM Small Tournament Qualifier. With only 5/16 Opening Rounds, this one was over pretty early for me:
            </p>
            <BigShot n={5} alt="Pick'em summary of the PEM Big Tournament Qualifier" />
            <BigShot n={6} alt="Finished Group B of the Qualifier with the Proceed button" />
        </section>
        <section>
            <div id="big-ecl" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Elite Competition League</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                The second tournament is the <b>Elite Competition League</b>, a Tier 2 tournament with its own number (Elite Competition League #1), same as the Champions Series Tour.
                It&apos;s for the 16 lowest placed teams (places 49-64). This time, there are no Groups: the Tournament Intro Screen only shows all 16 teams, because all of them play in one bracket:
            </p>
            <BigShot n={7} alt="Tournament Intro Screen of the Elite Competition League" />
            <p className={css.info_text}>
                That bracket is a <b>Double Elimination</b> bracket again, built like a Group of the Qualifier: Opening Round, Upper Quarterfinals, Upper Semifinals and Upper Final above,
                Lower Rounds 1-3, Lower Semifinals, Lower Final and Consolidation Final below. But here, nobody qualifies anywhere, so there is one more match at the very end:
                the <b>Grand Final</b>, between the winner of the Upper Final and the winner of the Consolidation Final.
            </p>
            <BigShot n={8} alt="Elite Competition League bracket before the first match" />
            <p className={css.info_text}>
                The formats are different from all the other brackets: the whole Upper Bracket is <b>Best of 1</b>, except the Upper Final, which is <b>Best of 3</b>.
                The whole Lower Bracket is <b>Best of 3</b> and the Grand Final is <b>Best of 5</b>. So, a team can lose its only Bo1 in the Upper Bracket and still get a full Bo3 in the Lower Bracket.
                The very first match was the top seed Team Forest against the last seed Team Midnight:
            </p>
            <BigShot n={9} alt="Match modal of the first Opening Round of the Elite Competition League" width="35vw" />
            <BigShot n={10} alt="Series screen of a Bo1 Opening Round" width="30vw" caption="(It's not Playoffs, so the series screen keeps the usual HUD)" />
            <p className={css.info_text}>
                Since a Bo1 has only one set, its match rect shows the rounds of that set, e.g. 13-10, instead of 1-0. If a Bo1 is decided via Extended Rounds or Penalties,
                both scores turn gray (it was a tie after all) and the result of the tiebreaker shows up on the divider between both teams (see{" "}
                <InfoLink onClick={scrollToAnchor("tiebreaker-system", "official")} href="?page=official#tiebreaker-system">Tiebreaker system after Quadruple Overtime</InfoLink>
                ).
            </p>
            <p className={css.info_text}>
                Team Forest won 13-10, but it lost its next match 3-13 against Team Apricot and then Team Midnight again in Lower Round 2, which went the long way:
                four Lower Bracket wins in a row, up until the Lower Final. There, Team Bronze stopped it. And Team Bronze is the real story of this Elite Competition League:
                it lost its very first match 5-13 against Team Charcoal and then won six Lower Bracket matches in a row, including the Consolidation Final against Team Honey,
                which had lost the Upper Final against Team Charcoal before.
            </p>
            <BigShot n={13} alt="Finished Upper Bracket of the Elite Competition League with the Grand Final" />
            <BigShot n={14} alt="Finished Lower Bracket of the Elite Competition League" />
            <p className={css.info_text}>
                And in the Grand Final, Team Charcoal met Team Bronze again. Team Charcoal won the first two sets, Team Bronze took the third one 13-8,
                but the fourth went to Overtime and Team Charcoal won it 22-19. So, Team Charcoal won the Grand Final 3:1, without losing a single match.
                The placements are different from the other Playoffs as well: the loser of the Grand Final is 2nd, the loser of the Consolidation Final 3rd and the loser of the Lower Final 4th.
                The Winners&apos; screen is the same as in the Champions Series Tour, without quotes and without a trophy:
            </p>
            <BigShot n={11} alt="Winners' screen of Elite Competition League #1" width="28vw" />
            <p className={css.info_text}>
                The Pick&apos;em summary counts every round of the bracket. The single matches (Lower Final, Upper Final, Consolidation Final and Grand Final) are only mentioned, if I guessed them:
            </p>
            <BigShot n={12} alt="Pick'em summary of the Elite Competition League" />
        </section>
        <section>
            <div id="big-main-event" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>PEM Big Tournament</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                The main event has three Stages: <b>Stage I</b>, <b>Stage II</b> and the <b>Playoffs</b>. Its Tournament Intro Screen shows the 12 auto-qualifiers to Stage II,
                then the 8 teams of Stage I (the places 13-16 and the 4 teams from the Qualifier, which glow golden again) and how those 8 are dealt into Group A and Group B:
            </p>
            <BigShot n={15} alt="Tournament Intro Screen of PEM Big Tournament #1" />
            <p className={css.info_text}>
                Every Group of Stage I is the smallest Double Elimination bracket there is: two Opening Rounds, the Winners&apos; Match for the winners of the Opening Rounds, the Elimination Match for their losers
                and the Decider Match for the winner of the Elimination Match and the loser of the Winners&apos; Match. All of them are <b>Best of 3</b>.
                The winner of the Winners&apos; Match and the winner of the Decider Match go to Stage II, so a team needs two wins to get through and two losses to fly out:
            </p>
            <BigShot n={16} alt="Group A of Stage I before the first match" />
            <BigShot n={17} alt="Match modal of the first Opening Round of Stage I" width="35vw" />
            <p className={css.info_text}>
                In Group A, both teams from the Qualifier made it: Team Orange won both of its matches and Team Copper came back through the Decider Match.
                Team Red, the 13th team of the Leaderboard, lost both of its matches. In Group B, Team Gray won the Winners&apos; Match and Team Violet, the third qualifier, beat Team Cyan in the Decider Match.
                Only Team Blue, the fourth qualifier, lost both of its matches and flew out:
            </p>
            <BigShot n={18} alt="Finished Group A of Stage I" />
            <BigShot n={19} alt="Finished Group B of Stage I" />
            <p className={css.info_text}>
                Once the last match of the last Group is played, <b>Stage II</b> starts right away, without any extra screen. Its 16 teams (the 12 auto-qualifiers and the 4 teams from Stage I) are dealt into Group A and Group B,
                and from here on, everything is exactly like the Group Stage of the{" "}
                <InfoLink onClick={scrollToAnchor("pem-main-event", "pem-small")} href="?page=pem-small#pem-main-event">PEM Small Tournament</InfoLink>.
                With the navigation in the top left corner, I can look back at Stage I:
            </p>
            <BigShot n={20} alt="Group A of Stage II before the first match, with the Stage navigation" />
            <p className={css.info_text}>
                Team Seafoam, the champion of Official #1 and PEM Small Tournament #1, didn&apos;t lose a single set in Group A and beat Team Moss 3:0 in the Upper Final.
                In Group B, Team Orange went even further: it beat Team Salmon and Team Periwinkle and only lost the Upper Final 0:3 against Team Yellow.
                So a team, which started the whole PEM Big Tournament in the Qualifier, was in the Playoffs now:
            </p>
            <BigShot n={21} alt="Finished Group A of Stage II" />
            <BigShot n={22} alt="Finished Group B of Stage II" caption="(Team Emerald won the Lower Final 3:2 against Team Periwinkle)" />
            <p className={css.info_text}>
                The Playoffs are the same 6-team bracket as in the PEM Small Tournament, but bigger: the Quarterfinals are <b>Best of 5</b>, the Semifinals and the Third Place Decider are <b>Best of 7</b>{" "}
                and the Grand Final is <b>Best of 9</b>, exactly the same formats as in the Playoffs of Official.
            </p>
            <BigShot n={23} alt="Playoffs of PEM Big Tournament #1 before the Quarterfinals" />
            <p className={css.info_text}>
                Team Orange&apos;s run ended with a 1:3 against Team Rose in the Quarterfinals. Team Moss beat Team Emerald 3:0 and then Team Yellow 4:2 in a Semifinal with a 17-19 set in Overtime,
                while Team Seafoam beat Team Rose 4:1. And so, the Grand Final was Team Seafoam against Team Moss, a Best of 9:
            </p>
            <BigShot n={24} alt="Match modal of the Grand Final of PEM Big Tournament #1" width="35vw" />
            <BigShot n={25} alt="Series screen of the Bo9 Grand Final with the golden PEM trophy" width="30vw" caption="(The trophy icon in the series screen is the golden PEM trophy now)" />
            <p className={css.info_text}>
                Team Moss won the first set 13-9, but then Team Seafoam won five sets in a row: 5:1. Team Yellow beat Team Rose 4:1 in the Third Place Decider.
                Every Tier 1 tournament has its own trophy: the PEM Small Tournament has the silver one, the PEM Big Tournament has the <b>golden PEM trophy</b>:
            </p>
            <BigShot n={26} alt="Winners' screen of PEM Big Tournament #1 with the golden PEM trophy" width="28vw" />
            <p className={css.info_text}>
                And the Pick&apos;em challenge was the closest one I&apos;ve had so far: 125 out of 130 needed Pick&apos;em points.
            </p>
            <BigShot n={27} alt="Pick'em summary of PEM Big Tournament #1" width="30vw" />
            <BigShot n={28} alt="Finished Playoffs of PEM Big Tournament #1 with the end buttons" />
        </section>
        <section>
            <div id="big-rewards" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>The golden trophy and Hall of Fame</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                In the Leaderboard, the golden trophy gets its own icon, the same way the silver one does, and it&apos;s placed before it.
                Team Seafoam has all three trophies now: the golden PEM trophy, the silver PEM trophy and the Official trophy. Its Unbeaten Streak went up to 8 as well.
                The 2nd and 3rd places count into the 🥈 and 🥉 totals, same as with the PEM Small Tournament (see{" "}
                <InfoLink onClick={scrollToAnchor("pem-rewards", "pem-small")} href="?page=pem-small#pem-rewards">Trophies, medals and Hall of Fame</InfoLink>
                ):
            </p>
            <BigShot n={29} alt="Leaderboard after PEM Big Tournament #1" />
            <p className={css.info_text}>
                In the Hall of Fame, there are three new cards again: the PEM Big Tournament card with the golden trophy on top, the Elite Competition League card and the Qualifier card.
                I lost all three Pick&apos;em challenges this time, so the Pick&apos;em points score went down:
            </p>
            <BigShot n={30} alt="Hall of Fame with the cards of PEM Big Tournament #1" />
            <p className={css.info_text}>
                The Qualifier&apos;s summary is the same as the one of the PEM Small Tournament Qualifier. The Elite Competition League&apos;s summary has all teams,
                the whole bracket with all the results, the podium and the whole top from the 5th to the 16th place. The order of the places comes from the round, in which a team lost its second match:
                the losers of the Lower Semifinals are 5th and 6th, the losers of Lower Round 3 are 7th and 8th and so on:
            </p>
            <BigShot n={31} alt="Hall of Fame, Elite Competition League #1: all teams" />
            <BigShot n={32} alt="Hall of Fame, Elite Competition League #1: the bracket" />
            <BigShot n={33} alt="Hall of Fame, Elite Competition League #1: the podium" />
            <BigShot n={34} alt="Hall of Fame, Elite Competition League #1: the places 5-16" />
            <p className={css.info_text}>
                The PEM Big Tournament&apos;s summary starts with the Tournament start: the auto-qualifiers to Stage II, the teams of Stage I with the glowing qualifiers, the link to the Qualifier and the Groups of Stage I.
                Then comes the whole Stage I, all teams of Stage II, the whole Stage II, the Playoffs and the podium with the 5th and 6th places:
            </p>
            <BigShot n={35} alt="Hall of Fame, PEM Big Tournament #1: Tournament start" />
            <BigShot n={36} alt="Hall of Fame, PEM Big Tournament #1: Stage I" />
            <BigShot n={37} alt="Hall of Fame, PEM Big Tournament #1: all teams to Stage II" />
            <BigShot n={38} alt="Hall of Fame, PEM Big Tournament #1: Stage II" />
            <BigShot n={39} alt="Hall of Fame, PEM Big Tournament #1: the Playoffs" />
            <BigShot n={40} alt="Hall of Fame, PEM Big Tournament #1: the podium" />
            <p className={css.info_text}>
                Afterwards, there are three tournaments to choose from: <b>Official</b>, <b>PEM Small Tournament</b> and <b>PEM Big Tournament</b>. Which #2 is coming next? (Or I&apos;ll go it via "Random" again, who knows):
            </p>
            <div className={css.image_container}>
                <img src={hardChoiceToMakeTwo} alt="Hard choice to make: Official #2 or PEM Small Tournament #2 or PEM Big Tournament #2?" className={css.image} style={{ width: '35vw', height: '35vh' }} />
            </div>
        </section>
    </>
);

const GPL_IMAGES = import.meta.glob("../../../assets/images/gpl-*.png", { eager: true, import: "default" });
const gplImg = (n) => GPL_IMAGES[`../../../assets/images/gpl-${String(n).padStart(2, "0")}.png`];

const GplShot = ({ n, ...props }) => <PemShot src={gplImg(n)} {...props} />;

const GplSubPage = ({ scrollToAnchor }) => (
    <>
        <section>
            <div id="gpl-overview" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Around the globe</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                After two PEM Tournaments, there is a fourth option in the "Choose how you want to play" modal: the <b>Global Pro League</b> (GPL), another Tier 1 tournament.
                But this time, there is no Qualifier at all. Instead, there are only two tournaments, played one after another: <br />
                • <b>Global Challenger Cup</b> (GCC), a Tier 2 tournament, comes first <br />
                • <b>Global Pro League</b> itself (Tier 1) comes right after it
            </p>
            <GplShot n={1} alt="Choose how you want to play modal with the Global Pro League picked" />
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                As always, the teams are seeded by the Leaderboard at the moment the Global Pro League starts: <br />
                • Top 1-8 → Autoqualify to <b>Stage II</b> of the Global Pro League <br />
                • Top 9-24 → Start in <b>Stage I</b> of the Global Pro League <br />
                • Top 25-40 → Play in the <b>Global Challenger Cup</b> <br />
                • Top 41-64 → <i>— Wait, and what about them?</i> They don&apos;t play at all. Not every tournament needs every team, right?
            </p>
            <p className={css.info_text}>
                That&apos;s why the "Stage dividers" select of the Leaderboard has its own "Global Pro League" option now. When you pick it, you see where every team starts
                and, at the end, the edge between the Global Challenger Cup and the teams, which are NOT playing. This divider is half red, on the side of the not playing teams:
            </p>
            <GplShot n={2} alt="Leaderboard with the Global Pro League dividers between Stage I and the Global Challenger Cup" />
            <GplShot n={3} alt="Leaderboard with the red divider before the teams, which are not playing" />
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                Both tournaments have their own numbers (Global Challenger Cup #1 and Global Pro League #1) and "Proceed" leads from the first one into the second one, same as in the PEM Tournaments.
                How a match is played itself, you can see in{" "}
                <InfoLink onClick={scrollToAnchor("start-match", "official")} href="?page=official#start-match">How to start a match?</InfoLink>{" "}
                of the Official tab. I chose the Global Pro League explicitly and clicked "Start Game", right after{" "}
                <InfoLink onClick={scrollToAnchor("big-rewards", "pem-big")} href="?page=pem-big#big-rewards">PEM Big Tournament #1</InfoLink>.
            </p>
        </section>
        <section>
            <div id="gcc" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Global Challenger Cup</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                The Global Challenger Cup has a format, which doesn&apos;t exist anywhere else in this simulator: a <b>League Phase</b>. Its 16 teams are dealt into <b>4 Pots</b> of 4 teams,
                Pot 1 with the best 4 of them and Pot 4 with the worst 4, and that&apos;s what the Tournament Intro Screen shows:
            </p>
            <GplShot n={4} alt="Tournament Intro Screen of Global Challenger Cup #1 with all teams and the 4 Pots" />
            <p className={css.info_text}>
                Every team plays <b>4 matches</b>, one on each of the 4 Matchdays, and on the first three Matchdays it meets a team of another Pot. On Matchday 4, it&apos;s the other way around: there, the teams of the same Pot play against each other.
                <i> — So, it&apos;s like a Group Stage?</i> Not really. There are no Groups: all 16 teams share one big <b>League Table</b>, even though no team plays against everybody.
                And the whole draw is known from the very beginning, so you can already see on the first Matchday, who will play whom on the last one. All League Phase matches are <b>Best of 3</b>:
            </p>
            <GplShot n={5} alt="League Phase of Global Challenger Cup #1 before the first match" />
            <p className={css.info_text}>
                The table is sorted by wins first. If two teams have the same amount of wins, the Sets Difference decides, then the Rounds Difference, then the wins of all the opponents a team had
                (the same idea as the Buchholz score in{" "}
                <InfoLink onClick={scrollToAnchor("distribution-explained", "official")} href="?page=official#distribution-explained">Distribution system in Swiss Stages</InfoLink>
                ), then the match between both teams and only at the very end, the seed. The colors of the rows show where every team is at the moment:
                green rows go straight to the Quarterfinals, yellow ones to the Knockout Play-offs and the rest flies out. <br />
                Since the Pots matter here, the match modal of a Global Challenger Cup match shows the Pot of each team near its circle:
            </p>
            <GplShot n={6} alt="Match modal of the first League Phase match with the Pots of both teams" width="35vw" />
            <p className={css.info_text}>
                And the Pots didn&apos;t mean much in my Global Challenger Cup #1. Team Amber, the 36th team of the Leaderboard from Pot 3, won all four of its matches and finished first.
                Team Indigo from Pot 2 did the same and had the same Sets Difference, so only the Rounds Difference put it second. And on the other side, Team Blue, the best seeded team of the whole Cup, lost all four of its matches.
                Team Azure, the champion of{" "}
                <InfoLink onClick={scrollToAnchor("pem-cst", "pem-small")} href="?page=pem-small#pem-cst">Champions Series Tour #1</InfoLink>, finished last with 0 wins:
            </p>
            <GplShot n={7} alt="Finished League Phase of Global Challenger Cup #1" />
            <p className={css.info_text}>
                After the last match of Matchday 4, the <b>Knockout Stage</b> starts right away. Places 1-4 of the table wait in the Quarterfinals, places 5-12 play the <b>Knockout Play-offs</b> for the other 4 places
                (5th vs 12th, 6th vs 11th, 7th vs 10th and 8th vs 9th) and places 13-16 are out. The winner of each Play-off meets one of the top 4, so the 1st place plays against the winner of 8th vs 9th.
                Then come the Semifinals, the Third Place Decider and the Grand Final. Everything is <b>Best of 3</b> again, only the Grand Final is <b>Best of 5</b>.
                With the navigation in the top left corner, you can always go back to the League Phase:
            </p>
            <GplShot n={8} alt="Knockout Stage of Global Challenger Cup #1 before the first Knockout Play-off" />
            <p className={css.info_text}>
                Team Red, the 12th one, beat the 5th one, Team Lilac, 2:0 with an overtime set (16-13) and lost its Quarterfinal only in the Decider against Team Sapphire.
                Team Amber won its Quarterfinal, the first set 19-17 in overtime, but in the Semifinal, Team Sapphire beat it 2:0. Team Indigo got through Team Plum and Team Steel.
                And so, the Grand Final was Team Indigo against Team Sapphire: it went to the fifth set and Team Indigo won it 13-4. Team Amber still took the Third Place 2:1 against Team Steel.
                Same as all the other Tier 2 tournaments, the Winners&apos; screen has neither quotes nor a trophy:
            </p>
            <GplShot n={9} alt="Winners' screen of Global Challenger Cup #1" width="28vw" />
            <p className={css.info_text}>
                The Pick&apos;em summary counts the League Phase matches together and then every round of the Knockout Stage. The Third Place Decider and the Grand Final are only mentioned, if I guessed them.
                And this time, I won the Pick&apos;em challenge: 98 out of 88 needed Pick&apos;em points.
            </p>
            <GplShot n={10} alt="Pick'em summary of Global Challenger Cup #1" width="30vw" />
        </section>
        <section>
            <div id="gpl" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Global Pro League</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                After "Proceed", the <b>Global Pro League #1</b> starts with its Tournament Intro Screen: the 8 auto-qualifiers to Stage II and the 16 teams, which start in Stage I:
            </p>
            <GplShot n={11} alt="Tournament Intro Screen of Global Pro League #1" />
            <p className={css.info_text}>
                If you have played Official already, then you know these Stages: they are <b>Swiss Stages</b> (see{" "}
                <InfoLink onClick={scrollToAnchor("swiss-stage", "official")} href="?page=official#swiss-stage">What is this Swiss Stage even about!?</InfoLink>
                ). <b>BUT</b>, they are half as big: only 16 teams in each Stage, 3 wins to go through, 3 losses to fly out, and only 8 teams go through.
                That&apos;s why every net has half as many matches (8 matches in the 0:0 net, 2 matches in the 2:0 net and so on) and the boxes in the corners have only 2 or 3 places.
                And there is no Best of 1 here at all: in Stage I, every single match is <b>Best of 3</b>:
            </p>
            <GplShot n={12} alt="Stage I of Global Pro League #1 before the first match" />
            <GplShot n={13} alt="Match modal of the first Stage I match" width="35vw" />
            <p className={css.info_text}>
                Team Violet and Team Copper, both of them came through the{" "}
                <InfoLink onClick={scrollToAnchor("big-qualifier", "pem-big")} href="?page=pem-big#big-qualifier">PEM Big Tournament Qualifier</InfoLink>{" "}
                before, won Stage I with 3:0. The comeback of this Stage was Team Frost&apos;s, the 22nd team: it lost its first two matches and then won three in a row to 3:2.
                The highest seeded team in Stage I, Team Sunflower, went through with 3:1:
            </p>
            <GplShot n={14} alt="Finished Stage I of Global Pro League #1" />
            <p className={css.info_text}>
                Then <b>Stage II</b> starts right away with the 8 auto-qualifiers and the 8 teams from Stage I. Here, it&apos;s the same as in Stage III of Official:
                the 0:0, 1:0, 0:1 and 1:1 matches are <b>Best of 3</b>, all Progression and Elimination matches (2:0, 2:1, 1:2, 0:2 and 2:2) are <b>Best of 5</b>.
                In the top left corner, the navigation lets you look back at Stage I:
            </p>
            <GplShot n={15} alt="Stage II of Global Pro League #1 before the first match, with the navigation" />
            <p className={css.info_text}>
                Team Seafoam and Team Yellow went through with 3:0. Seven auto-qualifiers made it to the Playoffs and only Team Emerald didn&apos;t: it lost its Deciding Match 0:3 against Team Orange.
                And the eighth team was Team Copper again: it lost its first two matches, then won three Best of 5s in a row (3:1 against Team Frost, 3:0 against Team Green and 3:2 against Team Sunflower)
                and was the only team from Stage I, which reached the Playoffs:
            </p>
            <GplShot n={16} alt="Finished Stage II of Global Pro League #1" />
            <p className={css.info_text}>
                The Playoffs are the standard 8-team ones: Quarterfinals, Semifinals, Third Place Decider and Grand Final. The teams are seeded by their records in Stage II,
                so the 3:0 teams are on top and the best two of them could only meet in the Grand Final. The formats are the same as in the Official (but without Round of 16 :0):
                the Quarterfinals are <b>Best of 5</b>, the Semifinals and the Third Place Decider are <b>Best of 7</b> and the Grand Final is <b>Best of 9</b>:
            </p>
            <GplShot n={17} alt="Playoffs of Global Pro League #1 before the Quarterfinals" />
            <p className={css.info_text}>
                And Team Copper just went on: it beat Team Yellow, one of the two 3:0 teams, 3:0 in the Quarterfinals and then Team Moss 4:2 in the Semifinals, with a 16-14 set in overtime.
                On the other side, Team Seafoam didn&apos;t lose a single set: 3:0 against Team Orange and 4:0 against Team Rose.
                So, the Grand Final was Team Copper, which started the PEM Big Tournament in its Qualifier, against Team Seafoam. The prediction gave Team Copper <b>0.4%</b>:
            </p>
            <GplShot n={18} alt="Match modal of the Grand Final of Global Pro League #1" width="35vw" />
            <GplShot n={19} alt="Series screen of the Bo9 Grand Final with the Global Pro League trophy" width="30vw" caption="(The trophy icon in the series screen is the Global Pro League trophy now)" />
            <p className={css.info_text}>
                Team Copper even won two sets in a row (13-11 and 13-9), but Team Seafoam won the Grand Final 5:2. Team Moss won the Third Place 4:1 against Team Rose.
                The Global Pro League has its own trophy: a black one with a <b>golden globe</b> on top, which Team Seafoam holds on the Winners&apos; screen the same way as all the other trophies:
            </p>
            <GplShot n={20} alt="Winners' screen of Global Pro League #1 with the Global Pro League trophy" width="28vw" />
            <p className={css.info_text}>
                The Pick&apos;em summary looks like the one of Official, only with 33 matches per Stage instead of 66. And again, it was super close: 228 out of 233 needed Pick&apos;em points:
            </p>
            <GplShot n={21} alt="Pick'em summary of Global Pro League #1" width="30vw" />
            <GplShot n={22} alt="Finished Playoffs of Global Pro League #1 with the end buttons" />
        </section>
        <section>
            <div id="gpl-rewards" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>The globe trophy and Hall of Fame</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                In the Leaderboard, the Global Pro League trophy gets its own icon and it is placed before all the other trophies. It is worth the same as the golden PEM trophy, so when you sort by "Trophies and first places",
                both of them count as much. Team Seafoam has four different trophies now and its Unbeaten Streak went up to 14. Team Indigo got a 🥇 for the Global Challenger Cup and,
                same as with every other Tier 1 or Tier 2 tournament, the 2nd and 3rd places count into the 🥈 and 🥉 totals:
            </p>
            <GplShot n={23} alt="Leaderboard after Global Pro League #1" />
            <p className={css.info_text}>
                In the Hall of Fame, there are two new cards: the Global Pro League card with its trophy above the name and the top four, and the Global Challenger Cup card, the same as the other Tier 2 cards:
            </p>
            <GplShot n={24} alt="Hall of Fame with the cards of Global Pro League #1 and Global Challenger Cup #1" />
            <p className={css.info_text}>
                The Global Challenger Cup&apos;s summary starts with all teams and the 4 Pots. Then come the whole League Phase with its final table, the whole Knockout Stage and the podium.
                At the end, there are the places 5-12: the losers of the Quarterfinals are 5th to 8th and the losers of the Knockout Play-offs are 9th to 12th, each of them in the order of the matches,
                so the loser of Quarterfinal #1 is 5th:
            </p>
            <GplShot n={25} alt="Hall of Fame, Global Challenger Cup #1: all teams and the Pots" />
            <GplShot n={26} alt="Hall of Fame, Global Challenger Cup #1: the League Phase" />
            <GplShot n={27} alt="Hall of Fame, Global Challenger Cup #1: the Knockout Stage" />
            <GplShot n={28} alt="Hall of Fame, Global Challenger Cup #1: the podium" />
            <GplShot n={29} alt="Hall of Fame, Global Challenger Cup #1: the places 5-12" />
            <p className={css.info_text}>
                The Global Pro League&apos;s summary starts with all teams and how they were dealt into the Stages. Then comes the whole Stage I with every match, all teams to Stage II, the whole Stage II,
                all teams to the Playoffs and the Playoffs themselves, the podium with the trophy and the 5th-8th places:
            </p>
            <GplShot n={30} alt="Hall of Fame, Global Pro League #1: all teams and their Stages" />
            <GplShot n={31} alt="Hall of Fame, Global Pro League #1: Stage I" />
            <GplShot n={32} alt="Hall of Fame, Global Pro League #1: all teams to Stage II" />
            <GplShot n={34} alt="Hall of Fame, Global Pro League #1: all teams to the Playoffs and the Playoffs" />
            <GplShot n={35} alt="Hall of Fame, Global Pro League #1: the podium with the Global Pro League trophy" />
            <GplShot n={36} alt="Hall of Fame, Global Pro League #1: the places 5-8" />
            <p className={css.info_text}>
                And now, there are four tournaments to choose from: <b>Official</b>, <b>PEM Small Tournament</b>, <b>PEM Big Tournament</b> and <b>Global Pro League</b>. Every single one of them has had its #1 already, so which #2 comes first?
            </p>
        </section>
    </>
);

const INFO_SUB_PAGES = [
    {
        id: "official",
        label: <>General Mechanics /<br />Official</>,
        sections: OFFICIAL_SECTIONS,
        Content: OfficialSubPage,
    },
    {
        id: "pem-small",
        label: <>PEM Small Tournament Qualifier /<br />Champions Series Tour /<br />PEM Small Tournament</>,
        sections: PEM_SMALL_SECTIONS,
        Content: PemSmallSubPage,
    },
    {
        id: "pem-big",
        label: <>PEM Big Tournament Qualifier /<br />Elite Competition League /<br />PEM Big Tournament</>,
        sections: PEM_BIG_SECTIONS,
        Content: PemBigSubPage,
    },
    {
        id: "gpl",
        label: <>Global Challenger Cup /<br />Global Pro League</>,
        sections: GPL_SECTIONS,
        Content: GplSubPage,
    },
];

const SUB_PAGE_SEARCH_PARAM = "page";

const SCROLL_EASING = (t) =>
    t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

const SpecialModeInfoPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeSubPage =
        INFO_SUB_PAGES.find((page) => page.id === searchParams.get(SUB_PAGE_SEARCH_PARAM)) ?? INFO_SUB_PAGES[0];
    const sections = activeSubPage.sections;
    const SubPageContent = activeSubPage.Content;

    const [activeSection, setActiveSection] = useState(sections[0].id);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const navRef = useRef(null);
    const lenisRef = useRef(null);
    const headerRef = useRef(null);
    const tabsRef = useRef(null);
    const hasMeasuredTabsRef = useRef(false);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0, animate: false });

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.8,
            smoothWheel: true,
        });

        lenisRef.current = lenis;

        let rafId;

        const raf = (time) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    useLayoutEffect(() => {
        const header = headerRef.current;
        if (!header) return undefined;

        const measure = () => setHeaderHeight(header.offsetHeight);
        measure();

        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
        observer?.observe(header);
        return () => observer?.disconnect();
    }, []);

    useLayoutEffect(() => {
        const measure = (animate) => {
            const active = tabsRef.current?.querySelector("[data-sub-page-active='true']");
            if (!active) return;
            setTabIndicator({ left: active.offsetLeft, width: active.offsetWidth, animate });
        };

        measure(hasMeasuredTabsRef.current);
        hasMeasuredTabsRef.current = true;

        const handleResize = () => measure(false);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [activeSubPage.id]);

    const pendingAnchorRef = useRef(null);

    useEffect(() => {
        lenisRef.current?.scrollTo(0, { immediate: true });
        setIsAutoScrolling(false);
        setActiveSection(activeSubPage.sections[0].id);

        const anchor = pendingAnchorRef.current;
        if (!anchor) return undefined;
        pendingAnchorRef.current = null;

        const t = setTimeout(() => {
            const el = document.getElementById(anchor);
            lenisRef.current?.resize();
            if (el) lenisRef.current?.scrollTo(el, {
                offset: -(headerRef.current?.offsetHeight ?? 0) - 16,
                duration: 1.8,
                easing: SCROLL_EASING,
                lock: true,
            });
        }, 150);
        return () => clearTimeout(t);
    }, [activeSubPage]);

    const selectSubPage = (id) => {
        if (id === activeSubPage.id) return;
        setSearchParams({ [SUB_PAGE_SEARCH_PARAM]: id }, { replace: true });
    };

    const [indicator, setIndicator] = useState({
        top: 0,
        height: 0,
    });

    const updateResultsIndicator = useCallback(() => {
        if (!navRef.current) return;

        const active =
            navRef.current.querySelector(
                "[data-results-active='true']"
            );

        if (!active) return;

        const rect =
            active.getBoundingClientRect();

        const parent =
            navRef.current.getBoundingClientRect();

        setIndicator({
            top: rect.top - parent.top,
            height: rect.height,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSection, activeSubPage]);

    useEffect(() => {
        requestAnimationFrame(
            updateResultsIndicator
        );
    }, [activeSection, updateResultsIndicator,]);

    useEffect(() => {
        updateResultsIndicator();

        const handleResize = () => updateResultsIndicator();

        window.addEventListener("resize", handleResize);

        return () =>
            window.removeEventListener("resize", handleResize);
    }, [updateResultsIndicator]);

    useEffect(() => {
        const handleScroll = () => {
            if (isAutoScrolling) return;
            const triggerLine = window.innerHeight * 0.5;

            let current = sections[0].id;

            for (const section of sections) {
                const el = document.getElementById(section.id);

                if (!el) continue;

                const rect = el.getBoundingClientRect();

                if (rect.top <= triggerLine) {
                    current = section.id;
                } else {
                    break;
                }
            }

            setActiveSection(current);
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [isAutoScrolling, sections]);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);

        if (!el) return;

        setActiveSection(id);
        setIsAutoScrolling(true);

        const y =
            el.getBoundingClientRect().top +
            window.scrollY -
            window.innerHeight / 2 +
            el.offsetHeight / 2;

        lenisRef.current?.scrollTo(y, {
            duration: 1.8,
            easing: SCROLL_EASING,
            lock: true,
            onComplete: () => {
                setIsAutoScrolling(false);
            },
        });
    };

    const scrollToAnchor = (id, subPageId = activeSubPage.id) => (e) => {
        e.preventDefault();

        if (subPageId !== activeSubPage.id) {
            pendingAnchorRef.current = id;
            selectSubPage(subPageId);
            return;
        }

        const el = document.getElementById(id);
        if (el) lenisRef.current?.scrollTo(el, {
            offset: -(headerHeight + 16),
            duration: 1.8,
            easing: SCROLL_EASING,
            lock: true,
            onComplete: () => {
                setIsAutoScrolling(false);
            },
        });
    };

    const renderSubPageNavigation = () => (
        <div ref={headerRef} className={css.second_header}>
            <nav ref={tabsRef} className={css.sub_page_navigation}>
                {INFO_SUB_PAGES.map((page) => {
                    const isActive = page.id === activeSubPage.id;
                    return (
                        <button
                            key={page.id}
                            type="button"
                            data-sub-page-active={isActive}
                            onClick={() => selectSubPage(page.id)}
                            className={`${css.sub_page_button} ${isActive ? css.sub_page_button_active : ""}`}
                        >
                            {page.label}
                        </button>
                    );
                })}
                <motion.div
                    className={css.sub_page_indicator}
                    initial={false}
                    animate={{ left: tabIndicator.left, width: tabIndicator.width }}
                    transition={tabIndicator.animate ? { type: "tween", duration: 0.3, ease: "easeInOut" } : { duration: 0 }}
                />
            </nav>
        </div>
    );

    const renderInfoNavigation = () => {
        return (
            <div
                ref={navRef}
                className={css.infoNavigation}
                style={{ top: headerHeight + 16 }}
            >
                {sections.map((section) => (
                    <button
                        key={section.id}
                        data-results-active={
                            activeSection === section.id
                        }
                        onClick={() =>
                            scrollToSection(section.id)
                        }
                        className={`${css.resultsNavigationButton}
                    ${activeSection === section.id
                                ? css.resultsNavigationButtonActive
                                : ""
                            }`}
                    >
                        {section.label}
                    </button>
                ))}

                <motion.div
                    className={
                        css.resultsNavigationIndicator
                    }
                    initial={false}
                    animate={{
                        top: indicator.top,
                        height: indicator.height,
                    }}
                />
            </div>
        );
    };

    return (
        <>
            {renderSubPageNavigation()}
            <div aria-hidden="true" style={{ height: headerHeight }} />
            {renderInfoNavigation()}
            <div className={css.page_container}>
                <h2 style={{ marginBottom: '12px' }} className={css.title}>Welcome to Info Page of Special Mode!</h2>
                <p style={{ fontWeight: '700' }} className={css.info_text}>Here is a full guide, how to correctly play Special Mode.</p>
                <p style={{ marginTop: '12px', fontWeight: '700', textAlign: 'center' }} className={css.info_text}>P. s. If you clicked the "?" button unintentionally, then here's the back button:</p>
                <Link
                    style={{ marginTop: '12px' }}
                    className={css.back_button}
                    to="/special-mode"
                >
                    Back?
                </Link>
                <SubPageContent key={activeSubPage.id} scrollToAnchor={scrollToAnchor} />
                <div style={{ marginTop: '24px' }} className={css.divider} />
                <p style={{ fontWeight: '700' }} className={css.info_text}>Hope, it helps those who don't understand how to play without any explanations. 😜</p>
                <Link
                    style={{ marginTop: '12px' }}
                    className={css.back_button}
                    to="/special-mode"
                >
                    Back?
                </Link>
            </div>
        </>
    );
};

export default SpecialModeInfoPage;