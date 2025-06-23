require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// חיבור למונגו
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error:', err));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'travel-journal',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  },
});

const parser = multer({ storage });

// מודל משתמש
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// מודל רשומת יומן
const JournalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  imageUrl: { type: String }, // יכול להיות URL ישיר או URL של Cloudinary
}, { timestamps: true });

const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);

// Middleware לאימות JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user; // { userId, username }
    next();
  });
};

// רישום משתמש (Signup)
app.post('/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if(!username || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const existingUser = await User.findOne({ $or: [{username}, {email}] });
    if(existingUser) {
      return res.status(400).json({ message: 'Username or Email already in use' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, passwordHash });
    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// כניסה (Login)
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }
    const user = await User.findOne({ email });
    if(!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if(!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// קבלת כל רשומות היומן של המשתמש (מהחדש לישן)
app.get('/entries', authenticateToken, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// יצירת רשומה חדשה - אפשרות העלאת תמונה כקובץ או URL
app.post('/entries', authenticateToken, parser.single('image'), async (req, res) => {
  try {
    const { title, content, date, location, imageUrl } = req.body;
    if (!title || !content || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let finalImageUrl = imageUrl || null;

    // אם הגיעה תמונה כקובץ (multer+Cloudinary)
    if (req.file && req.file.path) {
      finalImageUrl = req.file.path;
    }

    const newEntry = new JournalEntry({
      userId: req.user.userId,
      title,
      content,
      date,
      location,
      imageUrl: finalImageUrl,
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// קבלת רשומה בודדת לפי ID
app.get('/entries/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// עדכון רשומה - אפשר לעדכן גם תמונה חדשה (קובץ או URL)
app.put('/entries/:id', authenticateToken, parser.single('image'), async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    const { title, content, date, location, imageUrl } = req.body;
    if (title) entry.title = title;
    if (content) entry.content = content;
    if (date) entry.date = date;
    if (location) entry.location = location;

    if (req.file && req.file.path) {
      entry.imageUrl = req.file.path;
    } else if (imageUrl) {
      entry.imageUrl = imageUrl;
    }

    await entry.save();
    res.json(entry);
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// מחיקת רשומה
app.delete('/entries/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
