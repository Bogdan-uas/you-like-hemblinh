export const PODIUM_QUOTES = {
    winner: [
        "The best of the best",
        "Champions keep playing until they get it right",
        "Legends aren't born in finals, instead they are confirmed there",
        "They didn't just win the tournament, they rewrote it",
        "Victory is temporary. Legacy is permanent",
        "The final needed mini-win didn't end the match, it crowned a story",
        "No luck, no noise, just pure domination",
        "They came for the trophy and they left with it",
        "The summit of the mountain is reserved for those who dare to climb it",
        "Every round was a statement, not a question",
        "They turned pressure into precision",
        "The final scoreboard tells the truth",
        "Built for the moment, defined by it",
        "When it mattered most, they were already ready",
        "No debate left, only recognition",
        "They didn't chase greatness, they enforced it",
        "Only one team leaves without regrets",
        "The trophy follows those who refuse to let go",
        "Excellence became expectation, and they delivered",
        "History remembers champions, not predictions",
        "Perfection wasn't required, only superiority",
        "The crown found its rightful owner"
    ],

    runnerUp: [
        "Neither the best of the best nor the best of the worst",
        "So close it hurts, so strong it matters",
        "They reached the peak… just not the summit",
        "Second place is just first place without the ending",
        "One step away... and yet a world apart",
        "So close to glory, yet so far",
        "Almost champions",
        "They fought like winners, finished like survivors",
        "The gap was small, but history is cruel",
        "They had the moment, but not the ending",
        "Silver is still earned, not given",
        "The final chapter just slipped away",
        "Defeated, but never outclassed",
        "They proved they belong, just not at the top",
        "Next time won't be the same",
        "One victory short of immortality",
        "A painful ending to an unforgettable journey",
        "The trophy escaped them, but respect did not",
        "Close enough to dream, far enough to remember",
        "The finish line was visible, but unreachable",
        "Tomorrow's champions are often today's runners-up"
    ],

    thirdPlace: [
        "The best of the worst",
        "Not the champion, but still the fire",
        "Bronze today, gold tomorrow",
        "Proof that the story didn't end after first defeat",
        "A podium built on resilience",
        "Third place, but first in character",
        "Being defeated doesn't mean being a loser",
        "Still standing when others fell earlier",
        "They turned disappointment into position",
        "A reminder that pride survives defeat",
        "Not the final goal, but still a finish worth respect",
        "They stayed sharp when others faded",
        "Resilience has a rank, and it's here",
        "They leave with something still shining",
        "One last victory to leave with heads held high",
        "Bronze medals still shine under bright lights",
        "The tournament ends, but the progress doesn't",
        "They answered defeat with determination",
        "A finish worthy of applause",
        "Not the ending they wanted, but one they earned"
    ],

    fourthPlace: [
        "One more place and people might have remembered your name",
        "So close the echoes still linger",
        "One match short of memory",
        "They didn't finish last, they finished fighting",
        "The bracket remembers them more than the scoreboard does",
        "Almost there is still somewhere",
        "To be defeated doesn't mean you didn't fight",
        "They stood at the edge of recognition",
        "Close enough to feel it, not enough to hold it",
        "The effort was real, even if the result wasn't",
        "They disappear from standings, not from story",
        "Every great run needs a final witness",
        "Not forgotten, just unfinished",
        "They leave with questions still unanswered",
        "One series away from standing on the podium",
        "The medals slipped away, but the experience remained",
        "Every tournament has heroes without trophies",
        "Sometimes fourth place is the beginning, not the ending",
        "They leave empty-handed, but not empty-hearted",
        "A tournament remembered for the journey, not the destination"
    ],
};

export const ANNIVERSARY_THEMES = [
    {
        min: 1000,
        max: Infinity,
        every: 100,
        gradient: "linear-gradient(90deg,#ffd700 0%,#ffffff 18%,#7df9ff 35%,#ffd700 100%)",
        glow: "#ffd700",
        animation: "gradientShift 30s linear infinite",
    },
    {
        min: 500,
        max: 999,
        every: 50,
        gradient: "linear-gradient(90deg,#ff0000 0%,#ff7f00 18%,#ffff00 35%,#00ff00 55%,#00bfff 75%,#8a2be2 85%,#ff1493 100%)",
        glow: "#ffffff",
        animation: "gradientShift 10s linear infinite",
    },
    {
        min: 250,
        max: 499,
        every: 25,
        gradient: "linear-gradient(180deg,#c77dff 0%,#9d4edd 45%,#5a189a 100%)",
        glow: "#b56cff",
    },
    {
        min: 100,
        max: 249,
        every: 10,
        gradient: "linear-gradient(180deg,#ffffff 0%,#b8f3ff 45%,#5fd3ff 100%)",
        glow: "#8be7ff",
    },
    {
        min: 50,
        max: 99,
        every: 5,
        gradient: "linear-gradient(180deg,#ff7f7f 0%,#d61a3c 45%,#760019 100%)",
        glow: "#ff4d6d",
    },
    {
        min: 25,
        max: 49,
        every: 5,
        gradient: "linear-gradient(180deg,#ffffff 0%,#dcdcdc 45%,#9c9c9c 100%)",
        glow: "#f0f0f0",
    },
    {
        min: 10,
        max: 24,
        every: 5,
        gradient: "linear-gradient(180deg,#fff7b3 0%,gold 45%,#c49000 100%)",
        glow: "gold",
    },
    {
        min: 5,
        max: 9,
        every: 5,
        gradient: "linear-gradient(180deg,#e8b67a 0%,#cd7f32 45%,#8c5317 100%)",
        glow: "#cd7f32",
    },
];

export const getTournamentNumberStyle = (theme) => (
    theme
        ? {
            backgroundImage: theme.gradient,
            backgroundRepeat: "no-repeat",
            backgroundSize: theme.animation ? "120% 120%" : "100% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            filter: `drop-shadow(0 0 3px ${theme.glow})`,
            animation: theme.animation,
        }
        : undefined
);

export const PICKEM_PLAYOFF_KEYS = ["ro16", "qf", "sf", "tpd", "gf"];
export const PICKEM_STEP_MS = 1000;
export const PICKEM_INTRO_SCALE = 8;
export const PICKEM_INTRO_HOLD_S = 0.5;
export const PICKEM_INTRO_MOVE_S = 1.4;
export const PICKEM_WIN_COUNT_MS = 30000;
export const PICKEM_LOSS_COUNT_MS = 10000;
export const PICKEM_SLOWDOWN = 4;
export const PICKEM_SNAP_DELAY_MS = 500;
