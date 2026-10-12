import toastLib from "react-hot-toast";

const afterRender = (fn) => (...args) => {
    queueMicrotask(() => fn(...args));
};

const toast = afterRender(toastLib);
toast.success = afterRender(toastLib.success);
toast.error = afterRender(toastLib.error);
toast.dismiss = afterRender(toastLib.dismiss);

export default toast;
