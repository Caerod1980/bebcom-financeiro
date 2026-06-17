const InventoryBalance = require('../models/InventoryBalance');
const Entry = require('../models/Entry');

const getPreviousMonth = (year, month) => {
  let previousMonth = month - 1;
  let previousYear = year;

  if (previousMonth <= 0) {
    previousMonth = 12;
    previousYear -= 1;
  }

  return { previousYear, previousMonth };
};

const calculateStockTotals = async (year, month, manualInitialStock = 0) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const purchasesResult = await Entry.aggregate([
    {
      $match: {
        deleted: { $ne: true },
        type: 'expense',
        category: 'compras_mercadorias',
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  const revenueResult = await Entry.aggregate([
    {
      $match: {
        deleted: { $ne: true },
        type: 'income',
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  const internalConsumptionResult = await Entry.aggregate([
    {
      $match: {
        deleted: { $ne: true },
        type: 'expense',
        costCenter: 'estoque',
        category: 'funcionarios',
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  const lossesResult = await Entry.aggregate([
    {
      $match: {
        deleted: { $ne: true },
        type: 'expense',
        costCenter: 'estoque',
        category: 'perdas',
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  const purchases = purchasesResult[0]?.total || 0;
  const netRevenue = revenueResult[0]?.total || 0;
  const internalConsumption =
    internalConsumptionResult[0]?.total || 0;
  const losses = lossesResult[0]?.total || 0;

  const stockConsumption =
    internalConsumption + losses;

  const baseStock =
    netRevenue - purchases;

  const grossMarginPercent =
    netRevenue > 0
      ? baseStock / netRevenue
      : 0;

  const stockBalance =
    baseStock + baseStock * grossMarginPercent - stockConsumption;

  let initialStock = Number(manualInitialStock || 0);

  if (month !== 1) {
    const { previousYear, previousMonth } =
      getPreviousMonth(year, month);

    const previousInventory =
      await InventoryBalance.findOne({
        year: previousYear,
        month: previousMonth,
      });

    if (previousInventory) {
      initialStock =
        Number(previousInventory.stockBalance || 0);
    }
  }

  return {
    initialStock,
    purchases,
    cmv: 0,
    netRevenue,
    grossMarginPercent,
    stockBalance,
    internalConsumption,
    losses,
    stockConsumption,
  };
};

// @desc    Get inventory balance by month/year
// @route   GET /api/inventory/:year/:month
const getInventoryBalance = async (req, res) => {
  try {
    const year = Number(req.params.year);
    const month = Number(req.params.month);

    let inventory =
      await InventoryBalance.findOne({ year, month });

    const manualInitialStock =
      inventory?.initialStock || 0;

    const totals =
      await calculateStockTotals(
        year,
        month,
        manualInitialStock
      );

    if (!inventory) {
      inventory = await InventoryBalance.create({
        year,
        month,
        initialStock: totals.initialStock,
        purchases: totals.purchases,
        cmv: totals.cmv,
        stockBalance: totals.stockBalance,
        finalStock: totals.stockBalance,
        notes: '',
        createdBy: req.user?._id,
      });
    } else {
      inventory.initialStock = totals.initialStock;
      inventory.purchases = totals.purchases;
      inventory.cmv = totals.cmv;
      inventory.stockBalance = totals.stockBalance;
      inventory.finalStock = totals.stockBalance;

      await inventory.save();
    }

    return res.json({
      inventory,
      totals,
    });
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);

    return res.status(500).json({
      error: 'Erro ao buscar estoque',
    });
  }
};

// @desc    Save/update initial inventory
// @route   PUT /api/inventory/:year/:month
const saveInventoryBalance = async (req, res) => {
  try {
    const year = Number(req.params.year);
    const month = Number(req.params.month);

    const { initialStock, notes } = req.body;

    let inventory =
      await InventoryBalance.findOne({ year, month });

    if (!inventory) {
      inventory = new InventoryBalance({
        year,
        month,
        createdBy: req.user?._id,
      });
    }

    if (month === 1) {
      inventory.initialStock =
        Number(initialStock || 0);
    }

    inventory.notes = notes || '';

    const totals =
      await calculateStockTotals(
        year,
        month,
        inventory.initialStock
      );

    inventory.initialStock = totals.initialStock;
    inventory.purchases = totals.purchases;
    inventory.cmv = totals.cmv;
    inventory.stockBalance = totals.stockBalance;
    inventory.finalStock = totals.stockBalance;

    await inventory.save();

    return res.json({
      message: 'Estoque salvo com sucesso',
      inventory,
      totals,
    });
  } catch (error) {
    console.error('Erro ao salvar estoque:', error);

    return res.status(500).json({
      error: 'Erro ao salvar estoque',
    });
  }
};
module.exports = {
  getInventoryBalance,
  saveInventoryBalance,
};
