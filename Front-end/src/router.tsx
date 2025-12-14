// src/router.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { varAlpha } from 'minimal-shared/utils';

import { DashboardLayout } from 'src/layouts/dashboard';
import { AuthLayout } from 'src/layouts/auth';

// =======================
// Lazy loaded pages
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
// Fallback loader
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
    <Suspense fallback={renderFallback()}>
      <Routes>
        {/* Dashboard Layout Routes */}
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="user" element={<UserPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="salles" element={<SallesPage />} />
          <Route path="soutenances" element={<SoutenancesPage />} />
          <Route path="utilisateurs" element={<UtilisateursPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="sign-in" element={<AuthLayout><SignInPage /></AuthLayout>} />

        {/* 404 Page */}
        <Route path="404" element={<Page404 />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
