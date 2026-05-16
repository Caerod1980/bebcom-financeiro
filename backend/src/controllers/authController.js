const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d', // ⭐ fallback seguro
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// ⭐ SEGURANÇA: Em produção, esta rota deve ser desativada após primeiro admin
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // ⭐ VERIFICAR se já existe algum admin no sistema
    const adminExists = await User.findOne({ role: 'admin' });
    
    // Se já existe admin e tentativa de registro, bloquear (segurança)
    // ⭐ Em produção, descomente esta verificação
    // if (adminExists && process.env.NODE_ENV === 'production') {
    //   return res.status(403).json({ 
    //     error: 'Registro bloqueado. Contate o administrador para criar novos usuários.' 
    //   });
    // }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: adminExists ? 'user' : 'admin', // ⭐ Primeiro usuário é admin
    });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ⭐ VALIDAR: apenas usuários ATIVOS podem logar
    const user = await User.findOne({ 
      email, 
      active: true  // ⭐ CRÍTICO: usuário desativado não loga
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ⭐ NOVA FUNÇÃO: Apenas admin pode criar novos usuários (segurança)
// @desc    Create user by admin
// @route   POST /api/auth/admin/create-user
const createUserByAdmin = async (req, res) => {
  try {
    // Verificar se quem está criando é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
    
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role || 'user',
      active: true,
    });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: 'Usuário criado com sucesso',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ⭐ NOVA FUNÇÃO: Desativar usuário (segurança)
// @desc    Deactivate user
// @route   PUT /api/auth/admin/deactivate/:id
const deactivateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Você não pode desativar seu próprio usuário admin' });
    }
    
    user.active = false;
    await user.save();
    
    res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  register, 
  login, 
  getMe, 
  createUserByAdmin,  // ⭐ NOVO
  deactivateUser      // ⭐ NOVO
};
