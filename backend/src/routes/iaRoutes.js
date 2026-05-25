const express = require('express');

const {
  askIABebcom,
} = require('../controllers/iaController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/ask', askIABebcom);

module.exports = router;
