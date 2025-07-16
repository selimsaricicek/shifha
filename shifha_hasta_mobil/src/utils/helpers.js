import { Smile, Meh, Frown } from 'lucide-react';

// --- Yardımcı Fonksiyonlar ---
export const getResultColor = (value, range) => {
  if (value < range.low || value > range.high) return 'text-red-600 border-red-500';
  if (value > range.high * 0.9 || value < range.low * 1.1) return 'text-yellow-600 border-yellow-500';
  return 'text-green-600 border-green-500';
};

export const moodIcons = { 
  'İyi': <Smile size={32} className="text-green-500" />, 
  'Orta': <Meh size={32} className="text-yellow-500" />, 
  'Kötü': <Frown size={32} className="text-red-500" /> 
}; 