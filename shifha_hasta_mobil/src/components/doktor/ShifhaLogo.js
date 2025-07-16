import React from 'react';

export default function ShifhaLogo({ className }) {
  return (
    <div className={`flex items-center ${className || ''}`}>
      <img src="/logo-symbol.png" alt="Shifha Logo" className="h-10 mr-2" />
      <img src="/logo-text.png" alt="Shifha" className="h-6" />
    </div>
  );
} 