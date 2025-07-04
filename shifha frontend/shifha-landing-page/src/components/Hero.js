import React from 'react';

export default function Hero({
  onLoginClick,
  title = "Tıbbi Kararlarınızda Hız ve Derinlik",
  highlight = "Hız ve Derinlik",
  description = "Doktorlar için geliştirildi. Yapay zeka destekli tahlil analizi, merkezi hasta yönetimi ve anlık mobil bildirimlerle teşhis süreçlerinizi optimize edin.",
  backgroundImage = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop"
}) {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes heroFadeIn {
          0% { opacity: 0; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 animate-[heroFadeIn_1.2s_ease-out]"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-cyan-900/70 to-indigo-900/80"></div>
      <div className="relative z-10 text-center px-4 animate-[heroFadeIn_1.2s_0.2s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
          {title.split(highlight)[0]}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-cyan-300 animate-pulse mx-1">{highlight}</span>
          {title.split(highlight)[1]}
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mb-8">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onLoginClick}
            className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-cyan-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-400/40"
          >
            Panele Giriş Yap
          </button>
          <a
            href="#features"
            className="bg-white bg-opacity-90 text-cyan-700 px-8 py-3 rounded-full text-lg font-semibold hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105 shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-400/40"
          >
            Özellikleri Keşfet
          </a>
        </div>
      </div>
      {/* Dekoratif animasyonlu daireler */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-0 w-40 h-40 bg-cyan-300/20 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-10 right-1/3 w-32 h-32 bg-indigo-300/20 rounded-full blur-2xl animate-pulse" />
    </section>
  );
}