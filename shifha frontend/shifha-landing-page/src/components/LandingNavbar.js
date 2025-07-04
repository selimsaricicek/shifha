import React, { useState, useEffect } from 'react';
import { Stethoscope, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// navLinks için varsayılan değerleri doğrudan component içinde tanımlayabiliriz.
const navLinks = [
  { href: '#features', label: 'Özellikler' },
  { href: '#mobile', label: 'Mobil Uygulama' },
  { href: '#howitworks', label: 'Nasıl Çalışır?' },
];

export default function LandingNavbar({ onLoginClick }) {
  const [isOpen, setIsOpen] = useState(false);
  // 1. activeHash state'inin adını daha anlaşılır olması için activeLink yapalım.
  const [activeLink, setActiveLink] = useState('#home'); 
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // 2. Intersection Observer kullanarak kaydırma ile aktif linki belirleme
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Eğer bir bölüm ekrana giriyorsa ve yeterince görünürse
          if (entry.isIntersecting) {
            // O bölümün id'sini alıp # işaretiyle birleştirerek aktif linki güncelliyoruz.
            setActiveLink(`#${entry.target.id}`);
          }
        });
      },
      {
        // Bir bölümün aktif sayılması için ne kadarının görünmesi gerektiğini belirtir.
        // 0.5 = %50'si göründüğünde aktif olur.
        threshold: 0.5,
      }
    );

    // Gözlemlenecek bölümleri seçip gözlemciyi başlatıyoruz.
    navLinks.forEach((link) => {
      const section = document.querySelector(link.href);
      if (section) {
        observer.observe(section);
      }
    });

    // Ana bölümü (#home) de gözlemle
    const homeSection = document.querySelector('#home');
    if (homeSection) observer.observe(homeSection);

    // Component kaldırıldığında gözlemciyi temizle
    return () => observer.disconnect();
  }, []); // Bu useEffect sadece bir kez çalışacak

  // Var olan scroll ve mobil menü kilitleme effect'lerinizi koruyoruz.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);


  const handleLoginClick = () => {
    setIsOpen(false);
    navigate('/login');
  };
  
  // 3. Tıklama fonksiyonunu basitleştiriyoruz. Sadece mobil menüyü kapatsın yeterli.
  // href özelliği sayfanın ilgili bölümüne gitmeyi zaten sağlayacaktır.
  const handleNavClick = () => {
    setIsOpen(false);
  };


  return (
    <nav className={`${scrolled ? 'bg-white/95 shadow-lg' : 'bg-white/80 shadow-md'} backdrop-blur-md fixed top-0 left-0 right-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
             {/* Logo'ya tıklayınca #home bölümüne gider */}
            <a href="#home" onClick={handleNavClick} className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-cyan-600" />
              <span className="text-2xl font-bold text-gray-800">Shifha</span>
            </a>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                   // 4. className kontrolünü activeLink state'ine göre yapıyoruz.
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                    activeLink === link.href
                      ? 'text-cyan-700 bg-cyan-50 font-semibold'
                      : 'text-gray-600 hover:text-cyan-600'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <button onClick={handleLoginClick} className="bg-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-cyan-700 transition-colors duration-300 shadow">
              Doktor Girişi
            </button>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} type="button" className="bg-cyan-600 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-cyan-700 focus:outline-none">
              <span className="sr-only">Menüyü aç</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                  activeLink === link.href
                    ? 'text-cyan-700 bg-cyan-50 font-semibold'
                    : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-700'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pb-3 px-2">
            <button onClick={handleLoginClick} className="w-full text-center bg-cyan-600 text-white block px-4 py-2 rounded-md text-base font-semibold hover:bg-cyan-700 transition-colors duration-300 shadow">
              Doktor Girişi
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}