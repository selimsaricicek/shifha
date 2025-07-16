import React, { useState } from 'react';
import patientsData from '../../data/doktor/patientsData';
import CriticalAlerts from './CriticalAlerts';
import Card from './Card';
import SymptomHistory from './SymptomHistory';
import LabResultsList from './LabResultsList';
import DoctorNotes from './DoctorNotes';

export default function PatientDetailScreen({ patientId, onBack, onLogout }) {
  const patient = patientsData[patientId];
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState(patient.notes);

  const handleAddNote = () => {
    if (note.trim() === "") return;
    const newNote = {
      date: new Date().toISOString().split('T')[0],
      doctor: "Dr. Ahmet Çelik", // Mock doktor adı
      text: note
    };
    setNotes([newNote, ...notes]);
    setNote("");
  };

  if (!patient) return <div>Hasta bulunamadı.</div>;

  return (
    <div>
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 rounded-lg">Geri</button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CriticalAlerts alerts={patient.criticalAlerts} />
          <Card title="Yapay Zeka Klinik Özeti">
            <p className="text-gray-600 text-sm leading-relaxed">{patient.aiSummary}</p>
          </Card>
          <SymptomHistory history={patient.symptomHistory} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <LabResultsList labResults={patient.labResults} />
          <DoctorNotes notes={notes} note={note} setNote={setNote} onAddNote={handleAddNote} />
        </div>
      </div>
    </div>
  );
} 