// src/router.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { varAlpha } from 'minimal-shared/utils';

import ChooseRole from "./pages/ChooseRole";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentRegister from "./pages/student/StudentRegister";
import StudentDashboard from "./pages/student/dashboard";
import UploadRapport from "./pages/student/upload-rapport";
import StudentSoutenance from "./pages/student/soutenance";
import MesRapports from "./pages/student/mes-rapports";

import StudentGuard from "./StudentGuard";
import StudentLayout from "./pages/student/StudentLayout";

import { DashboardLayout } from 'src/layouts/dashboard';
import { AuthLayout } from 'src/layouts/auth';

// =======================
// Lazy loaded pages (admin)
// =======================
const DashboardPage = lazy(() => import('src/pages/dashboard'));
const BlogPage = lazy(() => import('src/pages/blog'));
const UserPage = lazy(() => import('src/pages/user'));
const ProductsPage = lazy(() => import('src/pages/products'));
const SignInPage = lazy(() => import('src/pages/sign-in'));
const Page404 = lazy(() => import('src/pages/page-not-found'));
const SallesPage = lazy(() => import('src/pages/SallesPage'));
const SoutenancesPage = lazy(() => import('src/pages/SoutenancesPage'));
const UtilisateursPage = lazy(() => import('src/pages/UtilisateursPage'));

// =======================
// Fallback loader (admin)
// =======================
const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

// =======================
// Router Component
// =======================
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={renderFallback()}>
        <Routes>

          {/* ---------------- Admin routes sous /app ---------------- */}
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="salles" element={<SallesPage />} />
            <Route path="soutenances" element={<SoutenancesPage />} />
            <Route path="utilisateurs" element={<UtilisateursPage />} />
          </Route>

          <Route path="/app/sign-in" element={<AuthLayout><SignInPage /></AuthLayout>} />

          {/* ---------------- Student routes ---------------- */}
          <Route path="/" element={<ChooseRole />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/student" element={<StudentRegister />} />

          <Route element={<StudentGuard />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="upload" element={<UploadRapport />} />
              <Route path="mes-rapports" element={<MesRapports />} />
              <Route path="soutenance" element={<StudentSoutenance />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="/404" element={<Page404 />} />
          <Route path="*" element={<Navigate to="/404" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
