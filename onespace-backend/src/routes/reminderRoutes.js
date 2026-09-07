const express = require('express');
const router = express.Router();
const {
  getReminders,
  createReminder,
  updateReminder,
  completeReminder,
  snoozeReminder,
  dismissReminder,
  deleteReminder
} = require('../controllers/reminderController');
const { protect } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validateRequest');

router.use(protect);

router.route('/')
  .get(getReminders)
  .post(validateBody(['title']), createReminder);

router.route('/:id')
  .put(updateReminder)
  .delete(deleteReminder);

router.patch('/:id/complete', completeReminder);
router.patch('/:id/snooze', snoozeReminder);
router.patch('/:id/dismiss', dismissReminder);

module.exports = router;
