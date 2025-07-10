import React from 'react';
import { BarChart, Calendar, FileText, Users } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-[0_4px_24px_0_rgba(88,51,255,0.25)] active:shadow-[0_8px_32px_0_rgba(88,51,255,0.35)] hover:-translate-y-1 flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

export default function Features() {
    return (
        <section id="features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">İş Akışınızı Sadeleştirin, Hasta Bakımını İyileştirin</h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">Shifha, rutin görevleri otomatikleştirerek sizin ve hastalarınız için en önemli olana odaklanmanızı sağlar.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard icon={<BarChart className="h-8 w-8 text-cyan-600" />} title="Anlamlı Tahlil Yorumları" description="Karmaşık tahlil verilerini saniyeler içinde anlaşılır ön bilgilere dönüştürün, önemli olanı kaçırmayın."/>
                    <FeatureCard icon={<Calendar className="h-8 w-8 text-cyan-600" />} title="Gününüzü Kolayca Planlayın" description="Randevularınızı ve hasta görevlerinizi tek bir organize akışta görerek gününüze hakim olun."/>
                    <FeatureCard icon={<FileText className="h-8 w-8 text-cyan-600" />} title="Hastanızın Bütünsel Hikayesi" description="Hastanızın tüm tıbbi geçmişine tek bir ekrandan ulaşarak daha isabetli kararlar verin."/>
                    <FeatureCard icon={<Users className="h-8 w-8 text-cyan-600" />} title="Kolay Uzman Görüşü" description="Zorlu vakalarda diğer uzmanlarla güvenli bir şekilde bilgi paylaşın ve kolayca fikir alışverişi yapın."/>
                </div>
            </div>
        </section>
    );
}