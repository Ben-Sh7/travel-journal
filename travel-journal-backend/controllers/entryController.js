const Entry = require('../models/Entry');

exports.getEntries = async (req, res) => {
  const { tripId } = req.query;
  const filter = { userId: req.user.userId };
  if (tripId) filter.tripId = tripId;
  const entries = await Entry.find(filter).sort({ date: -1 });
  res.json(entries);
};

exports.createEntry = async (req, res) => {
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
};

exports.updateEntry = async (req, res) => {
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
};

exports.deleteEntry = async (req, res) => {
  await Entry.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.sendStatus(204);
};
