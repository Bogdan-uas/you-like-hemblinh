import css from "../SpecialModePage.module.css";
import { BracketConnectors } from "./BracketConnectors.jsx";
import { QUALIFIER_CONNECTOR_LINKS, PEM_GROUP_CONNECTOR_LINKS, PEM_PLAYOFFS_CONNECTOR_LINKS, GCC_KNOCKOUT_CONNECTOR_LINKS, PBS_FINALS_CONNECTOR_LINKS } from "../logic/bracketConnectors.js";
import { ECL_CONNECTOR_LINKS, ECL_COLUMN_TITLES } from "../logic/ecl.jsx";
import { PBS_ROUND_TITLES } from "../logic/pbsConfig.js";
import { PEM_GROUP_COLUMN_TITLES } from "../logic/pemSeries.jsx";
import { PEM_STAGE1_CONNECTOR_LINKS, PEM_STAGE1_STAGE_LABELS } from "../logic/pemStage1.jsx";
import { QUALIFIER_COLUMN_TITLES, isByeOpeningBracket } from "../logic/qualifier.jsx";
import { PGX_PLAYIN_CONNECTOR_LINKS } from "../logic/pgx.jsx";

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
