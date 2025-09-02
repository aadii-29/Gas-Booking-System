import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { updateDeliveryStaffStatus } from '../../ReduxStore/slices/agencySlice';

const ApproveDeliveryStaffButton = ({ staffId }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.agency);

  const handleApprove = async () => {
    try {
      await dispatch(updateDeliveryStaffStatus({ applicationId: staffId, status: 'Approved' })).unwrap();
      toast.success('Delivery staff approved successfully');
    } catch (error) {
      toast.error(error || 'Failed to approve delivery staff');
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Approving...' : 'Approve'}
    </button>
  );
};

export default ApproveDeliveryStaffButton;