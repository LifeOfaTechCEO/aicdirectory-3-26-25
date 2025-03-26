import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment variables with type checking
export const env = {
  // Admin Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
  ADMIN_USERNAME: process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'change-in-production',

  // MongoDB Connection
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/aicd',

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Export type for environment variables
export type Env = typeof env; 