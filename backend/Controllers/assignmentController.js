
const DeliveryStaff = require('../Models/DeliveryStaff');
const Cylinder = require('../Models/CylinderModel');
const Booking = require('../Models/BookingModel');
const Assignment = require('../Models/AssignmentModel');
// Create a new assignment for delivery staff
exports.createAssignment = async (req, res) => {
  try {
    const {
      EmployeeID,
      TotalCylinder,
      FilledCylinder,
      EmptyCylinder,
      TotalPayment,
      BookingID // Optional: Link to a specific booking
    } = req.body;

    // Validate input
    if (!EmployeeID || !TotalCylinder || !FilledCylinder || !EmptyCylinder || !TotalPayment) {
      throw new Error('Missing required assignment details');
    }

    // Check if delivery staff exists
    const staff = await DeliveryStaff.findById(EmployeeID);
    if (!staff) {
      throw new Error('Delivery staff not found');
    }

    // Validate cylinder availability
    const cylinder = await Cylinder.findOne({ CylinderCategory: staff.AgencyID ? 'Domestic' : 'Commercial' }); // Simplified category check
    if (!cylinder || cylinder.FilledCylinder < FilledCylinder) {
      throw new Error('Insufficient filled cylinders available');
    }

    // If linked to a booking, verify it
    let booking = null;
    if (BookingID) {
      booking = await Booking.findOne({ BookingID });
      if (!booking) throw new Error('Booking not found');
      if (booking.Cylinder_Quantity !== FilledCylinder) {
        throw new Error('Filled cylinders must match booking quantity');
      }
    }

    const assignment = new Assignment({
      EmployeeID,
      EmployeeMobileNo: staff.StaffMobileNo,
      TotalCylinder,
      FilledCylinder,
      EmptyCylinder,
      TotalPayment,
      Cylinder_Delivery_Status: 'Pending',
      ReceivedPaymentStatus: 'Pending'
    });

    // Link to booking if provided
    if (booking) {
      assignment.TotalPayment = booking.TotalAmount.Cylinder_Price;
    }

    await assignment.save();

    // Update cylinder stock
    cylinder.FilledCylinder -= FilledCylinder;
    cylinder.EmptyCylinder += EmptyCylinder;
    await cylinder.save();

    // Update booking status if linked
    if (booking) {
      booking.DeliveryDate = new Date();
      booking.EmployeeID = EmployeeID;
      await booking.save();
    }

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to create assignment: ${error.message}`
    });
  }
};

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('EmployeeID', 'StaffName StaffMobileNo')
      .select('-__v');
    
    if (!assignments.length) {
      return res.status(404).json({
        success: false,
        message: 'No assignments found'
      });
    }

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get assignments: ${error.message}`
    });
  }
};

// Get assignments by staff ID
exports.getAssignmentsByStaff = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const staff = await DeliveryStaff.findById(employeeId);
    if (!staff) {
      throw new Error('Delivery staff not found');
    }

    const assignments = await Assignment.find({ EmployeeID: employeeId })
      .populate('EmployeeID', 'StaffName StaffMobileNo')
      .select('-__v');

    if (!assignments.length) {
      return res.status(404).json({
        success: false,
        message: 'No assignments found for this staff'
      });
    }

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get staff assignments: ${error.message}`
    });
  }
};

// Update assignment status
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { 
      Cylinder_Delivery_Status, 
      ReceivedPaymentStatus, 
      FilledCylinder, 
      EmptyCylinder 
    } = req.body;

    const assignment = await Assignment.findOne({ AssignmentID: assignmentId });
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Update only provided fields
    if (Cylinder_Delivery_Status) {
      if (!['Pending', 'In-Progress', 'Delivered'].includes(Cylinder_Delivery_Status)) {
        throw new Error('Invalid delivery status');
      }
      assignment.Cylinder_Delivery_Status = Cylinder_Delivery_Status;
    }
    if (ReceivedPaymentStatus) {
      if (!['Pending', 'Partial', 'Received'].includes(ReceivedPaymentStatus)) {
        throw new Error('Invalid payment status');
      }
      assignment.ReceivedPaymentStatus = ReceivedPaymentStatus;
    }

    // Handle cylinder stock updates if quantities change
    if (FilledCylinder !== undefined || EmptyCylinder !== undefined) {
      const cylinder = await Cylinder.findOne({ CylinderCategory: 'Domestic' }); // Adjust based on agency logic
      if (!cylinder) throw new Error('Cylinder inventory not found');

      const oldFilled = assignment.FilledCylinder;
      const oldEmpty = assignment.EmptyCylinder;

      assignment.FilledCylinder = FilledCylinder !== undefined ? FilledCylinder : oldFilled;
      assignment.EmptyCylinder = EmptyCylinder !== undefined ? EmptyCylinder : oldEmpty;

      // Adjust cylinder stock
      cylinder.FilledCylinder += (oldFilled - assignment.FilledCylinder);
      cylinder.EmptyCylinder += (oldEmpty - assignment.EmptyCylinder);

      if (cylinder.FilledCylinder < 0 || cylinder.EmptyCylinder < 0) {
        throw new Error('Insufficient cylinder stock for update');
      }

      await cylinder.save();
    }

    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update assignment: ${error.message}`
    });
  }
};

// Delete an assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findOne({ AssignmentID: assignmentId });
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Check if assignment is in progress or delivered
    if (assignment.Cylinder_Delivery_Status !== 'Pending') {
      throw new Error('Cannot delete an assignment that is in progress or delivered');
    }

    // Restore cylinder stock
    const cylinder = await Cylinder.findOne({ CylinderCategory: 'Domestic' }); // Adjust based on agency logic
    if (cylinder) {
      cylinder.FilledCylinder += assignment.FilledCylinder;
      cylinder.EmptyCylinder += assignment.EmptyCylinder;
      await cylinder.save();
    }

    await Assignment.deleteOne({ AssignmentID: assignmentId });

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to delete assignment: ${error.message}`
    });
  }
};

// Complete assignment (mark as delivered and update payment)
exports.completeAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { paymentReceived } = req.body; // Amount received

    const assignment = await Assignment.findOne({ AssignmentID: assignmentId });
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (assignment.Cylinder_Delivery_Status === 'Delivered') {
      throw new Error('Assignment already completed');
    }

    // Update cylinder stock and status
    const cylinder = await Cylinder.findOne({ CylinderCategory: 'Domestic' }); // Adjust based on agency logic
    if (!cylinder) throw new Error('Cylinder inventory not found');

    cylinder.FilledCylinder -= assignment.FilledCylinder; // Delivered to customer
    cylinder.EmptyCylinder += assignment.FilledCylinder; // Customer returns empty
    await cylinder.save();

    assignment.Cylinder_Delivery_Status = 'Delivered';
    if (paymentReceived !== undefined) {
      if (paymentReceived >= assignment.TotalPayment) {
        assignment.ReceivedPaymentStatus = 'Received';
      } else if (paymentReceived > 0) {
        assignment.ReceivedPaymentStatus = 'Partial';
      }
    }

    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Assignment completed successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to complete assignment: ${error.message}`
    });
  }
};

