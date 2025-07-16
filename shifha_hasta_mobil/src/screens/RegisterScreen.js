import React, { useState } from 'react';

const RegisterScreen = ({ onBack, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birth: '',
    phone: '',
    password: '',
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-gradient-to-b from-cyan-200 via-teal-100 to-green-200 relative">
      <div className="w-full flex-1 flex flex-col justify-center items-center px-6 pt-8">
        <img src="/logo-symbol.png" alt="Shifha Logo" className="h-16 mb-2" />
        <img src="/logo-text.png" alt="Shifha" className="h-8 mb-6" />
        <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-center mb-2 text-cyan-700">Sign Up</h2>
          <div className="text-center text-xs mb-4">Already have an account? <button onClick={onLogin} className="text-cyan-600 font-semibold hover:underline">Login</button></div>
          <form className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className="w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className="w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            </div>
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            <input type="date" name="birth" placeholder="Birth of date" value={form.birth} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            <input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Set Password" value={form.password} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 pr-10" />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2 top-2 text-gray-400 hover:text-cyan-600">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675m1.662-2.662A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.236-.938 4.675m-1.662 2.662A9.956 9.956 0 0112 21c-1.657 0-3.236-.336-4.675-.938m-2.662-1.662A9.956 9.956 0 013 12c0-1.657.336-3.236.938-4.675" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" /></svg>
                )}
              </button>
            </div>
            <button type="submit" className="w-full py-3 rounded-lg bg-blue-900 text-white font-bold text-lg shadow-md hover:bg-blue-800 transition mt-2">Kayıt Ol</button>
          </form>
        </div>
      </div>
      <footer className="text-center p-4 text-xs text-gray-400 w-full">&copy; 2024 Shifha. Tüm hakları saklıdır.</footer>
    </div>
  );
};

export default RegisterScreen; 