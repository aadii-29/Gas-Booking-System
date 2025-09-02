import adminRoutes from './adminRoutes';
import agencyRoutes from './agencyRoutes';
import customerRoutes from './customerRoutes';
import deliveryStaffRoutes from './deliveryStaffRoutes';
import userRoutes from './userRoutes';
import sharedRoutes from './sharedRoutes';

const protectedRoutes = [
  ...adminRoutes,
  ...agencyRoutes,
  ...customerRoutes,
  ...deliveryStaffRoutes,
  ...userRoutes,
  ...sharedRoutes,
];

export default protectedRoutes;