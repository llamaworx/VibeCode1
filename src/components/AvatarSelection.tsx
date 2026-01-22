import { motion } from 'framer-motion';
import { Avatar } from '../types';
import { Volume2 } from 'lucide-react';

interface AvatarSelectionProps {
  avatars: Avatar[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function AvatarSelection({ avatars, selectedId, onSelect }: AvatarSelectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {avatars.map((avatar, index) => (
        <motion.button
          key={avatar.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelect(avatar.id)}
          className={`relative p-6 rounded-2xl transition-all ${
            selectedId === avatar.id
              ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-2xl scale-105'
              : 'bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl'
          }`}
        >
          <div className="text-center space-y-3">
            <div className="text-6xl animate-float">{avatar.image}</div>
            <div>
              <h3 className="font-bold text-lg">{avatar.name}</h3>
              <p className={`text-sm ${selectedId === avatar.id ? 'text-white/90' : 'text-gray-600'}`}>
                {avatar.language}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Volume2 className="w-4 h-4" />
                <span className={`text-xs capitalize ${selectedId === avatar.id ? 'text-white/80' : 'text-gray-500'}`}>
                  {avatar.voiceType}
                </span>
              </div>
            </div>
          </div>
          {selectedId === avatar.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-primary-600 text-xl">✓</span>
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
