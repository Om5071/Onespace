const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const { VAPID_PUBLIC_KEY } = require('../config/pushConfig');
const { markAsRead, markAsUnread, markAllAsRead, sendPushToUser, createNotification } = require('../services/notificationService');

const getNotifications = async (req, res, next) => {
  try {
    const { isRead, limit = 50 } = req.query;
    const userId = req.user._id;
    const query = { $or: [{ user: userId }, { userId: userId }] };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).limit(parseInt(limit, 10)),
      Notification.countDocuments({ $or: [{ user: userId }, { userId: userId }], isRead: false })
    ]);

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await markAsRead(req.params.id, req.user._id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

const markNotificationUnread = async (req, res, next) => {
  try {
    const notification = await markAsUnread(req.params.id, req.user._id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await markAllAsRead(req.user._id);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

// Web Push API Handlers
const getVapidPublicKey = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      publicKey: VAPID_PUBLIC_KEY
    }
  });
};

const subscribePush = async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body;
    const userId = req.user._id;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription object. Endpoint and keys are required.'
      });
    }

    const subscription = await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        user: userId,
        userId: userId,
        endpoint,
        keys,
        userAgent: req.headers['user-agent'] || ''
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Push subscription registered successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

const unsubscribePush = async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user._id;

    if (endpoint) {
      await PushSubscription.deleteOne({
        endpoint,
        $or: [{ user: userId }, { userId: userId }]
      });
    } else {
      await PushSubscription.deleteMany({
        $or: [{ user: userId }, { userId: userId }]
      });
    }

    res.status(200).json({
      success: true,
      message: 'Unsubscribed from push notifications'
    });
  } catch (error) {
    next(error);
  }
};

const testPushNotification = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const notification = await createNotification({
      userId,
      title: '🔔 OneSpace Desktop Alert',
      message: 'Real-time push notifications are active and working on your device!',
      type: 'system',
      linkUrl: '/notifications'
    });

    res.status(200).json({
      success: true,
      message: 'Test notification created and push alert dispatched!',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  deleteNotification,
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
  testPushNotification
};
