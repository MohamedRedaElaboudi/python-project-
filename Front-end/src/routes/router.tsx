// src/routes/router.tsx

import { lazy, Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

// Pages
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));

export default function Router() {
  const routes = useRoutes([
    {
      path: '/',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
  ]);

  return <Suspense fallback={<p>Loading...</p>}>{routes}</Suspense>;
}
