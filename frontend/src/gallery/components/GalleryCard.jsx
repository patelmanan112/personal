// frontend/src/gallery/components/GalleryCard.jsx
// A single media card in the masonry grid supporting Photos & Videos

import { Eye, Download, Play, Film } from 'lucide-react';
import { downloadGalleryMedia, getDownloadFilename } from '../utils/downloadImage.js';

/**
 * Builds an optimized thumbnail URL for both images and videos.
 */
function getThumbUrl(item) {
  const url = item.imageUrl || '';
  const isVideo = item.mediaType === 'video' || url.includes('/video/');

  if (isVideo) {
    if (url.includes('/video/upload/')) {
      // Cloudinary video poster frame thumbnail
      return url.replace('/video/upload/', '/video/upload/so_0,w_600,h_600,c_fill,q_auto,f_jpg/').replace(/\.[^/.]+$/, '.jpg');
    }
    return url;
  }

  if (url.includes('/image/upload/')) {
    return url.replace('/image/upload/', '/image/upload/w_600,h_600,c_fill,q_auto,f_auto/');
  }

  return url;
}

export default function GalleryCard({ image, index, onClick }) {
  const isVideo = image.mediaType === 'video' || image.imageUrl?.includes('/video/');

  const handleDownload = async (e) => {
    e.stopPropagation();
    await downloadGalleryMedia(image.imageUrl, getDownloadFilename(image, index));
  };

  return (
    <div
      className="group relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 bg-gray-950"
      onClick={() => onClick(index)}
    >
      {/* Thumbnail or Video Tag */}
      <div className="relative overflow-hidden aspect-auto min-h-[180px] bg-slate-900 flex items-center justify-center">
        <img
          src={getThumbUrl(image)}
          alt={image.title || `Ganpati ${isVideo ? 'video' : 'photo'} ${index + 1}`}
          loading="lazy"
          className="w-full h-auto block object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            if (isVideo) {
              // fallback if video jpg generation is pending
              e.target.style.display = 'none';
            }
          }}
        />

        {/* Video Badge & Play Button Overlay */}
        {isVideo && (
          <>
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-ualg-gold text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-white/10 z-10">
              <Film className="w-3 h-3" />
              <span>Video</span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-300">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-ualg-gold/90 text-ualg-navy flex items-center justify-center shadow-2xl backdrop-blur-sm group-hover:bg-ualg-gold transition-colors">
                <Play className="w-6 h-6 ml-0.5 fill-current" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
        {image.title && (
          <p className="text-white text-xs sm:text-sm font-bold truncate mb-2 drop-shadow-md">
            {image.title}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClick(index); }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold py-2 rounded-xl transition-colors"
          >
            {isVideo ? <><Play className="w-3.5 h-3.5 fill-current" /> Watch</> : <><Eye className="w-3.5 h-3.5" /> View</>}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 bg-ualg-gold hover:bg-ualg-gold-light text-ualg-navy text-xs font-bold py-2 rounded-xl transition-colors shadow-md"
          >
            <Download className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
