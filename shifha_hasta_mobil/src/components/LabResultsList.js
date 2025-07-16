import React from 'react';
import { ChevronRight } from 'lucide-react';
import Card from './Card';
import { labResultsData } from '../data/mockData';
import { getResultColor } from '../utils/helpers';

const LabResultsList = ({ onSelectResult }) => (
  <Card>
    <h2 className="text-xl font-bold text-gray-800 mb-4">Tahlil Sonuçlarım</h2>
    <div className="space-y-3">
      {Object.entries(labResultsData).map(([key, result]) => {
        const colorClasses = getResultColor(result.currentValue, result.referenceRange);
        return (
          <button key={key} onClick={() => onSelectResult(key)} className="w-full flex items-center justify-between p-4 bg-gray-50/80 rounded-xl hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-[1.02]">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-sm">{result.icon}</div>
              <div>
                <p className="font-semibold text-gray-800 text-left">{result.name}</p>
                <p className={`text-sm font-bold ${colorClasses.split(' ')[0]}`}>{result.currentValue} {result.unit}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${colorClasses.replace('text-', 'bg-').split(' ')[0]}`}></div>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </button>
        );
      })}
    </div>
  </Card>
);

export default LabResultsList; 