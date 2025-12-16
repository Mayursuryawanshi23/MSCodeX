import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    setIsMobileMenuOpen(false);
    // use navigate for SPA behavior
    setTimeout(() => {
      navigate('/');
    }, 100);
  };

  const NavItem = ({ to, children, preload }) => (
    <NavLink
      to={to}
      onMouseEnter={() => {
        // lightweight prefetch for critical pages
        tryPrefetch(to);
        if (preload && typeof preload === 'function') preload();
      }}
      onFocus={() => {
        tryPrefetch(to);
        if (preload && typeof preload === 'function') preload();
      }}
      className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
    >
      {children}
    </NavLink>
  );

  const tryPrefetch = (to) => {
    // map route -> dynamic import to warm module cache
    try {
      if (to === '/home') import('../pages/Home');
      else if (to === '/editor') import('../pages/Editor');
      else if (to === '/share') import('../pages/Share');
      else if (to === '/login') import('../pages/Login');
      else if (to === '/signUp') import('../pages/SignUp');
      else if (to === '/') import('../pages/Landing');
    } catch (e) {
      // ignore prefetch failures
    }
  };

  return (
    <>
      <a href="#main" className="skip-link sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-black text-white px-3 py-1 rounded">Skip to content</a>
      <div className="nav flex px-4 sm:px-6 items-center justify-between h-16 sm:h-20 bg-gradient-to-r from-gray-900/40 to-black/60 border-b border-gray-800/50 sticky top-0 z-50" style={{transform: 'translateZ(0)', backfaceVisibility: 'hidden'}}>
        <NavLink to="/" aria-label="CatalyX Home" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0 pl-8 sm:pl-12" style={{transform: 'translateZ(0)'}}>
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex items-center justify-center font-bold text-black text-xs sm:text-base transition-all duration-200 group-hover:shadow-lg group-hover:shadow-green-500/25" style={{background: 'linear-gradient(135deg, #10b981, #3b82f6)'}}>CY</div>
          <span className="font-bold text-lg sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 hidden xs:inline">CatalyX</span>
        </NavLink>

        <nav aria-label="Primary" className="hidden sm:flex items-center gap-3 pr-4 sm:pr-6">
          <NavItem to="/home">Dashboard</NavItem>
          <NavItem to="/editor">Editor</NavItem>
          <NavItem to="/share">Share</NavItem>
          <button
            onClick={handleLogout}
            className="px-4 sm:px-6 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 font-semibold text-sm sm:text-base rounded-lg border border-red-500/30 transition-all duration-200 hover:border-red-500/60 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          >
            Logout
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden flex flex-col gap-1.5 p-2 text-gray-300 hover:text-white transition-colors focus:outline-none"
        >
          <div className={`w-6 h-0.5 bg-current transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-current transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-current transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-black/95 border-b border-gray-800/50 py-4 px-4">
          <NavLink to="/home" className="block px-4 py-3 text-gray-300 rounded mb-2">Dashboard</NavLink>
          <NavLink to="/editor" className="block px-4 py-3 text-gray-300 rounded mb-2">Editor</NavLink>
          <NavLink to="/share" className="block px-4 py-3 text-gray-300 rounded mb-4">Share</NavLink>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 font-semibold rounded-lg border border-red-500/30 transition-all duration-200 hover:border-red-500/60 focus:outline-none"
          >
            Logout
          </button>
        </div>
      )}
    </>
  )
}

export default Navbar