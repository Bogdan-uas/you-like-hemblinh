import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import css from './SpecialModeInfoPage.module.css'
import { Link, useSearchParams } from "react-router-dom";
import introImg from "../../../assets/images/image.png";
import scoreBoardImg from "../../../assets/images/image-2.png";
import dashedDividerImg from "../../../assets/images/image-3.png";
import dashedDividerTwoImg from "../../../assets/images/image-4.png";
import dashedDividerThreeImg from "../../../assets/images/image-4.01.png";
import hoveredTeamRedsStatsTabOne from "../../../assets/images/image-4.1.png";
import hoveredTeamRedsStatsTabTwo from "../../../assets/images/image-4.2.png";
import emptyHallOfFame from "../../../assets/images/image-4.3.png";
import openedTournamentSelectionModal from "../../../assets/images/image-4.4.png";
import openedTournamentSelectionModalHoveredOn from "../../../assets/images/image-4.5.png";
import settingsPanelImg from "../../../assets/images/image-4.6.png";
import tournamentIntroScreenImg from "../../../assets/images/image-5.png";
import tournamentIntroScreenHoverImg from "../../../assets/images/image-5.5.png";
import simulateModalImg from "../../../assets/images/image-8.6.png";
import simulateRunningImg from "../../../assets/images/image-11.6.png";
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
import miniRoundStrips from "../../../assets/images/image-14.31.png";
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
import hallOfFameOfficialOnePartSeven from "../../../assets/images/image-24.8.png";
import hallOfFameOfficialOnePartEight from "../../../assets/images/image-24.9.png";
import tournamentIntroScreenImgTwo from "../../../assets/images/image-25.png";
import hardChoiceToMake from "../../../assets/images/image-26.png";
import hardChoiceToMakeTwo from "../../../assets/images/image-27.png";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Lenis from "lenis";
import { FaFire } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

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
        id: "official-skylines",
        label: "Official Skylines",
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
        id: "gcc-open-qualifier",
        label: "Global Challenger Cup Open Qualifier",
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

const PBS_SECTIONS = [
    {
        id: "pbs-overview",
        label: "Hunting for bounties",
    },
    {
        id: "pbs-open-qualifier",
        label: "Premier Bounty Series Open Qualifier",
    },
    {
        id: "pbs-draft",
        label: "Premier Bounty Series",
    },
    {
        id: "pbs-rewards",
        label: "The emerald trophy and Hall of Fame",
    },
];

const PGX_SECTIONS = [
    {
        id: "pgx-overview",
        label: "A city of its own",
    },
    {
        id: "pgx-cm",
        label: "PGX Candidate Masters",
    },
    {
        id: "pgx-im",
        label: "PGX International Masters",
    },
    {
        id: "pgx-gm",
        label: "PGX Grandmasters",
    },
    {
        id: "pgx-rewards",
        label: "The PGX trophy and Hall of Fame",
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
    { from: 1, to: 8, points: 1150, label: "Start in Stage III", color: "#2e7d32" },
    { from: 9, to: 16, points: 1150, label: "Start in Stage II", color: "#f9a825" },
    { from: 17, to: 32, points: 1100, label: "Start in Stage I", color: "#c62828" },
    { from: 33, to: 64, points: 1050, label: "Play in Official Skylines", color: "#8a8d99" },
];

const STAGE_WEIGHTS = [
    ["Stage I", 1.0],
    ["Stage II", 1.25],
    ["Stage III", 1.5],
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
    { match: "Two equal teams (1,100 vs 1,100)", where: "Stage I, BO1", win: 10, loss: 5 },
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

const SKYLINES_IMAGES = import.meta.glob("../../../assets/images/skylines-*.png", { eager: true, import: "default" });

const SkyShot = ({ n, alt, width = "34vw" }) => (
    <div className={css.image_container}>
        <img src={SKYLINES_IMAGES[`../../../assets/images/skylines-${String(n).padStart(2, "0")}.png`]} alt={alt} className={css.image} style={{ width, height: "auto" }} />
    </div>
);

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
                There are 64 teams in this simulator, each being a specific color, and the top 32 of them play in an Official, while the other 32 play the <b>Official Skylines</b> right next to it.
                Throughout the tournament, they will have opportunities to play against other teams and gain placement points to become higher in the <b>Leaderboard</b>.
            </p>
            <p className={css.info_text}>
                When firstly clicking on the "Special" button and going onto this page, you will see the Intro Page (depicted below this text). <br />
                Above, you see already a familiar <b>header</b> with two buttons: "Restart the game?" and "Terminate the game?".
                First restarts the tournament and redirects you to this page again & second redirects you to Home Page but doesn't restart the tournament.
                Near those two, you will see an orange button, named as "Leaderboard" and below those, you will see the button, called as "Hall of Fame". We will come to those in a minute, ok? <br />
                And in the top-right corner of the header, there is a small round button with a gear on it, which opens the <b>Settings</b>. It stays there on every screen of the Special Mode, but more on it a little bit later too. <br />
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
            <p className={css.info_text}>
                And even further below, after the 32nd place, there is one more divider, but this one is dark:
            </p>
            <div className={css.image_container}>
                <img src={dashedDividerThreeImg} alt="Divider, which shows the edge between qualifiers for Stage I and the teams, which don't play" className={css.image} style={{ width: '40vw', height: '73vh' }} />
            </div>
            <p style={{ marginBottom: '24px' }} className={css.info_text}>
                As you can read it, these should be dividers to show which Stages of Official, which teams autoqualify to, and the dark one shows the teams, which don&apos;t play in the Official itself, but in its side event, the Official Skylines.
                The upper pill (with ▲) is the group above the divider and the lower one (with ▼) is the group below it, and both of them show which places they cover. <br /> <i>— But wait, what are "Stages" meant here?</i> <br />
                There are three stages throughout the whole Official, which are being played in Swiss Format: <b>Stage I</b>, <b>Stage II</b> and <b>Stage III</b>. <br />
                After Stage III, there will stay only 8 teams remaining, which will play in Playoffs (or another name for it, Knockout Stage), starting from the Quarterfinals.
            </p>
            <p className={css.info_text}>
                Qualification rules:
                <br />• Top 8 → Autoqualify to <b>Stage III</b>
                <br />• Top 9–16 → Autoqualify to <b>Stage II</b>
                <br />• Top 17–32 → Start in <b>Stage I</b>
                <br />• Top 33–64 → Play in the <b>Official Skylines</b> (see{" "}
                <a
                    style={{ color: 'Highlight', fontStyle: 'italic' }}
                    onClick={scrollToAnchor("official-skylines")}
                    href='#official-skylines'
                >
                    Official Skylines
                </a>
                )
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
                Before we start anything, let&apos;s also click on that gear in the top-right corner. It smoothly opens the <b>Settings</b> on top of the screen you are on, so you can change them at any moment, even in the middle of a series:
            </p>
            <div className={css.image_container}>
                <img src={settingsPanelImg} alt="Settings with all of its options" className={css.image} style={{ width: '24vw', height: 'auto' }} />
            </div>
            <p className={css.info_text}>
                These are the options, which make playing the Special Mode more comfortable:
                <br />• <b>Gambling Key</b>: choose a key (Space, Enter, G, F, J, an arrow or any other key with "Custom key...") and pressing it will click the "Gamble" button during a series for you, with the same press effect as the mouse click
                <br />• <b>The key also presses Proceed and Continue</b>: the same key will also move you through the Tournament Intro Screens, the results and the Winners&apos; Screens
                <br />• <b>Hold to keep gambling</b>: while you hold the key, it keeps gambling every time the "Gamble" button is ready again
                <br />• <b>Show the key on the Gamble button</b>: puts a small badge with your key on the "Gamble" button, so you don&apos;t forget it
                <br />• <b>Show the Simulate button</b>: the "Simulate" tab below the match window and below the "Gamble" button, which can play a match by itself (more on it in{" "}
                <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={scrollToAnchor("during-match")} href='#during-match'>What do I do during the match?</a>)
                <br />• <b>Instant simulate</b>: "Don&apos;t allow" plays the simulated rounds one by one, "Per set" and "Whole series" skip the playback and decide the set or the whole series at once
                <br />• <b>Keep it open in the match window</b> and <b>Show it on the series screen</b>: whether the Simulate tab is already opened in every match window and whether it is there on the series screen at all
                <br />• <b>What it simulates</b> and <b>Speed</b>: one set at a time or the whole series, at 1x, 2x, 4x or 8x
                <br />• <b>Slow down on important moments</b>: plays the rounds slower, when a team is one round away from taking the set
                <br />• <b>Faster Extended Rounds</b>: halves the pauses between the comparisons in the Extended Rounds
                <br />• <b>Close windows with Esc</b>: Esc closes the match window, the Detailed Match Breakdown and the "Restart" / "Terminate" pop-ups
                <br />• <b>Commentary notifications</b>: turn them off to hide the play-by-play notifications, like "Second Half begins" (the warnings will still be shown)
                <br />• <b>Smooth scrolling</b>: turn it off, if you prefer the instant, normal mouse wheel scrolling
                <br />• <b>Skip the podium reveal</b>: the Winners&apos; Screen shows the whole Top 4 at once instead of revealing them one by one
                <br />• <b>Winners&apos; Screen effects</b>: the rays, sparkles and confetti around the podium
            </p>
            <p className={css.info_text}>
                The greyed out options only become available once you choose a Gambling Key (or turn off "Skip the podium reveal" for the effects, or allow the playback of the simulated rounds for "What it simulates", "Speed" and "Slow down on important moments"). All the settings are saved, so they stay the same after reloading the page, and the "Reset settings" button brings them back to their defaults (with a chance to undo it, of course).
                Gambling Key is "Off" by default, so nothing changes until you pick one.
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
                But "Random" never draws the same tournament twice in a row: once a tournament ends, it is excluded from the next roll (Official even from the next two). The "Random" option always shows, which tournaments are excluded at the moment and for how many more tournaments. Since nothing has been played yet, there are no exclusions here. <br />
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
                This is the Swiss Stage, I have told you about. This here is <br /> Stage I (Stage 1) with the lowest ranked teams, which play (top 17–32).
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
                We have 16 teams in one "pool". We have to put them all into 1v1 match-ups but in what order? Previously, it was pure shuffling and the match-ups were always randomly generated. <br />
                But now, it depends on the placements. All the 16 teams in the pool are being sorted by their placements in descending order. Then, highest ranked team in the pool is being put with the lowest ranked team in the pool. Second match-up is then second highest ranked team vs second lowest ranked team and so on... The match-ups are being shuffled then, so their order is random.
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
                    <TeamCircle team={COLORS.lavender} shouldPlaceholderCirclesBeRendered={false} />
                </div>

                <div className={css.vs_cell_ro32} style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, top: "8px", left: "39px", backgroundColor: "transparent" }} className={css.vs_text}>
                        VS
                    </span>
                </div>

                <div className={css.team_cell_ro32}>
                    <TeamCircle team={COLORS.salmon} shouldPlaceholderCirclesBeRendered={false} />
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
                    <TeamCircle team={COLORS.coral} shouldPlaceholderCirclesBeRendered={false} />
                </div>

                <div className={css.vs_cell_ro32} style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, top: "8px", left: "39px", backgroundColor: "transparent" }} className={css.vs_text}>
                        VS
                    </span>
                </div>

                <div className={css.team_cell_ro32}>
                    <TeamCircle team={COLORS.khaki} shouldPlaceholderCirclesBeRendered={false} />
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
                At the top, there is a small stage name, name of the match with its order number and the "BEST OF" badge of this match, in this case it's a BO1. Every "Best of" has its own color: grey for a Bo1, indigo for a Bo3, blue for a Bo5, purple for a Bo7 and gold for a Bo9. <br />
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
                You will be able to click it, once you choose one of the teams. And right below the modal, there is a small "SIMULATE" tab, which I will explain in the next section: <br />
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
                At the very top, there is the upper label: on the left, the name of the tournament with its number and, below it in small grey letters, the stage (here it&apos;s "STAGE I"); in the middle, the trophy, which all teams are fighting for, in a round medallion (tournaments without a trophy of their own show "🥇" there instead); and on the right, the match name with its order number. <br />
                Lower from it, there is the same "BEST OF" badge of the match as in the match modal. In non-Bo1 matches, there is also a "SET" badge below it, which shows the set that is being played right now (the last possible set of a series is the "DECIDER" and it gets its own red badge), and below them, there is the set history. It shows every possible set of the series right from the start (S1, S2, ... and the orange "DEC" for the Decider). The set, which is being played right now, is dark with a pulsing red dot and a glowing ring. Once a set ends, its chip smoothly extends with the color of the set winner on its left edge and the set score, where the winner&apos;s rounds are green and the loser&apos;s are red ("ER" or "P" next to it show the result of Extended Rounds or Penalties). Sets, which are not 100% to happen yet, are faded. <br />
                In the center, there is the scoreboard. In the middle, there is a leading indicator, which is a grey diamond while the score is tied. As soon as a team leads, it turns into chevrons in the color of that team, pointing at it: one chevron for a lead of 1-2 rounds, two for 3-5 and three pulsing ones for 6 rounds or more. Right under it, the "ROUND" badge counts the rounds of the set (it doesn&apos;t move on when a set has just ended or before the next Overtime has really started). On the left and on the right, there are these big numbers, which tell who how much rounds has a team already taken (every new round slides in from below), and below them, there are set lines, which stand for sets and they light themselves, when a set is taken. Near those big round counts, there are team names and squares standing for won and yet not won mini-rounds. On the left side, there's always your picked team. <br />
                Below the scoreboard, there is the Overtime badge, like "OVERTIME | First to 16". It smoothly shows up, once it's Overtime: the left part tells which Overtime it is and the "Double" or "Triple" in it mean that Overtime was pushed to multiple ones, like "Triple Overtime" means word-to-word: "Third Overtime" (every Overtime has its own color: orange for the first one, then a darker orange, red and pink for the Quadruple Overtime), and the right part tells how many rounds a team needs to win the set. <br />
                Below it, after every roll, both multipliers show up: the higher one is green, the lower one is red, and under each of them it says whether that team gets the mini-round or not (if both teams rolled the same, both are grey and no one gets it). <br />
                At the bottom, there&apos;s gamble button and the "SIMULATE" tab below it. <br />
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
                <img src={miniRoundWonChocolate} alt="Won mini-round for Team Salmon" className={css.image} style={{ width: '33vw', height: '36vh' }} />
                <img src={miniRoundWonIvory} alt="Won mini-round for Team Lavender" className={css.image} style={{ width: '33vw', height: '36vh' }} />
            </div>
            <p className={css.info_text}>And by taking a round, a team gets a lead and leading indicator will show to the team, which has a lead:</p>
            <div className={css.image_container}>
                <img src={wholeRoundWonChocolate} alt="Won round for Team Salmon" className={css.image} style={{ width: '33vw', height: '36vh' }} />
            </div>
            <p className={css.info_text}>And as it is a Best of 1 in 0:0 net of Stage I, a team needs one set to win:</p>
            <div className={css.image_container}>
                <img src={matchPointImg} alt="MATCH POINT!!! for the Salmon!" className={css.image} style={{ width: '34vw', height: '38vh' }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (Once a team is one round away from taking a set, they have a "SET POINT!" pill in their color above their names. But if a team is one set away from winning and one round away from winning, then it says "MATCH POINT!!!". This label differs itself in some specific matches, but I'll leave it already to you to find "some other specific cases" out)
                </span>
            </div>
            <p className={css.info_text}>
                After one of the both teams wins, this team goes then into 1:0 net as explained above and the loser team goes to 0:1 net.
                They go into such placeholder rectangles, which show who has already won 0:0 match or lost it.
                Once all matches of 0:0 finish, only then rectangles go and matches in two next nets are built by the distribution system as explained <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={scrollToAnchor("distribution-explained")} href='#distribution-explained'>here</a>.
                The winner side is light-green and the loser side is light-red on the rectangle. Depending if your chosen team won, a green check icon appears and a red cross appears, if lost. The "VS" is replaced by the final score of the match: <br />
            </p>
            <div className={css.image_container}>
                <img src={teamChocolateGoesTo10Net} alt="Team Salmon goes to 1:0 net and Team Lavender goes to 0:1 net" className={css.image} style={{ width: '30vw', height: '40vh' }} />
            </div>
            <p className={css.info_text}>
                And what if you don&apos;t feel like pressing "Gamble" for every single mini-round of a long series? That&apos;s what the <b>Simulate</b> tab is for.
                It sits below the match modal and below the "Gamble" button and by clicking on "SIMULATE", it opens itself and tells you what it&apos;s going to do.
                In the match modal, the "Simulate" button only becomes clickable, once you have chosen your team, and then it starts the match and plays it by itself right away:
            </p>
            <div className={css.image_container}>
                <img src={simulateModalImg} alt="Opened Simulate tab below the match modal of the second match of the 0:0 net" className={css.image} style={{ width: '35vw', height: 'auto' }} />
            </div>
            <p className={css.info_text}>
                On the series screen, it&apos;s the same tab below the "Gamble" button. While the simulation is running, the rolls are made by themselves at the chosen speed, a red dot tells that it&apos;s simulating, and the "Stop" button gives you the control back at any moment:
            </p>
            <div className={css.image_container}>
                <img src={simulateRunningImg} alt="Running simulation of a set on the series screen with the Stop button" className={css.image} style={{ width: '32vw', height: 'auto' }} />
            </div>
            <p className={css.info_text}>
                By default, it plays one set at a time at 1x and plays slower when a team is one round away from taking the set, but all of that (and whether it should play the whole series or even decide it <b>instantly</b>, without any playback) can be changed in the{" "}
                <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={scrollToAnchor("starting-off")} href='#starting-off'>Settings</a>.
                The simulation always stops by itself before Extended Rounds and Penalties, so the most dramatic moments are still yours to gamble. The results, the Leaderboard points, the stats and the Pick&apos;em points of a simulated match are counted exactly the same way as the ones of a gambled match.
            </p>
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
                And there is also a pill on the right of the "BEST OF" badge, which tells how many <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={scrollToAnchor("pickem-system")} href='#pickem-system'>Pick&apos;em points</a> you got: it&apos;s green with a ✓, if your team won the match, red with a ✗, if it got nothing, and orange with a half-filled circle, if your team lost the match, but still took some sets (and therefore some Pick&apos;em points). <br />
                In the middle, there is final score of the match, where there are some changes from pre-match modal. The winner team gets 10 points from this win here and changes its placement from 26th place to 17th place. Loser team loses 5 points and moves from 23rd place to 32nd place.<br />
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
                At the top, there are a modal and the navigation. The modal looks like a small version of the series screen: it contains the match Stage, name and order number, "Best of" of this match, the gained Pick&apos;em points specifically in this set (this is a Bo1 here, so in this Bo1) as a pill on the right, the final set score with both team names above it and the "n | ROUNDS" badge, which tells how many rounds were played, the "Back?" button and the "Hide full modal" text. Clicking it shrinks the modal down to the team names, the score and the gained Pick&apos;em points for a better view of the breakdown, while the breakdown itself stays exactly where it is (and the modal remembers this choice for the next time). The modal also shows whether your pickem team won this specific set (again, it&apos;s a Bo1 here, so this Bo1) with its light-green or light-red top and the ✓ or ✗ in its top-left corner. <br />
                The navigation contains all significant parts of the set and allows you to go directly to that or that part. These two (modal and navigation) are always with you on the screen (until you click on the "Back?" button, of course).
            </p>
            <p className={css.info_text}>
                And as you already understood, this is a detailed breakdown of each round. Every round has the same scoreboard as in the series screen: the team names, the score after this round, the won amount of mini-rounds of both teams and the leading indicator with the "ROUND" badge below it.
                The small glowing dot next to a team&apos;s name shows, which team won this round. "SET POINT!" and "MATCH POINT!!!" pills show up above the names exactly like in the series screen, and every Extended Round gets a purple "EXTENDED ROUND" pill above its indicator.
            </p>
            <p className={css.info_text}>
                Below every round, there is also a small strip with all the mini-rounds of that round, in the same order they were played. Each column is one mini-round:
                the upper number is the multiplier of the left team, the lower one is the multiplier of the right team (the small colored marks at the start of the strip tell which row belongs to which team).
                The multiplier of the team, which got that mini-round, is filled with the team color, so you can follow the whole round mini-round by mini-round, and the tiny numbers at the bottom show the score of the round after each of them. <br />
                The mini-round, which decided the round, glows in the color of its winner. If both teams rolled the same multiplier, nobody got that mini-round, so both numbers only get a grey outline.
                Hovering onto a column also tells you, which mini-round it was and who got it. Extended Rounds simply have longer strips, since they need 10 mini-wins.
            </p>
            <div className={css.image_container}>
                <img src={miniRoundStrips} alt="Close-up of Round 1 (an Extended Round) and Round 2 with their mini-round strips" className={css.image} style={{ width: '34vw', height: 'auto', margin: "0 auto" }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (In Round 1, Team Salmon took the first four mini-rounds, Team Lavender answered with two in a row, and then Team Salmon won the next six to take the Extended Round 10:2)
                </span>
            </div>
            <p className={css.info_text}>
                The parts are also visually separated, like here for example.
                Each divider is a pill, where the grey part shows which part has just ended and the coloured part shows which one begins (Overtimes, Extended Rounds and Penalties get the same colours as on the series screen):
            </p>
            <div className={css.image_container}>
                <img src={significantPartDivider} alt="Divider between First Half and Second Half" className={css.image} style={{ width: '34vw', height: '35vh', margin: "0 auto" }} />
            </div>
            <p className={css.info_text}>
                The ending of the set looks like this, for example (in this case, it has happened in first Overtime). Only the last round of a set shows the set lines below the scores, just like the series screen does right after the set:
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
                And the UI for the Detailed Match Results modal for non-Bo1 matches is also different: below the "BEST OF" badge, there are the same set chips with the final scores as in the set history of the series screen (S1, S2, ... and the orange "DEC" for the Decider). The chip of the set, which you&apos;re looking at, is dark with a small eye icon and a blue ring around it. By clicking onto another chip, the ring glides over to it and the whole breakdown smoothly switches to that set, while the scores in the modal roll to the new ones. I open at first the "Set 1":
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
                    (The golden "TOTAL" pill on the left is only shown at the last played set of a series and shows how much Pick&apos;em points you have gained from the whole series. If your picked team lost the series, but still took some sets, it&apos;s orange instead)
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
            <p className={css.info_text}>After 24-24 tie, this screen will show up. At the top, it tells that the set is still tied after Quadruple Overtime and there is the "EXTENDED ROUNDS | First to 4" badge. Below, there is a small scoreboard like in the series screen with the Extended Rounds score of both teams, their squares and the leading indicator with the "COMPARED n/6" badge.
                Below that, there are the cards of all 6 possible Extended Rounds in a chronological order (1st Half, 2nd Half, OT, Double OT, Triple OT and Quadruple OT). One by one, the cards flip over and show the winner of that Extended Round with a small arrow pointing to the side of the winner, the mini-rounds score of that round and the total Extended Rounds score below the card. The card, which is about to flip, has a blue ring around it, and the pill at the bottom always tells what has just happened.
                That team, which won more Extended Rounds throughout the whole set, that team also wins the set (4 Extended Rounds are already enough and the card, which decided it, gets a "CLINCHED!" pill):</p>
            <div className={css.image_container}>
                <img src={extRoundsScreenOne} alt="Extended Rounds comparison screen 1" className={css.image} style={{ width: '30vw', height: '35vh' }} />
            </div>
            <div className={css.image_container}>
                <img src={extRoundsScreenTwo} alt="Extended Rounds comparison screen 2" className={css.image} style={{ width: '30vw', height: '35vh' }} />
            </div>
            <p className={css.info_text}>If the Extended Rounds score is tied 3-3, penalty series will start, which will decide everything:</p>
            <div className={css.image_container}>
                <img src={extRoundsScreenThree} alt="Extended Rounds score tied 3-3" className={css.image} style={{ width: '30vw', height: '35vh' }} />
            </div>
            <div className={css.image_container}>
                <img src={pensScreen} alt="Penalty series screen" className={css.image} style={{ width: '32vw', height: '36vh' }} />
            </div>
            <p className={css.info_text}>
                It looks similar to what we've used to see normally in normal series screen. But here, instead of mini-wins indicators, there are penalties indicators: dashed and hollow circles mean that the attempt hasn&apos;t been taken yet, green circles mean successful attempt and red circles mean unsuccessful attempt. Instead of the "ROUND" badge, the "PENALTY SERIES | Attempt n" badge below the score tells which attempt it is, and if nobody is ahead after the 5th attempt, it turns into a pulsing "SUDDEN DEATH" badge. The rules are now different as from normal series.
                The point and the idea here were taken from football analogue, explained <a style={{ color: 'Highlight', fontStyle: 'italic' }} target="_blank" href='https://en.wikipedia.org/wiki/Penalty_shoot-out_(association_football)'>here</a>. Unlike football, we utilize here some different rules from football. Teams take turns one by one. The team that will take the Pen first, is always random, and the pill in the color of the team above the scoreboard, like "TEAM CHARTREUSE&apos;S TURN", always tells whose turn it is. But, here are also simultaneous pair rolls of each team. During an attempt of e.g. left team, left team should roll a bigger number than their opponent to gain a successful attempt, like here:
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
                And whenever a match is over, no matter how it ended, a big "GG!" in the colors of the winner shows up below the scoreboard with a small celebration, and the whole side of the loser fades out.
                The round, which decided the match, gets the same "GG!" in the Detailed Match Results as well, playing its celebration once, when you scroll to it.
            </p>
            <p className={css.info_text}>
                Match rectangle of such a match looks like this then:
            </p>
            <div className={css.image_container}>
                <img src={matchRectPens} alt="Match rectangle with penalty score" className={css.image} style={{ width: '30vw', height: '24vh' }} />
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
                <img src={finishedMatchModalImg} alt="Finished match modal" className={css.image} style={{ width: '37vw', height: '27vh' }} />
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
            <div id="official-skylines" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Official Skylines</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                Remember the dark divider after the 32nd place? The 32 teams below it (places 33-64) don&apos;t just watch the Official: they play the <b>Official Skylines</b>, a Tier 2 tournament with its own number, which starts together with every Official.
                So, together with Official #1, there was also <b>Official Skylines #1</b>. It doesn&apos;t have Swiss Stages or a bracket, but a whole building: <b>8 Floors with 4 teams each</b>, from the golden <b>Penthouse</b> at the top, over Floors 2-7, down to the <b>Ground Floor</b>.
                The teams move into the building by their placements: places 33-36 into the Penthouse, 37-40 into Floor 2 and so on, until places 61-64 on the Ground Floor.
            </p>
            <p className={css.info_text}>
                The Official Skylines isn&apos;t played all at once, but in three blocks in between the Official: <b>Rounds 1 and 2</b> right after Stage I, <b>Rounds 3 and 4</b> right after Stage II and the <b>Rooftop Final</b> right after Stage III, before the Playoffs of the Official begin.
                So, after the last match of Stage I, the Official takes a short break and the Tournament Intro Screen of the Official Skylines shows up with every Floor and its 4 teams:
            </p>
            <SkyShot n={1} alt="Tournament Intro Screen of Official Skylines #1 with all 8 Floors" />
            <p className={css.info_text}>
                After "Continue", there is the building itself. At the top, the navigation "Official | Official Skylines" lets you switch between both tournaments at any moment (it&apos;s there during the whole Official, also in the Stages), and the vertical navigations on both sides take you to every Round (on the left) and to every Floor (on the right, where the Penthouse is golden).
                Every Floor is a small Double Elimination bracket of its own: two <b>Opening</b> matches, the <b>Winners&apos; Match</b> of both winners and the <b>Losers&apos; Match</b> of both losers, which decide the places 1-4 on that Floor.
                The Penthouse and Floor 2 play <b>Best of 3</b>, all the other Floors play <b>Best of 1</b>. Above the Penthouse, the roof already waits for the Rooftop Final:
            </p>
            <SkyShot n={2} alt="Round 1 of Official Skylines #1 at the top of the building: the roof and the Penthouse" />
            <p className={css.info_text}>
                Each Round starts on the Ground Floor and ends in the Penthouse, so the current match with the yellow glow climbs up the building, floor by floor.
                The match modal tells the Round and the Floor, and since none of these teams had played a single match before, the very first one, Team Azure against Team Royal, was an absolute 50/50:
            </p>
            <SkyShot n={3} alt="Match modal of the first Opening Match on the Ground Floor" width="35vw" />
            <p className={css.info_text}>
                And here comes the most important rule of the Official Skylines, the <b>elevator</b>. Once a Floor is done, its 1st place goes <b>up 2 Floors</b>, the 2nd place <b>up 1 Floor</b>, the 3rd place <b>down 1 Floor</b> and the 4th place <b>down 2 Floors</b>.
                Nobody can go higher than the Penthouse or lower than the Ground Floor, so at the top and at the bottom of the building, the moves are a bit shorter, but every Floor always has its 4 teams for the next Round.
                On the Ground Floor, Team Blush beat Team Jade 13-4 and Team Royal 13-10 in the Winners&apos; Match, so it was the first one to take the elevator 2 Floors up:
            </p>
            <SkyShot n={4} alt="The finished Ground Floor in Round 1" />
            <p className={css.info_text}>
                Once the whole Round is played, every team shows its move next to its circle (one arrow for a Floor, two arrows for two Floors) and the elevator shaft on the right side of the building shows who leaves each Floor and where to.
                Team Seafoam, which started on Floor 2 (the 40th place of the Leaderboard), won both of its matches 2:0 and went straight up into the Penthouse, while the Penthouse&apos;s Team Sapphire and Team Amber went down:
            </p>
            <SkyShot n={5} alt="The finished Round 1 with the moves of every team" />
            <SkyShot n={6} alt="Round 2: Team Seafoam and Team Apricot in the Penthouse" />
            <p className={css.info_text}>
                Right after Round 2, a notification tells that Stage II of the Official starts now, and the Official goes on, as if nothing has happened. After Stage II, Rounds 3 and 4 follow the same way.
            </p>
            <p className={css.info_text}>
                And the story of my Official Skylines #1 is the one of Team Sand. It started on Floor 2 and lost both of its matches in Round 1, so it went 2 Floors down to Floor 4.
                In Round 2, it lost only the Winners&apos; Match there and went 1 Floor up, in Round 3, it won the whole Floor 3 and went 2 Floors up, right into the Penthouse.
                Team Seafoam, on the other hand, stayed in the Penthouse until Round 4, where it lost both of its matches and fell down to Floor 3.
                After Round 4, the 4 teams of the Penthouse climb up to the roof and play the <b>Rooftop Final</b>: the Semifinals (#1 against #4 and #2 against #3 of the Penthouse) and the Third Place Decider are <b>Best of 3</b>, the Grand Final is <b>Best of 5</b>:
            </p>
            <SkyShot n={7} alt="The Rooftop Final of Official Skylines #1 before the Semifinals" />
            <p className={css.info_text}>
                Team Apricot, which started on Floor 3 as the 44th team of the Leaderboard, beat Team Ivory 2:0 in the Semifinal, and Team Sand beat Team Forest 2:0. So, the Grand Final was Team Apricot against Team Sand, and the prediction was clearly on the side of Team Apricot:
            </p>
            <SkyShot n={8} alt="Match modal of the Rooftop Grand Final" width="35vw" />
            <p className={css.info_text}>
                But Team Sand won it 3:2, from Floor 4 to the top of the building in two Rounds. Team Ivory took the Third Place 2:0 against Team Forest.
                The Official Skylines is a Tier 2 tournament, so the Winners&apos; Screen has neither quotes nor a trophy and the winner gets a 🥇:
            </p>
            <SkyShot n={9} alt="Winners' screen of Official Skylines #1" width="28vw" />
            <p className={css.info_text}>
                The Official Skylines has its own Pick&apos;em challenge as well. While it is played, the needed Pick&apos;em points in the top-right corner are the ones of the Official Skylines, and its Pick&apos;em summary counts every Round on its own and then the Rooftop Final.
                This one, I won: 133 out of 119 needed Pick&apos;em points.
            </p>
            <SkyShot n={10} alt="Pick'em summary of Official Skylines #1" width="30vw" />
            <p className={css.info_text}>
                "To the bracket" shows the finished building one more time, and "Proceed" there takes me back to the Official, right into its Playoffs:
            </p>
            <SkyShot n={11} alt="The finished Official Skylines #1 with the Proceed button" />
            <p className={css.info_text}>
                The Leaderboard points of the Official Skylines are counted the same way as everywhere else: the higher the Floor, the more a match is worth, and the Rooftop Final is worth the most. That&apos;s why, in the Leaderboard after Official #1, Team Apricot went 27 places up to the 17th place with 86 more points.
            </p>
        </section>
        <section>
            <div id="what-happens" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>What happens next?</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>After that, you can proceed with further matches. When all the match-ups in Stage I are finished, only 8 teams are left. After the first two Rounds of the{" "}
                <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={scrollToAnchor("official-skylines")} href='#official-skylines'>Official Skylines</a>, they qualify into Stage II and build with auto-qualifiers match-ups for 0:0 net but already in Stage II:</p>
            <div className={css.image_container}>
                <img src={stageTwoQualifiersImg} alt="Stage II Qualifiers" className={css.image} style={{ width: '30vw', height: '40vh' }} />
            </div>
            <div className={css.image_container}>
                <img src={stageTwoImg} alt="Stage II" className={css.image} style={{ width: '33vw', height: '38vh' }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (There is a navigation menu in top left corner, where you can also see Stage III and Playoffs, once you finish Stage II)
                </span>
            </div>
            <p className={css.info_text}>And so you can proceed from Stage II to Stage III and from Stage III to Playoffs (with Rounds 3 and 4 and the Rooftop Final of the Official Skylines in between):</p>
            <div className={css.image_container}>
                <img src={playoffsQualifiersImg} alt="Playoffs Qualifiers" className={css.image} style={{ width: '30vw', height: '40vh' }} />
            </div>
            <div className={css.image_container}>
                <img src={playoffsImg} alt="Playoffs" className={css.image} style={{ width: '39vw', height: '40vh' }} />
            </div>
            <p className={css.info_text}>As I mentioned above, the Quarterfinals are <b>BO5</b>, Semifinals and Third Place Decider are <b>BO7</b>, and the Grand Final is <b>BO9</b>.</p>
            <p className={css.info_text}>
                Playoffs are single-elimination stage, which means that once a team loses a series, it flies out of the tournament directly. By the time we reach Grand Final, there should be only two teams left:
            </p>
            <div className={css.image_container}>
                <img src={grandFinalistsImg} alt="Two contenders for the championship remaining" className={css.image} style={{ width: '39vw', height: '40vh' }} />
            </div>
            <p className={css.info_text}>
                In a BO9 will be decided the winner of the tournament. And once the winner of the Grand Final is determined, we are directly redirected to winner&apos;s screen, where the first 4 places of the tournament show up one by one: at first the Fourth Place, then the Third Place, the Runner-Up and at the very end, the Winner. Every place rises with its own little celebration: blue embers for the Fourth Place, bronze sparkles for the Third Place, silver rays for the Runner-Up and golden rays, fireworks and confetti all over the screen for the Winner:
            </p>
            <div className={css.image_container}>
                <img src={winnersScreenImg} alt="Team Indigo as Winner, Team Blue as Runner-up, Team Lime as Third Place, Team Navy as Fourth Place" className={css.image} style={{ width: '35vw', height: '72vh' }} />
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
                <img src={playoffsResultsAndTournamentFinished} alt="Playoffs Results and Finished Tournament Results" className={css.image} style={{ width: '39vw', height: '40vh' }} />
            </div>
            <p className={css.info_text}>
                Five buttons are replacing now the Needed Pick&apos;em points and they explain by themselves, what they do. Also, in the Header, we can open the updated Leaderboard:
            </p>
            <div className={css.image_container}>
                <img src={updatedLeaderboard} alt="Updated Leaderboard with the changes of Official #1" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    (The trophy icon resembles each Official win for the teams, the medals are understandable, what they resemble)
                </span>
            </div>
            <p className={css.info_text}>
                Right after a tournament, the Leaderboard also shows what this tournament has changed. The green or red number with the double arrow tells how many places a team went up or down,
                and the green or red points right after the team name tell how many points it gained or lost in this tournament.
                For the Top 10, the places are shown right before the placement, and for all the other teams, right before the team circle. <br />
                For example, Team Indigo went from the 10th place right up to the 1st one (9 places up), gaining 331 points along the way, and Team Salmon, which started all the way down in Stage I and made it to the Quarterfinals, went from the 26th place to the 6th one (20 places up, +82 points).
                If a team&apos;s points or place didn&apos;t change, nothing is shown for that part. <br />
                These changes are always only from the last finished tournament: they stay in the Leaderboard until the next tournament starts, and once that one is finished, its own changes replace them.
                If you sort the Leaderboard by something else than points, the change of places moves next to the "Original ranking", because it always belongs to the ranking by points.
            </p>
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
                <img src={hallOfFameWithOfficialOne} alt="Hall of Fame with the Official #1 and the Official Skylines #1 cards" className={css.image} style={{ width: '34vw', height: '35vh' }} />
            </div>
            <p className={css.info_text}>
                Hall of Fame has stored the very first played Tournaments with their Pick'em points info and Podiums: the Official #1 card on the left (the newest card is always on the left) and the Official Skylines #1 card next to it, since that one was finished before the Playoffs of the Official. In top-right corner, we see also a change: 1 Pick'em challenge won, 1 lost, and the Pick'em points score of -26 (-40 from the Official and +14 from the Official Skylines). This way, any played tournament will be stored here. Here is the full look of it, when we open the Official #1 overview: first the teams of every Stage, then the whole Stage I, all teams to Stage II, the whole Stage II, all teams to Stage III, the whole Stage III, all teams to Playoffs and the Playoffs, and at the end the Podium, the 5th-8th places and a link to the summary of the Official Skylines (every match in there can be clicked and opened, just like during the tournament):
            </p>
            <div className={css.image_container} style={{ gap: 24 }}>
                <img src={hallOfFameOfficialOnePartOne} alt="Hall of Fame, Official #1: the challenge result and the teams of every Stage" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <img src={hallOfFameOfficialOnePartTwo} alt="Hall of Fame, Official #1: the whole Stage I" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <img src={hallOfFameOfficialOnePartThree} alt="Hall of Fame, Official #1: all teams to Stage II and Stage II" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <img src={hallOfFameOfficialOnePartFour} alt="Hall of Fame, Official #1: all teams to Stage III and Stage III" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <img src={hallOfFameOfficialOnePartFive} alt="Hall of Fame, Official #1: all teams to Playoffs and the start of the Playoffs bracket" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <img src={hallOfFameOfficialOnePartSix} alt="Hall of Fame, Official #1: the whole Playoffs bracket with the Third Place Decider" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <img src={hallOfFameOfficialOnePartSeven} alt="Hall of Fame, Official #1: the podium" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                <img src={hallOfFameOfficialOnePartEight} alt="Hall of Fame, Official #1: the end of the podium, 5th-8th places and the link to the Official Skylines" className={css.image} style={{ width: '34vw', height: '35vh' }} />
            </div>
            <p className={css.info_text}>
                The Official Skylines has its own card as you have seen. Its summary starts with all 32 teams, then comes the whole building, where the navigation lets me look at every Round and the Rooftop Final (and it stays below the title, while scrolling down).
                At the end, there are the podium and the places 5-12, which are the Floors 2 and 3 after Round 4, and a link to the summary of the Official, which was played at the same time:
            </p>
            <SkyShot n={12} alt="Hall of Fame, Official Skylines #1: all teams and the Rooftop Final" />
            <SkyShot n={13} alt="Hall of Fame, Official Skylines #1: Round 1 of the building" />
            <SkyShot n={16} alt="Hall of Fame, Official Skylines #1: the places 5-12 and the link to Official #1" />
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
                In my Qualifier, Team Green and Team Lavender won their Upper Finals (Team Green only 3:2 against Team Beige, Team Lavender 3:0 against Team Pink), while Team Khaki and Team Red went the long way and won the Consolidation Finals. Team Khaki lost its Upper Quarterfinal against Team Beige and then won five Lower Bracket matches in a row, the last one 3:1 against that same Team Beige.
                And Team Seafoam, which was too low in the Leaderboard to even play in Official #1, didn&apos;t make it through the Qualifier either: 0:2 against Team Ruby and 0:2 against Team Black.
                Once the last match is played, instead of a podium, there&apos;s a screen with the 4 qualifiers and the round they qualified through:
            </p>
            <PemShot n={7} alt="The 4 qualifiers of PEM Small Tournament #1" />
            <p className={css.info_text}>
                "Proceed" leads to the Pick&apos;em summary as always, but this one counts the guessed matches of every round of the Qualifier. This time, I lost it with 128 out of 181 needed Pick&apos;em points:
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
                In my very first match of the Champions Series Tour, Team Ivory and Team Azure did exactly that, so instead of "GG!", a grey "TIE!" shows up and none of the sides fades out:
            </p>
            <PemShot n={13} alt="TIE! at 15-15 in the series screen" />
            <p className={css.info_text}>
                A tie gives no Pick&apos;em points, no matter which team I picked. The Leaderboard points can still move a bit: the favourite loses a few points to the underdog, because a draw against a weaker team is not a good result
                (see{" "}
                <InfoLink onClick={scrollToAnchor("leaderboard-explained", "official")} href="?page=official#leaderboard-explained">Leaderboard format and points system</InfoLink>
                ).
            </p>
            <PemShot n={14} alt="Match modal of the 15-15 tie" width="35vw" height="27vh" caption="(Team Ivory and Team Azure were exactly as strong as each other, a 50/50, so nobody was the favourite and no points moved)" />
            <p className={css.info_text}>
                The tables are sorted by points: <b>a win gives 3 points, a tie 1 point</b>. If teams have the same points, the round difference (RD, won minus lost rounds) decides, then the rounds won and then the match between those two teams.
                Columns: M = matches played, W = wins, T = ties, L = losses, P = points. Once all 40 matches are played, the <b>top 2 of every Group</b> (with a green check mark) go to the Playoffs:
            </p>
            <PemShot
                n={15}
                alt="Finished Group Stage of the Champions Series Tour"
                caption="(Team Moss and Team Blush both had 6 points in Group B, but Team Moss had the better round difference: +5 against -8)"
            />
            <p className={css.info_text}>
                The Playoffs are a classic 8-team bracket: every Group winner meets a second-placed team of another Group in the Quarterfinals.
                Quarterfinals, Semifinals and the Third Place Decider are <b>Best of 3</b>, the Grand Final is <b>Best of 5</b>. With the navigation in the top left corner I can still look at the Group Stage.
            </p>
            <PemShot n={16} alt="Champions Series Tour Playoffs before the Quarterfinals" />
            <p className={css.info_text}>
                Team Jade, the only team besides Team Frost which didn&apos;t lose a single Group Stage match, beat Team Moss 2:1 and Team Raspberry 2:0 and won the Grand Final 3:1 against Team Charcoal. Team Frost, the only team with four wins out of four, flew out in the Quarterfinals against Team Ivory, which then took the Third Place:
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
                This time, none of the four teams from the Qualifier made it: Team Red and Team Lavender lost both of their matches, Team Green beat Team Cyan in the Lower Bracket and then lost to Team Lime,
                and Team Khaki beat Team Brown in the Opening Round, but lost to Team Salmon and in the Lower Semifinal to that same Team Brown. Team Indigo, the champion of Official #1, won Group A 3:2 in the Upper Final against Team Orange, and in Group B, Team Blue beat Team Salmon 3:2:
            </p>
            <PemShot n={21} alt="Finished Group B of the main event" caption="(Team Silver lost its Upper Semifinal against Team Blue and then won the Lower Bracket, the Lower Final 3:0 against Team Brown)" />
            <p className={css.info_text}>
                The Playoffs have 6 teams. The <b>winners of the Upper Finals</b> are rewarded and start right in the Semifinals. The losers of the Upper Finals and the winners of the Lower Finals play the Quarterfinals crosswise against the other Group.
                Quarterfinals, Semifinals and the Third Place Decider are <b>Best of 5</b>, the Grand Final is <b>Best of 7</b>.
            </p>
            <PemShot n={22} alt="Main event Playoffs before the Quarterfinals" caption="(Team Indigo and Team Blue won their Upper Finals, so they already wait in the Semifinals)" />
            <p className={css.info_text}>
                Team Lime beat Team Salmon 3:0 and Team Silver beat Team Orange 3:1 in the Quarterfinals, but both Semifinals were 3:0s for the Group winners. So the Grand Final was Team Indigo, the champion of Official #1, against Team Blue, the runner-up of Official #1, and this time, Team Blue won it 4:3, in the seventh set.
                Team Silver beat Team Lime 3:0 in the Third Place Decider and took the bronze medal.
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
                Team Blue has it now, and its fire icon tells that it is on an Unbeaten Streak of 5: it won every single match of the main event (see{" "}
                <InfoLink onClick={scrollToAnchor("stats-explained", "official")} href="?page=official#stats-explained">Team stats and how do they work</InfoLink>
                ):
            </p>
            <PemShot n={26} alt="Leaderboard after PEM Small Tournament #1" />
            <p className={css.info_text}>
                The green and red numbers are the changes of the last finished tournament again (see{" "}
                <InfoLink onClick={scrollToAnchor("finale", "official")} href="?page=official#finale">Finale? Or not?</InfoLink>
                ). This time, it&apos;s the PEM Small Tournament itself, because the Qualifier and the Champions Series Tour are tournaments of their own, so their changes have already been replaced.
                Team Blue gained 242 points and went 5 places up to the 1st one, and Team Silver went 8 places up to the 3rd one.
            </p>
            <p className={css.info_text}>
                Second and third places of Tier 1 and Tier 2 tournaments don&apos;t get their own icons, they are counted together with the Official ones.
                By hovering onto a medal, I can see where it comes from. Team Indigo won Official #1, but lost the Grand Final of PEM Small Tournament #1, so next to its Official trophy, it has a silver medal from a Tier 1 tournament:
            </p>
            <PemShot n={27} alt="Hovered medal of Team Indigo: 1 from Tier 1 tournament" width="28vw" />
            <p className={css.info_text}>
                The winner of the Champions Series Tour gets a 🥇 medal instead of a trophy, so Team Jade, the 24th team in the Leaderboard, can show off its title as well:
            </p>
            <PemShot n={28} alt="Hovered gold medal of Team Jade: 1 from Tier 2 tournament" width="28vw" />
            <p className={css.info_text}>
                And in the Hall of Fame, there are three new cards now, one for every tournament of PEM Small Tournament #1. The newest one is always on the left.
                Each card shows the result of its Pick&apos;em challenge as well: I lost all three, so the Pick&apos;em points score and the counts in the top-right corner went down (the cards of Official #1 and Official Skylines #1 are still there, on the right):
            </p>
            <PemShot n={29} alt="Hall of Fame with the cards of the main event, the Champions Series Tour, the Qualifier, Official #1 and Official Skylines #1" />
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
                And it was a bad Qualifier for the champions of the smaller tournaments. Team Jade, the champion of{" "}
                <InfoLink onClick={scrollToAnchor("pem-cst", "pem-small")} href="?page=pem-small#pem-cst">Champions Series Tour #1</InfoLink>, lost both of its matches (0:2 against Team Raspberry and 1:2 against Team Amber) and flew out right away.
                In Group A, Team Mint won all of its matches, but it was close: the Upper Final against Team Charcoal went to the Decider and ended 3:2.
                Team Charcoal then fought back through the Consolidation Final with a 3:1 against Team Crimson, which had won four Lower Bracket matches in a row before.
                In Group B, Team Yellow beat Team Magenta 3:1 in the Upper Final and Team Black then beat that same Team Magenta 3:0 in the Consolidation Final:
            </p>
            <BigShot n={4} alt="The 4 qualifiers of PEM Big Tournament #1" />
            <p className={css.info_text}>
                The Pick&apos;em summary looks the same as in the PEM Small Tournament Qualifier. I guessed 11/16 Opening Rounds, but it still wasn&apos;t enough: 143 out of 155 needed Pick&apos;em points:
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
                The very first match was the top seed Team Apricot against the last seed Team Rose:
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
                Team Rose, the last seed, won it 16-14 in Overtime, but then lost 10-13 against Team Azure and, in Lower Round 3, against Team Moss.
                The real story of this Elite Competition League is Team Honey: it won its first match 19-16 in Double Overtime against Team Sunflower, lost its Upper Quarterfinal 9-13 against Team Sand
                and then won four Lower Bracket matches in a row (against Team Bronze, Team Sapphire, Team Sand and, in the Lower Final, Team Azure), until Team Chocolate stopped it 2:0 in the Consolidation Final.
                And Team Seafoam was down there as well and lost both of its matches.
            </p>
            <BigShot n={13} alt="Finished Upper Bracket of the Elite Competition League with the Grand Final" />
            <BigShot n={14} alt="Finished Lower Bracket of the Elite Competition League" />
            <p className={css.info_text}>
                And in the Grand Final, Team Royal met Team Chocolate again, which it had already beaten 2:0 in the Upper Final. This time, Team Chocolate won the first set 19-17 in Double Overtime and the third one 13-5,
                but Team Royal won the fourth and the fifth set (13-5 and 13-6). So, Team Royal won the Grand Final 3:2, without losing a single match.
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
                In Group A, Team Yellow from the Qualifier won both of its matches, while Team Mint, the other qualifier, beat Team Cyan in the Opening Round, lost the Winners&apos; Match against Team Yellow and then lost the Decider Match against that same Team Cyan.
                In Group B, Team Teal won the Winners&apos; Match against Team Black, and Team Black, the third qualifier, came back through the Decider Match with a 2:0 against Team Violet.
                Only Team Charcoal, the fourth qualifier, lost both of its matches and flew out:
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
                Team Blue, the champion of PEM Small Tournament #1, won Group A and beat Team Navy 3:0 in the Upper Final.
                In Group B, Team Black, which started the whole PEM Big Tournament in the Qualifier, even beat Team Indigo, the champion of Official #1, in the Opening Round, but then lost against Team Gray and in the Lower Semifinal against that same Team Indigo.
                Team Red won the Upper Final 3:2 against Team Gray:
            </p>
            <BigShot n={21} alt="Finished Group A of Stage II" />
            <BigShot n={22} alt="Finished Group B of Stage II" caption="(Team Indigo won the Lower Final 3:2 against Team Lime)" />
            <p className={css.info_text}>
                The Playoffs are the same 6-team bracket as in the PEM Small Tournament, but bigger: the Quarterfinals are <b>Best of 5</b>, the Semifinals and the Third Place Decider are <b>Best of 7</b>{" "}
                and the Grand Final is <b>Best of 9</b>, exactly the same formats as in the Playoffs of Official.
            </p>
            <BigShot n={23} alt="Playoffs of PEM Big Tournament #1 before the Quarterfinals" />
            <p className={css.info_text}>
                Team Gray beat Team Silver 3:1 and Team Indigo beat Team Navy 3:2 in the Quarterfinals, with two sets in Double Overtime (19-17 for Team Navy and 19-16 for Team Indigo).
                Then both Semifinals ended 4:0: Team Blue against Team Gray and Team Indigo against Team Red. And so, the Grand Final was the same as in PEM Small Tournament #1: Team Blue against Team Indigo, a Best of 9:
            </p>
            <BigShot n={24} alt="Match modal of the Grand Final of PEM Big Tournament #1" width="35vw" />
            <BigShot n={25} alt="Series screen of the Bo9 Grand Final with the golden PEM trophy" width="30vw" caption="(The trophy icon in the series screen is the golden PEM trophy now)" />
            <p className={css.info_text}>
                Team Blue won the first two sets, Team Indigo took the third one 13-1, but then Team Blue won three sets in a row, the first of them 16-13 in Overtime: 5:1. Team Gray beat Team Red 4:2 in the Third Place Decider.
                Every Tier 1 tournament has its own trophy: the PEM Small Tournament has the silver one, the PEM Big Tournament has the <b>golden PEM trophy</b>:
            </p>
            <BigShot n={26} alt="Winners' screen of PEM Big Tournament #1 with the golden PEM trophy" width="28vw" />
            <p className={css.info_text}>
                And the Pick&apos;em challenge was lost again: 120 out of 145 needed Pick&apos;em points.
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
                Team Blue has both PEM trophies now: the golden one and the silver one. Its Unbeaten Streak went up to 10 as well, and Team Indigo has two 🥈 medals from both PEM Grand Finals.
                The 2nd and 3rd places count into the 🥈 and 🥉 totals, same as with the PEM Small Tournament (see{" "}
                <InfoLink onClick={scrollToAnchor("pem-rewards", "pem-small")} href="?page=pem-small#pem-rewards">Trophies, medals and Hall of Fame</InfoLink>
                ):
            </p>
            <BigShot n={29} alt="Leaderboard after PEM Big Tournament #1" />
            <p className={css.info_text}>
                The changes in the Leaderboard are from the PEM Big Tournament itself again: Team Gray went 7 places up to the 3rd one, and Team Blue gained 149 more points.
            </p>
            <p className={css.info_text}>
                In the Hall of Fame, there are three new cards again: the PEM Big Tournament card with the golden trophy on top, the Elite Competition League card and the Qualifier card.
                I lost all three Pick&apos;em challenges again, so the Pick&apos;em points score went down even further:
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
                And same as the PEM Tournaments, it is three tournaments, played one after another: <br />
                • <b>Global Challenger Cup Open Qualifier</b> (Qualifier) comes first <br />
                • <b>Global Challenger Cup</b> (GCC), a Tier 2 tournament, comes second <br />
                • <b>Global Pro League</b> itself (Tier 1) comes right after it
            </p>
            <GplShot n={1} alt="Choose how you want to play modal with the Global Pro League picked" />
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                As always, the teams are seeded by the Leaderboard at the moment the Global Pro League starts: <br />
                • Top 1-8 → Autoqualify to <b>Stage II</b> of the Global Pro League <br />
                • Top 9-24 → Start in <b>Stage I</b> of the Global Pro League <br />
                • Top 25-36 → Autoqualify to the <b>Global Challenger Cup</b> <br />
                • Top 37-56 → Play in the <b>Open Qualifier</b> for the 4 remaining places of the Global Challenger Cup <br />
                • Top 57-64 → Start the Open Qualifier in its <b>Play-in</b>
            </p>
            <p className={css.info_text}>
                That&apos;s why the "Stage dividers" select of the Leaderboard has its own "Global Pro League" option now. When you pick it, you see where every team starts:
                between Stage I and the Global Challenger Cup, between the Global Challenger Cup and the Open Qualifier and, at the very end, between the Open Qualifier and its Play-in:
            </p>
            <GplShot n={2} alt="Leaderboard with the Global Pro League dividers between Stage I and the Global Challenger Cup" />
            <GplShot n={3} alt="Leaderboard with the divider between the Global Challenger Cup and the Open Qualifier" />
            <GplShot n={37} alt="Leaderboard with the divider between the Open Qualifier and its Play-in" />
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                (The Global Pro League hasn&apos;t started yet here, so the green and red numbers in the Leaderboard are still the changes from the PEM Big Tournament.)
            </p>
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                The Open Qualifier carries the number of the Global Challenger Cup it qualifies for, both of the other tournaments have their own numbers (Global Challenger Cup #1 and Global Pro League #1), and "Proceed" leads from one tournament into the next one, same as in the PEM Tournaments.
                How a match is played itself, you can see in{" "}
                <InfoLink onClick={scrollToAnchor("start-match", "official")} href="?page=official#start-match">How to start a match?</InfoLink>{" "}
                of the Official tab. I chose the Global Pro League explicitly and clicked "Start Game", right after{" "}
                <InfoLink onClick={scrollToAnchor("big-rewards", "pem-big")} href="?page=pem-big#big-rewards">PEM Big Tournament #1</InfoLink>.
            </p>
        </section>
        <section>
            <div id="gcc-open-qualifier" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Global Challenger Cup Open Qualifier</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                The first tournament is the <b>Global Challenger Cup Open Qualifier</b>. "Open", because it is open for nearly the whole bottom of the Leaderboard: 28 teams play for the 4 last places of the Global Challenger Cup.
                Its Tournament Intro Screen shows the <b>Play-in</b> with the 8 lowest teams (places 57-64) and <b>Group A</b> and <b>Group B</b> with 10 teams each (places 37-56, dealt one by one, same as in the PEM Qualifiers), where the 2 empty circles wait for the winners of the Play-in:
            </p>
            <GplShot n={38} alt="Tournament Intro Screen of the Global Challenger Cup Open Qualifier with the Play-in and both Groups" />
            <p className={css.info_text}>
                After "Continue", the navigation at the top has a third tab next to both Groups: the <b>Play-in</b>. It&apos;s played first and it&apos;s just 4 Best of 3 matches (the best team of the Play-in against the worst one and so on). Below every match, it already says, which Group the winner goes to:
            </p>
            <GplShot n={39} alt="The Play-in of the Global Challenger Cup Open Qualifier before the first match" />
            <GplShot n={40} alt="Match modal of Play-in #1 of the Open Qualifier" width="35vw" />
            <p className={css.info_text}>
                All four Play-ins were clear: Team Spring beat Team Copper 2:0, Team Sunflower beat Team Rose 2:0, Team Lilac beat Team Bronze 2:1 and Team Seafoam beat Team Forest 2:0.
                Then both Groups can be played. Each of them is a <b>Double Elimination</b> bracket, like a Group of the{" "}
                <InfoLink onClick={scrollToAnchor("pem-qualifier", "pem-small")} href="?page=pem-small#pem-qualifier">PEM Small Tournament Qualifier</InfoLink>, but with 12 teams instead of 16.
                That&apos;s why the 4 best seeds of every Group get a bye: they skip the Opening Round and wait in the Upper Quarterfinals for its winners.
                And since there are only 4 Opening Rounds, there is no Lower Round 1 either: the losers of the Opening Round go straight into Lower Round 2, where they meet the losers of the Upper Quarterfinals (the bent lines show, where they go).
                The Opening Round, the Upper Quarterfinals and the Upper Semifinals are <b>Best of 1</b>, everything else is <b>Best of 3</b>:
            </p>
            <GplShot n={41} alt="Group A of the Open Qualifier before the first match: the 4 best seeds wait in the Upper Quarterfinals" />
            <p className={css.info_text}>
                Same as in the PEM Qualifiers, the <b>2 best teams of every Group</b> qualify: the winner of the Upper Final and the winner of the Consolidation Final.
                In Group A, Team Ruby, the best seed of the whole Open Qualifier, won all three of its matches (the Upper Final 2:0 against Team Chocolate).
                But the story of Group A is Team Spring: it came from the Play-in as the 57th team, beat Team Raspberry 13-11 and Team Peach 13-4, lost the Upper Semifinal against Team Chocolate
                and then fought back through the Lower Bracket (2:0 against Team Raspberry and 2:0 against Team Lilac, another team from the Play-in), until Team Chocolate stopped it once more, 2:0 in the Consolidation Final.
                In Group B, Team Ivory beat Team Periwinkle 2:0 in the Upper Final, and Team Periwinkle then beat Team Denim 2:0 in the Consolidation Final:
            </p>
            <GplShot n={42} alt="The finished Lower Bracket of Group A, from Lower Round 2 to the Consolidation Final" />
            <GplShot n={43} alt="The 4 qualifiers of Global Challenger Cup #1" />
            <p className={css.info_text}>
                The Pick&apos;em summary counts the Play-ins and every round of both Groups, and this one, I won: 61 out of 57 needed Pick&apos;em points.
                (The Open Qualifier is a Qualifier, so the needed Pick&apos;em points are smaller here.)
            </p>
            <GplShot n={44} alt="Pick'em summary of the Global Challenger Cup Open Qualifier" width="30vw" />
            <p className={css.info_text}>
                In the Hall of Fame, its summary starts with all teams of both Groups, then come the Play-in, both Group brackets (with the "Group A | Group B" navigation, which stays below the title while scrolling), the qualified teams and a link to the summary of the Global Challenger Cup:
            </p>
            <GplShot n={45} alt="Hall of Fame, Global Challenger Cup Open Qualifier #1: all teams and the Play-in" />
            <GplShot n={46} alt="Hall of Fame, Global Challenger Cup Open Qualifier #1: the qualified teams and the link to the Global Challenger Cup" />
        </section>
        <section>
            <div id="gcc" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Global Challenger Cup</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                After "Proceed", the Global Challenger Cup starts with places 25-36 and the 4 teams from the Open Qualifier, and it has a format, which doesn&apos;t exist anywhere else in this simulator: a <b>League Phase</b>. Its 16 teams are dealt into <b>4 Pots</b> of 4 teams,
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
                And the table was really tight in my Global Challenger Cup #1: five teams won 3 of their 4 matches. Team Magenta from Pot 1 finished first thanks to the best Sets and Rounds Difference,
                and Team Amber from Pot 3 made it into the top 4 as well, while Team Coral, also with 3 wins, had the worst Rounds Difference of them and had to go through the Knockout Play-offs.
                Team Charcoal, the best seeded team of the whole Cup, only finished 12th, and Team Periwinkle lost all four of its matches.
                Team Jade, the champion of{" "}
                <InfoLink onClick={scrollToAnchor("pem-cst", "pem-small")} href="?page=pem-small#pem-cst">Champions Series Tour #1</InfoLink>, finished 7th:
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
                All four Knockout Play-offs went to the Decider, and Team Plum, the 10th one, went the furthest of those teams: it beat Team Jade, then Team Royal (2nd) in the Quarterfinals, and only lost its Semifinal against Team Chartreuse.
                Team Amber beat Team Coral and then Team Magenta, the 1st one, 2:1 in the Semifinal.
                And so, the Grand Final was Team Chartreuse against Team Amber: Team Chartreuse won the first two sets (the first one 16-13 in Overtime), Team Amber the next two (the fourth one 19-16 in Double Overtime), and Team Chartreuse took the fifth set 13-9. Team Plum beat Team Magenta 2:1 for the Third Place.
                Same as all the other Tier 2 tournaments, the Winners&apos; screen has neither quotes nor a trophy:
            </p>
            <GplShot n={9} alt="Winners' screen of Global Challenger Cup #1" width="28vw" />
            <p className={css.info_text}>
                The Pick&apos;em summary counts the League Phase matches together and then every round of the Knockout Stage. The Third Place Decider and the Grand Final are only mentioned, if I guessed them.
                And this one, I lost: 88 out of 121 needed Pick&apos;em points.
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
                ). They are exactly as big as the Stages of Official: 16 teams in each Stage, 3 wins to go through, 3 losses to fly out, and 8 teams go through.
                <b>BUT</b>, there are only two of them, and there is no Best of 1 here at all: in Stage I, every single match is <b>Best of 3</b>:
            </p>
            <GplShot n={12} alt="Stage I of Global Pro League #1 before the first match" />
            <GplShot n={13} alt="Match modal of the first Stage I match" width="35vw" />
            <p className={css.info_text}>
                Team Khaki and Team Mint, which came through the{" "}
                <InfoLink onClick={scrollToAnchor("pem-qualifier", "pem-small")} href="?page=pem-small#pem-qualifier">PEM Small Tournament Qualifier</InfoLink>{" "}
                and the{" "}
                <InfoLink onClick={scrollToAnchor("big-qualifier", "pem-big")} href="?page=pem-big#big-qualifier">PEM Big Tournament Qualifier</InfoLink>{" "}
                before, won Stage I with 3:0. The highest seeded team in Stage I, Team Red, went through with 3:1, and Team Olive and Team White flew out without a single win:
            </p>
            <GplShot n={14} alt="Finished Stage I of Global Pro League #1" />
            <p className={css.info_text}>
                Then <b>Stage II</b> starts right away with the 8 auto-qualifiers and the 8 teams from Stage I. Here, it&apos;s the same as in Stage III of Official:
                the 0:0, 1:0, 0:1 and 1:1 matches are <b>Best of 3</b>, all Progression and Elimination matches (2:0, 2:1, 1:2, 0:2 and 2:2) are <b>Best of 5</b>.
                In the top left corner, the navigation lets you look back at Stage I:
            </p>
            <GplShot n={15} alt="Stage II of Global Pro League #1 before the first match, with the navigation" />
            <p className={css.info_text}>
                Team Blue and Team Indigo went through with 3:0, Team Blue with a 3:0 against Team Red in the 2:0 net. But this time, three auto-qualifiers didn&apos;t make it: Team Navy lost all three of its matches,
                Team Gray finished 1:3 and Team Silver lost its Deciding Match 1:3 against Team Lime. Three teams from Stage I took their places: Team Mint (3:1), Team Salmon (3:2)
                and Team Cyan, which lost its first two matches and then won three Best of 5s in a row (3:2 against Team Crimson, 3:1 against Team Gray and 3:2 against Team Khaki):
            </p>
            <GplShot n={16} alt="Finished Stage II of Global Pro League #1" />
            <p className={css.info_text}>
                The Playoffs are the standard 8-team ones: Quarterfinals, Semifinals, Third Place Decider and Grand Final. The teams are seeded by their records in Stage II,
                so the 3:0 teams are on top and the best two of them could only meet in the Grand Final. The formats are exactly the same as in the Playoffs of Official:
                the Quarterfinals are <b>Best of 5</b>, the Semifinals and the Third Place Decider are <b>Best of 7</b> and the Grand Final is <b>Best of 9</b>:
            </p>
            <GplShot n={17} alt="Playoffs of Global Pro League #1 before the Quarterfinals" />
            <p className={css.info_text}>
                Team Blue didn&apos;t lose a single set: 3:0 against Team Cyan and 4:0 against Team Black, which had beaten Team Mint 3:2.
                On the other side, Team Indigo beat Team Lime 3:1 and then Team Yellow 4:3, in the seventh set.
                So, the Grand Final was Team Blue against Team Indigo, for the third tournament in a row. The prediction gave Team Indigo only <b>8%</b>:
            </p>
            <GplShot n={18} alt="Match modal of the Grand Final of Global Pro League #1" width="35vw" />
            <GplShot n={19} alt="Series screen of the Bo9 Grand Final with the Global Pro League trophy" width="30vw" caption="(The trophy icon in the series screen is the Global Pro League trophy now)" />
            <p className={css.info_text}>
                Team Indigo won the second and the fourth set (both 13-11), but Team Blue won the Grand Final 5:2. Team Yellow won the Third Place 4:2 against Team Black.
                The Global Pro League has its own trophy: a black one with a <b>golden globe</b> on top, which Team Blue holds on the Winners&apos; screen the same way as all the other trophies:
            </p>
            <GplShot n={20} alt="Winners' screen of Global Pro League #1 with the Global Pro League trophy" width="28vw" />
            <p className={css.info_text}>
                The Pick&apos;em summary looks like the one of Official, with 33 matches per Stage, only with two Stages instead of three. And finally, I won a Pick&apos;em challenge again: 223 out of 182 needed Pick&apos;em points:
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
                both of them count as much. Team Blue has three different trophies now and its Unbeaten Streak went up to 16. Team Chartreuse got a 🥇 for the Global Challenger Cup, Team Indigo has its third 🥈 and,
                same as with every other Tier 1 or Tier 2 tournament, the 2nd and 3rd places count into the 🥈 and 🥉 totals:
            </p>
            <GplShot n={23} alt="Leaderboard after Global Pro League #1" />
            <p className={css.info_text}>
                The changes in the Leaderboard are only from the Global Pro League, not from the Global Challenger Cup, since both of them are tournaments of their own.
                Team Yellow gained the most points among the top teams (137) and went 3 places up to the 3rd place, and Team Mint, which started in Stage I, went 8 places up to the 9th one with 100 more points.
            </p>
            <p className={css.info_text}>
                In the Hall of Fame, there are three new cards: the Global Pro League card with its trophy above the name and the top four, the Global Challenger Cup card, the same as the other Tier 2 cards, and the card of the Open Qualifier with the Qualifier badge:
            </p>
            <GplShot n={24} alt="Hall of Fame with the cards of Global Pro League #1, Global Challenger Cup #1 and its Open Qualifier" />
            <p className={css.info_text}>
                The Global Challenger Cup&apos;s summary starts with all teams and the 4 Pots, where the 4 teams from the Open Qualifier glow golden (hovering onto them says "via the Open Qualifier") and a link leads to the Open Qualifier&apos;s bracket. Then come the whole League Phase with its final table, the whole Knockout Stage and the podium.
                At the end, there are the places 5-12: the losers of the Quarterfinals are 5th to 8th and the losers of the Knockout Play-offs are 9th to 12th, each of them in the order of the matches,
                so the loser of Quarterfinal #1 is 5th:
            </p>
            <GplShot n={25} alt="Hall of Fame, Global Challenger Cup #1: all teams and the Pots with the glowing teams from the Open Qualifier" />
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

const PBS_IMAGES = import.meta.glob("../../../assets/images/pbs-*.png", { eager: true, import: "default" });
const pbsImg = (n) => PBS_IMAGES[`../../../assets/images/pbs-${String(n).padStart(2, "0")}.png`];

const PbsShot = ({ n, ...props }) => <PemShot src={pbsImg(n)} {...props} />;

const PbsSubPage = ({ scrollToAnchor }) => (
    <>
        <section>
            <div id="pbs-overview" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Hunting for bounties</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                The fifth option in the "Choose how you want to play" modal is the <b>Premier Bounty Series</b> (PBS), a Tier 1 tournament like no other one.
                It is only two tournaments: the <b>Premier Bounty Series Open Qualifier</b> and the Premier Bounty Series itself, with no Tier 2 tournament in between. And it doesn&apos;t even count with a "#": every edition is a <b>Season</b>,
                so the very first one is the <b>Premier Bounty Series Season 1</b>.
            </p>
            <PbsShot n={1} alt="Choose how you want to play modal with the Premier Bounty Series picked" />
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                The <b>top 28</b> of the Leaderboard and the 4 teams from the Open Qualifier play, and they are split into two Pots right at the start: <br />
                • Top 1-16 → <b>High-Seed Pot</b>. Every team of it carries a <b>bounty</b> of Bounty Gems: Seed #1 carries 60 of them, every next seed 3 less, down to 15 for Seed #16 <br />
                • Top 17-28 and the 4 qualifiers → <b>Low-Seed Pot</b>, with no bounty at all. Nothing to lose, everything to win <br />
                • Top 29-56 → Play in the <b>Open Qualifier</b> <br />
                • Top 57-64 → Start the Open Qualifier in its <b>Play-in</b>
            </p>
            <p className={css.info_text}>
                The "Stage dividers" select of the Leaderboard has a "Premier Bounty Series" option for it: one divider between both Pots, one before the Open Qualifier and one before its Play-in:
            </p>
            <PbsShot n={2} alt="Leaderboard with the divider between the High-Seed Pot and the Low-Seed Pot" />
            <PbsShot n={3} alt="Leaderboard with the divider between the Low-Seed Pot and the Open Qualifier" />
            <PbsShot n={40} alt="Leaderboard with the divider between the Open Qualifier and its Play-in" />
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                (The green and red numbers in the Leaderboard are still the changes from the Global Pro League here, since the Premier Bounty Series hasn&apos;t started yet.)
            </p>
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                Every single match is a team of the High-Seed Pot against a team of the Low-Seed Pot, and it&apos;s all single elimination: a loss and a team flies out.
                A High-Seed Pot team has a bounty on their heads: the higher the seed, the more is the bounty (up tp 60). The winner takes <b>half of the loser&apos;s bounty</b> (rounded), and the loser&apos;s bounty is gone, whatever is left of it.
                If the team with the worse seed wins, it also <b>takes over the seed</b> of the beaten team. So the bounties don&apos;t stay where they started: they travel from team to team, round after round.
            </p>
            <p className={css.info_text}>
                How a match itself is played, you can see in{" "}
                <InfoLink onClick={scrollToAnchor("start-match", "official")} href="?page=official#start-match">How to start a match?</InfoLink>{" "}
                of the Official tab. I chose the Premier Bounty Series explicitly and clicked "Start Game", right after{" "}
                <InfoLink onClick={scrollToAnchor("gpl-rewards", "gpl")} href="?page=gpl#gpl-rewards">Global Pro League #1</InfoLink>.
                The Open Qualifier comes first (see the next section), and once it is over, the Tournament Intro Screen of the Premier Bounty Series shows all 32 teams first and then both Pots, every team with its seed and its bounty below the circle:
            </p>
            <PbsShot n={4} alt="Tournament Intro Screen of Premier Bounty Series Season 1 with all teams and both Pots" />
        </section>
        <section>
            <div id="pbs-open-qualifier" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Premier Bounty Series Open Qualifier</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                Before the bounty hunt begins, the last 4 places of the Low-Seed Pot are played for in the <b>Premier Bounty Series Open Qualifier</b>.
                It is built the same way as the{" "}
                <InfoLink onClick={scrollToAnchor("gcc-open-qualifier", "gpl")} href="?page=gpl#gcc-open-qualifier">Global Challenger Cup Open Qualifier</InfoLink>:
                the 8 lowest teams (places 57-64) play the <b>Play-in</b> (4 Best of 3 matches) and its 4 winners join places 29-56 in <b>Group A</b> and <b>Group B</b>.
                But here, both Groups have <b>16 teams</b> (14 direct ones and 2 from the Play-in), so there are no byes: every team starts in the Opening Round and there is a Lower Round 1 again.
                It carries the "Season" of the Premier Bounty Series it qualifies for:
            </p>
            <PbsShot n={41} alt="Tournament Intro Screen of the Premier Bounty Series Open Qualifier" />
            <PbsShot n={42} alt="The Play-in of the Premier Bounty Series Open Qualifier before the first match" />
            <p className={css.info_text}>
                The Play-in winners go into the Opening Round against the two best seeds of each Group, which wait for them with a "TBD" below. Same as before, the Opening Round, the Upper Quarterfinals and the Upper Semifinals are <b>Best of 1</b>, the rest is <b>Best of 3</b>,
                and the winners of the Upper Finals and the Consolidation Finals qualify:
            </p>
            <PbsShot n={43} alt="Group B of the Premier Bounty Series Open Qualifier before the first match" />
            <p className={css.info_text}>
                In Group A, Team Royal beat Team Olive 2:0 in the Upper Final. And Team Jade, the champion of{" "}
                <InfoLink onClick={scrollToAnchor("pem-cst", "pem-small")} href="?page=pem-small#pem-cst">Champions Series Tour #1</InfoLink>, did something special:
                it lost its very first match 8-13 against Team Midnight and then won five Best of 3s in a row in the Lower Bracket (against Team Chocolate, Team Midnight, Team Frost, Team Sapphire and Team Blush),
                until Team Olive stopped it 2:0 in the Consolidation Final. In Group B, Team Beige beat Team White 2:0 in the Upper Final and Team White then beat Team Azure 2:0 in the Consolidation Final:
            </p>
            <PbsShot n={44} alt="The finished Lower Bracket of Group A of the Premier Bounty Series Open Qualifier" />
            <PbsShot n={45} alt="The 4 qualifiers of Premier Bounty Series Season 1" />
            <p className={css.info_text}>
                I won this Pick&apos;em challenge as well, 109 out of 99 needed Pick&apos;em points. After "Proceed", the 4 qualifiers take the seeds 29-32 of the Premier Bounty Series, at the very end of the Low-Seed Pot:
            </p>
            <PbsShot n={46} alt="Pick'em summary of the Premier Bounty Series Open Qualifier" width="30vw" />
        </section>
        <section>
            <div id="pbs-draft" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Live draft and the Stages</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                After "Continue", I land in <b>Stage I</b>, the <b>Round of 32</b>. But all 16 matches are still empty, because nobody has drawn them yet.
                Nobody draws them at all, actually: the teams pick their opponents themselves, in a <b>live draft</b>. It runs in a footer, which is reversed header of Hall of Fame's second header, at the bottom of the screen,
                with the Low-Seed Pot above and the High-Seed Pot below, both sorted by their seeds:
            </p>
            <PbsShot n={5} alt="The live draft of the Round of 32 is about to begin" />
            <p className={css.info_text}>
                First, the Low-Seed Pot takes its places. One by one, the teams fly out of the header into the left slots of the matches, Seed #17 into match #1, Seed #18 into match #2 and so on,
                and the page scrolls along with them:
            </p>
            <PbsShot n={6} alt="The Low-Seed Pot flies into the left slots of the matches" />
            <p className={css.info_text}>
                Then, the High-Seed Pot moves into the middle of the header and the picks begin. The best seed of the Low-Seed Pot picks first, so Team Orange (Seed #17) is highlighted
                and, like a real coach, it goes through the teams it is considering: the yellow ring jumps from circle to circle, until the decision is made and the chosen team flies into the right slot.
            </p>
            <PbsShot n={7} alt="Team Orange (Seed #17) is making the pick, the yellow ring jumps over the High-Seed Pot" />
            <p className={css.info_text}>
                Every coach weighs two things: the chance to win the match and the reward, which is half of the opponent&apos;s bounty (and its better seed).
                And every coach has its own character: most of them play it safe, some are ambitious and a few of them are real bounty hunters.
                That&apos;s why the header always says, what kind of pick it was: one "picks the most beatable opponent", another one "takes a calculated risk" and a third one "goes for the biggest bounty".
                Team Orange took a calculated risk with Team Gray (Seed #8, 39 Bounty Gems), while Team Teal, right after it, went for the most beatable opponent, Team Pink (Seed #14, 21 Bounty Gems):
            </p>
            <PbsShot n={8} alt="Team Orange takes a calculated risk: Team Gray flies into match #1" />
            <p className={css.info_text}>
                On the right side, there is the <b>Speed</b> select (1x, 2x, 4x or 8x), a pause button and an emerald button with the time left, which finishes the show right away.
                The speed starts at 1x again in every Stage. During the show, the page can&apos;t be scrolled by hand: the show itself scrolls to every team, which is picking, so nothing is ever hidden.
                And if the page is reloaded in the middle of it, the show goes on from the exact same moment, even in the middle of a flight.
            </p>
            <PbsShot n={9} alt="Team Charcoal (Seed #28) is making the pick, only five teams are left in the High-Seed Pot" />
            <p className={css.info_text}>
                The last team of the Low-Seed Pot doesn&apos;t have a choice anymore: Team White (Seed #32) got the only team left, Team Indigo (Seed #2, 57 Bounty Gems).
                Then the header slides down, the page scrolls back up and match #1 glows yellow as the current one:
            </p>
            <PbsShot n={10} alt="The Round of 32 after the draft, match #1 is the current one" />
            <p className={css.info_text}>
                All the matches of the Round of 32 are <b>Best of 3</b>. Since the seeds and the bounties are everything here, the match modal shows them above both circles.
                And the very first match was a clear one on paper: Team Gray had 100 points more than Team Orange (1,273 against 1,173) and was the favourite with 57.6%:
            </p>
            <PbsShot n={11} alt="Match modal of Round of 32 #1 with the seeds and bounties of Team Orange and Team Gray" width="35vw" />
            <PbsShot n={12} alt="Series screen of a Round of 32 match with the Premier Bounty Series trophy" width="30vw" caption="(The trophy icon in the series screen is the Premier Bounty Series trophy)" />
            <p className={css.info_text}>
                The stakes in the match modal have a second line now. The winner "qualifies to Round of 16" and, if it was the High-Seed Pot team, "keeps its bounty". If it was the Low-Seed Pot team, it "takes the bounty away".
                The loser "flies out of the tournament". Once the match is finished, the modal shows what changed: Team Gray won the Decider 16-14 in Overtime, so it kept its Seed #8 and all of its 39 Bounty Gems,
                while Team Orange flew out with nothing:
            </p>
            <PbsShot n={13} alt="Finished match modal of Round of 32 #1: Team Gray keeps Seed #8 and its 39 Bounty Gems" width="35vw" />
            <p className={css.info_text}>
                There were three upsets in the Round of 32: Team Teal (Seed #18) beat Team Pink (Seed #14), Team Brown (Seed #21) beat Team Red (Seed #12), and the biggest one of them:
                Team White, the very last seed, beat Team Indigo (Seed #2) 2:0, the first set 16-14 in Overtime. So Team White jumped from Seed #32 to <b>Seed #2</b> and took 29 of Team Indigo&apos;s 57 Bounty Gems.
                Everywhere else, the High-Seed Pot kept its bounties. The navigation in the top left corner leads back to Stage I at any moment:
            </p>
            <PbsShot n={14} alt="Finished Stage I of Premier Bounty Series Season 1" />
            <p className={css.info_text}>
                Right after the last match of the Round of 32, <b>Stage II</b> starts with its own Tournament Intro Screen. The 16 teams left are split into two Pots again, this time by their current seeds and bounties:
            </p>
            <PbsShot n={15} alt="Tournament Intro Screen of Stage II with the new Pots" />
            <p className={css.info_text}>
                And there is a new draft. The <b>Round of 16</b> is <b>Best of 3</b> as well, but every team here carries a bounty already, so there is nothing left to keep:
                whoever wins, "takes the bounty away". Its 8 matches are in two columns, so all of them fit on the screen:
            </p>
            <PbsShot n={16} alt="The live draft of the Round of 16" />
            <PbsShot n={17} alt="The Round of 16 after the draft" />
            <p className={css.info_text}>
                This time, the Low-Seed Pot hit back: four of the eight matches went to the underdogs. Team Mint (Seed #9) beat Team White 2:0, Team Salmon beat Team Gray 2:0
                and Team Green beat Team Cyan 2:0. But the biggest one was Team Chartreuse (Seed #16), the champion of
                <InfoLink onClick={scrollToAnchor("gcc", "gpl")} href="?page=gpl#gcc"> Global Challenger Cup #1</InfoLink>: it beat Team Blue, Seed #1 and the champion of three Tier 1 tournaments in a row, 2:0 (13-11 and 13-10).
                That was the end of Team Blue&apos;s Unbeaten Streak, and Team Chartreuse jumped from Seed #16 to <b>Seed #1</b> and from 15 to 45 Bounty Gems:
            </p>
            <PbsShot n={18} alt="Finished Stage II of Premier Bounty Series Season 1" />
            <p className={css.info_text}>
                The last 8 teams go to the <b>Finals</b>, again with a Tournament Intro Screen and again with a new draft.
                The Finals have the <b>Quarterfinals</b> (<b>Best of 5</b>) on the left, but they are not connected to the Semifinals: after the Quarterfinals, the 4 teams left are drafted one more time.
                And look at the Pots: Team Chartreuse is in the High-Seed Pot with Seed #1, while Team Black has more Bounty Gems (55) than Team Chartreuse (45), but only Seed #5:
            </p>
            <PbsShot n={19} alt="Tournament Intro Screen of the Finals with the Pots of the last 8 teams" />
            <PbsShot n={20} alt="The live draft of the Quarterfinals" />
            <p className={css.info_text}>
                Team Black went for exactly that Team Chartreuse. Team Green took Team Lime (Seed #4), Team Silver took Team Mint (Seed #2) and Team Salmon was left with Team Yellow (Seed #3):
            </p>
            <PbsShot n={21} alt="The Quarterfinals after the draft" />
            <p className={css.info_text}>
                In the Quarterfinals, the loser&apos;s stake text is "path ends here, for now!" and the winner&apos;s second line is the bounty again.
                And Team Black didn&apos;t give Team Chartreuse a single set: 3:0, the first one 16-13 in Overtime. So Team Black took over Seed #1, and 23 of Team Chartreuse&apos;s 45 Bounty Gems went to it:
            </p>
            <PbsShot n={22} alt="Finished match modal of Quarterfinal #1: Team Black beats Team Chartreuse 3:0" width="35vw" />
            <p className={css.info_text}>
                And the other three Quarterfinals went to the Low-Seed Pot as well: Team Green beat Team Lime 3:1, Team Mint beat Team Silver 3:2 and Team Salmon beat Team Yellow 3:2.
                Then, the draft of the <b>Semifinals</b> took place. As soon as a Semifinal is built, the circles in the Grand Final and in the Third Place Decider already show, which two teams can get there:
            </p>
            <PbsShot n={23} alt="The live draft of the Semifinals, the Grand Final and the Third Place Decider already show their contenders" />
            <p className={css.info_text}>
                The Semifinals and the Third Place Decider are <b>Best of 7</b>, the Grand Final is <b>Best of 9</b>. Both Semifinals went the full seven sets: Team Salmon beat Team Black 4:3 and took over its Seed #1,
                and Team Green lost the first three sets against Team Mint and then won four in a row. In the Third Place Decider, there is no bounty to win anymore (both losers of the Semifinals lost theirs),
                so it has no second stake line. Team Mint won it 4:3, the seventh set 13-11:
            </p>
            <PbsShot n={24} alt="The Finals after the Semifinals, the Grand Final is next" />
            <p className={css.info_text}>
                The Grand Final was Team Salmon (Seed #1, 124 Bounty Gems) against Team Green (Seed #2, 118 Bounty Gems), two teams, which started the whole Premier Bounty Series in the Low-Seed Pot. The prediction gave Team Green <b>46.6%</b>:
            </p>
            <PbsShot n={25} alt="Match modal of the Grand Final of Premier Bounty Series Season 1" width="35vw" />
            <PbsShot n={26} alt="Series screen of the Bo9 Grand Final" width="30vw" />
            <p className={css.info_text}>
                And it went all the way to the ninth set. Team Salmon won the third set 22-20 in Triple Overtime and led 4:3 after seven sets, but Team Green won the last two (13-10 and 13-9). 5:4, Team Green is the champion,
                and the Premier Bounty Series has its own trophy, a white one with an emerald Bounty Gem on top:
            </p>
            <PbsShot n={27} alt="Winners' screen of Premier Bounty Series Season 1 with the Premier Bounty Series trophy" width="28vw" />
            <p className={css.info_text}>
                The Pick&apos;em summary counts every round: the Rounds of 32 and 16, the Quarterfinals and the Semifinals, and the Third Place Decider and the Grand Final, if they were guessed.
                This time, I won it: 103 out of 76 needed Pick&apos;em points.
            </p>
            <PbsShot n={28} alt="Pick'em summary of Premier Bounty Series Season 1" width="30vw" />
            <p className={css.info_text}>
                One last thing about the bounties: a team which ends the tournament still holding a bounty, gets a <b>bonus</b> on top of its last match. The final bounty is divided by 4 and rounded up,
                and the result is added to the team&apos;s points as a free addition, outside of all the usual limits. It has its own green label below the usual points in the match modal.
                Team Green finished with <b>180 Bounty Gems</b> (118 of its own and 62 from Team Salmon), so it got +45 points on top of its +146:
            </p>
            <PbsShot n={29} alt="Finished match modal of the Grand Final with the +45 bounty bonus of Team Green" width="35vw" />
            <PbsShot n={30} alt="Finished Finals of Premier Bounty Series Season 1 with the end buttons" />
        </section>
        <section>
            <div id="pbs-rewards" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>The emerald trophy and Hall of Fame</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                In the Leaderboard, the Premier Bounty Series trophy gets its own icon. It is worth more than the silver PEM trophy and less than the golden one, so it is placed between them.
                Team Green has it now, while Team Blue is still the 1st one with 1,742 points, even without its Unbeaten Streak. The 2nd and 3rd places count into the 🥈 and 🥉 totals, same as with every other Tier 1 tournament (see{" "}
                <InfoLink onClick={scrollToAnchor("pem-rewards", "pem-small")} href="?page=pem-small#pem-rewards">Trophies, medals and Hall of Fame</InfoLink>
                ):
            </p>
            <PbsShot n={31} alt="Leaderboard after Premier Bounty Series Season 1" />
            <p className={css.info_text}>
                Team Green gained 332 points in this tournament (the 45 points of the Bounty bonus are included in them) and went 11 places up to the 2nd place, and Team Salmon went 5 places up to the 5th one.
            </p>
            <p className={css.info_text}>
                In the Hall of Fame, there are two new cards: the card of the Premier Bounty Series with the trophy on top, then "Premier Bounty Series Season 1" and the top four, and the card of its Open Qualifier:
            </p>
            <PbsShot n={32} alt="Hall of Fame with the card of Premier Bounty Series Season 1" />
            <p className={css.info_text}>
                Its summary starts with all teams and both Pots with their seeds and bounties, where the 4 teams from the Open Qualifier glow golden, and a link to the Open Qualifier&apos;s bracket. Then come the whole Stage I, all teams to Stage II with their new seeds and bounties, the whole Stage II,
                all teams to the Finals, the Finals themselves, the podium with the trophy and the 5th-8th places. The losers of the Quarterfinals are 5th to 8th, in the order of the matches:
            </p>
            <PbsShot n={33} alt="Hall of Fame, Premier Bounty Series Season 1: all teams and both Pots" />
            <PbsShot n={34} alt="Hall of Fame, Premier Bounty Series Season 1: Stage I" />
            <PbsShot n={35} alt="Hall of Fame, Premier Bounty Series Season 1: the end of Stage I and all teams to Stage II" />
            <PbsShot n={36} alt="Hall of Fame, Premier Bounty Series Season 1: Stage II and all teams to the Finals" />
            <PbsShot n={37} alt="Hall of Fame, Premier Bounty Series Season 1: the Finals" />
            <PbsShot n={38} alt="Hall of Fame, Premier Bounty Series Season 1: the podium with the trophy" />
            <PbsShot n={39} alt="Hall of Fame, Premier Bounty Series Season 1: the places 5-8" />
            <p className={css.info_text}>
                And the Open Qualifier&apos;s summary looks the same as the one of the Global Challenger Cup Open Qualifier: all teams, the Play-in, both Group brackets and the qualified teams with a link to the summary of the Premier Bounty Series:
            </p>
            <PbsShot n={47} alt="Hall of Fame, Premier Bounty Series Open Qualifier Season 1: all teams and the Play-in" />
            <PbsShot n={48} alt="Hall of Fame, Premier Bounty Series Open Qualifier Season 1: the qualified teams and the link to the Premier Bounty Series" />
            <p className={css.info_text}>
                And now, there are five tournaments to choose from: <b>Official</b>, <b>PEM Small Tournament</b>, <b>PEM Big Tournament</b>, <b>Global Pro League</b> and <b>Premier Bounty Series</b>.
                Four of them are waiting for their #2, one for its Season 2. Who is going to hunt the bounties next time? (And there is one more tournament, which is played in a different city every time, see the{" "}
                <InfoLink onClick={scrollToAnchor("pgx-overview", "pgx")} href="?page=pgx#pgx-overview">PGX</InfoLink> tab.)
            </p>
        </section>
    </>
);

const PGX_IMAGES = import.meta.glob("../../../assets/images/pgx-*.png", { eager: true, import: "default" });
const pgxImg = (n) => PGX_IMAGES[`../../../assets/images/pgx-${String(n).padStart(2, "0")}.png`];

const PgxShot = ({ n, ...props }) => <PemShot src={pgxImg(n)} {...props} />;

const PgxSubPage = ({ scrollToAnchor }) => (
    <>
        <section>
            <div id="pgx-overview" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>A city of its own</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                The sixth option in the "Choose how you want to play" modal is the <b>PGX Grandmasters</b>, a Tier 1 tournament, which, for the first time, includes nearly every team of the Leaderboard.
                Same as the PEM Tournaments, it is three tournaments, played one after another, but here, every one of them is a step on the same ladder: <br />
                • <b>PGX Candidate Masters</b> (Qualifier): its 4 best teams go up to the International Masters <br />
                • <b>PGX International Masters</b> (Tier 2): only its winner goes up to the Grandmasters <br />
                • <b>PGX Grandmasters</b> itself (Tier 1)
            </p>
            <PgxShot n={1} alt="Choose how you want to play modal with the PGX Grandmasters picked" />
            <p className={css.info_text}>
                And every edition is played in its own <b>host city</b>. When the PGX Grandmasters is started, a city is drawn from the cities, which have already hosted big tournaments in North America, Europe, Asia and Australia
                (never the same city twice in a row), and all three tournaments carry its name. My very first one took place in <b>Jönköping</b>, so it was the <b>PGX Grandmasters Jönköping #1</b>.
                The city stays with the tournament everywhere: in the titles, in the series screen, in the Hall of Fame and even in the title of the Leaderboard after it.
            </p>
            <p style={{ marginTop: '12px' }} className={css.info_text}>
                The teams are seeded by the Leaderboard at the moment the PGX Grandmasters is started: <br />
                • Top 1-15 → Invited straight to the <b>PGX Grandmasters</b> <br />
                • Top 16-26 → Start in the <b>Main Bracket</b> of the International Masters <br />
                • Top 27-32 → Start in the <b>Entry Round</b> of the International Masters <br />
                • Top 33-40 → Start in the <b>Group Stage</b> of the Candidate Masters <br />
                • Top 41-64 → Start in the <b>Play-ins</b> of the Candidate Masters
            </p>
            <p className={css.info_text}>
                The "Stage dividers" select of the Leaderboard has a "PGX Grandmasters" option as well, with a divider before every one of these places:
            </p>
            <PgxShot n={2} alt="Leaderboard with the divider between the PGX Grandmasters and the PGX International Masters" />
            <PgxShot n={3} alt="Leaderboard with the divider between the Main Bracket and the Entry Round" />
            <PgxShot n={4} alt="Leaderboard with the divider between the International Masters and the Group Stage of the Candidate Masters" />
            <PgxShot n={5} alt="Leaderboard with the divider between the Group Stage and the Play-ins of the Candidate Masters" />
            <p className={css.info_text}>
                How a match itself is played, you can see in{" "}
                <InfoLink onClick={scrollToAnchor("start-match", "official")} href="?page=official#start-match">How to start a match?</InfoLink>{" "}
                of the Official tab. I chose the PGX Grandmasters explicitly and clicked "Start Game", right after{" "}
                <InfoLink onClick={scrollToAnchor("pbs-rewards", "pbs")} href="?page=pbs#pbs-rewards">Premier Bounty Series Season 1</InfoLink>.
            </p>
        </section>
        <section>
            <div id="pgx-cm" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>PGX Candidate Masters</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                The first step is the <b>PGX Candidate Masters</b>, a Qualifier for the 32 lowest teams. Its Tournament Intro Screen shows them split by where they start: the 8 teams of the Group Stage (places 33-40) and the 24 teams of the Play-ins (places 41-64):
            </p>
            <PgxShot n={6} alt="Tournament Intro Screen of PGX Candidate Masters Jönköping #1" />
            <p className={css.info_text}>
                The <b>Play-ins</b> are two knockout rounds, all <b>Best of 3</b>. In <b>Play-in Round 1</b>, places 49-64 play each other (the best of them against the worst one and so on),
                and in <b>Play-in Round 2</b>, places 41-48 wait for them: the best of them meets the winner of the closest match of Round 1 (56th against 57th), the worst of them meets the winner of 49th against 64th. The 8 winners of Round 2 go to the Group Stage:
            </p>
            <PgxShot n={7} alt="The Play-ins of the Candidate Masters before the first match" />
            <PgxShot n={8} alt="Match modal of Play-in Round 1 #1" width="35vw" />
            <p className={css.info_text}>
                Team Spring, the 57th team, won both of its Play-ins 2:0, the second one against Team Emerald, the best team of Round 2. Team Copper, the very last one, beat Team Sapphire and Team Wine, and Team Midnight and Team Apricot went through both rounds as well:
            </p>
            <PgxShot n={9} alt="The finished Play-ins of the Candidate Masters" />
            <p className={css.info_text}>
                Once the Play-ins are over, the <b>Group Stage</b> starts right away and a new navigation shows up on the left: <b>Play-ins</b>, <b>Group Stage</b> and <b>Deciders</b>, every phase as soon as it exists, so you can always look back.
                The Group Stage has <b>Groups A-D</b> with 4 teams each: the places 33-40 and the 8 Play-in winners are drawn from 4 Pots, so every Group gets two teams of each kind,
                and only while you are on the Group Stage, the "Group A | Group B | Group C | Group D" navigation at the top lets you switch between them (it stays below the title, while scrolling, same as in the{" "}
                <InfoLink onClick={scrollToAnchor("big-main-event", "pem-big")} href="?page=pem-big#big-main-event">PEM Big Tournament</InfoLink>).
                Every Group is the same small Double Elimination bracket as in Stage I of the PEM Big Tournament, but the <b>Opening Round is Best of 1</b>, while the Winners&apos; Match, the Elimination Match and the Decider Match are <b>Best of 3</b>.
                The winner of the Winners&apos; Match is 1st of the Group, the winner of the Decider Match is 2nd:
            </p>
            <PgxShot n={10} alt="The finished Group C of the Candidate Masters with the vertical navigation on the left and the Group navigation at the top" />
            <p className={css.info_text}>
                Remember Team Honey from{" "}
                <InfoLink onClick={scrollToAnchor("big-ecl", "pem-big")} href="?page=pem-big#big-ecl">Elite Competition League #1</InfoLink>? Here, it started in the Group Stage as the 35th team, beat Team Midnight 13-2,
                lost the Winners&apos; Match 1:2 against Team Frost and then beat that same Team Midnight 2:0 in the Decider Match. Keep an eye on it.
            </p>
            <p className={css.info_text}>
                The 1st and the 2nd team of every Group then play the <b>Deciders</b>, 4 matches crosswise: 1st of Group A against 2nd of Group B, 1st of Group B against 2nd of Group A, and the same with Groups C and D. All of them are <b>Best of 3</b>
                and the 4 winners qualify for the International Masters. Team Blush beat Team Azure 2:1, Team Jade beat Team Ivory 2:0, Team Frost beat Team Apricot 2:1 and Team Honey beat Team Ruby 2:1:
            </p>
            <PgxShot n={11} alt="The finished Deciders of the Candidate Masters with the end buttons" />
            <PgxShot n={12} alt="The 4 qualifiers of PGX Candidate Masters Jönköping #1" />
            <p className={css.info_text}>
                And the Pick&apos;em challenge? Lost by a single point: 79 out of 80 needed Pick&apos;em points. Painful.
            </p>
            <PgxShot n={13} alt="Pick'em summary of the Candidate Masters" width="30vw" />
        </section>
        <section>
            <div id="pgx-im" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>PGX International Masters</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                The second step is the <b>PGX International Masters</b>, a Tier 2 tournament with 21 teams: places 16-26 start right in the Main Bracket, while places 27-32 and the 4 teams from the Candidate Masters (which glow golden) have to go through the Entry Round first:
            </p>
            <PgxShot n={14} alt="Tournament Intro Screen of PGX International Masters Jönköping #1" />
            <p className={css.info_text}>
                The <b>Entry Round</b> has 5 <b>Best of 3</b> matches, and the qualifiers get it the hard way: they play against the best teams of the Entry Round. The 5 winners join the 11 teams of the Main Bracket.
                The navigation on the left has the <b>Entry Round</b> and, once it is over, the <b>Main Bracket</b>:
            </p>
            <PgxShot n={15} alt="The Entry Round of the International Masters before the first match" />
            <PgxShot n={16} alt="Match modal of the first Entry Round match" width="35vw" />
            <p className={css.info_text}>
                All 4 qualifiers made it: Team Frost beat Team Magenta, Team Blush beat Team Gold, Team Honey beat Team Charcoal and Team Jade beat Team Royal, and Team Olive beat Team Beige for the fifth spot.
                The <b>Main Bracket</b> is a Double Elimination bracket with a Grand Final, exactly like the one of the{" "}
                <InfoLink onClick={scrollToAnchor("big-ecl", "pem-big")} href="?page=pem-big#big-ecl">Elite Competition League</InfoLink>: the Opening Round, the Upper Quarterfinals and the Upper Semifinals are <b>Best of 1</b>,
                the Grand Final is <b>Best of 5</b> and all the other matches are <b>Best of 3</b>. But here, there are no medals to share: <b>only the winner</b> goes up to the Grandmasters.
            </p>
            <p className={css.info_text}>
                And that winner was Team Honey again. It lost its Opening Round 10-13 against Team Brown and then won every single Best of 3 in the Lower Bracket: against Team Violet, Team White, Team Pink, Team Brown (2:0, revenge!),
                Team Crimson in the Lower Final and Team Teal in the Consolidation Final. And in the Grand Final, it beat Team Amber, which had won the Upper Bracket, 3:1:
            </p>
            <PgxShot n={17} alt="The finished Upper Bracket of the International Masters with the Grand Final" />
            <PgxShot n={18} alt="The finished Lower Bracket of the International Masters" />
            <p className={css.info_text}>
                The Winners&apos; Screen is a Tier 2 one, so there are no quotes and the winner gets a 🥇. But the winner also gets a golden <b>"Qualified to PGX Grandmasters"</b> badge with the PGX trophy on its podium:
            </p>
            <PgxShot n={19} alt="Winners' screen of PGX International Masters Jönköping #1 with the Qualified to PGX Grandmasters badge" />
            <p className={css.info_text}>
                This Pick&apos;em challenge, I won: 68 out of 54 needed Pick&apos;em points.
            </p>
            <PgxShot n={20} alt="Pick'em summary of the International Masters" width="30vw" />
        </section>
        <section>
            <div id="pgx-gm" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>PGX Grandmasters</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                The last step is the <b>PGX Grandmasters</b>: the 15 teams invited via the Leaderboard and the winner of the International Masters, Team Honey, which started the whole PGX Grandmasters as the 35th team:
            </p>
            <PgxShot n={21} alt="Tournament Intro Screen of PGX Grandmasters Jönköping #1" />
            <p className={css.info_text}>
                It starts with one <b>Swiss Stage</b> of 16 teams, the same as the Stages of{" "}
                <InfoLink onClick={scrollToAnchor("swiss-stage", "official")} href="?page=official#swiss-stage">Official</InfoLink>: 3 wins to go through, 3 losses to fly out and 8 teams go through. But here, <b>every single match is Best of 3</b>, from the 0:0 net to the 2:2 net:
            </p>
            <PgxShot n={22} alt="The Swiss Stage of PGX Grandmasters Jönköping #1 before the first match" />
            <PgxShot n={23} alt="Match modal of the first Swiss Stage match" width="35vw" />
            <p className={css.info_text}>
                The PGX Grandmasters has its own trophy, a silver one with golden details, and the series screen shows it in its medallion:
            </p>
            <PgxShot n={24} alt="Series screen of a Swiss Stage match with the PGX trophy" width="30vw" />
            <p className={css.info_text}>
                Team Blue and Team Silver went through with 3:0. And Team Honey? It lost its first two matches against Team Yellow and Team Khaki, so it stood at 0:2, one loss away from the exit.
                And then it won three Best of 3s in a row: against Team Black, Team Cyan and, in the 2:2 net, against that same Team Khaki, 2:0:
            </p>
            <PgxShot n={25} alt="The finished Swiss Stage of PGX Grandmasters Jönköping #1" />
            <p className={css.info_text}>
                The Playoffs are the standard 8-team ones, but with their own formats: the Quarterfinals are <b>Best of 3</b>, the Semifinals and the Third Place Decider are <b>Best of 5</b> and the Grand Final is <b>Best of 7</b>.
                Team Honey&apos;s journey ended there, 1:2 against Team Silver. Team Green beat Team Silver 3:2 in the Semifinal, Team Blue didn&apos;t lose a single set against Team Salmon and Team Indigo,
                and in the Grand Final, Team Blue beat Team Green 4:1. Team Indigo took the Third Place 3:2 against Team Silver:
            </p>
            <PgxShot n={26} alt="The finished Playoffs of PGX Grandmasters Jönköping #1 with the end buttons" />
            <PgxShot n={27} alt="Winners' screen of PGX Grandmasters Jönköping #1 with the PGX trophy" width="28vw" />
            <p className={css.info_text}>
                And the last Pick&apos;em challenge of Jönköping was won as well: 130 out of 109 needed Pick&apos;em points.
            </p>
            <PgxShot n={28} alt="Pick'em summary of PGX Grandmasters Jönköping #1" width="30vw" />
        </section>
        <section>
            <div id="pgx-rewards" style={{ marginTop: '24px' }} className={css.divider_container}>
                <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>The PGX trophy and Hall of Fame</h3>
                <div className={css.divider} />
            </div>
            <p className={css.info_text}>
                The PGX trophy gets its own icon in the Leaderboard, worth the same as the silver PEM trophy, and the title of the Leaderboard tells the city as well: "Leaderboard after PGX Grandmasters Jönköping #1".
                Team Blue is still the 1st one, now with one more trophy and a new Unbeaten Streak of 6:
            </p>
            <PgxShot n={29} alt="Leaderboard after PGX Grandmasters Jönköping #1" />
            <p className={css.info_text}>
                In the Hall of Fame, there are three new cards, all with the city in their names: the PGX Grandmasters card with the trophy on top, the International Masters card with the "Qualified to PGX Grandmasters" badge below its winner, and the Candidate Masters card with the Qualifier badge and its 4 qualifiers:
            </p>
            <PgxShot n={30} alt="Hall of Fame with the cards of PGX Grandmasters Jönköping #1" />
            <p className={css.info_text}>
                The Candidate Masters&apos; summary starts with all teams, split into the Group Stage and the Play-ins. Then come the Play-ins, all teams to the Group Stage, the Group Stage (one Group at a time, with the Group navigation, which stays below the title),
                all teams to the Deciders, the Deciders and the qualified teams with a link to the International Masters:
            </p>
            <PgxShot n={31} alt="Hall of Fame, PGX Candidate Masters Jönköping #1: all teams and the Play-ins" />
            <PgxShot n={32} alt="Hall of Fame, PGX Candidate Masters Jönköping #1: the Group Stage with its navigation and the Deciders" />
            <PgxShot n={33} alt="Hall of Fame, PGX Candidate Masters Jönköping #1: the qualified teams and the link to the International Masters" />
            <p className={css.info_text}>
                The International Masters&apos; summary has all teams, split into the Main Bracket and the Entry Round, where the 4 qualifiers glow golden (hovering onto them says "via the Candidate Masters") and a link leads back to the Candidate Masters.
                Then come the Entry Round, all teams to the Main Bracket, the Main Bracket and the podium with the badge, and a link to the Grandmasters:
            </p>
            <PgxShot n={34} alt="Hall of Fame, PGX International Masters Jönköping #1: all teams with the glowing qualifiers and the Entry Round" />
            <PgxShot n={35} alt="Hall of Fame, PGX International Masters Jönköping #1: the podium with the Qualified to PGX Grandmasters badge" />
            <p className={css.info_text}>
                And the Grandmasters&apos; summary has all teams, where Team Honey glows golden ("via the International Masters") with a link to the International Masters, then the Swiss Stage, all teams to the Playoffs, the Playoffs, the podium with the trophy and the 5th-8th places:
            </p>
            <PgxShot n={36} alt="Hall of Fame, PGX Grandmasters Jönköping #1: all teams, the link to the International Masters and the Swiss Stage" />
            <PgxShot n={37} alt="Hall of Fame, PGX Grandmasters Jönköping #1: the podium with the PGX trophy" />
            <p className={css.info_text}>
                And now, there are six tournaments to choose from: <b>Official</b>, <b>PEM Small Tournament</b>, <b>PEM Big Tournament</b>, <b>Global Pro League</b>, <b>Premier Bounty Series</b> and <b>PGX Grandmasters</b>.
                Which city is going to be next?
            </p>
        </section>
    </>
);

const INFO_SUB_PAGES = [
    {
        id: "official",
        label: <>General Mechanics /<br />Official Skylines /<br/>Official</>,
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
        label: <>Global Challenger Cup Open Qualifier /<br />Global Challenger Cup /<br />Global Pro League</>,
        sections: GPL_SECTIONS,
        Content: GplSubPage,
    },
    {
        id: "pbs",
        label: <>Premier Bounty Series Open Qualifier /<br />Premier Bounty Series</>,
        sections: PBS_SECTIONS,
        Content: PbsSubPage,
    },
    {
        id: "pgx",
        label: <>PGX Candidate Masters /<br />PGX International Masters /<br />PGX Grandmasters</>,
        sections: PGX_SECTIONS,
        Content: PgxSubPage,
    },
];

const SUB_PAGE_SEARCH_PARAM = "page";

const VISIBLE_SUB_PAGES = 4;

const MAX_TAB_START = Math.max(0, INFO_SUB_PAGES.length - VISIBLE_SUB_PAGES);

const clampTabStart = (start) => Math.max(0, Math.min(MAX_TAB_START, start));

const tabStartShowing = (start, index) =>
    index < start ? clampTabStart(index) : index >= start + VISIBLE_SUB_PAGES ? clampTabStart(index - VISIBLE_SUB_PAGES + 1) : start;

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
    const [tabStart, setTabStart] = useState(() =>
        tabStartShowing(0, INFO_SUB_PAGES.findIndex((page) => page.id === activeSubPage.id))
    );
    const [tabWindow, setTabWindow] = useState({ x: 0, width: null, animate: false });
    const hasMeasuredWindowRef = useRef(false);

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

    useLayoutEffect(() => {
        const measure = (animate) => {
            const tabs = tabsRef.current?.querySelectorAll("[data-sub-page-tab]");
            const first = tabs?.[tabStart];
            const last = tabs?.[Math.min(tabs.length, tabStart + VISIBLE_SUB_PAGES) - 1];
            if (!first || !last) return;
            setTabWindow({ x: first.offsetLeft, width: last.offsetLeft + last.offsetWidth - first.offsetLeft, animate });
        };

        measure(hasMeasuredWindowRef.current);
        hasMeasuredWindowRef.current = true;

        const handleResize = () => measure(false);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [tabStart]);

    useEffect(() => {
        const active = tabsRef.current?.querySelector("[data-sub-page-active='true']");
        const strip = tabsRef.current?.parentElement;
        if (!active || !strip || strip.scrollWidth <= strip.clientWidth || !window.matchMedia("(max-width: 1023.98px)").matches) return;
        strip.scrollLeft = active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2;
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
        setTabStart((start) => tabStartShowing(start, INFO_SUB_PAGES.findIndex((page) => page.id === id)));
        setSearchParams({ [SUB_PAGE_SEARCH_PARAM]: id }, { replace: true });
    };

    const scrollTabs = (direction) => setTabStart((start) => clampTabStart(start + direction));

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

    const renderSubPageArrow = (direction) => {
        const isHidden = direction < 0 ? tabStart <= 0 : tabStart >= MAX_TAB_START;
        const Icon = direction < 0 ? IoIosArrowBack : IoIosArrowForward;
        return (
            <button
                type="button"
                aria-label={direction < 0 ? "Previous tournaments" : "Next tournaments"}
                aria-hidden={isHidden}
                tabIndex={isHidden ? -1 : 0}
                onClick={() => scrollTabs(direction)}
                className={`${css.sub_page_button} ${css.sub_page_arrow} ${isHidden ? css.sub_page_arrow_hidden : ""}`}
            >
                <Icon />
            </button>
        );
    };

    const tabTransition = tabWindow.animate ? { type: "tween", duration: 0.3, ease: "easeInOut" } : { duration: 0 };

    const renderSubPageNavigation = () => (
        <div ref={headerRef} className={css.second_header}>
            <div className={css.sub_page_strip}>
                {renderSubPageArrow(-1)}
                <motion.div
                    className={css.sub_page_window}
                    initial={false}
                    animate={{ width: tabWindow.width ?? "auto" }}
                    transition={tabTransition}
                >
                    <motion.nav
                        ref={tabsRef}
                        className={css.sub_page_navigation}
                        initial={false}
                        animate={{ x: -tabWindow.x }}
                        transition={tabTransition}
                    >
                        {INFO_SUB_PAGES.map((page, index) => {
                            const isActive = page.id === activeSubPage.id;
                            const isVisible = index >= tabStart && index < tabStart + VISIBLE_SUB_PAGES;
                            return (
                                <button
                                    key={page.id}
                                    type="button"
                                    data-sub-page-tab
                                    data-sub-page-active={isActive}
                                    tabIndex={isVisible ? 0 : -1}
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
                    </motion.nav>
                </motion.div>
                {renderSubPageArrow(1)}
            </div>
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