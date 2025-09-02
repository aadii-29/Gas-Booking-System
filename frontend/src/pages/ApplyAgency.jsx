import ApplyAgencyForm from '../components/user/ApplyAgencyForm';

const ApplyAgency = () => {
  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Apply as Agency</h1>
      <ApplyAgencyForm />
    </div>
  );
};

export default ApplyAgency;