import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import wellnessRoutes from './routes/wellnessRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

import { startReminderScheduler } from './services/notificationService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin === FRONTEND_URL || FRONTEND_URL === '*') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MateoMind REST API',
    time: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MateoMind Mental Health Backend API',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/assessments',
      '/api/doctors',
      '/api/chat',
      '/api/wellness',
      '/api/payments'
    ]
  });
});

// Start Server listening on 0.0.0.0 for container / Render compatibility
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 MateoMind Backend Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================`);
  
  // Start 10-Minute Pre-Meeting Reminder Engine
  startReminderScheduler();
});

