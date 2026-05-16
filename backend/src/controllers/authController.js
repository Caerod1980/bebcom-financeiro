const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    
    // ⭐ NORMALIZAR EMAIL (lowercase + trim)
    email = email?.toLowerCase().trim();
    name = name?.trim();
    
    // ⭐ VALIDAÇÃO DE SENHA MÍNIMA
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        error: 'Senha deve ter pelo menos 6 caracteres' 
      });
    }
    
    // ⭐ VALIDAÇÃO DE SENHA FORTE (opcional - recomendo)
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumbers = /\d/.test(password);
    // if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    //   return res.status(400).json({ 
    //     error: 'Senha deve conter letras maiúsculas, minúsculas e números' 
    //   });
    // }
    
    // Verificar se já existe admin
    const adminExists = await User.findOne({ role: 'admin' });
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: adminExists ? 'user' : 'admin',
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
    let { email, password } = req.body;
    
    // ⭐ NORMALIZAR EMAIL (lowercase + trim) - CRÍTICO
    const normalizedEmail = email?.toLowerCase().trim();
    
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // ⭐ VALIDAR: apenas usuários ATIVOS podem logar
    const user = await User.findOne({ 
      email: normalizedEmail, 
      active: true  
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
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create user by admin
// @route   POST /api/auth/admin/create-user
const createUserByAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
    
    let { name, email, password, role } = req.body;
    
    // ⭐ NORMALIZAR
    email = email?.toLowerCase().trim();
    name = name?.trim();
    
    // ⭐ VALIDAÇÃO SENHA MÍNIMA
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }
    
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
  createUserByAdmin,
  deactivateUser
};
