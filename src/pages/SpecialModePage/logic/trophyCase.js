import { recordPlacingAwards } from "./placingsHistory.js";
import { hallRecordTime } from "./hallOfFameDb.js";

const KIND_OF_KEY = {
    wins: "trophy",
    tier1Wins: "trophy",
    pemBigWins: "trophy",
    gplWins: "trophy",
    pbsWins: "trophy",
    pgxWins: "trophy",
    essWins: "trophy",
    swcWins: "trophy",
    ewcWins: "trophy",
    tier15Wins: "medal",
    tier2Wins: "medal",
    seconds: "medal",
    thirds: "medal",
    tier1Seconds: "medal",
    tier1Thirds: "medal",
    tier15Seconds: "medal",
    tier15Thirds: "medal",
    tier2Seconds: "medal",
    tier2Thirds: "medal",
    ewcSeconds: "medal",
    ewcThirds: "medal",
};

export const trophyRoomCounts = (placings) =>
    Object.entries(KIND_OF_KEY).reduce(
        (counts, [key, kind]) => {
            counts[kind === "trophy" ? "trophies" : "medals"] += Number(placings?.[key]) || 0;
            return counts;
        },
        { trophies: 0, medals: 0 },
    );

export const hasTrophyRoom = (placings) => {
    const { trophies, medals } = trophyRoomCounts(placings);
    return trophies >= 3 || medals >= 5;
};

export const placingKind = (key) => KIND_OF_KEY[key] ?? "medal";

export const placingPlace = (key) => (/Seconds$|^seconds$/.test(key) ? 2 : /Thirds$|^thirds$/.test(key) ? 3 : 1);

export const recordTitle = (record) => {
    if (!record) return "";
    const city = record.event === "pgxGm" || record.event === "pgxIm" || record.event === "pgxCm" ? record.city : null;
    return `${record.type ?? "Official"}${city ? ` ${city}` : ""} #${record.number ?? "?"}`;
};

export const buildTrophyCases = (hallOfFame) => {
    const byTeam = {};
    [...(hallOfFame || [])]
        .sort((a, b) => hallRecordTime(a) - hallRecordTime(b) || (a.number ?? 0) - (b.number ?? 0))
        .forEach((record) => {
            recordPlacingAwards(record).forEach(({ teamId, key }) => {
                const team = (byTeam[teamId] ||= {});
                (team[key] ||= []).push(record);
            });
        });
    return byTeam;
};

export const trophyTip = (cases, teamId, key, index, fallback) => {
    const list = cases?.[String(teamId)]?.[key] ?? [];
    const record = list[index];
    return record ? recordTitle(record) : fallback;
};
