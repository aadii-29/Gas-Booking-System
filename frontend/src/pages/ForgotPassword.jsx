import React from 'react';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import PublicLayout from '../layouts/PublicLayout';

const ForgotPassword = () => {
  return (
    <PublicLayout>
      <div className="max-w-md mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
        <ForgotPasswordForm />
      </div>
    </PublicLayout>
  );
};

export default ForgotPassword;