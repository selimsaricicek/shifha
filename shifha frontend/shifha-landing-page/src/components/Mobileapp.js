import React from 'react';

export default function Mobileapp() {
  return (
    <section id="mobile" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <img src="https://placehold.co/500x700/E0F2F7/333333?text=Shifha+Mobil+Uygulama" alt="[Shifha mobil uygulamasını gösteren bir telefon görseli]" className="rounded-2xl shadow-2xl mx-auto" />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Kritik Bilgiler Anında Cebinizde</h2>
            <p className="text-gray-600 text-lg mb-8">Shifha mobil uygulaması ile hastalarınızın durumu her an kontrolünüz altında. Laboratuvardan gelen acil bir sonuç veya sistemdeki önemli bir güncelleme, anında bildirim olarak telefonunuza ulaşır.</p>
            <ul className="space-y-4">
              <li className="flex items-start"><div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-4 mt-1">✓</div><span><strong className="text-gray-800">Anlık Bildirimler:</strong> Kritik tahlil sonuçları için anında uyarı alın.</span></li>
              <li className="flex items-start"><div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-4 mt-1">✓</div><span><strong className="text-gray-800">Hasta Takibi:</strong> Nerede olursanız olun, hasta verilerine erişin.</span></li>
              <li className="flex items-start"><div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-4 mt-1">✓</div><span><strong className="text-gray-800">Güvenli Erişim:</strong> Biyometrik ve şifreli giriş ile verileri koruyun.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}