import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { sequelize } from './models/index.js';
import setupSwagger from './config/swagger.js';
import v1Routes from './routes/v1/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Swagger UI Documentation
setupSwagger(app);

// Standard Security & Utility Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(morgan('dev'));
app.use(cookieParser());

// Serve static files from public directory
app.use(express.static('public'));

// Base Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to RokKru Backend API Server!',
    status: 'Running',
    timestamp: new Date()
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'UP',
      database: 'Connected',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      database: 'Disconnected',
      error: error.message
    });
  }
});
                  
// API Routes
app.use('/api/v1', v1Routes);

// Connect to Database and start server
async function startServer() {
  try {
    console.log('Authenticating database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    console.log('Synchronizing database models...');
    // Only creates missing tables, doesn't modify existing ones
    await sequelize.sync();
    console.log('✅ Database synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🔗 Health check available at http://localhost:${PORT}/health`);
      console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
