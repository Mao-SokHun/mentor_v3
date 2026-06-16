import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';
import setupSwagger from './config/swagger.js';
import mentorRoutes from './routes/v1/mentor/mentors.js';

dotenv.config();
import authRoutes from './routes/v1/auth/auth.js';
import userTypesRouter from './routes/v1/userTypes.js';
import stripeRoutes from './routes/v1/stripe.js';
import { stripeWebhook } from './controllers/stripe/stripeWebhook.js';

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

// Stripe webhook must receive the raw body for signature verification
app.post(
  '/api/v1/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook,
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// Health check and database connectivity verification route
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
app.use('/api/v1/', mentorRoutes);
app.use('/api/v1/user-types', userTypesRouter);

// Auth
app.use('/api/v1/auth', authRoutes);

// Stripe payments
app.use('/api/v1/stripe', stripeRoutes);

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
    });
  } catch (error) {
    console.error('❌ Failed to start server due to database connection issue:', error);
    process.exit(1);
  }
}

startServer();

