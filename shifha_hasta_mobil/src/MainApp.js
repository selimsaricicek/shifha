import React, { useState } from 'react';
import UnifiedLogin from './components/UnifiedLogin';
import HastaApp from './App';
import DoctorPanel from './components/doktor/DoctorPanel';
import LandingPage from './screens/LandingPage';
import RegisterScreen from './screens/RegisterScreen';
import LoginIdScreen from './components/LoginIdScreen';
import LoginPasswordScreen from './components/LoginPasswordScreen';

export default function MainApp() {
  const [userType, setUserType] = useState(null); // 'doctor' | 'patient'
  const [userValue, setUserValue] = useState(null); // id veya email
  const [error, setError] = useState('');
  const [authScreen, setAuthScreen] = useState('landing'); // 'landing' | 'loginId' | 'loginPassword' | 'register'
  const [pendingLogin, setPendingLogin] = useState({ type: null, value: null });

  // Yeni: ID/Email ekranından sonra şifre ekranına geçiş
  const handleIdNext = (input, err) => {
    if (err) {
      setError(err);
      return;
    }
    setError('');
    if (/^\d{11}$/.test(input)) {
      setPendingLogin({ type: 'doctor', value: input });
      setAuthScreen('loginPassword');
    } else if (input.includes('@')) {
      setPendingLogin({ type: 'patient', value: input });
      setAuthScreen('loginPassword');
    } else {
      setError('Geçerli bir ID (11 haneli) veya Email giriniz!');
    }
  };

  // Şifre ekranında giriş
  const handlePasswordLogin = (password, err) => {
    if (err) {
      setError(err);
      return;
    }
    setError('');
    if (pendingLogin.type === 'doctor') {
      setUserType('doctor');
      setUserValue(pendingLogin.value);
      setAuthScreen(null);
    } else if (pendingLogin.type === 'patient') {
      setUserType('patient');
      setUserValue(pendingLogin.value);
      setAuthScreen(null);
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
    setPendingLogin({ type: null, value: null });
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
    return <LandingPage onLogin={() => setAuthScreen('loginId')} onRegister={() => setAuthScreen('register')} />;
  }
  if (authScreen === 'loginId') {
    return <LoginIdScreen onNext={handleIdNext} error={error} />;
  }
  if (authScreen === 'loginPassword') {
    return <LoginPasswordScreen
      onBack={() => { setAuthScreen('loginId'); setError(''); }}
      onLogin={handlePasswordLogin}
      userLabel={pendingLogin.type === 'doctor' ? `Doktor ID: ${pendingLogin.value}` : `Email: ${pendingLogin.value}`}
      error={error}
    />;
  }
  if (authScreen === 'register') {
    return <RegisterScreen onBack={() => setAuthScreen('landing')} onLogin={() => setAuthScreen('loginId')} />;
  }

  return null;
} 