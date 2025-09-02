import CheckApplicationStatus from '../pages/CheckApplicationStatus';
import ViewCustomerApplication from '../pages/ViewCustomerApplication';
import Profile from '../pages/Profile';
import DeliveryStaffApplicationDetails from '../pages/DeliveryStaffApplicationDetails';

const sharedRoutes = [
  { path: '/check-application-status', element: <CheckApplicationStatus />, allowedRoles: ['user', 'agency', 'admin'] },
  { path: '/view-deliverystaff-application', element: <DeliveryStaffApplicationDetails />, allowedRoles: ['user', 'agency', 'admin'] },
  { path: '/profile', element: <Profile />, allowedRoles: ['user', 'admin', 'agency', 'customer', 'deliverystaff'] },
];

export default sharedRoutes;