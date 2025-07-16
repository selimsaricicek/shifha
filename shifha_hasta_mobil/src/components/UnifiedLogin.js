import React, { useState } from 'react';

const UnifiedLogin = ({ onLogin, onRegister }) => {
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isEmail = input.includes('@');
  const isId = /^\d{11}$/.test(input);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input) {
      setError('Lütfen ID veya Email giriniz.');
      return;
    }
    // Şifre zorunluluğu kaldırıldı
    if (isId) {
      onLogin({ type: 'doctor', value: input, password });
    } else if (isEmail) {
      onLogin({ type: 'patient', value: input, password });
    } else {
      setError('Geçerli bir ID (11 haneli) veya Email giriniz.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-cyan-200 via-teal-100 to-green-200">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <img src="/logo-symbol.png" alt="Shifha Logo" className="h-16 mb-2" />
        <img src="/logo-text.png" alt="Shifha" className="h-8 mb-6" />
        <h2 className="text-2xl font-bold text-center mb-4 text-cyan-700">Shifha Giriş</h2>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="ID (Doktor) veya Email (Hasta)"
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button type="submit" className="w-full py-3 rounded-lg bg-blue-900 text-white font-bold text-lg shadow-md hover:bg-blue-800 transition">Giriş Yap</button>
        </form>
        <div className="text-center text-xs mt-4">
          {!isId && (
            <>Hesabınız yok mu?{' '}
              <button onClick={onRegister} className="text-cyan-600 font-semibold hover:underline">Kayıt Ol</button>
            </>
          )}
        </div>
      </div>
      <footer className="text-center p-4 text-xs text-gray-400 w-full mt-8">&copy; 2025 Shifha. Tüm hakları saklıdır.</footer>
    </div>
  );
};

export default UnifiedLogin; 