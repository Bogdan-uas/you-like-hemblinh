import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { TeamCircle } from "./SwissMatch.jsx";
import { RoundScore } from "./RoundScore.jsx";
import { LeadingIndicator, LeadChevron } from "./LeadingIndicator.jsx";
import { BreakdownSquares } from "./BreakdownParts.jsx";
import { lightenHex, getBrightness } from "../logic/colors.js";
import { TIE_BANNER_GRADIENT } from "../logic/breakdownStyles.js";

const EXTENDED_ROUNDS_TO_WIN = 4;
const LABEL_TONES = [null, css.ot_level_1, css.ot_level_2, css.ot_level_3, css.ot_level_4];
const FLIP_OUT = { duration: 0.22, ease: "easeIn" };
const FLIP_IN = { duration: 0.32, ease: "easeOut" };

const pillStyle = (team) => ({
    background: team?.gradient,
    color: getBrightness(team?.color ?? "#2e2f42") > 190 ? "#2e2f42" : "#ffffff",
});

const gradientText = (team) => ({
    backgroundImage: team?.gradient,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
});

const scoreTone = (own, other) => (own > other ? css.set_chip_win : own < other ? css.set_chip_loss : "");

const CardLabel = ({ index, label }) => (
    <span className={`${css.ert_card_label} ${index >= 2 ? LABEL_TONES[index - 1] : css.ert_card_label_half}`}>
        {label}
    </span>
);

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
            const hasMinis = round.miniLeft != null && round.miniRight != null;
            const cardClass = `${css.ert_card} ${showRoundNumbers ? css.ert_card_tall : ""}`;

            return (
                <motion.div
                    key={round.label}
                    data-ext-round-key={round.roundKey ?? undefined}
                    className={css.ert_slot}
                    initial={animate ? { opacity: 0, y: 18 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: animate ? 0.15 + i * 0.08 : 0, ease: "easeOut" }}
                >
                    <div className={css.ert_clinch_slot}>
                        <AnimatePresence initial={false}>
                            {isClinch ? (
                                <motion.span
                                    key="clinch"
                                    className={css.point_pill}
                                    initial={{ opacity: 0, y: 8, scale: 0.85 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.85 }}
                                    transition={{ duration: 0.55, ease: "easeInOut", delay: animate ? 0.35 : 0 }}
                                    style={{ ...pillStyle(team), fontSize: "11px", padding: "3px 9px" }}
                                >
                                    Clinched!
                                </motion.span>
                            ) : null}
                        </AnimatePresence>
                    </div>

                    <div className={css.ert_card_stage}>
                        <AnimatePresence mode="wait" initial={false}>
                            {revealed ? (
                                <motion.button
                                    type="button"
                                    key="face"
                                    disabled={!clickable}
                                    onClick={clickable ? () => onTileClick(round) : undefined}
                                    title={clickable ? `Go to Round ${round.roundNumber}` : `${round.title}: Team ${team?.name}`}
                                    className={`${cardClass} ${clickable ? css.ert_card_link : ""}`}
                                    initial={{ rotateY: -90 }}
                                    animate={{ rotateY: 0, opacity: faded ? 0.4 : 1 }}
                                    transition={{
                                        rotateY: FLIP_IN,
                                        opacity: { duration: 0.6, delay: faded && animate ? 0.4 : 0 },
                                    }}
                                    style={{
                                        transformPerspective: 600,
                                        "--ert-color": team?.color ?? "#999999",
                                        background: `linear-gradient(${round.winner === "left" ? "90deg" : "270deg"}, ${lightenHex(team?.color ?? "#999999", 0.82)} 0%, #ffffff 78%)`,
                                        boxShadow: isClinch
                                            ? `0 0 0 2px ${team?.color}, 0 0 12px ${team?.color}66, var(--ui-shadow)`
                                            : undefined,
                                    }}
                                >
                                    <CardLabel index={i} label={round.label} />
                                    <span className={css.ert_card_winner}>
                                        <motion.span
                                            className={css.ert_card_chevron}
                                            style={{ [round.winner === "left" ? "right" : "left"]: "calc(100% + 5px)" }}
                                            initial={animate ? { opacity: 0, x: round.winner === "left" ? 8 : -8 } : false}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, ease: "easeOut", delay: animate ? lateDelay + 0.3 : 0 }}
                                        >
                                            <LeadChevron color={team?.color ?? "#999999"} size={15} side={round.winner} />
                                        </motion.span>
                                        <TeamCircle
                                            team={team}
                                            specialStyle={{ width: "32px", height: "32px", boxShadow: `0 0 0 2px #fff, 0 0 10px ${team?.color}99` }}
                                        />
                                    </span>
                                    <span className={css.ert_card_name} style={gradientText(team)}>{team?.name}</span>
                                    {hasMinis || (showRoundNumbers && round.roundNumber != null) ? (
                                        <span className={css.ert_card_footer}>
                                            {hasMinis ? (
                                                <span className={css.ert_card_score}>
                                                    <span className={scoreTone(round.miniLeft, round.miniRight)}>{round.miniLeft}</span>
                                                    <span className={css.set_chip_colon}>:</span>
                                                    <span className={scoreTone(round.miniRight, round.miniLeft)}>{round.miniRight}</span>
                                                </span>
                                            ) : null}
                                            {showRoundNumbers && round.roundNumber != null ? (
                                                <span className={css.ert_card_round}>Round {round.roundNumber}</span>
                                            ) : null}
                                        </span>
                                    ) : null}
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="back"
                                    className={`${cardClass} ${css.ert_card_back} ${isNext ? css.ert_card_next : ""}`}
                                    exit={{ rotateY: 90, transition: { ...FLIP_OUT, delay: lateDelay } }}
                                    style={{ transformPerspective: 600 }}
                                >
                                    <CardLabel index={i} label={round.label} />
                                    <span className={css.ert_card_winner}>
                                        <TeamCircle team={null} />
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.span
                        className={css.ert_tally}
                        initial={false}
                        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : -4 }}
                        transition={{ duration: 0.4, delay: revealed && animate ? lateDelay + 0.45 : 0 }}
                    >
                        <span style={gradientText(leftTeam)}>{round.tallyLeft}</span>
                        <span className={css.set_chip_colon}>:</span>
                        <span style={gradientText(rightTeam)}>{round.tallyRight}</span>
                    </motion.span>
                </motion.div>
            );
        })}
    </div>
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
}) => {
    const allRevealed = revealedCount >= rounds.length;
    const latest = rounds[revealedCount - 1];
    const neutral = { background: "linear-gradient(180deg, #4a4c66 0%, #2e2f42 100%)", color: "#ffffff" };

    let key;
    let style = neutral;
    let side = null;
    let text;
    if (!introShown) {
        key = "intro";
        text = "Comparing every Extended Round winner...";
    } else if (allRevealed && leftScore !== rightScore) {
        const winner = leftScore > rightScore ? leftTeam : rightTeam;
        key = "won";
        style = pillStyle(winner);
        side = leftScore > rightScore ? "left" : "right";
        text = `Team ${winner?.name} wins ${seriesOver || setsToWin === 1 ? "the match" : `Set ${setNumber}`} on Extended Rounds!`;
    } else if (resolved && allRevealed) {
        key = "tied";
        style = { background: TIE_BANNER_GRADIENT, color: "#ffffff" };
        text = "Tied again!? Penalties are coming...";
    } else if (latest?.winner) {
        const winner = latest.winner === "left" ? leftTeam : rightTeam;
        key = latest.label;
        style = pillStyle(winner);
        side = latest.winner;
        text = `${latest.title} goes to Team ${winner?.name}`;
    } else {
        key = "first";
        text = `First to ${EXTENDED_ROUNDS_TO_WIN} Extended Rounds wins, 3:3 means Penalties`;
    }

    return (
        <div className={css.turn_slot} aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={key}
                    className={css.turn_pill}
                    initial={{ opacity: 0, rotateX: -90, y: 6 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    exit={{ opacity: 0, rotateX: 90, y: -6 }}
                    transition={{ duration: 0.32, ease: "easeInOut" }}
                    style={{
                        ...style,
                        flexDirection: side === "right" ? "row-reverse" : "row",
                        transformPerspective: 500,
                        marginBottom: 0,
                    }}
                >
                    {side ? (
                        <motion.span
                            className={css.turn_pill_arrow}
                            animate={{ x: side === "left" ? [0, -3, 0] : [0, 3, 0] }}
                            transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
                        >
                            {side === "left" ? <FaCaretLeft /> : <FaCaretRight />}
                        </motion.span>
                    ) : null}
                    <span>{text}</span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const ExtendedRoundsSide = ({ team, score, side, dimmed }) => (
    <motion.div
        className={css.ert_side}
        initial={false}
        animate={{ opacity: dimmed ? 0.4 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ alignItems: side === "left" ? "flex-start" : "flex-end" }}
    >
        <span
            className={`${side === "left" ? css.team_name_left : css.team_name_right} ${css.team_name_fancy}`}
            data-side={side}
            style={{ "--team-color": team?.color, display: "inline-block", ...gradientText(team) }}
        >
            <span className={css.team_name_prefix}>Team</span>{" "}
            <span className={css.team_name_main}>{team?.name}</span>
        </span>
        <div className={css.ert_side_row} style={{ flexDirection: side === "left" ? "row" : "row-reverse" }}>
            <BreakdownSquares team={team} lit={Math.min(score, EXTENDED_ROUNDS_TO_WIN)} total={EXTENDED_ROUNDS_TO_WIN} side={side} />
            <span style={{ display: "flex", justifyContent: "center", width: "50.1px" }}>
                <RoundScore value={score} team={team} highlighted={score >= EXTENDED_ROUNDS_TO_WIN} />
            </span>
        </div>
    </motion.div>
);

export const ExtendedRoundsOverlay = ({ seriesState, details, setsToWin }) => {
    const {
        leftTeam,
        rightTeam,
        roundWins,
        roundLosses,
        extRoundLeftScore: leftScore,
        extRoundRightScore: rightScore,
        extRoundRevealIndex: revealIndex,
        extRoundCommentaryShown: introShown,
        banner,
    } = seriesState;
    const total = details.rounds.length;
    const allRevealed = revealIndex >= total;
    const decided = allRevealed && leftScore !== rightScore ? (leftScore > rightScore ? "left" : "right") : null;
    const revealedCount = introShown ? revealIndex : 0;

    return (
        <motion.div
            className={css.ert_overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <motion.div
                className={css.ert_panel}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <span className={css.match_modal_caption} style={{ marginBottom: 0 }}>
                    Still {roundWins}:{roundLosses} after Quadruple Overtime
                </span>
                <span className={`${css.best_of_badge} ${css.overtime_badge}`} style={{ fontSize: 18 }}>
                    <span className={`${css.overtime_badge_label} ${css.ert_badge_label}`}>Extended Rounds</span>
                    <span className={css.overtime_badge_target}>
                        First to <b>{EXTENDED_ROUNDS_TO_WIN}</b>
                    </span>
                </span>

                <div className={css.ert_scoreboard}>
                    <ExtendedRoundsSide team={leftTeam} score={leftScore} side="left" dimmed={decided === "right"} />
                    <div className={css.ert_center}>
                        <LeadingIndicator
                            leftTeam={leftTeam}
                            rightTeam={rightTeam}
                            leftScore={leftScore}
                            rightScore={rightScore}
                            size={28}
                            width={64}
                        />
                        <span className={`${css.best_of_badge} ${css.round_badge}`} style={{ fontSize: 14 }}>
                            <span className={css.round_badge_label}>Compared</span>
                            <span className={css.round_badge_value}>{revealedCount}/{total}</span>
                        </span>
                    </div>
                    <ExtendedRoundsSide team={rightTeam} score={rightScore} side="right" dimmed={decided === "left"} />
                </div>

                <ExtendedRoundsTrack
                    rounds={details.rounds}
                    revealedCount={revealedCount}
                    clinchIndex={details.clinchIndex}
                    decidedWinner={decided}
                    leftTeam={leftTeam}
                    rightTeam={rightTeam}
                />

                <ExtendedRoundsStatus
                    rounds={details.rounds}
                    revealedCount={revealIndex}
                    introShown={introShown}
                    resolved={
                        seriesState.tiebreakerBigSymbol === "=" ||
                        !!banner ||
                        seriesState.playerWonSets + seriesState.playerLostSets >= seriesState.setNumber
                    }
                    leftScore={leftScore}
                    rightScore={rightScore}
                    leftTeam={leftTeam}
                    rightTeam={rightTeam}
                    setNumber={seriesState.setNumber}
                    setsToWin={setsToWin}
                    seriesOver={!!banner}
                />
            </motion.div>
        </motion.div>
    );
};
