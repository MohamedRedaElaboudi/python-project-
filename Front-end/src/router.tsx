// src/AppRouter.tsx
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Box from "@mui/material/Box";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import { varAlpha } from "minimal-shared/utils";

// ----------------------
// ⚡ Lazy Loading Pages
// ----------------------

// Public pages
const ChooseRole = lazy(() => import("./pages/ChooseRole"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const StudentRegister = lazy(() => import("./pages/student/StudentRegister"));

// Student pages
const StudentDashboard = lazy(() => import("./pages/student/dashboard"));
const UploadRapport = lazy(() => import("./pages/student/upload-rapport"));
const StudentSoutenance = lazy(() => import("./pages/student/soutenance"));
const MesRapports = lazy(() => import("./pages/student/mes-rapports"));

// Admin/Dashboard pages
const DashboardPage = lazy(() => import("./pages/dashboard"));
const BlogPage = lazy(() => import("./pages/blog"));
const UserPage = lazy(() => import("./pages/user"));
const ProductsPage = lazy(() => import("./pages/products"));
const SallesPage = lazy(() => import("./pages/SallesPage"));
const SoutenancesPage = lazy(() => import("./pages/SoutenancesPage"));
const UtilisateursPage = lazy(() => import("./pages/UtilisateursPage"));
const AuditPage = lazy(() => import("./pages/audit"));

// Error page
const Page404 = lazy(() => import("./pages/page-not-found"));

// Layouts
const StudentLayout = lazy(() => import("./pages/student/StudentLayout"));
const DashboardLayout = lazy(() => import("./layouts/dashboard/"));

// Guards
import StudentGuard from "./StudentGuard";

// ----------------------
// ⚡ Suspense fallback
// ----------------------
const renderFallback = () => (
  <Box
    sx={{
      display: "flex",
      flex: "1 1 auto",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: "text.primary" },
      }}
    />
  </Box>
);

// ----------------------
// ⚡ App Router
// ----------------------
export default function AppRouter() {
  console.log("AppRouter component is rendering");
  return (
    <BrowserRouter>
      <Suspense fallback={renderFallback()}>
        <Routes>
          {/* ------------------ PUBLIC ------------------ */}
          <Route path="/" element={<ChooseRole />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/student" element={<StudentRegister />} />

          {/* ------------------ ETUDIANT ------------------ */}
          <Route element={<StudentGuard />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="upload" element={<UploadRapport />} />
              <Route path="mes-rapports" element={<MesRapports />} />
              <Route path="soutenance" element={<StudentSoutenance />} />
            </Route>
          </Route>

          {/* ------------------ ADMIN / DASHBOARD ------------------ */}
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="user" element={<UserPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="salles" element={<SallesPage />} />
            <Route path="soutenances" element={<SoutenancesPage />} />
            <Route path="utilisateurs" element={<UtilisateursPage />} />
          </Route>

          {/* ------------------ 404 ------------------ */}
          <Route path="*" element={<Page404 />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
