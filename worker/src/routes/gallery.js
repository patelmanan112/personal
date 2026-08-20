// worker/src/routes/gallery.js
// Public: GET /api/gallery
// Admin:  POST /api/admin/gallery/upload
//         DELETE /api/admin/gallery/:id

import { Hono } from 'hono';
import { requireAdmin } from '../middleware/auth.js';
import { uploadToCloudinaryGallery, deleteFromCloudinary } from '../services/cloudinary.js';

const gallery = new Hono();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDB(c) {
  if (!c.env.DB) throw new Error('D1 database binding "DB" is not configured.');
  return c.env.DB;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// ─── GET /api/gallery  (public) ───────────────────────────────────────────────
gallery.get('/', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20')));
  const offset = (page - 1) * limit;

  try {
    const db = getDB(c);

    const [rows, countRow] = await Promise.all([
      db.prepare(
        'SELECT id, title, image_url, public_id, original_filename, file_size, created_at FROM gallery_images ORDER BY created_at DESC LIMIT ? OFFSET ?'
      ).bind(limit, offset).all(),
      db.prepare('SELECT COUNT(*) as total FROM gallery_images').first(),
    ]);

    const total = countRow?.total ?? 0;
    const hasMore = offset + limit < total;

    return c.json({
      success: true,
      data: (rows.results || []).map((r) => ({
        id: r.id,
        title: r.title || null,
        imageUrl: r.image_url,
        publicId: r.public_id,
        originalFilename: r.original_filename,
        fileSize: r.file_size,
        createdAt: r.created_at,
      })),
      page,
      limit,
      total,
      hasMore,
    });
  } catch (err) {
    console.error('Gallery fetch error:', err);
    return c.json({ success: false, message: `Failed to load gallery: ${err.message}` }, 500);
  }
});

// ─── POST /api/admin/gallery/upload  (admin only) ─────────────────────────────
gallery.post('/upload', requireAdmin, async (c) => {
  let formData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ success: false, message: 'Invalid form data.' }, 400);
  }

  const image = formData.get('image');
  const title = (formData.get('title') || '').trim() || null;

  // Validate file presence
  if (!image || typeof image === 'string') {
    return c.json({ success: false, message: 'No image file provided.' }, 400);
  }

  // Validate type
  const mimeType = image.type?.toLowerCase();
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return c.json({
      success: false,
      message: 'Invalid file type. Allowed: JPG, JPEG, PNG, WEBP.',
    }, 422);
  }

  // Validate size
  const arrayBuffer = await image.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_SIZE) {
    return c.json({
      success: false,
      message: `File too large. Maximum allowed size is 5 MB. Your file is ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(1)} MB.`,
    }, 422);
  }

  // Re-create a File blob from the buffer for Cloudinary upload
  const fileBlob = new File([arrayBuffer], image.name || 'upload.jpg', { type: mimeType });

  // Upload to Cloudinary
  let cloudResult;
  try {
    cloudResult = await uploadToCloudinaryGallery(fileBlob, c.env);
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return c.json({ success: false, message: `Image upload failed: ${err.message}` }, 500);
  }

  // Save to D1
  try {
    const db = getDB(c);
    const stmt = db.prepare(
      'INSERT INTO gallery_images (title, image_url, public_id, asset_id, original_filename, file_size) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = await stmt.bind(
      title,
      cloudResult.secure_url,
      cloudResult.public_id,
      cloudResult.asset_id || null,
      image.name || null,
      arrayBuffer.byteLength,
    ).run();

    return c.json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        id: result.meta?.last_row_id,
        title,
        imageUrl: cloudResult.secure_url,
        publicId: cloudResult.public_id,
        originalFilename: image.name,
        fileSize: arrayBuffer.byteLength,
        createdAt: new Date().toISOString(),
      },
    }, 201);
  } catch (err) {
    // Attempt to clean up Cloudinary on D1 failure
    try { await deleteFromCloudinary(cloudResult.public_id, c.env); } catch {}
    console.error('D1 insert error:', err);
    return c.json({ success: false, message: `Failed to save image record: ${err.message}` }, 500);
  }
});

// ─── DELETE /api/admin/gallery/:id  (admin only) ──────────────────────────────
gallery.delete('/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  if (!id || isNaN(id)) {
    return c.json({ success: false, message: 'Invalid image ID.' }, 400);
  }

  try {
    const db = getDB(c);

    // Fetch record first (need public_id for Cloudinary deletion)
    const row = await db.prepare('SELECT id, public_id FROM gallery_images WHERE id = ?').bind(id).first();
    if (!row) {
      return c.json({ success: false, message: 'Image not found.' }, 404);
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(row.public_id, c.env);
    } catch (err) {
      console.warn('Cloudinary delete failed (proceeding with DB deletion):', err.message);
    }

    // Delete from D1
    await db.prepare('DELETE FROM gallery_images WHERE id = ?').bind(id).run();

    return c.json({ success: true, message: 'Image deleted successfully.' });
  } catch (err) {
    console.error('Gallery delete error:', err);
    return c.json({ success: false, message: `Failed to delete image: ${err.message}` }, 500);
  }
});

export default gallery;
