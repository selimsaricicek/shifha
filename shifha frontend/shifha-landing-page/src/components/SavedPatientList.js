import React from 'react';
import { Bookmark, X } from 'lucide-react';

const SavedPatientList = ({ savedPatients, onSelectPatient, onRemoveSaved }) => {
    if (savedPatients.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
                <Bookmark className="text-cyan-600" size={24} />
                <h3 className="text-xl font-bold text-gray-800 ml-2">Kaydedilen Hastalar</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {savedPatients.map(patient => (
                    <div key={patient.id} className="bg-cyan-50 rounded-lg p-3 flex items-center justify-between shadow-sm">
                        <div 
                            onClick={() => onSelectPatient(patient)} 
                            className="cursor-pointer flex-grow"
                        >
                            <p className="font-semibold text-cyan-800">{patient.name}</p>
                            <p className="text-xs text-cyan-600">T.C. {patient.id}</p>
                        </div>
                        <button 
                            onClick={() => onRemoveSaved(patient.id)} 
                            className="text-gray-400 hover:text-red-500 ml-2 p-1 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SavedPatientList; 