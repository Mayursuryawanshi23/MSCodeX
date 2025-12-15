import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api_base_url } from '../helper';

const Login = () => {

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch(api_base_url + "/login", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        pwd: pwd
      })
    }).then(res => res.json()).then(data => {
      setLoading(false);
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", true);
        toast.success("Login successful!");
        setTimeout(() => {
          window.location.href = "/home";
        }, 500);
      }
      else {
        toast.error(data.msg || "Login failed!");
      }
    }).catch(err => {
      setLoading(false);
      toast.error("Network error. Please try again!");
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 py-6 sm:py-0 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-green-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
      </div>

      {/* Background Grid */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(90deg, #10b981 1px, transparent 1px), linear-gradient(#10b981 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Card - Responsive Padding */}
        <div className="glass border border-green-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg flex items-center justify-center font-bold text-black text-base sm:text-lg mx-auto mb-3 sm:mb-4 shadow-lg" style={{background: 'linear-gradient(135deg, #10b981, #3b82f6)'}}>CY</div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-xs sm:text-sm">Sign in to continue to CatalyX Studio</p>
          </div>

          {/* Form */}
          <form onSubmit={submitForm} className="space-y-4 sm:space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-gray-300 text-xs sm:text-sm font-semibold mb-2">Email Address</label>
              <input
                onChange={(e) => { setEmail(e.target.value) }}
                value={email}
                type="email"
                placeholder="you@example.com"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all duration-200 text-sm"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-300 text-xs sm:text-sm font-semibold mb-2">Password</label>
              <input
                onChange={(e) => { setPwd(e.target.value) }}
                value={pwd}
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all duration-200 text-sm"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 bg-black/50 border border-green-500/30 rounded cursor-pointer accent-green-500" />
                <span className="ml-2 text-gray-400 text-xs sm:text-sm hover:text-gray-300 transition-colors">Remember me</span>
              </label>
              <Link to="#" className="text-green-400 hover:text-green-300 text-xs sm:text-sm transition-colors duration-200 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25 mt-4 sm:mt-6 text-sm sm:text-base"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-green-500/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400 text-xs">New to CatalyX?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            to="/signUp"
            className="w-full py-2 sm:py-3 border border-green-500/50 text-green-400 hover:bg-green-500/10 text-center block mt-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base"
          >
            Create Account
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-500 text-xs mt-4 sm:mt-6">
          Need help? <Link to="#" className="text-green-400 hover:text-green-300 transition-colors">Contact support</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;