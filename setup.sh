#!/bin/bash

echo "🚀 Configurando Bebcom Financeiro..."

# Backend setup
echo "📦 Instalando dependências do backend..."
cd backend
npm install
cp ../.env.example .env
cd ..

# Frontend setup
echo "📦 Instalando dependências do frontend..."
cd frontend
npm install
cd ..

echo "✅ Setup concluído!"
echo ""
echo "🔧 Próximos passos:"
echo "1. Edite o arquivo .env na raiz com seus dados do MongoDB"
echo "2. Execute: cd backend && npm run seed"
echo "3. Execute: cd backend && npm run dev"
echo "4. Em outro terminal: cd frontend && npm run dev"
echo ""
echo "🔑 Acesso inicial: caerod@gmail.com / admin123"
