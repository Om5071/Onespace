const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const UserSettings = require('../models/UserSettings');
const { webpush } = require('../config/pushConfig');

const getUserNotificationSettings = async (userId) => {
  if (!userId) return {};
  const settings = await UserSettings.findOne({ $or: [{ user: userId }, { userId: userId }] });
  return settings || {};
};

const isNotificationTypeAllowed = (settings, type) => {
  const prefs = settings?.notificationPrefs || {};

  if (type === 'reminder' || type === 'task') return prefs.taskReminders !== false;
  if (type === 'event') return prefs.eventReminders !== false;
  if (type === 'goal' || type === 'fitness') return prefs.goalAlerts !== false;
  return true;
};

const isPushEnabledForUser = (settings) => {
  if (!settings) return true;
  return settings.notificationPrefs?.push !== false && settings.pushNotifications !== false;
};

const hasRecentDuplicate = async ({ userId, type, sourceType, sourceId, title, message }) => {
  if (!userId || !message) return false;

  const normalizedTitle = (title || message.slice(0, 50)).trim();
  const normalizedMessage = message.trim();
  const query = {
    userId,
    type,
    sourceType,
    title: normalizedTitle,
    message: normalizedMessage
  };

  if (sourceId) query.sourceId = sourceId;

  const existing = await Notification.findOne(query).sort({ createdAt: -1 });
  if (!existing || !existing.createdAt) return false;

  return Date.now() - existing.createdAt.getTime() < 60 * 60 * 1000;
};

const createNotification = async ({
  userId,
  title,
  message,
  type = 'system',
  sourceType = 'system',
  sourceId = null,
  linkUrl = ''
}) => {
  try {
    if (!userId) {
      return null;
    }

    const settings = await getUserNotificationSettings(userId);
    if (!isNotificationTypeAllowed(settings, type)) {
      return null;
    }

    if (await hasRecentDuplicate({
      userId,
      type,
      sourceType,
      sourceId,
      title,
      message
    })) {
      return null;
    }

    const notification = await Notification.create({
      userId,
      user: userId,
      title: title || (message || '').slice(0, 50),
      message,
      type,
      sourceType,
      sourceId,
      linkUrl
    });

    try {
      if (isPushEnabledForUser(settings)) {
        await sendPushToUser(userId, {
          title: notification.title,
          body: notification.message,
          message: notification.message,
          type: notification.type,
          url: notification.linkUrl || '/',
          tag: `onespace-${notification._id}`
        });
      }
    } catch (pushErr) {
      console.warn('[NotificationService] Push delivery warning:', pushErr.message);
    }

    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
    throw error;
  }
};

const sendPushToUser = async (userId, payload) => {
  try {
    const subscriptions = await PushSubscription.find({
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!subscriptions || subscriptions.length === 0) return;

    const payloadString = JSON.stringify({
      title: payload.title || 'OneSpace Alert',
      body: payload.body || payload.message || 'You have an update in OneSpace',
      message: payload.message || payload.body,
      url: payload.url || payload.linkUrl || '/',
      tag: payload.tag || `onespace-${Date.now()}`,
      data: {
        url: payload.url || payload.linkUrl || '/'
      }
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          },
          payloadString
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (error) {
    console.warn('[NotificationService] sendPushToUser error:', error.message);
  }
};

const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, $or: [{ userId }, { user: userId }] },
    { isRead: true },
    { new: true }
  );
};

const markAsUnread = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, $or: [{ userId }, { user: userId }] },
    { isRead: false },
    { new: true }
  );
};

const markAllAsRead = async (userId) => {
  return Notification.updateMany({ $or: [{ userId }, { user: userId }], isRead: false }, { isRead: true });
};

module.exports = {
  createNotification,
  sendPushToUser,
  markAsRead,
  markAsUnread,
  markAllAsRead
};
