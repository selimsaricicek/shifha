import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronRight, Info } from 'lucide-react';
import Card from './Card';
import InfoModal from './InfoModal';
import { labResultsData } from '../data/mockData';

const LabResultDetail = ({ resultKey, onBack }) => {
  const result = labResultsData[resultKey];
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-4">
      <Card>
        <button onClick={onBack} className="text-cyan-600 font-semibold mb-4 flex items-center space-x-2 hover:text-cyan-800 transition-colors">
          <ChevronRight size={20} className="transform rotate-180" />
          <span>Geri Dön</span>
        </button>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-3 rounded-full shadow-md">{result.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800">{result.name}</h2>
          </div>
          <button onClick={() => setModalOpen(true)} className="text-gray-400 hover:text-cyan-600 transition-colors">
            <Info size={22} />
          </button>
        </div>
        <div className="my-6 h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.history} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip content={({ active, payload, label }) =>
                active && payload && payload.length ? (
                  <div className="bg-white/80 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="label font-bold text-gray-800">{`${label}`}</p>
                    <p className="intro text-cyan-600 font-semibold">{`Değer: ${payload[0].value} ${result.unit}`}</p>
                    {payload[0].payload.note && (
                      <p className="desc text-xs text-gray-600">{` ${payload[0].payload.note}`}</p>
                    )}
                  </div>
                ) : null
              } />
              <Legend wrapperStyle={{fontSize: "14px"}}/>
              <Line type="monotone" dataKey="value" name="Değer" stroke="#0891B2" strokeWidth={3} activeDot={{ r: 8, stroke: '#06B6D4', strokeWidth: 2 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-cyan-50 border-l-4 border-cyan-500 text-cyan-900 p-4 rounded-r-lg">
          <h4 className="font-bold">Doktorunuzdan Motivasyon Mesajı</h4>
          <p className="text-sm mt-1">{result.motivation}</p>
        </div>
        {modalOpen && <InfoModal content={result} onClose={() => setModalOpen(false)} />}
      </Card>
    </div>
  );
};

export default LabResultDetail; 