export const teamFill = (team) => team?.gradient || team?.color || "#8a8d99";

export const formatHallDate = (iso, month = "short") => {
    const time = Date.parse(iso ?? "");
    if (!Number.isFinite(time)) return null;
    return new Date(time).toLocaleDateString("en-GB", { day: "numeric", month, year: "numeric" });
};

export const glowOf = (color) => `0 0 2px rgba(0, 0, 0, 0.7), 0 0 6px ${color ?? "#2e2f42"}, 0 0 14px ${color ?? "#2e2f42"}66, 0 1px 3px rgba(0, 0, 0, 0.4)`;

export const anniversaryFrameOf = (theme) => (theme ? { "--anniv-gradient": theme.gradient.slice(theme.gradient.lastIndexOf("linear-gradient(")), "--anniv-glow": theme.glow } : {});

let morphSource = null;

export const setHallMorphSource = (element) => {
    if (!element) {
        morphSource = null;
        return;
    }
    const head = element.querySelector("[data-morph=\"head\"]");
    const cardStyle = getComputedStyle(element);
    const keyed = {};
    element.querySelectorAll("[data-morph-key]").forEach((el) => {
        const r = el.getBoundingClientRect();
        keyed[el.dataset.morphKey] = { left: r.left, top: r.top, width: r.width, height: r.height, font: parseFloat(getComputedStyle(el).fontSize) || 0 };
    });
    const clone = element.cloneNode(true);
    clone.querySelectorAll("[data-morph-key]").forEach((el) => {
        if (el.dataset.morphKey !== "title") el.style.visibility = "hidden";
    });
    morphSource = {
        rect: element.getBoundingClientRect(),
        headRect: head?.getBoundingClientRect() ?? null,
        headBg: head ? getComputedStyle(head).backgroundImage : "none",
        bodyBg: cardStyle.backgroundImage !== "none" ? cardStyle.backgroundImage : cardStyle.backgroundColor,
        keyed,
        clone,
        at: performance.now(),
    };
};

export const takeHallMorphSource = () => {
    const source = morphSource;
    morphSource = null;
    return source && performance.now() - source.at < 1500 ? source : null;
};

const MORPH_EASE = "cubic-bezier(0.65, 0, 0.25, 1)";

const shell = (rect, background, radius) => {
    const el = document.createElement("div");
    Object.assign(el.style, {
        position: "absolute",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        background,
        borderRadius: radius,
        transformOrigin: "0 0",
        transition: "none",
        overflow: "hidden",
    });
    return el;
};

const box = (rect, radius, extra = {}) => ({ left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: radius, ...extra });

export const playHallMorph = (source, target, duration = 820) => {
    const { bg, banner, pickem, keyed = [], extras = [] } = target ?? {};
    if (!source || !banner || !pickem || !source.headRect) return;
    const bannerRect = banner.getBoundingClientRect();
    const pickemRect = pickem.getBoundingClientRect();
    if (!bannerRect.width || !pickemRect.width) return;

    const layer = document.createElement("div");
    Object.assign(layer.style, { position: "fixed", inset: "0", zIndex: "19", pointerEvents: "none", transition: "none", background: "#ffffff" });

    const { rect, headRect } = source;
    const bodyRect = { left: rect.left, top: headRect.bottom, width: rect.width, height: rect.bottom - headRect.bottom };
    const head = shell(headRect, source.headBg, "18px 18px 0 0");
    const body = shell(bodyRect, source.bodyBg, "0 0 18px 18px");
    const tint = document.createElement("div");
    const pickemBg = bg?.querySelector("[data-won]");
    Object.assign(tint.style, { position: "absolute", inset: "0", background: pickemBg ? getComputedStyle(pickemBg).backgroundImage : "#23913d", opacity: "0", transition: "none" });
    body.appendChild(tint);

    const clone = source.clone;
    Object.assign(clone.style, {
        position: "absolute",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: "0",
        transform: "none",
        transition: "none",
        contentVisibility: "visible",
    });

    layer.append(body, head, clone);
    document.body.appendChild(layer);

    const timing = { duration, easing: MORPH_EASE, fill: "forwards" };
    head.animate([box(headRect, "18px 18px 0 0"), box(bannerRect, "22px 22px 0 0")], timing);
    body.animate([box(bodyRect, "0 0 18px 18px"), box(pickemRect, "0 0 22px 22px")], timing);
    tint.animate([{ opacity: 0 }, { opacity: 0, offset: 0.15 }, { opacity: 1, offset: 0.7 }, { opacity: 1 }], { duration, fill: "forwards" });
    clone.animate([{ opacity: 1 }, { opacity: 0, offset: 0.3 }, { opacity: 0 }], { duration, fill: "forwards" });

    keyed.forEach((el) => {
        const from = source.keyed[el.dataset.morphKey];
        const to = el.getBoundingClientRect();
        if (!from || !to.width || !to.height) {
            el.animate([{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { duration });
            return;
        }
        const toFont = parseFloat(getComputedStyle(el).fontSize) || 0;
        const isText = el.dataset.morphKey === "title";
        const k = isText && from.font && toFont ? from.font / toFont : from.height / to.height;
        if (isText) el.animate([{ opacity: 0 }, { opacity: 1, offset: 0.45 }, { opacity: 1 }], { duration });
        el.animate(
            [
                { transformOrigin: "0 0", transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${k})` },
                { transformOrigin: "0 0", transform: "translate(0px, 0px) scale(1)" },
            ],
            { duration, easing: MORPH_EASE },
        );
    });
    extras.forEach((el) => el.animate([{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }], { duration }));
    bg?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.99 }, { opacity: 1 }], { duration });
    layer.animate([{ opacity: 1 }, { opacity: 1, offset: duration / (duration + 260) }, { opacity: 0 }], { duration: duration + 260, fill: "forwards" }).finished.catch(() => null).finally(() => layer.remove());
};

let returnSource = null;

const visualFont = (el, rect) => {
    const base = parseFloat(getComputedStyle(el).fontSize) || 0;
    return el.offsetHeight ? base * (rect.height / el.offsetHeight) : base;
};

export const setHallReturnSource = (root, recordId) => {
    if (!root) {
        returnSource = null;
        return;
    }
    const banner = root.querySelector("[data-part=\"banner\"]");
    const pickem = root.querySelector("[data-part=\"pickem\"]");
    const bannerBg = root.querySelector("[data-bg=\"banner\"]");
    const pickemBg = root.querySelector("[data-bg=\"pickem\"]");
    if (!banner || !pickem) return;
    const keyed = {};
    root.querySelectorAll("[data-morph-key]").forEach((el) => {
        const r = el.getBoundingClientRect();
        keyed[el.dataset.morphKey] = { left: r.left, top: r.top, width: r.width, height: r.height, font: visualFont(el, r) };
    });
    const title = root.querySelector("[data-morph-key=\"title\"]");
    const titleRect = title?.getBoundingClientRect() ?? null;
    returnSource = {
        recordId,
        bannerRect: banner.getBoundingClientRect(),
        pickemRect: pickem.getBoundingClientRect(),
        bannerBg: bannerBg ? getComputedStyle(bannerBg).backgroundImage : "none",
        pickemBg: pickemBg ? getComputedStyle(pickemBg).backgroundImage : "none",
        keyed,
        titleClone: title && titleRect ? { node: title.cloneNode(true), rect: titleRect, font: visualFont(title, titleRect), color: getComputedStyle(title).color } : null,
        at: performance.now(),
    };
};

export const takeHallReturnSource = () => {
    const source = returnSource;
    returnSource = null;
    return source && performance.now() - source.at < 1500 ? source : null;
};

export const playHallReturn = (source, card, faders = [], duration = 820) => {
    const head = card?.querySelector("[data-morph=\"head\"]");
    const bar = card?.querySelector("[data-morph=\"bar\"]");
    if (!source || !card || !head || !bar) return;
    const cardRect = card.getBoundingClientRect();
    const headRect = head.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();
    const bodyRect = { left: cardRect.left, top: headRect.bottom, width: cardRect.width, height: cardRect.bottom - headRect.bottom };
    const cardStyle = getComputedStyle(card);
    const bodyBg = cardStyle.backgroundImage !== "none" ? cardStyle.backgroundImage : cardStyle.backgroundColor;
    const headBg = getComputedStyle(head).backgroundImage;
    const barBg = getComputedStyle(bar).backgroundImage;

    card.dataset.returning = "";
    card.style.contentVisibility = "visible";

    const under = document.createElement("div");
    Object.assign(under.style, { position: "fixed", inset: "0", zIndex: "0", pointerEvents: "none", transition: "none" });
    const over = document.createElement("div");
    Object.assign(over.style, { position: "fixed", inset: "0", zIndex: "60", pointerEvents: "none", transition: "none" });

    const place = (rect, background, radius) => shell(rect, background, radius);
    const bodyShell = place(bodyRect, bodyBg, "0 0 18px 18px");
    const headShell = place(source.bannerRect, source.bannerBg, "0");
    const headTint = document.createElement("div");
    Object.assign(headTint.style, { position: "absolute", inset: "0", background: headBg, opacity: "0", transition: "none" });
    headShell.appendChild(headTint);
    const barShell = place(source.pickemRect, source.pickemBg, "0");
    const barTint = document.createElement("div");
    Object.assign(barTint.style, { position: "absolute", inset: "0", background: barBg, opacity: "0", transition: "none" });
    barShell.appendChild(barTint);
    under.append(bodyShell, headShell, barShell);
    document.body.prepend(under);

    if (source.titleClone) {
        const { node, rect, font, color } = source.titleClone;
        Object.assign(node.style, { position: "absolute", left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, margin: "0", fontSize: `${font}px`, lineHeight: "1.08", color, whiteSpace: "nowrap", transformOrigin: "0 0", transition: "none" });
        over.appendChild(node);
        document.body.appendChild(over);
        const titleEl = card.querySelector("[data-morph-key=\"title\"]");
        const to = titleEl?.getBoundingClientRect();
        const k = to && font ? (parseFloat(getComputedStyle(titleEl).fontSize) || font) / font : 1;
        node.animate(
            [
                { transform: "none", opacity: 1 },
                { transform: to ? `translate(${(to.left - rect.left) * 0.5}px, ${(to.top - rect.top) * 0.5}px) scale(${1 + (k - 1) * 0.5})` : "none", opacity: 0, offset: 0.5 },
                { transform: to ? `translate(${to.left - rect.left}px, ${to.top - rect.top}px) scale(${k})` : "none", opacity: 0 },
            ],
            { duration, easing: MORPH_EASE, fill: "forwards" },
        );
    }

    const timing = { duration, easing: MORPH_EASE, fill: "forwards" };
    headShell.animate([box(source.bannerRect, "22px 22px 0 0"), box(headRect, "18px 18px 0 0")], timing);
    headTint.animate([{ opacity: 0 }, { opacity: 1 }], timing);
    barShell.animate([box(source.pickemRect, "0 0 22px 22px"), box(barRect, "12px")], timing);
    barTint.animate([{ opacity: 0 }, { opacity: 1 }], timing);
    bodyShell.animate([box(source.pickemRect, "0 0 22px 22px", { opacity: 0 }), box(bodyRect, "0 0 18px 18px", { opacity: 1 })], timing);

    if (!over.isConnected) document.body.appendChild(over);
    const hidden = [];
    card.querySelectorAll("[data-morph-key]").forEach((el) => {
        const from = source.keyed[el.dataset.morphKey];
        const to = el.getBoundingClientRect();
        if (!from || !to.width || !to.height) {
            el.animate([{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { duration });
            return;
        }
        const cs = getComputedStyle(el);
        const isText = el.dataset.morphKey === "title";
        const toFont = parseFloat(cs.fontSize) || 0;
        const k = isText && from.font && toFont ? from.font / toFont : from.height / to.height;
        const flyer = el.cloneNode(true);
        Object.assign(flyer.style, {
            position: "absolute",
            left: `${to.left}px`,
            top: `${to.top}px`,
            width: `${to.width}px`,
            height: `${to.height}px`,
            margin: "0",
            boxSizing: "border-box",
            display: cs.display,
            color: cs.color,
            fontFamily: cs.fontFamily,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            fontStyle: cs.fontStyle,
            lineHeight: cs.lineHeight,
            letterSpacing: cs.letterSpacing,
            textShadow: cs.textShadow,
            textAlign: cs.textAlign,
            transformOrigin: "0 0",
            transition: "none",
        });
        over.appendChild(flyer);
        el.style.opacity = "0";
        hidden.push(el);
        if (isText) flyer.animate([{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], { duration, fill: "forwards" });
        flyer.animate(
            [
                { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${k})` },
                { transform: "translate(0px, 0px) scale(1)" },
            ],
            { duration, easing: MORPH_EASE, fill: "forwards" },
        );
    });
    card.querySelectorAll("[data-morph-fade]").forEach((el) => el.animate([{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { duration: duration + 120 }));
    faders.forEach((el) => el.animate([{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1 }], { duration: duration + 320, easing: "ease-out" }));

    window.setTimeout(() => {
        card.dataset.settling = "";
        delete card.dataset.returning;
        card.style.contentVisibility = "";
        requestAnimationFrame(() => requestAnimationFrame(() => delete card.dataset.settling));
        hidden.forEach((el) => {
            el.style.opacity = "";
        });
        under.remove();
        over.remove();
    }, duration);
};
