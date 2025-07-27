import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    HeartPulse, FileJson, User, Image as ImageIcon, Stethoscope,
    Users, ArrowRightCircle, FileText, Dna, CheckCircle,
    Edit, Save, BrainCircuit, PhoneCall, ArrowLeft, Bookmark
} from 'lucide-react';
import VitalsCard from '../components/VitalsCard';
import DecisionPanel from '../components/DecisionPanel';
import { DischargeModal, HospitalizeModal, ReferralDecisionModal } from '../components/DecisionModals';
import CallRelativesModal from '../components/CallRelativesModal';
import { mockBedData, mockPatientsData } from '../data/mockData';

// ===================================================================================
// YARDIMCI FONKSİYONLAR VE BİLEŞENLER (Sizin Kodunuz)
// ===================================================================================

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// TodaysCriticalResults fonksiyonu kaldırıldı

const TabButton = ({ title, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`${ isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}>
        {icon && React.cloneElement(icon, { className: 'mr-2' })}{title}
    </button>
);

// Her sekme için ayrı component (içerikleri aşağıda doldurulacak)
const SummaryTab = ({ patient }) => (
  <div className="animate-fadeIn">
    <h3 className="text-xl font-bold text-gray-800 mb-4">Kritik Tıbbi Özet</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-lg">
        <h4 className="font-bold">Alerjiler</h4>
        <p>{(patient.allergies || patient.allerjiler || patient.patient_data?.allerjiler || []).join(', ') || 'Raporlanmadı'}</p>
      </div>
      <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg">
        <h4 className="font-bold">Kronik Hastalıklar</h4>
        <p>{(patient.chronicDiseases || patient.kronik_hastaliklar || patient.patient_data?.kronikHastaliklar || []).join(', ') || 'Raporlanmadı'}</p>
      </div>
    </div>
  </div>
);

// Move InfoItem and EditableInfoItem to top level
const InfoItem = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-2">
    <dt className="font-medium text-gray-500">{label}</dt>
    <dd className="text-gray-700 col-span-2">{value}</dd>
  </div>
);
const EditableInfoItem = ({ label, value, name, type = 'text', onChange }) => (
  <div className="grid grid-cols-3 gap-4 items-center py-1">
    <label htmlFor={name} className="font-medium text-gray-500">{label}</label>
    <input type={type} id={name} name={name} value={value} onChange={(e) => onChange(name, e.target.value)} className="col-span-2 border rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white" />
  </div>
);

const InfoTab = ({ patient, isEditing, onChange, onSave, onToggleEdit }) => {
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Detaylı Hasta Bilgileri</h3>
        <button onClick={isEditing ? onSave : onToggleEdit} className={`flex items-center font-bold py-2 px-4 rounded-lg transition-colors ${isEditing ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}`}>
          {isEditing ? <><Save size={18} className="mr-2"/> Kaydet</> : <><Edit size={18} className="mr-2"/> Bilgileri Güncelle</>}
        </button>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 p-4 rounded-lg ${isEditing ? 'bg-gray-50' : ''}`}> 
        <div className="divide-y divide-gray-200">
          {isEditing ? <EditableInfoItem label="Ad Soyad" name="ad_soyad" value={patient.ad_soyad || ''} onChange={onChange} /> : <InfoItem label="Ad Soyad" value={patient.ad_soyad || ''} />}
          {isEditing ? <EditableInfoItem label="T.C. Kimlik No" name="tc_kimlik_no" value={patient.tc_kimlik_no || ''} onChange={onChange} /> : <InfoItem label="T.C. Kimlik No" value={patient.tc_kimlik_no || ''} />}
          {isEditing ? <EditableInfoItem label="Doğum Tarihi" name="dogum_tarihi" value={patient.dogum_tarihi || ''} onChange={onChange} /> : <InfoItem label="Doğum Tarihi" value={patient.dogum_tarihi || ''} />}
          {isEditing ? <EditableInfoItem label="Yaş" name="yas" value={patient.yas || ''} type="number" onChange={onChange}/> : <InfoItem label="Yaş" value={patient.yas || ''} />}
          {isEditing ? <EditableInfoItem label="Cinsiyet" name="cinsiyet" value={patient.cinsiyet || ''} onChange={onChange} /> : <InfoItem label="Cinsiyet" value={patient.cinsiyet || ''} />}
          {isEditing ? <EditableInfoItem label="Boy (cm)" name="boy" value={patient.boy || ''} type="number" onChange={onChange}/> : <InfoItem label="Boy (cm)" value={patient.boy || ''} />}
          {isEditing ? <EditableInfoItem label="Kilo (kg)" name="kilo" value={patient.kilo || ''} type="number" onChange={onChange}/> : <InfoItem label="Kilo (kg)" value={patient.kilo || ''} />}
          {isEditing ? <EditableInfoItem label="Kan Grubu" name="kan_grubu" value={patient.kan_grubu || ''} onChange={onChange} /> : <InfoItem label="Kan Grubu" value={patient.kan_grubu || ''} />}
        </div>
        <div className="divide-y divide-gray-200">
          {isEditing ? <EditableInfoItem label="Kronik Hastalıklar" name="kronik_hastaliklar" value={patient.kronik_hastaliklar || ''} onChange={onChange} /> : <InfoItem label="Kronik Hastalıklar" value={patient.kronik_hastaliklar || ''} />}
          {isEditing ? <EditableInfoItem label="Alerjiler" name="allerjiler" value={patient.allerjiler || ''} onChange={onChange} /> : <InfoItem label="Alerjiler" value={patient.allerjiler || ''} />}
          {isEditing ? <EditableInfoItem label="Ameliyatlar" name="ameliyatlar" value={patient.ameliyatlar || ''} onChange={onChange} /> : <InfoItem label="Ameliyatlar" value={patient.ameliyatlar || ''} />}
          {/* Diğer alanlar ve patient_data içindeki özel alanlar buraya eklenebilir */}
        </div>
      </div>
    </div>
  );
};

const ValueVisualizer = ({ value, normalRange = "" }) => {
    const parts = normalRange.split('-').map(Number);
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
    const [min, max] = parts;

    let position = 50; // default to middle
    if (value < min) position = 5;
    else if (value > max) position = 95;
    else position = ((value - min) / (max - min)) * 50 + 25;

    const isAbnormal = value < min || value > max;

    return (
        <div className="w-full my-1" title={`Değer: ${value}, Normal: ${normalRange}`}>
            <div className="h-2 w-full bg-gray-200 rounded-full relative">
                <div className="h-2 absolute bg-red-300 w-1/4 top-0 left-0 rounded-l-full"></div>
                <div className="h-2 absolute bg-green-300 w-1/2 top-0 left-1/4"></div>
                <div className="h-2 absolute bg-red-300 w-1/4 top-0 right-0 rounded-r-full"></div>
                <div className={`absolute top-1/2 -translate-y-1/2 h-4 w-1 rounded-full ${isAbnormal ? 'bg-rose-600' : 'bg-gray-800'}`} style={{ left: `calc(${position}% - 2px)` }}></div>
            </div>
        </div>
    );
};

const LabResultsTab = ({ labResults = [] }) => (
    <div className="animate-fadeIn">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Tahlil Sonuçları ve Analiz Desteği</h3>
        {labResults.length > 0 ? (
            labResults.map((test, index) => {
                const isToday = test.date === getTodayDateString();
                return (
                    <div key={index} className="mb-6 last:mb-0">
                        <div className={`rounded-t-lg p-3 border-b border-gray-200 flex justify-between items-center ${isToday ? 'bg-cyan-50 border-l-4 border-cyan-400' : 'bg-gray-50'}`}>
                            <div>
                                <h4 className="font-bold text-gray-700">{test.testName}</h4>
                                <p className="text-sm text-gray-500">Tarih: {new Date(test.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            {isToday && <span className="text-sm font-semibold text-cyan-800 bg-cyan-200 px-3 py-1 rounded-full">Bugünün Tahlili</span>}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 bg-white rounded-b-lg border border-t-0 border-gray-200">
                            <div className="lg:col-span-3 overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                        <tr>
                                            <th scope="col" className="px-3 py-2">Parametre</th>
                                            <th scope="col" className="px-3 py-2">Sonuç</th>
                                            <th scope="col" className="px-3 py-2 w-40">Görsel Aralık</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(test.results || []).map((res, i) => (
                                            <tr key={i} className={`border-b ${res.isAbnormal ? 'bg-rose-50' : 'bg-white'}`}>
                                                <td className="px-3 py-2 font-medium text-gray-900">{res.parameter}</td>
                                                <td className={`px-3 py-2 font-bold ${res.isAbnormal ? 'text-rose-600' : 'text-gray-900'}`}>{res.value} {res.unit}</td>
                                                <td className="px-3 py-2">
                                                    <ValueVisualizer value={res.value} normalRange={res.normal} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="lg:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center text-blue-700 mb-2">
                                    <BrainCircuit size={20} className="mr-2" />
                                    <h5 className="font-bold">Analiz Desteği</h5>
                                </div>
                                <p className="text-sm text-blue-800">{test.aiAnalysis}</p>
                            </div>
                        </div>
                    </div>
                )
            })
        ) : (
            <p className="text-gray-500">Görüntülenecek tahlil sonucu bulunmamaktadır.</p>
        )}
    </div>
);

// Diğer Tab bileşenleri... (Radiology, Pathology, Epikriz, DoctorNotes, Consultation)
const RadiologyTab = ({ reports = [] }) => (<div className="animate-fadeIn">Radyoloji raporu bulunamadı.</div>);
const PathologyTab = ({ reports = [] }) => (<div className="animate-fadeIn">Patoloji raporu bulunamadı.</div>);
const EpikrizTab = ({ report = "" }) => (<div className="animate-fadeIn">Epikriz raporu bulunamadı.</div>);
const DoctorNotesTab = ({ notes, onAddNote }) => (
  <div className="animate-fadeIn">
    <h3 className="text-lg font-bold mb-2">Doktor Notları</h3>
    <ul className="mb-4">
      {notes && notes.length > 0 ? notes.map((n, i) => (
        <li key={i} className="mb-2 p-2 bg-gray-50 rounded">{n.text} <span className="text-xs text-gray-400">{n.date}</span></li>
      )) : <li>Not bulunamadı.</li>}
    </ul>
    <form onSubmit={onAddNote} className="flex gap-2">
      <input name="note" className="border rounded px-2 py-1 flex-1" placeholder="Yeni not..." />
      <button type="submit" className="bg-cyan-600 text-white px-4 py-1 rounded">Ekle</button>
    </form>
  </div>
);
const ConsultationTab = ({ consultations }) => (
  <div className="animate-fadeIn">
    <h3 className="text-lg font-bold mb-2">Konsültasyonlar</h3>
    <ul>
      {consultations && consultations.length > 0 ? consultations.map((c, i) => (
        <li key={i} className="mb-2 p-2 bg-gray-50 rounded">{c.text} <span className="text-xs text-gray-400">{c.date}</span></li>
      )) : <li>Konsültasyon bulunamadı.</li>}
    </ul>
  </div>
);
const ReferralTab = ({ referrals }) => (
  <div className="animate-fadeIn">
    <h3 className="text-lg font-bold mb-2">Sevkler</h3>
    <ul>
      {referrals && referrals.length > 0 ? referrals.map((r, i) => (
        <li key={i} className="mb-2 p-2 bg-gray-50 rounded">{r.text} <span className="text-xs text-gray-400">{r.date}</span></li>
      )) : <li>Sevk bulunamadı.</li>}
    </ul>
  </div>
);


// ===================================================================================
// ANA BİLEŞEN: Tüm parçaları birleştiren ve sayfayı oluşturan kısım
// ===================================================================================

const PatientDetailPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  // All hooks must be called here, unconditionally, before any return
  const [activeTab, setActiveTab] = useState('summary');
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [showDecisionModal, setShowDecisionModal] = useState(null);
  const [showCallRelativesModal, setShowCallRelativesModal] = useState(false);

  // TC'yi hash'ten çöz
  const decodeTcFromHash = (hash) => {
    try {
      // Basit bir hash çözme (gerçek uygulamada daha güvenli olmalı)
      return atob(hash);
    } catch (error) {
      console.error('TC hash çözme hatası:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!patientId || patientId === 'undefined') return;
    
    const decodedId = decodeTcFromHash(patientId);
    if (!decodedId) {
      setLoading(false);
      setPatientData(null);
      return;
    }

    setLoading(true);
    
    // Önce mock verilerden hasta bulmaya çalış
    const mockPatient = mockPatientsData.find(p => p.id === decodedId);
    if (mockPatient) {
      setPatientData(mockPatient);
      setLoading(false);
      return;
    }
    
    // Mock verilerde bulunamazsa backend'den çek
    fetch(`http://localhost:3001/api/patients/${decodedId}`)
      .then(res => res.json())
      .then(data => {
        console.log("API'den dönen data:", data);
        if (data && data.data) {
          setPatientData(data.data);
        } else if (data) {
          setPatientData(data);
        } else {
          setPatientData(null);
        }
      })
      .catch(err => {
        console.error("Hasta verisi alınırken hata:", err);
        setPatientData(null);
      })
      .finally(() => setLoading(false));
      
    // Notlar, konsültasyonlar ve sevkler için ayrı istekler (opsiyonel)
    // fetch(`http://localhost:3001/api/patients/${decodedId}/notes`).then(res => res.json()).then(data => setNotes(data.data || []));
    // fetch(`http://localhost:3001/api/patients/${decodedId}/consultations`).then(res => res.json()).then(data => setConsultations(data.data || []));
    // fetch(`http://localhost:3001/api/patients/${decodedId}/referrals`).then(res => res.json()).then(data => setReferrals(data.data || []));
  }, [patientId]);

  if (!patientId || patientId === 'undefined') {
    return <div className="p-8 text-center text-red-600 font-bold text-xl">Geçersiz hasta adresi. Lütfen listeden bir hasta seçin.</div>;
  }
  if (loading) return <div>Yükleniyor...</div>;
  if (!patientData) return <div className="p-8 text-center text-red-600 font-bold text-xl">Hasta bulunamadı veya API'den veri alınamadı.</div>;

  const handleInfoChange = (field, value) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };
  const handleSave = () => {
    setIsEditing(false);
    setToastMessage('Hasta bilgileri başarıyla güncellendi.');
    // API'ye güncelleme isteği gönderilebilir
  };
  const handleAddNote = (e) => {
    e.preventDefault();
    const text = e.target.note.value;
    if (!text) return;
    // API'ye not ekleme isteği gönderilebilir
    setNotes(prev => [...prev, { text, date: new Date().toLocaleString() }]);
    e.target.reset();
  };

  const handleDecisionClick = (decisionType) => {
    setShowDecisionModal(decisionType);
  };

  const handleDecisionConfirm = (decisionData) => {
    if (patientData) {
      const updatedPatient = { ...patientData };
      if (decisionData.prescription) {
        updatedPatient.prescription = decisionData.prescription;
        updatedPatient.followUp = decisionData.followUp;
        if (updatedPatient.emergencyCase) {
          updatedPatient.emergencyCase.status = 'Taburcu Edildi';
        }
      } else if (decisionData.department) {
        updatedPatient.hospitalizedTo = decisionData.department;
        updatedPatient.hospitalizationNotes = decisionData.notes;
        if (updatedPatient.emergencyCase) {
          updatedPatient.emergencyCase.status = 'Servise Yatırıldı';
        }
      } else if (decisionData.destination) {
        updatedPatient.referredTo = decisionData.destination;
        updatedPatient.referralReason = decisionData.reason;
        if (updatedPatient.emergencyCase) {
          updatedPatient.emergencyCase.status = 'Sevk Edildi';
        }
      }
      setPatientData(updatedPatient);
      setToastMessage('Hasta durumu güncellendi.');
    }
    setShowDecisionModal(null);
  };

  const handleCallRelatives = () => {
    setShowCallRelativesModal(true);
  };

  const handleBackToPanel = () => {
    // Kullanıcının hangi panelde olduğunu localStorage'dan al
    const userRole = localStorage.getItem('userRole') || 'emergency';
    navigate('/dashboard');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Üst Navigasyon Çubuğu */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={handleBackToPanel} 
              className="flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Panele Dön
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-gray-700 font-medium">Dr. Ahmet Çelik</p>
                <ArrowRightCircle size={16} className="text-gray-400" />
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Bookmark size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Hasta Başlık Bölümü */}
        <div className="bg-white rounded-lg shadow-sm mx-6 mt-6 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <img
                src={patientData.profileImageUrl || `https://avatar.iran.liara.run/public/girl?username=${patientData.name?.replace(/\s/g, '')}`}
                alt={patientData.name || patientData.ad_soyad}
                className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {patientData.name || patientData.ad_soyad}
                </h1>
                <div className="space-y-1 text-gray-600">
                  <p>T.C. Kimlik No: {patientData.id || patientData.tc_kimlik_no}</p>
                  <p>Yaş: {patientData.age || patientData.yas}</p>
                  <p>Cinsiyet: {patientData.gender || patientData.cinsiyet}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {patientData.relatives && patientData.relatives.length > 0 && (
                <button
                  onClick={handleCallRelatives}
                  className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                >
                  <PhoneCall size={18} className="mr-2" /> Yakınlarını Ara
                </button>
              )}
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Bookmark size={20} />
              </button>
            </div>
          </div>
          {patientData.emergencyCase && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <h3 className="text-red-800 font-bold mb-2">Acil Durum Bilgisi</h3>
              <p className="text-red-700">
                Geliş: {patientData.emergencyCase.arrivalTime} - Şikayet: {patientData.emergencyCase.chiefComplaint}
              </p>
            </div>
          )}
        </div>

        {/* Sekme Navigasyonu */}
        <div className="border-b border-gray-200 mt-6 mx-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <TabButton title="Tıbbi Özet" icon={<HeartPulse />} isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
            <TabButton title="Tahliller" icon={<FileJson />} isActive={activeTab === 'labs'} onClick={() => setActiveTab('labs')} />
            <TabButton title="Hasta Bilgileri" icon={<User />} isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
            <TabButton title="Radyoloji" icon={<ImageIcon />} isActive={activeTab === 'radiology'} onClick={() => setActiveTab('radiology')} />
            <TabButton title="Doktor Notları" icon={<FileText />} isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
            <TabButton title="Konsültasyon" icon={<Users />} isActive={activeTab === 'consultation'} onClick={() => setActiveTab('consultation')} />
            <TabButton title="Sevk" icon={<Stethoscope />} isActive={activeTab === 'referral'} onClick={() => setActiveTab('referral')} />
            <TabButton title="Epikriz" icon={<Dna />} isActive={activeTab === 'epikriz'} onClick={() => setActiveTab('epikriz')} />
            <TabButton title="Patoloji" icon={<FileJson />} isActive={activeTab === 'pathology'} onClick={() => setActiveTab('pathology')} />
          </nav>
        </div>

        {/* Ana İçerik */}
        <main className="mx-6 mt-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Kritik Tıbbi Özet */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <SummaryTab patient={patientData} />
              </div>
              
              {/* Vital Bulgular */}
              {patientData.emergencyCase && patientData.emergencyCase.vitals && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <VitalsCard vitals={patientData.emergencyCase.vitals} />
                </div>
              )}
              
              {/* Karar Aşaması */}
              {patientData.emergencyCase && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <DecisionPanel onDecisionClick={handleDecisionClick} />
                </div>
              )}
            </div>
          )}
          {activeTab === 'info' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <InfoTab patient={patientData} isEditing={isEditing} onChange={handleInfoChange} onSave={handleSave} onToggleEdit={() => setIsEditing(!isEditing)} />
            </div>
          )}
          {activeTab === 'labs' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <LabResultsTab labResults={patientData.labResults || patientData.laboratuvar || []} />
            </div>
          )}
          {activeTab === 'radiology' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <RadiologyTab reports={patientData.radyoloji || []} />
            </div>
          )}
          {activeTab === 'notes' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <DoctorNotesTab notes={notes} onAddNote={handleAddNote} />
            </div>
          )}
          {activeTab === 'consultation' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ConsultationTab consultations={consultations} />
            </div>
          )}
          {activeTab === 'referral' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ReferralTab referrals={referrals} />
            </div>
          )}
          {activeTab === 'epikriz' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <EpikrizTab report={patientData.epikriz} />
            </div>
          )}
          {activeTab === 'pathology' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <PathologyTab reports={patientData.patoloji || []} />
            </div>
          )}
        </main>
        {toastMessage && (
          <div className="fixed bottom-10 right-10 bg-blue-600 text-white py-3 px-6 rounded-lg shadow-lg flex items-center animate-fadeIn z-50">
            <CheckCircle className="mr-2" /> {toastMessage}
          </div>
        )}

        <DischargeModal
          isOpen={showDecisionModal === 'discharge'}
          onClose={() => setShowDecisionModal(null)}
          onConfirm={handleDecisionConfirm}
        />

        <HospitalizeModal
          isOpen={showDecisionModal === 'hospitalize'}
          onClose={() => setShowDecisionModal(null)}
          onConfirm={handleDecisionConfirm}
          bedData={mockBedData}
        />

        <ReferralDecisionModal
          isOpen={showDecisionModal === 'referral'}
          onClose={() => setShowDecisionModal(null)}
          onConfirm={handleDecisionConfirm}
        />

        <CallRelativesModal
          isOpen={showCallRelativesModal}
          onClose={() => setShowCallRelativesModal(false)}
          relatives={patientData?.relatives || []}
        />
      </div>
    </div>
  );
};

export default PatientDetailPage;