const Entry = require('../models/Entry');
const dreService = require('../services/dreService');

const normalizeEntryPayload = (data) => {
  const payload = { ...data };

  if (payload.type === 'income') {
    payload.costCenter = '';
  }

  if (payload.type === 'expense') {
    payload.channel = '';
  }

  return payload;
};

// @desc    Create entry
// @route   POST /api/entries
const createEntry = async (req, res) => {
  try {
    const monthClosed = await dreService.isMonthClosed(req.body.date);

    if (monthClosed) {
      return res.status(400).json({
        error: 'Este mês está fechado e não aceita novos lançamentos.',
      });
    }

    const payload = normalizeEntryPayload(req.body);

    const entry = await Entry.create({
      ...payload,
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
    const {
  description,
  startDate,
  endDate,
  type,
  category,
  channel,
  costCenter,
  paymentMethod,
} = req.query;

    const query = { deleted: false };

    if (startDate || endDate) {
      query.date = {};

      if (startDate) {
        query.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (type) query.type = type;
    if (category) query.category = category;
    if (channel) query.channel = channel;
    if (costCenter) query.costCenter = costCenter;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (description) {
  query.description = {
    $regex: description,
    $options: 'i',
  };
}

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

    const originalMonthClosed = await dreService.isMonthClosed(entry.date);

    if (originalMonthClosed) {
      return res.status(400).json({
        error: 'Este mês está fechado e não pode ser alterado.',
      });
    }

    if (req.body.date) {
      const newMonthClosed = await dreService.isMonthClosed(req.body.date);

      if (newMonthClosed) {
        return res.status(400).json({
          error: 'Não é possível mover lançamento para um mês fechado.',
        });
      }
    }

    const { createdBy, deleted, deletedAt, _id, ...rawSafeData } = req.body;
    const safeData = normalizeEntryPayload(rawSafeData);

    const updated = await Entry.findByIdAndUpdate(
      req.params.id,
      safeData,
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

    const monthClosed = await dreService.isMonthClosed(entry.date);

    if (monthClosed) {
      return res.status(400).json({
        error: 'Este mês está fechado e não pode ser removido.',
      });
    }

    entry.deleted = true;
    entry.deletedAt = Date.now();

    await entry.save();

    res.json({ message: 'Lançamento removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
};
