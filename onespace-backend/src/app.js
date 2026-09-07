const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const env = require('./config/env');
const errorHandler = require('./middlewares/errorHandler');
const rateLimiter = require('./middlewares/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const noteRoutes = require('./routes/noteRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const documentRoutes = require('./routes/documentRoutes');
const dailyActivityRoutes = require('./routes/dailyActivityRoutes');
const fitnessRoutes = require('./routes/fitnessRoutes');
const goalRoutes = require('./routes/goalRoutes');
const searchRoutes = require('./routes/searchRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Global Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(morgan('dev'));
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 500 }));

// Static uploads serving
app.use('/uploads', express.static(env.UPLOAD_DIR));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'OneSpace Backend API'
  });
});

// Mount Routes (supporting standard PRD names)
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/events', calendarRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/daily-activity', dailyActivityRoutes);
app.use('/api/daily-activities', dailyActivityRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
