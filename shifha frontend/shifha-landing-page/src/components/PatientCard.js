import React from 'react';
import { Bookmark } from 'lucide-react';

const PatientCard = ({ patient, onSelectPatient, onSavePatient, isSaved }) => (
  <div 
    onClick={() => onSelectPatient(patient)} 
    className="bg-white rounded-xl shadow-lg p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
  >
    <button 
      onClick={(e) => { 
        e.stopPropagation(); 
        onSavePatient(patient); 
      }} 
      className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
        isSaved 
          ? 'bg-cyan-100 text-cyan-600' 
          : 'bg-gray-100 text-gray-500 hover:bg-cyan-100 hover:text-cyan-600'
      }`}
      title={isSaved ? "Kaydedilenlerden çıkar" : "Hastayı kaydet"}
    >
      <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
    </button>
    
    <div className="flex items-center">
      <img 
        src={patient.profileImageUrl || `https://avatar.iran.liara.run/public/boy?username=${patient.name?.replace(/\s/g, '')}`} 
        alt={patient.name} 
        className="w-16 h-16 rounded-full mr-4 bg-gray-200" 
      />
      <div>
        <h3 className="text-lg font-bold text-gray-900">{patient.name || patient.ad_soyad}</h3>
        <p className="text-sm text-gray-500">T.C. {patient.id || patient.tc_kimlik_no}</p>
        <p className="text-sm text-gray-500">
          {patient.age || patient.yas} yaşında, {patient.gender || patient.cinsiyet || 'Belirtilmemiş'}
        </p>
      </div>
    </div>
    
    {(patient.allergies?.length > 0 || patient.tibbi_gecmis?.allerjiler?.length > 0) && 
     (patient.allergies?.[0] !== 'Bilinmiyor' || patient.tibbi_gecmis?.allerjiler?.[0] !== 'Bilinmiyor') && (
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-rose-600 font-semibold">
          Alerjiler: {(patient.allergies || patient.tibbi_gecmis?.allerjiler || []).join(', ')}
        </p>
      </div>
    )}
  </div>
);

export default PatientCard; 