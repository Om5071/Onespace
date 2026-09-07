const DailyActivity = require('../models/DailyActivity');

const getDailyActivities = async (req, res, next) => {
  try {
    const { date, range } = req.query;
    const userId = req.user._id;
    const query = { $or: [{ user: userId }, { userId: userId }] };

    if (date) {
      query.date = date;
    }

    const activities = await DailyActivity.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

const getDailyActivityByDate = async (req, res, next) => {
  try {
    const { date } = req.params; // Format: YYYY-MM-DD
    const userId = req.user._id;
    let activity = await DailyActivity.findOne({
      $or: [{ user: userId }, { userId: userId }],
      date
    });

    if (!activity) {
      activity = {
        date,
        mood: 'good',
        sleepHours: 7,
        waterIntakeMl: 2000,
        energyLevel: 3,
        habits: [
          { name: 'Morning Exercise / Stretching', isCompleted: false, status: 'not done' },
          { name: 'Drink 2L Water', isCompleted: false, status: 'not done' },
          { name: 'Read 20 mins', isCompleted: false, status: 'not done' },
          { name: 'Meditation / Mindfulness', isCompleted: false, status: 'not done' },
          { name: 'Plan Tomorrow Tasks', isCompleted: false, status: 'not done' }
        ],
        expenses: [],
        notes: '',
        journalEntry: ''
      };
    }

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

const createDailyActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, isRecurring, recurrencePattern, date, status, mood, sleepHours, waterIntakeMl, habits, expenses, notes, journalEntry } = req.body;

    const activity = await DailyActivity.create({
      user: userId,
      userId,
      name: name || 'Daily Activity',
      isRecurring: isRecurring || false,
      recurrencePattern: recurrencePattern || 'daily',
      date: date || new Date().toISOString().split('T')[0],
      status: status || 'not done',
      mood: mood || 'good',
      sleepHours: sleepHours || 7,
      waterIntakeMl: waterIntakeMl || 2000,
      habits: habits || [],
      expenses: expenses || [],
      notes: notes || journalEntry || '',
      journalEntry: journalEntry || notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Activity created',
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

const updateDailyActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const activity = await DailyActivity.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Activity updated',
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

const toggleDailyActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const activity = await DailyActivity.findOne({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    activity.status = activity.status === 'done' ? 'not done' : 'done';
    await activity.save();

    res.status(200).json({
      success: true,
      message: `Activity marked as ${activity.status}`,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

const deleteDailyActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const activity = await DailyActivity.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    res.status(200).json({ success: true, message: 'Activity deleted' });
  } catch (error) {
    next(error);
  }
};

const upsertDailyActivity = async (req, res, next) => {
  try {
    const { date } = req.params;
    const userId = req.user._id;
    const { mood, sleepHours, waterIntakeMl, habits, expenses, notes, journalEntry, energyLevel, name, status } = req.body;

    const finalNotes = notes !== undefined ? notes : (journalEntry !== undefined ? journalEntry : '');

    const activity = await DailyActivity.findOneAndUpdate(
      { $or: [{ user: userId }, { userId: userId }], date },
      {
        user: userId,
        userId,
        date,
        name: name || 'Daily Tracker',
        status: status || 'done',
        mood: mood !== undefined ? mood : 'good',
        sleepHours: sleepHours !== undefined ? sleepHours : 7,
        waterIntakeMl: waterIntakeMl !== undefined ? waterIntakeMl : 2000,
        habits: habits || [],
        expenses: expenses || [],
        notes: finalNotes,
        journalEntry: finalNotes,
        energyLevel: energyLevel !== undefined ? energyLevel : 3
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Daily activity logged successfully',
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

const getActivityHistory = async (req, res, next) => {
  try {
    const { range = 30 } = req.query;
    const userId = req.user._id;
    const daysInt = parseInt(range, 10);
    const startDate = new Date(Date.now() - daysInt * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const activities = await DailyActivity.find({
      $or: [{ user: userId }, { userId: userId }],
      date: { $gte: startDate }
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

const getActivityHeatmap = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const userId = req.user._id;
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const activities = await DailyActivity.find({
      $or: [{ user: userId }, { userId: userId }],
      date: { $gte: startDate, $lte: endDate }
    }).select('date mood habits sleepHours waterIntakeMl status');

    const heatmapData = activities.map((act) => {
      const completedHabits = (act.habits || []).filter((h) => h.isCompleted || h.status === 'done').length;
      return {
        date: act.date,
        count: completedHabits || (act.status === 'done' ? 1 : 0),
        mood: act.mood,
        sleepHours: act.sleepHours
      };
    });

    res.status(200).json({
      success: true,
      data: heatmapData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyActivities,
  getDailyActivityByDate,
  createDailyActivity,
  updateDailyActivity,
  toggleDailyActivity,
  deleteDailyActivity,
  upsertDailyActivity,
  getActivityHistory,
  getActivityHeatmap
};
