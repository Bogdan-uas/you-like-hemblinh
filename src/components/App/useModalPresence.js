import { useEffect, useState } from "react";

const MODAL_SELECTOR = [
    "[class*='restart_modal']",
    "[class*='modal_overlay']",
    "[class*='settings_overlay']",
    "[class*='tournament_picker_overlay']",
    "[class*='breakdown_modal']",
    "[role='dialog']",
    "[aria-modal='true']",
].join(", ");

const isShown = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
};

const hasOpenModal = () => [...document.querySelectorAll(MODAL_SELECTOR)].some(isShown);

export function useModalPresence() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        let frame = 0;
        const check = () => {
            frame = 0;
            setIsModalOpen(hasOpenModal());
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(check);
        };

        const observer = new MutationObserver(schedule);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "role", "aria-modal"] });
        schedule();

        return () => {
            observer.disconnect();
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return isModalOpen;
}
