import React from 'react';
import { CheckSquare, BedDouble, Ambulance } from 'lucide-react';

const DecisionPanel = ({ onDecisionClick }) => (
    <div className="border-t-4 border-blue-600">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Karar Aşaması</h3>
        <p className="text-gray-600 mb-6">Hastanın durumuyla ilgili nihai kararı verin.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
                onClick={() => onDecisionClick('discharge')} 
                className="flex flex-col items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 hover:shadow-lg transition-all"
            >
                <CheckSquare size={32} className="mb-2" />
                <span className="font-bold">Taburcu Et</span>
            </button>
            <button 
                onClick={() => onDecisionClick('hospitalize')} 
                className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 hover:shadow-lg transition-all"
            >
                <BedDouble size={32} className="mb-2" />
                <span className="font-bold">Servise Yatır</span>
            </button>
            <button 
                onClick={() => onDecisionClick('referral')} 
                className="flex flex-col items-center justify-center p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 hover:shadow-lg transition-all"
            >
                <Ambulance size={32} className="mb-2" />
                <span className="font-bold">Sevk Et</span>
            </button>
        </div>
    </div>
);

export default DecisionPanel; 