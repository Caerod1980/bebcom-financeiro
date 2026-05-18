const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Tipo é obrigatório'],
  },

  date: {
    type: Date,
    required: [true, 'Data é obrigatória'],
  },

  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
  },

  amount: {
    type: Number,
    required: [true, 'Valor é obrigatório'],
    min: 0.01,
  },

  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
  },

  // Usado em receitas
  channel: {
    type: String,
    enum: [
      'loja_fisica',
      'bebcom_delivery',
      'ifood',
      'whatsapp',
      'bebcom_lounge',
      'eventos',
      'outros',
      '',
    ],
    default: '',
  },

  // Usado em despesas
  costCenter: {
    type: String,
    enum: [
      'operacao_loja',
      'delivery',
      'ifood',
      'lounge',
      'marketing',
      'administrativo',
      'estrutura',
      'impostos',
      'financeiro',
      'estoque',
      'outros',
      '',
    ],
    default: '',
  },

  paymentMethod: {
    type: String,
    enum: [
      'dinheiro',
      'pix',
      'debito',
      'credito',
      'mercado_pago',
      'ifood_repasse',
      'transferencia',
      'outros',
      '',
    ],
    default: '',
  },

  dreGroup: {
    type: String,
    enum: [
      'receita_bruta',
      'deducoes',
      'cmv',
      'despesas_operacionais',
      'despesas_financeiras',
      'outras_receitas',
      'outras_despesas',
    ],
    required: true,
  },

  notes: {
    type: String,
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

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Validação operacional
entrySchema.pre('validate', function (next) {
  if (this.type === 'income') {
    if (!this.channel) {
      this.invalidate('channel', 'Canal de venda é obrigatório para receitas');
    }

    this.costCenter = '';
  }

  if (this.type === 'expense') {
    if (!this.costCenter) {
      this.invalidate('costCenter', 'Centro de custo é obrigatório para despesas');
    }

    this.channel = '';
  }

  next();
});

// Indexes for faster queries
entrySchema.index({ date: -1, type: 1, dreGroup: 1 });
entrySchema.index({ date: 1, category: 1, channel: 1 });
entrySchema.index({ date: 1, category: 1, costCenter: 1 });
entrySchema.index({ deleted: 1 });

module.exports = mongoose.model('Entry', entrySchema);
