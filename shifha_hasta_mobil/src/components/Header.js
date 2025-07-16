import React from 'react';

const Header = () => (
  <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 flex items-center sticky top-0 z-20">
    <div className="flex items-center">
      <img src="/logo-symbol.png" alt="Shifha Logo" className="h-8 mr-2" />
      <img src="/logo-text.png" alt="Shifha" className="h-5" />
    </div>
  </header>
);

export default Header; 