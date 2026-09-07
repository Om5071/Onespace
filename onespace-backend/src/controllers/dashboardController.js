const Task = require('../models/Task');
const Event = require('../models/Event');
const Reminder = require('../models/Reminder');
const Goal = require('../models/Goal');
const DailyActivity = require('../models/DailyActivity');
const Note = require('../models/Note');

const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    const userQuery = { $or: [{ user: userId }, { userId: userId }] };

    const [
      pendingTasksCount,
      completedTasksCount,
      todayTasks,
      todayEvents,
      upcomingReminders,
      activeGoals,
      todayActivity,
      recentNotes
    ] = await Promise.all([
      Task.countDocuments({ ...userQuery, status: { $ne: 'completed' } }),
      Task.countDocuments({ ...userQuery, status: 'completed' }),
      Task.find({
        ...userQuery,
        dueDate: { $gte: startOfToday, $lte: endOfToday }
      }).limit(5),
      Event.find({
        ...userQuery,
        startTime: { $gte: startOfToday, $lte: endOfToday }
      }).sort({ startTime: 1 }),
      Reminder.find({
        ...userQuery,
        isTriggered: false,
        isDismissed: false
      }).sort({ remindAt: 1 }).limit(5),
      Goal.find({ ...userQuery, status: 'active' }).limit(4),
      DailyActivity.findOne({ ...userQuery, date: todayStr }),
      Note.find({ ...userQuery, isArchived: { $ne: true } }).sort({ isPinned: -1, updatedAt: -1 }).limit(6)
    ]);

    const totalTasks = pendingTasksCount + completedTasksCount;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        pendingTasksCount,
        completedTasksCount,
        taskCompletionRate,
        stats: {
          pendingTasks: pendingTasksCount,
          completedTasks: completedTasksCount,
          taskCompletionRate,
          activeGoalsCount: activeGoals.length
        },
        todayTasks: todayTasks || [],
        todayEvents: todayEvents || [],
        upcomingReminders: upcomingReminders || [],
        todayHabits: todayActivity?.habits || [
          { name: 'Morning Exercise / Stretching', isCompleted: false },
          { name: 'Drink 2L Water', isCompleted: false },
          { name: 'Read 20 mins', isCompleted: false },
          { name: 'Meditation / Mindfulness', isCompleted: false }
        ],
        activeGoals: activeGoals || [],
        todayActivity: todayActivity || {
          date: todayStr,
          mood: 'good',
          sleepHours: 7,
          waterIntakeMl: 2000,
          habits: [],
          expenses: [],
          notes: ''
        },
        recentNotes: recentNotes || []
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};
