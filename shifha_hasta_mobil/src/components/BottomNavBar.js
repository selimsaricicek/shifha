import React from 'react';
import { Home, ClipboardList, User, Settings, Users, Calendar } from 'lucide-react';

const BottomNavBar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'home', icon: Home, label: 'Ana Sayfa' },
        { id: 'community', icon: Users, label: 'Blog' },
        { id: 'randevu', icon: Calendar, label: 'Randevu' },
        { id: 'tracking', icon: ClipboardList, label: 'Takip' },
        { id: 'profile', icon: User, label: 'Profil' },
        { id: 'settings', icon: Settings, label: 'Ayarlar' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
            <div className="flex justify-around max-w-md mx-auto">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center w-full py-3 transition-all duration-300 ${activeTab === item.id ? 'text-cyan-600' : 'text-gray-500 hover:text-cyan-500'}`}>
                        <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2}/>
                        <span className="text-xs mt-1 font-medium">{item.label}</span>
                        {activeTab === item.id && <div className="w-8 h-1 bg-cyan-600 rounded-full mt-1"></div>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNavBar; 