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
  passwordHash: { type: String, required: true }
}));

const Entry = mongoose.model('Entry', new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true },
  content:  { type: String, required: true },
  date:     { type: Date, required: true },
  location: String,
  imageUrl: String,
  tripId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }
}, { timestamps: true }));

const Trip = mongoose.model('Trip', new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },
  date:     { type: Date, required: true },
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
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ msg: 'Missing fields' });

  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ msg: 'Username already exists' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash: hash });
  res.status(201).json({ msg: 'User created' });
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(400).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, username: user.username });
});

// --- TRIPS ROUTES ---
app.get('/trips', auth, async (req, res) => {
  const trips = await Trip.find({ userId: req.user.userId }).sort({ date: -1 });
  res.json(trips);
});

app.post('/trips', auth, async (req, res) => {
  const { name, date, imageUrl } = req.body;
  if (!name || !date) return res.status(400).json({ msg: 'Missing required fields' });
  const trip = await Trip.create({
    name,
    date,
    imageUrl,
    userId: req.user.userId
  });
  res.status(201).json(trip);
});

app.put('/trips/:id', auth, async (req, res) => {
  const { name, date, imageUrl } = req.body;
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { name, date, imageUrl },
    { new: true }
  );
  if (!trip) return res.status(404).json({ msg: 'Trip not found' });
  res.json(trip);
});

app.delete('/trips/:id', auth, async (req, res) => {
  await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.sendStatus(204);
});

// --- ENTRIES ROUTES ---
app.get('/entries', auth, async (req, res) => {
  const { tripId } = req.query;
  const filter = { userId: req.user.userId };
  if (tripId) filter.tripId = tripId;
  const entries = await Entry.find(filter).sort({ date: -1 });
  res.json(entries);
});

app.post('/entries', auth, upload.single('image'), async (req, res) => {
  const { title, content, date, location, imageUrl, tripId } = req.body;
  if (!title || !content || !date || !tripId) return res.status(400).json({ msg: 'Missing required fields' });
  const finalImageUrl = req.file?.path || imageUrl || '';
  const entry = await Entry.create({
    userId: req.user.userId,
    title,
    content,
    date,
    location,
    imageUrl: finalImageUrl,
    tripId
  });
  res.status(201).json(entry);
});

app.put('/entries/:id', auth, upload.single('image'), async (req, res) => {
  const { title, content, date, location, imageUrl, tripId } = req.body;
  if (!title || !content || !date || !tripId) return res.status(400).json({ msg: 'Missing required fields' });
  const finalImageUrl = req.file?.path || imageUrl || '';
  const entry = await Entry.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    {
      title,
      content,
      date,
      location,
      imageUrl: finalImageUrl,
      tripId
    },
    { new: true }
  );
  if (!entry) return res.status(404).json({ msg: 'Entry not found' });
  res.json(entry);
});

app.delete('/entries/:id', auth, async (req, res) => {
  await Entry.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.sendStatus(204);
});

app.listen(process.env.PORT || 5000, () => console.log('Server ready'));
