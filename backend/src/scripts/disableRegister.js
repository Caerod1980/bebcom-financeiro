// Script para desativar rota de registro em produção
// Execute apenas quando for fazer deploy

const fs = require('fs');
const path = require('path');

const authRoutesPath = path.join(__dirname, '../routes/authRoutes.js');

try {
  let content = fs.readFileSync(authRoutesPath, 'utf8');
  
  // Comentar a rota de registro
  const updatedContent = content.replace(
    /router\.post\('\/register', register\);/,
    "// router.post('/register', register); // DESATIVADO EM PRODUÇÃO"
  );
  
  fs.writeFileSync(authRoutesPath, updatedContent, 'utf8');
  console.log('✅ Rota /register desativada com sucesso!');
} catch (error) {
  console.error('❌ Erro ao desativar rota:', error);
}
