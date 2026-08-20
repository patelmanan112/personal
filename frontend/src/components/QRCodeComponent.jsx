// frontend/src/components/QRCodeComponent.jsx
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeComponent({ uniqueId, size = 100 }) {
  const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
  const verificationUrl = `${baseUrl}/id/${uniqueId}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <QRCodeSVG
        value={verificationUrl}
        size={size}
        level="M"
        includeMargin={true}
        style={{ borderRadius: '4px' }}
      />
      <p style={{ fontSize: '9px', color: '#666', textAlign: 'center', marginTop: '2px' }}>
        Scan to Verify
      </p>
    </div>
  );
}
