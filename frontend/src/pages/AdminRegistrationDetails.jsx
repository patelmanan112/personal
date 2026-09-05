// frontend/src/pages/AdminRegistrationDetails.jsx
// Detailed view of a single registration for admins with ID Card download support

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Download, FileImage, Shield, Trash2, Calendar, User, Phone, MapPin, Hash, Droplets, AlertCircle
} from 'lucide-react';
import { PageLoading, ButtonLoading } from '../components/Loading.jsx';
import IDCard from '../components/IDCard.jsx';
import { getRegistrationByUniqueId, deleteRegistration, adminLogout } from '../services/api.js';
import { downloadAsPDF, downloadAsPNG } from '../utils/downloadIdCard.js';

export default function AdminRegistrationDetails() {
  const { uniqueId } = useParams();
  const navigate = useNavigate();
  const idCardRef = useRef(null);

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingPNG, setDownloadingPNG] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getRegistrationByUniqueId(uniqueId)
      .then((res) => {
        if (res.success) setMember(res.data);
        else setError(res.message || 'Registration not found');
      })
      .catch((err) => {
        // 401 is handled by the axios interceptor (redirects to login)
        if (err.response?.status === 401) return;
        if (err.response?.status === 404) {
          setError('Registration not found. The ID may be invalid or deleted.');
        } else {
          setError(err.response?.data?.message || 'Could not fetch registration details. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  }, [uniqueId]);

  const handleDownloadPDF = async () => {
    if (!idCardRef.current || !member) return;
    setDownloadingPDF(true);
    try {
      await downloadAsPDF(idCardRef.current, member.uniqueId);
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!idCardRef.current || !member) return;
    setDownloadingPNG(true);
    try {
      await downloadAsPNG(idCardRef.current, member.uniqueId);
    } catch (err) {
      console.error(err);
      alert('Failed to download PNG');
    } finally {
      setDownloadingPNG(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRegistration(uniqueId);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete registration');
      setDeleting(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Topbar */}
      <header className="bg-ualg-navy shadow-lg sticky top-0 z-10 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="text-blue-300 hover:text-white transition-colors mr-1">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <img 
              src="/logo.png" 
              alt="Unity A Live Group Logo" 
              className="w-8 h-8 rounded-full object-cover border-2 border-ualg-gold flex-shrink-0" 
            />
            <div>
              <p className="text-white font-black text-sm leading-none">UNITY A LIVE GROUP</p>
              <p className="text-blue-300 text-xs">Registration Details</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await adminLogout();
              navigate('/admin/login');
            }}
            className="text-xs text-blue-300 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ualg-blue hover:text-ualg-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {error ? (
          <div className="card text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Link to="/admin/dashboard" className="btn-primary inline-flex items-center gap-2">
              Return to Dashboard
            </Link>
          </div>
        ) : member ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Detailed Info & Actions */}
            <div className="lg:col-span-7 space-y-5">
              {/* Member Summary Card */}
              <div className="card shadow-md">
                <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-5 gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-mono text-ualg-blue bg-blue-50 px-2.5 py-1 rounded-full font-bold inline-block">
                      {member.uniqueId}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-2 break-words">{member.fullName}</h1>
                    <p className="text-xs text-gray-400 mt-1">
                      Registered on {new Date(member.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <img
                    src={member.photoUrl}
                    alt={member.fullName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-ualg-gold shadow-md flex-shrink-0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoItem icon={<User className="w-4 h-4" />} label="Full Name" value={member.fullName} />
                  <InfoItem icon={<Hash className="w-4 h-4" />} label="Age" value={`${member.age} years`} />
                  <InfoItem icon={<Phone className="w-4 h-4" />} label="Mobile Number" value={member.mobileNumber} />
                  <InfoItem icon={<Droplets className="w-4 h-4 text-red-500" />} label="Blood Group" value={member.bloodGroup} valueClass="text-red-600 font-bold" />
                  <InfoItem icon={<MapPin className="w-4 h-4" />} label="City" value={member.city} />
                  <InfoItem icon={<Calendar className="w-4 h-4" />} label="Registration Date" value={new Date(member.createdAt).toLocaleDateString('en-IN')} />
                </div>
              </div>

              {/* Actions Card */}
              <div className="card shadow-md">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloadingPDF || downloadingPNG}
                    className="btn-primary flex-1 min-w-[130px] flex items-center justify-center gap-2 text-sm"
                  >
                    {downloadingPDF ? <ButtonLoading text="PDF..." /> : <><Download className="w-4 h-4" /> Download PDF</>}
                  </button>
                  <button
                    onClick={handleDownloadPNG}
                    disabled={downloadingPDF || downloadingPNG}
                    className="btn-secondary flex-1 min-w-[130px] flex items-center justify-center gap-2 text-sm"
                  >
                    {downloadingPNG ? <ButtonLoading text="PNG..." /> : <><FileImage className="w-4 h-4" /> Download PNG</>}
                  </button>
                  <button
                    onClick={() => setDeleteModal(true)}
                    className="btn-danger flex items-center justify-center gap-2 text-sm px-4"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Digital ID Preview */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Digital ID Card Preview</h2>
              <div className="lg:sticky lg:top-24 w-full flex justify-center overflow-x-auto">
                <IDCard ref={idCardRef} member={member} />
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800">Delete Member Registration</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to delete <span className="font-semibold">{member?.fullName}</span> ({member?.uniqueId})?
            </p>
            <p className="text-xs text-red-500 mb-6">
              This action cannot be undone. The database record and Cloudinary image will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                disabled={deleting}
                className="flex-1 btn-outline py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 btn-danger py-2 text-sm flex items-center justify-center gap-2"
              >
                {deleting ? <ButtonLoading text="Deleting..." /> : <><Trash2 className="w-4 h-4" /> Confirm Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value, valueClass = 'text-gray-800' }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
        {icon}
        <span className="uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className={`font-semibold text-sm ${valueClass}`}>{value || '—'}</p>
    </div>
  );
}
