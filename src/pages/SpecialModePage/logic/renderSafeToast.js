import toastLib from "react-hot-toast";

let commentaryMuted = false;

export const setCommentaryMuted = (muted) => {
    commentaryMuted = muted;
};

const afterRender = (fn) => (...args) => {
    queueMicrotask(() => fn(...args));
};

const unlessMuted = (fn) => (...args) => {
    if (!commentaryMuted) fn(...args);
};

const toast = afterRender(unlessMuted(toastLib));
toast.success = afterRender(toastLib.success);
toast.error = afterRender(toastLib.error);
toast.dismiss = afterRender(toastLib.dismiss);
toast.always = afterRender(toastLib);

export default toast;
