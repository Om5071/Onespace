const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  togglePinNote,
  deleteNote
} = require('../controllers/noteController');
const { protect } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validateRequest');

router.use(protect);

router.route('/')
  .get(getNotes)
  .post(validateBody(['title']), createNote);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

router.patch('/:id/pin', togglePinNote);

module.exports = router;
