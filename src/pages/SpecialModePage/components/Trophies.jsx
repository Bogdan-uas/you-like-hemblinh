import { useId, useState } from "react";
import css from "../SpecialModePage.module.css";
import PemTrophyIcon from "../../../components/PemTrophyIcon/PemTrophyIcon.jsx";
import GplTrophyIcon from "../../../components/GplTrophyIcon/GplTrophyIcon.jsx";
import PbsTrophyIcon from "../../../components/PbsTrophyIcon/PbsTrophyIcon.jsx";
import PgxTrophyIcon from "../../../components/PgxTrophyIcon/PgxTrophyIcon.jsx";
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
