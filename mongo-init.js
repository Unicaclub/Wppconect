// MongoDB Initialization Script
// Executed when container starts for the first time

// Switch to the wppconnect_automation database
db = db.getSiblingDB('wppconnect_automation');

// Create application user
db.createUser({
  user: 'wppconnect_user',
  pwd: process.env.MONGO_USER_PASSWORD || 'wpp123',
  roles: [
    {
      role: 'readWrite',
      db: 'wppconnect_automation'
    }
  ]
});

// Create collections with indexes for better performance
db.createCollection('automations');
db.automations.createIndex({ userId: 1, isActive: 1 });
db.automations.createIndex({ userId: 1, name: 1 }, { unique: true });

db.createCollection('contacts');
db.contacts.createIndex({ userId: 1, phone: 1 }, { unique: true });
db.contacts.createIndex({ userId: 1, tags: 1 });
db.contacts.createIndex({ userId: 1, lastInteraction: -1 });

db.createCollection('conversation_messages');
db.conversation_messages.createIndex({ userId: 1, sessionId: 1, timestamp: -1 });
db.conversation_messages.createIndex({ userId: 1, contactId: 1, timestamp: -1 });

db.createCollection('message_templates');
db.message_templates.createIndex({ userId: 1, name: 1 }, { unique: true });
db.message_templates.createIndex({ userId: 1, category: 1 });

db.createCollection('contact_segments');
db.contact_segments.createIndex({ userId: 1, name: 1 }, { unique: true });

db.createCollection('analytics');
db.analytics.createIndex({ userId: 1, entityType: 1, entityId: 1, timestamp: -1 });
db.analytics.createIndex({ userId: 1, metric: 1, timestamp: -1 });

db.createCollection('queue_jobs');
db.queue_jobs.createIndex({ status: 1, scheduledFor: 1 });
db.queue_jobs.createIndex({ userId: 1, type: 1, status: 1 });

print('✅ Database wppconnect_automation initialized successfully');
print('👤 User wppconnect_user created with readWrite permissions');
print('📊 Collections and indexes created for optimal performance');