
import React from 'react';
import { Upload, BrainCircuit, BellRing } from 'lucide-react';

const steps = [
  {
    icon: <Upload className="h-10 w-10 text-cyan-600" />, 
    title: '1. Kaydet ve Yükle',
    description: 'Hasta öyküsünü ve tahlil sonuçlarını sisteme kolayca kaydedin.'
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-cyan-600" />, 
    title: '2. Analiz ve Yorumlama',
    description: 'Yapay zeka verileri analiz eder ve size ön rapor sunar.'
  },
  {
    icon: <BellRing className="h-10 w-10 text-cyan-600" />, 
    title: '3. Bildirim ve İş Birliği',
    description: 'Sonuçları değerlendirin ve meslektaşlarınızla fikir alışverişi yapın.'
  },
];


export default function HowItWorks() {
  return (
    <section id="howitworks" className="py-20 bg-gradient-to-b from-gray-50 to-cyan-50">
      <style>{`
        @keyframes stepFadeIn {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Üç Basit Adımda Shifha</h2>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-cyan-200 transform -translate-y-1/2"></div>
          <div className="relative flex flex-col md:flex-row justify-between items-center space-y-12 md:space-y-0 md:space-x-0">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="flex flex-col items-center text-center max-w-xs z-10 group"
                style={{ animation: `stepFadeIn 0.8s cubic-bezier(.23,1.01,.32,1) ${i * 120}ms both` }}
              >
                <div className="bg-white p-6 rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300 border-2 border-cyan-100">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-cyan-700 transition-colors duration-300">{step.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}