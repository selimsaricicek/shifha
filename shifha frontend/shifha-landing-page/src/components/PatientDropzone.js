import React, { useCallback } from 'react';
import { FileUp } from 'lucide-react';

const PatientDropzone = ({ onPatientAdd }) => {
    const getTodayDateString = () => {
        return new Date().toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const onDrop = useCallback((event) => {
        event.preventDefault();
        const newPatient = {
            id: `PDF-${Date.now().toString().slice(-6)}`,
            name: 'Yeni Hasta (PDF)',
            age: 42,
            gender: 'Belirtilmemiş',
            height: 175, 
            weight: 78, 
            bloodType: 'Bilinmiyor',
            profileImageUrl: 'https://avatar.iran.liara.run/public',
            allergies: [], 
            chronicDiseases: [], 
            familyHistory: [], 
            surgeries: [], 
            medications: [], 
            lifestyle: '',
            labResults: [], 
            radiologyReports: [], 
            pathologyReports: [], 
            epikriz: 'PDF\'ten okunan hasta özeti (simülasyon).', 
            doctorNotes: [], 
            referrals: [],
            appointments: [{ 
                date: getTodayDateString(), 
                time: '14:00', 
                type: 'Yeni Değerlendirme', 
                urgency: 'normal' 
            }]
        };
        onPatientAdd(newPatient, 'Hasta PDF\'i başarıyla yüklendi. Yeni hasta listeye eklendi.');
    }, [onPatientAdd]);

    const handleDragOver = (event) => event.preventDefault();

    return (
        <div 
            onDrop={onDrop} 
            onDragOver={handleDragOver} 
            className="border-2 border-dashed border-gray-400 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors mb-8"
        >
            <div className="flex flex-col items-center justify-center h-full">
                <FileUp className="h-12 w-12 text-gray-500 mb-2" />
                <p className="text-gray-600 font-semibold">Tahlil/Epikriz PDF'ini Buraya Sürükleyin</p>
                <p className="text-sm text-gray-500">Poliklinik hastası olarak eklenir.</p>
            </div>
        </div>
    );
};

export default PatientDropzone; 