// frontend/src/gallery/components/GalleryHero.jsx
import { Link } from 'react-router-dom';
import { Camera, Users, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function GalleryHero() {
  return (
    <section
      className="relative text-white py-12 sm:py-20 lg:py-28 px-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d1b4b 0%, #1a3a8f 40%, #7c3aed 80%, #0d1b4b 100%)',
      }}
    >
      {/* Decorative circles - Scaled down for mobile */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 sm:-top-20 sm:-left-20 w-40 h-40 sm:w-72 sm:h-72 rounded-full opacity-10 bg-ualg-gold" />
        <div className="absolute -bottom-10 -right-10 sm:-bottom-16 sm:-right-16 w-40 h-40 sm:w-64 sm:h-64 rounded-full opacity-10 bg-purple-600" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 rounded-full opacity-[0.03] bg-ualg-gold" />
      </div>

      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        
        {/* Left Side: Hero Text */}
        <div className="flex-1 text-center lg:text-left">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-6 shadow-2xl bg-ualg-gold/20 border-2 border-ualg-gold/40">
            <Camera className="w-8 h-8 sm:w-9 sm:h-9 text-ualg-gold" />
          </div>

          {/* Org name */}
          <p className="text-ualg-gold font-black tracking-widest text-[10px] sm:text-xs uppercase mb-3">
            UNITY A LIVE GROUP
          </p>

          {/* Title - Responsive using clamp/classes */}
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black mb-4 leading-tight tracking-tight">
            GANPATI{' '}
            <span className="text-ualg-gold">GALLERY</span>
          </h1>

          {/* Subtitle */}
          <p className="text-blue-200 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
            Celebrating devotion, togetherness and unforgettable moments.
          </p>

          {/* CTA */}
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 bg-ualg-gold text-ualg-navy w-full sm:w-auto"
          >
            <Users className="w-5 h-5" />
            Register as Member
          </Link>
        </div>

        {/* Right Side: Upcoming Announcement Card */}
        <div className="w-full lg:w-auto flex-shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md mx-auto w-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Upcoming Event</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
              🥁 Ganesh Agaman
            </h3>
            
            <div className="space-y-3 mb-6 mt-6">
              <div className="flex items-center gap-3 text-blue-100 bg-black/20 p-3 rounded-xl border border-white/5">
                <Calendar className="w-5 h-5 text-ualg-gold" />
                <span className="font-semibold text-sm sm:text-base">13 September 2026</span>
              </div>
              <div className="flex items-center gap-3 text-blue-100 bg-black/20 p-3 rounded-xl border border-white/5">
                <Clock className="w-5 h-5 text-ualg-gold" />
                <span className="font-semibold text-sm sm:text-base">6:00 PM onwards</span>
              </div>
            </div>

            <button className="w-full py-3.5 rounded-xl bg-white text-ualg-navy font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors active:scale-95 group shadow-md">
              View Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
