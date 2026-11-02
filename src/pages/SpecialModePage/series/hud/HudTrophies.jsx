import { useId } from "react";
import { PEM_BIG_TYPE_ID } from "../../logic/tournamentTypes.jsx";

const PEM_CUP = [
    "M98 24 H414 a10 10 0 0 1 10 10 V42 a10 10 0 0 1 -10 10 H98 a10 10 0 0 1 -10 -10 V34 a10 10 0 0 1 10 -10 Z",
    "M104 60 H408 C408 210 332 282 279 300 H233 C180 282 104 210 104 60 Z",
    "M233 294 H279 L267 322 V364 L279 392 H233 L245 364 V322 Z",
    "M194 388 H318 L340 418 H172 Z",
    "M132 424 H380 a10 10 0 0 1 10 10 V470 a10 10 0 0 1 -10 10 H132 a10 10 0 0 1 -10 -10 V434 a10 10 0 0 1 10 -10 Z",
].join(" ");

const PEM_HANDLES = [
    "M112 96 C26 96 30 214 156 236",
    "M400 96 C486 96 482 214 356 236",
];

const PEM_SMALL_LINES = "M150 92 C164 176 210 232 250 250";

const PEM_BIG_LINES = "M150 92 C164 176 210 232 250 250 M178 405 H334";

const GPL_BODY =
    "M327.4 205.0 L328.0 226.3 L324.5 247.5 L317.9 269.0 L313.9 295.2 L300.9 315.2 L292.1 338.7 L284.1 354.5 L284.8 378.7 L293.9 396.0 L304.7 418.3 L311.5 439.2 L320.5 462.6 L320.4 480 L191.7 480 L188.6 464.1 L196.6 444.1 L212.8 421.8 L220.6 399.6 L228.6 376.5 L226.5 354.5 L222.8 335.4 L209.8 316.3 L204.0 296.6 L188.8 274.6 L183.3 244.3 L182.0 222.6 L184.7 210.0 Z";

const GPL_TWIST = "M214 300 C250 318 268 356 252 398 M296 300 C262 330 246 370 262 420";

const GLOBE = { cx: 256, cy: 206, r: 50 };

const WHITE = "#ffffff";
const LINE = "rgba(120, 126, 140, 0.55)";

const svgStyle = (size, ratio) => ({
    display: "block",
    width: typeof size === "number" ? size * ratio : `calc(${size} * ${ratio})`,
    height: size,
    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45))",
});

const PemMiniTrophy = ({ big, size }) => {
    const view = big ? { x: 24, y: 24, w: 464, h: 456 } : { x: 88, y: 24, w: 336, h: 456 };

    return (
        <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} style={svgStyle(size, view.w / view.h)} aria-hidden="true">
            {big ? PEM_HANDLES.map((d) => <path key={d} d={d} fill="none" stroke={WHITE} strokeWidth="26" strokeLinecap="round" />) : null}
            <path d={PEM_CUP} fill={WHITE} />
            <path d={big ? PEM_BIG_LINES : PEM_SMALL_LINES} fill="none" stroke={LINE} strokeWidth="9" strokeLinecap="round" />
        </svg>
    );
};

const GplMiniTrophy = ({ size }) => {
    const id = `gpl-mini-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const view = { x: 178, y: 152, w: 156, h: 330 };

    return (
        <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} style={svgStyle(size, view.w / view.h)} aria-hidden="true">
            <defs>
                <mask id={`${id}-gap`} maskUnits="userSpaceOnUse" x={view.x} y={view.y} width={view.w} height={view.h}>
                    <rect x={view.x} y={view.y} width={view.w} height={view.h} fill="#fff" />
                    <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r + 9} fill="#000" />
                </mask>
            </defs>
            <path d={GPL_BODY} fill={WHITE} mask={`url(#${id}-gap)`} />
            <path d={GPL_TWIST} fill="none" stroke={LINE} strokeWidth="7" strokeLinecap="round" />
            <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} fill={WHITE} />
            <path
                d={`M${GLOBE.cx - GLOBE.r} ${GLOBE.cy} H${GLOBE.cx + GLOBE.r} M${GLOBE.cx} ${GLOBE.cy - GLOBE.r} V${GLOBE.cy + GLOBE.r}`}
                stroke={LINE}
                strokeWidth="6"
            />
            <ellipse cx={GLOBE.cx} cy={GLOBE.cy} rx={GLOBE.r * 0.45} ry={GLOBE.r} fill="none" stroke={LINE} strokeWidth="6" />
        </svg>
    );
};

const PBS_GEM = "M222.4 149.2 L289.6 149.2 L323.2 182.8 L256 266 L188.8 182.8 Z";

const PBS_BODY = "M222 268 H290 L276 288 H236 Z M238 284 H274 L282 320 H230 Z M226 314 H286 L294 336 H218 Z M214 334 H298 L318 354 L326 420 H186 L194 354 Z";

const PBS_LINES = "M188.8 182.8 H323.2 M222.4 149.2 L240 182.8 L256 266 L272 182.8 L289.6 149.2 M244 387 A12 12 0 1 0 268 387 A12 12 0 1 0 244 387";

const PbsMiniTrophy = ({ size }) => {
    const view = { x: 182, y: 145, w: 148, h: 277 };

    return (
        <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} style={svgStyle(size, view.w / view.h)} aria-hidden="true">
            <path d={PBS_GEM} fill={WHITE} />
            <path d={PBS_BODY} fill={WHITE} />
            <path d={PBS_LINES} fill="none" stroke={LINE} strokeWidth="5" strokeLinejoin="round" />
        </svg>
    );
};

const PGX_CROWN = "M214 134 L214 104 L226 116 L236 86 L246 112 L256 74 L266 112 L276 86 L286 116 L298 104 L298 134 Z M210 132 H302 V146 H210 Z";

const PGX_CUP = [
    "M204 146 L308 146 L320 162 L192 162 Z",
    "M180 160 L332 160 L326 172 L186 172 Z",
    "M186 172 L326 172 L314 214 L290 248 L268 262 L244 262 L222 248 L198 214 Z",
    "M206 228 L184 220 L164 200 L152 174 L146 146 L146 118 L158 136 L170 154 L186 168 L198 176 L196 196 Z",
    "M316 196 L314 176 L326 168 L342 154 L354 136 L366 118 L366 146 L360 174 L348 200 L328 220 L306 228 Z",
    "M244 258 L268 258 L264 290 L248 290 Z",
    "M240 288 L272 288 L282 302 L272 316 L240 316 L230 302 Z",
    "M248 314 L264 314 L272 350 L240 350 Z",
    "M222 348 L290 348 L300 364 L212 364 Z",
    "M206 362 L306 362 L322 378 L322 408 L306 420 L206 420 L190 408 L190 378 Z",
].join(" ");

const PGX_LINES = "M256 186 L272 206 L256 228 L240 206 Z M194 182 H318 M216 392 H296";

const PgxMiniTrophy = ({ size }) => {
    const view = { x: 142, y: 70, w: 228, h: 354 };

    return (
        <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} style={svgStyle(size, view.w / view.h)} aria-hidden="true">
            <path d={PGX_CROWN} fill={WHITE} />
            <path d={PGX_CUP} fill={WHITE} />
            <path d={PGX_LINES} fill="none" stroke={LINE} strokeWidth="6" strokeLinejoin="round" />
        </svg>
    );
};

const MEDAL_RIBBON = "M22 0 H44 L60 52 H38 Z M78 0 H56 L40 52 H62 Z";

const MEDAL_LINES = "M50 88 m-27 0 a27 27 0 1 0 54 0 a27 27 0 1 0 -54 0 M44 80 L52 74 V104 M44 104 H60";

const MedalMiniTrophy = ({ size }) => {
    const view = { x: 10, y: -4, w: 80, h: 136 };

    return (
        <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} style={svgStyle(size, view.w / view.h)} aria-hidden="true">
            <path d={MEDAL_RIBBON} fill={WHITE} />
            <path d="M38 52 L50 34 L62 52" fill="none" stroke={LINE} strokeWidth="4" strokeLinejoin="round" />
            <circle cx="50" cy="88" r="38" fill={WHITE} />
            <path d={MEDAL_LINES} fill="none" stroke={LINE} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const GCC_CREST_TOP = "M4 6 H22 L32 17 L42 6 H60 L32 36 Z";

const GCC_CREST_BOTTOM = "M10 30 H21 L32 42 L43 30 H54 L32 58 Z";

const GccMiniEmblem = ({ size }) => (
    <svg viewBox="2 4 60 56" style={svgStyle(size, 60 / 56)} aria-hidden="true">
        <path d={GCC_CREST_TOP} fill="#43f04a" />
        <path d="M22 6 H42 L32 17 Z" fill="#43f04a" fillOpacity="0.45" />
        <path d={GCC_CREST_BOTTOM} fill="#43f04a" fillOpacity="0.7" />
    </svg>
);

export const HudTrophy = ({ type, size = 38 }) =>
    type === "gcc" ? <GccMiniEmblem size={size} /> : type === "pgxCm" || type === "cst" || type === "ecl" ? null : type === "pgxIm" ? <MedalMiniTrophy size={size} /> : type === "gpl" ? <GplMiniTrophy size={size} /> : type === "pbs" ? <PbsMiniTrophy size={size} /> : type === "pgx" ? <PgxMiniTrophy size={size} /> : <PemMiniTrophy big={type === PEM_BIG_TYPE_ID} size={size} />;
