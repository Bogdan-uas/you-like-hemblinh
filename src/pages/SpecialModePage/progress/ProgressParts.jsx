import { useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useTransform } from "framer-motion";
import { FaTrophy } from "react-icons/fa6";
import css from "./Progress.module.css";
import { DIFFICULTIES, levelInfo } from "./progressConfig.js";
import { ACHIEVEMENT_ICONS, formatXp, levelFx, tierLook, useLevelOf, useLevelUpPulse } from "./progressUi.js";

const clamp01 = (p) => Math.max(0, Math.min(1, p || 0));

const SPARK_SPOTS = [[-12, 16], [108, 22], [16, 100], [94, 92], [54, -18], [-20, 66], [116, 60], [64, 114]];

export const Sparkles = ({ count, color, size = 0.34, spread = 1 }) => (
    <span className={css.sparkles} aria-hidden="true">
        {SPARK_SPOTS.slice(0, count).map(([x, y], i) => (
            <span
                key={i}
                className={css.sparkle}
                style={{
                    left: `${50 + (x - 50) * spread}%`,
                    top: `${50 + (y - 50) * spread}%`,
                    width: `${size}em`,
                    height: `${size}em`,
                    color,
                    animationDelay: `${((i * 0.43) % 1.7).toFixed(2)}s`,
                    animationDuration: `${(1.45 + (i % 3) * 0.4).toFixed(2)}s`,
                }}
            />
        ))}
    </span>
);

export const WaapiParticles = ({ items }) => {
    const refs = useRef([]);
    useEffect(() => {
        const animations = items.map((item, i) => refs.current[i]?.animate?.(item.frames, { fill: "both", ...item.timing }));
        return () => animations.forEach((animation) => animation?.cancel());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return items.map((item, i) => (
        <span
            key={i}
            className={item.className}
            style={item.css}
            ref={(el) => {
                refs.current[i] = el;
            }}
        />
    ));
};

export const LevelNumber = ({ level, className = "", sparkles = true }) => {
    const fx = levelFx(level);
    if (!fx.strength) return <span className={`${css.lvnum} ${className}`}>{level}</span>;
    return (
        <span className={`${css.lvnum} ${css[`lvnum_s${fx.strength}`]} ${className}`} style={{ "--fx-glow": fx.glow }}>
            <span className={css.lvnum_glow} aria-hidden="true">{level}</span>
            <span className={css.lvnum_text} style={fx.text}>{level}</span>
            <span className={css.lvnum_shine} aria-hidden="true">
                <span className={css.lvnum_band}>
                    <span className={css.lvnum_band_text}>{level}</span>
                </span>
            </span>
            {sparkles && fx.strength >= 2 ? <Sparkles count={fx.strength === 3 ? 6 : 4} color={fx.spark} /> : null}
        </span>
    );
};

export const AchievementMedal = ({ id, tierIndex = -1, locked = false, size = 56 }) => {
    const Icon = ACHIEVEMENT_ICONS[id] ?? FaTrophy;
    const look = tierLook(tierIndex);
    return (
        <span
            className={`${css.medal} ${locked ? css.medal_locked : ""}`}
            style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 35% 28%, ${look.light} 0%, ${look.color} 52%, ${look.dark} 100%)`,
                border: `${Math.max(2, Math.round(size / 18))}px solid ${look.dark}`,
                boxShadow: locked ? "none" : `0 0 ${Math.round(size / 4)}px ${look.color}88`,
            }}
        >
            <Icon size={Math.round(size * 0.46)} aria-hidden="true" />
        </span>
    );
};

export const DifficultyChip = ({ difficulty }) => {
    const d = DIFFICULTIES[difficulty];
    return (
        <span className={css.difficulty} style={{ background: d.color }}>
            {d.label}
        </span>
    );
};

const LevelUpBurst = ({ pulse, variant }) =>
    pulse ? (
        <>
            <span key={`w${pulse}`} className={`${css.lvup_wave} ${css[`lvup_wave_${variant}`] ?? ""}`} aria-hidden="true" />
            <span key={`t${pulse}`} className={`${css.lvup_text} ${css[`lvup_text_${variant}`] ?? ""}`} aria-hidden="true">
                LEVEL UP!
            </span>
        </>
    ) : null;

export const LevelRing = ({ xpMV, size = 40, children }) => {
    const level = useLevelOf(xpMV);
    const fx = levelFx(level);
    const pulse = useLevelUpPulse(level);
    const angle = useTransform(xpMV, (x) => clamp01(levelInfo(x).progress) * 360);
    const right = useTransform(angle, (a) => Math.min(a, 180));
    const left = useTransform(angle, (a) => Math.max(0, a - 180));
    const rightShown = useTransform(angle, (a) => (a >= 179.5 ? 0 : 1));
    const leftShown = useTransform(angle, (a) => (a >= 359.5 ? 0 : 1));
    const fill = fx.ring ? { background: fx.ring } : undefined;
    return (
        <span className={`${css.ring} ${fx.strength ? css[`ring_s${fx.strength}`] : ""}`} style={{ width: size, height: size, "--fx-glow": fx.glow }}>
            {fx.strength ? <span className={css.ring_glow} style={fill} /> : null}
            <span className={css.ring_fill} style={fill} />
            <span className={css.ring_half_r}>
                <motion.span className={css.ring_cover} style={{ rotate: right, opacity: rightShown }} />
            </span>
            <span className={css.ring_half_l}>
                <motion.span className={css.ring_cover} style={{ rotate: left, opacity: leftShown }} />
            </span>
            <span className={css.ring_hole} />
            {fx.strength >= 2 ? (
                <span className={css.ring_orbit} style={{ color: fx.spark }}>
                    <span className={css.ring_orbit_spark} />
                    {fx.strength === 3 ? <span className={`${css.ring_orbit_spark} ${css.ring_orbit_spark_b}`} /> : null}
                </span>
            ) : null}
            <span key={`c${pulse}`} className={`${css.ring_center} ${pulse ? css.lvup_pop : ""}`}>{children}</span>
            <LevelUpBurst pulse={pulse} variant="ring" />
        </span>
    );
};

export const LevelCircle = ({ xpMV, size = "lg" }) => {
    const level = useLevelOf(xpMV);
    const fx = levelFx(level);
    const pulse = useLevelUpPulse(level);
    const remaining = useTransform(xpMV, (x) => {
        const info = levelInfo(x);
        return `${formatXp(info.need - info.into)} XP`;
    });
    return (
        <span
            className={`${css.circle} ${size === "lg" ? css.circle_lg : css.circle_md} ${fx.strength ? `${css.circle_fx} ${css[`circle_s${fx.strength}`]}` : ""}`}
            style={{ "--fx-glow": fx.glow }}
        >
            {fx.strength ? (
                <>
                    <span className={css.circle_aura} style={{ background: fx.ring }} aria-hidden="true" />
                    <span className={css.circle_face} aria-hidden="true" />
                    <span className={css.circle_ring} style={{ background: fx.ring }} aria-hidden="true" />
                    {fx.strength === 3 ? <span className={css.circle_ring2} style={{ background: fx.ring }} aria-hidden="true" /> : null}
                    {fx.strength >= 2 ? <Sparkles count={fx.strength === 3 ? 8 : 5} color={fx.spark} spread={1.02} size={0.5} /> : null}
                </>
            ) : null}
            <LevelUpBurst pulse={pulse} variant={size} />
            <span className={css.circle_label}>LEVEL</span>
            <span key={`n${pulse}`} className={`${css.circle_number_slot} ${pulse ? css.lvup_pop : ""}`}>
                <LevelNumber level={level} className={css.circle_number} sparkles={false} />
            </span>
            <span className={css.circle_need}>
                <motion.span>{remaining}</motion.span>
                <br />
                to Level {level + 1}
            </span>
        </span>
    );
};

const TICKS = [10, 20, 30, 40, 50, 60, 70, 80, 90];
const BAR_SPARKS = [6, 17, 29, 38, 51, 63, 72, 84, 93];

export const LevelBar = ({ xpMV, small = false, barRef = null }) => {
    const progress = useTransform(xpMV, (x) => clamp01(levelInfo(x).progress));
    const shift = useTransform(progress, (p) => `${-(1 - p) * 100}%`);
    const back = useTransform(progress, (p) => `${(1 - p) * 100}%`);
    const labelShift = useTransform(progress, (p) => `${-(1 - Math.max(0.05, Math.min(0.95, p))) * 100}%`);
    const pct = useTransform(progress, (p) => `${p < 1 ? Math.min(99, Math.round(p * 100)) : 100}%`);
    return (
        <span className={`${css.bar_block} ${small ? css.bar_sm : ""}`}>
            <span className={css.bar_pct_row}>
                <motion.span className={css.bar_pct_mover} style={{ x: labelShift }}>
                    <motion.span className={css.bar_pct}>{pct}</motion.span>
                </motion.span>
            </span>
            <span className={css.bar_frame}>
                <span className={css.bar_aura_clip} aria-hidden="true">
                    <motion.span className={css.bar_aura_move} style={{ x: shift }}>
                        <span className={css.bar_aura} />
                    </motion.span>
                </span>
                <span className={css.bar} ref={barRef}>
                    <span className={css.bar_ghost} />
                    <motion.span className={css.bar_reveal} style={{ x: shift }}>
                        <motion.span className={css.bar_fill} style={{ x: back }}>
                            <span className={css.bar_shine} />
                            {BAR_SPARKS.map((left, i) => (
                                <span
                                    key={left}
                                    className={css.bar_spark}
                                    style={{ left: `${left}%`, top: `${i % 2 ? 30 : 64}%`, animationDelay: `${((i * 0.31) % 1.4).toFixed(2)}s` }}
                                />
                            ))}
                        </motion.span>
                        <span className={css.bar_head} />
                    </motion.span>
                    {TICKS.map((tick) => (
                        <span key={tick} className={css.bar_tick} style={{ left: `${tick}%` }} />
                    ))}
                </span>
            </span>
        </span>
    );
};

export const XpNumbers = ({ xpMV }) => {
    const text = useTransform(xpMV, (x) => {
        const info = levelInfo(x);
        return `${formatXp(info.into)} / ${formatXp(info.need)} XP`;
    });
    const total = useTransform(xpMV, (x) => `Total: ${formatXp(x)} XP`);
    return (
        <span className={css.level_numbers}>
            <motion.span>{text}</motion.span>
            <motion.span>{total}</motion.span>
        </span>
    );
};
