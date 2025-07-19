import React, { useState } from 'react';

const LoginPasswordScreen = ({ onBack, onLogin, userLabel, error }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) return onLogin(null, 'Lütfen şifre giriniz.');
    onLogin(password, null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-cyan-200 via-teal-100 to-green-200">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <img src="/logo-symbol.png" alt="Shifha Logo" className="h-16 mb-2" />
        <img src="/logo-text.png" alt="Shifha" className="h-8 mb-6" />
        <h2 className="text-2xl font-bold text-center mb-4 text-cyan-700">Şifre Girin</h2>
        <div className="mb-2 text-gray-700 text-center">{userLabel}</div>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifre"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 pr-10"
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2 top-2 text-gray-400 hover:text-cyan-600">
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="flex gap-2">
            <button type="button" onClick={onBack} className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-700 font-bold text-lg shadow-md hover:bg-gray-300 transition">Geri</button>
            <button type="submit" className="flex-1 py-3 rounded-lg bg-blue-900 text-white font-bold text-lg shadow-md hover:bg-blue-800 transition">Giriş Yap</button>
          </div>
        </form>
      </div>
      <footer className="text-center p-4 text-xs text-gray-400 w-full mt-8">&copy; 2025 Shifha. Tüm hakları saklıdır.</footer>
    </div>
  );
};

export default LoginPasswordScreen; 