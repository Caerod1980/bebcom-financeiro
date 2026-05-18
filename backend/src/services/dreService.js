const Entry = require('../models/Entry');
const MonthlyClosing = require('../models/MonthlyClosing');
const crypto = require('crypto');

// ⭐ CALCULAR PERCENTUAL COM SEGURANÇA
const calculatePercentage = (value, base) => {
  if (!base || base === 0) return '0.00';
  return ((value / base) * 100).toFixed(2);
};

// ⭐ VALIDAR SE MÊS TEM LANÇAMENTOS
const hasEntriesInMonth = async (month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const count = await Entry.countDocuments({
    date: { $gte: startDate, $lte: endDate },
    deleted: false,
  });
  
  return count > 0;
};

const calculateDRE = async (month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const entries = await Entry.find({
    date: { $gte: startDate, $lte: endDate },
    deleted: false,
  });
  
  // Initialize DRE object
  const dre = {
    month,
    year,
    receitaBruta: 0,
    deducoes: 0,
    receitaLiquida: 0,
    cmv: 0,
    lucroBruto: 0,
    despesasOperacionais: 0,
    resultadoOperacional: 0,
    despesasFinanceiras: 0,
    outrasReceitas: 0,
    outrasDespesas: 0,
    lucroLiquido: 0,
    closed: false,
    hasEntries: entries.length > 0, // ⭐ INDICA SE HÁ LANÇAMENTOS
    details: {
      receitaBrutaItems: [],
      deducoesItems: [],
      cmvItems: [],
      despesasOperacionaisItems: [],
      despesasFinanceirasItems: [],
    }
  };
  
  // Aggregate by dreGroup
  entries.forEach(entry => {
    const value = entry.amount;
    
    switch (entry.dreGroup) {
      case 'receita_bruta':
        dre.receitaBruta += value;
        dre.details.receitaBrutaItems.push(entry);
        break;
      case 'deducoes':
        dre.deducoes += value;
        dre.details.deducoesItems.push(entry);
        break;
      case 'cmv':
        dre.cmv += value;
        dre.details.cmvItems.push(entry);
        break;
      case 'despesas_operacionais':
        dre.despesasOperacionais += value;
        dre.details.despesasOperacionaisItems.push(entry);
        break;
      case 'despesas_financeiras':
        dre.despesasFinanceiras += value;
        dre.details.despesasFinanceirasItems.push(entry);
        break;
      case 'outras_receitas':
        dre.outrasReceitas += value;
        break;
      case 'outras_despesas':
        dre.outrasDespesas += value;
        break;
    }
  });
  
  // Calculate DRE
  dre.receitaLiquida = dre.receitaBruta - dre.deducoes;
  dre.lucroBruto = dre.receitaLiquida - dre.cmv;
  dre.resultadoOperacional = dre.lucroBruto - dre.despesasOperacionais;
  dre.lucroLiquido = dre.resultadoOperacional - dre.despesasFinanceiras + dre.outrasReceitas - dre.outrasDespesas;
  
  // ⭐ PERCENTUAIS CORRIGIDOS - sem divisão por zero
  dre.percentuais = {
    margemBruta: calculatePercentage(dre.lucroBruto, dre.receitaLiquida),
    margemOperacional: calculatePercentage(dre.resultadoOperacional, dre.receitaLiquida),
    margemLiquida: calculatePercentage(dre.lucroLiquido, dre.receitaLiquida),
    cmvPercent: calculatePercentage(dre.cmv, dre.receitaLiquida),
    despesasPercent: calculatePercentage(dre.despesasOperacionais, dre.receitaLiquida),
  };
  
  return dre;
};

const saveMonthlyClosing = async (month, year, dre, userId, auditInfo = {}) => {
  const existing = await MonthlyClosing.findOne({ month, year });

  if (existing && existing.closed) {
    throw new Error('Este mês já está fechado');
  }

  const topExpenses = await getTopExpenseCategories(month, year);
  const categoriesSnapshot = buildCategoriesSnapshot(dre);

  const closedAt = new Date();

  const auditPayload = {
    month,
    year,
    closedAt: closedAt.toISOString(),
    closedBy: userId.toString(),
    receitaBruta: dre.receitaBruta,
    deducoes: dre.deducoes,
    receitaLiquida: dre.receitaLiquida,
    cmv: dre.cmv,
    lucroBruto: dre.lucroBruto,
    despesasOperacionais: dre.despesasOperacionais,
    resultadoOperacional: dre.resultadoOperacional,
    despesasFinanceiras: dre.despesasFinanceiras,
    outrasReceitas: dre.outrasReceitas,
    outrasDespesas: dre.outrasDespesas,
    lucroLiquido: dre.lucroLiquido,
    percentuais: dre.percentuais,
    categoriesSnapshot,
    topExpenses,
  };

  const auditHash = buildAuditHash(auditPayload);

  const { nextMonth, nextYear } = getNextMonthYear(month, year);

  const closing = await MonthlyClosing.findOneAndUpdate(
    { month, year },
    {
      month,
      year,

      receitaBruta: dre.receitaBruta,
      deducoes: dre.deducoes,
      receitaLiquida: dre.receitaLiquida,
      cmv: dre.cmv,
      lucroBruto: dre.lucroBruto,
      despesasOperacionais: dre.despesasOperacionais,
      resultadoOperacional: dre.resultadoOperacional,
      despesasFinanceiras: dre.despesasFinanceiras,
      outrasReceitas: dre.outrasReceitas,
      outrasDespesas: dre.outrasDespesas,
      lucroLiquido: dre.lucroLiquido,

      snapshotDRE: dre,
      indicators: dre.percentuais,
      categoriesSnapshot,
      topExpensesSnapshot: topExpenses,

      closed: true,
      closedAt,
      closedBy: userId,

      auditHash,
      auditPayload,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,

      nextMonthOpeningBalance: dre.lucroLiquido,

      $push: {
        versions: {
          calculatedAt: closedAt,
          auditHash,
          values: {
            receitaBruta: dre.receitaBruta,
            receitaLiquida: dre.receitaLiquida,
            lucroBruto: dre.lucroBruto,
            lucroLiquido: dre.lucroLiquido,
          },
        },
      },
    },
    { upsert: true, new: true }
  );

  const nextClosing = await MonthlyClosing.findOne({
    month: nextMonth,
    year: nextYear,
  });

  if (!nextClosing || !nextClosing.closed) {
    await MonthlyClosing.findOneAndUpdate(
      { month: nextMonth, year: nextYear },
      {
        month: nextMonth,
        year: nextYear,
        openingBalance: dre.lucroLiquido,
      },
      { upsert: true, new: true }
    );
  }

  return closing;
};

const getTopExpenseCategories = async (month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const expenses = await Entry.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        type: 'expense',
        deleted: false,
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } },
    { $limit: 5 }
  ]);
  
  return expenses;
};

// ⭐ NOVA FUNÇÃO: obter resumo rápido
const getQuickSummary = async (month, year) => {
  const dre = await calculateDRE(month, year);
  return {
    receita: dre.receitaLiquida,
    despesas: dre.despesasOperacionais,
    lucro: dre.lucroLiquido,
    margem: dre.percentuais.margemLiquida,
  };
};

const isMonthClosed = async (date) => {
  const entryDate = new Date(date);

  const month = entryDate.getMonth() + 1;
  const year = entryDate.getFullYear();

  const closing = await MonthlyClosing.findOne({
    month,
    year,
    closed: true,
  });

  return !!closing;
};

const sortObjectDeep = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectDeep);
  }

  if (obj && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObjectDeep(obj[key]);
        return acc;
      }, {});
  }

  return obj;
};

const buildAuditHash = (payload) => {
  const normalizedPayload = sortObjectDeep(payload);
  const normalized = JSON.stringify(normalizedPayload);

  return crypto.createHash('sha256').update(normalized).digest('hex');
};

const getNextMonthYear = (month, year) => {
  if (month === 12) {
    return { nextMonth: 1, nextYear: year + 1 };
  }

  return { nextMonth: month + 1, nextYear: year };
};

const buildCategoriesSnapshot = (dre) => {
  return {
    receitaBruta: dre.details?.receitaBrutaItems?.map((item) => ({
      description: item.description,
      category: item.category,
      amount: item.amount,
      date: item.date,
    })) || [],

    deducoes: dre.details?.deducoesItems?.map((item) => ({
      description: item.description,
      category: item.category,
      amount: item.amount,
      date: item.date,
    })) || [],

    cmv: dre.details?.cmvItems?.map((item) => ({
      description: item.description,
      category: item.category,
      amount: item.amount,
      date: item.date,
    })) || [],

    despesasOperacionais: dre.details?.despesasOperacionaisItems?.map((item) => ({
      description: item.description,
      category: item.category,
      amount: item.amount,
      date: item.date,
    })) || [],

    despesasFinanceiras: dre.details?.despesasFinanceirasItems?.map((item) => ({
      description: item.description,
      category: item.category,
      amount: item.amount,
      date: item.date,
    })) || [],
  };
};

module.exports = {
  calculateDRE,
  saveMonthlyClosing,
  getTopExpenseCategories,
  getQuickSummary,
  hasEntriesInMonth,
  isMonthClosed,
};
