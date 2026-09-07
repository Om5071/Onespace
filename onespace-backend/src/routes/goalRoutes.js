const express = require('express');
const router = express.Router();
const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  completeGoal,
  logGoalProgress,
  deleteGoal
} = require('../controllers/goalController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .get(getGoalById)
  .put(updateGoal)
  .delete(deleteGoal);

router.patch('/:id/complete', completeGoal);
router.post('/:id/progress', logGoalProgress);

module.exports = router;
