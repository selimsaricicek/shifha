import React from 'react';
import { Pencil, Save } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function PatientCard({ patient, onEdit, onDelete, onView, onSave }) {
  return (
    <div
      className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      onClick={() => onView(patient)}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ background: "#E0E7FF", color: "#4F46E5" }}>
          {(patient?.ad_soyad || '')
            .split(' ')
            .map((s) => s[0])
            .join('')
            .toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(patient?.ad_soyad || '')}} />
          <p className="text-sm text-gray-500">T.C. {DOMPurify.sanitize(patient?.tc_kimlik_no || '')}</p>
          <p className="text-sm text-gray-500">
            {DOMPurify.sanitize(String(patient?.yas || ''))} yaşında, {DOMPurify.sanitize(patient?.cinsiyet || '')}
          </p>
        </div>
      </div>
      {patient.tibbi_gecmis?.allerjiler?.length > 0 &&
        patient.tibbi_gecmis.allerjiler[0] !== 'Bilinmiyor' && (
          <div className="mt-2">
            <p className="text-xs text-red-600 font-semibold">
              Alerji: {DOMPurify.sanitize(patient.tibbi_gecmis.allerjiler.join(', '))}
            </p>
          </div>
        )}
      <div className="flex gap-2 mt-2">
        <button
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs flex items-center gap-1"
          onClick={e => { e.stopPropagation(); onEdit(patient); }}
        >
          <Pencil size={14} /> Düzenle
        </button>
        <button
          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs flex items-center gap-1"
          onClick={e => { e.stopPropagation(); onSave(patient); }}
        >
          <Save size={14} /> Kaydet
        </button>
        <button
          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
          onClick={e => { e.stopPropagation(); onDelete(patient?.tc_kimlik_no); }}
        >
          Sil
        </button>
      </div>
    </div>
  );
} 