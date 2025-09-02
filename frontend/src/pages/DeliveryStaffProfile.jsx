import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeliveryStaffProfile, updateDeliveryStaffProfile } from '../../ReduxStore/slices/deliveryStaffSlice';
import { toast } from 'react-toastify';

const DeliveryStaffProfile = ({ staffId }) => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.deliveryStaff);
  const [formData, setFormData] = useState({
    StaffMobileNo: '',
    AssignedArea: [],
  });

  useEffect(() => {
    if (staffId) {
      dispatch(fetchDeliveryStaffProfile(staffId))
        .unwrap()
        .catch((err) => toast.error(err));
    }
  }, [dispatch, staffId]);

  useEffect(() => {
    if (profile) {
      setFormData({
        StaffMobileNo: profile.StaffMobileNo || '',
        AssignedArea: profile.AssignedArea || [],
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAreaChange = (e) => {
    const areas = e.target.value.split(',').map((area) => area.trim());
    setFormData((prev) => ({ ...prev, AssignedArea: areas }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateDeliveryStaffProfile({ staffId, updateData: formData })).unwrap();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

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

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto mt-10 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        No profile data available
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-6">Delivery Staff Profile</h2>
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">{profile.StaffName}</h3>
        <div className="text-gray-700 mb-4">
          <p><strong>Email:</strong> {profile.StaffEmail || 'N/A'}</p>
          <p><strong>Phone:</strong> {profile.StaffMobileNo || 'N/A'}</p>
          <p><strong>Assigned Areas:</strong> {profile.AssignedArea.join(', ') || 'None'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="StaffMobileNo" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              name="StaffMobileNo"
              value={formData.StaffMobileNo}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label htmlFor="AssignedArea" className="block text-sm font-medium text-gray-700">
              Assigned Areas (comma-separated)
            </label>
            <input
              type="text"
              name="AssignedArea"
              value={formData.AssignedArea.join(', ')}
              onChange={handleAreaChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter areas (e.g., Area1, Area2)"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliveryStaffProfile;