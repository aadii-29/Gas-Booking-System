import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approveApplication } from '../../ReduxStore/slices/adminSlice';
import { toast } from 'react-toastify';
import Button from '../common/Button';

const ApproveAgencyButton = ({ applicationId }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.admin);

  const handleApprove = async () => {
    try {
      await dispatch(approveApplication({ type: 'agency', id: applicationId })).unwrap();
      toast.success('Agency application approved successfully');
    } catch (_err) {
      toast.error(_err || 'Failed to approve agency application');
    }
  };

  return (
    <Button
      onClick={handleApprove}
      disabled={loading}
      className="bg-green-500 hover:bg-green-600 text-white"
    >
      {loading ? 'Approving...' : 'Approve Agency'}
    </Button>
  );
};

export default ApproveAgencyButton;