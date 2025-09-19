import { Suspense } from "react";
import Loader from "../Loader/Loader";

export default function Layout({ children }) {
    return (
        <div>
            <main>
                <Suspense fallback={<Loader />}>
                    {children}
                </Suspense>
            </main>
        </div>
    );
}