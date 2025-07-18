import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
    { href: '#features', label: 'Faydaları' },
    { href: '#testimonial', label: 'Doktor Görüşü' },
    { href: '#howitworks', label: 'Nasıl Çalışır?' },
];
const newLogoUrl = '/logo-symbol.png';
const newTextUrl = '/logo-text.png';

export default function LandingNavbar({ onLoginClick }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-md fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <a href="/" className="flex items-center">
                            <img src={newLogoUrl} alt="Shifha Logosu" className="h-12" />
                            <img src={newTextUrl} alt="Shifha Yazısı" className="h-7 -ml-3" />
                        </a>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navLinks.map((link) => (
                                <a key={link.href} href={link.href} className="text-gray-600 hover:text-cyan-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:block">
                         <button onClick={onLoginClick} className="bg-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-cyan-700 transition-colors duration-300 shadow">
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
                            <a key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300">
                                {link.label}
                            </a>
                        ))}
                    </div>
                     <div className="pb-3 px-2">
                         <button onClick={() => { setIsOpen(false); onLoginClick(); }} className="w-full text-center bg-cyan-600 text-white block px-4 py-2 rounded-md text-base font-semibold hover:bg-cyan-700 transition-colors duration-300 shadow">
                            Doktor Girişi
                         </button>
                    </div>
                </div>
            )}
        </nav>
    );
}