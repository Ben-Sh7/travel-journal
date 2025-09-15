const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip
} = require('../controllers/tripController');

router.get('/', auth, getTrips);
router.post('/', auth, createTrip);
router.put('/:id', auth, updateTrip);
router.delete('/:id', auth, deleteTrip);

module.exports = router;
