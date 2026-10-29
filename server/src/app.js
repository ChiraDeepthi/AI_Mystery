import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import mysteryRoutes from './routes/mysteryRoutes.js';
import verdictRoutes from './routes/verdictRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://192.168.1.28:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.clientOrigin.split(',').map(x => x.trim()), methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '32kb' }));
app.get('/api/v1/health', (_req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ success: mongoose.connection.readyState === 1, data: { api: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }, error: null }));
app.use('/api/v1/mysteries', mysteryRoutes);
app.use('/api/v1/mysteries', verdictRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
