import { useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView, useReducedMotion } from "framer-motion";
import css from "../SpecialModePage.module.css";
import { TIE_BANNER_COLOR, TIE_BANNER_GRADIENT } from "../logic/breakdownStyles.js";

const LETTER_SPRING = { type: "spring", stiffness: 420, damping: 18, mass: 0.8 };

const buildBurst = (count, reach) =>
    Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + ((i * 37) % 11) / 11;
        const distance = reach * (0.7 + ((i * 53) % 7) / 18);
        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance * 0.75,
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
    const color = tie ? TIE_BANNER_COLOR : team?.color ?? TIE_BANNER_COLOR;
    const gradient = tie ? TIE_BANNER_GRADIENT : team?.gradient ?? TIE_BANNER_GRADIENT;
    const chars = (tie ? "TIE" : "GG").split("");
    const burst = buildBurst(particles, size * 1.9);
    const letterHidden = (index) => ({
        opacity: 0,
        y: reduceMotion ? 0 : (tie ? index % 2 === 0 : index < Math.ceil(chars.length / 2)) ? -size * 0.45 : size * 0.45,
        scale: reduceMotion ? 1 : 0.7,
    });
    const shown = { opacity: 1, y: 0, scale: 1 };
    const animateLetters = !celebrate || started;

    return (
        <span ref={ref} className={css.series_banner} style={{ fontSize: size, "--banner-color": color }}>
            {effects ? (
                <>
                    <motion.span
                        className={css.series_banner_bloom}
                        style={{ background: `radial-gradient(closest-side, ${color}, transparent)` }}
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: [0, 0.5, 0], scale: [0.4, 1.15, 1.25] }}
                        transition={{ duration: 1.3, ease: "easeOut", times: [0, 0.35, 1] }}
                    />
                    {tie
                        ? [0, 1].map((i) => (
                            <motion.span
                                key={`ring-${i}`}
                                className={css.series_banner_ring}
                                initial={{ opacity: 0, scale: 0.35 }}
                                animate={{ opacity: [0, 0.55, 0], scale: [0.35, 1.25, 1.7] }}
                                transition={{ duration: 1.4, ease: "easeOut", delay: 0.25 + i * 0.35 }}
                            />
                        ))
                        : burst.map((piece, i) => (
                            <motion.span
                                key={`piece-${i}`}
                                className={css.series_banner_piece}
                                style={{
                                    background: gradient,
                                    width: `${0.13 * piece.size}em`,
                                    height: `${(piece.round ? 0.13 : 0.07) * piece.size}em`,
                                    borderRadius: piece.round ? "50%" : "0.03em",
                                }}
                                initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.4 }}
                                animate={{
                                    opacity: [0, 1, 1, 0],
                                    x: [0, piece.x * 0.85, piece.x],
                                    y: [0, piece.y * 0.85, piece.y + size * 0.35],
                                    rotate: [0, piece.rotate, piece.rotate * 2],
                                    scale: [0.4, 1, 0.8],
                                }}
                                transition={{ duration: 1.25, ease: "easeOut", delay: 0.28 + (i % 4) * 0.03, times: [0, 0.35, 1] }}
                            />
                        ))}
                </>
            ) : null}
            <span className={css.series_banner_text}>
                {[...chars, "!"].map((char, index) => (
                    <motion.span
                        key={`${index}-${char}`}
                        className={css.series_banner_letter}
                        style={{ backgroundImage: gradient }}
                        initial={celebrate ? (char === "!" ? { opacity: 0, scale: reduceMotion ? 1 : 0, y: 0 } : letterHidden(index)) : false}
                        animate={animateLetters ? shown : undefined}
                        transition={{
                            ...(reduceMotion ? { duration: 0.4 } : LETTER_SPRING),
                            delay: char === "!" ? 0.22 : index * 0.06,
                        }}
                    >
                        {char}
                    </motion.span>
                ))}
                {effects ? (
                    <motion.span
                        aria-hidden="true"
                        className={css.series_banner_shine}
                        initial={{ backgroundPosition: "160% 0" }}
                        animate={{ backgroundPosition: "-60% 0" }}
                        transition={{ duration: 0.75, ease: "easeInOut", delay: 0.6 }}
                    >
                        {chars.join("")}!
                    </motion.span>
                ) : null}
            </span>
        </span>
    );
};
