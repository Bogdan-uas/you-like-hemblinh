import { useCallback, useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import css from "./ImageLightbox.module.css";
import { lockPageScroll } from "../../components/PageScrollbar/scrollLock.js";

const EASE = [0.22, 1, 0.36, 1];
const DURATION = 0.34;

const CAPTION_SPACE = 84;

const fitOf = (el, withCaption) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const nw = el.naturalWidth || el.width;
    const nh = el.naturalHeight || el.height;
    const room = withCaption ? CAPTION_SPACE : 0;
    const scale = Math.min((vw * 0.92) / nw, (vh * 0.88 - room) / nh, 1);
    const width = Math.round(nw * scale);
    const height = Math.round(nh * scale);
    return { width, height, left: Math.round((vw - width) / 2), top: Math.round((vh - height - room) / 2) };
};

const fromRect = (rect, fit) => ({
    x: rect.left - fit.left,
    y: rect.top - fit.top,
    scaleX: rect.width / fit.width,
    scaleY: rect.height / fit.height,
});

export default function ImageLightbox({ className }) {
    const [open, setOpen] = useState(null);
    const sourceRef = useRef(null);

    const close = useCallback(() => {
        setOpen((current) => {
            if (!current || !sourceRef.current) return null;
            return { ...current, closing: fromRect(sourceRef.current.getBoundingClientRect(), current.fit), shown: false };
        });
    }, []);

    useEffect(() => {
        if (!className) return undefined;
        const onClick = (e) => {
            const el = e.target;
            if (!(el instanceof HTMLImageElement) || !el.classList.contains(className) || !el.complete) return;
            e.preventDefault();
            e.stopPropagation();
            const title = el.alt?.trim() || "";
            const note = el.dataset.caption?.trim() || "";
            const fit = fitOf(el, !!(title || note));
            sourceRef.current = el;
            setOpen({ src: el.currentSrc || el.src, alt: el.alt, title, note, fit, from: fromRect(el.getBoundingClientRect(), fit), shown: true, id: Date.now() });
        };
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, [className]);

    const shown = !!open?.shown;

    useEffect(() => {
        if (!shown) return undefined;
        const release = lockPageScroll();
        const onKey = (e) => {
            if (e.key !== "Escape") return;
            e.preventDefault();
            e.stopPropagation();
            close();
        };
        window.addEventListener("keydown", onKey, true);
        return () => {
            window.removeEventListener("keydown", onKey, true);
            release();
        };
    }, [shown, close]);

    const finish = () => {
        sourceRef.current = null;
        setOpen(null);
    };

    return createPortal(
        <AnimatePresence onExitComplete={finish} custom={open?.closing ?? null}>
            {shown ? (
                <motion.div
                    key={`backdrop-${open.id}`}
                    className={css.backdrop}
                    onClick={close}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DURATION, ease: EASE }}
                />
            ) : null}
            {shown ? (
                <motion.img
                    key={`image-${open.id}`}
                    className={css.image}
                    src={open.src}
                    alt={open.alt}
                    draggable={false}
                    onClick={close}
                    style={{ left: open.fit.left, top: open.fit.top, width: open.fit.width, height: open.fit.height }}
                    variants={{ from: open.from, shown: { x: 0, y: 0, scaleX: 1, scaleY: 1 }, gone: (closing) => closing ?? open.from }}
                    initial="from"
                    animate="shown"
                    exit="gone"
                    transition={{ duration: DURATION, ease: EASE }}
                />
            ) : null}
            {shown && (open.title || open.note) ? (
                <motion.div
                    key={`caption-${open.id}`}
                    className={css.caption}
                    onClick={close}
                    style={{ top: open.fit.top + open.fit.height + 14, left: "50%", x: "-50%", maxWidth: Math.min(Math.max(open.fit.width, 320), window.innerWidth * 0.92) }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.28, delay: DURATION * 0.6, ease: EASE } }}
                    exit={{ opacity: 0, y: 4, transition: { duration: 0.14, ease: "easeIn" } }}
                >
                    {open.title ? <span className={css.caption_title}>{open.title}</span> : null}
                    {open.note ? <span className={css.caption_note}>{open.note}</span> : null}
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body,
    );
}
