import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, FileUp, Check, X, Pencil, ArrowLeft, User, LogOut } from 'lucide-react';
import ChatBot from '../components/ChatBot';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { uploadPdfAndParsePatient, deletePatient } from '../api/patientService';
import { toast } from 'react-toastify';
import Calendar from '../components/Calendar';
import RoleSelectionPage from './RoleSelectionPage';
import EmergencyPanel from '../components/EmergencyPanel';
import ClinicFlowPanel from '../components/ClinicFlowPanel';
import AddEmergencyPatientModal from '../components/AddEmergencyPatientModal';
import VitalsCard from '../components/VitalsCard';
import DecisionPanel from '../components/DecisionPanel';
import { DischargeModal, HospitalizeModal, ReferralDecisionModal } from '../components/DecisionModals';
import CallRelativesModal from '../components/CallRelativesModal';
import { mockBedData } from '../data/mockData';

// Ana Rota Yapısı
function DashboardPage({ patients, setPatients, onSelectPatient, onLogout, searchTerm, setSearchTerm, showToast, user }) {
    const [currentPage, setCurrentPage] = useState('roleSelection'); // 'roleSelection', 'clinic', 'emergency'
    const [userRole, setUserRole] = useState(null);
    const [savedPatients, setSavedPatients] = useState([]);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [showDecisionModal, setShowDecisionModal] = useState(null);
    const [showCallRelativesModal, setShowCallRelativesModal] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);

    const handleRoleSelect = (role) => {
        setUserRole(role);
        setCurrentPage(role);
        // Kullanıcının seçtiği paneli localStorage'a kaydet
        localStorage.setItem('userRole', role);
    };

    const handleLogout = () => {
        setCurrentPage('roleSelection');
        setUserRole(null);
        if (onLogout) onLogout();
    };

    const handleSavePatient = (patientToSave) => {
        setSavedPatients(prev => {
            const exists = prev.some(p => p.id === patientToSave.id);
            if (exists) return prev;
            return [...prev, patientToSave];
        });
        showToast && showToast('Hasta kaydedildi.');
    };

    const handleRemoveSaved = (patientId) => {
        setSavedPatients(prev => prev.filter(p => p.id !== patientId));
        showToast && showToast('Hasta kaydedilenlerden çıkarıldı.');
    };

    const handleAddEmergencyPatient = (newPatient) => {
        setPatients(prev => [newPatient, ...prev]);
        showToast && showToast('Yeni acil vaka başarıyla eklendi.');
    };

    const handleScanNewPatient = () => {
        // Simüle edilmiş yeni hasta tarama
        const newPatient = {
            id: `QR-${Date.now().toString().slice(-6)}`,
            name: 'Yeni Taranan Hasta',
            age: 35,
            gender: 'Belirtilmemiş',
            profileImageUrl: 'https://avatar.iran.liara.run/public',
            allergies: [],
            chronicDiseases: [],
            appointments: [{
                date: new Date().toLocaleDateString('tr-TR'),
                time: '15:30',
                type: 'Yeni Değerlendirme',
                urgency: 'normal'
            }]
        };
        setPatients(prev => [newPatient, ...prev]);
        showToast && showToast('Yeni hasta QR kodu tarandı ve listeye eklendi.');
    };

    const handleDecisionClick = (decisionType) => {
        setShowDecisionModal(decisionType);
    };

    const handleDecisionConfirm = (decisionData) => {
        if (currentPatient) {
            const updatedPatient = { ...currentPatient };
            if (decisionData.prescription) {
                updatedPatient.prescription = decisionData.prescription;
                updatedPatient.followUp = decisionData.followUp;
                updatedPatient.emergencyCase.status = 'Taburcu Edildi';
            } else if (decisionData.department) {
                updatedPatient.hospitalizedTo = decisionData.department;
                updatedPatient.hospitalizationNotes = decisionData.notes;
                updatedPatient.emergencyCase.status = 'Servise Yatırıldı';
            } else if (decisionData.destination) {
                updatedPatient.referredTo = decisionData.destination;
                updatedPatient.referralReason = decisionData.reason;
                updatedPatient.emergencyCase.status = 'Sevk Edildi';
            }
            setPatients(prev => prev.map(p => p.id === currentPatient.id ? updatedPatient : p));
            showToast && showToast('Hasta durumu güncellendi.');
        }
        setShowDecisionModal(null);
    };

    const handleCallRelatives = (patient) => {
        setCurrentPatient(patient);
        setShowCallRelativesModal(true);
    };

    // Sayfa yüklendiğinde localStorage'dan panel bilgisini al
    useEffect(() => {
        const savedRole = localStorage.getItem('userRole');
        if (savedRole && savedRole !== 'roleSelection') {
            setUserRole(savedRole);
            setCurrentPage(savedRole);
        }
    }, []);

    // Rol seçim sayfası
    if (currentPage === 'roleSelection') {
        return <RoleSelectionPage onSelectRole={handleRoleSelect} onLogout={handleLogout} />;
    }

    // Ana dashboard içeriği
    return (
        <Routes>
            <Route path="/dashboard/*" element={
                <div className="bg-gray-50 min-h-screen">
                    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-30">
                        <div className="flex items-center">
                            <img src="https://i.postimg.cc/Kk7pPcjF/shifha-logo-final.png" alt="Shifha Logosu" className="h-12 mr-2" />
                            <h1 className="text-2xl font-bold text-gray-800">
                                Shifha <span className="text-lg font-normal text-cyan-600">
                                    ({userRole === 'clinic' ? 'Poliklinik' : 'Acil Servis'})
                                </span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCurrentPage('roleSelection')}
                                className="text-gray-600 hover:text-cyan-600 transition-colors"
                            >
                                Panel Değiştir
                            </button>
                            <span className="text-gray-700">Dr. Ahmet Çelik</span>
                            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors">
                                <LogOut size={24} />
                            </button>
                        </div>
                    </header>

                    <main className="p-8">
                        {userRole === 'clinic' ? (
                            <ClinicFlowPanel
                                patients={patients}
                                setPatients={setPatients}
                                onSelectPatient={onSelectPatient}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                showToast={showToast}
                                savedPatients={savedPatients}
                                onSavePatient={handleSavePatient}
                                onRemoveSaved={handleRemoveSaved}
                                onScanNewPatient={handleScanNewPatient}
                            />
                        ) : (
                            <EmergencyPanel
                                patients={patients}
                                onSelectPatient={onSelectPatient}
                                onAddPatientClick={() => setShowEmergencyModal(true)}
                                bedData={mockBedData}
                            />
                        )}
                    </main>

                    <AddEmergencyPatientModal
                        isOpen={showEmergencyModal}
                        onClose={() => setShowEmergencyModal(false)}
                        onAddPatient={handleAddEmergencyPatient}
                    />

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
                        relatives={currentPatient?.relatives || []}
                    />
                </div>
            } />
            <Route path="/dashboard/patient/:tc" element={<PatientDetailPageRemote />} />
            <Route path="*" element={
                <div className="bg-gray-50 min-h-screen">
                    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-30">
                        <div className="flex items-center">
                            <img src="https://i.postimg.cc/Kk7pPcjF/shifha-logo-final.png" alt="Shifha Logosu" className="h-12 mr-2" />
                            <h1 className="text-2xl font-bold text-gray-800">
                                Shifha <span className="text-lg font-normal text-cyan-600">
                                    ({userRole === 'clinic' ? 'Poliklinik' : 'Acil Servis'})
                                </span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCurrentPage('roleSelection')}
                                className="text-gray-600 hover:text-cyan-600 transition-colors"
                            >
                                Panel Değiştir
                            </button>
                            <span className="text-gray-700">Dr. Ahmet Çelik</span>
                            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors">
                                <LogOut size={24} />
                            </button>
                        </div>
                    </header>

                    <main className="p-8">
                        {userRole === 'clinic' ? (
                            <ClinicFlowPanel
                                patients={patients}
                                setPatients={setPatients}
                                onSelectPatient={onSelectPatient}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                showToast={showToast}
                                savedPatients={savedPatients}
                                onSavePatient={handleSavePatient}
                                onRemoveSaved={handleRemoveSaved}
                                onScanNewPatient={handleScanNewPatient}
                            />
                        ) : (
                            <EmergencyPanel
                                patients={patients}
                                onSelectPatient={onSelectPatient}
                                onAddPatientClick={() => setShowEmergencyModal(true)}
                                bedData={mockBedData}
                            />
                        )}
                    </main>

                    <AddEmergencyPatientModal
                        isOpen={showEmergencyModal}
                        onClose={() => setShowEmergencyModal(false)}
                        onAddPatient={handleAddEmergencyPatient}
                    />

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
                        relatives={currentPatient?.relatives || []}
                    />
                </div>
            } />
        </Routes>
    );
}

// PatientDetailPageRemote bileşeni
function PatientDetailPageRemote() {
    const { tc } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (tc) {
            // Hash'lenmiş TC'yi çöz ve PatientDetailPage'e yönlendir
            try {
                const decodedTc = atob(tc);
                navigate(`/dashboard/patient/${decodedTc}`, { replace: true });
            } catch (error) {
                console.error('TC decode hatası:', error);
                navigate('/dashboard');
            }
        }
    }, [tc, navigate]);

    return <div>Yönlendiriliyor...</div>;
}

export default DashboardPage;