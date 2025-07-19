import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Bell, ChevronDown, Users, Stethoscope, BarChart2, Settings, LogOut, Activity, Cpu, Shield, MapPin, CheckCircle, XCircle, Building, ArrowRightLeft } from 'lucide-react';

// --- MOCK DATA ---
const initialHospitalData = [
    { id: 201, name: 'Tokat Devlet Hastanesi', city: 'Tokat', district: 'Merkez', departments: ['Dahiliye', 'Pediatri', 'Göz Hastalıkları'] },
    { id: 202, name: 'İstanbul Çam ve Sakura Şehir Hastanesi', city: 'İstanbul', district: 'Başakşehir', departments: ['Kardiyoloji', 'Nöroloji', 'Dahiliye', 'Genel Cerrahi'] },
    { id: 203, name: 'Ankara Şehir Hastanesi', city: 'Ankara', district: 'Çankaya', departments: ['Kardiyoloji', 'Nöroloji', 'Pediatri'] },
    { id: 204, name: 'İzmir Tepecik Eğitim ve Araştırma Hastanesi', city: 'İzmir', district: 'Konak', departments: ['Nöroloji', 'Pediatri', 'Göz Hastalıkları'] },
    { id: 205, name: 'Bursa Şehir Hastanesi', city: 'Bursa', district: 'Nilüfer', departments: ['Dahiliye', 'Kardiyoloji'] }
];
const initialDoctorData = [
  { id: 1, name: 'Dr. Aylin Yılmaz', specialty: 'Kardiyoloji', email: 'aylin.yilmaz@shifha.com', status: 'Aktif', city: 'İstanbul', hospitalId: 202 },
  { id: 2, name: 'Dr. Mehmet Öztürk', specialty: 'Nöroloji', email: 'mehmet.ozturk@shifha.com', status: 'Aktif', city: 'Ankara', hospitalId: 203 },
  { id: 3, name: 'Dr. Elif Kaya', specialty: 'Pediatri', email: 'elif.kaya@shifha.com', status: 'Onay Bekliyor', city: 'İzmir', hospitalId: 204 },
  { id: 4, name: 'Dr. Caner Baş', specialty: 'Dahiliye', email: 'caner.bas@shifha.com', status: 'Askıya Alındı', city: 'Bursa', hospitalId: 205 },
  { id: 5, name: 'Dr. Sema Güler', specialty: 'Göz Hastalıkları', email: 'sema.guler@shifha.com', status: 'Aktif', city: 'Antalya', hospitalId: null },
  { id: 6, name: 'Dr. Ali Vural', specialty: 'Kardiyoloji', email: 'ali.vural@shifha.com', status: 'Aktif', city: 'Ankara', hospitalId: 203 },
  { id: 7, name: 'Dr. Zeynep Şahin', specialty: 'Dahiliye', email: 'zeynep.sahin@shifha.com', status: 'Onay Bekliyor', city: 'İstanbul', hospitalId: 202 },
  { id: 8, name: 'Dr. Hakan Kurt', specialty: 'Nöroloji', email: 'hakan.kurt@shifha.com', status: 'Aktif', city: 'İzmir', hospitalId: 204 },
];
const patientData = [
  { id: 101, name: 'Ahmet Çelik', tckn: '12345678901', email: 'ahmet.celik@email.com', status: 'Aktif', city: 'İstanbul' },
  { id: 102, name: 'Fatma Şahin', tckn: '23456789012', email: 'fatma.sahin@email.com', status: 'Aktif', city: 'Ankara' },
];
const analysisData = [
  { name: 'Ocak', tahlil: 4000, anormal: 240 }, { name: 'Şubat', tahlil: 3000, anormal: 139 }, { name: 'Mart', tahlil: 2000, anormal: 980 }, { name: 'Nisan', tahlil: 2780, anormal: 390 }, { name: 'Mayıs', tahlil: 1890, anormal: 480 }, { name: 'Haziran', tahlil: 2390, anormal: 380 }, { name: 'Temmuz', tahlil: 3490, anormal: 430 },
];
const recentActivities = [
  { icon: <Stethoscope size={18} />, text: 'Dr. Aylin Yılmaz yeni bir hasta kaydetti.', time: '5 dakika önce' }, { icon: <Cpu size={18} className="text-purple-500" />, text: 'AI, 12345... TCKN\'li hasta için yüksek riskli diyabet uyarısı oluşturdu.', time: '25 dakika önce' }, { icon: <Users size={18} />, text: 'Dr. Elif Kaya\'nın hesabı onaya gönderildi.', time: '1 saat önce' }, { icon: <Activity size={18} className="text-red-500" />, text: 'Sistem, anormal kan değeri tespit etti.', time: '3 saat önce' },
];

// --- COMPONENTS ---
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between transition-transform transform hover:-translate-y-1">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${color}`}>{icon}</div>
  </div>
);

const UserTable = ({ data, columns, title, filterOptions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  const filteredData = data.filter(item => {
    const searchMatch = Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const cityMatch = cityFilter === 'all' || item.city === cityFilter;
    const specialtyMatch = specialtyFilter === 'all' || (item.specialty && item.specialty === specialtyFilter);
    return searchMatch && cityMatch && specialtyMatch;
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <div className="flex flex-wrap items-center gap-4">
          {filterOptions?.cities && (
            <select onChange={(e) => setCityFilter(e.target.value)} className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tüm Şehirler</option>
              {filterOptions.cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          )}
          {filterOptions?.specialties && (
            <select onChange={(e) => setSpecialtyFilter(e.target.value)} className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tüm Uzmanlıklar</option>
              {filterOptions.specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
            </select>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Ara..." className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              {columns.map(col => <th key={col.key} className="p-4 text-sm font-medium text-gray-500">{col.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className="p-4 text-gray-700 text-sm align-middle">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Ana Panel', icon: <BarChart2 size={20} /> },
    { id: 'doctors', label: 'Doktorlar', icon: <Stethoscope size={20} /> },
    { id: 'patients', label: 'Hastalar', icon: <Users size={20} /> },
    { id: 'hospitals', label: 'Hastaneler', icon: <Building size={20} /> },
    { id: 'map', label: 'Harita Analizi', icon: <MapPin size={20} /> },
    { id: 'ai-module', label: 'Yapay Zeka', icon: <Cpu size={20} /> },
    { id: 'settings', label: 'Ayarlar', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white flex-shrink-0 p-4 flex flex-col shadow-lg">
      <div className="flex items-center space-x-2 p-4 mb-6 border-b">
        <Shield size={32} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Shifha</h1>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {menuItems.map(item => (
            <li key={item.id} onClick={() => setCurrentPage(item.id)}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${currentPage === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}>
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <div className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-200">
          <LogOut size={20} />
          <span className="font-medium">Çıkış Yap</span>
        </div>
      </div>
    </aside>
  );
};

const Header = () => (
  <header className="bg-white p-4 flex justify-between items-center shadow-md">
    <h2 className="text-2xl font-bold text-gray-800">Türkiye Geneli Yönetim Paneli</h2>
    <div className="flex items-center space-x-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="Hasta veya Doktor Ara..." className="pl-10 pr-4 py-2 w-64 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <Bell size={24} className="text-gray-500 cursor-pointer hover:text-blue-600" />
      <div className="flex items-center space-x-3 cursor-pointer">
        <img src="https://placehold.co/40x40/E2E8F0/4A5568?text=A" alt="Admin" className="w-10 h-10 rounded-full" />
        <div>
          <p className="font-semibold text-gray-800">Admin User</p>
          <p className="text-xs text-gray-500">Sistem Yöneticisi</p>
        </div>
        <ChevronDown size={20} className="text-gray-500" />
      </div>
    </div>
  </header>
);

const TransferDoctorModal = ({ isOpen, onClose, doctor, hospitals, onConfirm }) => {
  const [targetHospitalId, setTargetHospitalId] = useState('');
  if (!isOpen || !doctor) return null;
  const currentHospital = hospitals.find(h => h.id === doctor.hospitalId);
  const availableHospitals = hospitals.filter(h => h.id !== doctor.hospitalId);
  const handleConfirm = () => {
    if (targetHospitalId) {
      onConfirm(doctor.id, parseInt(targetHospitalId));
      onClose();
    } else {
      alert("Lütfen bir hedef hastane seçin.");
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Doktor Transferi</h3>
        <p className="text-gray-600 mb-6">Lütfen <span className="font-semibold">{doctor.name}</span> için yeni hastaneyi seçin.</p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Hastane</label>
          <p className="text-gray-800 font-semibold">{currentHospital ? `${currentHospital.name} (${currentHospital.city})` : 'Atanmamış'}</p>
        </div>
        <div className="mb-6">
          <label htmlFor="hospital-select" className="block text-sm font-medium text-gray-700 mb-1">Yeni Hastane</label>
          <select
            id="hospital-select"
            value={targetHospitalId}
            onChange={(e) => setTargetHospitalId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hastane Seçiniz...</option>
            {availableHospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name} - {h.city}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">İptal</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <ArrowRightLeft size={16}/> Transferi Onayla
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PAGES ---
const Dashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Toplam Doktor" value="1,250" icon={<Stethoscope size={24} className="text-white"/>} color="bg-blue-500" />
      <StatCard title="Toplam Hasta" value="87,430" icon={<Users size={24} className="text-white"/>} color="bg-green-500" />
      <StatCard title="Onay Bekleyen Dr." value="2" icon={<CheckCircle size={24} className="text-white"/>} color="bg-yellow-500" />
      <StatCard title="Anormal Bulgular" value="189" icon={<Shield size={24} className="text-white"/>} color="bg-red-500" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Tahlil Analiz Trendi</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analysisData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{fill: '#6b7280'}} />
            <YAxis tick={{fill: '#6b7280'}}/>
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '0.5rem' }}/>
            <Legend />
            <Line type="monotone" dataKey="tahlil" stroke="#3b82f6" strokeWidth={2} name="Toplam Tahlil"/>
            <Line type="monotone" dataKey="anormal" stroke="#ef4444" strokeWidth={2} name="Anormal Sonuç"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Son Aktiviteler</h3>
        <ul className="space-y-4">
          {recentActivities.map((activity, index) => (
            <li key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1 text-gray-500">{activity.icon}</div>
              <div>
                <p className="text-sm text-gray-700">{activity.text}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const DoctorsPage = ({ doctors, hospitals, onDoctorTransfer }) => {
  const [doctorToTransfer, setDoctorToTransfer] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const handleApprove = (id) => {
    setModalMessage(`Doktor ID ${id} başarıyla onaylandı!`);
    setShowSuccessModal(true);
  };
  const handleReject = (id) => {
    setModalMessage(`Doktor ID ${id} başarıyla reddedildi!`);
    setShowSuccessModal(true);
  };
  const getStatusChipClass = (status) => {
    switch (status) {
      case 'Aktif': return 'bg-green-100 text-green-800';
      case 'Onay Bekliyor': return 'bg-yellow-100 text-yellow-800';
      case 'Askıya Alındı': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const columns = [
    { key: 'name', header: 'Ad Soyad' },
    { key: 'specialty', header: 'Uzmanlık' },
    { 
      key: 'hospital', 
      header: 'Hastane', 
      render: (item) => {
        const hospital = hospitals.find(h => h.id === item.hospitalId);
        return hospital ? `${hospital.name} (${hospital.city})` : <span className="text-gray-400">Atanmamış</span>;
      }
    },
    { 
      key: 'status', 
      header: 'Durum',
      render: (item) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(item.status)}`}>
          {item.status}
        </span>
      )
    },
    { 
      key: 'actions', 
      header: 'İşlemler',
      render: (item) => (
        <div className="flex items-center space-x-3">
          {item.status === 'Onay Bekliyor' ? (
            <>
              <button onClick={() => handleApprove(item.id)} className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-semibold"><CheckCircle size={16}/> Onayla</button>
              <button onClick={() => handleReject(item.id)} className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-semibold"><XCircle size={16}/> Reddet</button>
            </>
          ) : (
            <>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Detay</button>
              <button onClick={() => setDoctorToTransfer(item)} className="text-purple-600 hover:text-purple-800 text-sm font-semibold flex items-center gap-1">
                <ArrowRightLeft size={14}/> Transfer Et
              </button>
            </>
          )}
        </div>
      )
    },
  ];
  const uniqueCities = [...new Set(doctors.map(d => d.city))];
  const uniqueSpecialties = [...new Set(doctors.map(d => d.specialty))];
  return (
    <>
      <UserTable data={doctors} columns={columns} title="Doktor Yönetimi" filterOptions={{ cities: uniqueCities, specialties: uniqueSpecialties }} />
      <TransferDoctorModal 
        isOpen={!!doctorToTransfer}
        onClose={() => setDoctorToTransfer(null)}
        doctor={doctorToTransfer}
        hospitals={hospitals}
        onConfirm={onDoctorTransfer}
      />
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h4 className="text-lg font-bold mb-2">İşlem Başarılı</h4>
            <p>{modalMessage}</p>
            <button onClick={() => setShowSuccessModal(false)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Kapat</button>
          </div>
        </div>
      )}
    </>
  );
};

const PatientsPage = () => {
  const columns = [
    { key: 'name', header: 'Ad Soyad' }, { key: 'tckn', header: 'T.C. Kimlik No' }, { key: 'city', header: 'Şehir' }, { key: 'status', header: 'Durum' }, { key: 'actions', header: 'İşlemler' },
  ];
  return <UserTable data={patientData} columns={columns} title="Hasta Yönetimi" filterOptions={{ cities: [...new Set(patientData.map(p => p.city))] }} />;
};

const HospitalsPage = ({ hospitals }) => {
  const columns = [
    { key: 'name', header: 'Hastane Adı' }, { key: 'city', header: 'Şehir' }, { key: 'district', header: 'İlçe' }, { key: 'departments', render: (item) => item.departments.join(', '), header: 'Bölümler' }, { key: 'actions', header: 'İşlemler' },
  ];
  return <UserTable data={hospitals} columns={columns} title="Hastane Yönetimi" filterOptions={{ cities: [...new Set(hospitals.map(h => h.city))] }} />;
};

const MapChart = () => (
  <div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-xl font-bold text-gray-800 mb-4">Türkiye Doktor Yoğunluk Haritası</h3><div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-lg border-2 border-dashed"><div className="text-center text-gray-500"><MapPin size={48} className="mx-auto mb-4 text-gray-400" /><p className="font-semibold text-lg">Etkileşimli Harita Alanı</p><p className="text-sm mt-1">(Önizleme ortamında harita kütüphanesi devre dışı bırakıldı)</p></div></div></div>
);

const PlaceholderPage = ({ title }) => (
  <div className="bg-white p-10 rounded-xl shadow-md text-center"><h2 className="text-3xl font-bold text-gray-800">{title}</h2><p className="text-gray-500 mt-2">Bu bölüm geliştirme aşamasındadır.</p></div>
);

// --- MAIN ADMIN PANEL COMPONENT ---
export default function AdminPanelApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [doctors, setDoctors] = useState(initialDoctorData);
  const [hospitals, setHospitals] = useState(initialHospitalData);
  const handleDoctorTransfer = (doctorId, newHospitalId) => {
    setDoctors(prevDoctors => 
      prevDoctors.map(doc => {
        if (doc.id === doctorId) {
          const newHospital = hospitals.find(h => h.id === newHospitalId);
          return { ...doc, hospitalId: newHospitalId, city: newHospital.city };
        }
        return doc;
      })
    );
    console.log(`Doctor ${doctorId} transferred to hospital ${newHospitalId}`);
  };
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'doctors':
        return <DoctorsPage doctors={doctors} hospitals={hospitals} onDoctorTransfer={handleDoctorTransfer} />;
      case 'patients':
        return <PatientsPage />;
      case 'hospitals':
        return <HospitalsPage hospitals={hospitals} />;
      case 'map':
        return <MapChart />;
      case 'ai-module':
        return <PlaceholderPage title="Yapay Zeka Modülü" />;
      case 'settings':
        return <PlaceholderPage title="Sistem Ayarları" />;
      default:
        return <Dashboard />;
    }
  };
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 p-6 overflow-y-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
} 