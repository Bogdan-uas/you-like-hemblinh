import { useLayoutEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform } from "framer-motion";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { NeededPerkTag } from "../progress/HudPerks.jsx";
import { HostBadge } from "../worldMap/HostCity.jsx";
import { TournamentTierBadge } from "../components/TournamentTypeInfo.jsx";
import { getAnniversaryTheme, getTournamentNumberStyle } from "../logic/winnersAndPickem.js";
import { formatHallDate, takeHallMorphSource, playHallMorph } from "./hallCardStyle.js";
import css from "./HallSummary.module.css";

const SPREAD_FROM = 20;
const SPREAD_TO = 260;
const CARD_MAX = 1120;
const COMPACT = 0.62;
const RADIUS = 22;

const useViewportWidth = () => {
    const [width, setWidth] = useState(() => document.documentElement.clientWidth);
    useLayoutEffect(() => {
        const onResize = () => setWidth(document.documentElement.clientWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return width;
};

export function SummaryHero({ record, accent, tier, tierText, title, numberText, trophy, host, anchor }) {
    const won = !!record.pickemWon;
    const needed = Number(record.neededPickemPoints) || 0;
    const achieved = Number(record.achievedPickemPoints) || 0;
    const diff = achieved - needed;
    const date = formatHallDate(record.finishedAt, "long");
    const theme = getAnniversaryTheme(Number(record.number) || 0);
    const official = tier === "official";
    const fullTitle = `${title} ${numberText}`.trim();

    const stickyRef = useRef(null);
    const cardRef = useRef(null);
    const bgRef = useRef(null);
    const viewport = useViewportWidth();
    const cardWidth = Math.min(CARD_MAX, viewport * 0.88);
    const [fullHeight, setFullHeight] = useState(262);

    useLayoutEffect(() => {
        const card = cardRef.current;
        if (!card) return undefined;
        const measure = () => setFullHeight((h) => (Math.abs(h - card.offsetHeight) < 0.5 ? h : card.offsetHeight));
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(card);
        return () => observer.disconnect();
    }, []);

    const { scrollY } = useScroll();
    const progress = useTransform(scrollY, [SPREAD_FROM, SPREAD_TO], [0, 1], { clamp: true });
    const contentScale = useTransform(progress, [0, 1], [1, COMPACT]);
    const bgScaleY = contentScale;
    const clipPath = useTransform(progress, (p) => {
        const width = cardWidth + (viewport - cardWidth) * p;
        const inset = Math.max(0, (viewport - width) / 2);
        const radius = RADIUS * (1 - p);
        const sy = 1 + (COMPACT - 1) * p;
        return `inset(0px ${inset}px 0px ${inset}px round ${radius}px / ${radius / sy}px)`;
    });

    const shadowScaleX = useTransform(progress, (p) => (cardWidth + (viewport - cardWidth) * p) / cardWidth);
    const shadowRadius = useTransform(progress, (p) => {
        const sx = (cardWidth + (viewport - cardWidth) * p) / cardWidth;
        const sy = 1 + (COMPACT - 1) * p;
        const radius = RADIUS * (1 - p);
        return `${radius / sx}px / ${radius / sy}px`;
    });

    useLayoutEffect(() => {
        const source = takeHallMorphSource();
        const card = cardRef.current;
        if (!source || !card) return;
        playHallMorph(source, {
            bg: bgRef.current,
            banner: card.querySelector("[data-part=\"banner\"]"),
            pickem: card.querySelector("[data-part=\"pickem\"]"),
            keyed: [...card.querySelectorAll("[data-morph-key]")],
            extras: [...card.querySelectorAll("[data-morph-extra]")],
        });
    }, []);

    const vars = { "--accent": accent.base, "--accent-2": accent.deep, "--accent-glow": accent.glow ?? accent.base, "--anniv-glow": theme?.glow ?? "transparent" };
    const compactHeight = fullHeight * COMPACT;

    return (
        <>
            <div ref={stickyRef} className={css.sticky} data-hall-hero="" data-sticky-anchor={anchor ?? undefined} data-official={official || undefined} data-anniversary={theme ? "" : undefined} style={{ ...vars, height: compactHeight }}>
                <motion.div ref={bgRef} className={css.bg} style={{ height: fullHeight, scaleY: bgScaleY }} aria-hidden="true">
                    <motion.span className={css.bg_shadow} style={{ width: cardWidth, marginLeft: -cardWidth / 2, scaleX: shadowScaleX, borderRadius: shadowRadius }} />
                    <motion.div className={css.bg_layer} style={{ clipPath }}>
                        <span className={css.bg_banner} data-bg="banner">
                            <span className={css.banner_pattern} />
                        </span>
                        <span className={css.bg_pickem} data-won={won} data-bg="pickem" />
                    </motion.div>
                </motion.div>

                <motion.div ref={cardRef} className={css.card} style={{ width: cardWidth, scale: contentScale }}>
                    <div className={css.banner} data-part="banner">
                        <div className={css.banner_main}>
                            <div className={css.banner_top}>
                                <span className={css.tier} data-morph-key="tier">
                                    <TournamentTierBadge tier={tier} size={18} />
                                    {tierText}
                                </span>
                                {date ? (
                                    <span className={css.date} data-morph-key="date">
                                        {date}
                                    </span>
                                ) : null}
                            </div>
                            <h2 className={css.title} data-morph-key="title">
                                {title}
                                {numberText ? (
                                    <>
                                        {" "}
                                        <span className={css.number} style={getTournamentNumberStyle(theme)}>
                                            {numberText}
                                        </span>
                                    </>
                                ) : null}
                            </h2>
                            {host ? <HostBadge host={host} title={fullTitle} variant="dark" className={css.host} morphKey="host" /> : null}
                        </div>
                        <span className={css.trophy} data-morph-key="trophy">
                            {trophy}
                        </span>
                    </div>
                    <div className={css.pickem} data-part="pickem">
                        <span className={css.pickem_icon} data-won={won} data-morph-key="pickem-icon">
                            {won ? <FaCheck aria-hidden="true" /> : <FaXmark aria-hidden="true" />}
                        </span>
                        <span className={css.pickem_title} data-morph-key="pickem-title">
                            {won ? "Pick'em challenge won" : "Pick'em challenge lost"}
                        </span>
                        <span className={css.pickem_stat} data-morph-extra="">
                            <b>{needed}</b>
                            <span className={css.perk}>
                                <NeededPerkTag value={needed} cut={record.neededPerk ?? null} fallback={false} />
                            </span>
                            needed
                        </span>
                        <span className={css.pickem_stat} data-morph-extra="">
                            <b>{achieved}</b> achieved
                        </span>
                        <span className={css.pickem_diff} data-morph-key="pickem-diff">
                            {diff > 0 ? `+${diff}` : diff}
                        </span>
                    </div>
                </motion.div>
            </div>
            <div className={css.spacer} style={{ height: fullHeight - compactHeight + 8 }} aria-hidden="true" />
        </>
    );
}

export function ModernSectionTitle({ text, marginTop = "48px", marginBottom = "48px", sectionId }) {
    return (
        <div data-hall-section={sectionId} className={css.section} style={{ marginTop, marginBottom }}>
            <span className={css.section_line} aria-hidden="true" />
            <span className={css.section_pill}>{text}</span>
            <span className={css.section_line} aria-hidden="true" />
        </div>
    );
}
