# 🚂 Guia Completo de Deploy na Railway

## 📋 Pré-requisitos
- Conta no [Railway](https://railway.app)
- Conta no [MongoDB Atlas](https://cloud.mongodb.com) (gratuito)
- Repositório Git (GitHub, GitLab, etc.)

## 🚀 Deploy Passo a Passo

### 1. **Configurar MongoDB Atlas**
```bash
# 1. Acesse: https://cloud.mongodb.com
# 2. Crie um cluster gratuito (M0)
# 3. Configure usuário e senha
# 4. Adicione IP 0.0.0.0/0 na Network Access
# 5. Copie a connection string
```

### 2. **Preparar Repositório**
```bash
# Commit todas as mudanças
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 3. **Deploy na Railway**

#### Opção A: Via Dashboard Web
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha seu repositório
6. Railway detectará automaticamente o projeto Node.js

#### Opção B: Via CLI
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login na Railway
railway login

# Inicializar projeto
railway init

# Deploy
railway up
```

### 4. **Configurar Variáveis de Ambiente**

Na Railway dashboard, vá em **Variables** e adicione:

```env
# === ESSENCIAL ===
NODE_ENV=production
PORT=21465

# === DATABASE ===
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wppconnect_automation

# === SECURITY ===
SECRET_KEY=sua_chave_secreta_super_forte_32_caracteres_minimo

# === AUTOMATION ===
AUTOMATION_ENABLED=true
QUEUE_PROCESS_INTERVAL=5000
MAX_LISTENERS=20

# === LOGGING ===
LOG_LEVEL=info
LOG_TO_FILE=false

# === PERFORMANCE ===
RATE_LIMIT_MESSAGES_PER_MINUTE=30
CACHE_ENABLED=true

# === PUPPETEER ===
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# === OPTIONAL INTEGRATIONS ===
# TELEGRAM_BOT_TOKEN=your_bot_token
# INSTAGRAM_ACCESS_TOKEN=your_instagram_token
# TWILIO_ACCOUNT_SID=your_twilio_sid
# TWILIO_AUTH_TOKEN=your_twilio_token
```

### 5. **Verificar Deploy**

Após o deploy, sua aplicação estará disponível em:
```
https://seu-projeto.railway.app
```

#### Endpoints para testar:
```bash
# Health check
curl https://seu-projeto.railway.app/healthz

# API status
curl https://seu-projeto.railway.app/api/status

# Admin system overview (precisa autenticação)
curl https://seu-projeto.railway.app/api/admin/system/overview
```

## 🔧 Configurações Avançadas

### **Custom Domain** (Opcional)
1. Na Railway dashboard, vá em **Settings**
2. Clique em **Domains**
3. Adicione seu domínio customizado
4. Configure DNS CNAME apontando para Railway

### **Auto Deploy**
Railway automaticamente faz redeploy quando você faz push no repositório.

### **Logs e Monitoramento**
```bash
# Ver logs via CLI
railway logs

# Logs em tempo real
railway logs --follow
```

### **Database Connection**
Certifique-se que a string de conexão MongoDB está correta:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

## 🚨 Troubleshooting

### **Problema 1: Build Failed**
```bash
# Verificar logs de build
railway logs --deployment

# Comum: falta dependências build
# Solução: adicionar build dependencies no package.json
```

### **Problema 2: MongoDB Connection Failed**
```bash
# Verificar variáveis de ambiente
railway variables

# Testar conexão local
mongosh "sua_connection_string"
```

### **Problema 3: Puppeteer/Chrome Issues**
```bash
# Adicionar variáveis:
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### **Problema 4: Timeout na Inicialização**
```bash
# Aumentar timeout no railway.toml
healthcheckTimeout = 300
```

## 📊 Monitoramento Pós-Deploy

### **Métricas Disponíveis**
- CPU e Memória via Railway dashboard
- Logs da aplicação via Railway
- Métricas customizadas via endpoints da API

### **Endpoints de Monitoramento**
```bash
# System health
GET /healthz

# Admin overview
GET /api/admin/system/overview

# Performance stats
GET /api/admin/performance/stats

# Rate limiting stats
GET /api/admin/rate-limit/stats
```

### **Alerts Setup** (Recomendado)
1. Configure webhooks na Railway
2. Integre com Slack/Discord/Email
3. Monitor health checks automaticamente

## 💰 Custos

### **Railway Pricing**
- **Hobby Plan**: $5/mês + usage
- **Pro Plan**: $20/mês + usage
- Usage calculado por CPU/RAM/Network

### **MongoDB Atlas**
- **M0 (Free)**: 512MB storage, suficiente para começar
- **M2**: $9/mês, 2GB storage

### **Estimativa Total**
- **Desenvolvimento**: $0 (Railway trial + MongoDB free)
- **Produção Básica**: ~$15/mês
- **Produção Escalada**: $25-50/mês

## 🎯 Próximos Passos

Após deploy bem-sucedido:

1. **Testar todas as funcionalidades**
2. **Configurar domínio customizado**
3. **Setup monitoramento e alertas**
4. **Configurar backup automático**
5. **Integrar com canais adicionais**

## 🆘 Suporte

### **Links Úteis**
- [Railway Docs](https://docs.railway.app)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [WPPConnect Docs](https://docs.wppconnect.io)

### **Comandos Railway Úteis**
```bash
# Status do projeto
railway status

# Variáveis de ambiente
railway variables

# Abrir projeto no browser
railway open

# Connect to database
railway connect

# Logs
railway logs --follow
```

---

**Seu sistema de automação WPPConnect estará rodando na nuvem! 🚀**