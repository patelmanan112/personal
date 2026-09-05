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
  constructor(db, collectionName) { 
    this.db = db;
    this.collectionName = collectionName;
  }

  queryRows(filter = {}, options = {}) {
    const values = [];
    const where = buildWhere(filter, values);
    const projection = options.projection
      ? Object.keys(options.projection).filter((key) => options.projection[key] === 1)
      : ['*'];
    
    // Fallback if someone relied on old defaults for registrations
    let cols = '*';
    if (projection.length > 0 && projection[0] !== '*') {
      cols = projection.join(', ');
    } else if (this.collectionName === 'registrations' && !options.projection) {
       cols = 'uniqueId, fullName, age, mobileNumber, bloodGroup, city, photoUrl, photoPublicId, createdAt, updatedAt';
    }

    const sort = options.sort
      ? Object.entries(options.sort).map(([key, direction]) => `${key} ${direction === -1 ? 'DESC' : 'ASC'}`).join(', ')
      : 'createdAt DESC';
    let sql = `SELECT ${cols} FROM ${this.collectionName} WHERE ${where} ORDER BY ${sort}`;
    if (options.limit !== undefined || options.skip !== undefined) {
      const limitVal = options.limit !== undefined ? Number(options.limit) : -1;
      const offsetVal = options.skip !== undefined ? Number(options.skip) : 0;
      sql += ` LIMIT ${limitVal}`;
      if (offsetVal > 0) {
        sql += ` OFFSET ${offsetVal}`;
      }
    }

    return this.db.prepare(sql).bind(...values).all().then((result) =>
      (result.results || []).map((row) => {
        if (row.age !== undefined) row.age = Number(row.age);
        return row;
      })
    );
  }

  find(filter = {}, options = {}) { return new D1Cursor(this, filter, options); }

  async findOne(filter = {}, options = {}) {
    const rows = await this.queryRows(filter, { ...options, limit: 1 });
    return rows[0] || null;
  }

  async insertOne(document) {
    const keys = Object.keys(document);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(k => document[k] instanceof Date ? document[k].toISOString() : document[k]);
    
    return this.db.prepare(`
      INSERT INTO ${this.collectionName} (${keys.join(', ')})
      VALUES (${placeholders})
    `).bind(...values).run();
  }

  async updateOne(filter, update) {
    const values = [];
    const setClause = Object.entries(update.$set || update).map(([key, val]) => {
      values.push(val instanceof Date ? val.toISOString() : val);
      return `${key} = ?`;
    }).join(', ');

    const whereValues = [];
    const whereClause = buildWhere(filter, whereValues);
    
    values.push(...whereValues);

    return this.db.prepare(`
      UPDATE ${this.collectionName} SET ${setClause} WHERE ${whereClause}
    `).bind(...values).run();
  }

  async deleteOne(filter) {
    const values = [];
    const where = buildWhere(filter, values);
    return this.db.prepare(`DELETE FROM ${this.collectionName} WHERE ${where}`).bind(...values).run();
  }

  async countDocuments(filter = {}) {
    const values = [];
    const where = buildWhere(filter, values);
    const result = await this.db.prepare(`SELECT COUNT(*) AS count FROM ${this.collectionName} WHERE ${where}`).bind(...values).first();
    return Number(result?.count || 0);
  }

  aggregate(pipeline) {
    // Basic support for $group sum for funds
    if (pipeline.length === 1 && pipeline[0].$group && pipeline[0].$group._id === null) {
       const sumFields = Object.keys(pipeline[0].$group).filter(k => k !== '_id' && pipeline[0].$group[k].$sum);
       if (sumFields.length > 0) {
           const selectParts = sumFields.map(field => `SUM(${pipeline[0].$group[field].$sum.replace('$', '')}) as ${field}`);
           return {
               toArray: async () => {
                   const result = await this.db.prepare(`SELECT ${selectParts.join(', ')} FROM ${this.collectionName}`).first();
                   const doc = { _id: null };
                   sumFields.forEach(f => doc[f] = result?.[f] || 0);
                   return [doc];
               }
           };
       }
    }
    return { toArray: async () => [] };
  }

  async createIndex() { return { success: true }; }
}

async function getMongoCollection(env, collectionName = null) {
  if (!cachedClient) {
    cachedClient = new MongoClient(env.MONGODB_URI || DEFAULT_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 30000,
    });
    await cachedClient.connect();
  }
  return cachedClient.db(env.MONGODB_DATABASE || 'unity_a_live_group')
    .collection(collectionName || env.MONGODB_COLLECTION || 'registrations');
}

export async function getCollection(env, collectionName = 'registrations') {
  if (env.DB && !env.DB.isMock) return new D1Collection(env.DB, collectionName);
  return getMongoCollection(env, collectionName);
}

export async function ensureIndexes(env) {
  const collection = await getCollection(env);
  await collection.createIndex({ uniqueId: 1 }, { unique: true });
  return true;
}
