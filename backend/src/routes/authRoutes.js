const express = require('express');
const { body, validationResult } = require('express-validator');

const {
  register,
  login,
  getMe,
  changePassword,
  createUserByAdmin,
  deactivateUser,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array(),
    });
  }

  next();
};

router.post(
  '/login',
  [
    body('email')
      .isEmail().withMessage('Email inválido')
      .normalizeEmail()
      .notEmpty().withMessage('Email é obrigatório'),
    body('password')
      .notEmpty().withMessage('Senha é obrigatória'),
  ],
  validateRequest,
  login
);

if (process.env.NODE_ENV !== 'production') {
  router.post(
    '/register',
    [
      body('name')
        .notEmpty().withMessage('Nome é obrigatório')
        .trim()
        .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
      body('email')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail()
        .notEmpty().withMessage('Email é obrigatório'),
      body('password')
        .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    ],
    validateRequest,
    register
  );

  console.log('⚠️ Rota /register disponível apenas para desenvolvimento');
}

router.get('/me', protect, getMe);

router.put(
  '/change-password',
  protect,
  [
    body('newPassword')
      .isLength({ min: 6 }).withMessage('A nova senha deve ter pelo menos 6 caracteres'),
  ],
  validateRequest,
  changePassword
);

router.post(
  '/admin/create-user',
  protect,
  [
    body('name')
      .notEmpty().withMessage('Nome é obrigatório')
      .trim()
      .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
    body('email')
      .isEmail().withMessage('Email inválido')
      .normalizeEmail()
      .notEmpty().withMessage('Email é obrigatório'),
    body('password')
      .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('role')
      .optional()
      .isIn(['admin', 'user']).withMessage('Role deve ser admin ou user'),
  ],
  validateRequest,
  createUserByAdmin
);

router.put('/admin/deactivate/:id', protect, deactivateUser);

module.exports = router;
