// frontend/src/gallery/pages/Gallery.jsx
// Main landing page for UNITY A LIVE GROUP — Ganpati Gallery

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import GalleryHero from '../components/GalleryHero.jsx';
import GalleryGrid from '../components/GalleryGrid.jsx';
import GalleryLoader from '../components/GalleryLoader.jsx';
import GalleryEmpty from '../components/GalleryEmpty.jsx';
import { fetchGallery } from '../services/galleryApi.js';
import { ButtonLoading } from '../../components/Loading.jsx';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const loadGalleryData = useCallback(async (pageNum = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const res = await fetchGallery({ page: pageNum, limit: 20 });
      if (res.success) {
        if (append) {
          setImages((prev) => [...prev, ...(res.data || [])]);
        } else {
          setImages(res.data || []);
        }
        setHasMore(Boolean(res.hasMore));
        setTotal(res.total ?? (res.data ? res.data.length : 0));
        setPage(pageNum);
      } else {
        setError(res.message || 'Unable to load the gallery.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load the gallery. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadGalleryData(1, false);
  }, [loadGalleryData]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadGalleryData(page + 1, true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <GalleryHero />

      {/* Gallery Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-gray-200 gap-4">
          <div>
            <div className="flex items-center gap-2 text-ualg-gold font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Memories & Celebrations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-ualg-navy tracking-tight">
              Ganpati Memories
            </h2>
          </div>
          {total > 0 && !loading && (
            <span className="text-xs text-gray-500 font-medium bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm self-start sm:self-auto">
              {total} {total === 1 ? 'Photograph' : 'Photographs'}
            </span>
          )}
        </div>

        {/* Loading State */}
        {loading && <GalleryLoader count={8} />}

        {/* Error State */}
        {!loading && error && (
          <div className="card text-center py-16 max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Unable to Load Gallery</h3>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={() => loadGalleryData(1, false)}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && images.length === 0 && <GalleryEmpty />}

        {/* Gallery Grid */}
        {!loading && !error && images.length > 0 && (
          <>
            <GalleryGrid images={images} />

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12 mb-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn-primary min-w-[180px] text-sm py-3 px-8"
                >
                  {loadingMore ? <ButtonLoading text="Loading more..." /> : 'Load More Photographs'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-ualg-navy text-white py-8 border-t border-ualg-blue/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400">
          <p className="font-semibold text-gray-300 mb-1">UNITY A LIVE GROUP</p>
          <p>© {new Date().getFullYear()} UNITY A LIVE GROUP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
