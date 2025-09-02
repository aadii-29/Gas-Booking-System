const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempPath = path.join(__dirname, '..', 'Uploads', 'temp');
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }
    cb(null, tempPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit per file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      AadharDocument: ['image/jpeg', 'image/png', 'application/pdf'],
      AddressProofDocument: ['image/jpeg', 'image/png', 'application/pdf'],
      BankDocument: ['image/jpeg', 'image/png', 'application/pdf'],
      ProfilePic: ['image/jpeg', 'image/png'],
      Signature: ['image/jpeg', 'image/png', 'application/pdf'], // Added Signature
    };
    const fieldName = file.fieldname;
    if (allowedTypes[fieldName]?.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${fieldName}. Allowed types: ${allowedTypes[fieldName].join(', ')}.`));
    }
  },
}).fields([
  { name: 'AadharDocument', maxCount: 1 },
  { name: 'AddressProofDocument', maxCount: 1 },
  { name: 'BankDocument', maxCount: 1 },
  { name: 'ProfilePic', maxCount: 1 },
  { name: 'Signature', maxCount: 1 }, // Added Signature
]);

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
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

    const requiredFields = ['AadharDocument', 'AddressProofDocument', 'BankDocument', 'ProfilePic', 'Signature'];
    const uploadedFields = Object.keys(req.files || {});
    const missingFields = requiredFields.filter((field) => !uploadedFields.includes(field));

    if (missingFields.length > 0) {
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

module.exports = uploadMiddleware;