import { useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView, useReducedMotion } from "framer-motion";
import css from "../SpecialModePage.module.css";
import { TIE_BANNER_COLOR, TIE_BANNER_GRADIENT } from "../logic/breakdownStyles.js";

const LETTER_STAGGER = 0.11;
const LETTER_DURATION = 0.5;
const LETTER_TIMES = [0, 0.55, 0.78, 1];
const MARK_DURATION = 0.55;
const MARK_PEAK = 0.45;

const buildBurst = (count, reach, flat) =>
    Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + ((i * 37) % 11) / 11;
        const distance = reach * (0.7 + ((i * 53) % 7) / 18);
        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance * (flat ? 0.45 : 0.75),
            angle: (angle * 180) / Math.PI,
            rotate: ((i * 71) % 180) - 90,
            size: 0.6 + ((i * 29) % 5) / 10,
            round: i % 3 === 0,
        };
    });

export const SeriesBanner = ({ tie = false, team, size = 72, celebrate = true, playOnView = false, particles = 14 }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.6 });
    const reduceMotion = useReducedMotion();
    const started = playOnView ? inView : true;
    const effects = celebrate && !reduceMotion && started;
    const play = celebrate && !reduceMotion;
    const animateLetters = !celebrate || started;
    const color = tie ? TIE_BANNER_COLOR : team?.color ?? TIE_BANNER_COLOR;
    const gradient = tie ? TIE_BANNER_GRADIENT : team?.gradient ?? TIE_BANNER_GRADIENT;
    const chars = (tie ? "TIE" : "GG").split("");
    const markDelay = (chars.length - 1) * LETTER_STAGGER + LETTER_DURATION * 0.62;
    const impact = markDelay + MARK_DURATION * MARK_PEAK;
    const burst = buildBurst(particles, size * (tie ? 2.1 : 1.9), tie);
    const shake = size * 0.05;
    const drop = size * 0.8;

    const letterMotion = (index) => {
        const fromTop = index % 2 === 0;
        const dir = fromTop ? -1 : 1;
        if (!play) {
            return {
                initial: celebrate ? { opacity: 0 } : false,
                animate: animateLetters ? { opacity: 1 } : undefined,
                transition: { duration: 0.4, delay: index * LETTER_STAGGER },
                origin: "50% 50%",
            };
        }
        return {
            initial: { opacity: 0, y: dir * drop, scaleX: 0.78, scaleY: 1.4, filter: "blur(5px)" },
            animate: animateLetters
                ? {
                    opacity: [0, 1, 1, 1],
                    y: [dir * drop, -dir * size * 0.05, dir * size * 0.02, 0],
                    scaleX: [0.78, 1.2, 0.96, 1],
                    scaleY: [1.4, 0.76, 1.05, 1],
                    filter: ["blur(5px)", "blur(0px)", "blur(0px)", "blur(0px)"],
                    transitionEnd: { filter: "none" },
                }
                : undefined,
            transition: {
                duration: LETTER_DURATION,
                ease: ["easeIn", "easeOut", "easeInOut"],
                times: LETTER_TIMES,
                delay: index * LETTER_STAGGER,
            },
            origin: fromTop ? "50% 100%" : "50% 0%",
        };
    };

    const markMotion = play
        ? {
            initial: { opacity: 0, scale: 0, rotate: -220 },
            animate: animateLetters
                ? { opacity: [0, 1, 1, 1], scale: [0, 1.5, 0.88, 1], rotate: [-220, 18, -8, 0] }
                : undefined,
            transition: { duration: MARK_DURATION, ease: "easeOut", times: [0, MARK_PEAK, 0.75, 1], delay: markDelay },
        }
        : {
            initial: celebrate ? { opacity: 0 } : false,
            animate: animateLetters ? { opacity: 1 } : undefined,
            transition: { duration: 0.4, delay: chars.length * LETTER_STAGGER },
        };

    return (
        <span ref={ref} className={css.series_banner} style={{ fontSize: size, "--banner-color": color }}>
            {effects ? (
                <>
                    <motion.span
                        className={css.series_banner_bloom}
                        style={{ background: `radial-gradient(closest-side, ${color}, transparent)` }}
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: [0, 0.55, 0], scale: [0.4, 1.15, 1.3] }}
                        transition={{ duration: 1.2, ease: "easeOut", times: [0, 0.3, 1], delay: impact - 0.08 }}
                    />
                    {(tie ? [0, 1] : [0]).map((i) => (
                        <motion.span
                            key={`ring-${i}`}
                            className={css.series_banner_ring}
                            style={{ borderColor: color }}
                            initial={{ opacity: 0, scale: 0.35 }}
                            animate={{ opacity: [0, 0.7, 0], scale: [0.35, 1.4, 1.9] }}
                            transition={{ duration: 0.75, ease: "easeOut", times: [0, 0.25, 1], delay: impact + i * 0.16 }}
                        />
                    ))}
                    {burst.map((piece, i) => (
                        <motion.span
                            key={`piece-${i}`}
                            className={css.series_banner_piece}
                            style={tie
                                ? {
                                    background: gradient,
                                    width: `${0.2 * piece.size}em`,
                                    height: "0.04em",
                                    borderRadius: "0.02em",
                                }
                                : {
                                    background: gradient,
                                    width: `${0.13 * piece.size}em`,
                                    height: `${(piece.round ? 0.13 : 0.07) * piece.size}em`,
                                    borderRadius: piece.round ? "50%" : "0.03em",
                                }}
                            initial={{ opacity: 0, x: 0, y: 0, rotate: tie ? piece.angle : 0, scale: 0.4 }}
                            animate={tie
                                ? {
                                    opacity: [0, 1, 0],
                                    x: [0, piece.x * 0.8, piece.x],
                                    y: [0, piece.y * 0.8, piece.y],
                                    scale: [0.4, 1, 0.5],
                                }
                                : {
                                    opacity: [0, 1, 1, 0],
                                    x: [0, piece.x * 0.85, piece.x],
                                    y: [0, piece.y * 0.85, piece.y + size * 0.35],
                                    rotate: [0, piece.rotate, piece.rotate * 2],
                                    scale: [0.4, 1, 0.8],
                                }}
                            transition={{
                                duration: tie ? 0.7 : 1.25,
                                ease: "easeOut",
                                delay: impact + (i % 4) * 0.02,
                                times: tie ? [0, 0.3, 1] : [0, 0.35, 1],
                            }}
                        />
                    ))}
                </>
            ) : null}
            <motion.span
                className={css.series_banner_text}
                initial={false}
                animate={effects ? { x: [0, -shake, shake * 0.8, -shake * 0.5, shake * 0.25, 0] } : undefined}
                transition={{ duration: 0.38, ease: "easeOut", delay: impact }}
            >
                {chars.map((char, index) => {
                    const m = letterMotion(index);
                    return (
                        <motion.span
                            key={`${index}-${char}`}
                            className={css.series_banner_letter}
                            style={{ backgroundImage: gradient, transformOrigin: m.origin }}
                            initial={m.initial}
                            animate={m.animate}
                            transition={m.transition}
                        >
                            {char}
                        </motion.span>
                    );
                })}
                <span className={css.series_banner_mark}>
                    {effects ? (
                        <motion.span
                            aria-hidden="true"
                            className={css.series_banner_sparkle}
                            style={{ background: `radial-gradient(circle, #ffffff 0%, ${color} 55%, transparent 75%)` }}
                            initial={{ opacity: 0, scale: 0, rotate: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0, 1.25, 0.2], rotate: [0, 45, 90] }}
                            transition={{ duration: 0.6, ease: "easeOut", times: [0, 0.35, 1], delay: impact - 0.1 }}
                        />
                    ) : null}
                    <motion.span
                        className={css.series_banner_letter}
                        style={{ backgroundImage: gradient, transformOrigin: "50% 70%" }}
                        initial={markMotion.initial}
                        animate={markMotion.animate}
                        transition={markMotion.transition}
                    >
                        !
                    </motion.span>
                </span>
                {effects ? (
                    <motion.span
                        aria-hidden="true"
                        className={css.series_banner_shine}
                        initial={{ backgroundPosition: "160% 0" }}
                        animate={{ backgroundPosition: "-60% 0" }}
                        transition={{ duration: 0.7, ease: "easeInOut", delay: impact + 0.35 }}
                    >
                        {chars.join("")}!
                    </motion.span>
                ) : null}
            </motion.span>
        </span>
    );
};
