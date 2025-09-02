import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';

// Placeholder components
// eslint-disable-next-line react-refresh/only-export-components
const Terms = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <h1>Terms of Service</h1>
    <p>Content goes here...</p>
  </div>
);

// eslint-disable-next-line react-refresh/only-export-components
const Privacy = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <h1>Privacy Policy</h1>
    <p>Content goes here...</p>
  </div>
);

const publicRoutes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '/terms',
    element: <Terms />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default publicRoutes;