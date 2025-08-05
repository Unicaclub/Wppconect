#!/usr/bin/env node

/**
 * Script para testar conexão MongoDB
 * Execute: node test-mongodb-connection.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Railway compatibility - try multiple env variables
const MONGODB_URI = process.env.MONGODB_URI || 
                   process.env.DATABASE_URL || 
                   process.env.MONGO_URL || 
                   process.env.MONGOURL ||
                   'mongodb://localhost:27017/wppconnect_automation';

console.log('🔄 Testando conexão MongoDB...');
console.log('📍 URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

async function testConnection() {
  try {
    // Configurações de conexão otimizadas
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true
    };

    console.log('⏳ Conectando...');
    await mongoose.connect(MONGODB_URI, options);
    
    console.log('✅ MongoDB conectado com sucesso!');
    
    // Testar operações básicas
    console.log('🧪 Testando operações...');
    
    // Listar databases
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('📊 Databases disponíveis:', dbs.databases.map(db => db.name));
    
    // Testar escrita
    const TestModel = mongoose.model('ConnectionTest', new mongoose.Schema({
      timestamp: { type: Date, default: Date.now },
      message: String
    }));
    
    const testDoc = new TestModel({ message: 'Connection test successful' });
    await testDoc.save();
    console.log('✍️ Teste de escrita: OK');
    
    // Testar leitura
    const docs = await TestModel.find().limit(1);
    console.log('📖 Teste de leitura: OK');
    
    // Limpar teste
    await TestModel.deleteMany({});
    console.log('🧹 Limpeza: OK');
    
    console.log('🎉 Todas as operações funcionaram perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n💡 Dicas para resolver:');
      console.log('1. Verifique se a URI está correta');
      console.log('2. Confirme usuário e senha');
      console.log('3. Verifique Network Access (IP 0.0.0.0/0)');
      console.log('4. Teste conectividade de rede');
    }
    
    if (error.name === 'MongoParseError') {
      console.log('\n💡 URI malformada - verifique o formato');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Conexão encerrada');
  }
}

// Timeout para o teste
const timeout = setTimeout(() => {
  console.error('⏰ Timeout - conexão demorou mais que 30 segundos');
  process.exit(1);
}, 30000);

testConnection().then(() => {
  clearTimeout(timeout);
  process.exit(0);
});