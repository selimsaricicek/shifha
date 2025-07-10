import React from 'react';

export default function Hero({ onLoginClick }) {
    return (
        <section id="home" className="relative h-screen flex items-center justify-center">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop')" }}></div>
            <div className="absolute inset-0 bg-gray-900/70"></div>
            <div className="relative z-10 text-center px-4">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                    Uzmanlığınıza Güç Katan <span className="text-cyan-400">Akıllı Asistan</span>
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mb-8">
                    Karmaşık verileri analiz etmekle daha az, hastalarınızla ilgilenmekle daha çok zaman geçirin. Shifha, size en değerli varlığınız olan zamanı geri verir.
                </p>
                <div className="flex justify-center space-x-4">
                    <button onClick={onLoginClick} className="bg-cyan-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Panele Giriş Yap
                    </button>
                    <a href="#features" className="bg-white text-cyan-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Faydaları Keşfet
                    </a>
                </div>
            </div>
        </section>
    );
}