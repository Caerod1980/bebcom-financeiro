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

  // Saldo inicial do mês
  openingBalance: {
    type: Number,
    default: 0,
  },

  // Valores principais da DRE
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

  // Snapshot completo congelado
  snapshotDRE: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // Indicadores congelados
  indicators: {
    margemBruta: { type: String, default: '0.00' },
    margemOperacional: { type: String, default: '0.00' },
    margemLiquida: { type: String, default: '0.00' },
    cmvPercent: { type: String, default: '0.00' },
    despesasPercent: { type: String, default: '0.00' },
  },

  // Categorias e despesas top congeladas
  categoriesSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  topExpensesSnapshot: {
    type: Array,
    default: [],
  },

  // Fechamento
  closed: { type: Boolean, default: false },
  closedAt: { type: Date, default: null },
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Auditoria
  auditHash: {
    type: String,
    default: null,
  },
  auditPayload: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },

  // Saldo automático do próximo mês
  nextMonthOpeningBalance: {
    type: Number,
    default: 0,
  },

  // Histórico técnico
  versions: [{
    calculatedAt: { type: Date, default: Date.now },
    auditHash: String,
    values: {
      receitaBruta: Number,
      receitaLiquida: Number,
      lucroBruto: Number,
      lucroLiquido: Number,
    },
  }],
}, {
  timestamps: true,
});

monthlyClosingSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyClosing', monthlyClosingSchema);
