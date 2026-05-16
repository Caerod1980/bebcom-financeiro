const dreService = require('../services/dreService');
const MonthlyClosing = require('../models/MonthlyClosing');

// @desc    Get monthly DRE
// @route   GET /api/dre/monthly
const getMonthlyDRE = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Mês e ano são obrigatórios' });
    }
    
    const dre = await dreService.calculateDRE(parseInt(month), parseInt(year));
    res.json(dre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Close month
// @route   POST /api/dre/close-month
const closeMonth = async (req, res) => {
  try {
    const { month, year } = req.body;
    
    const existing = await MonthlyClosing.findOne({ month, year });
    if (existing && existing.closed) {
      return res.status(400).json({ error: 'Mês já está fechado' });
    }
    
    const dre = await dreService.calculateDRE(month, year);
    const closing = await dreService.saveMonthlyClosing(month, year, dre, req.user._id);
    
    res.json({ message: 'Mês fechado com sucesso', closing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get dashboard data
// @route   GET /api/dre/dashboard
const getDashboard = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();
    
    const dre = await dreService.calculateDRE(parseInt(currentMonth), parseInt(currentYear));
    
    // Get previous month for comparison
    let prevMonth = parseInt(currentMonth) - 1;
    let prevYear = parseInt(currentYear);
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }
    
    const prevDre = await dreService.calculateDRE(prevMonth, prevYear);
    
    // Get top categories
    const topExpenses = await dreService.getTopExpenseCategories(parseInt(currentMonth), parseInt(currentYear));
    
    res.json({
      current: dre,
      previous: prevDre,
      topExpenses,
      comparison: {
        revenueVariation: ((dre.receitaLiquida - prevDre.receitaLiquida) / prevDre.receitaLiquida * 100).toFixed(2),
        profitVariation: ((dre.lucroLiquido - prevDre.lucroLiquido) / prevDre.lucroLiquido * 100).toFixed(2),
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMonthlyDRE, closeMonth, getDashboard };
