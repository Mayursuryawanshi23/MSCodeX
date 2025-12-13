import React from 'react';
import { Link } from 'react-router-dom';

// Production-level landing page with features, comparisons, and CTAs
export default function Landing() {
  return (
    <div className="min-h-screen relative bg-black text-white flex flex-col overflow-hidden">
      {/* Video background - absolute positioning for proper layering */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        preload="auto" 
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{animation: 'none', position: 'fixed', top: 0, left: 0}}
      >
        <source src="/10130349-hd_1920_1080_30fps.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient overlay - dark fade for readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70 z-5" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="py-6 px-8 flex items-center justify-between border-b border-green-500/20 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-black" style={{background: 'linear-gradient(135deg, #10b981, #3b82f6)'}}>
              CX
            </div>
            <div className="text-xl font-bold">CodeX Studio</div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors duration-200">Features</a>
            <a href="#why" className="text-gray-400 hover:text-white transition-colors duration-200">Why CodeX</a>
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors duration-200">Sign in</Link>
            <Link to="/signUp" className="px-4 py-2 btn-primary rounded-md font-semibold">Create Account</Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center p-8 md:p-12">
          <div className="max-w-5xl w-full space-y-8">
            <div className="space-y-6 text-center hero-animate">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-full text-sm font-semibold text-green-400">
                ✨ The Next-Generation Code IDE
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-400 to-green-500">
                Write. Execute. Build.
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                CodeX Studio is the fastest, most intuitive cloud-based IDE for developers who want to code without boundaries. Write in any language, execute instantly on the cloud, and collaborate seamlessly—all in one place.
              </p>

              <div className="flex gap-4 justify-center pt-4">
                <Link to="/signUp" className="px-8 py-3 btn-primary font-bold shadow-lg rounded-lg hover:shadow-xl transition-all">
                  Start Coding Free
                </Link>
                <a href="#features" className="px-8 py-3 border border-green-500/40 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors font-semibold">
                  Explore Features
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-8 bg-gradient-to-b from-black/40 to-black/80 backdrop-blur-sm border-t border-gray-800/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">Powerful Features Built for Developers</h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">Everything you need to code, test, and deploy—without leaving your browser</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="glass p-6 rounded-xl border border-green-500/20 hover:border-green-500/50 hover:bg-green-500/5 transition-all">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-xl font-semibold mb-2">Cloud-Based Execution</h3>
                <p className="text-gray-400">Run your code instantly on powerful cloud infrastructure. Zero CPU overhead on your machine. Support for 20+ programming languages.</p>
              </div>

              {/* Feature 2 */}
              <div className="glass p-6 rounded-xl border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                <div className="text-3xl mb-3">💾</div>
                <h3 className="text-xl font-semibold mb-2">Execution History & Cloud Storage</h3>
                <p className="text-gray-400">Every code run is automatically saved to the cloud with timestamps, status, and outputs. Review, compare, and replay past executions instantly.</p>
              </div>

              {/* Feature 3 */}
              <div className="glass p-6 rounded-xl border border-green-500/20 hover:border-green-500/50 hover:bg-green-500/5 transition-all">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="text-xl font-semibold mb-2">Project Management</h3>
                <p className="text-gray-400">Organize your code into logical projects. Create, edit, rename, and delete projects with a single click. Full project hierarchy support.</p>
              </div>

              {/* Feature 4 */}
              <div className="glass p-6 rounded-xl border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="text-xl font-semibold mb-2">Scratch Editor</h3>
                <p className="text-gray-400">Write and execute code instantly without creating a project. Perfect for quick snippets, experiments, and prototypes. Auto-save to browser.</p>
              </div>

              {/* Feature 5 */}
              <div className="glass p-6 rounded-xl border border-green-500/20 hover:border-green-500/50 hover:bg-green-500/5 transition-all">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Output & Console</h3>
                <p className="text-gray-400">Watch your code execute in real-time with live console output, error tracking, and execution timestamps. See exactly what your code does.</p>
              </div>

              {/* Feature 6 */}
              <div className="glass p-6 rounded-xl border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                <div className="text-3xl mb-3">🌐</div>
                <h3 className="text-xl font-semibold mb-2">Access Anywhere</h3>
                <p className="text-gray-400">Code from any device, anywhere in the world. Responsive design works perfectly on desktop, tablet, and mobile. No installation required.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why CodeX Section */}
        <section id="why" className="py-16 px-8 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-sm border-t border-gray-800/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">Why Choose CodeX Studio?</h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">See how CodeX compares to other IDEs and coding platforms</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-green-400">CodeX Studio</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-400">VS Code Online</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-400">Repl.it</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-400">Local IDEs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-4 px-4">Cloud Execution</td>
                    <td className="text-center text-green-400 font-bold">✓</td>
                    <td className="text-center text-gray-400">✓</td>
                    <td className="text-center text-green-400">✓</td>
                    <td className="text-center text-gray-400">✗</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-4 px-4">Execution History</td>
                    <td className="text-center text-green-400 font-bold">✓</td>
                    <td className="text-center text-gray-400">✗</td>
                    <td className="text-center text-gray-400">✗</td>
                    <td className="text-center text-gray-400">✗</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-4 px-4">Zero Setup Required</td>
                    <td className="text-center text-green-400 font-bold">✓</td>
                    <td className="text-center text-green-400">✓</td>
                    <td className="text-center text-green-400">✓</td>
                    <td className="text-center text-gray-400">✗</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-4 px-4">20+ Language Support</td>
                    <td className="text-center text-green-400 font-bold">✓</td>
                    <td className="text-center text-green-400">✓</td>
                    <td className="text-center text-green-400">✓</td>
                    <td className="text-center text-green-400">✓</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-4 px-4">Lightweight Interface</td>
                    <td className="text-center text-green-400 font-bold">✓</td>
                    <td className="text-center text-gray-400">✗</td>
                    <td className="text-center text-green-400">✓</td>
                    <td className="text-center text-gray-400">✗</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-4 px-4">Project Management</td>
                    <td className="text-center text-green-400 font-bold">✓</td>
                    <td className="text-center text-green-400">✓</td>
                    <td className="text-center text-gray-400">✗</td>
                    <td className="text-center text-green-400">✓</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-4 px-4">Scratch/Snippet Mode</td>
                    <td className="text-center text-green-400 font-bold">✓</td>
                    <td className="text-center text-gray-400">✗</td>
                    <td className="text-center text-green-400">✓</td>
                    <td className="text-center text-gray-400">✗</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-4 px-4">Free Forever</td>
                    <td className="text-center text-green-400 font-bold">✓</td>
                    <td className="text-center text-green-400">✓</td>
                    <td className="text-center text-gray-400">Freemium</td>
                    <td className="text-center text-gray-400">✗</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-8 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-green-500/5 border-y border-gray-800/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="glass p-6 rounded-xl border border-green-500/20">
                <div className="text-4xl font-bold text-green-400">20+</div>
                <div className="text-gray-400 mt-2">Supported Languages</div>
              </div>
              <div className="glass p-6 rounded-xl border border-blue-500/20">
                <div className="text-4xl font-bold text-blue-400">0ms</div>
                <div className="text-gray-400 mt-2">Setup Time</div>
              </div>
              <div className="glass p-6 rounded-xl border border-green-500/20">
                <div className="text-4xl font-bold text-green-400">∞</div>
                <div className="text-gray-400 mt-2">Cloud Storage</div>
              </div>
              <div className="glass p-6 rounded-xl border border-blue-500/20">
                <div className="text-4xl font-bold text-blue-400">100%</div>
                <div className="text-gray-400 mt-2">Free Forever</div>
              </div>
            </div>
          </div>
        </section>

        {/* Functionality Section */}
        <section className="py-16 px-8 bg-gradient-to-b from-black/40 to-black/80 backdrop-blur-sm border-t border-gray-800/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">What You Can Do with CodeX</h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">From quick scripts to full projects, CodeX handles it all</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-xl border border-gray-700/50 hover:border-green-500/30 transition-all">
                <h3 className="text-2xl font-bold mb-3">💻 Learn to Code</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>✓ Practice algorithms in any language</li>
                  <li>✓ Run code instantly—no compiler setup</li>
                  <li>✓ See results immediately with execution history</li>
                  <li>✓ Access from school, home, or library</li>
                </ul>
              </div>

              <div className="glass p-8 rounded-xl border border-gray-700/50 hover:border-blue-500/30 transition-all">
                <h3 className="text-2xl font-bold mb-3">🎯 Solve Coding Challenges</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>✓ Quick test environment for interviews</li>
                  <li>✓ LeetCode-style problem solving</li>
                  <li>✓ Track all attempts and solutions</li>
                  <li>✓ Share snippets with mentors or friends</li>
                </ul>
              </div>

              <div className="glass p-8 rounded-xl border border-gray-700/50 hover:border-green-500/30 transition-all">
                <h3 className="text-2xl font-bold mb-3">🚀 Prototype Ideas Fast</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>✓ Build scripts and tools in minutes</li>
                  <li>✓ Test multiple implementations side-by-side</li>
                  <li>✓ Compare execution runs and optimize</li>
                  <li>✓ No local dependencies or environments</li>
                </ul>
              </div>

              <div className="glass p-8 rounded-xl border border-gray-700/50 hover:border-blue-500/30 transition-all">
                <h3 className="text-2xl font-bold mb-3">📚 Teach & Collaborate</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>✓ Share working code examples</li>
                  <li>✓ Students can code without setup</li>
                  <li>✓ Review code execution history together</li>
                  <li>✓ Debug collaboratively in real-time</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-8 bg-gradient-to-r from-green-600/10 to-blue-600/10 border-y border-gray-800/30">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Code Better?</h2>
            <p className="text-xl text-gray-300">Join developers worldwide using CodeX Studio for faster, smarter coding.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/signUp" className="px-8 py-4 btn-primary font-bold shadow-lg rounded-lg hover:shadow-xl transition-all text-lg">
                Create Free Account
              </Link>
              <Link to="/login" className="px-8 py-4 border border-green-500/40 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors font-semibold text-lg">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 p-8 text-sm text-gray-400 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#why" className="hover:text-white transition">Why CodeX</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Follow</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition">Discord</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex items-center justify-between">
            <div>© 2025 CodeX Studio. All rights reserved.</div>
            <div className="text-xs">Powered by Cloud Infrastructure • Built for Developers</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
