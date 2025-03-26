import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
});

// Parse environment variables
const parsed = envSchema.safeParse({
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/aicd',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
});

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

// Export validated environment variables
export const env = {
  ...parsed.data,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Export type for environment variables
export type Env = typeof env; 