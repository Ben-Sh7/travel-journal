require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Entry = require('./models/Entry');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'travel-journal',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

// Middleware לבדיקה אם יש טוקן
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.sendStatus(401);
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.sendStatus(401);
  }
}

// יצירת רשומה
app.post('/entries', authenticate, upload.single('imageFile'), async (req, res) => {
  try {
    const { title, content, date, location, imageUrl } = req.body;
    let finalImageUrl = imageUrl;

    if (req.file && req.file.path) {
      finalImageUrl = req.file.path;
    }

    const entry = await Entry.create({
      title,
      content,
      date,
      location,
      imageUrl: finalImageUrl,
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// שליפה
app.get('/entries', authenticate, async (req, res) => {
  const entries = await Entry.find().sort({ date: -1 });
  res.json(entries);
});

// מחיקה
app.delete('/entries/:id', authenticate, async (req, res) => {
  await Entry.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port', PORT));
