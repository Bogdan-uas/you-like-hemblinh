import { useEffect, useMemo, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import css from "./PemHud.module.css";
import { PemCircle, PemTrophy } from "./PemParts.jsx";
import { isFreshPemSeries } from "./pemHud.js";

const SHEET_W = 1040;
const SHEET_H = 430;
const FPS = 12;
const FRAME = 1 / FPS;
const COLS = 11;
const ROWS = 6;
const BALL_R = 92;

const seeded = (seed) => () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
};

const random = seeded(31);

const MESH = Array.from({ length: ROWS }, (_, j) =>
    Array.from({ length: COLS }, (_, i) => {
        const edgeX = i === 0 || i === COLS - 1;
        const edgeY = j === 0 || j === ROWS - 1;
        const flatX = (i / (COLS - 1)) * 100 + (edgeX ? (i === 0 ? 1 : -1) * random() * 2.4 : (random() - 0.5) * 3);
        const flatY = (j / (ROWS - 1)) * 100 + (edgeY ? (j === 0 ? 1 : -1) * random() * 3.2 : (random() - 0.5) * 5);
        const u = (i / (COLS - 1)) * 2 - 1;
        const v = (j / (ROWS - 1)) * 2 - 1;
        const angle = Math.atan2(v, u) + (random() - 0.5) * 0.9;
        const reach = Math.min(1, Math.hypot(u, v)) * (0.55 + random() * 0.6);
        const ballX = 50 + (Math.cos(angle) * reach * BALL_R * 100) / SHEET_W;
        const ballY = 50 + (Math.sin(angle) * reach * BALL_R * 100) / SHEET_H;
        return { flatX, flatY, ballX, ballY };
    })
);

const TRIANGLES = (() => {
    const list = [];
    for (let j = 0; j < ROWS - 1; j++) {
        for (let i = 0; i < COLS - 1; i++) {
            const a = [j, i];
            const b = [j, i + 1];
            const c = [j + 1, i + 1];
            const d = [j + 1, i];
            const flip = random() < 0.5;
            list.push({ points: flip ? [a, b, c] : [a, b, d], shade: random() * 2 - 1 });
            list.push({ points: flip ? [a, c, d] : [b, c, d], shade: random() * 2 - 1 });
        }
    }
    return list;
})();

const BOUNDARY = [
    ...Array.from({ length: COLS }, (_, i) => [0, i]),
    ...Array.from({ length: ROWS - 2 }, (_, j) => [j + 1, COLS - 1]),
    ...Array.from({ length: COLS }, (_, i) => [ROWS - 1, COLS - 1 - i]),
    ...Array.from({ length: ROWS - 2 }, (_, j) => [ROWS - 2 - j, 0]),
];

const smooth = (t) => t * t * (3 - 2 * t);

const meshAt = (t, frameIndex) => {
    const jitter = seeded(1000 + frameIndex);
    const k = smooth(t);
    const wobble = 0.35 + (1 - k) * 2.4;
    return MESH.map((row) =>
        row.map(({ flatX, flatY, ballX, ballY }) => [
            ballX + (flatX - ballX) * k + (jitter() - 0.5) * wobble,
            ballY + (flatY - ballY) * k + (jitter() - 0.5) * wobble * 2.4,
        ])
    );
};

const UNFOLD = [0.06, 0.16, 0.3, 0.46, 0.62, 0.78, 0.9, 1];

const PHASES = (() => {
    const phases = [];
    const add = (duration, t, content) => phases.push({ duration, t, content });
    add(0.42, 0, 0);
    UNFOLD.forEach((t) => add(FRAME, t, 0));
    [0.35, 0.7, 1].forEach((o) => add(FRAME, 1, o));
    add(1.55, 1, 1);
    [0.5, 0].forEach((o) => add(FRAME, 1, o));
    [...UNFOLD].reverse().slice(1).forEach((t) => add(FRAME, t, 0));
    add(FRAME, 0, 0);
    add(0.8, 0, 0);
    let start = 0;
    phases.forEach((phase) => {
        phase.start = start;
        start += phase.duration;
    });
    return { list: phases, total: start };
})();

const phaseAt = (elapsed) => PHASES.list.find((phase) => elapsed < phase.start + phase.duration) ?? PHASES.list[PHASES.list.length - 1];

const toPercent = ([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`;

const shadeFill = (shade, strength) => {
    const amount = Math.abs(shade) * strength;
    return shade > 0 ? `rgba(255, 255, 255, ${(amount * 0.75).toFixed(3)})` : `rgba(58, 48, 30, ${(amount * 0.6).toFixed(3)})`;
};

const PaperMesh = ({ mesh, t }) => {
    const strength = 0.12 + (1 - smooth(t)) * 0.88;
    return (
        <svg className={css.clay_mesh} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {TRIANGLES.map(({ points, shade }, index) => (
                <polygon
                    key={index}
                    points={points.map(([j, i]) => mesh[j][i].map((n) => n.toFixed(2)).join(",")).join(" ")}
                    fill={shadeFill(shade, strength)}
                    stroke={`rgba(58, 48, 30, ${(0.05 + strength * 0.22).toFixed(3)})`}
                    strokeWidth="0.25"
                    vectorEffect="non-scaling-stroke"
                />
            ))}
        </svg>
    );
};

export function ClayIntro({ seriesState, eventName, eventNumber, stageText, setsToWin, pemType, onDone }) {
    const [open, setOpen] = useState(() => isFreshPemSeries(seriesState));
    const [tick, setTick] = useState(0);
    const startRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        startRef.current = performance.now();
        const interval = setInterval(() => {
            const elapsed = (performance.now() - startRef.current) / 1000;
            if (elapsed >= PHASES.total) {
                setOpen(false);
                return;
            }
            setTick(Math.floor(elapsed * FPS));
        }, 1000 / FPS / 2);
        return () => clearInterval(interval);
    }, [open]);

    useEffect(() => {
        if (!open) onDone?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const phase = phaseAt(tick / FPS);
    const mesh = useMemo(() => meshAt(phase.t, tick), [phase.t, tick]);
    const clipPath = `polygon(${BOUNDARY.map(([j, i]) => toPercent(mesh[j][i])).join(", ")})`;
    const landed = 0.42 / PHASES.total;
    const dropOut = (PHASES.total - 0.8) / PHASES.total;

    return (
        <AnimatePresence onExitComplete={onDone}>
            {open ? (
                <motion.div
                    key="clay-intro"
                    className={`${css.hud} ${css.theme_gpl} ${css.clay}`}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.25 } }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className={css.clay_drop}
                        initial={{ y: "-80vh", rotate: -32 }}
                        animate={{ y: ["-80vh", "0vh", "0vh", "95vh"], rotate: [-32, 0, 0, 38] }}
                        transition={{ duration: PHASES.total, times: [0, landed, dropOut, 1], ease: [[0.3, 1.45, 0.55, 1], "linear", [0.55, 0, 0.85, 0.4]] }}
                    >
                        <div className={css.clay_sheet} style={{ clipPath }}>
                            <PaperMesh mesh={mesh} t={phase.t} />
                            <div className={css.clay_content} style={{ opacity: phase.content }}>
                                <span className={css.clay_badge}>
                                    <PemTrophy type={pemType} size={54} />
                                </span>
                                <span className={css.clay_event}>
                                    {eventName}
                                    <span className={css.event_number}>{eventNumber}</span>
                                </span>
                                <span className={css.clay_stage}>{stageText}</span>
                                <div className={css.clay_teams}>
                                    {["left", "right"].map((side) => {
                                        const team = side === "left" ? seriesState.leftTeam : seriesState.rightTeam;
                                        return (
                                            <div key={side} className={`${css.clay_team} ${side === "right" ? css.clay_team_right : ""}`}>
                                                <PemCircle team={team} className={css.clay_circle} />
                                                <span className={css.clay_name}>Team {team?.name}</span>
                                            </div>
                                        );
                                    })}
                                    <span className={css.clay_vs}>VS</span>
                                </div>
                                <span className={css.clay_format}>Best of {setsToWin * 2 - 1}</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
