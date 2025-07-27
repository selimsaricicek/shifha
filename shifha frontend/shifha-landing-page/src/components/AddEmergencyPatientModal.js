import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

const AddEmergencyPatientModal = ({ isOpen, onClose, onAddPatient }) => {
    const [name, setName] = useState('');
    const [tcNo, setTcNo] = useState('');
    const [complaint, setComplaint] = useState('');

    if (!isOpen) return null;

    const getCurrentTimeString = () => {
        return new Date().toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !tcNo || !complaint) {
            alert("Lütfen tüm alanları doldurun.");
            return;
        }
        
        const newPatient = {
            id: tcNo,
            name: name,
            age: 0, 
            gender: 'Belirtilmemiş',
            profileImageUrl: `https://avatar.iran.liara.run/public/boy?username=${name.replace(/\s/g, '')}`,
            emergencyCase: {
                arrivalTime: getCurrentTimeString(),
                chiefComplaint: complaint,
                triage: 'sari', 
                status: 'Bekliyor'
            },
            allergies: [], 
            chronicDiseases: [], 
            appointments: []
        };
        
        onAddPatient(newPatient);
        onClose();
        setName(''); 
        setTcNo(''); 
        setComplaint('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Yeni Acil Vaka Kaydı</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Ad Soyad
                        </label>
                        <input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                            id="name" 
                            type="text" 
                            placeholder="Hastanın adı ve soyadı" 
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tcNo">
                            T.C. Kimlik Numarası
                        </label>
                        <input 
                            value={tcNo} 
                            onChange={(e) => setTcNo(e.target.value)} 
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                            id="tcNo" 
                            type="text" 
                            placeholder="11 haneli T.C. Kimlik No" 
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="complaint">
                            Geliş Sebebi (Ana Şikayet)
                        </label>
                        <input 
                            value={complaint} 
                            onChange={(e) => setComplaint(e.target.value)} 
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                            id="complaint" 
                            type="text" 
                            placeholder="Örn: Göğüs ağrısı, yüksek ateş..." 
                        />
                    </div>
                    
                    <button 
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center" 
                        type="submit"
                    >
                        <UserPlus size={20} className="mr-2" /> Hastayı Kaydet
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEmergencyPatientModal; 