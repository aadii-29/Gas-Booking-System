import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios'; // Assuming axios for API calls

const PendingApplication = () => {
  const [applications, setApplications] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/agency/pending-agency-applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(response.data);
      } catch (error) {
        console.error('Error fetching pending agency applications:', error);
        toast.error('Failed to load agency applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchApplications();
    }
  }, [token]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Pending Agency Applications</h2>
      {loading ? (
        <p className="text-gray-600">Loading applications...</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-600">No pending agency applications.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Applicant Name</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Application Date</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-800">{app.applicantName}</td>
                  <td className="p-3 text-gray-800">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-gray-800">{app.status}</td>
                  <td className="p-3">
                    <Link
                      to={`/agency/application/${app._id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingApplication;