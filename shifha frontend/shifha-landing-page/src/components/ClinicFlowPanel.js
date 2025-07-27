import React, { useMemo } from 'react';
import { Search, QrCode } from 'lucide-react';
import PatientCard from './PatientCard';
import SavedPatientList from './SavedPatientList';
import DynamicAppointments from './DynamicAppointments';
import PatientDropzone from './PatientDropzone';

const ClinicFlowPanel = ({ 
    patients, 
    setPatients, 
    onSelectPatient, 
    searchTerm, 
    setSearchTerm, 
    showToast, 
    savedPatients, 
    onSavePatient, 
    onRemoveSaved, 
    onScanNewPatient 
}) => {
    const handleAddPatient = (newPatient, message) => {
        setPatients(prev => [newPatient, ...prev]);
        showToast(message);
    };
    
    const clinicPatients = useMemo(() => 
        patients.filter(p => p.appointments && p.appointments.length > 0), 
        [patients]
    );

    return (
        <>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Poliklinik Paneli</h2>
            
            <SavedPatientList 
                savedPatients={savedPatients} 
                onSelectPatient={onSelectPatient} 
                onRemoveSaved={onRemoveSaved} 
            />
            
            <DynamicAppointments 
                patients={clinicPatients} 
                onSelectPatient={onSelectPatient} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <PatientDropzone onPatientAdd={handleAddPatient} />
                <div 
                    className="border-2 border-dashed border-gray-400 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors flex flex-col items-center justify-center" 
                    onClick={onScanNewPatient}
                >
                    <QrCode className="h-12 w-12 text-gray-500 mb-2" />
                    <p className="text-gray-600 font-semibold">Yeni Hasta Tara (Simülasyon)</p>
                    <p className="text-sm text-gray-500">
                        Mobil uygulamadan okutulan yeni hasta QR kodunu simüle eder.
                    </p>
                </div>
            </div>
            
            <div className="mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Hasta adı veya T.C. Kimlik No ile arayın..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg p-3 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow" 
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {patients.filter(p => !p.emergencyCase).map(patient => (
                    <PatientCard 
                        key={patient.id} 
                        patient={patient} 
                        onSelectPatient={onSelectPatient} 
                        onSavePatient={onSavePatient} 
                        isSaved={savedPatients.some(p => p.id === patient.id)} 
                    />
                ))}
            </div>
        </>
    );
};

export default ClinicFlowPanel; 