import { useEffect } from "react";
import css from "./GlobalTips.module.css";
import { NUMBERED_TOURNAMENT_TYPES } from "./tournamentTypes.jsx";
import { getAnniversaryTheme, getTournamentNumberStyle } from "./winnersAndPickem.js";

const NUMBER_PATTERN = /(#\d+|Season \d+)/;
const TOURNAMENT_NAMES = [...new Set(NUMBERED_TOURNAMENT_TYPES.flatMap((type) => [type.label, type.longLabel]).filter(Boolean))];

const fillTip = (tip, text) => {
    const named = TOURNAMENT_NAMES.some((name) => text.includes(name));
    if (!named || !NUMBER_PATTERN.test(text)) {
        tip.textContent = text;
        return;
    }
    tip.textContent = "";
    text.split(NUMBER_PATTERN).forEach((part, i) => {
        if (i % 2 === 0) {
            if (part) tip.appendChild(document.createTextNode(part));
            return;
        }
        const style = getTournamentNumberStyle(getAnniversaryTheme(Number(part.replace(/\D/g, ""))));
        if (!style) {
            tip.appendChild(document.createTextNode(part));
            return;
        }
        const span = document.createElement("span");
        span.textContent = part;
        Object.assign(span.style, style, { transition: "none" });
        tip.appendChild(span);
    });
};

const GAP = 8;
const EDGE = 6;
const SMALL_FONT_PX = 12.5;

const relativeFontPx = (el) => {
    const own = parseFloat(getComputedStyle(el).fontSize) || 16;
    const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return (own / root) * 16;
};

export function useGlobalTips() {
    useEffect(() => {
        const tip = document.createElement("div");
        tip.className = css.tip;
        tip.setAttribute("role", "tooltip");
        document.body.appendChild(tip);

        const ours = new WeakSet();
        let current = null;

        const place = () => {
            if (!current || !current.isConnected) {
                hide();
                return;
            }
            const rect = current.getBoundingClientRect();
            const width = tip.offsetWidth;
            const height = tip.offsetHeight;
            let top = rect.top - height - GAP;
            let below = false;
            if (top < EDGE) {
                top = rect.bottom + GAP;
                below = true;
            }
            const left = Math.max(EDGE, Math.min(window.innerWidth - width - EDGE, rect.left + rect.width / 2 - width / 2));
            tip.style.left = `${left}px`;
            tip.style.top = `${top}px`;
            tip.classList.toggle(css.below, below);
        };

        const hide = () => {
            current = null;
            tip.classList.remove(css.shown);
        };

        const show = (el) => {
            const text = el.getAttribute("data-tip");
            if (!text) {
                hide();
                return;
            }
            current = el;
            fillTip(tip, text);
            const size = el.getAttribute("data-tip-size") ?? (relativeFontPx(el) <= SMALL_FONT_PX ? "small" : "normal");
            tip.classList.toggle(css.small, size === "small");
            tip.classList.remove(css.shown);
            place();
            void tip.offsetWidth;
            tip.classList.add(css.shown);
        };

        const convert = (el) => {
            const text = el.getAttribute("title");
            if (text == null) return;
            ours.add(el);
            el.removeAttribute("title");
            if (text) {
                el.setAttribute("data-tip", text);
                if (!el.hasAttribute("aria-label") && !el.textContent.trim()) el.setAttribute("aria-label", text);
            } else {
                el.removeAttribute("data-tip");
            }
            if (el === current) show(el);
        };

        const scan = (node) => {
            if (node.nodeType !== 1) return;
            if (node.hasAttribute("title")) convert(node);
            node.querySelectorAll("[title]").forEach(convert);
        };

        scan(document.body);

        const observer = new MutationObserver((records) => {
            records.forEach((record) => {
                if (record.type === "childList") {
                    record.addedNodes.forEach(scan);
                    if (current && !current.isConnected) hide();
                    return;
                }
                const el = record.target;
                if (el.hasAttribute("title")) convert(el);
                else if (ours.has(el)) ours.delete(el);
                else if (el.hasAttribute("data-tip")) {
                    el.removeAttribute("data-tip");
                    if (el === current) hide();
                }
            });
        });
        observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["title"] });

        const onOver = (e) => {
            const target = e.target instanceof Element ? e.target.closest("[data-tip], [title]") : null;
            if (target?.hasAttribute("title")) convert(target);
            if (target === current) return;
            if (target?.getAttribute("data-tip")) show(target);
            else hide();
        };

        const onOut = (e) => {
            if (!current) return;
            const next = e.relatedTarget instanceof Element ? e.relatedTarget.closest("[data-tip]") : null;
            if (next !== current) hide();
        };

        const onScroll = () => {
            if (current) place();
        };

        document.addEventListener("pointerover", onOver, true);
        document.addEventListener("pointerout", onOut, true);
        document.addEventListener("pointerdown", hide, true);
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("blur", hide);

        return () => {
            observer.disconnect();
            document.removeEventListener("pointerover", onOver, true);
            document.removeEventListener("pointerout", onOut, true);
            document.removeEventListener("pointerdown", hide, true);
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("blur", hide);
            tip.remove();
        };
    }, []);
}
