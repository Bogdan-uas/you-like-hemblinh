import { Suspense } from "react";
import Loader from "../Loader/Loader";

export default function Layout({ children }) {
    return (
        <main>
            <Suspense fallback={<Loader />}>
                {children}
            </Suspense>
        </main>
    );
}