const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  // Verificar se o token existe no header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('-passwordHash');
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Usuário não encontrado ou foi removido' 
        });
      }
      
      if (!user.active) {
        return res.status(401).json({ 
          error: 'Usuário desativado. Contate o administrador.' 
        });
      }
      
      req.user = user;
      return next();
      
    } catch (error) {
      console.error('Erro na autenticação:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado. Faça login novamente.' });
      }
      
      return res.status(401).json({ error: 'Não autorizado' });
    }
  }
  
  // ⭐ MENSAGEM MAIS CLARA
  if (!token) {
    return res.status(401).json({ 
      error: 'Acesso negado. Token Bearer obrigatório.' 
    });
  }
};

module.exports = { protect };
