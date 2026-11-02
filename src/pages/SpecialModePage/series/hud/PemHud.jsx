import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import css from "./PemHud.module.css";
import { isCheatTargeting } from "../../logic/secretCheats.js";
import { PemStreak } from "./PemStreak.jsx";
import { ClayIntro } from "./ClayIntro.jsx";
import { GccHalftime, GccIntro, GccRoundFlash, GccStinger, GccStreakGlow } from "./GccHud.jsx";
import { PemTrophy, PemCircle, PemHalf, PemMainFrame, PemMiniGrid, PemPenaltyGrid, PemNameTab, PemSetChips } from "./PemParts.jsx";
import {
    STINGER_EDGE_MS,
    STINGER_MIN_MS,
    buildPemSetChips,
    getPemHalfIndex,
    getPemExtendedCue,
    getPemStingerCue,
    isFreshPemSeries,
    isPemExtendedRoundNow,
    pemOvertimeName,
    pemTextOn,
} from "./pemHud.js";

const INTRO_MS = 2800;

const Stinger = ({ seriesState, setsToWin, pemType }) => {
    const action = seriesState.pendingAction;
    const [timed, setTimed] = useState(null);

    useEffect(() => {
        if (!action?.executeAt) return undefined;
        const remaining = action.executeAt - Date.now();
        const cue = getPemStingerCue(seriesState, setsToWin);
        if (!cue || remaining < STINGER_MIN_MS) return undefined;
        setTimed({ key: action.executeAt, ...cue });
        const timer = setTimeout(() => setTimed(null), remaining);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action?.executeAt]);

    const shown = (timed && action?.executeAt === timed.key ? timed : null) ?? getPemExtendedCue(seriesState);
    const edge = { duration: STINGER_EDGE_MS / 1000, ease: "easeInOut" };

    return (
        <AnimatePresence>
            {shown ? (
                <motion.div
                    key={shown.key}
                    className={css.stinger}
                    initial={{ clipPath: "inset(0 100% 0 0%)" }}
                    animate={{ clipPath: "inset(0 0% 0 0%)", transition: edge }}
                    exit={{ clipPath: "inset(0 0% 0 100%)", transition: edge }}
                    aria-hidden="true"
                >
                    <span className={css.stinger_edge} />
                    <PemTrophy type={pemType} size={40} className={css.stinger_trophy} />
                    <span className={css.stinger_body}>
                        <motion.span
                            className={css.stinger_sub}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: STINGER_EDGE_MS / 1000 }}
                        >
                            {shown.sub}
                        </motion.span>
                        <motion.span
                            className={css.stinger_text}
                            initial={{ letterSpacing: "0.45em", opacity: 0 }}
                            animate={{ letterSpacing: "0.1em", opacity: 1 }}
                            transition={{ duration: 0.55, delay: STINGER_EDGE_MS / 1000, ease: "easeOut" }}
                        >
                            {shown.text}
                        </motion.span>
                    </span>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

const getCentre = ({ seriesState: s, setsToWin, displayedRound, point, penaltyAttempt, suddenDeath, winnerTeam }) => {
    if (s.banner) {
        return s.banner.tie
            ? { tone: "final", top: "Draw", bottom: `Best of ${setsToWin * 2 - 1}` }
            : { tone: "gg", top: "GG", bottom: `Team ${winnerTeam?.name}` };
    }
    if (s.tiebreakerPhase === "penalties") return { tone: "tiebreak", top: "Penalties", bottom: suddenDeath ? "Sudden death" : `Attempt ${penaltyAttempt}` };
    if (s.tiebreakerPhase === "extended") return { tone: "tiebreak", top: "Tiebreaker", bottom: "Extended Rounds" };
    if (point) return { tone: "alert", top: point.label, bottom: `Round ${displayedRound}` };
    if (isPemExtendedRoundNow(s)) return { tone: "extended", top: `Round ${displayedRound}`, bottom: "Extended Round" };
    return { tone: "normal", top: `Round ${displayedRound}`, bottom: getPemHalfIndex(s) === 0 ? "1st Half" : "2nd Half" };
};

const UnderBox = ({ seriesState: s, overtimeToWin, winnerTeam, setsToWin }) => {
    let content = null;
    let key = "none";
    let tone = "";

    if (s.banner && !s.banner.tie) {
        key = "gg";
        tone = css.under_box_gg;
        content = (
            <>
                <span className={css.under_box_top}>Wins the series</span>
                <span className={css.under_box_bottom}>{Math.max(s.playerWonSets ?? 0, s.playerLostSets ?? 0)}-{Math.min(s.playerWonSets ?? 0, s.playerLostSets ?? 0)}{setsToWin === 1 ? ` · ${s.roundWins}-${s.roundLosses}` : ""}</span>
            </>
        );
    } else if (s.tiebreakerPhase === "penalties" && !s.penaltyResolved) {
        const side = s.penaltyTurn;
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        key = `shoot-${side}`;
        content = (
            <>
                <span className={css.under_box_top}>
                    {side === "left" ? <FaCaretLeft aria-hidden="true" /> : null}
                    Shoots
                    {side === "right" ? <FaCaretRight aria-hidden="true" /> : null}
                </span>
                <span className={css.under_box_bottom}>Team {team?.name}</span>
            </>
        );
    } else if (s.isOvertime && s.tiebreakerPhase === "idle" && !s.banner) {
        const block = Math.max(1, s.overtimeBlock ?? 1);
        key = `ot-${block}`;
        content = (
            <>
                <span className={css.under_box_top}>{pemOvertimeName(block)}</span>
                <span className={css.under_box_bottom}>First to {overtimeToWin}</span>
            </>
        );
    }

    return (
        <div className={css.under_slot}>
            <AnimatePresence initial={false}>
                {content ? (
                    <motion.span
                        key={key}
                        className={`${css.panel} ${css.under_box} ${tone}`}
                        style={tone ? { background: winnerTeam?.gradient, color: pemTextOn(winnerTeam?.color) } : undefined}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {content}
                    </motion.span>
                ) : null}
            </AnimatePresence>
        </div>
    );
};


export function PemScorebug({
    theme = "pem",
    entrance = false,
    seriesState,
    setsToWin,
    displayedRound,
    eventName,
    eventNumber,
    stageText,
    pemType,
    point,
    loserOpacity,
    activeCheat,
    finalRoundMinis,
    displayedMiniSquares,
    penaltyAttempt,
    suddenDeath,
    penaltyAttempts,
    overtimeToWin,
}) {
    const s = seriesState;
    const bannerAtMountRef = useRef(!!seriesState.banner);
    const celebrate = !bannerAtMountRef.current;
    const isPens = s.tiebreakerPhase === "penalties";
    const isExtended = s.tiebreakerPhase === "extended";
    const winnerSide = s.banner && !s.banner.tie ? ((s.playerWonSets ?? 0) >= (s.playerLostSets ?? 0) ? "left" : "right") : null;
    const winnerTeam = winnerSide === "left" ? s.leftTeam : winnerSide === "right" ? s.rightTeam : null;
    const centre = getCentre({ seriesState: s, setsToWin, displayedRound, point, penaltyAttempt, suddenDeath, winnerTeam });
    const attempts = Math.max(penaltyAttempts ?? 0, s.penaltyLeftResults?.length ?? 0, s.penaltyRightResults?.length ?? 0);
    const streakOf = (side) => (s.tiebreakerPhase === "idle" && !s.banner ? s.liveStats?.[side]?.momentum ?? 0 : 0);

    const slotsFor = (side) => {
        const team = side === "left" ? s.leftTeam : s.rightTeam;
        if (isPens) {
            const results = side === "left" ? s.penaltyLeftResults : s.penaltyRightResults;
            const nextIndex = !s.penaltyResolved && s.penaltyTurn === side ? results.length : null;
            return <PemPenaltyGrid results={results} attempts={attempts} side={side} nextIndex={nextIndex} />;
        }
        if (isExtended) {
            return <PemMiniGrid team={team} total={4} lit={Math.min(4, side === "left" ? s.extRoundLeftScore ?? 0 : s.extRoundRightScore ?? 0)} side={side} />;
        }
        const lit = finalRoundMinis ? finalRoundMinis[side] : side === "left" ? s.miniWins ?? 0 : s.miniLosses ?? 0;
        return <PemMiniGrid team={team} total={displayedMiniSquares} lit={lit} side={side} />;
    };

    return (
        <div className={`${css.hud} ${css[`theme_${theme}`] ?? ""}`}>
            <div className={`${css.scorebug} ${entrance ? css.entrance : ""}`}>
                {setsToWin > 1 ? <PemSetChips chips={buildPemSetChips(s)} bestOf={setsToWin * 2 - 1} /> : null}
                <div className={`${css.panel} ${css.strip}`}>
                    <span className={css.strip_deco} aria-hidden="true" />
                    <span className={`${css.strip_side} ${css.strip_event}`}>
                        {eventName}
                        <span className={css.event_number}>{eventNumber}</span>
                    </span>
                    <span className={css.strip_trophy}>
                        <PemTrophy type={pemType} size={32} className={css.trophy} />
                    </span>
                    <span className={`${css.strip_side} ${css.strip_side_right}`} title={stageText}>{stageText}</span>
                </div>
                <PemMainFrame alert={!!point}>
                    {theme === "gcc" ? <GccRoundFlash seriesState={s} /> : null}
                    {theme === "gcc" ? <GccStreakGlow left={streakOf("left")} right={streakOf("right")} /> : null}
                    <PemHalf
                        side="left"
                        team={s.leftTeam}
                        score={s.roundWins ?? 0}
                        setsTotal={setsToWin}
                        setsLit={s.playerWonSets ?? 0}
                        slots={slotsFor("left")}
                        dimmed={loserOpacity === "win"}
                        winner={winnerSide === "left"}
                        finale={winnerSide ? (winnerSide === "left" ? "won" : "lost") : null}
                        celebrate={celebrate}
                    />
                    <div
                        className={`${css.centre} ${css[`centre_${centre.tone}`]}`}
                        style={centre.tone === "gg" && theme !== "gcc" ? { background: winnerTeam?.gradient, color: pemTextOn(winnerTeam?.color) } : undefined}
                    >
                        <motion.span
                            key={centre.top}
                            className={css.centre_top}
                            initial={centre.tone === "gg" ? { opacity: 0, scale: 1.8 } : { opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: centre.tone === "gg" ? 0.45 : 0.18, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {centre.top}
                        </motion.span>
                        <span className={css.centre_bottom}>{centre.bottom}</span>
                        {centre.tone === "gg" ? <span className={css.gg_shine} aria-hidden="true" /> : null}
                    </div>
                    <PemHalf
                        side="right"
                        team={s.rightTeam}
                        score={s.roundLosses ?? 0}
                        setsTotal={setsToWin}
                        setsLit={s.playerLostSets ?? 0}
                        slots={slotsFor("right")}
                        dimmed={loserOpacity === "loss"}
                        winner={winnerSide === "right"}
                        finale={winnerSide ? (winnerSide === "right" ? "won" : "lost") : null}
                        celebrate={celebrate}
                    />
                    {theme === "gcc" ? <GccStinger seriesState={s} setsToWin={setsToWin} /> : <Stinger seriesState={s} setsToWin={setsToWin} pemType={pemType} />}
                </PemMainFrame>
                <div className={css.under}>
                    <span className={`${css.streak_slot} ${css.streak_left}`}>
                        <PemStreak value={streakOf("left")} theme={theme} side="left" team={s.leftTeam} />
                    </span>
                    <span className={`${css.streak_slot} ${css.streak_right}`}>
                        <PemStreak value={streakOf("right")} theme={theme} side="right" team={s.rightTeam} />
                    </span>
                    <PemNameTab side="left" team={s.leftTeam} cheat={isCheatTargeting(activeCheat, "left")} finale={winnerSide ? (winnerSide === "left" ? "won" : "lost") : null} celebrate={celebrate} />
                    {theme === "gcc" ? <GccHalftime seriesState={s} /> : null}
                    <UnderBox seriesState={s} overtimeToWin={overtimeToWin} winnerTeam={winnerTeam} setsToWin={setsToWin} />
                    <PemNameTab side="right" team={s.rightTeam} cheat={isCheatTargeting(activeCheat, "right")} finale={winnerSide ? (winnerSide === "right" ? "won" : "lost") : null} celebrate={celebrate} />
                </div>
            </div>
        </div>
    );
}

export function PemIntro(props) {
    return props.theme === "gpl" ? <ClayIntro {...props} /> : props.theme === "gcc" ? <GccIntro {...props} /> : <BandIntro {...props} />;
}

function BandIntro({ seriesState, eventName, eventNumber, stageText, setsToWin, pemType, onDone, theme = "pem" }) {
    const [open, setOpen] = useState(() => isFreshPemSeries(seriesState));

    useEffect(() => {
        if (!open) return undefined;
        const timer = setTimeout(() => setOpen(false), INTRO_MS);
        return () => clearTimeout(timer);
    }, [open]);

    useEffect(() => {
        if (!open) onDone?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const ease = [0.22, 1, 0.36, 1];

    return (
        <AnimatePresence onExitComplete={onDone}>
            {open ? (
                <motion.div
                    key="pem-intro"
                    className={`${css.hud} ${css[`theme_${theme}`] ?? ""} ${css.intro}`}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.25 } }}
                    transition={{ duration: 0.25 }}
                >
                    <motion.div
                        className={`${css.panel} ${css.intro_band}`}
                        initial={{ clipPath: "inset(0 50% 0 50%)" }}
                        animate={{ clipPath: "inset(0 0% 0 0%)" }}
                        exit={{ clipPath: "inset(0 50% 0 50%)", transition: { duration: 0.35, ease: "easeIn" } }}
                        transition={{ duration: 0.55, ease }}
                    >
                        <motion.div
                            className={css.intro_head}
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, delay: 0.35, ease }}
                        >
                            <PemTrophy type={pemType} size={64} className={css.intro_trophy} />
                            <span className={css.intro_event}>
                                {eventName}
                                <span className={css.event_number}>{eventNumber}</span>
                            </span>
                            <span className={css.intro_stage}>{stageText}</span>
                        </motion.div>
                        <div className={css.intro_teams}>
                            {["left", "right"].map((side) => {
                                const team = side === "left" ? seriesState.leftTeam : seriesState.rightTeam;
                                return (
                                    <motion.div
                                        key={side}
                                        className={`${css.intro_team} ${side === "right" ? css.intro_team_right : ""}`}
                                        initial={{ opacity: 0, x: side === "left" ? -120 : 120 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: side === "left" ? -80 : 80 }}
                                        transition={{ duration: 0.6, delay: 0.5, ease }}
                                    >
                                        <PemCircle team={team} className={css.intro_circle} />
                                        <span className={css.intro_name}>Team {team?.name}</span>
                                    </motion.div>
                                );
                            })}
                            <motion.span
                                className={css.intro_vs}
                                initial={{ opacity: 0, scale: 1.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, delay: 0.85, ease }}
                            >
                                VS
                            </motion.span>
                        </div>
                        <motion.span
                            className={css.intro_format}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, delay: 1.05 }}
                        >
                            Best of {setsToWin * 2 - 1}
                        </motion.span>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
