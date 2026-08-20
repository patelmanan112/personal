// frontend/src/gallery/utils/downloadImage.js

/**
 * Downloads a Cloudinary image using a fetch → blob → anchor trick.
 * This avoids "open in new tab" behaviour and forces a real file download.
 * We use Cloudinary's fl_attachment flag for the most reliable filename.
 */
export async function downloadGalleryImage(imageUrl, filename) {
  try {
    // Insert fl_attachment transformation into the Cloudinary URL
    // e.g.: https://res.cloudinary.com/xxx/image/upload/... 
    //     → https://res.cloudinary.com/xxx/image/upload/fl_attachment/...
    const downloadUrl = imageUrl.replace(
      '/image/upload/',
      '/image/upload/fl_attachment/'
    );

    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename || 'unity-a-live-group-ganpati.jpg';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.error('Download error:', err);
    // Fallback: open in new tab
    window.open(imageUrl, '_blank');
  }
}

/**
 * Generates a user-friendly download filename.
 */
export function getDownloadFilename(image, index) {
  const num = String(index + 1).padStart(3, '0');
  const ext = image.originalFilename?.split('.').pop() || 'jpg';
  return `unity-a-live-group-ganpati-${num}.${ext}`;
}
