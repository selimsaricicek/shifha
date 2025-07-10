import React from 'react';

const HowItWorks = () => (
    <section id="howitworks" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Üç Basit Adımda Başlayın</h2>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Shifha'yı iş akışınıza entegre etmek sandığınızdan da kolay.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="flex flex-col items-center">
                    <img src="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=2070&auto=format&fit=crop" alt="[Dizüstü bilgisayara dosya yükleyen bir kişi]" className="w-full h-48 object-cover rounded-xl shadow-lg mb-6"/>
                    <div className="bg-cyan-600 text-white w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold mb-4">1</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Veriyi Yükleyin</h3>
                    <p className="text-gray-600">Hasta tahlil PDF'lerini veya epikrizlerini sisteme sürükleyip bırakın.</p>
                </div>
                <div className="flex flex-col items-center">
                    <img src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2070&auto=format&fit=crop" alt="[Doktor bilgisayarda verileri inceliyor]" className="w-full h-48 object-cover rounded-xl shadow-lg mb-6"/>
                    <div className="bg-cyan-600 text-white w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold mb-4">2</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Ön Bilgiyi Alın</h3>
                    <p className="text-gray-600">Akıllı asistanımız verileri analiz eder ve size bir ön rapor sunar.</p>
                </div>
                <div className="flex flex-col items-center">
                    <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop" alt="[Doktor hastasıyla konuşuyor]" className="w-full h-48 object-cover rounded-xl shadow-lg mb-6"/>
                    <div className="bg-cyan-600 text-white w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold mb-4">3</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Değerlendirin</h3>
                    <p className="text-gray-600">Size kalan zamanda hastanızla ilgilenin ve en doğru kararı verin.</p>
                </div>
            </div>
        </div>
    </section>
);

export default HowItWorks;