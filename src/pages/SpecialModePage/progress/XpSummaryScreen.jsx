import { useEffect, useMemo, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import css from "./Progress.module.css";
import page from "../SpecialModePage.module.css";
import { TIERS, achievementById, levelInfo } from "./progressConfig.js";
import { progressCloseCatchUp, progressCloseSummary } from "./progressStore.js";
import { AchievementMedal, LevelBar, LevelCircle, XpNumbers } from "./ProgressParts.jsx";
import { formatXp, useScreenLenis } from "./progressUi.js";
import { useSpecialModeSettings } from "../logic/settings.js";
import { barTargetOf, centerOf, flyToken, playLevelUp, tweenXp } from "./progressMotion.js";

const EVENT_SOURCES = new Set(["finish", "pickemWon", "margin", "champion", "perfectRound"]);

const momentsOf = (gains) => {
    const moments = [];
    gains.forEach((gain) => {
        const key = gain.source === "achievement" ? `a-${gain.id}` : gain.source === "achievementBoost" ? "boost" : EVENT_SOURCES.has(gain.source) ? "event" : `s-${gain.detail}`;
        const last = moments[moments.length - 1];
        if (last && last.key === key && gain.source !== "achievement") {
            last.gains.push(gain);
            last.xp += gain.xp;
            return;
        }
        moments.push({
            key,
            title: gain.source === "achievement" ? gain.label : key === "event" ? "Tournament results" : key === "boost" ? "Achievement boost" : gain.detail || gain.label,
            gains: [gain],
            xp: gain.xp,
            unlock: gain.unlock ?? null,
        });
    });
    return moments;
};

export function XpSummaryScreen({ mode, data, replay = false }) {
    const isCatchUp = mode === "catchUp";
    const startXp = isCatchUp ? 0 : data.startXp;
    const endXp = isCatchUp ? data.xp : data.endXp;
    const rows = useMemo(
        () => (isCatchUp ? data.rows.map((row) => ({ key: row.id, title: row.name, gains: [], xp: row.xp })) : momentsOf(data.gains || [])),
        [data, isCatchUp],
    );
    const xpMV = useMotionValue(startXp);
    const { smoothScroll } = useSpecialModeSettings();
    const { wrapperRef, contentRef, lenisRef } = useScreenLenis(smoothScroll);
    const [active, setActive] = useState(-1);
    const [done, setDone] = useState(false);
    const skipRef = useRef(false);
    const rowRefs = useRef([]);
    const badgeRefs = useRef([]);
    const barRef = useRef(null);
    const totalRef = useRef(null);
    const totalMV = useMotionValue(0);
    const totalText = useTransform(totalMV, (v) => `+${formatXp(v)} XP`);
    const startLevel = levelInfo(startXp).level;
    const endLevel = levelInfo(endXp).level;
    const levelUps = isCatchUp || endLevel - startLevel > 3 ? "final" : "each";

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            await new Promise((resolve) => setTimeout(resolve, 700));
            let cursor = startXp;
            let shownLevel = startLevel;
            const onLevelUp = async (level) => {
                shownLevel = level;
                await playLevelUp(level);
            };
            for (let i = 0; i < rows.length; i++) {
                if (cancelled || skipRef.current) break;
                setActive(i);
                const speed = Math.min(8, 1 + i * 0.14);
                const rowEl = rowRefs.current[i];
                const wrapperEl = wrapperRef.current;
                if (rowEl && wrapperEl && lenisRef.current) {
                    lenisRef.current.scrollTo(rowEl, { offset: -(wrapperEl.clientHeight / 2 - rowEl.offsetHeight / 2), duration: Math.max(0.35, 0.9 / speed), force: true });
                }
                await new Promise((resolve) => setTimeout(resolve, 160 / speed));
                if (cancelled || skipRef.current) break;
                await flyToken({ from: centerOf(badgeRefs.current[i]), to: barTargetOf(barRef.current, cursor), text: `+${formatXp(rows[i].xp)} XP`, duration: 0.5 / Math.sqrt(speed) });
                await tweenXp(xpMV, cursor, cursor + rows[i].xp, { speed, levelUps: levelUps === "each" ? "each" : "none", onLevelUp });
                cursor += rows[i].xp;
            }
            if (cancelled) return;
            if (cursor < endXp) {
                await new Promise((resolve) => animate(xpMV, endXp, { duration: 0.7, ease: [0.25, 0.8, 0.3, 1], onComplete: resolve }));
            }
            if (endLevel > shownLevel) await playLevelUp(endLevel);
            xpMV.set(endXp);
            setActive(rows.length);
            setDone(true);
            await new Promise((resolve) => requestAnimationFrame(resolve));
            const totalEl = totalRef.current;
            const wrapperEl = wrapperRef.current;
            if (totalEl && wrapperEl && lenisRef.current) {
                lenisRef.current.resize();
                lenisRef.current.scrollTo(totalEl, { offset: -(wrapperEl.clientHeight / 2 - totalEl.offsetHeight / 2), duration: 0.9, force: true });
            }
            animate(totalMV, endXp - startXp, { duration: 1.3, ease: [0.22, 1, 0.36, 1] });
        };
        run();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const close = () => (isCatchUp ? progressCloseCatchUp() : progressCloseSummary());
    const total = endXp - startXp;

    return (
        <motion.div ref={wrapperRef} className={css.screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div ref={contentRef} className={css.screen_inner} style={{ paddingTop: 36 }}>
                <div className={css.summary_head}>
                    <span className={css.ach_kicker}>{isCatchUp ? "Level progression" : "Level progress"}</span>
                    <span className={css.summary_title}>{isCatchUp ? "Your history counts" : data.name}</span>
                    <span className={css.summary_sub}>
                        {isCatchUp
                            ? `${data.records} tournaments of your Hall of Fame already earned ${formatXp(total)} XP and ${data.unlocked.length} achievement steps`
                            : `${data.subtitle ? `${data.subtitle} · ` : ""}${formatXp(total)} XP ${data.subtitle ? "earned" : "earned in this tournament"} · Level ${startLevel} → Level ${endLevel}`}
                    </span>
                </div>
                <div className={css.summary_top}>
                    <div className={css.level_head} style={{ marginBottom: 0 }}>
                        <LevelCircle xpMV={xpMV} size="lg" />
                        <div className={css.level_side}>
                            <LevelBar xpMV={xpMV} barRef={barRef} />
                            <XpNumbers xpMV={xpMV} />
                        </div>
                    </div>
                </div>
                <div className={css.rows}>
                    {rows.map((row, i) => (
                        <div
                            key={`${row.key}-${i}`}
                            ref={(el) => {
                                rowRefs.current[i] = el;
                            }}
                            className={`${css.row} ${i === active ? css.row_active : i < active ? css.row_done : ""}`}
                        >
                            {row.unlock ? <AchievementMedal id={row.unlock.id} tierIndex={row.unlock.tier} size={40} /> : null}
                            <span className={css.row_main}>
                                <span className={css.row_title}>{row.title}</span>
                                {row.gains.length && !row.key.startsWith("a-") ? (
                                    <span className={css.row_sources}>
                                        {row.gains.map((gain) => (
                                            <span key={gain.id} className={css.row_source}>
                                                {gain.label} +{formatXp(gain.xp)}
                                            </span>
                                        ))}
                                    </span>
                                ) : null}
                            </span>
                            <span
                                className={css.chip_xp}
                                ref={(el) => {
                                    badgeRefs.current[i] = el;
                                }}
                            >
                                +{formatXp(row.xp)} XP
                            </span>
                        </div>
                    ))}
                </div>
                {done ? (
                    <motion.div
                        ref={totalRef}
                        className={css.summary_total}
                        initial={{ opacity: 0, y: 18, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className={css.summary_total_label}>{isCatchUp ? "Total XP from your history" : "Total XP earned"}</span>
                        <motion.span className={`${css.chip_xp} ${css.summary_total_xp}`}>{totalText}</motion.span>
                    </motion.div>
                ) : null}
                {isCatchUp && done && data.unlocked.length ? (
                    <>
                        <h3 className={css.section_title}>Achievements you already earned</h3>
                        <div className={css.unlocked_grid}>
                            {data.unlocked.map((u, i) => {
                                const a = achievementById[u.id];
                                return (
                                    <motion.span
                                        key={`${u.id}-${u.tier}-${i}`}
                                        className={css.unlocked_item}
                                        initial={{ opacity: 0, scale: 0.6 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.04, type: "spring", stiffness: 380, damping: 20 }}
                                    >
                                        <AchievementMedal id={u.id} tierIndex={u.tier} size={34} />
                                        {a.name}
                                        {u.tier >= 0 ? ` · ${TIERS[u.tier].label}` : ""}
                                    </motion.span>
                                );
                            })}
                        </div>
                    </>
                ) : null}
                <div className={css.summary_buttons}>
                    {!done ? (
                        <button type="button" className={page.cancel_button} onClick={() => { skipRef.current = true; }}>
                            Skip
                        </button>
                    ) : null}
                    <button type="button" className={`${page.gamble_button} ${done ? "" : page.locked}`} disabled={!done} onClick={close} data-proceed-button>
                        {replay ? "Close" : "Continue"}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
