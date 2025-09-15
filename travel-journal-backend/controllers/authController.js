const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ msg: 'Missing fields' });

  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ msg: 'Username already exists' });

  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, passwordHash: hash });
  res.status(201).json({ msg: 'User created' });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(400).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, username: user.username });
};
