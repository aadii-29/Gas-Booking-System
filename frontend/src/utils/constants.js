export const ROLES = {
  USER: 'user',
  AGENCY: 'agency',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  DELIVERY_STAFF: 'deliveryStaff',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  APPLY_AGENCY: '/apply-agency',
  APPLY_CUSTOMER: '/apply-customer',
  CHECK_APPLICATION_STATUS: '/check-application-status',
  USER_DASHBOARD: '/user-dashboard',
  AGENCY_DASHBOARD: '/agency-dashboard',
  ADMIN_DASHBOARD: '/admin-dashboard',
  CUSTOMER_DASHBOARD: '/customer-dashboard',
  DELIVERY_STAFF_DASHBOARD: '/delivery-staff-dashboard',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/not-found',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/pswd/forgot-password',
    RESET_PASSWORD: '/pswd/reset-password',
    USER_INFO: '/auth/userinfo',
  },
  USER: {
    APPLY_AGENCY: '/customer/agency_apply',
    APPLY_CUSTOMER: '/customer/apply',
    APPLY_DELIVERY_STAFF: '/auth/agency/employment/apply',
    CHECK_APPLICATION_STATUS: '/customer/agency-status',
    VIEWAGENCIES: '/customer/viewAgencies',
    VIEWAPPLICATIONS: '/customer/viewall/application',
    VIEW_APPLICATION_STATUS_BYID: '/auth/agency/employment/status',
    VIEW_APPLICATION_STATUS: '/auth/agency/employment/application',
  },
  AGENCY: {
    CUSTOMERS: '/agency/:agencyId/customers',
    PENDING_CUSTOMER_APPLICATIONS: '/agency/customer/pendingrequest',
    PENDING_DELIVERY_STAFF_APPLICATIONS: '/agency/delivery_staff/pending/applications',
    PENDING_DELIVERY_STAFF_APPLICATIONS_BYID: '/agency/delivery_staff/pending/applications/:id',
    APPROVE_CUSTOMER_APPLICATION: '/agency/:agencyId/customer/:applicationId/approve',
    APPROVE_DELIVERY_STAFF_APPLICATION: '/agency/:agencyId/delivery_staff/:applicationId/approve',
    CUSTOMER_STATUS: '/agency/customer/status/:registrationId',
    DELIVERY_STAFF_STATUS: '/agency/delivery_staff/status/:ApplicationID',
    AGENCY_DETAILS: '/agency/:agencyId/details',
  },
  ADMIN: {
    PENDING_AGENCIES: '/admin/agency/pendingrequest',
    APPROVE_AGENCY: '/admin/agency/agencystatus/:reqID',
    AGENCIES: '/admin/viewallagency',
  },
  CUSTOMER: {
    CONNECTION_DETAILS: '/customer/connection-details',
  },
  DELIVERY_STAFF: {
    ASSIGNMENTS: '/delivery-staff/assignments',
    UPDATE_STATUS: '/delivery-staff/update-status',
  },
};

export const TOAST_CONFIG = {
  POSITION: 'top-right',
  AUTO_CLOSE: 5000,
  HIDE_PROGRESS_BAR: false,
  CLOSE_ON_CLICK: true,
  PAUSE_ON_HOVER: true,
  DRAGGABLE: true,
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  MIN_PASSWORD: 'Password must be at least 6 characters',
  INVALID_PHONE: 'Invalid phone number',
  MIN_NAME: 'Name must be at least 2 characters',
};