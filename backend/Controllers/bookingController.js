const Booking = require('../Models/BookingModel');
const Agency = require('../Models/AgencyModel');
const Customer = require('../Models/CustomerModel');
const DeliveryStaff = require('../Models/DeliveryStaff');
const Cylinder = require('../Models/CylinderModel');
const handleDuplicateKeyError = require('../handleDuplicateKeyError');

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Create a new booking with CustomerID and Payment_Mode
exports.createBooking = async (req, res) => {
  try {
    console.log('Starting createBooking with request body:', req.body);
    const { CustomerID, Payment_Mode } = req.body;

    // Validate required fields
    if (!CustomerID) {
      console.error('Validation failed: CustomerID is missing', { CustomerID });
      return res.status(400).json({ message: 'Valid CustomerID is required' });
    }
    if (!Payment_Mode || !['Online', 'Cash', 'Debit-Card', 'Credit-Card'].includes(Payment_Mode)) {
      console.error('Validation failed: Invalid Payment_Mode', { Payment_Mode });
      return res.status(400).json({ message: 'Valid Payment_Mode is required (Online, Cash, Debit-Card, Credit-Card)' });
    }

    // Fetch customer to get associated AgencyID
    console.log('Fetching customer with CustomerID:', CustomerID);
    const customer = await Customer.findOne({ CustomerID, Approval_Status: 'Approved' });
    if (!customer) {
      console.error('Customer not found or not approved', { CustomerID });
      return res.status(404).json({ message: 'Approved customer not found' });
    }
    if (!customer.AgencyID) {
      console.error('Customer has no associated AgencyID', { CustomerID });
      return res.status(400).json({ message: 'Customer is not associated with an agency' });
    }

    // Fetch agency details
    console.log('Fetching agency with AgencyID:', customer.AgencyID);
    const agency = await Agency.findOne({ AgencyID: customer.AgencyID, Approval_Status: 'Approved' });
    if (!agency) {
      console.error('Approved agency not found', { AgencyID: customer.AgencyID });
      return res.status(404).json({ message: 'Approved agency not found' });
    }

    // Fetch an approved and active delivery staff member
    console.log('Fetching delivery staff for AgencyID:', customer.AgencyID);
    const deliveryStaff = await DeliveryStaff.findOne({
      AgencyID: customer.AgencyID,
      Approval_Status: 'Approved',
      Status: 'Active'
    });
    if (!deliveryStaff) {
      console.error('No approved and active delivery staff found', { AgencyID: customer.AgencyID });
      return res.status(404).json({ message: 'No approved and active delivery staff found for this agency' });
    }

    // Default values
    const expectedDeliveryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

    // Create new booking without setting BookingID or DeliveryDate
    console.log('Creating new booking for CustomerID:', CustomerID);
    const booking = new Booking({
      EmployeeID: deliveryStaff.EmployeeID,
      EmployeeMobileNo: deliveryStaff.StaffMobileNo,
      Cylinder_Quantity: 1,
      CustomerID,
      Payment_Mode,
      Payment: 'PENDING',
      OTP: generateOTP(),
      TotalAmount: {
        Cylinder_Base_Price: 800,
        GST: 100,
        Cylinder_Price: 900
      },
      Expected_Delivery_Date: expectedDeliveryDate,
      AgencyID: agency.AgencyID,
      AgencyName: agency.AgencyName,
      AgencyAddress: agency.AgencyAddress
      // Note: DeliveryID and DeliveryDate are not set here, as they’re not required during booking
    });

    // Save booking with E11000 error handling
    console.log('Saving booking:', JSON.stringify(booking, null, 2));
    const savedBooking = await handleDuplicateKeyError(() => booking.save(), Booking);
    console.log('Booking saved successfully', { BookingID: savedBooking.BookingID });

    // Check if BookingID was generated
    if (!savedBooking.BookingID) {
      console.error('Pre-save hook failed to generate BookingID', { savedBooking });
      return res.status(500).json({ message: 'Server error', error: 'Failed to generate BookingID' });
    }

    // Prepare response, excluding EmployeeID, EmployeeMobileNo, DeliveryID, and DeliveryDate
    const bookingResponse = {
      BookingID: savedBooking.BookingID,
      BookingDate: savedBooking.BookingDate,
      Cylinder_Quantity: savedBooking.Cylinder_Quantity,
      CustomerID: savedBooking.CustomerID,
      Payment_Mode: savedBooking.Payment_Mode,
      Payment: savedBooking.Payment,
      OTP: savedBooking.OTP,
      TotalAmount: savedBooking.TotalAmount,
      Expected_Delivery_Date: savedBooking.Expected_Delivery_Date,
      AgencyID: savedBooking.AgencyID,
      AgencyName: savedBooking.AgencyName,
      AgencyAddress: savedBooking.AgencyAddress,
      Status: savedBooking.Status,
      _id: savedBooking._id,
      createdAt: savedBooking.createdAt,
      updatedAt: savedBooking.updatedAt
    };

    res.status(201).json({
      message: 'Booking created successfully',
      booking: bookingResponse
    });
  } catch (error) {
    console.error('Error creating booking:', {
      message: error.message,
      stack: error.stack,
      CustomerID: req.body.CustomerID
    });
    if (error.code === 11000) {
      return res.status(400).json({ message: 'BookingID or OTP already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// View bookings with optional filters and pagination
exports.viewBookings = async (req, res) => {
  try {
    console.log('Starting viewBookings with query:', req.query);
    const { CustomerID, BookingID, page = 1, limit = 10 } = req.query;

    // Build query object
    const query = {};
    if (CustomerID) {
      query.CustomerID = CustomerID;
    }
    if (BookingID) {
      query.BookingID = BookingID;
    }

    // Validate pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      console.error('Invalid page number', { page });
      return res.status(400).json({ message: 'Invalid page number' });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      console.error('Invalid limit', { limit });
      return res.status(400).json({ message: 'Invalid limit (must be between 1 and 100)' });
    }

    // Fetch bookings with pagination
    console.log('Fetching bookings with query:', query);
    const bookings = await Booking.find(query)
      .select('-EmployeeID -EmployeeMobileNo -DeliveryID -DeliveryDate') // Exclude sensitive/unset fields
      .sort({ createdAt: -1 }) // Newest first
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalBookings = await Booking.countDocuments(query);

    console.log(`Fetched ${bookings.length} bookings, total: ${totalBookings}`);
    res.status(200).json({
      message: 'Bookings retrieved successfully',
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalBookings,
        pages: Math.ceil(totalBookings / limitNum)
      }
    });
  } catch (error) {
    console.error('Error viewing bookings:', {
      message: error.message,
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//customerBooking
exports.viewBookingbyCustomerID = async (req, res) => {
  try {
    console.log('Starting viewBookings with body:', req.body, 'query:', req.query);
    const { CustomerID, BookingID } = req.body;
    const { page = 1, limit = 10 } = req.query;

    // Validate CustomerID
    if (!CustomerID) {
      console.error('CustomerID is required');
      return res.status(400).json({ success: false, message: 'CustomerID is required in request body' });
    }


    // Build query object
    const query = { CustomerID };
    if (BookingID) {
      query.BookingID = BookingID;
    }

    // Validate pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      console.error('Invalid page number', { page });
      return res.status(400).json({ success: false, message: 'Invalid page number' });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      console.error('Invalid limit', { limit });
      return res.status(400).json({ success: false, message: 'Invalid limit (must be between 1 and 100)' });
    }

    // Fetch bookings with pagination
    console.log('Fetching bookings with query:', query);
    const bookings = await Booking.find(query)
      .select('-EmployeeID -EmployeeMobileNo -DeliveryID -DeliveryDate') // Exclude sensitive fields
      .sort({ createdAt: -1 }) // Newest first
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalBookings = await Booking.countDocuments(query);

    console.log(`Fetched ${bookings.length} bookings, total: ${totalBookings}`);
    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalBookings,
        pages: Math.ceil(totalBookings / limitNum)
      }
    });
  } catch (error) {
    console.error('Error viewing bookings:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      query: req.query
    });
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingID, status } = req.body;
    const booking = await Booking.findOne({ BookingID: bookingID });
    if (!booking) throw new Error('Booking not found');

    booking.Payment = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update booking status: ${error.message}`
    });
  }
};


  exports.getBookingDeliveryStatus = async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await Booking.findOne({ BookingID: bookingId })
        .populate('EmployeeID', 'StaffName StaffMobileNo');
      if (!booking) throw new Error('Booking not found');
  
      const assignment = await Assignment.findOne({ BookingID: bookingId });
      const deliveryStatus = assignment ? assignment.Cylinder_Delivery_Status : 'Not Assigned';
  
      res.status(200).json({
        success: true,
        booking: {
          BookingID: booking.BookingID,
          CustomerID: booking.CustomerID,
          Expected_Delivery_Date: booking.Expected_Delivery_Date,
          DeliveryDate: booking.DeliveryDate || null,
          Cylinder_Quantity: booking.Cylinder_Quantity,
          Payment_Mode: booking.Payment_Mode,
          TotalAmount: booking.TotalAmount,
        },
        deliveryStatus,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Failed to get delivery status: ${error.message}`,
      });
    }
  };

  exports.getAssignmentDeliveryStatus = async (req, res) => {
    try {
      const { employeeId, customerId, day, month, year } = req.query;
  
      let query = {};
      if (employeeId) query.EmployeeID = employeeId;
      if (customerId) query.CustomerID = customerId; // Assuming CustomerID is added to Assignment model
  
      if (day || month || year) {
        const dateFilter = {};
        if (day) dateFilter.$dayOfMonth = parseInt(day);
        if (month) dateFilter.$month = parseInt(month);
        if (year) dateFilter.$year = parseInt(year);
        query.DeliveryDate = { $expr: dateFilter };
      }
  
      const assignments = await Assignment.find(query)
        .populate('EmployeeID', 'StaffName StaffMobileNo')
        .populate('BookingID', 'CustomerID TotalAmount');
  
      if (!assignments.length) {
        return res.status(404).json({
          success: false,
          message: 'No assignments found for the given filters',
        });
      }
  
      const result = assignments.map(assignment => ({
        AssignmentID: assignment.AssignmentID,
        EmployeeID: assignment.EmployeeID,
        CustomerID: assignment.BookingID?.CustomerID || null,
        DeliveryStatus: assignment.Cylinder_Delivery_Status,
        PaymentStatus: assignment.ReceivedPaymentStatus,
        TotalPayment: assignment.TotalPayment,
        DeliveryDate: assignment.DeliveryDate || null,
      }));
  
      res.status(200).json({
        success: true,
        count: result.length,
        assignments: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Failed to get assignment delivery status: ${error.message}`,
      });
    }
  };