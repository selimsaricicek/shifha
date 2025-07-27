import React from 'react';
import { LogOut, Briefcase, Siren } from 'lucide-react';

const RoleSelectionPage = ({ onSelectRole, onLogout }) => {
    const logoUrl = 'https://i.postimg.cc/Kk7pPcjF/shifha-logo-final.png';
    
    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center font-sans">
            <div className="absolute top-6 right-6">
                <button 
                    onClick={onLogout} 
                    className="flex items-center text-gray-500 hover:text-red-600 transition-colors"
                >
                    <LogOut size={20} className="mr-1" /> Çıkış Yap
                </button>
            </div>
            
            <div className="text-center mb-10">
                <img src={logoUrl} alt="Shifha Logosu" className="h-20 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800">Hoş Geldiniz, Dr. Ahmet Çelik</h1>
                <p className="text-gray-600 mt-2 text-lg">Lütfen görüntülemek istediğiniz paneli seçin.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
                <div 
                    onClick={() => onSelectRole('clinic')} 
                    className="bg-white rounded-2xl shadow-lg p-8 w-80 text-center cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                    <Briefcase className="h-16 w-16 text-cyan-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Poliklinik Paneli</h2>
                    <p className="text-gray-500 mt-2">Randevulu hastalarınızı ve günlük iş akışınızı yönetin.</p>
                </div>
                
                <div 
                    onClick={() => onSelectRole('emergency')} 
                    className="bg-white rounded-2xl shadow-lg p-8 w-80 text-center cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                    <Siren className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Acil Servis Paneli</h2>
                    <p className="text-gray-500 mt-2">Triyaj durumunu ve acil vakaları anlık olarak takip edin.</p>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionPage; 