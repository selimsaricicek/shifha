import React from 'react';
import { Bed } from 'lucide-react';

const BedManagement = ({ bedData }) => {
    const getOccupancyColor = (occupied, total) => {
        const percentage = (occupied / total) * 100;
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
                <Bed className="text-cyan-600" size={24} />
                <h3 className="text-xl font-bold text-gray-800 ml-2">Servis Yatak Durumu</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bedData.map(service => {
                    const available = service.total - service.occupied;
                    return (
                        <div key={service.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-semibold text-gray-700 text-sm">{service.name}</p>
                                <p className="text-xs font-bold text-gray-600">{service.occupied}/{service.total}</p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className={`${getOccupancyColor(service.occupied, service.total)} h-2.5 rounded-full`} 
                                    style={{ width: `${(service.occupied / service.total) * 100}%` }}
                                ></div>
                            </div>
                            <p className={`text-right text-sm font-bold mt-1 ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {available > 0 ? `${available} Boş Yatak` : 'Servis Dolu'}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BedManagement; 