import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useAppStore } from '../store';
import { Tutor, Avatar } from '../types';
import AvatarSelection from './AvatarSelection';

interface CreateTutorProps {
  onBack: () => void;
  onComplete: (tutor: Tutor) => void;
}

const languages = [
  'English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Italian', 'Portuguese', 'Russian'
];

const subjects = [
  'Mathematics', 'Science', 'History', 'Literature', 'Programming', 'Languages',
  'Music', 'Art', 'Business', 'Philosophy', 'Physics', 'Chemistry', 'Biology'
];

const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

const skills = [
  'Problem Solving', 'Critical Thinking', 'Creative Writing', 'Data Analysis',
  'Public Speaking', 'Research', 'Coding', 'Design', 'Communication'
];

export default function CreateTutor({ onBack, onComplete }: CreateTutorProps) {
  const [step, setStep] = useState(1);
  const [tutorData, setTutorData] = useState({
    name: '',
    language: 'English',
    subjects: [] as string[],
    difficultyLevels: [] as string[],
    skills: [] as string[],
    avatarId: '',
  });

  const avatars = useAppStore((state) => state.avatars);

  const handleSubmit = () => {
    const newTutor: Tutor = {
      id: Date.now().toString(),
      ...tutorData,
      createdAt: new Date(),
    };
    onComplete(newTutor);
  };

  const toggleSelection = (field: 'subjects' | 'difficultyLevels' | 'skills', value: string) => {
    setTutorData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Create Your AI Tutor</h1>
            <p className="text-gray-600">Step {step} of 4</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 glass-effect rounded-full p-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                  i <= step ? 'bg-gradient-to-r from-primary-600 to-secondary-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass-effect rounded-3xl p-8 md:p-12"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Name Your Tutor</h2>
                <p className="text-gray-600">Give your AI tutor a memorable name</p>
              </div>
              <input
                type="text"
                value={tutorData.name}
                onChange={(e) => setTutorData({ ...tutorData, name: e.target.value })}
                placeholder="e.g., Professor Nova, Math Mentor..."
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-lg"
              />
              <div>
                <label className="block text-sm font-medium mb-3">Select Language</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setTutorData({ ...tutorData, language: lang })}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        tutorData.language === lang
                          ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white shadow-lg'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select Subjects</h2>
                <p className="text-gray-600">What subjects will your tutor teach?</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => toggleSelection('subjects', subject)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-between ${
                      tutorData.subjects.includes(subject)
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white shadow-lg'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {subject}
                    {tutorData.subjects.includes(subject) && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Difficulty Levels & Skills</h2>
                <p className="text-gray-600">Choose the levels and skills to focus on</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Difficulty Levels</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => toggleSelection('difficultyLevels', level)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all capitalize ${
                        tutorData.difficultyLevels.includes(level)
                          ? 'bg-gradient-to-r from-accent-600 to-primary-500 text-white shadow-lg'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Skills to Develop</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSelection('skills', skill)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        tutorData.skills.includes(skill)
                          ? 'bg-gradient-to-r from-secondary-600 to-accent-500 text-white shadow-lg'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Choose Your Avatar</h2>
                <p className="text-gray-600">Select an avatar that will speak in {tutorData.language}</p>
              </div>
              <AvatarSelection
                avatars={avatars}
                selectedId={tutorData.avatarId}
                onSelect={(id) => setTutorData({ ...tutorData, avatarId: id })}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !tutorData.name) ||
                  (step === 2 && tutorData.subjects.length === 0) ||
                  (step === 3 && (tutorData.difficultyLevels.length === 0 || tutorData.skills.length === 0))
                }
                className="btn-primary flex items-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!tutorData.avatarId}
                className="btn-primary flex items-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Tutor
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
