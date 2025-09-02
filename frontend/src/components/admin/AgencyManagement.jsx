import { Container, Tabs, Tab } from 'react-bootstrap';
import PendingAgencyApplications from './PendingAgencyApplications';
import AgencyList from './AgencyList';

const AgencyManagement = () => {
  return (
    <Container className="mt-4">
      <Tabs defaultActiveKey="pending" id="agency-management-tabs" className="mb-3">
        <Tab eventKey="pending" title="Pending Applications">
          <PendingAgencyApplications />
        </Tab>
        <Tab eventKey="approved" title="Approved Agencies">
          <AgencyList />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AgencyManagement;