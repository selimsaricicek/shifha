import React from 'react';
import { BarChart, Dna, Users, MessageSquare } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-cyan-100 mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Teşhisten Takibe, Tıbbi Zekanın Gücü</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Shifha, iş akışınızı kolaylaştırmak ve hasta bakım kalitesini artırmak için tasarlandı.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard icon={<BarChart className="h-8 w-8 text-cyan-600" />} title="Akıllı Tahlil Analizi" description="Yapay zeka, anormal değerleri saniyeler içinde tespit eder, potansiyel riskler hakkında ön bilgi sunar."/>
          <FeatureCard icon={<Dna className="h-8 w-8 text-cyan-600" />} title="Diyabet Teşhis Desteği" description="Hasta öyküsü ve kan değerlerini birleştirerek diyabet teşhisi için kapsamlı bir yorum sunar."/>
          <FeatureCard icon={<Users className="h-8 w-8 text-cyan-600" />} title="Merkezi Hasta Geçmişi" description="Tüm hasta verileri ve doktor notları, bütünsel bir bakım için tek bir güvenli profilde toplanır."/>
          <FeatureCard icon={<MessageSquare className="h-8 w-8 text-cyan-600" />} title="Doktorlar Arası Konsültasyon" description="Karmaşık vakalar için diğer uzmanlarla güvenli bir şekilde veri paylaşarak fikir alışverişi yapın."/>
        </div>
      </div>
    </section>
  );
}