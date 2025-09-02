import React from 'react';
import LoginForm from '../components/auth/LoginForm';


const Login = () => {
  return (

      <div className="max-w-md mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Log In</h1>
        <LoginForm />
      </div>

  );
};

export default Login;