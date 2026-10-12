import { AnimatedCheckIcon, AnimatedCrossIcon } from "./AnimatedIcons.jsx";
import { lightenHex, darkenHex } from "../logic/colors.js";
import { PENALTY_DISPLAY_CIRCLES } from "../logic/gameConstants.js";

export const PenaltyCircles = ({
    results,
    team,
    attemptsToDisplay,
    resolved,
    compact = false,
    shouldHaveMargin = true,
}) => {
    const total = attemptsToDisplay;

    const circleSize = compact ? 11 : 22;
    const iconSize = compact ? 7 : 14;
    const gap = compact ? 3 : 6;
    const suddenGap = compact ? 12 : 24;
    const borderWidth = compact ? 1 : 2;
    const marginTop = compact || !shouldHaveMargin ? 0 : 6;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                flexDirection: team === "left" ? "row-reverse" : "row",
                gap,
                marginTop: marginTop,
            }}
        >
            {Array.from({ length: total }).map((_, i) => {
                const r = results[i];
                const isSuddenDeath = i === 5;
                const filled = r === "success";
                const missed = r === "fail";
                const shouldHide =
                    resolved &&
                    i >= results.length &&
                    i >= PENALTY_DISPLAY_CIRCLES;

                if (shouldHide) {
                    return null;
                }
                return (
                    <div
                        key={i}
                        style={{
                            marginLeft: isSuddenDeath && team === "left" ? 0 : isSuddenDeath ? suddenGap : 0,
                            marginRight: isSuddenDeath && team === "left" ? suddenGap : 0,
                            width: circleSize,
                            height: circleSize,
                            borderRadius: "50%",
                            border:
                                r
                                    ? "none"
                                    : `${borderWidth}px dashed #828282`,
                            backgroundImage: filled
                                ? `linear-gradient(
                                    180deg,
                                    ${lightenHex("#54CC54", 0.18)} 0%,
                                    #54CC54 45%,
                                    ${darkenHex("#54CC54", 0.35)} 100%
                                )`
                                : missed
                                    ? `linear-gradient(
                                        180deg,
                                        ${lightenHex("#983333", 0.18)} 0%,
                                        #983333 45%,
                                        ${darkenHex("#983333", 0.35)} 100%
                                    )`
                                    : "none",

                            backgroundColor:
                                filled || missed
                                    ? "transparent"
                                    : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.25s ease",
                        }}
                    >
                        {filled &&
                            <AnimatedCheckIcon
                                width={iconSize}
                                height={iconSize}
                            />
                        }
                        {missed &&
                            <AnimatedCrossIcon
                                width={iconSize}
                                height={iconSize}
                            />
                        }
                    </div>
                );
            })}
        </div>
    );
};
