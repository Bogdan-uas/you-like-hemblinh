export const isNativeScrollArea = (node) => {
    if (!(node instanceof HTMLElement)) return false;
    if (node === document.body || node === document.documentElement) return false;

    const { overflowY } = window.getComputedStyle(node);
    if (overflowY !== "auto" && overflowY !== "scroll") return false;

    return node.scrollHeight > node.clientHeight + 1;
};

export const snapToDevicePixel = (value) => {
    const dpr = window.devicePixelRatio || 1;
    return Math.round(value * dpr) / dpr;
};
