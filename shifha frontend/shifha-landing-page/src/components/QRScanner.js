import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import jsQR from 'jsqr';

const QRScanner = ({ onScanSuccess, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerRef = useRef(null);

  // QR kod tarama başlat
  const startScanning = async () => {
    try {
      setError('');
      setIsScanning(true);

      // Kamera erişimi iste
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // QR kod tarayıcı başlat (jsQR kullanarak)
      startQRDetection();

    } catch (err) {
      console.error('Kamera erişim hatası:', err);
      setError('Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin.');
      setIsScanning(false);
    }
  };

  // QR kod algılama
  const startQRDetection = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const detectQR = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // jsQR kütüphanesi kullanarak QR kod algıla
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          handleQRDetected(code.data);
          return;
        }
      }
      
      if (isScanning) {
        scannerRef.current = requestAnimationFrame(detectQR);
      }
    };

    detectQR();
  };

  // QR kod algılandığında
  const handleQRDetected = (qrData) => {
    try {
      stopScanning();
      
      // QR kod verisini parse et
      const parsedData = JSON.parse(qrData);
      
      // Doktor giriş QR kodu kontrolü
      if (parsedData.type === 'doctor-login') {
        handleDoctorLogin(parsedData);
      } else {
        toast.error('Geçersiz QR kod tipi. Sadece doktor giriş QR kodları desteklenmektedir.');
      }
    } catch (error) {
      console.error('QR kod parse hatası:', error);
      toast.error('QR kod formatı geçersiz.');
    }
  };

  // Doktor giriş işlemi
  const handleDoctorLogin = async (qrData) => {
    try {
      // QR kod süre kontrolü
      const now = new Date();
      const expiresAt = new Date(qrData.expiresAt);
      
      if (now > expiresAt) {
        toast.error('QR kodunun süresi dolmuş. Lütfen yeni bir QR kod oluşturun.');
        return;
      }

      // Backend'e doktor giriş isteği gönder
      const response = await fetch('http://localhost:3001/api/auth/doctor-qr-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qrData: qrData,
          timestamp: now.toISOString()
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Hoş geldiniz, Dr. ${qrData.doctorName}!`);
        if (onScanSuccess) {
          onScanSuccess({
            user: {
              id: qrData.doctorId,
              name: qrData.doctorName,
              email: qrData.doctorEmail,
              role: 'doctor'
            },
            token: result.token
          });
        }
      } else {
        toast.error(result.message || 'Giriş başarısız.');
      }

    } catch (error) {
      console.error('Doktor giriş hatası:', error);
      toast.error('Giriş işlemi sırasında bir hata oluştu.');
    }
  };

  // Manuel QR kod girişi
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleQRDetected(manualInput.trim());
      setManualInput('');
    }
  };

  // Tarama durdur
  const stopScanning = () => {
    setIsScanning(false);
    
    if (scannerRef.current) {
      cancelAnimationFrame(scannerRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Bileşen unmount olduğunda temizlik
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">QR Kod Tarayıcı</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!isScanning && !showManualInput && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              Mobil uygulamadan oluşturduğunuz doktor giriş QR kodunu tarayın.
            </p>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={startScanning}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                📷 Kamera ile Tara
              </button>
              
              <button
                onClick={() => setShowManualInput(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                ⌨️ Manuel Giriş
              </button>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-black rounded-lg"
              />
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
              </div>
            </div>
            
            <p className="text-center text-gray-600">
              QR kodu kamera görüş alanına getirin
            </p>
            
            <button
              onClick={stopScanning}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Taramayı Durdur
            </button>
          </div>
        )}

        {showManualInput && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              QR kod verisini manuel olarak girin:
            </p>
            
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="QR kod verisini buraya yapıştırın..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Giriş Yap
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowManualInput(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Geri
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;