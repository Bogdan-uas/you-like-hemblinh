import css from './SpecialModeInfoPage.module.css'
import { Link } from "react-router-dom";
import bracketImg from "../../../assets/images/image.png";
import matchModalImg from "../../../assets/images/image-2.png";
import chosenTeamImg from "../../../assets/images/image-3.png";
import seriesScreenImg from "../../../assets/images/image-4.png";
import miniRoundRedImg from "../../../assets/images/image-5.png";
import miniRoundLimeImg from "../../../assets/images/image-6.png";
import seriesPointImg from "../../../assets/images/image-7.png";
import finishedMatchRedImg from "../../../assets/images/image-8.png";
import finishedMatchModalImg from "../../../assets/images/image-9.png";
import secondQuarterfinalistImg from "../../../assets/images/image-10.png";
import winnersScreenImg from "../../../assets/images/image-11.png";
import resultsScreenImg from "../../../assets/images/image-12.png";

const COLORS = {
    red: {
        shadow: "0 0 10px rgba(255, 0, 0, 0.5)",
        color: "#FF0000",
        unlitColor: "#2a0000",
        name: "Red"
    },
    orange: {
        shadow: "0 0 10px rgba(255, 127, 0, 0.5)",
        color: "#FF7F00",
        unlitColor: "#4b2a00",
        name: "Orange"
    },
    yellow: {
        shadow: "0 0 10px rgba(255, 255, 0, 0.5)",
        color: "#FFFF00",
        unlitColor: "#4b4b00",
        name: "Yellow"
    },
    lime: {
        shadow: "0 0 10px rgba(0, 255, 0, 0.5)",
        color: "#32CD32",
        unlitColor: "#1a2a00",
        name: "Lime"
    },
    green: {
        shadow: "0 0 10px rgba(0, 128, 0, 0.5)",
        color: "#008000",
        unlitColor: "#002a00",
        name: "Green"
    },
    cyan: {
        shadow: "0 0 10px rgba(0, 255, 255, 0.5)",
        color: "#00FFFF",
        unlitColor: "#004b4b",
        name: "Cyan"
    },
    blue: {
        shadow: "0 0 10px rgba(0, 0, 255, 0.5)",
        color: "#0000FF",
        unlitColor: "#00002a",
        name: "Blue"
    },
    indigo: {
        shadow: "0 0 10px rgba(54, 0, 93, 0.5)",
        color: "#4A007F",
        unlitColor: "#1a002a",
        name: "Indigo"
    },
    violet: {
        shadow: "0 0 10px rgba(138, 43, 226, 0.5)",
        color: "#8A2BE2",
        unlitColor: "#1a002a",
        name: "Violet"
    },
    pink: {
        shadow: "0 0 10px rgba(255, 20, 147, 0.5)",
        color: "#FF1493",
        unlitColor: "#4b002a",
        name: "Pink"
    },
    beige: {
        shadow: "0 0 10px rgba(255, 192, 203, 0.5)",
        color: "#FFC0CB",
        unlitColor: "#4b2a2a",
        name: "Beige"
    },
    black: {
        shadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        color: "#000000",
        unlitColor: "#5d5d5d",
        name: "Black"
    },
    white: {
        shadow: "0 0 10px rgba(194, 194, 194, 0.5)",
        color: "#d5d5d5ff",
        unlitColor: "#656565ff",
        name: "White"
    },
    gray: {
        shadow: "0 0 10px rgba(128, 128, 128, 0.5)",
        color: "#808080",
        unlitColor: "#272727",
        name: "Gray"
    },
    brown: {
        shadow: "0 0 10px rgba(122, 55, 0, 0.5)",
        color: "#7F3900",
        unlitColor: "#201000",
        name: "Brown"
    },
    teal: {
        shadow: "0 0 10px rgba(0, 109, 111, 0.5)",
        color: "#006D6F",
        unlitColor: "#001a1a",
        name: "Teal"
    },
    gold: {
        shadow: "0 0 10px rgba(212, 175, 55, 0.5)",
        color: "#D4AF37",
        unlitColor: "#3a2c08",
        name: "Gold"
    },
    silver: {
        shadow: "0 0 10px rgba(192, 192, 192, 0.5)",
        color: "#C0C0C0",
        unlitColor: "#3a3a3a",
        name: "Silver"
    },
    navy: {
        shadow: "0 0 10px rgba(0, 0, 128, 0.5)",
        color: "#000080",
        unlitColor: "#00001a",
        name: "Navy"
    },
    olive: {
        shadow: "0 0 10px rgba(128, 128, 0, 0.5)",
        color: "#808000",
        unlitColor: "#2a2a00",
        name: "Olive"
    },
    coral: {
        shadow: "0 0 10px rgba(255, 127, 80, 0.5)",
        color: "#FF7F50",
        unlitColor: "#4b2819",
        name: "Coral"
    },
    magenta: {
        shadow: "0 0 10px rgba(255, 0, 255, 0.5)",
        color: "#FF00FF",
        unlitColor: "#4b004b",
        name: "Magenta"
    },
    lavender: {
        shadow: "0 0 10px rgba(181, 126, 220, 0.5)",
        color: "#B57EDC",
        unlitColor: "#332144",
        name: "Lavender"
    },
    sky: {
        shadow: "0 0 10px rgba(135, 206, 235, 0.5)",
        color: "#87CEEB",
        unlitColor: "#234252",
        name: "Sky"
    },
    mint: {
        shadow: "0 0 10px rgba(152, 251, 152, 0.5)",
        color: "#98FB98",
        unlitColor: "#284428",
        name: "Mint"
    },
    salmon: {
        shadow: "0 0 10px rgba(250, 128, 114, 0.5)",
        color: "#FA8072",
        unlitColor: "#4b2320",
        name: "Salmon"
    },
    plum: {
        shadow: "0 0 10px rgba(142, 69, 133, 0.5)",
        color: "#8E4585",
        unlitColor: "#2a1327",
        name: "Plum"
    },
    khaki: {
        shadow: "0 0 10px rgba(195, 176, 145, 0.5)",
        color: "#C3B091",
        unlitColor: "#403528",
        name: "Khaki"
    },
    crimson: {
        shadow: "0 0 10px rgba(220, 20, 60, 0.5)",
        color: "#DC143C",
        unlitColor: "#3a020c",
        name: "Crimson"
    },
    turquoise: {
        shadow: "0 0 10px rgba(64, 224, 208, 0.5)",
        color: "#40E0D0",
        unlitColor: "#11423c",
        name: "Turquoise"
    },
    chartreuse: {
        shadow: "0 0 10px rgba(127, 255, 0, 0.5)",
        color: "#7FFF00",
        unlitColor: "#234400",
        name: "Chartreuse"
    },
    steel: {
        shadow: "0 0 10px rgba(70, 130, 180, 0.5)",
        color: "#4682B4",
        unlitColor: "#172637",
        name: "Steel"
    }
};

const SpecialModeInfoPage = () => {
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
                <p className={css.info_text}>By starting off (clicking the "Start Game" button), you'll see Single Elimination bracket with <b>16</b> teams:</p>
                <div className={css.image_container}>
                    <img src={bracketImg} alt="Single Elimination bracket" className={css.image} />
                    <span style={{ fontStyle: 'italic', color: 'black' }} className={css.info_text}>(The teams' classification is always different)</span>
                </div>
                <p className={css.info_text}>There are in total <b>32</b> colors for teams, only <b>16</b> are randomly being taken. <br />
                    But there are four exceptions: <br />
                    <span style={{ color: COLORS.blue.color, fontWeight: '800' }}>Team Blue</span>, {' '}
                    <span style={{ color: COLORS.yellow.color, fontWeight: '800' }}>Team Yellow</span>, {' '}
                    <span style={{ color: COLORS.lime.color, fontWeight: '800' }}>Team Lime</span> and {' '}
                    <span style={{ color: COLORS.red.color, fontWeight: '800' }}>Team Red</span> <br />
                    which are in every new tournament.
                </p>
                <p className={css.info_text}>That's why there are only <b>12</b> always random teams out of <b>28</b> (excluding four exceptional ones).</p>
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
                                    background: COLORS.lime.color
                                }}
                                title={COLORS.lime.name}
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
                                style={{ background: COLORS.red.color }}
                                title={COLORS.red.name}
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
                                    background: COLORS.olive.color
                                }}
                                title={COLORS.olive.name}
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
                                style={{ background: COLORS.beige.color }}
                                title={COLORS.beige.name}
                            />
                        </div>
                    </div>
                </div>
                <span style={{ fontStyle: 'italic', color: 'black', marginBottom: '24px' }} className={css.info_text}>(Dashed border shows that it is the next match)</span>
                <p className={css.info_text}>and click on it. Then, you will get this modal opened:</p>
                <div className={css.image_container}>
                    <img src={matchModalImg} alt="Opened match modal" className={css.image} style={{ width: '25vw', height: '32vh' }} />
                    <span style={{ fontStyle: 'italic', color: 'black' }} className={css.info_text}>(We'll just proceed with this example)</span>
                </div>
                <p className={css.info_text}>You need to choose here the team, which you think we will win this match and click "Start Match". In my case, it is Team Lime:</p>
                <div className={css.image_container}>
                    <img src={chosenTeamImg} alt="Chosen team on the match modal" className={css.image} style={{ width: '25vw', height: '32vh' }} />
                </div>
                <div style={{ marginTop: '24px' }} className={css.divider_container}>
                    <h3 style={{ marginTop: '12px' }} className={css.title}>Wat du ai du during ze metch?</h3>
                    <div className={css.divider} />
                </div>
                <p className={css.info_text}>After starting the match, you're being redirected to the "series screen":</p>
                <div className={css.image_container}>
                    <img src={seriesScreenImg} alt="'Series screen'" className={css.image} style={{ width: '30vw', height: '37vh' }} />
                </div>
                <p className={css.info_text}>At the very top, there is stage name and number + which teams are now currently playing. <br />
                    In the center, there is a the scoreboard with scores of both teams. On the left side, there's always your picked team. <br />
                    At the bottom, there's gamble button. <br />
                    In general, all the rules are from Extended Mode, but there's only one difference: <br />
                </p>
                <b className={css.info_text}>The range for the multiplier is between <b style={{ color: 'red' }}>-1.5x</b> and <b style={{ color: 'green' }}>1.5x</b>,
                    where the <span style={{ textDecoration: 'underline' }}>win</span> counts when the multiplier is above <b>0x</b> and <span style={{ textDecoration: 'underline' }}>loss</span> counts when the multiplier is below <b>0x</b>.
                </b>
                <p className={css.info_text}>And the win <i>here</i> counts for <span style={{ textDecoration: 'underline' }}>your chosen team</span>. A bad multiplier (below 0x) counts then for the team, that is against your chosen team:</p>
                <div className={css.image_container}>
                    <img src={miniRoundRedImg} alt="Won mini-round for Team Red" className={css.image} style={{ width: '30vw', height: '40vh' }} />
                    <img src={miniRoundLimeImg} alt="Won mini-round for Team Lime" className={css.image} style={{ width: '30vw', height: '40vh' }} />
                </div>
                <p className={css.info_text}>And as it is a Best-of-3 in Rounds of 16, a team needs two sets to win:</p>
                <div className={css.image_container}>
                    <img src={seriesPointImg} alt="SERIES POINT for the Team Lime!" className={css.image} style={{ width: '30vw', height: '40vh' }} />
                    <span style={{ fontStyle: 'italic', color: 'black' }} className={css.info_text}>Team Lime lost this somehow :(</span>
                </div>
                <p className={css.info_text}>After one of the both teams wins, this team goes then into Quarterfinals and the loser team flies out of the tournament. The rectangle of the match gets either light-red or light-green, depending if your chosen team won <br />
                    (in my case, that was a loss for my chosen team):
                </p>
                <div className={css.image_container}>
                    <img src={finishedMatchRedImg} alt="Team Lime flies out and Team Red progresses into Quarterfinals" className={css.image} style={{ width: '35vw', height: '30vh' }} />
                </div>
                <div style={{ marginTop: '24px' }} className={css.divider_container}>
                    <h3 style={{ marginTop: '12px' }} className={css.title}>Wat tu du nekst?</h3>
                    <div className={css.divider} />
                </div>
                <p className={css.info_text}>Already finished match is finished, but you can click on it and see results of the match in that same modal:</p>
                <div className={css.image_container}>
                    <img src={finishedMatchModalImg} alt="Finished match modal" className={css.image} style={{ width: '30vw', height: '40vh' }} />
                </div>
                <p className={css.info_text}>The next match winner fills then second circle:</p>
                <div className={css.image_container}>
                    <img src={secondQuarterfinalistImg} alt="Second quarterfinalist" className={css.image} style={{ width: '35vw', height: '30vh' }} />
                    <span style={{ fontStyle: 'italic', color: 'black' }} className={css.info_text}>(P. s. You still are only able to start the match when all Rounds of 16 are finished)</span>
                </div>
                <p className={css.info_text}>On the header of the modal, we can see the reminder of whether your chosen team lost or won. <br />
                    And there is also a small label, which tells how many <b>Pick&apos;em points</b> you got. <br />
                    In the middle, there is general score of the match and in the footer, there is precise summary of all sets, that were played in this match and with which scores did each set end.
                </p>
                <p style={{ fontWeight: '800', marginTop: '12px' }} className={css.info_text}>Now, lemme explain about Pick'em points system: <br />
                    Since we are able to pick for every match, we need to get a reward, if chosen a winner team. <br />
                    If your chosen team wins in Round of 16, you get <i>+3 Pick&apos;em points</i> per match, <br />
                    if in Quarterfinals, you get <i>+5 Pick&apos;em points</i> per match, <br />
                    if in Semi-finals or in Third Place Decider, you get <i>+7 Pick&apos;em points</i> per match, <br />
                    and if in Grand Final, you get <i>+9 Pick&apos;em points</i>. <br />
                    If your chosen team loses in whatever stage, you get as many points as many sets your chosen team won but still lost overall.
                </p>
                <p className={css.info_text}>That's why also I get here <b>+1 Pick&apos;em point</b>, even though my chosen team lost overall:</p>
                <div className={css.image_container}>
                    <img src={finishedMatchModalImg} alt="Finished match modal" className={css.image} style={{ width: '30vw', height: '40vh' }} />
                </div>
                <p style={{ marginBottom: '24px' }} className={css.info_text}>And of course after building one Quarterfinal match, you proceed with further matches up to Grand Final.</p>
                <p className={css.info_text}>After Grand Final ends and there is determined a winner of the tournament, we get a winner screen:</p>
                <div className={css.image_container}>
                    <img src={winnersScreenImg} alt="Winner Screen" className={css.image} style={{ width: '30vw', height: '70vh' }} />
                    <span style={{ fontStyle: 'italic', color: 'black' }} className={css.info_text}>Third and fourth places are being decided in the Third Place Decider</span>
                </div>
                <p className={css.info_text}>By clicking "Proceed", you will be redirected to your end screen, where the results of your Pick&apos;ems are being shown:</p>
                <div className={css.image_container}>
                    <img src={resultsScreenImg} alt="Results Screen" className={css.image} style={{ width: '45vw', height: '70vh' }} />
                    <span style={{ fontStyle: 'italic', color: 'black' }} className={css.info_text}>(I increased the chances of multipliers, so I get this screen faster, that's why don't think that it is that easy to get such stats)</span>
                </div>
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