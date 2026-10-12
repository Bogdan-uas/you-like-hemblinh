import { cloneElement, useEffect, useRef, useState } from "react";
import css from "../SpecialModePage.module.css";

const VARIANTS = {
    modal: { className: css.modal_closing, duration: 250 },
    overlay: { className: css.overlay_closing, duration: 350 },
};

export function FadeOut({ children, variant = "modal" }) {
    const { className, duration } = VARIANTS[variant];
    const isOpen = Boolean(children);
    const lastRef = useRef(null);
    const [closingDone, setClosingDone] = useState(true);
    if (isOpen) lastRef.current = children;

    useEffect(() => {
        if (isOpen) {
            setClosingDone(false);
            return undefined;
        }
        const timeoutId = setTimeout(() => {
            lastRef.current = null;
            setClosingDone(true);
        }, duration);
        return () => clearTimeout(timeoutId);
    }, [isOpen, duration]);

    if (isOpen) return children;
    if (closingDone || !lastRef.current) return null;

    const last = lastRef.current;
    return cloneElement(last, {
        className: `${last.props.className ?? ""} ${className}`,
        "aria-hidden": true,
    });
}
