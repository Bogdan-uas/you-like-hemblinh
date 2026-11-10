import { swissNetTitle, PGX_SWISS_FORMAT } from "./swiss.js";
import { qualifierStageLabel, PLAY_IN_GROUP } from "./qualifier.jsx";
import { pemGroupStageLabel } from "./pemSeries.jsx";
import { eclStageLabel } from "./ecl.jsx";
import { skylinesStageLabel, SKYLINES_ROOF, getSkylinesFloorName } from "./skylines.jsx";
import { pgxStageLabel } from "./pgx.jsx";
import { essStageLabel } from "./ess.jsx";
import { pemStage1StageLabel } from "./pemStage1.jsx";
import { stageLabelPlayoffs } from "./playoffs.js";

export const matchTitleOf = (ctx) => {
    if (!ctx) return "";
    if (ctx.type === "swiss") return swissNetTitle(ctx.net);
    if (ctx.type === "qualifier") return qualifierStageLabel(ctx.stage);
    if (ctx.type === "pemGroup") return pemGroupStageLabel(ctx.stage);
    if (ctx.type === "ecl") return eclStageLabel(ctx.stage);
    if (ctx.type === "skyline") return skylinesStageLabel(ctx.stage);
    if (ctx.type === "pgxCm" || ctx.type === "pgxIm") return pgxStageLabel(ctx.type === "pgxIm" ? "im" : "cm", ctx.stage);
    if (ctx.type === "essLq" || ctx.type === "essCh" || ctx.type === "essFin") return essStageLabel(ctx.type, ctx.stage);
    if (ctx.type === "pemStage1") return pemStage1StageLabel(ctx.stage);
    if (ctx.type === "cstGroup") return `Group ${ctx.group}`;
    if (ctx.type === "gccLeague") return `Matchday ${ctx.matchday}`;
    return stageLabelPlayoffs(ctx.stage);
};

export const matchSmallLabelOf = (ctx, isPemBig = false) => {
    if (!ctx) return "";
    if (ctx.type === "playoffs") return "";
    if (ctx.type === "qualifier") return ctx.group === PLAY_IN_GROUP ? "Open Qualifier" : `Group ${ctx.group}`;
    if (ctx.type === "pemGroup") return isPemBig ? `Stage II | Group ${ctx.group}` : `Group ${ctx.group}`;
    if (ctx.type === "pemStage1") return `Stage I | Group ${ctx.group}`;
    if (ctx.type === "ecl") return "";
    if (ctx.type === "pgxCm") {
        return ctx.section === "playIn" ? "Play-ins" : ctx.section === "deciders" ? "Deciders" : `Group Stage | Group ${ctx.group}`;
    }
    if (ctx.type === "pgxIm") return ctx.section === "entry" ? "" : "Main Bracket";
    if (ctx.type === "essLq") return `Ladder ${ctx.group}`;
    if (ctx.type === "essCh") return ctx.section === "playoffs" ? "Playoffs" : `Group Stage | Group ${ctx.group}`;
    if (ctx.type === "essFin") return "";
    if (ctx.stageKey === "stage1" && ctx.format === PGX_SWISS_FORMAT) return "Swiss Stage";
    if (ctx.type === "skyline") {
        return ctx.round === SKYLINES_ROOF ? "Rooftop Final" : `Round ${ctx.round + 1} | ${getSkylinesFloorName(ctx.floor)}`;
    }
    if (ctx.type === "cstGroup") return "Group Stage";
    if (ctx.type === "gccLeague") return "League Phase";
    if (ctx.stageKey === "stage1") return "Stage I";
    if (ctx.stageKey === "stage2") return "Stage II";
    if (ctx.stageKey === "stage3") return "Stage III";
    return "";
};
