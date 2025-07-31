import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Heart, Stethoscope, Activity } from 'lucide-react';

function PanelSelectionPage({ user, onLogout }) {
    const navigate = useNavigate();

    const panels = [
        {
            id: 'polyclinic',
            title: 'Poliklinik Paneli',
            description: 'Hasta kayıtları, randevular ve genel poliklinik işlemleri',
            icon: Stethoscope,
            color: 'bg-blue-500',
            hoverColor: 'hover:bg-blue-600',
            path: '/dashboard'
        },
        {
            id: 'emergency',
            title: 'Acil Servis Paneli',
            description: 'Acil durum hastaları, triaj ve acil müdahale işlemleri',
            icon: Activity,
            color: 'bg-red-500',
            hoverColor: 'hover:bg-red-600',
            path: '/emergency'
        }
    ];

    const handlePanelSelect = (panel) => {
        navigate(panel.path);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-gray-50">
            {/* Header */}
            <header className="bg-white/90 shadow-md p-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center space-x-2">
                    <img src="/logo-symbol.jpg" alt="Shifha Logo" className="h-10 w-10" />
                    <img src="/logo-text.jpg" alt="SHIFHA" className="h-8" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <User className="text-cyan-600" size={20} />
                            <div className="text-right">
                                <span className="text-gray-700 font-semibold">
                                    {user?.profile?.name || user?.user_metadata?.name || 'Kullanıcı'}
                                </span>
                                <div className="text-xs text-gray-500">
                                    {user?.isDoctor ? 'Doktor' : 'Hasta'}
                                    {user?.doctorProfile && (
                                        <span className="ml-1">• {user.doctorProfile.specialization || 'Uzman'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if(onLogout) onLogout();
                                navigate('/');
                            }}
                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-sm"
                            title="Çıkış Yap ve Ana Sayfaya Dön"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
                <div className="max-w-4xl w-full">
                    {/* Welcome Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                            Hoş Geldiniz, {user?.profile?.name || user?.user_metadata?.name || 'Kullanıcı'}
                        </h1>
                        <p className="text-xl text-gray-600">
                            Lütfen erişmek istediğiniz paneli seçiniz
                        </p>
                    </div>

                    {/* Panel Selection Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {panels.map((panel) => {
                            const IconComponent = panel.icon;
                            return (
                                <div
                                    key={panel.id}
                                    onClick={() => handlePanelSelect(panel)}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100"
                                >
                                    <div className="p-8">
                                        <div className={`${panel.color} ${panel.hoverColor} w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto transition-colors duration-300`}>
                                            <IconComponent className="text-white" size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">
                                            {panel.title}
                                        </h3>
                                        <p className="text-gray-600 text-center leading-relaxed">
                                            {panel.description}
                                        </p>
                                        <div className="mt-6 text-center">
                                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-white font-semibold ${panel.color} ${panel.hoverColor} transition-colors duration-300`}>
                                                Panele Git
                                                <Heart className="ml-2" size={16} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-12 text-center">
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                            <p className="text-gray-600">
                                <strong>Not:</strong> Her panel kendi özelleştirilmiş arayüzü ve işlevleri ile gelir. 
                                İstediğiniz zaman diğer panele geçiş yapabilirsiniz.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PanelSelectionPage;