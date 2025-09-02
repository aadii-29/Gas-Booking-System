import UserDashboard from '../components/user/UserDashboard';
import ApplyAgency from '../pages/ApplyAgency';
import ApplyCustomer from '../pages/ApplyCustomer';
import ApplyDeliveryStaff from '../pages/ApplyDeliveryStaff';
import ViewApplication from '../pages/ViewApplication';
import ViewCustomerApplication from '../pages/ViewCustomerApplication';

const userRoutes = [
  { path: '/user-dashboard', element: <UserDashboard /> },
  { path: '/apply-agency', element: <ApplyAgency /> },
  { path: '/apply-customer', element: <ApplyCustomer /> },
  { path: '/apply-delivery-staff', element: <ApplyDeliveryStaff /> },
  { path: '/view-application', element: <ViewApplication /> },
  { path: '/view-customer-application', element: <ViewCustomerApplication /> },
].map(route => ({ ...route, allowedRoles: ['user'] }));

export default userRoutes;