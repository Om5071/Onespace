const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validateRequest');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(validateBody(['title']), createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/status', updateTaskStatus);

module.exports = router;
