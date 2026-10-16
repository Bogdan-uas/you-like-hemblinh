import css from "../SpecialModePage.module.css";
import { BracketConnectors } from "./BracketConnectors.jsx";
import { QUALIFIER_CONNECTOR_LINKS, PEM_GROUP_CONNECTOR_LINKS, PEM_PLAYOFFS_CONNECTOR_LINKS, GCC_KNOCKOUT_CONNECTOR_LINKS, PBS_FINALS_CONNECTOR_LINKS } from "../logic/bracketConnectors.js";
import { ECL_CONNECTOR_LINKS, ECL_COLUMN_TITLES } from "../logic/ecl.jsx";
import { PBS_ROUND_TITLES } from "../logic/pbsConfig.js";
import { PEM_GROUP_COLUMN_TITLES } from "../logic/pemSeries.jsx";
import { PEM_STAGE1_CONNECTOR_LINKS, PEM_STAGE1_STAGE_LABELS } from "../logic/pemStage1.jsx";
import { QUALIFIER_COLUMN_TITLES } from "../logic/qualifier.jsx";

export const QualifierBracketLayout = ({ bracket, renderMatch }) => {
    const column = (stage, columnClass) => (
        <div key={stage} className={css.column_container} style={{ width: 170, transition: "none" }}>
            <h4 className={`${css.column_title} ${css.qualifier_column_title}`}>{QUALIFIER_COLUMN_TITLES[stage]}</h4>
            <div className={columnClass} style={{ width: "100%", transition: "none" }}>
                {(bracket?.[stage] || []).map((match, idx) => renderMatch(match, stage, idx))}
            </div>
        </div>
    );

    return (
        <div className={css.qualifier_bracket}>
            <BracketConnectors links={QUALIFIER_CONNECTOR_LINKS} />

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
