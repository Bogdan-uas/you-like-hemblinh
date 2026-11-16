import React from "react";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import { MdOutlineKeyboardDoubleArrowUp, MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import { LeaderboardSortSelect } from "../components/LeaderboardSortSelect.jsx";
import { LeaderboardDividerSelect } from "../components/LeaderboardDividerSelect.jsx";
import { getLeaderboardDividers } from "../logic/leaderboardDividers.js";
import { UnbeatenStreakFire } from "../components/StreakBadges.jsx";
import { TeamStatsHoverPopover } from "../components/TeamStatsHoverPopover.jsx";
import { useLeaderboardHover, useIsScrolling } from "./leaderboardHover.js";
import { PemGoldTrophy, PemSilverTrophy, GplTrophy, PbsTrophy, PgxTrophy, EssTrophy, SwcTrophy, EwcTrophy, MedalWithBreakdown, OfficialTrophy } from "../components/Trophies.jsx";
import { EMPTY_TEAM_PLACINGS, trophyCountToDisplay, buildPlacingItems } from "../logic/placings.jsx";
import { readUnbeatenStreak } from "../logic/statsUi.js";
import { DEFAULT_LEADERBOARD_SORT, formatOrdinal } from "../logic/teamData.js";
import { TeamProfile } from "../components/TeamHistory.jsx";
import { trophyTip, hasTrophyRoom } from "../logic/trophyCase.js";
import { TrophyRoom } from "../components/TrophyRoom.jsx";
import { regionOfTeam } from "../logic/ewcHomes.js";
import { FaEarthEurope } from "react-icons/fa6";
import WorldMapView from "../worldMap/WorldMapView.jsx";
import CountryFlag from "../worldMap/CountryFlag.jsx";

function LeaderboardHoverPopover({ store, cursorRef, teamStats, tab }) {
    const hovered = useLeaderboardHover(store);
    const scrolling = useIsScrolling();
    const team = scrolling ? null : hovered;

    return (
        <AnimatePresence>
            {team && (
                <TeamStatsHoverPopover
                    key="team-stats-popover"
                    team={team}
                    cursorRef={cursorRef}
                    statsNow={teamStats?.[team.id]}
                    tab={tab}
                />
            )}
        </AnimatePresence>
    );
}

const descendingIndexes = (n) => Array.from({ length: n }, (_, i) => n - 1 - i);

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
        leaderboardHoverStore,
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
        teamProfile,
        openTeamProfile,
        closeTeamProfile,
        openProfileEntry,
        openProfileTournament,
        allTeams,
        ewcTrophiesByTeam = {},
        trophyCases = {},
        trophyRoom = null,
        openTrophyRoom,
        closeTrophyRoom,
        openTrophyTournament,
        worldMapOpen,
        worldMapOnTop,
        closeWorldMap,
    } = page;
    const trophyRoomTeam = trophyRoom ? (allTeams || []).find((team) => String(team.id) === String(trophyRoom.teamId)) ?? null : null;

    const ewcTrophyOf = (teamId, k, onClick) => {
        const won = ewcTrophiesByTeam[teamId] || [];
        const trophy = k == null ? won[won.length - 1] : won[k];
        return (
            <EwcTrophy
                key={k ?? "last"}
                keyColor={trophy?.keyColor}
                shardColors={trophy?.shardColors}
                data-tip={trophy ? `Esports World Cup #${trophy.number}` : k == null ? undefined : "Esports World Cup"}
                onClick={onClick}
                style={{ transition: "none", cursor: onClick ? "pointer" : undefined }}
            />
        );
    };

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
                                { highlightName: false, qualifier: leaderboardTitleTournament.qualifier, city: leaderboardTitleTournament.city }
                            )}
                        </span>
                    )}
                </div>
            </div>

            <div ref={leaderboardListRef} className={css.leaderboard_list}>
                {leaderboardDisplayOrder.map((t, i) => {
                    const byRegion = leaderboardSortMode === "regions";
                    const rank = byRegion ? leaderboardDisplayOrder.length + 1 : i + 1;
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
                        if (byRegion) return null;
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
                    const pgxTrophyDisplay = trophyCountToDisplay(p.pgxWins);
                    const essTrophyDisplay = trophyCountToDisplay(p.essWins);
                    const swcTrophyDisplay = trophyCountToDisplay(p.swcWins);
                    const ewcTrophyDisplay = trophyCountToDisplay(p.ewcWins);
                    const hasTrophies = !!trophyDisplay || !!tier1TrophyDisplay || !!pemBigTrophyDisplay || !!gplTrophyDisplay || !!pbsTrophyDisplay || !!pgxTrophyDisplay || !!essTrophyDisplay || !!swcTrophyDisplay || !!ewcTrophyDisplay;

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

                    const trophyClick = (focus) => (e) => {
                        e.stopPropagation();
                        setHoveredLeaderboardTeam(null);
                        if (hasTrophyRoom(p) && openTrophyRoom) {
                            openTrophyRoom(t.id, focus);
                            return;
                        }
                        if (!openTeamProfile) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        openTeamProfile(t, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, size: Math.max(24, rect.width) });
                    };
                    const medalFocus = { tier15Wins: { key: "tier15Wins" }, tier2Wins: { key: "tier2Wins" }, seconds: { place: 2 }, thirds: { place: 3 } };

                    const renderTrophies = () => (
                        <>
                            {gplTrophyDisplay &&
                                (gplTrophyDisplay.mode === "icons" ? (
                                    descendingIndexes(gplTrophyDisplay.n).map((k) => (
                                        <GplTrophy key={k} data-tip={trophyTip(trophyCases, t.id, "gplWins", k, "Global Pro League")} onClick={trophyClick({ key: "gplWins", index: k })} style={{ cursor: "pointer", transition: "none" }} />
                                    ))
                                ) : (
                                    <span title={`${gplTrophyDisplay.n}× Global Pro League`} onClick={trophyClick({ key: "gplWins" })} style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none", cursor: "pointer" }}>
                                        {gplTrophyDisplay.n} <GplTrophy />
                                    </span>
                                ))}
                            {pemBigTrophyDisplay &&
                                (pemBigTrophyDisplay.mode === "icons" ? (
                                    descendingIndexes(pemBigTrophyDisplay.n).map((k) => (
                                        <PemGoldTrophy key={k} data-tip={trophyTip(trophyCases, t.id, "pemBigWins", k, "PEM Big Tournament")} onClick={trophyClick({ key: "pemBigWins", index: k })} style={{ cursor: "pointer", transition: "none" }} />
                                    ))
                                ) : (
                                    <span title={`${pemBigTrophyDisplay.n}× PEM Big Tournament`} onClick={trophyClick({ key: "pemBigWins" })} style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none", cursor: "pointer" }}>
                                        {pemBigTrophyDisplay.n} <PemGoldTrophy />
                                    </span>
                                ))}
                            {pbsTrophyDisplay &&
                                (pbsTrophyDisplay.mode === "icons" ? (
                                    descendingIndexes(pbsTrophyDisplay.n).map((k) => (
                                        <PbsTrophy key={k} data-tip={trophyTip(trophyCases, t.id, "pbsWins", k, "Premier Bounty Series")} onClick={trophyClick({ key: "pbsWins", index: k })} style={{ cursor: "pointer", transition: "none" }} />
                                    ))
                                ) : (
                                    <span title={`${pbsTrophyDisplay.n}× Premier Bounty Series`} onClick={trophyClick({ key: "pbsWins" })} style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none", cursor: "pointer" }}>
                                        {pbsTrophyDisplay.n} <PbsTrophy />
                                    </span>
                                ))}
                            {pgxTrophyDisplay &&
                                (pgxTrophyDisplay.mode === "icons" ? (
                                    descendingIndexes(pgxTrophyDisplay.n).map((k) => (
                                        <PgxTrophy key={k} data-tip={trophyTip(trophyCases, t.id, "pgxWins", k, "PGX Grandmasters")} onClick={trophyClick({ key: "pgxWins", index: k })} style={{ cursor: "pointer", transition: "none" }} />
                                    ))
                                ) : (
                                    <span title={`${pgxTrophyDisplay.n}× PGX Grandmasters`} onClick={trophyClick({ key: "pgxWins" })} style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none", cursor: "pointer" }}>
                                        {pgxTrophyDisplay.n} <PgxTrophy />
                                    </span>
                                ))}
                            {swcTrophyDisplay &&
                                (swcTrophyDisplay.mode === "icons" ? (
                                    descendingIndexes(swcTrophyDisplay.n).map((k) => (
                                        <SwcTrophy key={k} data-tip={trophyTip(trophyCases, t.id, "swcWins", k, "Stormdraft World Championship")} onClick={trophyClick({ key: "swcWins", index: k })} style={{ cursor: "pointer", transition: "none" }} />
                                    ))
                                ) : (
                                    <span title={`${swcTrophyDisplay.n}× Stormdraft World Championship`} onClick={trophyClick({ key: "swcWins" })} style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none", cursor: "pointer" }}>
                                        {swcTrophyDisplay.n} <SwcTrophy />
                                    </span>
                                ))}
                            {essTrophyDisplay &&
                                (essTrophyDisplay.mode === "icons" ? (
                                    descendingIndexes(essTrophyDisplay.n).map((k) => (
                                        <EssTrophy key={k} data-tip={trophyTip(trophyCases, t.id, "essWins", k, "Elite Star Series")} onClick={trophyClick({ key: "essWins", index: k })} style={{ cursor: "pointer", transition: "none" }} />
                                    ))
                                ) : (
                                    <span title={`${essTrophyDisplay.n}× Elite Star Series`} onClick={trophyClick({ key: "essWins" })} style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none", cursor: "pointer" }}>
                                        {essTrophyDisplay.n} <EssTrophy />
                                    </span>
                                ))}
                            {tier1TrophyDisplay &&
                                (tier1TrophyDisplay.mode === "icons" ? (
                                    descendingIndexes(tier1TrophyDisplay.n).map((k) => (
                                        <PemSilverTrophy key={k} data-tip={trophyTip(trophyCases, t.id, "tier1Wins", k, "PEM Small Tournament")} onClick={trophyClick({ key: "tier1Wins", index: k })} style={{ cursor: "pointer", transition: "none" }} />
                                    ))
                                ) : (
                                    <span title={`${tier1TrophyDisplay.n}× PEM Small Tournament`} onClick={trophyClick({ key: "tier1Wins" })} style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none", cursor: "pointer" }}>
                                        {tier1TrophyDisplay.n} <PemSilverTrophy />
                                    </span>
                                ))}
                            {ewcTrophyDisplay &&
                                (ewcTrophyDisplay.mode === "icons" ? (
                                    descendingIndexes(ewcTrophyDisplay.n).map((k) => ewcTrophyOf(t.id, k, trophyClick({ key: "ewcWins", index: k })))
                                ) : (
                                    <span title={`${ewcTrophyDisplay.n}× Esports World Cup`} onClick={trophyClick({ key: "ewcWins" })} style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none", cursor: "pointer" }}>
                                        {ewcTrophyDisplay.n} {ewcTrophyOf(t.id, null)}
                                    </span>
                                ))}
                            {trophyDisplay &&
                                (trophyDisplay.mode === "icons" ? (
                                    descendingIndexes(trophyDisplay.n).map((k) => (
                                        <OfficialTrophy key={k} data-tip={trophyTip(trophyCases, t.id, "wins", k, "Official")} onClick={trophyClick({ key: "wins", index: k })} style={{ cursor: "pointer", verticalAlign: "middle", transition: "none" }} />
                                    ))
                                ) : (
                                    <span title={`${trophyDisplay.n}× Official`} onClick={trophyClick({ key: "wins" })} style={{ display: "inline-flex", alignItems: "center", gap: 4, transition: "none", cursor: "pointer" }}>
                                        {trophyDisplay.n} <OfficialTrophy />
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

                    const region = leaderboardSortMode === "regions" ? regionOfTeam(t) : null;
                    const regionStarts = !!region && (i === 0 || regionOfTeam(leaderboardDisplayOrder[i - 1])?.id !== region.id);
                    const regionCount = regionStarts ? leaderboardDisplayOrder.filter((team) => regionOfTeam(team)?.id === region.id).length : 0;

                    return (
                        <React.Fragment key={t.id}>
                            {regionStarts ? (
                                <div key={`region-${region.id}`} data-leaderboard-divider className={css.leaderboard_region}>
                                    <span className={css.leaderboard_region_line} aria-hidden="true" />
                                    <span className={`${css.leaderboard_zone_pill} ${css.leaderboard_zone_below}`}>
                                        <FaEarthEurope className={css.leaderboard_zone_caret} aria-hidden="true" />
                                        {region.name}
                                        <span className={css.leaderboard_zone_range}>
                                            {regionCount} team{regionCount === 1 ? "" : "s"}
                                        </span>
                                    </span>
                                    <span className={css.leaderboard_region_line} aria-hidden="true" />
                                </div>
                            ) : null}
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
                                    title={`Open the profile of Team ${t.name}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!openTeamProfile) return;
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setHoveredLeaderboardTeam(null);
                                        openTeamProfile(t, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, size: rect.width });
                                    }}
                                    style={{
                                        ...circleSizeStyle,
                                        cursor: "pointer",
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
                                        <CountryFlag team={t} size={rank <= 3 ? 22 : 13} style={{ marginRight: rank <= 3 ? 10 : 6, marginTop: rank <= 3 ? -6 : -3 }} />
                                        Team {t.name}
                                        <span className={css.leaderboard_side_right}>
                                            {pointsChange !== 0 && (
                                                <span className={css.leaderboard_change_points} style={{ color: pointsChange > 0 ? "#2e7d32" : "red" }}>
                                                    {pointsChange > 0 ? `+${pointsChange}p` : `${pointsChange}p`}
                                                </span>
                                            )}
                                            {buildPlacingItems(p, null)
                                                .filter((item) => item.key !== "wins" && item.key !== "tier1Wins" && item.key !== "pemBigWins" && item.key !== "gplWins" && item.key !== "pbsWins" && item.key !== "pgxWins" && item.key !== "essWins" && item.key !== "swcWins" && item.key !== "ewcWins")
                                                .map((item) => (
                                                    <span key={item.key} onClick={trophyClick(medalFocus[item.key] ?? null)} style={{ cursor: "pointer", transition: "none" }}>
                                                    <MedalWithBreakdown
                                                        icon={item.icon}
                                                        value={item.value}
                                                        title={item.title}
                                                        onHoverChange={(hovering) => setHoveredLeaderboardTeam(hovering ? null : t)}
                                                        style={{ cursor: "pointer" }}
                                                    />
                                                    </span>
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

        <LeaderboardHoverPopover store={leaderboardHoverStore} cursorRef={leaderboardCursorRef} teamStats={teamStats} tab={leaderboardStatsTab} />
        <AnimatePresence>
            {worldMapOpen ? <WorldMapView key="world-map" teams={allTeams ?? []} rankById={rankById} onClose={closeWorldMap} onOpenProfile={openTeamProfile} onTop={worldMapOnTop} /> : null}
        </AnimatePresence>
        <AnimatePresence>
            {teamProfile?.team && teamProfile.history ? (
                <TeamProfile
                    key={`profile-${teamProfile.teamId}`}
                    team={teamProfile.team}
                    history={teamProfile.history}
                    origin={teamProfile.origin}
                    restored={teamProfile.restored}
                    savedView={teamProfile.savedView}
                    rating={teamRatings[teamProfile.team.id] ?? 0}
                    rank={rankById[teamProfile.team.id] ?? 0}
                    rankColor={placementColors[rankById[teamProfile.team.id]]}
                    placings={teamPlacings?.[teamProfile.team.id]}
                    stats={teamStats?.[teamProfile.team.id]}
                    streak={readUnbeatenStreak(teamStats?.[teamProfile.team.id])}
                    onOpenEntry={openProfileEntry}
                    onOpenEvent={openProfileTournament}
                    ewcTrophies={ewcTrophiesByTeam[teamProfile.team.id] || []}
                    onOpenTrophyRoom={() => openTrophyRoom?.(teamProfile.team.id)}
                    roomOpen={!!trophyRoom}
                    onClose={closeTeamProfile}
                    fromMatch={!!teamProfile.fromMatch}
                    flooded={!!teamProfile.flooded}
                />
            ) : null}
        </AnimatePresence>
        <AnimatePresence>
            {trophyRoomTeam ? (
                <TrophyRoom
                    key={`room-${trophyRoom.teamId}`}
                    team={trophyRoomTeam}
                    placings={teamPlacings?.[trophyRoomTeam.id] ?? EMPTY_TEAM_PLACINGS}
                    cases={trophyCases?.[String(trophyRoomTeam.id)] ?? null}
                    ewcTrophies={ewcTrophiesByTeam[trophyRoomTeam.id] || []}
                    focus={trophyRoom.focus}
                    onClose={closeTrophyRoom}
                    onOpenTournament={(record, item) => {
                        openTrophyRoom?.(trophyRoomTeam.id, { key: item.key, index: item.index });
                        openTrophyTournament?.(record, trophyRoomTeam.id);
                    }}
                />
            ) : null}
        </AnimatePresence>
        </>
    );
}
