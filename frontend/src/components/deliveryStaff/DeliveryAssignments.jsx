import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDeliveryStaffProfile } from '../../ReduxStore/slices/deliveryStaffSlice';
import { toast } from 'react-toastify';

const DeliveryAssignments = ({ staffId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading, error } = useSelector((state) => state.deliveryStaff);

  useEffect(() => {
    if (staffId) {
      dispatch(fetchDeliveryStaffProfile(staffId))
        .unwrap()
        .catch((err) => toast.error(err || 'Failed to fetch assignments'));
    }
  }, [dispatch, staffId]);

  const handleUpdateStatus = (id) => {
    navigate(`/delivery-staff/update-status/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto mt-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  // Mock assignments from AssignedArea
  const assignments = profile?.AssignedArea?.map((area, index) => ({
    _id: `mock-${index}`,
    orderId: `ORD${index + 1000}`,
    customerName: 'Mock Customer',
    deliveryAddress: area,
    status: 'Pending',
    assignedDate: new Date(),
  })) || [];

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-6">My Delivery Assignments</h2>
      {assignments.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
          No assignments found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2">Order #{assignment.orderId}</h3>
              <div className="text-gray-700 mb-4">
                <p>
                  <strong>Customer:</strong> {assignment.customerName}
                </p>
                <p>
                  <strong>Address:</strong> {assignment.deliveryAddress}
                </p>
                <p>
                  <strong>Status:</strong> {assignment.status}
                </p>
                <p>
                  <strong>Assigned Date:</strong>{' '}
                  {new Date(assignment.assignedDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleUpdateStatus(assignment._id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Update Status
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryAssignments;