import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import Card from '../components/Card';

function generateRandomCode(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

const ProfileScreen = () => {
    const [qrCode, setQrCode] = useState(null);
    const [timer, setTimer] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    const handleShowDoctor = () => {
        const code = generateRandomCode();
        setQrCode(code);
        setTimer(60);
        if (intervalId) clearInterval(intervalId);
        const id = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    setQrCode(null);
                    setIntervalId(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setIntervalId(id);
    };

    return (
        <Card>
            <div className="flex flex-col items-center">
                <div className="relative">
                    <img src="https://placehold.co/100x100/E2E8F0/4A5568?text=AY" alt="Profil Fotoğrafı" className="w-24 h-24 rounded-full shadow-lg border-4 border-white mb-4"/>
                    <button className="absolute bottom-0 right-0 bg-cyan-600 p-2 rounded-full text-white shadow-md hover:bg-cyan-700 transition">
                        <Edit3 size={16}/>
                    </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Ayşe Yılmaz</h2>
                <p className="text-gray-500">ayse.yilmaz@example.com</p>
                <div className="w-full grid grid-cols-3 gap-4 text-center mt-6 bg-gray-50 p-4 rounded-xl">
                    <div>
                        <p className="font-bold text-lg text-gray-800">34</p>
                        <p className="text-xs text-gray-500">Yaş</p>
                    </div>
                    <div>
                        <p className="font-bold text-lg text-gray-800">A Rh+</p>
                        <p className="text-xs text-gray-500">Kan Grubu</p>
                    </div>
                    <div>
                        <p className="font-bold text-lg text-gray-800">165 cm</p>
                        <p className="text-xs text-gray-500">Boy</p>
                    </div>
                </div>
                {/* QR Code Section */}
                <div className="mt-8 flex flex-col items-center w-full">
                    <button
                        onClick={handleShowDoctor}
                        className="mb-3 px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition"
                    >
                        Doktoruma Göster
                    </button>
                    {qrCode && (
                        <div className="flex flex-col items-center">
                            <p className="text-sm text-gray-600 mb-2">Yetki Kodu (60 sn geçerli)</p>
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=USER:AyseYilmaz|CODE:${qrCode}`}
                                alt="QR Kod"
                                className="w-28 h-28 border rounded-lg bg-white"
                            />
                            <div className="mt-2 text-xs text-gray-500">Kalan süre: {timer} sn</div>
                            <div className="mt-1 text-xs text-gray-700 font-mono">Kod: {qrCode}</div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default ProfileScreen; 