const Task = require('../models/Task');

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, sort = '-createdAt' } = req.query;
    const userId = req.user._id;
    const query = {
      $and: [
        { $or: [{ user: userId }, { userId: userId }] }
      ]
    };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'dueDate') sortObj = { dueDate: 1 };
    else if (sort === '-dueDate') sortObj = { dueDate: -1 };
    else if (sort === 'priority') sortObj = { priority: 1 };
    else if (sort === 'title') sortObj = { title: 1 };
    else if (sort) sortObj = sort;

    const tasks = await Task.find(query).sort(sortObj);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, description, status, priority, dueDate, dueTime, tags, subtasks, estimatedMinutes } = req.body;

    const task = await Task.create({
      user: userId,
      userId,
      title,
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      dueTime: dueTime || '',
      tags: tags || [],
      subtasks: subtasks || [],
      estimatedMinutes: estimatedMinutes || 0
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.body;
    const updateData = { ...req.body };

    if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status && status !== 'completed') {
      updateData.completedAt = null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.body;
    if (!['pending', 'in_progress', 'completed', 'overdue'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const completedAt = status === 'completed' ? new Date() : null;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      { status, completedAt },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
