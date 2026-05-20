const mongoose = require('mongoose');

const balanceSheetSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },

  referenceDate: {
    type: String,
    required: true,
    default: '31/12',
  },

  assets: {
    cash: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    inventory: { type: Number, default: 0 },
    receivables: { type: Number, default: 0 },
    equipment: { type: Number, default: 0 },
    otherAssets: { type: Number, default: 0 },
  },

  liabilities: {
    loans: { type: Number, default: 0 },
    suppliers: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    fixedBills: { type: Number, default: 0 },
    otherLiabilities: { type: Number, default: 0 },
  },

  notes: {
    type: String,
    default: '',
    trim: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

balanceSheetSchema.index({ year: 1 }, { unique: true });

module.exports = mongoose.model('BalanceSheet', balanceSheetSchema);
