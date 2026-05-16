const mongoose = require('mongoose');

const monthlyClosingSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  // DRE Values
  receitaBruta: { type: Number, default: 0 },
  deducoes: { type: Number, default: 0 },
  receitaLiquida: { type: Number, default: 0 },
  cmv: { type: Number, default: 0 },
  lucroBruto: { type: Number, default: 0 },
  despesasOperacionais: { type: Number, default: 0 },
  resultadoOperacional: { type: Number, default: 0 },
  despesasFinanceiras: { type: Number, default: 0 },
  outrasReceitas: { type: Number, default: 0 },
  outrasDespesas: { type: Number, default: 0 },
  lucroLiquido: { type: Number, default: 0 },
  
  // Metadata
  closed: { type: Boolean, default: false },
  closedAt: { type: Date, default: null },
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Version history
  versions: [{
    calculatedAt: { type: Date, default: Date.now },
    values: {
      receitaBruta: Number,
      receitaLiquida: Number,
      lucroBruto: Number,
      lucroLiquido: Number,
    },
  }],
}, {
  timestamps: true  // ⭐ Mongoose gerencia createdAt e updatedAt automaticamente
});

// Compound index for unique month/year
monthlyClosingSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyClosing', monthlyClosingSchema);
