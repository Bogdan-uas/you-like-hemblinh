import { makeBracketMatch, getMatchWinnerTeam, getMatchLoserTeam, bracketMatchPoints } from "./brackets.js";
import { toBaseTeam } from "./teams.js";

export const SKYLINES_TYPE_ID = "Official Skylines";
export const SKYLINES_FLOOR_COUNT = 8;
export const SKYLINES_FLOOR_SIZE = 4;
export const SKYLINES_ROUND_COUNT = 4;
export const SKYLINES_FIRST_PLACE = 33;
export const SKYLINES_TEAM_COUNT = SKYLINES_FLOOR_COUNT * SKYLINES_FLOOR_SIZE;
export const SKYLINES_BLOCKS = [[0, 1], [2, 3], ["roof"]];

export const SKYLINES_FLOOR_STAGES = ["o", "w", "l"];
export const SKYLINES_ROOF_STAGES = ["sf", "thirdPlace", "gf"];
export const SKYLINES_ROOF = "roof";

export const SKYLINES_FLOOR_RATING_WEIGHTS = [1.05, 1.03, 1.01, 0.99, 0.97, 0.95, 0.93, 0.91];
export const SKYLINES_ROOF_RATING_WEIGHTS = { sf: 1.12, thirdPlace: 1.18, gf: 1.25 };
export const SKYLINES_ROOF_BEST_OF = { sf: 3, thirdPlace: 3, gf: 5 };
export const SKYLINES_BATTLE_STAKES = { o: 0.25, w: 0.4, l: 0.35, sf: 0.6, thirdPlace: 0.55, gf: 0.85 };
export const SKYLINES_BIG_STAGE_GAINS = { w: { winner: 1 }, sf: { winner: 2 }, thirdPlace: { winner: 2 }, gf: { winner: 4, loser: 3 } };

export const SKYLINES_PICKEM_ROUNDS = [
    { key: "sky_r1", label: "Round 1", total: 32 },
    { key: "sky_r2", label: "Round 2", total: 32 },
    { key: "sky_r3", label: "Round 3", total: 32 },
    { key: "sky_r4", label: "Round 4", total: 32 },
    { key: "sky_roof", label: "Rooftop Final", total: 4 },
];

const SKYLINES_MIN_NEEDED_PICKEM = 113;
const SKYLINES_MAX_NEEDED_PICKEM = 185;

export const getRandomSkylinesNeededPickemPoints = () =>
    Math.floor(Math.random() * (SKYLINES_MAX_NEEDED_PICKEM - SKYLINES_MIN_NEEDED_PICKEM + 1)) + SKYLINES_MIN_NEEDED_PICKEM;

export const getSkylinesFloorName = (floor) =>
    floor === 1 ? "Penthouse" : floor === SKYLINES_FLOOR_COUNT ? "Ground Floor" : `Floor ${floor}`;

export const getSkylinesFloorLongName = (floor) =>
    floor === 1 ? "Floor 1 · Penthouse" : floor === SKYLINES_FLOOR_COUNT ? `Floor ${floor} · Ground Floor` : `Floor ${floor}`;

export const getBestOfForSkylines = (stage, floor = null) => {
    if (SKYLINES_ROOF_STAGES.includes(stage)) return SKYLINES_ROOF_BEST_OF[stage];
    return floor != null && floor <= 2 ? 3 : 1;
};

export const skylinesStageLabel = (stage) => {
    switch (stage) {
        case "o": return "Opening Match";
        case "w": return "Winners' Match";
        case "l": return "Losers' Match";
        case "sf": return "Rooftop Semifinal";
        case "thirdPlace": return "Rooftop Third Place Decider";
        case "gf": return "Rooftop Grand Final";
        default: return "";
    }
};

const floorMatchId = (round, floor, stage, idx) => `sky-r${round + 1}-f${floor}-${stage}-${idx + 1}`;

const buildFloorRound = (round, floor, teams) => {
    const group = `R${round + 1}F${floor}`;
    const mk = (stage, idx, slotA = null, slotB = null) => ({
        ...makeBracketMatch(floorMatchId(round, floor, stage, idx), group, stage, { skyline: true, round, floor }),
        slotA,
        slotB,
    });
    const seeded = teams.map(toBaseTeam);
    return {
        floor,
        round,
        teams: seeded,
        o: [mk("o", 0, seeded[0], seeded[3]), mk("o", 1, seeded[1], seeded[2])],
        w: [mk("w", 0)],
        l: [mk("l", 0)],
    };
};

export const buildSkylinesRound = (round, floorsTeams) => ({
    round,
    floors: floorsTeams.map((teams, i) => buildFloorRound(round, i + 1, teams)),
});

export const splitSkylinesFloors = (teams) =>
    Array.from({ length: SKYLINES_FLOOR_COUNT }, (_, i) =>
        teams.slice(i * SKYLINES_FLOOR_SIZE, (i + 1) * SKYLINES_FLOOR_SIZE).map(toBaseTeam)
    );

export const buildSkylines = (teams, extra = {}) => {
    const floors = splitSkylinesFloors(teams);
    return {
        ...extra,
        teams: teams.map(toBaseTeam),
        startFloors: floors,
        rounds: [buildSkylinesRound(0, floors)],
        rooftop: null,
        block: 0,
    };
};

export const isSkylinesFloorFinished = (floorRound) =>
    !!floorRound && SKYLINES_FLOOR_STAGES.every((stage) => floorRound[stage].every((m) => m.played));

export const isSkylinesRoundFinished = (round) => !!round && round.floors.every(isSkylinesFloorFinished);

export const getSkylinesFloorStandings = (floorRound) => {
    if (!isSkylinesFloorFinished(floorRound)) return null;
    return [
        getMatchWinnerTeam(floorRound.w[0]),
        getMatchLoserTeam(floorRound.w[0]),
        getMatchWinnerTeam(floorRound.l[0]),
        getMatchLoserTeam(floorRound.l[0]),
    ];
};

export const SKYLINES_PLACE_MOVES = [2, 1, -1, -2];

const orderSkylinesSlots = (slots) =>
    [...slots].sort((a, b) =>
        (a.floor - SKYLINES_PLACE_MOVES[a.place]) - (b.floor - SKYLINES_PLACE_MOVES[b.place]) ||
        a.place - b.place ||
        a.floor - b.floor
    );

const SKYLINES_TARGET_FLOORS = (() => {
    const slots = Array.from({ length: SKYLINES_FLOOR_COUNT }, (_, i) =>
        SKYLINES_PLACE_MOVES.map((_, place) => ({ floor: i + 1, place }))
    ).flat();
    const targets = {};
    orderSkylinesSlots(slots).forEach((slot, index) => {
        targets[`${slot.floor}-${slot.place}`] = Math.floor(index / SKYLINES_FLOOR_SIZE) + 1;
    });
    return targets;
})();

export const getSkylinesTargetFloor = (floor, place) => SKYLINES_TARGET_FLOORS[`${floor}-${place}`] ?? floor;

export const getSkylinesNextFloors = (round) => {
    const slots = round.floors.flatMap((floorRound) =>
        getSkylinesFloorStandings(floorRound).map((team, place) => ({ team, floor: floorRound.floor, place }))
    );
    const ordered = orderSkylinesSlots(slots).map((slot) => toBaseTeam(slot.team));
    return Array.from({ length: SKYLINES_FLOOR_COUNT }, (_, i) =>
        ordered.slice(i * SKYLINES_FLOOR_SIZE, (i + 1) * SKYLINES_FLOOR_SIZE)
    );
};

export const getSkylinesMoves = (round) => {
    if (!isSkylinesRoundFinished(round)) return {};
    const moves = {};
    round.floors.forEach((floorRound) => {
        getSkylinesFloorStandings(floorRound).forEach((team, place) => {
            const delta = floorRound.floor - getSkylinesTargetFloor(floorRound.floor, place);
            if (delta !== 0) moves[team.id] = delta;
        });
    });
    return moves;
};

const makeRoofMatch = (stage, idx, slotA = null, slotB = null) => ({
    ...makeBracketMatch(`sky-roof-${stage}-${idx + 1}`, SKYLINES_ROOF, stage, { skyline: true, round: SKYLINES_ROOF }),
    slotA,
    slotB,
});

export const buildSkylinesRooftop = (teams) => {
    const seeded = teams.map(toBaseTeam);
    return {
        teams: seeded,
        sf: [makeRoofMatch("sf", 0, seeded[0], seeded[3]), makeRoofMatch("sf", 1, seeded[1], seeded[2])],
        thirdPlace: [makeRoofMatch("thirdPlace", 0)],
        gf: [makeRoofMatch("gf", 0)],
    };
};

export const advanceSkylinesFloor = (floorRound, stage, idx, winner, loser) => {
    if (stage !== "o") return floorRound;
    const slotKey = idx === 0 ? "slotA" : "slotB";
    return {
        ...floorRound,
        w: [{ ...floorRound.w[0], [slotKey]: toBaseTeam(winner) }],
        l: [{ ...floorRound.l[0], [slotKey]: toBaseTeam(loser) }],
    };
};

export const advanceSkylinesRooftop = (rooftop, stage, idx, winner, loser) => {
    if (stage !== "sf") return rooftop;
    const slotKey = idx === 0 ? "slotA" : "slotB";
    return {
        ...rooftop,
        gf: [{ ...rooftop.gf[0], [slotKey]: toBaseTeam(winner) }],
        thirdPlace: [{ ...rooftop.thirdPlace[0], [slotKey]: toBaseTeam(loser) }],
    };
};

const floorOrder = (round) => [...round.floors].reverse();

export const getSkylinesRoundMatches = (round) =>
    floorOrder(round).flatMap((floorRound) => SKYLINES_FLOOR_STAGES.flatMap((stage) => floorRound[stage]));

export const getSkylinesRooftopMatches = (rooftop) =>
    rooftop ? SKYLINES_ROOF_STAGES.flatMap((stage) => rooftop[stage]) : [];

export const getSkylinesMatches = (skylines) => [
    ...(skylines?.rounds || []).flatMap(getSkylinesRoundMatches),
    ...getSkylinesRooftopMatches(skylines?.rooftop),
];

export const findCurrentSkylinesMatch = (skylines, roundIndexes) => {
    if (!skylines) return null;
    for (const roundIndex of roundIndexes) {
        if (roundIndex === SKYLINES_ROOF) {
            const next = getSkylinesRooftopMatches(skylines.rooftop).find((m) => !m.played && m.slotA && m.slotB);
            if (next) return next;
            continue;
        }
        const round = skylines.rounds[roundIndex];
        if (!round) continue;
        const next = getSkylinesRoundMatches(round).find((m) => !m.played);
        if (next) return next.slotA && next.slotB ? next : null;
    }
    return null;
};

export const getSkylinesPickemKey = (match) =>
    match?.round === SKYLINES_ROOF ? "sky_roof" : `sky_r${(match?.round ?? 0) + 1}`;

export const locateSkylinesMatch = (skylines, matchId) => {
    if (!skylines || !matchId) return null;
    for (const round of skylines.rounds || []) {
        for (let f = 0; f < round.floors.length; f++) {
            for (const stage of SKYLINES_FLOOR_STAGES) {
                const idx = round.floors[f][stage].findIndex((m) => m.id === matchId);
                if (idx >= 0) return { roundIndex: round.round, floorIndex: f, floor: f + 1, stage, idx, match: round.floors[f][stage][idx] };
            }
        }
    }
    for (const stage of SKYLINES_ROOF_STAGES) {
        const idx = (skylines.rooftop?.[stage] || []).findIndex((m) => m.id === matchId);
        if (idx >= 0) return { roundIndex: SKYLINES_ROOF, floorIndex: null, floor: null, stage, idx, match: skylines.rooftop[stage][idx] };
    }
    return null;
};

export const updateSkylinesMatch = (skylines, matchId, update) => {
    const spot = locateSkylinesMatch(skylines, matchId);
    if (!spot) return skylines;
    const patch = (holder) => {
        const arr = [...holder[spot.stage]];
        arr[spot.idx] = update(arr[spot.idx]);
        return { ...holder, [spot.stage]: arr };
    };
    if (spot.roundIndex === SKYLINES_ROOF) return { ...skylines, rooftop: patch(skylines.rooftop) };
    return {
        ...skylines,
        rounds: skylines.rounds.map((round, r) => r !== spot.roundIndex ? round : {
            ...round,
            floors: round.floors.map((floorRound, f) => (f === spot.floorIndex ? patch(floorRound) : floorRound)),
        }),
    };
};

export const getSkylinesPickem = (skylines) => {
    const counts = { correct: 0 };
    SKYLINES_PICKEM_ROUNDS.forEach(({ key }) => { counts[key] = 0; });
    let total = 0;
    getSkylinesMatches(skylines).forEach((m) => {
        if (!m.played || !m.pickTeamId) return;
        const points = skylinesMatchPoints(m);
        total += points;
        if (m.winnerTeamId === m.pickTeamId) {
            counts[getSkylinesPickemKey(m)] += 1;
            counts.correct += points;
        }
    });
    return { total, counts };
};

export const findSkylinesMatch = (skylines, matchId) =>
    getSkylinesMatches(skylines).find((m) => m.id === matchId) ?? null;

export const isSkylinesBlockFinished = (skylines, block) =>
    SKYLINES_BLOCKS[block].every((roundIndex) =>
        roundIndex === SKYLINES_ROOF
            ? !!skylines?.rooftop && getSkylinesRooftopMatches(skylines.rooftop).every((m) => m.played)
            : isSkylinesRoundFinished(skylines?.rounds?.[roundIndex])
    );

export const getSkylinesFinalFloors = (skylines) => {
    const last = skylines?.rounds?.[SKYLINES_ROUND_COUNT - 1];
    return isSkylinesRoundFinished(last) ? getSkylinesNextFloors(last) : null;
};

export const getSkylinesPlaces = (skylines) => {
    const floors = getSkylinesFinalFloors(skylines);
    const roof = skylines?.rooftop;
    if (!floors || !roof?.gf?.[0]?.played) return [];
    const top = [
        getMatchWinnerTeam(roof.gf[0]),
        getMatchLoserTeam(roof.gf[0]),
        getMatchWinnerTeam(roof.thirdPlace[0]),
        getMatchLoserTeam(roof.thirdPlace[0]),
    ];
    return [...top, ...floors.slice(1).flat()];
};

export const skylinesMatchPoints = (match) =>
    bracketMatchPoints(match, getBestOfForSkylines(match?.stage, match?.floor));

const skylinesMoveText = (floor, place) => {
    const target = getSkylinesTargetFloor(floor, place);
    const delta = floor - target;
    const ordinal = ["1st", "2nd", "3rd", "4th"][place];
    if (delta === 0) return <>finishes {ordinal} and <b>stays on the {getSkylinesFloorName(floor)}</b></>;
    const floors = Math.abs(delta) === 1 ? "1 Floor" : `${Math.abs(delta)} Floors`;
    return <>finishes {ordinal} and takes the elevator <b>{delta > 0 ? "up" : "down"} {floors} to the {getSkylinesFloorName(target)}</b></>;
};

export const getSkylinesStakeTexts = (stage, floor) => {
    switch (stage) {
        case "o": return { winner: <>plays the <b>Winners&apos; Match</b></>, loser: <>plays the <b>Losers&apos; Match</b></> };
        case "w": return { winner: skylinesMoveText(floor, 0), loser: skylinesMoveText(floor, 1) };
        case "l": return { winner: skylinesMoveText(floor, 2), loser: skylinesMoveText(floor, 3) };
        case "sf": return { winner: <>plays the <b>Rooftop Grand Final</b></>, loser: "still has a chance of earning Third Place" };
        case "thirdPlace": return { winner: <>earns <b>Third Place</b>!</>, loser: "still had a good climb!" };
        case "gf": return { winner: <><b>WINS</b> the Official Skylines!</>, loser: "second place is still wonderful!" };
        default: return { winner: null, loser: null };
    }
};

export const skylinesSlotSource = (stage, idx, slotKey) => {
    const from = slotKey === "slotA" ? 0 : 1;
    if (stage === "w") return { stage: "o", idx: from, want: "winner" };
    if (stage === "l") return { stage: "o", idx: from, want: "loser" };
    if (stage === "gf") return { stage: "sf", idx: from, want: "winner" };
    if (stage === "thirdPlace") return { stage: "sf", idx: from, want: "loser" };
    return null;
};

export const getSkylinesNavEntries = (skylines) => [
    ...(skylines?.rounds || []).map((_, i) => ({ id: i, label: `Round ${i + 1}` })),
    ...(skylines?.rooftop ? [{ id: SKYLINES_ROOF, label: "Rooftop Final" }] : []),
];
