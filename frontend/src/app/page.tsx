import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative px-4 py-20 md:py-32 bg-gradient-to-br from-background to-blue-100 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
              Learn Sustainability. <br />
              <span className="text-primary">Take Action.</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-neutral-600 dark:text-neutral-300">
              Join thousands of students turning environmental education into real-world impact through gamified challenges and rewards.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-bold transition-transform hover:scale-105 shadow-lg">
                Join Vedax
              </button>
              <button className="bg-white dark:bg-neutral-800 text-foreground border border-neutral-200 dark:border-neutral-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-sm">
                For Schools
              </button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </section>

        {/* Stats Section */}
        <section className="bg-primary py-12 text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">10k+</div>
              <div className="text-sm opacity-80">Students Active</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50k+</div>
              <div className="text-sm opacity-80">Trees Planted</div>
            </div>
            <div>
              <div className="text-4xl font-bold">100+</div>
              <div className="text-sm opacity-80">Schools Partnered</div>
            </div>
            <div>
              <div className="text-4xl font-bold">1M+</div>
              <div className="text-sm opacity-80">Carbon Offset (kg)</div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center p-6 rounded-2xl bg-white dark:bg-neutral-800 shadow-xl border border-neutral-100 dark:border-neutral-700">
                <div className="text-6xl mb-6">📚</div>
                <h3 className="text-xl font-bold mb-4">Interactive Lessons</h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Learn about climate change, waste management, and biodiversity through engaging micro-lessons.
                </p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white dark:bg-neutral-800 shadow-xl border border-neutral-100 dark:border-neutral-700">
                <div className="text-6xl mb-6">📸</div>
                <h3 className="text-xl font-bold mb-4">Real-World Tasks</h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Complete eco-tasks like planting trees or recycling, upload proof, and get verified by AI.
                </p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white dark:bg-neutral-800 shadow-xl border border-neutral-100 dark:border-neutral-700">
                <div className="text-6xl mb-6">🏆</div>
                <h3 className="text-xl font-bold mb-4">Earn Rewards</h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Climb the leaderboard, earn badges, and win recognition for your school.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
