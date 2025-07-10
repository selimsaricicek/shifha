import React from 'react';
import { CheckCircle } from 'lucide-react';

const MobileApp = () => (
    <section id="mobile" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="w-full md:w-1/2">
                    <img src="https://placehold.co/500x700/E0F2F7/333333?text=Shifha+Mobil+Arayüzü" alt="[Shifha mobil uygulamasını gösteren bir telefon görseli]" className="rounded-2xl shadow-2xl mx-auto" />
                </div>
                <div className="w-full md:w-1/2">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Hastalarınızdan Hiç Kopmayın</h2>
                    <p className="text-gray-600 text-lg mb-8">İster vizitte olun, ister evinizde, hastalarınızın kritik verileri her an elinizin altında. Shifha mobil uygulamasıyla önemli bir sonuç geldiğinde anında haberdar olun, içiniz rahat etsin.</p>
                    <ul className="space-y-4">
                        <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" /><span><strong className="text-gray-800">Anlık Bildirimler:</strong> Kritik tahlil sonuçları için anında uyarı alın.</span></li>
                        <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" /><span><strong className="text-gray-800">Her Yerden Erişim:</strong> Nerede olursanız olun, hasta verilerine güvenle ulaşın.</span></li>
                        <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" /><span><strong className="text-gray-800">Güvenli ve Pratik:</strong> Biyometrik ve şifreli giriş ile verileriniz her zaman koruma altında.</span></li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
);

export default MobileApp;