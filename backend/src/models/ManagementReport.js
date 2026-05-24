const mongoose = require('mongoose');

const managementReportSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },

  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },

  netRevenue: {
    type: Number,
    default: 0,
  },

  totalTickets: {
    type: Number,
    default: 0,
  },

  averageTicket: {
    type: Number,
    default: 0,
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

managementReportSchema.index(
  { year: 1, month: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'ManagementReport',
  managementReportSchema
);
