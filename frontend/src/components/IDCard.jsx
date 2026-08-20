// frontend/src/components/IDCard.jsx
// Professional digital membership ID card for UNITY A LIVE GROUP.
// Uses inline styles to ensure html2canvas renders it correctly.

import { forwardRef } from 'react';
import QRCodeComponent from './QRCodeComponent.jsx';

const IDCard = forwardRef(function IDCard({ member }, ref) {
  const {
    uniqueId,
    fullName,
    age,
    mobileNumber,
    bloodGroup,
    city,
    photoUrl,
    createdAt,
  } = member;

  const registrationDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <div
      ref={ref}
      style={{
        width: '380px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        fontFamily: "'Inter', Arial, sans-serif",
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d1b4b 0%, #1a3a8f 50%, #0d1b4b 100%)',
          padding: '20px 24px 16px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-20px', left: '-20px',
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(240,165,0,0.1)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15px', right: '-15px',
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '10px', marginBottom: '4px',
        }}>
          {/* Shield icon */}
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#f0a500', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v6c0 5.25 3.75 10.1 9 11.25C17.25 23.1 21 18.25 21 13V7L12 2z"
                fill="#0d1b4b" />
            </svg>
          </div>
          <p style={{
            color: '#f0a500', fontSize: '15px', fontWeight: '900',
            letterSpacing: '1.5px', margin: 0, lineHeight: 1.2,
          }}>
            UNITY A LIVE GROUP
          </p>
        </div>

        <p style={{
          color: 'rgba(255,255,255,0.7)', fontSize: '9px',
          letterSpacing: '3px', fontWeight: '500',
          textTransform: 'uppercase', margin: '0',
        }}>
          OFFICIAL MEMBERSHIP CARD
        </p>

        {/* Gold divider */}
        <div style={{
          height: '2px', background: 'linear-gradient(90deg, transparent, #f0a500, transparent)',
          marginTop: '12px',
        }} />
      </div>

      {/* ── Photo ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        padding: '20px 0 12px', backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          border: '3px solid #f0a500',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(13,27,75,0.2)',
          backgroundColor: '#e2e8f0',
        }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={fullName}
              crossOrigin="anonymous"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: '#cbd5e1', fontSize: '32px',
            }}>
              👤
            </div>
          )}
        </div>
      </div>

      {/* ── Details ────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 24px 12px' }}>
        {/* Name */}
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <p style={{
            fontSize: '17px', fontWeight: '700', color: '#0d1b4b',
            margin: 0, letterSpacing: '0.3px',
          }}>
            {fullName}
          </p>
          <p style={{
            fontSize: '11px', color: '#f0a500', fontWeight: '700',
            letterSpacing: '2px', margin: '2px 0 0',
          }}>
            MEMBER
          </p>
        </div>

        {/* ID Badge */}
        <div style={{
          background: 'linear-gradient(135deg, #0d1b4b, #1a3a8f)',
          borderRadius: '8px', padding: '8px 16px',
          textAlign: 'center', marginBottom: '14px',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', letterSpacing: '2px', margin: '0 0 2px' }}>
            MEMBER ID
          </p>
          <p style={{
            color: '#f0a500', fontSize: '16px', fontWeight: '800',
            letterSpacing: '2px', margin: 0, fontFamily: 'monospace',
          }}>
            {uniqueId}
          </p>
        </div>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <DetailItem label="Age" value={age} />
          <DetailItem
            label="Blood Group"
            value={bloodGroup}
            valueStyle={{ color: '#dc2626', fontWeight: '700' }}
          />
          <DetailItem label="Mobile" value={mobileNumber} />
          <DetailItem label="City" value={city} />
        </div>

        {registrationDate && (
          <div style={{
            borderTop: '1px dashed #e2e8f0', paddingTop: '8px', marginTop: '4px',
          }}>
            <DetailItem label="Registered" value={registrationDate} />
          </div>
        )}
      </div>

      {/* ── QR Code ────────────────────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc',
        padding: '12px 24px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: '8px', color: '#94a3b8', letterSpacing: '1.5px', margin: '0 0 4px' }}>
            SCAN TO VERIFY
          </p>
          <p style={{ fontSize: '10px', color: '#0d1b4b', fontWeight: '600', margin: 0 }}>
            unity-a-live-group.vercel.app
          </p>
        </div>
        <QRCodeComponent uniqueId={uniqueId} size={72} />
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1b4b, #1a3a8f)',
        padding: '6px 24px',
        textAlign: 'center',
      }}>
        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: '8px',
          letterSpacing: '1.5px', margin: 0,
        }}>
          UNITY A LIVE GROUP • OFFICIAL ID • NOT TRANSFERABLE
        </p>
      </div>
    </div>
  );
});

function DetailItem({ label, value, valueStyle = {} }) {
  return (
    <div>
      <p style={{
        fontSize: '9px', color: '#94a3b8', letterSpacing: '1px',
        textTransform: 'uppercase', margin: '0 0 2px', fontWeight: '500',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '12px', color: '#1e293b', fontWeight: '600',
        margin: 0, ...valueStyle,
      }}>
        {value || '—'}
      </p>
    </div>
  );
}

export default IDCard;
