# 🤖 WPPConnect Automation System

Transforme seu WPPConnect Server em uma plataforma completa de automação multi-canal, similar ao Zapi, com recursos avançados de marketing e atendimento.

## ✨ Recursos Implementados

### 🚀 **Sistema de Automação Avançado**
- **Triggers Inteligentes**: palavra-chave, agendamento, webhooks, eventos
- **Ações Complexas**: envio de mensagens, tags, delays, webhooks, arquivos
- **Condições Lógicas**: automações condicionais baseadas em dados do contato
- **Processamento em Tempo Real**: resposta instantânea a mensagens

### 📊 **Analytics e Métricas Completas**
- **Dashboard Executivo**: visão geral de performance
- **Métricas por Automação**: taxa de sucesso, execuções, ROI
- **Analytics de Contatos**: segmentação, engajamento, crescimento
- **Relatórios de Mensagens**: entrega, leitura, cliques

### 👥 **Segmentação Inteligente de Contatos**
- **Segmentos Dinâmicos**: critérios automáticos e personalizados
- **Comportamento Automático**: ativos, inativos, engajados, novos
- **Filtros Avançados**: tags, campos customizados, atividade recente
- **Atualização em Tempo Real**: contagens automáticas

### 📝 **Templates com Variáveis Dinâmicas**
- **Personalização Avançada**: `{{name}}`, `{{phone}}`, `{{current_date}}`
- **Funções Especiais**: `{{capitalize(name)}}`, `{{if(condition, "true", "false")}}`
- **Preview em Tempo Real**: visualização antes do envio
- **Estatísticas de Uso**: performance de cada template

### ⏰ **Sistema de Filas Profissional**
- **Agendamento Preciso**: delays e horários específicos
- **Retry Inteligente**: backoff exponencial para falhas
- **Priorização**: jobs críticos primeiro
- **Monitoramento**: status e métricas em tempo real

### 🌐 **Suporte Multi-canais**
- **WhatsApp**: integração nativa com WPPConnect
- **Telegram**: bots e mensagens diretas
- **Instagram**: Instagram Business API
- **SMS**: Twilio, Nexmo, AWS SNS
- **Email**: SMTP, SendGrid, Amazon SES

## 🎯 Casos de Uso

### **E-commerce**
```javascript
// Automação de carrinho abandonado
{
  trigger: { type: "webhook", config: { event: "cart_abandoned" } },
  actions: [
    { 
      type: "send_message", 
      config: { 
        message: "Olá {{name}}! Você esqueceu {{cart_items}} no seu carrinho. Finalize agora com 10% de desconto!" 
      }
    },
    { type: "delay", config: { delay: 3600000 } }, // 1 hora
    { 
      type: "send_message", 
      config: { 
        message: "⏰ Oferta expira em 2 horas! Use o cupom VOLTA10" 
      }
    }
  ]
}
```

### **Atendimento ao Cliente**
```javascript
// Distribuição inteligente de tickets
{
  trigger: { type: "keyword", config: { keywords: ["suporte", "ajuda", "problema"] } },
  conditions: [
    { field: "tags", operator: "contains", value: "vip" }
  ],
  actions: [
    { type: "add_tag", config: { tag: "suporte_prioritario" } },
    { 
      type: "webhook", 
      config: { 
        url: "https://crm.com/api/create-ticket",
        data: { priority: "high", customer: "{{phone}}" }
      }
    }
  ]
}
```

### **Marketing de Relacionamento**
```javascript
// Campanha de aniversário automática
{
  trigger: { type: "schedule", config: { type: "daily", time: "09:00" } },
  conditions: [
    { field: "customFields.birthday", operator: "equals", value: "{{current_date}}" }
  ],
  actions: [
    { 
      type: "send_message", 
      config: { 
        message: "🎉 Parabéns {{name}}! Hoje é seu aniversário! Ganhe 20% de desconto em qualquer produto." 
      }
    },
    { type: "add_tag", config: { tag: "aniversariante_2025" } }
  ]
}
```

## 📋 Guia Rápido de Instalação

### 1. **Setup Automático**
```bash
# Executar script de configuração
node setup-automation.js

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais
```

### 2. **Configuração Mínima (.env)**
```env
# Essencial para automação
MONGODB_URI=mongodb://localhost:27017/wppconnect_automation
SECRET_KEY=sua_chave_secreta_unica
AUTOMATION_ENABLED=true

# Opcional - Canais adicionais
TELEGRAM_BOT_TOKEN=seu_bot_token
INSTAGRAM_ACCESS_TOKEN=seu_access_token
```

### 3. **Iniciar Sistema**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start

# Testar funcionamento
npm run test:automation
```

## 🛠️ API Endpoints Principais

### **Automações**
```http
POST   /api/:userId/automations          # Criar automação
GET    /api/:userId/automations          # Listar automações
PUT    /api/automations/:id              # Atualizar automação
DELETE /api/automations/:id              # Deletar automação
POST   /api/automations/:id/test         # Testar automação
```

### **Templates**
```http
POST /api/:userId/templates              # Criar template
GET  /api/:userId/templates              # Listar templates
POST /api/templates/:id/preview          # Preview do template
```

### **Analytics**
```http
GET /api/:userId/analytics/dashboard     # Dashboard principal
GET /api/automations/:id/analytics       # Analytics da automação
GET /api/:userId/analytics/contacts      # Analytics de contatos
```

### **Webhooks Multi-canal**
```http
POST /api/webhook/whatsapp               # Webhook WhatsApp nativo
POST /api/webhook/zapi                   # Webhook Z-API
POST /api/webhook/:userId/:sessionId/telegram    # Webhook Telegram
POST /api/webhook/:userId/:sessionId/instagram   # Webhook Instagram
```

## 📊 Exemplos de Uso da API

### **Criar Automação de Boas-vindas**
```javascript
const automation = {
  userId: "user123",
  name: "Boas-vindas Automáticas",
  trigger: {
    type: "keyword",
    config: { keywords: ["oi", "olá", "hello", "começar"] }
  },
  actions: [
    {
      type: "send_message",
      config: {
        message: `🙋‍♀️ Olá {{name}}! Bem-vindo(a)!

Eu sou a assistente virtual da empresa. Como posso ajudar você hoje?

Digite:
• 📋 *PRODUTOS* - Ver nossos produtos
• 💰 *PREÇOS* - Consultar preços
• 📞 *CONTATO* - Falar com atendente
• ❓ *AJUDA* - Ver mais opções`
      }
    },
    { type: "add_tag", config: { tag: "lead_ativo" } },
    { type: "delay", config: { delay: 300000 } }, // 5 minutos
    {
      type: "send_message",
      config: {
        message: "Ainda está aí {{name}}? Se precisar de ajuda, é só chamar! 😊"
      }
    }
  ]
};

// POST /api/user123/automations
fetch('/api/user123/automations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer seu_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(automation)
});
```

### **Criar Template Promocional**
```javascript
const template = {
  userId: "user123",
  name: "Promoção Flash",
  content: `🔥 PROMOÇÃO FLASH {{name}}!

{{capitalize(product_name)}} com {{discount}}% de desconto!

💸 De: ~~R$ {{original_price}}~~
💰 Por: R$ {{final_price}}

⏰ Válido até {{current_date}} às 23:59h
🚀 Entrega grátis para sua região

{{if(is_premium, "🌟 Desconto VIP exclusivo para você!", "")}}

Para comprar, clique: {{product_url}}`,
  messageType: "text",
  category: "marketing"
};

// POST /api/user123/templates
```

### **Consultar Analytics**
```javascript
// GET /api/user123/analytics/dashboard
const response = await fetch('/api/user123/analytics/dashboard', {
  headers: { 'Authorization': 'Bearer seu_token' }
});

const analytics = await response.json();
console.log(`Automações executadas: ${analytics.data.automationExecutions}`);
console.log(`Taxa de conversão: ${analytics.data.conversionRate}%`);
```

## 🎨 Interface Web (Próximos Passos)

O sistema está pronto para integração com qualquer frontend. Exemplo React:

```jsx
// Componente de Automação
function AutomationBuilder() {
  const [automation, setAutomation] = useState({
    name: '',
    trigger: { type: 'keyword', config: { keywords: [] } },
    actions: []
  });

  const addAction = (type) => {
    const newAction = { type, config: {} };
    setAutomation(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
  };

  return (
    <div className="automation-builder">
      <h2>Criar Automação</h2>
      
      {/* Trigger Configuration */}
      <TriggerConfig 
        trigger={automation.trigger}
        onChange={(trigger) => setAutomation(prev => ({...prev, trigger}))}
      />
      
      {/* Actions List */}
      <ActionsList 
        actions={automation.actions}
        onAdd={addAction}
        onChange={(actions) => setAutomation(prev => ({...prev, actions}))}
      />
      
      <button onClick={() => saveAutomation(automation)}>
        Salvar Automação
      </button>
    </div>
  );
}
```

## 🚀 Roadmap

### **Em Desenvolvimento**
- [ ] **Dashboard Web Completo**: interface visual para gestão
- [ ] **A/B Testing**: testes de templates e estratégias
- [ ] **AI Integration**: análise de sentimento e categorização
- [ ] **Advanced CRM**: integração com Pipedrive, HubSpot, etc.

### **Próximas Funcionalidades**
- [ ] **Campanhas em Massa**: envio para segmentos
- [ ] **Chatbot Builder**: fluxos conversacionais visuais
- [ ] **E-commerce Integration**: carrinho abandonado, tracking
- [ ] **Advanced Analytics**: ROI, LTV, attribution modeling

## 📚 Documentação Completa

- **[Guia de Integração](./AUTOMATION_INTEGRATION_GUIDE.md)**: Como integrar o sistema
- **[Guia de Deploy](./DEPLOYMENT_GUIDE.md)**: Como fazer deploy em produção
- **[Claude Code Guide](./CLAUDE.md)**: Informações para desenvolvimento

## 🆘 Suporte

### **Problemas Comuns**

1. **MongoDB não conecta**: Verificar string de conexão no `.env`
2. **Automações não executam**: Verificar logs com `LOG_LEVEL=silly`
3. **Webhooks falham**: Testar conectividade e URLs
4. **Performance lenta**: Otimizar indexes do MongoDB

### **Debug e Troubleshooting**
```bash
# Logs detalhados
export LOG_LEVEL=silly
npm run dev

# Testar sistema
npm run test:automation

# Verificar queue
curl http://localhost:21465/api/queue/stats

# Health check
curl http://localhost:21465/healthz
```

### **Comunidade**

- **GitHub Issues**: [Reportar bugs](https://github.com/Unicaclub/Wppconect/issues)
- **Discord**: Discussões da comunidade WPPConnect
- **Telegram**: Grupo de desenvolvedores

---

**Transforme seu WhatsApp em uma máquina de conversão com automações inteligentes! 🚀**

*Sistema desenvolvido pela Unicaclub baseado no WPPConnect Server*