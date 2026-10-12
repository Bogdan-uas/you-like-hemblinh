const hexToRgb = (hex) => {
    const clean = hex.replace("#", "");
    const noAlpha = clean.length === 8 ? clean.slice(0, 6) : clean;
    const full =
        noAlpha.length === 3
            ? noAlpha
                .split("")
                .map((c) => c + c)
                .join("")
            : noAlpha;

    const num = parseInt(full, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const clamp = (n) => Math.max(0, Math.min(255, n));

export const lightenHex = (hex, amount = 0.18) => {
    const { r, g, b } = hexToRgb(hex);

    return `#${[
        clamp(Math.round(r + (255 - r) * amount)),
        clamp(Math.round(g + (255 - g) * amount)),
        clamp(Math.round(b + (255 - b) * amount)),
    ]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}`;
};

export const getBrightness = (hex) => {
    const { r, g, b } = hexToRgb(hex);

    return (r * 299 + g * 587 + b * 114) / 1000;
};

export const darkenHex = (hex, amount = 0.68) => {
    const { r, g, b } = hexToRgb(hex);
    const dr = clamp(Math.round(r * (1 - amount)));
    const dg = clamp(Math.round(g * (1 - amount)));
    const db = clamp(Math.round(b * (1 - amount)));
    return `#${[dr, dg, db]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}`;
};

export const percentToRedYellowGreenHex = (pct) => {
    const p = Math.max(0, Math.min(100, pct));
    let r, g, b = 0;
    if (p <= 50) {
        const t = p / 50;
        r = 0xcc;
        g = Math.round(0x33 + (0xcc - 0x33) * t);
        b = 0x33;
    } else {
        const t = (p - 50) / 50;
        r = Math.round(0xcc - (0xcc - 0x33) * t);
        g = 0xcc;
        b = 0x33;
    }
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

const makeColor = (
    hex,
    name,
    {
        shadowAlpha = 0.55,
        unlitAmount = 0.7,
        hoverAmount = 0.5,
    } = {}
) => {
    const normalized = hex.toUpperCase();

    if (normalized === "#000000") {
        return {
            shadow: `0 0 10px rgba(0,0,0,${shadowAlpha})`,
            color: "#000000",

            gradient:
                "linear-gradient(180deg,#565656 0%,#1C1C1C 45%,#000000 100%)",

            hoverOn: "#2A2A2A",

            unlitColor: "#5D5D5D",

            unlitGradient:
                "linear-gradient(180deg,#707070 0%,#5D5D5D 45%,#454545 100%)",

            name,
        };
    }

    if (normalized === "#E6E6E6" || normalized === "#E6E6E6FF") {
        return {
            shadow: `0 0 10px rgba(150,150,150,0.35)`,

            color: "#E6E6E6",

            gradient:
                "linear-gradient(180deg,#FFFFFF 0%,#ECECEC 45%,#BEBEBE 100%)",

            hoverOn: "#C8C8C8",

            unlitColor: "#5D5D5D",

            unlitGradient:
                "linear-gradient(180deg,#777777 0%,#5D5D5D 45%,#474747 100%)",

            name,
        };
    }

    const { r, g, b } = hexToRgb(hex);

    const brightness = getBrightness(hex);

    const isBright = brightness > 210;

    const lighter = isBright
        ? hex
        : lightenHex(hex, 0.18);

    const darker = darkenHex(
        hex,
        isBright ? 0.22 : 0.35
    );

    const unlit = darkenHex(hex, unlitAmount);

    const unlitGradient = `linear-gradient(
        180deg,
        ${lightenHex(unlit, 0.24)} 0%,
        ${unlit} 45%,
        ${darkenHex(unlit, 0.24)} 100%
    )`;

    return {
        shadow: `0 0 10px rgba(${r}, ${g}, ${b}, ${shadowAlpha})`,

        color: hex,

        gradient: `linear-gradient(
            180deg,
            ${lighter} 0%,
            ${hex} 45%,
            ${darker} 100%
        )`,

        hoverOn: darkenHex(hex, hoverAmount),

        unlitColor: unlit,

        unlitGradient,

        name,
    };
};

export const COLORS = {
    red: makeColor("#FF0000", "Red"),
    lime: makeColor("#32CD32", "Lime"),
    yellow: makeColor("#FFFF00", "Yellow"),
    blue: makeColor("#0000FF", "Blue"),
    green: makeColor("#008000", "Green"),
    beige: makeColor("#FFC0CB", "Beige"),
    orange: makeColor("#FF7F00", "Orange"),
    brown: makeColor("#7F3900", "Brown"),
    cyan: makeColor("#00FFFF", "Cyan"),
    indigo: makeColor("#4A007F", "Indigo"),
    violet: makeColor("#8A2BE2", "Violet"),
    pink: makeColor("#FF1493", "Pink"),
    black: makeColor("#000000", "Black", { unlitAmount: 0.35 }),
    white: makeColor("#e6e6e6ff", "White", { unlitAmount: 0.35 }),
    gray: makeColor("#808080", "Gray"),
    teal: makeColor("#006D6F", "Teal"),


    gold: makeColor("#D4AF37", "Gold"),
    silver: makeColor("#C0C0C0", "Silver", { shadowAlpha: 0.35 }),

    navy: makeColor("#3A4DFF", "Navy"),
    olive: makeColor("#808000", "Olive"),
    coral: makeColor("#FF6F61", "Coral"),
    magenta: makeColor("#D81BFF", "Magenta"),

    lavender: makeColor("#B388FF", "Lavender"),
    sky: makeColor("#4FC3F7", "Sky"),
    mint: makeColor("#69F0AE", "Mint"),
    salmon: makeColor("#FF8A80", "Salmon"),

    plum: makeColor("#6A1B9A", "Plum"),
    khaki: makeColor("#C2B280", "Khaki"),
    crimson: makeColor("#DC143C", "Crimson"),
    turquoise: makeColor("#00E5FF", "Turquoise"),

    chartreuse: makeColor("#76FF03", "Chartreuse"),
    steel: makeColor("#607D8B", "Steel"),


    emerald: makeColor("#00C853", "Emerald"),
    ruby: makeColor("#C2185B", "Ruby"),

    sapphire: makeColor("#0D47A1", "Sapphire"),
    amber: makeColor("#FFB300", "Amber"),
    bronze: makeColor("#B87333", "Bronze"),
    copper: makeColor("#C46A1A", "Copper"),

    sand: makeColor("#E6A15A", "Sand"),
    seafoam: makeColor("#4DD0E1", "Seafoam"),
    forest: makeColor("#1B5E20", "Forest"),
    midnight: makeColor("#1A237E", "Midnight"),

    peach: makeColor("#FFCCBC", "Peach", { shadowAlpha: 0.35 }),
    apricot: makeColor("#FFB48F", "Apricot"),
    periwinkle: makeColor("#7E8CE0", "Periwinkle"),
    sunflower: makeColor("#FFD000", "Sunflower"),

    raspberry: makeColor("#D81B60", "Raspberry"),
    chocolate: makeColor("#4E2A14", "Chocolate"),
    ivory: makeColor("#FFF6D6", "Ivory", { shadowAlpha: 0.25, unlitAmount: 0.8 }),
    charcoal: makeColor("#37474F", "Charcoal"),

    denim: makeColor("#1565C0", "Denim"),
    spring: makeColor("#00E676", "Spring"),
    ocean: makeColor("#006064", "Ocean"),
    lilac: makeColor("#CE93D8", "Lilac"),

    rose: makeColor("#FF5CA8", "Rose"),
    frost: makeColor("#E3F2FD", "Frost", { shadowAlpha: 0.25, unlitAmount: 0.8 }),
    slate: makeColor("#546E7A", "Slate"),
    moss: makeColor("#8A9A5B", "Moss"),

    wine: makeColor("#6D1B2D", "Wine"),
    honey: makeColor("#F4C430", "Honey"),
    azure: makeColor("#00A3FF", "Azure"),
    blush: makeColor("#FF8FB1", "Blush", { shadowAlpha: 0.35 }),

    jade: makeColor("#00A86B", "Jade"),
    royal: makeColor("#5B5BE6", "Royal"),
};

export const COLORS_ORDER_INDEX = Object.fromEntries(Object.keys(COLORS).map((key, i) => [key, i]));

export function makeColorSequence(baseColors, repeats = 12) {
    const base = baseColors;
    const out = [];
    let prev = null;

    for (let r = 0; r < repeats; r++) {
        const pool = [...base];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        if (prev && pool[0]?.color === prev) {
            pool.push(pool.shift());
        }

        pool.forEach((c) => out.push(c));
        prev = out[out.length - 1]?.color ?? prev;
    }

    return out;
}

const ALWAYS_COLOR_KEYS = ["red", "yellow", "lime", "blue", "green", "brown", "beige", "orange"];
const TOURNAMENT_COLOR_COUNT = 32;

export const buildTournamentColorPool = () => {
    const entries = Object.entries(COLORS);

    const always = [];
    const others = [];

    for (const [key, val] of entries) {
        if (ALWAYS_COLOR_KEYS.includes(key)) {
            always.push([key, val]);
        } else {
            others.push([key, val]);
        }
    }

    const neededFromOthers = Math.max(
        0,
        TOURNAMENT_COLOR_COUNT - always.length
    );

    const selected = [];
    const pool = [...others];

    while (selected.length < neededFromOthers && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool[idx]);
        pool.splice(idx, 1);
    }

    return [...always, ...selected];
};
