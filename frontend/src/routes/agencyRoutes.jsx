import AgencyDashboard from '../components/agency/AgencyDashboard';
import AgencyCustomer from '../pages/AgencyCustomer';
import AgencyDeliveryStaff from '../pages/AgencyDeliveryStaff';
import PendingCustomerApplications from '../components/agency/PendingCustomerApplications';
import CustomerDetailPage from '../components/agency/CustomerDetailPage';
import DeliveryStaffListPage from '../components/agency/DeliveryStaffListPage';
import PendingDeliveryStaffApplications from '../components/agency/PendingDeliveryStaffApplications';
import CustomerApprovalResponse from '../components/agency/CustomerApprovalResponse';
import DeliveryStaffApprovalResponse from '../components/agency/DeliveryStaffApprovalResponse';

const agencyRoutes = [
  { path: '/agency-dashboard', element: <AgencyDashboard /> },
  { path: '/agency/inventory', element: <AgencyDashboard /> },
  { path: '/agency/application/customer', element: <AgencyCustomer /> },
  { path: '/agency/application/pendingcustomer/list', element: <CustomerDetailPage /> },
  { path: '/agency/application/pendingdeliverystaff/list', element: <DeliveryStaffListPage /> },
  { path: '/agency/application/customer/:registrationId', element: <PendingCustomerApplications /> },
  { path: '/agency/application/customer/response/:registrationId', element: <CustomerApprovalResponse /> },
  { path: '/agency/application/deliverystaff/response/:staffId', element: <DeliveryStaffApprovalResponse /> },{ path: '/agency/application/deliverystaff', element: <AgencyDeliveryStaff /> },
  { path: '/agency/application/deliverystaff/:staffId', element: <PendingDeliveryStaffApplications /> },
].map(route => ({ ...route, allowedRoles: ['agency'] }));

export default agencyRoutes;