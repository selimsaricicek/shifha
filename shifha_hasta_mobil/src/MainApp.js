import React, { useState } from 'react';
import UnifiedLogin from './components/UnifiedLogin';
import HastaApp from './App';
import DoctorPanel from './components/doktor/DoctorPanel';
import LandingPage from './screens/LandingPage';
import RegisterScreen from './screens/RegisterScreen';
import { AuthProvider } from './context/AuthContext';

export default function MainApp() {
  const [userType, setUserType] = useState(null); // 'doctor' | 'patient'
  const [userValue, setUserValue] = useState(null); // id veya email
  const [error, setError] = useState('');
  const [authScreen, setAuthScreen] = useState('landing'); // 'landing' | 'login' | 'register'

  // Girişte sadece ID veya email ile giriş, şifre kontrolü yok
  const handleLogin = ({ type, value, password }) => {
    if (type === 'doctor') {
      if (/^\d{11}$/.test(value)) {
        setUserType('doctor');
        setUserValue(value);
        setError('');
        setAuthScreen(null); // Direkt panele yönlendir
      } else {
        setError('Geçerli bir doktor ID giriniz!');
      }
    } else if (type === 'patient') {
      if (value.includes('@')) {
        setUserType('patient');
        setUserValue(value);
        setError('');
        setAuthScreen(null); // Direkt panele yönlendir
      } else {
        setError('Geçerli bir email giriniz!');
      }
    }
  };

  const handleRegister = () => {
    setAuthScreen('register');
  };

  const handleLogout = () => {
    setUserType(null);
    setUserValue(null);
    setAuthScreen('landing');
    setError('');
  };

  // Eğer giriş yapıldıysa, direkt paneli göster
  if (userType === 'doctor') {
    return <DoctorPanel onLogout={handleLogout} doctorId={userValue} />;
  }
  if (userType === 'patient') {
    return <HastaApp onLogout={handleLogout} patientEmail={userValue} />;
  }

  // Giriş yapılmadıysa, auth ekranlarını göster
  if (authScreen === 'landing') {
    return <LandingPage onLogin={() => setAuthScreen('login')} onRegister={() => setAuthScreen('register')} />;
  }
  if (authScreen === 'login') {
    return <UnifiedLogin onLogin={handleLogin} onRegister={handleRegister} error={error} />;
  }
  if (authScreen === 'register') {
    return <RegisterScreen onBack={() => setAuthScreen('landing')} onLogin={() => setAuthScreen('login')} />;
  }

  return null;
}

export function AppWithProviders() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
} 