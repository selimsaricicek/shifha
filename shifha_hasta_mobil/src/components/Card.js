import React from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl ${className}`}>
    {children}
  </div>
);

export default Card; 