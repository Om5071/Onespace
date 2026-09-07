const Note = require('../models/Note');

const getNotes = async (req, res, next) => {
  try {
    const { category, tag, search, isPinned } = req.query;
    const userId = req.user._id;
    const query = {
      $and: [
        { $or: [{ user: userId }, { userId: userId }] }
      ],
      isArchived: { $ne: true }
    };

    if (category && category !== 'All') query.category = category;
    if (tag) query.tags = tag;
    if (isPinned !== undefined) query.isPinned = isPinned === 'true';
    if (search) {
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });

    const categories = await Note.distinct('category', {
      $or: [{ user: userId }, { userId: userId }],
      isArchived: { $ne: true }
    });
    const tags = await Note.distinct('tags', {
      $or: [{ user: userId }, { userId: userId }],
      isArchived: { $ne: true }
    });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: {
        notes,
        categories: categories.filter(Boolean),
        tags: tags.filter(Boolean)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, content, category, tags, isPinned, color } = req.body;

    const note = await Note.create({
      user: userId,
      userId: userId,
      title: title || 'Untitled Note',
      content: content || '',
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : [],
      isPinned: isPinned || false,
      color: color || '#3B82F6'
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note
    });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      { ...req.body, user: userId, userId: userId },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
  } catch (error) {
    next(error);
  }
};

const togglePinNote = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.status(200).json({
      success: true,
      message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  togglePinNote,
  deleteNote
};
