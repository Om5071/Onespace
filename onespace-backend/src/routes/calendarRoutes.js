const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/calendarController');
const { protect } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validateRequest');

router.use(protect);

router.route('/')
  .get(getEvents)
  .post(validateBody(['title', 'startTime', 'endTime']), createEvent);

router.route('/:id')
  .put(updateEvent)
  .delete(deleteEvent);

module.exports = router;
