const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { storage } = require('../config/cloudinary');
const multer = require('multer');
const upload = multer({ storage });
const {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry
} = require('../controllers/entryController');

router.get('/', auth, getEntries);
router.post('/', auth, upload.single('image'), createEntry);
router.put('/:id', auth, upload.single('image'), updateEntry);
router.delete('/:id', auth, deleteEntry);

module.exports = router;
