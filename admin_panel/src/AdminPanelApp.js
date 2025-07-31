import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Search, Bell, ChevronDown, Users, Stethoscope, BarChart2, Settings, LogOut, Activity, Cpu, Shield, MapPin, CheckCircle, XCircle, Building, ArrowRightLeft, Plus, Edit, Trash2, Calendar, TrendingUp, AlertTriangle, UserPlus, X, Heart, Clock, Zap, Phone, AlertCircle, User, FileText, Eye } from 'lucide-react';

// API Base URL
const API_BASE_URL = 'http://localhost:3002/api';

// --- MOCK DATA ---
const initialHospitalData = [
    { id: 201, name: 'Tokat Devlet Hastanesi', city: 'Tokat', district: 'Merkez', departments: ['Dahiliye', 'Pediatri', 'Göz Hastalıkları'], doctorCount: 45, bedCount: 200, region: 'Karadeniz' },
    { id: 202, name: 'İstanbul Çam ve Sakura Şehir Hastanesi', city: 'İstanbul', district: 'Başakşehir', departments: ['Kardiyoloji', 'Nöroloji', 'Dahiliye', 'Genel Cerrahi'], doctorCount: 320, bedCount: 2500, region: 'Marmara' },
    { id: 203, name: 'Ankara Şehir Hastanesi', city: 'Ankara', district: 'Çankaya', departments: ['Kardiyoloji', 'Nöroloji', 'Pediatri'], doctorCount: 280, bedCount: 1800, region: 'İç Anadolu' },
    { id: 204, name: 'İzmir Tepecik Eğitim ve Araştırma Hastanesi', city: 'İzmir', district: 'Konak', departments: ['Nöroloji', 'Pediatri', 'Göz Hastalıkları'], doctorCount: 150, bedCount: 800, region: 'Ege' },
    { id: 205, name: 'Bursa Şehir Hastanesi', city: 'Bursa', district: 'Nilüfer', departments: ['Dahiliye', 'Kardiyoloji'], doctorCount: 120, bedCount: 600, region: 'Marmara' },
    { id: 206, name: 'Antalya Eğitim ve Araştırma Hastanesi', city: 'Antalya', district: 'Muratpaşa', departments: ['Dahiliye', 'Kardiyoloji', 'Göz Hastalıkları'], doctorCount: 95, bedCount: 450, region: 'Akdeniz' }
];

const initialDoctorData = [
  { id: 1, name: 'Dr. Aylin Yılmaz', specialty: 'Kardiyoloji', email: 'aylin.yilmaz@shifha.com', status: 'Aktif', city: 'İstanbul', hospitalId: 202, experience: 8, phone: '0532 123 4567' },
  { id: 2, name: 'Dr. Mehmet Öztürk', specialty: 'Nöroloji', email: 'mehmet.ozturk@shifha.com', status: 'Aktif', city: 'Ankara', hospitalId: 203, experience: 12, phone: '0533 234 5678' },
  { id: 3, name: 'Dr. Elif Kaya', specialty: 'Pediatri', email: 'elif.kaya@shifha.com', status: 'Onay Bekliyor', city: 'İzmir', hospitalId: 204, experience: 5, phone: '0534 345 6789' },
  { id: 4, name: 'Dr. Caner Baş', specialty: 'Dahiliye', email: 'caner.bas@shifha.com', status: 'Askıya Alındı', city: 'Bursa', hospitalId: 205, experience: 15, phone: '0535 456 7890' },
  { id: 5, name: 'Dr. Sema Güler', specialty: 'Göz Hastalıkları', email: 'sema.guler@shifha.com', status: 'Aktif', city: 'Antalya', hospitalId: null, experience: 7, phone: '0536 567 8901' },
  { id: 6, name: 'Dr. Ali Vural', specialty: 'Kardiyoloji', email: 'ali.vural@shifha.com', status: 'Aktif', city: 'Ankara', hospitalId: 203, experience: 10, phone: '0537 678 9012' },
  { id: 7, name: 'Dr. Zeynep Şahin', specialty: 'Dahiliye', email: 'zeynep.sahin@shifha.com', status: 'Onay Bekliyor', city: 'İstanbul', hospitalId: 202, experience: 6, phone: '0538 789 0123' },
  { id: 8, name: 'Dr. Hakan Kurt', specialty: 'Nöroloji', email: 'hakan.kurt@shifha.com', status: 'Aktif', city: 'İzmir', hospitalId: 204, experience: 9, phone: '0539 890 1234' },
];

const patientData = [
  { id: 101, name: 'Ahmet Çelik', tckn: '12345678901', email: 'ahmet.celik@email.com', status: 'Aktif', city: 'İstanbul', lastVisit: '2024-01-15', diagnosisCount: 3 },
  { id: 102, name: 'Fatma Şahin', tckn: '23456789012', email: 'fatma.sahin@email.com', status: 'Aktif', city: 'Ankara', lastVisit: '2024-01-10', diagnosisCount: 1 },
  { id: 103, name: 'Mehmet Yılmaz', tckn: '34567890123', email: 'mehmet.yilmaz@email.com', status: 'Aktif', city: 'İzmir', lastVisit: '2024-01-12', diagnosisCount: 5 },
];

const analysisData = [
  { name: 'Ocak', tahlil: 4000, anormal: 240, teşhis: 3200, randevu: 4500 }, 
  { name: 'Şubat', tahlil: 3000, anormal: 139, teşhis: 2800, randevu: 3200 }, 
  { name: 'Mart', tahlil: 2000, anormal: 980, teşhis: 1800, randevu: 2100 }, 
  { name: 'Nisan', tahlil: 2780, anormal: 390, teşhis: 2500, randevu: 2900 }, 
  { name: 'Mayıs', tahlil: 1890, anormal: 480, teşhis: 1700, randevu: 2000 }, 
  { name: 'Haziran', tahlil: 2390, anormal: 380, teşhis: 2200, randevu: 2600 }, 
  { name: 'Temmuz', tahlil: 3490, anormal: 430, teşhis: 3200, randevu: 3800 },
];

const diagnosisData = [
  { name: 'Diyabet', value: 35, color: '#8884d8' },
  { name: 'Hipertansiyon', value: 28, color: '#82ca9d' },
  { name: 'Kalp Hastalıkları', value: 20, color: '#ffc658' },
  { name: 'Astım', value: 12, color: '#ff7300' },
  { name: 'Diğer', value: 5, color: '#8dd1e1' }
];

const regionData = [
  { region: 'Marmara', hospitals: 45, doctors: 1250, patients: 25000 },
  { region: 'Ege', hospitals: 32, doctors: 890, patients: 18000 },
  { region: 'Akdeniz', hospitals: 28, doctors: 720, patients: 15000 },
  { region: 'İç Anadolu', hospitals: 35, doctors: 980, patients: 20000 },
  { region: 'Karadeniz', hospitals: 25, doctors: 650, patients: 12000 },
  { region: 'Doğu Anadolu', hospitals: 18, doctors: 420, patients: 8000 },
  { region: 'Güneydoğu Anadolu', hospitals: 22, doctors: 580, patients: 11000 }
];

const recentActivities = [
  { icon: <Stethoscope size={18} />, text: 'Dr. Aylin Yılmaz yeni bir hasta kaydetti.', time: '5 dakika önce' }, 
  { icon: <Cpu size={18} className="text-purple-500" />, text: 'AI, 12345... TCKN\'li hasta için yüksek riskli diyabet uyarısı oluşturdu.', time: '25 dakika önce' }, 
  { icon: <Users size={18} />, text: 'Dr. Elif Kaya\'nın hesabı onaya gönderildi.', time: '1 saat önce' }, 
  { icon: <Activity size={18} className="text-red-500" />, text: 'Sistem, anormal kan değeri tespit etti.', time: '3 saat önce' },
  { icon: <Building size={18} className="text-blue-500" />, text: 'Antalya Eğitim ve Araştırma Hastanesi sisteme eklendi.', time: '2 saat önce' },
  { icon: <UserPlus size={18} className="text-green-500" />, text: 'Dr. Sema Güler Antalya hastanesine atandı.', time: '4 saat önce' },
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
    { id: 'regions', label: 'Bölge Yönetimi', icon: <MapPin size={20} /> },
    { id: 'diagnosis', label: 'Teşhis Analizi', icon: <TrendingUp size={20} /> },
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

// --- PAGES ---
const Dashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Toplam Doktor" value="1,250" icon={<Stethoscope size={24} className="text-white"/>} color="bg-blue-500" />
      <StatCard title="Toplam Hasta" value="87,430" icon={<Users size={24} className="text-white"/>} color="bg-green-500" />
      <StatCard title="Toplam Hastane" value="190" icon={<Building size={24} className="text-white"/>} color="bg-purple-500" />
      <StatCard title="Anormal Bulgular" value="189" icon={<AlertTriangle size={24} className="text-white"/>} color="bg-red-500" />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Aylık Analiz Trendi</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analysisData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{fill: '#6b7280'}} />
            <YAxis tick={{fill: '#6b7280'}}/>
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '0.5rem' }}/>
            <Legend />
            <Line type="monotone" dataKey="tahlil" stroke="#3b82f6" strokeWidth={2} name="Toplam Tahlil"/>
            <Line type="monotone" dataKey="anormal" stroke="#ef4444" strokeWidth={2} name="Anormal Sonuç"/>
            <Line type="monotone" dataKey="teşhis" stroke="#10b981" strokeWidth={2} name="Teşhis"/>
            <Line type="monotone" dataKey="randevu" stroke="#f59e0b" strokeWidth={2} name="Randevu"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Teşhis Dağılımı</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={diagnosisData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {diagnosisData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Bölgesel Dağılım</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="region" tick={{fill: '#6b7280', fontSize: 12}} angle={-45} textAnchor="end" height={80} />
            <YAxis tick={{fill: '#6b7280'}}/>
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '0.5rem' }}/>
            <Legend />
            <Bar dataKey="hospitals" fill="#3b82f6" name="Hastane"/>
            <Bar dataKey="doctors" fill="#10b981" name="Doktor"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Son Aktiviteler</h3>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-1 text-gray-500">{activity.icon}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{activity.text}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- MODALS ---
const AddDoctorModal = ({ isOpen, onClose, onAddDoctor, hospitals }) => {
  const [formData, setFormData] = useState({
    name: '', specialty: '', email: '', phone: '', experience: '', city: '', hospitalId: ''
  });

  const specialties = ['Kardiyoloji', 'Nöroloji', 'Pediatri', 'Dahiliye', 'Göz Hastalıkları', 'Genel Cerrahi', 'Ortopedi', 'Üroloji', 'Kadın Doğum', 'Kulak Burun Boğaz'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDoctor = {
      id: Date.now(),
      ...formData,
      status: 'Onay Bekliyor',
      experience: parseInt(formData.experience)
    };
    onAddDoctor(newDoctor);
    setFormData({ name: '', specialty: '', email: '', phone: '', experience: '', city: '', hospitalId: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Yeni Doktor Ekle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Doktor Adı" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <select value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Uzmanlık Seçin</option>
            {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
          </select>
          <input type="email" placeholder="E-posta" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="tel" placeholder="Telefon" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="number" placeholder="Deneyim (Yıl)" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="Şehir" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <select value={formData.hospitalId} onChange={(e) => setFormData({...formData, hospitalId: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Hastane Seçin (Opsiyonel)</option>
            {hospitals.map(hospital => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
          </select>
          <div className="flex space-x-3">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">Ekle</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors">İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditDoctorModal = ({ isOpen, onClose, onEditDoctor, doctor, hospitals }) => {
  const [formData, setFormData] = useState({
    name: '', specialty: '', email: '', phone: '', experience: '', city: '', hospitalId: '', status: ''
  });

  const specialties = ['Kardiyoloji', 'Nöroloji', 'Pediatri', 'Dahiliye', 'Göz Hastalıkları', 'Genel Cerrahi', 'Ortopedi', 'Üroloji', 'Kadın Doğum', 'Kulak Burun Boğaz'];
  const statuses = ['Aktif', 'Onay Bekliyor', 'Askıya Alındı'];

  React.useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        specialty: doctor.specialty || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        experience: doctor.experience || '',
        city: doctor.city || '',
        hospitalId: doctor.hospitalId || '',
        status: doctor.status || ''
      });
    }
  }, [doctor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedDoctor = {
      ...doctor,
      ...formData,
      experience: parseInt(formData.experience)
    };
    onEditDoctor(updatedDoctor);
    onClose();
  };

  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Doktor Düzenle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Doktor Adı" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <select value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Uzmanlık Seçin</option>
            {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
          </select>
          <input type="email" placeholder="E-posta" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="tel" placeholder="Telefon" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="number" placeholder="Deneyim (Yıl)" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="Şehir" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <select value={formData.hospitalId} onChange={(e) => setFormData({...formData, hospitalId: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Hastane Seçin (Opsiyonel)</option>
            {hospitals.map(hospital => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
          </select>
          <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Durum Seçin</option>
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
          <div className="flex space-x-3">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">Güncelle</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors">İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddPatientModal = ({ isOpen, onClose, onAddPatient }) => {
  const [formData, setFormData] = useState({
    name: '', tckn: '', email: '', phone: '', city: '', birthDate: '', gender: '', address: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPatient = {
      id: Date.now(),
      ...formData,
      status: 'Aktif',
      lastVisit: new Date().toISOString().split('T')[0],
      diagnosisCount: 0
    };
    onAddPatient(newPatient);
    setFormData({ name: '', tckn: '', email: '', phone: '', city: '', birthDate: '', gender: '', address: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Yeni Hasta Ekle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Hasta Adı" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="TC Kimlik No" value={formData.tckn} onChange={(e) => setFormData({...formData, tckn: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required maxLength="11" />
          <input type="email" placeholder="E-posta" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="tel" placeholder="Telefon" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="Şehir" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="date" placeholder="Doğum Tarihi" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Cinsiyet Seçin</option>
            <option value="Erkek">Erkek</option>
            <option value="Kadın">Kadın</option>
          </select>
          <textarea placeholder="Adres" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
          <div className="flex space-x-3">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">Ekle</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors">İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditPatientModal = ({ isOpen, onClose, onEditPatient, patient }) => {
  const [formData, setFormData] = useState({
    name: '', tckn: '', email: '', phone: '', city: '', birthDate: '', gender: '', address: '', status: ''
  });

  const statuses = ['Aktif', 'Pasif', 'Askıya Alındı'];

  React.useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        tckn: patient.tckn || '',
        email: patient.email || '',
        phone: patient.phone || '',
        city: patient.city || '',
        birthDate: patient.birthDate || '',
        gender: patient.gender || '',
        address: patient.address || '',
        status: patient.status || ''
      });
    }
  }, [patient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedPatient = {
      ...patient,
      ...formData
    };
    onEditPatient(updatedPatient);
    onClose();
  };

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Hasta Düzenle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Hasta Adı" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="TC Kimlik No" value={formData.tckn} onChange={(e) => setFormData({...formData, tckn: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required maxLength="11" />
          <input type="email" placeholder="E-posta" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="tel" placeholder="Telefon" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="Şehir" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="date" placeholder="Doğum Tarihi" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Cinsiyet Seçin</option>
            <option value="Erkek">Erkek</option>
            <option value="Kadın">Kadın</option>
          </select>
          <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Durum Seçin</option>
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
          <textarea placeholder="Adres" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
          <div className="flex space-x-3">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">Güncelle</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors">İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PatientsPage = ({ patients, onAddPatient, onEditPatient, onDeletePatient }) => {
// --- PAGES ---
const DoctorsPage = ({ doctors, hospitals, onAddDoctor, onEditDoctor, onDeleteDoctor }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    return hospital ? hospital.name : 'Atanmamış';
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Aktif': 'bg-green-100 text-green-800',
      'Onay Bekliyor': 'bg-yellow-100 text-yellow-800',
      'Askıya Alındı': 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setShowEditModal(true);
  };

  const handleDelete = (doctorId) => {
    if (window.confirm('Bu doktoru silmek istediğinizden emin misiniz?')) {
      onDeleteDoctor(doctorId);
    }
  };

  const columns = [
    { key: 'name', header: 'Doktor Adı' },
    { key: 'specialty', header: 'Uzmanlık' },
    { key: 'email', header: 'E-posta' },
    { key: 'phone', header: 'Telefon' },
    { key: 'city', header: 'Şehir' },
    { key: 'experience', header: 'Deneyim', render: (doctor) => `${doctor.experience} yıl` },
    { key: 'hospital', header: 'Hastane', render: (doctor) => getHospitalName(doctor.hospitalId) },
    { key: 'status', header: 'Durum', render: (doctor) => getStatusBadge(doctor.status) },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (doctor) => (
        <div className="flex space-x-2">
          <button onClick={() => handleEdit(doctor)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(doctor.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const cities = [...new Set(doctors.map(d => d.city))];
  const specialties = [...new Set(doctors.map(d => d.specialty))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Doktor Yönetimi</h2>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus size={20} />
          <span>Yeni Doktor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Toplam Doktor" value={doctors.length.toString()} icon={<Stethoscope size={24} className="text-white"/>} color="bg-blue-500" />
        <StatCard title="Aktif Doktor" value={doctors.filter(d => d.status === 'Aktif').length.toString()} icon={<CheckCircle size={24} className="text-white"/>} color="bg-green-500" />
        <StatCard title="Onay Bekleyen" value={doctors.filter(d => d.status === 'Onay Bekliyor').length.toString()} icon={<Calendar size={24} className="text-white"/>} color="bg-yellow-500" />
        <StatCard title="Askıya Alınan" value={doctors.filter(d => d.status === 'Askıya Alındı').length.toString()} icon={<XCircle size={24} className="text-white"/>} color="bg-red-500" />
      </div>

      <UserTable 
        data={doctors} 
        columns={columns} 
        title="Doktor Listesi" 
        filterOptions={{ cities, specialties }}
      />

      <AddDoctorModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAddDoctor={onAddDoctor}
        hospitals={hospitals}
      />

      <EditDoctorModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        onEditDoctor={onEditDoctor}
        doctor={selectedDoctor}
        hospitals={hospitals}
      />
    </div>
  );
};
  const [selectedPatient, setSelectedPatient] = useState(null);

  const getStatusBadge = (status) => {
    const colors = {
      'Aktif': 'bg-green-100 text-green-800',
      'Pasif': 'bg-gray-100 text-gray-800',
      'Askıya Alındı': 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleDelete = (patientId) => {
    if (window.confirm('Bu hastayı silmek istediğinizden emin misiniz?')) {
      onDeletePatient(patientId);
    }
  };

  const columns = [
    { key: 'name', header: 'Hasta Adı' },
    { key: 'tckn', header: 'TC Kimlik No' },
    { key: 'email', header: 'E-posta' },
    { key: 'phone', header: 'Telefon' },
    { key: 'city', header: 'Şehir' },
    { key: 'lastVisit', header: 'Son Ziyaret' },
    { key: 'diagnosisCount', header: 'Teşhis Sayısı' },
    { key: 'status', header: 'Durum', render: (patient) => getStatusBadge(patient.status) },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (patient) => (
        <div className="flex space-x-2">
          <button onClick={() => handleEdit(patient)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(patient.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const cities = [...new Set(patients.map(p => p.city))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Hasta Yönetimi</h2>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus size={20} />
          <span>Yeni Hasta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Toplam Hasta" value={patients.length.toString()} icon={<Users size={24} className="text-white"/>} color="bg-blue-500" />
        <StatCard title="Aktif Hasta" value={patients.filter(p => p.status === 'Aktif').length.toString()} icon={<CheckCircle size={24} className="text-white"/>} color="bg-green-500" />
        <StatCard title="Bu Ay Ziyaret" value="1,234" icon={<Calendar size={24} className="text-white"/>} color="bg-purple-500" />
        <StatCard title="Toplam Teşhis" value={patients.reduce((sum, p) => sum + p.diagnosisCount, 0).toString()} icon={<Activity size={24} className="text-white"/>} color="bg-orange-500" />
      </div>

      <UserTable 
        data={patients} 
        columns={columns} 
        title="Hasta Listesi" 
        filterOptions={{ cities }}
      />

      <AddPatientModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAddPatient={onAddPatient}
      />

      <EditPatientModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        onEditPatient={onEditPatient}
        patient={selectedPatient}
      />
    </div>
  );
};

// --- DOCTORS PAGE COMPONENT ---
const DoctorsPage = ({ doctors, hospitals, onAddDoctor, onEditDoctor, onDeleteDoctor }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    return hospital ? hospital.name : 'Atanmamış';
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Aktif': 'bg-green-100 text-green-800',
      'Onay Bekliyor': 'bg-yellow-100 text-yellow-800',
      'Askıya Alındı': 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setShowEditModal(true);
  };

  const handleDelete = (doctorId) => {
    if (window.confirm('Bu doktoru silmek istediğinizden emin misiniz?')) {
      onDeleteDoctor(doctorId);
    }
  };

  const columns = [
    { key: 'name', header: 'Doktor Adı' },
    { key: 'specialty', header: 'Uzmanlık' },
    { key: 'email', header: 'E-posta' },
    { key: 'phone', header: 'Telefon' },
    { key: 'city', header: 'Şehir' },
    { key: 'experience', header: 'Deneyim', render: (doctor) => `${doctor.experience} yıl` },
    { key: 'hospital', header: 'Hastane', render: (doctor) => getHospitalName(doctor.hospitalId) },
    { key: 'status', header: 'Durum', render: (doctor) => getStatusBadge(doctor.status) },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (doctor) => (
        <div className="flex space-x-2">
          <button onClick={() => handleEdit(doctor)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(doctor.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const cities = [...new Set(doctors.map(d => d.city))];
  const specialties = [...new Set(doctors.map(d => d.specialty))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Doktor Yönetimi</h2>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus size={20} />
          <span>Yeni Doktor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Toplam Doktor" value={doctors.length.toString()} icon={<Stethoscope size={24} className="text-white"/>} color="bg-blue-500" />
        <StatCard title="Aktif Doktor" value={doctors.filter(d => d.status === 'Aktif').length.toString()} icon={<CheckCircle size={24} className="text-white"/>} color="bg-green-500" />
        <StatCard title="Onay Bekleyen" value={doctors.filter(d => d.status === 'Onay Bekliyor').length.toString()} icon={<Calendar size={24} className="text-white"/>} color="bg-yellow-500" />
        <StatCard title="Askıya Alınan" value={doctors.filter(d => d.status === 'Askıya Alındı').length.toString()} icon={<XCircle size={24} className="text-white"/>} color="bg-red-500" />
      </div>

      <UserTable 
        data={doctors} 
        columns={columns} 
        title="Doktor Listesi" 
        filterOptions={{ cities, specialties }}
      />

      <AddDoctorModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAddDoctor={onAddDoctor}
        hospitals={hospitals}
      />

      <EditDoctorModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        onEditDoctor={onEditDoctor}
        doctor={selectedDoctor}
        hospitals={hospitals}
      />
    </div>
  );
};

// --- HOSPITALS PAGE COMPONENT ---
const HospitalsPage = ({ hospitals, cities, districts, onAddHospital, onEditHospital, onDeleteHospital, onAddCity, onAddDistrict, loadDistrictsByCity }) => {
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showEditHospitalModal, setShowEditHospitalModal] = useState(false);
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [showAddDistrictModal, setShowAddDistrictModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const getLocationName = (hospital) => {
    if (hospital.districts && hospital.districts.cities) {
      return `${hospital.districts.cities.name} / ${hospital.districts.name}`;
    }
    return 'Bilinmiyor';
  };

  const handleEditHospital = (hospital) => {
    setSelectedHospital(hospital);
    setShowEditHospitalModal(true);
  };

  const handleDeleteHospital = (hospitalId) => {
    if (window.confirm('Bu hastaneyi silmek istediğinizden emin misiniz?')) {
      onDeleteHospital(hospitalId);
    }
  };

  const columns = [
    { key: 'name', header: 'Hastane Adı' },
    { key: 'location', header: 'Konum', render: (hospital) => getLocationName(hospital) },
    { key: 'address', header: 'Adres' },
    { key: 'phone', header: 'Telefon' },
    { key: 'email', header: 'E-posta' },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (hospital) => (
        <div className="flex space-x-2">
          <button onClick={() => handleEditHospital(hospital)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDeleteHospital(hospital.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Hastane & Lokasyon Yönetimi</h2>
        <div className="flex space-x-3">
          <button onClick={() => setShowAddCityModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Plus size={16} />
            <span>Şehir Ekle</span>
          </button>
          <button onClick={() => setShowAddDistrictModal(true)} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2">
            <Plus size={16} />
            <span>İlçe Ekle</span>
          </button>
          <button onClick={() => setShowAddHospitalModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus size={16} />
            <span>Hastane Ekle</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Toplam Hastane" value={hospitals.length.toString()} icon={<Building size={24} className="text-white"/>} color="bg-blue-500" />
        <StatCard title="Toplam Şehir" value={cities.length.toString()} icon={<MapPin size={24} className="text-white"/>} color="bg-green-500" />
        <StatCard title="Toplam İlçe" value={districts.length.toString()} icon={<MapPin size={24} className="text-white"/>} color="bg-yellow-500" />
        <StatCard title="Ortalama Kapasite" value="450" icon={<Users size={24} className="text-white"/>} color="bg-purple-500" />
      </div>

      <UserTable 
        data={hospitals} 
        columns={columns} 
        title="Hastane Listesi" 
      />

      <AddHospitalModal 
        isOpen={showAddHospitalModal} 
        onClose={() => setShowAddHospitalModal(false)} 
        onAddHospital={onAddHospital}
        cities={cities}
        districts={districts}
        loadDistrictsByCity={loadDistrictsByCity}
      />

      <EditHospitalModal 
        isOpen={showEditHospitalModal} 
        onClose={() => setShowEditHospitalModal(false)} 
        onEditHospital={onEditHospital}
        hospital={selectedHospital}
        cities={cities}
        districts={districts}
        loadDistrictsByCity={loadDistrictsByCity}
      />

      <AddCityModal 
        isOpen={showAddCityModal} 
        onClose={() => setShowAddCityModal(false)} 
        onAddCity={onAddCity}
      />

      <AddDistrictModal 
        isOpen={showAddDistrictModal} 
        onClose={() => setShowAddDistrictModal(false)} 
        onAddDistrict={onAddDistrict}
        cities={cities}
      />
    </div>
  );
};

// --- HOSPITAL MODALS ---
const AddHospitalModal = ({ isOpen, onClose, onAddHospital, cities, districts, loadDistrictsByCity }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    district_id: ''
  });
  const [selectedCityId, setSelectedCityId] = useState('');

  const handleCityChange = (cityId) => {
    setSelectedCityId(cityId);
    setFormData(prev => ({ ...prev, district_id: '' }));
    if (cityId) {
      loadDistrictsByCity(cityId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.district_id) {
      onAddHospital({
        ...formData,
        district_id: parseInt(formData.district_id)
      });
      setFormData({ name: '', address: '', phone: '', email: '', district_id: '' });
      setSelectedCityId('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Yeni Hastane Ekle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hastane Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
            <select
              value={selectedCityId}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Şehir Seçin</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
            <select
              value={formData.district_id}
              onChange={(e) => setFormData(prev => ({ ...prev, district_id: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!selectedCityId}
            >
              <option value="">İlçe Seçin</option>
              {districts.map(district => (
                <option key={district.id} value={district.id}>{district.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              İptal
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditHospitalModal = ({ isOpen, onClose, onEditHospital, hospital, cities, districts, loadDistrictsByCity }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    district_id: ''
  });
  const [selectedCityId, setSelectedCityId] = useState('');

  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name || '',
        address: hospital.address || '',
        phone: hospital.phone || '',
        email: hospital.email || '',
        district_id: hospital.district_id || ''
      });
      if (hospital.districts && hospital.districts.city_id) {
        setSelectedCityId(hospital.districts.city_id);
        loadDistrictsByCity(hospital.districts.city_id);
      }
    }
  }, [hospital, loadDistrictsByCity]);

  const handleCityChange = (cityId) => {
    setSelectedCityId(cityId);
    setFormData(prev => ({ ...prev, district_id: '' }));
    if (cityId) {
      loadDistrictsByCity(cityId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.district_id && hospital) {
      onEditHospital({
        ...hospital,
        ...formData,
        district_id: parseInt(formData.district_id)
      });
      onClose();
    }
  };

  if (!isOpen || !hospital) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Hastane Düzenle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hastane Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
            <select
              value={selectedCityId}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Şehir Seçin</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
            <select
              value={formData.district_id}
              onChange={(e) => setFormData(prev => ({ ...prev, district_id: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!selectedCityId}
            >
              <option value="">İlçe Seçin</option>
              {districts.map(district => (
                <option key={district.id} value={district.id}>{district.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              İptal
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddCityModal = ({ isOpen, onClose, onAddCity }) => {
  const [cityName, setCityName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cityName.trim()) {
      onAddCity({ name: cityName.trim() });
      setCityName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Yeni Şehir Ekle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şehir Adı</label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: İstanbul"
              required
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              İptal
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};






};





const AddDistrictModal = ({ isOpen, onClose, onAddDistrict, cities }) => {
  const [formData, setFormData] = useState({
    name: '',
    city_id: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.city_id) {
      onAddDistrict({
        name: formData.name.trim(),
        city_id: parseInt(formData.city_id)
      });
      setFormData({ name: '', city_id: '' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Yeni İlçe Ekle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
            <select
              value={formData.city_id}
              onChange={(e) => setFormData(prev => ({ ...prev, city_id: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Şehir Seçin</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İlçe Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Kadıköy"
              required
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              İptal
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PlaceholderPage = ({ title }) => (
  <div className="bg-white p-10 rounded-xl shadow-md text-center">
    <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
    <p className="text-gray-500 mt-2">Bu bölüm geliştirme aşamasındadır.</p>
  </div>
);

// --- MAIN ADMIN PANEL COMPONENT ---
export default function AdminPanelApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Verileri yükle
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDoctors(),
        loadHospitals(),
        loadPatients(),
        loadCities()
      ]);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors`);
      const result = await response.json();
      if (result.success) {
        setDoctors(result.data);
      } else {
        // Fallback to mock data if API fails
        setDoctors(initialDoctorData);
      }
    } catch (error) {
      console.error('Doktor verisi yüklenemedi:', error);
      // Fallback to mock data
      setDoctors(initialDoctorData);
    }
  };

  const loadHospitals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/hospitals`);
      const result = await response.json();
      if (result.success) {
        setHospitals(result.data);
      } else {
        // Fallback to mock data if API fails
        setHospitals(initialHospitalData);
      }
    } catch (error) {
      console.error('Hastane verisi yüklenemedi:', error);
      // Fallback to mock data
      setHospitals(initialHospitalData);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`);
      const result = await response.json();
      if (result.success) {
        setPatients(result.data);
      } else {
        // Fallback to mock data if API fails
        setPatients(patientData);
      }
    } catch (error) {
      console.error('Hasta verisi yüklenemedi:', error);
      // Fallback to mock data
      setPatients(patientData);
    }
  };

  const loadCities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/cities`);
      const result = await response.json();
      if (result.success) {
        setCities(result.data);
      }
    } catch (error) {
      console.error('Şehir verisi yüklenemedi:', error);
    }
  };

  const loadDistrictsByCity = async (cityId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/cities/${cityId}/districts`);
      const result = await response.json();
      if (result.success) {
        setDistricts(result.data);
      }
    } catch (error) {
      console.error('İlçe verisi yüklenemedi:', error);
    }
  };
  
  // Doctor management functions
  const handleAddDoctor = async (newDoctor) => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDoctor),
      });
      const result = await response.json();
      if (result.success) {
        setDoctors(prev => [...prev, result.data]);
      }
    } catch (error) {
      console.error('Doktor eklenemedi:', error);
      // Fallback to local state update
      setDoctors(prev => [...prev, { ...newDoctor, id: Date.now() }]);
    }
  };

  const handleEditDoctor = async (updatedDoctor) => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${updatedDoctor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDoctor),
      });
      const result = await response.json();
      if (result.success) {
        setDoctors(prev => prev.map(doctor => 
          doctor.id === updatedDoctor.id ? result.data : doctor
        ));
      }
    } catch (error) {
      console.error('Doktor güncellenemedi:', error);
      // Fallback to local state update
      setDoctors(prev => prev.map(doctor => 
        doctor.id === updatedDoctor.id ? updatedDoctor : doctor
      ));
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
      }
    } catch (error) {
      console.error('Doktor silinemedi:', error);
      // Fallback to local state update
      setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
    }
  };

  // Patient management functions
  const handleAddPatient = async (newPatient) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPatient),
      });
      const result = await response.json();
      if (result.success) {
        setPatients(prev => [...prev, result.data]);
      }
    } catch (error) {
      console.error('Hasta eklenemedi:', error);
      // Fallback to local state update
      setPatients(prev => [...prev, { ...newPatient, id: Date.now() }]);
    }
  };

  const handleEditPatient = async (updatedPatient) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${updatedPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPatient),
      });
      const result = await response.json();
      if (result.success) {
        setPatients(prev => prev.map(patient => 
          patient.id === updatedPatient.id ? result.data : patient
        ));
      }
    } catch (error) {
      console.error('Hasta güncellenemedi:', error);
      // Fallback to local state update
      setPatients(prev => prev.map(patient => 
        patient.id === updatedPatient.id ? updatedPatient : patient
      ));
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setPatients(prev => prev.filter(patient => patient.id !== patientId));
      }
    } catch (error) {
      console.error('Hasta silinemedi:', error);
      // Fallback to local state update
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
    }
  };

  // Hospital management functions
  const handleAddHospital = async (newHospital) => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/hospitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHospital),
      });
      const result = await response.json();
      if (result.success) {
        setHospitals(prev => [...prev, result.data]);
      }
    } catch (error) {
      console.error('Hastane eklenemedi:', error);
    }
  };

  const handleEditHospital = async (updatedHospital) => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/hospitals/${updatedHospital.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedHospital),
      });
      const result = await response.json();
      if (result.success) {
        setHospitals(prev => prev.map(hospital => 
          hospital.id === updatedHospital.id ? result.data : hospital
        ));
      }
    } catch (error) {
      console.error('Hastane güncellenemedi:', error);
    }
  };

  const handleDeleteHospital = async (hospitalId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/hospitals/${hospitalId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setHospitals(prev => prev.filter(hospital => hospital.id !== hospitalId));
      }
    } catch (error) {
      console.error('Hastane silinemedi:', error);
    }
  };

  // City management functions
  const handleAddCity = async (newCity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCity),
      });
      const result = await response.json();
      if (result.success) {
        setCities(prev => [...prev, result.data]);
      }
    } catch (error) {
      console.error('Şehir eklenemedi:', error);
    }
  };

  const handleAddDistrict = async (newDistrict) => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/districts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDistrict),
      });
      const result = await response.json();
      if (result.success) {
        setDistricts(prev => [...prev, result.data]);
      }
    } catch (error) {
      console.error('İlçe eklenemedi:', error);
    }
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'doctors':
        return (
          <DoctorsPage 
            doctors={doctors}
            hospitals={hospitals}
            onAddDoctor={handleAddDoctor}
            onEditDoctor={handleEditDoctor}
            onDeleteDoctor={handleDeleteDoctor}
          />
        );
      case 'patients':
        return (
          <PatientsPage 
            patients={patients}
            onAddPatient={handleAddPatient}
            onEditPatient={handleEditPatient}
            onDeletePatient={handleDeletePatient}
          />
        );
      case 'hospitals':
        return (
          <HospitalsPage 
            hospitals={hospitals}
            cities={cities}
            districts={districts}
            onAddHospital={handleAddHospital}
            onEditHospital={handleEditHospital}
            onDeleteHospital={handleDeleteHospital}
            onAddCity={handleAddCity}
            onAddDistrict={handleAddDistrict}
            loadDistrictsByCity={loadDistrictsByCity}
          />
        );
      case 'regions':
        return <PlaceholderPage title="Bölge Yönetimi" />;
      case 'diagnosis':
        return <PlaceholderPage title="Teşhis Analizi" />;
      case 'map':
        return <PlaceholderPage title="Harita Analizi" />;
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