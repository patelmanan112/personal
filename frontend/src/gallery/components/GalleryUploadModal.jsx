// frontend/src/gallery/components/GalleryUploadModal.jsx
// Admin-only upload modal

import { useState, useRef } from 'react';
import { X, Upload, ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { validateGalleryImage, formatFileSize } from '../utils/imageValidation.js';
import { uploadGalleryImage } from '../services/galleryApi.js';
import { ButtonLoading } from '../../components/Loading.jsx';

export default function GalleryUploadModal({ onClose, onSuccess }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validationError = validateGalleryImage(selected);
    if (validationError) {
      setError(validationError);
      setFile(null);
      setPreview(null);
      return;
    }

    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    const validationError = validateGalleryImage(dropped);
    if (validationError) { setError(validationError); return; }
    setError('');
    setFile(dropped);
    setPreview(URL.createObjectURL(dropped));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);
    if (title.trim()) formData.append('title', title.trim());

    try {
      const res = await uploadGalleryImage(formData);
      if (res.success) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || 'Upload failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-ualg-navy">Add Gallery Image</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Drop zone */}
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-ualg-blue rounded-xl p-8 text-center cursor-pointer transition-colors"
            >
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold mb-1">Click or drag & drop to select image</p>
              <p className="text-gray-400 text-xs">JPG, JPEG, PNG, WEBP — maximum 5 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            /* Preview */
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img src={preview} alt="Preview" className="w-full max-h-52 object-cover" />
              <div className="p-3 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-700 truncate max-w-[180px]">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => { setFile(null); setPreview(null); setError(''); }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Optional title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Title <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ganpati Visarjan 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="input-field text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} disabled={uploading} className="flex-1 btn-outline py-2.5 text-sm">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
          >
            {uploading
              ? <ButtonLoading text="Uploading..." />
              : <><Upload className="w-4 h-4" /> Upload Image</>}
          </button>
        </div>
      </div>
    </div>
  );
}
