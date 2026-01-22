import { motion } from 'framer-motion';
import {
  BookOpen, Users, Star, TrendingUp, Plus, Play, Edit, Trash2
} from 'lucide-react';
import { useAppStore } from '../store';
import { Lesson, Tutor } from '../types';

interface DashboardProps {
  onCreateTutor: () => void;
  onCreateLesson: (tutor: Tutor) => void;
  onViewLesson: (lesson: Lesson) => void;
}

export default function Dashboard({ onCreateTutor, onCreateLesson, onViewLesson }: DashboardProps) {
  const tutors = useAppStore((state) => state.tutors);
  const lessons = useAppStore((state) => state.lessons);
  const avatars = useAppStore((state) => state.avatars);

  const totalLessons = lessons.length;
  const publishedLessons = lessons.filter(l => l.status === 'published').length;
  const avgRating = lessons.length > 0
    ? (lessons.reduce((sum, l) => sum + l.rating, 0) / lessons.length).toFixed(1)
    : '0.0';
  const totalViews = lessons.reduce((sum, l) => sum + l.reviews, 0);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-5xl font-black gradient-text mb-2">Dashboard</h1>
            <p className="text-xl text-gray-600">Welcome back! Ready to create something amazing?</p>
          </div>
          <button onClick={onCreateTutor} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Tutor
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid md:grid-cols-4 gap-6"
        >
          <div className="glass-effect rounded-3xl p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">{totalLessons}</div>
                <div className="text-sm text-gray-600">Total Lessons</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {publishedLessons} published
            </div>
          </div>

          <div className="glass-effect rounded-3xl p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">{tutors.length}</div>
                <div className="text-sm text-gray-600">AI Tutors</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Active and ready
            </div>
          </div>

          <div className="glass-effect rounded-3xl p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">{avgRating}⭐</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              From {totalViews} reviews
            </div>
          </div>

          <div className="glass-effect rounded-3xl p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">{totalViews}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              All time
            </div>
          </div>
        </motion.div>

        {/* My Tutors */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">My Tutors</h2>
          </div>

          {tutors.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map((tutor, index) => (
                <motion.div
                  key={tutor.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-effect rounded-3xl p-6 space-y-4 card-hover"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">
                      {avatars.find(a => a.id === tutor.avatarId)?.image || '✨'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{tutor.name}</h3>
                      <p className="text-sm text-gray-600">{tutor.language}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.slice(0, 3).map((subject) => (
                      <span
                        key={subject}
                        className="px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-full text-xs font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                    {tutor.subjects.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        +{tutor.subjects.length - 3} more
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onCreateLesson(tutor)}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Lesson
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-effect rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-2">No tutors yet</h3>
              <p className="text-gray-600 mb-6">Create your first AI tutor to get started!</p>
              <button onClick={onCreateTutor} className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Your First Tutor
              </button>
            </div>
          )}
        </motion.div>

        {/* My Lessons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold">My Lessons</h2>

          {lessons.length > 0 ? (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-effect rounded-2xl p-6 flex items-center gap-6 card-hover"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-4xl">
                    {avatars.find(a => a.id === lesson.avatarId)?.image || '✨'}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{lesson.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        lesson.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : lesson.status === 'recording'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {lesson.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{lesson.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{lesson.rating}</span>
                        <span className="text-gray-500">({lesson.reviews})</span>
                      </span>
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg font-medium">
                        {lesson.subject}
                      </span>
                      <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-lg font-medium capitalize">
                        {lesson.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewLesson(lesson)}
                      className="p-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white hover:bg-red-50 text-red-600 rounded-xl transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-effect rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-2">No lessons yet</h3>
              <p className="text-gray-600 mb-6">Create a tutor first, then start building lessons!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
