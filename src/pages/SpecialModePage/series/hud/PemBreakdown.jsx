import { useRef } from "react";
import { useInView } from "framer-motion";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import css from "./PemHud.module.css";
import { PemStreak } from "./PemStreak.jsx";
import { PemHalf, PemMainFrame, PemMiniGrid, PemNameTab, PemPenaltyGrid } from "./PemParts.jsx";
import { pemTextOn } from "./pemHud.js";

const cleanLabel = (label) => String(label ?? "").replace(/!+$/, "");

const penaltyAttemptsLabel = (penalties) => {
    const attempts = Math.max(penalties.leftResults?.length ?? 0, penalties.rightResults?.length ?? 0);
    return `${attempts} ${attempts === 1 ? "Attempt" : "Attempts"}`;
};

const Centre = ({ tone, top, bottom, team, onBottomClick = null }) => (
    <div
        className={`${css.centre} ${css[`centre_${tone}`]}`}
        style={tone === "gg" ? { background: team?.gradient, color: pemTextOn(team?.color) } : undefined}
    >
        <span className={css.centre_top}>{top}</span>
        {onBottomClick ? (
            <button type="button" className={`${css.centre_bottom} ${css.bd_link}`} onClick={onBottomClick} title="Show this round in the Extended Rounds">
                {bottom}
            </button>
        ) : bottom ? (
            <span className={css.centre_bottom}>{bottom}</span>
        ) : null}
    </div>
);

export const PemRoundRow = ({
    leftTeam,
    rightTeam,
    leftScore,
    rightScore,
    squaresTotal = 0,
    leftSquares = 0,
    rightSquares = 0,
    setLinesTotal = 0,
    leftSets = 0,
    rightSets = 0,
    leftGlow = false,
    rightGlow = false,
    leftOpacity = 1,
    rightOpacity = 1,
    penalties = null,
    leftLabel = "",
    rightLabel = "",
    roundNumber = null,
    winnerSide = null,
    extended = null,
    ggBanner = null,
    leftMomentumStreak = null,
    rightMomentumStreak = null,
    streakTheme = "pem",
}) => {
    const slotsFor = (side) => {
        const team = side === "left" ? leftTeam : rightTeam;
        if (penalties) {
            const attempts = Math.max(penalties.attemptsToDisplay ?? 0, penalties.leftResults?.length ?? 0, penalties.rightResults?.length ?? 0);
            return <PemPenaltyGrid results={side === "left" ? penalties.leftResults ?? [] : penalties.rightResults ?? []} attempts={attempts} side={side} />;
        }
        if (squaresTotal > 0) return <PemMiniGrid team={team} total={squaresTotal} lit={side === "left" ? leftSquares : rightSquares} side={side} />;
        return null;
    };

    const rowRef = useRef(null);
    const inView = useInView(rowRef, { once: true, amount: 0.6 });
    const ggTeam = ggBanner?.team ?? null;
    const finaleSide = ggBanner && !ggBanner.tie ? (leftGlow ? "left" : rightGlow ? "right" : null) : null;
    const finaleFor = (side) => (finaleSide ? (finaleSide === side ? "won" : "lost") : null);
    const label = cleanLabel(leftLabel || rightLabel);
    const rowGlow = {
        left: leftGlow ? "won" : finaleSide === "right" ? "lost" : null,
        right: rightGlow ? "won" : finaleSide === "left" ? "lost" : null,
    };
    const winner = winnerSide === "left" ? leftTeam : winnerSide === "right" ? rightTeam : null;
    const centre = ggBanner
        ? ggBanner.tie
            ? { tone: "final", top: "Draw", bottom: "Final" }
            : { tone: "gg", top: "GG", bottom: `Team ${ggTeam?.name}` }
        : penalties
            ? { tone: "tiebreak", top: penaltyAttemptsLabel(penalties), bottom: null }
            : label
                ? { tone: "alert", top: label, bottom: `Round ${roundNumber}` }
                : extended
                    ? { tone: "extended", top: `Round ${roundNumber}`, bottom: "Extended Round" }
                    : {
                        tone: "normal",
                        top: `Round ${roundNumber}`,
                        bottom: winner ? (
                            <span className={css.bd_winner}>
                                {winnerSide === "left" ? <FaCaretLeft aria-hidden="true" /> : null}
                                {winner.name}
                                {winnerSide === "right" ? <FaCaretRight aria-hidden="true" /> : null}
                            </span>
                        ) : "",
                    };

    return (
        <div ref={rowRef} className={css.bd_row_wrap}>
        <div className={`${css.hud} ${css.bd_row}`}>
            <PemMainFrame alert={!!label} glow={rowGlow}>
                    <PemHalf
                        side="left"
                        team={leftTeam}
                        score={leftScore}
                        setsTotal={setLinesTotal}
                        setsLit={leftSets}
                        slots={slotsFor("left")}
                        opacity={leftOpacity}
                        winner={leftGlow}
                        result={leftGlow ? "won" : rightGlow ? "lost" : null}
                        finale={finaleFor("left")}
                        celebrate={inView}
                        animated={false}
                    />
                    <Centre {...centre} team={ggTeam} onBottomClick={centre.tone === "extended" && extended?.onClick ? extended.onClick : null} />
                    <PemHalf
                        side="right"
                        team={rightTeam}
                        score={rightScore}
                        setsTotal={setLinesTotal}
                        setsLit={rightSets}
                        slots={slotsFor("right")}
                        opacity={rightOpacity}
                        winner={rightGlow}
                        result={rightGlow ? "won" : leftGlow ? "lost" : null}
                        finale={finaleFor("right")}
                        celebrate={inView}
                        animated={false}
                    />
            </PemMainFrame>
            {leftMomentumStreak || rightMomentumStreak ? (
                <div className={css.bd_streaks}>
                    <span className={css.bd_streak}>
                        <PemStreak value={leftMomentumStreak ?? 0} theme={streakTheme} side="left" team={leftTeam} animated={false} />
                    </span>
                    <span />
                    <span className={css.bd_streak}>
                        <PemStreak value={rightMomentumStreak ?? 0} theme={streakTheme} side="right" team={rightTeam} animated={false} />
                    </span>
                </div>
            ) : null}
        </div>
        </div>
    );
};

export const PemBoard = ({
    leftTeam,
    rightTeam,
    leftScore,
    rightScore,
    setLinesTotal = 0,
    leftSets = 0,
    rightSets = 0,
    leftGlow = false,
    rightGlow = false,
    leftOpacity = 1,
    rightOpacity = 1,
    roundsPlayed = null,
    roundsLabel = "Rounds",
    caption = null,
    ggBanner = null,
}) => {
    const ggTeam = ggBanner?.team ?? null;
    const centre = ggBanner
        ? { tone: "gg", top: "GG", bottom: `Team ${ggTeam?.name}` }
        : roundsPlayed != null
            ? { tone: "normal", top: `${roundsPlayed} ${roundsLabel}`, bottom: caption ?? "Played" }
            : { tone: "tiebreak", top: "Extended", bottom: "Rounds" };

    return (
        <div className={`${css.hud} ${css.bd_board}`}>
            <PemMainFrame glow={{ left: leftGlow ? "won" : null, right: rightGlow ? "won" : null }}>
                <PemHalf side="left" team={leftTeam} score={leftScore} setsTotal={setLinesTotal} setsLit={leftSets} opacity={leftOpacity} winner={leftGlow}
                        result={leftGlow ? "won" : rightGlow ? "lost" : null} />
                <Centre {...centre} team={ggTeam} />
                <PemHalf side="right" team={rightTeam} score={rightScore} setsTotal={setLinesTotal} setsLit={rightSets} opacity={rightOpacity} winner={rightGlow}
                        result={rightGlow ? "won" : leftGlow ? "lost" : null} />
            </PemMainFrame>
            <div className={css.under}>
                <PemNameTab side="left" team={leftTeam} />
                <span />
                <PemNameTab side="right" team={rightTeam} />
            </div>
        </div>
    );
};
