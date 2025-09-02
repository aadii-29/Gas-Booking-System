import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers } from '../../store/slices/agencySlice';
import { Card, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

const CustomerList = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.agency);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  if (loading) {
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  }

  if (error) {
    return <Alert variant="danger" className="mt-5">{error}</Alert>;
  }

  return (
    <Container className="mt-3">
      <h3>Approved Customers</h3>
      {customers.length === 0 ? (
        <Alert variant="info">No approved customers</Alert>
      ) : (
        <Row>
          {customers.map((customer) => (
            <Col md={4} key={customer._id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{customer.name}</Card.Title>
                  <Card.Text>
                    <strong>Email:</strong> {customer.email}<br />
                    <strong>Address:</strong> {customer.address}<br />
                    <strong>Phone:</strong> {customer.phone}<br />
                    <strong>Approved Date:</strong>{' '}
                    {new Date(customer.approvedDate).toLocaleDateString()}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CustomerList;