// frontend/src/gallery/components/GalleryUploadModal.jsx
// Admin upload modal supporting both Photos and Videos

import { useState, useRef } from 'react';
import { X, Upload, ImageIcon, Video, Film, AlertCircle, CheckCircle } from 'lucide-react';
import { validateGalleryMedia, isVideoFile, formatFileSize } from '../utils/imageValidation.js';
import { uploadGalleryImage } from '../services/galleryApi.js';
import { ButtonLoading } from '../../components/Loading.jsx';

export default function GalleryUploadModal({ onClose, onSuccess }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFile = (selected) => {
    if (!selected) return;

    const validationError = validateGalleryMedia(selected);
    if (validationError) {
      setError(validationError);
      setFile(null);
      setPreview(null);
      setIsVideo(false);
      return;
    }

    const videoCheck = isVideoFile(selected);
    setError('');
    setFile(selected);
    setIsVideo(videoCheck);
    setPreview(URL.createObjectURL(selected));
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-ualg-navy">Add Gallery Media</h2>
            <p className="text-xs text-gray-500">Upload Ganpati celebration photos or videos</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Error message */}
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
              className="border-2 border-dashed border-gray-300 hover:border-ualg-blue rounded-2xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-blue-50/20"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-ualg-blue">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-ualg-gold">
                  <Film className="w-6 h-6" />
                </div>
              </div>
              <p className="text-gray-700 font-semibold mb-1">Click or drag & drop photo or video</p>
              <p className="text-gray-400 text-xs mb-3">
                Photos: JPG, JPEG, PNG, WEBP (up to 10 MB)<br />
                Videos: MP4, WEBM, MOV (up to 50 MB)
              </p>
              <span className="inline-block text-xs bg-ualg-navy text-white font-medium px-4 py-1.5 rounded-full shadow-sm">
                Browse Files
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime,video/x-matroska"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            /* Preview Container */
            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-900">
              <div className="relative flex items-center justify-center min-h-[200px] max-h-[280px]">
                {isVideo ? (
                  <video
                    src={preview}
                    controls
                    playsInline
                    className="w-full max-h-[280px] object-contain"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-[280px] object-contain"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md ${
                    isVideo ? 'bg-amber-500 text-slate-900' : 'bg-blue-600 text-white'
                  }`}>
                    {isVideo ? '🎬 Video' : '📷 Photo'}
                  </span>
                </div>
              </div>

              {/* File details */}
              <div className="p-3 bg-gray-50 flex items-center justify-between border-t border-gray-200">
                <div className="truncate mr-2">
                  <p className="text-xs font-semibold text-gray-800 truncate">{file.name}</p>
                  <p className="text-[11px] text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setIsVideo(false);
                    setError('');
                  }}
                  className="text-xs text-red-500 hover:text-red-600 font-semibold px-2 py-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                >
                  Change File
                </button>
              </div>
            </div>
          )}

          {/* Optional title input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Title / Caption <span className="font-normal text-gray-400 lowercase">(optional)</span>
            </label>
            <input
              type="text"
              placeholder={isVideo ? "e.g. Ganpati Aarti & Celebration 2026" : "e.g. Ganpati Visarjan Procession"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="input-field text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-3 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} disabled={uploading} className="flex-1 btn-outline py-2.5 text-sm">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
          >
            {uploading ? (
              <ButtonLoading text="Uploading media..." />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload {isVideo ? 'Video' : 'Photo'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
