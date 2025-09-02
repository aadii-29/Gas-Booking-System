import React from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { MdPendingActions, MdPersonAdd, MdCheckCircle, MdCancel, MdHistory, MdPeople, MdEdit, MdSearch, MdArchive, MdEmail } from 'react-icons/md';

const AgencyDeliveryStaff = () => {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  // Handle authentication check
  if (!isAuthenticated || !token || !user) {
    console.warn('AgencyDeliveryStaff: Redirecting to login due to missing auth', { token, user });
    return <Navigate to="/login" replace />;
  }

  // Handle role check
  if (user.role.toLowerCase() !== 'agency') {
    console.warn('AgencyDeliveryStaff: Unauthorized role', { role: user.role });
    return <Navigate to="/unauthorized" replace />;
  }

  // Define 10 delivery staff-related actions with routes and icons
  const actionCards = [
    {
      title: 'View All Staff',
      route: '/agency/application/pendingdeliverystaff/list',
      icon: <MdPendingActions size={32} className="text-blue-600 mb-2" />,
    },
    {
      title: 'Add New Staff',
      route: '/agency/application/deliverystaff/add',
      icon: <MdPersonAdd size={32} className="text-green-600 mb-2" />,
    },
    {
      title: 'Approved Staff',
      route: '/agency/application/deliverystaff/approved',
      icon: <MdCheckCircle size={32} className="text-teal-600 mb-2" />,
    },
    {
      title: 'Rejected Staff',
      route: '/agency/application/deliverystaff/rejected',
      icon: <MdCancel size={32} className="text-red-600 mb-2" />,
    },
    {
      title: 'Staff History',
      route: '/agency/application/deliverystaff/history',
      icon: <MdHistory size={32} className="text-purple-600 mb-2" />,
    },
    {
      title: 'Manage Staff',
      route: '/agency/application/deliverystaff/manage',
      icon: <MdPeople size={32} className="text-indigo-600 mb-2" />,
    },
    {
      title: 'Edit Staff',
      route: '/agency/application/deliverystaff/edit',
      icon: <MdEdit size={32} className="text-yellow-600 mb-2" />,
    },
    {
      title: 'Search Staff',
      route: '/agency/application/deliverystaff/search',
      icon: <MdSearch size={32} className="text-gray-600 mb-2" />,
    },
    {
      title: 'Archive Staff',
      route: '/agency/application/deliverystaff/archive',
      icon: <MdArchive size={32} className="text-orange-600 mb-2" />,
    },
    {
      title: 'Staff Notifications',
      route: '/agency/application/deliverystaff/notifications',
      icon: <MdEmail size={32} className="text-pink-600 mb-2" />,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery Staff Management</h2>

      {/* 5x2 Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {actionCards.map((card, index) => (
          <Link
            key={index}
            to={card.route}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all duration-200 w-40 h-40"
            aria-label={card.title}
            title={card.title}
          >
            {card.icon}
            <span className="text-gray-800 font-medium text-sm text-center">{card.title}</span>
          </Link>
        ))}
      </div>

      <p className="text-gray-600 bg-gray-100 p-4 rounded-md">
        Click any action card to manage delivery staff applications.
      </p>
    </div>
  );
};

export default AgencyDeliveryStaff;