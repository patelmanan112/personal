// frontend/src/gallery/components/GalleryLightbox.jsx
// Full-screen lightbox supporting both Photos and HD Video playback

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Film, Camera } from 'lucide-react';
import { downloadGalleryMedia, getDownloadFilename } from '../utils/downloadImage.js';

function largeUrl(url) {
  if (url.includes('/image/upload/')) {
    return url.replace('/image/upload/', '/image/upload/w_1600,q_auto,f_auto/');
  }
  return url;
}

export default function GalleryLightbox({ images, currentIndex, onClose, onPrev, onNext }) {
  const item = images[currentIndex];
  const isVideo = item?.mediaType === 'video' || item?.imageUrl?.includes('/video/');
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
    downloadGalleryMedia(item.imageUrl, getDownloadFilename(item, currentIndex));

  // Click backdrop to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
    >
      {/* Top Bar Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Download & Type Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-ualg-gold hover:bg-ualg-gold-light text-ualg-navy font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95"
          >
            <Download className="w-4 h-4" /> Download {isVideo ? 'Video' : 'Photo'}
          </button>

          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-300 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
            {isVideo ? <Film className="w-3.5 h-3.5 text-ualg-gold" /> : <Camera className="w-3.5 h-3.5 text-blue-400" />}
            <span>{isVideo ? 'Video Celebration' : 'Photograph'}</span>
          </span>
        </div>

        {/* Right: Close button */}
        <button
          onClick={onClose}
          className="pointer-events-auto p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shadow-lg active:scale-95"
          aria-label="Close viewer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Prev button */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all shadow-xl active:scale-95"
          aria-label="Previous item"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all shadow-xl active:scale-95"
          aria-label="Next item"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* Media Content */}
      <div className="max-w-6xl max-h-full w-full px-4 sm:px-16 py-16 flex items-center justify-center">
        {isVideo ? (
          <video
            key={item.imageUrl}
            src={item.imageUrl}
            controls
            autoPlay
            playsInline
            className="max-h-[78vh] max-w-full rounded-2xl shadow-2xl bg-black border border-white/10"
          />
        ) : (
          <img
            key={item.imageUrl}
            src={largeUrl(item.imageUrl)}
            alt={item.title || `Ganpati photo ${currentIndex + 1}`}
            className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            onError={(e) => { e.target.src = item.imageUrl; }}
          />
        )}
      </div>

      {/* Bottom info & counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none px-4 max-w-md">
        {item.title && (
          <p className="text-white font-bold text-sm sm:text-base mb-1 drop-shadow-md truncate">
            {item.title}
          </p>
        )}
        <p className="text-gray-400 text-xs font-mono">
          {currentIndex + 1} of {images.length}
        </p>
      </div>
    </div>
  );
}
