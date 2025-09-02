import AdminDashboard from '../components/admin/AdminDashboard';

const adminRoutes = [
  { path: '/admin-dashboard', element: <AdminDashboard /> },
  { path: '/admin/usermanagement', element: <AdminDashboard /> },
].map(route => ({ ...route, allowedRoles: ['admin'] }));

export default adminRoutes;