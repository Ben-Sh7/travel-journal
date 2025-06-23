require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ----- Cloudinary + Multer -----
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ───────────── App & DB ─────────────
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(e => console.error('Mongo error', e));

// ───────────── Models ─────────────
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
}));

const Entry = mongoose.model('Entry', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  location: String,
  imageUrl: String,
}, { timestamps: true }));

// ───────────── Cloudinary ─────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'travel-journal', allowed_formats: ['jpg', 'jpeg', 'png', 'gif'] }
});
const upload = multer({ storage });

// ───────────── JWT helper ─────────────
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);

  if (!authHeader) {
    console.log('No Authorization header');
    return res.status(401).json({ msg: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('Token not found after Bearer');
    return res.status(401).json({ msg: 'Malformed token' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified:', req.user);
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(403).json({ msg: 'Invalid or expired token' });
  }
}

// ───────────── Auth routes ─────────────
app.post('/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

  if (await User.findOne({ $or: [{ username }, { email }] }))
    return res.status(400).json({ msg: 'Username or Email already in use' });

  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, email, passwordHash: hash });
  res.status(201).json({ msg: 'User created' });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ msg: 'Bad credentials' });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ msg: 'Bad credentials' });

  const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, username: user.username });
});

// ───────────── Entries CRUD ─────────────
app.post('/entries', auth, upload.single('image'), async (req, res) => {
  const { title, content, date, location, imageUrl } = req.body;
  if (!title || !content || !date) return res.status(400).json({ msg: 'Missing fields' });

  const finalUrl = req.file?.path || imageUrl || '';

  try {
    const entry = await Entry.create({
      userId: req.user.userId,
      title,
      content,
      date,
      location,
      imageUrl: finalUrl
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error('Failed to create entry:', err);
    res.status(500).json({ msg: 'Server error creating entry' });
  }
});

app.get('/entries', auth, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Failed to fetch entries:', err);
    res.status(500).json({ msg: 'Server error fetching entries' });
  }
});

app.delete('/entries/:id', auth, async (req, res) => {
  try {
    await Entry.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.sendStatus(204);
  } catch (err) {
    console.error('Failed to delete entry:', err);
    res.status(500).json({ msg: 'Server error deleting entry' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server ready on port ${port}`));
