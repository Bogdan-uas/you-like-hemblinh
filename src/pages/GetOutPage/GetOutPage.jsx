import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import css from './GetOutPage.module.css';

const GetOutPage = () => {
    const [showMessage, setShowMessage] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        const messageTimer = setTimeout(() => setShowMessage(true), 1000);
        return () => clearTimeout(messageTimer);
    }, []);

    useEffect(() => {
        if (!showMessage) return;
        if (timeLeft <= 0) {
            setTimeout(() => {
                window.location.href = "about:blank";
            }, 300);
            return;
        }

        const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, showMessage]);

    const handleReconsider = () => {
        navigate("/");
    };

    return (
        <div className={css.getOut_container}>
            <span className={css.then}>Then,</span>
            <div className={`${css.message_block} ${showMessage ? css.visible : ''}`}>
                <h2 className={css.get_out_text}>get the hell out of here!</h2>
                <p className={css.timer}>{timeLeft}s</p>
                <button className={css.reconsider_button} onClick={handleReconsider}>
                    I reconsidered my decision!
                </button>
            </div>
        </div>
    );
};

export default GetOutPage;