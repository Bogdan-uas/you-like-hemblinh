import { useId } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import css from "../SpecialModePage.module.css";
import { lightenHex, darkenHex, getBrightness } from "../logic/colors.js";

const CHEVRON_PATH = "M3.2 10.4 L15.6 1.6 C17.4 0.4 19.5 1.6 19.5 3.8 L19.5 20.2 C19.5 22.4 17.4 23.6 15.6 22.4 L3.2 13.6 C2 12.8 2 11.2 3.2 10.4 Z";
const DIAMOND_PATH = "M12 1.5 C12.7 1.5 13.3 1.8 13.8 2.3 L21.7 10.2 C22.7 11.2 22.7 12.8 21.7 13.8 L13.8 21.7 C12.8 22.7 11.2 22.7 10.2 21.7 L2.3 13.8 C1.3 12.8 1.3 11.2 2.3 10.2 L10.2 2.3 C10.7 1.8 11.3 1.5 12 1.5 Z";
const TIE_COLOR = "#757575";
const TRANSITION = { duration: 0.65, ease: "easeInOut" };

const getLeadTier = (lead) => (lead <= 0 ? 0 : lead <= 2 ? 1 : lead <= 5 ? 2 : 3);

const toGradient = (color) => ({
    top: lightenHex(color, 0.2),
    middle: color,
    bottom: darkenHex(color, getBrightness(color) > 210 ? 0.22 : 0.35),
});

const Shape = ({ path, viewBox, color, size, flip = false }) => {
    const id = useId();
    const gradient = toGradient(color);
    return (
        <svg
            width={size * 0.82}
            height={size}
            viewBox={viewBox}
            style={{
                display: "block",
                overflow: "visible",
                transform: flip ? "scaleX(-1)" : undefined,
                transition: "none",
            }}
        >
            <defs>
                <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={gradient.top} />
                    <stop offset="45%" stopColor={gradient.middle} />
                    <stop offset="100%" stopColor={gradient.bottom} />
                </linearGradient>
            </defs>
            <path d={path} fill={`url(#${id})`} />
        </svg>
    );
};

export const LeadChevron = ({ color, size = 14, side = "left" }) => (
    <span
        className={css.lead_indicator_item}
        style={{ filter: `drop-shadow(0 0 2px ${color}aa) drop-shadow(0 1px 1.5px rgba(0,0,0,0.3))` }}
    >
        <Shape path={CHEVRON_PATH} viewBox="0 0 20 24" color={color} size={size} flip={side === "right"} />
    </span>
);

export const LeadingIndicator = ({ leftTeam, rightTeam, leftScore = 0, rightScore = 0, size = 26, width = 64, animated = true }) => {
    const diff = leftScore - rightScore;
    const side = diff > 0 ? "left" : diff < 0 ? "right" : "tie";
    const tier = getLeadTier(Math.abs(diff));
    const team = side === "left" ? leftTeam : side === "right" ? rightTeam : null;
    const color = team?.color ?? TIE_COLOR;
    const glow = 1.5 + tier * 0.75;
    const glowFilter = (shadowColor, blur) => `drop-shadow(0 0 ${blur}px ${shadowColor}aa) drop-shadow(0 1px 1.5px rgba(0,0,0,0.3))`;
    const title = side === "tie"
        ? "Tied"
        : `Team ${team?.name ?? ""} leads by ${Math.abs(diff)}`;

    return (
        <div
            className={css.lead_indicator}
            style={{
                width,
                height: size * 1.35,
                flexDirection: side === "right" ? "row-reverse" : "row",
                justifyContent: side === "tie" ? "center" : "flex-start",
            }}
            title={title}
        >
            {!animated ? (
                side === "tie" ? (
                    <span className={css.lead_indicator_item} style={{ filter: glowFilter(TIE_COLOR, 2) }}>
                        <Shape path={DIAMOND_PATH} viewBox="0 0 24 24" color={TIE_COLOR} size={size * 0.85} />
                    </span>
                ) : (
                    Array.from({ length: tier }, (_, i) => (
                        <span
                            key={`${side}-${i}`}
                            className={`${css.lead_indicator_item} ${tier === 3 && i === 0 ? css.lead_indicator_pulse : ""}`}
                            style={{
                                [side === "left" ? "marginLeft" : "marginRight"]: i === 0 ? 0 : -size * 0.3,
                                opacity: 1 - i * 0.3,
                                scale: String(1 - i * 0.18),
                                filter: glowFilter(color, glow),
                            }}
                        >
                            <Shape path={CHEVRON_PATH} viewBox="0 0 20 24" color={color} size={size} flip={side === "right"} />
                        </span>
                    ))
                )
            ) : null}
            {animated ? (
            <AnimatePresence mode="popLayout" initial={false}>
                {side === "tie" ? (
                    <motion.span
                        key="tie"
                        className={css.lead_indicator_item}
                        initial={{ opacity: 0, scale: 0.4, rotate: -90 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.4, rotate: 90 }}
                        transition={TRANSITION}
                        style={{ filter: glowFilter(TIE_COLOR, 2) }}
                    >
                        <Shape path={DIAMOND_PATH} viewBox="0 0 24 24" color={TIE_COLOR} size={size * 0.85} />
                    </motion.span>
                ) : (
                    Array.from({ length: tier }, (_, i) => (
                        <motion.span
                            key={`${side}-${i}`}
                            className={`${css.lead_indicator_item} ${tier === 3 && i === 0 ? css.lead_indicator_pulse : ""}`}
                            initial={{ opacity: 0, scale: 0.3, x: side === "left" ? 14 : -14 }}
                            animate={{ opacity: 1 - i * 0.3, scale: 1 - i * 0.18, x: 0 }}
                            exit={{ opacity: 0, scale: 0.3, x: side === "left" ? 10 : -10 }}
                            transition={{ ...TRANSITION, delay: i * 0.12 }}
                            style={{
                                [side === "left" ? "marginLeft" : "marginRight"]: i === 0 ? 0 : -size * 0.3,
                                filter: glowFilter(color, glow),
                            }}
                        >
                            <Shape path={CHEVRON_PATH} viewBox="0 0 20 24" color={color} size={size} flip={side === "right"} />
                        </motion.span>
                    ))
                )}
            </AnimatePresence>
            ) : null}
        </div>
    );
};
