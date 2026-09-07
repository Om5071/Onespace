const fs = require('fs');
const path = require('path');
const env = require('../config/env');

const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error('[FileStorageService] Error deleting file:', error.message);
  }
  return false;
};

const getFileStream = (filePath) => {
  if (fs.existsSync(filePath)) {
    return fs.createReadStream(filePath);
  }
  return null;
};

module.exports = {
  deleteFile,
  getFileStream
};
