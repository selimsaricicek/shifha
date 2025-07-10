import React from 'react';

const newLogoUrl = '/logo-symbol.png';
const newTextUrl = '/logo-text.png';

export default function LoginPage({ onLogin }) {
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
                <form onSubmit={(e) => {e.preventDefault(); onLogin();}}>
                    <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Kullanıcı Adı / E-posta</label>
                    <input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500" id="username" type="text" placeholder="doktor@ornek.com" defaultValue="dr.ahmet" />
                    </div>
                    <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Şifre</label>
                    <input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-cyan-500" id="password" type="password" placeholder="••••••••••" defaultValue="password" />
                    </div>
                    <div className="flex items-center justify-between"> <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg w-full focus:outline-none focus:shadow-outline transition-colors duration-300" type="submit">Giriş Yap</button></div>
                </form>
            </div>
        </div>
    );
}