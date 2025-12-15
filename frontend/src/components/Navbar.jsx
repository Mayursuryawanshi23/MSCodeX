import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// Theme toggle removed

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  return (
    <>
      <div className="nav flex px-4 sm:px-6 items-center justify-between h-16 sm:h-20 bg-gradient-to-r from-gray-900/40 to-black/60 border-b border-gray-800/50 sticky top-0 z-50" style={{transform: 'translateZ(0)', backfaceVisibility: 'hidden'}}>
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0 pl-8 sm:pl-12" style={{transform: 'translateZ(0)'}}>
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex items-center justify-center font-bold text-black text-xs sm:text-base transition-all duration-200 group-hover:shadow-lg group-hover:shadow-green-500/25" style={{background: 'linear-gradient(135deg, #10b981, #3b82f6)'}}>CY</div>
          <span className="font-bold text-lg sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 hidden xs:inline">CatalyX</span>
        </Link>

        {/* Right side controls - Logout and Theme */}
        <div className="hidden sm:flex items-center gap-3 pr-4 sm:pr-6">
          <button
            onClick={handleLogout}
            className="px-4 sm:px-6 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 font-semibold text-sm sm:text-base rounded-lg border border-red-500/30 transition-all duration-200 hover:border-red-500/60"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden flex flex-col gap-1.5 p-2 text-gray-300 hover:text-white transition-colors"
        >
          <div className={`w-6 h-0.5 bg-current transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-current transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-current transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-black/95 border-b border-gray-800/50 py-4 px-4">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 font-semibold rounded-lg border border-red-500/30 transition-all duration-200 hover:border-red-500/60"
          >
            Logout
          </button>
        </div>
      )}
    </>
  )
}

export default Navbar