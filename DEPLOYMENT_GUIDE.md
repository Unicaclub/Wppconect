# 🚀 Guia de Deploy - WPPConnect Automation System

Este guia fornece instruções detalhadas para fazer o deploy do sistema de automação do WPPConnect em diferentes ambientes.

## 📋 Pré-requisitos

### Requisitos do Sistema
- **Node.js**: 18.x ou superior
- **MongoDB**: 5.0 ou superior (local ou cloud)
- **Memória RAM**: Mínimo 2GB, recomendado 4GB+
- **Armazenamento**: Mínimo 10GB de espaço livre
- **Rede**: Portas 21465 (API) e 27017 (MongoDB local)

### Dependências Opcionais
- **Redis**: Para cache avançado e sessões distribuídas
- **Docker**: Para containerização
- **Nginx**: Para proxy reverso e SSL

## 🔧 Instalação Rápida

### 1. Clonar e Configurar
```bash
# Navegar para o diretório do projeto
cd wppconnect-server

# Instalar dependências
npm install

# Executar setup automatizado
node setup-automation.js

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações
```

### 2. Configurar MongoDB

#### Opção A: MongoDB Local
```bash
# Instalar MongoDB (Ubuntu/Debian)
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Opção B: MongoDB Atlas (Cloud)
1. Criar conta em [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Criar cluster gratuito
3. Obter string de conexão
4. Configurar no `.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/wppconnect_automation
```

### 3. Iniciar o Sistema
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm run build
npm start

# Testar funcionamento
node test-automation.js
```

## 🐳 Deploy com Docker

### 1. Dockerfile para Produção
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S wppconnect -u 1001

USER wppconnect

EXPOSE 21465

CMD ["node", "dist/server.js"]
```

### 2. Docker Compose Completo
```yaml
version: '3.8'

services:
  wppconnect:
    build: .
    ports:
      - "21465:21465"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/wppconnect_automation
      - SECRET_KEY=your_super_secret_key
      - AUTOMATION_ENABLED=true
    depends_on:
      - mongo
    volumes:
      - ./tokens:/app/tokens
      - ./userDataDir:/app/userDataDir
    restart: unless-stopped

  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
```

### 3. Executar com Docker
```bash
# Construir e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f wppconnect

# Parar serviços
docker-compose down
```

## 🌐 Deploy em Cloud

### Deploy no Railway

1. **Configurar repositório**:
```bash
# Adicionar railway.toml (já existe)
git add .
git commit -m "Add automation system"
git push origin main
```

2. **Configurar variáveis no Railway**:
```env
MONGODB_URI=sua_connection_string_mongodb_atlas
SECRET_KEY=sua_chave_secreta_unica
AUTOMATION_ENABLED=true
PORT=21465
```

3. **Deploy automático** via GitHub integration

### Deploy no Heroku

1. **Preparar aplicação**:
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login e criar app
heroku login
heroku create seu-app-wppconnect
```

2. **Configurar add-ons**:
```bash
# MongoDB Atlas (recomendado) ou mLab
heroku addons:create mongolab:sandbox

# Redis (opcional)
heroku addons:create heroku-redis:hobby-dev
```

3. **Configurar variáveis**:
```bash
heroku config:set SECRET_KEY=sua_chave_secreta
heroku config:set AUTOMATION_ENABLED=true
```

4. **Deploy**:
```bash
git push heroku main
```

### Deploy no VPS (Ubuntu)

1. **Preparar servidor**:
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 para gerenciamento de processos
sudo npm install -g pm2
```

2. **Configurar aplicação**:
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/wppconnect-server.git
cd wppconnect-server

# Instalar dependências e buildar
npm install
npm run build

# Configurar .env com variáveis de produção
```

3. **Configurar PM2**:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'wppconnect-automation',
    script: 'dist/server.js',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      PORT: 21465
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

4. **Iniciar com PM2**:
```bash
# Iniciar aplicação
pm2 start ecosystem.config.js --env production

# Configurar inicialização automática
pm2 startup
pm2 save
```

5. **Configurar Nginx** (opcional):
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:21465;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoramento e Manutenção

### Logs e Debugging
```bash
# Ver logs em tempo real
tail -f log/app.log

# Verificar status do sistema
curl http://localhost:21465/api/queue/stats

# Testar automações
node test-automation.js
```

### Métricas e Health Checks
```bash
# Health check endpoint
curl http://localhost:21465/healthz

# Métricas Prometheus
curl http://localhost:21465/metrics

# Analytics dashboard
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:21465/api/user123/analytics/dashboard
```

### Backup e Recuperação

#### Backup MongoDB
```bash
# Backup local
mongodump --uri="mongodb://localhost:27017/wppconnect_automation" --out=./backup

# Backup Atlas
mongodump --uri="sua_connection_string" --out=./backup

# Automatizar backup diário
crontab -e
# 0 2 * * * /usr/bin/mongodump --uri="connection_string" --out=/backup/$(date +\%Y\%m\%d)
```

#### Restaurar Backup
```bash
# Restaurar local
mongorestore --uri="mongodb://localhost:27017/wppconnect_automation" ./backup/wppconnect_automation

# Restaurar Atlas
mongorestore --uri="sua_connection_string" ./backup/wppconnect_automation
```

## 🔐 Segurança

### Configurações Essenciais
```env
# .env - Configurações de segurança
SECRET_KEY=chave_complexa_com_pelo_menos_32_caracteres
WEBHOOK_SECRET=secret_para_validacao_de_webhooks

# Rate limiting
RATE_LIMIT_MESSAGES_PER_MINUTE=30

# CORS (produção)
CORS_ORIGIN=https://seu-dominio.com
```

### Firewall (UFW - Ubuntu)
```bash
# Permitir apenas portas necessárias
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 21465 # WPPConnect API
sudo ufw enable
```

### SSL/HTTPS com Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo crontab -e
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **MongoDB não conecta**:
   - Verificar string de conexão
   - Testar conectividade: `mongosh "sua_connection_string"`
   - Verificar firewall e portas

2. **Jobs não processam**:
   - Verificar logs: `tail -f log/app.log`
   - Testar queue: `curl /api/queue/stats`
   - Reiniciar aplicação

3. **Webhooks não funcionam**:
   - Verificar URL e conectividade
   - Testar endpoint: `curl -X POST webhook_url`
   - Verificar logs de erro

4. **Alta utilização de memória**:
   - Ajustar `maxListeners` em config
   - Implementar rate limiting
   - Otimizar queries MongoDB

### Comandos de Debug
```bash
# Status completo do sistema
pm2 monit

# Logs detalhados
export LOG_LEVEL=silly
npm run dev

# Verificar conexões
netstat -tlnp | grep :21465
netstat -tlnp | grep :27017

# Testar performance
ab -n 100 -c 10 http://localhost:21465/healthz
```

## 📈 Otimização de Performance

### Configurações Recomendadas

#### Para Alto Volume (>1000 mensagens/dia)
```env
# .env otimizado
QUEUE_PROCESS_INTERVAL=2000
MAX_LISTENERS=50
MONGODB_URI=mongodb://localhost:27017/wppconnect?maxPoolSize=20
```

#### MongoDB Indexes
```javascript
// Criar indexes para performance
db.automations.createIndex({ userId: 1, isActive: 1 })
db.contacts.createIndex({ userId: 1, phone: 1 }, { unique: true })
db.conversation_messages.createIndex({ userId: 1, timestamp: -1 })
db.queue_jobs.createIndex({ status: 1, scheduledFor: 1 })
```

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. **Configurar primeiro usuário** e criar automações de teste
2. **Integrar com webhooks** existentes do WhatsApp
3. **Configurar canais adicionais** (Telegram, Instagram)
4. **Implementar dashboard web** para gerenciamento visual
5. **Configurar alertas** para monitoramento proativo

Com este guia, seu sistema de automação WPPConnect estará pronto para produção! 🚀