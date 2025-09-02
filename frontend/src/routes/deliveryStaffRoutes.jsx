import DeliveryStaffDashboard from '../components/deliveryStaff/DeliveryStaffDashboard';

const deliveryStaffRoutes = [
  { path: '/delivery-staff-dashboard', element: <DeliveryStaffDashboard /> },
  { path: '/deliverystaff/deliveries', element: <DeliveryStaffDashboard /> },
].map(route => ({ ...route, allowedRoles: ['deliverystaff'] }));

export default deliveryStaffRoutes;