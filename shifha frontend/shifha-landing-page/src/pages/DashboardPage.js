import React, { useState, useMemo, useCallback } from 'react';
import { LogOut, Search, Stethoscope, FileText, Users, HeartPulse, User, Dna, Syringe, PlusCircle, ArrowRightCircle, BrainCircuit, Calendar, FileUp, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import PdfUpload from '../components/PdfUpload';
import PatientDataForm from '../components/PatientDataForm';
import { uploadPdfAndParsePatient } from '../api/patientService';

const mockPatients = [
  { id: '12345678901', name: 'Ayşe Yılmaz', age: 45, gender: 'Kadın', height: 165, weight: 70, bloodType: 'A+', profileImageUrl: 'https://placehold.co/100x100/E0E7FF/4F46E5?text=AY', allergies: ['Penisilin', 'Aspirin'], chronicDiseases: ['Hipertansiyon', 'Tip 2 Diyabet'], familyHistory: ['Babada kalp hastalığı', 'Annede diyabet'], surgeries: ['Apandisit (2010)', 'Safra kesesi (2018)'], medications: ['Metformin 1000mg', 'Ramipril 5mg'], lifestyle: 'Sedanter yaşam tarzı, ofis çalışanı.', labResults: [ { testName: 'Tam Kan Sayımı (Hemogram)', date: '2024-10-26', results: [ { parameter: 'WBC', value: 11.5, normal: '4.0-10.0', unit: '10^9/L', isAbnormal: true }, { parameter: 'RBC', value: 4.8, normal: '4.2-5.4', unit: '10^12/L' }, { parameter: 'HGB', value: 13.2, normal: '12.0-16.0', unit: 'g/dL' }, { parameter: 'PLT', value: 350, normal: '150-450', unit: '10^9/L' }, ], aiAnalysis: 'Yüksek WBC (lökosit) değeri, vücutta bir enfeksiyon veya inflamasyon olabileceğine işaret ediyor. Hastanın semptomları ve diğer bulgularla birlikte değerlendirilmesi önerilir. Enfeksiyon belirteçleri (CRP, Sedimantasyon) istenebilir.' }, { testName: 'Biyokimya Paneli', date: '2024-10-26', results: [ { parameter: 'Glikoz (Açlık)', value: 135, normal: '70-100', unit: 'mg/dL', isAbnormal: true }, { parameter: 'HbA1c', value: 7.2, normal: '< 5.7', unit: '%', isAbnormal: true }, { parameter: 'Kreatinin', value: 0.9, normal: '0.6-1.2', unit: 'mg/dL' }, { parameter: 'ALT', value: 25, normal: '10-40', unit: 'U/L' }, ], aiAnalysis: 'Yüksek açlık kan şekeri ve HbA1c değeri, hastanın diyabet regülasyonunun yetersiz olduğunu gösteriyor. Mevcut diyabet tedavisinin gözden geçirilmesi, beslenme alışkanlıklarının sorgulanması ve yaşam tarzı değişiklikleri konusunda danışmanlık verilmesi önemlidir.' } ], doctorNotes: [ { id: 1, doctor: 'Dr. Ahmet Çelik', specialty: 'İç Hastalıkları', date: '2024-09-15', note: 'Hasta, hipertansiyon ve diyabet takibi için başvurdu. İlaçları düzenlendi. 1 ay sonra kontrol önerildi.' }, { id: 2, doctor: 'Dr. Zeynep Kaya', specialty: 'Kardiyoloji', date: '2024-05-10', note: 'Efor testi sonuçları normal sınırlar içinde. Mevcut tansiyon tedavisine devam edilecek.' } ], referrals: [ { id: 1, fromDoctor: 'Dr. Ahmet Çelik', fromSpecialty: 'İç Hastalıkları', toSpecialty: 'Kardiyoloji', date: '2024-10-27', reason: 'Hastanın tansiyon takibinde düzensizlikler ve aile öyküsü nedeniyle kardiyolojik değerlendirme istenmiştir.', status: 'Beklemede' } ] },
  { id: '98765432109', name: 'Mehmet Öztürk', age: 58, gender: 'Erkek', height: 178, weight: 85, bloodType: '0+', profileImageUrl: 'https://placehold.co/100x100/D1FAE5/065F46?text=MÖ', allergies: ['Bilinmiyor'], chronicDiseases: ['Hiperlipidemi'], familyHistory: ['Erkek kardeşinde 50 yaşında MI öyküsü'], surgeries: [], medications: ['Atorvastatin 20mg'], lifestyle: 'Haftada 3 gün yürüyüş yapıyor. Sigara kullanmıyor.', labResults: [], doctorNotes: [], referrals: [] }
];

function PatientCard({ patient, onSelectPatient }) {
  return (
    <div onClick={() => onSelectPatient(patient)} className="bg-white rounded-xl shadow-lg p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center"><img src={patient.profileImageUrl} alt={patient.name} className="w-16 h-16 rounded-full mr-4" /><div><h3 className="text-lg font-bold text-gray-900">{patient.name}</h3><p className="text-sm text-gray-500">T.C. {patient.id}</p><p className="text-sm text-gray-500">{patient.age} yaşında, {patient.gender}</p></div></div>
      {patient.allergies?.length > 0 && patient.allergies[0] !== 'Bilinmiyor' && (<div className="mt-4 pt-3 border-t border-gray-100"><p className="text-xs text-red-600 font-semibold">Alerjiler: {patient.allergies.join(', ')}</p></div>)}
    </div>
  );
}

function TabButton({ title, icon, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`${ isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}>
      {icon && React.cloneElement(icon, { className: 'mr-2' })}{title}
    </button>
  );
}

function SummaryTab({ patient }) {
  return (
    <div><h3 className="text-xl font-bold text-gray-800 mb-4">Kritik Tıbbi Özet</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg"><h4 className="font-bold">Alerjiler</h4><p>{patient.allergies.join(', ') || 'Raporlanmadı'}</p></div><div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg"><h4 className="font-bold">Kronik Hastalıklar</h4><p>{patient.chronicDiseases.join(', ') || 'Raporlanmadı'}</p></div></div></div>
  );
}

function InfoTab({ patient }) {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePdfSelected = async (file) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/pdf/parse', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('PDF işlenemedi');
      const data = await res.json();
      setFormData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Detaylı Hasta Bilgileri</h3>
      <PdfUpload onFileSelected={handlePdfSelected} />
      {loading && <div className="text-blue-600">PDF işleniyor...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {formData && (
        <PatientDataForm initialData={formData} onChange={setFormData} />
      )}
      {!formData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="flex items-center text-md font-semibold text-gray-700 mb-2"><Dna size={18} className="text-blue-500"/><span className="ml-2">Tıbbi Geçmiş</span></h4>
            <div className="text-sm text-gray-600"><p><strong>Aile Öyküsü:</strong> {patient.familyHistory.join(', ')}</p><p><strong>Geçirilmiş Ameliyatlar:</strong> {patient.surgeries.join(', ') || 'Yok'}</p></div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="flex items-center text-md font-semibold text-gray-700 mb-2"><Syringe size={18} className="text-green-500"/><span className="ml-2">İlaç Kullanımı</span></h4>
            <div className="text-sm text-gray-600"><p><strong>Kullandığı İlaçlar:</strong> {patient.medications.join(', ')}</p></div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="flex items-center text-md font-semibold text-gray-700 mb-2"><Users size={18} className="text-purple-500"/><span className="ml-2">Yaşam Tarzı</span></h4>
            <div className="text-sm text-gray-600"><p><strong>Meslek:</strong> Ofis Çalışanı</p><p><strong>Notlar:</strong> {patient.lifestyle}</p></div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="flex items-center text-md font-semibold text-gray-700 mb-2"><Stethoscope size={18} className="text-indigo-500"/><span className="ml-2">Fizik Muayene</span></h4>
            <div className="text-sm text-gray-600"><p>Akciğer oskültasyonunda ral yok, batın rahat.</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

function LabResultsTab({ labResults }) {
  return (
    <div><h3 className="text-xl font-bold text-gray-800 mb-4">Tahlil Sonuçları ve Yapay Zekâ Analizi</h3>{labResults.length > 0 ? (labResults.map((test, index) => (<div key={index} className="mb-6 last:mb-0"><div className="bg-gray-50 rounded-t-lg p-3 border-b border-gray-200"><h4 className="font-bold text-gray-700">{test.testName}</h4><p className="text-sm text-gray-500">Tarih: {test.date}</p></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-white rounded-b-lg border border-t-0 border-gray-200"><div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-500"><thead className="text-xs text-gray-700 uppercase bg-gray-100"><tr><th scope="col" className="px-4 py-2">Parametre</th><th scope="col" className="px-4 py-2">Sonuç</th><th scope="col" className="px-4 py-2">Normal Değer</th><th scope="col" className="px-4 py-2">Birim</th></tr></thead><tbody>{test.results.map((res, i) => (<tr key={i} className={`border-b ${res.isAbnormal ? 'bg-red-50' : 'bg-white'}`}><td className="px-4 py-2 font-medium text-gray-900">{res.parameter}</td><td className={`px-4 py-2 font-bold ${res.isAbnormal ? 'text-red-600' : 'text-gray-900'}`}>{res.value}</td><td className="px-4 py-2">{res.normal}</td><td className="px-4 py-2">{res.unit}</td></tr>))}</tbody></table></div><div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex items-center text-blue-700 mb-2"><BrainCircuit size={20} className="mr-2" /><h5 className="font-bold">Yapay Zekâ Analizi</h5></div><p className="text-sm text-blue-800">{test.aiAnalysis}</p></div></div></div>))) : (<p className="text-gray-500">Görüntülenecek tahlil sonucu bulunmamaktadır.</p>)}</div>
  );
}

// --- Radyoloji Sekmesi ---
function RadiologyTab({ reports }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Radyoloji Görüntüleri ve Raporları</h3>
      {reports && reports.length > 0 ? (
        reports.map(report => {
          const isToday = report.date === getTodayDateString();
          return (
            <div key={report.id} className={`mb-6 border rounded-lg p-4 ${isToday ? 'bg-yellow-50' : ''}`}>
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-700">{report.type} - <span className="font-normal text-sm text-gray-500">{report.date}</span></h4>
                {isToday && <span className="text-sm font-semibold text-yellow-800 bg-yellow-200 px-3 py-1 rounded-full">Bugünün Sonucu</span>}
              </div>
              <div className="mt-4 md:flex md:gap-4">
                <div className="md:w-1/2 flex justify-center items-center bg-gray-100 rounded-lg p-2">
                  <img src={report.url} alt={report.type} className="rounded-lg shadow-md max-w-full h-auto" />
                </div>
                <div className="mt-4 md:mt-0 md:w-1/2">
                  <h5 className="font-semibold text-gray-800">Rapor</h5>
                  <div className="bg-gray-50 p-3 mt-1 rounded-md text-gray-600 text-sm">{report.report}</div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500">Görüntülenecek radyoloji raporu bulunmamaktadır.</p>
      )}
    </div>
  );
}

// --- Patoloji Sekmesi ---
function PathologyTab({ reports }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Patoloji Raporları</h3>
      {reports && reports.length > 0 ? (
        <p>Patoloji raporları burada listelenecek.</p>
      ) : (
        <p className="text-gray-500">Görüntülenecek patoloji raporu bulunmamaktadır.</p>
      )}
    </div>
  );
}

// --- Epikriz Sekmesi ---
function EpicrisisTab({ report }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Epikriz (Hasta Çıkış Özeti)</h3>
      {report ? (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-700 whitespace-pre-wrap">{report}</p>
        </div>
      ) : (
        <p className="text-gray-500">Görüntülenecek epikriz bulunmamaktadır.</p>
      )}
    </div>
  );
}

function DoctorNotesTab({ notes, newNote, setNewNote }) {
  return (
    <div><h3 className="text-xl font-bold text-gray-800 mb-4">Doktor Notları</h3><div className="space-y-4 mb-6">{notes.map(note => (<div key={note.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200"><div className="flex justify-between items-center mb-1"><p className="font-semibold text-gray-800">{note.doctor} <span className="text-sm font-normal text-gray-500">- {note.specialty}</span></p><p className="text-xs text-gray-400">{note.date}</p></div><p className="text-gray-600 text-sm">{note.note}</p></div>))}</div><div className="mt-6"><h4 className="font-semibold text-gray-700 mb-2">Yeni Not Ekle</h4><textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows="4" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Yeni notunuzu buraya yazın..."></textarea><button className="mt-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center"><PlusCircle size={18} className="mr-2" />Notu Kaydet</button></div></div>
  );
}

function ConsultationTab() {
  const [messages, setMessages] = useState([
    {id: 1, sender: 'Dr. Zeynep Kaya', specialty: 'Kardiyoloji', time: '14:30', text: 'Ahmet Bey, hastanın EKG\'si normal. Yıllık kontrol önerilir.', isSender: false, avatar: 'https://placehold.co/40x40/93C5FD/1E40AF?text=ZK'},
  ]);
  const [newMessage, setNewMessage] = useState('');
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    const msg = {
      id: messages.length + 1,
      sender: 'Dr. Ahmet Çelik',
      specialty: 'Siz',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      text: newMessage,
      isSender: true,
      avatar: 'https://placehold.co/40x40/A5B4FC/312E81?text=AÇ'
    };
    setMessages([...messages, msg]);
    setNewMessage('');
  };
  return (
    <div><h3 className="text-xl font-bold text-gray-800 mb-4">Doktorlar Arası Konsültasyon</h3><div className="border border-gray-200 rounded-lg p-4 h-96 flex flex-col"><div className="flex-grow space-y-4 overflow-y-auto pr-2 mb-4">{messages.map(msg => (<div key={msg.id} className={`flex items-start gap-3 ${msg.isSender ? 'flex-row-reverse' : ''}`}><img src={msg.avatar} alt={msg.sender} className="w-10 h-10 rounded-full" /><div className={`flex flex-col max-w-xs md:max-w-md ${msg.isSender ? 'items-end' : 'items-start'}`}><p className="font-semibold text-sm text-gray-800">{msg.sender} <span className="text-xs text-gray-400 font-normal">• {msg.isSender ? msg.time : `${msg.specialty} • ${msg.time}`}</span></p><div className={`p-3 rounded-lg mt-1 text-sm ${msg.isSender ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}><p>{msg.text}</p></div></div></div>))}</div><form onSubmit={handleSendMessage} className="mt-auto flex gap-2 border-t pt-4"><input type="text" placeholder="Mesajınızı yazın..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-grow border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400" /><button type="submit" className="bg-blue-600 text-white rounded-full p-3 flex-shrink-0 hover:bg-blue-700 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button></form></div></div>
  );
}

function ReferralTab({ patient }) {
  const [selectedClinic, setSelectedClinic] = useState('');
  const [referralNote, setReferralNote] = useState('');
  const handleReferral = () => {
    if (!selectedClinic || !referralNote) {
      alert("Lütfen bir poliklinik seçin ve sevk notu ekleyin.");
      return;
    }
    alert(`Hasta ${patient.name}, ${selectedClinic} polikliniğine başarıyla sevk edildi.`);
    setSelectedClinic('');
    setReferralNote('');
  };
  return (
    <div><h3 className="text-xl font-bold text-gray-800 mb-6">Hasta Sevk İşlemleri</h3><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="bg-gray-50 border border-gray-200 rounded-lg p-6"><h4 className="text-lg font-semibold text-gray-800 mb-4">Yeni Sevk Oluştur</h4><div className="mb-4"><label htmlFor="clinic-select" className="block text-sm font-medium text-gray-700 mb-2">Yönlendirilecek Poliklinik</label><select id="clinic-select" value={selectedClinic} onChange={(e) => setSelectedClinic(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">-- Bir poliklinik seçin --</option><option value="Kardiyoloji">Kardiyoloji</option><option value="Nöroloji">Nöroloji</option><option value="Dahiliye">Dahiliye</option></select></div><div className="mb-4"><label htmlFor="referral-note" className="block text-sm font-medium text-gray-700 mb-2">Sevk Notu</label><textarea id="referral-note" rows="5" value={referralNote} onChange={(e) => setReferralNote(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Sevk nedenini buraya yazın..."></textarea></div><button onClick={handleReferral} className="w-full bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"><ArrowRightCircle size={18} className="mr-2" />Hastayı Sevk Et</button></div><div><h4 className="text-lg font-semibold text-gray-800 mb-4">Geçmiş Sevkler</h4>{patient.referrals && patient.referrals.length > 0 ? (<div className="space-y-4">{patient.referrals.map(ref => (<div key={ref.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"><div className="flex justify-between items-center mb-2"><p className="font-bold text-blue-600">Hedef: {ref.toSpecialty}</p><span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-1 rounded-full">{ref.status}</span></div><p className="text-sm text-gray-700 mb-2"><strong>Neden:</strong> {ref.reason}</p><div className="text-xs text-gray-500 flex justify-between border-t pt-2 mt-2"><span>{ref.fromDoctor} ({ref.fromSpecialty})</span><span>{ref.date}</span></div></div>))}</div>) : <p className="text-gray-500 text-center mt-4">Geçmiş sevk bulunmuyor.</p>}</div></div></div>
  );
}

function PatientDetailPage({ patient, onBack, onLogout }) {
  const [activeTab, setActiveTab] = useState('tahliller');
  const [note, setNote] = useState('');
  const renderTabContent = () => {
    switch(activeTab) {
      case 'ozet': return <SummaryTab patient={patient} />;
      case 'bilgiler': return <InfoTab patient={patient} />;
      case 'tahliller': return <LabResultsTab labResults={patient.labResults} />;
      case 'radyoloji': return <RadiologyTab reports={patient.radiologyReports} />;
      case 'patoloji': return <PathologyTab reports={patient.pathologyReports} />;
      case 'epikriz': return <EpicrisisTab report={patient.epikriz} />;
      case 'notlar': return <DoctorNotesTab notes={patient.doctorNotes} newNote={note} setNewNote={setNote} />;
      case 'konsultasyon': return <ConsultationTab />;
      case 'sevk': return <ReferralTab patient={patient} />;
      default: return null;
    }
  };
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-20 shadow">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Panele Dön
        </button>
        <div className="flex items-center"><span className="text-gray-700 mr-4">Dr. Ahmet Çelik</span><button onClick={onLogout} className="text-gray-500 hover:text-red-600 transition-colors"><LogOut size={24}/></button></div>
      </header>
      <div className="p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 flex flex-col md:flex-row items-start md:items-center">
          <img src={patient.profileImageUrl} alt={patient.name} className="w-24 h-24 rounded-full mr-6 mb-4 md:mb-0 border-4 border-blue-200" />
          <div className="flex-grow">
            <h2 className="text-3xl font-bold text-gray-900">{patient.name}</h2>
            <p className="text-gray-600">T.C. Kimlik No: {patient.id}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-700">
              <span><strong>Yaş:</strong> {patient.age}</span>
              <span><strong>Cinsiyet:</strong> {patient.gender}</span>
              <span><strong>Boy:</strong> {patient.height} cm</span>
              <span><strong>Kilo:</strong> {patient.weight} kg</span>
              <span><strong>Kan Grubu:</strong> {patient.bloodType}</span>
            </div>
          </div>
        </div>
        {/* Bugünün Kritik Bulguları kutusu eklendi */}
        <TodaysCriticalResults labResults={patient.labResults} />
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
              <TabButton title="Tahliller" icon={<FileText size={18}/>} isActive={activeTab === 'tahliller'} onClick={() => setActiveTab('tahliller')} />
              <TabButton title="Radyoloji" icon={<ImageIcon size={18}/>} isActive={activeTab === 'radyoloji'} onClick={() => setActiveTab('radyoloji')} />
              <TabButton title="Patoloji" icon={<Dna size={18}/>} isActive={activeTab === 'patoloji'} onClick={() => setActiveTab('patoloji')} />
              <TabButton title="Epikriz" icon={<FileText size={18}/>} isActive={activeTab === 'epikriz'} onClick={() => setActiveTab('epikriz')} />
              <TabButton title="Doktor Notları" icon={<Stethoscope size={18}/>} isActive={activeTab === 'notlar'} onClick={() => setActiveTab('notlar')} />
              <TabButton title="Özet" icon={<HeartPulse size={18}/>} isActive={activeTab === 'ozet'} onClick={() => setActiveTab('ozet')} />
              <TabButton title="Konsültasyon" icon={<Users size={18}/>} isActive={activeTab === 'konsultasyon'} onClick={() => setActiveTab('konsultasyon')} />
              <TabButton title="Sevk" icon={<ArrowRightCircle size={18}/>} isActive={activeTab === 'sevk'} onClick={() => setActiveTab('sevk')} />
            </nav>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}

// Test.js'deki PatientDropzone ve AppointmentsCalendar bileşenlerini ekle
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

const PatientDropzone = ({ onPatientAdd }) => {
    const onDrop = useCallback((event) => {
        event.preventDefault();
        alert('Hasta PDF\'i başarıyla yüklendi (simülasyon). Yeni hasta listeye eklendi.');
        const newPatient = {
            id: `PDF-${Date.now().toString().slice(-6)}`,
            name: 'Yeni Hasta (PDF)',
            age: 42,
            gender: 'Belirtilmemiş',
            height: 175,
            weight: 78,
            bloodType: 'Bilinmiyor',
            profileImageUrl: 'https://placehold.co/100x100/A7F3D0/047857?text=PDF',
            allergies: [], chronicDiseases: [], familyHistory: [], surgeries: [], medications: [], lifestyle: '',
            labResults: [], radiologyReports: [], pathologyReports: [], epikriz: '', doctorNotes: [], referrals: []
        };
        onPatientAdd(newPatient);
    }, [onPatientAdd]);

    const handleDragOver = (event) => event.preventDefault();

    return (
        <div onDrop={onDrop} onDragOver={handleDragOver} className="border-2 border-dashed border-gray-400 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors mb-8">
            <div className="flex flex-col items-center justify-center">
                <FileUp className="h-12 w-12 text-gray-500 mb-2" />
                <p className="text-gray-600 font-semibold">Yeni Hasta Eklemek İçin PDF Dosyasını Buraya Sürükleyip Bırakın</p>
                <p className="text-sm text-gray-500">Hasta tahlil veya epikriz PDF'i otomatik olarak işlenir (simülasyon).</p>
            </div>
        </div>
    );
};

// Bugünün Kritik Bulguları bileşeni (Test.js'dan alınan)
function TodaysCriticalResults({ labResults }) {
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const todaysAbnormalResults = (labResults || [])
        .filter(test => test.date === getTodayDateString())
        .flatMap(test => (test.results || []).filter(res => res.isAbnormal));
    if (todaysAbnormalResults.length === 0) {
        return null;
    }
    return (
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-bold text-red-800">Bugünün Kritik Bulguları</h3>
            </div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-red-700">
                {todaysAbnormalResults.map(res => (
                    <li key={res.parameter}>
                        <span className="font-semibold">{res.parameter}:</span> {res.value} {res.unit}
                        <span className="text-xs ml-2">(Normal: {res.normal})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Demo sekme örneği: Test.js'deki mock verileri canlıda göstermek için
function DemoTabsExample() {
  // Test.js'deki örnek hastayı kopyaladık (aynı veri yapısı frontenda taşındı)
  const examplePatient = {
    id: '12345678901',
    name: 'Ayşe Yılmaz',
    age: 45,
    gender: 'Kadın',
    height: 165,
    weight: 70,
    bloodType: 'A+',
    profileImageUrl: 'https://placehold.co/100x100/E0E7FF/4F46E5?text=AY',
    allergies: ['Penisilin', 'Aspirin'],
    chronicDiseases: ['Hipertansiyon', 'Tip 2 Diyabet'],
    familyHistory: ['Babada kalp hastalığı', 'Annede diyabet'],
    surgeries: ['Apandisit (2010)', 'Safra kesesi (2018)'],
    medications: ['Metformin 1000mg', 'Ramipril 5mg'],
    lifestyle: 'Sedanter yaşam tarzı, ofis çalışanı.',
    labResults: [
      { testName: 'Tam Kan Sayımı (Hemogram)', date: '2025-06-25', results: [ { parameter: 'WBC', value: 11.5, normal: '4.0-10.0', unit: '10^9/L', isAbnormal: true }, { parameter: 'RBC', value: 4.8, normal: '4.2-5.4', unit: '10^12/L' }, { parameter: 'HGB', value: 13.2, normal: '12.0-16.0', unit: 'g/dL' }, { parameter: 'PLT', value: 350, normal: '150-450', unit: '10^9/L' }, ], aiAnalysis: 'Yüksek WBC (lökosit) değeri, vücutta bir enfeksiyon veya inflamasyon olabileceğine işaret ediyor. Hastanın semptomları ve diğer bulgularla birlikte değerlendirilmesi önerilir. Enfeksiyon belirteçleri (CRP, Sedimantasyon) istenebilir.' },
      { testName: 'Biyokimya Paneli', date: '2025-06-25', results: [ { parameter: 'Glikoz (Açlık)', value: 135, normal: '70-100', unit: 'mg/dL', isAbnormal: true }, { parameter: 'HbA1c', value: 7.2, normal: '< 5.7', unit: '%', isAbnormal: true }, { parameter: 'Kreatinin', value: 0.9, normal: '0.6-1.2', unit: 'mg/dL' }, { parameter: 'ALT', value: 25, normal: '10-40', unit: 'U/L' }, ], aiAnalysis: 'Yüksek açlık kan şekeri ve HbA1c değeri, hastanın diyabet regülasyonunun yetersiz olduğunu gösteriyor. Mevcut diyabet tedavisinin gözden geçirilmesi, beslenme alışkanlıklarının sorgulanması ve yaşam tarzı değişiklikleri konusunda danışmanlık verilmesi önemlidir.' },
      { testName: 'Tam Kan Sayımı (Hemogram)', date: '2024-05-15', results: [ { parameter: 'WBC', value: 8.5, normal: '4.0-10.0', unit: '10^9/L' }, { parameter: 'RBC', value: 4.7, normal: '4.2-5.4', unit: '10^12/L' }], aiAnalysis: 'Değerler normal sınırlar içinde.'}
    ],
    radiologyReports: [ { id: 1, type: 'Akciğer Grafisi', date: '2025-06-25', url: 'https://placehold.co/600x400/333/fff?text=Akciğer+Grafisi', report: 'Kardiyotorasik oran normal sınırlardadır. Akciğer parankim alanlarında aktif infiltrasyon veya kitle lezyonu saptanmamıştır. Sinüsler açıktır.' } ],
    pathologyReports: [],
    epikriz: 'Hasta, bilinen hipertansiyon ve Tip 2 Diyabet tanılarıyla takip edilmektedir. Son kontrolünde kan şekeri regülasyonunun yetersiz olduğu görülmüştür. Kardiyoloji ve Dahiliye tarafından değerlendirilmiştir. Tedavisi yeniden düzenlenmiştir ve 1 ay sonra kontrole gelmesi önerilmiştir.',
    doctorNotes: [ { id: 1, doctor: 'Dr. Ahmet Çelik', specialty: 'İç Hastalıkları', date: '2024-09-15', note: 'Hasta, hipertansiyon ve diyabet takibi için başvurdu. İlaçları düzenlendi. 1 ay sonra kontrol önerildi.' }, { id: 2, doctor: 'Dr. Zeynep Kaya', specialty: 'Kardiyoloji', date: '2024-05-10', note: 'Efor testi sonuçları normal sınırlar içinde. Mevcut tansiyon tedavisine devam edilecek.' } ],
    referrals: [ { id: 1, fromDoctor: 'Dr. Ahmet Çelik', fromSpecialty: 'İç Hastalıkları', toSpecialty: 'Kardiyoloji', date: '2024-10-27', reason: 'Hastanın tansiyon takibinde düzensizlikler ve aile öyküsü nedeniyle kardiyolojik değerlendirme istenmiştir.', status: 'Beklemede' } ]
  };
  const [activeTab, setActiveTab] = React.useState('radyoloji');
  return (
    <div className="p-6 bg-white rounded-xl shadow-xl mt-8">
      <h2 className="text-2xl font-bold mb-4">Sekme Demo (Test.js Mock Data)</h2>
      <div className="flex space-x-4 mb-4">
        <button className={`px-4 py-2 rounded ${activeTab==='radyoloji'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={()=>setActiveTab('radyoloji')}>Radyoloji</button>
        <button className={`px-4 py-2 rounded ${activeTab==='patoloji'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={()=>setActiveTab('patoloji')}>Patoloji</button>
        <button className={`px-4 py-2 rounded ${activeTab==='epikriz'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={()=>setActiveTab('epikriz')}>Epikriz</button>
      </div>
      {activeTab==='radyoloji' && <RadiologyTab reports={examplePatient.radiologyReports} />}
      {activeTab==='patoloji' && <PathologyTab reports={examplePatient.pathologyReports} />}
      {activeTab==='epikriz' && <EpicrisisTab report={examplePatient.epikriz} />}
    </div>
  );
}

export default function DashboardPage() {
  const [page, setPage] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState(mockPatients);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredPatients = useMemo(() => patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm)), [searchTerm, patients]);

  const viewPatientDetails = (patient) => { setSelectedPatient(patient); setPage('patientDetail'); };
  const backToDashboard = () => { setSelectedPatient(null); setPage('dashboard'); };

  // PDF upload ve hasta ekleme
  const handlePdfUpload = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const patientData = await uploadPdfAndParsePatient(file);
      // JSON'dan hasta objesi oluştur (gerekirse dönüştür)
      const newPatient = {
        ...patientData,
        id: patientData.id || `PDF-${Date.now()}`,
        name: patientData.name || patientData.kimlik_bilgileri?.ad_soyad || 'Yeni Hasta',
        age: patientData.age || patientData.kimlik_bilgileri?.yas || '',
        gender: patientData.gender || patientData.kimlik_bilgileri?.cinsiyet || '',
        height: patientData.height || patientData.kimlik_bilgileri?.boy || '',
        weight: patientData.weight || patientData.kimlik_bilgileri?.kilo || '',
        bloodType: patientData.bloodType || patientData.kimlik_bilgileri?.kan_grubu || '',
        profileImageUrl: patientData.profileImageUrl || 'https://placehold.co/100x100/A7F3D0/047857?text=PDF',
        allergies: patientData.allergies || patientData.tibbi_gecmis?.allerjiler || [],
        chronicDiseases: patientData.chronicDiseases || patientData.tibbi_gecmis?.kronik_hastaliklar || [],
        familyHistory: patientData.familyHistory || patientData.tibbi_gecmis?.aile_oykusu || [],
        surgeries: patientData.surgeries || patientData.tibbi_gecmis?.ameliyatlar || [],
        medications: patientData.medications || patientData.ilaclar?.duzenli || [],
        lifestyle: patientData.lifestyle || patientData.yasam_tarzi?.meslek || '',
        labResults: patientData.labResults || [],
        doctorNotes: patientData.doctorNotes || [],
        referrals: patientData.referrals || [],
      };
      setPatients(prev => [newPatient, ...prev]);
      setLoading(false);
      setError(null);
      alert('PDF başarıyla işlendi ve yeni hasta eklendi.');
    } catch (err) {
      setError(err.message || 'PDF yüklenemedi.');
      setLoading(false);
    }
  };

  if (page === 'dashboard') {
    return <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center text-blue-600"><Stethoscope size={28} /><h1 className="text-2xl font-bold ml-2">Shifha</h1></div>
        <div className="flex items-center">
          <span className="text-gray-700 mr-4">Dr. Ahmet Çelik</span>
        </div>
      </header>
      <main className="p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Hasta Paneli</h2>
        {/* Test.js'deki gibi bugünün akışı ve dropzone */}
        <AppointmentsCalendar appointments={mockAppointments} />
        <PatientDropzone onPatientAdd={patient => setPatients(prev => [patient, ...prev])} />
        <div className="mb-8"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} /> <input type="text" placeholder="Hasta adı veya T.C. Kimlik No ile arayın..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"/></div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredPatients.map(patient => (<PatientCard key={patient.id} patient={patient} onSelectPatient={viewPatientDetails} />))}</div>
        {/* DemoTabsExample kaldırıldı */}
      </main>
    </div>;
  }
  if (page === 'patientDetail') {
    return <PatientDetailPage patient={selectedPatient} onBack={backToDashboard} onLogout={backToDashboard} />;
  }
  return null;
}

// Ortak tarih fonksiyonu en üste ekleniyor
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
