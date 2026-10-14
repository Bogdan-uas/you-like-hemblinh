import React from "react";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { LeaderboardSortSelect } from "../components/LeaderboardSortSelect.jsx";
import { LeaderboardDividerSelect } from "../components/LeaderboardDividerSelect.jsx";
import { getLeaderboardDividers } from "../logic/leaderboardDividers.js";
import { UnbeatenStreakFire } from "../components/StreakBadges.jsx";
import { TeamStatsHoverPopover } from "../components/TeamStatsHoverPopover.jsx";
import { PemGoldTrophy, PemSilverTrophy, GplTrophy, MedalWithBreakdown } from "../components/Trophies.jsx";
import { EMPTY_TEAM_PLACINGS, trophyCountToDisplay, buildPlacingItems } from "../logic/placings.jsx";
import { readUnbeatenStreak } from "../logic/statsUi.js";
import { DEFAULT_LEADERBOARD_SORT, formatOrdinal } from "../logic/teamData.js";

const NOT_PLAYING_RED = "#be3939";

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
    } = page;

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
                        marginTop: showStageDividers ? "24px" : "0",
                        marginBottom: showStageDividers ? "24px" : "0",
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
                    const hasTrophies = !!trophyDisplay || !!tier1TrophyDisplay || !!pemBigTrophyDisplay || !!gplTrophyDisplay;

                    const isCountMode =
                        trophyDisplay?.mode === "count" ||
                        tier1TrophyDisplay?.mode === "count" ||
                        pemBigTrophyDisplay?.mode === "count" ||
                        gplTrophyDisplay?.mode === "count";
                    const trophyTop = isCountMode ? "21%" : rank > 10 ? "30%" : "20%";

                    const unbeatenStreak = readUnbeatenStreak(teamStats?.[t.id]);
                    const pointsRank = rankById[t.id] ?? rank;
                    const pointsRankColor = placementColors[pointsRank] || "#2e2f42";
                    const trophyIconSize = rank <= 3 ? 32 : 16;
                    const streakFireSize = rank <= 3 ? 34 : 24;
                    const streakFireOverhang = Math.max(0, (streakFireSize - trophyIconSize) / 2);

                    return (
                        <React.Fragment key={t.id}>
                            {stageDividers.filter((divider) => divider.rank === rank).map((divider) => (
                                <div key={`divider-${divider.rank}`} data-leaderboard-divider aria-hidden={!showStageDividers} style={stageDividerStyle}>
                                    <h4
                                        className={css.game_title}
                                        style={{ fontSize: "30px", color: "#999", marginBottom: "16px" }}
                                    >
                                        {divider.above}
                                    </h4>

                                    {divider.notPlayingBelow ? (
                                        <div style={{ position: "relative", width: "600px", transition: "none" }}>
                                            <hr style={{ width: "600px", margin: 0 }} className={css.dashed_divider} />
                                            <hr
                                                style={{ width: "600px", margin: 0, position: "absolute", top: 0, left: 0, borderTopColor: NOT_PLAYING_RED, clipPath: "inset(2px 0 0 0)" }}
                                                className={css.dashed_divider}
                                            />
                                        </div>
                                    ) : (
                                        <hr style={{ width: "600px", margin: 0 }} className={css.dashed_divider} />
                                    )}

                                    <h4
                                        className={css.game_title}
                                        style={{ fontSize: "30px", color: divider.notPlayingBelow ? NOT_PLAYING_RED : "#999", marginTop: "16px" }}
                                    >
                                        {divider.below}
                                    </h4>
                                </div>
                            ))}

                            <div
                                key={t.id}
                                ref={getLeaderboardRowRef(t.id)}
                                className={css.leaderboard_row}
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
                                    className={circleClass}
                                    style={{
                                        ...circleSizeStyle,
                                        background: t.color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: isTop10 ? "0" : "8px",
                                        border: "3px solid #999",
                                        marginLeft: rank > 10 ? "210px" : "0",
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
                                </div>

                                <div style={{ position: rank <= 10 ? 'relative' : 'static', transition: "none" }}>
                                    {(hasTrophies || unbeatenStreak > 0) && (
                                        <span
                                            style={{
                                                marginLeft: 10,
                                                position: "absolute",
                                                top: trophyTop,
                                                right: rank > 10 ? '64.5%' : '103%',
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 6,
                                                color: "#2e2f42",
                                                fontWeight: 700,
                                                fontSize: rank <= 3 ? "32px" : "16px",
                                                transition: "none"
                                            }}
                                        >
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
                                        </span>
                                    )}
                                    <span style={{ fontSize: rank <= 3 ? "32px" : "16px", marginRight: rank <= 3 ? "4px" : "0px", transition: "none" }} className={css.leaderboard_rank}>
                                        {rankSticker()}
                                    </span>{" "}
                                    <span style={{ color: "#2e2f42", fontWeight: 700, transition: "none" }} className={nameClass}>
                                        Team {t.name}
                                        <span style={{
                                            position: "absolute",
                                            top: rank > 10 ? '24%' : '20%',
                                            left: rank > 10 ? '70%' : '120%',
                                            display: "inline-flex",
                                            alignItems: "center",
                                            transition: "none"
                                        }}>
                                            {buildPlacingItems(p, null)
                                                .filter((item) => item.key !== "wins" && item.key !== "tier1Wins" && item.key !== "pemBigWins" && item.key !== "gplWins")
                                                .map((item, itemIndex) => (
                                                    <MedalWithBreakdown
                                                        key={item.key}
                                                        icon={item.icon}
                                                        value={item.value}
                                                        title={item.title}
                                                        onHoverChange={(hovering) => setHoveredLeaderboardTeam(hovering ? null : t)}
                                                        style={itemIndex === 0 ? { marginLeft: '12px' } : undefined}
                                                    />
                                                ))}
                                        </span>
                                    </span>
                                </div>

                                <AnimatePresence initial={false}>
                                    {!showStageDividers && (
                                        <motion.span
                                            key="points-rank"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0, transition: { duration: 0.3, delay: 0.3, ease: "easeOut" } }}
                                            exit={{ opacity: 0, x: 10, transition: { duration: 0.15, ease: "easeIn" } }}
                                            style={{
                                                position: "absolute",
                                                top: "25%",
                                                right: "70%",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 6,
                                                whiteSpace: "nowrap",
                                                pointerEvents: "none",
                                                transition: "none",
                                            }}
                                        >
                                            <strong style={{ color: "#2e2f42" }}>Original ranking:</strong>
                                            <span
                                                className={css.leaderboard_rank}
                                                style={{ color: pointsRankColor, fontSize: "16px", fontWeight: 800, transition: "none" }}
                                            >
                                                {formatOrdinal(pointsRank)}
                                            </span>
                                        </motion.span>
                                    )}
                                </AnimatePresence>
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
