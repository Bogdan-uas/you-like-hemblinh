import { PemSilverTrophy, PemGoldTrophy, GplTrophy } from "../components/Trophies.jsx";
import { getPemSeriesConfig } from "./pemConfig.js";
import { TEAM_PLACINGS_LS_KEY } from "./storageKeys.js";
import { PEM_BIG_TYPE_ID, PEM_SMALL_TYPE_ID, GPL_TYPE_ID } from "./tournamentTypes.jsx";

export const EMPTY_TEAM_PLACINGS = {
    wins: 0,
    seconds: 0,
    thirds: 0,
    tier1Wins: 0,
    pemBigWins: 0,
    gplWins: 0,
    tier1Seconds: 0,
    tier1Thirds: 0,
    tier2Wins: 0,
    tier2Seconds: 0,
    tier2Thirds: 0,
};

export const totalSecondPlaces = (p) => (p?.seconds ?? 0) + (p?.tier1Seconds ?? 0) + (p?.tier2Seconds ?? 0);
export const totalThirdPlaces = (p) => (p?.thirds ?? 0) + (p?.tier1Thirds ?? 0) + (p?.tier2Thirds ?? 0);

export const buildDefaultTeamPlacings = (teams) => {
    const out = {};
    teams.forEach((t) => {
        out[t.id] = { ...EMPTY_TEAM_PLACINGS };
    });
    return out;
};

export const loadTeamPlacings = (teams) => {
    try {
        const raw = localStorage.getItem(TEAM_PLACINGS_LS_KEY);
        const base = buildDefaultTeamPlacings(teams);
        if (!raw) return base;

        const parsed = JSON.parse(raw);
        teams.forEach((t) => {
            const v = parsed?.[t.id];
            if (!v) return;
            base[t.id] = {
                wins: Math.max(0, Number(v.wins) || 0),
                seconds: Math.max(0, Number(v.seconds) || 0),
                thirds: Math.max(0, Number(v.thirds) || 0),
                tier1Wins: Math.max(0, Number(v.tier1Wins) || 0),
                pemBigWins: Math.max(0, Number(v.pemBigWins) || 0),
                gplWins: Math.max(0, Number(v.gplWins) || 0),
                tier1Seconds: Math.max(0, Number(v.tier1Seconds) || 0),
                tier1Thirds: Math.max(0, Number(v.tier1Thirds) || 0),
                tier2Wins: Math.max(0, Number(v.tier2Wins) || 0),
                tier2Seconds: Math.max(0, Number(v.tier2Seconds) || 0),
                tier2Thirds: Math.max(0, Number(v.tier2Thirds) || 0),
            };
        });
        return base;
    } catch {
        return buildDefaultTeamPlacings(teams);
    }
};

export const saveTeamPlacings = (placings) => {
    try {
        localStorage.setItem(TEAM_PLACINGS_LS_KEY, JSON.stringify(placings));
    } catch {
        console.error("Couldn't save tournament placings");
    }
};

const medalBreakdownText = (official, tier1, tier2) =>
    [
        official > 0 ? `${official} from Official${official === 1 ? "" : "s"}` : null,
        tier1 > 0 ? `${tier1} from Tier 1 tournament${tier1 === 1 ? "" : "s"}` : null,
        tier2 > 0 ? `${tier2} from Tier 2 tournament${tier2 === 1 ? "" : "s"}` : null,
    ].filter(Boolean).join(", ");

const medalBreakdownTitle = (official, tier1, tier2) =>
    tier1 > 0 || tier2 > 0 ? medalBreakdownText(official, tier1, tier2) : null;

const pemTrophyTitle = (type, n) => `${n} from ${getPemSeriesConfig(type).label}${n === 1 ? "" : "s"}`;

export const buildPlacingItems = (p, trophyIcon, tier1TrophyIcon = <PemSilverTrophy />) => {
    const items = [];
    if ((p?.wins ?? 0) > 0) items.push({ key: "wins", icon: trophyIcon, value: p.wins, title: null });
    if ((p?.pemBigWins ?? 0) > 0) {
        items.push({ key: "pemBigWins", icon: <PemGoldTrophy />, value: p.pemBigWins, title: pemTrophyTitle(PEM_BIG_TYPE_ID, p.pemBigWins) });
    }
    if ((p?.gplWins ?? 0) > 0) {
        items.push({ key: "gplWins", icon: <GplTrophy />, value: p.gplWins, title: `${p.gplWins} from ${GPL_TYPE_ID}${p.gplWins === 1 ? "" : "s"}` });
    }
    if ((p?.tier1Wins ?? 0) > 0) {
        items.push({ key: "tier1Wins", icon: tier1TrophyIcon, value: p.tier1Wins, title: pemTrophyTitle(PEM_SMALL_TYPE_ID, p.tier1Wins) });
    }
    if ((p?.tier2Wins ?? 0) > 0) {
        items.push({ key: "tier2Wins", icon: "🥇", value: p.tier2Wins, title: medalBreakdownText(0, 0, p.tier2Wins) });
    }
    const seconds = totalSecondPlaces(p);
    if (seconds > 0) {
        items.push({ key: "seconds", icon: "🥈", value: seconds, title: medalBreakdownTitle(p?.seconds ?? 0, p?.tier1Seconds ?? 0, p?.tier2Seconds ?? 0) });
    }
    const thirds = totalThirdPlaces(p);
    if (thirds > 0) {
        items.push({ key: "thirds", icon: "🥉", value: thirds, title: medalBreakdownTitle(p?.thirds ?? 0, p?.tier1Thirds ?? 0, p?.tier2Thirds ?? 0) });
    }
    return items;
};

export const trophyCountToDisplay = (n) => {
    if (!n) return null;
    if (n < 11) return { mode: "icons", n };
    return { mode: "count", n };
};
