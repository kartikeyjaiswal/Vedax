import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, Menu, X } from 'lucide-react'

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  return (
    <div className="min-h-screen bg-surface relative overflow-x-hidden flex flex-col">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-eco-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-ocean-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'2s'}} />

      <nav className="relative z-10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-eco-500 to-ocean-600 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">EcoQuest</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/register" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Challenges</Link>
          <Link to="/register" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Leaderboard</Link>
          <Link to="/register" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Community</Link>
          <a href="#about" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">About Us</a>
        </div>

        <div className="hidden md:flex gap-3">
          <Link to="/login" className="btn-secondary px-5 py-2 text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary px-5 py-2 text-sm">Get Started</Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-[72px] left-0 right-0 z-50 bg-surface-dark border-b border-white/10 p-6 flex flex-col gap-4 md:hidden shadow-2xl">
          <Link to="/register" className="text-gray-300 hover:text-white text-lg font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Challenges</Link>
          <Link to="/register" className="text-gray-300 hover:text-white text-lg font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Leaderboard</Link>
          <Link to="/register" className="text-gray-300 hover:text-white text-lg font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Community</Link>
          <a href="#about" className="text-gray-300 hover:text-white text-lg font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About Us</a>
          <hr className="border-white/10 my-2" />
          <Link to="/login" className="btn-secondary w-full text-center py-3" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
          <Link to="/register" className="btn-primary w-full text-center py-3" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
        </div>
      )}

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-eco-500/10 border border-eco-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-eco-400 animate-pulse" />
            <span className="text-sm text-eco-400 font-medium">AI-Powered Environmental Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-tight mb-6">
            Learn. Play.<br />
            <span className="text-gradient-eco">Change the World.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Complete eco-challenges, earn XP badges, battle on leaderboards,
            and let AI personalize your environmental learning journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary px-8 py-4 text-base">
              🌿 Start Free – Join 10,000+ Econauts
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-4 text-base">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl"
        >
          {[
            { emoji:'🎮', title:'Gamified Learning', desc:'XP, badges, streaks' },
            { emoji:'🤖', title:'AI Personalized', desc:'Gemini-powered quizzes' },
            { emoji:'🏆', title:'Live Leaderboard', desc:'College vs Global' },
            { emoji:'🌍', title:'Real Impact', desc:'Track CO₂ & trees saved' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-card p-4 text-center"
            >
              <div className="text-3xl mb-2">{f.emoji}</div>
              <div className="text-sm font-semibold text-white">{f.title}</div>
              <div className="text-xs text-gray-400 mt-1">{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* How it works */}
      <section className="relative z-10 w-full max-w-5xl mx-auto py-24 px-4">
        <div className="text-center mb-16">
          <h3 className="text-eco-400 font-bold tracking-wider text-sm uppercase mb-3">How it works</h3>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white">Three steps to go green</h2>
        </div>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-0.5 bg-eco-900/50 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-surface-dark border-4 border-eco-900/50 flex items-center justify-center mb-6 text-eco-500 font-black text-2xl relative z-10">
                01
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Sign Up Free</h4>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">Create your Econaut profile in under 60 seconds.</p>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-surface-dark border-4 border-eco-900/50 flex items-center justify-center mb-6 text-eco-500 font-black text-2xl relative z-10">
                02
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Take Challenges</h4>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">Complete daily eco-quests and AI-curated quizzes.</p>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-surface-dark border-4 border-eco-900/50 flex items-center justify-center mb-6 text-eco-500 font-black text-2xl relative z-10">
                03
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Earn & Impact</h4>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">Climb leaderboards and watch your real-world impact grow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="relative z-10 w-full max-w-7xl mx-auto py-24 px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h3 className="text-eco-400 font-bold tracking-wider text-sm uppercase">About Us</h3>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
              Driven by a mission to heal the planet.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              EcoQuest was built with a single goal: to make environmental action accessible, engaging, and rewarding. We believe that by gamifying sustainability, we can empower millions of individuals to take meaningful steps towards a greener future.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              Whether you're a student looking to make a difference or a community leader driving change, Vedax provides the tools, challenges, and AI-driven insights to help you maximize your real-world impact. Together, we can turn small eco-friendly habits into global change.
            </p>
            <div className="pt-4 flex justify-center lg:justify-start">
              <Link to="/register" className="text-eco-400 font-bold hover:text-eco-300 flex items-center gap-2 transition-colors">
                Join our mission <Leaf className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-surface-dark aspect-video flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-eco-900/40 to-ocean-900/40" />
              <Leaf className="w-32 h-32 text-eco-500/20 absolute" />
              <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-6 p-6 md:p-8 w-full h-full">
                 <div className="bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center flex-col gap-2 p-6 backdrop-blur-sm">
                   <div className="text-4xl md:text-5xl font-black text-white">10K+</div>
                   <div className="text-sm md:text-base text-gray-400 font-medium text-center">Active Econauts</div>
                 </div>
                 <div className="bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center flex-col gap-2 p-6 backdrop-blur-sm">
                   <div className="text-4xl md:text-5xl font-black text-white">50K+</div>
                   <div className="text-sm md:text-base text-gray-400 font-medium text-center">Challenges Met</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 w-full max-w-5xl mx-auto py-12 px-4 mb-16">
        <div className="bg-eco-600 rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
            <Leaf className="w-64 h-64 text-white" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 leading-tight">
              Ready to become<br/>an Econaut?
            </h2>
            <p className="text-eco-50 text-base md:text-lg mb-10 max-w-xl mx-auto">
              Join 10,000+ learners already making a difference. It's free forever.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-eco-600 hover:bg-gray-50 px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg">
              🚀 Get Started for Free
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-eco-500">
            <Leaf className="w-5 h-5" />
            <span className="font-display font-bold text-white">EcoQuest</span>
          </div>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} EcoQuest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
