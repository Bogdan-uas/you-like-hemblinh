import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage/HomePage";
import Loader from '../Loader/Loader';
import Layout from '../Layout/Layout'
import GetOutPage from "../../pages/GetOutPage/GetOutPage";
import GamblingPage from '../../pages/GamblingPage/GamblingPage'
import SpecialModePage from "../../pages/SpecialModePage/SpecialModePage.jsx";
import SpecialModeInfoPage from '../../pages/SpecialModeInfoPage/SpecialModeInfoPage'

import { Toaster } from "react-hot-toast";
import { AppToast } from "./AppToast.jsx";
import { useModalPresence } from "./useModalPresence.js";

function App() {
  const isModalOpen = useModalPresence();

  return (
    <>
      <Toaster
        position={isModalOpen ? "bottom-right" : "top-center"}
        reverseOrder={false}
        gutter={10}
        containerStyle={isModalOpen ? { bottom: 24, right: 24 } : undefined}
      >
        {(t) => <AppToast t={t} />}
      </Toaster>
      <Suspense fallback={<Loader />}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/get-out" element={<GetOutPage />} />
            <Route path="/gambling" element={<GamblingPage />} />
            <Route path="/special-mode" element={<SpecialModePage />} />
            <Route path="/special-mode-info" element={<SpecialModeInfoPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </Suspense>
    </>
  )
};

export default App;
