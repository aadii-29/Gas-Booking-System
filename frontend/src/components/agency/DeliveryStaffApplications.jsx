import React from 'react'

const DeliveryStaffApplications = () => {
  return (
    <div>DeliveryStaffApplications</div>
  )
}

export default DeliveryStaffApplications


/*   import { useEffect } from 'react';
  import { useDispatch, useSelector } from 'react-redux';
  import { fetchDeliveryStaffApplications } from '../../ReduxStore/slices/agencySlice';
  import ApproveDeliveryStaffButton from './ApproveDeliveryStaffButton';
  import { toast } from 'react-toastify';

  const DeliveryStaffApplications = ({ agencyId }) => {
    const dispatch = useDispatch();
    const { deliveryStaff, loading, error } = useSelector((state) => state.agency);

    useEffect(() => {
      if (agencyId) {
        dispatch(fetchDeliveryStaffApplications({ agencyId, status: 'Pending' }))
          .unwrap()
          .catch((err) => {
            toast.error(err || 'Failed to fetch pending delivery staff applications');
          });
      }
    }, [dispatch, agencyId]);

    if (loading) {
      return (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-7xl mx-auto mt-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto mt-10 px-4">
        <h2 className="text-2xl font-bold mb-6">Pending Delivery Staff Applications</h2>
        {deliveryStaff.length === 0 ? (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            No pending applications found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deliveryStaff.map((application) => (
              <div
                key={application.ApplicationID}
                className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
              >
                <h3 className="text-lg font-semibold mb-2">{application.StaffName}</h3>
                <div className="text-gray-700 mb-4">
                  <p>
                    <strong>Email:</strong> {application.StaffEmail || 'N/A'}
                  </p>
                  <p>
                    <strong>Phone:</strong> {application.StaffMobileNo || 'N/A'}
                  </p>
                  <p>
                    <strong>Applied Date:</strong>{' '}
                    {new Date(application.CreatedAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Status:</strong> {application.Approval_Status}
                  </p>
                </div>
                <ApproveDeliveryStaffButton staffId={application.ApplicationID} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  export default DeliveryStaffApplications; */