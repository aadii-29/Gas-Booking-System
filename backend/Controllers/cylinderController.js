const Cylinder = require('../Models/CylinderModel');
const Booking = require('../Models/BookingModel');
const Assignment = require('../Models/AssignmentModel');

// Create a new cylinder entry
exports.createCylinder = async (req, res) => {
  try {
    const {
      TotalCylinder,
      FilledCylinder,
      EmptyCylinder,
      RegularCylinderBasePrice,
      CommercialCylinderBasePrice,
      GST,
      CylinderPrice,
      CylinderQuantity,
      CylinderCategory
    } = req.body;

    if (!TotalCylinder || !FilledCylinder || !EmptyCylinder || !CylinderCategory) {
      throw new Error('Missing required cylinder details');
    }

    if (FilledCylinder + EmptyCylinder > TotalCylinder) {
      throw new Error('Sum of filled and empty cylinders cannot exceed total cylinders');
    }

    const cylinder = new Cylinder({
      TotalCylinder,
      FilledCylinder,
      EmptyCylinder,
      RegularCylinderBasePrice: RegularCylinderBasePrice || 0,
      CommercialCylinderBasePrice: CommercialCylinderBasePrice || 0,
      GST: GST || 0,
      CylinderPrice: CylinderPrice || 0,
      CylinderQuantity: CylinderQuantity || TotalCylinder,
      CylinderCategory
    });

    await cylinder.save();

    res.status(201).json({
      success: true,
      message: 'Cylinder created successfully',
      cylinder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to create cylinder: ${error.message}`
    });
  }
};

// Get all cylinder stock
exports.getCylinderStock = async (req, res) => {
  try {
    const cylinders = await Cylinder.find().select('-__v');
    if (!cylinders.length) {
      return res.status(404).json({
        success: false,
        message: 'No cylinders found'
      });
    }

    res.status(200).json({
      success: true,
      count: cylinders.length,
      cylinders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get cylinder stock: ${error.message}`
    });
  }
};

// Get cylinder by category
exports.getCylinderByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!['Domestic', 'Commercial'].includes(category)) {
      throw new Error('Invalid cylinder category');
    }

    const cylinders = await Cylinder.find({ CylinderCategory: category }).select('-__v');
    if (!cylinders.length) {
      return res.status(404).json({
        success: false,
        message: `No cylinders found for category: ${category}`
      });
    }

    res.status(200).json({
      success: true,
      count: cylinders.length,
      cylinders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get cylinders by category: ${error.message}`
    });
  }
};

// Update cylinder stock
exports.updateCylinderStock = async (req, res) => {
  try {
    const { cylinderId } = req.params;
    const { 
      TotalCylinder, 
      FilledCylinder, 
      EmptyCylinder, 
      CylinderDeliveryStatus, 
      CylinderPrice 
    } = req.body;

    const cylinder = await Cylinder.findById(cylinderId);
    if (!cylinder) {
      throw new Error('Cylinder not found');
    }

    if (TotalCylinder !== undefined) cylinder.TotalCylinder = TotalCylinder;
    if (FilledCylinder !== undefined) cylinder.FilledCylinder = FilledCylinder;
    if (EmptyCylinder !== undefined) cylinder.EmptyCylinder = EmptyCylinder;
    if (CylinderDeliveryStatus) cylinder.CylinderDeliveryStatus = CylinderDeliveryStatus;
    if (CylinderPrice !== undefined) cylinder.CylinderPrice = CylinderPrice;

    if (cylinder.FilledCylinder + cylinder.EmptyCylinder > cylinder.TotalCylinder) {
      throw new Error('Sum of filled and empty cylinders cannot exceed total cylinders');
    }

    await cylinder.save();

    res.status(200).json({
      success: true,
      message: 'Cylinder stock updated successfully',
      cylinder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update cylinder stock: ${error.message}`
    });
  }
};

// Delete a cylinder entry
exports.deleteCylinder = async (req, res) => {
  try {
    const { cylinderId } = req.params;

    const bookings = await Booking.find({ 'TotalAmount.Cylinder_Price': { $exists: true } });
    const assignments = await Assignment.find({ TotalCylinder: { $exists: true } });
    
    if (bookings.length > 0 || assignments.length > 0) {
      throw new Error('Cannot delete cylinder with active bookings or assignments');
    }

    const cylinder = await Cylinder.findByIdAndDelete(cylinderId);
    if (!cylinder) {
      throw new Error('Cylinder not found');
    }

    res.status(200).json({
      success: true,
      message: 'Cylinder deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to delete cylinder: ${error.message}`
    });
  }
};

// Adjust cylinder stock based on booking or return
exports.adjustCylinderStock = async (req, res) => {
  try {
    const { cylinderId, action, quantity } = req.body;

    if (!['book', 'return'].includes(action) || !quantity || quantity < 0) {
      throw new Error('Invalid action or quantity');
    }

    const cylinder = await Cylinder.findById(cylinderId);
    if (!cylinder) {
      throw new Error('Cylinder not found');
    }

    if (action === 'book') {
      if (cylinder.FilledCylinder < quantity) {
        throw new Error('Insufficient filled cylinders available');
      }
      cylinder.FilledCylinder -= quantity;
      cylinder.EmptyCylinder += quantity;
      cylinder.CylinderDeliveryStatus = 'On-the-way';
    } else if (action === 'return') {
      if (cylinder.EmptyCylinder < quantity) {
        throw new Error('Insufficient empty cylinders to return');
      }
      cylinder.EmptyCylinder -= quantity;
      cylinder.FilledCylinder += quantity;
      cylinder.CylinderDeliveryStatus = 'Delivered';
    }

    await cylinder.save();

    res.status(200).json({
      success: true,
      message: `Cylinder stock adjusted for ${action} successfully`,
      cylinder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to adjust cylinder stock: ${error.message}`
    });
  }
};

