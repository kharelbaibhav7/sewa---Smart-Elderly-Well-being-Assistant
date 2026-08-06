import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GuardianDashboard from "./pages/GuardianDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (Ideally wrapped in AuthGuard) */}
        <Route path="/guardian/dashboard" element={<GuardianDashboard />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
      </Routes>
    </>
  );
}

export default App;
