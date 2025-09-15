const Trip = require('../models/Trip');

exports.getTrips = async (req, res) => {
  const trips = await Trip.find({ userId: req.user.userId }).sort({ date: -1 });
  res.json(trips);
};

exports.createTrip = async (req, res) => {
  const { name, date, imageUrl } = req.body;
  if (!name || !date) return res.status(400).json({ msg: 'Missing required fields' });
  const trip = await Trip.create({
    name,
    date,
    imageUrl,
    userId: req.user.userId
  });
  res.status(201).json(trip);
};

exports.updateTrip = async (req, res) => {
  const { name, date, imageUrl } = req.body;
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { name, date, imageUrl },
    { new: true }
  );
  if (!trip) return res.status(404).json({ msg: 'Trip not found' });
  res.json(trip);
};

exports.deleteTrip = async (req, res) => {
  await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.sendStatus(204);
};
