import React, { useState } from 'react';
import {
    HeartPulse, FileJson, User, Image as ImageIcon, Stethoscope,
    Users, ArrowRightCircle, FileText, Dna, AlertTriangle, CheckCircle,
    Edit, Save, MessageCircle, Send, PlusCircle, Quote, BrainCircuit
} from 'lucide-react';

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

const TodaysCriticalResults = ({ labResults = [] }) => {
    const todaysAbnormalResults = labResults
        .filter(test => test.date === getTodayDateString())
        .flatMap(test => (test.results || []).filter(res => res.isAbnormal));

    if (todaysAbnormalResults.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg animate-fadeIn">
            <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-rose-600 mr-3" />
                <h3 className="text-lg font-bold text-rose-800">Bugünün Önemli Bulguları</h3>
            </div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-rose-700">
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

const TabButton = ({ title, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`${ isActive ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}>
        {icon && React.cloneElement(icon, { className: 'mr-2' })}{title}
    </button>
);

const SummaryTab = ({ patient }) => (
    <div className="animate-fadeIn">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Kritik Tıbbi Özet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-lg">
                <h4 className="font-bold">Alerjiler</h4>
                <p>{(patient.allergies || []).join(', ') || 'Raporlanmadı'}</p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg">
                <h4 className="font-bold">Kronik Hastalıklar</h4>
                <p>{(patient.chronicDiseases || []).join(', ') || 'Raporlanmadı'}</p>
            </div>
        </div>
    </div>
);

const InfoTab = ({ patient, isEditing, onChange, onSave, onToggleEdit }) => {
    const InfoItem = ({ label, value }) => (
        <div className="grid grid-cols-3 gap-4 py-2">
            <dt className="font-medium text-gray-500">{label}</dt>
            <dd className="text-gray-700 col-span-2">{value}</dd>
        </div>
    );
    const EditableInfoItem = ({ label, value, name, type = 'text' }) => (
        <div className="grid grid-cols-3 gap-4 items-center py-1">
            <label htmlFor={name} className="font-medium text-gray-500">{label}</label>
            <input type={type} id={name} name={name} value={value} onChange={(e) => onChange(name, e.target.value)} className="col-span-2 border rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white" />
        </div>
    );
    const allergiesStr = Array.isArray(patient.allergies) ? patient.allergies.join(', ') : '';
    const chronicDiseasesStr = Array.isArray(patient.chronicDiseases) ? patient.chronicDiseases.join(', ') : '';
    
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
                    {isEditing ? <EditableInfoItem label="Ad Soyad" name="name" value={patient.name} /> : <InfoItem label="Ad Soyad" value={patient.name} />}
                    {isEditing ? <EditableInfoItem label="Yaş" name="age" value={patient.age} type="number"/> : <InfoItem label="Yaş" value={patient.age} />}
                    {isEditing ? <EditableInfoItem label="Cinsiyet" name="gender" value={patient.gender} /> : <InfoItem label="Cinsiyet" value={patient.gender} />}
                    {isEditing ? <EditableInfoItem label="Kan Grubu" name="bloodType" value={patient.bloodType} /> : <InfoItem label="Kan Grubu" value={patient.bloodType} />}
                </div>
                <div className="divide-y divide-gray-200">
                    {isEditing ? <EditableInfoItem label="Boy (cm)" name="height" value={patient.height} type="number"/> : <InfoItem label="Boy (cm)" value={patient.height} />}
                    {isEditing ? <EditableInfoItem label="Kilo (kg)" name="weight" value={patient.weight} type="number"/> : <InfoItem label="Kilo (kg)" value={patient.weight} />}
                    <div className="py-1">
                        {isEditing ? <EditableInfoItem label="Alerjiler (virgülle ayırın)" name="allergies" value={allergiesStr} /> : <InfoItem label="Alerjiler" value={allergiesStr || 'Raporlanmadı'} />}
                    </div>
                    <div className="py-1">
                        {isEditing ? <EditableInfoItem label="Kronik Hastalıklar (virgülle ayırın)" name="chronicDiseases" value={chronicDiseasesStr} /> : <InfoItem label="Kronik Hastalıklar" value={chronicDiseasesStr || 'Raporlanmadı'} />}
                    </div>
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
const RadiologyTab = ({ reports = [] }) => ( <div className="animate-fadeIn">...</div> );
const PathologyTab = ({ reports = [] }) => ( <div className="animate-fadeIn">...</div> );
const EpikrizTab = ({ report = "" }) => ( <div className="animate-fadeIn">...</div> );
const DoctorNotesTab = ({ notes, newNote, setNewNote, showToast }) => ( <div className="animate-fadeIn">...</div> );
const ConsultationTab = () => ( <div className="animate-fadeIn">...</div> );


// ===================================================================================
// ANA BİLEŞEN: Tüm parçaları birleştiren ve sayfayı oluşturan kısım
// ===================================================================================

const PatientDetailPage = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const [isEditing, setIsEditing] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [newNote, setNewNote] = useState('');

    // Bu veriler normalde bir üst bileşenden (prop) veya API çağrısından gelir.
    const [patientData, setPatientData] = useState({
        id: '12345678901', name: 'Ayşe Yılmaz', age: 45, gender: 'Kadın', height: 165, weight: 70, bloodType: 'A+',
        allergies: ['Penisilin', 'Aspirin'],
        chronicDiseases: ['Hipertansiyon', 'Tip 2 Diyabet'],
        labResults: [
            { testName: 'Tam Kan Sayımı (Hemogram)', date: getTodayDateString(), results: [ { parameter: 'WBC', value: 11.5, normal: '4.0-10.0', unit: '10^9/L', isAbnormal: true }, { parameter: 'RBC', value: 4.8, normal: '4.2-5.4', unit: '10^12/L' } ], aiAnalysis: 'WBC (lökosit) değerindeki yükseklik, vücutta bir enfeksiyon veya inflamasyon olabileceğine işaret edebilir.' },
            { testName: 'Biyokimya Paneli', date: '2024-05-15', results: [ { parameter: 'Glikoz (Açlık)', value: 135, normal: '70-100', unit: 'mg/dL', isAbnormal: true }], aiAnalysis: 'Açlık kan şekeri ve HbA1c değerlerinin yüksek olması, diyabet kontrolünün gözden geçirilmesi gerektiğini düşündürmektedir.'}
        ],
        // Diğer veriler buraya eklenebilir...
    });

    const handleInfoChange = (field, value) => {
        const updatedValue = (field === 'allergies' || field === 'chronicDiseases') ? value.split(',').map(s => s.trim()) : value;
        setPatientData(prev => ({ ...prev, [field]: updatedValue }));
    };

    const handleSave = () => {
        setIsEditing(false);
        showToast("Hasta bilgileri başarıyla güncellendi.");
        // API kaydetme çağrısı burada yapılabilir.
    };
    
    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'summary': return <SummaryTab patient={patientData} />;
            case 'info': return <InfoTab patient={patientData} isEditing={isEditing} onChange={handleInfoChange} onSave={handleSave} onToggleEdit={() => setIsEditing(!isEditing)} />;
            case 'labs': return <LabResultsTab labResults={patientData.labResults} />;
            // Diğer caseler buraya eklenebilir
            default: return <SummaryTab patient={patientData} />;
        }
    };
    
    return (
        <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{patientData.name}</h1>
                        <p className="text-gray-500">T.C. {patientData.id} - {patientData.age} yaşında, {patientData.gender}</p>
                    </div>
                    <button onClick={() => window.history.back()} className="flex items-center text-cyan-600 font-semibold hover:underline">
                        <ArrowRightCircle size={20} className="mr-2"/> Dashboard'a Geri Dön
                    </button>
                </header>

                <TodaysCriticalResults labResults={patientData.labResults} />

                <div className="border-b border-gray-200 mt-6">
                    <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
                        <TabButton title="Özet" icon={<HeartPulse />} isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
                        <TabButton title="Hasta Bilgileri" icon={<User />} isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                        <TabButton title="Tahliller" icon={<FileJson />} isActive={activeTab === 'labs'} onClick={() => setActiveTab('labs')} />
                        <TabButton title="Radyoloji" icon={<ImageIcon />} isActive={activeTab === 'radiology'} onClick={() => setActiveTab('radiology')} />
                        <TabButton title="Doktor Notları" icon={<FileText />} isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
                        <TabButton title="Konsültasyon" icon={<Users />} isActive={activeTab === 'consultation'} onClick={() => setActiveTab('consultation')} />
                    </nav>
                </div>

                <main className="mt-8 bg-white p-6 rounded-xl shadow-sm">
                    {renderActiveTab()}
                </main>

                {toastMessage && (
                    <div className="fixed bottom-10 right-10 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg flex items-center animate-fadeIn">
                        <CheckCircle className="mr-2" /> {toastMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

// EN ÖNEMLİ KISIM: Oluşturulan ana bileşeni dışa aktararak
// projenin başka yerlerinde kullanılabilir hale getiriyoruz.
export default PatientDetailPage;