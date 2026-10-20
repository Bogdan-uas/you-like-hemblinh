import { useRef } from "react";
import css from "../SpecialModePage.module.css";
import { useInView } from "framer-motion";
import { PenaltyCircles } from "./PenaltyCircles.jsx";
import { MomentumStreakBadge } from "./StreakBadges.jsx";
import { BREAKDOWN_GLOW, TIE_BANNER_COLOR, TIE_BANNER_GRADIENT } from "../logic/breakdownStyles.js";
import { lightenHex, darkenHex, getBrightness } from "../logic/colors.js";
import { decodeMiniRounds } from "../logic/series.js";
import { LeadingIndicator } from "./LeadingIndicator.jsx";
import { SeriesBanner } from "./SeriesBanner.jsx";
import { RoundScore } from "./RoundScore.jsx";
import { RoundBadge } from "./SeriesBadges.jsx";
import { FaCaretRight } from "react-icons/fa";

const MINI_TAPE_MAX_COLUMNS = 22;

const miniTapeFill = (team, isClincher) => ({
    background: `linear-gradient(180deg, ${lightenHex(team.color, 0.25)} 0%, ${team.color} 55%, ${darkenHex(team.color, 0.25)} 100%)`,
    boxShadow: isClincher ? BREAKDOWN_GLOW(team.color) : undefined,
});

export const MiniRoundTimeline = ({ minis, leftTeam, rightTeam }) => {
    const ref = useRef(null);
    const shown = useInView(ref, { once: true, amount: 0.3 });
    const rounds = decodeMiniRounds(minis);
    if (!rounds.length) return null;

    const rows = Math.ceil(rounds.length / MINI_TAPE_MAX_COLUMNS);
    let leftTally = 0;
    let rightTally = 0;

    const renderCell = (value, side, mini, isClincher) => {
        const team = side === "left" ? leftTeam : rightTeam;
        const won = mini.winner === side;
        return (
            <span
                className={`${css.mini_tape_cell} ${won ? css.mini_tape_cell_won : mini.winner ? "" : css.mini_tape_cell_tie}`}
                style={won && team?.color ? miniTapeFill(team, isClincher) : undefined}
            >
                {value.toFixed(2)}
            </span>
        );
    };

    return (
        <div
            ref={ref}
            className={`${css.mini_tape} ${shown ? css.mini_tape_shown : ""}`}
            style={{ "--mini-cols": Math.ceil(rounds.length / rows), marginTop: 32 }}
        >
            <div className={css.mini_tape_legend} aria-hidden="true">
                <span className={css.mini_tape_key} style={{ background: leftTeam?.color }} />
                <span className={css.mini_tape_key} style={{ background: rightTeam?.color }} />
            </div>

            {rounds.map((mini, i) => {
                if (mini.winner === "left") leftTally += 1;
                else if (mini.winner === "right") rightTally += 1;

                const winnerTeam = mini.winner === "left" ? leftTeam : mini.winner === "right" ? rightTeam : null;
                const isClincher = i === rounds.length - 1 && !!winnerTeam;

                return (
                    <div
                        key={i}
                        className={css.mini_tape_column}
                        style={{ animationDelay: `${i * 25}ms` }}
                        title={winnerTeam
                            ? `Mini-round ${i + 1}: Team ${winnerTeam.name} (${leftTally}:${rightTally})`
                            : `Mini-round ${i + 1}: nobody gets it (${leftTally}:${rightTally})`}
                    >
                        {renderCell(mini.left, "left", mini, isClincher)}
                        {renderCell(mini.right, "right", mini, isClincher)}
                        <span className={css.mini_tape_tally}>{leftTally}:{rightTally}</span>
                    </div>
                );
            })}
        </div>
    );
};

export const BreakdownSquares = ({ team, lit, total, side }) => (
    <div
        className={css.miniSquares}
        style={side === "right" ? { flexDirection: "row-reverse" } : undefined}
    >
        {[...Array(total)].map((_, i) => {
            const isLit = i < lit;

            return (
                <div
                    key={i}
                    className={side === "right" ? css.lossSquare : css.square}
                    style={{
                        boxShadow: isLit
                            ? `
                                0 0 3px ${team?.color},
                                0 0 7px ${team?.color}66,
                                0 1px 3px rgba(0,0,0,0.4)
                            `
                            : "none",
                    }}
                >
                    <div
                        className={side === "right" ? css.lossSquareUnlit : css.squareUnlit}
                        style={{ background: team?.unlitGradient }}
                    />
                    <div
                        className={side === "right" ? css.lossSquareLit : css.squareLit}
                        style={{ background: team?.gradient, opacity: isLit ? 1 : 0 }}
                    />
                </div>
            );
        })}
    </div>
);

const BreakdownSetLines = ({ team, lit, total, side, orientation = "vertical" }) => {
    const lineGlow = (isLit) =>
        isLit
            ? `
                0 0 3px ${team?.color},
                0 0 7px ${team?.color}66,
                0 1px 3px rgba(0,0,0,0.4)
            `
            : "none";

    if (orientation === "horizontal") {
        return (
            <div className={side === "right" ? css.lossLines : css.lines}>
                {[...Array(total)].map((_, i) => {
                    const isLit = i < lit;

                    return (
                        <div
                            key={i}
                            className={css.line}
                            style={{
                                boxShadow: lineGlow(isLit),
                                ...(total >= 3 ? { width: "16px" } : null),
                            }}
                        >
                            <div
                                className={side === "right" ? css.lossLineUnlit : css.lineUnlit}
                                style={{ background: team?.unlitGradient }}
                            />
                            <div
                                className={side === "right" ? css.lossLineLit : css.lineLit}
                                style={{
                                    background: team?.gradient,
                                    opacity: isLit ? 1 : 0,
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={side === "right" ? css.verticalLossLines : css.verticalLines} style={{ marginTop: "6px" }}>
            {[...Array(total)].map((_, i) => {
                const isLit = i < lit;

                return (
                    <div
                        key={i}
                        className={css.verticalLine}
                        style={{
                            height: total >= 5 ? "12px" : total >= 4 ? "14px" : total >= 3 ? "16px" : "",
                            width: "5px",
                            boxShadow: lineGlow(isLit),
                        }}
                    >
                        <div
                            className={side === "right" ? css.verticalLossLineUnlit : css.verticalLineUnlit}
                            style={{ background: team?.unlitGradient }}
                        />
                        <div
                            className={side === "right" ? css.verticalLossLineLit : css.verticalLineLit}
                            style={{
                                background: team?.gradient,
                                opacity: isLit ? 1 : 0,
                                width: "5.5px",
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

const pointPillStyle = (team) => ({
    background: team?.gradient,
    color: getBrightness(team?.color ?? "#2e2f42") > 190 ? "#2e2f42" : "#ffffff",
});

const fancyNameStyle = (team) => ({
    display: "inline-block",
    "--team-color": team?.color,
    backgroundImage: team?.gradient,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
});

export const BreakdownTeamName = ({ team, side, style, winnerDot = false }) => (
    <span
        className={`${side === "left" ? css.team_name_left : css.team_name_right} ${css.team_name_fancy}`}
        data-side={side}
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            flexDirection: side === "left" ? "row" : "row-reverse",
            whiteSpace: "nowrap",
            ...style,
        }}
    >
        <span style={fancyNameStyle(team)}>
            <span className={css.team_name_prefix}>Team</span>{" "}
            <span className={css.team_name_main}>{team?.name}</span>
        </span>
        {winnerDot ? (
            <span
                className={css.breakdown_round_dot}
                title={`Team ${team?.name} won this round`}
                style={{ background: team?.gradient, boxShadow: BREAKDOWN_GLOW(team?.color) }}
            />
        ) : null}
    </span>
);

export const BreakdownScoreRow = ({
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
    isPlayoffs = false,
    penalties = null,
    leftLabel = "",
    rightLabel = "",
    roundNumber = null,
    roundLabel = "Round",
    winnerSide = null,
    nameLayout = isPlayoffs ? "side" : "top",
    centeredSides = false,
    setLinesLayout = isPlayoffs ? "vertical" : "horizontal",
    tag = null,
    ggBanner = null,
    leftMomentumStreak = null,
    rightMomentumStreak = null,
}) => {
    const hasPens = !!penalties;

    const renderSide = (side) => {
        const isLeft = side === "left";
        const team = isLeft ? leftTeam : rightTeam;
        const score = isLeft ? leftScore : rightScore;
        const glow = isLeft ? leftGlow : rightGlow;
        const squares = isLeft ? leftSquares : rightSquares;
        const sets = isLeft ? leftSets : rightSets;
        const label = isLeft ? leftLabel : rightLabel;
        const opacity = isLeft ? leftOpacity : rightOpacity;

        return (
            <div
                className={css.breakdown_side}
                style={{ alignItems: centeredSides ? "center" : isLeft ? "flex-start" : "flex-end", opacity }}
            >
                {label ? (
                    <span
                        className={css.point_pill}
                        style={{
                            ...pointPillStyle(team),
                            position: "absolute",
                            bottom: nameLayout === "side" ? "calc(100% + 8px)" : "calc(100% + 4px)",
                            [isLeft ? "left" : "right"]: nameLayout === "side" ? 0 : "8px",
                            zIndex: 2,
                        }}
                    >
                        {label}
                    </span>
                ) : null}
                {nameLayout === "top" ? <BreakdownTeamName team={team} side={side} winnerDot={winnerSide === side} /> : null}

                <div
                    style={{
                        display: "flex",
                        flexDirection: isLeft ? "row-reverse" : "row",
                        alignItems: "center",
                        gap: hasPens ? "10px" : "14px",
                        position: "relative",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", flexDirection: "column", width: "50.1px", position: "relative" }}>
                        <RoundScore value={score} team={team} highlighted={glow} animated={false} />
                        {setLinesLayout === "horizontal" ? (
                            setLinesTotal > 0 ? (
                                <BreakdownSetLines
                                    team={team}
                                    lit={sets}
                                    total={setLinesTotal}
                                    side={isLeft ? undefined : "right"}
                                    orientation="horizontal"
                                />
                            ) : (
                                <div className={isLeft ? css.lines : css.lossLines} style={{ height: "5px" }} />
                            )
                        ) : (
                            <div className={isLeft ? css.lines : css.lossLines} />
                        )}
                        <MomentumStreakBadge value={isLeft ? leftMomentumStreak : rightMomentumStreak} />
                    </div>

                    {hasPens ? (
                        <PenaltyCircles
                            results={isLeft ? penalties.leftResults ?? [] : penalties.rightResults ?? []}
                            team={side}
                            attemptsToDisplay={penalties.attemptsToDisplay}
                            resolved={penalties.resolved}
                            shouldHaveMargin={false}
                        />
                    ) : squaresTotal > 0 ? (
                        <BreakdownSquares
                            team={team}
                            lit={squares}
                            total={squaresTotal}
                            side={isLeft ? undefined : "right"}
                        />
                    ) : null}

                    {setLinesLayout === "vertical" && setLinesTotal > 0 ? (
                        <BreakdownSetLines
                            team={team}
                            lit={sets}
                            total={setLinesTotal}
                            side={isLeft ? undefined : "right"}
                        />
                    ) : (
                        <div
                            className={isLeft ? css.verticalLines : css.verticalLossLines}
                            style={{ marginTop: "6px", width: setLinesLayout === "vertical" ? "5px" : undefined }}
                        />
                    )}

                    {nameLayout === "side" ? (
                        <BreakdownTeamName
                            team={team}
                            side={side}
                            winnerDot={winnerSide === side}
                            style={{
                                margin: 0,
                                position: "absolute",
                                [isLeft ? "right" : "left"]: "110%",
                                fontSize: "28px",
                            }}
                        />
                    ) : null}
                </div>
            </div>
        );
    };

    return (
        <div className={css.breakdown_scoreboard}>
            {renderSide("left")}

            <div className={css.breakdown_center} style={{ marginTop: isPlayoffs ? "16px" : "24px" }}>
                {tag ? <div className={css.breakdown_center_tag}>{tag}</div> : null}
                <div className={css.breakdown_center_slot} style={{ marginBottom: isPlayoffs ? "-12px" : 0 }}>
                    {ggBanner ? (
                        <SeriesBanner tie={!!ggBanner.tie} team={ggBanner.team} size={38} playOnView particles={9} />
                    ) : (
                        <LeadingIndicator
                            leftTeam={leftTeam}
                            rightTeam={rightTeam}
                            leftScore={leftScore}
                            rightScore={rightScore}
                            size={28}
                            width={64}
                            animated={false}
                        />
                    )}
                </div>
                <div
                    className={css.breakdown_round_slot}
                    style={{ marginTop: isPlayoffs ? "8px" : 0 }}
                >
                    {roundNumber != null ? (
                        <RoundBadge size={14} label={roundLabel}>{roundNumber}</RoundBadge>
                    ) : null}
                </div>
            </div>

            {renderSide("right")}
        </div>
    );
};


const dividerTone = (section, level) => {
    if (section === "overtime") return css[`ot_level_${Math.min(Math.max(level ?? 1, 1), 10)}`];
    if (section === "extended") return css.ert_badge_label;
    if (section === "penalties") return css.penalty_badge_label;
    return css.breakdown_divider_half;
};

export const BreakdownDivider = ({ from, to, section = "half", level, first = false }) => (
    <div className={`${css.breakdown_divider} ${first ? css.breakdown_divider_first : ""}`}>
        <span className={css.breakdown_divider_line} aria-hidden="true" />
        <span className={`${css.best_of_badge} ${css.overtime_badge} ${css.breakdown_divider_badge}`}>
            {from ? (
                <span className={`${css.overtime_badge_target} ${css.breakdown_divider_from}`}>
                    {from}
                    <FaCaretRight className={css.breakdown_divider_caret} aria-hidden="true" />
                </span>
            ) : null}
            <span className={`${css.overtime_badge_label} ${dividerTone(section, level)}`}>{to}</span>
        </span>
        <span className={`${css.breakdown_divider_line} ${css.breakdown_divider_line_right}`} aria-hidden="true" />
    </div>
);

export const BreakdownModalScoreboard = ({
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
    isPlayoffs = false,
    roundsPlayed = null,
    roundsLabel = "Rounds",
    centerMinWidth = null,
    ggBanner = null,
    animated = true,
}) => {
    const renderSide = (side) => {
        const isLeft = side === "left";
        const team = isLeft ? leftTeam : rightTeam;
        const sets = isLeft ? leftSets : rightSets;

        return (
            <div
                className={css.breakdown_modal_side}
                style={{ flexDirection: isLeft ? "row-reverse" : "row", opacity: isLeft ? leftOpacity : rightOpacity }}
            >
                <BreakdownTeamName
                    team={team}
                    side={side}
                    style={{ position: "absolute", bottom: "calc(100% - 8px)", [isLeft ? "right" : "left"]: 0, margin: 0, zIndex: 2 }}
                />
                <div style={{ display: "flex", alignItems: "center", flexDirection: "column", width: "50.1px", position: "relative" }}>
                    <RoundScore value={isLeft ? leftScore : rightScore} team={team} highlighted={isLeft ? leftGlow : rightGlow} animated={animated} />
                    {!isPlayoffs && setLinesTotal > 0 ? (
                        <BreakdownSetLines team={team} lit={sets} total={setLinesTotal} side={isLeft ? undefined : "right"} orientation="horizontal" />
                    ) : (
                        <div className={isLeft ? css.lines : css.lossLines} style={{ height: isPlayoffs ? 0 : "5px" }} />
                    )}
                </div>
                {isPlayoffs && setLinesTotal > 0 ? (
                    <BreakdownSetLines team={team} lit={sets} total={setLinesTotal} side={isLeft ? undefined : "right"} />
                ) : null}
            </div>
        );
    };

    return (
        <div className={css.breakdown_modal_scoreboard}>
            {renderSide("left")}
            <div className={css.breakdown_center} style={{ marginTop: isPlayoffs ? "16px" : "24px", minWidth: centerMinWidth ?? undefined }}>
                <div className={css.breakdown_center_slot} style={{ marginBottom: isPlayoffs ? "-12px" : 0 }}>
                    {ggBanner ? (
                        <SeriesBanner tie={!!ggBanner.tie} team={ggBanner.team} size={38} playOnView particles={9} />
                    ) : (
                        <LeadingIndicator
                            leftTeam={leftTeam}
                            rightTeam={rightTeam}
                            leftScore={leftScore}
                            rightScore={rightScore}
                            size={28}
                            width={64}
                            animated={animated}
                        />
                    )}
                </div>
                <div className={css.breakdown_round_slot} style={{ marginTop: isPlayoffs ? "8px" : 0 }}>
                    {roundsPlayed != null ? (
                        <RoundBadge size={14} label={roundsLabel} reversed>{roundsPlayed}</RoundBadge>
                    ) : null}
                </div>
            </div>
            {renderSide("right")}
        </div>
    );
};
