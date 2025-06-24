import React from 'react';
import { Upload, BrainCircuit, BellRing } from 'lucide-react';
import './HowItWorks.css';

export default function HowItWorks() {
  return (
    <section id="howitworks" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Üç Basit Adımda Shifha</h2>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
          <div className="relative flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
            <div className="flex flex-col items-center text-center max-w-xs z-10">
              <div className="bg-white p-6 rounded-full shadow-lg mb-4"><Upload className="h-10 w-10 text-cyan-600"/></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">1. Kaydet ve Yükle</h3>
              <p className="text-gray-600">Hasta öyküsünü ve tahlil sonuçlarını sisteme kolayca kaydedin.</p>
            </div>
            <div className="flex flex-col items-center text-center max-w-xs z-10">
              <div className="bg-white p-6 rounded-full shadow-lg mb-4"><BrainCircuit className="h-10 w-10 text-cyan-600"/></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">2. Analiz ve Yorumlama</h3>
              <p className="text-gray-600">Yapay zeka verileri analiz eder ve size ön rapor sunar.</p>
            </div>
            <div className="flex flex-col items-center text-center max-w-xs z-10">
              <div className="bg-white p-6 rounded-full shadow-lg mb-4"><BellRing className="h-10 w-10 text-cyan-600"/></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">3. Bildirim ve İş Birliği</h3>
              <p className="text-gray-600">Sonuçları değerlendirin ve meslektaşlarınızla fikir alışverişi yapın.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}