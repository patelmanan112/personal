import { MongoClient } from 'mongodb';

const directUri = "mongodb://manan:manan0112@ac-wiksll5-shard-00-02.gndr5q0.mongodb.net:27017,ac-wiksll5-shard-00-01.gndr5q0.mongodb.net:27017,ac-wiksll5-shard-00-00.gndr5q0.mongodb.net:27017/unity_a_live_group?ssl=true&replicaSet=atlas-2w6tfe-shard-0&authSource=admin&retryWrites=true&w=majority";

async function testDirect() {
  console.log("Testing Direct Seedlist Connection...");
  const client = new MongoClient(directUri);
  try {
    await client.connect();
    console.log("✓ Connected directly without SRV!");
    const db = client.db("unity_a_live_group");
    const count = await db.collection("registrations").countDocuments({});
    console.log("✓ Registration count:", count);
  } catch (err) {
    console.error("Direct connection failed:", err);
  } finally {
    await client.close();
  }
}

testDirect();
