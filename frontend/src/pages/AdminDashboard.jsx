// frontend/src/pages/AdminDashboard.jsx
// Full admin dashboard with Member Registrations & Gallery Management

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, TrendingUp, Calendar, Search, Filter, ChevronLeft, ChevronRight,
  LogOut, Eye, Trash2, Shield, RefreshCw, AlertCircle, Image as ImageIcon,
  Plus, Download, CheckCircle, ExternalLink
} from 'lucide-react';
import { PageLoading, ButtonLoading } from '../components/Loading.jsx';
import {
  getAdminStats, getRegistrations, deleteRegistration, adminLogout,
} from '../services/api.js';
import { BLOOD_GROUPS } from '../utils/validation.js';
import { fetchGallery, deleteGalleryImage } from '../gallery/services/galleryApi.js';
import GalleryUploadModal from '../gallery/components/GalleryUploadModal.jsx';
import { downloadGalleryImage, getDownloadFilename } from '../gallery/utils/downloadImage.js';
import { formatFileSize } from '../gallery/utils/imageValidation.js';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Navigation tab: 'members' | 'gallery'
  const [activeTab, setActiveTab] = useState('members');

  // Member stats & registrations state
  const [stats, setStats] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Registration Filters
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);

  // Registration Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState('');

  // ── Gallery Management State ──────────────────────────────────────────────
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryTotal, setGalleryTotal] = useState(0);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteGalleryTarget, setDeleteGalleryTarget] = useState(null);
  const [deletingGallery, setDeletingGallery] = useState(false);
  const [gallerySuccessMsg, setGallerySuccessMsg] = useState('');

  // ── Load stats ────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const res = await getAdminStats();
      if (res.success) setStats(res.data);
    } catch {
      // stats load failure is non-critical
    }
  }, []);

  // ── Load registrations ────────────────────────────────────────────────────
  const loadRegistrations = useCallback(async (params) => {
    setTableLoading(true);
    setError('');
    try {
      const res = await getRegistrations(params);
      if (res.success) {
        setRegistrations(res.data);
        setPagination(res.pagination);
      }
    } catch {
      setError('Failed to load registrations. Please try again.');
    } finally {
      setTableLoading(false);
    }
  }, []);

  // ── Load Gallery Images ───────────────────────────────────────────────────
  const loadGallery = useCallback(async () => {
    setGalleryLoading(true);
    setGalleryError('');
    try {
      const res = await fetchGallery({ page: 1, limit: 100 });
      if (res.success) {
        setGalleryImages(res.data || []);
        setGalleryTotal(res.total ?? (res.data ? res.data.length : 0));
      } else {
        setGalleryError(res.message || 'Failed to load gallery images.');
      }
    } catch {
      setGalleryError('Failed to load gallery images. Please try again.');
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    Promise.all([loadStats(), loadGallery()]).finally(() => setLoading(false));
  }, [loadStats, loadGallery]);

  useEffect(() => {
    loadRegistrations({ page, limit: 20, search, bloodGroup, city });
  }, [page, search, bloodGroup, city, loadRegistrations]);

  // ── Search with debounce ──────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminLogout();
    } catch {}
    navigate('/admin/login', { replace: true });
  };

  // ── Delete Registration ───────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRegistration(deleteTarget);
      setDeleteTarget(null);
      loadStats();
      loadRegistrations({ page, limit: 20, search, bloodGroup, city });
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Delete Gallery Image ──────────────────────────────────────────────────
  const confirmDeleteGalleryImage = async () => {
    if (!deleteGalleryTarget) return;
    setDeletingGallery(true);
    try {
      await deleteGalleryImage(deleteGalleryTarget.id);
      setDeleteGalleryTarget(null);
      setGallerySuccessMsg('Image deleted successfully.');
      setTimeout(() => setGallerySuccessMsg(''), 4000);
      loadGallery();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete gallery image.');
    } finally {
      setDeletingGallery(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* ── Topbar ───────────────────────────────────────────────────────── */}
      <header className="bg-ualg-navy shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ualg-gold rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-ualg-navy" />
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none">UNITY A LIVE GROUP</p>
              <p className="text-blue-300 text-xs">Admin Management Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Live Website
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 text-sm text-blue-300 hover:text-white transition-colors disabled:opacity-50"
            >
              {loggingOut ? <ButtonLoading text="Logging out..." /> : <><LogOut className="w-4 h-4" /> Logout</>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === 'members'
                ? 'bg-ualg-navy text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Member Registrations</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'members' ? 'bg-ualg-gold text-ualg-navy' : 'bg-gray-100 text-gray-600'
            }`}>
              {pagination.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === 'gallery'
                ? 'bg-ualg-navy text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Gallery Management</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'gallery' ? 'bg-ualg-gold text-ualg-navy' : 'bg-gray-100 text-gray-600'
            }`}>
              {galleryTotal}
            </span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: MEMBER REGISTRATIONS                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'members' && (
          <>
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard
                  icon={<Users className="w-7 h-7 text-ualg-blue" />}
                  label="Total Registrations"
                  value={stats.total.toLocaleString('en-IN')}
                  color="border-ualg-blue"
                />
                <StatCard
                  icon={<TrendingUp className="w-7 h-7 text-green-500" />}
                  label="Today"
                  value={stats.today.toLocaleString('en-IN')}
                  color="border-green-500"
                />
                <StatCard
                  icon={<Calendar className="w-7 h-7 text-purple-500" />}
                  label="This Month"
                  value={stats.thisMonth.toLocaleString('en-IN')}
                  color="border-purple-500"
                />
              </div>
            )}

            {/* Search + Filters */}
            <div className="card mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ID or mobile..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="input-field pl-9 text-sm"
                  />
                </div>

                {/* Blood Group */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={bloodGroup}
                    onChange={(e) => { setBloodGroup(e.target.value); setPage(1); }}
                    className="input-field pl-9 text-sm w-full sm:w-40 appearance-none cursor-pointer"
                  >
                    <option value="">All Blood Groups</option>
                    {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>

                {/* City */}
                <input
                  type="text"
                  placeholder="Filter by city..."
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setPage(1); }}
                  className="input-field text-sm w-full sm:w-40"
                />

                {/* Refresh */}
                <button
                  onClick={() => loadRegistrations({ page, limit: 20, search, bloodGroup, city })}
                  className="btn-outline flex items-center gap-2 text-sm px-4 py-2.5 whitespace-nowrap"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4" role="alert">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Registrations Table */}
            <div className="card shadow-sm overflow-hidden p-0">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-700">
                  Registrations
                  <span className="ml-2 text-xs bg-ualg-navy text-white px-2 py-0.5 rounded-full">
                    {pagination.total}
                  </span>
                </h2>
              </div>

              <div className="overflow-x-auto">
                {tableLoading ? (
                  <div className="p-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No registrations found.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Photo', 'Member ID', 'Full Name', 'Age', 'Mobile', 'Blood', 'City', 'Date', ''].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {registrations.map((r) => (
                        <tr key={r.uniqueId} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-4 py-3">
                            <img
                              src={r.photoUrl}
                              alt={r.fullName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=?'; }}
                            />
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-ualg-blue font-semibold whitespace-nowrap">
                            {r.uniqueId}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{r.fullName}</td>
                          <td className="px-4 py-3 text-gray-600">{r.age}</td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">{r.mobileNumber}</td>
                          <td className="px-4 py-3">
                            <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded">
                              {r.bloodGroup}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{r.city}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                            {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/admin/registration/${r.uniqueId}`}
                                className="p-1.5 rounded-lg bg-ualg-blue/10 text-ualg-blue hover:bg-ualg-blue hover:text-white transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => setDeleteTarget(r.uniqueId)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Showing {(pagination.page - 1) * pagination.limit + 1}–
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {getPageNumbers(page, pagination.totalPages).map((p, i) =>
                      p === '...' ? (
                        <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            p === page
                              ? 'bg-ualg-blue text-white'
                              : 'border border-gray-200 hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page >= pagination.totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: GALLERY MANAGEMENT                                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'gallery' && (
          <div>
            {/* Gallery Stats & Add Button Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-bold text-ualg-navy flex items-center gap-2">
                  <span>Gallery Management</span>
                  <span className="text-xs bg-ualg-gold text-ualg-navy font-bold px-2.5 py-0.5 rounded-full">
                    {galleryTotal} Photos
                  </span>
                </h1>
                <p className="text-gray-500 text-xs mt-0.5">
                  Upload and manage Ganpati celebration photographs showcased on the landing page.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={loadGallery}
                  disabled={galleryLoading}
                  className="btn-outline flex items-center justify-center gap-1.5 text-xs py-2.5 px-3 flex-1 sm:flex-none"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${galleryLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary flex items-center justify-center gap-2 text-sm py-2.5 px-5 flex-1 sm:flex-none shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Photo / Video</span>
                </button>
              </div>
            </div>

            {/* Success Message */}
            {gallerySuccessMsg && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl p-3.5 mb-6 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>{gallerySuccessMsg}</span>
              </div>
            )}

            {/* Error Message */}
            {galleryError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 mb-6 text-sm">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{galleryError}</span>
              </div>
            )}

            {/* Gallery Grid */}
            {galleryLoading ? (
              <div className="card text-center py-16 text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-ualg-blue" />
                <p className="font-semibold text-gray-600 text-sm">Loading gallery media...</p>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="card text-center py-16 border-2 border-dashed border-gray-200">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-700 mb-1">No Gallery Media Uploaded</h3>
                <p className="text-gray-400 text-xs max-w-sm mx-auto mb-6">
                  Click the "Add Photo / Video" button above to upload Ganpati celebration photographs or video moments.
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4"
                >
                  <Plus className="w-4 h-4" /> Add First Media
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {galleryImages.map((item, idx) => {
                  const isItemVideo = item.mediaType === 'video' || item.imageUrl?.includes('/video/');
                  let thumbSrc = item.imageUrl;
                  if (isItemVideo && item.imageUrl?.includes('/video/upload/')) {
                    thumbSrc = item.imageUrl.replace('/video/upload/', '/video/upload/so_0,w_500,h_500,c_fill,q_auto,f_jpg/').replace(/\.[^/.]+$/, '.jpg');
                  } else if (item.imageUrl?.includes('/image/upload/')) {
                    thumbSrc = item.imageUrl.replace('/image/upload/', '/image/upload/w_500,h_500,c_fill,q_auto,f_auto/');
                  }

                  return (
                    <div
                      key={item.id}
                      className="card p-3 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between border border-gray-100 overflow-hidden"
                    >
                      {/* Thumbnail */}
                      <div className="relative rounded-xl overflow-hidden bg-slate-900 mb-3 aspect-square flex items-center justify-center">
                        <img
                          src={thumbSrc}
                          alt={item.title || item.originalFilename || `Item ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            if (isItemVideo) e.target.style.opacity = '0.3';
                          }}
                        />

                        {/* Type badge */}
                        <div className="absolute top-2 left-2 z-10">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm ${
                            isItemVideo ? 'bg-amber-500 text-slate-900' : 'bg-blue-600 text-white'
                          }`}>
                            {isItemVideo ? '🎬 Video' : '📷 Photo'}
                          </span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="mb-3 px-1">
                        <p className="font-bold text-gray-800 text-xs truncate" title={item.title || item.originalFilename}>
                          {item.title || item.originalFilename || `Ganpati Item #${item.id}`}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                          <span>
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            }) : '—'}
                          </span>
                          {item.fileSize && <span>{formatFileSize(item.fileSize)}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                        <button
                          onClick={() => downloadGalleryImage(item.imageUrl, getDownloadFilename(item, idx))}
                          className="flex-1 btn-outline py-1.5 px-2 text-xs flex items-center justify-center gap-1"
                          title="Download file"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>

                        <button
                          onClick={() => setDeleteGalleryTarget(item)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete media"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Registration Delete Confirm Modal ───────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              Are you sure you want to delete this registration?
            </p>
            <p className="font-mono text-xs bg-gray-100 px-3 py-2 rounded-lg text-gray-700 mb-6">
              {deleteTarget}
            </p>
            <p className="text-xs text-red-500 mb-6">
              This will permanently delete the record and profile photo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 btn-outline py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 btn-danger py-2.5 flex items-center justify-center gap-2"
              >
                {deleting ? <ButtonLoading text="Deleting..." /> : <><Trash2 className="w-4 h-4" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Gallery Media Delete Confirm Modal ─────────────────────────────── */}
      {deleteGalleryTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">
                  Delete {deleteGalleryTarget.mediaType === 'video' ? 'Video' : 'Photo'}?
                </h3>
                <p className="text-xs text-gray-500">ID #{deleteGalleryTarget.id}</p>
              </div>
            </div>

            {/* Thumbnail or Video preview in delete modal */}
            <div className="rounded-xl overflow-hidden bg-gray-900 mb-4 max-h-36 flex items-center justify-center border border-gray-200">
              {deleteGalleryTarget.mediaType === 'video' || deleteGalleryTarget.imageUrl?.includes('/video/') ? (
                <video
                  src={deleteGalleryTarget.imageUrl}
                  className="max-h-36 object-contain"
                  controls
                />
              ) : (
                <img
                  src={deleteGalleryTarget.imageUrl}
                  alt="Preview"
                  className="max-h-36 object-contain"
                />
              )}
            </div>

            <p className="text-gray-600 text-sm mb-2">
              Are you sure you want to permanently delete this from the Ganpati Gallery?
            </p>
            <p className="text-xs text-red-500 mb-6">
              This action cannot be undone. The database record and Cloudinary asset will be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteGalleryTarget(null)}
                disabled={deletingGallery}
                className="flex-1 btn-outline py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGalleryImage}
                disabled={deletingGallery}
                className="flex-1 btn-danger py-2.5 text-sm flex items-center justify-center gap-2"
              >
                {deletingGallery ? <ButtonLoading text="Deleting..." /> : <><Trash2 className="w-4 h-4" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Gallery Upload Modal ───────────────────────────────────────────── */}
      {showUploadModal && (
        <GalleryUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={(newImg) => {
            setGallerySuccessMsg('Image uploaded successfully!');
            setTimeout(() => setGallerySuccessMsg(''), 4000);
            loadGallery();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-gray-800 mt-1">{value}</p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  );
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}
