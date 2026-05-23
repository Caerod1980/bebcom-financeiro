const InventoryBalance = require('../models/InventoryBalance');
const Entry = require('../models/Entry');

// @desc    Get inventory balance by month/year
// @route   GET /api/inventory/:year/:month
const getInventoryBalance = async (req, res) => {
  try {
    const year = Number(req.params.year);
    const month = Number(req.params.month);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Busca estoque salvo
    let inventory = await InventoryBalance.findOne({
      year,
      month,
    });

    // Compras automáticas
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

    // CMV automático
    const cmvResult = await Entry.aggregate([
      {
        $match: {
          deleted: { $ne: true },
          dreGroup: 'cmv',
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
    const cmv = cmvResult[0]?.total || 0;

    // Estoque inicial
    let initialStock = inventory?.initialStock || 0;

    // Se não existir cadastro do mês,
    // tenta buscar o estoque final do mês anterior
    if (!inventory) {
      let previousMonth = month - 1;
      let previousYear = year;

      if (previousMonth <= 0) {
        previousMonth = 12;
        previousYear -= 1;
      }

      const previousInventory = await InventoryBalance.findOne({
        year: previousYear,
        month: previousMonth,
      });

      if (previousInventory) {
        initialStock = previousInventory.finalStock || 0;
      }
    }

    const finalStock =
      initialStock + purchases - cmv;

    // Se não existir, cria automaticamente
    if (!inventory) {
      inventory = await InventoryBalance.create({
        year,
        month,
        initialStock,
        purchases,
        cmv,
        finalStock,
        createdBy: req.user?._id,
      });
    } else {
      inventory.purchases = purchases;
      inventory.cmv = cmv;
      inventory.finalStock = finalStock;

      await inventory.save();
    }

    return res.json({
      inventory,
      totals: {
        initialStock,
        purchases,
        cmv,
        finalStock,
      },
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

    const {
      initialStock,
      notes,
    } = req.body;

    let inventory = await InventoryBalance.findOne({
      year,
      month,
    });

    if (!inventory) {
      inventory = new InventoryBalance({
        year,
        month,
        createdBy: req.user?._id,
      });
    }

    inventory.initialStock = Number(initialStock || 0);
    inventory.notes = notes || '';

    const finalStock =
      inventory.initialStock +
      (inventory.purchases || 0) -
      (inventory.cmv || 0);

    inventory.finalStock = finalStock;

    await inventory.save();

    return res.json({
      message: 'Estoque salvo com sucesso',
      inventory,
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
