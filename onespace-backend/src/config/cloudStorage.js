const path = require('path');
const fs = require('fs');
const env = require('./env');

const uploadDir = env.UPLOAD_DIR;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

module.exports = {
  uploadDir,
  getPublicUrl: (filename) => `/uploads/${filename}`
};
