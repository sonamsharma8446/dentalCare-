import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(helmet());

// Only the frontend may call this API; credentials allows the auth cookie (Phase 2)
app.use(cors({ origin: env.clientUrl, credentials: true }));

// Body and cookie parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// All API routes live under /api/v1
app.use('/api/v1', routes);

// These two must stay last
app.use(notFound);
app.use(errorHandler);

export default app;
