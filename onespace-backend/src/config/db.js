const mongoose = require('mongoose');
const env = require('./env');

let mongodInstance = null;

const connectDB = async () => {
  try {
    // Attempt connecting to specified MONGODB_URI with a 2-second timeout
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Connected successfully to: ${env.MONGODB_URI}`);
  } catch (err) {
    console.warn(`[MongoDB] External connection to ${env.MONGODB_URI} failed: ${err.message}`);
    console.log('[MongoDB] Spinning up in-memory MongoDB server for zero-config local development...');
    
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
