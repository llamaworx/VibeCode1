import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, Image as ImageIcon, FileVideo,
  Link as LinkIcon, X, Check, Sparkles
} from 'lucide-react';
import { useAppStore } from '../store';
import { Lesson, Tutor } from '../types';

interface LessonUploadProps {
  tutor: Tutor;
  onComplete: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
}

export default function LessonUpload({ tutor, onComplete }: LessonUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    subject: tutor.subjects[0] || '',
    difficulty: tutor.difficultyLevels[0] || 'beginner',
    instructions: '',
    isPaid: false,
    price: 0,
  });

  const addLesson = useAppStore((state) => state.addLesson);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
    },
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: lessonData.title,
      description: lessonData.description,
      subject: lessonData.subject,
      difficulty: lessonData.difficulty as any,
      language: tutor.language,
      avatarId: tutor.avatarId,
      content: files.map((file) => ({
        id: file.id,
        type: file.type.startsWith('video/') ? 'video' :
              file.type.startsWith('audio/') ? 'audio' :
              file.type.startsWith('image/') ? 'image' : 'text',
        content: file.name,
        metadata: { size: file.size, mimeType: file.type },
      })),
      duration: 0,
      rating: 0,
      reviews: 0,
      price: lessonData.isPaid ? lessonData.price : 0,
      isPaid: lessonData.isPaid,
      createdBy: 'current-user',
      createdAt: new Date(),
      tags: [lessonData.subject, lessonData.difficulty],
      status: 'draft',
    };

    addLesson(newLesson);
    onComplete();
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-6 h-6" />;
    if (type.startsWith('video/')) return <FileVideo className="w-6 h-6" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="glass-effect rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">{useAppStore.getState().avatars.find(a => a.id === tutor.avatarId)?.image}</div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Create a Lesson</h1>
                <p className="text-gray-600">For {tutor.name}</p>
              </div>
            </div>
          </div>

          {/* Lesson Details */}
          <div className="glass-effect rounded-3xl p-8 space-y-6">
            <h2 className="text-2xl font-bold">Lesson Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Lesson Title</label>
                <input
                  type="text"
                  value={lessonData.title}
                  onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                  placeholder="e.g., Introduction to Calculus"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select
                  value={lessonData.subject}
                  onChange={(e) => setLessonData({ ...lessonData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                >
                  {tutor.subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={lessonData.description}
                onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                placeholder="Describe what students will learn..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Special Instructions for AI</label>
              <textarea
                value={lessonData.instructions}
                onChange={(e) => setLessonData({ ...lessonData, instructions: e.target.value })}
                placeholder="Tell the AI how to prepare and present this lesson..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                <select
                  value={lessonData.difficulty}
                  onChange={(e) => setLessonData({ ...lessonData, difficulty: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none capitalize"
                >
                  {tutor.difficultyLevels.map((level) => (
                    <option key={level} value={level} className="capitalize">{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonData.isPaid}
                    onChange={(e) => setLessonData({ ...lessonData, isPaid: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium">Paid Lesson</span>
                </label>
                {lessonData.isPaid && (
                  <input
                    type="number"
                    value={lessonData.price}
                    onChange={(e) => setLessonData({ ...lessonData, price: parseFloat(e.target.value) })}
                    placeholder="Price ($)"
                    className="w-full mt-3 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="glass-effect rounded-3xl p-8 space-y-6">
            <h2 className="text-2xl font-bold">Upload Content</h2>

            <div
              {...getRootProps()}
              className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-16 h-16 mx-auto mb-4 text-primary-600" />
              <p className="text-lg font-semibold mb-2">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-gray-600 mb-4">or click to browse</p>
              <p className="text-sm text-gray-500">
                PDF, Word, Images, Videos, Audio files
              </p>
            </div>

            {/* Website URL */}
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="Or paste a website URL as reference..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  if (websiteUrl) {
                    setFiles([
                      ...files,
                      {
                        id: Date.now().toString(),
                        name: websiteUrl,
                        type: 'url',
                        size: 0,
                      },
                    ]);
                    setWebsiteUrl('');
                  }
                }}
                className="btn-primary"
                disabled={!websiteUrl}
              >
                <LinkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Uploaded Files */}
            {files.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Uploaded Files ({files.length})</h3>
                <div className="space-y-2">
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center gap-3 p-4 bg-white rounded-xl"
                    >
                      {file.preview ? (
                        <img src={file.preview} alt={file.name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {file.size > 0 ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'URL'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <button onClick={onComplete} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!lessonData.title || !lessonData.description}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              Create Lesson
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
