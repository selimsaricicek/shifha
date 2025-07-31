import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ArrowLeft, Plus, Clock, AlertTriangle, Heart, Activity, Thermometer, Droplets, Phone, Users } from 'lucide-react';
import { toast } from 'react-toastify';

function EmergencyPanelPage({ user, onLogout }) {
    const navigate = useNavigate();
    const [emergencyPatients, setEmergencyPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showNewPatientModal, setShowNewPatientModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [newPatient, setNewPatient] = useState({
        name: '',
        tc: '',
        age: '',
        gender: '',
        complaint: '',
        triageLevel: 'Yeşil Alan',
        emergencyContacts: [{ name: '', relation: '', phone: '' }]
    });

    // Demo acil hasta verileri
    const demoEmergencyPatients = [
        {
            id: 1,
            name: 'Elif Gezgin',
            tc: '27154829640',
            age: 34,
            gender: 'Kadın',
            arrivalTime: '14:30',
            complaint: 'Şiddetli karın ağrısı ve bulantı',
            triageLevel: 'Kırmızı Alan',
            triageColor: 'red',
            vitalSigns: {
                bloodPressure: '140/90',
                pulse: 110,
                temperature: 38.2,
                oxygenSaturation: 96
            },
            status: 'Muayene',
            doctor: 'Dr. Ahmet Çelik',
            emergencyContacts: [
                { name: 'Mehmet Gezgin', relation: 'Eş', phone: '0532 123 45 67' },
                { name: 'Ayşe Gezgin', relation: 'Anne', phone: '0533 987 65 43' }
            ]
        },
        {
            id: 2,
            name: 'Ali Vural',
            tc: '12345678901',
            age: 45,
            gender: 'Erkek',
            arrivalTime: '15:15',
            complaint: 'Göğüs ağrısı ve nefes darlığı',
            triageLevel: 'Sarı Alan',
            triageColor: 'yellow',
            vitalSigns: {
                bloodPressure: '160/100',
                pulse: 95,
                temperature: 36.8,
                oxygenSaturation: 94
            },
            status: 'Bekliyor',
            doctor: 'Atanmadı',
            emergencyContacts: [
                { name: 'Fatma Vural', relation: 'Eş', phone: '0534 567 89 01' },
                { name: 'Hasan Vural', relation: 'Kardeş', phone: '0535 234 56 78' }
            ]
        },
        {
            id: 3,
            name: 'Can Talas',
            tc: '98765432109',
            age: 28,
            gender: 'Erkek',
            arrivalTime: '15:45',
            complaint: 'Ayak bileği burkulması',
            triageLevel: 'Yeşil Alan',
            triageColor: 'green',
            vitalSigns: {
                bloodPressure: '120/80',
                pulse: 78,
                temperature: 36.5,
                oxygenSaturation: 99
            },
            status: 'Bekliyor',
            doctor: 'Atanmadı',
            emergencyContacts: [
                { name: 'Zeynep Talas', relation: 'Anne', phone: '0536 345 67 89' }
            ]
        }
    ];

    useEffect(() => {
        setEmergencyPatients(demoEmergencyPatients);
    }, []);

    const getTriageColorClass = (color) => {
        switch (color) {
            case 'red': return 'bg-red-100 border-red-300 text-red-800';
            case 'yellow': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
            case 'green': return 'bg-green-100 border-green-300 text-green-800';
            default: return 'bg-gray-100 border-gray-300 text-gray-800';
        }
    };

    const getStatusColorClass = (status) => {
        switch (status) {
            case 'Muayene': return 'bg-blue-100 text-blue-800';
            case 'Bekliyor': return 'bg-orange-100 text-orange-800';
            case 'Taburcu': return 'bg-green-100 text-green-800';
            case 'Yatış': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
        setShowPatientModal(true);
    };

    const handleNewPatient = () => {
        setShowNewPatientModal(true);
    };

    const handleSaveNewPatient = () => {
        // Form validasyonu
        if (!newPatient.name || !newPatient.tc || !newPatient.age || !newPatient.complaint) {
            toast.error('Lütfen tüm zorunlu alanları doldurun!');
            return;
        }

        // Triaj rengini belirle
        const triageColors = {
            'Kırmızı Alan': 'red',
            'Sarı Alan': 'yellow',
            'Yeşil Alan': 'green'
        };

        // Yeni hasta objesi oluştur
        const patient = {
            id: Date.now(),
            name: newPatient.name,
            tc: newPatient.tc,
            age: parseInt(newPatient.age),
            gender: newPatient.gender,
            arrivalTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            complaint: newPatient.complaint,
            triageLevel: newPatient.triageLevel,
            triageColor: triageColors[newPatient.triageLevel],
            vitalSigns: {
                bloodPressure: '-',
                pulse: '-',
                temperature: '-',
                oxygenSaturation: '-'
            },
            status: 'Bekliyor',
            doctor: 'Atanmadı',
            emergencyContacts: newPatient.emergencyContacts.filter(contact => contact.name && contact.phone)
        };

        // Hasta listesine ekle
        setEmergencyPatients(prev => [...prev, patient]);
        
        // Formu temizle
        setNewPatient({
            name: '',
            tc: '',
            age: '',
            gender: '',
            complaint: '',
            triageLevel: 'Yeşil Alan',
            emergencyContacts: [{ name: '', relation: '', phone: '' }]
        });
        
        toast.success('Yeni hasta başarıyla kaydedildi!');
        setShowNewPatientModal(false);
    };

    const addEmergencyContact = () => {
        setNewPatient(prev => ({
            ...prev,
            emergencyContacts: [...prev.emergencyContacts, { name: '', relation: '', phone: '' }]
        }));
    };

    const removeEmergencyContact = (index) => {
        setNewPatient(prev => ({
            ...prev,
            emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
        }));
    };

    const updateEmergencyContact = (index, field, value) => {
        setNewPatient(prev => ({
            ...prev,
            emergencyContacts: prev.emergencyContacts.map((contact, i) => 
                i === index ? { ...contact, [field]: value } : contact
            )
        }));
    };

    const PatientDetailModal = ({ patient, onClose }) => {
        if (!patient) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Hasta Detayları</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Hasta Bilgileri */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-lg mb-3">Hasta Bilgileri</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-600">Ad Soyad:</span>
                                        <p className="font-semibold">{patient.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">TC Kimlik:</span>
                                        <p className="font-semibold">{patient.tc}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Yaş:</span>
                                        <p className="font-semibold">{patient.age}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Cinsiyet:</span>
                                        <p className="font-semibold">{patient.gender}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Triaj Bilgileri */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-lg mb-3">Triaj Bilgileri</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-600">Geliş Saati:</span>
                                        <p className="font-semibold">{patient.arrivalTime}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Triaj Seviyesi:</span>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getTriageColorClass(patient.triageColor)}`}>
                                            {patient.triageLevel}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <span className="text-gray-600">Şikayet:</span>
                                    <p className="font-semibold">{patient.complaint}</p>
                                </div>
                            </div>

                            {/* Vital Bulgular */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-lg mb-3">Vital Bulgular</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Heart className="text-red-500" size={20} />
                                        <div>
                                            <span className="text-gray-600">Tansiyon:</span>
                                            <p className="font-semibold">{patient.vitalSigns.bloodPressure} mmHg</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Activity className="text-blue-500" size={20} />
                                        <div>
                                            <span className="text-gray-600">Nabız:</span>
                                            <p className="font-semibold">{patient.vitalSigns.pulse} /dk</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Thermometer className="text-orange-500" size={20} />
                                        <div>
                                            <span className="text-gray-600">Ateş:</span>
                                            <p className="font-semibold">{patient.vitalSigns.temperature}°C</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Droplets className="text-cyan-500" size={20} />
                                        <div>
                                            <span className="text-gray-600">SpO2:</span>
                                            <p className="font-semibold">{patient.vitalSigns.oxygenSaturation}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Durum ve Doktor */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-lg mb-3">Mevcut Durum</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-600">Durum:</span>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ml-2 ${getStatusColorClass(patient.status)}`}>
                                            {patient.status}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Sorumlu Doktor:</span>
                                        <p className="font-semibold">{patient.doctor}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Yakınları İletişim */}
                            {patient.emergencyContacts && patient.emergencyContacts.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                        <Users className="text-blue-500" size={20} />
                                        Acil Durum İletişim
                                    </h3>
                                    <div className="space-y-3">
                                        {patient.emergencyContacts.map((contact, index) => (
                                            <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{contact.name}</p>
                                                    <p className="text-sm text-gray-600">{contact.relation}</p>
                                                    <p className="text-sm text-gray-700">{contact.phone}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        // Telefon uygulamasını aç
                                                        const phoneNumber = contact.phone.replace(/\s/g, ''); // Boşlukları kaldır
                                                        window.open(`tel:${phoneNumber}`, '_self');
                                                        toast.success(`${contact.name} aranıyor...`);
                                                    }}
                                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                                    title="Telefon numarasını ara"
                                                >
                                                    <Phone size={16} />
                                                    Ara
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-gray-50">
            {/* Header */}
            <header className="bg-white/90 shadow-md p-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/panel-selection')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Panel Seçimi</span>
                    </button>
                    <div className="flex items-center space-x-2">
                        <img src="/logo-symbol.jpg" alt="Shifha Logo" className="h-10 w-10" />
                        <img src="/logo-text.jpg" alt="SHIFHA" className="h-8" />
                    </div>
                    <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
                        <AlertTriangle className="text-red-600" size={20} />
                        <span className="text-red-800 font-semibold">Acil Servis Paneli</span>
                    </div>
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
            <main className="p-8 max-w-7xl mx-auto">
                {/* Page Title and Actions */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Acil Servis Durum Paneli</h1>
                        <p className="text-gray-600">Acil durum hastalarının takibi ve triaj yönetimi</p>
                    </div>
                    <button
                        onClick={handleNewPatient}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold"
                    >
                        <Plus size={20} />
                        Yeni Acil Kayıt
                    </button>
                </div>

                {/* Triaj Alanları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="text-red-600" size={24} />
                            <h3 className="text-xl font-bold text-red-800">Kırmızı Alan (1 Hasta)</h3>
                        </div>
                        <p className="text-red-700">Yaşamsal tehlike - Acil müdahale</p>
                    </div>
                    <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="text-yellow-600" size={24} />
                            <h3 className="text-xl font-bold text-yellow-800">Sarı Alan (1 Hasta)</h3>
                        </div>
                        <p className="text-yellow-700">Acil - 30 dk içinde müdahale</p>
                    </div>
                    <div className="bg-green-100 border-2 border-green-300 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Heart className="text-green-600" size={24} />
                            <h3 className="text-xl font-bold text-green-800">Yeşil Alan (1 Hasta)</h3>
                        </div>
                        <p className="text-green-700">Acil değil - Sırayla muayene</p>
                    </div>
                </div>

                {/* Hasta Listesi */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Acil Servis Hastaları</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hasta</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Geliş Saati</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triaj</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Şikayet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doktor</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {emergencyPatients.map((patient) => (
                                    <tr
                                        key={patient.id}
                                        onClick={() => handlePatientClick(patient)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                                <div className="text-sm text-gray-500">{patient.tc}</div>
                                                <div className="text-sm text-gray-500">{patient.age} yaş, {patient.gender}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {patient.arrivalTime}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTriageColorClass(patient.triageColor)}`}>
                                                {patient.triageLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {patient.complaint}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(patient.status)}`}>
                                                {patient.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {patient.doctor}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showPatientModal && (
                <PatientDetailModal
                    patient={selectedPatient}
                    onClose={() => {
                        setShowPatientModal(false);
                        setSelectedPatient(null);
                    }}
                />
            )}

            {showNewPatientModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Yeni Acil Hasta Kaydı</h2>
                                <button
                                    onClick={() => setShowNewPatientModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hasta Adı *</label>
                                    <input
                                        type="text"
                                        value={newPatient.name}
                                        onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Hasta adını girin"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik No *</label>
                                        <input
                                            type="text"
                                            value={newPatient.tc}
                                            onChange={(e) => setNewPatient(prev => ({ ...prev, tc: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="TC Kimlik No"
                                            maxLength="11"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Yaş *</label>
                                        <input
                                            type="number"
                                            value={newPatient.age}
                                            onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Yaş"
                                            min="0"
                                            max="150"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                                    <select 
                                        value={newPatient.gender}
                                        onChange={(e) => setNewPatient(prev => ({ ...prev, gender: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Cinsiyet Seçin</option>
                                        <option value="Erkek">Erkek</option>
                                        <option value="Kadın">Kadın</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Şikayet *</label>
                                    <textarea
                                        value={newPatient.complaint}
                                        onChange={(e) => setNewPatient(prev => ({ ...prev, complaint: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Hasta şikayetini girin"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Triaj Seviyesi</label>
                                    <select 
                                        value={newPatient.triageLevel}
                                        onChange={(e) => setNewPatient(prev => ({ ...prev, triageLevel: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Kırmızı Alan">Kırmızı Alan (Acil)</option>
                                        <option value="Sarı Alan">Sarı Alan (Orta)</option>
                                        <option value="Yeşil Alan">Yeşil Alan (Normal)</option>
                                    </select>
                                </div>

                                {/* Acil Durum İletişim */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-gray-700">Acil Durum İletişim</label>
                                        <button
                                            type="button"
                                            onClick={addEmergencyContact}
                                            className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                                        >
                                            <Plus size={16} />
                                            Kişi Ekle
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {newPatient.emergencyContacts.map((contact, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                                                <div className="grid grid-cols-3 gap-3">
                                                    <input
                                                        type="text"
                                                        value={contact.name}
                                                        onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                                                        placeholder="Ad Soyad"
                                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={contact.relation}
                                                        onChange={(e) => updateEmergencyContact(index, 'relation', e.target.value)}
                                                        placeholder="Yakınlık"
                                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="tel"
                                                            value={contact.phone}
                                                            onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                                                            placeholder="Telefon"
                                                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                        {newPatient.emergencyContacts.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEmergencyContact(index)}
                                                                className="text-red-500 hover:text-red-700 px-2"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowNewPatientModal(false)}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSaveNewPatient}
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Hasta Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmergencyPanelPage;