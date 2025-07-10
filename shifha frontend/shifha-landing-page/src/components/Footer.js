import React from 'react';

const Footer = () => (
    <footer id="contact" className="bg-gray-800 text-gray-300">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; {new Date().getFullYear()} Shifha. Tüm Hakları Saklıdır.</p>
            <p className="text-sm text-gray-500 mt-2">Bu platformdaki bilgiler yalnızca hekimlerin profesyonel kullanımı içindir ve tıbbi tavsiye niteliği taşımaz.</p>
        </div>
    </footer>
);

export default Footer;