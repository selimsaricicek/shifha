import React from 'react';

const footerLinks = [
  { label: 'Hakkımızda', href: '#about' },
  { label: 'Gizlilik', href: '#privacy' },
  { label: 'İletişim', href: '#contact' },
];

// Sosyal medya ikonları için örnek (opsiyonel)
const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com/', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.63-.58 1.36-.58 2.14 0 1.48.75 2.78 1.89 3.54-.7-.02-1.36-.21-1.94-.53v.05c0 2.07 1.47 3.8 3.42 4.19-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.11 2.94 3.97 2.97A8.6 8.6 0 0 1 2 19.54c-.34 0-.67-.02-1-.06A12.13 12.13 0 0 0 7.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 24 4.59a8.36 8.36 0 0 1-2.54.7z"/></svg>
    ) },
  // Diğer sosyal medya ikonlarını ekleyebilirsin
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-gradient-to-t from-gray-900 via-cyan-950 to-cyan-900 text-gray-300 border-t border-cyan-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-4">
          {footerLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="relative hover:text-cyan-400 transition-colors duration-300 text-base font-medium px-2"
            >
              {link.label}
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
          ))}
        </div>
        <div className="flex justify-center gap-4 mb-4">
          {socialLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-white transition-colors duration-300 p-2 rounded-full hover:bg-cyan-700/20"
              aria-label={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} <span className="font-semibold text-cyan-400">Shifha</span>. Tüm Hakları Saklıdır.
        </p>
      </div>
    </footer>
  );
}