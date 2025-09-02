const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempPath = path.join(__dirname, '..', 'Uploads', 'temp');
    try {
      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }
      cb(null, tempPath);
    } catch (error) {
      cb(new Error(`Failed to create temp directory: ${error.message}`));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Configure multer with storage and validation
const agencyUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit per file
    files: 3, // Max 3 files (AadharDocument, StaffPhoto, StaffSignature)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      AadharDocument: ['image/jpeg', 'image/png', 'application/pdf'],
      StaffPhoto: ['image/jpeg', 'image/png'],
      StaffSignature: ['image/jpeg', 'image/png'],
    };

    const fieldName = file.fieldname;
    const mimeType = file.mimetype.toLowerCase();

    if (!allowedTypes[fieldName]) {
      return cb(new Error(`Invalid field name: ${fieldName}. Expected: AadharDocument, StaffPhoto, StaffSignature.`));
    }

    if (allowedTypes[fieldName].includes(mimeType)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${fieldName}. Allowed types: ${allowedTypes[fieldName].join(', ')}.`));
    }
  },
}).fields([
  { name: 'AadharDocument', maxCount: 1 },
  { name: 'StaffPhoto', maxCount: 1 },
  { name: 'StaffSignature', maxCount: 1 },
]);

// Middleware wrapper to handle errors and cleanup
const agencyUploadMiddleware = (req, res, next) => {
  agencyUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    }

    // Ensure all required files are present
    const requiredFields = ['AadharDocument', 'StaffPhoto', 'StaffSignature'];
    const uploadedFields = Object.keys(req.files || {});
    const missingFields = requiredFields.filter((field) => !uploadedFields.includes(field));

    if (missingFields.length > 0) {
      // Clean up any uploaded files
      if (req.files) {
        Object.values(req.files).forEach((fileArray) =>
          fileArray.forEach((file) => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          })
        );
      }
      return res.status(400).json({
        success: false,
        message: `Missing required documents: ${missingFields.join(', ')}`,
      });
    }

    next();
  });
};

module.exports = agencyUploadMiddleware;