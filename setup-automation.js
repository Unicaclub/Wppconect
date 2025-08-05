#!/usr/bin/env node

/**
 * WPPConnect Automation Setup Script
 * 
 * This script helps set up the automation system for WPPConnect Server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 WPPConnect Automation System Setup');
console.log('=====================================\n');

async function main() {
  try {
    // Check Node.js version
    checkNodeVersion();
    
    // Install dependencies
    await installDependencies();
    
    // Setup environment
    setupEnvironment();
    
    // Check MongoDB
    checkMongoDB();
    
    // Show completion message
    showCompletionMessage();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  console.log(`📋 Checking Node.js version: ${nodeVersion}`);
  
  if (majorVersion < 18) {
    throw new Error('Node.js 18 or higher is required. Please upgrade your Node.js version.');
  }
  
  console.log('✅ Node.js version is compatible\n');
}

async function installDependencies() {
  console.log('📦 Installing dependencies...');
  
  try {
    // Check if mongoose is already installed
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (!packageJson.dependencies.mongoose) {
      console.log('Installing mongoose...');
      execSync('npm install mongoose@^8.16.5', { stdio: 'inherit' });
    }
    
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    throw new Error(`Failed to install dependencies: ${error.message}`);
  }
}

function setupEnvironment() {
  console.log('⚙️  Setting up environment configuration...');
  
  const envPath = '.env';
  const envExamplePath = '.env.example';
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('📝 Created .env file from .env.example');
    } else {
      // Create basic .env file
      const basicEnv = `# WPPConnect Server with Automation
PORT=21465
SECRET_KEY=CHANGE_THIS_SECRET_KEY_${Date.now()}

# Automation System
AUTOMATION_ENABLED=true
MONGODB_URI=mongodb://localhost:27017/wppconnect_automation

# Logging
LOG_LEVEL=info
`;
      fs.writeFileSync(envPath, basicEnv);
      console.log('📝 Created basic .env file');
    }
  } else {
    console.log('ℹ️  .env file already exists');
  }
  
  console.log('✅ Environment configuration ready\n');
}

function checkMongoDB() {
  console.log('🔍 Checking MongoDB...');
  
  try {
    // Try to connect to MongoDB (basic check)
    execSync('mongosh --version', { stdio: 'ignore' });
    console.log('✅ MongoDB CLI tools found');
  } catch (error) {
    console.log('⚠️  MongoDB CLI tools not found');
    console.log('   Please install MongoDB or use a cloud service like MongoDB Atlas');
  }
  
  console.log('');
}

function showCompletionMessage() {
  console.log('🎉 Setup completed successfully!');
  console.log('================================\n');
  
  console.log('📋 Next steps:');
  console.log('1. Configure your .env file with proper values');
  console.log('2. Make sure MongoDB is running (local or cloud)');
  console.log('3. Start the server: npm run dev');
  console.log('');
  
  console.log('🔗 Available automation endpoints:');
  console.log('   • POST /api/:userId/automations - Create automation');
  console.log('   • GET  /api/:userId/automations - List automations');
  console.log('   • POST /api/:userId/templates - Create message template');
  console.log('   • GET  /api/:userId/analytics/dashboard - View analytics');
  console.log('');
  
  console.log('📚 Documentation:');
  console.log('   • Integration Guide: ./AUTOMATION_INTEGRATION_GUIDE.md');
  console.log('   • Claude Code Guide: ./CLAUDE.md');
  console.log('');
  
  console.log('🚀 Ready to build amazing automations!');
}

// Run the setup
main();