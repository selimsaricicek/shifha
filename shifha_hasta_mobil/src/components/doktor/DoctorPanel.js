import React, { useState, useEffect } from 'react';
import DashboardScreen from './DashboardScreen';
import PatientDetailScreen from './PatientDetailScreen';
import ShifhaLogo from './ShifhaLogo';

export default function DoctorPanel({ onLogout, doctorId }) {
  const [currentView, setCurrentView] = useState(doctorId ? 'dashboard' : 'login');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Giriş ekranı yok, ana uygulamadan giriş yapılmış kabul ediliyor

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setCurrentView('patient');
  };

  const handleBackToDashboard = () => {
    setSelectedPatientId(null);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setSelectedPatientId(null);
    setCurrentView('login');
    if (onLogout) onLogout();
  };

  useEffect(() => {
    if (doctorId) {
      setCurrentView('dashboard');
    }
  }, [doctorId]);

  let content = null;
  if (currentView === 'patient') {
    content = <PatientDetailScreen patientId={selectedPatientId} onBack={handleBackToDashboard} onLogout={handleLogout} />;
  } else if (currentView === 'dashboard') {
    content = <DashboardScreen onSelectPatient={handleSelectPatient} onLogout={handleLogout} />;
  } else {
    content = <div>Yetkisiz erişim veya oturum kapalı.</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen font-sans antialiased">
      <header className="flex items-center justify-between mb-6">
        <ShifhaLogo />
        <button onClick={handleLogout} className="flex items-center text-sm text-red-500 hover:text-red-700 p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-all font-semibold">
          Çıkış Yap
        </button>
      </header>
      {content}
    </div>
  );
} 