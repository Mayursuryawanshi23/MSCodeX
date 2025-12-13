import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api_base_url } from '../helper';
import { toast } from 'react-toastify';

const SignUp = () => {

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch(api_base_url + "/signUp",{
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: fullName,
        email: email,
        pwd: pwd
      })
    }).then(res => res.json()).then(data => {
      setLoading(false);
      if(data.success){
        toast.success("Account created successfully!");
        navigate("/login");
      }
      else{
        toast.error(data.msg || "Something went wrong!");
      }
    }).catch(err => {
      setLoading(false);
      toast.error("Network error. Please try again!");
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-green-600/30 rounded-full blur-3xl"></div>
      </div>

      {/* Background Grid */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(90deg, #10b981 1px, transparent 1px), linear-gradient(#10b981 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Card */}
        <div className="glass border border-green-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-black text-lg mx-auto mb-4 shadow-lg" style={{background: 'linear-gradient(135deg, #10b981, #3b82f6)'}}>CX</div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 mb-2">Create Account</h1>
            <p className="text-gray-400 text-sm">Join CodeX and start building today</p>
          </div>

          {/* Form */}
          <form onSubmit={submitForm} className="space-y-5">
            {/* Full Name Input */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Full Name</label>
              <input
                onChange={(e) => { setFullName(e.target.value) }}
                value={fullName}
                type="text"
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all duration-200"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Email Address</label>
              <input
                onChange={(e) => { setEmail(e.target.value) }}
                value={email}
                type="email"
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all duration-200"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Password</label>
              <input
                onChange={(e) => { setPwd(e.target.value) }}
                value={pwd}
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all duration-200"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start">
              <input type="checkbox" className="w-4 h-4 bg-black/50 border border-green-500/30 rounded cursor-pointer accent-green-500 mt-0.5" required />
              <span className="ml-2 text-gray-400 text-xs">I agree to the <Link to="#" className="text-green-400 hover:text-green-300">Terms of Service</Link> and <Link to="#" className="text-green-400 hover:text-green-300">Privacy Policy</Link></span>
            </label>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25 mt-6"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-green-500/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400 text-xs">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="w-full py-3 border border-green-500/50 text-green-400 hover:bg-green-500/10 font-semibold rounded-lg transition-all duration-200 text-center block"
          >
            Sign In
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Already have an account? <Link to="/login" className="text-green-400 hover:text-green-300 transition-colors">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;