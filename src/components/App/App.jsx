import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage/HomePage";
import Loader from '../Loader/Loader';
import Layout from '../Layout/Layout'
import GetOutPage from "../../pages/GetOutPage/GetOutPage";
import GamblingPage from '../../pages/GamblingPage/GamblingPage'

function App() {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/get-out" element={<GetOutPage />} />
            <Route path="/gambling" element={<GamblingPage />} />
          </Routes>
        </Layout>
      </Suspense>
    </>
  )
};

export default App;
