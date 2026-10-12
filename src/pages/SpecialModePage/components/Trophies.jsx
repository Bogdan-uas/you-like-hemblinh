import { useState } from "react";
import css from "../SpecialModePage.module.css";
import PemTrophyIcon from "../../../components/PemTrophyIcon/PemTrophyIcon.jsx";
import { PEM_TROPHY_SILVER, PEM_TROPHY_GOLD } from "../logic/pemConfig.js";
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
