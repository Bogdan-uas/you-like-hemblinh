import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import GradientCaretLeft from "../../../components/GradientIcon/GradientCaretLeft.jsx";
import GradientCaretRight from "../../../components/GradientIcon/GradientCaretRight.jsx";
import { TeamCircle } from "./SwissMatch.jsx";
import { lightenHex, darkenHex, getBrightness } from "../logic/colors.js";
import { TIE_BANNER_COLOR, TIE_BANNER_GRADIENT } from "../logic/breakdownStyles.js";

const glow = (color) => `
    0 0 3px ${color},
    0 0 7px ${color}66,
    0 1px 3px rgba(0,0,0,0.4)
`;

const caretGradient = (color) => ({
    top: lightenHex(color, 0.18),
    middle: color,
    bottom: darkenHex(color, getBrightness(color) > 210 ? 0.22 : 0.35),
});

const WinnerCaret = ({ team, side }) => {
    if (!team?.color) return null;
    const Caret = side === "left" ? GradientCaretLeft : GradientCaretRight;
    return <Caret size={18} gradient={caretGradient(team.color)} glowColor={team.color} />;
};

const MiniScore = ({ round, leftTeam, rightTeam }) => {
    if (round.miniLeft == null || round.miniRight == null) return null;

    const side = (value, team, isWinner) => (
        <span
            style={{
                color: team?.color,
                opacity: isWinner ? 1 : 0.4,
                textShadow: isWinner ? glow(team?.color) : "none",
            }}
        >
            {value}
        </span>
    );

    return (
        <span className={css.vs} style={{ fontSize: "20px" }}>
            {side(round.miniLeft, leftTeam, round.winner === "left")}
            {" : "}
            {side(round.miniRight, rightTeam, round.winner === "right")}
        </span>
    );
};

export const ExtendedRoundsTrack = ({
    rounds,
    revealedCount = rounds.length,
    clinchIndex = null,
    decidedWinner = null,
    leftTeam,
    rightTeam,
    animate = true,
    showRoundNumbers = false,
    onTileClick = null,
}) => (
    <div className={css.ert_track}>
        {rounds.map((round, i) => {
            const revealed = i < revealedCount && !!round.winner;
            const isNext = !revealed && i === revealedCount;
            const team = round.winner === "left" ? leftTeam : rightTeam;
            const isClinch = revealed && clinchIndex === i;
            const lateDelay = animate && clinchIndex !== null && i > clinchIndex ? (i - clinchIndex) * 0.22 : 0;
            const clickable = revealed && !!onTileClick && !!round.roundKey;
            const faded = revealed && !!decidedWinner && round.winner !== decidedWinner;

            return (
                <motion.div
                    key={round.label}
                    data-ext-round-key={round.roundKey ?? undefined}
                    className={css.ert_slot}
                    initial={animate ? { opacity: 0, y: 24 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: animate ? 0.15 + i * 0.08 : 0, ease: "easeOut" }}
                >
                    <motion.span
                        className={css.ert_clinch}
                        initial={false}
                        animate={{ opacity: isClinch ? 1 : 0, y: isClinch ? 0 : 6 }}
                        transition={{ duration: 0.35, delay: isClinch && animate ? 0.3 : 0 }}
                        style={{
                            color: team?.color,
                            textShadow: isClinch ? glow(team?.color) : "none",
                        }}
                    >
                        Clinched!
                    </motion.span>

                    {revealed ? (
                        <motion.button
                            type="button"
                            key="face"
                            disabled={!clickable}
                            onClick={clickable ? () => onTileClick(round) : undefined}
                            title={clickable ? `Go to Round ${round.roundNumber}` : undefined}
                            className={`${css.ert_tile} ${clickable ? css.ert_tile_link : ""}`}
                            initial={animate ? { rotateY: 90, opacity: 0 } : false}
                            animate={{ rotateY: 0, opacity: faded ? 0.4 : 1 }}
                            transition={{
                                rotateY: { duration: 0.45, delay: lateDelay, ease: "easeOut" },
                                opacity: { duration: faded ? 0.8 : 0.45, delay: faded ? 0.4 : lateDelay },
                            }}
                            style={{
                                background: `linear-gradient(180deg, ${lightenHex(team?.color ?? "#999999", 0.55)} 0%, #ffffff 120%)`,
                                outline: isClinch ? `2px solid ${team?.color}` : "none",
                                boxShadow: isClinch ? glow(team?.color) : undefined,
                            }}
                        >
                            <span className={css.ert_tile_bar} style={{ background: team?.gradient ?? team?.color }} />
                            <span className={`${css.info_text} ${css.ert_tile_label}`}>{round.label}</span>
                            <span className={css.ert_tile_winner}>
                                {round.winner === "left" && <WinnerCaret team={team} side="left" />}
                                <TeamCircle team={team} specialStyle={{ width: "32px", height: "32px" }} />
                                {round.winner === "right" && <WinnerCaret team={team} side="right" />}
                            </span>
                            <span className={css.info_text} style={{ fontSize: "14px", fontWeight: 900, color: team?.color }}>
                                {team?.name}
                            </span>
                            <MiniScore round={round} leftTeam={leftTeam} rightTeam={rightTeam} />
                            {showRoundNumbers && round.roundNumber != null && (
                                <span className={`${css.info_text} ${css.ert_tile_round}`}>Round {round.roundNumber}</span>
                            )}
                        </motion.button>
                    ) : (
                        <div
                            key="back"
                            className={`${css.ert_tile} ${css.ert_tile_back} ${isNext ? `${css.match_current} ${css.ert_tile_next}` : ""}`}
                        >
                            <span className={`${css.info_text} ${css.ert_tile_label}`}>{round.label}</span>
                            <span className={css.ert_tile_winner}>
                                <TeamCircle team={null} />
                            </span>
                            <span className={css.info_text} style={{ fontSize: "14px", fontWeight: 900, visibility: "hidden" }}>
                                ?
                            </span>
                            {round.miniLeft != null && round.miniRight != null && (
                                <span className={css.vs} style={{ fontSize: "20px", visibility: "hidden" }}>?</span>
                            )}
                            {showRoundNumbers && round.roundNumber != null && (
                                <span className={`${css.info_text} ${css.ert_tile_round}`} style={{ visibility: "hidden" }}>?</span>
                            )}
                        </div>
                    )}

                    <motion.span
                        className={css.round_text}
                        initial={false}
                        animate={{ opacity: revealed ? 1 : 0, scale: revealed ? 1 : 0.6 }}
                        transition={{ duration: 0.35, delay: revealed ? lateDelay + 0.25 : 0 }}
                    >
                        <span style={{ color: leftTeam?.color }}>{round.tallyLeft}</span>
                        {" : "}
                        <span style={{ color: rightTeam?.color }}>{round.tallyRight}</span>
                    </motion.span>
                </motion.div>
            );
        })}
    </div>
);

const TieAnnouncement = ({ text }) => (
    <span
        className={css.round_text}
        style={{
            display: "inline-flex",
            fontSize: "30px",
            textShadow: glow(TIE_BANNER_COLOR),
        }}
    >
        {[...text].map((char, index) => (
            <motion.span
                key={`${index}-${char}`}
                initial={{ opacity: 0, y: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.015 }}
                style={{
                    display: "inline-block",
                    whiteSpace: "pre",
                    background: TIE_BANNER_GRADIENT,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                }}
            >
                {char}
            </motion.span>
        ))}
    </span>
);

export const ExtendedRoundsStatus = ({
    rounds,
    revealedCount,
    introShown,
    resolved,
    leftScore,
    rightScore,
    leftTeam,
    rightTeam,
    setNumber,
    setsToWin,
    seriesOver,
    renderTeamLabel,
}) => {
    const allRevealed = revealedCount >= rounds.length;
    const latest = rounds[revealedCount - 1];

    let key;
    let content;
    if (!introShown) {
        key = "intro";
        content = <>Comparing every Extended Round winner...</>;
    } else if (resolved && allRevealed && leftScore !== rightScore) {
        key = "won";
        content = (
            <>
                {renderTeamLabel(leftScore > rightScore ? leftTeam : rightTeam)} wins{" "}
                {seriesOver || setsToWin === 1 ? "the match" : `Set ${setNumber}`} on Extended Rounds!
            </>
        );
    } else if (resolved && allRevealed) {
        key = "tied";
        content = <TieAnnouncement text="Tied again!? Penalties are coming..." />;
    } else if (latest?.winner) {
        key = latest.label;
        content = (
            <>
                <strong>{latest.label}</strong> Extended Round winner is{" "}
                {renderTeamLabel(latest.winner === "left" ? leftTeam : rightTeam)}
            </>
        );
    } else {
        key = "first";
        content = <>First to 4 Extended Rounds wins, 3:3 means penalties</>;
    }

    return (
        <div style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div
                key={key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{ color: "#2e2f42", fontSize: "20px", textAlign: "center" }}
            >
                {content}
            </motion.div>
        </div>
    );
};
