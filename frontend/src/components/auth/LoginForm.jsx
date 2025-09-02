import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser, fetchUserInfo } from '../../ReduxStore/slices/authSlice';
import { FaSignInAlt } from 'react-icons/fa';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialValues = {
    identifier: '',
    Password: '',
  };

  const validationSchema = Yup.object({
    identifier: Yup.string()
      .test('valid-identifier', 'Must be a valid email or alphanumeric ID', (value) => {
        if (!value) return false;
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(value);
        return isEmail || isAlphanumeric;
      })
      .required('Email or ID is required'),
    Password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { identifier, Password } = values;
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

      const payload = isEmail
        ? { EmailId: identifier, Password }
        : { AgencyID: identifier, CustomerID: identifier, EmployeeID: identifier, Password };

      const loginResult = await dispatch(loginUser(payload)).unwrap();
      console.log('LoginForm: loginUser Result', JSON.stringify(loginResult, null, 2));

      // Fetch user info to ensure AgencyID is set
      const userInfoResult = await dispatch(fetchUserInfo()).unwrap();
      console.log('LoginForm: fetchUserInfo Result', JSON.stringify(userInfoResult, null, 2));

      toast.success('Login successful');

      const role = loginResult.user.role.toLowerCase();
      switch (role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'agency':
          navigate('/agency-dashboard'); // Direct to pending applications
          break;
        case 'customer':
          navigate('/customer-dashboard');
          break;
        case 'deliverystaff':
          navigate('/delivery-staff-dashboard');
          break;
        case 'user':
        default:
          navigate('/user-dashboard');
          break;
      }
    } catch (error) {
      console.error('LoginForm: Error', error);
      toast.error(error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <FaSignInAlt className="w-6 h-6 mr-2 text-blue-500" />
        <h2 className="text-2xl font-bold">Login</h2>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnMount
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="mb-4">
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Email or ID
              </label>
              <Field
                type="text"
                name="identifier"
                autoComplete="username"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage name="identifier" component="div" className="text-red-600 text-sm mt-1" />
            </div>
            <div className="mb-4">
              <label htmlFor="Password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Field
                type="password"
                name="Password"
                autoComplete="current-password"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage name="Password" component="div" className="text-red-600 text-sm mt-1" />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm;