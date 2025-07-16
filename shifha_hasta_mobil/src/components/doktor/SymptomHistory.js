import React from 'react';
import { Smile, Meh, Frown, MessageSquare } from 'lucide-react';
import Card from './Card';

const moodIcons = {
  'İyi': <Smile size={24} className="text-green-500" />,
  'Orta': <Meh size={24} className="text-yellow-500" />,
  'Kötü': <Frown size={24} className="text-red-500" />,
};

export default function SymptomHistory({ history }) {
  return (
    <Card title="Hasta Semptom Geçmişi" icon={<MessageSquare size={20} className="mr-2 text-cyan-500" />}>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {history.map(entry => (
          <div key={entry.date} className="flex items-start bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="mr-4 mt-1">{moodIcons[entry.mood]}</div>
            <div className="flex-grow">
              <p className="font-semibold text-gray-700">{new Date(entry.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} - Ruh Hali: {entry.mood}</p>
              {entry.symptoms.length > 0 ? (
                <p className="text-sm text-gray-600">Belirtilen Semptomlar: {entry.symptoms.join(', ')}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">Belirtilen semptom yok.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 