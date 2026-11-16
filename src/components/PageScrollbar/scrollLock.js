export const PAGE_SCROLL_LOCK_EVENT = "page-scroll-lock";

let count = 0;
let saved = null;

const announce = () => window.dispatchEvent(new CustomEvent(PAGE_SCROLL_LOCK_EVENT, { detail: { locked: count > 0 } }));

export const isPageScrollLocked = () => count > 0;

export const lockPageScroll = () => {
    const root = document.documentElement;
    if (count === 0) {
        saved = [root.style.overflow, document.body.style.overflow];
        root.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        root.dataset.scrollLocked = "";
    }
    count += 1;
    announce();
    let released = false;
    return () => {
        if (released) return;
        released = true;
        count = Math.max(0, count - 1);
        if (count === 0) {
            root.style.overflow = saved?.[0] ?? "";
            document.body.style.overflow = saved?.[1] ?? "";
            delete root.dataset.scrollLocked;
            saved = null;
        }
        announce();
    };
};

let pageScroller = null;

export const registerPageScroller = (scroller) => {
    pageScroller = scroller;
    return () => {
        if (pageScroller === scroller) pageScroller = null;
    };
};

export const pageScrollTo = (top, smooth = false) => {
    if (pageScroller) {
        pageScroller.scrollTo(top, smooth ? { force: true } : { immediate: true, force: true });
        return;
    }
    window.scrollTo({ top, behavior: smooth ? "smooth" : "instant" });
};
