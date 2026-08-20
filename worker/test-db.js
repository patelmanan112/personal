import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://manan:manan0112@cluster0.gndr5q0.mongodb.net/?retryWrites=true&w=majority";

async function test() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas!");
    const db = client.db("unity_a_live_group");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  } finally {
    await client.close();
  }
}

test();
