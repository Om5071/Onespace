const mongoose = require('mongoose');
const Task = require('../models/Task');
const DailyActivity = require('../models/DailyActivity');
const FitnessRecord = require('../models/FitnessRecord');
const Goal = require('../models/Goal');

const getProductivityMetrics = async (userId, days = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const [taskStats, priorityStats] = await Promise.all([
    Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const statusMap = { pending: 0, in_progress: 0, completed: 0 };
  taskStats.forEach((stat) => {
    statusMap[stat._id] = stat.count;
  });

  const totalTasks = statusMap.pending + statusMap.in_progress + statusMap.completed;
  const completionRate = totalTasks > 0 ? Math.round((statusMap.completed / totalTasks) * 100) : 0;

  return {
    totalTasks,
    statusMap,
    priorityStats,
    completionRate
  };
};

const getHabitAndDailyMetrics = async (userId, days = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffString = cutoffDate.toISOString().split('T')[0];

  const activities = await DailyActivity.find({
    userId,
    date: { $gte: cutoffString }
  }).sort({ date: 1 });

  let totalMood = 0;
  let totalSleep = 0;
  let totalWater = 0;
  const habitCounts = {};

  activities.forEach((act) => {
    totalMood += act.mood || 3;
    totalSleep += act.sleepHours || 0;
    totalWater += act.waterIntakeMl || 0;

    (act.habits || []).forEach((h) => {
      if (!habitCounts[h.name]) {
        habitCounts[h.name] = { name: h.name, completed: 0, total: 0 };
      }
      habitCounts[h.name].total += 1;
      if (h.isCompleted) habitCounts[h.name].completed += 1;
    });
  });

  const count = activities.length || 1;
  const habitSummary = Object.values(habitCounts).map((h) => ({
    ...h,
    successRate: h.total > 0 ? Math.round((h.completed / h.total) * 100) : 0
  }));

  return {
    avgMood: Number((totalMood / count).toFixed(1)),
    avgSleep: Number((totalSleep / count).toFixed(1)),
    avgWater: Math.round(totalWater / count),
    daysLogged: activities.length,
    habitSummary,
    trend: activities.map((a) => ({
      date: a.date,
      mood: a.mood,
      sleep: a.sleepHours,
      water: a.waterIntakeMl
    }))
  };
};

module.exports = {
  getProductivityMetrics,
  getHabitAndDailyMetrics
};
