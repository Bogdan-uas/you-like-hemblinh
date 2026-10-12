import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import GradientCaretLeft from "../../../components/GradientIcon/GradientCaretLeft.jsx";
import GradientCaretRight from "../../../components/GradientIcon/GradientCaretRight.jsx";
import GradientDiamond from "../../../components/GradientIcon/GradientDiamond.jsx";
import { PenaltyCircles } from "./PenaltyCircles.jsx";
import { MomentumStreakBadge } from "./StreakBadges.jsx";
import { BREAKDOWN_GLOW, TIE_BANNER_COLOR, TIE_BANNER_GRADIENT } from "../logic/breakdownStyles.js";
import { lightenHex, darkenHex, getBrightness } from "../logic/colors.js";

const BreakdownSquares = ({ team, lit, total, side }) => (
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
                                marginTop: "8px"
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
        <div className={side === "right" ? css.verticalLossLines : css.verticalLines}>
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

const BreakdownScoreNumber = ({ team, value, glow, dim, size = 44, width }) => (
    <span
        className={css.round_text}
        style={{
            fontSize: `${size}px`,
            lineHeight: 1,
            color: team?.color,
            opacity: dim ? 0.4 : 1,
            textShadow: glow ? BREAKDOWN_GLOW(team?.color) : "none",
            ...(width ? { width: `${width}px`, display: "inline-block", textAlign: "center" } : null),
        }}
    >
        {value}
    </span>
);

const BreakdownLeadingIndicator = ({ leftTeam, rightTeam, leftScore, rightScore }) => {
    const momentum =
        leftScore > rightScore ? "left" : rightScore > leftScore ? "right" : "tie";

    if (momentum === "left" && leftTeam) {
        return (
            <GradientCaretLeft
                size={26}
                gradient={{
                    top: lightenHex(leftTeam.color, 0.18),
                    middle: leftTeam.color,
                    bottom: darkenHex(
                        leftTeam.color,
                        getBrightness(leftTeam.color) > 210 ? 0.22 : 0.35
                    ),
                }}
                glowColor={leftTeam.color}
            />
        );
    }

    if (momentum === "right" && rightTeam) {
        return (
            <GradientCaretRight
                size={26}
                gradient={{
                    top: lightenHex(rightTeam.color, 0.18),
                    middle: rightTeam.color,
                    bottom: darkenHex(
                        rightTeam.color,
                        getBrightness(rightTeam.color) > 210 ? 0.22 : 0.35
                    ),
                }}
                glowColor={rightTeam.color}
            />
        );
    }

    return (
        <GradientDiamond
            size={18}
            gradient={{ top: "#9c9c9c", middle: "#757575", bottom: "#555555" }}
            glowColor="#757575"
        />
    );
};

const BreakdownPointLabel = ({ team, text }) => (
    <span
        className={css.info_text}
        style={{
            color: team?.color,
            fontSize: "16px",
            fontWeight: 500,
            minHeight: "20px",
            marginTop: "-8px",
            transition: "all 500ms ease-in-out",
            textShadow: text
                ? `
                    0 0 3px ${team?.color},
                    0 0 7px ${team?.color}66,
                    0 1px 3px rgba(0,0,0,0.4)
                `
                : "none",
            whiteSpace: "nowrap",
            userSelect: "none"
        }}
    >
        {text || "\u00A0"}
    </span>
);

export const BreakdownScoreRow = ({
    leftTeam,
    rightTeam,
    leftScore,
    rightScore,
    scoreSize = 44,
    scoreWidth,
    squaresTotal = 0,
    leftSquares = 0,
    rightSquares = 0,
    setLinesTotal = 0,
    leftSets = 0,
    rightSets = 0,
    leftGlow = false,
    rightGlow = false,
    leftDim = false,
    rightDim = false,
    leftOpacity = 1,
    rightOpacity = 1,
    isPlayoffs = false,
    center = "indicator",
    centerText = "",
    centerColor = "#2e2f42",
    penalties = null,
    leftLabel = "",
    rightLabel = "",
    showLabels = false,
    isInModal = false,
    isModalHidden,
    ggBanner = null,
    leftMomentumStreak = null,
    rightMomentumStreak = null,
}) => {
    const momentum =
        leftScore > rightScore
            ? "left"
            : rightScore > leftScore
                ? "right"
                : "tied";

    const hasPens = !!penalties;

    const renderSide = (side) => {
        const team = side === "left" ? leftTeam : rightTeam;
        const score = side === "left" ? leftScore : rightScore;
        const glow = side === "left" ? leftGlow : rightGlow;
        const dim = side === "left" ? leftDim : rightDim;
        const squares = side === "left" ? leftSquares : rightSquares;
        const sets = side === "left" ? leftSets : rightSets;
        const label = side === "left" ? leftLabel : rightLabel;
        const opacity = side === "left" ? leftOpacity : rightOpacity;

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: side === "left" ? "flex-start" : "flex-end",
                    opacity,
                    transition: "opacity 400ms ease",
                }}
            >
                {showLabels && (
                    <BreakdownPointLabel
                        team={team}
                        text={label}
                    />
                )}

                <div
                    style={{
                        display: "flex",
                        flexDirection: side === "left" ? "row-reverse" : "row",
                        alignItems: "center",
                        gap: hasPens ? "10px" : "14px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            position: "relative",
                        }}
                    >
                        {team && (
                            <span
                                className={
                                    side === "left"
                                        ? css.team_name_left
                                        : css.team_name_right
                                }
                                style={{
                                    position: "absolute",
                                    top:
                                        isPlayoffs
                                            ? "-42px"
                                            : isModalHidden
                                                ? "-20px"
                                                : "-24px",
                                    display: !isInModal ? "none" : "inline-block",
                                    backgroundImage: team.gradient,
                                    backgroundRepeat: "no-repeat",
                                    backgroundSize: "100% 100%",
                                    WebkitBackgroundClip: "text",
                                    backgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    color: "transparent",
                                    transition: "all 500ms ease-in-out",
                                    whiteSpace: "nowrap",
                                    marginLeft: isInModal && side === "left" ? "-108px" : "",
                                    marginRight: isInModal && side === "right" ? "-108px" : "",
                                }}
                            >
                                Team {team.name}
                            </span>
                        )}
                        <BreakdownScoreNumber
                            team={team}
                            value={score}
                            glow={glow}
                            dim={dim}
                            size={scoreSize}
                            width={scoreWidth}
                        />

                        {!isPlayoffs && setLinesTotal > 0 && (
                            <BreakdownSetLines
                                team={team}
                                lit={sets}
                                total={setLinesTotal}
                                side={side === "right" ? "right" : undefined}
                                orientation="horizontal"
                            />
                        )}

                        <MomentumStreakBadge
                            value={side === "left" ? leftMomentumStreak : rightMomentumStreak}
                        />
                    </div>

                    {hasPens ? (
                        <PenaltyCircles
                            results={
                                side === "left"
                                    ? penalties.leftResults ?? []
                                    : penalties.rightResults ?? []
                            }
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
                            side={side === "right" ? "right" : undefined}
                        />
                    ) : null}

                    {isPlayoffs && setLinesTotal > 0 && (
                        <BreakdownSetLines
                            team={team}
                            lit={sets}
                            total={setLinesTotal}
                            side={side === "right" ? "right" : undefined}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
            }}
        >
            {renderSide("left")}

            <div
                style={{
                    minWidth: "63.8px",
                    height: "42px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: center === "indicator" ? "hidden" : "visible",
                    flexShrink: 0,
                    marginTop: showLabels ? "20px" : 0,
                }}
            >
                {ggBanner ? (
                    <span
                        className={css.round_text}
                        style={{
                            fontSize: "38px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0px",
                            marginTop: "-4px",
                            minWidth: "77.8px",
                            textShadow: `
                                0 0 4px ${ggBanner.tie ? TIE_BANNER_COLOR : ggBanner.team?.color},
                                0 0 10px ${ggBanner.tie ? TIE_BANNER_COLOR : ggBanner.team?.color}66,
                                0 2px 6px rgba(0,0,0,0.4)
                            `,
                        }}
                    >
                        {(ggBanner.tie ? "TIE!" : "GG!").split("").map((char, i) => (
                            <span
                                key={`${char}-${i}`}
                                style={{
                                    display: "inline-block",
                                    background: ggBanner.tie ? TIE_BANNER_GRADIENT : ggBanner.team?.gradient,
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    color: "transparent",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                {char}
                            </span>
                        ))}
                    </span>
                ) : center === "indicator" ? (
                    <motion.div
                        initial={false}
                        animate={{
                            x:
                                momentum === "left"
                                    ? -28
                                    : momentum === "right"
                                        ? 8
                                        : -6,
                        }}
                        transition={{
                            duration: 0.35,
                            ease: "easeInOut",
                        }}
                        style={{ marginTop: "-4px" }}
                    >
                        <BreakdownLeadingIndicator
                            leftTeam={leftTeam}
                            rightTeam={rightTeam}
                            leftScore={leftScore}
                            rightScore={rightScore}
                        />
                    </motion.div>
                ) : (
                    <span
                        className={css.info_text}
                        style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: centerColor,
                            whiteSpace: "nowrap",
                            marginTop: "-4px",
                        }}
                    >
                        {centerText}
                    </span>
                )}
            </div>

            {renderSide("right")}
        </div>
    );
};

export const BreakdownSectionTitle = ({ text, marginTop = "16px", marginBottom = "0px" }) => (
    <h4
        className={css.game_title}
        style={{ fontSize: "30px", color: "#999", marginTop, marginBottom }}
    >
        {text}
    </h4>
);

export const BreakdownDivider = ({ from, to }) => (
    <div style={{ marginTop: "24px", marginBottom: "24px" }}>
        <BreakdownSectionTitle text={from} marginTop="0px" marginBottom="16px" />
        <hr style={{ width: "600px", margin: "0 auto" }} className={css.dashed_divider} />
        <BreakdownSectionTitle text={to} marginTop="16px" />
    </div>
);
