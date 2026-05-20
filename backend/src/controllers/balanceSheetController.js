const BalanceSheet = require('../models/BalanceSheet');
const dreService = require('../services/dreService');

const toNumber = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
};

const calculateTotals = (balanceSheet, annualDRE = null) => {
  const assets = balanceSheet.assets || {};
  const liabilities = balanceSheet.liabilities || {};

  const totalAssets =
    toNumber(assets.cash) +
    toNumber(assets.bank) +
    toNumber(assets.inventory) +
    toNumber(assets.receivables) +
    toNumber(assets.equipment) +
    toNumber(assets.otherAssets);

  const totalLiabilities =
    toNumber(liabilities.loans) +
    toNumber(liabilities.suppliers) +
    toNumber(liabilities.taxes) +
    toNumber(liabilities.fixedBills) +
    toNumber(liabilities.otherLiabilities);

  const equity = totalAssets - totalLiabilities;

  return {
    totalAssets,
    totalLiabilities,
    equity,
    annualProfit: annualDRE?.annualDRE?.lucroLiquido || 0,
    loansPaidInYear: annualDRE?.patrimonialPreview?.emprestimosPagosNoAno || 0,
  };
};

// @desc    Get balance sheet by year
// @route   GET /api/balance-sheet/:year
const getBalanceSheet = async (req, res) => {
  try {
    const year = parseInt(req.params.year);

    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ error: 'Ano inválido.' });
    }

    let balanceSheet = await BalanceSheet.findOne({ year });

    if (!balanceSheet) {
      balanceSheet = await BalanceSheet.create({
        year,
        createdBy: req.user?._id,
      });
    }

    const annualDRE = await dreService.calculateAnnualDRE(year);
    const totals = calculateTotals(balanceSheet, annualDRE);

    res.json({
      balanceSheet,
      totals,
      annualDREPreview: {
        lucroLiquido: annualDRE.annualDRE?.lucroLiquido || 0,
        emprestimosPagosNoAno:
          annualDRE.patrimonialPreview?.emprestimosPagosNoAno || 0,
      },
    });
  } catch (error) {
    console.error('Erro ao carregar balanço patrimonial:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Save/update balance sheet
// @route   PUT /api/balance-sheet/:year
const saveBalanceSheet = async (req, res) => {
  try {
    const year = parseInt(req.params.year);

    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ error: 'Ano inválido.' });
    }

    const { assets = {}, liabilities = {}, notes = '', referenceDate = '31/12' } = req.body;

    const balanceSheet = await BalanceSheet.findOneAndUpdate(
      { year },
      {
        year,
        referenceDate,
        assets: {
          cash: toNumber(assets.cash),
          bank: toNumber(assets.bank),
          inventory: toNumber(assets.inventory),
          receivables: toNumber(assets.receivables),
          equipment: toNumber(assets.equipment),
          otherAssets: toNumber(assets.otherAssets),
        },
        liabilities: {
          loans: toNumber(liabilities.loans),
          suppliers: toNumber(liabilities.suppliers),
          taxes: toNumber(liabilities.taxes),
          fixedBills: toNumber(liabilities.fixedBills),
          otherLiabilities: toNumber(liabilities.otherLiabilities),
        },
        notes,
        updatedBy: req.user?._id,
        $setOnInsert: {
          createdBy: req.user?._id,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    const annualDRE = await dreService.calculateAnnualDRE(year);
    const totals = calculateTotals(balanceSheet, annualDRE);

    res.json({
      message: 'Balanço Patrimonial salvo com sucesso.',
      balanceSheet,
      totals,
    });
  } catch (error) {
    console.error('Erro ao salvar balanço patrimonial:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBalanceSheet,
  saveBalanceSheet,
};
