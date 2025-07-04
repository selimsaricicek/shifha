import React from 'react';
import { BarChart, Dna, Users, MessageSquare } from 'lucide-react';

const FeatureCard = ({ icon, title, description, delay = 0 }) => (
  <div
    className="bg-gradient-to-br from-cyan-50 via-white to-indigo-50 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer border border-cyan-100"
    style={{ animation: `fadeInUp 0.7s cubic-bezier(.23,1.01,.32,1) ${delay}ms both` }}
  >
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-tr from-cyan-200 via-cyan-100 to-indigo-100 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
      {icon}
    </div>
    <h3 className="text-xl font-extrabold text-cyan-800 mb-2 group-hover:text-indigo-700 transition-colors duration-300 drop-shadow">{title}</h3>
    <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{description}</p>
  </div>
);

const features = [
  {
    icon: <BarChart className="h-8 w-8 text-cyan-600 drop-shadow" />, 
    title: "Akıllı Tahlil Analizi",
    description: "Yapay zeka, anormal değerleri saniyeler içinde tespit eder, potansiyel riskler hakkında ön bilgi sunar."
  },
  {
    icon: <Dna className="h-8 w-8 text-indigo-500 drop-shadow" />, 
    title: "Diyabet Teşhis Desteği",
    description: "Hasta öyküsü ve kan değerlerini birleştirerek diyabet teşhisi için kapsamlı bir yorum sunar."
  },
  {
    icon: <Users className="h-8 w-8 text-cyan-700 drop-shadow" />, 
    title: "Merkezi Hasta Geçmişi",
    description: "Tüm hasta verileri ve doktor notları, bütünsel bir bakım için tek bir güvenli profilde toplanır."
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-indigo-600 drop-shadow" />, 
    title: "Doktorlar Arası Konsültasyon",
    description: "Karmaşık vakalar için diğer uzmanlarla güvenli bir şekilde veri paylaşarak fikir alışverişi yapın."
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-cyan-50 via-white to-indigo-50">
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 via-indigo-600 to-cyan-400 drop-shadow">
            Teşhisten Takibe, Tıbbi Zekanın Gücü
          </h2>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
            Shifha, iş akışınızı kolaylaştırmak ve hasta bakım kalitesini artırmak için tasarlandı.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}