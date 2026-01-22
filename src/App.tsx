import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { Tutor, Lesson } from './types';

import LandingPage from './components/LandingPage';
import CreateTutor from './components/CreateTutor';
import LessonUpload from './components/LessonUpload';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import LessonViewer from './components/LessonViewer';

type View = 'landing' | 'dashboard' | 'marketplace' | 'create-tutor' | 'create-lesson';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const addTutor = useAppStore((state) => state.addTutor);

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  const handleCreateTutor = () => {
    setCurrentView('create-tutor');
  };

  const handleTutorComplete = (tutor: Tutor) => {
    addTutor(tutor);
    setCurrentView('dashboard');
  };

  const handleCreateLesson = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setCurrentView('create-lesson');
  };

  const handleLessonComplete = () => {
    setSelectedTutor(null);
    setCurrentView('dashboard');
  };

  const handleViewLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleCloseViewer = () => {
    setSelectedLesson(null);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      {currentView !== 'landing' && (
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-0 right-0 z-40 glass-effect border-b"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('landing')}>
              <div className="text-3xl">✨</div>
              <h1 className="text-2xl font-bold gradient-text">VibeCode</h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white shadow-lg'
                    : 'hover:bg-white/50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('marketplace')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  currentView === 'marketplace'
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white shadow-lg'
                    : 'hover:bg-white/50'
                }`}
              >
                Marketplace
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-all">
                U
              </div>
            </div>
          </div>
        </motion.nav>
      )}

      {/* Main Content */}
      <div className={currentView !== 'landing' ? 'pt-20' : ''}>
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LandingPage onGetStarted={handleGetStarted} />
            </motion.div>
          )}

          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dashboard
                onCreateTutor={handleCreateTutor}
                onCreateLesson={handleCreateLesson}
                onViewLesson={handleViewLesson}
              />
            </motion.div>
          )}

          {currentView === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Marketplace onLessonSelect={handleViewLesson} />
            </motion.div>
          )}

          {currentView === 'create-tutor' && (
            <motion.div
              key="create-tutor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CreateTutor
                onBack={() => setCurrentView('dashboard')}
                onComplete={handleTutorComplete}
              />
            </motion.div>
          )}

          {currentView === 'create-lesson' && selectedTutor && (
            <motion.div
              key="create-lesson"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LessonUpload
                tutor={selectedTutor}
                onComplete={handleLessonComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lesson Viewer Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <LessonViewer lesson={selectedLesson} onClose={handleCloseViewer} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
