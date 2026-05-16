const express = require('express');
const {
  getMonthlyDRE,
  closeMonth,
  getDashboard,
  compareMonths,     // ⭐ NOVA ROTA
  getYearSummary,    // ⭐ NOVA ROTA
} = require('../controllers/dreController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(protect);

// Rotas principais
router.get('/monthly', getMonthlyDRE);
router.get('/dashboard', getDashboard);
router.post('/close-month', closeMonth);

// ⭐ NOVAS ROTAS ANALÍTICAS
router.get('/compare', compareMonths);      // Comparar dois meses
router.get('/year-summary', getYearSummary); // Resumo anual

module.exports = router;
