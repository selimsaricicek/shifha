import React from 'react';

const InfoModal = ({ content, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fadeIn">
    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full transform transition-all animate-scaleIn">
      <h3 className="text-lg font-bold text-gray-800 mb-2">Bu Değer Ne Anlama Geliyor?</h3>
      <p className="text-gray-600 text-sm mb-4">{content.description}</p>
      <div className="bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs p-3 rounded-lg">
        <p><strong>Önemli Not:</strong> Bu bilgiler genel amaçlıdır, tıbbi bir tavsiye niteliği taşımaz. Lütfen sonuçlarınızı doktorunuzla birlikte değerlendirin.</p>
      </div>
      <button onClick={onClose} className="mt-6 w-full bg-cyan-600 text-white py-2.5 rounded-lg hover:bg-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Anladım</button>
    </div>
  </div>
);

export default InfoModal; 