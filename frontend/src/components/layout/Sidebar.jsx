import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiUsers, FiChrome, FiClipboard, FiPackage, FiTruck, FiCalendar, FiChevronDown } from 'react-icons/fi';
import heroImage from '../../assets/image/Cylinders.png';

const roleLinks = {
  admin: [
    { to: '/admin/usermanagement', label: 'User Management', icon: FiUsers },
    { to: '/admin/agencymanagement', label: 'Agency Management', icon: FiClipboard },
    { to: '/admin/reports', label: 'Reports', icon: FiClipboard },
  ],
  agency: [
    { to: '/agency/inventory', label: 'Inventory', icon: FiPackage },
    {
      label: 'Applications',
      icon: FiClipboard,
      dropdown: [
        { to: '/agency/application/customer', label: 'Customer' },
        { to: '/agency/application/deliverystaff', label: 'Delivery Staff' },
      ],
    },
  ],
  customer: [
    { to: '/customer/bookcylinder', label: 'Book Cylinder', icon: FiPackage },
    { to: '/customer/orderhistory', label: 'Order History', icon: FiClipboard },
  ],
  deliverystaff: [
    { to: '/deliverystaff/deliveries', label: 'Deliveries', icon: FiTruck },
    { to: '/deliverystaff/schedule', label: 'Schedule', icon: FiCalendar },
  ],
  user: [
    { to: '/user-dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/check-application-status', label: 'Application Status', icon: FiChrome },
  ],
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  if (!token || !user) {
    console.warn('Sidebar not rendered: Missing token or user', { token, user });
    return null;
  }

  const role = user?.role?.toLowerCase() || 'user';
  const links = roleLinks[role] || roleLinks['user'];

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md shadow-md hover:bg-blue-700 hover:scale-105 transition-all duration-200"
        aria-label={isOpen ? 'Close Sidebar' : 'Open Sidebar'}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <aside
        className={`h-screen w-64 bg-gray-100 text-gray-800 flex flex-col z-40 shadow-lg
          fixed top-0 left-0 lg:static
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300 lg:block`}
      >
        <div className="flex items-center gap-3 p-4 border-b border-blue-600">
          <img
            src={heroImage}
            alt="GasBooking Logo"
            className="h-10 w-10 rounded-full"
            onError={(e) => (e.target.src = 'https://placehold.co/40')}
          />
          <h4 className="text-xl font-semibold text-gray-800">GasBooking</h4>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link, index) => (
            <div key={link.to || `dropdown-${index}`}>
              {link.dropdown ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(link.label)}
                    className={`flex items-center gap-3 p-3 rounded-md text-base w-full text-left
                      ${openDropdown === link.label ? 'bg-blue-600 text-white' : 'text-gray-800 hover:bg-blue-50 hover:text-blue-500'}
                      transition-colors duration-200`}
                  >
                    <link.icon size={20} />
                    {link.label}
                    <FiChevronDown
                      size={20}
                      className={`ml-auto transition-transform ${openDropdown === link.label ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openDropdown === link.label && (
                    <div className="pl-6 space-y-1 mt-1">
                      {link.dropdown.map((subLink) => (
                        <NavLink
                          key={subLink.to}
                          to={subLink.to}
                          className={({ isActive }) =>
                            `flex items-center gap-3 p-2 rounded-md text-sm ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-800 hover:bg-blue-50 hover:text-blue-500'
                            } transition-colors duration-200`
                          }
                        >
                          {subLink.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-md text-base ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-800 hover:bg-blue-50 hover:text-blue-500'
                    } transition-colors duration-200`
                  }
                >
                  <link.icon size={20} />
                  {link.label}
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;