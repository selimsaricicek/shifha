import React from 'react';

const LandingPage = ({ onLogin, onRegister }) => (
  <div className="min-h-screen flex flex-col justify-between items-center relative overflow-hidden">
    {/* Blurred Background */}
    <div className="absolute inset-0 -z-10">
      <img
        src="/arkaplan.jpg"
        alt="Arka Plan"
        className="w-full h-full object-cover blur-md scale-110"
        style={{ filter: 'blur(1px)' }}
      />
    </div>
    <div className="w-full flex-1 flex flex-col justify-center items-center px-6 pt-16">
      <img src="/logo-symbol.png" alt="Shifha Logo" className="h-20 mb-2" />
      <img src="/logo-text.png" alt="Shifha" className="h-10 mb-6" />
      <p className="text-xl text-center text-gray-700 font-semibold mb-1">Sağlıklı bir yaşama</p>
      <p className="text-xl text-center text-gray-700 font-semibold mb-8">Hoşgeldiniz</p>
      <div className="w-full max-w-xs flex flex-col gap-4">
        <button onClick={onLogin} className="w-full py-3 rounded-lg bg-blue-900 text-white font-bold text-lg shadow-md hover:bg-blue-800 transition">Giriş Yap</button>
        <button onClick={onRegister} className="w-full py-3 rounded-lg bg-white text-blue-900 font-bold text-lg border border-blue-900 shadow hover:bg-blue-50 transition">Kayıt Ol</button>
      </div>
    </div>
    <footer className="text-center p-4 text-xs text-gray-400 w-full">&copy; 2024 Shifha. Tüm hakları saklıdır.</footer>
  </div>
);

export default LandingPage; 