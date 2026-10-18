const readUnit = () =>
    typeof document === "undefined"
        ? 1
        : parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;

let unit = readUnit();

if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
        unit = readUnit();
    });
}

export const rubberUnit = () => unit;

export const rubberPx = (value) => value * unit;

export const centerOverflowX = (element) => {
    if (!element) return undefined;
    let touched = false;
    const center = () => {
        if (!touched) element.scrollLeft = Math.max(0, (element.scrollWidth - element.clientWidth) / 2);
    };
    const stop = () => {
        touched = true;
    };
    const observer = new ResizeObserver(center);
    [...element.children].forEach((child) => observer.observe(child));
    element.addEventListener("pointerdown", stop);
    element.addEventListener("wheel", stop, { passive: true });
    element.addEventListener("touchstart", stop, { passive: true });
    requestAnimationFrame(center);
    return () => observer.disconnect();
};
