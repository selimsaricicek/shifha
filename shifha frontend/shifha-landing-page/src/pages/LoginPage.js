import { Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/Calendar/dashboard');
  };
  return (
    <div className="bg-gradient-to-b from-cyan-50 via-white to-gray-100 min-h-screen flex items-center justify-center font-sans animate-fadeInLogin">
      <style>{`
        @keyframes fadeInLogin {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInLogin { animation: fadeInLogin 0.7s cubic-bezier(.23,1.01,.32,1) both; }
      `}</style>
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 m-4 backdrop-blur-md animate-fadeInLogin">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center text-blue-600 mb-6">
            <Stethoscope size={40} />
            <h1 className="text-4xl font-bold ml-3">Shifha</h1>
          </div>
          <p className="text-gray-600 mb-8 text-center">Yapay Zekâ Destekli Doktor Asistanı</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Kullanıcı Adı / E-posta</label>
            <input className="shadow-sm appearance-none border border-cyan-200 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all duration-200 bg-white placeholder-gray-400" id="username" type="text" placeholder="doktor@ornek.com" defaultValue="dr.ahmet" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Şifre</label>
            <input className="shadow-sm appearance-none border border-cyan-200 rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all duration-200 bg-white placeholder-gray-400" id="password" type="password" placeholder="••••••••••" defaultValue="password" />
          </div>
          <div className="flex items-center justify-between">
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg w-full focus:outline-none focus:shadow-outline transition-colors duration-300 shadow" type="submit">Giriş Yap</button>
          </div>
        </form>
      </div>
    </div>
  );
}