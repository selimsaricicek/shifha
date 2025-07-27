import React, { useState } from 'react';
import { X, PhoneCall } from 'lucide-react';

const CallRelativesModal = ({ isOpen, onClose, relatives }) => {
    const [callStatus, setCallStatus] = useState({});

    if (!isOpen) return null;

    const handleCall = (phone, name) => {
        setCallStatus({ ...callStatus, [phone]: `Aranıyor...` });
        setTimeout(() => {
            setCallStatus({ ...callStatus, [phone]: 'Görüşme Sonlandı' });
        }, 3000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Hasta Yakınları</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                {relatives && relatives.length > 0 ? (
                    <div className="space-y-4">
                        {relatives.map((relative, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="font-bold text-gray-800">
                                        {relative.name} 
                                        <span className="text-sm font-normal text-gray-500"> ({relative.relation})</span>
                                    </p>
                                    <p className="text-gray-600">{relative.phone}</p>
                                </div>
                                <button
                                    onClick={() => handleCall(relative.phone, relative.name)}
                                    disabled={!!callStatus[relative.phone]}
                                    className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center disabled:bg-gray-400 transition-colors"
                                >
                                    {callStatus[relative.phone] ? (
                                        <span>{callStatus[relative.phone]}</span>
                                    ) : (
                                        <>
                                            <PhoneCall size={18} className="mr-2" /> Ara
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">
                        Bu hasta için kayıtlı bir yakını bulunmamaktadır.
                    </p>
                )}
            </div>
        </div>
    );
};

export default CallRelativesModal; 