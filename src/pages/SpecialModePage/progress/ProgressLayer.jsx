import { useEffect, useMemo, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import css from "./Progress.module.css";
import { PROGRESS_VERSION, TIERS, achievementById, isTiered } from "./progressConfig.js";
import {
    closeProgressScreen,
    openProgressScreen,
    progressCompleteQueueItem,
    progressRecheck,
    progressRunBackfill,
    progressRunCatchUp,
    unseenAchievementIds,
    useProgress,
} from "./progressStore.js";
import { AchievementMedal, DifficultyChip, LevelBar, LevelCircle, LevelNumber, LevelRing, WaapiParticles } from "./ProgressParts.jsx";
import { formatXp, tierLook, useLevelOf } from "./progressUi.js";
import { LevelUpOverlay } from "./LevelUpOverlay.jsx";
import { ProgressScreen } from "./ProgressScreen.jsx";
import { XpSummaryScreen } from "./XpSummaryScreen.jsx";
import { readHallOfFame } from "../logic/hallOfFameDb.js";
import { useSpecialModeSettings } from "../logic/settings.js";
import { barTargetOf, bridge, centerOf, flyToken, launchSouls, tweenXp, wait } from "./progressMotion.js";

const SOURCE_LABELS = {
    series: "Series played",
    pickem: "Pick'em points",
    upset: "Upset pick",
    longShot: "Long shot",
    comeback: "Comeback",
    sweep: "Sweep",
    decider: "Down to the wire",
    grandFinal: "Grand Final",
    overtime: "Overtime",
    extendedRounds: "Extended Rounds",
    penalties: "Penalties",
    bagel: "Bagel",
    streak: "Pick streak",
    daily: "Daily warm-up",
    boost: "XP boost",
    finish: "Tournament finished",
    pickemWon: "Pick'em challenge won",
    margin: "Pick'em margin",
    pickemStreak: "Pick'em win streak",
    champion: "Champion guessed",
    perfectRound: "Perfect round",
    flawless: "Flawless Pick'em",
    firstTime: "First time",
    anniversary: "Anniversary tournament",
    achievementBoost: "Achievement boost",
};

const LEVEL_UP_DELAY_MS = 1100;

const SOUL_CLASSES = { soul: css.soul, wisp: css.soul_wisp, impact: css.soul_impact, spark: css.soul_spark, label: css.soul_label };

const BURST = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const distance = 110 + ((i * 37) % 70);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, size: 6 + ((i * 13) % 7), delay: 0.32 + ((i * 7) % 10) / 100 };
});

const aggregateGains = (gains) => {
    const order = [];
    const bySource = new Map();
    gains.forEach((gain) => {
        const entry = bySource.get(gain.source);
        if (entry) {
            entry.xp += gain.xp;
            entry.count += 1;
        } else {
            const fresh = { key: gain.source, label: gain.label, xp: gain.xp, count: 1 };
            bySource.set(gain.source, fresh);
            order.push(fresh);
        }
    });
    return order.map((entry) => ({
        ...entry,
        label: entry.count > 1 ? `${SOURCE_LABELS[entry.key] ?? entry.label} ×${entry.count}` : entry.label,
    }));
};

function SoulLayer() {
    const ref = useRef(null);

    useEffect(() => {
        bridge.token = (token) => launchSouls(ref.current, SOUL_CLASSES, token);
        return () => {
            bridge.token = null;
        };
    }, []);

    return <div ref={ref} className={css.token_layer} aria-hidden="true" />;
}

function AchievementPop({ gain }) {
    const unlock = gain.unlock;
    const a = achievementById[unlock.id];
    const tierIndex = unlock.tier;
    const tier = tierIndex >= 0 ? TIERS[tierIndex] : null;
    const look = tierLook(tierIndex);
    const upgraded = tierIndex > 0;
    const previous = upgraded ? TIERS[tierIndex - 1] : null;
    const word = tier ? tier.label.toUpperCase() : "UNLOCKED";
    const text = isTiered(a) ? a.text(a.tiers[tierIndex]) : a.text();
    const landAt = upgraded ? 0.95 : 0.4;
    const burst = useMemo(
        () => [
            ...[0, 0.14, 0.28].map((d, i) => ({
                className: css.ach_wave,
                frames: [
                    { transform: "scale(0.7)", opacity: 0 },
                    { transform: "scale(0.78)", opacity: 0.9, offset: 0.06 },
                    { transform: `scale(${2.6 + i * 0.5})`, opacity: 0 },
                ],
                timing: { duration: 900, delay: (landAt + d) * 1000, easing: "cubic-bezier(.2,.7,.3,1)" },
            })),
            ...BURST.map((p, i) => ({
                className: css.ach_particle,
                css: { width: p.size, height: p.size, background: i % 3 ? look.color : look.light },
                frames: [
                    { transform: "translate(0px, 0px) scale(0.4)", opacity: 0 },
                    { transform: `translate(${p.x * 0.55}px, ${p.y * 0.55}px) scale(1)`, opacity: 1, offset: 0.3 },
                    { transform: `translate(${p.x}px, ${p.y}px) scale(0.3)`, opacity: 0 },
                ],
                timing: { duration: 950, delay: (landAt + p.delay - 0.3) * 1000, easing: "cubic-bezier(.2,.7,.3,1)" },
            })),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return (
        <motion.div className={css.ach_stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <span className={css.ach_backdrop} />
            <motion.div
                className={css.ach_pop}
                style={{ "--tier": look.color, "--tier-dark": look.dark, "--tier-light": look.light }}
                initial={{ opacity: 0, y: 46, scale: 0.86 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -26, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <motion.span
                    className={css.ach_shake}
                    initial={{ x: 0, y: 0 }}
                    animate={{ x: [0, -7, 6, -4, 2, 0], y: [0, 3, -2, 1, 0, 0] }}
                    transition={{ duration: 0.42, delay: landAt, ease: "easeOut" }}
                >
                    <span className={css.ach_rays} aria-hidden="true" />
                    <motion.span
                        className={css.ach_flash}
                        aria-hidden="true"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.85, 0] }}
                        transition={{ duration: 0.5, delay: landAt, times: [0, 0.2, 1] }}
                    />
                    <span className={css.ach_kicker}>{upgraded ? "Achievement upgraded" : "Achievement unlocked"}</span>
                    <span className={css.ach_medal_wrap}>
                        <WaapiParticles items={burst} />
                        {upgraded ? (
                            <motion.span
                                className={css.ach_medal_slot}
                                initial={{ scale: 0.6, opacity: 0, rotateY: 0 }}
                                animate={{ scale: [0.6, 1, 1], opacity: [0, 1, 0], rotateY: [0, 0, 90] }}
                                transition={{ duration: 0.75, delay: 0.1, times: [0, 0.4, 1] }}
                            >
                                <AchievementMedal id={unlock.id} tierIndex={tierIndex - 1} size={104} />
                            </motion.span>
                        ) : null}
                        <motion.span
                            className={css.ach_medal_slot}
                            data-ach-medal
                            initial={upgraded ? { rotateY: -90, opacity: 0, scale: 1 } : { scale: 3, rotate: -32, opacity: 0 }}
                            animate={upgraded ? { rotateY: 0, opacity: 1, scale: [1, 1.18, 1] } : { scale: 1, rotate: 0, opacity: 1 }}
                            transition={upgraded ? { duration: 0.5, delay: 0.85, ease: [0.22, 1, 0.36, 1] } : { type: "spring", stiffness: 380, damping: 14, delay: 0.12 }}
                        >
                            <AchievementMedal id={unlock.id} tierIndex={tierIndex} size={104} />
                            <span className={css.ach_medal_shine} aria-hidden="true">
                                <span />
                            </span>
                        </motion.span>
                    </span>
                    <span className={css.ach_name}>{a.name}</span>
                    <span className={css.ach_tier} style={{ color: look.dark }}>
                        {word.split("").map((ch, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 22, scale: 2 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: landAt + 0.22 + i * 0.05, type: "spring", stiffness: 420, damping: 16 }}
                            >
                                {ch}
                            </motion.span>
                        ))}
                    </span>
                    {upgraded ? <span className={css.ach_from}>from {previous.label}</span> : null}
                    {isTiered(a) ? (
                        <span className={css.ach_pips}>
                            {TIERS.slice(0, a.tiers.length).map((t, i) => (
                                <motion.span
                                    key={t.key}
                                    className={css.pip}
                                    style={i <= tierIndex ? { background: t.color, borderColor: t.dark } : undefined}
                                    initial={i === tierIndex ? { scale: 0 } : false}
                                    animate={i === tierIndex ? { scale: [0, 1.7, 1] } : undefined}
                                    transition={i === tierIndex ? { delay: landAt + 0.55, duration: 0.45 } : undefined}
                                />
                            ))}
                        </span>
                    ) : null}
                    <span className={css.ach_text}>{text}</span>
                    <span className={css.ach_row}>
                        <DifficultyChip difficulty={a.difficulty} />
                        <span className={css.chip_xp} data-ach-xp>+{formatXp(gain.xp)} XP</span>
                    </span>
                </motion.span>
            </motion.div>
        </motion.div>
    );
}

function useQueueRunner({ xpMV, barRef, setWidget, setChips, setAchievement, chipRefs }) {
    const { progress, ui } = useProgress();
    const runningRef = useRef(null);
    const closeTimerRef = useRef(null);
    const widgetOpenRef = useRef(false);
    const blocked = !!(ui.summary || ui.catchUp);

    const openWidget = async () => {
        clearTimeout(closeTimerRef.current);
        if (widgetOpenRef.current) return;
        widgetOpenRef.current = true;
        setWidget(true);
        await wait(420);
    };

    useEffect(() => {
        if (runningRef.current || blocked) return;
        if (!ui.queue.length) {
            if (!runningRef.current) xpMV.set(ui.displayXp);
            if (widgetOpenRef.current) {
                clearTimeout(closeTimerRef.current);
                closeTimerRef.current = setTimeout(() => {
                    widgetOpenRef.current = false;
                    setWidget(false);
                }, 900);
            }
            return;
        }
        const item = ui.queue[0];
        runningRef.current = item.key;
        const speed = ui.queue.length > 3 ? 2.2 : ui.queue.length > 1 ? 1.4 : 1;
        const run = async () => {
            xpMV.set(item.fromXp);
            if (item.type === "xp") {
                await openWidget();
                const chips = aggregateGains(item.gains).slice(-6);
                setChips(chips.map((chip) => ({ ...chip, state: "wait" })));
                await wait(260 / speed);
                let cursor = item.fromXp;
                for (let i = 0; i < chips.length; i++) {
                    setChips((list) => list.map((c, j) => (j === i ? { ...c, state: "fly" } : c)));
                    const from = centerOf(chipRefs.current[i]);
                    await flyToken({ from, to: barTargetOf(barRef.current, cursor), text: `+${formatXp(chips[i].xp)} XP`, duration: 0.55 / speed });
                    const next = i === chips.length - 1 ? item.toXp : cursor + chips[i].xp;
                    await tweenXp(xpMV, cursor, next, { speed });
                    cursor = next;
                    setChips((list) => list.map((c, j) => (j === i ? { ...c, state: "done" } : c)));
                }
                await wait(380 / speed);
                setChips([]);
            } else {
                setAchievement(item.gain);
                await wait((item.gain.unlock?.tier > 0 ? 2250 : 1850) / speed);
                await openWidget();
                const from = centerOf(document.querySelector("[data-ach-medal]"));
                const to = barTargetOf(barRef.current, item.fromXp);
                await flyToken({ from, to, text: `+${formatXp(item.gain.xp)} XP`, duration: 0.7 / speed, count: 7 });
                await tweenXp(xpMV, item.fromXp, item.toXp, { speed });
                await wait(700 / speed);
                setAchievement(null);
                await wait(320);
            }
        };
        run().finally(() => {
            runningRef.current = null;
            progressCompleteQueueItem(item.key);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ui.queue, blocked, ui.displayXp, progress.xp]);
}

export function ProgressLayer() {
    const { progress, ui } = useProgress();
    const { closeWithEscape } = useSpecialModeSettings();
    const xpMV = useMotionValue(ui.displayXp);
    const level = useLevelOf(xpMV);
    const [widget, setWidget] = useState(false);
    const [chips, setChips] = useState([]);
    const [achievement, setAchievement] = useState(null);
    const [levelUp, setLevelUp] = useState(null);
    const barRef = useRef(null);
    const chipRefs = useRef([]);
    const unseen = unseenAchievementIds(progress).length;

    useEffect(() => {
        bridge.levelUp = (next) =>
            new Promise((resolve) => {
                setTimeout(() => setLevelUp({ level: next, resolve, id: Date.now() }), LEVEL_UP_DELAY_MS);
            });
        return () => {
            bridge.levelUp = null;
        };
    }, []);

    useEffect(() => {
        if (progress.catchUpDone && (progress.v ?? 1) >= PROGRESS_VERSION) {
            progressRecheck();
            return;
        }
        const run = progress.catchUpDone ? progressRunBackfill : progressRunCatchUp;
        readHallOfFame()
            .then((records) => run(records))
            .catch(() => run([]))
            .finally(() => progressRecheck());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!ui.screen || !closeWithEscape) return undefined;
        const onKey = (e) => {
            if (e.key === "Escape") closeProgressScreen();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [ui.screen, closeWithEscape]);

    useQueueRunner({ xpMV, barRef, setWidget, setChips, setAchievement, chipRefs });

    return (
        <>
            <button
                type="button"
                className={`${css.level_button} ${ui.screen ? css.level_button_open : ""}`}
                aria-label={`Level ${level}${unseen ? `, ${unseen} new achievements` : ""}. Open the Level and Achievements`}
                title={unseen ? `Level ${level} · ${unseen} new achievement${unseen === 1 ? "" : "s"}` : `Level ${level}`}
                onClick={() => (ui.screen ? closeProgressScreen() : openProgressScreen(unseen ? "achievements" : "level"))}
            >
                <LevelRing xpMV={xpMV} size={40}>
                    <span className={css.button_lv}>LVL</span>
                    <LevelNumber level={level} className={`${css.button_level} ${level >= 1000 ? css.button_level_d4 : level >= 100 ? css.button_level_d3 : ""}`} sparkles={false} />
                </LevelRing>
                {unseen ? <span className={css.button_new}>{unseen > 9 ? "9+" : unseen}</span> : null}
            </button>

            <AnimatePresence>
                {widget ? (
                    <motion.div
                        key="widget"
                        className={css.widget}
                        initial={{ opacity: 0, scale: 0.35, y: -16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.35, y: -16 }}
                        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <LevelCircle xpMV={xpMV} size="md" />
                        <span className={css.widget_side}>
                            <LevelBar xpMV={xpMV} small barRef={barRef} />
                        </span>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <div className={css.chips}>
                <AnimatePresence>
                    {chips.map((chip, i) => (
                        <motion.span
                            key={`${chip.key}-${i}`}
                            className={`${css.chip} ${chip.state === "fly" ? css.chip_flying : ""}`}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: chip.state === "done" ? 0.35 : 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.28, delay: chip.state === "wait" ? i * 0.06 : 0 }}
                        >
                            {chip.label}
                            <span
                                className={css.chip_xp}
                                ref={(el) => {
                                    chipRefs.current[i] = el;
                                }}
                            >
                                +{formatXp(chip.xp)} XP
                            </span>
                        </motion.span>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>{achievement ? <AchievementPop key={achievement.id} gain={achievement} /> : null}</AnimatePresence>

            {ui.screen ? <ProgressScreen tab={ui.screen} /> : null}
            {ui.summary ? <XpSummaryScreen key={ui.summary.data.id} mode="event" data={ui.summary.data} replay={!!ui.summary.replay} /> : null}
            {ui.catchUp ? <XpSummaryScreen key="catch-up" mode="catchUp" data={ui.catchUp} /> : null}

            <SoulLayer />

            <AnimatePresence>
                {levelUp ? (
                    <LevelUpOverlay
                        key={levelUp.id}
                        level={levelUp.level}
                        onDone={() => {
                            const resolve = levelUp.resolve;
                            setLevelUp(null);
                            resolve();
                        }}
                    />
                ) : null}
            </AnimatePresence>
        </>
    );
}
