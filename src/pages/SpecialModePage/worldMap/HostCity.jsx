import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaLocationDot, FaXmark } from "react-icons/fa6";
import CountryStage from "./CountryStage.jsx";
import CountryFlag from "./CountryFlag.jsx";
import { hostPlaceText } from "../logic/hostCities.js";
import { TournamentNumberText } from "../components/TournamentNumberText.jsx";
import css from "./WorldMap.module.css";

const HOLD_MS = 1700;

const stageTargetOf = (host) => (host ? { code: host.code, flag: host.flag, dots: [{ id: "host", hq: { city: host.city, lat: host.lat, lon: host.lon } }], activeId: "host" } : null);

export function HostPopup({ host, title = null, onClose }) {
    const [landed, setLanded] = useState(false);
    const target = useMemo(() => stageTargetOf(host), [host]);
    const isMain = host?.relation === "main";

    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== "Escape") return;
            e.preventDefault();
            e.stopPropagation();
            onClose();
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [onClose]);

    return createPortal(
        <motion.div className={css.host_popup_backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.1 } }} transition={{ duration: 0.25 }} onClick={onClose}>
            <motion.div
                className={css.host_popup}
                initial={{ y: "-110%" }}
                animate={{ y: 0 }}
                exit={{ y: "-110%", transition: { duration: 0.38, ease: [0.55, 0, 0.75, 0.2] } }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={css.host_popup_stage}>
                    <CountryStage target={target} playId={1} from="world" fill={0.42} center={[0.5, 0.56]} countryName={host?.country} dotLabel={() => host?.city ?? ""} onDone={() => setLanded(true)} />
                </div>
                <div className={css.host_popup_head}>
                    <span className={css.host_popup_kicker}>{isMain ? "The main event is hosted in" : "Hosted in"}</span>
                    {title ? <span className={css.host_popup_title}><TournamentNumberText text={title} /></span> : null}
                </div>
                <AnimatePresence>
                    {landed ? (
                        <motion.div key="city" className={css.host_popup_city} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                            <FaLocationDot className={css.host_reveal_pin} aria-hidden="true" />
                            <span>{host?.city}</span>
                            {host && host.city !== host.country ? (
                                <span className={css.host_popup_country}>
                                    <CountryFlag code={host.code} size={20} title={host.country} />
                                    {host.country}
                                </span>
                            ) : null}
                        </motion.div>
                    ) : null}
                </AnimatePresence>
                <button type="button" className={css.host_popup_close} onClick={onClose} aria-label="Close">
                    <FaXmark aria-hidden="true" />
                </button>
            </motion.div>
        </motion.div>,
        document.body,
    );
}

export function HostBadge({ host, label = null, variant = "chip", className = "", style, interactive = true, title = null, morphKey = undefined }) {
    const [open, setOpen] = useState(false);
    if (!host) return null;
    const isMain = host.relation === "main";
    const prefix = label ?? (isMain ? "Main event" : null);
    const openPopup = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
    };
    return (
        <>
            <span
                className={`${css.host_badge} ${css[`host_badge_${variant}`] ?? ""} ${className}`}
                style={style}
                data-interactive={interactive || undefined}
                data-morph-key={morphKey}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                title={`${isMain ? "Main event hosted in" : "Hosted in"} ${hostPlaceText(host)}${interactive ? " · click to see it on the map" : ""}`}
                onClick={interactive ? openPopup : undefined}
                onPointerDown={interactive ? (e) => e.stopPropagation() : undefined}
                onKeyDown={interactive ? (e) => (e.key === "Enter" || e.key === " ") && openPopup(e) : undefined}
            >
                {prefix ? <span className={css.host_prefix}>{prefix}</span> : null}
                <FaLocationDot className={css.host_pin} aria-hidden="true" />
                <CountryFlag code={host.code} size={variant === "line" ? 12 : 14} title={host.country} />
                <span className={css.host_city}>{host.city}</span>
                {variant !== "line" && host.city !== host.country ? <span className={css.host_country}>{host.country}</span> : null}
            </span>
            <AnimatePresence>{open ? <HostPopup host={host} title={title} onClose={() => setOpen(false)} /> : null}</AnimatePresence>
        </>
    );
}

export function HostReveal({ reveal, onDone }) {
    const [phase, setPhase] = useState("fly");
    const doneRef = useRef(onDone);
    const timerRef = useRef(null);

    useEffect(() => {
        doneRef.current = onDone;
    });

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const host = reveal?.host ?? null;
    const target = useMemo(() => stageTargetOf(host), [host]);

    const finish = () => {
        clearTimeout(timerRef.current);
        setPhase("out");
    };

    const landed = () => {
        setPhase("city");
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(finish, HOLD_MS);
    };

    return createPortal(
        <AnimatePresence onExitComplete={() => doneRef.current?.()}>
            {reveal && phase !== "out" ? (
                <motion.div
                    key={reveal.key}
                    className={css.host_reveal}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeIn" } }}
                    onClick={finish}
                >
                    <motion.div className={css.host_reveal_head} initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
                        <span className={css.host_reveal_kicker}><TournamentNumberText text={reveal.title} /></span>
                        <span className={css.host_reveal_sub}>is hosted in</span>
                    </motion.div>
                    <CountryStage className={css.host_reveal_stage} target={target} playId={1} from="world" fill={0.42} center={[0.5, 0.55]} countryName={host?.country} dotLabel={() => host?.city ?? ""} onDone={landed} />
                    <AnimatePresence>
                        {phase === "city" ? (
                            <motion.div
                                key="city"
                                className={css.host_reveal_city}
                                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <FaLocationDot className={css.host_reveal_pin} aria-hidden="true" />
                                <span>{host?.city}</span>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                    <span className={css.host_reveal_skip}>Click to continue</span>
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body,
    );
}
