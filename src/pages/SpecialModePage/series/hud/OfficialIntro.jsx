import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import css from "./OfficialIntro.module.css";
import base from "../../SpecialModePage.module.css";
import { BestOfBadge } from "../../components/BestOfBadge.jsx";
import { isFreshPemSeries } from "./pemHud.js";

const INTRO_MS = 3300;
const EASE = [0.22, 1, 0.36, 1];
const POP = [0.3, 1.45, 0.5, 1];
const FLOOR_PX = 460;

const gradientText = (team) => ({
    backgroundImage: team?.gradient ?? `linear-gradient(${team?.color ?? "#2e2f42"}, ${team?.color ?? "#2e2f42"})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
});

export function OfficialIntro({ seriesState, labelParts, medallion, plate = null, ride = null, rideTop = false, setsToWin, onDone }) {
    const [open, setOpen] = useState(() => isFreshPemSeries(seriesState));
    const [rideBox] = useState(() => {
        if (ride == null) return null;
        const h = window.innerHeight;
        const distance = (ride + 1) * FLOOR_PX;
        return { h, distance, offset: (((h / 2 - FLOOR_PX / 2) % FLOOR_PX) + FLOOR_PX) % FLOOR_PX };
    });

    useEffect(() => {
        if (!open) return undefined;
        const timer = setTimeout(() => setOpen(false), INTRO_MS);
        return () => clearTimeout(timer);
    }, [open]);

    useEffect(() => {
        if (!open) onDone?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { event, stage, big, showSeriesMatchNumber, seriesMatchNumber } = labelParts ?? {};

    return (
        <AnimatePresence onExitComplete={onDone}>
            {open ? (
                <motion.div
                    key="official-intro"
                    className={css.intro}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.32 } }}
                    transition={{ duration: 0.25 }}
                >
                    {rideBox ? (
                        <>
                            <span
                                className={css.ride}
                                style={{ top: -rideBox.distance, height: rideBox.h + rideBox.distance, backgroundPosition: `0 ${rideBox.offset}px, 0 0, 0 0`, backgroundSize: `100% ${FLOOR_PX}px, auto, auto`, "--ride": `${rideBox.distance}px` }}
                                aria-hidden="true"
                            />
                            <span className={css.ride_floor} style={{ top: rideBox.h / 2 - FLOOR_PX / 2 + 12, height: FLOOR_PX - 12 }} aria-hidden="true" />
                            {rideTop ? <span className={css.ride_sky} style={{ height: rideBox.h / 2 - FLOOR_PX / 2 }} aria-hidden="true" /> : null}
                            <span className={css.ride_fade} aria-hidden="true" />
                        </>
                    ) : (
                        <span className={css.glow} aria-hidden="true" />
                    )}
                    <div className={css.stage}>
                        <div className={css.head}>
                            <motion.span
                                className={css.side}
                                style={{ alignItems: "flex-end", textAlign: "right" }}
                                initial={{ opacity: 0, x: 60 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 40, transition: { duration: 0.24, ease: "easeIn" } }}
                                transition={{ duration: 0.55, delay: 0.38, ease: EASE }}
                            >
                                <span className={css.event}>{event}</span>
                                {stage ? <span className={css.caption}>{stage}</span> : null}
                            </motion.span>
                            <span className={css.medal_slot}>
                                <span className={`${css.ring} ${css.ring_1}`} aria-hidden="true" />
                                <span className={`${css.ring} ${css.ring_2}`} aria-hidden="true" />
                                <motion.span
                                    className={plate ? css.plate : `${base.series_label_medallion} ${css.medal}`}
                                    initial={{ opacity: 0, scale: 0.3 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.22, ease: "easeIn" } }}
                                    transition={{ duration: 0.5, delay: 0.12, ease: POP }}
                                >
                                    {plate ?? medallion}
                                </motion.span>
                            </span>
                            <motion.span
                                className={css.side}
                                style={{ alignItems: "flex-start" }}
                                initial={{ opacity: 0, x: -60 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40, transition: { duration: 0.24, ease: "easeIn" } }}
                                transition={{ duration: 0.55, delay: 0.38, ease: EASE }}
                            >
                                <span className={css.title}>
                                    {big}
                                    {showSeriesMatchNumber ? <span className={`${base.points} ${css.number}`}>#{seriesMatchNumber}</span> : null}
                                </span>
                            </motion.span>
                        </div>
                        <motion.span
                            className={css.best_of}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.4, delay: 0.7, ease: POP }}
                        >
                            <BestOfBadge bestOf={setsToWin * 2 - 1} size={24} />
                        </motion.span>
                        <motion.span
                            className={css.divider}
                            aria-hidden="true"
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.6, delay: 0.82, ease: EASE }}
                        />
                        <div className={css.teams}>
                            {["left", "right"].map((side) => {
                                const team = side === "left" ? seriesState.leftTeam : seriesState.rightTeam;
                                const dir = side === "left" ? -1 : 1;
                                return (
                                    <motion.div
                                        key={side}
                                        className={`${css.team} ${side === "right" ? css.team_right : ""}`}
                                        initial={{ opacity: 0, x: dir * 140 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: dir * 90, transition: { duration: 0.28, ease: "easeIn" } }}
                                        transition={{ duration: 0.6, delay: 1.0, ease: EASE }}
                                    >
                                        <motion.span
                                            className={css.disc}
                                            style={{ background: team?.gradient ?? team?.color, "--team-color": team?.color ?? "#8b909e" }}
                                            initial={{ scale: 0.5, rotate: dir * -40 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ duration: 0.7, delay: 1.0, ease: POP }}
                                        />
                                        <span className={`${base.team_name_fancy} ${css.name}`} style={gradientText(team)}>
                                            <span className={base.team_name_prefix}>Team</span> {team?.name}
                                        </span>
                                    </motion.div>
                                );
                            })}
                            <motion.span
                                className={`${base.series_label_medallion} ${css.vs}`}
                                initial={{ opacity: 0, scale: 2.2 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.42, delay: 1.35, ease: POP }}
                            >
                                VS
                            </motion.span>
                        </div>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
