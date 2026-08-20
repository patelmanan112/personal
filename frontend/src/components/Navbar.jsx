// frontend/src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Shield, Image as ImageIcon, UserPlus } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isGalleryActive = currentPath === '/';
  const isRegisterActive = currentPath === '/register';

  return (
    <nav className="bg-ualg-navy shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Org Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-ualg-gold rounded-full flex items-center justify-center shadow-md group-hover:bg-ualg-gold-light transition-colors flex-shrink-0">
              <Shield className="w-5 h-5 text-ualg-navy" />
            </div>
            <div>
              <span className="text-white font-black text-sm sm:text-base tracking-wide leading-tight block">
                UNITY A LIVE GROUP
              </span>
              <span className="text-ualg-gold text-xs font-semibold tracking-wider">
                COMMUNITY PORTAL
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isGalleryActive
                  ? 'bg-ualg-gold text-ualg-navy shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Gallery</span>
            </Link>

            <Link
              to="/register"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isRegisterActive
                  ? 'bg-ualg-gold text-ualg-navy shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register as Member</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
