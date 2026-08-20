// frontend/src/gallery/components/GalleryLoader.jsx
// Skeleton loading grid shown while images are fetched

export default function GalleryLoader({ count = 8 }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="break-inside-avoid rounded-xl overflow-hidden bg-gray-200 animate-pulse"
          style={{ height: `${200 + (i % 3) * 80}px` }}
        />
      ))}
    </div>
  );
}
