import React, { useState } from 'react';
import { X } from 'lucide-react';

// Taburcu Modalı
export const DischargeModal = ({ isOpen, onClose, onConfirm }) => {
    const [prescription, setPrescription] = useState('');
    const [followUp, setFollowUp] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onConfirm({ prescription, followUp });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Taburcu Kararı</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Reçete</label>
                    <textarea 
                        value={prescription} 
                        onChange={(e) => setPrescription(e.target.value)} 
                        rows="3" 
                        className="w-full border rounded-lg p-2" 
                        placeholder="Verilecek ilaçlar..."
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2">Takip Önerileri</label>
                    <textarea 
                        value={followUp} 
                        onChange={(e) => setFollowUp(e.target.value)} 
                        rows="3" 
                        className="w-full border rounded-lg p-2" 
                        placeholder="Kontrol randevuları, yaşam tarzı önerileri..."
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">
                        İptal
                    </button>
                    <button onClick={handleSubmit} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg">
                        Taburcu Et
                    </button>
                </div>
            </div>
        </div>
    );
};

// Yatış Modalı
export const HospitalizeModal = ({ isOpen, onClose, onConfirm, bedData }) => {
    const [department, setDepartment] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const selectedService = bedData.find(s => s.id === department);
    const availableBeds = selectedService ? selectedService.total - selectedService.occupied : 0;
    const isFull = availableBeds <= 0;

    const handleSubmit = () => {
        onConfirm({ department, notes });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Yatış Kararı</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Yatırılacak Servis</label>
                    <select 
                        value={department} 
                        onChange={(e) => setDepartment(e.target.value)} 
                        className="w-full border rounded-lg p-2"
                    >
                        <option value="">Servis Seçin...</option>
                        {bedData.map(service => (
                            <option key={service.id} value={service.id}>
                                {service.name}
                            </option>
                        ))}
                    </select>
                    {department && (
                        <p className={`text-sm mt-2 font-semibold ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                            {isFull ? 'Bu serviste boş yatak bulunmuyor.' : `${availableBeds} boş yatak mevcut.`}
                        </p>
                    )}
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2">Yatış Notu</label>
                    <textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        rows="4" 
                        className="w-full border rounded-lg p-2" 
                        placeholder="Yatış nedeni, ön tanılar..."
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">
                        İptal
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isFull || !department} 
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400"
                    >
                        Yatış Yap
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sevk Modalı
export const ReferralDecisionModal = ({ isOpen, onClose, onConfirm }) => {
    const [destination, setDestination] = useState('');
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onConfirm({ destination, reason });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Sevk Kararı</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Sevk Edilen Kurum</label>
                    <input 
                        type="text" 
                        value={destination} 
                        onChange={(e) => setDestination(e.target.value)} 
                        className="w-full border rounded-lg p-2" 
                        placeholder="Hastane adı, poliklinik..."
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2">Sevk Nedeni</label>
                    <textarea 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)} 
                        rows="4" 
                        className="w-full border rounded-lg p-2" 
                        placeholder="Sevk nedenini detaylandırın..."
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">
                        İptal
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!destination || !reason} 
                        className="bg-orange-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400"
                    >
                        Sevk Et
                    </button>
                </div>
            </div>
        </div>
    );
}; 