import React from 'react';
import { Bell, User, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import Card from '../components/Card';

const SettingsScreen = ({ onLogout }) => {
    const settingsItems = [
        { icon: <Bell className="text-cyan-600"/>, text: "Bildirim Ayarları" },
        { icon: <User className="text-cyan-600"/>, text: "Hesap Bilgileri" },
        { icon: <Shield className="text-cyan-600"/>, text: "Gizlilik ve Güvenlik" },
        { icon: <HelpCircle className="text-cyan-600"/>, text: "Yardım & Destek" },
        { icon: <LogOut className="text-red-500"/>, text: "Çıkış Yap", isLogout: true },
    ];

    return (
        <Card>
            <ul className="space-y-2">
                {settingsItems.map((item, index) => (
                    <li key={index}>
                        <a
                          href="#"
                          className={`flex items-center p-4 rounded-lg transition-colors ${item.isLogout ? 'hover:bg-red-50' : 'hover:bg-gray-100'}`}
                          onClick={item.isLogout ? (e) => { e.preventDefault(); if (onLogout) onLogout(); } : undefined}
                        >
                            {item.icon}
                            <span className={`ml-4 font-medium ${item.isLogout ? 'text-red-600' : 'text-gray-700'}`}>{item.text}</span>
                            {!item.isLogout && <ChevronRight size={20} className="ml-auto text-gray-400"/>}
                        </a>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default SettingsScreen; 