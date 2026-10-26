import { useEffect, useRef } from "react";
import { resolveValue, toast } from "react-hot-toast";
import css from "./AppToast.module.css";

const SERIES_EVENTS = {
    "🏁": { label: "Kick-off", accent: "#4fc3f7" },
    "❗": { label: "Halftime", accent: "#ffb300" },
    "🔄": { label: "Switch", accent: "#747bff" },
    "⚔️": { label: "Overtime", accent: "#ff7a1a" },
    "🔥": { label: "Extended Round", accent: "#ff7a1a" },
    "😜": { label: "Round won", accent: "#747bff" },
    "🤯": { label: "Set won", accent: "#ff4f9a" },
    "🎉": { label: "Game over", accent: "#ffc400" },
    "📊": { label: "Extended Rounds", accent: "#8a63ff" },
    "🧮": { label: "Tiebreaker", accent: "#8a63ff" },
    "🤝": { label: "Tiebreaker", accent: "#8a63ff" },
    "😱": { label: "Still tied", accent: "#b388ff" },
    "🥅": { label: "Penalties", accent: "#00c853" },
};

const readableAccent = (color) => {
    const hex = typeof color === "string" ? color.replace("#", "").slice(0, 6) : "";
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return color;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness >= 70) return color;
    const lift = (v) => Math.round(v + (255 - v) * 0.45);
    return `rgb(${lift(r)}, ${lift(g)}, ${lift(b)})`;
};

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" className={css.symbol} aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" className={css.check_path} />
    </svg>
);

const CrossIcon = () => (
    <svg viewBox="0 0 24 24" className={css.symbol} aria-hidden="true">
        <path d="M7 7l10 10M17 7L7 17" className={css.cross_path} />
    </svg>
);

const DRAIN_MS = 320;

const Countdown = ({ t, barRef }) =>
    Number.isFinite(t.duration) ? (
        <span className={css.countdown} aria-hidden="true">
            <span ref={barRef} className={css.countdown_bar} style={{ animationDuration: `${t.duration}ms` }} />
        </span>
    ) : null;

const useDrainClose = (t) => {
    const barRef = useRef(null);
    const closingRef = useRef(null);
    const seqRef = useRef(t.seq ?? 0);

    useEffect(() => {
        seqRef.current = t.seq ?? 0;
    }, [t.seq]);

    const close = () => {
        const seq = seqRef.current;
        if (closingRef.current === seq) return;
        closingRef.current = seq;

        const bar = barRef.current;
        if (!bar) {
            toast.dismiss(t.id);
            return;
        }

        const matrix = getComputedStyle(bar).transform;
        const scale = matrix && matrix !== "none" ? Number(matrix.slice(7, -1).split(",")[0]) : 1;
        bar.style.animation = "none";
        bar.style.transform = `scaleX(${Number.isFinite(scale) ? scale : 1})`;
        void bar.offsetWidth;
        bar.style.transition = `transform ${DRAIN_MS}ms ease-in`;
        bar.style.transform = "scaleX(0)";
        setTimeout(() => {
            if (seqRef.current === seq) toast.dismiss(t.id);
        }, DRAIN_MS);
    };

    return { barRef, close };
};

const eventOf = (icon) => SERIES_EVENTS[icon] ?? { label: "Series", accent: "#747bff" };

const SeriesToast = ({ t, message }) => {
    const { barRef, close } = useDrainClose(t);
    const event = eventOf(t.icon);
    const accent = readableAccent(t.accent ?? event.accent);
    const trail = t.trail ?? [];

    return (
        <div
            className={`${css.series} ${t.visible ? css.series_enter : css.series_exit}`}
            style={{ "--toast-accent": accent }}
            onClick={close}
            {...t.ariaProps}
        >
            <span className={css.series_live}>
                <span className={css.series_live_dot} />
                Live
            </span>
            <div key={t.seq ?? t.id} className={css.series_swap}>
                <span className={css.series_shine} aria-hidden="true" />
                <span className={css.series_emblem}>
                    <span className={css.series_emoji}>{t.icon ?? "📣"}</span>
                </span>
                <span className={css.series_body}>
                    <span className={css.series_label}>{t.label ?? event.label}</span>
                    <span className={css.series_message}>{message}</span>
                </span>
                <Countdown t={t} barRef={barRef} />
            </div>
            {trail.length > 0 && (
                <span className={css.series_trail} aria-hidden="true">
                    {trail.map((item, index) => (
                        <span
                            key={`${t.seq}-${index}`}
                            className={css.series_trail_item}
                            style={{ "--trail-accent": readableAccent(item.accent ?? eventOf(item.icon).accent), opacity: 1 - index * 0.2 }}
                        >
                            {item.icon ?? "📣"}
                        </span>
                    ))}
                </span>
            )}
        </div>
    );
};

const PlainToast = ({ t, message }) => {
    const { barRef, close } = useDrainClose(t);

    const kind = t.type === "success" ? "success" : t.type === "error" ? "error" : t.type === "loading" ? "loading" : "custom";
    const icon =
        kind === "success" ? <CheckIcon />
            : kind === "error" ? <CrossIcon />
                : kind === "loading" ? <span className={css.spinner} />
                    : t.icon ? <span className={css.emoji}>{t.icon}</span>
                        : <span className={css.emoji}>💬</span>;

    return (
        <div
            className={`${css.toast} ${css[kind]} ${t.visible ? css.enter : css.exit}`}
            onClick={close}
            {...t.ariaProps}
        >
            <span className={css.badge}>{icon}</span>
            <span className={css.message}>{message}</span>
            {kind !== "loading" && <Countdown t={t} barRef={barRef} />}
        </div>
    );
};

export function AppToast({ t }) {
    const message = resolveValue(t.message, t);

    if (t.variant === "series") return <SeriesToast t={t} message={message} />;
    return <PlainToast t={t} message={message} />;
}
