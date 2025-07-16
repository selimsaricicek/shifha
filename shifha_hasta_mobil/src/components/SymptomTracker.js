import React from 'react';
import Card from './Card';
import { moodIcons } from '../utils/helpers';

const SymptomTracker = () => {
  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Semptom Günlüğü</h2>
      <div className="mb-5 p-4 bg-gray-50/80 rounded-xl shadow-inner">
        <h3 className="font-semibold text-gray-700 mb-3 text-center">Bugün Nasıl Hissediyorsun?</h3>
        <div className="flex justify-around">
          {Object.entries(moodIcons).map(([mood, icon]) => (
            <button key={mood} className={`p-3 rounded-full transition-all duration-300 transform bg-gray-100 hover:bg-gray-200 hover:scale-105`}>
              {icon}
              <span className="text-xs text-gray-600 mt-1 block">{mood}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default SymptomTracker; 