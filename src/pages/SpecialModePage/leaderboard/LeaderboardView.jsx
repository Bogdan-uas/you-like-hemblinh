import React from "react";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { FaTrophy, FaCaretUp, FaCaretDown } from "react-icons/fa";
import { MdOutlineKeyboardDoubleArrowUp, MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import { LeaderboardSortSelect } from "../components/LeaderboardSortSelect.jsx";
import { LeaderboardDividerSelect } from "../components/LeaderboardDividerSelect.jsx";
import { getLeaderboardDividers } from "../logic/leaderboardDividers.js";
import { UnbeatenStreakFire } from "../components/StreakBadges.jsx";
import { TeamStatsHoverPopover } from "../components/TeamStatsHoverPopover.jsx";
import { PemGoldTrophy, PemSilverTrophy, GplTrophy, PbsTrophy, MedalWithBreakdown } from "../components/Trophies.jsx";
import { EMPTY_TEAM_PLACINGS, trophyCountToDisplay, buildPlacingItems } from "../logic/placings.jsx";
import { readUnbeatenStreak } from "../logic/statsUi.js";
import { DEFAULT_LEADERBOARD_SORT, formatOrdinal } from "../logic/teamData.js";

const formatRange = (from, to) => (from >= to ? formatOrdinal(from) : `${formatOrdinal(from)}–${formatOrdinal(to)}`);

function LeaderboardStageDivider({ divider, aboveFrom, belowTo }) {
    return (
        <div className={css.leaderboard_zone}>
            <span className={`${css.leaderboard_zone_pill} ${css.leaderboard_zone_above}`}>
                <FaCaretUp className={css.leaderboard_zone_caret} aria-hidden="true" />
                {divider.above}
                <span className={css.leaderboard_zone_range}>{formatRange(aboveFrom, divider.rank - 1)}</span>
            </span>
            <span className={css.leaderboard_zone_cut} aria-hidden="true">
                <span className={css.leaderboard_zone_line} />
                <span className={`${css.leaderboard_zone_mark} ${divider.notPlayingBelow ? css.leaderboard_zone_mark_out : ""}`} />
                <span className={`${css.leaderboard_zone_line} ${css.leaderboard_zone_line_right}`} />
            </span>
            <span className={`${css.leaderboard_zone_pill} ${divider.notPlayingBelow ? css.leaderboard_zone_out : css.leaderboard_zone_below}`}>
                <FaCaretDown className={css.leaderboard_zone_caret} aria-hidden="true" />
                {divider.below}
                <span className={css.leaderboard_zone_range}>{formatRange(divider.rank, belowTo)}</span>
            </span>
        </div>
    );
}

export function LeaderboardView({ tournamentNumberAdmin, leaderboardState, page }) {
    const { isTournamentNumberButtonArmed, handleTournamentNumberClick, setIsTournamentNumberButtonArmed } = tournamentNumberAdmin;
    const {
        leaderboardSortMode,
        handleLeaderboardSortChange,
        leaderboardDividerSet,
        handleLeaderboardDividersChange,
        leaderboardTitleTournament,
        leaderboardListRef,
        leaderboardDisplayOrder,
        hoveredLeaderboardTeam,
        leaderboardCursorRef,
        leaderboardStatsTab,
        getLeaderboardRowRef,
        setHoveredLeaderboardTeam,
        cycleLeaderboardStatsTab,
    } = leaderboardState;
    const stageDividers = getLeaderboardDividers(leaderboardDividerSet);
    const {
        isTournamentNumberButtonLocked,
        renderTournamentLabelFor,
        teamStats,
        teamRatings,
        placementColors,
        teamPlacings,
        rankById,
        tournamentChangesById,
    } = page;

    React.useLayoutEffect(() => {
        const list = leaderboardListRef.current;
        if (!list) return undefined;

        const alignTailRows = () => {
            let widest = 0;
            list.querySelectorAll("[data-leaderboard-tail]").forEach((row) => {
                const circle = row.children[0]?.getBoundingClientRect();
                const names = row.children[1]?.getBoundingClientRect();
                if (!circle || !names) return;
                widest = Math.max(widest, names.right - circle.left);
            });
            if (!widest) return;
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            list.style.setProperty("--leaderboard-tail-shift", `${widest / 2 / rootFontSize}rem`);
        };

        alignTailRows();
        let cancelled = false;
        document.fonts?.ready.then(() => {
            if (!cancelled) alignTailRows();
        });
        return () => {
            cancelled = true;
        };
    });

    return (
        <>
        <div
            className={css.page_container}
            style={{
                position: "relative"
            }}
        >
            <button
                type="button"
                className={css.gamble_button}
                onClick={() => {
                    if (!isTournamentNumberButtonArmed) {
                        setIsTournamentNumberButtonArmed(true);
                        return;
                    }

                    handleTournamentNumberClick();
                }}
                disabled={isTournamentNumberButtonLocked}
                style={{
                    position: "fixed",
                    top: "7%",
                    left: "2%",
                    opacity: isTournamentNumberButtonArmed ? 1 : 0,
                    pointerEvents: "auto",
                    cursor: isTournamentNumberButtonArmed ? "pointer" : "default",
                }}
            >
                Change tournament number
            </button>
            <LeaderboardSortSelect value={leaderboardSortMode} onChange={handleLeaderboardSortChange} />
            <LeaderboardDividerSelect value={leaderboardDividerSet} onChange={handleLeaderboardDividersChange} />
            <div className={css.leaderboard_header}>

                <div
                    style={{
                        fontSize: "40px",
                        textShadow: "0 0 4px #000",
                        textTransform: "none",
                        marginTop: "56px",
                    }}
                    className={css.game_title}
                >
                    Leaderboard

                    {leaderboardTitleTournament && (
                        <span style={{ textShadow: "none" }}>
                            {" "}after{" "}
                            {renderTournamentLabelFor(
                                leaderboardTitleTournament.type,
                                leaderboardTitleTournament.number,
                                { highlightName: false, qualifier: leaderboardTitleTournament.qualifier }
                            )}
                        </span>
                    )}
                </div>
            </div>

            <div ref={leaderboardListRef} className={css.leaderboard_list}>
                {leaderboardDisplayOrder.map((t, i) => {
                    const rank = i + 1;
                    const rating = teamRatings[t.id] ?? 0;
                    const showStageDividers = leaderboardSortMode === DEFAULT_LEADERBOARD_SORT;
                    const stageDividerStyle = {
                        marginTop: showStageDividers ? "36px" : "0",
                        marginBottom: showStageDividers ? "32px" : "0",
                        height: showStageDividers ? "auto" : "0px",
                        overflow: showStageDividers ? "visible" : "hidden",
                        opacity: showStageDividers ? 1 : 0,
                        visibility: showStageDividers ? "visible" : "hidden",
                        pointerEvents: showStageDividers ? "auto" : "none",
                        transition: "none",
                    };

                    const placementColor = placementColors[rank] || "#2e2f42";

                    const rankSticker = () => {
                        return (
                            <span style={{ color: placementColor, transition: "none" }} className={css.leaderboard_rank}>
                                {formatOrdinal(rank)}
                            </span>
                        );
                    };
                    const isTop10 = rank <= 10;

                    const circleClass =
                        rank === 1
                            ? css.winnerLogo
                            : rank <= 3
                                ? css.placeLogo
                                : rank <= 10
                                    ? css.placeLogo
                                    : css.placeLogoSmall;

                    const circleSizeStyle =
                        rank === 2 ? { width: "80px", height: "80px" }
                            : rank === 3 ? { width: "60px", height: "60px" }
                                : {};

                    const nameClass =
                        rank === 1
                            ? css.winnerName
                            : rank <= 3
                                ? css.runnerUp_name
                                : css.podium_name;

                    const rowStyle = isTop10 ? { display: "flex", flexDirection: "column", alignItems: "center" } : undefined;

                    const ratingFontSize =
                        rank >= 4 && rank <= 10 ? "10px"
                            : rank > 10 ? "8px"
                                : "";

                    const p = teamPlacings?.[t.id] ?? EMPTY_TEAM_PLACINGS;
                    const trophyDisplay = trophyCountToDisplay(p.wins);
                    const tier1TrophyDisplay = trophyCountToDisplay(p.tier1Wins);
                    const pemBigTrophyDisplay = trophyCountToDisplay(p.pemBigWins);
                    const gplTrophyDisplay = trophyCountToDisplay(p.gplWins);
                    const pbsTrophyDisplay = trophyCountToDisplay(p.pbsWins);
                    const hasTrophies = !!trophyDisplay || !!tier1TrophyDisplay || !!pemBigTrophyDisplay || !!gplTrophyDisplay || !!pbsTrophyDisplay;

                    const unbeatenStreak = readUnbeatenStreak(teamStats?.[t.id]);
                    const pointsRank = rankById[t.id] ?? rank;
                    const pointsRankColor = placementColors[pointsRank] || "#2e2f42";
                    const trophyIconSize = rank <= 3 ? 32 : 16;
                    const streakFireSize = rank <= 3 ? 34 : 24;
                    const streakFireOverhang = Math.max(0, (streakFireSize - trophyIconSize) / 2);
                    const tournamentChange = tournamentChangesById?.[t.id];
                    const placesChange = tournamentChange?.places ?? 0;
                    const pointsChange = tournamentChange?.points ?? 0;
                    const hasTrophyCluster = hasTrophies || unbeatenStreak > 0;

                    const renderTrophies = () => (
                        <>
                            {gplTrophyDisplay &&
                                (gplTrophyDisplay.mode === "icons" ? (
                                    Array.from({ length: gplTrophyDisplay.n }).map((_, k) => (
                                        <GplTrophy key={k} style={{ transition: "none" }} />
                                    ))
                                ) : (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none" }}>
                                        {gplTrophyDisplay.n} <GplTrophy />
                                    </span>
                                ))}
                            {pemBigTrophyDisplay &&
                                (pemBigTrophyDisplay.mode === "icons" ? (
                                    Array.from({ length: pemBigTrophyDisplay.n }).map((_, k) => (
                                        <PemGoldTrophy key={k} style={{ transition: "none" }} />
                                    ))
                                ) : (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none" }}>
                                        {pemBigTrophyDisplay.n} <PemGoldTrophy />
                                    </span>
                                ))}
                            {pbsTrophyDisplay &&
                                (pbsTrophyDisplay.mode === "icons" ? (
                                    Array.from({ length: pbsTrophyDisplay.n }).map((_, k) => (
                                        <PbsTrophy key={k} style={{ transition: "none" }} />
                                    ))
                                ) : (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none" }}>
                                        {pbsTrophyDisplay.n} <PbsTrophy />
                                    </span>
                                ))}
                            {tier1TrophyDisplay &&
                                (tier1TrophyDisplay.mode === "icons" ? (
                                    Array.from({ length: tier1TrophyDisplay.n }).map((_, k) => (
                                        <PemSilverTrophy key={k} style={{ transition: "none" }} />
                                    ))
                                ) : (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none" }}>
                                        {tier1TrophyDisplay.n} <PemSilverTrophy />
                                    </span>
                                ))}
                            {trophyDisplay &&
                                (trophyDisplay.mode === "icons" ? (
                                    Array.from({ length: trophyDisplay.n }).map((_, k) => (
                                        <FaTrophy key={k} style={{ verticalAlign: "middle", transition: "none" }} />
                                    ))
                                ) : (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none" }}>
                                        {trophyDisplay.n} <FaTrophy />
                                    </span>
                                ))}
                            {unbeatenStreak > 0 && (
                                <UnbeatenStreakFire
                                    value={unbeatenStreak}
                                    size={streakFireSize}
                                    style={{
                                        marginLeft: hasTrophies ? 4 : 0,
                                        marginTop: -streakFireOverhang,
                                        marginBottom: -streakFireOverhang,
                                    }}
                                />
                            )}
                        </>
                    );

                    const renderOriginalRanking = (placement) => (
                        <AnimatePresence initial={false}>
                            {!showStageDividers && (
                                <motion.span
                                    key="points-rank"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0, transition: { duration: 0.3, delay: 0.3, ease: "easeOut" } }}
                                    exit={{ opacity: 0, x: 10, transition: { duration: 0.15, ease: "easeIn" } }}
                                    style={{
                                        ...placement,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        whiteSpace: "nowrap",
                                        pointerEvents: "none",
                                        transition: "none",
                                    }}
                                >
                                    <strong style={{ color: "#2e2f42" }}>Original ranking:</strong>
                                    {placementChangeBadge}
                                    <span
                                        className={css.leaderboard_rank}
                                        style={{ color: pointsRankColor, fontSize: "16px", fontWeight: 800, transition: "none" }}
                                    >
                                        {formatOrdinal(pointsRank)}
                                    </span>
                                </motion.span>
                            )}
                        </AnimatePresence>
                    );

                    const placementChangeBadge = placesChange !== 0 ? (
                        <span
                            className={css.leaderboard_change_places}
                            style={{ color: placesChange > 0 ? "#2e7d32" : "red" }}
                            title={`${placesChange > 0 ? "Up" : "Down"} ${Math.abs(placesChange)} place${Math.abs(placesChange) !== 1 ? "s" : ""} after the last tournament`}
                        >
                            <span style={{ marginRight: "-4px" }}>{Math.abs(placesChange)}</span>
                            {placesChange > 0 ? <MdOutlineKeyboardDoubleArrowUp /> : <MdOutlineKeyboardDoubleArrowDown />}
                        </span>
                    ) : null;

                    return (
                        <React.Fragment key={t.id}>
                            {stageDividers.map((divider, k) => divider.rank === rank && (
                                <div key={`divider-${divider.rank}`} data-leaderboard-divider aria-hidden={!showStageDividers} style={stageDividerStyle}>
                                    <LeaderboardStageDivider
                                        divider={divider}
                                        aboveFrom={k > 0 ? stageDividers[k - 1].rank : 1}
                                        belowTo={k + 1 < stageDividers.length ? stageDividers[k + 1].rank - 1 : leaderboardDisplayOrder.length}
                                    />
                                </div>
                            ))}

                            <div
                                key={t.id}
                                ref={getLeaderboardRowRef(t.id)}
                                className={css.leaderboard_row}
                                data-leaderboard-tail={isTop10 ? undefined : ""}
                                style={{ ...rowStyle, position: "relative", gap: rank === 3 ? "0px" : "", userSelect: "none" }}
                                onMouseEnter={(e) => {
                                    leaderboardCursorRef.current = { x: e.clientX, y: e.clientY };
                                    setHoveredLeaderboardTeam(t);
                                }}
                                onMouseLeave={() => setHoveredLeaderboardTeam(null)}
                                onClick={() => cycleLeaderboardStatsTab(-1)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    cycleLeaderboardStatsTab(1);
                                }}
                            >
                                <div
                                    className={`${circleClass} ${isTop10 ? "" : css.leaderboard_tail_circle}`}
                                    style={{
                                        ...circleSizeStyle,
                                        background: t.color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: isTop10 ? "0" : "8px",
                                        border: "3px solid #999",
                                        position: "relative",
                                        transition: "none"
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "#ffffff",
                                            textShadow: "0 0 4px #000",
                                            fontSize: ratingFontSize,
                                            transition: "none"
                                        }}
                                        className={css.modal_team_rating}
                                    >
                                        {rating}p
                                    </span>
                                    {!isTop10 && (
                                        <span className={`${css.leaderboard_side_left} ${css.leaderboard_tail_side}`} style={{ fontSize: "16px" }}>
                                            {renderOriginalRanking({ position: "relative", marginRight: "6px" })}
                                            {hasTrophyCluster && renderTrophies()}
                                            {showStageDividers && placementChangeBadge}
                                        </span>
                                    )}
                                </div>

                                <div style={{ position: "relative", transition: "none" }}>
                                    {isTop10 && (hasTrophyCluster || (showStageDividers && placementChangeBadge)) && (
                                        <span className={css.leaderboard_side_left} style={{ fontSize: rank <= 3 ? "32px" : "16px" }}>
                                            {hasTrophyCluster && renderTrophies()}
                                            {showStageDividers && placementChangeBadge}
                                        </span>
                                    )}
                                    <span style={{ fontSize: rank <= 3 ? "32px" : "16px", marginRight: rank <= 3 ? "4px" : "0px", transition: "none" }} className={css.leaderboard_rank}>
                                        {rankSticker()}
                                    </span>{" "}
                                    <span style={{ color: "#2e2f42", fontWeight: 700, transition: "none" }} className={nameClass}>
                                        Team {t.name}
                                        <span className={css.leaderboard_side_right}>
                                            {pointsChange !== 0 && (
                                                <span className={css.leaderboard_change_points} style={{ color: pointsChange > 0 ? "#2e7d32" : "red" }}>
                                                    {pointsChange > 0 ? `+${pointsChange}p` : `${pointsChange}p`}
                                                </span>
                                            )}
                                            {buildPlacingItems(p, null)
                                                .filter((item) => item.key !== "wins" && item.key !== "tier1Wins" && item.key !== "pemBigWins" && item.key !== "gplWins" && item.key !== "pbsWins")
                                                .map((item) => (
                                                    <MedalWithBreakdown
                                                        key={item.key}
                                                        icon={item.icon}
                                                        value={item.value}
                                                        title={item.title}
                                                        onHoverChange={(hovering) => setHoveredLeaderboardTeam(hovering ? null : t)}
                                                    />
                                                ))}
                                        </span>
                                    </span>
                                </div>

                                {isTop10 && renderOriginalRanking({ position: "absolute", top: "25%", right: "70%" })}

                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>

        <AnimatePresence>
            {hoveredLeaderboardTeam && (
                <TeamStatsHoverPopover
                    key="team-stats-popover"
                    team={hoveredLeaderboardTeam}
                    cursorRef={leaderboardCursorRef}
                    statsNow={teamStats?.[hoveredLeaderboardTeam?.id]}
                    tab={leaderboardStatsTab}
                />
            )}
        </AnimatePresence>
        </>
    );
}
