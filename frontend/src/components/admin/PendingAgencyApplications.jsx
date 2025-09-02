import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingAgencyApplications, approveAgency } from '../../store/slices/adminSlice';
import { Table, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import AgencyApprovalForm from './AgencyApprovalForm';
import { toast } from 'react-toastify';

const PendingAgencyApplications = () => {
  const dispatch = useDispatch();
  const { pendingApplications, loading, error } = useSelector((state) => state.admin);
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    dispatch(fetchPendingAgencyApplications());
  }, [dispatch]);

  const handleApprove = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      await dispatch(approveAgency({ id: selectedApplication._id, ...values })).unwrap();
      toast.success('Agency application approved');
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to approve agency');
    }
  };

  if (loading) {
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  }

  if (error) {
    return <Alert variant="danger" className="mt-5">{error}</Alert>;
  }

  return (
    <div className="mt-5">
      <h3>Pending Agency Applications</h3>
      {pendingApplications.length === 0 ? (
        <Alert variant="info">No pending applications</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Applied Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingApplications.map((app) => (
              <tr key={app._id}>
                <td>{app.name}</td>
                <td>{app.email}</td>
                <td>{app.address}</td>
                <td>{app.phone}</td>
                <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                <td>
                  <Button variant="success" onClick={() => handleApprove(app)}>
                    Approve
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve Agency Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <AgencyApprovalForm
              initialValues={{ comments: '' }}
              onSubmit={handleFormSubmit}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PendingAgencyApplications;