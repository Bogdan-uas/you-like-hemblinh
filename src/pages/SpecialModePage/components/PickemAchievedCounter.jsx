import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useAnimation } from "framer-motion";
import {
    PICKEM_WIN_COUNT_MS,
    PICKEM_LOSS_COUNT_MS,
    PICKEM_SLOWDOWN,
    PICKEM_SNAP_DELAY_MS,
    PICKEM_INTRO_SCALE,
    PICKEM_INTRO_HOLD_S,
    PICKEM_INTRO_MOVE_S,
} from "../logic/winnersAndPickem.js";

export const PickemAchievedCounter = ({ run, instant, finalPoints, neededPoints, onSettled, className, style }) => {
    const anchorRef = useRef(null);
    const controls = useAnimation();
    const onSettledRef = useRef(onSettled);
    const [display, setDisplay] = useState(() => (instant ? finalPoints : 0));

    useEffect(() => {
        onSettledRef.current = onSettled;
    });

    useEffect(() => {
        if (!run) {
            setDisplay(0);
            controls.set({ opacity: 0, x: 0, y: 0, scale: 1 });
            return undefined;
        }

        if (instant) {
            controls.set({ opacity: 1, x: 0, y: 0, scale: 1 });
            setDisplay(finalPoints);
            onSettledRef.current?.();
            return undefined;
        }

        let cancelled = false;
        let rafId = 0;
        let snapTimer = 0;

        const needed = neededPoints;
        const final = finalPoints;
        const won = final >= needed;
        const endValue = won ? needed : final;
        const duration = won ? PICKEM_WIN_COUNT_MS : PICKEM_LOSS_COUNT_MS;
        const qEnd = endValue > 0 && needed > 0
            ? 1 - Math.pow(1 - endValue / needed, 1 / PICKEM_SLOWDOWN)
            : 0;
        const valueAt = (t) => {
            const q = qEnd * Math.min(t / duration, 1);
            return needed * (1 - Math.pow(1 - q, PICKEM_SLOWDOWN));
        };

        const finish = () => {
            if (won) {
                snapTimer = setTimeout(() => {
                    if (cancelled) return;
                    setDisplay(final);
                    onSettledRef.current?.();
                }, PICKEM_SNAP_DELAY_MS);
            } else {
                onSettledRef.current?.();
            }
        };

        const startCounting = () => {
            if (qEnd === 0) {
                setDisplay(final);
                finish();
                return;
            }
            const startTime = performance.now();
            let last = -1;
            const tick = (now) => {
                if (cancelled) return;
                const t = now - startTime;
                const done = t >= duration;
                const value = done ? endValue : Math.floor(valueAt(t) + 1e-6);
                if (value !== last) {
                    last = value;
                    setDisplay(value);
                }
                if (done) finish();
                else rafId = requestAnimationFrame(tick);
            };
            rafId = requestAnimationFrame(tick);
        };

        const playIntro = async () => {
            const rect = anchorRef.current.getBoundingClientRect();
            const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
            const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);

            controls.set({ opacity: 0, x: dx, y: dy, scale: PICKEM_INTRO_SCALE });
            await controls.start({ opacity: 1, transition: { duration: 0.4 } });
            if (cancelled) return;
            await controls.start({
                x: 0,
                y: 0,
                scale: 1,
                transition: { delay: PICKEM_INTRO_HOLD_S, duration: PICKEM_INTRO_MOVE_S, ease: [0.22, 1, 0.36, 1] },
            });
            if (cancelled) return;
            startCounting();
        };
        playIntro();

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            clearTimeout(snapTimer);
            controls.stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [run]);

    return (
        <span ref={anchorRef} style={{ display: "inline-block" }}>
            <motion.span
                animate={controls}
                initial={{ opacity: instant ? 1 : 0, x: 0, y: 0, scale: 1 }}
                className={className}
                style={{
                    display: "inline-block",
                    position: "relative",
                    zIndex: 1000,
                    fontVariantNumeric: "tabular-nums",
                    minWidth: `${String(finalPoints).length}ch`,
                    ...style,
                }}
            >
                {display}
            </motion.span>
        </span>
    );
};
