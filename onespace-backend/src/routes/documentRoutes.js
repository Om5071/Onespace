const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getDocumentById,
  uploadDocument,
  renameDocument,
  downloadDocument,
  viewDocumentFile,
  updateDocumentMetadata,
  deleteDocument
} = require('../controllers/documentController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/fileUploadMiddleware');

router.use(protect);

router.route('/')
  .get(getDocuments)
  .post(upload.single('file'), uploadDocument);

router.get('/:id', getDocumentById);
router.put('/:id/rename', renameDocument);
router.get('/:id/download', downloadDocument);
router.get('/:id/view', viewDocumentFile);
router.put('/:id', updateDocumentMetadata);
router.delete('/:id', deleteDocument);

module.exports = router;
