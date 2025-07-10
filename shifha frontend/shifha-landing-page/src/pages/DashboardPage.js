import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Search, User, LogOut, FileText, Users, Stethoscope, BrainCircuit, HeartPulse,
    Dna, Syringe, MessageSquare, PlusCircle, ArrowRightCircle, BarChart, Upload,
    BellRing, Menu, X, Calendar, FileUp, Image as ImageIcon, Edit, Save, MessageCircle, Send, FileJson, AlertTriangle, CheckCircle, Quote, Check // HATA BURADA DÜZELTİLDİ
} from 'lucide-react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { uploadPdfAndParsePatient, deletePatient } from '../api/patientService';
import { toast } from 'react-toastify';
// Takvim bileşeninin adı 'Calendar' ikonuyla çakıştığı için 'MyCustomCalendar' olarak import edilmesi gerekiyor.
// Eğer ../components/Calendar.js dosyanız 'export default' yapıyorsa bu satır doğru.
import MyCustomCalendar from '../components/Calendar';

// ===================================================================================
// MOCK VERİ VE YARDIMCI FONKSİYONLAR
// ===================================================================================

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const mockPatientsData = [
  { id: '12345678901', name: 'Ayşe Yılmaz', age: 45, gender: 'Kadın', height: 165, weight: 70, bloodType: 'A+', profileImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop', allergies: ['Penisilin', 'Aspirin'], chronicDiseases: ['Hipertansiyon', 'Tip 2 Diyabet'], familyHistory: ['Babada kalp hastalığı', 'Annede diyabet'], surgeries: ['Apandisit (2010)', 'Safra kesesi (2018)'], medications: ['Metformin 1000mg', 'Ramipril 5mg'], lifestyle: 'Sedanter yaşam tarzı, ofis çalışanı.',
    labResults: [
        { testName: 'Tam Kan Sayımı (Hemogram)', date: getTodayDateString(), results: [ { parameter: 'WBC', value: 11.5, normal: '4.0-10.0', unit: '10^9/L', isAbnormal: true }, { parameter: 'RBC', value: 4.8, normal: '4.2-5.4', unit: '10^12/L' }, { parameter: 'HGB', value: 13.2, normal: '12.0-16.0', unit: 'g/dL' }, { parameter: 'PLT', value: 350, normal: '150-450', unit: '10^9/L' }, ], aiAnalysis: 'WBC (lökosit) değerindeki yükseklik, vücutta bir enfeksiyon veya inflamasyon olabileceğine işaret edebilir. Bu bulgu, hastanın semptomları ve diğer bulgularıyla birlikte doktorunuz tarafından değerlendirilmelidir. Gerekirse ek testler istenebilir.' },
        { testName: 'Biyokimya Paneli', date: getTodayDateString(), results: [ { parameter: 'Glikoz (Açlık)', value: 135, normal: '70-100', unit: 'mg/dL', isAbnormal: true }, { parameter: 'HbA1c', value: 7.2, normal: '< 5.7', unit: '%', isAbnormal: true }, { parameter: 'Kreatinin', value: 0.9, normal: '0.6-1.2', unit: 'mg/dL' }, { parameter: 'ALT', value: 25, normal: '10-40', unit: 'U/L' }, ], aiAnalysis: 'Açlık kan şekeri ve HbA1c değerlerinin yüksek olması, diyabet kontrolünün gözden geçirilmesi gerektiğini düşündürmektedir. Mevcut tedavi, beslenme ve yaşam tarzı alışkanlıklarının doktorunuzla birlikte yeniden değerlendirilmesi faydalı olacaktır.' },
        { testName: 'Tam Kan Sayımı (Hemogram)', date: '2024-05-15', results: [ { parameter: 'WBC', value: 8.5, normal: '4.0-10.0', unit: '10^9/L' }, { parameter: 'RBC', value: 4.7, normal: '4.2-5.4', unit: '10^12/L' }], aiAnalysis: 'Bu tarihteki değerler normal sınırlar içinde görünüyor.'}
    ],
    radiologyReports: [ { id: 1, type: 'Akciğer Grafisi', date: getTodayDateString(), url: 'https://placehold.co/600x400/333/fff?text=Akciğer+Grafisi', report: 'Kardiyotorasik oran normal sınırlardadır. Akciğer parankim alanlarında aktif infiltrasyon veya kitle lezyonu saptanmamıştır. Sinüsler açıktır.' } ],
    pathologyReports: [],
    epikriz: 'Hasta, bilinen hipertansiyon ve Tip 2 Diyabet tanılarıyla takip edilmektedir. Son kontrolünde kan şekeri regülasyonunun yetersiz olduğu görülmüştür. Kardiyoloji ve Dahiliye tarafından değerlendirilmiştir. Tedavisi yeniden düzenlenmiştir ve 1 ay sonra kontrole gelmesi önerilmiştir.',
    doctorNotes: [ { id: 1, doctor: 'Dr. Ahmet Çelik', specialty: 'İç Hastalıkları', date: '2024-09-15', note: 'Hasta, hipertansiyon ve diyabet takibi için başvurdu. İlaçları düzenlendi. 1 ay sonra kontrol önerildi.' }, { id: 2, doctor: 'Dr. Zeynep Kaya', specialty: 'Kardiyoloji', date: '2024-05-10', note: 'Efor testi sonuçları normal sınırlar içinde. Mevcut tansiyon tedavisine devam edilecek.' } ],
    referrals: [ { id: 1, fromDoctor: 'Dr. Ahmet Çelik', fromSpecialty: 'İç Hastalıkları', toSpecialty: 'Kardiyoloji', date: '2024-10-27', reason: 'Hastanın tansiyon takibinde düzensizlikler ve aile öyküsü nedeniyle kardiyolojik değerlendirme istenmiştir.', status: 'Beklemede' } ],
    appointments: [{ date: getTodayDateString(), time: '09:30', type: 'Kontrol Randevusu', urgency: 'normal' }]
  },
  // Diğer hastalar...
];


// ===================================================================================
// YARDIMCI BİLEŞENLER
// ===================================================================================

// Bu bileşenler önceki kodunuzla aynı, değişiklik yok.
const DynamicAppointments = ({ patients, onSelectPatient }) => { /* ... */ };
const PatientDropzone = ({ onPatientAdd }) => { /* ... */ };
const PatientCard = ({ patient, onSelectPatient }) => { /* ... */ };
const Toast = ({ message, type, onDismiss }) => { /* ... */ };
const DoctorChatbot = () => { /* ... */ };


// ===================================================================================
// ANA SAYFA BİLEŞENLERİ
// ===================================================================================

function DashboardPageInner() {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [editPatient, setEditPatient] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        // Mock datayı kullanıyoruz, API çağrısı yerine
        setPatients(mockPatientsData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const filteredPatients = useMemo(() => {
        if (!patients) return [];
        return patients.filter(p => {
            const name = p.name || '';
            const tc = p.id || '';
            return name.toLowerCase().includes(searchTerm.toLowerCase()) || tc.includes(searchTerm);
        });
    }, [searchTerm, patients]);
    
    const viewPatientDetails = (patient) => {
        const tc = patient.id; // Mock veride 'id' kullanılıyor
        if (tc) navigate(`/dashboard/patient/${tc}`);
    };

    // Diğer fonksiyonlar (handlePdfUpload, handleDeletePatient, vb.) buraya gelecek...
    // ...

    // Takvim için MyCustomCalendar kullanılıyor
    return (
        <div className="bg-gradient-to-b from-blue-50 via-cyan-50 to-gray-50 min-h-screen animate-fadeInDash">
            <header className="bg-white/90 shadow-md p-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                {/* LOGO ve YAZI */}
                <div className="flex items-center space-x-2">
                    <img src="/logo-symbol.png" alt="Shifha Logo" className="h-10 w-10" />
                    <img src="/logo-text.png" alt="SHIFHA" className="h-8" />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-700">Dr. Ahmet Çelik</span>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-sm"
                        title="Çıkış Yap ve Ana Sayfaya Dön"
                    >
                        Çıkış Yap
                    </button>
                </div>
            </header>
            <main className="p-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2">
                        {/* lucide-react'tan gelen Calendar ikonu ile çakışmaması için MyCustomCalendar kullanılıyor */}
                        <MyCustomCalendar 
                            appointments={[]} // Örnek appointments verisi
                            onDateSelect={(date) => setSelectedDate(date)}
                            onAppointmentClick={(appointment) => {
                                setSelectedAppointment(appointment);
                                setShowAppointmentModal(true);
                            }}
                        />
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <Calendar className="text-cyan-600" size={24} />
                            <h3 className="text-xl font-bold text-gray-800 ml-2">
                                {selectedDate.toDateString() === new Date().toDateString() ? 'Bugünün' : 'Seçili Günün'} Hasta Akışı
                            </h3>
                        </div>
                        {/* ... Hasta akışı içeriği ... */}
                    </div>
                </div>
                {/* ... Arama kutusu ve hasta kartları ... */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPatients.map((patient) => (
                        <PatientCard key={patient.id} patient={patient} onSelectPatient={viewPatientDetails} />
                    ))}
                </div>
            </main>
        </div>
    );
}

function InfoRowEditable({ label, value, onSave, type = 'text' }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value || '');
    return (
        <div className="flex justify-between items-center py-1 group">
            <span className="font-medium">{label}:</span>
            <span className="flex items-center gap-1">
                {editing ? (
                    <>
                        <input
                            className="border rounded-full px-3 py-1 text-sm focus:ring-2 focus:ring-blue-300 outline-none transition-all"
                            value={val}
                            type={type}
                            onChange={e => setVal(e.target.value)}
                            autoFocus
                        />
                        <button
                            className="ml-2 p-1 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                            onClick={() => { setEditing(false); onSave(val); }}
                            title="Kaydet"
                        >
                            {/* HATA BURADAYDI, ARTIK ÇALIŞACAK */}
                            <Check size={18} className="text-green-600" />
                        </button>
                        <button
                            className="ml-1 p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                            onClick={() => { setEditing(false); setVal(value || ''); }}
                            title="İptal"
                        >
                            <X size={18} className="text-red-500" />
                        </button>
                    </>
                ) : (
                    <>
                        {value ?? <span className="text-gray-400 italic">Bilgi yok</span>}
                        <button
                            className="ml-2 p-1 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => setEditing(true)}
                            title="Düzenle"
                        >
                            <Edit size={16} className="text-blue-500" />
                        </button>
                    </>
                )}
            </span>
        </div>
    );
}

function PatientDetailPageRemote() {
    const { tc } = useParams();
    const [patient, setPatient] = useState(null);

    useEffect(() => {
        // Gelen tc'ye göre mock veriden hastayı bul
        const foundPatient = mockPatientsData.find(p => p.id === tc);
        setPatient(foundPatient);
    }, [tc]);

    if (!patient) return <div className="p-8">Hasta bulunamadı veya yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold mb-2">{patient.name}</h2>
            <InfoRowEditable label="T.C. Kimlik No" value={patient.id} onSave={v => console.log('Kaydedildi:', v)} />
            {/* Diğer InfoRowEditable bileşenleri... */}
        </div>
    );
}

// Ana Rota Yapısı
function DashboardPage() {
    return (
        <Routes>
            <Route path="/" element={<DashboardPageInner />} />
            <Route path="/patient/:tc" element={<PatientDetailPageRemote />} />
        </Routes>
    );
}

export default DashboardPage;