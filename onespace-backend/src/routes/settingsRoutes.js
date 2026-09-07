const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  updateProfileSettings,
  updatePassword,
  updateNotificationPreferences,
  updateTheme,
  exportUserData,
  deleteAccount
} = require('../controllers/settingsController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSettings)
  .put(updateSettings);

router.put('/profile', updateProfileSettings);
router.put('/password', updatePassword);
router.put('/notifications', updateNotificationPreferences);
router.put('/theme', updateTheme);

router.get('/export', exportUserData);
router.delete('/account', deleteAccount);

module.exports = router;
