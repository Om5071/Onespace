const UserSettings = require('../models/UserSettings');
const User = require('../models/User');
const Task = require('../models/Task');
const Note = require('../models/Note');
const Event = require('../models/Event');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const Document = require('../models/Document');
const DailyActivity = require('../models/DailyActivity');
const FitnessRecord = require('../models/FitnessRecord');
const Goal = require('../models/Goal');
const GoalProgress = require('../models/GoalProgress');
const { hashPassword, comparePassword } = require('../utils/hashPassword');

const getSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let settings = await UserSettings.findOne({ $or: [{ user: userId }, { userId: userId }] });
    if (!settings) {
      settings = await UserSettings.create({ user: userId, userId: userId });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let settings = await UserSettings.findOneAndUpdate(
      { $or: [{ user: userId }, { userId: userId }] },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Settings updated', data: settings });
  } catch (error) {
    next(error);
  }
};

const updateProfileSettings = async (req, res, next) => {
  try {
    const { name, bio, avatarUrl } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.status(200).json({ success: true, message: 'Profile updated', data: { user } });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await comparePassword(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

const updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const settings = await UserSettings.findOneAndUpdate(
      { $or: [{ user: userId }, { userId: userId }] },
      { notificationPrefs: req.body, emailNotifications: req.body.email, pushNotifications: req.body.push, inAppSound: req.body.sound },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: 'Notification preferences saved', data: settings });
  } catch (error) {
    next(error);
  }
};

const updateTheme = async (req, res, next) => {
  try {
    const { theme } = req.body;
    const userId = req.user._id;
    const settings = await UserSettings.findOneAndUpdate(
      { $or: [{ user: userId }, { userId: userId }] },
      { theme },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: 'Theme preference saved', data: settings });
  } catch (error) {
    next(error);
  }
};

const exportUserData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const query = { $or: [{ user: userId }, { userId: userId }] };

    const [
      user,
      settings,
      tasks,
      notes,
      events,
      reminders,
      documents,
      dailyActivities,
      fitnessRecords,
      goals,
      goalProgress
    ] = await Promise.all([
      User.findById(userId),
      UserSettings.findOne(query),
      Task.find(query),
      Note.find(query),
      Event.find(query),
      Reminder.find(query),
      Document.find(query),
      DailyActivity.find(query),
      FitnessRecord.find(query),
      Goal.find(query),
      GoalProgress.find(query)
    ]);

    const exportBundle = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      user,
      settings,
      tasks,
      notes,
      events,
      reminders,
      documents,
      dailyActivities,
      fitnessRecords,
      goals,
      goalProgress
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=onespace-export-${userId}-${Date.now()}.json`);
    res.status(200).send(JSON.stringify(exportBundle, null, 2));
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const query = { $or: [{ user: userId }, { userId: userId }] };

    await Promise.all([
      User.findByIdAndDelete(userId),
      UserSettings.deleteMany(query),
      Task.deleteMany(query),
      Note.deleteMany(query),
      Event.deleteMany(query),
      Reminder.deleteMany(query),
      Notification.deleteMany(query),
      Document.deleteMany(query),
      DailyActivity.deleteMany(query),
      FitnessRecord.deleteMany(query),
      Goal.deleteMany(query),
      GoalProgress.deleteMany(query)
    ]);

    res.status(200).json({ success: true, message: 'Account and all associated data deleted permanently.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateProfileSettings,
  updatePassword,
  updateNotificationPreferences,
  updateTheme,
  exportUserData,
  deleteAccount
};
