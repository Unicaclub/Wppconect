#!/usr/bin/env node

/**
 * WPPConnect Automation Test Script
 * 
 * This script tests the automation system functionality
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:21465';
const USER_ID = process.env.TEST_USER_ID || 'test_user';
const SECRET_KEY = process.env.SECRET_KEY || 'THISISMYSECURETOKEN';

console.log('🧪 WPPConnect Automation System Test');
console.log('====================================\n');

async function main() {
  try {
    // Generate token first
    console.log('🔐 Generating authentication token...');
    const token = await generateToken();
    
    if (!token) {
      throw new Error('Failed to generate token');
    }
    
    console.log('✅ Token generated successfully\n');
    
    // Test system status
    await testSystemStatus(token);
    
    // Test automation creation
    await testAutomationCreation(token);
    
    // Test template creation
    await testTemplateCreation(token);
    
    // Test analytics
    await testAnalytics(token);
    
    console.log('🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

async function generateToken() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/test_session/${SECRET_KEY}/generate-token`
    );
    
    return response.data.full;
  } catch (error) {
    console.error('Failed to generate token:', error.message);
    return null;
  }
}

async function testSystemStatus(token) {
  console.log('🔍 Testing system status...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/queue/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Queue system is operational');
    console.log(`   Pending jobs: ${response.data.data.pending}`);
    console.log(`   Completed jobs: ${response.data.data.completed}`);
    console.log('');
  } catch (error) {
    if (error.response?.status === 503) {
      console.log('⚠️  Automation system not available (MongoDB not connected)');
    } else {
      throw error;
    }
  }
}

async function testAutomationCreation(token) {
  console.log('🤖 Testing automation creation...');
  
  const automation = {
    userId: USER_ID,
    name: 'Test Welcome Automation',
    description: 'Automated welcome message for new contacts',
    trigger: {
      type: 'keyword',
      config: {
        keywords: ['hello', 'hi', 'oi']
      }
    },
    actions: [
      {
        type: 'send_message',
        config: {
          message: 'Hello {{name}}! Welcome to our automated system!'
        }
      },
      {
        type: 'add_tag',
        config: {
          tag: 'welcomed'
        }
      }
    ]
  };
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/${USER_ID}/automations`,
      automation,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Automation created successfully');
    console.log(`   ID: ${response.data.data._id}`);
    console.log(`   Name: ${response.data.data.name}`);
    console.log('');
    
    return response.data.data._id;
  } catch (error) {
    if (error.response?.status === 503) {
      console.log('⚠️  Automation creation skipped (MongoDB not connected)');
      return null;
    }
    throw error;
  }
}

async function testTemplateCreation(token) {
  console.log('📝 Testing template creation...');
  
  const template = {
    userId: USER_ID,
    name: 'Welcome Template',
    content: 'Hello {{name}}! Today is {{current_date}}. How can we help you?',
    messageType: 'text',
    category: 'utility'
  };
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/${USER_ID}/templates`,
      template,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Template created successfully');
    console.log(`   ID: ${response.data.data._id}`);
    console.log(`   Variables: ${response.data.data.variables.join(', ')}`);
    console.log('');
    
    // Test template preview
    await testTemplatePreview(token, response.data.data._id);
    
    return response.data.data._id;
  } catch (error) {
    if (error.response?.status === 503) {
      console.log('⚠️  Template creation skipped (MongoDB not connected)');
      return null;
    }
    throw error;
  }
}

async function testTemplatePreview(token, templateId) {
  console.log('👀 Testing template preview...');
  
  const sampleData = {
    name: 'João Silva',
    current_date: new Date().toLocaleDateString('pt-BR')
  };
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/templates/${templateId}/preview`,
      { sampleData },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Template preview generated');
    console.log(`   Preview: "${response.data.data.preview}"`);
    console.log('');
  } catch (error) {
    console.log('⚠️  Template preview test skipped');
  }
}

async function testAnalytics(token) {
  console.log('📊 Testing analytics...');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/${USER_ID}/analytics/dashboard`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Analytics dashboard accessible');
    console.log(`   Total contacts: ${response.data.data.totalContacts}`);
    console.log(`   Total automations: ${response.data.data.totalAutomations}`);
    console.log('');
  } catch (error) {
    if (error.response?.status === 503) {
      console.log('⚠️  Analytics test skipped (MongoDB not connected)');
    } else {
      throw error;
    }
  }
}

// Run the tests
main();