import React from 'react'
import { Link } from 'react-router-dom'

const NoPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      {/* Background effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #10b981 0%, transparent 50%)',
          opacity: 0.1
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-green-500">
            404
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back to building amazing things!
          </p>
        </div>

        {/* Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400 font-semibold">💡 Tip:</p>
            <p className="text-sm text-gray-400 mt-2">Check the URL and try again</p>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400 font-semibold">🔗 Navigate:</p>
            <p className="text-sm text-gray-400 mt-2">Use the menu to explore CatalyX</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link 
            to="/" 
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25"
          >
            Back to Home
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-3 border border-green-500/50 text-green-400 hover:bg-green-500/10 font-semibold rounded-lg transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NoPage