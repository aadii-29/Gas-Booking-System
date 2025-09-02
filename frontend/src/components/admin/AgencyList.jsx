import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAgencies } from '../../store/slices/adminSlice';
import { Card, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

const AgencyList = () => {
  const dispatch = useDispatch();
  const { agencies, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAgencies());
  }, [dispatch]);

  if (loading) {
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  }

  if (error) {
    return <Alert variant="danger" className="mt-5">{error}</Alert>;
  }

  return (
    <Container className="mt-3">
      {agencies.length === 0 ? (
        <Alert variant="info">No approved agencies</Alert>
      ) : (
        <Row>
          {agencies.map((agency) => (
            <Col md={4} key={agency._id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{agency.name}</Card.Title>
                  <Card.Text>
                    <strong>Email:</strong> {agency.email}<br />
                    <strong>Address:</strong> {agency.address}<br />
                    <strong>Phone:</strong> {agency.phone}<br />
                    <strong>Approved Date:</strong>{' '}
                    {new Date(agency.approvedDate).toLocaleDateString()}
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

export default AgencyList;