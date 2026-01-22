import { motion } from 'framer-motion';
import { Sparkles, Rocket, Zap, Star, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-20 left-10 w-72 h-72 bg-primary-300/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-300/30 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-between items-center mb-20"
          >
            <div className="flex items-center gap-2">
              <div className="text-4xl">✨</div>
              <h1 className="text-3xl font-bold gradient-text">VibeCode</h1>
            </div>
            <button className="btn-secondary">Sign In</button>
          </motion.nav>

          {/* Hero Content */}
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full"
            >
              <Sparkles className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">
                AI-Powered Learning Revolution
              </span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-black leading-tight"
            >
              Create Your
              <br />
              <span className="gradient-text">Dream Tutor</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
            >
              Design personalized AI tutors that teach exactly what you want, how you want it.
              Upload lessons, choose avatars, and learn in your language.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 justify-center items-center flex-wrap"
            >
              <button onClick={onGetStarted} className="btn-primary text-lg flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn-secondary text-lg">Explore Marketplace</button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-8 justify-center items-center pt-12"
            >
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">10K+</div>
                <div className="text-sm text-gray-600">Active Learners</div>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">5K+</div>
                <div className="text-sm text-gray-600">Lessons Created</div>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">4.9⭐</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </motion.div>
          </div>

          {/* Feature Cards */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-3 gap-6 mt-24"
          >
            <div className="glass-effect p-8 rounded-3xl card-hover">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Custom Tutors</h3>
              <p className="text-gray-600">
                Create AI tutors tailored to your learning style, subject preferences, and pace
              </p>
            </div>

            <div className="glass-effect p-8 rounded-3xl card-hover">
              <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Format Support</h3>
              <p className="text-gray-600">
                Upload PDFs, images, videos, or even reference websites for your lessons
              </p>
            </div>

            <div className="glass-effect p-8 rounded-3xl card-hover">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-4">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Marketplace</h3>
              <p className="text-gray-600">
                Share your lessons with the world or discover content from top creators
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
