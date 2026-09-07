const Task = require('../models/Task');
const Note = require('../models/Note');
const Event = require('../models/Event');
const Document = require('../models/Document');
const Goal = require('../models/Goal');

const searchAll = async (req, res, next) => {
  try {
    const { q, type } = req.query;

    if (!q || q.trim() === '') {
      return res.status(200).json({
        success: true,
        data: {
          tasks: [],
          notes: [],
          events: [],
          documents: [],
          goals: []
        }
      });
    }

    const regex = new RegExp(q.trim(), 'i');
    const userId = req.user._id;

    const shouldSearch = (entityType) => !type || type === 'all' || type === entityType;

    const userMatch = { $or: [{ user: userId }, { userId }] };

    const [tasks, notes, events, documents, goals] = await Promise.all([
      shouldSearch('task')
        ? Task.find({
            $and: [
              userMatch,
              { $or: [{ title: regex }, { description: regex }, { tags: regex }] }
            ]
          }).limit(10)
        : Promise.resolve([]),

      shouldSearch('note')
        ? Note.find({
            $and: [
              userMatch,
              { isArchived: false },
              { $or: [{ title: regex }, { content: regex }, { category: regex }, { tags: regex }] }
            ]
          }).limit(10)
        : Promise.resolve([]),

      shouldSearch('event')
        ? Event.find({
            $and: [
              userMatch,
              { $or: [{ title: regex }, { description: regex }, { location: regex }, { category: regex }] }
            ]
          }).limit(10)
        : Promise.resolve([]),

      shouldSearch('document')
        ? Document.find({
            $and: [
              userMatch,
              { $or: [{ originalName: regex }, { notes: regex }, { category: regex }, { tags: regex }] }
            ]
          }).limit(10)
        : Promise.resolve([]),

      shouldSearch('goal')
        ? Goal.find({
            $and: [
              userMatch,
              { $or: [{ title: regex }, { description: regex }, { category: regex }] }
            ]
          }).limit(10)
        : Promise.resolve([])
    ]);

    const totalResults = tasks.length + notes.length + events.length + documents.length + goals.length;

    res.status(200).json({
      success: true,
      totalResults,
      data: {
        tasks,
        notes,
        events,
        documents,
        goals
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchAll
};
