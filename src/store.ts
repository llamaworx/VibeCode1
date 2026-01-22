import { create } from 'zustand';
import { Tutor, Lesson, Avatar, UserProgress } from './types';

interface AppState {
  currentUser: string;
  tutors: Tutor[];
  lessons: Lesson[];
  avatars: Avatar[];
  userProgress: Record<string, UserProgress>;

  addTutor: (tutor: Tutor) => void;
  addLesson: (lesson: Lesson) => void;
  updateLesson: (id: string, lesson: Partial<Lesson>) => void;
  updateProgress: (lessonId: string, progress: UserProgress) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: 'user123',
  tutors: [],
  lessons: [],
  avatars: [
    {
      id: '1',
      name: 'Luna',
      image: '🌙',
      language: 'English',
      voiceType: 'female',
    },
    {
      id: '2',
      name: 'Kai',
      image: '🌊',
      language: 'English',
      voiceType: 'male',
    },
    {
      id: '3',
      name: 'Zara',
      image: '⚡',
      language: 'Spanish',
      voiceType: 'female',
    },
    {
      id: '4',
      name: 'Nova',
      image: '✨',
      language: 'French',
      voiceType: 'neutral',
    },
    {
      id: '5',
      name: 'Phoenix',
      image: '🔥',
      language: 'German',
      voiceType: 'male',
    },
    {
      id: '6',
      name: 'Sage',
      image: '🌿',
      language: 'Japanese',
      voiceType: 'female',
    },
  ],
  userProgress: {},

  addTutor: (tutor) =>
    set((state) => ({ tutors: [...state.tutors, tutor] })),

  addLesson: (lesson) =>
    set((state) => ({ lessons: [...state.lessons, lesson] })),

  updateLesson: (id, lesson) =>
    set((state) => ({
      lessons: state.lessons.map((l) => (l.id === id ? { ...l, ...lesson } : l)),
    })),

  updateProgress: (lessonId, progress) =>
    set((state) => ({
      userProgress: {
        ...state.userProgress,
        [lessonId]: progress,
      },
    })),
}));
