const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  createUserByAdmin,   // ⭐ NOVA ROTA
  deactivateUser       // ⭐ NOVA ROTA
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rotas públicas
router.post('/login', login);

// ⭐ SEGURANÇA: Em produção, remover esta rota ou proteger
// Por enquanto mantemos para desenvolvimento, mas com warning
if (process.env.NODE_ENV !== 'production') {
  router.post('/register', register);
  console.log('⚠️ Rota /register disponível apenas para desenvolvimento');
} else {
  // Em produção, apenas admin pode criar usuários
  console.log('🔒 Rota /register desativada em produção');
}

// Rotas protegidas
router.get('/me', protect, getMe);

// ⭐ NOVAS ROTAS ADMIN (apenas para produção/controle)
router.post('/admin/create-user', protect, createUserByAdmin);
router.put('/admin/deactivate/:id', protect, deactivateUser);

module.exports = router;
