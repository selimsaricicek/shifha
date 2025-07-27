import React from 'react';
import { UserPlus, Clock, Siren } from 'lucide-react';
import BedManagement from './BedManagement';

const EmergencyPanel = ({ patients, onSelectPatient, onAddPatientClick, bedData }) => {
    const activeStatuses = ['Müdahale', 'Müşahede', 'Bekliyor'];
    const concludedStatuses = ['Taburcu Edildi', 'Servise Yatırıldı', 'Sevk Edildi'];

    const emergencyPatients = patients.filter(p => p.emergencyCase);
    const activePatients = emergencyPatients.filter(p => activeStatuses.includes(p.emergencyCase.status));
    const concludedPatients = emergencyPatients.filter(p => concludedStatuses.includes(p.emergencyCase.status));

    const triageColumns = {
        kirmizi: { 
            title: 'Kırmızı Alan', 
            headerClass: 'bg-red-500', 
            bgColor: 'bg-red-50', 
            patients: activePatients.filter(p => p.emergencyCase.triage === 'kirmizi') 
        },
        sari: { 
            title: 'Sarı Alan', 
            headerClass: 'bg-yellow-500', 
            bgColor: 'bg-yellow-50', 
            patients: activePatients.filter(p => p.emergencyCase.triage === 'sari') 
        },
        yesil: { 
            title: 'Yeşil Alan', 
            headerClass: 'bg-green-500', 
            bgColor: 'bg-green-50', 
            patients: activePatients.filter(p => p.emergencyCase.triage === 'yesil') 
        },
        sonuclanan: { 
            title: 'Sonuçlanan Vakalar', 
            headerClass: 'bg-gray-500', 
            bgColor: 'bg-gray-50', 
            patients: concludedPatients 
        },
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Acil Servis Durum Paneli</h2>
                <button 
                    onClick={onAddPatientClick} 
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                    <UserPlus className="mr-2" size={20} /> Yeni Vaka Kaydı
                </button>
            </div>
            
            <BedManagement bedData={bedData} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.values(triageColumns).map(col => (
                    <div key={col.title} className={`rounded-xl shadow-md ${col.bgColor}`}>
                        <div className={`p-4 rounded-t-xl ${col.headerClass} text-white`}>
                            <h3 className="text-xl font-bold">
                                {col.title} ({col.patients.length} Hasta)
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            {col.patients.length > 0 ? (
                                col.patients.map(p => (
                                    <div 
                                        key={p.id} 
                                        onClick={() => onSelectPatient(p)} 
                                        className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-lg hover:scale-[1.03] transition-all"
                                    >
                                        <p className="font-bold text-gray-800">{p.name}</p>
                                        <p className="text-sm text-gray-500">T.C. {p.id}</p>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Clock size={14} className="mr-2" />
                                                Geliş: {p.emergencyCase.arrivalTime}
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <Siren size={14} className={`mr-2 ${p.emergencyCase.triage ? `text-${p.emergencyCase.triage === 'kirmizi' ? 'red' : p.emergencyCase.triage === 'sari' ? 'yellow' : 'green'}-500` : 'text-gray-500'}`} />
                                                Şikayet: {p.emergencyCase.chiefComplaint}
                                            </div>
                                        </div>
                                        <div className="mt-3 text-right">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${concludedStatuses.includes(p.emergencyCase.status) ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                                                {p.emergencyCase.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    Bu alanda hasta bulunmuyor.
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmergencyPanel; 