import { flagUrlOf } from "./worldMapCore.js";
import { ewcHomeOf } from "../logic/ewcHomes.js";
import css from "./WorldMap.module.css";

export default function CountryFlag({ team, code, size = 14, title, className = "", style }) {
    const home = team ? ewcHomeOf(team) : null;
    const flagCode = code ?? home?.code;
    const url = flagUrlOf(flagCode);
    if (!url) return null;
    const label = title ?? home?.country ?? flagCode;
    return (
        <img
            className={`${css.flag} ${className}`}
            src={url}
            alt={label}
            title={label}
            draggable={false}
            style={{ height: size, width: typeof size === "number" ? (size * 4) / 3 : `calc(${size} * 1.3333)`, ...style }}
        />
    );
}
