// worker/src/services/mongodb.js
// MongoDB connection service for Cloudflare Workers

import { MongoClient } from 'mongodb';

let cachedClient = null;

const DEFAULT_URI = "mongodb+srv://manan:manan0112@cluster0.gndr5q0.mongodb.net/?retryWrites=true&w=majority";

async function getClient(uri) {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 30000,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

export async function getDb(env) {
  const uri = env.MONGODB_URI || DEFAULT_URI;
  const client = await getClient(uri);
  return client.db(env.MONGODB_DATABASE || 'unity_a_live_group');
}

export async function getCollection(env) {
  const db = await getDb(env);
  const collection = db.collection(env.MONGODB_COLLECTION || 'registrations');
  return collection;
}

export async function ensureIndexes(env) {
  const collection = await getCollection(env);

  await collection.createIndex({ uniqueId: 1 }, { unique: true });
  await collection.createIndex({ fullName: 1 });
  await collection.createIndex({ mobileNumber: 1 });
  await collection.createIndex({ bloodGroup: 1 });
  await collection.createIndex({ city: 1 });
  await collection.createIndex({ createdAt: -1 });

  return true;
}
