const Event = require('../models/Event');
const Reminder = require('../models/Reminder');
const Task = require('../models/Task');

const getEvents = async (req, res, next) => {
  try {
    const { from, to, start, end, view, category } = req.query;
    const userId = req.user._id;
    const query = {
      $and: [
        { $or: [{ user: userId }, { userId: userId }] }
      ]
    };

    const startDate = from || start;
    const endDate = to || end;

    if (startDate && endDate) {
      query.$and.push({
        $or: [
          { startDateTime: { $gte: new Date(startDate), $lte: new Date(endDate) } },
          { startTime: { $gte: new Date(startDate), $lte: new Date(endDate) } }
        ]
      });
    }
    if (category) {
      query.category = category;
    }

    const events = await Event.find(query).sort({ startDateTime: 1, startTime: 1 });

    // Also fetch tasks with due dates in this range
    let tasksWithDueDates = [];
    if (startDate && endDate) {
      tasksWithDueDates = await Task.find({
        $or: [{ user: userId }, { userId: userId }],
        dueDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        events,
        tasksWithDueDates
      }
    });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      title,
      description,
      startDateTime,
      endDateTime,
      startTime,
      endTime,
      allDay,
      location,
      category,
      color,
      reminderMinutesBefore,
      createReminderAlert = true
    } = req.body;

    const finalStart = startDateTime || startTime;
    const finalEnd = endDateTime || endTime;

    const event = await Event.create({
      user: userId,
      userId,
      title,
      description: description || '',
      startDateTime: finalStart,
      endDateTime: finalEnd,
      startTime: finalStart,
      endTime: finalEnd,
      allDay: allDay || false,
      location: location || '',
      category: category || 'General',
      color: color || '#4f46e5',
      reminderMinutesBefore: reminderMinutesBefore || 15
    });

    // Auto-create associated reminder if event has a reminder setting
    if (createReminderAlert && finalStart) {
      const remindTime = new Date(new Date(finalStart).getTime() - (reminderMinutesBefore || 15) * 60000);
      const reminder = await Reminder.create({
        user: userId,
        userId,
        title: `Event: ${title}`,
        relatedType: 'event',
        relatedId: event._id,
        reminderDate: remindTime,
        remindAt: remindTime
      });
      event.reminders.push(reminder._id);
      await event.save();
    }

    res.status(201).json({
      success: true,
      message: 'Event scheduled successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: userId }, { userId: userId }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Clean up associated reminders
    await Reminder.deleteMany({ relatedId: event._id });

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
};
