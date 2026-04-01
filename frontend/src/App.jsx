import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import InternshipPage from "./pages/InternshipPage.jsx";
import OffersPage from "./pages/OffersPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import StudentProfilePage from "./pages/StudentProfilePage.jsx";
import VerificationHubPage from "./pages/VerificationHubPage.jsx";
import AdminReviewPage from "./pages/AdminReviewPage.jsx";
import VerifyCertificatePage from "./pages/VerifyCertificatePage.jsx";

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/verify/:id" element={<VerifyCertificatePage />} />
    <Route
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<StudentProfilePage />} />
      <Route path="/verification" element={<VerificationHubPage />} />
      <Route path="/admin" element={<AdminReviewPage />} />
      <Route path="/internships" element={<InternshipPage />} />
      <Route path="/offers" element={<OffersPage />} />
    </Route>
  </Routes>
);

export default App;
