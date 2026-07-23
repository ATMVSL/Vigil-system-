import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicLayout } from "@/components/PublicLayout";
import { PublicOnlyRoute } from "@/components/PublicOnlyRoute";
import { ViktorProductAuthProvider } from "@/lib/viktor-spaces-access/ViktorProductAuthProvider";
import {
  AcademyPage,
  AdminPage,
  CertificationPage,
  CohortPage,
  CommunityPage,
  DashboardPage,
  DoctrinePage,
  DocumentationPage,
  EvidencePage,
  HomePage,
  InfraLabPage,
  LandingPage,
  LoginPage,
  MirrorLabPage,
  MirrorPage,
  SettingsPage,
  SignupPage,
  SqlLabPage,
  TrainingPage,
} from "@/pages";

export function ProductAuthRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mirror" element={<MirrorPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/sql-lab" element={<SqlLabPage />} />
          <Route path="/infra-lab" element={<InfraLabPage />} />
          <Route path="/mirror-lab" element={<MirrorLabPage />} />
          <Route path="/cohorts" element={<CohortPage />} />
          <Route path="/certification" element={<CertificationPage />} />
          <Route path="/evidence" element={<EvidencePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/doctrine" element={<DoctrinePage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function SpaceAuthAppRoutes() {
  return (
    <ViktorProductAuthProvider enabled>
      <ProductAuthRoutes />
    </ViktorProductAuthProvider>
  );
}
