const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const authMiddleware = require('../Middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for single ProfilePic upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const tempPath = path.join(__dirname, '..', 'Uploads', 'Profile-Pictures');
      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }
      cb(null, tempPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type for ProfilePic. Allowed types: image/jpeg, image/png.'));
    }
  },
}).fields([{ name: 'ProfilePic', maxCount: 1 }]);

// Custom middleware to handle only ProfilePic
const profilePicUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    if (!req.files?.ProfilePic) {
      return res.status(400).json({ success: false, message: 'ProfilePic is required' });
    }
    next();
  });
};

// Routes
router.post('/upload-profile-picture', authMiddleware, profilePicUpload, authController.uploadProfilePicture);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/userinfo', authMiddleware, authController.userinfo);

module.exports = router;