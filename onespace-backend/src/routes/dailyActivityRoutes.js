const express = require('express');
const router = express.Router();
const {
  getDailyActivities,
  getDailyActivityByDate,
  createDailyActivity,
  updateDailyActivity,
  toggleDailyActivity,
  deleteDailyActivity,
  upsertDailyActivity,
  getActivityHistory,
  getActivityHeatmap
} = require('../controllers/dailyActivityController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getDailyActivities)
  .post(createDailyActivity);

router.get('/history', getActivityHistory);
router.get('/heatmap', getActivityHeatmap);
router.get('/:date', getDailyActivityByDate);
router.put('/:date', upsertDailyActivity);

router.route('/item/:id')
  .put(updateDailyActivity)
  .delete(deleteDailyActivity);

router.patch('/:id/toggle', toggleDailyActivity);

module.exports = router;
