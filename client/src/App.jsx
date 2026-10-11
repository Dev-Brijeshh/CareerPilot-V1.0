import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import PublicOnlyRoute from "@/components/layout/PublicOnlyRoute";
import Layout from "@/components/layout/Layout";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ResumesPage from "@/pages/resumes/ResumesPage";
import ResumeDetailPage from "@/pages/resumes/ResumeDetailPage";
import AnalysisHistoryPage from "@/pages/analysis/AnalysisHistoryPage";
import AnalysisDetailPage from "@/pages/analysis/AnalysisDetailPage";
import RoadmapsPage from "@/pages/roadmaps/RoadmapsPage";
import RoadmapDetailPage from "@/pages/roadmaps/RoadmapDetailPage";
import InterviewsPage from "@/pages/interviews/InterviewsPage";
import InterviewSessionPage from "@/pages/interviews/InterviewSessionPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Authenticated app shell */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/resumes" element={<ResumesPage />} />
            <Route path="/resumes/:id" element={<ResumeDetailPage />} />
            <Route path="/analysis" element={<AnalysisHistoryPage />} />
            <Route path="/analysis/:id" element={<AnalysisDetailPage />} />
            <Route path="/roadmaps" element={<RoadmapsPage />} />
            <Route path="/roadmaps/:id" element={<RoadmapDetailPage />} />
            <Route path="/interviews" element={<InterviewsPage />} />
            <Route path="/interviews/:id" element={<InterviewSessionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
