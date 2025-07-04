
import React from 'react';

const features = [
  {
    title: 'Anlık Bildirimler',
    desc: 'Kritik tahlil sonuçları için anında uyarı alın.',
  },
  {
    title: 'Hasta Takibi',
    desc: 'Nerede olursanız olun, hasta verilerine erişin.',
  },
  {
    title: 'Güvenli Erişim',
    desc: 'Biyometrik ve şifreli giriş ile verileri koruyun.',
  },
];

export default function Mobileapp() {
  return (
    <section id="mobile" className="py-20 bg-gradient-to-b from-cyan-50 to-white">
      <style>{`
        @keyframes mobileFadeIn {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative animate-[mobileFadeIn_1s_ease-out]">
              <img src="https://placehold.co/500x700/E0F2F7/333333?text=Shifha+Mobil+Uygulama" alt="[Shifha mobil uygulamasını gösteren bir telefon görseli]" className="rounded-2xl shadow-2xl mx-auto border-4 border-cyan-100" />
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl animate-pulse" />
            </div>
          </div>
          <div className="w-full md:w-1/2 animate-[mobileFadeIn_1s_0.2s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Kritik Bilgiler Anında Cebinizde</h2>
            <p className="text-gray-600 text-lg mb-8">Shifha mobil uygulaması ile hastalarınızın durumu her an kontrolünüz altında. Laboratuvardan gelen acil bir sonuç veya sistemdeki önemli bir güncelleme, anında bildirim olarak telefonunuza ulaşır.</p>
            <ul className="space-y-4">
              {features.map((f, i) => (
                <li key={f.title} className="flex items-start group" style={{ animation: `mobileFadeIn 0.7s cubic-bezier(.23,1.01,.32,1) ${i * 120 + 300}ms both` }}>
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-4 mt-1 shadow-lg group-hover:scale-110 transition-transform duration-300">✓</div>
                  <span><strong className="text-gray-800 group-hover:text-cyan-700 transition-colors duration-300">{f.title}:</strong> <span className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{f.desc}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}