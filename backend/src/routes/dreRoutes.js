const express = require('express');
const {
  getMonthlyDRE,
  closeMonth,
  getDashboard,
} = require('../controllers/dreController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/monthly', getMonthlyDRE);
router.post('/close-month', closeMonth);
router.get('/dashboard', getDashboard);

module.exports = router;
