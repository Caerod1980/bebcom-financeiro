const Account = require('../models/Account');

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

// @desc    Mark account as paid/received
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

    account.status = account.type === 'payable' ? 'paid' : 'received';
    account.paymentDate = req.body.paymentDate
      ? new Date(req.body.paymentDate)
      : new Date();

    await account.save();

    res.json({
      message:
        account.type === 'payable'
          ? 'Conta marcada como paga.'
          : 'Conta marcada como recebida.',
      account,
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

module.exports = {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  settleAccount,
  cancelAccount,
  deleteAccount,
};
