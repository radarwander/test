import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import customersRoutes from './routes/customers.routes';
import leadsRoutes from './routes/leads.routes';
import opportunitiesRoutes from './routes/opportunities.routes';
import logsRoutes from './routes/logs.routes';
import statsRoutes from './routes/stats.routes';
import { errorHandler } from './middlewares/error';
import { ok } from './utils/response';

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 200 }));

app.get('/health', (_req, res) => res.json(ok({ status: 'ok' })));
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/customers', customersRoutes);
app.use('/leads', leadsRoutes);
app.use('/opportunities', opportunitiesRoutes);
app.use('/logs', logsRoutes);
app.use('/stats', statsRoutes);

app.use(errorHandler);
