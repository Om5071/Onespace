const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = env.UPLOAD_DIR;
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|txt|md|csv|xlsx|zip/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  }
  cb(new Error('File format not supported! Only images, documents, PDFs, and archives are allowed.'));
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter
});

module.exports = upload;
