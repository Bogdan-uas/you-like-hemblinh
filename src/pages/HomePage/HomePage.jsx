import css from './HomePage.module.css';
import { NavLink } from "react-router-dom";

const HomePage = () => {
    return (
        <>
            <h1 className={css.main_title}>You like gambling?</h1>
            <nav className={css.nav}>
                <NavLink
                    to="/gambling"
                    className={css.link}
                >
                    Yep!
                </NavLink>
                <NavLink
                    to="/get-out"
                    className={css.pass_link}
                >
                    Nah, I'd pass
                </NavLink>
            </nav>
        </>
    );
};

export default HomePage;