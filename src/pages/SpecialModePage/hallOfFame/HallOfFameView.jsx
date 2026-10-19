import React from "react";
import css from "../SpecialModePage.module.css";
import Header from "../../../components/Header/Header.jsx";
import { FaTrophy } from "react-icons/fa";
import { FaCircle, FaCheck, FaXmark } from "react-icons/fa6";
import { ReactFitty } from "react-fitty";
import { PemPlayoffsLayout, GccKnockoutLayout, PbsStageLayout } from "../components/BracketLayouts.jsx";
import { PbsTeamTags } from "../components/PbsDraftShow.jsx";
import { QualifierBadge } from "../components/QualifierBadge.jsx";
import { QualifierGroupNav } from "../components/QualifierGroupNav.jsx";
import { StickyBelow } from "../components/StickyBelow.jsx";
import { PemSeriesTrophy, PemGoldTrophy, PemSilverTrophy, GplTrophy, PbsTrophy } from "../components/Trophies.jsx";
import { CST_GROUPS } from "../logic/cst.js";
import { hallRecordTime } from "../logic/hallOfFameDb.js";
import { PEM_QUALIFIED_HIGHLIGHT, getPemSeriesConfig } from "../logic/pemConfig.js";
import { isPemPlayoffsKind, PEM_MAIN_GROUPS } from "../logic/pemSeries.jsx";
import { PEM_BIG_STAGE2_AUTO_COUNT } from "../logic/pemStage1.jsx";
import { getBestOfForPlayoffs } from "../logic/playoffs.js";
import { QUALIFIER_GROUPS } from "../logic/qualifier.jsx";
import { formatOrdinal } from "../logic/teamData.js";
import { PBS_POT_SIZE } from "../logic/pbsConfig.js";
import { getTournamentTypeConfig, formatTournamentNumber, PEM_SMALL_TYPE_ID, PEM_BIG_TYPE_ID } from "../logic/tournamentTypes.jsx";
import { getTournamentNumberStyle, GPL_PODIUM_TROPHY_SIZE, GPL_PODIUM_TROPHY_STYLE, PBS_PODIUM_TROPHY_SIZE, PBS_PODIUM_TROPHY_STYLE } from "../logic/winnersAndPickem.js";
import { HallManagerModals } from "./HallManagerModals.jsx";

export function HallOfFameView({ hall, hallManager, leaderboardState, hallDrag, page }) {
    const {
        setHallQualifierGroup,
        setSelectedHallTournament,
        setHallStage1Group,
        hallOfFame,
        selectedHallTournament,
        closeHallOfFame,
        hallStage1Group,
        hallQualifierGroup,
        openLinkedHallRecord,
        hallTeamSortMode,
        setHallTeamSortMode,
    } = hall;
    const {
        isHallManagerButtonArmed,
        setIsHallManagerButtonArmed,
        handleHallManagerClick,
        hallManagerForm,
        isHallManagerCodeModalOpen,
        hallManagerCode,
        closeHallManagerModals,
        handleVerifyHallManagerPassword,
        isHallManagerModeModalOpen,
        hallManagerMode,
        handleHallManagerModeConfirm,
        isHallManagerSelectModalOpen,
        hallManagerTargetId,
        hallManagerTargetIds,
        handleHallManagerSelectConfirm,
        isHallManagerFormModalOpen,
        canConfirmHallForm,
        handleHallManagerFormConfirm,
        isHallManagerFinalModalOpen,
        handleHallManagerFinalConfirm,
        setHallManagerCode,
        setHallManagerMode,
        setHallManagerTargetIds,
        setHallManagerTargetId,
        setHallManagerForm,
        setHallPickerField,
        emptyHallPicks,
        hallNeededPointsIsValid,
        handleHallNeededPointsBlur,
        handleHallNeededPointsChange,
        hallFormFieldIsUnlocked,
        hallPickerField,
        sortHallTeams,
        hallTeamById,
        getHallPickAccess,
        hallTeamPickerValue,
        handleHallPickPointerDown,
        handleHallPickPointerEnter,
        handleHallPickClick,
    } = hallManager;
    const { setIsLeaderboardOpen } = leaderboardState;
    const {
        hallScrollRef,
        handleHallWheel,
        handleHallPointerDown,
        handleHallPointerMove,
        handleHallPointerUp,
        handleHallClickCapture,
    } = hallDrag;
    const {
        getTournamentTheme,
        renderTournamentLabelFor,
        openArchivedHallMatchModal,
        isButtonLocked,
        setIsRestartModalOpen,
        setIsTerminateModalOpen,
        navigate,
        renderCstGroupStage,
        renderEclBracket,
        renderPemStage1Bracket,
        renderPemGroupBracket,
        renderQualifierTitle,
        renderQualifierBracket,
        renderQualifierWinnersBlock,
        renderGccLeague,
        renderSwissBracket,
        hallManagerScrollRef,
        getTypeNumber,
        allTeams,
    } = page;

    const hallTeamCircle = (team, size = 52, highlighted = false) => (
        <div
            title={team ? `Team ${team.name}${highlighted ? " (via the Qualifier)" : ""}` : "Unknown team"}
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: team?.color || "#666",
                border: `3px solid ${highlighted ? PEM_QUALIFIED_HIGHLIGHT.borderColor : "#999"}`,
                boxShadow: highlighted ? PEM_QUALIFIED_HIGHLIGHT.boxShadow : team?.shadow || "0 0 8px rgba(0,0,0,.35)",
                flex: "0 0 auto",
            }}
        />
    );
    const hallCardIcon = (won) => (
        <div style={{ top: "-3.2%", left: "-4.75%" }} className={css.modalSuccessPickemIndicator}>
            <FaCircle size={32} color={won ? "#37b737" : "#be3939"} />
            {won ? <FaCheck size={20} color="#ffffff" /> : <FaXmark size={20} color="#fff" />}
        </div>
    );

    const hallPlaceRow = (label, team, size = 52) => (
        <div style={{ display: "flex", alignItems: "center", marginTop: 18, position: "relative" }}>
            {hallTeamCircle(team, size)}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {label ? (
                    <span
                        className={css.finished_modal_team_label}
                        style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: "#fff",
                            textShadow: `
                                0 0 6px ${team?.color},
                                0 0 14px ${team?.color}66,
                                0 1px 3px rgba(0,0,0,0.4)
                            `,
                            width: "max-content",
                            position: "absolute",
                            top: '60%',
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }}
                    >
                        {label}
                    </span>
                ) : null}
                <span
                    className={css.finished_modal_team_label}
                    style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#fff",
                        textShadow: label
                            ? '0 0 4px #000'
                            : `
                                0 0 6px ${team?.color},
                                0 0 14px ${team?.color}66,
                                0 1px 3px rgba(0,0,0,0.4)
                            `,
                        width: "max-content",
                        position: "absolute",
                        top: label ? '-14%' : '60%',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }}
                >
                    Team {team?.name ?? "—"}
                </span>
            </div>
        </div>
    );

    const renderHallTeamRow = (teams, size = 38, highlightedIds = null) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(teams || []).length === 0
                ? <span className={css.info_text} style={{ fontSize: 14 }}>No teams saved.</span>
                : (teams || []).map((team, index) => {
                    const highlighted = !!highlightedIds?.has(team?.id);
                    return (
                        <span
                            key={`${team?.id ?? "team"}-${index}`}
                            title={`Team ${team?.name}`}
                        >
                            {hallTeamCircle(team, size, highlighted)}
                        </span>
                    );
                })}
        </div>
    );

    const hallRecordLabel = (item) =>
        item?.event === "qualifier"
            ? `${getPemSeriesConfig(item.type).label} Qualifier #${item.number}`
            : item?.event === "main"
                ? `${getPemSeriesConfig(item.type).longLabel} #${item.number}`
                : `${getTournamentTypeConfig(item?.type).label} ${formatTournamentNumber(item?.type, item?.number)}`;

    const renderPemHallCardName = (number, type = PEM_SMALL_TYPE_ID) => (
        <>
            <span style={{ display: "block" }}>Pro</span>
            <span style={{ display: "block" }}>Extreme</span>
            <span style={{ display: "block" }}>Masters</span>
            <span style={{ fontSize: 44, fontStyle: "normal" }}>{getPemSeriesConfig(type).sizeWord}</span>
            <span style={{ display: "block", whiteSpace: "nowrap" }}>
                <span>Tournament</span>{" "}
                <span style={getTournamentNumberStyle(getTournamentTheme(number))}>#{number}</span>
            </span>
        </>
    );

    const renderQualifierHallCard = (item) => {
        const won = item.pickemWon;
        const qualifiedTeams = QUALIFIER_GROUPS.flatMap((group) => item.results?.qualifiers?.[group] || []);

        return (
            <button
                type="button"
                key={item.id}
                onClick={() => {
                    setHallQualifierGroup("A");
                    setSelectedHallTournament(item);
                }}
                className={won ? css.cardPickemWin : css.cardPickemLoss}
                style={{
                    position: "relative",
                    flex: "0 0 auto",
                    width: 340,
                    minHeight: 520,
                    padding: "22px 18px",
                    borderRadius: 16,
                    cursor: "pointer",
                    color: "#2e2f42",
                    textAlign: "center",
                    overflow: "visible",
                }}
            >
                {hallCardIcon(won)}

                <div style={{ display: "flex", position: "relative", zIndex: 2, marginTop: 24 }}>
                    <div
                        style={{
                            position: "absolute",
                            top: "-60px",
                            left: "-8px",
                            right: "-8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#fff",
                                position: "absolute",
                                top: "6px",
                                left: "1px"
                            }}
                        >
                            <strong style={{ fontSize: 14 }}>{item.neededPickemPoints}</strong> <br /> needed Pick&apos;em Points
                        </span>
                        <div
                            style={{
                                position: "absolute",
                                top: "8px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                zIndex: 3
                            }}
                        >
                            <QualifierBadge height={20} />
                        </div>
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: won ? "#2e7d32" : "#be3939",
                                position: "absolute",
                                top: "6px",
                                right: "0px"
                            }}
                        >
                            <strong style={{ fontSize: 14 }}><i>{item.achievedPickemPoints}({item.achievedPickemPoints - item.neededPickemPoints > 0 ? '+' : ''}{item.achievedPickemPoints - item.neededPickemPoints})</i></strong> <br /> achieved Pick&apos;em Point{item.achievedPickemPoints !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <div
                    className={css.game_title}
                    style={{
                        margin: "2px 0 0",
                        position: "relative",
                        zIndex: 2,
                        color: "#fff",
                        fontStyle: "oblique",
                        lineHeight: 1,
                        textTransform: "none",
                        fontSize: 20,
                    }}
                >
                    {renderPemHallCardName(item.number, item.type)}
                </div>

                <div style={{ position: "relative", zIndex: 2, marginTop: 12 }}>
                    <span
                        className={css.finished_modal_team_label}
                        style={{
                            color: "#ffffff",
                            fontSize: "36px",
                            textShadow: `
                                0 0 6px #2e2f42,
                                0 0 14px #2e2f4266,
                                0 1px 3px rgba(0,0,0,0.4)
                            `,
                            position: "relative",
                            top: "auto",
                            left: "auto",
                            display: "inline-block",
                            width: "max-content",
                        }}
                    >
                        Four Qualifiers
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
                    {qualifiedTeams.map((team) => (
                        <React.Fragment key={team.id}>
                            {hallPlaceRow(null, team, 40)}
                        </React.Fragment>
                    ))}
                </div>
            </button>
        );
    };

    const renderTier2HallCard = (item, [firstWord, secondWord, lastWord]) => {
        const won = item.pickemWon;
        const results = item.results || {};

        return (
            <button
                type="button"
                key={item.id}
                onClick={() => setSelectedHallTournament(item)}
                className={won ? css.cardPickemWin : css.cardPickemLoss}
                style={{
                    position: "relative",
                    flex: "0 0 auto",
                    width: 340,
                    minHeight: 520,
                    padding: "22px 18px",
                    borderRadius: 16,
                    cursor: "pointer",
                    color: "#2e2f42",
                    textAlign: "center",
                    overflow: "visible",
                }}
            >
                {hallCardIcon(won)}

                <div style={{ display: "flex", position: "relative", zIndex: 2, marginTop: 24 }}>
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#fff",
                            position: "absolute",
                            top: "-60px",
                            left: "-8px"
                        }}
                    >
                        <strong style={{ fontSize: 14 }}>{item.neededPickemPoints}</strong> <br /> needed Pick&apos;em Points
                    </span>
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: won ? "#2e7d32" : "#be3939",
                            position: "absolute",
                            top: "-60px",
                            right: "-8px"
                        }}
                    >
                        <strong style={{ fontSize: 14 }}><i>{item.achievedPickemPoints}({item.achievedPickemPoints - item.neededPickemPoints > 0 ? '+' : ''}{item.achievedPickemPoints - item.neededPickemPoints})</i></strong> <br /> achieved Pick&apos;em Point{item.achievedPickemPoints !== 1 ? 's' : ''}
                    </span>
                </div>

                <div
                    className={css.game_title}
                    style={{
                        margin: "0",
                        position: "relative",
                        zIndex: 2,
                        color: "#fff",
                        fontStyle: "oblique",
                        lineHeight: 1,
                        textTransform: "none",
                        fontSize: 30,
                    }}
                >
                    <span style={{ display: "block" }}>{firstWord}</span>
                    <span style={{ display: "block" }}>{secondWord}</span>
                    <span style={{ display: "block", whiteSpace: "nowrap" }}>
                        {lastWord}{" "}
                        <span style={getTournamentNumberStyle(getTournamentTheme(item.number))}>#{item.number}</span>
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginTop: 34,
                        position: "relative"
                    }}
                >
                    <span
                        className={css.finished_modal_team_label}
                        style={{
                            color: `#ffffff`,
                            fontSize: "26px",
                            width: "max-content",
                            textShadow: '0 0 4px #000',
                            position: "absolute",
                            left: "50%",
                            top: "-20%",
                            transform: "translateX(-50%)",
                            zIndex: 3
                        }}
                    >
                        Team {results.winner?.name ?? "—"}
                    </span>
                    <div style={{ position: "relative", zIndex: 2 }}>
                        {hallTeamCircle(results.winner, 84)}
                    </div>
                    <span
                        className={css.finished_modal_team_label}
                        style={{
                            color: '#ffffff',
                            fontSize: "40px",
                            width: "max-content",
                            textShadow: `
                                0 0 6px ${results.winner?.color},
                                0 0 14px ${results.winner?.color}66,
                                0 1px 3px rgba(0,0,0,0.4)
                            `,
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 3
                        }}
                    >
                        1st place
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 14, position: "relative", zIndex: 2 }}>
                    {hallPlaceRow("2nd place", results.runnerUp, 56)}
                    {hallPlaceRow("3rd place", results.thirdPlace, 46)}
                    {hallPlaceRow("4th place", results.fourthPlace, 40)}
                </div>
            </button>
        );
    };

    const renderGplHallCardName = (number) => (
        <span style={{ fontSize: 30 }}>
            <span style={{ display: "block" }}>Global</span>
            <span style={{ display: "block" }}>Pro</span>
            <span style={{ display: "block", whiteSpace: "nowrap" }}>
                League{" "}
                <span style={getTournamentNumberStyle(getTournamentTheme(number))}>#{number}</span>
            </span>
        </span>
    );

    const renderPbsHallCardName = (number) => (
        <span style={{ fontSize: 30 }}>
            <span style={{ display: "block" }}>Premier</span>
            <span style={{ display: "block" }}>Bounty</span>
            <span style={{ display: "block" }}>Series</span>
            <span style={{ display: "block", whiteSpace: "nowrap" }}>
                <span style={getTournamentNumberStyle(getTournamentTheme(number))}>Season {number}</span>
            </span>
        </span>
    );

    const renderPemMainHallCard = (item) => {
        const won = item.pickemWon;
        const results = item.results || {};
        const isGpl = item.event === "gpl";
        const isPbs = item.event === "pbs";

        return (
            <button
                type="button"
                key={item.id}
                onClick={() => {
                    setHallQualifierGroup("A");
                    setHallStage1Group("A");
                    setSelectedHallTournament(item);
                }}
                className={won ? css.cardPickemWin : css.cardPickemLoss}
                style={{
                    position: "relative",
                    flex: "0 0 auto",
                    width: 340,
                    minHeight: 520,
                    padding: "22px 18px",
                    borderRadius: 16,
                    cursor: "pointer",
                    color: "#2e2f42",
                    textAlign: "center",
                    overflow: "visible",
                }}
            >
                {hallCardIcon(won)}

                <div style={{ display: "flex", position: "relative", zIndex: 2, marginTop: 12 }}>
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#fff",
                            position: "absolute",
                            top: "-32px",
                            left: "-8px"
                        }}
                    >
                        <strong style={{ fontSize: 14 }}>{item.neededPickemPoints}</strong> <br /> needed Pick&apos;em Points
                    </span>
                    <span
                        style={{
                            position: "absolute",
                            top: "-30px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                        }}
                    >
                        {isPbs ? <PbsTrophy size={28} /> : isGpl ? <GplTrophy size={28} /> : <PemSeriesTrophy type={item.type} size={28} />}
                    </span>
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: won ? "#2e7d32" : "#be3939",
                            position: "absolute",
                            top: "-32px",
                            right: "-8px"
                        }}
                    >
                        <strong style={{ fontSize: 14 }}><i>{item.achievedPickemPoints}({item.achievedPickemPoints - item.neededPickemPoints > 0 ? '+' : ''}{item.achievedPickemPoints - item.neededPickemPoints})</i></strong> <br /> achieved Pick&apos;em Point{item.achievedPickemPoints !== 1 ? 's' : ''}
                    </span>
                </div>

                <div
                    className={css.game_title}
                    style={{
                        margin: "2px 0 0",
                        position: "relative",
                        zIndex: 2,
                        color: "#fff",
                        fontStyle: "oblique",
                        lineHeight: 1,
                        textTransform: "none",
                        fontSize: 20,
                        marginTop: isPbs ? "4px" : isGpl ? "20px" : ""
                    }}
                >
                    {isPbs ? renderPbsHallCardName(item.number) : isGpl ? renderGplHallCardName(item.number) : renderPemHallCardName(item.number, item.type)}
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginTop: isPbs ? 38 : isGpl ? 52 : 36,
                        position: "relative"
                    }}
                >
                    <span
                        className={css.finished_modal_team_label}
                        style={{
                            color: `#ffffff`,
                            fontSize: "32px",
                            width: "max-content",
                            textShadow: '0 0 4px #000',
                            position: "absolute",
                            left: "50%",
                            top: "-25%",
                            transform: "translateX(-50%)",
                            zIndex: 3
                        }}
                    >
                        Team {results.winner?.name ?? "—"}
                    </span>
                    <div style={{ position: "relative", zIndex: 2 }}>
                        {hallTeamCircle(results.winner, 88)}
                    </div>
                    <span
                        className={css.finished_modal_team_label}
                        style={{
                            color: '#ffffff',
                            fontSize: "48px",
                            textShadow: `
                                0 0 6px ${results.winner?.color},
                                0 0 14px ${results.winner?.color}66,
                                0 1px 3px rgba(0,0,0,0.4)
                            `,
                            position: "absolute",
                            left: "50%",
                            top: "55%",
                            transform: "translateX(-50%)",
                            zIndex: 3
                        }}
                    >
                        CHAMPION
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 10, position: "relative", zIndex: 2 }}>
                    {hallPlaceRow("Runner Up", results.runnerUp, 58)}
                    {hallPlaceRow("3rd place", results.thirdPlace, 48)}
                    {hallPlaceRow("4th place", results.fourthPlace, 40)}
                </div>
            </button>
        );
    };

    const renderHallCard = (item) => {
        if (item.event === "qualifier") return renderQualifierHallCard(item);
        if (item.event === "cst") return renderTier2HallCard(item, ["Champions", "Series", "Tour"]);
        if (item.event === "ecl") return renderTier2HallCard(item, ["Elite", "Competition", "League"]);
        if (item.event === "main" || item.event === "gpl" || item.event === "pbs") return renderPemMainHallCard(item);
        if (item.event === "gcc") return renderTier2HallCard(item, ["Global", "Challenger", "Cup"]);

        const won = item.pickemWon;
        const config = getTournamentTypeConfig(item.type);
        const results = item.results || {};

        return (
            <button
                type="button"
                key={item.id}
                onClick={() => setSelectedHallTournament(item)}
                className={`${config.highlightCard ? css.cardOfficial : ""} ${won ? css.cardPickemWin : css.cardPickemLoss}`}
                style={{
                    position: "relative",
                    flex: "0 0 auto",
                    width: 340,
                    minHeight: 520,
                    padding: "22px 18px",
                    borderRadius: 16,
                    cursor: "pointer",
                    color: "#2e2f42",
                    textAlign: "center",
                    overflow: "visible",
                    border: config.highlightCard ? "none" : "",
                }}
            >
                {hallCardIcon(won)}

                <div style={{
                    display: "flex",
                    position: "relative",
                    zIndex: 2
                }}>
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#fff",
                            position: "absolute",
                            top: "-60px",
                            left: "-8px"
                        }}
                    >
                        <strong style={{ fontSize: 14 }}>{item.neededPickemPoints}</strong> <br /> needed Pick&apos;em Points
                    </span>
                    {config.highlightCard && (
                        <span
                            style={{
                                position: "absolute",
                                top: "-60px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                color: "#2e2f42",
                                fontWeight: 700,
                                fontSize: "32px"
                            }}
                        >
                            <FaTrophy />
                        </span>
                    )}
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: won ? "#2e7d32" : "#be3939",
                            position: "absolute",
                            top: "-60px",
                            right: "-8px"
                        }}
                    >
                        <strong style={{ fontSize: 14 }}><i>{item.achievedPickemPoints}({item.achievedPickemPoints - item.neededPickemPoints > 0 && item.achievedPickemPoints - item.neededPickemPoints !== 0 ? '+' : ''}{item.achievedPickemPoints - item.neededPickemPoints})</i></strong> <br /> achieved Pick&apos;em Point{item.achievedPickemPoints !== 1 ? 's' : ''}
                    </span>
                </div>

                <div
                    className={css.game_title}
                    style={{
                        fontSize: 48,
                        margin: "84px 0 -16px",
                        position: "relative",
                        zIndex: 2,
                        color: "#fff",
                        fontStyle: "oblique"
                    }}
                >
                    <span
                        style={{
                            position: "absolute",
                            width: "300px",
                            textAlign: "center",
                            transform: "translateX(-50%)",
                            left: "50%",
                            bottom: "42px"
                        }}
                    >
                        {renderTournamentLabelFor(item.type, item.number)}
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginTop: 14,
                        position: "relative"
                    }}
                >
                    <span
                        className={css.finished_modal_team_label}
                        style={{
                            color: `#ffffff`,
                            fontSize: "32px",
                            width: "max-content",
                            textShadow: '0 0 4px #000',
                            position: "absolute",
                            left: "50%",
                            top: "-25%",
                            transform: "translateX(-50%)",
                            zIndex: 3
                        }}
                    >
                        Team {results.winner?.name ?? "—"}
                    </span>
                    <div style={{ position: "relative", zIndex: 2 }}>
                        {hallTeamCircle(results.winner, 96)}
                    </div>
                    <span
                        className={css.finished_modal_team_label}
                        style={{
                            color: '#ffffff',
                            fontSize: "48px",
                            textShadow: `
                                0 0 6px ${results.winner?.color},
                                0 0 14px ${results.winner?.color}66,
                                0 1px 3px rgba(0,0,0,0.4)
                            `,
                            position: "absolute",
                            left: "50%",
                            top: "55%",
                            transform: "translateX(-50%)",
                            zIndex: 3
                        }}
                    >
                        CHAMPION
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 10, position: "relative", bottom: "-20px", zIndex: 2 }}>
                    {hallPlaceRow("Runner Up", results.runnerUp, 64)}
                    {hallPlaceRow("3rd place", results.thirdPlace, 52)}
                    {hallPlaceRow("4th place", results.fourthPlace, 44)}
                </div>
            </button>
        );
    };

    const renderHallManagerModals = () => <HallManagerModals ctx={{
            hallManagerForm,
            isHallManagerCodeModalOpen,
            hallManagerCode,
            closeHallManagerModals,
            handleVerifyHallManagerPassword,
            isHallManagerModeModalOpen,
            hallManagerMode,
            hallOfFame,
            handleHallManagerModeConfirm,
            isHallManagerSelectModalOpen,
            hallManagerScrollRef,
            hallManagerTargetId,
            hallManagerTargetIds,
            handleHallManagerSelectConfirm,
            isHallManagerFormModalOpen,
            hallTeamSortMode,
            canConfirmHallForm,
            handleHallManagerFormConfirm,
            isHallManagerFinalModalOpen,
            handleHallManagerFinalConfirm,
            setHallManagerCode,
            setHallManagerMode,
            hallRecordLabel,
            setHallManagerTargetIds,
            setHallManagerTargetId,
            setHallManagerForm,
            setHallPickerField,
            getTypeNumber,
            emptyHallPicks,
            hallNeededPointsIsValid,
            handleHallNeededPointsBlur,
            handleHallNeededPointsChange,
            hallFormFieldIsUnlocked,
            hallPickerField,
            sortHallTeams,
            allTeams,
            hallTeamById,
            getHallPickAccess,
            hallTeamPickerValue,
            handleHallPickPointerDown,
            handleHallPickPointerEnter,
            handleHallPickClick,
            setHallTeamSortMode,
        }} />;

    const renderArchivedPlayoffsBracket = (record, pbsView = null) => {
        const bracketKind = record.playoffs?.kind ?? null;
        const hasRoundOf16 = (record.playoffs?.ro16?.length ?? 0) > 0;
        const connectorLevelOf = (stage) => (hasRoundOf16 ? stage : ({ qf: "ro16", sf: "qf" }[stage] ?? stage));
        const stages = [
            ["ro16", "Round of 16", css.match_rect, css.columnRo16],
            ["qf", "Quarterfinals", css.quarters_rect, hasRoundOf16 ? css.columnQuarters : css.columnRo16],
            ["sf", "Semifinals", css.semis_rect, hasRoundOf16 ? css.columnSemis : css.columnQuarters],
            ["gf", "Grand Final", css.grandFinal_rect, css.columnGrandFinal],
        ].filter(([stage]) => stage !== "ro16" || hasRoundOf16);

        const renderArchivedMatch = (match, stage, index, rectClass, pemLayout = false) => {
            if (!match) return null;

            const displayMatch = match;

            const isUserWin =
                displayMatch.pickTeamId &&
                displayMatch.winnerTeamId &&
                displayMatch.pickTeamId === displayMatch.winnerTeamId;

            const shouldSwap =
                !!displayMatch.pickTeamId &&
                displayMatch.slotA &&
                displayMatch.slotB &&
                displayMatch.pickTeamId === displayMatch.slotB.id;

            const leftTeam = shouldSwap ? displayMatch.slotB : displayMatch.slotA;
            const rightTeam = shouldSwap ? displayMatch.slotA : displayMatch.slotB;
            const displayScoreLeft = shouldSwap ? displayMatch.scoreRight : displayMatch.scoreLeft;
            const displayScoreRight = shouldSwap ? displayMatch.scoreLeft : displayMatch.scoreRight;

            const winnerIsLeft =
                isUserWin &&
                displayMatch.winnerTeamId &&
                leftTeam &&
                displayMatch.winnerTeamId === leftTeam.id;

            return (
                <div
                    key={displayMatch.id || `${stage}-${index}`}
                    className={
                        pemLayout
                            ? css.pem_playoffs_wrapper
                            : connectorLevelOf(stage) === "ro16"
                                ? (index % 2 === 0 ? css.ro16ConnectorWrapper_down : css.ro16ConnectorWrapper_up)
                                : connectorLevelOf(stage) === "qf"
                                    ? (index % 2 === 0 ? css.qfConnectorWrapper_down : css.qfConnectorWrapper_up)
                                    : connectorLevelOf(stage) === "sf"
                                        ? (index % 2 === 0 ? css.sfConnectorWrapper_down : css.sfConnectorWrapper_up)
                                        : css.gfConnectorWrapper
                    }
                >
                    <button
                        type="button"
                        data-bracket-rect={pemLayout ? `${stage}-${index}` : undefined}
                        data-no-press=""
                        className={`${rectClass} ${winnerIsLeft ? css.playoffs_match_win : css.playoffs_match_loss}`}
                        onClick={() => openArchivedHallMatchModal(record, stage, index, displayMatch)}
                        style={{ cursor: "pointer", borderColor: winnerIsLeft ? "#2e7d32" : "#7d2e2e" }}
                    >
                        {isUserWin ? (
                            <div className={css.hallOfFameSuccessPickemIndicator}>
                                <FaCircle size={28} color="#37b737" />
                                <FaCheck size={16} color="#fff" />
                            </div>
                        ) : (
                            <div className={css.hallOfFameSuccessPickemIndicator}>
                                <FaCircle size={28} color="#be3939" />
                                <FaXmark size={16} color="#fff" />
                            </div>
                        )}

                        <div
                            style={{ padding: "4.2px 4px" }}
                            className={`${stage === "thirdPlace" ? css.bo_thirdPlaceDecider_label : css.bo_playoffs_label} ${isUserWin ? css.playoffs_match_win_label : css.playoffs_match_loss_label}`}
                        >
                            BO{getBestOfForPlayoffs(stage, bracketKind)}
                        </div>

                        {stage !== "thirdPlace" && stage !== "gf" ? (
                            <div
                                style={{ padding: "4.2px 12px 4.2px 4px" }}
                                className={`${css.no_playoffs_label} ${isUserWin ? css.playoffs_match_win_no_label : css.playoffs_match_loss_no_label}`}
                            >
                                #{index + 1}
                            </div>
                        ) : null}

                        <div className={css.match_content}>
                            {[leftTeam, rightTeam].map((team, side) => {
                                const won = isUserWin
                                    ? displayMatch.pickTeamId === team?.id
                                    : displayMatch.pickTeamId !== team?.id;

                                const score = side === 0 ? displayScoreLeft : displayScoreRight;

                                return (
                                    <React.Fragment key={team?.id || side}>
                                        {side === 1 && (
                                            <div className={css.vs_row}>
                                                <div
                                                    style={{ backgroundColor: isUserWin ? "#2e7d32" : "red" }}
                                                    className={css.divider}
                                                />
                                            </div>
                                        )}

                                        <div className={css.team_row}>
                                            <div className={css.team_cell}>
                                                {team ? (
                                                    <div
                                                        className={css.team_circle}
                                                        style={{ background: team.color }}
                                                        title={`Team ${team.name}`}
                                                    />
                                                ) : (
                                                    <div className={css.placeholder_circle}>?</div>
                                                )}
                                            </div>

                                            <div
                                                style={{
                                                    color: won ? "#2e7d32" : "red",
                                                    fontWeight: 700,
                                                    fontSize: 16
                                                }}
                                                className={css.team_name_placeholder}
                                            >
                                                {team ? `Team ${team.name}` : "TBD"}
                                            </div>

                                            <span
                                                style={{
                                                    color: won ? "#2e7d32" : "red",
                                                    fontWeight: 800,
                                                    fontStyle: "italic",
                                                    position: "absolute",
                                                    left: side === 0 ? "85%" : "83%",
                                                    zIndex: 1,
                                                    fontSize: 72,
                                                    opacity: won ? 1 : 0.4
                                                }}
                                                className={won ? css.winnerScoreShadow : css.loserScoreShadow}
                                            >
                                                {score}
                                            </span>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </button>
                </div>
            );
        };

        if (bracketKind === "pbs") {
            const pbsRectClasses = {
                ro32: css.match_rect,
                ro16: css.match_rect,
                qf: css.quarters_rect,
                sf: css.semis_rect,
                thirdPlace: css.thirdPlace_rect,
                gf: css.grandFinal_rect,
            };

            return (
                <PbsStageLayout
                    bracket={record.playoffs}
                    view={pbsView ?? "pbsStage1"}
                    renderMatch={(match, stage, index) =>
                        renderArchivedMatch(match, stage, index, pbsRectClasses[stage], true)
                    }
                />
            );
        }

        if (bracketKind === "gcc") {
            const gccRectClasses = {
                po: css.quarters_rect,
                qf: css.quarters_rect,
                sf: css.semis_rect,
                thirdPlace: css.thirdPlace_rect,
                gf: css.grandFinal_rect,
            };

            return (
                <GccKnockoutLayout
                    bracket={record.playoffs}
                    renderMatch={(match, stage, index) =>
                        renderArchivedMatch(match, stage, index, gccRectClasses[stage], true)
                    }
                />
            );
        }

        if (isPemPlayoffsKind(bracketKind)) {
            const pemRectClasses = {
                qf: css.quarters_rect,
                sf: css.semis_rect,
                thirdPlace: css.thirdPlace_rect,
                gf: css.grandFinal_rect,
            };

            return (
                <PemPlayoffsLayout
                    bracket={record.playoffs}
                    renderMatch={(match, stage, index) =>
                        renderArchivedMatch(match, stage, index, pemRectClasses[stage], true)
                    }
                />
            );
        }

        const thirdPlaceColumn = record.playoffs?.thirdPlace?.length ? (
            <div
                className={css.thirdPlace_container}
                style={hasRoundOf16
                    ? { top: "76.1%", left: "78.3%" }
                    : { top: "calc(100% + 28px)", left: "50%", transform: "translateX(-50%)", marginTop: 0 }}
            >
                <h4 style={{ width: "17ch" }} className={css.column_title}>Third Place Decider</h4>
                <div className={css.columnThirdPlace}>{record.playoffs.thirdPlace.map((match, index) => renderArchivedMatch(match, "thirdPlace", index, css.thirdPlace_rect))}</div>
            </div>
        ) : null;

        return (
            <div className={css.bracket_container} style={{ transition: "none", marginLeft: hasRoundOf16 ? 28 : 0, position: "relative" }}>
                <div className={css.bracket_inner}>
                    {stages.map(([stage, title, rectClass, columnClass]) => (
                        <div
                            className={css.column_container}
                            key={stage}
                            style={stage === "gf" && !hasRoundOf16 ? { position: "relative" } : undefined}
                        >
                            <h4 className={css.column_title}>{title}</h4>
                            <div className={columnClass}>{(record.playoffs?.[stage] || []).map((match, index) => renderArchivedMatch(match, stage, index, rectClass))}</div>
                            {stage === "gf" && !hasRoundOf16 && thirdPlaceColumn}
                        </div>
                    ))}
                    {hasRoundOf16 && thirdPlaceColumn}
                </div>
            </div>
        );
    };

    const HallOfFameSectionTitle = ({ text, marginTop = "48px", marginBottom = "48px", sectionId }) => (
        <div data-hall-section={sectionId} style={{ marginTop, marginBottom, position: "relative" }}>
            <div style={{ position: "absolute", top: "-22px", right: "50%", transform: "translateX(50%)" }}>
                <h4
                    className={css.game_title}
                    style={{ fontSize: "30px", color: "#999", backgroundColor: "#fff", padding: "4px 6px" }}
                >
                    {text}
                </h4>
            </div>
            <hr style={{ width: "1800px", margin: 0 }} className={css.dashed_divider} />
        </div>
    );

    const findPemCounterpartRecord = (record, event) => {
        const finishedAt = hallRecordTime(record);
        return hallOfFame
            .filter((item) =>
                item.type === (record.type ?? PEM_SMALL_TYPE_ID) &&
                item.event === event &&
                item.number === record.number &&
                (event === "main" ? hallRecordTime(item) >= finishedAt : hallRecordTime(item) <= finishedAt)
            )
            .sort((a, b) => Math.abs(hallRecordTime(a) - finishedAt) - Math.abs(hallRecordTime(b) - finishedAt))[0] ?? null;
    };

    const renderHallLink = (label, onClick) => (
        <button type="button" className={css.hall_link} onClick={onClick}>
            {label}
        </button>
    );

    const renderHallPodium = (podium, trophy = null) => (
        <div className={css.winnerPodium} style={{ height: "732px" }}>
            {podium.runnerUp && (
                <div className={css.podiumRow}>
                    <div className={css.runnerUpLogo} style={{ backgroundColor: podium.runnerUp.color, boxShadow: podium.runnerUp.shadow }} />
                    <span className={css.runnerUpMedal}>🥈</span>
                    <div className={css.secondPodium} style={{ height: "500px", marginBottom: "0px" }}>
                        <ReactFitty key={podium.runnerUp?.name} className={css.runnerUpName} maxSize={16} minSize={10}>
                            Team <b>{podium.runnerUp.name}</b>
                        </ReactFitty>
                        <span className={css.runnerUpLabel}>RunnerUp</span>
                    </div>
                </div>
            )}
            {podium.winner && (
                <div className={css.podiumRow}>
                    <div className={css.winnerLogo} style={{ backgroundColor: podium.winner.color, boxShadow: podium.winner.shadow }} />
                    <span className={css.winnerMedal}>🥇</span>
                    {trophy && <span className={css.winnerTrophy}>{trophy}</span>}
                    <div className={css.firstPodium} style={{ height: "600px", marginBottom: "0px" }}>
                        <ReactFitty key={podium.winner?.name} className={css.firstPlaceName} maxSize={16} minSize={10}>
                            Team <b>{podium.winner.name}</b>
                        </ReactFitty>
                        <span className={css.firstPlaceLabel}>Winner</span>
                    </div>
                </div>
            )}
            {podium.thirdPlace && (
                <div className={css.podiumRow}>
                    <div className={css.placeLogoThird} style={{ background: podium.thirdPlace.color }} />
                    <span className={css.thirdPlaceMedal}>🥉</span>
                    <div className={css.thirdPodium} style={{ height: "300px", marginBottom: "0px" }}>
                        <ReactFitty key={podium.thirdPlace?.name} className={css.thirdPlaceName} maxSize={16} minSize={10}>
                            Team <b>{podium.thirdPlace.name}</b>
                        </ReactFitty>
                        <span className={css.thirdPlaceLabel}>3rd</span>
                    </div>
                </div>
            )}
            {podium.fourthPlace && (
                <div className={css.podiumRow}>
                    <div className={css.placeLogoFourth} style={{ background: podium.fourthPlace.color }} />
                    <span className={css.fourthPlaceMedal}>🏅</span>
                    <div className={css.fourthPodium} style={{ height: "200px", marginBottom: "0px" }}>
                        <ReactFitty key={podium.fourthPlace?.name} className={css.fourthPlaceName} maxSize={16} minSize={10}>
                            Team <b>{podium.fourthPlace.name}</b>
                        </ReactFitty>
                        <span className={css.fourthPlaceLabel}>4th</span>
                    </div>
                </div>
            )}
        </div>
    );

    const renderHallPlaceEntry = (entry, placementColors) => (
        <div
            key={`${entry.place}-${entry.team?.id}`}
            style={{ display: "flex", alignItems: "center", flexDirection: "column", gap: 4, color: "#2e2f42" }}
        >
            {hallTeamCircle(entry.team, 42)}
            <div>
                <span className={css.leaderboard_rank} style={{ color: placementColors[entry.place] || "#2e2f42" }}>
                    {formatOrdinal(entry.place)}
                </span>{" "}
                <span style={{ fontWeight: "700" }}>Team {entry.team?.name}</span>
            </div>
        </div>
    );

    const renderHallChallengeInfo = (record) => {
        const resultColor = record.pickemWon ? "#2e7d32" : "#be3939";
        const difference = record.achievedPickemPoints - record.neededPickemPoints;

        return (
            <div className={css.info_text} style={{ textAlign: "center", width: "max-content" }}>
                <span
                    style={{
                        color: resultColor,
                        fontWeight: 800,
                        fontSize: "28px",
                        display: "inline-block",
                        marginBottom: "12px",
                        marginTop: "6px",
                    }}
                >
                    {record.pickemWon ? "Challenge won" : "Challenge lost"}
                </span>
                <br />
                <i>
                    <span style={{ fontWeight: 900 }}>{record.neededPickemPoints}</span>{" "}
                    needed Pick&apos;em points
                </i>
                <br />
                <hr style={{ margin: "0", marginTop: "2px" }} className={css.divider} />
                <i>
                    <span style={{ color: resultColor, fontWeight: 900 }}>
                        {record.achievedPickemPoints}{" "}
                    </span>
                    achieved Pick&apos;em point{record.achievedPickemPoints !== 1 ? "s" : ""}
                    <span style={{ color: resultColor, fontWeight: 800 }}>
                        ({difference > 0 ? "+" : ""}
                        {difference})
                    </span>
                </i>
                <br />
            </div>
        );
    };

    const renderHallOfFame = () => {
        const record = selectedHallTournament;
        const hallPickemWonCount = hallOfFame.filter((item) => item.pickemWon).length;
        const hallPickemLostCount = hallOfFame.length - hallPickemWonCount;
        const hallPickemScore = hallOfFame.reduce(
            (score, item) => score + (Number(item.achievedPickemPoints) || 0) - (Number(item.neededPickemPoints) || 0),
            0
        );

        const hallHeader = (
            <Header
                setIsRestartModalOpen={() => setIsRestartModalOpen(true)}
                setIsTerminateModalOpen={() => setIsTerminateModalOpen(true)}
                setIsScoreBoardOpen={closeHallOfFame}
                setIsScoreBoard={() => setIsLeaderboardOpen(true)}
                isIntroClosed={false}
                isLeaderboardOpen={false}
                isHallOfFameOpen
                setIsHallOfFameClose={() => {
                    setIsHallManagerButtonArmed(false);
                    closeHallOfFame();
                }}
                isButtonLocked={isButtonLocked}
                isScoreBoardButtonLocked={true}
                isScoreBoardResetButtonLocked={true}
                onInfoPage={() => navigate("/special-mode-info")}
            />
        );

        const pickemCounters = (
            <div style={{
                position: "fixed",
                top: "7%",
                right: "3%",
                zIndex: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 2,
            }}>
                <span style={{ color: "#2e2f42", fontWeight: 800 }}>
                    Pick&apos;em points score: <i>{hallPickemScore >= 0 ? '+' : ''}{hallPickemScore}</i>
                </span>
                <span style={{ color: "#2e7d32", fontWeight: 800 }}>
                    <span style={{ fontWeight: 900, textDecoration: "underline" }}><i>{hallPickemWonCount}</i></span> Pick&apos;em challenge{hallPickemWonCount !== 1 ? 's' : ''} won
                </span>
                <span style={{ color: "#be3939", fontWeight: 800 }}>
                    <span style={{ fontWeight: 900, textDecoration: "underline" }}><i>{hallPickemLostCount}</i></span> Pick&apos;em challenge{hallPickemLostCount !== 1 ? 's' : ''} lost
                </span>
            </div>
        );

        const managerButton = (
            <button
                type="button"
                className={css.gamble_button}
                onClick={() => {
                    if (!isHallManagerButtonArmed) {
                        setIsHallManagerButtonArmed(true);
                        return;
                    }
                    handleHallManagerClick();
                }}
                style={{
                    position: "fixed",
                    top: "7%",
                    left: "2%",
                    zIndex: 6,
                    opacity: isHallManagerButtonArmed ? 1 : 0,
                    pointerEvents: "auto",
                    cursor: isHallManagerButtonArmed ? "pointer" : "default",
                    transition: "none"
                }}
            >
                Manage tournaments
            </button>
        );

        if (!record) {
            return (
                <div
                    style={{
                        height: "100dvh",
                        overflow: "hidden",
                    }}
                >
                    {hallHeader}
                    <div
                        className={css.page_container}
                        style={{ position: "relative", alignItems: "center", marginTop: "48px" }}
                    >
                        {managerButton}
                        {pickemCounters}

                        <div className={css.header_row}>
                            <div
                                className={css.game_title}
                                style={{ fontSize: "40px", textShadow: "0 0 4px #000", textTransform: "none" }}
                            >
                                Hall of Fame
                            </div>
                        </div>

                        <div
                            ref={hallScrollRef}
                            onWheel={handleHallWheel}
                            onPointerDown={handleHallPointerDown}
                            onPointerMove={handleHallPointerMove}
                            onPointerUp={handleHallPointerUp}
                            onPointerCancel={handleHallPointerUp}
                            onClickCapture={handleHallClickCapture}
                            onDragStart={(e) => e.preventDefault()}
                            className={css.hidden_scrollbar}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                overflowX: "auto",
                                overflowY: "hidden",
                                gap: 28,
                                width: "100vw",
                                padding: "24px 6vw 128px",
                                cursor: "grab",
                            }}
                        >
                            {hallOfFame.length === 0 ? (
                                <div className={css.info_text} style={{ width: "100%", textAlign: "center" }}>
                                    No finished tournaments yet. Finish a tournament and it will show up right here.
                                </div>
                            ) : hallOfFame.map(renderHallCard)}
                        </div>

                        {renderHallManagerModals()}
                    </div>
                </div>
            );
        }

        if (record.event === "cst") {
            const groups = record.groups || {};
            const allCstTeams = Array.from({ length: 5 }).flatMap((_, i) =>
                CST_GROUPS.map((group) => groups[group]?.[i]).filter(Boolean)
            );
            const podium = record.results || {};
            const restPlaces = (record.places || []).filter((entry) => entry.place >= 5);
            const placementColors = {
                5: "#40e0d0",
                6: "#ba68c8",
                7: "#ff5e2d",
                8: "#81c784",
            };

            return (
                <>
                    {hallHeader}
                    <div
                        className={css.page_container}
                        style={{ position: "relative", padding: "12vh 6vw 32px" }}
                    >
                        <button
                            type="button"
                            className={css.gamble_button}
                            onClick={() => setSelectedHallTournament(null)}
                            style={{ position: "fixed", top: "7%", left: "2%", zIndex: 21 }}
                        >
                            Back to Hall of Fame
                        </button>

                        <div className={css.second_header}>
                            <h2 style={{ fontStyle: "oblique", textTransform: "none", display: "inline-flex", alignItems: "center", gap: 12 }} className={css.game_title}>
                                <span>
                                    Champions Series Tour{" "}
                                    <span style={getTournamentNumberStyle(getTournamentTheme(record.number))}>
                                        #{record.number}
                                    </span>
                                </span>
                            </h2>
                            <div
                                className={css.info_text}
                                style={{ textAlign: "center", width: "max-content" }}
                            >
                                <span
                                    style={{
                                        color: record.pickemWon ? "#2e7d32" : "#be3939",
                                        fontWeight: 800,
                                        fontSize: "28px",
                                        display: "inline-block",
                                        marginBottom: "12px",
                                        marginTop: "6px",
                                    }}
                                >
                                    {record.pickemWon ? "Challenge won" : "Challenge lost"}
                                </span>
                                <br />
                                <i>
                                    <span style={{ fontWeight: 900 }}>{record.neededPickemPoints}</span>{" "}
                                    needed Pick&apos;em points
                                </i>
                                <br />
                                <hr style={{ margin: "0", marginTop: "2px" }} className={css.divider} />
                                <i>
                                    <span style={{ color: record.pickemWon ? "#2e7d32" : "#be3939", fontWeight: 900 }}>
                                        {record.achievedPickemPoints}{" "}
                                    </span>
                                    achieved Pick&apos;em point{record.achievedPickemPoints !== 1 ? "s" : ""}
                                    <span style={{ color: record.pickemWon ? "#2e7d32" : "#be3939", fontWeight: 800 }}>
                                        ({record.achievedPickemPoints - record.neededPickemPoints > 0 ? "+" : ""}
                                        {record.achievedPickemPoints - record.neededPickemPoints})
                                    </span>
                                </i>
                                <br />
                            </div>
                        </div>

                        <HallOfFameSectionTitle text="All teams" />
                        {renderHallTeamRow(allCstTeams)}

                        <div style={{ display: "flex", gap: 56, marginTop: 36, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
                            {CST_GROUPS.map((group) => (
                                <div key={group} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                    <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                        Group {group}
                                    </h4>
                                    {renderHallTeamRow(groups[group])}
                                </div>
                            ))}
                        </div>

                        <HallOfFameSectionTitle text="Group Stage" marginTop="64px" />
                        {renderCstGroupStage(record.groupStage, { archived: true, record })}

                        <HallOfFameSectionTitle text="Playoffs" marginTop="64px" marginBottom="88px" />
                        <div>{renderArchivedPlayoffsBracket(record)}</div>

                        <HallOfFameSectionTitle text="Podium" marginTop="102px" />
                        {renderHallPodium(podium)}

                        <HallOfFameSectionTitle text="5th - 8th places" marginTop="82px" />
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {restPlaces.map((entry) => (
                                <div
                                    key={`${entry.place}-${entry.team?.id}`}
                                    style={{ display: "flex", alignItems: "center", flexDirection: "column", gap: 4, color: "#2e2f42" }}
                                >
                                    {hallTeamCircle(entry.team, 42)}
                                    <div>
                                        <span className={css.leaderboard_rank} style={{ color: placementColors[entry.place] || "#2e2f42" }}>
                                            {formatOrdinal(entry.place)}
                                        </span>{" "}
                                        <span style={{ fontWeight: "700" }}>Team {entry.team?.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {renderHallManagerModals()}
                    </div>
                </>
            );
        }

        if (record.event === "gcc") {
            const podium = record.results || {};
            const restPlaces = (record.places || []).filter((entry) => entry.place >= 5 && entry.place <= 12);
            const placementColors = {
                5: "#40e0d0",
                6: "#ba68c8",
                7: "#ff5e2d",
                8: "#81c784",
                9: "#f9e4a1",
                10: "#b0bec5",
            };

            return (
                <>
                    {hallHeader}
                    <div
                        className={css.page_container}
                        style={{ position: "relative", padding: "12vh 6vw 32px" }}
                    >
                        <button
                            type="button"
                            className={css.gamble_button}
                            onClick={() => setSelectedHallTournament(null)}
                            style={{ position: "fixed", top: "7%", left: "2%", zIndex: 21 }}
                        >
                            Back to Hall of Fame
                        </button>

                        <div className={css.second_header}>
                            <h2 style={{ fontStyle: "oblique", textTransform: "none" }} className={css.game_title}>
                                <span>
                                    Global Challenger Cup{" "}
                                    <span style={getTournamentNumberStyle(getTournamentTheme(record.number))}>
                                        #{record.number}
                                    </span>
                                </span>
                            </h2>
                            {renderHallChallengeInfo(record)}
                        </div>

                        <HallOfFameSectionTitle text="All teams" />
                        {renderHallTeamRow(record.teams?.length ? record.teams : record.league?.teams)}

                        <div style={{ display: "flex", gap: 56, marginTop: 36, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
                            {(record.league?.pots || []).map((pot, potIndex) => (
                                <div key={potIndex} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                    <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                        Pot {potIndex + 1}
                                    </h4>
                                    {renderHallTeamRow(pot)}
                                </div>
                            ))}
                        </div>

                        <HallOfFameSectionTitle text="League Phase" marginTop="64px" />
                        {renderGccLeague(record.league, { archived: true, record })}

                        <HallOfFameSectionTitle text="Knockout Stage" marginTop="64px" marginBottom="88px" />
                        <div>{renderArchivedPlayoffsBracket(record)}</div>

                        <HallOfFameSectionTitle text="Podium" marginTop="102px" />
                        {renderHallPodium(podium)}

                        <HallOfFameSectionTitle text="5th - 12th places" marginTop="82px" />
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {restPlaces.map((entry) => renderHallPlaceEntry(entry, placementColors))}
                        </div>

                        {renderHallManagerModals()}
                    </div>
                </>
            );
        }

        if (record.event === "gpl") {
            const qualifiers = record.qualifiers || {};
            const allGplTeams = [...(qualifiers.stage2 || []), ...(qualifiers.stage1 || [])];
            const stage2Lineup = record.stages?.stage2?.teams?.length
                ? record.stages.stage2.teams
                : (qualifiers.stage2 || []);
            const podium = record.results || {};
            const restPlaces = (record.places || []).filter((entry) => entry.place >= 5);
            const placementColors = {
                5: "#40e0d0",
                6: "#ba68c8",
                7: "#ff5e2d",
                8: "#81c784",
            };

            return (
                <>
                    {hallHeader}
                    <div
                        className={css.page_container}
                        style={{ position: "relative", padding: "12vh 6vw 32px" }}
                    >
                        <button
                            type="button"
                            className={css.gamble_button}
                            onClick={() => setSelectedHallTournament(null)}
                            style={{ position: "fixed", top: "7%", left: "2%", zIndex: 21 }}
                        >
                            Back to Hall of Fame
                        </button>

                        <div className={css.second_header}>
                            <h2 style={{ fontStyle: "oblique", textTransform: "none" }} className={css.game_title}>
                                <span>
                                    Global Pro League{" "}
                                    <span style={getTournamentNumberStyle(getTournamentTheme(record.number))}>
                                        #{record.number}
                                    </span>
                                </span>
                            </h2>
                            {renderHallChallengeInfo(record)}
                        </div>

                        <HallOfFameSectionTitle text="All teams" />
                        {renderHallTeamRow(allGplTeams)}

                        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", width: "max-content", marginTop: 36 }}>
                            <div>
                                <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                    Auto-qualifiers to Stage II
                                </h4>
                                {renderHallTeamRow(qualifiers.stage2)}
                            </div>
                            <div>
                                <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                    Qualifiers to Stage I
                                </h4>
                                {renderHallTeamRow(qualifiers.stage1)}
                            </div>
                        </div>

                        <HallOfFameSectionTitle text="Stage I" marginTop="64px" />
                        {renderSwissBracket(record.stages?.stage1, { archived: true, record })}

                        <HallOfFameSectionTitle text="All teams to Stage II" marginTop="64px" />
                        {renderHallTeamRow(stage2Lineup)}

                        <HallOfFameSectionTitle text="Stage II" marginTop="64px" />
                        {renderSwissBracket(record.stages?.stage2, { archived: true, record })}

                        <HallOfFameSectionTitle text="All teams to Playoffs" marginTop="64px" />
                        {renderHallTeamRow(qualifiers.playoffs)}

                        <HallOfFameSectionTitle text="Playoffs" marginTop="64px" marginBottom="88px" />
                        <div>{renderArchivedPlayoffsBracket(record)}</div>

                        <HallOfFameSectionTitle text="Podium" marginTop="102px" />
                        {renderHallPodium(podium, <GplTrophy size={GPL_PODIUM_TROPHY_SIZE} style={GPL_PODIUM_TROPHY_STYLE} />)}

                        <HallOfFameSectionTitle text="5th - 8th places" marginTop="82px" />
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {restPlaces.map((entry) => renderHallPlaceEntry(entry, placementColors))}
                        </div>

                        {renderHallManagerModals()}
                    </div>
                </>
            );
        }

        if (record.event === "pbs") {
            const teams = record.teams || [];
            const teamById = Object.fromEntries(teams.map((team) => [team.id, team]));
            const seedStatus = Object.fromEntries(teams.map((team) => [team.id, { seed: team.seed, bounty: team.bounty }]));
            const draws = record.draws || {};
            const podium = record.results || {};
            const restPlaces = (record.places || []).filter((entry) => entry.place >= 5);
            const placementColors = {
                5: "#40e0d0",
                6: "#ba68c8",
                7: "#ff5e2d",
                8: "#81c784",
            };
            const drawIds = (draw) => [...(draw?.high || []), ...(draw?.low || [])];

            const renderPbsTeamRow = (ids, status) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {ids.map((id) => (
                        <span key={id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            {hallTeamCircle(teamById[id], 38)}
                            <PbsTeamTags seed={status?.[id]?.seed} bounty={status?.[id]?.bounty ?? 0} size="small" />
                        </span>
                    ))}
                </div>
            );

            const allIds = teams.map((team) => team.id);
            const ro32Status = draws.ro32?.status ?? seedStatus;

            return (
                <>
                    {hallHeader}
                    <div
                        className={css.page_container}
                        style={{ position: "relative", padding: "12vh 6vw 32px" }}
                    >
                        <button
                            type="button"
                            className={css.gamble_button}
                            onClick={() => setSelectedHallTournament(null)}
                            style={{ position: "fixed", top: "7%", left: "2%", zIndex: 21 }}
                        >
                            Back to Hall of Fame
                        </button>

                        <div className={css.second_header}>
                            <h2 style={{ fontStyle: "oblique", textTransform: "none" }} className={css.game_title}>
                                <span>
                                    Premier Bounty Series{" "}
                                    <span style={getTournamentNumberStyle(getTournamentTheme(record.number))}>
                                        Season {record.number}
                                    </span>
                                </span>
                            </h2>
                            {renderHallChallengeInfo(record)}
                        </div>

                        <HallOfFameSectionTitle text="All teams" />
                        {renderHallTeamRow(teams)}

                        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", width: "max-content", marginTop: 36 }}>
                            <div>
                                <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                    High-Seed Pot
                                </h4>
                                {renderPbsTeamRow(draws.ro32?.high ?? allIds.slice(0, PBS_POT_SIZE), ro32Status)}
                            </div>
                            <div>
                                <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                    Low-Seed Pot
                                </h4>
                                {renderPbsTeamRow(draws.ro32?.low ?? allIds.slice(PBS_POT_SIZE), ro32Status)}
                            </div>
                        </div>

                        <HallOfFameSectionTitle text="Stage I" marginTop="64px" />
                        {renderArchivedPlayoffsBracket(record, "pbsStage1")}

                        <HallOfFameSectionTitle text="All teams to Stage II" marginTop="64px" />
                        {renderPbsTeamRow(drawIds(draws.ro16), draws.ro16?.status)}

                        <HallOfFameSectionTitle text="Stage II" marginTop="64px" />
                        {renderArchivedPlayoffsBracket(record, "pbsStage2")}

                        <HallOfFameSectionTitle text="All teams to Finals" marginTop="64px" />
                        {renderPbsTeamRow(drawIds(draws.qf), draws.qf?.status)}

                        <HallOfFameSectionTitle text="Finals" marginTop="64px" marginBottom="88px" />
                        <div>{renderArchivedPlayoffsBracket(record, "pbsFinals")}</div>

                        <HallOfFameSectionTitle text="Podium" marginTop="102px" />
                        {renderHallPodium(podium, <PbsTrophy size={PBS_PODIUM_TROPHY_SIZE} style={PBS_PODIUM_TROPHY_STYLE} />)}

                        <HallOfFameSectionTitle text="5th - 8th places" marginTop="82px" />
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {restPlaces.map((entry) => renderHallPlaceEntry(entry, placementColors))}
                        </div>

                        {renderHallManagerModals()}
                    </div>
                </>
            );
        }

        if (record.event === "ecl") {
            const podium = record.results || {};
            const restPlaces = (record.places || []).filter((entry) => entry.place >= 5);
            const placementColors = {
                5: "#40e0d0",
                6: "#ba68c8",
                7: "#ff5e2d",
                8: "#81c784",
                9: "#f9e4a1",
                10: "#b0bec5",
            };

            return (
                <>
                    {hallHeader}
                    <div
                        className={css.page_container}
                        style={{ position: "relative", padding: "12vh 6vw 32px" }}
                    >
                        <button
                            type="button"
                            className={css.gamble_button}
                            onClick={() => setSelectedHallTournament(null)}
                            style={{ position: "fixed", top: "7%", left: "2%", zIndex: 21 }}
                        >
                            Back to Hall of Fame
                        </button>

                        <div className={css.second_header}>
                            <h2 style={{ fontStyle: "oblique", textTransform: "none" }} className={css.game_title}>
                                <span>
                                    Elite Competition League{" "}
                                    <span style={getTournamentNumberStyle(getTournamentTheme(record.number))}>
                                        #{record.number}
                                    </span>
                                </span>
                            </h2>
                            {renderHallChallengeInfo(record)}
                        </div>

                        <HallOfFameSectionTitle text="All teams" />
                        {renderHallTeamRow(record.teams?.length ? record.teams : record.bracket?.teams)}

                        <HallOfFameSectionTitle text="Bracket" marginTop="64px" />
                        {renderEclBracket(record.bracket, { archived: true, record })}

                        <HallOfFameSectionTitle text="Podium" marginTop="102px" />
                        {renderHallPodium(podium)}

                        <HallOfFameSectionTitle text="5th - 16th places" marginTop="82px" />
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {restPlaces.map((entry) => renderHallPlaceEntry(entry, placementColors))}
                        </div>

                        {renderHallManagerModals()}
                    </div>
                </>
            );
        }

        if (record.event === "main" && record.type === PEM_BIG_TYPE_ID) {
            const groups = record.groups || {};
            const stage1Groups = record.stage1Groups || {};
            const qualifiedTeamIds = new Set(record.qualifiedTeamIds || []);
            const qualifierRecord = findPemCounterpartRecord(record, "qualifier");
            const stage2AutoTeams = (record.teams || []).slice(0, PEM_BIG_STAGE2_AUTO_COUNT);
            const stage1Teams = record.stage1Teams?.length
                ? record.stage1Teams
                : (record.teams || []).slice(PEM_BIG_STAGE2_AUTO_COUNT);
            const stage2Teams = Array.from({ length: 8 }).flatMap((_, i) =>
                PEM_MAIN_GROUPS.map((group) => groups[group]?.[i]).filter(Boolean)
            );
            const podium = record.results || {};
            const restPlaces = (record.places || []).filter((entry) => entry.place >= 5);
            const placementColors = { 5: "#40e0d0", 6: "#ba68c8" };

            const renderGroupRows = (groupTeams) => (
                <div style={{ display: "flex", gap: 64, marginTop: 24, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
                    {PEM_MAIN_GROUPS.map((group) => (
                        <div key={group} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                Group {group}
                            </h4>
                            {renderHallTeamRow(groupTeams[group], 38, qualifiedTeamIds)}
                        </div>
                    ))}
                </div>
            );

            return (
                <>
                    {hallHeader}
                    <div
                        className={css.page_container}
                        style={{ position: "relative", padding: "12vh 6vw 32px" }}
                    >
                        <button
                            type="button"
                            className={css.gamble_button}
                            onClick={() => setSelectedHallTournament(null)}
                            style={{ position: "fixed", top: "7%", left: "2%", zIndex: 21 }}
                        >
                            Back to Hall of Fame
                        </button>

                        <div className={css.second_header} data-sticky-anchor="hall-pem-big">
                            <h2 style={{ fontStyle: "oblique", textTransform: "none" }} className={css.game_title}>
                                <span>
                                    {getPemSeriesConfig(record.type).longLabel}{" "}
                                    <span style={getTournamentNumberStyle(getTournamentTheme(record.number))}>
                                        #{record.number}
                                    </span>
                                </span>
                            </h2>
                            {renderHallChallengeInfo(record)}
                        </div>

                        <HallOfFameSectionTitle text="Tournament start" />
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", width: "max-content" }}>
                            <div>
                                <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                    Auto-qualifiers to Stage II
                                </h4>
                                {renderHallTeamRow(stage2AutoTeams)}
                            </div>
                            <div>
                                <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                    Qualifiers to Stage I
                                </h4>
                                {renderHallTeamRow(stage1Teams, 38, qualifiedTeamIds)}
                            </div>
                        </div>

                        {qualifierRecord && (
                            <div style={{ marginTop: 20 }}>
                                {renderHallLink(
                                    "See how the glowing teams came through the Qualifier",
                                    () => openLinkedHallRecord(qualifierRecord, "qualifier-bracket")
                                )}
                            </div>
                        )}

                        {renderGroupRows(stage1Groups)}

                        <HallOfFameSectionTitle text="Stage I" marginTop="64px" />
                        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <StickyBelow
                                anchor='[data-sticky-anchor="hall-pem-big"]'
                                style={{ width: "calc(100% + 12vw)", margin: "0 -6vw", paddingTop: 6 }}
                            >
                                <QualifierGroupNav value={hallStage1Group} onChange={setHallStage1Group} />
                            </StickyBelow>
                            {renderPemStage1Bracket(record.stage1?.[hallStage1Group], { archived: true, record })}
                        </div>

                        <HallOfFameSectionTitle text="All teams to Stage II" marginTop="64px" />
                        {renderHallTeamRow(stage2Teams, 38, qualifiedTeamIds)}
                        {renderGroupRows(groups)}

                        <HallOfFameSectionTitle text="Stage II" marginTop="64px" />
                        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <StickyBelow
                                anchor='[data-sticky-anchor="hall-pem-big"]'
                                style={{ width: "calc(100% + 12vw)", margin: "0 -6vw", paddingTop: 6 }}
                            >
                                <QualifierGroupNav value={hallQualifierGroup} onChange={setHallQualifierGroup} />
                            </StickyBelow>
                            {renderPemGroupBracket(record.groupStage?.[hallQualifierGroup], { archived: true, record })}
                        </div>

                        <HallOfFameSectionTitle text="Playoffs" marginTop="64px" marginBottom="88px" />
                        <div>{renderArchivedPlayoffsBracket(record)}</div>

                        <HallOfFameSectionTitle text="Podium" marginTop="102px" />
                        {renderHallPodium(podium, <PemGoldTrophy style={{ marginLeft: "6px", marginTop: "-52px" }} />)}
                        <div style={{ display: "flex", gap: 96, justifyContent: "center", alignItems: "flex-start", marginTop: 48 }}>
                            {restPlaces.map((entry) => renderHallPlaceEntry(entry, placementColors))}
                        </div>

                        {renderHallManagerModals()}
                    </div>
                </>
            );
        }

        if (record.event === "main") {
            const groups = record.groups || {};
            const allMainEventTeams = record.teams?.length
                ? record.teams
                : Array.from({ length: 8 }).flatMap((_, i) =>
                    PEM_MAIN_GROUPS.map((group) => groups[group]?.[i]).filter(Boolean)
                );
            const podium = record.results || {};
            const restPlaces = (record.places || []).filter((entry) => entry.place >= 5);
            const placementColors = { 5: "#40e0d0", 6: "#ba68c8" };
            const qualifiedTeamIds = new Set(record.qualifiedTeamIds || []);
            const qualifierRecord = findPemCounterpartRecord(record, "qualifier");

            return (
                <>
                    {hallHeader}
                    <div
                        className={css.page_container}
                        style={{ position: "relative", padding: "12vh 6vw 32px" }}
                    >
                        <button
                            type="button"
                            className={css.gamble_button}
                            onClick={() => setSelectedHallTournament(null)}
                            style={{ position: "fixed", top: "7%", left: "2%", zIndex: 21 }}
                        >
                            Back to Hall of Fame
                        </button>

                        <div className={css.second_header} data-sticky-anchor="hall-pem-main">
                            <h2 style={{ fontStyle: "oblique", textTransform: "none" }} className={css.game_title}>
                                <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                                    <span>
                                        Pro Extreme Masters Small Tournament{" "}
                                        <span style={getTournamentNumberStyle(getTournamentTheme(record.number))}>
                                            #{record.number}
                                        </span>
                                    </span>
                                </span>
                            </h2>
                            {renderHallChallengeInfo(record)}
                        </div>

                        <HallOfFameSectionTitle text="All teams" />
                        {renderHallTeamRow(allMainEventTeams, 38, qualifiedTeamIds)}

                        {qualifierRecord && (
                            <div style={{ marginTop: 20 }}>
                                {renderHallLink(
                                    "See how the glowing teams came through the Qualifier",
                                    () => openLinkedHallRecord(qualifierRecord, "qualifier-bracket")
                                )}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 64, marginTop: qualifierRecord ? 24 : 36, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
                            {PEM_MAIN_GROUPS.map((group) => (
                                <div key={group} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                    <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                        Group {group}
                                    </h4>
                                    {renderHallTeamRow(groups[group])}
                                </div>
                            ))}
                        </div>

                        <HallOfFameSectionTitle text="Group Stage" marginTop="64px" />
                        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <StickyBelow
                                anchor='[data-sticky-anchor="hall-pem-main"]'
                                style={{ width: "calc(100% + 12vw)", margin: "0 -6vw", paddingTop: 6 }}
                            >
                                <QualifierGroupNav value={hallQualifierGroup} onChange={setHallQualifierGroup} />
                            </StickyBelow>
                            {renderPemGroupBracket(record.groupStage?.[hallQualifierGroup], { archived: true, record })}
                        </div>

                        <HallOfFameSectionTitle text="Playoffs" marginTop="64px" marginBottom="88px" />
                        <div>{renderArchivedPlayoffsBracket(record)}</div>

                        <HallOfFameSectionTitle text="Podium" marginTop="102px" />
                        {renderHallPodium(podium, <PemSilverTrophy style={{ marginLeft: "6px", marginTop: "-52px" }} />)}
                        <div style={{ display: "flex", gap: 96, justifyContent: "center", alignItems: "flex-start", marginTop: 48 }}>
                            {restPlaces.map((entry) => renderHallPlaceEntry(entry, placementColors))}
                        </div>

                        {renderHallManagerModals()}
                    </div>
                </>
            );
        }

        if (record.event === "qualifier") {
            const groups = record.groups || {};
            const allQualifierTeams = Array.from({ length: 16 }).flatMap((_, i) =>
                QUALIFIER_GROUPS.map((group) => groups[group]?.[i]).filter(Boolean)
            );
            const mainEventRecord = findPemCounterpartRecord(record, "main");

            return (
                <>
                    {hallHeader}
                    <div
                        className={css.page_container}
                        style={{ position: "relative", padding: "12vh 6vw 32px" }}
                    >
                        <button
                            type="button"
                            className={css.gamble_button}
                            onClick={() => setSelectedHallTournament(null)}
                            style={{ position: "fixed", top: "7%", left: "2%", zIndex: 21 }}
                        >
                            Back to Hall of Fame
                        </button>

                        <div className={css.second_header} data-sticky-anchor="hall-qualifier">
                            <h2 style={{ fontStyle: "oblique", textTransform: "none" }} className={css.game_title}>
                                {renderQualifierTitle({
                                    badgeHeight: 36,
                                    label: (
                                        <>
                                            {getPemSeriesConfig(record.type).longLabel}{" "}
                                            <span style={getTournamentNumberStyle(getTournamentTheme(record.number))}>
                                                #{record.number}
                                            </span>
                                        </>
                                    ),
                                })}
                            </h2>
                            <div
                                className={css.info_text}
                                style={{ textAlign: "center", width: "max-content" }}
                            >
                                <span
                                    style={{
                                        color: record.pickemWon ? "#2e7d32" : "#be3939",
                                        fontWeight: 800,
                                        fontSize: "28px",
                                        display: "inline-block",
                                        marginBottom: "12px",
                                        marginTop: "6px",
                                    }}
                                >
                                    {record.pickemWon ? "Challenge won" : "Challenge lost"}
                                </span>
                                <br />
                                <i>
                                    <span style={{ fontWeight: 900 }}>{record.neededPickemPoints}</span>{" "}
                                    needed Pick&apos;em points
                                </i>
                                <br />
                                <hr style={{ margin: "0", marginTop: "2px" }} className={css.divider} />
                                <i>
                                    <span style={{ color: record.pickemWon ? "#2e7d32" : "#be3939", fontWeight: 900 }}>
                                        {record.achievedPickemPoints}{" "}
                                    </span>
                                    achieved Pick&apos;em point{record.achievedPickemPoints !== 1 ? "s" : ""}
                                    <span style={{ color: record.pickemWon ? "#2e7d32" : "#be3939", fontWeight: 800 }}>
                                        ({record.achievedPickemPoints - record.neededPickemPoints > 0 ? "+" : ""}
                                        {record.achievedPickemPoints - record.neededPickemPoints})
                                    </span>
                                </i>
                                <br />
                            </div>
                        </div>

                        <HallOfFameSectionTitle text="All teams" />
                        {renderHallTeamRow(allQualifierTeams)}

                        <div style={{ display: "flex", gap: 64, marginTop: 36, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
                            {QUALIFIER_GROUPS.map((group) => (
                                <div key={group} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                    <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                        Group {group}
                                    </h4>
                                    {renderHallTeamRow(groups[group])}
                                </div>
                            ))}
                        </div>

                        <HallOfFameSectionTitle text="Qualifier bracket" marginTop="64px" sectionId="qualifier-bracket" />
                        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <StickyBelow
                                anchor='[data-sticky-anchor="hall-qualifier"]'
                                style={{ width: "calc(100% + 12vw)", margin: "0 -6vw", paddingTop: 6 }}
                            >
                                <QualifierGroupNav value={hallQualifierGroup} onChange={setHallQualifierGroup} />
                            </StickyBelow>
                            {renderQualifierBracket(record.qualifier?.[hallQualifierGroup], { archived: true, record })}
                        </div>

                        <HallOfFameSectionTitle text="Qualified teams" marginTop="64px" />
                        {renderQualifierWinnersBlock(record.results?.qualifiers)}
                        {mainEventRecord && (
                            <div style={{ marginTop: 40 }}>
                                {renderHallLink(
                                    "See how the qualified teams did in the main event",
                                    () => openLinkedHallRecord(mainEventRecord)
                                )}
                            </div>
                        )}

                        {renderHallManagerModals()}
                    </div>
                </>
            );
        }

        const stage2Lineup = record.stages?.stage2?.teams?.length
            ? record.stages.stage2.teams
            : (record.qualifiers?.stage2 || []).concat(record.qualifiers?.stage1 || []);
        const stage3Lineup = record.stages?.stage3?.teams || [];
        const podium = record.results || {};
        const restPlaces = (record.places || []).filter((entry) => entry.place >= 5);

        const qualificationOrder = [
            0, 8, 12, 4,
            6, 14, 10, 2,
            3, 11, 15, 7,
            5, 13, 9, 1
        ];

        const playoffsByQualificationOrder = qualificationOrder.map(
            (seed) => record.qualifiers.playoffs[seed]
        );

        const placementColors = {
            1: "gold",
            2: "silver",
            3: "#cd7f32",

            4: "#4fc3f7",
            5: "#40e0d0",
            6: "#ba68c8",
            7: "#ff5e2d",
            8: "#81c784",
            9: "#f9e4a1",
            10: "#b0bec5",
        };

        return (
            <>
                {hallHeader}
                <div
                    className={css.page_container}
                    style={{ position: "relative", padding: "12vh 6vw 32px" }}
                >
                    <button
                        type="button"
                        className={css.gamble_button}
                        onClick={() => setSelectedHallTournament(null)}
                        style={{ position: "fixed", top: "7%", left: "2%", zIndex: 21 }}
                    >
                        Back to Hall of Fame
                    </button>

                    <div className={css.second_header}>
                        <h2 style={{ fontStyle: "oblique" }} className={css.game_title}>
                            {renderTournamentLabelFor(record.type, record.number)}
                        </h2>
                        <div
                            className={css.info_text}
                            style={{
                                textAlign: "center",
                                width: "max-content",
                            }}
                        >
                            <span
                                style={{
                                    color: record.pickemWon ? "#2e7d32" : "#be3939",
                                    fontWeight: 800,
                                    fontSize: "28px",
                                    display: "inline-block",
                                    marginBottom: "12px",
                                    marginTop: "6px",
                                }}
                            >
                                {record.pickemWon ? "Challenge won" : "Challenge lost"}
                            </span>
                            <br />
                            <i>
                                <span style={{ fontWeight: 900 }}>
                                    {record.neededPickemPoints}
                                </span>{" "}
                                needed Pick&apos;em points
                            </i>
                            <br />
                            <hr
                                style={{
                                    margin: "0",
                                    marginTop: "2px",
                                }}
                                className={css.divider}
                            />
                            <i>
                                <span
                                    style={{
                                        color: record.pickemWon ? "#2e7d32" : "#be3939",
                                        fontWeight: 900,
                                    }}
                                >
                                    {record.achievedPickemPoints}{" "}
                                </span>
                                achieved Pick&apos;em point
                                {record.achievedPickemPoints !== 1 ? "s" : ""}
                                <span
                                    style={{
                                        color: record.pickemWon ? "#2e7d32" : "#be3939",
                                        fontWeight: 800,
                                    }}
                                >
                                    (
                                    {record.achievedPickemPoints -
                                        record.neededPickemPoints >
                                        0 &&
                                        record.achievedPickemPoints -
                                        record.neededPickemPoints !==
                                        0
                                        ? "+"
                                        : ""}
                                    {record.achievedPickemPoints -
                                        record.neededPickemPoints}
                                    )
                                </span>
                            </i>
                            <br />
                        </div>
                    </div>

                    <HallOfFameSectionTitle text="Tournament start" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", width: "max-content" }}>
                        <div>
                            <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                Qualifiers for Stage I
                            </h4>
                            {renderHallTeamRow(record.qualifiers?.stage1)}
                        </div>
                        <div>
                            <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                Auto-qualifiers for Stage II
                            </h4>
                            {renderHallTeamRow(record.qualifiers?.stage2)}
                        </div>
                        <div>
                            <h4 className={css.game_title} style={{ fontSize: 22, color: "#999" }}>
                                Auto-qualifiers for Stage III
                            </h4>
                            {renderHallTeamRow(record.qualifiers?.stage3)}
                        </div>
                    </div>

                    <HallOfFameSectionTitle text="All teams to Stage II" />
                    {renderHallTeamRow(stage2Lineup)}

                    <HallOfFameSectionTitle text="All teams to Stage III" />
                    {renderHallTeamRow(stage3Lineup)}

                    <HallOfFameSectionTitle text="All 16 playoffs qualifiers" />
                    {renderHallTeamRow(playoffsByQualificationOrder)}

                    {Object.keys(record.playoffs || {}).length > 0 && (
                        <>
                            <HallOfFameSectionTitle text="Playoffs" marginBottom="88px" />
                            <div>
                                {renderArchivedPlayoffsBracket(record)}
                            </div>
                        </>
                    )}

                    <HallOfFameSectionTitle text="Podium" marginTop="102px" />
                    {renderHallPodium(podium, <FaTrophy />)}

                    <HallOfFameSectionTitle text="5th - 16th places" marginTop="82px" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {restPlaces.map((entry) => (
                            <div
                                key={`${entry.place}-${entry.team?.id}`}
                                style={{ display: "flex", alignItems: "center", flexDirection: "column", gap: 4, color: "#2e2f42" }}
                            >
                                {hallTeamCircle(entry.team, 42)}
                                <div>
                                    <span className={css.leaderboard_rank} style={{ color: placementColors[entry.place] || "#2e2f42" }}>
                                        {formatOrdinal(entry.place)}
                                    </span>{" "}
                                    <span style={{ fontWeight: "700" }}>Team {entry.team?.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {renderHallManagerModals()}
                </div>
            </>
        );
    };

    return renderHallOfFame();
}
