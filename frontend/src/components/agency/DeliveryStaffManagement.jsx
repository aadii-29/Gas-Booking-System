import PendingDeliveryStaffApplications from './PendingDeliveryStaffApplications';
import styled from 'styled-components';

const ManagementSection = styled.section`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const DeliveryStaffManagement = ({ agencyId }) => {
  return (
    <ManagementSection>
      <h3>Delivery Staff Management</h3>
      <PendingDeliveryStaffApplications agencyId={agencyId} />
    </ManagementSection>
  );
};

export default DeliveryStaffManagement;