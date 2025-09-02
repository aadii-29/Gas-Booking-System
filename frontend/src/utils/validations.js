import * as Yup from 'yup';
import { VALIDATION_MESSAGES } from './constants';

export const loginSchema = Yup.object({
  email: Yup.string()
    .email(VALIDATION_MESSAGES.INVALID_EMAIL)
    .required(VALIDATION_MESSAGES.REQUIRED),
  password: Yup.string()
    .min(6, VALIDATION_MESSAGES.MIN_PASSWORD)
    .required(VALIDATION_MESSAGES.REQUIRED),
});

export const signupSchema = Yup.object({
  name: Yup.string()
    .min(2, VALIDATION_MESSAGES.MIN_NAME)
    .required(VALIDATION_MESSAGES.REQUIRED),
  email: Yup.string()
    .email(VALIDATION_MESSAGES.INVALID_EMAIL)
    .required(VALIDATION_MESSAGES.REQUIRED),
  password: Yup.string()
    .min(6, VALIDATION_MESSAGES.MIN_PASSWORD)
    .required(VALIDATION_MESSAGES.REQUIRED),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], VALIDATION_MESSAGES.PASSWORD_MISMATCH)
    .required(VALIDATION_MESSAGES.REQUIRED),
});

export const applyAgencySchema = Yup.object({
  name: Yup.string()
    .min(2, VALIDATION_MESSAGES.MIN_NAME)
    .required(VALIDATION_MESSAGES.REQUIRED),
  address: Yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  phone: Yup.string()
    .matches(/^\d{10}$/, VALIDATION_MESSAGES.INVALID_PHONE)
    .required(VALIDATION_MESSAGES.REQUIRED),
  email: Yup.string()
    .email(VALIDATION_MESSAGES.INVALID_EMAIL)
    .required(VALIDATION_MESSAGES.REQUIRED),
});


export const applyCustomerSchema = Yup.object().shape({
  CustomerName: Yup.string().required('Full name is required'),
  DOB: Yup.date().required('Date of birth is required').nullable(),
  CustomerMobileNo: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  CustomerEmailId: Yup.string().email('Invalid email').required('Email is required'),
  Connection_Mode: Yup.string()
    .oneOf(['Regular', 'Commercial'], 'Invalid connection mode')
    .required('Connection mode is required'),
  CustomerAddress: Yup.object().shape({
    FlatNo: Yup.string().required('Flat number is required'),
    Building_Society_Name: Yup.string().required('Building/Society name is required'),
    Area: Yup.string().required('Area is required'),
    City: Yup.string().required('City is required'),
    State: Yup.string().required('State is required'),
    Pincode: Yup.string()
      .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits')
      .required('Pincode is required'),
  }),
  AadharNumber: Yup.string()
    .matches(/^[0-9]{12}$/, 'Aadhar number must be 12 digits')
    .required('Aadhar number is required'),
  AddressProof: Yup.string()
    .oneOf([
      'AadharCard',
      'VoterID',
      'DrivingLicense',
      'Lightbill',
      'Rent-Agreement',
      'Rashan-card',
      'Title-Paper',
      'Tax-Bill',
      'Sale-Deed'
    ], 'Invalid address proof type')
    .required('Address proof type is required'),
  Bank: Yup.object().shape({
    BankName: Yup.string().required('Bank name is required'),
    AccountNumber: Yup.string().required('Account number is required'),
    IFSC: Yup.string()
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code')
      .required('IFSC code is required'),
    Branch: Yup.string(),
  }),
  Alloted_Cylinder: Yup.number()
    .min(1, 'At least one cylinder is required')
    .max(2, 'Maximum two cylinders allowed')
    .required('Number of cylinders is required'),
  AgencyID: Yup.string().required('Agency selection is required'),
 
});

export const applyDeliveryStaffSchema = Yup.object({
  AgencyID: Yup.string().required('Agency ID is required'),
  StaffName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  DOB: Yup.date().required('Date of birth is required'),
  StaffMobileNo: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be a valid 10-digit number')
    .required('Mobile number is required'),
  StaffEmail: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  StaffAddress: Yup.object({
    FlatNo: Yup.string().required('Flat number is required'),
    Building_Society_Name: Yup.string().required('Building/Society name is required'),
    Area: Yup.string().required('Area is required'),
    City: Yup.string().required('City is required'),
    State: Yup.string().required('State is required'),
    Pincode: Yup.string()
      .matches(/^[0-9]{6}$/, 'Pincode must be a valid 6-digit number')
      .required('Pincode is required'),
  }),
  AadharNumber: Yup.string()
    .matches(/^[0-9]{12}$/, 'Aadhar number must be a valid 12-digit number')
    .required('Aadhar number is required'),
  Salary: Yup.number()
    .positive('Salary must be a positive number')
    .required('Salary is required'),
  AssignedArea: Yup.string()
    .nullable()
    .test('valid-areas', 'All area names must be non-empty', (value) => {
      if (!value) return true; // Allow empty/null for optional field
      const areas = value.split(',').map((item) => item.trim());
      return areas.every((item) => item.length > 0);
    }),
});
export const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email(VALIDATION_MESSAGES.INVALID_EMAIL)
    .required(VALIDATION_MESSAGES.REQUIRED),
});

export const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(6, VALIDATION_MESSAGES.MIN_PASSWORD)
    .required(VALIDATION_MESSAGES.REQUIRED),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required(VALIDATION_MESSAGES.REQUIRED),
});


export const checkApplicationStatusSchema = Yup.object({
  applicationId: Yup.string()
    .required('Registration ID is required')
    .min(1, 'Registration ID cannot be empty'),
});