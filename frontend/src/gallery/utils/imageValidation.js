// frontend/src/gallery/utils/imageValidation.js

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates a File for gallery upload.
 * Returns null if valid, or an error string if invalid.
 */
export function validateGalleryImage(file) {
  if (!file) return 'Please select an image file.';

  const type = file.type?.toLowerCase();
  if (!ALLOWED_TYPES.includes(type)) {
    return 'Invalid file type. Please select a JPG, JPEG, PNG, or WEBP image.';
  }

  if (file.size > MAX_SIZE_BYTES) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`;
  }

  return null;
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
