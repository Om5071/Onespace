const express = require('express');
const router = express.Router();
const {
  getFitnessRecords,
  getWeightHistory,
  createFitnessRecord,
  updateFitnessRecord,
  deleteFitnessRecord
} = require('../controllers/fitnessController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getFitnessRecords)
  .post(createFitnessRecord);

router.get('/weight-history', getWeightHistory);

router.route('/:id')
  .put(updateFitnessRecord)
  .delete(deleteFitnessRecord);

module.exports = router;
