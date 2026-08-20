// worker/dev-server.js
// Runs the Hono backend API directly on Node.js using @hono/node-server

import { serve } from '@hono/node-server';
import app from './src/index.js';

// Environment variables
const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DATABASE: "unity_a_live_group",
  MONGODB_COLLECTION: "registrations",
  CLOUDINARY_CLOUD_NAME: "pplcot0h",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  SESSION_SECRET: process.env.SESSION_SECRET,
  PUBLIC_BASE_URL: "http://localhost:5173",
  ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:4173",
};

// Middleware to inject env into Hono context for Node environment
app.use('*', async (c, next) => {
  c.env = { ...env, ...process.env, ...c.env };
  await next();
});

const port = 8787;
console.log(`🚀 UNITY A LIVE GROUP API Server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
