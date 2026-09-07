const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  deleteNotification,
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
  testPushNotification
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', markNotificationRead);
router.patch('/:id/unread', markNotificationUnread);
router.delete('/:id', deleteNotification);

// Push Notification Subscription Endpoints
router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', subscribePush);
router.post('/unsubscribe', unsubscribePush);
router.post('/test-push', testPushNotification);

module.exports = router;
