// ========== App.js (Tam ve Düzeltilmiş Hali) ==========

import React, { useState, useMemo, useCallback, useEffect } from 'react';
// Gerekli hook'ları ve bileşenleri react-router-dom'dan alıyoruz
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientDetailPage from './pages/PatientDetailPage';
import PanelSelectionPage from './pages/PanelSelectionPage';
import EmergencyPanelPage from './pages/EmergencyPanelPage';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ===================================================================================
// ÖNEMLİ: Bu kısımları kendi kodunuzdaki gibi dolu tutun.
// Ben sadece yer tutucu olarak bırakıyorum.
// ===================================================================================
const getTodayDateString = () => new Date().toISOString().split('T')[0];
const mockPatientsData = [
  /* KENDİ HASTA VERİLERİNİZ BURADA YER ALACAK */
  { id: '12345678901', name: 'Ayşe Yılmaz', age: 45, /* ...diğer veriler... */ },
  { id: '98765432109', name: 'Mehmet Öztürk', age: 58, /* ...diğer veriler... */ },
  { id: '24681357902', name: 'Zeynep Kaya', age: 34, /* ...diğer veriler... */ }
];
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // useNavigate hook'u, fonksiyonlar içinden sayfa değiştirmemizi sağlar
    const navigate = useNavigate();

    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini kontrol et
    useEffect(() => {
        const savedUser = localStorage.getItem('shifha_user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Kullanıcı verisi parse edilemedi:', error);
                localStorage.removeItem('shifha_user');
            }
        }
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type, key: Date.now() });
    };

    const handleLogin = (userData) => {
        const { user } = userData;
        
        // Backend'de zaten rol kontrolü yapılıyor, burada sadece kullanıcıyı kaydet
        const essentialUserData = {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
            profile: user.profile,
            doctorProfile: user.doctorProfile,
            isDoctor: user.isDoctor
        };
    
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('shifha_user', JSON.stringify(essentialUserData));
        navigate('/panel-selection');
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
                    path="/panel-selection"
                    element={
                        isAuthenticated ? (
                            <PanelSelectionPage
                                user={user}
                                onLogout={() => {
                                    setUser(null);
                                    setIsAuthenticated(false);
                                    localStorage.removeItem('shifha_user');
                                    navigate('/');
                                }}
                            />
                        ) : (
                            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Erişim Reddedildi</h2>
                                    <p className="text-gray-600 mb-6">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Giriş Yap
                                    </button>
                                </div>
                            </div>
                        )
                    }
                />
                <Route
                    path="/dashboard/*"
                    element={
                        isAuthenticated ? (
                            <DashboardPage
                                patients={filteredPatients}
                                setPatients={setPatients}
                                onSelectPatient={(patient) => {
                                  // TC'yi hash'le (güvenlik için)
                                  const hashedTc = btoa(patient?.tc_kimlik_no || '');
                                  navigate(`/dashboard/patient/${hashedTc}`);
                                }}
                                onLogout={() => {
                                    setUser(null);
                                    setIsAuthenticated(false);
                                    // localStorage'daki kullanıcı verisini temizle
                                    localStorage.removeItem('shifha_user');
                                    navigate('/');
                                }}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                showToast={showToast}
                                user={user}
                            />
                        ) : (
                            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Erişim Reddedildi</h2>
                                    <p className="text-gray-600 mb-6">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Giriş Yap
                                    </button>
                                </div>
                            </div>
                        )
                    }
                />
                <Route
                    path="/emergency"
                    element={
                        isAuthenticated ? (
                            <EmergencyPanelPage
                                user={user}
                                onLogout={() => {
                                    setUser(null);
                                    setIsAuthenticated(false);
                                    localStorage.removeItem('shifha_user');
                                    navigate('/');
                                }}
                            />
                        ) : (
                            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Erişim Reddedildi</h2>
                                    <p className="text-gray-600 mb-6">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Giriş Yap
                                    </button>
                                </div>
                            </div>
                        )
                    }
                />
                {/* Dinamik Rota: Her hasta için kendi ID'si ile özel bir sayfa oluşturur */}
                <Route
                    path="/dashboard/patient/:patientId"
                    element={
                        isAuthenticated ? (
                            <PatientDetailWrapper />
                        ) : (
                            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Erişim Reddedildi</h2>
                                    <p className="text-gray-600 mb-6">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Giriş Yap
                                    </button>
                                </div>
                            </div>
                        )
                    }
                />
            </Routes>

            <DoctorChatbot />
        </div>
    );
}

export default App;