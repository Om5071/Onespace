const { getProductivityMetrics, getHabitAndDailyMetrics } = require('../services/analyticsService');
const Task = require('../models/Task');
const DailyActivity = require('../models/DailyActivity');
const FitnessRecord = require('../models/FitnessRecord');
const Goal = require('../models/Goal');

const getAnalytics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user._id;
    const daysInt = parseInt(days, 10);
    const startDate = new Date(Date.now() - daysInt * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [productivity, dailyMetrics, fitnessSummary, goals, dailyActivities] = await Promise.all([
      getProductivityMetrics(userId, daysInt),
      getHabitAndDailyMetrics(userId, daysInt),
      FitnessRecord.aggregate([
        {
          $match: {
            $or: [{ user: userId }, { userId: userId }],
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$workoutType',
            totalSessions: { $sum: 1 },
            totalDuration: { $sum: '$durationMinutes' },
            totalCalories: { $sum: '$caloriesBurned' }
          }
        }
      ]),
      Goal.find({ $or: [{ user: userId }, { userId: userId }] }),
      DailyActivity.find({
        $or: [{ user: userId }, { userId: userId }],
        date: { $gte: startDate }
      }).select('date expenses mood habits')
    ]);

    // Financial / Expense Calculations
    let totalExpenseAmount = 0;
    const categoryTotals = {};
    const dailyExpenseMap = {};
    const allExpensesList = [];

    dailyActivities.forEach((act) => {
      let dayTotal = 0;
      (act.expenses || []).forEach((exp) => {
        const amt = Number(exp.amount) || 0;
        totalExpenseAmount += amt;
        dayTotal += amt;
        const cat = exp.category || 'General';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
        allExpensesList.push({
          date: act.date,
          description: exp.description,
          amount: amt,
          category: cat
        });
      });
      if (dayTotal > 0) {
        dailyExpenseMap[act.date] = dayTotal;
      }
    });

    const activeDaysCount = Math.max(1, daysInt);
    const avgDailyExpense = Math.round((totalExpenseAmount / activeDaysCount) * 100) / 100;
    const projectedNextMonthExpense = Math.round(avgDailyExpense * 30);

    const expenseCategoryData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      percentage: totalExpenseAmount > 0 ? Math.round((value / totalExpenseAmount) * 100) : 0
    })).sort((a, b) => b.value - a.value);

    // Productivity Composite Score
    let score = 50;
    score += (productivity.completionRate || 0) * 0.25;
    score += ((dailyMetrics.avgMood || 3) / 5) * 15;
    score += ((dailyMetrics.avgSleep || 7) >= 7 ? 10 : 5);
    const activeGoalsCompleted = goals.filter((g) => g.status === 'completed').length;
    score += Math.min(activeGoalsCompleted * 5, 20);
    score = Math.min(100, Math.round(score));

    res.status(200).json({
      success: true,
      data: {
        compositeScore: score,
        productivity,
        dailyMetrics,
        fitnessSummary,
        financialAnalytics: {
          totalExpenses: totalExpenseAmount,
          dailyAverage: avgDailyExpense,
          projectedNextMonth: projectedNextMonthExpense,
          expenseCount: allExpensesList.length,
          categoryBreakdown: expenseCategoryData,
          recentExpenses: allExpensesList.slice(-8).reverse()
        },
        goalsOverview: {
          total: goals.length,
          completed: goals.filter((g) => g.status === 'completed').length,
          active: goals.filter((g) => g.status === 'active').length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTaskAnalytics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const metrics = await getProductivityMetrics(req.user._id, parseInt(days, 10));
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};

const getDailyActivityAnalytics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const metrics = await getHabitAndDailyMetrics(req.user._id, parseInt(days, 10));
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};

const getFitnessAnalytics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user._id;
    const daysInt = parseInt(days, 10);

    const stats = await FitnessRecord.aggregate([
      {
        $match: {
          $or: [{ user: userId }, { userId: userId }],
          date: {
            $gte: new Date(Date.now() - daysInt * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        }
      },
      {
        $group: {
          _id: '$workoutType',
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: '$durationMinutes' },
          totalCalories: { $sum: '$caloriesBurned' },
          totalSteps: { $sum: '$steps' }
        }
      }
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

const getGoalAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const goals = await Goal.find({ $or: [{ user: userId }, { userId: userId }] });
    const completed = goals.filter((g) => g.status === 'completed');
    const active = goals.filter((g) => g.status === 'active');
    const avgProgress = goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + (g.progressPercent || 0), 0) / goals.length)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        total: goals.length,
        completedCount: completed.length,
        activeCount: active.length,
        avgProgressPercent: avgProgress,
        goals
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getTaskAnalytics,
  getDailyActivityAnalytics,
  getFitnessAnalytics,
  getGoalAnalytics
};
