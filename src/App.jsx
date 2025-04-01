import React from "react";
import "./App.css";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import ResidentPage from "./pages/ResidentPage";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PageNotFound from "./errors/PageNotFound";
import { useAuth } from "./services/AuthProvider";
import StaffPage from "./pages/StaffPage";
import AboutUs from "./components/AboutUs";

function App() {
  const { role } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<HomePage />} />
        <Route path="/aboutus" element={<AboutUs/>}/>

        <Route element={<ProtectedRoutes />}>
          {/* Validating admin only allowed route  */}
          {/* {role === "admin" ? (
            <Route path="/admin/*" element={<AdminPage />} />
          ) : (
            <Route path="/admin/*" element={<Navigate to="/" />} />
          )} */}
          <Route path="/admin/*" element={<AdminPage />} />

          {/* ------------------------------------------------------ */}
          {/* Validating admin and resident allowed route  */}
          {/* {role === "staff" ? (
            <Route path="/staff/*" element={<StaffPage />} />
          ) : (
            <Route path="/staff/*" element={<Navigate to="/" />} />
          )} */}
          <Route path="/staff/*" element={<StaffPage />} />
          {/* ----------------------------------------------------------- */}
          {/* Validating resident only allowed route  */}
          {role === "resident" ? (
            <Route path="/resident/*" element={<ResidentPage />} />
          ) : (
            <Route path="/resident/*" element={<Navigate to="/" />} />
          )}
        </Route>
        
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
