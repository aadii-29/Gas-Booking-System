import DeliveryAssignments from './DeliveryAssignments';
import styled from 'styled-components';

const ManagementSection = styled.section`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const DeliveryManagement = ({ staffId }) => {
  return (
    <ManagementSection>
      <h3>Delivery Management</h3>
      <DeliveryAssignments staffId={staffId} />
    </ManagementSection>
  );
};

export default DeliveryManagement;