import React from 'react';
import { PlusCircle } from 'lucide-react';
import Card from './Card';

export default function DoctorNotes({ notes, note, setNote, onAddNote }) {
  return (
    <Card title="Doktor Notları" icon={<PlusCircle size={20} className="mr-2 text-cyan-500" />}>
      <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
        {notes.map(n => (
          <div key={n.date} className="text-sm bg-gray-50 p-3 rounded-md">
            <p className="font-semibold">{n.doctor} - {n.date}</p>
            <p className="text-gray-600">{n.text}</p>
          </div>
        ))}
      </div>
      <textarea
        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
        rows="3"
        placeholder="Yeni not ekle..."
        value={note}
        onChange={e => setNote(e.target.value)}
      ></textarea>
      <button
        className="mt-2 w-full flex items-center justify-center py-2 px-4 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors shadow-md"
        onClick={onAddNote}
      >
        <PlusCircle size={18} className="mr-2" /> Notu Kaydet
      </button>
    </Card>
  );
} 