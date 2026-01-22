import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  FileText, Image as ImageIcon, BarChart3, BookOpen, X
} from 'lucide-react';
import { Lesson } from '../types';
import { useAppStore } from '../store';

interface LessonViewerProps {
  lesson: Lesson;
  onClose: () => void;
}

export default function LessonViewer({ lesson, onClose }: LessonViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  const avatar = useAppStore((state) => state.avatars.find((a) => a.id === lesson.avatarId));
  const updateProgress = useAppStore((state) => state.updateProgress);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 0.5, 100));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      updateProgress(lesson.id, {
        lessonId: lesson.id,
        progress,
        lastPosition: progress,
        completed: false,
        paused: false,
      });
    }
  };

  const handleSkip = (direction: 'forward' | 'back') => {
    if (direction === 'forward' && currentContentIndex < lesson.content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else if (direction === 'back' && currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    }
  };

  const currentContent = lesson.content[currentContentIndex];

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'chart': return <BarChart3 className="w-5 h-5" />;
      case 'text': return <FileText className="w-5 h-5" />;
      case 'reference': return <BookOpen className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {avatar && (
                <div className="text-4xl animate-float">{avatar.image}</div>
              )}
              <div>
                <h2 className="text-2xl font-bold gradient-text">{lesson.title}</h2>
                <p className="text-gray-600">{lesson.subject} • {lesson.difficulty}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Avatar Speaking Area */}
            <div className="glass-effect rounded-3xl p-12 text-center">
              <motion.div
                animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-9xl mb-6"
              >
                {avatar?.image}
              </motion.div>
              <div className="space-y-4">
                <div className="inline-block px-6 py-3 bg-white rounded-2xl shadow-lg">
                  <p className="text-lg text-gray-700">
                    {isPlaying
                      ? `Teaching: ${lesson.title}...`
                      : 'Ready to start your lesson'}
                  </p>
                </div>
                {avatar && (
                  <p className="text-sm text-gray-500">
                    Speaking in {avatar.language} • {avatar.voiceType} voice
                  </p>
                )}
              </div>
            </div>

            {/* Current Content */}
            {currentContent && (
              <motion.div
                key={currentContentIndex}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="glass-effect rounded-3xl p-8 space-y-4"
              >
                <div className="flex items-center gap-3 text-primary-600">
                  {getContentIcon(currentContent.type)}
                  <span className="font-semibold capitalize">{currentContent.type} Content</span>
                </div>
                <div className="bg-white rounded-2xl p-6">
                  {currentContent.type === 'image' ? (
                    <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-24 h-24 text-primary-300" />
                      <p className="ml-4 text-gray-600">{currentContent.content}</p>
                    </div>
                  ) : currentContent.type === 'video' ? (
                    <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
                      <Play className="w-24 h-24 text-white opacity-50" />
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {currentContent.content}
                      </p>
                    </div>
                  )}
                </div>

                {/* Content Navigation */}
                <div className="flex items-center justify-center gap-2">
                  {lesson.content.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentContentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentContentIndex
                          ? 'w-8 bg-gradient-to-r from-primary-600 to-secondary-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Lesson Description */}
            <div className="glass-effect rounded-3xl p-6">
              <h3 className="font-bold mb-2">About this lesson</h3>
              <p className="text-gray-600">{lesson.description}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-8 py-6 border-t bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{Math.floor(progress)}%</span>
                <span>Content {currentContentIndex + 1} of {lesson.content.length}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-600 to-secondary-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleSkip('back')}
                  disabled={currentContentIndex === 0}
                  className="p-3 hover:bg-white/50 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="p-4 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>

                <button
                  onClick={() => handleSkip('forward')}
                  disabled={currentContentIndex === lesson.content.length - 1}
                  className="p-3 hover:bg-white/50 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 hover:bg-white/50 rounded-full transition"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
