const express = require('express');

const {
  saveManagementReport,
  getManagementReport,
  getAnnualAnalytics,
} = require('../controllers/managementReportController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', saveManagementReport);

router.get('/analytics/:year', getAnnualAnalytics);

router.get('/:year/:month', getManagementReport);

module.exports = router;
