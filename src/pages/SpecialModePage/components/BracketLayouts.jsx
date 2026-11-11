import css from "../SpecialModePage.module.css";
import { BracketConnectors } from "./BracketConnectors.jsx";
import { QUALIFIER_CONNECTOR_LINKS, PEM_GROUP_CONNECTOR_LINKS, PEM_PLAYOFFS_CONNECTOR_LINKS, GCC_KNOCKOUT_CONNECTOR_LINKS, PBS_FINALS_CONNECTOR_LINKS } from "../logic/bracketConnectors.js";
import { ECL_CONNECTOR_LINKS, ECL_COLUMN_TITLES } from "../logic/ecl.jsx";
import { PBS_ROUND_TITLES } from "../logic/pbsConfig.js";
import { PEM_GROUP_COLUMN_TITLES } from "../logic/pemSeries.jsx";
import { PEM_STAGE1_CONNECTOR_LINKS, PEM_STAGE1_STAGE_LABELS } from "../logic/pemStage1.jsx";
import { QUALIFIER_COLUMN_TITLES, isByeOpeningBracket } from "../logic/qualifier.jsx";
import { PGX_PLAYIN_CONNECTOR_LINKS } from "../logic/pgx.jsx";
import { ESS_LADDERS, ESS_CH_PLAYOFFS_CONNECTOR_LINKS, ESS_FINAL_CONNECTOR_LINKS, ESS_FINAL_COLUMN_TITLES, essRungLabel } from "../logic/ess.jsx";
import { SWC_SC_CONNECTOR_LINKS, SWC_SC_COLUMN_TITLES, SWC_PLAYOFFS_CONNECTOR_LINKS, SWC_PLAYOFFS_COLUMN_TITLES } from "../logic/swc.jsx";

export const PlayInBracketLayout = ({ bracket, renderMatch }) => (
    <div className={css.play_in_bracket}>
        <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>Play-in</h4>
        <div className={css.play_in_matches}>
            {(bracket?.pi || []).map((match, idx) => (
                <div key={match.id} className={css.play_in_slot}>
                    {renderMatch(match, "pi", idx)}
                    {match.dest ? (
                        <span className={css.play_in_destination}>
                            Winner goes to <b>Group {match.dest.group}</b>
                        </span>
                    ) : null}
                </div>
            ))}
        </div>
    </div>
);

const isByeOpeningLink = (bracket, link) => {
    const [stage, idx] = link.from.split("-");
    return stage === "lr1" || (stage === "uo" && !!bracket.uo[Number(idx)]?.bye);
};

export const QualifierBracketLayout = ({ bracket, renderMatch }) => {
    const byeOpening = isByeOpeningBracket(bracket);
    const links = byeOpening
        ? QUALIFIER_CONNECTOR_LINKS.filter((link) => !isByeOpeningLink(bracket, link))
        : QUALIFIER_CONNECTOR_LINKS;

    const column = (stage, columnClass) => (
        <div key={stage} className={css.column_container} style={{ width: 170, transition: "none" }}>
            <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>{QUALIFIER_COLUMN_TITLES[stage]}</h4>
            <div className={columnClass} style={{ width: "100%", transition: "none" }}>
                {(bracket?.[stage] || []).map((match, idx) =>
                    byeOpening && stage === "uo" && match.bye ? null : renderMatch(match, stage, idx)
                )}
            </div>
        </div>
    );

    return (
        <div className={css.qualifier_bracket}>
            <BracketConnectors links={links} />

            {column("uo", byeOpening ? css.columnQuarters : css.columnRo16)}
            {column("uqf", css.columnQuarters)}
            <div />
            {column("usf", css.columnSemis)}
            <div />
            {column("uf", css.columnGrandFinal)}

            {byeOpening ? <div /> : column("lr1", css.columnRo16)}
            {column("lr2", css.columnRo16)}
            {column("lr3", css.columnQuarters)}
            {column("lsf", css.columnQuarters)}
            {column("lf", css.columnGrandFinal)}
            {column("cf", css.columnGrandFinal)}
        </div>
    );
};

export const PemGroupBracketLayout = ({ bracket, renderMatch }) => {
    const column = (stage, columnClass) => (
        <div key={stage} className={css.column_container} style={{ width: 170, transition: "none" }}>
            <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>{PEM_GROUP_COLUMN_TITLES[stage]}</h4>
            <div className={columnClass} style={{ width: "100%", transition: "none" }}>
                {(bracket?.[stage] || []).map((match, idx) => renderMatch(match, stage, idx))}
            </div>
        </div>
    );

    return (
        <div className={css.pem_group_bracket}>
            <BracketConnectors links={PEM_GROUP_CONNECTOR_LINKS} />

            {column("uo", css.columnRo16)}
            {column("usf", css.columnQuarters)}
            {column("uf", css.columnGrandFinal)}

            {column("lr1", css.columnPemLower)}
            {column("lsf", css.columnPemLower)}
            {column("lf", css.columnGrandFinal)}
        </div>
    );
};

export const PemStage1BracketLayout = ({ bracket, renderMatch }) => {
    const column = (stage, columnClass) => (
        <div key={stage} className={css.column_container} style={{ width: 170, transition: "none" }}>
            <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>{PEM_STAGE1_STAGE_LABELS[stage]}</h4>
            <div className={columnClass} style={{ width: "100%", transition: "none" }}>
                {(bracket?.[stage] || []).map((match, idx) => renderMatch(match, stage, idx))}
            </div>
        </div>
    );

    return (
        <div className={css.pem_stage1_bracket}>
            <BracketConnectors links={PEM_STAGE1_CONNECTOR_LINKS} />

            {column("uo", css.columnRo16)}
            {column("uf", css.columnGrandFinal)}

            {column("lr1", css.columnGrandFinal)}
            {column("lr2", css.columnGrandFinal)}
        </div>
    );
};

export const EclBracketLayout = ({ bracket, renderMatch }) => {
    const column = (stage, columnClass, style = null) => (
        <div key={stage} className={css.column_container} style={{ width: 170, transition: "none", ...style }}>
            <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>{ECL_COLUMN_TITLES[stage]}</h4>
            <div className={columnClass} style={{ width: "100%", transition: "none" }}>
                {(bracket?.[stage] || []).map((match, idx) => renderMatch(match, stage, idx))}
            </div>
        </div>
    );

    return (
        <div className={css.ecl_bracket}>
            <BracketConnectors links={ECL_CONNECTOR_LINKS} />

            {column("gf", css.columnGrandFinal, { gridColumn: 7, gridRow: "1 / span 2" })}

            {column("uo", css.columnRo16)}
            {column("uqf", css.columnQuarters)}
            <div />
            {column("usf", css.columnSemis)}
            <div />
            {column("uf", css.columnGrandFinal)}

            {column("lr1", css.columnRo16)}
            {column("lr2", css.columnRo16)}
            {column("lr3", css.columnQuarters)}
            {column("lsf", css.columnQuarters)}
            {column("lf", css.columnGrandFinal)}
            {column("cf", css.columnGrandFinal)}
        </div>
    );
};

export const GccKnockoutLayout = ({ bracket, renderMatch }) => {
    const column = (stage, title, columnClass) => (
        <div className={css.column_container}>
            <h4 className={css.column_title} style={{ whiteSpace: "nowrap" }}>{title}</h4>
            <div className={columnClass}>
                {(bracket?.[stage] || []).map((match, idx) => renderMatch(match, stage, idx))}
            </div>
        </div>
    );

    return (
        <div className={css.bracket_container} style={{ transition: "none", height: "max-content" }}>
            <div className={css.bracket_inner} style={{ position: "relative", transition: "none" }}>
                <BracketConnectors links={GCC_KNOCKOUT_CONNECTOR_LINKS} />

                {column("po", "Knockout Play-offs", css.columnRo16)}
                {column("qf", "Quarterfinals", css.columnRo16)}
                {column("sf", "Semifinals", css.columnQuarters)}

                <div className={css.column_container} style={{ position: "relative" }}>
                    <h4 className={css.column_title}>Grand Final</h4>
                    <div className={css.columnGrandFinal}>
                        {(bracket?.gf || []).map((match, idx) => renderMatch(match, "gf", idx))}
                    </div>
                    {bracket?.thirdPlace?.length ? (
                        <div
                            className={css.thirdPlace_container}
                            style={{ top: "calc(100% + 28px)", left: "50%", transform: "translateX(-50%)", marginTop: 0 }}
                        >
                            <h4 style={{ width: "17ch" }} className={css.column_title}>Third Place Decider</h4>
                            <div className={css.columnThirdPlace}>
                                {bracket.thirdPlace.map((match, idx) => renderMatch(match, "thirdPlace", idx))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export const PemPlayoffsLayout = ({ bracket, renderMatch }) => (
    <div className={css.bracket_container} style={{ transition: "none", height: "max-content" }}>
        <div className={css.bracket_inner} style={{ position: "relative", transition: "none" }}>
            <BracketConnectors links={PEM_PLAYOFFS_CONNECTOR_LINKS} />

            <div className={css.column_container}>
                <h4 className={css.column_title}>Quarterfinals</h4>
                <div className={css.columnQuarters}>
                    {(bracket?.qf || []).map((match, idx) => renderMatch(match, "qf", idx))}
                </div>
            </div>

            <div className={css.column_container}>
                <h4 className={css.column_title}>Semifinals</h4>
                <div className={css.columnQuarters}>
                    {(bracket?.sf || []).map((match, idx) => renderMatch(match, "sf", idx))}
                </div>
            </div>

            <div className={css.column_container} style={{ position: "relative" }}>
                <h4 className={css.column_title}>Grand Final</h4>
                <div className={css.columnGrandFinal}>
                    {(bracket?.gf || []).map((match, idx) => renderMatch(match, "gf", idx))}
                </div>
                {bracket?.thirdPlace?.length ? (
                    <div
                        className={css.thirdPlace_container}
                        style={{ top: "calc(100% + 28px)", left: "50%", transform: "translateX(-50%)", marginTop: 0 }}
                    >
                        <h4 style={{ width: "17ch" }} className={css.column_title}>Third Place Decider</h4>
                        <div className={css.columnThirdPlace}>
                            {bracket.thirdPlace.map((match, idx) => renderMatch(match, "thirdPlace", idx))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    </div>
);

export const PbsStageLayout = ({ bracket, view, renderMatch }) => {
    if (view !== "pbsFinals") {
        const round = view === "pbsStage2" ? "ro16" : "ro32";
        const matches = (bracket?.[round] || []).map((match, idx) => renderMatch(match, round, idx));
        const half = Math.ceil(matches.length / 2);

        return (
            <div className={css.bracket_container} style={{ transition: "none", height: "max-content" }}>
                <div className={css.column_container}>
                    <h4 className={css.column_title}>{PBS_ROUND_TITLES[round]}</h4>
                    {round === "ro16" ? (
                        <div className={css.pbs_ro16_columns}>
                            <div className={css.columnRo16}>{matches.slice(0, half)}</div>
                            <div className={css.columnRo16}>{matches.slice(half)}</div>
                        </div>
                    ) : (
                        <div className={css.columnRo16}>{matches}</div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={css.bracket_container} style={{ transition: "none", height: "max-content" }}>
            <div className={css.bracket_inner} style={{ position: "relative", transition: "none" }}>
                <BracketConnectors links={PBS_FINALS_CONNECTOR_LINKS} />

                <div className={css.column_container}>
                    <h4 className={css.column_title}>Quarterfinals</h4>
                    <div className={css.columnRo16}>
                        {(bracket?.qf || []).map((match, idx) => renderMatch(match, "qf", idx))}
                    </div>
                </div>

                <div className={css.column_container}>
                    <h4 className={css.column_title}>Semifinals</h4>
                    <div className={css.columnQuarters}>
                        {(bracket?.sf || []).map((match, idx) => renderMatch(match, "sf", idx))}
                    </div>
                </div>

                <div className={css.column_container} style={{ position: "relative" }}>
                    <h4 className={css.column_title}>Grand Final</h4>
                    <div className={css.columnGrandFinal}>
                        {(bracket?.gf || []).map((match, idx) => renderMatch(match, "gf", idx))}
                    </div>
                    {bracket?.thirdPlace?.length ? (
                        <div
                            className={css.thirdPlace_container}
                            style={{ top: "calc(100% + 28px)", left: "50%", transform: "translateX(-50%)", marginTop: 0 }}
                        >
                            <h4 style={{ width: "17ch" }} className={css.column_title}>Third Place Decider</h4>
                            <div className={css.columnThirdPlace}>
                                {bracket.thirdPlace.map((match, idx) => renderMatch(match, "thirdPlace", idx))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export const PgxPlayInLayout = ({ playIn, renderMatch }) => (
    <div className={css.pgx_playin_bracket}>
        <BracketConnectors links={PGX_PLAYIN_CONNECTOR_LINKS} />
        <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>Play-in Round 1</h4>
        <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>Play-in Round 2</h4>
        {(playIn?.pr2 || []).map((match, idx) => {
            const feeder = 7 - idx;
            return [renderMatch(playIn.pr1[feeder], "pr1", feeder), renderMatch(match, "pr2", idx)];
        })}
    </div>
);

export const PgxMatchesLayout = ({ title, stage, matches, renderMatch, caption }) => (
    <div className={css.play_in_bracket}>
        {title ? <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>{title}</h4> : null}
        <div className={css.play_in_matches}>
            {(matches || []).map((match, idx) => (
                <div
                    key={match.id}
                    className={css.play_in_slot}
                    style={matches.length % 2 === 1 && idx === matches.length - 1 ? { gridColumn: "1 / -1", justifySelf: "center", width: 170 } : undefined}
                >
                    {renderMatch(match, stage, idx)}
                    {caption ? <span className={css.play_in_destination}>{caption(match, idx)}</span> : null}
                </div>
            ))}
        </div>
    </div>
);

export const EssLaddersLayout = ({ lq, renderMatch, renderQualified }) => (
    <div className={css.ess_ladders}>
        {ESS_LADDERS.map((group) => {
            const ladder = lq?.ladders?.[group];
            return (
                <div key={group} className={css.ess_ladder}>
                    <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>Ladder {group}</h4>
                    <div className={css.ess_ladder_qualified}>{renderQualified(ladder, group)}</div>
                    <div className={css.ess_ladder_rails}>
                        {[...(ladder?.order || [])].reverse().map((stage) => (
                            <div key={stage} className={css.ess_ladder_rung}>
                                <span className={css.ess_ladder_rung_label}>{essRungLabel(stage)}</span>
                                {renderMatch(ladder, ladder[stage][0], stage, 0)}
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
    </div>
);

const ESS_CH_QUALIFIED_LINKS = [0, 1].map((idx) => ({ from: `sf-${idx}`, to: `q-${idx}` }));

export const EssChallengerPlayoffsLayout = ({ bracket, renderMatch, renderQualified }) => (
    <div className={css.ess_ch_playoffs}>
        <BracketConnectors links={[...ESS_CH_PLAYOFFS_CONNECTOR_LINKS, ...ESS_CH_QUALIFIED_LINKS]} />
        <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>Quarterfinals</h4>
        <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>Semifinals</h4>
        <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>Qualified</h4>
        <div className={css.columnRo16} style={{ width: "100%", transition: "none" }}>
            {(bracket?.qf || []).map((match, idx) => renderMatch(match, "qf", idx))}
        </div>
        <div className={css.columnQuarters} style={{ width: "100%", transition: "none" }}>
            {(bracket?.sf || []).map((match, idx) => (
                <div key={match.id} className={css.ess_sf_cell}>
                    {renderMatch(match, "sf", idx)}
                    <span className={css.ess_qualified_side}>
                        <span data-bracket-rect={`q-${idx}`} className={css.ess_qualified_anchor}>{renderQualified(match, idx)}</span>
                    </span>
                </div>
            ))}
        </div>
        <div />
    </div>
);

export const EssFinalsBracketLayout = ({ bracket, renderMatch }) => {
    const column = (stage, columnClass, style = null) => (
        <div key={stage} className={css.column_container} style={{ width: 170, transition: "none", ...style }}>
            <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>{ESS_FINAL_COLUMN_TITLES[stage]}</h4>
            <div className={columnClass} style={{ width: "100%", transition: "none" }}>
                {(bracket?.[stage] || []).map((match, idx) => renderMatch(match, stage, idx))}
            </div>
        </div>
    );

    return (
        <div className={css.ess_final_bracket}>
            <BracketConnectors links={ESS_FINAL_CONNECTOR_LINKS} />

            {column("gf", css.columnGrandFinal, { gridColumn: 5, gridRow: "1 / span 2" })}

            {column("uo", css.columnRo16)}
            {column("usf", css.columnQuarters)}
            <div />
            {column("uf", css.columnGrandFinal)}

            {column("lr1", css.columnPemLower)}
            {column("lsf", css.columnPemLower)}
            {column("lf", css.columnGrandFinal)}
            {column("cf", css.columnGrandFinal)}
        </div>
    );
};

const SWC_SC_RIGHT = { r16: 4, qf: 2, sf: 1 };
const SWC_SC_LINKS = SWC_SC_CONNECTOR_LINKS.map((link) => {
    const [stage, idx] = link.from.split("-");
    return { ...link, reverse: Number(idx) >= (SWC_SC_RIGHT[stage] ?? Infinity) };
});

export const SwcStormChaseLayout = ({ bracket, renderMatch, renderQualified }) => {
    const column = (stage, idxs, columnClass) => (
        <div key={`${stage}-${idxs[0]}`} className={css.column_container} style={{ width: 170, transition: "none" }}>
            <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>{SWC_SC_COLUMN_TITLES[stage]}</h4>
            <div className={columnClass} style={{ width: "100%", transition: "none" }}>
                {idxs.map((idx) => (bracket?.[stage]?.[idx] ? renderMatch(bracket[stage][idx], stage, idx) : null))}
            </div>
        </div>
    );
    const final = bracket?.f?.[0];

    return (
        <div className={css.swc_sc_bracket}>
            <BracketConnectors links={SWC_SC_LINKS} />
            {column("r16", [0, 1, 2, 3], css.columnRo16)}
            {column("qf", [0, 1], css.columnQuarters)}
            {column("sf", [0], css.columnGrandFinal)}
            <div className={css.column_container} style={{ width: 170, transition: "none" }}>
                <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>{SWC_SC_COLUMN_TITLES.f}</h4>
                <div className={css.columnGrandFinal} style={{ width: "100%", position: "relative", transition: "none" }}>
                    {final ? renderMatch(final, "f", 0) : null}
                    <div className={css.swc_sc_qualified}>{renderQualified(final)}</div>
                </div>
            </div>
            {column("sf", [1], css.columnGrandFinal)}
            {column("qf", [2, 3], css.columnQuarters)}
            {column("r16", [4, 5, 6, 7], css.columnRo16)}
        </div>
    );
};

export const SwcPlayoffsLayout = ({ bracket, renderMatch }) => (
    <div className={css.bracket_container} style={{ height: 700, transition: "none" }}>
        <div className={css.bracket_inner} style={{ position: "relative", transition: "none" }}>
            <BracketConnectors links={SWC_PLAYOFFS_CONNECTOR_LINKS} />
            <div className={css.column_container} style={{ width: 170, transition: "none" }}>
                <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>{SWC_PLAYOFFS_COLUMN_TITLES.sf}</h4>
                <div className={css.columnQuarters} style={{ width: "100%", transition: "none" }}>
                    {(bracket?.sf || []).map((match, idx) => renderMatch(match, "sf", idx))}
                </div>
            </div>
            <div className={css.column_container} style={{ width: 170, position: "relative", transition: "none" }}>
                <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>{SWC_PLAYOFFS_COLUMN_TITLES.gf}</h4>
                <div className={css.columnGrandFinal} style={{ width: "100%", transition: "none" }}>
                    {(bracket?.gf || []).map((match, idx) => renderMatch(match, "gf", idx))}
                </div>
                <div className={css.thirdPlace_container} style={{ top: "calc(100% + 28px)", left: "50%", transform: "translateX(-50%)", marginTop: 0, transition: "none" }}>
                    <h4 style={{ width: "17ch" }} className={`${css.column_title} ${css.qualifier_column_title}`}>{SWC_PLAYOFFS_COLUMN_TITLES.tp}</h4>
                    <div className={css.columnThirdPlace} style={{ width: 170, transition: "none" }}>
                        {(bracket?.tp || []).map((match, idx) => renderMatch(match, "tp", idx))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
