# MongoDB na Railway - Setup Completo

## 🎯 Método 1: MongoDB Atlas (RECOMENDADO)

### Vantagens:
- ✅ Gratuito até 512MB
- ✅ Backups automáticos
- ✅ Monitoramento integrado
- ✅ Alta disponibilidade
- ✅ Sem gerenciamento de servidor

### Setup MongoDB Atlas:

1. **Criar Conta**
   ```
   https://cloud.mongodb.com
   ```

2. **Criar Cluster**
   - Escolha "Create a deployment"
   - Selecione M0 (Free)
   - Região: AWS / us-east-1 (mais próximo Railway)
   - Nome: wppconnect-cluster

3. **Configurar Acesso**
   ```bash
   # Database Access:
   Username: wppconnect_user
   Password: [gere uma senha forte]
   
   # Network Access:
   IP Address: 0.0.0.0/0 (Allow access from anywhere)
   ```

4. **Obter Connection String**
   ```
   mongodb+srv://wppconnect_user:SUA_SENHA@wppconnect-cluster.xxxxx.mongodb.net/wppconnect_automation?retryWrites=true&w=majority
   ```

## 🐳 Método 2: MongoDB Container na Railway

### Setup via Railway Dashboard:

1. **Novo Serviço**
   - Railway Dashboard → "New Project"
   - "Empty Project"
   - "New Service" → "Database" → "Add MongoDB"

2. **Configuração Automática**
   A Railway criará automaticamente:
   - Container MongoDB
   - Variáveis de ambiente
   - Network interno

3. **Variáveis Geradas**
   ```env
   MONGO_URL=mongodb://mongo:27017/railway
   DATABASE_URL=mongodb://mongo:27017/railway
   ```

## 🔧 Método 3: MongoDB via Docker Compose

### Criar railway-compose.yml:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=admin123
      - MONGO_INITDB_DATABASE=wppconnect_automation
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"
    restart: unless-stopped

  wppconnect:
    build: .
    environment:
      - MONGODB_URI=mongodb://admin:admin123@mongodb:27017/wppconnect_automation?authSource=admin
      - SECRET_KEY=sua_chave_secreta_forte
      - AUTOMATION_ENABLED=true
    ports:
      - "21465:21465"
    depends_on:
      - mongodb
    restart: unless-stopped

volumes:
  mongo_data:
```

## 📊 Comparação de Métodos

| Método | Custo | Facilidade | Performance | Backup |
|--------|-------|------------|-------------|---------|
| **Atlas** | Gratuito/Pago | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Railway DB** | ~$5/mês | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Container** | ~$3/mês | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

## 🚀 Setup Recomendado para Produção

### 1. MongoDB Atlas + Railway App
```env
# Railway Variables
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/wppconnect_automation
SECRET_KEY=sua_chave_super_secreta_32_chars_min
AUTOMATION_ENABLED=true
NODE_ENV=production
```

### 2. Configurar Connection Resiliente
```typescript
// src/util/db/mongodb/connection.ts
const connectOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  retryReads: true
};
```

## 🔍 Verificar Conexão

### Teste Local:
```bash
# Testar connection string
mongosh "sua_connection_string"

# Via Node.js
node -e "
const mongoose = require('mongoose');
mongoose.connect('sua_connection_string')
  .then(() => console.log('✅ MongoDB conectado!'))
  .catch(err => console.error('❌ Erro:', err));
"
```

### Teste na Railway:
```bash
# Logs da aplicação
railway logs --follow

# Verificar variáveis
railway variables

# Health check
curl https://seu-app.railway.app/healthz
```

## 💰 Custos Estimados

### MongoDB Atlas:
- **M0 (Free)**: 512MB, 100 conexões simultâneas
- **M2**: $9/mês, 2GB, conexões ilimitadas
- **M5**: $25/mês, 5GB, performance otimizada

### Railway + Atlas:
- **Total Desenvolvimento**: $0 (Atlas M0 + Railway trial)
- **Total Produção**: $5-15/mês (Railway + Atlas M2)

## 🎯 Recomendação Final

**Para seu caso (WPPConnect Automation):**

1. **Comece com MongoDB Atlas M0** (gratuito)
2. **Deploy app na Railway** ($5/mês)
3. **Upgrade Atlas quando necessário**

### Configuração Completa:
```env
# Railway Environment Variables
MONGODB_URI=mongodb+srv://wppconnect_user:SUA_SENHA@cluster.mongodb.net/wppconnect_automation?retryWrites=true&w=majority&maxPoolSize=10
SECRET_KEY=chave_secreta_forte_minimo_32_caracteres
AUTOMATION_ENABLED=true
NODE_ENV=production
PORT=21465
LOG_LEVEL=info
RATE_LIMIT_MESSAGES_PER_MINUTE=30
CACHE_ENABLED=true
```

Isso te dará um sistema completo, escalável e confiável! 🚀