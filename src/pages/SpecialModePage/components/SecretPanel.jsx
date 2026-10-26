import { useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaXmark, FaEye } from "react-icons/fa6";
import css from "../SpecialModePage.module.css";
import { CHEAT_STRENGTHS, CHEAT_SCOPES, CHEAT_SCRIPTS, SET_WINNER_SCORES, TIE_SCORE, getLoserScoreOptions, describeCheat } from "../logic/secretCheats.js";

const keepFocus = (e) => e.preventDefault();

const Choice = ({ options, value, onChange, disabled = false }) => (
    <div className={`${css.settings_choice} ${css.secret_choice}`} role="radiogroup">
        {options.map((option) => (
            <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={value === option.value}
                className={`${css.settings_choice_option} ${value === option.value ? css.settings_choice_option_active : ""}`}
                disabled={disabled}
                data-no-press
                onMouseDown={keepFocus}
                onClick={() => onChange(option.value)}
            >
                {option.label}
                {option.hint ? <span className={css.secret_choice_hint}>{option.hint}</span> : null}
            </button>
        ))}
    </div>
);

const percent = (value) => `${Math.round(value * 1000) / 10}%`;

const signed = (value) => `${value > -0.005 ? "+" : "-"}${Math.abs(value).toFixed(2)}`;

export function SecretPanel({ secret, teams }) {
    const { activeCheat, draft, updateDraft, toggleTeamCheat, toggleScript, stopCheat, closePanel, info, peekedRoll, peekRoll, allowTie } = secret;
    const biasSide = activeCheat && !activeCheat.script ? activeCheat.side : null;
    const scoreSide = draft.scoreSide === TIE_SCORE && !allowTie ? "left" : draft.scoreSide ?? "left";
    const isTie = scoreSide === TIE_SCORE;
    const scoreActive = activeCheat?.script === "score";

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;
            e.stopPropagation();
            closePanel();
        };
        window.addEventListener("keydown", onKeyDown, true);
        return () => window.removeEventListener("keydown", onKeyDown, true);
    }, [closePanel]);

    const teamButton = (side, active, onClick) => (
        <button
            type="button"
            className={`${css.secret_team} ${active ? css.secret_team_active : ""}`}
            style={{ "--team-color": teams[side]?.color }}
            data-no-press
            onMouseDown={keepFocus}
            onClick={onClick}
        >
            <span className={css.secret_team_dot} />
            Team {teams[side]?.name}
        </button>
    );

    return (
        <motion.aside
            className={`${css.secret_panel} ${css.hidden_scrollbar}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            aria-label="Secret panel"
            data-lenis-prevent
        >
            <div className={css.secret_header}>
                <h3 className={css.secret_title}>Secret</h3>
                <button type="button" className={css.secret_close} onMouseDown={keepFocus} onClick={closePanel} aria-label="Close the Secret panel" data-no-press>
                    <FaXmark aria-hidden="true" />
                </button>
            </div>

            <p className={`${css.secret_status} ${activeCheat ? css.secret_status_on : ""}`}>
                <span className={css.secret_status_dot} />
                {activeCheat ? describeCheat(activeCheat, teams) : "No cheat is active"}
                {activeCheat ? (
                    <button type="button" className={css.secret_stop} onMouseDown={keepFocus} onClick={stopCheat} data-no-press>
                        Stop
                    </button>
                ) : null}
            </p>

            <section className={css.secret_section}>
                <h4 className={css.secret_section_title}>Outcome</h4>
                <p className={css.settings_hint}>Who should win the mini-rounds?</p>
                <div className={css.secret_teams}>
                    {teamButton("left", biasSide === "left", () => toggleTeamCheat("left"))}
                    {teamButton("right", biasSide === "right", () => toggleTeamCheat("right"))}
                </div>
                <p className={css.secret_label}>Strength</p>
                <Choice options={CHEAT_STRENGTHS} value={draft.strength} onChange={(strength) => updateDraft({ strength })} />
                <p className={css.secret_label}>Switches itself off after</p>
                <Choice options={CHEAT_SCOPES} value={draft.scope} onChange={(scope) => updateDraft({ scope })} />
            </section>

            <section className={css.secret_section}>
                <h4 className={css.secret_section_title}>Scripted moments</h4>
                <div className={css.secret_scripts}>
                    {CHEAT_SCRIPTS.filter((script) => script.value !== "score").map((script) => (
                        <button
                            key={script.value}
                            type="button"
                            className={`${css.secret_script} ${activeCheat?.script === script.value ? css.secret_script_active : ""}`}
                            data-no-press
                            onMouseDown={keepFocus}
                            onClick={() => toggleScript(script.value)}
                        >
                            <span aria-hidden="true">{script.icon}</span>
                            {script.label}
                        </button>
                    ))}
                </div>
                <p className={css.secret_label}>Set score</p>
                <Choice
                    options={[
                        { value: "left", label: teams.left?.name ?? "Left" },
                        { value: "right", label: teams.right?.name ?? "Right" },
                        ...(allowTie ? [{ value: TIE_SCORE, label: "Tie" }] : []),
                    ]}
                    value={scoreSide}
                    onChange={(side) => updateDraft({ scoreSide: side })}
                />
                <div className={css.secret_score}>
                    {isTie ? (
                        <span className={css.secret_score_text}>The match ends 15-15</span>
                    ) : (
                        <>
                            <span className={css.secret_score_text}>wins</span>
                            <select
                                className={css.secret_score_select}
                                value={draft.winnerRounds}
                                onChange={(e) => updateDraft({ winnerRounds: Number(e.target.value) })}
                            >
                                {SET_WINNER_SCORES.map((rounds) => (
                                    <option key={rounds} value={rounds}>{rounds}</option>
                                ))}
                            </select>
                            <span className={css.secret_score_text}>-</span>
                            <select
                                className={css.secret_score_select}
                                value={draft.loserRounds}
                                onChange={(e) => updateDraft({ loserRounds: Number(e.target.value) })}
                            >
                                {getLoserScoreOptions(draft.winnerRounds).map((rounds) => (
                                    <option key={rounds} value={rounds}>{rounds}</option>
                                ))}
                            </select>
                        </>
                    )}
                    <button
                        type="button"
                        className={`${css.secret_script} ${scoreActive ? css.secret_script_active : ""}`}
                        data-no-press
                        onMouseDown={keepFocus}
                        onClick={() => toggleScript("score", scoreSide)}
                    >
                        <span aria-hidden="true">🎯</span>
                        {scoreActive ? "Cancel" : "Go"}
                    </button>
                </div>
            </section>

            <section className={css.secret_section}>
                <h4 className={css.secret_section_title}>Info</h4>
                {info ? (
                    <dl className={css.secret_info}>
                        <dt>Extended Rounds</dt>
                        <dd>{info.extendedRounds.left}-{info.extendedRounds.right}</dd>
                        <dt>Mini-round chance</dt>
                        <dd>
                            <span style={{ color: teams.left?.color }}>{percent(info.mini.left)}</span>
                            {" : "}
                            <span style={{ color: teams.right?.color }}>{percent(info.mini.right)}</span>
                        </dd>
                        <dt>This round</dt>
                        <dd>
                            <span style={{ color: teams.left?.color }}>{percent(info.round)}</span>
                            {" : "}
                            <span style={{ color: teams.right?.color }}>{percent(1 - info.round)}</span>
                        </dd>
                        <dt>Stat edge</dt>
                        <dd>
                            <span style={{ color: teams.left?.color }}>{signed(info.mini.edgeLeft)}</span>
                            {" : "}
                            <span style={{ color: teams.right?.color }}>{signed(info.mini.edgeRight)}</span>
                        </dd>
                    </dl>
                ) : null}
                <button type="button" className={css.secret_peek} onMouseDown={keepFocus} onClick={peekRoll} data-no-press>
                    <FaEye aria-hidden="true" /> Peek at the next roll
                </button>
                {peekedRoll ? (
                    <p className={css.secret_peek_result}>
                        <span style={{ color: teams.left?.color }}>{peekedRoll.left.toFixed(2)}x</span>
                        {" vs "}
                        <span style={{ color: teams.right?.color }}>{peekedRoll.right.toFixed(2)}x</span>
                        <span className={css.settings_hint}>
                            {peekedRoll.left === peekedRoll.right
                                ? "Nobody would get it."
                                : `Team ${teams[peekedRoll.left > peekedRoll.right ? "left" : "right"]?.name} would get it${activeCheat ? ", unless the cheat changes it" : ""}.`}
                        </span>
                    </p>
                ) : null}
            </section>
        </motion.aside>
    );
}
