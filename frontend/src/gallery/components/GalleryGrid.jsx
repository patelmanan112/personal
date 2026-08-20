// frontend/src/gallery/components/GalleryGrid.jsx

import { useState } from 'react';
import GalleryCard from './GalleryCard.jsx';
import GalleryLightbox from './GalleryLightbox.jsx';

export default function GalleryGrid({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {images.map((image, index) => (
          <GalleryCard
            key={image.id}
            image={image}
            index={index}
            onClick={setLightboxIndex}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, i - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(images.length - 1, i + 1))}
        />
      )}
    </>
  );
}
