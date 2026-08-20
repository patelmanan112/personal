// frontend/src/components/Navbar.jsx
import { Shield } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-ualg-navy shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-ualg-gold rounded-full flex items-center justify-center shadow-md group-hover:bg-ualg-gold-light transition-colors">
              <Shield className="w-5 h-5 text-ualg-navy" />
            </div>
            <div>
              <span className="text-white font-black text-sm sm:text-base tracking-wide leading-tight block">
                UNITY A LIVE GROUP
              </span>
              <span className="text-ualg-gold text-xs font-medium tracking-widest">
                DIGITAL MEMBERSHIP
              </span>
            </div>
          </a>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Official Portal
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
