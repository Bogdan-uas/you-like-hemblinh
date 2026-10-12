import { useRef, useEffect } from "react";

export function useHallDragScroll() {
    const hallScrollRef = useRef(null);
    const hallScrollTargetRef = useRef(0);
    const hallScrollFrameRef = useRef(null);

    const hallDragRef = useRef({
        isDown: false,
        isDragging: false,
        pointerId: null,
        startX: 0,
        startScrollLeft: 0,
        lastX: 0,
        lastTime: 0,
        velocity: 0,
    });
    const hallMomentumFrameRef = useRef(null);
    const hallSuppressClickRef = useRef(false);

    const HALL_DRAG_THRESHOLD = 4;

    const stopHallMomentum = () => {
        if (hallMomentumFrameRef.current) {
            cancelAnimationFrame(hallMomentumFrameRef.current);
            hallMomentumFrameRef.current = null;
        }
    };

    const stopHallWheelGlide = () => {
        if (hallScrollFrameRef.current) {
            cancelAnimationFrame(hallScrollFrameRef.current);
            hallScrollFrameRef.current = null;
        }
    };

    const startHallMomentum = (releaseVelocity) => {
        const container = hallScrollRef.current;
        if (!container) return;

        let velocity = releaseVelocity * 16;

        if (Math.abs(velocity) < 0.4) {
            hallScrollTargetRef.current = container.scrollLeft;
            return;
        }

        const maxVelocity = 140;
        velocity = Math.max(-maxVelocity, Math.min(velocity, maxVelocity));

        const friction = 0.94;

        const step = () => {
            velocity *= friction;

            if (Math.abs(velocity) < 0.1) {
                hallMomentumFrameRef.current = null;
                hallScrollTargetRef.current = container.scrollLeft;
                return;
            }

            const maxScroll = container.scrollWidth - container.clientWidth;
            const next = Math.max(0, Math.min(container.scrollLeft + velocity, maxScroll));

            if (next === container.scrollLeft) {
                hallMomentumFrameRef.current = null;
                hallScrollTargetRef.current = container.scrollLeft;
                return;
            }

            container.scrollLeft = next;
            hallScrollTargetRef.current = next;
            hallMomentumFrameRef.current = requestAnimationFrame(step);
        };

        hallMomentumFrameRef.current = requestAnimationFrame(step);
    };

    const handleHallPointerDown = (e) => {
        const container = hallScrollRef.current;
        if (!container) return;
        if (e.pointerType === "touch") return;
        if (e.pointerType === "mouse" && e.button !== 0) return;

        stopHallMomentum();
        stopHallWheelGlide();

        hallSuppressClickRef.current = false;

        const drag = hallDragRef.current;
        drag.isDown = true;
        drag.isDragging = false;
        drag.pointerId = e.pointerId;
        drag.startX = e.clientX;
        drag.startScrollLeft = container.scrollLeft;
        drag.lastX = e.clientX;
        drag.lastTime = performance.now();
        drag.velocity = 0;

        hallScrollTargetRef.current = container.scrollLeft;
    };

    const handleHallPointerMove = (e) => {
        const container = hallScrollRef.current;
        const drag = hallDragRef.current;
        if (!container || !drag.isDown || e.pointerId !== drag.pointerId) return;

        const travelled = e.clientX - drag.startX;

        if (!drag.isDragging) {
            if (Math.abs(travelled) < HALL_DRAG_THRESHOLD) return;

            drag.isDragging = true;
            hallSuppressClickRef.current = true;
            container.style.cursor = "grabbing";
            container.style.userSelect = "none";

            try {
                container.setPointerCapture(e.pointerId);
            } catch {
                // ignore
            }
        }

        e.preventDefault();

        const maxScroll = container.scrollWidth - container.clientWidth;
        const nextScrollLeft = Math.max(
            0,
            Math.min(drag.startScrollLeft - travelled, maxScroll)
        );

        container.scrollLeft = nextScrollLeft;
        hallScrollTargetRef.current = nextScrollLeft;

        const now = performance.now();
        const elapsed = now - drag.lastTime;

        if (elapsed > 0) {
            const instant = (drag.lastX - e.clientX) / elapsed;
            drag.velocity = drag.velocity * 0.7 + instant * 0.3;
            drag.lastX = e.clientX;
            drag.lastTime = now;
        }
    };

    const handleHallPointerUp = (e) => {
        const container = hallScrollRef.current;
        const drag = hallDragRef.current;
        if (!drag.isDown) return;
        if (drag.pointerId !== null && e.pointerId !== drag.pointerId) return;

        if (container) {
            container.style.cursor = "grab";
            container.style.userSelect = "";

            try {
                if (drag.pointerId !== null && container.hasPointerCapture(drag.pointerId)) {
                    container.releasePointerCapture(drag.pointerId);
                }
            } catch {
                // ignore
            }
        }

        const wasDragging = drag.isDragging;
        const releaseVelocity = drag.velocity;

        drag.isDown = false;
        drag.isDragging = false;
        drag.pointerId = null;
        drag.velocity = 0;

        const wentStale = performance.now() - drag.lastTime > 90;

        if (!wasDragging || !container) return;
        if (e.type === "pointercancel" || wentStale) {
            hallScrollTargetRef.current = container.scrollLeft;
            return;
        }

        startHallMomentum(releaseVelocity);
    };

    const handleHallClickCapture = (e) => {
        if (!hallSuppressClickRef.current) return;

        hallSuppressClickRef.current = false;
        e.preventDefault();
        e.stopPropagation();
    };

    const handleHallWheel = (e) => {
        const container = hallScrollRef.current;
        if (!container) return;

        if (hallMomentumFrameRef.current) {
            stopHallMomentum();
            hallScrollTargetRef.current = container.scrollLeft;
        }

        hallScrollTargetRef.current += e.deltaY;

        const maxScroll =
            container.scrollWidth - container.clientWidth;

        hallScrollTargetRef.current = Math.max(
            0,
            Math.min(hallScrollTargetRef.current, maxScroll)
        );

        if (hallScrollFrameRef.current) return;

        const animate = () => {
            const current = container.scrollLeft;
            const target = hallScrollTargetRef.current;
            const difference = target - current;

            if (Math.abs(difference) < 0.5) {
                container.scrollLeft = target;
                hallScrollFrameRef.current = null;
                return;
            }

            container.scrollLeft = current + difference * 0.06;
            hallScrollFrameRef.current = requestAnimationFrame(animate);
        };

        hallScrollFrameRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        const container = hallScrollRef.current;
        if (!container) return;

        hallScrollTargetRef.current = container.scrollLeft;

        return () => {
            if (hallScrollFrameRef.current) {
                cancelAnimationFrame(hallScrollFrameRef.current);
                hallScrollFrameRef.current = null;
            }

            if (hallMomentumFrameRef.current) {
                cancelAnimationFrame(hallMomentumFrameRef.current);
                hallMomentumFrameRef.current = null;
            }

            hallScrollTargetRef.current = 0;
        };
    }, []);

    return {
        hallScrollRef,
        handleHallWheel,
        handleHallPointerDown,
        handleHallPointerMove,
        handleHallPointerUp,
        handleHallClickCapture,
    };
}
