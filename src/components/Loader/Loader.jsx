import css from "./Loader.module.css";

const Loader = () => {
    return (
        <div className={css.loader_overlay}>
            <div className={css.loader_container}>
                <div className={css.dot}></div>
                <div className={css.dot}></div>
                <div className={css.dot}></div>
            </div>
        </div>
    );
};

export default Loader;