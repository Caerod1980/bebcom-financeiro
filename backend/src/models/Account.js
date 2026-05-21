const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['payable', 'receivable'],
    required: true,
  },

  status: {
    type: String,
    enum: [
      'pending',
      'paid',
      'received',
      'cancelled',
      'overdue',
    ],
    default: 'pending',
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  person: {
    type: String,
    default: '',
    trim: true,
  },

  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },

  dueDate: {
    type: Date,
    required: true,
  },

  paymentDate: {
    type: Date,
    default: null,
  },

  category: {
    type: String,
    default: '',
  },

  channel: {
    type: String,
    default: '',
  },

  costCenter: {
    type: String,
    default: '',
  },

  paymentMethod: {
    type: String,
    default: '',
  },

  notes: {
    type: String,
    default: '',
    trim: true,
  },

  deleted: {
    type: Boolean,
    default: false,
  },

  deletedAt: {
    type: Date,
    default: null,
  },

  generatedEntry: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Entry',
  default: null,
},

entryGenerated: {
  type: Boolean,
  default: false,
},

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

accountSchema.index({ type: 1, status: 1 });
accountSchema.index({ dueDate: 1 });
accountSchema.index({ deleted: 1 });

module.exports = mongoose.model('Account', accountSchema);
