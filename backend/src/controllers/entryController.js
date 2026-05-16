const Entry = require('../models/Entry');

// @desc    Create entry
// @route   POST /api/entries
const createEntry = async (req, res) => {
  try {
    const entry = await Entry.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all entries with filters
// @route   GET /api/entries
const getEntries = async (req, res) => {
  try {
    const { startDate, endDate, type, category, channel, paymentMethod } = req.query;
    
    let query = { deleted: false };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type) query.type = type;
    if (category) query.category = category;
    if (channel) query.channel = channel;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    const entries = await Entry.find(query)
      .sort({ date: -1 })
      .populate('createdBy', 'name');
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single entry
// @route   GET /api/entries/:id
const getEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id).populate('createdBy', 'name');
    if (!entry || entry.deleted) {
      return res.status(404).json({ error: 'Lançamento não encontrado' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update entry
// @route   PUT /api/entries/:id
const updateEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry || entry.deleted) {
      return res.status(404).json({ error: 'Lançamento não encontrado' });
    }
    
    const updated = await Entry.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete entry (soft delete)
// @route   DELETE /api/entries/:id
const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry || entry.deleted) {
      return res.status(404).json({ error: 'Lançamento não encontrado' });
    }
    
    entry.deleted = true;
    entry.deletedAt = Date.now();
    await entry.save();
    
    res.json({ message: 'Lançamento removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createEntry, getEntries, getEntry, updateEntry, deleteEntry };
