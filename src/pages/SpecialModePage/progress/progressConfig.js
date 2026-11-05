export const PROGRESS_LS_KEY = "specialMode_progress_v1";
export const PROGRESS_SNAPSHOT_LS_KEY = "specialMode_progressSnapshot_v1";

export const xpToNext = (level) => Math.round((120 * Math.pow(Math.min(level, 30), 1.15) * (level > 30 ? Math.pow(level / 30, 0.35) : 1)) / 10) * 10;

export const levelInfo = (totalXp) => {
    let level = 1;
    let rest = Math.max(0, Math.floor(totalXp || 0));
    let need = xpToNext(level);
    while (rest >= need) {
        rest -= need;
        level += 1;
        need = xpToNext(level);
    }
    return { level, into: rest, need, progress: need ? rest / need : 0 };
};

export const totalXpForLevel = (level) => {
    let total = 0;
    for (let l = 1; l < level; l++) total += xpToNext(l);
    return total;
};

export const BIG_ANNIVERSARY_LEVELS = [10, 25, 50, 100, 250, 500, 1000];

export const anniversaryRank = (level) => {
    const big = BIG_ANNIVERSARY_LEVELS.indexOf(level);
    if (big >= 0) return big + 2;
    if (level >= 5 && level < 100 && level % 5 === 0) return 1;
    if (level >= 100 && level < 250 && level % 10 === 0) return 1;
    if (level >= 250 && level < 500 && level % 25 === 0) return 1;
    if (level >= 500 && level < 1000 && level % 50 === 0) return 1;
    if (level >= 1000 && level % 100 === 0) return 1;
    return 0;
};

export const PROGRESS_VERSION = 4;

export const XP = {
    series: 15,
    extraSet: 8,
    pickemPoint: 5,
    upset: 40,
    longShot: 60,
    comeback: 25,
    sweep: 15,
    decider: 15,
    grandFinal: 30,
    overtime: 8,
    extendedRounds: 25,
    penalties: 40,
    bagel: 30,
    streak: 30,
    daily: 50,
    finish: { qualifier: 150, tier2: 225, tier15: 300, tier1: 450, official: 450 },
    pickemWon: { qualifier: 75, tier2: 110, tier15: 150, tier1: 225, official: 225 },
    marginPerPoint: 3,
    marginMax: 150,
    pickemStreak: 40,
    pickemStreakMax: 6,
    champion: 50,
    perfectRound: 60,
    flawless: 300,
    firstTime: 150,
    anniversary: 80,
};

export const UPSET_CHANCE = 0.35;
export const LONG_SHOT_CHANCE = 0.15;
export const FAVORITE_CHANCE = 0.65;
export const STREAK_STEP = 5;
export const PERFECT_ROUND_MIN = 4;
export const FLAWLESS_MIN = 6;
export const INSURANCE_MIN_BEST_OF = 3;

export const XP_SOURCE_GROUPS = [
    {
        title: "Every series",
        rows: [
            { source: "Series played", criteria: "Any series that is played to its end", xp: `+${XP.series}, +${XP.extraSet} for every set after the first one` },
            { source: "Pick'em points", criteria: "Every Pick'em point a series gives you (level benefits included)", xp: `+${XP.pickemPoint} per point` },
            { source: "Upset pick", criteria: `Your pick had ${Math.round(UPSET_CHANCE * 100)}% or less predicted and still won`, xp: `+${XP.upset}` },
            { source: "Long shot", criteria: `Your pick had ${Math.round(LONG_SHOT_CHANCE * 100)}% or less predicted and still won (on top of the upset)`, xp: `+${XP.longShot}` },
            { source: "Comeback", criteria: "Your pick won a Best of 3 or longer after losing the first set", xp: `+${XP.comeback}` },
            { source: "Sweep", criteria: "Your pick won a Best of 3 or longer without losing a set", xp: `+${XP.sweep}` },
            { source: "Down to the wire", criteria: "The series went all the way to its last possible set", xp: `+${XP.decider}` },
            { source: "Grand Final", criteria: "Any Grand Final played", xp: `+${XP.grandFinal}` },
            { source: "Overtime", criteria: "Every Overtime played in a set", xp: `+${XP.overtime}` },
            { source: "Extended Rounds", criteria: "A set goes into the Extended Rounds", xp: `+${XP.extendedRounds}` },
            { source: "Penalties", criteria: "A set goes into the Penalties", xp: `+${XP.penalties}` },
            { source: "Bagel", criteria: "A set ends 13-0", xp: `+${XP.bagel}` },
            { source: "Pick streak", criteria: `Every ${STREAK_STEP} correct picks in a row`, xp: `+${XP.streak}` },
            { source: "Daily warm-up", criteria: "The first series you play on a day", xp: `+${XP.daily}` },
        ],
    },
    {
        title: "Every tournament (each event of a series counts on its own)",
        rows: [
            { source: "Tournament finished", criteria: "Qualifier / Tier 2 / Tier 1.5 / Tier 1 and Official", xp: `+${XP.finish.qualifier} / ${XP.finish.tier2} / ${XP.finish.tier15} / ${XP.finish.tier1}` },
            { source: "Pick'em challenge won", criteria: "Half of the XP of finishing it", xp: `+${XP.pickemWon.qualifier} / ${XP.pickemWon.tier2} / ${XP.pickemWon.tier15} / ${XP.pickemWon.tier1}` },
            { source: "Pick'em margin", criteria: `Every Pick'em point above the needed ones (at most +${XP.marginMax})`, xp: `+${XP.marginPerPoint} per point` },
            { source: "Pick'em win streak", criteria: `Every Pick'em challenge won in a row from the 2nd one on (counts up to ${XP.pickemStreakMax} in a row)`, xp: `+${XP.pickemStreak} for every challenge of the streak` },
            { source: "Champion guessed", criteria: "Your pick won the last match of the tournament", xp: `+${XP.champion}` },
            { source: "Perfect round", criteria: `Every pick of a knockout round with ${PERFECT_ROUND_MIN} or more matches is correct`, xp: `+${XP.perfectRound}` },
            { source: "Flawless Pick'em", criteria: `Every single pick of a tournament with ${FLAWLESS_MIN} or more series is correct`, xp: `+${XP.flawless}` },
            { source: "First time", criteria: "The first time you finish a kind of event (every qualifier, tier 2 event and main event kind counts once)", xp: `+${XP.firstTime}` },
            { source: "Anniversary tournament", criteria: "A tournament with an anniversary number (#5, #10, #25, #50...)", xp: `+${XP.anniversary}` },
        ],
    },
    {
        title: "Level benefits",
        rows: [
            { source: "XP boost", criteria: "From Level 3 on, your level adds a share on top of all the XP of every series and tournament (not of achievements)", xp: "+2% up to +100%" },
            { source: "Achievement boost", criteria: "From Level 4 on, your level adds a share on top of the XP of every achievement step", xp: "+5% up to +75%" },
        ],
    },
];

export const DIFFICULTIES = {
    easy: { label: "Easy", xp: 50, color: "#4caf50" },
    medium: { label: "Medium", xp: 120, color: "#2f80ed" },
    hard: { label: "Hard", xp: 250, color: "#f2994a" },
    extreme: { label: "Extreme", xp: 500, color: "#e53935" },
    legendary: { label: "Legendary", xp: 1000, color: "#9b51e0" },
};

export const TIERS = [
    { key: "bronze", label: "Bronze", mult: 1, color: "#cd7f32", light: "#f0c08a", dark: "#7a4616" },
    { key: "silver", label: "Silver", mult: 2, color: "#b8bcc4", light: "#f4f6fa", dark: "#6c717b" },
    { key: "gold", label: "Gold", mult: 4, color: "#f5c400", light: "#fff3a6", dark: "#a67c00" },
    { key: "diamond", label: "Diamond", mult: 7, color: "#4fd8ff", light: "#d8f7ff", dark: "#1574a8" },
    { key: "platinum", label: "Platinum", mult: 12, color: "#c9b8ff", light: "#ffffff", dark: "#5b47b8" },
    { key: "master", label: "Master", mult: 20, color: "#ff5ec8", light: "#fff0fa", dark: "#9c1677" },
];

export const ONE_TIME_LOOK = { key: "unlocked", label: "Unlocked", color: "#2ecc71", light: "#c9f7dc", dark: "#127a43" };

export const ACHIEVEMENT_CATEGORIES = [
    { key: "tournaments", label: "Tournaments" },
    { key: "pickem", label: "Pick'em" },
    { key: "matches", label: "Matches" },
    { key: "stories", label: "Stories" },
    { key: "circuits", label: "Circuits" },
    { key: "milestones", label: "Milestones" },
    { key: "benefits", label: "Level Benefits" },
];

const s = (n, one, many = `${one}s`) => (n === 1 ? one : many);

export const ACHIEVEMENTS = [
    { id: "regular", name: "Tournament Regular", category: "tournaments", difficulty: "medium", stat: "mainFinished", tiers: [1, 3, 10, 25, 60], text: (n) => `Finish ${n} whole ${s(n, "tournament")} (an Official or the main event of a series)` },
    { id: "hallOfFamer", name: "Hall of Famer", category: "tournaments", difficulty: "easy", stat: "eventsFinished", tiers: [5, 20, 50, 120, 250], text: (n) => `Get ${n} records into the Hall of Fame (every event counts)` },
    { id: "globetrotter", name: "Globetrotter", category: "tournaments", difficulty: "hard", stat: "pgxCityCount", tiers: [1, 3, 6, 10, 15], text: (n) => `Finish PGX Grandmasters in ${n} different host ${s(n, "city", "cities")}` },
    { id: "anniversary", name: "Anniversary", category: "tournaments", difficulty: "hard", stat: "maxNumber", tiers: [5, 10, 20, 40, 75], text: (n) => `Finish a tournament with the number #${n} or higher` },
    { id: "roadWarrior", name: "Road Warrior", category: "tournaments", difficulty: "easy", since: 2, stat: "tier:qualifier", tiers: [2, 6, 15, 35, 70], text: (n) => `Finish ${n} ${s(n, "qualifier")} of any kind` },
    { id: "contender", name: "Contender", category: "tournaments", difficulty: "easy", since: 2, stat: "tier:tier2", tiers: [2, 6, 15, 35, 70], text: (n) => `Finish ${n} Tier 2 ${s(n, "event")}` },
    { id: "eliteCompany", name: "Elite Company", category: "tournaments", difficulty: "medium", since: 2, stat: "tier:tier1", tiers: [2, 6, 15, 35, 70], text: (n) => `Finish ${n} Tier 1 ${s(n, "event")}` },
    { id: "kingmaker", name: "Kingmaker", category: "tournaments", difficulty: "medium", since: 2, stat: "championsGuessed", tiers: [1, 5, 15, 40, 100], text: (n) => `Guess the champion of ${n} ${s(n, "event")}` },
    { id: "manyCrowns", name: "Many Crowns", category: "tournaments", difficulty: "hard", since: 2, stat: "championCount", tiers: [3, 6, 10, 15, 20], text: (n) => `Watch ${n} different teams win a whole tournament` },
    { id: "worldTour", name: "World Tour", category: "tournaments", difficulty: "extreme", stat: "mainTypeCount", once: 7, text: () => "Finish every kind of tournament: Official, PEM Small, PEM Big, Global Pro League, Premier Bounty Series, PGX Grandmasters and Elite Star Series" },
    { id: "handsOn", name: "Hands On", category: "tournaments", difficulty: "hard", flag: true, text: () => "Finish a tournament without using Simulate a single time" },
    { id: "partyTime", name: "Party Time", category: "tournaments", difficulty: "easy", since: 2, flag: true, text: () => "Finish a tournament with an anniversary number (#5, #10, #25...)" },
    { id: "longHaul", name: "Long Haul", category: "tournaments", difficulty: "medium", since: 2, flag: true, text: () => "Finish an event with 60 or more series" },

    { id: "oracle", name: "Oracle", category: "pickem", difficulty: "medium", stat: "pickemWon", tiers: [1, 5, 15, 35, 75], text: (n) => `Win ${n} Pick'em ${s(n, "challenge")}` },
    { id: "sharpshooter", name: "Sharpshooter", category: "pickem", difficulty: "easy", stat: "correctPicks", tiers: [50, 250, 1000, 2500, 6000], text: (n) => `Pick the winner of ${n} series` },
    { id: "upsetWhisperer", name: "Upset Whisperer", category: "pickem", difficulty: "hard", stat: "upsetPicks", tiers: [3, 10, 25, 50, 100], text: (n) => `Pick ${n} ${s(n, "upset")} correctly (${Math.round(UPSET_CHANCE * 100)}% or less predicted)` },
    { id: "hotHand", name: "Hot Hand", category: "pickem", difficulty: "medium", stat: "bestStreak", tiers: [5, 10, 15, 20, 25], text: (n) => `Pick ${n} winners in a row` },
    { id: "pointHoarder", name: "Point Hoarder", category: "pickem", difficulty: "easy", since: 2, stat: "pickemPoints", tiers: [250, 1500, 6000, 20000, 50000], text: (n) => `Collect ${n.toLocaleString("en-US")} Pick'em points` },
    { id: "onARoll", name: "On a Roll", category: "pickem", difficulty: "extreme", since: 2, stat: "bestPickemStreak", tiers: [2, 3, 4, 5, 7], text: (n) => `Win ${n} Pick'em challenges in a row` },
    { id: "longShotHunter", name: "Long Shot Hunter", category: "pickem", difficulty: "extreme", since: 2, stat: "longShots", tiers: [1, 3, 6, 10, 20], text: (n) => `Pick ${n} ${s(n, "winner")}, who had ${Math.round(LONG_SHOT_CHANCE * 100)}% or less predicted` },
    { id: "safeHands", name: "Safe Hands", category: "pickem", difficulty: "easy", since: 2, stat: "favoritesCorrect", tiers: [25, 100, 300, 800, 2000], text: (n) => `Pick ${n} ${s(n, "favorite")} correctly (${Math.round(FAVORITE_CHANCE * 100)}% or more predicted)` },
    { id: "finalWord", name: "Final Word", category: "pickem", difficulty: "medium", since: 2, stat: "grandFinalsCorrect", tiers: [2, 5, 12, 25, 50], text: (n) => `Pick the winner of ${n} Grand ${s(n, "Final")}` },
    { id: "byAHair", name: "By a Hair", category: "pickem", difficulty: "medium", flag: true, text: () => "Win a Pick'em challenge by exactly 1 point" },
    { id: "photoFinish", name: "Photo Finish", category: "pickem", difficulty: "medium", since: 2, flag: true, text: () => "Win a Pick'em challenge with exactly the needed points" },
    { id: "crushingIt", name: "Crushing It", category: "pickem", difficulty: "hard", flag: true, text: () => "Win a Pick'em challenge with at least 50% more points than needed" },
    { id: "soClose", name: "So Close", category: "pickem", difficulty: "easy", since: 2, flag: true, text: () => "Lose a Pick'em challenge by exactly 1 point" },
    { id: "againstAllOdds", name: "Against All Odds", category: "pickem", difficulty: "hard", flag: true, text: () => `Pick a winner, who had ${Math.round(LONG_SHOT_CHANCE * 100)}% or less predicted` },
    { id: "coinFlip", name: "Coin Flip", category: "pickem", difficulty: "easy", since: 2, flag: true, text: () => "Pick the winner of a series, which was predicted 48% to 52%" },
    { id: "perfectRound", name: "Perfect Round", category: "pickem", difficulty: "medium", flag: true, text: () => `Guess every match of a knockout round with ${PERFECT_ROUND_MIN} or more matches` },
    { id: "clairvoyant", name: "Clairvoyant", category: "pickem", difficulty: "legendary", since: 2, flag: true, text: () => "Guess every single series of an event with 8 or more series" },
    { id: "underdogChampion", name: "Underdog Champion", category: "pickem", difficulty: "hard", flag: true, text: () => `Pick the winner of a Grand Final, who had ${Math.round(UPSET_CHANCE * 100)}% or less predicted` },
    { id: "roughPatch", name: "Rough Patch", category: "pickem", difficulty: "medium", since: 2, flag: true, text: () => "Miss 6 picks in a row (it happens to the best)" },

    { id: "grinder", name: "Grinder", category: "matches", difficulty: "easy", stat: "seriesPlayed", tiers: [50, 250, 1000, 2500, 6000], text: (n) => `Play ${n} series` },
    { id: "setCollector", name: "Set Collector", category: "matches", difficulty: "easy", since: 2, stat: "setsPlayed", tiers: [100, 500, 2000, 5000, 12000], text: (n) => `Play ${n.toLocaleString("en-US")} sets` },
    { id: "marathon", name: "Marathon", category: "matches", difficulty: "easy", stat: "overtimes", tiers: [10, 50, 200, 600, 1500], text: (n) => `Play ${n} Overtimes` },
    { id: "bigStage", name: "Big Stage", category: "matches", difficulty: "medium", stat: "grandFinals", tiers: [3, 10, 25, 50, 100], text: (n) => `Play ${n} Grand Finals` },
    { id: "comebackKid", name: "Comeback Kid", category: "matches", difficulty: "medium", since: 2, stat: "comebacks", tiers: [3, 15, 50, 150, 400], text: (n) => `See your pick win ${n} ${s(n, "series", "series")} after losing the first set` },
    { id: "sweeper", name: "Sweeper", category: "matches", difficulty: "easy", since: 2, stat: "sweeps", tiers: [10, 50, 200, 600, 1500], text: (n) => `See your pick win ${n} Best of 3 or longer without losing a set` },
    { id: "downToTheWire", name: "Down to the Wire", category: "matches", difficulty: "easy", since: 2, stat: "deciders", tiers: [10, 50, 150, 500, 1200], text: (n) => `Play ${n} series, which go to their last possible set` },
    { id: "extendedStay", name: "Extended Stay", category: "matches", difficulty: "extreme", since: 2, stat: "erSets", tiers: [1, 2, 4, 7, 12], text: (n) => `Play ${n} ${s(n, "set")}, which go into the Extended Rounds` },
    { id: "fromTheSpot", name: "From the Spot", category: "matches", difficulty: "extreme", since: 2, stat: "penaltySets", tiers: [1, 2, 3, 5, 8], text: (n) => `Play ${n} ${s(n, "set")}, which go into the Penalties` },
    { id: "baker", name: "Baker", category: "matches", difficulty: "hard", since: 2, stat: "bagels", tiers: [2, 3, 5, 8, 12], text: (n) => `Play ${n} ${s(n, "set")}, which end 13-0` },
    { id: "doubleTrouble", name: "Double Trouble", category: "matches", difficulty: "medium", flag: true, text: () => "Play a set that goes into the Double Overtime" },
    { id: "tripleThreat", name: "Triple Threat", category: "matches", difficulty: "hard", since: 2, flag: true, text: () => "Play a set that goes into the Triple Overtime" },
    { id: "endlessSet", name: "Endless Set", category: "matches", difficulty: "extreme", since: 2, flag: true, text: () => "Play a set that is decided in the Quadruple Overtime" },
    { id: "tiebreaker", name: "Tiebreaker", category: "matches", difficulty: "hard", flag: true, text: () => "Play a set that goes into the Extended Rounds" },
    { id: "spotKick", name: "Spot Kick", category: "matches", difficulty: "extreme", flag: true, text: () => "Play a set that goes into the Penalties" },
    { id: "bagel", name: "Bagel", category: "matches", difficulty: "hard", flag: true, text: () => "Play a set that ends 13-0" },
    { id: "nailBiter", name: "Nail-Biter", category: "matches", difficulty: "hard", since: 2, flag: true, text: () => "Play a series of 2 or more sets, in which every set goes into the Overtime" },
    { id: "reverseSweep", name: "Reverse Sweep", category: "matches", difficulty: "hard", flag: true, text: () => "Play a Best of 5, which is won 3:2 after 0:2" },
    { id: "fullDistance", name: "Full Distance", category: "matches", difficulty: "extreme", flag: true, text: () => "Play a Best of 9, which ends 5:4" },
    { id: "cleanSweep", name: "Clean Sweep", category: "matches", difficulty: "medium", flag: true, text: () => "Play a Best of 7 or longer, which is won without losing a single set" },

    { id: "fromTheBottom", name: "From the Bottom", category: "stories", difficulty: "hard", flag: true, text: () => "Watch a team from a Play-in or from Rung 1 qualify" },
    { id: "allTheWayUp", name: "All the Way Up", category: "stories", difficulty: "legendary", flag: true, text: () => "Watch a team, which came through a qualifying event, win the main event of its series" },
    { id: "backToBack", name: "Back to Back", category: "stories", difficulty: "medium", since: 2, flag: true, text: () => "Watch the same team win 2 whole tournaments in a row" },
    { id: "dynasty", name: "Dynasty", category: "stories", difficulty: "extreme", flag: true, text: () => "Watch the same team win 3 whole tournaments in a row" },
    { id: "newBlood", name: "New Blood", category: "stories", difficulty: "easy", since: 2, flag: true, text: () => "Watch a team win its very first whole tournament (after 5 whole tournaments of yours)" },
    { id: "bountyKing", name: "Bounty King", category: "stories", difficulty: "hard", flag: true, text: () => "Watch a Premier Bounty Series champion finish with 150 or more Bounty Gems" },
    { id: "ragsToRiches", name: "Rags to Riches", category: "stories", difficulty: "extreme", since: 2, flag: true, text: () => "Watch a team, which started the Premier Bounty Series without a single Bounty Gem, win it" },

    { id: "officialBusiness", name: "Official Business", category: "circuits", difficulty: "medium", since: 2, stat: "kind:official", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} Official ${s(n, "tournament")}` },
    { id: "pemRegular", name: "PEM Regular", category: "circuits", difficulty: "medium", since: 2, stat: "kind:pem", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} PEM main ${s(n, "event")} (Small or Big)` },
    { id: "proLeaguer", name: "Pro Leaguer", category: "circuits", difficulty: "medium", since: 2, stat: "kind:gpl", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} Global Pro ${s(n, "League")}` },
    { id: "bountyHunter", name: "Bounty Hunter", category: "circuits", difficulty: "medium", since: 2, stat: "kind:pbs", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} Premier Bounty ${s(n, "Series", "Series")}` },
    { id: "grandmaster", name: "Grandmaster", category: "circuits", difficulty: "medium", since: 2, stat: "kind:pgx", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} PGX ${s(n, "Grandmasters", "Grandmasters")}` },
    { id: "starPower", name: "Star Power", category: "circuits", difficulty: "medium", since: 2, stat: "kind:ess", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} Elite Star ${s(n, "Series", "Series")}` },
    { id: "skylineWalker", name: "Skyline Walker", category: "circuits", difficulty: "easy", since: 2, stat: "kind:skylines", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} Official ${s(n, "Skylines", "Skylines")}` },
    { id: "cupRunner", name: "Cup Runner", category: "circuits", difficulty: "easy", since: 2, stat: "kind:gcc", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} Global Challenger ${s(n, "Cup")}` },

    { id: "climber", name: "Climber", category: "milestones", difficulty: "hard", since: 2, stat: "level", tiers: [10, 25, 50, 75, 100], text: (n) => `Reach Level ${n}` },
    { id: "starlight", name: "Starlight", category: "milestones", difficulty: "easy", since: 2, stat: "xpTotal", tiers: [10000, 50000, 150000, 400000, 1000000], text: (n) => `Earn ${n.toLocaleString("en-US")} XP in total` },
    { id: "completionist", name: "Completionist", category: "milestones", difficulty: "hard", since: 2, stat: "achievementSteps", tiers: [10, 30, 60, 100, 140], text: (n) => `Reach ${n} achievement steps (every tier counts)` },
    { id: "dailyHabit", name: "Daily Habit", category: "milestones", difficulty: "easy", since: 2, stat: "daysPlayed", tiers: [3, 10, 25, 50, 100], text: (n) => `Play on ${n} different ${s(n, "day")}` },

    { id: "insured", name: "Safety Net", category: "benefits", difficulty: "easy", flag: true, text: () => "Get points back from a Pick'em Insurance on a pick that loses" },
    { id: "riskManager", name: "Risk Manager", category: "benefits", difficulty: "medium", since: 2, stat: "insurancePaid", tiers: [1, 3, 8, 15, 30], text: (n) => `Get ${n} ${s(n, "payout")} from your Pick'em Insurance` },
    { id: "bonusHunter", name: "Bonus Hunter", category: "benefits", difficulty: "easy", since: 2, stat: "perkPoints", tiers: [10, 50, 200, 600, 1500], text: (n) => `Collect ${n} bonus Pick'em points from your level benefits` },
    { id: "trimmedDown", name: "Trimmed Down", category: "benefits", difficulty: "easy", since: 2, stat: "neededCuts", tiers: [1, 10, 30, 75, 150], text: (n) => `Play ${n} ${s(n, "event")} with fewer needed Pick'em points` },
    { id: "secondWind", name: "Second Wind", category: "benefits", difficulty: "hard", since: 2, flag: true, text: () => "Keep your pick streak alive with a Streak Shield" },

    { id: "hatTrick", name: "Hat Trick", category: "tournaments", difficulty: "hard", since: 3, flag: true, text: () => "Guess the champion of 3 events in a row" },
    { id: "explorer", name: "Explorer", category: "tournaments", difficulty: "easy", since: 3, stat: "eventKindCount", tiers: [3, 6, 9, 12, 16], text: (n) => `Finish ${n} different kinds of events` },
    { id: "untouchable", name: "Untouchable", category: "pickem", difficulty: "extreme", since: 3, flag: true, text: () => "Win a Pick'em challenge with at least twice the needed points" },
    { id: "sharpEye", name: "Sharp Eye", category: "pickem", difficulty: "hard", since: 3, flag: true, text: () => "Pick 40 winners correctly in a single event" },
    { id: "upsetNight", name: "Upset Night", category: "pickem", difficulty: "hard", since: 3, flag: true, text: () => `Pick 3 upsets correctly in a single event (${Math.round(UPSET_CHANCE * 100)}% or less predicted)` },
    { id: "closeCalls", name: "Close Calls", category: "matches", difficulty: "easy", since: 3, stat: "closeSets", tiers: [10, 50, 150, 400, 1000], text: (n) => `Play ${n.toLocaleString("en-US")} ${s(n, "set")}, which end 13-11` },
    { id: "sevenWonders", name: "Seven Wonders", category: "matches", difficulty: "hard", since: 3, flag: true, text: () => "Play a Best of 7, which goes all 7 sets" },
    { id: "blowout", name: "Blowout", category: "matches", difficulty: "medium", since: 3, flag: true, text: () => "Play a series of 2 or more sets, in which every set is won by 8 or more rounds" },
    { id: "endurance", name: "Endurance", category: "matches", difficulty: "medium", since: 3, flag: true, text: () => "Play a series with 3 or more Overtimes in total" },
    { id: "openEra", name: "Open Era", category: "stories", difficulty: "medium", since: 3, flag: true, text: () => "Watch 5 different teams win 5 whole tournaments in a row" },
    { id: "openDoors", name: "Open Doors", category: "circuits", difficulty: "easy", since: 3, stat: "event:qualifier", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} Official or Open ${s(n, "Qualifier")}` },
    { id: "tourGuide", name: "Tour Guide", category: "circuits", difficulty: "easy", since: 3, stat: "event:cst", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} Champions Series ${s(n, "Tour")}` },
    { id: "leagueClimber", name: "League Climber", category: "circuits", difficulty: "easy", since: 3, stat: "event:ecl", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} ECL ${s(n, "event")}` },
    { id: "candidate", name: "Candidate", category: "circuits", difficulty: "easy", since: 3, stat: "event:pgxCm", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} PGX Candidate ${s(n, "Masters", "Masters")}` },
    { id: "international", name: "International", category: "circuits", difficulty: "easy", since: 3, stat: "event:pgxIm", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} PGX International ${s(n, "Masters", "Masters")}` },
    { id: "ladderClimber", name: "Ladder Climber", category: "circuits", difficulty: "easy", since: 3, stat: "event:essLq", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} Elite Star Series Ladder ${s(n, "Qualifier")}` },
    { id: "challengerCircuit", name: "Challenger", category: "circuits", difficulty: "easy", since: 3, stat: "event:essCh", tiers: [1, 3, 6, 12, 25], text: (n) => `Finish ${n} Elite Star Series ${s(n, "Challenger")}` },
    { id: "benefitCollector", name: "Benefit Collector", category: "milestones", difficulty: "medium", since: 3, stat: "perkMilestones", tiers: [5, 15, 30, 50, 75], text: (n) => `Unlock ${n} level benefit milestones` },
    { id: "nightOwl", name: "Night Owl", category: "milestones", difficulty: "easy", since: 3, flag: true, text: () => "Play a series between midnight and 5 AM" },
    { id: "earlyBird", name: "Early Bird", category: "milestones", difficulty: "easy", since: 3, flag: true, text: () => "Play a series between 5 AM and 8 AM" },
    { id: "shieldBearer", name: "Shield Bearer", category: "benefits", difficulty: "medium", since: 3, stat: "shieldSaves", tiers: [1, 3, 8, 15, 30], text: (n) => `Keep your pick streak alive ${n} ${s(n, "time")} with a Streak Shield` },
    { id: "boosted", name: "Boosted", category: "benefits", difficulty: "easy", since: 3, stat: "boostXp", tiers: [500, 2500, 10000, 30000, 80000], text: (n) => `Earn ${n.toLocaleString("en-US")} XP from your XP and achievement boosts` },
    { id: "luckyCharm", name: "Lucky Charm", category: "benefits", difficulty: "medium", since: 3, flag: true, text: () => "Get 3 or more bonus Pick'em points from level benefits in a single series" },
    { id: "overtimePayday", name: "Overtime Payday", category: "benefits", difficulty: "easy", since: 3, stat: "overtimeBonusPoints", tiers: [5, 25, 75, 200, 500], text: (n) => `Collect ${n} bonus Pick'em points from the overtime bonus` },
    { id: "knockoutArtist", name: "Knockout Artist", category: "benefits", difficulty: "easy", since: 3, stat: "knockoutBonusPoints", tiers: [5, 25, 75, 200, 500], text: (n) => `Collect ${n} bonus Pick'em points from the knockout bonus` },

    { id: "livingLegend", name: "Living Legend", category: "tournaments", difficulty: "legendary", since: 4, stat: "eventsFinished", once: 400, text: () => "Get 400 records into the Hall of Fame" },
    { id: "propheticRun", name: "Prophetic Run", category: "pickem", difficulty: "legendary", since: 4, flag: true, text: () => "Guess the champion of 6 events in a row" },
    { id: "theEpic", name: "The Epic", category: "matches", difficulty: "legendary", since: 4, flag: true, text: () => "Play a series with 8 or more Overtimes in total" },
    { id: "penaltyDrama", name: "Penalty Drama", category: "matches", difficulty: "legendary", since: 4, flag: true, text: () => "Play a series, in which 2 or more sets go into the Penalties" },
    { id: "dynastySupreme", name: "Dynasty Supreme", category: "stories", difficulty: "legendary", since: 4, flag: true, text: () => "Watch the same team win 5 whole tournaments in a row" },
    { id: "circuitMaster", name: "Circuit Master", category: "circuits", difficulty: "legendary", since: 4, stat: "circuitGolds", once: 0, text: () => "Reach Gold in every Circuits achievement" },
    { id: "legendaryCollector", name: "Legendary Collector", category: "milestones", difficulty: "legendary", since: 4, stat: "legendaryUnlocked", once: 0, text: () => "Unlock every other Legendary achievement" },
    { id: "fullyInsured", name: "Fully Insured", category: "benefits", difficulty: "legendary", since: 4, flag: true, text: () => "Get points back from 3 Pick'em Insurances in a single event" },
];

export const achievementById = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export const CIRCUIT_IDS = ACHIEVEMENTS.filter((a) => a.category === "circuits" && Array.isArray(a.tiers)).map((a) => a.id);
export const LEGENDARY_IDS = ACHIEVEMENTS.filter((a) => a.difficulty === "legendary" && a.id !== "legendaryCollector").map((a) => a.id);
achievementById.circuitMaster.once = CIRCUIT_IDS.length;
achievementById.legendaryCollector.once = LEGENDARY_IDS.length;

export const isTiered = (a) => Array.isArray(a.tiers);

export const COMPLETIONIST_MASTER_STEPS = ACHIEVEMENTS.reduce((sum, a) => (a.id === "completionist" ? sum : sum + (isTiered(a) ? a.tiers.length : 1)), 0);

const completionist = ACHIEVEMENTS.find((a) => a.id === "completionist");
completionist.tiers = [...[0.12, 0.3, 0.5, 0.7, 0.85].map((share) => Math.round(COMPLETIONIST_MASTER_STEPS * share)), COMPLETIONIST_MASTER_STEPS];
completionist.text = (n) =>
    n >= COMPLETIONIST_MASTER_STEPS
        ? `Get every step of every other achievement (all ${COMPLETIONIST_MASTER_STEPS} steps)`
        : `Reach ${n} achievement steps (every tier counts)`;

export const achievementXp = (a, tierIndex = 0) => DIFFICULTIES[a.difficulty].xp * (isTiered(a) ? TIERS[tierIndex].mult : 1);

export const MAIN_TOURNAMENT_KINDS = ["official", "pemSmall", "pemBig", "gpl", "pbs", "pgxGm", "ess"];

const PERK_SCHEDULE = {
    xpBoost: [[3, 2], [28, 5], [45, 8], [65, 10], [85, 13], [100, 16], [140, 20], [190, 25], [250, 30], [375, 40], [500, 50], [625, 60], [750, 70], [875, 85], [1000, 100]],
    insurance: [[5, 1], [20, 2], [60, 3], [100, 4], [150, 5], [300, 6], [550, 7], [750, 8], [1000, 10]],
    insurePct: [[5, 50], [20, 55], [40, 60], [60, 65], [90, 70], [150, 75], [225, 80], [350, 85], [500, 90], [800, 95]],
    needed: [[10, 2], [15, 4], [25, 6], [40, 8], [50, 10], [75, 11], [100, 12], [200, 13], [325, 14], [500, 15], [650, 16], [850, 17], [950, 18], [1000, 20]],
    gfBonus: [[30, 2], [125, 3], [250, 4], [450, 5], [700, 6], [1000, 8]],
    upsetBonus: [[45, 1], [175, 2], [350, 3], [600, 4], [900, 5]],
    longShotBonus: [[22, 1], [70, 2], [180, 3], [475, 4], [775, 5]],
    streakBonus: [[8, 1], [65, 2], [160, 3], [425, 4], [725, 5]],
    comebackBonus: [[12, 1], [85, 2], [210, 3], [525, 4], [825, 5]],
    sweepBonus: [[18, 1], [110, 2], [275, 3], [575, 4], [925, 5]],
    streakShield: [[35, 1], [200, 2], [500, 3], [950, 4]],
    overtimeBonus: [[6, 1], [95, 2], [230, 3], [540, 4], [860, 5]],
    deciderBonus: [[13, 1], [105, 2], [260, 3], [560, 4], [880, 5]],
    knockoutBonus: [[16, 1], [120, 2], [290, 3], [610, 4], [910, 5]],
    longSeriesBonus: [[24, 1], [130, 2], [310, 3], [620, 4], [940, 5]],
    bonusCap: [[6, 5], [20, 7], [40, 10], [75, 12], [100, 14], [175, 16], [250, 18], [350, 20], [500, 22], [750, 23], [1000, 25]],
    achievementBoost: [[4, 5], [33, 10], [66, 15], [115, 20], [170, 25], [240, 30], [400, 40], [650, 50], [1000, 75]],
};

export const PERK_MILESTONES = Object.entries(
    Object.entries(PERK_SCHEDULE).reduce((byLevel, [key, steps]) => {
        steps.forEach(([level, value]) => {
            byLevel[level] = { ...(byLevel[level] || {}), [key]: value };
        });
        return byLevel;
    }, {}),
)
    .map(([level, set]) => ({ level: Number(level), set }))
    .sort((x, y) => x.level - y.level);

export const NO_PERKS = {
    insurance: 0,
    insurePct: 0,
    needed: 0,
    gfBonus: 0,
    upsetBonus: 0,
    longShotBonus: 0,
    streakBonus: 0,
    comebackBonus: 0,
    sweepBonus: 0,
    streakShield: 0,
    xpBoost: 0,
    overtimeBonus: 0,
    deciderBonus: 0,
    knockoutBonus: 0,
    longSeriesBonus: 0,
    bonusCap: 0,
    achievementBoost: 0,
};

export const perksForLevel = (level) =>
    PERK_MILESTONES.filter((m) => m.level <= level).reduce((acc, m) => ({ ...acc, ...m.set }), { ...NO_PERKS });

export const perkLines = (set) => [
    set.insurance && `Pick'em Insurance: ${set.insurance} per tournament (Best of ${INSURANCE_MIN_BEST_OF} and longer)`,
    set.insurePct && `an insured wrong pick wins back ${set.insurePct}% of the points it missed`,
    set.needed && `${set.needed}% fewer needed Pick'em points`,
    set.gfBonus && `+${set.gfBonus} Pick'em ${s(set.gfBonus, "point")} for a correct Grand Final pick`,
    set.upsetBonus && `+${set.upsetBonus} Pick'em ${s(set.upsetBonus, "point")} for a correct upset pick`,
    set.longShotBonus && `+${set.longShotBonus} more for a correct long shot pick (${Math.round(LONG_SHOT_CHANCE * 100)}% or less)`,
    set.streakBonus && `+${set.streakBonus} Pick'em ${s(set.streakBonus, "point")} for every ${STREAK_STEP}th correct pick in a row`,
    set.comebackBonus && `+${set.comebackBonus} Pick'em ${s(set.comebackBonus, "point")}, when your pick wins after losing the first set`,
    set.sweepBonus && `+${set.sweepBonus} Pick'em ${s(set.sweepBonus, "point")}, when your pick wins a Best of 3 or longer without losing a set`,
    set.streakShield && `Streak Shield: ${set.streakShield} wrong ${s(set.streakShield, "pick")} per tournament won't break your pick streak`,
    set.overtimeBonus && `+${set.overtimeBonus} Pick'em ${s(set.overtimeBonus, "point")}, when your pick wins a series with an Overtime`,
    set.deciderBonus && `+${set.deciderBonus} Pick'em ${s(set.deciderBonus, "point")}, when your pick wins a series that goes to its last possible set`,
    set.knockoutBonus && `+${set.knockoutBonus} Pick'em ${s(set.knockoutBonus, "point")} for every correct pick in a knockout match (its loser is out)`,
    set.longSeriesBonus && `+${set.longSeriesBonus} Pick'em ${s(set.longSeriesBonus, "point")} for a correct pick in a Best of 5 or longer`,
    set.bonusCap && `Bonus Pick'em points: up to ${set.bonusCap}% of the needed ones per tournament (you choose one bonus for each pick)`,
    set.xpBoost && `+${set.xpBoost}% XP from every series and tournament`,
    set.achievementBoost && `+${set.achievementBoost}% XP from achievements`,
].filter(Boolean);

export const BONUS_PERK_TYPES = ["gfBonus", "upsetBonus", "longShotBonus", "streakBonus", "comebackBonus", "sweepBonus", "overtimeBonus", "deciderBonus", "knockoutBonus", "longSeriesBonus"];

export const BONUS_OPTIONS = [
    { type: "gfBonus", label: "Grand Final", when: "your pick wins the Grand Final" },
    { type: "upsetBonus", label: "Upset", when: `your pick has ${Math.round(UPSET_CHANCE * 100)}% or less predicted and still wins` },
    { type: "longShotBonus", label: "Long shot", when: `your pick has ${Math.round(LONG_SHOT_CHANCE * 100)}% or less predicted and still wins` },
    { type: "streakBonus", label: "Streak", when: `your pick wins and it is your ${STREAK_STEP}th correct pick in a row` },
    { type: "comebackBonus", label: "Comeback", when: "your pick wins after losing the first set" },
    { type: "sweepBonus", label: "Sweep", when: "your pick wins without losing a set" },
    { type: "overtimeBonus", label: "Overtime", when: "your pick wins a series with an Overtime" },
    { type: "deciderBonus", label: "Decider", when: "your pick wins in the last possible set" },
    { type: "knockoutBonus", label: "Knockout", when: "your pick wins this knockout match" },
    { type: "longSeriesBonus", label: "Long series", when: "your pick wins this Best of 5 or longer" },
];

const NON_KNOCKOUT_CONTEXTS = ["swiss", "gccLeague", "cstGroup"];
const UPPER_BRACKET_STAGES = ["uo", "uqf", "usf", "uf"];

export const isKnockoutContext = (context) => {
    if (!context || NON_KNOCKOUT_CONTEXTS.includes(context.type)) return false;
    if (context.type === "skyline") return context.round === "roof";
    return !UPPER_BRACKET_STAGES.includes(context.stage);
};

export const bonusOptionsFor = ({ perks, stage = null, bestOf = 1, knockout = false, streakReady = false, chance = null }) =>
    BONUS_OPTIONS.filter((option) => {
        if (!(perks?.[option.type] > 0)) return false;
        if (option.type === "gfBonus") return stage === "gf";
        if (option.type === "upsetBonus") return Number.isFinite(chance) && chance <= UPSET_CHANCE;
        if (option.type === "longShotBonus") return Number.isFinite(chance) && chance <= LONG_SHOT_CHANCE;
        if (option.type === "streakBonus") return streakReady;
        if (["comebackBonus", "sweepBonus", "deciderBonus"].includes(option.type)) return bestOf >= 3;
        if (option.type === "knockoutBonus") return knockout;
        if (option.type === "longSeriesBonus") return bestOf >= 5;
        return true;
    }).map((option) => ({ ...option, value: perks[option.type] }));

export const bonusCapPoints = (needed, pct) => (pct && Number.isFinite(needed) && needed > 0 ? Math.max(1, Math.round((needed * pct) / 100)) : 0);

export const bonusPointsUsed = (event) => (event?.perkUses ?? []).reduce((sum, use) => sum + (BONUS_PERK_TYPES.includes(use.type) ? use.points || 0 : 0), 0);

export const applyNeededPerk = (points, level) => {
    const cut = perksForLevel(level).needed;
    if (!cut || !Number.isFinite(points)) return points;
    return Math.max(1, Math.round(points * (1 - cut / 100)));
};

export const insurancePayout = (fullPoints, basePoints, pct) => {
    const missed = Math.max(0, (fullPoints || 0) - (basePoints || 0));
    return Math.floor((missed * (pct || 50)) / 100);
};
