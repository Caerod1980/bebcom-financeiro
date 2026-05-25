const Account = require('../models/Account');
const Entry = require('../models/Entry');
const dreService = require('../services/dreService');

// Redeploy marker: cash-flow-projection-fix-2026-05-25

const toNumber = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
};

const normalizePayload = (data) => {
  const payload = { ...data };

  payload.amount = toNumber(payload.amount);

  if (payload.type === 'payable') {
    payload.channel = '';
  }

  if (payload.type === 'receivable') {
    payload.costCenter = '';
  }

  if (!payload.status) {
    payload.status = 'pending';
  }

  return payload;
};

const updateOverdueStatus = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await Account.updateMany(
    {
      deleted: false,
      status: 'pending',
      dueDate: { $lt: today },
    },
    {
      status: 'overdue',
    }
  );
};

// @desc    Create account payable/receivable
// @route   POST /api/accounts
const createAccount = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    if (!payload.type || !['payable', 'receivable'].includes(payload.type)) {
      return res.status(400).json({
        error: 'Tipo inválido. Use payable ou receivable.',
      });
    }

    if (!payload.description) {
      return res.status(400).json({
        error: 'Descrição é obrigatória.',
      });
    }

    if (!payload.amount || payload.amount <= 0) {
      return res.status(400).json({
        error: 'Valor deve ser maior que zero.',
      });
    }

    if (!payload.dueDate) {
      return res.status(400).json({
        error: 'Data de vencimento é obrigatória.',
      });
    }

    const account = await Account.create({
      ...payload,
      createdBy: req.user._id,
    });

    res.status(201).json(account);
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get accounts with filters
// @route   GET /api/accounts
const getAccounts = async (req, res) => {
  try {
    await updateOverdueStatus();

    const {
      type,
      status,
      description,
      person,
      startDate,
      endDate,
      category,
      channel,
      costCenter,
      paymentMethod,
    } = req.query;

    const query = { deleted: false };

    if (type) query.type = type;
    if (status) query.status = status;
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

    if (person) {
      query.person = {
        $regex: person,
        $options: 'i',
      };
    }

    if (startDate || endDate) {
      query.dueDate = {};

      if (startDate) {
        query.dueDate.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.dueDate.$lte = end;
      }
    }

    const accounts = await Account.find(query)
      .sort({ dueDate: 1, createdAt: -1 })
      .populate('createdBy', 'name');

    const summary = await buildSummary();

    res.json({
      accounts,
      summary,
    });
  } catch (error) {
    console.error('Erro ao listar contas:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get account by id
// @route   GET /api/accounts/:id
const getAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).populate(
      'createdBy',
      'name'
    );

    if (!account || account.deleted) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    res.json(account);
  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update account
// @route   PUT /api/accounts/:id
const updateAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account || account.deleted) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    const {
      createdBy,
      deleted,
      deletedAt,
      _id,
      ...safeData
    } = req.body;

    const payload = normalizePayload(safeData);

    const updated = await Account.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    res.status(500).json({ error: error.message });
  }
};

const getDreGroupByCategory = (category, type) => {
  const expenseMap = {
    compras_mercadorias: 'cmv',
    funcionarios: 'despesas_operacionais',
    motoboy: 'despesas_operacionais',
    aluguel: 'despesas_operacionais',
    energia: 'despesas_operacionais',
    agua: 'despesas_operacionais',
    internet: 'despesas_operacionais',
    sistema: 'despesas_operacionais',
    contador: 'despesas_operacionais',
    marketing: 'despesas_operacionais',
    taxas_cartao: 'despesas_financeiras',
    taxas_mercado_pago: 'despesas_financeiras',
    taxas_ifood: 'despesas_financeiras',
    emprestimos: 'despesas_financeiras',
    impostos: 'deducoes',
    manutencao: 'despesas_operacionais',
    embalagens: 'despesas_operacionais',
    outras_despesas: 'outras_despesas',
  };

  const incomeMap = {
    vendas_loja_fisica: 'receita_bruta',
    vendas_delivery: 'receita_bruta',
    vendas_ifood: 'receita_bruta',
    vendas_lounge: 'receita_bruta',
    eventos: 'receita_bruta',
    outras_receitas: 'outras_receitas',
  };

  if (type === 'expense') {
    return expenseMap[category] || 'outras_despesas';
  }

  return incomeMap[category] || 'receita_bruta';
};

// @desc    Mark account as paid/received and generate financial entry
// @route   PUT /api/accounts/:id/settle
const settleAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account || account.deleted) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    if (account.status === 'paid' || account.status === 'received') {
      return res.status(400).json({
        error: 'Esta conta já foi baixada.',
      });
    }

    if (account.entryGenerated || account.generatedEntry) {
      return res.status(400).json({
        error: 'Esta conta já gerou um lançamento financeiro.',
      });
    }

    const paymentDate = req.body.paymentDate
      ? new Date(req.body.paymentDate)
      : new Date();

    const monthClosed = await dreService.isMonthClosed(paymentDate);

    if (monthClosed) {
      return res.status(400).json({
        error:
          'O mês da baixa está fechado. Não é possível gerar lançamento financeiro.',
      });
    }

    const entryType = account.type === 'payable' ? 'expense' : 'income';

    const entryPayload = {
      type: entryType,
      date: paymentDate,
      description: account.description,
      amount: Math.abs(Number(account.amount || 0)),
      category:
        account.category ||
        (entryType === 'expense' ? 'outras_despesas' : 'outras_receitas'),
      channel: entryType === 'income' ? account.channel || 'outros' : '',
      costCenter: entryType === 'expense' ? account.costCenter || 'outros' : '',
      paymentMethod: account.paymentMethod || 'outros',
      dreGroup: getDreGroupByCategory(
        account.category,
        entryType
      ),
      notes: account.notes
        ? `Gerado automaticamente a partir de Conta: ${account.notes}`
        : 'Gerado automaticamente a partir de Contas a Pagar/Receber',
      createdBy: req.user._id,
    };

    const entry = await Entry.create(entryPayload);

    account.status = account.type === 'payable' ? 'paid' : 'received';
    account.paymentDate = paymentDate;
    account.generatedEntry = entry._id;
    account.entryGenerated = true;

    await account.save();

    res.json({
      message:
        account.type === 'payable'
          ? 'Conta marcada como paga e lançamento gerado com sucesso.'
          : 'Conta marcada como recebida e lançamento gerado com sucesso.',
      account,
      entry,
    });
  } catch (error) {
    console.error('Erro ao baixar conta:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Cancel account
// @route   PUT /api/accounts/:id/cancel
const cancelAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account || account.deleted) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    account.status = 'cancelled';
    await account.save();

    res.json({
      message: 'Conta cancelada com sucesso.',
      account,
    });
  } catch (error) {
    console.error('Erro ao cancelar conta:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Soft delete account
// @route   DELETE /api/accounts/:id
const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account || account.deleted) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    account.deleted = true;
    account.deletedAt = Date.now();

    await account.save();

    res.json({ message: 'Conta removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover conta:', error);
    res.status(500).json({ error: error.message });
  }
};

const buildSummary = async () => {
  const accounts = await Account.find({ deleted: false });

  const summary = {
    totalPayable: 0,
    totalReceivable: 0,
    overduePayable: 0,
    overdueReceivable: 0,
    pendingPayable: 0,
    pendingReceivable: 0,
    settledPayable: 0,
    settledReceivable: 0,
  };

  accounts.forEach((account) => {
    const amount = Math.abs(Number(account.amount || 0));

    if (account.type === 'payable') {
      if (account.status === 'pending' || account.status === 'overdue') {
        summary.totalPayable += amount;
      }

      if (account.status === 'overdue') {
        summary.overduePayable += amount;
      }

      if (account.status === 'pending') {
        summary.pendingPayable += amount;
      }

      if (account.status === 'paid') {
        summary.settledPayable += amount;
      }
    }

    if (account.type === 'receivable') {
      if (account.status === 'pending' || account.status === 'overdue') {
        summary.totalReceivable += amount;
      }

      if (account.status === 'overdue') {
        summary.overdueReceivable += amount;
      }

      if (account.status === 'pending') {
        summary.pendingReceivable += amount;
      }

      if (account.status === 'received') {
        summary.settledReceivable += amount;
      }
    }
  });

  summary.projectedBalance =
    summary.totalReceivable - summary.totalPayable;

  return summary;
};

const getMonthPeriod = (month, year) => {
  const selectedMonth = parseInt(month) || new Date().getMonth() + 1;
  const selectedYear = parseInt(year) || new Date().getFullYear();

  const start = new Date(selectedYear, selectedMonth - 1, 1);
  const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

  return { selectedMonth, selectedYear, start, end };
};

const buildCashFlowProjection = async (month, year) => {
  const { selectedMonth, selectedYear, start, end } = getMonthPeriod(month, year);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCurrentMonth =
    selectedMonth === today.getMonth() + 1 &&
    selectedYear === today.getFullYear();

  const referenceDay = isCurrentMonth
    ? today.getDate()
    : new Date(selectedYear, selectedMonth, 0).getDate();

  const incomeEntries = await Entry.find({
    deleted: { $ne: true },
    type: 'income',
    date: {
      $gte: start,
      $lte: end,
    },
  });

  let totalIncomeMonth = 0;

  incomeEntries.forEach((entry) => {
    totalIncomeMonth += Math.abs(Number(entry.amount || 0));
  });

  const averageDailyIncome =
    referenceDay > 0 ? totalIncomeMonth / referenceDay : 0;

  const periods = [
  {
    label: 'Hoje',
    startOffset: 0,
    endOffset: 0,
  },
  {
    label: '7 Dias',
    startOffset: 1,
    endOffset: 7,
  },
  {
    label: '15 Dias',
    startOffset: 8,
    endOffset: 15,
  },
  {
    label: '30 Dias',
    startOffset: 16,
    endOffset: 30,
  },
];

  const baseDate = isCurrentMonth ? today : start;

  const projection = [];

  for (const period of periods) {
    const startDate = new Date(baseDate);
startDate.setDate(startDate.getDate() + period.startOffset);
startDate.setHours(0, 0, 0, 0);

const endDate = new Date(baseDate);
endDate.setDate(endDate.getDate() + period.endOffset);
endDate.setHours(23, 59, 59, 999);

const limitedEndDate = endDate;

    const expenseEntries = await Entry.find({
      deleted: { $ne: true },
      type: 'expense',
      date: {
      $gte: startDate,
      $lte: limitedEndDate,
  },
    });

    let paidExpenses = 0;

    expenseEntries.forEach((entry) => {
      paidExpenses += Math.abs(Number(entry.amount || 0));
    });

  const accounts = await Account.find({
  deleted: { $ne: true },
  status: { $in: ['pending', 'overdue'] },
  dueDate: {
    $lte: limitedEndDate,
  },
});

    let receivableAccounts = 0;
    let pendingPayable = 0;

    accounts.forEach((account) => {
      const amount = Math.abs(Number(account.amount || 0));

      if (account.type === 'receivable') {
        receivableAccounts += amount;
      }

      if (account.type === 'payable') {
        pendingPayable += amount;
      }
    });

   const intervalDays =
  period.endOffset - period.startOffset + 1;

const projectedOperationalIncome =
  averageDailyIncome * intervalDays;
const receivable =
  projectedOperationalIncome + receivableAccounts;

// Hoje: considera despesas já lançadas + contas pendentes/vencidas.
// 7/15/30: considera somente contas pendentes/vencidas.
const shouldIncludePaidExpenses =
  period.startOffset === 0 && period.endOffset === 0;

const totalPayable = pendingPayable;

projection.push({
  label: period.label,
  operationalForecast: projectedOperationalIncome,
  receivableAccounts,
  receivable,
  paidExpenses: shouldIncludePaidExpenses ? paidExpenses : 0,
  pendingPayable,
  payable: totalPayable,
  balance: receivable - totalPayable,
});
  }

  return projection;
};

// @desc    Cash Flow Projection
// @route   GET /api/accounts/cash-flow
const getCashFlowProjection = async (req, res) => {
  try {
    const { month, year } = req.query;

    const projection = await buildCashFlowProjection(month, year);

    res.json({ projection });
  } catch (error) {
    console.error('Erro fluxo de caixa:', error);
    res.status(500).json({ error: error.message });
  }
};

const buildRealizedCashFlow = async (month, year) => {
  const { start, end } = getMonthPeriod(month, year);

  const entries = await Entry.find({
    deleted: { $ne: true },
    date: {
      $gte: start,
      $lte: end,
    },
  }).sort({ date: 1 });

  const grouped = {};

  entries.forEach((entry) => {
    const dateKey = entry.date.toISOString().slice(0, 10);

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        income: 0,
        expense: 0,
        balance: 0,
        accumulated: 0,
      };
    }

    const amount = Math.abs(Number(entry.amount || 0));

    if (entry.type === 'income') {
      grouped[dateKey].income += amount;
    }

    if (entry.type === 'expense') {
      grouped[dateKey].expense += amount;
    }
  });

  let accumulated = 0;

  const realized = Object.values(grouped).map((day) => {
    const balance = day.income - day.expense;
    accumulated += balance;

    return {
      ...day,
      balance,
      accumulated,
    };
  });

  return realized;
};

// @desc    Realized Cash Flow
// @route   GET /api/accounts/realized-cash-flow
const getRealizedCashFlow = async (req, res) => {
  try {
    const { month, year } = req.query;

    const realized = await buildRealizedCashFlow(month, year);

    res.json({ realized });
  } catch (error) {
    console.error('Erro fluxo de caixa realizado:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAccount,
  getCashFlowProjection,
  getRealizedCashFlow,
  getAccounts,
  getAccount,
  updateAccount,
  settleAccount,
  cancelAccount,
  deleteAccount,
};
