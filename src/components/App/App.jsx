import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage/HomePage";
import Loader from '../Loader/Loader';
import Layout from '../Layout/Layout'
import GetOutPage from "../../pages/GetOutPage/GetOutPage";
import GamblingPage from '../../pages/GamblingPage/GamblingPage'
import SpecialModePage from "../../pages/SpecialModePage/SpecialModePage";
import SpecialModeInfoPage from '../../pages/SpecialModeInfoPage/SpecialModeInfoPage'

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
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
