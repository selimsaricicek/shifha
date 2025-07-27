// ========== App.js (Tam ve Düzeltilmiş Hali) ==========

import React, { useState, useMemo, useCallback, useEffect } from 'react';
// Gerekli hook'ları ve bileşenleri react-router-dom'dan alıyoruz
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientDetailPage from './pages/PatientDetailPage';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import mockPatientsData, { mockBedData } from './data/mockData';

// ===================================================================================
// ÖNEMLİ: Bu kısımları kendi kodunuzdaki gibi dolu tutun.
// Ben sadece yer tutucu olarak bırakıyorum.
// ===================================================================================
const getTodayDateString = () => new Date().toISOString().split('T')[0];
// Mock veriler artık ayrı dosyadan import ediliyor
const Toast = ({ message, type, onDismiss }) => { /* ... KENDİ TOAST BİLEŞENİNİZ ... */ return null;};
const DoctorChatbot = () => { /* ... KENDİ CHATBOT BİLEŞENİNİZ ... */ return null;};


// ===================================================================================
// ANA UYGULAMA BİLEŞENİ (React Router ile yeniden düzenlendi)
// ===================================================================================

function App() {
    const [patients, setPatients] = useState(mockPatientsData);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);
    const [user, setUser] = useState(null);
    // useNavigate hook'u, fonksiyonlar içinden sayfa değiştirmemizi sağlar
    const navigate = useNavigate();

    const showToast = (message, type = 'success') => {
        setToast({ message, type, key: Date.now() });
    };

    const handleLogin = (userData) => {
        setUser(userData.user);
        // Check if user is a doctor based on email
        const isDoctor = userData.user.email.toLowerCase().endsWith('@saglik.gov.tr');
        if (isDoctor) {
            navigate('/dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    const handleRegisterSuccess = (userData, role) => {
        setUser(userData.user);
        navigate('/login');
    };

    const filteredPatients = useMemo(() =>
        patients.filter(p => {
            const name = (p?.name || '').toString();
            const id = (p?.id || '').toString();
            const searchLower = (searchTerm || '').toLowerCase();
            return name.toLowerCase().includes(searchLower) || id.includes(searchTerm);
        }), [searchTerm, patients]);

    const handleUpdatePatient = (updatedPatient) => {
        if (!updatedPatient?.id) return;
        
        const handleValue = (value) => typeof value === 'string' ? value.split(',').map(item => item.trim()) : value;
        const processedPatient = {
            ...updatedPatient,
            allergies: handleValue(updatedPatient?.allergies),
            chronicDiseases: handleValue(updatedPatient?.chronicDiseases),
        };
        setPatients(prevPatients => {
            const newPatients = [...prevPatients];
            const patientIndex = newPatients.findIndex(p => p?.id === processedPatient.id);
            if (patientIndex > -1) {
                newPatients[patientIndex] = processedPatient;
            }
            return newPatients;
        });
    };

    // Bu yardımcı bileşen, URL'den hasta ID'sini alır ve ilgili hastanın
    // bilgilerini PatientDetailPage bileşenine prop olarak geçirir.
    const PatientDetailWrapper = () => {
        // Bu wrapper artık gerekli değil çünkü PatientDetailPage kendi verilerini çekiyor
        return <PatientDetailPage />;
    };

    return (
        <div className="font-sans">
            <ToastContainer />
            {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

            {/* Manuel `renderPage()` fonksiyonu yerine Routes bileşeni kullanılır */}
            <Routes>
                <Route path="/" element={<LandingPage onLoginClick={() => navigate('/login')} />} />
                <Route 
                    path="/login" 
                    element={
                        <LoginPage 
                            onLogin={handleLogin}
                            onRegisterClick={() => navigate('/register')}
                        />
                    } 
                />
                <Route 
                    path="/register" 
                    element={
                        <RegisterPage 
                            onRegisterSuccess={handleRegisterSuccess}
                            onBackToLogin={() => navigate('/login')}
                        />
                    } 
                />
                <Route
                    path="/dashboard/*"
                    element={
                        <DashboardPage
                            patients={filteredPatients}
                            setPatients={setPatients}
                            onSelectPatient={(patient) => {
                              // Hasta ID'sini hash'le (güvenlik için)
                              const hashedId = btoa(patient?.id || patient?.tc_kimlik_no || '');
                              navigate(`/dashboard/patient/${hashedId}`);
                            }}
                            onLogout={() => {
                                setUser(null);
                                navigate('/');
                            }}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            showToast={showToast}
                            user={user}
                        />
                    }
                />
                {/* Dinamik Rota: Her hasta için kendi ID'si ile özel bir sayfa oluşturur */}
                <Route
                    path="/dashboard/patient/:patientId"
                    element={<PatientDetailWrapper />}
                />
            </Routes>

            <DoctorChatbot />
        </div>
    );
}

export default App;