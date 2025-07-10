// LandingPage.js (güncellenmiş hali - tekrar eden Footer kaldırıldı ve "Panele Giriş Yap" doktor girişi ile aynı yönlendirme)

import React, { useState, useEffect } from 'react';
import LandingNavbar from '../components/LandingNavbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Mobileapp from '../components/Mobileapp';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';
import { Quote } from 'lucide-react';

const TechnologyInServiceOfCare = () => (
    <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                <div className="w-full md:w-1/2">
                    <img 
                        src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1932&auto=format&fit=crop" 
                        alt="[Doktor hastasına tablet üzerinden sonuçları gösteriyor]" 
                        className="rounded-2xl shadow-xl"
                    />
                </div>
                <div className="w-full md:w-1/2">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Teknoloji, Şefkatin Hizmetinde</h2>
                    <p className="text-gray-600 text-lg mb-4">
                        Bizim için teknoloji bir amaç değil, bir araçtır. Shifha'yı geliştirirken amacımız, sizi yoran ve zamanınızı alan idari yükleri ortadan kaldırmaktı.
                    </p>
                    <p className="text-gray-600 text-lg mb-8">
                        Böylece, kazandığınız her dakikayı mesleğinizin özüne, yani hastalarınıza ayırabilirsiniz. Çünkü en iyi tıbbi bakımın, teknoloji ve insan dokunuşunun birleştiği noktada başladığına inanıyoruz.
                    </p>
                    <a href="#testimonial" className="text-cyan-600 font-semibold hover:text-cyan-800 transition-colors">
                        Kullanan doktorlar ne diyor? &rarr;
                    </a>
                </div>
            </div>
        </div>
    </section>
);

const Testimonial = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    const testimonials = [
        {
            id: 1,
            name: "Dr. Elif Aydın",
            specialty: "İç Hastalıkları Uzmanı",
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop",
            quote: "Shifha'dan önce, günümün büyük bir kısmı tahlil sonuçlarını incelemek ve idari işlerle geçiyordu. Şimdi ise yapay zeka desteğiyle verileri hızla analiz edip, kazandığım zamanı hastalarımla daha derin bir iletişim kurmak için kullanıyorum. Bu, mesleğimin en sevdiğim yanını bana geri verdi."
        },
        {
            id: 2,
            name: "Dr. Mehmet Kaya",
            specialty: "Kardiyoloji Uzmanı",
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
            quote: "Kardiyoloji alanında hızlı karar vermek çok kritik. Shifha sayesinde hasta verilerini saniyeler içinde analiz edebiliyorum. Bu, acil durumlarda hayat kurtarıcı olabiliyor. Teknolojinin bu kadar etkili kullanıldığı bir sistem daha önce görmedim."
        },
        {
            id: 3,
            name: "Dr. Zeynep Özkan",
            specialty: "Çocuk Sağlığı ve Hastalıkları Uzmanı",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
            quote: "Çocuk hastalarımın aileleriyle daha fazla zaman geçirebiliyorum. Shifha'nın sağladığı hızlı analiz sayesinde, karmaşık tahlil sonuçlarını anlaşılır bir şekilde ailelere açıklayabiliyorum. Bu, hasta memnuniyetini artırıyor."
        },
        {
            id: 4,
            name: "Dr. Ahmet Demir",
            specialty: "Nöroloji Uzmanı",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
            quote: "Nörolojik hastalıkların teşhisinde detaylı veri analizi çok önemli. Shifha'nın yapay zeka destekli analizi, hastalarımın geçmiş verilerini hızla tarayıp önemli bulguları öne çıkarıyor. Bu, teşhis sürecini hızlandırıyor."
        },
        {
            id: 5,
            name: "Dr. Fatma Şahin",
            specialty: "Onkoloji Uzmanı",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop",
            quote: "Onkoloji alanında hasta takibi çok kritik. Shifha sayesinde hastalarımın tüm verilerini tek bir yerden takip edebiliyorum. Tedavi sürecindeki değişiklikleri anında görebiliyorum. Bu, tedavi başarısını artırıyor."
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
                setIsTransitioning(false);
            }, 300); // Geçiş süresi
        }, 5000); // Her 5 saniyede bir değişir

        return () => clearInterval(interval);
    }, [testimonials.length]);

    const handleDotClick = (index) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setIsTransitioning(false);
        }, 300);
    };

    const currentTestimonial = testimonials[currentIndex];

    return (
        <section id="testimonial" className="py-20 bg-cyan-700 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="relative">
                    <div className={`transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
                        <img 
                            src={currentTestimonial.image} 
                            alt={`${currentTestimonial.name} fotoğrafı`} 
                            className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-4 border-cyan-400"
                        />
                        <Quote className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                        <p className="text-xl md:text-2xl font-light italic mb-6">
                            "{currentTestimonial.quote}"
                        </p>
                        <p className="font-semibold text-lg">{currentTestimonial.name}</p>
                        <p className="text-cyan-200">{currentTestimonial.specialty}</p>
                    </div>
                    
                    {/* Dots indicator */}
                    <div className="flex justify-center mt-8 space-x-2">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default function LandingPage({ onLoginClick }) {
    return (
        <div className="bg-white">
            <LandingNavbar onLoginClick={onLoginClick} />
            <main>
                <Hero onLoginClick={onLoginClick} />
                <Features />
                <TechnologyInServiceOfCare />
                <Testimonial />
                <HowItWorks />
                <Mobileapp />
            </main>
            <Footer />
        </div>
    );
}
