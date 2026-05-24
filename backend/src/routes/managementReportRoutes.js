const express = require('express');

const {
  saveManagementReport,
  getManagementReport,
  getAnnualAnalytics,
  getHistoricalComparison,
  getMonthlyComparison,
  getGrowthCurve,
} = require('../controllers/managementReportController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', saveManagementReport);

router.get('/historical', getHistoricalComparison);

router.get('/analytics/:year', getAnnualAnalytics);

router.get('/monthly-comparison/:year', getMonthlyComparison);

router.get('/growth-curve/:year', getGrowthCurve);

router.get('/:year/:month', getManagementReport);

module.exports = router;
