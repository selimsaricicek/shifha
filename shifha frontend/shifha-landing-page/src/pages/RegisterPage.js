import React, { useState } from 'react';
import { register } from '../api/authService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const newLogoUrl = '/logo-symbol.png';
const newTextUrl = '/logo-text.png';

export default function RegisterPage({ onRegisterSuccess, onBackToLogin }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        tcKimlikNo: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Ad soyad gereklidir';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'E-posta gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }

        if (!formData.password) {
            newErrors.password = 'Şifre gereklidir';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Şifre en az 8 karakter olmalıdır';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(formData.password)) {
            newErrors.password = 'Şifre büyük harf, küçük harf, rakam ve özel karakter içermelidir';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        }

        if (!formData.tcKimlikNo.trim()) {
            newErrors.tcKimlikNo = 'TC Kimlik No gereklidir';
        } else if (!/^\d{11}$/.test(formData.tcKimlikNo)) {
            newErrors.tcKimlikNo = 'TC Kimlik No 11 haneli olmalıdır';
        }



        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                tcKimlikNo: formData.tcKimlikNo
            });

            const isDoctor = formData.email.toLowerCase().endsWith('@saglik.gov.tr');
            const role = isDoctor ? 'doctor' : 'patient';
            
            toast.success(`${role === 'doctor' ? 'Doktor' : 'Hasta'} hesabınız başarıyla oluşturuldu!`);
            
            if (onRegisterSuccess) {
                onRegisterSuccess(response.data, role);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Kayıt işlemi başarısız oldu';
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
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const isDoctorEmail = formData.email.toLowerCase().endsWith('@saglik.gov.tr');

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 m-4">
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center mb-6">
                        <img src={newLogoUrl} alt="Shifha Logosu" className="h-20" />
                        <img src={newTextUrl} alt="Shifha Yazısı" className="h-14 -ml-5" />
                    </div>
                    <p className="text-gray-600 mb-8 text-center">Yapay Zekâ Destekli Doktor Asistanı</p>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Hesap Oluştur</h2>
                    <p className="text-gray-600 mb-6 text-center text-sm">
                        {isDoctorEmail ? 'Doktor hesabı oluşturulacak' : 'Hasta hesabı oluşturulacak'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Ad Soyad
                        </label>
                        <input
                            className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                                errors.name ? 'border-red-500' : ''
                            }`}
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Ad Soyad"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

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
                            placeholder="ornek@email.com"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tcKimlikNo">
                            TC Kimlik No
                        </label>
                        <input
                            className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                                errors.tcKimlikNo ? 'border-red-500' : ''
                            }`}
                            id="tcKimlikNo"
                            name="tcKimlikNo"
                            type="text"
                            placeholder="12345678901"
                            maxLength="11"
                            value={formData.tcKimlikNo}
                            onChange={handleInputChange}
                        />
                        {errors.tcKimlikNo && <p className="text-red-500 text-xs mt-1">{errors.tcKimlikNo}</p>}
                    </div>



                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Şifre
                        </label>
                        <input
                            className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                                errors.password ? 'border-red-500' : ''
                            }`}
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        <p className="text-gray-500 text-xs mt-1">
                            En az 8 karakter, büyük harf, küçük harf, rakam ve özel karakter
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                            Şifre Tekrar
                        </label>
                        <input
                            className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                                errors.confirmPassword ? 'border-red-500' : ''
                            }`}
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••••"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <div className="flex flex-col space-y-3">
                        <button
                            className={`bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg w-full focus:outline-none focus:shadow-outline transition-colors duration-300 flex items-center justify-center ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" text="Kayıt oluşturuluyor..." />
                            ) : (
                                'Kayıt Ol'
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={onBackToLogin}
                            className="text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors duration-300"
                        >
                            Zaten hesabınız var mı? Giriş yapın
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}