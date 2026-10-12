import {
    MULTIPLIER_MIN,
    MULTIPLIER_MAX,
    BASE_ROUNDS_TO_WIN,
    OT_ROUNDS_TO_WIN,
    BASE_MAX_ROUNDS,
    OT_MAX_BLOCK,
} from "./gameConstants.js";
import { splitRollEdge, computeRollBonus, otherSide } from "./statEffects.js";

const PREDICTION_TEXT_TIERS = [
    {
        max: 0.3,
        texts: [
            "Absolute 50/50",
            "A perfect coin flip",
            "Dead even, no edge at all",
            "Not a single point between them",
            "Pure toss-up",
        ],
    },
    {
        max: 1,
        texts: [
            "Razor-thin margin",
            "Basically a coin flip",
            "Too close to call",
            "Separated by a hair",
            "Almost perfectly balanced",
        ],
    },
    {
        max: 2.5,
        texts: [
            "{fav} by a whisker",
            "{fav} has the faintest edge",
            "Barely any daylight between them",
            "Only a sliver separates them",
            "Practically even, {fav} leaning",
        ],
    },
    {
        max: 4.5,
        texts: [
            "{fav} is a hair ahead",
            "Tiny edge for {fav}",
            "A whisper of advantage for {fav}",
            "{fav} nudges slightly ahead",
            "Very slight lean towards {fav}",
        ],
    },
    {
        max: 7,
        texts: [
            "{fav} has the smallest lead",
            "Slight advantage for {fav}",
            "{fav} edges it on paper",
            "A narrow edge to {fav}",
            "{fav} is marginally ahead",
        ],
    },
    {
        max: 10,
        texts: [
            "{fav} has a slight edge",
            "{fav} is a touch ahead",
            "Small but real edge for {fav}",
            "Barely separated, {fav} ahead",
            "{fav} holds a small advantage",
        ],
    },
    {
        max: 14,
        texts: [
            "{fav} has a modest edge",
            "{fav} is slightly favored",
            "Lean {fav}, but it's open",
            "{fav} has the upper hand, barely",
            "A clear but small edge for {fav}",
        ],
    },
    {
        max: 18,
        texts: [
            "{fav} is a modest favorite",
            "{fav} looks a step ahead",
            "The edge belongs to {fav}",
            "{fav} has a noticeable edge",
            "{dog} still has a real shot",
        ],
    },
    {
        max: 23,
        texts: [
            "{fav} has the advantage",
            "{fav} is the clear lean",
            "{fav} favored, but not safe",
            "{fav} holds the better odds",
            "Advantage {fav}, no doubt",
        ],
    },
    {
        max: 28,
        texts: [
            "{fav} has it in control",
            "{fav} is a solid favorite",
            "{fav} should have the upper hand",
            "{dog} needs a lucky break",
            "{fav} is comfortably ahead",
        ],
    },
    {
        max: 34,
        texts: [
            "{fav} is a strong favorite",
            "{fav} has a firm grip",
            "{fav} looks well in front",
            "{dog} is up against it",
            "Odds clearly favor {fav}",
        ],
    },
    {
        max: 40,
        texts: [
            "{fav} has a strong position",
            "{fav} is the heavy lean",
            "{dog} faces an uphill climb",
            "{fav} is firmly ahead",
            "Big advantage for {fav}",
        ],
    },
    {
        max: 47,
        texts: [
            "{fav} has a commanding position",
            "{fav} is a big favorite",
            "{dog} needs a real upset",
            "{fav} holds a big advantage",
            "The numbers back {fav} heavily",
        ],
    },
    {
        max: 54,
        texts: [
            "{fav} has a dominant position",
            "{fav} is the team to beat",
            "{dog} needs a big surprise",
            "{fav} looks dominant here",
            "{fav} is far ahead on paper",
        ],
    },
    {
        max: 61,
        texts: [
            "{fav} is the dominant side",
            "{dog} is a clear underdog",
            "{fav} has a huge edge",
            "It's {fav}'s match to lose",
            "{fav} is well clear",
        ],
    },
    {
        max: 68,
        texts: [
            "{fav} is a heavy favorite",
            "{dog} is in serious trouble",
            "{fav} should win without trouble",
            "{fav} is miles ahead",
            "{fav} is the clear pick",
        ],
    },
    {
        max: 74,
        texts: [
            "{fav} is overwhelming favorite",
            "{dog} needs a big upset",
            "Heavy edge for {fav}",
            "{dog} has little room for error",
            "{fav} should control this",
        ],
    },
    {
        max: 80,
        texts: [
            "{fav} is very likely a winner",
            "{dog} is a long shot here",
            "{fav} looks like the winner",
            "Everything points to {fav}",
            "{fav} has this firmly in hand",
        ],
    },
    {
        max: 85,
        texts: [
            "{fav} is a big, big favorite",
            "{dog} is a major long shot",
            "{fav} is expected to cruise",
            "{fav} should win comfortably",
            "A one-sided look, favoring {fav}",
        ],
    },
    {
        max: 89,
        texts: [
            "{fav} is a very safe pick",
            "{dog} faces very long odds",
            "{fav} is rarely beaten here",
            "A lopsided match towards {fav}",
            "{fav} is the near-certain pick",
        ],
    },
    {
        max: 92.5,
        texts: [
            "{fav} is near-absolute favorite",
            "{dog} needs a rare upset",
            "{fav} is almost untouchable here",
            "A shock is needed to stop {fav}",
            "{fav} is all but certain",
        ],
    },
    {
        max: 95,
        texts: [
            "{fav} is almost certain to win",
            "{dog} is up against huge odds",
            "Only a shock stops {fav}",
            "{fav} is a near-certainty",
            "{dog} would need a stunner",
        ],
    },
    {
        max: 97,
        texts: [
            "{fav} is virtually unbeatable",
            "{dog} needs something miraculous",
            "{fav} should win with ease",
            "A mismatch in {fav}'s favor",
            "{dog} is deep in upset territory",
        ],
    },
    {
        max: 98.5,
        texts: [
            "{fav} is practically a lock",
            "{dog} has almost no chance",
            "A near-total mismatch",
            "{fav} should steamroll them",
            "{dog} needs a miracle",
        ],
    },
    {
        max: 99.4,
        texts: [
            "{fav} is a virtual lock",
            "{dog} is hanging by a thread",
            "{dog} needs a true miracle",
            "A landslide expected for {fav}",
            "Practically guaranteed for {fav}",
        ],
    },
    {
        max: Infinity,
        texts: [
            "{fav} is as good as guaranteed",
            "{dog} has no realistic path",
            "Mission impossible for {dog}",
            "{fav} is a sure thing",
            "{dog} would need a cosmic upset",
        ],
    },
];

const hashString = (value) => {
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) {
        h ^= value.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
};

export const pickPredictionText = ({ diff, favorite, underdog, seed }) => {
    const found = PREDICTION_TEXT_TIERS.findIndex((tier) => diff < tier.max);
    const tierIndex = found === -1 ? PREDICTION_TEXT_TIERS.length - 1 : found;
    const { texts } = PREDICTION_TEXT_TIERS[tierIndex];
    const text = texts[hashString(`${seed}|${tierIndex}`) % texts.length];

    return text.split("{fav}").join(favorite ?? "").split("{dog}").join(underdog ?? "");
};

const PREDICTION_STREAK_CAP = 12;
const PREDICTION_MINI_SAMPLES = 240;
const PREDICTION_CACHE_MAX = 80;
const predictionCache = new Map();

const raceWinProbability = (q, target) => {
    if (q <= 0) return 0;
    if (q >= 1) return 1;

    let term = Math.pow(q, target);
    let sum = term;
    for (let j = 1; j < target; j++) {
        term = (term * (1 - q) * (target - 1 + j)) / j;
        sum += term;
    }
    return Math.min(1, sum);
};

const miniBeatProbability = (loA, widthA, loB, widthB) => {
    let sum = 0;
    for (let i = 0; i < PREDICTION_MINI_SAMPLES; i++) {
        const x = Math.max(
            MULTIPLIER_MIN,
            Math.min(MULTIPLIER_MAX, loA + (widthA * (i + 0.5)) / PREDICTION_MINI_SAMPLES)
        );
        if (x <= MULTIPLIER_MIN) continue;
        sum += Math.max(0, Math.min(1, (x - loB) / widthB));
    }
    return sum / PREDICTION_MINI_SAMPLES;
};

const predictRoundWin = (env, { streakSide, streakLen, lastLoser, armed, otBlock, target }) => {
    const key = `${streakSide ?? "-"}${streakLen}|${lastLoser ?? "-"}|${armed ?? "-"}|${otBlock}|${target}`;
    const cached = env.cache.get(key);
    if (cached !== undefined) return cached;

    const ctx = {
        liveStats: {
            left: { ...env.leftStats, momentum: streakSide === "left" ? streakLen : 0 },
            right: { ...env.rightStats, momentum: streakSide === "right" ? streakLen : 0 },
        },
        otContext: { active: otBlock > 0, depth: otBlock },
        bounceBackArmedSide: armed,
        lastRoundLoserSide: lastLoser,
        matchCtx: env.matchCtx,
        finisherActive: env.finisherActive,
    };

    const edge = splitRollEdge(
        computeRollBonus("left", MULTIPLIER_MIN, ctx),
        computeRollBonus("right", MULTIPLIER_MIN, ctx)
    );
    const width = MULTIPLIER_MAX - MULTIPLIER_MIN;
    const left = { lo: MULTIPLIER_MIN + edge.left, width };
    const right = { lo: MULTIPLIER_MIN + edge.right, width };

    const pLeft = miniBeatProbability(left.lo, left.width, right.lo, right.width);
    const pRight = miniBeatProbability(right.lo, right.width, left.lo, left.width);
    const q = pLeft + pRight > 0 ? pLeft / (pLeft + pRight) : 0.5;

    const result = raceWinProbability(q, target);
    env.cache.set(key, result);
    return result;
};

const predictSetWin = (env, prevLoser) => {
    const CAP = PREDICTION_STREAK_CAP;
    const NS = 1 + 2 * CAP;
    const W = BASE_ROUNDS_TO_WIN;
    const O = OT_ROUNDS_TO_WIN;

    const stateOf = (side, len) => (side === "left" ? len : CAP + len);
    const decode = (s) =>
        s === 0
            ? { side: null, len: 0 }
            : s <= CAP
                ? { side: "left", len: s }
                : { side: "right", len: s - CAP };
    const advance = (s, winner) => {
        const d = decode(s);
        return stateOf(winner, d.side === winner ? Math.min(CAP, d.len + 1) : 1);
    };

    let leftWins = 0;
    const overtimeStart = new Float64Array(NS);

    const regular = new Float64Array(W * W * NS);
    const at = (a, b, s) => (a * W + b) * NS + s;
    regular[at(0, 0, 0)] = 1;

    for (let total = 0; total < BASE_MAX_ROUNDS; total++) {
        const roundIndex = total + 1;
        const target = roundIndex === 1 || roundIndex === 13 ? 10 : 5;

        for (let a = Math.max(0, total - (W - 1)); a <= Math.min(W - 1, total); a++) {
            const b = total - a;

            for (let s = 0; s < NS; s++) {
                const mass = regular[at(a, b, s)];
                if (!mass) continue;

                const d = decode(s);
                const pLeft = predictRoundWin(env, {
                    streakSide: d.side,
                    streakLen: d.len,
                    lastLoser: d.side ? otherSide(d.side) : prevLoser,
                    armed: total === 0 ? prevLoser : null,
                    otBlock: 0,
                    target,
                });

                const leftState = advance(s, "left");
                if (a + 1 === W) leftWins += mass * pLeft;
                else if (a + 1 + b === BASE_MAX_ROUNDS) overtimeStart[leftState] += mass * pLeft;
                else regular[at(a + 1, b, leftState)] += mass * pLeft;

                const rightState = advance(s, "right");
                if (b + 1 === W) continue;
                if (a + b + 1 === BASE_MAX_ROUNDS) overtimeStart[rightState] += mass * (1 - pLeft);
                else regular[at(a, b + 1, rightState)] += mass * (1 - pLeft);
            }
        }
    }

    let carry = overtimeStart;
    for (let block = 1; block <= OT_MAX_BLOCK; block++) {
        const ot = new Float64Array(O * O * NS);
        const atOt = (a, b, s) => (a * O + b) * NS + s;
        for (let s = 0; s < NS; s++) ot[atOt(0, 0, s)] = carry[s];
        const nextCarry = new Float64Array(NS);

        for (let total = 0; total < 2 * (O - 1); total++) {
            const target = total === 0 ? 10 : 5;

            for (let a = Math.max(0, total - (O - 1)); a <= Math.min(O - 1, total); a++) {
                const b = total - a;

                for (let s = 0; s < NS; s++) {
                    const mass = ot[atOt(a, b, s)];
                    if (!mass) continue;

                    const d = decode(s);
                    const pLeft = predictRoundWin(env, {
                        streakSide: d.side,
                        streakLen: d.len,
                        lastLoser: d.side ? otherSide(d.side) : null,
                        armed: null,
                        otBlock: block,
                        target,
                    });

                    const leftState = advance(s, "left");
                    if (a + 1 === O) leftWins += mass * pLeft;
                    else if (a + 1 + b === 2 * (O - 1)) nextCarry[leftState] += mass * pLeft;
                    else ot[atOt(a + 1, b, leftState)] += mass * pLeft;

                    const rightState = advance(s, "right");
                    if (b + 1 === O) continue;
                    if (a + b + 1 === 2 * (O - 1)) nextCarry[rightState] += mass * (1 - pLeft);
                    else ot[atOt(a, b + 1, rightState)] += mass * (1 - pLeft);
                }
            }
        }
        carry = nextCarry;
    }

    let stillTied = 0;
    for (let s = 0; s < NS; s++) stillTied += carry[s];
    if (stillTied > 0) {
        const p = predictRoundWin(env, {
            streakSide: null,
            streakLen: 0,
            lastLoser: null,
            armed: null,
            otBlock: OT_MAX_BLOCK,
            target: 10,
        });
        const q = 1 - p;
        let majority = 0;
        for (let k = 4; k <= 6; k++) {
            majority += (factorialOf(6) / (factorialOf(k) * factorialOf(6 - k))) * Math.pow(p, k) * Math.pow(q, 6 - k);
        }
        majority += 0.5 * 20 * Math.pow(p, 3) * Math.pow(q, 3);
        leftWins += stillTied * majority;
    }

    return Math.min(1, Math.max(0, leftWins));
};

const factorialOf = (n) => (n <= 1 ? 1 : n * factorialOf(n - 1));

const predictSeriesWin = (env, setsToWin) => {
    const setProbability = {};
    const pSet = (prevLoser) => {
        const key = prevLoser ?? "none";
        if (setProbability[key] === undefined) setProbability[key] = predictSetWin(env, prevLoser);
        return setProbability[key];
    };

    const memo = new Map();
    const walk = (leftSets, rightSets, prevLoser) => {
        if (leftSets >= setsToWin) return 1;
        if (rightSets >= setsToWin) return 0;

        const key = `${leftSets}-${rightSets}-${prevLoser ?? "n"}`;
        if (memo.has(key)) return memo.get(key);

        const p = pSet(prevLoser);
        const value = p * walk(leftSets + 1, rightSets, "right") + (1 - p) * walk(leftSets, rightSets + 1, "left");
        memo.set(key, value);
        return value;
    };

    return walk(0, 0, null);
};

export const predictLeftSeriesWin = ({ seeded, matchCtx, setsToWin }) => {
    const cacheKey = JSON.stringify([seeded, matchCtx, setsToWin]);
    const cached = predictionCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const env = {
        leftStats: seeded.left,
        rightStats: seeded.right,
        matchCtx,
        finisherActive: setsToWin > 1,
        cache: new Map(),
    };

    const leftWinProbability = predictSeriesWin(env, setsToWin);

    if (predictionCache.size >= PREDICTION_CACHE_MAX) {
        predictionCache.delete(predictionCache.keys().next().value);
    }
    predictionCache.set(cacheKey, leftWinProbability);
    return leftWinProbability;
};
