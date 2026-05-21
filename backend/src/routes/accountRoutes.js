const express = require('express');
const {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  settleAccount,
  cancelAccount,
  deleteAccount,
  getCashFlowProjection,
} = require('../controllers/accountController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createAccount)
  .get(getAccounts);

router.get('/cash-flow', getCashFlowProjection);

router.route('/:id')
  .get(getAccount)
  .put(updateAccount)
  .delete(deleteAccount);

router.put('/:id/settle', settleAccount);
router.put('/:id/cancel', cancelAccount);

module.exports = router;
