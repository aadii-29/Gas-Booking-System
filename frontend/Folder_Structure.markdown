D:\NWS\Node\Frontend\version\GASAGENCY\
├── public/
│   ├── favicon.ico
│   └── vite.svg
├── src/
│   ├── api/
│   │   ├── index.js
│   │   ├── authApi.js
│   │   ├── agencyApi.js
│   │   ├── customerApi.js
│   │   ├── adminApi.js
│   │   ├── deliveryStaffApi.js
│   │   ├── passwordApi.js
│   │   ├── userApi.js
│   │   └── axiosInstance.jsx
│   ├── assets/
│   │   ├── logo.png
│   │   ├── icon/
│   │   │   ├── user.svg
│   │   │   ├── approve.svg
│   │   │   ├── dashboard.svg
│   │   │   └── logout.svg
│   │   └── image/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AgencyApplications.jsx
│   │   │   ├── AgencyApprovalForm.jsx
│   │   │   ├── AgencyList.jsx
│   │   │   ├── AgencyManagement.jsx
│   │   │   ├── ApproveAgencyButton.jsx
│   │   │   ├── PendingAgencyApplications.jsx
│   │   ├── agency/
│   │   │   ├── AgencyDashboard.jsx
│   │   │   ├── CustomerApplications.jsx
│   │   │   ├── CustomerList.jsx
│   │   │   ├── CustomerManagement.jsx
│   │   │   ├── DeliveryStaffApplications.jsx
│   │   │   ├── DeliveryStaffManagement.jsx
│   │   │   ├── PendingCustomerApplications.jsx
│   │   │   ├── PendingDeliveryStaffApplications.jsx
│   │   │   ├── ApproveCustomerButton.jsx
│   │   │   ├── ApproveDeliveryStaffButton.jsx
│   │   ├── auth/
│   │   │   ├── ForgotPasswordForm.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── ResetPasswordForm.jsx
│   │   │   ├── SignupForm.jsx
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Select.jsx
│   │   ├── customer/
│   │   │   ├── ConnectionDetails.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   ├── deliveryStaff/
│   │   │   ├── DeliveryAssignments.jsx
│   │   │   ├── DeliveryManagement.jsx
│   │   │   ├── DeliveryStaffDashboard.jsx
│   │   │   ├── StatusUpdateForm.jsx
│   │   │   ├── UpdateDeliveryStatus.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   ├── user/
│   │   │   ├── ApplicationStatus.jsx
│   │   │   ├── ApplyAgencyForm.jsx
│   │   │   ├── ApplyCustomerForm.jsx
│   │   │   ├── ApplyDeliveryStaff.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   ├── hooks/
│   │   ├── useApi.jsx
│   │   ├── useAuth.jsx
│   │   ├── useForm.jsx
│   │   ├── useRoleGuard.jsx
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── PublicLayout.jsx
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── AgencyDashboard.jsx
│   │   ├── ApplyAgency.jsx
│   │   ├── ApplyCustomer.jsx
│   │   ├── CheckApplicationStatus.jsx
│   │   ├── CustomerDashboard.jsx
│   │   ├── DeliveryStaffDashboard.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Signup.jsx
│   │   ├── Unauthorized.jsx
│   │   ├── UserDashboard.jsx
│   ├── ReduxStore/
│   │   ├── index.jsx
│   │   ├── slices/
│   │   │   ├── adminSlice.jsx
│   │   │   ├── agencySlice.jsx
│   │   │   ├── authSlice.jsx
│   │   │   ├── customerSlice.jsx
│   │   │   ├── deliveryStaffSlice.jsx
│   │   │   ├── userSlice.jsx
│   ├── routes/
│   │   ├── index.jsx
│   │   ├── protectedRoutes.js
│   │   ├── protectedRoutes.jsx
│   │   ├── publicRoutes.jsx
│   ├── store/
│   │   ├── hooks/
│   │   │   ├── useApplicationStatus.js
│   │   │   ├── useAuth.js
│   │   │   ├── useRoleGuard.js
│   ├── styles/
│   │   ├── tailwind.css
│   │   ├── globals.css
│   ├── utils/
│   │   ├── axiosInstance.js
│   │   ├── constants.js
│   │   ├── constants.jsx
│   │   ├── helpers.js
│   │   ├── validations.js
│   ├── App.jsx
│   ├── constants.jsx
│   ├── main.jsx
├── .env
├── .eslintrc.cjs
├── .eslintignore
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── vite.config.js