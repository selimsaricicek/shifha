import React, { useState, useEffect } from 'react';
import SymptomTracker from '../components/SymptomTracker';
import LabResultsList from '../components/LabResultsList';

const timeConfigs = [
  {
    label: 'Günaydın',
    icon: '☀️',
    start: 5,
    end: 12,
    bg: '/sabah.jpg', // sabah
  },
  {
    label: 'İyi günler',
    icon: '⛅',
    start: 12,
    end: 18,
    bg: '/ogle.jpg', // öğle
  },
  {
    label: 'İyi akşamlar',
    icon: '🌇',
    start: 18,
    end: 22,
    bg: '/aksam.jpg', // akşam
  },
  {
    label: 'İyi geceler',
    icon: '🌙',
    start: 22,
    end: 24,
    bg: '/gece.jpg', // gece
  },
  {
    label: 'İyi geceler',
    icon: '🌙',
    start: 0,
    end: 5,
    bg: '/gece.jpg', // gece
  },
];

const HomeScreen = ({ onNavigateToResult }) => {
    const [greeting, setGreeting] = useState('');
    const [bgImage, setBgImage] = useState('');
    const [icon, setIcon] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        const config = timeConfigs.find(cfg => hour >= cfg.start && hour < cfg.end);
        setGreeting(config.label);
        setBgImage(config.bg);
        setIcon(config.icon);
    }, []);

    return (
        <div className="space-y-6">
            <div className="relative p-6 h-48 flex flex-col justify-end text-white rounded-2xl shadow-2xl overflow-hidden bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url(${bgImage})` }}>
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="relative z-10 flex items-center gap-2">
                    <span className="text-3xl">{icon}</span>
                    <h2 className="text-3xl font-bold drop-shadow-md">{greeting}, Ayşe Hanım!</h2>
                </div>
                <p className="mt-1 text-gray-200 drop-shadow-md relative z-10">Sağlığın için harika bir gün.</p>
            </div>
            <SymptomTracker />
            <LabResultsList onSelectResult={onNavigateToResult} />
        </div>
    );
};

export default HomeScreen; 