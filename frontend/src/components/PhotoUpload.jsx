// frontend/src/components/PhotoUpload.jsx
// Drag-and-drop / click-to-upload photo component with preview.

import { useRef, useState, useCallback } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { validatePhotoFile } from '../utils/validation.js';

export default function PhotoUpload({ value, onChange, error }) {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFile = useCallback(
    (file) => {
      const err = validatePhotoFile(file);
      if (err) {
        onChange(null, err);
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onChange(file, null);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Profile Photo <span className="text-red-500">*</span>
      </label>

      {previewUrl ? (
        // Preview
        <div className="flex flex-col items-center gap-3">
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-32 h-32 object-cover rounded-full border-4 border-ualg-blue shadow-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-95"
              aria-label="Remove photo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-ualg-blue hover:text-ualg-navy font-bold flex items-center gap-2 transition-colors py-2 px-4 bg-blue-50 rounded-full mt-1"
          >
            <Camera className="w-4 h-4" />
            Change Photo
          </button>
        </div>
      ) : (
        // Upload zone
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${dragging
              ? 'border-ualg-blue bg-blue-50 scale-[1.02]'
              : error
              ? 'border-red-400 bg-red-50 hover:border-red-500'
              : 'border-gray-300 bg-gray-50 hover:border-ualg-blue hover:bg-blue-50'
            }
          `}
          aria-label="Upload profile photo"
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${dragging ? 'bg-ualg-blue' : 'bg-gray-200'} transition-colors`}>
              <Upload className={`w-7 h-7 ${dragging ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {dragging ? 'Drop your photo here!' : 'Upload Profile Photo'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Click or drag & drop — JPG, PNG, WEBP up to 5 MB
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1 mt-1" role="alert">
          <span>⚠</span> {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
