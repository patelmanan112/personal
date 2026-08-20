// Database service. Cloudflare production uses D1; local Node development can use MongoDB.

import { MongoClient } from 'mongodb';

let cachedClient = null;
const DEFAULT_URI = 'mongodb+srv://manan:manan0112@cluster0.gndr5q0.mongodb.net/?retryWrites=true&w=majority';

function buildWhere(filter, values) {
  if (!filter || Object.keys(filter).length === 0) return '1 = 1';
  if (filter.$or) return filter.$or.map((item) => `(${buildWhere(item, values)})`).join(' OR ');

  return Object.entries(filter).map(([field, condition]) => {
    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
      if ('$regex' in condition) {
        values.push(`%${condition.$regex}%`);
        return `${field} LIKE ? COLLATE NOCASE`;
      }
      const parts = [];
      if ('$gte' in condition) {
        values.push(condition.$gte instanceof Date ? condition.$gte.toISOString() : condition.$gte);
        parts.push(`${field} >= ?`);
      }
      if ('$lte' in condition) {
        values.push(condition.$lte instanceof Date ? condition.$lte.toISOString() : condition.$lte);
        parts.push(`${field} <= ?`);
      }
      return parts.join(' AND ') || '1 = 1';
    }
    values.push(condition);
    return `${field} = ?`;
  }).join(' AND ');
}

class D1Cursor {
  constructor(collection, filter, options = {}) {
    this.collection = collection;
    this.filter = filter;
    this.options = options;
  }

  sort(sort) { this.options.sort = sort; return this; }
  skip(skip) { this.options.skip = skip; return this; }
  limit(limit) { this.options.limit = limit; return this; }
  toArray() { return this.collection.queryRows(this.filter, this.options); }
}

class D1Collection {
  constructor(db) { this.db = db; }

  queryRows(filter = {}, options = {}) {
    const values = [];
    const where = buildWhere(filter, values);
    const projection = options.projection
      ? Object.keys(options.projection).filter((key) => options.projection[key] === 1)
      : ['uniqueId', 'fullName', 'age', 'mobileNumber', 'bloodGroup', 'city', 'photoUrl', 'photoPublicId', 'createdAt', 'updatedAt'];
    const columns = projection.length ? projection.join(', ') : '*';
    const sort = options.sort
      ? Object.entries(options.sort).map(([key, direction]) => `${key} ${direction === -1 ? 'DESC' : 'ASC'}`).join(', ')
      : 'createdAt DESC';
    let sql = `SELECT ${columns} FROM registrations WHERE ${where} ORDER BY ${sort}`;
    if (options.skip) sql += ` LIMIT -1 OFFSET ${Number(options.skip)}`;
    if (options.limit) sql += ` LIMIT ${Number(options.limit)}`;

    return this.db.prepare(sql).bind(...values).all().then((result) =>
      (result.results || []).map((row) => ({ ...row, age: Number(row.age) }))
    );
  }

  find(filter = {}, options = {}) { return new D1Cursor(this, filter, options); }

  async findOne(filter = {}, options = {}) {
    const rows = await this.queryRows(filter, { ...options, limit: 1 });
    return rows[0] || null;
  }

  async insertOne(document) {
    return this.db.prepare(`
      INSERT INTO registrations
        (uniqueId, fullName, age, mobileNumber, bloodGroup, city, photoUrl, photoPublicId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      document.uniqueId, document.fullName, document.age, document.mobileNumber,
      document.bloodGroup, document.city, document.photoUrl, document.photoPublicId,
      document.createdAt.toISOString(), document.updatedAt.toISOString()
    ).run();
  }

  async deleteOne(filter) {
    const values = [];
    const where = buildWhere(filter, values);
    return this.db.prepare(`DELETE FROM registrations WHERE ${where}`).bind(...values).run();
  }

  async countDocuments(filter = {}) {
    const values = [];
    const where = buildWhere(filter, values);
    const result = await this.db.prepare(`SELECT COUNT(*) AS count FROM registrations WHERE ${where}`).bind(...values).first();
    return Number(result?.count || 0);
  }

  async createIndex() { return { success: true }; }
}

async function getMongoCollection(env) {
  if (!cachedClient) {
    cachedClient = new MongoClient(env.MONGODB_URI || DEFAULT_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 30000,
    });
    await cachedClient.connect();
  }
  return cachedClient.db(env.MONGODB_DATABASE || 'unity_a_live_group')
    .collection(env.MONGODB_COLLECTION || 'registrations');
}

export async function getCollection(env) {
  if (env.DB) return new D1Collection(env.DB);
  return getMongoCollection(env);
}

export async function ensureIndexes(env) {
  const collection = await getCollection(env);
  await collection.createIndex({ uniqueId: 1 }, { unique: true });
  return true;
}
