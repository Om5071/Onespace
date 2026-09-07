const Document = require('../models/Document');
const { deleteFile } = require('../services/fileStorageService');
const path = require('path');
const fs = require('fs');

const getDocuments = async (req, res, next) => {
  try {
    const { category, tag, search } = req.query;
    const userId = req.user._id;
    const query = {
      $and: [
        { $or: [{ user: userId }, { userId: userId }] }
      ]
    };

    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) {
      query.$and.push({
        $or: [
          { fileName: { $regex: search, $options: 'i' } },
          { originalName: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const documents = await Document.find(query).sort({ uploadDate: -1, createdAt: -1 });
    const categories = await Document.distinct('category', { $or: [{ user: userId }, { userId: userId }] });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: {
        documents,
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const doc = await Document.findOne({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const userId = req.user._id;
    const { category, tags, notes } = req.body;
    let parsedTags = [];
    if (tags) {
      parsedTags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    }

    const doc = await Document.create({
      user: userId,
      userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      mimeType: req.file.mimetype,
      storagePath: req.file.path,
      category: category || 'General',
      tags: parsedTags,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

const renameDocument = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { fileName, originalName } = req.body;
    const newName = originalName || fileName;

    if (!newName) {
      return res.status(400).json({ success: false, message: 'New file name is required' });
    }

    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      { originalName: newName, lastModifiedDate: new Date() },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Document renamed successfully',
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

const downloadDocument = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const doc = await Document.findOne({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const filePath = path.resolve(doc.storagePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on disk' });
    }

    res.download(filePath, doc.originalName || doc.fileName);
  } catch (error) {
    next(error);
  }
};

const viewDocumentFile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const doc = await Document.findOne({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Access denied or Document not found' });
    }

    const filePath = path.resolve(doc.storagePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on disk' });
    }

    res.setHeader('Content-Type', doc.mimeType || doc.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName || doc.fileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
};

const updateDocumentMetadata = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { category, tags, notes, originalName } = req.body;
    const updates = { lastModifiedDate: new Date() };

    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (notes !== undefined) updates.notes = notes;
    if (originalName !== undefined) updates.originalName = originalName;

    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      updates,
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Document updated',
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const doc = await Document.findOne({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    deleteFile(doc.storagePath);
    await Document.deleteOne({ _id: doc._id });

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  uploadDocument,
  renameDocument,
  downloadDocument,
  viewDocumentFile,
  updateDocumentMetadata,
  deleteDocument
};
