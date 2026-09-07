const FitnessRecord = require('../models/FitnessRecord');
const DailyActivity = require('../models/DailyActivity');

const getFitnessRecords = async (req, res, next) => {
  try {
    const { workoutType, range, startDate, endDate, limit = 50 } = req.query;
    const userId = req.user._id;
    const query = { $or: [{ user: userId }, { userId: userId }] };

    if (workoutType) query.workoutType = workoutType;

    const now = new Date();
    if (range === 'daily') {
      const todayStr = now.toISOString().split('T')[0];
      query.date = todayStr;
    } else if (range === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      query.date = { $gte: weekAgo };
    } else if (range === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      query.date = { $gte: monthAgo };
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await FitnessRecord.find(query).sort({ date: -1 }).limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

const getWeightHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const weightHistory = await FitnessRecord.find({
      $or: [{ user: userId }, { userId: userId }],
      $or: [
        { bodyWeightKg: { $ne: null, $gt: 0 } },
        { bodyWeight: { $ne: null, $gt: 0 } }
      ]
    })
      .sort({ date: 1 })
      .select('date bodyWeightKg bodyWeight');

    const formatted = weightHistory.map((w) => ({
      date: w.date,
      bodyWeightKg: w.bodyWeightKg || w.bodyWeight
    }));

    res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

const createFitnessRecord = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { date, type, workoutType, duration, durationMinutes, caloriesBurned, steps, bodyWeight, bodyWeightKg, exercises, notes } = req.body;

    const dateStr = date || new Date().toISOString().split('T')[0];
    const dur = durationMinutes || duration || 30;
    const wt = bodyWeightKg || bodyWeight || null;

    const record = await FitnessRecord.create({
      user: userId,
      userId,
      date: dateStr,
      type: type || 'workout',
      workoutType: workoutType || 'Strength',
      duration: dur,
      durationMinutes: dur,
      caloriesBurned: caloriesBurned || 0,
      steps: steps || 0,
      bodyWeight: wt,
      bodyWeightKg: wt,
      exercises: exercises || [],
      notes: notes || ''
    });

    // Sync into Daily Activity habit checklist
    try {
      let daily = await DailyActivity.findOne({ $or: [{ user: userId }, { userId: userId }], date: dateStr });
      if (daily) {
        const habitIdx = (daily.habits || []).findIndex((h) => h.name.toLowerCase().includes('exercise') || h.name.toLowerCase().includes('workout'));
        if (habitIdx !== -1) {
          daily.habits[habitIdx].isCompleted = true;
          daily.habits[habitIdx].status = 'done';
          await daily.save();
        }
      }
    } catch (syncErr) {
      console.warn('Sync to daily activity failed:', syncErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Fitness record created and synced',
      data: record
    });
  } catch (error) {
    next(error);
  }
};

const updateFitnessRecord = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const record = await FitnessRecord.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'Fitness record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Fitness record updated',
      data: record
    });
  } catch (error) {
    next(error);
  }
};

const deleteFitnessRecord = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const record = await FitnessRecord.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Fitness record not found' });
    }
    res.status(200).json({ success: true, message: 'Fitness record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFitnessRecords,
  getWeightHistory,
  createFitnessRecord,
  updateFitnessRecord,
  deleteFitnessRecord
};
