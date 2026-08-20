// worker/dev-server.js
// Runs the Hono backend API directly on Node.js using @hono/node-server

import { serve } from '@hono/node-server';
import app from './src/index.js';

// Environment variables
const env = {
  MONGODB_URI: "mongodb+srv://manan:manan0112@cluster0.gndr5q0.mongodb.net/?retryWrites=true&w=majority",
  MONGODB_DATABASE: "unity_a_live_group",
  MONGODB_COLLECTION: "registrations",
  CLOUDINARY_CLOUD_NAME: "pplcot0h",
  CLOUDINARY_API_KEY: "953761345214678",
  CLOUDINARY_API_SECRET: "tG-Kv7U9n8fPK-juJZXOf9PDL20",
  ADMIN_USERNAME: "ganpatibapamorya",
  ADMIN_PASSWORD_HASH: "03f48f6d87ab3a32b242e407b840c21c2adc98b5c9e6bbc6ec5dff8da78ec00e",
  SESSION_SECRET: "ualg_super_secret_session_key_2026_unity_a_live_group",
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
