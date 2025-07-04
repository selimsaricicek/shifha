import React, { useRef, useState } from 'react';

export default function PdfUpload({ onFileSelected }) {
  const inputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      onFileSelected && onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      onFileSelected && onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div>
      <style>{`
        @keyframes pdfFadeIn {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        className="border-2 border-dashed border-blue-400 rounded-2xl p-8 text-center cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 mb-6 shadow-lg animate-[pdfFadeIn_0.7s_ease-out]"
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <input
          type="file"
          accept="application/pdf"
          ref={inputRef}
          className="hidden"
          onChange={handleChange}
        />
        <div className="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 mb-3 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="font-semibold text-blue-700 text-lg">PDF Sürükleyin veya tıklayarak yükleyin</span>
          <span className="text-xs text-gray-500 mb-2">Hasta tahlil veya epikriz dosyasını yükleyin</span>
          {selectedFile && (
            <span className="mt-2 text-sm text-green-700 font-medium">Yüklenen dosya: {selectedFile.name}</span>
          )}
        </div>
      </div>
    </div>
  );
}
