// worker/dev-server.js
// Runs the Hono backend API directly on Node.js using @hono/node-server
// Includes local D1 mock store for seamless local testing without Miniflare.

import { serve } from '@hono/node-server';
import app from './src/index.js';

// In-memory / mock D1 store for local development
const mockGalleryStore = [];
let nextId = 1;

const mockD1 = {
  isMock: true,
  prepare(sql) {
    let boundParams = [];
    return {
      bind(...params) {
        boundParams = params;
        return this;
      },
      async all() {
        if (sql.includes('SELECT id, title')) {
          const limit = boundParams[0] || 20;
          const offset = boundParams[1] || 0;
          const sorted = [...mockGalleryStore].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          const sliced = sorted.slice(offset, offset + limit);
          return { results: sliced };
        }
        return { results: [] };
      },
      async first() {
        if (sql.includes('COUNT(*)')) {
          return { total: mockGalleryStore.length };
        }
        if (sql.includes('SELECT id, public_id')) {
          const id = boundParams[0];
          return mockGalleryStore.find((item) => item.id === id) || null;
        }
        return null;
      },
      async run() {
        if (sql.includes('INSERT INTO gallery_images')) {
          const [title, image_url, public_id, asset_id, original_filename, file_size, media_type] = boundParams;
          const record = {
            id: nextId++,
            title,
            image_url,
            public_id,
            asset_id,
            original_filename,
            file_size,
            media_type: media_type || 'image',
            created_at: new Date().toISOString(),
          };
          mockGalleryStore.push(record);
          return { meta: { last_row_id: record.id } };
        }
        if (sql.includes('DELETE FROM gallery_images')) {
          const id = boundParams[0];
          const idx = mockGalleryStore.findIndex((item) => item.id === id);
          if (idx !== -1) mockGalleryStore.splice(idx, 1);
          return { success: true };
        }
        return { success: true };
      },
    };
  },
};

// Environment variables
const env = {
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://manan:manan0112@cluster0.gndr5q0.mongodb.net/?retryWrites=true&w=majority",
  MONGODB_DATABASE: "unity_a_live_group",
  MONGODB_COLLECTION: "registrations",
  CLOUDINARY_CLOUD_NAME: "pplcot0h",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "953761345214678",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "tG-Kv7U9n8fPK-juJZXOf9PDL20",
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || "ganpatibapamorya",
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || "03f48f6d87ab3a32b242e407b840c21c2adc98b5c9e6bbc6ec5dff8da78ec00e",
  SESSION_SECRET: process.env.SESSION_SECRET || "ualg_super_secret_session_key_2026_unity_a_live_group",
  PUBLIC_BASE_URL: "http://localhost:5173",
  ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:4173,https://unity-a-live-group.vercel.app",
  DB: mockD1,
};

import { Hono } from 'hono';

const wrapper = new Hono();

// Middleware to inject env into Hono context for Node environment
wrapper.use('*', async (c, next) => {
  c.env = { ...env, ...process.env, ...c.env };
  if (!c.env.DB) c.env.DB = mockD1;
  await next();
});

wrapper.route('/', app);

const port = 8787;
console.log(`🚀 UNITY A LIVE GROUP API Server running at http://localhost:${port}`);

serve({
  fetch: wrapper.fetch,
  port,
});
