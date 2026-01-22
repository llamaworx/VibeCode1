export interface Avatar {
  id: string;
  name: string;
  image: string;
  language: string;
  voiceType: 'male' | 'female' | 'neutral';
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;
  avatarId: string;
  content: LessonContent[];
  duration: number;
  rating: number;
  reviews: number;
  price: number;
  isPaid: boolean;
  createdBy: string;
  createdAt: Date;
  tags: string[];
  status: 'draft' | 'published' | 'recording';
}

export interface LessonContent {
  id: string;
  type: 'video' | 'audio' | 'image' | 'chart' | 'text' | 'code' | 'reference';
  content: string;
  metadata?: Record<string, any>;
  timestamp?: number;
}

export interface Tutor {
  id: string;
  name: string;
  avatarId: string;
  language: string;
  subjects: string[];
  difficultyLevels: string[];
  skills: string[];
  createdAt: Date;
}

export interface UserProgress {
  lessonId: string;
  progress: number;
  lastPosition: number;
  completed: boolean;
  paused: boolean;
  evaluationScore?: number;
}

export interface Review {
  id: string;
  lessonId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
