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
    <div
      className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center cursor-pointer bg-blue-50 hover:bg-blue-100 transition mb-6"
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        <span className="font-medium text-blue-700">PDF Sürükleyin veya tıklayarak yükleyin</span>
        <span className="text-xs text-gray-500">Hasta tahlil veya epikriz dosyasını yükleyin</span>
        {selectedFile && (
          <span className="mt-2 text-sm text-green-700">Yüklenen dosya: {selectedFile.name}</span>
        )}
      </div>
    </div>
  );
}
