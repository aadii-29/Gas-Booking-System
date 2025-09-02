
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const DetailsContainer = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ConnectionDetails = () => {
  const { connectionDetails, loading } = useSelector((state) => state.customer);

  return (
    <DetailsContainer>
      <h4>Connection Details</h4>
      {loading ? (
        <p>Loading...</p>
      ) : connectionDetails ? (
        <div>
          <p><strong>Connection ID:</strong> {connectionDetails.id}</p>
          <p><strong>Status:</strong> {connectionDetails.status}</p>
          <p><strong>Agency:</strong> {connectionDetails.agencyName || 'N/A'}</p>
        </div>
      ) : (
        <p>No connection details available.</p>
      )}
    </DetailsContainer>
  );
};

export default ConnectionDetails;
