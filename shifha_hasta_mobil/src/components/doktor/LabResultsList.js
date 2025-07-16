import React from 'react';
import { FileText } from 'lucide-react';
import Card from './Card';

export default function LabResultsList({ labResults }) {
  const getStatusColor = (status) => {
    if (status === 'high') return 'text-red-600 bg-red-100/50';
    if (status === 'low') return 'text-yellow-600 bg-yellow-100/50';
    return 'text-gray-700 bg-gray-100/50';
  };
  return (
    <Card title="Tahlil Sonuçları" icon={<FileText size={20} className="mr-2 text-cyan-500" />}>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {labResults.map(res => (
          <div key={res.name} className={`p-3 rounded-lg flex justify-between items-center transition-colors hover:shadow-sm ${getStatusColor(res.status)}`}>
            <span className="font-semibold">{res.name}</span>
            <div className="text-right">
              <span className="font-bold">{res.value} {res.unit}</span>
              <span className="text-xs block opacity-80">Ref: {res.range}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 