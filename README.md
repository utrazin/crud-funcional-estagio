# Backend Initial - Setup Guide

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Acesso a um banco de dados PostgreSQL (Supabase ou local)

## Passos para Rodar Localmente

### 1. Clonar o Repositório
```bash
git clone <seu-repo-url>
cd backend-initial
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@seu_host:5432/seu_banco"
DIRECT_URL="postgresql://seu_usuario:sua_senha@seu_host:5432/seu_banco"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

### 4. Executar Migrações do Prisma
```bash
npx prisma migrate deploy
```

### 5. Rodar o Servidor
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

## Variáveis de Ambiente Necessárias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão com o banco (com connection pooling) | `postgresql://user:pass@host:6543/db?pgbouncer=true` |
| `DIRECT_URL` | URL direta do banco (para migrações) | `postgresql://user:pass@host:5432/db` |
| `PORT` | Porta do servidor | `3001` |
| `CORS_ORIGIN` | Origem permitida para CORS | `http://localhost:5173` |

## Comandos Disponíveis

- `npm run dev` - Rodar em modo desenvolvimento
- `npm run build` - Compilar TypeScript
- `npm start` - Rodar versão compilada
- `npx prisma studio` - Abrir Prisma Studio (gerenciador visual do banco)

## Troubleshooting

**Erro de conexão com banco de dados:**
- Verifique se as credenciais em `.env` estão corretas
- Confirme se o banco está acessível na rede

**Erro nas migrações:**
```bash
npx prisma migrate reset  # Reseta o banco (cuidado em produção!)
```

**Porta já em uso:**
- Mude a variável `PORT` no `.env`
