-- D1 migration: add media_type column to gallery_images table
ALTER TABLE gallery_images ADD COLUMN media_type TEXT DEFAULT 'image';
