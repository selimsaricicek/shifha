import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Search, Bell, ChevronDown, Users, Stethoscope, BarChart2, Settings, LogOut, Activity, Cpu, Shield, MapPin, CheckCircle, XCircle, Building, ArrowRightLeft, Plus, Edit, Trash2, Calendar, TrendingUp, AlertTriangle, UserPlus, X, Heart, Clock, Zap, Phone, AlertCircle, User, FileText, Eye, Lock, Upload, Download, Mail, Camera, Save, Globe, Palette, Monitor, Smartphone, Database, Key, Briefcase, RefreshCw } from 'lucide-react';
import { uploadPdfAndParsePatient } from '../api/patientService';
import { getAdminProfile, getDashboardStats, getNotifications } from '../services/adminService';
import { getAllDoctors, addDoctor, updateDoctor, deleteDoctor } from '../services/doctorService';
import { getAllPatients, addPatient, updatePatient, deletePatient } from '../services/patientService';
import { getAllDepartments, addDepartment, updateDepartment, deleteDepartment } from '../services/departmentService';
import { getAllCities, getDistrictsByCity, getAllHospitals, addHospital, updateHospital, deleteHospital } from '../services/locationService';
import InteractiveMap from '../components/InteractiveMap';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// API Base URL
const API_BASE_URL = 'http://localhost:3001/api';

// --- MOCK DATA ---
const initialHospitalData = [
    { id: 201, name: 'Tokat Devlet Hastanesi', city: 'Tokat', district: 'Merkez', departments: ['Dahiliye', 'Pediatri', 'Göz Hastalıkları'], doctorCount: 45, bedCount: 200, region: 'Karadeniz' },
    { id: 202, name: 'İstanbul Çam ve Sakura Şehir Hastanesi', city: 'İstanbul', district: 'Başakşehir', departments: ['Kardiyoloji', 'Nöroloji', 'Dahiliye', 'Genel Cerrahi'], doctorCount: 320, bedCount: 2500, region: 'Marmara' },
    { id: 203, name: 'Ankara Şehir Hastanesi', city: 'Ankara', district: 'Çankaya', departments: ['Kardiyoloji', 'Nöroloji', 'Pediatri'], doctorCount: 280, bedCount: 1800, region: 'İç Anadolu' },
    { id: 204, name: 'İzmir Tepecik Egitim ve Araştırma Hastanesi', city: 'İzmir', district: 'Konak', departments: ['Nöroloji', 'Pediatri', 'Göz Hastalıkları'], doctorCount: 150, bedCount: 800, region: 'Ege' },
    { id: 205, name: 'Bursa Şehir Hastanesi', city: 'Bursa', district: 'Nilüfer', departments: ['Dahiliye', 'Kardiyoloji'], doctorCount: 120, bedCount: 600, region: 'Marmara' },
    { id: 206, name: 'Antalya Egitim ve Araştırma Hastanesi', city: 'Antalya', district: 'Muratpaşa', departments: ['Dahiliye', 'Kardiyoloji', 'Göz Hastalıkları'], doctorCount: 95, bedCount: 450, region: 'Akdeniz' }
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
  { id: 101, name: 'Ahmet Çelik', full_name: 'Ahmet Çelik', tckn: '12345678901', tc_kimlik_no: '12345678901', email: 'ahmet.celik@email.com', phone: '0532 123 45 67', status: 'Aktif', city: 'İstanbul', lastVisit: '2024-01-15', last_visit: '2024-01-15', diagnosisCount: 3 },
  { id: 102, name: 'Fatma Şahin', full_name: 'Fatma Şahin', tckn: '23456789012', tc_kimlik_no: '23456789012', email: 'fatma.sahin@email.com', phone: '0533 234 56 78', status: 'Aktif', city: 'Ankara', lastVisit: '2024-01-10', last_visit: '2024-01-10', diagnosisCount: 1 },
  { id: 103, name: 'Mehmet Yılmaz', full_name: 'Mehmet Yılmaz', tckn: '34567890123', tc_kimlik_no: '34567890123', email: 'mehmet.yilmaz@email.com', phone: '0534 345 67 89', status: 'Aktif', city: 'İzmir', lastVisit: '2024-01-12', last_visit: '2024-01-12', diagnosisCount: 5 },
  { id: 104, name: 'Ayşe Demir', full_name: 'Ayşe Demir', tckn: '45678901234', tc_kimlik_no: '45678901234', email: 'ayse.demir@email.com', phone: '0535 456 78 90', status: 'Aktif', city: 'Bursa', lastVisit: '2024-01-08', last_visit: '2024-01-08', diagnosisCount: 2 },
  { id: 105, name: 'Mustafa Kaya', full_name: 'Mustafa Kaya', tckn: '56789012345', tc_kimlik_no: '56789012345', email: 'mustafa.kaya@email.com', phone: '0536 567 89 01', status: 'Pasif', city: 'Antalya', lastVisit: '2024-01-05', last_visit: '2024-01-05', diagnosisCount: 4 },
  { id: 106, name: 'Zeynep Özkan', full_name: 'Zeynep Özkan', tckn: '67890123456', tc_kimlik_no: '67890123456', email: 'zeynep.ozkan@email.com', phone: '0537 678 90 12', status: 'Aktif', city: 'Adana', lastVisit: '2024-01-20', last_visit: '2024-01-20', diagnosisCount: 1 },
  { id: 107, name: 'Ali Yıldız', full_name: 'Ali Yıldız', tckn: '78901234567', tc_kimlik_no: '78901234567', email: 'ali.yildiz@email.com', phone: '0538 789 01 23', status: 'Aktif', city: 'Konya', lastVisit: '2024-01-18', last_visit: '2024-01-18', diagnosisCount: 3 },
  { id: 108, name: 'Elif Arslan', full_name: 'Elif Arslan', tckn: '89012345678', tc_kimlik_no: '89012345678', email: 'elif.arslan@email.com', phone: '0539 890 12 34', status: 'Aktif', city: 'Gaziantep', lastVisit: '2024-01-22', last_visit: '2024-01-22', diagnosisCount: 2 },
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
  { name: 'Diger', value: 5, color: '#8dd1e1' }
];

const regionData = [
  { region: 'Marmara', hospitals: 45, doctors: 1250, patients: 25000 },
  { region: 'Ege', hospitals: 32, doctors: 890, patients: 18000 },
  { region: 'Akdeniz', hospitals: 28, doctors: 720, patients: 15000 },
  { region: 'İç Anadolu', hospitals: 35, doctors: 980, patients: 20000 },
  { region: 'Karadeniz', hospitals: 25, doctors: 650, patients: 12000 },
  { region: 'Dogu Anadolu', hospitals: 18, doctors: 420, patients: 8000 },
  { region: 'Güneydogu Anadolu', hospitals: 22, doctors: 580, patients: 11000 }
];

const recentActivities = [
  { icon: <Stethoscope size={18} />, text: 'Dr. Aylin Yılmaz yeni bir hasta kaydetti.', time: '5 dakika önce' }, 
  { icon: <Cpu size={18} className="text-purple-500" />, text: 'AI, 12345... TCKN\'li hasta için yüksek riskli diyabet uyarısı oluşturdu.', time: '25 dakika önce' }, 
  { icon: <Users size={18} />, text: 'Dr. Elif Kaya\'nın hesabı onaya gönderildi.', time: '1 saat önce' }, 
  { icon: <Activity size={18} className="text-red-500" />, text: 'Sistem, anormal kan degeri tespit etti.', time: '3 saat önce' },
  { icon: <Building size={18} className="text-blue-500" />, text: 'Antalya Egitim ve Araştırma Hastanesi sisteme eklendi.', time: '2 saat önce' },
  { icon: <UserPlus size={18} className="text-green-500" />, text: 'Dr. Sema Güler Antalya hastanesine atandı.', time: '4 saat önce' },
];

const bloodTestReferenceRanges = {
  // Hemogram
  hemoglobin: { min: 12.0, max: 16.0, unit: 'g/dL' },
  hematokrit: { min: 36.0, max: 46.0, unit: '%' },
  eritrosit: { min: 4.2, max: 5.4, unit: 'milyon/μL' },
  lökosit: { min: 4.5, max: 11.0, unit: 'bin/μL' },
  trombosit: { min: 150, max: 450, unit: 'bin/μL' },
  mcv: { min: 80, max: 100, unit: 'fL' },
  mch: { min: 27, max: 32, unit: 'pg' },
  mchc: { min: 32, max: 36, unit: 'g/dL' },
  rdw: { min: 11.5, max: 14.5, unit: '%' },
  
  // Biyokimya - Karaciğer Fonksiyonları
  alanin_aminotransferaz: { min: 7, max: 56, unit: 'U/L' },
  aspartat_aminotransferaz: { min: 10, max: 40, unit: 'U/L' },
  alkalen_fosfataz: { min: 44, max: 147, unit: 'U/L' },
  gama_glutamil: { min: 9, max: 48, unit: 'U/L' },
  total_bilirubin: { min: 0.3, max: 1.2, unit: 'mg/dL' },
  
  // Biyokimya - Böbrek Fonksiyonları
  kan_üre_azotu: { min: 7, max: 20, unit: 'mg/dL' },
  kreatinin: { min: 0.7, max: 1.3, unit: 'mg/dL' },
  tahmini_glomerüler: { min: 90, max: 120, unit: 'mL/dk/1.73m²' },
  
  // Biyokimya - Genel
  glukoz: { min: 70, max: 100, unit: 'mg/dL' },
  üre: { min: 17, max: 43, unit: 'mg/dL' },
  ürik_asit: { min: 3.5, max: 7.2, unit: 'mg/dL' },
  
  // Lipid Profili
  total_kolesterol: { min: 0, max: 200, unit: 'mg/dL' },
  ldl_kolesterol: { min: 0, max: 100, unit: 'mg/dL' },
  hdl_kolesterol: { min: 40, max: 60, unit: 'mg/dL' },
  trigliserit: { min: 0, max: 150, unit: 'mg/dL' },
  
  // Elektrolit Paneli
  sodyum: { min: 135, max: 145, unit: 'mEq/L' },
  potasyum: { min: 3.5, max: 5.1, unit: 'mEq/L' },
  klor: { min: 98, max: 107, unit: 'mEq/L' },
  bikarbonat: { min: 22, max: 29, unit: 'mEq/L' },
  kalsiyum: { min: 8.5, max: 10.5, unit: 'mg/dL' },
  fosfor: { min: 2.5, max: 4.5, unit: 'mg/dL' },
  magnezyum: { min: 1.7, max: 2.2, unit: 'mg/dL' },
  
  // Protein
  total_protein: { min: 6.3, max: 8.2, unit: 'g/dL' },
  albumin: { min: 3.5, max: 5.2, unit: 'g/dL' },
  
  // Tiroid
  tsh: { min: 0.27, max: 4.2, unit: 'μIU/mL' },
  t3: { min: 2.0, max: 4.4, unit: 'pg/mL' },
  t4: { min: 0.93, max: 1.7, unit: 'ng/dL' },
  
  // Vitamin
  vitamin_b12: { min: 197, max: 771, unit: 'pg/mL' },
  vitamin_d: { min: 20, max: 50, unit: 'ng/mL' },
  folik_asit: { min: 3.1, max: 17.5, unit: 'ng/mL' },
  
  // İnflamasyon
  crp: { min: 0, max: 3.0, unit: 'mg/L' },
  sedimentasyon: { min: 0, max: 20, unit: 'mm/h' },
  
  // Demir
  demir: { min: 60, max: 170, unit: 'μg/dL' },
  tibc: { min: 250, max: 450, unit: 'μg/dL' },
  ferritin: { min: 15, max: 150, unit: 'ng/mL' },
  
  // Hormon
  insulin: { min: 2.6, max: 24.9, unit: 'μIU/mL' },
  hba1c: { min: 4.0, max: 6.0, unit: '%' },
  
  // Kardiyak
  troponin_i: { min: 0, max: 0.04, unit: 'ng/mL' },
  ck_mb: { min: 0, max: 25, unit: 'ng/mL' },
  
  // İdrar
  idrar_protein: { min: 0, max: 150, unit: 'mg/24h' },
  idrar_glukoz: { min: 0, max: 15, unit: 'mg/dL' },
  idrar_keton: { min: 0, max: 0, unit: 'mg/dL' },
  idrar_lökosit: { min: 0, max: 5, unit: '/hpf' },
  idrar_eritrosit: { min: 0, max: 3, unit: '/hpf' }
};



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

  // Debug: Gelen veriyi kontrol et
  console.log(`UserTable (${title}) - Gelen veri:`, data);
  console.log(`UserTable (${title}) - Veri sayısı:`, data?.length);
  console.log(`UserTable (${title}) - Veri tipi:`, typeof data);
  console.log(`UserTable (${title}) - Array mi:`, Array.isArray(data));

  // Veri kontrolü - eger data yoksa veya array degilse boş array kullan
  const safeData = Array.isArray(data) ? data : [];

  const filteredData = safeData.filter(item => {
    const searchMatch = Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const cityMatch = cityFilter === 'all' || item.city === cityFilter;
    const specialtyMatch = specialtyFilter === 'all' || 
      (item.specialty && item.specialty === specialtyFilter) ||
      (item.specialization && item.specialization === specialtyFilter);
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
            {filteredData.length > 0 ? (
              filteredData.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  {columns.map(col => (
                    <td key={col.key} className="p-4 text-gray-700 text-sm align-middle">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                  {data?.length === 0 ? 'Henüz veri bulunmuyor.' : 'Arama kriterlerinize uygun sonuç bulunamadı.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- PROFILE PAGE COMPONENT ---
const ProfilePage = ({ adminUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: adminUser?.full_name || 'Admin User',
    email: adminUser?.email || 'admin@shifha.com',
    phone: adminUser?.phone || '+90 555 123 4567',
    role: adminUser?.role || 'Sistem Yöneticisi',
    department: adminUser?.department || 'Bilgi İşlem',
    bio: adminUser?.bio || 'Shifha Sağlık Platformu sistem yöneticisi olarak görev yapmaktayım. Sağlık teknolojileri alanında 5+ yıllık deneyimimle, platformun güvenliğini ve verimliliğini sağlamaktayım.',
    location: adminUser?.location || 'İstanbul, Türkiye',
    joinDate: adminUser?.joinDate || '2024-01-15',
    specialization: adminUser?.specialization || 'Sistem Güvenliği',
    experience: adminUser?.experience || '5+ Yıl',
    status: adminUser?.status || 'Aktif'
  });

  const [activeTab, setActiveTab] = useState('personal');

  const handleSave = () => {
    console.log('Profil güncellendi:', profileData);
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Yeni profil fotoğrafı yüklendi:', file.name);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`bg-white rounded-lg p-4 border-l-4 ${color}`}>
      <div className="flex items-center">
        <Icon className="w-8 h-8 text-gray-400" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Yönetimi</h1>
            <p className="text-sm text-gray-600 mt-1">Admin hesap bilgilerinizi yönetin</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isEditing 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? <Save size={18} /> : <Edit size={18} />}
            <span>{isEditing ? 'Kaydet' : 'Düzenle'}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Toplam Giriş" value="1,247" icon={Calendar} color="border-blue-500" />
        <StatCard title="Son Aktivite" value="5 dk" icon={Clock} color="border-green-500" />
        <StatCard title="Görevler" value="12/15" icon={CheckCircle} color="border-purple-500" />
        <StatCard title="Başarı Oranı" value="%98" icon={TrendingUp} color="border-orange-500" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
            <div className="relative px-6 pb-6">
              <div className="flex flex-col items-center">
                <div className="relative -mt-16 mb-4">
                  <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {profileData.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        id="profile-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <label
                        htmlFor="profile-upload"
                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <Camera size={16} className="text-gray-600" />
                      </label>
                    </>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-gray-900">{profileData.full_name}</h2>
                <p className="text-sm text-gray-600">{profileData.role}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                  profileData.status === 'Aktif' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profileData.status}
                </span>
              </div>

              <div className="mt-6 border-t pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">İletişim Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{profileData.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{profileData.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{profileData.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">Katılım: {new Date(profileData.joinDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Hızlı İşlemler</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                Şifre Değiştir
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                Güvenlik Ayarları
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                Bildirim Tercihleri
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'personal', label: 'Kişisel Bilgiler', icon: User },
                  { id: 'professional', label: 'Profesyonel', icon: Briefcase },
                  { id: 'security', label: 'Güvenlik', icon: Shield }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{profileData.full_name}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">E-posta Adresi</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{profileData.email}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefon Numarası</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{profileData.phone}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Konum</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{profileData.location}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hakkımda</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{profileData.bio}</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'professional' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Departman</label>
                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{profileData.department}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Uzmanlık Alanı</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.specialization}
                          onChange={(e) => setProfileData(prev => ({ ...prev, specialization: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{profileData.specialization}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deneyim</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.experience}
                          onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{profileData.experience}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{profileData.role}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Güvenlik Uyarısı</h3>
                        <p className="text-sm text-yellow-700 mt-1">Son girişiniz: 2 saat önce - İstanbul, Türkiye</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-gray-900">İki Faktörlü Kimlik Doğrulama</p>
                        <p className="text-sm text-gray-600">Hesabınızı daha güvenli hale getirin</p>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Etkinleştir
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Şifre Değiştir</p>
                        <p className="text-sm text-gray-600">Son değiştirme: 90 gün önce</p>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Değiştir
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Değişiklikleri Kaydet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SETTINGS PAGE COMPONENT ---
const SettingsPage = () => {
  const [settings, setSettings] = useState({
    // Genel Ayarlar
    language: 'tr',
    timezone: 'Europe/Istanbul',
    dateFormat: 'dd/mm/yyyy',
    
    // Bildirim Ayarları
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    
    // Güvenlik Ayarları
    twoFactorAuth: false,
    sessionTimeout: 30,
    
    // Görünüm Ayarları
    theme: 'light',
    sidebarCollapsed: false,
    
    // Sistem Ayarları
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log('Ayarlar kaydedildi:', settings);
    // Burada ayarları kaydetme API çağrısı yapılabilir
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Sistem Ayarları</h1>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={20} />
          <span>Kaydet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genel Ayarlar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Genel Ayarlar</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dil</label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Saat Dilimi</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                <option value="Europe/London">Londra (UTC+0)</option>
                <option value="America/New_York">New York (UTC-5)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarih Formatı</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Bildirim Ayarları</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">E-posta Bildirimleri</h3>
                <p className="text-sm text-gray-600">Sistem güncellemeleri ve önemli bildirimler</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Push Bildirimleri</h3>
                <p className="text-sm text-gray-600">Tarayıcı bildirimleri</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">SMS Bildirimleri</h3>
                <p className="text-sm text-gray-600">Acil durum bildirimleri</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Güvenlik Ayarları */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Key className="text-red-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Güvenlik Ayarları</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">İki Faktörlü Doğrulama</h3>
                <p className="text-sm text-gray-600">Hesap güvenliği için ek koruma</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Oturum Zaman Aşımı (dakika)</label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 dakika</option>
                <option value={30}>30 dakika</option>
                <option value={60}>1 saat</option>
                <option value={120}>2 saat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Görünüm Ayarları */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Görünüm Ayarları</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSettingChange('theme', 'light')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    settings.theme === 'light' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Monitor size={20} className="mx-auto mb-1" />
                  <span className="text-sm">Açık</span>
                </button>
                <button
                  onClick={() => handleSettingChange('theme', 'dark')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    settings.theme === 'dark' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Smartphone size={20} className="mx-auto mb-1" />
                  <span className="text-sm">Koyu</span>
                </button>
                <button
                  onClick={() => handleSettingChange('theme', 'auto')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    settings.theme === 'auto' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Globe size={20} className="mx-auto mb-1" />
                  <span className="text-sm">Otomatik</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Kenar Çubuğu Daraltılmış</h3>
                <p className="text-sm text-gray-600">Daha fazla alan için kenar çubuğunu daralt</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sidebarCollapsed}
                  onChange={(e) => handleSettingChange('sidebarCollapsed', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Sistem Ayarları */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="text-orange-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Sistem Ayarları</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Otomatik Yedekleme</h3>
                <p className="text-sm text-gray-600">Sistem verilerini otomatik yedekle</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yedekleme Sıklığı</label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!settings.autoBackup}
              >
                <option value="hourly">Saatlik</option>
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Veri Saklama Süresi (gün)</label>
              <input
                type="number"
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                min="30"
                max="3650"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Ana Panel', icon: <BarChart2 size={20} /> },
    { id: 'doctors', label: 'Doktorlar', icon: <Stethoscope size={20} /> },
    { id: 'patients', label: 'Hastalar', icon: <Users size={20} /> },
    { id: 'hospitals', label: 'Hastaneler', icon: <Building size={20} /> },
    { id: 'regions', label: 'Bölge Yönetimi', icon: <MapPin size={20} /> },
    { id: 'diagnosis', label: 'Teşhis Analizi', icon: <TrendingUp size={20} /> },
    { id: 'map', label: 'Harita Analizi', icon: <MapPin size={20} /> },
    { id: 'ai-module', label: 'Yapay Zeka', icon: <Cpu size={20} /> },
    { id: 'profile', label: 'Profilim', icon: <User size={20} /> },
    { id: 'settings', label: 'Ayarlar', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white flex-shrink-0 p-4 flex flex-col shadow-lg">
      <div 
        className="flex items-center justify-center p-4 mb-6 border-b cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onLogout}
        title="Çıkış Yap"
      >
        <img 
          src="/logo-text.png" 
          alt="Shifha text" 
          className="h-12 w-auto"
        />
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
        <div 
          onClick={onLogout}
          className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Çıkış Yap</span>
        </div>
      </div>
    </aside>
  );
};

const Header = ({ searchTerm, setSearchTerm, onSearch, adminUser, notifications = [], searchResults = [], onLogout, setCurrentPage }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
    setShowSearchResults(value.length > 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'doctor': return <Stethoscope size={16} className="text-blue-500" />;
      case 'patient': return <User size={16} className="text-green-500" />;
      case 'hospital': return <Building size={16} className="text-purple-500" />;
      default: return <Search size={16} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'doctor': return 'Doktor';
      case 'patient': return 'Hasta';
      case 'hospital': return 'Hastane';
      default: return '';
    }
  };

  return (
    <header className="bg-white p-4 flex justify-between items-center shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Türkiye Geneli Yönetim Paneli</h2>
      <div className="flex items-center space-x-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Hasta veya Doktor Ara..." 
            value={searchTerm || ''}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-64 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </form>
        
        <div className="relative">
          <Bell 
            size={24} 
            className="text-gray-500 cursor-pointer hover:text-blue-600" 
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {notifications.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.length}
            </span>
          )}
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800">Bildirimler</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div key={index} className="p-3 border-b hover:bg-gray-50">
                      <p className="text-sm text-gray-700">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Yeni bildirim yok
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <img 
              src={adminUser?.avatar || `https://placehold.co/40x40/E2E8F0/4A5568?text=${adminUser?.name?.charAt(0) || 'A'}`} 
              alt="Admin" 
              className="w-10 h-10 rounded-full" 
            />
            <div>
              <p className="font-semibold text-gray-800">{adminUser?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{adminUser?.role || 'Sistem Yöneticisi'}</p>
            </div>
            <ChevronDown size={20} className="text-gray-500" />
          </div>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <div className="p-2">
                <button 
                  onClick={() => {
                    setCurrentPage('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <User size={16} />
                  <span>Profilim</span>
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <Settings size={16} />
                  <span>Hesap Ayarları</span>
                </button>
                <hr className="my-1" />
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// --- PAGES ---
const Dashboard = ({ dashboardStats, doctors, patients, hospitals }) => {
  // Hastane bazlı hasta/doktor oranlarını hesapla
  const getHospitalBasedData = () => {
    if (!hospitals || !doctors || !patients) return [];
    
    return hospitals.map(hospital => {
      const hospitalDoctors = doctors.filter(d => d.hospitalId === hospital.id);
      const hospitalPatients = patients.filter(p => {
        // Hastanın son ziyaret ettigi hastaneyi bul (basit bir yaklaşım)
        return p.city === hospital.city;
      });
      
      return {
        name: hospital.name.length > 15 ? hospital.name.substring(0, 15) + '...' : hospital.name,
        fullName: hospital.name,
        doctors: hospitalDoctors.length,
        patients: hospitalPatients.length,
        ratio: hospitalDoctors.length > 0 ? (hospitalPatients.length / hospitalDoctors.length).toFixed(1) : 0
      };
    }).sort((a, b) => b.patients - a.patients).slice(0, 8); // En çok hastası olan 8 hastane
  };

  const hospitalData = getHospitalBasedData();

  return (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Toplam Doktor" value={dashboardStats?.totalDoctors?.toLocaleString() || doctors?.length?.toLocaleString() || "0"} icon={<Stethoscope size={24} className="text-white"/>} color="bg-blue-500" />
      <StatCard title="Toplam Hasta" value={dashboardStats?.totalPatients?.toLocaleString() || patients?.length?.toLocaleString() || "0"} icon={<Users size={24} className="text-white"/>} color="bg-green-500" />
      <StatCard title="Toplam Hastane" value={dashboardStats?.totalOrganizations?.toLocaleString() || hospitals?.length?.toLocaleString() || "0"} icon={<Building size={24} className="text-white"/>} color="bg-purple-500" />
      <StatCard title="Toplam Randevu" value={dashboardStats?.totalAppointments?.toLocaleString() || "0"} icon={<Calendar size={24} className="text-white"/>} color="bg-red-500" />
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
        <h3 className="text-xl font-bold text-gray-800 mb-4">Teşhis Dagılımı</h3>
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
        <h3 className="text-xl font-bold text-gray-800 mb-4">Hastane Bazlı Hasta/Doktor Dagılımı</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hospitalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 10}} angle={-45} textAnchor="end" height={80} />
            <YAxis tick={{fill: '#6b7280'}}/>
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '0.5rem' }}
              formatter={(value, name, props) => {
                if (name === 'ratio') return [`${value} hasta/doktor`, 'Oran'];
                return [value, name === 'doctors' ? 'Doktor' : 'Hasta'];
              }}
              labelFormatter={(label) => {
                const hospital = hospitalData.find(h => h.name === label);
                return hospital ? hospital.fullName : label;
              }}
            />
            <Legend />
            <Bar dataKey="doctors" fill="#3b82f6" name="Doktor Sayısı"/>
            <Bar dataKey="patients" fill="#10b981" name="Hasta Sayısı"/>
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
};

// --- MODALS ---
const AddDoctorModal = ({ isOpen, onClose, onAddDoctor, hospitals, departments }) => {
  const [formData, setFormData] = useState({
    full_name: '', tc_kimlik_no: '', specialization: '', email: '', phone: '', hospital_id: '', department: '', years_of_experience: ''
  });

  const specialties = ['Kardiyoloji', 'Nöroloji', 'Pediatri', 'Dahiliye', 'Göz Hastalıkları', 'Genel Cerrahi', 'Ortopedi', 'Üroloji', 'Kadın Dogum', 'Kulak Burun Bogaz'];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // TC kimlik numarası validasyonu
    if (formData.tc_kimlik_no.length !== 11) {
      alert('TC Kimlik numarası 11 haneli olmalıdır.');
      return;
    }

    // Telefon numarası validasyonu
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      alert('Telefon numarası 10 veya 11 haneli olmalıdır.');
      return;
    }

    const newDoctor = {
      full_name: formData.full_name,
      tc_kimlik_no: formData.tc_kimlik_no,
      email: formData.email,
      phone: formData.phone,
      specialization: formData.specialization,
      hospital_id: formData.hospital_id ? parseInt(formData.hospital_id) : null,
      department: formData.department || null,
      years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
      is_active: true
    };
    onAddDoctor(newDoctor);
    setFormData({ full_name: '', tc_kimlik_no: '', specialization: '', email: '', phone: '', hospital_id: '', department: '', years_of_experience: '' });
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
          <input type="text" placeholder="Doktor Adı" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="TC Kimlik No" value={formData.tc_kimlik_no} onChange={(e) => setFormData({...formData, tc_kimlik_no: e.target.value.replace(/\D/g, '')})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required maxLength="11" />
          <select value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Uzmanlık Seçin</option>
            {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
          </select>
          <input type="email" placeholder="E-posta" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="tel" placeholder="Telefon (5xxxxxxxxx)" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required maxLength="11" />
          <input type="number" placeholder="Deneyim (Yıl)" value={formData.years_of_experience} onChange={(e) => setFormData({...formData, years_of_experience: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" max="50" />
          <select value={formData.hospital_id} onChange={(e) => setFormData({...formData, hospital_id: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Hastane Seçin (Opsiyonel)</option>
            {hospitals.map(hospital => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
          </select>
          <input type="text" placeholder="Departman" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex space-x-3">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">Ekle</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors">İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditDoctorModal = ({ isOpen, onClose, onEditDoctor, doctor, hospitals, departments }) => {
  const [formData, setFormData] = useState({
    name: '', tc_kimlik_no: '', specialty: '', email: '', phone: '', hospitalId: '', department: '', years_of_experience: '', status: '', role: ''
  });

  const specialties = ['Kardiyoloji', 'Nöroloji', 'Pediatri', 'Dahiliye', 'Göz Hastalıkları', 'Genel Cerrahi', 'Ortopedi', 'Üroloji', 'Kadın Dogum', 'Kulak Burun Bogaz'];
  const statuses = ['Aktif', 'Onay Bekliyor', 'Askıya Alındı'];
  const roles = ['doctor', 'admin'];

  React.useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.full_name || doctor.name || '',
        tc_kimlik_no: doctor.tc_kimlik_no || '',
        specialty: doctor.specialization || doctor.specialty || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        hospitalId: doctor.hospital_id || doctor.hospitalId || '',
        department: doctor.department || '',
        years_of_experience: doctor.years_of_experience || doctor.experience || '',
        status: doctor.is_active ? 'Aktif' : (doctor.status || ''),
        role: doctor.role || 'doctor'
      });
    }
  }, [doctor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // TC kimlik numarası validasyonu
    if (formData.tc_kimlik_no.length !== 11) {
      alert('TC Kimlik numarası 11 haneli olmalıdır.');
      return;
    }

    // Telefon numarası validasyonu
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      alert('Telefon numarası 10 veya 11 haneli olmalıdır.');
      return;
    }
    
    const updatedDoctor = {
      id: doctor.id,
      full_name: formData.name,
      tc_kimlik_no: formData.tc_kimlik_no,
      email: formData.email,
      phone: formData.phone,
      specialization: formData.specialty,
      hospital_id: formData.hospitalId ? parseInt(formData.hospitalId) : null,
      department: formData.department || null,
      years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
      is_active: formData.status === 'Aktif',
      role: formData.role
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
          <input type="text" placeholder="TC Kimlik No" value={formData.tc_kimlik_no} onChange={(e) => setFormData({...formData, tc_kimlik_no: e.target.value.replace(/\D/g, '')})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required maxLength="11" />
          <select value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Uzmanlık Seçin</option>
            {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
          </select>
          <input type="email" placeholder="E-posta" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="tel" placeholder="Telefon (5xxxxxxxxx)" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required maxLength="11" />
          <select value={formData.hospitalId} onChange={(e) => setFormData({...formData, hospitalId: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Hastane Seçin (Opsiyonel)</option>
            {hospitals.map(hospital => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
          </select>
          <input type="text" placeholder="Departman" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="number" placeholder="Deneyim (Yıl)" value={formData.years_of_experience} onChange={(e) => setFormData({...formData, years_of_experience: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" max="50" />
          <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Durum Seçin</option>
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
          <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Rol Seçin</option>
            <option value="doctor">Doktor</option>
            <option value="admin">Admin</option>
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

const AddPatientModal = ({ isOpen, onClose, onAddPatient, cities, districts, loadDistrictsByCity }) => {
  const [formData, setFormData] = useState({
    full_name: '', tc_kimlik_no: '', email: '', phone: '', city_id: '', district_id: '', birth_date: '', gender: '', address: ''
  });
  const [selectedCityId, setSelectedCityId] = useState('');
  const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'pdf'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleCityChange = (cityId) => {
    setSelectedCityId(cityId);
    setFormData(prev => ({ ...prev, city_id: cityId, district_id: '' }));
    if (cityId) {
      loadDistrictsByCity(cityId);
    }
  };

  const handlePdfUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setUploadError('Lütfen geçerli bir PDF dosyası seçin.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const { uploadPdfAndParsePatient } = await import('../api/patientService');
      const parsedData = await uploadPdfAndParsePatient(file);
      
      // PDF'den gelen verileri form'a doldur
      setFormData({
        full_name: parsedData.full_name || '',
        tc_kimlik_no: parsedData.tc_kimlik_no || '',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        city_id: parsedData.city_id || '',
        district_id: parsedData.district_id || '',
        birth_date: parsedData.birth_date || '',
        gender: parsedData.gender || '',
        address: parsedData.address || ''
      });

      if (parsedData.city_id) {
        setSelectedCityId(parsedData.city_id);
        loadDistrictsByCity(parsedData.city_id);
      }

      setUploadMode('manual'); // PDF yüklendikten sonra manuel moda geç
    } catch (error) {
      console.error('PDF yükleme hatası:', error);
      setUploadError(error.message || 'PDF işlenirken hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handlePdfUpload(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // TC kimlik numarası validasyonu
    if (formData.tc_kimlik_no.length !== 11) {
      alert('TC Kimlik numarası 11 haneli olmalıdır.');
      return;
    }

    // Telefon numarası validasyonu
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      alert('Telefon numarası 10 veya 11 haneli olmalıdır.');
      return;
    }

    const selectedCity = cities.find(city => city.id == formData.city_id);
    const selectedDistrict = districts.find(district => district.id == formData.district_id);

    const newPatient = {
      ...formData,
      city: selectedCity?.name || '',
      district: selectedDistrict?.name || '',
      status: 'Aktif',
      last_visit: new Date().toISOString().split('T')[0],
      diagnosis_count: 0
    };
    onAddPatient(newPatient);
    setFormData({ full_name: '', tc_kimlik_no: '', email: '', phone: '', city_id: '', district_id: '', birth_date: '', gender: '', address: '' });
    setSelectedCityId('');
    setUploadMode('manual');
    setUploadError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Yeni Hasta Ekle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Upload Mode Selector */}
        <div className="mb-4">
          <div className="flex space-x-2 mb-3">
            <button
              type="button"
              onClick={() => setUploadMode('manual')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                uploadMode === 'manual' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Manuel Giriş
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('pdf')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                uploadMode === 'pdf' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              PDF Yükle
            </button>
          </div>

          {uploadMode === 'pdf' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="pdf-upload"
                className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {isUploading ? 'PDF işleniyor...' : 'PDF dosyası seçmek için tıklayın'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Hasta bilgileri otomatik olarak doldurulacak
                  </p>
                </div>
              </label>
            </div>
          )}

          {uploadError && (
            <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {uploadError}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Hasta Adı" 
            value={formData.full_name} 
            onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          <input 
            type="text" 
            placeholder="TC Kimlik No" 
            value={formData.tc_kimlik_no} 
            onChange={(e) => setFormData({...formData, tc_kimlik_no: e.target.value.replace(/\D/g, '')})} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
            maxLength="11" 
          />
          <input 
            type="email" 
            placeholder="E-posta" 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          <input 
            type="tel" 
            placeholder="Telefon (5xxxxxxxxx)" 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
            maxLength="11" 
          />
          
          {/* City Selection */}
          <select 
            value={selectedCityId} 
            onChange={(e) => handleCityChange(e.target.value)} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          >
            <option value="">Şehir Seçin</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>

          {/* District Selection */}
          <select 
            value={formData.district_id} 
            onChange={(e) => setFormData({...formData, district_id: e.target.value})} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
            disabled={!selectedCityId}
          >
            <option value="">İlçe Seçin</option>
            {districts.map(district => (
              <option key={district.id} value={district.id}>{district.name}</option>
            ))}
          </select>

          <input 
            type="date" 
            placeholder="Dogum Tarihi" 
            value={formData.birth_date} 
            onChange={(e) => setFormData({...formData, birth_date: e.target.value})} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          <select 
            value={formData.gender} 
            onChange={(e) => setFormData({...formData, gender: e.target.value})} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          >
            <option value="">Cinsiyet Seçin</option>
            <option value="Erkek">Erkek</option>
            <option value="Kadın">Kadın</option>
          </select>
          <textarea 
            placeholder="Adres" 
            value={formData.address} 
            onChange={(e) => setFormData({...formData, address: e.target.value})} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            rows="3"
          ></textarea>
          <div className="flex space-x-3">
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={isUploading}
            >
              {isUploading ? 'İşleniyor...' : 'Ekle'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditPatientModal = ({ isOpen, onClose, onEditPatient, patient, cities, districts, loadDistrictsByCity }) => {
  const [formData, setFormData] = useState({
    full_name: '', tc_kimlik_no: '', email: '', phone: '', city_id: '', district_id: '', birth_date: '', gender: '', address: '', status: ''
  });
  const [selectedCityId, setSelectedCityId] = useState('');

  const statuses = ['Aktif', 'Pasif', 'Askıya Alındı'];

  const handleCityChange = (cityId) => {
    setSelectedCityId(cityId);
    setFormData(prev => ({ ...prev, city_id: cityId, district_id: '' }));
    if (cityId) {
      loadDistrictsByCity(cityId);
    }
  };

  React.useEffect(() => {
    if (patient) {
      // Şehir ID'sini bul
      const cityId = patient.city_id || cities.find(city => city.name === patient.city)?.id || '';
      const districtId = patient.district_id || districts.find(district => district.name === patient.district)?.id || '';
      
      setFormData({
        full_name: patient.full_name || patient.name || '',
        tc_kimlik_no: patient.tc_kimlik_no || patient.tckn || '',
        email: patient.email || '',
        phone: patient.phone || '',
        city_id: cityId,
        district_id: districtId,
        birth_date: patient.birth_date || patient.birthDate || '',
        gender: patient.gender || '',
        address: patient.address || '',
        status: patient.status || ''
      });
      
      if (cityId) {
        setSelectedCityId(cityId);
        loadDistrictsByCity(cityId);
      }
    }
  }, [patient, cities, districts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // TC Kimlik No validation
    if (formData.tc_kimlik_no.length !== 11) {
      alert('TC Kimlik No 11 haneli olmalıdır.');
      return;
    }

    // Telefon numarası validasyonu
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      alert('Telefon numarası 10 veya 11 haneli olmalıdır.');
      return;
    }

    const selectedCity = cities.find(city => city.id == formData.city_id);
    const selectedDistrict = districts.find(district => district.id == formData.district_id);
    
    const updatedPatient = {
      ...patient,
      ...formData,
      city: selectedCity?.name || '',
      district: selectedDistrict?.name || ''
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
          <input type="text" placeholder="Hasta Adı" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="TC Kimlik No" value={formData.tc_kimlik_no} onChange={(e) => setFormData({...formData, tc_kimlik_no: e.target.value.replace(/\D/g, '')})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required maxLength="11" />
          <input type="email" placeholder="E-posta" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="tel" placeholder="Telefon (5xxxxxxxxx)" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required maxLength="11" />
          
          {/* City Selection */}
          <select 
            value={selectedCityId} 
            onChange={(e) => handleCityChange(e.target.value)} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          >
            <option value="">Şehir Seçin</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>

          {/* District Selection */}
          <select 
            value={formData.district_id} 
            onChange={(e) => setFormData({...formData, district_id: e.target.value})} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
            disabled={!selectedCityId}
          >
            <option value="">İlçe Seçin</option>
            {districts.map(district => (
              <option key={district.id} value={district.id}>{district.name}</option>
            ))}
          </select>

          <input type="date" placeholder="Dogum Tarihi" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
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

const PatientsPage = ({ patients, onAddPatient, onEditPatient, onDeletePatient, cities, districts, loadDistrictsByCity }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Debug: Hasta verilerini kontrol et
  console.log('PatientsPage - Hasta verileri:', patients);
  console.log('PatientsPage - Hasta sayısı:', patients?.length);

  // PDF çıktısı alma fonksiyonu (tüm hasta listesi) - PatientDetailPage.js formatında
  const generatePDF = () => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16,
        hotfixes: ["px_scaling"],
        compress: true
    });

    doc.setFont('helvetica');

    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let currentY = margin;

    // Helper function for drawing styled boxes
    const drawBox = (startY, endY) => {
        doc.setDrawColor(224, 224, 224); // Light grey border
        doc.setFillColor(250, 250, 250); // Very light grey background
        doc.roundedRect(margin, startY, pageWidth - 2 * margin, endY - startY, 3, 3, 'FD');
    };

    // Helper for section titles
    const addSectionTitle = (title) => {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 55, 71);
        doc.text(title, margin + 5, currentY + 10);
        currentY += 18;
    };

    // -- 1. HEADER --
    const addHeader = () => {
        const logoImg = new Image();
        logoImg.src = '/logo-text.png';
        doc.addImage(logoImg, 'PNG', margin, currentY, 45, 22);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('T.C. SAGLIK BAKANLIGI', pageWidth - margin, currentY, { align: 'right' });
        doc.text('SHIFHA AKILLI SAGLIK SISTEMI', pageWidth - margin, currentY + 5, { align: 'right' });
        doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth - margin, currentY + 10, { align: 'right' });
        currentY += 30;

        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(20, 30, 40);
        doc.text('HASTA LISTESI RAPORU', pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 10;
    };

    // -- 2. SUMMARY INFO --
    const addSummaryInfo = () => {
        const startY = currentY;
        addSectionTitle('Özet Bilgiler');
        
        const summaryInfo = [
            ['Toplam Hasta:', `${patients.length} kişi`],
            ['Aktif Hasta:', `${patients.filter(p => p.status === 'Aktif').length} kişi`],
            ['Pasif Hasta:', `${patients.filter(p => p.status === 'Pasif').length} kişi`],
            ['Rapor Tarihi:', new Date().toLocaleDateString('tr-TR')]
        ];

        autoTable(doc, {
            startY: currentY,
            body: summaryInfo,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold' } },
            margin: { left: margin + 5 }
        });

        currentY = doc.lastAutoTable.finalY + 5;
        drawBox(startY, currentY);
        currentY += 10;
    };

    // -- 3. PATIENT LIST --
    const addPatientList = () => {
        const startY = currentY;
        addSectionTitle('Hasta Listesi');

        const tableData = patients.map(patient => [
            patient.full_name || patient.name || '-',
            patient.tc_kimlik_no || patient.tckn || '-',
            patient.email || '-',
            patient.phone || '-',
            patient.city || '-',
            patient.status || '-',
            patient.last_visit || patient.lastVisit || '-'
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [['Hasta Adı', 'TC Kimlik No', 'E-posta', 'Telefon', 'Şehir', 'Durum', 'Son Ziyaret']],
            body: tableData,
            theme: 'striped',
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [40, 55, 71],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { left: margin + 5, right: margin + 5 }
        });

        currentY = doc.lastAutoTable.finalY + 5;
        drawBox(startY, currentY);
        currentY += 10;
    };

    // Build the PDF
    addHeader();
    addSummaryInfo();
    addPatientList();

    const fileName = `hasta-listesi-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Tek hasta için PDF çıktısı alma fonksiyonu (PatientDetailPage.js'den alındı)
  const generatePatientPDF = (patient) => {
    if (!patient) return;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16,
        hotfixes: ["px_scaling"],
        compress: true
    });

    doc.setFont('helvetica');

    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let currentY = margin;

    // Helper function for drawing styled boxes
    const drawBox = (startY, endY) => {
        doc.setDrawColor(224, 224, 224); // Light grey border
        doc.setFillColor(250, 250, 250); // Very light grey background
        doc.roundedRect(margin, startY, pageWidth - 2 * margin, endY - startY, 3, 3, 'FD');
    };

    // Helper for section titles
    const addSectionTitle = (title) => {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 55, 71);
        doc.text(title, margin + 5, currentY + 10);
        currentY += 18;
    };

    // formatTestName helper function
    const formatTestName = (testName) => {
        const nameMap = {
            // Hemogram
            hemoglobin: 'Hemoglobin',
            hematokrit: 'Hematokrit',
            eritrosit: 'Eritrosit Sayısı',
            lökosit: 'Lökosit Sayısı',
            trombosit: 'Trombosit Sayısı',
            mcv: 'MCV',
            mch: 'MCH',
            mchc: 'MCHC',
            rdw: 'RDW',
            
            // Biyokimya - Karaciğer Fonksiyonları
            alanin_aminotransferaz: 'Alanin Aminotransferaz (ALT)',
            aspartat_aminotransferaz: 'Aspartat Aminotransferaz (AST)',
            alkalen_fosfataz: 'Alkalen Fosfataz',
            gama_glutamil: 'Gama-Glutamil Transferaz',
            total_bilirubin: 'Total Bilirubin',
            
            // Biyokimya - Böbrek Fonksiyonları
            kan_üre_azotu: 'Kan Üre Azotu (BUN)',
            kreatinin: 'Kreatinin',
            tahmini_glomerüler: 'Tahmini Glomerüler Filtrasyon Hızı (eGFR)',
            
            // Biyokimya - Genel
            glukoz: 'Glukoz',
            üre: 'Üre',
            ürik_asit: 'Ürik Asit',
            
            // Lipid Profili
            total_kolesterol: 'Total Kolesterol',
            ldl_kolesterol: 'LDL Kolesterol',
            hdl_kolesterol: 'HDL Kolesterol',
            trigliserit: 'Trigliserit',
            
            // Elektrolit Paneli
            sodyum: 'Sodyum (Na)',
            potasyum: 'Potasyum (K)',
            klor: 'Klor (Cl)',
            bikarbonat: 'Bikarbonat (HCO3)',
            kalsiyum: 'Kalsiyum',
            fosfor: 'Fosfor',
            magnezyum: 'Magnezyum',
            
            // Protein
            total_protein: 'Total Protein',
            albumin: 'Albumin',
            
            // Tiroid
            tsh: 'TSH',
            t3: 'T3',
            t4: 'T4',
            
            // Vitamin
            vitamin_b12: 'Vitamin B12',
            vitamin_d: 'Vitamin D',
            folik_asit: 'Folik Asit',
            
            // İnflamasyon
            crp: 'C-Reaktif Protein (CRP)',
            sedimentasyon: 'Sedimentasyon',
            
            // Demir
            demir: 'Demir',
            tibc: 'TIBC',
            ferritin: 'Ferritin',
            
            // Hormon
            insulin: 'İnsülin',
            hba1c: 'HbA1c',
            
            // Kardiyak
            troponin_i: 'Troponin-I',
            ck_mb: 'CK-MB',
            
            // İdrar
            idrar_protein: 'İdrar Protein',
            idrar_glukoz: 'İdrar Glukoz',
            idrar_keton: 'İdrar Keton',
            idrar_lökosit: 'İdrar Lökosit',
            idrar_eritrosit: 'İdrar Eritrosit'
        };
        return nameMap[testName] || testName;
    };

    // -- 1. HEADER --
    const addHeader = () => {
        const logoImg = new Image();
        logoImg.src = '/logo-text.png';
        doc.addImage(logoImg, 'PNG', margin, currentY, 45, 22);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('T.C. SAGLIK BAKANLIGI', pageWidth - margin, currentY, { align: 'right' });
        doc.text('SHIFHA AKILLI SAGLIK SISTEMI', pageWidth - margin, currentY + 5, { align: 'right' });
        doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth - margin, currentY + 10, { align: 'right' });
        currentY += 30;

        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(20, 30, 40);
        doc.text('HASTA TIBBI RAPORU', pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 10;
    };

    // -- 2. PATIENT INFO --
    const addPatientInfo = () => {
        const startY = currentY;
        addSectionTitle('Hasta Kimlik Bilgileri');
        
        const patientInfo = [
            ['Ad Soyad:', patient.ad_soyad || patient.full_name || patient.name || '-'],
            ['T.C. Kimlik No:', patient.tc_kimlik_no || patient.tckn || '-'],
            ['Doğum Tarihi:', patient.dogum_tarihi || '-'],
            ['Yas:', `${patient.yas || '-'} yas`],
            ['Cinsiyet:', patient.cinsiyet || '-'],
            ['Kan Grubu:', patient.kan_grubu || '-'],
        ];

        autoTable(doc, {
            startY: currentY,
            body: patientInfo,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold' } },
            margin: { left: margin + 5 }
        });

        currentY = doc.lastAutoTable.finalY + 5;
        drawBox(startY, currentY);
        currentY += 10;
    };

    // -- 3. MEDICAL HISTORY --
    const addMedicalHistory = () => {
        if (!patient) return;

        const startY = currentY;
        addSectionTitle('Tıbbi Geçmiş');

        const medicalData = [
            ['Kronik Hastalıklar:', patient.kronik_hastaliklar || patient.patient_data?.kronikHastaliklar || 'Bildirilmemis'],
            ['Alerjiler:', patient.allerjiler || patient.patient_data?.allerjiler || 'Bildirilmemis'],
            ['Geçirilmiş Ameliyatlar:', patient.ameliyatlar || 'Bildirilmemis'],
            ['Aile Oykusu:', patient.aile_oykusu || 'Bildirilmemis'],
            ['Düzenli Ilac Kullanimi:', patient.ilac_duzenli || 'Bildirilmemis']
        ];

        autoTable(doc, {
            startY: currentY,
            body: medicalData,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 
                0: { fontStyle: 'bold', cellWidth: 50 },
                1: { cellWidth: 'auto' }
            },
            margin: { left: margin + 5 }
        });

        currentY = doc.lastAutoTable.finalY + 5;
        drawBox(startY, currentY);
        currentY += 10;
    };

    // -- 4. DOCTOR'S NOTES --
    const addDoctorNotes = () => {
        // Assuming doctor notes are stored in patient.doctor_notes
        if (!patient.doctor_notes || patient.doctor_notes.trim() === "") return;

        const startY = currentY;
        addSectionTitle('Doktor Notu');

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const textLines = doc.splitTextToSize(patient.doctor_notes, pageWidth - 2 * margin - 10);
        doc.text(textLines, margin + 5, currentY);

        currentY += textLines.length * 5 + 10; // Add padding
        drawBox(startY, currentY);
        currentY += 10;
    };

    // Build the PDF
    addHeader();
    addPatientInfo();
    addMedicalHistory();
    addDoctorNotes();

    const fileName = `${patient.ad_soyad || patient.full_name || patient.name || 'hasta'}_rapor_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      setUploadStatus('PDF yükleniyor ve işleniyor...');
      try {
        const result = await uploadPdfAndParsePatient(pdfFile);
        if (result.success) {
          setUploadStatus('PDF başarıyla işlendi!');
          // Yeni hasta modal'ını aç ve verileri doldur
          setShowAddModal(true);
          setTimeout(() => setUploadStatus(''), 3000);
        } else {
          setUploadStatus('PDF işlenirken hata oluştu: ' + result.error);
          setTimeout(() => setUploadStatus(''), 5000);
        }
      } catch (error) {
        setUploadStatus('PDF yüklenirken hata oluştu: ' + error.message);
        setTimeout(() => setUploadStatus(''), 5000);
      }
    } else {
      setUploadStatus('Lütfen geçerli bir PDF dosyası sürükleyin.');
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

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
    if (window.confirm('Bu hastayı silmek istediginizden emin misiniz?')) {
      onDeletePatient(patientId);
    }
  };

  const columns = [
    { key: 'full_name', header: 'Hasta Adı', render: (patient) => patient.full_name || patient.name },
    { key: 'tc_kimlik_no', header: 'TC Kimlik No', render: (patient) => patient.tc_kimlik_no || patient.tckn },
    { key: 'email', header: 'E-posta' },
    { key: 'phone', header: 'Telefon' },
    { key: 'city', header: 'Şehir' },
    { key: 'last_visit', header: 'Son Ziyaret', render: (patient) => patient.last_visit || patient.lastVisit },
    { key: 'diagnosis_count', header: 'Teşhis Sayısı', render: (patient) => patient.diagnosis_count || patient.diagnosisCount },
    { key: 'status', header: 'Durum', render: (patient) => getStatusBadge(patient.status) },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (patient) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => generatePatientPDF(patient)} 
            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
            title="PDF Çıktısı Al"
          >
            <Download size={16} />
          </button>
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

  const citiesFilter = [...new Set(patients.map(p => p.city))];

  return (
    <div 
      className={`space-y-6 ${isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Hasta Yönetimi</h2>
        <div className="flex items-center space-x-4">
          {uploadStatus && (
            <div className={`px-3 py-1 rounded-lg text-sm ${
              uploadStatus.includes('hata') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {uploadStatus}
            </div>
          )}
          <button onClick={generatePDF} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Download size={16} />
            <span>PDF Çıktısı</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus size={20} />
            <span>Yeni Hasta</span>
          </button>
        </div>
      </div>

      {isDragOver && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-40">
          <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-dashed border-blue-400">
            <div className="text-center">
              <Upload size={48} className="mx-auto text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">PDF Dosyasını Bırakın</h3>
              <p className="text-gray-600">Hasta bilgileri otomatik olarak çıkarılacak</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Toplam Hasta" value={patients.length.toString()} icon={<Users size={24} className="text-white"/>} color="bg-blue-500" />
        <StatCard title="Aktif Hasta" value={patients.filter(p => p.status === 'Aktif').length.toString()} icon={<CheckCircle size={24} className="text-white"/>} color="bg-green-500" />
        <StatCard title="Bu Ay Ziyaret" value={patients.filter(p => {
          const lastVisit = new Date(p.last_visit || p.lastVisit);
          const now = new Date();
          return lastVisit.getMonth() === now.getMonth() && lastVisit.getFullYear() === now.getFullYear();
        }).length.toString()} icon={<Calendar size={24} className="text-white"/>} color="bg-purple-500" />
        <StatCard title="Toplam Teşhis" value={patients.reduce((sum, p) => sum + (p.diagnosis_count || p.diagnosisCount || 0), 0).toString()} icon={<Activity size={24} className="text-white"/>} color="bg-orange-500" />
      </div>

      <UserTable 
        data={patients} 
        columns={columns} 
        title="Hasta Listesi" 
        filterOptions={{ cities: citiesFilter }}
      />

      <AddPatientModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAddPatient={onAddPatient}
        cities={cities}
        districts={districts}
        loadDistrictsByCity={loadDistrictsByCity}
      />

      <EditPatientModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        onEditPatient={onEditPatient}
        patient={selectedPatient}
        cities={cities}
        districts={districts}
        loadDistrictsByCity={loadDistrictsByCity}
      />
    </div>
  );
};

// --- DOCTORS PAGE COMPONENT ---
const DoctorsPage = ({ doctors, hospitals, departments, onAddDoctor, onEditDoctor, onDeleteDoctor, onAddDepartment, onEditDepartment, onDeleteDepartment }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Debug: Doktor verilerini kontrol et
  console.log('DoctorsPage - Doktor verileri:', doctors);
  console.log('DoctorsPage - Doktor sayısı:', doctors?.length);

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    return hospital ? hospital.name : 'Atanmamış';
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'Atanmamış';
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Atanmamış';
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
    if (window.confirm('Bu doktoru silmek istediginizden emin misiniz?')) {
      onDeleteDoctor(doctorId);
    }
  };

  const columns = [
    { key: 'full_name', header: 'Doktor Adı', render: (doctor) => doctor.full_name || doctor.name },
    { key: 'specialization', header: 'Uzmanlık', render: (doctor) => doctor.specialization || doctor.specialty },
    { key: 'email', header: 'E-posta' },
    { key: 'phone', header: 'Telefon' },
    { key: 'city', header: 'Şehir', render: (doctor) => {
      // Şehir bilgisini farklı kaynaklardan al
      if (doctor.organizations?.districts?.cities?.name) {
        return doctor.organizations.districts.cities.name;
      }
      if (doctor.hospitals?.districts?.cities?.name) {
        return doctor.hospitals.districts.cities.name;
      }
      return doctor.city || 'Belirtilmemiş';
    }},
    { key: 'experience', header: 'Deneyim', render: (doctor) => {
      const experience = doctor.years_of_experience || doctor.experience;
      return experience ? `${experience} yıl` : 'Belirtilmemiş';
    }},
    { key: 'hospital', header: 'Hastane', render: (doctor) => getHospitalName(doctor.hospitalId || doctor.hospital_id) },
    { key: 'department', header: 'Departman', render: (doctor) => doctor.department || getDepartmentName(doctor.department_id) },
    { key: 'status', header: 'Durum', render: (doctor) => getStatusBadge(doctor.is_active ? 'Aktif' : 'Pasif') },
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

  const cities = [...new Set(doctors.map(d => {
    // Şehir bilgisini farklı kaynaklardan al
    if (d.organizations?.districts?.cities?.name) {
      return d.organizations.districts.cities.name;
    }
    if (d.hospitals?.districts?.cities?.name) {
      return d.hospitals.districts.cities.name;
    }
    return d.city;
  }).filter(Boolean))];
  
  const specialties = [...new Set(doctors.map(d => d.specialization || d.specialty).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Doktor & Departman Yönetimi</h2>
        <div className="flex space-x-3">
          <button onClick={() => setShowAddDepartmentModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Plus size={16} />
            <span>Departman Ekle</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus size={16} />
            <span>Yeni Doktor</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Toplam Doktor" value={doctors.length.toString()} icon={<Stethoscope size={24} className="text-white"/>} color="bg-blue-500" />
        <StatCard title="Aktif Doktor" value={doctors.filter(d => d.is_active === true || d.status === 'Aktif').length.toString()} icon={<CheckCircle size={24} className="text-white"/>} color="bg-green-500" />
        <StatCard title="Onay Bekleyen" value={doctors.filter(d => d.status === 'Onay Bekliyor' || d.status === 'Pending').length.toString()} icon={<Calendar size={24} className="text-white"/>} color="bg-yellow-500" />
        <StatCard title="Askıya Alınan" value={doctors.filter(d => d.is_active === false || d.status === 'Askıya Alındı' || d.status === 'Inactive').length.toString()} icon={<XCircle size={24} className="text-white"/>} color="bg-red-500" />
      </div>

      <UserTable 
        data={doctors} 
        columns={columns} 
        title="Doktor Listesi" 
        filterOptions={{ cities, specialties }}
      />

      <UserTable 
        data={departments || []} 
        columns={[
          { key: 'name', header: 'Departman Adı' },
          { key: 'description', header: 'Açıklama' },
          {
            key: 'actions',
            header: 'İşlemler',
            render: (department) => (
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setSelectedDepartment(department);
                    setShowEditDepartmentModal(true);
                  }} 
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Bu departmanı silmek istediginizden emin misiniz?')) {
                      onDeleteDepartment(department.id);
                    }
                  }} 
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          }
        ]} 
        title="Departman Listesi" 
      />

      <AddDoctorModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAddDoctor={onAddDoctor}
        hospitals={hospitals}
        departments={departments}
      />

      <EditDoctorModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        onEditDoctor={onEditDoctor}
        doctor={selectedDoctor}
        hospitals={hospitals}
        departments={departments}
      />

      <AddDepartmentModal 
        isOpen={showAddDepartmentModal} 
        onClose={() => setShowAddDepartmentModal(false)} 
        onAddDepartment={onAddDepartment}
      />

      <EditDepartmentModal 
        isOpen={showEditDepartmentModal} 
        onClose={() => setShowEditDepartmentModal(false)} 
        onEditDepartment={onEditDepartment}
        department={selectedDepartment}
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
    if (window.confirm('Bu hastaneyi silmek istediginizden emin misiniz?')) {
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
        <StatCard title="Ortalama Kapasite" value={hospitals.length > 0 ? Math.round(hospitals.reduce((sum, h) => sum + (h.bedCount || 0), 0) / hospitals.length).toString() : "0"} icon={<Users size={24} className="text-white"/>} color="bg-purple-500" />
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

// --- REGION MANAGEMENT PAGE ---
const RegionManagementPage = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showAddRegionModal, setShowAddRegionModal] = useState(false);

  const regionStats = [
    { region: 'Marmara', hospitals: 45, doctors: 1250, patients: 25000, growth: '+12%', color: 'bg-blue-500' },
    { region: 'Ege', hospitals: 32, doctors: 890, patients: 18000, growth: '+8%', color: 'bg-green-500' },
    { region: 'Akdeniz', hospitals: 28, doctors: 720, patients: 15000, growth: '+15%', color: 'bg-orange-500' },
    { region: 'İç Anadolu', hospitals: 35, doctors: 980, patients: 20000, growth: '+10%', color: 'bg-purple-500' },
    { region: 'Karadeniz', hospitals: 25, doctors: 650, patients: 12000, growth: '+5%', color: 'bg-indigo-500' },
    { region: 'Doğu Anadolu', hospitals: 18, doctors: 420, patients: 8000, growth: '+18%', color: 'bg-red-500' },
    { region: 'Güneydoğu Anadolu', hospitals: 22, doctors: 580, patients: 11000, growth: '+22%', color: 'bg-yellow-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Bölge Yönetimi</h1>
        <button 
          onClick={() => setShowAddRegionModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Yeni Bölge Ekle
        </button>
      </div>

      {/* Region Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {regionStats.map((region, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedRegion(region)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${region.color} rounded-lg flex items-center justify-center`}>
                <MapPin className="text-white" size={24} />
              </div>
              <span className="text-green-600 font-semibold">{region.growth}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{region.region}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Hastaneler:</span>
                <span className="font-semibold">{region.hospitals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Doktorlar:</span>
                <span className="font-semibold">{region.doctors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hastalar:</span>
                <span className="font-semibold">{region.patients.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Regional Performance Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Bölgesel Performans</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={regionStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hospitals" fill="#3B82F6" name="Hastaneler" />
            <Bar dataKey="doctors" fill="#10B981" name="Doktorlar" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- DIAGNOSIS ANALYSIS PAGE ---
const DiagnosisAnalysisPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('all');
  const [aiPredictions, setAiPredictions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const diagnosisStats = [
    { name: 'Diyabet', cases: 1250, percentage: 35, trend: '+5%', color: '#8884d8', accuracy: 94.2, confidence: 'Yüksek' },
    { name: 'Hipertansiyon', cases: 980, percentage: 28, trend: '+3%', color: '#82ca9d', accuracy: 91.8, confidence: 'Yüksek' },
    { name: 'Kalp Hastalıkları', cases: 700, percentage: 20, trend: '-2%', color: '#ffc658', accuracy: 89.5, confidence: 'Orta' },
    { name: 'Astım', cases: 420, percentage: 12, trend: '+8%', color: '#ff7300', accuracy: 92.3, confidence: 'Yüksek' },
    { name: 'Diğer', cases: 175, percentage: 5, trend: '+1%', color: '#8dd1e1', accuracy: 87.1, confidence: 'Orta' }
  ];

  const monthlyTrends = [
    { month: 'Ocak', diyabet: 120, hipertansiyon: 95, kalp: 65, astim: 40, prediction: 125 },
    { month: 'Şubat', diyabet: 135, hipertansiyon: 88, kalp: 72, astim: 38, prediction: 140 },
    { month: 'Mart', diyabet: 142, hipertansiyon: 102, kalp: 68, astim: 45, prediction: 148 },
    { month: 'Nisan', diyabet: 158, hipertansiyon: 110, kalp: 75, astim: 42, prediction: 162 },
    { month: 'Mayıs', diyabet: 165, hipertansiyon: 115, kalp: 70, astim: 48, prediction: 170 },
    { month: 'Haziran', diyabet: 172, hipertansiyon: 125, kalp: 78, astim: 52, prediction: 178 },
    { month: 'Temmuz', diyabet: null, hipertansiyon: null, kalp: null, astim: null, prediction: 185 },
    { month: 'Ağustos', diyabet: null, hipertansiyon: null, kalp: null, astim: null, prediction: 192 }
  ];

  // AI Öngörüleri mock data
  const generateAIPredictions = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const predictions = [
        {
          id: 1,
          type: 'Trend Analizi',
          title: 'Diyabet Vakalarında Artış',
          description: 'Gelecek 3 ay içinde diyabet vakalarında %12 artış bekleniyor',
          confidence: 94.2,
          priority: 'Yüksek',
          recommendation: 'Endokrinoloji uzmanı sayısını artırın ve önleyici programlar başlatın',
          timeframe: '3 ay',
          impact: 'Kritik'
        },
        {
          id: 2,
          type: 'Risk Değerlendirmesi',
          title: 'Kardiyovasküler Risk Artışı',
          description: '45-65 yaş arası hastalarda kalp hastalığı riski %8 artış gösteriyor',
          confidence: 89.7,
          priority: 'Orta',
          recommendation: 'Kardiyoloji kontrollerini sıklaştırın ve yaşam tarzı danışmanlığı verin',
          timeframe: '6 ay',
          impact: 'Orta'
        },
        {
          id: 3,
          type: 'Mevsimsel Analiz',
          title: 'Astım Vakalarında Mevsimsel Artış',
          description: 'Sonbahar döneminde astım vakalarında %15 artış bekleniyor',
          confidence: 92.1,
          priority: 'Orta',
          recommendation: 'Göğüs hastalıkları kapasitesini artırın ve inhaler stoklarını kontrol edin',
          timeframe: '2 ay',
          impact: 'Orta'
        },
        {
          id: 4,
          type: 'Erken Uyarı',
          title: 'Hipertansiyon Komplikasyonları',
          description: 'Tedavi edilmeyen hipertansiyon hastalarında komplikasyon riski artıyor',
          confidence: 96.3,
          priority: 'Yüksek',
          recommendation: 'Hasta takip sistemini güçlendirin ve ilaç uyumunu artırın',
          timeframe: '1 ay',
          impact: 'Yüksek'
        }
      ];
      setAiPredictions(predictions);
      setLastUpdate(new Date());
      setIsAnalyzing(false);
    }, 2000);
  };

  // Sayfa yüklendiğinde AI öngörülerini oluştur
  React.useEffect(() => {
    generateAIPredictions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Teşhis Analizi</h1>
        <div className="flex gap-4">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">Haftalık</option>
            <option value="monthly">Aylık</option>
            <option value="yearly">Yıllık</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <BarChart2 size={20} />
            Rapor Oluştur
          </button>
        </div>
      </div>

      {/* Diagnosis Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {diagnosisStats.map((diagnosis, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: diagnosis.color + '20'}}>
                <Activity className="text-gray-700" size={24} />
              </div>
              <span className={`font-semibold ${diagnosis.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {diagnosis.trend}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{diagnosis.name}</h3>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">{diagnosis.cases}</div>
              <div className="text-sm text-gray-600">Toplam Vaka</div>
              <div className="text-sm text-gray-600">%{diagnosis.percentage} Oran</div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">AI Doğruluk</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  diagnosis.confidence === 'Yüksek' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  %{diagnosis.accuracy}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Teşhis Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={diagnosisStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percentage}) => `${name} %${percentage}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cases"
              >
                {diagnosisStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Aylık Trend Analizi & AI Öngörüleri</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'AI Öngörü') return [`${value} (Öngörü)`, name];
                  return [value, name];
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="diyabet" stroke="#8884d8" name="Diyabet" strokeWidth={2} />
              <Line type="monotone" dataKey="hipertansiyon" stroke="#82ca9d" name="Hipertansiyon" strokeWidth={2} />
              <Line type="monotone" dataKey="kalp" stroke="#ffc658" name="Kalp Hastalıkları" strokeWidth={2} />
              <Line type="monotone" dataKey="astim" stroke="#ff7300" name="Astım" strokeWidth={2} />
              <Line 
                type="monotone" 
                dataKey="prediction" 
                stroke="#e11d48" 
                strokeDasharray="5 5" 
                name="AI Öngörü" 
                strokeWidth={3}
                dot={{ fill: '#e11d48', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gray-400"></div>
              <span>Gerçek Veriler</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500" style={{borderTop: '2px dashed'}}></div>
              <span>AI Öngörüleri</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Predictions Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Cpu className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">AI Teşhis Öngörüleri</h3>
              <p className="text-sm text-gray-600">Son güncelleme: {lastUpdate.toLocaleString('tr-TR')}</p>
            </div>
          </div>
          <button 
            onClick={generateAIPredictions}
            disabled={isAnalyzing}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Analiz Ediliyor...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Yenile
              </>
            )}
          </button>
        </div>

        {isAnalyzing ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-purple-700 font-medium">AI analizi yapılıyor...</p>
              <p className="text-purple-600 text-sm mt-1">Veriler işleniyor ve öngörüler oluşturuluyor</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiPredictions.map((prediction) => (
              <div key={prediction.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                      {prediction.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      prediction.priority === 'Yüksek' ? 'bg-red-100 text-red-700' : 
                      prediction.priority === 'Orta' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {prediction.priority} Öncelik
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">%{prediction.confidence}</div>
                    <div className="text-xs text-gray-500">Güven</div>
                  </div>
                </div>
                
                <h4 className="font-bold text-gray-900 mb-2">{prediction.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{prediction.description}</p>
                
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <h5 className="font-medium text-gray-800 mb-1">Önerilen Eylem:</h5>
                  <p className="text-sm text-gray-600">{prediction.recommendation}</p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Zaman Çerçevesi: {prediction.timeframe}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    prediction.impact === 'Kritik' ? 'bg-red-100 text-red-700' :
                    prediction.impact === 'Yüksek' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {prediction.impact} Etki
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAP ANALYSIS PAGE ---
const MapAnalysisPage = () => {
  const [selectedLayer, setSelectedLayer] = useState('hospitals');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const mapData = [
    { city: 'İstanbul', hospitals: 45, doctors: 1250, patients: 25000, lat: 41.0082, lng: 28.9784 },
    { city: 'Ankara', hospitals: 32, doctors: 890, patients: 18000, lat: 39.9334, lng: 32.8597 },
    { city: 'İzmir', hospitals: 28, doctors: 720, patients: 15000, lat: 38.4192, lng: 27.1287 },
    { city: 'Bursa', hospitals: 22, doctors: 580, patients: 12000, lat: 40.1826, lng: 29.0665 },
    { city: 'Antalya', hospitals: 18, doctors: 420, patients: 9000, lat: 36.8969, lng: 30.7133 }
  ];

  const heatmapData = [
    { region: 'Marmara', density: 85, color: '#ef4444' },
    { region: 'Ege', density: 72, color: '#f97316' },
    { region: 'Akdeniz', density: 68, color: '#eab308' },
    { region: 'İç Anadolu', density: 55, color: '#22c55e' },
    { region: 'Karadeniz', density: 45, color: '#3b82f6' },
    { region: 'Doğu Anadolu', density: 32, color: '#8b5cf6' },
    { region: 'Güneydoğu Anadolu', density: 38, color: '#ec4899' }
  ];

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Harita Analizi</h1>
        <div className="flex gap-4">
          <select 
            value={selectedLayer} 
            onChange={(e) => setSelectedLayer(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hospitals">Hastane Dağılımı</option>
            <option value="doctors">Doktor Dağılımı</option>
            <option value="patients">Hasta Dağılımı</option>
            <option value="density">Hasta Yoğunluğu</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download size={20} />
            Rapor İndir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Türkiye Sağlık Haritası</h3>
          <InteractiveMap 
            selectedLayer={selectedLayer}
            onLocationClick={handleLocationClick}
          />
        </div>

        {/* Statistics Panel */}
        <div className="space-y-6">
          {selectedLocation && (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Seçili Şehir: {selectedLocation.city}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hastane:</span>
                  <span className="font-semibold text-blue-600">{selectedLocation.hospitals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Doktor:</span>
                  <span className="font-semibold text-green-600">{selectedLocation.doctors}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hasta:</span>
                  <span className="font-semibold text-orange-600">{selectedLocation.patients.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Büyüme:</span>
                  <span className={`font-semibold ${selectedLocation.growth?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedLocation.growth || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bölge:</span>
                  <span className="font-semibold text-purple-600">{selectedLocation.region}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nüfus:</span>
                  <span className="font-semibold text-gray-800">{selectedLocation.population?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Harita Katmanları</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedLayer('hospitals')}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  selectedLayer === 'hospitals' ? 'bg-blue-100 text-blue-800' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                🏥 Hastane Dağılımı
              </button>
              <button 
                onClick={() => setSelectedLayer('doctors')}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  selectedLayer === 'doctors' ? 'bg-blue-100 text-blue-800' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                👨‍⚕️ Doktor Dağılımı
              </button>
              <button 
                onClick={() => setSelectedLayer('patients')}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  selectedLayer === 'patients' ? 'bg-blue-100 text-blue-800' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                👥 Hasta Dağılımı
              </button>
              <button 
                onClick={() => setSelectedLayer('density')}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  selectedLayer === 'density' ? 'bg-blue-100 text-blue-800' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                📊 Hasta Yoğunluğu
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Şehir İstatistikleri</h3>
            <div className="space-y-4">
              {mapData.slice(0, 5).map((city, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-800">{city.city}</div>
                    <div className="text-sm text-gray-600">{city.hospitals} hastane</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{city.doctors}</div>
                    <div className="text-sm text-gray-600">doktor</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Yoğunluk Haritası</h3>
            <div className="space-y-3">
              {heatmapData.map((region, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{region.region}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{backgroundColor: region.color, width: `${region.density}%`}}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{region.density}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Distribution Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Coğrafi Dağılım</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mapData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="city" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hospitals" fill="#3B82F6" name="Hastaneler" />
            <Bar dataKey="doctors" fill="#10B981" name="Doktorlar" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- AI MODULE PAGE ---
const AIPage = () => {
  const [selectedModel, setSelectedModel] = useState('diagnosis');
  const [aiStats, setAiStats] = useState({
    totalPredictions: 15420,
    accuracy: 94.2,
    activeCases: 342,
    savedTime: 1250
  });

  const aiModels = [
    { 
      id: 'diagnosis', 
      name: 'Teşhis Asistanı', 
      description: 'Semptom ve test sonuçlarına dayalı teşhis önerileri',
      accuracy: 94.2,
      status: 'active',
      icon: <Stethoscope size={24} />
    },
    { 
      id: 'risk', 
      name: 'Risk Değerlendirme', 
      description: 'Hasta risk faktörlerini analiz eder',
      accuracy: 91.8,
      status: 'active',
      icon: <AlertTriangle size={24} />
    },
    { 
      id: 'treatment', 
      name: 'Tedavi Önerisi', 
      description: 'Kişiselleştirilmiş tedavi planları oluşturur',
      accuracy: 89.5,
      status: 'training',
      icon: <Heart size={24} />
    },
    { 
      id: 'prediction', 
      name: 'Hastalık Tahmini', 
      description: 'Gelecekteki sağlık risklerini öngörür',
      accuracy: 87.3,
      status: 'beta',
      icon: <TrendingUp size={24} />
    }
  ];

  const recentPredictions = [
    { id: 1, patient: 'Ahmet Çelik', prediction: 'Diyabet Riski', confidence: 92, time: '5 dk önce' },
    { id: 2, patient: 'Fatma Şahin', prediction: 'Hipertansiyon', confidence: 88, time: '12 dk önce' },
    { id: 3, patient: 'Mehmet Yılmaz', prediction: 'Kardiyak Risk', confidence: 95, time: '18 dk önce' },
    { id: 4, patient: 'Ayşe Demir', prediction: 'Normal', confidence: 97, time: '25 dk önce' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Yapay Zeka Modülü</h1>
        <div className="flex gap-4">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Cpu size={20} />
            Model Eğit
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <BarChart2 size={20} />
            Performans Raporu
          </button>
        </div>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Toplam Tahmin</p>
              <p className="text-3xl font-bold">{aiStats.totalPredictions.toLocaleString()}</p>
            </div>
            <Cpu size={32} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Doğruluk Oranı</p>
              <p className="text-3xl font-bold">%{aiStats.accuracy}</p>
            </div>
            <CheckCircle size={32} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Aktif Vakalar</p>
              <p className="text-3xl font-bold">{aiStats.activeCases}</p>
            </div>
            <Activity size={32} className="text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Kazanılan Zaman</p>
              <p className="text-3xl font-bold">{aiStats.savedTime}h</p>
            </div>
            <Clock size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Models */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">AI Modelleri</h3>
          <div className="space-y-4">
            {aiModels.map((model) => (
              <div key={model.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {model.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{model.name}</h4>
                      <p className="text-sm text-gray-600">{model.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">%{model.accuracy}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      model.status === 'active' ? 'bg-green-100 text-green-700' :
                      model.status === 'training' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {model.status === 'active' ? 'Aktif' : 
                       model.status === 'training' ? 'Eğitimde' : 'Beta'}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{width: `${model.accuracy}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Son Tahminler</h3>
          <div className="space-y-4">
            {recentPredictions.map((prediction) => (
              <div key={prediction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-800">{prediction.patient}</div>
                  <div className="text-sm text-gray-600">{prediction.prediction}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">%{prediction.confidence}</div>
                  <div className="text-xs text-gray-500">{prediction.time}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium">
            Tüm Tahminleri Görüntüle
          </button>
        </div>
      </div>

      {/* AI Performance Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">AI Performans Trendi</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[
            { month: 'Ocak', accuracy: 89.2, predictions: 1200 },
            { month: 'Şubat', accuracy: 90.5, predictions: 1350 },
            { month: 'Mart', accuracy: 91.8, predictions: 1480 },
            { month: 'Nisan', accuracy: 92.3, predictions: 1620 },
            { month: 'Mayıs', accuracy: 93.1, predictions: 1750 },
            { month: 'Haziran', accuracy: 94.2, predictions: 1890 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="accuracy" stroke="#8884d8" name="Doğruluk (%)" />
            <Line type="monotone" dataKey="predictions" stroke="#82ca9d" name="Tahmin Sayısı" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- MAIN ADMIN PANEL COMPONENT ---
export default function AdminPanelApp({ onLogout }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Search and user states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Modal states
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  
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
        loadCities(),
        loadDepartments(),
        loadDashboardStats(),
        loadAdminProfile(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        setAdminUser({
          name: result.data.full_name || result.data.profile?.name || 'Admin User',
          email: result.data.email,
          role: result.data.role === 'super_admin' ? 'Süper Admin' : 'Sistem Yöneticisi',
          avatar: result.data.profile?.avatar
        });
      }
    } catch (error) {
      console.error('Admin profili yüklenemedi:', error);
      // Fallback: İlk hasta verisinden admin bilgisini al
      const firstPatient = patientData[0];
      setAdminUser({
        name: firstPatient ? firstPatient.full_name || firstPatient.name : 'Admin User',
        email: firstPatient ? firstPatient.email : 'admin@shifha.com',
        role: 'Sistem Yöneticisi'
      });
    }
  };

  const loadNotifications = async () => {
    try {
      // Mock notifications for now - can be replaced with real API call
      const mockNotifications = [
        {
          id: 1,
          message: 'Yeni doktor onay bekliyor: Dr. Ahmet Yılmaz',
          time: '5 dakika önce',
          type: 'approval'
        },
        {
          id: 2,
          message: 'Sistem bakımı 23:00\'da başlayacak',
          time: '1 saat önce',
          type: 'maintenance'
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Bildirimler yüklenemedi:', error);
    }
  };

  // Search functionality
  const handleSearch = (searchValue) => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      return;
    }

    const searchLower = searchValue.toLowerCase();
    const results = [];

    // Search in doctors
    const doctorResults = doctors.filter(doctor => 
      doctor.name?.toLowerCase().includes(searchLower) ||
      doctor.email?.toLowerCase().includes(searchLower) ||
      doctor.specialty?.toLowerCase().includes(searchLower)
    ).map(doctor => ({
      ...doctor,
      type: 'doctor',
      displayName: doctor.name,
      subtitle: doctor.specialty
    }));

    // Search in patients
    const patientResults = patients.filter(patient => 
      patient.name?.toLowerCase().includes(searchLower) ||
      patient.tckn?.includes(searchValue) ||
      patient.email?.toLowerCase().includes(searchLower)
    ).map(patient => ({
      ...patient,
      type: 'patient',
      displayName: patient.name,
      subtitle: patient.tckn
    }));

    // Search in hospitals
    const hospitalResults = hospitals.filter(hospital => 
      hospital.name?.toLowerCase().includes(searchLower) ||
      hospital.address?.toLowerCase().includes(searchLower)
    ).map(hospital => ({
      ...hospital,
      type: 'hospital',
      displayName: hospital.name,
      subtitle: hospital.address
    }));

    results.push(...doctorResults, ...patientResults, ...hospitalResults);
    setSearchResults(results.slice(0, 10)); // Limit to 10 results
  };

  const loadDoctors = async () => {
    try {
      console.log('Doktor verileri yükleniyor...');
      const doctors = await getAllDoctors();
      console.log('API\'den doktor verileri alındı:', doctors);
      setDoctors(doctors);
    } catch (error) {
      console.error('Doktor verisi yüklenemedi:', error);
      console.log('Hata nedeniyle mock data kullanılıyor');
      // Fallback to mock data
      setDoctors(initialDoctorData);
    }
  };

  const loadHospitals = async () => {
    try {
      const hospitals = await getAllHospitals();
      setHospitals(hospitals);
    } catch (error) {
      console.error('Hastane verisi yüklenemedi:', error);
      // Fallback to mock data
      setHospitals(initialHospitalData);
    }
  };

  const loadPatients = async () => {
    try {
      console.log('Hasta verileri yükleniyor...');
      const patients = await getAllPatients();
      console.log('API\'den hasta verileri alındı:', patients);
      setPatients(patients);
    } catch (error) {
      console.error('Hasta verisi yüklenemedi:', error);
      console.log('Hata nedeniyle mock data kullanılıyor');
      // Fallback to mock data
      setPatients(patientData);
    }
  };

  const loadCities = async () => {
    try {
      const cities = await getAllCities();
      setCities(cities);
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

  const loadDepartments = async () => {
    try {
      const departments = await getAllDepartments();
      setDepartments(departments);
    } catch (error) {
      console.error('Departman verisi yüklenemedi:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const stats = await getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Dashboard istatistikleri yüklenemedi:', error);
    }
  };
  
  // Doctor management functions
  const handleAddDoctor = async (newDoctor) => {
    try {
      // @shifha.admin.tr uzantılı e-posta adreslerini otomatik olarak admin rolüne ata
      const isAdminEmail = newDoctor.email && newDoctor.email.endsWith('@shifha.admin.tr');
      const doctorWithRole = {
        ...newDoctor,
        role: isAdminEmail ? 'admin' : 'doctor',
        status: isAdminEmail ? 'Aktif' : 'Onay Bekliyor' // Admin e-postaları otomatik onaylı
      };

      const result = await addDoctor(doctorWithRole);
      setDoctors(prev => [...prev, result]);
      
      // Admin e-postası ise bilgilendirme mesajı göster
      if (isAdminEmail) {
        alert('Admin e-posta adresi tespit edildi. Kullanıcı otomatik olarak admin rolüne atandı ve aktif duruma getirildi.');
      }
    } catch (error) {
      console.error('Doktor eklenemedi:', error);
      // Fallback to local state update
      const isAdminEmail = newDoctor.email && newDoctor.email.endsWith('@shifha.admin.tr');
      const doctorWithRole = {
        ...newDoctor,
        id: Date.now(),
        role: isAdminEmail ? 'admin' : 'doctor',
        status: isAdminEmail ? 'Aktif' : 'Onay Bekliyor'
      };
      setDoctors(prev => [...prev, doctorWithRole]);
      
      if (isAdminEmail) {
        alert('Admin e-posta adresi tespit edildi. Kullanıcı otomatik olarak admin rolüne atandı ve aktif duruma getirildi.');
      }
    }
  };

  const handleEditDoctor = async (updatedDoctor) => {
    try {
      const result = await updateDoctor(updatedDoctor.id, updatedDoctor);
      setDoctors(prev => prev.map(doctor => 
        doctor.id === updatedDoctor.id ? result : doctor
      ));
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
      await deleteDoctor(doctorId);
      setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
    } catch (error) {
      console.error('Doktor silinemedi:', error);
      // Fallback to local state update
      setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
    }
  };

  // Patient management functions
  const handleAddPatient = async (newPatient) => {
    try {
      const result = await addPatient(newPatient);
      setPatients(prev => [...prev, result]);
    } catch (error) {
      console.error('Hasta eklenemedi:', error);
      // Fallback to local state update
      setPatients(prev => [...prev, { ...newPatient, id: Date.now() }]);
    }
  };

  const handleEditPatient = async (updatedPatient) => {
    try {
      const result = await updatePatient(updatedPatient.id, updatedPatient);
      setPatients(prev => prev.map(patient => 
        patient.id === updatedPatient.id ? result : patient
      ));
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
      await deletePatient(patientId);
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
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

  // Department management functions
  const handleAddDepartment = async (newDepartment) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDepartment),
      });
      const result = await response.json();
      if (result.success) {
        setDepartments(prev => [...prev, result.data]);
      }
    } catch (error) {
      console.error('Departman eklenemedi:', error);
    }
  };

  const handleEditDepartment = async (updatedDepartment) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/${updatedDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDepartment),
      });
      const result = await response.json();
      if (result.success) {
        setDepartments(prev => prev.map(dept => 
          dept.id === updatedDepartment.id ? result.data : dept
        ));
      }
    } catch (error) {
      console.error('Departman güncellenemedi:', error);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments/${departmentId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setDepartments(prev => prev.filter(dept => dept.id !== departmentId));
      }
    } catch (error) {
      console.error('Departman silinemedi:', error);
    }
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard dashboardStats={dashboardStats} doctors={doctors} patients={patients} hospitals={hospitals} />;
      case 'doctors':
        return (
          <DoctorsPage 
            doctors={doctors}
            hospitals={hospitals}
            departments={departments}
            onAddDoctor={handleAddDoctor}
            onEditDoctor={handleEditDoctor}
            onDeleteDoctor={handleDeleteDoctor}
            onAddDepartment={handleAddDepartment}
            onEditDepartment={handleEditDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        );
      case 'patients':
        return (
          <PatientsPage 
            patients={patients}
            onAddPatient={handleAddPatient}
            onEditPatient={handleEditPatient}
            onDeletePatient={handleDeletePatient}
            cities={cities}
            districts={districts}
            loadDistrictsByCity={loadDistrictsByCity}
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
        return <RegionManagementPage />;
      case 'diagnosis':
        return <DiagnosisAnalysisPage />;
      case 'map':
        return <MapAnalysisPage />;
      case 'ai-module':
        return <AIPage />;
      case 'profile':
        return <ProfilePage adminUser={adminUser} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard dashboardStats={dashboardStats} doctors={doctors} patients={patients} hospitals={hospitals} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={onLogout} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          adminUser={adminUser}
          notifications={notifications}
          searchResults={searchResults}
          onLogout={onLogout}
          setCurrentPage={setCurrentPage}
        />
        <div className="flex-1 p-6 overflow-y-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

// --- DEPARTMENT MODAL COMPONENTS ---
const AddDepartmentModal = ({ isOpen, onClose, onAddDepartment }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddDepartment({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      setFormData({ name: '', description: '' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Yeni Departman Ekle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departman Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Kardiyoloji"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Departman açıklaması (opsiyonel)"
              rows="3"
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

const EditDepartmentModal = ({ isOpen, onClose, onEditDepartment, department }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        description: department.description || ''
      });
    }
  }, [department]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onEditDepartment({
        ...department,
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      onClose();
    }
  };

  if (!isOpen || !department) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Departman Düzenle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departman Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
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