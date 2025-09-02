import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import heroImage from '../assets/image/Cylinders.png';
import { FaGasPump, FaUserPlus, FaCheckCircle } from 'react-icons/fa';

const Home = () => {
  const { user, token } = useSelector((state) => state.auth);

  return (
    <>
      {/* Hero Section - Full Screen */}
      <section
        className="min-h-screen w-full bg-cover bg-center bg-no-repeat text-white flex items-center justify-center relative"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundColor: '#f0f4f8',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center text-center lg:text-left gap-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Welcome to Gas Agency
              </h1>
              <p className="text-lg sm:text-xl mb-6">
                {token
                  ? `Hello, ${user?.name}! Manage your gas services with ease.`
                  : 'Your trusted partner for seamless gas booking and management.'}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                {token ? (
                  <Link
                    to={
                      user?.role === 'Admin'
                        ? '/admin-dashboard'
                        : user?.role === 'Agency'
                        ? '/agency-dashboard'
                        : user?.role === 'Customer'
                        ? '/customer-dashboard'
                        : user?.role === 'DeliveryStaff'
                        ? '/delivery-staff-dashboard'
                        : '/user-dashboard'
                    }
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="border-2 border-white text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                    >
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="mt-3 lg:mt-0">
              <img
                src={heroImage}
                alt="Gas Agency Services"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <FaGasPump className="text-blue-600 text-4xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Reliable Gas Booking</h3>
              <p className="text-gray-600">
                Book your gas cylinder with a few clicks and get timely deliveries.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <FaUserPlus className="text-blue-600 text-4xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Easy Registration</h3>
              <p className="text-gray-600">
                Join as a customer, agency, or delivery staff in minutes.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <FaCheckCircle className="text-blue-600 text-4xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Trusted Services</h3>
              <p className="text-gray-600">
                Secure and transparent management for all your gas needs.
              </p>
            </div>
          </div>
        </div>
      </section>
{/* Call to Action Section */}
<section className="py-16 bg-blue-600 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-3xl font-bold mb-4">Ready to Join Gas Agency?</h2>
    <p className="text-lg mb-6">
      Apply as an agency, customer, or delivery staff today!
    </p>
    <div className="flex flex-wrap justify-center gap-4">
      <Link
        to="/signup?type=agency"
        className="bg-white text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
      >
        Apply as Agency
      </Link>
      <Link
        to="/signup?type=customer"
        className="bg-white text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
      >
        Apply as Customer
      </Link>
      <Link
        to="/signup?type=delivery-staff"
        className="bg-white text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
      >
        Apply as Delivery Staff
      </Link>
    </div>
  </div>
</section>
    </>
  );
};

export default Home;