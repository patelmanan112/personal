// frontend/src/gallery/utils/imageValidation.js

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  'video/ogg',
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Validates a File for gallery upload (image or video).
 * Returns null if valid, or an error string if invalid.
 */
export function validateGalleryMedia(file) {
  if (!file) return 'Please select a photo or video file.';

  const type = file.type?.toLowerCase() || '';
  const isImage = ALLOWED_IMAGE_TYPES.includes(type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(type) || type.startsWith('video/');

  if (!isImage && !isVideo) {
    return 'Invalid file type. Supported formats: JPG, JPEG, PNG, WEBP for photos, and MP4, WEBM, MOV for videos.';
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  const maxLabel = isVideo ? '50 MB' : '10 MB';

  if (file.size > maxSize) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size for ${isVideo ? 'videos' : 'photos'} is ${maxLabel}.`;
  }

  return null;
}

// Alias for backward compatibility
export const validateGalleryImage = validateGalleryMedia;

export function isVideoFile(file) {
  if (!file) return false;
  const type = file.type?.toLowerCase() || '';
  return ALLOWED_VIDEO_TYPES.includes(type) || type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name);
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
