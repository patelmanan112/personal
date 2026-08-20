// frontend/src/pages/RegistrationSuccess.jsx
// Shown after successful registration — displays the ID card with download buttons.

import { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, FileImage, Share2, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import IDCard from '../components/IDCard.jsx';
import { ButtonLoading } from '../components/Loading.jsx';
import { downloadAsPDF, downloadAsPNG } from '../utils/downloadIdCard.js';

export default function RegistrationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const idCardRef = useRef(null);

  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingPNG, setDownloadingPNG] = useState(false);

  // Get member data from router state or sessionStorage fallback
  const member = location.state?.member
    || (() => {
      try { return JSON.parse(sessionStorage.getItem('ualg_member') || 'null'); }
      catch { return null; }
    })();

  useEffect(() => {
    // Redirect if no member data
    if (!member) {
      navigate('/', { replace: true });
    }
  }, [member, navigate]);

  if (!member) return null;

  const handleDownloadPDF = async () => {
    if (!idCardRef.current) return;
    setDownloadingPDF(true);
    try {
      await downloadAsPDF(idCardRef.current, member.uniqueId);
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('PDF download failed. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!idCardRef.current) return;
    setDownloadingPNG(true);
    try {
      await downloadAsPNG(idCardRef.current, member.uniqueId);
    } catch (err) {
      console.error('PNG download failed:', err);
      alert('PNG download failed. Please try again.');
    } finally {
      setDownloadingPNG(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Success banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 shadow-lg">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-ualg-navy">Registration Successful!</h1>
          <p className="text-gray-500 mt-2">
            Welcome to <span className="font-semibold text-ualg-blue">UNITY A LIVE GROUP</span>
          </p>
        </div>

        {/* Unique ID display */}
        <div className="card text-center mb-6 bg-ualg-navy text-white shadow-xl">
          <p className="text-sm text-blue-300 font-medium uppercase tracking-widest mb-2">
            Your Unique Membership ID
          </p>
          <p className="text-3xl font-black tracking-widest text-ualg-gold font-mono">
            {member.uniqueId}
          </p>
          <p className="text-xs text-blue-300 mt-2">Save this ID — it's your permanent membership identifier</p>
        </div>

        {/* ID Card */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider text-center mb-4">
            Your Digital ID Card
          </h2>
          <div className="flex justify-center">
            <IDCard ref={idCardRef} member={member} />
          </div>
        </div>

        {/* Download buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF || downloadingPNG}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {downloadingPDF ? (
              <ButtonLoading text="Generating..." />
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={downloadingPDF || downloadingPNG}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            {downloadingPNG ? (
              <ButtonLoading text="Generating..." />
            ) : (
              <>
                <FileImage className="w-4 h-4" />
                Download PNG
              </>
            )}
          </button>
        </div>

        {/* Member info summary */}
        <div className="card border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Registration Summary
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Full Name', value: member.fullName },
              { label: 'Age', value: member.age },
              { label: 'Blood Group', value: member.bloodGroup },
              { label: 'Mobile', value: member.mobileNumber },
              { label: 'City', value: member.city },
              { label: 'Member ID', value: member.uniqueId },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/register')}
            className="btn-outline flex items-center justify-center gap-2 flex-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Register Another
          </button>
          <a
            href={`/id/${member.uniqueId}`}
            className="btn-primary flex items-center justify-center gap-2 flex-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Share2 className="w-4 h-4" />
            View Verification Page
          </a>
        </div>
      </main>
    </div>
  );
}
