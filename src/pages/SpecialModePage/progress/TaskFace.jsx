import { FaCheck } from "react-icons/fa6";
import css from "./Progress.module.css";
import { TASK_LOOKS, formatXp } from "./progressUi.js";

const DIFF_COLORS = {
    easy: "#4caf50",
    medium: "#2f80ed",
    hard: "#e53935",
    wild: "#ff9f1c",
    insane: "#ff3d77",
    unhinged: "#b84dff",
};

const formatDoneDate = (iso) => {
    const d = new Date(iso);
    return Number.isFinite(d.getTime()) ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
};

export function TaskSeal() {
    return (
        <span className={css.task_seal} data-task-seal aria-hidden="true">
            <span className={css.task_seal_burst} />
            <span className={css.task_seal_ring} />
            <span className={css.task_seal_core}>
                <FaCheck />
            </span>
        </span>
    );
}

export function TaskFace({
    cat,
    text,
    difficultyKey,
    difficultyLabel,
    xp,
    xpTitle,
    done,
    doneAt,
    ratio,
    progressText,
    fresh = false,
    uid,
    actions = null,
    children = null,
    xpAnchor = false,
}) {
    return (
        <div
            className={`${css.task_card} ${done ? css.task_done : ""} ${fresh ? css.card_new : ""} ${cat === "crazy" ? css.task_crazy : ""}`}
            style={{ "--task-color": TASK_LOOKS[cat]?.color ?? TASK_LOOKS.daily.color }}
            data-task-uid={uid}
        >
            {children}
            {done ? <TaskSeal /> : null}
            <div className={css.task_top}>
                <span className={css.task_check} data-task-check aria-hidden="true">
                    {done ? <FaCheck /> : null}
                </span>
                <span className={css.task_text}>{text}</span>
            </div>
            <span className={`${css.progress_line} ${css.task_line}`}>
                <span data-task-bar style={{ transform: `scaleX(${done ? 1 : ratio})` }} />
            </span>
            <span className={css.task_foot}>
                <span className={done ? css.task_done_label : undefined}>{done ? <>Completed {formatDoneDate(doneAt)}</> : progressText}</span>
                <span className={css.task_tags}>
                    <span className={css.task_diff} style={{ "--diff-color": DIFF_COLORS[difficultyKey] ?? DIFF_COLORS.medium }}>
                        {difficultyLabel}
                    </span>
                    <span className={`${css.chip_xp} ${done ? css.task_xp_done : ""}`} title={xpTitle} data-task-xp={xpAnchor ? "" : undefined}>
                        +{formatXp(xp)} XP
                        {done ? <FaCheck className={css.task_xp_check} aria-hidden="true" /> : null}
                    </span>
                    {actions}
                </span>
            </span>
        </div>
    );
}
