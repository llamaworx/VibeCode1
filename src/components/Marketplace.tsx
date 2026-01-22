import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Star, Clock, DollarSign, Play, TrendingUp, Award, Sparkles
} from 'lucide-react';
import { Lesson } from '../types';
import { useAppStore } from '../store';

interface MarketplaceProps {
  onLessonSelect: (lesson: Lesson) => void;
}

export default function Marketplace({ onLessonSelect }: MarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const lessons = useAppStore((state) => state.lessons);

  // Mock lessons for demo
  const demoLessons: Lesson[] = lessons.length > 0 ? lessons : [
    {
      id: '1',
      title: 'Introduction to React Hooks',
      description: 'Master the fundamentals of React Hooks with practical examples',
      subject: 'Programming',
      difficulty: 'intermediate',
      language: 'English',
      avatarId: '1',
      content: [],
      duration: 45,
      rating: 4.8,
      reviews: 234,
      price: 29.99,
      isPaid: true,
      createdBy: 'CodeMaster',
      createdAt: new Date(),
      tags: ['React', 'JavaScript', 'Web Development'],
      status: 'published',
    },
    {
      id: '2',
      title: 'Advanced Calculus Concepts',
      description: 'Deep dive into calculus with step-by-step explanations',
      subject: 'Mathematics',
      difficulty: 'advanced',
      language: 'English',
      avatarId: '2',
      content: [],
      duration: 60,
      rating: 4.9,
      reviews: 189,
      price: 0,
      isPaid: false,
      createdBy: 'MathGenius',
      createdAt: new Date(),
      tags: ['Calculus', 'Mathematics'],
      status: 'published',
    },
    {
      id: '3',
      title: 'Spanish Conversation Practice',
      description: 'Improve your Spanish speaking skills with interactive lessons',
      subject: 'Languages',
      difficulty: 'beginner',
      language: 'Spanish',
      avatarId: '3',
      content: [],
      duration: 30,
      rating: 4.7,
      reviews: 456,
      price: 19.99,
      isPaid: true,
      createdBy: 'LanguagePro',
      createdAt: new Date(),
      tags: ['Spanish', 'Conversation'],
      status: 'published',
    },
  ];

  const displayLessons = demoLessons.concat(lessons.filter(l => l.status === 'published'));

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-black gradient-text">Marketplace</h1>
          <p className="text-xl text-gray-600">
            Discover amazing lessons from creators worldwide
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid md:grid-cols-4 gap-4"
        >
          <div className="glass-effect rounded-2xl p-6 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">
                  {displayLessons.length}+
                </div>
                <div className="text-sm text-gray-600">Total Lessons</div>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-primary-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">500K+</div>
                <div className="text-sm text-gray-600">Students Learning</div>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">4.8⭐</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">
                  {displayLessons.filter(l => !l.isPaid).length}
                </div>
                <div className="text-sm text-gray-600">Free Lessons</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-3xl p-6 space-y-4"
        >
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lessons..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
            >
              <option value="all">All Subjects</option>
              <option value="Programming">Programming</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Languages">Languages</option>
              <option value="Science">Science</option>
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none capitalize"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </motion.div>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-effect rounded-3xl overflow-hidden card-hover cursor-pointer"
              onClick={() => onLessonSelect(lesson)}
            >
              {/* Card Header */}
              <div className="h-40 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 relative overflow-hidden">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute inset-0 bg-white/10"
                />
                <div className="relative h-full flex items-center justify-center">
                  <div className="text-6xl">
                    {useAppStore.getState().avatars.find(a => a.id === lesson.avatarId)?.image || '✨'}
                  </div>
                </div>
                {!lesson.isPaid && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                    FREE
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{lesson.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{lesson.description}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                    {lesson.subject}
                  </span>
                  <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full font-medium capitalize">
                    {lesson.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{lesson.rating}</span>
                      <span className="text-gray-500">({lesson.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.duration}min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-2xl font-bold gradient-text">
                    {lesson.isPaid ? `$${lesson.price}` : 'Free'}
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-full font-semibold flex items-center gap-2 hover:shadow-lg transition-all hover:scale-105 active:scale-95">
                    <Play className="w-4 h-4" />
                    Start
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {displayLessons.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No lessons yet</h3>
            <p className="text-gray-500">Be the first to create and share a lesson!</p>
          </div>
        )}
      </div>
    </div>
  );
}
