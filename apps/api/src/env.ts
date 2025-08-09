import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  API_PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  ALLOWED_EMAIL_DOMAIN: z.string().default('ucsc.edu'),
  JWT_SECRET: z.string().min(10),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
  API_BASE_URL: z.string().default('http://localhost:4000'),
  ADMIN_EMAILS: z.string().optional()
});

export const env = envSchema.parse(process.env);

export const isAdminEmail = (email: string) => {
  const list = env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];
  return list.includes(email.toLowerCase());
};

