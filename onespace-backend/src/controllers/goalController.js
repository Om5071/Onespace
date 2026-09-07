const Goal = require('../models/Goal');
const GoalProgress = require('../models/GoalProgress');

const getGoals = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const userId = req.user._id;
    const query = { $or: [{ user: userId }, { userId: userId }] };

    if (status) query.status = status;
    if (category) query.category = category;

    const goals = await Goal.find(query).sort({ targetDate: 1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

const getGoalById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const goal = await Goal.findOne({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const progressLogs = await GoalProgress.find({
      $and: [
        { $or: [{ goal: goal._id }, { goalId: goal._id }] },
        { $or: [{ user: userId }, { userId: userId }] }
      ]
    }).sort({ date: -1, loggedDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        goal,
        progressLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, description, category, targetDate, metrics, milestones, color } = req.body;

    const goal = await Goal.create({
      user: userId,
      userId,
      title,
      description: description || '',
      category: category || 'Personal',
      targetDate,
      metrics: metrics || { unit: '%', startValue: 0, targetValue: 100, currentValue: 0 },
      milestones: milestones || [],
      color: color || '#3b82f6'
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

const completeGoal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      { status: 'completed', progressPercent: 100 },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Goal marked as completed',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

const logGoalProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { valueAdded, progressValue, notes, note } = req.body;
    const goal = await Goal.findOne({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const increment = Number(valueAdded !== undefined ? valueAdded : progressValue) || 0;
    const newCurrent = Number(goal.metrics.currentValue || 0) + increment;
    goal.metrics.currentValue = newCurrent;

    const targetVal = goal.metrics.targetValue || 100;
    goal.progressPercent = Math.min(100, Math.round((newCurrent / targetVal) * 100));

    if (newCurrent >= targetVal) {
      goal.status = 'completed';
    }

    await goal.save();

    const log = await GoalProgress.create({
      goal: goal._id,
      goalId: goal._id,
      user: userId,
      userId,
      valueAdded: increment,
      progressValue: increment,
      currentTotal: newCurrent,
      note: note || notes || '',
      notes: note || notes || ''
    });

    res.status(200).json({
      success: true,
      message: 'Goal progress logged successfully',
      data: {
        goal,
        log
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    await GoalProgress.deleteMany({ $or: [{ goal: req.params.id }, { goalId: req.params.id }] });

    res.status(200).json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  completeGoal,
  logGoalProgress,
  deleteGoal
};
