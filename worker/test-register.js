import { getCollection } from './src/services/mongodb.js';
import { uploadToCloudinary } from './src/services/cloudinary.js';
import { generateUniqueId } from './src/services/idGenerator.js';

const mockEnv = {
  MONGODB_URI: "mongodb+srv://manan:manan0112@cluster0.gndr5q0.mongodb.net/?retryWrites=true&w=majority",
  MONGODB_DATABASE: "unity_a_live_group",
  MONGODB_COLLECTION: "registrations",
  CLOUDINARY_CLOUD_NAME: "pplcot0h",
  CLOUDINARY_API_KEY: "953761345214678",
  CLOUDINARY_API_SECRET: "tG-Kv7U9n8fPK-juJZXOf9PDL20",
};

async function testRegistration() {
  console.log("1. Connecting to MongoDB...");
  const collection = await getCollection(mockEnv);
  console.log("✓ Connected to MongoDB");

  console.log("2. Generating unique ID...");
  const uniqueId = await generateUniqueId(collection);
  console.log("✓ Unique ID generated:", uniqueId);

  console.log("3. Testing Cloudinary upload with dummy 1x1 PNG...");
  // Create a minimal 1x1 transparent PNG blob
  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const file = new File([pngBuffer], 'test.png', { type: 'image/png' });

  const cloudinaryRes = await uploadToCloudinary(file, mockEnv);
  console.log("✓ Cloudinary Upload Successful:", cloudinaryRes);

  console.log("4. Inserting test record into MongoDB...");
  const doc = {
    uniqueId,
    fullName: "Test Member",
    age: 25,
    mobileNumber: "9876543210",
    bloodGroup: "B+",
    city: "Ahmedabad",
    photoUrl: cloudinaryRes.secure_url,
    photoPublicId: cloudinaryRes.public_id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await collection.insertOne(doc);
  console.log("✓ Test document inserted successfully into MongoDB!");

  console.log("5. Verifying retrieval...");
  const retrieved = await collection.findOne({ uniqueId });
  console.log("✓ Retrieved from MongoDB:", retrieved.uniqueId, retrieved.fullName);

  console.log("\n🎉 FULL BACKEND PIPELINE (MONGODB + CLOUDINARY + UNIQUE ID) IS WORKING 100%!");
}

testRegistration().catch((err) => {
  console.error("❌ Registration Test Failed:", err);
});
