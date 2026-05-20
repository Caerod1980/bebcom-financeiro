const express = require('express');
const {
  getBalanceSheet,
  saveBalanceSheet,
} = require('../controllers/balanceSheetController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:year', protect, getBalanceSheet);
router.put('/:year', protect, saveBalanceSheet);

module.exports = router;
