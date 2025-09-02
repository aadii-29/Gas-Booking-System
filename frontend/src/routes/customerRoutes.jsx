import CustomerDashboard from '../components/customer/CustomerDashboard';

const customerRoutes = [
  { path: '/customer-dashboard', element: <CustomerDashboard /> },
  { path: '/customer/bookcylinder', element: <CustomerDashboard /> },
].map(route => ({ ...route, allowedRoles: ['customer'] }));

export default customerRoutes;