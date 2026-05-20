const dreService = require('../services/dreService');
const MonthlyClosing = require('../models/MonthlyClosing');

// ⭐ HELPER PARA CALCULAR VARIAÇÃO (evita divisão por zero)
const calculateVariation = (current, previous) => {
  if (!previous || previous === 0) return '0.00';
  return (((current - previous) / previous) * 100).toFixed(2);
};

// ⭐ HELPER PARA VALIDAR MÊS/ANO
const validateMonthYear = (month, year) => {
  const parsedMonth = parseInt(month);
  const parsedYear = parseInt(year);
  
  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return { error: 'Mês inválido. Deve ser um número entre 1 e 12.' };
  }
  
  if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
    return { error: 'Ano inválido. Deve ser um número entre 2000 e 2100.' };
  }
  
  return { valid: true, month: parsedMonth, year: parsedYear };
};

// @desc    Get monthly DRE
// @route   GET /api/dre/monthly
const getMonthlyDRE = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Mês e ano são obrigatórios' });
    }
    
    // ⭐ VALIDAÇÃO DE MÊS/ANO
    const validation = validateMonthYear(month, year);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }
    
    const dre = await dreService.calculateDRE(validation.month, validation.year);
    res.json(dre);
  } catch (error) {
    console.error('Erro ao calcular DRE:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Close month
// @route   POST /api/dre/close-month
const closeMonth = async (req, res) => {
  try {
    const { month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Mês e ano são obrigatórios' });
    }
    
    // ⭐ VALIDAÇÃO DE MÊS/ANO
    const validation = validateMonthYear(month, year);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }
    
    // ⭐ VALIDAÇÃO: não pode fechar mês futuro
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (validation.year > currentYear || 
        (validation.year === currentYear && validation.month > currentMonth)) {
      return res.status(400).json({ 
        error: 'Não é possível fechar um mês futuro.' 
      });
    }
    
    const existing = await MonthlyClosing.findOne({ 
      month: validation.month, 
      year: validation.year 
    });
    
    if (existing && existing.closed) {
      return res.status(400).json({ error: 'Este mês já está fechado.' });
    }
    
    const dre = await dreService.calculateDRE(validation.month, validation.year);
    const closing = await dreService.saveMonthlyClosing(
     validation.month,
     validation.year,
     dre,
     req.user._id,
  {
    ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  }
);
    
    res.json({ 
      message: 'Mês fechado com sucesso!', 
      closing 
    });
  } catch (error) {
    console.error('Erro ao fechar mês:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get dashboard data
// @route   GET /api/dre/dashboard
const getDashboard = async (req, res) => {
  try {
    let { month, year } = req.query;
    
    const currentDate = new Date();
    const currentMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const currentYear = year ? parseInt(year) : currentDate.getFullYear();
    
    // ⭐ VALIDAÇÃO DE MÊS/ANO
    const validation = validateMonthYear(currentMonth, currentYear);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }
    
    const dre = await dreService.calculateDRE(validation.month, validation.year);
    
    // Get previous month for comparison
    let prevMonth = validation.month - 1;
    let prevYear = validation.year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }
    
    const prevDre = await dreService.calculateDRE(prevMonth, prevYear);
    
    // Get top expense categories
    const topExpenses = await dreService.getTopExpenseCategories(validation.month, validation.year);
    
    // ⭐ CALCULAR VARIAÇÕES COM SEGURANÇA (sem divisão por zero)
    const revenueVariation = calculateVariation(dre.receitaLiquida, prevDre.receitaLiquida);
    const profitVariation = calculateVariation(dre.lucroLiquido, prevDre.lucroLiquido);
    
    // ⭐ CALCULAR TICKET MÉDIO (se houver dados)
    // Nota: você precisa adicionar campo 'transactions' nos lançamentos para isso
    // Por enquanto, retorna 0
    const averageTicket = 0; // futuro: dre.receitaLiquida / totalTransactions
    
    res.json({
      current: dre,
      previous: prevDre,
      topExpenses,
      averageTicket,
      comparison: {
        revenueVariation,
        profitVariation,
        revenueVariationAbsolute: dre.receitaLiquida - prevDre.receitaLiquida,
        profitVariationAbsolute: dre.lucroLiquido - prevDre.lucroLiquido,
      }
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get comparison between two months
// @route   GET /api/dre/compare
const compareMonths = async (req, res) => {
  try {
    const { month1, year1, month2, year2 } = req.query;
    
    const validation1 = validateMonthYear(month1, year1);
    if (validation1.error) {
      return res.status(400).json({ error: `Mês base: ${validation1.error}` });
    }
    
    const validation2 = validateMonthYear(month2, year2);
    if (validation2.error) {
      return res.status(400).json({ error: `Mês comparação: ${validation2.error}` });
    }
    
    const dre1 = await dreService.calculateDRE(validation1.month, validation1.year);
    const dre2 = await dreService.calculateDRE(validation2.month, validation2.year);
    
    const comparison = {
      period1: { month: validation1.month, year: validation1.year, data: dre1 },
      period2: { month: validation2.month, year: validation2.year, data: dre2 },
      variations: {
        revenue: calculateVariation(dre1.receitaLiquida, dre2.receitaLiquida),
        profit: calculateVariation(dre1.lucroLiquido, dre2.lucroLiquido),
        expenses: calculateVariation(dre1.despesasOperacionais, dre2.despesasOperacionais),
      }
    };
    
    res.json(comparison);
  } catch (error) {
    console.error('Erro ao comparar meses:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get year summary
// @route   GET /api/dre/year-summary
const getYearSummary = async (req, res) => {
  try {
    const { year } = req.query;
    const parsedYear = parseInt(year);

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      return res.status(400).json({ error: 'Ano inválido.' });
    }

    const annualSummary = await dreService.calculateAnnualDRE(parsedYear);

    res.json(annualSummary);
  } catch (error) {
    console.error('Erro ao carregar resumo anual:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getMonthlyDRE, 
  closeMonth, 
  getDashboard,
  compareMonths,      // ⭐ NOVA FUNÇÃO
  getYearSummary      // ⭐ NOVA FUNÇÃO
};
