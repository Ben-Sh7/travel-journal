const multer = require('multer');
const { storage } = require('../config/cloudinary');

module.exports = multer({ storage });
