import { useId, useState } from "react";
import css from "../SpecialModePage.module.css";
import PemTrophyIcon from "../../../components/PemTrophyIcon/PemTrophyIcon.jsx";
import GplTrophyIcon from "../../../components/GplTrophyIcon/GplTrophyIcon.jsx";
import PbsTrophyIcon from "../../../components/PbsTrophyIcon/PbsTrophyIcon.jsx";
import PgxTrophyIcon from "../../../components/PgxTrophyIcon/PgxTrophyIcon.jsx";
import EssTrophyIcon from "../../../components/EssTrophyIcon/EssTrophyIcon.jsx";
import SwcTrophyIcon from "../../../components/SwcTrophyIcon/SwcTrophyIcon.jsx";
import EwcTrophyIcon from "../../../components/EwcTrophyIcon/EwcTrophyIcon.jsx";
import { PEM_TROPHY_SILVER, PEM_TROPHY_GOLD } from "../logic/pemConfig.js";
import { PBS_TROPHY_BODY, PBS_TROPHY_GEM } from "../logic/pbsConfig.js";
import { PEM_BIG_TYPE_ID } from "../logic/tournamentTypes.jsx";

export const PemSilverTrophy = ({ style, ...props }) => (
    <PemTrophyIcon
        color={PEM_TROPHY_SILVER}
        style={{ filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.55))", ...style }}
        {...props}
    />
);

export const PemGoldTrophy = ({ style, ...props }) => (
    <PemTrophyIcon
        color={PEM_TROPHY_GOLD}
        style={{ filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.55))", ...style }}
        {...props}
    />
);

export const GplTrophy = ({ style, ...props }) => (
    <GplTrophyIcon
        color="#2e2f42"
        globeColor={PEM_TROPHY_GOLD}
        style={{ filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.55))", ...style }}
        {...props}
    />
);

export const PbsTrophy = ({ style, ...props }) => (
    <PbsTrophyIcon
        color={PBS_TROPHY_BODY}
        gemColor={PBS_TROPHY_GEM}
        style={{ filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.55))", ...style }}
        {...props}
    />
);

export const PgxTrophy = ({ style, ...props }) => (
    <PgxTrophyIcon
        color={{ top: "#ffffff", middle: "#c0c0c0", bottom: "#6f6f6f" }}
        accentColor="linear-gradient(180deg, #fff7b3 0%, gold 45%, #c49000 100%)"
        style={{ filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.55))", ...style }}
        {...props}
    />
);

export const EssTrophy = ({ style, ...props }) => (
    <EssTrophyIcon
        color={{ top: "#ffffff", middle: "#c9ccd2", bottom: "#7a7d85" }}
        accentColor="linear-gradient(180deg, #f2283a 0%, #d9142b 28%, #b80e22 72%, #6e0614 100%)"
        style={{ filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.55))", ...style }}
        {...props}
    />
);

export const SwcTrophy = ({ style, ...props }) => (
    <SwcTrophyIcon
        color={PEM_TROPHY_GOLD}
        accentColor="linear-gradient(180deg, #f2fbff 0%, #8fd3ff 20%, #2f8dff 46%, #1650d6 72%, #0a2a78 100%)"
        glowColor="#5cb8ff"
        baseColor={{ top: "#4a4c60", middle: "#2e2f42", bottom: "#15161f" }}
        plaqueColor={{ top: "#ffffff", middle: "#c9ccd2", bottom: "#7a7d85" }}
        style={{ filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.55))", ...style }}
        {...props}
    />
);

export const EwcTrophy = ({ style, ...props }) => (
    <EwcTrophyIcon style={{ filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.55))", ...style }} {...props} />
);

export const Tier15Medal = ({ size = "1em", style, title }) => <PlaceMedal place={1} ribbon={TIER15_RIBBON} emblem="star" size={size} style={style} title={title} />;

const BOUNTY_GEM_FACETS = [
    ["M222.4 149.2 L188.8 182.8 L222.4 182.8 Z", "#fff", 0.3],
    ["M222.4 149.2 L222.4 182.8 L256 149.2 Z", "#fff", 0.42],
    ["M256 149.2 L289.6 182.8 L289.6 149.2 Z", "#fff", 0.1],
    ["M289.6 149.2 L289.6 182.8 L323.2 182.8 Z", "#000", 0.2],
    ["M188.8 182.8 L256 182.8 L256 266 Z", "#fff", 0.12],
    ["M256 182.8 L323.2 182.8 L256 266 Z", "#000", 0.24],
];

export const BountyGem = ({ size = "1em", style, title }) => {
    const gradientId = `pbs-bounty-gem-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

    return (
        <svg
            viewBox="186 146 140 124"
            role={title ? "img" : undefined}
            aria-hidden={title ? undefined : true}
            style={{
                display: "inline-block",
                verticalAlign: "middle",
                width: size,
                height: size,
                flexShrink: 0,
                transition: "none",
                filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.45))",
                ...style,
            }}
        >
            {title && <title>{title}</title>}
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#9dffcf" />
                    <stop offset="0.5" stopColor="#12b36a" />
                    <stop offset="1" stopColor="#06582f" />
                </linearGradient>
            </defs>
            <path d="M222.4 149.2 L289.6 149.2 L323.2 182.8 L256 266 L188.8 182.8 Z" fill={`url(#${gradientId})`} />
            {BOUNTY_GEM_FACETS.map(([d, fill, opacity]) => (
                <path key={d} d={d} fill={fill} fillOpacity={opacity} />
            ))}
        </svg>
    );
};

export const PemSeriesTrophy = ({ type, ...props }) =>
    type === PEM_BIG_TYPE_ID ? <PemGoldTrophy {...props} /> : <PemSilverTrophy {...props} />;

export const MedalWithBreakdown = ({ icon, value, title, onHoverChange, style }) => {
    const [open, setOpen] = useState(false);

    return (
        <span
            style={{ position: "relative", transition: "none", cursor: title ? "help" : undefined, ...style }}
            onMouseEnter={() => {
                if (!title) return;
                setOpen(true);
                onHoverChange?.(true);
            }}
            onMouseLeave={() => {
                if (!title) return;
                setOpen(false);
                onHoverChange?.(false);
            }}
        >
            {icon}:{value}
            {open && title && (
                <span className={css.medal_tip}>{title}</span>
            )}
        </span>
    );
};

const OFFICIAL_STAR = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 4.6 : 11;
    return `${(60 + r * Math.cos(a)).toFixed(2)} ${(38 + r * Math.sin(a)).toFixed(2)}`;
}).join(" L");

export const OfficialTrophy = ({ size = "1em", color = "currentColor", gold = false, title, style, ...props }) => {
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const id = (n) => `of-${n}-${uid}`;
    const body = gold ? "#d9a400" : color;
    return (
        <svg
            viewBox="0 0 120 128"
            role={title ? "img" : undefined}
            aria-hidden={title ? undefined : true}
            style={{ display: "inline-block", verticalAlign: "middle", height: size, width: typeof size === "number" ? (size * 120) / 128 : `calc(${size} * 0.9375)`, flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.55))", ...style }}
            {...props}
        >
            {title && <title>{title}</title>}
            <defs>
                <linearGradient id={id("shade")} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
                    <stop offset="0.38" stopColor="#fff" stopOpacity="0.06" />
                    <stop offset="0.62" stopColor="#000" stopOpacity="0.05" />
                    <stop offset="1" stopColor="#000" stopOpacity="0.42" />
                </linearGradient>
                <linearGradient id={id("gold")} x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0" stopColor="#fff4b8" />
                    <stop offset="0.45" stopColor="#ffd23c" />
                    <stop offset="1" stopColor="#b98200" />
                </linearGradient>
                <linearGradient id={id("plate")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fff1a8" />
                    <stop offset="0.55" stopColor="#e0b232" />
                    <stop offset="1" stopColor="#a87b1c" />
                </linearGradient>
            </defs>
            <g fill="none" stroke={body} strokeWidth="7" strokeLinecap="round">
                <path d="M26 20 H15 C7 20 5 28 7 36 C10 48 19 56 31 58" />
                <path d="M94 20 H105 C113 20 115 28 113 36 C110 48 101 56 89 58" />
            </g>
            <g fill="none" stroke={`url(#${id("shade")})`} strokeWidth="7" strokeLinecap="round">
                <path d="M26 20 H15 C7 20 5 28 7 36 C10 48 19 56 31 58" />
                <path d="M94 20 H105 C113 20 115 28 113 36 C110 48 101 56 89 58" />
            </g>
            <path d="M24 12 H96 V30 C96 58 80 75 60 77 C40 75 24 58 24 30 Z" fill={body} />
            <path d="M24 12 H96 V30 C96 58 80 75 60 77 C40 75 24 58 24 30 Z" fill={`url(#${id("shade")})`} />
            <path d="M31 18 C30 40 36 58 48 68 C38 62 31 46 31 18 Z" fill="#fff" fillOpacity="0.28" />
            <rect x="21" y="8" width="78" height="7" rx="3.5" fill={`url(#${id("gold")})`} />
            <rect x="21" y="8" width="78" height="2.4" rx="1.2" fill="#fff" fillOpacity="0.55" />
            <circle cx="60" cy="38" r="15" fill="none" stroke={`url(#${id("gold")})`} strokeWidth="2.2" />
            <path d={`M${OFFICIAL_STAR} Z`} fill={`url(#${id("gold")})`} stroke="#8a6400" strokeOpacity="0.5" strokeWidth="0.6" strokeLinejoin="round" />
            <path d="M54 76 H66 L64.5 93 H55.5 Z" fill={body} />
            <path d="M54 76 H66 L64.5 93 H55.5 Z" fill={`url(#${id("shade")})`} />
            <path d="M40 93 H80 L85 103 H35 Z" fill={body} />
            <path d="M40 93 H80 L85 103 H35 Z" fill={`url(#${id("shade")})`} />
            <rect x="40" y="93" width="40" height="1.8" fill="#fff" fillOpacity="0.35" />
            <rect x="29" y="103" width="62" height="20" rx="2.5" fill={body} />
            <rect x="29" y="103" width="62" height="20" rx="2.5" fill={`url(#${id("shade")})`} />
            <rect x="29" y="103" width="62" height="2.4" fill={`url(#${id("gold")})`} />
            <rect x="41" y="108" width="38" height="11" rx="1.5" fill={`url(#${id("plate")})`} stroke="#7a5a10" strokeOpacity="0.45" strokeWidth="0.6" />
            <text x="60" y="115.6" textAnchor="middle" fontSize="6.2" fontWeight="900" textLength="31" lengthAdjust="spacingAndGlyphs" fill="#4a3410" fontFamily="Arial, sans-serif">
                OFFICIAL
            </text>
        </svg>
    );
};

const PLACE_MEDAL_METALS = {
    1: ["#fff6c2", "#ffd23c", "#b8860b", "#7a5600"],
    2: ["#ffffff", "#d4d7de", "#9097a3", "#555b66"],
    3: ["#f6c9a0", "#d48a4c", "#9a5a26", "#5e3310"],
    4: ["#d6ecff", "#6aa8dc", "#2f6496", "#1d4366"],
};

const MEDAL_RIBBON = ["#4f8ff7", "#1d4ed8", "#ffffff"];
const TIER15_RIBBON = ["#f2283a", "#8e0a1c", "#ffd23c"];

const MEDAL_STAR = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 6.4 : 15;
    return `${(32 + r * Math.cos(a)).toFixed(2)} ${(65 + r * Math.sin(a)).toFixed(2)}`;
}).join(" L");

export function PlaceMedal({ place = 1, size = "1em", ribbon = MEDAL_RIBBON, emblem = null, title, style }) {
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const id = (n) => `pm-${n}-${uid}`;
    const [hi, mid, low, edge] = PLACE_MEDAL_METALS[place] ?? PLACE_MEDAL_METALS[1];
    const [r1, r2, stripe] = ribbon;
    return (
        <svg
            viewBox="0 0 64 96"
            role={title ? "img" : undefined}
            aria-hidden={title ? undefined : true}
            style={{ display: "inline-block", verticalAlign: "middle", height: size, width: typeof size === "number" ? size * (64 / 96) : `calc(${size} * 0.6667)`, flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 0.55))", transition: "none", ...style }}
        >
            {title && <title>{title}</title>}
            <defs>
                <linearGradient id={id("metal")} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={hi} />
                    <stop offset="0.45" stopColor={mid} />
                    <stop offset="1" stopColor={low} />
                </linearGradient>
                <linearGradient id={id("inner")} x1="1" y1="1" x2="0" y2="0">
                    <stop offset="0" stopColor={hi} />
                    <stop offset="0.5" stopColor={mid} />
                    <stop offset="1" stopColor={low} />
                </linearGradient>
                <linearGradient id={id("ribbon")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={r1} />
                    <stop offset="1" stopColor={r2} />
                </linearGradient>
                <radialGradient id={id("shine")} cx="0.3" cy="0.25" r="0.75">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
                    <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
            </defs>
            <path d="M14 0 H30 L38 38 H22 Z" fill={`url(#${id("ribbon")})`} />
            <path d="M50 0 H34 L26 38 H42 Z" fill={`url(#${id("ribbon")})`} />
            <path d="M20.5 0 H23.5 L31 34 L28 34 Z" fill={stripe} fillOpacity="0.7" />
            <path d="M43.5 0 H40.5 L33 34 L36 34 Z" fill={stripe} fillOpacity="0.55" />
            <path d="M42 0 H50 L42 38 H38 Z" fill="#000" fillOpacity="0.14" />
            <rect x="23" y="33" width="18" height="7.5" rx="2.2" fill={`url(#${id("metal")})`} stroke={edge} strokeOpacity="0.6" strokeWidth="0.8" />
            <circle cx="32" cy="65" r="29.5" fill={`url(#${id("metal")})`} stroke={edge} strokeOpacity="0.6" strokeWidth="1.2" />
            {Array.from({ length: 36 }, (_, i) => {
                const a = (i / 36) * Math.PI * 2;
                return <circle key={i} cx={32 + 26.6 * Math.cos(a)} cy={65 + 26.6 * Math.sin(a)} r="0.9" fill={edge} fillOpacity="0.35" />;
            })}
            <circle cx="32" cy="65" r="23" fill={`url(#${id("inner")})`} stroke={edge} strokeOpacity="0.5" strokeWidth="1.4" />
            <circle cx="32" cy="65" r="19.5" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
            {emblem === "star" ? (
                <path d={`M${MEDAL_STAR} Z`} fill={r1} stroke={edge} strokeOpacity="0.55" strokeWidth="0.8" strokeLinejoin="round" />
            ) : (
                <text x="32" y="74.5" textAnchor="middle" fontSize="26" fontWeight="900" fontFamily="Arial, sans-serif" fill={edge} fillOpacity="0.9">
                    {place}
                </text>
            )}
            <circle cx="32" cy="65" r="29.5" fill={`url(#${id("shine")})`} />
        </svg>
    );
}
