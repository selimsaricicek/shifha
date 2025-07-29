import React, { useState } from 'react';
import { login } from '../api/authService';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';
import { io } from 'socket.io-client';
import { useEffect, useRef } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
const newLogoUrl = '/logo-symbol.png';
const newTextUrl = '/logo-text.png';

export default function LoginPage({ onLogin, onRegisterClick }) {
    const [formData, setFormData] = useState({
        email: 'dr.ahmet@saglik.gov.tr',
        password: 'password'
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // QR login state
    const [qrId, setQrId] = useState(null);
    const [qrExpires, setQrExpires] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState('');
    const [qrCountdown, setQrCountdown] = useState(60);
    const socketRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email.trim()) {
            setErrors({ email: 'E-posta gereklidir' });
            return;
        }

        setLoading(true);
        try {
            const response = await login({
                email: formData.email,
                password: formData.password
            });

            toast.success('Giriş başarılı!');
            
            if (onLogin) {
                onLogin(response.data);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Giriş başarısız';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // QR kodu ve WebSocket bağlantısını yönet
    useEffect(() => {
      let timer;
      let ws;

      const fetchQr = async () => {
        try {
          setQrLoading(true);
          const res = await fetch('http://localhost:3001/api/auth/qr-session');
          const data = await res.json();
          setQrId(data.loginAttemptId);
          setQrCountdown(60);
        } catch (error) {
          console.error('QR fetch error:', error);
        } finally {
          setQrLoading(false);
        }
      };

      // İlk QR kodu yükle
      fetchQr();

      // QR kod yenileme timer'ı
      timer = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) {
            fetchQr();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        if (socketRef.current) socketRef.current.disconnect();
      };
    }, []); // onLogin bağımlılığını kaldırdık

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 m-4 flex flex-col md:flex-row gap-8">
                {/* Giriş Formu */}
                <div className="flex-1">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center mb-6">
                            <img src={newLogoUrl} alt="Shifha Logosu" className="h-20" />
                            <img src={newTextUrl} alt="Shifha Yazısı" className="h-14 -ml-5" />
                        </div>
                        <p className="text-gray-600 mb-8 text-center">Yapay Zekâ Destekli Doktor Asistanı</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                E-posta
                            </label>
                            <input 
                                className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                                    errors.email ? 'border-red-500' : ''
                                }`}
                                id="email"
                                name="email"
                                type="email"
                                placeholder="doktor@ornek.com"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Şifre
                            </label>
                            <input 
                                className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                                id="password" 
                                name="password"
                                type="password" 
                                placeholder="••••••••••" 
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="flex flex-col space-y-3">
                            <button 
                                className={`bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg w-full focus:outline-none focus:shadow-outline transition-colors duration-300 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                            </button>
                            
                            <button
                                type="button"
                                onClick={onRegisterClick}
                                className="text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors duration-300"
                            >
                                Hesabınız yok mu? Kayıt olun
                            </button>
                        </div>
                    </form>
                </div>
                {/* QR Kod Kartı */}
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl shadow-inner p-6 min-w-[260px]">
                    <h3 className="text-lg font-bold text-cyan-700 mb-2">QR ile Hızlı Giriş</h3>
                    {qrLoading ? (
                        <LoadingSpinner size="lg" text="QR kod yükleniyor..." />
                    ) : qrError ? (
                        <div className="text-red-500">{qrError}</div>
                    ) : qrId ? (
                        <>
                            <QRCode value={qrId || ''} size={180} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                            <div className="mt-4 text-gray-700 text-center text-sm">Telefonunuzdaki Shifha uygulamasından bu kodu okutun.</div>
                            <div className="mt-2 text-xs text-gray-500">Kalan süre: <span className="font-semibold">{qrCountdown}s</span></div>
                            <button onClick={() => setQrCountdown(1)} className="mt-2 text-cyan-600 text-xs underline">QR Kodunu Yenile</button>
                        </>
                    ) : (
                        <LoadingSpinner size="lg" text="QR kod hazırlanıyor..." />
                    )}
                </div>
            </div>
        </div>
    );
}