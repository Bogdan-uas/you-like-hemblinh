import css from "../SpecialModePage.module.css";

export const SetBadge = ({ set, isDecider = false, size = 20, onColor = false, style }) =>
    isDecider ? (
        <span
            className={`${css.best_of_badge} ${css.decider_badge} ${onColor ? css.best_of_badge_on_color : ""}`}
            style={{ fontSize: size, ...style }}
        >
            <span className={css.decider_badge_text}>Decider</span>
        </span>
    ) : (
        <span
            className={`${css.best_of_badge} ${onColor ? css.best_of_badge_on_color : ""}`}
            style={{ fontSize: size, ...style }}
            aria-label={`Set ${set}`}
        >
            <span className={css.best_of_badge_label}>Set</span>
            <span className={`${css.best_of_badge_value} ${css.set_badge_value}`}>{set}</span>
        </span>
    );

const OVERTIME_TONES = [null, css.ot_level_1, css.ot_level_2, css.ot_level_3, css.ot_level_4, css.ot_level_5, css.ot_level_6, css.ot_level_7, css.ot_level_8, css.ot_level_9, css.ot_level_10];

export const OvertimeBadge = ({ label, level = 1, firstTo, size = 16, style }) => (
    <span className={`${css.best_of_badge} ${css.overtime_badge}`} style={{ fontSize: size, ...style }}>
        <span className={`${css.overtime_badge_label} ${OVERTIME_TONES[Math.min(Math.max(level, 1), 10)]}`}>{label}</span>
        <span className={css.overtime_badge_target}>
            First to <b>{firstTo}</b>
        </span>
    </span>
);

const scoreTone = (own, other) => (own > other ? css.set_chip_win : own < other ? css.set_chip_loss : "");

export const SetHistoryChip = ({ set, leftScore, rightScore, winnerColor, extra }) => (
    <span className={css.set_chip} style={{ "--set-chip-accent": winnerColor }}>
        <span className={css.set_chip_label}>S{set}</span>
        <span className={css.set_chip_score}>
            <span className={scoreTone(leftScore, rightScore)}>{leftScore}</span>
            <span className={css.set_chip_colon}>:</span>
            <span className={scoreTone(rightScore, leftScore)}>{rightScore}</span>
        </span>
        {extra ? (
            <span className={css.set_chip_extra}>
                {extra.label}{" "}
                <span className={scoreTone(extra.left, extra.right)}>{extra.left}</span>
                <span className={css.set_chip_colon}>:</span>
                <span className={scoreTone(extra.right, extra.left)}>{extra.right}</span>
            </span>
        ) : null}
    </span>
);

export const PenaltyBadge = ({ attempt, suddenDeath = false, size = 16, style }) => (
    <span className={css.best_of_badge} style={{ fontSize: size, ...style }}>
        <span className={`${css.overtime_badge_label} ${suddenDeath ? css.penalty_badge_sudden : css.penalty_badge_label}`}>
            {suddenDeath ? "Sudden Death" : "Penalty Series"}
        </span>
        <span className={css.overtime_badge_target}>
            Attempt <b>{attempt}</b>
        </span>
    </span>
);

export const RoundBadge = ({ children, size = 14, style }) => (
    <span className={`${css.best_of_badge} ${css.round_badge}`} style={{ fontSize: size, ...style }}>
        <span className={css.round_badge_label}>Round</span>
        <span style={{ marginTop: -1 }} className={css.round_badge_value}>{children}</span>
    </span>
);
