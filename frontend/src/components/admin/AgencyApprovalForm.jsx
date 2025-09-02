import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Form, Button, Col, FloatingLabel } from 'react-bootstrap';

const AgencyApprovalForm = ({ initialValues, onSubmit }) => {
  const formik = useFormik({
    initialValues: {
      comments: initialValues.comments || '',
    },
    validationSchema: Yup.object({
      comments: Yup.string().max(500, 'Comments must be 500 characters or less'),
    }),
    onSubmit,
  });

  return (
    <Form noValidate onSubmit={formik.handleSubmit}>
      <Form.Group as={Col} md="12" controlId="comments" className="mb-3">
        <FloatingLabel label="Comments (Optional)">
          <Form.Control
            as="textarea"
            rows={4}
            name="comments"
            placeholder="Enter any comments"
            value={formik.values.comments}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={formik.touched.comments && formik.errors.comments}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.comments}
          </Form.Control.Feedback>
        </FloatingLabel>
      </Form.Group>

      <Button variant="primary" type="submit" disabled={formik.isSubmitting}>
        {formik.isSubmitting ? 'Approving...' : 'Approve Agency'}
      </Button>
    </Form>
  );
};

export default AgencyApprovalForm;