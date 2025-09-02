const mongoose = require('mongoose');
const DeliveryStaff = mongoose.model('DeliveryStaff');
const Agency = mongoose.model('Agency');
const User = mongoose.model('User');
const AdminModel = mongoose.model('AdminModel');



// Create a new delivery staff member
exports.createDeliveryStaff = async (req, res) => {
  try {
    const {
      UserID, // Optional
      AgencyID,
      StaffName,
      DOB,
      StaffMobileNo,
      StaffEmail,
      StaffAddress,
      AadharNumber,
      Salary,
      StaffPhoto,
      StaffSignature,
      AssignedArea,
    } = req.body;

    // Determine AgencyID based on user role
    let targetAgencyID = AgencyID;
    if (req.user.role === 'Agency') {
      const agency = await Agency.findOne({
        UserID: req.user._id,
        Approval_Status: 'Approved',
      });
      if (!agency) {
        return res.status(403).json({
          success: false,
          message: 'Agency not found or not approved',
        });
      }
      targetAgencyID = agency.AgencyID; // Restrict to own agency
    }

    // Validate AgencyID
    const agency = await Agency.findOne({
      AgencyID: targetAgencyID,
      Approval_Status: 'Approved',
    });
    if (!agency) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unapproved AgencyID',
      });
    }

    // Validate UserID if provided
    if (UserID) {
      const user = await User.findById(UserID);
      if (!user || user.Role !== 'DeliveryStaff') {
        return res.status(400).json({
          success: false,
          message: 'Invalid UserID or user is not a DeliveryStaff',
        });
      }
    }

    // Check for duplicate email
    const existingStaff = await DeliveryStaff.findOne({ StaffEmail });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Staff with this email already exists',
      });
    }

    // Create delivery staff
    const deliveryStaff = new DeliveryStaff({
      UserID: UserID || undefined, // Set to undefined if not provided
      AgencyID: targetAgencyID,
      StaffName,
      DOB,
      StaffMobileNo,
      StaffEmail,
      StaffAddress,
      AadharNumber,
      Salary,
      StaffPhoto,
      StaffSignature,
      AssignedArea: AssignedArea || [],
    });

    await deliveryStaff.save();

    // Log admin action if performed by Admin
    if (req.user.role === 'Admin') {
      await new AdminModel({
        adminID: req.user._id,
        action: 'DeliveryStaff created',
        targetID: deliveryStaff._id,
        targetModel: 'DeliveryStaff',
        details: `Created delivery staff ${StaffName} for agency ${targetAgencyID}`,
      }).save();
    }

    res.status(201).json({
      success: true,
      message: 'Delivery staff created successfully',
      data: deliveryStaff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error creating delivery staff: ${error.message}`,
    });
  }
};

// Get all delivery staff (filtered by AgencyID for agencies)
exports.getAllDeliveryStaff = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Agency') {
      const agency = await Agency.findOne({
        UserID: req.user._id,
        Approval_Status: 'Approved',
      });
      if (!agency) {
        return res.status(403).json({
          success: false,
          message: 'Agency not found or not approved',
        });
      }
      query.AgencyID = agency.AgencyID; // Restrict to own agency
    }

    // Optional query parameters
    if (req.query.status) {
      query.Status = req.query.status;
    }
    if (req.query.area) {
      query.AssignedArea = req.query.area;
    }

    const deliveryStaff = await DeliveryStaff.find(query).populate('UserID', 'Username EmailId');
    res.status(200).json({
      success: true,
      message: 'Delivery staff retrieved successfully',
      data: deliveryStaff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error retrieving delivery staff: ${error.message}`,
    });
  }
};

// Get a single delivery staff by ID
exports.getDeliveryStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryStaff = await DeliveryStaff.findById(id).populate('UserID', 'Username EmailId');

    if (!deliveryStaff) {
      return res.status(404).json({
        success: false,
        message: 'Delivery staff not found',
      });
    }

    // Restrict access for agencies
    if (req.user.role === 'Agency') {
      const agency = await Agency.findOne({
        UserID: req.user._id,
        Approval_Status: 'Approved',
      });
      if (!agency || deliveryStaff.AgencyID !== agency.AgencyID) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this delivery staff',
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Delivery staff retrieved successfully',
      data: deliveryStaff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error retrieving delivery staff: ${error.message}`,
    });
  }
};

// Update a delivery staff member
exports.updateDeliveryStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating immutable fields
    delete updateData.EmployeeID;
    delete updateData.AgencyID;

    const deliveryStaff = await DeliveryStaff.findById(id);
    if (!deliveryStaff) {
      return res.status(404).json({
        success: false,
        message: 'Delivery staff not found',
      });
    }

    // Restrict access for agencies
    if (req.user.role === 'Agency') {
      const agency = await Agency.findOne({
        UserID: req.user._id,
        Approval_Status: 'Approved',
      });
      if (!agency || deliveryStaff.AgencyID !== agency.AgencyID) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update this delivery staff',
        });
      }
    }

    // Validate UserID if provided in update
    if (updateData.UserID) {
      const user = await User.findById(updateData.UserID);
      if (!user || user.Role !== 'DeliveryStaff') {
        return res.status(400).json({
          success: false,
          message: 'Invalid UserID or user is not a DeliveryStaff',
        });
      }
    }

    const updatedStaff = await DeliveryStaff.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('UserID', 'Username EmailId');

    // Log admin action if performed by Admin
    if (req.user.role === 'Admin') {
      await new AdminModel({
        adminID: req.user._id,
        action: 'DeliveryStaff updated',
        targetID: updatedStaff._id,
        targetModel: 'DeliveryStaff',
        details: `Updated delivery staff ${updatedStaff.StaffName}`,
      }).save();
    }

    res.status(200).json({
      success: true,
      message: 'Delivery staff updated successfully',
      data: updatedStaff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error updating delivery staff: ${error.message}`,
    });
  }
};

// Delete a delivery staff member
exports.deleteDeliveryStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryStaff = await DeliveryStaff.findById(id);

    if (!deliveryStaff) {
      return res.status(404).json({
        success: false,
        message: 'Delivery staff not found',
      });
    }

    // Restrict access for agencies
    if (req.user.role === 'Agency') {
      const agency = await Agency.findOne({
        UserID: req.user._id,
        Approval_Status: 'Approved',
      });
      if (!agency || deliveryStaff.AgencyID !== agency.AgencyID) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to delete this delivery staff',
        });
      }
    }

    await deliveryStaff.deleteOne();

    // Log admin action if performed by Admin
    if (req.user.role === 'Admin') {
      await new AdminModel({
        adminID: req.user._id,
        action: 'DeliveryStaff deleted',
        targetID: id,
        targetModel: 'DeliveryStaff',
        details: `Deleted delivery staff ${deliveryStaff.StaffName}`,
      }).save();
    }

    res.status(200).json({
      success: true,
      message: 'Delivery staff deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error deleting delivery staff: ${error.message}`,
    });
  }
};

// Get delivery staff by AgencyID
exports.getDeliveryStaffByAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;

    // Validate AgencyID
    const agency = await Agency.findOne({
      AgencyID: agencyId,
      Approval_Status: 'Approved',
    });
    if (!agency) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unapproved AgencyID',
      });
    }

    // Restrict access for agencies
    if (req.user.role === 'Agency') {
      const userAgency = await Agency.findOne({
        UserID: req.user._id,
        Approval_Status: 'Approved',
      });
      if (!userAgency || userAgency.AgencyID !== agencyId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this agency’s staff',
        });
      }
    }

    const deliveryStaff = await DeliveryStaff.find({ AgencyID: agencyId }).populate(
      'UserID',
      'Username EmailId'
    );

    res.status(200).json({
      success: true,
      message: 'Delivery staff retrieved successfully',
      data: deliveryStaff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error retrieving delivery staff: ${error.message}`,
    });
  }
};