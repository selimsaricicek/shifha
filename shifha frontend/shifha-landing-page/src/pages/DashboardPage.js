import React, { useState, useMemo } from 'react';
import { LogOut, Search, Stethoscope, FileText, Users, HeartPulse, User, Dna, Syringe, PlusCircle, ArrowRightCircle, BrainCircuit } from 'lucide-react';

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
  return (
    <div><h3 className="text-xl font-bold text-gray-800 mb-4">Detaylı Hasta Bilgileri</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><h4 className="flex items-center text-md font-semibold text-gray-700 mb-2"><Dna size={18} className="text-blue-500"/><span className="ml-2">Tıbbi Geçmiş</span></h4><div className="text-sm text-gray-600"><p><strong>Aile Öyküsü:</strong> {patient.familyHistory.join(', ')}</p><p><strong>Geçirilmiş Ameliyatlar:</strong> {patient.surgeries.join(', ') || 'Yok'}</p></div></div><div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><h4 className="flex items-center text-md font-semibold text-gray-700 mb-2"><Syringe size={18} className="text-green-500"/><span className="ml-2">İlaç Kullanımı</span></h4><div className="text-sm text-gray-600"><p><strong>Kullandığı İlaçlar:</strong> {patient.medications.join(', ')}</p></div></div><div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><h4 className="flex items-center text-md font-semibold text-gray-700 mb-2"><Users size={18} className="text-purple-500"/><span className="ml-2">Yaşam Tarzı</span></h4><div className="text-sm text-gray-600"><p><strong>Meslek:</strong> Ofis Çalışanı</p><p><strong>Notlar:</strong> {patient.lifestyle}</p></div></div><div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><h4 className="flex items-center text-md font-semibold text-gray-700 mb-2"><Stethoscope size={18} className="text-indigo-500"/><span className="ml-2">Fizik Muayene</span></h4><div className="text-sm text-gray-600"><p>Akciğer oskültasyonunda ral yok, batın rahat.</p></div></div></div></div>
  );
}

function LabResultsTab({ labResults }) {
  return (
    <div><h3 className="text-xl font-bold text-gray-800 mb-4">Tahlil Sonuçları ve Yapay Zekâ Analizi</h3>{labResults.length > 0 ? (labResults.map((test, index) => (<div key={index} className="mb-6 last:mb-0"><div className="bg-gray-50 rounded-t-lg p-3 border-b border-gray-200"><h4 className="font-bold text-gray-700">{test.testName}</h4><p className="text-sm text-gray-500">Tarih: {test.date}</p></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-white rounded-b-lg border border-t-0 border-gray-200"><div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-500"><thead className="text-xs text-gray-700 uppercase bg-gray-100"><tr><th scope="col" className="px-4 py-2">Parametre</th><th scope="col" className="px-4 py-2">Sonuç</th><th scope="col" className="px-4 py-2">Normal Değer</th><th scope="col" className="px-4 py-2">Birim</th></tr></thead><tbody>{test.results.map((res, i) => (<tr key={i} className={`border-b ${res.isAbnormal ? 'bg-red-50' : 'bg-white'}`}><td className="px-4 py-2 font-medium text-gray-900">{res.parameter}</td><td className={`px-4 py-2 font-bold ${res.isAbnormal ? 'text-red-600' : 'text-gray-900'}`}>{res.value}</td><td className="px-4 py-2">{res.normal}</td><td className="px-4 py-2">{res.unit}</td></tr>))}</tbody></table></div><div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex items-center text-blue-700 mb-2"><BrainCircuit size={20} className="mr-2" /><h5 className="font-bold">Yapay Zekâ Analizi</h5></div><p className="text-sm text-blue-800">{test.aiAnalysis}</p></div></div></div>))) : (<p className="text-gray-500">Görüntülenecek tahlil sonucu bulunmamaktadır.</p>)}</div>
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
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
              <TabButton title="Tahliller" icon={<FileText size={18}/>} isActive={activeTab === 'tahliller'} onClick={() => setActiveTab('tahliller')} />
              <TabButton title="Doktor Notları" icon={<Stethoscope size={18}/>} isActive={activeTab === 'notlar'} onClick={() => setActiveTab('notlar')} />
              <TabButton title="Özet" icon={<HeartPulse size={18}/>} isActive={activeTab === 'ozet'} onClick={() => setActiveTab('ozet')} />
              <TabButton title="Hasta Bilgileri" icon={<User size={18}/>} isActive={activeTab === 'bilgiler'} onClick={() => setActiveTab('bilgiler')} />
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

export default function DashboardPage() {
  const [page, setPage] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = useMemo(() => mockPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm)), [searchTerm]);

  const viewPatientDetails = (patient) => { setSelectedPatient(patient); setPage('patientDetail'); };
  const backToDashboard = () => { setSelectedPatient(null); setPage('dashboard'); };

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
        <div className="mb-8"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} /> <input type="text" placeholder="Hasta adı veya T.C. Kimlik No ile arayın..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"/></div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredPatients.map(patient => (<PatientCard key={patient.id} patient={patient} onSelectPatient={viewPatientDetails} />))}</div>
      </main>
    </div>;
  }
  if (page === 'patientDetail') {
    return <PatientDetailPage patient={selectedPatient} onBack={backToDashboard} onLogout={backToDashboard} />;
  }
  return null;
}
