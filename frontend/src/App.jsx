import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import protectedRoutes from "./routes/protectedRoutes"; // Import the protectedRoutes array

// ProtectedRoute component to handle authentication and role-based access
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const normalizedRole = user?.role?.toLowerCase();
  if (!isAuthenticated) {
    console.log("ProtectedRoute - Redirecting to /login");
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
    console.log("Protected/ProtectedRoute - Redirecting to /unauthorized", {
      normalizedRole,
      allowedRoles,
    });
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

// Placeholder components
const Terms = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <h1>Terms of Service</h1>
    <p>Content goes here...</p>
  </div>
);

const Privacy = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <h1>Privacy Policy</h1>
    <p>Content goes here...</p>
  </div>
);

// Router configuration
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/unauthorized", element: <Unauthorized /> },
      { path: "/terms", element: <Terms /> },
      { path: "/privacy", element: <Privacy /> },
    ],
  },
  {
    element: <DashboardLayout />,
    children: protectedRoutes.map(route => ({
      path: route.path,
      element: <ProtectedRoute allowedRoles={route.allowedRoles}>{route.element}</ProtectedRoute>,
    })),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;