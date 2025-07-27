import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';

const DynamicAppointments = ({ patients, onSelectPatient }) => {
    const getTodayDateString = () => {
        return new Date().toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const todaysAppointments = useMemo(() => {
        return patients
            .flatMap(patient => 
                (patient.appointments || [])
                    .filter(app => app.date === getTodayDateString())
                    .map(app => ({ 
                        ...app, 
                        patientName: patient.name, 
                        patientId: patient.id, 
                        patient: patient 
                    }))
            )
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [patients]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
                <Calendar className="text-cyan-600" size={24} />
                <h3 className="text-xl font-bold text-gray-800 ml-2">
                    Bugünün Poliklinik Akışı ({new Date().toLocaleDateString('tr-TR')})
                </h3>
            </div>
            
            {todaysAppointments.length > 0 ? (
                <div className="space-y-3">
                    {todaysAppointments.map((item, index) => (
                        <div 
                            key={index} 
                            onClick={() => onSelectPatient(item.patient)} 
                            className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                                item.urgency === 'acil' 
                                    ? 'bg-rose-50 border-l-4 border-rose-500' 
                                    : 'bg-gray-50 border-l-4 border-cyan-500'
                            }`}
                        >
                            <div className="flex items-center">
                                <span className="font-bold text-gray-800">{item.time}</span>
                                <span className="text-gray-600 mx-2">-</span>
                                <span className="font-semibold text-gray-700">{item.patientName}</span>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                item.urgency === 'acil' 
                                    ? 'bg-rose-200 text-rose-800' 
                                    : 'bg-cyan-200 text-cyan-800'
                            }`}>
                                {item.type}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-4">
                    Bugün için planlanmış bir poliklinik randevusu bulunmamaktadır.
                </p>
            )}
        </div>
    );
};

export default DynamicAppointments; 