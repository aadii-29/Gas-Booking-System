import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';

const Unauthorized = () => {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
        <p className="text-lg mb-6">You don't have permission to view this page.</p>
        <Link to="/" className="btn-primary">Go to Home</Link>
      </div>
    </PublicLayout>
  );
};

export default Unauthorized;