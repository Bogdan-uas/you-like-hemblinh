import { useState } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import css from "./HomePage.module.css";

const HomePage = () => {
    const [isShrinking, setIsShrinking] = useState(false);
    const navigate = useNavigate();

    const handleYepClick = (e) => {
        e.preventDefault();
        setIsShrinking(true);
        setTimeout(() => {
            navigate("/gambling");
        }, 900);
    };

    return (
        <div className={`${css.home_container} ${isShrinking ? css.shrink : ""}`}>
            <h1 className={css.main_title}>You like gambling?</h1>
            <nav className={css.nav}>
                <Link to="/gambling" className={css.link} onClick={handleYepClick}>
                    Yep!
                </Link>
                <NavLink to="/get-out" className={css.pass_link}>
                    Nah, I'd pass
                </NavLink>
            </nav>
        </div>
    );
};

export default HomePage;