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

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  'video/ogg',
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

// ─── GET /api/gallery  (public) ───────────────────────────────────────────────
gallery.get('/', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20')));
  const typeFilter = c.req.query('type'); // 'image' | 'video' | undefined
  const offset = (page - 1) * limit;

  try {
    const db = getDB(c);

    let query = 'SELECT id, title, image_url, public_id, asset_id, original_filename, file_size, media_type, created_at FROM gallery_images';
    let countQuery = 'SELECT COUNT(*) as total FROM gallery_images';
    const params = [];
    const countParams = [];

    if (typeFilter && ['image', 'video'].includes(typeFilter)) {
      query += ' WHERE media_type = ?';
      countQuery += ' WHERE media_type = ?';
      params.push(typeFilter);
      countParams.push(typeFilter);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows, countRow] = await Promise.all([
      db.prepare(query).bind(...params).all(),
      countParams.length > 0
        ? db.prepare(countQuery).bind(...countParams).first()
        : db.prepare(countQuery).first(),
    ]);

    const total = countRow?.total ?? 0;
    const hasMore = offset + limit < total;

    return c.json({
      success: true,
      data: (rows.results || []).map((r) => {
        // Detect media_type if column was null/empty
        const isVideo = r.media_type === 'video' || (r.image_url && r.image_url.includes('/video/'));
        return {
          id: r.id,
          title: r.title || null,
          imageUrl: r.image_url,
          publicId: r.public_id,
          originalFilename: r.original_filename,
          fileSize: r.file_size,
          mediaType: isVideo ? 'video' : 'image',
          createdAt: r.created_at,
        };
      }),
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

  const file = formData.get('file') || formData.get('image') || formData.get('media');
  const title = (formData.get('title') || '').trim() || null;

  // Validate file presence
  if (!file || typeof file === 'string') {
    return c.json({ success: false, message: 'No image or video file provided.' }, 400);
  }

  // Validate type & size
  const mimeType = file.type?.toLowerCase() || '';
  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType) || mimeType.startsWith('video/');

  if (!isImage && !isVideo) {
    return c.json({
      success: false,
      message: 'Invalid file format. Allowed: JPG, PNG, WEBP for photos; MP4, WEBM, MOV for videos.',
    }, 422);
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  const arrayBuffer = await file.arrayBuffer();

  if (arrayBuffer.byteLength > maxSize) {
    const limitMB = isVideo ? 50 : 10;
    return c.json({
      success: false,
      message: `File too large. Maximum size is ${limitMB} MB. Your file is ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(1)} MB.`,
    }, 422);
  }

  const mediaType = isVideo ? 'video' : 'image';
  const fileBlob = new File([arrayBuffer], file.name || (isVideo ? 'video.mp4' : 'image.jpg'), { type: mimeType });

  // Upload to Cloudinary
  let cloudResult;
  try {
    cloudResult = await uploadToCloudinaryGallery(fileBlob, c.env, isVideo);
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return c.json({ success: false, message: `Upload failed: ${err.message}` }, 500);
  }

  // Save to D1
  try {
    const db = getDB(c);
    const stmt = db.prepare(
      'INSERT INTO gallery_images (title, image_url, public_id, asset_id, original_filename, file_size, media_type) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const result = await stmt.bind(
      title,
      cloudResult.secure_url,
      cloudResult.public_id,
      cloudResult.asset_id || null,
      file.name || null,
      arrayBuffer.byteLength,
      mediaType,
    ).run();

    return c.json({
      success: true,
      message: `${isVideo ? 'Video' : 'Photo'} uploaded successfully.`,
      data: {
        id: result.meta?.last_row_id,
        title,
        imageUrl: cloudResult.secure_url,
        publicId: cloudResult.public_id,
        originalFilename: file.name,
        fileSize: arrayBuffer.byteLength,
        mediaType,
        createdAt: new Date().toISOString(),
      },
    }, 201);
  } catch (err) {
    // Attempt to clean up Cloudinary on D1 failure
    try { await deleteFromCloudinary(cloudResult.public_id, c.env, mediaType); } catch {}
    console.error('D1 insert error:', err);
    return c.json({ success: false, message: `Failed to save record: ${err.message}` }, 500);
  }
});

// ─── DELETE /api/admin/gallery/:id  (admin only) ──────────────────────────────
gallery.delete('/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));
  if (!id || isNaN(id)) {
    return c.json({ success: false, message: 'Invalid media ID.' }, 400);
  }

  try {
    const db = getDB(c);

    // Fetch record first (need public_id and media_type for Cloudinary deletion)
    const row = await db.prepare('SELECT id, public_id, media_type, image_url FROM gallery_images WHERE id = ?').bind(id).first();
    if (!row) {
      return c.json({ success: false, message: 'Item not found.' }, 404);
    }

    const isVideo = row.media_type === 'video' || (row.image_url && row.image_url.includes('/video/'));

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(row.public_id, c.env, isVideo ? 'video' : 'image');
    } catch (err) {
      console.warn('Cloudinary delete failed (proceeding with DB deletion):', err.message);
    }

    // Delete from D1
    await db.prepare('DELETE FROM gallery_images WHERE id = ?').bind(id).run();

    return c.json({ success: true, message: 'Item deleted successfully.' });
  } catch (err) {
    console.error('Gallery delete error:', err);
    return c.json({ success: false, message: `Failed to delete item: ${err.message}` }, 500);
  }
});

export default gallery;
