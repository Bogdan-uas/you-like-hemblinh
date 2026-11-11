import { EMPTY_TEAM_PLACINGS } from "./placings.jsx";
import { getPemSeriesConfig } from "./pemConfig.js";
import { hallRecordTime } from "./hallOfFameDb.js";

const TIER1_PODIUM = ["tier1Seconds", "tier1Thirds"];
const TIER15 = ["tier15Wins", "tier15Seconds", "tier15Thirds"];
const TIER2 = ["tier2Wins", "tier2Seconds", "tier2Thirds"];

const awardKeysOf = (record) => {
    const event = record?.event ?? null;
    if (!event) return ["wins", "seconds", "thirds"];
    if (["ecl", "skylines", "cst", "gcc"].includes(event)) return TIER2;
    if (event === "pgxIm") return TIER15;
    if (event === "ess") return ["essWins", ...TIER1_PODIUM];
    if (event === "swc") return ["swcWins", ...TIER1_PODIUM];
    if (event === "pbs") return ["pbsWins", ...TIER1_PODIUM];
    if (event === "gpl") return ["gplWins", ...TIER1_PODIUM];
    if (event === "pgxGm") return ["pgxWins", ...TIER1_PODIUM];
    if (event === "main") return [getPemSeriesConfig(record.type).winsKey, ...TIER1_PODIUM];
    return null;
};

export const recordPlacingAwards = (record) => {
    if (record?.event === "essCh") {
        return [
            ...(record.qualifiers || []).map((team) => ({ teamId: String(team?.id), key: TIER15[0] })),
            ...(record.bronze || []).map((team) => ({ teamId: String(team?.id), key: TIER15[2] })),
        ].filter((award) => award.teamId !== "undefined");
    }
    const keys = awardKeysOf(record);
    if (!keys) return [];
    const results = record.results || {};
    return [
        [results.winner, keys[0]],
        [results.runnerUp, keys[1]],
        [results.thirdPlace, keys[2]],
    ]
        .filter(([team]) => team?.id != null)
        .map(([team, key]) => ({ teamId: String(team.id), key }));
};

export const compactPlacings = (placings) =>
    Object.fromEntries(Object.entries(placings || {}).filter(([, value]) => Number(value) > 0));

export const placingsAtTime = (currentPlacings, hallOfFame, teamId, time) => {
    const id = String(teamId);
    const out = { ...EMPTY_TEAM_PLACINGS, ...(currentPlacings?.[id] ?? currentPlacings?.[teamId] ?? {}) };
    if (!Number.isFinite(time)) return out;
    (hallOfFame || []).forEach((record) => {
        if (hallRecordTime(record) < time) return;
        recordPlacingAwards(record).forEach((award) => {
            if (award.teamId === id) out[award.key] = Math.max(0, (out[award.key] ?? 0) - 1);
        });
    });
    return out;
};
