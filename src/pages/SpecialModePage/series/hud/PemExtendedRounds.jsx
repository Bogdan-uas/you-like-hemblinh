// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import css from "./PemHud.module.css";
import { PemCircle, PemHalf, PemMainFrame, PemMiniGrid, PemNameTab, PemTrophy } from "./PemParts.jsx";
import { getErStatus } from "./pemHud.js";

const EXTENDED_ROUNDS_TO_WIN = 4;
const FLIP_OUT = { duration: 0.22, ease: "easeIn" };
const FLIP_IN = { duration: 0.32, ease: "easeOut" };

const tone = (own, other) => (own > other ? css.chip_win : own < other ? css.chip_loss : "");

export const PemErTrack = ({
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
    <div className={`${css.hud} ${css.er_track}`}>
        {rounds.map((round, i) => {
            const revealed = i < revealedCount && !!round.winner;
            const isNext = !revealed && i === revealedCount;
            const team = round.winner === "left" ? leftTeam : rightTeam;
            const isClinch = revealed && clinchIndex === i;
            const lateDelay = animate && clinchIndex !== null && i > clinchIndex ? (i - clinchIndex) * 0.22 : 0;
            const clickable = revealed && !!onTileClick && !!round.roundKey;
            const faded = revealed && !!decidedWinner && round.winner !== decidedWinner;
            const hasMinis = round.miniLeft != null && round.miniRight != null;

            return (
                <motion.div
                    key={round.label}
                    data-ext-round-key={round.roundKey ?? undefined}
                    className={css.er_slot}
                    initial={animate ? { opacity: 0, y: 18 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: animate ? 0.15 + i * 0.08 : 0, ease: "easeOut" }}
                >
                    <div className={css.er_clinch_slot}>
                        <AnimatePresence initial={false}>
                            {isClinch ? (
                                <motion.span
                                    key="clinch"
                                    className={css.er_clinch}
                                    initial={{ opacity: 0, y: 8, scale: 0.85 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.85 }}
                                    transition={{ duration: 0.5, ease: "easeInOut", delay: animate ? 0.35 : 0 }}
                                >
                                    Clinched
                                </motion.span>
                            ) : null}
                        </AnimatePresence>
                    </div>
                    <div className={css.er_stage}>
                        <AnimatePresence mode="wait" initial={false}>
                            {revealed ? (
                                <motion.button
                                    type="button"
                                    key="face"
                                    disabled={!clickable}
                                    onClick={clickable ? () => onTileClick(round) : undefined}
                                    title={clickable ? `Go to Round ${round.roundNumber}` : `${round.title}: Team ${team?.name}`}
                                    className={`${css.panel} ${css.er_card} ${showRoundNumbers ? css.er_card_tall : ""} ${isClinch ? css.er_card_clinch : ""} ${clickable ? css.er_card_link : ""}`}
                                    initial={{ rotateY: -90 }}
                                    animate={{ rotateY: 0, opacity: faded ? 0.42 : 1 }}
                                    transition={{ rotateY: FLIP_IN, opacity: { duration: 0.6, delay: faded && animate ? 0.4 : 0 } }}
                                    style={{ transformPerspective: 600, "--team-color": team?.color, "--team-gradient": team?.gradient }}
                                >
                                    <span className={css.er_card_label}>{round.label}</span>
                                    <span className={css.er_card_winner}>
                                        <span className={css.er_card_caret} style={{ [round.winner === "left" ? "right" : "left"]: "calc(100% + 4px)" }}>
                                            {round.winner === "left" ? <FaCaretLeft aria-hidden="true" /> : <FaCaretRight aria-hidden="true" />}
                                        </span>
                                        <PemCircle team={team} className={css.er_circle} />
                                    </span>
                                    <span className={css.er_card_name}>{team?.name}</span>
                                    {hasMinis ? (
                                        <span className={css.er_card_score}>
                                            <span className={tone(round.miniLeft, round.miniRight)}>{round.miniLeft}</span>
                                            <span className={css.chip_colon}>:</span>
                                            <span className={tone(round.miniRight, round.miniLeft)}>{round.miniRight}</span>
                                        </span>
                                    ) : null}
                                    {showRoundNumbers && round.roundNumber != null ? <span className={css.er_card_round}>Round {round.roundNumber}</span> : null}
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="back"
                                    className={`${css.er_card} ${showRoundNumbers ? css.er_card_tall : ""} ${css.er_card_back} ${isNext ? css.er_card_next : ""}`}
                                    exit={{ rotateY: 90, transition: { ...FLIP_OUT, delay: lateDelay } }}
                                    style={{ transformPerspective: 600 }}
                                >
                                    <span className={css.er_card_label}>{round.label}</span>
                                    <span className={css.er_card_unknown}>?</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <motion.span
                        className={css.er_tally}
                        initial={false}
                        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : -4 }}
                        transition={{ duration: 0.4, delay: revealed && animate ? lateDelay + 0.45 : 0 }}
                    >
                        <span className={tone(round.tallyLeft, round.tallyRight)}>{round.tallyLeft}</span>
                        <span className={css.chip_colon}>:</span>
                        <span className={tone(round.tallyRight, round.tallyLeft)}>{round.tallyRight}</span>
                    </motion.span>
                </motion.div>
            );
        })}
    </div>
);

export const PemExtendedRoundsOverlay = ({ seriesState, details, setsToWin, pemType, theme = "pem" }) => {
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
    const status = getErStatus({
        rounds: details.rounds,
        revealIndex,
        introShown,
        resolved: seriesState.tiebreakerBigSymbol === "=" || !!banner || seriesState.playerWonSets + seriesState.playerLostSets >= seriesState.setNumber,
        leftScore,
        rightScore,
        leftTeam,
        rightTeam,
        setNumber: seriesState.setNumber,
        setsToWin,
        seriesOver: !!banner,
    });

    return (
        <motion.div className={`${css.hud} ${css[`theme_${theme}`] ?? ""} ${css.er_overlay}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }}>
            <motion.div
                className={css.er_panel}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <div className={`${css.panel} ${css.strip} ${css.er_strip}`}>
                    <span className={css.strip_deco} aria-hidden="true" />
                    <span className={css.strip_side}>Still {roundWins}-{roundLosses} after Quadruple Overtime</span>
                    <span className={css.strip_trophy}>
                        <PemTrophy type={pemType} size={38} className={css.trophy} />
                    </span>
                    <span className={`${css.strip_side} ${css.strip_side_right}`}>Extended Rounds | First to {EXTENDED_ROUNDS_TO_WIN}</span>
                </div>
                <PemMainFrame>
                    <PemHalf
                        side="left"
                        team={leftTeam}
                        score={leftScore}
                        setsTotal={0}
                        slots={<PemMiniGrid team={leftTeam} total={EXTENDED_ROUNDS_TO_WIN} lit={Math.min(leftScore, EXTENDED_ROUNDS_TO_WIN)} side="left" />}
                        dimmed={decided === "right"}
                        winner={decided === "left"}
                    />
                    <div className={`${css.centre} ${css.centre_tiebreak}`}>
                        <span className={css.centre_top}>Compared</span>
                        <span className={css.centre_bottom}>{revealedCount} / {total}</span>
                    </div>
                    <PemHalf
                        side="right"
                        team={rightTeam}
                        score={rightScore}
                        setsTotal={0}
                        slots={<PemMiniGrid team={rightTeam} total={EXTENDED_ROUNDS_TO_WIN} lit={Math.min(rightScore, EXTENDED_ROUNDS_TO_WIN)} side="right" />}
                        dimmed={decided === "left"}
                        winner={decided === "right"}
                    />
                </PemMainFrame>
                <div className={css.under}>
                    <PemNameTab side="left" team={leftTeam} />
                    <span />
                    <PemNameTab side="right" team={rightTeam} />
                </div>

                <PemErTrack
                    rounds={details.rounds}
                    revealedCount={revealedCount}
                    clinchIndex={details.clinchIndex}
                    decidedWinner={decided}
                    leftTeam={leftTeam}
                    rightTeam={rightTeam}
                />

                <div className={css.er_status_slot} aria-live="polite">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={status.key}
                            className={css.er_status}
                            style={{ "--team-gradient": status.team?.gradient ?? "linear-gradient(180deg, #2645cc, #13248a)" }}
                            initial={{ opacity: 0, x: -24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 24 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <span className={css.er_status_label}>{status.label}</span>
                            <span className={css.er_status_text}>{status.text}</span>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};
