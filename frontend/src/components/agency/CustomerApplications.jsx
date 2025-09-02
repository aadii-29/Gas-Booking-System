import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPendingNewCustomer, getAgencyDetails, updateCustomerStatus } from '../../ReduxStore/slices/agencySlice';
import { toast } from 'react-toastify';

const CustomerApplications = ({ agencyId }) => {
  const dispatch = useDispatch();
  const { pendingCustomers, loading, error, agencyDetails } = useSelector((state) => state.agency);

  useEffect(() => {
    if (agencyId) {
      // Fetch agency details if not already loaded
      if (!agencyDetails) {
        dispatch(getAgencyDetails({ agencyID: agencyId }))
          .unwrap()
          .catch((err) => {
            toast.error(err || 'Failed to fetch agency details');
          });
      }
      // Fetch pending customers
      dispatch(getPendingNewCustomer())
        .unwrap()
        .catch((err) => {
          toast.error(err || 'Failed to fetch pending customer applications');
        });
    } else {
      toast.error('Agency ID is required');
    }
  }, [dispatch, agencyId, agencyDetails]);

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
    <div className="max-w-7xl mx-auto mt-6 px-4">
      <h3 className="text-2xl font-bold mb-6">Pending Customer Applications</h3>
      {pendingCustomers.customers.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          No pending applications
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pendingCustomers.customers.map((app) => (
            <div
              key={app.id}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
            >
              <h4 className="text-lg font-semibold mb-2">{app.name}</h4>
              <div className="text-gray-700 mb-4">
                <p>
                  <strong>Email:</strong> {app.email || 'N/A'}
                </p>
                <p>
                  <strong>Address:</strong> {app.address || 'N/A'}
                </p>
                <p>
                  <strong>Phone:</strong> {app.phone || 'N/A'}
                </p>
                <p>
                  <strong>Connection Mode:</strong> {app.connectionMode || 'N/A'}
                </p>
                <p>
                  <strong>Pending Payment:</strong>{' '}
                  {app.pendingPayment ? `₹${app.pendingPayment.toFixed(2)}` : 'N/A'}
                </p>
                <p>
                  <strong>Applied Date:</strong>{' '}
                  {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                {app.costBreakdown && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 hover:underline">
                      View Cost Breakdown
                    </summary>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Cylinder Cost: ₹{app.costBreakdown.cylinderCost}</p>
                      <p>Security Deposit (Cylinder): ₹{app.costBreakdown.securityDepositCylinder}</p>
                      <p>Security Deposit (Pressure Regulator): ₹{app.costBreakdown.securityDepositPressureRegulator}</p>
                      <p>Installation & Demo: ₹{app.costBreakdown.installationAndDemo}</p>
                      <p>DGCC: ₹{app.costBreakdown.dgcc}</p>
                      <p>Visit Charge: ₹{app.costBreakdown.visitCharge}</p>
                      <p>Additional Fixed Charge: ₹{app.costBreakdown.additionalFixedCharge}</p>
                      <p>Extra Charge: ₹{app.costBreakdown.extraCharge}</p>
                      <p><strong>Total Cost: ₹{app.costBreakdown.totalCost}</strong></p>
                    </div>
                  </details>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() =>
                    dispatch(
                      updateCustomerStatus({
                        reqID: app.id,
                        status: 'Approved',
                        comments: 'Approved by agency',
                      })
                    )
                      .unwrap()
                      .then(() => toast.success('Customer application approved successfully'))
                      .catch((err) => toast.error(err || 'Failed to approve customer application'))
                  }
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() =>
                    dispatch(
                      updateCustomerStatus({
                        reqID: app.id,
                        status: 'Denied',
                        comments: 'Denied by agency',
                      })
                    )
                      .unwrap()
                      .then(() => toast.success('Customer application denied successfully'))
                      .catch((err) => toast.error(err || 'Failed to deny customer application'))
                  }
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerApplications;