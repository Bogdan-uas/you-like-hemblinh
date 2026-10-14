import { useLayoutEffect, useRef } from "react";
import CountUp from "react-countup";
import css from "../SpecialModePage.module.css";
import { FaCheck, FaXmark, FaCircle } from "react-icons/fa6";
import { buildExtendedRoundWinnerList } from "../logic/series.js";
import { getSwissBoxSlots, GPL_SWISS_FORMAT } from "../logic/swiss.js";

export const TeamCircle = ({ team, dim, specialStyle = {}, showRating = false, ratingValue = 0, beforeRatingValue = 0, shouldPlaceholderCirclesBeRendered = false }) => {
    if (!team) {
        return (
            <div
                style={{
                    width: '24px',
                    height: '24px',
                    fontSize: '14px',
                    opacity: shouldPlaceholderCirclesBeRendered ? 0 : 1,
                }}
                className={css.placeholder_circle}
            >
                <span style={{ marginRight: '0.3px', marginTop: '1.3px' }}>?</span>
            </div>
        );
    }

    return (
        <div
            className={css.team_circle_ro32}
            style={{
                background: team.color,
                opacity: dim ? 0.25 : 1,
                ...specialStyle,
            }}
            title={`Team ${team.name}`}
        >
            {showRating && (
                <span style={{ color: '#ffffff', textShadow: `0 0 4px #000` }} className={css.modal_team_rating}>
                    <CountUp
                        start={beforeRatingValue ?? 0}
                        duration={2.5}
                        end={ratingValue}
                        key={ratingValue}
                    />
                </span>
            )}
        </div>
    );
};

export const MatchRect = ({
    match,
    isClickable,
    onClick,
    isButtonLocked,
    className = "",
    dataNet,
    dataPos,
    dataFormat,
    dataIdx,
    dataNotStarted,
    bestOf,
    shouldBestOfBeShown,
    shouldPlaceholderCirclesBeRendered
}) => {
    const isPlayed = !!match.played;

    const slotA = match.slotA || null;
    const slotB = match.slotB || null;

    const shouldSwap =
        !!match.pickTeamId &&
        slotA &&
        slotB &&
        match.pickTeamId === slotB.id;

    const leftTeam = shouldSwap ? slotB : slotA;
    const rightTeam = shouldSwap ? slotA : slotB;

    const bo1History =
        bestOf === 1 && match.setHistory?.length
            ? match.setHistory[0]
            : null;

    const bo1MainScore = bo1History
        ? {
            left: bo1History.wins,
            right: bo1History.losses,
        }
        : null;

    const rawLeftScore =
        bo1MainScore?.left ?? match.scoreLeft;

    const rawRightScore =
        bo1MainScore?.right ?? match.scoreRight;

    const displayScoreLeft =
        shouldSwap ? rawRightScore : rawLeftScore;

    const displayScoreRight =
        shouldSwap ? rawLeftScore : rawRightScore;

    const isTieResult = isPlayed && !!match.isTie;

    const bo1Tiebreak = (() => {
        if (isTieResult || !bo1History?.extendedRounds) return null;
        if (displayScoreLeft !== displayScoreRight) return null;

        if (bo1History.extendedRounds.penalties) {
            return {
                type: "Pens",
                left: bo1History.extendedRounds.penalties.leftScore,
                right: bo1History.extendedRounds.penalties.rightScore,
            };
        }

        const winners = buildExtendedRoundWinnerList(bo1History.extendedRounds);

        let left = 0;
        let right = 0;

        for (const round of winners) {
            if (round.winner === "left") left++;
            else if (round.winner === "right") right++;
        }

        return left || right
            ? {
                type: "ERs",
                left,
                right,
            }
            : null;
    })();

    const hasScores =
        displayScoreLeft !== null &&
        displayScoreLeft !== undefined &&
        displayScoreRight !== null &&
        displayScoreRight !== undefined;

    const isUserWin =
        isPlayed &&
        match.pickTeamId &&
        match.winnerTeamId &&
        match.pickTeamId === match.winnerTeamId;

    const resultClass = isPlayed
        ? isTieResult
            ? css.match_tie
            : isUserWin
                ? css.match_win
                : css.match_loss
        : "";

    const boLabelResultClass = isPlayed && !isTieResult
        ? isUserWin
            ? css.match_win_label
            : css.match_loss_label
        : "";

    const noLabelResultClass = isPlayed && !isTieResult
        ? isUserWin
            ? css.match_win_no_label
            : css.match_loss_no_label
        : "";

    const winnerIsLeft =
        isPlayed && match.winnerTeamId && leftTeam && match.winnerTeamId === leftTeam.id;
    const winnerIsRight =
        isPlayed && match.winnerTeamId && rightTeam && match.winnerTeamId === rightTeam.id;

    const isLeftLoser =
        isPlayed && match.loserTeamId && leftTeam && match.loserTeamId === leftTeam.id;
    const isRightLoser =
        isPlayed && match.loserTeamId && rightTeam && match.loserTeamId === rightTeam.id;

    const isATie = displayScoreLeft === displayScoreRight;

    return (
        <div
            className={`${resultClass} ${css.ro32_rect} ${css.swiss_rect} ${className}`}
            data-net={dataNet}
            data-pos={dataPos}
            data-format={dataFormat}
            data-idx={dataIdx}
            data-not-started={dataNotStarted}
            style={{
                pointerEvents: isClickable && !isButtonLocked ? "auto" : "none",
                marginBottom: 8,
            }}
            onClick={onClick}
        >
            {!shouldBestOfBeShown && (
                <div className={`${css.bo_label} ${boLabelResultClass} ${className}`}>
                    BO{bestOf}
                </div>
            )}
            {!shouldBestOfBeShown && (
                <div className={`${css.no_label} ${noLabelResultClass} ${className}`}>
                    #{dataIdx}
                </div>
            )}
            {isPlayed && (
                isUserWin ? (
                    <div className={css.successPickemIndicator}>
                        <FaCircle size={12} color="#37b737" />
                        <FaCheck size={7} color="#ffffff" />
                    </div>
                ) : (
                    <div className={css.successPickemIndicator}>
                        <FaCircle size={12} color="#be3939" />
                        <FaXmark size={7} color="#fff" />
                    </div>
                )
            )}
            <div className={css.team_cell_ro32}>
                <TeamCircle team={leftTeam} shouldPlaceholderCirclesBeRendered={shouldPlaceholderCirclesBeRendered} />
            </div>

            <div className={css.vs_cell_ro32} style={{ textAlign: "center" }}>
                {!isPlayed || !hasScores ? (
                    <span style={{ fontSize: "12px", fontWeight: 600, top: "8px", left: "39px", backgroundColor: "transparent" }} className={css.vs_text}>
                        VS
                    </span>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span
                                style={{
                                    color: isATie
                                        ? "#5a5a5a"
                                        : winnerIsLeft
                                            ? "#2e7d32"
                                            : "red",
                                    fontWeight: 800,
                                    fontStyle: "italic",
                                    position: "relative",
                                    zIndex: 0,
                                    fontSize: "12px",
                                    textAlign: "left",
                                    marginBottom: -2,
                                    marginRight: 1,
                                    opacity: isATie ? 0.9 : isLeftLoser ? 0.55 : 1
                                }}
                                className={
                                    isATie
                                        ? css.swissTieScoreShadow
                                        : winnerIsLeft
                                            ? css.swissWinnerScoreShadow
                                            : css.swissLoserScoreShadow
                                }
                            >
                                {bestOf === 1 ? rawLeftScore : displayScoreLeft}
                            </span>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 2,
                                    marginTop: 1
                                }}
                            >
                                <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#2e2f42" }}></div>
                                <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#2e2f42" }}></div>
                            </div>
                            <span
                                style={{
                                    color: isATie
                                        ? "#5a5a5a"
                                        : winnerIsRight
                                            ? "#2e7d32"
                                            : "red",
                                    fontWeight: 800,
                                    fontStyle: "italic",
                                    position: "relative",
                                    zIndex: 0,
                                    fontSize: "12px",
                                    textAlign: "left",
                                    marginBottom: -2,
                                    opacity: isATie ? 0.9 : isRightLoser ? 0.55 : 1
                                }}
                                className={
                                    isATie
                                        ? css.swissTieScoreShadow
                                        : winnerIsRight
                                            ? css.swissWinnerScoreShadow
                                            : css.swissLoserScoreShadow
                                }
                            >
                                {bestOf === 1 ? rawRightScore : displayScoreRight}
                            </span>
                        </div>
                        {bo1Tiebreak && (
                            <div
                                style={{
                                    fontSize: "8px",
                                    marginTop: 2,
                                    color: "#2e2f42",
                                    textAlign: "center",
                                    fontWeight: 700,
                                    display: 'flex',
                                    gap: "2px",
                                    width: 'max-content',
                                    position: "absolute",
                                    top: '67.5%'
                                }}
                            >
                                <span style={{ color: winnerIsLeft ? "#2e7d32" : "red", opacity: isLeftLoser ? 0.55 : 1 }}>{bo1Tiebreak.left}</span>
                                {bo1Tiebreak.type}
                                <span style={{ color: winnerIsRight ? "#2e7d32" : "red", opacity: isRightLoser ? 0.55 : 1 }}>{bo1Tiebreak.right}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={css.team_cell_ro32}>
                <TeamCircle team={rightTeam} shouldPlaceholderCirclesBeRendered={shouldPlaceholderCirclesBeRendered} />
            </div>
        </div>
    );
};

export const PlaceholderRect = ({ teams, height = 264 }) => {
    const sortedTeams = [...teams].sort(
        (a, b) => a.netEntryOrder - b.netEntryOrder
    );

    return (
        <div
            className={css.placeholder_rect}
            style={{ minHeight: height }}
            title="To be determined..."
        >
            <div
                style={{
                    width: "100%",
                    height: "max-content",
                    display: "flex",
                    flexWrap: "wrap",
                    rowGap: 15.2,
                    columnGap: 4,
                    justifyContent: "center",
                    alignItems: "flex-start",
                }}
            >
                {sortedTeams.map((t) => (
                    <div
                        key={t.id}
                        style={{
                            width: "calc(50% - 6px)",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <TeamCircle team={t} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const BoxPlaceholderCircle = ({ tone = "green" }) => {
    const bg = tone === "green" ? "#005e00" : "#4a0000";
    return (
        <div
            className={css.placeholder_circle_elimination}
            style={{ background: bg }}
        >
            <span>?</span>
        </div>
    );
};

export const SwissResultBox = ({ title, tone, teams, format = null }) => {
    const slots = getSwissBoxSlots(title, format);
    const items = Array.from({ length: slots }).map((_, i) => teams?.[i] || null);

    return (
        <div
            className={`${css.swiss_result_box} ${tone === "green" ? css.swiss_result_box_green : css.swiss_result_box_red}`}
            style={{
                maxWidth: title === "3:2" || title === "2:3" || title === '3:1' || title === '1:3' ? '79px' : '',
                minWidth: format === GPL_SWISS_FORMAT && (title === "3:0" || title === "0:3") ? '157px' : '',
                borderRadius: title === "3:0" || title === "0:3" ? '12px 0 0 12px' : title === "3:1" ? '0 0 0 12px' : title === "1:3" ? '12px 0 0 0' : title === "2:3" || title === "3:2" ? '0 12px 12px 0' : '',
            }}
        >
            <div className={css.swiss_result_box_title}>
                {title}
            </div>

            <div style={{
                display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center",
                gap: title === "3:0" || title === "0:3" ? 13.6 : title === "1:3" || title === "3:1" || title === "3:2" || title === "2:3" ? 16 : 8,
            }}>
                {items.map((t, idx) =>
                    t ? <TeamCircle specialStyle={{ border: '1.5px solid #999' }} key={t.id} team={t} /> : <BoxPlaceholderCircle key={`${title}-ph-${idx}`} tone={tone} />
                )}
            </div>
        </div>
    );
};

export const SwissResultBoxGradients = () => {
    const anchorRef = useRef(null);

    useLayoutEffect(() => {
        const container = anchorRef.current?.parentElement;
        if (!container) return undefined;

        const unite = () => {
            [css.swiss_result_box_green, css.swiss_result_box_red].forEach((toneClass) => {
                const boxes = [...container.getElementsByClassName(toneClass)];
                if (!boxes.length) return;
                const rects = boxes.map((box) => box.getBoundingClientRect());
                const left = Math.min(...rects.map((r) => r.left));
                const top = Math.min(...rects.map((r) => r.top));
                const width = Math.max(...rects.map((r) => r.right)) - left;
                const height = Math.max(...rects.map((r) => r.bottom)) - top;
                boxes.forEach((box, i) => {
                    box.style.backgroundSize = `${width}px ${height}px`;
                    box.style.backgroundPosition = `${left - rects[i].left}px ${top - rects[i].top}px`;
                    box.style.backgroundRepeat = "no-repeat";
                    box.style.transition = "none";
                });
            });
        };

        unite();

        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(unite) : null;
        observer?.observe(container);
        window.addEventListener("resize", unite);

        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", unite);
        };
    });

    return <span ref={anchorRef} aria-hidden="true" style={{ display: "none" }} />;
};
