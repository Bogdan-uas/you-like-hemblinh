// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { FaCaretRight, FaCrown } from "react-icons/fa";
import css from "./PemHud.module.css";
import base from "../../SpecialModePage.module.css";
import { HudTrophy } from "./HudTrophies.jsx";
import { PEM_SLOT_COUNT, getPemPenaltyWindow, pemTextOn } from "./pemHud.js";

export const PemTrophy = ({ type, size, className }) => (
    <span className={`${css.pem_trophy} ${className ?? ""}`}>
        <HudTrophy type={type} size={size} />
    </span>
);

export const PemCircle = ({ team, className }) => (
    <span
        className={`${css.circle} ${className ?? ""}`}
        style={{ background: team?.gradient ?? team?.color, "--team-color": team?.color ?? "#8b909e" }}
    />
);

export const PemSetPips = ({ total, lit }) => (
    <span className={css.pips}>
        {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`${css.pip} ${lit > i ? css.pip_won : ""}`} />
        ))}
    </span>
);

export const PemMiniGrid = ({ team, total, lit, side }) => (
    <span className={`${css.slots} ${side === "right" ? css.slots_right : ""}`}>
        {Array.from({ length: total }, (_, i) => (
            <span
                key={i}
                className={`${css.slot} ${i < lit ? css.slot_lit : ""}`}
                style={i < lit ? { background: team?.gradient, "--team-color": team?.color, "--slot-i": i } : { "--slot-i": i }}
            />
        ))}
    </span>
);

export const PemPenaltyGrid = ({ results, attempts, side, nextIndex = null }) => (
    <span className={`${css.slots} ${side === "right" ? css.slots_right : ""}`}>
        {getPemPenaltyWindow(results, attempts).map(({ index, result }) => (
            <span
                key={index}
                className={`${css.slot} ${css.pen} ${result === "success" ? css.pen_goal : result === "fail" ? css.pen_miss : ""} ${index === nextIndex ? css.pen_next : ""} ${index >= PEM_SLOT_COUNT ? css.pen_sudden : ""}`}
            >
                {result === "success" ? <FaCheck aria-hidden="true" /> : result === "fail" ? <FaXmark aria-hidden="true" /> : null}
            </span>
        ))}
    </span>
);

export const PemScore = ({ value, team, animated = true }) => (
    <span className={css.score_cell}>
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
                key={value}
                className={css.score}
                initial={animated ? { y: "55%", opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                exit={animated ? { y: "-55%", opacity: 0 } : undefined}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
                {value}
            </motion.span>
        </AnimatePresence>
        <span className={css.side_bar} style={{ background: team?.gradient ?? team?.color, "--team-color": team?.color }} />
    </span>
);

const FINALE_BURST = Array.from({ length: 22 }, (_, i) => {
    const angle = (i / 22) * Math.PI * 2 + ((i * 37) % 11) / 22;
    const distance = 90 + ((i * 53) % 7) * 20;
    return {
        dx: `${Math.round(Math.cos(angle) * distance)}px`,
        dy: `${Math.round(Math.sin(angle) * distance * 0.32)}px`,
        rot: `${((i * 71) % 260) - 130}deg`,
        size: `${7 + ((i * 29) % 6)}px`,
        round: i % 3 === 0,
        tone: ["white", "gold", "team"][i % 3],
    };
});

export const FinaleCircleEffects = () => (
    <>
        <span className={`${css.fin_ring} ${css.fin_ring_1}`} aria-hidden="true" />
        <span className={`${css.fin_ring} ${css.fin_ring_2}`} aria-hidden="true" />
        <span className={css.fin_halo} aria-hidden="true" />
        {FINALE_BURST.map((piece, i) => (
            <span
                key={i}
                aria-hidden="true"
                className={`${css.fin_piece} ${css[`fin_piece_${piece.tone}`]}`}
                style={{
                    "--dx": piece.dx,
                    "--dy": piece.dy,
                    "--rot": piece.rot,
                    width: piece.size,
                    height: piece.round ? piece.size : `calc(${piece.size} * 0.55)`,
                    borderRadius: piece.round ? "50%" : "2px",
                    animationDelay: `${520 + (i % 4) * 30}ms`,
                }}
            />
        ))}
    </>
);

export const PemHalf = ({ side, team, score, setsTotal, setsLit, slots, dimmed, opacity, winner, result = null, finale = null, celebrate = false, animated = true }) => (
    <div
        className={`${css.half} ${side === "right" ? css.half_right : ""} ${winner ? css.half_winner : ""} ${result ? css[`half_${result}`] : ""} ${finale ? `${css[`fin_${finale}`]} ${celebrate ? css.fin_play : css.fin_static}` : ""}`}
        style={{ opacity: finale ? 1 : opacity ?? (dimmed ? 0.45 : 1), "--team-color": team?.color, "--team-gradient": team?.gradient ?? team?.color }}
    >
        {finale === "won" ? (
            <>
                <span className={`${css.fin_layer} ${css.fin_fill}`} aria-hidden="true" />
                <span className={`${css.fin_layer} ${css.fin_rays}`} aria-hidden="true" />
                <span className={`${css.fin_layer} ${css.fin_flash}`} aria-hidden="true" />
            </>
        ) : finale === "lost" ? (
            <span className={`${css.fin_layer} ${css.fin_shutter}`} aria-hidden="true" />
        ) : null}
        <span className={css.circle_wrap}>
            {finale === "won" ? <FinaleCircleEffects /> : null}
            <PemCircle team={team} />
            {result ? (
                <span className={`${css.result_badge} ${css[`result_${result}`]}`} title={result === "won" ? `Team ${team?.name} won` : `Team ${team?.name} lost`}>
                    {result === "won" ? <FaCheck aria-hidden="true" /> : <FaXmark aria-hidden="true" />}
                </span>
            ) : null}
        </span>
        {setsTotal > 0 ? <PemSetPips total={setsTotal} lit={setsLit} /> : <span className={css.pips} />}
        {slots ?? <span className={css.slots} />}
        <PemScore value={score} team={team} animated={animated} />
    </div>
);

export const PemMainFrame = ({ alert = false, glow = null, children }) => (
    <div className={`${css.main_wrap} ${alert ? css.wrap_alert : ""}`}>
        {["left", "right"].map((side) => (glow?.[side] ? (
            <span key={side} className={`${css.glow_layer} ${css[`glow_${side}`]} ${css[`glow_${glow[side]}`]}`} aria-hidden="true">
                <span className={css.glow_shape} />
            </span>
        ) : null))}
        <div className={`${css.panel} ${css.main} ${alert ? css.main_alert : ""}`}>{children}</div>
    </div>
);

export const PemNameTab = ({ side, team, cheat, finale = null, celebrate = false }) => (
    <span
        className={`${css.name_tab} ${side === "right" ? css.name_tab_right : ""} ${finale ? `${css[`name_${finale}`]} ${celebrate ? css.fin_play : css.fin_static}` : ""}`}
        style={{ "--team-gradient": team?.gradient ?? team?.color, "--team-color": team?.color, ...(finale === "won" ? { color: pemTextOn(team?.color) } : null) }}
    >
        {finale === "won" ? <FaCrown className={css.name_crown} aria-hidden="true" /> : null}
        <span className={css.name_prefix}>Team</span>
        <span className={css.name_text}>{team?.name}</span>
        {cheat ? <span className={`${base.cheat_indicator} ${side === "left" ? base.cheat_indicator_left : base.cheat_indicator_right}`} aria-hidden="true" /> : null}
    </span>
);

const scoreTone = (own, other) => (own > other ? css.chip_win : own < other ? css.chip_loss : "");

export const PemSetChip = ({ chip, selected = false, onSelect = null }) => {
    const content = (
        <>
            <span className={css.chip_label}>
                {chip.status === "current" ? <span className={css.chip_live} aria-hidden="true" /> : null}
                {chip.label}
            </span>
            {chip.result ? (
                <span className={css.chip_result}>
                    <span className={scoreTone(chip.result.leftScore, chip.result.rightScore)}>{chip.result.leftScore}</span>
                    <span className={css.chip_colon}>:</span>
                    <span className={scoreTone(chip.result.rightScore, chip.result.leftScore)}>{chip.result.rightScore}</span>
                    {chip.result.extra ? (
                        <span className={css.chip_extra}>
                            {chip.result.extra.label}
                            <span className={scoreTone(chip.result.extra.left, chip.result.extra.right)}>{chip.result.extra.left}</span>
                            <span className={css.chip_colon}>:</span>
                            <span className={scoreTone(chip.result.extra.right, chip.result.extra.left)}>{chip.result.extra.right}</span>
                        </span>
                    ) : null}
                </span>
            ) : null}
        </>
    );
    const className = `${css.chip} ${css[`chip_${chip.status}`] ?? ""} ${selected ? css.chip_selected : ""}`;
    const style = { "--chip-accent": chip.winnerTeam?.gradient ?? "transparent" };

    if (onSelect) {
        return (
            <button type="button" className={className} style={style} disabled={selected} onClick={onSelect} aria-pressed={selected}>
                {content}
            </button>
        );
    }
    return (
        <span className={className} style={style}>
            {content}
        </span>
    );
};

export const PemSetChips = ({ chips, bestOf, selectedIndex = null, onSelect = null, showBestOf = true }) => (
    <div className={`${css.hud} ${css.chips}`}>
        {showBestOf ? <span className={`${css.chip} ${css.chip_bo}`}>Bo{bestOf}</span> : null}
        {chips.map((chip, i) => (
            <PemSetChip key={chip.set} chip={chip} selected={selectedIndex === i} onSelect={onSelect ? () => onSelect(i) : null} />
        ))}
    </div>
);

export const PemDivider = ({ from, to, section = "half" }) => (
    <div className={`${css.hud} ${css.divider}`}>
        <span className={css.divider_line} aria-hidden="true" />
        <span className={`${css.panel} ${css.divider_badge} ${css[`divider_${section}`] ?? ""}`}>
            {from ? (
                <span className={css.divider_from}>
                    {from}
                    <FaCaretRight aria-hidden="true" />
                </span>
            ) : null}
            <span className={css.divider_to}>{to}</span>
        </span>
        <span className={css.divider_line} aria-hidden="true" />
    </div>
);
