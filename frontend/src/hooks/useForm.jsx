import { useFormik } from 'formik';

const useForm = ({ initialValues, validationSchema, onSubmit }) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      await onSubmit(values, { setSubmitting, resetForm });
    },
  });

  return formik;
};

export default useForm;