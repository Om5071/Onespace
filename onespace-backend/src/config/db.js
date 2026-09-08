const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

let mongodInstance = null;

// Set reliable DNS servers if connecting to MongoDB Atlas SRV URI on Windows
if (env.MONGODB_URI && env.MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (dnsErr) {
    console.warn('[MongoDB] Could not set custom DNS servers:', dnsErr.message);
  }
}

const getMaskedUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/:([^@]+)@/, ':****@');
};

const connectDB = async () => {
  const maskedUri = getMaskedUri(env.MONGODB_URI);
  try {
    // Attempt connecting to specified MONGODB_URI with a 10-second timeout
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`[MongoDB] Connected successfully to Atlas/External database: ${maskedUri}`);
  } catch (err) {
    console.warn(`[MongoDB] Atlas connection to ${maskedUri} failed: ${err.message}`);
    console.log('[MongoDB] Spinning up in-memory MongoDB server as fallback...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      
      await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to in-memory instance at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Failed to start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected.');
  });
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
