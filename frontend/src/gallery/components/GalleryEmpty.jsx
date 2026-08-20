// frontend/src/gallery/components/GalleryEmpty.jsx
import { ImageOff } from 'lucide-react';

export default function GalleryEmpty() {
  return (
    <div className="text-center py-20 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
        <ImageOff className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-700 mb-2">No Photos Yet</h2>
      <p className="text-gray-400 max-w-sm mx-auto">
        No photos have been added yet. Check back soon for beautiful moments from UNITY A LIVE GROUP.
      </p>
    </div>
  );
}
