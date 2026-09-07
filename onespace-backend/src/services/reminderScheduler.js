const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const DailyActivity = require('../models/DailyActivity');
const FitnessRecord = require('../models/FitnessRecord');
const { createNotification } = require('./notificationService');

const getLinkForSource = (sourceType) => {
  if (sourceType === 'event') return '/calendar';
  if (sourceType === 'task') return '/tasks';
  if (sourceType === 'goal') return '/goals';
  if (sourceType === 'fitness') return '/daily-activity';
  if (sourceType === 'custom') return '/reminders';
  return '/';
};

const initReminderScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      const dueReminders = await Reminder.find({
        $or: [{ remindAt: { $lte: now } }, { reminderDate: { $lte: now } }],
        isTriggered: false,
        isDismissed: false,
        isCompleted: false
      });

      for (const reminder of dueReminders) {
        const userId = reminder.userId || reminder.user;
        if (!userId) continue;

        const sourceType = reminder.relatedType || 'custom';
        await createNotification({
          userId,
          title: `⏰ ${sourceType === 'event' ? 'Event' : 'Reminder'}: ${reminder.title}`,
          message: `Your ${sourceType} reminder "${reminder.title}" is due now.`,
          type: sourceType === 'event' ? 'event' : 'reminder',
          sourceType,
          sourceId: reminder.relatedId || reminder._id,
          linkUrl: getLinkForSource(sourceType)
        });

        if (reminder.recurrence && reminder.recurrence !== 'none') {
          const nextDate = new Date(reminder.remindAt || reminder.reminderDate);
          if (reminder.recurrence === 'daily') {
            nextDate.setDate(nextDate.getDate() + 1);
          } else if (reminder.recurrence === 'weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
          } else if (reminder.recurrence === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
          }

          reminder.remindAt = nextDate;
          reminder.reminderDate = nextDate;
          reminder.isTriggered = false;
          reminder.isCompleted = false;
          reminder.isDismissed = false;
          await reminder.save();
        } else {
          reminder.isTriggered = true;
          reminder.isCompleted = true;
          reminder.isDismissed = false;
          await reminder.save();
        }
      }

      const tasks = await Task.find({
        status: { $in: ['pending', 'in_progress'] },
        dueDate: { $ne: null }
      });

      for (const task of tasks) {
        const userId = task.userId || task.user;
        if (!userId) continue;

        const dueTime = task.dueDate ? new Date(task.dueDate).getTime() : null;
        const isDueNow = dueTime !== null && dueTime <= now.getTime();
        const dueSoon = dueTime !== null && dueTime <= now.getTime() + 60 * 60 * 1000 && dueTime >= now.getTime() - 60 * 1000;

        if (isDueNow && task.status !== 'overdue') {
          task.status = 'overdue';
          await task.save();
          await createNotification({
            userId,
            title: `⚠️ Overdue Task: ${task.title}`,
            message: `Task "${task.title}" has passed its scheduled deadline.`,
            type: 'task',
            sourceType: 'task',
            sourceId: task._id,
            linkUrl: '/tasks'
          });
        } else if (dueSoon) {
          await createNotification({
            userId,
            title: `⏰ Task Due Soon: ${task.title}`,
            message: `Task "${task.title}" is due within the next hour.`,
            type: 'task',
            sourceType: 'task',
            sourceId: task._id,
            linkUrl: '/tasks'
          });
        }
      }

      const activeGoals = await Goal.find({
        status: 'active',
        targetDate: { $lte: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) }
      });

      for (const goal of activeGoals) {
        const userId = goal.userId || goal.user;
        if (!userId) continue;

        const targetMs = new Date(goal.targetDate).getTime();
        const dueSoon = targetMs <= now.getTime() + 24 * 60 * 60 * 1000 && targetMs >= now.getTime() - 2 * 60 * 60 * 1000;
        const missed = targetMs <= now.getTime() && goal.status !== 'completed';

        if (missed) {
          await createNotification({
            userId,
            title: `🎯 Goal Deadline: ${goal.title}`,
            message: `Your goal "${goal.title}" has reached its deadline. Review progress and plan the next step.`,
            type: 'goal',
            sourceType: 'goal',
            sourceId: goal._id,
            linkUrl: '/goals'
          });
        } else if (dueSoon) {
          await createNotification({
            userId,
            title: `📌 Goal Due Soon: ${goal.title}`,
            message: `Your goal "${goal.title}" is due soon. Keep momentum going.`,
            type: 'goal',
            sourceType: 'goal',
            sourceId: goal._id,
            linkUrl: '/goals'
          });
        }
      }

      const todayIso = now.toISOString().split('T')[0];
      const dailyActivities = await DailyActivity.find({ date: todayIso });
      const completedDailyUsers = new Set(
        dailyActivities
          .filter((activity) => (activity.status === 'done' || (activity.habits || []).some((habit) => habit.isCompleted || habit.status === 'done')))
          .map((activity) => String(activity.userId || activity.user))
      );

      const fitnessRecords = await FitnessRecord.find({ date: todayIso });
      const loggedFitnessUsers = new Set(
        fitnessRecords.map((record) => String(record.userId || record.user))
      );

      const usersWithDailyCheck = [...new Set([...completedDailyUsers, ...loggedFitnessUsers])];
      const allDailyTrackerUsers = [...new Set([...dailyActivities.map((activity) => String(activity.userId || activity.user)), ...fitnessRecords.map((record) => String(record.userId || record.user))])];

      for (const userId of allDailyTrackerUsers) {
        if (completedDailyUsers.has(userId) || loggedFitnessUsers.has(userId)) continue;
        await createNotification({
          userId,
          title: '📋 Daily Tracker Reminder',
          message: 'You have not completed today\'s daily tracker yet. Check in to keep your momentum going.',
          type: 'fitness',
          sourceType: 'fitness',
          sourceId: null,
          linkUrl: '/daily-activity'
        });
      }

      const fitnessCheckUsers = await FitnessRecord.distinct('userId', { date: todayIso });
      for (const userId of fitnessCheckUsers) {
        if (!userId) continue;
        const todayRecords = await FitnessRecord.find({ userId, date: todayIso });
        if (!todayRecords.length) {
          await createNotification({
            userId,
            title: '🏃 Fitness Reminder',
            message: 'Your workout check-in is still pending for today. Log a fitness activity to stay on track.',
            type: 'fitness',
            sourceType: 'fitness',
            sourceId: null,
            linkUrl: '/fitness'
          });
        }
      }
    } catch (error) {
      console.error('[ReminderScheduler] Cron error:', error.message);
    }
  });

  console.log('[ReminderScheduler] Background cron scheduler active.');
};

module.exports = { initReminderScheduler };
