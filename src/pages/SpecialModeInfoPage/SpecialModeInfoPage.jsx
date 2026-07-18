import React, { useState, useEffect, useRef, useCallback } from "react";
import css from './SpecialModeInfoPage.module.css'
import { Link } from "react-router-dom";
import introImg from "../../../assets/images/image.png";
import scoreBoardImg from "../../../assets/images/image-2.png";
import dashedDividerImg from "../../../assets/images/image-3.png";
import dashedDividerTwoImg from "../../../assets/images/image-4.png";
import tournamentIntroScreenImg from "../../../assets/images/image-5.png";
import tournamentIntroScreenHoverImg from "../../../assets/images/image-5.5.png";
import swissStageImg from "../../../assets/images/image-6.png";
import locatedMatchRect from "../../../assets/images/image-6.5.png";
import matchModal from "../../../assets/images/image-7.png";
import chosenLeftTeamModal from "../../../assets/images/image-8.png";
import chosenRightTeamModal from "../../../assets/images/image-8.5.png";
import seriesScreen from "../../../assets/images/image-9.png";
import miniRoundWonAmber from "../../../assets/images/image-10.png";
import miniRoundWonAzure from "../../../assets/images/image-11.png";
import matchPointImg from "../../../assets/images/image-12.png";
import teamAmberGoesTo10Net from "../../../assets/images/image-13.png";
import finishedMatchModalImg from "../../../assets/images/image-14.png";
import finishedMatchModalTwoImg from "../../../assets/images/image-14.1.png";
import finishedMatchModalThreeImg from "../../../assets/images/image-15.png";
import stageTwoQualifiersImg from "../../../assets/images/image-16.png";
import stageTwoImg from "../../../assets/images/image-17.png";
import playoffsImg from "../../../assets/images/image-18.png";
import playoffsQualifiersImg from "../../../assets/images/image-19.png";
import winnersScreenImg from "../../../assets/images/image-20.png";
import pickemSummaryImg from "../../../assets/images/image-21.png";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

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

const SECTIONS = [
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
    }
];

const SpecialModeInfoPage = () => {
    const [activeSection, setActiveSection] = useState("starting-off");
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const navRef = useRef(null);
    
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
    }, [activeSection]);
    
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

            let current = SECTIONS[0].id;

            for (const section of SECTIONS) {
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
    }, [isAutoScrolling]);

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

        window.scrollTo({
            top: y,
            behavior: "smooth",
        });

        setTimeout(() => {
            setIsAutoScrolling(false);
        }, 1000);
    };

    const scrollToDuringMatch = (e) => {
        e.preventDefault();
        document.getElementById("during-match")?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToDistributionExplained = (e) => {
        e.preventDefault();
        document.getElementById("distribution-explained")?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToLeaderboardExplained = (e) => {
        e.preventDefault();
        document.getElementById("leaderboard-explained")?.scrollIntoView({ behavior: "smooth" });
    };


    const renderInfoNavigation = () => {
        return (
            <div
                ref={navRef}
                className={css.infoNavigation}
            >
                {SECTIONS.map((section) => (
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
                <section>
                    <div style={{ marginTop: '24px' }} className={css.divider_container}>
                        <h3 id="starting-off" style={{ marginTop: '12px' }} className={css.title}>Starting off</h3>
                        <div className={css.divider} />
                    </div>
                    <p className={css.info_text}>
                        Special Mode is a tournament-style gambling mode.
                        It includes 64 teams, each being a specific color.
                        Throughout the tournament, they will have opportunities to play against other teams and gain placement points to become higher in the <b>Leaderboard</b>.
                        The rules, the matches and how the whole tournament goes on, it all will be explained throughout this Info Page.
                    </p>
                    <p className={css.info_text}>
                        When firstly clicking on the "Special" button and going onto this page, you will see the Intro Page (depicted below this text). <br />
                        Above you see already a familiar <b>header</b> with two buttons: "Restart the game?" and "Terminate the game?".
                        First restarts the tournament and redirects you to this page again & second redirects you to Home Page but doesn't restart the tournament.
                        Near those two, you will see an orange button, named as "Leaderboard". We will come to this in a minute, ok? <br />
                        Below the header, you see the encouraging text to the tournament and the button leading to this Info Page nearby. <br />
                        In the center there is an endless loop of different team circles, which tries to show, what colors are featured in the tournament. <br />
                        At the bottom, you see two buttons, which speak for themselves. <br />
                    </p>
                    <div className={css.image_container}>
                        <img src={introImg} alt="Intro Page" className={css.image} style={{ width: '34vw', height: '35vh' }} />
                    </div>
                    <p className={css.info_text}>
                        Before you even press <b>Start Game</b>, you can open this <b>Leaderboard</b> by clicking that orange button.
                        There you see all 64 teams, their points and placements.
                    </p>
                    <div className={css.image_container}>
                        <img src={scoreBoardImg} alt="Scoreboard" className={css.image} style={{ width: '34vw', height: '35vh' }} />
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
                        As you can read it, these should be dividers to show which Stages which teams autoqualify to. But wait, what are Stages meant here?
                        There are three stages throughout the whole tournament, which are being played in Swiss Format: <b>Stage I</b>, <b>Stage II</b> and <b>Stage III</b>. <br />
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
                            onClick={scrollToLeaderboardExplained}
                            href='#leaderboard-explained'
                        >
                            "Leaderboard format and points system"
                        </a>{" "}
                        section.
                    </p>
                    <p className={css.info_text}>
                        By clicking on the "Start Game" button, you will start playing the tournament. <br />
                        But first, you will be redirected to the "Tournament Intro Screen", where you see the overview of the qualifiers with their points for each stage one more time, in case you haven't seen the Leaderboard:
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
                    <p className={css.info_text}>
                        When you click "Continue", the tournament starts. You'll start from this: <br />
                    </p>
                    <div className={css.image_container}>
                        <img src={swissStageImg} alt="First look of Stage I" className={css.image} style={{ width: '37vw', height: '50vh' }} />
                        <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                            (Teams' distribution here depends on their placement in the top, but very first tournament has always the same qualifiers for every Stage, as well as Stage I. Exactly how the distribution system works, it all will be explained in the chapter <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={scrollToDistributionExplained} href='#distribution-explained'>"Distribution system in Swiss Stages"</a>)
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
                        ("Best of n" formats are explained in <a style={{ color: 'Highlight' }} onClick={scrollToDuringMatch} href='#during-match'>"What do I do during the match?"</a> section)
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
                        In Buchholz method, each team has its Buchholz score, which is that or that big, based on all the team's opponents' final records.
                        So for example, a team had an opponent, which finished 3:0 and then an opponent, which is in Round 4 with the record 2:1, then the Buchholz score is 3 + 2 = 5.
                        In the nets, the teams are sorted by two factors in two lists: by the placements and Buchholz scores.
                        Then the teams are match-upped as always but if a rematch between two teams is happening, the Buchholz scores are playing a role. Two teams, which had the chance of a rematch, get separated and put into match-ups with those teams, which have another Buchholz scores than themselves. <br />
                        <i>Still, there is no guaranteeing that a rematch between two teams can't happen in different Swiss Stages!</i>
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
                    <p className={css.info_text}>To start a match, you need to find a rectangle with yellow glow: <b>(this doesn't look exactly like in reality)</b></p>
                    <div
                        className={`${css.match_rect} ${css.match_current}`}
                        style={{ pointerEvents: "none", marginTop: '24px', marginBottom: '4px' }}
                    >
                        <div
                            className={
                                css.match_content
                            }
                        >
                            <div
                                className={
                                    css.team_cell
                                }
                            >
                                <div
                                    className={
                                        css.team_circle
                                    }
                                    style={{
                                        background: COLORS.amber.color
                                    }}
                                    title={COLORS.amber.name}
                                />
                            </div>
                
                            <div
                                className={
                                    css.vs_cell
                                }
                            >
                                <span className={css.vs_text}>VS</span>
                            </div>
                
                            <div
                                className={
                                    css.team_cell
                                }
                            >
                                <div
                                    className={
                                        css.team_circle
                                    }
                                    style={{ background: COLORS.azure.color }}
                                    title={COLORS.azure.name}
                                />
                            </div>
                        </div>
                    </div>
                    <span style={{ fontStyle: 'italic', color: 'black' }} className={css.info_text}>(This yellow glow shows that this match is current)</span>
                    <p className={css.info_text}>
                        Only the matches with this glow are clickable and playable.
                        Once the match is played and finished, previously dashed match becomes a match with a yellow glow, which means it becomes playable. <br />
                        To know the order of the matches, look at the right darker part of a match rectangle, where each of the rectangles has its own order number.
                    </p>
                    <div
                        className={`${css.match_rect} ${css.match_next}`}
                        style={{ pointerEvents: "none", marginTop: '24px', marginBottom: '4px' }}
                    >
                        <div
                            className={
                                css.match_content
                            }
                        >
                            <div
                                className={
                                    css.team_cell
                                }
                            >
                                <div
                                    className={
                                        css.team_circle
                                    }
                                    style={{
                                        background: COLORS.chocolate.color
                                    }}
                                    title={COLORS.chocolate.name}
                                />
                            </div>
                
                            <div
                                className={
                                    css.vs_cell
                                }
                            >
                                <span className={css.vs_text}>VS</span>
                            </div>
                
                            <div
                                className={
                                    css.team_cell
                                }
                            >
                                <div
                                    className={
                                        css.team_circle
                                    }
                                    style={{ background: COLORS.ivory.color }}
                                    title={COLORS.ivory.name}
                                />
                            </div>
                        </div>
                    </div>
                    <span style={{ fontStyle: 'italic', color: 'black', marginBottom: '24px' }} className={css.info_text}>(Dashed border shows that it is the next match)</span>
                    <p className={css.info_text}>In our case, we look at the 0:0 net and at the very first match in this net, where we also can see "#1" from the side of our needed match:</p>
                    <div className={css.image_container}>
                        <img src={locatedMatchRect} alt="Current Match in big" className={css.image} style={{ width: '25vw', height: '32vh' }} />
                    </div>
                    <p className={css.info_text}>We have to start it somehow and in order to do that, we should click on it first and it will open a match modal:</p>
                    <div className={css.image_container}>
                        <img src={matchModal} alt="Opened match modal" className={css.image} style={{ width: '25vw', height: '35vh' }} />
                    </div>
                    <p className={css.info_text}>
                        There is a lot of information on this modal, so let me explain it to you: <br />
                        At the top, there is a small stage name, name of the match with its order number and the "Best of" of this match, in this case it's a BO1. <br />
                        In the center, there are two teams, that will be playing in this match. Inside of their circles there are shown their current points. On top of the circle, there is the team's placement and on the bottom, there is the team's name. You have to choose one of these teams by clicking on the your chosen team's circle. <br />
                        Below those, there is a percentage bar, which shows the estimated winning chances of each team winning and the text stating, which team has an advantage. The percentages are being calculated based on teams' placements in the top but mostly based on their points difference. So, this is only a <b>mathematical</b> prediction and anything can still happen. <br />
                        At the bottom, there is a blue button with "Start this 0:0 Match" text on it. <br />
                        <b style={{ display: "block", marginTop: '8px', marginBottom: '-16px' }}>(In this case, it's 0:0 Match. Another matches in another nets will have another text depicted on this button)</b> <br />
                        You will be able to click it, once you choose one of the teams: <br />
                    </p>
                    <div className={css.image_container}>
                        <img src={chosenLeftTeamModal} alt="Chosen left team on the match modal" className={css.image} style={{ width: '25vw', height: '35vh' }} />
                        <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                            (Your chosen team is being highlighted with blue glow and is always at the left, even if it is at the right at first)
                        </span>
                    </div>
                    <div className={css.image_container}>
                        <img src={chosenRightTeamModal} alt="Chosen right team on the match modal" className={css.image} style={{ width: '25vw', height: '36vh' }} />
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
                        In the center, there is the scoreboard. In the middle, there is a big "VS" and round count. On the left and on the right, there are these big numbers, which tell who how much rounds has already taken and below them, there are set lines, which stand for sets and they light themselves, when a set is taken. Near those big round counts, there are team names and squares standing for won and yet not won mini-rounds. On the left side, there's always your picked team. <br />
                        Below the scoreboard, there is "First to n" and "nx Overtime". These show up, once it's Overtime and the Overtime can go to multiple ones.
                        At the bottom, there's gamble button. <br />
                        In general, all the rules are from Extended Mode. In order to win a set here, 13 rounds are required to be won. Maximum of a normal regulation is 24 rounds, so if it is a tie 12-12 after 24 rounds, it's Overtime, where 6 rounds are played and the one who takes 4 first, wins. Once again, if in Overtime, it's 15-15, so each team won 3 OT rounds, we go onto Double Overtime and it can go on endlessly until one team gets 4 rounds in a single OT. 1 round is won when 5 mini-rounds are won. <i>But there are <b>exceptions</b>: 1st Round, 13th Round and each first round of every Overtime require 10 mini-wins to win a round.</i> <br /> In order to win a mini-round, some specific multiplier is required. Here is one more difference: <br />
                    </p>
                    <p className={css.info_text}>
                        <b>
                            The range for the multiplier is between <b style={{ color: 'red' }}>-2.0x</b> and <b style={{ color: 'green' }}>2.0x</b>,
                            where the <span style={{ textDecoration: 'underline' }}>win</span> counts when the multiplier is above <b>0x</b> and <span style={{ textDecoration: 'underline' }}>loss</span> counts when the multiplier is below <b>0x</b>.
                        </b>
                    </p>
                    <p className={css.info_text}>And the win <i>here</i> counts for <span style={{ textDecoration: 'underline' }}>your chosen team</span>. A bad multiplier (below 0x) counts then for the team, that is against your chosen team:</p>
                    <div className={css.image_container}>
                        <img src={miniRoundWonAmber} alt="Won mini-round for Team Amber" className={css.image} style={{ width: '32vw', height: '36vh' }} />
                        <img src={miniRoundWonAzure} alt="Won mini-round for Team Azure" className={css.image} style={{ width: '32vw', height: '36vh' }} />
                    </div>
                    <p className={css.info_text}>And as it is a Best of 1 in 0:0 net of Stage I, a team needs one set to win:</p>
                    <div className={css.image_container}>
                        <img src={matchPointImg} alt="MATCH POINT!!! for the Team Amber!" className={css.image} style={{ width: '32vw', height: '38vh' }} />
                        <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                            (Once a team is one round away from taking a set, they have above their names a "Set Point!". But if a team is one set away from winning and one round away from winning, then it says "MATCH POINT!!!". "MATCH POINT!!!" differs itself in some specific matches like Progression and Elimination matches, but I'll leave it already to you to find "some other specific cases" out)
                        </span>
                    </div>
                    <p className={css.info_text}>
                        After one of the both teams wins, this team goes then into 1:0 net as explained above and the loser team goes to 0:1 net.
                        They go into such placeholder rectangles, which show who has already won 0:0 match or lost it.
                        Once all matches of 0:0 finish, only then rectangles go and matches in two next nets are built by the distribution system as explained <a style={{ color: 'Highlight', fontStyle: 'italic' }} onClick={scrollToDistributionExplained} href='#distribution-explained'>here</a>.
                        The winner side is light-green and the loser side is light-red on the rectangle. Depending if your chosen team won, a green check icon appears and a red cross appears, if lost. The "VS" is replaced by the final score of the match: <br />
                    </p>
                    <div className={css.image_container}>
                        <img src={teamAmberGoesTo10Net} alt="Team Amber goes to 1:0 net and Team Azure goes to 0:1 net" className={css.image} style={{ width: '30vw', height: '40vh' }} />
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
                        <img src={finishedMatchModalImg} alt="Finished match modal" className={css.image} style={{ width: '24vw', height: '35vh' }} />
                    </div>
                    <p className={css.info_text}>
                        On the header of the modal, we can see it in light-green or light-red dependent on whether your chosen team won. Above we can see the check icon again (it can also be a cross icon but if the match would have been lost). <br />
                        And there is also a small label, which tells how many <b>Pick&apos;em points</b> you got. <br />
                        In the middle, there is final score of the match, where there are some changes from pre-match modal. The winner team gets 10 points from this win here and changes its placement from 36th place to 33rd place. Loser team loses 5 points and moves from 61st place to 64th place.<br />
                        In the footer, there is a precise series summary. Here, you can see total played rounds, the score after 1st Half, the score after 2nd Half and in some case, like here as well, the score after all OTs (here, it was only 1x OT).
                    </p>
                    <p className={css.info_text}>
                        These check marks near the names of Halfs and OT show which team won the Extended Round (10 mini-wins round) in that half. <br />
                        If OT goes onto multiple OTs and a team won in those multiple OTs at least 2 Extended Rounds, the check mark is being replaced by a "i" mark like here:
                    </p>
                    <div className={css.image_container}>
                        <img src={finishedMatchModalTwoImg} alt="Finished match modal" className={css.image} style={{ width: '24vw', height: '35vh' }} />
                        <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                            (This 5x OT was like the full game regulation, LOL)
                        </span>
                    </div>
                    <p className={css.info_text}>
                        By hovering onto this "i" mark, you can see in which Overtimes a team won the Extended Rounds:
                    </p>
                    <div className={css.image_container}>
                        <img src={finishedMatchModalThreeImg} alt="Finished match modal" className={css.image} style={{ width: '24vw', height: '35vh' }} />
                    </div>
                </section>
                <section>
                    <div id="pickem-system" style={{ marginTop: '24px' }} className={css.divider_container}>
                        <h3 style={{ marginTop: '12px' }} className={css.title}>Pick&apos;em system</h3>
                        <div className={css.divider} />
                    </div>
                    <p style={{ fontWeight: '800', marginTop: '12px' }} className={css.info_text}>Now, lemme explain about Pick'em points system: <br />
                        Since we are able to pick for every match, we need to get a reward, if chosen a winner team. <br />
                        • If your chosen team wins any BO1 match, you get <i>+1 Pick&apos;em point</i> per match <br />
                        • If your chosen team wins any BO3 match, you get <i>+3 Pick&apos;em points</i> per match <br />
                        • if a BO5 Quarterfinal, you get <i>+5 Pick&apos;em points</i> per match <br />
                        • if BO7 Semifinals or BO7 Third Place Decider, you get <i>+7 Pick&apos;em points</i> per match <br />
                        • and if in BO9 Grand Final, you get <i>+9 Pick&apos;em points</i>. <br />
                        If your chosen team loses in whatever stage, you get twice as many points as sets your chosen team won but still lost overall.
                    </p>
                    <p className={css.info_text}>
                        Also, in the right top corner of the Swiss Stage or Playoffs, there are shown needed Pick&apos;em points in order to win. <br />
                    </p>
                    <p className={css.info_text}>That's why also I get here only <b>+1 Pick&apos;em point</b>:</p>
                    <div className={css.image_container}>
                        <img src={finishedMatchModalImg} alt="Finished match modal" className={css.image} style={{ width: '24vw', height: '35vh' }} />
                    </div>
                </section>
                <section>
                    <div id='leaderboard-explained' style={{ marginTop: '24px' }} className={css.divider_container}>
                        <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>Leaderboard format and points system</h3>
                        <div className={css.divider} />
                    </div>
                    <div style={{ fontWeight: "800", marginTop: "12px" }} className={css.info_text}>
                        Now, lemme also explain about Leaderboard points system: <br />
                        The main goal of this system is to give the possibility for every team to start from any out of the three Stages. In
                        order for them to do that, it is to win matches. <br />
                        Depending on in which place the team is in the colors object (list of colors in the code):
                        <div className={css.team_sequence}>
                            {Object.entries(COLORS).map(([key, team], index) => {
                                const rank = index + 1;

                                let points;

                                if (rank <= 16) {
                                    points = 1150;
                                } else if (rank <= 32) {
                                    points = 1100;
                                } else {
                                    points = 1050;
                                }

                                return (
                                    <React.Fragment key={key}>
                                        {rank === 17 && (
                                            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                                                <h4
                                                    className={css.game_title}
                                                    style={{ fontSize: "24px", color: "#999", marginBottom: "10px" }}
                                                >
                                                    Autoqualifiers to Stage III
                                                </h4>

                                                <hr style={{ width: "520px", margin: 0 }} className={css.dashed_divider} />

                                                <h4
                                                    className={css.game_title}
                                                    style={{ fontSize: "24px", color: "#999", marginTop: "10px" }}
                                                >
                                                    Autoqualifiers to Stage II
                                                </h4>
                                            </div>
                                        )}

                                        {rank === 33 && (
                                            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                                                <h4
                                                    className={css.game_title}
                                                    style={{ fontSize: "24px", color: "#999", marginBottom: "10px" }}
                                                >
                                                    Autoqualifiers to Stage II
                                                </h4>

                                                <hr style={{ width: "520px", margin: 0 }} className={css.dashed_divider} />

                                                <h4
                                                    className={css.game_title}
                                                    style={{ fontSize: "24px", color: "#999", marginTop: "10px" }}
                                                >
                                                    Qualifiers to Stage I
                                                </h4>
                                            </div>
                                        )}

                                        <div className={css.team_row}>
                                            <span className={css.rank}>#{rank}</span>

                                            <span
                                                className={css.color_circle}
                                                style={{
                                                    background: team.color,
                                                    boxShadow: team.shadow
                                                }}
                                            />

                                            <span className={css.team_name}>
                                                Team {team.name}
                                            </span>

                                            <span className={css.team_stage}>
                                                {points} pts
                                            </span>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        the teams get either 1150 points or 1100 points or 1050 points at the very start. <br />
                        - Top 16 → Autoqualify to <b>Stage III</b> with 1150 points
                        <br />- Top 17-32 → Autoqualify to <b>Stage II</b> with 1100 points
                        <br />- Top 33-64 → Start in <b>Stage I</b> with 1050 points <br />
                        <br />
                        <b>The Ranking System</b> <br />
                        Instead of fixed "+X / -Y" per match, points are calculated dynamically based on: <br />
                        • <b>Expected result</b> (if you win as an underdog you gain more, if you win as a favorite you gain less). <br />
                        • <b>Match importance</b> (bigger Stage / Playoffs + bigger Best-Of = more points). <br />
                        • <b>Scoreline margin</b> in series (a cleaner win gives a small bonus in BO3/BO5/BO7/BO9). <br />
                        • <b>Rating gap dampening</b> (huge rating gaps are dampened, so one match doesn't completely destroy rankings). <br />
                        <br />
                        <b>How points are calculated</b> <br />
                        1) The system calculates the favorite's expected win probability using an Elo-like formula. <br />
                        2) The system computes an internal "K" for the match using: <br />
                        • Swiss Stage/Playoffs weight × Best-Of weight × Margin multiplier × Rating-gap dampening × Upset factor.{" "}
                        <br />
                        3) Winner gets points: <br />
                        <i>winPoints = round(K × (1 − expectedWinProbabilityOfWinner))</i> (minimum 1, maximum is capped). <br />
                        4) Loser loses <b>less</b> than the winner gains: <br />
                        • If the loser was the <b>underdog</b>, they lose about <i>~25%</i> of winPoints. <br />
                        • If the loser was the <b>favorite</b>, they lose about <i>~50%</i> of winPoints. <br />
                        <br />
                        <b>Important notes</b> <br />
                        • Losers always lose fewer points than winners gain. <br />
                        - BUT, losers in the Grand Final lose less points than usual (because it is already very unfortunate to lose in the Grand Final). <br />
                        • Outsider losses are punished lightly. Favorite losses are punished more. <br />
                        • Points can't go below 0. If a team already has 0, they cannot lose more. <br />
                        <br />
                        <b>Swiss Stages / Playoffs importance</b> (bigger = more points a winner can get) <br />
                        • Stage I: 1.00 <br />
                        • Stage II: 1.25 <br />
                        • Stage III: 1.50 <br />
                        • RO16: 1.75 <br />
                        • Quarterfinal: 2.50 <br />
                        • Semifinal: 3.00 <br />
                        • Third Place Decider: 3.25 <br />
                        • Grand Final: 5.00 <br />
                        <br />
                        <b>Best-Of importance</b> (bigger = more points a winner can get) <br />
                        • BO1: 1.00 <br />
                        • BO3: 1.25 <br />
                        • BO5: 1.50 <br />
                        • BO7: 2.00 <br />
                        • BO9: 3.00 <br />
                    </div>
                </section>
                <section>
                    <div id="what-happens" style={{ marginTop: '24px' }} className={css.divider_container}>
                        <h3 style={{ marginTop: '12px', width: "max-content" }} className={css.title}>What happens next?</h3>
                        <div className={css.divider} />
                    </div>
                    <p className={css.info_text}>After that, you can proceed with further matches. When all the match-ups in Stage I are finished, only 16 teams are left. They qualify into Stage II and build with auto-qualifiers match-ups for 0:0 net but already in Stage II:</p>
                    <div className={css.image_container}>
                        <img src={stageTwoQualifiersImg} alt="Stage II Qualifiers" className={css.image} style={{ width: '30vw', height: '50vh' }} />
                    </div>
                    <div className={css.image_container}>
                        <img src={stageTwoImg} alt="Stage II" className={css.image} style={{ width: '33vw', height: '40vh' }} />
                        <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                            (There is a navigation menu in top left corner, where you can also see Stage III and Playoffs, once you finish Stage II)
                        </span>
                    </div>
                    <p className={css.info_text}>And so you can proceed from Stage II to Stage III and from Stage III to Playoffs:</p>
                    <div className={css.image_container}>
                        <img src={playoffsQualifiersImg} alt="Playoffs Qualifiers" className={css.image} style={{ width: '30vw', height: '50vh' }} />
                    </div>
                    <div className={css.image_container}>
                        <img src={playoffsImg} alt="Playoffs" className={css.image} style={{ width: '33vw', height: '45vh' }} />
                    </div>
                    <p className={css.info_text}>As I mentioned above, Round of 16 and Quarterfinals are <b>BO5</b>, Semifinals and Third Place Decider are <b>BO7</b>, and the Grand Final is <b>BO9</b>.</p>
                    <p className={css.info_text}>
                        Playoffs are single-elimination stage, which means that once a team loses a series, it flies out of the tournament directly. By the time we reach Grand Final, there should be only two teams left.
                        In a BO9 will be decided the winner of the tournament. And once the winner of the Grand Final is determined, we are directly redirected to winner's screen, where we see first 4 places of the tournament:
                    </p>
                    <div className={css.image_container}>
                        <img src={winnersScreenImg} alt="Team Lime as Winner, Team Blue as Runner-up, Team Gold as Third Place, Team Orange as Fourth Place" className={css.image} style={{ width: '35vw', height: '72vh' }} />
                    </div>
                    <p className={css.info_text}>After clicking "Proceed", we are redirected to Pick&apos;em summary, where you can see how many matches overall you've guessed correctly throughout the tournament and your final Pick&apos;em points score and also whether you won or not:</p>
                    <div className={css.image_container}>
                        <img src={pickemSummaryImg} alt="Pick'em Summary Screen" className={css.image} style={{ width: '35vw', height: '60vh' }} />
                    </div>
                    <p className={css.info_text}>Afterwards you can start a new tournament in Special Mode once again or click on "To the bracket" button to see the full results of the tournament.</p>
                </section>
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