#!/bin/bash

echo "🚀 Iniciando setup do Backend Initial..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale Node.js 18+"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env a partir do .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais do banco de dados"
else
    echo "✅ Arquivo .env já existe"
fi

# Executar migrações
echo "🗄️  Executando migrações do Prisma..."
npx prisma migrate deploy

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Próximos passos:"
echo "1. Edite o arquivo .env com suas credenciais"
echo "2. Execute: npm run dev"
echo ""
