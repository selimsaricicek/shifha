import React, { useState } from 'react';
import { login } from '../api/authService';
import { toast } from 'react-toastify';

const newLogoUrl = '/logo-symbol.png';
const newTextUrl = '/logo-text.png';

export default function LoginPage({ onLogin, onRegisterClick }) {
    const [formData, setFormData] = useState({
        email: 'dr.ahmet@saglik.gov.tr',
        password: 'password'
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

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

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 m-4">
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
        </div>
    );
}