// ========== App.js (Tam ve Düzeltilmiş Hali) ==========

import React, { useState, useMemo, useCallback, useEffect } from 'react';
// Gerekli hook'ları ve bileşenleri react-router-dom'dan alıyoruz
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientDetailPage from './pages/PatientDetailPage';
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
    // useNavigate hook'u, fonksiyonlar içinden sayfa değiştirmemizi sağlar
    const navigate = useNavigate();

    const showToast = (message, type = 'success') => {
        setToast({ message, type, key: Date.now() });
    };

    const filteredPatients = useMemo(() =>
        patients.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.includes(searchTerm)
        ), [searchTerm, patients]);

    const handleUpdatePatient = (updatedPatient) => {
        const handleValue = (value) => typeof value === 'string' ? value.split(',').map(item => item.trim()) : value;
        const processedPatient = {
            ...updatedPatient,
            allergies: handleValue(updatedPatient.allergies),
            chronicDiseases: handleValue(updatedPatient.chronicDiseases),
        };
        setPatients(prevPatients => {
            const newPatients = [...prevPatients];
            const patientIndex = newPatients.findIndex(p => p.id === processedPatient.id);
            if (patientIndex > -1) {
                newPatients[patientIndex] = processedPatient;
            }
            return newPatients;
        });
    };

    // Bu yardımcı bileşen, URL'den hasta ID'sini alır ve ilgili hastanın
    // bilgilerini PatientDetailPage bileşenine prop olarak geçirir.
    const PatientDetailWrapper = () => {
        const { patientId } = useParams(); // URL'den /:patientId kısmını alır
        const selectedPatient = patients.find(p => p.id === patientId);

        if (!selectedPatient) {
            return <div>Hasta bulunamadı.</div>;
        }

        return (
            <PatientDetailPage
                patient={selectedPatient}
                onBack={() => navigate('/dashboard')}
                onLogout={() => navigate('/')}
                onUpdatePatient={handleUpdatePatient}
                showToast={showToast}
            />
        );
    };

    return (
        <div className="font-sans">
            {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

            {/* Manuel `renderPage()` fonksiyonu yerine Routes bileşeni kullanılır */}
            <Routes>
                <Route path="/" element={<LandingPage onLoginClick={() => navigate('/login')} />} />
                <Route path="/login" element={<LoginPage onLogin={() => navigate('/dashboard')} />} />
                <Route
                    path="/dashboard"
                    element={
                        <DashboardPage
                            patients={filteredPatients}
                            setPatients={setPatients}
                            onSelectPatient={(patient) => navigate(`/dashboard/patient/${patient.id}`)}
                            onLogout={() => navigate('/')}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            showToast={showToast}
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