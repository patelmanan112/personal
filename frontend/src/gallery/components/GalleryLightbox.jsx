// frontend/src/gallery/components/GalleryLightbox.jsx
// Full-screen lightbox with keyboard navigation, prev/next, and download.

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { downloadGalleryImage, getDownloadFilename } from '../utils/downloadImage.js';

function largeUrl(url) {
  return url.replace('/image/upload/', '/image/upload/w_1400,q_auto,f_auto/');
}

export default function GalleryLightbox({ images, currentIndex, onClose, onPrev, onNext }) {
  const image = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && hasPrev) onPrev();
    if (e.key === 'ArrowRight' && hasNext) onNext();
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleDownload = () =>
    downloadGalleryImage(image.imageUrl, getDownloadFilename(image, currentIndex));

  // Click backdrop to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Download */}
      <button
        onClick={handleDownload}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-ualg-gold/90 hover:bg-ualg-gold text-ualg-navy font-bold text-sm transition-colors"
      >
        <Download className="w-4 h-4" /> Download
      </button>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* Image */}
      <div className="max-w-5xl max-h-full w-full px-16 py-16 flex items-center justify-center">
        <img
          src={largeUrl(image.imageUrl)}
          alt={image.title || `Ganpati photo ${currentIndex + 1}`}
          className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
          onError={(e) => { e.target.src = image.imageUrl; }}
        />
      </div>

      {/* Counter & title */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        {image.title && (
          <p className="text-white font-semibold text-sm mb-1">{image.title}</p>
        )}
        <p className="text-gray-400 text-xs">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}
