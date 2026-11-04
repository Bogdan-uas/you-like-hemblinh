import CountUp from "react-countup";
import css from "../SpecialModePage.module.css";
import progressCss from "../progress/Progress.module.css";
import { progressOpenSummaryThen, useProgress } from "../progress/progressStore.js";
import { NeededPerkTag } from "../progress/HudPerks.jsx";
import { perkUseLabel } from "../progress/progressEngine.js";
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
    const { activePhase, isCstPhase, isEclPhase, isGccPhase, isSkylinesPhase, isPgxEventPhase } = phase;
    const { handlePemProceedToNextEvent, handleBackToHome, handleBackToSpecialStart, handleBackToGambling, setShowPickemSummary, setShowWinnersScreen } = actions;
    const { progress } = useProgress();
    const perkUses = progress.lastSummary?.perks;
    const perkParts = perkUses
        ? [
            perkUses.neededCut ? `${perkUses.neededCut.pct}% fewer needed Pick'em points (${perkUses.neededCut.after} instead of ${perkUses.neededCut.before})` : null,
            ...["insurance", "gfBonus", "upsetBonus", "longShotBonus", "streakBonus", "comebackBonus", "sweepBonus", "overtimeBonus", "deciderBonus", "knockoutBonus", "longSeriesBonus"].map((type) => {
                const uses = (perkUses.uses || []).filter((u) => u.type === type);
                if (!uses.length) return null;
                return `${perkUseLabel(type)} +${uses.reduce((sum, u) => sum + u.points, 0)}`;
            }),
            (() => {
                const returned = (perkUses.uses || []).filter((u) => u.type === "insuranceReturned").length;
                return returned ? `Pick'em Insurance returned ×${returned}` : null;
            })(),
            (() => {
                const shields = (perkUses.uses || []).filter((u) => u.type === "streakShield").length;
                return shields ? `Streak Shield ×${shields}` : null;
            })(),
        ].filter(Boolean)
        : [];

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
                            <NeededPerkTag value={neededPickemPoints} cut={perkUses?.neededCut ?? null} />
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
                    {perkParts.length ? <p className={progressCss.perk_line}>Level benefits: {perkParts.join(" · ")}</p> : null}
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
                        const toBracket = () => {
                            setShowPickemSummary(false);
                            setShowWinnersScreen(false);
                        };
                        if (!progressOpenSummaryThen(toBracket)) toBracket();
                    }}>
                        To the bracket
                    </button>
                    {activePhase === "qualifier" || isCstPhase || isEclPhase || isGccPhase || isSkylinesPhase || isPgxEventPhase ? (
                        <button className={css.gamble_button} onClick={handlePemProceedToNextEvent} data-proceed-button>
                            Proceed
                        </button>
                    ) : (
                        <>
                    <button className={css.gamble_button} onClick={handleBackToSpecialStart}>
                        Back to the start of Special Mode
                    </button>
                    <button className={css.gamble_button} onClick={handleBackToGambling}>
                        Back to normal Gambling
                    </button>
                    <button className={css.gamble_button} onClick={handleBackToHome}>
                        To Home Page
                    </button>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
