import { Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login as loginApi } from '../api/authService';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.password) {
      setError('E-posta ve şifre zorunludur.');
      return;
    }
    try {
      const res = await loginApi(form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş başarısız.');
    }
  };
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 m-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center text-blue-600 mb-6">
            <Stethoscope size={40} />
            <h1 className="text-4xl font-bold ml-3">Shifha</h1>
          </div>
          <p className="text-gray-600 mb-8 text-center">Yapay Zekâ Destekli Doktor Asistanı</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Kullanıcı Adı / E-posta</label>
            <input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" id="email" name="email" type="text" placeholder="doktor@ornek.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Şifre</label>
            <input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" id="password" name="password" type="password" placeholder="••••••••••" value={form.password} onChange={handleChange} />
          </div>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <div className="flex items-center justify-between">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full focus:outline-none focus:shadow-outline transition-colors duration-300" type="submit">Giriş Yap</button>
          </div>
        </form>
      </div>
    </div>
  );
}
