import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function CriticalAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg shadow-md mb-4">
      <div className="flex">
        <AlertTriangle size={20} className="mr-3 mt-1" />
        <div>
          <h4 className="font-bold">Kritik Bulgular</h4>
          <ul className="list-disc list-inside text-sm">
            {alerts.map(alert => <li key={alert}>{alert}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
} 