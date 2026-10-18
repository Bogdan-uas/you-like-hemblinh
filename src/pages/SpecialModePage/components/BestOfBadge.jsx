import css from "../SpecialModePage.module.css";

const BEST_OF_TONES = {
    1: css.best_of_tone_1,
    3: css.best_of_tone_3,
    5: css.best_of_tone_5,
    7: css.best_of_tone_7,
    9: css.best_of_tone_9,
};

export const BestOfBadge = ({ bestOf, size = 18, onColor = false, style }) => (
    <span
        className={`${css.best_of_badge} ${onColor ? css.best_of_badge_on_color : ""}`}
        style={{ fontSize: size, ...style }}
        aria-label={`Best of ${bestOf}`}
    >
        <span className={css.best_of_badge_label}>Best of</span>
        <span style={{ marginTop: -2 }} className={`${css.best_of_badge_value} ${BEST_OF_TONES[bestOf] ?? BEST_OF_TONES[1]}`}>{bestOf}</span>
    </span>
);
