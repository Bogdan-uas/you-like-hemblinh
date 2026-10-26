import css from "../SpecialModePage.module.css";
import { TeamCircle } from "../components/SwissMatch.jsx";
import { CST_GROUPS } from "../logic/cst.js";
import { PEM_QUALIFIED_HIGHLIGHT } from "../logic/pemConfig.js";
import { PEM_MAIN_GROUPS, buildPemMainEventTeams } from "../logic/pemSeries.jsx";
import { PEM_BIG_STAGE2_AUTO_COUNT, buildPemStage1Teams } from "../logic/pemStage1.jsx";
import { QUALIFIER_GROUPS, PLAY_IN_GROUP } from "../logic/qualifier.jsx";
import { FadeOut } from "../components/FadeOut.jsx";
import { PbsTeamTags } from "../components/PbsDraftShow.jsx";
import { PBS_POT_SIZE } from "../logic/pbsConfig.js";
import { splitPbsEntrants } from "../logic/pbs.jsx";
import { SKYLINES_FLOOR_COUNT, getSkylinesFloorName } from "../logic/skylines.jsx";
import { OFFICIAL_STAGE3_AUTO_COUNT, OFFICIAL_STAGE2_AUTO_COUNT, OFFICIAL_TEAM_COUNT } from "../logic/gameConstants.js";

const PBS_INTRO_STAGES = { ro16: "Stage II", qf: "Finals" };

export function TournamentIntros({ intro, phase, labels, tournament }) {
    const { showTournamentIntro, handleCloseTournamentIntro } = intro;
    const { isQualifierPhase, isCstPhase, isEclPhase, isPemMainPhase, isPemBigSeries, isGccPhase, isGplMainPhase, isPbsPhase, isSkylinesPhase, isPgxCmPhase, isPgxImPhase, isPgxMainPhase } = phase;
    const { renderQualifierTitle, renderCstTitle, eclLabel, pemLabel, gccLabel, pbsLabel, skylinesLabel, pgxCmLabel, pgxImLabel, pgxGmLabel, tournamentLabel } = labels;
    const { ecl, pemSeries, leaderboard, qualifier, teamRatings, cst, pemStage1, pemMain, gcc, gplSeries, pbs, pbsTeamsById, skylines, pgxSeries, pgxCm, pgxIm } = tournament;
    const isPgxPhase = isPgxCmPhase || isPgxImPhase || isPgxMainPhase;

    const renderTeamsIntro = (titleNode, sections) => (
        <div className={css.intro_overlay}>
            <div className={css.intro_content}>
                <div className={css.fade_in}>
                    <div
                        className={css.game_title}
                        style={{ fontSize: "44px", fontStyle: "italic", marginBottom: 18, textTransform: "none" }}
                    >
                        {titleNode}
                    </div>
                </div>

                {sections.map((section, i) => (
                    <div
                        key={section.title}
                        className={[css.fade_in, css.fade_in_delay, css.fade_in_delay_more][Math.min(i, 2)]}
                        style={{ marginTop: i ? 22 : 0, width: "100%" }}
                    >
                        <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                            {section.title}
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: section.width ?? "60%", margin: "0 auto" }}>
                            {(section.teams || []).map((t) => (
                                <TeamCircle
                                    key={t.id}
                                    team={t}
                                    showRating
                                    ratingValue={teamRatings[t.id] ?? 0}
                                    specialStyle={{ width: "48px", height: "48px" }}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
                    <button className={css.gamble_button} onClick={handleCloseTournamentIntro} data-proceed-button>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );

    const pbsPlan = pbs?.draft?.plan ?? (pbs?.draft?.entrants ? splitPbsEntrants(pbs.draft.entrants) : null);
    const pbsStageTitle = PBS_INTRO_STAGES[pbs?.draft?.round] ?? null;
    const pbsStatus = pbsPlan?.status ?? pbs?.status ?? {};
    const pbsSeedIds = (pbs?.seeds || []).map((team) => team.id);
    const pbsHigh = pbsPlan?.high ?? pbsSeedIds.slice(0, PBS_POT_SIZE);
    const pbsLow = pbsPlan?.low ?? pbsSeedIds.slice(PBS_POT_SIZE);

    const renderPbsCircle = (teamId) => (
        <TeamCircle
            key={teamId}
            team={pbsTeamsById?.[teamId]}
            showRating
            ratingValue={teamRatings[teamId] ?? 0}
            specialStyle={{ width: "48px", height: "48px" }}
        />
    );


    return (
        <>
                <FadeOut variant="overlay">{showTournamentIntro && isQualifierPhase && (
                    <div className={css.intro_overlay}>
                        <div className={css.intro_content}>
                            <div className={css.fade_in}>
                                <div
                                    className={css.game_title}
                                    style={{
                                        fontSize: "44px",
                                        fontStyle: "italic",
                                        marginBottom: 18,
                                        textTransform: "none",
                                    }}
                                >
                                    {renderQualifierTitle({ badgeHeight: 46, gap: 10 })}
                                </div>

                                {[...(qualifier?.[PLAY_IN_GROUP] ? [PLAY_IN_GROUP] : []), ...QUALIFIER_GROUPS].map((group, groupIndex) => (
                                    <div
                                        key={group}
                                        className={groupIndex === 0 ? undefined : css.fade_in_delay}
                                        style={{ marginTop: groupIndex === 0 ? 0 : 22 }}
                                    >
                                        <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                            {group === PLAY_IN_GROUP ? "Play-in" : `Group ${group}`}
                                        </div>

                                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "60%", margin: "0 auto" }}>
                                            {(qualifier?.[group]?.teams || []).map((t, i) => (t ? (
                                                <TeamCircle
                                                    key={t.id}
                                                    team={t}
                                                    showRating
                                                    ratingValue={teamRatings[t.id] ?? 0}
                                                    specialStyle={{ width: "48px", height: "48px" }}
                                                />
                                            ) : (
                                                <div key={`play-in-${i}`} className={css.placeholder_circle} style={{ width: 48, height: 48, fontSize: 20 }} title="Winner of the Play-in">?</div>
                                            )))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={css.fade_in_delay_more} style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro} data-proceed-button>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && isCstPhase && (
                    <div className={css.intro_overlay}>
                        <div className={css.intro_content}>
                            <div className={css.fade_in}>
                                <div
                                    className={css.game_title}
                                    style={{
                                        fontSize: "44px",
                                        fontStyle: "italic",
                                        marginBottom: 18,
                                        textTransform: "none",
                                    }}
                                >
                                    {renderCstTitle(null)}
                                </div>
                            </div>

                            <div className={css.fade_in_delay} style={{ flexDirection: "row", alignItems: "flex-start", gap: 56, justifyContent: "center" }}>
                                {CST_GROUPS.map((group) => (
                                    <div key={group} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                            Group {group}
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "row", gap: 10, alignItems: "center" }}>
                                            {(cst?.[group]?.teams || []).map((t) => (
                                                <TeamCircle
                                                    key={t.id}
                                                    team={t}
                                                    showRating
                                                    ratingValue={teamRatings[t.id] ?? 0}
                                                    specialStyle={{ width: "48px", height: "48px" }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={css.fade_in_delay_more} style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro} data-proceed-button>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && isEclPhase && (
                    <div className={css.intro_overlay}>
                        <div className={css.intro_content}>
                            <div className={css.fade_in}>
                                <div
                                    className={css.game_title}
                                    style={{
                                        fontSize: "44px",
                                        fontStyle: "italic",
                                        marginBottom: 18,
                                        textTransform: "none",
                                    }}
                                >
                                    {eclLabel}
                                </div>
                            </div>

                            <div className={css.fade_in_delay}>
                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    All teams
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "60%", margin: "0 auto" }}>
                                    {(ecl?.teams || []).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{ width: "48px", height: "48px" }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={css.fade_in_delay_more} style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro} data-proceed-button>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && isPemMainPhase && isPemBigSeries && (
                    <div className={css.intro_overlay}>
                        <div className={css.intro_content}>
                            <div className={css.fade_in}>
                                <div
                                    className={css.game_title}
                                    style={{
                                        fontSize: "44px",
                                        fontStyle: "italic",
                                        marginBottom: 18,
                                        textTransform: "none",
                                    }}
                                >
                                    {pemLabel}
                                </div>

                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    Auto-qualifiers to Stage II
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "36%", margin: "0 auto" }}>
                                    {(pemSeries?.seeds?.mainEvent || []).slice(0, PEM_BIG_STAGE2_AUTO_COUNT).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{ width: "48px", height: "48px" }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={css.fade_in_delay} style={{ marginTop: 22 }}>
                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    Qualifiers to Stage I
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", margin: "0 auto" }}>
                                    {buildPemStage1Teams(pemSeries).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{
                                                width: "48px",
                                                height: "48px",
                                                ...((pemSeries?.qualified || []).some((q) => q.id === t.id) ? PEM_QUALIFIED_HIGHLIGHT : {}),
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={css.fade_in_delay_more} style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 72, justifyContent: "center", marginTop: 22 }}>
                                {PEM_MAIN_GROUPS.map((group) => (
                                    <div key={group} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                            Group {group}
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "row", gap: 10, alignItems: "center" }}>
                                            {(pemStage1?.[group]?.teams || []).map((t) => (
                                                <TeamCircle
                                                    key={t.id}
                                                    team={t}
                                                    showRating
                                                    ratingValue={teamRatings[t.id] ?? 0}
                                                    specialStyle={{ width: "48px", height: "48px" }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={css.fade_in_delay_more} style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro} data-proceed-button>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && isPemMainPhase && !isPemBigSeries && (
                    <div className={css.intro_overlay}>
                        <div className={css.intro_content}>
                            <div className={css.fade_in}>
                                <div
                                    className={css.game_title}
                                    style={{
                                        fontSize: "44px",
                                        fontStyle: "italic",
                                        marginBottom: 18,
                                        textTransform: "none",
                                        display: "inline-flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <span>{pemLabel}</span>
                                </div>

                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    All teams
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "100%", margin: "0 auto" }}>
                                    {buildPemMainEventTeams(pemSeries).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{
                                                width: "48px",
                                                height: "48px",
                                                ...((pemSeries?.qualified || []).some((q) => q.id === t.id) ? PEM_QUALIFIED_HIGHLIGHT : {}),
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={css.fade_in_delay} style={{ flexDirection: "row", alignItems: "flex-start", gap: 72, justifyContent: "center", marginTop: 22 }}>
                                {PEM_MAIN_GROUPS.map((group) => (
                                    <div key={group} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                            Group {group}
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "row", gap: 10, alignItems: "center" }}>
                                            {(pemMain?.[group]?.teams || []).map((t) => (
                                                <TeamCircle
                                                    key={t.id}
                                                    team={t}
                                                    showRating
                                                    ratingValue={teamRatings[t.id] ?? 0}
                                                    specialStyle={{ width: "48px", height: "48px" }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={css.fade_in_delay_more} style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro} data-proceed-button>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && isGccPhase && (
                    <div className={css.intro_overlay}>
                        <div className={css.intro_content}>
                            <div className={css.fade_in}>
                                <div
                                    className={css.game_title}
                                    style={{
                                        fontSize: "44px",
                                        fontStyle: "italic",
                                        marginBottom: 18,
                                        textTransform: "none",
                                    }}
                                >
                                    {gccLabel}
                                </div>

                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    All teams
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "60%", margin: "0 auto" }}>
                                    {(gcc?.teams || []).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{ width: "48px", height: "48px" }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={css.fade_in_delay} style={{ flexDirection: "row", alignItems: "flex-start", gap: 56, justifyContent: "center", marginTop: 22 }}>
                                {(gcc?.pots || []).map((pot, potIndex) => (
                                    <div key={potIndex} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                            Pot {potIndex + 1}
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "row", gap: 10, alignItems: "center" }}>
                                            {pot.map((t) => (
                                                <TeamCircle
                                                    key={t.id}
                                                    team={t}
                                                    showRating
                                                    ratingValue={teamRatings[t.id] ?? 0}
                                                    specialStyle={{ width: "48px", height: "48px" }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={css.fade_in_delay_more} style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro} data-proceed-button>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && isGplMainPhase && (
                    <div className={css.intro_overlay}>
                        <div className={css.intro_content}>
                            <div className={css.fade_in}>
                                <div
                                    className={css.game_title}
                                    style={{
                                        fontSize: "44px",
                                        fontStyle: "italic",
                                        marginBottom: 18,
                                        textTransform: "none",
                                    }}
                                >
                                    {tournamentLabel}
                                </div>

                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    Auto-qualifiers to Stage II
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "36%", margin: "0 auto" }}>
                                    {(gplSeries?.seeds?.stage2Auto || []).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{ width: "48px", height: "48px" }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={css.fade_in_delay} style={{ marginTop: 22 }}>
                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    Qualifiers to Stage I
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "60%", margin: "0 auto" }}>
                                    {(gplSeries?.seeds?.stage1 || []).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{ width: "48px", height: "48px" }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={css.fade_in_delay_more} style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro} data-proceed-button>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && isPbsPhase && (
                    <div className={css.intro_overlay}>
                        <div className={css.intro_content}>
                            <div className={css.fade_in}>
                                <div
                                    className={css.game_title}
                                    style={{
                                        fontSize: "44px",
                                        fontStyle: "italic",
                                        marginBottom: 18,
                                        textTransform: "none",
                                    }}
                                >
                                    {pbsLabel}
                                    {pbsStageTitle ? <> | {pbsStageTitle}</> : null}
                                </div>

                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    {pbsStageTitle ? `All teams to ${pbsStageTitle}` : "All teams"}
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "100%", margin: "0 auto" }}>
                                    {[...pbsHigh, ...pbsLow].map(renderPbsCircle)}
                                </div>
                            </div>

                            <div className={`${css.fade_in_delay} ${css.pbs_intro_pots}`}>
                                {[["High-Seed Pot", pbsHigh], ["Low-Seed Pot", pbsLow]].map(([title, ids]) => (
                                    <div key={title} className={css.pbs_intro_pot}>
                                        <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                            {title}
                                        </div>
                                        <div className={css.pbs_intro_row}>
                                            {ids.map((teamId) => (
                                                <div key={teamId} className={css.pbs_intro_team}>
                                                    {renderPbsCircle(teamId)}
                                                    <PbsTeamTags seed={pbsStatus[teamId]?.seed} bounty={pbsStatus[teamId]?.bounty ?? 0} vertical />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={css.fade_in_delay_more} style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro} data-proceed-button>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && isPgxCmPhase && renderTeamsIntro(
                    renderQualifierTitle({ badgeHeight: 40, label: pgxCmLabel }),
                    [
                        { title: "Group Stage", teams: pgxCm?.directTeams, width: "40%" },
                        { title: "Play-ins", teams: pgxCm?.playIn?.teams, width: "70%" },
                    ]
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && isPgxImPhase && renderTeamsIntro(
                    pgxImLabel,
                    [
                        { title: "Main Bracket", teams: pgxIm?.direct, width: "50%" },
                        { title: "Entry Round", teams: pgxIm?.entry?.teams, width: "50%" },
                    ]
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && isPgxMainPhase && renderTeamsIntro(
                    pgxGmLabel,
                    [
                        { title: "Invited via the Leaderboard", teams: pgxSeries?.seeds?.gm, width: "50%" },
                        { title: "Winner of PGX International Masters", teams: pgxSeries?.imChampion ? [pgxSeries.imChampion] : [], width: "50%" },
                    ]
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && isSkylinesPhase && (
                    <div className={css.intro_overlay}>
                        <div className={css.intro_content}>
                            <div className={css.fade_in}>
                                <div
                                    className={css.game_title}
                                    style={{
                                        fontSize: "44px",
                                        fontStyle: "italic",
                                        marginBottom: 8,
                                        textTransform: "none",
                                    }}
                                >
                                    {skylinesLabel}
                                </div>
                                <div className={css.skylines_intro_caption}>
                                    Places {skylines?.firstPlace ?? 33}-{(skylines?.firstPlace ?? 33) + 31} of the Leaderboard move into the building. 1st on a Floor goes up 2 Floors, 2nd up 1, 3rd down 1 and 4th down 2.
                                </div>
                            </div>

                            <div className={`${css.fade_in_delay} ${css.skylines_intro_tower}`}>
                                {(skylines?.startFloors || []).map((teams, i) => (
                                    <div
                                        key={i}
                                        className={`${css.skylines_intro_floor} ${i === 0 ? css.skylines_intro_floor_penthouse : ""} ${i === SKYLINES_FLOOR_COUNT - 1 ? css.skylines_intro_floor_ground : ""}`}
                                    >
                                        <span className={css.skylines_intro_floor_name}>{getSkylinesFloorName(i + 1)}</span>
                                        <div className={css.skylines_intro_floor_teams}>
                                            {teams.map((t) => (
                                                <TeamCircle
                                                    key={t.id}
                                                    team={t}
                                                    showRating
                                                    ratingValue={teamRatings[t.id] ?? 0}
                                                    specialStyle={{ width: "40px", height: "40px" }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={css.fade_in_delay_more} style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro} data-proceed-button>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && !isQualifierPhase && !isCstPhase && !isEclPhase && !isPemMainPhase && !isGccPhase && !isGplMainPhase && !isPbsPhase && !isSkylinesPhase && !isPgxPhase && (
                    <div className={css.intro_overlay}>
                        <div className={css.intro_content}>
                            <div className={css.fade_in}>
                                <div
                                    className={css.game_title}
                                    style={{
                                        fontSize: "44px",
                                        fontStyle: "italic",
                                        marginBottom: 18,
                                    }}
                                >
                                    {tournamentLabel}
                                </div>

                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    Auto-qualifiers for Stage III
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "50%", margin: "0 auto" }}>
                                    {leaderboard.sorted.slice(0, OFFICIAL_STAGE3_AUTO_COUNT).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{ width: "48px", height: "48px" }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={css.fade_in_delay} style={{ marginTop: 22, width: "100%" }}>
                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    Auto-qualifiers for Stage II
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "50%", margin: "0 auto" }}>
                                    {leaderboard.sorted.slice(OFFICIAL_STAGE3_AUTO_COUNT, OFFICIAL_STAGE3_AUTO_COUNT + OFFICIAL_STAGE2_AUTO_COUNT).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{ width: "48px", height: "48px" }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={css.fade_in_delay_more} style={{ marginTop: 22, width: "100%" }}>
                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    Qualifiers for Stage I
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "50%", margin: "0 auto" }}>
                                    {leaderboard.sorted.slice(OFFICIAL_STAGE3_AUTO_COUNT + OFFICIAL_STAGE2_AUTO_COUNT, OFFICIAL_TEAM_COUNT).map((t) => (
                                        <TeamCircle
                                            key={t.id}
                                            team={t}
                                            showRating
                                            ratingValue={teamRatings[t.id] ?? 0}
                                            specialStyle={{ width: "48px", height: "48px" }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro} data-proceed-button>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>
        </>
    );
}
