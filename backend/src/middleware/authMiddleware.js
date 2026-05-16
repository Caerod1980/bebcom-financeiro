const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  // Verificar se o token existe no header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrair token
      token = req.headers.authorization.split(' ')[1];
      
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // ⭐ BUSCAR USUÁRIO E VALIDAR EXISTÊNCIA
      const user = await User.findById(decoded.id).select('-passwordHash');
      
      // ⭐ VALIDAÇÃO CRÍTICA: usuário existe?
      if (!user) {
        return res.status(401).json({ 
          error: 'Usuário não encontrado ou foi removido' 
        });
      }
      
      // ⭐ VALIDAÇÃO: usuário está ativo?
      if (!user.active) {
        return res.status(401).json({ 
          error: 'Usuário desativado. Contate o administrador.' 
        });
      }
      
      // Atribuir usuário à requisição
      req.user = user;
      
      // ⭐ IMPORTANTE: usar return next() para evitar dupla resposta
      return next();
      
    } catch (error) {
      console.error('Erro na autenticação:', error.message);
      
      // Tratar diferentes tipos de erro JWT
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado. Faça login novamente.' });
      }
      
      return res.status(401).json({ error: 'Não autorizado' });
    }
  }
  
  // ⭐ Se não houver token, retornar erro (com return para parar execução)
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
  }
};

module.exports = { protect };
