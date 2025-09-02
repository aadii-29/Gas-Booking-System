import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signupUser } from "../../ReduxStore/slices/authSlice";
import { FaUserPlus } from "react-icons/fa";

const SignupForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialValues = {
    Username: "",
    EmailId: "",
    Password: "",
    MobileNumber: "",
  };

  const validationSchema = Yup.object({
    Username: Yup.string()
      .min(2, "Username must be at least 2 characters")
      .required("Username is required"),
    EmailId: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    Password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    MobileNumber: Yup.string()
      .matches(/^\d{10}$/, "Mobile number must be 10 digits")
      .required("Mobile number is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(
        signupUser({
          Username: values.Username,
          EmailId: values.EmailId,
          Password: values.Password,
          MobileNumber: values.MobileNumber,
        })
      ).unwrap();
      toast.success("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <FaUserPlus className="w-6 h-6 mr-2 text-blue-500" />
        <h2 className="text-2xl font-bold">Sign Up</h2>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="mb-4">
              <label
                htmlFor="Username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <Field
                type="text"
                name="Username"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage
                name="Username"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="EmailId"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <Field
                type="email"
                name="EmailId"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage
                name="EmailId"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="MobileNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Mobile Number
              </label>
              <Field
                type="text"
                name="MobileNumber"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage
                name="MobileNumber"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="Password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Field
                type="password"
                name="Password"
                 autoComplete="current-password"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage
                name="Password"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing up..." : "Signup"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SignupForm;
