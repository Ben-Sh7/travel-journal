require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Cloudinary + Multer
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// App & Middleware
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error', err));

// Models
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}));

const Entry = mongoose.model('Entry', new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true },
  content:  { type: String, required: true },
  date:     { type: Date, required: true },
  location: String,
  imageUrl: String
}, { timestamps: true }));

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'travel-journal',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

const upload = multer({ storage });

// JWT Middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ msg: 'Invalid token' });
  }
}

// Routes
app.post('/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) return res.status(400).json({ msg: 'Username or Email already exists' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash: hash });
  res.status(201).json({ msg: 'User created' });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(400).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, username: user.username });
});

app.get('/entries', auth, async (req, res) => {
  const entries = await Entry.find({ userId: req.user.userId }).sort({ date: -1 });
  res.json(entries);
});

app.post('/entries', auth, upload.single('image'), async (req, res) => {
  const { title, content, date, location, imageUrl } = req.body;
  if (!title || !content || !date) return res.status(400).json({ msg: 'Missing required fields' });

  const finalImageUrl = req.file?.path || imageUrl || '';

  const entry = await Entry.create({
    userId: req.user.userId,
    title,
    content,
    date,
    location,
    imageUrl: finalImageUrl
  });

  res.status(201).json(entry);
});

app.delete('/entries/:id', auth, async (req, res) => {
  await Entry.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.sendStatus(204);
});

app.listen(process.env.PORT || 5000, () => console.log('Server ready'));
