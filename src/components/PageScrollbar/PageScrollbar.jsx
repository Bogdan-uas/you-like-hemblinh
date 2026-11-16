import { useEffect, useRef } from "react";
import css from "./PageScrollbar.module.css";
import { PAGE_SCROLL_LOCK_EVENT, isPageScrollLocked, pageScrollTo } from "./scrollLock.js";

const MIN_THUMB = 32;

export default function PageScrollbar() {
    const trackRef = useRef(null);
    const thumbRef = useRef(null);
    const dragRef = useRef(null);

    useEffect(() => {
        const track = trackRef.current;
        const thumb = thumbRef.current;
        if (!track || !thumb) return undefined;
        const root = document.documentElement;
        let frame = 0;
        let last = null;
        let animateUntil = 0;

        const measure = () => {
            const view = window.innerHeight;
            const full = root.scrollHeight;
            const trackH = track.clientHeight;
            const range = Math.max(0, full - view);
            const thumbH = range > 0 ? Math.max(MIN_THUMB, Math.round((trackH * view) / full)) : trackH;
            return { view, full, trackH, range, thumbH, travel: Math.max(0, trackH - thumbH) };
        };

        const update = () => {
            frame = 0;
            const m = measure();
            const hidden = m.range <= 1 || isPageScrollLocked();
            if (hidden) track.dataset.hidden = "";
            else delete track.dataset.hidden;
            if (hidden) {
                if (last) last.hidden = true;
                return;
            }
            const scroll = window.scrollY;
            const jumped = !last || last.hidden || Math.abs(m.full - last.full) > 2 || Math.abs(m.view - last.view) > 2 || Math.abs(scroll - last.scroll) > m.view * 1.5;
            const now = performance.now();
            if (!!last && !last.hidden && jumped && !dragRef.current) animateUntil = now + 380;
            const animate = now < animateUntil && !dragRef.current;
            if (animate) thumb.dataset.animate = "";
            else delete thumb.dataset.animate;
            last = { full: m.full, view: m.view, scroll, hidden: false };
            thumb.style.height = `${m.thumbH}px`;
            const y = m.range > 0 ? (scroll / m.range) * m.travel : 0;
            thumb.style.transform = `translateY(${Math.min(m.travel, Math.max(0, y))}px)`;
        };

        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        const onDown = (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            thumb.setPointerCapture(e.pointerId);
            thumb.dataset.dragging = "";
            pageScrollTo(window.scrollY);
            dragRef.current = { y: e.clientY, scroll: window.scrollY, m: measure() };
        };
        const onMove = (e) => {
            const drag = dragRef.current;
            if (!drag || !drag.m.travel) return;
            const top = drag.scroll + ((e.clientY - drag.y) * drag.m.range) / drag.m.travel;
            pageScrollTo(Math.min(drag.m.range, Math.max(0, top)));
        };
        const onUp = (e) => {
            if (!dragRef.current) return;
            dragRef.current = null;
            delete thumb.dataset.dragging;
            if (thumb.hasPointerCapture(e.pointerId)) thumb.releasePointerCapture(e.pointerId);
        };
        const onTrack = (e) => {
            if (e.target !== track) return;
            const rect = thumb.getBoundingClientRect();
            const page = window.innerHeight * 0.9;
            const range = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            pageScrollTo(Math.min(range, Math.max(0, window.scrollY + (e.clientY < rect.top ? -page : page))), true);
        };

        const observer = new ResizeObserver(schedule);
        observer.observe(document.body);
        observer.observe(root);

        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        window.addEventListener(PAGE_SCROLL_LOCK_EVENT, schedule);
        thumb.addEventListener("pointerdown", onDown);
        thumb.addEventListener("pointermove", onMove);
        thumb.addEventListener("pointerup", onUp);
        thumb.addEventListener("pointercancel", onUp);
        track.addEventListener("pointerdown", onTrack);
        schedule();

        return () => {
            if (frame) cancelAnimationFrame(frame);
            observer.disconnect();
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            window.removeEventListener(PAGE_SCROLL_LOCK_EVENT, schedule);
            thumb.removeEventListener("pointerdown", onDown);
            thumb.removeEventListener("pointermove", onMove);
            thumb.removeEventListener("pointerup", onUp);
            thumb.removeEventListener("pointercancel", onUp);
            track.removeEventListener("pointerdown", onTrack);
        };
    }, []);

    return (
        <div ref={trackRef} className={css.track} data-hidden="" aria-hidden="true">
            <div ref={thumbRef} className={css.thumb} />
        </div>
    );
}
