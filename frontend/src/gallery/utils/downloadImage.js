// frontend/src/gallery/utils/downloadImage.js

/**
 * Downloads a Cloudinary image or video using a fetch → blob → anchor trick.
 * This avoids "open in new tab" behaviour and forces a real file download.
 * We use Cloudinary's fl_attachment flag for the most reliable filename.
 */
export async function downloadGalleryMedia(mediaUrl, filename) {
  try {
    let downloadUrl = mediaUrl;
    if (mediaUrl.includes('/image/upload/')) {
      downloadUrl = mediaUrl.replace('/image/upload/', '/image/upload/fl_attachment/');
    } else if (mediaUrl.includes('/video/upload/')) {
      downloadUrl = mediaUrl.replace('/video/upload/', '/video/upload/fl_attachment/');
    }

    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename || 'unity-a-live-group-ganpati-celebration';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.error('Download error:', err);
    // Fallback: open in new tab
    window.open(mediaUrl, '_blank');
  }
}

// Alias for backward compatibility
export const downloadGalleryImage = downloadGalleryMedia;

/**
 * Generates a user-friendly download filename based on type.
 */
export function getDownloadFilename(item, index) {
  const num = String(index + 1).padStart(3, '0');
  const isVideo = item.mediaType === 'video' || item.imageUrl?.includes('/video/');
  const defaultExt = isVideo ? 'mp4' : 'jpg';
  const ext = item.originalFilename?.split('.').pop() || defaultExt;
  return `unity-a-live-group-ganpati-${num}.${ext}`;
}
