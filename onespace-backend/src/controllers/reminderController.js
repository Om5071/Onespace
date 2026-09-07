const Reminder = require('../models/Reminder');

const getReminders = async (req, res, next) => {
  try {
    const { isTriggered, isCompleted } = req.query;
    const userId = req.user._id;
    const query = { $or: [{ user: userId }, { userId: userId }], isDismissed: false };

    if (isTriggered !== undefined) query.isTriggered = isTriggered === 'true';
    if (isCompleted !== undefined) query.isCompleted = isCompleted === 'true';

    const reminders = await Reminder.find(query).sort({ reminderDate: 1, remindAt: 1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    next(error);
  }
};

const createReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, reminderDate, reminderTime, remindAt, recurrence, relatedType, relatedId } = req.body;

    const dateVal = reminderDate || remindAt;

    const reminder = await Reminder.create({
      user: userId,
      userId,
      title,
      reminderDate: dateVal,
      reminderTime: reminderTime || '',
      remindAt: dateVal,
      recurrence: recurrence || 'none',
      relatedType: relatedType || 'custom',
      relatedId: relatedId || null
    });

    res.status(201).json({
      success: true,
      message: 'Reminder scheduled successfully',
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

const updateReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder updated',
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

const completeReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      { isCompleted: true, isTriggered: true, isDismissed: true },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder marked as completed',
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

const snoozeReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { minutes = 15 } = req.body;
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    const newTime = new Date();
    newTime.setMinutes(newTime.getMinutes() + parseInt(minutes, 10));

    reminder.remindAt = newTime;
    reminder.reminderDate = newTime;
    reminder.isTriggered = false;
    reminder.isCompleted = false;
    await reminder.save();

    res.status(200).json({
      success: true,
      message: `Reminder snoozed for ${minutes} minutes`,
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

const dismissReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      { isDismissed: true, isTriggered: true, isCompleted: true },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder dismissed',
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

const deleteReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    res.status(200).json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  completeReminder,
  snoozeReminder,
  dismissReminder,
  deleteReminder
};
