const express = require('express');

const {
  getInventoryBalance,
  saveInventoryBalance,
} = require('../controllers/inventoryController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/:year/:month')
  .get(getInventoryBalance)
  .put(saveInventoryBalance);

module.exports = router;
