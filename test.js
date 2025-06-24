import React, { useState, useMemo } from 'react';
import { 
    Search, User, LogOut, FileText, Users, Stethoscope, BrainCircuit, HeartPulse, 
    Dna, Syringe, MessageSquare, PlusCircle, ArrowRightCircle, BarChart, Upload, 
    BellRing, Menu, X 
} from 'lucide-react';


// ===================================================================================
// BÖLÜM 1: TANITIM SAYFASI (LANDING PAGE) BİLEŞENLERİ
// Bu bölüm, projenin özelliklerini ve vizyonunu sergileyen bileşenleri içerir.
// ===================================================================================

const LandingNavbar = ({ onLoginClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navLinks = [
        { href: '#features', label: 'Özellikler' },
        { href: '#mobile', label: 'Mobil Uygulama' },
        { href: '#howitworks', label: 'Nasıl Çalışır?' },
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-md fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <a href="#home" className="flex items-center space-x-2">
                            <Stethoscope className="h-8 w-8 text-cyan-600" />
                            <span className="text-2xl font-bold text-gray-800">Shifha</span>
                        </a>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navLinks.map((link) => (
                                <a key={link.href} href={link.href} className="text-gray-600 hover:text-cyan-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:block">
                         <button onClick={onLoginClick} className="bg-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-cyan-700 transition-colors duration-300 shadow">
                            Doktor Girişi
                         </button>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} type="button" className="bg-cyan-600 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-cyan-700 focus:outline-none">
                            <span className="sr-only">Menüyü aç</span>
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <a key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300">
                                {link.label}
                            </a>
                        ))}
                    </div>
                     <div className="pb-3 px-2">
                         <button onClick={() => { setIsOpen(false); onLoginClick(); }} className="w-full text-center bg-cyan-600 text-white block px-4 py-2 rounded-md text-base font-semibold hover:bg-cyan-700 transition-colors duration-300 shadow">
                            Doktor Girişi
                         </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

const Hero = ({ onLoginClick }) => (
    <section id="home" className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gray-900/60"></div>
        <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                Tıbbi Kararlarınızda <span className="text-cyan-400">Hız ve Derinlik</span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mb-8">
                Doktorlar için geliştirildi. Yapay zeka destekli tahlil analizi, merkezi hasta yönetimi ve anlık mobil bildirimlerle teşhis süreçlerinizi optimize edin.
            </p>
            <div className="flex justify-center space-x-4">
                <button onClick={onLoginClick} className="bg-cyan-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Panele Giriş Yap
                </button>
                <a href="#features" className="bg-white text-cyan-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Özellikleri Keşfet
                </a>
            </div>
        </div>
    </section>
);

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-cyan-100 mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const Features = () => (
    <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Teşhisten Takibe, Tıbbi Zekanın Gücü</h2>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Shifha, iş akışınızı kolaylaştırmak ve hasta bakım kalitesini artırmak için tasarlandı.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard icon={<BarChart className="h-8 w-8 text-cyan-600" />} title="Akıllı Tahlil Analizi" description="Yapay zeka, anormal değerleri saniyeler içinde tespit eder, potansiyel riskler hakkında ön bilgi sunar."/>
                <FeatureCard icon={<Dna className="h-8 w-8 text-cyan-600" />} title="Diyabet Teşhis Desteği" description="Hasta öyküsü ve kan değerlerini birleştirerek diyabet teşhisi için kapsamlı bir yorum sunar."/>
                <FeatureCard icon={<Users className="h-8 w-8 text-cyan-600" />} title="Merkezi Hasta Geçmişi" description="Tüm hasta verileri ve doktor notları, bütünsel bir bakım için tek bir güvenli profilde toplanır."/>
                <FeatureCard icon={<MessageSquare className="h-8 w-8 text-cyan-600" />} title="Doktorlar Arası Konsültasyon" description="Karmaşık vakalar için diğer uzmanlarla güvenli bir şekilde veri paylaşarak fikir alışverişi yapın."/>
            </div>
        </div>
    </section>
);

const MobileApp = () => (
    <section id="mobile" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="w-full md:w-1/2">
                    <img src="https://placehold.co/500x700/E0F2F7/333333?text=Shifha+Mobil+Uygulama" alt="[Shifha mobil uygulamasını gösteren bir telefon görseli]" className="rounded-2xl shadow-2xl mx-auto" />
                </div>
                <div className="w-full md:w-1/2">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Kritik Bilgiler Anında Cebinizde</h2>
                    <p className="text-gray-600 text-lg mb-8">Shifha mobil uygulaması ile hastalarınızın durumu her an kontrolünüz altında. Laboratuvardan gelen acil bir sonuç veya sistemdeki önemli bir güncelleme, anında bildirim olarak telefonunuza ulaşır.</p>
                    <ul className="space-y-4">
                        <li className="flex items-start"><div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-4 mt-1">✓</div><span><strong className="text-gray-800">Anlık Bildirimler:</strong> Kritik tahlil sonuçları için anında uyarı alın.</span></li>
                        <li className="flex items-start"><div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-4 mt-1">✓</div><span><strong className="text-gray-800">Hasta Takibi:</strong> Nerede olursanız olun, hasta verilerine erişin.</span></li>
                        <li className="flex items-start"><div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-4 mt-1">✓</div><span><strong className="text-gray-800">Güvenli Erişim:</strong> Biyometrik ve şifreli giriş ile verileri koruyun.</span></li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
);

const HowItWorks = () => (
    <section id="howitworks" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Üç Basit Adımda Shifha</h2></div>
            <div className="relative">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                <div className="relative flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
                    <div className="flex flex-col items-center text-center max-w-xs z-10"><div className="bg-white p-6 rounded-full shadow-lg mb-4"><Upload className="h-10 w-10 text-cyan-600"/></div><h3 className="text-xl font-bold text-gray-800 mb-2">1. Kaydet ve Yükle</h3><p className="text-gray-600">Hasta öyküsünü ve tahlil sonuçlarını sisteme kolayca kaydedin.</p></div>
                    <div className="flex flex-col items-center text-center max-w-xs z-10"><div className="bg-white p-6 rounded-full shadow-lg mb-4"><BrainCircuit className="h-10 w-10 text-cyan-600"/></div><h3 className="text-xl font-bold text-gray-800 mb-2">2. Analiz ve Yorumlama</h3><p className="text-gray-600">Yapay zeka verileri analiz eder ve size ön rapor sunar.</p></div>
                    <div className="flex flex-col items-center text-center max-w-xs z-10"><div className="bg-white p-6 rounded-full shadow-lg mb-4"><BellRing className="h-10 w-10 text-cyan-600"/></div><h3 className="text-xl font-bold text-gray-800 mb-2">3. Bildirim ve İş Birliği</h3><p className="text-gray-600">Sonuçları değerlendirin ve meslektaşlarınızla fikir alışverişi yapın.</p></div>
                </div>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer id="contact" className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; {new Date().getFullYear()} Shifha. Tüm Hakları Saklıdır.</p>
        </div>
    </footer>
);

const LandingPage = ({ onLoginClick }) => (
    <div className="bg-white">
        <LandingNavbar onLoginClick={onLoginClick} />
        <main>
            <Hero onLoginClick={onLoginClick} />
            <Features />
            <MobileApp />
            <HowItWorks />
        </main>
        <Footer />
    </div>
);


// ===================================================================================
// BÖLÜM 2: DOKTOR PANELİ (DASHBOARD) BİLEŞENLERİ
// Bu bölüm, doktorun giriş yaptıktan sonra kullanacağı arayüzleri içerir.
// ===================================================================================

const mockPatients = [
  { id: '12345678901', name: 'Ayşe Yılmaz', age: 45, gender: 'Kadın', height: 165, weight: 70, bloodType: 'A+', profileImageUrl: 'https://placehold.co/100x100/E0E7FF/4F46E5?text=AY', allergies: ['Penisilin', 'Aspirin'], chronicDiseases: ['Hipertansiyon', 'Tip 2 Diyabet'], familyHistory: ['Babada kalp hastalığı', 'Annede diyabet'], surgeries: ['Apandisit (2010)', 'Safra kesesi (2018)'], medications: ['Metformin 1000mg', 'Ramipril 5mg'], lifestyle: 'Sedanter yaşam tarzı, ofis çalışanı.', labResults: [ { testName: 'Tam Kan Sayımı (Hemogram)', date: '2024-10-26', results: [ { parameter: 'WBC', value: 11.5, normal: '4.0-10.0', unit: '10^9/L', isAbnormal: true }, { parameter: 'RBC', value: 4.8, normal: '4.2-5.4', unit: '10^12/L' }, { parameter: 'HGB', value: 13.2, normal: '12.0-16.0', unit: 'g/dL' }, { parameter: 'PLT', value: 350, normal: '150-450', unit: '10^9/L' }, ], aiAnalysis: 'Yüksek WBC (lökosit) değeri, vücutta bir enfeksiyon veya inflamasyon olabileceğine işaret ediyor. Hastanın semptomları ve diğer bulgularla birlikte değerlendirilmesi önerilir. Enfeksiyon belirteçleri (CRP, Sedimantasyon) istenebilir.' }, { testName: 'Biyokimya Paneli', date: '2024-10-26', results: [ { parameter: 'Glikoz (Açlık)', value: 135, normal: '70-100', unit: 'mg/dL', isAbnormal: true }, { parameter: 'HbA1c', value: 7.2, normal: '< 5.7', unit: '%', isAbnormal: true }, { parameter: 'Kreatinin', value: 0.9, normal: '0.6-1.2', unit: 'mg/dL' }, { parameter: 'ALT', value: 25, normal: '10-40', unit: 'U/L' }, ], aiAnalysis: 'Yüksek açlık kan şekeri ve HbA1c değeri, hastanın diyabet regülasyonunun yetersiz olduğunu gösteriyor. Mevcut diyabet tedavisinin gözden geçirilmesi, beslenme alışkanlıklarının sorgulanması ve yaşam tarzı değişiklikleri konusunda danışmanlık verilmesi önemlidir.' } ], doctorNotes: [ { id: 1, doctor: 'Dr. Ahmet Çelik', specialty: 'İç Hastalıkları', date: '2024-09-15', note: 'Hasta, hipertansiyon ve diyabet takibi için başvurdu. İlaçları düzenlendi. 1 ay sonra kontrol önerildi.' }, { id: 2, doctor: 'Dr. Zeynep Kaya', specialty: 'Kardiyoloji', date: '2024-05-10', note: 'Efor testi sonuçları normal sınırlar içinde. Mevcut tansiyon tedavisine devam edilecek.' } ], referrals: [ { id: 1, fromDoctor: 'Dr. Ahmet Çelik', fromSpecialty: 'İç Hastalıkları', toSpecialty: 'Kardiyoloji', date: '2024-10-27', reason: 'Hastanın tansiyon takibinde düzensizlikler ve aile öyküsü nedeniyle kardiyolojik değerlendirme istenmiştir.', status: 'Beklemede' } ] },
  { id: '98765432109', name: 'Mehmet Öztürk', age: 58, gender: 'Erkek', height: 178, weight: 85, bloodType: '0+', profileImageUrl: 'https://placehold.co/100x100/D1FAE5/065F46?text=MÖ', allergies: ['Bilinmiyor'], chronicDiseases: ['Hiperlipidemi'], familyHistory: ['Erkek kardeşinde 50 yaşında MI öyküsü'], surgeries: [], medications: ['Atorvastatin 20mg'], lifestyle: 'Haftada 3 gün yürüyüş yapıyor. Sigara kullanmıyor.', labResults: [], doctorNotes: [], referrals: [] }
];

const LoginPage = ({ onLogin }) => (
  <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans">
    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 m-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center text-blue-600 mb-6"> <Stethoscope size={40} /> <h1 className="text-4xl font-bold ml-3">Shifha</h1></div>
        <p className="text-gray-600 mb-8 text-center">Yapay Zekâ Destekli Doktor Asistanı</p>
      </div>
      <form onSubmit={(e) => {e.preventDefault(); onLogin();}}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Kullanıcı Adı / E-posta</label>
          <input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" id="username" type="text" placeholder="doktor@ornek.com" defaultValue="dr.ahmet" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Şifre</label>
          <input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" id="password" type="password" placeholder="••••••••••" defaultValue="password" />
        </div>
        <div className="flex items-center justify-between"> <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full focus:outline-none focus:shadow-outline transition-colors duration-300" type="submit">Giriş Yap</button></div>
      </form>
    </div>
  </div>
);

const DashboardPage = ({ patients, onSelectPatient, onLogout, searchTerm, setSearchTerm }) => (
  <div className="bg-gray-50 min-h-screen">
    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center text-blue-600"><Stethoscope size={28} /><h1 className="text-2xl font-bold ml-2">Shifha</h1></div>
      <div className="flex items-center">
        <span className="text-gray-700 mr-4">Dr. Ahmet Çelik</span>
        <button onClick={onLogout} className="text-gray-500 hover:text-red-600 transition-colors"><LogOut size={24} /></button>
      </div>
    </header>
    <main className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Hasta Paneli</h2>
      <div className="mb-8"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} /> <input type="text" placeholder="Hasta adı veya T.C. Kimlik No ile arayın..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"/></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{patients.map(patient => (<PatientCard key={patient.id} patient={patient} onSelectPatient={onSelectPatient} />))}</div>
    </main>
  </div>
);

const PatientCard = ({ patient, onSelectPatient }) => (
  <div onClick={() => onSelectPatient(patient)} className="bg-white rounded-xl shadow-lg p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center"><img src={patient.profileImageUrl} alt={patient.name} className="w-16 h-16 rounded-full mr-4" /><div><h3 className="text-lg font-bold text-gray-900">{patient.name}</h3><p className="text-sm text-gray-500">T.C. {patient.id}</p><p className="text-sm text-gray-500">{patient.age} yaşında, {patient.gender}</p></div></div>
    {patient.allergies?.length > 0 && patient.allergies[0] !== 'Bilinmiyor' && (<div className="mt-4 pt-3 border-t border-gray-100"><p className="text-xs text-red-600 font-semibold">Alerjiler: {patient.allergies.join(', ')}</p></div>)}
  </div>
);

const PatientDetailPage = ({ patient, onBack, onLogout }) => {
    const [activeTab, setActiveTab] = useState('tahliller');
    const [note, setNote] = useState('');
    const renderTabContent = () => { switch(activeTab) { case 'ozet': return <SummaryTab patient={patient} />; case 'bilgiler': return <InfoTab patient={patient} />; case 'tahliller': return <LabResultsTab labResults={patient.labResults} />; case 'notlar': return <DoctorNotesTab notes={patient.doctorNotes} newNote={note} setNewNote={setNote} />; case 'konsultasyon': return <ConsultationTab />; case 'sevk': return <ReferralTab patient={patient} />; default: return null; } }
    return (<div className="bg-gray-100 min-h-screen"><header className="bg-white p-4 flex justify-between items-center sticky top-0 z-20 shadow"><button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Panele Dön</button><div className="flex items-center"><span className="text-gray-700 mr-4">Dr. Ahmet Çelik</span><button onClick={onLogout} className="text-gray-500 hover:text-red-600 transition-colors"><LogOut size={24}/></button></div></header><div className="p-4 md:p-8"><div className="bg-white rounded-xl shadow-md p-6 mb-8 flex flex-col md:flex-row items-start md:items-center"><img src={patient.profileImageUrl} alt={patient.name} className="w-24 h-24 rounded-full mr-6 mb-4 md:mb-0 border-4 border-blue-200" /><div className="flex-grow"><h2 className="text-3xl font-bold text-gray-900">{patient.name}</h2><p className="text-gray-600">T.C. Kimlik No: {patient.id}</p><div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-700"><span><strong>Yaş:</strong> {patient.age}</span><span><strong>Cinsiyet:</strong> {patient.gender}</span><span><strong>Boy:</strong> {patient.height} cm</span><span><strong>Kilo:</strong> {patient.weight} kg</span><span><strong>Kan Grubu:</strong> {patient.bloodType}</span></div></div></div><div className="mb-6"><div className="border-b border-gray-200"><nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs"><TabButton title="Tahliller" icon={<FileText size={18}/>} isActive={activeTab === 'tahliller'} onClick={() => setActiveTab('tahliller')} /><TabButton title="Doktor Notları" icon={<Stethoscope size={18}/>} isActive={activeTab === 'notlar'} onClick={() => setActiveTab('notlar')} /><TabButton title="Özet" icon={<HeartPulse size={18}/>} isActive={activeTab === 'ozet'} onClick={() => setActiveTab('ozet')} /><TabButton title="Hasta Bilgileri" icon={<User size={18}/>} isActive={activeTab === 'bilgiler'} onClick={() => setActiveTab('bilgiler')} /><TabButton title="Konsültasyon" icon={<Users size={18}/>} isActive={activeTab === 'konsultasyon'} onClick={() => setActiveTab('konsultasyon')} /><TabButton title="Sevk" icon={<ArrowRightCircle size={18}/>} isActive={activeTab === 'sevk'} onClick={() => setActiveTab('sevk')} /></nav></div></div><div className="bg-white rounded-xl shadow-md p-6">{renderTabContent()}</div></div></div>);
};
const TabButton = ({ title, icon, isActive, onClick }) => (<button onClick={onClick} className={`${ isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}>{icon && React.cloneElement(icon, { className: 'mr-2' })}{title}</button>);
const SummaryTab = ({ patient }) => (<div><h3 className="text-xl font-bold text-gray-800 mb-4">Kritik Tıbbi Özet</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg"><h4 className="font-bold">Alerjiler</h4><p>{patient.allergies.join(', ') || 'Raporlanmadı'}</p></div><div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg"><h4 className="font-bold">Kronik Hastalıklar</h4><p>{patient.chronicDiseases.join(', ') || 'Raporlanmadı'}</p></div></div></div>);
const InfoTab = ({ patient }) => (<div><h3 className="text-xl font-bold text-gray-800 mb-4">Detaylı Hasta Bilgileri</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><h4 className="flex items-center text-md font-semibold text-gray-700 mb-2"><Dna size={18} className="text-blue-500"/><span className="ml-2">Tıbbi Geçmiş</span></h4><div className="text-sm text-gray-600"><p><strong>Aile Öyküsü:</strong> {patient.familyHistory.join(', ')}</p><p><strong>Geçirilmiş Ameliyatlar:</strong> {patient.surgeries.join(', ') || 'Yok'}</p></div></div><div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><h4 className="flex items-center text-md font-semibold text-gray-700 mb-2"><Syringe size={18} className="text-green-500"/><span className="ml-2">İlaç Kullanımı</span></h4><div className="text-sm text-gray-600"><p><strong>Kullandığı İlaçlar:</strong> {patient.medications.join(', ')}</p></div></div><div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><h4 className="flex items-center text-md font-semibold text-gray-700 mb-2"><Users size={18} className="text-purple-500"/><span className="ml-2">Yaşam Tarzı</span></h4><div className="text-sm text-gray-600"><p><strong>Meslek:</strong> Ofis Çalışanı</p><p><strong>Notlar:</strong> {patient.lifestyle}</p></div></div><div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><h4 className="flex items-center text-md font-semibold text-gray-700 mb-2"><Stethoscope size={18} className="text-indigo-500"/><span className="ml-2">Fizik Muayene</span></h4><div className="text-sm text-gray-600"><p>Akciğer oskültasyonunda ral yok, batın rahat.</p></div></div></div></div>);
const LabResultsTab = ({ labResults }) => (<div><h3 className="text-xl font-bold text-gray-800 mb-4">Tahlil Sonuçları ve Yapay Zekâ Analizi</h3>{labResults.length > 0 ? (labResults.map((test, index) => (<div key={index} className="mb-6 last:mb-0"><div className="bg-gray-50 rounded-t-lg p-3 border-b border-gray-200"><h4 className="font-bold text-gray-700">{test.testName}</h4><p className="text-sm text-gray-500">Tarih: {test.date}</p></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-white rounded-b-lg border border-t-0 border-gray-200"><div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-500"><thead className="text-xs text-gray-700 uppercase bg-gray-100"><tr><th scope="col" className="px-4 py-2">Parametre</th><th scope="col" className="px-4 py-2">Sonuç</th><th scope="col" className="px-4 py-2">Normal Değer</th><th scope="col" className="px-4 py-2">Birim</th></tr></thead><tbody>{test.results.map((res, i) => (<tr key={i} className={`border-b ${res.isAbnormal ? 'bg-red-50' : 'bg-white'}`}><td className="px-4 py-2 font-medium text-gray-900">{res.parameter}</td><td className={`px-4 py-2 font-bold ${res.isAbnormal ? 'text-red-600' : 'text-gray-900'}`}>{res.value}</td><td className="px-4 py-2">{res.normal}</td><td className="px-4 py-2">{res.unit}</td></tr>))}</tbody></table></div><div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex items-center text-blue-700 mb-2"><BrainCircuit size={20} className="mr-2" /><h5 className="font-bold">Yapay Zekâ Analizi</h5></div><p className="text-sm text-blue-800">{test.aiAnalysis}</p></div></div></div>))) : (<p className="text-gray-500">Görüntülenecek tahlil sonucu bulunmamaktadır.</p>)}</div>);
const DoctorNotesTab = ({ notes, newNote, setNewNote }) => (<div><h3 className="text-xl font-bold text-gray-800 mb-4">Doktor Notları</h3><div className="space-y-4 mb-6">{notes.map(note => (<div key={note.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200"><div className="flex justify-between items-center mb-1"><p className="font-semibold text-gray-800">{note.doctor} <span className="text-sm font-normal text-gray-500">- {note.specialty}</span></p><p className="text-xs text-gray-400">{note.date}</p></div><p className="text-gray-600 text-sm">{note.note}</p></div>))}</div><div className="mt-6"><h4 className="font-semibold text-gray-700 mb-2">Yeni Not Ekle</h4><textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows="4" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Yeni notunuzu buraya yazın..."></textarea><button className="mt-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center"><PlusCircle size={18} className="mr-2" />Notu Kaydet</button></div></div>);
const ConsultationTab = () => { const [messages, setMessages] = useState([{id: 1, sender: 'Dr. Zeynep Kaya', specialty: 'Kardiyoloji', time: '14:30', text: 'Ahmet Bey, hastanın EKG\'si normal. Yıllık kontrol önerilir.', isSender: false, avatar: 'https://placehold.co/40x40/93C5FD/1E40AF?text=ZK'},]); const [newMessage, setNewMessage] = useState(''); const handleSendMessage = (e) => { e.preventDefault(); if (newMessage.trim() === '') return; const msg = {id: messages.length + 1, sender: 'Dr. Ahmet Çelik', specialty: 'Siz', time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), text: newMessage, isSender: true, avatar: 'https://placehold.co/40x40/A5B4FC/312E81?text=AÇ'}; setMessages([...messages, msg]); setNewMessage(''); }; return (<div><h3 className="text-xl font-bold text-gray-800 mb-4">Doktorlar Arası Konsültasyon</h3><div className="border border-gray-200 rounded-lg p-4 h-96 flex flex-col"><div className="flex-grow space-y-4 overflow-y-auto pr-2 mb-4">{messages.map(msg => (<div key={msg.id} className={`flex items-start gap-3 ${msg.isSender ? 'flex-row-reverse' : ''}`}><img src={msg.avatar} alt={msg.sender} className="w-10 h-10 rounded-full" /><div className={`flex flex-col max-w-xs md:max-w-md ${msg.isSender ? 'items-end' : 'items-start'}`}><p className="font-semibold text-sm text-gray-800">{msg.sender} <span className="text-xs text-gray-400 font-normal">• {msg.isSender ? msg.time : `${msg.specialty} • ${msg.time}`}</span></p><div className={`p-3 rounded-lg mt-1 text-sm ${msg.isSender ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}><p>{msg.text}</p></div></div></div>))}</div><form onSubmit={handleSendMessage} className="mt-auto flex gap-2 border-t pt-4"><input type="text" placeholder="Mesajınızı yazın..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-grow border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400" /><button type="submit" className="bg-blue-600 text-white rounded-full p-3 flex-shrink-0 hover:bg-blue-700 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button></form></div></div>); };
const ReferralTab = ({ patient }) => { const [selectedClinic, setSelectedClinic] = useState(''); const [referralNote, setReferralNote] = useState(''); const handleReferral = () => { if (!selectedClinic || !referralNote) { alert("Lütfen bir poliklinik seçin ve sevk notu ekleyin."); return; } alert(`Hasta ${patient.name}, ${selectedClinic} polikliniğine başarıyla sevk edildi.`); setSelectedClinic(''); setReferralNote(''); }; return (<div><h3 className="text-xl font-bold text-gray-800 mb-6">Hasta Sevk İşlemleri</h3><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="bg-gray-50 border border-gray-200 rounded-lg p-6"><h4 className="text-lg font-semibold text-gray-800 mb-4">Yeni Sevk Oluştur</h4><div className="mb-4"><label htmlFor="clinic-select" className="block text-sm font-medium text-gray-700 mb-2">Yönlendirilecek Poliklinik</label><select id="clinic-select" value={selectedClinic} onChange={(e) => setSelectedClinic(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">-- Bir poliklinik seçin --</option><option value="Kardiyoloji">Kardiyoloji</option><option value="Nöroloji">Nöroloji</option><option value="Dahiliye">Dahiliye</option></select></div><div className="mb-4"><label htmlFor="referral-note" className="block text-sm font-medium text-gray-700 mb-2">Sevk Notu</label><textarea id="referral-note" rows="5" value={referralNote} onChange={(e) => setReferralNote(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Sevk nedenini buraya yazın..."></textarea></div><button onClick={handleReferral} className="w-full bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"><ArrowRightCircle size={18} className="mr-2" />Hastayı Sevk Et</button></div><div><h4 className="text-lg font-semibold text-gray-800 mb-4">Geçmiş Sevkler</h4>{patient.referrals && patient.referrals.length > 0 ? (<div className="space-y-4">{patient.referrals.map(ref => (<div key={ref.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"><div className="flex justify-between items-center mb-2"><p className="font-bold text-blue-600">Hedef: {ref.toSpecialty}</p><span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-1 rounded-full">{ref.status}</span></div><p className="text-sm text-gray-700 mb-2"><strong>Neden:</strong> {ref.reason}</p><div className="text-xs text-gray-500 flex justify-between border-t pt-2 mt-2"><span>{ref.fromDoctor} ({ref.fromSpecialty})</span><span>{ref.date}</span></div></div>))}</div>) : <p className="text-gray-500 text-center mt-4">Geçmiş sevk bulunmuyor.</p>}</div></div></div>); };

const DashboardApp = ({ onLogout }) => {
    const [page, setPage] = useState('login'); 
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
  
    const filteredPatients = useMemo(() => mockPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm)), [searchTerm]);
  
    const handleLogin = () => setPage('dashboard');
    const viewPatientDetails = (patient) => { setSelectedPatient(patient); setPage('patientDetail'); };
    const backToDashboard = () => { setSelectedPatient(null); setPage('dashboard'); };
  
    switch (page) {
      case 'login': return <LoginPage onLogin={handleLogin} />;
      case 'dashboard': return <DashboardPage patients={filteredPatients} onSelectPatient={viewPatientDetails} onLogout={onLogout} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case 'patientDetail': return <PatientDetailPage patient={selectedPatient} onBack={backToDashboard} onLogout={onLogout} />;
      default: return <LoginPage onLogin={handleLogin} />;
    }
}


// ===================================================================================
// BÖLÜM 3: ANA UYGULAMA BİLEŞENİ
// Bu ana bileşen, Tanıtım Sayfası ve Doktor Paneli arasında geçişi yönetir.
// ===================================================================================

export default function App() {
    // 'landing' -> Tanıtım sayfası
    // 'dashboard' -> Doktor paneli
    const [view, setView] = useState('landing');

    const showDashboard = () => setView('dashboard');
    const showLanding = () => setView('landing');

    if (view === 'landing') {
        return <LandingPage onLoginClick={showDashboard} />;
    }

    return <DashboardApp onLogout={showLanding} />;
}
