import { Link } from 'react-router-dom';
import { FiBriefcase, FiUser, FiTruck } from 'react-icons/fi';

const CallToAction = () => {
  return (
    <section className="py-10 bg-gradient-to-r from-blue-800 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
          Transform Your Future with Gas Agency!
        </h2>
        <p className="text-lg font-semibold mb-6 max-w-3xl mx-auto text-blue-100">
          Join our trusted network as an agency, customer, or delivery staff. Your journey starts here!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* Agency Card */}
          <Link
            to="/apply-agency"
            className="group block bg-white text-blue-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:bg-blue-50"
            aria-label="Apply as Agency"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-4 flex flex-col items-center">
              <div className="bg-blue-800 text-white p-2 rounded-full mb-2 group-hover:bg-blue-700 transition-colors">
                <FiBriefcase size={20} />
              </div>
              <h3 className="text-lg font-bold mb-1">Agency</h3>
              <p className="text-xs text-gray-600 text-center">Lead gas distribution.</p>
            </div>
          </Link>

          {/* Customer Card */}
          <Link
            to="/apply-customer"
            className="group block bg-white text-blue-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:bg-blue-50"
            aria-label="Apply as Customer"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-4 flex flex-col items-center">
              <div className="bg-blue-800 text-white p-2 rounded-full mb-2 group-hover:bg-blue-700 transition-colors">
                <FiUser size={20} />
              </div>
              <h3 className="text-lg font-bold mb-1">Customer</h3>
              <p className="text-xs text-gray-600 text-center">Book cylinders easily.</p>
            </div>
          </Link>

          {/* Delivery Staff Card */}
          <Link
            to="/apply-delivery-staff"
            className="group block bg-white text-blue-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:bg-blue-50"
            aria-label="Apply as Delivery Staff"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-4 flex flex-col items-center">
              <div className="bg-blue-800 text-white p-2 rounded-full mb-2 group-hover:bg-blue-700 transition-colors">
                <FiTruck size={20} />
              </div>
              <h3 className="text-lg font-bold mb-1">Delivery Staff</h3>
              <p className="text-xs text-gray-600 text-center">Deliver gas reliably.</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;