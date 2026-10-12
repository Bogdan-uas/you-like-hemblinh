import css from "../SpecialModePage.module.css";
import { TeamCircle } from "../components/SwissMatch.jsx";
import { CST_GROUPS } from "../logic/cst.js";
import { PEM_QUALIFIED_HIGHLIGHT } from "../logic/pemConfig.js";
import { PEM_MAIN_GROUPS, buildPemMainEventTeams } from "../logic/pemSeries.jsx";
import { PEM_BIG_STAGE2_AUTO_COUNT, buildPemStage1Teams } from "../logic/pemStage1.jsx";
import { QUALIFIER_GROUPS } from "../logic/qualifier.jsx";
import { FadeOut } from "../components/FadeOut.jsx";

export function TournamentIntros({ intro, phase, labels, tournament }) {
    const { showTournamentIntro, handleCloseTournamentIntro } = intro;
    const { isQualifierPhase, isCstPhase, isEclPhase, isPemMainPhase, isPemBigSeries } = phase;
    const { renderQualifierTitle, renderCstTitle, eclLabel, pemLabel, tournamentLabel } = labels;
    const { ecl, pemSeries, leaderboard, qualifier, teamRatings, cst, pemStage1, pemMain } = tournament;


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

                                {QUALIFIER_GROUPS.map((group, groupIndex) => (
                                    <div
                                        key={group}
                                        className={groupIndex === 0 ? undefined : css.fade_in_delay}
                                        style={{ marginTop: groupIndex === 0 ? 0 : 22 }}
                                    >
                                        <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                            Group {group}
                                        </div>

                                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "60%", margin: "0 auto" }}>
                                            {(qualifier?.[group]?.teams || []).map((t) => (
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
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro}>
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
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro}>
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
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro}>
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
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro}>
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
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro}>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>
                <FadeOut variant="overlay">{showTournamentIntro && !isQualifierPhase && !isCstPhase && !isEclPhase && !isPemMainPhase && (
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
                                    {leaderboard.sorted.slice(0, 16).map((t) => (
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
                                    Auto-qualifiers for Stage II
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "50%", margin: "0 auto" }}>
                                    {leaderboard.sorted.slice(16, 32).map((t) => (
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

                            <div className={css.fade_in_delay_more} style={{ marginTop: 22 }}>
                                <div className={css.game_title} style={{ fontSize: "32px", marginBottom: 12 }}>
                                    Qualifiers for Stage I
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center", width: "50%", margin: "0 auto" }}>
                                    {leaderboard.sorted.slice(32, 64).map((t) => (
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
                                <button className={css.gamble_button} onClick={handleCloseTournamentIntro}>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}</FadeOut>
        </>
    );
}
