const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getTaskAnalytics,
  getDailyActivityAnalytics,
  getFitnessAnalytics,
  getGoalAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getAnalytics);
router.get('/tasks', getTaskAnalytics);
router.get('/daily-activities', getDailyActivityAnalytics);
router.get('/fitness', getFitnessAnalytics);
router.get('/goals', getGoalAnalytics);

module.exports = router;
