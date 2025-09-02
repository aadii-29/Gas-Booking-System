import { useParams, useNavigate } from 'react-router-dom';

const UpdateDeliveryStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock assignment data (since no backend endpoint exists)
  const mockAssignment = {
    _id: id,
    orderId: `ORD${id.split('-')[1] || 1000}`,
    customerName: 'Mock Customer',
    deliveryAddress: 'Mock Area',
    status: 'Pending',
  };

  const handleBack = () => {
    navigate('/delivery-staff-dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-6">Update Delivery Status</h2>
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Order #{mockAssignment.orderId}</h3>
        <div className="text-gray-700 mb-4">
          <p><strong>Customer:</strong> {mockAssignment.customerName}</p>
          <p><strong>Address:</strong> {mockAssignment.deliveryAddress}</p>
          <p><strong>Status:</strong> {mockAssignment.status}</p>
        </div>
        <p className="text-red-700 mb-4">Status updates are not supported yet. Please contact the administrator.</p>
        <button
          onClick={handleBack}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          Back to Assignments
        </button>
      </div>
    </div>
  );
};

export default UpdateDeliveryStatus;