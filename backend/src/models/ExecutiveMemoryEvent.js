const mongoose = require('mongoose');

const executiveMemoryEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'cash_pressure',
        'cash_recovery',
        'sales_growth',
        'sales_drop',
        'ticket_growth',
        'ticket_drop',
        'record_revenue',
        'expense_pressure',
        'operational_alert',
        'data_reliability',
      ],
    },

    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    periodLabel: {
      type: String,
      required: true,
    },

    month: Number,
    year: Number,

    title: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
      required: true,
    },

    metric: String,

    currentValue: Number,
    previousValue: Number,
    variation: Number,

    source: {
      type: String,
      enum: ['Entry', 'ManagementReport', 'System'],
      default: 'System',
    },

    fingerprint: {
      type: String,
      required: true,
      unique: true,
    },

    usedInAnswers: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'ExecutiveMemoryEvent',
  executiveMemoryEventSchema
);
