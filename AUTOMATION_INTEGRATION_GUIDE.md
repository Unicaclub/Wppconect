# Guia de Integração - Sistema de Automação Avançado

Este guia explica como integrar e usar o novo sistema de automação implementado no WPPConnect Server, transformando-o em uma plataforma similar ao Zapi com recursos avançados.

## 🚀 Recursos Implementados

### 1. Sistema de Filas para Delays e Agendamentos
- **Localização**: `src/services/QueueService.ts`
- **Funcionalidades**:
  - Processamento assíncrono de jobs
  - Agendamento de mensagens com delay
  - Retry automático com backoff exponencial
  - Monitoramento de status dos jobs

### 2. Segmentação de Contatos
- **Localização**: `src/services/ContactSegmentationService.ts`
- **Funcionalidades**:
  - Criação de segmentos dinâmicos baseados em critérios
  - Segmentação automática por comportamento
  - Filtros avançados (tags, campos customizados, atividade)
  - Atualização automática de contagens

### 3. Templates de Mensagem com Variáveis Dinâmicas
- **Localização**: `src/services/MessageTemplateService.ts`
- **Funcionalidades**:
  - Variáveis dinâmicas: `{{name}}`, `{{phone}}`, `{{current_date}}`
  - Funções especiais: `{{capitalize(name)}}`, `{{if(condition, "true", "false")}}`
  - Preview de templates
  - Estatísticas de uso

### 4. Sistema de Analytics Completo
- **Localização**: `src/services/AnalyticsService.ts`
- **Funcionalidades**:
  - Dashboard com métricas principais
  - Analytics por automação
  - Analytics de contatos e mensagens
  - Comparações de período
  - Métricas de performance

### 5. Engine de Automação
- **Localização**: `src/services/AutomationEngine.ts`
- **Funcionalidades**:
  - Triggers: palavra-chave, agendamento, webhook, eventos
  - Ações: enviar mensagem, adicionar tags, delays, webhooks
  - Condições condicionais
  - Processamento em tempo real

### 6. Suporte Multi-canais
- **Localização**: `src/services/ChannelService.ts`
- **Canais suportados**:
  - WhatsApp (WPPConnect nativo)
  - Telegram
  - Instagram
  - SMS (Twilio, Nexmo, AWS SNS)
  - Email

## 📋 Pré-requisitos para Integração

### 1. Dependências do Node.js
Adicione ao `package.json`:

```json
{
  "dependencies": {
    "mongoose": "^8.16.5",
    "axios": "^1.11.0"
  }
}
```

### 2. Configuração do Banco MongoDB
Atualize `src/config.ts` para incluir conexão MongoDB:

```typescript
// Adicionar à configuração existente
mongodb: {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wppconnect',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
}
```

### 3. Inicialização do MongoDB
Crie `src/util/db/mongodb/connection.ts`:

```typescript
import mongoose from 'mongoose';
import config from '../../config';
import { logger } from '../../index';

export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};
```

## 🔧 Integração Passo a Passo

### Passo 1: Inicializar MongoDB
No arquivo `src/server.ts`, adicione antes da inicialização do servidor:

```typescript
import { connectMongoDB } from './util/db/mongodb/connection';
import { automationEngine } from './services/AutomationEngine';

// Antes do http.listen()
await connectMongoDB();

// Integrar AutomationEngine com WPPConnect
app.use((req: any, res: any, next: NextFunction) => {
  // Registrar cliente WhatsApp no AutomationEngine quando sessão iniciar
  if (req.client && req.session) {
    automationEngine.setWhatsAppClient(req.session, req.client);
  }
  next();
});
```

### Passo 2: Integrar com Webhook Existente
Modifique o middleware de webhook existente para processar automações:

```typescript
// No middleware de webhook existente
import { automationEngine } from '../services/AutomationEngine';

// Quando receber uma mensagem
if (data.event === 'onmessage' && data.data.body) {
  await automationEngine.processIncomingMessage(
    data.session, // userId (adaptar conforme necessário)
    data.session, // sessionId
    data.data.from,
    data.data.body,
    'text'
  );
}
```

### Passo 3: Configurar Variáveis de Ambiente
Adicione ao `.env`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/wppconnect

# Telegram Bot (opcional)
TELEGRAM_BOT_TOKEN=your_bot_token

# Instagram (opcional)
INSTAGRAM_ACCESS_TOKEN=your_access_token
INSTAGRAM_PAGE_ID=your_page_id
INSTAGRAM_VERIFY_TOKEN=your_verify_token

# SMS Providers (opcional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
```

## 📊 API Endpoints Disponíveis

### Automações
```
POST   /api/:userId/automations              - Criar automação
GET    /api/:userId/automations              - Listar automações
GET    /api/automations/:automationId        - Obter automação
PUT    /api/automations/:automationId        - Atualizar automação
DELETE /api/automations/:automationId        - Deletar automação
POST   /api/automations/:automationId/toggle - Ativar/desativar
POST   /api/automations/:automationId/test   - Testar automação
```

### Templates de Mensagem
```
POST /api/:userId/templates                  - Criar template
GET  /api/:userId/templates                  - Listar templates
POST /api/templates/:templateId/preview      - Preview do template
```

### Segmentos de Contatos
```
POST /api/:userId/segments                   - Criar segmento
GET  /api/:userId/segments                   - Listar segmentos
GET  /api/segments/:segmentId/contacts       - Contatos do segmento
```

### Analytics
```
GET /api/:userId/analytics/dashboard         - Dashboard principal
GET /api/automations/:automationId/analytics - Analytics da automação
GET /api/:userId/analytics/contacts          - Analytics de contatos
GET /api/:userId/analytics/messages          - Analytics de mensagens
```

### Webhooks Multi-canal
```
POST /api/webhook/whatsapp                   - Webhook WhatsApp nativo
POST /api/webhook/zapi                       - Webhook Z-API
POST /api/webhook/:userId/:sessionId/telegram - Webhook Telegram
POST /api/webhook/:userId/:sessionId/instagram - Webhook Instagram
```

## 🎯 Exemplos de Uso

### 1. Criar Automação de Boas-vindas
```javascript
const automation = {
  userId: "user123",
  name: "Boas-vindas",
  trigger: {
    type: "keyword",
    config: {
      keywords: ["oi", "olá", "hello"]
    }
  },
  actions: [
    {
      type: "send_message",
      config: {
        message: "Olá {{name}}! Bem-vindo(a) à nossa plataforma! Como posso ajudar?"
      }
    },
    {
      type: "add_tag",
      config: {
        tag: "leads"
      }
    }
  ]
};

// POST /api/user123/automations
```

### 2. Criar Template com Variáveis
```javascript
const template = {
  userId: "user123",
  name: "Confirmação de Pedido",
  content: "Olá {{name}}! Seu pedido #{{order_id}} foi confirmado e será entregue em {{delivery_date}}. Total: R$ {{total}}",
  messageType: "text",
  category: "utility"
};

// POST /api/user123/templates
```

### 3. Criar Segmento de Contatos Ativos
```javascript
const segment = {
  userId: "user123",
  name: "Contatos Ativos",
  description: "Contatos que interagiram nos últimos 30 dias",
  criteria: [
    {
      field: "lastInteraction",
      operator: "greater_than",
      value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  ]
};

// POST /api/user123/segments
```

## 🔍 Monitoramento e Debug

### Logs do Sistema
O sistema usa Winston para logging. Configure o nível de log em `config.ts`:

```typescript
log: {
  level: 'info', // 'silly' para debug completo
  logger: ['console', 'file']
}
```

### Métricas de Queue
```javascript
// GET /api/queue/stats
{
  "pending": 15,
  "processing": 3,
  "completed": 1250,
  "failed": 12
}
```

### Analytics Dashboard
```javascript
// GET /api/user123/analytics/dashboard
{
  "totalContacts": 5000,
  "activeContacts": 1200,
  "totalMessages": 25000,
  "totalAutomations": 12,
  "messageStats": {
    "sent": 15000,
    "delivered": 14500,
    "read": 12000,
    "failed": 500
  }
}
```

## 🛠 Personalização e Extensão

### Adicionar Novos Triggers
Edite `src/services/AutomationEngine.ts`:

```typescript
// Adicionar novo tipo de trigger
private async shouldTriggerAutomation(automation, contact, message) {
  switch (automation.trigger.type) {
    case 'custom_trigger':
      return this.checkCustomTrigger(automation.trigger.config, message);
    // ... outros triggers
  }
}
```

### Adicionar Novas Ações
```typescript
// Adicionar nova ação
private async executeAction(action, contact, automation, context) {
  switch (action.type) {
    case 'custom_action':
      await this.executeCustomAction(action, contact);
      break;
    // ... outras ações
  }
}
```

### Adicionar Novos Canais
Edite `src/services/ChannelService.ts` para adicionar novos provedores de mensagem.

## 📚 Próximos Passos

1. **Implementar Interface Web**: Criar dashboard React/Vue para gerenciar automações
2. **Adicionar Integrações CRM**: Conectar com Pipedrive, HubSpot, etc.
3. **Implementar A/B Testing**: Testar diferentes templates e estratégias
4. **Adicionar AI/ML**: Análise de sentimento, categorização automática
5. **Implementar Rate Limiting**: Controlar velocidade de envio por canal

## 🆘 Suporte e Troubleshooting

### Problemas Comuns

1. **MongoDB não conecta**: Verificar string de conexão e permissões
2. **Jobs não processam**: Verificar se QueueService está inicializado
3. **Webhooks não recebem**: Verificar URLs e configurações de rede
4. **Templates não renderizam**: Verificar sintaxe das variáveis `{{variavel}}`

### Debug Avançado
```bash
# Ativar logs detalhados
export LOG_LEVEL=silly

# Verificar jobs na queue
curl -X GET "http://localhost:21465/api/queue/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Testar automação específica
curl -X POST "http://localhost:21465/api/automations/AUTOMATION_ID/test" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contactId": "CONTACT_ID", "testData": {"name": "Teste"}}'
```

Este sistema transforma o WPPConnect Server em uma plataforma completa de automação multi-canal, similar ao Zapi, com recursos avançados de segmentação, templates dinâmicos e analytics detalhados.