import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ualg-navy text-white py-12 border-t border-ualg-blue/30 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        <img 
          src="/logo.png" 
          alt="Unity A Live Group Logo" 
          className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-ualg-gold mb-6" 
        />
        
        <h3 className="text-xl font-black text-white mb-2 tracking-wide">UNITY A LIVE GROUP</h3>
        <p className="text-gray-400 text-sm mb-8 text-center max-w-sm">
          Celebrating devotion, togetherness, and unforgettable moments of Ganesh Chaturthi.
        </p>

        <a 
          href="https://www.instagram.com/unity_a_live_group_/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 mb-10"
        >
          <Instagram className="w-5 h-5" />
          Follow on Instagram
        </a>

        <div className="w-full h-px bg-white/10 mb-8"></div>

        <div className="text-center text-xs text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} UNITY A LIVE GROUP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
