import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './env';
import authRoutes from './routes/auth';
import meRoutes from './routes/me';
import usersRoutes from './routes/users';
import matchesRoutes from './routes/matches';
import threadsRoutes from './routes/threads';
import adminRoutes from './routes/admin';

export const createApp = () => {
  const app = express();
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/me', meRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/matches', matchesRoutes);
  app.use('/api/v1/threads', threadsRoutes);
  app.use('/api/v1/admin', adminRoutes);

  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
};

