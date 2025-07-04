// LandingPage.js (güncellenmiş hali - tekrar eden Footer kaldırıldı ve "Panele Giriş Yap" doktor girişi ile aynı yönlendirme)

import LandingNavbar from '../components/LandingNavbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Mobileapp from '../components/Mobileapp';
import HowItWorks from '../components/HowItWorks';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="bg-gradient-to-b from-cyan-50 via-white to-gray-50 min-h-screen animate-fadeInLanding">
      <style>{`
        @keyframes fadeInLanding {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fadeInLanding { animation: fadeInLanding 0.7s cubic-bezier(.23,1.01,.32,1) both; }
      `}</style>
      <LandingNavbar onLoginClick={handleLoginClick} />
      <main>
        <Hero onLoginClick={handleLoginClick} />
        <Features />
        <Mobileapp />
        <HowItWorks />
      </main>
    </div>
  );
}
