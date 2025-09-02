import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import publicRoutes from './publicRoutes';
import protectedRoutes from './protectedRoutes';
import ProtectedRoute from './protectedRoutes';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: publicRoutes,
  },
  {
    element: <DashboardLayout />,
    children: protectedRoutes.map((route) => ({
      path: route.path,
      element: (
        <ProtectedRoute allowedRoles={route.allowedRoles}>
          {route.element}
        </ProtectedRoute>
      ),
    })),
  },
]);

export default router;