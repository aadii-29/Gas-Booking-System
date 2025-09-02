import { useSelector } from 'react-redux';

const useApplicationStatus = () => {
  const { applicationStatus } = useSelector((state) => state.user);

  const isPending = applicationStatus === 'Pending';
  const isApproved = applicationStatus === 'Approved';
  const isRejected = applicationStatus === 'Rejected';

  return {
    applicationStatus,
    isPending,
    isApproved,
    isRejected,
  };
};

export default useApplicationStatus;
