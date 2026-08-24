// frontend/src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Image as ImageIcon, UserPlus, Menu, X, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isGalleryActive = currentPath === '/';
  const isRegisterActive = currentPath === '/register';
  const isFundsActive = currentPath === '/funds';

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPath]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: 'Gallery', path: '/', icon: ImageIcon, isActive: isGalleryActive },
    { name: 'Register', path: '/register', icon: UserPlus, isActive: isRegisterActive },
    { name: 'Funds', path: '/funds', icon: Coins, isActive: isFundsActive },
  ];

  return (
    <nav className="bg-ualg-navy shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Org Name */}
          <Link to="/" className="flex items-center gap-3 group relative z-50">
            <img 
              src="/logo.png" 
              alt="Unity A Live Group Logo" 
              className="w-10 h-10 rounded-full object-cover shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0 border-2 border-ualg-gold" 
            />
            <div>
              <span className="text-white font-black text-sm sm:text-base tracking-wide leading-tight block truncate max-w-[150px] sm:max-w-full">
                UNITY A LIVE GROUP
              </span>
              <span className="text-ualg-gold text-[10px] sm:text-xs font-semibold tracking-wider">
                COMMUNITY PORTAL
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    link.isActive
                      ? 'bg-ualg-gold text-ualg-navy shadow-md'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative z-50 flex items-center justify-center w-11 h-11 bg-white/5 rounded-xl text-white hover:bg-white/10 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-ualg-gold"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 sm:top-20 left-0 w-full bg-ualg-navy border-t border-white/10 shadow-2xl md:hidden z-40 overflow-hidden"
            style={{ height: 'calc(100vh - 64px)' }}
          >
            <div className="px-4 py-6 flex flex-col gap-3">
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <motion.div 
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all duration-200 ${
                        link.isActive
                          ? 'bg-gradient-to-r from-ualg-gold to-amber-500 text-ualg-navy shadow-lg'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${link.isActive ? 'text-ualg-navy' : 'text-gray-400'}`} />
                      <span>{link.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
