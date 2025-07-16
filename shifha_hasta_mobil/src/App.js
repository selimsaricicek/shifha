import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import HomeScreen from './screens/HomeScreen';
import TrackingScreen from './screens/TrackingScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import LabResultDetail from './components/LabResultDetail';
import { labResultsData } from './data/mockData';
import CommunityFeed from './components/CommunityFeed';
import RandevuScreen from './screens/RandevuScreen';

export default function HastaApp({ onLogout, patientEmail }) {
  const [activeTab, setActiveTab] = useState('home');
  const [detailedView, setDetailedView] = useState(null); // e.g., 'hba1c'
  const [headerTitle, setHeaderTitle] = useState('Ana Sayfa');

  useEffect(() => {
      switch(activeTab) {
          case 'home': setHeaderTitle('Ana Sayfa'); break;
          case 'tracking': setHeaderTitle('Takip'); break;
          case 'profile': setHeaderTitle('Profilim'); break;
          case 'settings': setHeaderTitle('Ayarlar'); break;
          default: setHeaderTitle('Shifha');
      }
  }, [activeTab]);

  const renderContent = () => {
    if (detailedView) {
        return <LabResultDetail resultKey={detailedView} onBack={() => setDetailedView(null)} />;
    }
    
    switch (activeTab) {
        case 'home': return <HomeScreen onNavigateToResult={setDetailedView} />;
        case 'community': return <CommunityFeed />;
        case 'randevu': return <RandevuScreen />;
        case 'tracking': return <TrackingScreen />;
        case 'profile': return <ProfileScreen />;
        case 'settings': return <SettingsScreen onLogout={onLogout} />;
        default: return <HomeScreen onNavigateToResult={setDetailedView} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-24">
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <Header title={detailedView ? labResultsData[detailedView].name : headerTitle} />
      <main className="p-4 animate-fadeIn">
        {renderContent()}
      </main>
      {!detailedView && <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />}
      <footer className="text-center p-4 text-xs text-gray-400 mt-4">
        <p>&copy; 2024 Shifha. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
} 