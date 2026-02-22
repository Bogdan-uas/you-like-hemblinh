import css from './SpecialModeInfoPage.module.css'
import { Link } from "react-router-dom";
import introImg from "../../../assets/images/image.png";
import scoreBoardImg from "../../../assets/images/image-2.png";
import dashedDividerImg from "../../../assets/images/image-3.png";
import dashedDividerTwoImg from "../../../assets/images/image-4.png";
import tournamentIntroScreenImg from "../../../assets/images/image-5.png";
import swissStageImg from "../../../assets/images/image-6.png";
import matchModal from "../../../assets/images/image-7.png";
import chosenTeamModal from "../../../assets/images/image-8.png";
import seriesScreen from "../../../assets/images/image-9.png";
import miniRoundWonSand from "../../../assets/images/image-10.png";
import miniRoundWonMoss from "../../../assets/images/image-11.png";
import matchPointImg from "../../../assets/images/image-12.png";
import teamSandGoesTo10Net from "../../../assets/images/image-13.png";
import finishedMatchModalImg from "../../../assets/images/image-14.png";
import finishedMatchModalTwoImg from "../../../assets/images/image-15.png";
import stageTwoQualifiersImg from "../../../assets/images/image-16.png";
import stageTwoImg from "../../../assets/images/image-17.png";
import playoffsImg from "../../../assets/images/image-18.png";
import playoffsQualifiersImg from "../../../assets/images/image-19.png";
import winnersScreenImg from "../../../assets/images/image-20.png";
import pickemSummaryImg from "../../../assets/images/image-21.png";

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



const SpecialModeInfoPage = () => {
    const scrollToDuringMatch = (e) => {
        e.preventDefault();
        document.getElementById("during-match")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
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
                <div style={{ marginTop: '24px' }} className={css.divider_container}>
                    <h3 style={{ marginTop: '12px' }} className={css.title}>Starting off</h3>
                    <div className={css.divider} />
                </div>
                <p className={css.info_text}>
                    Special Mode is a tournament-style gambling mode where <b>64 color teams</b> compete through
                    Swiss Stages and Playoffs.
                    Every team has a <b>rating (points)</b>, and those ratings decide where they start.
                </p>
                <p className={css.info_text}>
                    Before you even press <b>Start Game</b>, you can open the <b>Leaderboard</b>.
                    There you see all 64 teams, their points and placements.
                </p>
                <div className={css.image_container}>
                    <img src={introImg} alt="Intro Page" className={css.image} style={{ width: '34vw', height: '37vh' }} />
                </div>
                <p className={css.info_text}>
                    By clicking that orange-colored button, you'll be redirected there.
                </p>
                <div className={css.image_container}>
                    <img src={scoreBoardImg} alt="Scoreboard" className={css.image} style={{ width: '34vw', height: '37vh' }} />
                    <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                        (Higher points = higher placement)
                    </span>
                </div>
                <p className={css.info_text}>
                    You can scroll down and see other teams, with such kind of dividers, like here:
                </p>
                <div className={css.image_container}>
                    <img src={dashedDividerImg} alt="Divider, which show the edge between qualifiers for Stage III and Stage II" className={css.image} style={{ width: '40vw', height: '65vh' }} />
                </div>
                <div className={css.image_container}>
                    <img src={dashedDividerTwoImg} alt="Divider, which show the edge between qualifiers for Stage II and Stage I" className={css.image} style={{ width: '40vw', height: '65vh' }} />
                </div>
                <p style={{ marginBottom: '24px' }} className={css.info_text}>
                    As you can see by yourself, there are three stages in swiss format: <b>Stage I</b>, <b>Stage II</b> and <b>Stage III</b>. <br />
                </p>
                <p className={css.info_text}>
                    Placement rules:
                    <br />• Top 16 → Autoqualify to <b>Stage III</b>
                    <br />• Top 17–32 → Autoqualify to <b>Stage II</b>
                    <br />• Top 33–64 → Start in <b>Stage I</b>
                </p>
                <p className={css.info_text}>
                    By clicking on the "Start Game" button, you will start playing the tournament. <br />
                    But first, you will be redirected to the "Tournament Intro Screen", where you see the overview of the qualifiers for each stage one more time, in case you haven't seen the Leaderboard:
                </p>
                <div className={css.image_container}>
                    <img src={tournamentIntroScreenImg} alt="Tournament Intro Screen" className={css.image} style={{ width: '35vw', height: '37vh' }} />
                </div>
                <p className={css.info_text}>
                    When you click "Proceed", the tournament starts. You'll start from this: <br />
                </p>
                <div className={css.image_container}>
                    <img src={swissStageImg} alt="First look of Stage I" className={css.image} style={{ width: '34vw', height: '50vh' }} />
                    <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                        (Teams' classification depends on their placement in the top, but very first tournament has always the same qualifiers for every Stage, as well as Stage I. Here it's just pure randomness, which team will have which opponent at opening rounds)
                    </span>
                </div>
                <div style={{ marginTop: '24px' }} className={css.divider_container}>
                    <h3 style={{ marginTop: '12px' }} className={css.title}>Wot is zis suiss steij iven ebaut?</h3>
                    <div className={css.divider} />
                </div>
                <p className={css.info_text}>
                    For the team to progress to the next stage, it needs to win at least 3 matches in the current stage. <br />
                    But if the team loses 3 matches, it flies out of the tournament. <br />
                    All teams start from <b>0:0 net</b> and play in <b>Best of 1 format</b>. Winners of <b>0:0 matches</b> go to <b>1:0 net</b>, losers go to <b>0:1 net</b>. <br />
                    Winners of <b>1:0 matches</b> go <b>to 2:0 net</b>, losers go to <b>1:1 net</b>. <br />
                    Winners of <b>0:1 matches</b> go <b>to 1:1 net</b>, losers go to <b>0:2 net</b>. <br />
                    Winners of <b>2:0 matches</b> go to <b>3:0 net</b> and qualify to the next stage, losers go to <b>2:1 net</b>. <br />
                    Winners of <b>1:1 matches</b> go to <b>2:1 net</b>, losers go to <b>1:2 net</b>. <br />
                    Winners of <b>0:2 matches</b> go to <b>1:2 net</b>, losers go to <b>0:3 net</b> and fly out of the tournament. <br />
                    Winners of <b>2:1 matches</b> go to <b>3:1 net</b> and qualify to the next stage, losers go to <b>2:2 net</b>. <br />
                    Winners of <b>1:2 matches</b> go to <b>2:2 net</b>, losers go to <b>1:3 net</b> and fly out of the tournament. <br />
                    Winners of <b>2:2 matches</b> go to <b>3:2 net</b> and qualify to the next stage, losers go to <b>2:3 net</b> and fly out of the tournament.
                </p>
                <p style={{ marginTop: '24px' }} className={css.info_text}>
                    0:0, 1:0, 0:1 and 1:1 matches are being played in <b>Best of 1 format</b>, 2:0, 2:1, 1:2 and 2:2 matches are either Progression or Elimination matches that's why they are being played in <b>Best of 3 format</b>. <br />
                </p>
                <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                    ("Best of n" formats are explained in <a style={{ color: 'Highlight' }} onClick={scrollToDuringMatch} href='#during-match'>"Wat du ai du during ze metch?"</a> section)
                </span>
                <div style={{ marginTop: '24px' }} className={css.divider_container}>
                    <h3 style={{ marginTop: '12px' }} className={css.title}>Hau tu start a metch?</h3>
                    <div className={css.divider} />
                </div>
                <p className={css.info_text}>To start a match, you need to find this rectangle with yellow glow:</p>
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
                                    background: COLORS.moss.color
                                }}
                                title={COLORS.moss.name}
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
                                style={{ background: COLORS.sand.color }}
                                title={COLORS.sand.name}
                            />
                        </div>
                    </div>
                </div>
                <span style={{ fontStyle: 'italic', color: 'black' }} className={css.info_text}>(This yellow glow shows that this match is current)</span>
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
                                    background: COLORS.honey.color
                                }}
                                title={COLORS.honey.name}
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
                                style={{ background: COLORS.ruby.color }}
                                title={COLORS.ruby.name}
                            />
                        </div>
                    </div>
                </div>
                <span style={{ fontStyle: 'italic', color: 'black', marginBottom: '24px' }} className={css.info_text}>(Dashed border shows that it is the next match)</span>
                <p className={css.info_text}>and click on it. Then, you will get this modal opened:</p>
                <div className={css.image_container}>
                    <img src={matchModal} alt="Opened match modal" className={css.image} style={{ width: '25vw', height: '37vh' }} />
                </div>
                <p className={css.info_text}>
                    There is a lot of information on this modal, so let me explain it to you: <br />
                    At the top, there is a small stage name, name of the match and the "Best of" of this match, in this case it's a BO1. <br />
                    In the center, there are two teams, that will be playing in this match. Inside of their circles there are shown their current points. Near their names, their placement in the Leaderboard. You need to choose the team you think will win. <br />
                    At the bottom, there is a big button with "Start Match" text on it. You will be able to click it, once you choose one of the teams: <br />
                </p>
                <div className={css.image_container}>
                    <img src={chosenTeamModal} alt="Chosen team on the match modal" className={css.image} style={{ width: '25vw', height: '37vh' }} />
                </div>
                <div style={{ marginTop: '24px' }} className={css.divider_container}>
                    <h3 id='during-match' style={{ marginTop: '12px' }} className={css.title}>Wat du ai du during ze metch?</h3>
                    <div className={css.divider} />
                </div>
                <p className={css.info_text}>After starting the match, you're being redirected to the "series screen":</p>
                <div className={css.image_container}>
                    <img src={seriesScreen} alt="'Series screen" className={css.image} style={{ width: '30vw', height: '45vh' }} />
                    <span className={css.info_text} style={{ fontStyle: 'italic', color: 'black' }}>
                        (Matches in Playoffs have a bit different scoreboard)
                    </span>
                </div>
                <p className={css.info_text}>At the very top, there are a small stage name, name of the match and the "Best of" of this match too. <br />
                    Lower from it, there is the current set info such as which round it is, how many rounds are required to win the set and if overtime, then also "Overtime #n". <br />
                    In the center, there is the scoreboard with scores of both teams, where are also their names. On the left side, there's always your picked team. <br />
                    At the bottom, there's gamble button. <br />
                    In general, all the rules are from Extended Mode, where in order to win a set, 13 rounds are required to be won. 1 round is won when 5 mini-rounds are won. In order to win a mini-round, some specific multiplier is required. Here is also the difference: <br />
                </p>
                <b className={css.info_text}>The range for the multiplier is between <b style={{ color: 'red' }}>-1.5x</b> and <b style={{ color: 'green' }}>1.5x</b>,
                    where the <span style={{ textDecoration: 'underline' }}>win</span> counts when the multiplier is above <b>0x</b> and <span style={{ textDecoration: 'underline' }}>loss</span> counts when the multiplier is below <b>0x</b>.
                </b>
                <p className={css.info_text}>And the win <i>here</i> counts for <span style={{ textDecoration: 'underline' }}>your chosen team</span>. A bad multiplier (below 0x) counts then for the team, that is against your chosen team:</p>
                <div className={css.image_container}>
                    <img src={miniRoundWonSand} alt="Won mini-round for Team Sand" className={css.image} style={{ width: '30vw', height: '60vh' }} />
                    <img src={miniRoundWonMoss} alt="Won mini-round for Team Moss" className={css.image} style={{ width: '30vw', height: '60vh' }} />
                </div>
                <p className={css.info_text}>And as it is a Best-of-1 in 0:0 net of Stage I, a team needs one set to win:</p>
                <div className={css.image_container}>
                    <img src={matchPointImg} alt="MATCH POINT!!! for the Team Sand!" className={css.image} style={{ width: '30vw', height: '55vh' }} />
                </div>
                <p className={css.info_text}>
                    After one of the both teams wins, this team goes then into 1:0 net as explained above and the loser team goes to 0:1 net. They go into such placeholder rectangles, which show who has already won 0:0 match or lost it. Once all matches of 0:0 finish, only then rectangles go and matches in two next nets are built, randomly amongst each net. The rectangle of the match gets either light-red or light-green, depending if your chosen team won and the "VS" is replaced by the final score of the match: <br />
                </p>
                <div className={css.image_container}>
                    <img src={teamSandGoesTo10Net} alt="Team Sand goes to 1:0 net and Team Moss goes to 0:1 net" className={css.image} style={{ width: '35vw', height: '50vh' }} />
                </div>
                <div style={{ marginTop: '24px' }} className={css.divider_container}>
                    <h3 style={{ marginTop: '12px' }} className={css.title}>Wat tu du nekst?</h3>
                    <div className={css.divider} />
                </div>
                <p className={css.info_text}>Already finished match is finished, but you can click on it and see results of the match in that same modal:</p>
                <div className={css.image_container}>
                    <img src={finishedMatchModalImg} alt="Finished match modal" className={css.image} style={{ width: '30vw', height: '45vh' }} />
                </div>
                <p className={css.info_text}>On the header of the modal, we can see the reminder of whether your chosen team lost or won. <br />
                    And there is also a small label, which tells how many <b>Pick&apos;em points</b> you got. <br />
                    In the middle, there is final score of the match, where there are some changes from pre-match modal. The winner team gets 3 points from this win and changes its placement to 33rd. Loser team should have lost some points, but it had already 0 points and it can't go beyond 0. I will explain it a bit later...<br />
                    In the footer, there is in most cases precise summary of all sets, that were played in this match and with which scores did each set end. But here, it was a BO1 match, which means there was only one set played. That's why, the score of this singular set is shown as the main match score.
                </p>
                <p style={{ fontWeight: '800', marginTop: '12px' }} className={css.info_text}>Now, lemme explain about Pick'em points system: <br />
                    Since we are able to pick for every match, we need to get a reward, if chosen a winner team. <br />
                    • If your chosen team wins any BO1 match, you get <i>+1 Pick&apos;em point</i> per match <br />
                    • If your chosen team wins any BO3 match, you get <i>+3 Pick&apos;em points</i> per match <br />
                    • if a BO5 Quarterfinal, you get <i>+5 Pick&apos;em points</i> per match <br />
                    • if BO7 Semifinals or BO7 Third Place Decider, you get <i>+7 Pick&apos;em points</i> per match <br />
                    • and if in BO9 Grand Final, you get <i>+9 Pick&apos;em points</i>. <br />
                    If your chosen team loses in whatever stage, you get twice as many points as many sets your chosen team won but still lost overall.
                </p>
                <p className={css.info_text}>
                    Also, in the right top corner of the Swiss Stage or Playoffs, there are shown needed Pick&apos;em points in order to win. <br />
                </p>
                <p className={css.info_text}>That's why also I get here only <b>+1 Pick&apos;em point</b>:</p>
                <div className={css.image_container}>
                    <img src={finishedMatchModalTwoImg} alt="Finished match modal" className={css.image} style={{ width: '30vw', height: '45vh' }} />
                </div>
                <p style={{ fontWeight: "800", marginTop: "12px" }} className={css.info_text}>
                    Now, lemme also explain about Leaderboard points system: <br />
                    I mentioned it already multiple times, but I will explain one more time anyways: <br />
                    The main goal of this system is to give the possibility for every team to start from any out of the three Stages. In
                    order for them to do that, it is to win matches. <br />
                    Depending on in which place the team is in the colors object, which is in the code of the website, the teams get
                    either 150 points or 100 points or 50 points at the very start. <br />
                    - Top 16 → Autoqualify to <b>Stage III</b> with 150 points
                    <br />- Top 17-32 → Autoqualify to <b>Stage II</b> with 100 points
                    <br />- Top 33-64 → Start in <b>Stage I</b> with 50 points <br />
                    <br />
                    <b>The Ranking System</b> <br />
                    Instead of fixed "+X / -Y" per match, points are calculated dynamically based on: <br />
                    • <b>Expected result</b> (if you win as an underdog you gain more, if you win as a favorite you gain less). <br />
                    • <b>Match importance</b> (bigger Stage / playoffs + bigger Best-Of = more points). <br />
                    • <b>Scoreline margin</b> in series (a cleaner win gives a small bonus in BO3/BO5/BO7/BO9). <br />
                    • <b>Rating gap dampening</b> (huge rating gaps are dampened, so one match doesn't completely destroy rankings). <br />
                    • <b>Recency</b> (recent matches matter more; older matches slowly matter less). <br />
                    <br />
                    <b>How points are calculated</b> <br />
                    1) The system calculates the favorite's expected win probability using an Elo-like formula. <br />
                    2) The system computes an internal "K" for the match using: <br />
                    • Stage/Playoffs weight × Best-Of weight × Margin multiplier × Recency weight × Rating-gap dampening × Upset factor.{" "}
                    <br />
                    3) Winner gets points: <br />
                    <i>winPoints = round(K × (1 − expectedWinProbabilityOfWinner))</i> (minimum 1, maximum is capped). <br />
                    4) Loser loses <b>less</b> than the winner gains: <br />
                    • If the loser was the <b>underdog</b>, they lose about <i>~25%</i> of winPoints. <br />
                    • If the loser was the <b>favorite</b>, they lose about <i>~50%</i> of winPoints. <br />
                    <br />
                    <b>Important notes</b> <br />
                    • Losers always lose fewer points than winners gain. <br />
                    • Outsider losses are punished lightly. Favorite losses are punished more, but never "full price". <br />
                    • Points can't go below 0. If a team already has 0, they cannot lose more. <br />
                    <br />
                    <b>Stage / playoffs importance</b> (bigger = more points a winner can get) <br />
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
                </p>
                <p className={css.info_text}>After that, you proceed with further matches. When all the match-ups in Stage I are finished, only 16 teams are left. They qualify into Stage II and build with auto-qualifiers match-ups for 0:0 net but already in Stage II:</p>
                <div className={css.image_container}>
                    <img src={stageTwoQualifiersImg} alt="Stage II" className={css.image} style={{ width: '30vw', height: '50vh' }} />
                </div>
                <div className={css.image_container}>
                    <img src={stageTwoImg} alt="Stage II" className={css.image} style={{ width: '30vw', height: '40vh' }} />
                </div>
                <p className={css.info_text}>And so you can proceed from Stage II to Stage III and from Stage III to Playoffs:</p>
                <div className={css.image_container}>
                    <img src={playoffsQualifiersImg} alt="Stage II" className={css.image} style={{ width: '30vw', height: '50vh' }} />
                </div>
                <div className={css.image_container}>
                    <img src={playoffsImg} alt="Stage II" className={css.image} style={{ width: '35vw', height: '40vh' }} />
                </div>
                <p className={css.info_text}>As I mentioned above, Round of 16 is a <b>BO3</b>, Quarterfinals are <b>BO5</b>, Semifinals and Third Place Decider are <b>BO7</b>, and Grand Final is <b>BO9</b>.</p>
                <p className={css.info_text}>Playoffs are single-elimination stage, which means that once a team loses a series, it flies out of the tournament directly. By the time we reach Grand Final, there should be only two teams left. In a BO9 will be decided the winner of the tournament. And once the winner of the Grand Final is determined, we are directly redirected to winner's screen, where we see first 4 places of the tournament:</p>
                <div className={css.image_container}>
                    <img src={winnersScreenImg} alt="Team Jade as Winner, Team Orange as Runner-up, Team Green as Third Place, Team Steel as Fourth Place" className={css.image} style={{ width: '35vw', height: '60vh' }} />
                </div>
                <p className={css.info_text}>After clicking "Proceed", we are redirected to Pick&apos;em summary, where you can see how many matches overall you've guessed correctly throughout the tournament and your final Pick&apos;em points score and also whether you won or not:</p>
                <div className={css.image_container}>
                    <img src={pickemSummaryImg} alt="Pick'em Summary Screen" className={css.image} style={{ width: '43vw', height: '60vh' }} />
                </div>
                <p className={css.info_text}>Afterwards you can start a new tournament in Special Mode once again.</p>
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