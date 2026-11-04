import { useEffect, useMemo, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import css from "./Progress.module.css";
import page from "../SpecialModePage.module.css";
import {
    ACHIEVEMENTS,
    ACHIEVEMENT_CATEGORIES,
    BIG_ANNIVERSARY_LEVELS,
    DIFFICULTIES,
    INSURANCE_MIN_BEST_OF,
    PERK_MILESTONES,
    TIERS,
    XP_SOURCE_GROUPS,
    achievementXp,
    isTiered,
    levelInfo,
    perkLines,
    perksForLevel,
    totalXpForLevel,
    xpToNext,
} from "./progressConfig.js";
import { achievementValue } from "./progressEngine.js";
import { openProgressScreen, progressMarkSeen, progressOpenLastSummary, unseenAchievementIds, useProgress } from "./progressStore.js";
import { AchievementMedal, DifficultyChip, LevelBar, LevelCircle, LevelNumber, XpNumbers } from "./ProgressParts.jsx";
import { formatXp, useScreenLenis } from "./progressUi.js";
import { QualifierGroupNav } from "../components/QualifierGroupNav.jsx";
import { isSecretUnlocked, useSpecialModeSettings } from "../logic/settings.js";
import { FaAnglesDown, FaRotateLeft } from "react-icons/fa6";
import { AchievementReset } from "./AchievementReset.jsx";

const SEEN_AFTER_MS = 1100;
const DIFFICULTY_ORDER = Object.keys(DIFFICULTIES);
const CATEGORY_LABELS = Object.fromEntries(ACHIEVEMENT_CATEGORIES.map((category) => [category.key, category.label]));

function LevelHead({ progress, displayXp }) {
    const xpMV = useMotionValue(displayXp);
    useEffect(() => {
        xpMV.set(displayXp);
    }, [displayXp, xpMV]);

    return (
        <div className={css.level_head}>
            <LevelCircle xpMV={xpMV} size="lg" />
            <div className={css.level_side}>
                <LevelBar xpMV={xpMV} />
                <XpNumbers xpMV={xpMV} />
                {progress.lastSummary ? (
                    <div>
                        <button type="button" className={page.cancel_button} onClick={progressOpenLastSummary}>
                            Show the XP of {progress.lastSummary.name}
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function LevelTab({ progress }) {
    const level = levelInfo(progress.xp).level;
    const now = perkLines(perksForLevel(level));
    const nextMilestone = PERK_MILESTONES.find((m) => m.level > level);

    return (
        <>

            <h3 className={css.section_title}>
                <span>
                    Your benefits at Level <LevelNumber level={level} className={css.title_level} sparkles={false} />
                </span>
            </h3>
            {now.length ? (
                <div className={css.perk_now}>
                    {now.map((line) => (
                        <span key={line} className={css.perk_chip}>{line}</span>
                    ))}
                </div>
            ) : (
                <p className={css.note}>No benefits yet. The first one comes at Level {PERK_MILESTONES[0].level}.</p>
            )}
            {nextMilestone ? (
                <p className={css.note} style={{ marginTop: 10 }}>
                    Next at Level {nextMilestone.level}: {perkLines(nextMilestone.set).join(", ")}.
                </p>
            ) : null}
            <p className={css.note} style={{ marginTop: 10 }}>
                Every benefit only changes your Pick&apos;em and your XP: the matches themselves are never touched. The Pick&apos;em Insurance is switched on in the match modal, right before you start a
                Best of {INSURANCE_MIN_BEST_OF} or longer. If your insured pick loses, it wins back a share of the Pick&apos;em points it missed (rounded down). If that share is 0, for example after 1:2 in a
                Best of 3 (the won set already gave 2 out of 3 points), the insurance comes back to you. If your insured pick wins, the insurance is used up. Of the bonus Pick&apos;em points, only the biggest one counts on every
                pick, and all of them together can&apos;t be more than your bonus cap of the tournament (a share of the needed Pick&apos;em points, which grows with your level).
            </p>

            <h3 className={css.section_title}>How to earn XP</h3>
            <p className={css.note} style={{ marginBottom: 14 }}>
                Every level needs more XP than the one before: Level 1 → 2 needs {formatXp(xpToNext(1))} XP, Level 10 → 11 {formatXp(xpToNext(10))} XP, Level 100 → 101 {formatXp(xpToNext(100))} XP.
                The XP counts for your level the moment you earn it, and at the end of every tournament, you see all of it once more.
                Levels {BIG_ANNIVERSARY_LEVELS.join(", ")} are big anniversaries with level-ups of their own.
            </p>
            {XP_SOURCE_GROUPS.map((group) => (
                <table key={group.title} className={css.table}>
                    <thead>
                        <tr>
                            <th style={{ width: "24%" }}>{group.title}</th>
                            <th>Criteria</th>
                            <th style={{ width: "24%" }}>XP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {group.rows.map((row) => (
                            <tr key={row.source}>
                                <td><b>{row.source}</b></td>
                                <td>{row.criteria}</td>
                                <td>{row.xp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ))}
            <p className={css.note}>
                Achievements give XP as well, depending on their difficulty ({Object.values(DIFFICULTIES).map((d) => `${d.label} ${formatXp(d.xp)}`).join(", ")} XP)
                and, for the ones with tiers, on the tier ({TIERS.map((t) => `${t.label} ×${t.mult}${t.key === "master" ? " (only Completionist)" : ""}`).join(", ")}). See the{" "}
                <a style={{ color: "Highlight", fontStyle: "italic", cursor: "pointer" }} onClick={() => openProgressScreen("achievements")}>Achievements</a> tab.
            </p>

            <h3 className={css.section_title}>Level benefits up to Level 1000</h3>
            <div className={css.milestones}>
                {PERK_MILESTONES.map((m) => {
                    const reached = level >= m.level;
                    const next = nextMilestone?.level === m.level;
                    return (
                        <div key={m.level} className={`${css.milestone} ${reached ? css.milestone_reached : ""} ${next ? css.milestone_next : ""}`}>
                            <span className={css.milestone_level}>
                                LEVEL
                                <LevelNumber level={m.level} className={css.milestone_number} sparkles={false} />
                            </span>
                            <span className={css.milestone_text}>
                                {perkLines(m.set).map((line) => (
                                    <span key={line}>{line}</span>
                                ))}
                            </span>
                            <span className={css.milestone_state}>{reached ? "✓ Unlocked" : next ? "Next" : `${formatXp(Math.max(0, totalXpForLevel(m.level) - progress.xp))} XP away`}</span>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

function AchievementCard({ a, record, progress, admin, showCategory = false, onReset, onLower }) {
    const tier = record?.tier ?? 0;
    const tiered = isTiered(a);
    const unlocked = tier > 0;
    const fresh = record?.seen === false;
    const maxed = tiered ? tier >= a.tiers.length : unlocked;
    const value = tiered ? achievementValue(progress, a.stat) : null;
    const nextThreshold = tiered && !maxed ? a.tiers[tier] : null;
    const text = tiered ? null : a.text();
    const ratio = tiered && !maxed ? Math.min(1, value / nextThreshold) : maxed ? 1 : 0;

    return (
        <div className={`${css.card} ${unlocked ? "" : css.card_locked} ${fresh ? css.card_new : ""}`} data-new-id={fresh ? a.id : undefined}>
            <AnimatePresence>
                {fresh ? (
                    <motion.span
                        key="new"
                        className={css.card_ribbon}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.3 }}
                    >
                        NEW
                    </motion.span>
                ) : null}
            </AnimatePresence>
            {admin && unlocked ? (
                <span className={css.card_admin}>
                    {tiered && tier >= 2 ? (
                        <button type="button" className={css.card_reset} onClick={() => onLower(a, tier)} title={`Reset "${a.name}" to a lower tier (needs the identification code)`} aria-label={`Reset ${a.name} to a lower tier`}>
                            <FaAnglesDown aria-hidden="true" />
                        </button>
                    ) : null}
                    <button type="button" className={css.card_reset} onClick={() => onReset(a)} title={`Reset "${a.name}" (needs the identification code)`} aria-label={`Reset ${a.name}`}>
                        <FaRotateLeft aria-hidden="true" />
                    </button>
                </span>
            ) : null}
            <div className={css.card_head}>
                <AchievementMedal id={a.id} tierIndex={tiered ? Math.max(0, tier - 1) : -1} locked={!unlocked} size={56} />
                <div className={css.card_title}>
                    <span className={css.card_name}>{a.name}</span>
                    <span className={css.card_tags}>
                        <DifficultyChip difficulty={a.difficulty} />
                        {showCategory ? <span className={css.card_category}>{CATEGORY_LABELS[a.category]}</span> : null}
                    </span>
                </div>
            </div>
            {tiered ? (
                <span className={css.card_tiers}>
                    {tier > 0 ? (
                        <span className={css.card_text}>
                            <b className={css.card_tier_done} style={{ color: TIERS[tier - 1].dark }}>✓ {TIERS[tier - 1].label}:</b> {a.text(a.tiers[tier - 1])}
                        </span>
                    ) : null}
                    {!maxed ? (
                        <span className={`${css.card_text} ${tier > 0 ? css.card_tier_next : ""}`}>
                            <b>{tier > 0 ? `Next, ${TIERS[tier].label}:` : `${TIERS[0].label}:`}</b> {a.text(a.tiers[tier])}
                        </span>
                    ) : null}
                </span>
            ) : (
                <span className={css.card_text}>{text}</span>
            )}
            {tiered ? (
                <>
                    <span className={css.pips}>
                        {TIERS.slice(0, a.tiers.length).map((t, i) => (
                            <span
                                key={t.key}
                                className={css.pip}
                                title={`${t.label}: ${a.tiers[i].toLocaleString("en-US")}`}
                                style={i < tier ? { background: t.color, borderColor: t.dark } : undefined}
                            />
                        ))}
                    </span>
                    <span className={css.progress_line}>
                        <span style={{ transform: `scaleX(${ratio})` }} />
                    </span>
                </>
            ) : null}
            <span className={css.card_foot}>
                <span>
                    {tiered
                        ? maxed
                            ? `${TIERS[a.tiers.length - 1].label} reached`
                            : `${formatXp(value)} / ${formatXp(nextThreshold)} to ${TIERS[tier].label}`
                        : unlocked
                            ? `Unlocked ${new Date(record.at).toLocaleDateString()}`
                            : "Not unlocked yet"}
                </span>
                <b>{maxed ? "" : `+${formatXp(achievementXp(a, tiered ? tier : 0))} XP`}</b>
            </span>
        </div>
    );
}

function AchievementsTab({ progress, rootRef }) {
    const unseen = unseenAchievementIds(progress);
    const [filter, setFilter] = useState(unseen.length ? "new" : "all");
    const [sort, setSort] = useState("default");
    const [difficulties, setDifficulties] = useState([]);
    const toggleDifficulty = (key) => setDifficulties((list) => (list.includes(key) ? list.filter((d) => d !== key) : [...list, key]));
    const bySort = (x, y) => (sort === "default" ? 0 : (DIFFICULTY_ORDER.indexOf(x.difficulty) - DIFFICULTY_ORDER.indexOf(y.difficulty)) * (sort === "hardest" ? -1 : 1));
    const renderCard = (a, showCategory = false) => (
        <AchievementCard
            key={a.id}
            a={a}
            record={progress.achievements[a.id]}
            progress={progress}
            admin={admin}
            showCategory={showCategory}
            onReset={(item) => setResetTarget({ all: false, ids: [item.id], title: item.name })}
            onLower={(item, current) => setResetTarget({ all: false, ids: [item.id], title: item.name, lower: { current } })}
        />
    );
    const [newIds] = useState(() => new Set(unseen));
    const [resetTarget, setResetTarget] = useState(null);
    const admin = isSecretUnlocked(useSpecialModeSettings());
    const anyUnlocked = ACHIEVEMENTS.some((a) => (progress.achievements[a.id]?.tier ?? 0) > 0);
    const gridRef = useRef(null);
    const total = ACHIEVEMENTS.reduce((sum, a) => sum + (isTiered(a) ? a.tiers.length : 1), 0);
    const reached = ACHIEVEMENTS.reduce((sum, a) => sum + (progress.achievements[a.id]?.tier ?? 0), 0);
    const xpFrom = useMemo(
        () => ACHIEVEMENTS.reduce((sum, a) => {
            const tier = progress.achievements[a.id]?.tier ?? 0;
            if (!isTiered(a)) return sum + (tier ? achievementXp(a) : 0);
            let s = 0;
            for (let t = 0; t < tier; t++) s += achievementXp(a, t);
            return sum + s;
        }, 0),
        [progress.achievements],
    );
    const unseenKey = unseen.join(",");

    useEffect(() => {
        const root = rootRef.current;
        const grid = gridRef.current;
        if (!root || !grid || !unseenKey) return undefined;
        const timers = new Map();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = entry.target.getAttribute("data-new-id");
                    if (!id) return;
                    if (entry.isIntersecting) {
                        if (!timers.has(id)) timers.set(id, setTimeout(() => progressMarkSeen([id]), SEEN_AFTER_MS));
                    } else if (timers.has(id)) {
                        clearTimeout(timers.get(id));
                        timers.delete(id);
                    }
                });
            },
            { root, threshold: 0.6 },
        );
        grid.querySelectorAll("[data-new-id]").forEach((el) => observer.observe(el));
        return () => {
            observer.disconnect();
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, [rootRef, unseenKey, filter]);

    const visible = (a) => {
        const tier = progress.achievements[a.id]?.tier ?? 0;
        const maxed = isTiered(a) ? tier >= a.tiers.length : tier > 0;
        if (filter === "new") return newIds.has(a.id);
        if (filter === "obtained") return tier > 0;
        if (filter === "progress") return !maxed;
        return true;
    };

    const filters = [["all", "All"], ...(newIds.size ? [["new", `New (${unseen.length})`]] : []), ["obtained", "Obtained"], ["progress", "In progress"]];

    return (
        <div ref={gridRef}>
            <div className={css.ach_summary}>
                <span>{reached} / {total} achievement steps</span>
                <span>{formatXp(xpFrom)} XP from achievements</span>
            </div>
            <div className={css.filters}>
                {filters.map(([key, label]) => (
                    <button key={key} type="button" className={`${css.filter} ${filter === key ? css.filter_active : ""}`} onClick={() => setFilter(key)}>
                        {label}
                    </button>
                ))}
                {admin && anyUnlocked ? (
                    <button
                        type="button"
                        className={`${css.filter} ${css.filter_reset}`}
                        onClick={() => setResetTarget({ all: true, ids: ACHIEVEMENTS.map((a) => a.id), title: "All achievements" })}
                        title="Reset all achievements (needs the identification code)"
                    >
                        <FaRotateLeft aria-hidden="true" />
                        Reset achievements
                    </button>
                ) : null}
            </div>
            <div className={css.filters}>
                <span className={css.sort_label}>Sort by difficulty:</span>
                {[["default", "Default"], ["easiest", "Easiest first"], ["hardest", "Hardest first"]].map(([key, label]) => (
                    <button key={key} type="button" className={`${css.filter} ${sort === key ? css.filter_active : ""}`} onClick={() => setSort(key)}>
                        {label}
                    </button>
                ))}
            </div>
            <div className={css.filters}>
                <span className={css.sort_label}>Show difficulties:</span>
                {DIFFICULTY_ORDER.map((key) => {
                    const on = difficulties.includes(key);
                    return (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={on}
                            className={`${css.filter} ${css.diff_filter} ${on ? css.diff_filter_on : ""}`}
                            style={{ "--diff-color": DIFFICULTIES[key].color }}
                            onClick={() => toggleDifficulty(key)}
                        >
                            {DIFFICULTIES[key].label}
                        </button>
                    );
                })}
                {difficulties.length ? (
                    <button type="button" className={css.filter} onClick={() => setDifficulties([])}>
                        Show all
                    </button>
                ) : null}
            </div>
            <AchievementReset target={resetTarget} onClose={() => setResetTarget(null)} />
            {difficulties.length ? (
                (() => {
                    const list = ACHIEVEMENTS.filter((a) => difficulties.includes(a.difficulty) && visible(a)).sort(bySort);
                    return (
                        <section>
                            <h3 className={css.section_title}>
                                {difficulties.map((key) => DIFFICULTIES[key].label).join(", ")} · {list.length} {list.length === 1 ? "achievement" : "achievements"}
                            </h3>
                            {list.length ? <div className={css.cards}>{list.map((a) => renderCard(a, true))}</div> : <p className={css.note}>No achievements match these filters.</p>}
                        </section>
                    );
                })()
            ) : (
                ACHIEVEMENT_CATEGORIES.map((category) => {
                    const list = ACHIEVEMENTS.filter((a) => a.category === category.key && visible(a)).sort(bySort);
                    if (!list.length) return null;
                    return (
                        <section key={category.key}>
                            <h3 className={css.section_title}>{category.label}</h3>
                            <div className={css.cards}>{list.map((a) => renderCard(a))}</div>
                        </section>
                    );
                })
            )}
        </div>
    );
}

export function ProgressScreen({ tab }) {
    const { progress, ui } = useProgress();
    const { smoothScroll } = useSpecialModeSettings();
    const { wrapperRef, contentRef, lenisRef } = useScreenLenis(smoothScroll);
    const unseen = unseenAchievementIds(progress).length;

    useEffect(() => {
        lenisRef.current?.scrollTo(0, { immediate: true });
        lenisRef.current?.resize();
    }, [tab, lenisRef]);

    return (
        <motion.div ref={wrapperRef} className={css.screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <div ref={contentRef} className={css.screen_inner}>
                <div className={css.screen_sticky}>
                <div className={css.screen_sticky_nav}>
                <span className={`${page.second_header} ${css.screen_sticky_nav_bg}`} aria-hidden="true" />
                <QualifierGroupNav
                    value={tab}
                    onChange={openProgressScreen}
                    groups={["level", "achievements"]}
                    anchorId="progress-tabs"
                    labelOf={(key) =>
                        key === "level" ? (
                            "Level"
                        ) : (
                            <span className={css.tab_label}>
                                Achievements
                                {unseen ? <span className={css.tab_new}>{unseen > 99 ? "99+" : unseen}</span> : null}
                            </span>
                        )
                    }
                />
                </div>
                {tab === "level" ? (
                    <div className={css.screen_sticky_slot}>
                        <span className={`${page.second_header} ${css.screen_sticky_bg}`} aria-hidden="true" />
                        <div className={css.screen_sticky_head}>
                            <LevelHead progress={progress} displayXp={ui.displayXp} />
                        </div>
                    </div>
                ) : null}
                </div>
                {tab === "level" ? <LevelTab progress={progress} /> : <AchievementsTab key="achievements" progress={progress} rootRef={wrapperRef} />}
            </div>
        </motion.div>
    );
}
