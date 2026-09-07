const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initReminderScheduler } = require('./services/reminderScheduler');
const { ensureDevDemoAccounts } = require('./services/devDemoAccounts');

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // Keep first-run local development usable without requiring a separate seed process.
    if (env.NODE_ENV !== 'production') {
      await ensureDevDemoAccounts();
    }

    // 2. Initialize background cron scheduler
    initReminderScheduler();

    // 3. Start listening
    const PORT = env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 OneSpace Backend Server running in [${env.NODE_ENV}] mode on http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('💥 Fatal error during server startup:', error);
    process.exit(1);
  }
};

startServer();
