// frontend/src/pages/VerifyID.jsx
// Public ID verification page — accessed via QR code scan

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ShieldCheck, ArrowLeft, Droplets, User, Phone, MapPin, Hash, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { PageLoading } from '../components/Loading.jsx';
import { verifyMemberId } from '../services/api.js';

export default function VerifyID() {
  const { uniqueId } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uniqueId) return;

    verifyMemberId(uniqueId)
      .then((res) => {
        if (res.success && res.data) {
          setMember(res.data);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError('Verification service temporarily unavailable. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  }, [uniqueId]);

  if (loading) return <PageLoading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-10">

        {/* ID Not Found */}
        {notFound && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">ID NOT FOUND</h1>
            <p className="text-gray-500 mb-2">
              The membership ID{' '}
              <span className="font-mono font-bold text-gray-700">{uniqueId}</span>{' '}
              could not be verified.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              This ID does not exist in UNITY A LIVE GROUP's records.
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        )}

        {/* Service error */}
        {error && !notFound && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
              <XCircle className="w-10 h-10 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">Verification Failed</h1>
            <p className="text-gray-500 mb-8">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Verified member */}
        {member && (
          <>
            {/* Verified banner */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 mb-6 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-green-800 text-sm">✓ ID VERIFIED</p>
                <p className="text-green-600 text-xs">This is an official UNITY A LIVE GROUP member</p>
              </div>
            </div>

            {/* Member card */}
            <div className="card shadow-xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-ualg-navy -mx-6 -mt-6 px-6 pt-6 pb-5 mb-6 text-center">
                <p className="text-ualg-gold font-black text-sm tracking-widest">
                  UNITY A LIVE GROUP
                </p>
                <p className="text-gray-400 text-xs tracking-wider mt-1">VERIFIED MEMBER</p>
              </div>

              {/* Photo */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src={member.photoUrl}
                    alt={member.fullName}
                    className="w-28 h-28 object-cover rounded-full border-4 border-ualg-gold shadow-lg"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/112?text=Photo'; }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-md">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-ualg-navy">{member.fullName}</h1>
                <p className="text-xs text-ualg-gold font-bold tracking-widest uppercase mt-1">Member</p>
              </div>

              {/* Member ID */}
              <div className="bg-ualg-navy rounded-xl px-6 py-3 text-center mb-6">
                <p className="text-gray-400 text-xs tracking-widest uppercase mb-1">Member ID</p>
                <p className="text-ualg-gold text-xl font-black font-mono tracking-widest">
                  {member.uniqueId}
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                <VerifyField icon={<Hash className="w-4 h-4" />} label="Age" value={member.age} />
                <VerifyField
                  icon={<Droplets className="w-4 h-4 text-red-500" />}
                  label="Blood Group"
                  value={member.bloodGroup}
                  valueClass="text-red-600 font-bold text-lg"
                />
                <VerifyField
                  icon={<Phone className="w-4 h-4" />}
                  label="Mobile"
                  value={`${member.mobileNumber.slice(0, 4)}XXXXXX`}
                />
                <VerifyField icon={<MapPin className="w-4 h-4" />} label="City" value={member.city} />
                {member.createdAt && (
                  <VerifyField
                    icon={<Calendar className="w-4 h-4" />}
                    label="Member Since"
                    value={new Date(member.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                    className="col-span-2"
                  />
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-xs text-gray-400">
                Verified by <span className="font-semibold text-ualg-blue">UNITY A LIVE GROUP</span> official portal
              </p>
              <Link to="/register" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-ualg-blue mt-2 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Register as a Member
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function VerifyField({ icon, label, value, valueClass = '', className = '' }) {
  return (
    <div className={`bg-gray-50 rounded-xl p-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`font-semibold text-gray-800 ${valueClass}`}>{value || '—'}</p>
    </div>
  );
}
