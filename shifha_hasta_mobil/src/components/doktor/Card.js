import React from 'react';

export default function Card({ title, icon, children, className }) {
  return (
    <div className={`bg-white p-5 rounded-2xl shadow-md ${className || ''}`}>
      {title && <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
        {icon}
        {title}
      </h3>}
      {children}
    </div>
  );
} 