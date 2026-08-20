// frontend/src/gallery/components/GalleryCard.jsx
// A single image card in the masonry grid with hover actions.

import { Eye, Download } from 'lucide-react';
import { downloadGalleryImage, getDownloadFilename } from '../utils/downloadImage.js';

/**
 * Builds an optimized Cloudinary thumbnail URL.
 * w_600,h_600,c_fill,q_auto,f_auto
 */
function thumbUrl(url) {
  return url.replace('/image/upload/', '/image/upload/w_600,h_600,c_fill,q_auto,f_auto/');
}

export default function GalleryCard({ image, index, onClick }) {
  const handleDownload = async (e) => {
    e.stopPropagation();
    await downloadGalleryImage(image.imageUrl, getDownloadFilename(image, index));
  };

  return (
    <div
      className="group relative break-inside-avoid rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300 bg-gray-100"
      onClick={() => onClick(index)}
    >
      <img
        src={thumbUrl(image.imageUrl)}
        alt={image.title || `Ganpati photo ${index + 1}`}
        loading="lazy"
        className="w-full h-auto block object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => { e.target.src = image.imageUrl; }}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        {image.title && (
          <p className="text-white text-xs font-semibold truncate mb-2">{image.title}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClick(index); }}
            className="flex-1 flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
          >
            <Eye className="w-3 h-3" /> View
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1 bg-ualg-gold/80 hover:bg-ualg-gold text-ualg-navy text-xs font-medium py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3 h-3" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
