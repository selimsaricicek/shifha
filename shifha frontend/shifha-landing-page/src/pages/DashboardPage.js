import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LogOut, Search, Stethoscope, FileText, Users, HeartPulse, User, Dna, Syringe, PlusCircle, ArrowRightCircle, BrainCircuit, Calendar, FileUp, Image as ImageIcon, AlertTriangle, Pencil } from 'lucide-react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import PdfUpload from '../components/PdfUpload';
import PatientDataForm from '../components/PatientDataForm';
// DÜZENLEME: uploadPdfAndParsePatient fonksiyonunu doğru yerden import ediyoruz.
import { uploadPdfAndParsePatient, updatePatient } from '../api/patientService';

// BİLEŞENLERİNİZDE HİÇBİR DEĞİŞİKLİK YAPILMADI
// PatientCard, TabButton, SummaryTab vb. tüm bileşenleriniz olduğu gibi kalıyor.
// Bu yüzden okunabilirliği artırmak için onları buraya tekrar eklemiyorum,
// ama siz kendi dosyanızda SİLMEDEN koruyun.
// ...
// ... Sizin tüm Tab, Card, Page vb. bileşenleriniz burada yer alıyor ...
// ...

// ----> ASIL DEĞİŞİKLİKLERİN OLDUĞU YER <----

// PatientDropzone artık gerçek yükleme işlemini tetikleyecek
const PatientDropzone = ({ onFileDrop, isLoading }) => {
    const onDrop = useCallback((event) => {
        event.preventDefault();
        if (isLoading) {
            console.log("Mevcut bir yükleme işlemi var, yenisi başlatılmadı.");
            return;
        }

        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            const file = event.dataTransfer.files[0];
            if (file.type === "application/pdf") {
                console.log("PDF dosyası bırakıldı, yükleme başlıyor:", file.name);
                onFileDrop(file);
            } else {
                alert("Lütfen sadece PDF formatında bir dosya yükleyin.");
            }
        }
    }, [isLoading, onFileDrop]);

    const handleDragOver = (event) => event.preventDefault();

    return (
        <div onDrop={onDrop} onDragOver={handleDragOver} className={`border-2 border-dashed border-gray-400 rounded-xl p-6 text-center transition-colors mb-8 ${isLoading ? 'bg-gray-200 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}`}>
            <div className="flex flex-col items-center justify-center">
                <FileUp className="h-12 w-12 text-gray-500 mb-2" />
                <p className="text-gray-600 font-semibold">Yeni Hasta Eklemek İçin PDF Dosyasını Buraya Sürükleyip Bırakın</p>
                <p className="text-sm text-gray-500">Hasta tahlil veya epikriz PDF'i otomatik olarak işlenecektir.</p>
            </div>
        </div>
    );
};


// Hasta Detaylarını Backend'den çeken bileşen (URL düzeltmesiyle)
function PatientDetailPageRemote() {
    const { tc } = useParams();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchPatient() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/patients/${tc}`); 
                if (!res.ok) {
                    const errData = await res.json().catch(()=>({}));
                    throw new Error(errData.details || 'Hasta bulunamadı');
                }
                const data = await res.json();
                setPatient(data);
            } catch (e) {
                console.error("Hasta detayı alınırken hata:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        if (tc) fetchPatient();
    }, [tc]);

    if (loading) return <div className="p-8 text-center text-blue-600">Hasta bilgileri yükleniyor...</div>;
    if (error) return <div className="p-8 text-center text-red-600 font-bold">Hata: {error}</div>;
    if (!patient) return <div className="p-8 text-center text-gray-500">Hasta bulunamadı.</div>;

    // Bu kısım sizin PatientDetailPage bileşeninizi render etmeli.
    // Şimdilik basit bir çıktı bırakıyorum, siz kendi bileşeninizi buraya koyabilirsiniz.
    return (
        <div>
            <button onClick={() => navigate('/dashboard')}>Geri Dön</button>
            <h1>{patient.ad_soyad}</h1>
            <pre>{JSON.stringify(patient, null, 2)}</pre>
        </div>
    );
}

// DashboardPage'in ana mantığı (GÜNCELLENMİŞ HALİ)
function DashboardPageInner() {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Hasta listesini çeken fonksiyon
    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/patients');
            if (!res.ok) throw new Error('Hasta listesi sunucudan alınamadı.');
            const data = await res.json();
            setPatients(data || []);
        } catch (e) {
            console.error("Hasta listesi alınırken hata:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // İlk açılışta hasta listesini çek
    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const filteredPatients = useMemo(() => patients.filter(p => {
        const name = p.ad_soyad || '';
        const tc = p.tc_kimlik_no || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) || tc.includes(searchTerm);
    }), [searchTerm, patients]);

    const viewPatientDetails = (patient) => {
        const tc = patient.tc_kimlik_no;
        if (tc) navigate(`/patient/${tc}`);
    };

    // PDF yükleme ve hasta listesini güncelleme (GERÇEK FONKSİYON)
    const handlePdfUpload = async (file) => {
        setLoading(true);
        setError(null);
        console.log("handlePdfUpload fonksiyonu başlatıldı.");
        try {
            // 1. Adım: API isteğini yap
            const newOrUpdatedPatient = await uploadPdfAndParsePatient(file);
            console.log("Backend'den cevap alındı:", newOrUpdatedPatient);
            
            // 2. Adım: Frontend listesini güncelle
            setPatients(prev => {
                const tc = newOrUpdatedPatient.tc_kimlik_no;
                const exists = prev.some(p => p.tc_kimlik_no === tc);
                if (exists) {
                    console.log(`Hasta (${tc}) güncelleniyor.`);
                    return prev.map(p => p.tc_kimlik_no === tc ? newOrUpdatedPatient : p);
                } else {
                    console.log(`Yeni hasta (${tc}) listeye ekleniyor.`);
                    return [newOrUpdatedPatient, ...prev];
                }
            });
            alert('PDF başarıyla işlendi ve hasta listesi güncellendi.');
        } catch (err) {
            console.error("PDF Yükleme ve İşleme Hatası:", err);
            setError(err.message || 'PDF yüklenirken bir hata oluştu.');
            alert(`HATA: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const mockAppointments = [
        { id: 1, patientName: 'Ayşe Yılmaz', time: '09:30', type: 'Randevu', urgency: 'normal' },
        { id: 2, patientName: 'Ali Veli', time: '10:00', type: 'Sevk (Kardiyoloji)', urgency: 'acil' },
        { id: 3, patientName: 'Hasan Kara', time: '11:15', type: 'Randevu', urgency: 'normal' },
    ];
    
    const AppointmentsCalendar = ({ appointments }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
                <Calendar className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-gray-800 ml-2">Bugünün Akışı ({new Date().toLocaleDateString('tr-TR')})</h3>
            </div>
            <div className="space-y-3">
                {appointments.map(item => (
                    <div key={item.id} className={`p-3 rounded-lg flex items-center justify-between ${item.urgency === 'acil' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-gray-50'}`}>
                        <div className="flex items-center">
                            <span className="font-bold text-gray-800">{item.time}</span>
                            <span className="text-gray-600 mx-2">-</span>
                            <span className="font-semibold text-gray-700">{item.patientName}</span>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${item.urgency === 'acil' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>{item.type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
    

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center text-blue-600"><Stethoscope size={28} /><h1 className="text-2xl font-bold ml-2">Shifha</h1></div>
                <div className="flex items-center"><span className="text-gray-700 mr-4">Dr. Ahmet Çelik</span></div>
            </header>
            <main className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Hasta Paneli</h2>
                
                {error && <div className="text-red-600 p-4 bg-red-100 border border-red-400 rounded-lg mb-4">Hata: {error}</div>}
                
                {/* ----> TAKVİMİ BURADA ÇAĞIRIYORUZ <---- */}
                <AppointmentsCalendar appointments={mockAppointments} />

                {/* PatientDropzone artık gerçek yükleme fonksiyonunu ve yükleme durumunu alıyor */}
                <PatientDropzone onFileDrop={handlePdfUpload} isLoading={loading} />
                
                {loading && <div className="text-blue-600 mb-4 text-center">İşlem yapılıyor, lütfen bekleyin...</div>}

                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Hasta adı veya T.C. Kimlik No ile arayın..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 pl-12" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPatients.map(patient => (
                        <div key={patient.tc_kimlik_no} onClick={() => viewPatientDetails(patient)} className="bg-white rounded-xl shadow-lg p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all">
                            <h3 className="text-lg font-bold text-gray-900">{patient.ad_soyad}</h3>
                            <p className="text-sm text-gray-500">T.C. {patient.tc_kimlik_no}</p>
                            <p className="text-sm text-gray-500">{patient.yas} yaşında, {patient.cinsiyet}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

// Ana Rota Yapısı
export default function AppRouter() {
    return (
        <Routes>
            <Route path="/dashboard" element={<DashboardPageInner />} />
            <Route path="/patient/:tc" element={<PatientDetailPageRemote />} />
            <Route path="*" element={<DashboardPageInner />} />
        </Routes>
    );
}