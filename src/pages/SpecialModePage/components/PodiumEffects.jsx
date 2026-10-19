// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import css from "../SpecialModePage.module.css";

const rnd = (i, k = 0) => {
    const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return v - Math.floor(v);
};

const STAR_CLIP = "polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)";

const Window = ({ start, end, children, className = css.podium_fx }) => (
    <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: Math.max(0.5, end - start), times: [0, 0.06, 0.9, 1], delay: start, ease: "easeInOut" }}
    >
        {children}
    </motion.div>
);

const Ring = ({ size, color, duration = 1.8, delay = 0, width = 2 }) => (
    <motion.span
        className={css.podium_fx_item}
        style={{ width: size, height: size, border: `${width}px solid ${color}`, borderRadius: "50%" }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.9], opacity: [0.7, 0] }}
        transition={{ duration, ease: "easeOut", repeat: Infinity, delay }}
    />
);

const Glow = ({ size, color, from = 0.25, to = 0.55, duration = 2.2 }) => (
    <motion.span
        className={css.podium_fx_item}
        style={{ width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, transparent 68%)` }}
        initial={{ opacity: from }}
        animate={{ opacity: [from, to, from], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration, ease: "easeInOut", repeat: Infinity }}
    />
);

const Rays = ({ size, color, duration, reverse = false }) => (
    <motion.span
        className={`${css.podium_fx_item} ${css.podium_fx_rays}`}
        style={{
            width: size,
            height: size,
            background: `repeating-conic-gradient(from 0deg, transparent 0deg 9deg, ${color} 9deg 15deg)`,
        }}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
    />
);

const Stars = ({ count, color, minRadius, maxRadius, minSize, maxSize, seed = 1, duration = 1.3 }) =>
    Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + rnd(i, seed) * 0.6;
        const radius = minRadius + rnd(i, seed + 1) * (maxRadius - minRadius);
        const size = minSize + rnd(i, seed + 2) * (maxSize - minSize);
        return (
            <motion.span
                key={`star-${i}`}
                className={css.podium_fx_item}
                style={{
                    width: size,
                    height: size,
                    left: Math.cos(angle) * radius,
                    top: Math.sin(angle) * radius * 0.8,
                    clipPath: STAR_CLIP,
                    background: `radial-gradient(circle, #ffffff 0%, ${color} 38%)`,
                }}
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 90] }}
                transition={{
                    duration,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 0.4 + rnd(i, seed + 3) * 0.9,
                    delay: rnd(i, seed + 4) * 1.5,
                }}
            />
        );
    });

const Embers = ({ count, color }) =>
    Array.from({ length: count }, (_, i) => {
        const x0 = (rnd(i, 7) - 0.5) * 100;
        const size = 4 + rnd(i, 8) * 4;
        return (
            <motion.span
                key={`ember-${i}`}
                className={css.podium_fx_item}
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, #ffffff 0%, ${color} 70%)`,
                    boxShadow: `0 0 6px ${color}`,
                }}
                initial={{ opacity: 0, x: x0, y: 30 }}
                animate={{
                    opacity: [0, 1, 0],
                    x: [x0, x0 + (rnd(i, 9) - 0.5) * 50],
                    y: [30, -140 - rnd(i, 10) * 70],
                    scale: [0.6, 1, 0.4],
                }}
                transition={{ duration: 2.2 + rnd(i, 11) * 1.3, ease: "easeOut", repeat: Infinity, delay: rnd(i, 12) * 2 }}
            />
        );
    });

const Bursts = ({ points, colors, sparks = 14 }) =>
    points.map((point, b) => (
        <span key={`burst-${b}`} className={css.podium_fx_origin} style={{ left: point.x, top: point.y }}>
            {Array.from({ length: sparks }, (_, i) => {
                const angle = (i / sparks) * Math.PI * 2;
                const reach = 50 + rnd(i, b + 20) * 30;
                return (
                    <motion.span
                        key={`spark-${i}`}
                        className={css.podium_fx_item}
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: colors[i % colors.length],
                            boxShadow: `0 0 6px ${colors[i % colors.length]}`,
                        }}
                        initial={{ opacity: 0, x: 0, y: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            x: [0, Math.cos(angle) * reach],
                            y: [0, Math.sin(angle) * reach + 12],
                            scale: [1, 0.9, 0.3],
                        }}
                        transition={{ duration: 1.1, ease: "easeOut", repeat: Infinity, repeatDelay: 1.5, delay: point.delay }}
                    />
                );
            })}
        </span>
    ));

export const PodiumEffect = ({ kind, color, originTop, start, end }) => {
    const teamColor = color ?? "#ffffff";

    return (
        <Window start={start} end={end}>
            <span className={css.podium_fx_origin} style={{ top: originTop }}>
                {kind === "fourthPlace" ? (
                    <>
                        <Glow size={150} color="rgba(79, 179, 255, 0.45)" from={0.2} to={0.5} />
                        <Ring size={64} color="#4fb3ff" />
                        <Ring size={64} color={teamColor} delay={0.9} />
                        <Embers count={18} color="#4fb3ff" />
                    </>
                ) : kind === "thirdPlace" ? (
                    <>
                        <Glow size={210} color="rgba(222, 120, 30, 0.6)" from={0.35} to={0.75} />
                        <Ring size={80} color="#e8892b" duration={2} />
                        <Stars count={16} color="#e07b1f" minRadius={48} maxRadius={105} minSize={13} maxSize={23} seed={3} />
                    </>
                ) : kind === "runnerUp" ? (
                    <>
                        <Rays size={300} color="rgba(214, 218, 232, 0.75)" duration={16} />
                        <Glow size={190} color="rgba(255, 255, 255, 0.9)" from={0.3} to={0.7} />
                        <Ring size={96} color="#e7e7e7" duration={2.2} />
                        <Stars count={8} color="#c9cdd9" minRadius={70} maxRadius={120} minSize={12} maxSize={20} seed={5} duration={1.6} />
                    </>
                ) : (
                    <>
                        <Rays size={440} color="rgba(255, 215, 0, 0.55)" duration={24} reverse />
                        <Glow size={260} color="rgba(255, 223, 90, 0.9)" from={0.35} to={0.8} />
                        <Ring size={130} color="#ffd700" duration={2} width={3} />
                        <Stars count={10} color="#ffd700" minRadius={90} maxRadius={150} minSize={14} maxSize={24} seed={9} />
                        <Bursts
                            points={[
                                { x: -150, y: -70, delay: 0.2 },
                                { x: 160, y: -100, delay: 0.85 },
                                { x: 0, y: -175, delay: 1.5 },
                            ]}
                            colors={["#ffd700", teamColor, "#fff4b5"]}
                        />
                    </>
                )}
            </span>
        </Window>
    );
};

export const ConfettiRain = ({ start, end, colors, count = 48 }) => (
    <Window start={start} end={end} className={css.podium_confetti}>
        {Array.from({ length: count }, (_, i) => {
            const sway = (rnd(i, 30) - 0.5) * 80;
            const round = i % 4 === 0;
            const size = 7 + rnd(i, 31) * 6;
            return (
                <motion.span
                    key={`confetti-${i}`}
                    className={css.podium_confetti_piece}
                    style={{
                        left: `${rnd(i, 32) * 100}%`,
                        width: size,
                        height: round ? size : size * 0.45,
                        borderRadius: round ? "50%" : 2,
                        background: colors[i % colors.length],
                    }}
                    initial={{ y: "-8vh", x: 0, rotate: 0 }}
                    animate={{ y: ["-8vh", "108vh"], x: [0, sway, -sway * 0.6, sway * 0.3], rotate: [0, 360 + rnd(i, 33) * 540] }}
                    transition={{ duration: 3.6 + rnd(i, 34) * 2.6, ease: "linear", repeat: Infinity, delay: rnd(i, 35) * 3.2 }}
                />
            );
        })}
    </Window>
);
