import PendingCustomerApplications from './PendingCustomerApplications';
import CustomerList from './CustomerList';
import styled from 'styled-components';

const ManagementSection = styled.section`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CustomerManagement = ({ agencyId }) => {
  return (
    <ManagementSection>
      <h3>Customer Management</h3>
      <PendingCustomerApplications agencyId={agencyId} />
      <CustomerList />
    </ManagementSection>
  );
};

export default CustomerManagement;