import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { FaClock, FaDiceFive } from "react-icons/fa6";
import { TaskFace } from "./TaskFace.jsx";
import css from "./Progress.module.css";
import { TASK_CATEGORIES, TASK_PERIOD, boostedTaskXp, canReroll, nextRefreshAt, rerollsLeft, taskInfo } from "./tasks.js";
import { levelInfo, perksForLevel } from "./progressConfig.js";
import { progressMarkTasksSeen, progressRefreshTasks, progressRerollTask, unseenTaskIds } from "./progressStore.js";
import { TASK_LOOKS, formatXp } from "./progressUi.js";

const SEEN_AFTER_MS = 1100;



const formatCountdown = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const sec = total % 60;
    const two = (n) => String(n).padStart(2, "0");
    if (d > 0) return `${d}d ${h}h ${two(m)}m`;
    return `${h}h ${two(m)}m ${two(sec)}s`;
};

const useNow = (interval = 1000) => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), interval);
        return () => clearInterval(timer);
    }, [interval]);
    return now;
};

function TaskCard({ task, cat, tasks, fresh, boost }) {
    const info = taskInfo(task);
    const xp = task.done ? task.earnedXp ?? info.xp : boostedTaskXp(info.xp, boost);
    const xpTitle = xp > info.xp ? `${formatXp(info.xp)} XP + ${formatXp(xp - info.xp)} XP from your Task boost` : undefined;
    const ratio = Math.min(1, task.progress / task.target);
    const rerollable = TASK_CATEGORIES.find((c) => c.key === cat).rerolls > 0 && !task.done;
    const allowed = canReroll(tasks, cat, task);
    const rerollTitle = !rerollable
        ? ""
        : allowed
            ? "Re-roll this task: it is replaced by a random new one"
            : task.rerolled && cat !== "daily"
                ? "This task was already re-rolled once"
                : "No re-rolls left right now";

    return (
        <TaskFace
            cat={cat}
            text={info.text}
            difficultyKey={info.difficulty.key}
            difficultyLabel={info.difficulty.label}
            xp={xp}
            xpTitle={xpTitle}
            done={task.done}
            doneAt={task.doneAt}
            ratio={ratio}
            progressText={info.single ? `Best so far: ${formatXp(task.progress)} / ${formatXp(task.target)}` : `${formatXp(task.progress)} / ${formatXp(task.target)}`}
            fresh={fresh}
            uid={fresh ? task.uid : undefined}
            actions={
                rerollable ? (
                    <button
                        type="button"
                        className={css.task_reroll}
                        disabled={!allowed}
                        title={rerollTitle}
                        aria-label={`Re-roll: ${info.text}`}
                        onClick={() => progressRerollTask(cat, task.uid)}
                    >
                        <FaDiceFive aria-hidden="true" />
                    </button>
                ) : null
            }
        >
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
        </TaskFace>
    );
}

export function TasksTab({ progress, rootRef }) {
    const now = useNow(1000);
    const tasks = progress.tasks || {};
    const unseen = unseenTaskIds(progress);
    const [freshIds] = useState(() => new Set(unseen));
    const listRef = useRef(null);
    const unseenKey = unseen.join(",");
    const boost = perksForLevel(levelInfo(progress.xp).level).taskBoost;

    useEffect(() => {
        progressRefreshTasks();
    }, [now]);

    useEffect(() => {
        const root = rootRef.current;
        const list = listRef.current;
        if (!root || !list || !unseenKey) return undefined;
        const timers = new Map();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = entry.target.getAttribute("data-task-uid");
                    if (!id) return;
                    if (entry.isIntersecting) {
                        if (!timers.has(id)) timers.set(id, setTimeout(() => progressMarkTasksSeen([id]), SEEN_AFTER_MS));
                    } else if (timers.has(id)) {
                        clearTimeout(timers.get(id));
                        timers.delete(id);
                    }
                });
            },
            { root, threshold: 0.6 },
        );
        list.querySelectorAll("[data-task-uid]").forEach((el) => observer.observe(el));
        return () => {
            observer.disconnect();
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, [rootRef, unseenKey]);

    const totalXp = TASK_CATEGORIES.reduce((sum, { key }) => sum + (tasks[key]?.list || []).filter((t) => t.done).reduce((s, t) => s + (t.earnedXp ?? taskInfo(t).xp), 0), 0);

    return (
        <div ref={listRef}>
            <p className={css.tasks_intro}>
                Tasks come in four kinds and give XP once they are done. Every series and every tournament you finish counts for all of them at once.
                <span className={css.tasks_intro_xp}>
                    {formatXp(totalXp)} XP from tasks right now{boost ? ` · Task boost +${boost}%` : ""}
                </span>
            </p>
            <div className={css.timeline}>
                {TASK_CATEGORIES.map((def) => {
                    const group = tasks[def.key];
                    const look = TASK_LOOKS[def.key];
                    const Icon = look.icon;
                    const list = group?.list || [];
                    const done = list.filter((t) => t.done).length;
                    const refreshIn = nextRefreshAt(TASK_PERIOD[def.key], now) - now;
                    const left = rerollsLeft(tasks, def.key);
                    const rerollIn = def.rerollPeriod ? nextRefreshAt(def.rerollPeriod, now) - now : 0;
                    const crazy = def.key === "crazy";
                    return (
                        <section key={def.key} className={`${css.tl_section} ${crazy ? css.tl_crazy : ""}`} style={{ "--task-color": look.color }}>
                            <span className={css.tl_node} aria-hidden="true">
                                <Icon />
                            </span>
                            <div className={crazy ? css.crazy_panel : undefined}>
                                <div className={css.tl_head}>
                                    <span className={css.tl_title_row}>
                                        <h3 className={css.tl_title}>{look.title}</h3>
                                        <span className={css.tl_count}>
                                            {done} / {list.length} done
                                        </span>
                                    </span>
                                    <span className={css.tl_blurb}>{look.blurb}</span>
                                    <span className={css.tl_timers}>
                                        <span className={css.tl_timer} title="When all tasks of this kind are replaced by new ones">
                                            <FaClock aria-hidden="true" /> New tasks in <b>{formatCountdown(refreshIn)}</b>
                                        </span>
                                        {def.rerolls ? (
                                            <span
                                                className={css.tl_timer}
                                                title={
                                                    def.key === "daily"
                                                        ? "One task can be re-rolled every day"
                                                        : `${def.rerolls} re-rolls every week, and every task can be re-rolled only once`
                                                }
                                            >
                                                <FaDiceFive aria-hidden="true" /> Re-rolls <b>{left} / {def.rerolls}</b>
                                                {left < def.rerolls ? <> · refill in <b>{formatCountdown(rerollIn)}</b></> : null}
                                            </span>
                                        ) : (
                                            <span className={css.tl_timer}>
                                                <FaDiceFive aria-hidden="true" /> No re-rolls
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className={css.task_cards}>
                                    {list.map((task) => (
                                        <TaskCard key={task.uid} task={task} cat={def.key} tasks={tasks} boost={boost} fresh={freshIds.has(task.uid) && task.seen === false} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
