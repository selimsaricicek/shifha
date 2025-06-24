import LandingNavbar from '../components/LandingNavbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Mobileapp from '../components/Mobileapp';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';

export default function LandingPage({ onLoginClick }) {
  return (
    <div className="bg-white">
      <LandingNavbar onLoginClick={onLoginClick} />
      <main>
        <Hero onLoginClick={onLoginClick} />
        <Features />
        <Mobileapp />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
