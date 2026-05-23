const mongoose = require('mongoose');

const inventoryBalanceSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },

  month: {
    type: Number,
    required: true,
  },

  initialStock: {
    type: Number,
    default: 0,
  },

  purchases: {
    type: Number,
    default: 0,
  },

  cmv: {
    type: Number,
    default: 0,
  },

  finalStock: {
    type: Number,
    default: 0,
  },

  notes: {
    type: String,
    default: '',
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

inventoryBalanceSchema.index(
  { year: 1, month: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'InventoryBalance',
  inventoryBalanceSchema
);
