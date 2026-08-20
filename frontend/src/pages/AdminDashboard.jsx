// frontend/src/pages/AdminDashboard.jsx
// Full admin dashboard with stats, search, filters, table, and pagination

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, TrendingUp, Calendar, Search, Filter, ChevronLeft, ChevronRight,
  LogOut, Eye, Trash2, Shield, RefreshCw, AlertCircle,
} from 'lucide-react';
import { PageLoading, ButtonLoading } from '../components/Loading.jsx';
import {
  getAdminStats, getRegistrations, deleteRegistration, adminLogout,
} from '../services/api.js';
import { BLOOD_GROUPS } from '../utils/validation.js';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState('');

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

  // Initial load
  useEffect(() => {
    Promise.all([loadStats()]).finally(() => setLoading(false));
  }, [loadStats]);

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

  // ── Delete ────────────────────────────────────────────────────────────────
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

  if (loading) return <PageLoading />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Topbar ───────────────────────────────────────────────────────── */}
      <header className="bg-ualg-navy shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ualg-gold rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-ualg-navy" />
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none">UNITY A LIVE GROUP</p>
              <p className="text-blue-300 text-xs">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 text-sm text-blue-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {loggingOut ? <ButtonLoading text="Logging out..." /> : <><LogOut className="w-4 h-4" /> Logout</>}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Stats ─────────────────────────────────────────────────────── */}
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

        {/* ── Search + Filters ──────────────────────────────────────────── */}
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

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4" role="alert">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* ── Table ─────────────────────────────────────────────────────── */}
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
      </main>

      {/* ── Delete Confirm Modal ──────────────────────────────────────────── */}
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
              This will permanently delete the record and the profile photo from Cloudinary.
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
