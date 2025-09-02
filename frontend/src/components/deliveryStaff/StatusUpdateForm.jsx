
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateDelivery } from '../../store/slices/deliveryStaffSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';

const FormContainer = styled.div`
  display: inline-block;
`;

const StatusUpdateForm = ({ deliveryId, currentStatus }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    status: Yup.string()
      .oneOf(['pending', 'in-progress', 'delivered'], 'Invalid status')
      .required('Status is required'),
  });

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    await dispatch(updateDelivery({ deliveryId, status: values.status }));
    setIsSubmitting(false);
  };

  return (
    <FormContainer>
      <Formik
        initialValues={{ status: currentStatus }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form>
          <Field as="select" name="status" className="form-select form-select-sm">
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="delivered">Delivered</option>
          </Field>
          <ErrorMessage name="status" component="div" className="text-danger" />
          <button
            type="submit"
            className="btn btn-sm btn-primary mt-1"
            disabled={isSubmitting}
          >
            Update
          </button>
        </Form>
      </Formik>
    </FormContainer>
  );
};

export default StatusUpdateForm;
