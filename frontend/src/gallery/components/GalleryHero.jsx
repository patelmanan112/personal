// frontend/src/gallery/components/GalleryHero.jsx
import { Link } from 'react-router-dom';
import { Camera, Users } from 'lucide-react';

export default function GalleryHero() {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #0d1b4b 0%, #1a3a8f 40%, #7c3aed 80%, #0d1b4b 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="text-white py-20 sm:py-28 px-4"
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: '#f0a500' }} />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-10"
          style={{ background: '#7c3aed' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: '#f0a500' }} />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-2xl"
          style={{ background: 'rgba(240,165,0,0.2)', border: '2px solid rgba(240,165,0,0.4)' }}>
          <Camera className="w-9 h-9 text-ualg-gold" />
        </div>

        {/* Org name */}
        <p className="text-ualg-gold font-black tracking-widest text-xs sm:text-sm uppercase mb-3">
          UNITY A LIVE GROUP
        </p>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
          GANPATI{' '}
          <span style={{ color: '#f0a500' }}>GALLERY</span>
        </h1>

        {/* Subtitle */}
        <p className="text-blue-200 text-lg sm:text-xl max-w-xl mx-auto mb-8 leading-relaxed">
          Celebrating devotion, togetherness and unforgettable moments.
        </p>

        {/* CTA */}
        <Link
          to="/register"
          className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
          style={{ background: '#f0a500', color: '#0d1b4b' }}
        >
          <Users className="w-5 h-5" />
          Register as Member
        </Link>
      </div>
    </section>
  );
}
