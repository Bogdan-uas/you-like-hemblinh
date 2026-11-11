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

const LowerThird = ({ t, message }) => {
    const { barRef, close } = useDrainClose(t);
    const event = eventOf(t.icon);

    return (
        <div
            className={`${css.lower} ${t.hud === "gpl" ? css.lower_gpl : t.hud === "gcc" ? css.lower_gcc : t.hud === "pbs" ? css.lower_pbs : ""} ${t.visible ? css.lower_enter : css.lower_exit}`}
            style={{ "--toast-accent": readableAccent(t.accent ?? event.accent) }}
            onClick={close}
            {...t.ariaProps}
        >
            <div key={t.seq ?? t.id} className={css.lower_swap}>
                <span className={css.lower_wipe} aria-hidden="true" />
                <span className={css.lower_body}>
                    <span className={css.lower_label}>{t.label ?? event.label}</span>
                    <span className={css.lower_message}>{message}</span>
                </span>
                <span className={css.lower_tile}>
                    <span className={css.lower_emoji}>{t.icon ?? "📣"}</span>
                </span>
            </div>
            <Countdown t={t} barRef={barRef} />
        </div>
    );
};

const labelTextOn = (color) => {
    const hex = typeof color === "string" ? color.replace("#", "").slice(0, 6) : "";
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "#ffffff";
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#0d0e10" : "#ffffff";
};

const PbsToast = ({ t, message }) => {
    const { barRef, close } = useDrainClose(t);
    const event = eventOf(t.icon);
    const accent = t.accent ?? event.accent;

    return (
        <div
            className={`${css.pbs} ${t.visible ? css.pbs_enter : css.pbs_exit}`}
            style={{ "--toast-accent": readableAccent(accent), "--label-text": labelTextOn(accent) }}
            onClick={close}
            {...t.ariaProps}
        >
            <div key={t.seq ?? t.id} className={css.pbs_swap}>
                <span className={css.pbs_icon}>
                    <span className={css.pbs_emoji}>{t.icon ?? "📣"}</span>
                </span>
                <span className={css.pbs_body}>
                    <span className={css.pbs_label}>{t.label ?? event.label}</span>
                    <span className={css.pbs_message}>{message}</span>
                    <Countdown t={t} barRef={barRef} />
                </span>
            </div>
        </div>
    );
};

const SwcToast = ({ t, message }) => {
    const { barRef, close } = useDrainClose(t);
    const event = eventOf(t.icon);
    const accent = t.accent ?? event.accent;

    return (
        <div
            className={`${css.swc} ${t.visible ? css.swc_enter : css.swc_exit}`}
            style={{ "--toast-accent": readableAccent(accent), "--label-text": labelTextOn(accent) }}
            onClick={close}
            {...t.ariaProps}
        >
            <div key={t.seq ?? t.id} className={css.swc_swap}>
                <span className={css.swc_icon}>
                    <span className={css.swc_spark} aria-hidden="true" />
                    <span className={css.swc_emoji}>{t.icon ?? "📣"}</span>
                </span>
                <span className={css.swc_body}>
                    <span className={css.swc_head}>
                        <span className={css.swc_label}>{t.label ?? event.label}</span>
                        <span className={css.swc_brand}>Stormdraft</span>
                    </span>
                    <span className={css.swc_message}>{message}</span>
                    <Countdown t={t} barRef={barRef} />
                </span>
            </div>
        </div>
    );
};

const PgxToast = ({ t, message }) => {
    const { barRef, close } = useDrainClose(t);
    const event = eventOf(t.icon);
    const accent = t.accent ?? event.accent;

    return (
        <div
            className={`${css.pgx} ${t.visible ? css.pgx_enter : css.pgx_exit}`}
            style={{ "--toast-accent": readableAccent(accent), "--label-text": labelTextOn(accent) }}
            onClick={close}
            {...t.ariaProps}
        >
            <div key={t.seq ?? t.id} className={css.pgx_swap}>
                <span className={css.pgx_head}>
                    <span className={css.pgx_label}>{t.label ?? event.label}</span>
                    <span className={css.pgx_mark}>PGX</span>
                </span>
                <span className={css.pgx_body}>
                    <span className={css.pgx_icon}>
                        <span className={css.pgx_emoji}>{t.icon ?? "📣"}</span>
                    </span>
                    <span className={css.pgx_message}>{message}</span>
                </span>
                <Countdown t={t} barRef={barRef} />
            </div>
        </div>
    );
};

const CstToast = ({ t, message }) => {
    const { barRef, close } = useDrainClose(t);
    const event = eventOf(t.icon);
    const accent = t.accent ?? event.accent;

    return (
        <div
            className={`${css.cst} ${t.visible ? css.cst_enter : css.cst_exit}`}
            style={{ "--toast-accent": readableAccent(accent), "--label-text": labelTextOn(accent) }}
            onClick={close}
            {...t.ariaProps}
        >
            <div key={t.seq ?? t.id} className={css.cst_swap}>
                <span className={css.cst_tile}>
                    <span className={css.cst_emoji}>{t.icon ?? "📣"}</span>
                </span>
                <span className={css.cst_body}>
                    <span className={css.cst_label}>{t.label ?? event.label}</span>
                    <span className={css.cst_message}>{message}</span>
                    <Countdown t={t} barRef={barRef} />
                </span>
                <span className={css.cst_end} />
            </div>
        </div>
    );
};

const EssToast = ({ t, message }) => {
    const { barRef, close } = useDrainClose(t);
    const event = eventOf(t.icon);
    const accent = t.accent ?? event.accent;

    return (
        <div
            className={`${css.ecl} ${t.visible ? css.ecl_enter : css.ecl_exit}`}
            style={{ "--toast-accent": readableAccent(accent) }}
            onClick={close}
            {...t.ariaProps}
        >
            <div key={t.seq ?? t.id} className={css.ecl_swap}>
                <span className={css.ecl_mark} aria-hidden="true">{t.icon ?? "📣"}</span>
                <span className={css.ecl_line} />
                <span className={css.ecl_body}>
                    <span className={css.ecl_label}>{t.label ?? event.label}</span>
                    <span className={css.ecl_message}>{message}</span>
                </span>
                <Countdown t={t} barRef={barRef} />
            </div>
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

    if (t.variant === "series" && t.hud === "ess") return <EssToast t={t} message={message} />;
    if (t.variant === "series" && t.hud === "cst") return <CstToast t={t} message={message} />;
    if (t.variant === "series" && t.hud === "pgx") return <PgxToast t={t} message={message} />;
    if (t.variant === "series" && t.hud === "pbs") return <PbsToast t={t} message={message} />;
    if (t.variant === "series" && t.hud === "swc") return <SwcToast t={t} message={message} />;
    if (t.variant === "series" && (t.hud === "pem" || t.hud === "gpl" || t.hud === "gcc")) return <LowerThird t={t} message={message} />;
    if (t.variant === "series") return <SeriesToast t={t} message={message} />;
    return <PlainToast t={t} message={message} />;
}
