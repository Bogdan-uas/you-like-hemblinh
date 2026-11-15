import CountryFlag from "./CountryFlag.jsx";
import { ewcHomeOf } from "../logic/ewcHomes.js";
import css from "./WorldMap.module.css";

const UNDER = {
    left: { position: "absolute", top: "100%", left: 0, marginTop: 6 },
    right: { position: "absolute", top: "100%", right: 0, marginTop: 6 },
    center: { position: "absolute", top: "100%", left: "50%", marginTop: 6, transform: "translateX(-50%)" },
};

export default function IntroHome({ team, className = "", style, under = null }) {
    const home = ewcHomeOf(team);
    if (!home) return null;
    return (
        <span className={`${css.intro_home} ${className}`} style={under ? { ...UNDER[under], ...style } : style}>
            <CountryFlag code={home.code} title={home.country} size="1em" />
            {home.country}
        </span>
    );
}
