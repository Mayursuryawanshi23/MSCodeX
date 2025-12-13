import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="nav flex px-6 items-center justify-between h-20 bg-gradient-to-r from-gray-900/40 to-black/60 border-b border-gray-800/50">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-black transition-all duration-200 group-hover:shadow-lg group-hover:shadow-green-500/25" style={{background: 'linear-gradient(135deg, #10b981, #3b82f6)'}}>CX</div>
          <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">CodeX</span>
        </Link>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("isLoggedIn");
            setTimeout(() => {
              window.location.href = '/';
            }, 100);
          }}
          className="px-6 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 font-semibold rounded-lg border border-red-500/30 transition-all duration-200 hover:border-red-500/60"
        >
          Logout
        </button>
      </div>
    </>
  )
}

export default Navbar