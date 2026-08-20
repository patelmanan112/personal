// worker/src/routes/registration.js
// POST /api/register — Registers a new UNITY A LIVE GROUP member.

import { Hono } from 'hono';
import { getCollection } from '../services/mongodb.js';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { generateUniqueId } from '../services/idGenerator.js';
import { validateRegistration } from '../utils/validation.js';

const registration = new Hono();

registration.post('/', async (c) => {
  try {
    // ── 1. Parse multipart form data ─────────────────────────────────────────
    let formData;
    try {
      formData = await c.req.formData();
    } catch {
      return c.json({ success: false, message: 'Invalid form data. Please try again.' }, 400);
    }

    const fullName = (formData.get('fullName') || '').trim();
    const age = formData.get('age');
    const mobileNumber = (formData.get('mobileNumber') || '').trim();
    const bloodGroup = (formData.get('bloodGroup') || '').trim();
    const city = (formData.get('city') || '').trim();
    const photo = formData.get('photo');

    // ── 2. Server-side validation ─────────────────────────────────────────────
    const validationErrors = validateRegistration(
      { fullName, age, mobileNumber, bloodGroup, city },
      photo
    );

    if (validationErrors) {
      return c.json({
        success: false,
        message: 'Validation failed. Please check your input.',
        errors: validationErrors,
      }, 422);
    }

    // ── 3. Get MongoDB collection ─────────────────────────────────────────────
    let collection;
    try {
      collection = await getCollection(c.env);
    } catch (err) {
      console.error('MongoDB connection error:', err);
      return c.json({
        success: false,
        message: `Database connection failed: ${err.message || 'Check MONGODB_URI and MongoDB Atlas Network Access (0.0.0.0/0)'}`,
      }, 503);
    }

    // ── 4. Generate a unique membership ID ───────────────────────────────────
    let uniqueId;
    try {
      uniqueId = await generateUniqueId(collection);
    } catch (err) {
      console.error('ID generation error:', err);
      return c.json({ success: false, message: `Could not generate unique ID: ${err.message}` }, 500);
    }

    // ── 5. Upload photo to Cloudinary ─────────────────────────────────────────
    let photoUrl, photoPublicId;
    try {
      const result = await uploadToCloudinary(photo, c.env);
      photoUrl = result.secure_url;
      photoPublicId = result.public_id;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      return c.json({ success: false, message: `Photo upload failed: ${err.message}` }, 500);
    }

    // ── 6. Save registration to MongoDB ──────────────────────────────────────
    const now = new Date();
    const registrationDoc = {
      uniqueId,
      fullName,
      age: Number(age),
      mobileNumber,
      bloodGroup,
      city,
      photoUrl,
      photoPublicId,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await collection.insertOne(registrationDoc);
    } catch (err) {
      console.error('MongoDB insert error:', err);
      if (err.code === 11000) {
        return c.json({ success: false, message: 'A duplicate ID was generated. Please try again.' }, 409);
      }
      return c.json({ success: false, message: `Registration could not be saved: ${err.message}` }, 500);
    }

    // ── 7. Return success with only public data ───────────────────────────────
    return c.json({
      success: true,
      message: 'Registration successful! Welcome to UNITY A LIVE GROUP.',
      data: {
        uniqueId,
        fullName,
        age: Number(age),
        mobileNumber,
        bloodGroup,
        city,
        photoUrl,
        createdAt: now.toISOString(),
      },
    }, 201);

  } catch (err) {
    console.error('Unexpected registration error:', err);
    return c.json({ success: false, message: `Unexpected error: ${err.message}` }, 500);
  }
});

export default registration;
