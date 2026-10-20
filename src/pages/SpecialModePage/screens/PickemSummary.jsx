import CountUp from "react-countup";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { PickemAchievedCounter } from "../components/PickemAchievedCounter.jsx";

export function PickemSummary({ pickem, phase, actions }) {
    const {
        finalPickemPoints,
        guessedCounts,
        pickemSummarySeen,
        showPickemLine2,
        showPickemAchieved,
        pickemCountSettled,
        showPickemResult,
        showPickemButtons,
        pickemSentenceStep,
        buildPickemSentenceParts,
        buildPickemSentence,
        neededPickemPoints,
        isPickemWin,
        setPickemCountSettled,
    } = pickem;
    const { activePhase, isCstPhase, isEclPhase, isGccPhase } = phase;
    const { handlePemProceedToNextEvent, resetSpecialModeState, setShowPickemSummary, setShowWinnersScreen, navigate } = actions;

    const lossBasedPoints =
        (finalPickemPoints ?? 0) - (guessedCounts?.correct ?? 0);

    const seen = pickemSummarySeen;
    const showNeeded = seen || showPickemLine2;
    const showAchieved = seen || showPickemAchieved;
    const settled = seen || pickemCountSettled;
    const showResult = seen || showPickemResult;
    const showButtons = seen || showPickemButtons;
    const labelStyle = { fontSize: "32px", fontWeight: 700, textAlign: "center" };

    const showLossLine = seen || pickemSentenceStep > buildPickemSentenceParts().length;
    return (
        <div className={css.page_wrapper}>
            <div className={css.game_container}>
                <p
                    className={css.info_text}
                    style={{ marginBottom: "24px", fontSize: "32px", fontWeight: "700", textAlign: "center", width: "min(1240px, 94vw)" }}
                >
                    {buildPickemSentence()} <br />
                    {lossBasedPoints !== 0 && (
                        <span
                            style={{
                                color: "#d4cebaff",
                                fontWeight: "700",
                                opacity: showLossLine ? 1 : 0,
                                transition: "opacity 0.8s ease",
                            }}
                        >
                            <span style={{ fontWeight: "800" }}>+{lossBasedPoints}</span> {" "}
                            Pick&apos;em point{lossBasedPoints === 1 ? "" : "s"} from correctly guessed sets in not guessed matches
                        </span>
                    )}
                </p>

                <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "64px", marginBottom: "12px" }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: showNeeded ? 1 : 0, y: showNeeded ? 0 : 14 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}
                    >
                        <span className={css.info_text} style={labelStyle}>Needed Pick&apos;em points</span>
                        <span className={css.points}>
                            {showNeeded && !seen
                                ? <CountUp start={0} duration={1.2} end={neededPickemPoints} key={neededPickemPoints} />
                                : neededPickemPoints}
                        </span>
                    </motion.div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <motion.span
                            initial={false}
                            animate={{ opacity: showAchieved ? 1 : 0 }}
                            transition={{ duration: 0.8 }}
                            className={css.info_text}
                            style={labelStyle}
                        >
                            Achieved Pick&apos;em points
                        </motion.span>
                        <PickemAchievedCounter
                            run={showAchieved}
                            instant={seen}
                            finalPoints={finalPickemPoints}
                            neededPoints={neededPickemPoints}
                            onSettled={() => setPickemCountSettled(true)}
                            className={css.points}
                            style={{
                                fontWeight: 700,
                                backgroundColor: settled ? (isPickemWin ? "#2e7d32" : "red") : undefined,
                                color: settled ? "#fff" : undefined,
                                transition: "background-color 0.6s ease, color 0.6s ease",
                            }}
                        />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showResult ? 1 : 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <p
                        className={css.info_text}
                        style={{ marginBottom: "8px", fontSize: "32px", fontWeight: "bold", textAlign: "center" }}
                    >
                        and that's why:
                    </p>

                    <h1
                        className={css.game_title}
                        style={{
                            color: isPickemWin ? "#00ff7f" : "#ff4c4c",
                            textShadow: isPickemWin
                                ? "0 0 5px rgba(0,255,127,0.8)"
                                : "0 0 5px rgba(255,76,76,0.8)",
                            fontSize: "52px"
                        }}
                    >
                        {isPickemWin ? "You Won! 🎉" : "You Lost! 😢"}
                    </h1>
                </motion.div>

                <motion.div
                    initial={false}
                    animate={{ opacity: showButtons ? 1 : 0 }}
                    transition={{ duration: 0.8 }}
                    aria-hidden={!showButtons}
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "16px",
                        justifyContent: "center",
                        marginTop: "16px",
                        pointerEvents: showButtons ? "auto" : "none",
                    }}
                >
                    <button className={`${css.gamble_button} ${css.back_button}`} onClick={() => {
                        setShowPickemSummary(false);
                        setShowWinnersScreen(false);
                    }}>
                        To the bracket
                    </button>
                    {activePhase === "qualifier" || isCstPhase || isEclPhase || isGccPhase ? (
                        <button className={css.gamble_button} onClick={handlePemProceedToNextEvent} data-proceed-button>
                            Proceed
                        </button>
                    ) : (
                        <>
                    <button className={css.gamble_button} onClick={resetSpecialModeState}>
                        Back to the start of Special Mode
                    </button>
                    <button className={css.gamble_button} onClick={() => { resetSpecialModeState(); navigate("/gambling"); }}>
                        Back to normal Gambling
                    </button>
                    <button className={css.gamble_button} onClick={() => { resetSpecialModeState(); navigate("/"); }}>
                        To Home Page
                    </button>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
